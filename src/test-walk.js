// Fixes from the three cold reads of the live site (tools/WALKTHROUGHS-2026-10.md, October 13):
// every count has one source, and the abuse pre-mortem is honest about what it does not know.
//  - counts: TOOL_ROUTES (partNav.js) is the one list of tools; the About page counts it and _build/gen-readmes.js parses it;
//    the pre-mortem's question count is QS.length on the start screen, the stepper and the help tour alike; the scenario
//    stat reads "N scenarios, in M versions".
//  - pre-mortem: no grade and no "severe" on child-safety risks until the under-18 question is answered; Enter and number
//    keys on the questions; the product type's own harms lead the first actions; the benchmark names the reader's own kind of
//    product; starting a new assessment with nothing to clear shows no Undo toast; a multi-select left empty is not "None".
// Pattern follows test-intro.js: the shared stub and module list, then the real render functions, without a browser. The
// stub's $ and $$ are replaced so the pre-mortem's click handler and the page-level keydown handler can be driven.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14;
const base = v9.slice(s0, v9.indexOf("`;", s0));
const A = "const $ = s => (els[s] = els[s] || fake()); const $$ = () => [];", B = "document = {addEventListener(){}";
if(!base.includes(A)) throw new Error("test-v9.js stub changed: $ / $$ line not found");
const stub = base.replace(A, () => `
const rootL = {}, docL = {}; let optBtns = () => [];
const $ = s => { if(s === "#pm-root"){ for(const k in rootL) delete rootL[k]; const o = fake(); o.addEventListener = (t, fn) => { (rootL[t] = rootL[t] || []).push(fn); }; return (els[s] = o); } return (els[s] = els[s] || fake()); };
const $$ = s => s === "#pm-root .opt-key" ? optBtns() : [];
`).replace("document = {addEventListener(){}", () => "document = {querySelector(){ return null; }, body:{dataset:{}}, addEventListener(t, fn){ (docL[t] = docL[t] || []).push(fn); }");
const extra = "window.addEventListener = function(){};\n";

const body = async function(){
  const out = [], eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const bad = h => /undefined|NaN|\[object/.test(h);
  const txt = h => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  // ---- drivers: a click on a button with these data attributes, and a key press, as the page would deliver them
  const click = ds => { const btn = {dataset:ds}; (rootL.click || []).forEach(f => f({target:{closest:() => btn}})); };
  const key = k => { (docL.keydown || []).forEach(f => f({key:k, metaKey:false, ctrlKey:false, altKey:false, target:{tagName:"BODY", id:""}, preventDefault(){}})); };
  optBtns = () => {
    const bs = []; const re = /<button type="button" class="gd-opt opt-key[^"]*"([^>]*)>/g; let m;
    while((m = re.exec(view.innerHTML))){ const ds = {}; (m[1].match(/data-[a-z]+="[^"]*"/g) || []).forEach(a => { const [k, v] = a.slice(5).split('="'); ds[k] = v.slice(0, -1); }); bs.push({click:() => click(ds)}); }
    return bs;
  };
  // the Cleared / Undo toast needs a real document; count its calls instead
  let undos = 0; withUndo = () => { undos++; };
  location.hash = "#premortem";
  store.set("intro:premortem", true); // past the purpose card, as in a normal session
  const fresh = () => { pm = blankPM(); pm.stage = "ask"; pm.qi = 0; renderPremortem(); };
  const crumb = () => (view.innerHTML.match(/Question (\d+) of (\d+)/) || []).slice(1).map(Number);

  /* ---------- A. one source for every count ---------- */
  const routesSrc = rd_("partNav.js").match(/const TOOL_ROUTES = (\[[^\]]*\])/);
  eq(!!routesSrc, true, "_build/gen-readmes.js reads TOOL_ROUTES with this pattern; partNav.js must keep matching it");
  eq(JSON.parse(routesSrc[1]).length, TOOL_ROUTES.length, "the READMEs and home page read the same number as the app");
  TOOL_ROUTES.forEach(r => eq(!!ROUTE_LABEL[r], true, "a tool route has a label: " + r));
  const aboutNames = AB_GROUPS.reduce((a, g) => a.concat(g[1].map(x => x[2])), []).slice().sort().join("|");
  eq(aboutNames, TOOL_ROUTES.map(r => ROUTE_LABEL[r]).sort().join("|"), "the About page lists exactly the tools in TOOL_ROUTES, under the same names");
  renderAbout(); let h = view.innerHTML;
  eq(h.includes(`<small>Tools</small><b>${TOOL_ROUTES.length}</b>`), true, "About: the Tools figure is TOOL_ROUTES.length");
  eq(/Next: a transparency report/.test(h), false, "About: the stale 'Next: a transparency report drafter' line is gone");
  eq(/Transparency report/.test(h), true, "About: the transparency report is listed as built");
  eq(new RegExp(`<b class="mono">${SCENARIOS.length}</b><span>crisis scenarios, in ${ttVersionCount()} versions`).test(h), true, "About: scenarios and versions are stated together, from the data");
  renderTools(); h = view.innerHTML;
  eq((h.match(/class="ov-tool"/g) || []).length + (h.match(/class="ov-aic /g) || []).length, TOOL_ROUTES.length - (typeof RT_AREAS === "undefined" ? 1 : 0), "All tools: one card per tool in TOOL_ROUTES (the Red team studio card needs partRT.js, which this harness does not load)");
  out.push(`counts: ${TOOL_ROUTES.length} tools from one list (About, README and home page read it), ${SCENARIOS.length} scenarios in ${ttVersionCount()} versions, stale 'Next:' line removed`);

  pm = fromPreset("teen_social"); pm.stage = "start"; pm.example = false; pm.qi = 0;
  eq(startScreen().includes(`${QS.length} questions`), true, "start screen: the question count is QS.length");
  fresh(); const c0 = crumb();
  eq(c0[1], QS.length, "stepper on a blank assessment: 1 of every question in the list (was 11 before a type was picked)");
  click({set:"type", v:"marketplace"}); const c1 = crumb();
  eq(c1[1], c0[1], "stepper after picking a type reads the same list: " + c0 + " then " + c1);
  eq(JSON.stringify(PAGE_TOURS.premortem[0]).includes(`${QS.length} plain-language questions`), true, "help tour: the question count is QS.length");
  out.push(`question count: start screen, stepper (before and after picking a type) and help tour all say ${QS.length}`);

  /* ---------- B2. the keyboard on the questions ---------- */
  // a number key on question 1 picks an answer (it used to bounce back to the purpose card)
  pm = fromPreset("teen_social"); pm.stage = "start"; pm.example = false; renderPremortem();
  eq(introSeen("premortem"), true, "precondition: purpose card seen");
  click({act:"new"});
  // what partINTRO's page-level click listener does after the tool's own handler has run
  (docL.click || []).forEach(f => f({target:{closest: sel => sel === '[data-act="new"]' ? {} : null}}));
  eq(introSeen("premortem"), true, "Start a new assessment must not re-arm the purpose card");
  key("1"); h = view.innerHTML;
  eq(/Find out how your feature could be misused/.test(h), false, "a number key on question 1 does not return to the purpose card");
  eq(pm.type, PLATFORMS[0].k, "a number key on question 1 picks that option");
  eq(/Question 1 of/.test(h), true, "still on question 1");
  // Enter / number keys on the under-18 question
  fresh(); click({set:"type", v:"marketplace"});
  key("Enter"); key("Enter"); // type -> features -> under-18
  eq(crumb()[0], 3, "reached the under-18 question");
  key("Enter");
  eq(crumb()[0], 3, "Enter does not skip the under-18 question");
  eq(els["#pm-toast"].textContent.includes("Pick an answer"), true, "Enter says why it waits");
  eq(pm.youth, "", "and nothing was recorded");
  eq(/Enter waits for an answer here/.test(view.innerHTML), true, "the hint under the question says so");
  eq(/Skip for now/.test(view.innerHTML), true, "Skip for now stays visible as a button");
  click({next:"1"}); eq(crumb()[0], 4, "the Skip for now button still skips, on purpose");
  fresh(); click({set:"type", v:"marketplace"}); key("Enter"); key("Enter");
  key("3"); eq(pm.youth, "adult_self", "a number key answers it");
  key("Enter"); eq(crumb()[0], 4, "and then Enter continues");
  out.push("keyboard: a number key on question 1 picks an option and never returns to the intro card; Enter waits on the under-18 question while the Skip button still skips; a number key answers it");

  /* ---------- B1. no grade, no 'severe', until the under-18 question is answered ---------- */
  const market = Object.assign(blankPM(), JSON.parse(JSON.stringify(PRESETS.marketplace)), {youth:"", name:"Resale", stage:"report"}); QS.forEach(q => { market.answered[q.k] = true; }); market.answered.youth = false;
  pm = market; let r = assess(pm);
  eq(r.youthPending, true, "assess: pending when the under-18 answer is missing");
  eq(r.risks.some(x => x.cat === "child"), false, "assess: child-safety risks are left unrated, not assumed worst-case");
  eq(r.pendingChild > 0, true, "assess: says how many child-safety risks wait");
  h = startHere(r);
  eq(h.includes("Answer the under-18 question to rate child-safety risks"), true, "verdict: asks for the answer");
  eq(/class="grade/.test(h), false, "verdict: no letter grade");
  eq(/severe risk exposure/i.test(h), false, "verdict: no 'severe' exposure on the strength of child-safety risks");
  eq(h.includes('data-goq="youth"'), true, "verdict: a button goes to the question");
  eq(/bench-line/.test(h), false, "verdict: no benchmark line while ungraded");
  eq(reportMarkdown(r).includes("not graded yet"), true, "markdown export says it is not graded");
  const r2 = assess(Object.assign({}, market, {youth:"adult_self"}));
  eq(r2.youthPending, false, "answering rates them");
  eq(r2.risks.some(x => x.cat === "child"), true, "and the child-safety risks come back");
  pm = Object.assign({}, market, {youth:"adult_self"}); eq(/class="grade/.test(startHere(r2)), true, "answered: the grade is shown");
  // the old failure: a teen-social-shaped 'F' for a furniture marketplace
  const blankMk = Object.assign(blankPM(), {type:"marketplace", features:PLATFORMS.find(p => p.k === "marketplace").f.slice(), money:["p2p","payouts"], regions:["us"], identity:"pseudo", contact:"limited", scale:"small", team:"parttime", adult:"none", stage:"report", name:"Furniture"});
  pm = blankMk; const rb = assess(pm); eq(rb.posture[0], "Partly rated", "a marketplace with the under-18 question unanswered is 'Partly rated', not Severe");
  eq(/Partly rated/.test(livePanel(rb)), true, "the live panel says so too");
  out.push(`verdict: with the under-18 answer missing a marketplace gets "Answer the under-18 question to rate child-safety risks", no grade, ${r.pendingChild} child-safety risks held back (overall band: ${rb.posture[0]}); answering brings the grade and the risks back`);

  /* ---------- B3. the product type's own harms lead ---------- */
  pm = Object.assign({}, market, {youth:"adult_self"}); r = assess(pm);
  const first = r.safeguards.filter(s => !pm.done[s.id]).sort((a, b) => (sgOwn(b, pm.type) && b.rank >= 2 ? 1 : 0) - (sgOwn(a, pm.type) && a.rank >= 2 ? 1 : 0) || b.rank - a.rank)[0];
  h = startHere(r);
  const firstTitle = (h.match(/class="firstlist"><li>[\s\S]*?class="t">([\s\S]*?)<\/span>/) || [])[1] || "";
  eq(sgOwn(first, "marketplace"), true, "the lead action protects against a marketplace's own harms (fraud, prohibited goods, integrity)");
  eq(/law-enforcement request process/i.test(firstTitle), false, "the law-enforcement request process no longer leads for a marketplace");
  eq(/Ordered by the harms most common for marketplace or e-commerce, ahead of the actions every platform needs/.test(h), true, "and the list says how it is ordered");
  const topCatsOf = s => (s.cats || []).join();
  eq(r.safeguards.filter(s => sgOwn(s, "marketplace")).length > 0 && (first.cats || []).some(c => TYPE_CATS.marketplace.includes(c)), true, "the lead action covers a risk in " + TYPE_CATS.marketplace.join("/") + ": " + topCatsOf(first));
  Object.keys(PLATFORMS.reduce((a, p) => (a[p.k] = 1, a), {})).forEach(k => eq(Array.isArray(TYPE_CATS[k]) && TYPE_CATS[k].length >= 2 && TYPE_CATS[k].every(c => !!CATS[c]), true, "every product type has own harm areas: " + k));
  // within a tier the same ordering holds in the full plan
  const tier = tabPlan(r); eq(bad(tier), false, "plan tab renders");
  out.push(`ordering: a marketplace's first action is "${txt(firstTitle).slice(0, 70)}...", from its own harm areas (${TYPE_CATS.marketplace.join(", ")}), before the universal block; all ${PLATFORMS.length} product types have harm areas`);

  /* ---------- B4. the benchmark names the reader's own kind of product ---------- */
  pm = Object.assign({}, market, {youth:"adult_self"}); h = startHere(assess(pm));
  const mb = pmBench(pm); eq(mb && mb.label, "growing marketplace", "benchmark label");
  eq(h.includes(`Typical for a growing marketplace like the built-in example: ${mb.band} risk exposure`), true, "the line reads Typical for a growing marketplace");
  eq(/teen social app/.test(h), false, "and no longer says teen social app");
  pm = Object.assign({}, market, {type:"workplace", youth:"adult_verified"}); eq(pmBench(pm), null, "no matching example: no benchmark");
  eq(/bench-line/.test(startHere(assess(pm))), false, "no matching example: the line is left out");
  pm = Object.assign({}, market, {type:"social", youth:"adult_verified"}); eq(pmBench(pm), null, "an adults-only social network is not benchmarked against a teen social app");
  pm = Object.assign({}, market, {type:"social", youth:"teens"}); eq(pmBench(pm).label, "growing teen social app", "a teen social app is");
  pm = Object.assign({}, market, {type:"gaming", youth:"kids"}); eq(pmBench(pm).label, "early-stage kids' game", "stage comes from the matching example");
  out.push("benchmark: 'Typical for a growing marketplace', 'growing teen social app', 'early-stage kids' game'; omitted when no example matches (workplace, adults-only social) or while ungraded");

  /* ---------- B5. no 'Cleared · Undo' with nothing to clear ---------- */
  undos = 0; pm = fromPreset("teen_social"); pm.stage = "start"; renderPremortem();
  click({act:"new"}); eq(undos, 0, "Start a new assessment from the start screen (an example is showing): no Cleared toast");
  click({act:"new"}); eq(undos, 0, "and again on the blank assessment it made: still nothing to clear");
  click({set:"type", v:"marketplace"}); click({act:"new"}); eq(undos, 1, "after answering something, starting over offers Undo");
  out.push("start over: no 'Cleared · Undo' on the start screen, on an example or on a blank assessment; Undo is offered once there are answers");

  /* ---------- B6. multi-select answers ---------- */
  fresh(); click({set:"type", v:"marketplace"});
  eq(pm.money.join(), "p2p,payouts", "a marketplace starts with the typical money flows pre-selected");
  for(let i = 0; i < 20 && !/Does money change hands/.test(view.innerHTML); i++){ if(/Could anyone under 18/.test(view.innerHTML)) key("3"); key("Enter"); } // answer the under-18 question on the way
  eq(/Does money change hands/.test(view.innerHTML), true, "reached the money question");
  if(!/Pre-selected for marketplace or e-commerce/.test(view.innerHTML)) throw new Error("note: " + (view.innerHTML.match(/gd-multi-n[^<]*</) || ["none"])[0] + " money=" + pm.money);
  eq(/Pre-selected for marketplace or e-commerce/.test(view.innerHTML), true, "the question says its options are pre-selected, and that keys switch them");
  key("5"); eq(pm.money.join(), "p2p,payouts,crypto", "a number key adds an option");
  key("Enter"); click({goq:"money"}); eq(pm.money.join(), "p2p,payouts,crypto", "the selection persists after Enter and coming back");
  // the reported loss: pressing the numbers of the options that were already on switches them off
  key("5"); key("2"); key("3");
  eq(pm.money.length, 0, "pressing 2 and 3 on the pre-selected options switches them off (they are toggles)");
  eq(pm.answered.money, false, "an emptied list is not recorded as an answer");
  eq(/Nothing is selected yet/.test(view.innerHTML), true, "and the question says nothing is selected");
  pm.stage = "report"; renderPremortem(); h = view.innerHTML;
  eq(/<span>Money<\/span><b>Not answered<\/b>/.test(h), true, "the report shows Not answered, not a silent 'None'");
  click({goq:"money"}); click({none:"money"});
  pm.stage = "report"; renderPremortem(); eq(/<span>Money<\/span><b>None<\/b>/.test(view.innerHTML), true, "only the explicit 'No money involved' button records None");
  click({goq:"money"}); click({toggle:"money", v:"p2p"}); click({toggle:"money", v:"payouts"}); pm.stage = "report"; renderPremortem();
  eq(/<span>Money<\/span><b>People pay each other, We pay people<\/b>/.test(view.innerHTML), true, "choosing the options again shows them in the report");
  out.push("multi-select: pre-selected defaults say so; number keys toggle and persist across Enter; an emptied list reads 'Not answered' (only the explicit button records 'None')");

  /* ---------- C. a key on the first question of every guided tool stays on the tool ---------- */
  // The purpose card is shown once per route. An old Start over listener cleared that flag after the tool had drawn its first
  // question, so the next redraw (a key press) fell back to the card. For each tool: past the card, to its first choice
  // question, the Start over click as the page delivers it, then a number key. The question must advance, the card stay away.
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  view.querySelector = s => (s === ".gd-s-q" && /gd-s-q/.test(view.innerHTML)) ? {} : null; view.contains = () => true;
  const toChoice = () => { for(let i = 0; i < 12; i++){ const p = gdPos(gdCur.k), s = gdLive(gdCur)[p.i]; if(s.kind === "single" || s.kind === "multi") return s; if(s.kind === "text" && !s.opt) s.set("Test"); gdGo(gdCur, "next"); } throw new Error("no choice question found"); };
  const GD = (route, setup, selector) => ({route, selector, setup, first: () => { gdGo(gdCur, "start"); toChoice(); return () => { const p = gdPos(gdCur.k); return p.scr + p.i; }; }});
  const tools = [
    GD("coppa", () => { cp = CP_BLANK(); cpView = null; gdReset("coppa"); renderCoppa(); }, '[data-cp="reset"]'),
    GD("dsa", () => { ds = DS_BLANK(); dsView = null; gdReset("dsa"); renderDsa(); }, '[data-ds="reset"]'),
    GD("grooming", () => { gp = GP_BLANK(); gpView = null; gdReset("grooming"); renderGrooming(); }, '[data-gp="reset"]'),
    GD("reporting", () => { cr = CR_BLANK(); crView = null; gdReset("reporting"); renderReporting(); }, '[data-cr="reset"]'),
    // the eval is one page, not a question flow: there is no number key, so a redraw (what an edit or click triggers) stands in for it
    {route:"eval", selector:'[data-ev="reset"]', setup: () => { ev = EV_BLANK(); gdReset("eval"); renderEval(); }, first: () => () => "page", redraw: () => renderEval()},
    GD("policy", () => { polView = null; gdReset("policy"); renderPolicy(); }, "#pol-reset"),
    {route:"maturity", selector:'[data-ma="reset"]', setup: () => { ma = maInit({stage:"growth", lv:{}, done:{}, ex:false, open:"policy"}); maG = null; maView = null; renderMaturity(); },
      first: () => { maGo("guide"); eq(["q", "stage"].includes(maG.scr), true, "maturity guide opens on a question"); document.body.dataset.route = "maturity"; return () => maG.scr + maG.i; }},
    {route:"coverage", selector:'[data-cv="reset"]', setup: () => { cv = {src:null, ex:false, r:{}}; cvG = null; cvView = null; renderCoverage(); },
      first: () => { cvGo("start"); cvGo("first"); eq(cvG.scr, "q", "coverage on its first question"); document.body.dataset.route = "coverage"; return () => cvG.scr + cvG.a + "/" + cvG.l; }}
  ];
  for(const T of tools){
    store.set("intro:" + T.route, true); location.hash = "#" + T.route;
    T.setup(); eq(/data-introbtn="start"/.test(view.innerHTML), false, T.route + ": past the card, the tool's own first screen shows");
    let pos, before; try{ pos = T.first(); before = pos(); }catch(e){ throw new Error(T.route + ": " + e.message); }
    // the Start over control being clicked, through every page-level click listener, as the page delivers it
    (docL.click || []).forEach(f => f({target:{closest: sel => sel === T.selector ? {} : null}}));
    eq(introSeen(T.route), true, T.route + ": Start over must not re-arm the purpose card");
    if(T.redraw){ T.redraw(); eq(/data-introbtn="start"/.test(view.innerHTML), false, T.route + ": a redraw after Start over does not return to the purpose card"); document.body.dataset.route = ""; continue; }
    key("1"); await sleep(320);
    eq(/data-introbtn="start"/.test(view.innerHTML), false, T.route + ": a number key on the first question does not return to the purpose card");
    eq(pos() !== before, true, T.route + ": the number key answered it and the question advanced (was " + before + ", now " + pos() + ")");
    document.body.dataset.route = "";
  }
  out.push("intro card: a number key on the first question of coppa, dsa, policy, maturity and coverage advances (and a redraw of the one-page eval) never returns to the purpose card, even after a Start over click");

  return out.join("\n");
};
const rdSrc = "const rd_ = f => require('fs').readFileSync(require('path').join(" + JSON.stringify(D) + ", f), 'utf8');\n";
const src = stub + extra + rdSrc + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"),
  rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"),
  rd("partOV.js"), rd("partRC.js"), rd("partPF.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partTR.js"), rd("partHELP.js"), rd("partTYPE.js"), rd("partGD.js"),
  rd("partINTRO.js"), rd("partCP.js"), rd("partDSA.js"), rd("partGP.js"), rd("partCR.js"), rd("partEV.js"), rd("partEV2.js"), rd("partEVB.js"), rd("partRX.js"), rd("partLOOP.js"), rd("partPLAN.js"), rd("partREV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
new Function("require", src)(require).then(console.log);
