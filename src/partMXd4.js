/* ---------- Metrics: plain-English questions and a glossary ---------- */
// The question each metric answers, in plain words
const MX_Q = {
  "Violating-content prevalence":"Out of everything people see, how much breaks our rules?",
  "Harmful reach before action":"How many people see harmful content before we take it down?",
  "Fraud loss rate":"How much money do we lose to fraud for every dollar that moves through us?",
  "Prohibited-listing prevalence":"How much of what's for sale shouldn't be?",
  "Toxicity per 1,000 match-hours":"How often do players run into abuse while they play?",
  "Churn after toxic exposure":"Do people quit after they've been abused?",
  "Violating-generation rate":"How often does our AI produce something it shouldn't?",
  "Over-refusal rate":"How often does our AI refuse perfectly reasonable requests?",
  "Jailbreak success rate":"How often can attackers trick our AI into breaking its rules?",
  "Romance-scam reports per 10k matches":"How often are our users targeted by romance scammers?",
  "Verified-profile share":"How many of our active users have proven who they are?",
  "User-report rate":"How often do users flag problems to us?",
  "Repeat-offender rate":"After we act, do people stop breaking the rules or keep going?",
  "Proactive detection rate":"How much harm do we catch before anyone has to report it?",
  "Precision and recall by policy area":"When our systems act, are they right, and how much do they miss?",
  "Time to detect emerging trends":"How long does a new kind of abuse run before we notice it?",
  "Appeal overturn rate":"When someone appeals, how often were we wrong?",
  "QA agreement rate":"Do our reviewers make the same call an expert would?",
  "Consistency across languages and markets":"Are we as accurate in every language as we are in our best one?",
  "Time to action by severity (p90)":"How fast do we act on the most serious problems?",
  "SLA attainment":"Do we hit the response times we promised?",
  "Backlog age":"Is work piling up faster than we can handle it?",
  "Cost per decision":"What does each moderation decision cost us?",
  "Graphic-exposure hours per reviewer":"How much disturbing content is each reviewer seeing?",
  "Attrition and wellness-support usage":"Are we burning out the people who keep users safe?",
  "Statement-of-reasons coverage":"When we restrict someone, do we properly tell them why?",
  "Illegal-content notice handling time":"How fast do we respond when someone formally reports illegal content?",
  "Systemic-risk assessment currency":"Are our legally required risk assessments up to date?",
  "Account takeover rate":"How often do attackers take over our users' accounts?",
  "Unsafe-contact rate for minors":"How often do adults try to contact children inappropriately on our product?",
  "Age-assurance coverage":"Do we actually know which of our users are children?",
  "Safety incidents per 10k trips":"How often is someone hurt or put in danger during a trip or booking?"
};

// Jargon, explained on hover. Keys are matched case-insensitively as whole words.
const MX_GLOSS = {
  "p50":"The median: half of cases are faster than this.",
  "p90":"90% of cases are faster than this. It shows your slow tail, which is where incidents come from.",
  "basis points":"One basis point is 0.01%. 30 basis points is 0.30%.",
  "prevalence":"The share of what users see that breaks a rule.",
  "precision":"Of everything your system acted on, the share that really broke the rules.",
  "recall":"Of all the rule-breaking content out there, the share your system caught.",
  "confidence interval":"The range the true value probably sits in, given how big your sample was.",
  "GMV":"Gross merchandise value: the total value of everything sold on your marketplace.",
  "DAU":"Daily active users.",
  "SLA":"Service-level agreement: the response time you've committed to.",
  "classifier":"A machine-learning model that labels content, for example spam or not spam.",
  "matched cohort":"A comparison group chosen to look like the group you're studying, so the main difference is the thing you're measuring.",
  "stratified":"Sampled separately within each group (for example each category), so small groups still get enough samples.",
  "trusted flagger":"An organization officially recognized under the EU DSA to report illegal content. Its notices must be handled first.",
  "statement of reasons":"The explanation the EU DSA requires you to send a user when you restrict their content or account.",
  "KYC":"Know your customer: checking a customer's identity, as financial rules require.",
  "red team":"People who deliberately attack your system to find weaknesses before real attackers do.",
  "jailbreak":"A prompt written to trick an AI into ignoring its safety rules.",
  "prompt injection":"Hidden instructions in a document, web page or tool result that try to take control of an AI.",
  "hash matching":"Comparing files against a database of known illegal images by their digital fingerprint.",
  "brigading":"A coordinated group mass-reporting or piling onto a target.",
  "ban evasion":"A banned user coming back with a new account.",
  "chargeback":"When a card issuer reverses a payment, usually because the cardholder disputed it.",
  "liveness":"A check that a real person is in front of the camera, not a photo or deepfake.",
  "age assurance":"Any method of estimating or verifying a user's age, from a typed birth date to an ID check.",
  "north star":"One of the few top-level numbers that show whether users are actually safer."
};
// Built on first use, so terms added by later parts are included
let MX_GLOSS_RE = null, MX_GLOSS_KEY = null;
// Escape text and underline the first use of each term on the page. "seen" is shared across one page.
function mxGloss(text, seen){
  if(!MX_GLOSS_RE){
    MX_GLOSS_RE = new RegExp("\\b(" + Object.keys(MX_GLOSS).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(s?)\\b", "gi");
    MX_GLOSS_KEY = Object.fromEntries(Object.keys(MX_GLOSS).map(k => [k.toLowerCase(), k]));
  }
  return esc(text).replace(MX_GLOSS_RE, (m, term, plural) => {
    const k = MX_GLOSS_KEY[term.toLowerCase()];
    if(!k || seen.has(k)) return m;
    seen.add(k);
    return `<span class="gl" tabindex="0" data-tip="${esc(MX_GLOSS[k])}">${m}</span>`;
  });
}
