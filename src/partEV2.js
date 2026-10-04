/* =========================================================
   CLASSIFIER EVAL, part 2: the rule-improvement loop and image/video lists
   Loop: each run keeps the one before it (its labels, and the rule or prompt that produced them), so the report can show
   what flipped: fixed, broke, precision and recall before and after, and misses by kind on one radar. From the second run
   on, that comparison sits at the top of the results; the box under the results is where the rule is changed and run again.
   Media: an image or video classifier is scored from a labeled list the user pastes or opens locally. The list names
   items; the media itself is never pasted, uploaded or read.
   ========================================================= */
// The kinds of case an image or video test set needs. The fourth field lists other words a list may use for the kind.
const EV_MCATS = [
  ["clear_violation", "Clear violation", "Plainly breaks the rule.", "violation,violating,clear,clear violation"],
  ["clear_allowed", "Clearly allowed", "Plainly fine, on the same topic.", "allowed,benign,fine,ok,clearly allowed"],
  ["news", "News and documentary", "Reporting or documenting the behavior: conflict, protest, crime, disaster.", "newsworthy,documentary,journalism,reporting"],
  ["medical", "Medical and educational", "Clinical, anatomical, health or teaching material.", "educational,education,health,clinical"],
  ["art", "Art", "Painting, sculpture, illustration, performance.", "artistic,artwork"],
  ["meme", "Memes with text", "The meaning sits in the caption or overlay, not the picture.", "memes,text,overlay,caption"],
  ["screenshot", "Screenshots", "Screens of chats, posts or other apps; the violation is in the captured text.", "screenshots,screen"],
  ["edited", "Cropped or edited copies", "Crops, flips, filters, re-encodes and borders of known items.", "cropped,crop,copy,copies,altered,modified"],
  ["ai", "AI-generated", "Synthetic images or video, including of real-looking people.", "generated,synthetic,deepfake,ai-generated"],
  ["lookalike", "Look-alikes", "Innocent content that resembles the violation: toys, costumes, props, similar objects.", "look-alike,lookalikes,look-alikes,similar"],
  ["context", "Context-dependent", "Depends on the caption, the audience or where it was posted.", "contextual,caption"],
  ["other", "Other", "Kinds the list didn't name, or named differently.", "unknown,misc"]
];
// Which kinds a test set is scored by: an explicit list, the media kinds, or the text kinds
const evCatList = d => (d && d.catList) || (d && d.media ? EV_MCATS : EV_CATS);
const evContentLabel = d => cpLabel(EV_CONTENT, d.content) || (d.media ? "Images and video" : "");
const EVL = {manifest:"", paste:"", own:"", bad:[]}; // text typed into the boxes but not yet used, so a redraw doesn't lose it

/* ---------- the example's earlier run: the rule before the author narrowed it to harassment ---------- */
// A one-line "no offensive content" rule flagged dismissals, banter and a figure of speech. Narrowing it to harassment of
// other users fixed three of those and broke one (blunt feedback about a recipe). The misses that remain are the hard ones.
EV_EXAMPLE.prev = {name:"v0: no offensive content", t:0, sys:"", policy:"Offensive, abusive or hurtful content will be removed.",
  preds:{c1:{label:"violates", why:"Abusive."}, c2:{label:"violates", why:"Mocks appearance."}, c3:{label:"violates", why:"Hurtful pile-on."}, c4:{label:"allowed", why:"Disagreement."}, c5:{label:"allowed", why:"Positive."}, c6:{label:"allowed", why:"About the recipe."},
    c7:{label:"violates", why:"'Lazy' is offensive."}, c8:{label:"violates", why:"Dismissive and hurtful."}, c9:{label:"violates", why:"Contains 'delete her account'."}, c10:{label:"violates", why:"Contains 'you're worthless'."}, c11:{label:"violates", why:"Calls the user an idiot."}, c12:{label:"violates", why:"Dismissive of a group."},
    c13:{label:"allowed", why:"No offensive words detected."}, c14:{label:"allowed", why:"No clear abuse."}, c15:{label:"allowed", why:"Discussion of harassment."}, c16:{label:"allowed", why:"Educational."}, c17:{label:"allowed", why:"Hyperbole."}, c18:{label:"violates", why:"Hurtful language about death."},
    c19:{label:"allowed", why:"Unrelated."}, c20:{label:"allowed", why:"Unrelated."}, c21:{label:"allowed", why:"Language not recognized."}, c22:{label:"allowed", why:"Positive."}, c23:{label:"violates", why:"Threat."}, c24:{label:"violates", why:"Insults appearance."}}};
EV_EXAMPLE.last = {policy:EV_EXAMPLE.policy, sys:"", name:EV_EXAMPLE.name, t:0};
EV_EXAMPLE.runs.unshift({t:0, name:"v0: no offensive content", n:24, acc:14 / 24, pr:5 / 12, rc:5 / 8});

/* ---------- the loop: keep the previous run, compare with the latest ---------- */
// Called by evFinish before it overwrites the labels: the run being replaced becomes the one to compare with
function evLoopBefore(preds){
  const old = ev.preds; if(!old || !ev.cases.some(c => old[c.id])) return;
  const l = ev.last || {};
  ev.prev = {preds:old, policy:l.policy !== undefined ? l.policy : ev.policy, sys:l.sys !== undefined ? l.sys : ev.sys, name:l.name !== undefined ? l.name : ev.name, t:l.t || 0};
}
// And after: remember what produced this run, so the next comparison can show how the rule changed
function evLoopAfter(name){ ev.last = {policy:ev.policy, sys:ev.sys, name:name || ev.name, t:Date.now()}; ev.draft = null; }
// The rule or prompt the latest run used (the one in the box may have been edited since)
const evLastOf = (d, key) => d.last && d.last[key] !== undefined ? d.last[key] : d[key];
// Leaving the media path for a text eval: its cases and runs don't carry over
function evLeaveMedia(){ if(!ev.media) return; ev.media = false; ev.cases = []; ev.preds = null; ev.prev = null; ev.last = null; ev.gold = {}; }
// Pure comparison of two label sets over the same cases
function evCompare(d, prevPreds, preds){
  const before = evMetrics(d, prevPreds), after = evMetrics(d, preds);
  const both = d.cases.filter(c => prevPreds && prevPreds[c.id] && preds && preds[c.id]);
  const fl = both.map(c => { const gold = evGold(d, c), was = prevPreds[c.id].label, now = preds[c.id].label; return {c, gold, was, now, wasOk:was === gold, nowOk:now === gold}; });
  const fixed = fl.filter(x => !x.wasOk && x.nowOk), broke = fl.filter(x => x.wasOk && !x.nowOk);
  const cats = evCatList(d).map(k => { const cs = both.filter(c => c.cat === k[0]); if(!cs.length) return null; const miss = p => cs.filter(c => p[c.id].label !== evGold(d, c)).length;
    return {k:k[0], n:k[1], total:cs.length, before:miss(prevPreds), after:miss(preds)}; }).filter(Boolean);
  const dv = (a, b) => a === null || a === undefined || b === null || b === undefined ? null : b - a, mm = m => m.main || {pr:null, rc:null};
  return {n:both.length, fixed, broke, before, after, cats, delta:{acc:dv(before.acc, after.acc), pr:dv(mm(before).pr, mm(after).pr), rc:dv(mm(before).rc, mm(after).rc)}};
}
// Did the rule or prompt change between the two runs?
const evLoopChanged = d => d.prev ? (d.mode === "prompt" ? String(d.prev.sys || "") !== String(evLastOf(d, "sys") || "") : String(d.prev.policy || "") !== String(evLastOf(d, "policy") || "")) : false;
// "Harassment rule, v1 prompt" suggests "Harassment rule, v2 prompt"
function evNextName(name){
  const s = String(name || "").trim(); if(!s) return "v2";
  return /v(\d+)/i.test(s) ? s.replace(/v(\d+)/i, (m, n) => "v" + (+n + 1)) : s.slice(0, 70) + " v2";
}

/* ---------- misses by kind: previous run against the latest, drawn like the maturity and coverage radars ---------- */
const evRadarLabel = n => { const w = String(n).split(" "); if(n.length <= 11 || w.length < 2) return [n]; let best = 1, diff = 1e9;
  for(let i = 1; i < w.length; i++){ const a = w.slice(0, i).join(" ").length, b = w.slice(i).join(" ").length; if(Math.abs(a - b) < diff){ diff = Math.abs(a - b); best = i; } } return [w.slice(0, best).join(" "), w.slice(best).join(" ")]; };
let evSeq = 0;
function evRadar(cats, names){
  const hid = "ev-h" + (++evSeq), hatch = (id, c) => `<defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${c}" stroke-width="1.1"/></pattern></defs>`;
  const n = cats.length, W = 400, H = 300, cx = W / 2, cy = H / 2, R = 96, f = v => v.toFixed(1), rate = c => c.total ? Math.round(c.before / c.total * 100) : 0, rate2 = c => c.total ? Math.round(c.after / c.total * 100) : 0;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = (i, pct) => [cx + Math.cos(ang(i)) * R * pct / 100, cy + Math.sin(ang(i)) * R * pct / 100];
  const poly = vals => vals.map((v, i) => pt(i, v).map(f).join(",")).join(" ");
  const rings = [25, 50, 75, 100].map(p => `<polygon points="${poly(cats.map(() => p))}" fill="${p === 100 ? "var(--surface)" : "none"}" stroke="var(--line${p === 100 ? "-strong" : ""})"/>`).join("");
  const axes = cats.map((x, i) => { const [a, b] = pt(i, 100); return `<line x1="${cx}" y1="${cy}" x2="${f(a)}" y2="${f(b)}" stroke="var(--line)"/>`; }).join("");
  const was = `<polygon class="ev-r-prev" points="${poly(cats.map(rate))}" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="1.5 3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>`;
  const now = `${hatch(hid, "var(--ink)")}<polygon class="ev-r-now" points="${poly(cats.map(rate2))}" fill="url(#${hid})" stroke="var(--ink)" stroke-width="1.8" stroke-linejoin="round"/>`;
  const dots = cats.map((c, i) => { if(!c.after) return ""; const [a, b] = pt(i, rate2(c)); return `<circle cx="${f(a)}" cy="${f(b)}" r="3.5" fill="${c.after > c.before ? "var(--crit)" : "var(--ink)"}" stroke="var(--surface)" stroke-width="1.5"/>`; }).join("");
  const labels = cats.map((c, i) => { const [a, b] = pt(i, 120), cs = Math.cos(ang(i)), sn = Math.sin(ang(i)), ls = evRadarLabel(c.n), extra = ls.length - 1;
    const anchor = cs > .3 ? "start" : cs < -.3 ? "end" : "middle", dy0 = sn < -.6 ? `${-.2 - 1.1 * extra}em` : sn > .6 ? ".9em" : `${.35 - .55 * extra}em`;
    return `<text x="${f(a)}" y="${f(b)}" text-anchor="${anchor}" class="ma-rl ${c.after > c.before ? "crit" : c.after ? "" : "none"}">${ls.map((t, j) => `<tspan x="${f(a)}" dy="${j ? "1.1em" : dy0}">${esc(t)}</tspan>`).join("")}</text>`; }).join("");
  const aria = `Share of cases wrong by kind, ${names[0]} against ${names[1]}. ` + cats.map(c => `${c.n}: ${c.before} then ${c.after} of ${c.total} wrong`).join(". ") + ".";
  return `<svg class="ma-radar ev-radar" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">${rings}${axes}${was}${now}${dots}${labels}</svg>`;
}

/* ---------- since the last run: shown on the results from the second run on ---------- */
function evCompareHTML(){
  const P = ev.prev;
  if(!P || !P.preds) return "";
  const r = evCompare(ev, P.preds, ev.preds), pct = r.after.pct, pos = evPos(ev), n0 = P.name || "Previous run", n1 = (ev.last && ev.last.name) || ev.name || "Latest run", same = n0 === n1;
  const names = same ? ["Previous run", "Latest run"] : [n0, n1];
  const dl = v => v === null ? "" : `<span class="ev-delta ${v > 0 ? "up" : v < 0 ? "down" : ""}">${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(Math.round(v * 100))}</span>`;
  const kpi = (lbl, a, b, d) => `<div class="ev-kpi"><span class="eyebrow">${lbl}</span><b class="mono">${pct(a)} <span class="muted">→</span> ${pct(b)}</b>${dl(d)}</div>`;
  const flip = (x, i, kind) => `<article class="cp-gap"><span class="cv-gn mono">${i + 1}</span><div class="cp-gb">
    <span class="eyebrow"><span class="ev-flip ${kind}">${kind === "fixed" ? "Fixed" : "Broke"}</span> ${esc(evCat(x.c.cat)[1])} · ${esc(x.c.id)}</span>${ev.media && x.c.text === x.c.id ? "" : `<h4>“${esc(x.c.text)}”</h4>`}
    <p>Right answer <b>${esc(x.gold)}</b>. Was <b>${esc(x.was)}</b>, now <b>${esc(x.now)}</b>.${x.c.why ? ` Reviewer: ${esc(x.c.why)}` : ""}${ev.preds[x.c.id].why ? ` Classifier now: ${esc(ev.preds[x.c.id].why)}` : ""}</p></div></article>`;
  const sum = !r.fixed.length && !r.broke.length ? "No case flipped." : `${r.fixed.length} fixed, ${r.broke.length} broke.`;
  const chg = evLoopChanged(ev), key = ev.mode === "prompt" ? "sys" : "policy";
  return `<div class="ev-cmp">
    <div class="ev-cmp-top"><div><span class="eyebrow">${esc(names[0])} → ${esc(names[1])}</span><h4>${sum} ${pct(r.before.acc)} → ${pct(r.after.acc)} right.</h4>
        <p class="note">${r.n} ${ev.media ? "items" : "cases"} labeled in both runs, scored against the same right answers.${chg ? ` The ${key === "sys" ? "prompt" : "rule"} changed in between; the change is below.` : ""}</p></div>
      <div class="ev-cmp-kpis">${kpi("Right", r.before.acc, r.after.acc, r.delta.acc)}${kpi(`Precision on "${esc(pos)}"`, r.before.main ? r.before.main.pr : null, r.after.main ? r.after.main.pr : null, r.delta.pr)}${kpi(`Recall on "${esc(pos)}"`, r.before.main ? r.before.main.rc : null, r.after.main ? r.after.main.rc : null, r.delta.rc)}</div></div>
    ${r.fixed.length || r.broke.length ? `<div class="ev-cmp-flips"><h4>What flipped</h4><div class="cp-gaps">${r.fixed.map((x, i) => flip(x, i, "fixed")).join("")}${r.broke.map((x, i) => flip(x, r.fixed.length + i, "broke")).join("")}</div></div>` : ""}
    <div class="ev-cmp-grid">
      <div class="ev-cmp-radar"><h4>Wrong by kind, before and after</h4>${r.cats.length >= 3 ? `${evRadar(r.cats, names)}<div class="ma-legend"><span><i class="ma-lg-cur"></i>${esc(names[1])}</span><span><i class="ma-lg-old"></i>${esc(names[0])}</span><span><i class="ma-lg-gap"></i>Got worse</span></div><p class="note">The further out, the larger the share of that kind labeled wrong.</p>` : `<p class="note">Fewer than three kinds of case in both runs, so no chart; the table has the numbers.</p>`}</div>
      <div><h4>The numbers</h4><table class="ev-ct ev-cmp-t"><thead><tr><th>Kind</th><th>Cases</th><th>Before</th><th>After</th></tr></thead><tbody>${r.cats.map(c => `<tr class="${c.after > c.before ? "bad" : c.after < c.before ? "ok" : ""}"><td>${esc(c.n)}</td><td class="mono">${c.total}</td><td class="mono">${c.before}</td><td class="mono ev-arrow">${c.after}${c.after < c.before ? ' <span class="ev-delta up">▾</span>' : c.after > c.before ? ' <span class="ev-delta down">▴</span>' : ""}</td></tr>`).join("")}</tbody></table></div>
    </div>
    ${chg ? `<div class="ev-cmp-diff"><h4>What changed in the ${key === "sys" ? "prompt" : "rule"}</h4><div class="pol-diff"><div><span class="eyebrow">Before · ${esc(names[0])}</span><blockquote>${esc(P[key] || "")}</blockquote></div><div><span class="eyebrow">Now · ${esc(names[1])}</span><blockquote class="new">${esc(evLastOf(ev, key) || "")}</blockquote></div></div></div>` : ""}
  </div>`;
}
function evCompareMarkdown(d){
  const P = d.prev; if(!P || !P.preds || !d.preds) return [];
  const r = evCompare(d, P.preds, d.preds), pct = r.after.pct, n0 = P.name || "previous run", n1 = d.name || "latest run";
  const met = (l, a, b) => `- ${l}: ${pct(a)} → ${pct(b)}`;
  const lines = ["", `## Since the previous run (${n0} → ${n1})`, "", `${r.fixed.length} fixed, ${r.broke.length} broke, over ${r.n} cases labeled in both runs.`, "",
    met("Accuracy", r.before.acc, r.after.acc), met("Precision", r.before.main ? r.before.main.pr : null, r.after.main ? r.after.main.pr : null), met("Recall", r.before.main ? r.before.main.rc : null, r.after.main ? r.after.main.rc : null), "",
    "| Kind of case | Cases | Wrong before | Wrong after |", "|---|---|---|---|"].concat(r.cats.map(c => `| ${c.n} | ${c.total} | ${c.before} | ${c.after} |`));
  r.fixed.forEach(x => lines.push(`- Fixed [${evCat(x.c.cat)[1]}] ${x.was} → ${x.now}: "${x.c.text}"`));
  r.broke.forEach(x => lines.push(`- Broke [${evCat(x.c.cat)[1]}] ${x.was} → ${x.now}: "${x.c.text}"`));
  if(evLoopChanged(d)){ const k = d.mode === "prompt" ? "sys" : "policy"; lines.push("", `${k === "sys" ? "Prompt" : "Rule"} before:`, "", ...String(P[k] || "").trim().split(/\r?\n/).map(l => "> " + l), "", `${k === "sys" ? "Prompt" : "Rule"} now:`, "", ...String(evLastOf(d, k) || "").trim().split(/\r?\n/).map(l => "> " + l)); }
  return lines;
}

/* ---------- the loop box: change the rule and try again, under the results ---------- */
function evLoopHTML(){
  const ai = evAI(), mode = ev.mode, n = ev.cases.length, dr = ev.draft || {}, edited = ev.last && String(ev.last.policy || "") !== String(ev.policy || "");
  const since = `The results then show which cases flipped, and the scores before and after.`;
  const name = `<div class="field ev-loop-name"><label for="ev-loop-name">Name for the next run <span class="note">optional</span></label><input class="input" id="ev-loop-name" maxlength="80" value="${esc(dr.name || "")}" placeholder="${esc(evNextName(ev.last ? ev.last.name : ev.name))}"></div>`;
  let title = "Change the rule and try again", body;
  if(mode === "baseline") body = `<p class="note">The free model doesn't read your rule, so a new wording won't change its labels: it's a floor to measure a real classifier against. To test a change to the rule, get labels from your own classifier${ai ? " or from Claude" : ""} in step 2.</p>
      <div class="pol-run"><button type="button" class="btn" data-ev="topaste">Use my own classifier</button>${ai ? `<button type="button" class="btn" data-ev="toclaude">Run with Claude</button>` : STANDALONE ? `<a class="btn" href="${AI_CLAUDE_URL}" target="_blank" rel="noopener">Open in Claude</a>` : ""}<span class="note">Same ${n} cases, same right answers.</span></div>`;
  else if(mode === "paste") body = `<p class="note">Change the rule in step 1 or the prompt your classifier uses, run the same ${n} cases through it again, and paste the new labels in step 2. ${since}</p>
      <div class="pol-run"><button type="button" class="btn primary" data-ev="topaste">Paste the new labels</button><button type="button" class="btn" data-ev="csv">${icon("copy")}Copy the cases</button>${edited ? `<span class="note">The rule has changed since the last run.</span>` : ""}</div>`;
  else if(!ai) body = `<p class="note">Running the same cases through Claude again needs the Claude version. Here, change the rule in step 1, run the cases through your own classifier and paste its labels in step 2. ${since}</p>
      <div class="pol-run"><button type="button" class="btn primary" data-ev="topaste">Paste my classifier's labels</button>${STANDALONE ? `<a class="btn" href="${AI_CLAUDE_URL}" target="_blank" rel="noopener">Open in Claude</a>` : ""}</div>`;
  else { const key = mode === "prompt" ? "sys" : "policy"; title = mode === "prompt" ? "Change the prompt and try again" : "Change the rule and try again";
    body = `<p class="note">Same ${n} cases, same right answers, on your account. ${since}</p>
      <div class="field"><label for="ev-loop-${key}">${key === "sys" ? "Your system prompt" : "The rule"}</label><textarea class="input" id="ev-loop-${key}" rows="5" placeholder="${key === "sys" ? "You are a content moderation classifier…" : "Users must not harass, bully or intimidate other users…"}">${esc(ev[key])}</textarea><span class="note">The same ${key === "sys" ? "prompt as in step 2" : "rule as in step 1"}; edit it in either place.</span></div>
      ${name}${EVRUN.busy ? `<div class="ai-busy ev-busy"><span class="ai-spin" aria-hidden="true"></span><div><b id="ev-stage" aria-live="polite">${esc(EVRUN.phase)}…</b><span class="note">On your Claude account.</span></div><button type="button" class="btn sm" data-ev="stop">Stop</button></div>` : ""}${evErrHTML("loop")}
      <div class="pol-run"><button type="button" class="btn primary" data-ev="looprun" ${EVRUN.busy ? "disabled" : ""}>Run again with Claude</button></div>`; }
  return `<section class="card ev-loop" id="ev-loop" aria-labelledby="ev-loop-h"><div class="card-h"><h3 id="ev-loop-h">${title}</h3></div><div class="card-b">${body}</div></section>`;
}

/* ---------- images and video: a labeled list, never the media ---------- */
// A kind word from the list: the key, the name, or one of the words in the fourth field. Anything else is "other".
function evMKind(s){
  const k = String(s || "").trim().toLowerCase().replace(/\s+/g, " "); if(!k) return "other";
  const hit = EV_MCATS.find(c => c[0] === k || c[0] === k.replace(/[ -]/g, "_") || c[1].toLowerCase() === k || c[3].split(",").includes(k));
  return hit ? hit[0] : "other";
}
// One line per item: id, kind, expected, model label, optional note. Tabs or commas, a header row, CRLF and quotes all fine.
function evParseManifest(txt, L){
  const out = {items:[], bad:[], header:false}, seen = {};
  String(txt || "").replace(/^﻿/, "").split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim(); if(!line) return;
    const cols = (line.includes("\t") ? line.split("\t") : line.split(",")).map(s => s.trim().replace(/^"(.*)"$/, "$1").trim());
    if(!out.items.length && !out.bad.length && !out.header && cols.some(c => /^(id|item|kind|category|expected|gold|label|model_label|model|note)$/i.test(c))){ out.header = true; return; }
    const [id, kind, exp, lab, ...rest] = cols, e = (exp || "").toLowerCase(), l = (lab || "").toLowerCase(), no = i + 1;
    if(cols.length < 4) return out.bad.push({line:no, why:"needs four columns: id, kind, expected, model label"});
    if(!id) return out.bad.push({line:no, why:"no id"});
    if(!L.includes(e)) return out.bad.push({line:no, why:`expected label "${exp}" isn't one of ${L.join(", ")}`});
    if(!L.includes(l)) return out.bad.push({line:no, why:`model label "${lab}" isn't one of ${L.join(", ")}`});
    if(seen[id]) return out.bad.push({line:no, why:`duplicate id ${id}`});
    seen[id] = 1; out.items.push({id:id.slice(0, 80), cat:evMKind(kind), kind:String(kind || "").slice(0, 40), expect:e, label:l, note:rest.join(" ").trim().slice(0, 200)});
  });
  return out;
}
// The parsed list becomes the cases and the run; expected labels are the gold labels
function evMediaScore(txt){
  const L = evLabels(ev), p = evParseManifest(txt, L);
  if(!p.items.length){ ev.view = "media"; evErr(p.bad.length ? `Couldn't read any items. Line ${p.bad[0].line}: ${p.bad[0].why}.` : "Couldn't read any items. One per line: id, kind, expected, model label, separated by tabs or commas.", "media"); return renderEval(); }
  if(!ev.media){ ev.preds = null; ev.prev = null; ev.last = null; ev.runs = []; } // a text set was here: its runs don't compare with this one
  ev.media = true; ev.mode = "paste"; ev.content = ""; ev.ex = false; ev.n = p.items.length; EVRUN.err = "";
  ev.cases = p.items.map(x => ({id:x.id, text:x.note || x.id, expect:x.expect, cat:x.cat, why:x.cat === "other" && x.kind ? `Listed as "${x.kind}".` : ""}));
  ev.gold = {}; EVL.manifest = ""; EVL.bad = p.bad;
  evFinish(Object.fromEntries(p.items.map(x => [x.id, {label:x.label, why:""}])));
  renderEval(); evGoResults(p.bad.length ? `${p.items.length} items scored; ${p.bad.length} line${p.bad.length === 1 ? "" : "s"} skipped` : `${p.items.length} items scored`);
}
const EV_MTEMPLATE = ["id\tkind\texpected\tmodel_label\tnote", "img_0041\tnews\tallowed\tviolates\tprotest photo, crowd", "img_0042\tclear_violation\tviolates\tviolates\t", "vid_0107\tedited\tviolates\tallowed\tcropped copy of a known item", "img_0043\tlookalike\tallowed\tviolates\ttoy that resembles a weapon"].join("\n");
function evManifestFieldHTML(){
  const L = evLabels(ev);
  return `<div class="field"><label for="ev-manifest">The list: one line per item</label><p class="note">Columns: <span class="mono">id</span>, <span class="mono">kind</span>, <span class="mono">expected</span>, <span class="mono">model_label</span>, and an optional note. Tabs or commas; a header row is fine. Labels: ${L.map(l => `<span class="mono">${l}</span>`).join(", ")}. Expected is the right answer, what your reviewers decided; model label is what the classifier said.</p>
    <textarea class="input mono" id="ev-manifest" rows="8" placeholder="${esc(EV_MTEMPLATE).replace(/\n/g, "&#10;")}">${esc(EVL.manifest)}</textarea>
    ${EVL.bad.length ? `<p class="note" role="status">Last list: ${EVL.bad.length} line${EVL.bad.length === 1 ? "" : "s"} skipped. Line ${EVL.bad[0].line}: ${esc(EVL.bad[0].why)}.${EVL.bad.length > 1 ? ` Line ${EVL.bad[1].line}: ${esc(EVL.bad[1].why)}.` : ""}</p>` : ""}</div>`;
}
// Step 1 of the images-and-video page: the list box, the file picker, the options, and the guide. It stays the input for the next list too.
function evMediaHTML(step){
  const has = ev.media && ev.cases.length, stale = !ev.media && ev.cases.length;
  const tile = (attr, cur, k, n, h) => `<button type="button" role="radio" aria-checked="${cur === k}" class="card tr-tier ${cur === k ? "on" : ""}" data-${attr}="${k}"><b>${esc(n)}</b>${h ? `<span>${esc(h)}</span>` : ""}</button>`;
  const body = `<p class="note ev-mlead">Bring your own labeled set. <strong>Paste a list, not the media.</strong> The images and videos stay where they are: nothing here is uploaded, and the list stays in your browser.</p>
    ${evErrHTML("media")}${evManifestFieldHTML()}
    <div class="pol-run"><button type="button" class="btn primary" data-ev="mscore">${has ? "Score the next list" : "Score the list"}</button><label class="btn" for="ev-mfile">Open a file<input type="file" id="ev-mfile" class="visually-hidden" accept=".tsv,.csv,.txt,text/plain,text/csv,text/tab-separated-values"></label><button type="button" class="btn" data-ev="mtemplate">${icon("copy")}Copy a template</button><span class="note">${stale ? "Scoring a list replaces the text cases you have now." : has ? "Same ids, same right answers, and the results compare the two lists." : "A file is read in your browser; it isn't sent anywhere."}</span></div>
    <details class="ev-opts" id="ev-opts-d" data-evd="opts" ${EVU.opts ? "open" : ""}><summary>Options <span class="note">${esc((EV_LABELS[ev.labels] || EV_LABELS.binary).n.toLowerCase())}${ev.name ? " · " + esc(ev.name) : ""}</span></summary><div class="ev-opts-b">
      <div class="field"><label for="ev-name-in">Name for this run <span class="note">optional</span></label><input class="input" id="ev-name-in" value="${esc(ev.name)}" maxlength="80" placeholder="For example: Nudity model, v3"></div>
      <div class="field"><span class="lbl" id="ev-mlabels-l">Labels</span><div class="tr-tiers cp-two" role="radiogroup" aria-labelledby="ev-mlabels-l">${Object.entries(EV_LABELS).map(([k, v]) => tile("evlabels", ev.labels || "binary", k, v.n, v.h)).join("")}</div></div>
      <div class="field ev-opt-wide"><label for="ev-policy-in">The rule it enforces <span class="note">optional, goes in the report</span></label><textarea class="input" id="ev-policy-in" rows="3" placeholder="For example: No sexual content involving real people…">${esc(ev.policy)}</textarea></div>
    </div></details>
    <details class="ev-kinds"><summary>The kinds of item, and the words the list can use for them</summary><div class="cp-mapw"><table class="ev-ct ev-kinds-t"><thead><tr><th>Kind</th><th>What it covers</th><th>Also read as</th></tr></thead><tbody>${EV_MCATS.map(c => `<tr><td><span class="mono">${c[0]}</span><br>${esc(c[1])}</td><td class="note">${esc(c[2])}</td><td class="note">${esc(c[3].split(",").join(", "))}</td></tr>`).join("")}</tbody></table></div><p class="note">A kind the list names some other way lands in Other. Items there still count toward the scores.</p></details>`;
  return evStepHTML(step, 0, body) + `<details class="card ev-guide" id="ev-guide"><summary>How to build a test set from your own images and video</summary><div class="card-b">${evGuideHTML()}</div></details>`;
}

/* ---------- the guide: a test set from your own data ---------- */
const EV_GUIDE = [
  ["Sample from real decisions", "Pull items from your own queue decisions, not from a search for examples. Take a random sample for the overall numbers, then add items so each kind of case has at least 20; a kind with five items can't tell you much."],
  ["Label twice", "Two reviewers label every item without seeing each other's label. Resolve the disagreements together and write down the reason; those reasons are policy clarifications waiting to be made."],
  ["Hold some out", "Keep a held-out set that the people tuning the model never see. Tune on one set, report on the other. A test set that shaped the model stops measuring it."],
  ["Store references, not copies", "Where you can, keep ids, hashes or storage references and read the media from where it already lives. Fewer copies means fewer places to protect, and to delete when the time comes."],
  ["Follow your retention and privacy rules", "A test set is personal data too. Apply the same retention limits, access controls and deletion duties as the queue it came from, and keep it out of general-purpose storage and shared drives."],
  ["Look after the reviewers", "Labeling graphic material is moderation work. Keep sessions short, let reviewers blur or grayscale by default, make support available, and never make labeling a side task."],
  ["Never build a test set containing CSAM", "Never build a test set containing CSAM. Known-CSAM detection is tested through hash-matching providers and NCMEC's processes, not with a test set. Holding the material is illegal even for testing. If you find it in your data, stop, follow your legal reporting duty (in the US, a report to NCMEC's CyberTipline) and your escalation procedure."]
];
const evGuideHTML = () => `<ol class="pk-list ev-guide-l">${EV_GUIDE.map(([t, b], i) => `<li>${i === EV_GUIDE.length - 1 ? `<strong>${esc(t)}.</strong> ${esc(b.replace(/^Never build a test set containing CSAM\. /, ""))}` : `<b>${esc(t)}.</b> ${esc(b)}`}</li>`).join("")}</ol>`;
const evGuideMarkdown = () => ["## Building a test set from your own images and video", ""].concat(EV_GUIDE.map(([t, b]) => `- **${t}.** ${b}`));

/* ---------- actions and events ---------- */
function evAct2(a){
  switch(a){
    case "media": ev.view = "media"; evView = "page"; EVRUN.err = ""; if(!ev.labels) ev.labels = "binary"; evSave(); renderEval(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#ev-s1 h2"));
    case "mscore": { const t = $("#ev-manifest"); evReadSetup(); return evMediaScore((t && t.value) || EVL.manifest); }
    case "mtemplate": return copyText(EV_MTEMPLATE, $("#ev-toast"));
    case "looprun": { const dr = ev.draft || {}, t = $("#ev-loop-policy"), s = $("#ev-loop-sys");
      if(t && t.value !== undefined) ev.policy = String(t.value).slice(0, 4000); if(s && s.value !== undefined) ev.sys = String(s.value).slice(0, 8000);
      if(dr.name && dr.name.trim()) ev.name = dr.name.trim().slice(0, 80); ev.draft = null; ev.ex = false; evSave();
      if(ev.mode === "policy" && !ev.policy.trim()){ evErr("Paste the rule first.", "loop"); return renderEval(); }
      if(ev.mode === "prompt" && !ev.sys.trim()){ evErr("Paste your system prompt first.", "loop"); return renderEval(); }
      return evRunClassifier(); }
  }
}
document.addEventListener("input", e => { const t = e.target; if(!t || !evHere()) return;
  if(t.id === "ev-loop-name"){ ev.draft = Object.assign({}, ev.draft, {name:t.value}); evSave(); }
  else if(t.id === "ev-loop-policy"){ ev.policy = String(t.value).slice(0, 4000); ev.ex = false; evSave(); const o = $("#ev-policy-in"); if(o && o !== t) o.value = ev.policy; }
  else if(t.id === "ev-loop-sys"){ ev.sys = String(t.value).slice(0, 8000); evSave(); const o = $("#ev-sys-in"); if(o && o !== t) o.value = ev.sys; }
  else if(t.id === "ev-manifest") EVL.manifest = t.value; });
// A list opened from disk is read here, in the browser, and dropped into the box. Nothing is uploaded.
document.addEventListener("change", e => { const t = e.target; if(!t || t.id !== "ev-mfile" || !evHere()) return; const f = t.files && t.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = () => { EVL.manifest = String(r.result || "").slice(0, 2e6); const ta = $("#ev-manifest"); if(ta) ta.value = EVL.manifest; gsay(`Read ${f.name} in your browser: ${EVL.manifest.split(/\r?\n/).filter(l => l.trim()).length} lines. Nothing was uploaded.`); }; r.readAsText(f); t.value = ""; });
Object.assign(GT_MORE, {
  "hash matching":"Comparing a fingerprint of an image or video against a list of known items. How known CSAM and known terrorist content are detected; tested through the matching provider, not with a test set.",
  "held-out set":"Test cases the people tuning a model never see. The number you report comes from this set, so tuning can't inflate it."
});
