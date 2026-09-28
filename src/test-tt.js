// Validates the tabletop library and renders every scenario, step, outcome and debrief without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const stub = `
const mem = {}; const store = {get:(k,d)=> k in mem ? JSON.parse(mem[k]) : d, set(k,v){ mem[k] = JSON.stringify(v); }};
const document = {addEventListener(){}, activeElement:null, getElementById(){ return null; }}; const location = {hash:"#tabletop"}; const window = {};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icon = () => ""; const $ = () => ({}), $$ = () => []; const view = {}; const head = (t,d) => "<h1>"+t+"</h1><p>"+d+"</p>"; const headCompact = (t,c) => "<h1>"+t+"</h1><p>"+c+"</p>"; const copyText = () => {};
`;
const src = stub + ["partD.js","partE1.js","partE2.js","partF1.js","_F2.js","partW1.js","_L.js","_F3.js","_G.js","_W2.js"].map(rd).join("\n") + `
const out = [], bestPos = [0,0,0]; let variants = 0;
const validTypes = TT_TYPES.map(t=>t.k).filter(k=>k!=="all");
SCENARIOS.forEach((sc, si) => {
  if(!sc.types || !sc.types.length || sc.types.some(t=>!validTypes.includes(t))) throw new Error("bad types on " + sc.title);
  if(sc.steps.length !== 4) throw new Error("step count " + sc.title);
  sc.steps.forEach((st, i) => {
    if(st.o.length !== 3) throw new Error("option count " + sc.title + " step " + i);
    const b = st.o.filter(o=>o.best).length; if(b !== 1) throw new Error("best count " + sc.title + " step " + i);
    st.o.forEach(o => { ["safety","trust","reg","team"].forEach(k => { if(typeof o.d[k] !== "number") throw new Error("delta " + sc.title); }); if(!o.l || !o.r) throw new Error("text " + sc.title); });
    if(!st.lesson || !st.h || !st.s || !st.t) throw new Error("step text " + sc.title);
    if(si >= 3) bestPos[st.o.findIndex(o=>o.best)]++;
  });
  // play it: pick option B each time, then render the debrief
  (sc.vars ? ["all"].concat(ALL_TYPES) : [undefined]).forEach(v => {
    const chk = () => { const m = view.innerHTML.match(/\{[a-z]+\}/); if(m) throw new Error("unfilled " + m[0] + " in " + sc.id + " / " + v); };
    tt = freshTT(si); tt.v = v;
    for(let i=0;i<4;i++){ tt.step=i; tt.answered=false; renderTabletop(); chk(); tt.first[i]=i%3; tt.picks[i]=i%3; tt.answered=true; renderTabletop(); chk(); }
    tt.step = 4; renderTabletop(); chk(); if(!/strongest calls/.test(view.innerHTML) || !/Lesson./.test(view.innerHTML)) throw new Error("no debrief " + sc.title);
    if(sc.vars){ variants++; }
  });
});
// learning panel on a wrong answer, then a retry
{ const si = SCENARIOS.findIndex(s=>s.id==="mules"); tt = freshTT(si); tt.first = []; tt.retried = [];
  const wrong = SCENARIOS[si].steps[0].o.findIndex(o=>!o.best), right = SCENARIOS[si].steps[0].o.findIndex(o=>o.best);
  tt.first[0] = wrong; tt.picks[0] = wrong; tt.answered = true; renderTabletop();
  ["Not the strongest call","Try this decision again","The stronger call","Law and standards","Biggest gap"].forEach(t => { if(!view.innerHTML.includes(t)) throw new Error("learning panel missing: " + t); });
  tt.retried[0] = true; tt.picks[0] = right; renderTabletop();
  if(!view.innerHTML.includes("Strong call, on your second try") || view.innerHTML.includes("Try this decision again")) throw new Error("retry state wrong");
  out.push("learning panel, comparison, law note and retry: ok");
  const lawSteps = SCENARIOS.reduce((a,s)=>a+s.steps.filter(x=>x.law).length,0); out.push("steps with law notes: " + lawSteps + " across " + SCENARIOS.filter(s=>s.steps.some(x=>x.law)).length + " scenarios"); }
out.push("scenarios: " + SCENARIOS.length + " (new: " + (SCENARIOS.length-3) + ")");
out.push("strongest answer position in new scenarios, A/B/C: " + bestPos.join("/"));
out.push("tailored variants played through: " + variants);
TT_TYPES.forEach(t => { store.set("tt:type", t.k); tt = null; renderTabletop(); const n = (view.innerHTML.match(/class="card scen[ "]/g)||[]).length;
  if(/\{[a-z]+\}/.test(view.innerHTML)) throw new Error("unfilled placeholder in list for " + t.k);
  if(t.k !== "all" && n < 12) throw new Error(t.n + " has only " + n); out.push("  " + t.n.padEnd(26) + n + " scenarios"); });
mem["tt:type"] = undefined; delete mem["tt:type"]; pm.type = "fintech"; out.push("default for a fintech pre-mortem: " + ttCompanyType());
// saved runs still summarize in the workspace
tt = {s:10, step:4, scores:{safety:70,trust:60,reg:65,team:55}, picks:[2,0,1,2], answered:false}; wsSaveTabletop();
Object.values(wsItems()).forEach(i => { if(i.kind==="tabletop") out.push("workspace summary ok: " + !/undefined|NaN/.test(itemSummary(i).html) + " (" + i.title + ")"); });
return out.join("\\n");`;
console.log(new Function(src)());
