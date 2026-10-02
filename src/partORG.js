/* =========================================================
   WORKSPACE SETTINGS: company type, stage and regions, set once and used by every tool
   One vocabulary everywhere: the company types and stages below are the only ones the tools show.
   ========================================================= */
const ORG_TYPES = TT_TYPES.filter(t => t.k !== "all");
const ORG_STAGES = [
  {k:"early", n:"Early stage", d:"A founder or first safety hire, usually under a million users"},
  {k:"growth", n:"Growing", d:"A dedicated safety team, millions of users, new markets on the way"},
  {k:"scale", n:"At scale or regulated", d:"Tens of millions of users, or extra duties under EU or UK law"}
];
// How the shared settings map onto each tool's own options
const ORG_MAP = {
  mx:{social:"social", marketplace:"market", fintech:"fintech", gaming:"gaming", dating:"dating", genai:"genai", gig:"gig", kids:"kids"},
  pm:{social:"social", marketplace:"marketplace", fintech:"fintech", gaming:"gaming", dating:"dating", genai:"genai", gig:"gig", kids:"edtech"},
  mxStage:{early:"1", growth:"2", scale:"3"}
};
Object.assign(MX_PLATFORMS, {social:"Social media & video", market:"Marketplace & e-commerce", genai:"Generative AI"});
Object.assign(MX_STAGE, {"1":"Early stage", "2":"Growing", "3":"At scale or regulated"});
const orgGet = () => store.get("ws:org", null) || {};
const orgSet = o => { store.set("ws:org", Object.assign({}, orgGet(), o)); if(typeof jnSync === "function") jnSync(); };
const orgReady = () => { const o = orgGet(); return !!(o.type && o.stage); };
const orgTypeName = k => (ORG_TYPES.find(t => t.k === k) || {n:""}).n;
const orgStageName = k => (ORG_STAGES.find(s => s.k === k) || {n:""}).n;
// A new pre-mortem starts from the workspace's product type and regions; the person can change either
function orgPrefillPM(p){
  const o = orgGet(); if(!o.type && !o.youth && !(o.regions && o.regions.length)) return p;
  const prev = pm; pm = p;
  if(o.type && ORG_MAP.pm[o.type]){ setType(ORG_MAP.pm[o.type]); pm.answered.type = true; }
  if(o.youth && YOUTH.some(y => y.k === o.youth)){ pm.youth = o.youth; pm.answered.youth = true; }
  if(o.regions && o.regions.length){ pm.regions = o.regions.slice(); pm.answered.regions = true; }
  pm.fromOrg = true; const out = pm; pm = prev; return out;
}
// cta: the first step of the program review, which ends with an explicit "Save and continue" so regions aren't skipped
function orgCardHTML(cta){
  const o = orgGet(), regions = o.regions || [];
  return `<div class="card org-card" ${cta ? 'data-cta="1"' : ""}><div class="card-b org-b">
    <div><h3>Your organization</h3><p class="note">Set it once and every tool starts from it: new pre-mortems, tabletop scenarios, maturity targets, coverage areas, metrics, policy tests and the AI assistants. Change it any time.</p></div>
    <div class="field"><label for="org-type">Company type</label><select class="select" id="org-type" data-org="type"><option value="">Choose one</option>${ORG_TYPES.map(t => `<option value="${t.k}" ${o.type === t.k ? "selected" : ""}>${esc(t.n)}</option>`).join("")}</select></div>
    <div class="field"><label for="org-youth">Who can use it</label><select class="select" id="org-youth" data-org="youth"><option value="">Choose one</option>${YOUTH.map(y => `<option value="${y.k}" ${o.youth === y.k ? "selected" : ""}>${esc(y.n)}</option>`).join("")}</select></div>
    <div class="field"><span class="lbl">Stage</span><div class="org-stages" role="radiogroup" aria-label="Stage">${ORG_STAGES.map(s => `<button type="button" role="radio" aria-checked="${o.stage === s.k}" class="org-stage ${o.stage === s.k ? "on" : ""}" data-orgstage="${s.k}" title="${esc(s.d)}">${esc(s.n)}</button>`).join("")}</div></div>
    <div class="field"><span class="lbl">Where your users are</span><div class="org-regions">${REGIONS.map(r => `<button type="button" class="pol-chip" aria-pressed="${regions.includes(r.k)}" data-orgregion="${r.k}" title="${esc(r.n)}">${r.k.toUpperCase()}</button>`).join("")}</div></div>
    ${!cta && typeof cvOff === "function" ? `<div class="field org-harms"><span class="lbl">Harm areas that apply</span><div class="org-regions">${CV_AREAS.map(a => `<button type="button" class="pol-chip" aria-pressed="${!cvOff().includes(a.k)}" data-orgharm="${a.k}">${esc(a.n)}</button>`).join("")}</div>
      <small class="note">All apply by default. Turn off any your platform can't have, and Coverage radar and its grade leave them out.</small></div>` : ""}
  </div>${cta ? `<div class="org-cta"><span class="note">${orgReady() ? (regions.length ? "Saved as you go. Change any of it later in My workspace." : "Add where your users are, so law maps and pre-mortems match your markets.") : "Choose a company type and a stage to continue."}</span><button type="button" class="btn primary" data-orgdone="1" ${orgReady() ? "" : "disabled"}>Save and continue ${icon("arrow")}</button></div>` : ""}</div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-orgstage],[data-orgregion],[data-orgharm]"); if(!b) return;
  if(b.dataset.orgstage) orgSet({stage:b.dataset.orgstage});
  if(b.dataset.orgregion){ const cur = orgGet().regions || [], k = b.dataset.orgregion; orgSet({regions:cur.includes(k) ? cur.filter(x => x !== k) : cur.concat(k)}); }
  if(b.dataset.orgharm && !cvSetOff(b.dataset.orgharm, b.getAttribute("aria-pressed") === "true")) return gsay("Keep at least three harm areas so Coverage radar can compare them");
  const card = b.closest(".org-card"); if(card){ card.outerHTML = orgCardHTML(!!card.dataset.cta); const again = document.querySelector(`[data-orgstage="${b.dataset.orgstage}"],[data-orgregion="${b.dataset.orgregion}"],[data-orgharm="${b.dataset.orgharm}"]`); if(again) again.focus(); }
  gsay(b.dataset.orgharm ? `${CV_AREAS.find(a => a.k === b.dataset.orgharm).n} ${cvOff().includes(b.dataset.orgharm) ? "left out of" : "added back to"} Coverage radar` : "Workspace settings saved");
});
document.addEventListener("change", e => { const t = e.target; if(t.dataset && (t.dataset.org === "type" || t.dataset.org === "youth")){ orgSet({[t.dataset.org]:t.value || null}); if(t.dataset.org === "type") store.set("tt:type", null); gsay("Workspace settings saved");
  const card = t.closest(".org-card"); if(card && card.dataset.cta){ card.outerHTML = orgCardHTML(true); const again = document.getElementById(t.id); if(again) again.focus(); } } });
// The first review step is done when the person says so, then they go straight on to the next one
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-orgdone]"); if(!b || !orgReady()) return;
  orgSet({confirmed:true}); gsay("Workspace set up. Every tool will use it"); const next = typeof jnNext === "function" && jnNext(); if(next) jnGo(next.k); else renderOverview(); });

/* ---------- New: start any assessment from the top bar ---------- */
const NEW_ITEMS = [
  ["premortem", "radar", "var(--t-pm)", "Abuse pre-mortem", "Assess a product or feature before launch", () => newAssessment()],
  ["maturity", "steps", "var(--t-ma)", "Program maturity", "Rate your program in eight areas", () => goRoute("maturity")],
  ["coverage", "cover", "var(--t-cv)", "Coverage radar", "Map your defenses against risk", () => goRoute("coverage")],
  ["tabletop", "siren", "var(--t-tt)", "Incident tabletop", "Rehearse a crisis, step by step", () => { tt = null; store.set("tt", null); goRoute("tabletop"); }],
  ["policy", "doc", "var(--t-pol)", "Policy stress-tester", "Find where a rule is unclear", () => goRoute("policy")],
  ["coppa", "coppa", "var(--t-cp)", "COPPA readiness", "Check children's privacy against the amended Rule", () => { if(cp.ex){ cp = CP_BLANK(); cpSave(); store.set("ws:cur:coppa", null); } goRoute("coppa"); }],
  ["dsa", "dsa", "var(--t-ds)", "DSA readiness", "Find which EU Digital Services Act duties apply", () => { if(ds.ex){ ds = DS_BLANK(); dsSave(); store.set("ws:cur:dsa", null); } goRoute("dsa"); }],
  ["eval", "eval", "var(--t-ai)", "Classifier eval", "Test a moderation classifier against your rule", () => { if(ev.ex){ ev = EV_BLANK(); evSave(); store.set("ws:cur:eval", null); } goRoute("eval"); }],
  ["vendors", "scale", "var(--t-vd)", "Vendor scorecard", "Score moderation vendors on evidence", () => goRoute("vendors")]
];
function newMenuToggle(open){
  const m = $("#tb-menu"), b = $("#tb-new"); if(!m || !b) return;
  const show = open === undefined ? m.hidden : open;
  m.hidden = !show; b.setAttribute("aria-expanded", show);
  if(show){ const f = m.querySelector("[role=menuitem]"); if(f) f.focus(); }
}
{
  const m = $("#tb-menu");
  if(m && m.innerHTML !== undefined){
    m.innerHTML = NEW_ITEMS.map(([k, ic, c, n, d], i) => `<button type="button" role="menuitem" data-new="${i}"><span class="sb-glyph" style="background:${c}"><svg><use href="#i-${ic}"/></svg></span><span><b>${n}</b><small>${d}</small></span></button>`).join("");
    m.addEventListener("click", e => { const b = e.target.closest("[data-new]"); if(!b) return; newMenuToggle(false); NEW_ITEMS[+b.dataset.new][5](); });
    m.addEventListener("keydown", e => {
      const items = [...m.querySelectorAll("[role=menuitem]")], i = items.indexOf(document.activeElement);
      if(e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus(); }
      if(e.key === "Escape"){ e.preventDefault(); newMenuToggle(false); $("#tb-new").focus(); }
    });
    document.addEventListener("click", e => { if(!m.hidden && !e.target.closest("#tb-menu") && !e.target.closest("#tb-new")) newMenuToggle(false); });
  }
}

/* ---------- Overview header: your status once you've started, the library's scale before ---------- */
function ovHeroChips(){
  const parts = typeof rcParts === "function" ? rcParts() : [], o = parts.length ? rcOverall(parts) : {score:null};
  const pms = Object.values(wsItems()).filter(it => it.kind === "premortem").length, org = orgGet();
  if(o.score === null && !pms) return [HARMS.length + " abuse risks", SCENARIOS.length + " crisis scenarios", "8 program areas", (typeof AI_TOOLS !== "undefined" ? Object.values(AI_TOOLS).filter(t => !t.wip).length + 1 : 1) + " AI assistants"];
  const out = [];
  if(o.score !== null) out.push(`Grade ${rcGrade(o.score)[1]} · ${o.score}/100`);
  if(pms) out.push(`${pms} product${pms === 1 ? "" : "s"} assessed`);
  const m = parts.find(p => p.k === "maturity"); if(m && m.score !== null) out.push(`Maturity ${maScore(ma).toFixed(1)} of 5`);
  if(org.type) out.push(orgTypeName(org.type) + (org.stage ? " · " + orgStageName(org.stage) : ""));
  return out;
}
