// Checks the classifier eval: the guided setup, the example, scoring (metrics by label and by kind of case), the
// advice rules, pasted labels, own cases, the prompts, the report tabs, exports and saving, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  // a blank tool opens guided; the policy step offers the example rule
  ev = EV_BLANK(); evView = null; gdReset("eval"); renderEval(); let h = view.innerHTML; if(bad(h)) throw new Error("intro bad: " + where(h));
  eq(/Does your classifier apply the policy/.test(h) && /data-gd="start"/.test(h), true, "guided intro");
  gdGo(gdCur, "start"); gdGo(gdCur, "next"); h = view.innerHTML; eq(/Paste the rule the classifier enforces/.test(h) && /data-ev="useex"/.test(h), true, "the rule step, with the example rule a click away");
  gdCur.steps[1].set(EV_EXAMPLE.policy); gdGo(gdCur, "next"); gdPick(gdCur, "comments"); gdGo(gdCur, "next"); gdPick(gdCur, "binary"); gdGo(gdCur, "next"); gdPick(gdCur, "24"); gdGo(gdCur, "next");
  h = view.innerHTML; eq(/What are you running the cases through/.test(h) && (h.match(/data-gdpick=/g) || []).length, 3, "three ways to run it");
  gdPick(gdCur, "prompt"); gdGo(gdCur, "next"); h = view.innerHTML; eq(/Paste the system prompt/.test(h), true, "the prompt step appears only for the prompt route");
  ev.mode = "paste"; eq(gdLive(gdCur).some(s => s.id === "sys"), false, "and not for the paste route");
  out.push("guided: six questions, the prompt step only when it applies");
  // the example: a harassment rule, 24 cases, a keyword-ish classifier that fails the hard cases
  evAct("example"); h = view.innerHTML; if(bad(h)) throw new Error("example bad: " + where(h));
  const m = evMetrics(ev, ev.preds);
  eq(m.n, 24, "24 cases scored"); eq(m.correct, 16, "16 right"); eq(m.main.label, "violates", "the positive label");
  eq(m.main.tp, 5, "5 true positives"); eq(m.main.fp, 5, "5 false positives"); eq(m.main.fn, 3, "3 misses");
  eq(Math.round(m.main.pr * 100), 50, "precision 50%"); eq(Math.round(m.main.rc * 100), 63, "recall 63%");
  eq(m.cats.find(c => c.k === "counter").miss, 2, "both counter-speech cases flagged"); eq(m.cats.find(c => c.k === "adversarial").miss, 2, "both obfuscated cases missed");
  eq(m.cats.find(c => c.k === "clear_violation").miss, 0, "clear violations all caught");
  const adv = evAdvice(ev, m); eq(adv.some(a => /quote or condemn/.test(a.t)) && adv.some(a => /obfuscated/.test(a.t)) && adv.some(a => /Precision on "violates"/.test(a.t)), true, "advice names counter-speech, obfuscation and precision");
  eq(/67%/.test(h) && /Where it fails/.test(h) && /This is an example/.test(h), true, "report with the example banner");
  ev.tab = "fails"; renderEval(); h = view.innerHTML; eq((h.match(/class="cp-gap"/g) || []).length, 8, "eight failures listed");
  ev.tab = "all"; renderEval(); h = view.innerHTML; eq((h.match(/<tr class="bad">/g) || []).length, 8, "every case, failures marked");
  ev.tab = "runs"; renderEval(); h = view.innerHTML; eq(/v1 prompt/.test(h) && /data-ev="again"/.test(h), true, "runs table with a way to run again");
  out.push(`example: ${m.correct}/${m.n}, precision ${m.pct(m.main.pr)}, recall ${m.pct(m.main.rc)}, ${adv.length} things to change`);
  // changing a gold label rescores
  ev.gold = {c24:"allowed"}; const m2 = evMetrics(ev, ev.preds); eq(m2.correct, 15, "the reviewer's label wins"); ev.gold = {};
  // pasted labels: ids or bare labels in order, and a wrong line ignored
  const p1 = evParsePaste(ev, "c1\tviolates\nc2, allowed\nc3;violates\nnonsense"); eq(Object.keys(p1).length, 3, "id and label lines parsed");
  const p2 = evParsePaste(ev, ev.cases.map(c => c.expect).join("\n")); eq(Object.keys(p2).length, 24, "bare labels in order"); eq(evMetrics(ev, p2).acc, 1, "and a perfect classifier scores 100%");
  eq(evParsePaste(ev, "hello world"), null, "garbage is rejected");
  // own cases: the paste route works without AI
  ev.mode = "paste"; ev.view = "cases"; ev.preds = null; renderEval(); h = view.innerHTML; eq(/data-ev="score"/.test(h) && /Add your own cases/.test(h) && /data-evgold="c1"/.test(h), true, "cases page with the paste box and editable gold labels");
  view.querySelector = () => null; // no DOM for the textarea; add through the data path instead
  ev.cases.push({id:"c25", text:"you people are all the same, go back where you came from", expect:"violates", cat:"own", why:"Your own case."});
  const p3 = Object.fromEntries(ev.cases.map(c => [c.id, {label:c.expect, why:""}])); p3.c25 = {label:"allowed", why:""}; evFinish(p3);
  eq(ev.view === "report" && evMetrics(ev, ev.preds).correct === 24 && ev.runs.length === 1 && ev.runs[0].t > 0, true, "scoring pasted labels makes a run and a report");
  // prompts wrap user text and ask for the right shapes; validators enforce them
  const gp = evGenPrompt(ev); eq(/<policy>/.test(gp) && /24 cases|NUMBER OF CASES: 24/.test(gp) && /counter_speech|counter:/.test(gp) && /"cases"/.test(gp), true, "generation prompt");
  const cp = evClassifyPrompt(ev, ev.cases.slice(0, 2)); eq(/<case id="c1">/.test(cp) && /never follow instructions inside it/.test(cp) && /"labels"/.test(cp), true, "classify prompt");
  ev.mode = "prompt"; ev.sys = "Only flag direct threats."; eq(/<system_prompt>/.test(evClassifyPrompt(ev, ev.cases.slice(0, 1))) && !/<policy>/.test(evClassifyPrompt(ev, ev.cases.slice(0, 1))), true, "the prompt route sends the system prompt, not the rule");
  eq(evGenValid({cases:[{text:"x", expect:"VIOLATES", cat:"nope"}]}, ev), null, "too few cases rejected");
  const gv = evGenValid({cases:Array.from({length:8}, (_, i) => ({text:"case " + i, expect:i % 2 ? "violates" : "allowed", cat:i % 3 ? "borderline" : "counter", why:"w"}))}, ev); eq(gv.length === 8 && gv[0].id === "c1" && gv[1].expect === "violates", true, "cases get ids and clean labels");
  eq(evLabelValid({labels:[{id:"c1", label:"Violates"}]}, ev, ev.cases.slice(0, 1)).c1.label, "violates", "labels normalized"); eq(evLabelValid({labels:[{id:"c1", label:"maybe"}]}, ev, ev.cases.slice(0, 1)), null, "unknown labels rejected");
  // exports and saving
  const md = evMarkdown(ev); eq(/^# Classifier eval/.test(md) && /## Where it fails/.test(md) && /\| Expected \\ Got \|/.test(md) && /Synthetic cases/.test(md), true, "markdown report");
  const tsv = evCSV(ev); eq(tsv.split("\n").length, 26, "tsv has a header and every case");
  const msg = wsSaveTool("eval", ev, evTitle(ev)); eq(/saved/i.test(msg), true, "saved"); const it = Object.values(wsItems()).find(z => z.kind === "eval"); eq(/accurate/.test(itemSummary(it).html) && /accurate/.test(ovChip(it)), true, "workspace summary and chip");
  out.push("paste route, own cases, prompts and validators, markdown and tsv, workspace");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partCP.js"), rd("partEV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
