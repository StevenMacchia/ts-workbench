// Loads the built app with the test stub and writes every tool's knowledge base to data.json for the GitHub repos.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const types = TT_TYPES.filter(t => t.k !== "all");
  const scen = SCENARIOS.map((s, i) => ({i, types:s.types || [], tailored:!!s.tailored,
    versions:(s.tailored ? types.map(t => t.k) : [(s.types || [])[0]]).map(k => { const v = ttScenario(i, k); return {type:k, v}; })}));
  pol = Object.assign(POL_BLANK(), POL_FULL_EXAMPLE); const polP = polPrompt();
  return JSON.stringify({
    premortem:{CATS, PLATFORMS, YOUTH, AUD, ADULT, IDENTITY, CONTACT, MONEY, REGIONS, SCALE, TEAM, FEATURES, FGROUPS, OWNERS, EFFORT, SG, HARMS, OBL, DECISIONS, BANDS, TIERS},
    tabletop:{TT_TYPES, scenarios:scen},
    metrics:{LAYERS, TIER, METRICS, VANITY, MX_PLATFORMS, MX_LOGS, MX_UNITS, MX_LAYER_HOW, MX_HOW, MX_PF, MX_PF_ON, MX_Q, MX_SC, MX_GLOSS, MX_SAMPLE, MX_RV, MX_TARGETS, MX_DEMO},
    vendors:{CRITERIA, DEFAULT_V, VD_Q, VD_RUBRIC},
    maturity:{MA_LEVELS, MA_AREAS, MA_STAGES, MA_ORDER, MA_PHASES, MA_EXAMPLE},
    coverage:{CV_AREAS:CV_AREAS.map(a => ({k:a.k, n:a.n, cats:a.cats.map(c => CATS[c])})), CV_LEVELS, CV_LAYER_WEIGHT, CV_EXAMPLE, CV_LAYERS:CV_LAYERS.map(l => ({k:l.k, n:l.n, q:l.q, lv:l.lv, act:l.act("{harm area}"), tool:l.tool}))},
    ai:{tools:Object.fromEntries(Object.entries(AI_TOOLS).map(([k, T]) => [k, {n:T.n, wip:!!T.wip, desc:T.desc, q:T.q, steps:T.steps, fields:T.fields, example:T.example, prompt:T.prompt(T.example), sample:T.sample}])),
        policy:{examples:typeof POL_EXAMPLES !== "undefined" ? POL_EXAMPLES : null, full:typeof POL_FULL_EXAMPLE !== "undefined" ? POL_FULL_EXAMPLE : null, prompt:polP}}
  }, null, 1);
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
const out = new Function(src)();
fs.writeFileSync(path.join(process.argv[2] || D, "data.json"), out);
console.log("data.json written, " + Math.round(out.length / 1024) + " KB");
