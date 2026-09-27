/* =========================================================
   OVERVIEW (studio layout, live data)
   ========================================================= */
const OV_ART = {
  pm:`<svg viewBox="0 0 160 124" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="ovsw" x1="0" x2="1"><stop offset="0" stop-color="var(--t-pm)" stop-opacity="0"/><stop offset="1" stop-color="var(--t-pm)" stop-opacity=".35"/></linearGradient></defs>
    <circle cx="80" cy="62" r="46" fill="none" stroke="var(--line-strong)"/><circle cx="80" cy="62" r="30" fill="none" stroke="var(--line-strong)"/><circle cx="80" cy="62" r="14" fill="none" stroke="var(--line-strong)"/>
    <path class="sweep" d="M80 62 L126 62 A46 46 0 0 0 112.5 29.5 Z" fill="url(#ovsw)"/>
    <circle cx="104" cy="40" r="9" fill="var(--crit)" opacity=".15"/><circle cx="104" cy="40" r="4" fill="var(--crit)"/><circle cx="52" cy="78" r="3.5" fill="var(--high)"/><circle cx="96" cy="92" r="3" fill="var(--faint)"/><circle cx="58" cy="44" r="3" fill="var(--faint)"/>
    <circle cx="80" cy="62" r="9" fill="var(--t-pm)"/><path d="M76.5 62l2.4 2.4 4.6-4.8" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  tt:`<svg viewBox="0 0 160 124" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M24 88 H136" stroke="var(--line-strong)" stroke-dasharray="3 4"/>
    <circle cx="36" cy="88" r="5" fill="var(--good)"/><circle cx="68" cy="88" r="5" fill="var(--high)"/><circle cx="100" cy="88" r="10" fill="var(--t-tt)" opacity=".18"/><circle cx="100" cy="88" r="5" fill="var(--t-tt)"/><circle cx="132" cy="88" r="5" fill="var(--surface)" stroke="var(--line-strong)"/>
    <rect x="52" y="22" width="84" height="44" rx="8" fill="var(--surface)" stroke="var(--line-strong)"/><rect x="62" y="32" width="30" height="6" rx="3" fill="var(--t-tt)" opacity=".85"/><rect x="62" y="44" width="62" height="4" rx="2" fill="var(--faint)" opacity=".55"/><rect x="62" y="53" width="46" height="4" rx="2" fill="var(--faint)" opacity=".35"/>
    <circle cx="38" cy="40" r="14" fill="var(--surface)" stroke="var(--line-strong)"/><path d="M38 32v8l5 3" stroke="var(--t-tt)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  mx:`<svg viewBox="0 0 160 124" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="ovar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--t-mx)" stop-opacity=".35"/><stop offset="1" stop-color="var(--t-mx)" stop-opacity="0"/></linearGradient></defs>
    <path d="M22 96 H138" stroke="var(--line-strong)"/><path d="M22 72 H138 M22 48 H138" stroke="var(--line)"/>
    <path d="M22 84 C40 80 48 62 64 66 S88 44 104 48 S126 30 138 28 V96 H22Z" fill="url(#ovar)"/><path d="M22 84 C40 80 48 62 64 66 S88 44 104 48 S126 30 138 28" fill="none" stroke="var(--t-mx)" stroke-width="2"/>
    <circle cx="138" cy="28" r="4" fill="var(--t-mx)" stroke="var(--surface)" stroke-width="2"/></svg>`,
  vd:`<svg viewBox="0 0 160 124" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <rect x="28" y="30" width="104" height="22" rx="6" fill="var(--surface)" stroke="var(--line-strong)"/><rect x="36" y="38" width="22" height="6" rx="3" fill="var(--faint)" opacity=".55"/><rect x="72" y="38" width="46" height="6" rx="3" fill="var(--sunk)"/><rect x="72" y="38" width="38" height="6" rx="3" fill="var(--t-vd)"/>
    <rect x="28" y="58" width="104" height="22" rx="6" fill="var(--surface)" stroke="var(--line-strong)"/><rect x="36" y="66" width="22" height="6" rx="3" fill="var(--faint)" opacity=".55"/><rect x="72" y="66" width="46" height="6" rx="3" fill="var(--sunk)"/><rect x="72" y="66" width="27" height="6" rx="3" fill="var(--t-vd)" opacity=".55"/>
    <rect x="28" y="86" width="104" height="22" rx="6" fill="var(--surface)" stroke="var(--line-strong)"/><rect x="36" y="94" width="22" height="6" rx="3" fill="var(--faint)" opacity=".55"/><rect x="72" y="94" width="46" height="6" rx="3" fill="var(--sunk)"/><rect x="72" y="94" width="18" height="6" rx="3" fill="var(--crit)" opacity=".7"/>
    <circle cx="132" cy="30" r="9" fill="var(--t-vd)"/><path d="M128.4 30l2.3 2.3 4.2-4.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};
OV_ART.pol = `<svg viewBox="0 0 160 124" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <rect x="34" y="18" width="80" height="92" rx="9" fill="var(--surface)" stroke="var(--line-strong)"/>
    <rect x="46" y="32" width="44" height="6" rx="3" fill="var(--t-pol)" opacity=".85"/>
    <rect x="46" y="46" width="56" height="4" rx="2" fill="var(--faint)" opacity=".5"/><rect x="46" y="56" width="22" height="4" rx="2" fill="var(--faint)" opacity=".5"/>
    <rect x="70" y="54" width="32" height="8" rx="3" fill="var(--high)" opacity=".22"/><rect x="72" y="56" width="28" height="4" rx="2" fill="var(--high)" opacity=".75"/>
    <rect x="46" y="68" width="50" height="4" rx="2" fill="var(--faint)" opacity=".5"/><rect x="46" y="78" width="40" height="4" rx="2" fill="var(--faint)" opacity=".35"/><rect x="46" y="88" width="46" height="4" rx="2" fill="var(--faint)" opacity=".35"/>
    <circle cx="116" cy="84" r="20" fill="var(--surface)" stroke="var(--t-pol)" stroke-width="3"/><path d="M130 98l10 10" stroke="var(--t-pol)" stroke-width="4" stroke-linecap="round"/>
    <path d="M108.5 84l5 5 9-10" stroke="var(--t-pol)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
{
  const oct = (r, vals) => [0,1,2,3,4,5,6,7].map(i => { const a = -Math.PI/2 + i*Math.PI/4, rr = vals ? vals[i]/4*r : r; return (80 + Math.cos(a)*rr).toFixed(1) + "," + (62 + Math.sin(a)*rr).toFixed(1); }).join(" ");
  const cur = [3.4,2,3,2.2,1.4,2.6,3,3.2], low = -Math.PI/2 + 4*Math.PI/4;
  OV_ART.ma = `<svg viewBox="0 0 160 124" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    ${[46, 34, 22].map(r => `<polygon points="${oct(r)}" fill="none" stroke="var(--line-strong)"/>`).join("")}
    <polygon points="${oct(46, cur)}" fill="var(--t-ma)" fill-opacity=".22" stroke="var(--t-ma)" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="${oct(34.5)}" fill="none" stroke="var(--ink)" stroke-opacity=".5" stroke-dasharray="3 3"/>
    <circle cx="${(80 + Math.cos(low)*1.4/4*46).toFixed(1)}" cy="${(62 + Math.sin(low)*1.4/4*46).toFixed(1)}" r="4" fill="var(--crit)"/></svg>`;
}
function ovChip(it){
  const d = it.data || {};
  if(it.kind==="premortem"){ const r = assess(openRecord(d)); return `<span class="ov-chip"><span class="sdot" style="background:${r.posture[1]?`var(--${r.posture[1]})`:"var(--faint)"}"></span>${r.posture[0]}</span>`; }
  if(it.kind==="tabletop"){ const sc = SCENARIOS[d.s]; if(!sc) return ""; const picks = (d.first && d.first.length) ? d.first : (d.picks||[]); const b = picks.filter((p,i)=>sc.steps[i] && sc.steps[i].o[p] && sc.steps[i].o[p].best).length;
    return `<span class="ov-chip"><span class="sdot" style="background:${b>=3?"var(--good)":b>=2?"var(--high)":"var(--crit)"}"></span>${b}/${sc.steps.length} first try</span>`; }
  if(it.kind==="metrics"){ const n = METRICS.filter(m => m.st <= +d.stage && (m.p==="all" || m.p.includes(d.platform)) && (!m.reg || d.reg)).length; return `<span class="ov-chip">${n} metrics</span>`; }
  if(it.kind==="maturity" && typeof maScore === "function"){ const sc = maScore(d); if(sc===null) return ""; const g = maGaps(d).length;
    return `<span class="ov-chip"><span class="sdot" style="background:${g ? "var(--high)" : "var(--good)"}"></span>Level ${sc.toFixed(1)}</span>`; }
  if(it.kind==="policy"){ const s = d.result ? d.result.score : d.heur ? d.heur.score : null; if(s===null) return "";
    return `<span class="ov-chip"><span class="sdot" style="background:${s>=75?"var(--good)":s>=50?"var(--high)":"var(--crit)"}"></span>Clarity ${s}</span>`; }
  if(it.kind==="vendors"){ const top = vendorResult(d); return `<span class="ov-chip"><span class="sdot" style="background:${top?"var(--t-vd)":"var(--crit)"}"></span>${top ? esc(top.v.name.split(" (")[0]) : "None qualify"}</span>`; }
  return "";
}
function renderOverview(){
  const r = assess(pm), has = !!(pm.type && r.risks.length);
  const p = wsProfile(), first = p && p.name ? p.name.trim().split(/\s+/)[0] : "";
  const hr = new Date().getHours(), hello = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const blockers = r.safeguards.filter(s=>s.rank===3), bDone = blockers.filter(s=>pm.done[s.id]).length, open = blockers.length - bDone;
  const prog = ttProgress(), myType = ttCompanyType();
  const types = TT_TYPES.filter(t=>t.k!=="all").map(t => { const idx = SCENARIOS.map((s,i)=>i).filter(i => (SCENARIOS[i].types||[]).includes(t.k));
    return {t, total:idx.length, done:idx.filter(i=>prog[ttKey(i, t.k)]).length}; })
    .sort((a,b) => (b.t.k===myType) - (a.t.k===myType) || b.done - a.done).slice(0,4);
  const mine = types.find(x=>x.t.k===myType);
  const sub = has
    ? `${esc(pm.name || "Your assessment")} has ${open} open launch blocker${open===1?"":"s"}${mine ? `, and you've completed ${mine.done} of ${mine.total} ${esc(mine.t.s)} tabletop scenarios` : ""}.`
    : "Profile what you're building to see how it could be misused, or rehearse a crisis in the tabletop library.";
  const items = Object.values(wsItems()).filter(i=>KINDS[i.kind]).sort((a,b)=>(b.updated||0)-(a.updated||0)).slice(0,5);
  const laws = r.obligations.filter(o=>o.status==="applies").length;
  const nextUp = r.safeguards.filter(s=>!pm.done[s.id]).sort((a,b)=>b.rank-a.rank || b.critCovers-a.critCovers || b.covers.length-a.covers.length).slice(0,3);
  const pct = blockers.length ? Math.round(bDone/blockers.length*100) : 0, C = 2*Math.PI*34;
  const tool = (key, route, color, iconId, name, desc, foot) => `<a class="ov-tool" href="#${route}" style="--c:${color}">
      <div class="ov-art">${OV_ART[key]}</div>
      <div class="ov-tb"><h4><span class="sb-glyph" style="background:${color}"><svg><use href="#i-${iconId}"/></svg></span>${name}</h4><p>${desc}</p>
        <div class="ov-foot"><span>${foot}</span><svg class="ov-go"><use href="#i-arrow"/></svg></div></div></a>`;

  view.innerHTML = `<div class="ov">
    <section class="ov-greet rise">
      <svg class="ph-mark" aria-hidden="true"><use href="#i-logo"/></svg>
      <h1>${hello}${first ? ", " + esc(first) : ""}</h1>
      <p>${sub}</p>
      <div class="ph-stats"><span>${HARMS.length} abuse risks</span><span>${SCENARIOS.length} crisis scenarios</span><span>${METRICS.length} metrics</span><span>${typeof AI_TOOLS !== "undefined" ? Object.values(AI_TOOLS).filter(t => !t.wip).length + 1 : 1} AI assistants</span></div>
    </section>

    ${has ? `<section class="ov-hero rise" aria-label="Current assessment">
      <div class="ov-hl">
        <div class="ov-eb"><span class="sb-glyph" style="background:var(--t-pm)"><svg><use href="#i-radar"/></svg></span>Abuse pre-mortem${pm.updated ? " · updated " + relTime(pm.updated) + " ago" : pm.example ? " · example" : ""}</div>
        <h2>${esc(pm.name || "Untitled assessment")}</h2>
        <div class="ov-chips">
          <span class="ov-status" style="color:${r.posture[1]?`var(--${r.posture[1]})`:"inherit"};border-color:color-mix(in oklab, ${r.posture[1]?`var(--${r.posture[1]})`:"var(--line-strong)"} 35%, transparent)"><span class="sdot" style="background:${r.posture[1]?`var(--${r.posture[1]})`:"var(--faint)"}"></span>${r.posture[0]} exposure</span>
          ${pm.regions.length ? `<span class="ov-status">${pm.regions.map(k=>k.toUpperCase()).join(" · ")}</span>` : ""}
          ${pm.youth ? `<span class="ov-status">${esc(labelOf(YOUTH, pm.youth))}</span>` : ""}
        </div>
        <div class="ov-stats">
          <div><b class="mono">${r.risks.length}</b><span>Risks identified</span></div>
          <div><b class="mono" style="${r.counts.crit?"color:var(--crit)":""}">${r.counts.crit}</b><span>Critical</span></div>
          <div><b class="mono">${laws}</b><span>Laws likely apply</span></div>
        </div>
        <div>${r.risks.slice(0,3).map(x=>`<div class="ov-risk"><span class="sdot" style="background:var(--${x.band==="low"?"faint":x.band})"></span>${esc(x.n)}<span class="mono">${x.score}/16</span></div>`).join("")}</div>
        <div class="row" style="gap:8px"><button type="button" class="btn primary" data-ov="report">Open report ${icon("arrow")}</button><button type="button" class="btn" data-ov="plan">Launch plan</button></div>
      </div>
      <div class="ov-hr">${radarChart(r)}</div>
    </section>` : `<section class="ov-hero rise" aria-label="Get started">
      <div class="ov-hl">
        <div class="ov-eb"><span class="sb-glyph" style="background:var(--t-pm)"><svg><use href="#i-radar"/></svg></span>Abuse pre-mortem</div>
        <h2>Find out how your product could be misused, before it launches</h2>
        <p class="muted">A few plain-language questions produce a scored risk register, a launch plan with owners, and the laws that likely apply where you operate.</p>
        <div class="row" style="gap:8px"><button type="button" class="btn primary" data-ov="new">Start a pre-mortem ${icon("arrow")}</button><a class="btn" href="#premortem">Explore an example</a></div>
      </div>
      <div class="ov-hr">${heroArt()}</div>
    </section>`}

    <section class="rise">
      <div class="ov-sec-h"><h3>Tools</h3><span class="note">Free, private, and nothing leaves your browser</span></div>
      <div class="ov-tools">
        ${tool("pm","premortem","var(--t-pm)","radar","Abuse pre-mortem","Profile a product and see how it will be misused before launch.",`${HARMS.length} risks · ${REGIONS.length} jurisdictions`)}
        ${tool("tt","tabletop","var(--t-tt)","siren","Incident tabletop","Rehearse a crisis and learn from every call, with the law behind it.",`${SCENARIOS.length} scenarios · 8 sectors`)}
        ${tool("mx","metrics","var(--t-mx)","gauge","Metrics framework","Build the scorecard you bring to an executive review.",`${METRICS.length} metrics · ${Object.keys(MX_PLATFORMS).length} sectors`)}
        ${tool("vd","vendors","var(--t-vd)","scale","Vendor scorecard","Choose a moderation vendor on evidence, with RFP questions.",`${CRITERIA.length} criteria · 2 minimums`)}
        ${tool("pol","policy","var(--t-pol)","doc","Policy stress-tester","Paste a rule to find vague words, missing exceptions and hard edge cases.","AI-assisted · instant checks")}
        ${typeof MA_AREAS !== "undefined" ? tool("ma","maturity","var(--t-ma)","steps","Program maturity","Rate your program in eight areas and get a roadmap for the biggest gaps.",`${MA_AREAS.length} areas · 5 levels`) : ""}
      </div>
    </section>

    ${typeof AI_TOOLS !== "undefined" ? `<section class="rise">
      <div class="ov-sec-h"><h3>AI assistants</h3><span class="note">Run on your own Claude account, only when you click</span></div>
      <div class="ov-ai">${["notice","appeal","transparency"].map(k => `<a class="ov-aic ${AI_TOOLS[k].wip ? "wip" : ""}" href="#${k}"><span class="sb-glyph" style="background:${AI_TOOLS[k].wip ? "var(--faint)" : "var(--t-ai)"}"><svg><use href="#${AI_TOOLS[k].icon}"/></svg></span><div><h4>${AI_TOOLS[k].n}${AI_TOOLS[k].wip ? ` <span class="wip-chip">Under construction</span>` : ""}</h4><p>${esc(AI_TOOLS[k].desc)}</p></div><svg class="ov-go"><use href="#i-arrow"/></svg></a>`).join("")}</div>
    </section>` : ""}

    <section class="ov-cols rise">
      <div>
        <div class="ov-sec-h"><h3>Jump back in</h3><a href="#workspace">View workspace</a></div>
        <div class="ov-list">${items.length ? items.map(it=>`<button type="button" class="ov-row" data-open="${esc(it.id)}">
            <span class="ov-tile" style="background:color-mix(in oklab, ${TOOL_COLOR[it.kind]} 14%, transparent);color:${TOOL_COLOR[it.kind]}"><svg><use href="#${KINDS[it.kind].icon}"/></svg></span>
            <span style="min-width:0"><b>${esc(it.title||"Untitled")}</b><small>${KINDS[it.kind].n}${it.projectId && projName(it.projectId) ? " · " + esc(projName(it.projectId)) : ""}</small></span>
            ${ovChip(it)}<span class="when">${relTime(it.updated)}</span></button>`).join("")
          : `<div class="ov-empty"><b style="color:var(--ink)">Nothing saved yet</b><span>Results you save from any tool appear here, so you can pick up where you left off.</span><button type="button" class="btn sm" data-ov="new">${icon("plus")}Start a pre-mortem</button></div>`}</div>
      </div>
      <div style="display:grid;gap:16px;align-content:start">
        ${has ? `<div>
          <div class="ov-sec-h"><h3>Launch readiness</h3><a href="#premortem" data-ov-link="plan">Launch plan</a></div>
          <div class="ov-card">
            <div class="ov-ready">
              <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label="${bDone} of ${blockers.length} launch blockers done">
                <circle cx="42" cy="42" r="34" fill="none" stroke="var(--sunk)" stroke-width="8"/>
                <circle cx="42" cy="42" r="34" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct/100)).toFixed(1)}" transform="rotate(-90 42 42)"/>
                <text x="42" y="47" text-anchor="middle" font-size="15" font-weight="600" fill="var(--ink)" font-family="var(--mono)">${pct}%</text>
              </svg>
              <div><h4>${bDone} of ${blockers.length} blockers done</h4><p>${esc(pm.name || "Current assessment")}</p></div>
            </div>
            ${nextUp.length ? `<div class="ov-next">${nextUp.map(s=>`<label><input type="checkbox" id="ovn-${s.id}" data-ovsg="${s.id}"><span>${esc(s.t)}<small>${OWNERS[s.o]} · ${EFFORT[s.e].replace(" effort","")}</small></span></label>`).join("")}</div>` : ""}
          </div></div>` : ""}
        <div>
          <div class="ov-sec-h"><h3>Tabletop progress</h3><a href="#tabletop">Practice</a></div>
          <div class="ov-card ov-learn">${types.map(x=>`<div class="ov-lrow"><span>${esc(x.t.n.split(" &")[0].split(",")[0])}</span><div class="bar"><i style="width:${x.total?x.done/x.total*100:0}%"></i></div><span class="mono">${x.done}/${x.total}</span></div>`).join("")}</div>
        </div>
      </div>
    </section>

    <footer class="ov-foot-note"><span><svg><use href="#i-lock"/></svg>Your work stays in your browser. AI analysis, when you ask for it, runs on your own Claude account.</span><span>Not legal advice. Use the outputs to start conversations with your Legal and Policy partners.</span><a href="#about" style="margin-left:auto;color:var(--faint);text-decoration:none">Built by Steven Macchia · About this project</a></footer>
  </div>`;

  bindRadar();
  view.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openSaved(b.dataset.open));
  view.querySelectorAll('[data-ov="new"]').forEach(b => b.onclick = newAssessment);
  view.querySelectorAll('[data-ov="report"],[data-ov="plan"],[data-ov-link="plan"]').forEach(b => b.onclick = e => {
    e.preventDefault(); pm.stage = "report"; if(b.dataset.ov==="plan" || b.dataset.ovLink==="plan") pm.tab = "plan"; savePM(); goRoute("premortem");
    if(pm.tab==="plan") setTimeout(() => { const el = $("#pm-tabs"); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }, 60);
  });
  view.querySelectorAll("[data-ovsg]").forEach(c => c.onchange = () => { pm.done[c.dataset.ovsg] = c.checked; savePM(); gsay(c.checked ? "Marked done" : "Marked not done"); renderOverview(); });
}
