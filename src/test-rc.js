// Checks the report card: each part's score, what counts as graded, the weighted overall grade and the export, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const part = k => rcParts().find(p => p.k === k);
  // nothing done: no grade, every part invites
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false}); cv = {src:null, ex:false, r:{}}; mx = {platform:"social", stage:"2", reg:true, vals:{}};
  let o = rcOverall(rcParts()); eq(o.score, null, "no grade yet"); eq(o.total, 5, "five parts"); eq(rcParts().some(p => p.k === "metrics"), false, "measurement is left out for now");
  // the picture itself (not the welcome screen, which now skips it on a first fresh visit) waits on every part
  let h = asPictureHTML(false); if(bad(h)) throw new Error("blank report card has bad values");
  eq(/Appears after step 2/.test(h) && (h.match(/class="as-part open"/g) || []).length, 5, "every part waits for its step");
  renderOverview(); const welcome = view.innerHTML; if(bad(welcome)) throw new Error("welcome screen has bad values");
  eq(/id="as-pic-h"/.test(welcome), false, "a first fresh visit skips the empty program-picture card entirely");
  // examples never count as your own
  ma = maExample(); cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); eq(part("maturity").score, null, "maturity example is not graded"); eq(part("coverage").score, null, "coverage example is not graded");
  out.push("blank and examples: no grade, five parts to complete");
  // maturity: closeness to target, capped at the target
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false}); MA_AREAS.forEach(a => ma.lv[a.k] = 3); eq(part("maturity").score, 100, "every area at target");
  ma.lv.crisis = 1; eq(part("maturity").score, Math.round((7 + 1 / 3) / 8 * 100), "one area short of target");
  ma.lv.policy = 5; eq(part("maturity").score, Math.round((7 + 1 / 3) / 8 * 100), "above target doesn't earn extra");
  // coverage: needs every defense rated
  cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); cv.ex = false; eq(part("coverage").score, cvSummary(cv).cov, "coverage uses risk-weighted coverage");
  delete cv.r.child.policy; eq(part("coverage").score, null, "partial ratings aren't graded");
  cv.r.child.policy = 3;
  // launch readiness: blockers count twice
  pm = fromPreset("marketplace"); pm.example = false; pm.name = "Resale chat"; saveToLib();
  const r = assess(pm), bl = r.safeguards.filter(s => s.rank === 3), bf = r.safeguards.filter(s => s.rank === 2);
  eq(part("launch").score, 0, "nothing done yet");
  bl.forEach(s => pm.done[s.id] = true); savePM();
  eq(part("launch").score, Math.round(bl.length * 2 / (bl.length * 2 + bf.length) * 100), "blockers done, weighted double");
  // crisis readiness: strong first calls, full credit at four scenarios
  store.set("tt:progress", {[ttKey(0, "social")]:{best:4, runs:1}}); eq(part("crisis").score, Math.round(1 * (0.7 + 0.3 * 0.25) * 100), "one perfect scenario, partial credit for breadth");
  const prog = {}; [0, 1, 2, 3].forEach(i => prog[ttKey(i, "social")] = {best:2, runs:1}); store.set("tt:progress", prog); eq(part("crisis").score, 50, "four scenarios at half strong calls");
  // measurement and policy
  wsPut({id:"PT-1", kind:"policy", title:"Harassment", data:{heur:{score:60}}}); wsPut({id:"PT-2", kind:"policy", title:"Scams", data:{result:{score:80}, heur:{score:40}}});
  eq(part("policy").score, 70, "average clarity, Claude's score first");
  out.push("parts: maturity capped at target, coverage needs every rating, blockers count double, crisis rewards breadth, policy averages");
  eq(Object.values(RC_WEIGHTS).reduce((x, y) => x + y, 0), 100, "weights add up to 100");
  // overall: weighted across graded parts only
  const ps = rcParts(); o = rcOverall(ps); const g = ps.filter(p => p.score !== null), w = g.reduce((s, p) => s + RC_WEIGHTS[p.k], 0);
  eq(o.score, Math.round(g.reduce((s, p) => s + p.score * RC_WEIGHTS[p.k], 0) / w), "weighted average"); eq(o.graded, 5, "all five parts graded");
  eq(rcGrade(85)[1], "A", "A from 85"); eq(rcGrade(84)[1], "B", "B below 85"); eq(rcGrade(39)[1], "F", "F below 40");
  h = asPictureHTML(false); if(bad(h)) throw new Error("report card has bad values: " + (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0]);
  eq(new RegExp(`Grade ${rcGrade(o.score)[1]} · based on 5 of 5 parts`).test(h) && h.includes(`<b class="mono">${o.score}</b>`), true, "the program picture shows the score and grade");
  const md = rcMarkdown(); eq(/\*\*Overall: \d+ \/ 100, grade [A-F]\*\*/.test(md) && !/Measurement/.test(md), true, "markdown report card");
  out.push(`overall: ${o.score} / 100, grade ${rcGrade(o.score)[1]}, ${o.graded} of ${o.total} parts graded; markdown export`);
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
