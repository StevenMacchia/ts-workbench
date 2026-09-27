/* ---------- Metrics: child-safety reporting, user sentiment, wrongful enforcement, law-enforcement requests ---------- */
METRICS.push(
  {n:"Time to report child sexual exploitation", l:"comp", t:"health", st:1, p:"all", d:"Time from confirming apparent child sexual abuse material or exploitation to filing the required report with the authorities (in the US, the NCMEC CyberTipline).", w:"US law requires providers to report apparent child sexual exploitation to NCMEC as soon as reasonably possible, and every hour can matter to a child at risk.", trap:"A fast report with thin detail helps nobody. Track how complete each report is, not just how quick."},
  {n:"Users who feel safe", l:"outcome", t:"ns", st:2, p:"all", d:"Share of surveyed users who say they feel safe on the platform, from a regular in-product survey.", w:"It captures harm your logs never see, it is what users tell their friends, and every executive understands it.", trap:"Results drift with who answers. Keep the question wording fixed and weight answers to match your user base."},
  {n:"Good users wrongly actioned", l:"quality", t:"health", st:2, p:"all", d:"Share of active, legitimate users who had content removed, an account restricted or a payment blocked by mistake during the period.", w:"Over-enforcement drives away the users you most want to keep, and it rarely shows up on safety dashboards.", trap:"Most wrongly actioned users never appeal; they just leave. Estimate it from QA samples, not only from overturned appeals."},
  {n:"Law-enforcement request handling", l:"comp", t:"diag", st:2, p:"all", d:"Time to respond to law-enforcement and government requests for user data or removal, and the share disclosed, narrowed or rejected after review.", w:"Fast help in emergencies can save lives, and careful review of every request protects users from overreach. Both go in your transparency report.", trap:"Speed without legal review creates risk. Measure emergency requests separately from routine ones."}
);

MX_LOGS.survey = {n:"Safety surveys", t:"survey_responses", row:"One answer to an in-product safety survey", f:["response_id","user_hash","asked_at","question_id","answer","segment","weight"], tip:"Ask the same question the same way every time, and record who was asked, not only who answered."};
MX_LOGS.le = {n:"Law-enforcement requests", t:"le_requests", row:"One request from police, a court or a government agency", f:["request_id","type","country","agency","received_at","responded_at","outcome","emergency"], tip:"Log every request, including ones you reject. Rejections are what show you protect users."};

Object.assign(MX_HOW, {
"Time to report child sexual exploitation": {f:"reported_at − confirmed_at for each report, at p50 and p90", src:["act","det","legal"], steps:[
  "Route every hash match and every reviewer escalation of suspected child sexual abuse material or exploitation into one specialist queue that stamps the time a case is confirmed.",
  "File the report (in the US, through the NCMEC CyberTipline) with every required field, and log the time filed and the report ID.",
  "Preserve the content and account data as the law requires, and log that preservation happened.",
  "Report p50 and p90 time to report, the share filed within your internal target (for example 24 hours), and how complete reports were."],
  q:`SELECT DATE_TRUNC('month', confirmed_at) AS month,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY reported_at - confirmed_at) AS p50,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY reported_at - confirmed_at) AS p90,
  AVG(CASE WHEN reported_at - confirmed_at <= INTERVAL '24 hours'
      THEN 1.0 ELSE 0 END) AS within_24h
FROM child_safety_reports
GROUP BY 1
ORDER BY 1 DESC;`,
  cad:"Weekly with legal; every case tracked individually", own:"Child-safety team, with legal", dir:"down", rv:"w",
  ex:"Median time to report is 6 hours, but p90 is 3 days because weekend cases wait for a specialist. A weekend on-call rota brings p90 under 24 hours.",
  mvp:"Keep a log of every child-safety report: when you confirmed it, when you filed it, and the report ID.", pair:"Proactive detection rate"},

"Users who feel safe": {f:"respondents answering safe or very safe ÷ all respondents (weighted)", src:["survey","use"], steps:[
  "Pick one fixed question, such as \"How safe do you feel on our app?\" on a five-point scale, and never change the wording.",
  "Ask a random sample of active users in the product every month, and cap how often any one person is asked.",
  "Weight answers to match your user base (region, age band, tenure), and report the share answering safe or very safe with a confidence interval.",
  "Split by group: new users, women, younger users, creators. The gaps between groups matter more than the average."],
  q:`SELECT segment,
  SUM(CASE WHEN answer IN ('safe', 'very_safe') THEN weight ELSE 0 END)
    / SUM(weight) AS feel_safe,
  COUNT(*) AS responses
FROM survey_responses
WHERE question_id = 'feel_safe'
  AND asked_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY segment;`,
  cad:"Monthly survey, reported quarterly", own:"User research, with T&S", dir:"up", rv:"q",
  ex:"74% of users say they feel safe, but only 58% of women aged 18 to 24. That gap, not the average, is the headline for leadership.",
  mvp:"Add one fixed question to a survey you already run, and track the answer every quarter.", pair:"Violating-content prevalence"},

"Good users wrongly actioned": {f:"legitimate users wrongly actioned ÷ active users", src:["qa","app","act","use"], steps:[
  "Estimate wrong actions per policy: the error rate from blind QA samples multiplied by the number of actions, plus overturned appeals.",
  "Count the unique users affected, not the number of actions.",
  "Divide by active users for the same period.",
  "Follow what happened to those users next (retention, support contacts, spend) to show the cost of mistakes."],
  q:`SELECT DATE_TRUNC('month', a.decided_at) AS month,
  COUNT(DISTINCT a.account_id) FILTER (
    WHERE ap.outcome = 'overturned' OR q.expert_label = 'not_violating'
  ) * 1.0 / MAX(u.active_users) AS known_wrong_share
FROM enforcement_actions a
LEFT JOIN appeals ap ON ap.action_id = a.action_id
LEFT JOIN qa_reviews q ON q.action_id = a.action_id
JOIN monthly_active u ON u.month = DATE_TRUNC('month', a.decided_at)
GROUP BY 1;
-- Counts known errors only. Scale up by the QA error rate for unchecked actions.`,
  cad:"Monthly", own:"Quality team, with product analytics", dir:"down", rv:"m",
  ex:"QA finds 4% of 250,000 monthly actions are wrong: about 10,000 actions hitting 7,500 users. That is 0.25% of 3 million active users, and they leave at twice the normal rate.",
  mvp:"Count unique users with an overturned appeal each month. It is a floor, not the full number, but it starts the conversation.", pair:"Proactive detection rate"},

"Law-enforcement request handling": {f:"responded_at − received_at per request, with the share disclosed, narrowed or rejected", src:["le"], steps:[
  "Log every request in one intake: type (emergency, subpoena, court order, removal demand), country, agency and time received.",
  "Send emergencies (imminent risk of death or serious injury) to an on-call responder with a target measured in hours.",
  "Have legal review every routine request for validity and scope, and record the outcome: disclosed, narrowed or rejected.",
  "Report volumes, outcomes and response times by country. This is what transparency reports publish."],
  q:`SELECT type, country,
  COUNT(*) AS requests,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY responded_at - received_at) AS p90_response,
  AVG(CASE WHEN outcome IN ('narrowed', 'rejected') THEN 1.0 ELSE 0 END) AS pushed_back
FROM le_requests
WHERE received_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY type, country;`,
  cad:"Monthly; emergencies tracked case by case", own:"Legal (law-enforcement response)", dir:"down", rv:"q",
  ex:"Emergency requests are answered in 2 hours at p90 and routine ones in 12 days. 18% were narrowed or rejected after legal review, which goes in your transparency report.",
  mvp:"A shared inbox for legal requests, and a sheet logging type, country, received, answered and outcome.", pair:"Time to report child sexual exploitation"}
});

Object.assign(MX_Q, {
  "Time to report child sexual exploitation":"How quickly do we report child exploitation to the authorities?",
  "Users who feel safe":"Do our users actually feel safe here?",
  "Good users wrongly actioned":"How many innocent users do we hurt by mistake?",
  "Law-enforcement request handling":"Do we handle police and government requests fast and carefully?"
});
Object.assign(MX_SC, {
  "Time to report child sexual exploitation":["Time to report, p90","hours"],
  "Users who feel safe":["Feel safe or very safe","%"],
  "Good users wrongly actioned":["Active users wrongly actioned","%"],
  "Law-enforcement request handling":["Emergency requests, p90","hours"]
});
Object.assign(MX_DEMO, {
  "Time to report child sexual exploitation":[24, 72, [70, 40, 28, 20]],
  "Users who feel safe":[70, 60, [66, 68, 71, 74]],
  "Good users wrongly actioned":[0.2, 0.5, [0.6, 0.45, 0.35, 0.28]],
  "Law-enforcement request handling":[4, 12, [9, 6, 4, 3]]
});
Object.assign(MX_PF, {
  "Time to report child sexual exploitation": {
    social:"Most cases come from hash matching of known images. Track new, never-seen material separately: it needs expert review and is often more urgent.",
    kids:"Cases may involve your own young users. Pair every report with a safeguarding review of the child's account.",
    genai:"Include attempts to generate sexual content involving minors, and preserve the prompts as well as any outputs."},
  "Users who feel safe": {
    dating:"Ask after first dates as well as in the app. Offline safety is the main worry.",
    gig:"Survey workers and customers separately. Their risks are different.",
    genai:"Ask whether users trust the AI's answers to be safe and appropriate for them, not just whether they feel safe.",
    kids:"Ask parents and teachers as well as young users, and use age-appropriate wording."},
  "Good users wrongly actioned": {
    fintech:"Include blocked or held legitimate payments and wrongly frozen accounts. These are the most damaging mistakes.",
    market:"Include good sellers whose listings were removed or payouts held by mistake.",
    genai:"Count accounts wrongly suspended, alongside over-refusal of individual prompts.",
    gaming:"Include false bans from anti-cheat and chat filters, which often hit your most active players."},
  "Law-enforcement request handling": {
    fintech:"Freeze orders and legal holds need their own track, separate from data disclosures.",
    genai:"Requests may cover prompts and generated content. Decide what you retain, and document it."}
});
Object.assign(MX_GLOSS, {
  "NCMEC":"The US National Center for Missing & Exploited Children. It runs the CyberTipline, where providers report child sexual exploitation.",
  "transparency report":"A public report of how much content you removed, why, and how you handled government requests."
});

// Sample-size helper defaults: expected rate (%) and margin (± percentage points) for metrics that rely on sampling
const MX_SAMPLE = {
  "Violating-content prevalence":[0.1, 0.03], "Prohibited-listing prevalence":[1, 0.3], "Violating-generation rate":[0.5, 0.2],
  "Over-refusal rate":[5, 1.5], "Precision and recall by policy area":[90, 3], "QA agreement rate":[90, 3],
  "Consistency across languages and markets":[90, 4], "Users who feel safe":[70, 3], "Good users wrongly actioned":[4, 1]
};
const mxSampleN = (pct, margin, z) => { const p = pct / 100, e = margin / 100; return p > 0 && p < 1 && e > 0 ? Math.ceil(z * z * p * (1 - p) / (e * e)) : null; };
function mxSampleHTML(key, def){
  const [p, e] = def || [1, 0.5], n = mxSampleN(p, e, 1.96);
  return `<div class="mxss" data-ss="${esc(key)}">
    <h4>How many should you sample?</h4>
    <div class="mxss-in">
      <label class="mxa-y"><span>Expected rate (%)</span><input class="input" data-ssf="p" inputmode="decimal" value="${p}"></label>
      <label class="mxa-y"><span>Margin of error (± points)</span><input class="input" data-ssf="e" inputmode="decimal" value="${e}"></label>
      <label class="mxa-y"><span>Confidence</span><select class="select" data-ssf="z"><option value="1.645">90%</option><option value="1.96" selected>95%</option><option value="2.576">99%</option></select></label>
    </div>
    <p class="mxss-out" aria-live="polite">${mxSampleOut(n)}</p>
  </div>`;
}
const mxSampleOut = n => n ? `Label about <b>${n.toLocaleString("en-US")}</b> randomly sampled items. <span>Halving the margin needs four times as many, and rarer events need far bigger samples.</span>` : `<span>Enter a rate between 0 and 100 and a margin above 0.</span>`;
