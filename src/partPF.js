/* =========================================================
   PROFILE FILE: everything you've saved, in one file you keep
   Save it to a synced folder (OneDrive, iCloud Drive, Dropbox) and open it on any device.
   ========================================================= */
const PF_FILE = "ts-workbench-profile.json";
// Chrome and Edge can keep writing to the same file; elsewhere, and inside Claude, the profile downloads instead
const PF_FS = (() => { try{ return typeof window.showSaveFilePicker === "function" && window.top === window.self; }catch(e){ return false; } })();
let pfHandleCache = null, pfTimer = null;

const pfRaw = {
  get(k){ try{ return localStorage.getItem("tswb:" + k); }catch(e){ return null; } },
  set(k, v){ try{ localStorage.setItem("tswb:" + k, String(v)); }catch(e){} }
};
function pfCollect(){
  const data = {};
  try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && k.startsWith("tswb:") && !k.startsWith("tswb:profile:")) data[k.slice(5)] = localStorage.getItem(k); } }catch(e){}
  return data;
}
function pfDoc(){
  const p = wsProfile();
  return JSON.stringify({app:"ts-workbench", kind:"profile", version:3, saved:new Date().toISOString(), name:(p && p.name) || "", data:pfCollect()}, null, 1);
}
// What a profile file holds, in words, before anyone replaces their browser's copy with it
function pfSummary(obj){
  const read = k => { try{ return obj.data[k] ? JSON.parse(obj.data[k]) : null; }catch(e){ return null; } };
  const items = Object.values(read("ws:items") || {}), projects = Object.keys(read("ws:projects") || {}).length, m = read("ma");
  const bits = [items.length + " saved result" + (items.length === 1 ? "" : "s")];
  if(projects) bits.push(projects + " project" + (projects === 1 ? "" : "s"));
  if(m && m.lv && Object.keys(m.lv).length && !m.ex) bits.push("maturity ratings");
  return bits.join(", ");
}

/* ---------- remembering the file between visits (Chrome and Edge) ---------- */
function pfIDB(){
  return new Promise((ok, no) => { try{ const r = indexedDB.open("tswb-profile", 1); r.onupgradeneeded = () => r.result.createObjectStore("h"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }catch(e){ no(e); } });
}
async function pfHandle(){
  if(pfHandleCache || !PF_FS) return pfHandleCache;
  try{ const db = await pfIDB(); pfHandleCache = await new Promise(ok => { const q = db.transaction("h").objectStore("h").get("file"); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); }catch(e){}
  return pfHandleCache;
}
async function pfHandleSet(h){
  pfHandleCache = h;
  try{ const db = await pfIDB(); db.transaction("h", "readwrite").objectStore("h").put(h, "file"); }catch(e){}
}
async function pfWrite(h){ const w = await h.createWritable(); await w.write(pfDoc()); await w.close(); pfMarkSaved(h.name); }

/* ---------- save, open, and keep in sync ---------- */
function pfMarkSaved(file){ const t = Date.now(); pfRaw.set("profile:savedAt", t); pfRaw.set("profile:changedAt", t); if(file) pfRaw.set("profile:file", file); pfStatusRender(); }
async function pfSave(){
  if(PF_FS){
    try{
      let h = await pfHandle();
      if(h){ const q = await h.queryPermission({mode:"readwrite"}); if(q !== "granted" && (await h.requestPermission({mode:"readwrite"})) !== "granted") h = null; }
      if(!h){ h = await window.showSaveFilePicker({suggestedName:PF_FILE, types:[{description:"T&S Workbench profile", accept:{"application/json":[".json"]}}]}); await pfHandleSet(h); }
      await pfWrite(h); return gsay("Profile saved to " + h.name);
    }catch(e){ if(e && e.name === "AbortError") return; }
  }
  const doc = pfDoc(), res = await offerFile(PF_FILE, doc, doc, null);
  if(res === "saved"){ pfMarkSaved(PF_FILE); gsay("Profile saved. Keep the file somewhere safe, like a synced folder"); }
  else if(res === "copied") gsay("Downloads are blocked here, so the profile was copied to your clipboard");
}
// Edits save themselves once a file is connected and the browser has allowed writing this visit
function pfTouched(){
  pfRaw.set("profile:changedAt", Date.now());
  clearTimeout(pfTimer);
  pfTimer = setTimeout(async () => {
    pfStatusRender();
    if(!PF_FS) return;
    const h = await pfHandle(); if(!h) return;
    try{ if((await h.queryPermission({mode:"readwrite"})) === "granted") await pfWrite(h); }catch(e){}
  }, 1500);
}
async function pfOpen(){
  if(PF_FS && typeof window.showOpenFilePicker === "function"){
    try{ const [h] = await window.showOpenFilePicker({types:[{description:"T&S Workbench profile", accept:{"application/json":[".json"]}}]}); const f = await h.getFile(); return pfReview(await f.text(), f.name, h); }
    catch(e){ if(e && e.name === "AbortError") return; }
  }
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json"; inp.style.display = "none";
  inp.onchange = () => { const f = inp.files && inp.files[0]; if(f){ const r = new FileReader(); r.onload = () => pfReview(r.result, f.name, null); r.readAsText(f); } inp.remove(); };
  document.body.appendChild(inp); inp.click();
}
// Show what's in the file, then replace this browser's copy only when the person agrees
function pfReview(text, fileName, handle){
  let obj = null; try{ obj = JSON.parse(text); }catch(e){}
  if(!obj || obj.app !== "ts-workbench" && !obj.assessments && !Array.isArray(obj)) return gsay("That file isn't a T&S Workbench profile");
  if(obj.kind === "workspace" || obj.assessments || Array.isArray(obj)) return pfMergeOld(obj);
  if(obj.kind !== "profile" || !obj.data || typeof obj.data !== "object") return gsay("That file isn't a T&S Workbench profile");
  const dirty = +(pfRaw.get("profile:changedAt") || 0) > +(pfRaw.get("profile:savedAt") || 0) && Object.keys(pfCollect()).length > 1;
  pfModal(`<h3 id="pf-h">Open ${esc(obj.name ? obj.name + "'s profile" : "this profile")}?</h3>
    <p>${esc(fileName)}${obj.saved ? `, saved ${esc(new Date(obj.saved).toLocaleString())}` : ""}. It holds ${esc(pfSummary(obj))}.</p>
    <p class="note">Opening it replaces what's saved in this browser.${dirty ? " <b>This browser has changes you haven't saved to a file.</b>" : ""}</p>
    <div class="pf-act">${dirty ? `<button type="button" class="btn" data-pfm="savefirst">Save mine first</button>` : ""}<button type="button" class="btn" data-pfm="cancel">Cancel</button><button type="button" class="btn primary" data-pfm="open">Open profile</button></div>`,
    async act => {
      if(act === "savefirst"){ await pfSave(); return false; }
      if(act !== "open") return true;
      try{
        const keep = []; for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && k.startsWith("tswb:")) keep.push(k); }
        keep.forEach(k => localStorage.removeItem(k));
        Object.entries(obj.data).forEach(([k, v]) => { if(typeof v === "string" && /^[\w:.\-]+$/.test(k)) localStorage.setItem("tswb:" + k, v); });
      }catch(e){ gsay("This browser blocked saving the profile"); return true; }
      if(handle) await pfHandleSet(handle);
      pfMarkSaved(handle ? handle.name : fileName);
      location.reload();
      return true;
    });
}
// Older exports (workspace or pre-mortem library files) merge in rather than replace
function pfMergeOld(data){
  let n = 0;
  if(data.kind === "workspace"){
    const pr = wsProjects(); (data.projects || []).forEach(p => { if(p && p.id && p.name) pr[p.id] = p; }); wsSaveProjects(pr);
    const m = wsItems(); (data.items || []).forEach(it => { if(it && it.id && KINDS[it.kind] && it.data){ m[it.id] = it; n++; } }); wsSaveItems(m);
    if(data.profile && !wsProfile()) store.set("ws:profile", data.profile);
  } else {
    const lib = libLoad(); (Array.isArray(data) ? data : data.assessments).forEach(rec => { if(rec && rec.id && rec.type){ lib[rec.id] = rec; n++; } }); libSave(lib);
  }
  gsay(`Added ${n} saved result${n === 1 ? "" : "s"} from an older export`);
  const r = (location.hash || "").slice(1).split("/")[0] || "overview"; if(ROUTES[r]) ROUTES[r](); shellUpdate(r);
}
function pfModal(inner, onAct){
  const prev = document.activeElement, bg = document.createElement("div");
  bg.className = "tk-bg"; bg.innerHTML = `<div class="tk pf" role="dialog" aria-modal="true" aria-labelledby="pf-h">${inner}</div>`;
  const close = () => { bg.remove(); document.removeEventListener("keydown", key); if(prev && prev.focus) prev.focus(); };
  const key = e => { if(e.key === "Escape") close(); };
  bg.addEventListener("click", async e => { if(e.target === bg) return close(); const b = e.target.closest("[data-pfm]"); if(b && await onAct(b.dataset.pfm)) close(); });
  document.addEventListener("keydown", key); document.body.appendChild(bg);
  const first = bg.querySelector(".btn.primary"); if(first) first.focus();
}

/* ---------- where people see it: the sidebar and My workspace ---------- */
function pfStatus(){
  const saved = +(pfRaw.get("profile:savedAt") || 0), changed = +(pfRaw.get("profile:changedAt") || 0), file = pfRaw.get("profile:file") || PF_FILE;
  return {saved, dirty:changed > saved, file, never:!saved};
}
function pfStatusRender(){
  const el = document.getElementById("sb-sync"); if(!el) return;
  const s = pfStatus();
  const text = s.never ? (s.dirty ? "Not saved yet" : "Keep a copy") : s.dirty ? "Unsaved changes" : "Saved " + (relTime(s.saved) === "now" ? "just now" : relTime(s.saved) + " ago");
  el.className = "sb-sync " + (s.dirty ? "dirty" : s.never ? "" : "ok");
  el.innerHTML = `<span class="sb-sync-t" title="${esc(s.never ? "Save your profile to a file, then open it on any device" : "Profile file: " + s.file)}"><i></i>${text}</span>
    <button type="button" data-pf="open" title="Open a profile file">Open</button><button type="button" data-pf="save" title="Save your profile to a file">Save</button>`;
}
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-pf]"); if(!b) return; e.preventDefault(); b.dataset.pf === "save" ? pfSave() : pfOpen(); });
{ const setRaw = store.set; store.set = (k, v) => { setRaw.call(store, k, v); if(!/^(profile:|theme$|ov:pm$)/.test(k)) pfTouched(); }; }
