/* =========================================================
   T&S GLOSSARY: the plain-Trust-and-Safety terms a person new to the field meets in
   their first year at a small platform. Separate from the red-teaming glossary in
   partLearn.js (LN_GLOSS), which is specific to AI red teaming. Every legal or
   regulatory definition here was checked against a primary source before writing
   (see the research notes in the PR/report); no dates, thresholds or penalty amounts
   appear unless they were verified. Child sexual abuse is described as policy and
   process only -- no instructions, no attack strings.
   One routed page, #tsglossary. All terms show at once as a grid, with search and
   group filter chips. Terms also register into GT_MORE (partHELP.js) on first render,
   the way partRT.js lazily registers RT_TERMS, and never override an existing entry.
   ========================================================= */
const TSG_TERMS = [
  /* ---------- Policy ---------- */
  {n:"Trust and Safety (T&S)", g:"Policy", d:"The team and function that keeps a platform's users safe from abuse, fraud and harmful content, and keeps the platform itself safe from misuse. Covers policy, enforcement and the tools that support both."},
  {n:"Content moderation", g:"Policy", d:"Reviewing content or behavior against a platform's rules and deciding what stays up, what comes down, and what happens to the account. Done by people, automated systems, or both together.", r:["Classifier","Human in the loop"]},
  {n:"Policy vs. enforcement", g:"Policy", d:"Policy is the rule itself, written in plain language. Enforcement is what happens when it's broken: a warning, a removal, a suspension. The same rule can be enforced inconsistently if reviewers aren't trained the same way.", tool:"policy"},
  {n:"Community guidelines", g:"Policy", d:"The public-facing rules that tell users what's allowed on a platform. Usually simpler and friendlier than the full terms of service, but the two have to agree with each other.", r:["Terms of service"], tool:"policy"},
  {n:"Terms of service", g:"Policy", d:"The legal contract between a platform and its users. Sets out rights, responsibilities, and what the platform can do, including removing content or accounts, in terms a court will enforce.", r:["Community guidelines"]},
  {n:"Enforcement ladder", g:"Policy", d:"The set of consequences for breaking a rule, usually increasing with severity or repeat violations: warning, content removal, feature limit, temporary suspension, permanent ban.", r:["Strike","Repeat offender"]},
  {n:"Strike", g:"Policy", d:"A mark against an account for breaking a rule, often with a point value. Strikes usually expire after a set time and accumulate toward a suspension or ban.", r:["Enforcement ladder"]},
  {n:"Zero-tolerance policy", g:"Policy", d:"A rule that triggers the strongest enforcement on the first violation, with no warning or escalation ladder. Used for the most severe harms, where any instance is unacceptable."},
  {n:"Shadow ban", g:"Policy", d:"Reducing how far an account's content reaches, such as lower ranking or no recommendations, without telling the user or removing the content outright. Controversial because the person affected often doesn't know it happened."},
  {n:"Appeals", g:"Policy", d:"The process for a user to challenge an enforcement decision and ask for it to be reviewed again, ideally by someone who didn't make the first call.", tool:"dsa"},
  {n:"Repeat offender", g:"Policy", d:"An account or person who breaks the same or related rules more than once. Many enforcement ladders escalate faster for a repeat offender than for a first-time violation.", r:["Enforcement ladder"]},
  {n:"Harm taxonomy", g:"Policy", d:"The structured list of harm categories, such as hate speech, fraud or child safety, that a platform tests, measures and writes policy against. Every finding or rule should map to a line in it.", tool:"premortem"},
  {n:"Severity", g:"Policy", d:"How serious a harm is, usually graded on a fixed scale, used to prioritize review queues, decide enforcement, and compare risks that otherwise have nothing in common.", tool:"premortem"},
  {n:"Risk assessment", g:"Policy", d:"A structured review of what could go wrong with a product or feature, how likely it is, and how bad it would be, done before or after launch.", tool:"premortem"},
  {n:"Systemic risk", g:"Policy", d:"Under the EU Digital Services Act, a risk that a very large platform's design or use creates for society: things like the spread of illegal content, harm to civic discourse, or gender-based violence. Large platforms must assess and mitigate it.", r:["VLOP (very large online platform)","DSA (Digital Services Act)"], tool:"dsa"},
  {n:"Dangerous organizations and individuals", g:"Policy", d:"A policy category covering groups and people, such as terrorist, violent extremist or organized criminal groups, whose presence or promotion on a platform is banned regardless of what any single post says.", r:["TVEC (terrorist and violent extremist content)"]},
  {n:"Hate speech", g:"Policy", d:"Content that attacks or demeans people based on a protected trait such as race, religion, gender or disability. Most platforms ban it; definitions vary in exactly where they draw the line.", tool:"premortem"},
  {n:"Harassment", g:"Policy", d:"Repeated or severe unwanted contact or content aimed at a specific person, meant to intimidate, demean or distress them. Covers pile-ons, threats and targeted abuse campaigns.", tool:"premortem"},
  {n:"Doxxing", g:"Policy", d:"Publishing someone's private information, such as their home address or workplace, usually to enable harassment or put them at physical risk.", tool:"premortem"},
  {n:"Misinformation", g:"Policy", d:"False or inaccurate information shared without necessarily knowing it's false. The person sharing it may believe it's true.", r:["Disinformation"]},
  {n:"Disinformation", g:"Policy", d:"False information spread deliberately, knowing it's false, usually to deceive, manipulate opinion, or cause harm.", r:["Misinformation","Coordinated inauthentic behaviour"]},
  {n:"Spam", g:"Policy", d:"Unwanted, repetitive or irrelevant content sent at scale, usually to promote something or waste reviewers' and users' attention. Often automated.", tool:"premortem"},
  {n:"Scams", g:"Policy", d:"Deliberate deception designed to get money, personal information, or access from a victim: fake listings, romance cons, phishing, and fraudulent investment pitches.", tool:"premortem"},

  /* ---------- Operations ---------- */
  {n:"Moderation queue", g:"Operations", d:"The list of content or reports waiting for a human reviewer to look at, usually ordered by priority, severity, or how long something has waited.", r:["Backlog","Queue aging"]},
  {n:"SLA (service level agreement)", g:"Operations", d:"A commitment to act on something within a set time, such as reviewing a report within 24 hours. Missing it is an SLA breach, tracked as a sign the queue is falling behind."},
  {n:"Escalation", g:"Operations", d:"Moving a case to a more senior, specialist or differently-authorized reviewer, such as legal, child safety or a manager, because it's severe, unclear, or sensitive."},
  {n:"Trusted flagger", g:"Operations", d:"Under the EU Digital Services Act, an organization with recognized expertise that platforms must give priority and faster review to when it reports illegal content.", tool:"dsa"},
  {n:"Backlog", g:"Operations", d:"Reports or content waiting in a moderation queue longer than the target review time. A growing backlog usually means more reports are coming in than reviewers can handle.", r:["Moderation queue","SLA (service level agreement)"]},
  {n:"Queue aging", g:"Operations", d:"How long items have been sitting in a moderation queue before review. Tracked to catch a queue that's quietly falling behind its own targets.", r:["Backlog"]},
  {n:"Quality assurance (QA)", g:"Operations", d:"Checking a sample of a reviewer's or a system's decisions against what an expert believes is correct, to catch mistakes and improve consistency.", r:["Calibration","Inter-rater agreement"], tool:"metrics"},
  {n:"Calibration", g:"Operations", d:"Getting reviewers, or a reviewer and a model, to apply the same rule the same way, usually by reviewing the same cases together and discussing disagreements.", r:["Inter-rater agreement"]},
  {n:"Vendor", g:"Operations", d:"An outside company a platform pays to provide a service, such as content review staff, a classifier, or age verification, instead of building and staffing it in-house.", r:["BPO (business process outsourcing)"], tool:"vendors"},
  {n:"BPO (business process outsourcing)", g:"Operations", d:"A company that supplies outsourced staff, often moderators, customer support agents or reviewers, usually working to the hiring platform's rules and targets rather than the vendor's own.", r:["Vendor","Outsourcing"], tool:"vendors"},
  {n:"Outsourcing", g:"Operations", d:"Having an outside vendor or BPO perform a function, such as content review, instead of doing it with internal staff. Common in moderation because volume needs to scale quickly.", tool:"vendors"},
  {n:"Incident response", g:"Operations", d:"The process for handling an active crisis, such as a viral abuse campaign or a major leak, with a clear structure, defined roles, and a timeline for decisions.", r:["Tabletop exercise"], tool:"tabletop"},
  {n:"Tabletop exercise", g:"Operations", d:"A practice run of an incident response plan using a written scenario, talked through by the team as if it were really happening, without a real crisis underway.", r:["Incident response"], tool:"tabletop"},
  {n:"Pre-mortem", g:"Operations", d:"Imagining how a product or feature will be misused before it launches, so the fixes can ship with it instead of after someone gets hurt.", r:["Threat model","Harm taxonomy"], tool:"premortem"},
  {n:"Threat model", g:"Operations", d:"A description of who might attack a system or abuse a product, what they want, and what they could do, used to decide what to defend against first.", r:["Abuse vectors"], tool:"premortem"},
  {n:"Abuse vectors", g:"Operations", d:"The specific ways a bad actor could misuse a feature, such as a direct-message button being used for grooming, or a review field being used for spam.", r:["Threat model"], tool:"premortem"},
  {n:"Report (flag)", g:"Operations", d:"A user or an automated system marking content or an account for review, the usual way moderation queues get filled in the first place.", r:["Moderation queue"]},
  {n:"Bad actor", g:"Operations", d:"A person or group deliberately working around a platform's rules to cause harm, make money, or gain an advantage, as opposed to someone who breaks a rule by accident."},

  /* ---------- Detection and tooling ---------- */
  {n:"Classifier", g:"Detection and tooling", d:"A model or rule-based system trained to label content, such as spam or not spam, automatically and at scale, instead of needing a person to look at every piece.", r:["Model threshold","Labelling"], tool:"eval"},
  {n:"Model threshold", g:"Detection and tooling", d:"The confidence score above which a classifier's output triggers an action, such as removal or routing to a reviewer. Moving it trades false positives against false negatives.", r:["False positive","False negative"], tool:"eval"},
  {n:"Human in the loop", g:"Detection and tooling", d:"A design where a person reviews or can override an automated system's decision before, or sometimes after, it takes effect, instead of letting the system act alone."},
  {n:"Labelling", g:"Detection and tooling", d:"Reviewers marking examples of content with the correct answer, such as violating or not and which rule, used to train a classifier or to check one that's already running.", r:["Golden set"]},
  {n:"Golden set", g:"Detection and tooling", d:"A fixed set of cases with an agreed correct answer, used to test a classifier, a reviewer, or a new policy consistently over time, instead of grading each round against a moving target.", r:["Labelling"], tool:"eval"},
  {n:"Hash matching", g:"Detection and tooling", d:"Comparing a digital fingerprint of a file against a database of fingerprints from known violating content, so a match can be made without a person re-reviewing the same image every time it's uploaded.", r:["Perceptual hashing","PhotoDNA"]},
  {n:"Perceptual hashing", g:"Detection and tooling", d:"A way of fingerprinting an image or video so that two versions that look the same to a person, even after resizing or minor edits, still produce a matching or similar hash.", r:["Hash matching"]},
  {n:"PhotoDNA", g:"Detection and tooling", d:"A widely used hashing tool, created by Microsoft and Dartmouth College and donated to NCMEC, that matches uploads against known child sexual abuse material so it can be caught without a person viewing it again.", r:["Hash matching","NCMEC (National Center for Missing & Exploited Children)"]},
  {n:"Keyword filter", g:"Detection and tooling", d:"A system that catches content containing specific words or phrases. Simple and fast, but easy to evade with misspellings and easy to over-trigger on innocent uses of the same words."},
  {n:"Automated detection", g:"Detection and tooling", d:"Content or accounts found by a system, such as a classifier or a hash match, rather than by a user report, often catching violations before anyone sees them.", r:["Proactive rate"]},
  {n:"Over-enforcement", g:"Detection and tooling", d:"Removing or restricting content or accounts that didn't actually break a rule. Costly in a different way than under-enforcement, but just as real a failure.", r:["False positive"]},
  {n:"Under-enforcement", g:"Detection and tooling", d:"Letting content or accounts that did break a rule stay up or active, usually because a system or reviewer missed it.", r:["False negative"]},

  /* ---------- Child safety ---------- */
  {n:"CSAM (child sexual abuse material)", g:"Child safety", d:"Imagery depicting the sexual abuse of a minor. Illegal to create, possess or distribute in virtually every country; US-based providers are legally required to report it to NCMEC when found.", r:["NCMEC (National Center for Missing & Exploited Children)","CyberTipline"]},
  {n:"CSAE (child sexual abuse and exploitation)", g:"Child safety", d:"The broader category covering CSAM plus related harms: grooming, sextortion, and other sexual exploitation of a child, whether or not an image exists.", r:["CSAM (child sexual abuse material)","Grooming"]},
  {n:"Grooming", g:"Child safety", d:"An adult deliberately building trust with a child over time, often by posing as a peer or offering gifts or attention, in order to sexually abuse or exploit them later."},
  {n:"Sextortion", g:"Child safety", d:"Threatening to share a person's intimate images unless they pay money or send more images. Minors are frequent targets, often from a stranger posing as a peer online."},
  {n:"NCII (non-consensual intimate imagery)", g:"Child safety", d:"Intimate or sexual images shared without the consent of the person shown, including images that were taken consensually but shared without consent, and sexual deepfakes of a real person."},
  {n:"NCMEC (National Center for Missing & Exploited Children)", g:"Child safety", d:"The US nonprofit that runs the CyberTipline, the national reporting system for child sexual exploitation, and works with law enforcement on cases reported to it.", r:["CyberTipline"]},
  {n:"CyberTipline", g:"Child safety", d:"NCMEC's reporting system for child sexual exploitation. US-based electronic service providers are legally required to report CSAM they become aware of; the public can also report directly.", r:["NCMEC (National Center for Missing & Exploited Children)"]},
  {n:"Age assurance", g:"Child safety", d:"Any method, from a self-declared birthdate to inference from behavior to document checks, used to estimate or confirm how old a user is, with varying strength and privacy cost.", r:["Age verification"], tool:"coppa"},
  {n:"Age verification", g:"Child safety", d:"Confirming a user's age with stronger evidence than a self-declared birthdate, such as an ID document or a third-party check, used where the stakes of getting it wrong are higher.", r:["Age assurance"], tool:"coppa"},
  {n:"Verifiable parental consent (VPC)", g:"Child safety", d:"Under COPPA, confirming that a child's parent, not the child, has agreed to let a US service collect the child's personal information, through a method the FTC accepts as reliable.", r:["COPPA (Children's Online Privacy Protection Act)"], tool:"coppa"},

  /* ---------- Legal and regulation ---------- */
  {n:"COPPA (Children's Online Privacy Protection Act)", g:"Legal and regulation", d:"The US law requiring verifiable parental consent before collecting personal information from children under 13, enforced by the FTC. A 2025 amendment added a separate consent requirement for sharing children's data with third parties for advertising.", r:["Verifiable parental consent (VPC)"], tool:"coppa"},
  {n:"DSA (Digital Services Act)", g:"Legal and regulation", d:"The EU law setting rules for how online platforms handle illegal content, user complaints, advertising transparency, and, for the largest platforms, systemic risk.", r:["VLOP (very large online platform)","Trusted flagger","Statement of reasons"], tool:"dsa"},
  {n:"VLOP (very large online platform)", g:"Legal and regulation", d:"Under the DSA, a very large online platform: one with more than 45 million average monthly users in the EU, designated by the European Commission and subject to the DSA's strictest duties.", r:["DSA (Digital Services Act)","Systemic risk"], tool:"dsa"},
  {n:"Statement of reasons", g:"Legal and regulation", d:"Under the DSA, the explanation a platform must give a user when it removes their content or restricts their account, including which rule was applied and how to appeal.", r:["DSA (Digital Services Act)","Appeals"], tool:"dsa"},
  {n:"Transparency report", g:"Legal and regulation", d:"A public report, often required by a law such as the DSA or published voluntarily, disclosing numbers such as how much content was removed, how many appeals succeeded, and how automated systems performed.", tool:"transparency"},
  {n:"Online Safety Act", g:"Legal and regulation", d:"The UK law requiring platforms to assess and reduce the risk of illegal content, and, where children are likely to use the service, content harmful to children, enforced by Ofcom.", r:["Ofcom","Duty of care"]},
  {n:"Ofcom", g:"Legal and regulation", d:"The UK's communications regulator, responsible for enforcing the Online Safety Act, including issuing codes of practice and investigating platforms that fail their duties.", r:["Online Safety Act"]},
  {n:"Illegal harms", g:"Legal and regulation", d:"Under the UK Online Safety Act, content or activity that breaks a listed set of UK criminal laws, which platforms have a legal duty to assess the risk of and take steps against.", r:["Online Safety Act","Duty of care"]},
  {n:"Duty of care", g:"Legal and regulation", d:"A legal obligation to take reasonable steps to prevent foreseeable harm to the people using a service. Central to the UK Online Safety Act's approach to platform regulation.", r:["Online Safety Act"]},
  {n:"Section 230", g:"Legal and regulation", d:"The US law, 47 U.S.C. section 230, that shields online platforms from liability for content their users post, and protects their ability to moderate content in good faith, with exceptions including federal criminal law and sex trafficking claims."},
  {n:"GDPR (General Data Protection Regulation)", g:"Legal and regulation", d:"The EU law governing how personal data is collected, used and stored. Relevant to moderation because it limits what data can be kept and requires human involvement in some automated decisions affecting a person."},
  {n:"DTSP (Digital Trust & Safety Partnership)", g:"Legal and regulation", d:"An industry group of major tech companies that publishes shared best practices for Trust and Safety, assessed by companies against its “Safe Framework.”"},
  {n:"Santa Clara Principles", g:"Legal and regulation", d:"A set of recommendations, created by civil society and academic groups, asking platforms to publish numbers on enforcement, give users clear notice of what was removed and why, and offer a meaningful appeal.", r:["Transparency report","Appeals"]},
  {n:"GIFCT (Global Internet Forum to Counter Terrorism)", g:"Legal and regulation", d:"An independent nonprofit, formed by major tech companies after the 2019 Christchurch attacks, that runs a shared hash database so member platforms can catch known terrorist and violent extremist content.", r:["TVEC (terrorist and violent extremist content)","Christchurch Call"]},
  {n:"TVEC (terrorist and violent extremist content)", g:"Legal and regulation", d:"Content created or shared to promote, recruit for, or glorify terrorism or violent extremism, including attack footage and propaganda. A core category for GIFCT's shared hash database.", r:["GIFCT (Global Internet Forum to Counter Terrorism)","Dangerous organizations and individuals"]},
  {n:"Christchurch Call", g:"Legal and regulation", d:"A 2019 pledge, started by New Zealand and France after the Christchurch mosque attacks, in which governments and tech companies committed to working together to eliminate terrorist and violent extremist content online.", r:["GIFCT (Global Internet Forum to Counter Terrorism)"]},

  /* ---------- Platform integrity ---------- */
  {n:"Coordinated inauthentic behaviour", g:"Platform integrity", d:"A group of accounts working together, often while hiding who's really behind them, to artificially boost, suppress, or spread content or a narrative.", r:["Disinformation","Fake accounts"], tool:"premortem"},
  {n:"Account takeover", g:"Platform integrity", d:"A bad actor gaining access to someone else's account, usually through stolen credentials, and using it as if they were the real owner.", tool:"premortem"},
  {n:"Fake accounts", g:"Platform integrity", d:"Accounts that misrepresent who or what is behind them, including bot accounts, accounts for a person who doesn't exist, and accounts impersonating a real person or brand.", r:["Bot network","Ban evasion"], tool:"premortem"},
  {n:"Ban evasion", g:"Platform integrity", d:"Someone who was removed from a platform coming back under a new account or identity to keep doing what got them banned the first time.", r:["Fake accounts"]},
  {n:"Brigading", g:"Platform integrity", d:"Organizing a group of people, or accounts, to pile onto a specific person's content with reports, comments or votes, in a way that looks organic but isn't.", r:["Coordinated inauthentic behaviour","Harassment"]},
  {n:"Sybil attack", g:"Platform integrity", d:"Creating many fake identities to gain disproportionate influence over a system, such as a voting, review, or reputation mechanism, that assumes one identity equals one real person.", r:["Fake accounts","Bot network"]},
  {n:"Bot network", g:"Platform integrity", d:"A group of automated accounts controlled together, often used to spread content, inflate numbers, or run scams at a scale no human team could manage manually.", r:["Fake accounts","Coordinated inauthentic behaviour"]},

  /* ---------- Wellbeing ---------- */
  {n:"Reviewer wellbeing", g:"Wellbeing", d:"The physical and mental health of the people who review graphic, violent, or otherwise disturbing content as their job, and the programs built to protect it.", r:["Secondary traumatic stress"]},
  {n:"Secondary traumatic stress", g:"Wellbeing", d:"The toll of repeatedly viewing or hearing about other people's trauma, as content reviewers do, even without experiencing the event directly. Also called vicarious trauma.", r:["Reviewer wellbeing"]},
  {n:"Wellness rotation", g:"Wellbeing", d:"Limiting how long a reviewer spends on the most disturbing content in a shift or a week, by rotating them to other queues or tasks."},
  {n:"Peer support program", g:"Wellbeing", d:"A structured way for content reviewers to talk through what they've seen with trained colleagues, not only a manager or an outside hotline."},
  {n:"Resiliency program", g:"Wellbeing", d:"A workplace program, often combining training, counseling access, and workload limits, designed to help reviewers cope with repeated exposure to disturbing content over time."},

  /* ---------- AI and models ---------- */
  {n:"Synthetic media", g:"AI and models", d:"Images, audio or video generated or significantly altered by AI rather than captured directly, including deepfakes. Not inherently harmful, but a growing source of deception and non-consensual content.", r:["Deepfake","Content credentials"], tool:"premortem"},
  {n:"Content credentials", g:"AI and models", d:"Metadata attached to a piece of media that records how it was made or edited, including whether AI was involved, so viewers and platforms can check its origin.", r:["C2PA (Coalition for Content Provenance and Authenticity)"]},
  {n:"C2PA (Coalition for Content Provenance and Authenticity)", g:"AI and models", d:"The open technical standard most content credentials are built on, backed by a coalition of major tech and media companies.", r:["Content credentials"]},
  {n:"Deepfake", g:"AI and models", d:"Synthetic image, audio, or video that depicts a real person doing or saying something they didn't, created with AI. A major source of non-consensual intimate imagery and impersonation scams.", r:["Synthetic media","NCII (non-consensual intimate imagery)"], tool:"premortem"},
  {n:"Large language model (LLM)", g:"AI and models", d:"An AI model trained on large amounts of text that can generate human-like writing, used in Trust and Safety for drafting policy, summarizing cases, and increasingly for content classification.", r:["Hallucination","Human in the loop"]},
  {n:"Hallucination", g:"AI and models", d:"When an AI model generates a confident-sounding answer that's factually wrong or made up, a key reason human review stays in the loop for consequential decisions.", r:["Human in the loop"]},

  /* ---------- Metrics ---------- */
  {n:"Prevalence", g:"Metrics", d:"The share of all content or views on a platform that violates policy, usually estimated by sampling, because reviewing everything isn't possible. One of the harder numbers to measure honestly.", tool:"metrics"},
  {n:"Proactive rate", g:"Metrics", d:"The share of enforced violations that a platform found itself, through automated detection or its own review, rather than from a user report.", r:["Automated detection"], tool:"metrics"},
  {n:"Precision and recall", g:"Metrics", d:"Two numbers that grade a detection system together. Precision: of what it flagged, the share that deserved it. Recall: of what deserved flagging, the share it caught. One easily goes up while the other goes down.", r:["False positive","False negative"], tool:"eval"},
  {n:"False positive", g:"Metrics", d:"A case where a system or reviewer flagged, removed, or restricted something that didn't actually break a rule. Too many erode trust and cost legitimate users or content.", r:["Precision and recall","Over-enforcement"], tool:"eval"},
  {n:"False negative", g:"Metrics", d:"A case where a violation existed but wasn't caught, so it stayed up or active. The harder of the two kinds of error to find, because by definition no one flagged it.", r:["Precision and recall","Under-enforcement"], tool:"eval"},
  {n:"Inter-rater agreement", g:"Metrics", d:"How often two reviewers, or a reviewer and a model, reach the same decision on the same case. Low agreement means the rule or the training needs work, not just the reviewers.", r:["Calibration"], tool:"metrics"}
];
const TSG_GROUPS = ["Policy","Operations","Detection and tooling","Child safety","Legal and regulation","Metrics","Platform integrity","Wellbeing","AI and models"];
// Hover key: the acronym alone when the name is written "ACRONYM (full name)" or "full name (ACRONYM)",
// otherwise the plain name lowercased, matching how GT_RE in partHELP.js matches exact-case acronyms
// and case-insensitive plain phrases.
function tsgHoverKey(t){
  let m = t.n.match(/^([A-Z0-9&]{2,10})\s*\(/); if(m) return m[1];
  m = t.n.match(/\(([A-Z0-9&]{2,10})\)\s*$/); if(m) return m[1];
  return t.n.toLowerCase();
}
// Registers every term into the site-wide hover glossary, skipping any key already there
// (case-sensitive for acronyms, as GT_MORE already stores them) so nothing is overridden.
function tsgRegisterHover(){
  if(typeof GT_MORE !== "object") return;
  TSG_TERMS.forEach(t => { const k = tsgHoverKey(t); if(!(k in GT_MORE)) GT_MORE[k] = t.d; });
}
function tsgToolLink(route){
  if(!route) return "";
  const label = typeof ROUTE_LABEL !== "undefined" && ROUTE_LABEL[route] ? ROUTE_LABEL[route] : route;
  return `<a class="tsg-tool" href="#${route}">Where this comes up: ${esc(label)} <svg><use href="#i-arrow"/></svg></a>`;
}
// Pure filter: every term whose group matches (or "all") and whose name or definition contains the
// search text, A-to-Z by name. Kept standalone from the render so it's testable without a browser.
function tsgFilter(q, gfilter){
  const qq = (q || "").trim().toLowerCase();
  return TSG_TERMS.filter(t => (!gfilter || gfilter === "all" || t.g === gfilter) && (!qq || (t.n + " " + t.d).toLowerCase().includes(qq)))
    .slice().sort((a, b) => a.n.localeCompare(b.n));
}
function tsgGridHTML(list){
  if(!list.length) return `<div class="ln-empty card">Nothing matches. Try another word or group.</div>`;
  let lastL = "", cards = "";
  list.forEach(t => {
    const L = t.n[0].toUpperCase();
    if(L !== lastL){ cards += `<div class="tsg-letter">${esc(L)}</div>`; lastL = L; }
    cards += `<div class="card tsg-card">
        <p class="tsg-g">${esc(t.g)}</p>
        <h4>${esc(t.n)}</h4>
        <p class="tsg-d">${esc(t.d)}</p>
        ${t.r && t.r.length ? `<p class="tsg-r">Related: ${t.r.map(esc).join(", ")}</p>` : ""}
        ${tsgToolLink(t.tool)}
      </div>`;
  });
  return `<div class="tsg-grid">${cards}</div>`;
}
function renderTsGlossary(){
  tsgRegisterHover();
  let q = "", gfilter = "all";
  const meta = `<a class="btn sm" href="#glossary">Red-teaming glossary</a>`;
  const chipsHTML = fg => [["all","All"]].concat(TSG_GROUPS.map(g => [g, g])).map(([k, n]) => `<button type="button" class="tsg-chip" data-g="${esc(k)}" aria-pressed="${k === fg}">${esc(n)}</button>`).join("");
  view.innerHTML = head("T&S glossary", `${TSG_TERMS.length} terms a person new to Trust and Safety meets in their first year, in plain words. Search, filter by group, or browse A to Z.`, "Learn", meta) + `<div class="ln">
    <p class="note tsg-xlink">Looking for AI red-teaming terms, such as jailbreak or attack success rate? <a href="#glossary">Red-teaming glossary</a></p>
    <div class="ln-gl-tools"><label class="ln-search"><svg><use href="#i-search"/></svg><input id="tsg-q" type="search" placeholder="Search terms" autocomplete="off" aria-label="Search terms"></label>
      <span class="note" id="tsg-count">${TSG_TERMS.length} of ${TSG_TERMS.length} terms</span></div>
    <div class="tsg-chips" role="group" aria-label="Filter by group" id="tsg-chips">${chipsHTML(gfilter)}</div>
    <div id="tsg-grid">${tsgGridHTML(tsgFilter(q, gfilter))}</div></div>`;
  const chipsEl = $("#tsg-chips");
  const draw = () => {
    const list = tsgFilter(q, gfilter);
    $("#tsg-count").textContent = `${list.length} of ${TSG_TERMS.length} terms`;
    $("#tsg-grid").innerHTML = tsgGridHTML(list);
  };
  $("#tsg-q").oninput = e => { q = e.target.value; draw(); };
  $$("[data-g]", chipsEl).forEach(b => b.onclick = () => { gfilter = b.dataset.g; $$("[data-g]", chipsEl).forEach(x => x.setAttribute("aria-pressed", String(x === b))); draw(); });
}
