/* =========================================================
   MY WORKSPACE
   ========================================================= */
const KINDS = {
  premortem:{n:"Abuse pre-mortem", plural:"Pre-mortems", icon:"i-radar", route:"premortem", prefix:"TSW"},
  tabletop:{n:"Incident tabletop", plural:"Tabletops", icon:"i-siren", route:"tabletop", prefix:"TT"},
  metrics:{n:"Metrics framework", plural:"Metrics", icon:"i-gauge", route:"metrics", prefix:"MF"},
  vendors:{n:"Vendor scorecard", plural:"Vendor scorecards", icon:"i-scale", route:"vendors", prefix:"VS"},
  policy:{n:"Policy stress-tester", plural:"Policy tests", icon:"i-doc", route:"policy", prefix:"PT"},
  maturity:{n:"Program maturity", plural:"Maturity", icon:"i-steps", route:"maturity", prefix:"MA"},
  coverage:{n:"Coverage radar", plural:"Coverage", icon:"i-cover", route:"coverage", prefix:"CV"},
  coppa:{n:"COPPA readiness", plural:"COPPA checks", icon:"i-coppa", route:"coppa", prefix:"CP"},
  dsa:{n:"DSA readiness", plural:"DSA checks", icon:"i-dsa", route:"dsa", prefix:"DS"},
  redteam:{n:"Red team studio", plural:"Red teams", icon:"i-shield", route:"redteam", prefix:"RT"},
  eval:{n:"Classifier eval", plural:"Classifier evals", icon:"i-eval", route:"eval", prefix:"EV"},
  transparency:{n:"Transparency report", plural:"Transparency reports", icon:"i-chart", route:"transparency", prefix:"TR"},
  // Saved from a Learn guide's Practice tab, not started fresh from the workspace, so it's left out of the
  // "Start something new" buttons (see the two `k !== "learn"` filters below) but otherwise behaves like any
  // other kind: it's listed, filterable, counted, and opens back to the right place (openSaved, partNav.js).
  learn:{n:"Exercise", plural:"Exercises", icon:"i-save", route:"redteamllm", prefix:"EX"}
};
let wsUI = {editProfile:false, newProject:false, editProject:null, rename:null, confirm:null};
function goRoute(r){ if(location.hash.slice(1)===r) ROUTES[r](); else location.hash = r; }
function flashIn(el, msg){ if(!el) return; el.textContent = msg; setTimeout(()=>{ el.textContent = ""; }, 3500); }
const projName = id => { const p = wsProjects()[id]; return p ? p.name : ""; };
const savedWhere = () => { const a = wsActive(); return a ? `Saved to ${projName(a)}` : "Saved to your workspace"; };
const initials = s => (s||"").trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase() || "?";

/* ---------- saving from the tools ---------- */
function wsSaveTabletop(){
  wsPut({id:wsNewId("TT"), kind:"tabletop", title:ttScenario(tt.s, tt.v).title, projectId:wsActive(), data:JSON.parse(JSON.stringify(tt))});
  flashIn($("#tt-toast"), savedWhere());
}
function wsSaveLabel(kind, data){ const cur = store.get("ws:cur:"+kind, null), it = cur && wsItems()[cur]; if(!it) return "Save to workspace";
  return data !== undefined && JSON.stringify(it.data) === JSON.stringify(data) ? "Saved" : "Save changes"; }
function wsSaveTool(kind, data, title){
  let cur = store.get("ws:cur:"+kind, null);
  if(cur && wsItems()[cur]){ wsPut({id:cur, kind, data:JSON.parse(JSON.stringify(data))}); return "Changes saved"; }
  cur = wsNewId(KINDS[kind].prefix);
  wsPut({id:cur, kind, title, projectId:wsActive(), data:JSON.parse(JSON.stringify(data))});
  store.set("ws:cur:"+kind, cur);
  return savedWhere();
}
const metricsTitle = d => `Metrics: ${MX_PLATFORMS[d.platform]}, ${["","early","scaling","mature"][+d.stage]} stage`;
const vendorsTitle = d => "Vendor scorecard: " + d.vendors.map(v=>(v.name||"Vendor").split(" (")[0]).join(", ");

/* ---------- summaries ---------- */
function vendorResult(d){
  const tw = CRITERIA.reduce((a,c)=>a+(+d.weights[c.k]||0),0) || 1;
  const rows = d.vendors.map(v=>({v, score:CRITERIA.reduce((a,c)=>a+(+d.weights[c.k]||0)*v.s[c.k],0)/tw, bad:CRITERIA.some(c=>c.deal && v.s[c.k]<=2)}));
  return rows.filter(x=>!x.bad).sort((a,b)=>b.score-a.score)[0] || null;
}
// One source of truth for "how do we summarize a saved result": used for the fuller workspace
// row (pill + note) and reused, via the `chip` field, for the compact one-line chip the
// overview's "Jump back in" list shows (ovChip() below). Every number here says what it counts.
function itemSummary(it){
  const d = it.data || {};
  if(it.kind==="learn"){ const label = "Exercise · " + (d.guide === "world" ? "world models" : "LLMs");
    return {html:`<span class="pill">${esc(label)}</span><span class="note">${d.text ? d.text.length + " characters saved" : "No text saved"}</span>`, chip:{cls:"", label}}; }
  if(it.kind==="redteam" && typeof rtDrills === "function"){ const f = d.findings || [], s4 = f.some(x => x.sev === 4 && x.status !== "closed"), open = f.filter(x => x.status !== "closed").length;
    const cls = s4 ? "crit" : open ? "high" : "good", label = s4 ? "Open S4" : open + " open finding" + (open === 1 ? "" : "s");
    return {html:`<span class="pill ${cls}">${label}</span><span class="note">${d.model === "world" ? "World model" : d.model === "both" ? "Language and world model" : "Language model"}${d.langs ? " · " + esc(d.langs) : ""}</span>`, chip:{cls, label}}; }
  if(it.kind==="coppa" && typeof cpScore === "function"){ const dd = Object.assign(CP_BLANK(), d), x = cpCtx(dd), ap = cpApplies(dd), s = cpScore(dd, x, ap);
    const cls = s.crit ? "crit" : s.pct >= 80 ? "good" : "high", label = `${s.pct}% ready`;
    return {html:`<span class="pill ${cls}">${label}</span><span class="note">${esc(ap.h)}${s.crit ? ` · ${s.crit} critical` : ""}</span>`, chip:{cls, label}}; }
  if(it.kind==="eval" && typeof evMetrics === "function"){ const dd = Object.assign(EV_BLANK(), d), m = evMetrics(dd, dd.preds);
    const cls = m.acc === null ? "" : m.acc >= .9 ? "good" : m.acc >= .75 ? "high" : "crit";
    return {html:`<span class="pill ${cls}">${m.pct(m.acc)} accurate</span><span class="note">${dd.cases.length} case${dd.cases.length === 1 ? "" : "s"}${m.main ? ` · P ${m.pct(m.main.pr)} · R ${m.pct(m.main.rc)}` : ""}</span>`,
      chip:{cls, label:`${m.pct(m.acc)} accurate (of ${dd.cases.length} case${dd.cases.length === 1 ? "" : "s"})`}}; }
  if(it.kind==="dsa" && typeof dsScore === "function"){ const dd = Object.assign(DS_BLANK(), d), s = dsScore(dd, dsCtx(dd)), ap = dsApplies(dd);
    const cls = s.crit ? "crit" : s.pct >= 80 ? "good" : "high", label = `${s.pct}% ready`;
    return {html:`<span class="pill ${cls}">${label}</span><span class="note">${esc(ap.h)}${s.crit ? ` · ${s.crit} critical` : ""}</span>`, chip:{cls, label}}; }
  if(it.kind==="transparency" && typeof trProgress === "function"){
    const keep = tr, dd = Object.assign(TR_BLANK(), d); tr = dd; const p = trProgress(); tr = keep;
    const cls = p.pct >= 90 ? "good" : "high", label = `${p.pct}% complete`;
    return {html:`<span class="pill ${cls}">${label}</span><span class="note">${esc(TR_TIERS[trRank(dd.tier)][1])} · ${esc(String(dd.year))}</span>`, chip:{cls, label}};
  }
  if(it.kind==="premortem"){
    const r = assess(openRecord(d)), bl = r.safeguards.filter(s=>s.rank===3), bd = bl.filter(s=>d.done&&d.done[s.id]).length;
    const cls = r.posture[1] || "faint";
    return {html:`<span class="pill ${r.posture[1]}">${r.posture[0]}</span><span class="note">${r.risks.length} risks · ${bd}/${bl.length} blockers done</span>`, open:bl.length-bd, chip:{cls, label:r.posture[0]}};
  }
  if(it.kind==="tabletop"){
    const sc = SCENARIOS[d.s]; if(!sc) return {html:""};
    const best = ((d.first && d.first.length) ? d.first : (d.picks||[])).filter((p,i)=>sc.steps[i] && sc.steps[i].o[p] && sc.steps[i].o[p].best).length;
    const avg = Math.round(DIMS.reduce((a,x)=>a+(d.scores?d.scores[x.k]:0),0)/DIMS.length);
    const cls = best===sc.steps.length ? "good" : best>=2 ? "high" : "crit";
    return {html:`<span class="pill ${cls}">${best} of ${sc.steps.length} strong calls</span><span class="note">Average score ${avg}/100</span>`, chip:{cls, label:`${best}/${sc.steps.length} first try`}};
  }
  if(it.kind==="metrics"){
    const n = METRICS.filter(m => m.st <= +d.stage && (m.p==="all" || m.p.includes(d.platform)) && (!m.reg || d.reg)).length;
    const c = typeof mxStatusCounts === "function" ? mxStatusCounts(d) : {on:0, watch:0, off:0};
    const st = c.on + c.watch + c.off ? `<span class="pill good">${c.on} on track</span>${c.watch ? `<span class="pill med">${c.watch} watch</span>` : ""}${c.off ? `<span class="pill crit">${c.off} off track</span>` : ""}` : "";
    return {html:`<span class="pill">${n} metrics</span>${st}<span class="note">${esc(MX_PLATFORMS[d.platform]||"")}${d.reg?" · regulated":""}${d.period ? " · " + esc(d.period) : ""}</span>`, chip:{cls:"", label:`${n} metrics`}};
  }
  if(it.kind==="vendors"){
    const top = vendorResult(d);
    return {html: top ? `<span class="pill accent">Recommended: ${esc(top.v.name)}</span><span class="note">Score ${top.score.toFixed(2)} / 5 · ${d.vendors.length} vendors</span>`
                      : `<span class="pill crit">No vendor meets the minimums</span>`,
      chip: top ? {cls:"accent", label:top.v.name.split(" (")[0]} : {cls:"crit", label:"None qualify"}};
  }
  if(it.kind==="maturity" && typeof maScore === "function"){
    const sc = maScore(d), g = maGaps(d).length, n = MA_AREAS.filter(a => d.lv && d.lv[a.k]).length;
    if(sc === null) return {html:`<span class="note">Not rated yet</span>`};
    const cls = g ? "high" : "good";
    return {html:`<span class="pill ${cls}">Level ${sc.toFixed(1)} · ${maLevelName(sc)}</span><span class="note">${g ? g + " below target" : "On target"} · ${n} of ${MA_AREAS.length} areas rated</span>`, chip:{cls, label:`Level ${sc.toFixed(1)}`}};
  }
  if(it.kind==="coverage" && typeof cvSummary === "function"){
    const s = cvSummary(d); if(!s.rated) return {html:`<span class="note">Not rated yet</span>`};
    const cls = s.exposed.length ? "crit" : s.gaps.length ? "high" : "good";
    return {html:`<span class="pill ${cls}">${s.cov}% coverage</span><span class="note">${s.exposed.length ? s.exposed.length + " exposed" : s.gaps.length ? s.gaps.length + " gaps" : "No gaps"} · ${s.rated} of ${s.total} rated</span>`, chip:{cls, label:`${s.cov}% covered`}};
  }
  if(it.kind==="policy"){
    const s = d.result ? d.result.score : d.heur ? d.heur.score : null;
    if(s===null) return {html:`<span class="note">Not tested yet</span>`};
    const cls = s>=75 ? "good" : s>=50 ? "high" : "crit";
    return {html:`<span class="pill ${cls}">Clarity ${s}/100</span><span class="note">${d.result ? d.result.edge_cases.length + " edge cases" : "Instant checks"}</span>`, chip:{cls, label:`Clarity ${s}`}};
  }
  return {html:""};
}

/* ---------- page ---------- */
function profileCard(){
  const p = wsProfile();
  if(wsUI.editProfile || !p){
    return `<div class="card wsprofile"><div class="card-b" style="display:grid;gap:10px">
      <div><h3 style="font-size:16px">${p?"Edit your profile":"Set up your profile"}</h3><p class="note">Shown on your workspace and in exported files. Stored only in this browser.</p></div>
      <div class="field"><label for="ws-name">Name</label><input class="input" id="ws-name" value="${esc(p&&p.name||"")}" placeholder="e.g. Alex Rivera"></div>
      <div class="field"><label for="ws-role">Role</label><input class="input" id="ws-role" value="${esc(p&&p.role||"")}" placeholder="e.g. Head of Trust & Safety"></div>
      <div class="field"><label for="ws-org">Company or team</label><input class="input" id="ws-org" value="${esc(p&&p.org||"")}" placeholder="Optional"></div>
      <div class="row"><button type="button" class="btn primary sm" data-ws="saveprofile">Save profile</button>${p?`<button type="button" class="btn sm" data-ws="cancelprofile">Cancel</button>`:""}</div>
    </div></div>`;
  }
  return `<div class="card wsprofile"><div class="card-b wsprof">
    <span class="avatar" aria-hidden="true">${esc(initials(p.name))}</span>
    <div style="min-width:0"><b class="wsname">${esc(p.name||"Your profile")}</b><span class="note">${esc([p.role,p.org].filter(Boolean).join(" · ")||"Add your role and team")}</span></div>
    <button type="button" class="btn sm" data-ws="editprofile">Edit</button>
  </div></div>`;
}
function projectCards(items){
  const projects = Object.values(wsProjects()).sort((a,b)=>(b.updated||0)-(a.updated||0)), active = wsActive();
  const counts = pid => Object.keys(KINDS).map(k=>[k, items.filter(i=>i.kind===k && (pid===undefined || (i.projectId||null)===pid)).length]).filter(x=>x[1]);
  const kc = cs => cs.map(([k,n])=>`<span class="kc" title="${KINDS[k].plural}"><svg><use href="#${KINDS[k].icon}"/></svg>${n}</span>`).join("") || `<span class="note">Empty</span>`;
  const all = `<button type="button" class="card projcard ${!active?"on":""}" data-wsproj="">
      <span class="projname"><svg><use href="#i-layers"/></svg>All results</span><span class="note">Everything you've saved</span><span class="kcs">${kc(counts(undefined))}</span></button>`;
  const cards = projects.map(p => {
    if(wsUI.editProject===p.id) return `<div class="card projcard on"><div class="field"><label for="wp-name-${p.id}">Project name</label><input class="input" id="wp-name-${p.id}" value="${esc(p.name)}"></div>
      <div class="field"><label for="wp-desc-${p.id}">Description</label><input class="input" id="wp-desc-${p.id}" value="${esc(p.desc||"")}"></div>
      <div class="row"><button type="button" class="btn sm primary" data-ws-projsave="${p.id}">Save</button><button type="button" class="btn sm" data-ws="cancelproj">Cancel</button></div></div>`;
    const confirming = wsUI.confirm==="proj:"+p.id;
    return `<div class="card projcard ${active===p.id?"on":""}">
      <button type="button" class="projhit" data-wsproj="${p.id}" aria-pressed="${active===p.id}"><span class="projname"><svg><use href="#i-folder"/></svg>${esc(p.name)}</span>
        <span class="note">${esc(p.desc||"No description")}</span><span class="kcs">${kc(counts(p.id))}</span></button>
      <div class="projact">${confirming
        ? `<span class="note">Delete project? Its results move to All results.</span><button type="button" class="btn sm danger" data-ws-projdelok="${p.id}">Delete</button><button type="button" class="btn sm" data-ws="cancelconfirm">Cancel</button>`
        : `<button type="button" class="btn sm" data-ws-projedit="${p.id}">Rename</button><button type="button" class="btn sm icon" data-ws-projdel="${p.id}" aria-label="Delete project" title="Delete project"><svg><use href="#i-trash"/></svg></button>`}</div>
    </div>`;
  }).join("");
  const form = wsUI.newProject ? `<div class="card projcard on"><div class="field"><label for="wp-new-name">Project name</label><input class="input" id="wp-new-name" placeholder="e.g. Marketplace launch Q3"></div>
      <div class="field"><label for="wp-new-desc">Description</label><input class="input" id="wp-new-desc" placeholder="Optional"></div>
      <div class="row"><button type="button" class="btn sm primary" data-ws="createproj">Create project</button><button type="button" class="btn sm" data-ws="cancelproj">Cancel</button></div></div>` : "";
  return `<div class="projgrid">${all}${cards}${form}</div>`;
}
function itemRows(items){
  const projects = Object.values(wsProjects()).sort((a,b)=>a.name.localeCompare(b.name));
  if(!items.length) return `<div class="card wsempty"><b>Nothing saved here yet</b><p class="note">Run a tool and save the result, or start one now.</p>
    <div class="row">${typeof asInAssessment === "function" && !asInAssessment() ? `<a class="btn sm primary" href="#overview"><svg><use href="#i-arrow"/></svg>Start the guided assessment</a>` : ""}${Object.entries(KINDS).filter(([k])=>k!=="learn").map(([k,v])=>`<button type="button" class="btn sm" data-ws-new="${k}"><svg><use href="#${v.icon}"/></svg>${v.n}</button>`).join("")}</div></div>`;
  return `<div class="card wslist">${items.map(it => {
    const s = itemSummary(it), confirming = wsUI.confirm==="item:"+it.id;
    const title = wsUI.rename===it.id
      ? `<span class="row" style="gap:6px"><input class="input" id="wr-${it.id}" value="${esc(it.title||"")}" style="max-width:280px;padding:6px 9px"><button type="button" class="btn sm primary" data-ws-renameok="${it.id}">Save</button><button type="button" class="btn sm" data-ws="cancelrename">Cancel</button></span>`
      : `<b>${esc(it.title||"Untitled")}</b>`;
    return `<div class="wsrow">
      <span class="libicon"><svg><use href="#${KINDS[it.kind].icon}"/></svg></span>
      <div class="libmain">${title}<span class="note">${KINDS[it.kind].n} · Updated ${fmtDate(it.updated)}</span></div>
      <div class="libstat">${s.html}</div>
      <label class="wsmove"><span class="visually-hidden">Project for ${esc(it.title||"this result")}</span><select class="select" data-ws-move="${it.id}">
        <option value="">No project</option>${projects.map(p=>`<option value="${p.id}" ${it.projectId===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}</select></label>
      <div class="libact">${confirming
        ? `<span class="note">Delete permanently?</span><button type="button" class="btn sm danger" data-ws-delok="${it.id}">Delete</button><button type="button" class="btn sm" data-ws="cancelconfirm">Cancel</button>`
        : `<button type="button" class="btn sm primary" data-ws-open="${it.id}">Open</button>
           <button type="button" class="btn sm" data-ws-rename="${it.id}">Rename</button>
           <button type="button" class="btn sm icon" data-ws-dup="${it.id}" aria-label="Duplicate" title="Duplicate"><svg><use href="#i-copy"/></svg></button>
           <button type="button" class="btn sm icon" data-ws-del="${it.id}" aria-label="Delete" title="Delete"><svg><use href="#i-trash"/></svg></button>`}</div>
    </div>`; }).join("")}</div>`;
}
function renderWorkspace(){
  const all = Object.values(wsItems()).filter(i=>KINDS[i.kind]).sort((a,b)=>(b.updated||0)-(a.updated||0));
  const active = wsActive(), kind = store.get("ws:kind", "");
  const inProject = active ? all.filter(i=>(i.projectId||null)===active) : all;
  const shown = kind ? inProject.filter(i=>i.kind===kind) : inProject;
  const openBlockers = all.filter(i=>i.kind==="premortem").reduce((a,i)=>a+(itemSummary(i).open||0),0);
  const p = wsProfile(), empty = all.length === 0, projCount = Object.keys(wsProjects()).length;
  view.innerHTML = `<div id="ws-root">` + head("My workspace",
    `${p&&p.name?esc(p.name.split(" ")[0])+", here's":"Here's"} everything you've saved from the tools, organized into projects. It lives in this browser. Save it to a workspace file to keep a copy, and open that file on any device.`, null,
    `<button type="button" class="btn sm" data-pf="open"><svg><use href="#i-upload"/></svg>Open workspace file</button>
     <button type="button" class="btn sm primary" data-pf="save"><svg><use href="#i-download"/></svg>Save workspace file</button>`) + `
    <span class="toast" id="ws-toast" role="status" aria-live="polite"></span>
    <div class="wstop">
      ${profileCard()}
      ${typeof orgCardHTML === "function" ? orgCardHTML() : ""}
    </div>
    ${empty ? itemRows([]) : `<div class="wsstats">
        <div class="card kpi"><span class="eyebrow">Projects</span><span class="v">${projCount}</span></div>
        <div class="card kpi"><span class="eyebrow">Saved results</span><span class="v">${all.length}</span></div>
        <div class="card kpi"><span class="eyebrow">Pre-mortems</span><span class="v">${all.filter(i=>i.kind==="premortem").length}</span></div>
        <div class="card kpi"><span class="eyebrow">Open launch blockers ${tip("Launch blockers not yet ticked off, added up across every saved pre-mortem.","tip-r")}</span><span class="v" style="${openBlockers?"color:var(--crit)":""}">${openBlockers}</span></div>
    </div>`}
    <div class="section-title"><h2>Projects ${tip("Group results by launch, product area or client. Click a project to see its results; anything you save while it's selected goes into it.")}</h2>
      <button type="button" class="btn sm" data-ws="newproj"><svg><use href="#i-plus"/></svg>New project</button></div>
    ${!projCount && all.length < 3 ? `<p class="note wsnudge">Projects help once you have a few results to group. With ${all.length} saved so far, you probably don't need one yet.</p>` : ""}
    ${projectCards(all)}
    <div class="section-title"><h2>${active?`Results in ${esc(projName(active))}`:"All saved results"}</h2>
      <div class="segs" role="group" aria-label="Filter by tool"><button type="button" data-ws-kind="" aria-pressed="${!kind}">All <span class="mono" style="opacity:.6">${inProject.length}</span></button>${Object.entries(KINDS).map(([k,v])=>`<button type="button" data-ws-kind="${k}" aria-pressed="${kind===k}">${v.plural} <span class="mono" style="opacity:.6">${inProject.filter(i=>i.kind===k).length}</span></button>`).join("")}</div></div>
    ${active?`<div class="banner" style="margin-top:12px"><span>New results you save from any tool go into <strong>${esc(projName(active))}</strong>.</span><button type="button" class="btn sm" data-wsproj="">Show all results</button></div>`:""}
    ${empty ? "" : itemRows(shown)}
    ${shown.length?`<div class="row wsnew"><span class="note">Start something new:</span>${Object.entries(KINDS).filter(([k])=>k!=="learn").map(([k,v])=>`<button type="button" class="btn sm" data-ws-new="${k}"><svg><use href="#${v.icon}"/></svg>${v.n}</button>`).join("")}</div>`:""}
  </div>`;
  bindWorkspace();
}
function bindWorkspace(){
  const root = $("#ws-root"), toast = m => flashIn($("#ws-toast"), m);
  const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
  const re = () => renderWorkspace();
  root.addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b) return;
    const d = b.dataset, items = wsItems();
    if(d.wsproj!==undefined){ store.set("ws:active", d.wsproj||null); wsUI.confirm = null; return re(); }
    if(d.wsKind!==undefined){ store.set("ws:kind", d.wsKind); return re(); }
    if(d.wsProjedit){ wsUI.editProject = d.wsProjedit; return re(); }
    if(d.wsProjsave){ const m = wsProjects(), pr = m[d.wsProjsave]; if(pr){ pr.name = val("wp-name-"+pr.id) || pr.name; pr.desc = val("wp-desc-"+pr.id); pr.updated = Date.now(); wsSaveProjects(m); } wsUI.editProject = null; return re(); }
    if(d.wsProjdel){ wsUI.confirm = "proj:"+d.wsProjdel; return re(); }
    if(d.wsProjdelok){ const m = wsProjects(); delete m[d.wsProjdelok]; wsSaveProjects(m);
      Object.values(items).forEach(it => { if(it.projectId===d.wsProjdelok){ it.projectId = null; if(it.data && it.kind==="premortem") it.data.projectId = null; } }); wsSaveItems(items);
      if(pm.projectId===d.wsProjdelok){ pm.projectId = null; store.set("pm3", pm); }
      if(store.get("ws:active",null)===d.wsProjdelok) store.set("ws:active", null);
      wsUI.confirm = null; re(); return toast("Project deleted"); }
    if(d.wsOpen){ if(items[d.wsOpen]) openSaved(d.wsOpen); return; }
    if(d.wsNew){ const k = d.wsNew;
      if(k==="premortem"){ pm = orgPrefillPM(Object.assign(blankPM(), {projectId:wsActive()})); store.set("pm3", pm); }
      if(k==="tabletop"){ tt = null; store.set("tt", null); }
      if(k==="metrics"){ store.set("ws:cur:metrics", null); mx = {platform:"social", stage:"2", reg:true}; store.set("mx", mx); }
      if(k==="vendors"){ store.set("ws:cur:vendors", null); vx = JSON.parse(JSON.stringify(DEFAULT_V)); store.set("vx", vx); }
      if(k==="policy"){ store.set("ws:cur:policy", null); pol = {rule:"", type:"social", regions:["us","eu","uk"], heur:null, result:null, ts:null}; store.set("pol", pol); }
      if(k==="coverage"){ store.set("ws:cur:coverage", null); cv = {src:null, ex:false, r:{}}; store.set("cv", cv); }
      if(k==="maturity"){ store.set("ws:cur:maturity", null); ma = maInit({stage:(ma && ma.stage) || "growth", lv:{}, done:{}, ex:false, open:"policy"}); store.set("ma", ma); }
      if(k==="transparency"){ store.set("ws:cur:transparency", null); tr = TR_BLANK(); store.set("tr", tr); }
      if(k==="coppa"){ store.set("ws:cur:coppa", null); cp = CP_BLANK(); cpSave(); }
      if(k==="dsa"){ store.set("ws:cur:dsa", null); ds = DS_BLANK(); dsSave(); }
      if(k==="redteam"){ store.set("ws:cur:redteam", null); rt = RT_BLANK(); rtSave(); }
      if(k==="eval"){ store.set("ws:cur:eval", null); ev = EV_BLANK(); evSave(); }
      return goRoute(KINDS[k].route); }
    if(d.wsDup){ const it = items[d.wsDup]; if(!it) return; const copy = JSON.parse(JSON.stringify(it));
      copy.id = it.kind==="premortem" ? newId() : wsNewId(KINDS[it.kind].prefix); copy.title = (it.title||"Untitled") + " (copy)"; copy.created = null; copy.updated = null;
      if(it.kind==="premortem"){ copy.data.id = copy.id; copy.data.name = copy.title; copy.data.created = Date.now(); copy.data.updated = Date.now(); }
      wsPut(copy); re(); return toast("Duplicated"); }
    if(d.wsDel){ wsUI.confirm = "item:"+d.wsDel; return re(); }
    if(d.wsDelok){ wsDel(d.wsDelok);
      if(pm.id===d.wsDelok){ pm.saved = false; pm.id = null; store.set("pm3", pm); }
      ["metrics","vendors","policy","maturity","coverage","transparency","coppa","dsa","eval"].forEach(k => { if(store.get("ws:cur:"+k,null)===d.wsDelok) store.set("ws:cur:"+k, null); });
      wsUI.confirm = null; re(); return toast("Deleted"); }
    if(d.wsRename){ wsUI.rename = d.wsRename; re(); const el = document.getElementById("wr-"+d.wsRename); if(el) el.focus(); return; }
    if(d.wsRenameok){ const it = items[d.wsRenameok], t = val("wr-"+d.wsRenameok); if(it && t){ it.title = t; it.updated = Date.now();
        if(it.kind==="premortem"){ it.data.name = t; if(pm.id===it.id){ pm.name = t; store.set("pm3", pm); } } wsSaveItems(items); }
      wsUI.rename = null; return re(); }
    switch(d.ws){
      case "editprofile": wsUI.editProfile = true; return re();
      case "cancelprofile": wsUI.editProfile = false; return re();
      case "saveprofile": { const name = val("ws-name"); if(!name){ const el = document.getElementById("ws-name"); if(el){ el.focus(); el.setAttribute("aria-invalid","true"); } return toast("Add your name to save your profile"); }
        const prev = wsProfile(); store.set("ws:profile", {name, role:val("ws-role"), org:val("ws-org"), created:(prev&&prev.created)||Date.now()}); wsUI.editProfile = false; re(); return toast("Profile saved"); }
      case "newproj": wsUI.newProject = true; re(); { const el = document.getElementById("wp-new-name"); if(el) el.focus(); } return;
      case "cancelproj": wsUI.newProject = false; wsUI.editProject = null; return re();
      case "createproj": { const name = val("wp-new-name"); if(!name){ const el = document.getElementById("wp-new-name"); if(el) el.focus(); return toast("Give the project a name"); }
        const m = wsProjects(), id = wsNewId("PRJ"); m[id] = {id, name, desc:val("wp-new-desc"), created:Date.now(), updated:Date.now()}; wsSaveProjects(m);
        store.set("ws:active", id); wsUI.newProject = false; re(); return toast("Project created"); }
      case "cancelconfirm": wsUI.confirm = null; return re();
      case "cancelrename": wsUI.rename = null; return re();
      case "export": { const json = JSON.stringify({app:"ts-workbench", version:2, kind:"workspace", exported:new Date().toISOString(), profile:wsProfile(), projects:Object.values(wsProjects()), items:Object.values(wsItems())}, null, 2);
        return offerFile("ts-workbench-workspace.json", json, json, $("#ws-toast")); }
    }
  });
  root.addEventListener("change", e => {
    const t = e.target;
    if(t.dataset.wsMove!==undefined){ const items = wsItems(), it = items[t.dataset.wsMove]; if(!it) return;
      it.projectId = t.value || null; if(it.kind==="premortem" && it.data) it.data.projectId = it.projectId;
      if(pm.id===it.id){ pm.projectId = it.projectId; store.set("pm3", pm); }
      wsSaveItems(items); re(); return toast(it.projectId ? `Moved to ${projName(it.projectId)}` : "Removed from project"); }
    if(t.id==="ws-import" && t.files && t.files[0]){
      const reader = new FileReader();
      reader.onload = () => { try{
          const data = JSON.parse(reader.result); let n = 0;
          if(data && data.kind==="workspace"){
            const pr = wsProjects(); (data.projects||[]).forEach(p => { if(p && p.id && p.name){ pr[p.id] = p; } }); wsSaveProjects(pr);
            const m = wsItems(); (data.items||[]).forEach(it => { if(it && it.id && KINDS[it.kind] && it.data){ m[it.id] = it; n++; } }); wsSaveItems(m);
            if(data.profile && !wsProfile()) store.set("ws:profile", data.profile);
            re(); return toast(`Imported ${n} result${n===1?"":"s"}`);
          }
          importLibrary(t.files[0], msg => { re(); toast(msg); });
        }catch(err){ toast("That file isn't a Workbench export"); } };
      reader.readAsText(t.files[0]);
    }
  });
  root.addEventListener("keydown", e => {
    if(e.key!=="Enter" || !e.target.id) return;
    const id = e.target.id;
    if(id==="wp-new-name" || id==="wp-new-desc"){ e.preventDefault(); root.querySelector('[data-ws="createproj"]').click(); }
    else if(id.startsWith("wr-")){ e.preventDefault(); root.querySelector(`[data-ws-renameok="${id.slice(3)}"]`).click(); }
    else if(id.startsWith("ws-")){ e.preventDefault(); const b = root.querySelector('[data-ws="saveprofile"]'); if(b) b.click(); }
  });
}
