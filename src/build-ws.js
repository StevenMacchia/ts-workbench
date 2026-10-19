// Applies the workspace patches to copies of the parts, assembles v8 and writes it.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename);
const rd = f => fs.readFileSync(path.join(D, f), "utf8");
const patch = (src, pairs, label) => pairs.reduce((s, [from, to]) => {
  if(!s.includes(from)) throw new Error(`${label}: anchor not found: ${from.slice(0,80)}`);
  return s.replace(from, to);
}, src);

// Pre-mortem library now reads and writes through the workspace store
const L = patch(rd("partL.js"), [
  [`const libLoad = () => store.get("lib", {}) || {};`,
   `const libLoad = () => { const out = {}; Object.values(wsItems()).forEach(it => { if(it.kind==="premortem" && it.data) out[it.id] = Object.assign({}, it.data, {id:it.id}); }); return out; };`],
  [`const libSave = lib => store.set("lib", lib);`,
   `const libSave = lib => { const m = wsItems();
  Object.keys(m).forEach(id => { if(m[id].kind==="premortem" && !lib[id]) delete m[id]; });
  Object.values(lib).forEach(rec => { const prev = m[rec.id];
    m[rec.id] = {id:rec.id, kind:"premortem", title:rec.name||"Untitled assessment", projectId: rec.projectId!==undefined ? rec.projectId : (prev ? prev.projectId : null),
      created: rec.created || (prev && prev.created) || Date.now(), updated: rec.updated || Date.now(), data: rec}; });
  wsSaveItems(m); };`],
  [`  if(!pm.id) pm.id = newId();`, `  if(!pm.id) pm.id = newId();\n  if(pm.projectId===undefined) pm.projectId = wsActive();`]
], "partL");

const F2 = patch(rd("partF2.js"), [
  [`    if(t.dataset.sg){ pm.done[t.dataset.sg] = t.checked; rerender(); }`,
   `    if(t.dataset.sg){ pm.done[t.dataset.sg] = t.checked; rerender(); }
    if(t.id==="pm-project"){ pm.projectId = t.value || null; pm.flash = pm.projectId ? "Moved to " + projName(pm.projectId) : "Removed from project"; rerender(); }`]
], "partF2");

const F3 = patch(rd("partF3.js"), [
  [`<span class="note">Click any answer to change it</span>`,
   `<span class="row" style="gap:12px">\${pmProjectSelect()}<span class="note">Click any answer to change it</span></span>`]
], "partF3");

const G = patch(rd("partG.js"), [
  [`<button class="btn" id="tt-other">Try another scenario</button></div>`,
   `<button class="btn" id="tt-other">Try another scenario</button><button class="btn" id="tt-save"><svg><use href="#i-save"/></svg>Save to workspace</button><span class="toast" id="tt-toast" aria-live="polite"></span></div>`],
  [`    $('#tt-replay').onclick = () => { tt = freshTT(tt.s); store.set('tt',tt); renderTabletop(); };`,
   `    $('#tt-replay').onclick = () => { tt = freshTT(tt.s); store.set('tt',tt); renderTabletop(); };\n    $('#tt-save').onclick = () => wsSaveTabletop();`],
  [`'Run the program', \`<button class="btn sm primary" id="mx-copy">`,
   `'Run the program', \`<button class="btn sm" id="mx-save"><svg><use href="#i-save"/></svg>\${wsSaveLabel("metrics", mx)}</button><button class="btn sm primary" id="mx-copy">`],
  [`  $('#mx-reg').onchange = e => { mx.reg = e.target.checked; save(); };`,
   `  $('#mx-reg').onchange = e => { mx.reg = e.target.checked; save(); };\n  $('#mx-save').onclick = () => { const msg = wsSaveTool("metrics", mx, metricsTitle(mx)); renderMetrics(); flashIn($('#mx-toast'), msg); };`],
  [`'Run the program', \`<button class="btn sm" id="vx-reset">Reset to example data</button>\`)`,
   `'Run the program', \`<span class="toast" id="vx-toast" aria-live="polite"></span><button class="btn sm" id="vx-reset">Reset to example data</button><button class="btn sm primary" id="vx-save"><svg><use href="#i-save"/></svg>\${wsSaveLabel("vendors")}</button>\`)`],
  [`  $('#vx-reset').onclick = () => { vx = JSON.parse(JSON.stringify(DEFAULT_V)); save(); renderVendors(); };`,
   `  $('#vx-reset').onclick = () => { vx = JSON.parse(JSON.stringify(DEFAULT_V)); store.set('ws:cur:vendors', null); save(); renderVendors(); };\n  $('#vx-save').onclick = () => { const msg = wsSaveTool("vendors", vx, vendorsTitle(vx)); renderVendors(); flashIn($('#vx-toast'), msg); };`]
], "partG");

// Tabletop: scenario library by company type
// Scenario files: S2 ends by pushing NEW_SCENARIOS into SCENARIOS, so S3-S8 (which add to NEW_SCENARIOS) go before that line
const S2 = rd("partS2.js"), cut = S2.indexOf("// The original three scenarios keep");
if(cut < 0) throw new Error("partS2 marker missing");
const scenarioLib = [rd("partS1.js"), S2.slice(0, cut), rd("partS3.js"), rd("partS4.js"), rd("partS5.js"), rd("partS6.js"), rd("partS7.js"), rd("partS8.js"), rd("partS9.js"), S2.slice(cut), rd("partS10.js"), rd("partS11.js"), rd("partS12.js"), rd("partS13.js")].join("\n");
let G2 = patch(G, [
  [`let tt = store.get('tt', null);`, scenarioLib + "\nlet tt = store.get('tt', null);"],
  [`  const sc = SCENARIOS[tt.s];`, `  const sc = ttScenario(tt.s, tt.v);`],
  [`$('#tt-replay').onclick = () => { tt = freshTT(tt.s); store.set('tt',tt); renderTabletop(); };`, `$('#tt-replay').onclick = () => { tt = Object.assign(freshTT(tt.s), {v:tt.v}); store.set('tt',tt); renderTabletop(); };`]
], "partG scenarios");
{
  const a = G2.indexOf("  if(!tt){\n"), b = G2.indexOf("    return;\n  }\n", a);
  if(a < 0 || b < 0) throw new Error("partG: scenario picker block not found");
  const picker = `  if(!tt){
    const ttType = ttCompanyType(), tInfo = TT_TYPES.find(t=>t.k===ttType);
    const list = SCENARIOS.map((s,i)=>({s:ttScenario(i, ttType), i})).filter(x => ttType==='all' || (x.s.types||[]).includes(ttType))
      .sort((a,b) => (a.s.tailored?1:0) - (b.s.tailored?1:0));
    const typeNames = s => (s.types||[]).map(k=>TT_TYPES.find(t=>t.k===k).n).join(' · ');
    view.innerHTML = H('Rehearse a crisis before it happens. Choose your company type, pick a scenario, and make four decisions as it unfolds. Each choice moves safety, trust, regulatory standing and team capacity, and the debrief shows what strong incident command looks like.') + \`
      <div class="card ttbar"><div class="field"><label for="tt-type">Your company type</label>
        <select class="select" id="tt-type">\${TT_TYPES.map(t=>\`<option value="\${t.k}" \${t.k===ttType?'selected':''}>\${t.n}</option>\`).join('')}</select></div>
        <p class="note">\${list.length} scenario\${list.length===1?'':'s'} written for \${tInfo.s} companies. Each one reflects the risks, regulators and trade-offs that type of company faces.</p></div>
      <div class="scen-grid">\${list.map(({s,i})=>\`
        <button class="card scen" data-i="\${i}">
          <div class="row"><span class="pill crit"><span class="dot"></span>\${s.severity}</span><span class="pill">\${esc(s.platform)}</span></div>
          <h3>\${esc(s.title)}</h3><p>\${esc(s.blurb)}</p>
          <span class="note">\${s.steps.length} decisions · about 8 minutes\${s.tailored ? (ttType==='all' ? ' · Tailored to each company type' : ' · Every company faces this, tailored to yours') : (ttType==='all' ? ' · ' + esc(typeNames(s)) : '')}</span>
        </button>\`).join('')}</div>\`;
    $$('.scen').forEach(b => b.onclick = () => { tt = freshTT(+b.dataset.i); tt.v = ttType; store.set('tt', tt); renderTabletop(); });
    $('#tt-type').onchange = e => { store.set('tt:type', e.target.value); renderTabletop(); };
`;
  G2 = G2.slice(0, a) + picker + G2.slice(b);
}
// Learning mode: replace the whole tabletop renderer
{
  const a = G2.indexOf("function renderTabletop(){"), b = G2.indexOf("/* =========================================================\n   METRICS FRAMEWORK");
  if(a < 0 || b < 0 || b < a) throw new Error("partG: renderTabletop boundaries not found");
  G2 = G2.slice(0, a) + rd("partTT.js") + "\n" + G2.slice(b);
}

// Metrics: teaching page replaces the renderer (data arrays stay)
{
  const a = G2.indexOf("function renderMetrics(){"), b = G2.indexOf("/* =========================================================\n   VENDOR SCORECARD");
  if(a < 0 || b < 0 || b < a) throw new Error("partG: renderMetrics boundaries not found");
  G2 = G2.slice(0, a) + rd("partMXd1.js") + "\n" + rd("partMXd2.js") + "\n" + rd("partMXd3.js") + "\n" + rd("partMXd4.js") + "\n" + rd("partMXd5.js") + "\n" + rd("partMXd6.js") + "\n" + rd("partMX.js") + "\n" + G2.slice(b);
}

// Vendor scorecard: guided scoring replaces the renderer (criteria and saved data stay)
{
  const a = G2.indexOf("function renderVendors(){");
  if(a < 0) throw new Error("partG: renderVendors not found");
  const end = G2.indexOf("\n}\n", a);
  if(end < 0) throw new Error("partG: renderVendors end not found");
  G2 = G2.slice(0, a) + rd("partVD.js") + G2.slice(end + 3);
}

const R = patch(rd("partR.js"), [
  [`const ROUTES = {overview:renderOverview, `, `const ROUTES = {overview:renderOverview, workspace:renderWorkspace, `]
], "partR");

const C = patch(rd("partC3.html"), [
  [`<svg><use href="#i-home"/></svg>Overview</a>`,
   `<svg><use href="#i-home"/></svg>Overview</a>\n        <a class="navlink" href="#workspace" data-route="workspace"><svg><use href="#i-user"/></svg>My workspace</a>`]
], "partC3");

const I = rd("partI3.svg"); // sprite is Lucide, applied by tools/screenshots/apply-lucide.js (ICONS.md)

const W2 = rd("partW2.js") + `
function pmProjectSelect(){
  if(!pm.saved) return "";
  const projects = Object.values(wsProjects()).sort((a,b)=>a.name.localeCompare(b.name));
  if(!projects.length) return \`<a class="note" href="#workspace">Add to a project</a>\`;
  return \`<label class="projsel"><span class="note">Project</span><select class="select" id="pm-project"><option value="">No project</option>\${projects.map(p=>\`<option value="\${p.id}" \${pm.projectId===p.id?"selected":""}>\${esc(p.name)}</option>\`).join("")}</select></label>\`;
}
`;

const ttCss = `
/* ---------- Tabletop company picker ---------- */
.ttbar{display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:8px 20px;align-items:end;padding:16px 20px;margin-bottom:16px}
.ttbar .note{padding-bottom:9px}
@media (max-width:700px){.ttbar{grid-template-columns:1fr}.ttbar .note{padding-bottom:0}}
.ttprog{display:grid;gap:6px}
.ttprog .note{padding-bottom:0}
.ttfilters{margin-bottom:14px}
.scen{position:relative}
.scen.done{border-color:color-mix(in srgb, var(--good) 45%, var(--line))}
.scen-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.scen-foot{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:2px}
.scen-foot .note{margin-right:auto}
/* timeline */
.tline{list-style:none;margin:0 0 16px;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;counter-reset:none}
.tline li{position:relative;display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface);min-width:0}
.tline .tdot{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font:600 12px var(--mono);background:var(--sunk);color:var(--muted)}
.tline .tlab{display:grid;gap:1px;min-width:0;font-size:12.5px}
.tline .tlab b{font-family:var(--mono);font-weight:500;font-size:12px}
.tline .tlab span{color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tline li.now{border-color:var(--accent);box-shadow:inset 0 3px 0 var(--accent)}
.tline li.now .tdot{background:var(--accent);color:var(--accent-ink)}
.tline li.ok .tdot{background:var(--good-soft);color:var(--good)}
.tline li.miss .tdot{background:var(--high-soft);color:var(--high)}
@media (max-width:760px){.tline{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* options after answering */
.opt.picked.good{border-color:var(--good);background:var(--good-soft)}
.opt.picked.miss{border-color:var(--high);background:var(--high-soft)}
.opt.reveal{border-color:var(--good);border-style:dashed}
.optnote{display:block;font-size:12px;font-weight:600;color:var(--good);margin-top:4px}
/* learning panel */
.learn{margin-top:14px;border-radius:10px;border:1px solid var(--line);background:var(--surface);padding:18px 20px;display:grid;gap:12px;box-shadow:var(--shadow)}
.learn.good{border-color:var(--good);box-shadow:inset 4px 0 0 var(--good)}
.learn.warn{border-color:var(--high);box-shadow:inset 4px 0 0 var(--high)}
.learn-h{display:flex;align-items:center;gap:8px;font-family:var(--display);font-weight:700;font-size:17px}
.learn.good .learn-h{color:var(--good)}
.learn.warn .learn-h{color:var(--high)}
.learn-h svg{width:20px;height:20px}
.learn-sec{display:grid;gap:4px}
.learn-sec.better{padding:12px 14px;border-radius:8px;background:var(--good-soft)}
.cmp{display:grid;grid-template-columns:minmax(0,1fr) 64px 80px;gap:8px;align-items:center;font-size:13.5px;padding:3px 0;border-bottom:1px solid var(--line)}
.cmp.head{font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600}
.cmp .cv{font-family:var(--mono);text-align:center;border-radius:5px;padding:1px 0;background:var(--sunk)}
.cmp .cv.up{background:var(--good-soft);color:var(--good)}
.cmp .cv.dn{background:var(--crit-soft);color:var(--crit)}
.lawbox{padding:12px 14px;border-radius:8px;background:var(--accent-soft);display:grid;gap:4px}
.lawbox .eyebrow{display:flex;align-items:center;gap:6px;color:var(--accent)}
.lawbox .eyebrow svg{width:14px;height:14px}
.lawbox p{font-size:13.5px}
.firsttry{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--line)}
/* debrief */
.learnsum{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
@media (max-width:760px){.learnsum{grid-template-columns:1fr}}
.learnbox{padding:16px 18px;display:grid;gap:6px;align-content:start}
.learnbox h4{font-size:16px}
.learnbox ul{margin:0;padding-left:18px;display:grid;gap:6px;font-size:13.5px}
.dhead{font-size:17px;margin:22px 0 10px}
`;
const css = ["partA.html","partB.css","partB2.css","partB3.css","partB4.css","partB5.css"].map(rd).join("") + ttCss;
const body = [I, C, rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), F2, rd("partW1.js"), L, F3, G2, W2, rd("partH3.js"), R].join("");
fs.writeFileSync(path.join(D, "ts-workbench-v8.html"), css + "</style>\n" + body);
// Keep patched copies for the render test
fs.writeFileSync(path.join(D, "_L.js"), L); fs.writeFileSync(path.join(D, "_F2.js"), F2); fs.writeFileSync(path.join(D, "_F3.js"), F3);
fs.writeFileSync(path.join(D, "_G.js"), G2);fs.writeFileSync(path.join(D, "_W2.js"), W2);
console.log("v8 assembled");

/* ---------- Lazy sections ----------
   Parts that only one route needs are cut out of the public page's main script and written to docs/parts/<name>.js. The
   router (src/partLazy.js) injects the file once, on the first visit to one of its routes. `needs` lists sections that must
   run first. `routes` are the ROUTES keys that load it. The full bundle (src/ts-workbench-v9.html, which the tests read
   through the parts themselves) keeps everything inline. Core code reaches a section only through functions that are
   called after it loads, or through the guards in partNav.js, partW2.js, partINTRO.js and partLearn.js. */
const CHUNKS = [
  {name: "tsglossary", routes: ["tsglossary"], needs: [], parts: ["partTSG.js"]},
  {name: "learn", routes: ["learn", "redteamllm", "redteamworld", "glossary"], needs: [], parts: ["partLearn.js"]},
  {name: "redteam", routes: ["redteam"], needs: ["learn"], parts: ["partRT.js", "partRT2.js", "partRT3.js", "partRT4.js", "partRT5.js", "partRT6.js", "partRT7.js", "partRT8.js", "partRT9.js"]}
];
const CHUNK_FILES = {};   // name -> {file, text, hash}; filled by the v9 block, written by the standalone block
let CORE9 = "";           // the public page's document body in global scope, without the lazy sections

/* ---------- v9: studio redesign (new shell, theme layer, overview, command palette) ---------- */
{
  const A9 = patch(rd("partA.html"), [[
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Public+Sans:wght@400;500;600;700&family=Schibsted+Grotesk:wght@600;700&display=swap">`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap">`
  ]], "partA fonts");
  const C3 = rd("partC3.html"), a = C3.indexOf('<div class="app">'), b = C3.indexOf("\n<script>\n(function(){");
  if(a < 0 || b < 0) throw new Error("partC3 split points not found");
  const C9 = C3.slice(0, a) + rd("partShell.html") + C3.slice(b);
  const W9 = patch(W2, [[`function goRoute(r){ if(hashNow()===r) ROUTES[r](); else goHash(r); }`,
    `function goRoute(r){ if(hashNow()===r){ ROUTES[r](); shellUpdate(r); window.scrollTo(0,0); } else goHash(r); }`]], "partW2 goRoute");
  const R9 = patch(R, [[`const h = hashNow();`, `const h = hashNow().split('/')[0];`], [`  ROUTES[name]();`, `  ROUTES[name]();\n  shellUpdate(name);`],
    [`const ROUTES = {overview:renderOverview, workspace:renderWorkspace, `, `const ROUTES = {overview:renderOverview, workspace:renderWorkspace, tools:renderTools, plan:renderPlan, review:renderReview, dsa:renderDsa, eval:renderEval, about:renderAbout, roost:()=>renderRoost(), credits:()=>renderCredits(), learn:renderLearn, redteamllm:()=>renderRedteam("llm"), redteamworld:()=>renderRedteam("world"), glossary:renderGlossary, tsglossary:renderTsGlossary, redteam:renderRedteamStudio, policy:renderPolicy, `], [`policy:renderPolicy, `, `policy:renderPolicy, coppa:renderCoppa, postmortem:renderPostmortem, grooming:renderGrooming, reporting:renderReporting, maturity:renderMaturity, coverage:renderCoverage, notice:()=>renderAI("notice"), appeal:()=>renderAI("appeal"), transparency:()=>renderAI("transparency"), `]], "partR shell");
  // Report header becomes a document title; the detail heading gets its own spacing hook
  const F3_9 = patch(F3, [
    [`<div class="card"><div class="card-b" style="display:grid;gap:10px">\n      <div class="row" style="justify-content:space-between"><div><h2 style="font-size:20px">`,
     `<div class="rephead"><div class="rephead-b">\n      <div class="row" style="justify-content:space-between;align-items:flex-end"><div><span class="rep-kicker"><span class="tile tile-sm" data-tone="assess" aria-hidden="true"><svg><use href="#i-radar"/></svg></span>Abuse pre-mortem report</span><h2 class="rep-title">`],
    [`<div class="section-title" style="margin-top:28px"><h2>The detail</h2>`, `<div class="section-title rep-detail"><h2>The detail</h2>`]
  ], "partF3 report header");
  const css9 = [A9, rd("partB.css"), rd("partB2.css"), rd("partB3.css"), rd("partB4.css"), rd("partB5.css")].join("") + ttCss + rd("partZ.css") + rd("partZ2.css") + rd("partZ3.css") + rd("partZ4.css") + rd("partZ5.css") + rd("partZ6.css") + rd("partZ7.css") + rd("partZ8.css") + rd("partZ9.css") + rd("partZ10.css") + rd("partZ11.css") + rd("partZ12.css") + rd("partZ13.css") + rd("partZ14.css") + rd("partZ15.css") + rd("partZ16.css") + rd("partZ17.css") + rd("partZ18.css") + rd("partZ19.css") + rd("partZ20.css");
  // Every script part in load order: a file name is read from src/, {t: text} is a part built above.
  const PARTS9 = [{t: I}, {t: C9}, "partT.js", "partD.js", "partE1.js", "partE2.js", "partF1.js", {t: F2}, "partW1.js", {t: L}, {t: F3_9}, {t: G2}, {t: W9}, "partNav.js", "partH4.js", "partH2.js", "partAbout.js", "partCredits.js", "partLearn.js", "partTSG.js", "partRT.js", "partRT2.js", "partRT3.js", "partRT4.js", "partRT5.js", "partRT6.js", "partRT7.js", "partRT8.js", "partRT9.js", "partPol.js", "partPol2.js", "partAI.js", "partMAd.js", "partMA.js", "partCV.js", "partOV.js", "partRC.js", "partPF.js", "partTK.js", "partORG.js", "partJN.js", "partNX.js", "partTTF.js", "partTR.js", "partDEMO.js", "partHELP.js", "partTYPE.js", "partGD.js", "partINTRO.js", "partCP.js", "partDSA.js", "partPX.js", "partGP.js", "partCR.js", "partEV.js", "partEV2.js", "partEVB.js", "partRX.js", "partLOOP.js", "partPLAN.js", "partREV.js", {t: R9}];
  const textOf = p => typeof p === "string" ? rd(p) : p.t;
  const body9 = PARTS9.map(textOf).join("");
  fs.writeFileSync(path.join(D, "_F3_9.js"), F3_9);
  // Public page: the same parts minus the lazy sections, plus the loader, in global scope (no wrapper function) so that
  // the sections, which are separate scripts, share the app's bindings.
  {
    const NL = "\n", inChunk = new Set(CHUNKS.flatMap(c => c.parts));
    for(const c of CHUNKS) for(const f of c.parts) if(!PARTS9.includes(f)) throw new Error("chunk " + c.name + ": " + f + " is not in the script parts");
    const routeChunk = {}; CHUNKS.forEach(c => c.routes.forEach(r => { routeChunk[r] = c.name; }));
    const hash = t => require("crypto").createHash("sha1").update(t).digest("hex").slice(0, 8);
    for(const c of CHUNKS){
      const text = "/* T&S Workbench section: " + c.name + " (" + c.parts.join(", ") + "). Loaded on demand by src/partLazy.js; generated by src/build-ws.js. */" + NL
        + c.parts.map(rd).join("") + NL + "lazyDone(" + JSON.stringify(c.name) + ");" + NL;
      CHUNK_FILES[c.name] = {file: "parts/" + c.name + ".js", text, hash: hash(text)};
    }
    const lazyPart = patch(rd("partLazy.js"), [
      ["__LAZY_CHUNKS__", JSON.stringify(Object.fromEntries(CHUNKS.map(c => [c.name, {src: CHUNK_FILES[c.name].file + "?v=" + CHUNK_FILES[c.name].hash, needs: c.needs}])))],
      ["__LAZY_ROUTE_CHUNK__", JSON.stringify(routeChunk)]
    ], "partLazy");
    // ROUTES: the section routes become stubs that load the section first
    const routesFrom = `learn:renderLearn, redteamllm:()=>renderRedteam("llm"), redteamworld:()=>renderRedteam("world"), glossary:renderGlossary, tsglossary:renderTsGlossary, redteam:renderRedteamStudio, `;
    const routesTo = `learn:lazyRoute("learn", () => renderLearn()), redteamllm:lazyRoute("learn", () => renderRedteam("llm")), redteamworld:lazyRoute("learn", () => renderRedteam("world")), glossary:lazyRoute("learn", () => renderGlossary()), tsglossary:lazyRoute("tsglossary", () => renderTsGlossary()), redteam:lazyRoute("redteam", () => renderRedteamStudio()), `;
    for(const [r, c] of Object.entries(routeChunk)) if(!routesTo.includes(r + ":lazyRoute(" + JSON.stringify(c))) throw new Error("ROUTES stub for " + r + " does not point at " + c);
    const R9core = patch(R9, [[routesFrom, routesTo], ["route();" + NL + "})();" + NL + "</script>", "route();" + NL + "</script>"]], "partR core");
    const C9core = patch(C9, [["<script>" + NL + "(function(){", "<script>" + NL]], "partC3 core");
    const parts = PARTS9.filter(p => !inChunk.has(p)).map(p => p.t === R9 ? {t: R9core} : p.t === C9 ? {t: C9core} : p);
    parts.splice(parts.findIndex(p => p.t === R9core), 0, {t: lazyPart});
    CORE9 = css9 + "</style>" + NL + parts.map(textOf).join("");
  }
  const STANDALONE_BUILD = true;
fs.writeFileSync(path.join(D, "ts-workbench-v9.html"), css9 + "</style>\n" + body9);
  fs.writeFileSync(path.join(D, "_W9.js"), W9);
  console.log("v9 assembled");
}

// Standalone copy for GitHub Pages: a full document with mobile, preview and icon tags
{
  const v9 = CORE9;
  const site = fs.existsSync(path.join(D, "site-url.txt")) ? fs.readFileSync(path.join(D, "site-url.txt"), "utf8").trim().replace(/\/$/, "") : "";
  const title = "T&amp;S Workbench: free Trust &amp; Safety tools";
  const desc = "Free, private tools for Trust &amp; Safety and product teams: abuse pre-mortems, incident tabletops, a metrics framework, vendor scoring, program maturity, a coverage radar and AI assistants. Built by Steven Macchia.";
  const icon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#5B5BD6"/><path d="M16 6l8 3.4v5.8c0 5-3.4 8.8-8 10.8-4.6-2-8-5.8-8-10.8V9.4z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M12.5 16l2.4 2.4 4.6-4.8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  const img = site ? site + "/og-image.png" : "og-image.png";
  // Cookie-free visit counts on the public website only (the Claude version never loads it)
  const cfa = fs.existsSync(path.join(D, "analytics-token.txt")) ? fs.readFileSync(path.join(D, "analytics-token.txt"), "utf8").trim() : "";
  const headTags = [
    '<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>' + title + '</title>',
    '<meta name="description" content="' + desc + '">',
    '<meta name="author" content="Steven Macchia">',
    '<meta name="theme-color" content="#5B5BD6">',
    '<link rel="icon" href="' + icon + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="' + title + '">',
    '<meta property="og:description" content="' + desc + '">',
    site ? '<meta property="og:url" content="' + site + '/">' : '',
    site ? '<link rel="canonical" href="' + site + '/">' : '',
    '<meta property="og:image" content="' + img + '">',
    '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="627">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:image" content="' + img + '">',
    cfa ? "<script defer src=\"https://static.cloudflareinsights.com/beacon.min.js\" data-cf-beacon='{\"token\": \"" + cfa + "\", \"spa\": true}'></script>" : ''
  ].filter(Boolean).join("\n");
  // Path routing (/ts-workbench/<tool>) is switched on only here, on the public page: APP_BASE gets the site's path.
  // The copy hosted inside Claude keeps the placeholder and stays hash-routed.
  const appBase = site ? new URL(site).pathname.replace(/\/?$/, "/") : "";
  const body = v9.replace(/^<title>[^<]*<\/title>\s*/, "").replace('const APP_BASE = "__APP_BASE__";', () => 'const APP_BASE = "' + appBase + '";');
  const out = headTags + "\n" + body + "\n</html>\n";
  const dir = path.join(D, "..", "docs");
  if(!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, "index.html"), out);
  // Lazy sections: docs/parts/<name>.js, with no stale files left behind
  const pdir = path.join(dir, "parts");
  if(!fs.existsSync(pdir)) fs.mkdirSync(pdir);
  fs.readdirSync(pdir).forEach(f => { if(!Object.values(CHUNK_FILES).some(c => c.file === "parts/" + f)) fs.unlinkSync(path.join(pdir, f)); });
  Object.values(CHUNK_FILES).forEach(c => fs.writeFileSync(path.join(dir, c.file), c.text));
  console.log("sections written: " + Object.entries(CHUNK_FILES).map(([n, c]) => n + " " + (Buffer.byteLength(c.text) / 1024).toFixed(0) + " KB").join(", "));
  // sitemap.xml and robots.txt, from ROUTE_LABEL so they stay in step with the tools. The home page is the
  // root; the personal views (workspace, plan, quarter review) are empty for a crawler and are left out.
  // Each tool has its own path (see APP_BASE in partD.js); GitHub Pages answers those with 404.html, whose first
  // script forwards a known tool path to the app (template in _build/gen-readmes.js).
  if(site){
    const labels = new Function("return " + /const ROUTE_LABEL = (\{[^;]*\});/.exec(fs.readFileSync(path.join(D, "partNav.js"), "utf8"))[1])();
    const skip = ["overview", "workspace", "plan", "review"];
    const urls = [site + "/"].concat(Object.keys(labels).filter(k => !skip.includes(k)).map(k => site + "/" + k));
    const x = u => u.replace(/&/g, "&amp;");
    fs.writeFileSync(path.join(dir, "sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => "  <url><loc>" + x(u) + "</loc></url>").join("\n") + "\n</urlset>\n");
    fs.writeFileSync(path.join(dir, "robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: " + site + "/sitemap.xml\n");
    console.log("sitemap.xml written with " + urls.length + " URLs, robots.txt");
    // One real page per tool: docs/<route>.html. GitHub Pages serves /ts-workbench/<route> from it with a 200, so
    // crawlers get the route's own title, description and canonical (a 404.html answer never gets indexed). The page
    // is a stub, not a copy of the app: it fetches index.html from the same directory and writes it over itself
    // (document.write), so the address stays /ts-workbench/<route> and the router reads the path as usual. The beacon
    // is not repeated here: the app's own copy loads once after the write, so each visit is counted once.
    // Without JavaScript the stub shows the heading, the description and a link into the app.
    const navSrc = fs.readFileSync(path.join(D, "partNav.js"), "utf8"), aiSrc = fs.readFileSync(path.join(D, "partAI.js"), "utf8");
    const rdesc = new Function("return " + /const ROUTE_DESC = (\{[\s\S]*?\n\});/.exec(navSrc)[1])();
    const aiDesc = k => { const set = [...aiSrc.matchAll(new RegExp("AI_TOOLS\\." + k + "\\.desc = \"([^\"]*)\"", "g"))].pop(); if(set) return set[1];
      const i = aiSrc.indexOf("AI_TOOLS." + k + " = {"), m = /desc:"([^"]*)"/.exec(aiSrc.slice(i)); return m ? m[1] : ""; };
    const siteDesc = desc.replace(/&amp;/g, "&");
    const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    const fontTags = out.split("\n").filter(l => /fonts\.(googleapis|gstatic)\.com/.test(l)).join("\n");
    const stale = new Set(fs.readdirSync(dir).filter(n => n.endsWith(".html") && !["index.html", "404.html"].includes(n)));
    let routeBytes = 0, routeFiles = 0;
    Object.keys(labels).filter(k => !skip.includes(k)).forEach(k => {
      const t = labels[k] + " · T&S Workbench", d = rdesc[k] || aiDesc(k) || siteDesc, u = site + "/" + k, ti = esc(t), de = esc(d);
      const page = [
        '<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        '<title>' + ti + '</title>',
        '<meta name="description" content="' + de + '">',
        '<meta name="author" content="Steven Macchia">', '<meta name="theme-color" content="#5B5BD6">',
        '<link rel="icon" href="' + icon + '">',
        '<link rel="canonical" href="' + u + '">',
        '<meta property="og:type" content="website">', '<meta property="og:site_name" content="T&amp;S Workbench">',
        '<meta property="og:title" content="' + ti + '">', '<meta property="og:description" content="' + de + '">',
        '<meta property="og:url" content="' + u + '">', '<meta property="og:image" content="' + img + '">',
        '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="627">',
        '<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:image" content="' + img + '">',
        fontTags,
        '<script>try{var m=JSON.parse(localStorage.getItem("tswb:theme")||"null");document.documentElement.setAttribute("data-mode",m==="dark"?"dark":"light");}catch(e){}</script>',
        '<style>html{background:#F7F8FC;color:#15172B;font-family:Inter,system-ui,sans-serif}html[data-mode=dark]{background:#0E1020;color:#E8E9F5}body{margin:0;padding:32px 20px;max-width:640px}a{color:#6D5DF6}</style>',
        '<script>(function(){var r=' + JSON.stringify(k) + ';fetch("index.html",{credentials:"same-origin"}).then(function(x){if(!x.ok)throw 0;return x.text()}).then(function(h){document.open();document.write(h);document.close()}).catch(function(){location.replace("./#"+r+location.search)})})()</script>',
        '</head>', '<body>',
        '<noscript><h1>' + esc(labels[k]) + '</h1><p>' + de + '</p><p><a href="./#' + k + '">Open ' + esc(labels[k]) + ' in the T&amp;S Workbench</a></p></noscript>',
        '</body>', '</html>', ''
      ].join("\n");
      fs.writeFileSync(path.join(dir, k + ".html"), page); stale.delete(k + ".html"); routeFiles++; routeBytes += Buffer.byteLength(page);
    });
    stale.forEach(n => fs.unlinkSync(path.join(dir, n)));
    console.log("route pages written: " + routeFiles + " files, " + (routeBytes / 1024).toFixed(0) + " KB");
  }
  console.log("github-pages/index.html written" + (site ? " for " + site : " (preview image path is relative until site-url.txt is set)"));
}
