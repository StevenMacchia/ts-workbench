
/* ---------- Theme switch: a per-viewer convenience kept in browser storage ---------- */
function applyTheme(m){
  if(m==="light"||m==="dark") document.documentElement.setAttribute("data-mode", m);
  else document.documentElement.removeAttribute("data-mode");
  $$(".themeseg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.thememode===(m==="light"||m==="dark"?m:"system"))));
}
applyTheme(store.get("theme","system"));
$$(".themeseg button").forEach(b => b.addEventListener("click", () => { store.set("theme", b.dataset.thememode); applyTheme(b.dataset.thememode); }));
