/* =========================================================
   SHELL: sidebar state, top bar, mobile nav, command palette
   ========================================================= */
const TOOL_COLOR = {redteam:"var(--t-rt)", coppa:"var(--t-cp)", grooming:"var(--t-gp)", reporting:"var(--t-cr)", dsa:"var(--t-ds)", eval:"var(--t-ai)", transparency:"var(--t-ai)", premortem:"var(--t-pm)", tabletop:"var(--t-tt)", postmortem:"var(--t-tt)", metrics:"var(--t-mx)", vendors:"var(--t-vd)", policy:"var(--t-pol)", maturity:"var(--t-ma)", coverage:"var(--t-cv)", learn:"var(--accent)"};
const ROUTE_LABEL = {overview:"Your assessment", tools:"All tools", plan:"Your plan", review:"Quarter by quarter", dsa:"DSA readiness", eval:"Classifier eval", workspace:"My workspace", premortem:"Abuse pre-mortem", tabletop:"Incident tabletop", postmortem:"Incident post-mortem", metrics:"Metrics framework", vendors:"Vendor scorecard", maturity:"Program maturity", coverage:"Coverage radar", policy:"Policy stress-tester", coppa:"COPPA readiness", grooming:"Grooming pathway review", reporting:"Child-safety reporting", notice:"Enforcement notice writer", appeal:"Appeal reviewer", transparency:"Transparency report", about:"About this project", roost:"Works with ROOST", credits:"Built with", learn:"Learn", redteam:"Red team studio", redteamllm:"Red teaming LLMs", redteamworld:"Red teaming world models", glossary:"Glossary and practice", tsglossary:"T&S glossary"};
// One-line summaries for the page description, per route (the same lines as the All tools cards, plain
// text). The three AI assistants take theirs from AI_TOOLS. Any route not listed here, and the home page,
// fall back to the site description captured at load.
const ROUTE_DESC = {
  tools:"Every tool in the workbench, to use on its own, from program maturity to AI assistants. Free and private.",
  plan:"Your assessment results turned into one prioritized plan, with owners and next steps.",
  review:"Your plan, quarter by quarter: what to do first and what can wait.",
  workspace:"Everything you have saved in the workbench, kept on your own device.",
  maturity:"Rate your Trust & Safety program in eight areas and get a roadmap for the biggest gaps.",
  premortem:"Profile a product and see how it will be misused before launch.",
  coverage:"See where your products' risk outruns the defenses you have in place.",
  tabletop:"Rehearse a crisis and learn from every call, with the law behind it.",
  postmortem:"After a real incident, write a blameless post-mortem in fifteen minutes: a one-page document, a grade for the response, and three actions with owners and dates.",
  policy:"Paste a rule to find vague words, missing exceptions and hard edge cases.",
  coppa:"Check children's privacy against the amended COPPA Rule, with drafts for Legal.",
  grooming:"See how an adult could reach a child through your product's features, and what's in the way at each of six stages.",
  reporting:"Check whether you can remove, preserve, report and handle the account when you find child sexual exploitation, market by market.",
  dsa:"Which EU DSA duties apply to you, article by article, with drafts for Legal.",
  vendors:"Choose a moderation vendor on evidence, with RFP questions.",
  eval:"Build a labeled test set from a rule and see where a classifier fails.",
  metrics:"The numbers a T&S program runs on, and how to measure each one.",
  redteam:"Test your own AI feature for harm the way real red teams do, ending in findings and a one-page summary.",
  learn:"Guides, drills, worksheets and glossaries for Trust & Safety work, starting with red teaming AI.",
  redteamllm:"The method for red teaming language models in nine steps, with drills to run with your team, worksheets and sources.",
  redteamworld:"Red teaming video, image-to-video and interactive world models: uploads, scene steering, style and provenance.",
  glossary:"Red teaming terms in plain words, with flashcards and a quiz.",
  tsglossary:"Everyday Trust and Safety terms, from strike to statement of reasons, in plain words.",
  about:"About the T&S Workbench: who built it, how the tools fit together, and the decisions behind them.",
  roost:"ROOST makes free, open-source trust and safety tools. The workbench helps you decide what to build; ROOST's tools are what you can build with.",
  credits:"The models, tools, services and public sources the workbench uses or names, who made each one, and on what terms."
};
// Route name -> tab title and meta description, so each tool is findable and bookmarkable by name.
// The base title and description are read from the page once, so the home page stays as published.
const seoBase = {};
function seoFor(name){
  if(!seoBase.title){
    seoBase.title = document.title;
    const m = document.querySelector('meta[name="description"]');
    seoBase.desc = m ? m.getAttribute("content") : "";
  }
  const home = name === "overview" || !ROUTE_LABEL[name];
  const ai = typeof AI_TOOLS !== "undefined" && AI_TOOLS[name] && AI_TOOLS[name].desc;
  return {
    title: home ? seoBase.title : ROUTE_LABEL[name] + " · T&S Workbench",
    desc: home ? seoBase.desc : (ROUTE_DESC[name] || ai || seoBase.desc)
  };
}
function seoUpdate(name){
  if(typeof document === "undefined" || !document.querySelector) return;
  try{
    const t = seoFor(name);
    document.title = t.title;
    const m = document.querySelector('meta[name="description"]');
    if(m && t.desc) m.setAttribute("content", t.desc);
    // Canonical link: the page's own path (home is the root). Needs the site's address from og:url.
    const og = document.querySelector('meta[property="og:url"]'), root = og && og.getAttribute("content");
    if(root){
      let c = document.querySelector('link[rel="canonical"]');
      if(!c && document.createElement && document.head){ c = document.createElement("link"); c.setAttribute("rel", "canonical"); document.head.appendChild(c); }
      if(c) c.setAttribute("href", name === "overview" || !ROUTE_LABEL[name] ? root : root + name);
    }
  }catch(e){}
}
// The tools, one entry per route, in the order the About page lists them. The single source for "how many tools":
// the About page counts it, the home-page heading and the READMEs read it from this line (_build/gen-readmes.js
// parses it). The guides, glossaries, plan and review pages are not tools. Add a new tool here, to ROUTE_LABEL and to AB_GROUPS.
const TOOL_ROUTES = ["maturity","coverage","premortem","coppa","grooming","reporting","dsa","tabletop","postmortem","vendors","redteam","policy","eval","metrics","notice","appeal","transparency"];
const initials2 = s => (s||"").trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
function gsay(msg){ const t = $("#gtoast"); if(!t) return; t.textContent = msg; t.hidden = false; clearTimeout(gsay.t); gsay.t = setTimeout(()=>{ t.hidden = true; }, 2400); }
function relTime(t){
  if(!t) return ""; const s = Math.max(0, (Date.now()-t)/1000);
  if(s < 60) return "now"; if(s < 3600) return Math.floor(s/60)+"m"; if(s < 86400) return Math.floor(s/3600)+"h";
  if(s < 604800) return Math.floor(s/86400)+"d"; return Math.floor(s/604800)+"w";
}
function openSaved(id){
  const it = wsItems()[id]; if(!it) return;
  // On the public page the red team studio and the Learn guides are separate scripts; load the one this item needs first
  if(typeof lazyEnsure === "function" && ((it.kind==="redteam" && typeof RT_BLANK === "undefined") || (it.kind==="learn" && typeof LN_GUIDES === "undefined")))
    return lazyEnsure(it.kind==="redteam" ? "redteam" : "learn").then(() => openSaved(id), () => { if(typeof gsay === "function") gsay("Could not load that section. Check your connection and try again."); });
  if(it.kind==="premortem"){ pm = openRecord(Object.assign({}, it.data, {id:it.id}), {stage:"report"}); pm.base = typeof pmSnap === "function" ? pmSnap(pm) : null; savePM(); }
  if(it.kind==="postmortem"){ px = Object.assign(PX_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); pxSave(); store.set("ws:cur:postmortem", it.id); }
  if(it.kind==="tabletop"){ tt = JSON.parse(JSON.stringify(it.data)); store.set("tt", tt); }
  if(it.kind==="metrics"){ mx = JSON.parse(JSON.stringify(it.data)); store.set("mx", mx); store.set("ws:cur:metrics", it.id); }
  if(it.kind==="vendors"){ vx = JSON.parse(JSON.stringify(it.data)); store.set("vx", vx); store.set("ws:cur:vendors", it.id); }
  if(it.kind==="policy"){ pol = JSON.parse(JSON.stringify(it.data)); store.set("pol", pol); store.set("ws:cur:policy", it.id); }
  if(it.kind==="maturity"){ ma = maInit(JSON.parse(JSON.stringify(it.data))); store.set("ma", ma); store.set("ws:cur:maturity", it.id); }
  if(it.kind==="coverage"){ cv = JSON.parse(JSON.stringify(it.data)); store.set("cv", cv); store.set("ws:cur:coverage", it.id); }
  if(it.kind==="transparency"){ tr = Object.assign(TR_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); store.set("tr", tr); store.set("ws:cur:transparency", it.id); }
  if(it.kind==="coppa"){ cp = Object.assign(CP_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); cpSave(); store.set("ws:cur:coppa", it.id); }
  if(it.kind==="dsa"){ ds = Object.assign(DS_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); dsSave(); store.set("ws:cur:dsa", it.id); }
  if(it.kind==="grooming"){ gp = Object.assign(GP_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); gpSave(); store.set("ws:cur:grooming", it.id); }
  if(it.kind==="reporting"){ cr = Object.assign(CR_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); crSave(); store.set("ws:cur:reporting", it.id); }
  if(it.kind==="redteam"){ rt = Object.assign(RT_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); rtSave(); store.set("ws:cur:redteam", it.id); }
  if(it.kind==="eval"){ ev = Object.assign(EV_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); evView = "page"; evSave(); store.set("ws:cur:eval", it.id); }
  // learn: not a goRoute(KINDS[it.kind].route) case -- that fires ROUTES[r]() verbatim, with no "/" split, and
  // throws if the hash is already exactly this one; jump to the guide's Practice tab at the saved exercise instead.
  if(it.kind==="learn"){
    const k = it.data.guide === "world" ? "world" : "llm", g = LN_GUIDES[k], i = g.exercises.findIndex(e => e.id === it.data.exId);
    if(i >= 0) lnStore.set(k + ":epos", i);
    const h = g.route + "/practice";
    if(hashNow() === h) renderRedteam(k); else goHash(h);
    return;
  }
  goRoute(KINDS[it.kind].route);
}
// Move keyboard and screen-reader focus to new content without jumping the page
function focusQuiet(el){ if(!el || !el.focus) return; if(!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
const focusLost = () => !document.activeElement || document.activeElement === document.body;
function newAssessment(){ pm = orgPrefillPM(Object.assign(blankPM(), {projectId:wsActive()})); store.set("pm3", pm); goRoute("premortem"); }
function shellUpdate(name){
  seoUpdate(name);
  if(document.body && document.body.dataset) document.body.dataset.route = name;
  if(typeof JOURNEY !== "undefined"){ const n = $("#sb-assess-n"), done = JOURNEY.filter(s => { try{ return s.done(); }catch(e){ return false; } }).length;
    if(n) n.textContent = done ? `${done}/${JOURNEY.length}` : "";
    $$("#sb-assess .navlink[data-step]").forEach(a => { const st = JOURNEY[+a.dataset.step - 1]; let ok = false; try{ ok = !!(st && st.done()); }catch(e){} a.classList.toggle("done", ok); }); }
  const here = $("#tb-here"); if(here) here.textContent = ROUTE_LABEL[name] || "";
  const bg = {overview:"home", premortem:"assess", maturity:"assess", coverage:"assess", coppa:"assess", grooming:"assess", reporting:"assess", dsa:"assess", tabletop:"prepare", postmortem:"prepare", vendors:"prepare", policy:"prepare", workspace:"saved"}[name] || "more";
  $$(".bnav [data-bgroup]").forEach(a => { const on = a.dataset.bgroup === bg; if(a.tagName === "A"){ if(on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); } else a.classList.toggle("on", on); });
  const items = Object.values(wsItems()).filter(i=>KINDS[i.kind]).sort((a,b)=>(b.updated||0)-(a.updated||0));
  const cw = $("#sb-cnt-ws"); if(cw) cw.textContent = items.length || "";
  const ct = $("#sb-cnt-tt"); if(ct){ ct.textContent = SCENARIOS.length; ct.title = `${SCENARIOS.length} scenarios available`; }
  const pins = $("#sb-pins"), ph = $("#sb-pin-h");
  if(pins){
    const top = items.slice(0,3);
    ph.hidden = !top.length;
    pins.innerHTML = top.map(it=>`<button type="button" class="sb-pin" data-open="${esc(it.id)}"><span class="sdot" style="background:${TOOL_COLOR[it.kind]}"></span><span>${esc(it.title||"Untitled")}</span></button>`).join("");
    pins.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openSaved(b.dataset.open));
  }
  const p = wsProfile(), me = $("#sb-me");
  if(me) me.innerHTML = `<span class="sb-av">${esc(initials2(p&&p.name) || "+")}</span><span style="min-width:0"><b>${esc(p&&p.name || "Set up your profile")}</b><small>${esc(p ? ([p.role,p.org].filter(Boolean).join(" · ") || "Add your role") : "Name, role and team")}</small></span>`;
  const ws = $("#sb-ws"); if(ws) ws.textContent = (p && p.org) || "Your workspace";
  if(typeof pfStatusRender === "function") pfStatusRender();
  const app = $("#app"); if(app) app.classList.remove("nav-open");
}

/* ---------- command palette ---------- */
function cmdkItems(){
  const out = [];
  const go = (label, route, color, iconId) => out.push({g:"Go to", label, sub:"", keys:route, color, tone:TOOL_TONE[route] || "neutral", icon:iconId, run:()=>goRoute(route)});
  go("Your assessment","overview","var(--faint)","home"); go("All tools","tools","var(--faint)","layers"); go("Your plan","plan","var(--accent)","send"); go("Quarter by quarter","review","var(--faint)","chart"); go("My workspace","workspace","var(--faint)","user");
  go("Abuse pre-mortem","premortem","var(--t-pm)","radar"); go("Incident tabletop","tabletop","var(--t-tt)","siren"); go("Incident post-mortem","postmortem","var(--t-tt)","doc");
  go("Metrics framework","metrics","var(--t-mx)","gauge"); go("Vendor scorecard","vendors","var(--t-vd)","scale"); go("Program maturity","maturity","var(--t-ma)","steps"); go("Coverage radar","coverage","var(--t-cv)","cover");
  go("Policy stress-tester","policy","var(--t-pol)","doc");
  go("COPPA readiness","coppa","var(--t-cp)","coppa"); go("Grooming pathway review","grooming","var(--t-gp)","route"); go("Child-safety reporting","reporting","var(--t-cr)","flag"); go("DSA readiness","dsa","var(--t-ds)","dsa"); go("Classifier eval","eval","var(--t-ai)","eval");
  go("Enforcement notice writer","notice","var(--t-ai)","mail"); go("Appeal reviewer","appeal","var(--t-ai)","appeal"); go("Transparency report","transparency","var(--t-ai)","chart");
  go("Red team studio","redteam","var(--t-rt)","shield");
  go("Learn","learn","var(--accent)","book"); go("Red teaming LLMs","redteamllm","var(--t-ai)","shield"); go("Red teaming world models","redteamworld","#E0532F","world"); go("Glossary and practice","glossary","var(--accent)","glossary"); go("T&S glossary","tsglossary","var(--accent)","glossary");
  go("Works with ROOST","roost","var(--accent)","plug"); go("About this project","about","var(--faint)","info"); go("Built with: credits and sources","credits","var(--faint)","wrench");
  if(typeof demoOn === "function") out.push({g:"Go to", label:demoOn() ? "Exit the demo company" : "Explore a demo company", sub:demoOn() ? "Bring back your own work" : "Every tool filled in for a fictional company", color:"var(--accent)", icon:"layers", run:() => demoOn() ? demoExit() : demoStart()});
  if(typeof helpTour === "function"){
    out.push({g:"Actions", label:"How this page works", sub:"A short tour of the page you're on", color:"var(--accent)", icon:"info", run:() => helpTour()});
  }
  out.push({g:"Actions", label:"New pre-mortem assessment", sub:"", color:"var(--accent)", icon:"plus", run:newAssessment});
  out.push({g:"Actions", label:"Switch theme", sub:"Light, dark or auto", color:"var(--faint)", icon:"moon", run:()=>{ const order = ["light","dark","system"]; const cur = store.get("theme","light"); const nx = order[(order.indexOf(cur)+1)%3]; store.set("theme", nx); applyTheme(nx); gsay(nx==="system" ? "Theme matches your device" : `${nx[0].toUpperCase()+nx.slice(1)} theme on`); }});
  Object.values(wsItems()).filter(i=>KINDS[i.kind]).sort((a,b)=>(b.updated||0)-(a.updated||0)).forEach(it =>
    out.push({g:"Your saved work", label:it.title||"Untitled", sub:KINDS[it.kind].n, color:TOOL_COLOR[it.kind], tone:TOOL_TONE[it.kind] || "neutral", icon:KINDS[it.kind].icon.replace("i-",""), run:()=>openSaved(it.id)}));
  if(typeof mxList === "function") mxList().forEach(m => out.push({g:"Metrics", label:m.n, sub:MX_Q[m.n] || "", color:"var(--t-mx)", tone:"measure", icon:"gauge", run:()=>{ goHash("metrics/" + mxSlug(m)); }}));
  const type = ttCompanyType();
  SCENARIOS.forEach((s,i) => { if(type!=="all" && !(s.types||[]).includes(type)) return; const v = ttScenario(i, type);
    out.push({g:"Tabletop scenarios", label:v.title, sub:v.tailored ? "Tailored" : (TT_TYPES.find(t=>t.k===(s.types||[])[0])||{n:""}).n, color:"var(--t-tt)", tone:"assess", icon:"siren", run:()=>{ ttStart(i, type); goRoute("tabletop"); }}); });
  if(CMDK_HB.status === "done"){
    CMDK_HB.chapters.forEach(c => out.push({g:"Handbook", label:c.title||"", sub:c.summary||"", color:"var(--faint)", icon:"doc", run:()=>{ location.href = c.url; }}));
    CMDK_HB.posts.forEach(p => out.push({g:"Writing", label:p.title||"", sub:p.summary||"", color:"var(--faint)", icon:"info", run:()=>{ location.href = p.url; }}));
  }
  return out;
}
// Cross-site search index (handbook chapters and writing posts), fetched once on first palette open and cached in memory.
// status: idle -> loading -> done, or error (no extra groups, never shown to the user as an error).
let CMDK_HB = {status:"idle", chapters:[], posts:[]};
function cmdkHbLoad(){
  if(CMDK_HB.status !== "idle") return;
  CMDK_HB.status = "loading";
  fetch("https://stevenmacchia.com/ts-handbook/search.json").then(r => { if(!r.ok) throw new Error("bad status"); return r.json(); })
    .then(data => {
      const items = Array.isArray(data && data.items) ? data.items : [];
      CMDK_HB.chapters = items.filter(x => x && x.kind === "chapter" && x.title && x.url);
      CMDK_HB.posts = items.filter(x => x && x.kind === "post" && x.title && x.url);
      CMDK_HB.status = "done";
    })
    .catch(() => { CMDK_HB.status = "error"; })
    .then(() => { if($("#cmdk") && !$("#cmdk").hidden){ cmdk.items = cmdkItems(); cmdkDraw(); } });
}
let cmdk = {items:[], shown:[], sel:0, prevFocus:null};
function cmdkDraw(){
  const q = $("#cmdk-q").value.trim().toLowerCase();
  // Matches the label, the group, the route name ("premortem") and a copy with hyphens taken out, so "premortem" finds "Abuse pre-mortem"
  const hay = x => { const s = (x.label+" "+x.sub+" "+x.g+" "+(x.keys || "")).toLowerCase(); return s + " " + s.replace(/-/g, ""); };
  cmdk.shown = cmdk.items.filter(x => !q || hay(x).includes(q)).slice(0, 60);
  cmdk.sel = Math.min(cmdk.sel, Math.max(0, cmdk.shown.length-1));
  let g = "", h = "";
  cmdk.shown.forEach((x,i) => { if(x.g!==g){ g = x.g; h += `<li class="grp" role="presentation">${esc(g)}</li>`; }
    h += `<li class="it" role="option" id="cmdk-o${i}" data-i="${i}" aria-selected="${i===cmdk.sel}">${tileHTML(x.icon, x.tone || "neutral", "sm")}<span class="lbl">${esc(x.label)}</span>${x.sub?`<small>${esc(x.sub)}</small>`:""}</li>`; });
  if(CMDK_HB.status === "loading" && !q) h += `<li class="grp" role="presentation">Handbook</li><li class="cmdk-wait" role="presentation">Searching the handbook…</li>`;
  const list = $("#cmdk-list"); list.innerHTML = h || `<li class="grp">No matches. Try a tool, scenario or saved result.</li>`;
  $("#cmdk-q").setAttribute("aria-activedescendant", cmdk.shown.length ? "cmdk-o"+cmdk.sel : "");
  list.querySelectorAll(".it").forEach(li => { li.onmousemove = () => { if(cmdk.sel!==+li.dataset.i){ cmdk.sel = +li.dataset.i; cmdkDraw(); } }; li.onclick = () => { cmdk.sel = +li.dataset.i; cmdkPick(); }; });
  const cur = list.querySelector('[aria-selected="true"]'); if(cur && cur.scrollIntoView) cur.scrollIntoView({block:"nearest"});
}
function cmdkOpen(){ cmdk.prevFocus = document.activeElement; cmdk.items = cmdkItems(); cmdk.sel = 0; $("#cmdk").hidden = false; const q = $("#cmdk-q"); q.value = ""; cmdkDraw(); q.focus(); cmdkHbLoad(); }
function cmdkClose(){ $("#cmdk").hidden = true; if(cmdk.prevFocus && cmdk.prevFocus.focus) try{ cmdk.prevFocus.focus(); }catch(e){} }
function cmdkPick(){ const x = cmdk.shown[cmdk.sel]; $("#cmdk").hidden = true; if(x && x.run) x.run(); }
$$("[data-cmdk]").forEach(b => b.addEventListener("click", cmdkOpen));
$("#cmdk-q").addEventListener("input", () => { cmdk.sel = 0; cmdkDraw(); });
$("#cmdk").addEventListener("click", e => { if(e.target.id==="cmdk") cmdkClose(); });
document.addEventListener("keydown", e => {
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); $("#cmdk").hidden ? cmdkOpen() : cmdkClose(); return; }
  if($("#cmdk").hidden) return;
  if(e.key==="Escape"){ e.preventDefault(); cmdkClose(); }
  else if(e.key==="Tab"){ trapFocus($("#cmdk"), e); }
  else if(e.key==="ArrowDown"){ e.preventDefault(); cmdk.sel = (cmdk.sel+1) % Math.max(1, cmdk.shown.length); cmdkDraw(); }
  else if(e.key==="ArrowUp"){ e.preventDefault(); cmdk.sel = (cmdk.sel-1+cmdk.shown.length) % Math.max(1, cmdk.shown.length); cmdkDraw(); }
  else if(e.key==="Enter"){ e.preventDefault(); cmdkPick(); }
}, true);

/* ---------- mobile nav and new-assessment button ---------- */
$("#nav-toggle").addEventListener("click", () => $("#app").classList.toggle("nav-open"));
$("#sb-scrim").addEventListener("click", () => $("#app").classList.remove("nav-open"));
$("#tb-new").addEventListener("click", e => { e.preventDefault(); newMenuToggle(); });

/* ---------- Phones: one bar (2026-10-14) ----------
   On a phone the page's own strip (.asb: back link, tool name, progress, help) and the app top bar are
   one sticky bar. The strip stays in the page as the source of truth (it is hidden by CSS on phones, and
   desktop is untouched); this copies its back link, name, progress and help button into #topbar, so every
   tool that renders an asStepBar gets the merged bar without changing. Routes with no strip show a hamburger,
   a title and search. */
let phSig = "";
// Pages with no strip of their own that still get the tool bar on a phone (back chevron, name, search, help)
const PH_TOOLBAR = {review:true};
const PH_PILL = ".pagehead .ph-help, .as-ht .ph-help";
function phSync(){
  const body = document.body, tn = $("#tb-tname"); if(!body || !tn || !view || typeof view.querySelector !== "function") return;
  const asb = view.querySelector(".asb"), r = (body.dataset && body.dataset.route) || "", prog = $("#tb-prog"), back = $("#tb-back"), help = $("#tb-help");
  let name, segs = "", label = "", href = "", hasHelp = false;
  if(asb){
    const bk = asb.querySelector(".asb-back"), nm = asb.querySelector(".asb-mid b"), sg = asb.querySelector(".asb-segs");
    name = nm ? nm.textContent.trim() : (ROUTE_LABEL[r] || "");
    segs = sg ? sg.innerHTML : "";
    label = bk ? bk.textContent.trim().replace(/^Your assessment$/, "Assessment") : "All tools";
    href = bk ? bk.getAttribute("href") : "#tools";
    hasHelp = !!asb.querySelector(".ph-help");
    // the bar names the tool the same way the sidebar and the title do (the strip may say a journey step's name)
    if(ROUTE_LABEL[r]) name = ROUTE_LABEL[r];
  }else if(PH_TOOLBAR[r]){
    name = ROUTE_LABEL[r] || ""; label = asInAssessment() ? "Assessment" : "All tools"; href = asInAssessment() ? "#overview" : "#tools";
    hasHelp = !!view.querySelector(PH_PILL);
  }else{
    name = r === "overview" || r === "tools" || !ROUTE_LABEL[r] ? "T&S Workbench" : ROUTE_LABEL[r];
    hasHelp = !!view.querySelector(PH_PILL);
  }
  const bar = !!asb || !!PH_TOOLBAR[r];
  const sig = [bar, name, segs, label, href, hasHelp].join("\u0001");
  if(sig === phSig) return;
  phSig = sig;
  body.classList.toggle("ph-tool", bar);
  body.classList.toggle("ph-hb", hasHelp);
  tn.textContent = name;
  if(prog){ prog.innerHTML = segs; prog.hidden = !segs; prog.classList.toggle("solo", /class="solo"/.test(segs)); }
  if(back){ back.hidden = !bar; if(bar){ back.setAttribute("href", href); const sp = back.querySelector("span"); if(sp) sp.textContent = label; } }
  if(help) help.hidden = !hasHelp;
}
if(typeof MutationObserver !== "undefined" && view && typeof view.querySelector === "function"){
  let phQueued = false;
  new MutationObserver(() => { if(phQueued) return; phQueued = true; requestAnimationFrame(() => { phQueued = false; phSync(); }); })
    .observe(view, {childList:true, subtree:true});
}
try{ phSync(); }catch(e){}
// The (i) button in the bar presses the strip's own "How this works" button, so the tour or walkthrough is
// whichever one that page already offers
{ const hb = $("#tb-help"); if(hb && hb.addEventListener) hb.addEventListener("click", () => { const b = view.querySelector(".asb .ph-help") || view.querySelector(PH_PILL); if(b) b.click(); }); }
// "Saved as you go" used to sit in the strip as a permanent label; on a phone it is one toast, the first time
// a tool writes its answers in a session
let phSaved = false;
const phQuiet = /^(intro:|firstrun|theme|ui:|help|gloss|learn:|rt:seen|org|demo|ws|proj|sync|pf)/;
{
  const set0 = store.set;
  if(typeof set0 === "function") store.set = function(k, v){
    set0.apply(this, arguments);
    try{
      if(phSaved || !document.body.classList.contains("ph-tool") || phQuiet.test(String(k))) return;
      if(window.matchMedia && window.matchMedia("(max-width:640px)").matches){ phSaved = true; gsay("Saved as you go"); }
    }catch(e){}
  };
}
