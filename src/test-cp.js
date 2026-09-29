// Checks COPPA readiness: who it applies to, the rules that turn answers into gaps, the report, the four drafts,
// tracker tasks, saving, and pre-filling from a pre-mortem, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  const gaps = () => cpScore(cp, cpCtx(cp), cpApplies(cp)).gaps.map(r => r.k);
  // a blank check asks only who the service is for
  cp = CP_BLANK(); renderCoppa(); let h = view.innerHTML; if(bad(h)) throw new Error("blank setup bad: " + where(h));
  eq((h.match(/class="pol-lbl"/g) || []).length, 1, "a blank check starts with one section"); eq(/data-cp="build" disabled/.test(h), true, "can't build a plan before choosing an audience");
  // who it applies to
  const lvl = o => cpApplies(Object.assign(CP_BLANK(), o)).lvl;
  eq(lvl({aud:"primary"}), "all", "children's services: every user"); eq(lvl({aud:"mixed"}), "under13", "mixed audience: users under 13");
  eq(lvl({aud:"general", fac:{subject:true, visual:true, reviews:true}}), "under13", "three signs of a child audience make a general service mixed");
  eq(lvl({aud:"general", know:["reports"]}), "known", "a general service with ways to learn ages: the children it knows about");
  eq(lvl({aud:"adult"}), "watch", "adults only, no signs: likely doesn't apply");
  out.push("applies to: every user, users under 13, known children, or likely not at all");
  // the example: a children's learning app partway to compliance
  cp = Object.assign(CP_BLANK(), JSON.parse(JSON.stringify(CP_EXAMPLE)));
  let s = cpScore(cp, cpCtx(cp), cpApplies(cp));
  eq(s.total, 28, "requirements that apply to the example"); eq(s.met, 13, "requirements the example meets"); eq(s.crit, 3, "critical gaps in the example");
  eq(gaps().slice(0, 3).join(","), "vpc_ok,nolimit,c_sep", "most urgent first: email plus while sharing, no deletion limit, no separate consent");
  renderCoppa(); h = view.innerHTML; if(bad(h)) throw new Error("report bad: " + where(h));
  eq(/COPPA applies to every user/.test(h) && /46%/.test(h), true, "report verdict and readiness");
  ["map", "drafts", "reqs"].forEach(t => { cp.tab = t; renderCoppa(); if(bad(view.innerHTML)) throw new Error(t + " tab bad: " + where(view.innerHTML)); });
  out.push(`example: ${s.met} of ${s.total} in place, ${s.crit} critical gaps, every tab renders`);
  // the four drafts, filled in from the answers
  const notice = cpNoticeMd(), ret = cpRetentionMd(), sec = cpSecurityMd(), memo = cpMemoMd();
  eq(/# We need your permission: Brightbeam/.test(notice) && /You can say yes to Brightbeam without saying yes to sharing/.test(notice) && /Click “I agree”/.test(notice), true, "notice to parents");
  eq(/\| Persistent identifiers \| Analytics and improving the service \| .* \| \[set a limit\] \|/.test(ret), true, "retention schedule flags the missing limit");
  eq(/## 6\. Service providers and third parties/.test(sec) && /third-party SDKs/.test(sec), true, "security program outline keeps acronyms");
  eq(/## Questions for counsel/.test(memo) && /1\. \*\*Use a consent method that allows sharing\*\*/.test(memo) && /not relevant, because every user is treated as a child/.test(memo), true, "memo for Legal");
  const html = cpMd(memo); eq(/\*\*|\|---/.test(html), false, "drafts render without raw Markdown"); eq(/<table>/.test(html) && /<ol>/.test(html), true, "tables and numbered gaps render");
  out.push("drafts: notice to parents, retention policy, security program and memo");
  // the rules
  cp.vpc = "card"; eq(gaps().includes("vpc_ok"), false, "a card check is allowed when you share");
  cp.pi.persist.keep = "1y"; eq(gaps().includes("nolimit"), false, "a set limit clears the retention gap");
  cp.pi.persist.share = ["providers"]; eq(gaps().includes("c_sep"), false, "no third-party sharing, no separate consent needed");
  eq(cpCtx(cp).persistOps, true, "identifiers used for analytics with service providers fall under internal operations");
  cp = Object.assign(CP_BLANK(), {aud:"mixed", pi:{persist:{on:true, use:"ops", share:["providers"], keep:"30d"}}});
  eq(cpCtx(cp).needsConsent, false, "identifiers used only to run the service don't need consent"); eq(gaps().includes("gate"), true, "a mixed audience must ask for age");
  cp.gate = "leading"; eq(/default or a hint/.test(cpWhy(cpReqs(cp, cpCtx(cp), cpApplies(cp)).find(r => r.k === "gate"), cpCtx(cp))), true, "a leading age question is called out");
  cp.gate = "neutral"; eq(gaps().includes("gate"), false, "a neutral age question passes");
  out.push("rules: consent methods, retention limits, separate consent, internal operations, neutral age questions");
  // tracker, workspace and search
  cp = Object.assign(CP_BLANK(), JSON.parse(JSON.stringify(CP_EXAMPLE)), {ex:false});
  const tasks = tkFromCoppa(); eq(tasks.length, cpScore(cp, cpCtx(cp), cpApplies(cp)).gaps.length, "one task per gap"); eq(tasks[0].pr, 4, "critical gaps are highest priority");
  const msg = wsSaveTool("coppa", cp, cpTitle(cp)), it = Object.values(wsItems()).find(i => i.kind === "coppa");
  eq(!!it && /46% ready/.test(itemSummary(it).html), true, "workspace summary"); eq(cmdkItems().some(x => x.label === "COPPA readiness"), true, "search reaches it");
  out.push(`tracker: ${tasks.length} tasks; saved (${msg}) and searchable`);
  // pre-filled from a saved pre-mortem for a children's product
  pm = fromPreset("teen_social"); Object.assign(pm, {example:false, name:"Kids clubhouse", youth:"kids"}); saveToLib();
  const pre = cpFromPM(loopSource()); eq(pre.aud, "primary", "a product built for children is primary audience"); eq(pre.svc, "Kids clubhouse", "service name carried over");
  eq(!!pre.pi.persist && !!pre.pi.contact, true, "data map starts from the product's features");
  out.push("pre-fill from a pre-mortem: audience, name and " + Object.keys(pre.pi).length + " kinds of data");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partCV.js"), rd("partTK.js"), rd("partCP.js"), rd("partLOOP.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
