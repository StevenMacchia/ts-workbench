/* ---------- Page walkthroughs, "welcome back" and plain-English terms ---------- */
// A short tour for each page, offered once on the first visit and replayable from "How this page works".
// Each step points at a real part of the page; a step whose element isn't on screen is skipped.
const PAGE_TOURS = {
  overview:[
    [".as-hero-t h1", "One assessment, six steps", "Each step asks a few plain questions and adds to one picture of your program. You can stop any time and pick up later."],
    [".as-first .as-pic", "Your program picture", "It fills in as you go: an overall score, five graded parts and three radars."],
    [".as-six", "The six steps", "What each one gives you and how long it takes. Every tool is also under All tools, to use on its own."],
    [".as-head", "Where you are", "How many steps are done, and about how long the rest will take."],
    [".as-steps", "Your steps", "Finished steps show what they found. The next one is highlighted, and you can start any step early."],
    [".as-grid .as-pic", "Your program picture", "The overall score, each graded part and three radars. Click any of them to open that tool."],
    [".as-know", "What we know so far", "The most important finding from each step you've done."]
  ],
  premortem:[
    [".card.hero", "Assess a product or feature", "Answer 12 plain-language questions about what you're building and who uses it. It takes about 3 minutes, and no Trust & Safety background is needed."],
    [".pm-cur", "What you'll get", "A report like this one: the risks that apply and how serious each one is, the launch blockers, and the laws likely to apply in your markets."],
    [".exgrid", "Or start from an example", "Open a finished assessment for a common kind of product to see the whole report before you answer anything."],
    [".askcard", "One question at a time", "Pick the answer that fits, then press Next. Nothing is final: you can change any answer later from the report."],
    [".live", "Watch your risks change", "Each answer adds, removes or re-rates risks, and this panel shows the effect as you go."],
    [".starthere", "Start here", "The five actions that cover your most serious risks. Tick them off as you finish them."],
    [".viz", "Where the risk sits", "How severe and how likely each risk is, before or after the safeguards you've ticked. Click a cell or an area to filter the register."],
    [".pm-burn", "How far the plan takes you", "Each safeguard you tick lowers the likelihood of the risks it covers. The line is the path through the launch plan; the dot is where you are."],
    ["#pm-tabs", "The detail", "The launch plan with owners, every risk and why it's rated that way, the laws that likely apply, and the decisions your team has to make."],
    [".loop", "Put it to work", "Rehearse the crises behind your biggest risks, measure them, and map your defenses against them in the other tools."]
  ],
  tabletop:[
    [".ttbar", "Pick your company type", "Scenarios are tailored to the kind of company you choose. Your progress across all of them shows here."],
    [".tt-mode", "Play solo or with your team", "Solo gives you feedback after every call. Team mode adds roles, a timer for each decision, discussion prompts and a full-screen presenter view."],
    [".loop-strip", "Recommended for your risks", "Scenarios picked from the biggest risks in your pre-mortem."],
    [".ttfilters ~ .scen-grid", "Choose a scenario", "Each one is four timed decisions as an incident unfolds. A weaker choice shows what happens next and what strong incident command looks like."],
    [".tline", "Four decisions", "The incident unfolds over four updates. The timeline shows where you are and how each call went."],
    [".inject", "Make the call", "Read the update and pick what you'd do. A weaker choice shows what happened, the stronger call and the law behind it, and you can try it again."],
    [".tline ~ .play .meters", "Your scorecard", "Each call moves user safety, public trust, regulatory standing and team capacity."],
    [".play .verdict", "How you did", "Your strong calls on the first try, and the average across the four scores."],
    [".learnsum", "What to work on", "Your blind spot in this run, and the laws and standards the scenario touched."],
    [".debrief", "Decision by decision", "Your first choice beside the stronger call, with the lesson for each."],
    [".ttf-setup .segs", "Time for each decision", "Pick 3, 5 or 10 minutes per decision, or no timer at all."],
    [".ttf-how", "How it runs", "Share your screen, read each update aloud, talk it through, then choose as a team and capture actions."],
    [".ttf-roles", "Who's in the room", "Add names to the roles if you like. Each role gets its own discussion prompt, and actions can be assigned to it."],
    [".ttf-stage", "Read the update aloud", "One update per decision. Talk it through before you show the options."],
    [".ttf-timer", "Time for each decision", "Start the timer when the discussion starts. Add a minute if the team needs it."],
    [".ttf-ask", "Prompts for the room", "Questions for everyone, and one for each role, to keep the discussion on what matters."],
    [".ttf-debrief .verdict", "The after-action report", "How the team did, the actions you captured, and a report to download or send to your tracker."]
  ],
  metrics:[
    [".mxm-filter", "Fit the list to you", "Choose your platform and program stage, and whether EU or UK rules apply. The list reorders so the metrics that matter most come first."],
    [".mx-tabs", "Four views", "Metrics is the framework. My scorecard holds your own numbers, trends and a one-pager for leadership. Data to log and Running the program cover the practical side."],
    [".mxm-band", "Start with the north stars", "Open any metric to see the question it answers, the formula, how to measure it on your platform and starter SQL."],
    [".mxa-head", "One metric at a time", "The question the metric answers, and what it measures."],
    [".mxa-toc", "Three parts", "Understand it, measure it and track it. Jump straight to any part."],
    ["#mxp-3", "Track your number", "Enter this period's value, your target and where it counts as off track, and see where you stand."],
    [".mxa-pn", "Keep going", "Move to the previous or next metric, or go back to the full list."],
    [".mxs-top", "Your scorecard", "Name the reporting period, see what's on track, and open a one-pager for leadership."],
    ["#mx-sig", "Reading the numbers together", "Pairs of metrics that mean more together, like more automation alongside more reversed decisions."],
    [".mx-sc", "Your numbers", "A value, a target and an off-track line for each metric. Save each period to build trend lines."],
    [".mx-logs", "Log these first", "The event logs every metric is calculated from, and the fields teams most often forget."],
    [".mx-rgrid", "Put every metric on a calendar", "Which meeting should look at which metric, and how often."]
  ],
  vendors:[
    [".vd-weights", "Say what matters", "Set how much each criterion counts, or start from a preset. Weights add up to 100."],
    [".vd-names", "Name your vendors", "Compare two to four vendors side by side."],
    [".vd-crit", "Score with a rubric", "Rate each vendor from 1 to 5. The rubric says what each score looks like, and the RFP questions tell you what to ask first."],
    [".vd-railc", "Watch the result", "The ranking updates as you score. The highest weighted score wins, unless a vendor fails a minimum."]
  ],
  maturity:[
    [".gd-intro h1", "One area at a time", "Eight areas, one question each, about five minutes in all. At the end you get a score and a roadmap for the biggest gaps."],
    [".gd-intro .gd-alt", "Other ways in", "Rate every area on one page, or see a finished example first."],
    [".gd-s-stage .gd-opts", "Your size first", "Targets depend on how big and how regulated you are. It starts from your company profile."],
    [".gd-q .gd-opts", "Pick the highest level that's true", "Choose the highest level where every statement is true today, or press 1 to 5. Your target is marked."],
    [".gd-q .gd-aside", "Watch it fill in", "Your radar fills in against your target as you answer."],
    [".vd-main > .mxa-part:first-of-type", "Set your stage", "Targets depend on your company's size and how regulated you are, so start here."],
    [".ma-areas", "Rate each area", "Eight areas of a Trust & Safety program. Pick the level that matches your program today, one area at a time."],
    [".vd-railc", "Your profile", "Your radar and score update as you rate."],
    [".vd-main > .mxa-part:last-of-type", "Work the plan", "A phased roadmap for your biggest gaps. Tick off steps as you finish them, or send the plan to your tracker."],
    [".ma-band-l", "Where you stand", "Your overall level against the target for your stage, the area to fix first, and how far through the plan you are."],
    [".ma-band-r", "Now against target", "Each area's level today, with the target for your stage as a dashed line. Red dots are below target."],
    [".ma-tabs", "Three views of the plan", "Roadmap puts the steps in order. By area shows each area's levels, owner and evidence. Progress tracks snapshots over time."],
    ["#ma-plan .ma-road", "Work the roadmap", "Each card takes one area up one level. Tick both items and the area moves up on the radar."],
    [".ma-byarea", "One area at a time", "Pick an area to see every level, the steps to reach the next one, its owner and your evidence."],
    [".ma-prog-tab", "Show progress", "Save a snapshot each quarter, and the trend shows leadership how the program has grown."],
    [".ma-band-a", "Share it and keep it current", "Save a snapshot, send the plan to Jira, Asana, Linear or GitHub, or change your ratings."]
  ],
  coverage:[
    [".gd-intro h1", "One question at a time", "Five short questions for each kind of harm, about five minutes in all. At the end you'll see your risk next to your defenses."],
    [".gd-intro .gd-alt", "Other ways in", "Answer everything in one table, start from your maturity ratings, or see a finished example."],
    [".gd-list", "Only what applies", "Untick harms your platform can't have. They're left out of the radar and your grade, and saved in your company profile."],
    [".gd-opts", "Pick the closest answer", "Click an answer or press 1 to 4. It moves on by itself, and Back lets you change it."],
    [".gd-aside", "Watch it fill in", "Your radar fills in as you answer, with your progress through each harm area."],
    [".gd-done", "A result after each area", "Coverage for that harm against its risk, and the one thing to fix first."],
    [".cvr-radar", "Risk against coverage", "Where the dashed risk line sits outside your coverage, risk is outrunning your defenses."],
    [".cvr-top", "Close these first", "The three weakest defenses where risk is highest."],
    [".cvr-tabs", "The detail", "Every gap, every answer (change any of them here), and which product's risk you're comparing against."],
    [".vd-main > .mxa-part:first-of-type", "Choose the risk to compare", "Your products' combined risk, one product, or an example. Product risk comes from your pre-mortems."],
    [".vd-main > .mxa-part:nth-of-type(2)", "Rate your defenses", "For each kind of harm, rate how strong each layer of defense is today. If a harm can't happen on your platform, hover it and use the trash can. The radar and your grade leave it out."],
    [".vd-railc", "Risk against coverage", "The radar shows where risk outruns your defenses, and updates as you rate."],
    [".vd-main > .mxa-part:last-of-type", "Close the biggest gaps", "The gaps in order, with the next step for each."]
  ],
  policy:[
    [".pol-card", "Your rule", "Paste the policy rule you want to test, or start from one of the examples."],
    [".pol-co", "Your platform", "Add your company or product and what it does, so the test fits how people use it."],
    [".pol-runbar", "Run the test", "Instant checks run in your browser straight away. Claude's review, where available, adds edge cases, gaps, enforcement risks and a rewrite."],
    [".pol-info", "How it works", "What each check looks for, and how the tool was built."],
    [".pol-report > .pol-sum", "The verdict", "A clarity score for the rule, from the instant checks or Claude's review, with what the rule already does well."],
    [".pol-tested", "What was tested", "The rule and the context used for the test. Edit either and run it again."],
    [".pol-report > .pol-sec:not(.pol-busy)", "Instant checks", "A transparent rubric that runs in your browser: vague words, sweeping terms like “any” or “never”, and whether the rule has the six parts of a strong rule."],
    [".pol-more, .pol-more-n", "Go further with Claude", "Claude's review adds edge cases for your platform, a clearer rewrite and a checklist for reviewers."],
    ["#pol-tabs", "The findings", "Edge cases and how a team should decide them, words reviewers will read differently, a rewrite, and what your team still needs to decide."]
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
    [".pol-runbar", "Check and build", "The meter shows what's still missing. Build the report when you're ready, with a checklist and a summary."],
    [".tr-sum", "How complete it is", "The share of what the DSA asks for at your tier that's filled in, and when the report is due."],
    [".tr-report .pol-tabs", "Three views", "The report as readers will see it, a checklist of what the DSA asks for, and a summary Claude writes from your numbers only."]
  ],
  coppa:[
    [".cp-aud", "Who it's for", "Start with your audience. It decides whether COPPA applies to every user, to users under 13, or only to the children you know about."],
    ["#cp-s-data", "Map children's data", "Mark each kind of personal information you collect, including what third-party SDKs collect through you, then why, who gets it and how long you keep it."],
    ["#cp-s-ctrl", "What you have in place", "Tick what's true today. Only the requirements that apply to your answers are shown."],
    [".pol-runbar", "Build your plan", "Your gaps in order, with an owner and the rule behind each, plus four drafts: a notice to parents, a retention policy, a security program and a memo for Legal."],
    [".cp-report .pol-sum", "Where you stand", "Whether COPPA applies to you, how ready you are, and how many critical gaps are left."],
    [".cp-report .pol-tabs", "Plan, data, drafts and requirements", "Your gaps in order, your data map, four drafts to edit, and every requirement that applies to your answers."],
    [".cp-gaps", "Close the gaps", "Each gap names the part of the Rule, who usually owns it and what to do. Mark it done once it's fixed."]
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

// Called by the router after every page render
// Tours are never offered uninvited: each page explains itself, and "How this page works" replays the tour on request
function helpAfterRoute(name, h){ helpOfferClose(); }

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
