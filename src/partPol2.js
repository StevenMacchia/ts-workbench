/* ---------- policy stress-tester: page ---------- */
const POL_PARTS = [["Definition","Says exactly what counts, in plain words."],["Scope","Says where it applies: posts, messages, profiles, live."],["Examples","Shows one or two clear cases on each side of the line."],["Exceptions","Protects news, education, satire, counter-speech and art."],["Consequences","Says what happens: removal, warning, reach limits, suspension."],["Appeals","Tells people how to challenge a decision."]];
// The meter in the run bar: how much context Claude will have, and the single most useful thing to add
function polStrengthHTML(){
  const s = polStrength(), pct = Math.round(s.got/s.max*100);
  return `<div class="pol-rb-top"><span class="eyebrow">Context strength</span><span class="pill ${s.level[1]}">${s.level[0]}</span></div>
    <div class="pol-meter" role="meter" aria-valuemin="0" aria-valuemax="${s.max}" aria-valuenow="${s.got}" aria-label="Context strength"><i style="width:${pct}%;background:var(--${s.level[1]})"></i></div>
    ${s.missing.length ? `<button type="button" class="pol-add" data-goto="${s.missing[0].field}">+ ${s.level[0] === "Great" ? "Optional: " + esc(s.missing[0].tip.charAt(0).toLowerCase() + s.missing[0].tip.slice(1)) : esc(s.missing[0].tip)}</button>` : `<span class="note">Great context for a sharp, platform-specific review.</span>`}`;
}
function polInfoHTML(){
  const open = store.get("pol:info", false);
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
  const ai = !!SAMPLER && !polRun.aiOff, report = !!pol.heur && pol.view !== "setup";
  view.innerHTML = (report
    ? headCompact("Policy stress-tester", (pol.company ? esc(pol.company.trim()) + " · " : "") + (pol.result ? "Claude's review" : "Instant checks"),
        `<button type="button" class="btn sm" data-poledit="1">Edit inputs</button>
         <button type="button" class="btn sm" id="pol-save"><svg><use href="#i-save"/></svg><span>${wsSaveLabel("policy")}</span></button>
         <button type="button" class="btn sm" id="pol-copyrep">${icon("copy")}Copy report</button>
         ${DL ? `<button type="button" class="btn sm primary" id="pol-dl"><svg><use href="#i-download"/></svg>Download</button>` : ""}`)
    : head("Policy stress-tester", "Find where reviewers would disagree, what your rule forgets, and how it holds up against real edge cases on your platform.", "Build safely",
        `<span class="pill ${ai?"accent":""}" title="${ai?"Claude's review runs on your own Claude account, only when you click":"Open this page in Claude while signed in to unlock Claude's review"}"><span class="dot"></span>${ai?"Claude review available":"Instant checks only"}</span><button type="button" class="btn sm" id="pol-full">See an example</button>`))
    + (report ? polReportHTML(ai) : polSetupHTML(ai));
  polBind();
}

/* ---------- step one: set up the test, top to bottom, ending with the run button ---------- */
function polSetupHTML(ai){
  const chips = (list, key) => list.map(([k,n])=>`<button type="button" class="pol-chip" data-multi="${key}" data-v="${k}" aria-pressed="${pol[key].includes(k)}">${esc(n)}</button>`).join("");
  return `<div class="pol-setup">
    ${polInfoHTML()}
    <section class="card pol-card">
      <div class="pol-h"><span class="pol-num">1</span><div><label for="pol-rule">Your rule</label><span class="note">Required</span></div><span class="note mono pol-wc" id="pol-wc">${polWords(pol.rule)} words</span></div>
      <textarea id="pol-rule" rows="6" placeholder="Paste the rule exactly as users would see it. For example: “Harassment means repeatedly targeting someone with insults, threats or unwanted sexual comments…”">${esc(pol.rule)}</textarea>
      <p class="pol-tip">Include any definitions, examples and exceptions you already have. The more of the real rule you paste, the more precise the review.</p>
      <div class="pol-ex"><span class="note">Start from an example:</span>${POL_EXAMPLES.map(([n],i)=>`<button type="button" class="pol-chip" data-ex="${i}">${n}</button>`).join("")}</div>
    </section>

    <section class="card pol-card">
      <div class="pol-h"><span class="pol-num">2</span><div><label for="pol-company">Your platform</label><span class="note">Recommended</span></div></div>
      <div class="pol-co">
        <div class="field"><label for="pol-company">Company or product name</label>
          <div class="pol-co-row"><input class="input" id="pol-company" value="${esc(pol.company || "")}" placeholder="For example: Twitch, Depop or Discord" autocomplete="off" maxlength="80">
            ${ai ? `<button type="button" class="btn" id="pol-lookup" ${polRun.looking ? "disabled" : ""}>${polRun.looking ? "Looking it up…" : `${icon("search")}Look it up with Claude`}</button>` : ""}</div>
          <span class="note">${ai ? "Claude fills in the details below from what it already knows about the company. It can't browse the web, so check them." : "Optional. It's named in your report."}</span></div>
        <div id="pol-look" tabindex="-1">${polLookHTML()}</div>
      </div>
      <div class="pol-ctx">
        <div class="field"><label for="pol-type">Platform type</label><select class="select" id="pol-type">${PLATFORMS.map(p=>`<option value="${p.k}" ${p.k===pol.type?"selected":""}>${esc(p.n)}</option>`).join("")}</select></div>
        <div class="field"><label for="pol-youth">Can under-18s use it?</label><select class="select" id="pol-youth"><option value="">Not sure</option>${YOUTH.map(y=>`<option value="${y.k}" ${y.k===pol.youth?"selected":""}>${esc(y.n)}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label for="pol-product">Describe your product</label>
        <textarea id="pol-product" rows="${(pol.product || "").length > 160 ? 6 : 3}" placeholder="What people do on it, who uses it and anything unusual. For example: “A photo app for 18 to 25-year-olds with public profiles, DMs and group chats. ‘Rate me’ posts are popular.”">${esc(pol.product)}</textarea></div>
      <div class="field"><span class="lbl">Regions you operate in</span><div class="pol-regions" id="pol-regions">${chips(REGIONS.map(g=>[g.k,g.k.toUpperCase()]), "regions")}</div></div>
    </section>

    <section class="card pol-card">
      <div class="pol-h"><span class="pol-num">3</span><div><span class="pol-lbl">How it's enforced</span><span class="note">Optional</span></div></div>
      <div class="pol-two">
        <div class="field"><span class="lbl">Who finds violations</span><div class="pol-chips" id="pol-enforce">${chips(POL_ENF, "enforce")}</div></div>
        <div class="field"><span class="lbl">Actions reviewers can take</span><div class="pol-chips" id="pol-actions">${chips(POL_ACT, "actions")}</div></div>
      </div>
    </section>

    <section class="card pol-card">
      <div class="pol-h"><span class="pol-num">4</span><div><label for="pol-concerns">What worries you</label><span class="note">Recommended</span></div></div>
      <textarea id="pol-concerns" rows="4" placeholder="Gray areas, recent incidents or cases your team argues about. For example: “Rival fans' trash talk keeps getting reported as harassment. We're unsure about jokes about someone's appearance.”">${esc(pol.concerns)}</textarea>
      <p class="pol-tip">Claude turns these into edge cases, so describe real situations rather than categories.</p>
    </section>

    ${polRun.err ? `<p class="pol-err" role="alert">${esc(polRun.err)}</p>` : ""}
    <div class="card pol-runbar">
      <div class="pol-rb-meter" id="pol-strength">${polStrengthHTML()}</div>
      <div class="pol-rb-act">
        ${ai ? `<div class="segs" role="group" aria-label="Analysis depth"><button type="button" data-depth="default" aria-pressed="${pol.depth!=="deep"}">Standard</button><button type="button" data-depth="deep" aria-pressed="${pol.depth==="deep"}">Deep</button></div>` : ""}
        ${pol.heur ? `<button type="button" class="btn" data-polreport="1">Back to report</button>` : ""}
        <button type="button" class="btn primary" id="pol-run">${ai ? "Stress-test with Claude" : "Run instant checks"} ${icon("arrow")}</button>
      </div>
    </div>
    <p class="note pol-rb-note">${ai ? "Runs on your own Claude account, and Claude asks your permission the first time. Ctrl+Enter in any box runs it too." : "Instant checks run in your browser and nothing is sent anywhere. Open this page in Claude while signed in to add Claude's review."}</p>
  </div>`;
}

/* ---------- step two: the report, with findings in tabs ---------- */
const POL_TABS = [["cases","Edge cases"],["wording","Wording and gaps"],["rewrite","Suggested rewrite"],["team","For your team"],["laws","Laws"],["checks","Instant checks"]];
function polReportHTML(ai){
  const h = pol.heur, r = pol.result;
  const ctx = [labelOf(PLATFORMS, pol.type), pol.youth ? labelOf(YOUTH, pol.youth) : "", pol.regions.length ? pol.regions.map(k => k.toUpperCase()).join(", ") : ""].filter(Boolean);
  const count = k => !r ? 0 : k === "cases" ? r.edge_cases.length : k === "wording" ? r.vague_terms.length + r.gaps.length : k === "rewrite" ? (r.rewrite ? 1 : 0)
    : k === "team" ? r.reviewer_checklist.length + r.open_questions.length + r.enforcement_risks.length : k === "laws" ? r.legal.length : h.findings.length;
  const tabs = r ? POL_TABS.filter(([k]) => k === "checks" || count(k)) : [];
  const tab = tabs.some(([k]) => k === pol.rtab) ? pol.rtab : tabs.length ? tabs[0][0] : "checks";
  return `<div class="pol-report" aria-live="polite">
    <div class="card pol-sum">
      ${polRing(r ? r.score : h.score, 96)}
      <div><span class="eyebrow">${r ? "Claude's clarity score" : "Instant clarity score"}</span>
        <h2 class="pol-verdict">${r ? esc(r.summary) : h.score>=75 ? "Reasonably clear, with a few gaps" : h.score>=50 ? "Workable, but reviewers will disagree on some cases" : "Too vague to enforce consistently"}</h2>
        <p class="note">${h.words} words · instant score ${h.score}/100${r ? ` · Claude ${r.score}/100${pol.depth==="deep"?" · deep review":""}` : ""}</p>
        ${r && r.strengths.length ? `<div class="pol-strengths">${r.strengths.map(s=>`<span><svg><use href="#i-check"/></svg>${esc(s)}</span>`).join("")}</div>` : ""}
        <span class="toast" id="pol-toast" aria-live="polite"></span></div>
    </div>

    <div class="pol-tested">
      <div class="pol-tested-r"><span class="eyebrow">Rule tested</span><blockquote>${esc(pol.rule)}</blockquote></div>
      <div class="pol-tested-c"><span class="eyebrow">Context</span><p>${pol.company ? `<b>${esc(pol.company.trim())}</b> · ` : ""}${ctx.map(esc).join(" · ") || "None given"}</p>
        ${r && r.assumptions.length ? `<details class="pol-assume"><summary>Claude made ${r.assumptions.length} assumption${r.assumptions.length === 1 ? "" : "s"}</summary><ul>${r.assumptions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}
        <button type="button" class="pol-add" data-poledit="1">Edit the rule or context</button></div>
    </div>

    ${polRun.busy ? `<div class="card pol-sec pol-busy"><div class="pol-spin" aria-hidden="true"></div><div><b id="pol-stage">${POL_STAGES[polRun.stage]}…</b><p class="note">${pol.depth==="deep" ? "A deep review usually takes one to two minutes." : "Claude's review usually takes 20 to 60 seconds."} The instant checks are below while you wait.</p></div><button type="button" class="btn sm" id="pol-stop">Stop</button></div>` : ""}
    ${polRun.err ? `<div class="pol-err" role="alert">${esc(polRun.err)}${ai ? ` <button type="button" class="btn sm" id="pol-run">Try again</button>` : ""}</div>` : ""}
    ${!r && !polRun.busy && !polRun.err ? (ai ? `<div class="banner pol-more"><span><strong>These are the instant checks.</strong> Claude's review adds edge cases for your platform, a clearer rewrite, a reviewer checklist and relevant laws.</span><button type="button" class="btn sm primary" id="pol-run">Stress-test with Claude ${icon("arrow")}</button></div>`
      : `<p class="note pol-more-n">Open this page in Claude while signed in to add Claude's review: edge cases for your platform, a clearer rewrite and a reviewer checklist.</p>`) : ""}

    ${r ? `<div class="card pol-tabs" id="pol-tabs">
      <div class="card-h"><div class="segs" role="group" aria-label="Report sections">${tabs.map(([k, n]) => `<button type="button" data-poltab="${k}" aria-pressed="${tab === k}">${n} <span class="mono" style="opacity:.6">${k === "rewrite" ? "" : count(k)}</span></button>`).join("")}</div></div>
      <div class="card-b">${polTabHTML(tab)}</div></div>`
    : `<div class="card pol-sec"><h4>Instant checks <span class="note">A transparent rubric, run in your browser</span></h4>${polTabHTML("checks")}</div>`}
  </div>`;
}
function polTabHTML(tab){
  const h = pol.heur, r = pol.result;
  if(tab === "checks") return `<ul class="pol-find">${h.findings.map(([lv,t])=>`<li class="${lv}"><span>${lv==="ok"?"✓":lv==="info"?"i":"!"}</span>${esc(t)}</li>`).join("")}</ul>`;
  if(tab === "cases"){
    const counts = {all:r.edge_cases.length, allow:0, remove:0, escalate:0}; r.edge_cases.forEach(c => counts[c.decision]++);
    const cases = r.edge_cases.filter(c => pol.filter === "all" || c.decision === pol.filter);
    return `<div class="pol-sec-h"><p class="note">How a well-run team should decide each case, and why.</p>
        <div class="segs" role="group" aria-label="Filter edge cases">${["all","allow","remove","escalate"].map(k=>`<button type="button" data-filter="${k}" aria-pressed="${pol.filter===k}">${k==="all"?"All":DEC[k][0]} <span class="mono" style="opacity:.6">${counts[k]}</span></button>`).join("")}</div></div>
      <div class="pol-cases">${cases.length ? cases.map(c=>`<div class="pol-case"><span class="pill ${DEC[c.decision][1]}"><span class="dot"></span>${DEC[c.decision][0]}</span><div><b>${esc(c.case)}</b><p>${esc(c.reasoning)}</p></div></div>`).join("") : `<p class="note">No cases with this decision.</p>`}</div>`;
  }
  if(tab === "wording") return `${r.vague_terms.length ? `<h4 class="pol-sub">Words reviewers will read differently</h4><div class="pol-terms">${r.vague_terms.map(v=>`<div class="pol-term"><b>“${esc(v.term)}”</b><p>${esc(v.why||"")}</p>${v.suggest?`<p class="pol-sug"><span>Try:</span> ${esc(v.suggest)}</p>`:""}</div>`).join("")}</div>` : ""}
    ${r.gaps.length ? `<h4 class="pol-sub">What the rule forgets</h4><ul class="pol-gaps">${r.gaps.map(g=>`<li><b>${esc(g.gap)}</b><span>${esc(g.why||"")}</span></li>`).join("")}</ul>` : ""}`;
  if(tab === "rewrite") return `<div class="pol-diff"><div><span class="eyebrow">Your rule</span><blockquote>${esc(pol.rule)}</blockquote></div><div><span class="eyebrow">Rewrite</span><blockquote class="new">${esc(r.rewrite)}</blockquote></div></div>
    <div class="row" style="gap:8px;margin-top:14px"><button type="button" class="btn sm" id="pol-copy">${icon("copy")}Copy rewrite</button><button type="button" class="btn sm primary" id="pol-retest">Test the rewrite ${icon("arrow")}</button><span class="toast" id="pol-rwtoast" aria-live="polite"></span></div>`;
  if(tab === "team") return `${r.reviewer_checklist.length ? `<h4 class="pol-sub">Reviewer checklist <span class="note">Apply in order</span></h4><ol class="pol-check">${r.reviewer_checklist.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>` : ""}
    ${r.open_questions.length ? `<h4 class="pol-sub">Open questions for your team</h4><ul class="pol-qs">${r.open_questions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${r.enforcement_risks.length ? `<h4 class="pol-sub">Enforcement risks</h4><ul class="pol-risks">${r.enforcement_risks.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>` : ""}`;
  if(tab === "laws") return `<div class="pol-laws">${r.legal.map(l=>`<div class="lawbox"><span class="eyebrow"><svg><use href="#i-scale"/></svg>${esc(l.law)}</span><p>${esc(l.note||"")}</p></div>`).join("")}</div><p class="note" style="margin-top:10px">Generated by Claude as a starting point for your legal team, not legal advice.</p>`;
  return "";
}
function polBind(){
  const refreshMeter = () => { const m = $("#pol-strength"); if(m){ m.innerHTML = polStrengthHTML(); polBindMeter(); } const pp = $("#pol-prompt-pre"); if(pp) pp.textContent = polPrompt(); };
  const co = $("#pol-company");
  if(co){ co.addEventListener("input", () => { pol.company = co.value; savePol(); });
    co.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); polLookup(); } }); }
  const lk = $("#pol-lookup"); if(lk) lk.onclick = polLookup;
  const lu = $("#pol-lookundo"); if(lu) lu.onclick = polLookUndo;
  ["rule","product","concerns"].forEach(k => { const el = $("#pol-"+k); if(!el || !el.addEventListener) return;
    el.addEventListener("input", () => { pol[k] = el.value; savePol(); if(k==="rule"){ const wc = $("#pol-wc"); if(wc) wc.textContent = polWords(pol.rule) + " words"; } refreshMeter(); });
    el.addEventListener("keydown", e => { if((e.metaKey||e.ctrlKey) && e.key==="Enter"){ e.preventDefault(); if(!polRun.busy) polAnalyze(); } }); });
  const ty = $("#pol-type"); if(ty) ty.onchange = e => { pol.type = e.target.value; savePol(); refreshMeter(); };
  const yo = $("#pol-youth"); if(yo) yo.onchange = e => { pol.youth = e.target.value; savePol(); refreshMeter(); };
  $$("[data-multi]").forEach(b => b.onclick = () => { const k = b.dataset.multi, v = b.dataset.v; pol[k] = pol[k].includes(v) ? pol[k].filter(x=>x!==v) : pol[k].concat(v); savePol(); b.setAttribute("aria-pressed", pol[k].includes(v)); refreshMeter(); });
  $$("[data-ex]").forEach(b => b.onclick = () => { polReadForm(); pol.rule = POL_EXAMPLES[+b.dataset.ex][1]; pol.heur = null; pol.result = null; polRun.err = ""; savePol(); renderPolicy(); $("#pol-rule").focus(); });
  $$("[data-depth]").forEach(b => b.onclick = () => { polReadForm(); pol.depth = b.dataset.depth; savePol(); renderPolicy(); });
  $$("[data-filter]").forEach(b => b.onclick = () => { pol.filter = b.dataset.filter; savePol(); renderPolicy(); const t = document.querySelector(`[data-filter="${b.dataset.filter}"]`); if(t) t.focus(); });
  $$("[data-poltab]").forEach(b => b.onclick = () => { pol.rtab = b.dataset.poltab; savePol(); renderPolicy(); const t = document.querySelector(`[data-poltab="${b.dataset.poltab}"]`); if(t) t.focus(); });
  $$("[data-poledit]").forEach(b => b.onclick = () => { pol.view = "setup"; polRun.err = ""; savePol(); renderPolicy(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); });
  $$("[data-polreport]").forEach(b => b.onclick = () => { polReadForm(); pol.view = "report"; savePol(); renderPolicy(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); });
  const loadFull = () => { pol = Object.assign(POL_BLANK(), JSON.parse(JSON.stringify(POL_FULL_EXAMPLE)), {depth:pol.depth}); polRun.err = ""; store.set("ws:cur:policy", null); savePol(); renderPolicy(); gsay("Complete example loaded. Run the test at the bottom to see the full report."); };
  const full = $("#pol-full"); if(full) full.onclick = loadFull;
  const info = $("#pol-info"); if(info && info.addEventListener) info.addEventListener("toggle", () => store.set("pol:info", info.open));
  const run = $("#pol-run"); if(run) run.onclick = polAnalyze;
  const stop = $("#pol-stop"); if(stop) stop.onclick = () => { if(polRun.ctl) polRun.ctl.abort(); };
  const save = $("#pol-save"); if(save) save.onclick = () => { polReadForm(); const msg = wsSaveTool("policy", pol, "Policy: " + pol.rule.slice(0, 48) + (pol.rule.length>48?"…":"")); gsay(msg); const sp = save.querySelector("span"); if(sp) sp.textContent = "Save changes"; };
  const cr = $("#pol-copyrep"); if(cr) cr.onclick = () => copyText(polMarkdown(), $("#pol-toast"));
  const dl = $("#pol-dl"); if(dl) dl.onclick = () => { const md = polMarkdown(); offerFile("policy-stress-test.md", md, md, $("#pol-toast")); };
  const cp = $("#pol-copy"); if(cp) cp.onclick = () => copyText(pol.result.rewrite, $("#pol-rwtoast"));
  const rt = $("#pol-retest"); if(rt) rt.onclick = () => { pol.rule = pol.result.rewrite; savePol(); window.scrollTo(0,0); polAnalyze(); };
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
