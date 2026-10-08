// Renders the program maturity assessment and plan, and checks levels, steps, snapshots and exports, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0];
  // content is complete
  eq(MA_AREAS.length, 8, "eight areas");
  MA_AREAS.forEach(a => { if(a.lv.length !== 5 || a.next.length !== 4 || a.next.some(x => x.length !== 2) || !a.q || !a.why) throw new Error("area incomplete: " + a.k);
    MA_STAGES.forEach(s => { if(!(s.t[a.k] >= 1 && s.t[a.k] <= 5)) throw new Error("stage " + s.k + " has no target for " + a.k); });
    if(!MA_ORDER.includes(a.k)) throw new Error("priority order missing " + a.k); });
  out.push("content: " + MA_AREAS.length + " areas × 5 levels, " + MA_AREAS.length * 4 + " step sets, " + MA_STAGES.length + " stages with targets");
  // blank: it opens guided, and every area on one page is a click away
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false, open:"policy"}); renderMaturity(); let h = view.innerHTML;
  if(bad(h)) throw new Error("blank intro has bad values: " + where(h));
  eq(/How strong is your Trust &amp; Safety program\?/.test(h) && /data-mag="start"/.test(h) && /data-mag="page"/.test(h) && /data-ma="example"/.test(h), true, "guided intro, one page and an example");
  eq(/href="#tools"/.test(h), true, "on its own, back to All tools");
  // guided: your size, then one area at a time, then the plan
  maGo("start"); h = view.innerHTML; eq((h.match(/data-magstage=/g) || []).length, 3, "asks your size first");
  maPickStage("scale", true); h = view.innerHTML; eq(ma.stage + "/" + ma.stageSet, "scale/true", "size saved");
  eq(/Are your rules clear, written down and applied the same way every time\?/.test(h) && (h.match(/data-magpick=/g) || []).length, 5, "first area, five levels");
  eq(/data-magpick="4"[^>]*>[\s\S]{0,260}Your target/.test(h), true, "the target for your size is marked");
  maPick(2, true); eq(maG.i + "/" + ma.lv.policy, "1/2", "on to the next area"); maGo("back"); eq(maG.i, 0, "back to the first area"); maGo("back"); eq(maG.scr, "stage", "back to your size");
  maGo("page"); eq(maMode(), "page", "switch to one page any time"); eq(/Switch to guided/.test(view.innerHTML), true, "and back");
  maGo("guide"); eq(maG.scr + maG.i, "q1", "guided resumes at the first unrated area");
  MA_AREAS.slice(1).forEach(() => maPick(3, true)); eq(maMode(), "plan", "the last area opens the plan"); eq(/id="ma-plan"/.test(view.innerHTML), true, "the last area opens the plan page");
  out.push("guided: size first, one area at a time with the target marked, back and resume, one page, then the plan");
  // each area explained for your kind of platform
  orgSet({type:"gaming"}); maG = {scr:"q", i:1}; ma.lv = {}; renderMaturity(); eq(/For gaming platforms:/.test(view.innerHTML) && /voice moderation/.test(view.innerHTML), true, "detection explained for a gaming platform"); orgSet({type:null}); maG = null;
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false, open:"policy"}); maG = null; maView = "page"; renderMaturity(); h = view.innerHTML;
  if(bad(h)) throw new Error("blank page has bad values: " + where(h));
  eq((h.match(/class="card ma-area/g) || []).length, 8, "one card per area"); eq((h.match(/class="card ma-area open"/g) || []).length, 1, "one area open");
  eq((h.match(/class="ma-opt /g) || []).length, 5, "five levels in the open area"); eq((h.match(/data-stage=/g) || []).length, 3, "three stages");
  eq(/Rate the first area/.test(h) && /See an example/.test(h), true, "blank prompts and example button"); eq(maRoadmap(ma).length, 0, "no roadmap when blank");
  out.push("blank: rating flow with 8 areas, first open, example offered");
  // partial ratings stay in the flow
  ma = maInit({stage:"growth", lv:{policy:2, crisis:4}, done:{}, ex:false, open:"detection"}); renderMaturity(); h = view.innerHTML;
  if(bad(h)) throw new Error("partial has bad values: " + where(h)); eq(/Rate the remaining 6 areas/.test(h) && /based on 2 of 8 areas/.test(h), true, "partial asks to finish");
  eq(/id="ma-plan"/.test(h), false, "no plan until every area is rated");
  // levels come from the rating plus finished steps
  ma = maInit({stage:"growth", lv:{crisis:1}, done:{}, ex:false}); eq(maLevelOf(ma, "crisis"), 1, "rated baseline");
  ma.done["crisis1-0"] = true; eq(maLevelOf(ma, "crisis"), 1, "one of two steps is not enough");
  ma.done["crisis1-1"] = true; eq(maLevelOf(ma, "crisis"), 2, "both steps move the area up");
  ma.done["crisis2-0"] = ma.done["crisis2-1"] = true; eq(maLevelOf(ma, "crisis"), 3, "levels chain");
  ma.done["crisis1-0"] = false; eq(maLevelOf(ma, "crisis"), 1, "unticking drops back to the first unfinished level");
  out.push("levels: baseline plus finished steps, chained, and reversible");
  // the example opens as a plan a quarter in
  ma = maExample(); renderMaturity(); h = view.innerHTML;
  if(bad(h)) throw new Error("example plan has bad values: " + where(h));
  eq(/id="ma-plan"/.test(h) && /Your maturity plan/.test(h), true, "example opens the plan"); eq(/type="date"|data-madue|due date/i.test(h), false, "no due dates on the roadmap"); eq(/This is an example/.test(h), true, "example is labelled");
  eq(maScore(ma), 2.3, "score counts the finished crisis steps"); eq(maLevelOf(ma, "crisis"), 2, "crisis moved up");
  const gaps = maGaps(ma); eq(gaps.map(g => g.a.k).join(","), "compliance,crisis,detection,quality,measurement", "gaps from current levels");
  const road = maRoadmap(ma); eq(road.length, 7, "roadmap planned from the baseline"); eq(road[0].done, true, "finished step shows as reached");
  eq(road.filter(s => s.phase === "now").map(s => s.id).join(","), "crisis1,compliance1,detection2", "now phase");
  const pr = maProgress(ma); eq(pr.done, 3, "three actions done"); eq(pr.items, 14, "fourteen actions"); eq(pr.gained, 1, "one level gained");
  eq(maNextItem(ma).text, MA_AREAS.find(a => a.k === "compliance").next[0][1], "next up is the first unticked item");
  eq((h.match(/role="tab"/g) || []).length, 3, "three tabs"); eq((h.match(/class="card ma-step/g) || []).length, 7, "roadmap tab lists every step");
  eq(/Level 2 reached/.test(h) && /Head of Trust &amp; Safety Operations/.test(h), true, "reached badge and owner");
  eq((h.match(/<polygon class="ma-cur"/g) || []).length, 1, "one radar"); eq(/stroke-dasharray="1.5 3.5"/.test(h), true, "last snapshot overlaid");
  eq(/Crisis response level 2 of 5, target 3/.test(h), true, "radar describes current levels");
  eq(h.indexOf('class="ma-band-next"') > 0 && h.indexOf('class="ma-band-next"') < h.indexOf('class="ma-score big"'), true, "Next up leads the band, above the score and radar");
  out.push(`example plan: level ${maScore(ma)}, ${pr.done}/${pr.items} actions, ${pr.gained} level gained, roadmap ${["now", "next", "later"].map(p => road.filter(s => s.phase === p).length).join("/")}`);
  // by area and progress tabs
  ma.tab = "areas"; ma.sel = "compliance"; renderMaturity(); h = view.innerHTML;
  if(bad(h)) throw new Error("by-area tab has bad values: " + where(h));
  eq((h.match(/class="ma-al /g) || []).length, 8, "area list"); eq((h.match(/class="ma-rung /g) || []).length, 5, "five-level ladder");
  eq((h.match(/data-done="compliance\d-\d"/g) || []).length, 8, "steps for every level above the baseline"); eq(/You're here/.test(h) && /data-maown="compliance"/.test(h) && /data-manote="compliance"/.test(h), true, "owner and notes");
  ma.tab = "progress"; renderMaturity(); h = view.innerHTML;
  if(bad(h)) throw new Error("progress tab has bad values: " + where(h));
  eq(/Overall level over time/.test(h) && /class="ma-snap"/.test(h), true, "trend and snapshots"); eq(/Crisis \+1/.test(h), true, "names what moved since the snapshot");
  out.push("tabs: by area (ladder, steps, owner, notes) and progress (trend, snapshots, what moved)");
  // every area at 5 and nothing to do
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false}); MA_AREAS.forEach(a => ma.lv[a.k] = 5); renderMaturity(); h = view.innerHTML;
  eq(maGaps(ma).length, 0, "no gaps at level 5"); eq(/No gaps against your targets/.test(h) && /every rated area meets the target/i.test(h), true, "celebrates no gaps");
  ma.edit = true; renderMaturity(); eq(/Back to your plan/.test(view.innerHTML) && /class="card ma-area/.test(view.innerHTML), true, "edit ratings reopens the flow"); ma.edit = false; maView = null;
  // exports and workspace
  ma = maExample();
  const md = maMarkdown(ma); eq(/\| Crisis response \| 2 · Developing \| 3 \| Head of Trust & Safety Operations \| Below target \|/.test(md), true, "markdown table with owners");
  eq(/### Now \(Next 90 days\)/.test(md) && /✓ reached/.test(md) && /- \[x\] Agree what counts as a crisis/.test(md) && /## Snapshots/.test(md), true, "markdown roadmap, progress and snapshots");
  const msg = wsSaveTool("maturity", ma, maTitle(ma)); const it = Object.values(wsItems()).find(i => i.kind === "maturity");
  eq(!!it && /Level 2\.3 · Developing/.test(itemSummary(it).html), true, "workspace summary"); eq(it.title, "Program maturity: growing, level 2.3", "saved title");
  eq(cmdkItems().some(x => x.label === "Program maturity"), true, "search reaches the tool");
  renderTools(); eq(/href="#maturity"/.test(view.innerHTML) && /Level 2\.3/.test(view.innerHTML), true, "All tools card and saved chip");
  out.push("markdown export, workspace save (" + msg + "), search and overview all include maturity");
  // framework mapping: every area has an entry, each renders, sources are linked
  eq(MA_AREAS.every(a => MA_FW[a.k] && MA_FW[a.k].note), true, "every area maps to the frameworks");
  const fwh = maFrameworkHTML("wellbeing"); eq(/PE3: Wellness &amp; Resilience/.test(fwh) && /No direct equivalent/.test(fwh) && /dtspartnership\.org/.test(fwh), true, "wellbeing maps to DTSP only, with sources");
  out.push("frameworks: " + MA_AREAS.length + " areas mapped to DTSP and Ofcom, with sources");
  // the plan page's empty state links straight to maturity and pre-mortem, not just naming them
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false}); cv = {src:null, ex:false, r:{}}; pm = blankPM();
  renderPlan(); h = view.innerHTML; if(bad(h)) throw new Error("blank plan has bad values: " + where(h));
  eq(/Nothing to plan yet/.test(h), true, "nothing saved yet");
  eq(/Start with your program's <a href="#maturity">maturity<\/a> or a <a href="#premortem">pre-mortem<\/a>\./.test(h), true, "the empty state links maturity and pre-mortem directly, not just naming them");
  out.push("plan: empty state links maturity and pre-mortem directly");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partTYPE.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partORG.js"), rd("partRC.js"), rd("partPLAN.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
