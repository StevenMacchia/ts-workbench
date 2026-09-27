/* ---------- Metrics: more platform types, platform notes, scorecard fields ---------- */
Object.assign(MX_PLATFORMS, {fintech:"Fintech & payments", gig:"Gig, delivery & rentals", kids:"Kids & education"});
Object.assign(MX_UNITS, {
  fintech: {obj:"accounts, payments, payees and payment notes", exp:"transactions", den:"payment volume and active accounts"},
  gig:     {obj:"workers, customers, bookings, messages and reviews", exp:"completed trips, bookings or deliveries", den:"completed trips or bookings"},
  kids:    {obj:"young users' profiles, messages, posts and classroom content", exp:"views and messages involving young users", den:"active young users"}
});
METRICS.push(
  {n:"Account takeover rate", l:"outcome", t:"ns", st:1, p:["fintech","market","gaming"], d:"Confirmed account takeovers per 10,000 active accounts, with the money or data lost.", w:"Takeovers hurt your most loyal users, and the losses land on you or on them.", trap:"Victims report late or blame themselves. Count cases found by detection, not just reports."},
  {n:"Unsafe-contact rate for minors", l:"outcome", t:"ns", st:1, p:["kids","social","gaming"], d:"Confirmed cases of adults seeking inappropriate contact with minors (grooming, sexual solicitation, sextortion) per 10,000 young users.", w:"The harm with the worst consequences on any product children use, and the first thing regulators check.", trap:"Children rarely report it themselves. Reports alone will badly undercount it."},
  {n:"Age-assurance coverage", l:"detect", t:"health", st:2, p:["kids","social","gaming","dating"], d:"Share of active users whose age was checked by something stronger than a typed date of birth, and how many under-age users were found.", w:"Every child-safety protection depends on knowing who is a child. Regulators such as Ofcom now expect highly effective age checks where children could see the most harmful content.", trap:"Self-declared age is not age assurance. Counting it inflates coverage."},
  {n:"Safety incidents per 10k trips", l:"outcome", t:"ns", st:1, p:["gig"], d:"Confirmed safety incidents (assault, harassment, dangerous driving, property damage) per 10,000 completed trips, bookings or deliveries, by severity.", w:"On gig and rental platforms the harm happens offline, and one serious incident can end up in the news or in court.", trap:"Serious incidents are rare, so monthly rates jump around. Show counts by severity and use rolling 12-month rates for the worst categories."}
);
[["Fraud loss rate", ["fintech","gig"]], ["Verified-profile share", ["fintech","gig"]], ["Harmful reach before action", ["kids"]], ["Churn after toxic exposure", ["kids"]]]
  .forEach(([n, ps]) => { const m = METRICS.find(x => x.n === n); if(m) ps.forEach(p => { if(!m.p.includes(p)) m.p.push(p); }); });
{ const f = METRICS.find(x => x.n === "Fraud loss rate"); if(f) f.d = "Fraud losses (chargebacks, scam reimbursements, buyer-protection payouts) in basis points of GMV or payment volume."; }

MX_LOGS.auth = {n:"Login and security events", t:"auth_events", row:"One login, password reset, device change or 2-step verification event", f:["event_id","account_id","event_type","device_id","ip_country","risk_score","outcome","created_at"], tip:"Keep device and location on every event. Takeovers show up as a new device followed by a credential change within minutes."};

Object.assign(MX_HOW, {
"Account takeover rate": {f:"confirmed account takeovers ÷ active accounts × 10,000", src:["auth","rep","use"], steps:[
  "Define a confirmed takeover: someone other than the owner got in and acted (changed credentials, moved money, messaged contacts), confirmed by the owner or an investigation.",
  "Link each case to the security events before it: new device, password reset, 2-step verification change, new payee.",
  "Count per 10,000 active accounts, split by how the attacker got in: phishing, reused passwords, SIM swap or session theft.",
  "Record the loss per case and the time from takeover to lock. That shows whether detection is fast enough."],
  q:`WITH ato AS (
  SELECT DATE_TRUNC('month', confirmed_at) AS month, entry_method,
         COUNT(*) AS takeovers, SUM(loss_amount) AS losses
  FROM account_takeovers
  GROUP BY 1, 2)
SELECT ato.month, ato.entry_method,
  10000.0 * ato.takeovers / u.active_accounts AS ato_per_10k,
  ato.losses
FROM ato
JOIN monthly_active u ON u.month = ato.month;`,
  cad:"Weekly, reported monthly", own:"Account security or fraud team", dir:"down", rv:"m",
  ex:"42 confirmed takeovers across 150,000 active accounts is 2.8 per 10,000. 30 came through SIM swaps, so text-message codes are the weak point.",
  mvp:"Tag every support ticket where a user says \"someone got into my account\", and confirm them weekly.", pair:"Fraud loss rate"},

"Unsafe-contact rate for minors": {f:"confirmed unsafe adult-to-minor contact cases ÷ active young users × 10,000", src:["act","rep","det","use"], steps:[
  "Define the case types with your child-safety specialists: grooming, sexual solicitation, sextortion, and adults pushing a child to move to another app.",
  "Count confirmed cases by adult account, and record how each was found: the child, a parent or teacher, or detection.",
  "Divide by active users under 18 (or your own age bands) for the same period.",
  "Record where contact started (search, recommendations, open messages, voice, friend requests) so you can close the path, not just ban the account.",
  "Cases involving apparent child sexual exploitation must be reported to the authorities (in the US, the NCMEC CyberTipline). Track that reporting with its own timestamps."],
  q:`SELECT DATE_TRUNC('month', c.confirmed_at) AS month, c.found_by,
  10000.0 * COUNT(DISTINCT c.case_id) / MAX(u.young_users) AS cases_per_10k
FROM child_safety_cases c
JOIN monthly_young_users u
  ON u.month = DATE_TRUNC('month', c.confirmed_at)
GROUP BY 1, 2
ORDER BY 1 DESC;`,
  cad:"Weekly with specialists, monthly to leadership", own:"Child-safety team", dir:"down", rv:"m",
  ex:"18 confirmed cases among 90,000 young users is 2 per 10,000. 12 began with open direct messages from accounts the child didn't follow, so the fix is a default setting, not more moderators.",
  mvp:"Give every child-safety ticket a case type and a \"how we found it\" tag, and count them monthly with a specialist.", pair:"Age-assurance coverage"},

"Age-assurance coverage": {f:"active users with an age check stronger than self-declaration ÷ active users", src:["use","act"], steps:[
  "List the age signals you use and rank them by strength: typed date of birth, age estimation (face or behavior), ID document, parent or school verification.",
  "Store the strongest method and its date on each account, and count only active accounts.",
  "Report coverage per method, and how many under-age accounts were found and removed or moved to a teen experience.",
  "Sample accounts marked as adults and check how often the method was wrong."],
  q:`SELECT age_method,  -- 'self_declared', 'estimation', 'id_document', 'parental'
  COUNT(*) * 1.0 / SUM(COUNT(*)) OVER () AS share_of_active
FROM accounts
WHERE last_active_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY age_method;`,
  cad:"Monthly", own:"T&S, with identity and product", dir:"up", rv:"m",
  ex:"Only 29% of active users have an age check stronger than a typed date of birth. Adding age estimation at sign-up raises that to 64% and finds 3,100 likely under-13 accounts in the first month.",
  mvp:"Count how many active accounts have anything stronger than a typed date of birth. That is your starting point.", pair:"Unsafe-contact rate for minors"},

"Safety incidents per 10k trips": {f:"confirmed safety incidents ÷ completed trips × 10,000, per severity level", src:["rep","act","use"], steps:[
  "Agree a severity scale with legal and insurance, for example critical (sexual assault, serious injury), high (physical fight, threats), medium (harassment, dangerous driving), low (rudeness, minor damage).",
  "Collect reports from every channel (in-app safety button, support, emergency line, police requests, insurance claims) and merge them into one case per incident.",
  "Divide by completed trips, bookings or deliveries in the same period, and report each severity level separately.",
  "Count incidents against workers as well as customers. Workers are harmed too, and report less."],
  q:`SELECT i.severity,
  10000.0 * COUNT(DISTINCT i.incident_id) / MAX(t.completed_trips) AS per_10k_trips
FROM safety_incidents i
JOIN monthly_trips t ON t.month = DATE_TRUNC('month', i.occurred_at)
WHERE i.confirmed
  AND i.occurred_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND i.occurred_at <  DATE_TRUNC('month', CURRENT_DATE)
GROUP BY i.severity;`,
  cad:"Weekly for critical incidents, monthly for rates", own:"Safety team, with legal and insurance", dir:"down", rv:"q",
  ex:"Last month had 3 critical and 41 medium incidents across 2.4 million trips: 0.0125 and 0.17 per 10,000. Each critical case gets a full review; the medium rate is the one to trend.",
  mvp:"Tag every safety ticket with a severity, and count them monthly against completed trips.", pair:"Verified-profile share"}
});

// Scorecard: the single headline number to enter for each metric, and its unit
const MX_SC = {
  "Violating-content prevalence":["Prevalence","%"], "Harmful reach before action":["p90 views before action","views"],
  "Fraud loss rate":["Fraud losses","bps"], "Prohibited-listing prevalence":["Prohibited share of live listings","%"],
  "Toxicity per 1,000 match-hours":["Incidents per 1,000 match-hours","rate"], "Churn after toxic exposure":["Retention gap","points"],
  "Violating-generation rate":["Violating outputs","%"], "Over-refusal rate":["Over-refused benign prompts","%"],
  "Jailbreak success rate":["Success rate, worst technique family","%"], "Romance-scam reports per 10k matches":["Cases per 10k matches","rate"],
  "Verified-profile share":["Verified share of active accounts","%"], "User-report rate":["Reports per 1,000 DAU","rate"],
  "Repeat-offender rate":["Repeat share of actions","%"], "Proactive detection rate":["Proactive rate","%"],
  "Precision and recall by policy area":["Precision, weakest policy area","%"], "Time to detect emerging trends":["Median time to detect","days"],
  "Appeal overturn rate":["Overturn rate","%"], "QA agreement rate":["Agreement with experts","%"],
  "Consistency across languages and markets":["Gap to your best language","points"], "Time to action by severity (p90)":["Tier 1 p90","hours"],
  "SLA attainment":["Attainment, all tiers","%"], "Backlog age":["Items older than 7 days","items"],
  "Cost per decision":["Cost per human decision","USD"], "Graphic-exposure hours per reviewer":["People over the weekly cap","people"],
  "Attrition and wellness-support usage":["Annualized attrition","%"], "Statement-of-reasons coverage":["Compliant coverage","%"],
  "Illegal-content notice handling time":["Trusted-flagger notices, p90","hours"], "Systemic-risk assessment currency":["Oldest assessment","months"],
  "Account takeover rate":["Takeovers per 10k active accounts","rate"], "Unsafe-contact rate for minors":["Cases per 10k young users","rate"],
  "Age-assurance coverage":["Coverage","%"], "Safety incidents per 10k trips":["Incidents per 10k trips, all severities","rate"]
};

// Platform notes: what changes about measuring each metric on each kind of product
const MX_PF_ON = {social:"On a social platform", market:"On a marketplace", gaming:"In a game", dating:"On a dating app", genai:"In a generative AI product", fintech:"In a fintech or payments product", gig:"On a gig, delivery or rental platform", kids:"On a product for kids or education"};
const MX_PF = {
"Violating-content prevalence": {
  social:"Sample feed, search and recommendation views separately. Recommended content usually carries the most exposure, and ranking changes move it first.",
  market:"Sample listing views, not listings, so popular listings count more. Prohibited items cluster in a few categories, so report those on their own.",
  gaming:"Sample chat lines, views of player-made content and, where players have consented, short voice clips. Report text and voice separately.",
  dating:"Sample profile views and first messages. Most harm on dating apps arrives in messages, not on public profiles.",
  genai:"Your unit is a generation. Sample production conversations, remove personal data, and label each output together with the prompt that caused it.",
  fintech:"There is little public content. Apply prevalence to what users do see: payee names, payment notes and profile text, where scams and abuse hide.",
  gig:"Apply it to listings, profiles and reviews, and to messages between workers and customers.",
  kids:"Sample what young users actually see, separately from adults. The same prevalence in a children's feed is a far bigger problem."},
"Harmful reach before action": {
  social:"Use impressions, not likes or shares. Shares from large accounts drive most of the tail.",
  gaming:"Count players who saw the item: lobby members, stream viewers, or downloads of a player-made map.",
  kids:"Count views by young users separately. The number to lower is child exposure, not total exposure."},
"Fraud loss rate": {
  market:"Include buyer-protection payouts and seller fraud (non-delivery, counterfeit refunds), not only card chargebacks.",
  fintech:"Divide by total payment volume. Split third-party fraud (stolen cards, takeovers) from first-party fraud (customers who lie), and include scam reimbursements where rules require them, such as the UK's authorized push payment scheme.",
  gig:"Divide by gross bookings. Include promotion abuse, fake trips and false refund claims, which are often bigger than card fraud."},
"Prohibited-listing prevalence": {
  market:"Split by seller age as well as category. New sellers often account for a large share of prohibited listings."},
"Toxicity per 1,000 match-hours": {
  gaming:"Use match-hours in modes where players can talk to strangers. Solo modes dilute the rate."},
"Churn after toxic exposure": {
  gaming:"Use days-played retention, and match players on skill rank. Ranked players are targeted and churn differently.",
  social:"Use 30-day active retention, and match on audience size. Larger accounts are targeted more and churn differently.",
  dating:"Focus on users harassed in their first week. That's when a bad experience makes people delete the app.",
  kids:"Involve your privacy team, report only aggregates, and include parents who close accounts after an incident."},
"Violating-generation rate": {
  genai:"Grade the whole conversation, not only the last turn. Many failures come after several turns of setup."},
"Over-refusal rate": {
  genai:"Measure image and file filters separately from text. They over-block in different ways."},
"Jailbreak success rate": {
  genai:"If your product uses tools or reads documents and web pages, test prompt injection through those inputs. Many new attacks arrive that way."},
"Romance-scam reports per 10k matches": {
  dating:"Look for the pattern: fast emotional escalation, then a push to move to another app, then talk of money or crypto investing."},
"Verified-profile share": {
  dating:"Selfie or liveness checks matter most. The main risk is fake identity, not payment fraud.",
  market:"Verify sellers first, especially above a sales threshold. Verifying buyers adds friction for less benefit.",
  fintech:"This is your KYC pass rate. Report the share verified at onboarding and after risk events, and how many legitimate customers get stuck.",
  gig:"Include background checks for workers and real-time selfie checks, which stop banned workers from using a friend's account."},
"User-report rate": {
  social:"Split reports on posts from reports on accounts. Brigading shows up as many reports against one account.",
  market:"Separate reports on listings from disputes about orders. Disputes belong with customer-support metrics.",
  gaming:"Players often report the other team after losing. Compare report rates from winning and losing sides to measure that bias.",
  dating:"Unmatch-and-report is the main signal. Track reports per conversation, not only per user.",
  genai:"Users rarely report harmful outputs. Add a thumbs-down with a \"harmful\" reason and treat it as a weak signal.",
  fintech:"Reports arrive mostly through support calls and chat. Tag those contacts, or this metric will be close to zero.",
  gig:"Most reports arrive after the trip, in ratings and support tickets. Count low ratings with safety reasons as reports.",
  kids:"Children under-report. Count reports from parents and teachers too, and make the report button easy for young users to find and understand."},
"Repeat-offender rate": {
  social:"Link accounts by device and phone number to catch people who return after a ban.",
  market:"Sellers come back under new store names. Link by payout bank account, which is hard to replace.",
  gaming:"New accounts are free. Link by hardware ID and payment method.",
  dating:"Link by phone number, device and photo matching. Banned scammers often reuse the same photos.",
  genai:"Track accounts and API keys that repeatedly hit policy blocks. They are often probing for a jailbreak.",
  fintech:"Link by identity document, device and bank details. Returning fraudsters often use mule accounts in real people's names.",
  gig:"Deactivated workers come back through someone else's account. Real-time selfie checks catch it."},
"Proactive detection rate": {
  social:"Hash matching of known illegal images makes some areas near 100%. Report them separately so they don't hide weak areas.",
  market:"Checks run when a listing is created. Count listings blocked before going live as proactive.",
  gaming:"Chat filters that block a message before it's sent count as proactive, but log them separately from removals.",
  dating:"Screening at sign-up (photo checks, device risk) catches scammers before any match. Count those blocks.",
  genai:"Input and output classifiers act before the user sees anything, so most enforcement is proactive by design. Precision matters more here.",
  fintech:"Transaction monitoring acts before a payment settles. Count held or blocked payments as proactive.",
  gig:"Signals like route changes, unexpected long stops and crash detection are proactive. Count the interventions they trigger.",
  kids:"This matters most here because children rarely report. Track it separately for contact between adults and minors."},
"Precision and recall by policy area": {
  social:"Measure per language as well as per policy. Classifiers usually do worst in languages with little training data.",
  market:"Measure precision on blocked listings per category, and learn from the evidence in upheld seller appeals.",
  gaming:"Voice classifiers need their own precision and recall. They behave differently from text.",
  genai:"Measure recall with your evaluation suite, and precision by sampling blocked prompts and outputs in production.",
  fintech:"Precision is the share of held or blocked payments that really were fraud. Every false positive is a customer who couldn't pay."},
"Time to detect emerging trends": {
  social:"Trends follow the news. Keep an events calendar and watch report spikes around elections, conflicts and viral challenges.",
  market:"Watch for new listing keywords and bursts of new sellers in one category. That is how counterfeit waves start.",
  gaming:"New exploits and scams follow game updates and item drops. Check signals closely in the days after each release.",
  genai:"New jailbreaks spread on public forums and social media. Someone should check them daily.",
  fintech:"New scam scripts show up first in customer-support contacts. Tag and review them weekly."},
"Appeal overturn rate": {
  market:"Seller appeals often include evidence such as invoices or authenticity certificates. Track which evidence leads to overturns.",
  genai:"Most users can't appeal a refusal. If you add a \"this shouldn't have been blocked\" button, treat it as an appeal.",
  fintech:"Appeals are often complaints about frozen accounts or held payments. Measure how fast they are resolved, not only the outcome."},
"Time to action by severity (p90)": {
  social:"Viral content needs action within minutes. Add speed of spread to your severity rules.",
  gaming:"Acting during the match matters most. A mute after the match ends does little for the victim.",
  dating:"Threats of violence and unsafe meetups should be tier 1, with a route to emergency help.",
  genai:"Most enforcement is automatic and instant. Measure time to action on user reports and red-team findings.",
  fintech:"For scams, speed is money: every hour before a payment is held lowers the chance of getting it back.",
  gig:"Safety reports during a live trip are tier 1 and need a real-time route, including emergency services.",
  kids:"Contact that looks like grooming is tier 1, with its own on-call route to child-safety specialists."},
"Cost per decision": {
  genai:"Include the compute cost of classifiers when you compare automated and human review."},
"Graphic-exposure hours per reviewer": {
  gaming:"Voice review can be as hard as graphic video. Count it in exposure hours.",
  genai:"Red-teamers and evaluation graders are exposed too. Include them in caps and wellness support.",
  kids:"Child-safety queues carry the highest exposure. Rotate reviewers and cap hours strictly."},
"Statement-of-reasons coverage": {
  social:"Demotions and reduced visibility need statements too. That is where most teams fall short.",
  market:"Listing removals, seller restrictions and held payments all need statements."},
"Illegal-content notice handling time": {
  social:"Notices spike during elections and crises. Plan extra capacity for trusted flaggers at those times.",
  market:"Many notices are brand complaints about counterfeits. Track intellectual-property notices separately from other illegal content."},
"Systemic-risk assessment currency": {
  kids:"Under the UK Online Safety Act, services likely to be used by children must keep a children's risk assessment up to date."},
"Account takeover rate": {
  fintech:"Include cases where the customer was tricked into sharing a code. Whether or not you reimburse them, they are takeovers.",
  market:"Seller takeovers are the costly ones: attackers change the payout bank account. Alert on payout changes after a new-device login.",
  gaming:"Stolen accounts are resold for their items. Watch for a new device followed by mass item trading."},
"Unsafe-contact rate for minors": {
  kids:"Measure across every way adults and children can meet: chat, voice, friend requests, comments and classroom tools.",
  social:"You need a reliable age signal to count young users. Read it with age-assurance coverage.",
  gaming:"Voice chat and friend requests from strangers are common starting points. Split the rate by entry path."},
"Age-assurance coverage": {
  kids:"Also measure the reverse: adults pretending to be children, which is how many grooming cases begin.",
  social:"Report coverage separately for surfaces where children could see the most harmful content.",
  gaming:"Voice and open chat often depend on age. Report coverage for players who use them.",
  dating:"Your aim is to keep minors out entirely. Report how many under-18 accounts you found and how."},
"Safety incidents per 10k trips": {
  gig:"Record where incidents happen: at pickup, during the trip or stay, or afterwards when people contact each other off the platform."}
};

// Scorecard status from the user's own value, target and off-track threshold
const MX_STAT = {on:["On track","good"], watch:["Watch","med"], off:["Off track","crit"], set:["No target yet",""]};
// Accepts what people naturally type: "0.12%", "$0.38", "1,400"
const mxNum = x => { if(x == null) return null; const s = String(x).replace(/[,%$\s]/g, ""); return s === "" || isNaN(+s) ? null : +s; };
function mxStatus(m, vals){
  const s = (vals || {})[m.n] || {}, v = mxNum(s.v), t = mxNum(s.t), a = mxNum(s.a);
  if(v == null) return null;
  const dir = (MX_HOW[m.n] || {}).dir;
  if(t == null && a == null) return "set";
  if(dir === "band") return (t != null && v < t) || (a != null && v > a) ? "off" : "on";
  const better = dir === "up" ? (x, y) => x >= y : (x, y) => x <= y;  // x at least as good as y
  if(t != null && better(v, t)) return "on";
  if(a == null) return "off";                        // missed the target, no off-track line set
  if(v === a || !better(v, a)) return "off";         // at or past the off-track line
  return t == null ? "on" : "watch";                 // between the target and the off-track line
}
function mxStatusCounts(d){
  const c = {on:0, watch:0, off:0};
  METRICS.forEach(m => { const s = mxStatus(m, d && d.vals); if(c[s] != null) c[s]++; });
  return c;
}
