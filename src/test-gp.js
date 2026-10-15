// Checks the grooming pathway review: the guided flow, the one-page form, exposure and protection per
// stage, the verdict, the example, the five drafts, tracker tasks, saving, sharing and the pre-mortem
// prefill, without a browser. Also checks the content rule: nothing in the part reads as a script.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  const score = () => gpScore(gp, gpCtx(gp)), stage = k => score().stages.find(s => s.st.k === k);
  // a blank review opens guided: an intro, then one question per screen, only the ones that apply
  gp = GP_BLANK(); gpView = null; gdReset("grooming"); renderGrooming(); let h = view.innerHTML; if(bad(h)) throw new Error("blank intro bad: " + where(h));
  eq(/How could an adult reach a child, and what's in the way/.test(h) && /data-gd="start"/.test(h) && /Answer everything on one page/.test(h) && /See a finished example/.test(h), true, "guided intro with the one-page form and the example as ways in");
  eq(/Nothing here describes how grooming is done, only what a platform can see/.test(h), true, "the content rule is stated on the intro");
  gdGo(gdCur, "start"); eq(/What's the product or feature called\?/.test(view.innerHTML), true, "first question: the name (optional)"); gdGo(gdCur, "next");
  eq(/Who can use it\?/.test(view.innerHTML) && (view.innerHTML.match(/data-gdpick=/g) || []).length, 4, "who can use it, four answers");
  gdPick(gdCur, "teens"); gdGo(gdCur, "next"); eq(gp.youth, "teens", "answer saved"); eq(/How do you know how old someone is\?/.test(view.innerHTML), true, "a teen product is asked how it knows ages");
  gdPick(gdCur, "declared"); gdGo(gdCur, "next"); eq(/How could a stranger find another user\?/.test(view.innerHTML), true, "then the find stage");
  gdPick(gdCur, "search"); gdPick(gdCur, "suggest"); eq(gp.find.join(","), "search,suggest", "multi answers toggle in"); gdGo(gdCur, "next");
  eq(/How could a stranger start a conversation\?/.test(view.innerHTML), true, "then reach"); gdPick(gdCur, "dm_any"); gdGo(gdCur, "next");
  eq(/What can happen in private between two users\?/.test(view.innerHTML), true, "then private"); gdPick(gdCur, "__none"); eq(gp.priv.length, 0, "none clears and moves on");
  eq(/Can value move between users\?/.test(view.innerHTML), true, "then value");
  const live = gdLive(gdCur); eq(live.length, 11, "eleven questions for a teen product with nothing in place yet"); eq(live.some(z => z.id === "def"), true, "defaults for minors are asked");
  gp.def = ["private"]; eq(gdLive(gpSpec()).some(z => z.id === "ev"), true, "once something is in place, the how-you-know question appears"); gp.def = [];
  gp.youth = "adult_verified"; eq(gdLive(gpSpec()).some(z => z.id === "age" || z.id === "def"), false, "an age-checked adult product skips the age and defaults questions");
  out.push("guided: " + live.length + " questions, only the ones that apply, with the content rule on the intro");
  // the one-page form is still there
  gp = GP_BLANK(); gpView = "page"; renderGrooming(); h = view.innerHTML; if(bad(h)) throw new Error("blank setup bad: " + where(h));
  eq((h.match(/class="pol-lbl"/g) || []).length, 3, "three sections on one page"); eq(/data-gp="build" disabled/.test(h) && /data-gp="guide"/.test(h), true, "can't map the pathway before saying who can use it");
  out.push("one page: three sections, guided one click away");
  // exposure and protection per stage
  gp = Object.assign(GP_BLANK(), {youth:"teens", age:"declared"});
  eq(score().stages.every(s => s.status === "none"), true, "nothing allowed: no stage is on the product"); eq(score().h, "Strangers can't reach each other on this product", "verdict for a product with no contact");
  gp.reach = ["dm_any"]; eq(stage("reach").e, 3, "a private message to anyone is high exposure at reach"); eq(stage("reach").status, "open", "with nothing in the way it's open");
  eq(score().h, GP_STAGES[1].open, "the first open stage names the verdict"); eq(score().first.st.k, "reach", "and it's reach");
  gp.def = ["dmconn", "notice"]; gp.det = ["rules"]; gp.age = "estimated"; eq(stage("reach").met, 4, "contact limits, a cap, a notice and age assurance all count at reach"); eq(stage("reach").status, "narrowed", "all four in place but assumed: only narrowed");
  eq(score().checks.length, 4, "four safeguards to check"); eq(score().evidenced, 0, "none evidenced yet");
  gp.ev = {dmconn:"checked", newcap:"checked", notice:"measured", age:"measured"}; eq(stage("reach").status, "covered", "checked or measured: covered"); eq(score().checks.length, 0, "nothing left to check");
  gp.find = ["search", "suggest", "profile", "posts"]; eq(stage("find").e, 3, "four ways to find a user is high exposure"); eq(stage("find").status, "open", "nothing in the way at find");
  gp.def.push("private"); eq(stage("find").status, "narrowed", "one of three find safeguards: narrowed"); gp.def.push("nosuggest"); gp.ev.private = "checked"; gp.ev.nosuggest = "checked"; eq(stage("find").status, "covered", "two of two counted find safeguards, both checked: covered");
  gp.priv = ["text", "media"]; eq(stage("exchange").e, 2, "media and text in private: medium exposure at exchange"); eq(stage("exchange").open.map(r => r.k).join(","), "blur,hash,classifier", "the exchange safeguards still open");
  gp.youth = "adult_verified"; eq(stage("find").e <= 1 && stage("reach").e <= 1, true, "an age-checked adult product caps exposure at low");
  gp = Object.assign(GP_BLANK(), {youth:"kids", age:"none", reach:["group", "voice"], find:["spaces"]});
  eq(score().gaps.some(r => r.k === "parent"), true, "a children's product is asked for parental controls"); eq(score().gaps.some(r => r.k === "agegroup"), true, "shared spaces call for age grouping");
  eq(score().gaps[0].st, "find", "gaps come earliest open stage first");
  out.push("stages: exposure from features, protection from safeguards, open, narrowed, covered, not on your product");
  // the example renders as a report, with the strip, the verdict and every tab
  gpAct("example"); h = view.innerHTML; if(bad(h)) throw new Error("example bad: " + where(h));
  eq(gp.ex && gp.svc === "Pixelry", true, "example loaded"); const s = score();
  eq(s.pct > 0 && s.pct < 100, true, "the example is partway there: " + s.pct + "%"); eq(s.first.st.k, "reach", "Pixelry's first open stage is reach");
  eq(/This is an example/.test(h) && /class="gp-strip"/.test(h) && /gp-st open/.test(h) && /Read the chapter/.test(h) && /Edit answers/.test(h) && /Copy link/.test(h), true, "example banner, stage strip, chapter link and header actions");
  eq((h.match(/<li><b>/g) || []).length, 3, "three actions under the verdict");
  eq(new RegExp(`${s.evidenced} of ${s.met} checked or measured`).test(h), true, "the evidence count is a pill"); eq(s.checks.length > 0 && /Check it works/.test(h), true, "the plan ends with the checks to run");
  eq(/Track it/.test(h) && /#metrics\/unsafe-contact-rate-for-minors/.test(h), true, "the prevention measures link into the metrics framework");
  ["path", "drafts", "sg"].forEach(t => { gp.tab = t; renderGrooming(); if(bad(view.innerHTML)) throw new Error(t + " tab bad: " + where(view.innerHTML)); });
  gp.tab = "path"; renderGrooming(); eq((view.innerHTML.match(/class="card gp-stage/g) || []).length, 6, "six stage cards on the pathway tab");
  GP_DRAFTS.forEach(([k]) => { gp.draft = k; renderGrooming(); if(bad(view.innerHTML)) throw new Error("draft " + k + " bad: " + where(view.innerHTML)); });
  out.push("example: " + s.pct + "% in place, " + s.gaps.length + " gaps, first open stage " + s.first.st.n.toLowerCase() + "; every tab and draft renders");
  // the five drafts, filled in from the answers
  const brief = gpBriefMd(), ladder = gpLadderMd(), review = gpReviewMd(), memo = gpMemoMd(), rules = gpRulesMd();
  eq(/# Safe defaults for minors on Pixelry/.test(brief) && /\| Reach \| A private message to anyone; A friend or follow request, with a message; Replies and comments on their posts \| Open \|/.test(brief), true, "the brief carries the pathway table");
  eq(/## Signals we can see today/.test(ladder) && /a report from a minor about contact/.test(ladder) && /\| One signal \|/.test(ladder), true, "the ladder lists the signals the product can see");
  eq(/Unsafe-contact cases per 10,000 young users/.test(review), true, "the leadership page says what each number counts");
  eq(/## Questions for counsel/.test(memo) && /## What each market expects/.test(memo) && /## Sources/.test(memo), true, "memo for Legal and Privacy");
  eq(/MinorFirstContactStarter = Rule\(/.test(rules) && /OffPlatformToMinorStarter/.test(rules) && /ImageToMinorStarter/.test(rules) && /EarlyGiftToMinorStarter/.test(rules), true, "starter rules for the ladder, including gifts and images for Pixelry");
  const html = cpMd(memo); eq(/\*\*|\|---/.test(html), false, "drafts render without raw Markdown");
  out.push("drafts: brief, ladder, leadership page, memo and starter rules");
  // tracker, workspace, search and sharing
  gp.ex = false; const tasks = tkFromGrooming(); eq(tasks.length, score().gaps.length + score().checks.length, "one task per gap and per check"); eq(tasks[0].pr, 4, "critical gaps are highest priority"); eq(/Sources: https/.test(tasks[0].desc), true, "each task carries its sources");
  eq(tasks.some(t => t.group === "Check it works" && /How to check/.test(t.desc)), true, "assumed safeguards become check tasks");
  // the radar beside the path, and the re-check prompt
  cv = {src:null, ex:false, r:{child:{policy:2, detect:1, enforce:2, appeal:1}}}; renderGrooming(); eq(/coverage radar<\/a> rates child safety at/.test(view.innerHTML), true, "the radar's child-safety row shows beside the path");
  gp.at = Date.now() - 1000; wsPut({id:"TSW-9", kind:"premortem", title:"Teen live", data:{}, updated:Date.now()}); renderGrooming(); eq(/Teen live changed after this review/.test(view.innerHTML), true, "a pre-mortem saved after the review prompts a re-check");
  gp.at = null; wsDel("TSW-9");
  const msg = wsSaveTool("grooming", gp, gpTitle(gp)), it = Object.values(wsItems()).find(i => i.kind === "grooming");
  eq(!!it && new RegExp(score().pct + "% in place").test(itemSummary(it).html), true, "workspace summary"); eq(cmdkItems().some(x => x.label === "Grooming pathway review"), true, "search reaches it");
  SHARE_APPLY.grooming(JSON.parse(JSON.stringify(GP_EXAMPLE))); eq(gp.shared === true && gp.svc === "Pixelry", true, "a shared link lands as a read-only copy");
  out.push(`tracker: ${tasks.length} tasks; saved (${msg}), searchable and shareable`);
  // pre-filled from a saved pre-mortem
  pm = fromPreset("teen_social"); Object.assign(pm, {example:false, name:"Teen clubhouse", youth:"teens"}); pm.done = {minor_contact:true, csam_reporting:true}; saveToLib();
  const pre = gpFromPM(loopSource()); eq(pre.youth, "teens", "audience carried over"); eq(pre.svc, "Teen clubhouse", "name carried over");
  eq(pre.reach.includes("dm_any") && pre.find.length > 0, true, "features become the pathway answers"); eq(pre.def.includes("dmconn") && pre.resp.includes("report"), true, "ticked safeguards become what's in place");
  out.push("pre-fill from a pre-mortem: audience, name, " + pre.find.length + " ways to find, " + pre.reach.length + " ways to reach");
  return out.join("\n");
};
// The content rule, checked on the source itself: no quoted message a groomer might send, and every
// safeguard names a platform-visible signal, not words.
const part = rd("partGP.js");
[/hey (cutie|sexy|beautiful)/i, /don'?t tell (your|anyone)/i, /our (little )?secret/i, /send (me )?(a )?(pic|photo|nude)/i, /are you (home )?alone/i].forEach(re => { if(re.test(part)) throw new Error("partGP.js contains script-like text: " + re); });
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partCP.js"), rd("partGP.js"), rd("partCR.js"), rd("partLOOP.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
