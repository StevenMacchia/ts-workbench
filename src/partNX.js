/* =========================================================
   YOUR NEXT MOVES: the few things worth doing this week, pulled from every tool
   Roadmap items by due date, each product's next launch blocker, the biggest coverage gap,
   and a nudge when a snapshot or a rehearsal is overdue. Most can be ticked off right here.
   ========================================================= */
const NX_DAY = 86400000;
const nxToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const nxDays = iso => Math.round((new Date(iso + "T00:00:00").getTime() - nxToday()) / NX_DAY);
function nxDueText(iso){
  if(!iso) return "";
  const n = nxDays(iso);
  if(n < 0) return `Overdue by ${-n} day${n === -1 ? "" : "s"}`;
  if(n === 0) return "Due today";
  if(n === 1) return "Due tomorrow";
  if(n < 7) return `Due in ${n} days`;
  return "Due " + new Date(iso + "T12:00:00").toLocaleDateString(undefined, {month:"short", day:"numeric"});
}
const nxAgo = t => { const d = Math.floor((Date.now() - t) / NX_DAY); return d < 14 ? `${d} days ago` : d < 60 ? `${Math.round(d / 7)} weeks ago` : `${Math.round(d / 30)} months ago`; };

function nxItems(){
  const out = [];
  // Maturity roadmap: the next unticked item in each open step. Overdue and due-soon first, then the "now" phase
  if(typeof maAllRated === "function" && !ma.ex && maAllRated(ma)){
    maRoadmap(ma).filter(s => !s.done).forEach(s => {
      const i = s.acts.findIndex((a, j) => !ma.done[`${s.id}-${j}`]); if(i < 0) return;
      const due = ma.due && ma.due[s.id], n = due ? nxDays(due) : null;
      if(s.phase !== "now" && !(n !== null && n <= 14)) return;
      out.push({kind:"maturity", tick:"ma:" + s.id + "-" + i, text:s.acts[i], ctx:`${s.a.n} · level ${s.from} → ${s.to}`, due, late:n !== null && n < 0,
        pri:n !== null && n < 0 ? 0 : n !== null && n <= 7 ? 1 : 2.2 + s.gi * 0.01});
    });
  }
  // Each saved product's next launch blocker, most recently worked on first; the same blocker is never listed twice
  const usedSg = new Set();
  Object.values(wsItems()).filter(it => it.kind === "premortem" && it.data).sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 2).forEach((it, k) => {
    try{
      const s = assess(openRecord(it.data)).safeguards.find(g => g.rank === 3 && !usedSg.has(g.id) && !(it.data.done && it.data.done[g.id])); if(!s) return; usedSg.add(s.id);
      out.push({kind:"premortem", tick:"pm:" + it.id + "|" + s.id, text:s.t, ctx:`${it.title || "Untitled assessment"} · launch blocker`, pri:2 + k * 0.1});
    }catch(e){}
  });
  // The biggest coverage gap, once coverage is confirmed
  if(typeof cvActions === "function" && !cv.ex && !cv.est){
    const a = cvActions(cv, 1)[0];
    if(a) out.push({kind:"coverage", go:"coverage", text:a.text, ctx:`${a.row.a.n} · ${a.row.status === "exposed" ? "exposed: high risk, thin coverage" : "coverage gap"}`, pri:a.row.status === "exposed" ? 2.05 : 3});
  }
  // One nudge at a time: a quarterly maturity snapshot, then a monthly rehearsal
  if(typeof maAllRated === "function" && !ma.ex && maAllRated(ma)){
    const last = Math.max(0, ...(ma.hist || []).map(h => h.t));
    if(!last || Date.now() - last > 90 * NX_DAY) out.push({kind:"maturity", snap:1, text:last ? "Take this quarter's maturity snapshot" : "Save a maturity snapshot as your starting point",
      ctx:last ? `Last one ${nxAgo(last)}. Snapshots are how you show progress to leadership` : "Snapshots are how you show progress to leadership", pri:4});
  }
  // Rehearse the crisis behind your biggest remaining risk, if you haven't yet
  if(typeof loopSource === "function"){ const src = loopSource(), type = ttCompanyType(), x = src && loopScenarios(src.r, type, 1, LOOP_PM_TT[src.p.type])[0];
    if(x && !ttProgress()[ttKey(x.i, type)]) out.push({kind:"tabletop", loop:x.i, text:`Rehearse “${x.sc.title}”`, ctx:`Your biggest remaining risk: ${x.cat.n.toLowerCase()} · about 8 minutes`, pri:3.5}); }
  const runs = Object.values(typeof ttProgress === "function" ? ttProgress() : {}), lastRun = Math.max(0, ...runs.map(p => p.last || 0));
  if(!out.some(x => x.snap || x.loop !== undefined) && runs.length && lastRun && Date.now() - lastRun > 30 * NX_DAY)
    out.push({kind:"tabletop", go:"tabletop", text:"Rehearse another crisis", ctx:`Your last tabletop was ${nxAgo(lastRun)}. About eight minutes`, pri:4});
  // Keep the list short and varied: at most three roadmap items and two launch blockers
  // The nudge always keeps its slot, since it is what brings the record up to date
  const cap = {maturity:3, premortem:2, coverage:1, tabletop:1}, seen = {}, nudge = out.find(x => x.pri >= 4);
  const main = out.filter(x => x.pri < 4).sort((a, b) => a.pri - b.pri).filter(x => { seen[x.kind] = (seen[x.kind] || 0) + 1; return seen[x.kind] <= cap[x.kind]; });
  return main.slice(0, nudge ? 4 : 5).concat(nudge ? [nudge] : []);
}
// Shown once there's something of the person's own to act on
const nxActive = () => (typeof maAllRated === "function" && !ma.ex && maAllRated(ma)) || Object.values(wsItems()).some(it => it.kind === "premortem") || (!cv.ex && !cv.est && cvSummary(cv).rated === cvSummary(cv).total);
function nxHTML(){
  if(!nxActive()) return "";
  const xs = nxItems(), color = k => TOOL_COLOR[k] || "var(--accent)", ic = {maturity:"steps", premortem:"radar", coverage:"cover", tabletop:"siren"};
  return `<section class="rise nx" aria-labelledby="nx-h">
    <div class="ov-sec-h"><h3 id="nx-h">Your next moves</h3><span class="note">From your roadmap, launch plans and coverage</span></div>
    <div class="card nx-card">${xs.length ? `<ul class="nx-list">${xs.map(x => `<li class="nx-i ${x.late ? "late" : ""}">
        ${x.tick ? `<input type="checkbox" class="nx-cb" data-nxtick="${esc(x.tick)}" aria-label="Mark done: ${esc(x.text)}">` : `<span class="sb-glyph nx-g" style="background:${color(x.kind)}"><svg><use href="#i-${ic[x.kind]}"/></svg></span>`}
        <div class="nx-t"><b>${esc(x.text)}</b><small><span class="nx-k" style="color:color-mix(in oklab, ${color(x.kind)} 65%, var(--ink))">${esc(x.ctx)}</span>${x.due ? `<span class="nx-due ${x.late ? "late" : ""}">${nxDueText(x.due)}</span>` : ""}</small></div>
        ${x.snap ? `<button type="button" class="btn sm" data-nxsnap="1">Save snapshot</button>` : x.loop !== undefined ? `<button type="button" class="btn sm" data-loopgo="tt:${x.loop}">Start</button>` : x.go ? `<a class="btn sm" href="#${x.go}">Open</a>` : `<a class="nx-open" href="#${x.kind}" aria-label="Open in ${x.kind === "maturity" ? "Program maturity" : "the pre-mortem"}">${icon("arrow")}</a>`}
      </li>`).join("")}</ul>`
      : `<div class="nx-empty"><b>You're all caught up.</b><span class="note">Nothing due, no open launch blockers, no exposed gaps. Share where you stand, or add another product.</span><button type="button" class="btn sm" data-pack="1">Leadership pack</button></div>`}
    </div></section>`;
}
// Ticking an item here does exactly what ticking it in its tool does, then the report card moves
function nxTick(tick, on){
  const before = rcOverall(rcParts()).score;
  let msg = on ? "Marked done" : "Marked not done";
  if(tick.startsWith("ma:")){
    const id = tick.slice(3), k = id.replace(/\d+-\d$/, ""), was = maLevelOf(ma, k);
    ma.done[id] = on; maSave(); const now = maLevelOf(ma, k), a = maArea(k);
    if(now > was && a) msg = `${a.n} is now level ${now}: ${MA_LEVELS[now - 1].n}`;
  } else if(tick.startsWith("pm:")){
    const [id, sg] = tick.slice(3).split("|"), lib = libLoad(), rec = lib[id]; if(!rec) return "That product is no longer in your workspace";
    rec.done = Object.assign({}, rec.done, {[sg]:on}); rec.updated = Date.now(); libSave(lib);
    if(pm && pm.id === id){ pm.done[sg] = on; store.set("pm3", pm); }
  }
  const after = rcOverall(rcParts()).score;
  if(before !== null && after !== null && after !== before) msg += `. Report card ${before} → ${after}`;
  return msg;
}
document.addEventListener("change", e => {
  const c = e.target.closest && e.target.closest("[data-nxtick]"); if(!c) return;
  const msg = nxTick(c.dataset.nxtick, c.checked);
  // Let the tick register before the list moves on
  setTimeout(() => { renderOverview(); gsay(msg); focusQuiet(document.getElementById("nx-h")); }, 350);
});
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-nxsnap]"); if(!b) return;
  const lv = Object.fromEntries(MA_AREAS.map(a => [a.k, maLevelOf(ma, a.k)])), today = new Date().toDateString();
  ma.hist = (ma.hist || []).filter(h => new Date(h.t).toDateString() !== today).concat([{t:Date.now(), stage:ma.stage, lv}]); maSave();
  renderOverview(); gsay(`Snapshot saved: level ${maScore(ma).toFixed(1)}`); focusQuiet(document.getElementById("nx-h"));
});
