/* =========================================================
   ABUSE PRE-MORTEM: GUIDED QUESTIONS
   ========================================================= */
const QS = [
  {k:"type", sec:"Your product", t:"What are you building?", h:"Pick the closest match. It tells us which kinds of abuse and which laws to look at.", kind:"single", opts:PLATFORMS,
   tip:"Your sector sets the baseline. Fintech and crypto raise fraud and money-laundering risks; dating raises offline-safety risks. It also decides which policy questions we ask."},
  {k:"features", sec:"Your product", t:"What can people do in it?", h:"We've pre-selected what's typical for this kind of product. Adjust it to match yours, or to just the feature you're launching.", kind:"features",
   tip:"Each capability switches on the risks it enables. Private messaging brings grooming and scams; image uploads bring CSAM and intimate-image abuse; AI generation brings deepfakes and jailbreaks."},
  {k:"youth", sec:"Your users", t:"Could anyone under 18 use it?", h:"This changes more than any other answer. A rule that says “18+” doesn't keep children out unless you check.", kind:"single",
   tip:"Under-18s raise the likelihood and severity of child-safety risks and trigger children's laws in most countries. “18+ without checks” is still treated as minors being present, just fewer of them.", opts:[
    {k:"kids", n:"Yes, it's made for children", h:"Under-13s are part of the audience"},
    {k:"teens", n:"Yes, teens can join", h:"Teens and adults use it together"},
    {k:"adult_self", n:"It's 18+, but we don't check ages", h:"People just confirm they're old enough"},
    {k:"adult_verified", n:"It's 18+, and we verify age", h:"Age is checked with ID or age estimation"}]},
  {k:"aud", sec:"Your users", t:"Does it serve any of these groups?", h:"Scammers and abusers target some groups more, and the harm to them is often worse.", kind:"multi", none:"None of these",
   tip:"Older and vulnerable users raise the severity of scams. People who earn income raise account-takeover and wrongful-enforcement risks. Business customers lower harassment, because people answer to an employer.", opts:[
    {k:"older", n:"Older adults", h:"Many users are over 65"},
    {k:"vulnerable", n:"People going through a hard time", h:"Health problems, money worries, crisis or loneliness"},
    {k:"creators", n:"People who earn a living on it", h:"Creators, sellers, hosts, drivers or freelancers"},
    {k:"business", n:"Businesses and their staff", h:"Companies set it up for their employees"}]},
  {k:"adult", sec:"Your users", t:"Is nudity or sexual content allowed?", h:"Allowing it brings age-check laws and makes abusive images harder to spot.", kind:"single", skip:p=>p.youth==="kids", skipVal:"none",
   tip:"Allowing sexual content raises the likelihood of intimate-image abuse and trafficking, and brings age-verification duties in the US, UK and elsewhere.", opts:[
    {k:"none", n:"No", h:"It isn't allowed anywhere"},
    {k:"nudity", n:"Some nudity", h:"Art, education, breastfeeding, or behind a warning"},
    {k:"explicit", n:"Yes, explicit content", h:"Sexual content is allowed or sold"}]},
  {k:"contact", sec:"How people interact", t:"Can people contact someone they don't know?", h:"Most grooming, scams and harassment start with a message from a stranger.", kind:"single", skip:p=>!["dm","groups","voice","live"].some(f=>p.features.includes(f)), skipVal:"none",
   tip:"Stranger contact is the biggest driver of grooming, sextortion, scams and harassment. Requiring a connection first lowers all of them.", opts:[
    {k:"strangers", n:"Yes, anyone can message anyone", h:"People can find and contact strangers"},
    {k:"limited", n:"Only after they connect", h:"A match, follow-back, invite or purchase comes first"},
    {k:"none", n:"No", h:"People can't contact each other"}]},
  {k:"identity", sec:"How people interact", t:"What does someone need to create an account?", h:"The easier it is to make an account, the easier it is to come back after a ban.", kind:"single",
   tip:"Anonymous and email-only sign-up make fake accounts and ban evasion easier. Verified identity lowers the likelihood of most abuse, but not all of it.", opts:[
    {k:"anon", n:"Nothing", h:"People can stay completely anonymous"},
    {k:"pseudo", n:"An email or phone number", h:"Plus a username of their choice"},
    {k:"real", n:"Their real name", h:"Expected, but not checked"},
    {k:"verified", n:"A verified ID", h:"Everyone's identity is checked"}]},
  {k:"money", sec:"Money", t:"Does money change hands?", h:"Money attracts organized fraud, and some money flows bring financial-crime laws.", kind:"multi", none:"No money involved",
   tip:"Each money flow adds its own risks: payments between users bring scams, payouts bring money mules, stored value brings laundering, and crypto makes losses irreversible.", opts:[
    {k:"subs", n:"People pay us", h:"Subscriptions or purchases"},
    {k:"p2p", n:"People pay each other", h:"Transfers, sales or bookings"},
    {k:"payouts", n:"We pay people", h:"Sellers, creators, hosts or workers get paid out"},
    {k:"wallet", n:"Balances, credits or virtual currency", h:"Gift cards, tokens, coins or in-game items"},
    {k:"crypto", n:"Crypto", h:"Buying, holding or sending crypto"},
    {k:"credit", n:"Loans or credit", h:"Lending, buy now pay later, credit lines"}]},
  {k:"regions", sec:"Reach", t:"Where will people use it?", h:"We'll map the laws that likely apply in each place.", kind:"multi", all:"All of these", opts:REGIONS,
   tip:"We match your answers against each jurisdiction's laws and mark each one “likely applies” or “may apply”. Treat it as a starting point for your legal team."},
  {k:"scale", sec:"Reach", t:"How many people use it?", h:"Bigger products attract organized abuse and cross legal thresholds.", kind:"single",
   tip:"Scale raises the likelihood of organized abuse and crosses legal thresholds, such as 45 million EU users for the DSA's very-large-platform rules. For small products we suggest lighter ways to start.", opts:[
    {k:"prelaunch", n:"It hasn't launched yet"}, {k:"small", n:"Fewer than 100,000"}, {k:"mid", n:"100,000 to 10 million"}, {k:"large", n:"More than 10 million"}]},
  {k:"team", sec:"Your team", t:"Who deals with safety problems today?", h:"If a child is in danger at 2 a.m., someone needs to respond.", kind:"single",
   tip:"Without a dedicated owner we add readiness risks, such as nobody owning urgent escalations, and suggest simple starting versions of each safeguard.", opts:[
    {k:"none", n:"Nobody yet"}, {k:"parttime", n:"Someone, alongside their main job"}, {k:"dedicated", n:"A dedicated team"}, {k:"mature", n:"A full trust & safety organization"}]},
  {k:"name", sec:"Last step", t:"What should we call this assessment?", h:"It appears on your report, in your workspace and in the downloaded launch doc.", kind:"name",
   tip:"Assessments are saved in this browser under this name. Use Export on the start screen to back them up or move them to another device."}
];

let pm = store.get("pm3", null) || Object.assign(fromPreset("teen_social"), {stage:"start"});
const savePM = () => { if(pm.saved){ pm.updated = Date.now(); const lib = libLoad(); lib[pm.id] = recordOf(pm); libSave(lib); } store.set("pm3", pm); };
const visibleQs = () => QS.filter(q => !(q.skip && q.skip(pm)));
const applySkips = () => QS.forEach(q => { if(q.skip && q.skip(pm)) pm[q.k] = q.skipVal; });
const sameSet = (a,b) => a.length===b.length && a.every(x=>b.includes(x));
const pill = (band, txt) => `<span class="pill ${BANDS[band][1]}"><span class="dot"></span>${txt||BANDS[band][0]}</span>`;
const tip = (text, cls) => `<span class="tipi ${cls||""}" tabindex="0" role="img" aria-label="${esc(text)}" data-tip="${esc(text)}"><svg><use href="#i-info"/></svg></span>`;
let confirmDel = null;

function withImpact(mutate){ mutate(); applySkips(); }
// Snapshot of the risk picture when a question opens, so the panel can show what this question's answer changed
function qSnap(k){ const r = assess(pm); return {k, bands:Object.fromEntries(r.risks.map(x=>[x.id, x.band])), laws:r.obligations.filter(o=>o.status==="applies").map(o=>o.id || o.n)}; }
function setType(v){
  const prev = PLATFORMS.find(x=>x.k===pm.type), t = PLATFORMS.find(x=>x.k===v);
  pm.type = v;
  if(!pm.features.length || (prev && sameSet(pm.features, prev.f))) pm.features = t.f.slice();
  if(!pm.money.length || (prev && sameSet(pm.money, prev.m))) pm.money = t.m.slice();
}
function heroArt(){
  const N = [[70,60,"n"],[95,132,"n"],[118,40,"h"],[200,44,"n"],[232,118,"c"],[186,150,"n"],[58,104,"n"],[252,72,"n"],[108,96,"n"],[206,94,"h"],[150,18,"n"],[140,160,"c"]];
  const E = [[0,2],[0,6],[6,1],[1,8],[8,2],[2,10],[10,3],[3,7],[7,4],[4,5],[5,11],[11,1],[9,4],[9,3],[8,11]];
  return `<svg class="heroart" viewBox="0 0 300 180" aria-hidden="true">
    <path d="M150 90 L234 90 A84 84 0 0 0 209.4 30.6 Z" fill="var(--accent)" opacity=".10"/>
    ${[28,56,84].map((r,i)=>`<circle cx="150" cy="90" r="${r}" fill="none" stroke="var(--line-strong)" stroke-width="1" ${i===2?'stroke-dasharray="3 4"':""}/>`).join("")}
    <path d="M150 4v172M60 90h180" stroke="var(--line)" stroke-width="1"/>
    ${E.map(([a,b])=>`<line x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}" stroke="var(--line-strong)" stroke-width="1"/>`).join("")}
    ${N.map(([x,y,t])=>t==="c"?`<circle cx="${x}" cy="${y}" r="11" fill="var(--crit)" opacity=".16"/><circle cx="${x}" cy="${y}" r="5.5" fill="var(--crit)"/>`
      : t==="h"?`<circle cx="${x}" cy="${y}" r="5" fill="var(--high)"/>`
      : `<circle cx="${x}" cy="${y}" r="4.5" fill="var(--surface)" stroke="var(--muted)" stroke-width="1.4"/>`).join("")}
    <circle cx="150" cy="90" r="19" fill="var(--accent)"/>
    <use href="#i-logo" x="137" y="77" width="26" height="26" style="color:var(--accent-ink)"/>
  </svg>`;
}

/* ---------- screens ---------- */
function libraryBlock(){
  const items = Object.values(libLoad()).sort((a,b)=>(b.updated||0)-(a.updated||0));
  const head = `<div class="section-title"><h2>Saved pre-mortems ${tip("Part of your workspace, saved in this browser. Save a workspace file to keep a copy or open it on another device.")}</h2>
    <a class="btn sm" href="#workspace">All saved work</a></div>`;
  if(!items.length) return head + `<div class="card libempty"><svg><use href="#i-folder"/></svg><div><b>No saved pre-mortems yet</b><p class="note">Pre-mortems you finish are saved here and in your workspace automatically. Reopen them, or reuse their answers for a new feature.</p></div></div>`;
  return head + `<div class="card liblist">${items.map(rec=>{
    const r = assess(openRecord(rec)); const bl = r.safeguards.filter(s=>s.rank===3); const bd = bl.filter(s=>rec.done&&rec.done[s.id]).length;
    return `<div class="librow">
      <span class="libradar" title="Risk radar">${miniRiskRadar(r)}</span>
      <div class="libmain"><b>${esc(rec.name||"Untitled assessment")}</b><span class="note">${esc(labelOf(PLATFORMS,rec.type))} · <span class="mono">${esc(rec.id)}</span> · Updated ${fmtDate(rec.updated)}</span></div>
      <div class="libstat"><span class="pill ${r.posture[1]}">${r.posture[0]}</span><span class="note">${r.risks.length} risks · ${bd}/${bl.length} blockers done</span></div>
      <div class="libact">${confirmDel===rec.id
        ? `<span class="note">Delete permanently?</span><button type="button" class="btn sm danger" data-libdelok="${esc(rec.id)}">Delete</button><button type="button" class="btn sm" data-act="canceldel">Cancel</button>`
        : `<button type="button" class="btn sm primary" data-libopen="${esc(rec.id)}">Open</button>
           <button type="button" class="btn sm" data-libfrom="${esc(rec.id)}" title="Start a new assessment with the same platform answers"><svg><use href="#i-plus"/></svg>New feature</button>
           <button type="button" class="btn sm icon" data-libdup="${esc(rec.id)}" aria-label="Duplicate" title="Duplicate"><svg><use href="#i-copy"/></svg></button>
           <button type="button" class="btn sm icon" data-libdel="${esc(rec.id)}" aria-label="Delete" title="Delete"><svg><use href="#i-trash"/></svg></button>`}</div>
    </div>`;}).join("")}</div>`;
}
function startScreen(){
  const cur = pmCurrentHero();
  return `${cur}
    ${cur ? libraryBlock() : ""}
    <div class="card hero ${cur ? "pm-new" : ""}">
      <div class="hero-main">
        <span class="pill accent" style="justify-self:start">About 3 minutes · ${QS.length} questions</span>
        <h2>${cur ? "Assess another product or feature" : "See how your product could be misused, and what to do about it"}</h2>
        <p>Answer a few plain-language questions about what you're building and who uses it. No trust &amp; safety background needed.</p>
        <div class="row"><button type="button" class="btn primary" data-act="new">Start a new assessment ${icon("arrow")}</button></div>
      </div>
      <div class="hero-side">
        ${heroArt()}
        <ul class="getlist">
          <li><b>Where to start</b><span>Your top five actions, in plain English</span></li>
          <li><b>Every risk, explained</b><span>How serious, how likely, and which answers drove it</span></li>
          <li><b>A launch checklist and the laws that apply</b><span>With owners, effort and jurisdictions</span></li>
        </ul>
      </div>
    </div>
    ${cur ? "" : libraryBlock()}
    <div class="section-title"><h2>Or explore an example</h2><span class="note">Pre-filled answers you can change</span></div>
    <div class="exgrid">${Object.entries(PRESETS).map(([k,p])=>{ const r = assess(Object.assign(blankPM(), p));
      return `<button type="button" class="card excard" data-preset="${k}">
        <span class="row" style="gap:10px;flex-wrap:nowrap"><span class="libicon sm"><svg><use href="#p-${p.type}"/></svg></span><b>${esc(p.name.replace(" (example)",""))}</b></span>
        <span class="note">${esc(labelOf(PLATFORMS,p.type))} · ${esc(QS[2].opts.find(o=>o.k===p.youth).n)}</span>
        <span class="row" style="gap:6px"><span class="pill ${r.posture[1]}">${r.posture[0]} exposure</span><span class="note">${r.risks.length} risks</span></span>
      </button>`;}).join("")}</div>`;
}
function optCard(Q, o, i, pressed, multi){
  const ic = Q.k==="type";
  return `<button type="button" class="ocard opt-key ${multi?"multi":""} ${ic?"iconcard":""}" ${multi?`data-toggle="${Q.k}"`:`data-set="${Q.k}"`} data-v="${o.k}" aria-pressed="${pressed}">
    ${ic?`<svg class="oi"><use href="#p-${o.k}"/></svg>`:""}${i<9?`<kbd>${i+1}</kbd>`:""}<b>${esc(o.n)}</b>${o.h?`<span>${esc(o.h)}</span>`:""}</button>`;
}
function askScreen(){
  const qs = visibleQs();
  pm.qi = Math.max(0, Math.min(pm.qi, qs.length-1));
  const Q = qs[pm.qi], last = pm.qi === qs.length-1;
  if(!pm.qbase || pm.qbase.k !== Q.k){ pm.qbase = qSnap(Q.k); store.set("pm3", pm); }
  let body = "";
  if(Q.kind==="single") body = `<div class="ogrid ${Q.k==="type"?"":"two"}">${Q.opts.map((o,i)=>optCard(Q,o,i,pm[Q.k]===o.k,false)).join("")}</div>`;
  if(Q.kind==="multi"){
    const extra = Q.none ? `<button type="button" class="ocard opt-key" data-none="${Q.k}" aria-pressed="${!pm[Q.k].length && !!pm.answered[Q.k]}">${Q.opts.length<9?`<kbd>${Q.opts.length+1}</kbd>`:""}<b>${Q.none}</b></button>`
      : `<button type="button" class="ocard opt-key" data-all="${Q.k}" aria-pressed="${pm[Q.k].length===Q.opts.length}">${Q.opts.length<9?`<kbd>${Q.opts.length+1}</kbd>`:""}<b>${Q.all}</b></button>`;
    body = `<p class="note" style="margin-bottom:8px">Choose all that apply.</p><div class="ogrid two">${Q.opts.map((o,i)=>optCard(Q,o,i,pm[Q.k].includes(o.k),true)).join("")}${extra}</div>`;
  }
  if(Q.kind==="features"){
    const t = PLATFORMS.find(x=>x.k===pm.type);
    body = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><span class="note">${pm.features.length} selected${t?` · typical for ${esc(t.n.toLowerCase())}`:""}</span>${t?`<button type="button" class="btn sm" data-act="typical">Reset to typical</button>`:""}</div>` +
      FGROUPS.map(([g,ks])=>`<div class="fgroup"><h4>${g}</h4><div class="ogrid">${ks.map(k=>`<button type="button" class="ocard multi" data-toggle="features" data-v="${k}" aria-pressed="${pm.features.includes(k)}"><b>${FEATURES[k][0]}</b><span>${FEATURES[k][1]}</span></button>`).join("")}</div></div>`).join("");
  }
  if(Q.kind==="name") body = `<input class="input" id="pm-name" value="${esc(pm.name)}" placeholder="e.g. Group video calls, or ${esc(labelOf(PLATFORMS,pm.type)||"my product")}" style="max-width:520px;font-size:16px;padding:12px 14px">`;
  const answered = Q.kind==="name" || Q.kind==="features" || pm.answered[Q.k] || qHasValue(Q);
  return `<div class="pm-layout"><div>
    ${pm.fromOrg && pm.qi < 3 ? `<div class="banner"><span><strong>Pre-filled from your workspace settings.</strong> The ${typeof orgPrefillWhat === "function" ? orgPrefillWhat() : "product type and regions are"} set. Change them if this product is different.</span></div>` : ""}
    ${pm.fromProfile?`<div class="banner"><span><strong>Reusing a saved profile.</strong> Your platform answers are filled in. Choose what this feature does, then name it.</span></div>`:""}
    <div class="card askcard">
      <div class="qprog"><span class="eyebrow">${Q.sec}</span><span class="note mono">${pm.qi+1} / ${qs.length}</span></div>
      <div class="bar" style="height:4px"><i style="width:${(pm.qi)/qs.length*100}%;background:var(--accent)"></i></div>
      <h2 class="qtitle">${Q.t} ${Q.tip?tip(Q.tip):""}</h2>
      <p class="qhelp" style="margin-bottom:18px">${Q.h}</p>
      ${body}
      <div class="stepnav">
        ${pm.qi>0?`<button type="button" class="btn" data-back="1">Back</button>`:`<button type="button" class="btn" data-act="home">Cancel</button>`}
        <button type="button" class="btn primary" data-next="1">${last?"See my report":answered?"Next":"Skip for now"} ${icon("arrow")}</button>
      </div>
    </div>
    <p class="note keyhint">Keyboard: number keys select an answer, Enter continues.</p>
  </div>${livePanel(assess(pm))}</div>`;
}
function impactBox(r){
  const qs = visibleQs(), Q = qs[Math.max(0, Math.min(pm.qi, qs.length-1))], base = pm.qbase;
  const box = (h, inner) => `<div class="impact"><div class="eyebrow" style="margin-bottom:6px">${h}</div>${inner}</div>`;
  if(!pm.type) return box("How this works", `<p class="note">Your first answer gives you a starting list of risks for that kind of product. Each answer after that adds, removes or re-rates them, and you'll see the effect here.</p>`);
  const top = r.risks.slice().sort((a,b)=>b.score-a.score).slice(0,3);
  if(!base || !Object.keys(base.bands).length) return box("Your starting point", `<p class="note" style="margin-bottom:8px">${r.risks.length} risks are common for ${esc((labelOf(PLATFORMS,pm.type)||"this kind of product").toLowerCase())}. The next questions narrow them down to your product.</p>
    <div class="imp"><b>Most serious so far</b>${top.map(x=>`<span>${pill(x.band)} ${esc(x.n)}</span>`).join("")}</div>`);
  if(Q.kind==="single" || Q.kind==="multi"){ if(!pm.answered[Q.k]) return box("This question", `<p class="note">Pick an answer to see how it changes your risks.</p>`); }
  const now = Object.fromEntries(r.risks.map(x=>[x.id, x])), rank = b => BANDS[b][2];
  const im = {
    added: r.risks.filter(x=>!base.bands[x.id]).map(x=>[x.n,x.band]),
    removed: HARMS.filter(h=>base.bands[h.id] && !now[h.id]).map(h=>[h.n,base.bands[h.id]]),
    raised: r.risks.filter(x=>base.bands[x.id] && rank(x.band) > rank(base.bands[x.id])).map(x=>[x.n,x.band]),
    lowered: r.risks.filter(x=>base.bands[x.id] && rank(x.band) < rank(base.bands[x.id])).map(x=>[x.n,x.band])
  };
  const laws = r.obligations.filter(o=>o.status==="applies").map(o=>o.id || o.n), lawsUp = laws.filter(x=>!base.laws.includes(x)).length, lawsDn = base.laws.filter(x=>!laws.includes(x)).length;
  const lines = [];
  if(im.added.length) lines.push(`<div class="imp up"><b>+${im.added.length} risk${im.added.length===1?"":"s"}</b>${im.added.slice().sort((a,b)=>BANDS[b[1]][2]-BANDS[a[1]][2]).slice(0,3).map(x=>`<span>${pill(x[1])} ${esc(x[0])}</span>`).join("")}</div>`);
  if(im.raised.length) lines.push(`<div class="imp up"><b>${im.raised.length} rated higher</b>${im.raised.slice(0,2).map(x=>`<span>${pill(x[1])} ${esc(x[0])}</span>`).join("")}</div>`);
  if(im.removed.length) lines.push(`<div class="imp dn"><b>−${im.removed.length} risk${im.removed.length===1?"":"s"} no longer apply</b>${im.removed.slice(0,2).map(x=>`<span>${esc(x[0])}</span>`).join("")}</div>`);
  if(im.lowered.length) lines.push(`<div class="imp dn"><b>${im.lowered.length} rated lower</b>${im.lowered.slice(0,2).map(x=>`<span>${pill(x[1])} ${esc(x[0])}</span>`).join("")}</div>`);
  if(lawsUp) lines.push(`<div class="imp up"><b>+${lawsUp} law${lawsUp===1?"":"s"} likely appl${lawsUp===1?"ies":"y"}</b></div>`);
  if(lawsDn) lines.push(`<div class="imp dn"><b>${lawsDn} law${lawsDn===1?" no longer applies":"s no longer apply"}</b></div>`);
  const none = Q.kind==="name" ? "The name only labels your report." : Q.kind==="features" ? "Add or remove features to see how your risks change." : "This answer didn't add or re-rate any risks.";
  return box("What this answer changed", lines.length ? lines.join("") : `<p class="note">${none}</p>`);
}
function livePanel(r){
  const total = r.risks.length || 1;
  return `<aside class="card live" aria-label="Your risk picture" aria-live="polite">
    <div class="row" style="justify-content:space-between"><h3>Your risk picture ${tip("Updates as you answer. Each risk is scored severity × likelihood; critical means 12 or more out of 16.","tip-r")}</h3><span class="pill ${r.posture[1]}">${r.posture[0]}</span></div>
    ${["crit","high","med","low"].map(b=>`<div class="countrow"><span>${BANDS[b][0]}</span><div class="bar"><i style="width:${r.counts[b]/total*100}%;background:var(--${b==="low"?"line-strong":b})"></i></div><span class="mono">${r.counts[b]}</span></div>`).join("")}
    ${pm.stage==="ask" ? impactBox(r) : ""}
    ${pm.type?`<button type="button" class="btn" data-act="report">See report now</button>`:""}
  </aside>`;
}

/* ---------- page ---------- */
function renderPremortem(){
  const active = document.activeElement;
  const activeId = active && active.id, caret = active && typeof active.selectionStart==="number" ? active.selectionStart : null;
  const refocus = active && active.dataset && (active.dataset.set||active.dataset.toggle) ? `[data-${active.dataset.set?"set":"toggle"}="${active.dataset.set||active.dataset.toggle}"][data-v="${active.dataset.v}"]` : null;
  let actions = "";
  if(pm.stage!=="start") actions += `<button type="button" class="btn sm" data-act="home"><svg><use href="#i-folder"/></svg>Saved pre-mortems</button>`;
  if(pm.stage==="report"){
    actions += `<button type="button" class="btn sm" data-act="new"><svg><use href="#i-plus"/></svg>New</button>`;
    actions += pm.saved ? `<span class="savedtag"><svg><use href="#i-check"/></svg>Saved</span>` : `<button type="button" class="btn sm" data-act="save"><svg><use href="#i-save"/></svg>${pm.example?"Save a copy":"Save"}</button>`;
    actions += `<button type="button" class="btn sm" data-act="tasks"><svg><use href="#i-send"/></svg>Send to tracker</button>`;
    actions += DL ? `<button type="button" class="btn sm primary" data-act="download"><svg><use href="#i-download"/></svg>Download report</button>`
                  : `<button type="button" class="btn sm primary" data-act="copy">${icon("copy")}Copy report</button>`;
  }
  view.innerHTML = (pm.stage === "start" ? head("Abuse pre-mortem",
    "Find out how a product or feature could be misused before it launches, and what to do about it.",
    "Build safely", actions) : headCompact("Abuse pre-mortem", pm.stage === "ask" ? (pm.name ? esc(pm.name) : pm.fromProfile ? "New feature" : "New assessment") : esc(pm.name || "Untitled assessment"), actions)) + `
    <div id="pm-root">
      <span class="toast" id="pm-toast" aria-live="polite"></span>
      ${pm.stage==="start" ? startScreen() : pm.stage==="ask" ? askScreen() : renderReport(assess(pm))}
    </div>`;
  bindPremortem();
  if(pm.stage==="start" && typeof bindRadar === "function") bindRadar();
  if(pm.flash){ const t = $("#pm-toast"); if(t){ t.textContent = pm.flash; setTimeout(()=>{ t.textContent=""; }, 3500); } pm.flash = null; }
  if(refocus){ const el = $(refocus); if(el) el.focus(); }
  else if(activeId && document.getElementById(activeId)){ const el = document.getElementById(activeId); el.focus(); if(caret!==null && el.setSelectionRange) try{ el.setSelectionRange(caret, caret); }catch(e){} }
  else if(pm.stage==="ask"){ const n = $("#pm-name"); if(n) n.focus(); }
}
// A question showing a selection (a default, or a pre-fill from workspace settings) counts as answered once the person moves on
const qHasValue = Q => Q.kind === "single" ? !!pm[Q.k] : Q.kind === "multi" ? pm[Q.k].length > 0 : false;
function goNext(){
  const qs = visibleQs(), Q = qs[pm.qi];
  if(Q && qHasValue(Q)) pm.answered[Q.k] = true;
  if(pm.fromProfile && Q && Q.k==="features"){ pm.qi = qs.findIndex(q=>q.k==="name"); }
  else if(pm.qi >= qs.length-1){
    pm.stage = "report"; pm.fromProfile = false;
    if(!pm.example){ const first = !pm.saved; saveToLib(); if(first) pm.flash = "Saved to your workspace"; }
  }
  else pm.qi++;
  savePM(); renderPremortem(); window.scrollTo(0,0);
}
function goToQuestion(k){
  const idx = visibleQs().findIndex(q=>q.k===k);
  pm.stage = "ask"; pm.qi = Math.max(0, idx); savePM(); renderPremortem(); window.scrollTo(0,0);
}
function bindPremortem(){
  const root = $("#pm-root");
  const toast = m => { const t = $("#pm-toast"); if(t){ t.textContent = m; setTimeout(()=>{ t.textContent=""; }, 3500); } };
  const rerender = () => { savePM(); renderPremortem(); };
  const handle = e => {
    const b = e.target.closest("button"); if(!b) return;
    const d = b.dataset;
    if(d.set){ const k = d.set, v = d.v; withImpact(() => { if(k==="type") setType(v); else pm[k] = v; }); pm.answered[k] = true; return rerender(); }
    if(d.toggle){ const k = d.toggle; withImpact(() => { const a = pm[k]; pm[k] = a.includes(d.v) ? a.filter(x=>x!==d.v) : a.concat(d.v); }); pm.answered[k] = true; return rerender(); }
    if(d.none){ withImpact(() => { pm[d.none] = []; }); pm.answered[d.none] = true; return rerender(); }
    if(d.all){ const Q = QS.find(q=>q.k===d.all); withImpact(() => { pm[d.all] = pm[d.all].length===Q.opts.length ? [] : Q.opts.map(o=>o.k); }); pm.answered[d.all] = true; return rerender(); }
    if(d.next) return goNext();
    if(d.back){ pm.qi = Math.max(0, pm.qi-1); return rerender(); }
    if(d.goq) return goToQuestion(d.goq);
    if(d.preset){ pm = fromPreset(d.preset); return rerender(); }
    if(d.libopen){ const rec = libLoad()[d.libopen]; if(rec){ pm = openRecord(rec, {stage:"report"}); pm.base = pmSnap(pm); } return rerender(); }
    if(d.libdup){ const rec = libLoad()[d.libdup]; if(rec){ pm = openRecord(rec, {id:null, saved:false, created:null, name:(rec.name||"Untitled")+" (copy)", stage:"report"}); saveToLib(); pm.flash = "Duplicated"; } return rerender(); }
    if(d.libfrom){ const rec = libLoad()[d.libfrom]; if(rec){ const base = blankPM(); PROFILE_KEYS.forEach(k=>{ if(rec[k]!==undefined) base[k]=JSON.parse(JSON.stringify(rec[k])); }); QS.forEach(q=>base.answered[q.k]=true); pm = Object.assign(base, {stage:"ask", fromProfile:true}); pm.qi = visibleQs().findIndex(q=>q.k==="features"); } return rerender(); }
    if(d.libdel){ confirmDel = d.libdel; return renderPremortem(); }
    if(d.libdelok){ const lib = libLoad(); delete lib[d.libdelok]; libSave(lib); if(pm.id===d.libdelok){ pm.saved = false; pm.id = null; } confirmDel = null; pm.flash = "Assessment deleted"; return rerender(); }
    if(d.tab){ pm.tab = d.tab; return rerender(); }
    if(d.rview){ pm.rview = d.rview; return rerender(); }
    if(d.mview){ pm.mview = d.mview === "res" ? "res" : ""; pm.filter.cell = ""; return rerender(); }
    if(d.group){ pm.group = d.group; return rerender(); }
    if(d.cell!==undefined){ pm.filter.cell = pm.filter.cell===d.cell ? "" : d.cell; pm.tab = "register"; return rerender(); }
    if(d.cat!==undefined){ pm.filter.cat = pm.filter.cat===d.cat ? "" : d.cat; pm.tab = "register"; return rerender(); }
    switch(d.act){
      case "new": pm = orgPrefillPM(blankPM()); return rerender();
      case "report": pm.stage = "report";
        // Leaving the questions early still keeps the work, so a later New never drops it
        if(!pm.example && !pm.saved){ if(!pm.name) pm.name = (labelOf(PLATFORMS, pm.type) || "Product") + " (draft)"; saveToLib(); pm.flash = "Saved to your workspace. Click any answer to change it"; }
        return rerender();
      case "tasks": return tkOpen("premortem");
      case "plan": pm.stage = "report"; pm.tab = "plan"; rerender(); setTimeout(() => { const el = $("#pm-tabs"); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }, 60); return;
      case "home": confirmDel = null; pm.stage = "start"; return rerender();
      case "canceldel": confirmDel = null; return renderPremortem();
      case "save": { const wasExample = pm.example; if(wasExample){ pm = openRecord(recordOf(pm), {id:null, saved:false, created:null, name:(pm.name||"").replace(" (example)","")+" (my copy)", stage:"report"}); } saveToLib(); pm.flash = "Saved to your workspace"; return rerender(); }
      case "typical": { const t = PLATFORMS.find(x=>x.k===pm.type); if(t){ withImpact(() => { pm.features = t.f.slice(); }); } return rerender(); }
      case "clearfilter": pm.filter = {cell:"",cat:"",band:""}; pm.search = ""; return rerender();
      case "fullplan": pm.tab = "plan"; rerender(); { const el = $("#pm-tabs"); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); } return;
      case "copy": return copyText(reportMarkdown(assess(pm)), $("#pm-toast"));
      case "download": { const md = reportMarkdown(assess(pm)); return offerFile(slug(pm.name)+"-abuse-premortem.md", md, md, $("#pm-toast")); }
      case "export": return exportLibrary($("#pm-toast"));
    }
  };
  root.addEventListener("click", handle);
  $$(".headmeta button").forEach(b => b.addEventListener("click", handle));
  root.addEventListener("change", e => {
    const t = e.target;
    if(t.dataset.sg){ pm.done[t.dataset.sg] = t.checked; rerender(); }
    if(t.id==="lib-import" && t.files && t.files[0]){ importLibrary(t.files[0], msg => { pm.flash = msg; renderPremortem(); }); }
  });
  root.addEventListener("input", e => {
    const t = e.target;
    if(t.id==="pm-name"){ pm.name = t.value; savePM(); }
    if(t.dataset.note){ pm.notes[t.dataset.note] = t.value; savePM(); }
    if(t.id==="rg-search"){ pm.search = t.value; rerender(); }
  });
  // <details> toggle does not bubble, so listen in the capture phase and remember what is open.
  root.addEventListener("toggle", e => { const k = e.target.dataset && e.target.dataset.open; if(k){ pm.open = pm.open || {}; pm.open[k] = e.target.open; store.set("pm3", pm); } }, true);
}
document.addEventListener("keydown", e => {
  if(location.hash.slice(1)!=="premortem" || pm.stage!=="ask" || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target.tagName||"").toLowerCase();
  if(tag==="input" || tag==="textarea" || tag==="select"){ if(e.key==="Enter" && e.target.id==="pm-name"){ e.preventDefault(); goNext(); } return; }
  if(/^[1-9]$/.test(e.key)){ const btn = $$("#pm-root .opt-key")[+e.key-1]; if(btn){ e.preventDefault(); btn.click(); } }
  else if(e.key==="Enter" && tag!=="button" && tag!=="a" && tag!=="summary"){ e.preventDefault(); goNext(); }
});
