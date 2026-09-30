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
// Pixelry's program: a quarter into its maturity plan, three products partway through launch, coverage mapped, crises rehearsed
function demoFill(){
  const day = 864e5, iso = n => new Date(Date.now() + n * day).toISOString().slice(0, 10);
  orgSet({type:"social", stage:"growth", regions:["us", "eu", "uk"], confirmed:true});
  store.set("ws:profile", {name:"Alex Rivera", role:"Head of Trust & Safety", org:"Pixelry"});
  ma = maExample(); ma.ex = false; ma.stage = "growth"; ma.stageSet = true; maSave();
  wsSaveTool("maturity", ma, "Pixelry program maturity");
  [["teen_social", "Pixelry app", 3], ["creator", "Pixelry Creator Subscriptions", 2], ["marketplace", "Pixelry Market", 4]].forEach(([k, name, every], n) => {
    pm = fromPreset(k); Object.assign(pm, {example:false, name, id:null, saved:false, regions:["us", "eu", "uk"]});
    assess(pm).safeguards.filter(s => s.rank >= 2).forEach((s, i) => { if(i % every) pm.done[s.id] = true; });
    saveToLib();
    const lib = libLoad(); if(lib[pm.id]){ lib[pm.id].updated = Date.now() - (3 - n) * 6 * day; libSave(lib); }
  });
  pm.stage = "start"; savePM();
  cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); Object.assign(cv, {ex:false, est:false, src:"all"}); cvSave();
  wsSaveTool("coverage", cv, "Pixelry coverage");
  mx = {platform:"social", stage:"2", reg:true, have:{}, vals:{}, read:{}, hist:[]}; mxLoadDemo(mxList());
  mx.read = {"Violating-content prevalence":true, "Unsafe-contact rate for minors":true, "Harmful reach before action":true}; store.set("mx", mx);
  const prog = {}, soc = SCENARIOS.map((s, i) => i).filter(i => (SCENARIOS[i].types || []).includes("social")).slice(0, 4);
  soc.forEach((i, j) => prog[ttKey(i, "social")] = {best:[4, 3, 3, 2][j], runs:[2, 1, 1, 1][j], last:Date.now() - [9, 23, 41, 64][j] * day});
  store.set("tt:progress", prog);
  pol = Object.assign(POL_BLANK(), {company:"Pixelry", type:"social", youth:"teens", regions:["us", "eu", "uk"], enforce:["reports", "auto", "humans"], actions:["remove", "warn", "suspend", "ban"],
    rule:"Users must not harass, bully or intimidate other users. Content that is abusive or offensive will be removed.",
    product:"Pixelry is a photo and short-video app for 13 to 25-year-olds, with public profiles, comments, DMs and live streams. Creators sell subscriptions and items through Pixelry Market.",
    concerns:"Pile-ons in the comments when a creator's post goes viral. 'Rate me' posts that invite insults about appearance. Whether repeated one-word insults count as harassment."});
  pol.heur = polHeuristics(pol.rule); pol.ts = Date.now(); pol.view = "report"; savePol();
  wsSaveTool("policy", pol, "Policy: Harassment");
  store.set("rc:hist", [{d:iso(-90), s:44}, {d:iso(-60), s:50}, {d:iso(-30), s:56}]);
  // Last year's DSA transparency report, ready to review
  if(typeof TR_EXAMPLE !== "undefined"){ tr = Object.assign(TR_BLANK(), JSON.parse(JSON.stringify(TR_EXAMPLE)), {view:"report"}); trSave(); wsSaveTool("transparency", tr, "Transparency report: Pixelry 2025"); }
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
