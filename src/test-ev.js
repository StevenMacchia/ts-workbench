// Checks the classifier eval: the one-page flow (three steps, the example, the three ways to get labels), scoring (metrics
// by label and by kind of case), the plain summary, the advice rules, pasted labels, own cases, the prompts, the results and
// their details, the loop and the comparison, exports and saving, and image/video lists, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  evbRun = () => "stubbed"; // the free model never loads in a test
  // a blank tool: one page, three steps, the example a click away, step 2 waiting on step 1
  ev = EV_BLANK(); renderEval(); let h = view.innerHTML; if(bad(h)) throw new Error("blank page bad: " + where(h));
  eq(/Try the example/.test(h) && /data-ev="quick"/.test(h), true, "the first visit leads with the example");
  eq((h.match(/data-evjump="ev-s/g) || []).length, 3, "three steps in the strip"); eq(/class="card ev-step now" id="ev-s1"/.test(h) && /class="card ev-step todo" id="ev-s2"/.test(h), true, "step 1 current, step 2 waiting");
  eq(/data-ev="excases"/.test(h) && /data-ev="own"/.test(h) && /data-ev="useex"/.test(h) && /id="ev-policy-in"/.test(h), true, "the rule box, the example rule, the example cases and a paste box");
  eq((h.match(/data-evmode="[a-z]+" disabled/g) || []).length, 3, "the three ways to get labels wait for cases"); eq(/Add cases in step 1 first/.test(h), true, "and say so");
  eq(/data-evkind="media"/.test(h) && /data-evkind="text" aria-pressed="true"/.test(h), true, "the Text | Images & video switch"); eq(/data-ev="reset"/.test(h), false, "nothing to start over from yet");
  eq(/data-ev="gen"/.test(h), evAI(), "writing cases with Claude is offered only where Claude runs"); eq(/Claude version only/.test(h), !evAI(), "and the Claude tile says so otherwise");
  // the example cases alone: step 1 done, step 2 current, the free model the default way in
  evAct("excases"); h = view.innerHTML; eq(ev.cases.length === 24 && ev.policy === EV_EXAMPLE.policy && !ev.preds, true, "example rule and cases, no labels yet");
  eq(/class="card ev-step done" id="ev-s1"/.test(h) && /class="card ev-step now" id="ev-s2"/.test(h) && /data-evgold="c1"/.test(h), true, "step 1 done, step 2 current, right answers editable");
  eq(evAI() ? /data-evmode="claude"/.test(h) : /class="card tr-tier on" data-evmode="baseline"/.test(h) && /id="evb"/.test(h) && /Download and run \(24 MB\)/.test(h) && /never leaves your browser/.test(h), true, "the default tile and its panel");
  eq(/Show all 24 cases/.test(h) && (h.match(/class="ev-row"/g) || []).length === 8, true, "a long set folds"); EVU.all = true; renderEval(); eq((view.innerHTML.match(/class="ev-row"/g) || []).length, 24, "and unfolds"); EVU.all = false;
  out.push("one page: three steps, example first, three tiles");
  // the finished example: a harassment rule, 24 cases, a keyword-ish classifier that fails the hard cases, and its earlier run
  evAct("example"); h = view.innerHTML; if(bad(h)) throw new Error("example bad: " + where(h));
  const m = evMetrics(ev, ev.preds);
  eq(m.n, 24, "24 cases scored"); eq(m.correct, 16, "16 right"); eq(m.main.label, "violates", "the positive label");
  eq(m.main.tp, 5, "5 true positives"); eq(m.main.fp, 5, "5 false positives"); eq(m.main.fn, 3, "3 misses");
  eq(Math.round(m.main.pr * 100), 50, "precision 50%"); eq(Math.round(m.main.rc * 100), 63, "recall 63%");
  eq(m.cats.find(c => c.k === "counter").miss, 2, "both counter-speech cases flagged"); eq(m.cats.find(c => c.k === "adversarial").miss, 2, "both obfuscated cases missed");
  eq(m.cats.find(c => c.k === "clear_violation").miss, 0, "clear violations all caught");
  const adv = evAdvice(ev, m); eq(adv.some(a => /quote or condemn/.test(a.t)) && adv.some(a => /obfuscated/.test(a.t)) && adv.some(a => /Precision on "violates"/.test(a.t)), true, "advice names counter-speech, obfuscation and precision");
  const sum = evSummary(ev, m); eq(/^Got 16 of 24 right\. It flags people quoting abuse to report it/.test(sum) && /misses misspelled abuse/.test(sum), true, "the summary in plain words: " + sum);
  eq(evSummary(ev, evMetrics(ev, Object.fromEntries(ev.cases.map(c => [c.id, {label:c.expect}])))), "Got all 24 right. Add harder cases, or real ones from your queue.", "a perfect run says so");
  eq(/67%/.test(h) && /What it got wrong/.test(h) && /What to change/.test(h) && /This is the example/.test(h) && /class="card ev-step done" id="ev-s3"/.test(h), true, "results in step 3, with the example banner");
  eq(/Since the last run/.test(h) && (h.match(/class="ev-flip fixed"/g) || []).length === 3 && (h.match(/class="ev-flip broke"/g) || []).length === 1, true, "the earlier run compared automatically: three fixed, one broke");
  eq((h.match(/class="cp-gap"/g) || []).length, 12, "eight wrong cases and four flips as cards"); eq(/Right answer <b>allowed<\/b>; it said <b>violates<\/b>/.test(h), true, "in plain words");
  eq(/data-evtab="kinds"/.test(h) && /data-evtab="scores"/.test(h) && /Counter-speech<br>/.test(h), true, "details folded under the results, by kind first");
  ev.tab = "all"; renderEval(); h = view.innerHTML; eq((h.slice(h.indexOf("class=\"cp-map ev-table\"")).match(/<tr class="bad">/g) || []).length, 8, "every case, failures marked"); eq(/<small>Contains 'you're worthless'\.<\/small>/.test(h), true, "with the classifier's one-line reason");
  ev.tab = "runs"; renderEval(); h = view.innerHTML; eq(/v1 prompt/.test(h) && /v0: no offensive content/.test(h), true, "both runs in the runs table");
  ev.tab = "scores"; renderEval(); h = view.innerHTML; eq(/class="ev-conf"/.test(h) && /said violates/.test(h) && /Rows are the right answer/.test(h), true, "precision and recall, each explained"); ev.tab = "kinds";
  out.push(`example: ${m.correct}/${m.n}, precision ${m.pct(m.main.pr)}, recall ${m.pct(m.main.rc)}, ${adv.length} things to change`);
  // changing a right answer rescores
  ev.gold = {c24:"allowed"}; const m2 = evMetrics(ev, ev.preds); eq(m2.correct, 15, "the reviewer's label wins"); ev.gold = {};
  // pasted labels: ids or bare labels in order, and a wrong line ignored
  const p1 = evParsePaste(ev, "c1\tviolates\nc2, allowed\nc3;violates\nnonsense"); eq(Object.keys(p1).length, 3, "id and label lines parsed");
  const p2 = evParsePaste(ev, ev.cases.map(c => c.expect).join("\n")); eq(Object.keys(p2).length, 24, "bare labels in order"); eq(evMetrics(ev, p2).acc, 1, "and a perfect classifier scores 100%");
  eq(evParsePaste(ev, "hello world"), null, "garbage is rejected");
  // your own classifier: the paste panel works without AI, with the policy file and the runner script
  ev.mode = "paste"; ev.preds = null; renderEval(); h = view.innerHTML; eq(/data-ev="score"/.test(h) && /id="ev-paste"/.test(h) && /Add your own cases/.test(h) && /data-evgold="c1"/.test(h), true, "the paste panel and editable right answers");
  eq(/data-ev="dlpol"/.test(h) && /data-ev="dlpoljson"/.test(h) && /PolicyLM/.test(h) && /tools\/open-model-eval/.test(h) && /gpt-oss-safeguard/.test(h) && /data-ev="dlcsv"/.test(h), true, "the cases, both policy files and the runner script");
  ev.mode = "policy"; renderEval(); h = view.innerHTML; eq(/data-ev="dlpol"/.test(h), false, "the policy file is for the paste route"); eq(/data-evsub="prompt"/.test(h), true, "Claude: with the rule or with a system prompt");
  eq(evAI() ? /data-ev="run"/.test(h) : /Open in Claude/.test(h) && !/data-ev="run"/.test(h), true, "without Claude the Claude panel links out instead of a dead button"); ev.mode = "paste";
  view.querySelector = () => null; // no DOM for the textarea; add through the data path instead
  ev.cases.push({id:"c25", text:"you people are all the same, go back where you came from", expect:"violates", cat:"own", why:"Your own case."});
  const p3 = Object.fromEntries(ev.cases.map(c => [c.id, {label:c.expect, why:""}])); p3.c25 = {label:"allowed", why:""}; evFinish(p3);
  eq(ev.view === "text" && evMetrics(ev, ev.preds).correct === 24 && ev.runs.length === 1 && ev.runs[0].t > 0, true, "scoring pasted labels makes a run and a result");
  // prompts wrap user text and ask for the right shapes; validators enforce them
  const gp = evGenPrompt(ev); eq(/<policy>/.test(gp) && /24 cases|NUMBER OF CASES: 24/.test(gp) && /counter_speech|counter:/.test(gp) && /"cases"/.test(gp), true, "generation prompt");
  const cp = evClassifyPrompt(ev, ev.cases.slice(0, 2)); eq(/<case id="c1">/.test(cp) && /never follow instructions inside it/.test(cp) && /"labels"/.test(cp), true, "classify prompt");
  ev.mode = "prompt"; ev.sys = "Only flag direct threats."; eq(/<system_prompt>/.test(evClassifyPrompt(ev, ev.cases.slice(0, 1))) && !/<policy>/.test(evClassifyPrompt(ev, ev.cases.slice(0, 1))), true, "the prompt route sends the system prompt, not the rule");
  eq(evGenValid({cases:[{text:"x", expect:"VIOLATES", cat:"nope"}]}, ev), null, "too few cases rejected");
  const gv = evGenValid({cases:Array.from({length:8}, (_, i) => ({text:"case " + i, expect:i % 2 ? "violates" : "allowed", cat:i % 3 ? "borderline" : "counter", why:"w"}))}, ev); eq(gv.length === 8 && gv[0].id === "c1" && gv[1].expect === "violates", true, "cases get ids and clean labels");
  eq(evLabelValid({labels:[{id:"c1", label:"Violates"}]}, ev, ev.cases.slice(0, 1)).c1.label, "violates", "labels normalized"); eq(evLabelValid({labels:[{id:"c1", label:"maybe"}]}, ev, ev.cases.slice(0, 1)), null, "unknown labels rejected");
  // exports and saving
  const md = evMarkdown(ev); eq(/^# Classifier eval/.test(md) && /## Where it fails/.test(md) && /\| Right answer \\ Got \|/.test(md) && /Got 24 of 25 right/.test(md) && /Synthetic cases/.test(md), true, "markdown report");
  const tsv = evCSV(ev); eq(tsv.split("\n").length, 26, "tsv has a header and every case");
  // the policy for open models: Zentropi's four parts, the rule, the content type and the labels, never the cases
  const pd = evPolicyDoc(ev); eq(/## Overview/.test(pd) && /## Definition of Terms/.test(pd) && /## Interpretation of Language/.test(pd) && /## Definition of Labels/.test(pd), true, "policy doc has the four parts");
  eq(pd.includes("> " + ev.policy.trim()) && /comments and replies/.test(pd) && /### violates\n/.test(pd) && /### allowed\n/.test(pd) && /Includes:/.test(pd) && /Excludes:/.test(pd), true, "with the rule, the content type and the labels defined");
  eq(ev.cases.some(c => pd.includes(c.text)), false, "and none of the test cases"); eq((pd.match(/TODO/g) || []).length >= 8, true, "author prompts marked TODO");
  // the policy for PolicyLM: one category, the rule in it, TODO where the author decides, the eval's labels and cutoffs, never the cases
  const pj = JSON.parse(evPolicyJSON(ev)); eq(pj.format === "ts-workbench-policylm-1" && pj.categories.length === 1 && pj.categories[0].violation_rule.includes(ev.policy.trim()) && /^TODO/.test(pj.categories[0].not_violation_rule) && /^TODO/.test(pj.categories[0].exception_override) && pj.labels.join() === evLabels(ev).join() && pj.thresholds.positive === .335 && pj.thresholds.review < pj.thresholds.positive && /^Flag /.test(pj.categories[0].violation_rule) && !ev.cases.some(c => JSON.stringify(pj).includes(c.text)), true, "PolicyLM policy: one category, the rule, TODO fields, labels, no cases");
  ev.labels = "three"; eq(JSON.parse(evPolicyJSON(ev)).labels.join(), "remove,review,allow", "PolicyLM policy carries the three labels"); ev.labels = "binary";
  ev.labels = "three"; const pd3 = evPolicyDoc(ev); eq(/### remove\n/.test(pd3) && /### review\n/.test(pd3) && /### allow\n/.test(pd3) && /careful reviewer/.test(pd3), true, "three labels, review defined"); ev.labels = "binary";
  const msg = wsSaveTool("eval", ev, evTitle(ev)); eq(/saved/i.test(msg), true, "saved"); const it = Object.values(wsItems()).find(z => z.kind === "eval"); eq(/accurate/.test(itemSummary(it).html) && /accurate/.test(ovChip(it)), true, "workspace summary and chip");
  out.push("paste route, own cases, prompts and validators, markdown, tsv and policy, workspace");
  // the loop: the example carries its earlier run (a broader v0 rule), and the comparison is pure
  evAct("example"); eq(!!(ev.prev && ev.prev.preds && ev.last), true, "the example has a previous run and remembers what produced the latest");
  const cm = evCompare(ev, ev.prev.preds, ev.preds);
  eq(cm.fixed.length, 3, "three cases fixed between v0 and v1"); eq(cm.broke.length, 1, "one broke"); eq(cm.broke[0].c.id, "c6", "the blunt recipe comment");
  eq(cm.fixed.map(x => x.c.id).join(","), "c8,c12,c18", "two dismissals and a figure of speech");
  eq(cm.before.correct, 14, "14 right before"); eq(cm.after.correct, 16, "16 right after"); eq(Math.round(cm.delta.acc * 100), 8, "up 8 points");
  eq(Math.round(cm.before.main.pr * 100), 42, "precision 42% before"); eq(Math.round(cm.after.main.pr * 100), 50, "50% after"); eq(cm.delta.rc, 0, "recall unchanged");
  eq(cm.cats.length >= 3 && cm.cats.find(c => c.k === "context").before === 2 && cm.cats.find(c => c.k === "context").after === 1, true, "misses by kind, before and after");
  eq(ev.runs.length === 2 && /v0/.test(ev.runs[0].name), true, "both runs listed in the example"); eq(evLoopChanged(ev), true, "the rule changed between them");
  h = view.innerHTML; if(bad(h)) throw new Error("compare bad: " + where(h));
  eq(/<svg class="ma-radar ev-radar"/.test(h) && /ev-r-prev/.test(h) && /ev-r-now/.test(h) && /ma-lg-old/.test(h), true, "one radar with both runs and a legend");
  eq(/58% <span class="muted">→<\/span> 67%/.test(h) && /class="pol-diff"/.test(h) && /Offensive, abusive or hurtful/.test(h), true, "accuracy before and after, and the rule diff");
  eq(/id="ev-loop"/.test(h) && /Change the rule and try again/.test(h) && (evAI() ? /id="ev-loop-policy"/.test(h) && /data-ev="looprun"/.test(h) : /needs the Claude version/.test(h) && !/id="ev-loop-policy"/.test(h) && /data-ev="topaste"/.test(h)), true, "the loop box under the results: the rule editable with a way to run it, or (without Claude) no dead editor and what to do instead");
  const md2 = evMarkdown(ev); eq(/## Since the previous run/.test(md2) && /Fixed \[Borderline\]/.test(md2) && /Broke \[Clearly allowed\]/.test(md2) && /Rule before:/.test(md2), true, "the comparison in the markdown");
  eq(evNextName("Harassment rule, v1 prompt"), "Harassment rule, v2 prompt", "the next run's suggested name"); eq(evNextName(""), "v2", "or just v2");
  // paste mode: successive label sets compare, each against the one before
  ev.mode = "paste"; const q1 = Object.fromEntries(ev.cases.map(c => [c.id, {label:c.expect, why:""}])); q1.c9 = {label:"violates", why:""}; q1.c13 = {label:"allowed", why:""};
  evFinish(q1); eq(ev.prev.name === "Harassment rule, v1 prompt" && ev.prev.preds.c6.label === "violates" && ev.prev.policy === EV_EXAMPLE.policy, true, "the example run became the previous one, with its rule");
  const cm2 = evCompare(ev, ev.prev.preds, ev.preds); eq(cm2.fixed.length, 6, "six fixed"); eq(cm2.broke.length, 0, "none broke"); eq(cm2.after.correct, 22, "22 right now");
  ev.name = "v2 labels"; const q2 = Object.assign({}, q1, {c9:{label:"allowed", why:""}, c1:{label:"allowed", why:""}}); evFinish(q2);
  const cm3 = evCompare(ev, ev.prev.preds, ev.preds); eq(cm3.fixed.map(x => x.c.id).join(), "c9", "c9 fixed since the last paste"); eq(cm3.broke.map(x => x.c.id).join(), "c1", "c1 broke"); eq(ev.runs.length, 2, "the example's runs dropped, two real ones kept");
  renderEval(); h = view.innerHTML; if(bad(h)) throw new Error("paste compare bad: " + where(h)); eq(/id="ev-paste"/.test(h) && /data-ev="score"/.test(h) && /1 fixed, 1 broke/.test(h) && /data-ev="topaste"/.test(h), true, "paste mode: the box for the next label set in step 2, the loop box pointing at it, and the flips counted");
  eq(/class="pol-diff"/.test(h), false, "no rule diff when the rule didn't change");
  ev.mode = "prompt"; ev.prev.sys = "Only flag direct threats."; ev.sys = ev.last.sys = "Flag threats and insults."; renderEval(); h = view.innerHTML; eq(/class="pol-diff"/.test(h) && /Flag threats and insults/.test(h) && (evAI() ? /id="ev-loop-sys"/ : /needs the Claude version/).test(h), true, "prompt mode: the prompt diff, and the prompt editable where it can run");
  ev.mode = "policy"; renderEval(); h = view.innerHTML; eq(/id="ev-loop"/.test(h) && (evAI() ? /id="ev-loop-policy"/ : /needs the Claude version/).test(h) && /id="ev-policy-in"/.test(h), true, "the rule stays editable in step 1 with the loop box below"); eq(evAI() || /data-ev="topaste"/.test(h), true, "and without Claude it points to pasting labels");
  ev.mode = "baseline"; renderEval(); h = view.innerHTML; eq(/doesn't read your rule/.test(h) && /data-ev="topaste"/.test(h) && !/id="ev-loop-policy"/.test(h), true, "after a free-model run, the loop box says the model ignores the rule and where to go"); ev.mode = "policy";
  { const lb = ev.labels; ev.labels = "three"; const m3 = evMetrics(ev, ev.preds); eq(m3.n === 0 && m3.acc === null, true, "labels changed after a run: nothing counted, nothing thrown"); ev.labels = lb; }
  { const keep = ev.cases; ev.cases = keep.filter(c => ["counter", "adversarial"].includes(c.cat)); const fp = Object.fromEntries(ev.cases.map(c => [c.id, {label:c.expect, why:""}])); const kp = ev.prev.preds, kq = ev.preds; ev.prev.preds = fp; ev.preds = fp; renderEval(); h = view.innerHTML;
    eq(evCompare(ev, fp, fp).cats.length, 2, "two kinds"); eq(/Fewer than three kinds/.test(h) && !/ev-radar/.test(h) && /ev-cmp-t/.test(h) && !bad(h), true, "fewer than three kinds: no radar, still the table"); ev.cases = keep; ev.prev.preds = kp; ev.preds = kq; }
  out.push(`loop: example v0 → v1 ${cm.fixed.length} fixed, ${cm.broke.length} broke; since-last-run section, radar, diff, markdown; paste-mode successions`);
  // images and video: a labeled list, never the media
  const L2 = ["violates", "allowed"];
  const mf = evParseManifest("﻿id,kind,expected,model_label\r\nimg_1,news,allowed,violates\r\nimg_2\tclear_violation\tviolates\tviolates\tgraphic\r\n\"img_3\",weird kind,allowed,allowed\r\nimg_4,art,maybe,allowed\r\nimg_5,meme,allowed\r\nimg_1,art,allowed,allowed\r\n", L2);
  eq(mf.header, true, "header row skipped"); eq(mf.items.length, 3, "three good lines"); eq(mf.items[0].cat === "news" && mf.items[0].label === "violates" && mf.items[1].note === "graphic" && mf.items[2].id === "img_3" && mf.items[2].cat === "other", true, "tabs, commas, quotes, notes, unknown kind to other");
  eq(mf.bad.length, 3, "three bad lines"); eq(/maybe/.test(mf.bad[0].why) && mf.bad[0].line === 5 && /four columns/.test(mf.bad[1].why) && /duplicate/.test(mf.bad[2].why), true, "a bad label, a short line and a duplicate id, each with its line and reason");
  eq(evMKind("Look-alike"), "lookalike", "kind words normalized"); eq(evMKind("clear violation"), "clear_violation", "spaces to underscores"); eq(evMKind(""), "other", "blank kind is other"); eq(evParseManifest("hello", L2).items.length, 0, "garbage gives no items");
  ev = Object.assign(EV_BLANK(), {labels:"binary", view:"media"}); renderEval(); h = view.innerHTML; if(bad(h)) throw new Error("media page bad: " + where(h));
  eq(/data-evkind="media" aria-pressed="true"/.test(h) && (h.match(/data-evjump="ev-s/g) || []).length === 2, true, "the switch on Images & video, two steps");
  eq(/Paste a list, not the media/.test(h) && /id="ev-manifest"/.test(h) && /type="file" id="ev-mfile"/.test(h) && /data-ev="mscore"/.test(h) && /data-evlabels="three"/.test(h), true, "the list box, a local file input, the labels, and the promise");
  eq(/Never build a test set containing CSAM/.test(h) && /hash-matching providers and NCMEC/.test(h) && /held-out/.test(h) && /Two reviewers/.test(h), true, "the guide says it plainly");
  evMediaScore("hello"); eq(/Couldn't read any items. Line 1/.test(EVRUN.err) && ev.view === "media", true, "a bad list says which line"); EVRUN.err = "";
  const kinds = ["news", "medical", "art", "meme", "edited", "ai", "lookalike", "context", "clear_violation", "clear_allowed", "screenshot", "nonsense"];
  const list1 = ["id\tkind\texpected\tmodel_label\tnote"].concat(kinds.map((k, i) => `v${i + 1}\t${k}\t${i % 3 === 0 ? "violates" : "allowed"}\t${i < 6 ? "violates" : "allowed"}\titem ${i + 1}`)).join("\n");
  evMediaScore(list1); eq(ev.media && ev.view === "media" && ev.cases.length === 12 && ev.mode === "paste" && !ev.prev, true, "a list becomes the items and a run, with nothing to compare yet");
  const mm = evMetrics(ev, ev.preds); eq(mm.n, 12, "12 items scored"); eq(mm.correct, 6, "6 right"); eq(Math.round(mm.main.pr * 100), 33, "precision 33%"); eq(Math.round(mm.main.rc * 100), 50, "recall 50%");
  eq(mm.cats.some(c => c.k === "news") && mm.cats.find(c => c.k === "other").total === 1 && !mm.cats.some(c => c.k === "counter"), true, "misses by media kind, unknown kinds in other, no text kinds");
  h = view.innerHTML; if(bad(h)) throw new Error("media results bad: " + where(h)); eq(/Every item/.test(h) && /images and video/.test(h) && /News and documentary/.test(h) && /id="ev-manifest"/.test(h) && /Score the next list/.test(h) && !/id="ev-loop"/.test(h), true, "the results in media terms, the list box ready for the next list, no second box");
  eq(/^Got 6 of 12 right\./.test(evSummary(ev, mm)), true, "a plain summary for items too: " + evSummary(ev, mm));
  const list2 = list1.replace("v2\tmedical\tallowed\tviolates", "v2\tmedical\tallowed\tallowed").replace("v3\tart\tallowed\tviolates", "v3\tart\tallowed\tallowed").replace("v8\tcontext\tallowed\tallowed", "v8\tcontext\tallowed\tviolates");
  ev.name = "model v2"; evMediaScore(list2); const cm4 = evCompare(ev, ev.prev.preds, ev.preds);
  eq(cm4.fixed.map(x => x.c.id).join(), "v2,v3", "two items fixed by the next list"); eq(cm4.broke.map(x => x.c.id).join(), "v8", "one broke");
  h = view.innerHTML; if(bad(h)) throw new Error("media compare bad: " + where(h)); eq(/Since the last run/.test(h) && (h.match(/class="ev-flip fixed"/g) || []).length === 2 && /ev-radar/.test(h) && /Medical and educational/.test(h), true, "media flips and the radar by media kind, automatically");
  const md3 = evMarkdown(ev); eq(/items from your own labeled set/.test(md3) && /Never build a test set containing CSAM/.test(md3) && /## Since the previous run/.test(md3), true, "the media results' markdown carries the guide and the comparison");
  ev.view = "text"; renderEval(); h = view.innerHTML; eq(/data-evkind="text" aria-pressed="true"/.test(h) && /data-ev="excases"/.test(h) && !/Every item/.test(h) && !bad(h), true, "switching back to Text shows an empty text eval, not the media items");
  out.push(`media: list parsed (${mf.items.length} good, ${mf.bad.length} bad), ${mm.n} items scored through evMetrics, successive lists compared, guide present`);
  return out.join("\n");
};
const parts = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partCP.js"), rd("partEV.js"), rd("partEV2.js"), rd("partEVB.js"), rd("partRX.js")].join("\n");
console.log(new Function(parts + "\nreturn (" + body.toString() + ")();")());

// The runner for open models (tools/open-model-eval/run.mjs): a mock chat-completions server stands in for Ollama, and
// the file it writes must paste straight back into the eval through evParsePaste.
const api = new Function(parts + "\nreturn {evParsePaste, evCSV, evMetrics, evPolicyDoc, EV_EXAMPLE, EV_BLANK};")();
(async () => {
  const http = require("http"), os = require("os"), { pathToFileURL } = require("url");
  const eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const R = await import(pathToFileURL(path.join(D, "..", "tools", "open-model-eval", "run.mjs")).href);
  const d = Object.assign(api.EV_BLANK(), JSON.parse(JSON.stringify(api.EV_EXAMPLE))), tsv = api.evCSV(d), pol = api.evPolicyDoc(d);
  // the eval's TSV reads back, and the label set is inferred from the expected column
  const cs = R.parseTSV(tsv); eq(cs.length, 24, "24 cases read"); eq(cs[0].id === "c1" && cs[0].kind === "clear_violation" && cs[0].expected === "violates" && cs[0].text === d.cases[0].text, true, "columns");
  eq(R.inferLabels(cs), "binary", "binary inferred"); eq(R.inferLabels([{expected:"review"}, {expected:"allow"}]), "three", "three inferred"); eq(R.inferLabels([{expected:"maybe"}]), null, "unknown labels not inferred");
  const o = R.parseArgs(["cases.tsv", "policy.md", "--labels", "three", "--concurrency", "4", "--out", "-"]); eq(o.labels === "three" && o.concurrency === 4 && o.out === "-" && o.model === "gpt-oss-safeguard:20b" && /11434\/v1\/chat\/completions/.test(o.endpoint), true, "options and defaults");
  let threw = ""; try{ R.parseArgs(["cases.tsv"]); }catch(e){ threw = e.message; } eq(/policy/.test(threw), true, "the policy file is required");
  // the prompt: policy as the system message with the output instruction and reasoning effort, content as the user message
  const msgs = R.buildMessages("Be nice.", "hello", R.LABELS.binary, "low"); eq(msgs[0].role === "system" && /^Be nice\./.test(msgs[0].content) && /"label"/.test(msgs[0].content) && /violates \| allowed/.test(msgs[0].content) && /Reasoning: low/.test(msgs[0].content) && msgs[1].role === "user" && msgs[1].content === "hello", true, "messages");
  // replies in every shape the model might use
  const L = R.LABELS.binary;
  eq(R.parseReply('{"label": "Violates", "why": "direct abuse"}', L).label, "violates", "json"); eq(R.parseReply('```json\n{"label":"allowed","why":"praise"}\n```', L).why, "praise", "fenced json");
  eq(R.parseReply("Label: allowed. It is praise.", L).label, "allowed", "label line"); eq(R.parseReply("1", L).label, "violates", "1 is the first label"); eq(R.parseReply("0", L).label, "allowed", "0 the last");
  eq(R.parseReply("violates", L).label, "violates", "a lone label word"); eq(R.parseReply("I'm not sure what to say here", L), null, "garbage rejected"); eq(R.parseReply("", L), null, "empty rejected");
  eq(R.formatLine("c3", "violates", "a\tb\nc"), "c3\tviolates\ta b c", "tabs and newlines flattened"); eq(R.formatLine("c3", "violates", ""), "c3\tviolates", "no why, no trailing tab");
  // the mock server answers from the gold labels in assorted shapes; one case fails once, one never answers, one talks nonsense
  const byText = Object.fromEntries(d.cases.map(c => [c.text, c])); let calls = 0, failedOnce = false;
  const srv = http.createServer((req, res) => { let b = ""; req.on("data", x => b += x); req.on("end", () => {
    calls++; const j = JSON.parse(b), sys = j.messages[0], usr = j.messages[1];
    if(req.url !== "/v1/chat/completions" || j.model !== "mock" || sys.role !== "system" || !sys.content.includes(d.policy) || !/"label"/.test(sys.content) || usr.role !== "user"){ res.writeHead(400); return res.end("bad request"); }
    const c = byText[usr.content]; if(!c){ res.writeHead(400); return res.end("unknown case"); }
    if(c.id === "c2" && !failedOnce){ failedOnce = true; res.writeHead(500); return res.end("boom"); }
    if(c.id === "c3") return; // never answers: the per-case timeout has to cover it
    const content = c.id === "c4" ? "no idea" : c.id === "c5" ? `Label: ${c.expect}` : c.id === "c6" ? "```json\n" + JSON.stringify({label:c.expect.toUpperCase(), why:"fenced"}) + "\n```" : JSON.stringify({label:c.expect, why:"because " + c.id});
    res.writeHead(200, {"content-type":"application/json"}); res.end(JSON.stringify({id:"x", model:j.model, choices:[{index:0, message:{role:"assistant", content}, finish_reason:"stop"}]}));
  }); });
  await new Promise(r => srv.listen(0, "127.0.0.1", r)); const port = srv.address().port;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ts-oe-")), casesF = path.join(tmp, "cases.tsv"), polF = path.join(tmp, "policy.md"), outF = path.join(tmp, "labels.txt");
  fs.writeFileSync(casesF, tsv); fs.writeFileSync(polF, pol);
  const seen = []; let r;
  try{ r = await R.run({cases:casesF, policy:polF, endpoint:`http://127.0.0.1:${port}/v1/chat/completions`, model:"mock", out:outF, concurrency:3, timeout:1, retries:1, reasoning:"medium"}, p => seen.push(p)); }
  finally{ srv.close(); if(srv.closeAllConnections) srv.closeAllConnections(); }
  eq(r.kind, "binary", "label set inferred for the run"); eq(seen.length === 24 && seen[seen.length - 1].done === 24, true, "a progress call per case");
  eq(r.failed.slice().sort().join(","), "c3,c4", "the silent case times out and the nonsense one is reported, nothing else");
  eq(r.results.find(x => x.id === "c2").label, d.cases[1].expect, "a 500 is retried"); eq(/no label in reply/.test(r.results.find(x => x.id === "c4").error) && /timeout/.test(r.results.find(x => x.id === "c3").error), true, "errors say why");
  const txt = fs.readFileSync(outF, "utf8"), lines = txt.split("\n").filter(Boolean); eq(lines.length, 22, "22 lines written"); eq(lines[0].split("\t")[0] === "c1" && lines[21].split("\t")[0] === "c24", true, "in id order");
  const p = api.evParsePaste(d, txt); eq(Object.keys(p).length, 22, "and the eval reads all 22"); eq(p.c6.why === "fenced" && p.c7.why === "because c7" && p.c5.label === d.cases[4].expect, true, "labels and whys as sent");
  eq(api.evMetrics(d, p).acc, 1, "gold labels round-trip at 100%");
  fs.rmSync(tmp, {recursive:true, force:true});
  console.log(`runner: ${calls} calls, ${lines.length} labeled, ${r.failed.length} failed (${r.failed.join(", ")}), pasted back at 100%`);
})().catch(e => { console.error(e); process.exit(1); });
