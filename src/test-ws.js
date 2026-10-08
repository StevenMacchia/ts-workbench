// Exercises the workspace store, tool saves and dashboard rendering without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const stub = `
const mem = {}; const store = {get:(k,d)=> k in mem ? JSON.parse(mem[k]) : d, set(k,v){ mem[k] = JSON.stringify(v); }};
mem["lib"] = JSON.stringify({"TSW-OLD1": {id:"TSW-OLD1", name:"Legacy assessment", type:"dating", youth:"adult_self", aud:[], adult:"none", identity:"real", contact:"limited", money:["subs"], regions:["us"], scale:"mid", team:"dedicated", features:["dm","profiles","meetups"], done:{}, notes:{}, saved:true, created:1, updated:2}});
const document = {addEventListener(){}, activeElement:null, getElementById(){ return null; }}; const location = {hash:"#workspace"}; const window = {};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icon = () => ""; const $ = () => null, $$ = () => []; const view = {}; const head = (t,d,c,m) => "<h1>"+t+"</h1>"+(m||""); const copyText = () => {};
`;
const src = stub + ["partD.js","partE1.js","partE2.js","partF1.js","_F2.js","partW1.js","_L.js","_F3.js","_G.js","_W2.js"].map(rd).join("\n") + `
const out = [];
out.push("migrated legacy: " + Object.values(wsItems()).map(i=>i.kind+":"+i.title).join(", "));
// profile + project
store.set("ws:profile", {name:"Alex Rivera", role:"Head of T&S", org:"Acme"});
const pr = wsProjects(); pr["PRJ-1"] = {id:"PRJ-1", name:"Marketplace launch", desc:"Q3", created:Date.now(), updated:Date.now()}; wsSaveProjects(pr); store.set("ws:active", "PRJ-1");
// pre-mortem saved into the active project
pm = fromPreset("marketplace"); pm.example = false; pm.name = "Resale chat"; saveToLib();
out.push("pre-mortem project: " + wsItems()[pm.id].projectId + " | libLoad count: " + Object.keys(libLoad()).length);
// tabletop run
tt = {s:0, step:4, scores:{safety:80,trust:70,reg:75,team:55}, picks:[0,0,1,0], answered:false}; wsSaveTabletop();
// metrics: save new then save changes
mx = {platform:"market", stage:"2", reg:true}; out.push("metrics label before: " + wsSaveLabel("metrics")); out.push("metrics save: " + wsSaveTool("metrics", mx, metricsTitle(mx)));
out.push("metrics label after: " + wsSaveLabel("metrics")); mx.stage = "3"; out.push("metrics resave: " + wsSaveTool("metrics", mx, metricsTitle(mx)));
// vendors
vx = JSON.parse(JSON.stringify(DEFAULT_V)); out.push("vendors save: " + wsSaveTool("vendors", vx, vendorsTitle(vx)));
const items = Object.values(wsItems());
out.push("items: " + items.map(i=>i.kind+"("+(i.projectId||"none")+")").join(", "));
items.forEach(i => { const s = itemSummary(i); if(!s.html || /undefined|NaN/.test(s.html)) throw new Error("bad summary for " + i.kind + ": " + s.html); });
const html = profileCard() + projectCards(items) + itemRows(items);
if(/undefined|NaN/.test(html)) throw new Error("bad dashboard html");
wsUI.editProfile = true; profileCard(); wsUI.newProject = true; wsUI.editProject = "PRJ-1"; wsUI.confirm = "proj:PRJ-1"; wsUI.rename = items[0].id; projectCards(items); itemRows(items);
out.push("dashboard html ok (" + html.length + " chars)");
pm.saved = true; out.push("project picker: " + (pmProjectSelect().includes("Marketplace launch") ? "ok" : "MISSING"));
out.push("report still renders: " + (renderReport(assess(pm)).length > 1000 ? "ok" : "short"));
return out.join("\\n");`;
console.log(new Function(src)());

// A fresh workspace, with nothing migrated and nothing saved: the stat tiles stay hidden,
// the "nothing saved" invitation shows in their place, and "New project" carries a nudge
// until there are a few results to actually group.
const stub2 = `
const mem = {}; const store = {get:(k,d)=> k in mem ? JSON.parse(mem[k]) : d, set(k,v){ mem[k] = JSON.stringify(v); }};
const fake = () => ({ addEventListener(){}, setAttribute(){}, removeAttribute(){}, querySelectorAll(){ return []; }, querySelector(){ return null; }, classList:{ add(){}, remove(){}, toggle(){} }, style:{}, dataset:{}, hidden:true, textContent:"", innerHTML:"", value:"", focus(){} });
const els = {}; const $ = s => (els[s] = els[s] || fake()); const $$ = () => [];
const document = {addEventListener(){}, activeElement:null, getElementById(){ return null; }}; const location = {hash:"#workspace"}; const window = {};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icon = () => ""; const view = {}; const head = (t,d,c,m) => "<h1>"+t+"</h1>"+(m||""); const copyText = () => {};
`;
const src2 = stub2 + ["partD.js","partE1.js","partE2.js","partF1.js","_F2.js","partW1.js","_L.js","_F3.js","_G.js","_W2.js"].map(rd).join("\n") + `
const out = [];
const eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
renderWorkspace(); let h = view.innerHTML;
eq(/undefined|NaN/.test(h), false, "empty workspace renders cleanly");
eq(/class="wsstats"/.test(h), false, "no stat-tile dashboard when nothing is saved");
eq(/Nothing saved here yet/.test(h), true, "the invitation shows in its place");
eq(/With 0 saved so far, you probably don't need one yet/.test(h), true, "New project carries a nudge");
out.push("empty workspace: no .wsstats, the invitation shows instead, New project is nudged");
// one result saved: still under three, the nudge stays and the stats reappear
pm = fromPreset("dating"); pm.example = false; pm.name = "First one"; saveToLib();
renderWorkspace(); h = view.innerHTML;
eq(/class="wsstats"/.test(h), true, "stats return once something is saved");
eq(/probably don't need one yet/.test(h), true, "nudge still shows with only one result");
// two more: at three, the nudge drops
tt = {s:0, step:4, scores:{safety:80,trust:70,reg:75,team:55}, picks:[0,0,1,0], answered:false}; wsSaveTabletop();
mx = {platform:"market", stage:"2", reg:true}; wsSaveTool("metrics", mx, metricsTitle(mx));
renderWorkspace(); h = view.innerHTML;
eq(Object.keys(wsItems()).length, 3, "three results now saved");
eq(/probably don't need one yet/.test(h), false, "the nudge drops once there are a few results");
out.push("New project nudge: shown under three results, gone at three");
return out.join("\\n");`;
console.log(new Function(src2)());
