/* =========================================================
   QUARTER BY QUARTER: save the whole picture each quarter and compare it with now
   A snapshot holds the score, each part, every maturity level, coverage per harm area, the launch blockers,
   the tabletop runs and the findings. The home shows what moved since the last one; the review page compares any two.
   ========================================================= */
const REV_LABEL = t => { const d = new Date(t); return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`; };
const revSnaps = () => (store.get("as:snaps", []) || []).slice().sort((a, b) => a.t - b.t);
// The picture as it stands now, in the same shape as a saved snapshot
function revNow(){
  const parts = rcParts(), o = rcOverall(parts), s = {t:Date.now(), label:REV_LABEL(Date.now()), score:o.score, parts:{}, ma:null, cv:null, launch:null, crisis:null, find:[]};
  parts.forEach(p => { s.parts[p.k] = p.score; });
  try{ if(!ma.ex && maAllRated(ma)){ s.ma = {stage:ma.stage, lv:{}}; MA_AREAS.forEach(a => { s.ma.lv[a.k] = maLevelOf(ma, a.k); }); } }catch(e){}
  try{ const c = cvSummary(cv); if(!cv.ex && !cv.est && c.total && c.rated === c.total){ s.cv = {cov:c.cov, exposed:c.exposed.length, gaps:c.gaps.length, rows:{}}; c.rows.forEach(r => { s.cv.rows[r.a.k] = {cov:r.cov, st:r.status}; }); } }catch(e){}
  try{ const pms = ovSavedPMs(); if(pms.length){ let bl = 0, open = 0; pms.forEach(p => p.r.safeguards.filter(g => g.rank === 3).forEach(g => { bl++; if(!(p.it.data.done && p.it.data.done[g.id])) open++; })); s.launch = {products:pms.length, blockers:bl, open, names:pms.map(p => p.name)}; } }catch(e){}
  try{ const runs = Object.keys(ttProgress()).length; if(runs) s.crisis = {runs, score:s.parts.crisis}; }catch(e){}
  try{ s.find = asKnow().map(x => x.tag + ": " + x.t); }catch(e){}
  return s;
}
function revSave(label){
  const s = revNow(); if(s.score === null) return null;
  s.label = (label || "").trim() || s.label;
  const all = revSnaps().filter(x => x.label !== s.label); all.push(s); store.set("as:snaps", all); return s;
}
const revDelete = t => store.set("as:snaps", revSnaps().filter(x => x.t !== t));
// Every change between two pictures, in plain words
function revDiff(a, b){
  const out = [], up = [], down = [], sign = n => (n > 0 ? "+" : "") + n;
  if(a.score !== null && b.score !== null && a.score !== b.score) out.push({k:"score", t:`Overall score ${a.score} → ${b.score} (${sign(b.score - a.score)})`, good:b.score > a.score});
  if(a.ma && b.ma) MA_AREAS.forEach(ar => { const x = a.ma.lv[ar.k], y = b.ma.lv[ar.k]; if(x && y && x !== y) (y > x ? up : down).push(`${ar.n} (level ${x} → ${y})`); });
  if(up.length) out.push({k:"ma", t:`Moved up: ${up.join(", ")}`, good:true});
  if(down.length) out.push({k:"ma", t:`Moved down: ${down.join(", ")}`, good:false});
  if(a.cv && b.cv){ const closed = [], eased = [], opened = [], worse = [], rank = st => st === "exposed" ? 2 : st === "gap" ? 1 : 0;
    CV_AREAS.forEach(ar => { const x = a.cv.rows[ar.k], y = b.cv.rows[ar.k]; if(!x || !y) return; const rx = rank(x.st), ry = rank(y.st);
      if(rx && !ry) closed.push(ar.n); else if(rx === 2 && ry === 1) eased.push(ar.n); else if(!rx && ry) opened.push(ar.n); else if(rx === 1 && ry === 2) worse.push(ar.n); });
    if(closed.length) out.push({k:"cv", t:`Coverage gaps closed: ${closed.join(", ")}`, good:true});
    if(eased.length) out.push({k:"cv", t:`No longer exposed, still a gap: ${eased.join(", ")}`, good:true});
    if(worse.length) out.push({k:"cv", t:`Now exposed: ${worse.join(", ")}`, good:false});
    if(opened.length) out.push({k:"cv", t:`New coverage gaps: ${opened.join(", ")}`, good:false});
    if(a.cv.cov !== b.cv.cov && !closed.length && !opened.length && !eased.length && !worse.length) out.push({k:"cv", t:`Risk-weighted coverage ${a.cv.cov}% → ${b.cv.cov}%`, good:b.cv.cov > a.cv.cov}); }
  if(a.launch && b.launch){ if(b.launch.open !== a.launch.open) out.push({k:"pm", t:`Open launch blockers ${a.launch.open} → ${b.launch.open}`, good:b.launch.open < a.launch.open});
    const added = (b.launch.names || []).filter(n => !(a.launch.names || []).includes(n)); if(added.length) out.push({k:"pm", t:`New products assessed: ${added.join(", ")}`, good:true}); }
  else if(!a.launch && b.launch) out.push({k:"pm", t:`First products assessed: ${b.launch.names.join(", ")}`, good:true});
  if((a.crisis ? a.crisis.runs : 0) !== (b.crisis ? b.crisis.runs : 0)) out.push({k:"tt", t:`Crises rehearsed ${a.crisis ? a.crisis.runs : 0} → ${b.crisis ? b.crisis.runs : 0}`, good:true});
  const PN = {maturity:"Program maturity", coverage:"Harm coverage", launch:"Launch readiness", crisis:"Crisis readiness", policy:"Policy clarity"};
  Object.keys(PN).forEach(k => { const x = a.parts[k], y = b.parts[k]; if(x === null || x === undefined || y === null || y === undefined || x === y) return; out.push({k:"part", t:`${PN[k]} ${x} → ${y} (${sign(y - x)})`, good:y > x}); });
  return out;
}
const revDays = t => Math.round((Date.now() - t) / 864e5);
// The home: what moved since the last saved quarter, or a nudge to save the first one
function revHomeHTML(){
  const snaps = revSnaps(), now = revNow(); if(now.score === null) return "";
  const last = snaps[snaps.length - 1]; if(!last) return "";
  const d = revDiff(last, now), old = revDays(last.t) >= 80 || now.label !== last.label;
  return `<section class="card as-rev" aria-labelledby="as-rev-h">
    <div class="as-sec-h"><h2 id="as-rev-h">Since ${esc(last.label)}</h2><span class="as-pic-a"><a class="ov-link" href="#review">Compare quarters</a>${old ? `<button type="button" class="ov-link" data-rev="save">Save ${esc(now.label)}</button>` : ""}</span></div>
    ${d.length ? `<ul class="as-rev-l">${d.slice(0, 5).map(x => `<li class="${x.good ? "up" : "dn"}"><i></i>${esc(x.t)}</li>`).join("")}${d.length > 5 ? `<li class="note"><a href="#review">${d.length - 5} more on the comparison page</a></li>` : ""}</ul>` : `<p class="note as-rev-same">Nothing has moved since ${esc(last.label)}${old ? ". Retake a step, then save this quarter" : ""}.</p>`}
  </section>`;
}
/* ---------- the review page ---------- */
let revPick = {a:null};
function revRadarHTML(a, b){
  const out = [];
  if(b.ma) out.push(`<div class="rv-rad"><h3>Maturity</h3>${maRadar(ma, false, a.ma ? {lv:a.ma.lv} : null)}<div class="ma-legend"><span><i class="ov-lg-fill" style="--c:var(--t-ma)"></i>Now</span>${a.ma ? `<span><i class="rv-lg-dot"></i>${esc(a.label)}</span>` : ""}<span><i class="ov-lg-tgt"></i>Target</span></div></div>`);
  if(b.cv) out.push(`<div class="rv-rad"><h3>Coverage</h3>${cvRadar(cv, false, a.cv ? Object.fromEntries(Object.entries(a.cv.rows).map(([k, v]) => [k, v.cov])) : null)}<div class="ma-legend"><span><i class="cv-lg-cov"></i>Now</span>${a.cv ? `<span><i class="rv-lg-dot" style="border-color:var(--t-cv)"></i>${esc(a.label)}</span>` : ""}<span><i class="cv-lg-risk"></i>Risk</span></div></div>`);
  return out.length ? `<div class="rv-rads">${out.join("")}</div>` : "";
}
function renderReview(){
  if(typeof gdCur !== "undefined") gdCur = null;
  const snaps = revSnaps(), now = revNow();
  const a = snaps.find(s => String(s.t) === String(revPick.a)) || snaps[snaps.length - 1] || null;
  const PN = [["maturity", "Program maturity"], ["launch", "Launch readiness"], ["coverage", "Harm coverage"], ["crisis", "Crisis readiness"], ["policy", "Policy clarity"]];
  const cell = v => v === null || v === undefined ? "–" : v, delta = (x, y) => x === null || x === undefined || y === null || y === undefined ? "" : y === x ? `<span class="rv-d same">same</span>` : `<span class="rv-d ${y > x ? "up" : "dn"}">${y > x ? "+" : ""}${y - x}</span>`;
  const d = a ? revDiff(a, now) : [];
  view.innerHTML = head("Quarter by quarter", "Save the picture each quarter and see what moved: the score, each part, every area, the gaps you closed and the ones that opened.", "Assess",
    `<span class="toast" id="rv-toast" role="status" aria-live="polite"></span>${now.score !== null ? `<button type="button" class="btn sm primary" data-rev="save">Save ${esc(now.label)}</button>` : ""}`) + `<div class="rv">
    ${now.score === null ? `<div class="card ma-none"><b>Nothing to compare yet.</b><p class="note">Finish a step of the assessment, save the quarter, and come back next quarter.</p><a class="btn primary" href="#overview">Back to your assessment</a></div>` : !a ? `<div class="card as-rev-first"><div><b>No saved quarters yet.</b><p>Save ${esc(now.label)} now. Next quarter, retake any step and this page shows the difference.</p></div><button type="button" class="btn primary" data-rev="save">Save ${esc(now.label)}</button></div>` : `
    <div class="rv-top">
      <label class="field rv-pick"><span class="lbl">Compare now with</span><select class="select" id="rv-a">${snaps.map(s => `<option value="${s.t}" ${s === a ? "selected" : ""}>${esc(s.label)} · ${new Date(s.t).toLocaleDateString(undefined, {month:"short", day:"numeric", year:"numeric"})}</option>`).join("")}</select></label>
      <div class="rv-score"><div><span class="as-k">${esc(a.label)}</span><b class="mono">${cell(a.score)}</b></div><span class="rv-arrow">${icon("arrow")}</span><div><span class="as-k">Now</span><b class="mono">${cell(now.score)}</b></div>${delta(a.score, now.score)}</div>
    </div>
    <div class="rv-grid">
      <section class="card rv-parts"><h3>Each part</h3><table><thead><tr><th>Part</th><th>${esc(a.label)}</th><th>Now</th><th></th></tr></thead><tbody>${PN.map(([k, n]) => `<tr><td>${n}</td><td class="mono">${cell(a.parts[k])}</td><td class="mono">${cell(now.parts[k])}</td><td>${delta(a.parts[k], now.parts[k])}</td></tr>`).join("")}</tbody></table></section>
      <section class="card rv-what"><h3>What changed</h3>${d.length ? `<ul class="as-rev-l">${d.map(x => `<li class="${x.good ? "up" : "dn"}"><i></i>${esc(x.t)}</li>`).join("")}</ul>` : `<p class="note">Nothing has moved since ${esc(a.label)}. Retake a step and the difference shows here.</p>`}</section>
    </div>
    ${revRadarHTML(a, now)}
    ${a.ma && now.ma ? `<section class="card rv-areas"><h3>Maturity by area</h3><div class="rv-area-g">${MA_AREAS.map(ar => { const x = a.ma.lv[ar.k], y = now.ma.lv[ar.k]; return `<div class="rv-area ${y > x ? "up" : y < x ? "dn" : ""}"><span>${esc(ar.s)}</span><b class="mono">${x} → ${y}</b></div>`; }).join("")}</div></section>` : ""}
    ${a.find && a.find.length ? `<section class="card rv-find"><h3>What we knew in ${esc(a.label)}</h3><ul>${a.find.map(t => `<li>${esc(t)}</li>`).join("")}</ul></section>` : ""}`}
    ${snaps.length ? `<section class="rv-saved"><div class="as-sec-h"><h2>Saved quarters</h2><span class="note">Saving the same quarter again replaces it</span></div><div class="card"><ul class="rv-list">${snaps.slice().reverse().map(s => `<li><b>${esc(s.label)}</b><span class="note">${new Date(s.t).toLocaleDateString(undefined, {month:"short", day:"numeric", year:"numeric"})} · score ${cell(s.score)}</span><button type="button" class="btn sm icon" data-revdel="${s.t}" aria-label="Delete ${esc(s.label)}" title="Delete">${icon("trash")}</button></li>`).join("")}</ul></div></section>` : ""}
    <p class="note" style="margin-top:18px">Snapshots stay in this browser with the rest of your work, and go into your workspace file when you save one.</p>
  </div>`;
  const sel = $("#rv-a"); if(sel) sel.onchange = () => { revPick.a = sel.value; renderReview(); const s2 = $("#rv-a"); if(s2) s2.focus(); };
  view.querySelectorAll("[data-revdel]").forEach(b => b.onclick = () => { revDelete(+b.dataset.revdel); revPick.a = null; renderReview(); gsay("Snapshot deleted"); });
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-rev]"); if(!b || !view.contains(b)) return;
  if(b.dataset.rev === "save"){ const s = revSave(); if(!s) return gsay("Finish a step first"); const r = (location.hash || "").slice(1).split("/")[0]; if(r === "review") renderReview(); else renderOverview(); gsay(`${s.label} saved. Come back next quarter to compare`); }
});
