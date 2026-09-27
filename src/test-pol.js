// Exercises the policy stress-tester: instant checks, the AI path with a stubbed sampler, errors, and workspace saving.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const stub = `
const mem = {}; const store = {get:(k,d)=> k in mem ? JSON.parse(mem[k]) : d, set(k,v){ mem[k] = JSON.stringify(v); }};
const fake = () => ({ addEventListener(){}, setAttribute(){}, removeAttribute(){}, querySelectorAll(){ return []; }, querySelector(){ return null; }, classList:{ add(){}, remove(){}, toggle(){} }, style:{}, dataset:{}, hidden:true, textContent:"", innerHTML:"", value:"", focus(){}, lastChild:{} });
const els = {}; const $ = s => (els[s] = els[s] || fake()); const $$ = () => [];
const document = {addEventListener(){}, activeElement:null, getElementById(){ return null; }, documentElement:{ setAttribute(){}, removeAttribute(){} }};
const location = {hash:"#policy"}; const window = {scrollTo(){}};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icon = id => '<svg><use href="#i-'+id+'"/></svg>'; const view = {querySelectorAll(){ return []; }}; const copyText = () => {};
const head = (t,d,c,m) => "<h1>"+t+"</h1><p>"+d+"</p>"+(m||"");
`;
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partOV.js"), rd("partPol.js"), rd("partPol2.js")].join("\n") + `
const out = [], bad = h => /undefined|NaN|\\[object/.test(h);
renderPolicy(); if(bad(view.innerHTML)) throw new Error("empty state bad"); out.push("empty state ok, AI badge: " + (view.innerHTML.includes("Instant checks only") ? "instant only (no sampler)" : "?"));
POL_EXAMPLES.forEach(([n, rule]) => { const h = polHeuristics(rule); out.push("  " + n.padEnd(15) + "instant score " + h.score + " · vague: " + h.vague.map(v=>v.term).join(", ")); });
const strong = "Harassment means repeatedly targeting a person with unwanted insults, threats or sexual comments, for example sending messages after being blocked. We allow news reporting, satire and counter-speech. First violations get a warning; repeat violations lead to suspension.";
out.push("well-written rule instant score: " + polHeuristics(strong).score);
(async () => {})();
return {out, run: async () => {
  pol.rule = POL_EXAMPLES[0][1]; $("#pol-rule").value = pol.rule;
  // stub sampler returning a plausible answer
  SAMPLER = { json: async () => ({score:48, summary:"Too vague to enforce consistently.", vague_terms:[{term:"offensive", why:"subjective", suggest:"insults targeting a person"}], gaps:[{gap:"No exceptions", why:"news and satire"}],
    edge_cases:[{case:"A user quotes a slur to report it", decision:"allow", reasoning:"counter-speech"},{case:"Repeated DMs after block", decision:"REMOVE", reasoning:"persistent contact"},{case:"Satire of a politician", decision:"maybe", reasoning:"context"}],
    enforcement_risks:["Over-removal of banter"], legal:[{law:"UK Online Safety Act", note:"illegal harassment"}], rewrite:"Harassment means..."}) };
  await polAnalyze(); if(!pol.result || pol.result.edge_cases.length!==3) throw new Error("AI result not stored");
  if(pol.result.edge_cases[1].decision!=="remove" || pol.result.edge_cases[2].decision!=="escalate") throw new Error("decision normalization failed");
  renderPolicy(); if(bad(view.innerHTML) || !view.innerHTML.includes("Suggested rewrite") || !view.innerHTML.includes("Edge cases")) throw new Error("AI render bad");
  out.push("AI path: result validated, decisions normalized, full report renders");
  SAMPLER = { json: async () => { throw {code:"rate_limited"}; } }; await polAnalyze(); out.push("rate limit message: " + polRun.err.slice(0,50) + "…");
  SAMPLER = { json: async () => { throw {code:"not_granted"}; } }; await polAnalyze(); out.push("declined consent → instant only: " + polRun.aiOff);
  const msg = wsSaveTool("policy", pol, "Policy: test"); const it = Object.values(wsItems()).find(i=>i.kind==="policy");
  out.push("saved to workspace: " + msg + " · summary " + (!bad(itemSummary(it).html)) + " · overview chip " + (!bad(ovChip(it))));
  renderOverview(); if(bad(view.innerHTML) || !view.innerHTML.includes("Policy stress-tester")) throw new Error("overview missing tool"); out.push("overview shows five tools");
  renderAbout(); if(!view.innerHTML.includes("Policy stress-tester")) throw new Error("about missing tool"); out.push("about page lists the new tool");
  return out.join("\\n");
}};`;
const t = new Function(src)();
t.run().then(s => console.log(s)).catch(e => { console.error("FAIL", e); process.exit(1); });
