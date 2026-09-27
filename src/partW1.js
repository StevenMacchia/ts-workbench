/* =========================================================
   WORKSPACE STORE
   Profile, projects and saved results from every tool, kept in this browser.
   ========================================================= */
const wsItems = () => store.get("ws:items", {}) || {};
const wsSaveItems = m => store.set("ws:items", m);
const wsProjects = () => store.get("ws:projects", {}) || {};
const wsSaveProjects = m => store.set("ws:projects", m);
const wsProfile = () => store.get("ws:profile", null);
const wsActive = () => { const id = store.get("ws:active", null); return id && wsProjects()[id] ? id : null; };
const wsNewId = prefix => prefix + "-" + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).slice(2,4).toUpperCase();
function wsPut(item){
  const m = wsItems(), prev = m[item.id], now = Date.now();
  m[item.id] = Object.assign({}, prev||{}, item, {created:(prev&&prev.created)||item.created||now, updated:item.updated||now});
  wsSaveItems(m); return m[item.id];
}
function wsDel(id){ const m = wsItems(); delete m[id]; wsSaveItems(m); }
// One-time move of pre-mortems saved before the workspace existed
(function(){
  try{
    if(store.get("ws:migrated", false)) return;
    const lib = store.get("lib", {}) || {}, m = wsItems();
    Object.values(lib).forEach(rec => { if(rec && rec.id && !m[rec.id]) m[rec.id] = {id:rec.id, kind:"premortem", title:rec.name||"Untitled assessment", projectId:rec.projectId||null, created:rec.created||Date.now(), updated:rec.updated||Date.now(), data:rec}; });
    wsSaveItems(m); store.set("ws:migrated", true);
  }catch(e){}
})();
