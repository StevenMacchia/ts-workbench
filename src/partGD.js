/* =========================================================
   GUIDED FLOWS: one engine for every tool that asks its questions one screen at a time
   A tool hands over a spec (its intro, its steps and what to do at the end); the engine draws the
   strip, the intro, each question, the progress aside, and handles clicks and number keys.
   A step: {id, eb, title, why, kind:"single"|"multi"|"text"|"custom", opts, get, set, toggle, html, answered, skip, opt, rows, placeholder, next}
   ========================================================= */
let gdCur = null;
const gdS = {};
const gdPos = k => gdS[k] || (gdS[k] = {scr:"intro", i:0});
const gdReset = k => { delete gdS[k]; if(gdCur && gdCur.k === k) gdCur = null; };
const gdLive = spec => spec.steps.filter(s => !s.skip || !s.skip());
function gdAnswered(s){
  try{ if(s.answered) return !!s.answered(); if(s.opt) return true; const v = s.get ? s.get() : null;
    return s.kind === "multi" ? Array.isArray(v) && v.length > 0 : s.kind === "custom" ? true : !!(v && String(v).trim()); }catch(e){ return false; }
}
// A real answer, as opposed to an optional step that may simply be passed
function gdHas(s){
  try{ if(s.has) return !!s.has(); const v = s.get ? s.get() : null;
    return s.kind === "multi" ? Array.isArray(v) && v.length > 0 : s.kind === "custom" ? false : !!(v && String(v).trim()); }catch(e){ return false; }
}
const gdFirstOpen = spec => { const i = gdLive(spec).findIndex(s => !gdHas(s) && !s.opt || !gdAnswered(s)); return i < 0 ? null : i; };
const gdPct = spec => { const st = gdLive(spec), n = st.filter(gdHas).length; return st.length ? Math.round(n / st.length * 100) : 0; };
function gdIntroHTML(spec){
  const st = gdLive(spec), n = st.filter(gdHas).length, I = spec.intro, T = spec.tool;
  const resume = n > 0 && n < st.length && gdHas(st[0]);
  return `<div class="gd-w gd-intro">
    <span class="gd-tool"><span class="sb-glyph" style="background:${T.color}"><svg><use href="#i-${T.icon}"/></svg></span>${esc(T.name)}</span>
    <h1>${I.title}</h1>
    <p class="gd-lead">${I.lead}</p>
    ${I.powered && I.powered.length && typeof poweredBy === "function" ? `<div class="gd-pw">${poweredBy(I.powered)}</div>` : ""}
    ${I.facts && I.facts.length ? `<div class="gd-facts">${I.facts.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>` : ""}
    <div class="gd-a"><button type="button" class="btn primary gd-cta" data-gd="${resume ? "resume" : "start"}">${resume ? `Pick up where you left off (${n} of ${st.length})` : esc(I.start || "Start")} ${icon("arrow")}</button>${I.extra || ""}</div>
    ${spec.alt && spec.alt.length ? `<div class="gd-alt"><span>Other ways in:</span>${spec.alt.map((a, i) => `<button type="button" class="ov-link" data-gd="alt${i}">${esc(a.n)}</button>`).join("")}</div>` : ""}
  </div>`;
}
function gdOptHTML(s, o, j, on){
  return `<button type="button" class="gd-opt ${on ? "on" : ""} ${o.off ? "off" : ""}" data-gdpick="${esc(o.k)}" aria-pressed="${on}" ${o.off ? 'aria-disabled="true"' : ""}>
    <span class="gd-radio ${s.kind === "multi" ? "sq" : ""}" aria-hidden="true"></span><span class="gd-ot"><span class="gd-oh"><b>${esc(o.n)}</b>${o.tag || ""}</span>${o.h ? `<span>${esc(o.h)}</span>` : ""}</span>${j < 9 ? `<kbd aria-hidden="true">${j + 1}</kbd>` : ""}</button>`;
}
function gdBodyHTML(s){
  if(s.kind === "single"){ const v = s.get(); return `<div class="gd-opts" role="group" aria-label="${esc(s.title)}">${s.opts().map((o, j) => gdOptHTML(s, o, j, v === o.k)).join("")}</div>`; }
  if(s.kind === "multi"){ const v = s.get() || [], os = s.opts();
    return `<p class="note gd-multi-n">Choose all that apply${s.none ? ", or none" : ""}.</p><div class="gd-opts" role="group" aria-label="${esc(s.title)}">${os.map((o, j) => gdOptHTML(s, o, j, v.includes(o.k))).join("")}${s.none ? gdOptHTML(s, {k:"__none", n:s.none}, os.length, !v.length && !!s.noneOn && s.noneOn()) : ""}</div>`; }
  if(s.kind === "text"){ const v = s.get() || "", id = "gd-t-" + s.id;
    return `<div class="gd-text"><label class="visually-hidden" for="${id}">${esc(s.title)}</label>${(s.rows || 1) > 1 ? `<textarea id="${id}" class="input" rows="${s.rows}" data-gdtext="1" placeholder="${esc(s.placeholder || "")}" ${s.max ? `maxlength="${s.max}"` : ""}>${esc(v)}</textarea>` : `<input id="${id}" class="input" data-gdtext="1" value="${esc(v)}" placeholder="${esc(s.placeholder || "")}" ${s.max ? `maxlength="${s.max}"` : ""} autocomplete="off">`}${s.hint ? `<p class="note">${s.hint}</p>` : ""}</div>`; }
  return s.html ? s.html() : "";
}
function gdQHTML(spec){
  const p = gdPos(spec.k), st = gdLive(spec); p.i = Math.max(0, Math.min(p.i, st.length - 1));
  const s = st[p.i], last = p.i === st.length - 1, single = s.kind === "single" && s.auto !== false;
  const next = s.next || (last ? (spec.finish || "See your results") : "Continue");
  return `<div class="gd-q">
    <div class="gd-main">
      <div class="gd-crumb"><span class="gd-area">${esc(s.eb || spec.tool.name)}</span><span aria-hidden="true">/</span><span>Question ${p.i + 1} of ${st.length}</span></div>
      <h1>${s.title}</h1>
      ${s.why ? `<p class="gd-why">${s.why}</p>` : ""}
      ${gdBodyHTML(s)}
      <div class="gd-foot"><button type="button" class="btn" data-gd="back">Back</button>
        ${single ? `<span class="note">Pick the closest${s.opts().length <= 9 ? ", or press a number" : ""}. You can change it later.</span>` : `<span class="gd-foot-r">${s.opt ? `<span class="note">Optional</span>` : ""}<button type="button" class="btn primary" data-gd="next" ${!s.opt && !gdAnswered(s) ? "disabled" : ""}>${esc(next)} ${icon("arrow")}</button></span>`}</div>
    </div>
    <aside class="gd-aside" aria-label="Your progress">
      ${spec.aside ? spec.aside(s) : ""}
      <div class="gd-chips"><span class="as-eb">Question ${p.i + 1} of ${st.length}</span><div>${st.map((z, j) => `<span class="gd-chip ${j === p.i ? "now" : gdHas(z) ? "full" : ""}">${esc(z.eb || z.id)}</span>`).join("")}</div></div>
      ${spec.alt && spec.alt.length ? `<div class="gd-alt">${spec.alt.map((a, i) => `<button type="button" class="ov-link" data-gd="alt${i}">${esc(a.n)}</button>`).join("")}</div>` : ""}
    </aside>
  </div>`;
}
function gdRender(spec){
  gdCur = spec; const p = gdPos(spec.k);
  if(p.scr === "q" && !gdLive(spec).length) p.scr = "intro";
  view.innerHTML = `<div class="gd gd-s-${p.scr}" style="--tc:${spec.tool.color}">${asStepBar(spec.k, gdPct(spec), true)}<span class="toast" id="${spec.k}-toast" aria-live="polite"></span>${p.scr === "q" ? gdQHTML(spec) : gdIntroHTML(spec)}</div>`;
  if(spec.bind) spec.bind();
}
const gdFocus = () => { const el = view.querySelector && (view.querySelector(".gd-text .input") || view.querySelector("h1")); if(el){ if(el.classList.contains("input")) el.focus(); else focusQuiet(el); } };
function gdShow(spec){ gdRender(spec); if(window.scrollY > 120) window.scrollTo(0, 0); gdFocus(); }
function gdGo(spec, act){
  clearTimeout(gdGo.t); const p = gdPos(spec.k), st = gdLive(spec);
  if(/^alt\d+$/.test(act)){ const a = spec.alt[+act.slice(3)]; if(a) a.run(); return; }
  if(act === "intro") p.scr = "intro";
  else if(act === "start"){ p.scr = "q"; p.i = 0; }
  else if(act === "resume"){ const i = gdFirstOpen(spec); p.scr = "q"; p.i = i === null ? 0 : i; }
  else if(act === "back"){ if(p.scr !== "q" || p.i === 0) p.scr = "intro"; else p.i--; }
  else if(act === "next"){ const s = st[p.i]; if(s && !s.opt && !gdAnswered(s)) return; if(p.i >= st.length - 1){ gdReset(spec.k); return spec.done(); } p.i++; }
  gdShow(spec);
}
function gdPick(spec, k){
  const p = gdPos(spec.k), s = gdLive(spec)[p.i]; if(!s || p.scr !== "q") return;
  const opt = s.kind === "single" || s.kind === "multi" ? s.opts().find(o => String(o.k) === k) : null;
  if(opt && opt.off) return gsay(opt.offMsg || "That option isn't available for your answers");
  if(s.kind === "single"){ s.set(k);
    if(view.querySelectorAll) view.querySelectorAll("[data-gdpick]").forEach(b => { const on = b.dataset.gdpick === k; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    clearTimeout(gdGo.t); if(s.auto === false) return gdShow(spec); gdGo.t = setTimeout(() => gdGo(spec, "next"), 260); return; }
  if(s.kind === "multi"){ if(k === "__none"){ if(s.clear) s.clear(); return gdGo(spec, "next"); } s.toggle(k); gdShow(spec); const again = view.querySelectorAll && [...view.querySelectorAll("[data-gdpick]")].find(x => x.dataset.gdpick === k); if(again) again.focus({preventScroll:true}); }
}
document.addEventListener("click", e => {
  if(!gdCur) return; const b = e.target.closest && e.target.closest("[data-gd],[data-gdpick]"); if(!b || !view.contains(b)) return;
  e.preventDefault(); if(b.dataset.gdpick !== undefined) return gdPick(gdCur, b.dataset.gdpick); gdGo(gdCur, b.dataset.gd);
});
document.addEventListener("input", e => {
  if(!gdCur) return; const t = e.target; if(!t || !t.dataset || !t.dataset.gdtext || !view.contains(t)) return;
  const p = gdPos(gdCur.k), s = gdLive(gdCur)[p.i]; if(!s || s.kind !== "text") return;
  s.set(t.value); const nb = view.querySelector('[data-gd="next"]'); if(nb) nb.disabled = !s.opt && !gdAnswered(s);
});
// Number keys answer the question on screen; Enter continues a typed answer
document.addEventListener("keydown", e => {
  if(!gdCur || !view.querySelector || !view.querySelector(".gd-s-q")) return;
  if(document.querySelector("#tour-pop:not([hidden]), .tk-bg:not([hidden])")) return;
  const p = gdPos(gdCur.k), s = gdLive(gdCur)[p.i]; if(!s) return;
  const typing = /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "");
  if(e.key === "Enter" && !e.shiftKey && s.kind === "text" && typing && e.target.tagName !== "TEXTAREA"){ e.preventDefault(); return gdGo(gdCur, "next"); }
  if(typing || e.metaKey || e.ctrlKey || e.altKey || !/^[1-9]$/.test(e.key) || !["single", "multi"].includes(s.kind)) return;
  const os = s.opts(), j = +e.key - 1, o = os[j] || (s.kind === "multi" && s.none && j === os.length ? {k:"__none"} : null); if(!o) return;
  e.preventDefault(); gdPick(gdCur, String(o.k));
});
