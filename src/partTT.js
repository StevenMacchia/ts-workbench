function renderTabletop(){
  if(typeof ttf !== "undefined" && ttf && ttf.phase) return ttfRender();
  if(!tt) return ttPicker(t => head('Incident tabletop', t, 'Run the program'));
  if(!tt.first) tt.first = []; if(!tt.retried) tt.retried = [];
  const sc = ttScenario(tt.s, tt.v);
  // In a scenario the header shrinks to its name and your place in it
  const H = () => headCompact("Incident tabletop", esc(sc.title) + (tt.step >= sc.steps.length ? " · debrief" : ` · decision ${tt.step + 1} of ${sc.steps.length}`));
  if(tt.step >= sc.steps.length) return ttDebrief(H, sc);
  return ttPlay(H, sc);
}

/* ---------- learning-mode helpers ---------- */
const TT_ICON = {social:"p-social", marketplace:"p-marketplace", fintech:"p-fintech", gaming:"p-gaming", dating:"p-dating", genai:"p-genai", gig:"p-gig", kids:"p-edtech", all:"i-layers"};
const SEV_BAND = {"Sev 1":"crit", "Sev 2":"high", "Sev 3":"med"};
const DIM_BLIND = {
  safety:"You tended to choose options that delayed protecting people. In an incident, act first to stop the harm, then refine.",
  trust:"You tended to underweight how users, the press and partners would see your response. Explain what you're doing quickly and honestly.",
  reg:"You tended to underweight legal and regulatory duties. Check reporting deadlines, evidence preservation and notification rules early.",
  team:"You tended to overload or overlook your own team. Sustainable response needs triage, rotation and support for the people doing the work."
};
const ttProgress = () => store.get("tt:progress", {}) || {};
const ttKey = (s, v) => { const sc = SCENARIOS[s]; return sc.id + (sc.vars ? ":" + (v || "all") : ""); };
const ttSave = () => store.set("tt", tt);
const sevPill = sev => `<span class="pill ${SEV_BAND[sev]||"crit"}"><span class="dot"></span>${esc(sev)}</span>`;
const fmtD = v => (v>0?"+":"") + v;
const dCls = v => v>0 ? "up" : v<0 ? "dn" : "";
const lawBox = law => law ? `<div class="lawbox"><span class="eyebrow"><svg><use href="#i-scale"/></svg>Law and standards</span><p>${gloss(law)}</p></div>` : "";
const firstWasBest = (sc, i) => tt.first[i]!==undefined && sc.steps[i].o[tt.first[i]] && sc.steps[i].o[tt.first[i]].best;
function ttIcon(s, type){ return s.tailored ? (TT_ICON[type] || "i-layers") : (TT_ICON[(s.types||[])[0]] || "i-layers"); }
function ttStart(i, v){ tt = freshTT(i); tt.v = v; tt.first = []; tt.retried = []; ttSave(); renderTabletop(); window.scrollTo(0,0); focusQuiet(document.querySelector("#view h2") || document.querySelector("#view h1")); }

/* ---------- why this scenario: the public evidence behind it ---------- */
function ttWhyHTML(sc, type, full){
  const e = typeof ttWhy === "function" ? ttWhy(sc, type) : null; if(!e) return "";
  const yr = String(e.published || "").slice(0, 4);
  return `<div class="card tt-why${full ? " full" : ""}"><span class="eyebrow">Why this scenario</span><p>${esc(e.claim)} <a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.source)}${yr ? ", " + yr : ""}</a></p>${full ? `<p class="note">From public data, last reviewed ${TT_EVIDENCE_REVIEWED}. The incident itself is fictional.</p>` : ""}</div>`;
}

/* ---------- picker ---------- */
function ttPicker(H){
  const ttMode = typeof ttfNew === "function" ? store.get("tt:mode", "solo") : "solo";
  const ttType = ttCompanyType(), tInfo = TT_TYPES.find(t=>t.k===ttType), prog = ttProgress(), filt = store.get("tt:filter", "all");
  const all = SCENARIOS.map((s,i)=>({s:ttScenario(i, ttType), i})).filter(x => ttType==="all" || (x.s.types||[]).includes(ttType))
    .sort((a,b) => (a.s.tailored?1:0) - (b.s.tailored?1:0));
  const pOf = x => prog[ttKey(x.i, ttType)];
  const completed = all.filter(pOf).length;
  const list = filt==="todo" ? all.filter(x=>!pOf(x)) : filt==="done" ? all.filter(pOf) : all;
  view.innerHTML = H("Rehearse a crisis before it happens. Each scenario is four timed decisions. Pick a weaker answer and you'll see why, how it compares with the strongest call and the law behind it, and you can try again.") + `
    <p class="mxa-q tt-q">When something goes badly wrong, would your team make the right calls in the right order?</p>
    <div class="mxm-how tt-how"><ol class="mxm-how-s">
      <li><b>1</b><span><em>Pick your company type.</em> Scenarios are written for the risks and regulators you face.</span></li>
      <li><b>2</b><span><em>Choose a scenario</em> and make four decisions as the incident unfolds. About 8 minutes each.</span></li>
      <li><b>3</b><span><em>Learn from every call.</em> A weaker answer shows why, what strong looks like and the law behind it.</span></li>
    </ol></div>
    <div class="card ttbar">
      <div class="field"><label for="tt-type">Your company type</label>
        <select class="select" id="tt-type">${TT_TYPES.map(t=>`<option value="${t.k}" ${t.k===ttType?"selected":""}>${t.n}</option>`).join("")}</select>${typeof orgFromTag === "function" ? orgFromTag(ttType === orgGet().type) : ""}</div>
      <div class="ttprog">
        <div class="row" style="justify-content:space-between"><span class="eyebrow">Your progress</span><span class="note mono">${completed} of ${all.length} completed</span></div>
        <div class="bar"><i style="width:${all.length?completed/all.length*100:0}%;background:var(--good)"></i></div>
        <p class="note">${all.length} scenarios written for ${tInfo.s} companies.</p>
      </div>
    </div>
    <div class="row ttfilters"><div class="segs tt-mode" role="group" aria-label="How to play"><button type="button" data-ttmode="solo" aria-pressed="${ttMode !== "team"}">Play solo</button><button type="button" data-ttmode="team" aria-pressed="${ttMode === "team"}">Run with a team</button></div>
      ${ttMode === "team" ? `<span class="note tt-mode-n">Run a scenario live on a shared screen: roles, a timer for each decision, notes and action items, then an after-action report.</span>` : ""}</div>
    <div class="row ttfilters"><div class="segs" role="group" aria-label="Show">
      <button type="button" data-ttf="all" aria-pressed="${filt==="all"}">All <span class="mono" style="opacity:.6">${all.length}</span></button>
      <button type="button" data-ttf="todo" aria-pressed="${filt==="todo"}">Not started <span class="mono" style="opacity:.6">${all.length-completed}</span></button>
      <button type="button" data-ttf="done" aria-pressed="${filt==="done"}">Completed <span class="mono" style="opacity:.6">${completed}</span></button></div></div>
    ${typeof loopTTHTML === "function" && filt !== "done" ? loopTTHTML(ttType) : ""}
    ${list.length ? `<div class="scen-grid">${list.map(({s,i})=>{ const p = pOf({i}); const laws = s.steps.filter(x=>x.law).length;
      return `<button class="card scen ${p?"done":""}" data-i="${i}">
        <div class="scen-top"><span class="libicon sm"><svg><use href="#${ttIcon(s, ttType)}"/></svg></span>${sevPill(s.severity)}
          ${p ? `<span class="pill good" style="margin-left:auto">✓ ${p.best}/4 first try</span>` : `<span class="pill" style="margin-left:auto">New</span>`}</div>
        <h3>${esc(s.title)}</h3><p>${esc(s.blurb)}</p>
        <span class="scen-foot"><span class="note">${esc(s.platform)} · ${s.steps.length} decisions</span>
          ${typeof ttWhy === "function" && ttWhy(s, ttType) ? `<span class="tag" title="Backed by public data on how common this problem is">Sourced</span>` : ""}${laws?`<span class="tag">Law notes</span>`:""}</span>
      </button>`; }).join("")}</div>`
    : `<div class="card empty">${filt==="done"?"No completed scenarios yet. Pick one to start.":"You've completed every scenario for this company type."}</div>`}`;
  $$(".scen").forEach(b => b.onclick = () => ttMode === "team" ? ttfNew(+b.dataset.i, ttType) : ttStart(+b.dataset.i, ttType));
  $$("[data-ttmode]").forEach(b => b.onclick = () => { store.set("tt:mode", b.dataset.ttmode); renderTabletop(); const f = document.querySelector(`[data-ttmode="${b.dataset.ttmode}"]`); if(f) f.focus(); });
  $("#tt-type").onchange = e => { store.set("tt:type", e.target.value); renderTabletop(); };
  $$("[data-ttf]").forEach(b => b.onclick = () => { store.set("tt:filter", b.dataset.ttf); renderTabletop(); });
}

/* ---------- play ---------- */
function ttMeters(sc){
  const answered = tt.first.filter(x=>x!==undefined).length, strong = sc.steps.filter((_,i)=>firstWasBest(sc,i)).length;
  return `<aside class="card meters" aria-label="Incident scorecard">
    <span class="eyebrow">${esc(sc.title)}</span>
    ${DIMS.map(d=>`<div class="meter"><div class="top"><span>${d.n}</span><span class="mono">${tt.scores[d.k]}</span></div><div class="bar"><i style="width:${tt.scores[d.k]}%;background:${scoreColor(tt.scores[d.k])}"></i></div></div>`).join("")}
    <div class="firsttry"><span class="eyebrow">Strong calls on first try</span><span class="mono">${strong} / ${answered}</span></div>
    <button class="btn sm" id="tt-quit">Choose another scenario</button>
  </aside>`;
}
function ttTimeline(sc){
  return `<ol class="tline" aria-label="Incident timeline">${sc.steps.map((x,i)=>{
    const state = i<tt.step || (i===tt.step && tt.answered) ? (firstWasBest(sc,i) ? "ok" : "miss") : i===tt.step ? "now" : "";
    return `<li class="${state}"><span class="tdot">${state==="ok"?"✓":state==="miss"?"!":i+1}</span><span class="tlab"><b>${esc(x.t)}</b><span>${esc(x.h)}</span></span></li>`; }).join("")}</ol>`;
}
function ttLearn(st, picked){
  const o = st.o[picked], best = st.o.find(x=>x.best), bi = st.o.indexOf(best), retried = !!tt.retried[tt.step];
  const last = tt.step+1 >= SCENARIOS[tt.s].steps.length;
  const nextBtn = `<button type="button" class="btn primary" id="tt-next">${last ? "See debrief" : "Next update"} ${icon("arrow")}</button>`;
  const chips = d => `<div class="row" style="gap:6px">${DIMS.map(x=>d[x.k]?`<span class="pill ${d[x.k]>0?"good":"crit"}">${x.n} <span class="mono">${fmtD(d[x.k])}</span></span>`:"").join("")}</div>`;
  if(o.best) return `<div class="learn good" id="tt-learn" aria-live="polite">
      <div class="learn-h"><svg><use href="#i-check"/></svg>${retried ? "Strong call, on your second try" : "Strong call"}</div>
      <p>${esc(o.r)}</p>${chips(o.d)}
      <div class="learn-sec"><span class="eyebrow">Why it works</span><p>${esc(st.lesson)}</p></div>
      ${lawBox(st.law)}
      <div class="row">${nextBtn}</div></div>`;
  const gaps = DIMS.map(x=>({x, g:best.d[x.k]-o.d[x.k]})).sort((a,b)=>b.g-a.g);
  return `<div class="learn warn" id="tt-learn" aria-live="polite">
      <div class="learn-h"><svg><use href="#i-info"/></svg>Not the strongest call</div>
      <p><strong>What happened.</strong> ${esc(o.r)}</p>
      <div class="learn-sec"><span class="eyebrow">Your choice compared with the strongest call</span>
        <div class="cmp head"><span></span><span>You</span><span>Strongest</span></div>
        ${DIMS.map(x=>`<div class="cmp"><span>${x.n}</span><span class="cv ${dCls(o.d[x.k])}">${fmtD(o.d[x.k])}</span><span class="cv ${dCls(best.d[x.k])}">${fmtD(best.d[x.k])}</span></div>`).join("")}
        ${gaps[0].g>0?`<p class="note" style="margin-top:6px">Biggest gap: ${gaps[0].x.n.toLowerCase()}, ${gaps[0].g} points.</p>`:""}</div>
      <div class="learn-sec better"><span class="eyebrow">The stronger call · option ${"ABC"[bi]}</span><p><strong>${esc(best.l)}</strong></p><p class="note">${esc(best.r)}</p></div>
      <div class="learn-sec"><span class="eyebrow">The principle</span><p>${esc(st.lesson)}</p></div>
      ${lawBox(st.law)}
      <div class="row">${retried ? "" : `<button type="button" class="btn" id="tt-retry">Try <span class="m-hide">this decision </span>again</button>`}${nextBtn}</div></div>`;
}
function ttPlay(H, sc){
  const st = sc.steps[tt.step], picked = tt.answered ? tt.picks[tt.step] : null;
  view.innerHTML = H(`${esc(sc.platform)}. Decision ${tt.step+1} of ${sc.steps.length}.`) + `
    ${ttTimeline(sc)}
    ${tt.step === 0 ? ttWhyHTML(sc, tt.v && tt.v !== "all" ? tt.v : ttCompanyType()) : ""}
    <div class="play">
      <div>
        <div class="card inject">
          <div class="clock"><span class="t">${esc(st.t)}</span>${sevPill(sc.severity)}<span class="note">${esc(sc.title)}</span></div>
          <h3>${esc(st.h)}</h3><p class="sit">${esc(st.s)}</p>
          <div class="opts" role="group" aria-label="Your options">${st.o.map((o,i)=>{
            const cls = picked===null ? "" : i===picked ? (o.best?"picked good":"picked miss") : (o.best && !st.o[picked].best ? "reveal" : "dim");
            return `<button class="opt ${cls}" data-i="${i}" ${picked!==null?"disabled":""}><span class="k">${"ABC"[i]}</span><span>${esc(o.l)}${cls==="reveal"?`<span class="optnote">Strongest call</span>`:""}</span></button>`; }).join("")}</div>
        </div>
        ${picked!==null ? ttLearn(st, picked) : ""}
      </div>
      ${ttMeters(sc)}
    </div>`;
  $$(".opt").forEach(b => b.onclick = () => { const i = +b.dataset.i, d = st.o[i].d;
    if(tt.first[tt.step]===undefined) tt.first[tt.step] = i;
    tt.before = Object.assign({}, tt.scores);
    DIMS.forEach(x => tt.scores[x.k] = clamp(tt.scores[x.k] + (d[x.k]||0)));
    tt.picks[tt.step] = i; tt.answered = true; ttSave(); renderTabletop();
    const l = $("#tt-learn"); if(l && l.scrollIntoView) l.scrollIntoView({behavior:"smooth", block:"nearest"}); focusQuiet(l); });
  const nx = $("#tt-next"); if(nx) nx.onclick = () => { tt.step++; tt.answered = false; tt.before = null; ttSave(); renderTabletop(); window.scrollTo(0,0); focusQuiet(document.querySelector("#view h2") || document.querySelector("#view h1")); };
  const rt = $("#tt-retry"); if(rt) rt.onclick = () => { if(tt.before) tt.scores = tt.before; tt.before = null; tt.retried[tt.step] = true; tt.picks[tt.step] = undefined; tt.answered = false; ttSave(); renderTabletop(); const o = document.querySelector("#view .opt"); if(o) o.focus(); };
  $("#tt-quit").onclick = () => { tt = null; store.set("tt", null); renderTabletop(); focusQuiet(document.querySelector("#view h1")); };
}

/* ---------- debrief ---------- */
function ttDebrief(H, sc){
  const n = sc.steps.length, firstStrong = sc.steps.filter((_,i)=>firstWasBest(sc,i)).length;
  const corrected = sc.steps.filter((st,i)=>!firstWasBest(sc,i) && st.o[tt.picks[i]] && st.o[tt.picks[i]].best).length;
  const v = firstStrong===n ? ["Textbook incident command","good"] : firstStrong===n-1 ? ["Strong instincts, one gap to close","good"] : firstStrong>=2 ? ["Solid, with gaps to rehearse","high"] : ["Worth practicing again","crit"];
  const loss = {}; DIMS.forEach(x=>loss[x.k]=0);
  sc.steps.forEach((st,i) => { const f = st.o[tt.first[i]], b = st.o.find(o=>o.best); if(f && !f.best) DIMS.forEach(x => loss[x.k] += Math.max(0, b.d[x.k]-f.d[x.k])); });
  const blind = DIMS.slice().sort((a,b)=>loss[b.k]-loss[a.k])[0];
  const laws = [...new Set(sc.steps.map(st=>st.law).filter(Boolean))];
  const key = ttKey(tt.s, tt.v), prog = ttProgress();
  if(!tt.recorded){ const prev = prog[key] || {}; prog[key] = {best:Math.max(prev.best||0, firstStrong), runs:(prev.runs||0)+1, last:Date.now()}; store.set("tt:progress", prog); tt.recorded = true; ttSave(); }
  const type = tt.v && tt.v!=="all" ? tt.v : ttCompanyType();
  const next = SCENARIOS.map((s,i)=>({s:ttScenario(i, type), i})).filter(x => x.i!==tt.s && (type==="all" || (x.s.types||[]).includes(type)) && !prog[ttKey(x.i, type)]).slice(0,3);
  const avg = Math.round(DIMS.reduce((a,d)=>a+tt.scores[d.k],0)/DIMS.length);
  view.innerHTML = H("Your debrief: how your calls compare with strong practice, what to work on, and the law behind each decision.") + `
    <div class="play"><div>
      <div class="card verdict" aria-live="polite">
        <div class="row" style="gap:8px"><span class="pill ${v[1]}">${firstStrong} of ${n} strongest calls on first try</span>${corrected?`<span class="pill accent">${corrected} corrected on retry</span>`:""}</div>
        <h3>${v[0]}</h3>
        <p class="muted">Average across the four scores: <span class="mono">${avg}</span>/100. ${esc(sc.title)} · ${esc(sc.platform)}.</p>
      </div>
      <div class="learnsum">
        <div class="card learnbox"><span class="eyebrow">Your blind spot in this run</span>
          ${loss[blind.k]>0 ? `<h4>${blind.n}</h4><p>${DIM_BLIND[blind.k]}</p>` : `<h4>None this time</h4><p>Your first instincts matched strong practice across all four scores.</p>`}</div>
        <div class="card learnbox"><span class="eyebrow">Laws and standards in this scenario</span>
          ${laws.length ? `<ul>${laws.map(l=>`<li>${gloss(l)}</li>`).join("")}</ul>` : `<p class="note">This scenario is mostly about judgment rather than specific legal duties.</p>`}</div>
      </div>
      ${ttWhyHTML(sc, type, true)}
      <h3 class="dhead">Decision by decision</h3>
      <div class="debrief">${sc.steps.map((st,i)=>{ const f = st.o[tt.first[i]], fin = st.o[tt.picks[i]], b = st.o.find(o=>o.best);
        return `<div class="card dcard">
          <div class="row"><span class="mono muted" style="font-size:12.5px">${esc(st.t)}</span><strong>${esc(st.h)}</strong>${f&&f.best?'<span class="pill good">Strong call</span>':tt.retried[i]&&fin&&fin.best?'<span class="pill accent">Corrected</span>':'<span class="pill high">Missed</span>'}</div>
          <p><span class="eyebrow">Your first choice</span><br>${esc(f?f.l:"")}</p>
          ${f&&f.best?"":`<p><span class="eyebrow">Stronger call</span><br>${esc(b.l)}</p>`}
          <p class="muted"><strong style="color:var(--ink)">Lesson.</strong> ${esc(st.lesson)}</p>
          ${st.law?`<p class="note"><strong>Law and standards.</strong> ${gloss(st.law)}</p>`:""}</div>`; }).join("")}</div>
      ${next.length?`<h3 class="dhead">Practice next</h3><div class="scen-grid">${next.map(({s,i})=>`<button class="card scen" data-next="${i}">
          <div class="scen-top"><span class="libicon sm"><svg><use href="#${ttIcon(s, type)}"/></svg></span>${sevPill(s.severity)}</div>
          <h3>${esc(s.title)}</h3><p>${esc(s.blurb)}</p></button>`).join("")}</div>`:""}
      <div class="row" style="margin-top:16px"><button class="btn primary" id="tt-replay">Replay this scenario</button><button class="btn" id="tt-other">Choose another scenario</button><button class="btn" id="tt-save"><svg><use href="#i-save"/></svg>Save to workspace</button><span class="toast" id="tt-toast" role="status" aria-live="polite"></span></div>
      ${chapterLinkHTML("tabletop")}
      ${typeof journeyNextHTML === "function" ? journeyNextHTML("crisis") : ""}
    </div>${ttMeters(sc)}</div>`;
  $("#tt-replay").onclick = () => ttStart(tt.s, tt.v);
  $("#tt-other").onclick = $("#tt-quit").onclick = () => { tt = null; store.set("tt", null); renderTabletop(); };
  $("#tt-save").onclick = () => wsSaveTabletop();
  $$("[data-next]").forEach(b => b.onclick = () => ttStart(+b.dataset.next, type));
}
