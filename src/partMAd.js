/* =========================================================
   PROGRAM MATURITY: content (areas, levels, stages, next steps)
   ========================================================= */
const MA_LEVELS = [
  {n:"Reactive", d:"Handled case by case, by whoever is around"},
  {n:"Developing", d:"Some basics in place, with gaps and inconsistency"},
  {n:"Defined", d:"Written down, owned and repeatable"},
  {n:"Managed", d:"Measured, reviewed and improving"},
  {n:"Leading", d:"Built in, proactive and shaping the field"}
];
// Each area: the question it answers, why it matters, what levels 1 to 5 look like, and the steps from each level to the next
const MA_AREAS = [
  {k:"policy", n:"Policy and standards", s:"Policy", tool:["policy", "Stress-test a policy"],
    q:"Are your rules clear, written down and applied the same way every time?",
    why:"Unclear rules lead to inconsistent decisions, frustrated users and weak answers when regulators ask how you decide.",
    lv:["Beyond a short terms of service there are no written rules. Decisions depend on who handles the case.",
      "Public community guidelines exist, but reviewers have little internal guidance and edge cases get settled in chat threads.",
      "Every public policy has internal enforcement guidelines with examples, a named owner and a change log.",
      "Policies are reviewed on a schedule and tested against edge cases before launch. Reviewer agreement is tracked for each policy to find unclear rules.",
      "Policy work draws on research, outside experts and affected communities. The reasoning behind major changes is published, and appeal outcomes shape revisions."],
    next:[["Write community guidelines that cover your most serious harms", "Name one owner for each policy area"],
      ["Write internal enforcement guidelines with clear examples for every policy", "Keep a change log so reviewers know what changed and when"],
      ["Stress-test new and changed policies against edge cases before they ship", "Track reviewer agreement for each policy to find rules that are unclear"],
      ["Consult outside experts and affected communities on major changes", "Publish the reasoning behind significant policy changes"]]},
  {k:"detection", n:"Detection and prevention", s:"Detection", tool:["premortem", "Run an abuse pre-mortem"],
    q:"How do you find harm, other than waiting for users to report it?",
    why:"Most harmful content is never reported. What you don't detect, you can't act on or measure.",
    lv:["Harm is found only when users report it, or when it reaches the press.",
      "Users can report content, and simple keyword or link filters catch obvious abuse. Known illegal images may not be matched.",
      "Hash matching catches known child sexual abuse and terrorist content, classifiers cover the top harms, and a review tool ranks cases by severity.",
      "Precision and recall are measured for each detection system, models learn from reviewer decisions, and account signals catch networks, not just single posts.",
      "New features get an abuse risk review before launch, a red team probes for gaps, and signals are shared with industry partners."],
    next:[["Add reporting to every place where users meet or post", "Start block lists for the words and links behind your top harms"],
      ["Match uploads against known CSAM hashes, for example with PhotoDNA or ROOST's free, open-source Coop, and report matches as the law requires", "Rank the review queue by severity instead of arrival time"],
      ["Measure precision and recall for each classifier on a labeled sample", "Add account and network signals to catch coordinated abuse"],
      ["Run an abuse pre-mortem on every new feature before launch", "Join an industry signal-sharing program, such as the GIFCT hash database or the Tech Coalition's Lantern"]]},
  {k:"operations", n:"Review operations", s:"Operations", tool:["vendors", "Score moderation vendors"],
    q:"Do you have the people, process and coverage to act on what you find, quickly enough?",
    why:"Detection only matters if someone acts in time. Slow action lets harm spread and backlogs build.",
    lv:["A few people review reports when they have time. There are no targets for how fast.",
      "A dedicated team or vendor works the queues during business hours, with basic service levels.",
      "Written workflows, service levels by severity, round-the-clock cover for the most severe harms, and escalation paths to legal and leadership.",
      "Capacity is forecast from volume trends, vendors are managed against a scorecard, and time to action is tracked for each harm.",
      "Routing, automation and staffing are tuned continuously, and the team can add capacity within hours during an incident."],
    next:[["Make a named team or vendor responsible for the review queue", "Set a target time to act on user reports"],
      ["Set service levels by severity, with round-the-clock cover for child safety and threats to life", "Write an escalation path to legal, communications and leadership"],
      ["Forecast review capacity from volume trends every quarter", "Score vendors on quality, wellness and surge capacity"],
      ["Automate clear-cut decisions and route complex cases to specialists, for example with ROOST's free Coop or Osprey", "Test a surge plan that adds reviewers within hours"]]},
  {k:"quality", n:"Quality and appeals", s:"Quality", tool:["appeal", "Try the appeal reviewer"],
    q:"Are your decisions accurate and consistent, and can users get a mistake fixed?",
    why:"Wrong decisions hurt good users and erode trust. In the EU, the Digital Services Act requires online platforms to offer a way to appeal.",
    lv:["Nobody checks decisions, and users who disagree have no way to appeal.",
      "Decisions are spot-checked now and then. Appeals go to a general support inbox.",
      "A regular quality sample measures accuracy for each policy, and appeals get a second reviewer and a response target.",
      "Reviewer agreement and appeal overturn rates are tracked by policy and fed back into training and guidelines.",
      "Quality is calibrated across every team and vendor, users get specific reasons for decisions, and overturn data drives changes to policy and models."],
    next:[["Let users appeal every action on their account or content", "Spot-check a small sample of decisions every week"],
      ["Run a weekly quality sample and report accuracy for each policy", "Give appeals their own queue, a different reviewer and a response target"],
      ["Track appeal overturn rates by policy and use them to update guidelines", "Hold calibration sessions where reviewers decide the same cases"],
      ["Calibrate every team and vendor against one shared answer key", "Give users specific reasons with every decision, including an EU statement of reasons where required"]]},
  {k:"crisis", n:"Crisis response", s:"Crisis", tool:["tabletop", "Run a tabletop exercise"],
    q:"When something goes badly wrong, does everyone know what to do in the first hour?",
    why:"In a crisis, the first hours decide how much harm is done, what the headlines say and what regulators think of you.",
    lv:["Crises are handled as they happen, by whoever is around.",
      "People know who to call, but there's no written playbook or agreed severity scale.",
      "A written playbook sets severity levels, an on-call rotation, named roles and ready templates for regulators and the press.",
      "A tabletop exercise runs at least twice a year, and every major incident gets a blameless review with tracked actions.",
      "Drills include executives, playbooks cover emerging threats such as elections and AI-generated content, and lessons are shared across the industry."],
    next:[["Agree what counts as a crisis and who declares one", "List who to call in legal, communications, engineering and law enforcement"],
      ["Write a playbook with severity levels, roles and an on-call rotation", "Prepare holding statements and regulator notification templates"],
      ["Run a tabletop exercise at least twice a year", "Hold a blameless review after every major incident and track the actions"],
      ["Include executives in at least one exercise a year", "Add playbooks for elections, AI-generated content and coordinated attacks"]]},
  {k:"measurement", n:"Metrics and reporting", s:"Metrics", tool:["metrics", "Build your scorecard"],
    q:"Can you show leadership, with numbers, whether users are safer this quarter than last?",
    why:"Without measurement you can't prove progress, win investment or spot a problem before it grows.",
    lv:["Little is measured beyond counts of reports or removals.",
      "A dashboard tracks volumes and response times, but not how much harm users actually see.",
      "A defined scorecard covers prevalence, speed, accuracy and appeals, and leadership reviews it every quarter.",
      "Every metric has a target, an owner and a trend. Prevalence is measured by sampling, and a transparency report is published.",
      "Safety metrics shape product and business decisions, include how safe users feel, and are independently audited where required."],
    next:[["Log every report, decision and action with a timestamp", "Build a simple dashboard for volume and response time"],
      ["Choose a scorecard that covers prevalence, speed, accuracy and appeals", "Review the scorecard with leadership every quarter"],
      ["Measure prevalence with a properly sized random sample", "Publish a transparency report"],
      ["Make safety metrics a required input to launch and business reviews", "Survey users on how safe they feel and track it next to enforcement data"]]},
  {k:"compliance", n:"Regulatory readiness", s:"Compliance", tool:["premortem", "Map the laws that apply"],
    q:"Do you know which online safety laws apply to you, and could you prove you meet them?",
    why:"Online safety laws now carry large fines, and regulators expect evidence, not promises.",
    lv:["Nobody tracks online safety law. Legal questions come up only after a letter arrives.",
      "Legal knows the major laws exist, but obligations aren't linked to owners or processes.",
      "Obligations under laws such as the EU Digital Services Act, the UK Online Safety Act and child safety reporting rules are mapped to owners, processes and evidence.",
      "Risk assessments are documented and repeated when products change, and requests from regulators and law enforcement follow a tracked process.",
      "Compliance is built into product development, audits pass without major findings, and the team contributes to consultations on new rules."],
    next:[["List where you operate and the online safety laws that apply there", "Name who owns regulatory questions"],
      ["Map each legal obligation to an owner, a process and the evidence you keep", "Set up required reporting, such as reporting CSAM to NCMEC in the US"],
      ["Document risk assessments and repeat them when products change", "Track regulator and law enforcement requests from receipt to response"],
      ["Add a regulatory check to your product launch process", "Respond to consultations on upcoming rules"]]},
  {k:"wellbeing", n:"Team wellbeing", s:"Wellbeing", tool:null,
    q:"Are the people who review harmful content protected, supported and able to stay?",
    why:"Repeated exposure to harmful content can cause lasting psychological harm. Burnout also drives turnover and mistakes.",
    lv:["Reviewers see harmful content with no limits, training or specialist support.",
      "A general employee assistance program exists, but nothing specific to content exposure.",
      "Every reviewer, in-house or at a vendor, has exposure limits, specialist counseling, wellness tools such as image blurring, and resilience training.",
      "Wellbeing is measured through surveys and attrition, and vendor contracts require the same standards as in-house teams.",
      "Wellbeing is designed into tools and workflows, support continues after people leave the role, and a senior leader is accountable for it."],
    next:[["Give reviewers access to confidential counseling", "Tell every new reviewer what they'll see and how to get support"],
      ["Set daily exposure limits for the most harmful content", "Turn on blurring and grayscale by default in review tools (ROOST's open-source Coop has both)"],
      ["Survey reviewer wellbeing and track attrition every quarter", "Write wellness standards into every vendor contract"],
      ["Offer support after people leave review roles", "Make a senior leader accountable for reviewer wellbeing"]]}
];
const MA_ALL = n => Object.fromEntries(MA_AREAS.map(a => [a.k, n]));
const MA_STAGES = [
  {k:"early", n:"Early stage", d:"A founder or first safety hire covers trust and safety, usually with under a million users.",
    t:Object.assign(MA_ALL(2), {crisis:3, compliance:3, wellbeing:3}), td:"Level 2, and level 3 for crisis response, compliance and wellbeing"},
  {k:"growth", n:"Growing", d:"A dedicated safety team, millions of users, and new markets or features on the way.", t:MA_ALL(3), td:"Level 3 in every area"},
  {k:"scale", n:"At scale or regulated", d:"Tens of millions of users, a heavily regulated sector, or extra duties as a very large platform under EU or UK law.", t:MA_ALL(4), td:"Level 4 in every area"}
];
// When two gaps are the same size, fix the one that can hurt people or the company fastest first
const MA_ORDER = ["crisis", "compliance", "detection", "policy", "wellbeing", "operations", "quality", "measurement"];
const MA_PHASES = [["now", "Now", "Next 90 days"], ["next", "Next", "3 to 6 months"], ["later", "Later", "6 to 12 months"]];
const MA_EXAMPLE = {stage:"growth", lv:{policy:3, detection:2, operations:3, quality:2, crisis:1, measurement:2, compliance:1, wellbeing:3}, ex:true, open:null, tab:"roadmap",
  done:{"crisis1-0":true, "crisis1-1":true, "compliance1-0":true},
  own:{crisis:"Head of Trust & Safety Operations", compliance:"Online safety counsel", detection:"Safety engineering lead", quality:"Review operations manager", measurement:"T&S data analyst", policy:"Policy lead"},
  notes:{crisis:"Escalation contacts agreed in the Q2 leadership offsite. Playbook draft is in progress."}};
Object.assign(MX_GLOSS, {
  "PhotoDNA":"Microsoft's widely used tool for hash matching known child sexual abuse images.",
  "GIFCT":"The Global Internet Forum to Counter Terrorism. It runs a shared database of hashes of terrorist content for its member companies.",
  "Lantern":"A Tech Coalition program where companies share signals about accounts and activity that break child safety policies.",
  "ROOST":"Robust Open Online Safety Tools: a nonprofit that makes free, open-source trust and safety tools such as Coop and Osprey.",
  "Coop":"ROOST's free, open-source review console: queues, routing and enforcement rules, reporting and appeals APIs, and built-in hash matching with NCMEC reporting. You host it yourself.",
  "Osprey":"ROOST's free, open-source real-time rules engine and investigation console, built at Discord. It needs an engineering team to run.",
  "blameless review":"A review after an incident that looks for what in the system failed rather than who to blame, so people report problems openly.",
  "tabletop exercise":"A practice session where a team talks through a realistic crisis, step by step, to test its plan.",
  "service level":"An agreed target for how quickly work gets done, such as acting on a severe report within an hour.",
  "Digital Services Act":"The EU law that sets rules for online services, including notice and action, appeals, transparency reports and, for the largest platforms, risk assessments and audits.",
  "Online Safety Act":"The UK law that requires online services to assess and reduce the risk of illegal content and of harm to children.",
  "employee assistance program":"A general counseling benefit offered to all staff. It rarely covers the specific effects of reviewing harmful content.",
  "calibration session":"A session where reviewers decide the same cases and compare answers, so everyone applies the rules the same way.",
  "on-call rotation":"A schedule that names who responds to urgent problems at any hour, and who backs them up."
});
MX_GLOSS_RE = null;

/* ---------- How each area maps to recognized frameworks ----------
   DTSP: the Safe Framework Specification (June 2025), its 35 best practices under five commitments.
   Ofcom: the Illegal content Codes of Practice for user-to-user services (in force 17 March 2025) and the
   Protection of Children Code of Practice for user-to-user services (in force 25 July 2025).
   Checked against the published documents in September 2026. Draft amendments are flagged as drafts. */
const MA_FW_SRC = {
  dtsp:["DTSP Safe Framework Specification, June 2025", "https://dtspartnership.org/wp-content/uploads/2025/07/DTSP_Safe_Framework_Specification_2025.pdf"],
  illegal:["Ofcom Illegal content Codes of Practice for user-to-user services, in force 17 March 2025", "https://www.ofcom.org.uk/siteassets/resources/documents/online-safety/information-for-industry/illegal-harms/illegal-content-codes-of-practice-for-user-to-user-services-24-feb.pdf"],
  children:["Ofcom Protection of Children Code of Practice for user-to-user services, in force 25 July 2025", "https://www.ofcom.org.uk/siteassets/resources/documents/consultations/category-1-10-weeks/statement-protecting-children-from-harms-online/main-document/protection-of-children-code-of-practice-for-user-to-user-services.pdf"]
};
const MA_FW_REVIEWED = "September 2026";
const MA_FW = {
  policy:{dtsp:[["Product Governance", "PG1: Policies & Standards"], ["Product Governance", "PG3: Community Guidelines/Rules"], ["Product Governance", "PG6: Document Interpretation"]],
    ofcom:[["ICU C3", "Setting internal content policies"], ["ICU G1", "Terms of service: substance (all services)"], ["ICU G3", "Terms of service: clarity and accessibility"]],
    note:"A strong fit in both. The children's code has matching measures (PCU C3, PCU G1 and PCU G3)."},
  detection:{dtsp:[["Product Enforcement", "PE4: Advanced Detection"], ["Product Development", "PD1: Abuse Pattern Analysis"], ["Product Enforcement", "PE9: Industry Partners"]],
    ofcom:[["ICU C9", "Using hash matching to detect and remove CSAM"], ["ICU C10", "Detecting and removing content matching listed CSAM URLs"], ["ICU A5", "Tracking evidence of new and increasing illegal harm"]],
    note:"A partial fit. Ofcom's proactive detection measures in force are narrow: CSAM hashes and URLs. Draft amendments would add hash matching for intimate image abuse, so check whether they are now in force."},
  operations:{dtsp:[["Product Enforcement", "PE1.1: Roles & Teams"], ["Product Enforcement", "PE1.2: Operational Infrastructure"], ["Product Enforcement", "PE6.1: Enforcement Prioritization"], ["Product Enforcement", "PE2: Training & Awareness"]],
    ofcom:[["ICU C2", "Having a content moderation function that allows for the swift take down of illegal content"], ["ICU C5", "Prioritisation"], ["ICU C6", "Resourcing"], ["ICU C7", "Provision of training and materials to individuals working in content moderation (non-volunteers)"]],
    note:"A strong fit in both: people, triage, capacity and training."},
  quality:{dtsp:[["Product Improvement", "PI1: Effectiveness Testing"], ["Product Enforcement", "PE6.2: Appeals"], ["Product Improvement", "PI5: Remedy Mechanisms"]],
    ofcom:[["ICU C4", "Performance targets"], ["ICU D8", "Appropriate action for relevant complaints which are appeals – determination (large or multi-risk services)"], ["ICU D9", "Appropriate action for relevant complaints which are appeals – determination (services that are neither large nor multi-risk)"], ["ICU D10", "Appropriate action for relevant complaints which are appeals – action following determination"]],
    note:"A good fit. Ofcom's performance targets explicitly cover the accuracy of decision making, and the children's code adds appeals against age assessments (PCU D11 and PCU D12)."},
  crisis:{dtsp:[["Product Enforcement", "PE1.2: Operational Infrastructure"], ["Product Enforcement", "PE6.1: Enforcement Prioritization"], ["Product Enforcement", "PE6.3: External Reporting"], ["Product Development", "PD7: Post-Launch Evaluation"]],
    ofcom:[["ICU C6", "Resourcing"], ["ICU A5", "Tracking evidence of new and increasing illegal harm"]],
    note:"A weak fit today. DTSP has no crisis practice of its own, and Ofcom's in-force measures only touch it indirectly (resourcing covers surges caused by external events). Ofcom has drafted dedicated crisis-response measures, so check whether they are now in force."},
  measurement:{dtsp:[["Product Improvement", "PI1: Effectiveness Testing"], ["Product Transparency", "PT1: Transparency Reports"], ["Product Transparency", "PT3: Complaint Intakes"]],
    ofcom:[["ICU A1", "Annual review of risk management activities"], ["ICU A5", "Tracking evidence of new and increasing illegal harm"], ["ICU C4", "Performance targets"]],
    note:"A good fit for reporting to senior leadership. Public transparency reports under the Act (section 77) apply only to certain services and sit outside the codes."},
  compliance:{dtsp:[["Product Development", "PD5: Risk Assessment"], ["Product Improvement", "PI2: Process Alignment"]],
    ofcom:[["ICU A2", "Individual accountable for illegal content safety duties and reporting and complaints duties"], ["ICU A3", "Written statements of responsibilities"], ["ICU A4", "Internal monitoring and assurance"], ["ICU A7", "Compliance training"]],
    note:"DTSP is voluntary and sits alongside legal compliance, so only risk assessment and alignment map. Under the Act, the risk assessment (section 9) and record-keeping (section 23) are duties in the Act itself, not code measures."},
  wellbeing:{dtsp:[["Product Enforcement", "PE3: Wellness & Resilience"]], ofcom:[],
    note:"DTSP's wellness practice is a direct match. Neither Ofcom code has a measure on moderator wellbeing or exposure."}
};
