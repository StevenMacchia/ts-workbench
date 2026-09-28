/* ---------- Page walkthroughs, "welcome back" and plain-English terms ---------- */
// A short tour for each page, offered once on the first visit and replayable from "How this page works".
// Each step points at a real part of the page; a step whose element isn't on screen is skipped.
const PAGE_TOURS = {
  overview:[
    [".ov-greet", "Your home base", "Everything you save in any tool comes together here. Your work stays in this browser."],
    [".ov-demo", "See it filled in first", "Open a demo company to see every tool with sample data. Your own work is set aside until you exit."],
    [".jn", "The program review", "The recommended path through the tools, one step at a time. Each tool hands off to the next one."],
    [".rc", "The report card", "Your program graded out of 100 as you use the tools, with one tip to raise the weakest part."],
    [".ov-tools", "Every tool", "Open any tool on its own. Each page has a “How this page works” button if you want a tour again."]
  ],
  premortem:[
    [".card.hero", "Assess a product or feature", "Answer 12 plain-language questions about what you're building and who uses it. It takes about 3 minutes, and no Trust & Safety background is needed."],
    [".pm-cur", "What you'll get", "A report like this one: the risks that apply and how serious each one is, the launch blockers, and the laws likely to apply in your markets."],
    [".exgrid", "Or start from an example", "Open a finished assessment for a common kind of product to see the whole report before you answer anything."]
  ],
  tabletop:[
    [".ttbar", "Pick your company type", "Scenarios are tailored to the kind of company you choose. Your progress across all of them shows here."],
    [".tt-mode", "Play solo or with your team", "Solo gives you feedback after every call. Team mode adds roles, a timer for each decision, discussion prompts and a full-screen presenter view."],
    [".scen-grid", "Choose a scenario", "Each one is four timed decisions as an incident unfolds. A weaker choice shows what happens next and what strong incident command looks like."]
  ],
  metrics:[
    [".mxm-filter", "Fit the list to you", "Choose your platform and program stage, and whether EU or UK rules apply. The list reorders so the metrics that matter most come first."],
    [".mx-tabs", "Four views", "Metrics is the framework. My scorecard holds your own numbers, trends and a one-pager for leadership. Data to log and Running the program cover the practical side."],
    [".mxm-band", "Start with the north stars", "Open any metric to see the question it answers, the formula, how to measure it on your platform and starter SQL."]
  ],
  vendors:[
    [".vd-weights", "Say what matters", "Set how much each criterion counts, or start from a preset. Weights add up to 100."],
    [".vd-names", "Name your vendors", "Compare two to four vendors side by side."],
    [".vd-crit", "Score with a rubric", "Rate each vendor from 1 to 5. The rubric says what each score looks like, and the RFP questions tell you what to ask first."],
    [".vd-railc", "Watch the result", "The ranking updates as you score. The highest weighted score wins, unless a vendor fails a minimum."]
  ],
  maturity:[
    [".vd-main > .mxa-part:first-of-type", "Set your stage", "Targets depend on your company's size and how regulated you are, so start here."],
    [".ma-areas", "Rate each area", "Eight areas of a Trust & Safety program. Pick the level that matches your program today, one area at a time."],
    [".vd-railc", "Your profile", "Your radar and score update as you rate."],
    [".vd-main > .mxa-part:last-of-type", "Work the plan", "A phased roadmap for your biggest gaps. Tick off steps as you finish them, add due dates to your calendar or send the plan to your tracker."]
  ],
  coverage:[
    [".vd-main > .mxa-part:first-of-type", "Choose the risk to compare", "Your products' combined risk, one product, or an example. Product risk comes from your pre-mortems."],
    [".vd-main > .mxa-part:nth-of-type(2)", "Rate your defenses", "For each kind of harm, rate how strong each layer of defense is today."],
    [".vd-railc", "Risk against coverage", "The radar shows where risk outruns your defenses, and updates as you rate."],
    [".vd-main > .mxa-part:last-of-type", "Close the biggest gaps", "The gaps in order, with the next step for each."]
  ],
  policy:[
    [".pol-card", "Your rule", "Paste the policy rule you want to test, or start from one of the examples."],
    [".pol-co", "Your platform", "Add your company or product and what it does, so the test fits how people use it."],
    [".pol-runbar", "Run the test", "Instant checks run in your browser straight away. Claude's review, where available, adds edge cases, gaps, enforcement risks and a rewrite."],
    [".pol-info", "How it works", "What each check looks for, and how the tool was built."]
  ],
  notice:[
    [".ai-form", "Describe the case", "Fill in what happened and what you decided. “Fill in an example” shows the kind of detail that helps."],
    [".ai-act", "Draft the notice", "Claude drafts it on your own Claude account, only when you click. You can see an example result first."],
    [".ai-about", "How this works", "What the assistant does, what it checks, and what stays with a person."]
  ],
  appeal:[
    [".ai-form", "Describe the appeal", "Add the rule that was applied, the original decision, the content and what the user said."],
    [".ai-act", "Review it", "Claude reviews it on your own Claude account, only when you click. You can see an example result first."],
    [".ai-about", "How this works", "What the assistant checks, and why a person still makes the final call."]
  ],
  transparency:[
    [".pol-card", "Your service", "Name the service and choose what kind it is under the DSA. The sections you need depend on it."],
    [".pol-setup > .pol-card:nth-of-type(2)", "Fill in each section", "Each section maps to an article of the DSA and asks only for the numbers it requires."],
    [".pol-runbar", "Check and build", "The meter shows what's still missing. Build the report when you're ready, with a checklist and a summary."]
  ],
  workspace:[
    [".wsprofile", "Your profile", "Your name and role, shown on your workspace and in exported files."],
    [".org-card", "Your organization", "Company type, stage and regions. Every tool uses them to pre-fill its questions."],
    [".projgrid", "Projects", "Group saved work by product or launch."],
    [".sb-sync", "Keep a copy", "Your work lives in this browser. Save a workspace file to back it up or open it on another device."]
  ]
};
const helpRoute = () => (location.hash || "#overview").slice(1).split("/")[0] || "overview";
// Screenshots and automated checks run without tips
const helpQuiet = () => /[?&]shot=/.test(location.search || "");
function helpBtn(){ return PAGE_TOURS[helpRoute()] ? `<button type="button" class="ph-help" data-help="tour">${icon("info")}How this page works</button>` : ""; }
function helpTour(r){
  r = r || helpRoute(); const steps = PAGE_TOURS[r];
  if(!steps || !steps.some(([s]) => document.querySelector(s))) return gsay("This page doesn't have a tour");
  tourRun(steps);
}
function helpOfferClose(){ const p = document.getElementById("tour-pop"); if(p && p.dataset.kind === "offer") p.remove(); }
function helpOffer(r){
  if(tourAt >= 0 || helpRoute() !== r) return;
  const n = PAGE_TOURS[r].filter(([s]) => document.querySelector(s)).length; if(!n) return;
  let p = document.getElementById("tour-pop");
  if(!p){ p = document.createElement("div"); p.id = "tour-pop"; p.className = "tour-pop"; document.body.appendChild(p); }
  p.dataset.kind = "offer"; p.setAttribute("role", "dialog"); p.setAttribute("aria-labelledby", "tour-h"); p.removeAttribute("tabindex");
  p.innerHTML = `<div class="tour-top"><span class="tour-n">New here?</span><button type="button" class="tour-x" data-help="close" aria-label="Close">${icon("x")}</button></div>
    <h3 id="tour-h">Take a quick tour</h3><p>See the main parts of ${r === "overview" ? "the workbench" : esc(ROUTE_LABEL[r] || "this page")} in ${n} step${n === 1 ? "" : "s"}.</p>
    <div class="tour-a"><button type="button" class="btn sm" data-help="off">Turn off tips</button><button type="button" class="btn sm primary" data-help="go">Show me ${icon("arrow")}</button></div>`;
}
function helpToggle(){ const off = !store.get("help:off", false); store.set("help:off", off); if(off) helpOfferClose();
  gsay(off ? "Page tips are off. Every page's “How this page works” button still works" : "Page tips are back on"); }

/* ---------- welcome back ---------- */
// Where the visitor was last time, read once before this visit overwrites it
const WB_PREV = store.get("help:last", null);
let wbOpen = null;
const WB_ICON = {premortem:"radar", tabletop:"siren", metrics:"gauge", vendors:"scale", maturity:"steps", coverage:"cover", policy:"doc", notice:"mail", appeal:"appeal", transparency:"chart", workspace:"user"};
function wbAgo(t){
  const d = new Date(t), now = new Date(), days = Math.round((new Date(now.toDateString()) - new Date(d.toDateString())) / 864e5);
  return days <= 0 ? "earlier today" : days === 1 ? "yesterday" : days < 7 ? days + " days ago" : "over a week ago";
}
function wbInject(){
  if(!wbOpen) return; const v = document.getElementById("view"); if(!v || v.querySelector(".wb")) return;
  const host = v.querySelector(".ov") || v;
  host.insertAdjacentHTML("afterbegin", `<div class="card wb" role="status"><span class="sb-glyph wb-ic" style="background:${(typeof TOOL_COLOR !== "undefined" && TOOL_COLOR[wbOpen.r]) || "var(--accent)"}">${icon(WB_ICON[wbOpen.r] || "arrow")}</span>
    <p class="wb-t"><b>Welcome back.</b> You were last in ${esc(ROUTE_LABEL[wbOpen.r] || wbOpen.r)}, ${wbAgo(wbOpen.t)}.</p>
    <a class="btn sm primary" href="#${wbOpen.r}" data-wb="go">Pick up where you left off ${icon("arrow")}</a>
    <button type="button" class="tour-x" data-wb="x" aria-label="Dismiss">${icon("x")}</button></div>`);
}
const _renderOverviewBase = renderOverview;
renderOverview = function(){ _renderOverviewBase.apply(this, arguments); wbInject(); };

// Called by the router after every page render
function helpAfterRoute(name, h){
  const demo = typeof demoOn === "function" && demoOn();
  if(!route.done){
    const ok = WB_PREV && WB_PREV.r && WB_PREV.r !== "overview" && ROUTE_LABEL[WB_PREV.r] && Date.now() - WB_PREV.t > 30 * 60e3;
    if(name === "overview" && ok && !demo && !helpQuiet()){ wbOpen = WB_PREV; wbInject(); }
  }
  if(name !== "overview"){ wbOpen = null; if(name !== "about" && !demo) store.set("help:last", {r:name, t:Date.now()}); }
  clearTimeout(helpAfterRoute.t);
  const seen = store.get("help:seen", {});
  const direct = h === name || (!h && name === "overview");
  if(!direct || seen[name] || demo || store.get("help:off", false) || helpQuiet() || !PAGE_TOURS[name] || (typeof tourAt !== "undefined" && tourAt >= 0)) return;
  seen[name] = true; store.set("help:seen", seen);
  helpAfterRoute.t = setTimeout(() => helpOffer(name), 700);
}

/* ---------- plain-English terms on every page ---------- */
// The metrics glossary plus the terms other pages use. Acronyms and names match exactly; other terms ignore case.
const GT_MORE = {
  "DSA":"The EU Digital Services Act. It sets rules for how online services handle illegal content, complaints and transparency in the EU.",
  "Online Safety Act":"The UK law that requires online services to assess and reduce the risk of illegal content and, where children are likely to use them, harm to children. Ofcom enforces it.",
  "Ofcom":"The UK communications regulator, which enforces the Online Safety Act.",
  "CSAM":"Child sexual abuse material. Illegal to make, possess or share in almost every country. US providers must report it to NCMEC.",
  "CyberTipline":"NCMEC's system for reports of child sexual exploitation. US providers are required by law to report to it.",
  "VLOP":"Very large online platform: a service with 45 million or more monthly users in the EU, designated by the European Commission. It carries the DSA's strictest duties.",
  "GDPR":"The EU General Data Protection Regulation, which governs how personal data is collected, used and kept.",
  "COPPA":"The US Children's Online Privacy Protection Act. It requires verifiable parental consent before collecting personal data from children under 13.",
  "DPIA":"Data protection impact assessment: a GDPR review of the privacy risks of high-risk data processing, done before it starts.",
  "UGC":"User-generated content: the posts, images, videos and messages your users create.",
  "NCII":"Non-consensual intimate imagery: intimate images shared without the person's consent.",
  "BPO":"Business process outsourcing: an outside company that supplies staff, such as content moderators.",
  "RFP":"Request for proposal: the document you send vendors asking how they would meet your requirements, and at what price.",
  "DTSP":"The Digital Trust & Safety Partnership, an industry group whose Safe Framework sets out Trust & Safety good practice.",
  "sextortion":"Threatening to share someone's intimate images unless they pay or send more. Teenagers are frequent targets.",
  "grooming":"When an adult builds a child's trust over time in order to sexually abuse or exploit them.",
  "incident command":"A clear structure for running a crisis: one person in charge, defined roles and a regular rhythm of updates.",
  "false positive":"When a system or reviewer flags or removes something that didn't break the rules.",
  "doxxing":"Publishing someone's private information, such as their home address, to harass or endanger them.",
  "escalation":"Moving a case to a more senior or specialist reviewer, such as legal or child safety, because it's severe or unclear."
};
let GT_ALL = null, GT_RE = null;
function gtInit(){
  GT_ALL = Object.assign({}, typeof MX_GLOSS !== "undefined" ? MX_GLOSS : {}, GT_MORE);
  const keys = Object.keys(GT_ALL).sort((a, b) => b.length - a.length), q = k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exact = keys.filter(k => /[A-Z]/.test(k)), loose = keys.filter(k => !/[A-Z]/.test(k));
  GT_RE = [exact.length ? new RegExp("\\b(" + exact.map(q).join("|") + ")s?\\b", "g") : null, loose.length ? new RegExp("\\b(" + loose.map(q).join("|") + ")s?\\b", "gi") : null].filter(Boolean);
}
const GT_SKIP = "a,button,label,select,option,textarea,input,h1,h2,h3,h4,h5,h6,code,pre,svg,summary,[role=tab],[contenteditable],.gt,.gl,.pill,.tag,.btn,.toast,.no-gl,.tour-pop,.wb";
function gtRun(){
  const v = document.getElementById("view"); if(!v || helpRoute() === "metrics") return;
  if(!GT_RE) gtInit();
  const used = new Set([...v.querySelectorAll(".gt")].map(e => e.dataset.gt)); let budget = 14 - used.size; if(budget <= 0) return;
  const nodes = [], w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT, {acceptNode: n => {
    const p = n.parentElement; if(!p || n.nodeValue.length < 3 || p.closest(GT_SKIP) || !p.closest("p,li,td,dd")) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT; }});
  while(w.nextNode()) nodes.push(w.currentNode);
  const lower = Object.fromEntries(Object.keys(GT_ALL).map(k => [k.toLowerCase(), k]));
  for(let node of nodes){
    if(budget <= 0) break;
    for(let guard = 0; guard < 6 && node && budget > 0; guard++){
      let best = null;
      GT_RE.forEach(re => { re.lastIndex = 0; let m; while((m = re.exec(node.nodeValue))){ const k = GT_ALL[m[1]] ? m[1] : lower[m[1].toLowerCase()]; if(k && !used.has(k)){ if(!best || m.index < best.i) best = {i:m.index, len:m[0].length, k}; break; } } });
      if(!best) break;
      const mid = node.splitText(best.i), after = mid.splitText(best.len), s = document.createElement("span");
      s.className = "gt"; s.tabIndex = 0; s.dataset.gt = best.k; mid.parentNode.insertBefore(s, mid); s.appendChild(mid);
      used.add(best.k); budget--; node = after;
    }
  }
}
function gtTip(el){
  let t = document.getElementById("gt-tip");
  if(!el){ if(t) t.hidden = true; return; }
  if(!t){ t = document.createElement("div"); t.id = "gt-tip"; t.setAttribute("role", "tooltip"); document.body.appendChild(t); }
  t.textContent = GT_ALL[el.dataset.gt] || ""; t.hidden = false; el.setAttribute("aria-describedby", "gt-tip");
  const r = el.getBoundingClientRect(), tw = Math.min(300, innerWidth - 24); t.style.maxWidth = tw + "px";
  const h = t.offsetHeight, below = r.bottom + 8 + h < innerHeight;
  t.style.left = Math.max(12, Math.min(r.left, innerWidth - t.offsetWidth - 12)) + "px";
  t.style.top = (below ? r.bottom + 8 : Math.max(8, r.top - h - 8)) + "px";
}

if(typeof document !== "undefined" && document.addEventListener){
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-help]");
    if(b){ e.preventDefault(); const a = b.dataset.help, r = helpRoute();
      if(a === "tour" || a === "go"){ helpOfferClose(); return helpTour(r); }
      if(a === "off"){ helpOfferClose(); store.set("help:off", true); return gsay("Page tips are off. Every page's “How this page works” button still works"); }
      return helpOfferClose(); }
    const wb = e.target.closest && e.target.closest("[data-wb]");
    if(wb){ const x = wb.dataset.wb === "x"; wbOpen = null; const c = document.querySelector(".wb"); if(c) c.remove(); if(x) e.preventDefault(); return; }
    const g = e.target.closest && e.target.closest(".gt"); gtTip(g && document.getElementById("gt-tip") && !document.getElementById("gt-tip").hidden && document.getElementById("gt-tip").textContent === GT_ALL[g.dataset.gt] ? null : g);
  });
  document.addEventListener("mouseover", e => { const g = e.target.closest && e.target.closest(".gt"); if(g) gtTip(g); });
  document.addEventListener("mouseout", e => { const g = e.target.closest && e.target.closest(".gt"); if(g && !g.contains(e.relatedTarget)) gtTip(null); });
  document.addEventListener("focusin", e => { if(e.target.classList && e.target.classList.contains("gt")) gtTip(e.target); });
  document.addEventListener("focusout", e => { if(e.target.classList && e.target.classList.contains("gt")) gtTip(null); });
  document.addEventListener("keydown", e => { if(e.key === "Escape"){ gtTip(null); helpOfferClose(); } });
  window.addEventListener("scroll", () => gtTip(null), {passive:true});
  window.addEventListener("hashchange", () => { helpOfferClose(); gtTip(null); });
  // Terms are marked after every render, including re-renders inside a page
  const gv = document.getElementById("view");
  if(gv && typeof MutationObserver !== "undefined"){
    let tm = 0; const mo = new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(() => { mo.disconnect(); try{ gtRun(); }finally{ mo.observe(gv, {childList:true, subtree:true}); } }, 120); });
    mo.observe(gv, {childList:true, subtree:true});
  }
}
