// Renders the assessment home (first visit, partway, complete) and the All tools page, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0];
  const waits = h => (h.match(/class="as-rad wait"/g) || []).length;
  // first visit: what the assessment is, an empty picture, the six steps and a way to see it filled in
  ma = {stage:"growth", lv:{}, done:{}, ex:false, open:"policy"}; pm = blankPM(); renderOverview(); let h = view.innerHTML;
  if(bad(h)) throw new Error("first visit has bad values: " + where(h));
  eq(/See where your Trust &amp; Safety program stands/.test(h) && /data-as="start"/.test(h), true, "first visit invites you to start");
  eq((h.match(/<li style="--c:/g) || []).length, JOURNEY.length, "the six steps with what each gives you");
  eq(/id="as-pic-h"/.test(h), false, "no empty 'Your program picture' ghost card on a first fresh visit"); eq(waits(h), 0, "and no ghost radars either");
  eq(/href="#tools"/.test(h), true, "every tool is still one click away");
  out.push("first visit: calm hero and six steps, no empty picture card, start or see an example");
  // All tools: before the assessment has started, a banner steers a cold visitor back to it
  renderTools(); h = view.innerHTML;
  eq(/New here\?/.test(h) && /href="#overview"/.test(h), true, "banner steers a cold visitor to the guided assessment");
  out.push("all tools: a banner back to the guided assessment for a non-assessment visitor");
  // starting shows the steps, with the setup form as the first one up
  store.set("as:start", true); renderOverview(); h = view.innerHTML;
  if(bad(h)) throw new Error("started has bad values: " + where(h));
  eq(/Your program assessment/.test(h) && /0 of 6 steps done/.test(h), true, "progress header"); eq(/class="as-s cur"/.test(h) && /data-orgdone/.test(h), true, "setup form is the first step up");
  eq((h.match(/class="as-s todo"/g) || []).length, 5, "the rest can be started in any order"); eq(/Coming up/.test(h), true, "says what comes next");
  renderTools(); eq(/New here\?/.test(view.innerHTML), false, "and the banner drops once they're in the assessment");
  // partway: setup done, maturity rated, one product assessed
  orgSet({type:"social", stage:"growth", regions:["us", "eu"], confirmed:true}); MA_AREAS.forEach(a => ma.lv[a.k] = 2); ma.lv.policy = 4;
  pm = fromPreset("marketplace"); pm.example = false; pm.name = "Resale chat"; saveToLib(); store.set("as:seen", null); renderOverview(); h = view.innerHTML;
  if(bad(h)) throw new Error("partway has bad values: " + where(h));
  eq((h.match(/class="as-s ok"/g) || []).length, 3, "three steps done"); eq(/Social media[^<]* · Growing · US, EU/.test(h), true, "setup summary");
  eq(/7 of 8 areas below target/.test(h), true, "maturity summary"); eq(/1 product · \d+ launch blockers? open/.test(h), true, "pre-mortem summary");
  eq(/Up next · about 5 minutes/.test(h) && /data-jgo="coverage"/.test(h), true, "coverage is up next"); eq(waits(h), 1, "coverage radar waits for its step");
  eq(/levels? below your target of/.test(h) && /Before launch, Resale chat still needs/.test(h), true, "what we know so far");
  const o1 = rcOverall(rcParts()).score; eq(/based on 2 of 5 parts so far/.test(h), true, "score so far");
  out.push(`partway: 3 of 6 done, score ${o1} from 2 parts, findings from maturity and the pre-mortem`);
  // finishing coverage moves the score, and the home says why
  CV_AREAS.forEach(a => { cv.r[a.k] = {policy:1, detect:0, enforce:1, appeal:0, measure:0}; }); cv.ex = false; cv.est = false; cvSave();
  renderOverview(); h = view.innerHTML; const o2 = rcOverall(rcParts()).score;
  eq(o2 < o1 && new RegExp(`Down ${o1 - o2} points? since you last looked\\. The score now includes harm coverage`).test(h), true, "explains the drop: " + o1 + " to " + o2);
  eq(waits(h), 0, "all three radars drawn"); eq(/cover-radar|class="cv-radar/.test(h), true, "coverage radar in the picture");
  renderOverview(); eq(/since you last looked/.test(view.innerHTML), false, "the note shows once");
  // complete: the steps give way to the leadership pack and the week's work
  store.set("tt:progress", {[ttKey(0, "social")]:{best:3, last:Date.now()}}); store.set("tk:used", true);
  // EU users: the assessment grew a transparency step; a youth platform would get a COPPA step too
  eq(JOURNEY.map(s => s.k).join(","), "setup,maturity,premortem,coverage,dsa,crisis,transparency,act", "the steps follow the profile");
  orgSet({youth:"teens"}); eq(JOURNEY.some(s => s.k === "coppa"), true, "a teen platform gets a COPPA step"); orgSet({youth:"adult_verified"}); eq(JOURNEY.some(s => s.k === "coppa"), false, "an adults-only one doesn't");
  eq(JOURNEY.every(s => s.done()), false, "the DSA and transparency steps are still open"); wsPut({id:"TR-1", kind:"transparency", title:"Transparency report 2025", data:{org:"Test"}});
  ds = Object.assign(DS_BLANK(), {svc:"Test", tier:"platform", size:"medium", est:"eu", view:"report"}); dsSave();
  eq(JOURNEY.every(s => s.done()), true, "every step done"); renderOverview(); h = view.innerHTML; if(bad(h)) throw new Error("complete has bad values: " + where(h));
  eq(/All 8 steps done/.test(h) && /class="card as-complete"/.test(h) && /href="#plan"/.test(h), true, "complete offers the plan and the leadership pack");
  eq(/Across 1 rehearsal, \d+% of your first calls were strong/.test(h), true, "crisis finding"); out.push("complete: leadership pack up front, a finding from every step");
  // quarter by quarter: save the picture, change things, and the home and review page say what moved
  eq(/data-rev="save"/.test(h), true, "the picture offers to save the quarter"); eq(/class="card as-rev"/.test(h), false, "no comparison until a quarter is saved");
  const snap = revSave(); eq(!!snap && snap.label === REV_LABEL(Date.now()) && snap.score === rcOverall(rcParts()).score, true, "the snapshot holds the score");
  eq(!!snap.ma && !!snap.cv && !!snap.launch && !!snap.crisis && snap.find.length > 0, true, "and every part of the picture");
  renderOverview(); h = view.innerHTML; eq(/Nothing has moved since/.test(h) && /href="#review"/.test(h), true, "nothing moved yet");
  // move levels both ways, and fully cover the areas that were exposed
  ma.lv.detection = 4; ma.lv.crisis = 1; const wasBad = cvSummary(cv).rows.filter(x => x.status === "exposed" || x.status === "gap").map(x => x.a);
  eq(wasBad.length > 0, true, "there were gaps to close"); wasBad.slice(0, 2).forEach(a => { cv.r[a.k] = {policy:3, detect:3, enforce:3, appeal:3, measure:3}; }); wasBad.slice(2).forEach(a => { cv.r[a.k] = {policy:2, detect:2, enforce:2, appeal:2, measure:2}; }); cvSave();
  renderOverview(); h = view.innerHTML; if(bad(h)) throw new Error("since block has bad values: " + where(h));
  eq(/Since Q\d 20\d\d/.test(h) && /Overall score \d+ → \d+ \(\+\d+\)/.test(h) && /Moved up: Detection and prevention \(level 2 → 4\)/.test(h), true, "the home says what moved");
  eq(/Moved down: Crisis response \(level 2 → 1\)/.test(h) && new RegExp("Coverage gaps closed: " + wasBad[0].n.replace(/&/g, "&amp;")).test(h) && /No longer exposed, still a gap: /.test(h), true, "up and down, gaps closed and eased");
  const d1 = revDiff(revSnaps()[0], revNow()); eq(d1.some(x => x.k === "part" && /Harm coverage/.test(x.t)), true, "part scores in the diff"); eq(d1.findIndex(x => x.k === "part") > d1.findIndex(x => x.k === "cv"), true, "the story before the numbers");
  const old = revSnaps()[0]; old.t -= 95 * 864e5; old.label = "Q1 2026"; store.set("as:snaps", [old]); renderOverview(); h = view.innerHTML;
  eq(/Since Q1 2026/.test(h) && /data-rev="save">Save Q\d 20\d\d</.test(h), true, "after a quarter it nudges you to save the next one");
  location.hash = "#review"; renderReview(); h = view.innerHTML; if(bad(h)) throw new Error("review has bad values: " + where(h)); location.hash = "#overview";
  eq(new RegExp(`<option value="${old.t}" selected>Q1 2026`).test(h) && /class="card rv-parts"/.test(h) && /class="card rv-what"/.test(h), true, "review compares the saved quarter with now");
  eq(/class="cv-prev"/.test(h) && /class="ma-prev"|stroke-dasharray/.test(h), true, "both radars overlay the saved quarter"); eq(/Maturity by area/.test(h) && /2 → 4/.test(h), true, "levels by area");
  eq(/What we knew in Q1 2026/.test(h) && new RegExp(`data-revdel="${old.t}"`).test(h), true, "the old findings and a way to delete the snapshot");
  revDelete(old.t); eq(revSnaps().length, 0, "deleted"); renderReview(); eq(/No saved quarters yet/.test(view.innerHTML), true, "empty review invites the first save");
  out.push("quarter by quarter: save, compare (score, parts, areas, gaps, radars), nudge after a quarter, delete");
  // All tools: every tool on its own, plus recent work
  renderTools(); h = view.innerHTML; if(bad(h)) throw new Error("all tools has bad values: " + where(h));
  eq((h.match(/class="ov-tool"/g) || []).length >= 7, true, "every tool listed"); eq(/Jump back in/.test(h) && /data-open=/.test(h), true, "recent work");
  out.push("all tools: " + (h.match(/class="ov-tool"/g) || []).length + " tools and recent work");
  // pre-mortem landing shows the current assessment and a radar per saved one
  pm = fromPreset("dating"); pm.example = false; pm.name = "Match chat"; pm.id = null; pm.saved = false; saveToLib();
  pm.stage = "start"; const land = pmCurrentHero() + libraryBlock(); eq(/aria-label="Current assessment"/.test(land), true, "landing hero");
  eq((land.match(/class="mini-radar"/g) || []).length, 2, "mini radar per saved pre-mortem"); if(bad(land)) throw new Error("landing has bad values");
  out.push("pre-mortem landing: current assessment hero and a mini radar on each saved assessment");
  // Jump back in: the chip is not its own logic, it reuses itemSummary()'s pill text and color
  const chipIt = Object.values(wsItems()).find(i => i.kind === "premortem");
  const chipSum = itemSummary(chipIt), chip = ovChip(chipIt);
  if(bad(chip)) throw new Error("overview chip has bad values");
  eq(!!chipSum.chip, true, "itemSummary exposes a chip for ovChip to reuse");
  eq(chip.includes(esc(chipSum.chip.label)), true, "overview chip shows the same label as the workspace summary's pill");
  eq(chipSum.chip.cls ? chip.includes(`var(--${chipSum.chip.cls})`) : true, true, "and the same color");
  out.push("overview chip: reuses itemSummary()'s pill text and color, one source of truth");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partORG.js"), rd("partJN.js"), rd("partREV.js"), rd("partGD.js"), rd("partDSA.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
