/* MarketSense — Grands investisseurs : Warren Buffett (Berkshire Hathaway, déclarations 13F) et Nancy Pelosi (transactions déclarées) */
'use strict';

const INV = { tab: 'buffett', buffett: undefined, pelosi: undefined, filter: 'all', all: false };

async function loadInvestors() {
  const base = BACKEND.replace(/\/$/, '');
  const get = async f => { try { const r = await fetch(`${base}/${f}`); return r.ok ? await r.json() : null; } catch { return null; } };
  [INV.buffett, INV.pelosi] = await Promise.all([get('buffett.json'), get('pelosi.json')]);
}

function openInvestors() {
  if (!gel('inv-modal')) {
    const o = document.createElement('div'); o.id = 'inv-overlay'; o.className = 'overlay'; o.style.display = 'none'; o.onclick = closeInvestors;
    const m = document.createElement('div'); m.id = 'inv-modal'; m.className = 'modal ai-modal inv-modal'; m.style.display = 'none';
    document.body.append(o, m);
  }
  gel('inv-overlay').style.display = 'block'; gel('inv-modal').style.display = 'flex';
  if (INV.buffett === undefined) { gel('inv-modal').innerHTML = '<div class="ai-body"><p class="ai-muted">Chargement…</p></div>'; loadInvestors().then(renderInvestors); }
  else renderInvestors();
}
function closeInvestors() {
  if (gel('inv-overlay')) { gel('inv-overlay').style.display = 'none'; gel('inv-modal').style.display = 'none'; }
}
function invTab(t) { INV.tab = t; renderInvestors(); }

const fmtMoney = v => v == null ? '—' : v >= 1e9 ? `${(v / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Md$` : v >= 1e6 ? `${(v / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} M$` : `${Math.round(v).toLocaleString('fr-FR')} $`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const invAge = d => { const n = Math.round((Date.now() - new Date(d).getTime()) / 86400000); return n < 1 ? "aujourd'hui" : `il y a ${n} j`; };

function renderInvestors() {
  const m = gel('inv-modal'); if (!m) return;
  const tabs = [['buffett', 'Warren Buffett'], ['pelosi', 'Nancy Pelosi']];
  m.innerHTML = `<div class="modal-header"><div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Informations publiques</div>
      <h2 class="modal-title">🏦 Grands investisseurs</h2></div><button class="icon-btn" onclick="closeInvestors()">✕</button></div>
    <div class="inv-tabs">${tabs.map(([k, l]) => `<button class="inv-tab ${INV.tab === k ? 'on' : ''}" onclick="invTab('${k}')">${l}</button>`).join('')}</div>
    <div class="ai-body inv-body">${INV.tab === 'buffett' ? renderBuffett(INV.buffett) : renderPelosi(INV.pelosi)}</div>`;
}

/* ── Warren Buffett ────────────────────────────────────────────────── */
function chTag(c) {
  if (!c) return '';
  if (c.type === 'nouveau') return '<span class="inv-tag up">Nouveau</span>';
  if (c.type === 'hausse') return `<span class="inv-tag up">+${c.pct} %</span>`;
  if (c.type === 'baisse') return `<span class="inv-tag down">${c.pct} %</span>`;
  return '<span class="inv-tag">Stable</span>';
}
function renderBuffett(b) {
  const links = `<p class="ai-muted">Sources et lectures :
    <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983&type=13F-HR" target="_blank" rel="noopener">déclarations 13F (SEC)</a> ·
    <a href="https://www.berkshirehathaway.com/letters/letters.html" target="_blank" rel="noopener">lettres aux actionnaires</a></p>`;
  if (!b || !b.holdings) {
    return `<p class="ai-resume">Les positions de Berkshire Hathaway ne sont pas encore disponibles dans le site.</p>
      <p class="ai-muted">Elles proviennent des déclarations 13F déposées à la SEC. Le serveur de mise à jour n'a pas pu les récupérer pour le moment : le site réessaie à chaque actualisation.</p>${links}`;
  }
  const f = b.filing || {};
  const k = b.comptes || {};
  const fl = k.flux_actions || {};
  const sgn = v => (v > 0 ? '+' : '') + fmtMoney(v).replace('-', '−');
  const net = o => o && o.achats != null && o.ventes != null ? o.achats - o.ventes : null;
  const flowLine = (lbl, o) => o && (o.achats != null || o.ventes != null)
    ? `<div><b>${lbl}</b> : ventes ${fmtMoney(o.ventes)} · achats ${fmtMoney(o.achats)} → <b>${net(o) > 0 ? 'acheteur net' : 'vendeur net'} de ${fmtMoney(Math.abs(net(o)))}</b></div>` : '';
  const dv = k.liquidites_total != null && k.liquidites_debut_annee ? k.liquidites_total - k.liquidites_debut_annee : null;
  const liquid = k.liquidites_total != null ? `<div class="inv-box"><div class="ai-h">Liquidités de Berkshire</div>
      <p class="ai-resume"><b>${fmtMoney(k.liquidites_total)}</b> au ${fmtDate(k.periode)} : trésorerie ${fmtMoney(k.tresorerie)} + bons du Trésor américain ${fmtMoney(k.bons_du_tresor)}.
      ${dv != null ? `<span class="ai-muted">(${sgn(dv)} depuis le début de l'année)</span>` : ''}</p>
      <p class="ai-muted">Chiffres exacts des comptes trimestriels (10-Q déposé le ${fmtDate(k.depose)}) ; une partie de la trésorerie sert aux activités d'exploitation (chemins de fer, énergie), elle n'est pas toute disponible pour investir.</p></div>` : '';
  const sales = (fl.trimestre || fl.depuis_debut_annee) ? `<div class="inv-box"><div class="ai-h">Achats et ventes d'actions (comptes de Berkshire)</div>
      <div class="inv-moves">${flowLine('Dernier trimestre', fl.trimestre)}${flowLine(`Depuis le début de l'année (${fl.depuis_debut_annee?.mois || '?'} mois)`, fl.depuis_debut_annee)}${flowLine('Même période, an dernier', fl.meme_periode_annee_precedente)}
      ${fl.depuis_debut_annee?.rachats ? `<div><b>Rachats de ses propres actions</b> depuis le début de l'année : ${fmtMoney(fl.depuis_debut_annee.rachats)}</div>` : ''}</div>
      <p class="ai-muted">Il s'agit de tous les titres cotés détenus par les filiales d'assurance et autres, pas seulement des positions du 13F.</p></div>` : '';
  const fe = b.flux_estimes;
  const est = fe ? `<p class="ai-muted">Estimation d'après le 13F, trimestre clos le ${fmtDate(f.period)} (variation du nombre de titres × cours de fin de trimestre) : achats ≈ ${fmtMoney(fe.achats)}, ventes ≈ ${fmtMoney(fe.ventes)}. C'est une approximation : les prix réels d'exécution et les opérations dans le trimestre ne sont pas connus.</p>` : '';
  const rows = b.holdings.slice(0, 20).map(h => `<tr><td>${esc(h.name)}${h.ticker ? ` <span class="ai-muted">${esc(h.ticker)}</span>` : ''}</td>
    <td class="r">${h.pct != null ? h.pct.toFixed(1) + ' %' : '—'}</td><td class="r">${fmtMoney(h.value)}</td><td>${chTag(h.change)}</td></tr>`).join('');
  const moves = (t, lbl) => { const l = b.holdings.filter(h => h.change.type === t); return l.length ? `<div><b>${lbl}</b> : ${l.map(h => esc(h.name) + (h.change.pct != null ? ` (${h.change.pct > 0 ? '+' : ''}${h.change.pct} %` : ' (') + (h.delta_value ? `${h.change.pct != null ? ', ' : ''}≈ ${h.delta_value > 0 ? '+' : '−'}${fmtMoney(Math.abs(h.delta_value))}` : '') + ')').join(', ')}</div>` : ''; };
  const sold = (b.sold_out || []).length ? `<div><b>Positions soldées</b> : ${b.sold_out.map(s => `${esc(s.name)} (≈ −${fmtMoney(s.value)})`).join(', ')}</div>` : '';
  return `<div class="inv-cards">
      <div><span>Portefeuille actions US</span><b>${fmtMoney(b.total_value)}</b></div>
      <div><span>Positions</span><b>${b.n_positions}</b></div>
      <div><span>5 premières lignes</span><b>${b.top5_pct} %</b></div>
      <div><span>Trimestre déclaré</span><b>${fmtDate(f.period)}</b></div>
    </div>
    <p class="ai-muted">Déclaration déposée le ${fmtDate(f.filed)} (${invAge(f.filed)}), comparée au trimestre précédent (${fmtDate(b.previous?.period)}). ${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">Voir le dépôt SEC</a>` : ''}</p>
    ${liquid}${sales}${est}
    ${b.buffett_indicator ? `<p class="ai-resume">Indicateur de Buffett (actions US / PIB, approximation à partir des données de la Fed) : <b>${b.buffett_indicator} %</b> <span class="ai-muted">— repère de valorisation globale ; au-delà d'environ 140 %, le marché est historiquement cher, sans indication de timing.</span></p>` : ''}
    <div class="ai-h">Principales positions</div>
    <div style="overflow-x:auto"><table class="jr-list"><thead><tr><th>Titre</th><th class="r">Poids</th><th class="r">Valeur</th><th>vs trimestre précédent</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="inv-moves">${moves('nouveau', 'Nouvelles positions')}${moves('hausse', 'Renforcées')}${moves('baisse', 'Allégées')}${sold}</div>
    <div class="ai-h">À savoir avant d'interpréter</div>
    <ul class="ai-list"><li>Un 13F est une photo à la fin d'un trimestre, publiée jusqu'à 45 jours plus tard : les positions ont pu changer depuis.</li>
      <li>Il ne couvre que les actions cotées aux États-Unis : ni la trésorerie, ni les entreprises détenues en direct, ni les positions hors États-Unis.</li>
      <li>Cela décrit ce que fait Berkshire, avec ses contraintes (taille, horizon de décennies, fiscalité), pas ce qui vous convient.</li></ul>${links}`;
}

/* ── Nancy Pelosi ──────────────────────────────────────────────────── */
function renderPelosi(p) {
  const src = '<p class="ai-muted">Source officielle : <a href="https://disclosures-clerk.house.gov/FinancialDisclosure" target="_blank" rel="noopener">greffe de la Chambre des représentants</a> (déclarations de transactions, loi STOCK Act).</p>';
  if (!p || !p.trades) {
    return `<p class="ai-resume">Les transactions déclarées ne sont pas encore disponibles dans le site.</p>
      <p class="ai-muted">Elles proviennent des PDF publiés par la Chambre ; le site réessaie à chaque actualisation.</p>${src}`;
  }
  const T = p.trades;
  const buys = T.filter(t => t.type === 'achat'), sells = T.filter(t => t.type.startsWith('vente'));
  const delays = T.map(t => t.delay_days).filter(x => x != null && x >= 0);
  const avgDelay = delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : null;
  const count = {}; T.forEach(t => { const k = t.ticker || t.asset; count[k] = (count[k] || 0) + 1; });
  const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${esc(k)} (${n})`).join(', ');
  const flt = { all: () => true, buy: t => t.type === 'achat', sell: t => t.type.startsWith('vente'), opt: t => t.option }[INV.filter] || (() => true);
  const list = T.filter(flt);
  const shown = INV.all ? list : list.slice(0, 25);
  const rows = shown.map(t => `<tr><td>${fmtDate(t.date)}<br><span class="ai-muted">déclaré le ${fmtDate(t.filed)}${t.delay_days != null ? ` (+${t.delay_days} j)` : ''}</span></td>
    <td>${esc(t.asset)}${t.ticker ? ` <span class="ai-muted">${esc(t.ticker)}</span>` : ''}${t.option ? ' <span class="inv-tag">option</span>' : ''}<br><span class="ai-muted">${esc(t.owner)}</span>${t.description ? `<br><span class="ai-muted">${esc(t.description.slice(0, 110))}</span>` : ''}</td>
    <td><span class="inv-tag ${t.type === 'achat' ? 'up' : 'down'}">${esc(t.type)}</span></td><td>${esc(t.amount)}</td>
    <td class="r">${t.since_pct != null ? `<span class="${t.since_pct >= 0 ? 'jr-pos' : 'jr-neg'}">${t.since_pct > 0 ? '+' : ''}${t.since_pct} %</span>` : '—'}</td></tr>`).join('');
  const docs = p.documents || {};
  const miss = (docs.image || 0) + (docs.erreur || 0) + (docs.vide || 0);
  const fb = (k, l) => `<button class="inv-tab ${INV.filter === k ? 'on' : ''}" onclick="INV.filter='${k}';INV.all=false;renderInvestors()">${l}</button>`;
  return `<div class="inv-cards">
      <div><span>Transactions lues</span><b>${T.length}</b></div>
      <div><span>Achats / ventes</span><b>${buys.length} / ${sells.length}</b></div>
      <div><span>Délai moyen de déclaration</span><b>${avgDelay != null ? avgDelay + ' j' : '—'}</b></div>
      <div><span>Période</span><b>${fmtDate(p.first)} → ${fmtDate(p.last)}</b></div>
    </div>
    <p class="ai-muted">Titres les plus traités : ${top || '—'}. Mis à jour ${invAge(p.generated)}.${p.pending ? ` Lecture en cours : ${p.pending} déclaration(s) restante(s).` : ''}${miss ? ` ${miss} document(s) non lisible(s) automatiquement : <a href="https://disclosures-clerk.house.gov/FinancialDisclosure" target="_blank" rel="noopener">à consulter à la source</a>.` : ''}</p>
    <div class="inv-tabs">${fb('all', 'Tout')}${fb('buy', 'Achats')}${fb('sell', 'Ventes')}${fb('opt', 'Options')}</div>
    <div style="overflow-x:auto"><table class="jr-list"><thead><tr><th>Date</th><th>Actif</th><th>Opération</th><th>Montant (tranche)</th><th class="r" title="Évolution du cours depuis le jour de l'opération (actions uniquement)">Cours depuis</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${list.length > 25 ? `<p><button class="link-btn" onclick="INV.all=!INV.all;renderInvestors()">${INV.all ? 'Réduire' : `Voir les ${list.length} transactions`}</button></p>` : ''}
    <div class="ai-h">À savoir avant d'interpréter</div>
    <ul class="ai-list"><li>Les opérations sont déclarées jusqu'à 45 jours après coup : ce que vous voyez est déjà du passé, parfois ancien.</li>
      <li>Les montants sont des tranches, pas des valeurs exactes. Beaucoup d'opérations concernent le conjoint ou des comptes joints (colonne « propriétaire »).</li>
      <li>Les options (achat de calls, par exemple) sont des paris à levier dont le but exact n'est pas connu ; elles ne se lisent pas comme un achat d'actions.</li>
      <li>« Cours depuis » montre seulement ce que le titre a fait depuis l'opération ; ce n'est pas le résultat réel du portefeuille. Les études sur l'intérêt de suivre ces déclarations donnent des résultats partagés.</li></ul>${src}`;
}
