/* MarketSense — fonctions d'aide à la décision : horizons, "pourquoi", liste de suivi, test rétroactif, groupes repliables */
'use strict';

const _ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ── Horizon (tous / court terme / long terme) ───────────────────── */
const HORIZONS = { all: 'Tous', c: 'Court terme', l: 'Long terme' };
function setHorizon(h) { APP.horizon = h; _ls.set('ms_horizon', h); renderContent(); }
function renderHorizonBar(groups, tab) {
  const rc = computeReco(groups, tab, 'c'), rl = computeReco(groups, tab, 'l');
  const chip = (lbl, r) => `<span class="hz-chip hz-${r.sig}" title="${r.bp} % achat · ${r.sp} % vente">${lbl} : <strong>${RECO[r.sig].label}</strong></span>`;
  return `<div class="hz-bar">
    <div class="hz-seg" role="group" aria-label="Horizon">${Object.entries(HORIZONS).map(([k, l]) =>
      `<button class="${(APP.horizon || 'all') === k ? 'active' : ''}" onclick="setHorizon('${k}')">${l}</button>`).join('')}</div>
    <div class="hz-chips">${chip('Court terme', rc)}${chip('Long terme', rl)}</div>
  </div>`;
}

/* ── Pourquoi ce verdict ? ───────────────────────────────────────── */
function renderWhy(groups, tab, r) {
  const live = [];
  groups.forEach(g => {
    if (isGroupDisabled(tab, g.name)) return;
    g.indicators.forEach(i => {
      if (i.source !== 'live') return;
      if (APP.horizon && APP.horizon !== 'all' && i.h !== APP.horizon) return;
      live.push({ ...i, group: g.name });
    });
  });
  const ew = effectiveWeights(live); live.forEach((i, k) => { i.w = ew[k]; });   // poids effectifs (plafonds de famille)
  const total = live.reduce((a, i) => a + i.w, 0) || 1;
  const top = sig => live.filter(i => i.sig === sig)
    .sort((a, b) => b.w - a.w || Math.abs(b.val - 50) - Math.abs(a.val - 50)).slice(0, 3);
  const li = i => `<li onclick="openTooltip('${i.id}')"><span class="why-w" title="Poids dans le vote">${Math.round(i.w / total * 100)} %</span>
      <span class="why-n">${i.name}</span><span class="why-v">${i.raw}${i.unit || ''}</span></li>`;
  const pros = top('buy'), cons = top('sell');
  const nNeutral = live.filter(i => i.sig === 'neutral').length;
  const gap = r.sig === 'buy' ? `Achat ≥ 45 % du poids : ${r.bp} % → <strong>Acheter</strong>.`
    : r.sig === 'sell' ? `Vente ≥ 35 % du poids (et achat < 45 %) : ${r.sp} % → <strong>Vendre</strong>.`
    : `Achat ${r.bp} % (< 45 %) et vente ${r.sp} % (< 35 %) → <strong>Attendre</strong>.`;
  return `<details class="why" ${_ls.get('ms_why_open', false) ? 'open' : ''} ontoggle="_ls.set('ms_why_open', this.open)">
    <summary>Pourquoi ce verdict ?</summary>
    <p class="why-rule">${gap} ${nNeutral} indicateur${nNeutral > 1 ? 's' : ''} neutre${nNeutral > 1 ? 's' : ''}.</p>
    <div class="why-cols">
      <div><div class="why-h why-buy">↑ Ce qui plaide pour l'achat</div><ul>${pros.map(li).join('') || '<li class="why-none">Aucun</li>'}</ul></div>
      <div><div class="why-h why-sell">↓ Ce qui plaide pour la vente</div><ul>${cons.map(li).join('') || '<li class="why-none">Aucun</li>'}</ul></div>
    </div>
  </details>`;
}

/* ── Âge des données & test rétroactif (pastilles sur les cartes) ── */
function ageTag(ind) {
  if (ind.carried) return '<span class="tag-old" title="La source n\'a pas répondu à la dernière actualisation : dernière valeur connue (moins de 24 h).">Valeur conservée</span>';
  if (ind.asof) {
    const days = Math.floor((Date.now() - new Date(ind.asof).getTime()) / 86400000);
    if (days > 7) return `<span class="tag-old" title="Date de la donnée source">Donnée du ${new Date(ind.asof).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>`;
  }
  return '';
}
const BT_LABEL = { discriminant: ['✓', 'Test passé : ce signal a distingué les bonnes des mauvaises périodes'],
  peu_informatif: ['≈', 'Test passé : ce signal n\'a pas apporté d\'avantage net'],
  inverse: ['✗', 'Test passé : ce signal a plutôt été trompeur'],
  insuffisant: ['·', 'Test passé : échantillon insuffisant'] };
function btFor(id, tab) {
  const bt = APP.backtest;
  const m = bt?.map?.[tab || APP.tab]?.[id];
  const asset = m && bt.assets?.[m[0]];
  const ind = asset?.indicators?.[m[1]];
  return ind ? { ind, asset } : null;
}
function btTag(id, tab) {
  const r = btFor(id, tab);
  if (!r) return '';
  const [sym, tip] = BT_LABEL[r.ind.verdict] || BT_LABEL.insuffisant;
  return `<span class="tag-bt bt-${r.ind.verdict}" title="${tip} (${r.asset.label})">Passé ${sym}</span>`;
}
function btBlock(id, tab) {
  const r = btFor(id, tab);
  if (!r) return '';
  const { ind: bt, asset } = r;
  const H = APP.backtest.horizons || { '3m': '3 mois', '12m': '12 mois' };
  const f = v => v === null || v === undefined ? '—' : `${v > 0 ? '+' : ''}${v} %`;
  const row = (lbl, k) => `<tr><td>${lbl}</td><td>${f(bt.mean['3m'][k])}</td><td>${f(bt.mean['12m'][k])}</td><td>${bt.n[k] ?? 0} j</td></tr>`;
  const [sym, tip] = BT_LABEL[bt.verdict] || BT_LABEL.insuffisant;
  return `<div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);margin-bottom:10px">📊 Que s'est-il passé après ce signal ? (depuis ${bt.since})</div>
    <table class="bt-table"><thead><tr><th>Signal</th><th>${esc(asset.label.split(' (')[0])} à ${H['3m']}</th><th>à ${H['12m']}</th><th>Jours</th></tr></thead>
      <tbody>${row('Achat', 'buy')}${row('Neutre', 'neutral')}${row('Vente', 'sell')}</tbody></table>
    <p style="font-size:12px;color:var(--text-2);margin:10px 0 0;line-height:1.5"><strong>${sym}</strong> ${tip}. Référence : ${f(asset.baseline['3m'])} à ${H['3m']}, ${f(asset.baseline['12m'])} à ${H['12m']} en moyenne.</p>
    <p style="font-size:11px;color:var(--text-3);margin:6px 0 0;line-height:1.5">${APP.backtest.caveat}</p>
  </div>`;
}
async function loadBacktest() {
  try {
    const r = await fetch(`${BACKEND.replace(/\/$/, '')}/backtest.json`);
    if (r.ok) APP.backtest = await r.json();
  } catch (e) { console.warn('[backtest]', e.message); }
}

/* ── Groupes repliables ──────────────────────────────────────────── */
function isCollapsed(tab, name) {
  const o = _ls.get('ms_collapse', {})[`${tab}::${name}`];
  return o === undefined ? window.innerWidth <= 700 : o;     // replié par défaut sur mobile
}
function toggleCollapse(tab, name) {
  const m = _ls.get('ms_collapse', {});
  m[`${tab}::${name}`] = !isCollapsed(tab, name);
  _ls.set('ms_collapse', m);
  renderContent();
}
const ASSET_GROUPS = ['Ethereum (ETH)', 'Solana (SOL)', 'Hyperliquid (HYPE)'];
/* Verdict propre à un actif crypto : même vote pondéré que le verdict global, limité à son groupe */
function groupVerdictObj(g) {
  const live = g.indicators.filter(i => i.source === 'live');
  const ws = effectiveWeights(live);
  let b = 0, s = 0, t = 0;
  live.forEach((i, k) => { t += ws[k]; if (i.sig === 'buy') b += ws[k]; else if (i.sig === 'sell') s += ws[k]; });
  if (!t) return null;
  const bp = Math.round(b / t * 100), sp = Math.round(s / t * 100);
  return { bp, sp, sig: bp >= 45 ? 'buy' : sp >= 35 ? 'sell' : 'neutral' };
}
function groupVerdict(g) {
  const o = groupVerdictObj(g); if (!o) return '';
  const { bp, sp } = o;
  const v = o.sig === 'buy' ? ['buy', 'Achat'] : o.sig === 'sell' ? ['sell', 'Vente'] : ['neutral', 'Neutre'];
  return `<span class="grp-verdict gv-${v[0]}" title="Vote pondéré des indicateurs de cet actif : ${bp} % acheteurs, ${sp} % vendeurs">${v[1]} · ${bp}/${sp}</span>`;
}

function groupSummary(g, horizon) {
  const c = { buy: 0, sell: 0, neutral: 0 };
  g.indicators.forEach(i => { if (i.source === 'live') c[i.sig]++; });
  return (ASSET_GROUPS.includes(g.name) ? groupVerdict(g) : '') + `<span class="grp-sum"><span class="gs-buy">↑${c.buy}</span><span class="gs-sell">↓${c.sell}</span><span class="gs-neu">—${c.neutral}</span></span>`;
}

/* ── Liste de suivi + notifications (navigateur, quand la page est ouverte) ── */
const Watch = {
  ids() { return _ls.get('ms_watch', []); },
  has(id) { return this.ids().includes(id); },
  toggle(id) { const a = this.ids(), i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); _ls.set('ms_watch', a); },
};
function toggleWatch(id) { Watch.toggle(id); renderContent(); }
function starBtn(id) {
  const on = Watch.has(id);
  return `<button class="star ${on ? 'on' : ''}" title="${on ? 'Retirer de' : 'Ajouter à'} ma liste de suivi" aria-label="Suivre" onclick="event.stopPropagation();toggleWatch('${id}')">${on ? '★' : '☆'}</button>`;
}
function findAnywhere(id) {
  for (const tab of ['bourse', 'crypto', 'matieres']) {
    for (const g of (APP.data?.[tab] || [])) { const i = g.indicators.find(x => x.id === id); if (i) return { ...i, tab }; }
  }
  return null;
}
function renderWatchPanel() {
  const items = Watch.ids().map(findAnywhere).filter(Boolean);
  if (!items.length) return '';
  const perm = ('Notification' in window) ? Notification.permission : 'denied';
  const notifBtn = perm === 'default' ? '<button class="compare-btn" onclick="enableNotifs()">🔔 Activer les notifications</button>'
    : perm === 'granted' ? '<span class="watch-note">🔔 Notifications actives (page ouverte)</span>' : '';
  return `<div class="watch-panel"><div class="watch-head"><span>⭐ Ma liste de suivi</span>${notifBtn}</div>
    <div class="watch-list">${items.map(i => `<div class="watch-item" onclick="openTooltip('${i.id}')">
      <span class="watch-n">${i.name}</span><span class="watch-v">${i.source === 'live' ? i.raw + (i.unit || '') : 'n.d.'}</span>
      <span class="badge badge-${i.sig}" ${i.source === 'live' ? '' : 'style="opacity:.4"'}>${SIG[i.sig]}</span></div>`).join('')}</div></div>`;
}
function enableNotifs() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(() => renderContent());
}
function toast(msg) {
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; box.appendChild(t);
  setTimeout(() => t.remove(), 9000);
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification('MarketSense', { body: msg }); } catch {}
}
/* Compare avec les signaux vus à la dernière visite : recommandations des 3 onglets + indicateurs suivis */
function checkSignalChanges() {
  if (!APP.data) return;
  const prev = _ls.get('ms_lastsig', null), now = {}, msgs = [];
  for (const t of TABS) now[`tab:${t.id}`] = computeReco(APP.data[t.id], t.id, 'all').sig;
  Watch.ids().forEach(id => { const i = findAnywhere(id); if (i && i.source === 'live') now[id] = i.sig; });
  if (prev) {
    for (const [k, v] of Object.entries(now)) {
      if (prev[k] && prev[k] !== v) {
        const label = k.startsWith('tab:') ? `Recommandation ${TABS.find(t => t.id === k.slice(4)).label}` : findAnywhere(k).name;
        msgs.push(`${label} : ${SIG[prev[k]] || prev[k]} → ${SIG[v] || v}`);
      }
    }
  }
  _ls.set('ms_lastsig', now);
  msgs.forEach(toast);
}

/* ── Suivi réel : ce que les signaux PUBLIÉS par le site ont donné à terme ── */
async function loadTrack() {
  try {
    const r = await fetch(`${BACKEND.replace(/\/$/, '')}/trackrecord.json`);
    if (r.ok) APP.track = (await r.json()).resume;
  } catch (e) { console.warn('[suivi]', e.message); }
}
function renderTrack(tab) {
  const t = APP.track, v = t?.tabs?.[tab]?.global;
  if (!v) return '';
  const asset = t.assets?.[tab] || '';
  const f = c => (c && c.n) ? `${c.mean_pct > 0 ? '+' : ''}${c.mean_pct} % <span class="tk-n">(${c.n})</span>` : '—';
  const hs = [['1m', '1 mois'], ['3m', '3 mois'], ['6m', '6 mois'], ['12m', '12 mois']];
  const row = (lbl, k) => `<tr><td>${lbl}</td>${hs.map(([h]) => `<td>${f(v[h]?.[k])}</td>`).join('')}</tr>`;
  const since = t.depuis ? new Date(t.depuis).toLocaleDateString('fr-FR') : '—';
  const sigOk = v && t.tabs[tab].significatif !== undefined ? t.tabs[tab].significatif : t.significatif;
  const warn = sigOk ? '' : `<p class="tk-warn">⚠ Trop tôt pour conclure : seuls les signaux assez anciens sont évalués (il faut au moins ${t.seuil_significatif} par horizon pour que ce suivi soit parlant).</p>`;
  return `<details class="why"><summary>Suivi réel des signaux du site — ${esc(asset)}</summary>
    <p class="why-rule">Rendement moyen de ${esc(asset)} après chaque verdict publié par le site, depuis le ${since} (${t.jours_de_recul} jours de recul). Entre parenthèses : nombre de signaux évalués.</p>
    ${warn}
    <table class="bt-table"><thead><tr><th>Verdict</th>${hs.map(([, l]) => `<th>${l}</th>`).join('')}</tr></thead>
      <tbody>${row('Achat', 'buy')}${row('Neutre', 'neutral')}${row('Vente', 'sell')}</tbody></table>
    <p class="why-rule">Un bon signal d'achat devrait être suivi de meilleurs rendements qu'un signal de vente. Chaque ligne est un état du verdict global ; les journées voisines se ressemblent, donc l'échantillon réel est plus petit que les nombres affichés.</p>
  </details>`;
}


/* ── Niveaux de prix indicatifs (levels.json) ─────────────────────── */
async function loadLevels() {
  try {
    const r = await fetch(`${BACKEND.replace(/\/$/, '')}/levels.json`);
    if (r.ok) APP.levels = (await r.json()).actifs;
  } catch (e) { console.warn('[niveaux]', e.message); }
}
function fmtPx(v) {
  if (v == null || isNaN(v)) return '—';
  const d = v >= 1000 ? 0 : v >= 10 ? 1 : v >= 1 ? 2 : 4;
  return v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function renderLevels(key) {
  const L = APP.levels?.[key]; if (!L) return '';
  const row = (x, cls) => `<tr class="${cls}"><td>${esc(x.label)}</td><td>${fmtPx(x.prix)} $</td><td>${x.dist_pct > 0 ? '+' : ''}${x.dist_pct.toFixed(1)} %</td></tr>`;
  const res = [...(L.resistances || [])].reverse().map(x => row(x, 'lv-res')).join('');
  const sup = (L.supports || []).map(x => row(x, 'lv-sup')).join('');
  const rng = L.fourchette_2atr ? ` · zone de fluctuation normale (± 2 ATR) : ${fmtPx(L.fourchette_2atr[0])} – ${fmtPx(L.fourchette_2atr[1])} $` : '';
  return `<div class="lv"><div class="ai-h">Niveaux de prix indicatifs</div>
    <p class="ai-muted">Prix ${fmtPx(L.prix)} $ au ${new Date(L.date).toLocaleDateString('fr-FR')}${L.atr_pct ? ` · volatilité ${L.atr_pct.toFixed(1)} %/jour` : ''}${rng}</p>
    <table class="bt-table lv-table"><thead><tr><th>Repère</th><th>Niveau</th><th>Écart</th></tr></thead>
      <tbody>${res}<tr class="lv-now"><td>Prix actuel</td><td>${fmtPx(L.prix)} $</td><td></td></tr>${sup}</tbody></table>
    <p class="ai-muted">Repères où le prix a déjà réagi (plus hauts/bas récents, moyennes mobiles) : ce ne sont pas des prévisions, et ils cèdent parfois.</p></div>`;
}
