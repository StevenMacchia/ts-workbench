// Checks Red team studio: the guided questions, the plan built from them, seeds and twins, drills, findings,
// exports for open-source harnesses, tracker tasks, the example, saving and practice, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  // a blank plan opens guided: an intro, then one question per screen
  rt = RT_BLANK(); rt.mode = "full"; renderRedteamStudio(); let h = view.innerHTML; if(bad(h)) throw new Error("blank intro bad: " + where(h));
  eq(/Plan a red team/.test(h) && /data-gd="start"/.test(h) && /See a finished example/.test(h), true, "guided intro with the example as a way in");
  gdGo(gdCur, "start"); h = view.innerHTML; eq(/Where are you coming from/.test(h), true, "first question is the perspective"); eq((h.match(/class="gd-opt[ "]/g) || []).length, 3, "three perspectives"); gdPick(gdCur, "company"); gdGo(gdCur, "next"); h = view.innerHTML; eq(/What are you red teaming/.test(h), true, "then the model type");
  gdPick(gdCur, "world"); eq(rt.model, "world", "picked world model");
  eq(gdLive(rtSpec()).some(z => z.id === "surf"), true, "surfaces question present");
  eq(rtSurf().length, 6, "world model has six surfaces"); rt.model = "both"; eq(rtSurf().length, 12, "both gives twelve"); rt.model = "llm";
  eq(rtAreaList().some(a => a.k === "prov"), false, "provenance gate is world-only"); eq(rtAreaList().some(a => a.k === "agentic"), true, "agentic misuse is in for language models");
  out.push("guided: " + gdLive(rtSpec()).length + " questions, surfaces and areas follow the model type");
  // the example: a plan with seeds, drills, findings
  rtAct("example"); rt.mode = "full"; renderRedteamStudio(); h = view.innerHTML; if(bad(h)) throw new Error("example plan bad: " + where(h));
  eq(rt.ex && rt.view === "report", true, "example opens on the plan"); eq(/This is an example/.test(h) && /Pixelry assistant/.test(h), true, "example banner and name");
  eq(rtPicked().length, 6, "six harm areas picked"); eq(rtDrills().length, 6, "a day gives six drills");
  const seeds = rtPicked().reduce((n, a) => n + rtSeedsFor(a).length, 0); eq(seeds, 10, "two seeds per non-severe area, none for the severe one");
  eq(rtSeedsFor(RT_AREAS.find(a => a.k === "csae")).length, 0, "no seeds for CSAE, probes only");
  ["plan", "seeds", "drills", "findings", "exports", "practice"].forEach(t => { rt.tab = t; renderRedteamStudio(); h = view.innerHTML; if(bad(h)) throw new Error(t + " tab bad: " + where(h)); });
  rt.tab = "plan"; renderRedteamStudio(); h = view.innerHTML; eq(/Coverage grid/.test(h) && /No open S4/.test(h) && /under 2%/.test(h), true, "plan shows the grid and the gates");
  rt.tab = "seeds"; renderRedteamStudio(); h = view.innerHTML; eq(/Benign twin/.test(h) && /Policy-described probes only/.test(h), true, "seed cards with twins and a probe card");
  rt.tab = "drills"; renderRedteamStudio(); h = view.innerHTML; eq((h.match(/class="card ln-ex done"/g) || []).length, 6, "example has six drills done");
  out.push(`example: ${rtPicked().length} areas, ${seeds} seeds, ${rtDrills().length} drills, ${rt.findings.length} findings`);
  // editing a seed and adding one
  const fr = RT_AREAS.find(a => a.k === "fraud"); const list = rtSeedsFor(fr).map(s => Object.assign({}, s)); list.push({k:"llm", s:"a new seed", t:"its twin", ok:"S2 if"}); rtSetSeeds("fraud", list);
  eq(rtSeedsFor(fr).length, 3, "seed added and kept"); eq(rtSeedRows().some(r => r.seed === "a new seed"), true, "new seed reaches the exports");
  // exports carry the seeds, the name and the gates
  const pf = rtExportText("promptfoo"); eq(/Pixelry assistant/.test(pf) && /a new seed/.test(pf) && /under 2%/.test(pf) && /crescendo/.test(pf), true, "promptfoo config has name, seeds, gates and strategies");
  const py = rtExportText("pyrit"); eq(/PromptSendingOrchestrator/.test(py) && /BENIGN_TWINS/.test(py), true, "pyrit script has the orchestrator and the twins");
  const ins = rtExportText("inspect"); eq(/model_graded_qa/.test(ins) && /S0 safe refusal/.test(ins), true, "inspect task has the rubric");
  const grid = rtExportText("grid"); eq(/COVERAGE GRID/.test(grid) && /probes only/.test(grid) && /Benign twins/.test(grid), true, "grid export marks probe-only areas");
  eq(/RT-001/.test(rtExportText("findings")), true, "findings export");
  out.push("exports: promptfoo, pyrit, inspect, grid, log, findings");
  // findings and tracker tasks
  const tasks = tkFromRedteam(); eq(tasks.length, 3, "one task per open finding"); eq(tasks[0].pr, 3, "S3 is priority 3"); eq(tasks.some(t => t.done), true, "fixed finding is pre-done");
  rt.findings.push({id:"RT-004", title:"t", area:"hate", sev:4, tech:"", surf:"chat", k:1, n:1, sum:"", fix:"", owner:"", status:"open"}); rt.tab = "plan"; renderRedteamStudio(); h = view.innerHTML;
  eq(/Open S4: release blocked/.test(h), true, "an open S4 blocks the release"); rt.findings.pop();
  // saving and searching
  const msg = wsSaveTool("redteam", rt, rtTitle(rt)), it = Object.values(wsItems()).find(i => i.kind === "redteam");
  eq(!!it && /3 open findings/.test(itemSummary(it).html), true, "workspace summary counts open findings"); eq(cmdkItems().some(x => x.label === "Red team studio"), true, "search reaches it");
  out.push(`tracker: ${tasks.length} tasks; saved (${msg}) and searchable`);
  // practice content is complete and model-tagged
  eq(RT_PRACTICE.grade.every(x => [0, 1, 2, 3, 4].includes(x.a) && x.why), true, "every grading item has an answer and a reason");
  eq(RT_PRACTICE.tech.every(x => x.opts.includes(x.a)), true, "every technique item has its answer among the options");
  eq(RT_PRACTICE.trip.every(x => x.frame <= x.steps.length && x.seq < x.frame), true, "trip points sit inside the sequence, reviewer before the frame check");
  // no attack strings: seeds describe requests, they are not prompts
  eq(Object.values(RT_SEEDS.llm).flat().every(s => s[0].length < 200), true, "seeds are short descriptions");
  // solo teams only get drills one or two people can run
  rt.team = "solo"; rt.time = "week"; eq(rtDrills().every(d => !/4 to 6|Whoever signs|3 graders/.test(d.people)), true, "solo plan skips group drills");
  rtAct("reset"); eq(rt.model, "", "reset clears the plan");
  out.push("practice: " + (RT_PRACTICE.grade.length + RT_PRACTICE.tech.length + RT_PRACTICE.trip.length) + " items; reset clean");
  // closing the loop: a run comes back as CSV, promptfoo JSON or an Inspect log, and the gates decide
  rtAct("example"); rt.mode = "full"; renderRedteamStudio();
  const csv = "run_id,seed_id,is_twin,grade\nr1,fraud-01,no,S3\nr2,fraud-02,no,S1\nr3,fraud-01-twin,yes,S0\nr4,hate-01,no,S2\nr5,hate-01-twin,yes,\n";
  let run = rtParseRun(csv); eq(run.src, "test log", "csv is the test log"); eq(run.rows.length, 5, "five rows"); let ag = rtAggregate(run.rows);
  eq(ag.by.fraud.n, 2, "two fraud seeds"); eq(ag.by.fraud.s3, 1, "one at S3"); eq(ag.twins.n, 2, "two twins");
  const fraudSeed = rtSeedsFor(RT_AREAS.find(a => a.k === "fraud"))[0];
  const pfj = JSON.stringify({results:{results:[{vars:{prompt:fraudSeed.s}, description:"Fraud, scams and impersonation seed", success:false, gradingResult:{pass:false, reason:"Grade: S3, tailored pretext"}}, {vars:{prompt:fraudSeed.t}, description:"Fraud, scams and impersonation benign twin", success:false, gradingResult:{pass:false, reason:"refused"}}, {vars:{prompt:"something else"}, success:true}]}});
  run = rtParseRun(pfj); eq(run.src, "promptfoo", "promptfoo detected"); ag = rtAggregate(run.rows); eq(ag.by.fraud.s3, 1, "S3 read from the grader reason"); eq(ag.twins.refused, 1, "a failed twin is an over-refusal"); eq(ag.unknown, 1, "unmatched row counted");
  const insj = JSON.stringify({eval:{task:"redteam"}, samples:[{input:fraudSeed.s, target:"Seed · Fraud, scams and impersonation · S3 if", scores:{model_graded_qa:{value:"S2", explanation:"generic"}}}, {input:fraudSeed.t, target:"Benign twin · Fraud, scams and impersonation · must not be refused", scores:{model_graded_qa:{value:"S0"}}}]});
  run = rtParseRun(insj); eq(run.src, "inspect", "inspect detected"); ag = rtAggregate(run.rows); eq(ag.by.fraud.s2, 1, "S2 from the score value"); eq(ag.twins.n, 1, "twin matched by target");
  let threw = false; try{ rtParseRun("{\"nothing\":1}"); }catch(e){ threw = true; } eq(threw, true, "unknown JSON is refused with a message");
  rt.runs = [{ts:1, src:"test log", n:5, agg:rtAggregate(rtParseRun(csv).rows), rows:[]}]; rt.tab = "plan"; renderRedteamStudio(); h = view.innerHTML; if(bad(h)) throw new Error("results bad: " + where(h));
  eq(/Results · test log/.test(h) && /No open S4/.test(h) && /Import another run/.test(h), true, "plan shows the run against the gates");
  rt.runs.push({ts:2, src:"test log", n:5, agg:rtAggregate(rtParseRun(csv.replace("S3", "S1")).rows), rows:[]}); renderRedteamStudio(); eq(/rt-trend/.test(view.innerHTML), true, "a second run shows a trend");
  out.push("import: csv, promptfoo and inspect parsed; gates decided; trend across runs");
  // content credentials: a PNG with a caBX chunk and one without, a JPEG with a JUMBF segment
  const png = (withBox) => { const b = [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]; const chunk = (type, data) => { const len = data.length; b.push(len >>> 24 & 255, len >>> 16 & 255, len >>> 8 & 255, len & 255); for(const ch of type) b.push(ch.charCodeAt(0)); b.push(...data); b.push(0,0,0,0); }; chunk("IHDR", new Array(13).fill(0)); if(withBox) chunk("caBX", Array.from("jumb c2pa.actions c2pa.hash.data Pixelry Worldgen/1.8 x509 sig").map(c => c.charCodeAt(0))); chunk("IEND", []); return new Uint8Array(b).buffer; };
  let sc = rtScanC2PA(png(true)); eq(sc.kind === "PNG" && sc.found && sc.where === "caBX chunk", true, "png manifest found"); eq(sc.labels.includes("c2pa.actions"), true, "assertion labels read"); eq(sc.hasSig, true, "signature block noticed");
  sc = rtScanC2PA(png(false)); eq(sc.kind === "PNG" && !sc.found, true, "png without credentials");
  const jpg = () => { const seg = Array.from("JP\u0000\u0000jumbc2pa.claim").map(c => c.charCodeAt(0)); const len = seg.length + 2; return new Uint8Array([0xFF,0xD8,0xFF,0xEB,len >> 8, len & 255, ...seg, 0xFF, 0xDA, 0, 2]).buffer; };
  sc = rtScanC2PA(jpg()); eq(sc.kind === "JPEG" && sc.found, true, "jpeg APP11 manifest found");
  rt.prov = [{ts:1, a:"a.png", b:"b.png", before:true, after:false}]; rt.model = "world"; rt.areas = {deceptive:1}; rt.tab = "plan"; renderRedteamStudio(); eq(/1 stripped/.test(view.innerHTML), true, "stripped check shows on the plan");
  out.push("provenance: png and jpeg manifests detected, stripped result logged");
  // findings become regression tests in the exports; the sequence log only appears on the steering drill
  rtAct("example"); rt.mode = "full"; renderRedteamStudio(); eq(/regression RT-001/.test(rtExportText("promptfoo")) && /paste from vault RT-001/.test(rtExportText("inspect")), true, "findings exported as regression tests without their prompts");
  eq(rtSeqHTML({k:"world", title:"Scene steering drill"}, {seq:[{t:"a", f:true, r:false}, {t:"b", f:false, r:true}]}).includes("Sequence log"), true, "sequence log renders for steering");
  eq(rtSeqHTML({k:"llm", title:"Crescendo drill"}, {}), "", "no sequence log elsewhere");
  out.push("regression exports and sequence log in place; Claude grading gated on the sampler");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partLearn.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partRT.js"), rd("partRT2.js"), rd("partRT3.js"), rd("partRT4.js"), rd("partRT5.js"), rd("partRT6.js"), rd("partRT7.js"), rd("partRT8.js"), rd("partLOOP.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
// The flow: one card at a time, from the sixty-second try to the verdict and the fixes
const body2 = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0], H = () => view.innerHTML;
  rt = RT_BLANK(); renderRedteamStudio(); if(bad(H())) throw new Error("open card bad: " + where(H()));
  eq(/Find out what your AI model does/.test(H()) && /data-pick="1"/.test(H()), true, "opens on a sixty-second try, not a form");
  eq(/data-rtf="next"/.test(H()), false, "no next button until you try");
  rtF().openPick = 1; renderRedteamStudio(); eq(/That is it/.test(H()) && /one finding in 20 minutes/.test(H()), true, "a right pick explains and offers your own feature");
  rtF().skipBasics = false; rtF().path = "basics"; rtM1().target = "support"; rtM1().card = Object.assign({}, RT_TARGETS[0].card); rtGo(rtScreens().findIndex(x => x.k === "basic")); eq(/Lesson 1 of 5/.test(H()) && /red teaming/.test(H()), true, "lesson one: one idea, one try");
  rtF().basics[0] = 0; renderRedteamStudio(); eq(/Not quite/.test(H()), true, "a wrong pick explains");
  RT_BASICS.forEach((b, i) => { rtF().basics[i] = b.a; }); rtGo(rtScreens().findIndex(x => x.k === "basic" && x.i === 4)); eq(/Set up your test/.test(H()), true, "last lesson leads to setup");
  rtF().path = "test"; rtGo(rtScreens().findIndex(x => x.k === "model")); eq(/What are you testing/.test(H()) && !/data-rtf="next"/.test(H()), true, "model card waits for a pick");
  rt.model = "llm"; rt.surf = {chat:1}; rt.att = {curious:1}; rt.who = "learner"; renderRedteamStudio(); eq(/what matters most/.test(H()), true, "then offers the harms");
  rtGo(rtScreens().findIndex(x => x.k === "harms")); eq(/What would be worst/.test(H()) && /probes only/.test(H()), true, "harm card in plain words with probe tags");
  rt.areas = {fraud:1, hate:1}; rtGo(rtScreens().findIndex(x => x.k === "team")); eq(/Who is doing this/.test(H()), true, "team card"); rt.team = "pair"; rt.time = "afternoon"; renderRedteamStudio(); eq(/Start: 3 drills/.test(H()), true, "an afternoon is three drills");
  const screens = rtScreens(); eq(screens.filter(s => s.k === "drill").length, 3, "three drill cards"); eq(screens[screens.length - 1].k, "done", "ends on done");
  rtGo(rtScreens().findIndex(x => x.k === "drill")); eq(/Drill 1 of 3/.test(H()) && /What did it do/.test(H()), true, "drill card asks what it did");
  const d1 = rtDrills()[0].id; rt.sess[d1] = {checks:{}, notes:"it gave a usable script", started:0}; rtF().drill[d1] = 3; rtFindingFromDrill(d1, 3, ""); renderRedteamStudio(); eq(/Which harm did it touch/.test(H()), true, "a 3 asks which harm");
  rtF().area = "fraud"; rtFindingFromDrill(d1, 3, "fraud"); renderRedteamStudio(); eq(rt.findings.length, 1, "a finding is created from the drill"); eq(rt.findings[0].area === "fraud" && rt.findings[0].sev === 3 && /usable script/.test(rt.findings[0].sum), true, "finding carries area, grade and notes");
  rtFindingFromDrill(d1, 0, ""); eq(rt.findings.length, 0, "regrading to 0 removes it"); rtFindingFromDrill(d1, 3, "fraud"); rtF().drill[d1] = 3;
  rtGo(rtScreens().findIndex(s => s.k === "verdict")); if(bad(H())) throw new Error("verdict bad: " + where(H())); eq(/Not yet/.test(H()) && /scored a 3/.test(H()), true, "verdict in plain words");
  rtGo(rtScreens().findIndex(s => s.k === "fix")); eq(/Fix 1 of 1/.test(H()) && /named organisations/.test(H()), true, "fix card with the usual fix");
  rtGo(rtScreens().length - 1); eq(/Here is what you have/.test(H()) && /1 finding/.test(H()), true, "done card sums it up");
  rt.mode = "full"; rt.view = "report"; renderRedteamStudio(); eq(/data-rttab="plan"/.test(H()), true, "engineers' view still there");
  out.push("flow: try, 5 lessons, 3 setup cards, drills with what-did-it-do, verdict, fix, done; engineers' view intact");
  return out.join("\n");
};
console.log(new Function(stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partLearn.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partRT.js"), rd("partRT2.js"), rd("partRT3.js"), rd("partRT4.js"), rd("partRT5.js"), rd("partRT6.js"), rd("partRT7.js"), rd("partRT8.js"), rd("partLOOP.js")].join("\n") + "\nreturn (" + body2.toString() + ")();")());
// Module 1: the target card, three tries against your own feature with the rubric beside your grade, the first finding
const body3 = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0], H = () => view.innerHTML;
  rt = RT_BLANK(); renderRedteamStudio(); rtF().openPick = 1; renderRedteamStudio(); eq(/one finding in 20 minutes/.test(H()), true, "after the try, the primary action is your own feature");
  rtGo(1); if(bad(H())) throw new Error("target bad: " + where(H())); eq(/What are you building/.test(H()) && (H().match(/data-target=/g) || []).length === 4, true, "four starter targets");
  rtM1().target = "support"; rt.model = "llm"; rt.areas = {privacy:1}; rt.surf = {chat:1}; rt.att = {curious:1}; rtSave(); rtGo(2); eq(/target card/.test(H()) && /What is out of scope/.test(H()), true, "the card asks for scope");
  rtM1().card = Object.assign({}, RT_TARGETS[0].card); rtGo(3); eq(/Pick a move/.test(H()) && (H().match(/data-move=/g) || []).length === 6, true, "six moves for a language model");
  const tr = rtM1().tries[0]; tr.move = "story"; renderRedteamStudio(); eq(/going after/.test(H()), true, "then the aim");
  tr.aim = "privacy"; renderRedteamStudio(); eq(/What did it do/.test(H()) && /only discuss my own account/.test(H()), true, "privacy rubric lines");
  tr.obs = 1; renderRedteamStudio(); eq(/Your grade, then the rubric/.test(H()), true, "your grade first");
  tr.grade = 0; rtM1Check(tr); renderRedteamStudio(); eq(/rubric: S1/.test(H()) && /you: S0/.test(H()) && /softer than the rubric/.test(H()), true, "the gap is explained");
  eq(rtM1().done[1], true, "the story move ticks the checklist"); eq(rtM1().done[6], true, "the privacy aim ticks the checklist");
  tr.grade = 1; renderRedteamStudio(); eq(/You and the rubric agree/.test(H()), true, "agreement is named");
  eq(/Pick the layer/.test(H()), false, "a 1 does not ask for the layer"); tr.obs = 3; tr.grade = 3; renderRedteamStudio(); eq(/Pick the layer/.test(H()), true, "a 3 asks which layer");
  tr.layer = "filter"; tr.notes = "it named a person"; rtGo(6); if(bad(H())) throw new Error("finding bad: " + where(H())); eq(/Your first finding/.test(H()) && /Expert write-up/.test(H()) && /Output classifier/.test(H()), true, "five parts with the expert write-up");
  rtM1().finding.why = "the filter passed it"; rtM1().finding.cause = "a stalker could confirm a customer"; rtM1File(); eq(rt.findings.length, 1, "filed"); eq(rt.findings[0].sev === 3 && rt.findings[0].area === "privacy" && /named a person/.test(rt.findings[0].sum), true, "finding carries grade, area and notes");
  eq(rtM1().done[8], true, "writing the finding ticks the last item"); renderRedteamStudio(); eq(/3 of 9 things tested/.test(H()), true, "checklist counts");
  rtM1().target = "media"; rt.model = "world"; rtGo(3); eq((H().match(/data-move=/g) || []).length === 6 && /cartoon/.test(H()), true, "world model moves");
  const s = rtScreens(); eq(s[1].k === "target" && s[2].k === "card" && s[6].k === "finding1" && s[7].k === "hub", true, "module one leads to the hub");
  out.push("module 1: target, card, 3 tries with rubric and gap, finding filed, checklist ticks");
  return out.join("\n");
};
console.log(new Function(stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partLearn.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partRT.js"), rd("partRT2.js"), rd("partRT3.js"), rd("partRT4.js"), rd("partRT5.js"), rd("partRT6.js"), rd("partRT7.js"), rd("partRT8.js"), rd("partLOOP.js")].join("\n") + "\nreturn (" + body3.toString() + ")();")());
// Module 2: the judge bank, sessions, the expert comparison, misses that come back, the breakdown; and the hub
const body4 = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0], H = () => view.innerHTML;
  const n = RT_BANK.grade.length + RT_BANK.move.length + RT_BANK.fair.length; eq(n >= 60, true, "bank has at least sixty items: " + n);
  eq(RT_BANK.grade.every(it => [0, 1, 2, 3, 4].includes(it.a) && it.why && it.area), true, "every grade item has an expert grade, a reason and an area");
  eq(RT_BANK.move.every(it => it.opts.includes(it.a) && it.opts.length === 4), true, "every move item has four options including the answer");
  eq(RT_BANK.fair.every(it => it.opts[it.a] && it.why), true, "every fair item has its answer among the options");
  const ids = ["grade", "move", "fair"].flatMap(k => RT_BANK[k].map((it, i) => k + "-" + i)); eq(new Set(ids).size, ids.length, "ids unique");
  rt = RT_BLANK(); rt.model = "llm"; rtJStart(); const c = rtJ().cur; eq(c.ids.length, 10, "a session is ten items"); eq(new Set(c.ids.slice(0, 3).map(id => id.split("-")[0])).size, 3, "the first three interleave the three drills");
  rtF().path = "judge"; rtF().i = rtScreens().findIndex(x => x.k === "judge"); renderRedteamStudio(); if(bad(H())) throw new Error("judge bad: " + where(H()));
  eq(/Your call/.test(H()) || /What did the attacker do/.test(H()) || /Which should the model answer/.test(H()), true, "a judge card asks for the call first"); eq(/Expert's call/.test(H()), false, "no expert call before yours");
  const it = rtJItem(c.ids[0]); const wrong = it.kind === "move" ? it.opts.find(o => o !== it.a) : (it.a === 0 ? 1 : 0); rtJAnswer(wrong); renderRedteamStudio(); eq(/Expert's call/.test(H()) && /Your call/.test(H()), true, "both calls shown side by side");
  eq(!!rtJ().miss[it.id], true, "a miss is remembered"); eq(c.ids.slice(1).includes(it.id), true, "the missed item comes back later in the session");
  c.i++; c.picked = null; const it2 = rtJItem(c.ids[1]); rtJAnswer(it2.a); eq(c.right, 1, "a match counts");
  for(let k = 2; k < c.ids.length; k++){ c.i = k; c.picked = null; const x = rtJItem(c.ids[k]); rtJAnswer(x.a); } c.i = c.ids.length; renderRedteamStudio(); if(bad(H())) throw new Error("session summary bad: " + where(H()));
  eq(/matched the expert/.test(H()) && /Another ten/.test(H()), true, "session summary with a breakdown");
  const st = rtJStats(); eq(st.total, c.ids.length, "history counts every answer"); eq(Object.keys(st.by).length > 1, true, "breakdown by area");
  rt.model = "world"; eq(rtJPool().every(x => x.k !== "llm"), true, "a world model plan filters the bank");
  rtF().path = ""; rtF().i = rtScreens().findIndex(x => x.k === "hub"); renderRedteamStudio(); eq((H().match(/data-hub=/g) || []).length, 6, "the hub offers four paths, the basics and the method"); if(bad(H())) throw new Error("hub bad: " + where(H()));
  rtF().path = "basics"; eq(rtScreens().filter(x => x.k === "basic").length, 5, "basics path shows the five lessons"); rtF().path = "test"; eq(rtScreens().some(x => x.k === "verdict"), true, "test path reaches the verdict");
  out.push("judge: " + n + " items, sessions of ten interleaved, expert comparison after the call, misses return, breakdown; hub with four paths");
  return out.join("\n");
};
console.log(new Function(stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partLearn.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partRT.js"), rd("partRT2.js"), rd("partRT3.js"), rd("partRT4.js"), rd("partRT5.js"), rd("partRT6.js"), rd("partRT7.js"), rd("partRT8.js"), rd("partLOOP.js")].join("\n") + "\nreturn (" + body4.toString() + ")();")());
// Modules 6 and 3: the summary and the answers say only what was done; the plan drafts scope, people, the sheet and the rules
const body5 = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0], H = () => view.innerHTML;
  rtAct("example"); rt.mode = "flow"; rt.flow = {i:0, basics:{}, drill:{}, fix:{}, skipBasics:true, path:"show"}; rtM1().target = "support"; rtM1().card = Object.assign({}, RT_TARGETS[0].card); rtSave();
  rtGo(rtScreens().findIndex(x => x.k === "show")); if(bad(H())) throw new Error("summary bad: " + where(H()));
  const sum = rtSummaryText(); eq(/RED TEAM SUMMARY · Pixelry assistant/.test(sum) && /WHAT WE FOUND/.test(sum) && /RT-001/.test(sum) && /No open S4: pass/.test(sum) && /WHAT WE DID NOT TEST/.test(sum), true, "summary has the system-card sections, the findings and the gates");
  eq(/\[Names and roles/.test(sum), true, "unknowns are bracketed, not invented"); rtS().who = "Sam, PM; Lee, engineer"; eq(/Sam, PM/.test(rtSummaryText()), true, "edits flow into the summary");
  rtGo(rtScreens().findIndex(x => x.k === "answers")); if(bad(H())) throw new Error("answers bad: " + where(H())); eq((H().match(/data-ans=/g) || []).length, RT_QS.length, "one draft per questionnaire question");
  const ans = rtAnswersText(); eq(/Yes. Before each release we run structured adversarial testing/.test(ans) && /3 findings/.test(ans), true, "the red teaming answer says what was done"); eq(/\[No. Customer prompts/.test(ans), true, "training data answer is a bracketed choice, not a claim");
  rt.surf = {chat:1}; eq(/No. The feature answers and summarises/.test(RT_QS.find(q => q.k === "autonomy").d()), true, "no tools means no autonomy claim"); rt.surf = {chat:1, tools:1}; eq(/Yes, within limits/.test(RT_QS.find(q => q.k === "autonomy").d()), true, "tools means limits are described");
  out.push("show the work: summary with " + sum.split("\n").length + " lines, " + RT_QS.length + " questionnaire drafts");
  rt.flow.path = "plan"; rtGo(rtScreens().findIndex(x => x.k === "plan1")); if(bad(H())) throw new Error("plan1 bad: " + where(H()));
  const sc = rtScopeDraft(); eq(/SCOPE · Pixelry assistant/.test(sc) && /no open S4; S3-or-above under 2%/.test(sc) && /Not this round/.test(sc), true, "scope carries the gates and the honest line");
  rtGo(rtScreens().findIndex(x => x.k === "plan2")); if(bad(H())) throw new Error("plan2 bad: " + where(H()));
  const pers = rtP().personas; eq(pers.filter(x => x.kind === "bad").length === 3 && pers.filter(x => x.kind === "good").length === 3, true, "three bad actors from setup and three well-meaning users");
  const rows = rtSheetRows(); eq(rows.length >= 20, true, "the sheet has at least twenty rows: " + rows.length); eq(rows.some(r => r.probe) && rows.some(r => r.twin), true, "probe-only rows and fair-question rows are marked");
  eq(/content warning/i.test(rtInviteDraft()) && /nothing involving minors/i.test(rtInviteDraft()), true, "the invite carries the warning and the hard line");
  eq(rtSheetText().split("\n").length, rows.length + 1, "csv has a header and one line per row");
  rtGo(rtScreens().findIndex(x => x.k === "plan3")); if(bad(H())) throw new Error("plan3 bad: " + where(H())); eq((H().match(/data-ack=/g) || []).length, 7, "seven rules to acknowledge");
  RT_RULES.forEach((r, i) => rtP().ack[i] = true); rtP().dated = "2026-10-08"; renderRedteamStudio(); eq(/Plan done/.test(H()), true, "all seven ticked and dated finishes the plan"); eq(/Acknowledged by: 7 of 7/.test(rtPlanText()), true, "the plan export records the acknowledgement");
  out.push("plan the week: scope, " + pers.length + " personas, " + rows.length + "-row sheet, invite, 7 rules, dated");
  return out.join("\n");
};
console.log(new Function(stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partLearn.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partRT.js"), rd("partRT2.js"), rd("partRT3.js"), rd("partRT4.js"), rd("partRT5.js"), rd("partRT6.js"), rd("partRT7.js"), rd("partRT8.js"), rd("partLOOP.js")].join("\n") + "\nreturn (" + body5.toString() + ")();")());
