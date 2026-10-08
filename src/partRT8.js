/* =========================================================
   RED TEAM STUDIO, MODULES 4 AND 5, AND THE METHOD NOTE.
   Module 5: the finding writer in the engineers' view gets the five-part shape and the expert write-ups.
   Module 4: every drill records which build it ran on (development or the exact production build); the verdict
   says so, because many real bugs live in the gap between them. The done card lists every artifact.
   The method note: where the practice comes from, so a reader can judge the tool and the person who built it.
   ========================================================= */
const RT_METHOD = [["The five-part finding", "system, actor, what they did, why it worked, what it could cause", "Microsoft AI Red Team, Lessons from red teaming 100 generative AI products, 2025"], ["The target card before testing", "what it is for, who it is for, what is out of scope", "DEF CON AI Village Generative Red Team, 2024"], ["Your call, then the expert's", "calibration against a reference on the same artifact", "how radiology, aviation and content moderation train judgment"], ["The 0 to 4 scale", "graded on what the output enables, not how it sounds", "severity practice across frontier-lab system cards"], ["Fair questions counted", "over-refusal measured beside attack success", "XSTest and OR-Bench, the over-refusal benchmarks"], ["Stop rules and the wellbeing floor", "no exception for minors; warning, self-selection, time cap, check-in", "Thorn and All Tech Is Human, Safety by Design; research on red-teamer wellbeing"], ["Two passes, dev and production", "the same tests on the exact build that ships", "OpenAI's multi-checkpoint testing, scaled down"], ["The one-page summary", "the red teaming section of a system card, written for a customer", "OpenAI and Google model system cards; AI-CAIQ and SIG AI questionnaires"]];
function rtfMethod(){
  return `<span class="rtf-eb">The method · 1 of 1</span><h2 class="rtf-h2">Where the practice comes from</h2><p class="rtf-lead">Nothing here is invented. Each part is a scaled-down version of what well-run red teams already do, chosen for a team of two to five with no budget. The full method, with sources, is in the guides.</p>
    <div class="rt-tw"><table class="rt-grid rt-sheet"><thead><tr><th>In the tool</th><th>What it is</th><th>Where it comes from</th></tr></thead><tbody>${RT_METHOD.map(r => `<tr><td class="k">${esc(r[0])}</td><td>${esc(r[1])}</td><td><span class="note">${esc(r[2])}</span></td></tr>`).join("")}</tbody></table></div>
    <p class="note" style="margin-top:10px">Read the method: <a href="#redteamllm">Red teaming LLMs</a>, <a href="#redteamworld">Red teaming world models</a>, <a href="#glossary">the glossary</a>. The sources, with every link checked, are in each guide's Sources tab.</p>
    ${rtfNext("Back to the menu")}`;
}
// Module 4: which build did the drill run on
const RT_BUILDS = [["dev", "A development build"], ["prod", "The exact build that ships"]];
const rtfDrill0 = rtfDrill;
rtfDrill = function(sc, i, screens){
  let h = rtfDrill0(sc, i, screens); const s = rt.sess[sc.id]; if(!s) return h;
  const seg = `<div class="rtf-q" style="margin-top:12px"><p>Which build did you run this on?</p><div class="rtf-chips sm">${RT_BUILDS.map(b => `<button type="button" data-build="${b[0]}" class="${s.build === b[0] ? "on" : ""}">${b[1]}</button>`).join("")}</div><p class="note" style="margin:8px 0 0">Many real bugs live in the gap between the two. Run the same drills on the exact build that ships before you call it done.</p></div>`;
  const at = h.indexOf('<div class="rtf-q"><p>What did it do?</p>'); return at < 0 ? h : h.slice(0, at) + seg + h.slice(at);
};
const rtfVerdict0 = rtfVerdict;
rtfVerdict = function(){
  let h = rtfVerdict0(); const ran = rtDrills().filter(d => rt.flow.drill[d.id] != null), onProd = ran.filter(d => rt.sess[d.id] && rt.sess[d.id].build === "prod").length;
  if(!ran.length) return h;
  const note = `<div class="learn ${onProd === ran.length ? "good" : "warn"}" style="margin-top:12px"><div class="learn-h"><svg><use href="#i-info"/></svg>${onProd === ran.length ? "Every drill ran on the build that ships" : `${onProd} of ${ran.length} drills ran on the build that ships`}</div><p>${onProd === ran.length ? "Good. The verdict is about the thing users will get." : "A verdict on a development build is a forecast, not a result. Rerun the drills on the exact production build, prompts and filters included, before you ship."}</p></div>`;
  const at = h.indexOf('<div class="rtf-act">'); return at < 0 ? h + note : h.slice(0, at) + note + h.slice(at);
};
// Module 5: the engineers' finding modal gets the five-part shape and the expert write-ups
const rtOpenFinding0 = rtOpenFinding;
rtOpenFinding = function(id, pre){
  rtOpenFinding0(id, pre);
  const bg = $("#ln-modal"), f = rt.findings || [], cur = id ? f.find(x => x.id === id) : null, form = $(".rt-form", bg); if(!bg || !form) return;
  const v = Object.assign({actor:"motivated", cause:""}, pre || {}, cur || {});
  const areaSel = $("#rf-area", bg), layerHint = () => { const a = areaSel ? areaSel.value : v.area; return RT_FIX[a] || ""; };
  const extra = document.createElement("div"); extra.className = "rt-form"; extra.style.marginTop = "10px";
  extra.innerHTML = `<label>Actor <small style="font-weight:400">(who was doing this)</small><div class="rtf-chips sm" id="rf-actors">${Object.entries(RT_ACTORS).map(([k, n]) => `<button type="button" data-rfactor="${k}" class="${v.actor === k ? "on" : ""}">${esc(n)}</button>`).join("")}</div></label>
    <label>What it could cause<textarea class="input" rows="2" id="rf-cause" placeholder="Who gets hurt, how, at what scale, how fast a real user would get here.">${esc(v.cause || "")}</textarea></label>
    <div class="rt-expert"><span class="eyebrow">Expert write-up for the fix</span><p id="rf-exfix">${esc(layerHint() || "Decide the fix with engineering and policy together.")}</p><div class="row" style="gap:8px;margin-top:6px"><button type="button" class="btn sm" id="rf-usefix">Use this as the fix</button></div></div>`;
  const sumLabel = $("#rf-sum", bg) && $("#rf-sum", bg).closest("label"); if(sumLabel) sumLabel.insertAdjacentElement("afterend", extra); else form.appendChild(extra);
  let actor = v.actor;
  $$("[data-rfactor]", extra).forEach(b => b.onclick = () => { actor = b.dataset.rfactor; $$("[data-rfactor]", extra).forEach(x => x.classList.toggle("on", x === b)); });
  if(areaSel) areaSel.addEventListener("change", () => { $("#rf-exfix", extra).textContent = layerHint() || "Decide the fix with engineering and policy together."; });
  $("#rf-usefix", extra).onclick = () => { const fx = $("#rf-fix", bg); if(fx && !fx.value.trim()) fx.value = layerHint(); };
  const ok = $("[data-ok]", bg), ok0 = ok && ok.onclick;
  if(ok) ok.onclick = () => { const cause = $("#rf-cause", bg).value.trim(); const before = f.length; ok0 && ok0(); const target = cur || rt.findings[rt.findings.length - 1]; if(target && (cur || rt.findings.length > before)){ target.actor = actor; target.cause = cause; target.five = true; rtSave(); } };
};
// The done card lists every artifact the person now has
const rtfDone0 = rtfDone;
rtfDone = function(){
  let h = rtfDone0(); const m = rtM1(), p = rt.plan || {}, s = rt.show || {}, f = (rt.findings || []).length;
  const arts = [[!!m.target && !!(m.card && m.card.what), "A target card: what it is for, who it is for, what is out of scope"], [m.tries && m.tries.some(t => t && t.grade != null), `${(m.tries || []).filter(t => t && t.grade != null).length} tries against your own feature, graded beside the rubric`], [f > 0, `${f} finding${f === 1 ? "" : "s"} in the five-part shape`], [!!p.scope, "A half-page scope, dated" + (p.dated ? " " + p.dated : "")], [!!(p.personas && p.personas.length), "Personas and a test sheet you can rerun on every release"], [Object.keys(p.ack || {}).length === RT_RULES.length, "The stop rules and the wellbeing floor, acknowledged"], [!!(s.who || s.notTested), "A one-page summary in system-card shape"], [!!(s.answers && Object.keys(s.answers).length) || !!(s.who), "Questionnaire answers that say only what you did"], [(rt.judge && rt.judge.hist && rt.judge.hist.length > 0), `${rt.judge && rt.judge.hist ? rt.judge.hist.length : 0} judgment calls checked against the expert's`]];
  const list = `<h3 class="rt-h">What you have now</h3><ul class="ln-check rt-arts">${arts.map(a => `<li><span class="rt-art ${a[0] ? "on" : ""}">${a[0] ? '<svg><use href="#i-check"/></svg>' : ""}</span><label>${esc(a[1])}</label></li>`).join("")}</ul>`;
  const at = h.indexOf('<div class="rtf-act rtf-wrap">'); return at < 0 ? h + list : h.slice(0, at) + list + h.slice(at);
};
// Hub: a method link, and the method card as a path
const rtScreens4 = rtScreens;
rtScreens = function(){ const s = rtScreens4(); if((rtF().path || "") !== "method") return s; const i = s.findIndex(x => x.k === "hub"); return s.slice(0, i + 1).concat([{k:"method"}]); };
const rtFlowHTML4 = rtFlowHTML;
rtFlowHTML = function(){
  const screens = rtScreens(), f = rtF(), i = Math.min(f.i, screens.length - 1), sc = screens[i];
  if(sc.k !== "method") return rtFlowHTML4();
  return `<div class="rtf"><div class="rtf-dots" aria-label="Progress"><span class="on"></span><span class="on"></span><span></span><span></span><span></span><span class="rtf-phase">The method</span></div><section class="card rtf-card" aria-live="polite">${rtfMethod()}</section><div class="rtf-foot"><button type="button" class="rtf-link" data-rtf="back">← Back</button><span class="note"></span><button type="button" class="rtf-link" data-rtf="hub">Menu</button></div></div>`;
};
const rtfHub0 = rtfHub;
rtfHub = function(){ return rtfHub0().replace(`Everything else is one link away in the`, `<button type="button" class="rtf-link" data-hub="method">Where the practice comes from</button>. Everything else is one link away in the`); };
const rtFlowBind4 = rtFlowBind;
rtFlowBind = function(){
  rtFlowBind4();
  const screens = rtScreens(), f = rtF(), sc = screens[Math.min(f.i, screens.length - 1)];
  $$("[data-build]").forEach(b => b.onclick = () => { const s = rt.sess[sc.id]; if(s){ s.build = b.dataset.build; rtSave(); renderRedteamStudio(); } });
  $$("[data-rtf]").forEach(b => { if(b.dataset.rtf === "next" && sc.k === "method") b.onclick = () => { f.path = ""; rtSave(); rtGo(rtScreens().findIndex(x => x.k === "hub")); }; });
};
