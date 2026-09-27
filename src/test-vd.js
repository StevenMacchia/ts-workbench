// Renders the guided vendor scorecard and checks ranking, dealbreakers and the explanation, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  CRITERIA.forEach(c => { if(!VD_Q[c.k] || !VD_RUBRIC[c.k] || VD_RUBRIC[c.k].length !== 3) throw new Error("criterion missing guide: " + c.k); });
  vx = JSON.parse(JSON.stringify(DEFAULT_V)); renderVendors(); const h = view.innerHTML;
  if(bad(h)) throw new Error("bad vendor html");
  eq((h.match(/class="card vd-crit"/g)||[]).length, CRITERIA.length, "one card per criterion");
  eq((h.match(/role="radio"/g)||[]).length, CRITERIA.length * vx.vendors.length * 5, "1-5 buttons per vendor per criterion");
  eq((h.match(/aria-checked="true"/g)||[]).length, CRITERIA.length * vx.vendors.length, "one selected score each");
  const r = vdRank(); eq(r.top.v.name, "Vendor B (T&S specialist)", "example winner");
  eq(r.sorted[r.sorted.length - 1].flags.length > 0, true, "ruled-out vendor ranks last");
  eq(/ranks first/.test(vdWhy()) && /wins mainly on/.test(vdWhy()), true, "explains the ranking");
  out.push("vendors: " + CRITERIA.length + " criteria with questions and rubrics; winner " + r.top.v.name + "; " + r.sorted.filter(x => x.flags.length).length + " ruled out");
  vx.vendors.forEach(v => v.s.wellness = 1); eq(vdRank().top, null, "all fail a minimum"); eq(/No vendor meets the minimums/.test(vdWhy()), true, "says none qualify");
  eq(/Weights add up to 100/.test(vdRailHTML()), true, "weights total check");
  vx.weights.cost = 40; eq(/Weights add up to 130/.test(vdRailHTML()), true, "flags weights not totalling 100");
  out.push("dealbreakers and weight totals handled; workspace summary: " + (vendorResult(vx) ? "has winner" : "none qualify"));
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partOV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
