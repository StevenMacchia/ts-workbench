// Checks the demo company: a consistent program across every tool, the Exit demo pill, and a tour that finds its targets, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0];
  // a new visitor is offered the demo
  renderOverview(); eq(/data-demo="start"/.test(view.innerHTML), true, "new visitors are offered the demo");
  store.set("demo", true); demoFill();
  eq(orgReady() && !!orgGet().confirmed, true, "workspace set up"); eq(wsProfile().org, "Pixelry", "the company is Pixelry");
  const pms = Object.values(wsItems()).filter(i => i.kind === "premortem").map(i => i.title).sort().join(", ");
  eq(pms, "Pixelry Creator Subscriptions, Pixelry Market, Pixelry app", "three Pixelry products");
  const parts = rcParts(); eq(parts.every(p => p.score !== null), true, "every report card part is graded: " + parts.map(p => p.k + "=" + p.score).join(" "));
  eq(JOURNEY.filter(s => s.done()).length, 5, "five of six review steps done"); eq(jnNext().k, "act", "next step is sending gaps to a tracker");
  const xs = nxItems(); eq(xs.some(x => x.kind === "maturity" && !!x.tick), true, "roadmap items in the next moves"); eq(xs.some(x => x.kind === "premortem"), true, "launch blockers in the next moves");
  out.push("demo data: " + pms + " · grade " + rcOverall(parts).score + "/100 · " + xs.length + " next moves");
  renderOverview(); const h = view.innerHTML; if(bad(h)) throw new Error("demo overview has bad values: " + where(h));
  eq(/data-demo="start"/.test(h), false, "no demo offer while in the demo");
  // Class targets live on the overview; the last stop (#tb-demo) is the top-bar pill that demoBar() adds
  TOUR.filter(([sel]) => sel[0] === ".").forEach(([sel]) => { eq(h.includes('class="' + sel.slice(1)) || new RegExp('class="[^"]*\\b' + sel.slice(1) + '\\b').test(h), true, "tour target on the overview: " + sel); });
  eq(TOUR[TOUR.length - 1][0], "#tb-demo", "the tour ends on the exit"); eq(/data-demo="exit"/.test(DEMO_PILL) && /data-demo="about"/.test(DEMO_PILL), true, "the pill exits and reopens the welcome");
  out.push("tour: all " + TOUR.length + " targets present, ending on the Exit demo pill");
  eq(tr.org === "Pixelry" && tr.view === "report" && trProgress().pct, 100, "demo includes a complete transparency report");
  renderMaturity(); if(bad(view.innerHTML)) throw new Error("demo maturity bad: " + where(view.innerHTML));
  renderCoverage(); if(bad(view.innerHTML)) throw new Error("demo coverage bad: " + where(view.innerHTML));
  renderPolicy(); eq(/Instant checks/.test(view.innerHTML) && !bad(view.innerHTML), true, "demo policy report renders");
  out.push("maturity, coverage and policy pages render the demo cleanly");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partGD.js"), rd("partPol.js"), rd("partPol2.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partNX.js"), rd("partAI.js"), rd("partTR.js"), rd("partDEMO.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
