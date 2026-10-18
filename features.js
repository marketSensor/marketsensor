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
function btTag(id) {
  const bt = APP.backtest?.indicators?.[id];
  if (!bt) return '';
  const [sym, tip] = BT_LABEL[bt.verdict] || BT_LABEL.insuffisant;
  return `<span class="tag-bt bt-${bt.verdict}" title="${tip}">Passé ${sym}</span>`;
}
function btBlock(id) {
  const bt = APP.backtest?.indicators?.[id];
  if (!bt) return '';
  const f = v => v === null || v === undefined ? '—' : `${v > 0 ? '+' : ''}${v} %`;
  const row = (lbl, k) => `<tr><td>${lbl}</td><td>${f(bt.mean['63'][k])}</td><td>${f(bt.mean['252'][k])}</td><td>${bt.n[k] ?? 0} j</td></tr>`;
  const [sym, tip] = BT_LABEL[bt.verdict] || BT_LABEL.insuffisant;
  return `<div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);margin-bottom:10px">📊 Que s'est-il passé après ce signal ? (depuis ${bt.since})</div>
    <table class="bt-table"><thead><tr><th>Signal</th><th>S&amp;P 500 à 3 mois</th><th>à 12 mois</th><th>Jours</th></tr></thead>
      <tbody>${row('Achat', 'buy')}${row('Neutre', 'neutral')}${row('Vente', 'sell')}</tbody></table>
    <p style="font-size:12px;color:var(--text-2);margin:10px 0 0;line-height:1.5"><strong>${sym}</strong> ${tip}. Référence : ${f(APP.backtest.baseline['63'])} à 3 mois, ${f(APP.backtest.baseline['252'])} à 12 mois en moyenne.</p>
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
function groupSummary(g, horizon) {
  const c = { buy: 0, sell: 0, neutral: 0 };
  g.indicators.forEach(i => { if (i.source === 'live') c[i.sig]++; });
  return `<span class="grp-sum"><span class="gs-buy">↑${c.buy}</span><span class="gs-sell">↓${c.sell}</span><span class="gs-neu">—${c.neutral}</span></span>`;
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
