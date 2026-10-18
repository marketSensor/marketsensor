/* MarketSense — Assistant IA : analyse du jour par onglet + chat avec l'analyste */
'use strict';

const AI = {
  analysis: null, dossier: null, messages: [], busy: false,
  get key()   { try { return localStorage.getItem('ms_ai_key') || ''; } catch { return ''; } },
  set key(v)  { try { v ? localStorage.setItem('ms_ai_key', v) : localStorage.removeItem('ms_ai_key'); } catch {} },
  get model() { try { return localStorage.getItem('ms_ai_model') || 'claude-sonnet-5-5'; } catch { return 'claude-sonnet-5-5'; } },
  set model(v){ try { localStorage.setItem('ms_ai_model', v); } catch {} },
};

const DECISION = {
  acheter:                   { label: 'Acheter',                   cls: 'buy',     icon: '↑' },
  renforcer_progressivement: { label: 'Renforcer progressivement', cls: 'buy',     icon: '↗' },
  attendre:                  { label: 'Attendre',                  cls: 'neutral', icon: '—' },
  alleger:                   { label: 'Alléger',                   cls: 'sell',    icon: '↘' },
  vendre:                    { label: 'Vendre',                    cls: 'sell',    icon: '↓' },
};
const CONF = { faible: 'Confiance faible', moderee: 'Confiance modérée', forte: 'Confiance forte' };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function loadAnalysis() {
  const base = BACKEND.replace(/\/$/, '');
  try {
    const [a, d] = await Promise.all([fetch(`${base}/analysis.json`), fetch(`${base}/dossier.json`)]);
    if (a.ok) AI.analysis = await a.json();
    if (d.ok) AI.dossier = await d.json();
  } catch (e) { console.warn('[analyste]', e.message); }
}

function ageText(iso) {
  const h = (Date.now() - new Date(iso).getTime()) / 3600000;
  return h < 1 ? 'il y a moins d\'une heure' : h < 24 ? `il y a ${Math.round(h)} h` : `il y a ${Math.round(h / 24)} j`;
}

/* ── Carte « Analyste » de l'onglet affiché ──────────────────────── */
function renderAnalyst(tab) {
  const a = AI.analysis, m = a?.marches?.[tab];
  const tabLbl = TABS.find(t => t.id === tab)?.label || '';
  if (!m) {
    return `<div class="ai-card"><div class="ai-head"><span class="ai-title">🧠 Analyste — ${esc(tabLbl)}</span></div>
      <p class="ai-muted">L'analyse n'est pas encore disponible (elle est produite à chaque actualisation des données).</p></div>`;
  }
  const D = DECISION[m.decision] || DECISION.attendre;
  const isLlm = a.source === 'llm';
  const src = isLlm ? `Rédigée par Claude (${esc(a.modele || 'IA')}) · ${ageText(a.genere_le)}`
                    : `Analyse automatique à règles · ${ageText(a.genere_le)} — l'IA n'est pas activée`;
  const list = (arr, cls) => `<ul class="ai-list ${cls || ''}">${(arr || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const keys = (m.indicateurs_cles || []).map(id => {
    const i = findAnywhere(id);
    return i ? `<button class="ai-key" onclick="openTooltip('${esc(id)}')">${esc(i.name)}</button>` : '';
  }).join('');
  return `<div class="ai-card">
    <div class="ai-head">
      <span class="ai-title">🧠 Analyste — ${esc(tabLbl)}</span>
      <span class="ai-src ${isLlm ? 'llm' : ''}">${src}</span>
    </div>
    ${tab === APP.tab && a.synthese_globale ? `<p class="ai-global">${esc(a.synthese_globale)}</p>` : ''}
    <div class="ai-decision">
      <span class="ai-dec ai-dec-${D.cls}">${D.icon} ${D.label}</span>
      <span class="ai-conf">${CONF[m.confiance] || ''}</span>
    </div>
    <p class="ai-resume">${esc(m.resume)}</p>
    <div class="ai-cols">
      <div><div class="ai-h why-buy">Pour</div>${list(m.arguments_pour)}</div>
      <div><div class="ai-h why-sell">Contre</div>${list(m.arguments_contre)}</div>
    </div>
    <details class="ai-more">
      <summary>Risques, déclencheurs et plan d'action</summary>
      <div class="ai-h">Risques</div>${list(m.risques)}
      <div class="ai-h">Ce qui ferait changer la décision</div>${list(m.declencheurs)}
      <div class="ai-h">Plan d'action</div><p class="ai-resume">${esc(m.plan_action)}</p>
      ${keys ? `<div class="ai-h">Indicateurs décisifs</div><div class="ai-keys">${keys}</div>` : ''}
      <p class="ai-muted">${esc(a.qualite_des_donnees || '')}</p>
    </details>
    <div class="ai-foot">
      <button class="btn-primary ai-ask" onclick="openAssistant()">💬 Poser une question à l'analyste</button>
      <span class="ai-muted">${esc(a.avertissement || '')}</span>
    </div>
  </div>`;
}

/* ── Chat ────────────────────────────────────────────────────────── */
const SUGGESTIONS = ['Dois-je acheter maintenant ?', 'Quels sont les 3 risques principaux ?',
  'Qu\'est-ce qui me ferait vendre ?', 'Explique la divergence entre court et long terme'];

function mdLite(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*[-•]\s+(.*)$/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/<ul>[\s\S]*?<\/ul>/g, u => u.replace(/\n/g, ''))
    .replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
}

function ensureAssistantDom() {
  if (gel('ai-modal')) return;
  const o = document.createElement('div'); o.id = 'ai-overlay'; o.className = 'overlay'; o.style.display = 'none'; o.onclick = closeAssistant;
  const m = document.createElement('div'); m.id = 'ai-modal'; m.className = 'modal ai-modal'; m.style.display = 'none';
  document.body.append(o, m);
}
function openAssistant() {
  ensureAssistantDom();
  gel('ai-overlay').style.display = 'block'; gel('ai-modal').style.display = 'flex';
  renderAssistant();
}
function closeAssistant() {
  if (gel('ai-overlay')) { gel('ai-overlay').style.display = 'none'; gel('ai-modal').style.display = 'none'; }
}
function renderAssistant() {
  const m = gel('ai-modal'); if (!m) return;
  const head = `<div class="modal-header"><div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Assistant</div>
      <h2 class="modal-title">🧠 Analyste trader-investisseur</h2></div>
      <button class="icon-btn" onclick="closeAssistant()">✕</button></div>`;
  if (!AI.key) {
    m.innerHTML = head + `<div class="ai-body"><p class="ai-resume">Pour discuter avec l'analyste, collez votre clé API Anthropic. Elle reste dans votre navigateur (jamais envoyée ailleurs que chez Anthropic) et chaque question coûte quelques centimes au plus.</p>
      <input id="ai-key-input" class="text-input" type="password" placeholder="sk-ant-…" autocomplete="off" />
      <div class="ai-row"><button class="btn-primary" onclick="saveAiKey()">Enregistrer la clé</button></div>
      <p class="ai-muted">Sans clé, l'analyse du jour reste visible sur chaque onglet (analyse automatique ou rédigée par l'IA si activée côté serveur).</p></div>`;
    return;
  }
  const msgs = AI.messages.map(x => `<div class="ai-msg ai-${x.role}">${x.role === 'user' ? esc(x.content) : mdLite(x.content)}</div>`).join('');
  const sugg = AI.messages.length ? '' : `<div class="ai-sugg">${SUGGESTIONS.map(q => `<button onclick="askAssistant(this.textContent)">${esc(q)}</button>`).join('')}</div>`;
  m.innerHTML = head + `<div class="ai-body ai-chat" id="ai-chat">
      ${msgs || '<p class="ai-muted">Posez une question sur les marchés : l\'analyste connaît tous les indicateurs du site, leur fiabilité passée et son analyse du jour.</p>'}
      ${AI.busy ? '<div class="ai-msg ai-assistant ai-typing">L\'analyste réfléchit…</div>' : ''}${sugg}
    </div>
    <form class="ai-form" onsubmit="event.preventDefault();askAssistant(gel('ai-input').value)">
      <input id="ai-input" class="text-input" placeholder="Votre question…" autocomplete="off" ${AI.busy ? 'disabled' : ''} />
      <button class="btn-primary" ${AI.busy ? 'disabled' : ''}>Envoyer</button>
    </form>
    <div class="ai-tools"><span class="ai-muted">${esc(AI.model)}</span>
      <button class="link-btn" onclick="AI.messages=[];renderAssistant()">Nouvelle conversation</button>
      <button class="link-btn" onclick="AI.key='';renderAssistant()">Retirer la clé</button></div>`;
  const c = gel('ai-chat'); if (c) c.scrollTop = c.scrollHeight;
}
function saveAiKey() {
  const v = (gel('ai-key-input')?.value || '').trim();
  if (v) { AI.key = v; renderAssistant(); }
}

async function askAssistant(q) {
  q = (q || '').trim();
  if (!q || AI.busy || !AI.key) return;
  AI.messages.push({ role: 'user', content: q }); AI.busy = true; renderAssistant();
  const d = AI.dossier;
  const context = d
    ? `${d.consignes_chat}\n\nOnglet actuellement affiché : ${TABS.find(t => t.id === APP.tab)?.label}.\n\n=== DOSSIER (JSON) ===\n${JSON.stringify({ ...d, consignes_chat: undefined, analyse_du_jour: AI.analysis?.marches ? { source: AI.analysis.source, synthese_globale: AI.analysis.synthese_globale, marches: AI.analysis.marches } : undefined })}`
    : 'Tu es un analyste trader-investisseur. Le dossier de données est indisponible : dis-le et reste prudent.';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': AI.key, 'anthropic-version': '2023-06-01',
                 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: AI.model, max_tokens: 1500, system: context,
                             messages: AI.messages.slice(-12).map(({ role, content }) => ({ role, content })) }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(r.status === 401 ? 'Clé API refusée (401). Vérifiez-la.' : j?.error?.message || `Erreur ${r.status}`);
    AI.messages.push({ role: 'assistant', content: (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('') || '(réponse vide)' });
  } catch (e) {
    AI.messages.push({ role: 'assistant', content: `⚠ ${e.message || e}` });
  }
  AI.busy = false; renderAssistant();
}
