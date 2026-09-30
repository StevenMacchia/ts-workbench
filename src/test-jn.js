// Checks the program review: step order and completion, hand-offs at the end of each tool, the leadership pack, and the report card's trend and tips, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0];
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false}); cv = {src:null, ex:false, r:{}};
  // a new visitor sees the assessment first, then starts with setup
  eq(jnNext().k, "setup", "setup comes first"); renderOverview(); let h = view.innerHTML;
  if(bad(h)) throw new Error("new-visitor overview has bad values: " + where(h));
  eq(/data-as="start"/.test(h) && !/class="card org-card"/.test(h), true, "first visit explains before asking");
  store.set("as:start", true); renderOverview(); h = view.innerHTML;
  eq(/Up next · about 1 minute/.test(h) && /class="card org-card"/.test(h), true, "setup form is the first step up");
  // each step completes in order
  orgSet({type:"marketplace", stage:"growth"}); eq(jnNext().k, "setup", "setup stays open until confirmed, so regions aren't skipped");
  eq(/data-orgdone="1" >/.test(orgCardHTML(true)) || /data-orgdone="1"\s*>/.test(orgCardHTML(true)), true, "save and continue is enabled once type and stage are set");
  orgSet({regions:["us", "eu"], confirmed:true}); eq(jnNext().k, "maturity", "then maturity");
  MA_AREAS.forEach(a => ma.lv[a.k] = 2); eq(jnNext().k, "premortem", "then a pre-mortem");
  pm = orgPrefillPM(blankPM()); eq(pm.type, "marketplace", "pre-mortem pre-filled"); pm.name = "Resale chat"; saveToLib(); eq(jnNext().k, "coverage", "then coverage");
  CV_AREAS.forEach(a => { cv.r[a.k] = {}; CV_LAYERS.forEach(l => cv.r[a.k][l.k] = 1); }); eq(jnNext().k, "dsa", "EU users: then the DSA check");
  ds = Object.assign(DS_BLANK(), {svc:"Resale", tier:"platform", size:"medium", est:"eu", view:"report"}); dsSave(); eq(jnNext().k, "crisis", "then a crisis");
  store.set("tt:progress", {[ttKey(0, "marketplace")]:{best:3, runs:1}}); eq(jnNext().k, "transparency", "EU users: then the transparency report");
  wsPut({id:"TR-1", kind:"transparency", title:"Transparency report 2025", data:{org:"Resale"}}); eq(jnNext().k, "act", "then act on it");
  eq(JOURNEY.filter(s => s.done()).length, 7, "seven of eight done");
  out.push("review: setup, maturity, pre-mortem, coverage, crisis, act, completing in order");
  // hand-offs name the next step, or offer the pack when done
  eq(/Turn gaps into a plan/.test(journeyNextHTML("crisis")), true, "tabletop hands off to the tracker step");
  renderMaturity(); h = view.innerHTML; eq(/Next in your program review/.test(h), true, "maturity plan hands off");
  renderCoverage(); eq(/Back to your assessment/.test(view.innerHTML) && /Step 4 of [0-9]/.test(view.innerHTML), true, "coverage returns to the assessment");
  store.set("tk:used", true); eq(jnNext(), undefined, "all done");
  eq(/Leadership pack/.test(journeyNextHTML("coverage")), true, "complete review offers the pack");
  renderOverview(); h = view.innerHTML; eq(/All 8 steps done/.test(h) && /class="card as-complete"/.test(h), true, "a finished assessment offers the plan first");
  out.push("hand-offs: maturity, coverage and tabletop point to the next step; a finished review offers the leadership pack");
  // leadership pack: report card, radars and priorities, as a page and a standalone file
  const inner = packInner(); if(bad(inner)) throw new Error("pack has bad values: " + where(inner));
  eq((inner.match(/class="pk-r"/g) || []).length, 3, "three radars"); eq(/Report card/.test(inner) && /Top priorities/.test(inner) && /Open launch blockers/.test(inner), true, "pack sections");
  eq(/Marketplace &amp; e-commerce · Growing · US, EU/.test(inner), true, "pack names the organization");
  const doc = packDoc(); eq(/^<!doctype html>/.test(doc) && /--t-ma:#c0308a/.test(doc), true, "standalone file with its own colors");
  eq(/Since Q/.test(inner), false, "no quarter section until one is saved");
  const sn = revSave(); sn.t -= 100 * 864e5; sn.label = "Q1 2026"; sn.score -= 9; sn.ma.lv.policy = Math.max(1, sn.ma.lv.policy - 1); store.set("as:snaps", [sn]);
  const inner2 = packInner(); eq(/<h2>Since Q1 2026<\/h2>/.test(inner2) && /class="pk-list pk-since"/.test(inner2) && /Overall score \d+ → \d+/.test(inner2), true, "the pack tells leadership what moved since last quarter");
  store.set("as:snaps", []);
  out.push("leadership pack: report card, 3 radars, priorities and blockers, printable and downloadable");
  // the program picture: grade, trend and what each step found
  store.set("rc:hist", [{d:"2026-07-01", s:40}]); renderOverview(); h = view.innerHTML;
  eq(/class="rc-trend"/.test(h) && /since Jul/.test(h), true, "trend since the first grade");
  const o = rcOverall(rcParts()); eq(new RegExp(`Grade ${rcGrade(o.score)[1]} · based on ${o.graded} of 5 parts`).test(h), true, "grade in the picture");
  eq((h.match(/<span class="as-tag"/g) || []).length, 5, "a finding from each step, the DSA check included");
  out.push(`program picture: ${o.score} / 100, grade ${rcGrade(o.score)[1]}, trend line, a finding from each step`);
  // next moves: this quarter's roadmap items, launch blockers, the biggest coverage gap; ticking one works like ticking it in its tool
  const rm = maRoadmap(ma); ma.hist = [{t:Date.now(), stage:ma.stage, lv:{}}];
  let xs = nxItems(); const mxs = xs.filter(x => x.tick && x.tick.startsWith("ma:"));
  eq(mxs.length > 0 && mxs.every(x => rm.find(s => x.tick.startsWith("ma:" + s.id + "-")).phase === "now"), true, "roadmap items from the now phase");
  eq(xs.some(x => x.kind === "premortem" && /launch blocker/.test(x.ctx)), true, "a product's next launch blocker"); eq(xs.some(x => x.kind === "coverage"), true, "the biggest coverage gap");
  eq(xs.length <= 5 && xs.filter(x => x.kind === "maturity").length <= 3, true, "short and varied");
  renderOverview(); h = view.innerHTML; if(bad(h)) throw new Error("next moves has bad values: " + where(h));
  eq(/Your next moves/.test(h) && /data-nxtick=/.test(h), true, "overview lists next moves"); eq(/nx-due|Overdue|Due (today|tomorrow|in)/.test(h), false, "no due dates in next moves");
  const pmTick = xs.find(x => x.kind === "premortem").tick, [pid, sg] = pmTick.slice(3).split("|");
  const msg = nxTick(pmTick, true); eq(libLoad()[pid].done[sg], true, "ticks the blocker in the saved pre-mortem"); eq(/Marked done/.test(msg), true, "confirms: " + msg);
  const a = rm[0], was = maLevelOf(ma, a.a.k); ma.done[a.id + "-0"] = true; const m2 = nxTick("ma:" + a.id + "-1", true); eq(maLevelOf(ma, a.a.k), was + 1, "two ticks level an area up"); eq(/is now level/.test(m2), true, "celebrates the level: " + m2);
  ma.hist = [{t:Date.now() - 100 * 864e5, stage:ma.stage, lv:{}}]; eq(nxItems().some(x => x.snap && /this quarter/.test(x.text)), true, "nudges a quarterly snapshot");
  out.push(`next moves: ${xs.length} items, this quarter's roadmap, tick from the overview (${msg}), quarterly snapshot nudge`);
  // tier 3: what changed when a saved pre-mortem is reopened
  const rec = Object.values(libLoad())[0]; pm = openRecord(rec, {stage:"report"}); pm.base = pmSnap(pm);
  eq(pmChanges(assess(pm)), null, "nothing changed yet"); pm.minors = "teens"; pm.youth = "teens";
  const before = Object.keys(pm.base.risks).length; pm.features = (pm.features || []).concat(["live", "dm"]).filter((x, i, a) => a.indexOf(x) === i);
  const ch = pmChanges(assess(pm)); eq(!!ch && ch.length > 0, true, "changes listed after new answers: " + (ch || []).join(" | ").replace(/<[^>]+>/g, "").slice(0, 120));
  eq(TRANSIENT.includes("base"), true, "the comparison point isn't saved into the library");
  out.push("tier 3: what changed after editing a saved pre-mortem");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partNX.js"), rd("partREV.js"), rd("partGD.js"), rd("partDSA.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
