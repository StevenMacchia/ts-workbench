/* =========================================================
   PROGRAM MATURITY: rate eight areas, see the profile, get a roadmap
   ========================================================= */
let ma = store.get("ma", null) || {stage:"growth", lv:{}, done:{}, ex:false, open:"policy"};
if(!ma.done) ma.done = {};
const MA_STEPS = [["Set your stage", "Targets depend on your size and how regulated you are."], ["Rate each area", "Pick the level that matches your program today, one area at a time."], ["Get your roadmap", "Close the gaps in order, with the tool that helps for each one."]];
const maSave = () => store.set("ma", ma);
const maStage = d => MA_STAGES.find(s => s.k === (d || ma).stage) || MA_STAGES[1];
const maArea = k => MA_AREAS.find(a => a.k === k);
function maScore(d){
  const r = MA_AREAS.filter(a => d.lv[a.k]);
  return r.length ? Math.round(r.reduce((s, a) => s + d.lv[a.k], 0) / r.length * 10) / 10 : null;
}
const maLevelName = x => MA_LEVELS[Math.max(0, Math.min(4, Math.floor(x + 1e-9) - 1))].n;
function maGaps(d){
  const t = maStage(d).t;
  return MA_AREAS.filter(a => d.lv[a.k] && d.lv[a.k] < t[a.k]).map(a => ({a, cur:d.lv[a.k], tgt:t[a.k], gap:t[a.k] - d.lv[a.k]}))
    .sort((x, y) => y.gap - x.gap || MA_ORDER.indexOf(x.a.k) - MA_ORDER.indexOf(y.a.k));
}
// One level at a time: every gap's first step comes before any second step, then the list is split into phases
function maRoadmap(d){
  const gaps = maGaps(d), steps = [];
  gaps.forEach((g, gi) => { for(let j = 0; j < g.gap; j++) steps.push({a:g.a, from:g.cur + j, to:g.cur + j + 1, j, gi}); });
  steps.sort((x, y) => x.j - y.j || x.gi - y.gi);
  steps.forEach((s, i) => { s.phase = i < 3 ? "now" : i < 6 ? "next" : "later"; s.acts = s.a.next[s.from - 1]; });
  return steps;
}

function maRadar(d, big){
  const W = 400, H = big ? 330 : 300, cx = W / 2, cy = H / 2, R = big ? 104 : 96, n = MA_AREAS.length, t = maStage(d).t;
  const pt = (i, v) => { const ang = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(ang) * R * v / 5, cy + Math.sin(ang) * R * v / 5]; };
  const poly = vals => vals.map((v, i) => pt(i, v).map(x => x.toFixed(1)).join(",")).join(" ");
  const rated = MA_AREAS.filter(a => d.lv[a.k]).length;
  const rings = [1, 2, 3, 4, 5].map(l => `<polygon points="${poly(MA_AREAS.map(() => l))}" fill="${l === 5 ? "var(--sunk)" : "none"}" fill-opacity="${l === 5 ? .5 : 0}" stroke="var(--line${l === 5 ? "-strong" : ""})" stroke-width="1"/>`).join("");
  const axes = MA_AREAS.map((a, i) => { const [x, y] = pt(i, 5); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1"/>`; }).join("");
  const labels = MA_AREAS.map((a, i) => {
    const [x, y] = pt(i, 5 + (big ? 1.25 : 1.1)), c = Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n), anchor = c > .3 ? "start" : c < -.3 ? "end" : "middle";
    const lv = d.lv[a.k], below = lv && lv < t[a.k];
    return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" class="ma-rl">${esc(a.s)}${big && lv ? `<tspan class="ma-rv ${below ? "gap" : ""}" dx="5">${lv}</tspan>` : ""}</text>`;
  }).join("");
  const tgt = `<polygon points="${poly(MA_AREAS.map(a => t[a.k]))}" fill="none" stroke="var(--ink)" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  const cur = rated ? `<polygon class="ma-cur" points="${poly(MA_AREAS.map(a => d.lv[a.k] || 0))}" fill="var(--t-ma)" fill-opacity=".2" stroke="var(--t-ma)" stroke-width="2" stroke-linejoin="round"/>` : "";
  const dots = MA_AREAS.map((a, i) => { const lv = d.lv[a.k]; if(!lv) return ""; const [x, y] = pt(i, lv);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big ? 4.5 : 4}" fill="${lv < t[a.k] ? "var(--crit)" : "var(--t-ma)"}" stroke="var(--surface)" stroke-width="2"/>`; }).join("");
  const sc = maScore(d);
  const aria = rated ? `Maturity radar. ${MA_AREAS.filter(a => d.lv[a.k]).map(a => `${a.n} level ${d.lv[a.k]} of 5, target ${t[a.k]}`).join(". ")}.` : "Maturity radar, nothing rated yet.";
  return `<svg class="ma-radar ${big ? "big" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">${rings}${axes}${tgt}${cur}${dots}${labels}
    ${!rated ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" class="ma-rl">Rate an area to start</text>` : big && sc !== null ? "" : ""}</svg>`;
}
function maLegend(d){
  return `<div class="ma-legend"><span><i class="ma-lg-cur"></i>Your level</span><span><i class="ma-lg-tgt"></i>Target for ${esc(maStage(d).n.toLowerCase())}</span><span><i class="ma-lg-gap"></i>Below target</span></div>`;
}
// Where the overall score sits on the five-level scale, with the stage target marked
function maScaleHTML(){
  const sc = maScore(ma); if(sc === null) return "";
  const t = maStage().t, tg = MA_AREAS.reduce((s, a) => s + t[a.k], 0) / MA_AREAS.length, pos = v => ((v - 1) / 4 * 100).toFixed(1);
  return `<div class="ma-scale" role="img" aria-label="Overall level ${sc.toFixed(1)} of 5, target about ${tg.toFixed(1)}">
    <div class="ma-scale-bar">${MA_LEVELS.map((l, j) => `<i class="${j + 1 <= Math.floor(sc + 1e-9) ? "on" : ""}"></i>`).join("")}
      <span class="ma-scale-tg" style="left:${pos(tg)}%" title="Target"></span><span class="ma-scale-you" style="left:${pos(sc)}%"><b>${sc.toFixed(1)}</b></span></div>
    <div class="ma-scale-l">${MA_LEVELS.map((l, j) => `<span class="${j + 1 === Math.floor(sc + 1e-9) ? "cur" : ""}">${l.n}</span>`).join("")}</div>
    <p class="note">The dashed line marks the average target for ${esc(maStage().n.toLowerCase())} programs.</p></div>`;
}
function maNextHTML(){
  const s = maRoadmap(ma)[0]; if(!s) return "";
  return `<div class="ma-start"><span class="ma-start-k">Start here</span><b>${esc(s.a.n)} <span class="ma-lvl">${s.from} → ${s.to}</span></b><span>${esc(s.acts[0])}</span>
    <button type="button" class="ma-tool ma-start-go" data-goresult="1">See the full roadmap<svg><use href="#i-arrow"/></svg></button></div>`;
}
function maRailHTML(){
  const sc = maScore(ma), rated = MA_AREAS.filter(a => ma.lv[a.k]).length, gaps = maGaps(ma);
  return `<div class="vd-rail-h"><h4>Your profile</h4><span class="note">Updates as you rate</span></div>
    <div class="ma-score">${sc !== null ? `<b class="mono">${sc.toFixed(1)}</b><span class="note">/ 5</span><span class="pill ma-pill">${maLevelName(sc)}</span>` : `<span class="note">Rate the first area to see your profile.</span>`}</div>
    ${maRadar(ma, false)}
    ${maLegend(ma)}
    ${maNextHTML()}
    <div class="ma-prog"><div class="ma-prog-t"><span>${rated} of ${MA_AREAS.length} areas rated</span>${rated ? `<span>${gaps.length ? `${gaps.length} below target` : "All on target"}</span>` : ""}</div><div class="vd-bar"><i style="width:${rated / MA_AREAS.length * 100}%"></i></div></div>`;
}

function maStagesHTML(){
  return `<div class="ma-stages" role="radiogroup" aria-label="Your stage">${MA_STAGES.map(s => `<button type="button" role="radio" aria-checked="${ma.stage === s.k}" class="card ma-stage ${ma.stage === s.k ? "on" : ""}" data-stage="${s.k}">
    <span class="ma-stage-h"><span class="ma-radio"></span><b>${s.n}</b></span><span class="ma-stage-d">${esc(s.d)}</span><span class="ma-stage-t">Target: ${esc(s.td)}</span></button>`).join("")}</div>
    <p class="note ma-why-t">Some basics never scale down. Crisis response, legal compliance and reviewer wellbeing matter as much to a small team, because the harm is the same whatever your size.</p>`;
}
function maAreasHTML(){
  const t = maStage().t, seen = new Set();
  return MA_AREAS.map((a, i) => {
    const lv = ma.lv[a.k], open = ma.open === a.k, below = lv && lv < t[a.k];
    const chip = lv ? `<span class="ma-chip ${below ? "gap" : "ok"}">Level ${lv} · ${MA_LEVELS[lv - 1].n}</span>` : `<span class="ma-chip none">Not rated</span>`;
    const headRow = `<button type="button" class="ma-row" data-open="${a.k}" aria-expanded="${open}" aria-controls="ma-b-${a.k}">
      <span class="ma-num ${lv ? (below ? "gap" : "ok") : ""}">${lv ? `<svg><use href="#i-check"/></svg>` : i + 1}</span>
      <span class="ma-rt"><b>${esc(a.n)}</b><small>${esc(a.q)}</small></span>${chip}<svg class="ma-chev"><use href="#i-chev"/></svg></button>`;
    if(!open) return `<div class="card ma-area">${headRow}</div>`;
    return `<div class="card ma-area open" id="ma-a-${a.k}">${headRow}
      <div class="ma-body" id="ma-b-${a.k}">
        <p class="ma-whyline">${mxGloss(a.why, seen)}</p>
        <p class="ma-hint">Pick the highest level where every statement is true today.</p>
        <div class="ma-opts" role="radiogroup" aria-label="${esc(a.n)} level">${a.lv.map((txt, j) => `<button type="button" role="radio" aria-checked="${lv === j + 1}" class="ma-opt ${lv === j + 1 ? "on" : ""}" data-k="${a.k}" data-n="${j + 1}">
          <span class="ma-on">${j + 1}</span><span class="ma-ot"><span class="ma-oh"><b>${MA_LEVELS[j].n}</b>${t[a.k] === j + 1 ? `<span class="ma-tg">Target</span>` : ""}</span><span>${mxGloss(txt, seen)}</span></span></button>`).join("")}</div>
        <div class="ma-foot">${a.tool ? `<a class="ma-tool" href="#${a.tool[0]}">${esc(a.tool[1])}<svg><use href="#i-arrow"/></svg></a>` : `<span></span>`}
          ${i < MA_AREAS.length - 1 ? `<button type="button" class="btn sm" data-open="${MA_AREAS[i + 1].k}">Next: ${esc(MA_AREAS[i + 1].n)}</button>` : `<button type="button" class="btn sm" data-goresult="1">See your roadmap</button>`}</div>
      </div></div>`;
  }).join("");
}
function maWhy(){
  const sc = maScore(ma), rated = MA_AREAS.filter(a => ma.lv[a.k]), gaps = maGaps(ma), t = maStage().t;
  if(!rated.length) return `<p>Rate at least one area to see where your program stands. It takes about five minutes for all eight.</p>`;
  const strong = rated.filter(a => ma.lv[a.k] >= t[a.k]).sort((x, y) => ma.lv[y.k] - ma.lv[x.k]).slice(0, 2);
  const list = xs => xs.map(a => `<b>${esc(a.s.toLowerCase())}</b>`).join(" and ");
  let h = `<p>Your program is at <b>level ${sc.toFixed(1)}</b> overall, which is <b>${maLevelName(sc).toLowerCase()}</b>${rated.length < MA_AREAS.length ? `, based on ${rated.length} of ${MA_AREAS.length} areas` : ""}.`;
  h += strong.length ? ` It's strongest in ${list(strong)}.</p>` : `</p>`;
  if(!gaps.length) h += `<p>Every rated area meets the target for ${esc(maStage().n.toLowerCase())} programs. To keep improving, work toward level 5 where your users face the most risk, or check the targets for the next stage.</p>`;
  else { const g = gaps[0];
    h += `<p>${gaps.length === 1 ? "One area is" : `${gaps.length} areas are`} below target. Start with <b>${esc(g.a.n.toLowerCase())}</b>, at level ${g.cur} against a target of ${g.tgt}: ${esc(g.a.next[g.cur - 1][0].charAt(0).toLowerCase() + g.a.next[g.cur - 1][0].slice(1))}.</p>`; }
  return h;
}
function maStandHTML(){
  const t = maStage().t;
  return `<div class="card ma-stand"><h4>Where you stand</h4>${MA_AREAS.map(a => { const lv = ma.lv[a.k] || 0, below = lv && lv < t[a.k];
    return `<div class="ma-sr" title="${esc(a.n)}"><span class="ma-sn">${esc(a.s)}</span>
      <span class="ma-cells" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= lv ? (below ? "f gap" : "f") : ""} ${n === t[a.k] ? "t" : ""}"></i>`).join("")}</span>
      <span class="ma-sv ${below ? "gap" : lv ? "ok" : ""}">${!lv ? "Not rated" : below ? `${lv} of ${t[a.k]}` : `${lv} ✓`}</span></div>`; }).join("")}
    <p class="note">Filled cells show your level. The outlined cell is the target for your stage.</p></div>`;
}
function maRoadmapHTML(){
  const steps = maRoadmap(ma), seen = new Set(), unrated = MA_AREAS.filter(a => !ma.lv[a.k]);
  const more = unrated.length ? `<div class="banner ma-more"><span>Rate the remaining ${unrated.length === 1 ? "area" : unrated.length + " areas"} (${unrated.map(a => esc(a.s.toLowerCase())).join(", ")}) to complete your roadmap.</span><button type="button" class="btn sm" data-open="${unrated[0].k}" data-scroll="1">Rate ${esc(unrated[0].n.toLowerCase())}</button></div>` : "";
  if(!steps.length) {
    const stretch = MA_AREAS.filter(a => ma.lv[a.k] && ma.lv[a.k] < 5).sort((x, y) => ma.lv[x.k] - ma.lv[y.k] || MA_ORDER.indexOf(x.k) - MA_ORDER.indexOf(y.k)).slice(0, 3);
    return more + (MA_AREAS.some(a => ma.lv[a.k]) ? `<div class="card ma-none"><b>No gaps against your targets.</b><p class="note">${stretch.length ? "Stretch goals, if you want to go further:" : "Every area is at the top level."}</p>
      ${stretch.length ? `<ul class="ma-acts">${stretch.map(a => `<li>${mxGloss(a.next[ma.lv[a.k] - 1][0], seen)} <span class="note">(${esc(a.n)})</span></li>`).join("")}</ul>` : ""}</div>` : "");
  }
  const card = s => { const id = `${s.a.k}${s.from}`, done = s.acts.filter((x, i) => ma.done[id + "-" + i]).length;
    return `<article class="card ma-step ${done === s.acts.length ? "done" : ""}">
      <div class="ma-step-h"><b>${esc(s.a.n)}</b><span class="ma-lvl">Level ${s.from} → ${s.to}</span></div>
      <span class="ma-step-to">Reach <b>${MA_LEVELS[s.to - 1].n.toLowerCase()}</b></span>
      <ul class="ma-check">${s.acts.map((x, i) => `<li><label><input type="checkbox" data-done="${id}-${i}" ${ma.done[id + "-" + i] ? "checked" : ""}><span>${mxGloss(x, seen)}</span></label></li>`).join("")}</ul>
      ${s.a.tool ? `<a class="ma-tool" href="#${s.a.tool[0]}">${esc(s.a.tool[1])}<svg><use href="#i-arrow"/></svg></a>` : ""}</article>`; };
  return more + `<div class="ma-road">${MA_PHASES.map(([k, n, when]) => { const xs = steps.filter(s => s.phase === k); if(!xs.length) return "";
    return `<section class="ma-phase ma-${k}"><div class="ma-ph"><b>${n}</b><span>${when}</span><span class="ma-phn mono">${xs.length}</span></div>${xs.map(card).join("")}</section>`; }).join("")}</div>
    <p class="note ma-order">Each area moves one level at a time. When two gaps are the same size, the roadmap starts where a gap can hurt people or the company fastest: crisis response, then compliance, then detection.</p>`;
}
function maResultHTML(){
  const any = MA_AREAS.some(a => ma.lv[a.k]);
  return `<div class="ma-res"><div class="card ma-sum"><div class="ma-sum-t">${maWhy()}</div>${maScaleHTML()}
      ${any ? `<div class="ma-sum-cta"><button type="button" class="btn sm" data-ma="download"><svg><use href="#i-download"/></svg>Download the roadmap</button><button type="button" class="btn sm primary" data-ma="save"><svg><use href="#i-save"/></svg>${wsSaveLabel("maturity")}</button></div>` : ""}</div>${maStandHTML()}</div>
    <div class="ma-rh"><h4>Your roadmap</h4>${maRoadmap(ma).length ? `<button type="button" class="btn sm" data-ma="tasks"><svg><use href="#i-send"/></svg>Send to tracker</button>` : ""}</div>${maRoadmapHTML()}`;
}
function maMarkdown(d){
  const t = maStage(d).t, sc = maScore(d), p = typeof wsProfile === "function" ? wsProfile() : null, steps = maRoadmap(d);
  const L = [`# Trust & Safety program maturity`, ``, `${p && p.org ? p.org + " · " : ""}${maStage(d).n} · ${new Date().toISOString().slice(0, 10)}`, ``];
  L.push(sc !== null ? `**Overall: level ${sc.toFixed(1)} of 5 (${maLevelName(sc)})**` : `Not rated yet.`, ``);
  L.push(`| Area | Level | Target | Status |`, `|---|---|---|---|`);
  MA_AREAS.forEach(a => { const lv = d.lv[a.k]; L.push(`| ${a.n} | ${lv ? lv + " · " + MA_LEVELS[lv - 1].n : "Not rated"} | ${t[a.k]} | ${!lv ? "" : lv < t[a.k] ? "Below target" : "On target"} |`); });
  L.push(``, `## Roadmap`, ``);
  if(!steps.length) L.push(`No gaps against the targets for this stage.`, ``);
  MA_PHASES.forEach(([k, n, when]) => { const xs = steps.filter(s => s.phase === k); if(!xs.length) return;
    L.push(`### ${n} (${when})`, ``);
    xs.forEach(s => { L.push(`**${s.a.n}: level ${s.from} → ${s.to} (${MA_LEVELS[s.to - 1].n})**`); s.acts.forEach((x, i) => L.push(`- [${d.done && d.done[s.a.k + s.from + "-" + i] ? "x" : " "}] ${x}`)); L.push(``); }); });
  L.push(`## What each level means`, ``);
  MA_AREAS.forEach(a => { L.push(`### ${a.n}`, ``, `_${a.q}_`, ``); a.lv.forEach((x, j) => L.push(`${j + 1}. **${MA_LEVELS[j].n}.** ${x}`)); L.push(``); });
  L.push(`---`, `Made with T&S Workbench. A self-assessment to guide planning, not an audit.`);
  return L.join("\n");
}
const maTitle = d => `Program maturity: ${maStage(d).n.toLowerCase()}, level ${(maScore(d) || 0).toFixed(1)}`;

function maHeadMeta(){
  const any = MA_AREAS.some(a => ma.lv[a.k]);
  return `<span class="toast" id="ma-toast" aria-live="polite"></span>
      ${ma.ex ? `<button class="btn sm" data-ma="clear">Clear example</button>` : any ? `<button class="btn sm" data-ma="reset">Start over</button>` : `<button class="btn sm" data-ma="example">See an example</button>`}
      ${any ? `<button class="btn sm" data-ma="download"><svg><use href="#i-download"/></svg>Download</button>
      <button class="btn sm primary" data-ma="save"><svg><use href="#i-save"/></svg>${wsSaveLabel("maturity")}</button>` : ""}`;
}
function renderMaturity(){
  const step = n => `<div class="mxa-ph"><span class="mxa-pnum">${n}</span><div><h3>${MA_STEPS[n - 1][0]}</h3><p>${MA_STEPS[n - 1][1]}</p></div></div>`;
  view.innerHTML = head("Program Maturity",
    "Rate your trust and safety program across eight areas, see where it stands against the targets for your stage, and get a roadmap that tackles the biggest gaps first.",
    "Run the program", maHeadMeta()) + `
    <p class="mxa-q ma-q">How mature is your trust and safety program, and what should you fix first?</p>
    <div class="mxm-how"><ol class="mxm-how-s">${MA_STEPS.map((s, j) => `<li><b>${j + 1}</b><span><em>${s[0]}.</em> ${s[1]}</span></li>`).join("")}</ol></div>
    ${ma.ex ? `<div class="banner ma-exb"><span><strong>This is an example:</strong> a growing marketplace preparing to expand into the EU. Clear it to rate your own program.</span><button type="button" class="btn sm" data-ma="clear">Clear example</button></div>` : ""}
    <div class="vd-grid ma-grid">
      <div class="vd-main">
        <section class="mxa-part">${step(1)}<div id="ma-stages">${maStagesHTML()}</div></section>
        <section class="mxa-part">${step(2)}<div class="ma-areas" id="ma-areas">${maAreasHTML()}</div></section>
        <section class="mxa-part" id="ma-p3">${step(3)}<div id="ma-result">${maResultHTML()}</div></section>
      </div>
      <aside class="vd-rail"><div class="card vd-railc" id="ma-rail">${maRailHTML()}</div></aside>
    </div>
    <p class="note" style="margin-top:18px">A self-assessment to guide planning, not an audit or legal advice. Levels are adapted from common capability maturity models.</p>`;
  bindMaturity();
}
function maRefresh(parts){
  const set = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  if(parts.includes("stages")) set("ma-stages", maStagesHTML());
  if(parts.includes("areas")) set("ma-areas", maAreasHTML());
  set("ma-rail", maRailHTML()); set("ma-result", maResultHTML());
  const hm = view.querySelector(".pagehead .headmeta"); if(hm) hm.innerHTML = maHeadMeta();
  bindMaturity(true);
}
function maScrollTo(el){ if(el && el.scrollIntoView) el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"}); }
function bindMaturity(partial){
  const root = view;
  if(!partial){
    root.onclick = e => {
      const b = e.target.closest("button"); if(!b || !root.contains(b)) return;
      const d = b.dataset;
      if(d.stage){ ma.stage = d.stage; maSave(); return maRefresh(["stages", "areas"]); }
      if(d.open){ ma.open = ma.open === d.open && !d.scroll ? null : d.open; maSave(); maRefresh(["areas"]);
        const el = document.getElementById("ma-a-" + d.open); if(el) maScrollTo(el); return; }
      if(d.goresult){ ma.open = null; maSave(); maRefresh(["areas"]); return maScrollTo(document.getElementById("ma-p3")); }
      if(d.k && d.n){
        const first = !ma.lv[d.k]; ma.lv[d.k] = +d.n; ma.ex = false; maSave();
        b.parentNode.querySelectorAll(".ma-opt").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
        const hd = document.querySelector(`[data-open="${d.k}"].ma-row`);
        if(!first){ maRefresh(["areas"]); const nb = document.querySelector(`.ma-opt[data-k="${d.k}"][data-n="${d.n}"]`); if(nb) nb.focus(); return; }
        // First rating of an area: show the choice for a moment, then move on to the next unrated area
        const i = MA_AREAS.findIndex(a => a.k === d.k), order = MA_AREAS.slice(i + 1).concat(MA_AREAS.slice(0, i)), nx = order.find(a => !ma.lv[a.k]);
        maRefresh([]);
        setTimeout(() => { ma.open = nx ? nx.k : null; maSave(); maRefresh(["areas"]);
          if(nx){ const el = document.getElementById("ma-a-" + nx.k); maScrollTo(el); const f = el && el.querySelector(".ma-opt"); if(f) f.focus({preventScroll:true}); }
          else maScrollTo(document.getElementById("ma-p3")); }, 260);
        return;
      }
      switch(d.ma){
        case "example": ma = JSON.parse(JSON.stringify(MA_EXAMPLE)); store.set("ws:cur:maturity", null); maSave(); return renderMaturity();
        case "clear": case "reset": ma = {stage:ma.stage, lv:{}, done:{}, ex:false, open:"policy"}; store.set("ws:cur:maturity", null); maSave(); return renderMaturity();
        case "download": { const md = maMarkdown(ma); return offerFile(`ts-program-maturity-${new Date().toISOString().slice(0, 10)}.md`, md, md, $("#ma-toast")); }
        case "tasks": return tkOpen("maturity");
        case "save": { const msg = wsSaveTool("maturity", ma, maTitle(ma)); renderMaturity(); return flashIn($("#ma-toast"), msg); }
      }
    };
    root.onchange = e => { const t = e.target; if(t.dataset && t.dataset.done){ ma.done[t.dataset.done] = t.checked; maSave();
      const card = t.closest(".ma-step"); if(card) card.classList.toggle("done", [...card.querySelectorAll("input[type=checkbox]")].every(x => x.checked)); } };
    root.onkeydown = e => {
      const g = e.target.closest && e.target.closest(".ma-opts, .ma-stages"); if(!g || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault(); const bs = [...g.querySelectorAll("[role=radio]")], cur = bs.indexOf(e.target), nx = bs[Math.max(0, Math.min(bs.length - 1, cur + (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1)))];
      if(nx) nx.focus();
    };
  }
  root.querySelectorAll(".gl").forEach(g => g.onclick = () => g.focus());
}
