// Checks the program review: step order and completion, hand-offs at the end of each tool, the leadership pack, and the report card's trend and tips, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0];
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false}); cv = {src:null, ex:false, r:{}};
  // a new visitor starts with setup, inside the review
  eq(jnNext().k, "setup", "setup comes first"); renderOverview(); let h = view.innerHTML;
  if(bad(h)) throw new Error("new-visitor overview has bad values: " + where(h));
  eq(/Start here: tell the workbench/.test(h) && /class="card org-card"/.test(h), true, "setup form in the review");
  // each step completes in order
  orgSet({type:"marketplace", stage:"growth"}); eq(jnNext().k, "setup", "setup stays open until confirmed, so regions aren't skipped");
  eq(/data-orgdone="1" >/.test(jnHTML()) || /data-orgdone="1"\s*>/.test(jnHTML()), true, "save and continue is enabled once type and stage are set");
  orgSet({regions:["us", "eu"], confirmed:true}); eq(jnNext().k, "maturity", "then maturity");
  MA_AREAS.forEach(a => ma.lv[a.k] = 2); eq(jnNext().k, "premortem", "then a pre-mortem");
  pm = orgPrefillPM(blankPM()); eq(pm.type, "marketplace", "pre-mortem pre-filled"); pm.name = "Resale chat"; saveToLib(); eq(jnNext().k, "coverage", "then coverage");
  CV_AREAS.forEach(a => { cv.r[a.k] = {}; CV_LAYERS.forEach(l => cv.r[a.k][l.k] = 1); }); eq(jnNext().k, "crisis", "then a crisis");
  store.set("tt:progress", {[ttKey(0, "marketplace")]:{best:3, runs:1}}); eq(jnNext().k, "act", "then act on it");
  eq(JOURNEY.filter(s => s.done()).length, 5, "five of six done");
  out.push("review: setup, maturity, pre-mortem, coverage, crisis, act, completing in order");
  // hand-offs name the next step, or offer the pack when done
  eq(/Turn the gaps into work/.test(journeyNextHTML("crisis")), true, "tabletop hands off to the tracker step");
  renderMaturity(); h = view.innerHTML; eq(/Next in your program review/.test(h), true, "maturity plan hands off");
  renderCoverage(); eq(/Next in your program review/.test(view.innerHTML), true, "coverage hands off");
  store.set("tk:used", true); eq(jnNext(), undefined, "all done");
  eq(/Leadership pack/.test(journeyNextHTML("coverage")), true, "complete review offers the pack");
  renderOverview(); h = view.innerHTML; eq(/Program review complete/.test(h) && !/jn-steps/.test(h), true, "a finished review shrinks to one line");
  out.push("hand-offs: maturity, coverage and tabletop point to the next step; a finished review offers the leadership pack");
  // leadership pack: report card, radars and priorities, as a page and a standalone file
  const inner = packInner(); if(bad(inner)) throw new Error("pack has bad values: " + where(inner));
  eq((inner.match(/class="pk-r"/g) || []).length, 3, "three radars"); eq(/Report card/.test(inner) && /Top priorities/.test(inner) && /Open launch blockers/.test(inner), true, "pack sections");
  eq(/Marketplace &amp; e-commerce · Growing · US, EU/.test(inner), true, "pack names the organization");
  const doc = packDoc(); eq(/^<!doctype html>/.test(doc) && /--t-ma:#c0308a/.test(doc), true, "standalone file with its own colors");
  out.push("leadership pack: report card, 3 radars, priorities and blockers, printable and downloadable");
  // report card trend and tips
  store.set("rc:hist", [{d:"2026-07-01", s:40}]); renderOverview(); h = view.innerHTML;
  eq(/class="rc-trend"/.test(h) && /since Jul/.test(h), true, "trend since the first grade");
  const low = rcParts().find(p => p.score !== null && p.score < 70); eq(!!low && /To raise it:/.test(h), true, "tips on weak grades");
  out.push(`report card: trend line and "to raise it" tips (${low.n} at ${low.score})`);
  // next moves: overdue roadmap items first, launch blockers, the biggest coverage gap; ticking one works like ticking it in its tool
  const day = n => { const d = new Date(Date.now() + n * 864e5); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const rm = maRoadmap(ma), late = rm[rm.length - 1]; ma.due[late.id] = day(-3); ma.hist = [{t:Date.now(), stage:ma.stage, lv:{}}];
  let xs = nxItems(); eq(xs[0].tick, "ma:" + late.id + "-0", "overdue roadmap item comes first"); eq(nxDueText(ma.due[late.id]), "Overdue by 3 days", "overdue label");
  eq(xs.some(x => x.kind === "premortem" && /launch blocker/.test(x.ctx)), true, "a product's next launch blocker"); eq(xs.some(x => x.kind === "coverage"), true, "the biggest coverage gap");
  eq(xs.length <= 5 && xs.filter(x => x.kind === "maturity").length <= 3, true, "short and varied");
  renderOverview(); h = view.innerHTML; if(bad(h)) throw new Error("next moves has bad values: " + where(h));
  eq(/Your next moves/.test(h) && /Overdue by 3 days/.test(h) && /data-nxtick=/.test(h), true, "overview lists next moves");
  const pmTick = xs.find(x => x.kind === "premortem").tick, [pid, sg] = pmTick.slice(3).split("|");
  const msg = nxTick(pmTick, true); eq(libLoad()[pid].done[sg], true, "ticks the blocker in the saved pre-mortem"); eq(/Marked done/.test(msg), true, "confirms: " + msg);
  const a = rm[0], was = maLevelOf(ma, a.a.k); ma.done[a.id + "-0"] = true; const m2 = nxTick("ma:" + a.id + "-1", true); eq(maLevelOf(ma, a.a.k), was + 1, "two ticks level an area up"); eq(/is now level/.test(m2), true, "celebrates the level: " + m2);
  ma.hist = [{t:Date.now() - 100 * 864e5, stage:ma.stage, lv:{}}]; eq(nxItems().some(x => x.snap && /this quarter/.test(x.text)), true, "nudges a quarterly snapshot");
  out.push(`next moves: ${xs.length} items, overdue first, tick from the overview (${msg}), quarterly snapshot nudge`);
  // tier 3: calendar file for roadmap due dates, and what changed when a saved pre-mortem is reopened
  const due = maDueSteps(); eq(due.length > 0, true, "roadmap has due dates"); const ics = maIcs();
  eq(/^BEGIN:VCALENDAR\r\n/.test(ics) && (ics.match(/BEGIN:VEVENT/g) || []).length === due.length && /DTSTART;VALUE=DATE:\d{8}/.test(ics) && /\r\nEND:VCALENDAR\r\n$/.test(ics), true, "valid calendar with one event per due step");
  eq(ics.split("\r\n").every(l => l.length <= 75), true, "lines folded to 75 characters");
  const rec = Object.values(libLoad())[0]; pm = openRecord(rec, {stage:"report"}); pm.base = pmSnap(pm);
  eq(pmChanges(assess(pm)), null, "nothing changed yet"); pm.minors = "teens"; pm.youth = "teens";
  const before = Object.keys(pm.base.risks).length; pm.features = (pm.features || []).concat(["live", "dm"]).filter((x, i, a) => a.indexOf(x) === i);
  const ch = pmChanges(assess(pm)); eq(!!ch && ch.length > 0, true, "changes listed after new answers: " + (ch || []).join(" | ").replace(/<[^>]+>/g, "").slice(0, 120));
  eq(TRANSIENT.includes("base"), true, "the comparison point isn't saved into the library");
  out.push("tier 3: calendar with " + due.length + " events; what changed after editing a saved pre-mortem");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partNX.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
