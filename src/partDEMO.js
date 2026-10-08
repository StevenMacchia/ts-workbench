/* =========================================================
   DEMO COMPANY: one click fills every tool with Pixelry, a fictional photo and short-video app,
   so a visitor sees the whole program in a few minutes. The visitor's own work is set aside
   in this browser and comes back, untouched, when they exit the demo.
   ========================================================= */
const DEMO_BACKUP = "tswbdemo:backup";
// Browser preferences stay put; everything else in the workspace is swapped out
const DEMO_KEEP = ["tswb:theme", "tswb:pol:info"];
const demoOn = () => !!store.get("demo", false);
function demoKeys(){ const ks = []; try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && k.startsWith("tswb:")) ks.push(k); } }catch(e){} return ks; }
function demoReload(){ try{ history.replaceState(null, "", location.pathname + location.search + "#overview"); }catch(e){} location.reload(); }
function demoStart(){
  if(demoOn()){ goRoute("overview"); return demoWelcome(); }
  try{
    const backup = {}; demoKeys().forEach(k => { backup[k] = localStorage.getItem(k); });
    localStorage.setItem(DEMO_BACKUP, JSON.stringify(backup));
    demoKeys().filter(k => !DEMO_KEEP.includes(k)).forEach(k => localStorage.removeItem(k));
    store.set("demo", true); store.set("demo:pending", true); store.set("demo:welcome", true);
  }catch(e){ return gsay("This browser blocked the demo"); }
  demoReload();
}
function demoExit(){
  try{
    const raw = localStorage.getItem(DEMO_BACKUP), backup = raw ? JSON.parse(raw) : {};
    demoKeys().filter(k => !DEMO_KEEP.includes(k)).forEach(k => localStorage.removeItem(k));
    Object.entries(backup).forEach(([k, v]) => { if(k.startsWith("tswb:") && !DEMO_KEEP.includes(k) && typeof v === "string") localStorage.setItem(k, v); });
    localStorage.removeItem(DEMO_BACKUP);
  }catch(e){ return gsay("This browser blocked restoring your work"); }
  demoReload();
}
// Pixelry's three products, and how far each is through its launch plan: [preset, display name, every nth safeguard left undone]
const DEMO_PRODUCTS = [["teen_social", "Pixelry app", 3], ["creator", "Pixelry Creator Subscriptions", 2], ["marketplace", "Pixelry Market", 4]];
const DEMO_REGIONS = ["us", "eu", "uk"];
// The four social-sector tabletop scenarios Pixelry has rehearsed, and its best "strong calls on first try" count out of four for each
const DEMO_CRISIS_BEST = [4, 3, 3, 2];
const DEMO_POLICY_RULE = "Users must not harass, bully or intimidate other users. Content that is abusive or offensive will be removed.";
// Same maths as cvRisk()'s cv.src === "all" branch (worst score per harm area across every saved pre-mortem), applied
// directly to Pixelry's three products instead of through ovSavedPMs(). cvRisk() reads the real workspace, so a pure
// preview can't call it without depending on (and risking drifting from) whatever the visitor has saved themselves.
function demoCoverageScore(products){
  const worst = rs => { const out = {}; CV_AREAS.forEach(a => { const w = rs.filter(x => a.cats.includes(x.cat)).sort((x, y) => y.score - x.score)[0]; out[a.k] = w ? w.score : 0; }); return out; };
  const per = products.map(p => worst(p.r.risks));
  const rows = CV_AREAS.map(a => {
    const r = CV_EXAMPLE.r[a.k] || {}, cov = Math.round(CV_LAYERS.reduce((s, l) => s + (r[l.k] || 0), 0) / (CV_LAYERS.length * 3) * 100);
    return {cov, score:Math.max(0, ...per.map(p => p[a.k]))};
  });
  const withRisk = rows.filter(x => x.score > 0), weight = withRisk.reduce((s, x) => s + x.score, 0);
  return weight ? Math.round(withRisk.reduce((s, x) => s + x.cov * x.score, 0) / weight) : Math.round(rows.reduce((s, x) => s + x.cov, 0) / rows.length);
}
// Pixelry's whole program, computed once: the exact numbers demoFill() writes to the real workspace, and the exact
// numbers the home page's preview reads, from one pure function neither can drift from. Touches no store.
function demoProgram(){
  const day = 864e5;
  const ma = maExample(); ma.ex = false; ma.stage = "growth"; ma.stageSet = true;
  const maT = maStage(ma).t;
  const maturityScore = Math.round(MA_AREAS.reduce((s, a) => s + Math.min(maLevelOf(ma, a.k), maT[a.k]) / maT[a.k], 0) / MA_AREAS.length * 100);

  const products = DEMO_PRODUCTS.map(([k, name, every], n) => {
    const pm = fromPreset(k); Object.assign(pm, {example:false, name, id:null, saved:false, regions:DEMO_REGIONS.slice()});
    const r = assess(pm), done = {};
    r.safeguards.filter(s => s.rank >= 2).forEach((s, i) => { if(i % every) done[s.id] = true; });
    pm.done = done;
    return {key:k, name, every, pm, r, agedBy:(3 - n) * 6 * day};
  });
  let want = 0, got = 0;
  products.forEach(p => p.r.safeguards.filter(s => s.rank >= 2).forEach((s, i) => { const w = s.rank === 3 ? 2 : 1; want += w; if(i % p.every) got += w; }));
  const launchScore = want ? Math.round(got / want * 100) : null;
  const flagship = products[0];
  const topAction = flagship.r.safeguards.filter(s => !flagship.pm.done[s.id]).sort((a, b) => b.rank - a.rank || b.critCovers - a.critCovers || b.covers.length - a.covers.length)[0];

  const cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); Object.assign(cv, {ex:false, est:false, src:"all"});
  const coverageScore = demoCoverageScore(products);

  const soc = SCENARIOS.map((s, i) => i).filter(i => (SCENARIOS[i].types || []).includes("social")).slice(0, DEMO_CRISIS_BEST.length);
  const ttProg = {}; soc.forEach((i, j) => ttProg[ttKey(i, "social")] = {best:DEMO_CRISIS_BEST[j], runs:[2, 1, 1, 1][j], last:Date.now() - [9, 23, 41, 64][j] * day});
  const runs = soc.map((i, j) => DEMO_CRISIS_BEST[j] / SCENARIOS[i].steps.length), perf = runs.reduce((s, x) => s + x, 0) / runs.length;
  const crisisScore = Math.round(perf * (0.7 + 0.3 * Math.min(1, runs.length / 4)) * 100);

  const pol = Object.assign(POL_BLANK(), {company:"Pixelry", type:"social", youth:"teens", regions:DEMO_REGIONS.slice(), enforce:["reports", "auto", "humans"], actions:["remove", "warn", "suspend", "ban"],
    rule:DEMO_POLICY_RULE,
    product:"Pixelry is a photo and short-video app for 13 to 25-year-olds, with public profiles, comments, DMs and live streams. Creators sell subscriptions and items through Pixelry Market.",
    concerns:"Pile-ons in the comments when a creator's post goes viral. 'Rate me' posts that invite insults about appearance. Whether repeated one-word insults count as harassment."});
  pol.heur = polHeuristics(pol.rule); pol.ts = Date.now(); pol.view = "report";
  const policyScore = pol.heur.score;

  const ds = typeof DS_EXAMPLE !== "undefined" ? Object.assign(DS_BLANK(), JSON.parse(JSON.stringify(DS_EXAMPLE)), {ex:false, view:"report"}) : null;
  const dsSor = ds ? dsScore(ds, dsCtx(ds)).reqs.find(req => req.k === "n_sor") : null;

  const parts = [
    {k:"maturity", n:"Program maturity", score:maturityScore},
    {k:"coverage", n:"Harm coverage", score:coverageScore},
    {k:"launch", n:"Launch readiness", score:launchScore},
    {k:"crisis", n:"Crisis readiness", score:crisisScore},
    {k:"policy", n:"Policy clarity", score:policyScore}
  ];
  return {ma, products, cv, ttProg, pol, ds, parts, topAction, dsSor};
}
// Pixelry's program: a quarter into its maturity plan, three products partway through launch, coverage mapped, crises rehearsed
function demoFill(){
  const day = 864e5, iso = n => new Date(Date.now() + n * day).toISOString().slice(0, 10);
  orgSet({type:"social", stage:"growth", regions:DEMO_REGIONS.slice(), confirmed:true});
  store.set("ws:profile", {name:"Alex Rivera", role:"Head of Trust & Safety", org:"Pixelry"});
  const d = demoProgram();
  ma = d.ma; maSave();
  wsSaveTool("maturity", ma, "Pixelry program maturity");
  d.products.forEach(p => {
    pm = p.pm; saveToLib();
    const lib = libLoad(); if(lib[pm.id]){ lib[pm.id].updated = Date.now() - p.agedBy; libSave(lib); }
  });
  pm.stage = "start"; savePM();
  cv = d.cv; cvSave();
  wsSaveTool("coverage", cv, "Pixelry coverage");
  mx = {platform:"social", stage:"2", reg:true, have:{}, vals:{}, read:{}, hist:[]}; mxLoadDemo(mxList());
  mx.read = {"Violating-content prevalence":true, "Unsafe-contact rate for minors":true, "Harmful reach before action":true}; store.set("mx", mx);
  store.set("tt:progress", d.ttProg);
  pol = d.pol; savePol();
  wsSaveTool("policy", pol, "Policy: Harassment");
  store.set("rc:hist", [{d:iso(-90), s:44}, {d:iso(-60), s:50}, {d:iso(-30), s:56}]);
  // The DSA readiness check, partway there
  if(d.ds){ ds = d.ds; dsSave(); wsSaveTool("dsa", ds, "DSA readiness: Pixelry"); }
  // Last year's DSA transparency report, ready to review
  if(typeof TR_EXAMPLE !== "undefined"){ tr = Object.assign(TR_BLANK(), JSON.parse(JSON.stringify(TR_EXAMPLE)), {view:"report"}); trSave(); wsSaveTool("transparency", tr, "Transparency report: Pixelry 2025"); }
}

/* ---------- Home page preview: real outputs from Pixelry's example data, read-only, never saved to your workspace ---------- */
// Thin wrappers over demoProgram(), kept as named exports so the report-card maths (rcOverall) and tests can call
// them directly; each call recomputes the same pure program, so there is no state to drift.
const demoParts = () => demoProgram().parts;
const demoTopAction = () => demoProgram().topAction;
// "Online Safety Act: illegal harms duties" -> "UK Online Safety Act, illegal harms duties"
function demoLawLabel(name){
  const obl = typeof OBL !== "undefined" && OBL.find(o => o.law === name);
  return `${obl ? obl.r.toUpperCase() + " " : ""}${name.replace(": ", ", ")}`;
}
// Three real outputs a visitor would see after running the demo, computed live from the example data: never hard-coded, never saved
function demoPreviewHTML(){
  if(typeof rcOverall !== "function" || typeof dsScore !== "function" || typeof dsCtx !== "function" || typeof DS_EXAMPLE === "undefined") return "";
  const d = demoProgram(), o = rcOverall(d.parts), gr = rcGrade(o.score), top = d.topAction;
  const law = top && top.legal === "applies" && top.laws && top.laws[0];
  // Trim the action at the comma-clause that explains why ("...with reasons that match your policies"), keep the what
  const action = top ? asLow(top.t.replace(/\.$/, "").replace(/,\s*(with|so that|so)\s[\s\S]*$/, "")) : "";
  const lines = [
    `Overall <b>${o.score}</b> / 100, grade ${esc(gr[1])}, ${o.graded === o.total ? `all ${o.total}` : `${o.graded} of ${o.total}`} parts done.`,
    top ? `First thing to fix: ${esc(action)}${law ? ` (${esc(demoLawLabel(law))})` : ""}.` : "",
    d.dsSor ? `DSA statement of reasons: ${d.dsSor.met ? "in place" : "not yet in place"} (Article 17).` : ""
  ].filter(Boolean);
  if(!lines.length) return "";
  return `<section class="as-preview rise" aria-label="From the example company, Pixelry">
    <p class="as-preview-lead">From the example company, Pixelry:</p>
    <ul class="as-preview-lines">${lines.map(l => `<li>${l}</li>`).join("")}</ul>
    <button type="button" class="ov-link" data-demo="start">See the whole picture ${icon("arrow")}</button>
  </section>`;
}
if(demoOn() && store.get("demo:pending", false)){ try{ demoFill(); }catch(e){} store.set("demo:pending", false); }

/* ---------- "Demo: Pixelry · Exit demo" in the top bar, on every page and screen size ---------- */
const DEMO_PILL = `<button type="button" class="tb-demo-t" data-demo="about" title="About the demo"><i aria-hidden="true"></i><span>Demo<span class="tb-demo-co">: Pixelry</span></span></button><button type="button" class="tb-demo-x" data-demo="exit">Exit demo</button>`;
function demoBar(){
  let pill = document.getElementById("tb-demo");
  if(!demoOn()){ if(pill) pill.remove(); return; }
  const acts = document.querySelector(".topbar .tb-actions"); if(!acts || pill) return;
  pill = document.createElement("div"); pill.id = "tb-demo"; pill.className = "tb-demo"; pill.setAttribute("role", "group"); pill.setAttribute("aria-label", "Demo company");
  pill.innerHTML = DEMO_PILL; acts.insertBefore(pill, acts.firstChild);
}
demoBar();

/* ---------- the welcome that opens the demo: what it is, where to exit, and the tour ---------- */
function demoWelcome(){
  if(!demoOn() || document.getElementById("dm-welcome")) return;
  if(tourAt >= 0) tourEnd();
  if(typeof helpOfferClose === "function") helpOfferClose();
  const bg = document.createElement("div"); bg.className = "tk-bg dm-bg"; bg.id = "dm-welcome";
  bg.innerHTML = `<div class="tk dm" role="dialog" aria-modal="true" aria-labelledby="dm-h" aria-describedby="dm-d">
    <span class="eyebrow">Demo company</span>
    <h3 id="dm-h">You're exploring Pixelry</h3>
    <p id="dm-d">Pixelry is a fictional photo and short-video app with about 8 million users in the US, EU and UK. Every tool is filled in with its sample data, so you can see a whole safety program at once.</p>
    <div class="dm-exit"><div class="dm-exit-t"><b>Leave any time</b><span>Use <b>Exit demo</b> at the top of the page. Your own work is set aside in this browser and comes back untouched.</span></div><span class="tb-demo dm-sample" aria-hidden="true"><span class="tb-demo-t"><i></i><span>Demo<span class="tb-demo-co">: Pixelry</span></span></span><span class="tb-demo-x">Exit demo</span></span></div>
    <div class="dm-a"><button type="button" class="btn primary" data-dm="tour">Take the tour ${icon("arrow")}</button><button type="button" class="btn" data-dm="explore">Explore on my own</button></div>
    <p class="dm-small">The tour takes about a minute and stays on the Overview.</p>
  </div>`;
  document.body.appendChild(bg);
  const b = bg.querySelector('[data-dm="tour"]'); if(b) b.focus();
}
function demoWelcomeClose(next){
  const bg = document.getElementById("dm-welcome"); if(!bg) return;
  bg.remove();
  if(typeof helpOfferClose === "function") helpOfferClose();
  if(next === "tour") return tourStart();
  // Point at the exit, so people know where it lives
  const pill = document.getElementById("tb-demo");
  if(pill){ pill.classList.remove("hi"); void pill.offsetWidth; pill.classList.add("hi"); setTimeout(() => pill.classList.remove("hi"), 3200); }
  const h = document.querySelector("#view h1"); if(h && typeof focusQuiet === "function") focusQuiet(h);
}

/* ---------- a short guided tour of the overview ---------- */
const TOUR = [
  [".as-head", "Pixelry's assessment", "A fictional social app, most of the way through. Everything you see is sample data."],
  [".as-steps", "Guided steps", "Each finished step shows what it found. Review opens that tool with Pixelry's answers, and the last step is up next."],
  [".as-pic", "The program picture", "One score out of 100, each part graded, and three radars: launch risk, maturity and coverage. Click any of them to open that tool."],
  [".as-know", "What the assessment found", "The most important finding from each step, in plain words."],
  ["#tb-demo", "Exit when you're ready", "Use Exit demo up here to leave. Your own work comes back untouched, and you can start on your own program."]
];
let tourAt = -1, tourSteps = TOUR;
// Any page's walkthrough uses the same engine
function tourRun(steps){ tourSteps = steps; tourStep(0); }
function tourEnd(){
  tourAt = -1;
  document.querySelectorAll(".tour-on").forEach(el => el.classList.remove("tour-on"));
  const p = document.getElementById("tour-pop"); if(p) p.remove();
}
function tourStep(i){
  const steps = tourSteps.filter(([s]) => document.querySelector(s)), demoTour = tourSteps === TOUR;
  if(i < 0 || i >= steps.length) return tourEnd();
  document.querySelectorAll(".tour-on").forEach(el => el.classList.remove("tour-on"));
  tourAt = i;
  const [sel, title, text] = steps[i], el = document.querySelector(sel);
  el.classList.add("tour-on");
  window.scrollTo(0, i === 0 && demoTour ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY - 96));
  let p = document.getElementById("tour-pop");
  if(!p){ p = document.createElement("div"); p.id = "tour-pop"; p.className = "tour-pop"; document.body.appendChild(p); }
  p.dataset.kind = "tour"; p.setAttribute("role", "dialog"); p.setAttribute("aria-labelledby", "tour-h"); p.tabIndex = -1;
  const last = i === steps.length - 1;
  p.innerHTML = `<div class="tour-top"><span class="tour-n">${i + 1} of ${steps.length}</span><button type="button" class="tour-x" data-tour="end" aria-label="Close the tour">${icon("x")}</button></div>
    <h3 id="tour-h">${title}</h3><p>${text}</p>
    <div class="tour-a">${i ? `<button type="button" class="btn sm" data-tour="back">Back</button>` : `<span></span>`}
      ${last ? `<span class="tour-last">${demoTour ? `<a class="btn sm" href="#maturity" data-tour="end">Open Program maturity</a>` : ""}<button type="button" class="btn sm primary" data-tour="end">Done</button></span>` : `<button type="button" class="btn sm primary" data-tour="next">Next ${icon("arrow")}</button>`}</div>`;
  p.focus({preventScroll:true});
}
function tourStart(){
  tourSteps = TOUR;
  if((location.hash || "#overview").slice(1).split("/")[0] !== "overview"){ goRoute("overview"); return setTimeout(() => tourStep(0), 250); }
  tourStep(0);
}
document.addEventListener("click", e => {
  const d = e.target.closest && e.target.closest("[data-demo]");
  if(d){ e.preventDefault(); const a = d.dataset.demo; return a === "start" ? demoStart() : a === "exit" ? demoExit() : a === "about" ? demoWelcome() : tourStart(); }
  const w = e.target.closest && e.target.closest("[data-dm]");
  if(w){ e.preventDefault(); return demoWelcomeClose(w.dataset.dm); }
  const t = e.target.closest && e.target.closest("[data-tour]"); if(!t) return;
  const a = t.dataset.tour; if(a === "next") return tourStep(tourAt + 1); if(a === "back") return tourStep(tourAt - 1);
  tourEnd();
});
document.addEventListener("keydown", e => {
  const dm = document.getElementById("dm-welcome");
  if(dm){
    if(e.key === "Escape"){ e.preventDefault(); return demoWelcomeClose("explore"); }
    if(e.key === "Tab"){ const f = [...dm.querySelectorAll("button")]; const i = f.indexOf(document.activeElement);
      if(e.shiftKey && i <= 0){ e.preventDefault(); f[f.length - 1].focus(); } else if(!e.shiftKey && i === f.length - 1){ e.preventDefault(); f[0].focus(); } }
    return;
  }
  const offer = document.getElementById("tour-pop");
  if(e.key === "Escape" && offer && offer.dataset.kind === "offer" && typeof helpOfferClose === "function") return helpOfferClose();
  if(e.key === "Escape" && tourAt >= 0) tourEnd();
});
// The quick-tour offer sits in the middle of the screen: a click outside it dismisses it and does nothing else
document.addEventListener("click", e => {
  const p = document.getElementById("tour-pop");
  if(!p || p.dataset.kind !== "offer" || p.contains(e.target) || document.getElementById("dm-welcome") || typeof helpOfferClose !== "function") return;
  e.preventDefault(); e.stopPropagation(); helpOfferClose();
}, true);
if(window.addEventListener) window.addEventListener("hashchange", () => { if(tourAt >= 0) tourEnd(); demoBar(); });
// The welcome opens once, straight after the demo loads (demo:tour is the flag older links set)
if(demoOn() && (store.get("demo:welcome", false) || store.get("demo:tour", false))){ store.set("demo:welcome", false); store.set("demo:tour", false); setTimeout(demoWelcome, 300); }
