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
const cvHarm = a => a.n.replace(" & ", " and ").split(" ").map(w => /^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase()).join(" ");
const cvRiskWords = x => x.band ? `${BANDS[x.band][0].toLowerCase()} risk (${x.score} of 16)` : "no risk found";

/* ---------- harm areas that don't apply ---------- */
// Kept in the company profile, so the radar and every grade leave them out. Examples always show all eight.
// At least three stay, so the radar keeps its shape
const CV_MIN = 3;
let cvConfirm = null;
const cvOff = () => ((store.get("ws:org", null) || {}).harmsOff || []).filter(k => CV_AREAS.some(a => a.k === k));
const cvAreas = d => d && d.ex ? CV_AREAS : CV_AREAS.filter(a => !cvOff().includes(a.k));
function cvSetOff(k, off){
  const cur = cvOff(), next = off ? cur.filter(x => x !== k).concat([k]) : cur.filter(x => x !== k);
  if(CV_AREAS.length - next.length < CV_MIN) return false;
  store.set("ws:org", Object.assign({}, store.get("ws:org", null) || {}, {harmsOff:next})); return true;
}

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
  return cvAreas(d).map(a => {
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
  return {rows, rated, total:rows.length * CV_LAYERS.length, cov, weighted:!!weight, exposed:rows.filter(x => x.status === "exposed"), gaps:rows.filter(x => x.status === "gap")};
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
let cvSeq = 0;
function cvRadar(d, big, prev){
  const hid = "cv-h" + (++cvSeq), hatch = (id, c) => `<defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${c}" stroke-width="1.1"/></pattern></defs>`;
  const rows = cvRows(d), n = rows.length, W = 400, H = big ? 320 : 300, cx = W / 2, cy = H / 2, R = big ? 104 : 96, f = v => v.toFixed(1);
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = (i, pct) => [cx + Math.cos(ang(i)) * R * pct / 100, cy + Math.sin(ang(i)) * R * pct / 100];
  const poly = vals => vals.map((v, i) => pt(i, v).map(f).join(",")).join(" ");
  const rings = [25, 50, 75, 100].map(p => `<polygon points="${poly(rows.map(() => p))}" fill="${p === 100 ? "var(--surface)" : "none"}" stroke="var(--line${p === 100 ? "-strong" : ""})"/>`).join("");
  const axes = rows.map((x, i) => { const [a, b] = pt(i, 100); return `<line x1="${cx}" y1="${cy}" x2="${f(a)}" y2="${f(b)}" stroke="var(--line)"/>`; }).join("");
  const hasRisk = rows.some(x => x.riskPct !== null), anyRated = rows.some(x => x.rated);
  const risk = hasRisk ? `<polygon class="cv-risk" points="${poly(rows.map(x => x.riskPct || 0))}" fill="none" stroke="var(--crit)" stroke-width="1.5" stroke-dasharray="2 3" stroke-linecap="round" stroke-linejoin="round"/>` : "";
  const cover = anyRated ? `${hatch(hid, "var(--ink)")}<polygon class="cv-cov" points="${poly(rows.map(x => x.cov))}" fill="url(#${hid})" stroke="var(--ink)" stroke-width="1.8" stroke-linejoin="round"/>` : "";
  // a previous quarter's coverage, dotted, for the quarter-by-quarter view
  const was = prev && rows.some(x => prev[x.a.k] !== undefined) ? `<polygon class="cv-prev" points="${poly(rows.map(x => prev[x.a.k] || 0))}" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="1.5 3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>` : "";
  const dots = anyRated ? rows.map((x, i) => { if(!x.rated) return ""; const [a, b] = pt(i, x.cov);
    return `<circle cx="${f(a)}" cy="${f(b)}" r="${big ? 4 : 3.5}" class="cv-dot ${x.status === "exposed" || x.status === "gap" ? "" : "ok"}" fill="${x.status === "exposed" ? "var(--crit)" : x.status === "gap" ? "var(--high)" : "var(--ink)"}" stroke="var(--surface)" stroke-width="1.5"/>`; }).join("") : "";
  const labels = rows.map((x, i) => { const [a, b] = pt(i, big ? 124 : 120), c = Math.cos(ang(i)), s = Math.sin(ang(i)), extra = x.a.l.length - 1;
    const anchor = c > .3 ? "start" : c < -.3 ? "end" : "middle", dy0 = s < -.6 ? `${-.2 - 1.1 * extra}em` : s > .6 ? ".9em" : `${.35 - .55 * extra}em`;
    return `<text x="${f(a)}" y="${f(b)}" text-anchor="${anchor}" class="cv-rl ${x.status}">${x.a.l.map((t, j) => `<tspan x="${f(a)}" dy="${j ? "1.1em" : dy0}">${esc(t)}</tspan>`).join("")}</text>`; }).join("");
  const aria = rows.map(x => `${x.a.n}: coverage ${x.cov}%${x.riskPct !== null ? `, risk ${x.riskPct}%` : ""}`).join(". ");
  return `<svg class="cv-radar ${big ? "big" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc("Risk against coverage. " + aria)}">${rings}${axes}${risk}${was}${cover}${dots}${labels}
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
    ${rk ? `<div class="cv-riskbar">${cvAreas(cv).map(a => { const x = rk[a.k]; return `<span class="cv-rb ${x.band || "none"}" title="${esc(a.n + ": " + (x.band ? BANDS[x.band][0] + " risk" : "no risk found"))}"><i></i>${esc(a.l.join(" "))}</span>`; }).join("")}</div>` : ""}
  </div>`;
}
function cvCellHTML(x, l){
  const v = x.r[l.k];
  return `<div class="cv-seg" role="radiogroup" aria-label="${esc(x.a.n + ": " + l.n)}">${CV_LEVELS.map((n, j) => `<button type="button" role="radio" aria-checked="${v === j}" class="${v === j ? "on" : ""} l${j}" data-cva="${x.a.k}" data-cvl="${l.k}" data-cvn="${j}" title="${esc(n + ": " + l.lv[j])}"><span class="visually-hidden">${n}</span></button>`).join("")}</div>`;
}
/* ---------- Start from maturity: one program-wide level per layer, then adjust each harm area ---------- */
const CV_FROM_MA = {policy:"policy", detect:"detection", enforce:"operations", appeal:"quality", measure:"measurement"};
const cvMaReady = () => typeof ma !== "undefined" && !ma.ex && MA_AREAS.every(a => ma.lv[a.k]);
const cvFromMaLevel = n => n >= 4 ? 3 : Math.max(0, n - 1);
function cvFillFromMaturity(){
  let n = 0;
  cvAreas(cv).forEach(a => { const row = cv.r[a.k] = Object.assign({}, cv.r[a.k]); CV_LAYERS.forEach(l => { if(row[l.k] === undefined){ row[l.k] = cvFromMaLevel(maLevelOf(ma, CV_FROM_MA[l.k])); n++; } }); });
  cv.ex = false; cv.est = true; cvSave(); return n;
}
function cvEstHTML(){
  if(cv.ex) return "";
  if(cv.est) return `<div class="banner cv-est"><span><strong>Estimates from your maturity ratings.</strong> Every harm area starts at your program-wide level. Change the ones that are stronger or weaker, then confirm.</span><button type="button" class="btn sm primary" data-cv="confirm">Confirm coverage</button></div>`;
  const s = cvSummary(cv), left = s.total - s.rated;
  if(!left || !cvMaReady()) return "";
  return `<div class="card cv-fill"><div><b>Start from your maturity ratings</b><small>Fill ${left === s.total ? "all " + s.total : "the " + left + " unrated"} cells with your program-wide level for each layer (${CV_LAYERS.map(l => `${l.n.toLowerCase()}: ${CV_LEVELS[cvFromMaLevel(maLevelOf(ma, CV_FROM_MA[l.k]))].toLowerCase()}`).join(", ")}), then adjust the harm areas that differ.</small></div><button type="button" class="btn sm primary" data-cv="fillma">Fill from maturity</button></div>`;
}
// Who found the risk in a harm area: the worst product, the chosen product, or the example
function cvRiskWho(x){
  const {src} = cvSrc(cv);
  return x.from ? `${x.from}'s pre-mortem` : src && src.startsWith("pm:") ? `${cvSrcName(cv)}'s pre-mortem` : "The example product";
}
// Removing a harm area with high or critical risk asks first, since it takes that risk out of the grade
function cvConfirmHTML(x){
  return `<div class="cv-mr cv-conf" id="cv-row-${x.a.k}" role="group" aria-label="${esc("Remove " + x.a.n + "?")}">
    <div class="cv-conf-t"><b>Remove ${esc(cvHarm(x.a))}?</b><span>${esc(cvRiskWho(x))} found ${esc(cvRiskWords(x))} here. Removing it also takes that risk out of your coverage grade.</span></div>
    <div class="cv-conf-a"><button type="button" class="btn sm danger" data-cvoffok="${x.a.k}">Remove</button><button type="button" class="btn sm" data-cvoffno="${x.a.k}">Keep it</button></div></div>`;
}
function cvOffHTML(){
  const off = cvOff(); if(cv.ex || !off.length) return "";
  const rk = cvRisk(cv), p = typeof wsProfile === "function" ? wsProfile() : null, risky = off.filter(k => rk && rk[k] && rk[k].score >= 8);
  const area = k => CV_AREAS.find(a => a.k === k);
  return `<div class="cv-offs"><span class="cv-offs-t">Doesn't apply to ${esc((p && p.org) || "your platform")}:</span>
    ${off.map(k => `<button type="button" class="cv-offc ${risky.includes(k) ? "warn" : ""}" data-cvon="${k}" aria-label="${esc("Restore " + area(k).n)}" title="Restore it">${esc(area(k).n)}<svg><use href="#i-plus"/></svg></button>`).join("")}
    <span class="note">Saved in your company profile.</span>
    ${risky.map(k => { const x = Object.assign({a:area(k)}, rk[k]); return `<p class="cv-offw">${esc(cvRiskWho(x))} found ${esc(cvRiskWords(x))} in ${esc(cvHarm(x.a))}. Restore it if that risk is real.</p>`; }).join("")}</div>`;
}
function cvMatrixHTML(){
  const rows = cvRows(cv), seen = new Set(), canOff = rows.length > CV_MIN;
  const trash = x => cv.ex ? "" : `<button type="button" class="cv-off" data-cvoff="${x.a.k}" ${canOff ? "" : 'aria-disabled="true"'} aria-label="${esc("Remove " + x.a.n + ": it doesn't apply to your platform")}" title="${canOff ? "Doesn't apply to us" : "Keep at least three harm areas"}"><svg><use href="#i-trash"/></svg></button>`;
  return `<div class="card cv-mx">
    <div class="cv-mh"><span>Harm area</span>${CV_LAYERS.map(l => `<span title="${esc(l.q)}">${l.n}</span>`).join("")}<span>Coverage</span></div>
    ${rows.map(x => cvConfirm === x.a.k ? cvConfirmHTML(x) : `<div class="cv-mr" id="cv-row-${x.a.k}">
      <div class="cv-mn"><span class="cv-mnt"><b>${esc(x.a.n)}</b>${trash(x)}</span>${x.band ? `<span class="pill ${BANDS[x.band][1]}">${BANDS[x.band][0]} risk</span>` : x.score === 0 ? `<span class="note">No risk found</span>` : ""}</div>
      ${CV_LAYERS.map(l => `<div class="cv-mc"><span class="cv-ml">${l.n}</span>${cvCellHTML(x, l)}</div>`).join("")}
      <div class="cv-mv ${x.status}"><b class="mono">${x.rated ? x.cov + "%" : "–"}</b><span class="cv-mb"><i style="width:${x.cov}%"></i>${x.riskPct !== null ? `<em style="left:${x.riskPct}%" title="Risk ${x.riskPct}%"></em>` : ""}</span></div>
    </div>`).join("")}
    ${cvOffHTML()}
    <div class="cv-key"><span>Levels, weakest to strongest:</span>${CV_LEVELS.map((n, j) => `<span class="cv-kl"><i class="l${j}"></i>${n}</span>`).join("")}<span class="note">Hover a square to see what each level means.</span></div>
    <details class="cv-defs"><summary>What each level means</summary>
      <div class="cv-dt">${CV_LAYERS.map(l => `<div><h5>${l.n}</h5><p class="note">${esc(l.q)}</p><ol start="0">${l.lv.map((t, j) => `<li><b>${CV_LEVELS[j]}.</b> ${mxGloss(t, seen)}</li>`).join("")}</ol></div>`).join("")}</div></details>
  </div>`;
}
function cvWhy(){
  const s = cvSummary(cv), rk = cvRisk(cv);
  if(!s.rated) return `<p>Rate at least one defense to see your coverage. It takes about five minutes for all ${cvAreas(cv).length} harm areas.</p>`;
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
    ${cv.ex || cv.est || cvSummary(cv).rated < cvSummary(cv).total ? "" : typeof journeyNextHTML === "function" ? journeyNextHTML("coverage") : ""}`;
}
function cvHeadMeta(){
  const any = cvSummary(cv).rated;
  return `<span class="toast" id="cv-toast" aria-live="polite"></span>
    ${cv.ex ? `<button class="btn sm" data-cv="clear">Start over</button>` : any ? `<button class="btn sm" data-cv="reset">Start over</button>` : `<button class="btn sm" data-cv="example">See an example</button>`}
    ${any ? `<button class="btn sm" data-cv="save"><svg><use href="#i-save"/></svg>${wsSaveLabel("coverage", cv)}</button><button class="btn sm primary" data-cv="download"><svg><use href="#i-download"/></svg>Download</button>` : ""}`;
}
function cvMarkdown(d){
  const s = cvSummary(d), acts = cvActions(d), src = cvSrcName(d);
  const L = [`# Trust & Safety coverage radar`, ``, `${new Date().toISOString().slice(0, 10)}${src ? " · risk from " + src : ""}`, ``, `**${s.weighted ? "Risk-weighted coverage" : "Coverage"}: ${s.cov}%**${s.exposed.length ? ` · ${s.exposed.length} exposed` : ""}${s.gaps.length ? ` · ${s.gaps.length} gap${s.gaps.length === 1 ? "" : "s"}` : ""}`, ``];
  L.push(`| Harm area | Risk | ${CV_LAYERS.map(l => l.n).join(" | ")} | Coverage |`, `|---|---|${CV_LAYERS.map(() => "---|").join("")}---|`);
  s.rows.forEach(x => L.push(`| ${x.a.n} | ${x.band ? BANDS[x.band][0] : x.score === 0 ? "None found" : "–"} | ${CV_LAYERS.map(l => x.r[l.k] === undefined ? "–" : CV_LEVELS[x.r[l.k]]).join(" | ")} | ${x.rated ? x.cov + "%" : "–"} |`));
  if(!d.ex && cvOff().length) L.push(``, `Left out because they don't apply to this platform: ${cvOff().map(k => CV_AREAS.find(a => a.k === k).n).join(", ")}.`);
  L.push(``, `## Next steps`, ``);
  if(!acts.length) L.push(`No gaps where risk is high.`);
  acts.forEach(x => L.push(`- [ ] **${x.row.a.n}, ${x.layer.n.toLowerCase()}** (${x.row.status === "exposed" ? "exposed" : "gap"}): ${x.text}`));
  L.push(``, `---`, `Made with T&S Workbench. A self-assessment to guide planning, not an audit.`);
  return L.join("\n");
}
const cvTitle = d => { const s = cvSummary(d); return `Coverage radar: ${s.cov}% coverage${s.exposed.length ? `, ${s.exposed.length} exposed` : ""}`; };

// Remove a harm area, or bring it back, then redraw the radar and the grades
function cvOffDo(k, back){
  const a = CV_AREAS.find(x => x.k === k), was = cvSummary(cv);
  cvConfirm = null;
  if(!cvSetOff(k, !back)) return gsay("Keep at least three harm areas so the radar can compare them");
  cvRefresh(true); const now = cvSummary(cv);
  const f = document.querySelector(back ? `[data-cvoff="${k}"]` : `[data-cvon="${k}"]`); if(f) f.focus({preventScroll:true});
  gsay(`${back ? "Restored" : "Removed"} ${cvHarm(a)}${back ? "" : " from your company profile"}${was.rated && now.rated && was.cov !== now.cov ? `. Coverage ${was.cov}% → ${now.cov}%` : ""}`);
}
/* ---------- Guided: one question at a time, a result after each harm area ---------- */
// Where the guided flow is (intro, which harms apply, a question, an area's result). Null means work it out from the answers.
// cvView "table" is the one-page version with every question at once, for people who know their program
let cvG = null, cvView = null, cvTab = "gaps";
const CV_NOUN = {child:"child safety violations", sexual:"sexual harm", harass:"harassment and hate", violent:"violent and self-harm content", ai:"AI misuse", privacy:"privacy and safety threats", integrity:"platform abuse", fraud:"fraud and scams"};
const cvNoun = a => (typeof typeHarm === "function" ? typeHarm(a.k, "") : "") || CV_NOUN[a.k] || cvHarm(a);
const CV_Q = {
  policy:{q:a => `Is there a clear rule on ${cvHarm(a)} that reviewers can apply?`, why:"Reviewers can only be consistent with a rule they can actually apply."},
  detect:{q:a => `How do you find ${cvNoun(a)} today?`, why:"If you rely on user reports, most people see the harm before you do."},
  enforce:{q:a => `When you find ${cvNoun(a)}, can trained people act on it quickly?`, why:"Finding it only helps if someone can act, consistently and in time."},
  appeal:{q:a => `Can users contest your ${cvHarm(a)} decisions?`, why:"Appeals catch your mistakes, and more laws now require them."},
  measure:{q:a => `Do you measure how often users run into ${cvNoun(a)}?`, why:"Without prevalence, you can't tell whether things are getting better."}
};
const cvRatedAll = () => { const s = cvSummary(cv); return s.total > 0 && s.rated === s.total; };
function cvMode(){
  if(cv.ex) return "results";
  if(cvView === "table" || cv.est) return "table";
  if(cvG) return "guide";
  return cvRatedAll() ? "results" : "guide";
}
// The first question not answered yet
function cvFirstOpen(){
  const areas = cvAreas(cv);
  for(let a = 0; a < areas.length; a++) for(let l = 0; l < CV_LAYERS.length; l++) if((cv.r[areas[a].k] || {})[CV_LAYERS[l].k] === undefined) return {a, l};
  return null;
}
// After an area: the next open question, or the next area when going through the questions again
function cvNextPos(){
  const p = cvFirstOpen(); if(p) return p;
  return cvG && cvG.again && cvG.a + 1 < cvAreas(cv).length ? {a:cvG.a + 1, l:0} : null;
}
const cvInAssessment = () => asInAssessment();
const cvStepBar = pct => asStepBar("coverage", pct, true);
function cvIntroHTML(){
  const s = cvSummary(cv), n = cvAreas(cv).length, {src, s:srcs} = cvSrc(cv), rk = cvRisk(cv);
  const from = !src ? "No pre-mortem yet, so this maps coverage only. Run one to compare against real risk." : src === "all" ? `From your ${srcs.pms.length} saved pre-mortem${srcs.pms.length === 1 ? "" : "s"}, worst risk in each area.`
    : src.startsWith("pm:") ? `From the ${cvSrcName(cv)} pre-mortem.` : "From an example product. Run a pre-mortem for your own.";
  return `<div class="gd-w gd-intro">
    <span class="gd-tool"><span class="sb-glyph" style="background:var(--t-cv)"><svg><use href="#i-cover"/></svg></span>Coverage radar</span>
    <h1>Do your defenses keep up with your risk?</h1>
    <p class="gd-lead">For each kind of harm, you'll answer five short questions about how you handle it today. Then you'll see your risk next to your defenses, and the gaps to close first.</p>
    <div class="gd-facts"><div><b>About 5 minutes</b><span>One question at a time. Stop whenever you like.</span></div><div><b>${n} kinds of harm</b><span>Skip any that can't happen on your platform.</span></div><div><b>${rk ? "Risk already known" : "Coverage only"}</b><span>${esc(from)}</span></div></div>
    <div class="gd-a"><button type="button" class="btn primary gd-cta" data-cvg="${s.rated ? "resume" : "start"}">${s.rated ? `Pick up where you left off (${s.rated} of ${s.total})` : "Start"} ${icon("arrow")}</button>
      ${!src ? `<button type="button" class="btn gd-cta" data-ov="new">Run a pre-mortem first</button>` : ""}</div>
    <div class="gd-alt"><span>Other ways in:</span><button type="button" class="ov-link" data-cvg="table">Answer everything in one table</button>${cvMaReady() ? `<button type="button" class="ov-link" data-cv="fillma">Start from your maturity ratings</button>` : ""}<button type="button" class="ov-link" data-cv="example">See a finished example</button></div>
  </div>`;
}
function cvApplyHTML(){
  const rk = cvRisk(cv), off = cvOff(), p = typeof wsProfile === "function" ? wsProfile() : null, n = CV_AREAS.length - off.length;
  return `<div class="gd-w">
    <div class="gd-hd"><span class="as-eb">Before you start</span><h1>Which of these can happen on ${esc((p && p.org) || "your platform")}?</h1>
      <p>Untick anything your platform can't have. It won't count toward your grade. It's saved in your company profile, so you can add it back any time.</p></div>
    <div class="card gd-list">${CV_AREAS.map(a => { const on = !off.includes(a.k), x = rk && rk[a.k];
      return `<div class="gd-ar ${on ? "" : "off"}"><label><input type="checkbox" data-cvapply="${a.k}" ${on ? "checked" : ""}><span class="gd-arn">${esc(a.n)}</span>${x ? `<span class="pill ${x.band ? BANDS[x.band][1] : ""}">${x.band ? BANDS[x.band][0] + " risk" : "No risk found"}</span>` : ""}</label>
        ${!on && x && x.score >= 8 ? `<p class="gd-warn">${esc(cvRiskWho(x))} found ${esc(cvRiskWords(x))} here. Leave it out only if that risk isn't real.</p>` : ""}</div>`; }).join("")}</div>
    <div class="gd-foot"><button type="button" class="btn" data-cvg="intro">Back</button><button type="button" class="btn primary" data-cvg="first">Continue with ${n} area${n === 1 ? "" : "s"} ${icon("arrow")}</button></div>
  </div>`;
}
function cvQHTML(){
  const areas = cvAreas(cv); cvG.a = Math.max(0, Math.min(cvG.a || 0, areas.length - 1)); cvG.l = Math.max(0, Math.min(cvG.l || 0, CV_LAYERS.length - 1));
  const a = areas[cvG.a], L = CV_LAYERS[cvG.l], r = cv.r[a.k] || {}, Q = CV_Q[L.k];
  return `<div class="gd-q">
    <div class="gd-main">
      <div class="gd-crumb"><span class="gd-area">${esc(a.n)}</span><span aria-hidden="true">/</span><span>Question ${cvG.l + 1} of ${CV_LAYERS.length}</span></div>
      <h1>${esc(Q.q(a))}</h1>
      <p class="gd-why">${esc(Q.why)}</p>
      <div class="gd-opts" role="group" aria-label="${esc(L.n + " for " + a.n)}">${CV_LEVELS.map((n, j) => `<button type="button" class="gd-opt ${r[L.k] === j ? "on" : ""}" data-cvpick="${j}" aria-pressed="${r[L.k] === j}">
        <span class="gd-radio" aria-hidden="true"></span><span class="gd-ot"><span class="gd-lv l${j}">${n}</span><span>${esc(L.lv[j])}</span></span><kbd aria-hidden="true">${j + 1}</kbd></button>`).join("")}</div>
      <div class="gd-foot"><button type="button" class="btn" data-cvg="back">Back</button><span class="note">Pick the closest, or press 1 to 4. You can change it later.</span></div>
    </div>
    <aside class="gd-aside" aria-label="Your progress">
      <div class="card gd-rad"><div class="gd-rad-h"><b>Your radar so far</b><span class="note">Fills in as you answer</span></div><div class="as-rad-g">${cvRadar(cv, false)}</div>${cvLegend(cv)}</div>
      <div class="card gd-lays"><b>${esc(a.n)}</b>${CV_LAYERS.map((Ly, i) => { const v = r[Ly.k], now = i === cvG.l;
        return `<div class="gd-lay ${now ? "now" : ""}"><span>${Ly.n}</span><span class="gd-lv l${v === undefined ? "x" : v}">${v === undefined ? (now ? "Now" : "–") : CV_LEVELS[v]}</span></div>`; }).join("")}</div>
      <div class="gd-chips"><span class="as-eb">Area ${cvG.a + 1} of ${areas.length}</span><div>${areas.map((z, i) => { const full = CV_LAYERS.every(Ly => (cv.r[z.k] || {})[Ly.k] !== undefined);
        return `<span class="gd-chip ${i === cvG.a ? "now" : full ? "full" : ""}">${esc(z.n)}</span>`; }).join("")}</div></div>
      <div class="gd-alt"><button type="button" class="ov-link" data-cvg="table">Answer the rest in one table</button>${cvMaReady() ? `<button type="button" class="ov-link" data-cv="fillma">Fill the rest from your maturity ratings</button>` : ""}</div>
    </aside>
  </div>`;
}
function cvAreaDoneHTML(){
  const areas = cvAreas(cv), a = areas[Math.max(0, Math.min(cvG.a || 0, areas.length - 1))], x = cvRows(cv).find(z => z.a.k === a.k);
  const lv = k => x.r[k] || 0, weak = CV_LAYERS.filter(L => lv(L.k) <= 1).sort((p, q) => (2 - lv(q.k)) * CV_LAYER_WEIGHT[q.k] - (2 - lv(p.k)) * CV_LAYER_WEIGHT[p.k])[0];
  const lab = {exposed:["Exposed", "crit"], gap:["Gap", "high"], covered:["Covered", "good"]}[x.status];
  const verdict = x.status === "exposed" ? `${BANDS[x.band][0]} risk, with less than half the coverage it needs.` : x.status === "gap" ? "Risk outruns your coverage here, though the basics are in place."
    : x.status === "covered" ? "Your defenses keep pace with the risk here." : x.score === null ? "There's no pre-mortem to compare against yet, so this shows coverage only."
    : x.score ? "Lower risk, so it counts for less in your grade." : "Your pre-mortem found no risk here, so it counts for little in your grade.";
  const nx = cvNextPos();
  return `<div class="gd-w"><div class="card gd-done">
    <div class="gd-done-h"><span class="as-eb">${esc(a.n)} · done</span>${lab ? `<span class="pill ${lab[1]}">${lab[0]}</span>` : ""}</div>
    <h1>${x.cov}% covered</h1>
    <div class="gd-meter"><span class="gd-mbar"><i class="${x.status}" style="width:${x.cov}%"></i>${x.riskPct !== null ? `<em style="left:${Math.min(x.riskPct, 99.6)}%"></em>` : ""}</span>
      <span class="gd-mlab"><span>Your coverage</span><span>${x.score !== null ? esc(cvRiskWords(x).replace(/^./, c => c.toUpperCase())) : ""}</span></span></div>
    <p class="gd-verdict">${esc(verdict)}</p>
    ${weak ? `<div class="gd-fix"><span class="as-eb">Start with ${esc(weak.n.toLowerCase())}</span><p>${esc(weak.act(cvHarm(a)))}</p></div>` : ""}
    <div class="gd-foot"><button type="button" class="btn" data-cvg="back">Change answers</button><button type="button" class="btn primary" data-cvg="next">${nx ? `Next: ${esc(areas[nx.a].n)}` : "See your results"} ${icon("arrow")}</button></div>
  </div></div>`;
}
function cvGuideRender(){
  // With no position yet, the intro shows without claiming one, so a finished set of answers still opens the results
  const scr = cvG ? cvG.scr : "intro", s = cvSummary(cv), pct = Math.round(s.rated / Math.max(1, s.total) * 100);
  const body = scr === "apply" ? cvApplyHTML() : scr === "q" ? cvQHTML() : scr === "done" ? cvAreaDoneHTML() : cvIntroHTML();
  view.innerHTML = `<div class="gd gd-s-${scr}">${cvStepBar(pct)}<span class="toast" id="cv-toast" aria-live="polite"></span>${body}</div>`;
}
function cvResultsRender(){
  const s = cvSummary(cv), acts = cvActions(cv), top = acts.slice(0, 3), rk = cvRisk(cv), inAs = cvInAssessment() && !cv.ex;
  const tabs = [["gaps", `All gaps${acts.length ? ` (${acts.length})` : ""}`], ["answers", "Your answers"], ["source", "Compare against"]];
  view.innerHTML = `<div class="gd cvr-page">${cvStepBar(100)}<span class="toast" id="cv-toast" aria-live="polite"></span>
    ${cv.ex ? `<div class="banner ma-exb"><span><strong>This is an example:</strong> a teen social app's risk against a typical early program's coverage.</span><button type="button" class="btn sm" data-cv="clear">Clear it and start yours</button></div>` : ""}
    <div class="card cvr-side">
      <span class="as-eb">${cv.ex ? "Example" : "Coverage mapped"}</span>
      <h1 class="visually-hidden">Coverage radar results</h1>
      <div class="pol-verdict">${cvWhy()}</div>
      ${top.length ? `<ol class="card cvr-top">${top.map((x, i) => `<li><span class="cvr-n mono">${i + 1}</span><div><div class="cvr-th"><b>${esc(x.row.a.n)}</b><span class="note">${esc(x.layer.n)}</span><span class="pill ${x.row.status === "exposed" ? "crit" : "high"}">${x.row.status === "exposed" ? "Exposed" : "Gap"}</span></div><p>${esc(x.text)}</p></div></li>`).join("")}</ol>` : ""}
      <div class="cvr-a">${inAs ? `<a class="btn primary" href="#overview">Back to your assessment ${icon("arrow")}</a>` : cv.ex ? "" : `<button type="button" class="btn primary" data-cv="save">${icon("save")}${wsSaveLabel("coverage", cv)}</button>`}
        ${acts.length && !cv.ex ? `<button type="button" class="btn" data-cv="tasks">${icon("send")}Send gaps to your tracker</button>` : ""}
        <button type="button" class="btn" data-cv="download">${icon("download")}Download</button>
        ${inAs ? `<button type="button" class="btn" data-cv="save">${icon("save")}${wsSaveLabel("coverage", cv)}</button>` : ""}</div>
      ${cv.ex ? "" : `<div class="cvr-more"><button type="button" class="ov-link" data-cvg="again">Go through the questions again</button><button type="button" class="ov-link" data-cv="reset">Start over</button></div>`}
    </div>
    <details class="ev-details"><summary>Details <span class="note">Radar, every gap, your answers and what you compared against</span></summary>
    <div class="cvr">
      <div class="card cvr-radar"><div class="cvr-rh"><b>Risk against coverage</b>${cvLegend(cv)}</div>${cvRadar(cv, true)}</div>
    </div>
    <div class="segs cvr-tabs" role="tablist" aria-label="Coverage detail">${tabs.map(([k, n]) => `<button type="button" role="tab" aria-selected="${cvTab === k}" class="${cvTab === k ? "on" : ""}" data-cvtab="${k}">${n}</button>`).join("")}</div>
    <div class="cvr-tab" role="tabpanel">${cvTab === "answers" ? `<div id="cv-est">${cvEstHTML()}</div><div id="cv-matrix">${cvMatrixHTML()}</div>` : cvTab === "source" ? `<div id="cv-src-wrap">${cvSourceHTML()}</div>` : cvGapsHTML()}</div>
    </details>
    <p class="note cvr-note">Your ratings stay in your browser. A self-assessment to guide planning, not an audit or legal advice. Coverage counts each layer equally; risk comes from the pre-mortem's scores.</p>
  </div>`;
}
// The one-page version: every question at once
function cvTableRender(){
  const step = n => `<div class="mxa-ph"><span class="mxa-pnum">${n}</span><div><h3>${CV_STEPS[n - 1][0]}</h3><p>${CV_STEPS[n - 1][1]}</p></div></div>`, full = cvRatedAll();
  view.innerHTML = head("Coverage radar",
    "Rate how well your defenses cover each kind of harm, then see it against your products' risk. Where risk outruns coverage is where to invest next.",
    "Run the program", cvHeadMeta()) + `
    ${cv.est ? "" : `<div class="banner cvt-b"><span>${full ? "<strong>Every defense is rated.</strong> See your radar and the gaps to close first." : "<strong>Prefer one question at a time?</strong> The guided version asks the same questions, with a result after each harm area."}</span><button type="button" class="btn sm ${full ? "primary" : ""}" data-cvg="${full ? "results" : "guide"}">${full ? "See your results" : "Switch to guided"}</button></div>`}
    <div class="vd-grid ma-grid cv-grid">
      <div class="vd-main">
        <section class="mxa-part">${step(1)}<div id="cv-src-wrap">${cvSourceHTML()}</div></section>
        <section class="mxa-part">${step(2)}<div id="cv-est">${cvEstHTML()}</div><div id="cv-matrix">${cvMatrixHTML()}</div></section>
        <section class="mxa-part" id="cv-p3">${step(3)}<div id="cv-result">${cvResultHTML()}</div></section>
      </div>
      <aside class="vd-rail"><div class="card vd-railc" id="cv-rail">${cvRailHTML()}</div></aside>
    </div>
    <p class="note" style="margin-top:18px">Your ratings stay in your browser. A self-assessment to guide planning, not an audit or legal advice. Coverage counts each layer equally; risk comes from the pre-mortem's scores.</p>`;
}
// keep: a redraw within the page (a confirm row, a tab) rather than arriving at it
function renderCoverage(keep){
  if(!keep) cvConfirm = null;
  const m = cvMode();
  if(m === "guide") cvGuideRender(); else if(m === "results") cvResultsRender(); else cvTableRender();
  bindCoverage();
}
function cvRefresh(all){
  if(cvMode() !== "table"){ const y = window.scrollY; renderCoverage(true); window.scrollTo(0, y); return; }
  const set = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  if(all){ set("cv-src-wrap", cvSourceHTML()); set("cv-matrix", cvMatrixHTML()); }
  set("cv-rail", cvRailHTML()); set("cv-result", cvResultHTML()); set("cv-est", cvEstHTML());
  const hm = view.querySelector && view.querySelector(".pagehead .headmeta"); if(hm) hm.innerHTML = cvHeadMeta();
}
// Answer the current question, then move on after a beat so the choice registers
function cvPick(j, now){
  if(!cvG || cvG.scr !== "q") return;
  const a = cvAreas(cv)[cvG.a], L = CV_LAYERS[cvG.l]; if(!a || !L) return;
  cv.r[a.k] = Object.assign({}, cv.r[a.k], {[L.k]:j}); cv.ex = false; cvSave();
  if(view.querySelectorAll) view.querySelectorAll("[data-cvpick]").forEach(b => { const on = +b.dataset.cvpick === j; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  const go = () => { if(!cvG || cvG.scr !== "q") return; if(cvG.l < CV_LAYERS.length - 1) cvG.l++; else cvG.scr = "done";
    renderCoverage(true); if(window.scrollY > 120) window.scrollTo(0, 0); focusQuiet(view.querySelector && view.querySelector("h1")); };
  clearTimeout(cvPick.t); if(now) go(); else cvPick.t = setTimeout(go, 260);
}
function cvGo(act){
  clearTimeout(cvPick.t);
  const n = CV_LAYERS.length, open = () => { const p = cvFirstOpen(); return p ? {scr:"q", a:p.a, l:p.l} : null; };
  if(act === "intro"){ cvG = {scr:"intro"}; cvView = null; }
  else if(act === "start") cvG = {scr:"apply"};
  else if(act === "first" || act === "resume") { cvG = open(); cvView = null; }
  else if(act === "back"){ if(!cvG || cvG.scr === "apply") cvG = {scr:"intro"}; else if(cvG.scr === "done") cvG = Object.assign({}, cvG, {scr:"q", l:n - 1});
    else if(cvG.l > 0) cvG.l--; else if(cvG.a > 0){ cvG.a--; cvG.l = n - 1; } else cvG = {scr:"apply"}; }
  else if(act === "next"){ const p = cvNextPos(); cvG = p ? {scr:"q", a:p.a, l:p.l, again:cvG && cvG.again} : null; }
  else if(act === "again"){ cvG = {scr:"q", a:0, l:0, again:true}; cvView = null; }
  else if(act === "table"){ cvG = null; cvView = "table"; }
  else if(act === "guide"){ cvView = null; cvG = open() || {scr:"intro"}; }
  else if(act === "results"){ cvView = null; cvG = null; }
  renderCoverage(true); window.scrollTo(0, 0); focusQuiet(view.querySelector && view.querySelector("h1"));
}
// 1 to 4 answers the current question from anywhere on the page
document.addEventListener("keydown", e => {
  if(!cvG || cvG.scr !== "q" || !document.body || document.body.dataset.route !== "coverage") return;
  if(!/^[1-4]$/.test(e.key) || e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "")) return;
  if(document.querySelector("#tour-pop:not([hidden]), .tk-bg:not([hidden])")) return;
  e.preventDefault(); cvPick(+e.key - 1);
});
function bindCoverage(){
  view.onclick = e => {
    const b = e.target.closest("button"); if(!b || !view.contains(b)) return;
    const d = b.dataset;
    if(d.cvpick !== undefined) return cvPick(+d.cvpick);
    if(d.cvg) return cvGo(d.cvg);
    if(d.cvtab){ cvTab = d.cvtab; cvRefresh(true); const t = view.querySelector(`[data-cvtab="${d.cvtab}"]`); if(t) t.focus(); return; }
    if(d.cva){
      const row = cv.r[d.cva] = Object.assign({}, cv.r[d.cva]); row[d.cvl] = +d.cvn; cv.ex = false; cvSave();
      if(cvMode() !== "table"){ cvRefresh(true); const again = view.querySelector(`[data-cva="${d.cva}"][data-cvl="${d.cvl}"][data-cvn="${d.cvn}"]`); if(again) again.focus({preventScroll:true}); return; }
      b.parentNode.querySelectorAll("button").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
      const x = cvRows(cv).find(r => r.a.k === d.cva), cell = document.querySelector(`#cv-row-${d.cva} .cv-mv`);
      if(cell && x){ cell.className = "cv-mv " + x.status; cell.innerHTML = `<b class="mono">${x.cov}%</b><span class="cv-mb"><i style="width:${x.cov}%"></i>${x.riskPct !== null ? `<em style="left:${x.riskPct}%" title="Risk ${x.riskPct}%"></em>` : ""}</span>`; }
      return cvRefresh(false);
    }
    if(d.cvoff){
      if(b.getAttribute("aria-disabled") === "true") return gsay("Keep at least three harm areas so the radar can compare them");
      const x = cvRows(cv).find(r => r.a.k === d.cvoff);
      if(x && x.score >= 8){ cvConfirm = d.cvoff; cvRefresh(true); const ok = document.querySelector(`[data-cvoffok="${d.cvoff}"]`); if(ok) ok.focus(); return; }
      return cvOffDo(d.cvoff);
    }
    if(d.cvoffok) return cvOffDo(d.cvoffok);
    if(d.cvoffno){ cvConfirm = null; cvRefresh(true); const t = document.querySelector(`[data-cvoff="${d.cvoffno}"]`); if(t) t.focus(); return; }
    if(d.cvon) return cvOffDo(d.cvon, true);
    if(d.cvgo){ const el = document.getElementById("cv-p3"); if(el && el.scrollIntoView) el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"}); return; }
    if(d.ov === "new") return newAssessment();
    switch(d.cv){
      case "example": cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); cvG = null; cvView = null; cvTab = "gaps"; store.set("ws:cur:coverage", null); cvSave(); renderCoverage(); window.scrollTo(0, 0); return;
      case "clear": case "reset": cv = {src:cv.ex ? null : cv.src, ex:false, r:{}}; cvG = null; cvView = null; cvTab = "gaps"; store.set("ws:cur:coverage", null); cvSave(); renderCoverage(); window.scrollTo(0, 0); return;
      case "download": { const md = cvMarkdown(cv); return offerFile(`ts-coverage-radar-${new Date().toISOString().slice(0, 10)}.md`, md, md, $("#cv-toast")); }
      case "tasks": return tkOpen("coverage");
      case "fillma": { const n = cvFillFromMaturity(); cvG = null; cvView = "table"; renderCoverage(true); window.scrollTo(0, 0); return flashIn($("#cv-toast"), `Filled ${n} answers from your maturity ratings. Adjust any that differ, then confirm`); }
      case "confirm": { cv.est = false; cvView = null; cvG = null; cvSave(); renderCoverage(true); window.scrollTo(0, 0); focusQuiet(view.querySelector("h1")); return flashIn($("#cv-toast"), "Coverage confirmed"); }
      case "save": { const msg = wsSaveTool("coverage", cv, cvTitle(cv)); renderCoverage(true); return flashIn($("#cv-toast"), msg); }
    }
  };
  view.onchange = e => {
    const t = e.target;
    if(t.dataset && t.dataset.cvapply){ const k = t.dataset.cvapply;
      if(!cvSetOff(k, !t.checked)){ t.checked = true; return gsay("Keep at least three harm areas so the radar can compare them"); }
      renderCoverage(true); const again = view.querySelector(`[data-cvapply="${k}"]`); if(again) again.focus(); return; }
    if(t.id === "cv-src"){ cv.src = t.value || null; cvSave(); cvRefresh(true); const s = document.getElementById("cv-src"); if(s) s.focus(); }
  };
  view.onkeydown = e => {
    const g = e.target.closest && e.target.closest(".cv-seg"); if(!g || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault(); const bs = [...g.querySelectorAll("button")], cur = bs.indexOf(e.target), nx = bs[Math.max(0, Math.min(bs.length - 1, cur + (e.key === "ArrowRight" ? 1 : -1)))];
    if(nx){ nx.click(); nx.focus(); }
  };
  view.querySelectorAll(".gl").forEach(g => g.onclick = () => g.focus());
}
