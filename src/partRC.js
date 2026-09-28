/* =========================================================
   REPORT CARD: one score out of 100 for everything you've completed
   Each finished assessment gets its own grade; the overall grade weighs them.
   ========================================================= */
const RC_GRADES = [[85, "A", "good"], [70, "B", "good"], [55, "C", "med"], [40, "D", "high"], [0, "F", "crit"]];
const rcGrade = s => RC_GRADES.find(g => s >= g[0]);
const RC_WEIGHTS = {maturity:30, coverage:25, launch:20, crisis:15, policy:10};
// Each part: {k, n, icon, color, route, score (0 to 100, or null when not graded), detail, todo}
function rcParts(){
  const out = [], items = Object.values(wsItems());
  // Program maturity: how close each area is to its target for your stage
  if(typeof maLevelOf === "function"){
    const rated = MA_AREAS.filter(a => ma.lv[a.k]).length, t = maStage().t, own = !ma.ex;
    const score = own && rated === MA_AREAS.length ? Math.round(MA_AREAS.reduce((s, a) => s + Math.min(maLevelOf(ma, a.k), t[a.k]) / t[a.k], 0) / MA_AREAS.length * 100) : null;
    const at = MA_AREAS.filter(a => maLevelOf(ma, a.k) >= t[a.k]).length;
    out.push({k:"maturity", n:"Program maturity", icon:"steps", color:"var(--t-ma)", route:"maturity", score,
      detail:score !== null ? `${at} of ${MA_AREAS.length} areas at target · level ${maScore(ma).toFixed(1)}` : own && rated ? `${rated} of ${MA_AREAS.length} areas rated` : "",
      todo:own && rated ? "Finish rating all eight areas" : "Rate your program in eight areas"});
  }
  // Harm coverage: risk-weighted coverage from the coverage radar
  if(typeof cvSummary === "function"){
    const s = cvSummary(cv), own = !cv.ex, score = own && s.rated === s.total ? s.cov : null;
    out.push({k:"coverage", n:"Harm coverage", icon:"cover", color:"var(--t-cv)", route:"coverage", score,
      detail:score !== null ? `${s.weighted ? "Risk-weighted" : "Unweighted"} · ${s.exposed.length ? s.exposed.length + " exposed" : s.gaps.length ? s.gaps.length + " gaps" : "no gaps"}` : own && s.rated ? `${s.rated} of ${s.total} defenses rated` : "",
      todo:own && s.rated ? "Finish rating your defenses" : "Map your defenses against risk"});
  }
  // Launch readiness: safeguards done across saved pre-mortems, launch blockers counted twice
  { const pms = items.filter(it => it.kind === "premortem" && it.data);
    let want = 0, got = 0, bl = 0, blDone = 0;
    pms.forEach(it => { const d = it.data, r = assess(openRecord(d)); r.safeguards.filter(s => s.rank >= 2).forEach(s => { const w = s.rank === 3 ? 2 : 1, done = !!(d.done && d.done[s.id]);
      want += w; if(done) got += w; if(s.rank === 3){ bl++; if(done) blDone++; } }); });
    out.push({k:"launch", n:"Launch readiness", icon:"radar", color:"var(--t-pm)", route:"premortem", score:want ? Math.round(got / want * 100) : null,
      detail:want ? `${blDone} of ${bl} launch blockers done across ${pms.length} product${pms.length === 1 ? "" : "s"}` : "", todo:"Run a pre-mortem and tick off safeguards"}); }
  // Crisis readiness: strong first-try calls in tabletops, full credit once four scenarios are practiced
  { const prog = ttProgress(), runs = Object.entries(prog).map(([key, p]) => { const sc = SCENARIOS.find(s => s.id === key.split(":")[0]); return sc ? (p.best || 0) / sc.steps.length : null; }).filter(x => x !== null);
    const perf = runs.length ? runs.reduce((s, x) => s + x, 0) / runs.length : 0;
    out.push({k:"crisis", n:"Crisis readiness", icon:"siren", color:"var(--t-tt)", route:"tabletop", score:runs.length ? Math.round(perf * (0.7 + 0.3 * Math.min(1, runs.length / 4)) * 100) : null,
      detail:runs.length ? `${Math.round(perf * 100)}% strong first calls · ${runs.length} scenario${runs.length === 1 ? "" : "s"} practiced${runs.length < 4 ? " (4 for full credit)" : ""}` : "", todo:"Rehearse a crisis in the tabletop"}); }
  // Policy clarity: average clarity score of saved policy tests
  { const pol = items.filter(it => it.kind === "policy" && it.data).map(it => it.data.result ? it.data.result.score : it.data.heur ? it.data.heur.score : null).filter(x => x !== null);
    out.push({k:"policy", n:"Policy clarity", icon:"doc", color:"var(--t-pol)", route:"policy", score:pol.length ? Math.round(pol.reduce((s, x) => s + x, 0) / pol.length) : null,
      detail:pol.length ? `Average of ${pol.length} saved polic${pol.length === 1 ? "y" : "ies"}` : "", todo:"Stress-test a policy and save it"}); }
  return out;
}
function rcOverall(parts){
  const g = parts.filter(p => p.score !== null), w = g.reduce((s, p) => s + RC_WEIGHTS[p.k], 0);
  return {graded:g.length, total:parts.length, score:w ? Math.round(g.reduce((s, p) => s + p.score * RC_WEIGHTS[p.k], 0) / w) : null};
}
function rcRing(score, size){
  const r = size / 2 - 7, C = 2 * Math.PI * r, gr = score === null ? null : rcGrade(score);
  return `<svg class="rc-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${score === null ? "Not graded yet" : `Overall ${score} out of 100, grade ${gr[1]}`}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--sunk)" stroke-width="10"/>
    ${score === null ? "" : `<circle class="rc-arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--${gr[2]})" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - score / 100)).toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`}
    <text x="50%" y="${size / 2 - 2}" text-anchor="middle" class="rc-grade" style="fill:${gr ? `var(--${gr[2]})` : "var(--faint)"}">${gr ? gr[1] : "–"}</text>
    <text x="50%" y="${size / 2 + 22}" text-anchor="middle" class="rc-num">${score === null ? "not graded" : score + " / 100"}</text></svg>`;
}
// One entry a day in the grade's history, so the report card can show which way it's heading
function rcRecord(o){
  if(o.score === null) return store.get("rc:hist", []) || [];
  const hist = (store.get("rc:hist", []) || []).slice(), day = new Date().toISOString().slice(0, 10), last = hist[hist.length - 1];
  if(last && last.d === day){ if(last.s !== o.score){ last.s = o.score; store.set("rc:hist", hist); } }
  else { hist.push({d:day, s:o.score}); store.set("rc:hist", hist.slice(-24)); }
  return store.get("rc:hist", []) || [];
}
// The single most useful thing to do next for a part
function rcTip(p){
  try{
    if(p.k === "maturity"){ const nx = maNextItem(ma); return nx ? nx.text : ""; }
    if(p.k === "coverage"){ const a = cvActions(cv, 1)[0]; return a ? a.text : ""; }
    if(p.k === "launch"){ for(const it of Object.values(wsItems()).filter(x => x.kind === "premortem" && x.data)){ const s = assess(openRecord(it.data)).safeguards.find(g => g.rank === 3 && !(it.data.done && it.data.done[g.id])); if(s) return s.t + " (" + (it.title || "a product") + ")"; } return ""; }
    if(p.k === "crisis"){ const n = Object.keys(ttProgress()).length; return n < 4 ? `Practice ${4 - n} more scenario${4 - n === 1 ? "" : "s"} for full credit` : "Replay the scenarios where your first call missed"; }
    if(p.k === "policy") return "Re-test your lowest-scoring policy with the stress-tester";
  }catch(e){}
  return "";
}
function rcTrend(hist){
  if(hist.length < 2) return "";
  const pts = hist.slice(-8), W = 120, H = 34, x = i => 4 + i * (W - 8) / (pts.length - 1), lo = Math.min(...pts.map(p => p.s)) - 5, hi = Math.max(...pts.map(p => p.s)) + 5, y = v => H - 4 - (v - lo) / Math.max(1, hi - lo) * (H - 8);
  const first = hist[0], last = hist[hist.length - 1], d = last.s - first.s;
  return `<span class="rc-trend"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline points="${pts.map((p, i) => x(i).toFixed(1) + "," + y(p.s).toFixed(1)).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/><circle cx="${x(pts.length - 1).toFixed(1)}" cy="${y(last.s).toFixed(1)}" r="3" fill="var(--accent)"/></svg>
    <small class="${d > 0 ? "up" : d < 0 ? "dn" : ""}">${d > 0 ? "+" : ""}${d} since ${esc(new Date(first.d + "T12:00:00").toLocaleDateString(undefined, {month:"short", day:"numeric"}))}</small></span>`;
}
function rcHTML(){
  const parts = rcParts(), o = rcOverall(parts), gr = o.score === null ? null : rcGrade(o.score), hist = rcRecord(o);
  const weakest = parts.filter(p => p.score !== null).sort((a, b) => a.score - b.score)[0], next = parts.find(p => p.score === null);
  const line = o.score === null ? "Complete any assessment to get your first grade. Each one you finish adds to the overall score."
    : `${o.graded} of ${o.total} parts graded.${weakest && weakest.score < 70 ? ` Your weakest is ${weakest.n.toLowerCase()} at ${weakest.score}.` : ""}${next ? ` Add ${next.n.toLowerCase()} for a fuller picture.` : ""}`;
  return `<section class="rise rc" aria-label="Report card">
    <div class="ov-sec-h"><h3>Report card</h3><span class="rc-act"><button type="button" class="ov-link" data-pack="1">Leadership pack</button><button type="button" class="ov-link" data-rc="download">Download</button><span class="note">Self-assessment, not an audit</span></span></div>
    <div class="card rc-card">
      <div class="rc-main">${rcRing(o.score, 148)}
        <div class="rc-sum"><b>${gr ? `Overall grade ${gr[1]}` : "No grade yet"}</b>${rcTrend(hist)}<p>${esc(line)}</p>
          <p class="note rc-how">Each part is scored out of 100. The overall grade weighs maturity 30%, coverage 25%, launch readiness 20%, crisis readiness 15% and policy clarity 10%, across the parts you've completed.</p></div></div>
      <div class="rc-parts">${parts.map(p => { const g = p.score === null ? null : rcGrade(p.score);
        return `<a class="rc-p ${g ? "" : "open"}" href="#${p.route}"><span class="sb-glyph" style="background:${g ? p.color : "var(--faint)"}"><svg><use href="#i-${p.icon}"/></svg></span>
          <span class="rc-pt"><b>${p.n}</b><small>${esc(g ? p.detail : (p.detail ? p.detail + " · " : "") + p.todo)}</small>${g && p.score < 70 && rcTip(p) ? `<em class="rc-tip">To raise it: ${esc(rcTip(p))}</em>` : ""}</span>
          ${g ? `<span class="rc-bar"><i style="width:${p.score}%;background:var(--${g[2]})"></i></span><span class="rc-sc mono">${p.score}</span><span class="rc-lt ${g[2]}">${g[1]}</span>` : `<span class="rc-ng">Not graded</span>`}</a>`; }).join("")}</div>
    </div>
  </section>`;
}
function rcMarkdown(){
  const parts = rcParts(), o = rcOverall(parts), p = wsProfile(), gr = o.score === null ? null : rcGrade(o.score);
  const L = [`# Trust & Safety program report card`, ``, `${p && p.org ? p.org + " · " : ""}${new Date().toISOString().slice(0, 10)}`, ``,
    gr ? `**Overall: ${o.score} / 100, grade ${gr[1]}** (${o.graded} of ${o.total} parts graded)` : `No grade yet: complete an assessment to start.`, ``,
    `| Part | Score | Grade | Detail | Weight |`, `|---|---|---|---|---|`];
  parts.forEach(x => { const g = x.score === null ? null : rcGrade(x.score); L.push(`| ${x.n} | ${g ? x.score : "Not graded"} | ${g ? g[1] : ""} | ${g ? x.detail : x.todo} | ${RC_WEIGHTS[x.k]}% |`); });
  L.push(``, `Grades: A 85 and up, B 70 to 84, C 55 to 69, D 40 to 54, F below 40. The overall score weighs only the parts you've completed.`, ``, `---`, `Made with T&S Workbench. A self-assessment to guide planning, not an audit.`);
  return L.join("\n");
}
