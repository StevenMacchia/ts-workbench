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
  eq((h.match(/<li style="--c:/g) || []).length, JOURNEY.length, "the six steps with what each gives you"); eq(/Appears after step 2/.test(h) && waits(h), 3, "empty picture waits for its steps");
  eq(/href="#tools"/.test(h), true, "every tool is still one click away");
  out.push("first visit: six steps, an empty picture, start or see an example");
  // starting shows the steps, with the setup form as the first one up
  store.set("as:start", true); renderOverview(); h = view.innerHTML;
  if(bad(h)) throw new Error("started has bad values: " + where(h));
  eq(/Your program assessment/.test(h) && /0 of 6 steps done/.test(h), true, "progress header"); eq(/class="as-s cur"/.test(h) && /data-orgdone/.test(h), true, "setup form is the first step up");
  eq((h.match(/class="as-s todo"/g) || []).length, 5, "the rest can be started in any order"); eq(/Coming up/.test(h), true, "says what comes next");
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
  eq(JOURNEY.every(s => s.done()), true, "every step done"); renderOverview(); h = view.innerHTML; if(bad(h)) throw new Error("complete has bad values: " + where(h));
  eq(/All 6 steps done/.test(h) && /class="card as-complete"/.test(h) && /data-pack="1"/.test(h), true, "complete offers the leadership pack");
  eq(/Across 1 rehearsal, \d+% of your first calls were strong/.test(h), true, "crisis finding"); out.push("complete: leadership pack up front, a finding from every step");
  // All tools: every tool on its own, plus recent work
  renderTools(); h = view.innerHTML; if(bad(h)) throw new Error("all tools has bad values: " + where(h));
  eq((h.match(/class="ov-tool"/g) || []).length >= 7, true, "every tool listed"); eq(/Jump back in/.test(h) && /data-open=/.test(h), true, "recent work");
  out.push("all tools: " + (h.match(/class="ov-tool"/g) || []).length + " tools and recent work");
  // pre-mortem landing shows the current assessment and a radar per saved one
  pm = fromPreset("dating"); pm.example = false; pm.name = "Match chat"; pm.id = null; pm.saved = false; saveToLib();
  pm.stage = "start"; const land = pmCurrentHero() + libraryBlock(); eq(/aria-label="Current assessment"/.test(land), true, "landing hero");
  eq((land.match(/class="mini-radar"/g) || []).length, 2, "mini radar per saved pre-mortem"); if(bad(land)) throw new Error("landing has bad values");
  out.push("pre-mortem landing: current assessment hero and a mini radar on each saved assessment");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partORG.js"), rd("partJN.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
