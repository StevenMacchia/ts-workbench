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
const scenarioLib = [rd("partS1.js"), S2.slice(0, cut), rd("partS3.js"), rd("partS4.js"), rd("partS5.js"), rd("partS6.js"), rd("partS7.js"), rd("partS8.js"), rd("partS9.js"), S2.slice(cut), rd("partS10.js")].join("\n");
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

const I = patch(rd("partI3.svg"), [
  [`  <symbol id="i-sun"`, `  <symbol id="i-user" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.9-3.9 3.9-6.2 7.5-6.2s6.6 2.3 7.5 6.2"/></g></symbol>\n  <symbol id="i-sun"`]
], "partI3");

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

/* ---------- v9: studio redesign (new shell, theme layer, overview, command palette) ---------- */
{
  const A9 = patch(rd("partA.html"), [[
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Public+Sans:wght@400;500;600;700&family=Schibsted+Grotesk:wght@600;700&display=swap">`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">`
  ]], "partA fonts");
  const C3 = rd("partC3.html"), a = C3.indexOf('<div class="app">'), b = C3.indexOf("\n<script>\n(function(){");
  if(a < 0 || b < 0) throw new Error("partC3 split points not found");
  const C9 = C3.slice(0, a) + rd("partShell.html") + C3.slice(b);
  const W9 = patch(W2, [[`function goRoute(r){ if(location.hash.slice(1)===r) ROUTES[r](); else location.hash = r; }`,
    `function goRoute(r){ if(location.hash.slice(1)===r){ ROUTES[r](); shellUpdate(r); window.scrollTo(0,0); } else location.hash = r; }`]], "partW2 goRoute");
  const R9 = patch(R, [[`const h = (location.hash || '').slice(1);`, `const h = (location.hash || '').slice(1).split('/')[0];`], [`  ROUTES[name]();`, `  ROUTES[name]();\n  shellUpdate(name);`],
    [`const ROUTES = {overview:renderOverview, workspace:renderWorkspace, `, `const ROUTES = {overview:renderOverview, workspace:renderWorkspace, tools:renderTools, plan:renderPlan, review:renderReview, about:renderAbout, policy:renderPolicy, `], [`policy:renderPolicy, `, `policy:renderPolicy, coppa:renderCoppa, maturity:renderMaturity, coverage:renderCoverage, notice:()=>renderAI("notice"), appeal:()=>renderAI("appeal"), transparency:()=>renderAI("transparency"), `]], "partR shell");
  // Report header becomes a document title; the detail heading gets its own spacing hook
  const F3_9 = patch(F3, [
    [`<div class="card"><div class="card-b" style="display:grid;gap:10px">\n      <div class="row" style="justify-content:space-between"><div><h2 style="font-size:20px">`,
     `<div class="rephead"><div class="rephead-b">\n      <div class="row" style="justify-content:space-between;align-items:flex-end"><div><span class="rep-kicker"><span class="sb-glyph" style="background:var(--t-pm)"><svg><use href="#i-radar"/></svg></span>Abuse pre-mortem report</span><h2 class="rep-title">`],
    [`<div class="section-title" style="margin-top:28px"><h2>The detail</h2>`, `<div class="section-title rep-detail"><h2>The detail</h2>`]
  ], "partF3 report header");
  const css9 = [A9, rd("partB.css"), rd("partB2.css"), rd("partB3.css"), rd("partB4.css"), rd("partB5.css")].join("") + ttCss + rd("partZ.css") + rd("partZ2.css") + rd("partZ3.css") + rd("partZ4.css") + rd("partZ5.css") + rd("partZ6.css") + rd("partZ7.css") + rd("partZ8.css");
  const body9 = [I, C9, rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), F2, rd("partW1.js"), L, F3_9, G2, W9, rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partPF.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partNX.js"), rd("partTTF.js"), rd("partTR.js"), rd("partDEMO.js"), rd("partHELP.js"), rd("partTYPE.js"), rd("partGD.js"), rd("partCP.js"), rd("partLOOP.js"), rd("partPLAN.js"), rd("partREV.js"), R9].join("");
  fs.writeFileSync(path.join(D, "_F3_9.js"), F3_9);
  const STANDALONE_BUILD = true;
fs.writeFileSync(path.join(D, "ts-workbench-v9.html"), css9 + "</style>\n" + body9);
  fs.writeFileSync(path.join(D, "_W9.js"), W9);
  console.log("v9 assembled");
}

// Standalone copy for GitHub Pages: a full document with mobile, preview and icon tags
{
  const v9 = fs.readFileSync(path.join(D, "ts-workbench-v9.html"), "utf8");
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
    '<meta property="og:image" content="' + img + '">',
    '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="627">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:image" content="' + img + '">',
    cfa ? "<script defer src=\"https://static.cloudflareinsights.com/beacon.min.js\" data-cf-beacon='{\"token\": \"" + cfa + "\"}'></script>" : ''
  ].filter(Boolean).join("\n");
  const body = v9.replace(/^<title>[^<]*<\/title>\s*/, "");
  const out = headTags + "\n" + body + "\n</html>\n";
  const dir = path.join(D, "..", "docs");
  if(!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, "index.html"), out);
  console.log("github-pages/index.html written" + (site ? " for " + site : " (preview image path is relative until site-url.txt is set)"));
}
