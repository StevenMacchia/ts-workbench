/* =========================================================
   COPPA READINESS: whether the Children's Online Privacy Protection Act applies, the children's data you
   handle, where you fall short of the amended Rule, and four drafts to close the gaps.
   Checked against 16 CFR Part 312 as amended by the FTC in 2025 (compliance required from April 22, 2026),
   in September 2026. A starting point for counsel, not legal advice.
   ========================================================= */
const CP_REVIEWED = "September 2026";
const CP_SRC = [
  ["The COPPA Rule, 16 CFR Part 312 (current text)", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312"],
  ["FTC: the COPPA Rule and its 2025 amendments", "https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa"],
  ["FTC: Complying with COPPA, frequently asked questions", "https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions"]
];
const CP_AUD = [
  ["primary", "Children are the main audience", "Built for under-13s, like a kids' game, a learning app or a children's video service."],
  ["mixed", "Children are one of several audiences", "Aimed partly at children, like a family game or a video app with a kids' section."],
  ["general", "General audience", "Built for teens and adults, but under-13s can sign up or use it."],
  ["adult", "Adults only", "18+ by design, with nothing that appeals to children."]
];
// What the FTC weighs to decide whether a service is directed to children (§312.2). A third value of 1 marks the ones added in 2025
const CP_FACTORS = [
  ["subject", "The subject matter appeals to children"],
  ["visual", "Animated characters, bright visuals, or activities and rewards aimed at children"],
  ["audio", "Music or other audio aimed at children"],
  ["models", "Child models, or celebrities who appeal to children"],
  ["ads", "Ads on or for the service that are aimed at children"],
  ["language", "Language written for young readers"],
  ["marketing", "Marketing plans, pitch decks or statements to partners that mention children", 1],
  ["reviews", "User reviews or app store listings suggest children use it", 1],
  ["similar", "Similar services have many users under 13", 1],
  ["data", "Your own audience data shows users under 13"]
];
const CP_KNOW = [
  ["agegate", "Users tell an age question they're under 13"],
  ["reports", "Users, parents or teachers report that a user is under 13"],
  ["support", "Support conversations reveal a user's age"],
  ["content", "Profiles or posts show a user is under 13, like “I'm in 4th grade”"],
  ["partners", "Schools or partners provide the service to children"]
];
const CP_GATE = [
  ["none", "We don't ask for age", ""],
  ["neutral", "A neutral age question", "No pre-filled year, no hint about the cut-off age, and no easy way to go back and change the answer."],
  ["leading", "An age question with a default or a hint", "For example a pre-selected year, or “you must be 13 or older to join”."],
  ["assured", "Age assurance", "Estimation, an ID check or another method stronger than a typed birthday."]
];
// Personal information as COPPA defines it (§312.2). A fourth value of 1 marks the kinds added in 2025
const CP_PI = [
  ["name", "First and last name", ""],
  ["contact", "Email address or other online contact details", ""],
  ["user", "A username others can use to contact the child", ""],
  ["phone", "Phone number", ""],
  ["address", "Home or other physical address", ""],
  ["govid", "Government ID number", "Social Security, passport, state ID or birth certificate number.", 1],
  ["persist", "Persistent identifiers", "Cookies, device IDs, advertising IDs or IP addresses that recognize a user over time."],
  ["media", "Photos, videos or audio of the child", "Anything showing the child's face or recording their voice."],
  ["geo", "Precise location", "Enough to identify a street and a city or town, like GPS."],
  ["bio", "Biometric identifiers", "Face or voice prints, fingerprints, iris or retina patterns, gait or DNA.", 1],
  ["other", "Other details tied to any of the above", "Birthday, school, messages, interests or anything else you link to the child."]
];
const CP_USE = [["ops", "Running the service"], ["feature", "A feature the child uses"], ["analytics", "Analytics and improving the service"], ["ads", "Advertising or marketing"], ["safety", "Safety, security or legal duties"]];
const CP_SHARE = [
  ["providers", "Service providers", "Vendors that only help run your service, like hosting or support tools."],
  ["sdk", "Third-party SDKs", "Code from others in your app or site, like analytics, attribution or social SDKs, that may use the data for their own purposes."],
  ["ads", "Advertising partners", ""],
  ["public", "Other users or the public", ""],
  ["sold", "Sold or licensed", ""]
];
const CP_KEEP = [["use", "Deleted right after use"], ["30d", "Up to 30 days"], ["1y", "Up to a year"], ["account", "While the account is open"], ["none", "No set limit"]];
// Verifiable parental consent methods (§312.5(b)): [key, name, detail, allowed when you share children's data, added in 2025]
const CP_VPC = [
  ["card", "Card or payment check", "A credit or debit card, or an online payment account that notifies the holder of each transaction.", 1],
  ["id", "Government ID check", "Checked against databases, then deleted.", 1],
  ["face", "Photo ID and face match", "A parent's photo ID compared with a live selfie by facial recognition and trained staff, then both images deleted.", 1, 1],
  ["kba", "Knowledge-based questions", "Questions a child in the household couldn't reasonably answer.", 1, 1],
  ["call", "Phone or video call", "A toll-free number or a video call with trained staff.", 1],
  ["form", "Signed consent form", "Returned by post or fax, or as a scan.", 1],
  ["textplus", "Text plus", "A text message to the parent, then a confirming step later. Only when you never share children's data.", 0, 1],
  ["emailplus", "Email plus", "An email to the parent, then a confirming step later. Only when you never share children's data.", 0],
  ["none", "No consent step yet", "", 1]
];
// Plain cost and friction hint for each method, since the Rule doesn't say which ones need a vendor and which are free
const CP_VPC_COST = {card:"Usually needs a payment vendor", id:"Usually needs an ID-check vendor", face:"Needs a vendor and trained staff", kba:"Usually needs a vendor",
  call:"Needs staff time, no vendor required", form:"Free, but slower to process", textplus:"Free", emailplus:"Free", none:""};
const CP_OWNERS = {product:"Product", eng:"Engineering", legal:"Legal & Privacy", ops:"T&S Ops"};
const CP_SEV = {crit:3, high:2, med:1};
const CP_SEVN = {crit:["Critical", "crit"], high:["High", "high"], med:["Medium", "med"]};
const cpList = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
const cpLabel = (list, k) => (list.find(z => z[0] === k) || [])[1] || "";
// Lowercase for use mid-sentence, keeping acronyms such as SDKs
const cpLow = s => s.charAt(0).toLowerCase() + s.slice(1);
// When a requirement applies, given the answers (d), the data map (x) and whether COPPA applies (ap)
const CP_APPLY = {
  any:(d, x) => x.rows.length > 0,
  consent:(d, x) => x.needsConsent,
  third:(d, x) => x.third,
  disclose:(d, x) => x.disclose,
  public:(d, x) => x.public,
  persistOps:(d, x) => x.persistOps,
  newpi:(d, x) => x.bio || x.govid,
  mixed:(d, x, ap) => ap.lvl === "under13",
  aware:(d, x, ap) => ap.lvl !== "all"
};
// What you have in place, grouped as the Rule is. Each item is also a requirement: t text, sev, o owner, cite, a applies, why, fix, kase an enforcement case
const CP_CTRL = [
  {k:"consent", n:"Parental consent", h:"Verifiable consent from a parent, before you collect.", items:[
    {k:"c_before", t:"Nothing is collected from a child before consent, except what an exception allows", sev:"crit", o:"eng", cite:"§312.5(a)", a:"consent",
      why:"Consent that arrives after collection doesn't count. Sign-up forms, uploads and SDKs that start on launch are the usual culprits.",
      fix:"Collect only the parent's contact details first, and hold back other fields, uploads and third-party SDKs until consent arrives.",
      kase:"Microsoft paid $20 million in 2023 after Xbox collected children's details during sign-up before notifying or asking their parents."},
    {k:"c_sep", t:"A separate consent before sharing with third parties", isNew:1, sev:"crit", o:"product", cite:"§312.5(a)(2)", a:"disclose",
      why:"Since the 2025 amendments, sharing children's data with third parties, for example for advertising, needs its own consent, separate from consent to collect it, unless the sharing is integral to the service.",
      fix:"Add a second, optional consent for sharing, and keep ad sharing and third-party SDKs off until a parent agrees.",
      kase:"Google and YouTube paid $170 million in 2019 over collecting identifiers from viewers of children's channels to serve targeted ads."},
    {k:"c_nocond", t:"A child can use the service when a parent agrees to collection but declines sharing", sev:"high", o:"product", cite:"§312.5(a)(2)", a:"disclose",
      why:"Parents must be able to say yes to the service and no to sharing.",
      fix:"Test the full experience with sharing declined, and remove anything that blocks it."},
    {k:"c_newpi", t:"Consent, notices, retention and security cover biometric data and government ID numbers", isNew:1, sev:"high", o:"legal", cite:"§312.2", a:"newpi",
      why:"The 2025 amendments added biometric identifiers and government ID numbers to the definition of personal information.",
      fix:"Add them to your notices, consent flow, retention policy and security program."}]},
  {k:"direct", n:"Notice to parents", h:"The notice a parent gets before you collect their child's data.", items:[
    {k:"d_before", t:"Reaches parents before you collect anything beyond their contact details", sev:"high", o:"product", cite:"§312.4(b)", a:"consent",
      why:"Consent isn't informed unless the notice comes first.", fix:"Make the notice to parents the first step of the consent flow."},
    {k:"d_items", t:"Lists what you'll collect, how you'll use it, and who you'll share it with and why", isNew:1, sev:"high", o:"legal", cite:"§312.4(c)", a:"consent",
      why:"The 2025 amendments added who receives children's data, and why, to what the notice to parents must say.", fix:"Use the draft notice to parents, filled in from your data map."},
    {k:"d_sep", t:"Tells parents they can agree to collection without agreeing to sharing", sev:"high", o:"legal", cite:"§312.4(c)", a:"disclose",
      why:"Parents can't use a choice they aren't told about.", fix:"Say so plainly in the notice, next to the list of who receives the data."},
    {k:"d_delete", t:"Says you'll delete the parent's contact details if they don't respond", sev:"med", o:"legal", cite:"§312.4(c)", a:"consent",
      why:"You may keep a parent's contact details only to ask for consent.", fix:"State a time limit in the notice, then delete unanswered requests automatically."}]},
  {k:"notice", n:"Your children's privacy notice", h:"The online notice linked from wherever you collect children's data.", items:[
    {k:"n_contact", t:"Names every operator, with an address, phone number and email", sev:"med", o:"legal", cite:"§312.4(d)", a:"any",
      why:"Parents need to know who's responsible for their child's data.", fix:"List each operator's name, address, phone number and email."},
    {k:"n_what", t:"Says what you collect from children, how you use it, and whether children can make it public", sev:"high", o:"legal", cite:"§312.4(d)", a:"any",
      why:"The notice is the first thing a regulator reads, and it has to match what the product really does.", fix:"Describe each row of your data map, how you use it, and any feature that lets children share publicly."},
    {k:"n_third", t:"Names the third parties, or specific categories of them, you share with, and why", isNew:1, sev:"high", o:"legal", cite:"§312.4(d)", a:"disclose",
      why:"The 2025 amendments require the notice to identify who receives children's data and for what purpose.", fix:"Add each recipient, or a specific category such as “analytics provider”, with the purpose."},
    {k:"n_ret", t:"Includes your data retention policy", isNew:1, sev:"high", o:"legal", cite:"§312.10", a:"any",
      why:"The amended Rule requires your written retention policy to be published in the online notice.", fix:"Publish the retention policy, or a clear summary of it, in the notice."},
    {k:"n_ops", t:"Explains which internal operations use persistent identifiers, and how you stop them being used to contact or profile a child", isNew:1, sev:"med", o:"legal", cite:"§312.4(d)", a:"persistOps",
      why:"If you rely on the internal-operations exception, the amended Rule requires you to say so and to explain the limits you apply.",
      fix:"List the internal operations, such as security, understanding how the service works and contextual ads, and the controls that stop profiling or targeted ads."},
    {k:"n_rights", t:"Explains how parents can review and delete their child's data and stop further collection", sev:"med", o:"legal", cite:"§312.4(d)", a:"any",
      why:"Parents can only use rights they know about.", fix:"Add the steps, and a contact, for reviewing, deleting and revoking consent."}]},
  {k:"rights", n:"Parents' rights", h:"What parents can ask you to do, at any time.", items:[
    {k:"r_review", t:"Parents can see the information you hold about their child", sev:"high", o:"ops", cite:"§312.6", a:"any",
      why:"Parents have a right to review what you've collected.", fix:"Give parents a way to request, or view, their child's information."},
    {k:"r_delete", t:"Parents can have it deleted and stop further collection", sev:"high", o:"eng", cite:"§312.6", a:"any",
      why:"Deletion has to reach every system and vendor, or it isn't deletion.", fix:"Build deletion that covers backups and vendors, and a way to revoke consent.",
      kase:"Amazon paid $25 million in 2023 over keeping children's Alexa voice recordings indefinitely and undermining parents' deletion requests."},
    {k:"r_verify", t:"You check that the person asking is really the parent", sev:"med", o:"ops", cite:"§312.6", a:"any",
      why:"Handing a child's data to the wrong adult is a harm of its own.", fix:"Confirm identity, for example through the original consent method, before releasing anything."}]},
  {k:"minimize", n:"Collecting only what's needed", h:"Design choices the FTC looks at closely.", items:[
    {k:"m_cond", t:"Games, prizes and features don't ask for more information than they need", sev:"med", o:"product", cite:"§312.7", a:"any",
      why:"COPPA bars making a child's participation depend on giving more information than is reasonably necessary.", fix:"Review every sign-up and feature field, and remove what isn't needed."},
    {k:"m_public", t:"Chat, profiles and other ways to share publicly stay off for children until a parent agrees", sev:"crit", o:"product", cite:"§312.5", a:"public",
      why:"Letting children publish personal information is a disclosure that needs consent, and it's where many of the worst harms to children start.",
      fix:"Default chat, profiles and uploads to off or private for children, and turn them on only with consent.",
      kase:"Epic Games paid $275 million in 2022, partly because Fortnite's voice and text chat were on by default for children."}]},
  {k:"retention", n:"Data retention", h:"Keeping children's data only as long as you need it.", items:[
    {k:"t_policy", t:"A written retention policy: what you keep, why, and when you delete it", isNew:1, sev:"high", o:"legal", cite:"§312.10", a:"any",
      why:"The amended Rule requires a written policy setting out the purposes, the business need and a deletion timeframe for children's data.", fix:"Use the draft retention policy, filled in from your data map."},
    {k:"t_enforce", t:"Deletion actually runs on schedule, including backups and vendors", sev:"high", o:"eng", cite:"§312.10", a:"any",
      why:"A policy that isn't carried out is a promise you're breaking.", fix:"Automate deletion, and check every quarter that it ran."},
    {k:"t_noconsent", t:"Data collected without consent, like unanswered consent requests, is deleted promptly", sev:"med", o:"eng", cite:"§312.5(c)", a:"consent",
      why:"The exceptions that let you collect before consent come with a duty to delete.", fix:"Set an automatic deletion window for pending consent requests."}]},
  {k:"security", n:"Security program", h:"Required in writing since the 2025 amendments.", items:[
    {k:"s_written", t:"A written information security program for children's data", isNew:1, sev:"high", o:"eng", cite:"§312.8", a:"any",
      why:"The 2025 amendments turned “reasonable security” into a written program with specific parts.", fix:"Use the security program outline."},
    {k:"s_owner", t:"Named people coordinate it", isNew:1, sev:"med", o:"eng", cite:"§312.8", a:"any",
      why:"Someone has to own the program for it to happen.", fix:"Name a coordinator and a backup."},
    {k:"s_assess", t:"Risks are assessed at least once a year", isNew:1, sev:"med", o:"eng", cite:"§312.8", a:"any",
      why:"The amended Rule requires a risk assessment at least once a year.", fix:"Schedule the assessment and record what it finds."},
    {k:"s_test", t:"Safeguards are tested and monitored regularly", isNew:1, sev:"med", o:"eng", cite:"§312.8", a:"any",
      why:"Controls drift. Testing is how you know they still work.", fix:"Set a testing rhythm, such as access reviews and scans, and track the results."},
    {k:"s_review", t:"The program is reviewed and updated at least once a year", isNew:1, sev:"med", o:"eng", cite:"§312.8", a:"any",
      why:"The amended Rule requires the program to be evaluated at least once a year.", fix:"Hold a yearly review and record what changed."},
    {k:"s_vendors", t:"Vendors that receive children's data are checked, and give written assurances they'll protect it", isNew:1, sev:"high", o:"legal", cite:"§312.8", a:"third",
      why:"Before sharing, the amended Rule requires reasonable steps to confirm a recipient can keep children's data secure, and written assurances that it will.",
      fix:"Add a vendor review, and contract terms covering confidentiality, security and deletion."}]},
  {k:"age", n:"Age screening", h:"For services that aren't aimed mainly at children.", items:[
    {k:"g_before", t:"Nothing is collected before the age question, except what an exception allows", isNew:1, sev:"crit", o:"eng", cite:"§312.2 (mixed audience)", a:"mixed",
      why:"The amended Rule's definition of a mixed-audience service requires finding out who's a child before collecting personal information.",
      fix:"Move the age question to the very start, before any identifiers or form fields."},
    {k:"g_route", t:"Users who say they're under 13 go to parental consent, or to a version that collects no personal information", sev:"high", o:"product", cite:"§312.5", a:"mixed",
      why:"An age question only helps if what happens next is compliant.", fix:"Build the under-13 path: a parent consent flow, or a limited version with no personal data."},
    {k:"g_known", t:"When you learn a user is under 13, you get a parent's consent or delete their data", sev:"high", o:"ops", cite:"§312.5", a:"aware",
      why:"Once you know a user is a child, COPPA applies to them, even on a general-audience service.",
      fix:"Give reviewers a clear path for underage reports: pause collection, contact the parent or delete the data."}]},
  {k:"harbor", n:"Safe harbor", h:"Optional.", items:[
    {k:"h_member", t:"You're in an FTC-approved safe harbor program", opt:1, sev:"med", o:"legal", cite:"§312.11", a:"any",
      why:"Members that follow an approved program's guidelines are treated as complying with the Rule, and get guidance and audits.",
      fix:"Compare the approved programs, such as those run by CARU, ESRB, iKeepSafe, kidSAFE and PRIVO."}]}
];
// Requirements worked out from the answers rather than ticked
const CP_SPECIAL = [
  {k:"vpc", g:"consent", t:"Get a parent's verifiable consent before collecting", sev:"crit", o:"product", cite:"§312.5(a)–(b)", a:"consent", m:d => !!d.vpc && d.vpc !== "none",
    why:"Collecting a child's personal information without a parent's verifiable consent is the core COPPA violation, and each child can count as a separate violation.",
    fix:"Add a consent step that uses one of the FTC's approved methods, before you collect anything an exception doesn't cover.",
    kase:"Musical.ly, now TikTok, paid $5.7 million in 2019 for collecting names, email addresses and photos from children without their parents' consent."},
  {k:"vpc_ok", g:"consent", t:"Use a consent method that allows sharing", sev:"crit", o:"product", cite:"§312.5(b)", a:(d, x) => x.disclose && (d.vpc === "emailplus" || d.vpc === "textplus"), m:() => false,
    why:"Email plus and text plus are only allowed when you keep children's data to yourself, and you share it with third parties.",
    fix:"Switch to a card or payment check, an ID check, a photo ID and face match, knowledge-based questions, a call or a signed form, or stop sharing."},
  {k:"gate", g:"age", t:"Ask for age in a neutral way", isNew:1, sev:"crit", o:"product", cite:"§312.2 (mixed audience)", a:"mixed", m:d => d.gate === "neutral" || d.gate === "assured",
    why:d => d.gate === "leading" ? "Your age question has a default or a hint. The amended Rule requires a mixed-audience service to ask without defaulting to an age or encouraging children to lie." : "A mixed-audience service must find out who's a child, neutrally, before collecting personal information.",
    fix:"Use an open birth-date field with no pre-filled year, don't mention the cut-off age, and stop children going back to change their answer."},
  {k:"nolimit", g:"retention", t:"Set a deletion timeframe for every kind of children's data", isNew:1, sev:"crit", o:"legal", cite:"§312.10", a:(d, x) => x.noLimit.length > 0, m:() => false,
    why:(d, x) => `The amended Rule forbids keeping children's personal information indefinitely, and you keep ${cpList(x.noLimit.map(r => cpLow(r.n)))} with no set limit.`,
    fix:"Tie each kind of data to the purpose you collect it for, and delete it when that purpose is served.",
    kase:"Amazon paid $25 million in 2023 over keeping children's Alexa voice recordings indefinitely and undermining parents' deletion requests."},
  {k:"keepset", g:"retention", t:"Decide how long you keep each kind of data", sev:"med", o:"legal", cite:"§312.10", a:(d, x) => x.noKeep.length > 0, m:() => false,
    why:(d, x) => `You haven't set how long you keep ${cpList(x.noKeep.map(r => cpLow(r.n)))}.`,
    fix:"Choose how long you keep each row of your data map."}
];
const CP_BLANK = () => ({svc:"", aud:"", fac:{}, know:[], gate:"", pi:{}, vpc:"", ctrl:{}, view:"setup", tab:"plan", draft:"notice", ex:false});
// Brightbeam: a learning app for young children, partway to compliance
const CP_EXAMPLE = {svc:"Brightbeam", aud:"primary", ex:true, fac:{subject:true, visual:true, audio:true, language:true, marketing:true}, know:[], gate:"",
  pi:{name:{on:true, use:"feature", share:[], keep:"account"}, contact:{on:true, use:"ops", share:["providers"], keep:"account"},
    persist:{on:true, use:"analytics", share:["providers", "sdk"], keep:"none"}, media:{on:true, use:"feature", share:["providers"], keep:"1y"},
    other:{on:true, use:"feature", share:["providers"], keep:"account"}},
  vpc:"emailplus",
  ctrl:{n_contact:true, n_what:true, n_rights:true, d_before:true, d_delete:true, c_before:true, r_review:true, r_delete:true, m_cond:true, s_written:true, s_owner:true, t_noconsent:true},
  view:"report", tab:"plan", draft:"notice"};
let cp = Object.assign(CP_BLANK(), store.get("cp", null) || {});
const cpSave = () => store.set("cp", cp);
const cpTitle = d => "COPPA readiness: " + (d.svc || "Untitled service");
// The example's own readiness score, for a benchmark line under the verdict
function cpBenchPct(){
  try{ const d = Object.assign(CP_BLANK(), CP_EXAMPLE), x = cpCtx(d), ap = cpApplies(d); return cpScore(d, x, ap).pct; }catch(e){ return null; }
}
shareRegister("coppa", d => { cp = Object.assign(CP_BLANK(), d, {shared:true}); cpView = "page"; cpSave(); });

/* ---------- working it out ---------- */
function cpCtx(d){
  const rows = CP_PI.filter(p => d.pi[p[0]] && d.pi[p[0]].on).map(p => Object.assign({use:"feature", share:[], keep:""}, d.pi[p[0]], {k:p[0], n:p[1]}));
  const shares = new Set(rows.flatMap(r => r.share || []));
  // Identifiers used only to run, secure or understand the service, and shared only with service providers, fall under the internal-operations exception
  const opsOnly = r => ["ops", "analytics", "safety"].includes(r.use) && (r.share || []).every(s => s === "providers");
  const persist = rows.find(r => r.k === "persist"), has = k => rows.some(r => r.k === k);
  return {rows, shares, has, disclose:["ads", "sdk", "sold"].some(k => shares.has(k)), public:shares.has("public"), third:shares.size > 0,
    persistOps:!!persist && opsOnly(persist), needsConsent:rows.some(r => !(r.k === "persist" && opsOnly(r))),
    noLimit:rows.filter(r => r.keep === "none"), noKeep:rows.filter(r => !r.keep), bio:has("bio"), govid:has("govid")};
}
function cpApplies(d){
  const fac = CP_FACTORS.filter(f => d.fac[f[0]]).length, know = (d.know || []).length;
  if(!d.aud) return {lvl:"", h:"Tell us who your service is for", t:"Choose an audience to see whether COPPA applies.", tone:""};
  if(d.aud === "primary") return {lvl:"all", h:"COPPA applies to every user", t:"Children are your primary audience, so you must treat every user as a child. Asking for age doesn't change that.", tone:"crit"};
  if(d.aud === "mixed") return {lvl:"under13", h:"COPPA applies to users under 13", t:"Your service is aimed partly at children, which makes it a mixed-audience service. Ask for age neutrally before collecting personal information, then get a parent's consent for users under 13 or give them a version that collects none.", tone:"high"};
  if(fac >= 3) return {lvl:"under13", h:"The FTC could treat your service as aimed at children", t:`${fac} of the signs the FTC weighs point to children. If it agrees, you're a mixed-audience service: ask for age neutrally and get a parent's consent for users under 13.`, tone:"high"};
  if(know) return {lvl:"known", h:"COPPA applies to the children you know about", t:"You have ways of learning that a user is under 13. Once you know, you have actual knowledge: get a parent's consent or delete the child's data.", tone:"high"};
  return {lvl:"watch", h:"COPPA likely doesn't apply today", t:"You don't aim at children and you've no sign of users under 13. Make it easy to report underage users, and act quickly when someone does.", tone:"good"};
}
const cpApplyFn = a => typeof a === "function" ? a : CP_APPLY[a];
const cpItemOn = (it, d, x, ap) => !!ap.lvl && (ap.lvl !== "watch" || it.a === "aware") && cpApplyFn(it.a)(d, x, ap);
const cpWhy = (r, x) => typeof r.why === "function" ? r.why(cp, x) : r.why;
function cpReqs(d, x, ap){
  const out = [];
  CP_SPECIAL.forEach(r => { if(cpItemOn(r, d, x, ap)) out.push(Object.assign({}, r, {met:!!r.m(d, x, ap)})); });
  CP_CTRL.forEach(g => g.items.forEach(it => { if(cpItemOn(it, d, x, ap)) out.push(Object.assign({g:g.k}, it, {met:!!d.ctrl[it.k]})); }));
  return out;
}
function cpScore(d, x, ap){
  const reqs = cpReqs(d, x, ap), counted = reqs.filter(r => !r.opt), met = counted.filter(r => r.met).length;
  const gaps = counted.filter(r => !r.met).sort((a, b) => CP_SEV[b.sev] - CP_SEV[a.sev]);
  return {reqs, total:counted.length, met, pct:counted.length ? Math.round(met / counted.length * 100) : 0, gaps, crit:gaps.filter(r => r.sev === "crit").length};
}
// Notes on one row of the data map
function cpRowFlags(r){
  const f = [], third = (r.share || []).filter(s => ["ads", "sdk", "sold"].includes(s));
  if(r.keep === "none") f.push(["crit", "No set limit. The amended Rule forbids keeping children's personal information indefinitely."]);
  if(third.length) f.push(["crit", "Sharing with " + cpList(third.map(s => cpLow(cpLabel(CP_SHARE, s)))) + " needs a parent's separate consent, unless it's integral to the service."]);
  if((r.share || []).includes("public")) f.push(["high", "Letting children make this public needs a parent's consent first. Keep it off by default."]);
  if(r.k === "persist") f.push(["info", ["ops", "analytics", "safety"].includes(r.use) && !third.length ? "Can fall under the internal-operations exception if it's never used to contact or profile a child. Your notice must say so." : "Contextual ads and frequency capping can count as internal operations. Targeted ads and profiling need consent."]);
  if(r.k === "bio" || r.k === "govid") f.push(["info", "Personal information since the 2025 amendments. Make sure consent, notices, retention and security cover it."]);
  if(r.k === "media" && r.keep === "use") f.push(["info", "If you only use a child's voice to carry out a request and delete it right away, the audio exception may mean you don't need consent for it."]);
  if(r.k === "geo") f.push(["info", "Street-level location needs consent. Coarser location, like a city or region, isn't personal information on its own."]);
  if(r.k === "contact") f.push(["info", "Collecting a parent's contact details only to ask for consent is allowed. Delete them if the parent doesn't respond."]);
  return f;
}
// Starting answers from a pre-mortem
function cpFromPM(src){
  const p = src.p, F = k => (p.features || []).includes(k), M = k => (p.money || []).includes(k), pi = {};
  const add = (k, use, share) => { pi[k] = {on:true, use, share:share || [], keep:""}; };
  add("persist", F("ads") ? "ads" : "ops", F("ads") ? ["ads"] : ["providers"]);
  if(F("signup") || F("login")) add("contact", "ops", ["providers"]);
  if(F("profiles")){ add("name", "feature", F("posts") || F("discovery") ? ["public"] : []); add("user", "feature", ["public"]); }
  if(F("media") || F("live") || F("voice")) add("media", "feature", F("posts") || F("live") || F("groups") ? ["public"] : ["providers"]);
  if(F("location") || F("meetups")) add("geo", "feature", []);
  if(F("dm") || F("groups") || F("posts") || F("ai_chat")) add("other", "feature", F("ai_chat") ? ["providers"] : ["public"]);
  if(M("subs") || M("p2p") || M("payouts")) add("address", "ops", ["providers"]);
  if(p.identity === "verified") add("govid", "safety", ["providers"]);
  const aud = p.youth === "kids" ? "primary" : p.youth === "teens" || p.youth === "adult_self" ? "general" : "adult";
  return {svc:(p.name || "").replace(" (example)", "").replace(" (draft)", ""), aud, pi, know:aud === "general" ? ["reports"] : [], gate:p.youth === "adult_verified" ? "assured" : "",
    fac:p.youth === "kids" ? {subject:true, visual:true} : {}, view:"setup"};
}

/* ---------- drafts ---------- */
const CP_USE_TXT = {ops:"to run the service", feature:"so your child can use the feature it's for", analytics:"to understand and improve how the service works", ads:"for advertising and marketing", safety:"to keep users safe and meet our legal duties"};
const CP_KEEP_TXT = {use:"We delete it as soon as we've used it.", "30d":"We keep it for up to 30 days.", "1y":"We keep it for up to a year.", account:"We keep it while the account is open, then delete it.", none:"[How long we keep it.]", "":"[How long we keep it.]"};
const CP_ASK = {
  card:"Confirm you're an adult with a credit or debit card, or an online payment account, at [link]. The account holder is notified of the check.",
  id:"Upload a photo of a government-issued ID at [link]. We check it, then delete it once we've confirmed your permission.",
  face:"At [link], take a photo of your ID and a quick selfie. We compare them, a trained member of our team confirms the match, then we delete both images.",
  kba:"Answer a few questions at [link] that only an adult in your household should be able to answer.",
  call:"Call us free on [number], or book a short video call at [link]. A trained member of our team will confirm your permission.",
  form:"Print and sign the form at [link], then return it by post to [address], by fax to [number] or as a scan to [email].",
  textplus:"Reply YES to the text message we've sent you. We'll send a second message in [24 hours] to confirm; reply STOP if you didn't give permission.",
  emailplus:"Click “I agree” below. We'll send a confirmation email in [24 hours]; reply to it if you didn't give permission.",
  none:"[How parents give permission, using a method the FTC accepts.]"
};
function cpNoticeMd(){
  const d = cp, x = cpCtx(d), svc = d.svc || "[service name]", L = [];
  const shareTxt = s => ({providers:`Service providers that help us run ${svc}, and may use it only for that`, sdk:"Third-party software in our app or site", ads:"Advertising partners", public:"Other users, when your child chooses to share", sold:"Companies we sell or license it to"})[s];
  L.push(`# We need your permission: ${svc}`, "", "Hello,", "", `Your child would like to use ${svc}. They gave us your email address so we could ask for your permission. We haven't collected any other information from your child, and we won't unless you agree.`, "", "## What we would collect");
  if(x.rows.length) x.rows.forEach(r => L.push(`- **${r.n}**, ${CP_USE_TXT[r.use] || "for [purpose]"}. ${CP_KEEP_TXT[r.keep || ""]}`));
  else L.push("- [Each kind of information we'd collect, why, and how long we keep it.]");
  L.push("", "## Who we would share it with");
  const sh = [...x.shares];
  if(!sh.length) L.push("- No one. We don't share your child's information.");
  sh.forEach(s => L.push(`- **${shareTxt(s)}**: ${cpList(x.rows.filter(r => (r.share || []).includes(s)).map(r => cpLow(r.n)))}.${["sdk", "ads", "sold"].includes(s) ? " [Name each one, and say why.]" : ""}`));
  const third = sh.filter(s => ["sdk", "ads", "sold"].includes(s));
  if(third.length) L.push("", `**You can say yes to ${svc} without saying yes to sharing.** You can agree to us collecting and using your child's information without agreeing to us sharing it with ${cpList(third.map(s => cpLow(shareTxt(s))))}. ${svc} works the same either way.`);
  if(x.public) L.push("", "Some features let your child share with other users. They stay off until you agree.");
  L.push("", "## How to give permission", CP_ASK[d.vpc] || CP_ASK.none, "", "If we don't hear from you within [14] days, we'll delete your email address.", "",
    "## Your choices", "You can see the information we hold about your child, have it deleted, or tell us to stop collecting it, at any time. Contact us at [privacy email], or use [parent dashboard link].", "",
    "Our full children's privacy notice: [link]", "", `${d.svc || "[Company name]"} · [postal address] · [phone] · [email]`);
  return L.join("\n");
}
function cpRetentionMd(){
  const d = cp, x = cpCtx(d), svc = d.svc || "[service name]";
  const L = [`# Children's data retention policy: ${svc}`, "", "**Owner:** [name and role] · **Approved:** [date] · **Next review:** [date, at least once a year]", "",
    "## Purpose", `This policy sets out how long ${svc} keeps personal information collected from children under 13, why, and how it's deleted, as the COPPA Rule requires (16 CFR 312.10). We keep children's personal information only as long as reasonably necessary for the specific purpose we collected it for, and never indefinitely.`, "",
    "## Retention schedule", "", "| Information | Why we collect it | Business need | How long we keep it | How we delete it |", "|---|---|---|---|---|"];
  (x.rows.length ? x.rows : [{n:"[Kind of information]", use:"", keep:""}]).forEach(r => L.push(`| ${r.n} | ${cpLabel(CP_USE, r.use) || "[purpose]"} | [why it's needed for that purpose] | ${r.keep && r.keep !== "none" ? cpLabel(CP_KEEP, r.keep) : "[set a limit]"} | [how it's deleted, including backups and vendors] |`));
  L.push("", "## How deletion works", "- Deletion covers our systems, backups and every service provider or third party that received the data. [How long backups take to expire.]",
    "- If a parent doesn't respond to a consent request within [14] days, we delete their contact details.",
    "- When a parent asks us to delete their child's information, we do it within [number] days and confirm when it's done.",
    "- We delete in a way that protects against unauthorized access or use.", "",
    "## Publishing and review", `This policy, or a summary of it, is published in the ${svc} children's privacy notice. [Owner] reviews it at least once a year, and whenever we add a new kind of data or a new purpose.`);
  return L.join("\n");
}
function cpSecurityMd(){
  const d = cp, x = cpCtx(d), svc = d.svc || "[service name]", recips = [...x.shares].filter(s => s !== "public");
  return [`# Children's information security program: ${svc}`, "", `A written program, as the COPPA Rule requires (16 CFR 312.8). Scale each part to your size, how sensitive the data is and how complex ${svc} is.`, "",
    "## 1. Who coordinates it", "- Program coordinator: [name and role]", "- Backup: [name and role]", "- Executive sponsor: [name]", "",
    "## 2. Risk assessment, at least once a year", `- Children's data covered: ${x.rows.length ? cpList(x.rows.map(r => cpLow(r.n))) : "[kinds of data]"}`, "- Where it's stored and who can reach it: [systems, teams and vendors]", "- Main risks: [for example staff access, account takeover, vendor breaches, misconfiguration]", "- Last assessment: [date] · Next: [date]", "",
    "## 3. Safeguards", "- Access limited to people who need it, with logging and regular reviews", "- Encryption in transit and at rest", "- Only the data we need, deleted on the schedule in our retention policy", "- A security review for new features that touch children's data", "- [Other safeguards]", "",
    "## 4. Testing and monitoring", "- [Access reviews, vulnerability scans, penetration tests, alerting] · How often: [ ]", "",
    "## 5. Yearly review", "- Review the program at least once a year, and after any major change to the service or a security incident. Record what changed and why.", "",
    "## 6. Service providers and third parties", recips.length ? `- Receive children's data: ${cpList(recips.map(s => cpLow(cpLabel(CP_SHARE, s))))}. [Name each one.]` : "- [Any vendor that receives children's data.]",
    "- Before sharing, confirm each one can keep the data confidential and secure, and get written assurances that it will.", "- [Contract terms: confidentiality, security, limits on use, deletion, breach notice]", "",
    "## 7. Incidents", "- [How incidents involving children's data are reported, investigated and, where the law requires, notified]"].join("\n");
}
function cpMemoMd(){
  const d = cp, x = cpCtx(d), ap = cpApplies(d), s = cpScore(d, x, ap), svc = d.svc || "[service name]";
  const fac = CP_FACTORS.filter(f => d.fac[f[0]]).map(f => f[1]), know = CP_KNOW.filter(k => d.know.includes(k[0])).map(k => k[1]);
  const L = [`# COPPA readiness: ${svc}`, "", `_Prepared ${new Date().toISOString().slice(0, 10)} with T&S Workbench, for review by counsel. Not legal advice._`, "",
    "## Summary", `**${ap.h}.** ${ap.t}`, "", s.total ? `${s.met} of ${s.total} requirements are in place (${s.pct}%), with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}.` : "No requirements apply to the answers given.", "",
    "## Who the service is for", `- Audience: ${cpLabel(CP_AUD, d.aud) || "not answered"}`, `- Signs of a child audience: ${fac.length ? fac.join("; ") : "none identified"}`,
    `- How we learn a user is under 13: ${know.length ? know.join("; ") : "no process identified"}`, `- Age question: ${d.aud === "primary" ? "not relevant, because every user is treated as a child" : cpLabel(CP_GATE, d.gate) || "not answered"}`, `- Parental consent method: ${cpLabel(CP_VPC, d.vpc) || "not answered"}`, "",
    "## Children's data", "", "| Information | Used for | Shared with | Kept for |", "|---|---|---|---|"];
  if(x.rows.length) x.rows.forEach(r => L.push(`| ${r.n} | ${cpLabel(CP_USE, r.use)} | ${(r.share || []).length ? r.share.map(v => cpLabel(CP_SHARE, v)).join(", ") : "No one"} | ${cpLabel(CP_KEEP, r.keep) || "Not set"} |`));
  else L.push("| None identified | | | |");
  L.push("", "## Gaps, most urgent first", "");
  if(!s.gaps.length) L.push("No gaps for the answers given.");
  s.gaps.forEach((r, i) => L.push(`${i + 1}. **${r.t}** (${CP_SEVN[r.sev][0]}; 16 CFR ${r.cite}${r.isNew ? "; added in 2025" : ""}; owner: ${CP_OWNERS[r.o]}). ${cpWhy(r, x)} To fix: ${r.fix}`));
  const q = [];
  const third = [...x.shares].filter(v => ["sdk", "ads", "sold"].includes(v));
  if(third.length) q.push(`Is any of our sharing with ${cpList(third.map(v => cpLow(cpLabel(CP_SHARE, v))))} integral to the service, so it doesn't need a separate consent?`);
  if(d.aud === "general" || d.aud === "adult") q.push(fac.length ? `Given ${fac.length} sign${fac.length === 1 ? "" : "s"} of a child audience, could the FTC treat us as a mixed-audience service?` : "Is our process for acting on actual knowledge of users under 13 enough?");
  if(x.has("persist")) q.push("Does the internal-operations exception cover our use of persistent identifiers, and does our notice describe it as the amended Rule requires?");
  if(x.has("media")) q.push("Does the audio exception cover any of our voice features?");
  q.push("Should we join an FTC-approved safe harbor program?");
  if(d.aud !== "adult") q.push("Do state laws that protect teens, such as New York's Child Data Protection Act or California's rules on selling minors' data, add duties for users aged 13 to 17?");
  q.push("If we have users outside the US, how do the GDPR's age of digital consent and the UK Children's Code apply?");
  L.push("", "## Questions for counsel", ...q.map(v => "- " + v));
  const cases = [...new Set(s.gaps.map(r => r.kase).filter(Boolean))];
  if(cases.length) L.push("", "## Enforcement to know", ...cases.map(v => "- " + v));
  L.push("", "## Sources", ...CP_SRC.map(([n, u]) => `- ${n}: ${u}`), "", `Civil penalties can run to $53,088 per violation (the FTC's 2025 inflation-adjusted maximum, 16 CFR 1.98), adjusted for inflation each year. Requirements checked in ${CP_REVIEWED}.`);
  return L.join("\n");
}
const CP_DRAFTS = [["notice", "Notice to parents", "notice-to-parents"], ["retention", "Retention policy", "data-retention-policy"], ["security", "Security program", "security-program"], ["memo", "Memo for Legal", "coppa-memo"]];
const cpDraftMd = k => k === "retention" ? cpRetentionMd() : k === "security" ? cpSecurityMd() : k === "memo" ? cpMemoMd() : cpNoticeMd();
// Just enough Markdown to show a draft as it would read: headings, lists, tables, bold, italics and [placeholders]
function cpMd(md){
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\s)_(.+?)_(?=\s|$)/g, "$1<i>$2</i>").replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
  const out = []; let list = null, table = null;
  const flush = () => {
    if(list){ out.push(`<${list.t}>${list.items.map(i => `<li>${i}</li>`).join("")}</${list.t}>`); list = null; }
    if(table){ out.push(`<div class="cp-tw"><table><thead><tr>${table[0].map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${table.slice(1).map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`); table = null; }
  };
  md.split("\n").forEach(l => {
    let m;
    if(/^\|/.test(l)){ if(/^\|[-| ]+\|$/.test(l)) return; if(list) flush(); (table = table || []).push(l.replace(/^\||\|$/g, "").split("|").map(c => c.trim())); return; }
    if(table) flush();
    if((m = l.match(/^(#{1,3}) (.*)$/))){ flush(); out.push(`<h${m[1].length + 2}>${inline(m[2])}</h${m[1].length + 2}>`); return; }
    if((m = l.match(/^- (.*)$/))){ if(!list || list.t !== "ul"){ flush(); list = {t:"ul", items:[]}; } list.items.push(inline(m[1])); return; }
    if((m = l.match(/^\d+\. (.*)$/))){ if(!list || list.t !== "ol"){ flush(); list = {t:"ol", items:[]}; } list.items.push(inline(m[1])); return; }
    flush(); if(l.trim()) out.push(`<p>${inline(l)}</p>`);
  });
  flush();
  return out.join("");
}

/* ---------- page ---------- */
/* ---------- Guided: one question per screen, then the plan ---------- */
let cpView = null;
const CP_NEW_TAG = `<span class="cp-new" title="Added by the FTC's 2025 amendments">New</span>`;
// One kind of personal information: whether you collect it, and if so why, who gets it and how long you keep it
function cpPiRow([k, n, h, isNew]){
  const r = cp.pi[k] || {}, on = !!r.on;
  return `<div class="cp-row ${on ? "on" : ""}"><label class="tr-chk"><input type="checkbox" data-cppi="${k}" ${on ? "checked" : ""}><span><b>${esc(n)}</b>${isNew ? CP_NEW_TAG : ""}${h ? `<small>${esc(h)}</small>` : ""}</span></label>
    ${on ? `<div class="cp-row-d">
      <div class="field"><label for="cp-use-${k}">Mainly used for</label><select class="select" id="cp-use-${k}" data-cpuse="${k}">${CP_USE.map(([v, t]) => `<option value="${v}" ${(r.use || "feature") === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <div class="field"><span class="lbl">Shared with</span><div class="cp-chips">${CP_SHARE.map(([v, t, tip]) => `<button type="button" class="pol-chip" data-cpshare="${k}" data-v="${v}" aria-pressed="${(r.share || []).includes(v)}" ${tip ? `title="${esc(tip)}"` : ""}>${t}</button>`).join("")}</div></div>
      <div class="field"><label for="cp-keep-${k}">Kept for</label><select class="select" id="cp-keep-${k}" data-cpkeep="${k}"><option value="">Choose</option>${CP_KEEP.map(([v, t]) => `<option value="${v}" ${r.keep === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
    </div>${cpRowFlags(Object.assign({k, share:[], keep:"", use:"feature"}, r)).map(f => `<p class="cp-flag ${f[0]}">${esc(f[1])}</p>`).join("")}` : ""}</div>`;
}
// A preview of the finished example report (Brightbeam), built by swapping in the example data,
// calling the real report renderer, then restoring whatever the visitor had in progress
function cpPreviewHTML(){
  const saved = cp;
  try{
    cp = Object.assign(CP_BLANK(), JSON.parse(JSON.stringify(CP_EXAMPLE)));
    const x = cpCtx(cp), ap = cpApplies(cp), s = cpScore(cp, x, ap);
    return cpReportHTML(x, ap, s);
  }catch(e){ return ""; }
  finally{ cp = saved; }
}
function cpSpec(){
  const X = () => cpCtx(cp), AP = () => cpApplies(cp);
  const notPrimary = () => !!cp.aud && cp.aud !== "primary", live = () => { const ap = AP(); return !!ap.lvl && ap.lvl !== "watch"; };
  const setV = (k, v) => { cp[k] = v; cp.ex = false; cpSave(); };
  const steps = [
    {id:"svc", eb:"Your service", title:"What's the service or product called?", why:"It's named in your plan and in the drafts for parents and for Legal.", kind:"text", opt:true, placeholder:"For example: Brightbeam", max:80, get:() => cp.svc, set:v => setV("svc", v.slice(0, 80))},
    {id:"aud", eb:"Who it's for", title:"Who is the service for?", why:"This one decision changes everything else the tool asks: it decides whether COPPA applies to every user, to users under 13, or only to the children you know about.", kind:"single",
      opts:() => CP_AUD.map(([k, n, h]) => ({k, n, h})), get:() => cp.aud, set:k => setV("aud", k)},
    {id:"fac", eb:"Signs of a child audience", title:"Which of these are true of the service?", why:"Even a service built for teens and adults can count as aimed at children if enough of these are true. The FTC weighs them together, and three or more is a warning sign.", kind:"multi", opt:true, none:"None of these", skip:() => !notPrimary(),
      opts:() => CP_FACTORS.map(([k, t, nw]) => ({k, n:t, tag:nw ? CP_NEW_TAG : ""})), get:() => Object.keys(cp.fac || {}).filter(k => cp.fac[k]),
      toggle:k => { const f = Object.assign({}, cp.fac); if(f[k]) delete f[k]; else f[k] = true; setV("fac", f); }, clear:() => setV("fac", {})},
    {id:"know", eb:"Knowing ages", title:"How could you learn that a user is under 13?", why:"Once you know a particular user is a child, COPPA applies to them even on a general-audience service.", kind:"multi", opt:true, none:"No way to know", skip:() => !notPrimary(),
      opts:() => CP_KNOW.map(([k, t]) => ({k, n:t})), get:() => cp.know, toggle:k => setV("know", cp.know.includes(k) ? cp.know.filter(v => v !== k) : cp.know.concat(k)), clear:() => setV("know", [])},
    {id:"gate", eb:"Asking for age", title:"How do you ask for age?", why:"A neutral question protects you. One with a default or a hint doesn't.", kind:"single", skip:() => !notPrimary(),
      opts:() => CP_GATE.map(([k, n, h]) => ({k, n, h})), get:() => cp.gate, set:k => setV("gate", k)},
    {id:"data", eb:"Children's data", title:"What personal information do you collect from children?", why:"Tick each kind you collect, then say what it's for, who gets it and how long you keep it. Include what third-party SDKs collect through your app or site: under COPPA, that counts as yours.", kind:"custom", opt:true, skip:() => !cp.aud,
      html:() => `<div class="cp-pi gd-pi">${CP_PI.map(cpPiRow).join("")}</div>`, next:"Continue"},
    {id:"vpc", eb:"Parental consent", title:"How do parents give consent?", why:"The FTC accepts specific methods. Knowledge-based questions, a photo ID with a face match, and text plus were added in 2025.", kind:"single", skip:() => !(live() && X().needsConsent),
      opts:() => { const x = X(); return CP_VPC.map(([k, n, h, sh, nw]) => { const bad = x.disclose && !sh, cost = CP_VPC_COST[k];
        return {k, n, h:bad ? h + " You share children's data, so this method isn't allowed." : h, off:bad, offMsg:"You share children's data, so this method isn't allowed",
          tag:(nw ? CP_NEW_TAG : "") + (cost ? `<span class="cp-cost">${esc(cost)}</span>` : "")}; }); },
      get:() => cp.vpc, set:k => setV("vpc", k)}
  ].concat(CP_CTRL.map(g => ({id:"ctrl-" + g.k, eb:g.n, title:`${esc(g.n)}: what do you have in place today?`, why:g.h ? esc(g.h) + " Tick what's true today." : "Tick what's true today.", kind:"multi", opt:true, none:"None of these yet",
    skip:() => { const x = X(), ap = AP(); return !ap.lvl || !g.items.some(it => cpItemOn(it, cp, x, ap)); },
    opts:() => { const x = X(), ap = AP(); return g.items.filter(it => cpItemOn(it, cp, x, ap)).map(it => ({k:it.k, n:it.t, h:it.opt ? "Optional" : "", tag:it.isNew ? CP_NEW_TAG : ""})); },
    get:() => Object.keys(cp.ctrl || {}).filter(k => cp.ctrl[k]), toggle:k => { const c = Object.assign({}, cp.ctrl); if(c[k]) delete c[k]; else c[k] = true; setV("ctrl", c); },
    clear:() => { const c = Object.assign({}, cp.ctrl); g.items.forEach(it => delete c[it.k]); setV("ctrl", c); }})));
  const src = typeof loopSource === "function" ? loopSource() : null;
  return {k:"coppa", tool:{name:"COPPA readiness", icon:"coppa", color:"var(--t-cp)"},
    intro:{title:"Does COPPA apply to you, and are you ready for it?", lead:"A few plain questions about who your service is for and what you collect. Then you'll see which parts of the amended Rule apply, where the gaps are, and get four drafts to edit: a notice to parents, a retention policy, a security program and a memo for Legal. Getting this right matters: civil penalties can run to $53,088 per violation (the FTC's 2025 inflation-adjusted maximum, 16 CFR 1.98), and each child can count separately.",
      facts:[["About 6 minutes", "One question at a time. Only the questions that apply to your answers."], ["The 2025 amendments", "Checked against the Rule as amended, with the new parts marked."], ["Not legal advice", "A starting point for your conversation with counsel."]], start:"Start"},
    alt:[{n:"Answer everything on one page", run:() => { cpView = "page"; renderCoppa(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }}]
      .concat(src ? [{n:"Start from your pre-mortem", run:() => cpAct("frompm")}] : []).concat([{n:"See a finished example", run:() => cpAct("example")}]),
    steps, finish:"Build my plan",
    preview:cpPreviewHTML,
    done:() => { cp.view = "report"; cp.tab = "plan"; cpSave(); renderCoppa(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }};
}
function renderCoppa(){
  const x = cpCtx(cp), ap = cpApplies(cp), s = cpScore(cp, x, ap), report = (cp.view === "report" && !!cp.aud) || cp.ex;
  if(!report && cpView !== "page") return gdRender(cpSpec());
  gdCur = null;
  view.innerHTML = (report
    ? headCompact("COPPA readiness", `${esc(cp.svc || "Your service")} · ${esc(ap.h)}`,
        reportHeaderActions({
          edit:{attrs:'data-cp="edit"', label:EDIT_ANSWERS_LABEL},
          save:{attrs:'data-cp="save"', label:wsSaveLabel("coppa", cp), icon:"save"},
          download:{attrs:'data-cp="memo"', label:"Memo for Legal", icon:"download"},
          tracker:s.gaps.length ? {attrs:'data-cp="tasks"', label:SEND_TRACKER_LABEL, icon:"send"} : null
        }, `<button type="button" class="btn sm" data-cp="sharelink">${COPY_LINK_LABEL}</button>`))
    : head("COPPA readiness", "Find out whether the US Children's Online Privacy Protection Act applies to you, map the children's data you handle, and close the gaps against the amended Rule, with drafts ready to edit.", "Build safely",
        `<span class="toast" id="cp-toast" role="status" aria-live="polite"></span><button type="button" class="btn sm" data-cp="example">${SEE_EXAMPLE_LABEL}</button>${cp.aud ? `<button type="button" class="btn sm" data-cp="reset">${START_OVER_LABEL}</button>` : ""}${typeof loopSource === "function" && loopSource() ? `<button type="button" class="btn sm" data-cp="frompm">Start from your pre-mortem</button>` : ""}`))
    + `<div class="cp-root">${report ? cpReportHTML(x, ap, s) : cpSetupHTML(x, ap, s)}</div>`;
}
function cpSetupHTML(x, ap, s){
  const newTag = `<span class="cp-new" title="Added by the FTC's 2025 amendments">New</span>`;
  const chk = (grp, k, label, isNew, sub) => `<label class="tr-chk"><input type="checkbox" data-cpset="${grp}" value="${k}" ${(grp === "know" ? cp.know.includes(k) : cp[grp][k]) ? "checked" : ""}><span>${esc(label)}${isNew ? newTag : ""}${sub ? `<small>${esc(sub)}</small>` : ""}</span></label>`;
  const tile = (attr, cur, k, n, h, extra, note) => `<button type="button" role="radio" aria-checked="${cur === k}" class="card tr-tier ${cur === k ? "on" : ""} ${extra || ""}" data-${attr}="${k}"><b>${esc(n)}${note || ""}</b>${h ? `<span>${esc(h)}</span>` : ""}</button>`;
  const sec = (n, id, title, tag, body, tip) => `<section class="card pol-card" id="${id}"><div class="pol-h"><span class="pol-num">${n}</span><div><span class="pol-lbl">${title}</span>${tag ? `<span class="note">${tag}</span>` : ""}</div></div>${tip ? `<p class="pol-tip cp-tip">${tip}</p>` : ""}${body}</section>`;
  const piRow = cpPiRow; const _unused = ([k, n, h, isNew]) => { const r = cp.pi[k] || {}, on = !!r.on;
    return `<div class="cp-row ${on ? "on" : ""}"><label class="tr-chk"><input type="checkbox" data-cppi="${k}" ${on ? "checked" : ""}><span><b>${esc(n)}</b>${isNew ? newTag : ""}${h ? `<small>${esc(h)}</small>` : ""}</span></label>
      ${on ? `<div class="cp-row-d">
        <div class="field"><label for="cp-use-${k}">Mainly used for</label><select class="select" id="cp-use-${k}" data-cpuse="${k}">${CP_USE.map(([v, t]) => `<option value="${v}" ${(r.use || "feature") === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="field"><span class="lbl">Shared with</span><div class="cp-chips">${CP_SHARE.map(([v, t, tip]) => `<button type="button" class="pol-chip" data-cpshare="${k}" data-v="${v}" aria-pressed="${(r.share || []).includes(v)}" ${tip ? `title="${esc(tip)}"` : ""}>${t}</button>`).join("")}</div></div>
        <div class="field"><label for="cp-keep-${k}">Kept for</label><select class="select" id="cp-keep-${k}" data-cpkeep="${k}"><option value="">Choose</option>${CP_KEEP.map(([v, t]) => `<option value="${v}" ${r.keep === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      </div>${cpRowFlags(Object.assign({k, share:[], keep:"", use:"feature"}, r)).map(f => `<p class="cp-flag ${f[0]}">${esc(f[1])}</p>`).join("")}` : ""}</div>`; };
  const notPrimary = !!cp.aud && cp.aud !== "primary", live = !!ap.lvl && ap.lvl !== "watch";
  let n = 1, out = `<div class="banner cvt-b"><span><strong>Prefer one question at a time?</strong> The guided version asks the same things, and only what applies to your answers.</span><button type="button" class="btn sm" data-cp="guide">Switch to guided</button></div>`;
  out += sec(n++, "cp-s-svc", "Your service", "", `<div class="field"><label for="cp-svc">Service or product name</label><input class="input" id="cp-svc" value="${esc(cp.svc)}" placeholder="For example: Brightbeam" maxlength="80" autocomplete="off"></div>
    <div class="field"><span class="lbl">Who is it for?</span><p class="note cp-aud-note">This one decision changes everything else the tool asks.</p><div class="tr-tiers cp-aud" role="radiogroup" aria-label="Who it's for">${CP_AUD.map(([k, nm, h]) => tile("cpaud", cp.aud, k, nm, h)).join("")}</div></div>
    ${cp.aud ? `<div class="banner cp-ap ${ap.tone}"><span><strong>${esc(ap.h)}.</strong> ${esc(ap.t)}</span></div>` : ""}`);
  if(notPrimary){
    out += sec(n++, "cp-s-fac", "Signs of a child audience", "The FTC weighs these together", `<div class="cp-checks">${CP_FACTORS.map(([k, t, nw]) => chk("fac", k, t, nw)).join("")}</div>`,
      "Even a service built for teens and adults can count as aimed at children if enough of these are true. Three or more is a warning sign.");
    out += sec(n++, "cp-s-know", "Knowing a user's age", "", `<div class="field"><span class="lbl">How could you learn that a user is under 13?</span><div class="cp-checks">${CP_KNOW.map(([k, t]) => chk("know", k, t)).join("")}</div></div>
      <div class="field"><span class="lbl">How do you ask for age?</span><div class="tr-tiers cp-two" role="radiogroup" aria-label="Age question">${CP_GATE.map(([k, nm, h]) => tile("cpgate", cp.gate, k, nm, h)).join("")}</div></div>`);
  }
  if(cp.aud) out += sec(n++, "cp-s-data", "Children's data you collect", `${x.rows.length} selected`, `<div class="cp-pi">${CP_PI.map(piRow).join("")}</div>`,
    "Include what third-party SDKs collect through your app or site. Under COPPA, what they collect through your service counts as yours.");
  if(live && x.needsConsent) out += sec(n++, "cp-s-vpc", "How parents give consent", "", `<div class="tr-tiers cp-two" role="radiogroup" aria-label="Consent method">${CP_VPC.map(([k, nm, h, sh, nw]) => { const bad = x.disclose && !sh, cost = CP_VPC_COST[k];
      return tile("cpvpc", cp.vpc, k, nm, bad ? h + " You share children's data, so this method isn't allowed." : h, bad ? "off" : "", (nw ? newTag : "") + (cost ? `<span class="cp-cost">${esc(cost)}</span>` : "")); }).join("")}</div>`,
    "The FTC accepts specific methods. Knowledge-based questions, a photo ID with a face match, and text plus were added in 2025.");
  if(ap.lvl){ const grps = CP_CTRL.map(g => ({g, its:g.items.filter(it => cpItemOn(it, cp, x, ap))})).filter(z => z.its.length);
    if(grps.length) out += sec(n++, "cp-s-ctrl", "What you have in place", "Tick what's true today", `<div class="cp-grps">${grps.map(({g, its}) => `<div class="cp-grp"><h4>${esc(g.n)}</h4>${g.h ? `<p class="note">${esc(g.h)}</p>` : ""}${its.map(it => chk("ctrl", it.k, it.t, it.isNew, it.opt ? "Optional" : "")).join("")}</div>`).join("")}</div>`); }
  const tone = s.crit ? "crit" : s.pct >= 80 ? "good" : "high";
  out += `<div class="card pol-runbar">
      <div class="pol-rb-meter"><div class="pol-rb-top"><span class="eyebrow">Readiness</span>${s.total ? `<span class="pill ${tone}">${s.met} of ${s.total}</span>` : ""}</div>
        <div class="pol-meter" role="meter" aria-valuemin="0" aria-valuemax="${s.total || 1}" aria-valuenow="${s.met}" aria-label="Readiness"><i style="width:${s.pct}%;background:var(--${tone})"></i></div>
        <span class="note">${!cp.aud ? "Choose who your service is for to start." : s.crit ? `${s.crit} critical gap${s.crit === 1 ? "" : "s"} so far.` : s.total ? "No critical gaps so far." : "Nothing to check yet."}</span></div>
      <div class="pol-rb-act"><button type="button" class="btn primary" data-cp="build" ${cp.aud ? "" : "disabled"}>Build my plan ${icon("arrow")}</button></div></div>
    <p class="note pol-rb-note">Everything stays in your browser. Checked against the COPPA Rule as amended in 2025, in ${CP_REVIEWED}. Not legal advice.</p>`;
  return `<div class="pol-setup cp-setup">${out}</div>`;
}
function cpReportHTML(x, ap, s){
  const tab = ["plan", "map", "drafts", "reqs"].includes(cp.tab) ? cp.tab : "plan", tone = s.crit ? "crit" : s.pct >= 80 ? "good" : "high";
  const sentence = `${esc(ap.h)}. ${s.pct}% ready${s.crit ? `, with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}` : s.total ? ", no critical gaps" : ""}.`;
  const actions = s.gaps.slice(0, 3).map(r => ({t:r.t, sub:r.fix}));
  const bench = cpBenchPct();
  return `<div class="pol-report cp-report">
    ${cp.shared ? shareBannerHTML('data-cp="unshare"') : ""}
    ${cp.ex ? `<div class="banner"><span><strong>This is an example:</strong> Brightbeam, a learning app for young children, partway to compliance. Start over to check your own service.</span><button type="button" class="btn sm" data-cp="reset">Start over</button></div>` : ""}
    <div class="card pol-sum tr-sum"><div class="tr-ring cp-ring ${tone}"><b>${s.pct}%</b><span>ready</span></div>
      <div><span class="eyebrow">${esc(cpLabel(CP_AUD, cp.aud))}</span><div class="verdict-row" aria-live="polite"><h2 class="pol-verdict">${sentence}</h2>${gradeBadge(s.pct, "Share of applicable COPPA requirements in place")}</div><p class="note">${esc(ap.t)}</p>
      ${bench !== null && !cp.ex ? `<p class="bench-line">Typical for a children's product like the built-in example: ${bench}% ready</p>` : ""}
        <div class="cp-kpis"><span class="pill ${s.crit ? "crit" : "good"}">${s.crit} critical gap${s.crit === 1 ? "" : "s"}</span><span class="pill">${s.met} of ${s.total} requirements in place</span><span class="pill">${x.rows.length} kind${x.rows.length === 1 ? "" : "s"} of children's data</span>${x.disclose ? `<span class="pill high">Shared with third parties</span>` : ""}</div>
        <span class="toast" id="cp-toast" role="status" aria-live="polite"></span></div></div>
    ${actions.length ? `<ol class="pk-list gd-vacts">${actions.map(a => `<li><b>${esc(a.t)}.</b> ${esc(a.sub)}</li>`).join("")}</ol>` : ""}
    ${chapterLinkHTML("coppa")}
    <details class="ev-details"><summary>Details <span class="note">Your plan, data map, drafts and requirements</span></summary>
    <div class="card pol-tabs"><div class="card-h"><div class="segs" role="group" aria-label="Report sections">${[["plan", "Your plan", s.gaps.length], ["map", "Data map", x.rows.length], ["drafts", "Drafts", CP_DRAFTS.length], ["reqs", "Requirements", s.total]].map(([k, nm, c]) => `<button type="button" data-cptab="${k}" aria-pressed="${tab === k}">${nm} <span class="mono" style="opacity:.6">${c}</span></button>`).join("")}</div></div>
      <div class="card-b">${tab === "map" ? cpMapHTML(x) : tab === "drafts" ? cpDraftsHTML() : tab === "reqs" ? cpReqsHTML(x, s) : cpPlanHTML(x, s)}</div></div>
    </details>
    <p class="note">Checked against the COPPA Rule as amended in 2025, in ${CP_REVIEWED}. Civil penalties can run to $53,088 per violation (the FTC's 2025 inflation-adjusted maximum, 16 CFR 1.98). A starting point for your legal team, not legal advice.</p>
  </div>`;
}
function cpPlanHTML(x, s){
  if(!s.gaps.length) return `<div class="card ma-none"><b>${s.total ? "Everything that applies to your answers is in place." : "Nothing applies to your answers yet."}</b><p class="note">${s.total ? "Recheck whenever you add a feature, a kind of data or a new partner. The drafts are ready if you need them." : "Mark the children's data you collect to see what applies."}</p></div>`;
  return `<div class="pol-sec-h"><p class="note">Most urgent first. Each gap names the part of the Rule, who usually owns it and what to do.</p></div>
    <div class="cp-gaps">${s.gaps.map((r, i) => `<article class="cp-gap"><span class="cv-gn mono">${i + 1}</span><div class="cp-gb">
      <span class="eyebrow">${esc((CP_CTRL.find(g => g.k === r.g) || {n:""}).n)}</span><h4>${esc(r.t)} ${pill(CP_SEVN[r.sev][1], CP_SEVN[r.sev][0])}${r.isNew ? `<span class="cp-new">New in 2025</span>` : ""}</h4>
      <p>${esc(cpWhy(r, x))}</p><p class="cp-fix"><b>What to do.</b> ${esc(r.fix)}</p>
      ${r.kase ? `<p class="cp-case">${esc(r.kase)}</p>` : ""}
      <div class="cp-gm"><span class="tag">${esc(CP_OWNERS[r.o])}</span><span class="tag mono">${esc(r.cite)}</span>${CP_CTRL.some(g => g.items.some(it => it.k === r.k)) ? `<button type="button" class="pol-add" data-cpfix="${r.k}">Mark as done</button>` : ""}</div></div></article>`).join("")}</div>`;
}
function cpMapHTML(x){
  if(!x.rows.length) return `<p class="note">You haven't marked any children's data yet. <button type="button" class="pol-add" data-cp="edit">Map your data</button></p>`;
  return `<div class="cp-mapw"><table class="cp-map"><thead><tr><th>Information</th><th>Used for</th><th>Shared with</th><th>Kept for</th></tr></thead><tbody>${x.rows.map(r => `<tr><td><b>${esc(r.n)}</b>${cpRowFlags(r).map(f => `<small class="${f[0]}">${esc(f[1])}</small>`).join("")}</td><td>${esc(cpLabel(CP_USE, r.use))}</td><td>${(r.share || []).length ? r.share.map(v => esc(cpLabel(CP_SHARE, v))).join(", ") : "No one"}</td><td>${esc(cpLabel(CP_KEEP, r.keep) || "Not set")}</td></tr>`).join("")}</tbody></table></div>`;
}
function cpDraftsHTML(){
  const k = CP_DRAFTS.some(z => z[0] === cp.draft) ? cp.draft : "notice";
  const intro = {notice:"The notice a parent gets before you collect anything, filled in from your data map and consent method.", retention:"The written policy the amended Rule requires, with a row for each kind of data you collect.", security:"An outline of the written security program the amended Rule requires.", memo:"A summary for counsel: whether COPPA applies, your data, the gaps and the questions to settle."}[k];
  return `<div class="segs cp-dtabs" role="group" aria-label="Drafts">${CP_DRAFTS.map(([v, nm]) => `<button type="button" data-cpdraft="${v}" aria-pressed="${v === k}">${nm}</button>`).join("")}</div>
    <p class="note cp-dnote">${intro} Text in brackets is for you to fill in.</p>
    <div class="cp-draft">${cpMd(cpDraftMd(k))}</div>
    <div class="cp-dact"><button type="button" class="btn sm" data-cp="copyd">${icon("copy")}Copy</button>${DL ? `<button type="button" class="btn sm primary" data-cp="dld"><svg><use href="#i-download"/></svg>Download</button>` : ""}<span class="toast" id="cp-dtoast" role="status" aria-live="polite"></span></div>`;
}
function cpReqsHTML(x, s){
  if(!s.reqs.length) return `<p class="note">Choose who your service is for, and mark the children's data you collect, to see which requirements apply.</p>`;
  return CP_CTRL.map(g => ({g, rs:s.reqs.filter(r => r.g === g.k)})).filter(z => z.rs.length).map(({g, rs}) => `<section class="cp-rq"><h4>${esc(g.n)} <span class="note">${rs.filter(r => r.met).length} of ${rs.length}</span></h4>
      <ul class="tr-check">${rs.map(r => `<li class="${r.met ? "ok" : r.opt ? "na" : "miss"}"><span class="tr-st">${r.met ? "✓" : "○"}</span><div><b>${esc(r.t)}</b>${r.isNew ? `<span class="cp-new">New in 2025</span>` : ""}${r.opt ? ` <span class="note">Optional</span>` : ""} <span class="note mono">${esc(r.cite)}</span><p>${esc(cpWhy(r, x))}</p></div></li>`).join("")}</ul></section>`).join("")
    + `<p class="note">Sources: ${CP_SRC.map(([nm, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(nm)}</a>`).join("; ")}. Checked in ${CP_REVIEWED}. Not legal advice.</p>`;
}

/* ---------- tracker tasks ---------- */
function tkFromCoppa(){
  const x = cpCtx(cp), s = cpScore(cp, x, cpApplies(cp));
  return s.gaps.map((r, i) => ({id:"cp-" + r.k, title:r.t, group:CP_SEVN[r.sev][0] === "Critical" ? "Critical" : CP_SEVN[r.sev][0] + " priority", owner:CP_OWNERS[r.o], pr:CP_SEV[r.sev] + 1, done:false, def:r.sev !== "med" || i < 12,
    labels:["trust-and-safety", "coppa", "privacy"].concat(r.isNew ? ["coppa-2025"] : []),
    desc:[r.t, "", cpWhy(r, x), "", "What to do: " + r.fix, `Rule: 16 CFR ${r.cite}${r.isNew ? ", added by the 2025 amendments" : ""}. Owner: ${CP_OWNERS[r.o]}.`, r.kase ? "Enforcement: " + r.kase : null, "",
      `From a COPPA readiness check for ${cp.svc || "your service"}, made with T&S Workbench. Not legal advice.`].filter(v => v !== null).join("\n")}));
}

/* ---------- events ---------- */
function cpRerender(sel){ cp.ex = false; cpSave(); const y = window.scrollY; renderCoppa(); window.scrollTo(0, y); const el = sel && document.querySelector(sel); if(el) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
function cpAct(a){
  switch(a){
    case "example": cp = Object.assign(CP_BLANK(), JSON.parse(JSON.stringify(CP_EXAMPLE))); gdReset("coppa"); cpView = null; store.set("ws:cur:coppa", null); cpSave(); renderCoppa(); window.scrollTo(0, 0); return gsay("Example loaded: Brightbeam, a learning app for young children");
    case "frompm": { const src = loopSource(); if(!src) return; cp = Object.assign(CP_BLANK(), cpFromPM(src)); gdReset("coppa"); cpView = "page"; store.set("ws:cur:coppa", null); cpSave(); renderCoppa(); window.scrollTo(0, 0); return gsay("Filled in from " + src.name + ". Check each answer"); }
    case "reset": { const snap = JSON.parse(JSON.stringify(cp)); cp = CP_BLANK(); gdReset("coppa"); cpView = null; store.set("ws:cur:coppa", null); cpSave(); renderCoppa(); window.scrollTo(0, 0); withUndo("Cleared", snap, s2 => { cp = s2; cpSave(); renderCoppa(); }); return focusQuiet(document.querySelector("#view h1")); }
    case "sharelink": return shareCopy("coppa", cp, {svc:cp.svc, aud:cp.aud, pct:s.pct, crit:s.crit}, $("#cp-toast"));
    case "unshare": cp.shared = false; cpSave(); return cpAct("save");
    case "build": cp.view = "report"; cp.tab = "plan"; cpSave(); renderCoppa(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "guide": cpView = null; gdReset("coppa"); renderCoppa(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "edit": cp.view = "setup"; cpView = "page"; cpSave(); renderCoppa(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "save": { const msg = wsSaveTool("coppa", cp, cpTitle(cp)); renderCoppa(); return flashIn($("#cp-toast"), msg); }
    case "tasks": return tkOpen("coppa");
    case "memo": { const md = cpMemoMd(); return offerFile(`coppa-memo-${slug(cp.svc || "service")}.md`, md, md, $("#cp-toast")); }
    case "copyd": return copyText(cpDraftMd(cp.draft || "notice"), $("#cp-dtoast"));
    case "dld": { const d = CP_DRAFTS.find(z => z[0] === (cp.draft || "notice")) || CP_DRAFTS[0], md = cpDraftMd(d[0]); return offerFile(`${d[2]}-${slug(cp.svc || "service")}.md`, md, md, $("#cp-dtoast")); }
  }
}
const cpHere = () => (location.hash || "").slice(1).split("/")[0] === "coppa";
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-cp],[data-cpaud],[data-cpgate],[data-cpvpc],[data-cptab],[data-cpdraft],[data-cpshare],[data-cpfix]");
  if(!b || !cpHere() || !view.contains(b)) return;
  const d = b.dataset;
  if(d.cpaud) { cp.aud = d.cpaud; return cpRerender(`[data-cpaud="${d.cpaud}"]`); }
  if(d.cpgate) { cp.gate = d.cpgate; return cpRerender(`[data-cpgate="${d.cpgate}"]`); }
  if(d.cpvpc) { cp.vpc = d.cpvpc; return cpRerender(`[data-cpvpc="${d.cpvpc}"]`); }
  if(d.cptab) { cp.tab = d.cptab; cpSave(); renderCoppa(); const t = document.querySelector(`[data-cptab="${d.cptab}"]`); if(t) t.focus(); return; }
  if(d.cpdraft) { cp.draft = d.cpdraft; cpSave(); renderCoppa(); const t = document.querySelector(`[data-cpdraft="${d.cpdraft}"]`); if(t) t.focus(); return; }
  if(d.cpshare) { const r = cp.pi[d.cpshare] = Object.assign({on:true, use:"feature", share:[], keep:""}, cp.pi[d.cpshare]); r.share = (r.share || []).includes(d.v) ? r.share.filter(v => v !== d.v) : (r.share || []).concat(d.v); return cpRerender(`[data-cpshare="${d.cpshare}"][data-v="${d.v}"]`); }
  if(d.cpfix) { cp.ctrl = Object.assign({}, cp.ctrl, {[d.cpfix]:true}); cp.ex = false; cpSave(); const y = window.scrollY; renderCoppa(); window.scrollTo(0, y); return gsay("Marked as done"); }
  if(d.cp) cpAct(d.cp);
});
document.addEventListener("change", e => {
  const t = e.target; if(!t || !cpHere() || !view.contains(t) || !t.closest(".cp-root")) return;
  const d = t.dataset || {};
  if(d.cpset){ const g = d.cpset, k = t.value;
    if(g === "know") cp.know = t.checked ? [...new Set(cp.know.concat(k))] : cp.know.filter(v => v !== k);
    else { cp[g] = Object.assign({}, cp[g]); if(t.checked) cp[g][k] = true; else delete cp[g][k]; }
    return cpRerender(`[data-cpset="${g}"][value="${k}"]`); }
  if(d.cppi){ cp.pi[d.cppi] = Object.assign({use:"feature", share:[], keep:""}, cp.pi[d.cppi], {on:t.checked}); return cpRerender(`[data-cppi="${d.cppi}"]`); }
  if(d.cpuse){ cp.pi[d.cpuse] = Object.assign({}, cp.pi[d.cpuse], {use:t.value}); return cpRerender("#" + t.id); }
  if(d.cpkeep){ cp.pi[d.cpkeep] = Object.assign({}, cp.pi[d.cpkeep], {keep:t.value}); return cpRerender("#" + t.id); }
});
document.addEventListener("input", e => { const t = e.target; if(t && t.id === "cp-svc" && cpHere()){ cp.svc = t.value.slice(0, 80); cp.ex = false; cpSave(); } });
// Plain-English terms the check uses, explained on hover
Object.assign(GT_MORE, {
  "verifiable parental consent":"Consent from a parent, given through a method the FTC accepts as reasonably sure it's really the parent, such as a card check or an ID check.",
  "actual knowledge":"Knowing, not just suspecting, that a particular user is under 13, for example because they said so or a parent told you.",
  "persistent identifier":"An identifier that recognizes a user over time or across services, such as a cookie, a device ID or an advertising ID.",
  "mixed-audience":"A service aimed partly at children but not mainly at them. It may ask for age and apply COPPA only to users under 13.",
  "safe harbor":"An FTC-approved industry program. Members that follow its guidelines are treated as complying with the COPPA Rule.",
  "internal operations":"Running and securing the service, such as keeping it working, authenticating users and serving contextual ads. It never includes profiling or targeted ads."
});

