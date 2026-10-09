// Checks the shared intro component (partINTRO.js): every INTRO_SPECS entry is a real route with
// all its fields, within the word limits, with 3 to 5 walkthrough screens; introSeen flips after
// Start and the tool's own first screen runs; and, for every one of the 16 routes it covers, the
// purpose card shows in place of the tool's first screen on first visit and gets out of the way
// once introMark has run. Pattern follows test-rt.js: the stub and a module list from test-v9.js,
// then calling the real render functions directly, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
// partHELP.js calls window.addEventListener (scroll, hashchange) once it loads; the v9 stub's window
// only has scrollTo, since no existing test needed it before this one.
const extra = "window.addEventListener = function(){};\n";
const body = function(){
  const out = [], eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const bad = h => /undefined|NaN|\[object/.test(h);
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  const wc = s => String(s).replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  // Routes this build actually registers (same flat list test-tsg.js uses, since the harness doesn't
  // assemble the real ROUTES object).
  const VALID_ROUTES = ["overview", "premortem", "tabletop", "metrics", "vendors", "workspace", "tools", "plan", "review", "dsa", "eval", "about", "roost", "credits", "learn", "redteamllm", "redteamworld", "glossary", "tsglossary", "redteam", "policy", "coppa", "maturity", "coverage", "notice", "appeal", "transparency"];
  const routes = Object.keys(INTRO_SPECS);
  eq(routes.length, 16, "sixteen tools get the shared intro");
  routes.forEach(r => { if(!VALID_ROUTES.includes(r)) throw new Error("not a real route: " + r); });
  out.push("every INTRO_SPECS key is a real route (" + routes.length + " of them)");

  // 1) Every spec has all its fields, the card stays under 60 words, and each walk screen is sound
  routes.forEach(route => {
    const s = INTRO_SPECS[route];
    ["heading", "who", "leave", "mins", "walk"].forEach(k => { if(!s[k]) throw new Error(route + ": spec missing " + k); });
    const bodyWords = wc(s.who) + wc(s.leave) + wc(s.mins);
    if(bodyWords > 60) throw new Error(route + ": card body is " + bodyWords + " words, over 60");
    if(!Array.isArray(s.walk) || s.walk.length < 3 || s.walk.length > 5) throw new Error(route + ": walk has " + (s.walk && s.walk.length) + " screens, want 3 to 5");
    s.walk.forEach((sc, i) => {
      if(!sc.title || !sc.line || !sc.preview) throw new Error(route + " walk " + i + ": missing title, line or preview");
      if(wc(sc.line) > 40) throw new Error(route + " walk " + i + ": line is " + wc(sc.line) + " words, over 40");
      const h = introWalkHTML(route, i);
      if(bad(h)) throw new Error(route + " walk " + i + " bad html: " + where(h));
      if(!h.includes(sc.title)) throw new Error(route + " walk " + i + ": doesn't show its own title");
      eq(/data-walk="back"/.test(h), i > 0, route + " walk " + i + ": Back button except the first");
      eq(/data-walk="next"/.test(h), i < s.walk.length - 1, route + " walk " + i + ": Next button except the last");
      eq(/data-walk="start"/.test(h), i === s.walk.length - 1, route + " walk " + i + ": only the last screen offers Start");
    });
  });
  out.push("every spec: heading, who, leave, mins, card under 60 words, 3 to 5 walk screens each under 40 words");

  // 2) introSeen flips after Start, and the tool's real first screen (the onStart callback) runs
  store.set("intro:premortem", false);
  eq(introSeen("premortem"), false, "premortem: not seen before Start");
  let started = false;
  introStart("premortem", () => { started = true; });
  eq(introSeen("premortem"), true, "premortem: seen once Start runs");
  eq(started, true, "premortem: Start calls through to the tool's own first screen");
  store.set("intro:premortem", false);
  out.push("introSeen flips after Start, and Start calls through to the tool's own first screen");

  // 3) helpBtn carries exactly one button, "How this works", which opens the walkthrough on these routes
  // (the live page tour is offered from the walkthrough's last screen instead of as a second button)
  routes.forEach(route => {
    location.hash = "#" + route;
    const hb = helpBtn();
    if(!/data-intro="how"/.test(hb)) throw new Error(route + ": helpBtn is missing the How this works link");
    if(/data-help="tour"/.test(hb)) throw new Error(route + ": helpBtn still renders a second, page-tour button");
    if((hb.match(/<button/g) || []).length !== 1) throw new Error(route + ": helpBtn should render exactly one button");
  });
  out.push("helpBtn renders exactly one button, How this works, on all 16 routes; the page tour is offered from the walkthrough's last screen");

  // 4) Each tool's own render: the card on first visit, its own first screen once introMark has run
  const RENDER = {
    premortem:renderPremortem, tabletop:renderTabletop, maturity:renderMaturity, coverage:renderCoverage,
    metrics:renderMetrics, vendors:renderVendors, policy:renderPolicy, coppa:renderCoppa, dsa:renderDsa, eval:renderEval,
    notice:() => renderAI("notice"), appeal:() => renderAI("appeal"), transparency:() => renderAI("transparency"),
    plan:renderPlan, review:renderReview, workspace:renderWorkspace
  };
  eq(Object.keys(RENDER).length, 16, "a render check for every one of the 16 routes");
  routes.forEach(route => {
    store.set("intro:" + route, false);
    RENDER[route]();
    let h = view.innerHTML;
    if(bad(h)) throw new Error(route + ": card has bad values: " + where(h));
    if(!h.includes(INTRO_SPECS[route].heading)) throw new Error(route + ": card heading missing on first visit");
    eq(/data-introbtn="start"/.test(h) && /data-introbtn="how"/.test(h) && /data-introbtn="skip"/.test(h), true, route + ": Start, Show me how it works and Skip all present");
    introMark(route);
    RENDER[route]();
    h = view.innerHTML;
    if(bad(h)) throw new Error(route + ": real screen has bad values: " + where(h));
    eq(/data-introbtn="start"/.test(h), false, route + ": card is gone once introMark has run");
    store.set("intro:" + route, false);
  });
  out.push("all 16 routes: the card shows on first visit, and the tool's own first screen shows once introMark has run");

  return out.join("\n");
};
const src = stub + extra + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"),
  rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"),
  rd("partOV.js"), rd("partRC.js"), rd("partPF.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partTR.js"), rd("partHELP.js"), rd("partTYPE.js"), rd("partGD.js"),
  rd("partINTRO.js"), rd("partCP.js"), rd("partDSA.js"), rd("partEV.js"), rd("partEV2.js"), rd("partEVB.js"), rd("partRX.js"), rd("partLOOP.js"), rd("partPLAN.js"), rd("partREV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
