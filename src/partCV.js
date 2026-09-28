/* =========================================================
   COVERAGE RADAR: how well your defenses cover each kind of harm, against your products' risk
   ========================================================= */
// The harm areas match the pre-mortem risk radar, minus operational readiness (not a harm in itself)
const CV_AREAS = RADAR_GROUPS.filter(g => !g.cats.includes("readiness")).map(g => ({k:g.cats[0], n:g.n, l:g.l, cats:g.cats}));
const CV_LEVELS = ["None", "Partial", "Solid", "Strong"];
const CV_LAYERS = [
  {k:"policy", n:"Policy", q:"Is there a clear rule, with guidance reviewers can apply?", tool:["policy", "Stress-test the rule"],
    lv:["No rule covers it.", "A public rule exists, but reviewers lack detailed guidance.", "A clear rule with internal guidelines, examples and an owner.", "Tested against edge cases, reviewed on a schedule, and shaped by appeals data."],
    act:h => `Write a clear rule for ${h}, with internal guidelines, examples and edge cases reviewers can apply.`},
  {k:"detect", n:"Detection", q:"How do you find it, beyond waiting for user reports?", tool:["premortem", "See safeguards in a pre-mortem"],
    lv:["Found only when users report it.", "Keyword lists or basic filters catch obvious cases.", "Hash matching, classifiers or behavior signals find most of it proactively.", "Detection quality is measured, models learn from reviewer decisions, and red teams probe for gaps."],
    act:h => `Add proactive detection for ${h}, such as hash matching, classifiers or behavior signals, so you don't rely on user reports.`},
  {k:"enforce", n:"Enforcement", q:"Can trained people act on it quickly and consistently?", tool:["vendors", "Score moderation vendors"],
    lv:["No trained reviewers or defined actions.", "Reviewers handle it without specific training or service levels.", "Trained reviewers, clear actions and service levels by severity.", "Specialist reviewers, round-the-clock cover for the worst cases, and escalation to legal and law enforcement."],
    act:h => `Train reviewers on ${h}, define the actions they can take, and set service levels by severity.`},
  {k:"appeal", n:"Appeals", q:"Can users contest decisions, and do mistakes get fixed?", tool:["appeal", "Try the appeal reviewer"],
    lv:["Users can't contest decisions.", "Appeals go to a general support inbox.", "A formal appeal with a second reviewer and a response target.", "Overturn rates are tracked and feed back into policy and training."],
    act:h => `Let users appeal ${h} decisions, with a second reviewer and a response target.`},
  {k:"measure", n:"Measurement", q:"Do you know how much of it users see, and how well you respond?", tool:["metrics", "Build your scorecard"],
    lv:["Nothing is measured.", "Report and removal counts only.", "Prevalence, speed and accuracy are tracked.", "Metrics have targets and owners, and leadership reviews them."],
    act:h => `Track prevalence, time to action and accuracy for ${h}, and review them with leadership.`}
];
// For a high-risk harm, finding and acting on it matter first: each layer's weight when ranking next steps
const CV_LAYER_WEIGHT = {detect:5, enforce:4, policy:3, measure:2, appeal:2};
const CV_STEPS = [["Choose the risk to compare", "Your products' combined risk, one product, or an example."], ["Rate your defenses", "For each kind of harm, how strong each layer of defense is today."], ["Close the biggest gaps", "Where risk outruns coverage, with the next step for each."]];
const CV_EXAMPLE = {src:"ex:teen_social", ex:true, r:{
  child:{policy:3, detect:1, enforce:2, appeal:1, measure:0}, sexual:{policy:2, detect:1, enforce:2, appeal:1, measure:0},
  harass:{policy:3, detect:2, enforce:2, appeal:2, measure:1}, violent:{policy:2, detect:2, enforce:1, appeal:1, measure:0},
  ai:{policy:1, detect:0, enforce:1, appeal:1, measure:0}, privacy:{policy:2, detect:0, enforce:1, appeal:1, measure:0},
  integrity:{policy:2, detect:2, enforce:2, appeal:1, measure:1}, fraud:{policy:2, detect:1, enforce:1, appeal:1, measure:0}}};
let cv = store.get("cv", null) || {src:null, ex:false, r:{}};
if(!cv.r) cv.r = {};
const cvSave = () => store.set("cv", cv);
const cvHarm = a => a.n.toLowerCase().replace(" & ", " and ");
const cvRiskWords = x => x.band ? `${BANDS[x.band][0].toLowerCase()} risk (${x.score} of 16)` : "no risk found";

/* ---------- risk to compare against ---------- */
function cvSources(){
  const pms = typeof ovSavedPMs === "function" ? ovSavedPMs() : [];
  return {pms, list:[...(pms.length ? [["all", `All products (${pms.length} pre-mortem${pms.length === 1 ? "" : "s"})`]] : []), ...pms.map(p => ["pm:" + p.it.id, p.name])],
    ex:Object.entries(PRESETS).map(([k, p]) => ["ex:" + k, "Example: " + p.name.replace(" (example)", "")])};
}
function cvSrc(d){
  const s = cvSources(), all = s.list.concat(s.ex).map(x => x[0]);
  const src = d.src && all.includes(d.src) ? d.src : s.pms.length ? "all" : null;
  return {src, s};
}
// Worst score per harm area (0 to 16), from the chosen source
function cvRisk(d){
  const {src, s} = cvSrc(d); if(!src) return null;
  const worst = rs => { const out = {}; CV_AREAS.forEach(a => { const w = rs.filter(x => a.cats.includes(x.cat)).sort((x, y) => y.score - x.score)[0]; out[a.k] = w ? {score:w.score, band:w.band, worst:w.n} : {score:0, band:null, worst:""}; }); return out; };
  if(src === "all"){ const per = s.pms.map(p => ({name:p.name, w:worst(p.r.risks)})), out = {};
    CV_AREAS.forEach(a => { out[a.k] = per.reduce((b, p) => p.w[a.k].score > b.score ? Object.assign({from:p.name}, p.w[a.k]) : b, {score:0, band:null, worst:"", from:""}); }); return out; }
  if(src.startsWith("pm:")){ const p = s.pms.find(x => "pm:" + x.it.id === src); return p ? worst(p.r.risks) : null; }
  const k = src.slice(3); return PRESETS[k] ? worst(assess(Object.assign(blankPM(), JSON.parse(JSON.stringify(PRESETS[k])))).risks) : null;
}
function cvSrcName(d){ const {src, s} = cvSrc(d); const hit = s.list.concat(s.ex).find(x => x[0] === src); return hit ? hit[1] : ""; }

/* ---------- scoring ---------- */
function cvRows(d){
  const risk = cvRisk(d);
  return CV_AREAS.map(a => {
    const r = d.r[a.k] || {}, rated = CV_LAYERS.filter(l => r[l.k] !== undefined).length, cov = Math.round(CV_LAYERS.reduce((s, l) => s + (r[l.k] || 0), 0) / (CV_LAYERS.length * 3) * 100);
    const rk = risk ? risk[a.k] : null, score = rk ? rk.score : null, riskPct = score === null ? null : Math.round(score / 16 * 100);
    const status = score === null || !rated ? "none" : score >= 12 && cov < 50 ? "exposed" : score >= 8 && cov < riskPct ? "gap" : score >= 8 ? "covered" : "lower";
    return {a, r, rated, cov, score, riskPct, band:rk ? rk.band : null, from:rk && rk.from, status, gap:riskPct === null ? 0 : riskPct - cov};
  });
}
function cvSummary(d){
  const rows = cvRows(d), rated = rows.reduce((s, x) => s + x.rated, 0), withRisk = rows.filter(x => x.score !== null && x.score > 0);
  const weight = withRisk.reduce((s, x) => s + x.score, 0);
  const cov = weight ? Math.round(withRisk.reduce((s, x) => s + x.cov * x.score, 0) / weight) : rows.length ? Math.round(rows.reduce((s, x) => s + x.cov, 0) / rows.length) : 0;
  return {rows, rated, total:CV_AREAS.length * CV_LAYERS.length, cov, weighted:!!weight, exposed:rows.filter(x => x.status === "exposed"), gaps:rows.filter(x => x.status === "gap")};
}
// The next steps: weakest layers in the areas where risk outruns coverage
function cvActions(d, n){
  const rows = cvRows(d).filter(x => x.status === "exposed" || x.status === "gap").sort((a, b) => (b.status === "exposed") - (a.status === "exposed") || b.gap - a.gap);
  // Within an area: the weakest of the layers that matter most. Across areas: each area's first step, then each area's second, and so on
  const per = rows.map(x => CV_LAYERS.filter(l => (x.r[l.k] || 0) <= 1)
    .map(l => ({row:x, layer:l, level:x.r[l.k], text:l.act(cvHarm(x.a)), w:(2 - (x.r[l.k] || 0)) * CV_LAYER_WEIGHT[l.k]}))
    .sort((a, b) => b.w - a.w));
  const out = [];
  for(let i = 0; per.some(list => list[i]); i++) per.forEach(list => { if(list[i]) out.push(list[i]); });
  return n ? out.slice(0, n) : out;
}

/* ---------- radar: risk against coverage ---------- */
function cvRadar(d, big){
  const rows = cvRows(d), n = rows.length, W = 400, H = big ? 320 : 300, cx = W / 2, cy = H / 2, R = big ? 104 : 96, f = v => v.toFixed(1);
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = (i, pct) => [cx + Math.cos(ang(i)) * R * pct / 100, cy + Math.sin(ang(i)) * R * pct / 100];
  const poly = vals => vals.map((v, i) => pt(i, v).map(f).join(",")).join(" ");
  const rings = [25, 50, 75, 100].map(p => `<polygon points="${poly(rows.map(() => p))}" fill="${p === 100 ? "var(--sunk)" : "none"}" fill-opacity=".5" stroke="var(--line${p === 100 ? "-strong" : ""})"/>`).join("");
  const axes = rows.map((x, i) => { const [a, b] = pt(i, 100); return `<line x1="${cx}" y1="${cy}" x2="${f(a)}" y2="${f(b)}" stroke="var(--line)"/>`; }).join("");
  const hasRisk = rows.some(x => x.riskPct !== null), anyRated = rows.some(x => x.rated);
  const risk = hasRisk ? `<polygon class="cv-risk" points="${poly(rows.map(x => x.riskPct || 0))}" fill="var(--crit)" fill-opacity=".1" stroke="var(--crit)" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round"/>` : "";
  const cover = anyRated ? `<polygon class="cv-cov" points="${poly(rows.map(x => x.cov))}" fill="var(--t-cv)" fill-opacity=".24" stroke="var(--t-cv)" stroke-width="2.2" stroke-linejoin="round"/>` : "";
  const dots = anyRated ? rows.map((x, i) => { if(!x.rated) return ""; const [a, b] = pt(i, x.cov);
    return `<circle cx="${f(a)}" cy="${f(b)}" r="${big ? 4.5 : 4}" fill="${x.status === "exposed" ? "var(--crit)" : x.status === "gap" ? "var(--high)" : "var(--t-cv)"}" stroke="var(--surface)" stroke-width="2"/>`; }).join("") : "";
  const labels = rows.map((x, i) => { const [a, b] = pt(i, big ? 124 : 120), c = Math.cos(ang(i)), s = Math.sin(ang(i)), extra = x.a.l.length - 1;
    const anchor = c > .3 ? "start" : c < -.3 ? "end" : "middle", dy0 = s < -.6 ? `${-.2 - 1.1 * extra}em` : s > .6 ? ".9em" : `${.35 - .55 * extra}em`;
    return `<text x="${f(a)}" y="${f(b)}" text-anchor="${anchor}" class="cv-rl ${x.status}">${x.a.l.map((t, j) => `<tspan x="${f(a)}" dy="${j ? "1.1em" : dy0}">${esc(t)}</tspan>`).join("")}</text>`; }).join("");
  const aria = rows.map(x => `${x.a.n}: coverage ${x.cov}%${x.riskPct !== null ? `, risk ${x.riskPct}%` : ""}`).join(". ");
  return `<svg class="cv-radar ${big ? "big" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc("Risk against coverage. " + aria)}">${rings}${axes}${risk}${cover}${dots}${labels}
    ${!anyRated ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" class="cv-rl none">Rate a defense to start</text>` : ""}</svg>`;
}
const cvLegend = d => `<div class="ma-legend cv-legend"><span><i class="cv-lg-cov"></i>Your coverage</span>${cvRisk(d) ? `<span><i class="cv-lg-risk"></i>Risk</span>` : ""}<span><i class="ma-lg-gap"></i>Risk outruns coverage</span></div>`;

/* ---------- page parts ---------- */
function cvRailHTML(){
  const s = cvSummary(cv), a = cvActions(cv, 1)[0];
  return `<div class="vd-rail-h"><h4>Risk vs coverage</h4><span class="note">Updates as you rate</span></div>
    <div class="ma-score">${s.rated ? `<b class="mono">${s.cov}%</b><span class="note">${s.weighted ? "risk-weighted coverage" : "coverage"}</span>${s.exposed.length ? `<span class="pill crit ma-pill-r">${s.exposed.length} exposed</span>` : s.gaps.length ? `<span class="pill high ma-pill-r">${s.gaps.length} gap${s.gaps.length === 1 ? "" : "s"}</span>` : ""}` : `<span class="note">Rate the first defense to see your coverage.</span>`}</div>
    ${cvRadar(cv, false)}${cvLegend(cv)}
    ${a ? `<div class="ma-start cv-start"><span class="ma-start-k">Start here</span><b>${esc(a.row.a.n)} <span class="ma-lvl">${esc(a.layer.n)}</span></b><span>${esc(a.text)}</span>
      <button type="button" class="ma-tool ma-start-go" data-cvgo="1">See all gaps<svg><use href="#i-arrow"/></svg></button></div>` : ""}
    <div class="ma-prog"><div class="ma-prog-t"><span>${s.rated} of ${s.total} rated</span></div><div class="vd-bar"><i style="width:${s.rated / s.total * 100}%"></i></div></div>`;
}
function cvSourceHTML(){
  const {src, s} = cvSrc(cv), rk = cvRisk(cv);
  const opt = ([v, n]) => `<option value="${esc(v)}" ${v === src ? "selected" : ""}>${esc(n)}</option>`;
  return `<div class="card cv-src">
    <div class="field"><label for="cv-src">Compare coverage against</label>
      <select class="select" id="cv-src">${src ? "" : `<option value="" selected>No risk yet: coverage only</option>`}${s.list.length ? `<optgroup label="Your products">${s.list.map(opt).join("")}</optgroup>` : ""}<optgroup label="Examples">${s.ex.map(opt).join("")}</optgroup></select></div>
    <p class="note">${!src ? "Run a pre-mortem on your products to compare against their real risk, or pick an example to see how the comparison works." :
      src === "all" ? "The worst risk in each harm area across every saved pre-mortem." : src.startsWith("ex:") ? "An example product's risk. Run a pre-mortem on your own products for a real comparison." : "This product's risk, from its pre-mortem."}</p>
    ${!s.pms.length ? `<button type="button" class="btn sm" data-ov="new">Start a pre-mortem</button>` : ""}
    ${rk ? `<div class="cv-riskbar">${CV_AREAS.map(a => { const x = rk[a.k]; return `<span class="cv-rb ${x.band || "none"}" title="${esc(a.n + ": " + (x.band ? BANDS[x.band][0] + " risk" : "no risk found"))}"><i></i>${esc(a.l.join(" "))}</span>`; }).join("")}</div>` : ""}
  </div>`;
}
function cvCellHTML(x, l){
  const v = x.r[l.k];
  return `<div class="cv-seg" role="radiogroup" aria-label="${esc(x.a.n + ": " + l.n)}">${CV_LEVELS.map((n, j) => `<button type="button" role="radio" aria-checked="${v === j}" class="${v === j ? "on" : ""} l${j}" data-cva="${x.a.k}" data-cvl="${l.k}" data-cvn="${j}" title="${esc(n + ": " + l.lv[j])}"><span class="visually-hidden">${n}</span></button>`).join("")}</div>`;
}
function cvMatrixHTML(){
  const rows = cvRows(cv), seen = new Set();
  return `<div class="card cv-mx">
    <div class="cv-mh"><span>Harm area</span>${CV_LAYERS.map(l => `<span title="${esc(l.q)}">${l.n}</span>`).join("")}<span>Coverage</span></div>
    ${rows.map(x => `<div class="cv-mr" id="cv-row-${x.a.k}">
      <div class="cv-mn"><b>${esc(x.a.n)}</b>${x.band ? `<span class="pill ${BANDS[x.band][1]}">${BANDS[x.band][0]} risk</span>` : x.score === 0 ? `<span class="note">No risk found</span>` : ""}</div>
      ${CV_LAYERS.map(l => `<div class="cv-mc"><span class="cv-ml">${l.n}</span>${cvCellHTML(x, l)}</div>`).join("")}
      <div class="cv-mv ${x.status}"><b class="mono">${x.rated ? x.cov + "%" : "–"}</b><span class="cv-mb"><i style="width:${x.cov}%"></i>${x.riskPct !== null ? `<em style="left:${x.riskPct}%" title="Risk ${x.riskPct}%"></em>` : ""}</span></div>
    </div>`).join("")}
    <div class="cv-key"><span>Levels, weakest to strongest:</span>${CV_LEVELS.map((n, j) => `<span class="cv-kl"><i class="l${j}"></i>${n}</span>`).join("")}<span class="note">Hover a square to see what each level means.</span></div>
    <details class="cv-defs"><summary>What each level means</summary>
      <div class="cv-dt">${CV_LAYERS.map(l => `<div><h5>${l.n}</h5><p class="note">${esc(l.q)}</p><ol start="0">${l.lv.map((t, j) => `<li><b>${CV_LEVELS[j]}.</b> ${mxGloss(t, seen)}</li>`).join("")}</ol></div>`).join("")}</div></details>
  </div>`;
}
function cvWhy(){
  const s = cvSummary(cv), rk = cvRisk(cv);
  if(!s.rated) return `<p>Rate at least one defense to see your coverage. It takes about five minutes for all ${CV_AREAS.length} harm areas.</p>`;
  let h = `<p>Your ${s.weighted ? "risk-weighted " : ""}coverage is <b>${s.cov}%</b>${s.rated < s.total ? `, based on ${s.rated} of ${s.total} ratings` : ""}.</p>`;
  if(!rk) return h + `<p>Choose a product or an example above to see where its risk outruns your coverage.</p>`;
  const top = s.exposed.concat(s.gaps).sort((a, b) => b.gap - a.gap);
  if(!top.length) return h + `<p>Your coverage keeps pace with the risk in every harm area you've rated. Keep it current as your products change.</p>`;
  const a = cvActions(cv, 1)[0];
  return h + `<p>${s.exposed.length ? `<b>${s.exposed.length} area${s.exposed.length === 1 ? " is" : "s are"} exposed</b>: critical risk with less than half the coverage it needs` : `${top.length} area${top.length === 1 ? "" : "s"} carry more risk than your coverage`}. The biggest gap is <b>${esc(cvHarm(top[0].a))}</b>${top[0].from ? ` (worst in ${esc(top[0].from)})` : ""}, at ${top[0].cov}% coverage against ${esc(cvRiskWords(top[0]))}.${a ? ` Start with ${esc(a.layer.n.toLowerCase())}.` : ""}</p>`;
}
function cvGapsHTML(){
  const acts = cvActions(cv), seen = new Set();
  if(!acts.length) return `<div class="card ma-none"><b>${cvRisk(cv) ? "No gaps where risk is high." : "Choose a risk to compare against."}</b><p class="note">${cvRisk(cv) ? "Every high-risk area has coverage at or above its risk, or its weakest layers are already solid." : "Gaps appear where a harm area's risk is higher than your coverage."}</p></div>`;
  return `<div class="cv-gaps">${acts.slice(0, 8).map((x, i) => `<article class="card cv-gap ${x.row.status}">
      <div class="cv-gh"><span class="cv-gn mono">${i + 1}</span><b>${esc(x.row.a.n)}</b><span class="pill ${x.row.status === "exposed" ? "crit" : "high"}">${x.row.status === "exposed" ? "Exposed" : "Gap"}</span></div>
      <span class="cv-gl">${esc(x.layer.n)}: ${x.level === undefined ? "not rated" : CV_LEVELS[x.level].toLowerCase()}. ${esc(cvRiskWords(x.row).replace(/^./, c => c.toUpperCase()))}, ${x.row.cov}% coverage.</span>
      <p>${mxGloss(x.text, seen)}</p>
      <a class="ma-tool" href="#${x.layer.tool[0]}">${esc(x.layer.tool[1])}<svg><use href="#i-arrow"/></svg></a></article>`).join("")}</div>
    ${acts.length > 8 ? `<p class="note">${acts.length - 8} more step${acts.length - 8 === 1 ? "" : "s"} in the download and in Send to tracker.</p>` : ""}`;
}
function cvResultHTML(){
  const any = cvSummary(cv).rated, acts = cvActions(cv).length;
  return `<div class="ma-res"><div class="card ma-sum"><div class="ma-sum-t">${cvWhy()}</div>
      ${any ? `<div class="ma-sum-cta"><button type="button" class="btn sm" data-cv="download"><svg><use href="#i-download"/></svg>Download</button>${acts ? `<button type="button" class="btn sm" data-cv="tasks"><svg><use href="#i-send"/></svg>Send to tracker</button>` : ""}<button type="button" class="btn sm primary" data-cv="save"><svg><use href="#i-save"/></svg>${wsSaveLabel("coverage", cv)}</button></div>` : ""}</div>
    <div class="card cv-big">${cvRadar(cv, true)}${cvLegend(cv)}</div></div>
    <div class="ma-rh"><h4>Biggest gaps</h4></div>${cvGapsHTML()}
    ${cv.ex || cvSummary(cv).rated < CV_AREAS.length * CV_LAYERS.length ? "" : typeof journeyNextHTML === "function" ? journeyNextHTML("coverage") : ""}`;
}
function cvHeadMeta(){
  const any = cvSummary(cv).rated;
  return `<span class="toast" id="cv-toast" aria-live="polite"></span>
    ${cv.ex ? `<button class="btn sm" data-cv="clear">Clear example</button>` : any ? `<button class="btn sm" data-cv="reset">Start over</button>` : `<button class="btn sm" data-cv="example">See an example</button>`}
    ${any ? `<button class="btn sm" data-cv="download"><svg><use href="#i-download"/></svg>Download</button><button class="btn sm primary" data-cv="save"><svg><use href="#i-save"/></svg>${wsSaveLabel("coverage", cv)}</button>` : ""}`;
}
function cvMarkdown(d){
  const s = cvSummary(d), acts = cvActions(d), src = cvSrcName(d);
  const L = [`# Trust & Safety coverage radar`, ``, `${new Date().toISOString().slice(0, 10)}${src ? " · risk from " + src : ""}`, ``, `**${s.weighted ? "Risk-weighted coverage" : "Coverage"}: ${s.cov}%**${s.exposed.length ? ` · ${s.exposed.length} exposed` : ""}${s.gaps.length ? ` · ${s.gaps.length} gap${s.gaps.length === 1 ? "" : "s"}` : ""}`, ``];
  L.push(`| Harm area | Risk | ${CV_LAYERS.map(l => l.n).join(" | ")} | Coverage |`, `|---|---|${CV_LAYERS.map(() => "---|").join("")}---|`);
  s.rows.forEach(x => L.push(`| ${x.a.n} | ${x.band ? BANDS[x.band][0] : x.score === 0 ? "None found" : "–"} | ${CV_LAYERS.map(l => x.r[l.k] === undefined ? "–" : CV_LEVELS[x.r[l.k]]).join(" | ")} | ${x.rated ? x.cov + "%" : "–"} |`));
  L.push(``, `## Next steps`, ``);
  if(!acts.length) L.push(`No gaps where risk is high.`);
  acts.forEach(x => L.push(`- [ ] **${x.row.a.n}, ${x.layer.n.toLowerCase()}** (${x.row.status === "exposed" ? "exposed" : "gap"}): ${x.text}`));
  L.push(``, `---`, `Made with T&S Workbench. A self-assessment to guide planning, not an audit.`);
  return L.join("\n");
}
const cvTitle = d => { const s = cvSummary(d); return `Coverage radar: ${s.cov}% coverage${s.exposed.length ? `, ${s.exposed.length} exposed` : ""}`; };

function renderCoverage(){
  const step = n => `<div class="mxa-ph"><span class="mxa-pnum">${n}</span><div><h3>${CV_STEPS[n - 1][0]}</h3><p>${CV_STEPS[n - 1][1]}</p></div></div>`;
  view.innerHTML = head("Coverage Radar",
    "Rate how well your defenses cover each kind of harm, then see it against your products' risk. Where risk outruns coverage is where to invest next.",
    "Run the program", cvHeadMeta()) + `
    <p class="mxa-q cv-q">Where is your risk highest and your coverage thinnest?</p>
    <div class="mxm-how"><ol class="mxm-how-s">${CV_STEPS.map((s, j) => `<li><b>${j + 1}</b><span><em>${s[0]}.</em> ${s[1]}</span></li>`).join("")}</ol></div>
    ${cv.ex ? `<div class="banner ma-exb"><span><strong>This is an example:</strong> a teen social app's risk against a typical early program's coverage. Clear it to rate your own.</span><button type="button" class="btn sm" data-cv="clear">Clear example</button></div>` : ""}
    <div class="vd-grid ma-grid cv-grid">
      <div class="vd-main">
        <section class="mxa-part">${step(1)}<div id="cv-src-wrap">${cvSourceHTML()}</div></section>
        <section class="mxa-part">${step(2)}<div id="cv-matrix">${cvMatrixHTML()}</div></section>
        <section class="mxa-part" id="cv-p3">${step(3)}<div id="cv-result">${cvResultHTML()}</div></section>
      </div>
      <aside class="vd-rail"><div class="card vd-railc" id="cv-rail">${cvRailHTML()}</div></aside>
    </div>
    <p class="note" style="margin-top:18px">A self-assessment to guide planning, not an audit or legal advice. Coverage counts each layer equally; risk comes from the pre-mortem's scores.</p>`;
  bindCoverage();
}
function cvRefresh(all){
  const set = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  if(all){ set("cv-src-wrap", cvSourceHTML()); set("cv-matrix", cvMatrixHTML()); }
  set("cv-rail", cvRailHTML()); set("cv-result", cvResultHTML());
  const hm = view.querySelector && view.querySelector(".pagehead .headmeta"); if(hm) hm.innerHTML = cvHeadMeta();
}
function bindCoverage(){
  view.onclick = e => {
    const b = e.target.closest("button"); if(!b || !view.contains(b)) return;
    const d = b.dataset;
    if(d.cva){
      const row = cv.r[d.cva] = Object.assign({}, cv.r[d.cva]); row[d.cvl] = +d.cvn; cv.ex = false; cvSave();
      b.parentNode.querySelectorAll("button").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
      const x = cvRows(cv).find(r => r.a.k === d.cva), cell = document.querySelector(`#cv-row-${d.cva} .cv-mv`);
      if(cell && x){ cell.className = "cv-mv " + x.status; cell.innerHTML = `<b class="mono">${x.cov}%</b><span class="cv-mb"><i style="width:${x.cov}%"></i>${x.riskPct !== null ? `<em style="left:${x.riskPct}%" title="Risk ${x.riskPct}%"></em>` : ""}</span>`; }
      return cvRefresh(false);
    }
    if(d.cvgo){ const el = document.getElementById("cv-p3"); if(el && el.scrollIntoView) el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"}); return; }
    if(d.ov === "new") return newAssessment();
    switch(d.cv){
      case "example": cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); store.set("ws:cur:coverage", null); cvSave(); return renderCoverage();
      case "clear": case "reset": cv = {src:cv.ex ? null : cv.src, ex:false, r:{}}; store.set("ws:cur:coverage", null); cvSave(); return renderCoverage();
      case "download": { const md = cvMarkdown(cv); return offerFile(`ts-coverage-radar-${new Date().toISOString().slice(0, 10)}.md`, md, md, $("#cv-toast")); }
      case "tasks": return tkOpen("coverage");
      case "save": { const msg = wsSaveTool("coverage", cv, cvTitle(cv)); renderCoverage(); return flashIn($("#cv-toast"), msg); }
    }
  };
  view.onchange = e => { if(e.target.id === "cv-src"){ cv.src = e.target.value || null; cvSave(); cvRefresh(true); const s = document.getElementById("cv-src"); if(s) s.focus(); } };
  view.onkeydown = e => {
    const g = e.target.closest && e.target.closest(".cv-seg"); if(!g || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault(); const bs = [...g.querySelectorAll("button")], cur = bs.indexOf(e.target), nx = bs[Math.max(0, Math.min(bs.length - 1, cur + (e.key === "ArrowRight" ? 1 : -1)))];
    if(nx){ nx.click(); nx.focus(); }
  };
  view.querySelectorAll(".gl").forEach(g => g.onclick = () => g.focus());
}
