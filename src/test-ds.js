// Checks DSA readiness: which tier and duties apply to the answers, the report, the four drafts, tracker tasks,
// saving, pre-filling from the profile and the assessment step, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  const gaps = () => dsScore(ds, dsCtx(ds)).gaps.map(r => r.k), reqs = () => dsScore(ds, dsCtx(ds)).reqs.map(r => r.k);
  // a blank check opens guided: an intro, then one question per screen, only the ones that apply
  ds = DS_BLANK(); dsView = null; gdReset("dsa"); renderDsa(); let h = view.innerHTML; if(bad(h)) throw new Error("blank intro bad: " + where(h));
  eq(/Which parts of the Digital Services Act apply/.test(h) && /data-gd="start"/.test(h) && /Answer everything on one page/.test(h), true, "guided intro with the one-page form as an option");
  gdGo(gdCur, "start"); h = view.innerHTML; eq(/What's the service called/.test(h) && /Question 1 of 4/.test(h), true, "the name first, four questions before a tier is known");
  gdCur.steps[0].set("Pixelry"); gdGo(gdCur, "next"); h = view.innerHTML; eq(/Which best describes the service/.test(h) && (h.match(/data-gdpick=/g) || []).length, 4, "four tiers");
  eq(/Example: most apps with public posts or listings/.test(h) && /Example: an ISP, a VPN provider or a CDN\./.test(h), true, "each service tier has a worked example under it");
  gdPick(gdCur, "platform"); gdGo(gdCur, "next"); h = view.innerHTML; eq(/How big is the company/.test(h), true, "size next");
  gdPick(gdCur, "medium"); gdGo(gdCur, "next"); gdPick(gdCur, "outside"); gdGo(gdCur, "next"); h = view.innerHTML;
  eq(/Which of these are true of the service/.test(h) && (h.match(/data-gdpick=/g) || []).length >= 5, true, "features for a platform");
  gdPick(gdCur, "ads"); gdPick(gdCur, "rec"); gdPick(gdCur, "minors"); gdGo(gdCur, "next"); h = view.innerHTML;
  eq(/Contact points and terms: what do you have in place today/.test(h) && /Art\. 13/.test(h), true, "the duty groups follow, with the legal representative for a non-EU provider");
  const live = gdLive(gdCur).map(s => s.id); eq(live.includes("ctrl-traders"), false, "no trader duties without traders"); eq(live.includes("ctrl-vlop"), false, "no VLOP duties for a platform");
  eq(live.includes("ctrl-minors") && live.includes("ctrl-design") && live.includes("ctrl-transparency"), true, "minors, design and transparency duties apply");
  out.push(`guided: ${live.length} screens for a medium platform outside the EU with ads, a feed and minors`);
  // which duties apply, by tier and size
  const x = dsCtx(ds); eq(x.platform && !x.small && !x.eu && x.ads && x.minors, true, "context");
  eq(reqs().includes("i_rep") && reqs().includes("n_sor") && reqs().includes("c_int") && reqs().includes("r_db") && reqs().includes("a_label") && reqs().includes("m_ads") && reqs().includes("rc_params"), true, "platform duties incl. ads, minors and recommender");
  eq(reqs().includes("k_kybc") || reqs().includes("v_risk") || reqs().includes("r_amar_req"), false, "no trader, VLOP or small-platform duties");
  ds.size = "small"; eq(reqs().includes("c_int") || reqs().includes("r_report") || reqs().includes("a_label"), false, "a small platform is exempt from the platform duties and reports");
  eq(reqs().includes("n_sor") && reqs().includes("i_terms") && reqs().includes("r_amar_req") && reqs().includes("i_minors"), true, "but keeps hosting, terms, user numbers on request and minor-friendly terms");
  eq(/core duties apply; the platform-specific ones don't yet/.test(dsApplies(ds).h), true, "small platform verdict");
  ds.size = "medium"; ds.tier = "hosting"; eq(reqs().includes("n_mech") && !reqs().includes("c_int") && !reqs().includes("a_label"), true, "hosting: notice and action, no platform duties");
  ds.tier = "conduit"; eq(reqs().includes("i_auth") && !reqs().includes("n_mech"), true, "conduit: contact points only"); eq(reqs().includes("r_report"), true, "and a transparency report when not small");
  ds.tier = "vlop"; ds.size = "small"; eq(reqs().includes("v_risk") && reqs().includes("v_ads") && reqs().includes("c_int"), true, "a VLOP gets everything, whatever its size");
  ds.feat.traders = true; eq(reqs().includes("k_kybc") && reqs().includes("k_inform"), true, "trader duties with traders");
  ds.tier = "platform"; ds.size = "medium"; ds.est = "eu"; delete ds.feat.traders; eq(reqs().includes("i_rep"), false, "no legal representative when established in the EU");
  ds.est = "outside";
  out.push(`duties: ${reqs().length} apply to the platform, ${DS_CTRL.reduce((n, g) => n + g.items.length, 0)} in all`);
  // the report: plan, duties and drafts
  ds.ctrl = {i_auth:true, i_user:true, n_mech:true, n_ack:true}; ds.view = "report"; renderDsa(); h = view.innerHTML; if(bad(h)) throw new Error("report bad: " + where(h));
  const s = dsScore(ds, dsCtx(ds)); eq(new RegExp(`${s.met} of ${s.total} duties in place`).test(h) && /The online-platform duties apply/.test(h), true, "summary");
  eq(gaps()[0], "i_rep", "the legal representative is the first gap (critical)"); eq(s.gaps.every((r, i) => !i || DS_SEV[s.gaps[i - 1].sev] >= DS_SEV[r.sev]), true, "gaps sorted by severity");
  eq(/Art\. 17/.test(h) && /Mark as done/.test(h) && /In October 2025 the Commission preliminarily found/.test(h), true, "each gap cites its article, can be ticked, and shows enforcement where there is some");
  ds.tab = "duties"; renderDsa(); h = view.innerHTML; eq((h.match(/class="cp-rq"/g) || []).length >= 6 && /eur-lex\.europa\.eu/.test(h), true, "duties grouped, with sources");
  ds.tab = "drafts"; renderDsa(); h = view.innerHTML; eq(/Statement of reasons/.test(h) && /What we did/.test(h) && /class="ph">\[date\]/.test(h), true, "the statement of reasons draft, with placeholders");
  ["notice", "complaints", "memo"].forEach(k => { ds.draft = k; renderDsa(); h = view.innerHTML; if(bad(h)) throw new Error(k + " draft bad: " + where(h)); });
  eq(/Questions for counsel/.test(view.innerHTML) && /legal representative sit in/.test(view.innerHTML) && /Enforcement to know/.test(view.innerHTML), true, "the memo asks the right questions and cites enforcement");
  const md = dsMemoMd(); eq(/^# DSA readiness: Pixelry/.test(md) && /Not legal advice/.test(md) && /6% of worldwide annual turnover/.test(md), true, "memo file");
  out.push("report: plan with articles and enforcement, duties with sources, four drafts and a memo file");
  // tracker tasks and saving
  const tasks = tkFromDsa(); eq(tasks.length, gaps().length, "one task per gap"); eq(tasks[0].owner === "Legal & Policy" && /Art\. 13/.test(tasks[0].desc) && tasks[0].labels.includes("dsa"), true, "task owner, article and label");
  const msg = wsSaveTool("dsa", ds, dsTitle(ds)); eq(/saved/i.test(msg), true, "saved to the workspace"); eq(Object.values(wsItems()).some(it => it.kind === "dsa" && /DSA readiness: Pixelry/.test(it.title)), true, "listed as a DSA check");
  const it = Object.values(wsItems()).find(z => z.kind === "dsa"); eq(/% ready/.test(itemSummary(it).html) && /% ready/.test(ovChip(it)), true, "workspace summary and chip");
  out.push(`tracker: ${tasks.length} tasks; saved and summarized in the workspace`);
  // the example, and marking a gap done
  dsAct("example"); h = view.innerHTML; eq(ds.ex && /This is an example/.test(h) && /Pixelry/.test(h), true, "example loads as a report");
  const before = gaps().length; ds.ctrl = Object.assign({}, ds.ctrl, {[gaps()[0]]:true}); eq(gaps().length, before - 1, "marking a gap done removes it");
  // pre-filled from the organization profile
  orgSet({type:"marketplace", stage:"growth", regions:["us", "eu"], youth:"teens", confirmed:true}); dsAct("fromorg"); eq(ds.tier === "platform" && ds.size === "medium" && ds.feat.traders && ds.feat.minors && ds.feat.rec, true, "profile fills tier, size and features");
  eq(dsView, "page", "and opens the one-page form to check"); renderDsa(); h = view.innerHTML; if(bad(h)) throw new Error("page form bad: " + where(h));
  eq(/Traders and products/.test(h) && /Build my plan/.test(h) && /Switch to guided/.test(h), true, "one-page form shows the trader duties and a way back to guided");
  eq(/Example: an ISP, a VPN provider or a CDN\./.test(h), true, "the one-page tier tiles carry the same worked examples");
  // the assessment step appears for EU profiles, and the plan carries the gaps
  eq(JOURNEY.some(z => z.k === "dsa"), true, "an EU profile gets the DSA step"); orgSet({regions:["us"]}); eq(JOURNEY.some(z => z.k === "dsa"), false, "a US-only one doesn't"); orgSet({regions:["us", "eu"]});
  ds.view = "report"; ds.ex = false; dsSave(); const pl = planItems().filter(z => z.kind === "dsa"); eq(pl.length, gaps().length, "the plan lists every DSA gap"); eq(pl.some(z => z.g === "do") && /^ds:/.test(pl[0].fix), true, "critical gaps go first and tick through the DSA check");
  const know = asKnow().find(z => z.tag === "DSA"); eq(!!know && /The most urgent gap/.test(know.t), true, "a DSA finding on the home");
  out.push("assessment: step for EU profiles, gaps in the plan, a finding on the home");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partTYPE.js"), rd("partGD.js"), rd("partCP.js"), rd("partDSA.js"), rd("partLOOP.js"), rd("partPLAN.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
