// Renders the overview's safety picture (maturity, all products, by product) in empty, partial and complete states, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const cards = h => (h.match(/class="card ov-pc[ "]/g) || []).length, empties = h => (h.match(/class="card ov-pc ov-pc-empty"/g) || []).length;
  // nothing done yet: three invitations
  ma = {stage:"growth", lv:{}, done:{}, ex:false, open:"policy"}; pm = blankPM(); renderOverview(); let h = view.innerHTML;
  if(bad(h)) throw new Error("blank overview has bad values: " + (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0]);
  eq(cards(h), 3, "three radar cards"); eq(empties(h), 3, "all three invite when blank"); eq(/0 of 3 complete/.test(h), true, "progress starts at 0");
  eq(/How mature is your program\?/.test(h) && /How could your products be misused\?/.test(h) && /One radar per product/.test(h), true, "each card invites");
  eq(/Complete the picture/.test(h) && /Not started/.test(h), true, "checklist shows what's left"); eq(/aria-label="Current assessment"/.test(h), false, "pre-mortem hero moved off the overview");
  out.push("blank: 3 invitation cards, 0 of 3 complete, checklist");
  // the maturity example doesn't count as your own rating
  ma = JSON.parse(JSON.stringify(MA_EXAMPLE)); renderOverview(); eq(empties(view.innerHTML), 3, "example maturity still invites");
  // partial maturity and one saved pre-mortem
  ma = {stage:"growth", lv:{policy:3, crisis:1}, done:{}, ex:false, open:"detection"};
  pm = fromPreset("marketplace"); pm.example = false; pm.name = "Resale chat"; saveToLib(); renderOverview(); h = view.innerHTML;
  if(bad(h)) throw new Error("partial overview has bad values: " + (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0]);
  eq(empties(h), 0, "no invitations once started"); eq(/2 of 8 areas rated/.test(h) && /Continue rating/.test(h), true, "partial maturity");
  eq(/Combined risk across 1 pre-mortem/.test(h) && /add another product to compare/.test(h), true, "combined radar with one product");
  eq(/2 of 3 complete/.test(h), true, "pre-mortems count for two views"); eq(/Next, finish rating your program's maturity/.test(h), true, "subtitle names the next step");
  out.push("partial: maturity 2 of 8, one product, 2 of 3 complete");
  // complete: every area rated and two products
  MA_AREAS.forEach(a => ma.lv[a.k] = 3); pm = fromPreset("dating"); pm.example = false; pm.name = "Match chat"; pm.id = null; pm.saved = false; saveToLib(); renderOverview(); h = view.innerHTML;
  if(bad(h)) throw new Error("complete overview has bad values");
  eq(/3 of 3 complete/.test(h) && /picture is complete/.test(h), true, "complete");
  eq(/Combined risk across 2 pre-mortems/.test(h), true, "two products combined"); const picHTML = h.slice(h.indexOf("ov-pics"), h.indexOf("</section>", h.indexOf("ov-pics"))); eq((picHTML.match(/stroke-dasharray="3 3"/g) || []).length, 2, "one outline per product");
  eq(/id="ov-pm-sel"/.test(h) && (h.match(/<option value=/g) || []).length >= 2, true, "product picker");
  const pms = ovSavedPMs(), comb = RADAR_GROUPS.map((g, i) => Math.max(...pms.map(p => p.g[i].score)));
  eq(comb.every((v, i) => v >= pms[0].g[i].score && v >= pms[1].g[i].score), true, "combined is the worst of each group");
  store.set("ov:pm", pms[1].it.id); renderOverview(); eq(new RegExp('value="' + pms[1].it.id + '" selected').test(view.innerHTML), true, "picker remembers the choice");
  out.push("complete: 3 of 3, combined radar over 2 products, picker switches products");
  // pre-mortem landing shows the current assessment and a radar per saved one
  pm.stage = "start"; const land = pmCurrentHero() + libraryBlock(); eq(/aria-label="Current assessment"/.test(land), true, "landing hero");
  eq((land.match(/class="mini-radar"/g) || []).length, 2, "mini radar per saved pre-mortem"); if(bad(land)) throw new Error("landing has bad values");
  out.push("pre-mortem landing: current assessment hero and a mini radar on each saved assessment");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
