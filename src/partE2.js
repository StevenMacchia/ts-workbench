/* =========================================================
   ABUSE PRE-MORTEM: OBLIGATIONS AND DECISIONS
   st returns "applies", "may" or null. bump:false = don't force its safeguards to launch blockers.
   ========================================================= */
const OBL = [
{r:"us", law:"Federal CSAM reporting duty (18 U.S.C. § 2258A)", st:c=>(c.hostsMedia||c.F("dm")||c.F("ai_gen"))?"applies":null,
 t:"Report apparent child sexual abuse material to NCMEC's CyberTipline when you become aware of it, and preserve the content and related data. The 2024 REPORT Act extended preservation to one year.", sg:["csam_reporting"]},
{r:"us", law:"Children's Online Privacy Protection Act (COPPA)", st:c=>c.kids?"applies":(c.youth?"may":null),
 t:"Get verifiable parental consent before collecting personal information from under-13s, whether your service is aimed at children or you know a user is under 13. The FTC's 2025 amendments added separate consent for sharing children's data for advertising and a written data-retention policy.", sg:["parental_consent","data_minimization"]},
{r:"us", law:"TAKE IT DOWN Act", st:c=>(c.F("posts")||c.F("media")||c.F("groups")||c.F("ai_gen")||c.F("live"))?"applies":null,
 t:"Give people a way to request removal of non-consensual intimate images, including AI-generated ones, and remove them within 48 hours of a valid request. Platform duties took effect in May 2026.", sg:["ncii_process"]},
{r:"us", law:"INFORM Consumers Act", st:c=>c.F("listings")?((c.M("p2p")||c.M("payouts"))?"applies":"may"):null,
 t:"Marketplaces must collect and verify identity, bank and contact details from high-volume third-party sellers (200+ sales and $5,000+ in a year), and let buyers report suspicious conduct.", sg:["seller_verification"]},
{r:"us", law:"FTC rule on consumer reviews and testimonials", st:c=>c.F("reviews")?"applies":null,
 t:"Bans fake reviews (including AI-generated ones), buying positive or negative reviews, and suppressing honest negative reviews. Violations carry civil penalties.", sg:["review_policy"]},
{r:"us", law:"Bank Secrecy Act, AML and OFAC sanctions", st:c=>(c.T("fintech","crypto")&&c.moneyMoves)?"applies":((c.M("p2p")||c.M("crypto"))?"may":null),
 t:"Money transmitters and other financial institutions need an AML program, customer identification, suspicious activity reports and sanctions screening. State money-transmitter licenses may also apply unless a licensed partner carries these duties.", sg:["kyc","aml_monitoring","sanctions"]},
{r:"us", law:"Electronic Fund Transfer Act (Regulation E)", st:c=>(c.T("fintech")&&(c.M("p2p")||c.M("wallet")))?"may":null,
 t:"Consumer accounts that move money electronically must follow error-resolution procedures and limit consumer liability for unauthorized transfers.", sg:[]},
{r:"us", law:"State AI companion chatbot laws (e.g. California, New York)", st:c=>c.F("ai_chat")?"may":null,
 t:"Disclose that users are talking to an AI, keep protocols for responding to suicidal ideation and self-harm, and add protections for known minors. Requirements vary by state.", sg:["ai_disclosure","companion_safeguards"]},
{r:"us", law:"State age-verification laws for adult content", st:c=>c.explicit?"applies":null,
 t:"Many states require reliable age verification before users can reach sexually explicit material. The Supreme Court upheld Texas's law in 2025.", sg:["age_assurance"]},
{r:"us", law:"State children's online safety and design laws", st:c=>(c.youth&&(c.comms||c.F("posts")||c.F("discovery")))?"may":null,
 t:"Several states (including Utah, Texas, New York and California) regulate minors' accounts, feeds, parental consent or product design. Requirements differ, and several laws are being challenged in court.", sg:["teen_defaults","parental_tools"]},
{r:"us", law:"Fair housing, fair lending and equal-employment laws", st:c=>(c.T("rentals")||c.M("credit")||c.F("ads"))?"may":null,
 t:"Rental decisions, credit decisions and housing, job or credit ads must not discriminate on protected characteristics, including through targeting or algorithms.", sg:["anti_discrimination"]},

{r:"eu", law:"Digital Services Act: core duties", st:c=>c.ugc?"applies":null,
 t:"Hosting services need notice-and-action for illegal content and a statement of reasons for every restriction. Online platforms also need internal complaint handling, priority for trusted flaggers, no dark patterns and transparency reporting.", sg:["notice_action","sor","appeals"]},
{r:"eu", law:"Digital Services Act Article 28: protection of minors", st:c=>(c.minors&&c.ugc)?(c.youth?"applies":"may"):null,
 t:"Platforms accessible to minors must ensure a high level of privacy, safety and security for them (the Commission's 2025 guidelines cover age assurance, default settings and recommender systems) and must not target them with profiling-based ads.", sg:["teen_defaults","no_minor_ads"]},
{r:"eu", law:"Digital Services Act: trader traceability", st:c=>c.F("listings")?"applies":null,
 t:"Marketplaces must collect, and make best efforts to verify, traders' identity and contact details before they can sell, and inform consumers who bought illegal products.", sg:["seller_verification"]},
{r:"eu", law:"Digital Services Act: very large platforms", st:c=>c.big?"may":null, bump:false,
 t:"If you reach 45 million monthly users in the EU, you must also assess and mitigate systemic risks each year, undergo independent audits, give researchers data access and offer a feed that isn't based on profiling.", sg:[]},
{r:"eu", law:"Terrorist Content Online Regulation", st:c=>(c.F("posts")||c.F("media")||c.F("live")||c.F("groups")||c.F("files"))?"applies":null,
 t:"Remove or disable terrorist content within one hour of a removal order from a national authority, and keep a point of contact available.", sg:["tco_removal"]},
{r:"eu", law:"General Data Protection Regulation (GDPR)", st:c=>"applies", bump:false,
 t:"Have a lawful basis for processing, minimize data and run impact assessments for high-risk processing. Children's consent to online services needs parental authorization below an age set by each country (13 to 16).", sg:["data_minimization","access_controls"]},
{r:"eu", law:"EU AI Act: transparency duties", st:c=>(c.F("ai_gen")||c.F("ai_chat"))?"applies":null,
 t:"Since 2 August 2026, tell people when they are interacting with an AI system, and mark AI-generated or manipulated content, including deepfakes, in a machine-readable way. Generative AI systems already on the market before that date have until 2 December 2026 to add the marking.", sg:["ai_disclosure","gen_provenance"]},
{r:"eu", law:"EU anti-money-laundering rules, PSD2 and MiCA", st:c=>(c.T("fintech","crypto")&&c.moneyMoves)?"applies":((c.M("p2p")||c.M("crypto"))?"may":null),
 t:"Payment and crypto businesses need authorization, customer due diligence, transaction monitoring and suspicious-transaction reporting. PSD2 requires strong customer authentication; crypto-asset service providers need authorization under MiCA.", sg:["kyc","aml_monitoring","payment_risk"]},

{r:"uk", law:"Online Safety Act: illegal harms duties", st:c=>c.ugc?"applies":null,
 t:"Complete an illegal content risk assessment and take proportionate measures against priority illegal harms such as CSAM, grooming, terrorism and fraud, with accessible reporting and complaints. In force since March 2025.", sg:["report_btn","review_queue","policies"]},
{r:"uk", law:"Online Safety Act: children's safety duties", st:c=>(c.minors&&c.ugc)?(c.youth?"applies":"may"):null,
 t:"If children are likely to access the service, complete a children's risk assessment and protect them from harmful content. Since July 2025, services that allow pornography or suicide, self-harm or eating-disorder content need highly effective age assurance to keep children from it.", sg:["teen_defaults","age_assurance"]},
{r:"uk", law:"Online Safety Act: age checks for pornography", st:c=>c.explicit?"applies":null,
 t:"Services with pornographic content must use highly effective age assurance, such as facial age estimation, ID checks or open banking. Self-declaration is not enough.", sg:["age_assurance"]},
{r:"uk", law:"Age Appropriate Design Code (Children's Code)", st:c=>c.minors?(c.youth?"applies":"may"):null,
 t:"Services likely to be accessed by under-18s must default to high privacy, switch geolocation and profiling off by default, and avoid nudge techniques that weaken privacy.", sg:["teen_defaults","design_review_minors"]},
{r:"uk", law:"APP fraud mandatory reimbursement", st:c=>(c.T("fintech")&&c.M("p2p"))?"applies":null,
 t:"Payment firms must reimburse most victims of authorised push payment scams, up to £85,000 per claim, with the cost split between the sending and receiving firms.", sg:["confirmation_payee"]},
{r:"uk", law:"FCA rules: Consumer Duty, AML and financial promotions", st:c=>c.T("fintech","crypto")?"may":null,
 t:"Regulated firms must deliver good outcomes, including for customers in vulnerable circumstances. Crypto firms need FCA registration for AML and must follow the financial promotions rules.", sg:["vulnerable_customers"]},

{r:"au", law:"Online Safety Act 2021 and industry codes", st:c=>c.ugc?"applies":null,
 t:"Respond to eSafety Commissioner removal notices within 24 hours (image-based abuse, cyberbullying of children, adult cyber-abuse and seriously harmful content), meet the Basic Online Safety Expectations and follow registered industry codes.", sg:["ncii_process","review_queue"]},
{r:"au", law:"Social media minimum age (under-16s)", st:c=>c.p.youth==="adult_verified"?null:(c.T("social","video","creator")?"applies":((c.F("posts")&&c.F("profiles")&&!c.T("messaging","gaming","edtech","health","workplace"))?"may":null)),
 t:"Since December 2025, age-restricted social media platforms must take reasonable steps to stop under-16s from having accounts. Messaging, online gaming, education and health services are largely excluded.", sg:["age_assurance","underage_removal"]},

{r:"ca", law:"Mandatory reporting of child sexual abuse material", st:c=>(c.hostsMedia||c.F("dm"))?"applies":null,
 t:"Internet service providers must report CSAM they are told about to the Canadian Centre for Child Protection, and notify police and preserve data when they believe an offence was committed using their service.", sg:["csam_reporting"]},
{r:"ca", law:"Proceeds of Crime (Money Laundering) and Terrorist Financing Act", st:c=>(c.T("fintech","crypto")&&c.moneyMoves)?"may":null,
 t:"Money services businesses, including crypto dealers, must register with FINTRAC, verify identity, keep records and report suspicious and large transactions.", sg:["kyc","aml_monitoring"]},

{r:"in", law:"IT (Intermediary Guidelines and Digital Media Ethics Code) Rules", st:c=>c.ugc?"applies":null,
 t:"Appoint a grievance officer, acknowledge complaints within 24 hours and resolve them within 15 days, and remove non-consensual intimate imagery within 24 hours of a complaint. Significant platforms (5M+ users in India) have extra duties, and recent amendments address AI-generated content.", sg:["report_btn","ncii_process"]},
{r:"in", law:"Digital Personal Data Protection Act 2023", st:c=>c.minors?(c.youth?"applies":"may"):null,
 t:"Get verifiable parental consent before processing personal data of anyone under 18, and don't track, behaviorally monitor or target ads at children. Obligations are phasing in under rules issued in 2025.", sg:["parental_consent","no_minor_ads"]},

{r:"br", law:"Digital Statute of Children and Adolescents (ECA Digital)", st:c=>c.minors?(c.youth?"applies":"may"):null,
 t:"Enacted in 2025. Products aimed at or likely to be accessed by minors need age verification beyond self-declaration, parental supervision tools and protective defaults, and loot boxes are banned in games for minors.", sg:["age_assurance","parental_tools","teen_defaults"]},
{r:"br", law:"General Data Protection Law (LGPD)", st:c=>"applies", bump:false,
 t:"Process personal data on a legal basis and in the best interests of children and adolescents, with specific parental consent for children's data.", sg:["data_minimization"]}
];

// Where each law note comes from: the official text or the regulator's own page. Checked when the notes were last reviewed.
const LAW_REVIEWED = "September 2026";
const LAW_SRC = {
  "Federal CSAM reporting duty (18 U.S.C. § 2258A)":["https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title18-section2258A&num=0&edition=prelim", "US Code, 18 U.S.C. § 2258A"],
  "Children's Online Privacy Protection Act (COPPA)":["https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa", "FTC, COPPA Rule (16 CFR Part 312)"],
  "TAKE IT DOWN Act":["https://www.govinfo.gov/app/details/PLAW-119publ12", "GovInfo, Public Law 119-12"],
  "INFORM Consumers Act":["https://www.ftc.gov/business-guidance/resources/informing-businesses-about-inform-consumers-act", "FTC, INFORM Consumers Act guidance"],
  "FTC rule on consumer reviews and testimonials":["https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-465-trade-regulation-rule-use-consumer-reviews-testimonials-final-rule", "FTC, 16 CFR Part 465 final rule"],
  "Bank Secrecy Act, AML and OFAC sanctions":["https://www.fincen.gov/resources/statutes-and-regulations/bank-secrecy-act", "FinCEN, The Bank Secrecy Act"],
  "Electronic Fund Transfer Act (Regulation E)":["https://www.consumerfinance.gov/rules-policy/regulations/1005/", "CFPB, Regulation E (12 CFR Part 1005)"],
  "State AI companion chatbot laws (e.g. California, New York)":["https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB243", "California SB 243 (2025), companion chatbots"],
  "State age-verification laws for adult content":["https://www.congress.gov/crs-product/LSB11354", "Congressional Research Service overview"],
  "State children's online safety and design laws":["https://www.congress.gov/crs-product/R49308", "Congressional Research Service, R49308"],
  "Fair housing, fair lending and equal-employment laws":["https://www.justice.gov/crt/housing-and-civil-enforcement-section", "US DOJ, Housing and Civil Enforcement Section"],
  "Digital Services Act: core duties":["https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng", "EUR-Lex, Regulation (EU) 2022/2065"],
  "Digital Services Act Article 28: protection of minors":["https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors", "European Commission, Article 28 guidelines"],
  "Digital Services Act: trader traceability":["https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng#art_30", "EUR-Lex, DSA Article 30"],
  "Digital Services Act: very large platforms":["https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng#art_33", "EUR-Lex, DSA Articles 33 to 43"],
  "Terrorist Content Online Regulation":["https://eur-lex.europa.eu/eli/reg/2021/784/oj/eng", "EUR-Lex, Regulation (EU) 2021/784"],
  "General Data Protection Regulation (GDPR)":["https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng", "EUR-Lex, Regulation (EU) 2016/679"],
  "EU AI Act: transparency duties":["https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng#art_50", "EUR-Lex, AI Act Article 50"],
  "EU anti-money-laundering rules, PSD2 and MiCA":["https://finance.ec.europa.eu/financial-crime/anti-money-laundering-and-countering-financing-terrorism-eu-level_en", "European Commission, EU anti-money-laundering rules"],
  "Online Safety Act: illegal harms duties":["https://www.legislation.gov.uk/ukpga/2023/50/section/10", "legislation.gov.uk, Online Safety Act 2023 s.10"],
  "Online Safety Act: children's safety duties":["https://www.legislation.gov.uk/ukpga/2023/50/section/12", "legislation.gov.uk, Online Safety Act 2023 s.12"],
  "Online Safety Act: age checks for pornography":["https://www.legislation.gov.uk/ukpga/2023/50/part/5", "legislation.gov.uk, Online Safety Act 2023 Part 5"],
  "Age Appropriate Design Code (Children's Code)":["https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/", "ICO, Age appropriate design code"],
  "APP fraud mandatory reimbursement":["https://www.psr.org.uk/information-for-consumers/app-fraud-reimbursement-protections/", "Payment Systems Regulator, APP fraud reimbursement"],
  "FCA rules: Consumer Duty, AML and financial promotions":["https://www.fca.org.uk/firms/consumer-duty", "FCA, Consumer Duty"],
  "Online Safety Act 2021 and industry codes":["https://www.legislation.gov.au/C2021A00076/latest/text", "Federal Register of Legislation, Online Safety Act 2021"],
  "Social media minimum age (under-16s)":["https://www.esafety.gov.au/about-us/industry-regulation/social-media-age-restrictions", "eSafety Commissioner, social media age restrictions"],
  "Mandatory reporting of child sexual abuse material":["https://laws-lois.justice.gc.ca/eng/acts/I-20.7/", "Justice Laws Website, S.C. 2011, c. 4"],
  "Proceeds of Crime (Money Laundering) and Terrorist Financing Act":["https://laws-lois.justice.gc.ca/eng/acts/P-24.501/", "Justice Laws Website, PCMLTFA"],
  "IT (Intermediary Guidelines and Digital Media Ethics Code) Rules":["https://www.meity.gov.in/documents/act-and-policies/information-technology-intermediary-guidelines-and-digital-media-ethics-code-rules-2021-it-rules-2021-IjM5QjMtQWa", "MeitY, IT Rules 2021"],
  "Digital Personal Data Protection Act 2023":["https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf", "MeitY, DPDP Act 2023 (PDF)"],
  "Digital Statute of Children and Adolescents (ECA Digital)":["https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm", "Planalto, Lei nº 15.211/2025"],
  "General Data Protection Law (LGPD)":["https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "Planalto, Lei nº 13.709/2018"]
};
const lawSrcLink = law => { const s = LAW_SRC[law]; return s ? `<a class="obl-src" href="${s[0]}" target="_blank" rel="noopener">Source: ${esc(s[1])}<svg><use href="#i-send"/></svg></a>` : ""; };

const DECISIONS = {
  social:["Will you allow adult nudity or sexual content anywhere, even behind a filter?","How will you handle newsworthy but graphic content?","What changes during elections and other high-risk events?","Do public figures get different treatment? If so, how will you keep it transparent?"],
  messaging:["Will messages be end-to-end encrypted, and how will you detect abuse without seeing content (metadata, reports, on-device signals)?","Can people be added to groups without their consent?","How long will you keep message data for investigations?"],
  video:["When does a trend become a dangerous challenge you restrict?","Who can go live, from what age, and with what history?","How will you catch re-uploads of content you've removed?"],
  creator:["Will you allow explicit content? If so, how will you verify the age and consent of everyone on camera?","How will you handle leaked or pirated creator content?","How long will you hold payouts for new creators?"],
  marketplace:["Who absorbs the loss when a buyer is scammed: the buyer, the seller or you?","Which categories are prohibited or restricted (weapons, supplements, animals, tickets)?","How will you handle brand-owner takedown requests at scale?"],
  fintech:["How much customer friction will you accept to stop fraud?","When will you reimburse scam victims, beyond what the law requires?","What will you do when you suspect a customer is being coerced?"],
  crypto:["Which jurisdictions will you block?","How will you respond to victims of investment scams who ask you to recover funds?","Will you allow transfers to self-hosted wallets, and with what checks?"],
  gaming:["Will voice and text chat be on by default for minors?","Will you sell randomized items, and to whom?","How will you separate cheating, toxicity and real-world threats in enforcement?"],
  dating:["Will you act on reports of off-platform behavior, such as assault after a date?","Will you offer ID verification or background checks, and in which markets?","How will you stop banned users returning with new photos?"],
  genai:["What will the model refuse, and how will you measure over-refusal as well as harmful output?","Can users generate images of real people?","What happens when a user expresses suicidal intent?","Will minors be allowed, and with what restrictions?"],
  gig:["What happens to a worker's income when they are deactivated, and how do they appeal?","Will you run background checks, and how often?","How will you respond to assaults reported by workers or customers?"],
  rentals:["What is your policy on cameras inside and outside listings?","Who pays when a guest is scammed by a fake listing?","How will you prevent discrimination by hosts?"],
  edtech:["Can students message each other, or teachers, privately?","Who at the school is told about safeguarding concerns, and how fast?","What happens when a student discloses abuse?"],
  health:["How will you tell recovery content apart from pro-eating-disorder content?","Who handles imminent-risk cases, and during which hours?","Will you allow medical claims or product promotion?"],
  workplace:["Who is responsible for harassment between a customer's employees: you or the customer's admin?","Will you ever review customer content, and under what terms?","How will you handle abuse from free-tier accounts?"]
};
function derivedDecisions(c){
  const p = c.p;
  return [
    [c.minors&&c.comms&&!c.noContact, "Can adults and under-18s interact at all? If so, on which surfaces and with what limits?"],
    [c.guest, "What can guests do without an account, and which actions require one?"],
    [c.anon||c.guest, "How will you stop banned users from coming straight back without identity checks?"],
    [p.adult==="nudity", "Where exactly is the line between permitted nudity and sexual content, and who decides edge cases?"],
    [p.team==="none"||p.team==="parttime", "Who gets woken up at 2 a.m. for a child-safety or threat-to-life report?"],
    [p.regions.length>1, "Will you apply one global policy, or vary enforcement by country to meet local law?"],
    [c.moneyMoves, "When a user is scammed, who absorbs the loss: the user, the counterparty or you?"],
    [c.A("creators"), "How will enforcement affect people's income, and do they get a faster appeal?"],
    [c.F("discovery"), "What is allowed on the platform but not eligible for recommendation?"]
  ].filter(x=>x[0]).map(x=>x[1]);
}
