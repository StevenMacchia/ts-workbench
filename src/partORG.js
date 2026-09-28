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
const orgSet = o => store.set("ws:org", Object.assign({}, orgGet(), o));
const orgReady = () => { const o = orgGet(); return !!(o.type && o.stage); };
const orgTypeName = k => (ORG_TYPES.find(t => t.k === k) || {n:""}).n;
const orgStageName = k => (ORG_STAGES.find(s => s.k === k) || {n:""}).n;
// A new pre-mortem starts from the workspace's product type and regions; the person can change either
function orgPrefillPM(p){
  const o = orgGet(); if(!o.type && !(o.regions && o.regions.length)) return p;
  const prev = pm; pm = p;
  if(o.type && ORG_MAP.pm[o.type]){ setType(ORG_MAP.pm[o.type]); pm.answered.type = true; }
  if(o.regions && o.regions.length){ pm.regions = o.regions.slice(); pm.answered.regions = true; }
  pm.fromOrg = true; const out = pm; pm = prev; return out;
}
function orgCardHTML(){
  const o = orgGet(), regions = o.regions || [];
  return `<div class="card org-card"><div class="card-b org-b">
    <div><h3>Your organization</h3><p class="note">Used to pre-fill every tool: tabletop scenarios, maturity targets, metrics, policy tests and new pre-mortems. Change it any time.</p></div>
    <div class="field"><label for="org-type">Company type</label><select class="select" id="org-type" data-org="type"><option value="">Choose one</option>${ORG_TYPES.map(t => `<option value="${t.k}" ${o.type === t.k ? "selected" : ""}>${esc(t.n)}</option>`).join("")}</select></div>
    <div class="field"><span class="lbl">Stage</span><div class="org-stages" role="radiogroup" aria-label="Stage">${ORG_STAGES.map(s => `<button type="button" role="radio" aria-checked="${o.stage === s.k}" class="org-stage ${o.stage === s.k ? "on" : ""}" data-orgstage="${s.k}" title="${esc(s.d)}">${esc(s.n)}</button>`).join("")}</div></div>
    <div class="field"><span class="lbl">Where your users are</span><div class="org-regions">${REGIONS.map(r => `<button type="button" class="pol-chip" aria-pressed="${regions.includes(r.k)}" data-orgregion="${r.k}" title="${esc(r.n)}">${r.k.toUpperCase()}</button>`).join("")}</div></div>
  </div></div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-orgstage],[data-orgregion]"); if(!b) return;
  if(b.dataset.orgstage) orgSet({stage:b.dataset.orgstage});
  if(b.dataset.orgregion){ const cur = orgGet().regions || [], k = b.dataset.orgregion; orgSet({regions:cur.includes(k) ? cur.filter(x => x !== k) : cur.concat(k)}); }
  const card = b.closest(".org-card"); if(card){ card.outerHTML = orgCardHTML(); const again = document.querySelector(`[data-orgstage="${b.dataset.orgstage}"],[data-orgregion="${b.dataset.orgregion}"]`); if(again) again.focus(); }
  gsay("Workspace settings saved");
});
document.addEventListener("change", e => { const t = e.target; if(t.dataset && t.dataset.org === "type"){ orgSet({type:t.value || null}); gsay("Workspace settings saved"); } });

/* ---------- New: start any assessment from the top bar ---------- */
const NEW_ITEMS = [
  ["premortem", "radar", "var(--t-pm)", "Abuse pre-mortem", "Assess a product or feature before launch", () => newAssessment()],
  ["maturity", "steps", "var(--t-ma)", "Program maturity", "Rate your program in eight areas", () => goRoute("maturity")],
  ["coverage", "cover", "var(--t-cv)", "Coverage radar", "Map your defenses against risk", () => goRoute("coverage")],
  ["tabletop", "siren", "var(--t-tt)", "Tabletop exercise", "Rehearse a crisis, step by step", () => { tt = null; store.set("tt", null); goRoute("tabletop"); }],
  ["policy", "doc", "var(--t-pol)", "Policy test", "Find where a rule is unclear", () => goRoute("policy")],
  ["vendors", "scale", "var(--t-vd)", "Vendor comparison", "Score moderation vendors on evidence", () => goRoute("vendors")]
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
