// Renders every tab and every metric guide of the Metrics page, and checks the scorecard logic, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const names = new Set(METRICS.map(m => m.n));
  METRICS.forEach(m => { const H = MX_HOW[m.n]; if(!H) throw new Error("no how for " + m.n);
    ["f","q","cad","own","ex","mvp","pair"].forEach(k => { if(!H[k]) throw new Error(m.n + " missing " + k); });
    if(H.steps.length < 3) throw new Error(m.n + " few steps");
    if(!names.has(H.pair) || H.pair === m.n) throw new Error(m.n + " bad pair " + H.pair);
    H.src.forEach(k => { if(!MX_LOGS[k]) throw new Error(m.n + " bad log " + k); });
    if(!MX_DIR[H.dir] || !MX_RV[H.rv]) throw new Error(m.n + " bad dir/rv");
    if(!MX_SC[m.n]) throw new Error(m.n + " has no scorecard measure");
    if(!MX_Q[m.n] || !MX_Q[m.n].endsWith("?")) throw new Error(m.n + " has no plain-English question");
    if(m.p !== "all") m.p.forEach(p => { if(!MX_PLATFORMS[p]) throw new Error(m.n + " unknown platform " + p); }); });
  Object.keys(MX_HOW).concat(Object.keys(MX_SC), Object.keys(MX_PF)).forEach(k => { if(!names.has(k)) throw new Error("orphan entry " + k); });
  let notes = 0; Object.values(MX_PF).forEach(o => Object.keys(o).forEach(p => { notes++; if(!MX_PLATFORMS[p] || !MX_PF_ON[p]) throw new Error("note for unknown platform " + p); }));
  Object.keys(MX_PLATFORMS).forEach(p => { if(!MX_UNITS[p] || !MX_PF_ON[p]) throw new Error("platform missing units/label " + p); });
  out.push(METRICS.length + " metrics, all with complete guides and a scorecard measure; " + Object.keys(MX_PLATFORMS).length + " platform types; " + notes + " platform notes");

  // Status logic
  const S = (dir, v, t, a) => { const m = {n:"__t"}; MX_HOW.__t = {dir}; const r = mxStatus(m, {__t:{v, t, a}}); delete MX_HOW.__t; return r; };
  eq(S("down","5","10","20"), "on", "down on"); eq(S("down","15","10","20"), "watch", "down watch"); eq(S("down","20","10","20"), "off", "down at line");
  eq(S("down","25","10","20"), "off", "down off"); eq(S("down","12","10",""), "off", "down missed, no line"); eq(S("down","5","","20"), "on", "down under line");
  eq(S("up","95","90","80"), "on", "up on"); eq(S("up","85","90","80"), "watch", "up watch"); eq(S("up","75","90","80"), "off", "up off");
  eq(S("band","5","4","8"), "on", "band in"); eq(S("band","9","4","8"), "off", "band out"); eq(S("down","0.12%","0.10%","0.15%"), "watch", "percent signs");
  eq(S("down","","10","20"), null, "no value"); eq(S("down","7","",""), "set", "value only"); eq(S("down","abc","10",""), null, "junk value");
  const seen = new Set(), g1 = mxGloss("Report the p90 and p50, and the p90 again, with basis points.", seen);
  eq((g1.match(/class="gl"/g)||[]).length, 3, "glossary marks each term once"); eq(g1.includes('data-tip="The median'), true, "glossary tip text");
  eq(mxGloss("<b>SLA</b>", new Set()).startsWith("&lt;b&gt;"), true, "glossary escapes HTML");
  out.push("glossary: " + Object.keys(MX_GLOSS).length + " terms, marked once per page, HTML escaped");
  out.push("status logic: 15 cases pass (on / watch / off, higher- and lower-is-better, ranges, typed % and $ signs)");

  let combos = 0, guides = 0, minN = 99, maxN = 0, shownNotes = 0;
  Object.keys(MX_PLATFORMS).forEach(p => ["1","2","3"].forEach(st => [true,false].forEach(reg => {
    mx = {platform:p, stage:st, reg}; const list = mxList(); combos++;
    minN = Math.min(minN, list.length); maxN = Math.max(maxN, list.length);
    MX_TABS.forEach(([t]) => { mx.tab = t; renderMetrics(); if(bad(view.innerHTML)) throw new Error("bad " + t + " " + p + st + reg + ": " + view.innerHTML.match(/.{60}(undefined|NaN|null).{40}/)); });
    mx.tab = "card"; renderMetrics(); const h = view.innerHTML;
    if((h.match(/class="mxm-(card|row)[ "]/g)||[]).length !== list.length) throw new Error("map size " + p + st);
    list.forEach(m => { guides++; mx.open = m.n; const g = mxArticle(m, list); mx.open = null; if(bad(g)) throw new Error("bad guide " + m.n); if(g.includes('class="mxa-pf"')) shownNotes++; if(!g.includes('class="mxf"')) throw new Error("no formula " + m.n); });
    mx.tab = "mine"; renderMetrics(); if((view.innerHTML.match(/class="mx-sc-row"/g)||[]).length !== list.length) throw new Error("scorecard rows " + p + st);
  })));
  out.push(combos + " combinations x " + MX_TABS.length + " tabs render cleanly; " + minN + " to " + maxN + " metrics per platform; " + guides + " guides checked, " + shownNotes + " with a platform note");
  const per = Object.keys(MX_PLATFORMS).map(p => { mx = {platform:p, stage:"3", reg:true}; const l = mxList(); return p + " " + l.filter(m => (MX_PF[m.n]||{})[p]).length + "/" + l.length; });
  out.push("platform notes per platform (mature stage): " + per.join(", "));

  mx = {platform:"fintech", stage:"3", reg:true, tab:"mine", period:"Q3 2026", have:{}, vals:{
    "Fraud loss rate":{v:"32", t:"25", a:"40"}, "Account takeover rate":{v:"1.9", t:"2", a:"3"}, "Appeal overturn rate":{v:"18%", t:"10", a:"15"}, "User-report rate":{v:"4"}}};
  renderMetrics(); const list = mxList(), h = view.innerHTML;
  out.push("fintech scorecard summary: " + (h.match(/id="mx-sc-sum">([\s\S]*?)<\/div>/)||[])[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  const csv = mxScoreCsv(list), md = mxScoreMd(list);
  if(csv.split("\n").length !== list.length + 1 || !csv.includes('"Watch"') || !csv.includes('"Off track"')) throw new Error("csv wrong");
  if(!md.includes("| Fraud losses (bps) | 32 | 25 | 40 | Watch |")) throw new Error("markdown row wrong: " + md.split("\n").find(l => l.includes("Fraud")));
  if(!mxPlanText(list).includes("## T&S scorecard: Q3 2026")) throw new Error("plan missing scorecard");
  out.push("exports: CSV " + csv.split("\n").length + " lines, markdown table and plan include the scorecard");
  mx.tab = "card"; mx.open = null; renderMetrics();
  out.push("map status chips: " + (view.innerHTML.match(/class="mxm-st (good|med|crit)"/g)||[]).length + " colored, e.g. " + (view.innerHTML.match(/class="mxm-st med"><i><\/i>([^<]+)/)||[])[1]);
  mx.open = "Fraud loss rate"; renderMetrics();
  if(!mx.read["Fraud loss rate"]) throw new Error("opening a metric should mark it read");
  if(!view.innerHTML.includes('id="mxp-3"') || !view.innerHTML.includes('class="mxa-q"')) throw new Error("article parts missing");
  out.push("article: " + (view.innerHTML.match(/<h2>([^<]+)/)||[])[1] + ", zone bar " + (view.innerHTML.includes('class="mxz-mark"') ? "shows the value" : "missing") + ", fraction " + (view.innerHTML.includes("mxf-frac") ? "drawn" : "missing"));
  const fx = METRICS.map(m => mxFormulaHTML(MX_HOW[m.n].f)); out.push("formulas: " + fx.filter(h => h.includes("mxf-frac")).length + " fractions, " + fx.filter(h => h.includes("mxf-diff")).length + " differences, " + fx.filter(h => !h.includes("mxf-frac") && !h.includes("mxf-diff")).length + " sentences");
  wsSaveTool("metrics", mx, metricsTitle(mx)); renderWorkspace(); if(bad(view.innerHTML)) throw new Error("workspace bad");
  out.push("workspace card: " + ((view.innerHTML.match(/\d+ on track<\/span>(<span class="pill med">\d+ watch<\/span>)?(<span class="pill crit">\d+ off track<\/span>)?/)||[""])[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "no status"));
  mx = {platform:"retired-type", stage:"2", reg:false}; renderMetrics(); out.push("unknown saved platform falls back to: " + mx.platform);

  // Addresses: each view has its own hash
  mx = {platform:"social", stage:"2", reg:true};
  const at = h => { location.hash = h; renderMetrics(); return view.innerHTML; };
  eq(/class="mxm-card/.test(at("#metrics")), true, "#metrics shows the map");
  eq((at("#metrics/violating-content-prevalence").match(/<h2>([^<]+)/)||[])[1], "Violating-content prevalence", "metric link opens its page");
  eq(view.innerHTML.includes('class="mxc"'), true, "metric page uses the compact header");
  eq(at("#metrics/scorecard").includes('id="mx-sc-sum"'), true, "scorecard link"); eq(at("#metrics/data").includes('class="card mx-log"'), true, "data link");
  eq(at("#metrics/program").includes("mx-rgrid"), true, "program link"); eq(/class="mxm-card/.test(at("#metrics/no-such-metric")), true, "unknown link falls back to the map");
  eq(METRICS.every(m => METRICS.filter(x => mxSlug(x) === mxSlug(m)).length === 1), true, "slugs are unique");
  const cm = cmdkItems().filter(x => x.g === "Metrics"); eq(cm.length, mxList().length, "search lists every metric");
  out.push("addresses: map, " + METRICS.length + " metric pages and 3 tabs each have a link; bad links fall back; search lists " + cm.length + " metrics");

  // Example numbers, saved periods, trends and the one-pager
  location.hash = "#overview"; mx = {platform:"market", stage:"3", reg:true, tab:"mine", vals:{"Fraud loss rate":{v:"50", t:"25", a:"40"}}, period:"Mine"};
  const l2 = mxList(); mxLoadDemo(l2); renderMetrics();
  eq(mx.demo && mx.hist.length === 3 && mx.period === "Q3 2026", true, "example numbers load 3 saved quarters plus the current one");
  const sparks = (view.innerHTML.match(/class="mx-spark"/g)||[]).length; eq(sparks, l2.filter(m => MX_DEMO[m.n]).length, "every example metric has a trend line");
  const fl = METRICS.find(m => m.n === "Fraud loss rate"); eq(mxSeries(fl).map(x => x.v).join(","), "41,36,31,24", "fraud series");
  eq(mxDelta(fl).good, "good", "falling fraud is good"); eq(/class="mxt"/.test(mxTrendHTML(fl)), true, "trend chart drawn");
  const op = mxOnePagerInner(l2); eq(/Needs attention/.test(op) && /op-tiles/.test(op) && !bad(op), true, "one-pager renders");
  eq(/<html/.test(mxOnePagerDoc(l2)) && mxOnePagerDoc(l2).includes("MX_OP") === false, true, "one-pager downloads as a standalone page");
  const csvH = mxScoreCsv(l2).split("\n")[0]; eq(csvH.includes('"Q4 2025"') && csvH.includes('"Value (Q3 2026)"'), true, "CSV includes saved periods");
  mxClearDemo(); eq(mx.vals["Fraud loss rate"].v + "|" + mx.period + "|" + !!mx.demo, "50|Mine|false", "clearing example numbers restores your own");
  eq(mxFmt(METRICS.find(m => m.n === "Graphic-exposure hours per reviewer"), 1), "1 person", "singular units");
  eq(mxOnePagerInner([]).includes("Nothing to show yet"), true, "empty one-pager explains itself");
  out.push("example numbers: " + sparks + " trend lines; one-pager, CSV history columns and restore-on-clear all work");
  eq(mxSampleN(0.1, 0.03, 1.96), 42642, "sample size at 0.1% ± 0.03"); eq(mxSampleN(0.1, 0.015, 1.96), 170568, "halving the margin needs 4x"); eq(mxSampleN(0, 1, 1.96), null, "invalid rate");
  Object.keys(MX_SAMPLE).forEach(k => { if(!names.has(k)) throw new Error("sample default for unknown metric " + k); });
  eq(mxGloss("Report to NCMEC in the transparency report.", new Set()).split('class="gl"').length - 1, 2, "late glossary terms are picked up");
  out.push("sample-size helper: 42,642 at 0.1% ± 0.03 points (95%); on " + Object.keys(MX_SAMPLE).length + " sampling metrics and the Data tab");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partOV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
