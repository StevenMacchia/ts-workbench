/* =========================================================
   YOUR PLAN: one prioritized list from every step of the assessment
   Launch blockers, coverage gaps, roadmap items and COPPA gaps, in three groups (do first, next, later),
   tickable where the tool tracks it, and sent to a tracker in one go.
   ========================================================= */
const PLAN_GROUPS = [["do", "Do first", "Launch blockers, exposed harm areas, this quarter's roadmap and critical COPPA and DSA gaps"], ["next", "Next", "Coverage gaps, next quarter's roadmap and the rest of the COPPA and DSA gaps"], ["later", "Later", "Roadmap items for after that"]];
const PLAN_KIND = {premortem:"Pre-mortem", coverage:"Coverage", maturity:"Maturity", coppa:"COPPA", dsa:"DSA"};
function planItems(){
  const out = [], J = typeof JOURNEY !== "undefined" ? JOURNEY : [];
  try{ ovSavedPMs().forEach(p => p.r.safeguards.filter(s => s.rank === 3).forEach(s => out.push({g:"do", kind:"premortem", text:s.t, ctx:`${p.name} · launch blocker`, tick:"pm:" + p.it.id + "|" + s.id, done:!!(p.it.data.done && p.it.data.done[s.id])}))); }catch(e){}
  try{ if(!cv.ex && !cv.est) cvActions(cv).forEach(x => out.push({g:x.row.status === "exposed" ? "do" : "next", kind:"coverage", text:x.text, ctx:`${x.row.a.n} · ${x.layer.n.toLowerCase()} · ${x.row.status === "exposed" ? "exposed" : "gap"}`, go:"coverage", done:false})); }catch(e){}
  try{ if(!ma.ex && maAllRated(ma)) maRoadmap(ma).forEach(s => s.acts.forEach((a, i) => { const id = s.id + "-" + i; out.push({g:s.phase === "now" ? "do" : s.phase === "next" ? "next" : "later", kind:"maturity", text:a, ctx:`${s.a.n} · level ${s.from} → ${s.to}`, tick:"ma:" + id, done:!!ma.done[id]}); })); }catch(e){}
  try{ if(J.some(s => s.k === "coppa") && cp.view === "report" && cp.aud && !cp.ex) cpScore(cp, cpCtx(cp), cpApplies(cp)).gaps.forEach(g => out.push({g:g.sev === "crit" ? "do" : "next", kind:"coppa", text:g.fix || g.t, ctx:`COPPA · ${g.cite}`, fix:g.k, done:false})); }catch(e){}
  try{ if(J.some(s => s.k === "dsa") && ds.view === "report" && ds.tier && !ds.ex) dsScore(ds, dsCtx(ds)).gaps.forEach(g => out.push({g:g.sev === "crit" ? "do" : "next", kind:"dsa", text:g.fix || g.t, ctx:`DSA · ${g.cite}`, fix:"ds:" + g.k, done:false})); }catch(e){}
  return out;
}
const planOpen = items => items.filter(x => !x.done);
const PL_SHOW = 8, plMore = {};
function planItemHTML(x, i){
  const color = TOOL_COLOR[x.kind] || "var(--accent)";
  return `<li class="nx-i pl-i ${x.done ? "done" : ""}">
    ${x.tick || x.fix ? `<input type="checkbox" class="nx-cb" ${x.tick ? `data-pltick="${esc(x.tick)}"` : `data-plfix="${esc(x.fix)}"`} ${x.done ? "checked" : ""} aria-label="Mark done: ${esc(x.text)}">` : `<span class="sb-glyph nx-g" style="background:${color}"><svg><use href="#i-${{premortem:"radar", coverage:"cover", maturity:"steps", coppa:"coppa", dsa:"dsa"}[x.kind]}"/></svg></span>`}
    <div class="nx-t"><b>${esc(x.text)}</b><small><span class="nx-k" style="color:color-mix(in oklab, ${color} 65%, var(--ink))">${esc(PLAN_KIND[x.kind])}</span><span>${esc(x.ctx)}</span></small></div>
    <a class="nx-open" href="#${x.go || {premortem:"premortem", maturity:"maturity", coppa:"coppa", dsa:"dsa"}[x.kind]}" aria-label="Open in ${esc(PLAN_KIND[x.kind])}">${icon("arrow")}</a></li>`;
}
function renderPlan(){
  if(typeof gdCur !== "undefined") gdCur = null;
  const items = planItems(), open = planOpen(items), J = typeof JOURNEY !== "undefined" ? JOURNEY : [], stepsDone = J.filter(s => s.k !== "act" && s.done()).length;
  const sent = !!store.get("tk:used", false), demo = typeof demoOn === "function" && demoOn();
  const by = g => items.filter(x => x.g === g).sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));
  const srcs = [...new Set(items.map(x => PLAN_KIND[x.kind]))];
  view.innerHTML = `<div class="gd cvr-page pl" style="--tc:var(--accent)">${asStepBar("act", open.length || items.length ? (sent ? 100 : 50) : 0, true)}<span class="toast" id="pl-toast" role="status" aria-live="polite"></span>
    <div class="pl-head">
      <span class="as-eb">${demo ? "Pixelry's plan" : "Your plan"}</span>
      <h1>${items.length ? `${open.length} thing${open.length === 1 ? "" : "s"} to do, from every step` : "Nothing to plan yet"}</h1>
      <p class="cvr-sum">${items.length ? `Pulled from ${srcs.join(", ").replace(/, ([^,]*)$/, " and $1")}: launch blockers first, then where risk outruns your defenses, then your roadmap. Tick things off here and each tool updates.${items.length - open.length ? ` ${items.length - open.length} already done.` : ""}` : `Finish a step and its work shows up here. ${stepsDone ? "" : "Start with your program's maturity or a pre-mortem."}`}</p>
      ${items.length ? `<div class="cvr-a"><button type="button" class="btn primary" data-plan="tracker">${icon("send")}Send ${open.length} to your tracker</button><button type="button" class="btn" data-pack="1">Leadership pack</button><button type="button" class="btn" data-plan="download">${icon("download")}Download</button></div>` : `<div class="cvr-a"><a class="btn primary" href="#overview">Back to your assessment ${icon("arrow")}</a></div>`}
    </div>
    ${PLAN_GROUPS.map(([g, n, d]) => { const xs = by(g); if(!xs.length) return ""; const open = xs.filter(x => !x.done), done = xs.filter(x => x.done), all = !!plMore[g], shown = all ? open : open.slice(0, PL_SHOW);
      return `<section class="pl-group" aria-labelledby="pl-${g}"><div class="as-sec-h"><h2 id="pl-${g}">${n} <span class="mono note">${open.length}</span></h2><span class="note">${d}</span></div>
        <div class="card nx-card"><ul class="nx-list">${shown.map(planItemHTML).join("")}${open.length > PL_SHOW ? `<li class="pl-more"><button type="button" class="ov-link" data-plmore="${g}">${all ? "Show fewer" : `Show all ${open.length}`}</button></li>` : ""}${done.length ? `<li class="pl-more"><button type="button" class="ov-link" data-pldone="${g}">${plMore[g + ":done"] ? "Hide" : "Show"} ${done.length} done</button></li>` : ""}${plMore[g + ":done"] ? done.map(planItemHTML).join("") : ""}</ul></div></section>`; }).join("")}
    ${items.length ? `<p class="note cvr-note">Coverage gaps are closed in the Coverage radar, so they have no box here. Everything else ticks off in its tool too.</p>` : ""}
  </div>`;
  view.querySelectorAll("[data-pltick]").forEach(c => c.onchange = () => { const msg = nxTick(c.dataset.pltick, c.checked); setTimeout(() => { renderPlan(); gsay(msg); }, 300); });
  view.querySelectorAll("[data-plfix]").forEach(c => c.onchange = () => { const f = c.dataset.plfix; if(f.startsWith("ds:")){ ds.ctrl = Object.assign({}, ds.ctrl, {[f.slice(3)]:c.checked}); ds.ex = false; dsSave(); } else { cp.ctrl = Object.assign({}, cp.ctrl, {[f]:c.checked}); cp.ex = false; cpSave(); } setTimeout(() => { renderPlan(); gsay(c.checked ? "Marked done" : "Marked not done"); }, 300); });
  view.querySelectorAll("[data-plmore],[data-pldone]").forEach(b => b.onclick = () => { const k = b.dataset.plmore || (b.dataset.pldone + ":done"); plMore[k] = !plMore[k]; const y = window.scrollY; renderPlan(); window.scrollTo(0, y); });
  view.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => { if(b.dataset.plan === "tracker") return tkOpen("plan"); const md = planMarkdown(); offerFile(`ts-plan-${new Date().toISOString().slice(0, 10)}.md`, md, md, $("#pl-toast")); });
}
function planMarkdown(){
  const items = planItems(), p = typeof wsProfile === "function" ? wsProfile() : null;
  const L = [`# Trust & Safety plan`, ``, `${p && p.org ? p.org + " · " : ""}${new Date().toISOString().slice(0, 10)}`, ``];
  PLAN_GROUPS.forEach(([g, n]) => { const xs = items.filter(x => x.g === g); if(!xs.length) return; L.push(`## ${n}`, ``); xs.forEach(x => L.push(`- [${x.done ? "x" : " "}] ${x.text} _(${PLAN_KIND[x.kind]}: ${x.ctx})_`)); L.push(``); });
  L.push(`---`, `Made with T&S Workbench. A self-assessment to guide planning, not an audit.`);
  return L.join("\n");
}
// Every open item as a tracker task, in one export
function tkFromPlan(){
  return planOpen(planItems()).map((x, i) => ({id:`plan-${i}`, title:x.text, group:PLAN_GROUPS.find(g => g[0] === x.g)[1], owner:"", pr:x.g === "do" ? 4 : x.g === "next" ? 3 : 2, done:false, def:true,
    labels:["trust-and-safety", x.kind], desc:[x.text, "", `${PLAN_KIND[x.kind]}: ${x.ctx}.`, "", "From the T&S Workbench plan."].join("\n")}));
}
