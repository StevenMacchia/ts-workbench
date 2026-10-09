// Checks the T&S glossary (partTSG.js): the term data is sound, the page renders every card,
// search and the group filter work, and the hover registration into GT_MORE adds without
// overriding, without a browser. Pattern follows test-rt.js: the stub and a reduced module
// list from test-v9.js, then calling the module's own functions directly.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); };
  const bad = h => /undefined|NaN|\[object/.test(h);

  // Routes this build actually registers (build-ws.js's ROUTES patch plus partR.js's base routes),
  // kept here as a flat list since the test harness doesn't assemble the real ROUTES object.
  const VALID_ROUTES = ["overview", "premortem", "tabletop", "metrics", "vendors", "workspace", "tools", "plan", "review", "dsa", "eval", "about", "roost", "credits", "learn", "redteamllm", "redteamworld", "glossary", "tsglossary", "redteam", "policy", "coppa", "maturity", "coverage", "notice", "appeal", "transparency"];

  // 1) Term count, definitions, groups, duplicate names, tool routes, related terms
  eq(TSG_TERMS.length >= 90 && TSG_TERMS.length <= 120, true, "term count is between 90 and 120, got " + TSG_TERMS.length);
  const names = TSG_TERMS.map(t => t.n);
  eq(names.length, new Set(names).size, "no duplicate term names");
  TSG_TERMS.forEach(t => {
    const words = t.d.trim().split(/\s+/).length;
    if(words > 40) throw new Error(t.n + ": definition is " + words + " words, over the 40-word limit");
    eq(TSG_GROUPS.includes(t.g), true, t.n + ": group \"" + t.g + "\" is not one of the nine valid groups");
    if(t.tool) eq(VALID_ROUTES.includes(t.tool), true, t.n + ": tool route \"" + t.tool + "\" is not a real route");
  });
  const nameSet = new Set(names);
  TSG_TERMS.forEach(t => (t.r || []).forEach(r => eq(nameSet.has(r), true, t.n + ": related term \"" + r + "\" doesn't match any term name")));
  out.push(`data: ${TSG_TERMS.length} terms, ${TSG_GROUPS.length} groups, every definition at or under 40 words, every tool route real, every related term resolves`);
  out.push("by group: " + TSG_GROUPS.map(g => g + " " + TSG_TERMS.filter(t => t.g === g).length).join(", "));

  // No attack strings or abuse instructions; child sexual abuse is policy and process only
  eq(TSG_TERMS.some(t => /CSAM|CSAE/.test(t.n)), true, "child safety terms are present");
  eq(TSG_TERMS.filter(t => t.g === "Child safety").every(t => !/here's how|step 1|instructions? for/i.test(t.d)), true, "child safety definitions are policy/process only, not instructions");

  // 2) The page renders with every card, grouped A to Z with a letter divider when it changes
  renderTsGlossary();
  const h = view.innerHTML;
  if(bad(h)) throw new Error("tsglossary render has a bad value: " + (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0]);
  eq((h.match(/class="card tsg-card"/g) || []).length, TSG_TERMS.length, "every term renders as a card on first load");
  eq((h.match(/class="tsg-letter"/g) || []).length > 1, true, "more than one letter divider across 103 terms A to Z");
  eq(/Looking for AI red-teaming terms.*#glossary/.test(h.replace(/\n/g, " ")), true, "cross-link to the red-teaming glossary is on the page");
  out.push("page: " + (h.match(/class="card tsg-card"/g) || []).length + " cards, " + (h.match(/class="tsg-letter"/g) || []).length + " letter dividers, cross-link to the red-teaming glossary");

  // 3) Search and the group filter (pure logic, exercised the way the page's own search box and chips call it)
  const sla = tsgFilter("sla", "all"); eq(sla.length, 1, "searching \"sla\" finds exactly one term"); eq(sla[0].n.startsWith("SLA"), true, "and it's the SLA term");
  const none = tsgFilter("notarealtermatall", "all"); eq(none.length, 0, "a search with no match returns nothing");
  const metricsOnly = tsgFilter("", "Metrics"); eq(metricsOnly.length, TSG_TERMS.filter(t => t.g === "Metrics").length, "the Metrics chip returns only Metrics terms");
  eq(metricsOnly.every(t => t.g === "Metrics"), true, "every result under the Metrics filter is actually tagged Metrics");
  const sorted = metricsOnly.map(t => t.n).slice().sort((a, b) => a.localeCompare(b));
  eq(JSON.stringify(metricsOnly.map(t => t.n)), JSON.stringify(sorted), "filtered results stay in A-to-Z order");
  out.push(`search and filter: "sla" -> ${sla.map(t => t.n).join(", ")}; Metrics chip -> ${metricsOnly.length} of ${TSG_TERMS.length}; no-match query -> 0`);

  // 4) Hover registration: adds new keys, never overrides a key GT_MORE already has.
  // Step 2's renderTsGlossary() call already registered once, so GT_MORE now holds every TSG_TERMS
  // key. To exercise a real collision (not one that happens not to overlap), overwrite three keys
  // that TSG_TERMS would also produce -- sextortion and grooming (lowercase, like partHELP.js's own
  // entries) and DSA (exact-case acronym) -- and delete one (CSAM) so there's a genuinely missing key.
  const sentinel = k => "ORIGINAL partHELP.js DEFINITION for " + k + ", MUST NOT CHANGE";
  GT_MORE.sextortion = sentinel("sextortion"); GT_MORE.DSA = sentinel("DSA"); GT_MORE.grooming = sentinel("grooming");
  delete GT_MORE.CSAM;
  const beforeCount = Object.keys(GT_MORE).length;
  tsgRegisterHover();
  eq(GT_MORE.sextortion, sentinel("sextortion"), "an existing lowercase key (sextortion) is not overridden");
  eq(GT_MORE.DSA, sentinel("DSA"), "an existing exact-case acronym key (DSA) is not overridden");
  eq(GT_MORE.grooming, sentinel("grooming"), "an existing lowercase key (grooming) is not overridden");
  eq(Object.keys(GT_MORE).length, beforeCount + 1, "exactly the one missing key (CSAM) gets added back");
  eq(GT_MORE.CSAM, TSG_TERMS.find(t => t.n.startsWith("CSAM")).d, "the re-added acronym key (CSAM) carries the glossary's own definition");
  out.push(`hover: a missing key (CSAM) is added back; the three pre-existing keys (sextortion, DSA, grooming) kept their original partHELP.js definition`);

  // Calling it again is idempotent: no key flips, count doesn't grow a second time
  const countAfterFirst = Object.keys(GT_MORE).length;
  tsgRegisterHover();
  eq(Object.keys(GT_MORE).length, countAfterFirst, "registering twice adds nothing new the second time");
  eq(GT_MORE.sextortion, sentinel("sextortion"), "still not overridden after a second registration");
  out.push("hover is idempotent: a second call adds nothing and still doesn't override sextortion, DSA or grooming");

  return out.join("\n");
};
const src = stub + "const GT_MORE = {sextortion:\"a threat to share someone's intimate images unless they pay or send more (partHELP.js's own entry)\", DSA:\"the EU Digital Services Act (partHELP.js's own entry)\", grooming:\"an adult building a child's trust to abuse them (partHELP.js's own entry)\"};\n"
  + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partLearn.js"), rd("partTSG.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
