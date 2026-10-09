/* =========================================================
   OVERVIEW (studio layout, live data)
   ========================================================= */
// One illustration language for every All-tools / Learn-hub card: the tool's own icon, large, in
// the accent color, plus one peach accent shape (cardArt(), partD.js). The old per-tool ad hoc
// illustrations (a radar sweep, a trend line, a lock, a grid of tiles, each hand-drawn once) are
// gone; a tool is now recognizable by its icon, not by a bespoke drawing.
const OV_ART_ICON = {pm:"radar", tt:"siren", mx:"gauge", vd:"scale", pol:"doc", ma:"steps", cv:"cover", rt:"shield", cp:"coppa", ds:"dsa", ev:"eval"};
const OV_ART = Object.fromEntries(Object.entries(OV_ART_ICON).map(([k, icon]) => [k, cardArt(icon)]));
// The one-line chip shown in "Jump back in". Reuses itemSummary() (partW2.js), the same
// pill text and color it shows in the workspace list, so the two pages never drift apart.
function ovChip(it){
  const s = typeof itemSummary === "function" ? itemSummary(it) : {};
  if(!s.chip || !s.chip.label) return "";
  const {cls, label} = s.chip;
  return `<span class="ov-chip">${cls ? `<span class="sdot" style="background:var(--${cls})"></span>` : ""}${esc(label)}</span>`;
}
/* ---------- Your assessment: six guided steps that fill in one picture of the program ---------- */
const AS_NEXT_LINE = {maturity:"Next, you'll see how mature each part of your program is.", premortem:"Next, you'll see how a product could be misused, and what to fix first.",
  coverage:"Next, you'll see whether your defenses keep up with these risks.", coppa:"Next, you'll see whether COPPA applies to you and where the gaps are.", dsa:"Next, you'll see which DSA duties apply to you and where the gaps are.", crisis:"Next, you'll see how your team would handle a real incident.", transparency:"Next, you'll build the transparency report the EU asks for."};
const AS_PART_STEP = {maturity:"maturity", coverage:"coverage", launch:"premortem", crisis:"crisis"};
const asLow = t => /^[A-Z]([a-z]| )/.test(t) ? t[0].toLowerCase() + t.slice(1) : t;
const asMin = n => `${n} minute${n === 1 ? "" : "s"}`;
// What a finished step found, in one line
function asSum(k){
  try{
    if(k === "setup"){ const o = orgGet(); return [orgTypeName(o.type), orgStageName(o.stage), (o.regions || []).map(r => r.toUpperCase()).join(", ")].filter(Boolean).join(" · "); }
    if(k === "maturity"){ const g = maGaps(ma).length; return g ? `${g} of ${MA_AREAS.length} areas below target` : "Every area at target"; }
    if(k === "premortem"){ const pms = ovSavedPMs(); let open = 0; pms.forEach(p => { open += p.r.safeguards.filter(s => s.rank === 3 && !(p.it.data.done && p.it.data.done[s.id])).length; });
      return `${pms.length} product${pms.length === 1 ? "" : "s"} · ${open ? `${open} launch blocker${open === 1 ? "" : "s"} open` : "no open launch blockers"}`; }
    if(k === "coverage"){ const s = cvSummary(cv); return s.exposed.length ? `${s.exposed.length} harm area${s.exposed.length === 1 ? "" : "s"} exposed` : s.gaps.length ? `${s.gaps.length} harm area${s.gaps.length === 1 ? " with a gap" : "s with gaps"}` : "No gaps against your risk"; }
    if(k === "crisis"){ const n = Object.keys(ttProgress()).length; return `${n} scenario${n === 1 ? "" : "s"} rehearsed`; }
    if(k === "act") return "Sent to your tracker";
    if(k === "coppa"){ const s = cpScore(cp, cpCtx(cp), cpApplies(cp)); return `${s.pct}% ready · ${s.crit ? `${s.crit} critical gap${s.crit === 1 ? "" : "s"}` : "no critical gaps"}`; }
    if(k === "dsa"){ const s = dsScore(ds, dsCtx(ds)); return `${s.pct}% ready · ${s.crit ? `${s.crit} critical gap${s.crit === 1 ? "" : "s"}` : "no critical gaps"}`; }
    if(k === "transparency"){ const p = trProgress(); return `${p.got} of ${p.total} sections filled in for ${tr.year}`; }
  }catch(e){}
  return "";
}
// When a step's own summary changes, stamp the time, so a completed step can show how stale it
// is before the combined score is trusted. A new key, not a change to any tool's saved shape.
function asTouch(k, sum){
  const t = store.get("as:touch", {});
  if(t[k] && t[k].sum === sum) return t[k].at;
  t[k] = {sum, at:Date.now()}; store.set("as:touch", t);
  return t[k].at;
}
// The most important thing each finished step found, plus a line on what comes next
function asKnow(){
  const out = [], J = typeof JOURNEY !== "undefined" ? JOURNEY : [], isDone = k => { const s = J.find(x => x.k === k); return !!(s && s.done()); };
  try{
    if(isDone("maturity")){ const g = maGaps(ma)[0];
      out.push({tag:"Maturity", c:"var(--t-ma)", t:g ? `${g.a.n} is at level ${g.cur}, ${g.gap} level${g.gap === 1 ? "" : "s"} below your target of ${g.tgt}.` : "Every area meets its target for your stage."}); }
    if(isDone("premortem")){ const hit = ovSavedPMs().map(p => ({p, s:p.r.safeguards.find(g => g.rank === 3 && !(p.it.data.done && p.it.data.done[g.id]))})).find(x => x.s);
      out.push({tag:"Pre-mortem", c:"var(--t-pm)", t:hit ? `Before launch, ${hit.p.name} still needs ${asLow(hit.s.t.replace(/\.$/, ""))}.` : "Every launch blocker is done across your products."}); }
    if(isDone("coverage")){ const a = cvActions(cv, 1)[0];
      out.push({tag:"Coverage", c:"var(--t-cv)", t:a ? `${a.row.a.n} carries ${a.row.band ? BANDS[a.row.band][0].toLowerCase() + " " : ""}risk with ${a.row.cov}% coverage. Start with ${a.layer.n.toLowerCase()}.` : "Your coverage keeps pace with the risk in every harm area."}); }
    if(isDone("dsa") && typeof dsScore === "function"){ const s = dsScore(ds, dsCtx(ds)), g = s.gaps[0];
      out.push({tag:"DSA", c:"var(--t-ds)", t:g ? `${dsApplies(ds).h}. The most urgent gap: ${asLow(g.t.replace(/\.$/, ""))} (${g.cite}).` : `${dsApplies(ds).h}, and every duty that applies is in place.`}); }
    if(isDone("coppa") && typeof cpScore === "function"){ const s = cpScore(cp, cpCtx(cp), cpApplies(cp)), g = s.gaps[0];
      out.push({tag:"COPPA", c:"var(--t-cp)", t:g ? `${cpApplies(cp).h}. The most urgent gap: ${asLow(g.t.replace(/\.$/, ""))}.` : `${cpApplies(cp).h}, and every requirement that applies is in place.`}); }
    if(isDone("transparency") && typeof trProgress === "function"){ const p = trProgress();
      out.push({tag:"Transparency", c:"var(--t-ai)", t:p.missing.length ? `Your ${tr.year} report is missing ${p.missing.length} section${p.missing.length === 1 ? "" : "s"}, starting with ${p.missing[0].n.toLowerCase()}.` : `Your ${tr.year} transparency report has every section the DSA asks for.`}); }
    if(isDone("crisis")){ const runs = Object.entries(ttProgress()).map(([key, p]) => { const sc = SCENARIOS.find(s => s.id === key.split(":")[0]); return sc ? (p.best || 0) / sc.steps.length : null; }).filter(x => x !== null);
      if(runs.length) out.push({tag:"Crisis", c:"var(--t-tt)", t:`Across ${runs.length} rehearsal${runs.length === 1 ? "" : "s"}, ${Math.round(runs.reduce((s, x) => s + x, 0) / runs.length * 100)}% of your first calls were strong.`}); }
  }catch(e){}
  if(!isDone("maturity") && typeof TYPE_TIP !== "undefined" && TYPE_TIP[typeKey()]) out.push({tag:"Your type", c:"var(--faint)", t:TYPE_TIP[typeKey()], muted:true});
  const nx = J.find(s => !s.done() && AS_NEXT_LINE[s.k]);
  if(nx) out.push({tag:"Coming up", c:"var(--faint)", t:AS_NEXT_LINE[nx.k], muted:true});
  return out;
}
// A radar slot: the tool's own radar, labels hidden, or a dashed placeholder until its step is done
const AS_GHOST = (() => { const n = 8, pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return (200 + Math.cos(a) * r).toFixed(1) + "," + (150 + Math.sin(a) * r).toFixed(1); };
  return `<svg viewBox="0 0 400 300" aria-hidden="true">${[52, 104].map(r => `<polygon points="${Array.from({length:n}, (x, i) => pt(i, r)).join(" ")}" fill="none" stroke="var(--line-strong)" stroke-dasharray="4 5"/>`).join("")}</svg>`; })();
function asRadarsHTML(){
  const J = typeof JOURNEY !== "undefined" ? JOURNEY : [], isDone = k => { const s = J.find(x => x.k === k); return !!(s && s.done()); }, slot = [];
  let pms = []; try{ pms = ovSavedPMs(); }catch(e){}
  const comb = pms.length ? RADAR_GROUPS.map((g, i) => pms.reduce((b, p) => p.g[i].score > b.score ? p.g[i] : b, {score:0, band:null})) : null;
  slot.push({n:"Launch risk", sub:pms.length ? `${pms.length} product${pms.length === 1 ? "" : "s"}, by kind of harm` : "", route:"premortem", step:3,
    svg:comb ? riskRadarSVG([{g:comb, color:"var(--t-pm)", fill:true}], "Combined launch risk across your products") : ""});
  slot.push({n:"Maturity", sub:"Now against your target", route:"maturity", step:2, svg:isDone("maturity") ? maRadar(ma, false) : ""});
  slot.push({n:"Coverage", sub:"Your defenses against the risk", route:"coverage", step:4, svg:isDone("coverage") ? cvRadar(cv, false) : ""});
  return `<div class="as-rads">${slot.map(x => `<a class="as-rad ${x.svg ? "" : "wait"}" href="#${x.route}">
    <span class="as-rad-g">${x.svg || AS_GHOST}${x.svg ? "" : `<span class="as-rad-w">After step ${x.step}</span>`}</span>
    <b>${x.n}</b><small>${x.svg ? esc(x.sub) : "&nbsp;"}</small></a>`).join("")}</div>`;
}
function asPictureHTML(empty){
  const parts = typeof rcParts === "function" ? rcParts() : [], o = parts.length ? rcOverall(parts) : {score:null, graded:0, total:5};
  const graded = parts.filter(p => p.score !== null).map(p => p.k), seen = empty ? null : store.get("as:seen", null);
  // Say plainly when the score moved since the last visit, and why
  let delta = "";
  if(seen && seen.score !== null && o.score !== null && seen.score !== o.score){ const d = o.score - seen.score, added = graded.filter(k => !(seen.graded || []).includes(k)).map(k => parts.find(p => p.k === k).n.toLowerCase());
    delta = `${d > 0 ? "Up" : "Down"} ${Math.abs(d)} point${Math.abs(d) === 1 ? "" : "s"} since you last looked.${added.length ? ` The score now includes ${added.join(" and ")}${d < 0 ? ", and counts what it found" : ""}.` : ""}`; }
  if(!empty && (!seen || seen.score !== o.score || (seen.graded || []).join() !== graded.join())) store.set("as:seen", {score:o.score, graded});
  const J = typeof JOURNEY !== "undefined" ? JOURNEY : [], stepOf = k => J.findIndex(s => s.k === AS_PART_STEP[k]) + 1;
  const todo = p => p.k === "policy" ? "Optional" : `${p.detail ? p.detail + " · " : ""}Step ${stepOf(p.k)}`;
  // Each graded part in plain words: the bar is the score, so the words say what it's made of
  const plain = p => { const d = p.detail || "";
    if(p.k === "coverage") return asSum("coverage");
    if(p.k === "policy"){ const n = (d.match(/\d+/) || ["1"])[0]; return `${n} polic${n === "1" ? "y" : "ies"} tested`; }
    // Crisis readiness keeps its "(4 for full credit)" aside: it's what explains why a perfect run can still score under 100
    return p.k === "maturity" ? d.split(" · ")[0] : p.k === "launch" ? d.replace(/ across .*$/, "") : p.k === "crisis" ? (d.split(" · ")[1] || d).replace(/practiced/, "rehearsed") : d; };
  // In step order, with the optional part last
  const order = p => AS_PART_STEP[p.k] ? stepOf(p.k) : 99;
  const rows = parts.slice().sort((a, b) => order(a) - order(b));
  return `<section class="card as-pic" aria-labelledby="as-pic-h">
    <div class="as-sec-h"><h2 id="as-pic-h">Your program picture</h2>${!empty && o.score !== null ? `<span class="as-pic-a"><button type="button" class="ov-link" data-pack="1">Leadership pack</button><button type="button" class="ov-link" data-rc="download">Download</button>${typeof revSnaps === "function" && !revSnaps().length ? `<button type="button" class="ov-link" data-rev="save" title="Keep this quarter's picture to compare next quarter">Save quarter</button>` : ""}</span>` : `<span class="note">${empty ? "Fills in as you go" : "Updates after every step"}</span>`}</div>
    <div class="as-pic-b">
      <div class="as-score"><span class="as-k">Overall</span><span class="as-big ${o.score === null ? "none" : ""}"><b class="mono">${o.score === null ? "–" : o.score}</b><small>/ 100</small></span>
        <span class="note">${o.score === null ? "Appears after step 2" : `Grade ${rcGrade(o.score)[1]} · based on ${o.graded} of ${o.total} parts${o.graded < o.total ? " so far" : ""}`}</span>
        ${empty || o.score === null ? "" : rcTrend(rcRecord(o))}
        ${delta ? `<span class="as-delta ${delta.startsWith("Up") ? "up" : ""}">${esc(delta)}</span>` : ""}</div>
      <div class="as-parts">${rows.map(p => `<a class="as-part ${p.score === null ? "open" : ""}" href="#${p.route}" aria-label="${esc(p.n)}: ${p.score === null ? "not graded yet" : p.score + " of 100"}"><span class="as-pn">${p.n}</span>
        <span class="as-pb">${p.score === null ? `<span class="as-bar none"></span>` : `<span class="as-bar" title="${p.score} of 100"><i style="width:${p.score}%;background:${p.color}"></i></span>`}<small>${esc(p.score === null ? todo(p) : plain(p))}</small></span></a>`).join("")}</div>
    </div>
    ${o.score === null ? "" : `<p class="note as-pic-weight">${typeof rcWeightLine === "function" ? rcWeightLine() : ""}</p>`}
    ${asRadarsHTML()}
  </section>`;
}
function asKnowHTML(){
  const xs = asKnow(); if(!xs.length) return "";
  return `<section class="card as-know" aria-labelledby="as-know-h"><h2 id="as-know-h">What we know so far</h2>
    <ul>${xs.map(x => `<li class="${x.muted ? "muted" : ""}"><span class="as-tag" style="color:color-mix(in oklab, ${x.c} 78%, var(--ink))">${x.tag}</span><span>${esc(x.t)}</span></li>`).join("")}</ul></section>`;
}
function asStepHTML(s, i, next){
  const ok = s.done(), cur = s === next, color = s.k === "setup" ? "var(--faint)" : s.c;
  if(ok){ const sum = asSum(s.k), at = asTouch(s.k, sum), rel = relTime(at), upd = rel === "now" ? "updated just now" : `updated ${rel} ago`;
    // "About your platform" is done on the workspace page itself, not its own report, so the button says where it actually goes
    const label = s.k === "setup" ? "Open workspace" : "Review";
    return `<div class="as-s ok"><span class="as-n ok">${icon("check")}</span><span class="as-st"><b>${s.n}</b><small>${esc(sum)}${sum ? " · " : ""}${upd}</small></span><button type="button" class="as-rv" data-jgo="${s.k}" aria-label="${esc(label)} ${esc(s.n)}">${esc(label)}</button></div>`; }
  if(cur) return `<div class="as-s cur" style="--c:${color}"><div class="as-cur-h"><span class="as-n cur">${i + 1}</span><span class="as-k">Up next · about ${asMin(s.min)}</span></div>
    <b class="as-cur-n">${s.n}</b><p>${esc(s.get)}</p>
    ${s.k === "setup" && typeof orgCardHTML === "function" ? `<div class="jn-setup as-setup">${orgCardHTML(true)}</div>` : `<button type="button" class="btn primary" data-jgo="${s.k}">Continue ${icon("arrow")}</button>`}</div>`;
  return `<button type="button" class="as-s todo" data-jgo="${s.k}"><span class="as-n">${i + 1}</span><span class="as-st"><b>${s.n}</b><small>About ${asMin(s.min)}</small></span><span class="as-go">Start</span></button>`;
}
// First visit, before any choice is remembered: assess the whole program, or go straight to one tool.
// Never shown again once a choice is made (tswb:firstrun:seen), and never in the demo or while opening a shared link.
function firstRunHTML(){
  return `<div class="card firstrun" role="group" aria-labelledby="firstrun-h">
    <div class="firstrun-t"><h2 id="firstrun-h">How do you want to start?</h2><p class="note">Pick one. You can always do the other later.</p></div>
    <div class="firstrun-opts">
      <button type="button" class="firstrun-opt" data-firstrun="assess"><b>Assess my program</b><span>The full guided assessment: one picture of your program, built up step by step.</span></button>
      <button type="button" class="firstrun-opt" data-firstrun="tools"><b>Use one tool</b><span>Jump straight to any tool on its own, such as a pre-mortem or a vendor scorecard.</span></button>
    </div>
  </div>`;
}
function firstRunBind(){
  view.querySelectorAll("[data-firstrun]").forEach(b => b.onclick = () => {
    store.set("firstrun:seen", true);
    if(b.dataset.firstrun === "tools") goRoute("tools");
    else { store.set("as:start", true); renderOverview(); focusQuiet(document.querySelector("#view h1")); }
  });
}
// First visit: what the assessment is, what you get, and a way to see it filled in
function asWelcomeHTML(J){
  const total = J.reduce((t, s) => t + (s.min || 0), 0);
  return `<div class="ov as as-first">
    <section class="as-hero rise">
      <div class="as-hero-t">
        <span class="as-eb">Free · no account · about ${Math.round(total / 5) * 5} minutes</span>
        <h1>See where your Trust &amp; Safety program stands</h1>
        <p>${asCount(J.length, true)} guided steps, chosen for your kind of platform. Each one asks a few plain questions, then adds to one picture of your program: what's strong, what's exposed, and what to do first.</p>
        <div class="as-hero-a"><button type="button" class="btn primary as-cta" data-as="start">Start the assessment ${icon("arrow")}</button>${typeof demoStart === "function" ? `<button type="button" class="btn as-cta" data-demo="start">See it with an example company</button>` : ""}</div>
        <span class="note">Stop any time. The next visit picks up where you left off. Your answers stay in this browser.</span>
      </div>
    </section>
    ${typeof demoPreviewHTML === "function" ? demoPreviewHTML() : ""}
    <section class="rise" aria-labelledby="as-six-h">
      <div class="as-sec-h"><h2 id="as-six-h">The ${asCount(J.length)} steps</h2><span class="note">Want one tool on its own? They're all under <a href="#tools">All tools</a>.</span></div>
      <ol class="as-six">${J.map((s, i) => `<li style="--c:${s.k === "setup" ? "var(--faint)" : s.c}"><span class="as-six-h"><span class="as-six-n">${i + 1}</span><span class="note">${s.min} min</span></span><b>${s.n}</b><small>${esc(s.get)}</small></li>`).join("")}</ol>
      <p class="note as-six-note">More can appear as you answer: a COPPA readiness step if under-18s use your product, and a DSA readiness or transparency-report step if EU or UK rules apply to you.</p>
    </section>
    ${asFootHTML()}
  </div>`;
}
const asFootHTML = () => `<footer class="ov-foot-note"><span><svg><use href="#i-lock"/></svg>Your work stays in your browser: no accounts, no cookies, just an anonymous page-view count. AI analysis, when you ask for it, runs on your own Claude account.</span><span>A self-assessment to guide planning, not an audit or legal advice.</span><a href="#about" style="margin-left:auto;color:var(--faint);text-decoration:none">Built by Steven Macchia · About this project</a></footer>`;
const asCount = (n, cap) => { const w = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][n] || String(n); return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w; };
function renderOverview(){
  const J = typeof JOURNEY !== "undefined" ? JOURNEY : [], demo = typeof demoOn === "function" && demoOn();
  const done = J.filter(s => s.done()), next = J.find(s => !s.done());
  const fresh = !demo && !done.length && !store.get("as:start", false) && !Object.keys(wsItems()).length;
  if(fresh || !J.length){
    const shared = typeof shareParseHash === "function" && shareParseHash();
    const showFirstRun = fresh && !shared && !store.get("firstrun:seen", false);
    view.innerHTML = (showFirstRun ? firstRunHTML() : "") + asWelcomeHTML(J);
    asBind();
    if(showFirstRun) firstRunBind();
    return;
  }
  const o = orgGet(), p = wsProfile(), left = J.filter(s => !s.done()).reduce((t, s) => t + (s.min || 0), 0);
  const who = [demo ? "Pixelry" : p && p.org, o.type && orgTypeName(o.type), o.stage && orgStageName(o.stage)].filter(Boolean).join(" · ");
  view.innerHTML = `<div class="ov as">
    <section class="as-head rise">
      <div class="as-ht"><span class="as-eb">${esc(who || "Your organization")}</span><h1>${demo ? "Pixelry's program assessment" : "Your program assessment"}</h1>${typeof helpBtn === "function" ? helpBtn() : ""}</div>
      <div class="as-prog"><span>${next ? `<b>${done.length} of ${J.length} steps done</b> · about ${asMin(left)} left` : `<b>All ${J.length} steps done.</b> Revisit it each quarter.`}</span>
        <span class="as-segs" aria-hidden="true">${J.map(s => `<i class="${s.done() ? "on" : s === next ? "cur" : ""}"></i>`).join("")}</span></div>
    </section>
    <div class="as-grid">
      <div class="as-left">
        ${next ? "" : `<div class="card as-complete"><b>Your assessment is complete.</b><p>Share it with leadership, then work the plan. Retake any step when your products or program change.</p><a class="btn primary" href="#plan">Open your plan ${icon("arrow")}</a><button type="button" class="btn" data-pack="1">Leadership pack</button></div>${typeof nxHTML === "function" ? nxHTML() : ""}`}
        <section class="as-steps" aria-labelledby="as-steps-h"><h2 id="as-steps-h" class="as-h">Your steps</h2>${J.map((s, i) => asStepHTML(s, i, next)).join("")}</section>
      </div>
      <div class="as-right">${asPictureHTML(false)}${typeof revHomeHTML === "function" && revSnaps().length ? revHomeHTML() : ""}${asKnowHTML()}</div>
    </div>
    ${asFootHTML()}
  </div>`;
  asBind();
}
function asBind(){
  if(typeof bindOverviewPicture === "function") bindOverviewPicture();
  view.querySelectorAll('[data-as="start"]').forEach(b => b.onclick = () => { store.set("as:start", true); renderOverview(); focusQuiet(document.querySelector("#view h1")); });
  const big = view.querySelectorAll(".as-big b.mono")[0];
  if(big && typeof countUp === "function" && /^\d/.test(big.textContent)) countUp(big, "as-score");
}

/* ---------- All tools: every tool on its own, plus recent work ---------- */
// Which stage each tool card belongs to, for the filter chips below. A tool keeps growing this
// grid (Red Team Studio's modules among them), so the chips are a cheap way to keep it scannable
const OV_STAGE = {ma:"assess", pm:"assess", cv:"assess", cp:"assess", ds:"assess", tt:"prepare", pol:"prepare", vd:"prepare", mx:"measure", ev:"measure", rt:"ai"};
const OV_STAGE_NAME = {all:"All", assess:"Assess", prepare:"Prepare", measure:"Measure", ai:"AI assistants"};
let ovStage = "all";
function renderTools(){
  const tool = (key, route, color, iconId, name, desc, foot) => `<a class="ov-tool" href="#${route}" style="--c:${color}" data-stage="${OV_STAGE[key] || ""}">
      ${OV_ART[key]}
      <div class="ov-tb"><h4><span class="sb-glyph" style="background:${color}"><svg><use href="#i-${iconId}"/></svg></span>${name}</h4><p>${desc}</p>
        <div class="ov-foot"><span>${foot}</span><svg class="ov-go"><use href="#i-arrow"/></svg></div></div></a>`;
  const items = Object.values(wsItems()).filter(i => KINDS[i.kind]).sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 5);
  view.innerHTML = `<div class="ov">` + head("All tools", `Every tool in the workbench, to use on its own. <a href="#overview">Your assessment</a> runs the main ones in order and ties the results into one picture.`) + `
    ${asInAssessment() ? "" : `<div class="banner"><span>New here? The guided assessment walks you through the main tools in order and ties the results into one picture.</span><a class="btn sm" href="#overview">Take the guided assessment →</a></div>`}
    <div class="segs ov-stagef" role="group" aria-label="Filter by stage">${["all","assess","prepare","measure","ai"].map(k => `<button type="button" data-ovstage="${k}" aria-pressed="${ovStage === k}">${OV_STAGE_NAME[k]}</button>`).join("")}</div>
    <section class="rise">
      <div class="ov-sec-h"><h3>Assess and prepare</h3><span class="note">Free, private, and nothing leaves your browser</span></div>
      <div class="ov-tools">
        ${typeof MA_AREAS !== "undefined" ? tool("ma","maturity","var(--t-ma)","steps","Program maturity","Rate your program in eight areas and get a roadmap for the biggest gaps.",`${MA_AREAS.length} areas · 5 levels`) : ""}
        ${tool("pm","premortem","var(--t-pm)","radar","Abuse pre-mortem","Profile a product and see how it will be misused before launch.",`${HARMS.length} risks · ${REGIONS.length} jurisdictions`)}
        ${typeof CV_AREAS !== "undefined" ? tool("cv","coverage","var(--t-cv)","cover","Coverage radar","See where your products' risk outruns the defenses you have in place.",`${CV_AREAS.length} harm areas · ${CV_LAYERS.length} layers`) : ""}
        ${tool("tt","tabletop","var(--t-tt)","siren","Incident tabletop","Rehearse a crisis and learn from every call, with the law behind it.",`${SCENARIOS.length} scenarios, ${typeof ttVersionCount === "function" ? ttVersionCount() : SCENARIOS.length} versions across ${typeof ALL_TYPES !== "undefined" ? ALL_TYPES.length : 8} sectors`)}
        ${tool("pol","policy","var(--t-pol)","doc","Policy stress-tester","Paste a rule to find vague words, missing exceptions and hard edge cases.","AI-assisted · instant checks")}
        ${typeof CP_PI !== "undefined" ? tool("cp","coppa","var(--t-cp)","coppa","COPPA readiness","Check children's privacy against the amended Rule, with drafts for Legal.",`${CP_PI.length} kinds of data · 4 drafts`) : ""}
        ${typeof DS_CTRL !== "undefined" ? tool("ds","dsa","var(--t-ds)","dsa","DSA readiness","Find which EU Digital Services Act duties apply to you, article by article, with drafts for Legal.",`${DS_CTRL.reduce((n, g) => n + g.items.length, 0)} duties · 4 drafts`) : ""}
        ${tool("vd","vendors","var(--t-vd)","scale","Vendor scorecard","Choose a moderation vendor on evidence, with RFP questions.",`${CRITERIA.length} criteria · 2 minimums`)}
        ${typeof EV_CATS !== "undefined" ? tool("ev","eval","var(--t-ai)","eval","Classifier eval","Build a labeled test set from a rule and see where a moderation classifier fails, with what to change.",`${EV_CATS.length} kinds of hard case · what it gets right and wrong, precision and recall`) : ""}
        ${typeof RT_AREAS !== "undefined" ? tool("rt","redteam","var(--t-rt)","shield","Red team studio <span class=\"wip-tag\">In progress</span>","Test your own AI feature for harm the way real red teams do, one calm step at a time: a target card, tries graded beside an expert rubric, findings an engineer can act on, a week plan, and a one-page summary for the customer who asked whether you red team.",`${RT_AREAS.length} harm areas · drills, findings, exports`) : ""}
        ${tool("mx","metrics","var(--t-mx)","gauge","Metrics framework","A reference for learning: the numbers a T&S program runs on, and how to measure each one.",`${METRICS.length} metrics · ${Object.keys(MX_PLATFORMS).length} sectors`)}
      </div>
    </section>
    ${typeof AI_TOOLS !== "undefined" ? `<section class="rise">
      <div class="ov-sec-h"><h3>AI assistants</h3><span class="note">Run on your own Claude account, only when you click</span></div>
      <div class="ov-ai">${["notice","appeal","transparency"].map(k => `<a class="ov-aic ${AI_TOOLS[k].wip ? "ov-wip" : ""}" href="#${k}" data-stage="ai"><span class="sb-glyph" style="background:${AI_TOOLS[k].wip ? "var(--faint)" : "var(--t-ai)"}"><svg><use href="#${AI_TOOLS[k].icon}"/></svg></span><div><h4>${AI_TOOLS[k].n}${AI_TOOLS[k].wip ? ` <span class="wip-chip">Under construction</span>` : ""}</h4><p>${esc(AI_TOOLS[k].desc)}</p></div><svg class="ov-go"><use href="#i-arrow"/></svg></a>`).join("")}</div>
    </section>` : ""}
    ${typeof templateItems === "function" ? `<section class="rise">
      <div class="ov-sec-h"><h3>Start from a template</h3><span class="note">Pre-fills your workspace, then lands on your assessment</span></div>
      <div class="tpl-grid">${templateItems().map((t, i) => `<button type="button" class="tpl-card" data-tplgo="${i}"><b>${esc(t.n)}</b><small>${esc(t.d)}</small></button>`).join("")}</div>
    </section>` : ""}
    <section class="rise">
      <div class="ov-sec-h"><h3>Learn</h3><span class="note">Guides, drills and a glossary. Progress saved in your browser</span></div>
      <div class="ov-ai">
        <a class="ln-aic ov-aic" href="#redteamllm"><span class="sb-glyph" style="background:var(--t-ai)"><svg><use href="#i-shield"/></svg></span><div><h4>Red teaming LLMs <span class="wip-tag">In progress</span></h4><p>The method in nine steps, eleven drills to run with your team, worksheets and sources.</p></div><svg class="ov-go"><use href="#i-arrow"/></svg></a>
        <a class="ln-aic ov-aic" href="#redteamworld"><span class="sb-glyph" style="background:#E0532F"><svg><use href="#i-monitor"/></svg></span><div><h4>Red teaming world models <span class="wip-tag">In progress</span></h4><p>Video, image-to-video and interactive worlds: uploads, scene steering, style, provenance. Twelve drills.</p></div><svg class="ov-go"><use href="#i-arrow"/></svg></a>
        <a class="ln-aic ov-aic" href="#glossary"><span class="sb-glyph" style="background:var(--accent)"><svg><use href="#i-book"/></svg></span><div><h4>Glossary and practice <span class="wip-tag">In progress</span></h4><p>The terms in plain words, with flashcards and a quiz.</p></div><svg class="ov-go"><use href="#i-arrow"/></svg></a>
        ${typeof TSG_TERMS !== "undefined" ? `<a class="ln-aic ov-aic" href="#tsglossary"><span class="sb-glyph" style="background:var(--accent)"><svg><use href="#i-book"/></svg></span><div><h4>T&amp;S glossary</h4><p>${TSG_TERMS.length} everyday Trust and Safety terms, from strike to statement of reasons, in plain words.</p></div><svg class="ov-go"><use href="#i-arrow"/></svg></a>` : ""}
      </div>
    </section>
    <section class="rise">
      <div class="ov-sec-h"><h3>Jump back in</h3><a href="#workspace">View workspace</a></div>
      <div class="ov-list">${items.length ? items.map(it => `<button type="button" class="ov-row" data-open="${esc(it.id)}">
          <span class="ov-tile" style="background:color-mix(in oklab, ${TOOL_COLOR[it.kind]} 14%, transparent);color:${TOOL_COLOR[it.kind]}"><svg><use href="#${KINDS[it.kind].icon}"/></svg></span>
          <span style="min-width:0"><b>${esc(it.title || "Untitled")}</b><small>${KINDS[it.kind].n}${it.projectId && projName(it.projectId) ? " · " + esc(projName(it.projectId)) : ""}</small></span>
          ${ovChip(it)}<span class="when">${relTime(it.updated)}</span></button>`).join("")
        : `<div class="ov-empty"><b style="color:var(--ink)">Nothing saved yet</b><span>Results you save from any tool appear here, so you can pick up where you left off.</span></div>`}</div>
    </section>
    ${asFootHTML()}
  </div>`;
  view.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openSaved(b.dataset.open));
  const ovApplyStage = () => view.querySelectorAll("[data-stage]").forEach(el => { el.hidden = ovStage !== "all" && el.dataset.stage !== ovStage; });
  ovApplyStage();
  view.querySelectorAll("[data-ovstage]").forEach(b => b.onclick = () => { ovStage = b.dataset.ovstage;
    view.querySelectorAll("[data-ovstage]").forEach(x => x.setAttribute("aria-pressed", x === b)); ovApplyStage(); });
  view.querySelectorAll("[data-tplgo]").forEach(b => b.onclick = () => templateItems()[+b.dataset.tplgo].run());
}

/* ---------- Guided steps: the strip across the top ---------- */
const AS_BACK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const asInAssessment = () => typeof JOURNEY !== "undefined" && (JOURNEY.some(s => s.done()) || !!store.get("as:start", false));
// Where this step sits in the assessment, or just this tool when someone uses it on its own.
// A tool that isn't one of the six steps (the policy test) shows as the optional part
function asStepBar(k, pct, help){
  k = k === "tabletop" ? "crisis" : k === "plan" ? "act" : k;
  const J = typeof JOURNEY !== "undefined" ? JOURNEY : [], i = J.findIndex(s => s.k === k), inAs = asInAssessment() && (i >= 0 || k === "policy");
  const name = i >= 0 ? J[i].n : (typeof ROUTE_LABEL !== "undefined" && ROUTE_LABEL[k]) || "", seq = inAs && i >= 0;
  return `<div class="asb"><a class="asb-back" href="#${inAs ? "overview" : "tools"}">${AS_BACK}${inAs ? "Your assessment" : "All tools"}</a>
    <div class="asb-mid"><span>${seq ? `Step ${i + 1} of ${J.length} · ` : inAs ? "Optional · " : ""}<b>${esc(name)}</b></span>
      ${pct === null ? "" : `<span class="asb-segs" aria-hidden="true">${seq ? J.map((s, j) => `<i><b style="width:${j === i ? pct : s.done() ? 100 : 0}%"></b></i>`).join("") : `<i class="solo"><b style="width:${pct}%"></b></i>`}</span>`}</div>
    <span class="asb-r"><span class="asb-saved">${icon("check")}Saved as you go</span>${help && typeof helpBtn === "function" ? helpBtn() : ""}</span></div>`;
}

// How far along a tool is, for the strip. Null means the tool isn't one of the assessment's steps
function asRoutePct(r){
  try{
    if(r === "premortem") return pm.stage === "report" ? 100 : pm.stage === "ask" ? Math.round(pm.qi / Math.max(1, visibleQs().length) * 100) : Object.values(wsItems()).some(it => it.kind === "premortem") ? 100 : 0;
    if(r === "tabletop"){ if(typeof ttf !== "undefined" && ttf && ttf.phase){ const n = ttScenario(ttf.s, ttf.v).steps.length; return ttf.phase === "setup" ? 0 : ttf.phase === "debrief" ? 100 : Math.round(ttf.step / n * 100); }
      if(tt){ const n = ttScenario(tt.s, tt.v).steps.length; return Math.round(Math.min(tt.step, n) / n * 100); } return Object.keys(ttProgress()).length ? 100 : 0; }
    if(r === "policy") return pol.heur && pol.view !== "setup" ? 100 : 0;
    if(r === "maturity") return maAllRated(ma) ? 100 : Math.round(MA_AREAS.filter(a => ma.lv[a.k]).length / MA_AREAS.length * 100);
    if(r === "coverage"){ const s = cvSummary(cv); return Math.round(s.rated / Math.max(1, s.total) * 100); }
    if(r === "coppa") return cp.view === "report" && cp.aud ? 100 : cp.aud ? 50 : 0;
    if(r === "dsa") return ds.view === "report" && ds.tier ? 100 : ds.tier ? 50 : 0;
    if(r === "eval") return ev.preds ? 100 : ev.cases.length ? 66 : ev.policy ? 33 : 0;
    if(r === "transparency") return tr.view === "report" ? 100 : Math.round(trProgress().pct / 2);
  }catch(e){}
  return null;
}
