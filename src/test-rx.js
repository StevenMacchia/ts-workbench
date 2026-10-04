// Checks the starter exports: Osprey starter rules and a Coop checklist from a pre-mortem report, and a policy file
// from the stress-tester's rewrite. Every output says it is a starter, marks its placeholders and never says undefined.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0], has = (h, re, msg) => { if(!re.test(h)) throw new Error(msg + ": missing " + re); };
  // Osprey: one rule per top risk, placeholder features, labels declared, only verified constructs
  pm = fromPreset("teen_social"); let r = assess(pm), top = r.risks.slice(0, RX_TOP);
  const sml = rxOsprey(r, pm); if(bad(sml)) throw new Error("osprey bad: " + where(sml));
  has(sml, /starter, untested/i, "osprey labelled"); has(sml, /STARTER, UNTESTED/, "osprey header"); has(sml, /not affiliated with ROOST/, "osprey disclaimer"); has(sml, /docs\.roost\.tools\/osprey/, "osprey docs url");
  eq((sml.match(/TODO\(platform\)/g) || []).length >= 8, true, "placeholders marked TODO(platform)");
  top.forEach(x => has(sml, new RegExp(x.n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "top risk named: " + x.n));
  const rules = (sml.match(/^\w+Starter = Rule\(/gm) || []).length, wires = (sml.match(/^WhenRules\(/gm) || []).length, labels = (sml.match(/LabelAdd\(entity=UserId, label='[a-z_]+', expires_after=TimeDelta\(days=\d+\)\)/g) || []).length;
  eq(rules, top.filter(x => x.cat !== "readiness").length, "a rule per top risk"); eq(wires, rules, "every rule wired with WhenRules"); eq(labels, rules, "every rule adds one label");
  has(sml, /^UserId: Entity\[str\] = EntityJson\(/m, "entity declared"); has(sml, /^EventType: str = JsonData\(path='\$\.event_type', coerce_type=True\)/m, "event type declared"); has(sml, /^ActionName = GetActionName\(\)/m, "action name");
  const feats = sml.match(/^(\w+): (int|str|bool|float|Optional\[str\]) = JsonData\(/gm) || []; eq(feats.length >= 4, true, "placeholder features declared");
  sml.split("\n").filter(l => /^\s+\w+ (==|!=|<|>=|>|<=) /.test(l) || /^\s+not HasLabel/.test(l)).forEach(l => { const f = l.trim().split(/\s|\(/)[0]; if(f === "EventType" || f === "not") return; if(!new RegExp("^" + f + ": ", "m").test(sml)) throw new Error("rule uses an undeclared feature: " + f); });
  has(sml, /^# labels:\n#   [a-z_]+:\n#     valid_for: \[User\]\n#     connotation: negative\n#     description: "/m, "labels.yaml block");
  eq((sml.match(/\(/g) || []).length, (sml.match(/\)/g) || []).length, "parens balance"); eq((sml.match(/\[/g) || []).length, (sml.match(/\]/g) || []).length, "brackets balance");
  eq(/TextContains|BanUser|ReportRecord/.test(sml), false, "no plugin-only UDFs"); eq(/\r/.test(sml), false, "LF only");
  out.push(`osprey: ${rules} rules for ${top.length} risks, ${feats.length} placeholder features, ${(sml.match(/TODO\(platform\)/g) || []).length} TODOs`);
  // every example renders both files without bad values; the readiness risk gets a comment, not a rule
  Object.keys(PRESETS).forEach(k => { pm = fromPreset(k); const rr = assess(pm), a = rxOsprey(rr, pm), b = rxCoop(rr, pm, null, null); if(bad(a)) throw new Error(k + " osprey bad: " + where(a)); if(bad(b)) throw new Error(k + " coop bad: " + where(b)); });
  const fake = Object.assign({}, r, {risks:[Object.assign({}, r.risks[0], {id:"ops_x", cat:"readiness", n:"Operational readiness risk"})]}); has(rxOsprey(fake, pm), /not something a per-event rule can detect\. No rule generated/, "readiness risks get a comment");
  // Coop: a checklist with a policy tree, item types, actions, queues, routing, penalties in the verified set
  pm = fromPreset("teen_social"); r = assess(pm); top = r.risks.slice(0, RX_TOP);
  const md = rxCoop(r, pm, null, null); if(bad(md)) throw new Error("coop bad: " + where(md));
  has(md, /^# Coop setup checklist: /, "coop title"); has(md, /Starter, untested/, "coop labelled"); has(md, /not affiliated with ROOST/, "coop disclaimer"); has(md, /github\.com\/roostorg\/coop\/tree\/main\/docs/, "coop docs url");
  eq((md.match(/^\s*- \[ \] /gm) || []).length >= 25, true, "checkbox items"); ["## 1. Policies", "## 2. Item types", "## 3. Actions", "## 4. Queues", "## 5. Routing rules", "## 6. Automated enforcement", "## 7. Integrations"].forEach(h => has(md, new RegExp("^" + h, "m"), h));
  const cats = [...new Set(top.map(x => x.cat))]; cats.forEach(k => has(md, new RegExp("Parent policy: \\*\\*" + CATS[k] + "\\*\\*"), "parent for " + k)); top.forEach(x => has(md, new RegExp("Child policy: \\*\\*" + x.n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\*\\*"), "child for " + x.n));
  const pens = [...md.matchAll(/[Pp]enalty: ([A-Z]+)/g)].map(m => m[1]); eq(pens.length >= top.length + 5, true, "penalties suggested"); pens.forEach(p => { if(!RX_PENALTIES.includes(p)) throw new Error("penalty outside the enum: " + p); });
  has(md, /policyText: TODO/, "policy text left TODO without a rule"); has(md, /Content: \*\*Message\*\*/, "content type from dm"); has(md, /Thread: \*\*Direct message thread\*\*/, "thread type"); has(md, /User: \*\*User\*\*/, "user type");
  has(md, /Enqueue to NCMEC/, "NCMEC action for a media-hosting teen app"); has(md, /NCMEC review jobs\*\*: Coop creates these itself \(job kind NCMEC\)/, "NCMEC jobs"); has(md, /\*\*Child safety\*\*: reports and rule hits.*Child Safety Moderator role/, "child safety queue restricted"); has(md, /isAppealsQueue/, "appeals queue"); has(md, /first match wins/, "routing order"); has(md, /X-API-KEY/, "api header");
  out.push(`coop: ${(md.match(/^\s*- \[ \] /gm) || []).length} items, ${cats.length} parent policies, ${top.length} children, penalties ${[...new Set(pens)].join("/")}`);
  // the stress-tested rule and the eval's rule land in the policy tree
  const poX = {rule:"Users must not harass, bully or intimidate other users.", type:"video", youth:"teens", regions:["us"], result:{rewrite:"Harassment means repeatedly targeting a person with unwanted insults or threats.", reviewer_checklist:["Is it targeted?", "Is it repeated?"], edge_cases:[], vague_terms:[], gaps:[]}};
  const md2 = rxCoop(r, pm, poX, {policy:"Don't post scams or fraudulent offers.", name:"Scam rule", cases:[]}); if(bad(md2)) throw new Error("coop with policies bad: " + where(md2));
  has(md2, /Parent policy: \*\*Harassment\*\*\. Suggested penalty: TODO\.\n  - policyText \(the rewrite from the policy stress-tester\): "Harassment means repeatedly targeting/, "a rule outside the top risks becomes its own parent, with the rewrite"); has(md2, /reviewer checklist: Is it targeted\? Is it repeated\?/, "checklist as guidelines");
  has(md2, /Parent policy: \*\*Scams and fraud\*\*\. Suggested penalty: TODO\.\n  - policyText \(from the classifier eval, "Scam rule"\): "Don't post scams or fraudulent offers\."/, "eval rule included"); eq(/Harassment means repeatedly targeting/.test(rxCoop(r, pm, null, null)), false, "without pol, no rewrite");
  const md3 = rxCoop(r, pm, {rule:"Adults must not message minors they are not connected to.", type:"social", regions:[], result:null}, null); has(md3, /Child policy: \*\*Grooming and online enticement\*\*[^\n]*\n    - policyText \(from your stress-tested rule\): "Adults must not message minors/, "a rule in a top harm area fills that area's children"); eq(/Parent policy: \*\*Child safety\*\*\. Suggested penalty: TODO/.test(md3), false, "and is not duplicated as a parent");
  const noMatch = rxCoop(r, pm, {rule:"Be excellent to each other.", type:"social", regions:[], result:null}, null); has(noMatch, /Parent policy: \*\*Your stress-tested rule\*\*\. Suggested penalty: TODO\.\n  - policyText \(from the policy stress-tester\): "Be excellent to each other\."\n  - enforcementGuidelines: TODO/, "an unmatched rule becomes its own parent");
  // policy file: the rewrite in evPolicyDoc's four parts, with the stress-test's guidance and no eval case
  const poY = {rule:"Users must not harass, bully or intimidate other users. Content that is abusive or offensive will be removed.", type:"video", youth:"teens", regions:["us","uk"], result:{rewrite:"Harassment means repeatedly targeting a person with unwanted insults, threats or sexual comments. We allow satire and counter-speech.",
    vague_terms:[{term:"unwanted", why:"subjective", suggest:"the target asked them to stop, blocked them, or a reasonable person would not want it"}, {term:"offensive", why:"gone from the rewrite", suggest:"insults aimed at a person"}],
    gaps:[{gap:"No exception for news reporting", why:"Quoting abuse to report it would be removed."}],
    edge_cases:[{case:"A user quotes a slur to report it", decision:"allow", reasoning:"Counter-speech: the quote condemns the abuse"}, {case:"Repeated DMs after being blocked", decision:"remove", reasoning:"Persistent unwanted contact"}, {case:"Satire of a politician's record", decision:"escalate", reasoning:"Public figures and satire need a human call"}, {case:"this exact line is in the eval", decision:"remove", reasoning:"leak test"}]}};
  const evY = {policy:poY.rule, name:"x", cases:[{id:"c1", text:"This exact line is in the eval", expect:"violates"}]};
  const pf = rxPolicyFile(poY, evY); if(bad(pf)) throw new Error("policy file bad: " + where(pf));
  ["## Overview", "## Definition of Terms", "## Interpretation of Language", "## Definition of Labels"].forEach(h => has(pf, new RegExp("^" + h + "$", "m"), h));
  has(pf, /^# Policy: Harassment$/m, "named from the rule"); has(pf, /Starter, untested/, "policy labelled"); has(pf, /> Harassment means repeatedly targeting a person/, "the rewrite is the rule"); has(pf, /your original read: "Users must not harass/, "original quoted");
  has(pf, /- \*\*unwanted\*\*: the target asked them to stop/, "a flagged term still in the rewrite is defined"); eq(/\*\*offensive\*\*/.test(pf), false, "a term the rewrite dropped is not defined");
  has(pf, /- Allowed: Counter-speech: the quote condemns the abuse \(for example: A user quotes a slur to report it\)\./, "allow case as guidance"); has(pf, /- Violates: Persistent unwanted contact/, "remove case"); has(pf, /- Unclear: .*TODO: pick the label/, "escalate case left to decide");
  eq(/exact line is in the eval/i.test(pf), false, "a case that is in the eval's test set is left out"); has(pf, /keep its test cases distinct/, "leak warning"); has(pf, /- No exception for news reporting: TODO\. Quoting abuse/, "gaps to decide");
  eq(pf.indexOf("Decisions from the stress-test") > pf.indexOf("## Interpretation of Language") && pf.indexOf("Decisions from the stress-test") < pf.indexOf("## Definition of Labels"), true, "guidance sits in Interpretation");
  has(pf, /### violates\n/, "labels defined"); eq((pf.match(/TODO/g) || []).length >= 10, true, "TODOs kept"); eq(/\r/.test(pf), false, "LF only");
  eq(rxPolicyFile({rule:"x", result:null}, null), "", "no rewrite, no file"); eq(rxPolicyFile({rule:"x", result:{rewrite:"Be kind to one another online."}}, null).includes("# Policy: Be kind to one another online"), true, "a rule without a known harm is named from its words");
  out.push(`policy file: four parts, ${(pf.match(/^- (Allowed|Violates|Unclear):/gm) || []).length} guidance lines, ${(pf.match(/TODO/g) || []).length} TODOs, eval case kept out`);
  // UI: the Build it panel in the report, the button in the rewrite tab, and the generator registry
  pm = fromPreset("dating"); const rep = renderReport(assess(pm)); if(bad(rep)) throw new Error("report bad: " + where(rep));
  has(rep, /class="card rx-build"/, "build panel"); has(rep, /class="wip-tag">Starter, untested</, "wip tag"); has(rep, /data-rx="osprey"/, "osprey button"); has(rep, /data-rx="coop"/, "coop button"); has(rep, /osprey-starter-dating-app-example\.sml/, "file name shown");
  eq(rxBuildHTML({risks:[]}), "", "no panel without risks");
  pol = Object.assign(POL_BLANK(), {rule:poY.rule, result:Object.assign({score:50, summary:"s", strengths:[], assumptions:[], reviewer_checklist:[], open_questions:[], enforcement_risks:[], legal:[]}, poY.result), heur:polHeuristics(poY.rule)});
  const tab = polTabHTML("rewrite"); if(bad(tab)) throw new Error("rewrite tab bad: " + where(tab)); has(tab, /data-rx="policy"/, "policy file button"); has(tab, /as policy file</, "button label"); has(tab, /class="wip-chip">starter</, "starter chip");
  pol.result = null; eq(rxPolicyBtnHTML(), "", "no button without a rewrite");
  eq(RX_EXPORTS.length, 3, "three generators listed"); RX_EXPORTS.forEach(x => { if(typeof eval(x.fn) !== "function") throw new Error("generator missing: " + x.fn); });
  out.push("ui: Build it panel with two buttons, policy-file button in the rewrite tab, registry of 3 generators");
  return out.join("\n");
};
const parts = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partCP.js"), rd("partEV.js"), rd("partEV2.js"), rd("partEVB.js"), rd("partRX.js")].join("\n");
console.log(new Function(parts + "\nreturn (" + body.toString() + ")();")());
