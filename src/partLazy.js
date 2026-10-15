/* ---------- Lazy sections ----------
   Core-only part (the public page, docs/index.html). The red team studio, the Learn guides and the T&S glossary are
   separate scripts under docs/parts/, loaded the first time a visitor opens one of their routes. build-ws.js fills
   LAZY_CHUNKS and LAZY_ROUTE_CHUNK from its CHUNKS table. The full bundle used by the tests keeps everything inline and
   never includes this part; code elsewhere asks for a section through lazyEnsure only when `typeof lazyEnsure` says
   it exists. */
const LAZY_CHUNKS = __LAZY_CHUNKS__;
const LAZY_ROUTE_CHUNK = __LAZY_ROUTE_CHUNK__;
// How many things the sections hold, for the cards on the All tools page before a section is loaded.
// test-chunks.js fails when one of these drifts from the data.
const LAZY_COUNTS = {rtAreas: 16, tsgTerms: 103};
const lazyLoaded = {}, lazyPending = {};
const lazyBase = () => typeof appBase === "function" ? appBase() : "/";
// The last line of each section's file calls this; a script that threw before reaching it counts as not loaded.
function lazyDone(name){ lazyLoaded[name] = true; }
function lazyInject(name){
  if(lazyLoaded[name]) return Promise.resolve();
  if(lazyPending[name]) return lazyPending[name];
  const p = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.async = false;                       // downloads run in parallel, execution keeps insertion order (dependencies first)
    s.src = lazyBase() + LAZY_CHUNKS[name].src;
    s.onload = () => lazyLoaded[name] ? res() : rej(new Error(name + " did not finish running"));
    s.onerror = () => { s.remove(); rej(new Error(name + " could not be loaded")); };
    document.head.appendChild(s);
  });
  lazyPending[name] = p;
  p.catch(() => { delete lazyPending[name]; });
  return p;
}
// Resolves once the section and everything it needs have run. Asking again while it loads returns the same promise.
function lazyEnsure(name){
  if(!LAZY_CHUNKS[name]) return Promise.reject(new Error("unknown section " + name));
  const order = [], visit = n => { (LAZY_CHUNKS[n].needs || []).forEach(visit); if(!order.includes(n)) order.push(n); };
  visit(name);
  return Promise.all(order.map(lazyInject)).then(() => {});
}
function lazyView(html){ const v = document.getElementById("view"); if(v) v.innerHTML = html; }
// A ROUTES entry for a section: runs `run` straight away once the section is loaded, otherwise shows a quiet loading
// card, loads it, and runs the router again so the page gets the same scroll, focus and sidebar handling as any route.
function lazyRoute(chunk, run){
  const go = () => {
    const here = hashNow().split("/")[0];
    lazyView('<div class="lazy-load" role="status" aria-live="polite"><span class="lazy-dot" aria-hidden="true"></span>Loading this section…</div>');
    lazyEnsure(chunk).then(
      () => { if(hashNow().split("/")[0] === here) route(); },
      () => {
        if(hashNow().split("/")[0] !== here) return;
        lazyView('<div class="lazy-load lazy-err" role="alert"><p>This section could not be loaded. Check your connection, then try again.</p><button type="button" class="btn primary" id="lazy-retry">Try again</button></div>');
        const b = document.getElementById("lazy-retry"); if(b) b.onclick = go;
      });
  };
  return function(){ return lazyLoaded[chunk] ? run() : go(); };
}
