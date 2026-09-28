/* ---------- Metrics: example numbers, trends and the leadership one-pager ---------- */
// Example program for demos: [target, off-track line, [four quarters, oldest first]]
const MX_DEMO_P = ["Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"];
const MX_DEMO = {
  "Violating-content prevalence":[0.10, 0.15, [0.18, 0.15, 0.12, 0.09]],
  "Harmful reach before action":[5000, 10000, [14000, 11000, 8200, 6100]],
  "Fraud loss rate":[25, 40, [41, 36, 31, 24]],
  "Prohibited-listing prevalence":[1.0, 2.0, [2.4, 1.9, 1.3, 0.9]],
  "Toxicity per 1,000 match-hours":[3, 5, [5.8, 4.9, 3.6, 2.8]],
  "Churn after toxic exposure":[5, 10, [12, 11, 9, 8]],
  "Violating-generation rate":[0.3, 0.6, [0.7, 0.5, 0.35, 0.25]],
  "Over-refusal rate":[4, 8, [6, 7, 9, 10]],
  "Jailbreak success rate":[5, 15, [22, 18, 12, 9]],
  "Romance-scam reports per 10k matches":[2, 4, [4.6, 3.9, 3.1, 1.9]],
  "Verified-profile share":[60, 40, [31, 38, 47, 55]],
  "User-report rate":[3, 8, [4.2, 4.8, 5.1, 4.6]],
  "Repeat-offender rate":[15, 25, [29, 27, 22, 24]],
  "Proactive detection rate":[80, 65, [68, 72, 77, 81]],
  "Precision and recall by policy area":[90, 80, [84, 86, 88, 91]],
  "Time to detect emerging trends":[3, 7, [11, 9, 6, 4]],
  "Appeal overturn rate":[10, 15, [19, 17, 14, 12]],
  "QA agreement rate":[92, 85, [87, 89, 90, 93]],
  "Consistency across languages and markets":[5, 10, [14, 12, 11, 11]],
  "Time to action by severity (p90)":[1, 4, [7, 5, 3, 2.5]],
  "SLA attainment":[95, 85, [88, 90, 93, 96]],
  "Backlog age":[200, 1000, [1800, 1200, 600, 180]],
  "Cost per decision":[0.30, 0.60, [0.62, 0.55, 0.49, 0.46]],
  "Graphic-exposure hours per reviewer":[0, 3, [6, 4, 2, 1]],
  "Attrition and wellness-support usage":[30, 50, [62, 55, 48, 41]],
  "Statement-of-reasons coverage":[98, 90, [71, 84, 93, 99]],
  "Illegal-content notice handling time":[24, 48, [60, 41, 30, 20]],
  "Systemic-risk assessment currency":[12, 18, [9, 12, 15, 19]],
  "Account takeover rate":[2, 4, [3.8, 3.4, 2.9, 1.8]],
  "Unsafe-contact rate for minors":[1, 3, [3.4, 2.9, 2.2, 1.8]],
  "Age-assurance coverage":[60, 30, [22, 29, 48, 64]],
  "Safety incidents per 10k trips":[0.15, 0.3, [0.34, 0.29, 0.22, 0.13]]
};

// The one-pager is a paper document, so it uses fixed light colors in the app and in the downloaded file
const MX_OP_CSS = `
  .op-sig ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
  .op-sig li{padding:10px 12px;border-radius:10px;border:1px solid #e3e5ea;border-left:3px solid #8A5D00;font-size:13px;line-height:1.5}
  .op-sig li.good{border-left-color:#1C7550}
  .op-sig li b{display:block;font-size:13.5px}
  .op-sig li small{display:block;color:#5F6573}
.mxop{--ink:#16181d;--muted:#5d6370;--line:#e3e5ea;--good:#18794e;--med:#a35200;--crit:#c62a2f;--acc:#5b5bd6;
  font:14px/1.5 Geist,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:#fff;max-width:900px;margin:0 auto;padding:44px 48px;box-sizing:border-box}
.mxop *{box-sizing:border-box}
.mxop .op-h{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding-bottom:18px;border-bottom:2px solid var(--ink)}
.mxop .op-k{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--acc)}
.mxop h1{font-size:30px;line-height:1.15;letter-spacing:-.02em;margin:4px 0 4px;color:var(--ink)}
.mxop .op-h p,.mxop .op-date{margin:0;color:var(--muted);font-size:13px}
.mxop .op-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0}
.mxop .op-tile{border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.mxop .op-tile b{display:block;font-size:26px;line-height:1.1;letter-spacing:-.02em}
.mxop .op-tile span{font-size:12.5px;color:var(--muted)}
.mxop .op-tile.good b{color:var(--good)} .mxop .op-tile.med b{color:var(--med)} .mxop .op-tile.crit b{color:var(--crit)}
.mxop h2{font-size:15px;margin:0 0 8px;color:var(--ink)}
.mxop .op-att{border:1px solid #f1d5b8;background:#fff8f1;border-radius:10px;padding:14px 16px;margin-bottom:22px}
.mxop .op-att ul{margin:0;padding:0;list-style:none;display:grid;gap:8px}
.mxop .op-att li{display:flex;gap:10px;align-items:baseline;font-size:13.5px}
.mxop .op-sec{margin-top:20px;break-inside:avoid}
.mxop table{width:100%;border-collapse:collapse;font-size:13.5px}
.mxop th{text-align:left;font-size:11.5px;font-weight:600;color:var(--muted);padding:6px 8px;border-bottom:1px solid var(--line)}
.mxop td{padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:middle}
.mxop td small{display:block;color:var(--muted);font-size:12px}
.mxop td.num{white-space:nowrap;font-variant-numeric:tabular-nums}
.mxop .op-d{display:block;font-size:11.5px}
.mxop .op-d.good{color:var(--good)} .mxop .op-d.crit{color:var(--crit)} .mxop .op-d.flat{color:var(--muted)}
.mxop .op-st{display:inline-block;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:99px;white-space:nowrap;background:#eef0f3;color:var(--muted)}
.mxop .op-st.good{background:#e6f4ec;color:var(--good)} .mxop .op-st.med{background:#fdf0e1;color:var(--med)} .mxop .op-st.crit{background:#fbe7e8;color:var(--crit)}
.mxop .op-meas{display:block;font-size:11px;font-weight:400;color:#6b7180;margin-top:2px;white-space:normal}
.mxop .mx-spark .sp-line{fill:none;stroke:#8a909c;stroke-width:1.6}
.mxop .mx-spark .sp-dot{fill:#8a909c} .mxop .mx-spark .sp-dot.good{fill:var(--good)} .mxop .mx-spark .sp-dot.med{fill:var(--med)} .mxop .mx-spark .sp-dot.crit{fill:var(--crit)}
.mxop .op-f{margin-top:26px;padding-top:12px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}
.mxop .op-empty{padding:40px 0;text-align:center;color:var(--muted)}
@media (max-width:640px){
  .mxop{padding:24px 18px}
  .mxop .op-h{flex-direction:column;align-items:flex-start}
  .mxop .op-tiles{grid-template-columns:repeat(2,1fr)}
  .mxop table{font-size:12.5px}
  .mxop th:nth-child(4),.mxop td:nth-child(4){display:none}
}
`;
const MX_OP_PRINT = `
@media print{
  body > *:not(.mxop-bg){display:none !important}
  .mxop-bg{position:static !important;background:#fff !important;padding:0 !important;overflow:visible !important;backdrop-filter:none !important}
  .mxop-bar{display:none !important}
  .mxop{box-shadow:none !important;margin:0 !important;border-radius:0 !important}
}`;

/* ---------- Reading the numbers together ---------- */
// Pairs of metrics whose movements mean more together than apart. Directions compare the latest two periods;
// "notup" is flat or down, "notdown" is flat or up. The first rule with a given title wins.
const MX_SIG = [
  {a:"Proactive detection rate", da:"up", b:"Appeal overturn rate", db:"up", tone:"watch", t:"Automation may be over-enforcing",
    m:"You're catching more before anyone reports it, but more of your decisions are being reversed on appeal.",
    c:"Split overturns by enforcement source. If automated decisions are overturned more often than human ones, tighten thresholds where proactive detection grew."},
  {a:"Proactive detection rate", da:"up", b:"Good users wrongly actioned", db:"up", tone:"watch", t:"Automation may be over-enforcing",
    m:"You're catching more before anyone reports it, and more legitimate users are being caught with it.",
    c:"Find which detections produced the wrongful actions, and raise their thresholds or send them to human review."},
  {a:"Proactive detection rate", da:"up", b:"Violating-content prevalence", db:"notdown", tone:"watch", t:"More enforcement, but people see as much harm",
    m:"Detection is catching more, yet the share of harmful content people actually see hasn't fallen.",
    c:"Check whether the extra detections are low-reach content. Compare harmful reach before action for what you catch against what users report."},
  {a:"Repeat-offender rate", da:"up", b:"Proactive detection rate", db:"notdown", tone:"watch", t:"Bad actors are coming back",
    m:"You're catching as much or more, but more of the people you act on offend again.",
    c:"Look at ban evasion and linked accounts, and check that penalties escalate for repeat behavior."},
  {a:"Time to action by severity (p90)", da:"down", b:"QA agreement rate", db:"down", tone:"watch", t:"Speed may be costing accuracy",
    m:"Decisions are getting faster while reviewers agree with QA less often.",
    c:"Look at QA disagreements by queue and reviewer tenure, and check whether SLA pressure is rushing the hard cases."},
  {a:"SLA attainment", da:"up", b:"Backlog age", db:"up", tone:"watch", t:"The SLA may be hiding old cases",
    m:"You're meeting the SLA more often, but the oldest cases are waiting longer. Teams often hit an SLA by working the easy cases first.",
    c:"Break backlog age down by severity, and check which queues the SLA clock leaves out."},
  {a:"Harmful reach before action", da:"up", b:"Time to action by severity (p90)", db:"notup", tone:"watch", t:"Harm spreads before you see it",
    m:"Review is at least as fast as before, but harmful content reaches more people first. The delay is in detection, not review.",
    c:"Check time to detect and proactive coverage for fast-spreading formats such as live video and reshares."},
  {a:"Cost per decision", da:"down", b:"QA agreement rate", db:"down", tone:"watch", t:"Savings may be coming out of quality",
    m:"Each decision costs less, and quality is slipping at the same time.",
    c:"Check where the savings came from, such as a new vendor site, less training or more automation, and whether quality fell in the same places."},
  {a:"Cost per decision", da:"down", b:"Appeal overturn rate", db:"up", tone:"watch", t:"Savings may be coming out of quality",
    m:"Each decision costs less, and more of them are being reversed on appeal.",
    c:"Check where the savings came from and whether overturns rose in the same queues."},
  {a:"Graphic-exposure hours per reviewer", da:"up", b:"Attrition and wellness-support usage", db:"up", tone:"watch", t:"Reviewer strain is building",
    m:"Reviewers are seeing more graphic content, and attrition or wellness-support use is rising with it.",
    c:"Check exposure caps and rotation, and talk to your vendor about staffing before quality drops."},
  {a:"User-report rate", da:"down", b:"Users who feel safe", db:"down", tone:"watch", t:"Fewer reports, but people feel less safe",
    m:"Reports are falling while fewer users say they feel safe. People may have stopped reporting because they don't expect anything to happen.",
    c:"Check how often reports lead to action and whether reporters hear back."},
  {a:"Jailbreak success rate", da:"down", b:"Over-refusal rate", db:"up", tone:"watch", t:"Safer model, more refusals",
    m:"Attacks succeed less often, but the model refuses more reasonable requests. It may be getting safer by being less useful.",
    c:"Break refusals down by category and fix the ones that block legitimate use."},
  {a:"Violating-generation rate", da:"down", b:"Over-refusal rate", db:"up", tone:"watch", t:"Safer model, more refusals",
    m:"The model produces less violating output, but refuses more reasonable requests.",
    c:"Break refusals down by category and fix the ones that block legitimate use."},
  {a:"Account takeover rate", da:"up", b:"Fraud loss rate", db:"up", tone:"watch", t:"Account takeovers may be driving losses",
    m:"More accounts are being taken over, and fraud losses are rising with them.",
    c:"Measure how much of the loss comes from taken-over accounts, and review login protections such as multi-factor sign-in."},
  {a:"Violating-content prevalence", da:"down", b:"Appeal overturn rate", db:"notup", tone:"good", t:"Real progress",
    m:"People see less harmful content, and your mistakes haven't risen to get there.",
    c:"Tell leadership what drove it, so it gets protected in planning."},
  {a:"User-report rate", da:"down", b:"Users who feel safe", db:"up", tone:"good", t:"Fewer reports because there's less to report",
    m:"Reports fell while more users say they feel safe, which points to less harm rather than less trust in reporting.",
    c:"Confirm it with prevalence sampling before you plan around it."}
];
// The direction of a metric's latest change: up, down or flat (under 2% of the earlier value)
function mxMove(m){
  const s = mxSeries(m); if(s.length < 2) return null;
  const a = s[s.length - 2].v, b = s[s.length - 1].v, d = b - a;
  return Math.abs(d) <= Math.max(Math.abs(a) * 0.02, 1e-9) ? "flat" : d > 0 ? "up" : "down";
}
function mxSignals(){
  const byName = n => METRICS.find(m => m.n === n), fits = (mv, want) => mv && (mv === want || (want === "notup" && mv !== "up") || (want === "notdown" && mv !== "down"));
  const seen = new Set(), out = [];
  MX_SIG.forEach(r => { if(seen.has(r.t)) return; const A = byName(r.a), B = byName(r.b); if(!A || !B) return;
    if(fits(mxMove(A), r.da) && fits(mxMove(B), r.db)){ seen.add(r.t); out.push(Object.assign({A, B}, r)); } });
  return out.sort((x, y) => (x.tone === "good") - (y.tone === "good"));
}
function mxSigHTML(list, onePager){
  const withTrend = METRICS.filter(m => mxSeries(m).length >= 2).length, sig = mxSignals();
  if(onePager) return sig.length ? `<section class="op-sig"><h2>Reading the numbers together</h2><ul>${sig.slice(0, 4).map(s => `<li class="${s.tone}"><b>${esc(s.t)}</b>${esc(s.m)}<small>Check next: ${esc(s.c)}</small></li>`).join("")}</ul></section>` : "";
  const name = m => { const d = mxDelta(m), i = METRICS.indexOf(m); return `${list.includes(m) ? `<button type="button" class="mx-link" data-go="${i}">${esc(m.n)}</button>` : `<b>${esc(m.n)}</b>`}${d ? ` <span class="mx-sig-d ${d.good}">${esc(d.text)}</span>` : ""}`; };
  const body = !withTrend ? `<p class="note">Save two periods to history and this reads your metrics together: for example, whether more automation is also causing more mistakes, or whether a healthy SLA is hiding old cases.</p>`
    : !sig.length ? `<p class="note">No patterns to flag between your metrics this period. ${withTrend < 4 ? "Track a few more metrics over time to get more out of this." : ""}</p>`
    : `<ul class="mx-sig-l">${sig.slice(0, 5).map(s => `<li class="mx-sig-i ${s.tone}"><span class="mx-sig-tone">${s.tone === "good" ? "Good sign" : "Worth a look"}</span><h4>${esc(s.t)}</h4>
        <p class="mx-sig-why">${name(s.A)} <span class="mx-sig-and">with</span> ${name(s.B)}</p><p>${esc(s.m)}</p><p class="mx-sig-c"><b>Check next:</b> ${esc(s.c)}</p></li>`).join("")}</ul>`;
  return `<div class="mx-sig-h"><h3>What your numbers are telling you</h3><span class="note">Pairs of metrics that mean more together than apart, from your latest two periods</span></div>${body}`;
}
