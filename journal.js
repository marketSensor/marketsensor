/* MarketSense — Journal de décisions : vos achats/ventes face aux signaux du site (stocké dans ce navigateur) */
'use strict';

const JR_ASSETS = {
  spx:  { label: 'Bourse (S&P 500 / ETF actions)', tab: 'bourse' },
  btc:  { label: 'Bitcoin', tab: 'crypto' },
  eth:  { label: 'Ethereum', group: 'Ethereum (ETH)' },
  sol:  { label: 'Solana', group: 'Solana (SOL)' },
  hype: { label: 'Hyperliquid (HYPE)', group: 'Hyperliquid (HYPE)' },
  gold: { label: 'Or', tab: 'matieres' },
};
const JR_SIG = { buy: 'achat', sell: 'vente', neutral: 'neutre' };
const Journal = {
  get list() { return _ls.get('ms_journal', []); },
  set list(v) { _ls.set('ms_journal', v); },
};

/* Verdict que le site affichait pour cet actif à l'instant T */
function jrSiteVerdict(key) {
  const a = JR_ASSETS[key]; if (!a || !APP.data) return null;
  try {
    if (a.tab) { const r = computeReco(APP.data[a.tab], a.tab, 'all'); return { sig: r.sig, bp: r.bp, sp: r.sp }; }
    const g = APP.data.crypto.find(x => x.name === a.group);
    return g ? groupVerdictObj(g) : null;
  } catch { return null; }
}
const jrPrice = key => APP.levels?.[key]?.prix ?? null;

function openJournal() {
  if (!gel('jr-modal')) {
    const o = document.createElement('div'); o.id = 'jr-overlay'; o.className = 'overlay'; o.style.display = 'none'; o.onclick = closeJournal;
    const m = document.createElement('div'); m.id = 'jr-modal'; m.className = 'modal ai-modal'; m.style.display = 'none';
    document.body.append(o, m);
  }
  gel('jr-overlay').style.display = 'block'; gel('jr-modal').style.display = 'flex';
  renderJournal();
}
function closeJournal() {
  if (gel('jr-overlay')) { gel('jr-overlay').style.display = 'none'; gel('jr-modal').style.display = 'none'; }
}

function jrEval(e) {
  const cur = jrPrice(e.asset);
  if (!cur || !e.price) return null;
  const move = (cur / e.price - 1) * 100;                 // évolution du prix depuis la décision
  return { move, good: e.side === 'buy' ? move : -move };  // achat : gain ; vente : baisse évitée
}

function renderJournal() {
  const m = gel('jr-modal'); if (!m) return;
  const list = Journal.list.slice().sort((a, b) => b.ts - a.ts);
  const buckets = { aligned: [], neutral: [], against: [] };
  list.forEach(e => {
    const ev = jrEval(e); if (!ev) return;
    const k = e.sig === 'neutral' || !e.sig ? 'neutral' : (e.sig === e.side ? 'aligned' : 'against');
    buckets[k].push(ev.good);
  });
  const avg = a => a.length ? `${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1)} %` : '—';
  const cell = (lbl, a, tip) => `<div title="${esc(tip)}">${lbl}<b>${a.length} · ${avg(a)}</b></div>`;
  const rows = list.map(e => {
    const ev = jrEval(e);
    const res = ev ? `<span class="${ev.good >= 0 ? 'jr-pos' : 'jr-neg'}">${ev.good >= 0 ? '+' : ''}${ev.good.toFixed(1)} %</span><br><span class="ai-muted">prix ${ev.move >= 0 ? '+' : ''}${ev.move.toFixed(1)} %</span>` : '—';
    const align = !e.sig ? '—' : e.sig === 'neutral' ? 'site neutre' : e.sig === e.side ? 'dans le sens du site' : 'contre le site';
    return `<tr><td>${new Date(e.ts).toLocaleDateString('fr-FR')}</td>
      <td>${esc(JR_ASSETS[e.asset]?.label || e.asset)}<br><span class="jr-tag">${e.side === 'buy' ? 'Achat' : 'Vente'} à ${fmtPx(e.price)} $</span>${e.amount ? ` <span class="ai-muted">${esc(e.amount)} €</span>` : ''}</td>
      <td><span class="ai-muted">${align}</span>${e.note ? `<br>${esc(e.note)}` : ''}</td><td>${res}</td>
      <td><button class="link-btn" onclick="jrDelete('${esc(e.id)}')" title="Supprimer">✕</button></td></tr>`;
  }).join('');
  m.innerHTML = `<div class="modal-header"><div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Journal</div>
      <h2 class="modal-title">📓 Mes décisions face au site</h2></div><button class="icon-btn" onclick="closeJournal()">✕</button></div>
    <div class="ai-body">
      <p class="ai-muted">Notez chaque achat ou vente réel. Le site garde le verdict qu'il affichait à ce moment-là et compare ensuite avec le prix actuel. Les données restent dans ce navigateur (pensez à l'export pour les sauvegarder).</p>
      <div class="jr-grid">
        <select id="jr-asset" class="text-input" onchange="gel('jr-price').dataset.touched='';jrFillPrice()">${Object.entries(JR_ASSETS).map(([k, a]) => `<option value="${k}">${esc(a.label)}</option>`).join('')}</select>
        <select id="jr-side" class="text-input"><option value="buy">J'ai acheté</option><option value="sell">J'ai vendu</option></select>
        <input id="jr-price" class="text-input" type="number" step="any" min="0" placeholder="Prix ($)" />
        <input id="jr-amount" class="text-input" type="number" step="any" min="0" placeholder="Montant (€, facultatif)" />
      </div>
      <input id="jr-note" class="text-input" placeholder="Note (facultatif) : pourquoi cette décision ?" maxlength="200" />
      <div class="ai-row"><button class="btn-primary" onclick="jrAdd()">Ajouter au journal</button>
        <span class="ai-muted" id="jr-msg"></span></div>
      ${list.length ? `<div class="jr-sum">
        ${cell('Dans le sens du site', buckets.aligned, "Nombre de décisions et résultat moyen quand vous avez suivi le verdict du site")}
        ${cell('Site neutre', buckets.neutral, "Décisions prises quand le site n'avait pas d'avis tranché")}
        ${cell('Contre le site', buckets.against, "Décisions à l'opposé du verdict du site")}</div>
        <p class="ai-muted">Résultat = gain pour un achat, baisse évitée pour une vente (prix actuel issu du dernier calcul du site). Échantillon petit tant que vous n'avez pas des dizaines de décisions : ne tirez pas de conclusion trop tôt.</p>
        <div style="overflow-x:auto"><table class="jr-list"><thead><tr><th>Date</th><th>Décision</th><th>Contexte</th><th>Résultat</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
        : '<p class="ai-muted">Aucune décision enregistrée pour le moment.</p>'}
      <div class="ai-tools"><button class="link-btn" onclick="jrExport()">Exporter (JSON)</button>
        <label class="link-btn" style="cursor:pointer">Importer<input type="file" accept="application/json" style="display:none" onchange="jrImport(this.files[0])"></label></div>
    </div>`;
  jrFillPrice();
}

function jrFillPrice() {
  const a = gel('jr-asset')?.value, p = jrPrice(a), el = gel('jr-price');
  if (el && p && !el.dataset.touched) el.value = p >= 100 ? p.toFixed(1) : p.toPrecision(4);
  if (el && !el.dataset.bound) { el.dataset.bound = 1; el.oninput = () => { el.dataset.touched = 1; }; }
  if (el && el.dataset.touched && gel('jr-asset')) { /* l'utilisateur a saisi un prix : on le garde */ }
}
function jrAdd() {
  const asset = gel('jr-asset').value, side = gel('jr-side').value, price = parseFloat(gel('jr-price').value);
  if (!(price > 0)) { gel('jr-msg').textContent = 'Indiquez un prix valide.'; return; }
  const v = jrSiteVerdict(asset);
  const e = { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), ts: Date.now(), asset, side, price,
              amount: gel('jr-amount').value.trim().slice(0, 12), note: gel('jr-note').value.trim().slice(0, 200),
              sig: v?.sig || null, bp: v?.bp ?? null, sp: v?.sp ?? null };
  Journal.list = [...Journal.list, e];
  renderJournal();
  const msg = gel('jr-msg'); if (msg) msg.textContent = v ? `Enregistré — le site affichait « ${JR_SIG[v.sig]} » à ce moment.` : 'Enregistré.';
}
function jrDelete(id) { Journal.list = Journal.list.filter(e => e.id !== id); renderJournal(); }
function jrExport() {
  const blob = new Blob([JSON.stringify(Journal.list, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'marketsense-journal.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function jrImport(file) {
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const arr = JSON.parse(rd.result);
      if (!Array.isArray(arr)) throw 0;
      const ok = arr.filter(e => e && JR_ASSETS[e.asset] && (e.side === 'buy' || e.side === 'sell') && e.price > 0 && e.ts)
                    .map(e => ({ id: String(e.id || e.ts), ts: +e.ts, asset: e.asset, side: e.side, price: +e.price,
                                 amount: String(e.amount || '').slice(0, 12), note: String(e.note || '').slice(0, 200),
                                 sig: ['buy', 'sell', 'neutral'].includes(e.sig) ? e.sig : null, bp: e.bp ?? null, sp: e.sp ?? null }));
      const have = new Set(Journal.list.map(e => e.id));
      Journal.list = [...Journal.list, ...ok.filter(e => !have.has(e.id))];
      renderJournal();
    } catch { const m = gel('jr-msg'); if (m) m.textContent = 'Fichier invalide.'; }
  };
  rd.readAsText(file);
}
