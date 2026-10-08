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
  ["Not the strongest call",'id="tt-retry"',"The stronger call","Law and standards","Biggest gap"].forEach(t => { if(!view.innerHTML.includes(t)) throw new Error("learning panel missing: " + t); });
  tt.retried[0] = true; tt.picks[0] = right; renderTabletop();
  if(!view.innerHTML.includes("Strong call, on your second try") || view.innerHTML.includes('id="tt-retry"')) throw new Error("retry state wrong");
  out.push("learning panel, comparison, law note and retry: ok");
  const lawSteps = SCENARIOS.reduce((a,s)=>a+s.steps.filter(x=>x.law).length,0); out.push("steps with law notes: " + lawSteps + " across " + SCENARIOS.filter(s=>s.steps.some(x=>x.law)).length + " scenarios"); }
out.push("scenarios: " + SCENARIOS.length + " (new: " + (SCENARIOS.length-3) + ")");
out.push("strongest answer position in new scenarios, A/B/C: " + bestPos.join("/"));
out.push("tailored variants played through: " + variants);
// Every universal scenario has its own version for each company type: a distinct title, a blurb and four scenes, with no leftover placeholders
{ const uni = SCENARIOS.map((s, i) => ({s, i})).filter(x => x.s.tailored);
  uni.forEach(({s, i}) => validTypes.forEach(k => { const ver = TT_VERSIONS[s.id] && TT_VERSIONS[s.id][k];
    if(!ver || !ver.title || !ver.blurb || !Array.isArray(ver.scenes) || ver.scenes.length !== s.steps.length) throw new Error("missing version: " + s.id + " for " + k);
    const v = ttScenario(i, k); if(v.title === s.title) throw new Error("generic title kept: " + s.id + " for " + k);
    [v.title, v.blurb, ...v.steps.map(st => st.s)].forEach(t => { if(/[{][a-zA-Z]+[}]/.test(t)) throw new Error("unfilled placeholder in " + s.id + " for " + k + ": " + t); }); }));
  validTypes.forEach(k => { const titles = SCENARIOS.map((s, i) => ttScenario(i, k)).filter(s => (s.types || []).includes(k)).map(s => s.title.toLowerCase());
    const dup = titles.find((t, n) => titles.indexOf(t) !== n); if(dup) throw new Error("duplicate title for " + k + ": " + dup); });
  out.push("company-type versions: " + uni.length + " scenarios x " + validTypes.length + " types, all distinct"); }
// Every scenario cites public evidence: a short claim, a named source, an https link and a date; it shows at decision 1 and in the debrief
{ let facts = 0; SCENARIOS.forEach((s, i) => { const e = TT_EVIDENCE[s.id]; if(!e) throw new Error("no evidence for " + s.id);
    [e].concat(Object.values(e.byType || {})).forEach(x => { facts++; if(!x.claim || x.claim.split(" ").length > 45 || !x.source || x.url.indexOf("https://") !== 0 || !/^20[0-9][0-9]/.test(x.published)) throw new Error("bad evidence for " + s.id + ": " + JSON.stringify(x).slice(0, 120)); }); });
  const k = SCENARIOS.findIndex(s => s.id === "ato"); tt = Object.assign(freshTT(k), {v:"fintech"}); renderTabletop();
  if(!view.innerHTML.includes("Why this scenario") || !view.innerHTML.includes(TT_EVIDENCE.ato.byType.fintech.url)) throw new Error("evidence missing at decision 1");
  tt.step = tt.picks.length = 4; tt.first = [0,0,0,0]; tt.picks = [0,0,0,0]; renderTabletop(); if(!view.innerHTML.includes("last reviewed " + TT_EVIDENCE_REVIEWED)) throw new Error("evidence missing in debrief");
  tt = null; out.push("evidence: " + SCENARIOS.length + " scenarios sourced, " + facts + " facts, shown at decision 1 and in the debrief"); }
TT_TYPES.forEach(t => { store.set("tt:type", t.k); tt = null; renderTabletop(); const n = (view.innerHTML.match(/class="card scen[ "]/g)||[]).length;
  if(/\{[a-z]+\}/.test(view.innerHTML)) throw new Error("unfilled placeholder in list for " + t.k);
  if(t.k !== "all" && n < 12) throw new Error(t.n + " has only " + n); out.push("  " + t.n.padEnd(26) + n + " scenarios"); });
// "Just show me one": the highest-severity, not-yet-completed scenario is one click away, skipping the type/mode/filter stack
store.set("tt:type", "social"); tt = null; renderTabletop();
{
  const ttType = "social", prog = ttProgress();
  const all = SCENARIOS.map((s,i)=>({s:ttScenario(i, ttType), i})).filter(x => ttType==="all" || (x.s.types||[]).includes(ttType))
    .sort((a,b) => (a.s.tailored?1:0) - (b.s.tailored?1:0));
  const pOf = x => prog[ttKey(x.i, ttType)];
  const bestFit = ttBestFit(all, pOf);
  if(!bestFit) throw new Error("no best-fit scenario found for social");
  if(!view.innerHTML.includes('id="tt-one"')) throw new Error("no just-show-me-one button for social");
  if(!view.innerHTML.includes(esc(bestFit.s.title))) throw new Error("just-show-me-one doesn't name the highest-severity scenario: wanted " + bestFit.s.title);
  out.push('just show me one: starts "' + bestFit.s.title + '" (' + bestFit.s.severity + '), skipping the type, mode and filter choices');
}
mem["tt:type"] = undefined; delete mem["tt:type"]; pm.type = "fintech"; out.push("default for a fintech pre-mortem: " + ttCompanyType());
// saved runs still summarize in the workspace
tt = {s:10, step:4, scores:{safety:70,trust:60,reg:65,team:55}, picks:[2,0,1,2], answered:false}; wsSaveTabletop();
Object.values(wsItems()).forEach(i => { if(i.kind==="tabletop") out.push("workspace summary ok: " + !/undefined|NaN/.test(itemSummary(i).html) + " (" + i.title + ")"); });
return out.join("\\n");`;
console.log(new Function(src)());
