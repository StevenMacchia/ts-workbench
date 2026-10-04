/* =========================================================
   CLASSIFIER EVAL, baseline: a small open toxicity model that runs in the visitor's own browser.
   Nothing loads until the visitor clicks. Then transformers.js (pinned, from jsDelivr) and the model's ONNX weights (from the
   Hugging Face CDN) download to this browser, the browser caches them (Cache API), and the cases are scored here: the text of
   the cases never leaves the browser. A fixed-category model scores words and tone, not the visitor's rule; its scores become
   a run in the results, named as the baseline, where the cases it gets wrong say why a model like it fails them.
   Verified in a browser on 2026-10-03: MiniLMv2 loads cold in under a second on a fast line, scores 24 cases in ~0.2 s on WASM.
   ========================================================= */
const EVB_LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
// The first model is the default. The second is offered only if the first fails to load. Both: Jigsaw toxic-comment labels,
// sigmoid per label. Sizes are what the browser fetches (quantized ONNX weights plus tokenizer), measured with the progress callback.
const EVB_MODELS = [
  {id:"minuva/MiniLMv2-toxic-jigsaw-onnx", name:"MiniLMv2 toxic", lic:"Apache-2.0", mb:24, bytes:23578876, opts:{dtype:"q8", subfolder:".", model_file_name:"model_optimized"},
   about:"an open model of about 24 MB, distilled from Unitary's toxic-bert (unitary/toxic-bert, also Apache-2.0) and trained on Jigsaw's toxic comment data"},
  {id:"Xenova/toxic-bert", name:"toxic-bert", lic:"Apache-2.0", mb:111, bytes:111433092, opts:{dtype:"q8"},
   about:"Unitary's toxic-bert (unitary/toxic-bert), trained on Jigsaw's toxic comment data, 111 MB quantized, in the ONNX port by Xenova"}
];
const EVB_CATS = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"];
const EVB_T = {pos:.5, review:.25}; // highest score at or above pos: the positive label; three labels: review band from .25
const EVB = {state:"idle", model:0, loaded:0, total:0, files:{}, err:"", note:"", lib:null, pipes:{}, scores:null, key:"", ms:0, loadMs:0, done:0, n:0, stop:false, last:0};
const evbModel = () => EVB_MODELS[EVB.model] || EVB_MODELS[0];
const evbMB = b => (b / 1e6).toFixed(b < 1e7 ? 1 : 0);
// Which cases the scores belong to: the cases can change under a finished run (regenerate, add your own)
const evbKey = d => (d.cases || []).map(c => c.id + "\t" + c.text).join("\n");

/* ---------- pure helpers ---------- */
// The pipeline returns [{label, score}] for one string, or nested arrays; make it {label: score} over the known labels
function evbNorm(out){
  const flat = [], walk = x => { if(Array.isArray(x)) x.forEach(walk); else if(x && typeof x.label === "string") flat.push(x); };
  walk(out);
  const s = {}; EVB_CATS.forEach(k => s[k] = 0);
  flat.forEach(x => { const k = String(x.label).toLowerCase(), v = +x.score; if(k in s && Number.isFinite(v)) s[k] = Math.min(1, Math.max(0, v)); });
  return s;
}
// The categories by score, highest first
const evbRank = s => EVB_CATS.filter(k => k in s).map(k => ({k, v:+s[k] || 0})).sort((a, b) => b.v - a.v);
// The model's six scores, mapped to the eval's labels with the stated thresholds
function evbMap(scores, d){
  const L = evLabels(d), pos = evPos(d), r = evbRank(scores || {}), top = r[0] || {k:"toxic", v:0};
  const label = top.v >= EVB_T.pos ? pos : L.length === 3 && top.v >= EVB_T.review ? L[1] : L[L.length - 1];
  const why = r.slice(0, 2).filter((x, i) => !i || x.v >= .1).map(x => `${x.k.replace("_", " ")} ${x.v.toFixed(2)}`).join(", ");
  return {label, why, top:top.k, score:top.v};
}
const evbPreds = d => EVB.scores ? Object.fromEntries(d.cases.filter(c => EVB.scores[c.id]).map(c => [c.id, evbMap(EVB.scores[c.id], d)])) : null;
// Why a word-and-tone model misses this kind of case, one line each
const EVB_WHY = {
  counter:"Quoting or condemning abuse contains the same words as abuse. The model can't be told that reporting it is allowed.",
  context:"Banter, sarcasm and in-group language score on the words, not on who is talking to whom.",
  newsworthy:"Reporting and teaching about the behavior use its vocabulary.",
  hyperbole:"Figures of speech about dying or killing score like threats.",
  adversarial:"Spacing, symbols and misspellings hide the words it was trained on.",
  multilingual:"Trained on English comments: other languages score near zero either way.",
  clear_violation:"Abuse without swear words or slurs scores low. The model keys on vocabulary, not on the target.",
  borderline:"The model has no idea where your rule draws the line; it only has a toxicity score.",
  clear_allowed:"Blunt or negative words about the work score as abuse of the person.",
  offtopic:"A word it associates with toxicity, out of context.",
  own:"Your own case: see which words the score follows."
};
// The misses, with the kinds the rule decides first: that's where a fixed-category model is wrong by design. Orders the wrong cases in the results of a baseline run.
function evbGaps(d, preds){
  const order = ["counter", "context", "newsworthy", "hyperbole", "adversarial", "multilingual", "clear_violation", "clear_allowed", "borderline", "offtopic", "own"];
  return d.cases.filter(c => preds[c.id] && preds[c.id].label !== evGold(d, c))
    .map(c => ({c, got:preds[c.id], want:evGold(d, c), why:EVB_WHY[c.cat] || ""}))
    .sort((a, b) => (order.indexOf(a.c.cat) + 1 || 99) - (order.indexOf(b.c.cat) + 1 || 99) || b.got.score - a.got.score);
}

/* ---------- the panel under the "Free model in your browser" tile in step 2 ---------- */
function evbCardHTML(){
  const m = evbModel(), L = evLabels(ev), pos = evPos(ev), last = L[L.length - 1], three = L.length === 3, has = !!EVB.pipes[m.id];
  const stale = EVB.state === "done" && EVB.key !== evbKey(ev);
  const rule = `How it's scored: the model gives six scores, 0 to 1, for ${EVB_CATS.map(k => k.replace("_", " ")).join(", ")}. The highest score at or above ${EVB_T.pos.toFixed(2)} counts as "${pos}"${three ? `, from ${EVB_T.review.toFixed(2)} as "${L[1]}"` : ""}, anything lower as "${last}".`;
  let body;
  if(EVB.state === "loading" || EVB.state === "running"){
    const dl = EVB.state === "loading", total = Math.max(EVB.total, m.bytes), pct = dl ? Math.min(99, Math.round(EVB.loaded / total * 100)) : Math.round(EVB.done / Math.max(1, EVB.n) * 100);
    body = `<div class="evb-busy"><span class="ai-spin" aria-hidden="true"></span><div><b id="evb-stage" aria-live="polite">${dl ? `Downloading ${esc(m.name)}… ${evbMB(EVB.loaded)} of ${evbMB(total)} MB` : `Scoring ${EVB.done} of ${EVB.n}…`}</b><span class="note">${dl ? "To this browser only, from the Hugging Face and jsDelivr CDNs." : "In this browser. Nothing is sent anywhere."}</span><div class="ev-bar evb-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div></div><button type="button" class="btn sm" data-evb="stop">Stop</button></div>`;
  } else if(EVB.state === "error"){
    const alt = EVB_MODELS[EVB.model + 1];
    body = `<p class="ai-err" role="alert">${esc(EVB.err)}</p><div class="pol-run"><button type="button" class="btn" data-evb="run">Try again</button>${alt ? `<button type="button" class="btn" data-evb="alt">Try ${esc(alt.name)} instead (${alt.mb} MB)</button>` : ""}<span class="note">Nothing about your cases was sent. The download is the only network use.</span></div>`;
  } else if(EVB.state === "done" && !stale){
    const mt = evMetrics(ev, evbPreds(ev));
    body = `<p><b>Done.</b> ${esc(m.name)} agreed with your right answers on ${mt.correct} of ${mt.n} cases, in ${EVB.ms < 1000 ? EVB.ms + " ms" : (EVB.ms / 1000).toFixed(1) + " s"}, in this browser. The results are in step 3.</p>
      <p class="note">${esc(rule)}</p>
      <div class="pol-run"><button type="button" class="btn sm primary" data-ev="again">See the results</button><button type="button" class="btn sm" data-evb="run">Run again</button><span class="note">The model stays cached in this browser.</span></div>`;
  } else {
    body = `<p><b>${esc(m.name)}</b> (${esc(m.lic)}) is ${esc(m.about)}. It downloads to this browser from the Hugging Face and jsDelivr CDNs, runs here, and <b>the text of your cases never leaves your browser</b>. Once downloaded it stays cached in this browser.</p>
      <p class="note">Not your classifier. A general toxicity model scores words and tone, not your rule: it shows what a fixed-category model gets wrong against it. ${esc(rule)}</p>
      ${stale ? `<p class="note">The cases changed since this model ran. Run it again to score the new set.</p>` : EVB.note ? `<p class="note">${esc(EVB.note)}</p>` : ""}
      <div class="pol-run"><button type="button" class="btn primary" data-evb="run">${has ? "Run the free model" : `Download and run (${m.mb} MB)`}</button><span class="note">${has ? "Already downloaded. A few seconds." : `${m.mb} MB once, plus about 4 MB of runtime, then a few seconds to score.`}</span></div>`;
  }
  return `<div class="evb" id="evb" aria-label="Free model in your browser">${body}</div>`;
}
// Redraw only the card, so the rest of the page (the paste box, the gold labels) stays as the visitor left it
function evbDraw(){
  if(!evHere()) return;
  const el = document.getElementById("evb"); if(!el) return;
  const y = window.scrollY; el.outerHTML = evbCardHTML(); window.scrollTo(0, y);
}
const evbTick = force => { const t = Date.now(); if(force || t - EVB.last > 120){ EVB.last = t; evbDraw(); } };

/* ---------- loading and scoring ---------- */
async function evbLoad(m){
  if(EVB.pipes[m.id]) return EVB.pipes[m.id];
  EVB.lib = EVB.lib || await import(EVB_LIB);
  const T = EVB.lib; T.env.allowLocalModels = false; T.env.useBrowserCache = true;
  const pipe = await T.pipeline("text-classification", m.id, Object.assign({progress_callback:p => {
    if(!p || EVB.state !== "loading") return;
    if(p.status === "progress" && p.file){ EVB.files[p.file] = [p.loaded || 0, p.total || 0]; }
    else if(p.status === "done" && p.file && EVB.files[p.file]) EVB.files[p.file][0] = EVB.files[p.file][1];
    const f = Object.values(EVB.files); EVB.loaded = f.reduce((s, x) => s + x[0], 0); EVB.total = f.reduce((s, x) => s + x[1], 0); evbTick(p.status !== "progress");
  }}, m.opts));
  EVB.pipes[m.id] = pipe;
  return pipe;
}
function evbErr(e){
  const s = String(e && e.message || e || "");
  if(/fetch|network|Failed to|404|load/i.test(s)) return "Couldn't download the model. Check the connection, and whether a blocker stops huggingface.co or cdn.jsdelivr.net, then try again.";
  if(/WebAssembly|wasm|memory|backend/i.test(s)) return "This browser couldn't run the model. A current Chrome, Edge, Firefox or Safari on a desktop or a recent phone should work.";
  return "The baseline couldn't run" + (s ? `: ${s.slice(0, 140)}` : ".");
}
async function evbRun(){
  if(EVB.state === "loading" || EVB.state === "running") return;
  const m = evbModel(), cases = ev.cases.slice(), key = evbKey(ev);
  EVB.state = EVB.pipes[m.id] ? "running" : "loading"; EVB.err = ""; EVB.note = ""; EVB.stop = false; EVB.files = {}; EVB.loaded = 0; EVB.total = 0; EVB.done = 0; EVB.n = cases.length; evbDraw();
  try{
    const t0 = Date.now(), pipe = await evbLoad(m); EVB.loadMs = Date.now() - t0;
    if(EVB.stop) return;
    EVB.state = "running"; evbTick(true);
    const t1 = Date.now(), scores = {};
    for(const c of cases){
      if(EVB.stop) return;
      scores[c.id] = evbNorm(await pipe(String(c.text).slice(0, 2000), {top_k:null}));
      EVB.done++; evbTick();
    }
    EVB.ms = Date.now() - t1; EVB.scores = scores; EVB.key = key; EVB.state = "done";
    if(evbKey(ev) === key) evbFinish();
  }catch(e){ if(!EVB.stop){ EVB.state = "error"; EVB.err = evbErr(e); } }
  finally{ if(EVB.state === "loading" || EVB.state === "running") EVB.state = "idle"; evbDraw(); }
}
// The scores become the run in step 3, under the model's own name, never as the visitor's classifier. Returns the run's name.
function evbFinish(){
  const preds = evbPreds(ev); if(!preds || !Object.keys(preds).length) return "";
  const m = evbModel(), name = "Baseline: " + m.name, mt = evMetrics(ev, preds);
  ev.mode = "baseline"; evFinish(preds, name);
  if(evHere()){ renderEval(); evGoResults(`${m.name} got ${mt.correct} of ${mt.n} right`); }
  return name;
}
function evbAct(a){
  switch(a){
    case "run": return evbRun();
    case "alt": if(EVB_MODELS[EVB.model + 1]){ EVB.model++; EVB.state = "idle"; EVB.err = ""; } return evbRun();
    case "stop": EVB.stop = true; EVB.note = EVB.state === "loading" ? "Stopped. Whatever had downloaded stays cached, so the next click starts further along." : "Stopped."; EVB.state = "idle"; return evbDraw();
  }
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-evb]");
  if(!b || !evHere() || !view.contains(b)) return;
  evbAct(b.dataset.evb);
});
