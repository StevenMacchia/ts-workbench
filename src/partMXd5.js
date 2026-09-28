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
  "Repeat-offender rate":[15, 25, [29, 27, 24, 21]],
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
