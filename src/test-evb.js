// Checks the classifier eval's in-browser baseline without a browser or a network: the output normalization, the mapping
// from the model's six scores to the eval's labels and thresholds, the step-2 panel in every state, the order of the
// wrong cases for a fixed-category model, and the scores becoming the run in the results. The model itself is
// never loaded here: the scores below were measured in a browser on the example's 24 cases (MiniLMv2 toxic, q8, WASM).
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  // the model's output in the shapes the pipeline uses: one string gives [{label, score}], batches nest, unknown labels ignored
  const n1 = evbNorm([{label:"toxic", score:0.92}, {label:"insult", score:0.84}, {label:"obscene", score:0.5}, {label:"threat", score:0}, {label:"identity_hate", score:0.01}, {label:"severe_toxic", score:0.013}]);
  eq(n1.toxic, 0.92, "toxic kept"); eq(n1.insult, 0.84, "insult kept"); eq(Object.keys(n1).length, 6, "six categories");
  const n2 = evbNorm([[{label:"TOXIC", score:"0.3"}, {label:"weird", score:0.9}, {label:"threat", score:7}]]); eq(n2.toxic, 0.3, "nested and uppercase"); eq(n2.threat, 1, "clamped"); eq("weird" in n2, false, "unknown label dropped");
  eq(evbNorm(null).toxic, 0, "nothing gives zeros");
  // mapping to the eval's labels, with the stated thresholds
  ev = Object.assign(EV_BLANK(), {labels:"binary"});
  eq(evbMap({toxic:0.5}, ev).label, "violates", "0.50 is the positive label"); eq(evbMap({toxic:0.49}, ev).label, "allowed", "0.49 is allowed");
  eq(evbMap({toxic:0.1, threat:0.7}, ev).label, "violates", "any category counts"); eq(evbMap({toxic:0.1, threat:0.7}, ev).top, "threat", "and names the top one");
  eq(evbMap({toxic:0.92, insult:0.84}, ev).why, "toxic 0.92, insult 0.84", "the why lists the top two"); eq(evbMap({toxic:0.3, insult:0.05}, ev).why, "toxic 0.30", "but not a tiny second");
  ev.labels = "three"; eq(evbMap({toxic:0.6}, ev).label, "remove", "three labels: remove"); eq(evbMap({toxic:0.25}, ev).label, "review", "the review band"); eq(evbMap({toxic:0.24}, ev).label, "allow", "below it, allow");
  eq(evbMap({}, ev).label, "allow", "no scores is the last label");
  out.push("normalization and label mapping, binary and three labels");
  // the panel before anything loads: model, license, size, where it runs, what stays here, and the thresholds; nothing auto-loads
  evAct("example"); ev.mode = "baseline"; renderEval(); let h = view.innerHTML; if(bad(h)) throw new Error("page bad: " + where(h));
  eq(/id="evb"/.test(h) && /class="card tr-tier on" data-evmode="baseline"/.test(h) && /Free model in your browser/.test(h), true, "the panel sits under the free-model tile in step 2");
  eq(/MiniLMv2 toxic/.test(h) && /Apache-2\.0/.test(h) && /Download and run \(24 MB\)/.test(h) && /data-evb="run"/.test(h), true, "model, license, size and the one button");
  eq(/never leaves your browser/.test(h) && /Hugging Face and jsDelivr/.test(h) && /stays cached in this browser/.test(h) && /Not your classifier/.test(h), true, "says where it downloads from, what stays here, and what it is not");
  eq(/at or above 0\.50 counts as &quot;violates&quot;/.test(h) && /anything lower as &quot;allowed&quot;/.test(h), true, "the threshold, stated");
  eq(EVB.state === "idle" && EVB.lib === null && Object.keys(EVB.pipes).length === 0, true, "nothing loaded by rendering");
  ev.labels = "three"; h = evbCardHTML(); eq(/counts as &quot;remove&quot;, from 0\.25 as &quot;review&quot;, anything lower as &quot;allow&quot;/.test(h), true, "three labels: the review band is stated"); ev.labels = "binary";
  // loading and scoring states: progress in MB and percent, a way to stop
  EVB.state = "loading"; EVB.loaded = 11.8e6; EVB.total = 23578876; h = evbCardHTML(); if(bad(h)) throw new Error("loading bad: " + where(h));
  eq(/Downloading MiniLMv2 toxic… 12 of 24 MB/.test(h) && /aria-valuenow="50"/.test(h) && /data-evb="stop"/.test(h) && /To this browser only/.test(h), true, "download progress with a stop button");
  EVB.state = "running"; EVB.done = 6; EVB.n = 24; h = evbCardHTML(); eq(/Scoring 6 of 24/.test(h) && /aria-valuenow="25"/.test(h) && /Nothing is sent anywhere/.test(h), true, "scoring progress");
  EVB.state = "error"; EVB.err = evbErr(new Error("Failed to fetch")); h = evbCardHTML(); eq(/Couldn't download the model/.test(h) && /data-evb="run"/.test(h) && /data-evb="alt"/.test(h) && /toxic-bert instead \(111 MB\)/.test(h), true, "a plain failure message, try again, and the fallback model");
  eq(/couldn't run the model/.test(evbErr(new Error("WebAssembly.instantiate failed"))) && /couldn't run/.test(evbErr("")), true, "other failures say so plainly");
  out.push("idle, loading, scoring and error states");
  // measured scores for the example's 24 cases (highest category = toxic for every one of them)
  const toxic = {c1:.076, c2:.466, c3:.003, c4:.003, c5:.003, c6:.012, c7:.036, c8:.008, c9:.023, c10:.586, c11:.961, c12:.01, c13:.772, c14:.2, c15:.003, c16:.019, c17:.263, c18:.732, c19:.003, c20:.006, c21:.007, c22:.009, c23:.007, c24:.959};
  EVB.state = "done"; EVB.err = ""; EVB.ms = 204; EVB.key = evbKey(ev); EVB.scores = Object.fromEntries(Object.entries(toxic).map(([id, v]) => [id, evbNorm([{label:"toxic", score:v}, {label:"insult", score:id === "c11" ? .846 : v / 4}])]));
  const preds = evbPreds(ev), mt = evMetrics(ev, preds);
  eq(mt.n, 24, "every case scored"); eq(mt.correct, 15, "15 of 24 agree with the reviewer"); eq(mt.main.tp, 2, "two true positives"); eq(mt.main.fp, 3, "three false positives"); eq(mt.main.fn, 6, "six misses");
  const gaps = evbGaps(ev, preds); eq(gaps.length, 9, "nine disagreements");
  eq(gaps[0].c.id, "c10", "counter-speech first: the quoted abuse"); eq(gaps[1].c.id, "c11", "then the banter"); eq(gaps[2].c.id, "c18", "then the hyperbole"); eq(gaps[3].c.cat, "adversarial", "then the obfuscated miss");
  eq(/reporting it is allowed/.test(gaps[0].why) && /who is talking to whom/.test(gaps[1].why) && /other languages/.test(gaps.find(g => g.c.id === "c21").why), true, "each gap says why a word-and-tone model misses it");
  h = evbCardHTML(); if(bad(h)) throw new Error("done bad: " + where(h));
  eq(/Done\./.test(h) && /agreed with your right answers on 15 of 24 cases, in 204 ms/.test(h) && /data-ev="again"/.test(h) && /data-evb="run">Run again/.test(h) && /stays cached/.test(h), true, "the panel after a run: the count, a way to the results, run again, cache note");
  // the scores become the run in step 3, under the model's own name; the visitor's example run becomes the one to compare with
  const was = ev.preds, name = evbFinish(); eq(name, "Baseline: MiniLMv2 toxic", "named as the baseline");
  eq(ev.mode === "baseline" && ev.preds !== was && ev.preds.c10.label === "violates" && ev.preds.c10.why === "toxic 0.59, insult 0.15", true, "the free model's labels and scores are the run");
  eq(ev.runs[ev.runs.length - 1].name === name && ev.runs[ev.runs.length - 1].acc === 15 / 24, true, "listed as a run with its accuracy"); eq(ev.prev && ev.prev.name, "Harassment rule, v1 prompt", "the example's run is the one before");
  renderEval(); h = view.innerHTML; if(bad(h)) throw new Error("results bad: " + where(h));
  eq(/63%/.test(h) && /Got 15 of 24 right/.test(h) && /scores words and tone, not your rule/.test(h) && /class="card ev-step done" id="ev-s3"/.test(h), true, "results in step 3, with the honest note");
  const wrong = h.slice(h.indexOf("What it got wrong")); eq(wrong.indexOf("Counter-speech · c10") > 0 && wrong.indexOf("Counter-speech · c10") < wrong.indexOf("Context-dependent · c11") && /reporting it is allowed/.test(wrong) && /you're worthless/.test(wrong), true, "the wrong cases led by counter-speech, each saying why a word-and-tone model misses it");
  eq(/doesn't read your rule/.test(h) && /data-ev="topaste"/.test(h), true, "the loop box says a new wording won't change this model's labels, and where to go");
  ev.tab = "runs"; renderEval(); eq(/Baseline: MiniLMv2 toxic/.test(view.innerHTML) && /Harassment rule, v1 prompt/.test(view.innerHTML), true, "both in the runs table"); ev.tab = "kinds";
  // the cases change under a finished run: the panel says so instead of showing stale scores; a loaded model means no re-download
  ev.cases.push({id:"c25", text:"a new case", expect:"allowed", cat:"own", why:"Your own case."}); h = evbCardHTML();
  eq(/The cases changed since this model ran/.test(h) && !/Done\./.test(h), true, "stale scores aren't shown");
  EVB.pipes["minuva/MiniLMv2-toxic-jigsaw-onnx"] = {}; h = evbCardHTML(); eq(/data-evb="run">Run the free model</.test(h) && /Already downloaded/.test(h), true, "a loaded model runs without downloading"); delete EVB.pipes["minuva/MiniLMv2-toxic-jigsaw-onnx"];
  // the fallback model switches the whole panel
  EVB.model = 1; h = evbCardHTML(); eq(/toxic-bert/.test(h) && /Download and run \(111 MB\)/.test(h) && /Xenova/.test(h), true, "the fallback's name, size and port"); EVB.model = 0; EVB.state = "idle"; EVB.scores = null;
  out.push("results: 15/24 as the run in step 3, nine gaps led by counter-speech and banter, runs table, stale and fallback states");
  return out.join("\n");
};
const parts = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partCP.js"), rd("partEV.js"), rd("partEV2.js"), rd("partEVB.js"), rd("partRX.js")].join("\n");
console.log(new Function(parts + "\nreturn (" + body.toString() + ")();")());
