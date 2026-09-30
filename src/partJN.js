/* =========================================================
   PROGRAM REVIEW: the recommended path through the tools, the hand-off at the end of each one,
   and a leadership pack that puts the results on one printable page
   ========================================================= */
// Setup counts once confirmed; workspaces set up before the confirm button existed count if any later step is done
const orgConfirmed = () => orgReady() && (!!orgGet().confirmed || JOURNEY.slice(1).some(s => s.done()));
// Every step the assessment can have. A step with `when` appears only when the profile calls for it
const JOURNEY_ALL = [
  {k:"setup", n:"About your platform", d:"Company type, stage and regions, once", min:1, get:"Type, size and where your users are. Every step uses it.", icon:"user", c:"var(--faint)", route:"workspace", done:() => orgConfirmed()},
  {k:"maturity", n:"Program maturity", d:"Rate eight areas, about five minutes", min:5, get:"Rate eight areas of your program and get a roadmap for the gaps.", icon:"steps", c:"var(--t-ma)", route:"maturity", done:() => MA_AREAS.every(a => ma.lv[a.k]) && !ma.ex},
  {k:"premortem", n:"Abuse pre-mortem", d:"How a product could be misused, and what to do first", min:8, get:"See how a product could be misused, and what to fix before launch.", icon:"radar", c:"var(--t-pm)", route:"premortem", go:() => newAssessment(),
    done:() => Object.values(wsItems()).some(it => it.kind === "premortem")},
  {k:"coverage", n:"Coverage radar", d:"Your defenses against that risk", min:5, get:"See whether your defenses keep up with the risks your pre-mortem found.", icon:"cover", c:"var(--t-cv)", route:"coverage", done:() => { const s = cvSummary(cv); return !cv.ex && !cv.est && s.rated === s.total; }},
  {k:"coppa", n:"COPPA readiness", d:"Children's privacy, about six minutes", min:6, get:"Whether COPPA applies to you, the gaps against the amended Rule, and drafts for parents and Legal.", icon:"coppa", c:"var(--t-cp)", route:"coppa",
    when:() => ["kids", "teens"].includes(orgGet().youth), done:() => (typeof cp !== "undefined" && cp.view === "report" && !!cp.aud && !cp.ex) || Object.values(wsItems()).some(it => it.kind === "coppa")},
  {k:"crisis", n:"Incident tabletop", d:"Rehearse one crisis, about eight minutes", min:8, get:"Rehearse one realistic incident, decision by decision, with a debrief.", icon:"siren", c:"var(--t-tt)", route:"tabletop", done:() => Object.keys(ttProgress()).length > 0},
  {k:"transparency", n:"Transparency report", d:"The DSA report, about fifteen minutes", min:15, get:"The transparency report the EU asks for, with a check of what's missing.", icon:"chart", c:"var(--t-ai)", route:"transparency",
    when:() => (orgGet().regions || []).some(r => r === "eu" || r === "uk"), done:() => (typeof tr !== "undefined" && tr.view === "report" && !!tr.org) || Object.values(wsItems()).some(it => it.kind === "transparency")},
  {k:"act", n:"Turn gaps into a plan", d:"One plan from every step, sent to your tracker", min:2, get:"One prioritized plan from every step: launch blockers, coverage gaps and your roadmap, sent to Jira, Asana, Linear or GitHub.", icon:"send", c:"var(--accent)", route:"plan", done:() => !!store.get("tk:used", false)}
];
const JOURNEY = [];
// Rebuild the steps from the profile. Called at load and whenever the profile changes
function jnSync(){ JOURNEY.length = 0; JOURNEY_ALL.filter(s => { try{ return !s.when || s.when(); }catch(e){ return false; } }).forEach(s => JOURNEY.push(s)); return JOURNEY; }
jnSync();
const jnNext = skip => JOURNEY.find(s => s.k !== skip && !s.done());
function jnGo(k){ const s = JOURNEY.find(x => x.k === k); if(!s) return;
  if(k === "maturity" && ma.ex){ ma = maInit({stage:ma.stage, lv:{}, done:{}, ex:false, open:"policy"}); store.set("ma", ma); }
  if(k === "coverage" && cv.ex){ cv = {src:null, ex:false, r:{}}; store.set("cv", cv); }
  if(s.go) s.go(); else goRoute(s.route); }
// The hand-off at the end of a tool
function journeyNextHTML(cur){
  const next = jnNext(cur);
  if(!next) return `<div class="card jn-next"><span class="jn-k">Program review complete</span><b>Share the results with leadership</b><small>One printable page with your report card, radars and top priorities.</small>
    <div class="jn-next-a"><button type="button" class="btn primary" data-pack="1">Leadership pack</button><a class="btn" href="#overview">Back to overview</a></div></div>`;
  return `<div class="card jn-next"><span class="jn-k">Next in your program review</span><b><span class="sb-glyph" style="background:${next.c}"><svg><use href="#i-${next.icon}"/></svg></span>${next.n}</b><small>${next.d}</small>
    <div class="jn-next-a"><button type="button" class="btn primary" data-jgo="${next.k}">Continue ${icon("arrow")}</button><a class="btn" href="#overview">Back to overview</a></div></div>`;
}
document.addEventListener("click", e => {
  const g = e.target.closest && e.target.closest("[data-jgo]"); if(g){ e.preventDefault(); return jnGo(g.dataset.jgo); }
  const p = e.target.closest && e.target.closest("[data-pack]"); if(p){ e.preventDefault(); packOpen(); }
});

/* ---------- Leadership pack ---------- */
const PACK_CSS = `
.mxop{--line-strong:#cfd3da;--sunk:#f1f2f5;--surface:#fff;--faint:#686e7c;--high:#b04300;--med:#8a5d00;--low:#5d6370;--accent:#5b5bd6;--t-ma:#c0308a;--t-pm:#5b5bd6;--t-cv:#46a758;--t-tt:#0588f0;--t-pol:#067c98;--hover:#f5f6f8}
.mxop .pk-radars{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}
.mxop .pk-r{border:1px solid var(--line);border-radius:10px;padding:10px 10px 6px;text-align:center;break-inside:avoid}
.mxop .pk-r h3{font-size:12.5px;margin:0 0 2px}
.mxop .pk-r small{display:block;font-size:11.5px;color:var(--muted);margin-bottom:2px}
.mxop .pk-r svg{width:100%;height:auto;overflow:visible}
.mxop .ma-rl,.mxop .cv-rl{font:500 11px Geist,system-ui,sans-serif;fill:var(--muted)}
.mxop .ma-rl.crit,.mxop .cv-rl.exposed{fill:var(--crit);font-weight:600} .mxop .cv-rl.gap{fill:var(--high)} .mxop .ma-rl.none,.mxop .cv-rl.none{fill:var(--faint)}
.mxop .ma-rv{font:600 11px ui-monospace,monospace;fill:var(--t-ma)} .mxop .ma-rv.gap{fill:var(--crit)}
.mxop .pk-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.mxop .pk-list{margin:0;padding-left:18px;display:grid;gap:6px;font-size:13px}
.mxop .pk-list small{color:var(--muted)}
.mxop .op-st.b{background:#e6f4ec;color:var(--good)} .mxop .op-st.a{background:#e6f4ec;color:var(--good)} .mxop .op-st.c{background:#fdf5d9;color:var(--med)} .mxop .op-st.d{background:#fdf0e1;color:var(--high)} .mxop .op-st.f{background:#fbe7e8;color:var(--crit)}
@media (max-width:640px){.mxop .pk-radars,.mxop .pk-cols{grid-template-columns:1fr}}`;
function packInner(){
  const p = wsProfile(), org = orgGet(), parts = rcParts(), o = rcOverall(parts), gr = o.score === null ? null : rcGrade(o.score);
  const pms = ovSavedPMs(), cs = cvSummary(cv), maOk = MA_AREAS.every(a => ma.lv[a.k]) && !ma.ex, cvOk = !cv.ex && cs.rated === cs.total;
  const tile = (v, l, cls) => `<div class="op-tile ${cls || ""}"><b>${v}</b><span>${l}</span></div>`;
  const pt = k => parts.find(x => x.k === k) || {};
  const radars = [];
  if(maOk) radars.push(`<div class="pk-r"><h3>Program maturity</h3><small>Level ${maScore(ma).toFixed(1)} · ${maLevelName(maScore(ma))}</small>${maRadar(ma, false)}</div>`);
  if(pms.length){ const comb = RADAR_GROUPS.map((g, i) => pms.reduce((b, x) => x.g[i].score > b.score ? x.g[i] : b, {g, score:0, band:null, worst:"", n:0}));
    radars.push(`<div class="pk-r"><h3>Abuse risk</h3><small>Worst risk across ${pms.length} product${pms.length === 1 ? "" : "s"}</small>${riskRadarSVG([{g:comb, color:"var(--t-pm)", fill:true}], "Combined abuse risk")}</div>`); }
  if(cvOk) radars.push(`<div class="pk-r"><h3>Harm coverage</h3><small>${cs.cov}% risk-weighted · ${cs.exposed.length} exposed</small>${cvRadar(cv, false)}</div>`);
  const steps = maOk ? maRoadmap(ma).filter(s => !s.done).slice(0, 4) : [], gaps = cvOk ? cvActions(cv, 4) : [];
  const blockers = []; pms.forEach(x => assess(openRecord(x.it.data)).safeguards.filter(s => s.rank === 3 && !(x.it.data.done && x.it.data.done[s.id])).slice(0, 2).forEach(s => blockers.push([x.name, s.t])));
  return `<div class="op-h"><div><span class="op-k">Trust &amp; Safety program review</span><h1>${esc((p && p.org) || "Our program")}</h1>
      <p>${esc([orgTypeName(org.type), orgStageName(org.stage), (org.regions || []).map(r => r.toUpperCase()).join(", ")].filter(Boolean).join(" · ") || "Self-assessment")}</p></div>
      <span class="op-date">${esc(new Date().toLocaleDateString(undefined, {year:"numeric", month:"long", day:"numeric"}))}${p && p.name ? "<br>Prepared by " + esc(p.name) : ""}</span></div>
    <div class="op-tiles">${tile(gr ? gr[1] + " · " + o.score : "–", "Overall grade (out of 100)", gr ? gr[2] : "")}${tile(maOk ? maScore(ma).toFixed(1) : "–", "Maturity level (of 5)")}${tile(cvOk ? cs.cov + "%" : "–", "Risk-weighted coverage", cvOk && cs.exposed.length ? "crit" : "")}${tile(pt("crisis").score != null ? pt("crisis").score : "–", "Crisis readiness")}</div>
    <div class="op-sec"><h2>Report card</h2><table><thead><tr><th>Part</th><th>Score</th><th>Grade</th><th>What it's based on</th></tr></thead>
      <tbody>${parts.map(x => { const g = x.score === null ? null : rcGrade(x.score); return `<tr><td>${x.n}</td><td class="num">${g ? x.score : "–"}</td><td>${g ? `<span class="op-st ${g[1].toLowerCase()}">${g[1]}</span>` : `<span class="op-st">Not graded</span>`}</td><td>${esc(g ? x.detail : x.todo)}</td></tr>`; }).join("")}</tbody></table></div>
    ${radars.length ? `<div class="pk-radars" style="grid-template-columns:repeat(${radars.length},1fr)">${radars.join("")}</div>` : ""}
    <div class="op-sec pk-cols">
      <div><h2>Top priorities</h2>${steps.length || gaps.length ? `<ol class="pk-list">${steps.map(s => `<li>${esc(s.acts.find((a, i) => !ma.done[`${s.id}-${i}`]) || s.acts[0])} <small>· ${esc(s.a.n)}, level ${s.from} → ${s.to}</small></li>`).join("")}${gaps.map(x => `<li>${esc(x.text)} <small>· coverage gap</small></li>`).join("")}</ol>` : `<p>Rate maturity and coverage to see priorities.</p>`}</div>
      <div><h2>Open launch blockers</h2>${blockers.length ? `<ol class="pk-list">${blockers.slice(0, 6).map(([n, t]) => `<li>${esc(t)} <small>· ${esc(n)}</small></li>`).join("")}</ol>` : `<p>${pms.length ? "Every launch blocker is done." : "Run a pre-mortem to see launch blockers."}</p>`}</div>
    </div>
    <div class="op-f">Made with T&amp;S Workbench. A self-assessment to guide planning, not an audit or legal advice. Grades weigh maturity 30%, coverage 25%, launch readiness 20%, crisis readiness 15% and policy clarity 10%.</div>`;
}
function packDoc(){
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>T&amp;S program review</title>
<style>body{margin:0;background:#f3f4f6}@media print{body{background:#fff}.mxop{padding:0}}${MX_OP_CSS}${PACK_CSS}</style></head><body><div class="mxop">${packInner()}</div></body></html>`;
}
function packOpen(){
  if(!document.getElementById("mxop-css")){ const st = document.createElement("style"); st.id = "mxop-css"; st.textContent = MX_OP_CSS + MX_OP_PRINT; document.head.appendChild(st); }
  if(!document.getElementById("pack-css")){ const st = document.createElement("style"); st.id = "pack-css"; st.textContent = PACK_CSS; document.head.appendChild(st); }
  const prev = document.activeElement, bg = document.createElement("div");
  bg.className = "mxop-bg"; bg.setAttribute("role", "dialog"); bg.setAttribute("aria-modal", "true"); bg.setAttribute("aria-label", "Leadership pack");
  bg.innerHTML = `<div class="mxop-bar"><b>Leadership pack</b><span class="toast" id="pk-toast" aria-live="polite"></span>
    <button type="button" class="btn sm" data-pk="dl"><svg><use href="#i-download"/></svg>Download</button><button type="button" class="btn sm" data-pk="print">Print</button><button type="button" class="btn sm" data-pk="close">Close</button></div>
    <div class="mxop">${packInner()}</div>`;
  document.body.appendChild(bg);
  const onKey = e => { if(e.key === "Escape") close(); };
  const close = () => { bg.remove(); document.removeEventListener("keydown", onKey); if(prev && prev.focus) prev.focus(); };
  document.addEventListener("keydown", onKey);
  bg.onclick = e => { if(e.target === bg) close(); };
  bg.querySelector('[data-pk="close"]').onclick = close;
  bg.querySelector('[data-pk="print"]').onclick = () => { try{ window.print(); }catch(err){ flashIn(bg.querySelector("#pk-toast"), "Printing isn't available here. Use Download instead."); } };
  bg.querySelector('[data-pk="dl"]').onclick = () => { const doc = packDoc(); offerFile(`ts-program-review-${new Date().toISOString().slice(0, 10)}.html`, doc, rcMarkdown(), bg.querySelector("#pk-toast")); };
  bg.querySelector('[data-pk="close"]').focus();
}
