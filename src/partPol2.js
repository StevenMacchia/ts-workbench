/* ---------- policy stress-tester: page ---------- */
const POL_PARTS = [["Definition","Says exactly what counts, in plain words."],["Scope","Says where it applies: posts, messages, profiles, live."],["Examples","Shows one or two clear cases on each side of the line."],["Exceptions","Protects news, education, satire, counter-speech and art."],["Consequences","Says what happens: removal, warning, reach limits, suspension."],["Appeals","Tells people how to challenge a decision."]];
function polStrengthHTML(){
  const s = polStrength(), pct = Math.round(s.got/s.max*100);
  return `<div class="row" style="justify-content:space-between;gap:8px"><span class="eyebrow">Context strength</span><span class="pill ${s.level[1]}">${s.level[0]}</span></div>
    <div class="pol-meter" role="meter" aria-valuemin="0" aria-valuemax="${s.max}" aria-valuenow="${s.got}" aria-label="Context strength"><i style="width:${pct}%;background:var(--${s.level[1]})"></i></div>
    ${s.missing.length ? `<div class="pol-miss">${s.missing.slice(0,3).map(m=>`<button type="button" class="pol-add" data-goto="${m.field}">+ ${esc(m.tip)}</button>`).join("")}</div>` : `<p class="note">Great context. Claude has what it needs for a sharp, platform-specific review.</p>`}`;
}
function polInfoHTML(){
  const open = store.get("pol:info", true);
  return `<details class="card pol-info" id="pol-info" ${open?"open":""}>
    <summary><span class="sb-glyph" style="background:var(--t-pol)"><svg><use href="#i-info"/></svg></span><b>How this tool works</b><span class="note">Purpose, method, privacy and limits</span></summary>
    <div class="pol-info-b">
      <div class="pol-info-lead">
        <h3>Why this exists</h3>
        <p>Most enforcement problems start with the rule itself. When two reviewers read the same rule differently, users get inconsistent decisions, appeals pile up and trust erodes. This tool finds those weak spots before a rule goes live, and shows you how to fix them.</p>
      </div>
      <div class="pol-how">
        <div><span class="pol-step">1</span><h4>Instant checks</h4><p>A transparent rubric runs in your browser the moment you click: vague words, sweeping terms like “any” or “never”, and whether the rule has the six parts of a strong rule. Nothing is sent anywhere.</p></div>
        <div><span class="pol-step">2</span><h4>Claude's review</h4><p>Your rule and context go to Claude on your own Claude account. It returns a structured report: vague terms, gaps, eight edge cases for your platform, enforcement risks, relevant laws, a reviewer checklist and a rewrite.</p></div>
      </div>
      <h4 class="pol-sub">What makes a strong rule</h4>
      <div class="pol-parts">${POL_PARTS.map(([n,d])=>`<div><b>${n}</b><span>${d}</span></div>`).join("")}</div>
      <div class="pol-info-grid">
        <div><h4>How it was created</h4><p>Designed by Steven Macchia, Trust and Safety Leader, from common policy-writing practice in trust and safety teams. The AI review uses a structured prompt with your context, asks Claude for a fixed report format, and the page checks every answer before showing it. Built with AI-assisted development.</p></div>
        <div><h4>Privacy and cost</h4><p>Your rule stays in your browser unless you run Claude's review. That runs only when you click, on your own Claude account, and Claude asks your permission the first time. It's free to offer because each person uses their own account.</p></div>
        <div><h4>Limits</h4><p>Claude can be wrong, and legal notes are a starting point, not legal advice. Treat the output as a structured second opinion to discuss with your Policy, Legal and Operations teams.</p></div>
      </div>
      <details class="pol-prompt"><summary>See the exact prompt Claude receives</summary><pre id="pol-prompt-pre">${esc(polPrompt())}</pre></details>
    </div>
  </details>`;
}
function renderPolicy(){
  const h = pol.heur, r = pol.result, ai = !!SAMPLER && !polRun.aiOff;
  const chips = (list, key) => list.map(([k,n])=>`<button type="button" class="pol-chip" data-multi="${key}" data-v="${k}" aria-pressed="${pol[key].includes(k)}">${esc(n)}</button>`).join("");
  const counts = r ? {all:r.edge_cases.length, allow:0, remove:0, escalate:0} : null;
  if(r) r.edge_cases.forEach(c=>counts[c.decision]++);
  const cases = r ? r.edge_cases.filter(c => pol.filter==="all" || c.decision===pol.filter) : [];
  const runPanel = `
      <section class="card pol-run">
        <div id="pol-strength">${polStrengthHTML()}</div>
        ${ai ? `<div class="field"><span class="lbl">Depth</span><div class="segs" role="group" aria-label="Analysis depth"><button type="button" data-depth="default" aria-pressed="${pol.depth!=="deep"}">Standard</button><button type="button" data-depth="deep" aria-pressed="${pol.depth==="deep"}">Deep, slower</button></div></div>` : ""}
        <div class="pol-actions">
          ${polRun.busy ? `<button type="button" class="btn" id="pol-stop">Stop</button>` : `<button type="button" class="btn primary" id="pol-run">${ai?"Stress-test with Claude":"Run instant checks"} ${icon("arrow")}</button>`}
          <button type="button" class="btn sm" id="pol-full">See an example</button>
        </div>
        <p class="note">${ai?"Runs on your own Claude account. Claude asks your permission the first time. Tip: Ctrl+Enter runs the test.":"Instant checks run in your browser and nothing is sent anywhere. Open this page in Claude while signed in to add Claude's review."}</p>
        ${polRun.err ? `<p class="pol-err" role="alert">${esc(polRun.err)}</p>` : ""}
      </section>`;
  view.innerHTML = head("Policy stress-tester", "Find where reviewers would disagree, what your rule forgets, and how it holds up against real edge cases on your platform.", "Build safely",
    `<span class="pill ${ai?"accent":""}" title="${ai?"Claude's review runs on your own Claude account, only when you click":"Open this page in Claude while signed in to unlock Claude's review"}"><span class="dot"></span>${ai?"Claude review available":"Instant checks only"}</span>`) + `
  ${polInfoHTML()}
  <div class="pol">
    <div class="pol-in">
      <section class="card pol-card">
        <div class="pol-h"><span class="pol-num">1</span><div><label for="pol-rule">Your rule</label><span class="note">Required</span></div><span class="note mono pol-wc" id="pol-wc">${polWords(pol.rule)} words</span></div>
        <textarea id="pol-rule" rows="6" placeholder="Paste the rule exactly as users would see it. For example: “Harassment means repeatedly targeting someone with insults, threats or unwanted sexual comments…”">${esc(pol.rule)}</textarea>
        <p class="pol-tip">Include any definitions, examples and exceptions you already have. The more of the real rule you paste, the more precise the review.</p>
        <div class="pol-ex"><span class="note">Start from an example:</span>${POL_EXAMPLES.map(([n],i)=>`<button type="button" class="pol-chip" data-ex="${i}">${n}</button>`).join("")}</div>
      </section>

      <section class="card pol-card">
        <div class="pol-h"><span class="pol-num">2</span><div><label for="pol-product">Your platform</label><span class="note">Recommended</span></div></div>
        <div class="pol-co">
          <div class="field"><label for="pol-company">Company or product name</label>
            <div class="pol-co-row"><input class="input" id="pol-company" value="${esc(pol.company || "")}" placeholder="For example: Twitch, Depop or Discord" autocomplete="off" maxlength="80">
              ${SAMPLER && !polRun.aiOff ? `<button type="button" class="btn" id="pol-lookup" ${polRun.looking ? "disabled" : ""}>${polRun.looking ? "Looking it up…" : `${icon("search")}Look it up with Claude`}</button>` : ""}</div>
            <span class="note">${SAMPLER && !polRun.aiOff ? "Claude fills in the details below from what it already knows about the company. It can't browse the web, so check them." : "Optional. It's named in your report."}</span></div>
          <div id="pol-look" tabindex="-1">${polLookHTML()}</div>
        </div>
        <div class="pol-ctx">
          <div class="field"><label for="pol-type">Platform type</label><select class="select" id="pol-type">${PLATFORMS.map(p=>`<option value="${p.k}" ${p.k===pol.type?"selected":""}>${esc(p.n)}</option>`).join("")}</select></div>
          <div class="field"><label for="pol-youth">Can under-18s use it?</label><select class="select" id="pol-youth"><option value="">Not sure</option>${YOUTH.map(y=>`<option value="${y.k}" ${y.k===pol.youth?"selected":""}>${esc(y.n)}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label for="pol-product">Describe your product</label>
          <textarea id="pol-product" rows="${(pol.product || "").length > 160 ? 6 : 3}" placeholder="What people do on it, who uses it and anything unusual. For example: “A live-streaming app for gamers. Viewers chat in real time and many streamers are teenagers.”">${esc(pol.product)}</textarea></div>
        <div class="field"><span class="lbl">Regions you operate in</span><div class="pol-regions" id="pol-regions">${chips(REGIONS.map(g=>[g.k,g.k.toUpperCase()]), "regions")}</div></div>
        <div class="pol-compare"><div><span class="eyebrow">Thin</span><p>“A social app.”</p></div><div><span class="eyebrow">Strong</span><p>“A photo app for 18 to 25-year-olds with public profiles, DMs and group chats. Mostly US and UK users. Dating-style ‘rate me’ posts are popular.”</p></div></div>
      </section>

      <section class="card pol-card">
        <div class="pol-h"><span class="pol-num">3</span><div><span class="pol-lbl">How it's enforced</span><span class="note">Optional</span></div></div>
        <div class="field"><span class="lbl">Who finds violations</span><div class="pol-chips" id="pol-enforce">${chips(POL_ENF, "enforce")}</div></div>
        <div class="field"><span class="lbl">Actions reviewers can take</span><div class="pol-chips" id="pol-actions">${chips(POL_ACT, "actions")}</div></div>
      </section>

      <section class="card pol-card">
        <div class="pol-h"><span class="pol-num">4</span><div><label for="pol-concerns">What worries you</label><span class="note">Recommended</span></div></div>
        <textarea id="pol-concerns" rows="4" placeholder="Gray areas, recent incidents or cases your team argues about. For example: “Rival fans' trash talk keeps getting reported as harassment. We're unsure about jokes about someone's appearance.”">${esc(pol.concerns)}</textarea>
        <p class="pol-tip">Claude turns these into edge cases, so describe real situations rather than categories.</p>
      </section>

${h ? runPanel : ""}
    </div>

    <div class="pol-out ${!h ? "is-empty" : ""}" aria-live="polite">
      ${!h ? `<div class="card pol-empty">
          <div class="pol-empty-art">${OV_ART.pol}</div>
          <h3>Stress-test a rule before it goes live</h3>
          <p class="muted">Fill in the four parts on the left, or load a complete example to see a full report.</p>
          <ul class="pol-get"><li>A clarity score and instant checklist</li>${ai?`<li>Words reviewers will read differently, with fixes</li><li>Eight edge cases for your platform, with decisions</li><li>Relevant laws, open questions and a reviewer checklist</li><li>A clearer rewrite, side by side with yours</li>`:`<li>Claude's full review when opened in Claude while signed in</li>`}</ul>
</div>${runPanel}` : `
      <div class="card pol-sum">
        ${polRing(r ? r.score : h.score, 96)}
        <div><span class="eyebrow">${r ? "Claude's clarity score" : "Instant clarity score"}</span>
          <h3>${r ? esc(r.summary) : h.score>=75 ? "Reasonably clear, with a few gaps" : h.score>=50 ? "Workable, but reviewers will disagree on some cases" : "Too vague to enforce consistently"}</h3>
          <p class="note">${h.words} words · instant score ${h.score}/100${r ? ` · Claude ${r.score}/100${pol.depth==="deep"?" · deep review":""}` : ""}</p></div>
        <div class="pol-sumact">
          <button type="button" class="btn sm" id="pol-save"><svg><use href="#i-save"/></svg><span>${wsSaveLabel("policy")}</span></button>
          <button type="button" class="btn sm" id="pol-copyrep">${icon("copy")}Copy report</button>
          ${DL ? `<button type="button" class="btn sm" id="pol-dl"><svg><use href="#i-download"/></svg>Download</button>` : ""}
          <span class="toast" id="pol-toast" aria-live="polite"></span>
        </div>
      </div>
      ${r && r.strengths.length ? `<div class="pol-strengths">${r.strengths.map(s=>`<span><svg><use href="#i-check"/></svg>${esc(s)}</span>`).join("")}</div>` : ""}
      ${r ? `<details class="card pol-sec pol-fold"><summary><h4>Instant checks <span class="note">${h.score}/100 · rubric run in your browser</span></h4></summary>` : `<div class="card pol-sec"><h4>Instant checks</h4>`}
        <ul class="pol-find">${h.findings.map(([lv,t])=>`<li class="${lv}"><span>${lv==="ok"?"✓":lv==="info"?"i":"!"}</span>${esc(t)}</li>`).join("")}</ul>
      ${r ? `</details>` : `</div>`}
      ${polRun.busy ? `<div class="card pol-sec pol-busy"><div class="pol-spin" aria-hidden="true"></div><div><b id="pol-stage">${POL_STAGES[polRun.stage]}…</b><p class="note">${pol.depth==="deep" ? "A deep review usually takes one to two minutes." : "Claude's review usually takes 20 to 60 seconds."}</p></div></div>` : ""}
      ${r ? `
        ${r.vague_terms.length ? `<div class="card pol-sec"><h4>Words reviewers will read differently</h4><div class="pol-terms">${r.vague_terms.map(v=>`<div class="pol-term"><b>“${esc(v.term)}”</b><p>${esc(v.why||"")}</p>${v.suggest?`<p class="pol-sug"><span>Try:</span> ${esc(v.suggest)}</p>`:""}</div>`).join("")}</div></div>` : ""}
        ${r.gaps.length ? `<div class="card pol-sec"><h4>What the rule forgets</h4><ul class="pol-gaps">${r.gaps.map(g=>`<li><b>${esc(g.gap)}</b><span>${esc(g.why||"")}</span></li>`).join("")}</ul></div>` : ""}
        <div class="card pol-sec"><div class="pol-sec-h"><h4>Edge cases <span class="note">How a well-run team should decide</span></h4>
          <div class="segs" role="group" aria-label="Filter edge cases">${["all","allow","remove","escalate"].map(k=>`<button type="button" data-filter="${k}" aria-pressed="${pol.filter===k}">${k==="all"?"All":DEC[k][0]} <span class="mono" style="opacity:.6">${counts[k]}</span></button>`).join("")}</div></div>
          <div class="pol-cases">${cases.length ? cases.map(c=>`<div class="pol-case"><span class="pill ${DEC[c.decision][1]}"><span class="dot"></span>${DEC[c.decision][0]}</span><div><b>${esc(c.case)}</b><p>${esc(c.reasoning)}</p></div></div>`).join("") : `<p class="note">No cases with this decision.</p>`}</div></div>
        ${r.reviewer_checklist.length ? `<div class="card pol-sec"><h4>Reviewer checklist <span class="note">Apply in order</span></h4><ol class="pol-check">${r.reviewer_checklist.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>` : ""}
        ${r.enforcement_risks.length ? `<div class="card pol-sec"><h4>Enforcement risks</h4><ul class="pol-risks">${r.enforcement_risks.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${r.open_questions.length ? `<div class="card pol-sec"><h4>Open questions for your team</h4><ul class="pol-qs">${r.open_questions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${r.legal.length ? `<div class="card pol-sec"><h4>Laws that may bear on this rule</h4><div class="pol-laws">${r.legal.map(l=>`<div class="lawbox"><span class="eyebrow"><svg><use href="#i-scale"/></svg>${esc(l.law)}</span><p>${esc(l.note||"")}</p></div>`).join("")}</div><p class="note" style="margin-top:8px">Generated by Claude as a starting point for your legal team, not legal advice.</p></div>` : ""}
        ${r.assumptions.length ? `<div class="card pol-sec pol-assume"><h4>What Claude assumed</h4><ul>${r.assumptions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p class="note">Add this context on the left and run the test again for a sharper review.</p></div>` : ""}
        ${r.rewrite ? `<div class="card pol-sec pol-rw"><h4>Suggested rewrite</h4>
          <div class="pol-diff"><div><span class="eyebrow">Your rule</span><blockquote>${esc(pol.rule)}</blockquote></div><div><span class="eyebrow">Rewrite</span><blockquote class="new">${esc(r.rewrite)}</blockquote></div></div>
          <div class="row" style="gap:8px"><button type="button" class="btn sm" id="pol-copy">${icon("copy")}Copy rewrite</button><button type="button" class="btn sm primary" id="pol-retest">Test the rewrite ${icon("arrow")}</button><span class="toast" id="pol-rwtoast" aria-live="polite"></span></div></div>` : ""}
      ` : ""}`}
    </div>
  </div>`;
  polBind();
}
function polBind(){
  const refreshMeter = () => { const m = $("#pol-strength"); if(m){ m.innerHTML = polStrengthHTML(); polBindMeter(); } const pp = $("#pol-prompt-pre"); if(pp) pp.textContent = polPrompt(); };
  const co = $("#pol-company");
  if(co){ co.addEventListener("input", () => { pol.company = co.value; savePol(); });
    co.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); polLookup(); } }); }
  const lk = $("#pol-lookup"); if(lk) lk.onclick = polLookup;
  const lu = $("#pol-lookundo"); if(lu) lu.onclick = polLookUndo;
  ["rule","product","concerns"].forEach(k => { const el = $("#pol-"+k); if(!el) return;
    el.addEventListener("input", () => { pol[k] = el.value; savePol(); if(k==="rule"){ const wc = $("#pol-wc"); if(wc) wc.textContent = polWords(pol.rule) + " words"; } refreshMeter(); });
    el.addEventListener("keydown", e => { if((e.metaKey||e.ctrlKey) && e.key==="Enter"){ e.preventDefault(); if(!polRun.busy) polAnalyze(); } }); });
  $("#pol-type").onchange = e => { pol.type = e.target.value; savePol(); refreshMeter(); };
  $("#pol-youth").onchange = e => { pol.youth = e.target.value; savePol(); refreshMeter(); };
  $$("[data-multi]").forEach(b => b.onclick = () => { const k = b.dataset.multi, v = b.dataset.v; pol[k] = pol[k].includes(v) ? pol[k].filter(x=>x!==v) : pol[k].concat(v); savePol(); b.setAttribute("aria-pressed", pol[k].includes(v)); refreshMeter(); });
  $$("[data-ex]").forEach(b => b.onclick = () => { polReadForm(); pol.rule = POL_EXAMPLES[+b.dataset.ex][1]; pol.heur = null; pol.result = null; polRun.err = ""; savePol(); renderPolicy(); $("#pol-rule").focus(); });
  $$("[data-depth]").forEach(b => b.onclick = () => { polReadForm(); pol.depth = b.dataset.depth; savePol(); renderPolicy(); });
  $$("[data-filter]").forEach(b => b.onclick = () => { polReadForm(); pol.filter = b.dataset.filter; savePol(); renderPolicy(); });
  const loadFull = () => { pol = Object.assign(POL_BLANK(), JSON.parse(JSON.stringify(POL_FULL_EXAMPLE)), {depth:pol.depth}); polRun.err = ""; store.set("ws:cur:policy", null); savePol(); renderPolicy(); gsay("Complete example loaded. Run the test to see the full report."); };
  ["#pol-full","#pol-full2"].forEach(s => { const b = $(s); if(b) b.onclick = loadFull; });
  const info = $("#pol-info"); if(info) info.addEventListener("toggle", () => store.set("pol:info", info.open));
  const run = $("#pol-run"); if(run) run.onclick = polAnalyze;
  const stop = $("#pol-stop"); if(stop) stop.onclick = () => { if(polRun.ctl) polRun.ctl.abort(); };
  const save = $("#pol-save"); if(save) save.onclick = () => { polReadForm(); const msg = wsSaveTool("policy", pol, "Policy: " + pol.rule.slice(0, 48) + (pol.rule.length>48?"…":"")); flashIn($("#pol-toast"), msg); const sp = save.querySelector("span"); if(sp) sp.textContent = "Save changes"; };
  const cr = $("#pol-copyrep"); if(cr) cr.onclick = () => copyText(polMarkdown(), $("#pol-toast"));
  const dl = $("#pol-dl"); if(dl) dl.onclick = () => { const md = polMarkdown(); offerFile("policy-stress-test.md", md, md, $("#pol-toast")); };
  const cp = $("#pol-copy"); if(cp) cp.onclick = () => copyText(pol.result.rewrite, $("#pol-rwtoast"));
  const rt = $("#pol-retest"); if(rt) rt.onclick = () => { polReadForm(); pol.rule = pol.result.rewrite; savePol(); window.scrollTo(0,0); polAnalyze(); };
  polBindMeter();
}
function polBindMeter(){
  $$("[data-goto]").forEach(b => b.onclick = () => {
    const id = {rule:"pol-rule", product:"pol-product", youth:"pol-youth", regions:"pol-regions", enforce:"pol-enforce", actions:"pol-actions", concerns:"pol-concerns"}[b.dataset.goto];
    const el = document.getElementById(id); if(!el) return;
    el.scrollIntoView({behavior:"smooth", block:"center"});
    const f = el.matches && el.matches("textarea,select,input") ? el : el.querySelector("button"); if(f) setTimeout(()=>f.focus({preventScroll:true}), 250);
  });
}
