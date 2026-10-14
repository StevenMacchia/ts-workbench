// Checks child-safety reporting: which duties apply by market, the guided flow and the one-page form,
// the requirements that turn answers into gaps, the example, the four drafts, tracker tasks, saving,
// sharing and the prefills from a pre-mortem and the workspace profile, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  const score = () => crScore(cr, crCtx(cr)), gaps = () => score().gaps.map(r => r.k), lvl = o => crApplies(Object.assign(CR_BLANK(), o)).lvl;
  // a blank check opens guided: an intro, then one question per screen, only the ones that apply
  cr = CR_BLANK(); crView = null; gdReset("reporting"); renderReporting(); let h = view.innerHTML; if(bad(h)) throw new Error("blank intro bad: " + where(h));
  eq(/can you remove, preserve, report and handle the account/.test(h) && /data-gd="start"/.test(h) && /Answer everything on one page/.test(h), true, "guided intro with the one-page form as an option");
  eq(/Nothing here describes the material/.test(h), true, "the content rule is stated on the intro");
  gdGo(gdCur, "start"); eq(/What's the service called\?/.test(view.innerHTML), true, "first question: the name (optional)"); gdGo(gdCur, "next");
  eq(/Roughly how many monthly users\?/.test(view.innerHTML), true, "then size"); gdPick(gdCur, "huge"); gdGo(gdCur, "next");
  eq(/Have you handled a case yet\?/.test(view.innerHTML), true, "then cases"); gdPick(gdCur, "none"); gdGo(gdCur, "next");
  eq(/Where are your users, and where are you based\?/.test(view.innerHTML), true, "then markets"); gdGo(gdCur, "next"); eq(/Where are your users/.test(view.innerHTML), true, "markets are required: next does nothing until one is picked");
  gdPick(gdCur, "us"); gdPick(gdCur, "uk"); gdGo(gdCur, "next"); eq(cr.regions.join(","), "us,uk", "markets saved"); eq(/How does content reach your service\?/.test(view.innerHTML), true, "then content");
  gdPick(gdCur, "uploads"); gdPick(gdCur, "dm_media"); gdGo(gdCur, "next");
  eq(/Registration and the procedure: what do you have in place today\?/.test(view.innerHTML), true, "then one screen per part of the first hour");
  const live = gdLive(gdCur); eq(live.filter(z => /^ctrl-/.test(z.id)).length, CR_CTRL.length, "every control group has a screen for a US and UK service with media");
  eq(gdCur.steps.find(z => z.id === "ctrl-reg").opts().some(o => o.k === "r_uk") && !gdCur.steps.find(z => z.id === "ctrl-reg").opts().some(o => o.k === "r_ca"), true, "the UK duty shows, the Canadian one doesn't");
  cr.regions = ["eu"]; eq(gdLive(crSpec()).some(z => z.id === "ctrl-find"), true, "an EU-only service with media still gets the finding-it screen");
  out.push("guided: " + live.length + " questions for a US and UK service, only the duties that apply");
  // the one-page form is still there
  cr = CR_BLANK(); crView = "page"; renderReporting(); h = view.innerHTML; if(bad(h)) throw new Error("blank setup bad: " + where(h));
  eq((h.match(/class="pol-lbl"/g) || []).length, 1, "a blank check starts with one section"); eq(/data-cr="build" disabled/.test(h) && /data-cr="guide"/.test(h), true, "can't check readiness before choosing markets");
  // who it applies to
  eq(lvl({regions:["us"]}), "us", "US users: the US duty"); eq(lvl({regions:["us", "eu"]}), "us", "US plus EU: still the US duty first");
  eq(lvl({regions:["uk"]}), "other", "UK only: duties in the UK"); eq(/the UK/.test(crApplies(Object.assign(CR_BLANK(), {regions:["uk", "ca"]})).h) && /Canada/.test(crApplies(Object.assign(CR_BLANK(), {regions:["uk", "ca"]})).h), true, "the markets are named");
  eq(lvl({regions:["eu"]}), "eu", "EU only: no provider duty yet"); eq(lvl({regions:["other"]}), "watch", "elsewhere: hotlines still apply"); eq(lvl({}), "", "no markets: asked to choose");
  out.push("applies to: the US duty, duties in the UK, Canada and Australia, the EU's position, or hotlines only");
  // the requirements that apply
  cr = Object.assign(CR_BLANK(), {regions:["us"], content:["text"]});
  eq(gaps().includes("r_scope") && gaps().includes("p_1y") && !gaps().includes("d_hash") && !gaps().includes("v_48h"), true, "a text-only US service: enticement and preservation apply, hash matching and the 48-hour process don't");
  cr.content = ["uploads"]; eq(gaps().includes("d_hash") && gaps().includes("v_48h") && gaps().includes("v_tid"), true, "images bring hash matching, the 48-hour process and Take It Down");
  cr.content = ["genai"]; eq(gaps().includes("d_genai"), true, "a generator brings the generated-material requirement");
  cr.regions = ["ca"]; eq(gaps().includes("r_ca") && !gaps().includes("r_reg") && !gaps().includes("p_1y"), true, "Canada: C3P applies, NCMEC registration and one-year preservation don't");
  cr.regions = ["uk", "eu"]; eq(gaps().includes("r_uk") && gaps().includes("m_count") && gaps().includes("r_map"), true, "UK and EU: the NCA duty, transparency counts and the market map");
  cr.regions = ["us"]; cr.ctrl = {r_reg:true}; eq(gaps().includes("r_reg"), false, "ticking a control clears its gap");
  eq(/\$850,000 for a first failure and \$1 million/.test(crPenalty({size:"huge"})) && /\$600,000/.test(crPenalty({size:"mid"})), true, "the penalty tier follows the size");
  eq(crDuties(Object.assign(CR_BLANK(), {regions:["us", "uk", "eu", "ca", "au"]})).length, 5, "five markets, five duty cards"); eq(crDuties(Object.assign(CR_BLANK(), {regions:["other"]}))[0].k, "other", "elsewhere: the hotlines card");
  out.push("rules: content decides hash matching and removal duties, markets decide the route, size decides the penalty tier");
  // the example renders as a report, with every tab
  crAct("example"); h = view.innerHTML; if(bad(h)) throw new Error("example bad: " + where(h));
  const s = score(); eq(cr.ex && cr.svc === "Pixelry", true, "example loaded"); eq(s.pct > 0 && s.pct < 100 && s.crit > 0, true, "the example is partway there with critical gaps: " + s.pct + "%");
  eq(gaps().includes("p_1y") && gaps().includes("r_owner") && gaps().includes("l_verify") && gaps().includes("r_uk"), true, "Pixelry's gaps: one-year preservation, out-of-hours cover, the call-back check, the UK route");
  eq(/This is an example/.test(h) && /The US reporting duty applies/.test(h) && /Read the chapter/.test(h) && /Memo for Legal/.test(h), true, "example banner, verdict, chapter link and header actions");
  eq((h.match(/<li><b>/g) || []).length, 3, "three actions under the verdict");
  ["duties", "drafts", "reqs"].forEach(t => { cr.tab = t; renderReporting(); if(bad(view.innerHTML)) throw new Error(t + " tab bad: " + where(view.innerHTML)); });
  cr.tab = "duties"; renderReporting(); eq((view.innerHTML.match(/class="card cr-duty"/g) || []).length, 3, "three duty cards for US, UK and EU");
  CR_DRAFTS.forEach(([k]) => { cr.draft = k; renderReporting(); if(bad(view.innerHTML)) throw new Error("draft " + k + " bad: " + where(view.innerHTML)); });
  out.push("example: " + s.pct + "% ready, " + s.crit + " critical gaps; every tab and draft renders");
  // the four drafts, filled in from the answers
  const sop = crSopMd(), pres = crPreserveMd(), le = crLeMd(), memo = crMemoMd();
  eq(/# Child sexual exploitation: the first hour at Pixelry/.test(sop) && /Registered with NCMEC's CyberTipline/.test(sop) && /National Crime Agency/.test(sop) && /\| 0\. Is a child in immediate danger\?/.test(sop), true, "the first-hour procedure names both routes and starts with the danger check");
  eq(/One year from the report/.test(pres) && /NIST Cybersecurity Framework/.test(pres), true, "the preservation policy carries the US period");
  eq(/Agency phone number found independently/.test(le) && /2702/.test(le) && /DSA Article 18/.test(le), true, "the law-enforcement procedure has the call-back check and the basis for each market");
  eq(/## Duties by market/.test(memo) && /### United Kingdom/.test(memo) && /## Questions for counsel/.test(memo) && /section 70/.test(memo), true, "memo for Legal with the NCMEC-and-NCA question");
  const html = cpMd(memo); eq(/\*\*|\|---/.test(html), false, "drafts render without raw Markdown"); eq(/<ol>/.test(html), true, "numbered gaps render");
  cr.regions = ["ca"]; eq(/Canadian Centre for Child Protection/.test(crSopMd()) && /21 days/.test(crPreserveMd()), true, "a Canadian service gets the C3P route and the 21-day period");
  cr.regions = ["us", "uk", "eu"];
  out.push("drafts: the first hour, preservation, law-enforcement requests and the memo");
  // tracker, workspace, search and sharing
  cr.ex = false; const tasks = tkFromReporting(); eq(tasks.length, score().gaps.length, "one task per gap"); eq(tasks[0].pr, 4, "critical gaps are highest priority");
  const msg = wsSaveTool("reporting", cr, crTitle(cr)), it = Object.values(wsItems()).find(i => i.kind === "reporting");
  eq(!!it && new RegExp(score().pct + "% ready").test(itemSummary(it).html), true, "workspace summary"); eq(cmdkItems().some(x => x.label === "Child-safety reporting"), true, "search reaches it");
  SHARE_APPLY.reporting(JSON.parse(JSON.stringify(CR_EXAMPLE))); eq(cr.shared === true && cr.svc === "Pixelry", true, "a shared link lands as a read-only copy");
  out.push(`tracker: ${tasks.length} tasks; saved (${msg}), searchable and shareable`);
  // pre-filled from a saved pre-mortem, and from the workspace profile
  pm = fromPreset("teen_social"); Object.assign(pm, {example:false, name:"Teen clubhouse", regions:["us", "br"]}); pm.done = {csam_reporting:true, csam_review:true}; saveToLib();
  const pre = crFromPM(loopSource()); eq(pre.svc, "Teen clubhouse", "name carried over"); eq(pre.regions.join(","), "us,other", "regions carried over, with an unlisted market as elsewhere");
  eq(pre.content.includes("uploads") && pre.content.includes("text"), true, "features become content answers"); eq(!!pre.ctrl.r_reg && !!pre.ctrl.w_spec, true, "ticked safeguards become controls in place");
  out.push("pre-fill from a pre-mortem: name, " + pre.regions.length + " markets, " + pre.content.length + " kinds of content");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partCP.js"), rd("partGP.js"), rd("partCR.js"), rd("partLOOP.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
