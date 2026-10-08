/* =========================================================
   TRANSPARENCY REPORT BUILDER: the numbers the EU Digital Services Act asks for, by type of service,
   with a completeness check, a readable report and, on request, a summary written by Claude.
   Requirements checked against Regulation (EU) 2022/2065 (Articles 15, 19, 24 and 42) and
   Commission Implementing Regulation (EU) 2024/2835 in September 2026. Not legal advice.
   ========================================================= */
const TR_REVIEWED = "September 2026";
const TR_SRC = {
  dsa:["Regulation (EU) 2022/2065, the Digital Services Act", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065"],
  templates:["Implementing Regulation (EU) 2024/2835 on transparency report templates", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2835"],
  download:["The Commission's CSV and XLSX templates", "https://digital-strategy.ec.europa.eu/en/library/implementing-regulation-laying-down-templates-concerning-transparency-reporting-obligations"],
  uk:["Online Safety Act 2023, section 77", "https://www.legislation.gov.uk/ukpga/2023/50/section/77"]
};
// Each tier includes the duties of the ones before it
const TR_TIERS = [
  ["intermediary", "Mere conduit or caching", "You transmit or cache information, but don't store it for users."],
  ["hosting", "Hosting service", "You store information that users provide, such as files or posts."],
  ["platform", "Online platform", "You store user content and share it with the public, such as a social app or marketplace."],
  ["vlop", "Very large online platform", "Designated by the Commission: 45 million or more average monthly active recipients in the EU."]
];
const trRank = k => TR_TIERS.findIndex(t => t[0] === k);
// n: a count · h: a median time in hours · pct: a share · txt: a description · chk: published or not
const TR_SECTIONS = [
  {k:"orders", ref:"Art. 15(1)(a)", n:"Orders from EU authorities", tier:"intermediary",
    why:"How many orders you received from Member State authorities, including orders to act (Article 9) and to provide information (Article 10), and how quickly you gave effect to them.",
    note:"The EU template breaks these down by type of illegal content and by the Member State that issued the order.",
    f:[["orders_act", "Orders to act against illegal content (Article 9)", "n"], ["orders_info", "Orders to provide information (Article 10)", "n"], ["orders_time", "Median time to give effect to an order", "h"]]},
  {k:"notices", ref:"Art. 15(1)(b)", n:"Notices of illegal content", tier:"hosting",
    why:"How many notices people sent you under Article 16, how many came from trusted flaggers, what you did about them and on what basis, how many you processed automatically, and how long action took.",
    f:[["notices", "Notices received (Article 16)", "n"], ["notices_tf", "Of which from trusted flaggers", "n"], ["notices_law", "Actions taken on the basis of the law", "n"], ["notices_tc", "Actions taken on the basis of your terms and conditions", "n"], ["notices_auto", "Notices processed by automated means", "n"], ["notices_time", "Median time to take action", "h"]]},
  {k:"own", ref:"Art. 15(1)(c)", n:"Moderation on your own initiative", tier:"intermediary",
    why:"The measures you took without a notice or order: how many, of what type, for which kind of content, how you detected it, and how you train and support the people who moderate.",
    note:"The EU template breaks these down by category, by how the content was detected and by type of restriction.",
    f:[["own_total", "Measures taken on your own initiative", "n"], ["own_auto", "Of which detected by automated means", "n"], ["own_training", "Training and support for your content moderators", "txt"]]},
  {k:"complaints", ref:"Art. 15(1)(d)", n:"Complaints about your decisions", tier:"intermediary",
    why:"How many complaints came through your internal complaint system (and, for online platforms, under Article 20), what they were about, what you decided, how long it took and how often you reversed a decision.",
    f:[["complaints", "Complaints received", "n"], ["complaints_reversed", "Decisions reversed after a complaint", "n"], ["complaints_time", "Median time to decide", "h"]]},
  {k:"auto", ref:"Art. 15(1)(e)", n:"Automated moderation", tier:"intermediary",
    why:"Any automated tools you use for moderation: what they do and why, how accurate they are and their possible error rate, and the safeguards around them.",
    f:[["auto_purpose", "What your automated tools do, and why", "txt"], ["auto_accuracy", "Indicators of accuracy and the possible error rate", "txt"], ["auto_safeguards", "Safeguards, such as human review of automated decisions", "txt"]]},
  {k:"disputes", ref:"Art. 24(1)(a)", n:"Out-of-court disputes", tier:"platform",
    why:"How many disputes went to certified out-of-court settlement bodies (Article 21), how they ended, how long they took, and how often you implemented the body's decision.",
    f:[["disputes", "Disputes submitted to out-of-court settlement bodies", "n"], ["disputes_time", "Median time to complete a dispute", "h"], ["disputes_impl", "Share of decisions you implemented", "pct"]]},
  {k:"suspensions", ref:"Art. 24(1)(b)", n:"Suspensions for misuse", tier:"platform",
    why:"How many suspensions you imposed under Article 23, split by the reason: manifestly illegal content, manifestly unfounded notices, or manifestly unfounded complaints.",
    f:[["susp_illegal", "For providing manifestly illegal content", "n"], ["susp_notices", "For submitting manifestly unfounded notices", "n"], ["susp_complaints", "For submitting manifestly unfounded complaints", "n"]]},
  {k:"recipients", ref:"Art. 24(2)", n:"Average monthly active recipients", tier:"platform",
    why:"Your average monthly active recipients in the EU over the past six months. This is published separately, in a public part of your service, at least every six months.",
    f:[["amar", "Average monthly active recipients in the EU", "n"]]},
  {k:"vlop_people", ref:"Art. 42(2)(a)–(b)", n:"Moderation staff and languages", tier:"vlop",
    why:"The people you dedicate to content moderation, by each official EU language, with their qualifications, language expertise, training and support.",
    f:[["hr_lang", "Content moderation staff by official EU language", "txt"], ["quals", "Qualifications, language expertise, training and support", "txt"]]},
  {k:"vlop_acc", ref:"Art. 42(2)(c), 42(3)", n:"Accuracy by language, users by country", tier:"vlop",
    why:"Your accuracy indicators broken down by official EU language, and your average monthly recipients in each Member State.",
    f:[["acc_lang", "Accuracy indicators by official EU language", "txt"], ["amar_ms", "Average monthly recipients per Member State", "txt"]]},
  {k:"vlop_docs", ref:"Art. 42(4)", n:"Risk and audit documents", tier:"vlop",
    why:"Published within three months of receiving each independent audit report: the risk assessment results, the mitigation measures, the audit report and the audit implementation report, and any consultations behind them.",
    f:[["doc_risk", "Risk assessment results (Article 34)", "chk"], ["doc_mitigation", "Mitigation measures (Article 35)", "chk"], ["doc_audit", "Independent audit report (Article 37(4))", "chk"], ["doc_impl", "Audit implementation report (Article 37(6))", "chk"], ["doc_consult", "Consultations behind the risk assessment, where applicable", "chk"]]}
];
// The 15 high-level categories in the EU templates that apply to notices and own-initiative moderation (the list is exhaustive)
const TR_CATS = ["Animal welfare", "Consumer information infringements", "Cyber violence", "Cyber violence against women", "Data protection and privacy violations", "Illegal or harmful speech", "Intellectual property infringements", "Negative effects on civic discourse or elections", "Protection of minors", "Risk for public security", "Scams and/or fraud", "Self-harm", "Unsafe, non-compliant or prohibited products", "Violence", "Other violation of provider’s terms and conditions"];
const TR_BLANK = () => ({org:"", year:new Date().getFullYear() - 1, tier:"platform", sme:false, uk:false, v:{}, prev:{}, cat:{}, cmp:false, view:"setup", tab:"report", ai:null});
const TR_EXAMPLE = {org:"Pixelry", year:2025, tier:"platform", sme:false, uk:false, cmp:true,
  v:{orders_act:14, orders_info:62, orders_time:9, notices:31400, notices_tf:820, notices_law:4100, notices_tc:18900, notices_auto:12600, notices_time:21,
    own_total:1240000, own_auto:1080000, own_training:"Moderators complete a two-week onboarding course on our policies and EU law, with monthly calibration sessions. Everyone reviewing graphic content has exposure limits, rotation and access to counselling.",
    complaints:21500, complaints_reversed:4300, complaints_time:38,
    auto_purpose:"Hash matching for known child sexual abuse material, classifiers for spam, nudity and hate speech, and filters for known scam links. Classifiers flag content for human review, except spam and exact hash matches, which are removed automatically.",
    auto_accuracy:"Precision of automated removals, measured weekly on a random sample reviewed by experts: spam 98%, nudity 94%, hate speech 87%. Overturn rate of automated removals on appeal: 3.1%.",
    auto_safeguards:"Every automated removal can be appealed and is reviewed by a person. Borderline classifier scores always go to human review. New models run in shadow mode before they act.",
    disputes:112, disputes_time:1100, disputes_impl:0.92, susp_illegal:2900, susp_notices:41, susp_complaints:17, amar:8200000},
  prev:{notices:26800, own_total:980000, complaints:18000, complaints_reversed:3100, amar:7400000},
  cat:{"Illegal or harmful speech":{n:6200, o:60000}, "Scams and/or fraud":{n:9800, o:870000}, "Protection of minors":{n:3100, o:41000}, "Other violation of provider’s terms and conditions":{n:5600, o:190000}, "Cyber violence":{n:4200, o:70000}}, view:"setup", tab:"report", ai:null};
let tr = Object.assign(TR_BLANK(), store.get("tr", null) || {});
const trSave = () => store.set("tr", tr);
const trSections = () => TR_SECTIONS.filter(s => trRank(s.tier) <= trRank(tr.tier));
const trHas = f => { const v = tr.v[f[0]]; return f[2] === "chk" ? !!v : f[2] === "txt" ? !!(v && String(v).trim()) : v !== undefined && v !== null && v !== "" && !isNaN(+v); };
function trProgress(){ const fs = trSections().flatMap(s => s.f); const got = fs.filter(trHas).length; return {got, total:fs.length, pct:fs.length ? Math.round(got / fs.length * 100) : 0, missing:trSections().filter(s => s.f.some(f => !trHas(f)))}; }
const trExempt = () => tr.sme && tr.tier !== "vlop";
const trFmt = (f, v) => v === undefined || v === "" || v === null ? "" : f[2] === "pct" ? Math.round(+v * 100) + "%" : f[2] === "h" ? (+v >= 48 ? `${+(+v / 24).toFixed(1)} days` : `${+v} hours`) : f[2] === "n" ? Number(v).toLocaleString("en-US") : String(v);
function trDue(){
  const y = +tr.year || new Date().getFullYear() - 1;
  return tr.tier === "vlop" ? `Every six months: 1 January to 30 June ${y}, published within two months (by the end of August ${y}), and 1 July to 31 December ${y}, published by the end of February ${y + 1}.`
    : `Once a year: 1 January to 31 December ${y}, published within two months of the period ending, so by the end of February ${y + 1}.`;
}

/* ---------- the report, as Markdown ---------- */
function trMarkdown(){
  const L = [], tierName = TR_TIERS[trRank(tr.tier)][1];
  L.push(`# ${tr.org || "Our service"}: transparency report, ${tr.year}`, "", `_EU Digital Services Act · ${tierName} · reporting period 1 January to 31 December ${tr.year}_`, "");
  if(tr.ai && tr.ai.summary) L.push("## Summary", "", tr.ai.summary, "");
  trSections().forEach(s => {
    L.push(`## ${s.n} (${s.ref})`, "");
    s.f.forEach(f => { const v = tr.v[f[0]];
      if(f[2] === "chk") L.push(`- ${f[1]}: ${v ? "published" : "not yet published"}`);
      else if(f[2] === "txt") L.push(`**${f[1]}.** ${v && String(v).trim() ? String(v).trim() : "_Not provided._"}`, "");
      else { const p = tr.cmp ? tr.prev[f[0]] : undefined, ch = p !== undefined && p !== "" && +p && trHas(f) ? ` (${+v >= +p ? "+" : ""}${Math.round((+v - +p) / +p * 100)}% on the previous period)` : "";
        L.push(`- ${f[1]}: ${trHas(f) ? trFmt(f, v) + ch : "_not provided_"}`); } });
    if((s.k === "notices" || s.k === "own") && TR_CATS.some(c => tr.cat[c] && tr.cat[c][s.k === "notices" ? "n" : "o"])){
      const key = s.k === "notices" ? "n" : "o"; L.push("", "| Category | Count |", "|---|---|", ...TR_CATS.filter(c => tr.cat[c] && tr.cat[c][key]).map(c => `| ${c} | ${Number(tr.cat[c][key]).toLocaleString("en-US")} |`)); }
    L.push("");
  });
  L.push("---", "", `_Built with T&S Workbench from the requirements in ${TR_SRC.dsa[0]} and ${TR_SRC.templates[0]}, as reviewed in ${TR_REVIEWED}. File your report using the Commission's own CSV or XLSX templates. Not legal advice._`);
  return L.join("\n");
}

/* ---------- a summary written by Claude, on request ---------- */
function trPrompt(){
  const data = trSections().map(s => `${s.n} (${s.ref}):\n` + s.f.map(f => `- ${f[1]}: ${trHas(f) ? (f[2] === "chk" ? "published" : trFmt(f, tr.v[f[0]])) : "not provided"}${tr.cmp && tr.prev[f[0]] ? ` (previous period: ${trFmt(f, tr.prev[f[0]])})` : ""}`).join("\n")).join("\n\n");
  return `You are a trust and safety communications lead writing the opening of a public transparency report under the EU Digital Services Act. Write for users, journalists and regulators: plain, factual, no marketing tone.

SERVICE: ${(tr.org || "The service").slice(0, 80)} · ${TR_TIERS[trRank(tr.tier)][1]} · reporting year ${tr.year}

NUMBERS
${data.slice(0, 6000)}

Return JSON only:
{"summary": "a 120 to 180 word opening summary that states the most important numbers accurately and explains what they mean for users; mention changes on the previous period only where given",
 "highlights": ["three short factual highlights, each built on a number above"],
 "questions": ["three questions a regulator or journalist would likely ask about these numbers, especially where data is missing or a figure looks unusual"]}

RULES
- Use only the numbers above. Never invent or estimate a figure. If something is not provided, don't mention a number for it.
- Don't claim compliance with the law; describe what was done.`;
}
function trValid(r){
  if(!r || typeof r !== "object" || typeof r.summary !== "string" || !r.summary.trim()) return null;
  const list = x => Array.isArray(x) ? x.filter(s => typeof s === "string" && s.trim()).slice(0, 5).map(s => s.trim().slice(0, 300)) : [];
  return {summary:r.summary.trim().slice(0, 1600), highlights:list(r.highlights), questions:list(r.questions)};
}
let trRun = {busy:false, err:""};
async function trWrite(){
  if(typeof SAMPLER === "undefined" || !SAMPLER || trRun.busy) return;
  trRun = {busy:true, err:""}; renderTransparency();
  try{ const res = trValid(await SAMPLER.json(trPrompt(), {modelTier:"default"})); if(!res) throw {code:"invalid_json"}; tr.ai = res; trSave(); }
  catch(e){ const code = e && e.code; trRun.err = code === "cancelled" ? "" : (typeof POL_ERR !== "undefined" && (POL_ERR[code] || POL_ERR.upstream_error)) || "Claude couldn't write the summary. Try again."; }
  finally{ trRun.busy = false; renderTransparency(); }
}

/* ---------- page ---------- */
/* ---------- Guided: your service, then one section of the report per screen ---------- */
let trView = null;
// A preview of the finished example report (Pixelry, 2025), built by swapping in the example data,
// calling the real report renderer, then restoring whatever the visitor had in progress
function trIntroPreviewHTML(){
  const saved = tr;
  try{
    tr = Object.assign(TR_BLANK(), JSON.parse(JSON.stringify(TR_EXAMPLE)));
    return trReportHTML(false);
  }catch(e){ return ""; }
  finally{ tr = saved; }
}
function trSpec(){
  const yn = (k, title, why, on, set) => ({id:k, eb:title.replace(/\?$/, ""), title, why, kind:"single", opts:() => [{k:"no", n:"No"}, {k:"yes", n:"Yes"}], get:() => tr[k + "Set"] ? (on() ? "yes" : "no") : "", set:v => { set(v === "yes"); tr[k + "Set"] = true; trSave(); }});
  const steps = [
    {id:"org", eb:"Your service", title:"What's the company or service called?", why:"It's named in the report.", kind:"text", max:80, placeholder:"For example: Pixelry", get:() => tr.org, set:v => { tr.org = v.slice(0, 80); tr.orgSet = true; trSave(); }},
    {id:"year", eb:"Reporting year", title:"Which year is the report for?", why:"Reports cover a calendar year. This decides when it's due.", kind:"single", opts:() => [0, 1, 2].map(i => { const y = new Date().getFullYear() - i; return {k:String(y), n:String(y), h:i === 0 ? "The current year, for a report in progress" : i === 1 ? "Last year, the usual case" : ""}; }),
      get:() => String(tr.year || ""), set:v => { tr.year = parseInt(v, 10); trSave(); }},
    {id:"tier", eb:"Type of service", title:"What kind of service are you under the DSA?", why:"It decides which sections the law asks for.", kind:"single", opts:() => TR_TIERS.map(([k, n, d]) => ({k, n, h:d})), get:() => tr.tierSet ? tr.tier : "", set:v => { tr.tier = v; tr.tierSet = true; trSave(); }},
    yn("sme", "Are you a micro or small enterprise?", "Fewer than 50 staff, and annual turnover or balance sheet of €10 million or less. Micro and small enterprises are exempt from most of these reports.", () => tr.sme, v => { tr.sme = v; }),
    yn("cmp", "Compare with the previous period?", "Optional. Adds a column for last period's numbers, so the report shows the trend.", () => tr.cmp, v => { tr.cmp = v; })
  ].concat(trSections().map(s => ({id:"s-" + s.k, eb:s.n, title:esc(s.n), why:`${esc(s.ref)} · ${esc(s.why)}${s.note ? " " + esc(s.note) : ""}`, kind:"custom", opt:true, next:"Continue",
    html:() => `<div class="tr-setup gd-tr"><div class="tr-fields">${s.f.map(trField).join("")}</div>${s.k === "own" ? trCatsHTML() : ""}</div>`, has:() => s.f.some(trHas)})));
  const p = trProgress();
  return {k:"transparency", tool:{name:"Transparency report", icon:"chart", color:"var(--t-ai)"},
    intro:{title:"Build the transparency report the DSA asks for", powered:typeof SAMPLER !== "undefined" && !!SAMPLER && !(typeof polRun !== "undefined" && polRun.aiOff) ? ["claude"] : [], lead:"Say what kind of service you are, then fill in one section at a time: only the sections the law asks for at your tier. At the end you get a readable report, a check of what's missing, and the numbers by category.",
      facts:[["About 15 minutes", "Numbers you can look up as you go. Come back any time."], ["Only your sections", "Hosting services, platforms and very large platforms have different duties."], ["Checked against the DSA", `Articles 15, 24 and 42 and the EU templates, reviewed ${TR_REVIEWED}.`]], start:p.got ? "Continue" : "Start"},
    alt:[{n:"Fill everything in on one page", run:() => { trView = "page"; renderTransparency(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }}, {n:"See an example", run:() => trAct("example")}],
    steps, finish:"Build the report",
    preview:trIntroPreviewHTML,
    done:() => { trView = null; trAct("build"); }};
}
function renderTransparency(){
  if(!tr.org && !tr.orgSet && typeof wsProfile === "function"){ const pr = wsProfile(); if(pr && pr.org){ tr.org = pr.org; tr.orgSet = true; trSave(); } }
  const report = tr.view === "report";
  const ai = typeof SAMPLER !== "undefined" && !!SAMPLER && !(typeof polRun !== "undefined" && polRun.aiOff);
  if(!report && trView !== "page" && typeof gdRender === "function") return gdRender(trSpec());
  if(typeof gdCur !== "undefined") gdCur = null;
  view.innerHTML = (report
    ? headCompact("Transparency report", `${esc(tr.org || "Your service")} · ${esc(String(tr.year))}`, `<button type="button" class="btn sm" data-tr="edit">Edit answers</button><button type="button" class="btn sm" data-tr="save"><svg><use href="#i-save"/></svg><span>${wsSaveLabel("transparency", tr)}</span></button>${DL ? `<button type="button" class="btn sm primary" data-tr="download"><svg><use href="#i-download"/></svg>Download</button>` : ""}<button type="button" class="btn sm" data-tr="copy">${icon("copy")}Copy</button>`)
    : head("Transparency report", "Build the transparency report the EU Digital Services Act asks for: the right sections for your type of service, a check of what's missing, and a readable report.", "Run the program", `${typeof poweredBy === "function" ? poweredBy(ai ? ["claude"] : []) : ""}<button type="button" class="btn sm" data-tr="example">See an example</button>`))
    + (report ? trReportHTML(ai) : trSetupHTML());
}
function trField(f){
  const v = tr.v[f[0]], id = "tr-" + f[0];
  if(f[2] === "chk") return `<label class="tr-chk"><input type="checkbox" data-trv="${f[0]}" ${v ? "checked" : ""}><span>${esc(f[1])}</span></label>`;
  if(f[2] === "txt") return `<div class="field tr-txt"><label for="${id}">${esc(f[1])}</label><textarea id="${id}" rows="3" data-trv="${f[0]}">${esc(v || "")}</textarea></div>`;
  const unit = f[2] === "h" ? "hours" : f[2] === "pct" ? "%" : "";
  const shown = f[2] === "pct" && v !== undefined && v !== "" ? Math.round(+v * 100) : v === undefined ? "" : v;
  const pv = tr.prev[f[0]], pshown = f[2] === "pct" && pv !== undefined && pv !== "" ? Math.round(+pv * 100) : pv === undefined ? "" : pv;
  return `<div class="field tr-num"><label for="${id}">${esc(f[1])}</label><span class="tr-in"><input class="input mono" id="${id}" inputmode="decimal" data-trv="${f[0]}" data-trt="${f[2]}" value="${esc(String(shown))}" placeholder="0">${unit ? `<em>${unit}</em>` : ""}</span>
    ${tr.cmp ? `<span class="tr-in tr-prev"><input class="input mono" aria-label="${esc(f[1])}, previous period" data-trp="${f[0]}" data-trt="${f[2]}" value="${esc(String(pshown))}" placeholder="Previous">${unit ? `<em>${unit}</em>` : ""}</span>` : ""}</div>`;
}
function trSetupHTML(){
  const p = trProgress();
  return `<div class="pol-setup tr-setup">
    <div class="banner cvt-b"><span><strong>Prefer one section at a time?</strong> The guided version asks for the same numbers, one section per screen.</span><button type="button" class="btn sm" data-tr="guide">Switch to guided</button></div>
    <section class="card pol-card">
      <div class="pol-h"><span class="pol-num">1</span><div><span class="pol-lbl">Your service</span></div></div>
      <div class="tr-row"><div class="field"><label for="tr-org">Company or service</label><input class="input" id="tr-org" value="${esc(tr.org)}" placeholder="For example: Pixelry" maxlength="80"></div>
        <div class="field"><label for="tr-year">Reporting year</label><input class="input mono" id="tr-year" inputmode="numeric" value="${esc(String(tr.year))}" maxlength="4"></div></div>
      <div class="field"><span class="lbl">Type of service under the DSA</span><div class="tr-tiers" role="radiogroup" aria-label="Type of service">${TR_TIERS.map(([k, n, d]) => `<button type="button" role="radio" aria-checked="${tr.tier === k}" class="card tr-tier ${tr.tier === k ? "on" : ""}" data-trtier="${k}"><b>${n}</b><span>${d}</span></button>`).join("")}</div></div>
      <label class="tr-chk"><input type="checkbox" id="tr-sme" ${tr.sme ? "checked" : ""}><span>We are a micro or small enterprise (fewer than 50 staff, and annual turnover or balance sheet of €10 million or less)</span></label>
      ${trExempt() ? `<div class="banner tr-note"><span><strong>You may be exempt.</strong> Micro and small enterprises don't have to publish these reports (Article 15(2)), and small online platforms are also exempt from Article 24, except giving user numbers to regulators on request (Articles 19(1) and 24(3)). A voluntary report still builds trust.</span></div>` : ""}
      <p class="note tr-due"><b>When it's due.</b> ${trDue()}</p>
      <label class="tr-chk"><input type="checkbox" id="tr-cmp" ${tr.cmp ? "checked" : ""}><span>Compare with the previous period</span></label>
    </section>
    ${trSections().map((s, i) => `<section class="card pol-card" id="tr-s-${s.k}">
      <div class="pol-h"><span class="pol-num">${i + 2}</span><div><span class="pol-lbl">${esc(s.n)}</span><span class="note mono">${esc(s.ref)}</span></div></div>
      <p class="pol-tip">${esc(s.why)}${s.note ? " " + esc(s.note) : ""}</p>
      <div class="tr-fields">${s.f.map(trField).join("")}</div>
      ${s.k === "own" ? trCatsHTML() : ""}
    </section>`).join("")}
    <div class="card pol-runbar">
      <div class="pol-rb-meter"><div class="pol-rb-top"><span class="eyebrow">Report completeness</span><span class="pill ${p.pct >= 90 ? "good" : p.pct >= 50 ? "high" : "crit"}">${p.got} of ${p.total}</span></div>
        <div class="pol-meter" role="meter" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.got}" aria-label="Report completeness"><i style="width:${p.pct}%;background:var(--${p.pct >= 90 ? "good" : p.pct >= 50 ? "high" : "crit"})"></i></div>
        ${p.missing.length ? `<button type="button" class="pol-add" data-trgo="${p.missing[0].k}">+ Still missing: ${esc(p.missing[0].n.toLowerCase())}</button>` : `<span class="note">Everything the DSA asks for at your tier is filled in.</span>`}</div>
      <div class="pol-rb-act"><button type="button" class="btn primary" data-tr="build">Build the report ${icon("arrow")}</button></div>
    </div>
    <p class="note pol-rb-note">Everything stays in your browser. Requirements checked against the <a href="${TR_SRC.dsa[1]}" target="_blank" rel="noopener">DSA</a> and the <a href="${TR_SRC.templates[1]}" target="_blank" rel="noopener">EU templates regulation</a> in ${TR_REVIEWED}. Not legal advice.</p>
  </div>`;
}
function trCatsHTML(){
  return `<details class="tr-cats" ${store.get("tr:cats", false) ? "open" : ""}><summary><b>By category</b><span class="note">The EU templates' ${TR_CATS.length} categories for notices and own-initiative measures</span></summary>
    <table><thead><tr><th>Category</th>${trRank(tr.tier) >= 1 ? "<th>Notices</th>" : ""}<th>Own initiative</th></tr></thead><tbody>${TR_CATS.map(c => { const r = tr.cat[c] || {};
      return `<tr><td>${esc(c)}</td>${trRank(tr.tier) >= 1 ? `<td><input class="input mono" data-trc="${esc(c)}" data-trk="n" value="${esc(String(r.n || ""))}" inputmode="numeric" aria-label="${esc(c)}: notices"></td>` : ""}<td><input class="input mono" data-trc="${esc(c)}" data-trk="o" value="${esc(String(r.o || ""))}" inputmode="numeric" aria-label="${esc(c)}: own-initiative measures"></td></tr>`; }).join("")}</tbody></table>
    <p class="note">The category list is exhaustive: you can't add new top-level categories, only sub-categories within them.</p></details>`;
}
function trReportHTML(ai){
  const p = trProgress(), secs = trSections(), tab = ["report", "checklist", "summary"].includes(tr.tab) ? tr.tab : "report";
  const catOver = ["n", "o"].map(k => { const sum = TR_CATS.reduce((a, c) => a + (+((tr.cat[c] || {})[k]) || 0), 0), tot = +tr.v[k === "n" ? "notices" : "own_total"] || 0; return sum > tot && tot ? (k === "n" ? "notices" : "own-initiative measures") : null; }).filter(Boolean);
  const actions = p.missing.slice(0, 3).map(s => ({t:s.n, sub:`${s.ref}: ${s.f.filter(f => !trHas(f)).length} field${s.f.filter(f => !trHas(f)).length === 1 ? "" : "s"} still need${s.f.filter(f => !trHas(f)).length === 1 ? "s" : ""} numbers.`}));
  return `<div class="pol-report tr-report">
    <div class="card pol-sum tr-sum">
      <div class="tr-ring"><b>${p.pct}%</b><span>complete</span></div>
      <div><span class="eyebrow">${esc(TR_TIERS[trRank(tr.tier)][1])} · ${esc(String(tr.year))}</span>
        <h2 class="pol-verdict">${p.missing.length ? `${p.missing.length} section${p.missing.length === 1 ? "" : "s"} still need${p.missing.length === 1 ? "s" : ""} numbers before you publish` : "Every section the DSA asks for is filled in"}. ${esc(trDue())}</h2>
        ${trExempt() ? `<p class="note">As a micro or small enterprise you may be exempt, so this can be a voluntary report.</p>` : ""}
        ${catOver.length ? `<p class="pol-err">Your category breakdown adds up to more than your total for ${catOver.join(" and ")}. Categories shouldn't double count.</p>` : ""}
        <span class="toast" id="tr-toast" aria-live="polite"></span></div>
    </div>
    ${actions.length ? `<ol class="pk-list gd-vacts">${actions.map(a => `<li><b>${esc(a.t)}</b> ${esc(a.sub)}</li>`).join("")}</ol>` : ""}
    <details class="ev-details"><summary>Details <span class="note">The report, what the DSA asks for, and Claude's summary</span></summary>
    <div class="card pol-tabs"><div class="card-h"><div class="segs" role="group" aria-label="Report sections">
      ${[["report", "The report"], ["checklist", "What the DSA asks for"], ["summary", "Summary by Claude"]].map(([k, n]) => `<button type="button" data-trtab="${k}" aria-pressed="${tab === k}">${n}${k === "checklist" ? ` <span class="mono" style="opacity:.6">${secs.length - p.missing.length}/${secs.length}</span>` : ""}</button>`).join("")}</div></div>
      <div class="card-b">${tab === "checklist" ? trChecklistHTML() : tab === "summary" ? trSummaryHTML(ai) : trPreviewHTML()}</div></div>
    ${tr.uk ? "" : `<p class="note tr-uk"><b>In the UK,</b> categorised services publish transparency reports when Ofcom sends them a notice, with the content Ofcom specifies (<a href="${TR_SRC.uk[1]}" target="_blank" rel="noopener">${TR_SRC.uk[0]}</a>).</p>`}
    </details>
  </div>`;
}
function trPreviewHTML(){
  return `<article class="tr-doc">${tr.ai && tr.ai.summary ? `<section><h3>Summary</h3><p>${esc(tr.ai.summary)}</p></section>` : ""}
    ${trSections().map(s => `<section><h3>${esc(s.n)} <span class="note mono">${esc(s.ref)}</span></h3>
      ${s.f.filter(f => f[2] === "n" || f[2] === "h" || f[2] === "pct").length ? `<dl class="tr-dl">${s.f.filter(f => f[2] === "n" || f[2] === "h" || f[2] === "pct").map(f => { const has = trHas(f), pv = tr.cmp ? tr.prev[f[0]] : undefined, ch = has && pv !== undefined && pv !== "" && +pv ? Math.round((+tr.v[f[0]] - +pv) / +pv * 100) : null;
        return `<div><dt>${esc(f[1])}</dt><dd class="${has ? "" : "miss"}">${has ? esc(trFmt(f, tr.v[f[0]])) : "Not provided"}${ch !== null ? `<small class="${ch >= 0 ? "up" : "dn"}">${ch >= 0 ? "+" : ""}${ch}% on the previous period</small>` : ""}</dd></div>`; }).join("")}</dl>` : ""}
      ${s.f.filter(f => f[2] === "txt").map(f => `<p><b>${esc(f[1])}.</b> ${trHas(f) ? esc(String(tr.v[f[0]]).trim()) : `<span class="miss">Not provided.</span>`}</p>`).join("")}
      ${s.f.filter(f => f[2] === "chk").length ? `<ul class="tr-docs">${s.f.filter(f => f[2] === "chk").map(f => `<li class="${tr.v[f[0]] ? "ok" : "miss"}">${tr.v[f[0]] ? "✓" : "○"} ${esc(f[1])}</li>`).join("")}</ul>` : ""}
      ${s.k === "own" && TR_CATS.some(c => tr.cat[c] && (tr.cat[c].n || tr.cat[c].o)) ? `<table class="tr-ct"><thead><tr><th>Category</th>${trRank(tr.tier) >= 1 ? "<th>Notices</th>" : ""}<th>Own initiative</th></tr></thead><tbody>${TR_CATS.filter(c => tr.cat[c] && (tr.cat[c].n || tr.cat[c].o)).map(c => `<tr><td>${esc(c)}</td>${trRank(tr.tier) >= 1 ? `<td class="mono">${tr.cat[c].n ? Number(tr.cat[c].n).toLocaleString("en-US") : "–"}</td>` : ""}<td class="mono">${tr.cat[c].o ? Number(tr.cat[c].o).toLocaleString("en-US") : "–"}</td></tr>`).join("")}</tbody></table>` : ""}
    </section>`).join("")}
    <p class="note">When you file, use the Commission's own <a href="${TR_SRC.download[1]}" target="_blank" rel="noopener">CSV and XLSX templates</a>: counts as whole numbers, shares between 0 and 1, and median times in hours. This page helps you gather and explain the numbers; it isn't the official template.</p></article>`;
}
function trChecklistHTML(){
  return `<ul class="tr-check">${TR_SECTIONS.map(s => { const applies = trRank(s.tier) <= trRank(tr.tier), done = applies && s.f.every(trHas), some = applies && s.f.some(trHas);
    return `<li class="${!applies ? "na" : done ? "ok" : some ? "part" : "miss"}"><span class="tr-st">${!applies ? "–" : done ? "✓" : some ? "◐" : "○"}</span><div><b>${esc(s.n)}</b> <span class="note mono">${esc(s.ref)}</span><p>${esc(s.why)}</p>
      ${!applies ? `<small>Applies to ${esc(TR_TIERS[trRank(s.tier)][1].toLowerCase())}s${s.tier === "vlop" ? "" : " and above"}.</small>` : !done ? `<button type="button" class="pol-add" data-trgo="${s.k}">Add the missing numbers</button>` : ""}</div></li>`; }).join("")}</ul>
    <p class="note">Sources: <a href="${TR_SRC.dsa[1]}" target="_blank" rel="noopener">${TR_SRC.dsa[0]}</a>, Articles 15, 19, 24 and 42; <a href="${TR_SRC.templates[1]}" target="_blank" rel="noopener">${TR_SRC.templates[0]}</a>. Last reviewed ${TR_REVIEWED}. Not legal advice.</p>`;
}
function trSummaryHTML(ai){
  if(trRun.busy) return `<div class="pol-busy"><div class="pol-spin" aria-hidden="true"></div><div><b>Claude is writing your summary…</b><p class="note">Usually 15 to 40 seconds.</p></div></div>`;
  const s = tr.ai;
  return `${trRun.err ? `<p class="pol-err" role="alert">${esc(trRun.err)}</p>` : ""}
    ${s ? `<div class="tr-ai"><h4>Opening summary</h4><p>${esc(s.summary)}</p>
      ${s.highlights.length ? `<h4>Highlights</h4><ul>${s.highlights.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${s.questions.length ? `<h4>What a regulator or journalist might ask</h4><ul>${s.questions.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      <p class="note">Written by Claude from your numbers only. Check every figure before you publish.</p></div>` : ""}
    ${ai ? `<div class="row" style="gap:10px;margin-top:12px"><button type="button" class="btn ${s ? "" : "primary"}" data-tr="write">${s ? "Write it again" : "Write the summary with Claude"} ${icon("arrow")}</button><span class="note">Uses your own Claude account. Claude sees only the numbers on this page.</span></div>`
      : `<p class="note">Open this page in Claude while signed in to have Claude write an opening summary, highlights and the questions a regulator might ask.</p>`}`;
}

/* ---------- events ---------- */
function trNum(el){ const raw = String(el.value).replace(/[, ]/g, "").trim(); if(raw === "") return ""; const n = +raw; if(isNaN(n) || n < 0) return undefined; return el.dataset.trt === "pct" ? Math.min(1, n / 100) : n; }
function trAct(a, arg){
  switch(a){
    case "example": tr = Object.assign(TR_BLANK(), JSON.parse(JSON.stringify(TR_EXAMPLE))); gdReset("transparency"); trView = null; store.set("ws:cur:transparency", null); trSave(); renderTransparency(); return gsay("Example loaded: Pixelry, an online platform, for 2025");
    case "build": tr.view = "report"; tr.tab = "report"; trSave(); renderTransparency(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "guide": trView = null; gdReset("transparency"); renderTransparency(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "edit": tr.view = "setup"; trView = "page"; trSave(); renderTransparency(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "tab": tr.tab = arg; trSave(); renderTransparency(); { const b = document.querySelector(`[data-trtab="${arg}"]`); if(b) b.focus(); } return;
    case "tier": tr.tier = arg; trSave(); renderTransparency(); { const b = document.querySelector(`[data-trtier="${arg}"]`); if(b) b.focus(); } return;
    case "go": tr.view = "setup"; trView = "page"; trSave(); renderTransparency(); { const el = document.getElementById("tr-s-" + arg); if(el){ el.scrollIntoView({block:"start"}); const f = el.querySelector("input,textarea"); if(f) f.focus({preventScroll:true}); } } return;
    case "write": return trWrite();
    case "copy": return copyText(trMarkdown(), $("#tr-toast"));
    case "download": { const md = trMarkdown(); return offerFile(`transparency-report-${slug(tr.org || "service")}-${tr.year}.md`, md, md, $("#tr-toast")); }
    case "save": { const msg = wsSaveTool("transparency", tr, `Transparency report: ${tr.org || "Service"} ${tr.year}`); renderTransparency(); return flashIn($("#tr-toast"), msg); }
  }
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-tr],[data-trtab],[data-trtier],[data-trgo]"); if(!b || !view.contains(b)) return;
  const d = b.dataset; if(d.trtab) return trAct("tab", d.trtab); if(d.trtier) return trAct("tier", d.trtier); if(d.trgo) return trAct("go", d.trgo); trAct(d.tr);
});
document.addEventListener("input", e => {
  const t = e.target; if(!t || !view.contains(t) || !t.closest(".tr-setup")) return;
  if(t.id === "tr-org"){ tr.org = t.value.slice(0, 80); return trSave(); }
  if(t.id === "tr-year"){ const y = parseInt(t.value, 10); if(y >= 2023 && y <= 2100){ tr.year = y; trSave(); const due = document.querySelector(".tr-due"); if(due) due.innerHTML = `<b>When it's due.</b> ${trDue()}`; } return; }
  if(t.dataset.trv && t.tagName === "TEXTAREA"){ tr.v[t.dataset.trv] = t.value.slice(0, 3000); trSave(); return trMeter(); }
  if(t.dataset.trv && t.type !== "checkbox"){ const n = trNum(t); t.classList.toggle("bad", n === undefined); if(n !== undefined){ if(n === "") delete tr.v[t.dataset.trv]; else tr.v[t.dataset.trv] = n; trSave(); trMeter(); } return; }
  if(t.dataset.trp){ const n = trNum(t); t.classList.toggle("bad", n === undefined); if(n !== undefined){ if(n === "") delete tr.prev[t.dataset.trp]; else tr.prev[t.dataset.trp] = n; trSave(); } return; }
  if(t.dataset.trc){ const n = trNum(t); if(n !== undefined){ const r = tr.cat[t.dataset.trc] = Object.assign({}, tr.cat[t.dataset.trc]); if(n === "") delete r[t.dataset.trk]; else r[t.dataset.trk] = n; trSave(); } }
});
document.addEventListener("change", e => {
  const t = e.target; if(!t || !view.contains(t) || !t.closest(".tr-setup")) return;
  if(t.id === "tr-sme"){ tr.sme = t.checked; trSave(); renderTransparency(); const f = document.getElementById("tr-sme"); if(f) f.focus(); return; }
  if(t.id === "tr-cmp"){ tr.cmp = t.checked; trSave(); renderTransparency(); const f = document.getElementById("tr-cmp"); if(f) f.focus(); return; }
  if(t.dataset.trv && t.type === "checkbox"){ tr.v[t.dataset.trv] = t.checked; trSave(); trMeter(); }
});
document.addEventListener("toggle", e => { if(e.target && e.target.classList && e.target.classList.contains("tr-cats")) store.set("tr:cats", e.target.open); }, true);
// Update the completeness bar without re-rendering the form under the cursor
function trMeter(){ const bar = document.querySelector(".tr-setup .pol-runbar"); if(!bar) return; const p = trProgress(), c = p.pct >= 90 ? "good" : p.pct >= 50 ? "high" : "crit";
  const pill = bar.querySelector(".pill"), i = bar.querySelector(".pol-meter i"), m = bar.querySelector(".pol-meter"), add = bar.querySelector(".pol-add");
  if(pill){ pill.className = "pill " + c; pill.textContent = `${p.got} of ${p.total}`; } if(i){ i.style.width = p.pct + "%"; i.style.background = `var(--${c})`; } if(m) m.setAttribute("aria-valuenow", p.got);
  if(add){ if(p.missing.length){ add.dataset.trgo = p.missing[0].k; add.textContent = "+ Still missing: " + p.missing[0].n.toLowerCase(); } else add.outerHTML = `<span class="note">Everything the DSA asks for at your tier is filled in.</span>`; } }
