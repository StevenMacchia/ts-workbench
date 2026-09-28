/* =========================================================
   ABUSE PRE-MORTEM: REPORT
   ========================================================= */
const OWNER_TIPS = {product:"Product: user-facing design, defaults and flows, usually led by the product manager.", eng:"Engineering: detection systems, integrations and infrastructure.", ops:"T&S Ops: review queues, escalations and day-to-day enforcement.", policy:"Policy: the written rules and how edge cases are decided.", legal:"Legal & Compliance: regulatory duties, mandatory reporting and law-enforcement requests."};
const EFFORT_TIPS = {S:"Days of work: often configuration, copy or a policy update.", M:"A few weeks: new tooling, a vendor setup, or a process with training.", L:"A quarter or more: vendor integrations, machine-learning systems or new teams."};
const htag = (cls, label, t) => `<span class="tag hastip ${cls}" tabindex="0" data-tip="${esc(t)}">${label}</span>`;
const ownerTag = o => htag("", OWNERS[o], OWNER_TIPS[o]);
const effortTag = e => htag("", EFFORT[e], EFFORT_TIPS[e]);
const LEGAL_TIP = "Likely required by law where you operate, based on your answers. The Legal obligations tab names the law.";
const MAYLEGAL_TIP = "Could be legally required depending on details such as user thresholds, licensing or how your service is classified.";
const catIcon = k => `<svg class="ci" aria-hidden="true"><use href="#c-${k}"/></svg>`;
const GLOSS = {
  "csam":"Child sexual abuse material: any sexual imagery of a minor. Illegal everywhere, and many countries require providers to report it.",
  "ncmec":"The US National Center for Missing & Exploited Children. US providers must report CSAM to its CyberTipline.",
  "kyc":"Know your customer: verifying someone's identity, usually with ID documents, before providing financial services.",
  "aml":"Anti-money laundering: controls and reporting that stop criminal money moving through your service.",
  "sextortion":"Blackmail using intimate images, often after tricking the victim into sending them. Teenagers are frequent targets.",
  "grooming":"When an adult builds a child's trust in order to sexually abuse or exploit them.",
  "doxxing":"Publishing someone's private details, such as a home address, to target or intimidate them.",
  "hash-match":"Comparing a file's digital fingerprint with lists of known illegal images, without anyone having to view it.",
  "age assurance":"Checking or estimating a user's age, from self-declaration up to ID checks or facial age estimation.",
  "money-mule":"Someone who receives and passes on stolen money, often recruited with offers of easy money.",
  "money mules":"People who receive and pass on stolen money, often recruited with offers of easy money.",
  "chargebacks":"Card payments reversed by the bank after fraud or a dispute. You lose the money plus a fee.",
  "chargeback":"A card payment reversed by the bank after fraud or a dispute. You lose the money plus a fee.",
  "red-team":"Attacking your own system the way an adversary would, to find weaknesses before others do.",
  "c2pa":"An open standard for attaching tamper-evident information about where media came from and how it was edited.",
  "statement of reasons":"The explanation EU law requires you to give a user when you restrict their content or account.",
  "trusted flaggers":"Organizations officially recognized in the EU whose reports of illegal content must be handled with priority.",
  "3-d secure":"An extra check at card checkout, such as approval in a banking app, that shifts fraud liability away from you.",
  "gifct":"The Global Internet Forum to Counter Terrorism, which runs a shared database of fingerprints of terrorist content.",
  "photodna":"Microsoft's widely used tool for fingerprinting images to detect known CSAM.",
  "stopncii":"A free service that lets adults fingerprint their intimate images so platforms can block them without seeing them.",
  "credential-stuffing":"Trying large lists of leaked passwords against your login page to break into accounts.",
  "ofac":"The US Treasury office that maintains the main US sanctions lists."
};
const GLOSS_RE = new RegExp("\\b(" + Object.keys(GLOSS).sort((a,b)=>b.length-a.length).join("|") + ")\\b", "gi");
function gloss(text){
  const seen = new Set();
  return esc(text).replace(GLOSS_RE, m => { const k = m.toLowerCase(); if(seen.has(k)) return m; seen.add(k);
    return `<span class="gl" tabindex="0" data-tip="${esc(GLOSS[k])}">${m}</span>`; });
}
const optLabel = k => { const Q = QS.find(q=>q.k===k); return ((Q&&Q.opts||[]).find(o=>o.k===pm[k])||{}).n || "Not answered"; };
function answerChips(){
  const items = [
    ["type","Product",labelOf(PLATFORMS,pm.type)||"Not answered"],
    ["features","Capabilities",pm.features.length+" selected"],
    ["youth","Under-18s",optLabel("youth")],
    ["aud","Groups",pm.aud.length?pm.aud.map(k=>QS[3].opts.find(o=>o.k===k).n).join(", "):"None"],
    ["adult","Sexual content",optLabel("adult")],
    ["contact","Strangers can make contact",optLabel("contact")],
    ["identity","To sign up",optLabel("identity")],
    ["money","Money",pm.money.length?pm.money.map(k=>QS[7].opts.find(o=>o.k===k).n).join(", "):"None"],
    ["regions","Where",pm.regions.map(k=>labelOf(REGIONS,k)).join(", ")||"Not answered"],
    ["scale","Size",optLabel("scale")],
    ["team","Safety team",optLabel("team")]
  ].filter(x=>visibleQs().some(q=>q.k===x[0]));
  return `<div class="achips">${items.map(([k,l,v])=>`<button type="button" class="achip" data-goq="${k}" title="Change this answer"><span>${l}</span><b>${esc(v)}</b></button>`).join("")}</div>`;
}
function startHere(r){
  const catScore = {}; r.risks.forEach(x=>catScore[x.cat]=(catScore[x.cat]||0)+x.score);
  const topCats = Object.keys(catScore).sort((a,b)=>catScore[b]-catScore[a]).slice(0,2).map(k=>CATS[k].toLowerCase());
  const todo = r.safeguards.filter(s=>!pm.done[s.id]).sort((a,b)=>b.rank-a.rank || b.critCovers-a.critCovers || b.covers.length-a.covers.length).slice(0,5);
  const summary = r.posture[0]==="Low"
    ? `Your risks are mostly low. The most useful things to do first are below.`
    : `This has <strong>${r.posture[0].toLowerCase()} risk exposure</strong>: ${r.counts.crit} critical and ${r.counts.high} high-rated risks, mostly in ${topCats.join(" and ")}.`;
  return `<div class="card starthere">
    <div class="card-b" style="display:grid;gap:14px">
      <div><span class="eyebrow">Start here ${tip("The five open actions that cover your most serious risks, ordered by priority and by how many critical risks each one addresses.")}</span><p class="lead">${summary}</p></div>
      ${todo.length ? `<div><div class="eyebrow" style="margin-bottom:8px">Do these first</div><ol class="firstlist">${todo.map(s=>`<li>
        <label class="first"><input type="checkbox" data-sg="${s.id}"><span><span class="t">${gloss(s.t)}</span>
          <span class="meta">${ownerTag(s.o)}${effortTag(s.e)}${s.legal==="applies"?`${htag("legal","Legal requirement",LEGAL_TIP)}`:""}</span>
          ${s.covers.length?`<span class="covers">Protects against: ${s.covers.slice(0,3).map(esc).join(" · ")}${s.covers.length>3?` and ${s.covers.length-3} more`:""}</span>`:""}</span></label></li>`).join("")}</ol></div>`
        : `<p class="note">Every priority action is ticked off. Review the full plan below for anything left.</p>`}
      <div class="row"><button type="button" class="btn" data-act="fullplan">See all ${r.safeguards.length} actions</button><span class="note">Tick items off as you go. Progress is saved in this browser.</span></div>
    </div></div>`;
}
function renderReport(r){
  if(!r.risks.length) return `<div class="card"><div class="empty"><strong style="color:var(--ink)">Nothing to assess yet</strong><span>Tell us what people can do in your product to see its risks.</span><button type="button" class="btn primary" data-goq="features">Choose capabilities</button></div></div>`;
  const blockers = r.safeguards.filter(s=>s.rank===3), bDone = blockers.filter(s=>pm.done[s.id]).length;
  const allDone = r.safeguards.filter(s=>pm.done[s.id]).length;
  const applies = r.obligations.filter(o=>o.status==="applies").length;
  const total = r.risks.length;
  // matrix
  const cellCount = {}; r.risks.forEach(x=>{ const k=x.sev+"-"+x.lik; cellCount[k]=(cellCount[k]||0)+1; });
  let matrix = "";
  for(let s=4;s>=1;s--){
    matrix += `<div class="ylab">${SEVL[s]}</div>`;
    for(let l=1;l<=4;l++){ const k=s+"-"+l, n=cellCount[k]||0, b=bandOf(s*l);
      matrix += `<button type="button" class="mcell b-${b} ${n?"":"zero"} ${pm.filter.cell===k?"sel":""}" data-cell="${k}" aria-label="${SEVL[s]} severity, ${LIKL[l]} likelihood: ${n} risks">${n||"·"}</button>`; }
  }
  matrix += `<div></div>${[1,2,3,4].map(l=>`<div class="xlab">${LIKL[l]}</div>`).join("")}`;
  // categories
  const cats = Object.keys(CATS).map(k=>({k, rs:r.risks.filter(x=>x.cat===k)})).filter(x=>x.rs.length).sort((a,b)=>b.rs.reduce((s,x)=>s+x.score,0)-a.rs.reduce((s,x)=>s+x.score,0));
  const maxC = Math.max(...cats.map(x=>x.rs.length));
  const catbars = cats.map(x=>`<button type="button" class="catrow ${pm.filter.cat===x.k?"sel":""}" data-cat="${x.k}"><span class="catl">${catIcon(x.k)}${CATS[x.k]}</span><span class="stack" style="width:${x.rs.length/maxC*100}%">${["crit","high","med","low"].map(b=>{const n=x.rs.filter(y=>y.band===b).length; return n?`<i style="flex:${n};background:var(--${b==="low"?"line-strong":b})"></i>`:"";}).join("")}</span><span class="mono">${x.rs.length}</span></button>`).join("");

  const tabs = [["plan","Launch plan",r.safeguards.length],["register","Risk register",total],["obligations","Legal obligations",r.obligations.length],["decisions","Decisions to make",r.decisions.length]];
  const body = pm.tab==="register" ? tabRegister(r) : pm.tab==="obligations" ? tabObligations(r) : pm.tab==="decisions" ? tabDecisions(r) : tabPlan(r);
  return `
    ${pm.example?`<div class="banner"><span>You're looking at an example with pre-filled answers.</span><span class="row" style="gap:8px"><button type="button" class="btn sm" data-act="save">Save a copy</button><button type="button" class="btn sm primary" data-act="new">Assess your own product</button></span></div>`:""}
    <div class="card"><div class="card-b" style="display:grid;gap:10px">
      <div class="row" style="justify-content:space-between"><div><h2 style="font-size:20px">${esc(pm.name||"Untitled assessment")}</h2><span class="note">${pm.id?`<span class="mono">${esc(pm.id)}</span> · `:""}${pm.created?`Created ${fmtDate(pm.created)} · Updated ${fmtDate(pm.updated)}`:(pm.example?"Example":"Not saved yet")}</span></div><span class="note">Click any answer to change it</span></div>
      ${answerChips()}
    </div></div>
    <div style="margin-top:16px">${startHere(r)}</div>
    <div class="section-title" style="margin-top:28px"><h2>The detail</h2><span class="note">Top-right of the matrix is most urgent</span></div>
    <div class="kpis">
      <div class="card kpi"><span class="eyebrow">Overall exposure ${tip("Severe: four or more critical risks. High: at least one critical, or five or more high. Moderate: at least one high. Low: everything else.")}</span><span class="v" style="color:${r.posture[1]?`var(--${r.posture[1]})`:"inherit"}">${r.posture[0]}</span><span class="s">${r.counts.crit} critical and ${r.counts.high} high-rated risks</span></div>
      <div class="card kpi"><span class="eyebrow">Risks identified ${tip("Each risk is scored severity (1–4) × likelihood (1–4). 12 or more is critical, 8–11 high, 4–7 medium and below 4 low.")}</span><span class="v">${total}</span>
        <div class="sevstrip">${["crit","high","med","low"].map(b=>`<i style="width:${r.counts[b]/total*100}%;background:var(--${b==="low"?"line-strong":b})"></i>`).join("")}</div>
        <span class="s">${r.counts.crit} critical · ${r.counts.high} high · ${r.counts.med} medium · ${r.counts.low} low</span></div>
      <div class="card kpi"><span class="eyebrow">Launch blockers done ${tip("The core controls for critical risks, plus anything the law likely requires where you operate. Don't ship without these.","tip-r")}</span><span class="v">${bDone}<small> / ${blockers.length}</small></span><div class="bar"><i style="width:${blockers.length?bDone/blockers.length*100:0}%;background:${blockers.length&&bDone===blockers.length?"var(--good)":"var(--crit)"}"></i></div><span class="s">${allDone} of ${r.safeguards.length} safeguards in place overall</span></div>
      <div class="card kpi"><span class="eyebrow">Legal obligations ${tip("Laws matched to your answers and jurisdictions. A starting map for your legal team, not legal advice.","tip-r")}</span><span class="v">${applies}<small> apply</small></span><span class="s">${r.obligations.length-applies} more may apply across ${pm.regions.length} jurisdiction${pm.regions.length===1?"":"s"}</span></div>
    </div>
    <div class="viz">
      <div class="card"><div class="card-h"><h3>Risk matrix ${tip("Severity is how bad the harm is if it happens. Likelihood is how probable it is on your product, given your answers. The top right is most urgent.")}</h3><span class="note">Click a cell to filter</span></div>
        <div class="card-b"><div class="axis" style="margin-bottom:6px">Severity ↓ · Likelihood →</div><div class="matrix">${matrix}</div></div></div>
      <div class="card"><div class="card-h"><h3>Risks by harm area ${tip("Sorted by total risk score. Click an area to see its risks.")}</h3>
        <div class="legend">${["crit","high","med","low"].map(b=>`<span><i style="background:var(--${b==="low"?"line-strong":b})"></i>${BANDS[b][0]}</span>`).join("")}</div></div>
        <div class="card-b catbars">${catbars}</div></div>
    </div>
    <div class="card" style="margin-top:16px;scroll-margin-top:16px" id="pm-tabs">
      <div class="card-h"><div class="segs" role="group" aria-label="Report sections">${tabs.map(([k,n,c])=>`<button type="button" data-tab="${k}" aria-pressed="${pm.tab===k}">${n} <span class="mono" style="opacity:.6">${c}</span></button>`).join("")}</div></div>
      <div class="card-b">${body}</div>
    </div>
    ${pm.example || typeof journeyNextHTML !== "function" ? "" : journeyNextHTML("premortem")}`;
}
function sgItem(s){
  return `<label class="citem ${pm.done[s.id]?"done":""}">
    <input type="checkbox" data-sg="${s.id}" ${pm.done[s.id]?"checked":""}>
    <span><span class="t">${gloss(s.t)}</span>
      <span class="meta">${ownerTag(s.o)}${effortTag(s.e)}${s.legal==="applies"?`${htag("legal","Legal requirement",LEGAL_TIP)}`:s.legal==="may"?`${htag("maylegal","May be legally required",MAYLEGAL_TIP)}`:""}</span>
      ${s.covers.length?`<span class="covers" style="display:block">Covers: ${s.covers.map(esc).join(" · ")}</span>`:""}
      ${s.lite&&pmSmall()?`<span class="lite" style="display:block">Start small: ${esc(s.lite)}</span>`:""}
    </span></label>`;
}
const pmSmall = () => pm.scale==="prelaunch"||pm.scale==="small"||pm.team==="none"||pm.team==="parttime";
const isOpen = (key, dflt) => (pm.open && key in pm.open) ? pm.open[key] : dflt;
const bandCounts = list => ["crit","high","med","low"].map(b=>[b, list.filter(x=>x.band===b).length]).filter(x=>x[1]);
const miniPills = list => bandCounts(list).map(([b,n])=>`<span class="pill ${BANDS[b][1]}">${n} ${BANDS[b][0].toLowerCase()}</span>`).join("");
function tabPlan(r){
  const byOwner = pm.group==="owner";
  const order = (a,b) => (pm.done[a.id]?1:0)-(pm.done[b.id]?1:0) || b.rank-a.rank || b.critCovers-a.critCovers || b.covers.length-a.covers.length;
  const groups = byOwner
    ? Object.keys(OWNERS).map(o=>{ const items = r.safeguards.filter(s=>s.o===o).sort(order); return {key:"own-"+o, title:`<b>${OWNERS[o]}</b>`, sub:`${items.filter(s=>s.rank===3).length} launch blockers`, items, dflt:items.some(s=>s.rank===3)}; })
    : TIERS.map(t=>{ const items = r.safeguards.filter(s=>s.rank===t.r).sort(order); return {key:"tier-"+t.r, title:pill(["low","med","high","crit"][t.r], t.n), sub:t.h, items, dflt:t.r>=2}; });
  return `<div class="row" style="justify-content:space-between;margin-bottom:12px">
      <div class="row" style="gap:8px"><div class="segs" role="group" aria-label="Group by"><button type="button" data-group="tier" aria-pressed="${!byOwner}">By priority</button><button type="button" data-group="owner" aria-pressed="${byOwner}">By owner</button></div>
        <button type="button" class="btn sm" data-act="tasks"><svg><use href="#i-send"/></svg>Send to tracker</button></div>
      <span class="note">Priority comes from the most serious risk each action covers. Legal requirements are always launch blockers.</span></div>` +
    groups.filter(g=>g.items.length).map(g=>{ const d = g.items.filter(s=>pm.done[s.id]).length;
      return `<details class="area" data-open="${g.key}" ${isOpen(g.key, g.dflt)?"open":""}>
        <summary><span class="area-t">${g.title}<span class="note">${g.sub}</span></span>
          <span class="area-prog"><span class="mono">${d}/${g.items.length}</span><span class="bar"><i style="width:${d/g.items.length*100}%;background:var(--good)"></i></span></span></summary>
        <div class="area-body">${g.items.map(sgItem).join("")}</div></details>`; }).join("");
}
function tabRegister(r){
  const mode = pm.rview || "priority";
  const qs = (pm.search||"").trim().toLowerCase();
  let rs = r.risks;
  if(pm.filter.cell){ const [s,l]=pm.filter.cell.split("-").map(Number); rs = rs.filter(x=>x.sev===s&&x.lik===l); }
  if(pm.filter.cat) rs = rs.filter(x=>x.cat===pm.filter.cat);
  if(qs) rs = rs.filter(x=>(x.n+" "+x.d+" "+CATS[x.cat]).toLowerCase().includes(qs));
  const explicit = !!(pm.filter.cell||pm.filter.cat||qs);
  const priority = mode==="priority" && !explicit;
  const shown = priority ? rs.filter(x=>x.band==="crit"||x.band==="high") : rs;
  const hidden = rs.length - shown.length;
  const pri = r.risks.filter(x=>x.band==="crit"||x.band==="high").length;
  const areas = Object.keys(CATS).map(k=>({k, rs:shown.filter(x=>x.cat===k)})).filter(a=>a.rs.length)
    .sort((a,b)=>Math.max(...b.rs.map(x=>x.score))-Math.max(...a.rs.map(x=>x.score)) || b.rs.length-a.rs.length);
  const row = x => { const done = x.sgs.filter(id=>pm.done[id]).length; return `<details class="riskd" data-open="risk-${x.id}" ${isOpen("risk-"+x.id,false)?"open":""}>
      <summary>${pill(x.band)}<span class="n">${esc(x.n)}</span><span class="sl">${SEVL[x.sev]} × ${LIKL[x.lik]} · <span class="mono">${done}/${x.sgs.length}</span> safeguards</span></summary>
      <div class="riskbody">
        <p>${gloss(x.d)}</p>
        <div><div class="eyebrow" style="margin-bottom:6px">Why it's rated this way</div>
          <ul class="why">${x.ups.map(u=>`<li><span class="w up">SEV↑</span><span>${esc(u[1])}</span></li>`).join("")}${x.drivers.map(u=>`<li><span class="w up">+${u[1]}</span><span>${esc(u[2])}</span></li>`).join("")}${x.reducers.map(u=>`<li><span class="w dn">−${u[1]}</span><span>${esc(u[2])}</span></li>`).join("")}${!x.ups.length&&!x.drivers.length&&!x.reducers.length?`<li><span class="w">·</span><span>Baseline rating for any product with these capabilities</span></li>`:""}</ul></div>
        <div><div class="eyebrow" style="margin-bottom:6px">Safeguards</div>
          <ul class="sglist">${x.sgs.map(id=>`<li><span class="${pm.done[id]?"ok":"no"}">${pm.done[id]?"✓":"○"}</span><span>${gloss(SG[id].t)} ${ownerTag(SG[id].o)}</span></li>`).join("")}</ul></div>
      </div></details>`; };
  return `<div class="filters">
      <div class="segs" role="group" aria-label="Which risks"><button type="button" data-rview="priority" aria-pressed="${mode==="priority"}">Critical and high <span class="mono" style="opacity:.6">${pri}</span></button><button type="button" data-rview="all" aria-pressed="${mode==="all"}">All <span class="mono" style="opacity:.6">${r.risks.length}</span></button></div>
      <input class="input search" id="rg-search" type="search" placeholder="Search risks" value="${esc(pm.search||"")}" aria-label="Search risks">
      ${pm.filter.cat?`<span class="pill accent">${CATS[pm.filter.cat]}</span>`:""}${pm.filter.cell?`<span class="pill accent">${SEVL[+pm.filter.cell[0]]} severity · ${LIKL[+pm.filter.cell[2]]}</span>`:""}
      ${explicit?`<button type="button" class="btn sm" data-act="clearfilter">Clear</button>`:""}</div>` +
    (areas.length ? areas.map(a=>`<details class="area" data-open="area-${a.k}" ${isOpen("area-"+a.k, explicit || a.rs.some(x=>x.band==="crit"))?"open":""}>
        <summary><span class="area-t">${catIcon(a.k)}<b>${CATS[a.k]}</b><span class="note">${a.rs.length} risk${a.rs.length===1?"":"s"}</span></span><span class="area-pills">${miniPills(a.rs)}</span></summary>
        <div class="area-body">${a.rs.map(row).join("")}</div></details>`).join("")
      : `<div class="empty">No risks match. <button type="button" class="btn sm" data-act="clearfilter">Clear filters</button></div>`) +
    (hidden>0 ? `<div class="more"><span>${hidden} medium and low risks are hidden to keep the focus on what matters most.</span><button type="button" class="btn sm" data-rview="all">Show all ${rs.length}</button></div>` : "");
}
function tabObligations(r){
  if(!pm.regions.length) return `<div class="empty">Select at least one jurisdiction in step 3 to map obligations.</div>`;
  return `<p class="disclaimer">A starting map to take to your legal team, not legal advice. Last reviewed ${LAW_REVIEWED}. Thresholds, exemptions and dates vary, and laws change, so check each source.</p>` +
    REGIONS.filter(g=>pm.regions.includes(g.k)).map(g=>{ const os = r.obligations.filter(o=>o.r===g.k).sort((a,b)=>(a.status==="applies"?0:1)-(b.status==="applies"?0:1));
      return `<div class="region"><h4>${g.n} <span class="note" style="font-family:var(--body);font-weight:400">${os.length} item${os.length===1?"":"s"}</span></h4>
        ${os.length ? os.map(o=>`<div class="obl"><div class="lh">${o.status==="applies"?`<span class="pill crit hastip" tabindex="0" data-tip="Your answers meet this law&#39;s usual trigger.">Likely applies</span>`:`<span class="pill high hastip" tabindex="0" data-tip="Depends on details we don&#39;t ask about, such as user thresholds, licensing or how regulators classify your service.">May apply</span>`}<b>${esc(o.law)}</b></div><p>${gloss(o.t)}</p>${lawSrcLink(o.law)}
          ${o.sg.length?`<div class="chipset">${o.sg.map(id=>`<span class="tag">${pm.done[id]?"✓ ":""}${esc(SG[id].t.split(",")[0].split("(")[0].trim())}</span>`).join("")}</div>`:""}</div>`).join("")
        : `<p class="note">Nothing specific flagged for this profile. General consumer-protection and privacy law still applies.</p>`}</div>`;}).join("");
}
function tabDecisions(r){
  return `<p class="note" style="margin-bottom:6px">Policy calls your team has to make before launch. Your notes are saved in this browser and included in the copied report.</p>` +
    r.decisions.map(d=>`<div class="dq"><label for="dq-${esc(d.id)}">${esc(d.q)} <span class="dsrc">${esc(d.src)}</span></label><textarea id="dq-${esc(d.id)}" data-note="${esc(d.id)}" placeholder="Decision, owner and date">${esc(pm.notes[d.id]||"")}</textarea></div>`).join("");
}
function reportMarkdown(r){
  const L = [];
  L.push(`# Abuse pre-mortem: ${pm.name||"Untitled assessment"}`, "");
  L.push(`**Profile:** ${labelOf(PLATFORMS,pm.type)}; ${labelOf(YOUTH,pm.youth)}; ${labelOf(IDENTITY,pm.identity)}; ${labelOf(CONTACT,pm.contact)}; adult content: ${labelOf(ADULT,pm.adult).toLowerCase()}; money: ${pm.money.map(k=>labelOf(MONEY,k)).join(", ")||"none"}; regions: ${pm.regions.map(k=>k.toUpperCase()).join(", ")||"none"}; scale: ${labelOf(SCALE,pm.scale)}; T&S: ${labelOf(TEAM,pm.team)}.`);
  L.push(`**Capabilities:** ${pm.features.map(k=>FEATURES[k][0]).join(", ")}`, "");
  L.push(`**Overall exposure:** ${r.posture[0]} (${r.counts.crit} critical, ${r.counts.high} high, ${r.counts.med} medium, ${r.counts.low} low)`, "");
  L.push("## Launch plan");
  TIERS.forEach(t=>{ const items = r.safeguards.filter(s=>s.rank===t.r); if(!items.length) return;
    L.push(`### ${t.n}`); items.forEach(s=>L.push(`- [${pm.done[s.id]?"x":" "}] ${s.t} (Owner: ${OWNERS[s.o]}; ${EFFORT[s.e].toLowerCase()}${s.legal==="applies"?"; legal requirement":s.legal==="may"?"; may be legally required":""})`)); L.push(""); });
  L.push("## Risk register", "", "| Rating | Risk | Area | Severity | Likelihood | Main drivers |", "|---|---|---|---|---|---|");
  r.risks.forEach(x=>L.push(`| ${BANDS[x.band][0]} | ${x.n} | ${CATS[x.cat]} | ${SEVL[x.sev]} | ${LIKL[x.lik]} | ${x.ups.map(u=>u[1]).concat(x.drivers.map(u=>u[2])).join("; ")||"Baseline"} |`));
  L.push("", "## Legal and regulatory obligations (not legal advice)", "", `_Law notes last reviewed ${LAW_REVIEWED}. Check each source; laws change._`, "");
  r.obligations.forEach(o=>L.push(`- **${o.law}** (${labelOf(REGIONS,o.r)}, ${o.status==="applies"?"likely applies":"may apply"}): ${o.t}${LAW_SRC[o.law] ? ` [Source](${LAW_SRC[o.law][0]})` : ""}`));
  L.push("", "## Decisions to make");
  r.decisions.forEach(d=>{ L.push(`- ${d.q}`); if(pm.notes[d.id]) L.push(`  - Decision: ${pm.notes[d.id]}`); });
  L.push("", "_Generated with T&S Workbench._");
  return L.join("\n");
}
