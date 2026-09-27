/* =========================================================
   SHELL: sidebar state, top bar, mobile nav, command palette
   ========================================================= */
const TOOL_COLOR = {premortem:"var(--t-pm)", tabletop:"var(--t-tt)", metrics:"var(--t-mx)", vendors:"var(--t-vd)", policy:"var(--t-pol)", maturity:"var(--t-ma)"};
const ROUTE_LABEL = {overview:"Overview", workspace:"My workspace", premortem:"Abuse pre-mortem", tabletop:"Incident tabletop", metrics:"Metrics framework", vendors:"Vendor scorecard", maturity:"Program maturity", policy:"Policy stress-tester", notice:"Enforcement notice writer", appeal:"Appeal reviewer", transparency:"Transparency report drafter", about:"About this project"};
const initials2 = s => (s||"").trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
function gsay(msg){ const t = $("#gtoast"); if(!t) return; t.textContent = msg; t.hidden = false; clearTimeout(gsay.t); gsay.t = setTimeout(()=>{ t.hidden = true; }, 2400); }
function relTime(t){
  if(!t) return ""; const s = Math.max(0, (Date.now()-t)/1000);
  if(s < 60) return "now"; if(s < 3600) return Math.floor(s/60)+"m"; if(s < 86400) return Math.floor(s/3600)+"h";
  if(s < 604800) return Math.floor(s/86400)+"d"; return Math.floor(s/604800)+"w";
}
function openSaved(id){
  const it = wsItems()[id]; if(!it) return;
  if(it.kind==="premortem"){ pm = openRecord(Object.assign({}, it.data, {id:it.id}), {stage:"report"}); savePM(); }
  if(it.kind==="tabletop"){ tt = JSON.parse(JSON.stringify(it.data)); store.set("tt", tt); }
  if(it.kind==="metrics"){ mx = JSON.parse(JSON.stringify(it.data)); store.set("mx", mx); store.set("ws:cur:metrics", it.id); }
  if(it.kind==="vendors"){ vx = JSON.parse(JSON.stringify(it.data)); store.set("vx", vx); store.set("ws:cur:vendors", it.id); }
  if(it.kind==="policy"){ pol = JSON.parse(JSON.stringify(it.data)); store.set("pol", pol); store.set("ws:cur:policy", it.id); }
  if(it.kind==="maturity"){ ma = JSON.parse(JSON.stringify(it.data)); store.set("ma", ma); store.set("ws:cur:maturity", it.id); }
  goRoute(KINDS[it.kind].route);
}
function newAssessment(){ pm = Object.assign(blankPM(), {projectId:wsActive()}); store.set("pm3", pm); goRoute("premortem"); }
function shellUpdate(name){
  if(document.body && document.body.dataset) document.body.dataset.route = name;
  const here = $("#tb-here"); if(here) here.textContent = ROUTE_LABEL[name] || "";
  const items = Object.values(wsItems()).filter(i=>KINDS[i.kind]).sort((a,b)=>(b.updated||0)-(a.updated||0));
  const cw = $("#sb-cnt-ws"); if(cw) cw.textContent = items.length || "";
  const ct = $("#sb-cnt-tt"); if(ct) ct.textContent = SCENARIOS.length;
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
  const app = $("#app"); if(app) app.classList.remove("nav-open");
}

/* ---------- command palette ---------- */
function cmdkItems(){
  const out = [];
  const go = (label, route, color, iconId) => out.push({g:"Go to", label, sub:"", color, icon:iconId, run:()=>goRoute(route)});
  go("Overview","overview","var(--faint)","home"); go("My workspace","workspace","var(--faint)","user");
  go("Abuse pre-mortem","premortem","var(--t-pm)","radar"); go("Incident tabletop","tabletop","var(--t-tt)","siren");
  go("Metrics framework","metrics","var(--t-mx)","gauge"); go("Vendor scorecard","vendors","var(--t-vd)","scale"); go("Program maturity","maturity","var(--t-ma)","steps");
  go("Policy stress-tester","policy","var(--t-pol)","doc");
  go("Enforcement notice writer","notice","var(--t-ai)","mail"); go("Appeal reviewer","appeal","var(--t-ai)","appeal"); out.push({g:"Go to", label:"Transparency report drafter", sub:"Under construction", color:"var(--faint)", icon:"chart", run:()=>goRoute("transparency")});
  go("About this project","about","var(--faint)","info");
  out.push({g:"Actions", label:"New pre-mortem assessment", sub:"", color:"var(--accent)", icon:"plus", run:newAssessment});
  out.push({g:"Actions", label:"Switch theme", sub:"Light, dark or auto", color:"var(--faint)", icon:"moon", run:()=>{ const order = ["light","dark","system"]; const cur = store.get("theme","system"); const nx = order[(order.indexOf(cur)+1)%3]; store.set("theme", nx); applyTheme(nx); gsay(nx==="system" ? "Theme matches your device" : `${nx[0].toUpperCase()+nx.slice(1)} theme on`); }});
  Object.values(wsItems()).filter(i=>KINDS[i.kind]).sort((a,b)=>(b.updated||0)-(a.updated||0)).forEach(it =>
    out.push({g:"Your saved work", label:it.title||"Untitled", sub:KINDS[it.kind].n, color:TOOL_COLOR[it.kind], icon:KINDS[it.kind].icon.replace("i-",""), run:()=>openSaved(it.id)}));
  if(typeof mxList === "function") mxList().forEach(m => out.push({g:"Metrics", label:m.n, sub:MX_Q[m.n] || "", color:"var(--t-mx)", icon:"gauge", run:()=>{ location.hash = "metrics/" + mxSlug(m); }}));
  const type = ttCompanyType();
  SCENARIOS.forEach((s,i) => { if(type!=="all" && !(s.types||[]).includes(type)) return; const v = ttScenario(i, type);
    out.push({g:"Tabletop scenarios", label:v.title, sub:v.tailored ? "Tailored" : (TT_TYPES.find(t=>t.k===(s.types||[])[0])||{n:""}).n, color:"var(--t-tt)", icon:"siren", run:()=>{ ttStart(i, type); goRoute("tabletop"); }}); });
  return out;
}
let cmdk = {items:[], shown:[], sel:0, prevFocus:null};
function cmdkDraw(){
  const q = $("#cmdk-q").value.trim().toLowerCase();
  cmdk.shown = cmdk.items.filter(x => !q || (x.label+" "+x.sub+" "+x.g).toLowerCase().includes(q)).slice(0, 60);
  cmdk.sel = Math.min(cmdk.sel, Math.max(0, cmdk.shown.length-1));
  let g = "", h = "";
  cmdk.shown.forEach((x,i) => { if(x.g!==g){ g = x.g; h += `<li class="grp" role="presentation">${esc(g)}</li>`; }
    h += `<li class="it" role="option" id="cmdk-o${i}" data-i="${i}" aria-selected="${i===cmdk.sel}"><span class="sb-glyph" style="background:${x.color}"><svg><use href="#i-${x.icon}"/></svg></span><span class="lbl">${esc(x.label)}</span>${x.sub?`<small>${esc(x.sub)}</small>`:""}</li>`; });
  const list = $("#cmdk-list"); list.innerHTML = h || `<li class="grp">No matches. Try a tool, scenario or saved result.</li>`;
  $("#cmdk-q").setAttribute("aria-activedescendant", cmdk.shown.length ? "cmdk-o"+cmdk.sel : "");
  list.querySelectorAll(".it").forEach(li => { li.onmousemove = () => { if(cmdk.sel!==+li.dataset.i){ cmdk.sel = +li.dataset.i; cmdkDraw(); } }; li.onclick = () => { cmdk.sel = +li.dataset.i; cmdkPick(); }; });
  const cur = list.querySelector('[aria-selected="true"]'); if(cur && cur.scrollIntoView) cur.scrollIntoView({block:"nearest"});
}
function cmdkOpen(){ cmdk.prevFocus = document.activeElement; cmdk.items = cmdkItems(); cmdk.sel = 0; $("#cmdk").hidden = false; const q = $("#cmdk-q"); q.value = ""; cmdkDraw(); q.focus(); }
function cmdkClose(){ $("#cmdk").hidden = true; if(cmdk.prevFocus && cmdk.prevFocus.focus) try{ cmdk.prevFocus.focus(); }catch(e){} }
function cmdkPick(){ const x = cmdk.shown[cmdk.sel]; $("#cmdk").hidden = true; if(x) x.run(); }
$$("[data-cmdk]").forEach(b => b.addEventListener("click", cmdkOpen));
$("#cmdk-q").addEventListener("input", () => { cmdk.sel = 0; cmdkDraw(); });
$("#cmdk").addEventListener("click", e => { if(e.target.id==="cmdk") cmdkClose(); });
document.addEventListener("keydown", e => {
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); $("#cmdk").hidden ? cmdkOpen() : cmdkClose(); return; }
  if($("#cmdk").hidden) return;
  if(e.key==="Escape"){ e.preventDefault(); cmdkClose(); }
  else if(e.key==="ArrowDown"){ e.preventDefault(); cmdk.sel = (cmdk.sel+1) % Math.max(1, cmdk.shown.length); cmdkDraw(); }
  else if(e.key==="ArrowUp"){ e.preventDefault(); cmdk.sel = (cmdk.sel-1+cmdk.shown.length) % Math.max(1, cmdk.shown.length); cmdkDraw(); }
  else if(e.key==="Enter"){ e.preventDefault(); cmdkPick(); }
}, true);

/* ---------- mobile nav and new-assessment button ---------- */
$("#nav-toggle").addEventListener("click", () => $("#app").classList.toggle("nav-open"));
$("#sb-scrim").addEventListener("click", () => $("#app").classList.remove("nav-open"));
$("#tb-new").addEventListener("click", e => { e.preventDefault(); newAssessment(); });
