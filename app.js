/* ═══════════════════════════════════════════════════════════════════
   MarketSense — app.js  (version unifiée, une seule définition par fn)
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ── État global ─────────────────────────────────────────────────── */
const APP = {
  tab: 'bourse', data: null, loading: false,
  lastUpdate: null, liveCount: 0,
  history: {}, calendar: [],
  compareMode: false, calendarOpen: false,
  horizon: (() => { try { return JSON.parse(localStorage.getItem('ms_horizon')) || 'all'; } catch { return 'all'; } })(),
  backtest: null,
};

/* ── Config (localStorage) ───────────────────────────────────────── */
const AV_KEY     = 'E85V2XISD5ZDIWRS';
// Données statiques générées toutes les heures par GitHub Actions (branche `data` du dépôt backend)
const BACKEND    = 'https://marketsensor.github.io/marketsensor-backend';

const Config = {
  get theme()         { return localStorage.getItem('ms_theme')           || 'dark'; },
  set theme(v)        { localStorage.setItem('ms_theme', v); },
  get alertEmail()    { return localStorage.getItem('ms_alert_email')     || ''; },
  set alertEmail(v)   { localStorage.setItem('ms_alert_email', v); },
  get compareTab()    { return localStorage.getItem('ms_compare_tab')     || ''; },
  set compareTab(v)   { localStorage.setItem('ms_compare_tab', v); },
  get disabledGroups(){
    try { return JSON.parse(localStorage.getItem('ms_disabled_groups') || '[]'); } catch { return []; }
  },
  set disabledGroups(v){ localStorage.setItem('ms_disabled_groups', JSON.stringify(v)); },
};

/* ── DOM helpers ─────────────────────────────────────────────────── */
const gel  = id  => document.getElementById(id);
const html = (el, h) => { if (el) el.innerHTML = h; };

/* ══════════════════════════════════════════════════════════════════
   API MODULE
   ══════════════════════════════════════════════════════════════════ */
const Api = {
  async get(url, label = '') {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(t);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) { console.warn(`[API] ${label}:`, e.message); return null; }
  },
  async cryptoFearGreed() {
    const d = await this.get('https://api.alternative.me/fng/?limit=1', 'FNG');
    return d?.data?.[0] ? { value: +d.data[0].value, label: d.data[0].value_classification } : null;
  },
  async cgGlobal() {
    const d = await this.get('https://api.coingecko.com/api/v3/global', 'CG Global');
    return d?.data ? { btcDom: d.data.market_cap_percentage.btc } : null;
  },
  async btcPrices(days = 365) {
    const d = await this.get(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      'BTC Prices');
    return d?.prices ? d.prices.map(p => p[1]) : null;
  },
  async blockchainStats() {
    const d = await this.get('https://api.blockchain.info/stats', 'Blockchain');
    return d?.hash_rate ? { hashRate: d.hash_rate } : null;
  },
  async backend(path = '/indicators.json') {
    const base = BACKEND.replace(/\/$/, '');
    if (!base) return null;
    return await this.get(`${base}${path}`, 'Backend');
  },
  _avRead(k)    { try { const i = JSON.parse(localStorage.getItem(`ms_av_${k}`) || 'null'); return (!i || Date.now()-i.ts > 86400000) ? null : i.data; } catch { return null; } },
  _avWrite(k,d) { try { localStorage.setItem(`ms_av_${k}`, JSON.stringify({data:d,ts:Date.now()})); } catch {} },
  async avRSI(symbol) {
    const c = this._avRead(`rsi_${symbol}`);
    if (c !== null) return c;
    if (!AV_KEY) return null;
    const d = await this.get(`https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${AV_KEY}`, `AV RSI ${symbol}`);
    const a = d?.['Technical Analysis: RSI'];
    if (!a) return null;
    const v = parseFloat(Object.values(a)[0].RSI);
    this._avWrite(`rsi_${symbol}`, v); return v;
  },
  async avMACD(symbol) {
    const c = this._avRead(`macd_${symbol}`);
    if (c !== null) return c;
    if (!AV_KEY) return null;
    const d = await this.get(`https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${AV_KEY}`, `AV MACD ${symbol}`);
    const a = d?.['Technical Analysis: MACD'];
    if (!a) return null;
    const l = Object.values(a)[0];
    const v = { macd: parseFloat(l.MACD), signal: parseFloat(l.MACD_Signal) };
    this._avWrite(`macd_${symbol}`, v); return v;
  },
};

/* ── Calculs crypto (client) ─────────────────────────────────────── */
const Calc = {
  rsi(prices, p=14) {
    if (!prices||prices.length<p+1) return null;
    let g=0,l=0;
    for(let i=1;i<=p;i++){const d=prices[i]-prices[i-1];d>0?g+=d:l-=d;}
    let ag=g/p,al=l/p;
    for(let i=p+1;i<prices.length;i++){const d=prices[i]-prices[i-1];ag=(ag*(p-1)+Math.max(0,d))/p;al=(al*(p-1)+Math.max(0,-d))/p;}
    return al===0?100:Math.round(100-100/(1+ag/al));
  },
  ema(prices,p){if(!prices||prices.length<p)return null;const k=2/(p+1);let e=prices.slice(0,p).reduce((a,b)=>a+b,0)/p;for(let i=p;i<prices.length;i++)e=prices[i]*k+e*(1-k);return e;},
  sma(prices,p){if(!prices||prices.length<p)return null;const s=prices.slice(-p);return s.reduce((a,b)=>a+b,0)/s.length;},
  macdSign(prices){const e12=this.ema(prices,12),e26=this.ema(prices,26);return(e12&&e26)?e12-e26:null;},
  norm(v,lo,hi){return Math.min(100,Math.max(0,Math.round((v-lo)/(hi-lo)*100)));},
  rsiSig(v){return v<35?'buy':v>65?'sell':'neutral';},
  fngSig(v){return v<30?'buy':v>70?'sell':'neutral';},
};

/* ══════════════════════════════════════════════════════════════════
   LIVE DATA UPDATER
   ══════════════════════════════════════════════════════════════════ */
function findInd(groups, id) {
  for (const g of groups) { const i = g.indicators.find(x => x.id === id); if (i) return i; }
  return null;
}
function applyPatch(groups, id, patch) {
  const ind = findInd(groups, id);
  if (!ind) return false;
  Object.assign(ind, patch, { source: 'live' });
  return true;
}
async function fetchLiveData(data) {
  let live = 0;

  // Lance toutes les requêtes en parallèle — chacune retourne null si elle échoue
  const results = await Promise.allSettled([
    Api.cryptoFearGreed(),
    Api.cgGlobal(),
    Api.btcPrices(365),
    Api.blockchainStats(),
    Api.backend(),
    Api.avRSI('SPY'),
    Api.avMACD('SPY'),
    Api.avRSI('GLD'),
  ]);

  const [fng, cgGlobal, prices, blockchain, backend, avRsiSpx, avMacdSpx, avRsiGld]
    = results.map(r => r.status === 'fulfilled' ? r.value : null);

  // ── Backend → bourse + crypto + matières ─────────────────────
  try {
    if (backend) {
      for (const [section, groups] of [
        ['bourse', data.bourse], ['crypto', data.crypto], ['matieres', data.matieres]
      ]) {
        for (const [id, vals] of Object.entries(backend[section] || {})) {
          try { if (applyPatch(groups, id, vals)) live++; } catch(_) {}
        }
      }
      for (const c of (backend.carried || [])) {      // valeur conservée (source indisponible à la dernière actualisation)
        const [tab, id] = c.split('.');
        const ind = data[tab] ? findInd(data[tab], id) : null;
        if (ind) ind.carried = true;
      }
      // Analytics séparées — ne pas bloquer les indicateurs principaux
      // Chargées via /api/analytics (endpoint dédié, timeout 90s)
    }
  } catch(e) { console.warn('[fetchLive] backend patch:', e.message); }

  // ── Crypto Fear & Greed ───────────────────────────────────────
  try {
    if (fng) {
      const v = fng.value;
      applyPatch(data.crypto, 'cfg', {
        val: v, raw: String(v), sig: Calc.fngSig(v),
        desc: `Indice à ${v} (${fng.label}) — `
          + (v > 75 ? 'euphorie extrême, risque de correction élevé.'
           : v < 25 ? "peur extrême — opportunité d'achat historique."
           : v > 55 ? 'sentiment optimiste, vigilance conseillée.' : 'sentiment neutre.'),
      }); live++;
    }
  } catch(e) { console.warn('[fetchLive] FNG:', e.message); }

  // ── BTC Dominance ─────────────────────────────────────────────
  try {
    if (cgGlobal) {
      const dom = Math.round(cgGlobal.btcDom * 10) / 10;
      applyPatch(data.crypto, 'btcdom', {
        val: Math.min(100, Math.round(dom)), raw: dom.toFixed(1),
        sig: dom > 58 ? 'sell' : dom < 42 ? 'buy' : 'neutral',
        desc: `Dominance BTC à ${dom.toFixed(1)} % (CoinGecko) — `
          + (dom > 58 ? 'Bitcoin ultra-dominant, altcoins sous pression.'
           : dom < 45 ? 'Potentielle altseason, rotations vers les altcoins.'
           : 'Marché crypto équilibré.'),
      }); live++;
    }
  } catch(e) { console.warn('[fetchLive] BTC dom:', e.message); }

  // ── BTC Prices → RSI, MACD, Pi Cycle ─────────────────────────
  try {
    if (prices && prices.length >= 30) {
      const rsi = Calc.rsi(prices, 14);
      if (rsi !== null) {
        applyPatch(data.crypto, 'btcrsi', {
          val: rsi, raw: String(rsi), sig: Calc.rsiSig(rsi),
          desc: `RSI BTC à ${rsi} (${prices.length}j, CoinGecko) — `
            + (rsi > 70 ? 'suracheté.' : rsi < 30 ? "survendu — opportunité d'achat." : 'zone neutre.'),
        }); live++;
      }
      const macd = Calc.macdSign(prices);
      if (macd !== null) {
        applyPatch(data.crypto, 'btcmacd', {
          val: macd > 0 ? 72 : 28, raw: macd > 0 ? 'Positif' : 'Négatif',
          sig: macd > 0 ? 'buy' : 'sell',
          desc: `MACD BTC ${macd > 0 ? 'positif — tendance haussière.' : 'négatif — tendance baissière.'} (CoinGecko)`,
        }); live++;
      }
      const mm111 = prices.length >= 111 ? Calc.sma(prices, 111) : null;
      const mm350 = prices.length >= 350 ? Calc.sma(prices, 350) : null;
      if (mm111 && mm350) {
        const ratio = mm111 / (2 * mm350);
        applyPatch(data.crypto, 'picycle', {
          raw: `${(ratio * 100).toFixed(0)} %`,
          val: ratio >= 0.96 ? 90 : Math.max(10, Math.round(ratio * 60)),
          sig: ratio >= 0.96 ? 'sell' : 'buy',
          desc: ratio >= 0.96
            ? `Pi Cycle proche du déclenchement (${(ratio*100).toFixed(0)} %).`
            : `Pi Cycle non déclenché (ratio ${(ratio*100).toFixed(0)} %) — loin du sommet.`,
        }); live++;
      }
    }
  } catch(e) { console.warn('[fetchLive] BTC prices:', e.message); }

  // ── Hash Rate ─────────────────────────────────────────────────
  try {
    if (blockchain && blockchain.hashRate) {
      const hr = blockchain.hashRate;
      const hrEH = hr > 1e8 ? hr / 1e9 : hr > 1e5 ? hr / 1e6 : hr;
      const display = `${Math.round(hrEH)} EH/s`;
      applyPatch(data.crypto, 'hashrate', {
        raw: display, val: Math.min(97, Calc.norm(hrEH, 100, 800)),
        sig: hrEH > 400 ? 'buy' : 'neutral',
        desc: `Hash Rate BTC : ${display} (blockchain.info).`,
      }); live++;
    }
  } catch(e) { console.warn('[fetchLive] hashrate:', e.message); }

  // ── Alpha Vantage (cache 24h) ─────────────────────────────────
  try {
    if (findInd(data.bourse, 'rsi_spx')?.source !== 'live' && typeof avRsiSpx === 'number' && !isNaN(avRsiSpx)) {
      const v = Math.round(avRsiSpx);
      applyPatch(data.bourse, 'rsi_spx', { val: v, raw: String(v), sig: Calc.rsiSig(avRsiSpx),
        desc: `RSI S&P 500 (SPY) à ${v} — Alpha Vantage, cache 24h.` }); live++;
    }
    if (findInd(data.bourse, 'macd_spx')?.source !== 'live' && avMacdSpx) {
      const bull = avMacdSpx.macd > avMacdSpx.signal;
      applyPatch(data.bourse, 'macd_spx', { sig: bull ? 'buy' : 'sell', val: bull ? 70 : 30,
        raw: bull ? 'Positif' : 'Négatif',
        desc: `MACD SPY ${bull ? 'haussier' : 'baissier'} — Alpha Vantage, cache 24h.` }); live++;
    }
    if (findInd(data.matieres, 'goldrsi')?.source !== 'live' && typeof avRsiGld === 'number' && !isNaN(avRsiGld)) {
      const v = Math.round(avRsiGld);
      applyPatch(data.matieres, 'goldrsi', { val: v, raw: String(v), sig: Calc.rsiSig(avRsiGld),
        desc: `RSI Or (GLD ETF) à ${v} — Alpha Vantage, cache 24h.` }); live++;
    }
  } catch(e) { console.warn('[fetchLive] AV:', e.message); }

  APP.liveCount = live;
  return data;
}



/* ══════════════════════════════════════════════════════════════════
   RECOMMANDATION + CONSTANTES UI
   ══════════════════════════════════════════════════════════════════ */
function isGroupDisabled(tab, groupName) {
  return Config.disabledGroups.includes(`${tab}::${groupName}`);
}
function toggleGroupDisabled(tab, groupName) {
  const key = `${tab}::${groupName}`;
  const dis = Config.disabledGroups;
  const idx = dis.indexOf(key);
  if (idx >= 0) dis.splice(idx, 1); else dis.push(key);
  Config.disabledGroups = dis;
  renderContent();
}

function computeReco(groups, tab, horizon) {
  const activeTab = tab || APP.tab;
  const hz = horizon || APP.horizon || 'all';
  const skipH = i => hz !== 'all' && i.h !== hz;
  let b=0, s=0, n=0, t=0, excluded=0, totalLive=0, aligned=0;
  groups.forEach(g => {
    const disabled = isGroupDisabled(activeTab, g.name);
    g.indicators.forEach(i => {
      if (i.source !== 'live' || disabled) { excluded++; return; }
      if (skipH(i)) return;
      totalLive++;
      t += i.w;
      if (i.sig==='buy')       { b += i.w; }
      else if (i.sig==='sell') { s += i.w; }
      else                     { n += i.w; }
    });
  });
  const bp  = t ? Math.round(b/t*100) : 0;
  const sp  = t ? Math.round(s/t*100) : 0;
  const sig = bp>=45 ? 'buy' : sp>=35 ? 'sell' : 'neutral';

  // Nombre d'indicateurs alignés avec le signal dominant
  groups.forEach(g => {
    if (isGroupDisabled(activeTab, g.name)) return;
    g.indicators.forEach(i => {
      if (i.source !== 'live' || skipH(i)) return;
      if (i.sig === sig) aligned++;
    });
  });

  // Score de confiance 0-100
  const confidence = totalLive > 0 ? Math.round(aligned / totalLive * 100) : 0;
  const confLabel  = confidence >= 75 ? 'Fort' : confidence >= 50 ? 'Modéré' : 'Faible';
  const confColor  = confidence >= 75 ? 'var(--green)' : confidence >= 50 ? 'var(--amber)' : 'var(--red)';

  return { sig, bp, sp, np:100-bp-sp, excluded, totalLive, aligned, confidence, confLabel, confColor };
}

const TABS = [
  { id:'bourse',   label:'Bourse',            icon:'📈' },
  { id:'crypto',   label:'Crypto',             icon:'₿'  },
  { id:'matieres', label:'Matières premières', icon:'🥇' },
];
const SIG  = { buy:'Achat', sell:'Vente', neutral:'Neutre' };
const RECO = {
  buy:     { arrow:'↑', label:'Acheter',  sub:'Signaux majoritairement haussiers' },
  sell:    { arrow:'↓', label:'Vendre',   sub:'Signaux de distribution détectés'  },
  neutral: { arrow:'—', label:'Attendre', sub:'Signaux mixtes, direction incertaine' },
};
const RECO_DESC = {
  buy:  { bourse:'Les indicateurs techniques et de valorisation sont alignés à la hausse. Moment favorable pour renforcer des positions.', crypto:'Métriques on-chain, cycle et technique pointent vers la hausse. Environnement favorable à l\'accumulation.', matieres:'Macro favorable, dollar faible, demande en hausse. Excellent profil risque/rendement sur les matières premières.' },
  sell: { bourse:'Valorisation excessive et surchauffe détectées. Prendre des bénéfices et réduire l\'exposition.', crypto:'Indicateurs de cycle en zone de distribution. Sécuriser des profits.', matieres:'Pression du dollar, ralentissement demande — réduire les positions.' },
  neutral: { bourse:'Signaux partagés — patience avant de renforcer.', crypto:'Indicateurs divergents — attendre une confirmation directionnelle.', matieres:'Contexte incertain — attendre de meilleures conditions d\'entrée.' },
};

/* ══════════════════════════════════════════════════════════════════
   RENDU — SPARKLINE HISTORIQUE
   ══════════════════════════════════════════════════════════════════ */
function renderHistorySparkline(tab) {
  const pts = (APP.history[tab] || []).slice(-30);
  if (pts.length === 0) return '<div class="sparkline-empty">Historique en cours de constitution…</div>';
  if (pts.length === 1) {
    const col = pts[0].sig==='buy'?'var(--green)':pts[0].sig==='sell'?'var(--red)':'var(--amber)';
    return `<div class="sparkline-wrap"><span class="sparkline-label">1pt</span><svg width="160" height="28"><circle cx="80" cy="14" r="4" fill="${col}"/></svg></div>`;
  }
  const W=160,H=28,pad=3;
  const vals = pts.map(p=>p.bp);
  const mn=Math.min(...vals), mx=Math.max(...vals,mn+1);
  const x=i=>pad+(i/(pts.length-1))*(W-2*pad);
  const y=v=>H-pad-((v-mn)/(mx-mn))*(H-2*pad);
  const d=vals.map((v,i)=>`${i===0?'M':'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last=pts[pts.length-1];
  const col=last.sig==='buy'?'var(--green)':last.sig==='sell'?'var(--red)':'var(--amber)';
  return `<div class="sparkline-wrap" title="Évolution Achat% (${pts.length} points)">
    <span class="sparkline-label">${pts.length}pts</span>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
      <path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
      <circle cx="${x(vals.length-1).toFixed(1)}" cy="${y(vals[vals.length-1]).toFixed(1)}" r="3" fill="${col}"/>
    </svg>
  </div>`;
}

/* ── Reco card ───────────────────────────────────────────────────── */
function renderReco(groups) {
  const r=computeReco(groups), R=RECO[r.sig];
  const live =groups.flatMap(g=>g.indicators).filter(i=>i.source==='live').length;
  const spark=renderHistorySparkline(APP.tab);

  // Divergences détectées pour cet onglet
  const divs = (APP.analytics?.divergences||[]).filter(d => {
    if (APP.tab==='crypto') return ['Bitcoin','Ethereum','Solana'].includes(d.asset);
    if (APP.tab==='bourse') return ['S&P 500'].includes(d.asset);
    if (APP.tab==='matieres') return ['Or','Pétrole WTI','Cuivre'].includes(d.asset);
    return false;
  });
  const divBanner = divs.length > 0 ? `
    <div class="div-banner">
      <span class="div-banner-icon">⚡</span>
      <div>
        <strong>${divs.length} divergence${divs.length>1?'s':''} détectée${divs.length>1?'s':''}</strong>
        ${divs.map(d=>`<div class="div-item div-${d.type}">${d.desc}</div>`).join('')}
      </div>
    </div>` : '';

  const hzBar = renderHorizonBar(groups, APP.tab);
  const why   = renderWhy(groups, APP.tab, r);
  html(gel('reco'), `
    ${divBanner}
    ${hzBar}
    <div class="reco-card reco-${r.sig}">
      <div class="reco-left">
        <div class="reco-label">Recommandation globale</div>
        <div class="reco-signal">${R.arrow} ${R.label}</div>
        <div class="reco-sub">${R.sub}</div>
        <div class="conf-badge" style="border-color:${r.confColor}">
          <span style="color:${r.confColor}">●</span>
          Signal <strong style="color:${r.confColor}">${r.confLabel}</strong>
          — ${r.aligned}/${r.totalLive} indicateurs alignés
        </div>
        ${spark}
      </div>
      <div class="reco-mid">
        ${[['Achat',r.bp,'buy'],['Vente',r.sp,'sell'],['Neutre',r.np,'neutral']].map(([l,p,c])=>
          `<div class="reco-row"><span class="reco-rl">${l}</span>
           <div class="reco-track"><div class="reco-fill ${c}" style="width:${p}%"></div></div>
           <span class="reco-pct">${p} %</span></div>`).join('')}
        <div class="reco-live-count">${live} live${r.excluded?` · ${r.excluded} sim. exclus`:''}</div>
      </div>
      <div class="reco-right"><p>${RECO_DESC[r.sig][APP.tab]}</p></div>
    </div>
    ${why}`);
}

/* ── Indicateur card ─────────────────────────────────────────────── */
function renderIndicator(ind) {
  const dots=[1,2,3].map(i=>`<span class="wd ${i<=ind.w?'on':'off'}"></span>`).join('');
  const clickAttr=`onclick="openTooltip('${ind.id}')" style="cursor:pointer"`;
  if (ind.source !== 'live') {
    return `<div class="ind ind-sim" ${clickAttr}>
      <div class="ind-top">
        <div class="ind-name-wrap"><span class="ind-name">${ind.name}</span><span class="tag-sim">Non actualisé</span></div>
        <div style="display:flex;align-items:center;gap:6px">${starBtn(ind.id)}<span class="badge badge-${ind.sig}" style="opacity:.4">${SIG[ind.sig]}</span></div>
      </div>
      <div class="sim-warning">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Donnée figée — exclue de la recommandation.
      </div>
      <div class="meter"><div class="meter-fill ${ind.sig}" style="width:${ind.val}%;opacity:.3"></div></div>
      <div class="ind-foot" style="opacity:.4"><div class="weight">${dots}<span class="weight-label">Importance</span></div><span class="ind-val">${ind.raw}${ind.unit}</span></div>
    </div>`;
  }
  return `<div class="ind ind-clickable" ${clickAttr}>
    <div class="ind-top">
      <div class="ind-name-wrap"><span class="ind-name">${ind.name}</span><span class="tag-live">Live</span>${ageTag(ind)}${btTag(ind.id)}</div>
      <div style="display:flex;align-items:center;gap:6px">
        ${starBtn(ind.id)}<span class="badge badge-${ind.sig}">${SIG[ind.sig]}</span>
        <span class="ind-detail-hint">⋯</span>
      </div>
    </div>
    <div class="ind-desc">${ind.desc}</div>
    <div class="meter"><div class="meter-fill ${ind.sig}" style="width:${ind.val}%"></div></div>
    <div class="ind-foot"><div class="weight">${dots}<span class="weight-label">Importance</span></div><span class="ind-val">${ind.raw}${ind.unit}</span></div>
  </div>`;
}

/* ── Barre de comparaison ────────────────────────────────────────── */
function renderCompareSelector() {
  const others = TABS.filter(t => t.id !== APP.tab);
  return `<div class="compare-bar">
    <span style="font-size:12px;color:var(--text-2)">Comparer :</span>
    ${others.map(t=>`<button class="compare-btn ${Config.compareTab===t.id&&APP.compareMode?'active':''}" onclick="enterCompare('${t.id}')">${t.icon} ${t.label}</button>`).join('')}
    ${APP.compareMode?'<button class="compare-btn" onclick="exitCompare()">✕ Quitter</button>':''}
  </div>`;
}

/* ── Groupes ─────────────────────────────────────────────────────── */
function renderGroups(tabId, data) {
  return data.map(g => {
    const disabled  = isGroupDisabled(tabId, g.name);
    const collapsed = isCollapsed(tabId, g.name);
    const safeName  = g.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<div class="section ${disabled?'section-disabled':''} ${collapsed?'section-collapsed':''}">
      <div class="section-title" onclick="toggleCollapse('${tabId}','${safeName}')" role="button" tabindex="0" aria-expanded="${!collapsed}">
        <span class="chev">${collapsed?'▸':'▾'}</span>
        <span class="section-name">${g.name}</span>
        ${groupSummary(g)}
        <button class="group-toggle" onclick="event.stopPropagation();toggleGroupDisabled('${tabId}','${safeName}')" title="${disabled?'Réactiver':'Désactiver du calcul'}">${disabled?'⊕':'⊖'}</button>
      </div>
      ${collapsed ? '' : `<div class="indicators">${g.indicators.map(renderIndicator).join('')}</div>`}
    </div>`;
  }).join('');
}

/* ── renderContent principal ─────────────────────────────────────── */
function renderContent() {
  try {
    renderTabs();
    const groups = APP.data ? APP.data[APP.tab] : null;
    if (!groups) return;
    renderReco(groups);
    const bar = renderCompareSelector();
    if (APP.compareMode && Config.compareTab && Config.compareTab !== APP.tab) {
      const cGroups = APP.data[Config.compareTab];
      const cTab    = TABS.find(t=>t.id===Config.compareTab);
      const mTab    = TABS.find(t=>t.id===APP.tab);
      html(gel('content'), bar + `<div class="compare-grid">
        <div class="compare-col"><div class="compare-col-title">${mTab?.icon} ${mTab?.label}</div>${renderGroups(APP.tab, groups)}</div>
        <div class="compare-col"><div class="compare-col-title">${cTab?.icon} ${cTab?.label}</div>${renderGroups(Config.compareTab, cGroups)}</div>
      </div>`);
    } else {
      html(gel('content'), renderWatchPanel() + bar + renderGroups(APP.tab, groups));
    }
  } catch(e) {
    console.error('[renderContent]', e);
    // Fallback minimal sans risque d'erreur récursive
    try {
      const groups = APP.data?.[APP.tab] || [];
      html(gel('content'), groups.map(g=>
        `<div class="section"><div class="section-title">${g.name}</div>
         <div class="indicators">${g.indicators.map(i=>`<div class="ind">
           <div class="ind-top"><span class="ind-name">${i.name}</span><span class="badge badge-${i.sig}">${SIG[i.sig]}</span></div>
           <div class="ind-desc">${i.desc}</div></div>`).join('')}</div></div>`).join(''));
    } catch(_) {}
  }
}

function renderTabs() {
  html(gel('tabs'), TABS.map(t=>
    `<button class="tab ${t.id===APP.tab?'active':''}" onclick="switchTab('${t.id}')">
      <span class="tab-icon">${t.icon}</span>${t.label}</button>`).join(''));
}

function setStatus(type, text) {
  const dot=gel('status-dot'), txt=gel('status-text');
  if(dot) dot.className=`status-dot ${type}`;
  if(txt) txt.textContent=text;
}

/* ══════════════════════════════════════════════════════════════════
   CALENDRIER MACRO
   ══════════════════════════════════════════════════════════════════ */
APP.analytics  = null;
APP.analyticsPanelOpen = false;

async function loadAnalytics(data) {
  if (!data?.analytics) return;
  APP.analytics = data.analytics;
}

async function fetchAnalytics() {
  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(`${BACKEND}/analytics.json`, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    const d = await r.json();
    if (r.status === 202) return { _computing: true, store_size: d.store_size || 0 };
    if (!r.ok)            return { _error: true, msg: d.error || r.status };
    // Vérifier que la réponse contient bien des analytics (pas juste un wrapper)
    if (d.analytics)  return d.analytics;   // cas imbriqué { analytics: {...} }
    if (d.correlations !== undefined) return d;  // cas plat
    return { _computing: true, store_size: 0 }; // réponse inattendue
  } catch(e) { console.warn('[analytics]', e.message); return { _computing: true, store_size: 0 }; }
}

/* ── Panel Analytics ─────────────────────────────────────────────── */
function toggleAnalytics() {
  APP.analyticsPanelOpen = !APP.analyticsPanelOpen;
  const panel = gel('analytics-panel');
  if (!panel) return;
  if (APP.analyticsPanelOpen) {
    renderAnalyticsPanel();
    panel.classList.add('open');
    if (!APP.analytics) _startAnalyticsPolling();
  } else {
    panel.classList.remove('open');
  }
}

function _startAnalyticsPolling(attempt = 1, maxAttempts = 30) {
  fetchAnalytics().then(data => {
    if (!APP.analyticsPanelOpen) return;

    // Données reçues et valides
    if (data && !data._computing && !data._error) {
      APP.analytics = data;
      renderAnalyticsPanel();
      return;
    }

    // Mettre à jour le message de progression
    const msg = document.querySelector('#analytics-panel .analytics-retry-msg');
    if (msg) {
      const store = data?._computing ? ` — ${data.store_size} actif(s) chargé(s)` : '';
      const err   = data?._error ? ` [${data.msg}]` : '';
      msg.textContent = `Calcul en cours${store}${err} — tentative ${attempt}/${maxAttempts}`;
    }

    // Retry avec délai progressif (15s → 20s → 30s)
    const delay = attempt < 5 ? 15000 : attempt < 10 ? 20000 : 30000;
    if (attempt < maxAttempts) {
      setTimeout(() => _startAnalyticsPolling(attempt + 1, maxAttempts), delay);
    }
  });
}

function renderAnalyticsPanel() {
  const panel = gel('analytics-panel');
  if (!panel) return;

  if (!APP.analytics) {
    panel.innerHTML = `
      <div class="cal-header">
        <span class="cal-title">📊 Analyse avancée</span>
        <button class="icon-btn" onclick="toggleAnalytics()">✕</button>
      </div>
      <div style="padding:40px 24px;text-align:center">
        <div style="font-size:32px;margin-bottom:16px;animation:spin 2s linear infinite;display:inline-block">⏳</div>
        <div style="font-size:14px;font-weight:500;color:var(--text-1);margin-bottom:8px">Calcul en cours…</div>
        <div class="analytics-retry-msg" style="font-size:12px;color:var(--text-3);margin-bottom:8px;line-height:1.6">
          Le backend calcule les corrélations et backtesting depuis les données déjà téléchargées.
        </div>
        <div style="font-size:11px;color:var(--text-3);margin-bottom:24px">Retry automatique toutes les 10s</div>
        <button class="btn-primary" onclick="_startAnalyticsPolling()">⟳ Forcer le rechargement</button>
      </div>`;
    return;
  }

  const { correlations, divergences, backtest } = APP.analytics;

  // ── Score de confiance global ───────────────────────────────────
  const confScores = ['bourse','crypto','matieres'].map(tab => {
    const r = computeReco(APP.data[tab], tab);
    return `<div class="conf-card conf-${r.sig}">
      <div class="conf-tab">${TABS.find(t=>t.id===tab)?.icon} ${TABS.find(t=>t.id===tab)?.label}</div>
      <div class="conf-signal" style="color:${r.confColor}">${RECO[r.sig].arrow} ${RECO[r.sig].label}</div>
      <div class="conf-score">
        <div class="conf-bar-track"><div class="conf-bar-fill" style="width:${r.confidence}%;background:${r.confColor}"></div></div>
        <span style="color:${r.confColor};font-weight:600">${r.confLabel}</span>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:4px">${r.aligned}/${r.totalLive} indicateurs alignés</div>
    </div>`;
  }).join('');

  // ── Divergences ─────────────────────────────────────────────────
  const divHtml = divergences.length > 0
    ? divergences.map(d => `
        <div class="div-row div-${d.type}">
          <span class="div-icon">${d.type==='bullish'?'↑':'↓'}</span>
          <div>
            <strong>${d.asset}</strong>
            <div style="font-size:12px;color:var(--text-2);margin-top:2px">${d.desc}</div>
          </div>
          <span class="badge badge-${d.sig}" style="flex-shrink:0">${d.type==='bullish'?'Achat potentiel':'Vente potentielle'}</span>
        </div>`).join('')
    : '<div style="padding:16px;color:var(--text-3);text-align:center;font-size:13px">Aucune divergence détectée actuellement.</div>';

  // ── Matrice de corrélation ──────────────────────────────────────
  let corrHtml = '<div style="padding:16px;color:var(--text-3);text-align:center">Non disponible</div>';
  if (correlations?.assets?.length > 0) {
    const { assets, matrix } = correlations;
    const cellSize = Math.min(52, Math.floor(320 / assets.length));
    const corrColor = v => {
      const abs = Math.abs(v);
      if (v > 0.7)  return '#1fd97e';
      if (v > 0.3)  return '#4ade80';
      if (v > 0)    return '#a7f3d0';
      if (v > -0.3) return '#fca5a5';
      if (v > -0.7) return '#f87171';
      return '#ef4444';
    };
    const shortName = n => n.length > 6 ? n.slice(0,5)+'…' : n;
    corrHtml = `<div style="overflow-x:auto;padding:4px">
      <table class="corr-table">
        <thead><tr><th></th>${assets.map(a=>`<th title="${a}">${shortName(a)}</th>`).join('')}</tr></thead>
        <tbody>${matrix.map((row, i) =>
          `<tr><td class="corr-label" title="${assets[i]}">${shortName(assets[i])}</td>
          ${row.map((v, j) => i===j
            ? `<td class="corr-cell" style="background:var(--bg-panel);color:var(--text-3)">—</td>`
            : `<td class="corr-cell" style="background:${corrColor(v)}20;color:${corrColor(v)}" title="${assets[i]} / ${assets[j]}: ${v}">${v.toFixed(2)}</td>`
          ).join('')}</tr>`
        ).join('')}</tbody>
      </table>
      <div class="corr-legend">
        <span style="color:#1fd97e">■ Forte corrélation positive</span>
        <span style="color:var(--text-3)">■ Neutre</span>
        <span style="color:#ef4444">■ Corrélation négative</span>
      </div>
    </div>`;
  }

  // ── Backtesting ─────────────────────────────────────────────────
  const backHtml = backtest.length > 0
    ? backtest.map(b => {
        const col = b.direction==='buy'
          ? (b.avg_90d > 0 ? 'var(--green)' : 'var(--red)')
          : (b.avg_90d < 0 ? 'var(--green)' : 'var(--red)');
        const mini = b.last_5.map(r =>
          `<span style="color:${r>0?'var(--green)':'var(--red)'};">${r>0?'+':''}${r}%</span>`
        ).join(' · ');
        return `<div class="back-card">
          <div class="back-header">
            <span class="back-asset">${b.asset}</span>
            <span class="back-signal">${b.signal}</span>
            <span class="back-occ">${b.occurrences} fois</span>
          </div>
          <div class="back-stats">
            <div class="back-stat"><div class="back-stat-val" style="color:${col}">${b.avg_90d>0?'+':''}${b.avg_90d}%</div><div class="back-stat-lbl">Rendement moyen 90j</div></div>
            <div class="back-stat"><div class="back-stat-val" style="color:${b.win_rate>=60?'var(--green)':'var(--amber)'}">${b.win_rate}%</div><div class="back-stat-lbl">Taux de succès</div></div>
          </div>
          <div class="back-mini">Dernières occurrences : ${mini}</div>
        </div>`;
      }).join('')
    : '<div style="padding:16px;color:var(--text-3);text-align:center;font-size:13px">Données insuffisantes pour le backtesting.</div>';

  panel.innerHTML = `
    <div class="cal-header">
      <span class="cal-title">📊 Analyse avancée</span>
      <button class="icon-btn" onclick="toggleAnalytics()">✕</button>
    </div>
    <div class="analytics-body">
      <div class="analytics-section">
        <div class="analytics-title">🎯 Score de confiance par onglet</div>
        <div class="conf-grid">${confScores}</div>
      </div>
      <div class="analytics-section">
        <div class="analytics-title">⚡ Divergences détectées (20 derniers jours)</div>
        <div class="div-list">${divHtml}</div>
      </div>
      <div class="analytics-section">
        <div class="analytics-title">🔗 Matrice de corrélation (rendements 1 an)</div>
        ${corrHtml}
      </div>
      <div class="analytics-section">
        <div class="analytics-title">📈 Backtesting RSI historique</div>
        <div style="font-size:11px;color:var(--text-3);margin-bottom:12px">Performance observée 90 jours après chaque signal sur l'historique complet.</div>
        <div class="back-grid">${backHtml}</div>
      </div>
    </div>`;
}

async function loadCalendar() {
  const base = BACKEND.replace(/\/$/, '');
  if (!base) return;
  try {
    const r = await fetch(`${base}/calendar.json`);
    if (!r.ok) return;
    const d = await r.json();
    APP.calendar = d.events || [];
    const badge = gel('cal-badge');
    if (badge) {
      const soon = APP.calendar.filter(e=>e.days_from_now<=7).length;
      badge.textContent = soon > 0 ? soon : '';
      badge.style.display = soon > 0 ? 'flex' : 'none';
    }
  } catch(e) { console.warn('[calendar]', e.message); }
}

function toggleCalendar() {
  APP.calendarOpen = !APP.calendarOpen;
  const panel = gel('calendar-panel');
  if (!panel) return;
  if (APP.calendarOpen) {
    const CAT = {bourse:'📈',crypto:'₿',matieres:'🥇'};
    const IMP = {high:'var(--red)',medium:'var(--amber)',low:'var(--text-3)'};
    const items = APP.calendar.map(ev => {
      const dDay = ev.days_from_now===0?"Aujourd'hui":ev.days_from_now===1?"Demain":`Dans ${ev.days_from_now}j`;
      return `<div class="cal-item ${ev.days_from_now<=3?'cal-urgent':''}">
        <div class="cal-date">
          <div class="cal-day">${new Date(ev.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</div>
          <div class="cal-dday" style="color:${ev.days_from_now<=7?'var(--amber)':'var(--text-3)'}">${dDay}</div>
        </div>
        <div class="cal-info">
          <div class="cal-event">${CAT[ev.category]||'📅'} ${ev.event}</div>
          <div class="cal-impact" style="color:${IMP[ev.impact]||'var(--text-3)'}">
            ${'●'.repeat(ev.impact==='high'?3:ev.impact==='medium'?2:1)} ${ev.impact==='high'?'Impact fort':ev.impact==='medium'?'Impact modéré':'Impact faible'}
          </div>
        </div>
      </div>`;
    }).join('');
    panel.innerHTML = `
      <div class="cal-header">
        <span class="cal-title">📅 Calendrier macro — ${APP.calendar.length} événements</span>
        <button class="icon-btn" onclick="toggleCalendar()">✕</button>
      </div>
      <div class="cal-body">${items||'<p style="color:var(--text-3);padding:20px;text-align:center">Aucun événement<br><small>Configurez le backend dans ⚙</small></p>'}</div>`;
    panel.classList.add('open');
  } else {
    panel.classList.remove('open');
  }
}

/* ══════════════════════════════════════════════════════════════════
   HISTORIQUE DES SIGNAUX
   ══════════════════════════════════════════════════════════════════ */
// Les signaux sont calculés et historisés côté serveur (GitHub Actions) : plus rien à envoyer.
async function reportSignals() {}

async function loadHistory() {
  const base = BACKEND.replace(/\/$/, '');
  if (!base) return;
  try {
    const r = await fetch(`${base}/history.json`);
    if (!r.ok) return;
    const d = await r.json();
    ['bourse','crypto','matieres'].forEach(tab => {
      APP.history[tab] = d.history.filter(h=>h[tab]).map(h=>({ts:h.ts,sig:h[tab].sig,bp:h[tab].bp,sp:h[tab].sp}));
    });
  } catch(e) { console.warn('[history]', e.message); }
}



function openTooltip(indId) {
  let ind = null;
  for (const tab of ['bourse','crypto','matieres']) {
    for (const g of (APP.data?.[tab] || [])) {
      const f = g.indicators.find(i=>i.id===indId);
      if (f) { ind={...f,group:g.name,tab}; break; }
    }
    if (ind) break;
  }
  if (!ind) return;
  const overlay=gel('tooltip-overlay'), modal=gel('tooltip-modal');
  if (!overlay||!modal) return;
  const info = INDICATOR_INFO[ind.id] || null;
  const dots = [1,2,3].map(i=>`<span class="wd ${i<=ind.w?'on':'off'}"></span>`).join('');
  const SIG_LBL={buy:"↑ Achat",sell:"↓ Vente",neutral:"— Neutre"};
  const SIG_COL={buy:'var(--green)',sell:'var(--red)',neutral:'var(--amber)'};
  const educ = info ? `
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);margin-bottom:12px">📚 Comprendre cet indicateur</div>
      <div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:3px">Qu'est-ce que c'est ?</div><p style="font-size:13px;color:var(--text-2);line-height:1.65;margin:0">${info.what}</p></div>
      <div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:3px">Pourquoi c'est pertinent ?</div><p style="font-size:13px;color:var(--text-2);line-height:1.65;margin:0">${info.why}</p></div>
      <div style="padding:12px;background:var(--bg-panel);border-radius:var(--radius-sm);border:1px solid var(--border)"><div style="font-size:11px;font-weight:600;color:var(--text-1);margin-bottom:4px">🎯 Comment l'interpréter</div><p style="font-size:13px;color:var(--text-1);line-height:1.65;margin:0">${info.how}</p></div>
      ${info.creator?`<div style="margin-top:8px;font-size:11px;color:var(--text-3)">📖 ${info.creator}</div>`:''}
    </div>` : '';
  modal.innerHTML = `
    <div class="modal-header">
      <div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${ind.group}</div><h2 class="modal-title">${ind.name}</h2></div>
      <button class="icon-btn" onclick="closeTooltip()">✕</button>
    </div>
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap">
        <span class="badge badge-${ind.sig}" style="font-size:13px;padding:5px 14px">${SIG_LBL[ind.sig]}</span>
        <span style="font-size:24px;font-weight:700;color:${SIG_COL[ind.sig]}">${ind.raw}${ind.unit}</span>
      </div>
      <div class="meter" style="height:8px;margin-bottom:6px"><div class="meter-fill ${ind.sig}" style="width:${ind.val}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-3)"><span>Survente</span><span>Neutre</span><span>Surachat</span></div>
      <p style="margin:12px 0 0;font-size:13px;color:var(--text-2);line-height:1.6">${ind.desc}</p>
    </div>
    ${educ}
    ${btBlock(ind.id)}
    <div style="padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;background:var(--bg-panel)">
      <div><div style="font-size:10px;color:var(--text-3);margin-bottom:4px">Importance</div><div class="weight">${dots}<span class="weight-label" style="margin-left:6px">${['','Faible','Modérée','Forte'][ind.w]}</span></div></div>
      <div style="text-align:right"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px">Source</div><span style="font-size:12px;color:${ind.source==='live'?'var(--green)':'var(--amber)'}">● ${ind.source==='live'?'Temps réel':'Donnée simulée'}</span></div>
    </div>`;
  overlay.style.display='block'; modal.style.display='block'; modal.scrollTop=0;
}
function closeTooltip() {
  const o=gel('tooltip-overlay'),m=gel('tooltip-modal');
  if(o) o.style.display='none'; if(m) m.style.display='none';
}

/* ══════════════════════════════════════════════════════════════════
   COMPARAISON + EXPORT + PARAMÈTRES + CONTRÔLEUR
   ══════════════════════════════════════════════════════════════════ */
function enterCompare(id) { APP.compareMode=true; Config.compareTab=id; renderContent(); }
function exitCompare()    { APP.compareMode=false; Config.compareTab=''; renderContent(); }
function exportPDF() {
  document.title=`MarketSense — ${TABS.find(t=>t.id===APP.tab)?.label} — ${new Date().toLocaleDateString('fr-FR')}`;
  window.print();
  setTimeout(()=>{ document.title='MarketSense — Aide à l\'investissement'; }, 2000);
}
function openSettings() {
  const emEl = gel('alert-email');
  if (emEl) emEl.value = Config.alertEmail;
  gel('settings-overlay').style.display = 'block';
  gel('settings-modal').style.display   = 'block';
}
function closeSettings() {
  gel('settings-overlay').style.display = 'none';
  gel('settings-modal').style.display   = 'none';
}
function saveSettings() {
  Config.alertEmail = (gel('alert-email')?.value || '').trim();
  closeSettings();
  refresh();
}
function toggleTheme() {
  const next=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next); Config.theme=next;
  const moon=document.querySelector('.icon-moon'),sun=document.querySelector('.icon-sun');
  if(moon&&sun){moon.style.display=next==='dark'?'':'none';sun.style.display=next==='dark'?'none':'';}
}
function switchTab(id) { APP.tab=id; renderContent(); }

/* ── Refresh principal ───────────────────────────────────────────── */
async function refresh() {
  if (APP.loading) return;
  APP.loading=true;
  setStatus('loading','Actualisation…');
  const btn=gel('refresh-btn');
  if(btn) btn.style.opacity='0.4';
  try {
    APP.data=await fetchLiveData(defaultData());
    APP.lastUpdate=new Date();
    const ts=APP.lastUpdate.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const bk=BACKEND?'· Backend ✓':'· ⚠ Backend non configuré';
    setStatus('live',`${ts} · ${APP.liveCount} live ${bk}`);
    await Promise.all([reportSignals(), loadHistory(), loadCalendar(), loadBacktest()]);
    renderContent();
    checkSignalChanges();
  } catch(e) {
    console.error('[refresh]', e);
    setStatus('error', `Erreur : ${e.message || e}`);
    if (APP.data) renderContent();
  }
  APP.loading=false;
  if(btn) btn.style.opacity='1';
}

/* ── Boot ────────────────────────────────────────────────────────── */
(async function init() {
  document.documentElement.setAttribute('data-theme', Config.theme);
  const moon=document.querySelector('.icon-moon'),sun=document.querySelector('.icon-sun');
  if(Config.theme==='light'&&moon&&sun){moon.style.display='none';sun.style.display='';}
  APP.data=defaultData();
  APP.history={};
  setStatus('loading','Connexion aux sources de données…');
  renderContent();            // Affichage immédiat avec données par défaut
  await refresh();            // Puis enrichissement live
  setInterval(refresh, 5*60*1000);
})();
