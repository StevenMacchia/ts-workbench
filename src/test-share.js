// Copy link on every tool that has a shareable result. For each route that registers a SHARE_APPLY entry, this
// opens the tool on its built-in example, presses the real "Copy link" button through the page's own click
// handler, and checks that nothing throws, that the link carries the state (and a summary with no missing
// numbers), that the state survives encode then decode, and that applying the decoded data renders the report.
// A route that registers a share handler without a case here fails the test, so a new tool cannot skip it.
// Also here, because they use the same drivers: Start over then Undo puts the guided tools back on the screen they were on,
// their report headers carry the full house set from the first render, and the command palette finds a tool by its route name.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, base = v9.slice(s0, v9.indexOf("`;", s0));
const A = "const $ = s => (els[s] = els[s] || fake()); const $$ = () => [];";
if(!base.includes(A)) throw new Error("test-v9.js stub changed: $ / $$ line not found");
const stub = base.replace(A, () => `
const rootL = {}, docL = {};
const $ = s => { if(!els[s]){ const o = fake(); o.addEventListener = (t, fn) => { (rootL[s] = rootL[s] || {}); (rootL[s][t] = rootL[s][t] || []).push(fn); }; els[s] = o; } return els[s]; };
const $$ = () => [];
`).replace("document = {addEventListener(){}", () => "document = {querySelector(){ return null; }, body:{dataset:{}, appendChild(){}}, createElement(){ return fake(); }, addEventListener(t, fn){ (docL[t] = docL[t] || []).push(fn); }");
const extra = "window.addEventListener = function(){}; view.contains = () => true; view.querySelector = () => null;\n";

const body = async function(){
  const out = [], eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const bad = h => /undefined|NaN|\[object/.test(h);
  const clone = o => JSON.parse(JSON.stringify(o));
  const captured = [];
  shareCopy = function(route, state, summary){ captured.push({route, state, summary}); };
  // Press the Copy link button the report draws: a data-<tool>="sharelink" attribute goes through the page-level click
  // handlers, a button with an id has an onclick the render bound, and the pre-mortem's lives on its root element
  const press = html => {
    let m = html.match(/<button[^>]*\sdata-([a-z]+)="sharelink"/);
    if(m){
      const attr = m[1], btn = {dataset:{[attr]:"sharelink"}}, hit = sel => sel === "button" || sel.indexOf("[data-" + attr + "]") >= 0 || sel.indexOf("[data-" + attr + ",") >= 0 ? btn : null;
      if(attr === "act") return (rootL["#pm-root"].click || []).slice(-1).forEach(f => f({target:{closest: sel => sel === "button" ? {dataset:{act:"sharelink"}} : null}}));
      const e = {target:{closest: hit}, preventDefault(){}};
      (docL.click || []).forEach(f => f(e)); if(typeof view.onclick === "function") view.onclick(e); return;
    }
    m = html.match(/<button[^>]*\sid="([a-z-]*sharelink)"/);
    if(m) return $("#" + m[1]).onclick();
    throw new Error("no Copy link button in the report");
  };
  const cases = {
    premortem:{set:() => { pm = fromPreset("teen_social"); pm.stage = "report"; }, render:() => renderPremortem()},
    coverage:{set:() => { cv = clone(CV_EXAMPLE); }, render:() => renderCoverage()},
    maturity:{set:() => { ma = maExample(); }, render:() => renderMaturity()},
    vendors:{set:() => { vx = clone(DEFAULT_V); vdView = "results"; }, render:() => renderVendors()},
    policy:{set:() => { pol = Object.assign(POL_BLANK(), clone(POL_FULL_EXAMPLE)); pol.heur = polHeuristics(pol.rule); polView = null; }, render:() => renderPolicy()},
    eval:{set:() => { ev = Object.assign(EV_BLANK(), clone(EV_EXAMPLE)); evView = "page"; }, render:() => renderEval(), act:() => evAct("sharelink")},
    dsa:{set:() => { ds = Object.assign(DS_BLANK(), clone(DS_EXAMPLE)); dsView = null; }, render:() => renderDsa()},
    coppa:{set:() => { cp = Object.assign(CP_BLANK(), clone(CP_EXAMPLE)); cpView = null; }, render:() => renderCoppa()},
    grooming:{set:() => { gp = Object.assign(GP_BLANK(), clone(GP_EXAMPLE)); gpView = null; }, render:() => renderGrooming()},
    reporting:{set:() => { cr = Object.assign(CR_BLANK(), clone(CR_EXAMPLE)); crView = null; }, render:() => renderReporting()},
    postmortem:{set:() => { px = Object.assign(PX_BLANK(), clone(PX_EXAMPLE)); pxView = null; }, render:() => renderPostmortem()},
    transparency:{set:() => { tr = Object.assign(TR_BLANK(), clone(TR_EXAMPLE), {view:"report"}); trView = null; }, render:() => renderTransparency()}
  };
  const registered = Object.keys(SHARE_APPLY).sort(), covered = Object.keys(cases).sort();
  eq(registered.join(","), covered.join(","), "every route with a SHARE_APPLY entry has a case in test-share.js (add one for a new tool)");
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for(const route of registered){
    const T = cases[route];
    store.set("intro:" + route, true); location.hash = "#" + route;
    T.set(); T.render(); let h = view.innerHTML;
    if(bad(h)) throw new Error(route + ": the report draws a bad value");
    captured.length = 0;
    try{ if(T.act) T.act(); else press(h); }catch(e){ throw new Error(route + ": Copy link threw " + e.message); }
    eq(captured.length, 1, route + ": Copy link builds exactly one link");
    const c = captured[0]; eq(c.route, route, route + ": the link is for its own route");
    // the summary the link falls back to when the answers are too big: no field missing or not a number
    if(c.summary && typeof c.summary === "object") Object.keys(c.summary).forEach(k => {
      const v = c.summary[k]; if(v === undefined || (typeof v === "number" && isNaN(v))) throw new Error(route + ": summary field " + k + " is " + v); });
    else eq(typeof c.summary, "string", route + ": the summary is a string or an object");
    const code = await shareEncode(c.state), back = await shareDecode(code);
    eq(!!back, true, route + ": the link decodes"); eq(same(back, c.state), true, route + ": the answers survive encode and decode");
    const small = await shareDecode(await shareEncode(c.summary)); eq(same(small, c.summary), true, route + ": the summary survives encode and decode");
    // a visitor opening the link: the decoded data is applied and the report draws
    SHARE_APPLY[route](back); T.render(); h = view.innerHTML;
    if(bad(h)) throw new Error(route + ": the shared report draws a bad value");
    eq(/You're viewing a shared result/.test(h), true, route + ": the shared report carries the banner");
  }
  // ---- Start over, then Undo: back on the same screen, report or one-page form
  let undo = null; withUndo = (label, snap, restore) => { undo = () => restore(snap); };
  const guided = {
    dsa:{set:() => { ds = Object.assign(DS_BLANK(), clone(DS_EXAMPLE), {ex:false, view:"report"}); dsView = null; }, render:() => renderDsa(), act:a => dsAct(a), edit:() => dsAct("edit"), here:() => ds.tier === "platform"},
    coppa:{set:() => { cp = Object.assign(CP_BLANK(), clone(CP_EXAMPLE), {ex:false, view:"report"}); cpView = null; }, render:() => renderCoppa(), act:a => cpAct(a), edit:() => cpAct("edit"), here:() => !!cp.aud},
    grooming:{set:() => { gp = Object.assign(GP_BLANK(), clone(GP_EXAMPLE), {ex:false, view:"report"}); gpView = null; }, render:() => renderGrooming(), act:a => gpAct(a), edit:() => gpAct("edit"), here:() => !!gp.youth},
    reporting:{set:() => { cr = Object.assign(CR_BLANK(), clone(CR_EXAMPLE), {ex:false, view:"report"}); crView = null; }, render:() => renderReporting(), act:a => crAct(a), edit:() => crAct("edit"), here:() => (cr.regions || []).length > 0},
    transparency:{set:() => { tr = Object.assign(TR_BLANK(), clone(TR_EXAMPLE), {view:"report"}); trView = null; }, render:() => renderTransparency(), act:a => trAct(a), edit:() => trAct("edit"), here:() => !!tr.org}
  };
  for(const route of Object.keys(guided)){
    const T = guided[route]; store.set("intro:" + route, true); location.hash = "#" + route;
    // the header on the first render of a report: the whole house set, in order
    T.set(); T.render(); let h = view.innerHTML;
    const order = [">See an example<", ">Edit answers<", ">Start over<", "Save", "Download"].map(s => s === "Save" ? h.search(/data-[a-z]+="save"/) : h.indexOf(s));
    if(route !== "transparency") order.splice(4, 1, h.search(/data-[a-z]+="(memo|brief)"/));
    if(order.some(i => i < 0) || order.some((i, k) => k && i < order[k - 1])) throw new Error(route + ": report header is not See an example, Edit answers, Start over, Save, Download in order " + order.join(","));
    // from the report
    undo = null; T.act("reset"); eq(T.here(), false, route + ": Start over clears the answers"); eq(typeof undo, "function", route + ": Start over offers Undo");
    undo(); eq(T.here(), true, route + ": Undo brings the answers back"); h = view.innerHTML;
    eq(/pol-verdict|tr-report|trr-/.test(h) || !/data-gd="start"/.test(h), true, route + ": Undo from the report lands on the report, not the intro");
    eq(/data-gd="start"/.test(h), false, route + ": no intro card after Undo from the report");
    // from the one-page form, reached through Edit answers
    T.set(); T.render(); T.edit(); const formHtml = view.innerHTML;
    undo = null; T.act("reset"); undo(); eq(view.innerHTML === formHtml, true, route + ": Undo from the form lands on the same form");
  }
  // Transparency: See an example lands on the example's report with the example banner, not the guided intro
  { store.set("intro:transparency", true); location.hash = "#transparency"; tr = TR_BLANK(); trView = null; gdReset("transparency"); renderTransparency(); trAct("example"); const h = view.innerHTML;
    eq(/This is an example/.test(h) && /tr-report/.test(h), true, "transparency: the example opens its report with the example banner");
    eq(/data-gd="start"|Pick up where you left off/.test(h), false, "transparency: not the guided intro");
    eq(/>See an example</.test(h), false, "transparency: the header does not offer the example while showing it");
    trAct("edit"); eq(tr.ex, false, "transparency: editing leaves example mode"); }
  // Notice and appeal: Clear gets the same Undo
  { store.set("intro:notice", true); aiPut("notice", Object.assign(aiGet("notice"), {f:clone(AI_TOOLS.notice.example)})); aiView.notice = "page"; location.hash = "#notice"; renderAI("notice");
    undo = null; $("#ai-clear").onclick(); eq(typeof undo, "function", "notice: Clear offers Undo"); eq(Object.keys(aiGet("notice").f).length, 0, "notice: Clear empties the form");
    undo(); eq(Object.keys(aiGet("notice").f).length > 0, true, "notice: Undo restores the answers"); }
  // ---- the command palette matches route names and hyphen-less spellings
  { const find = q => { $("#cmdk-q").value = q; cmdk.items = cmdkItems(); cmdk.sel = 0; cmdkDraw(); return cmdk.shown.map(x => x.label); };
    eq(find("premortem").includes("Abuse pre-mortem"), true, "premortem finds the Abuse pre-mortem"); eq(find("pre-mortem").includes("Abuse pre-mortem"), true, "pre-mortem still does");
    eq(find("postmortem").includes("Incident post-mortem"), true, "postmortem finds the Incident post-mortem"); eq(find("dsa").includes("DSA readiness"), true, "a route name finds its tool"); }
  out.push("Start over then Undo, the full header on first render, Clear with Undo on notice, and palette matching on route names: checked");
  out.push("Copy link: " + registered.length + " tools (" + registered.join(", ") + ") build a link without throwing, round-trip it and open it as a shared report");
  return out.join("\n");
};
const files = [
  "partT.js", "partD.js", "partE1.js", "partE2.js", "partF1.js", "_F2.js", "partW1.js", "_L.js", "_F3_9.js", "_G.js", "_W9.js",
  "partNav.js", "partH4.js", "partH2.js", "partAbout.js", "partCredits.js", "partPol.js", "partPol2.js", "partAI.js",
  "partMAd.js", "partMA.js", "partCV.js", "partOV.js", "partRC.js", "partPF.js", "partTK.js", "partORG.js", "partJN.js",
  "partNX.js", "partTTF.js", "partTR.js", "partDEMO.js", "partHELP.js", "partTYPE.js", "partGD.js", "partCP.js",
  "partDSA.js", "partPX.js", "partGP.js", "partCR.js", "partEV.js", "partEV2.js", "partEVB.js", "partRX.js", "partLOOP.js", "partPLAN.js", "partREV.js"
];
const src = stub + extra + files.map(rd).join("\n") + "\nreturn (" + body.toString() + ")();";
new Function(src)().then(console.log, e => { console.error(e.message); process.exit(1); });
