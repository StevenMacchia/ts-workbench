Object.assign(MX_HOW, {
"Precision and recall by policy area": {f:"precision = correct actions ÷ all actions; recall = violations caught ÷ all violations (estimated by sampling)", src:["qa","det","imp"], steps:[
  "Precision: every week, sample each classifier's or rule's actions at random and have experts label them blind.",
  "Recall: sample content the system did not flag, label it, and scale up the misses you find to estimate what you missed overall.",
  "Report both per policy area and per model version, so a model change shows up immediately.",
  "Set a precision floor per area (for example 95% for automatic removal) before automation can act without a human."],
  q:`-- Precision, from blind QA of automated actions
SELECT a.policy, a.model_version,
  AVG(CASE WHEN q.expert_label = 'violating' THEN 1.0 ELSE 0 END) AS precision_rate
FROM qa_reviews q
JOIN enforcement_actions a ON a.action_id = q.action_id
WHERE a.source = 'automated'
GROUP BY a.policy, a.model_version;
-- Recall ≈ caught ÷ (caught + misses scaled up from the unflagged sample)`,
  cad:"Weekly for precision, monthly for recall", own:"Detection engineering, with the quality team", dir:"up", rv:"m",
  ex:"372 of 400 sampled automated removals were correct: 93% precision. Labeling 20,000 of 10 million unflagged posts finds 9 misses, about 4,500 overall. With 18,000 caught, recall is about 80%.",
  mvp:"For precision, have a senior reviewer re-check 50 automated actions a week. Leave recall until you can sample.", pair:"Proactive detection rate"},

"Time to detect emerging trends": {f:"formal triage time − time the first related item appeared", src:["inc"], steps:[
  "After every incident or new trend, search back for the earliest related item: the first post, listing or account using the pattern.",
  "Record three timestamps in the incident log: first appearance, first internal signal (a report spike, alert or analyst note) and formal triage.",
  "Report the median across incidents each quarter, with the signal-to-triage gap shown on its own.",
  "The signal-to-triage gap is usually the fastest to fix. It is about alerting and on-call, not detection."],
  q:`SELECT DATE_TRUNC('quarter', triaged_at) AS quarter,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY triaged_at - first_item_at)
    AS median_time_to_detect,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY triaged_at - first_signal_at)
    AS median_signal_to_triage
FROM incidents
GROUP BY 1 ORDER BY 1;`,
  cad:"Quarterly, filled in at every post-incident review", own:"Intelligence or threat analysis", dir:"down", rv:"q",
  ex:"A new scam script first appeared 11 days before triage, but reports spiked on day 3. The fix was an alert on report spikes, not a new classifier.",
  mvp:"Add \"When did this actually start?\" to your post-incident template.", pair:"User-report rate"},

"Appeal overturn rate": {f:"appeals that reversed the decision ÷ appeals decided", src:["app","act"], steps:[
  "Join each appeal to its original action, so you know the policy, source (automated or human), reviewer and vendor.",
  "Count only decided appeals, and report overturns per policy area and per source.",
  "Track the appeal rate too (appeals ÷ actions). A low overturn rate means little if almost nobody appeals.",
  "Send every overturn back to the quality team as a training case."],
  q:`SELECT a.policy, a.source,
  SUM(CASE WHEN ap.outcome = 'overturned' THEN 1 ELSE 0 END) * 1.0
    / NULLIF(COUNT(ap.appeal_id), 0) AS overturn_rate,
  COUNT(ap.appeal_id) * 1.0 / COUNT(*) AS appeal_rate
FROM enforcement_actions a
LEFT JOIN appeals ap
  ON ap.action_id = a.action_id AND ap.resolved_at IS NOT NULL
WHERE a.decided_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY a.policy, a.source;`,
  cad:"Monthly", own:"Quality team, independent of operations", dir:"down", rv:"m",
  ex:"Automated nudity removals are overturned 22% of the time on appeal against 4% for human removals. That classifier's threshold is too aggressive.",
  mvp:"Tag appeal tickets upheld or overturned, and count them each month.", pair:"Proactive detection rate"},

"QA agreement rate": {f:"sampled decisions where the expert agrees ÷ decisions sampled", src:["qa","act"], steps:[
  "Each week, draw a random sample of decisions per queue and vendor, sized so each reviewer gets 20 to 30 checks a month.",
  "Have experts re-label blind, without seeing the original decision or who made it.",
  "Calibrate the experts first: have them label the same set and measure how often they agree with each other. That is your ceiling.",
  "Report agreement per queue, vendor and policy area, and walk through the disagreements in a weekly calibration session."],
  q:`SELECT a.vendor, a.queue,
  AVG(CASE WHEN q.expert_label = q.original_label THEN 1.0 ELSE 0 END) AS agreement,
  COUNT(*) AS checks
FROM qa_reviews q
JOIN enforcement_actions a ON a.action_id = q.action_id
WHERE q.sampled_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY a.vendor, a.queue;`,
  cad:"Weekly", own:"Quality team", dir:"up", rv:"w",
  ex:"Vendor A agrees with experts 94% of the time and Vendor B 86%. Experts agree with each other 95%, so A is near the ceiling and B has a training gap.",
  mvp:"A lead re-reviews 10 random decisions per reviewer each week in a shared sheet.", pair:"SLA attainment"},

"Consistency across languages and markets": {f:"QA agreement and overturn rate per language, compared with your best language", src:["qa","app","act"], steps:[
  "Add language and market fields to every QA and appeal record.",
  "Make sure each major language has qualified native-speaker experts. Machine-translated QA is not reliable.",
  "Pool small languages by quarter until each has at least 100 checks.",
  "Chart each language's gap to your best one, and flag anything more than 5 points behind."],
  q:`SELECT a.language,
  AVG(CASE WHEN q.expert_label = q.original_label THEN 1.0 ELSE 0 END) AS agreement,
  COUNT(*) AS checks
FROM qa_reviews q
JOIN enforcement_actions a ON a.action_id = q.action_id
WHERE q.sampled_at >= DATE_TRUNC('quarter', CURRENT_DATE)
GROUP BY a.language
HAVING COUNT(*) >= 100
ORDER BY agreement;`,
  cad:"Quarterly", own:"Quality team, with regional policy leads", dir:"up", rv:"q",
  ex:"English agreement is 93%, Arabic 81% and Tagalog 76%. The Tagalog queue is staffed by a vendor without native reviewers.",
  mvp:"Start by comparing your top two languages only.", pair:"Appeal overturn rate"},

"Time to action by severity (p90)": {f:"decided_at − first_seen_at, at p50 and p90 per severity tier", src:["act"], steps:[
  "Fix one definition of when the clock starts: the first report or detection on that object, whichever came first.",
  "Give every item a severity tier at intake (for example tier 1 for imminent harm and child safety, tier 4 for low-harm spam).",
  "Report p50 and p90 per tier. Leadership should always see tier 1 first.",
  "Exclude nothing silently. Show auto-closed or merged items as their own line."],
  q:`SELECT severity,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY decided_at - first_seen_at) AS p50,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY decided_at - first_seen_at) AS p90
FROM enforcement_actions
WHERE decided_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY severity
ORDER BY severity;`,
  cad:"Daily for tier 1, weekly for the rest", own:"T&S operations", dir:"down", rv:"w",
  ex:"Tier 1 p50 is 12 minutes but p90 is 6 hours, because overnight reports wait for the morning shift. The fix is on-call coverage, not more reviewers.",
  mvp:"Your ticketing tool already stores created and closed times. Export them and use PERCENTILE in a spreadsheet.", pair:"QA agreement rate"},

"SLA attainment": {f:"items decided within their tier's target ÷ items due", src:["act"], steps:[
  "Write down a target per tier (for example tier 1 within 1 hour, tier 2 within 24 hours) and store it as a table, not in people's heads.",
  "Join every decision to its target and mark it met or missed.",
  "Count items still open past their target as misses. Otherwise a growing backlog makes attainment look better.",
  "Report per tier, queue and vendor."],
  q:`SELECT a.severity, a.vendor,
  AVG(CASE WHEN a.decided_at - a.first_seen_at <= s.target THEN 1.0 ELSE 0 END)
    AS sla_attainment
FROM enforcement_actions a
JOIN sla_targets s ON s.severity = a.severity
WHERE a.decided_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY a.severity, a.vendor;
-- Then add open items already past target as misses`,
  cad:"Weekly", own:"T&S operations and vendor management", dir:"up", rv:"w",
  ex:"Tier 2 attainment is 97% on decided items, but 1,400 items are open past target. Counted properly, it is 88%.",
  mvp:"Set a target for your most severe category first, and count the misses each week.", pair:"QA agreement rate"},

"Backlog age": {f:"now − first_seen_at for every open item, shown as a distribution per queue", src:["act"], steps:[
  "Snapshot every open item in every queue at the same time each day.",
  "Bucket by age: under 1 day, 1 to 7 days, over 7 days (add an under-1-hour bucket for tier 1).",
  "Weight by severity. One tier 1 item aged two days is an incident; 5,000 tier 4 items aged two days may be fine.",
  "Chart the oldest bucket over time. It shows a capacity problem weeks before SLAs collapse."],
  q:`SELECT queue, severity,
  COUNT(*) FILTER (WHERE NOW() - first_seen_at < INTERVAL '1 day') AS under_1d,
  COUNT(*) FILTER (WHERE NOW() - first_seen_at
                   BETWEEN INTERVAL '1 day' AND INTERVAL '7 days') AS d1_to_7,
  COUNT(*) FILTER (WHERE NOW() - first_seen_at > INTERVAL '7 days') AS over_7d
FROM open_queue_items
GROUP BY queue, severity;`,
  cad:"Daily snapshot", own:"Workforce management", dir:"down", rv:"w",
  ex:"Items older than 7 days grew from 300 to 2,100 in three weeks while total queue size stayed flat. Reviewers were picking the easy items first.",
  mvp:"Each morning, note the age of the oldest item in each queue.", pair:"SLA attainment"},

"Cost per decision": {f:"fully loaded review cost ÷ decisions made, per queue and vendor", src:["ppl","act"], steps:[
  "Collect the monthly cost per queue: vendor invoices, internal salaries and benefits, tooling and licences, QA and management overhead.",
  "Count human decisions per queue for the same month.",
  "Show human-only and blended (human plus automated) cost per decision separately.",
  "Put it next to QA agreement on every slide, so nobody optimizes cost on its own."],
  q:`SELECT c.month, c.queue, c.vendor,
  c.total_cost / NULLIF(d.decisions, 0) AS cost_per_decision
FROM monthly_queue_costs c
JOIN (SELECT DATE_TRUNC('month', decided_at) AS month, queue, vendor,
        COUNT(*) AS decisions
      FROM enforcement_actions
      WHERE source <> 'automated'
      GROUP BY 1, 2, 3) d
  ON d.month = c.month AND d.queue = c.queue AND d.vendor = c.vendor;`,
  cad:"Monthly", own:"T&S operations, with Finance", dir:"band", rv:"m",
  ex:"Vendor B costs $0.38 a decision against $0.52 for Vendor A, but agrees with experts 8 points less often. Rework and appeals make B the more expensive choice.",
  mvp:"Divide each monthly vendor invoice by the number of decisions it covered.", pair:"QA agreement rate"},

"Graphic-exposure hours per reviewer": {f:"hours in graphic or egregious queues per reviewer per week", src:["ppl"], steps:[
  "Tag each queue with an exposure level. Graphic violence, child safety and self-harm are high.",
  "Log time in queue per reviewer from your case tool, not from self-reporting.",
  "Agree a weekly cap per person with your wellness partner, and alert team leads when anyone approaches it.",
  "Report the distribution and the number of people over the cap, never only the team average."],
  q:`SELECT week,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY graphic_hours) AS p90_hours,
  COUNT(*) FILTER (WHERE graphic_hours > 15) AS reviewers_over_cap  -- 15 = your agreed cap
FROM reviewer_weeks
GROUP BY week
ORDER BY week DESC;`,
  cad:"Weekly", own:"T&S leadership, with wellness partners", dir:"down", rv:"w",
  ex:"The team averages 9 hours a week, but 6 people passed the 15-hour cap because they were the only ones trained for the child-safety queue. The fix is cross-training.",
  mvp:"Rotate people off graphic queues on a fixed schedule, and keep a simple rota log.", pair:"Attrition and wellness-support usage"},

"Attrition and wellness-support usage": {f:"monthly leavers ÷ average headcount × 12; support sessions per person per month", src:["ppl"], steps:[
  "Get monthly headcount and leavers from HR and from each vendor, split by queue exposure level.",
  "Annualize it: monthly leavers ÷ average headcount × 12.",
  "Get support usage from your wellness provider as anonymous, aggregated counts only.",
  "Run an anonymous pulse survey every quarter. It explains what the numbers cannot."],
  q:`SELECT month, exposure_level,
  12.0 * leavers / NULLIF(avg_headcount, 0) AS annualized_attrition,
  support_sessions * 1.0 / NULLIF(avg_headcount, 0) AS sessions_per_person
FROM monthly_workforce  -- aggregated; no individual-level data
ORDER BY month DESC;`,
  cad:"Monthly, with a quarterly survey", own:"T&S leadership, with HR", dir:"down", rv:"q",
  ex:"High-exposure queues lose 4 people a month from an average of 60: 80% annualized attrition, against 25% elsewhere. Each leaver takes months of training with them.",
  mvp:"Track leavers per quarter against headcount, and ask your vendors for the same figures.", pair:"Graphic-exposure hours per reviewer"},

"Statement-of-reasons coverage": {f:"restrictive actions with a compliant statement of reasons ÷ restrictive actions", src:["act","legal"], steps:[
  "List which actions are restrictive: removal, demotion or reduced visibility, demonetization, suspension and termination.",
  "Log whether a statement was sent for each one, and whether it named the specific policy or law, the facts, any use of automation, and how to appeal.",
  "Each month, sample 100 statements and check them against that list, not just whether one was sent.",
  "If you are an online platform under the DSA, reconcile your counts with what you submit to the DSA Transparency Database."],
  q:`SELECT action,
  AVG(CASE WHEN sor_sent AND sor_names_policy AND sor_has_appeal_info
      THEN 1.0 ELSE 0 END) AS compliant_coverage
FROM enforcement_actions
WHERE action IN ('remove', 'demote', 'demonetize', 'suspend', 'terminate')
  AND decided_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY action;`,
  cad:"Monthly", own:"Compliance, with T&S operations", dir:"up", rv:"m",
  ex:"Statements go out for 99% of removals but only 40% of demotions, because demotions were never wired to the notice system. That is an audit finding waiting to happen.",
  mvp:"Each month, audit 25 enforcement notices against a four-point checklist.", pair:"Appeal overturn rate"},

"Illegal-content notice handling time": {f:"decided_at − received_at for legal notices, at p50 and p90, per notice source", src:["legal"], steps:[
  "Route every legal notice (user notices of illegal content, trusted flaggers, authorities, court orders) into one intake that stamps the time received.",
  "Tag the source type, so trusted-flagger and authority notices can be prioritized and measured on their own.",
  "Record the decision time, and whether the notifier was told the outcome.",
  "Report p50 and p90 per source, and the share handled within your internal target."],
  q:`SELECT source_type,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY decided_at - received_at) AS p50,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY decided_at - received_at) AS p90,
  COUNT(*) AS notices
FROM legal_notices
WHERE received_at >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY source_type;`,
  cad:"Weekly", own:"Legal operations, with T&S", dir:"down", rv:"w",
  ex:"Trusted-flagger notices take 30 hours at p90 because they sit in the general queue. A dedicated queue brings that down to 4.",
  mvp:"Use a dedicated inbox for legal notices, and log received and answered times in a sheet.", pair:"Statement-of-reasons coverage"},

"Systemic-risk assessment currency": {f:"days since each required risk assessment was reviewed; share of mitigations overdue", src:["legal"], steps:[
  "Keep a register of every required assessment (for example DSA systemic-risk assessments, or Online Safety Act illegal-content and children's risk assessments) with an owner and last review date.",
  "Link each risk to its mitigations, each with an owner, due date and status.",
  "Trigger a re-review on any major product change, not only on the calendar.",
  "Report the oldest assessment and the share of mitigations overdue."],
  q:`SELECT r.assessment, r.owner, r.last_reviewed,
  CURRENT_DATE - r.last_reviewed AS days_since_review,
  AVG(CASE WHEN m.status = 'overdue' THEN 1.0 ELSE 0 END) AS share_overdue
FROM risk_register r
LEFT JOIN mitigations m ON m.assessment_id = r.assessment_id
GROUP BY r.assessment, r.owner, r.last_reviewed
ORDER BY days_since_review DESC;`,
  cad:"Monthly check; full review yearly or on any major product change", own:"Compliance or risk", dir:"down", rv:"q",
  ex:"The children's risk assessment was last reviewed 14 months ago, before direct messaging launched. It needs a re-review now, not at the next annual cycle.",
  mvp:"One spreadsheet: risk, owner, mitigation, due date, status, last reviewed.", pair:"Illegal-content notice handling time"}
});
