
/* ---------- Theme switch: a per-viewer convenience kept in browser storage ---------- */
/* The claude.ai viewer stamps data-theme with its own theme. An explicit choice here has to win, so data-theme is
   kept in step with data-mode, and re-set if the host stamps it again. "System" leaves the host's stamp alone.
   Guarded so the test stubs, which have no real root element, still load this part. */
const themeRoot = document.documentElement;
const themeAttrs = !!(themeRoot && typeof themeRoot.getAttribute === "function");
let themeHostStamp = themeAttrs ? themeRoot.getAttribute("data-theme") : null;
function themeSync(){
  if(!themeAttrs) return;
  const m = themeRoot.getAttribute("data-mode");
  if(m && themeRoot.getAttribute("data-theme") !== m) themeRoot.setAttribute("data-theme", m);
}
if(themeAttrs && typeof MutationObserver === "function") new MutationObserver(() => {
  const m = themeRoot.getAttribute("data-mode"), t = themeRoot.getAttribute("data-theme");
  if(!m || t !== m) themeHostStamp = t;
  themeSync();
}).observe(themeRoot, {attributes:true, attributeFilter:["data-theme","data-mode"]});
function applyTheme(m){
  if(m==="light"||m==="dark"){ document.documentElement.setAttribute("data-mode", m); themeSync(); }
  else {
    document.documentElement.removeAttribute("data-mode");
    if(themeAttrs){ if(themeHostStamp) themeRoot.setAttribute("data-theme", themeHostStamp); else themeRoot.removeAttribute("data-theme"); }
  }
  $$(".themeseg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.thememode===(m==="light"||m==="dark"?m:"system"))));
}
applyTheme(store.get("theme","light"));
$$(".themeseg button").forEach(b => b.addEventListener("click", () => { store.set("theme", b.dataset.thememode); applyTheme(b.dataset.thememode); }));
