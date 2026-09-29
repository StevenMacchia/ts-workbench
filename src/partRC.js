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
    const s = cvSummary(cv), own = !cv.ex, score = own && !cv.est && s.rated === s.total ? s.cov : null;
    out.push({k:"coverage", n:"Harm coverage", icon:"cover", color:"var(--t-cv)", route:"coverage", score,
      detail:score !== null ? `${s.weighted ? "Risk-weighted" : "Unweighted"} · ${s.exposed.length ? s.exposed.length + " exposed" : s.gaps.length ? s.gaps.length + " gaps" : "no gaps"}` : own && cv.est ? "Estimates from maturity, not yet confirmed" : own && s.rated ? `${s.rated} of ${s.total} defenses rated` : "",
      todo:own && cv.est ? "Confirm your coverage estimates" : own && s.rated ? "Finish rating your defenses" : "Map your defenses against risk"});
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
// One entry a day in the grade's history, so the report card can show which way it's heading
function rcRecord(o){
  if(o.score === null) return store.get("rc:hist", []) || [];
  const hist = (store.get("rc:hist", []) || []).slice(), day = new Date().toISOString().slice(0, 10), last = hist[hist.length - 1];
  if(last && last.d === day){ if(last.s !== o.score){ last.s = o.score; store.set("rc:hist", hist); } }
  else { hist.push({d:day, s:o.score}); store.set("rc:hist", hist.slice(-24)); }
  return store.get("rc:hist", []) || [];
}
function rcTrend(hist){
  if(hist.length < 2) return "";
  const pts = hist.slice(-8), W = 120, H = 34, x = i => 4 + i * (W - 8) / (pts.length - 1), lo = Math.min(...pts.map(p => p.s)) - 5, hi = Math.max(...pts.map(p => p.s)) + 5, y = v => H - 4 - (v - lo) / Math.max(1, hi - lo) * (H - 8);
  const first = hist[0], last = hist[hist.length - 1], d = last.s - first.s;
  return `<span class="rc-trend"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline points="${pts.map((p, i) => x(i).toFixed(1) + "," + y(p.s).toFixed(1)).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/><circle cx="${x(pts.length - 1).toFixed(1)}" cy="${y(last.s).toFixed(1)}" r="3" fill="var(--accent)"/></svg>
    <small class="${d > 0 ? "up" : d < 0 ? "dn" : ""}">${d > 0 ? "+" : ""}${d} since ${esc(new Date(first.d + "T12:00:00").toLocaleDateString(undefined, {month:"short", day:"numeric"}))}</small></span>`;
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
