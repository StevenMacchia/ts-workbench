/* =========================================================
   INTRO: a purpose card before any tool's own first screen, the first time anyone opens it, plus a
   "How this works" walkthrough one click away afterwards. The red team studio already has this
   pattern (rtfIntro, RT_WALK in partRT9.js); this is the same pattern, as one shared component, for
   every other tool: premortem, tabletop, maturity, coverage, metrics, vendors, policy, coppa, dsa,
   eval, notice, appeal, transparency, plan, review, workspace.
   Saved under tswb:intro:<route>, a plain boolean per route. No other saved shape changes.
   Four tools already open on their own guided intro (gdRender's gdIntroHTML, or maturity's own
   maIntroHTML): COPPA, DSA, vendors, maturity. For those the purpose card sits in front of that
   screen rather than repeating it, so their card text below is shorter on purpose.
   ========================================================= */
const introSeen = route => store.get("intro:" + route, false);
const introMark = route => store.set("intro:" + route, true);

// heading: plain words, what the tool does for you. who/leave/mins: the three lines, each one
// sentence. walk: 3 to 5 {title, line, preview} screens, preview a static fragment in the tool's
// own classes (non-interactive, tabindex -1, no attack content anywhere).
const INTRO_SPECS = {
  premortem:{
    heading:"Find out how your feature could be misused, before you launch it",
    who:"a team about to ship a product or feature.",
    leave:"every risk that applies, how serious it is, and the five actions to do first.",
    mins:"about 3 minutes. No Trust &amp; Safety background needed.",
    walk:[
      {title:"Twelve plain questions", line:"What you're building, who uses it and how. No right answer is required to move on.",
        preview:() => `<div class="gd-opts" role="group" aria-label="Example question"><button type="button" class="gd-opt on" tabindex="-1"><span class="gd-radio" aria-hidden="true"></span><span class="gd-ot"><b>Anyone can message anyone</b><span>Including people who don't follow each other.</span></span><kbd aria-hidden="true">1</kbd></button></div>`},
      {title:"A risk register, rated as you go", line:"Each answer adds, removes or re-rates a risk. You watch the picture change, not fill out a form.",
        preview:() => `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill crit"><span class="dot"></span>Grooming</span><span class="pill high"><span class="dot"></span>Harassment</span><span class="pill med"><span class="dot"></span>Spam</span></div>`},
      {title:"Start Here: five actions", line:"The highest-leverage fixes for your biggest risks, in order, so you know what to build first.",
        preview:() => `<div class="starthere" style="padding:10px 12px"><label class="row"><input type="checkbox" disabled><span>Require a cooldown before a new account can message a minor</span></label></div>`}
    ]},
  tabletop:{
    heading:"Rehearse a crisis before it happens",
    who:"anyone who'd be in the room during a real incident.",
    leave:"four timed decisions scored on safety, trust, legal standing and your team, plus a debrief.",
    mins:"about 8 minutes solo; longer with your team.",
    walk:[
      {title:"Pick your company type and a scenario", line:"Scenarios are tailored to your kind of company, from the most common incidents to the most severe.",
        preview:() => `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill crit"><span class="dot"></span>Sev 1</span><span class="pill">Social</span></div>`},
      {title:"Four timed decisions", line:"An incident unfolds in updates. Read each one, then pick what you'd do before the clock runs out.",
        preview:() => `<ul class="tline" style="margin:0"><li class="now"><span class="tdot">1</span><span class="tlab"><b>Update 1</b><span>First reports come in</span></span></li></ul>`},
      {title:"A scorecard and a debrief", line:"Safety, trust, regulatory standing and team capacity move with every call, and the debrief names your blind spot.",
        preview:() => `<div class="cmp head" style="margin:0"><span>Score</span><span>Was</span><span>Now</span></div><div class="cmp"><span>User safety</span><span class="cv">60</span><span class="cv up">75</span></div>`}
    ]},
  maturity:{
    heading:"See how strong your Trust &amp; Safety program really is",
    who:"whoever owns the program, even a team of one.",
    leave:"a level for each of 8 areas against a target for your size, and a roadmap for the biggest gaps.",
    mins:"about 5 minutes, one area at a time.",
    walk:[
      {title:"Your size sets the target", line:"Smaller teams get a lighter target. A few things, like crisis response, never scale down.",
        preview:() => `<div class="gd-opts" role="group"><button type="button" class="gd-opt on" tabindex="-1"><span class="gd-radio" aria-hidden="true"></span><span class="gd-ot"><b>Growing</b><span>Target: level 2 to 3</span></span></button></div>`},
      {title:"One area, five levels", line:"Pick the highest level that's true today for policy, detection, crisis response and five more areas.",
        preview:() => `<div class="gd-opts" role="group"><button type="button" class="gd-opt" tabindex="-1"><b>2</b> Written but inconsistently applied</button></div>`},
      {title:"A radar and a roadmap", line:"Your level against the target, and a phased plan that takes your weakest areas up one level at a time.",
        preview:() => `<div class="ma-road" style="padding:10px 12px"><label class="row"><input type="checkbox" disabled><span>Write down who owns each kind of decision</span></label></div>`}
    ]},
  coverage:{
    heading:"See where your defenses don't match your risk",
    who:"whoever is deciding what to build or buy next.",
    leave:"a radar of risk against your defenses, and the three weakest spots to close first.",
    mins:"about 5 minutes across the harms that apply to you.",
    walk:[
      {title:"Only the harms that apply", line:"Untick anything your platform can't have. It's left out of the radar and your grade.",
        preview:() => `<div class="gd-list" style="padding:8px 0"><label class="row"><input type="checkbox" checked disabled><span>Harassment</span></label></div>`},
      {title:"Rate each layer of defense", line:"For each harm, say how strong detection, policy, enforcement and reviewer support are today.",
        preview:() => `<div class="gd-opts" role="group"><button type="button" class="gd-opt" tabindex="-1"><b>2</b> Partial coverage</button></div>`},
      {title:"Risk against coverage", line:"Where the dashed risk line sits outside your coverage shape, risk is outrunning your defenses.",
        preview:() => `<div class="cv-cell" style="margin:0 auto"><p class="cv-cell-lv">Coverage: 2 of 4</p></div>`}
    ]},
  metrics:{
    heading:"Pick the few numbers that show whether users are actually safer",
    who:"anyone who has to report on the program's results.",
    leave:"the north-star metrics recommended for your platform, each with a formula and starter SQL.",
    mins:"about 1 minute to get started; a full scorecard takes longer.",
    walk:[
      {title:"Your platform and stage", line:"Two quick questions decide which metrics matter most for where you are today.",
        preview:() => `<div class="gd-opts" role="group"><button type="button" class="gd-opt on" tabindex="-1"><b>Marketplace</b></button></div>`},
      {title:"North stars first", line:"The few numbers that show whether users are safer, not just how much got removed.",
        preview:() => `<div class="mxm-band" style="padding:10px 12px"><b>Time to action on severe reports</b></div>`},
      {title:"Track it, then report it", line:"Log this period's value against a target, and build a one-pager for leadership as you go.",
        preview:() => `<div class="mx-sc" style="padding:10px 12px"><span class="pill good">On track</span></div>`}
    ]},
  vendors:{
    heading:"Decide which moderation vendor to trust with your users",
    who:"whoever has to choose, or defend the choice of, a vendor.",
    leave:"a ranked scorecard against a plain rubric, with the RFP questions to ask each one.",
    mins:"about 10 minutes for two to four vendors.",
    walk:[
      {title:"Say what matters", line:"Weight cost, coverage, quality, wellness, security and more, or start from a preset.",
        preview:() => `<div class="vd-weights" style="padding:10px 12px">Quality <b>30</b></div>`},
      {title:"Score with a rubric", line:"Rate each vendor 1 to 5 on one criterion at a time. The rubric says what each score looks like.",
        preview:() => `<div class="gd-opts" role="group"><button type="button" class="gd-opt on" tabindex="-1"><b>4</b> Strong evidence</button></div>`},
      {title:"Watch the ranking build", line:"The highest weighted score wins, unless a vendor misses a minimum on wellness or security.",
        preview:() => `<div class="vd-railc" style="padding:10px 12px"><span class="pill good">Vendor B leads</span></div>`}
    ]},
  policy:{
    heading:"Find out where reviewers would disagree on your rule",
    who:"whoever writes or reviews the rules.",
    leave:"the words reviewers read differently, the cases your rule forgets, and a clearer rewrite.",
    mins:"about 4 minutes for the instant checks in your browser.",
    walk:[
      {title:"Paste your rule", line:"Your actual policy text, or one of the worked examples, plus your platform and what worries you.",
        preview:() => `<div class="pol-card" style="padding:10px 12px"><p class="note">No hate speech or harassment of any kind.</p></div>`},
      {title:"Instant checks, free", line:"A transparent rubric runs in your browser: vague words, sweeping terms, whether it has the six parts of a strong rule.",
        preview:() => `<div class="pol-sum" style="padding:10px 12px"><span class="pill high">Vague: "any kind"</span></div>`},
      {title:"Go further with Claude", line:"Optional: edge cases for your platform, enforcement risks and a rewrite, on your own Claude account.",
        preview:() => `<div class="pol-more" style="padding:10px 12px"><span class="pill accent">Claude review available</span></div>`}
    ]},
  coppa:{
    heading:"Find out whether COPPA applies to you, and if you're ready",
    who:"any service that could reach children under 13 in the US.",
    leave:"a readiness score, the gaps against the Rule, and four drafts ready to edit.",
    mins:"a few plain questions. Penalties run over $53,000 per violation.",
    walk:[
      {title:"Who the service is for", line:"This one answer decides whether COPPA applies to every user, to under-13s, or only children you know about.",
        preview:() => `<div class="cp-aud" style="padding:10px 12px"><span class="pill">Mixed audience</span></div>`},
      {title:"Map the children's data", line:"What you collect, including through third-party SDKs, why, who gets it and how long you keep it.",
        preview:() => `<div class="gd-opts" role="group"><button type="button" class="gd-opt on" tabindex="-1"><b>Name, email, location</b></button></div>`},
      {title:"Gaps, then four drafts", line:"Your gaps against the Rule, each with an owner, plus a parent notice, a retention policy and more, ready to edit.",
        preview:() => `<div class="cp-gaps" style="padding:10px 12px"><span class="pill crit">No verifiable parental consent</span></div>`}
    ]},
  dsa:{
    heading:"Find out which EU rules apply to you, and what's missing",
    who:"any service with users in the EU.",
    leave:"every duty that applies, article by article, and four drafts ready to edit.",
    mins:"four plain questions about your service.",
    walk:[
      {title:"What kind of service, how big", line:"The Act stacks duties by tier, and micro and small enterprises are exempt from most of them.",
        preview:() => `<div class="gd-opts" role="group"><button type="button" class="gd-opt on" tabindex="-1"><b>Online platform</b></button></div>`},
      {title:"Only the duties that apply", line:"Transparency reporting, notice-and-action, a complaints process and more, shown only where your answers trigger them.",
        preview:() => `<div class="ds-sum" style="padding:10px 12px"><span class="pill high">Statement of reasons required</span></div>`},
      {title:"Gaps, then four drafts", line:"Your gaps in order with the article behind each, plus drafts ready to edit.",
        preview:() => `<div class="pol-tabs" style="padding:10px 12px"><span class="tag">Article 17</span></div>`}
    ]},
  eval:{
    heading:"Check whether your classifier applies your rule the way you meant it",
    who:"whoever owns a classifier, or is choosing one.",
    leave:"what it got wrong, by kind, and what to change in the rule.",
    mins:"a few minutes once you have a rule and some cases.",
    walk:[
      {title:"Your rule and some cases", line:"Paste your policy, then start from worked examples or your own cases with the right answer beside each.",
        preview:() => `<div class="pol-card" style="padding:10px 12px"><p class="note">Case 1: a joke about a protected group</p></div>`},
      {title:"Get labels, three ways", line:"A free model in your browser, your own classifier's labels pasted back, or Claude in the Claude version.",
        preview:() => `<div class="row" style="gap:8px"><span class="pill">Browser model</span><span class="pill">Paste labels</span></div>`},
      {title:"What to change", line:"How many it got right, which cases it missed, and precision and recall if you want the detail.",
        preview:() => `<div class="pill high">Missed: sarcasm about age</div>`}
    ]},
  notice:{
    heading:"Draft a notice a user will actually understand",
    who:"anyone who has to tell a user why they were actioned.",
    leave:"a clear draft, checked against what a statement of reasons needs to include.",
    mins:"a few short questions. Claude drafts; you still decide.",
    walk:[
      {title:"Describe the decision", line:"What you did, which rule, and the facts, in your own words.",
        preview:() => `<div class="ai-form" style="padding:10px 12px"><label class="field"><span>Action taken</span><select class="select" disabled><option>Content removed</option></select></label></div>`},
      {title:"Let Claude draft", line:"A notice, a short version, and a check against what a statement of reasons needs, only when you click.",
        preview:() => `<div class="ai-act" style="padding:10px 12px"><span class="pill ai-pill">AI · runs on your Claude account</span></div>`},
      {title:"Review and send", line:"Edit the draft. A person should always approve it before it goes to the user.",
        preview:() => `<div class="ai-about" style="padding:10px 12px"><p class="note">You stay the one who decides.</p></div>`}
    ]},
  appeal:{
    heading:"Review an appeal the way a careful person would",
    who:"anyone who handles appeals against a moderation decision.",
    leave:"a reasoned recommendation, with the gaps in the original decision called out.",
    mins:"a few short questions. Claude reviews; you still decide.",
    walk:[
      {title:"Describe the appeal", line:"The rule that was applied, the original decision, the content, and what the user said.",
        preview:() => `<div class="ai-form" style="padding:10px 12px"><label class="field"><span>What the user said</span><textarea class="input" disabled rows="2"></textarea></label></div>`},
      {title:"Claude reviews it", line:"A recommendation, only when you click, run on your own Claude account.",
        preview:() => `<div class="ai-act" style="padding:10px 12px"><span class="pill ai-pill">AI · runs on your Claude account</span></div>`},
      {title:"You make the final call", line:"The review checks the reasoning. A person still decides what happens to the appeal.",
        preview:() => `<div class="ai-about" style="padding:10px 12px"><p class="note">A person makes the final call.</p></div>`}
    ]},
  transparency:{
    heading:"Build the transparency report the EU asks for",
    who:"whoever owns the transparency report for your service.",
    leave:"the right sections for your tier, a completeness check, and a readable report.",
    mins:"fill in what you know; nothing is final until you build it.",
    walk:[
      {title:"Your service and tier", line:"What kind of service you run under the DSA decides which sections you need.",
        preview:() => `<div class="pol-card" style="padding:10px 12px"><span class="pill">Online platform</span></div>`},
      {title:"One section at a time", line:"Each section maps to an article and asks only for the numbers it requires.",
        preview:() => `<div class="tr-sum" style="padding:10px 12px"><span class="pill high">60% complete</span></div>`},
      {title:"Check it, then build it", line:"A meter shows what's missing. Build the report when you're ready, with a checklist and a Claude summary.",
        preview:() => `<div class="pol-tabs" style="padding:10px 12px"><span class="tag">Report</span><span class="tag">Checklist</span></div>`}
    ]},
  plan:{
    heading:"See every open gap from every tool, in one list",
    who:"whoever has to decide what gets fixed first.",
    leave:"one prioritized list, sent to your tracker in one go.",
    mins:"instant. It's built from what you've already done.",
    walk:[
      {title:"Do first, next, later", line:"Launch blockers, coverage gaps, roadmap items and compliance gaps, grouped by how soon they matter.",
        preview:() => `<div class="pl-group" style="padding:10px 12px"><span class="pill crit">Do first</span></div>`},
      {title:"Tick things off here", line:"Mark something done in the plan, and the tool it came from updates too.",
        preview:() => `<label class="row" style="padding:4px 12px"><input type="checkbox" disabled><span>Add age verification at signup</span></label>`},
      {title:"Send it to your tracker", line:"Jira, Asana, Linear or GitHub, in one go, so the work lives where your team already tracks it.",
        preview:() => `<div class="row" style="gap:8px;padding:0 12px"><span class="pill">Jira</span><span class="pill">Linear</span></div>`}
    ]},
  review:{
    heading:"See what changed in your program, quarter by quarter",
    who:"whoever reports on the program's progress.",
    leave:"then-and-now numbers, what moved, and the story to tell leadership.",
    mins:"instant, once you've saved at least one earlier quarter.",
    walk:[
      {title:"Pick a saved quarter", line:"Then and now sit side by side: the score and every part of it.",
        preview:() => `<div class="rv-top" style="padding:10px 12px"><span class="pill">Q2 2026</span></div>`},
      {title:"What changed, in words", line:"Areas that moved, gaps closed or opened, and crises rehearsed, written as a story, not just numbers.",
        preview:() => `<div class="rv-what" style="padding:10px 12px"><p class="note">Crisis response moved from level 2 to 3.</p></div>`},
      {title:"Two shapes, one chart", line:"The dotted outline is the saved quarter; the filled shape is now.",
        preview:() => `<div class="rv-rads" style="padding:10px 12px"><span class="pill good">Improved</span></div>`}
    ]},
  workspace:{
    heading:"Everything you've saved, in one place",
    who:"anyone using more than one tool here.",
    leave:"your saved work organized into projects, and a file to back it up.",
    mins:"nothing to do here but look, save, or open a file.",
    walk:[
      {title:"Your saved work", line:"Every pre-mortem, scorecard and report you've saved, in one list.",
        preview:() => `<div class="projgrid" style="padding:10px 12px"><span class="pill">Resale chat</span></div>`},
      {title:"Grouped into projects", line:"Group saved work by product or launch, so a team can find its own.",
        preview:() => `<div class="org-card" style="padding:10px 12px"><span class="pill">Marketplace app</span></div>`},
      {title:"Back it up, take it with you", line:"Your work lives in this browser. Save a file to back it up or open it on another device.",
        preview:() => `<div class="wsprofile" style="padding:10px 12px"><span class="pill">Workspace file</span></div>`}
    ]}
};

/* ---------- the purpose card ---------- */
function introHTML(route){
  const s = INTRO_SPECS[route]; if(!s) return "";
  const label = (typeof ROUTE_LABEL !== "undefined" && ROUTE_LABEL[route]) || "";
  return `<div class="card rtf-card intro-card"><span class="rtf-eb">${esc(label)}</span><h1 class="rtf-h1">${s.heading}</h1>
    <ul class="rtf-list rtf-intro-list">
      <li>Who it's for: ${s.who}</li>
      <li>What you leave with: ${s.leave}</li>
      <li>How long: ${s.mins}</li>
    </ul>
    <div class="rtf-act"><button type="button" class="btn primary" data-introbtn="start">Start</button><button type="button" class="btn" data-introbtn="how">Show me how it works</button></div>
    <p class="note">Already know this? <button type="button" class="rtf-link" data-introbtn="skip">Skip</button>.</p>
  </div>`;
}
// Wires the card's own buttons. onStart is the tool's real entry (what Start reveals).
function introBind(route, onStart){
  $$("[data-introbtn]").forEach(b => { const a = b.dataset.introbtn;
    if(a === "start" || a === "skip") b.onclick = () => introStart(route, onStart);
    if(a === "how") b.onclick = () => walkOpen(route, onStart);
  });
}
function introStart(route, onStart){ introMark(route); if(onStart) onStart(); }

/* ---------- the walkthrough, 3 to 5 non-interactive screens, reused from inside the tool too ---------- */
function introWalkHTML(route, i){
  const spec = INTRO_SPECS[route], sc = spec.walk[i];
  return `<p class="ln-eb">How this works · ${i + 1} of ${spec.walk.length}</p><h2>${esc(sc.title)}</h2><p class="ln-why">${sc.line}</p>
    <div class="ln-body"><div class="rtf-walk-prev" aria-hidden="true">${typeof sc.preview === "function" ? sc.preview() : sc.preview}</div></div>
    <div class="ln-pager"><div class="row">${i > 0 ? `<button type="button" class="btn" data-walk="back">← Back</button>` : "<span></span>"}</div>
      <div class="row">${i < spec.walk.length - 1 ? `<button type="button" class="btn primary" data-walk="next">Next →</button>` : `${typeof PAGE_TOURS !== "undefined" && PAGE_TOURS[route] && introSeen(route) ? `<button type="button" class="btn" data-walk="tour">Point at the parts on this page</button>` : ""}<button type="button" class="btn primary" data-walk="start">Start</button>`}</div></div>`;
}
// Opened either from the purpose card itself (onStart lands on the tool's real first screen once the
// card hasn't been seen yet) or from a tool's own "How this works" link once it has: in the second
// case Start simply closes, since the visitor is already past the card.
function walkOpen(route, onStart){
  const spec = INTRO_SPECS[route]; if(!spec || !spec.walk || !spec.walk.length) return;
  let i = 0;
  const draw = () => {
    lnModal(introWalkHTML(route, i));
    const bg = $("#ln-modal");
    const back = $("[data-walk='back']", bg); if(back) back.onclick = () => { i = Math.max(0, i - 1); draw(); };
    const next = $("[data-walk='next']", bg); if(next) next.onclick = () => { i = Math.min(spec.walk.length - 1, i + 1); draw(); };
    const tour = $("[data-walk='tour']", bg); if(tour) tour.onclick = () => { lnClose(); if(typeof helpTour === "function") setTimeout(() => helpTour(route), 50); };
    const start = $("[data-walk='start']", bg); if(start) start.onclick = () => {
      const fromCard = !introSeen(route); lnClose();
      if(fromCard) introStart(route, onStart);
    };
  };
  draw();
}

/* ---------- gate: show the card in place of each tool's own first screen, once per route ---------- */
// orig is the tool's real render function; wrapping it keeps every existing call site (ROUTES, gdRender
// splices, "Start over" buttons, re-renders mid-flow) working exactly as before, once the card has been seen.
function introGate(route, orig){
  return function(){
    if(introSeen(route)) return orig.apply(this, arguments);
    const args = arguments;
    // Same chrome as every other screen on this route (the assessment step bar, where it applies),
    // the card itself in the studio's own centred, max-width wrapper. help=false: the card already
    // has its own "Show me how it works", so the strip doesn't need a second one here.
    const strip = (typeof asStepBar === "function" && typeof HEAD_GROUP !== "undefined" && HEAD_GROUP[route]) ? asStepBar(route, null, false) : "";
    view.innerHTML = strip + `<div class="rtf">${introHTML(route)}</div>`;
    introBind(route, () => orig.apply(this, args));
  };
}
const renderPremortem9 = renderPremortem; renderPremortem = introGate("premortem", renderPremortem9);
const renderTabletop9 = renderTabletop; renderTabletop = introGate("tabletop", renderTabletop9);
const renderMaturity9 = renderMaturity; renderMaturity = introGate("maturity", renderMaturity9);
const renderCoverage9 = renderCoverage; renderCoverage = introGate("coverage", renderCoverage9);
const renderMetrics9 = renderMetrics; renderMetrics = introGate("metrics", renderMetrics9);
const renderVendors9 = renderVendors; renderVendors = introGate("vendors", renderVendors9);
const renderPolicy9 = renderPolicy; renderPolicy = introGate("policy", renderPolicy9);
const renderCoppa9 = renderCoppa; renderCoppa = introGate("coppa", renderCoppa9);
const renderDsa9 = renderDsa; renderDsa = introGate("dsa", renderDsa9);
const renderEval9 = renderEval; renderEval = introGate("eval", renderEval9);
const renderPlan9 = renderPlan; renderPlan = introGate("plan", renderPlan9);
const renderReview9 = renderReview; renderReview = introGate("review", renderReview9);
const renderWorkspace9 = renderWorkspace; renderWorkspace = introGate("workspace", renderWorkspace9);
// notice, appeal and transparency all route through renderAI(key) (transparency delegates on to
// renderTransparency from inside it); gating renderAI itself covers all three in one place.
const renderAI9 = renderAI;
renderAI = function(key){
  if(introSeen(key)) return renderAI9(key);
  const strip = (typeof asStepBar === "function" && typeof HEAD_GROUP !== "undefined" && HEAD_GROUP[key]) ? asStepBar(key, null, false) : "";
  view.innerHTML = strip + `<div class="rtf">${introHTML(key)}</div>`;
  introBind(key, () => renderAI9(key));
};

// "Start over" / "New": the tools that offer a full reset also drop the card back in front, so
// starting fresh starts fresh. (Tabletop, vendors, metrics, notice, appeal, transparency, plan,
// review and workspace have no equivalent whole-tool reset control.)
const INTRO_RESET_SEL = [["premortem", '[data-act="new"]'], ["coppa", '[data-cp="reset"]'], ["dsa", '[data-ds="reset"]'],
  ["maturity", '[data-ma="reset"]'], ["coverage", '[data-cv="reset"]'], ["policy", "#pol-reset"], ["eval", '[data-ev="reset"]']];
if(typeof document !== "undefined" && document.addEventListener){
  document.addEventListener("click", e => {
    if(!e.target || !e.target.closest) return;
    INTRO_RESET_SEL.forEach(([route, sel]) => { if(e.target.closest(sel)) store.set("intro:" + route, false); });
  });
}

// The "How this works" link: every one of these 16 pages already carries a selector-based page
// tour from helpBtn() in partHELP.js ("How this page works", PAGE_TOURS). That tour has its own job,
// walking the real, current page; it stays. This card's walkthrough is a different, calmer thing (a
// fixed set of small previews, same on every visit), so it gets its own link beside the existing
// one rather than replacing it. helpBtn() is extended there to add it; this just wires the click.
if(typeof document !== "undefined" && document.addEventListener){
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-intro='how']");
    if(b && typeof helpRoute === "function") walkOpen(helpRoute());
  });
}
