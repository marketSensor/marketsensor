/* ═══════════════════════════════════════════════════════════════════
   MarketSense — app.js  v2
   Sources live :
     Backend propre  → Bourse (RSI/MACD/Bollinger/VIX/CAPE) + Matières premières
     Alternative.me  → Crypto Fear & Greed
     CoinGecko       → BTC Dominance · RSI BTC · MACD BTC · Pi Cycle
     Blockchain.info → Hash Rate BTC
     Alpha Vantage   → cache 24h localStorage (quota 25 req/jour préservé)
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

const APP = { tab: 'bourse', data: null, loading: false, lastUpdate: null, liveCount: 0 };

const Config = {
  get avKey()      { return localStorage.getItem('ms_av_key')      || ''; },
  set avKey(v)     { localStorage.setItem('ms_av_key', v); },
  get theme()      { return localStorage.getItem('ms_theme')      || 'dark'; },
  set theme(v)     { localStorage.setItem('ms_theme', v); },
  get backendUrl() { return localStorage.getItem('ms_backend_url') || ''; },
  set backendUrl(v){ localStorage.setItem('ms_backend_url', v); },
};

const gel  = id => document.getElementById(id);
const html = (el, h) => { el.innerHTML = h; };

/* ══════════════════════════════════════════════════════════════════
   API MODULE
   ══════════════════════════════════════════════════════════════════ */
const Api = {
  async get(url, label = '') {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res   = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) { console.warn(`[MarketSense] ${label} →`, e.message); return null; }
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
      'BTC Prices'
    );
    return d?.prices ? d.prices.map(p => p[1]) : null;
  },

  async blockchainStats() {
    const d = await this.get('https://api.blockchain.info/stats', 'Blockchain');
    return d?.hash_rate ? { hashRate: d.hash_rate } : null;
  },

  async backend() {
    const base = Config.backendUrl.replace(/\/$/, '');
    if (!base) return null;
    return await this.get(`${base}/api/indicators`, 'Backend');
  },

  /* Alpha Vantage — cache localStorage 24h pour préserver le quota */
  _avRead(key) {
    try {
      const item = JSON.parse(localStorage.getItem(`ms_av_${key}`) || 'null');
      if (!item || Date.now() - item.ts > 86_400_000) return null;
      return item.data;
    } catch { return null; }
  },
  _avWrite(key, data) {
    try { localStorage.setItem(`ms_av_${key}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
  },

  async avRSI(symbol) {
    const c = this._avRead(`rsi_${symbol}`);
    if (c !== null) { console.info(`[AV] RSI ${symbol} depuis cache 24h`); return c; }
    if (!Config.avKey) return null;
    const url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${Config.avKey}`;
    const d = await this.get(url, `AV RSI ${symbol}`);
    const ana = d?.['Technical Analysis: RSI'];
    if (!ana) return null;
    const val = parseFloat(Object.values(ana)[0].RSI);
    this._avWrite(`rsi_${symbol}`, val);
    return val;
  },

  async avMACD(symbol) {
    const c = this._avRead(`macd_${symbol}`);
    if (c !== null) { console.info(`[AV] MACD ${symbol} depuis cache 24h`); return c; }
    if (!Config.avKey) return null;
    const url = `https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${Config.avKey}`;
    const d = await this.get(url, `AV MACD ${symbol}`);
    const ana = d?.['Technical Analysis: MACD'];
    if (!ana) return null;
    const lat = Object.values(ana)[0];
    const val = { macd: parseFloat(lat.MACD), signal: parseFloat(lat.MACD_Signal) };
    this._avWrite(`macd_${symbol}`, val);
    return val;
  },
};

/* ══════════════════════════════════════════════════════════════════
   CALCULS (client — pour la crypto uniquement)
   ══════════════════════════════════════════════════════════════════ */
const Calc = {
  rsi(prices, period = 14) {
    if (!prices || prices.length < period + 1) return null;
    let g = 0, l = 0;
    for (let i = 1; i <= period; i++) { const d = prices[i] - prices[i-1]; d > 0 ? g += d : l -= d; }
    let ag = g / period, al = l / period;
    for (let i = period + 1; i < prices.length; i++) {
      const d = prices[i] - prices[i-1];
      ag = (ag * (period-1) + Math.max(0, d))  / period;
      al = (al * (period-1) + Math.max(0,-d)) / period;
    }
    return al === 0 ? 100 : Math.round(100 - 100 / (1 + ag / al));
  },
  ema(prices, period) {
    if (!prices || prices.length < period) return null;
    const k = 2 / (period + 1);
    let e = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) e = prices[i] * k + e * (1 - k);
    return e;
  },
  sma(prices, period) {
    if (!prices || prices.length < period) return null;
    const s = prices.slice(-period);
    return s.reduce((a, b) => a + b, 0) / s.length;
  },
  macdSign(prices) {
    const e12 = this.ema(prices, 12), e26 = this.ema(prices, 26);
    return (e12 && e26) ? e12 - e26 : null;
  },
  norm(v, lo, hi) { return Math.min(100, Math.max(0, Math.round((v - lo) / (hi - lo) * 100))); },
  rsiSig(v)  { return v < 35 ? 'buy' : v > 65 ? 'sell' : 'neutral'; },
  fngSig(v)  { return v < 30 ? 'buy' : v > 70 ? 'sell' : 'neutral'; },
};

/* ══════════════════════════════════════════════════════════════════
   DONNÉES PAR DÉFAUT
   ══════════════════════════════════════════════════════════════════ */
function defaultData() {
  return {
    bourse: [
      { name: 'Momentum', indicators: [
        { id:'rsi_spx',   name:'RSI S&P 500 (14j)',     val:58, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'RSI S&P 500 — chargement en cours via le backend.' },
        { id:'macd_spx',  name:'MACD S&P 500',          val:50, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'MACD S&P 500 — chargement en cours via le backend.' },
        { id:'stoch',     name:'Stochastique (14,3)',    val:65, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'Stochastique S&P 500 — chargement via le backend.' },
      ]},
      { name: 'Tendance', indicators: [
        { id:'mm50',      name:'Prix vs MM50',           val:78, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'Prix S&P 500 vs MM50 — chargement en cours.' },
        { id:'mm200',     name:'Prix vs MM200',          val:83, sig:'buy',     w:3, raw:'—',       unit:'',        source:'live',      desc:'Prix S&P 500 vs MM200 — chargement en cours.' },
        { id:'cross',     name:'Golden / Death Cross',   val:80, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'Croisement MM50/MM200 — chargement en cours.' },
      ]},
      { name: 'Volatilité', indicators: [
        { id:'vix',       name:'VIX (Cboe)',             val:38, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'VIX — chargement en cours via le backend.' },
        { id:'bollinger', name:'Bollinger Bands',        val:55, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'Bandes de Bollinger S&P 500 — chargement en cours.' },
        { id:'atr',       name:'ATR (volatilité hist.)', val:42, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'ATR S&P 500 — chargement en cours.' },
      ]},
      { name: 'Sentiment', indicators: [
        { id:'fg_spx',    name:'Fear & Greed Index',     val:65, sig:'neutral', w:3, raw:'65',      unit:'/100',    source:'simulated', desc:'Indice CNN Fear & Greed. (données simulées — API privée CNN)' },
        { id:'putcall',   name:'Put / Call Ratio',       val:48, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'Ratio Put/Call equity (CBOE) — chargement via le backend.' },
        { id:'aaii',      name:'AAII Sentiment',         val:60, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'Sentiment AAII hebdomadaire — chargement via le backend.' },
      ]},
      { name: 'Valorisation', indicators: [
        { id:'cape',      name:'Shiller CAPE',           val:22, sig:'sell',    w:3, raw:'—',       unit:'x',       source:'live',      desc:'Shiller CAPE — chargement en cours (scrape multpl.com).' },
        { id:'pe_fwd',    name:'P/E Trailing S&P 500',  val:38, sig:'neutral', w:2, raw:'—',       unit:'x',       source:'live',      desc:'P/E Trailing S&P 500 (SPY) — chargement via le backend.' },
      ]},
    ],
    crypto: [
      { name: 'Métriques On-Chain', indicators: [
        { id:'mvrv',     name:'MVRV Z-Score',           val:50, sig:'neutral', w:3, raw:'—',        unit:'',     source:'live', desc:'MVRV Z-Score (Bitbo API) — chargement.' },
        { id:'nupl',     name:'NUPL',                   val:50, sig:'neutral', w:3, raw:'—',        unit:'',     source:'live', desc:'Net Unrealized Profit/Loss (Bitbo API) — chargement.' },
        { id:'sopr',     name:'SOPR',                   val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'live', desc:'Spent Output Profit Ratio (Bitbo API) — chargement.' },
        { id:'cdd',      name:'Coin Days Destroyed',    val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'live', desc:'Coin Days Destroyed (Bitbo API) — chargement.' },
        { id:'nvt',      name:'NVT Signal',             val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'live', desc:'Network Value to Transactions (Bitbo API) — chargement.' },
        { id:'hashrate', name:'Hash Rate BTC',          val:88, sig:'buy',     w:2, raw:'—',        unit:'EH/s', source:'live', desc:'Hash Rate BTC en temps réel (Blockchain.info).' },
      ]},
      { name: 'Sentiment Crypto', indicators: [
        { id:'cfg',      name:'Crypto Fear & Greed',    val:50, sig:'neutral', w:3, raw:'—',        unit:'/100', source:'live', desc:'Indice Alternative.me — chargement en cours.' },
        { id:'btcdom',   name:'Bitcoin Dominance',      val:54, sig:'neutral', w:1, raw:'—',        unit:'%',    source:'live', desc:'Dominance BTC (CoinGecko) — chargement en cours.' },
        { id:'funding',  name:'Funding Rate Perps',     val:55, sig:'neutral', w:2, raw:'—',        unit:'/8h',  source:'live', desc:'Funding Rate BTC perps (Binance) — chargement.' },
      ]},
      { name: 'Indicateurs de Cycle', indicators: [
        { id:'picycle',  name:'Pi Cycle Top',           val:28, sig:'buy',     w:3, raw:'—',        unit:'',     source:'live', desc:'Pi Cycle calculé depuis les prix BTC (CoinGecko) — chargement.' },
        { id:'puell',    name:'Puell Multiple',         val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'live', desc:'Puell Multiple (Bitbo API) — chargement.' },
        { id:'mayer',    name:'Mayer Multiple',         val:50, sig:'neutral', w:2, raw:'—',        unit:'x',    source:'live', desc:'Prix BTC / MM200 (Bitbo / yfinance) — chargement.' },
        { id:'rainbow',  name:'Rainbow Chart Zone',     val:52, sig:'neutral', w:1, raw:'—',        unit:'',     source:'live', desc:'Rainbow Chart BTC (log-régression) — chargement.' },
      ]},
      { name: 'Analyse Technique BTC', indicators: [
        { id:'btcrsi',   name:'RSI Bitcoin Journalier', val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'live', desc:'RSI BTC (14j) calculé sur les prix CoinGecko — chargement.' },
        { id:'btcrsim',  name:'RSI Bitcoin Mensuel',    val:50, sig:'neutral', w:3, raw:'—',        unit:'',     source:'live', desc:'RSI mensuel BTC — signal clé de cycle (Bitbo / yfinance).' },
        { id:'btcmacd',  name:'MACD Bitcoin',           val:50, sig:'neutral', w:2, raw:'—',        unit:'',     source:'live', desc:'MACD BTC calculé sur les prix CoinGecko — chargement.' },
        { id:'btcsupp',  name:'Support / Résistance',   val:72, sig:'buy',     w:1, raw:'Au-dessus', unit:'',   source:'simulated', desc:'Bitcoin au-dessus de ses supports clés. (données simulées)' },
      ]},
    ],
    matieres: [
      { name: 'Macro & Dollar', indicators: [
        { id:'dxy',       name:'Dollar Index (DXY)',     val:30, sig:'buy',     w:3, raw:'—',       unit:'',        source:'live',      desc:'DXY — chargement en cours via le backend.' },
        { id:'realrates', name:'Taux réels (TIPS 10y)',  val:72, sig:'buy',     w:3, raw:'—',       unit:'',        source:'live',      desc:'Taux réels TIPS 10y (FRED) — chargement.' },
        { id:'cpi',       name:'Inflation CPI (USA)',    val:62, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'Inflation CPI annualisée (FRED) — chargement.' },
      ]},
      { name: 'Or & Argent', indicators: [
        { id:'goldrsi',   name:'RSI Or (14j)',           val:55, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'RSI Or (GC=F) — chargement en cours.' },
        { id:'goldsil',   name:'Ratio Or / Argent',      val:78, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'Ratio Or/Argent (GC=F / SI=F) — chargement.' },
        { id:'cbgold',    name:'Achats Banques Centrales',val:88, sig:'buy',    w:3, raw:'Records',  unit:'',        source:'simulated', desc:'Achats records banques centrales (WGC 2024). (données simulées)' },
      ]},
      { name: 'Uranium & Nucléaire', indicators: [
        { id:'uspot',     name:'Uranium (URA ETF)',      val:72, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'URA ETF (proxy uranium) — chargement en cours.' },
        { id:'ursi',      name:'RSI Uranium (14j)',      val:48, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'RSI URA ETF — chargement en cours.' },
        { id:'nuclear',   name:'Demande Nucléaire',      val:88, sig:'buy',     w:3, raw:'60+',     unit:' réacteurs', source:'simulated', desc:'60+ réacteurs en construction (WNA 2024). (données simulées)' },
      ]},
      { name: 'Platine, Argent & Métaux', indicators: [
        { id:'sivrsi',    name:'RSI Argent (14j)',       val:52, sig:'neutral', w:1, raw:'—',       unit:'',        source:'live',      desc:'RSI Argent (SI=F) — chargement en cours.' },
        { id:'platpall',  name:'Platine vs Palladium',   val:76, sig:'buy',     w:2, raw:'—',       unit:'',        source:'live',      desc:'Prix Platine vs Palladium — chargement.' },
        { id:'copper',    name:'Cuivre & Transition',    val:60, sig:'neutral', w:2, raw:'—',       unit:'',        source:'live',      desc:'RSI & prix Cuivre (HG=F) — chargement.' },
      ]},
    ],
  };
}

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

  const [fng, global, prices, blockchain, backend, avRsiSpx, avMacdSpx, avRsiGld] = await Promise.all([
    Api.cryptoFearGreed(),
    Api.cgGlobal(),
    Api.btcPrices(365),
    Api.blockchainStats(),
    Api.backend(),
    Api.avRSI('SPY'),
    Api.avMACD('SPY'),
    Api.avRSI('GLD'),
  ]);

  /* ── Backend → bourse + crypto + matières ──────────────────── */
  if (backend) {
    for (const [section, groups] of [['bourse', data.bourse], ['crypto', data.crypto], ['matieres', data.matieres]]) {
      for (const [id, vals] of Object.entries(backend[section] || {})) {
        if (applyPatch(groups, id, vals)) live++;
      }
    }
  }

  /* ── Crypto Fear & Greed ─────────────────────────────────────── */
  if (fng) {
    const v = fng.value;
    applyPatch(data.crypto, 'cfg', {
      val: v, raw: String(v), sig: Calc.fngSig(v),
      desc: `Indice à ${v} (${fng.label}) — `
        + (v > 75 ? 'euphorie extrême, risque de correction élevé.'
         : v < 25 ? 'peur extrême — opportunité d\'achat historique.'
         : v > 55 ? 'sentiment optimiste, vigilance conseillée.' : 'sentiment neutre.'),
    }); live++;
  }

  /* ── BTC Dominance ───────────────────────────────────────────── */
  if (global) {
    const dom = Math.round(global.btcDom * 10) / 10;
    applyPatch(data.crypto, 'btcdom', {
      val: Math.min(100, Math.round(dom)), raw: dom.toFixed(1),
      sig: dom > 58 ? 'sell' : dom < 42 ? 'buy' : 'neutral',
      desc: `Dominance BTC à ${dom.toFixed(1)} % (CoinGecko) — `
        + (dom > 58 ? 'Bitcoin ultra-dominant, altcoins sous pression.'
         : dom < 45 ? 'Potentielle altseason, rotations vers les altcoins.'
         : 'Marché crypto équilibré.'),
    }); live++;
  }

  /* ── BTC Prices → RSI · MACD · Pi Cycle ─────────────────────── */
  if (prices && prices.length >= 30) {
    const rsi = Calc.rsi(prices, 14);
    if (rsi !== null) {
      applyPatch(data.crypto, 'btcrsi', {
        val: rsi, raw: String(rsi), sig: Calc.rsiSig(rsi),
        desc: `RSI BTC à ${rsi} (${prices.length}j, CoinGecko) — `
          + (rsi > 70 ? 'suracheté.' : rsi < 30 ? 'survendu — opportunité d\'achat.' : 'zone neutre.'),
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
          ? `Pi Cycle proche du déclenchement (${(ratio*100).toFixed(0)} %) — signal de sommet de cycle.`
          : `Pi Cycle non déclenché (ratio ${(ratio*100).toFixed(0)} %) — loin du sommet. Signal haussier.`,
      }); live++;
    }
  }

  /* ── Hash Rate ───────────────────────────────────────────────── */
  if (blockchain?.hashRate) {
    const hr = blockchain.hashRate;
    const hrEH = hr > 1e8 ? hr / 1e9 : hr > 1e5 ? hr / 1e6 : hr;
    const display = `${Math.round(hrEH)} EH/s`;
    applyPatch(data.crypto, 'hashrate', {
      raw: display, val: Math.min(97, Calc.norm(hrEH, 100, 800)),
      sig: hrEH > 400 ? 'buy' : 'neutral',
      desc: `Hash Rate BTC : ${display} (blockchain.info). `
        + (hrEH > 500 ? 'Niveau historiquement très élevé — confiance maximale des mineurs.' : 'Réseau sécurisé.'),
    }); live++;
  }

  /* ── Alpha Vantage (cache 24h, fallback si backend absent) ─── */
  if (findInd(data.bourse, 'rsi_spx')?.source !== 'live' && typeof avRsiSpx === 'number' && !isNaN(avRsiSpx)) {
    const v = Math.round(avRsiSpx);
    applyPatch(data.bourse, 'rsi_spx', { val: v, raw: String(v), sig: Calc.rsiSig(avRsiSpx),
      desc: `RSI S&P 500 (SPY) à ${v} (Alpha Vantage, cache 24h).` }); live++;
  }
  if (findInd(data.bourse, 'macd_spx')?.source !== 'live' && avMacdSpx) {
    const bull = avMacdSpx.macd > avMacdSpx.signal;
    applyPatch(data.bourse, 'macd_spx', { sig: bull ? 'buy' : 'sell', val: bull ? 70 : 30,
      raw: bull ? 'Positif' : 'Négatif',
      desc: `MACD SPY ${bull ? 'haussier.' : 'baissier.'} (Alpha Vantage, cache 24h)` }); live++;
  }
  if (findInd(data.matieres, 'goldrsi')?.source !== 'live' && typeof avRsiGld === 'number' && !isNaN(avRsiGld)) {
    const v = Math.round(avRsiGld);
    applyPatch(data.matieres, 'goldrsi', { val: v, raw: String(v), sig: Calc.rsiSig(avRsiGld),
      desc: `RSI Or (GLD ETF) à ${v} (Alpha Vantage, cache 24h).` }); live++;
  }

  APP.liveCount = live;
  return data;
}

/* ══════════════════════════════════════════════════════════════════
   RECOMMANDATION
   ══════════════════════════════════════════════════════════════════ */
function computeReco(groups) {
  let b = 0, s = 0, n = 0, t = 0, excluded = 0;
  groups.forEach(g => g.indicators.forEach(i => {
    if (i.source !== 'live') { excluded++; return; } // ignoré
    t += i.w;
    if (i.sig === 'buy') b += i.w; else if (i.sig === 'sell') s += i.w; else n += i.w;
  }));
  const bp = t ? Math.round(b/t*100) : 0;
  const sp = t ? Math.round(s/t*100) : 0;
  const np = 100 - bp - sp;
  return { sig: bp >= 45 ? 'buy' : sp >= 35 ? 'sell' : 'neutral', bp, sp, np, excluded };
}

/* ══════════════════════════════════════════════════════════════════
   RENDU
   ══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id:'bourse',   label:'Bourse',             icon:'📈' },
  { id:'crypto',   label:'Crypto',              icon:'₿'  },
  { id:'matieres', label:'Matières premières',  icon:'🥇' },
];
const SIG  = { buy:'Achat', sell:'Vente', neutral:'Neutre' };
const RECO = {
  buy:     { arrow:'↑', label:'Acheter',  sub:'Signaux majoritairement haussiers' },
  sell:    { arrow:'↓', label:'Vendre',   sub:'Signaux de distribution détectés'  },
  neutral: { arrow:'—', label:'Attendre', sub:'Signaux mixtes, direction incertaine' },
};
const RECO_DESC = {
  buy: {
    bourse:   'Les indicateurs techniques et de valorisation sont alignés à la hausse. Moment favorable pour renforcer des positions.',
    crypto:   'Métriques on-chain, cycle et technique pointent vers la hausse. Environnement favorable à l\'accumulation.',
    matieres: 'Macro favorable, dollar faible, demande en hausse. Excellent profil risque/rendement sur les matières premières.',
  },
  sell: {
    bourse:   'Valorisation excessive et surchauffe détectées. Prendre des bénéfices et réduire l\'exposition.',
    crypto:   'Indicateurs de cycle en zone de distribution. Sécuriser des profits.',
    matieres: 'Pression du dollar, ralentissement demande — réduire les positions.',
  },
  neutral: {
    bourse:   'Signaux partagés — patience avant de renforcer.',
    crypto:   'Indicateurs divergents — attendre une confirmation directionnelle.',
    matieres: 'Contexte incertain — attendre de meilleures conditions d\'entrée.',
  },
};

function renderTabs() {
  html(gel('tabs'), TABS.map(t =>
    `<button class="tab ${t.id===APP.tab?'active':''}" onclick="switchTab('${t.id}')">
      <span class="tab-icon">${t.icon}</span>${t.label}</button>`).join(''));
}

function renderReco(groups) {
  const r = computeReco(groups), R = RECO[r.sig];
  const live = groups.flatMap(g => g.indicators).filter(i => i.source==='live').length;
  html(gel('reco'), `
    <div class="reco-card reco-${r.sig}">
      <div class="reco-left">
        <div class="reco-label">Recommandation globale</div>
        <div class="reco-signal">${R.arrow} ${R.label}</div>
        <div class="reco-sub">${R.sub}</div>
      </div>
      <div class="reco-mid">
        ${[['Achat',r.bp,'buy'],['Vente',r.sp,'sell'],['Neutre',r.np,'neutral']].map(([l,p,c]) =>
          `<div class="reco-row"><span class="reco-rl">${l}</span>
           <div class="reco-track"><div class="reco-fill ${c}" style="width:${p}%"></div></div>
           <span class="reco-pct">${p} %</span></div>`).join('')}
        <div class="reco-live-count">${live} indicateur${live>1?'s':''} en temps réel${r.excluded ? ` · ${r.excluded} sim. exclus du calcul` : ''}</div>
      </div>
      <div class="reco-right"><p>${RECO_DESC[r.sig][APP.tab]}</p></div>
    </div>`);
}

function renderIndicator(ind) {
  const dots = [1,2,3].map(i => `<span class="wd ${i<=ind.w?'on':'off'}"></span>`).join('');
  const isSim = ind.source !== 'live';

  if (isSim) {
    return `<div class="ind ind-sim">
      <div class="ind-top">
        <div class="ind-name-wrap">
          <span class="ind-name">${ind.name}</span>
          <span class="tag-sim">Non actualisé</span>
        </div>
        <span class="badge badge-${ind.sig}" style="opacity:.4">${SIG[ind.sig]}</span>
      </div>
      <div class="sim-warning">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Donnée figée — exclue de la recommandation. Valeur du ${new Date().toLocaleDateString('fr-FR', {month:'long', year:'numeric'})}.
      </div>
      <div class="meter ind-sim-meter"><div class="meter-fill ${ind.sig}" style="width:${ind.val}%;opacity:.3"></div></div>
      <div class="ind-foot" style="opacity:.4">
        <div class="weight">${dots}<span class="weight-label">Importance</span></div>
        <span class="ind-val">${ind.raw}${ind.unit}</span>
      </div>
    </div>`;
  }

  const tag = '<span class="tag-live">Live</span>';
  return `<div class="ind">
    <div class="ind-top">
      <div class="ind-name-wrap"><span class="ind-name">${ind.name}</span>${tag}</div>
      <span class="badge badge-${ind.sig}">${SIG[ind.sig]}</span>
    </div>
    <div class="ind-desc">${ind.desc}</div>
    <div class="meter"><div class="meter-fill ${ind.sig}" style="width:${ind.val}%"></div></div>
    <div class="ind-foot">
      <div class="weight">${dots}<span class="weight-label">Importance</span></div>
      <span class="ind-val">${ind.raw}${ind.unit}</span>
    </div>
  </div>`;
}

function renderContent() {
  renderTabs(); renderReco(APP.data[APP.tab]);
  html(gel('content'), APP.data[APP.tab].map(g =>
    `<div class="section"><div class="section-title">${g.name}</div>
     <div class="indicators">${g.indicators.map(renderIndicator).join('')}</div></div>`).join(''));
}

function setStatus(type, text) {
  const dot = gel('status-dot'), txt = gel('status-text');
  if (dot) dot.className = `status-dot ${type}`;
  if (txt) txt.textContent = text;
}

/* ══════════════════════════════════════════════════════════════════
   CONTRÔLEUR
   ══════════════════════════════════════════════════════════════════ */
function switchTab(id) { APP.tab = id; renderContent(); }

async function refresh() {
  if (APP.loading) return;
  APP.loading = true;
  setStatus('loading', 'Actualisation…');
  const btn = gel('refresh-btn');
  if (btn) btn.style.opacity = '0.4';
  try {
    APP.data = await fetchLiveData(defaultData());
    APP.lastUpdate = new Date();
    const ts  = APP.lastUpdate.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    const bk  = Config.backendUrl ? '· Backend ✓' : '· ⚠ Backend non configuré';
    setStatus('live', `${ts} · ${APP.liveCount} live ${bk}`);
    renderContent();
  } catch (e) {
    console.error('[MarketSense]', e);
    setStatus('error', 'Erreur de chargement');
  }
  APP.loading = false;
  if (btn) btn.style.opacity = '1';
}

function openSettings() {
  gel('av-key').value      = Config.avKey;
  gel('backend-url').value = Config.backendUrl;
  gel('settings-overlay').style.display = 'block';
  gel('settings-modal').style.display   = 'block';
}
function closeSettings() {
  gel('settings-overlay').style.display = 'none';
  gel('settings-modal').style.display   = 'none';
}
function saveSettings() {
  Config.avKey      = gel('av-key').value.trim();
  Config.backendUrl = gel('backend-url').value.trim().replace(/\/$/, '');
  closeSettings(); refresh();
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next); Config.theme = next;
  const moon = document.querySelector('.icon-moon'), sun = document.querySelector('.icon-sun');
  if (moon && sun) { moon.style.display = next==='dark'?'':'none'; sun.style.display = next==='dark'?'none':''; }
}

/* ── Boot ───────────────────────────────────────────────────────── */
(async function init() {
  document.documentElement.setAttribute('data-theme', Config.theme);
  const moon = document.querySelector('.icon-moon'), sun = document.querySelector('.icon-sun');
  if (Config.theme === 'light' && moon && sun) { moon.style.display='none'; sun.style.display=''; }
  APP.data = defaultData();
  setStatus('loading', 'Connexion aux sources de données…');
  renderContent();
  await refresh();
  setInterval(refresh, 5 * 60 * 1000);
})();
