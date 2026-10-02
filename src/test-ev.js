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
  eq(/data-ev="dlpol"/.test(h) && /tools\/open-model-eval/.test(h) && /gpt-oss-safeguard/.test(h), true, "the policy download and the runner script, for paste-mode users");
  ev.mode = "policy"; renderEval(); eq(/data-ev="dlpol"/.test(view.innerHTML), false, "not on the Claude routes"); ev.mode = "paste";
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
  // the policy for open models: Zentropi's four parts, the rule, the content type and the labels, never the cases
  const pd = evPolicyDoc(ev); eq(/## Overview/.test(pd) && /## Definition of Terms/.test(pd) && /## Interpretation of Language/.test(pd) && /## Definition of Labels/.test(pd), true, "policy doc has the four parts");
  eq(pd.includes("> " + ev.policy.trim()) && /comments and replies/.test(pd) && /### violates\n/.test(pd) && /### allowed\n/.test(pd) && /Includes:/.test(pd) && /Excludes:/.test(pd), true, "with the rule, the content type and the labels defined");
  eq(ev.cases.some(c => pd.includes(c.text)), false, "and none of the test cases"); eq((pd.match(/TODO/g) || []).length >= 8, true, "author prompts marked TODO");
  ev.labels = "three"; const pd3 = evPolicyDoc(ev); eq(/### remove\n/.test(pd3) && /### review\n/.test(pd3) && /### allow\n/.test(pd3) && /careful reviewer/.test(pd3), true, "three labels, review defined"); ev.labels = "binary";
  const msg = wsSaveTool("eval", ev, evTitle(ev)); eq(/saved/i.test(msg), true, "saved"); const it = Object.values(wsItems()).find(z => z.kind === "eval"); eq(/accurate/.test(itemSummary(it).html) && /accurate/.test(ovChip(it)), true, "workspace summary and chip");
  out.push("paste route, own cases, prompts and validators, markdown, tsv and policy, workspace");
  return out.join("\n");
};
const parts = stub + "const GT_MORE = {};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partCV.js"), rd("partTK.js"), rd("partGD.js"), rd("partCP.js"), rd("partEV.js")].join("\n");
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
