// Renders the guided vendor scorecard and checks ranking, dealbreakers and the explanation, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  CRITERIA.forEach(c => { if(!VD_Q[c.k] || !VD_RUBRIC[c.k] || VD_RUBRIC[c.k].length !== 3) throw new Error("criterion missing guide: " + c.k); });
  // the example is fully scored, so it opens on the result; the one-page scorecard is a click away
  vx = JSON.parse(JSON.stringify(DEFAULT_V)); vdView = null; renderVendors(); let h = view.innerHTML; if(bad(h)) throw new Error("bad result html");
  eq(/Vendor B comes out ahead/.test(h) && /data-vd="page"/.test(h), true, "result first for a scored example");
  vdView = "page"; renderVendors(); h = view.innerHTML;
  if(bad(h)) throw new Error("bad vendor html");
  eq((h.match(/class="card vd-crit"/g)||[]).length, CRITERIA.length, "one card per criterion");
  const rfpOpenAt = h.indexOf('<details class="vd-rfp" open>');
  eq((h.match(/<details class="vd-rfp" open>/g) || []).length, 1, "exactly one criterion's RFP opens by default");
  eq(rfpOpenAt > -1 && rfpOpenAt < h.indexOf(esc(VD_Q[CRITERIA[1].k])), true, "it's the first criterion that opens, to teach the pattern once");
  eq((h.match(/role="radio"/g)||[]).length, CRITERIA.length * vx.vendors.length * 5, "1-5 buttons per vendor per criterion");
  eq((h.match(/aria-checked="true"/g)||[]).length, CRITERIA.length * vx.vendors.length, "one selected score each");
  const r = vdRank(); eq(r.top.v.name, "Vendor B", "example winner");
  eq(r.sorted[r.sorted.length - 1].flags.length > 0, true, "ruled-out vendor ranks last");
  eq(/ranks first/.test(vdWhy()) && /wins mainly on/.test(vdWhy()), true, "explains the ranking");
  out.push("vendors: " + CRITERIA.length + " criteria with questions and rubrics; winner " + r.top.v.name + "; " + r.sorted.filter(x => x.flags.length).length + " ruled out");
  // start your own: two blank vendors, nothing ranked until fully scored
  const ex = JSON.parse(JSON.stringify(vx));
  vx = {weights:JSON.parse(JSON.stringify(DEFAULT_V.weights)), vendors:[vdBlank("Acme Trust"), vdBlank("Beta Review")], open:null}; renderVendors();
  eq(/Score each vendor on all/.test(vdWhy()) && vdRank().top, null, "no result until scored"); eq((view.innerHTML.match(/aria-checked="true"/g) || []).length, 0, "blank vendors start unscored");
  if(/undefined|NaN/.test(view.innerHTML)) throw new Error("blank vendors render bad values");
  CRITERIA.forEach(c => { vx.vendors[0].s[c.k] = 4; }); eq(vdRank().top.v.name, "Acme Trust", "a fully scored vendor ranks while the other is still scoring"); eq(/Finish scoring <b>Beta Review<\/b> to compare/.test(vdWhy()) && /Leading so far/.test(vdRailHTML()), true, "says the comparison isn't finished");
  vx.vendors.push(vdBlank("Vendor C"), vdBlank("Vendor D")); renderVendors(); eq(/Add a vendor/.test(view.innerHTML), false, "four is the maximum");
  eq((view.innerHTML.match(/data-vdel=/g) || []).length, 4, "each vendor can be removed while more than two remain");
  vx.weights = Object.assign({}, VD_PRESETS[3][2]); eq(vdPresetOn(), "regulated", "presets set the weights"); eq(vdTotal(), 100, "presets add up to 100");
  vx.weights = {quality:40, wellness:40, lang:20, surge:0, security:20, cost:0, tooling:0, reporting:0}; vdNormalize(); eq(vdTotal(), 100, "normalizes to 100"); eq(vx.weights.quality, 35, "keeps proportions in steps of 5");
  out.push("own comparison: blank vendors, 2 to 4 vendors, presets and normalizing");
  // guided: what matters, the shortlist, then one criterion per screen with the ranking beside it
  vx = {weights:{}, vendors:[vdBlank("Acme Trust"), vdBlank("Beta Review")], open:null}; vdView = null; gdReset("vendors"); renderVendors(); h = view.innerHTML;
  eq(/Which moderation vendor should you trust/.test(h) && /data-gd="start"/.test(h), true, "guided intro for a blank comparison");
  gdGo(gdCur, "start"); eq(/What matters most in this choice\?/.test(view.innerHTML), true, "what matters first"); gdPick(gdCur, "regulated"); eq(vdPresetOn(), "regulated", "preset sets the weights"); gdGo(gdCur, "next");
  eq(/Who are you comparing\?/.test(view.innerHTML) && (view.innerHTML.match(/class="input vname"/g) || []).length, 2, "the shortlist"); gdGo(gdCur, "next");
  eq(gdLive(gdCur).length, 2 + CRITERIA.length, "one screen per criterion"); eq(view.innerHTML.includes(esc(VD_Q.quality)) && /class="card vd-railc gd-rail"/.test(view.innerHTML), true, "the first criterion with the live ranking beside it");
  eq(view.innerHTML.includes('data-gd="next" disabled'), true, "can't continue until every vendor is scored");
  vx.vendors.forEach(v => v.s.quality = 4); renderVendors(); eq(view.innerHTML.includes('data-gd="next" disabled'), false, "scored: continue");
  CRITERIA.forEach(c => vx.vendors.forEach((v, i) => v.s[c.k] = i ? 3 : 4)); gdReset("vendors"); renderVendors(); eq(/Acme Trust comes out ahead/.test(view.innerHTML), true, "all scored: the result");
  out.push("guided: what matters, shortlist, " + CRITERIA.length + " criteria one per screen, result at the end");
  vx = ex;
  vx.vendors.forEach(v => v.s.wellness = 1); eq(vdRank().top, null, "all fail a minimum"); eq(/No vendor meets the minimums/.test(vdWhy()), true, "says none qualify");
  eq(/Weights add up to 100/.test(vdRailHTML()), true, "weights total check");
  vx.weights.cost = 40; eq(/Weights add up to 130/.test(vdRailHTML()), true, "flags weights not totalling 100");
  out.push("dealbreakers and weight totals handled; workspace summary: " + (vendorResult(vx) ? "has winner" : "none qualify"));
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partGD.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
