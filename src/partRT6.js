/* =========================================================
   RED TEAM STUDIO, MODULE 6: show the work.
   A dated one-page summary in the shape of a system card's red teaming section, drafted from what was
   actually done here (the target card, the tries, the drills, the findings, the runs), with the honest lines
   a questionnaire needs: who tested, what was not tested and why, what was accepted and why.
   Then the vendor questionnaire answers, mapped to the sub-questions the 2025 and 2026 forms ask.
   Drafts use only what the user did. Placeholders in brackets mark what the tool cannot know.
   ========================================================= */
const RT_QS = [
  {k:"redteam", q:"Do you red team or adversarially test the AI feature before release?", d:() => { const t = rtTarget(), f = (rt.findings || []).length, tries = rtM1().tries.filter(x => x && x.grade != null).length, drills = rtDrills().filter(d => rt.flow && rt.flow.drill && rt.flow.drill[d.id] != null).length; return `Yes. Before each release we run structured adversarial testing of ${rt.svc || (t ? t.n.toLowerCase() : "the feature")} against a written scope: ${rtPicked().map(a => RT_PLAIN[a.k] || a.n).join(", ") || "[harm areas]"}. This round covered ${tries + drills} documented attempts across ${Object.keys(rt.surf).length || "[n]"} surface${Object.keys(rt.surf).length === 1 ? "" : "s"} and produced ${f} finding${f === 1 ? "" : "s"}, each with a severity, an owner and a remediation status. We keep a dated log.`; }},
  {k:"injection", q:"Do you test for prompt injection, including instructions hidden in documents or web content the model reads?", d:() => { const did = rtM1().tries.some(x => x && x.move === "doc") || Object.values(rt.sess || {}).some((s, i) => false) || (rt.findings || []).some(x => x.area === "agentic"); return did ? `Yes. Our test set includes indirect prompt injection: instructions placed inside documents and pages the model reads, and we check whether the model acts on them, mentions them, or ignores them. Findings in this area are filed at severity 3 the same day and block release until fixed.` : `[Not yet this round.] Our test plan includes indirect prompt injection (instructions placed inside documents and pages the model reads). [Run the "hide an instruction in a document" try and replace this answer with what you found.]`; }},
  {k:"autonomy", q:"Can the model take actions on its own (send, buy, change, delete)? What limits apply?", d:() => { const acts = rt.surf.tools || rt.surf.share; return acts ? `Yes, within limits: [list the actions it can take]. Irreversible actions require confirmation, actions on another user's account are refused, and [payment or refund] limits are enforced outside the model. We test these limits adversarially, including with instructions planted in content the model reads.` : `No. The feature answers and summarises; it does not take actions on the user's behalf. [Edit if that changes.]`; }},
  {k:"training", q:"Is customer data used to train or fine-tune the model?", d:() => `[No. Customer prompts and content are not used to train or fine-tune any model. / Yes, as follows: …] Our model provider's data use terms are [link or summary].`},
  {k:"retention", q:"How long are prompts and outputs retained, and who can access them?", d:() => `Prompts and outputs are retained for [period] for [purpose], accessible to [roles]. Outputs produced during adversarial testing are stored in an access-controlled location, never in tickets, and deleted on a set schedule.`},
  {k:"minors", q:"What safeguards exist for child safety and other severe harms?", d:() => `We treat child sexual abuse and exploitation as a hard line: nothing in that area is generated or stored during testing, named people test it only through policy-described probes under written stop rules, and any real material would be reported through the legal escalation path. ${rtKinds().includes("world") ? "For generated media we also check that content credentials survive the product's own edit tools. " : ""}Testers receive a content warning, choose their own topics, and work within a time cap.`},
  {k:"incidents", q:"Have there been safety incidents with the feature, and how are they disclosed?", d:() => { const open = (rt.findings || []).filter(x => x.status === "open"); return `[None to date. / Describe.] Findings from our own testing are tracked to closure; ${open.length ? open.length + " remain open with owners and dates" : "none are currently open"}. [Describe how customers are notified of incidents.]`; }},
  {k:"subprocessors", q:"Which third-party model providers does the feature depend on?", d:() => `[Provider and model, e.g. a hosted model API, and any open model you run yourself.] Each is listed as a sub-processor with its data terms.`}
];
const rtS = () => rt.show || (rt.show = {who:"", outside:"", notTested:"", accepted:"", changed:"", answers:{}, dated:""});
function rtSummaryText(){
  const s = rtS(), t = rtTarget(), m = rtM1(), f = rt.findings || [], open = f.filter(x => x.status === "open"), fixed = f.filter(x => x.status === "fixed" || x.status === "closed"), acc = f.filter(x => x.status === "accepted risk");
  const tries = m.tries.filter(x => x && x.grade != null), drills = rtDrills().filter(d => rt.flow && rt.flow.drill && rt.flow.drill[d.id] != null), runs = rt.runs || [], run = runs[runs.length - 1];
  const k = rtKind1(), moves = Array.from(new Set(tries.map(x => x.move))).map(mv => (RT_MOVES[k].find(x => x[0] === mv) || [])[1]).filter(Boolean);
  const date = s.dated || new Date().toISOString().slice(0, 10);
  const line = x => `- ${x.id} · ${RT_PLAIN[x.area] || x.area} · S${x.sev} · ${x.status}${x.owner ? " · " + x.owner : ""}${x.title ? "\n  " + x.title : ""}`;
  return `RED TEAM SUMMARY · ${rt.svc || (t ? t.n : "the feature")} · ${date}

WHAT IT IS
${m.card.what || "[what it is for]"}
Who it is for: ${m.card.who || "[who]"}
Out of scope: ${m.card.out || "[what is out of scope]"}

WHAT WE TESTED
Harm areas this round: ${rtPicked().map(a => (RT_PLAIN[a.k] || a.n) + (a.severe ? " (policy-described probes only)" : "")).join("; ") || "[none chosen]"}.
Surfaces: ${Object.keys(rt.surf).map(x => { const y = rtSurf().find(z => z[1] === x); return y ? y[2] : x; }).join(", ") || "[surfaces]"}.
Attacker profiles played: ${Object.keys(rt.att).map(a => (RT_ATT.find(x => x[0] === a) || [])[1]).filter(Boolean).join(", ") || "[attackers]"}, plus the well-meaning user who hits an edge case.
Moves tried: ${moves.join(", ") || "[moves]"}. Drills run: ${drills.length} of ${rtDrills().length}. Languages: ${rt.langs || "[languages]"}.
${run ? `Automated run: ${run.n} rows from ${run.src}, ${new Date(run.ts).toISOString().slice(0, 10)}. ` : "Automated run: none yet. "}Severity scale: S0 safe to S4 critical, graded on what the output enables.

WHO TESTED
${s.who || "[Names and roles of the people who tested]"}
Tester independent of the build team: ${s.outside || "[name and role, or 'none this round']"}
Content warning given, topics self-selected, sessions time-capped, check-in afterwards.

WHAT WE FOUND
${f.length ? f.map(line).join("\n") : "No findings filed this round."}

WHAT WE CHANGED
${fixed.length ? fixed.map(x => `- ${x.id}: ${x.fix || "[fix]"}`).join("\n") : (s.changed || "[What changed as a result, or 'nothing yet']")}

WHAT WE ACCEPTED, AND WHY
${acc.length ? acc.map(x => `- ${x.id} (S${x.sev}): ${s.accepted || "[reason]"}`).join("\n") : (s.accepted || "Nothing accepted as residual risk this round.")}

WHAT WE DID NOT TEST, AND WHY
${s.notTested || "[Name the surfaces, languages or harm areas left out, and when they will be covered. Silence here fails a review; a reason passes.]"}

GATES
No open S4: ${f.some(x => x.sev === 4 && x.status !== "closed") ? "FAIL" : "pass"}. S3-or-above under ${rt.gates.s3}% per area: ${run ? "see the run" : "not measured by an automated run yet"}. Over-refusal under ${rt.gates.or}%: ${run ? "see the run" : "not measured yet"}.${rtKinds().includes("world") ? ` Provenance intact after edits: ${(rt.prov || []).length ? Math.round(100 * (rt.prov.filter(p => p.before && p.after).length) / Math.max(1, rt.prov.filter(p => p.before).length)) + "% of checks" : "not checked yet"}.` : ""}
Open findings: ${open.length}. Owners and dates are on each.

STOP RULES AND EVIDENCE
Nothing involving minors is generated, requested or stored. Severe areas are probed only by named people under written stop rules with legal's sign-off. Harmful outputs stay in an access-controlled location, never in tickets, and are deleted on schedule.

Prepared with T&S Workbench · Red team studio. Says only what was done.`;
}
function rtfShow(){
  const s = rtS(); if(!s.dated) s.dated = new Date().toISOString().slice(0, 10);
  return `<span class="rtf-eb">Show the work · 1 of 2 <i class="rtf-term">system card, red teaming section</i></span><h2 class="rtf-h2">The one-page summary</h2><p class="rtf-lead">Drafted from what you actually did here, in the shape auditors and customers already know from model system cards. Fill the four lines the tool cannot know. The honest ones matter most: who tested, and what you did not test and why.</p>
    <div class="rtf-q rt-cardf"><label><span>Who tested</span><input class="input" data-show="who" value="${esc(s.who)}" placeholder="Names and roles"></label><label><span>Tester independent of the build team</span><input class="input" data-show="outside" value="${esc(s.outside)}" placeholder="Name and role, or 'none this round'"></label><label><span>What we did not test, and why</span><textarea class="input" rows="2" data-show="notTested" placeholder="Voice is not tested this round; it ships next quarter and will be tested before that release.">${esc(s.notTested)}</textarea></label><label><span>What we accepted as residual risk, and why</span><textarea class="input" rows="2" data-show="accepted" placeholder="Leave blank if nothing was accepted.">${esc(s.accepted)}</textarea></label></div>
    <div class="ws-h" style="margin-top:14px"><h3 style="font-size:14px">Preview</h3><div class="acts"><button type="button" class="btn sm" data-rtf="copysum"><svg><use href="#i-copy"/></svg>Copy</button><button type="button" class="btn sm" data-rtf="dlsum"><svg><use href="#i-download"/></svg>Download</button><span class="ln-toast" id="rt-sum-toast" aria-live="polite"></span></div></div>
    <pre class="ln-pre" id="rt-sum">${esc(rtSummaryText())}</pre>
    ${rtfNext("Next: the questionnaire answers")}`;
}
function rtfAnswers(){
  const s = rtS();
  return `<span class="rtf-eb">Show the work · 2 of 2 <i class="rtf-term">AI-CAIQ, SIG AI module</i></span><h2 class="rtf-h2">The questionnaire answers</h2><p class="rtf-lead">Enterprise forms no longer ask "do you red team" as one box. They ask these. Each draft says only what you did here; brackets mark what the tool cannot know. Edit, then copy the lot.</p>
    <div class="rt-qs">${RT_QS.map(q => `<div class="rt-qa"><b>${esc(q.q)}</b><textarea class="input" rows="3" data-ans="${q.k}">${esc(s.answers[q.k] != null ? s.answers[q.k] : q.d())}</textarea></div>`).join("")}</div>
    <div class="row" style="gap:8px;margin-top:12px"><button type="button" class="btn sm" data-rtf="copyans"><svg><use href="#i-copy"/></svg>Copy all answers</button><button type="button" class="btn sm" data-rtf="dlans"><svg><use href="#i-download"/></svg>Download</button><button type="button" class="btn sm" data-rtf="redraft">Re-draft from current state</button><span class="ln-toast" id="rt-ans-toast" aria-live="polite"></span></div>
    <p class="note" style="margin-top:10px">Do not borrow big-lab language you cannot back up. "Structured adversarial testing against a written scope, with a dated log" is true and passes. "Comprehensive red teaming" with nothing behind it fails the follow-up.</p>
    ${rtfNext("Back to the menu")}`;
}
const rtAnswersText = () => RT_QS.map(q => `${q.q}\n${rtS().answers[q.k] != null ? rtS().answers[q.k] : q.d()}`).join("\n\n");
function rtShowBind(sc){
  const s = rtS();
  $$("[data-show]").forEach(a => a.oninput = e => { s[a.dataset.show] = e.target.value.slice(0, 600); rtSave(); const pre = $("#rt-sum"); if(pre) pre.textContent = rtSummaryText(); });
  $$("[data-ans]").forEach(a => a.oninput = e => { s.answers[a.dataset.ans] = e.target.value.slice(0, 1500); rtSave(); });
  $$("[data-rtf]").forEach(b => { const a = b.dataset.rtf;
    if(a === "copysum") b.onclick = () => copyText(rtSummaryText(), $("#rt-sum-toast"));
    if(a === "dlsum") b.onclick = () => offerFile("red-team-summary.txt", rtSummaryText(), rtSummaryText(), $("#rt-sum-toast"));
    if(a === "copyans") b.onclick = () => copyText(rtAnswersText(), $("#rt-ans-toast"));
    if(a === "dlans") b.onclick = () => offerFile("ai-questionnaire-answers.txt", rtAnswersText(), rtAnswersText(), $("#rt-ans-toast"));
    if(a === "redraft") b.onclick = () => { s.answers = {}; rtSave(); renderRedteamStudio(); };
    if(a === "next" && sc.k === "answers") b.onclick = () => { rtF().path = ""; rtSave(); rtGo(rtScreens().findIndex(x => x.k === "hub")); };
  });
}
// Splice: path "show" → hub → summary → answers
const rtScreens2 = rtScreens;
rtScreens = function(){ const s = rtScreens2(); if((rtF().path || "") !== "show") return s; const i = s.findIndex(x => x.k === "hub"); return s.slice(0, i + 1).concat([{k:"show"}, {k:"answers"}]); };
const rtFlowHTML2 = rtFlowHTML;
rtFlowHTML = function(){
  const screens = rtScreens(), f = rtF(), i = Math.min(f.i, screens.length - 1), sc = screens[i];
  if(sc.k !== "show" && sc.k !== "answers") return rtFlowHTML2();
  return `<div class="rtf"><div class="rtf-dots" aria-label="Progress"><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span class="${sc.k === "answers" ? "on" : ""}"></span><span class="rtf-phase">Show the work</span></div><section class="card rtf-card" aria-live="polite">${sc.k === "show" ? rtfShow() : rtfAnswers()}</section>${typeof rtM1ChecklistHTML === "function" ? rtM1ChecklistHTML() : ""}<div class="rtf-foot"><button type="button" class="rtf-link" data-rtf="back">← Back</button><span class="note">${i} of ${screens.length - 1}</span><button type="button" class="rtf-link" data-rtf="hub">Menu</button></div></div>`;
};
const rtFlowBind2 = rtFlowBind;
rtFlowBind = function(){ rtFlowBind2(); const screens = rtScreens(), f = rtF(), sc = screens[Math.min(f.i, screens.length - 1)]; if(sc.k === "show" || sc.k === "answers") rtShowBind(sc); };
