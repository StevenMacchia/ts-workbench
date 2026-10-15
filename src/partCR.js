/* =========================================================
   CHILD-SAFETY REPORTING: when you find child sexual abuse material or an adult enticing a child, can
   you remove, preserve, report and handle the account the way the law and the child need?
   Which duties apply by market, the gaps against them, and four drafts: the first-hour procedure, a
   preservation and access policy, a law-enforcement and emergency requests procedure, and a memo for
   Legal. Nothing here describes the material; it is only ever a thing to detect, preserve and report.
   Checked against 18 U.S.C. §§ 2258A to 2258C as amended by the REPORT Act (2024), the TAKE IT DOWN Act
   (2025), the UK Online Safety Act s.66 (in force 7 April 2026), Canada's mandatory reporting Act and
   Australia's Online Safety Act, in October 2026. A starting point for counsel, not legal advice.
   Handbook chapter 12 is the long version.
   ========================================================= */
const CR_REVIEWED = "October 2026";
const CR_SRC = {
  s2258a:["18 U.S.C. § 2258A: reporting requirements of providers", "https://www.law.cornell.edu/uscode/text/18/2258A"],
  s2258b:["18 U.S.C. § 2258B: limited liability, and minimising access", "https://www.law.cornell.edu/uscode/text/18/2258B"],
  s2252a:["18 U.S.C. § 2252A: possessing or distributing the material is a crime", "https://www.law.cornell.edu/uscode/text/18/2252A"],
  s2702:["18 U.S.C. § 2702: voluntary disclosure, including emergencies", "https://www.law.cornell.edu/uscode/text/18/2702"],
  s2703:["18 U.S.C. § 2703: what each kind of legal process can require", "https://www.law.cornell.edu/uscode/text/18/2703"],
  report_act:["The REPORT Act, Pub. L. 118-59 (2024)", "https://www.govinfo.gov/app/details/PLAW-118publ59"],
  tid_act:["FTC: complying with the TAKE IT DOWN Act", "https://www.ftc.gov/business-guidance/resources/complying-take-it-down-act"],
  tid_ftc:["FTC begins enforcing the TAKE IT DOWN Act, May 2026", "https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act"],
  cybertip:["NCMEC CyberTipline", "https://www.missingkids.org/gethelpnow/cybertipline"],
  ncmec_data:["NCMEC CyberTipline data, 2025", "https://www.missingkids.org/gethelpnow/cybertipline/cybertiplinedata"],
  takeitdown:["NCMEC, Take It Down", "https://takeitdown.ncmec.org/"],
  fbi:["FBI: fraudulent emergency data requests, November 2024", "https://www.ic3.gov/CSA/2024/241104.pdf"],
  osa66:["UK Online Safety Act 2023, section 66: reporting CSEA content to the NCA", "https://www.legislation.gov.uk/ukpga/2023/50/section/66"],
  osa_regs:["The Online Safety (CSEA Content Reporting) Regulations 2026", "https://www.legislation.gov.uk/uksi/2026/268/contents/made"],
  osa_explainer:["UK Online Safety Act explainer (gov.uk)", "https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer"],
  ca_act:["Canada: An Act respecting the mandatory reporting of Internet child sexual abuse and exploitation material", "https://laws-lois.justice.gc.ca/eng/acts/I-20.7/FullText.html"],
  au_act:["Australia: Online Safety Act 2021", "https://www.legislation.gov.au/C2021A00076/latest/text"],
  dsa:["EU Digital Services Act, Article 18: notifying suspected offences that threaten life or safety", "https://eur-lex.europa.eu/eli/reg/2022/2065/oj"],
  lantern:["Tech Coalition, Lantern", "https://technologycoalition.org/programs/lantern/"],
  ncmec_cy25:["NCMEC, CyberTipline transparency report, 2025", "https://ncmec.org/content/dam/missingkids/pdfs/OJJDP-NCMEC-Transparency-CY-2025.pdf"],
  ncmec_api:["NCMEC, CyberTipline reporting API documentation", "https://report.cybertip.org/ispws/documentation/"],
  au_std:["Australia: Online Safety (Designated Internet Services and Relevant Electronic Services) Industry Standards 2024", "https://www.legislation.gov.au/F2024L00710/asmade"],
  eu_lapse:["European Parliament: voluntary detection measures will not be extended, March 2026", "https://www.europarl.europa.eu/news/en/press-room/20260325IPR39207/child-sexual-abuse-online-voluntary-detection-measures-will-not-be-extended"],
  eu_back:["eucrim: interim rules on voluntary CSAM detection reinstated until 2028", "https://eucrim.eu/news/interim-rules-on-voluntary-csam-detection-reinstated-until-2028/"],
  inhope:["INHOPE, the global network of hotlines", "https://www.inhope.org/EN"],
  iwf:["Internet Watch Foundation, services for members", "https://www.iwf.org.uk/our-technology/our-services/"],
  stopncii:["StopNCII.org", "https://stopncii.org/"],
  handbook:["T&S Handbook, chapter 12: Severe harm escalations", "https://stevenmacchia.com/ts-handbook/severe-harm-escalations/"]
};
const CR_REGIONS = [["us", "United States", "Users there, or a US company"], ["uk", "United Kingdom", ""], ["eu", "European Union", ""], ["ca", "Canada", ""], ["au", "Australia", ""], ["other", "Somewhere else", "Other markets; hotlines still apply"]];
const CR_CONTENT = [
  ["uploads", "Users upload images or video", "Posts, profiles, galleries, avatars"], ["dm_media", "Images or video in private messages", ""], ["live", "Live streams or video calls", ""],
  ["files", "File hosting or sharing", ""], ["genai", "Your product generates images or video", "Reports involving generated material rose sharply in 2025"], ["links", "Links to other sites", ""], ["text", "Text conversations", "Enticement is reportable in the US even with no image"]
];
const CR_SIZE = [["small", "Under 1 million", ""], ["mid", "1 to 10 million", ""], ["large", "10 to 100 million", ""], ["huge", "100 million or more", "The higher US penalty tier"]];
const CR_CASES = [["none", "None yet", "You'll have one before you're ready, unless you prepare now"], ["few", "A few a year", ""], ["monthly", "A few a month", ""], ["weekly", "Every week or more", ""]];
const CR_OWNERS = {legal:"Legal", ops:"T&S Ops", eng:"Engineering", product:"Product"};
const CR_SEV = {crit:3, high:2, med:1};
const CR_SEVN = {crit:["Critical", "crit"], high:["High", "high"], med:["Medium", "med"]};
const crLabel = (list, k) => (list.find(z => z[0] === k) || [])[1] || "";
const crList = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
const crHas = (d, k, v) => Array.isArray(d[k]) && d[k].includes(v);
// When an item applies. x is crCtx(d).
const CR_APPLY = {
  any:() => true, us:(d, x) => x.us, uk:(d, x) => x.uk, ca:(d, x) => x.ca, au:(d, x) => x.au, eu:(d, x) => x.eu,
  media:(d, x) => x.media, genai:(d, x) => x.genai, usmedia:(d, x) => x.us && x.media,
  abroad:(d, x) => x.uk || x.ca || x.au || x.eu || x.other, euuk:(d, x) => x.eu || x.uk, huge:(d, x) => d.size === "huge"
};
// What you have in place, grouped as the first hour runs. Each item is also a requirement: t text, sev, o owner, cite, a applies, why, fix, kase
const CR_CTRL = [
  {k:"reg", n:"Registration and the procedure", h:"Set up before the first case, because the first case arrives at night.", items:[
    {k:"r_reg", t:"Registered with NCMEC's CyberTipline as a provider", sev:"crit", o:"legal", cite:"NCMEC registration", a:"us",
      why:"NCMEC requires providers to register with the CyberTipline to submit images and video; an unregistered provider can still report by web form or phone, but without the content. More than 1,400 companies are registered, and a reporting API is available on request. A first case with no registration is a day lost.",
      fix:"Register with NCMEC before the first case, name the account owners and their backups, keep the login out of a shared inbox, and request API credentials if you expect volume."},
    {k:"r_sop", t:"A written first-hour procedure: stop the harm, preserve, confirm, report, record", sev:"crit", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"These cases are rare for any one team and enormous in total: 21.3 million CyberTipline reports in 2025. Most teams meet their first at night, under pressure, with whoever is on shift. The order matters, and it has to be written down.",
      fix:"Use the draft procedure in this report: five steps in order, with who does each and what gets logged."},
    {k:"r_owner", t:"A named owner and a backup reachable around the clock, weekends included", sev:"crit", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"A protocol that only works when the right person happens to be online isn't a protocol. In the tabletop's emergency scenario it works only because the head of safety is online at 23:10 on a Saturday.",
      fix:"Set an on-call rota with a lead and a backup for every shift, including holidays, and write down what the on-call lead may decide alone."},
    {k:"r_asap", t:"Reports go out as soon as reasonably possible, with the time logged", sev:"high", o:"ops", cite:"§ 2258A(a)(1)", a:"us",
      why:"The US standard is “as soon as reasonably possible” after obtaining actual knowledge. A median of six hours can hide a p90 of three days because weekend cases wait for a specialist.",
      fix:"Log the time of confirmation and the time of filing on every case, and track both at p50 and p90, weekends included."},
    {k:"r_scope", t:"Enticement, sextortion of a minor and child sex trafficking are reported, not only images", sev:"crit", o:"legal", cite:"§ 2258A(a), REPORT Act", a:"us",
      why:"Since the 2024 REPORT Act, apparent online enticement and child sex trafficking must be reported the same way as images. Enticement reports rose 158% in 2025, partly for that reason. Financial sextortion is reported as enticement.",
      fix:"Add enticement and sextortion to the procedure, with the full conversation in the report, and train reviewers that a case with no image is still reportable."},
    {k:"r_full", t:"Reports carry the context: who, where, the conversation and the files", sev:"high", o:"ops", cite:"§ 2258A(b)", a:"us",
      why:"Most of a report's contents are left to the provider's discretion. NCMEC passes reports to law enforcement, and a fast, thin report helps nobody: NCMEC says more than 10% of the industry's 2025 reports contained inadequate information.",
      fix:"Include the account details, location signals, the full conversation for enticement and the files themselves, through the registered channel."},
    {k:"r_minor", t:"A path for cases where the person who shared it is also a minor: still reported, Legal in the loop", sev:"med", o:"legal", cite:"§ 2258A", a:"us",
      why:"The US duty to report doesn't depend on the age of the person who shared it. Reviewers who are unsure stall, and the clock keeps running.",
      fix:"Write the rule down: report, bring Legal in straight away, and never hold the report past “as soon as reasonably possible”."},
    {k:"r_uk", t:"UK: child sexual exploitation and abuse content you detect is reported to the National Crime Agency, unless already reported to NCMEC", sev:"crit", o:"legal", cite:"OSA s.66, from 7 April 2026", a:"uk",
      why:"Since 7 April 2026 the UK's Online Safety Act requires user-to-user services to report CSEA content they detect to the NCA: all such content for UK providers, and UK-linked content for others. Content already reported to an equivalent foreign agency such as NCMEC is exempt.",
      fix:"Decide with Legal which of your reports go to NCMEC and which to the NCA, set up the NCA route under the 2026 regulations, and record which path each case took."},
    {k:"r_ca", t:"Canada: web addresses of suspected material reported to the Canadian Centre for Child Protection, police notified and data preserved for 21 days", sev:"crit", o:"legal", cite:"S.C. 2011, c. 4, ss. 2 to 4", a:"ca",
      why:"Canada's mandatory reporting Act requires providers to report addresses where such material may be available to C3P, to notify police when they have reasonable grounds to believe an offence used their service, and to preserve the data for 21 days after notifying.",
      fix:"Add the C3P report, the police notification and the 21-day preservation to the procedure for Canadian cases."},
    {k:"r_au", t:"Australia: eSafety removal notices answered within 24 hours, and the codes and standards applied", sev:"high", o:"legal", cite:"Online Safety Act 2021, s.65", a:"au",
      why:"Australia's Online Safety Act gives eSafety removal notices with a 24-hour clock, and the 2024 industry standards for designated internet services and relevant electronic services require detection of known child sexual abuse material where technically feasible, with carve-outs for encryption. In April 2026 eSafety sent legally enforceable notices to the biggest games asking what they do about grooming and sexual extortion.",
      fix:"Name who answers an eSafety notice inside 24 hours, and check which code or standard covers your service and what it requires you to detect."},
    {k:"r_map", t:"Reporting duties mapped for every market you serve", sev:"high", o:"legal", cite:"By market", a:"abroad",
      why:"Duties differ by market: a US report to NCMEC, a UK report to the NCA, a Canadian report to C3P, Australian notices, and in the EU a duty to notify authorities of suspected offences that threaten life or safety. One procedure has to say which applies to which case.",
      fix:"Use the memo in this report as the starting list, and have Legal confirm each duty and the route for it."}]},
  {k:"pres", n:"Preservation and access", h:"The evidence, kept safely, seen by few.", items:[
    {k:"p_1y", t:"What you reported, and related data, is preserved for one year", sev:"crit", o:"eng", cite:"§ 2258A(h)", a:"us",
      why:"A completed report counts as a request to preserve what you reported, and related files and data that may give context about the material or the person, for one year. The REPORT Act raised it from 90 days. A 90-day setting is now a gap.",
      fix:"Set preservation to one year from the report, cover the related data, and extend when legal process asks."},
    {k:"p_secure", t:"Preserved material sits in a separate secure store, in line with the NIST Cybersecurity Framework", sev:"high", o:"eng", cite:"§ 2258A(h)(6)", a:"any",
      why:"US law requires preserved material to be kept in a secure location with access limited to what compliance needs, and stored in line with the current NIST framework. It's good practice everywhere: this is the most sensitive data you hold.",
      fix:"Put preserved material in its own store, separate from production, encrypted, with its own access controls and audit log."},
    {k:"p_access", t:"Access is limited to named people, and logged", sev:"crit", o:"eng", cite:"§ 2258B(c)", a:"any",
      why:"US providers must minimise the number of employees with access to material provided in a report. Every person with access is someone who sees this material; the fewer the better, for them and for you.",
      fix:"Name the people with access, review the list quarterly, and log every view."},
    {k:"p_nocopy", t:"A rule against copies: no screenshots, downloads, forwarding or pasting into tickets", sev:"crit", o:"ops", cite:"§ 2252A", a:"any",
      why:"The only copies are the preserved one and the one sent with the report. Possessing or distributing the material is a serious crime, and the legal protection for providers covers reporting and preserving, not passing it around, even to a colleague, a lawyer or the police.",
      fix:"Escalate with a link to the case in the restricted tool. Any disclosure to police goes through Legal over a secure channel, through NCMEC or through legal process."},
    {k:"p_destroy", t:"Kept beyond a year only for the lawful reasons, and destroyed when law enforcement asks", sev:"med", o:"legal", cite:"§ 2258A(h), § 2258B(c)(2)", a:"us",
      why:"Material may be kept longer than a year to reduce or prevent online child sexual exploitation or where legal process requires it. If law enforcement asks a provider to destroy the images, it must.",
      fix:"Write the two reasons for keeping longer into the policy, and a destruction step that logs who asked and when."},
    {k:"p_hash", t:"Confirmed material is blocked by hash from being uploaded again", sev:"high", o:"eng", cite:"Handbook ch. 12", a:"media",
      why:"Taking it down once isn't enough if it can come straight back. The hash is the one thing you can keep without keeping the material.",
      fix:"Hash confirmed material at confirmation and block matches at upload, on every surface."}]},
  {k:"find", n:"Finding it", h:"No US duty to monitor, but once you know, you must report.", items:[
    {k:"d_hash", t:"Hash matching against a trusted list at upload", sev:"crit", o:"eng", cite:"Ofcom codes; § 2258C", a:"media",
      why:"Known material is the one thing you can stop before anyone sees it. Ofcom's codes expect hash matching from larger services and from any service at high risk of hosting it. NCMEC runs four voluntary hash-sharing lists (12.2 million hashes in the non-governmental list at the end of 2025, used by 78 providers) and the IWF gives members an image hash list. A match is also the start of the reporting clock.",
      fix:"Join a hash-sharing list from NCMEC, the IWF or another hotline, match at upload, block and preserve matches, and send them to the procedure."},
    {k:"d_report", t:"A child-safety report option users can find, routed to the specialist queue", sev:"high", o:"product", cite:"Handbook ch. 12", a:"any",
      why:"Most first cases arrive as a report from a user or a parent. If it lands in the general queue, it waits behind spam.",
      fix:"Add a child-safety reason to every report flow and route it to the restricted queue first."},
    {k:"d_genai", t:"Generated images and video are checked, and reports of AI-made material follow the same path", sev:"high", o:"eng", cite:"NCMEC 2025 data", a:"genai",
      why:"NCMEC received more than 400,000 reports involving generative AI in 2025. Material made with a model is reported the same way, and a product that generates images needs a filter on the way out and a report path for what gets through.",
      fix:"Filter generation requests and outputs, hash-match outputs, and treat a report of generated material exactly like any other."},
    {k:"d_class", t:"A classifier for new material and enticement patterns, with people deciding", sev:"med", o:"eng", cite:"Handbook ch. 12", a:"media", opt:1,
      why:"Hashes find known material. New material and conversations need a classifier, with a trained specialist confirming before anything is reported or any user-facing action is taken.",
      fix:"Add a classifier as a second signal once the queue and the specialists are in place, never as the decider."}]},
  {k:"le", n:"Danger and law enforcement", h:"A child in danger first; a verified request before any disclosure.", items:[
    {k:"l_urgent", t:"A child in immediate danger goes to law enforcement straight away, and the report is flagged urgent", sev:"crit", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"NCMEC escalated more than 53,000 reports to law enforcement as urgent or involving a child in imminent danger in 2025. A call to the police never replaces the report; both happen at once.",
      fix:"Put the danger check first in the procedure, with the number to call and the flag to set."},
    {k:"l_single", t:"One address for law-enforcement requests, logged by type, agency, country and time", sev:"high", o:"legal", cite:"Handbook ch. 12", a:"any",
      why:"Requests that arrive in five inboxes get five answers. One place and one log is how you know what you disclosed and why.",
      fix:"Publish one address and an emergency line, share it with agencies in advance, and log every request."},
    {k:"l_verify", t:"Emergency requests are verified by calling the agency back on a number you found yourself", sev:"crit", o:"legal", cite:"FBI notification, Nov 2024", a:"any",
      why:"In November 2024 the FBI warned that criminals were using compromised government email accounts to send fraudulent emergency data requests. Urgency is the attack.",
      fix:"Before any emergency disclosure: call back on an independently found number, confirm the officer and agency, ask why it can't wait for process, and send only to an official channel."},
    {k:"l_emerg", t:"A written emergency disclosure procedure, with who may decide at 2am", sev:"high", o:"legal", cite:"§ 2702(b)(8), (c)(4); DSA Art. 18", a:"any",
      why:"In the US a provider may disclose to a government entity when it believes in good faith that an emergency involving danger of death or serious injury requires it: permission, not a duty, so it needs a trained person and a procedure. In the EU a hosting service that becomes aware of a suspected offence threatening life or safety must promptly inform the authorities.",
      fix:"Use the draft procedure in this report, name the on-call lead who may decide, and bring Legal in straight after."},
    {k:"l_legal", t:"Legal reviews every routine request for validity and scope", sev:"med", o:"legal", cite:"§ 2703", a:"any",
      why:"A subpoena, a court order and a warrant reach different data. Legal narrows requests that ask for too much and records the outcome: disclosed, narrowed or rejected.",
      fix:"Route every non-emergency request to Legal, and record the outcome of each."},
    {k:"l_lantern", t:"Cross-platform signal sharing considered", sev:"med", o:"ops", cite:"Tech Coalition", a:"any", opt:1,
      why:"Offenders work across services. The Tech Coalition's Lantern program lets 41 participating companies share signals about online child sexual exploitation and abuse, such as repeated unsolicited contact with minors; about two million signals were shared from 2023 to 2025.",
      fix:"If you're eligible, join. If not yet, structure your investigation records so you could share well-formed signals later."}]},
  {k:"acct", n:"The account", h:"The content decision is fixed. The account is the judgment call.", items:[
    {k:"a_cut", t:"The account can't reach minors the moment a case is confirmed", sev:"crit", o:"product", cite:"Handbook ch. 12", a:"any",
      why:"Whatever you decide about the account, the first move is the same: no messages, requests, gifts or new private channels with minors, and no uploads.",
      fix:"Build a restriction that cuts every path to minors in one action, separate from a ban."},
    {k:"a_decide", t:"Ban visibly or restrict quietly is decided on purpose, with an owner and an end date", sev:"high", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"A reflex ban tells the offender they've been found. They move the child elsewhere, destroy evidence or come back on a fresh account with none of the history that flagged them. A quiet restriction needs an owner so it isn't forgotten.",
      fix:"Write the two options and when each fits into the procedure, and record the decision and its reason on every case."},
    {k:"a_network", t:"Linked accounts are mapped before the account is tipped off", sev:"med", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"Shared devices, payment details, sign-up patterns, gift history and who the account contacted. In the tabletop's gifting scenario one parent's report leads to forty child accounts and six linked adult accounts.",
      fix:"Give investigators the signals to follow and a checklist to work through before a visible action."},
    {k:"a_record", t:"A case record that answers “why this account?”", sev:"high", o:"legal", cite:"Handbook ch. 12", a:"any",
      why:"Every severe case may be questioned by a court, a regulator or a parent: why this account, why the wait, why that disclosure? The answer has to be in a record written at the time, under the same access controls as the material.",
      fix:"Use the case record fields in the draft procedure, and keep the record with the preserved material."}]},
  {k:"vic", n:"The person harmed", h:"Fast, shame-free, and with a way to get the images down.", items:[
    {k:"v_tid", t:"Take It Down for under-18s, and StopNCII for adults, surfaced where a report is made", sev:"high", o:"product", cite:"NCMEC Take It Down", a:"media",
      why:"NCMEC's Take It Down lets a minor, or an adult who was under 18 in the image, hash it on their own device so participating platforms can block it; only the hash leaves the device. StopNCII, run by the Revenge Porn Helpline, does the same for adults. The teen needs to hear it exists at the moment they report.",
      fix:"Link Take It Down and StopNCII in the report flow and in every response to a sextortion report, and join Take It Down's hash sharing if you host images."},
    {k:"v_48h", t:"A notice-and-removal process for intimate images: a valid request, removal within 48 hours, copies too", sev:"crit", o:"legal", cite:"TAKE IT DOWN Act, enforced since 19 May 2026", a:"usmedia",
      why:"Covered platforms must run a process that removes a non-consensual intimate image, including one made with AI, within 48 hours of a valid request, and make reasonable efforts to remove known copies. The FTC began enforcing on 19 May 2026 and wrote to platforms that day.",
      fix:"Publish the process, define a valid request, build the 48-hour clock into the queue, and hash the image to find copies."},
    {k:"v_crisis", t:"Crisis resources and “don't pay” guidance in the response to a sextortion report", sev:"high", o:"product", cite:"Handbook ch. 12", a:"any",
      why:"A teen being extorted needs three things fast: this isn't your fault, don't pay, and here's help. Flag any suicide risk in the CyberTipline report, and have someone on call who can make an emergency referral.",
      fix:"Write the response once, in plain words, and put it in the reviewer's hands as a template with the crisis line for each market."},
    {k:"v_hotlines", t:"National hotlines known and used in markets without a NCMEC route", sev:"med", o:"ops", cite:"INHOPE network", a:"abroad",
      why:"INHOPE's network has 58 hotlines in 53 countries. The IWF in the UK, C3P in Canada and eSafety in Australia take reports, and some provide hash lists to members. Knowing which hotline covers which market is part of the procedure.",
      fix:"List the hotline for each market in the procedure, with who files and how."}]},
  {k:"ppl", n:"People", h:"Trained, few, supported, and tested out of hours.", items:[
    {k:"w_spec", t:"Trained child-safety specialists in a restricted queue", sev:"crit", o:"ops", cite:"§ 2258B(c); Handbook ch. 14", a:"any",
      why:"Confirming apparent child sexual exploitation and filing the report is a specialist's job. A hash match can be confirmed quickly; new material needs expert review and is often more urgent.",
      fix:"Name the specialists, train them on the procedure and the law in each market, and keep the queue restricted."},
    {k:"w_limits", t:"Exposure limits, rotation and counselling, and nobody reviews this material alone", sev:"high", o:"ops", cite:"Handbook ch. 14", a:"any",
      why:"The people who do this work need limits on how much they see in a day, rotation out of it, access to support, and company. The same rules you would want for anyone looking at the worst material there is.",
      fix:"Set a daily limit, a rotation, paid counselling, and a rule that nobody handles a case alone."},
    {k:"w_test", t:"The protocol tested out of hours, with the people who would really be on call", sev:"high", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"Run your own version of the Saturday-night scenario on a weekend. If it works only because one person was online, you've learned the most important thing.",
      fix:"Run a tabletop on a weekend or an evening, log how long each step took, and fix what depended on one person."},
    {k:"w_train", t:"Training refreshed at least once a year, including the law in each market", sev:"med", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"The law moved in 2024, 2025 and 2026. Reviewers trained once will report less than they must.",
      fix:"Refresh the training yearly and after any change in a duty, and record who took it."},
    {k:"w_review", t:"Every severe case reviewed afterwards: what would have stopped it earlier", sev:"med", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"A short, blameless review after every top-tier case: when the first signal appeared, whether the protocol worked out of hours, whether the report was complete, and what default or rule would have stopped it earlier.",
      fix:"Schedule the review when the case closes, and feed the last answer back to product and detection."}]},
  {k:"meas", n:"Measurement and transparency", h:"The numbers that show it works.", items:[
    {k:"m_time", t:"Time from confirmation to report at p50 and p90, weekends included", sev:"med", o:"ops", cite:"Handbook ch. 12", a:"any",
      why:"The median hides the weekend. Track both, and the time to first action on life-at-risk cases.",
      fix:"Log confirmation and filing times on every case and report both percentiles monthly."},
    {k:"m_count", t:"Reports and law-enforcement orders counted for transparency reporting", sev:"med", o:"legal", cite:"DSA Art. 15; OSA s.77", a:"euuk",
      why:"The DSA requires transparency reports to include the number of orders received from Member States' authorities, and Ofcom's transparency notices to categorised services ask for more.",
      fix:"Count reports filed, orders received and requests by type and outcome from day one, so the transparency report doesn't start from zero."},
    {k:"m_complete", t:"Completeness of reports tracked", sev:"med", o:"ops", cite:"Handbook ch. 12", a:"any", opt:1,
      why:"A report with the account, the location signals, the conversation and the files is one law enforcement can act on. Sample them.",
      fix:"Sample a few reports a month against a completeness checklist."}]}
];
const CR_BLANK = () => ({svc:"", regions:[], content:[], size:"", cases:"", ctrl:{}, view:"setup", tab:"plan", draft:"sop", ex:false});
// Pixelry: US, UK and EU users, uploads and private media, registered and partway through the procedure, preservation still at 90 days
const CR_EXAMPLE = {svc:"Pixelry", regions:["us", "uk", "eu"], content:["uploads", "dm_media", "live", "links", "text"], size:"mid", cases:"few",
  ctrl:{r_reg:true, r_sop:true, r_asap:true, r_full:true, p_access:true, p_hash:true, d_hash:true, d_report:true, l_single:true, l_legal:true, a_cut:true, v_crisis:true, w_spec:true, m_count:true},
  view:"report", tab:"plan", draft:"sop", ex:true};
let cr = Object.assign(CR_BLANK(), store.get("cr", null) || {});
const crSave = () => store.set("cr", cr);
const crTitle = d => "Child-safety reporting: " + (d.svc || "Untitled service");
let crView = null;
shareRegister("reporting", d => { cr = Object.assign(CR_BLANK(), d, {shared:true}); crView = null; crSave(); });

/* ---------- working it out ---------- */
function crCtx(d){
  const R = k => crHas(d, "regions", k), C = k => crHas(d, "content", k);
  return {us:R("us"), uk:R("uk"), eu:R("eu"), ca:R("ca"), au:R("au"), other:R("other"),
    media:C("uploads") || C("dm_media") || C("live") || C("files") || C("genai"), genai:C("genai"), text:C("text"), any:(d.regions || []).length > 0};
}
function crApplies(d, x){
  x = x || crCtx(d);
  if(!x.any) return {lvl:"", h:"Tell us where your users are", t:"Choose your markets to see which reporting duties apply.", tone:""};
  const abroad = [x.uk && "the UK", x.ca && "Canada", x.au && "Australia"].filter(Boolean);
  if(x.us) return {lvl:"us", h:"The US reporting duty applies", t:`Once you have actual knowledge of apparent child sexual abuse material, online enticement or child sex trafficking, you must report it to NCMEC's CyberTipline as soon as reasonably possible and preserve what you reported for a year. There's no duty to monitor; the duty starts when you know.${abroad.length ? ` ${crList(abroad).replace(/^the /, "The ")} add${abroad.length === 1 ? "s" : ""} duties of ${abroad.length === 1 ? "its" : "their"} own.` : ""}`, tone:"high"};
  if(abroad.length) return {lvl:"other", h:`Reporting duties apply in ${crList(abroad)}`, t:"Each market has its own route: the National Crime Agency in the UK, the Canadian Centre for Child Protection in Canada, eSafety's notices and codes in Australia. The procedure, the preservation and the people are the same work wherever the report goes.", tone:"high"};
  if(x.eu) return {lvl:"eu", h:"No provider reporting duty yet in the EU, but the process is still needed", t:"EU law has no general duty for providers to report this material to authorities yet, though a hosting service must promptly inform the authorities of a suspected offence that threatens someone's life or safety. Voluntary detection in private messages lapsed in April 2026 and was reinstated to run to April 2028, with end-to-end encrypted channels excluded. Cases will still land, hotlines still take reports. Prepare as if the duty were already there.", tone:"med"};
  return {lvl:"watch", h:"No reporting duty we track applies, but cases will still land", t:"We cover the US, UK, EU, Canadian and Australian duties. Wherever you are, the first case still needs a procedure, preservation, trained people and a hotline to report to.", tone:"good"};
}
const crApplyFn = a => typeof a === "function" ? a : CR_APPLY[a];
const crItemOn = (it, d, x) => x.any && crApplyFn(it.a)(d, x);
function crReqs(d, x){
  const out = [];
  CR_CTRL.forEach(g => g.items.forEach(it => { if(crItemOn(it, d, x)) out.push(Object.assign({g:g.k}, it, {met:!!d.ctrl[it.k]})); }));
  return out;
}
function crScore(d, x){
  x = x || crCtx(d);
  const reqs = crReqs(d, x), counted = reqs.filter(r => !r.opt), met = counted.filter(r => r.met).length;
  const gaps = counted.filter(r => !r.met).sort((a, b) => CR_SEV[b.sev] - CR_SEV[a.sev]);
  return {reqs, total:counted.length, met, pct:counted.length ? Math.round(met / counted.length * 100) : 0, gaps, crit:gaps.filter(r => r.sev === "crit").length};
}
function crBenchPct(){ try{ const d = Object.assign(CR_BLANK(), CR_EXAMPLE); return crScore(d, crCtx(d)).pct; }catch(e){ return null; } }
// The US penalty for knowing and willful failure to report, by size (§ 2258A(e))
const crPenalty = d => d.size === "huge" ? "up to $850,000 for a first failure and $1 million after that, for a provider with 100 million or more monthly users" : "up to $600,000 for a first failure and $850,000 after that, for a provider with fewer than 100 million monthly users";
// The duties by market, for the Duties tab and the memo
function crDuties(d, x){
  x = x || crCtx(d);
  const out = [];
  if(x.us) out.push({k:"us", n:"United States", law:"18 U.S.C. § 2258A, as amended by the REPORT Act (2024); the TAKE IT DOWN Act (2025)", src:["s2258a", "report_act", "tid_act"],
    pts:["Report apparent child sexual abuse material, online enticement of a minor and child sex trafficking to NCMEC's CyberTipline as soon as reasonably possible after obtaining actual knowledge.", "No duty to monitor or search for it; the duty starts when you know.",
      "A completed report is a request to preserve what you reported, and related data, for one year, in a secure location with access limited to what compliance needs.", `Knowing and willful failure to report: ${crPenalty(d)}.`,
      "Minimise the number of employees with access to the material; the legal protection covers reporting and preserving, not passing it around.",
      ...(x.media ? ["Covered platforms must run a notice-and-removal process for non-consensual intimate images, including AI-made ones, and remove within 48 hours of a valid request. Enforced by the FTC since 19 May 2026."] : [])]});
  if(x.uk) out.push({k:"uk", n:"United Kingdom", law:"Online Safety Act 2023, section 66, in force 7 April 2026; Ofcom's illegal content codes", src:["osa66", "osa_regs", "osa_explainer"],
    pts:["User-to-user services must report child sexual exploitation and abuse content they detect to the National Crime Agency: all such content for UK providers, UK-linked content for others.", "Content already reported to an equivalent foreign agency such as NCMEC under existing arrangements is exempt.", "The search-service limbs of the duty aren't in force yet.",
      "Ofcom's codes expect hash matching from larger services and any service at high risk of hosting the material, and a named person accountable for illegal content duties."]});
  if(x.ca) out.push({k:"ca", n:"Canada", law:"An Act respecting the mandatory reporting of Internet child sexual abuse and exploitation material (S.C. 2011, c. 4)", src:["ca_act"],
    pts:["Report web addresses where such material may be publicly available to the Canadian Centre for Child Protection.", "Notify police when there are reasonable grounds to believe an offence involving the material was committed using your service.", "Preserve the related data for 21 days after notifying police. Amendments that would extend preservation to one year aren't in force yet."]});
  if(x.au) out.push({k:"au", n:"Australia", law:"Online Safety Act 2021; the Basic Online Safety Expectations; industry codes and standards", src:["au_act", "au_std"],
    pts:["Answer an eSafety removal notice within 24 hours unless eSafety allows longer.", "The 2024 industry standards for designated internet services and relevant electronic services require detection of known child sexual abuse material where technically feasible, with carve-outs for encryption; other codes and standards cover other service types.", "In April 2026 eSafety sent legally enforceable notices to the biggest games asking what they do about grooming and sexual extortion."]});
  if(x.eu) out.push({k:"eu", n:"European Union", law:"Digital Services Act, Article 18; the interim regulation on voluntary detection", src:["dsa", "eu_lapse", "eu_back"],
    pts:["No general duty on providers to report this material to authorities yet; the proposed child sexual abuse regulation is still being negotiated.", "A hosting service that becomes aware of information giving rise to a suspicion of a criminal offence involving a threat to someone's life or safety must promptly inform the authorities of the Member State concerned.", "Voluntary detection in interpersonal communications: the interim regulation lapsed after 3 April 2026 when Parliament declined to extend it, and was reinstated in July 2026 to run to 3 April 2028, excluding end-to-end encrypted communications. Confirm the current text with Legal before relying on it.", "Transparency reports must include the number of orders received from Member States' authorities."]});
  if(x.other || !out.length) out.push({k:"other", n:"Other markets", law:"National hotlines in the INHOPE network", src:["inhope", "handbook"],
    pts:["Most countries have a hotline that takes reports of this material and passes them to police; INHOPE's network has 58 hotlines in 53 countries.", "The procedure, the preservation and the people are the same work wherever the report goes."]});
  return out;
}
// Starting answers from a pre-mortem
function crFromPM(src){
  const p = src.p, F = k => (p.features || []).includes(k), D = k => !!((p.done || {})[k]), content = [], ctrl = {};
  if(F("media") || F("profiles")) content.push("uploads"); if(F("dm") && F("media")) content.push("dm_media"); if(F("live") || F("voice")) content.push("live"); if(F("files")) content.push("files"); if(F("ai_gen")) content.push("genai"); if(F("links")) content.push("links"); if(F("dm") || F("posts") || F("groups")) content.push("text");
  if(D("csam_reporting")){ ctrl.r_reg = true; ctrl.r_sop = true; } if(D("csam_review")){ ctrl.w_spec = true; ctrl.p_access = true; } if(D("takeitdown")) ctrl.v_tid = true; if(D("report_btn")) ctrl.d_report = true;
  const regions = (p.regions || []).filter(r => CR_REGIONS.some(z => z[0] === r)); if((p.regions || []).some(r => !CR_REGIONS.some(z => z[0] === r))) regions.push("other");
  return {svc:(p.name || "").replace(" (example)", "").replace(" (draft)", ""), regions, content, size:{small:"small", mid:"mid", large:"large"}[p.scale] || "", cases:"", ctrl, view:"setup"};
}
// Starting answers from the workspace profile
function crFromOrg(){
  const o = typeof orgGet === "function" ? orgGet() : {}, regions = (o.regions || []).filter(r => CR_REGIONS.some(z => z[0] === r));
  if((o.regions || []).some(r => !CR_REGIONS.some(z => z[0] === r))) regions.push("other");
  return {regions, view:"setup"};
}

/* ---------- drafts ---------- */
function crSopMd(){
  const d = cr, x = crCtx(d), svc = d.svc || "[service name]", L = [];
  L.push(`# Child sexual exploitation: the first hour at ${svc}`, "", "**Owner:** [name and role] · **Backup:** [name] · **On-call line:** [number] · **Agreed with Legal:** [date] · **Last tested out of hours:** [date]", "",
    "## Before the first case", ...(x.us ? ["- Registered with NCMEC's CyberTipline; account owners: [names]. Reports go through the registered channel, with the content."] : []),
    ...(x.uk ? ["- The route to the National Crime Agency under the Online Safety Act is set up; Legal has decided which cases go to NCMEC and which to the NCA."] : []),
    ...(x.ca ? ["- The route to the Canadian Centre for Child Protection is set up, with the police notification and 21-day preservation step."] : []),
    ...(x.au ? ["- Who answers an eSafety removal notice inside 24 hours: [name]."] : []),
    "- Trained specialists: [names]. Restricted queue: [tool]. Preserved material store: [location], access list reviewed [quarterly].", "",
    "## Who decides what", "", "| Decision | Who makes it |", "|---|---|", "| Restrict an account and preserve its data | Any trained reviewer, straight away |", "| Confirm apparent child sexual exploitation and file the report | A trained child-safety specialist |",
    "| Ban visibly or restrict quietly | The child-safety lead, with Legal when law enforcement is involved |", "| Refer to emergency services, or disclose data in an emergency | The on-call lead, following the written procedure |", "| Respond to subpoenas, court orders and warrants | Legal |", "",
    "## The first hour, in order", "", "| Step | Done by | Logged |", "|---|---|---|",
    "| 0. Is a child in immediate danger? If so, contact law enforcement now and flag the report urgent. A call never replaces the report. | On-call lead | Time, agency |",
    "| 1. Stop the harm: hide or quarantine the content (never delete before it's preserved), block it by hash, and cut the account's reach to minors. | Trained reviewer | Time |",
    "| 2. Preserve: the content, the account data and related material, in the secure store. | Trained reviewer | Location |",
    "| 3. Confirm: a trained specialist confirms. A hash match is quick; new material needs expert review and is often more urgent. | Specialist | Name, time |",
    `| 4. Report: ${x.us ? "file the CyberTipline report with the account details, location signals, the full conversation for enticement and the files" : "file the report through the route for this market"}${x.uk ? "; UK-linked content not covered by the NCMEC report goes to the NCA" : ""}${x.ca ? "; Canadian cases: C3P report and police notification" : ""}. | Specialist | Report ID, time |`,
    "| 5. Record: who did what and when, in the case record below. | Specialist | Case ID |",
    "| 6. The account: decide on purpose between a visible ban and a quiet restriction while linked accounts are mapped, with an owner and an end date. | Child-safety lead | Who decided, why |", "",
    "## Rules that don't bend", "- Never make copies. No screenshots, downloads, forwarding, pasting into tickets or email, to anyone. Escalate with a link to the case in the restricted tool.",
    "- Never delete the account or its data to make the problem go away. The evidence investigators need goes with it.",
    "- The duty to report doesn't depend on the age of the person who shared it. If unsure, bring Legal in now; don't hold the report.",
    ...(x.us ? ["- Preservation runs for one year from the report, longer only to reduce or prevent exploitation or where legal process requires; destroy when law enforcement asks."] : []), "",
    "## The person harmed", "- If a minor is being extorted: this isn't your fault, don't pay, and the images can be taken down (Take It Down). Flag any suicide risk in the report. Crisis line for this market: [number].", "",
    "## Case record (one per case, restricted access)", "Case ID · tier · what was found, where and when · who confirmed it · actions in order with times · report ID and time filed · what was preserved and where · any disclosure (what, to whom, legal basis, how verified) · account decision and reason · linked accounts found · review date and owner · lessons from the case review.");
  return L.join("\n");
}
function crPreserveMd(){
  const d = cr, x = crCtx(d), svc = d.svc || "[service name]";
  return [`# Preserved material: retention and access policy, ${svc}`, "", "**Owner:** [name and role] · **Approved by Legal:** [date] · **Next review:** [date, at least once a year]", "",
    "## Purpose", `What ${svc} keeps after a child sexual exploitation report, for how long, who can see it and how it's destroyed.${x.us ? " Written to meet 18 U.S.C. § 2258A(h) and § 2258B(c)." : ""}`, "",
    "## What is preserved", "- The content reported, the account data, and related files and data that are reasonably accessible and may give context about the material or the person.", "- The case record.", "",
    "## How long", ...(x.us ? ["- One year from the report, as a completed report is a request to preserve for that period.", "- Longer only to reduce or prevent online child sexual exploitation, or where legal process requires it. [Who approves, and the reason recorded.]", "- Destroyed when law enforcement asks, with the request logged."] : []),
    ...(x.ca ? ["- Canadian cases: 21 days after notifying police, longer only under legal process."] : []), ...(!x.us && !x.ca ? ["- [Period], set with Legal for each market; longer only under legal process."] : []), "",
    "## Where, and how it's secured", "- A separate store from production, encrypted at rest and in transit, with its own access controls and audit log, in line with the current NIST Cybersecurity Framework.", "- No copies outside the store. Hashes may be kept to block re-uploads.", "",
    "## Who can see it", "- Named people only: [names and roles]. The list is reviewed [quarterly] and kept as short as compliance allows.", "- Every view is logged. Access for any other purpose needs Legal's written approval.", "- Nobody reviews the material alone, and exposure limits apply.", "",
    "## Destruction", "- At the end of the period, or on a law-enforcement request, the material is destroyed in a way that prevents recovery, and the destruction is logged with who asked and when. The case record and hashes are kept."].join("\n");
}
function crLeMd(){
  const d = cr, x = crCtx(d), svc = d.svc || "[service name]";
  return [`# Law-enforcement and emergency requests: ${svc}`, "", "**Owner:** [Legal lead] · **Emergency responder on call:** [rota] · **One address for requests:** [email] · **Emergency line:** [number]", "",
    "## Every request", "- Arrives at one address and is logged: type, agency, country, time received, outcome.", "- Routine requests go to Legal with a target of [days]. Emergency requests go to the on-call responder with a target of [hours].", "- Requests from other countries go to Legal; what can be disclosed depends on where the data is held and whose law applies.", "",
    "## Emergency requests: verify, then share the minimum", "In November 2024 the FBI warned that criminals were using compromised government email accounts to send fraudulent emergency requests. Urgency is the attack. Every item below is answered before any data goes out.", "",
    "| Check | Answer |", "|---|---|", "| Agency phone number found independently, and call-back made | |", "| Officer name, badge or ID, and agency confirmed | |", "| Emergency described: who is at risk of death or serious injury, and why it can't wait for legal process | |",
    "| Data requested, and the minimum that addresses the emergency | |", "| Sent to an official agency channel, never a personal address | |", "| Decided by, at, and the basis recorded | |", "",
    "## The legal basis", ...(x.us ? ["- US: a provider may disclose contents or records to a government entity if it believes in good faith that an emergency involving danger of death or serious physical injury requires disclosure without delay (18 U.S.C. § 2702(b)(8), (c)(4)). Permission, not a duty: the on-call lead decides, and Legal is brought in straight after.", "- US routine process: a subpoena reaches basic subscriber records; a § 2703(d) order reaches other records; contents generally need a warrant. A preservation request means keeping records 90 days, renewable once."] : []),
    ...(x.eu ? ["- EU: a hosting service that becomes aware of a suspected criminal offence involving a threat to someone's life or safety must promptly inform the authorities of the Member State concerned, or, if unsure which, the one where it's established, or Europol (DSA Article 18). Vital interests is a lawful basis under the GDPR; health data needs an Article 9 condition."] : []),
    ...(!x.us && !x.eu ? ["- [The basis for emergency disclosure in each market, set out by Legal.]"] : []), "",
    "## Child sexual exploitation cases", `- The report to ${x.us ? "NCMEC" : "the hotline or agency for this market"} never replaces a call to the police about a child in immediate danger, and the call never replaces the report.`, "- Law enforcement gets the material through the report, through legal process, or through a disclosure Legal approves over a secure channel. Never by email, screenshot or download.", "- If an agency asks you not to alert the account holder, Legal handles it and records it. Nothing about a quiet restriction leaves a child exposed.", "",
    "## Being open about it", "- Publish how police reach you and what you need. Decide when you tell users about requests, with exceptions when an order forbids it or telling them would put someone at risk.", `- Count requests by type, country and outcome${x.eu ? "; the DSA requires the number of orders from Member States' authorities in the transparency report" : ""}.`].join("\n");
}
function crMemoMd(){
  const d = cr, x = crCtx(d), ap = crApplies(d, x), s = crScore(d, x), svc = d.svc || "[service name]", L = [];
  L.push(`# Child-safety reporting readiness: ${svc}`, "", `_Prepared ${new Date().toISOString().slice(0, 10)} with T&S Workbench, for review by counsel. Not legal advice._`, "",
    "## Summary", `**${ap.h}.** ${ap.t}`, "", s.total ? `${s.met} of ${s.total} requirements are in place (${s.pct}%), with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}.` : "No requirements apply to the answers given.", "",
    "## The service", `- Markets: ${(d.regions || []).map(r => crLabel(CR_REGIONS, r)).join(", ") || "not answered"}`, `- How content reaches us: ${(d.content || []).map(c => crLabel(CR_CONTENT, c)).join("; ") || "not answered"}`,
    `- Monthly users: ${crLabel(CR_SIZE, d.size) || "not answered"}`, `- Cases so far: ${crLabel(CR_CASES, d.cases) || "not answered"}`, "", "## Duties by market");
  crDuties(d, x).forEach(du => { L.push("", `### ${du.n}`, `_${du.law}_`, ...du.pts.map(p => "- " + p)); });
  L.push("", "## Gaps, most urgent first", "");
  if(!s.gaps.length) L.push("No gaps for the answers given.");
  s.gaps.forEach((r, i) => L.push(`${i + 1}. **${r.t}** (${CR_SEVN[r.sev][0]}; ${r.cite}; owner: ${CR_OWNERS[r.o]}). ${r.why} To fix: ${r.fix}`));
  const q = [];
  if(x.us && x.uk) q.push("Which of our reports go to NCMEC and which to the NCA, and does our NCMEC reporting count as an existing arrangement with an equivalent foreign agency under section 70?");
  if(x.us) q.push("Does our preservation cover the related files and data the statute names, and who approves keeping material beyond a year?", "Who may make an emergency disclosure at 2am, and is the written procedure enough to rely on the good-faith standard?");
  if(x.eu) q.push("What is our basis for any voluntary detection in private messages in the EU under the reinstated interim regulation, and what changes for any end-to-end encrypted channel?");
  if(x.media && x.us) q.push("Are we a covered platform under the TAKE IT DOWN Act, and does our notice-and-removal process meet the 48-hour standard for copies as well as the original?");
  if(x.genai) q.push("How do reports of generated material flow into the same procedure, and are our filters on generation documented?");
  if(d.cases === "none") q.push("We haven't had a case yet. Which of the gaps above would stop us meeting “as soon as reasonably possible” on the first one?");
  q.push("Which hotline or agency covers each market we serve, and are our duties to each written into one procedure?");
  L.push("", "## Questions for counsel", ...q.map(v => "- " + v));
  const srcs = [...new Set(crDuties(d, x).flatMap(du => du.src).concat(["s2258b", "s2252a", "s2702", "fbi", "cybertip", "ncmec_cy25", "ncmec_data", "takeitdown", "handbook"]))];
  L.push("", "## Sources", ...srcs.filter(k => CR_SRC[k]).map(k => `- ${CR_SRC[k][0]}: ${CR_SRC[k][1]}`), "", `Checked in ${CR_REVIEWED}. Not legal advice.`);
  return L.join("\n");
}
const CR_DRAFTS = [["sop", "The first hour", "first-hour-procedure"], ["preserve", "Preservation policy", "preservation-policy"], ["le", "Law-enforcement requests", "law-enforcement-requests"], ["memo", "Memo for Legal", "reporting-memo"]];
const crDraftMd = k => k === "preserve" ? crPreserveMd() : k === "le" ? crLeMd() : k === "memo" ? crMemoMd() : crSopMd();

/* ---------- page ---------- */
function crPreviewHTML(){
  const saved = cr;
  try{ cr = Object.assign(CR_BLANK(), JSON.parse(JSON.stringify(CR_EXAMPLE))); const x = crCtx(cr); return crReportHTML(x, crApplies(cr, x), crScore(cr, x)); }
  catch(e){ return ""; }
  finally{ cr = saved; }
}
function crSpec(){
  const X = () => crCtx(cr);
  const setV = (k, v) => { cr[k] = v; cr.ex = false; crSave(); };
  const multi = (id, eb, title, why, list, key, none, extra) => Object.assign({id, eb, title, why, kind:"multi", opt:true, none, opts:() => list.map(o => ({k:o[0], n:o[1], h:o[2] || ""})),
    get:() => cr[key] || [], toggle:k => setV(key, (cr[key] || []).includes(k) ? cr[key].filter(v => v !== k) : (cr[key] || []).concat(k)), clear:() => setV(key, [])}, extra || {});
  const steps = [
    {id:"svc", eb:"Your service", title:"What's the service called?", why:"It's named in the procedure, the policies and the memo for Legal.", kind:"text", opt:true, placeholder:"For example: Pixelry", max:80, get:() => cr.svc, set:v => setV("svc", v.slice(0, 80))},
    {id:"size", eb:"Size", title:"Roughly how many monthly users?", why:"The US penalty tier changes at 100 million monthly users, and UK thresholds for hash matching depend on size too.", kind:"single", opts:() => CR_SIZE.map(([k, n, h]) => ({k, n, h})), get:() => cr.size, set:k => setV("size", k)},
    {id:"cases", eb:"Cases so far", title:"Have you handled a case yet?", why:"Honest answer. The first one shows exactly which of these gaps matter.", kind:"single", opts:() => CR_CASES.map(([k, n, h]) => ({k, n, h})), get:() => cr.cases, set:k => setV("cases", k)},
    multi("regions", "Markets", "Where are your users, and where are you based?", "Each market has its own route and clock. The US duty reaches any provider with US users.", CR_REGIONS, "regions", "", {opt:false, none:""}),
    multi("content", "Content", "How does content reach your service?", "Images and video are where most reports come from, but in the US a conversation with no image is reportable too.", CR_CONTENT, "content", "None of these")
  ].concat(CR_CTRL.map(g => ({id:"ctrl-" + g.k, eb:g.n, title:`${esc(g.n)}: what do you have in place today?`, why:(g.h ? esc(g.h) + " " : "") + "Tick what's true today.", kind:"multi", opt:true, none:"None of these yet",
    skip:() => { const x = X(); return !x.any || !g.items.some(it => crItemOn(it, cr, x)); },
    opts:() => { const x = X(); return g.items.filter(it => crItemOn(it, cr, x)).map(it => ({k:it.k, n:it.t, h:it.opt ? "Optional" : ""})); },
    get:() => Object.keys(cr.ctrl || {}).filter(k => cr.ctrl[k]), toggle:k => { const c = Object.assign({}, cr.ctrl); if(c[k]) delete c[k]; else c[k] = true; setV("ctrl", c); },
    clear:() => { const c = Object.assign({}, cr.ctrl); g.items.forEach(it => delete c[it.k]); setV("ctrl", c); }})));
  const src = typeof loopSource === "function" ? loopSource() : null, org = typeof orgGet === "function" && orgGet().confirmed && (orgGet().regions || []).length;
  return {k:"reporting", tool:{name:"Child-safety reporting", icon:"flag", color:"var(--t-cr)"},
    intro:{title:"Child sexual exploitation: can you remove, preserve and report it?", lead:"Five questions, then the first hour screen by screen: which duties apply where, the gaps, and four drafts.",
      note:"Nothing here describes the material, only how to detect, preserve and report it.",
      facts:[["About 8 minutes", "One question at a time. Only the duties that apply to your markets."], ["Five markets", "US, UK, EU, Canada and Australia, with the law behind each requirement."], ["Not legal advice", `A starting point for counsel. In the US, knowing and willful failure to report is fined ${cr.size === "huge" ? "up to $850,000, then $1 million" : "up to $600,000, then $850,000"}.`]], start:"Start"},
    alt:[{n:"Answer everything on one page", run:() => { crView = "page"; renderReporting(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }}]
      .concat(org ? [{n:"Start from your workspace profile", run:() => crAct("fromorg")}] : []).concat(src ? [{n:"Start from your pre-mortem", run:() => crAct("frompm")}] : []).concat([{n:"See a finished example", run:() => crAct("example")}]),
    steps, finish:"Check my readiness",
    preview:crPreviewHTML,
    done:() => { cr.view = "report"; cr.tab = "plan"; crSave(); renderReporting(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }};
}
function renderReporting(){
  const x = crCtx(cr), ap = crApplies(cr, x), s = crScore(cr, x), report = (cr.view === "report" && x.any) || cr.ex;
  if(!report && crView !== "page") return gdRender(crSpec());
  gdCur = null;
  view.innerHTML = (report
    ? headCompact("Child-safety reporting", `${esc(cr.svc || "Your service")} · ${esc(ap.h)}`,
        reportHeaderActions({
          edit:{attrs:'data-cr="edit"', label:EDIT_ANSWERS_LABEL},
          save:{attrs:'data-cr="save"', label:wsSaveLabel("reporting", cr), icon:"save"},
          download:{attrs:'data-cr="memo"', label:"Memo for Legal", icon:"download"},
          tracker:s.gaps.length ? {attrs:'data-cr="tasks"', label:SEND_TRACKER_LABEL, icon:"send"} : null
        }, `<button type="button" class="btn sm" data-cr="sharelink">${COPY_LINK_LABEL}</button>`))
    : head("Child-safety reporting", "Find out which reporting duties apply to you when you find child sexual abuse material or an adult enticing a child, where you'd fall short in the first hour, and get the procedure, the policies and a memo for Legal, ready to edit.", "Build safely",
        `<span class="toast" id="cr-toast" role="status" aria-live="polite"></span><button type="button" class="btn sm" data-cr="example">${SEE_EXAMPLE_LABEL}</button>${x.any ? `<button type="button" class="btn sm" data-cr="reset">${START_OVER_LABEL}</button>` : ""}${typeof loopSource === "function" && loopSource() ? `<button type="button" class="btn sm" data-cr="frompm">Start from your pre-mortem</button>` : ""}`))
    + `<div class="cp-root cr-root">${report ? crReportHTML(x, ap, s) : crSetupHTML(x, ap, s)}</div>`;
}
function crSetupHTML(x, ap, s){
  const tile = (attr, cur, k, n, h) => `<button type="button" role="radio" aria-checked="${cur === k}" class="card tr-tier ${cur === k ? "on" : ""}" data-${attr}="${k}"><b>${esc(n)}</b>${h ? `<span>${esc(h)}</span>` : ""}</button>`;
  const chk = (grp, k, label, sub) => `<label class="tr-chk"><input type="checkbox" data-crset="${grp}" value="${k}" ${(grp === "ctrl" ? !!cr.ctrl[k] : crHas(cr, grp, k)) ? "checked" : ""}><span>${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ""}</span></label>`;
  const sec = (n, id, title, tag, body, tip) => `<section class="card pol-card" id="${id}"><div class="pol-h"><span class="pol-num">${n}</span><div><span class="pol-lbl">${title}</span>${tag ? `<span class="note">${tag}</span>` : ""}</div></div>${tip ? `<p class="pol-tip cp-tip">${tip}</p>` : ""}${body}</section>`;
  let n = 1, out = `<div class="banner cvt-b"><span><strong>Prefer one question at a time?</strong> The guided version asks the same things, and only what applies to your answers.</span><button type="button" class="btn sm" data-cr="guide">Switch to guided</button></div>`;
  out += sec(n++, "cr-s-svc", "Your service", "", `<div class="field"><label for="cr-svc">Service name</label><input class="input" id="cr-svc" value="${esc(cr.svc)}" placeholder="For example: Pixelry" maxlength="80" autocomplete="off"></div>
    <div class="field"><span class="lbl">Where are your users, and where are you based?</span><div class="cp-checks">${CR_REGIONS.map(([k, t, h]) => chk("regions", k, t, h)).join("")}</div></div>
    ${x.any ? `<div class="banner cp-ap ${ap.tone}"><span><strong>${esc(ap.h)}.</strong> ${esc(ap.t)}</span></div>` : ""}
    <div class="field"><span class="lbl">How does content reach your service?</span><div class="cp-checks">${CR_CONTENT.map(([k, t, h]) => chk("content", k, t, h)).join("")}</div></div>
    <div class="field"><span class="lbl">Roughly how many monthly users?</span><div class="tr-tiers cp-two" role="radiogroup" aria-label="Monthly users">${CR_SIZE.map(([k, nm, h]) => tile("crsize", cr.size, k, nm, h)).join("")}</div></div>
    <div class="field"><span class="lbl">Have you handled a case yet?</span><div class="tr-tiers cp-two" role="radiogroup" aria-label="Cases so far">${CR_CASES.map(([k, nm, h]) => tile("crcases", cr.cases, k, nm, h)).join("")}</div></div>`);
  if(x.any){ const grps = CR_CTRL.map(g => ({g, its:g.items.filter(it => crItemOn(it, cr, x))})).filter(z => z.its.length);
    if(grps.length) out += sec(n++, "cr-s-ctrl", "What you have in place", "Tick what's true today", `<div class="cp-grps">${grps.map(({g, its}) => `<div class="cp-grp"><h4>${esc(g.n)}</h4>${g.h ? `<p class="note">${esc(g.h)}</p>` : ""}${its.map(it => chk("ctrl", it.k, it.t, it.opt ? "Optional" : "")).join("")}</div>`).join("")}</div>`); }
  const tone = s.crit ? "crit" : s.pct >= 80 ? "good" : "high";
  out += `<div class="card pol-runbar">
      <div class="pol-rb-meter"><div class="pol-rb-top"><span class="eyebrow">Readiness</span>${s.total ? `<span class="pill ${tone}">${s.met} of ${s.total}</span>` : ""}</div>
        <div class="pol-meter" role="meter" aria-valuemin="0" aria-valuemax="${s.total || 1}" aria-valuenow="${s.met}" aria-label="Readiness"><i style="width:${s.pct}%;background:var(--${tone})"></i></div>
        <span class="note">${!x.any ? "Choose your markets to start." : s.crit ? `${s.crit} critical gap${s.crit === 1 ? "" : "s"} so far.` : s.total ? "No critical gaps so far." : "Nothing to check yet."}</span></div>
      <div class="pol-rb-act"><button type="button" class="btn primary" data-cr="build" ${x.any ? "" : "disabled"}>Check my readiness ${icon("arrow")}</button></div></div>
    <p class="note pol-rb-note">Everything stays in your browser. Checked against the law in each market in ${CR_REVIEWED}. Not legal advice.</p>`;
  return `<div class="pol-setup cp-setup cr-setup">${out}</div>`;
}
function crReportHTML(x, ap, s){
  const tab = ["plan", "duties", "drafts", "reqs"].includes(cr.tab) ? cr.tab : "plan", tone = s.crit ? "crit" : s.pct >= 80 ? "good" : "high";
  const sentence = `${esc(ap.h)}. ${s.pct}% ready${s.crit ? `, with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}` : s.total ? ", no critical gaps" : ""}.`;
  const actions = s.gaps.slice(0, 3).map(r => ({t:r.t, sub:r.fix}));
  const bench = crBenchPct(), duties = crDuties(cr, x);
  return `<div class="pol-report cp-report cr-report">
    ${cr.shared ? shareBannerHTML('data-cr="unshare"') : ""}
    ${cr.ex ? `<div class="banner"><span><strong>This is an example:</strong> Pixelry, a photo and short-video app with US, UK and EU users, registered and partway through the procedure. Start over to check your own service.</span><button type="button" class="btn sm" data-cr="reset">Start over</button></div>` : ""}
    <div class="card pol-sum tr-sum"><div class="tr-ring cp-ring ${tone}"><b>${s.pct}%</b><span>ready</span></div>
      <div><span class="eyebrow">${esc((cr.regions || []).map(r => crLabel(CR_REGIONS, r)).join(" · "))}</span><div class="verdict-row" aria-live="polite"><h2 class="pol-verdict">${sentence}</h2>${gradeBadge(s.pct, "Share of applicable requirements in place")}</div><p class="note">${esc(ap.t)}</p>
      ${cr.cases === "none" && s.crit ? `<p class="note"><b>You haven't had a case yet.</b> The first one arrives at night, and the critical gaps above are what it will find.</p>` : ""}
      ${bench !== null && !cr.ex ? `<p class="bench-line">Typical for a growing app with US and EU users, like the built-in example: ${bench}% ready</p>` : ""}
        <div class="cp-kpis"><span class="pill ${s.crit ? "crit" : "good"}">${s.crit} critical gap${s.crit === 1 ? "" : "s"}</span><span class="pill">${s.met} of ${s.total} requirements in place</span><span class="pill">${duties.length} market${duties.length === 1 ? "" : "s"} with duties</span></div>
        <span class="toast" id="cr-toast" role="status" aria-live="polite"></span></div></div>
    ${actions.length ? `<ol class="pk-list gd-vacts">${actions.map(a => `<li><b>${esc(a.t)}.</b> ${esc(a.sub)}</li>`).join("")}</ol>` : ""}
    ${chapterLinkHTML("reporting")}
    <details class="ev-details"${detailsOpenAttr()}><summary>Details <span class="note">Your plan, duties by market, drafts and requirements</span></summary>
    <div class="card pol-tabs"><div class="card-h"><div class="segs" role="group" aria-label="Report sections">${[["plan", "Your plan", s.gaps.length], ["duties", "Duties by market", duties.length], ["drafts", "Drafts", CR_DRAFTS.length], ["reqs", "Requirements", s.total]].map(([k, nm, c]) => `<button type="button" data-crtab="${k}" aria-pressed="${tab === k}">${nm} <span class="mono" style="opacity:.6">${c}</span></button>`).join("")}</div></div>
      <div class="card-b">${tab === "duties" ? crDutiesHTML(duties) : tab === "drafts" ? crDraftsHTML() : tab === "reqs" ? crReqsHTML(s) : crPlanHTML(s)}</div></div>
    </details>
    <p class="note">Checked against the law in each market in ${CR_REVIEWED}.${x.us ? ` In the US, knowing and willful failure to report is fined ${crPenalty(cr)}.` : ""} A starting point for your legal team, not legal advice.</p>
  </div>`;
}
function crPlanHTML(s){
  if(!s.gaps.length) return `<div class="card ma-none"><b>${s.total ? "Everything that applies to your answers is in place." : "Nothing applies to your answers yet."}</b><p class="note">${s.total ? "Test it out of hours, and recheck when a duty changes or you enter a new market." : "Choose your markets to see what applies."}</p></div>`;
  return `<div class="pol-sec-h"><p class="note">Most urgent first. Each gap names the law or the practice behind it, who usually owns it and what to do.</p></div>
    <div class="cp-gaps">${s.gaps.map((r, i) => `<article class="cp-gap"><span class="cv-gn mono">${i + 1}</span><div class="cp-gb">
      <span class="eyebrow">${esc((CR_CTRL.find(g => g.k === r.g) || {n:""}).n)}</span><h4>${esc(r.t)} ${pill(CR_SEVN[r.sev][1], CR_SEVN[r.sev][0])}</h4>
      <p>${esc(r.why)}</p><p class="cp-fix"><b>What to do.</b> ${esc(r.fix)}</p>
      <div class="cp-gm"><span class="tag">${esc(CR_OWNERS[r.o])}</span><span class="tag mono">${esc(r.cite)}</span><button type="button" class="pol-add" data-crfix="${r.k}">Mark as done</button></div></div></article>`).join("")}</div>`;
}
function crDutiesHTML(duties){
  return `<p class="note">What each of your markets requires, in plain words, with the source. Legal confirms which apply to you.</p>
    <div class="cr-duties">${duties.map(du => `<section class="card cr-duty"><h4>${esc(du.n)}</h4><p class="note">${esc(du.law)}</p><ul>${du.pts.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
      <p class="note">${du.src.filter(k => CR_SRC[k]).map(k => `<a href="${CR_SRC[k][1]}" target="_blank" rel="noopener">${esc(CR_SRC[k][0])}</a>`).join(" · ")}</p></section>`).join("")}</div>`;
}
function crDraftsHTML(){
  const k = CR_DRAFTS.some(z => z[0] === cr.draft) ? cr.draft : "sop";
  const intro = {sop:"The first hour, in order, with who decides what and the case record, filled in for your markets.", preserve:"What you keep after a report, for how long, who can see it and how it's destroyed.", le:"One address, a call-back check on every emergency request, the legal basis for each market, and sharing only what's covered.", memo:"A summary for counsel: the duties by market, the gaps and the questions to settle."}[k];
  return `<div class="segs cp-dtabs" role="group" aria-label="Drafts">${CR_DRAFTS.map(([v, nm]) => `<button type="button" data-crdraft="${v}" aria-pressed="${v === k}">${nm}</button>`).join("")}</div>
    <p class="note cp-dnote">${intro} Text in brackets is for you to fill in.</p>
    <div class="cp-draft">${cpMd(crDraftMd(k))}</div>
    <div class="cp-dact"><button type="button" class="btn sm" data-cr="copyd">${icon("copy")}Copy</button>${DL ? `<button type="button" class="btn sm primary" data-cr="dld"><svg><use href="#i-download"/></svg>Download</button>` : ""}<span class="toast" id="cr-dtoast" role="status" aria-live="polite"></span></div>`;
}
function crReqsHTML(s){
  if(!s.reqs.length) return `<p class="note">Choose your markets to see which requirements apply.</p>`;
  return CR_CTRL.map(g => ({g, rs:s.reqs.filter(r => r.g === g.k)})).filter(z => z.rs.length).map(({g, rs}) => `<section class="cp-rq"><h4>${esc(g.n)} <span class="note">${rs.filter(r => r.met).length} of ${rs.length}</span></h4>
      <ul class="tr-check">${rs.map(r => `<li class="${r.met ? "ok" : r.opt ? "na" : "miss"}"><span class="tr-st">${r.met ? "✓" : "○"}</span><div><b>${esc(r.t)}</b>${r.opt ? ` <span class="note">Optional</span>` : ""} <span class="note mono">${esc(r.cite)}</span><p>${esc(r.why)}</p></div></li>`).join("")}</ul></section>`).join("")
    + `<p class="note">Sources: ${Object.keys(CR_SRC).map(k => `<a href="${CR_SRC[k][1]}" target="_blank" rel="noopener">${esc(CR_SRC[k][0])}</a>`).join("; ")}. Checked in ${CR_REVIEWED}. Not legal advice.</p>`;
}

/* ---------- tracker tasks ---------- */
function tkFromReporting(){
  const s = crScore(cr, crCtx(cr));
  return s.gaps.map((r, i) => ({id:"cr-" + r.k, title:r.t, group:CR_SEVN[r.sev][0] === "Critical" ? "Critical" : CR_SEVN[r.sev][0] + " priority", owner:CR_OWNERS[r.o], pr:CR_SEV[r.sev] + 1, done:false, def:r.sev !== "med" || i < 12,
    labels:["trust-and-safety", "child-safety", "reporting"],
    desc:[r.t, "", r.why, "", "What to do: " + r.fix, `Basis: ${r.cite}. Owner: ${CR_OWNERS[r.o]}.`, "", `From a child-safety reporting check for ${cr.svc || "your service"}, made with T&S Workbench. Not legal advice.`].join("\n")}));
}

/* ---------- events ---------- */
function crRerender(sel){ cr.ex = false; crSave(); const y = window.scrollY; renderReporting(); window.scrollTo(0, y); const el = sel && document.querySelector(sel); if(el) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
function crAct(a){
  switch(a){
    case "example": cr = Object.assign(CR_BLANK(), JSON.parse(JSON.stringify(CR_EXAMPLE))); gdReset("reporting"); crView = null; store.set("ws:cur:reporting", null); crSave(); renderReporting(); window.scrollTo(0, 0); return gsay("Example loaded: Pixelry, with US, UK and EU users");
    case "frompm": { const src = loopSource(); if(!src) return; cr = Object.assign(CR_BLANK(), crFromPM(src)); gdReset("reporting"); crView = "page"; store.set("ws:cur:reporting", null); crSave(); renderReporting(); window.scrollTo(0, 0); return gsay("Filled in from " + src.name + ". Check each answer"); }
    case "fromorg": cr = Object.assign(CR_BLANK(), crFromOrg()); gdReset("reporting"); crView = null; store.set("ws:cur:reporting", null); crSave(); renderReporting(); gdGo(gdCur, "start"); return gsay("Markets filled in from your workspace profile");
    case "reset": { const snap = JSON.parse(JSON.stringify(cr)); cr = CR_BLANK(); gdReset("reporting"); crView = null; store.set("ws:cur:reporting", null); crSave(); renderReporting(); window.scrollTo(0, 0); withUndo("Cleared", snap, s2 => { cr = s2; crSave(); renderReporting(); }); return focusQuiet(document.querySelector("#view h1")); }
    case "sharelink": { const s = crScore(cr, crCtx(cr)); return shareCopy("reporting", cr, {svc:cr.svc, regions:cr.regions, pct:s.pct, crit:s.crit}, $("#cr-toast")); }
    case "unshare": cr.shared = false; crSave(); return crAct("save");
    case "build": cr.view = "report"; cr.tab = "plan"; crSave(); renderReporting(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "guide": crView = null; gdReset("reporting"); renderReporting(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "edit": cr.view = "setup"; crView = "page"; crSave(); renderReporting(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "save": { const msg = wsSaveTool("reporting", cr, crTitle(cr)); renderReporting(); return flashIn($("#cr-toast"), msg); }
    case "tasks": return tkOpen("reporting");
    case "memo": { const md = crMemoMd(); return offerFile(`reporting-memo-${slug(cr.svc || "service")}.md`, md, md, $("#cr-toast")); }
    case "copyd": return copyText(crDraftMd(cr.draft || "sop"), $("#cr-dtoast"));
    case "dld": { const d = CR_DRAFTS.find(z => z[0] === (cr.draft || "sop")) || CR_DRAFTS[0], md = crDraftMd(d[0]); return offerFile(`${d[2]}-${slug(cr.svc || "service")}.md`, md, md, $("#cr-dtoast")); }
  }
}
const crHere = () => hashNow().split("/")[0] === "reporting";
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-cr],[data-crsize],[data-crcases],[data-crtab],[data-crdraft],[data-crfix]");
  if(!b || !crHere() || !view.contains(b)) return;
  const d = b.dataset;
  if(d.crsize){ cr.size = d.crsize; return crRerender(`[data-crsize="${d.crsize}"]`); }
  if(d.crcases){ cr.cases = d.crcases; return crRerender(`[data-crcases="${d.crcases}"]`); }
  if(d.crtab){ cr.tab = d.crtab; crSave(); renderReporting(); const t = document.querySelector(`[data-crtab="${d.crtab}"]`); if(t) t.focus(); return; }
  if(d.crdraft){ cr.draft = d.crdraft; crSave(); renderReporting(); const t = document.querySelector(`[data-crdraft="${d.crdraft}"]`); if(t) t.focus(); return; }
  if(d.crfix){ cr.ctrl = Object.assign({}, cr.ctrl, {[d.crfix]:true}); cr.ex = false; crSave(); const y = window.scrollY; renderReporting(); window.scrollTo(0, y); return gsay("Marked as done"); }
  if(d.cr) crAct(d.cr);
});
document.addEventListener("change", e => {
  const t = e.target; if(!t || !crHere() || !view.contains(t) || !t.closest(".cr-root")) return;
  const d = t.dataset || {};
  if(d.crset){ const g = d.crset, k = t.value;
    if(g === "ctrl"){ cr.ctrl = Object.assign({}, cr.ctrl); if(t.checked) cr.ctrl[k] = true; else delete cr.ctrl[k]; }
    else { const cur = Array.isArray(cr[g]) ? cr[g] : []; cr[g] = t.checked ? [...new Set(cur.concat(k))] : cur.filter(v => v !== k); }
    return crRerender(`[data-crset="${g}"][value="${k}"]`); }
});
document.addEventListener("input", e => { const t = e.target; if(t && t.id === "cr-svc" && crHere()){ cr.svc = t.value.slice(0, 80); cr.ex = false; crSave(); } });
// Plain-English terms the check uses, explained on hover. Existing entries win.
[["CyberTipline", "NCMEC's reporting system in the US. Providers report apparent child sexual abuse material, enticement and child sex trafficking there, and NCMEC passes reports to law enforcement."],
 ["actual knowledge", "Knowing, not just suspecting. In the US the duty to report starts when a provider obtains actual knowledge of an apparent violation; there is no duty to go looking."],
 ["preservation", "Keeping the reported content and related data, securely and with limited access, so law enforcement can get it through legal process. One year in the US after a report."],
 ["emergency disclosure", "Handing data to a government entity without legal process because of a good-faith belief that an emergency involving danger of death or serious injury requires it. Permission in the US, not a duty."],
 ["hash matching", "Comparing a fingerprint of an uploaded file against a list of fingerprints of known abuse material, so known files are blocked without anyone viewing them."]
].forEach(([k, v]) => { if(typeof GT_MORE !== "undefined" && !GT_MORE[k]) GT_MORE[k] = v; });
