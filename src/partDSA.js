/* =========================================================
   DSA READINESS: which duties under the EU Digital Services Act apply to you, and what's missing
   Answers: what kind of service, how big, where established, what features. Each duty is an article with
   a severity, an owner, why it matters and what to do. The report gives a plan, the duties and four drafts.
   Reference: Regulation (EU) 2022/2065. Checked in DS_REVIEWED. A starting point for counsel, not legal advice.
   ========================================================= */
const DS_REVIEWED = "September 2026";
const DS_SRC = [
  ["Regulation (EU) 2022/2065 (the DSA)", "https://eur-lex.europa.eu/eli/reg/2022/2065/oj"],
  ["European Commission, the DSA in practice", "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act"],
  ["Commission guidelines on the protection of minors (Article 28)", "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors"],
  ["DSA Transparency Database", "https://transparency.dsa.ec.europa.eu/"]
];
// What kind of service. Each tier carries the duties of the ones before it
// A worked example per tier (5th item), so a newcomer can match their own service to one without reading legal prose first
const DS_TIERS = [
  ["conduit", "Mere conduit or caching", "An internet access provider, a VPN, a DNS service, a CDN. You carry or cache what others send.", 1,
    "Example: an ISP, a VPN provider or a CDN."],
  ["hosting", "Hosting", "You store content for users but don't share it with the public: cloud storage, web hosting, private file transfer.", 2,
    "Example: a cloud storage app, a web host or a private file-transfer tool."],
  ["platform", "Online platform", "You store users' content and share it with the public: social, video, marketplace, app store, dating, forum, review site.", 3,
    "Example: most apps with public posts or listings, such as a social app, a marketplace or a forum."],
  ["vlop", "Very large online platform or search engine", "Designated by the Commission, at 45 million or more monthly EU users. Every duty in the Act applies.", 4,
    "Example: a platform the Commission has named on its public VLOP/VLOSE list."]
];
const dsTierHint = ([k, n, h, rank, ex]) => ex ? `${h} ${ex}` : h;
const DS_SIZE = [
  ["small", "Micro or small", "Fewer than 50 staff and under €10 million turnover, and the company isn't part of a larger group that exceeds that."],
  ["medium", "Medium or larger", "50 staff or more, or €10 million or more in turnover, or part of a group that is."]
];
const DS_EST = [
  ["eu", "In the EU", "Your main establishment is in a member state. Its Digital Services Coordinator supervises you."],
  ["outside", "Outside the EU, serving EU users", "You offer services to people in the EU: an EU language, currency, delivery, or a substantial number of EU users."]
];
const DS_FEAT = [
  ["traders", "Businesses sell to consumers on the service", "A marketplace, app store or booking service where traders reach EU consumers.", "Traders"],
  ["ads", "We show advertising", "Ads sold or served on the service, including sponsored posts and promoted listings.", "Ads"],
  ["rec", "We rank or recommend content", "A feed, a search ranking, suggestions: anything that decides what a user sees and in what order.", "Recommendations"],
  ["minors", "Minors can use the service", "People under 18 can create an account or use it without one, whether or not it's aimed at them.", "Minors"],
  ["auto", "We use automated moderation", "Classifiers, hash matching, filters or AI that remove, demote or flag content or accounts.", "Automated moderation"]
];
const DS_OWNERS = {product:"Product", eng:"Engineering", legal:"Legal & Policy", ops:"T&S Ops"};
const DS_SEV = {crit:3, high:2, med:1};
const DS_SEVN = {crit:["Critical", "crit"], high:["High", "high"], med:["Medium", "med"]};
const dsLabel = (list, k) => (list.find(z => z[0] === k) || [])[1] || "";
// Enforcement to know, cited on the duties they bear on
const DS_CASE = {
  x:"In December 2025 the Commission fined X €120 million, its first DSA decision, over a verified badge that misled users, an incomplete ad repository and blocked researcher access.",
  meta:"In October 2025 the Commission preliminarily found that Facebook and Instagram's reporting tools added needless steps and dark patterns, and that their appeals didn't let users explain or add evidence.",
  tiktok:"In 2024 TikTok withdrew its Lite rewards program from the EU after the Commission opened proceedings over launching it without a risk assessment.",
  temu:"In July 2025 the Commission preliminarily found that Temu's risk assessment of illegal products on its marketplace was inaccurate and too general.",
  adult:"In May 2025 the Commission opened proceedings against four adult platforms over age verification and other measures to protect minors."
};
// When a duty applies, given the context x
const DS_APPLY = {
  all:x => true,
  hosting:x => x.rank >= 2,
  platform:x => x.platform,
  platformAny:x => x.rank >= 3,
  smallPlatform:x => x.rank >= 3 && x.small,
  report:x => !x.small,
  nonEU:x => !x.eu,
  traders:x => x.platform && x.traders,
  ads:x => x.platform && x.ads,
  rec:x => x.platform && x.rec,
  minors:x => x.platform && x.minors,
  minorsAds:x => x.platform && x.minors && x.ads,
  minorsTerms:x => x.minors,
  vlop:x => x.vlop
};
// The duties, grouped as the Act is. Each item: t text, sev, o owner, cite article, a applies, why, fix, kase
const DS_CTRL = [
  {k:"contact", n:"Contact points and terms", h:"Every intermediary, whatever its size, has these duties.", items:[
    {k:"i_auth", t:"A single point of contact for authorities, published and easy to find", sev:"high", o:"legal", cite:"Art. 11", a:"all",
      why:"Member state authorities, the Commission and the European Board send orders and questions here. It has to be electronic and name the languages you accept.",
      fix:"Publish a dedicated address for authorities in your terms or legal page, name at least one EU official language you'll work in, and route it to Legal with a monitored inbox."},
    {k:"i_user", t:"A point of contact for users that offers a real way to reach a person", sev:"high", o:"product", cite:"Art. 12", a:"all",
      why:"Users must be able to communicate with you directly and quickly, by electronic means. A chatbot or a form with no human behind it doesn't meet the bar on its own.",
      fix:"Publish an email or a contact form that reaches a staffed queue, and say so in your terms."},
    {k:"i_rep", t:"A legal representative in one of the member states where you offer the service", sev:"crit", o:"legal", cite:"Art. 13", a:"nonEU",
      why:"Providers established outside the EU must appoint a representative who can be held liable for non-compliance. Without one, every member state can supervise you.",
      fix:"Appoint a representative (a law firm or a group company) in a member state, give them a mandate, and publish their name and address."},
    {k:"i_terms", t:"Terms that explain your restrictions, the tools you use (including automated ones and human review) and your complaint process, in plain language", sev:"crit", o:"legal", cite:"Art. 14(1)", a:"all",
      why:"Users must be able to see what's not allowed and how you decide, including where algorithms make the call. The terms are also what your statements of reasons will cite.",
      fix:"Rewrite the content and conduct sections in plain language, name the policies, describe automated moderation and human review, and link the complaint process."},
    {k:"i_changes", t:"Users are told about significant changes to the terms", sev:"med", o:"product", cite:"Art. 14(2)", a:"all",
      why:"A quiet change to a rule can't ground a restriction that follows.", fix:"Keep a changelog for the terms and notify users in-product or by email when a significant change lands."},
    {k:"i_minors", t:"Where minors use the service, the terms are explained in a way they can understand", sev:"high", o:"product", cite:"Art. 14(3)", a:"minorsTerms",
      why:"A service directed at minors or mainly used by them owes them an explanation of the conditions and restrictions that they can follow.",
      fix:"Write a short, plain version of the rules for younger users, and show it at sign-up and in the help center."},
    {k:"i_diligent", t:"Restrictions are applied diligently, objectively and proportionately, with fundamental rights in mind", sev:"high", o:"ops", cite:"Art. 14(4)", a:"all",
      why:"Enforcement can't be arbitrary. Reviewers need written guidance, and decisions need to weigh freedom of expression and the other rights at stake.",
      fix:"Keep internal enforcement guidelines that match the public terms, calibrate reviewers against them, and record the reason for every action."}]},
  {k:"notice", n:"Notice and action", h:"How people report illegal content, and what they and the poster hear back.", items:[
    {k:"n_mech", t:"A reporting mechanism that is easy to find, easy to use, and works electronically", sev:"crit", o:"product", cite:"Art. 16(1)", a:"hosting",
      why:"Anyone, logged in or not, must be able to flag content they believe is illegal. Hard-to-find buttons and long forms defeat the duty.", kase:"meta",
      fix:"Put a report option on every piece of content and every profile, reachable without an account, with the fewest steps that still capture what you need."},
    {k:"n_fields", t:"Reports ask why the content is illegal, where it is (a URL), the reporter's name and email, and a good-faith statement", sev:"high", o:"product", cite:"Art. 16(2)", a:"hosting",
      why:"A report with these elements gives you actual knowledge of illegality, which is what removes your liability shield. The reporter can stay anonymous only for sexual-abuse material involving children.",
      fix:"Add the four fields to the illegal-content report form, and make name and email optional for the child sexual abuse category."},
    {k:"n_ack", t:"Reporters get a confirmation of receipt without undue delay", sev:"high", o:"eng", cite:"Art. 16(4)", a:"hosting",
      why:"Confirmation is required whenever you have the reporter's contact details.", fix:"Send an automated acknowledgment with a reference number as soon as a report is filed."},
    {k:"n_decide", t:"Reporters are told your decision and whether automated means were used", sev:"high", o:"ops", cite:"Art. 16(5), 16(6)", a:"hosting",
      why:"Every report gets a decision, including a decision not to act, and the reporter learns about redress.", fix:"Close every report with a message that states the outcome, mentions automation where used, and links the complaint route."},
    {k:"n_timely", t:"Reports are handled in a timely, diligent, non-arbitrary and objective way", sev:"high", o:"ops", cite:"Art. 16(6)", a:"hosting",
      why:"There is no fixed clock, but a report you sit on is one you're deemed to know about. Regulators look at your median times and your consistency.",
      fix:"Set internal service levels by severity, measure median time to decision, and audit a sample of decisions each month."},
    {k:"n_sor", t:"Every restriction comes with a statement of reasons: what was restricted, the facts, the legal or terms basis, whether automation was used, and how to appeal", sev:"crit", o:"product", cite:"Art. 17", a:"hosting",
      why:"Removal, demotion, demonetization, suspension and termination all need a clear, specific reason sent to the user. 'Violated our guidelines' is not one.",
      fix:"Build one statement-of-reasons template into the enforcement flow and require a policy citation and a fact description before an action can be applied. The draft on this page is a start."},
    {k:"n_le", t:"Suspected offences that threaten someone's life or safety are reported promptly to law enforcement", sev:"crit", o:"ops", cite:"Art. 18", a:"hosting",
      why:"When you become aware of information giving rise to a suspicion of such a crime, you must inform the police or judicial authority of the member state concerned, or Europol.",
      fix:"Write an escalation path for threats to life, with named contacts for the member states you operate in, and rehearse it."}]},
  {k:"complaints", n:"Complaints and disputes", h:"How a user challenges a decision, inside your service and beyond it.", items:[
    {k:"c_int", t:"A free internal complaint system, open for at least six months after a decision, covering removals, demotions, suspensions, demonetization and rejected reports", sev:"crit", o:"product", cite:"Art. 20(1), 20(2)", a:"platform",
      why:"Both the person whose content was actioned and the reporter whose report was rejected can complain. Six months is the minimum window.", kase:"meta",
      fix:"Add an appeal route to every enforcement message and to every rejected-report message, keep it open for six months, and let the user add an explanation and evidence. An open-source option: ROOST's Coop has an appeals API you can build the complaint route on."},
    {k:"c_human", t:"Complaints get a qualified human review, not only automation, and decisions are reversed when the complaint is justified", sev:"crit", o:"ops", cite:"Art. 20(4), 20(6)", a:"platform",
      why:"Complaints must be handled in a timely, non-discriminatory, diligent and non-arbitrary way, under the supervision of appropriately qualified staff.",
      fix:"Staff an appeals queue separate from first-line review, measure reversal rates, and feed reversals back into reviewer calibration."},
    {k:"c_odr", t:"Users are told about certified out-of-court dispute settlement bodies, and you engage with them in good faith", sev:"high", o:"legal", cite:"Art. 21", a:"platform",
      why:"A user who has exhausted your internal complaint process may take the dispute to a body certified by a Digital Services Coordinator. You must engage and bear the fees if the user wins.",
      fix:"Name the certified bodies in your terms and in every complaint decision, and set a process for responding to them."}]},
  {k:"flaggers", n:"Trusted flaggers and misuse", h:"Priority for expert reporters, and limits on people who abuse the system.", items:[
    {k:"t_flag", t:"Reports from trusted flaggers are prioritized and handled without undue delay", sev:"high", o:"eng", cite:"Art. 22", a:"platform",
      why:"Trusted flaggers are awarded status by a Digital Services Coordinator. Their notices go to the front of the queue.",
      fix:"Add a trusted-flagger channel with its own queue and service level, and check the Commission's public list of awarded flaggers."},
    {k:"t_susp", t:"Users who frequently post manifestly illegal content are suspended for a reasonable period, after a warning", sev:"high", o:"ops", cite:"Art. 23(1)", a:"platform",
      why:"The Act requires a suspension policy for repeat offenders, assessed case by case on the numbers, the gravity and the intent.",
      fix:"Define thresholds for 'frequent' and 'manifestly illegal', warn before suspending, and record the assessment."},
    {k:"t_abuse", t:"Reports and complaints from people who frequently submit manifestly unfounded ones can be suspended", sev:"med", o:"ops", cite:"Art. 23(2)", a:"platform",
      why:"You may protect your queues from mass false reporting, after a warning and for a reasonable period.", fix:"Track unfounded rates per reporter, warn, then suspend the ability to report for a set period."},
    {k:"t_policy", t:"The terms set out your policy on these suspensions, with examples", sev:"med", o:"legal", cite:"Art. 23(4)", a:"platform",
      why:"The policy must be public and clear enough that users know what counts as misuse.", fix:"Add a short section to the terms with the criteria, the warning step and example cases."}]},
  {k:"transparency", n:"Transparency", h:"What you publish about moderation, and what you send to the Commission's database.", items:[
    {k:"r_report", t:"A yearly transparency report with orders from authorities, reports by category, own-initiative moderation, automation and its accuracy, complaints and outcomes, and median handling times", sev:"crit", o:"ops", cite:"Art. 15", a:"report",
      why:"Micro and small enterprises are exempt, everyone else reports at least once a year in a machine-readable format, using the Commission's template.",
      fix:"Start logging every number the template asks for now, so the first report can be assembled rather than reconstructed. The transparency report tool in this workbench builds it."},
    {k:"r_platform", t:"The report also covers out-of-court disputes and suspensions for misuse", sev:"high", o:"ops", cite:"Art. 24(1)", a:"platform",
      why:"Platforms add the number of disputes, their outcomes and median time, plus suspensions under Article 23.", fix:"Log dispute referrals and misuse suspensions with dates and outcomes."},
    {k:"r_amar", t:"Average monthly active EU users published at least every six months", sev:"high", o:"legal", cite:"Art. 24(2)", a:"platform",
      why:"The figure decides whether you'll be designated as a very large platform, so the Commission wants it public and current.",
      fix:"Agree a counting method with Legal, publish the number on a public page every six months, and keep the working."},
    {k:"r_amar_req", t:"You can give the Digital Services Coordinator your average monthly active EU users on request", sev:"med", o:"legal", cite:"Art. 24(3)", a:"smallPlatform",
      why:"Micro and small platforms don't have to publish the figure, but must supply it when asked.", fix:"Keep a documented monthly count of EU users ready to share."},
    {k:"r_db", t:"Every statement of reasons is submitted to the DSA Transparency Database, without personal data", sev:"crit", o:"eng", cite:"Art. 24(5)", a:"platform",
      why:"Platforms must send each decision to the Commission's public database as soon as it's made. It's an API integration, not a form.",
      fix:"Integrate the Transparency Database API into the enforcement pipeline and strip personal data before sending."}]},
  {k:"design", n:"Design, ads and recommendations", h:"How the interface, the ads and the feed treat users.", items:[
    {k:"d_dark", t:"No dark patterns: nothing in the interface deceives, manipulates or materially distorts users' choices", sev:"high", o:"product", cite:"Art. 25", a:"platform",
      why:"Nagging repeats, pre-ticked choices, hard-to-find cancellation and misleading prominence all count. The X decision turned on a badge that meant something different from what it implied.", kase:"x",
      fix:"Review consent, subscription, reporting and account-deletion flows against the Commission's examples, and fix the ones that steer."},
    {k:"a_label", t:"Every ad is labeled as an ad, with who it's on behalf of, who paid, and the main targeting parameters and how to change them", sev:"crit", o:"product", cite:"Art. 26(1)", a:"ads",
      why:"Each ad must carry this in real time, for each user. 'Sponsored' alone isn't enough.", fix:"Add an ad label with an info panel showing advertiser, payer and why the user is seeing it, with controls."},
    {k:"a_declare", t:"Users can declare that their content is a commercial communication", sev:"med", o:"product", cite:"Art. 26(2)", a:"ads",
      why:"Creators posting sponsored content need a way to mark it, and viewers need to see the mark.", fix:"Add a 'paid partnership' toggle to posting and a visible label on the content."},
    {k:"a_special", t:"No ads targeted through profiling on special categories of data: health, religion, sexual orientation, ethnicity, politics and the like", sev:"crit", o:"eng", cite:"Art. 26(3)", a:"ads",
      why:"Interest signals that infer these categories are covered too.", fix:"Audit targeting segments and inferred interests, and remove any that map onto a special category."},
    {k:"rc_params", t:"The terms explain the main parameters of your recommender systems, and any options users have to change them", sev:"high", o:"legal", cite:"Art. 27", a:"rec",
      why:"Users must be able to understand why content is suggested to them and how to influence it, in plain language.",
      fix:"Write a plain description of the main signals behind each feed and ranking, and expose the options you already offer (for example, a chronological feed)."}]},
  {k:"minors", n:"Protecting minors", h:"What platforms accessible to minors owe them.", items:[
    {k:"m_measures", t:"Appropriate and proportionate measures for a high level of privacy, safety and security for minors", sev:"crit", o:"product", cite:"Art. 28(1)", a:"minors",
      why:"The Commission's 2025 guidelines spell it out: private accounts by default, contact and discovery limits, downloads and geolocation off by default, easy reporting, and age assurance proportionate to the risk.", kase:"adult",
      fix:"Run the guidelines as a checklist against default settings, recommender behavior, contact features and age assurance, and fix the defaults first."},
    {k:"m_ads", t:"No profiling-based ads to users you know with reasonable certainty are minors", sev:"crit", o:"eng", cite:"Art. 28(2)", a:"minorsAds",
      why:"Contextual ads are allowed. Profiling is not, once you're reasonably certain of a minor's age, and the Act doesn't let you collect more data just to work it out.",
      fix:"Switch minors' accounts to contextual ads only and remove them from interest-based targeting."}]},
  {k:"traders", n:"Traders and products", h:"For platforms where businesses sell to consumers.", items:[
    {k:"k_kybc", t:"Traders provide their name, address, phone, email, an ID document, a payment account, a trade register number and a self-certification before they can sell", sev:"crit", o:"product", cite:"Art. 30(1)", a:"traders",
      why:"Know your business customer is the core marketplace duty. No details, no selling.", kase:"temu", fix:"Add the required fields to trader onboarding and block listing until they're complete."},
    {k:"k_verify", t:"You make best efforts to check the details against official databases, and suspend traders who don't provide them", sev:"high", o:"ops", cite:"Art. 30(2), 30(3)", a:"traders",
      why:"Verification against public registers and ID checks is expected, and traders who stall must be suspended.", fix:"Connect onboarding to company registers and a document check, and suspend on failure."},
    {k:"k_show", t:"Trader identity is shown to consumers", sev:"high", o:"product", cite:"Art. 30(7)", a:"traders",
      why:"Buyers must be able to see who they're buying from, in a clear and easily accessible way.", fix:"Show the trader's name, address, email and phone on listings and at checkout."},
    {k:"k_design", t:"The interface is designed so traders can give pre-contractual, compliance and product-safety information", sev:"high", o:"product", cite:"Art. 31(1), 31(2)", a:"traders",
      why:"Fields for safety labels, warnings, CE marks and the like have to exist and be usable before a listing goes live.", fix:"Add structured fields for the information EU consumer and product-safety law requires, and make them mandatory by category."},
    {k:"k_checks", t:"Random checks of whether products have been identified as illegal in official databases", sev:"med", o:"ops", cite:"Art. 31(3)", a:"traders",
      why:"Best efforts include sampling listings against sources such as the EU Safety Gate.", fix:"Run a monthly sample of listings against Safety Gate and remove matches."},
    {k:"k_inform", t:"Consumers who bought an illegal product are told within six months of your learning of it", sev:"high", o:"ops", cite:"Art. 32", a:"traders",
      why:"If you have the buyer's contact details, you must tell them the product was illegal, who sold it, and where to seek redress. Otherwise you publish it.",
      fix:"Add an illegal-product recall flow that emails affected buyers and posts a public notice when contacts are unknown."}]},
  {k:"vlop", n:"Very large platforms", h:"The duties that come with designation.", items:[
    {k:"v_risk", t:"A yearly systemic-risk assessment, and one before every significant new functionality", sev:"crit", o:"legal", cite:"Art. 34", a:"vlop",
      why:"Illegal content, fundamental rights, civic discourse and elections, gender-based violence, public health, minors and wellbeing: all assessed, documented and kept for three years.", kase:"tiktok",
      fix:"Set an annual assessment cycle with named owners per risk, and a gate in the launch process for new features."},
    {k:"v_mit", t:"Reasonable, proportionate and effective mitigation for each systemic risk", sev:"crit", o:"product", cite:"Art. 35", a:"vlop",
      why:"Mitigation has to be specific to the risks found and tracked for effect.", fix:"Map each risk to concrete measures with metrics, and report them in the audit."},
    {k:"v_crisis", t:"A crisis response protocol the Commission can invoke", sev:"high", o:"ops", cite:"Art. 36", a:"vlop",
      why:"In a serious threat to public security or health, the Commission can require an assessment and measures within a set time.", fix:"Keep a crisis playbook with decision rights and a 24-hour contact path."},
    {k:"v_audit", t:"A yearly independent audit of compliance, with a published report and an implementation report", sev:"crit", o:"legal", cite:"Art. 37", a:"vlop",
      why:"An independent auditor examines every Chapter III duty and any codes and crisis protocols you've signed up to.", fix:"Appoint an auditor early, and keep evidence per duty through the year."},
    {k:"v_rec", t:"At least one recommender option that is not based on profiling", sev:"crit", o:"eng", cite:"Art. 38", a:"vlop",
      why:"Users must be able to choose a feed that doesn't use their personal data to rank.", fix:"Offer a chronological or non-personalized feed, and make it easy to switch."},
    {k:"v_ads", t:"A public ad repository, searchable, covering a year after the last impression", sev:"crit", o:"eng", cite:"Art. 39", a:"vlop",
      why:"Content, advertiser, payer, period, targeting parameters and reach, all public and queryable.", kase:"x", fix:"Build or buy the repository with an API, and check it against the Commission's specification."},
    {k:"v_data", t:"Data access for the Commission, Digital Services Coordinators and vetted researchers", sev:"crit", o:"eng", cite:"Art. 40", a:"vlop",
      why:"Regulators can demand data to monitor compliance; vetted researchers get access for systemic-risk research under the delegated act.", kase:"x",
      fix:"Stand up a data access program with an application process, a secure environment and a legal review path."},
    {k:"v_comp", t:"An independent compliance function reporting to the management body", sev:"high", o:"legal", cite:"Art. 41", a:"vlop",
      why:"Compliance officers need the authority, resources and access to do the job, and the board is accountable.", fix:"Appoint a head of compliance with a reporting line to the board and a budget."},
    {k:"v_report", t:"Transparency reports every six months, with moderation resources, staff expertise and languages, and monthly EU users per member state", sev:"high", o:"ops", cite:"Art. 42", a:"vlop",
      why:"Very large platforms report twice a year with more detail, including the risk assessment and audit reports.", fix:"Extend the transparency report to the Article 42 content and move to a six-month cycle."}]}
];
const DS_BLANK = () => ({svc:"", tier:"", size:"", est:"", feat:{}, ctrl:{}, view:"setup", tab:"plan", draft:"sor", ex:false});
// Pixelry: a social video platform with EU users, partway there
const DS_EXAMPLE = {svc:"Pixelry", tier:"platform", size:"medium", est:"outside", ex:true, feat:{ads:true, rec:true, minors:true, auto:true},
  ctrl:{i_auth:true, i_user:true, i_terms:true, i_changes:true, i_diligent:true, n_mech:true, n_ack:true, n_decide:true, n_timely:true, n_le:true, c_int:true, t_susp:true, r_report:true, r_amar:true, a_label:true, a_declare:true, rc_params:true},
  view:"report", tab:"plan", draft:"sor"};
let ds = Object.assign(DS_BLANK(), store.get("ds", null) || {});
const dsSave = () => store.set("ds", ds);
const dsTitle = d => "DSA readiness: " + (d.svc || "Untitled service");
// Pixelry's own readiness score, for a benchmark line under the verdict
function dsBenchPct(){
  try{ const d = Object.assign(DS_BLANK(), DS_EXAMPLE), x = dsCtx(d); return dsScore(d, x).pct; }catch(e){ return null; }
}
shareRegister("dsa", d => { ds = Object.assign(DS_BLANK(), d, {shared:true}); dsView = "page"; dsSave(); });

/* ---------- working it out ---------- */
function dsCtx(d){
  const tier = DS_TIERS.find(t => t[0] === d.tier), rank = tier ? tier[3] : 0, vlop = d.tier === "vlop";
  const small = d.size === "small" && !vlop, f = k => !!(d.feat && d.feat[k]);
  return {rank, vlop, small, eu:d.est !== "outside", platform:rank >= 3 && !small, traders:f("traders"), ads:f("ads"), rec:f("rec"), minors:f("minors"), auto:f("auto")};
}
function dsApplies(d){
  if(!d.tier) return {h:"Tell us what kind of service you run", t:"Choose a tier to see which duties apply.", tone:""};
  const x = dsCtx(d), name = dsLabel(DS_TIERS, d.tier);
  if(x.vlop) return {h:"Every duty in the Act applies", t:"As a designated very large platform or search engine, you carry the duties of every tier plus systemic-risk assessments, audits and data access, supervised by the Commission directly.", tone:"crit"};
  if(x.rank >= 3 && x.small) return {h:"The core duties apply; the platform-specific ones don't yet", t:"Micro and small enterprises are exempt from most online-platform duties and from transparency reports. You lose the exemption twelve months after you outgrow the thresholds, or on designation as a very large platform.", tone:"high"};
  if(x.rank >= 3) return {h:"The online-platform duties apply", t:`As an ${name.toLowerCase()} you owe the intermediary and hosting duties plus complaints handling, trusted flaggers, transparency, ad labeling and design rules${x.traders ? ", and the marketplace duties for your traders" : ""}${x.minors ? ", and the protection of minors" : ""}.`, tone:"high"};
  if(x.rank === 2) return {h:"The hosting duties apply", t:"You store users' content, so you owe the intermediary duties plus notice and action, statements of reasons and reporting of serious crimes. The platform duties don't apply while you don't share content with the public.", tone:"high"};
  return {h:"The intermediary duties apply", t:"Mere conduit and caching services owe the contact-point, terms and transparency duties. Notice and action and the platform duties don't apply to you.", tone:"good"};
}
const dsApplyFn = a => typeof a === "function" ? a : DS_APPLY[a];
const dsItemOn = (it, x) => dsApplyFn(it.a)(x);
function dsReqs(d, x){
  const out = [];
  DS_CTRL.forEach(g => g.items.forEach(it => { if(dsItemOn(it, x)) out.push(Object.assign({g:it.g || g.k}, it, {met:!!d.ctrl[it.k]})); }));
  return out;
}
function dsScore(d, x){
  const reqs = dsReqs(d, x), met = reqs.filter(r => r.met).length;
  const gaps = reqs.filter(r => !r.met).sort((a, b) => DS_SEV[b.sev] - DS_SEV[a.sev]);
  return {reqs, total:reqs.length, met, pct:reqs.length ? Math.round(met / reqs.length * 100) : 0, gaps, crit:gaps.filter(r => r.sev === "crit").length};
}
// Starting answers from the organization profile and a pre-mortem
function dsFromOrg(){
  const o = typeof orgGet === "function" ? orgGet() : {}, p = typeof loopSource === "function" ? loopSource() : null, pp = p && p.p;
  const F = k => !!(pp && (pp.features || []).includes(k)), M = k => !!(pp && (pp.money || []).includes(k));
  const feat = {};
  if(o.type === "marketplace" || o.type === "gig" || M("p2p") || M("payouts")) feat.traders = true;
  if(F("ads") || ["social", "gaming", "genai"].includes(o.type)) feat.ads = true;
  if(F("discovery") || F("posts") || ["social", "marketplace", "dating", "gaming"].includes(o.type)) feat.rec = true;
  if(["kids", "teens", "adult_self"].includes(o.youth)) feat.minors = true;
  return {svc:(pp && pp.name ? pp.name : (typeof wsProfile === "function" && (wsProfile() || {}).org) || "").replace(" (example)", "").replace(" (draft)", ""),
    tier:["social", "marketplace", "dating", "gaming", "gig", "genai", "kids"].includes(o.type) ? "platform" : "", size:o.stage === "start" ? "small" : o.stage ? "medium" : "", est:"", feat, view:"setup"};
}

/* ---------- drafts ---------- */
function dsSorMd(){
  const svc = ds.svc || "[service name]";
  return [`# Statement of reasons`, "", `_Sent to the user for every restriction on ${svc}, as Article 17 of the Digital Services Act requires. Fill in the brackets; keep the headings._`, "",
    "## What we did", "On [date], we [removed / made less visible / stopped payments for / suspended / closed] [the post / the account / the listing] at [link or identifier]. [If the restriction is limited in time: it lasts until [date].] [If it applies in some places only: it applies in [member states].]", "",
    "## What we found", "[Two or three sentences on the facts and circumstances. Say what the content or behavior was, and how we became aware of it: a report, a trusted flagger, an order from an authority, or our own review.]", "",
    "## Why", "[Pick one:]", "- It's against the law: [name the law and provision] because [explain, in plain words].", `- It's against our terms: section [x] of the ${svc} terms, "[quote the rule]", because [explain].`, "",
    "## How we decided", "[Pick one:] A person reviewed it. / Automated systems flagged it and a person reviewed it. / Automated systems made this decision. [If a report started it, say so, without naming the reporter.]", "",
    "## What you can do", `- Appeal inside ${svc}: [link]. You have six months from today. Tell us why you disagree and add anything that helps.`, "- Take the dispute to a certified out-of-court body: [names and links]. Their decision isn't binding, but we take part in good faith.", "- Go to court. Nothing here limits that.", "",
    "_Reference: [decision ID]. This decision is also recorded, without your personal data, in the European Commission's DSA Transparency Database._"].join("\n");
}
function dsNoticeMd(){
  const x = dsCtx(ds), svc = ds.svc || "[service name]";
  return [`# Reporting illegal content on ${svc}: how it works`, "", `_A public description for the help center, and the outline of the internal procedure behind it. Article 16 of the Digital Services Act. Fill in the brackets._`, "",
    "## How to report", `Anyone can report content they believe is illegal, with or without a ${svc} account. Use the Report option on the content, or the form at [link].`, "",
    "We ask for:", "- Why you think the content is illegal, and under which law if you know it", "- Where it is: the link or the identifier", "- Your name and email, so we can confirm we've received the report and tell you what we decided (you can leave these out when reporting sexual abuse of a child)", "- Your confirmation that the report is accurate and made in good faith", "",
    "## What happens next", "1. You get a confirmation with a reference number [right away].", "2. A [reviewer / automated check and then a reviewer] looks at the report. We aim to decide within [x hours for threats to safety, y days otherwise].", "3. We tell you what we decided, whether automated tools were involved, and how to challenge it.", "4. If we act, the person who posted the content gets a statement of reasons and a way to appeal.", "",
    x.platform ? "## Trusted flaggers\nReports from trusted flaggers awarded status by a Digital Services Coordinator go to a dedicated queue and are handled first. Contact [address] to use it." : "",
    x.platform ? "## Misuse\nIf you repeatedly send reports that are clearly unfounded, we'll warn you, and may then stop accepting your reports for [period]. The same goes for accounts that repeatedly post clearly illegal content: a warning, then a suspension for [period]." : "",
    "## Serious crimes", "If a report or our own review suggests a crime that threatens someone's life or safety, we inform [the police or judicial authority of the member state concerned, or Europol] promptly.", "",
    "## Internal procedure (not published)", "- Intake: [system]. Every report is logged with time received, category, reporter contact, and source (user, trusted flagger, authority, internal).", "- Triage: [rules for severity]. Threats to life or safety go to [on-call role] within [minutes].", "- Decision: [who decides, against which internal guidelines]. Every decision records the policy or legal ground and whether automation was used.", "- Messaging: templates for confirmation, decision to the reporter, and statement of reasons to the poster.", "- Measurement: median time to decision by category, reversal rate on appeal, and the numbers the transparency report needs."].filter(Boolean).join("\n");
}
function dsComplaintsMd(){
  const svc = ds.svc || "[service name]";
  return [`# Challenging a decision on ${svc}`, "", `_The internal complaint-handling process Article 20 requires, and the out-of-court route under Article 21. Suitable for the terms or the help center. Fill in the brackets._`, "",
    "## What you can challenge", "- A decision to remove, hide, demote or stop paying for your content", "- A decision to suspend or close your account", "- A decision not to act on a report you made", "", "You have six months from the day we told you about the decision.", "",
    "## How", `Use the Appeal link in the message we sent you, or the form at [link]. It's free. Tell us why you think we got it wrong and add anything that supports your case: [screenshots, context, links].`, "",
    "## What we do", "1. We confirm we've received your complaint.", "2. A trained member of our team who wasn't involved in the first decision reviews it. Our automated systems don't decide appeals on their own.", "3. We aim to reply within [x days]. If your complaint is justified, we reverse the decision: [restore the content / lift the suspension / act on your report].", "4. We tell you the outcome and your further options.", "",
    "## If you still disagree", "- You can take the dispute to a certified out-of-court dispute settlement body: [names, links]. We take part in good faith. If the body decides in your favor, we bear its fees; if it decides in ours, you pay only if you acted in bad faith.", "- You can go to court at any time. Nothing here limits that.", "",
    "## Internal notes (not published)", "- Queue: appeals sit in a separate queue from first-line review, staffed by [team], with [x]% sampled for quality each month.", "- Metrics: reversal rate by policy and by reviewer, median time to decision, and the counts the transparency report needs.", "- Records: every appeal keeps the original decision, the user's statement, the reviewer's reasoning and the outcome for [retention period]."].join("\n");
}
function dsMemoMd(){
  const d = ds, x = dsCtx(d), ap = dsApplies(d), s = dsScore(d, x), svc = d.svc || "[service name]";
  const feats = DS_FEAT.filter(f => d.feat[f[0]]).map(f => f[1]);
  const L = [`# DSA readiness: ${svc}`, "", `_Prepared ${new Date().toISOString().slice(0, 10)} with T&S Workbench, for review by counsel. Not legal advice._`, "",
    "## Summary", `**${ap.h}.** ${ap.t}`, "", s.total ? `${s.met} of ${s.total} duties are in place (${s.pct}%), with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}.` : "No duties apply to the answers given.", "",
    "## How we answered", `- Kind of service: ${dsLabel(DS_TIERS, d.tier) || "not answered"}`, `- Size: ${dsLabel(DS_SIZE, d.size) || "not answered"}`, `- Establishment: ${dsLabel(DS_EST, d.est) || "not answered"}`, `- Features: ${feats.length ? feats.join("; ") : "none ticked"}`, "",
    "## Gaps, most urgent first", ""];
  if(!s.gaps.length) L.push("No gaps for the answers given.");
  s.gaps.forEach((r, i) => L.push(`${i + 1}. **${r.t}** (${DS_SEVN[r.sev][0]}; ${r.cite}; owner: ${DS_OWNERS[r.o]}). ${r.why} To fix: ${r.fix}`));
  const q = [];
  if(x.rank >= 2 && x.rank < 3) q.push("Do any of our features share users' content with the public, which would make us an online platform rather than a hosting service?");
  if(x.rank >= 3 && !x.vlop) q.push("Is any part of the public sharing 'a minor and purely ancillary feature' of another service, which would take it outside the platform definition?");
  if(x.small) q.push("When did we last check the micro/small thresholds, including group companies, and when would the twelve-month grace period after outgrowing them end?");
  if(!x.eu) q.push("Which member state should our legal representative sit in, and does our EU footprint make one state our main establishment?");
  else q.push("Which member state is our main establishment, and who is our Digital Services Coordinator?");
  if(x.platform && !x.minors) q.push("Could minors be using the service in practice, which would bring Article 28 into play even though it isn't aimed at them?");
  if(x.rec) q.push("Which of our ranking and suggestion features count as recommender systems under Article 3(s), and which options do users already have to influence them?");
  if(x.traders) q.push("Which of our sellers are traders rather than private individuals, and how do we tell?");
  if(x.platform) q.push("Do our monthly active EU users approach 45 million, and how are we counting them?");
  q.push("Do the UK Online Safety Act or member-state laws add duties on top of the DSA for us?");
  L.push("", "## Questions for counsel", ...q.map(v => "- " + v));
  const cases = [...new Set(s.gaps.map(r => r.kase).filter(Boolean))].map(k => DS_CASE[k]);
  if(cases.length) L.push("", "## Enforcement to know", ...cases.map(v => "- " + v));
  L.push("", "## Sources", ...DS_SRC.map(([n, u]) => `- ${n}: ${u}`), "", `Fines can reach 6% of worldwide annual turnover, with periodic penalties of up to 5% of daily turnover. Duties checked in ${DS_REVIEWED}.`);
  return L.join("\n");
}
const DS_DRAFTS = [["sor", "Statement of reasons", "statement-of-reasons"], ["notice", "Notice and action", "notice-and-action"], ["complaints", "Complaints process", "complaints-process"], ["memo", "Memo for Legal", "dsa-memo"]];
const dsDraftMd = k => k === "notice" ? dsNoticeMd() : k === "complaints" ? dsComplaintsMd() : k === "memo" ? dsMemoMd() : dsSorMd();

/* ---------- guided: one question per screen, then the plan ---------- */
let dsView = null;
// A preview of the finished example report (Pixelry), built by swapping in the example data,
// calling the real report renderer, then restoring whatever the visitor had in progress
function dsPreviewHTML(){
  const saved = ds;
  try{
    ds = Object.assign(DS_BLANK(), JSON.parse(JSON.stringify(DS_EXAMPLE)));
    const x = dsCtx(ds), ap = dsApplies(ds), s = dsScore(ds, x);
    return dsReportHTML(x, ap, s);
  }catch(e){ return ""; }
  finally{ ds = saved; }
}
function dsSpec(){
  const X = () => dsCtx(ds), setV = (k, v) => { ds[k] = v; ds.ex = false; dsSave(); };
  const steps = [
    {id:"svc", eb:"Your service", title:"What's the service called?", why:"It's named in your plan and in the drafts.", kind:"text", opt:true, placeholder:"For example: Pixelry", max:80, get:() => ds.svc, set:v => setV("svc", v.slice(0, 80))},
    {id:"tier", eb:"What kind of service", title:"Which best describes the service?", why:"The Act stacks duties by tier: every intermediary has some, hosting services more, online platforms more still, and very large platforms all of them.", kind:"single",
      opts:() => DS_TIERS.map(t => ({k:t[0], n:t[1], h:dsTierHint(t)})), get:() => ds.tier, set:k => setV("tier", k)},
    {id:"size", eb:"How big", title:"How big is the company?", why:"Micro and small enterprises are exempt from most platform duties and from transparency reports, until twelve months after they outgrow the thresholds.", kind:"single", skip:() => ds.tier === "vlop",
      opts:() => DS_SIZE.map(([k, n, h]) => ({k, n, h})), get:() => ds.size, set:k => setV("size", k)},
    {id:"est", eb:"Where", title:"Where is the company established?", why:"A provider outside the EU that serves EU users needs a legal representative in a member state.", kind:"single",
      opts:() => DS_EST.map(([k, n, h]) => ({k, n, h})), get:() => ds.est, set:k => setV("est", k)},
    {id:"feat", eb:"Features", title:"Which of these are true of the service?", why:"Ads, recommendations, traders and minors each bring their own articles.", kind:"multi", opt:true, none:"None of these", skip:() => !ds.tier || X().rank < 3,
      opts:() => DS_FEAT.map(([k, n, h]) => ({k, n, h})), get:() => Object.keys(ds.feat || {}).filter(k => ds.feat[k]),
      toggle:k => { const f = Object.assign({}, ds.feat); if(f[k]) delete f[k]; else f[k] = true; setV("feat", f); }, clear:() => setV("feat", {})}
  ].concat(DS_CTRL.map(g => ({id:"ctrl-" + g.k, eb:g.n, title:`${esc(g.n)}: what do you have in place today?`, why:(g.h ? esc(g.h) + " " : "") + "Tick what's true today.", kind:"multi", opt:true, none:"None of these yet",
    skip:() => { const x = X(); return !ds.tier || !g.items.some(it => dsItemOn(it, x)); },
    opts:() => { const x = X(); return g.items.filter(it => dsItemOn(it, x)).map(it => ({k:it.k, n:it.t, h:it.cite})); },
    get:() => Object.keys(ds.ctrl || {}).filter(k => ds.ctrl[k]), toggle:k => { const c = Object.assign({}, ds.ctrl); if(c[k]) delete c[k]; else c[k] = true; setV("ctrl", c); },
    clear:() => { const c = Object.assign({}, ds.ctrl); g.items.forEach(it => delete c[it.k]); setV("ctrl", c); }})));
  return {k:"dsa", tool:{name:"DSA readiness", icon:"dsa", color:"var(--t-ds)"},
    intro:{title:"Which parts of the Digital Services Act apply to you, and what's missing?", lead:"Four plain questions about what kind of service you run, how big it is, where it's established and what it does. Then you'll see every duty that applies, article by article, where the gaps are, and get four drafts to edit: a statement of reasons, a notice-and-action procedure, a complaints process and a memo for Legal.",
      facts:[["About 7 minutes", "One question at a time. Only the duties that apply to your answers."], ["Article by article", "Every duty cites its article and names who usually owns it."], ["Not legal advice", "A starting point for your conversation with counsel."]], start:"Start"},
    alt:[{n:"Answer everything on one page", run:() => { dsView = "page"; renderDsa(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }}]
      .concat(typeof orgGet === "function" && orgGet().confirmed ? [{n:"Start from your profile", run:() => dsAct("fromorg")}] : []).concat([{n:"See a finished example", run:() => dsAct("example")}]),
    steps, finish:"Build my plan",
    preview:dsPreviewHTML,
    done:() => { ds.view = "report"; ds.tab = "plan"; dsSave(); renderDsa(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }};
}
function renderDsa(){
  const x = dsCtx(ds), ap = dsApplies(ds), s = dsScore(ds, x), report = (ds.view === "report" && !!ds.tier) || ds.ex;
  if(!report && dsView !== "page") return gdRender(dsSpec());
  gdCur = null;
  view.innerHTML = (report
    ? headCompact("DSA readiness", `${esc(ds.svc || "Your service")} · ${esc(ap.h)}`,
        reportHeaderActions({
          edit:{attrs:'data-ds="edit"', label:EDIT_ANSWERS_LABEL},
          save:{attrs:'data-ds="save"', label:wsSaveLabel("dsa", ds), icon:"save"},
          download:{attrs:'data-ds="memo"', label:"Memo for Legal", icon:"download"},
          tracker:s.gaps.length ? {attrs:'data-ds="tasks"', label:SEND_TRACKER_LABEL, icon:"send"} : null
        }, `<button type="button" class="btn sm" data-ds="sharelink">${COPY_LINK_LABEL}</button>`))
    : head("DSA readiness", "Find out which duties under the EU Digital Services Act apply to your service, article by article, and close the gaps, with drafts ready to edit.", "Build safely",
        `<span class="toast" id="ds-toast" role="status" aria-live="polite"></span><button type="button" class="btn sm" data-ds="example">${SEE_EXAMPLE_LABEL}</button>${ds.tier ? `<button type="button" class="btn sm" data-ds="reset">${START_OVER_LABEL}</button>` : ""}${typeof orgGet === "function" && orgGet().confirmed ? `<button type="button" class="btn sm" data-ds="fromorg">Start from your profile</button>` : ""}`))
    + `<div class="ds-root cp-root">${report ? dsReportHTML(x, ap, s) : dsSetupHTML(x, ap, s)}</div>`;
}
function dsSetupHTML(x, ap, s){
  const tile = (attr, cur, k, n, h) => `<button type="button" role="radio" aria-checked="${cur === k}" class="card tr-tier ${cur === k ? "on" : ""}" data-${attr}="${k}"><b>${esc(n)}</b>${h ? `<span>${esc(h)}</span>` : ""}</button>`;
  const chk = (grp, k, label, sub) => `<label class="tr-chk"><input type="checkbox" data-dsset="${grp}" value="${k}" ${ds[grp][k] ? "checked" : ""}><span>${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ""}</span></label>`;
  const sec = (n, id, title, tag, body, tip) => `<section class="card pol-card" id="${id}"><div class="pol-h"><span class="pol-num">${n}</span><div><span class="pol-lbl">${title}</span>${tag ? `<span class="note">${tag}</span>` : ""}</div></div>${tip ? `<p class="pol-tip cp-tip">${tip}</p>` : ""}${body}</section>`;
  const groups = DS_CTRL.map(g => ({g, items:g.items.filter(it => dsItemOn(it, x))})).filter(z => z.items.length);
  let n = 0;
  return `<div class="pol-setup cp-setup ds-setup">
    ${typeof gdHas === "function" ? `<div class="banner gd-switch"><span>Prefer one question at a time? <button type="button" class="pol-add" data-ds="guide">Switch to guided</button></span></div>` : ""}
    ${sec(++n, "ds-svc", "Your service", "Optional", `<div class="field"><label for="ds-svc-in">Service or product name</label><input class="input" id="ds-svc-in" value="${esc(ds.svc)}" maxlength="80" placeholder="For example: Pixelry"></div>`)}
    ${sec(++n, "ds-tier", "What kind of service", "", `<div class="tr-tiers ds-tiers" role="radiogroup" aria-label="Kind of service">${DS_TIERS.map(t => tile("dstier", ds.tier, t[0], t[1], dsTierHint(t))).join("")}</div>`, "The Act stacks duties by tier. Every intermediary has some, hosting services more, online platforms more still, and very large platforms all of them.")}
    ${ds.tier && ds.tier !== "vlop" ? sec(++n, "ds-size", "How big", "", `<div class="tr-tiers" role="radiogroup" aria-label="Company size">${DS_SIZE.map(([k, nm, h]) => tile("dssize", ds.size, k, nm, h)).join("")}</div>`, "Micro and small enterprises are exempt from most platform duties and from transparency reports, until twelve months after they outgrow the thresholds.") : ""}
    ${ds.tier === "vlop" ? `<p class="note ds-skipnote">Very large platforms carry every duty in the Act regardless of size, so there's no size question to answer.</p>` : ""}
    ${ds.tier ? sec(++n, "ds-est", "Where", "", `<div class="tr-tiers" role="radiogroup" aria-label="Establishment">${DS_EST.map(([k, nm, h]) => tile("dsest", ds.est, k, nm, h)).join("")}</div>`) : ""}
    ${ds.tier && x.rank >= 3 ? sec(++n, "ds-feat", "Features", "Tick all that apply", `<div class="tr-checks">${DS_FEAT.map(([k, nm, h]) => chk("feat", k, nm, h)).join("")}</div>`, "Ads, recommendations, traders and minors each bring their own articles.") :
      ds.tier ? `<p class="note ds-skipnote">${esc(dsLabel(DS_TIERS, ds.tier))} doesn't carry the platform-only duties, like ads, recommendations or minors' protections, that bring the Features questions with them, so there's none to answer here.</p>` : ""}
    ${ds.tier ? `<div class="card pol-sum tr-sum ds-sum ${ap.tone}"><div><span class="eyebrow">What applies</span><h2 class="pol-verdict">${esc(ap.h)}</h2><p class="note">${esc(ap.t)}</p></div></div>` : ""}
    ${groups.map(({g, items}) => sec(++n, "ds-g-" + g.k, g.n, `${items.filter(it => ds.ctrl[it.k]).length} of ${items.length} in place`, `<div class="tr-checks">${items.map(it => chk("ctrl", it.k, it.t, it.cite)).join("")}</div>`, g.h ? esc(g.h) + " Tick what's true today." : "Tick what's true today.")).join("")}
    ${ds.tier ? `<div class="pol-run"><button type="button" class="btn primary" data-ds="build">Build my plan</button><span class="note">${s.total} dut${s.total === 1 ? "y" : "ies"} apply · ${s.met} in place</span></div>` : ""}
  </div>`;
}
function dsReportHTML(x, ap, s){
  const tab = ["plan", "duties", "drafts"].includes(ds.tab) ? ds.tab : "plan", tone = s.crit ? "crit" : s.pct >= 80 ? "good" : "high";
  const feats = DS_FEAT.filter(f => ds.feat[f[0]]).map(f => f[3]);
  const sentence = `${esc(ap.h)}. ${s.pct}% ready${s.crit ? `, with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}` : s.total ? ", no critical gaps" : ""}.`;
  const actions = s.gaps.slice(0, 3).map(r => ({t:r.t, sub:r.fix}));
  const bench = dsBenchPct();
  return `<div class="pol-report cp-report ds-report">
    ${ds.shared ? shareBannerHTML('data-ds="unshare"') : ""}
    ${ds.ex ? `<div class="banner"><span><strong>This is an example:</strong> Pixelry, a social video platform with EU users, established in the US, partway to compliance. Start over to check your own service.</span><button type="button" class="btn sm" data-ds="reset">Start over</button></div>` : ""}
    <div class="card pol-sum tr-sum"><div class="tr-ring cp-ring ds-ring ${tone}"><b>${s.pct}%</b><span>ready</span></div>
      <div><span class="eyebrow">${esc(dsLabel(DS_TIERS, ds.tier))}${ds.size && ds.tier !== "vlop" ? " · " + esc(dsLabel(DS_SIZE, ds.size).toLowerCase()) : ""}${ds.est ? " · " + (ds.est === "eu" ? "established in the EU" : "established outside the EU") : ""}</span><div class="verdict-row" aria-live="polite"><h2 class="pol-verdict">${sentence}</h2>${gradeBadge(s.pct, "Share of applicable DSA duties in place")}</div><p class="note">${esc(ap.t)}</p>
      ${bench !== null && !ds.ex ? `<p class="bench-line">Typical for a growth-stage social media company like the built-in example (Pixelry): ${bench}% ready</p>` : ""}
        <div class="cp-kpis"><span class="pill ${s.crit ? "crit" : "good"}">${s.crit} critical gap${s.crit === 1 ? "" : "s"}</span><span class="pill">${s.met} of ${s.total} duties in place</span>${feats.length ? `<span class="pill">${esc(feats.join(" · "))}</span>` : ""}</div>
        <span class="toast" id="ds-toast" role="status" aria-live="polite"></span></div></div>
    ${actions.length ? `<ol class="pk-list gd-vacts">${actions.map(a => `<li><b>${esc(a.t)}.</b> ${esc(a.sub)}</li>`).join("")}</ol>` : ""}
    ${chapterLinkHTML("dsa")}
    <details class="ev-details"><summary>Details <span class="note">Your plan, duties and drafts</span></summary>
    <div class="card pol-tabs"><div class="card-h"><div class="segs" role="group" aria-label="Report sections">${[["plan", "Your plan", s.gaps.length], ["duties", "Duties", s.total], ["drafts", "Drafts", DS_DRAFTS.length]].map(([k, nm, c]) => `<button type="button" data-dstab="${k}" aria-pressed="${tab === k}">${nm} <span class="mono" style="opacity:.6">${c}</span></button>`).join("")}</div></div>
      <div class="card-b">${tab === "duties" ? dsReqsHTML(x, s) : tab === "drafts" ? dsDraftsHTML() : dsPlanHTML(x, s)}</div></div>
    </details>
    <p class="note">Checked against Regulation (EU) 2022/2065 in ${DS_REVIEWED}. Fines can reach 6% of worldwide annual turnover. A starting point for your legal team, not legal advice.</p>
  </div>`;
}
function dsPlanHTML(x, s){
  if(!s.gaps.length) return `<div class="card ma-none"><b>${s.total ? "Every duty that applies to your answers is in place." : "Nothing applies to your answers yet."}</b><p class="note">${s.total ? "Recheck when you add a feature, grow past the size thresholds or expand to new member states. The drafts are ready if you need them." : "Choose what kind of service you run to see which duties apply."}</p></div>`;
  return `<div class="pol-sec-h"><p class="note">Most urgent first. Each gap names the article, who usually owns it and what to do.</p></div>
    <div class="cp-gaps">${s.gaps.map((r, i) => `<article class="cp-gap"><span class="cv-gn mono">${i + 1}</span><div class="cp-gb">
      <span class="eyebrow">${esc((DS_CTRL.find(g => g.k === r.g) || {n:""}).n)}</span><h4>${esc(r.t)} ${pill(DS_SEVN[r.sev][1], DS_SEVN[r.sev][0])}</h4>
      <p>${esc(r.why)}</p><p class="cp-fix"><b>What to do.</b> ${esc(r.fix)}</p>
      ${r.kase ? `<p class="cp-case">${esc(DS_CASE[r.kase])}</p>` : ""}
      <div class="cp-gm"><span class="tag">${esc(DS_OWNERS[r.o])}</span><span class="tag mono">${esc(r.cite)}</span><button type="button" class="pol-add" data-dsfix="${r.k}">Mark as done</button></div></div></article>`).join("")}</div>`;
}
function dsDraftsHTML(){
  const k = DS_DRAFTS.some(z => z[0] === ds.draft) ? ds.draft : "sor";
  const intro = {sor:"The message a user gets with every restriction, with the fields Article 17 requires.", notice:"How people report illegal content and what happens next, as a help-center page with the internal procedure underneath.", complaints:"The internal complaint process and the out-of-court route, ready for the terms or the help center.", memo:"A summary for counsel: which tier you're in, the gaps, and the questions to settle."}[k];
  return `<div class="segs cp-dtabs" role="group" aria-label="Drafts">${DS_DRAFTS.map(([v, nm]) => `<button type="button" data-dsdraft="${v}" aria-pressed="${v === k}">${nm}</button>`).join("")}</div>
    <p class="note cp-dnote">${intro} Text in brackets is for you to fill in.</p>
    <div class="cp-draft ds-draft">${cpMd(dsDraftMd(k))}</div>
    <div class="cp-dact"><button type="button" class="btn sm" data-ds="copyd">${icon("copy")}Copy</button>${DL ? `<button type="button" class="btn sm primary" data-ds="dld"><svg><use href="#i-download"/></svg>Download</button>` : ""}<span class="toast" id="ds-dtoast" role="status" aria-live="polite"></span></div>`;
}
function dsReqsHTML(x, s){
  if(!s.reqs.length) return `<p class="note">Choose what kind of service you run to see which duties apply.</p>`;
  return DS_CTRL.map(g => ({g, rs:s.reqs.filter(r => r.g === g.k)})).filter(z => z.rs.length).map(({g, rs}) => `<section class="cp-rq"><h4>${esc(g.n)} <span class="note">${rs.filter(r => r.met).length} of ${rs.length}</span></h4>
      <ul class="tr-check">${rs.map(r => `<li class="${r.met ? "ok" : "miss"}"><span class="tr-st">${r.met ? "✓" : "○"}</span><div><b>${esc(r.t)}</b> <span class="note mono">${esc(r.cite)}</span><p>${esc(r.why)}</p></div></li>`).join("")}</ul></section>`).join("")
    + `<p class="note">Sources: ${DS_SRC.map(([nm, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(nm)}</a>`).join("; ")}. Checked in ${DS_REVIEWED}. Not legal advice.</p>`;
}

/* ---------- tracker tasks ---------- */
function tkFromDsa(){
  const x = dsCtx(ds), s = dsScore(ds, x);
  return s.gaps.map((r, i) => ({id:"ds-" + r.k, title:r.t, group:DS_SEVN[r.sev][0] === "Critical" ? "Critical" : DS_SEVN[r.sev][0] + " priority", owner:DS_OWNERS[r.o], pr:DS_SEV[r.sev] + 1, done:false, def:r.sev !== "med" || i < 12,
    labels:["trust-and-safety", "dsa", "compliance"],
    desc:[r.t, "", r.why, "", "What to do: " + r.fix, `Digital Services Act, ${r.cite}. Owner: ${DS_OWNERS[r.o]}.`, r.kase ? "Enforcement: " + DS_CASE[r.kase] : null, "",
      `From a DSA readiness check for ${ds.svc || "your service"}, made with T&S Workbench. Not legal advice.`].filter(v => v !== null).join("\n")}));
}

/* ---------- events ---------- */
function dsRerender(sel){ ds.ex = false; dsSave(); const y = window.scrollY; renderDsa(); window.scrollTo(0, y); const el = sel && document.querySelector(sel); if(el) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
function dsAct(a){
  switch(a){
    case "example": ds = Object.assign(DS_BLANK(), JSON.parse(JSON.stringify(DS_EXAMPLE))); gdReset("dsa"); dsView = null; store.set("ws:cur:dsa", null); dsSave(); renderDsa(); window.scrollTo(0, 0); return gsay("Example loaded: Pixelry, a social video platform with EU users");
    case "fromorg": ds = Object.assign(DS_BLANK(), dsFromOrg()); gdReset("dsa"); dsView = "page"; store.set("ws:cur:dsa", null); dsSave(); renderDsa(); window.scrollTo(0, 0); return gsay("Filled in from your profile. Check each answer");
    case "reset": { const snap = JSON.parse(JSON.stringify(ds)); ds = DS_BLANK(); gdReset("dsa"); dsView = null; store.set("ws:cur:dsa", null); dsSave(); renderDsa(); window.scrollTo(0, 0); withUndo("Cleared", snap, s2 => { ds = s2; dsSave(); renderDsa(); }); return focusQuiet(document.querySelector("#view h1")); }
    case "sharelink": return shareCopy("dsa", ds, {svc:ds.svc, tier:ds.tier, pct:s.pct, crit:s.crit}, $("#ds-toast"));
    case "unshare": ds.shared = false; dsSave(); return dsAct("save");
    case "build": ds.view = "report"; ds.tab = "plan"; dsSave(); renderDsa(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "guide": dsView = null; gdReset("dsa"); renderDsa(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "edit": ds.view = "setup"; dsView = "page"; dsSave(); renderDsa(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "save": { const msg = wsSaveTool("dsa", ds, dsTitle(ds)); renderDsa(); return flashIn($("#ds-toast"), msg); }
    case "tasks": return tkOpen("dsa");
    case "memo": { const md = dsMemoMd(); return offerFile(`dsa-memo-${slug(ds.svc || "service")}.md`, md, md, $("#ds-toast")); }
    case "copyd": return copyText(dsDraftMd(ds.draft || "sor"), $("#ds-dtoast"));
    case "dld": { const d = DS_DRAFTS.find(z => z[0] === (ds.draft || "sor")) || DS_DRAFTS[0], md = dsDraftMd(d[0]); return offerFile(`${d[2]}-${slug(ds.svc || "service")}.md`, md, md, $("#ds-dtoast")); }
  }
}
const dsHere = () => (location.hash || "").slice(1).split("/")[0] === "dsa";
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-ds],[data-dstier],[data-dssize],[data-dsest],[data-dstab],[data-dsdraft],[data-dsfix]");
  if(!b || !dsHere() || !view.contains(b)) return;
  const d = b.dataset;
  if(d.dstier) { ds.tier = d.dstier; return dsRerender(`[data-dstier="${d.dstier}"]`); }
  if(d.dssize) { ds.size = d.dssize; return dsRerender(`[data-dssize="${d.dssize}"]`); }
  if(d.dsest) { ds.est = d.dsest; return dsRerender(`[data-dsest="${d.dsest}"]`); }
  if(d.dstab) { ds.tab = d.dstab; dsSave(); renderDsa(); const t = document.querySelector(`[data-dstab="${d.dstab}"]`); if(t) t.focus(); return; }
  if(d.dsdraft) { ds.draft = d.dsdraft; dsSave(); renderDsa(); const t = document.querySelector(`[data-dsdraft="${d.dsdraft}"]`); if(t) t.focus(); return; }
  if(d.dsfix) { ds.ctrl = Object.assign({}, ds.ctrl, {[d.dsfix]:true}); ds.ex = false; dsSave(); const y = window.scrollY; renderDsa(); window.scrollTo(0, y); return gsay("Marked as done"); }
  if(d.ds) dsAct(d.ds);
});
document.addEventListener("change", e => {
  const t = e.target; if(!t || !dsHere() || !view.contains(t) || !t.closest(".ds-root")) return;
  const d = t.dataset || {};
  if(d.dsset){ const g = d.dsset, k = t.value; ds[g] = Object.assign({}, ds[g]); if(t.checked) ds[g][k] = true; else delete ds[g][k]; return dsRerender(`[data-dsset="${g}"][value="${k}"]`); }
});
document.addEventListener("input", e => { const t = e.target; if(t && t.id === "ds-svc-in" && dsHere()){ ds.svc = t.value.slice(0, 80); ds.ex = false; dsSave(); } });
// Plain-English terms the check uses, explained on hover
Object.assign(GT_MORE, {
  "Digital Services Coordinator":"The authority each EU member state names to supervise the DSA. The one in the state where you're established is yours; the Commission supervises very large platforms directly.",
  "statement of reasons":"The message the DSA requires with every restriction: what was done, the facts, the legal or terms basis, whether automation was used, and how to appeal.",
  "trusted flagger":"An organization awarded status by a Digital Services Coordinator for its expertise in spotting illegal content. Its reports get priority.",
  "very large online platform":"A platform designated by the Commission because it has 45 million or more monthly users in the EU. The heaviest DSA duties apply to it.",
  "dark pattern":"An interface design that deceives, manipulates or materially distorts users' choices. The DSA bans them on online platforms."
});
