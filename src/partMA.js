/* =========================================================
   PROGRAM MATURITY: rate eight areas, then work the plan
   Rating sets a baseline. Ticking off the steps for the next level moves an area up,
   so the radar, score and roadmap always show where the program is now.
   ========================================================= */
let ma = store.get("ma", null) || {stage:"growth", lv:{}, done:{}, ex:false, open:"policy"};
const maInit = d => { ["done", "own", "due", "notes"].forEach(k => { if(!d[k] || typeof d[k] !== "object") d[k] = {}; }); if(!Array.isArray(d.hist)) d.hist = []; if(!d.tab) d.tab = "roadmap"; return d; };
maInit(ma);
const MA_STEPS = [["Set your stage", "Targets depend on your size and how regulated you are."], ["Rate each area", "Pick the level that matches your program today, one area at a time."], ["Work the plan", "Tick off steps as you finish them. Areas move up as you do."]];
const MA_TABS = [["roadmap", "Roadmap"], ["areas", "By area"], ["progress", "Progress"]];
const maSave = () => store.set("ma", ma);
const maStage = d => MA_STAGES.find(s => s.k === (d || ma).stage) || MA_STAGES[1];
const maArea = k => MA_AREAS.find(a => a.k === k);
const maDate = t => new Date(t).toLocaleDateString(undefined, {month:"short", day:"numeric", year:"numeric"});
// The example opens as a plan in progress: a few steps done, owners, due dates and last quarter's snapshot
function maExample(){
  const d = maInit(JSON.parse(JSON.stringify(MA_EXAMPLE))), day = 864e5, iso = n => new Date(Date.now() + n * day).toISOString().slice(0, 10);
  d.due = {crisis2:iso(30), compliance1:iso(21), detection2:iso(45), quality2:iso(75), measurement2:iso(90)};
  d.hist = [{t:Date.now() - 91 * day, stage:"growth", lv:{policy:2, detection:2, operations:2, quality:1, crisis:1, measurement:1, compliance:1, wellbeing:2}}];
  return d;
}

/* ---------- levels: the rated baseline plus finished steps ---------- */
const maStepDone = (d, k, from) => [0, 1].every(i => d.done && d.done[`${k}${from}-${i}`]);
function maLevelOf(d, k){
  let lv = d.lv[k] || 0; if(!lv) return 0;
  while(lv < 5 && maStepDone(d, k, lv)) lv++;
  return lv;
}
function maScore(d){
  const r = MA_AREAS.filter(a => d.lv[a.k]);
  return r.length ? Math.round(r.reduce((s, a) => s + maLevelOf(d, a.k), 0) / r.length * 10) / 10 : null;
}
const maLevelName = x => MA_LEVELS[Math.max(0, Math.min(4, Math.floor(x + 1e-9) - 1))].n;
const maAllRated = d => MA_AREAS.every(a => d.lv[a.k]);
function maGaps(d, baseline){
  const t = maStage(d).t, lv = k => baseline ? d.lv[k] : maLevelOf(d, k);
  return MA_AREAS.filter(a => d.lv[a.k] && lv(a.k) < t[a.k]).map(a => ({a, cur:lv(a.k), tgt:t[a.k], gap:t[a.k] - lv(a.k)}))
    .sort((x, y) => y.gap - x.gap || MA_ORDER.indexOf(x.a.k) - MA_ORDER.indexOf(y.a.k));
}
// Planned from the rated baseline so the plan stays put while you work it: every gap's first step before any second step
function maRoadmap(d){
  const gaps = maGaps(d, true), steps = [];
  gaps.forEach((g, gi) => { for(let j = 0; j < g.gap; j++) steps.push({a:g.a, from:g.cur + j, to:g.cur + j + 1, j, gi}); });
  steps.sort((x, y) => x.j - y.j || x.gi - y.gi);
  steps.forEach((s, i) => { s.phase = i < 3 ? "now" : i < 6 ? "next" : "later"; s.acts = s.a.next[s.from - 1]; s.id = s.a.k + s.from; s.done = maStepDone(d, s.a.k, s.from); });
  return steps;
}
// Progress through the plan
function maProgress(d){
  const steps = maRoadmap(d), items = steps.length * 2, done = steps.reduce((s, x) => s + x.acts.filter((a, i) => d.done[`${x.id}-${i}`]).length, 0);
  const gained = MA_AREAS.reduce((s, a) => s + Math.max(0, maLevelOf(d, a.k) - (d.lv[a.k] || 0)), 0);
  return {steps, items, done, gained, stepsDone:steps.filter(s => s.done).length};
}
// The next thing to do: the first unfinished step, and its first unticked item
function maNextItem(d){
  const s = maRoadmap(d).find(x => !x.done); if(!s) return null;
  const i = s.acts.findIndex((a, j) => !d.done[`${s.id}-${j}`]);
  return {s, text:s.acts[Math.max(0, i)]};
}

/* ---------- radar ---------- */
function maRadar(d, big, prev){
  const W = 400, H = big ? 330 : 300, cx = W / 2, cy = H / 2, R = big ? 104 : 96, n = MA_AREAS.length, t = maStage(d).t;
  const pt = (i, v) => { const ang = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(ang) * R * v / 5, cy + Math.sin(ang) * R * v / 5]; };
  const poly = vals => vals.map((v, i) => pt(i, v).map(x => x.toFixed(1)).join(",")).join(" ");
  const rated = MA_AREAS.filter(a => d.lv[a.k]).length, lv = k => maLevelOf(d, k);
  const rings = [1, 2, 3, 4, 5].map(l => `<polygon points="${poly(MA_AREAS.map(() => l))}" fill="${l === 5 ? "var(--sunk)" : "none"}" fill-opacity="${l === 5 ? .5 : 0}" stroke="var(--line${l === 5 ? "-strong" : ""})" stroke-width="1"/>`).join("");
  const axes = MA_AREAS.map((a, i) => { const [x, y] = pt(i, 5); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1"/>`; }).join("");
  const labels = MA_AREAS.map((a, i) => {
    const [x, y] = pt(i, 5 + (big ? 1.25 : 1.1)), c = Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n), anchor = c > .3 ? "start" : c < -.3 ? "end" : "middle";
    const v = lv(a.k), below = v && v < t[a.k];
    return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" class="ma-rl">${esc(a.s)}${big && v ? `<tspan class="ma-rv ${below ? "gap" : ""}" dx="5">${v}</tspan>` : ""}</text>`;
  }).join("");
  const tgt = `<polygon points="${poly(MA_AREAS.map(a => t[a.k]))}" fill="none" stroke="var(--ink)" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  const old = prev && rated ? `<polygon points="${poly(MA_AREAS.map(a => prev.lv[a.k] || 0))}" fill="none" stroke="var(--t-ma)" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="1.5 3.5" stroke-linecap="round"/>` : "";
  const cur = rated ? `<polygon class="ma-cur" points="${poly(MA_AREAS.map(a => lv(a.k)))}" fill="var(--t-ma)" fill-opacity=".2" stroke="var(--t-ma)" stroke-width="2" stroke-linejoin="round"/>` : "";
  const dots = MA_AREAS.map((a, i) => { const v = lv(a.k); if(!v) return ""; const [x, y] = pt(i, v);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big ? 4.5 : 4}" fill="${v < t[a.k] ? "var(--crit)" : "var(--t-ma)"}" stroke="var(--surface)" stroke-width="2"/>`; }).join("");
  const aria = rated ? `Maturity radar. ${MA_AREAS.filter(a => d.lv[a.k]).map(a => `${a.n} level ${lv(a.k)} of 5, target ${t[a.k]}`).join(". ")}.` : "Maturity radar, nothing rated yet.";
  return `<svg class="ma-radar ${big ? "big" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">${rings}${axes}${tgt}${old}${cur}${dots}${labels}
    ${!rated ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" class="ma-rl">Rate an area to start</text>` : ""}</svg>`;
}
function maLegend(d, prev){
  return `<div class="ma-legend"><span><i class="ma-lg-cur"></i>Now</span><span><i class="ma-lg-tgt"></i>Target for ${esc(maStage(d).n.toLowerCase())}</span>${prev ? `<span><i class="ma-lg-old"></i>${esc(maDate(prev.t))}</span>` : ""}<span><i class="ma-lg-gap"></i>Below target</span></div>`;
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
  const nx = maNextItem(ma); if(!nx) return "";
  return `<div class="ma-start"><span class="ma-start-k">Start here</span><b>${esc(nx.s.a.n)} <span class="ma-lvl">${nx.s.from} → ${nx.s.to}</span></b><span>${esc(nx.text)}</span>
    <button type="button" class="ma-tool ma-start-go" data-goresult="1">${maAllRated(ma) ? "Open your plan" : "See the full roadmap"}<svg><use href="#i-arrow"/></svg></button></div>`;
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

/* ---------- rating flow ---------- */
function maStagesHTML(){
  return `<div class="ma-stages" role="radiogroup" aria-label="Your stage">${MA_STAGES.map(s => `<button type="button" role="radio" aria-checked="${ma.stage === s.k}" class="card ma-stage ${ma.stage === s.k ? "on" : ""}" data-stage="${s.k}">
    <span class="ma-stage-h"><span class="ma-radio"></span><b>${s.n}</b></span><span class="ma-stage-d">${esc(s.d)}</span><span class="ma-stage-t">Target: ${esc(s.td)}</span></button>`).join("")}</div>
    ${typeof orgFromTag === "function" ? orgFromTag(!ma.stageSet && !!orgGet().stage && orgGet().stage === ma.stage) : ""}
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
          ${i < MA_AREAS.length - 1 ? `<button type="button" class="btn sm" data-open="${MA_AREAS[i + 1].k}">Next: ${esc(MA_AREAS[i + 1].n)}</button>` : `<button type="button" class="btn sm" data-goresult="1">${maAllRated(ma) ? "Open your plan" : "See your roadmap"}</button>`}</div>
      </div></div>`;
  }).join("");
}
function maWhy(){
  const sc = maScore(ma), rated = MA_AREAS.filter(a => ma.lv[a.k]), gaps = maGaps(ma), t = maStage().t, nx = maNextItem(ma);
  if(!rated.length) return `<p>Rate at least one area to see where your program stands. It takes about five minutes for all eight.</p>`;
  const lv = k => maLevelOf(ma, k), strong = rated.filter(a => lv(a.k) >= t[a.k]).sort((x, y) => lv(y.k) - lv(x.k)).slice(0, 2);
  const list = xs => xs.map(a => `<b>${esc(a.s.toLowerCase())}</b>`).join(" and ");
  let h = `<p>Your program is at <b>level ${sc.toFixed(1)}</b> overall, which is <b>${maLevelName(sc).toLowerCase()}</b>${rated.length < MA_AREAS.length ? `, based on ${rated.length} of ${MA_AREAS.length} areas` : ""}.`;
  h += strong.length ? ` It's strongest in ${list(strong)}.</p>` : `</p>`;
  if(!gaps.length) h += `<p>Every rated area meets the target for ${esc(maStage().n.toLowerCase())} programs. To keep improving, work toward level 5 where your users face the most risk, or check the targets for the next stage.</p>`;
  else { const g = gaps[0], step = nx && nx.s.a.k === g.a.k ? nx.text : g.a.next[g.cur - 1][0];
    h += `<p>${gaps.length === 1 ? "One area is" : `${gaps.length} areas are`} below target. Start with <b>${esc(g.a.n.toLowerCase())}</b>, at level ${g.cur} against a target of ${g.tgt}: ${esc(step.charAt(0).toLowerCase() + step.slice(1))}.</p>`; }
  return h;
}
function maStandHTML(){
  const t = maStage().t;
  return `<div class="card ma-stand"><h4>Where you stand</h4>${MA_AREAS.map(a => { const lv = maLevelOf(ma, a.k), below = lv && lv < t[a.k];
    return `<div class="ma-sr" title="${esc(a.n)}"><span class="ma-sn">${esc(a.s)}</span>
      <span class="ma-cells" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= lv ? (below ? "f gap" : "f") : ""} ${n === t[a.k] ? "t" : ""}"></i>`).join("")}</span>
      <span class="ma-sv ${below ? "gap" : lv ? "ok" : ""}">${!lv ? "Not rated" : below ? `${lv} of ${t[a.k]}` : `${lv} ✓`}</span></div>`; }).join("")}
    <p class="note">Filled cells show your level. The outlined cell is the target for your stage.</p></div>`;
}

/* ---------- the plan: roadmap, by area, progress ---------- */
function maItemHTML(id, i, text, seen){
  return `<li><label><input type="checkbox" data-done="${id}-${i}" ${ma.done[`${id}-${i}`] ? "checked" : ""}><span>${mxGloss(text, seen)}</span></label></li>`;
}
function maRoadmapHTML(){
  const steps = maRoadmap(ma), seen = new Set(), unrated = MA_AREAS.filter(a => !ma.lv[a.k]);
  const more = unrated.length ? `<div class="banner ma-more"><span>Rate the remaining ${unrated.length === 1 ? "area" : unrated.length + " areas"} (${unrated.map(a => esc(a.s.toLowerCase())).join(", ")}) to complete your roadmap.</span><button type="button" class="btn sm" data-open="${unrated[0].k}" data-scroll="1">Rate ${esc(unrated[0].n.toLowerCase())}</button></div>` : "";
  if(!steps.length) {
    const stretch = MA_AREAS.filter(a => ma.lv[a.k] && maLevelOf(ma, a.k) < 5).sort((x, y) => maLevelOf(ma, x.k) - maLevelOf(ma, y.k) || MA_ORDER.indexOf(x.k) - MA_ORDER.indexOf(y.k)).slice(0, 3);
    return more + (MA_AREAS.some(a => ma.lv[a.k]) ? `<div class="card ma-none"><b>No gaps against your targets.</b><p class="note">${stretch.length ? "Stretch goals, if you want to go further. Find them under By area." : "Every area is at the top level."}</p>
      ${stretch.length ? `<ul class="ma-acts">${stretch.map(a => `<li>${mxGloss(a.next[maLevelOf(ma, a.k) - 1][0], seen)} <span class="note">(${esc(a.n)})</span></li>`).join("")}</ul>` : ""}</div>` : "");
  }
  const plan = maAllRated(ma);
  const card = s => `<article class="card ma-step ${s.done ? "done" : ""}">
      <div class="ma-step-h"><b>${esc(s.a.n)}</b><span class="ma-lvl">Level ${s.from} → ${s.to}</span></div>
      <span class="ma-step-to">${s.done ? `<span class="ma-reached"><svg><use href="#i-check"/></svg>Level ${s.to} reached</span>` : `Reach <b>${MA_LEVELS[s.to - 1].n.toLowerCase()}</b>`}</span>
      <ul class="ma-check">${s.acts.map((x, i) => maItemHTML(s.id, i, x, seen)).join("")}</ul>
      ${plan ? `<div class="ma-step-meta"><span class="ma-own" title="Area owner">${ma.own[s.a.k] ? esc(ma.own[s.a.k]) : `<button type="button" class="ma-link" data-matab="areas" data-masel="${s.a.k}">Add an owner</button>`}</span>
        <label class="ma-due"><span class="visually-hidden">Due date for ${esc(s.a.n)} level ${s.to}</span><input type="date" data-madue="${s.id}" value="${esc(ma.due[s.id] || "")}"></label></div>` : ""}
      ${s.a.tool ? `<a class="ma-tool" href="#${s.a.tool[0]}">${esc(s.a.tool[1])}<svg><use href="#i-arrow"/></svg></a>` : ""}</article>`;
  return more + `<div class="ma-road">${MA_PHASES.map(([k, n, when]) => { const xs = steps.filter(s => s.phase === k); if(!xs.length) return "";
    return `<section class="ma-phase ma-${k}"><div class="ma-ph"><b>${n}</b><span>${when}</span><span class="ma-phn mono">${xs.filter(s => s.done).length}/${xs.length}</span></div>${xs.map(card).join("")}</section>`; }).join("")}</div>
    <p class="note ma-order">Each area moves one level at a time. When two gaps are the same size, the roadmap starts where a gap can hurt people or the company fastest: crisis response, then compliance, then detection.</p>`;
}
// How an area lines up with the DTSP Safe Framework and Ofcom's codes, with the sources
function maFrameworkHTML(k){
  const f = MA_FW[k];
  return `<details class="ma-fw" ${store.get("ma:fw", false) ? "open" : ""}><summary><b>How this maps to recognized frameworks</b><span class="note">DTSP Safe Framework · Ofcom codes</span></summary>
    <div class="ma-fw-b">
      <div class="ma-fw-col"><span class="eyebrow">DTSP Safe Framework</span>${f.dtsp.length ? `<ul>${f.dtsp.map(([c, p]) => `<li><b>${esc(p)}</b><small>${esc(c)}</small></li>`).join("")}</ul>` : `<p class="note">No direct equivalent.</p>`}</div>
      <div class="ma-fw-col"><span class="eyebrow">Ofcom illegal content codes</span>${f.ofcom.length ? `<ul>${f.ofcom.map(([id, n]) => `<li><b>${esc(id)}</b><small>${esc(n)}</small></li>`).join("")}</ul>` : `<p class="note">No direct equivalent.</p>`}</div>
    </div>
    <p class="ma-fw-note">${esc(f.note)}</p>
    <p class="note ma-fw-src">Sources: <a href="${MA_FW_SRC.dtsp[1]}" target="_blank" rel="noopener">${esc(MA_FW_SRC.dtsp[0])}</a>; <a href="${MA_FW_SRC.illegal[1]}" target="_blank" rel="noopener">${esc(MA_FW_SRC.illegal[0])}</a>; <a href="${MA_FW_SRC.children[1]}" target="_blank" rel="noopener">${esc(MA_FW_SRC.children[0])}</a>. Mapping last reviewed ${MA_FW_REVIEWED}. A guide to where to look, not legal advice.</p>
  </details>`;
}
// Roadmap due dates as all-day calendar events (iCalendar), so they reach people outside the workbench
const maDueSteps = () => maRoadmap(ma).filter(s => !s.done && ma.due && ma.due[s.id]);
function maIcs(){
  const txt = s => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");
  const fold = line => { const out = []; let s = line; while(s.length > 73){ out.push(s.slice(0, 73)); s = " " + s.slice(73); } out.push(s); return out.join("\r\n"); };
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const day = iso => iso.replace(/-/g, "");
  const after = iso => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ""); };
  const events = maDueSteps().map(s => { const due = ma.due[s.id], open = s.acts.filter((a, i) => !ma.done[`${s.id}-${i}`]);
    const desc = [`Program maturity roadmap. ${s.a.n}: from level ${s.from} to level ${s.to}.`].concat(ma.own && ma.own[s.a.k] ? ["Owner: " + ma.own[s.a.k]] : [], ["Still to do:"], open.map(a => "- " + a), ["", "From T&S Workbench."]).join("\n");
    return ["BEGIN:VEVENT", `UID:${s.id}-${day(due)}@ts-workbench`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${day(due)}`, `DTEND;VALUE=DATE:${after(due)}`,
      "SUMMARY:" + txt(`${s.a.n}: reach level ${s.to} (${MA_LEVELS[s.to - 1].n})`), "DESCRIPTION:" + txt(desc), "END:VEVENT"].map(fold).join("\r\n"); });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//T&S Workbench//Program maturity//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"].concat(events, ["END:VCALENDAR"]).join("\r\n") + "\r\n";
}
function maAreaTabHTML(){
  const t = maStage().t, sel = maArea(ma.sel) || (maGaps(ma)[0] || {a:MA_AREAS[0]}).a, seen = new Set(), base = ma.lv[sel.k] || 1, now = maLevelOf(ma, sel.k);
  const list = MA_AREAS.map(a => { const v = maLevelOf(ma, a.k), below = v < t[a.k];
    return `<button type="button" class="ma-al ${a === sel ? "on" : ""}" data-masel="${a.k}" aria-pressed="${a === sel}"><span class="ma-al-d ${below ? "gap" : "ok"}"></span>
      <span class="ma-al-t"><b>${esc(a.n)}</b><small>${ma.own[a.k] ? esc(ma.own[a.k]) : "No owner yet"}</small></span><span class="ma-al-l mono">${v}<em>/${t[a.k]}</em></span></button>`; }).join("");
  const ladder = sel.lv.map((txt, j) => { const L = j + 1, st = L <= now ? (L === now ? "cur" : "done") : L === now + 1 ? "next" : "later";
    const items = L > base ? sel.next[L - 2] : null;
    return `<li class="ma-rung ${st}"><div class="ma-rh2"><span class="ma-on">${L}</span><b>${MA_LEVELS[j].n}</b>${t[sel.k] === L ? `<span class="ma-tg">Target</span>` : ""}
        ${L === now ? `<span class="ma-here">You're here</span>` : L <= base ? `<span class="note">Rated</span>` : L <= now ? `<span class="ma-here done">Reached</span>` : ""}</div>
      <p>${mxGloss(txt, seen)}</p>
      ${items ? `<div class="ma-need"><span class="note">To reach this level</span><ul class="ma-check">${items.map((x, i) => maItemHTML(sel.k + (L - 1), i, x, seen)).join("")}</ul></div>` : ""}</li>`; }).join("");
  return `<div class="ma-byarea">
    <div class="card ma-alist" role="group" aria-label="Areas">${list}</div>
    <div class="card ma-ad">
      <header class="ma-ad-h"><div><h4>${esc(sel.n)}</h4><p class="ma-ad-q">${esc(sel.q)}</p></div>
        <span class="ma-chip ${now < t[sel.k] ? "gap" : "ok"}">Level ${now} · ${MA_LEVELS[now - 1].n}</span></header>
      <p class="ma-whyline">${mxGloss(sel.why, seen)}</p>
      <div class="ma-ad-meta"><label class="field"><span>Owner</span><input class="input" data-maown="${sel.k}" value="${esc(ma.own[sel.k] || "")}" placeholder="Who is accountable, e.g. Head of Trust & Safety Operations"></label>
        ${sel.tool ? `<a class="ma-tool" href="#${sel.tool[0]}">${esc(sel.tool[1])}<svg><use href="#i-arrow"/></svg></a>` : ""}</div>
      <ol class="ma-ladder">${ladder}</ol>
      ${typeof MA_FW !== "undefined" && MA_FW[sel.k] ? maFrameworkHTML(sel.k) : ""}
      <label class="field ma-notes"><span>Evidence and notes</span><textarea class="input" rows="3" data-manote="${sel.k}" placeholder="What makes you say this level? Links to playbooks, dashboards or audits.">${esc(ma.notes[sel.k] || "")}</textarea></label>
    </div></div>`;
}
function maProgressTabHTML(){
  const hist = ma.hist.slice().sort((a, b) => a.t - b.t), sc = maScore(ma), last = hist[hist.length - 1];
  const pts = hist.map(h => ({t:h.t, s:maScore({lv:h.lv, stage:h.stage, done:{}}), lv:h.lv})).concat([{t:Date.now(), s:sc, lv:Object.fromEntries(MA_AREAS.map(a => [a.k, maLevelOf(ma, a.k)])), now:true}]);
  const W = 560, H = 150, px = i => pts.length === 1 ? W / 2 : 30 + i * (W - 60) / (pts.length - 1), py = v => H - 20 - (v - 1) / 4 * (H - 40);
  const chart = `<svg class="ma-trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Overall level over time: ${pts.map(p => `${p.now ? "now" : maDate(p.t)} ${p.s.toFixed(1)}`).join(", ")}">
    ${[1, 2, 3, 4, 5].map(v => `<line x1="20" x2="${W - 10}" y1="${py(v)}" y2="${py(v)}" stroke="var(--line)"/><text x="4" y="${py(v) + 4}" class="ma-rl">${v}</text>`).join("")}
    <polyline points="${pts.map((p, i) => `${px(i).toFixed(1)},${py(p.s).toFixed(1)}`).join(" ")}" fill="none" stroke="var(--t-ma)" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map((p, i) => `<circle cx="${px(i).toFixed(1)}" cy="${py(p.s).toFixed(1)}" r="5" fill="${p.now ? "var(--t-ma)" : "var(--surface)"}" stroke="var(--t-ma)" stroke-width="2"/><text x="${px(i).toFixed(1)}" y="${(py(p.s) - 11).toFixed(1)}" text-anchor="middle" class="ma-rv">${p.s.toFixed(1)}</text>`).join("")}</svg>`;
  const moved = last ? MA_AREAS.map(a => ({a, d:maLevelOf(ma, a.k) - (last.lv[a.k] || 0)})).filter(x => x.d) : [];
  return `<div class="ma-prog-tab">
    <div class="card ma-trendc"><div class="ma-trend-h"><div><h4>Overall level over time</h4><p class="note">${hist.length ? `Since ${esc(maDate(hist[0].t))}: ${(sc - pts[0].s >= 0 ? "+" : "") + (sc - pts[0].s).toFixed(1)}` : "Save a snapshot each quarter to show progress to leadership."}</p></div>
      <button type="button" class="btn sm primary" data-ma="snapshot"><svg><use href="#i-save"/></svg>Save a snapshot</button></div>${chart}
      ${last ? `<p class="ma-moved">${moved.length ? `Since ${esc(maDate(last.t))}: ${moved.map(x => `<span class="${x.d > 0 ? "up" : "dn"}">${esc(x.a.s)} ${x.d > 0 ? "+" : ""}${x.d}</span>`).join("")}` : `No change since ${esc(maDate(last.t))}.`}</p>` : ""}</div>
    ${hist.length ? `<div class="card ma-snaps"><h4>Snapshots</h4>${hist.slice().reverse().map(h => { const s = maScore({lv:h.lv, stage:h.stage, done:{}});
      return `<div class="ma-snap"><span class="ma-snap-d">${esc(maDate(h.t))}</span><b class="mono">${s.toFixed(1)}</b>
        <span class="ma-snap-c" aria-hidden="true">${MA_AREAS.map(a => `<i title="${esc(a.n)}: ${h.lv[a.k] || 0}" style="height:${(h.lv[a.k] || 0) * 20}%"></i>`).join("")}</span>
        <button type="button" class="btn sm icon" data-masnapdel="${h.t}" aria-label="Delete snapshot from ${esc(maDate(h.t))}" title="Delete"><svg><use href="#i-trash"/></svg></button></div>`; }).join("")}</div>` : ""}
  </div>`;
}
function maPlanHTML(){
  const sc = maScore(ma), pr = maProgress(ma), gaps = maGaps(ma), hist = ma.hist.slice().sort((a, b) => a.t - b.t), prev = hist[hist.length - 1], nx = maNextItem(ma);
  const tabs = MA_TABS.map(([k, n]) => `<button type="button" role="tab" aria-selected="${ma.tab === k}" data-matab="${k}">${n}${k === "roadmap" ? ` <span class="mono">${pr.stepsDone}/${pr.steps.length}</span>` : k === "progress" && hist.length ? ` <span class="mono">${hist.length}</span>` : ""}</button>`).join("");
  return `<section class="card ma-band">
      <div class="ma-band-l">
        <span class="ma-band-k">Your maturity plan · ${esc(maStage().n)}</span>
        <div class="ma-score big"><b class="mono">${sc.toFixed(1)}</b><span class="note">/ 5</span><span class="pill ma-pill">${maLevelName(sc)}</span></div>
        <div class="ma-band-t">${maWhy()}</div>
        <div class="ma-band-p"><div class="ma-prog-t"><span>${pr.done} of ${pr.items} actions done${pr.gained ? ` · ${pr.gained} level${pr.gained === 1 ? "" : "s"} gained` : ""}</span><span>${gaps.length ? `${gaps.length} below target` : "All on target"}</span></div>
          <div class="vd-bar"><i style="width:${pr.items ? pr.done / pr.items * 100 : 100}%"></i></div></div>
        ${nx ? `<p class="ma-band-next"><span>Next up</span>${esc(nx.s.a.n)}: ${esc(nx.text)}</p>` : ""}
        <div class="ma-band-a"><button type="button" class="btn sm" data-ma="snapshot"><svg><use href="#i-save"/></svg>Save a snapshot</button>
          ${pr.steps.length ? `<button type="button" class="btn sm" data-ma="tasks"><svg><use href="#i-send"/></svg>Send to tracker</button>` : ""}
          <button type="button" class="btn sm" data-ma="edit">Edit ratings</button></div>
      </div>
      <div class="ma-band-r">${maRadar(ma, true, prev)}${maLegend(ma, prev)}</div>
    </section>
    <div class="segs ma-tabs" role="tablist" aria-label="Your plan">${tabs}</div>
    <div id="ma-tab" role="tabpanel">${ma.tab === "areas" ? maAreaTabHTML() : ma.tab === "progress" ? maProgressTabHTML() : `<div class="ma-tabrow"><p class="note ma-tabnote">Tick items off as you finish them. When both are done, that area moves up a level on the radar.</p>${maDueSteps().length ? `<button type="button" class="btn sm" data-ma="ics"><svg><use href="#i-download"/></svg>Add ${maDueSteps().length} due date${maDueSteps().length === 1 ? "" : "s"} to your calendar</button>` : ""}</div>${maRoadmapHTML()}`}</div>
    ${ma.ex ? "" : typeof journeyNextHTML === "function" ? journeyNextHTML("maturity") : ""}`;
}
function maResultHTML(){
  const any = MA_AREAS.some(a => ma.lv[a.k]);
  return `<div class="ma-res"><div class="card ma-sum"><div class="ma-sum-t">${maWhy()}</div>${maScaleHTML()}
      ${any ? `<div class="ma-sum-cta"><button type="button" class="btn sm" data-ma="download"><svg><use href="#i-download"/></svg>Download the roadmap</button><button type="button" class="btn sm primary" data-ma="save"><svg><use href="#i-save"/></svg>${wsSaveLabel("maturity", ma)}</button></div>` : ""}</div>${maStandHTML()}</div>
    <div class="ma-rh"><h4>Your roadmap</h4><span class="ma-rh-a">${maDueSteps().length ? `<button type="button" class="btn sm" data-ma="ics"><svg><use href="#i-download"/></svg>Add ${maDueSteps().length} due date${maDueSteps().length === 1 ? "" : "s"} to your calendar</button>` : ""}${maRoadmap(ma).length ? `<button type="button" class="btn sm" data-ma="tasks"><svg><use href="#i-send"/></svg>Send to tracker</button>` : ""}</span></div>${maRoadmapHTML()}`;
}
function maMarkdown(d){
  const t = maStage(d).t, sc = maScore(d), p = typeof wsProfile === "function" ? wsProfile() : null, steps = maRoadmap(d), pr = maProgress(d);
  const L = [`# Trust & Safety program maturity`, ``, `${p && p.org ? p.org + " · " : ""}${maStage(d).n} · ${new Date().toISOString().slice(0, 10)}`, ``];
  L.push(sc !== null ? `**Overall: level ${sc.toFixed(1)} of 5 (${maLevelName(sc)})** · ${pr.done} of ${pr.items} actions done${pr.gained ? ` · ${pr.gained} level${pr.gained === 1 ? "" : "s"} gained` : ""}` : `Not rated yet.`, ``);
  L.push(`| Area | Level | Target | Owner | Status |`, `|---|---|---|---|---|`);
  MA_AREAS.forEach(a => { const lv = maLevelOf(d, a.k); L.push(`| ${a.n} | ${lv ? lv + " · " + MA_LEVELS[lv - 1].n : "Not rated"} | ${t[a.k]} | ${(d.own && d.own[a.k]) || ""} | ${!lv ? "" : lv < t[a.k] ? "Below target" : "On target"} |`); });
  L.push(``, `## Roadmap`, ``);
  if(!steps.length) L.push(`No gaps against the targets for this stage.`, ``);
  MA_PHASES.forEach(([k, n, when]) => { const xs = steps.filter(s => s.phase === k); if(!xs.length) return;
    L.push(`### ${n} (${when})`, ``);
    xs.forEach(s => { const due = d.due && d.due[s.id]; L.push(`**${s.a.n}: level ${s.from} → ${s.to} (${MA_LEVELS[s.to - 1].n})**${s.done ? " ✓ reached" : ""}${due ? ` · due ${due}` : ""}`);
      s.acts.forEach((x, i) => L.push(`- [${d.done && d.done[s.id + "-" + i] ? "x" : " "}] ${x}`)); L.push(``); }); });
  const notes = MA_AREAS.filter(a => d.notes && d.notes[a.k]);
  if(notes.length){ L.push(`## Evidence and notes`, ``); notes.forEach(a => L.push(`**${a.n}:** ${d.notes[a.k].replace(/\n+/g, " ")}`, ``)); }
  if(d.hist && d.hist.length){ L.push(`## Snapshots`, ``, `| Date | Overall |`, `|---|---|`); d.hist.slice().sort((a, b) => a.t - b.t).forEach(h => L.push(`| ${new Date(h.t).toISOString().slice(0, 10)} | ${maScore({lv:h.lv, stage:h.stage, done:{}}).toFixed(1)} |`)); L.push(``); }
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
      <button class="btn sm primary" data-ma="save"><svg><use href="#i-save"/></svg>${wsSaveLabel("maturity", ma)}</button>` : ""}`;
}
const maPlanMode = () => maAllRated(ma) && !ma.edit;
function renderMaturity(){
  if(typeof orgGet === "function"){ const o = orgGet(); if(o.stage && !ma.stageSet && !ma.ex && !MA_AREAS.some(a => ma.lv[a.k])) ma.stage = o.stage; }
  const step = n => `<div class="mxa-ph"><span class="mxa-pnum">${n}</span><div><h3>${MA_STEPS[n - 1][0]}</h3><p>${MA_STEPS[n - 1][1]}</p></div></div>`;
  const exBanner = ma.ex ? `<div class="banner ma-exb"><span><strong>This is an example:</strong> a growing marketplace preparing to expand into the EU, a quarter into its plan. Clear it to rate your own program.</span><button type="button" class="btn sm" data-ma="clear">Clear example</button></div>` : "";
  view.innerHTML = (maPlanMode() ? headCompact("Program Maturity", ma.ex ? "Example plan" : "Your plan", maHeadMeta()) : head("Program Maturity",
    "Rate your trust and safety program across eight areas, see where it stands against the targets for your stage, and work a plan that tackles the biggest gaps first.",
    "Run the program", maHeadMeta())) + (maPlanMode() ? `${exBanner}<div id="ma-plan" class="ma-plan">${maPlanHTML()}</div>` : `
    <p class="mxa-q ma-q">How mature is your trust and safety program, and what should you fix first?</p>
    <div class="mxm-how"><ol class="mxm-how-s">${MA_STEPS.map((s, j) => `<li><b>${j + 1}</b><span><em>${s[0]}.</em> ${s[1]}</span></li>`).join("")}</ol></div>
    ${exBanner}
    ${ma.edit ? `<div class="banner ma-exb"><span>You're editing your ratings. Your ticked steps, owners and snapshots are kept.</span><button type="button" class="btn sm primary" data-goresult="1">Back to your plan</button></div>` : ""}
    <div class="vd-grid ma-grid">
      <div class="vd-main">
        <section class="mxa-part">${step(1)}<div id="ma-stages">${maStagesHTML()}</div></section>
        <section class="mxa-part">${step(2)}<div class="ma-areas" id="ma-areas">${maAreasHTML()}</div></section>
        <section class="mxa-part" id="ma-p3">${step(3)}<div id="ma-result">${maResultHTML()}</div></section>
      </div>
      <aside class="vd-rail"><div class="card vd-railc" id="ma-rail">${maRailHTML()}</div></aside>
    </div>`) + `
    <p class="note" style="margin-top:18px">A self-assessment to guide planning, not an audit or legal advice. Levels are adapted from common capability maturity models.</p>`;
  bindMaturity();
}
function maRefresh(parts){
  const set = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  if(maPlanMode() && document.getElementById("ma-plan")){ set("ma-plan", maPlanHTML()); }
  else {
    if(parts.includes("stages")) set("ma-stages", maStagesHTML());
    if(parts.includes("areas")) set("ma-areas", maAreasHTML());
    set("ma-rail", maRailHTML()); set("ma-result", maResultHTML());
  }
  const hm = view.querySelector(".pagehead .headmeta"); if(hm) hm.innerHTML = maHeadMeta();
}
function maScrollTo(el){ if(el && el.scrollIntoView) el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"}); }
function maOpenPlan(){ ma.edit = false; ma.open = null; maSave(); renderMaturity(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }
function bindMaturity(){
  const root = view;
  root.querySelectorAll(".ma-fw").forEach(d => d.addEventListener("toggle", () => store.set("ma:fw", d.open)));
  root.onclick = e => {
    const b = e.target.closest("button"); if(!b || !root.contains(b)) return;
    const d = b.dataset;
    if(d.matab){ ma.tab = d.matab; if(d.masel) ma.sel = d.masel; maSave(); return maRefresh([]); }
    if(d.masel){ ma.sel = d.masel; maSave(); maRefresh([]); const n = document.querySelector(`.ma-al[data-masel="${d.masel}"]`); if(n) n.focus(); return; }
    if(d.masnapdel){ ma.hist = ma.hist.filter(h => String(h.t) !== d.masnapdel); maSave(); return maRefresh([]); }
    if(d.stage){ ma.stage = d.stage; ma.stageSet = true; maSave(); return maRefresh(["stages", "areas"]); }
    if(d.open){ ma.open = ma.open === d.open && !d.scroll ? null : d.open; maSave(); maRefresh(["areas"]);
      const el = document.getElementById("ma-a-" + d.open); if(el) maScrollTo(el); return; }
    if(d.goresult){ if(maAllRated(ma)) return maOpenPlan(); ma.open = null; maSave(); maRefresh(["areas"]); return maScrollTo(document.getElementById("ma-p3")); }
    if(d.k && d.n){
      const first = !ma.lv[d.k]; ma.lv[d.k] = +d.n; ma.ex = false; maSave();
      b.parentNode.querySelectorAll(".ma-opt").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
      if(!first){ maRefresh(["areas"]); const nb = document.querySelector(`.ma-opt[data-k="${d.k}"][data-n="${d.n}"]`); if(nb) nb.focus(); return; }
      // First rating of an area: show the choice for a moment, then move on. After the last one, open the plan
      const i = MA_AREAS.findIndex(a => a.k === d.k), order = MA_AREAS.slice(i + 1).concat(MA_AREAS.slice(0, i)), nx = order.find(a => !ma.lv[a.k]);
      maRefresh([]);
      setTimeout(() => {
        if(!nx && !ma.edit){ ma.tab = "roadmap"; maOpenPlan(); return gsay("All eight areas rated. Here's your plan"); }
        ma.open = nx ? nx.k : null; maSave(); maRefresh(["areas"]);
        if(nx){ const el = document.getElementById("ma-a-" + nx.k); maScrollTo(el); const f = el && el.querySelector(".ma-opt"); if(f) f.focus({preventScroll:true}); }
        else maScrollTo(document.getElementById("ma-p3")); }, 260);
      return;
    }
    switch(d.ma){
      case "example": ma = maExample(); store.set("ws:cur:maturity", null); maSave(); return renderMaturity();
      case "clear": case "reset": ma = maInit({stage:ma.stage, lv:{}, done:{}, ex:false, open:"policy"}); store.set("ws:cur:maturity", null); maSave(); return renderMaturity();
      case "edit": ma.edit = true; ma.open = null; maSave(); renderMaturity(); return window.scrollTo(0, 0);
      case "snapshot": { const lv = Object.fromEntries(MA_AREAS.map(a => [a.k, maLevelOf(ma, a.k)])), today = new Date().toDateString();
        ma.hist = ma.hist.filter(h => new Date(h.t).toDateString() !== today).concat([{t:Date.now(), stage:ma.stage, lv}]); maSave(); maRefresh([]);
        return gsay(`Snapshot saved: level ${maScore(ma).toFixed(1)} on ${maDate(Date.now())}`); }
      case "download": { const md = maMarkdown(ma); return offerFile(`ts-program-maturity-${new Date().toISOString().slice(0, 10)}.md`, md, md, $("#ma-toast")); }
      case "tasks": return tkOpen("maturity");
      case "ics": { const n = maDueSteps().length, ics = maIcs(); offerFile("program-maturity-due-dates.ics", ics, ics); return gsay(`${n} due date${n === 1 ? "" : "s"} exported. Open the file to add them to your calendar`); }
      case "save": { const msg = wsSaveTool("maturity", ma, maTitle(ma)); renderMaturity(); return flashIn($("#ma-toast"), msg); }
    }
  };
  root.onchange = e => {
    const t = e.target, d = t.dataset || {};
    if(d.done){
      const k = d.done.replace(/\d+-\d$/, ""), before = maLevelOf(ma, k);
      ma.done[d.done] = t.checked; maSave();
      const after = maLevelOf(ma, k), a = maArea(k);
      if(after !== before && a) gsay(after > before ? `${a.n} is now level ${after}: ${MA_LEVELS[after - 1].n}` : `${a.n} is back to level ${after}`);
      maRefresh([]); const again = document.querySelector(`[data-done="${d.done}"]`); if(again) again.focus({preventScroll:true});
      return;
    }
    if(d.madue){ ma.due[d.madue] = t.value; return maSave(); }
    if(d.maown){ ma.own[d.maown] = t.value.trim(); maSave(); const n = document.querySelector(`.ma-al[data-masel="${d.maown}"] small`); if(n) n.textContent = ma.own[d.maown] || "No owner yet"; return; }
    if(d.manote){ ma.notes[d.manote] = t.value; return maSave(); }
  };
  root.onkeydown = e => {
    const g = e.target.closest && e.target.closest(".ma-opts, .ma-stages"); if(!g || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault(); const bs = [...g.querySelectorAll("[role=radio]")], cur = bs.indexOf(e.target), nx = bs[Math.max(0, Math.min(bs.length - 1, cur + (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1)))];
    if(nx) nx.focus();
  };
  root.oninput = e => { const d = e.target.dataset || {}; if(d.manote){ clearTimeout(maNoteTimer); maNoteTimer = setTimeout(() => { ma.notes[d.manote] = e.target.value; maSave(); }, 600); } };
  root.querySelectorAll(".gl").forEach(g => g.onclick = () => g.focus());
}
let maNoteTimer = null;
