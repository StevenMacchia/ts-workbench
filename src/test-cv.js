// Renders the coverage radar and checks coverage scores, risk sources, gap logic, next steps and exports, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0];
  // content lines up with the risk radar
  eq(CV_AREAS.length, 8, "eight harm areas"); eq(CV_AREAS.some(a => a.k === "readiness"), false, "readiness is not a harm area");
  CV_LAYERS.forEach(l => { if(l.lv.length !== 4 || !l.q || !l.tool || !/child safety/.test(l.act("child safety"))) throw new Error("layer incomplete: " + l.k); });
  out.push(`content: ${CV_AREAS.length} harm areas × ${CV_LAYERS.length} layers × ${CV_LEVELS.length} levels`);
  // blank: no pre-mortems saved, so coverage only. It opens guided, and the one-table version is a click away
  cv = {src:null, ex:false, r:{}}; renderCoverage(); let h = view.innerHTML;
  if(bad(h)) throw new Error("blank intro has bad values: " + where(h));
  eq(/Do your defenses keep up with your risk\?/.test(h) && /data-cvg="start"/.test(h) && /data-cvg="table"/.test(h), true, "guided intro, with the table as an option");
  eq(/Coverage only/.test(h) && /Run a pre-mortem first/.test(h) && /href="#tools"/.test(h), true, "coverage only, on its own, back to All tools");
  cvView = "table"; renderCoverage(); h = view.innerHTML; if(bad(h)) throw new Error("blank table has bad values: " + where(h));
  eq((h.match(/class="cv-mr"/g) || []).length, 8, "one matrix row per harm area"); eq((h.match(/role="radio"/g) || []).length, 8 * 5 * 4, "four levels per cell");
  eq(cvRisk(cv), null, "no risk without a source"); eq(/No risk yet: coverage only/.test(h) && /Start a pre-mortem/.test(h) && /Switch to guided/.test(h), true, "invites a pre-mortem");
  cvView = null;
  out.push("blank: guided intro, or an 8 × 5 table; coverage only until there's a pre-mortem");
  // guided: which harms apply, one question at a time, a result after each area, then results
  cvGo("start"); h = view.innerHTML; eq((h.match(/data-cvapply=/g) || []).length, 8, "asks which harms apply"); eq(/Continue with 8 areas/.test(h), true, "all apply by default");
  cvGo("first"); h = view.innerHTML; eq(/Is there a clear rule on child safety that reviewers can apply\?/.test(h) && (h.match(/data-cvpick=/g) || []).length, 4, "first question, four answers");
  [3, 1, 2, 1, 0].forEach(j => cvPick(j, true)); h = view.innerHTML; if(bad(h)) throw new Error("area result has bad values: " + where(h));
  eq(/47% covered/.test(h) && /Start with detection/.test(h) && /Next: Sexual harm/.test(h), true, "a result after the area, with the first fix");
  cvGo("back"); eq(cvG.scr + cvG.l, "q4", "back returns to the last question"); cvGo("next"); cvGo("next"); eq(cvG.scr + cvG.a, "q1", "on to the next area");
  cvPick(2, true); cvGo("back"); cvGo("back"); eq(cvG.a + "/" + cvG.l, "0/4", "back steps across areas");
  cvGo("table"); eq(cvMode(), "table", "switch to the table any time"); eq(/Switch to guided/.test(view.innerHTML), true, "and back");
  cvGo("guide"); eq(cvG.scr + cvG.a + cvG.l, "q11", "guided resumes at the first open question");
  CV_AREAS.forEach(a => { cv.r[a.k] = Object.assign({policy:1, detect:1, enforce:1, appeal:1, measure:1}, cv.r[a.k]); }); cvG = null; cvView = null; renderCoverage(); h = view.innerHTML;
  eq(cvMode(), "results", "every answer given: results"); eq(/Your coverage is <b>\d+%<\/b>/.test(h) && /data-cvtab="answers"/.test(h), true, "results with the detail in tabs");
  cvTab = "answers"; renderCoverage(); eq((view.innerHTML.match(/class="cv-mr"/g) || []).length, 8, "answers editable in the results"); cvTab = "gaps";
  out.push("guided: harms that apply, one question at a time, a result per area, back and resume, table and results");
  // example: teen social app risk against a typical early program
  cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); renderCoverage(); h = view.innerHTML;
  if(bad(h)) throw new Error("example has bad values: " + where(h));
  const s = cvSummary(cv); eq(s.rated, 40, "every cell rated"); eq(s.weighted, true, "coverage weighted by risk");
  const child = s.rows.find(x => x.a.k === "child"); eq(child.cov, Math.round((3 + 1 + 2 + 1 + 0) / 15 * 100), "coverage is the share of the maximum");
  eq(child.score >= 12 && child.status, "exposed", "critical risk with thin coverage is exposed");
  eq(s.exposed.length > 0, true, "example has exposed areas");
  const acts = cvActions(cv); eq(acts[0].row.status, "exposed", "exposed areas come first"); eq(["detect", "enforce", "policy", "measure", "appeal"].includes(acts[0].layer.k), true, "names a layer");
  eq(acts.every(a => (a.row.r[a.layer.k] || 0) <= 1), true, "only weak layers become steps");
  eq(/cv-risk/.test(h) && /cv-cov/.test(h), true, "radar overlays risk and coverage"); eq(/exposed/.test(cvWhy()), true, "summary names exposure");
  out.push(`example: ${s.cov}% risk-weighted coverage, ${s.exposed.length} exposed, ${s.gaps.length} gaps, ${acts.length} next steps`);
  // risk sources: saved products combine to the worst per area
  pm = fromPreset("marketplace"); pm.example = false; pm.name = "Resale chat"; saveToLib();
  pm = fromPreset("dating"); pm.example = false; pm.name = "Match chat"; pm.id = null; pm.saved = false; saveToLib();
  const src = cvSources(); eq(src.list[0][0], "all", "all products offered first"); eq(src.list.length, 3, "all plus each product");
  const all = cvRisk({src:"all", r:{}}), one = cvRisk({src:src.list[1][0], r:{}});
  eq(CV_AREAS.every(a => all[a.k].score >= one[a.k].score), true, "combined risk is the worst of each area");
  cv = {src:null, ex:false, r:{child:{policy:2}}}; eq(cvSrc(cv).src, "all", "defaults to all products once they exist");
  out.push("sources: all products (worst per area), each product, or an example");
  // partial ratings and a perfect program
  renderCoverage(); if(bad(view.innerHTML)) throw new Error("partial has bad values: " + where(view.innerHTML));
  eq(/based on 1 of 40 ratings/.test(cvWhy()), true, "notes partial ratings");
  CV_AREAS.forEach(a => { cv.r[a.k] = {}; CV_LAYERS.forEach(l => cv.r[a.k][l.k] = 3); });
  eq(cvSummary(cv).cov, 100, "full coverage"); eq(cvActions(cv).length, 0, "no steps at full coverage"); renderCoverage(); eq(/No gaps where risk is high/.test(view.innerHTML), true, "celebrates no gaps");
  // start from maturity: estimates fill the matrix but count only once confirmed
  ma = maInit({stage:"growth", lv:{policy:3, detection:2, operations:4, quality:1, crisis:2, compliance:2, measurement:5, wellbeing:2}, done:{}, ex:false});
  cv = {src:null, ex:false, r:{child:{policy:3}}}; cvG = null; renderCoverage(); eq(/data-cv="fillma"/.test(view.innerHTML) && /Pick up where you left off \(1 of 40\)/.test(view.innerHTML), true, "guided offers to start from maturity");
  cvView = "table"; renderCoverage(); eq(/Fill from maturity/.test(view.innerHTML) && /the 39 unrated/.test(view.innerHTML), true, "the table offers to fill from maturity"); cvView = null;
  eq(cvFillFromMaturity(), 39, "fills only the unrated cells"); eq(cv.r.child.policy, 3, "keeps what was rated");
  eq([cv.r.fraud.policy, cv.r.fraud.detect, cv.r.fraud.enforce, cv.r.fraud.appeal, cv.r.fraud.measure].join(","), "2,1,3,0,3", "maps maturity levels onto layers");
  eq(JOURNEY.find(s => s.k === "coverage").done(), false, "estimates don't complete the step"); eq(rcParts().find(p => p.k === "coverage").score, null, "estimates aren't graded");
  renderCoverage(); eq(/Confirm coverage/.test(view.innerHTML) && !/Next in your program review/.test(view.innerHTML), true, "asks to confirm before the hand-off");
  cv.est = false; eq(JOURNEY.find(s => s.k === "coverage").done(), true, "confirmed coverage completes the step"); renderCoverage(); eq(/Back to your assessment/.test(view.innerHTML), true, "back to the assessment after confirming");
  out.push("start from maturity: fills unrated cells, maps levels onto layers, counts only once confirmed");
  // harm areas that don't apply: kept in the company profile, left out of the radar and every grade
  cvView = "table"; renderCoverage(); eq((view.innerHTML.match(/data-cvoff="/g) || []).length, 8, "each harm area has a trash can");
  eq(cvSetOff("ai", true), true, "remove a harm area"); eq(orgGet().harmsOff.join(","), "ai", "saved in the company profile");
  let s2 = cvSummary(cv); eq(s2.rows.length + "/" + s2.total + "/" + s2.rated, "7/35/35", "the area leaves the rows and the count to rate");
  renderCoverage(); h = view.innerHTML; if(bad(h)) throw new Error("removed area has bad values: " + where(h));
  eq((h.match(/class="cv-mr"/g) || []).length, 7, "matrix drops the row"); eq(/data-cvon="ai"/.test(h) && /Doesn't apply to/.test(h), true, "removed areas can be restored");
  eq((cvRadar(cv, false).match(/<line x1="200"/g) || []).length, 7, "seven axes on the radar"); eq(JOURNEY.find(s => s.k === "coverage").done(), true, "still complete");
  eq(/aria-pressed="false" data-orgharm="ai"/.test(orgCardHTML()) && /aria-pressed="true" data-orgharm="child"/.test(orgCardHTML()), true, "company profile shows which apply");
  const risky = s2.rows.filter(x => x.score >= 8)[0]; CV_LAYERS.forEach(l => cv.r[risky.a.k][l.k] = 0); s2 = cvSummary(cv);
  cvSetOff(risky.a.k, true); const s3 = cvSummary(cv); eq(s3.cov > s2.cov, true, `grade recalculates without ${risky.a.n} (${s2.cov}% → ${s3.cov}%)`);
  eq(rcParts().find(p => p.k === "coverage").score, s3.cov, "report card uses the new grade");
  renderCoverage(); eq(/Restore it if that risk is real/.test(view.innerHTML), true, "warns when a removed area has high risk");
  eq(cvSummary(JSON.parse(JSON.stringify(CV_EXAMPLE))).rows.length, 8, "examples show all eight");
  CV_AREAS.forEach(a => cvSetOff(a.k, true)); eq(cvAreas(cv).length, 3, "at least three stay"); eq(/aria-disabled="true"/.test(cvMatrixHTML()), true, "trash disabled at three");
  CV_AREAS.forEach(a => cvSetOff(a.k, false)); eq(cvSummary(cv).rows.length, 8, "all restored");
  eq(cvHarm(CV_AREAS.find(a => a.k === "ai")), "AI misuse", "acronyms keep their capitals"); cvView = null;
  // the questions use the words of your kind of platform
  orgSet({type:"marketplace"}); eq(/scam listings/.test(cvNoun(CV_AREAS.find(a => a.k === "fraud"))), true, "a marketplace is asked about scam listings"); eq(/scam listings/.test(CV_Q.detect.q(CV_AREAS.find(a => a.k === "fraud"))), true, "and the question says so");
  orgSet({type:"dating"}); eq(/romance scams/.test(cvNoun(CV_AREAS.find(a => a.k === "fraud"))), true, "a dating app about romance scams"); orgSet({type:null}); eq(cvNoun(CV_AREAS.find(a => a.k === "fraud")), "fraud and scams", "no type: the plain noun");
  out.push(`not relevant: removed from the profile or the radar, grade ${s2.cov}% → ${s3.cov}% without ${risky.a.n.toLowerCase()}, at least three stay, examples unaffected`);
  // exports: markdown, tasks, workspace, overview, search
  cv = JSON.parse(JSON.stringify(CV_EXAMPLE));
  const md = cvMarkdown(cv); eq(/\| Child safety \| Critical \| Strong \| Partial \| Solid \| Partial \| None \| 47% \|/.test(md) && /## Next steps/.test(md), true, "markdown table and steps");
  const tasks = tkFromCoverage(); eq(tasks.length, cvActions(cv).length, "one task per step"); eq(tasks[0].pr, 4, "exposed steps are top priority");
  const msg = wsSaveTool("coverage", cv, cvTitle(cv)), it = Object.values(wsItems()).find(i => i.kind === "coverage");
  eq(!!it && /% coverage/.test(itemSummary(it).html), true, "workspace summary");
  eq(cmdkItems().some(x => x.label === "Coverage radar"), true, "search reaches the tool");
  renderOverview(); eq(/href="#coverage"/.test(view.innerHTML) && /Coverage radar/.test(view.innerHTML), true, "overview card and program review step");
  out.push(`exports: markdown, ${tasks.length} tracker tasks, workspace (${msg}), search and overview`);
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partTYPE.js"), rd("partCV.js"), rd("partOV.js"), rd("partTK.js"), rd("partRC.js"), rd("partORG.js"), rd("partJN.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
