/* =========================================================
   TABLETOP, TEAM MODE: run a scenario live with your team on a shared screen.
   Roles, a timer per decision, discussion prompts, the team's call, notes and action items,
   then an after-action report you can download or send to your tracker.
   ========================================================= */
const TTF_ROLES = [
  ["lead", "Incident lead", "What severity is this, and who owns each workstream?"],
  ["comms", "Communications", "What do we tell users, partners and the press, and when?"],
  ["legal", "Legal", "Is there a reporting duty or a deadline, and what must we preserve?"],
  ["policy", "Policy", "Which rule applies, and is it clear enough for this case?"],
  ["ops", "Operations", "What do reviewers and engineers need right now?"],
  ["care", "Wellbeing", "Who is exposed to harmful content, and what support do they need?"]
];
const TTF_ASK = ["What do we know for certain, and what are we assuming?", "Who is being harmed right now, and how do we stop it?", "Who needs to know, inside the company and outside it?", "What do we do in the next hour, and who owns it?"];
let ttf = store.get("ttf", null);
const ttfSave = () => store.set("ttf", ttf);
const ttfSc = () => ttScenario(ttf.s, ttf.v);
const ttfRole = k => { const r = TTF_ROLES.find(x => x[0] === k); const who = ttf.roles[k] && ttf.roles[k].trim(); return r ? r[1] + (who ? ` (${who})` : "") : ""; };
const ttfMmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
function ttfNew(i, v){
  const prev = ttf && ttf.roles ? ttf.roles : {};
  ttf = {s:i, v, step:0, phase:"setup", reveal:0, picks:[], notes:[], actions:[], roles:Object.assign({}, prev), mins:5, left:300, running:false, at:0, scores:{safety:60, trust:60, reg:60, team:60}, recorded:false, started:Date.now()};
  ttfSave(); renderTabletop(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1"));
}
function ttfEnd(){ ttfStop(); ttf = null; store.set("ttf", null); document.body.classList.remove("tt-present"); renderTabletop(); window.scrollTo(0, 0); }

/* ---------- the timer: counts down per decision, survives re-renders ---------- */
let ttfTick = null;
const ttfLeft = () => ttf.running ? Math.max(0, ttf.left - (Date.now() - ttf.at) / 1000) : ttf.left;
function ttfPaint(){
  const el = document.getElementById("ttf-time"); if(!el || !ttf){ clearInterval(ttfTick); ttfTick = null; return; }
  const left = ttfLeft(); el.textContent = ttf.mins ? ttfMmss(left) : "No timer";
  const box = el.closest(".ttf-timer"); if(box){ box.classList.toggle("up", !!ttf.mins && left <= 0); box.classList.toggle("soon", !!ttf.mins && left > 0 && left <= 60); }
  if(ttf.running && left <= 0){ ttf.left = 0; ttf.running = false; ttfSave(); ttfTimerBtns(); gsay("Time's up. Show the options when the team is ready"); }
}
function ttfTimerBtns(){ const b = document.getElementById("ttf-go"); if(b) b.textContent = ttf.running ? "Pause" : ttfLeft() > 0 ? (ttf.left < ttf.mins * 60 ? "Resume" : "Start timer") : "Time's up"; if(b) b.disabled = !ttf.running && ttfLeft() <= 0; }
function ttfStart(){ if(!ttf.mins || ttfLeft() <= 0) return; ttf.running = true; ttf.at = Date.now(); ttfSave(); ttfTimerBtns(); clearInterval(ttfTick); ttfTick = setInterval(ttfPaint, 250); }
function ttfStop(){ if(ttf && ttf.running){ ttf.left = ttfLeft(); ttf.running = false; ttfSave(); } clearInterval(ttfTick); ttfTick = null; }
function ttfReset(){ ttfStop(); ttf.left = ttf.mins * 60; ttfSave(); ttfPaint(); ttfTimerBtns(); }

/* ---------- screens ---------- */
function ttfRender(){
  const sc = ttfSc(), n = sc.steps.length;
  const ctx = ttf.phase === "setup" ? "Team exercise · " + esc(sc.title) : ttf.phase === "debrief" ? esc(sc.title) + " · debrief" : `${esc(sc.title)} · decision ${ttf.step + 1} of ${n}`;
  const meta = `${ttf.phase === "inject" ? `<button type="button" class="btn sm" data-ttf-a="present">${document.body.classList.contains("tt-present") ? "Exit presenter view" : "Present"}</button>` : ""}<button type="button" class="btn sm" data-ttf-a="end">${ttf.phase === "debrief" ? "Close" : "End exercise"}</button>`;
  const pct = ttf.phase === "setup" ? 0 : ttf.phase === "debrief" ? 100 : Math.round(ttf.step / n * 100);
  view.innerHTML = (typeof asStepBar === "function" ? asStepBar("crisis", pct, false) : "") + headCompact("Incident Tabletop", ctx, meta) + (ttf.phase === "setup" ? ttfSetupHTML(sc) : ttf.phase === "debrief" ? ttfDebriefHTML(sc) : ttfInjectHTML(sc));
  if(ttf.phase === "inject"){ ttfPaint(); ttfTimerBtns(); if(ttf.running){ clearInterval(ttfTick); ttfTick = setInterval(ttfPaint, 250); } }
}
function ttfSetupHTML(sc){
  return `<div class="ttf-setup">
    <div class="card ttf-brief"><div class="scen-top">${sevPill(sc.severity)}<span class="note">${esc(sc.platform)} · ${sc.steps.length} decisions · about 30 to 45 minutes</span></div>
      <h2>${esc(sc.title)}</h2><p>${esc(sc.blurb)}</p></div>
    <section class="card ttf-sec"><h3>Who's in the room</h3><p class="note">Optional. Names appear next to each role's prompt, and action items can be assigned to them.</p>
      <div class="ttf-roles">${TTF_ROLES.map(([k, n, q]) => `<div class="field"><label for="ttf-r-${k}">${n}</label><input class="input" id="ttf-r-${k}" data-ttf-role="${k}" value="${esc(ttf.roles[k] || "")}" placeholder="Name" autocomplete="off"><small class="note">${esc(q)}</small></div>`).join("")}</div></section>
    <section class="card ttf-sec"><h3>Time for each decision</h3>
      <div class="segs" role="group" aria-label="Time for each decision">${[[3, "3 minutes"], [5, "5 minutes"], [10, "10 minutes"], [0, "No timer"]].map(([m, l]) => `<button type="button" data-ttf-mins="${m}" aria-pressed="${ttf.mins === m}">${l}</button>`).join("")}</div></section>
    <section class="card ttf-sec"><h3>How it runs</h3>
      <ol class="ttf-how"><li>Share your screen. <b>Present</b> gives everyone a large, distraction-free view.</li><li>Read each update aloud, then discuss with the prompts while the timer runs.</li><li>Show the options and pick the one the team would choose. You'll see what happens, the strongest call and the law behind it.</li><li>Note what the team decided and any actions, with an owner. The debrief turns them into an after-action report.</li></ol></section>
    <div class="row ttf-go"><button type="button" class="btn primary" data-ttf-a="begin">Start the exercise ${icon("arrow")}</button><button type="button" class="btn" data-ttf-a="end">Back to scenarios</button></div>
  </div>`;
}
function ttfInjectHTML(sc){
  const st = sc.steps[ttf.step], n = sc.steps.length, pick = ttf.picks[ttf.step], last = ttf.step + 1 >= n;
  const best = st.o.find(o => o.best), bi = st.o.indexOf(best);
  const acts = ttf.actions.filter(a => a.step === ttf.step);
  const outcome = ttf.reveal === 2 && pick !== undefined ? (() => { const o = st.o[pick];
    return `<div class="card ttf-out ${o.best ? "good" : "warn"}" id="ttf-out" tabindex="-1">
      <div class="learn-h"><svg><use href="#i-${o.best ? "check" : "info"}"/></svg>${o.best ? "The team made the strongest call" : "Not the strongest call"}</div>
      <p><b>What happened.</b> ${esc(o.r)}</p>
      ${o.best ? "" : `<div class="learn-sec better"><span class="eyebrow">The stronger call · option ${"ABC"[bi]}</span><p><strong>${esc(best.l)}</strong></p><p class="note">${esc(best.r)}</p></div>`}
      <div class="learn-sec"><span class="eyebrow">The principle</span><p>${esc(st.lesson)}</p></div>
      ${lawBox(st.law)}
    </div>
    <div class="card ttf-sec ttf-notes"><h3>Capture it</h3>
      <div class="field"><label for="ttf-note">What the team decided, and why</label><textarea id="ttf-note" rows="3" placeholder="For example: agreed to restrict the hashtag now and brief comms before the evening news cycle.">${esc(ttf.notes[ttf.step] || "")}</textarea></div>
      <div class="field"><span class="lbl">Action items</span>
        ${acts.length ? `<ul class="ttf-acts">${acts.map(a => `<li><span>${esc(a.t)}</span><span class="tag">${esc(ttfRole(a.role) || "Unassigned")}</span><button type="button" class="ttf-x" data-ttf-del="${ttf.actions.indexOf(a)}" aria-label="Remove action: ${esc(a.t)}">${icon("x")}</button></li>`).join("")}</ul>` : ""}
        <div class="ttf-add"><input class="input" id="ttf-act" placeholder="Add an action, for example: write a holding statement" autocomplete="off" aria-label="New action item"><select class="select" id="ttf-owner" aria-label="Owner"><option value="">Owner</option>${TTF_ROLES.map(([k]) => `<option value="${k}">${esc(ttfRole(k))}</option>`).join("")}</select><button type="button" class="btn" data-ttf-a="addact">Add</button></div></div>
    </div>
    <div class="row ttf-go"><button type="button" class="btn primary" data-ttf-a="next">${last ? "Go to the debrief" : "Next update"} ${icon("arrow")}</button></div>`; })() : "";
  return `<ol class="ttf-steps" aria-label="Decisions">${sc.steps.map((x, i) => `<li class="${i < ttf.step ? (sc.steps[i].o[ttf.picks[i]] && sc.steps[i].o[ttf.picks[i]].best ? "ok" : "miss") : i === ttf.step ? "now" : ""}"><span>${i + 1}</span>${esc(x.t)}</li>`).join("")}</ol>
  <div class="ttf-play">
    <div class="ttf-main">
      <div class="card ttf-stage"><div class="clock"><span class="t">${esc(st.t)}</span>${sevPill(sc.severity)}</div>
        <h2>${esc(st.h)}</h2><p class="ttf-sit">${esc(st.s)}</p></div>
      ${ttf.reveal === 0 ? `<div class="row ttf-go"><button type="button" class="btn primary" data-ttf-a="reveal">Show the options ${icon("arrow")}</button><span class="note">When the team has talked it through.</span></div>`
        : `<div class="card ttf-sec"><h3>${ttf.reveal === 1 ? "Which would the team choose?" : "The options"}</h3>
          <div class="opts" role="group" aria-label="The options">${st.o.map((o, i) => { const cls = ttf.reveal < 2 ? "" : i === pick ? (o.best ? "picked good" : "picked miss") : o.best ? "reveal" : "dim";
            return `<button type="button" class="opt ${cls}" data-ttf-pick="${i}" ${ttf.reveal === 2 ? "disabled" : ""}><span class="k">${"ABC"[i]}</span><span>${esc(o.l)}${cls === "reveal" ? `<span class="optnote">Strongest call</span>` : ""}</span></button>`; }).join("")}</div></div>`}
      ${outcome}
    </div>
    <aside class="ttf-side">
      <div class="card ttf-timer"><span class="eyebrow">Time for this decision</span><b id="ttf-time">${ttf.mins ? ttfMmss(ttfLeft()) : "No timer"}</b>
        ${ttf.mins ? `<div class="row"><button type="button" class="btn sm primary" id="ttf-go" data-ttf-a="timer">Start timer</button><button type="button" class="btn sm" data-ttf-a="plus">+1 min</button><button type="button" class="btn sm" data-ttf-a="reset">Reset</button></div>` : ""}</div>
      <div class="card ttf-ask"><span class="eyebrow">Discuss</span><ul>${TTF_ASK.map(q => `<li>${esc(q)}</li>`).join("")}</ul>
        <span class="eyebrow">By role</span><ul class="ttf-roleq">${TTF_ROLES.map(([k, nm, q]) => `<li><b>${esc(ttfRole(k))}</b>${esc(q)}</li>`).join("")}</ul></div>
    </aside>
  </div>`;
}
function ttfDebriefHTML(sc){
  const n = sc.steps.length, strong = sc.steps.filter((st, i) => st.o[ttf.picks[i]] && st.o[ttf.picks[i]].best).length;
  const v = strong === n ? ["Textbook incident command", "good"] : strong === n - 1 ? ["Strong instincts, one gap to close", "good"] : strong >= 2 ? ["Solid, with gaps to rehearse", "high"] : ["Worth running again", "crit"];
  if(!ttf.recorded){ const key = ttKey(ttf.s, ttf.v), prog = ttProgress(), prev = prog[key] || {}; prog[key] = {best:Math.max(prev.best || 0, strong), runs:(prev.runs || 0) + 1, last:Date.now(), team:true}; store.set("tt:progress", prog); ttf.recorded = true; ttfSave(); }
  const mins = Math.max(1, Math.round((Date.now() - ttf.started) / 60000));
  return `<div class="ttf-debrief">
    <div class="card verdict"><div class="row" style="gap:8px"><span class="pill ${v[1]}">${strong} of ${n} strongest calls</span><span class="pill">${ttf.actions.length} action item${ttf.actions.length === 1 ? "" : "s"}</span></div>
      <h3>${v[0]}</h3><p class="muted">${esc(sc.title)} · ${esc(sc.platform)}${Object.values(ttf.roles).some(x => x && x.trim()) ? " · " + TTF_ROLES.filter(([k]) => ttf.roles[k] && ttf.roles[k].trim()).map(([k]) => esc(ttfRole(k))).join(", ") : ""}.</p>
      <div class="meters ttf-meters">${DIMS.map(d => `<div class="meter"><div class="top"><span>${d.n}</span><span class="mono">${ttf.scores[d.k]}</span></div><div class="bar"><i style="width:${ttf.scores[d.k]}%;background:${scoreColor(ttf.scores[d.k])}"></i></div></div>`).join("")}</div>
      <div class="row ttf-go"><button type="button" class="btn primary" data-ttf-a="download"><svg><use href="#i-download"/></svg>After-action report</button><button type="button" class="btn" data-ttf-a="copy">${icon("copy")}Copy report</button>${ttf.actions.length ? `<button type="button" class="btn" data-ttf-a="tracker"><svg><use href="#i-send"/></svg>Send actions to tracker</button>` : ""}<button type="button" class="btn" data-ttf-a="save"><svg><use href="#i-save"/></svg>Save to workspace</button><span class="toast" id="ttf-toast" aria-live="polite"></span></div></div>
    ${ttf.actions.length ? `<section class="card ttf-sec"><h3>Action items</h3><ul class="ttf-acts">${ttf.actions.map(a => `<li><span>${esc(a.t)}</span><span class="tag">${esc(ttfRole(a.role) || "Unassigned")}</span><span class="note">Decision ${a.step + 1}</span></li>`).join("")}</ul></section>` : ""}
    <h3 class="dhead">Decision by decision</h3>
    <div class="debrief">${sc.steps.map((st, i) => { const f = st.o[ttf.picks[i]], b = st.o.find(o => o.best);
      return `<div class="card dcard"><div class="row"><span class="mono muted" style="font-size:12.5px">${esc(st.t)}</span><strong>${esc(st.h)}</strong>${f && f.best ? `<span class="pill good">Strong call</span>` : `<span class="pill high">Missed</span>`}</div>
        <p><span class="eyebrow">The team's choice</span><br>${esc(f ? f.l : "Not decided")}</p>
        ${f && f.best ? "" : `<p><span class="eyebrow">Stronger call</span><br>${esc(b.l)}</p>`}
        ${ttf.notes[i] ? `<p><span class="eyebrow">What the team said</span><br>${esc(ttf.notes[i])}</p>` : ""}
        <p class="muted"><strong style="color:var(--ink)">Lesson.</strong> ${esc(st.lesson)}</p></div>`; }).join("")}</div>
    <p class="note">Exercise length: about ${mins} minute${mins === 1 ? "" : "s"}. It counts toward crisis readiness on your report card.</p>
    ${typeof journeyNextHTML === "function" ? journeyNextHTML("crisis") : ""}
  </div>`;
}

/* ---------- after-action report and tracker tasks ---------- */
function ttfReport(){
  const sc = ttfSc(), L = [];
  L.push(`# After-action report: ${sc.title}`, "", `_${sc.platform} · team tabletop exercise · ${new Date().toLocaleDateString(undefined, {year:"numeric", month:"long", day:"numeric"})}_`, "");
  const who = TTF_ROLES.filter(([k]) => ttf.roles[k] && ttf.roles[k].trim()); if(who.length) L.push("**In the room:** " + who.map(([k]) => ttfRole(k)).join(", "), "");
  const strong = sc.steps.filter((st, i) => st.o[ttf.picks[i]] && st.o[ttf.picks[i]].best).length;
  L.push(`**Result:** ${strong} of ${sc.steps.length} strongest calls. ` + DIMS.map(d => `${d.n} ${ttf.scores[d.k]}`).join(" · "), "");
  if(ttf.actions.length) L.push("## Action items", "", "| Action | Owner | From decision |", "|---|---|---|", ...ttf.actions.map(a => `| ${a.t.replace(/\|/g, "/")} | ${ttfRole(a.role) || "Unassigned"} | ${a.step + 1} |`), "");
  L.push("## Decisions");
  sc.steps.forEach((st, i) => { const f = st.o[ttf.picks[i]], b = st.o.find(o => o.best);
    L.push("", `### ${i + 1}. ${st.t}: ${st.h}`, "", st.s, "", `- **Team's choice:** ${f ? f.l : "Not decided"}${f && f.best ? " (strongest call)" : ""}`);
    if(f && !f.best) L.push(`- **Stronger call:** ${b.l}`);
    if(f) L.push(`- **What happened:** ${f.r}`);
    if(ttf.notes[i]) L.push(`- **Team notes:** ${ttf.notes[i]}`);
    L.push(`- **Lesson:** ${st.lesson}`); if(st.law) L.push(`- **Law and standards:** ${st.law}`); });
  L.push("", "_Made with T&S Workbench. Law notes are a starting point, not legal advice._");
  return L.join("\n");
}
function tkFromTabletop(){
  const sc = ttfSc();
  return ttf.actions.map((a, i) => ({id:`tt-${ttf.s}-${i}`, title:a.t, group:`From the tabletop: ${sc.title}`, owner:ttfRole(a.role), due:"", pr:3, done:false, def:true,
    labels:["trust-and-safety", "tabletop", "incident-readiness"],
    desc:[a.t, "", `Action item from a team tabletop exercise, "${sc.title}", decision ${a.step + 1}: ${sc.steps[a.step].h}.`, ttf.notes[a.step] ? "Team notes: " + ttf.notes[a.step] : "", "", "From an after-action report made with T&S Workbench."].filter((x, j, arr) => x !== "" || arr[j - 1] !== "").join("\n")}));
}

/* ---------- actions: every button goes through here ---------- */
function ttfAct(a, arg){
  const sc = ttfSc(), st = sc.steps[ttf.step];
  switch(a){
    case "mins": ttf.mins = +arg; ttf.left = ttf.mins * 60; ttfSave(); return ttfRender();
    case "pick": if(ttf.reveal !== 1) return; ttf.picks[ttf.step] = +arg; ttf.reveal = 2; ttfStop();
      DIMS.forEach(x => ttf.scores[x.k] = clamp(ttf.scores[x.k] + (st.o[+arg].d[x.k] || 0))); ttfSave(); ttfRender();
      { const o = document.getElementById("ttf-out"); if(o){ if(o.scrollIntoView) o.scrollIntoView({block:"nearest"}); focusQuiet(o); } } return;
    case "del": ttf.actions.splice(+arg, 1); ttfSave(); ttfRender(); { const f = document.getElementById("ttf-act"); if(f) f.focus(); } return;
    case "begin": ttf.phase = "inject"; ttf.step = 0; ttf.reveal = 0; ttf.left = ttf.mins * 60; ttf.started = Date.now(); ttfSave(); ttfRender(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view .ttf-stage h2"));
    case "end": return ttfEnd();
    case "present": { const on = !document.body.classList.contains("tt-present"); document.body.classList.toggle("tt-present", on);
      try{ if(on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); else if(!on && document.fullscreenElement) document.exitFullscreen(); }catch(e){}
      return ttfRender(); }
    case "timer": return ttf.running ? (ttfStop(), ttfTimerBtns()) : ttfStart();
    case "plus": ttf.left = ttfLeft() + 60; if(ttf.running) ttf.at = Date.now(); ttfSave(); ttfPaint(); return ttfTimerBtns();
    case "reset": return ttfReset();
    case "reveal": ttf.reveal = 1; ttfSave(); ttfRender(); { const o = document.querySelector("#view [data-ttf-pick]"); if(o) o.focus(); } return;
    case "addact": { const box = document.getElementById("ttf-act"), who = document.getElementById("ttf-owner");
      const txt = ((arg && arg.t) || (box && box.value) || "").trim(); if(!txt){ if(box) box.focus(); return; }
      ttf.actions.push({t:txt.slice(0, 240), role:(arg && arg.role) || (who && who.value) || "", step:ttf.step}); ttfSave(); ttfRender();
      { const f = document.getElementById("ttf-act"); if(f) f.focus(); } return; }
    case "next": ttfStop();
      if(ttf.step + 1 >= sc.steps.length){ ttf.phase = "debrief"; document.body.classList.remove("tt-present"); }
      else { ttf.step++; ttf.reveal = 0; ttf.left = ttf.mins * 60; }
      ttfSave(); ttfRender(); window.scrollTo(0, 0); return focusQuiet(document.querySelector(ttf.phase === "debrief" ? "#view h1" : "#view .ttf-stage h2"));
    case "download": { const md = ttfReport(); return offerFile(`after-action-${slug(sc.title)}.md`, md, md, $("#ttf-toast")); }
    case "copy": return copyText(ttfReport(), $("#ttf-toast"));
    case "tracker": return tkOpen("tabletop");
    case "save": wsPut({id:wsNewId("TT"), kind:"tabletop", title:"Team exercise: " + sc.title, projectId:wsActive(), data:{s:ttf.s, v:ttf.v, step:sc.steps.length, scores:Object.assign({}, ttf.scores), picks:ttf.picks.slice(), first:ttf.picks.slice(), retried:[], answered:false, recorded:true, team:true}});
      return flashIn($("#ttf-toast"), savedWhere());
  }
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  if(!ttf) return;
  const b = e.target.closest && e.target.closest("[data-ttf-a],[data-ttf-mins],[data-ttf-pick],[data-ttf-del]"); if(!b || !view.contains(b)) return;
  const d = b.dataset;
  if(d.ttfMins !== undefined) return ttfAct("mins", d.ttfMins);
  if(d.ttfPick !== undefined) return ttfAct("pick", d.ttfPick);
  if(d.ttfDel !== undefined) return ttfAct("del", d.ttfDel);
  ttfAct(d.ttfA);
});
document.addEventListener("input", e => {
  if(!ttf) return; const t = e.target;
  if(t.dataset && t.dataset.ttfRole){ ttf.roles[t.dataset.ttfRole] = t.value.slice(0, 60); ttfSave(); }
  if(t.id === "ttf-note"){ ttf.notes[ttf.step] = t.value.slice(0, 2000); ttfSave(); }
});
document.addEventListener("keydown", e => {
  if(!ttf) return;
  if(e.key === "Enter" && e.target && e.target.id === "ttf-act"){ e.preventDefault(); ttfAct("addact"); }
  if(e.key === "Escape" && document.body.classList.contains("tt-present")){ document.body.classList.remove("tt-present"); ttfRender(); }
});
document.addEventListener("fullscreenchange", () => { if(!document.fullscreenElement && ttf && document.body.classList.contains("tt-present")){ document.body.classList.remove("tt-present"); ttfRender(); } });
if(window.addEventListener) window.addEventListener("hashchange", () => { if((location.hash || "").slice(1) !== "tabletop"){ ttfStop(); document.body.classList.remove("tt-present"); } });
