/* =========================================================
   OVERVIEW: your safety picture in three radars
   Program maturity · all products combined · one product at a time
   ========================================================= */
const OV_LAYER = ["var(--t-tt)", "var(--t-mx)", "var(--t-vd)", "var(--t-ma)", "var(--t-pol)", "var(--high)"];
// Saved pre-mortems with their assessment, newest first
function ovSavedPMs(){
  return Object.values(wsItems()).filter(it => it.kind === "premortem" && it.data).sort((a, b) => (b.updated || 0) - (a.updated || 0))
    .map(it => { const r = assess(openRecord(it.data)); return {it, r, g:pmGroupData(r), name:it.title || it.data.name || "Untitled assessment"}; });
}
// Small radar for lists: just the shape
function miniRiskRadar(r){
  const g = pmGroupData(r), n = g.length, c = 28, R = 24, f = v => v.toFixed(1), pt = (i, v) => { const a = (-90 + i * 360 / n) * Math.PI / 180; return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v]; };
  const ring = v => g.map((d, i) => pt(i, v).map(f).join(",")).join(" "), worst = g.reduce((m, d) => d.score > m.score ? d : m, {score:0, band:null});
  const col = worst.band ? `var(--${worst.band === "low" ? "muted" : worst.band})` : "var(--faint)";
  return `<svg class="mini-radar" viewBox="0 0 56 56" aria-hidden="true"><polygon points="${ring(1)}" fill="var(--sunk)" stroke="var(--line-strong)"/><polygon points="${ring(.5)}" fill="none" stroke="var(--line)"/>
    <polygon points="${g.map((d, i) => pt(i, d.score / 16).map(f).join(",")).join(" ")}" fill="${col}" fill-opacity=".25" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

function ovMaturityState(){
  if(typeof MA_AREAS === "undefined") return {state:"none"};
  const rated = MA_AREAS.filter(a => ma.lv[a.k]).length;
  return {state:!rated || ma.ex ? "empty" : rated < MA_AREAS.length ? "partial" : "done", rated};
}
function ovPicStatus(){
  const m = ovMaturityState(), pms = Object.values(wsItems()).filter(it => it.kind === "premortem").length;
  const done = (m.state === "done" ? 1 : 0) + (pms ? 2 : 0);
  const next = m.state !== "done" ? (m.state === "partial" ? "finish rating your program's maturity" : "rate your program's maturity") : !pms ? "run a pre-mortem on your first product" : "";
  return {done, next, pms, m};
}
function ovInvite(icon, color, title, text, actions){
  return `<div class="ov-inv"><span class="sb-glyph" style="background:${color}"><svg><use href="#i-${icon}"/></svg></span><b>${title}</b><p>${text}</p><div class="ov-inv-a">${actions}</div></div>`;
}
function ovPictureHTML(){
  const st = ovPicStatus(), pms = ovSavedPMs(), m = st.m;
  // 1. Program maturity
  let maCard = "";
  if(m.state !== "none"){
    const sc = m.state === "empty" ? null : maScore(ma), gaps = m.state === "empty" ? [] : maGaps(ma);
    const ghost = m.state === "empty" ? maRadar({stage:ma.stage, lv:{}}, false).replace('<text x="200" y="154" text-anchor="middle" class="ma-rl">Rate an area to start</text>', "") : maRadar(ma, false);
    maCard = `<article class="card ov-pc ${m.state === "empty" ? "ov-pc-empty" : ""}" style="--c:var(--t-ma)">
      <header class="ov-pc-h"><span class="sb-glyph" style="background:var(--t-ma)"><svg><use href="#i-steps"/></svg></span><div><b>Program maturity</b><small>How strong your program is, in 8 areas</small></div>
        ${sc !== null ? `<span class="ov-pc-k"><b class="mono">${sc.toFixed(1)}</b><small>${maLevelName(sc)}</small></span>` : ""}</header>
      <div class="ov-pc-r">${ghost}</div>
      ${m.state === "empty" ? ovInvite("steps", "var(--t-ma)", "How mature is your program?", "Rate eight areas, from policy to reviewer wellbeing, in about five minutes. You'll get a roadmap for the biggest gaps.",
          `<a class="btn sm primary" href="#maturity" data-ov-ma="start">Start the assessment</a><a class="btn sm" href="#maturity" data-ov-ma="example">See an example</a>`)
        : `<div class="ov-legend"><span><i class="ov-lg-fill" style="--c:var(--t-ma)"></i>Now</span><span><i class="ov-lg-tgt"></i>Target for ${esc(maStage().n.toLowerCase())}</span><span><i class="ov-lg-dot"></i>Below target</span></div>`}
      ${m.state === "empty" ? "" : `<footer class="ov-pc-f"><span>${m.state === "partial" ? `${m.rated} of ${MA_AREAS.length} areas rated` : gaps.length ? `${gaps.length} area${gaps.length === 1 ? "" : "s"} below target · start with ${esc(gaps[0].a.s.toLowerCase())}` : "Every area meets its target"}</span>
        <a class="btn sm" href="#maturity">${m.state === "partial" ? "Continue rating" : "Open roadmap"}</a></footer>`}
    </article>`;
  }
  // 2. All products combined: the worst score in each group across every saved pre-mortem
  const comb = RADAR_GROUPS.map((g, i) => pms.reduce((b, p) => p.g[i].score > b.score ? Object.assign({from:p.name}, p.g[i]) : b, {score:0, band:null, worst:"", n:0, from:""}));
  const crit = pms.reduce((s, p) => s + p.r.counts.crit, 0), top = comb.map((d, i) => ({d, g:RADAR_GROUPS[i]})).filter(x => x.d.score).sort((a, b) => b.d.score - a.d.score)[0];
  const emptyPM = !pms.length;
  const ghostPM = riskRadarSVG([{g:RADAR_GROUPS.map(() => ({score:0, band:null})), color:"var(--faint)", fill:true}], "Empty risk radar");
  const allCard = `<article class="card ov-pc ${emptyPM ? "ov-pc-empty" : ""}" style="--c:var(--t-pm)">
    <header class="ov-pc-h"><span class="sb-glyph" style="background:var(--t-pm)"><svg><use href="#i-layers"/></svg></span><div><b>All products</b><small>${emptyPM ? "Combined abuse risk across your products" : `Combined risk across ${pms.length} pre-mortem${pms.length === 1 ? "" : "s"}`}</small></div>
      ${emptyPM ? "" : `<span class="ov-pc-k"><b class="mono" style="${crit ? "color:var(--crit)" : ""}">${crit}</b><small>critical risk${crit === 1 ? "" : "s"}</small></span>`}</header>
    <div class="ov-pc-r">${emptyPM ? ghostPM : riskRadarSVG([...pms.slice(0, OV_LAYER.length).map((p, i) => ({g:p.g, color:OV_LAYER[i], dash:"3 3"})), {g:comb, color:"var(--t-pm)", fill:true}], `Combined risk radar across ${pms.length} products. Highest: ${top ? top.g.n : "none"}.`)}</div>
    ${emptyPM ? ovInvite("radar", "var(--t-pm)", "How could your products be misused?", "Run a pre-mortem on each product or feature. Their risks combine here, so you can see where your whole portfolio is exposed.",
        `<button type="button" class="btn sm primary" data-ov="new">Start a pre-mortem</button><a class="btn sm" href="#premortem">Explore an example</a>`)
      : `<div class="ov-legend"><span><i class="ov-lg-fill" style="--c:var(--t-pm)"></i>Combined</span>${pms.length > 1 ? pms.slice(0, 3).map((p, i) => `<span><i class="ov-lg-line" style="border-color:${OV_LAYER[i]}"></i>${esc(p.name)}</span>`).join("") + (pms.length > 3 ? `<span class="note">+${pms.length - 3} more</span>` : "") : ""}</div>
    <footer class="ov-pc-f"><span>${top ? `Highest: ${esc(top.g.n.toLowerCase())}${pms.length > 1 ? `, in ${esc(top.d.from)}` : ""}` : "No risks found"}${pms.length === 1 ? " · add another product to compare" : ""}</span><button type="button" class="btn sm" data-ov="new">Add a product</button></footer>`}
  </article>`;
  // 3. One product at a time
  const selId = store.get("ov:pm", null), sel = pms.find(p => p.it.id === selId) || pms[0];
  const oneCard = `<article class="card ov-pc ${sel ? "" : "ov-pc-empty"}" style="--c:var(--t-pm)" id="ov-one">
    <header class="ov-pc-h"><span class="sb-glyph" style="background:var(--t-pm)"><svg><use href="#i-radar"/></svg></span><div><b>By product</b>${sel && pms.length > 1 ? `<label class="ov-pick"><span class="visually-hidden">Choose a product</span><select class="select" id="ov-pm-sel">${pms.map(p => `<option value="${esc(p.it.id)}" ${p === sel ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label>` : `<small>${sel ? esc(sel.name) : "Each product gets its own radar"}</small>`}</div>
      ${sel ? `<span class="ov-pc-k"><span class="pill ${sel.r.posture[1]}">${sel.r.posture[0]}</span></span>` : ""}</header>
    <div class="ov-pc-r">${sel ? riskRadarSVG([{g:sel.g, color:"var(--t-pm)", fill:true}], `Risk radar for ${sel.name}`) : ghostPM}</div>
    ${sel ? `<div class="ov-legend">${["crit", "high", "med"].map(b => `<span><i class="ov-lg-dot" style="background:var(--${b})"></i>${BANDS[b][0]}</span>`).join("")}<span><i class="ov-lg-crit"></i>Critical line</span></div>`
      : ovInvite("radar", "var(--t-pm)", "One radar per product", "Save a pre-mortem for each product or launch, then flip between them here to compare how each could be misused.",
        `<button type="button" class="btn sm primary" data-ov="new">Start a pre-mortem</button>`)}
    ${sel ? `<footer class="ov-pc-f"><span>${sel.r.risks.length} risks · ${sel.r.counts.crit} critical · ${sel.r.obligations.filter(o => o.status === "applies").length} laws likely apply</span><button type="button" class="btn sm" data-open="${esc(sel.it.id)}">Open report</button></footer>` : ""}
  </article>`;
  const total = m.state === "none" ? 2 : 3, done = Math.min(total, st.done);
  return `<section class="rise ov-pic" aria-label="Your safety picture">
    <div class="ov-sec-h"><h3>Your safety picture</h3><span class="ov-pic-prog" aria-label="${done} of ${total} complete">${Array.from({length:total}, (x, i) => `<i class="${i < done ? "on" : ""}"></i>`).join("")}${done} of ${total} complete</span></div>
    <div class="ov-pics">${maCard}${allCard}${oneCard}</div>
  </section>`;
}
// Everything that adds to the picture, with where you are on each
function ovChecklistHTML(){
  const st = ovPicStatus(), m = st.m, prog = ttProgress(), type = ttCompanyType();
  const scen = SCENARIOS.map((s, i) => i).filter(i => type === "all" || (SCENARIOS[i].types || []).includes(type)), ttDone = scen.filter(i => prog[ttKey(i, type)]).length;
  const mxSet = typeof mx !== "undefined" && mx && mx.vals && Object.keys(mx.vals).length, vSaved = Object.values(wsItems()).some(it => it.kind === "vendors");
  const rows = [
    ["steps", "var(--t-ma)", "Rate your program's maturity", m.state === "done" ? `Level ${maScore(ma).toFixed(1)} · ${maLevelName(maScore(ma))}` : m.state === "partial" ? `${m.rated} of ${MA_AREAS.length} areas rated` : "Not started", m.state === "done", "maturity"],
    ["radar", "var(--t-pm)", "Run a pre-mortem on each product", st.pms ? `${st.pms} saved` : "None saved yet", st.pms > 0, "premortem"],
    ...(typeof cvSummary === "function" ? [(() => { const s = cvSummary(cv); return ["cover", "var(--t-cv)", "Map your defenses against risk", s.rated ? `${s.cov}% coverage${s.exposed.length ? ` · ${s.exposed.length} exposed` : ""}` : "Not started", s.rated >= s.total && !cv.ex, "coverage"]; })()] : []),
    ["siren", "var(--t-tt)", "Rehearse a crisis", `${ttDone} of ${scen.length} scenarios${type !== "all" ? " for your company type" : ""}`, ttDone > 0, "tabletop"],
    ["gauge", "var(--t-mx)", "Track your safety metrics", mxSet ? `Tracking ${Object.keys(mx.vals).length} metrics` : "Scorecard not set up", !!mxSet, "metrics/scorecard"],
    ["scale", "var(--t-vd)", "Score your moderation vendors", vSaved ? "Scorecard saved" : "Not started", vSaved, "vendors"]
  ].filter(r => r[5] !== "maturity" || m.state !== "none");
  const done = rows.filter(r => r[4]).length;
  return `<div><div class="ov-sec-h"><h3>Complete the picture</h3><span class="note">${done} of ${rows.length} done</span></div>
    <div class="ov-card ov-check">${rows.map(([ic, c, t, s, ok, h]) => `<a class="ov-ck ${ok ? "ok" : ""}" href="#${h}"><span class="ov-ck-i">${ok ? `<svg><use href="#i-check"/></svg>` : `<svg style="color:${c}"><use href="#i-${ic}"/></svg>`}</span>
      <span class="ov-ck-t"><b>${t}</b><small>${s}</small></span><svg class="ov-go"><use href="#i-arrow"/></svg></a>`).join("")}</div></div>`;
}
function bindOverviewPicture(){
  const sel = document.getElementById("ov-pm-sel");
  if(sel) sel.onchange = () => { store.set("ov:pm", sel.value); renderOverview(); const s = document.getElementById("ov-pm-sel"); if(s) s.focus(); };
  view.querySelectorAll("[data-ov-ma]").forEach(a => a.onclick = () => {
    if(a.dataset.ovMa === "example"){ ma = maExample(); store.set("ws:cur:maturity", null); }
    else if(ma.ex){ ma = maInit({stage:ma.stage, lv:{}, done:{}, ex:false, open:"policy"}); }
    store.set("ma", ma);
  });
}

/* ---------- Pre-mortem landing: the current assessment up front ---------- */
function pmCurrentHero(){
  if(!pm.type) return "";
  const r = assess(pm); if(!r.risks.length) return "";
  const laws = r.obligations.filter(o => o.status === "applies").length, bl = r.safeguards.filter(s => s.rank === 3), bd = bl.filter(s => pm.done[s.id]).length;
  const tone = r.posture[1] ? `var(--${r.posture[1]})` : "var(--faint)";
  return `<section class="ov-hero pm-cur" aria-label="Current assessment">
    <div class="ov-hl">
      <div class="ov-eb"><span class="sb-glyph" style="background:var(--t-pm)"><svg><use href="#i-radar"/></svg></span>${pm.example ? "Example assessment" : "Pick up where you left off"}${pm.updated ? (relTime(pm.updated) === "now" ? " · updated just now" : " · updated " + relTime(pm.updated) + " ago") : ""}</div>
      <h2>${esc(pm.name || "Untitled assessment")}</h2>
      <div class="ov-chips">
        <span class="ov-status" style="color:${tone};border-color:color-mix(in oklab, ${tone} 35%, transparent)"><span class="sdot" style="background:${tone}"></span>${r.posture[0]} exposure</span>
        ${pm.regions.length ? `<span class="ov-status">${pm.regions.map(k => k.toUpperCase()).join(" · ")}</span>` : ""}
        ${pm.youth ? `<span class="ov-status">${esc(labelOf(YOUTH, pm.youth))}</span>` : ""}
      </div>
      <div class="ov-stats">
        <div><b class="mono">${r.risks.length}</b><span>Risks identified</span></div>
        <div><b class="mono" style="${r.counts.crit ? "color:var(--crit)" : ""}">${r.counts.crit}</b><span>Critical</span></div>
        <div><b class="mono">${bd}/${bl.length}</b><span>Blockers done</span></div>
        <div><b class="mono">${laws}</b><span>Laws likely apply</span></div>
      </div>
      <div>${r.risks.slice(0, 3).map(x => `<div class="ov-risk"><span class="sdot" style="background:var(--${x.band === "low" ? "faint" : x.band})"></span>${esc(x.n)}<span class="mono">${x.score}/16</span></div>`).join("")}</div>
      <div class="row" style="gap:8px"><button type="button" class="btn primary" data-act="report">Open report ${icon("arrow")}</button><button type="button" class="btn" data-act="plan">Launch plan</button><button type="button" class="btn ghost" data-act="new">Start a new one</button></div>
    </div>
    <div class="ov-hr">${radarChart(r)}</div>
  </section>`;
}
