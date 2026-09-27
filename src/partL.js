/* =========================================================
   SAVED ASSESSMENTS AND DOWNLOADS
   Saved in the viewer's browser so it works for anyone the page is shared with.
   ========================================================= */
const TRANSIENT = ["stage","qi","impact","tab","group","filter","open","search","rview","flash","fromProfile"];
const PROFILE_KEYS = ["type","youth","aud","adult","identity","contact","money","regions","scale","team","features"];
const newId = () => "TSW-" + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).slice(2,4).toUpperCase();
const libLoad = () => store.get("lib", {}) || {};
const libSave = lib => store.set("lib", lib);
function recordOf(p){ const r = {}; Object.keys(p).forEach(k => { if(!TRANSIENT.includes(k)) r[k] = p[k]; }); return JSON.parse(JSON.stringify(r)); }
function saveToLib(){
  if(!pm.id) pm.id = newId();
  pm.saved = true; pm.example = false;
  pm.created = pm.created || Date.now(); pm.updated = Date.now();
  const lib = libLoad(); lib[pm.id] = recordOf(pm); libSave(lib);
}
function openRecord(rec, extra){ const p = Object.assign(blankPM(), JSON.parse(JSON.stringify(rec)), extra||{}); QS.forEach(q=>p.answered[q.k]=true); return p; }
const fmtDate = t => { try{ return new Date(t).toLocaleDateString(undefined, {year:"numeric", month:"short", day:"numeric"}); }catch(e){ return ""; } };
const slug = s => (s||"assessment").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60) || "assessment";

let DL = null;
// Outside Claude (for example on GitHub Pages) files download straight through the browser
const STANDALONE = !(window.claude && typeof window.claude.use === "function");
if(STANDALONE && typeof Blob !== "undefined" && typeof URL !== "undefined" && URL.createObjectURL){
  DL = {save: async ({filename, data}) => {
    const type = /\.html?$/.test(filename) ? "text/html" : /\.csv$/.test(filename) ? "text/csv" : /\.json$/.test(filename) ? "application/json" : "text/markdown";
    const url = URL.createObjectURL(new Blob([data], {type: type + ";charset=utf-8"}));
    const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }};
}
try{
  if(window.claude && typeof window.claude.use === "function"){
    window.claude.use("downloads").then(ns => { DL = ns; if((location.hash||"").slice(1)==="premortem") renderPremortem(); }).catch(()=>{});
  }
}catch(e){}
async function offerFile(filename, data, fallbackText, toastEl){
  const say = m => { if(toastEl){ toastEl.textContent = m; setTimeout(()=>{ toastEl.textContent = ""; }, 3500); } };
  if(DL){
    try{ await DL.save({filename, data}); say("Download started"); return; }
    catch(e){
      const code = e && e.code;
      if(code==="declined") return say("Download cancelled");
      if(code==="rate_limited") return say("A download prompt is already open");
    }
  }
  copyText(fallbackText, toastEl);
}
function exportLibrary(toastEl){
  const items = Object.values(libLoad());
  if(!items.length) return;
  const json = JSON.stringify({app:"ts-workbench", version:1, exported:new Date().toISOString(), assessments:items}, null, 2);
  offerFile("ts-workbench-assessments.json", json, json, toastEl);
}
function importLibrary(file, done){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      const items = Array.isArray(data) ? data : (data && Array.isArray(data.assessments) ? data.assessments : null);
      if(!items) throw new Error("format");
      const lib = libLoad(); let n = 0;
      items.forEach(it => { if(it && typeof it==="object" && it.type && Array.isArray(it.features)){ const id = it.id || newId(); lib[id] = Object.assign({}, it, {id, saved:true, example:false}); n++; } });
      libSave(lib); done(n ? `Imported ${n} assessment${n===1?"":"s"}` : "No assessments found in that file");
    }catch(e){ done("That file isn't a Workbench export"); }
  };
  reader.onerror = () => done("Couldn't read that file");
  reader.readAsText(file);
}
