/* ---------- Metrics: how to measure each one (data) ---------- */
// The event logs every T&S metric is computed from. Table names match the starter queries.
const MX_LOGS = {
  imp:   {n:"Random exposure sample", t:"exposure_sample", row:"One randomly sampled view (or live listing), labeled by a trained reviewer", f:["view_id","content_id","surface","market","sampled_at","label","policy","labeler_id"], tip:"Sample views, not items. A post seen a million times should be a million times more likely to be picked."},
  rep:   {n:"User reports", t:"user_reports", row:"One report filed by one user", f:["report_id","object_id","reporter_id","reason","channel","created_at"], tip:"Log the reason picked and the reporting surface, so you can tell a UX change from a change in harm."},
  det:   {n:"Automated detections", t:"detections", row:"One flag from a classifier, hash match or rule", f:["detection_id","object_id","model_id","model_version","score","threshold","created_at"], tip:"Keep the model version and threshold on every row, or you can never compare before and after a model change."},
  act:   {n:"Decisions and enforcement", t:"enforcement_actions", row:"One decision on one object: a post, listing, message or account", f:["action_id","object_id","account_id","policy","severity","action","source","first_seen_at","decided_at","reviewer_id","vendor","queue","language","views_at_action"], tip:"first_seen_at (the first report or detection) and source (automated, proactive or user report) are the two fields teams most often forget."},
  app:   {n:"Appeals", t:"appeals", row:"One appeal against one decision", f:["appeal_id","action_id","filed_at","resolved_at","outcome","resolver_id"], tip:"Always join back to the original action, so overturns can be split by policy, source and vendor."},
  qa:    {n:"QA re-reviews", t:"qa_reviews", row:"One decision re-reviewed blind by an expert", f:["qa_id","action_id","original_label","expert_label","expert_id","sampled_at"], tip:"Experts must not see the original decision or reviewer, or agreement will be inflated."},
  inc:   {n:"Incident log", t:"incidents", row:"One incident or emerging trend, with its timeline", f:["incident_id","severity","first_item_at","first_signal_at","triaged_at","mitigated_at"], tip:"Fill it in at every post-incident review while memories are fresh. It is the only source for detection speed."},
  ppl:   {n:"Workforce and cost", t:"reviewer_weeks", row:"One reviewer-week, plus monthly cost and headcount rollups", f:["reviewer_id","week","queue","hours","graphic_hours","vendor","monthly_cost","leavers"], tip:"Keep wellness data anonymous and aggregated. Anything at the individual level needs HR and privacy sign-off."},
  fin:   {n:"Losses and payments", t:"fraud_losses", row:"One chargeback, scam refund or buyer-protection payout", f:["loss_id","order_id","amount","reason_code","paid_at"], tip:"Get this from Finance or Payments, not from T&S tools, and agree the fraud reason codes with them up front."},
  eval:  {n:"Model evaluations", t:"eval_runs", row:"One prompt run against one model version, with a graded output", f:["run_id","prompt_id","suite","harm_area","technique","model_version","output_label","grader"], tip:"Version the prompt suite as carefully as the model. A silently changed suite makes every trend meaningless."},
  legal: {n:"Legal notices and risk register", t:"legal_notices", row:"One legal notice, or one required risk assessment with its mitigations", f:["notice_id","source_type","received_at","decided_at","sor_sent","assessment_id","last_reviewed"], tip:"Agree who timestamps receipt. Regulators start the clock when a notice arrives, not when someone opens it."},
  use:   {n:"Usage denominators", t:"daily_usage", row:"Daily totals from product analytics: active users, views, GMV, match-hours, matches", f:["day","region","dau","views","gmv","match_hours","matches"], tip:"Take denominators from the same source the company reports to the board, so your rates reconcile with theirs."}
};

// What "content", "exposure" and "scale" mean on each platform type
const MX_UNITS = {
  social: {obj:"posts, comments, messages and media", exp:"content views", den:"daily active users"},
  market: {obj:"listings, sellers, messages and orders", exp:"listing views", den:"GMV and order volume"},
  gaming: {obj:"players, chat, voice sessions and user-made content", exp:"match-hours", den:"hours played"},
  dating: {obj:"profiles, photos, messages and matches", exp:"matches and conversations", den:"matches"},
  genai:  {obj:"prompts, generations and uploaded files", exp:"generations", den:"prompts served"}
};

// How to instrument each layer: where the data lives, who owns it, the hard part
const MX_LAYER_HOW = {
  outcome: ["A labeled random sample of what users see, plus user reports, finance data and retention data.", "Data science runs the pipeline. Policy owns the labeling guidelines. Finance owns loss.", "Prevalence needs a sampling pipeline and trained labelers. Nothing else tells you what users actually experience."],
  detect:  ["Detection and enforcement logs, joined to expert QA labels.", "Detection or ML engineering, with T&S operations.", "Recall needs an estimate of what you missed, and that only comes from labeling content nobody flagged."],
  quality: ["Appeals and blind expert re-reviews.", "A quality team that is independent of the operations team it measures.", "Independence. If the people being measured choose the QA sample, the number will always look great."],
  ops:     ["Your case-management tool: queue timestamps and decision logs.", "T&S operations and workforce management.", "Consistent clocks. Decide once whether time starts at creation, report or detection, and never change it quietly."],
  people:  ["Workforce management, HR and vendor reports.", "T&S leadership with HR and wellness partners.", "Privacy. Measure enough to protect people without surveilling them."],
  comp:    ["Legal notice intake, statements of reasons and the risk register.", "Legal or compliance, with T&S operations.", "Evidence. Auditors ask you to prove it, so every step needs a timestamp and a named owner."]
};

// Per metric: f formula, src logs, steps, q starter query, cad cadence, own owner,
// dir target direction (up | down | band), rv review forum (w | m | q | r), ex worked example,
// mvp minimum version without a data team, pair the guardrail metric to read it with.
const MX_HOW = {
"Violating-content prevalence": {f:"violating views in the sample ÷ all views in the sample", src:["imp","use"], steps:[
  "Draw a uniform random sample of content views every day (for example 1 in 100,000 impressions). Sample views, not posts.",
  "Send each sampled item to trained labelers who apply the current policy blind: two labels per item, with an expert tiebreak.",
  "Compute the violating share overall and per policy area, and always report a 95% confidence interval with it.",
  "Size the sample so the interval is useful. Near 0.1% prevalence you need about 40,000 labeled views for a ±0.03 point interval."],
  q:`SELECT surface,
  AVG(CASE WHEN label = 'violating' THEN 1.0 ELSE 0 END) AS prevalence,
  COUNT(*) AS sampled_views
FROM exposure_sample
WHERE sampled_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY surface;
-- 95% interval = 1.96 * SQRT(prevalence * (1 - prevalence) / sampled_views)`,
  cad:"Daily sample, reported monthly on a trailing 28 days", own:"Data science, with policy for labeling", dir:"down", rv:"q",
  ex:"In 28 days you label 50,000 sampled views and 60 violate. Prevalence is 0.12%, about 12 in every 10,000 views, ±0.03 points.",
  mvp:"Each week, pull 200 randomly chosen views from your logs and have two people label them in a spreadsheet. Imprecise, but real.", pair:"Appeal overturn rate"},

"Harmful reach before action": {f:"views a violating item received before it was actioned, at p50 and p90", src:["act","use"], steps:[
  "Keep a running view counter on every object, and copy it into the decision log (views_at_action) when you act.",
  "Limit it to actions that removed or restricted content for a violation.",
  "Report the median and 90th percentile per policy area and per source (proactive or user report).",
  "Look at the top 1% of items on their own. A few viral items usually account for most of the harmful reach."],
  q:`SELECT policy,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY views_at_action) AS p50_views,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY views_at_action) AS p90_views,
  SUM(views_at_action) AS total_harmful_views
FROM enforcement_actions
WHERE action IN ('remove', 'restrict')
  AND decided_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY policy;`,
  cad:"Weekly", own:"T&S operations, with data science", dir:"down", rv:"m",
  ex:"Hate-speech removals have a median of 40 views before action but a p90 of 9,000. The fix is faster triage of fast-growing content, not faster review of everything.",
  mvp:"When you remove something, write the view count shown on it into the case notes.", pair:"Time to action by severity (p90)"},

"Fraud loss rate": {f:"fraud losses ÷ GMV × 10,000 (basis points)", src:["fin","use"], steps:[
  "Agree with Finance which losses count: fraud chargebacks, scam refunds, buyer-protection payouts and goodwill credits.",
  "Attribute each loss to the month of the original order (a cohort view), not the month the chargeback arrived.",
  "Divide by the GMV of the same order cohort and express it in basis points.",
  "Mark the last three months as provisional. They will rise as late chargebacks arrive."],
  q:`WITH loss AS (
  SELECT order_id, SUM(amount) AS amt FROM fraud_losses GROUP BY order_id)
SELECT DATE_TRUNC('month', o.ordered_at) AS order_month,
  10000.0 * SUM(COALESCE(loss.amt, 0)) / SUM(o.gmv) AS fraud_loss_bps
FROM orders o
LEFT JOIN loss ON loss.order_id = o.order_id
GROUP BY 1 ORDER BY 1;`,
  cad:"Monthly, with recent months marked provisional", own:"Payments risk or Finance, with T&S", dir:"down", rv:"q",
  ex:"$180,000 of fraud losses on $60M of GMV is 30 basis points (0.30%).",
  mvp:"Ask Finance for the monthly chargeback and refund report, and divide it by GMV yourself.", pair:"Verified-profile share"},

"Prohibited-listing prevalence": {f:"violating listings in a random sample of live listings ÷ listings sampled, per category", src:["imp","act"], steps:[
  "Each week, sample live listings at random, stratified by category so small high-risk categories get enough samples.",
  "Have trained reviewers label each one compliant, prohibited, counterfeit or misrepresented. Use brand-authentication help for counterfeits.",
  "Weight each category by its share of listing views to get a buyer-exposure figure.",
  "Report your worst three categories on their own, not just the blended number."],
  q:`SELECT category,
  AVG(CASE WHEN label <> 'compliant' THEN 1.0 ELSE 0 END) AS prohibited_share,
  COUNT(*) AS sampled
FROM listing_sample
WHERE sampled_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY category
ORDER BY prohibited_share DESC;`,
  cad:"Weekly sample, monthly report", own:"Marketplace integrity, with category managers", dir:"down", rv:"m",
  ex:"Overall prevalence is 0.8%, but luxury handbags sit at 6%. That category gets authentication requirements; the rest of the catalog does not need them.",
  mvp:"Every Friday, review 50 random live listings in your riskiest category.", pair:"Precision and recall by policy area"},

"Toxicity per 1,000 match-hours": {f:"confirmed toxic incidents ÷ match-hours × 1,000", src:["act","rep","use"], steps:[
  "Count incidents confirmed by review or by a high-precision classifier, not raw reports.",
  "Take match-hours from game telemetry for the same period, modes and regions.",
  "Break it out by channel (text, voice, gameplay griefing) and by mode. Ranked and casual play behave differently.",
  "Measure voice from its own labeled sample of sessions (where players have consented), because players rarely report voice abuse."],
  q:`-- daily_mode_stats: one row per mode per day,
-- joining telemetry hours to confirmed incidents
SELECT mode,
  1000.0 * SUM(confirmed_incidents) / SUM(match_hours) AS incidents_per_1k_hours
FROM daily_mode_stats
WHERE day >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY mode;`,
  cad:"Weekly, and daily during launches and events", own:"Player safety, with game analytics", dir:"down", rv:"m",
  ex:"1,200 confirmed incidents over 400,000 match-hours is 3 per 1,000 hours. A new mode launching at 7 is a clear signal before reports pile up.",
  mvp:"Each month, divide confirmed reports by the hours played shown in your game analytics dashboard.", pair:"Churn after toxic exposure"},

"Churn after toxic exposure": {f:"30-day retention of matched unexposed users − 30-day retention of exposed users", src:["act","use"], steps:[
  "Define exposure: the user was the target of a confirmed incident, not only someone who reported one.",
  "For each exposed user, pick an unexposed user with similar tenure, activity, region and device (a matched cohort).",
  "Compare the share of each group still active 30 days later.",
  "Repeat every quarter. Present it as a range, and call it an association unless you have run a proper causal analysis."],
  q:`SELECT cohort,  -- 'exposed' or 'matched_control'
  AVG(CASE WHEN active_day_30 THEN 1.0 ELSE 0 END) AS retention_30d,
  COUNT(*) AS users
FROM exposure_cohorts
WHERE cohort_month = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')
GROUP BY cohort;`,
  cad:"Quarterly", own:"Data science", dir:"down", rv:"q",
  ex:"Exposed players retain at 52% after 30 days against 61% for matched players. A 9-point gap across 20,000 exposed players a month is a number a CFO understands.",
  mvp:"Compare the 30-day retention of players who filed a harassment report with everyone else. Rough, but directional.", pair:"Toxicity per 1,000 match-hours"},

"Violating-generation rate": {f:"violating outputs ÷ outputs graded, shown separately for the eval suite and for production samples", src:["eval","imp"], steps:[
  "Keep a versioned evaluation suite of prompts per harm area (for example self-harm, weapons, sexual content, hate), with the expected behavior for each.",
  "Run it on every model or system-prompt change, and grade outputs against a rubric. Model graders are fine if you check them against humans.",
  "Separately, sample real production conversations at random, remove personal data, and grade them the same way.",
  "Report both. The suite catches regressions between releases; production shows what users actually get."],
  q:`SELECT suite, harm_area, model_version,
  AVG(CASE WHEN output_label = 'violating' THEN 1.0 ELSE 0 END) AS violating_rate,
  COUNT(*) AS graded
FROM eval_runs
GROUP BY suite, harm_area, model_version
ORDER BY model_version DESC;`,
  cad:"Every release, plus a weekly production sample", own:"Model safety or evaluations team", dir:"down", rv:"r",
  ex:"Version 4.2 produces violating output on 0.6% of the self-harm suite against 0.2% for 4.1. The release waits until it is fixed.",
  mvp:"A spreadsheet of 200 risky prompts, run by hand before each release and graded by two people.", pair:"Over-refusal rate"},

"Over-refusal rate": {f:"refused or heavily hedged answers to benign prompts ÷ benign prompts graded", src:["eval"], steps:[
  "Build a benign suite that looks risky but is fine: medical questions, safety research, history, dark fiction.",
  "Grade each answer as helpful, hedged (answers but buries it) or refused.",
  "Run it with the violation suite on every release, and chart the two lines together.",
  "Sample production conversations where the model refused, and label how many were actually benign."],
  q:`SELECT model_version,
  AVG(CASE WHEN output_label IN ('refused', 'hedged') THEN 1.0 ELSE 0 END)
    AS over_refusal_rate
FROM eval_runs
WHERE suite = 'benign_borderline'
GROUP BY model_version;`,
  cad:"Every release", own:"Model safety, with product", dir:"down", rv:"r",
  ex:"A new filter halves violating output but raises over-refusal from 3% to 11%. The team tunes it before shipping, because users would leave.",
  mvp:"Add 100 benign but edgy prompts to the same spreadsheet and grade them in the same session.", pair:"Violating-generation rate"},

"Jailbreak success rate": {f:"attacks that produce violating output ÷ attacks attempted, per technique family", src:["eval"], steps:[
  "Group known attacks into families: role-play, encoding, many-shot, prompt injection through documents or tools, multi-turn escalation.",
  "Keep a few dozen variants of each family and run all of them on every release.",
  "Add new techniques from bug bounty reports, red-team exercises and public research within a week of discovery.",
  "Report per family. A blended rate hides the family that works every time."],
  q:`SELECT technique, model_version,
  AVG(CASE WHEN output_label = 'violating' THEN 1.0 ELSE 0 END) AS success_rate,
  COUNT(*) AS attempts
FROM eval_runs
WHERE suite = 'jailbreak'
GROUP BY technique, model_version;`,
  cad:"Every release, and when a new technique is published", own:"Red team", dir:"down", rv:"r",
  ex:"Role-play attacks succeed 2% of the time, but prompt injection through uploaded documents succeeds 18%. That is where engineering time goes next.",
  mvp:"Keep a list of every attack that has worked on you, and re-run all of them before each release.", pair:"Over-refusal rate"},

"Romance-scam reports per 10k matches": {f:"confirmed romance-scam cases ÷ matches × 10,000", src:["rep","act","use"], steps:[
  "Count only cases confirmed by review, and count scammer accounts too, so one scammer with 40 victims is visible.",
  "Take matches from product analytics for the same period and region.",
  "Show cases caught proactively, before any victim reported, as a separate line.",
  "Track the time from first message to the first request for money or to move off the platform. That is the pattern to detect early."],
  q:`SELECT week, region,
  10000.0 * SUM(confirmed_scam_cases) / SUM(matches) AS cases_per_10k_matches,
  SUM(proactive_scam_cases) AS caught_before_report
FROM weekly_region_stats
GROUP BY week, region
ORDER BY week DESC;`,
  cad:"Weekly", own:"Dating safety team", dir:"down", rv:"m",
  ex:"84 confirmed cases across 300,000 matches is 2.8 per 10,000. If 60% were caught before a report, show both numbers.",
  mvp:"Tag every confirmed scam case in your ticketing tool, and divide the monthly count by monthly matches.", pair:"Proactive detection rate"},

"Verified-profile share": {f:"active accounts that passed verification ÷ all active accounts", src:["use","act"], steps:[
  "Store verification status, method (ID document, selfie liveness, phone, bank) and date on the account record.",
  "Count only accounts active in the period, so dormant verified accounts do not inflate the number.",
  "Split by method. A phone check and a liveness check are not the same level of assurance.",
  "Compare violation rates of verified and unverified accounts, to prove verification is worth its friction."],
  q:`SELECT verification_method,  -- includes 'none'
  COUNT(*) * 1.0 / SUM(COUNT(*)) OVER () AS share_of_active
FROM accounts
WHERE last_active_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY verification_method;`,
  cad:"Monthly", own:"Identity or integrity team", dir:"up", rv:"m",
  ex:"38% of active sellers are verified, and they account for 9% of fraud cases. That makes the case for requiring verification above a sales threshold.",
  mvp:"Take the pass count from your verification vendor's dashboard and divide by monthly active users.", pair:"Fraud loss rate"},

"User-report rate": {f:"user reports ÷ daily active users × 1,000, per policy area", src:["rep","use"], steps:[
  "Count reports, and separately count unique items reported. One viral item can draw thousands of reports.",
  "Divide by daily active users for the same day and region.",
  "Annotate the chart with every change to the reporting flow. UX changes move this number on their own.",
  "Alert on a sudden spike in one reason. It is often the first sign of a new trend or a brigading campaign."],
  q:`SELECT r.day, r.reason,
  1000.0 * r.reports / u.dau AS reports_per_1k_dau,
  r.unique_items
FROM (SELECT DATE(created_at) AS day, reason,
        COUNT(*) AS reports, COUNT(DISTINCT object_id) AS unique_items
      FROM user_reports GROUP BY 1, 2) r
JOIN daily_usage u ON u.day = r.day;`,
  cad:"Daily dashboard, weekly review", own:"T&S operations", dir:"band", rv:"w",
  ex:"Reports per 1,000 DAU jump from 4 to 9 overnight, but unique items barely move. It is a brigading campaign against a few accounts, not a rise in harm.",
  mvp:"Most ticketing tools can chart tickets per day by reason. Divide by DAU in a spreadsheet.", pair:"Violating-content prevalence"},

"Repeat-offender rate": {f:"actions on accounts with a prior violation in the last 90 days ÷ all actions", src:["act"], steps:[
  "For each action, look back 90 days on the same account for an earlier confirmed violation.",
  "Split by the earlier penalty (warning, restriction, suspension) to see which penalties actually deter.",
  "Link accounts by device, payment and contact signals where your privacy policy allows, so ban evasion is counted.",
  "Report per policy area. Spam and harassment behave very differently."],
  q:`SELECT a.policy,
  AVG(CASE WHEN EXISTS (
        SELECT 1 FROM enforcement_actions p
        WHERE p.account_id = a.account_id
          AND p.decided_at <  a.decided_at
          AND p.decided_at >= a.decided_at - INTERVAL '90 days')
      THEN 1.0 ELSE 0 END) AS repeat_share
FROM enforcement_actions a
WHERE a.decided_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY a.policy;`,
  cad:"Monthly", own:"Policy, with T&S operations", dir:"down", rv:"m",
  ex:"31% of harassment actions hit accounts warned in the last 90 days, but only 8% follow a 7-day suspension. Warnings are not deterring anyone.",
  mvp:"Add a \"prior strike in the last 90 days?\" checkbox to your case form.", pair:"Appeal overturn rate"},

"Proactive detection rate": {f:"violations actioned before any user report ÷ all violations actioned", src:["act","det","rep"], steps:[
  "Tag every action with its source: automated detection, proactive human review, or user report.",
  "Count an action as proactive only if no user report on that object exists before the action time.",
  "Report per policy area. Spam will sit near 100% and harassment much lower, and both can be healthy.",
  "Read it next to precision. A rising proactive rate with falling precision means you are catching more innocent content."],
  q:`SELECT a.policy,
  AVG(CASE WHEN NOT EXISTS (
        SELECT 1 FROM user_reports r
        WHERE r.object_id = a.object_id AND r.created_at < a.decided_at)
      THEN 1.0 ELSE 0 END) AS proactive_rate
FROM enforcement_actions a
WHERE a.decided_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY a.policy;`,
  cad:"Monthly", own:"Detection engineering", dir:"up", rv:"m",
  ex:"9,300 of 12,000 hate-speech actions happened before any report: a proactive rate of 77.5%.",
  mvp:"Tag each case \"found by us\" or \"reported by a user\" in your ticketing tool.", pair:"Precision and recall by policy area"}
};
