/* =========================================================
   REPORT CARD: one score out of 100 for everything you've completed
   Each finished assessment gets its own grade; the overall grade weighs them.
   ========================================================= */
const RC_GRADES = [[85, "A", "good"], [70, "B", "good"], [55, "C", "med"], [40, "D", "high"], [0, "F", "crit"]];
const rcGrade = s => RC_GRADES.find(g => s >= g[0]);
const RC_WEIGHTS = {maturity:30, coverage:25, launch:20, crisis:15, metrics:10, policy:10};
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
  // Measurement: share of tracked metrics on track, watch counts half
  if(typeof mxStatusCounts === "function"){
    const c = mxStatusCounts(mx), n = c.on + c.watch + c.off;
    out.push({k:"metrics", n:"Measurement", icon:"gauge", color:"var(--t-mx)", route:"metrics/scorecard", score:n >= 3 ? Math.round((c.on + c.watch / 2) / n * 100) : null,
      detail:n ? `${c.on} on track · ${c.watch} to watch · ${c.off} off track` : "", todo:n ? "Track at least three metrics against targets" : "Set targets in your metrics scorecard"});
  }
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
function rcHTML(){
  const parts = rcParts(), o = rcOverall(parts), gr = o.score === null ? null : rcGrade(o.score);
  const weakest = parts.filter(p => p.score !== null).sort((a, b) => a.score - b.score)[0], next = parts.find(p => p.score === null);
  const line = o.score === null ? "Complete any assessment to get your first grade. Each one you finish adds to the overall score."
    : `${o.graded} of ${o.total} parts graded.${weakest && weakest.score < 70 ? ` Your weakest is ${weakest.n.toLowerCase()} at ${weakest.score}.` : ""}${next ? ` Add ${next.n.toLowerCase()} for a fuller picture.` : ""}`;
  return `<section class="rise rc" aria-label="Report card">
    <div class="ov-sec-h"><h3>Report card</h3><span class="rc-act"><button type="button" class="ov-link" data-rc="download">Download</button><span class="note">Self-assessment, not an audit</span></span></div>
    <div class="card rc-card">
      <div class="rc-main">${rcRing(o.score, 148)}
        <div class="rc-sum"><b>${gr ? `Overall grade ${gr[1]}` : "No grade yet"}</b><p>${esc(line)}</p>
          <p class="note rc-how">Each part is scored out of 100. The overall grade weighs maturity 30%, coverage 25%, launch readiness 20%, crisis readiness 15%, measurement 10% and policy clarity 10%, across the parts you've completed.</p></div></div>
      <div class="rc-parts">${parts.map(p => { const g = p.score === null ? null : rcGrade(p.score);
        return `<a class="rc-p ${g ? "" : "open"}" href="#${p.route}"><span class="sb-glyph" style="background:${g ? p.color : "var(--faint)"}"><svg><use href="#i-${p.icon}"/></svg></span>
          <span class="rc-pt"><b>${p.n}</b><small>${esc(g ? p.detail : (p.detail ? p.detail + " · " : "") + p.todo)}</small></span>
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
