// Renders the redesigned overview, shell update and command palette data without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const stub = `
const mem = {}; const store = {get:(k,d)=> k in mem ? JSON.parse(mem[k]) : d, set(k,v){ mem[k] = JSON.stringify(v); }};
const fake = () => ({ addEventListener(){}, setAttribute(){}, removeAttribute(){}, querySelectorAll(){ return []; }, querySelector(){ return null; }, classList:{ add(){}, remove(){}, toggle(){} }, style:{}, dataset:{}, hidden:true, textContent:"", innerHTML:"", value:"", focus(){} });
const els = {}; const $ = s => (els[s] = els[s] || fake()); const $$ = () => [];
const document = {addEventListener(){}, activeElement:null, getElementById(){ return null; }, documentElement:{ setAttribute(){}, removeAttribute(){} }};
const location = {hash:"#overview"}; const window = {scrollTo(){}};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icon = id => '<svg><use href="#i-'+id+'"/></svg>'; const view = {querySelectorAll(){ return []; }}; const copyText = () => {};
const head = (t,d,c,m) => "<h1>"+t+"</h1><p>"+d+"</p>"+(m||"");
const headCompact = (t,c,m) => "<h1>"+t+"</h1><p>"+c+"</p>"+(m||"");
`;
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js")].join("\n") + `
const out = [];
const bad = h => /undefined|NaN|\\[object/.test(h);
pm = blankPM(); renderOverview(); if(bad(view.innerHTML)) throw new Error("blank overview has bad values");
out.push("blank overview: " + (view.innerHTML.includes("before it launches") ? "intro hero" : "?") + ", " + view.innerHTML.length + " chars");
Object.keys(PRESETS).forEach(k => { pm = fromPreset(k); renderOverview(); if(bad(view.innerHTML)) throw new Error("bad overview for " + k); });
out.push("overview renders for all " + Object.keys(PRESETS).length + " examples");
store.set("ws:profile", {name:"Alex Rivera", role:"Head of T&S", org:"Acme"});
pm = fromPreset("marketplace"); pm.example = false; pm.name = "Resale chat"; saveToLib();
tt = {s:3, v:"marketplace", step:4, scores:{safety:70,trust:60,reg:65,team:55}, picks:[1,1,1,1], first:[1,0,1,1], retried:[], answered:false}; wsSaveTabletop();
mx = {platform:"market", stage:"2", reg:true}; wsSaveTool("metrics", mx, metricsTitle(mx));
vx = JSON.parse(JSON.stringify(DEFAULT_V)); wsSaveTool("vendors", vx, vendorsTitle(vx));
renderOverview(); if(bad(view.innerHTML)) throw new Error("bad overview with saved work");
out.push("overview with saved work: greeting " + (view.innerHTML.includes("Alex") ? "personalised" : "missing name") + ", rows " + (view.innerHTML.match(/class="ov-row"/g)||[]).length);
shellUpdate("overview"); out.push("sidebar recent: " + ((els["#sb-pins"].innerHTML.match(/sb-pin/g)||[]).length) + " items; profile: " + (els["#sb-me"].innerHTML.includes("Alex Rivera") ? "shown" : "missing"));
const items = cmdkItems(); const groups = [...new Set(items.map(x=>x.g))];
out.push("command palette: " + items.length + " items in groups " + groups.join(", "));
renderAbout(); if(bad(view.innerHTML)) throw new Error("bad about page"); out.push("about page: " + (view.innerHTML.match(/class="ab-sec/g)||[]).length + " sections, stats " + (view.innerHTML.match(/<b class="mono">\\d+/g)||[]).map(s=>s.replace(/\\D/g,"")).join("/"));
pm = fromPreset("dating"); const rep = renderReport(assess(pm)); if(!rep.includes("rep-title") || !rep.includes("rep-detail") || bad(rep)) throw new Error("report header patch missing");
out.push("report header: document title and detail section present");
return out.join("\\n");`;
console.log(new Function(src)());
