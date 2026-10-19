/* ---------- Router ---------- */
const ROUTES = {overview:renderOverview, premortem:renderPremortem, tabletop:renderTabletop, metrics:renderMetrics, vendors:renderVendors};
// A slim accent bar beside the sidebar's current link, repositioned (not rebuilt) on every route
// change so it slides to the new spot instead of the highlight just snapping there.
function sbMovePill(name){
  if(typeof document === "undefined" || !document.querySelector) return;
  const nav = document.querySelector(".sb-nav"); if(!nav) return;
  let pill = nav.querySelector(".sb-pill");
  if(!pill){ pill = document.createElement("span"); pill.className = "sb-pill"; pill.setAttribute("aria-hidden", "true"); nav.prepend(pill); }
  const active = nav.querySelector(`.navlink[data-route="${name}"]`);
  if(!active){ pill.style.opacity = "0"; return; }
  const navTop = nav.getBoundingClientRect().top, r = active.getBoundingClientRect();
  pill.style.transform = `translateY(${r.top - navTop}px)`;
  pill.style.height = r.height + "px";
  pill.style.opacity = "1";
}
function route(){
  canonNow();   // an old #tool link becomes /tool (once); a ?s= payload is set aside and taken off the address
  // A shared result link: "#<route>?s=<data>" (or "/<route>?s=<data>"). Decode it, apply it, then route normally on the clean address.
  const shareHit = typeof shareParseHash === "function" ? shareParseHash() : null;
  route.path = location.pathname;
  if(shareHit && PATHMODE) SHARE_STASH = null;
  if(shareHit && typeof SHARE_APPLY !== "undefined" && SHARE_APPLY[shareHit.route]){
    shareDecode(shareHit.s).catch(() => null).then(data => {
      // Someone opening a shared result wants the result, not the tool's purpose card
      if(data){ SHARE_APPLY[shareHit.route](data); if(typeof introMark === "function") introMark(shareHit.route); }
      if(!PATHMODE) history.replaceState(null, "", location.pathname + "#" + shareHit.route);
      route();
    });
    return;
  }
  const h = hashNow();
  // A shareable link straight into the demo company
  if(h === "demo" && typeof demoStart === "function"){ demoStart(); return; }
  const name = ROUTES[h] ? h : 'overview';
  $$('.navlink').forEach(a => a.dataset.route === name ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current'));
  if(typeof sbMovePill === "function") sbMovePill(name);
  ROUTES[name]();
  window.scrollTo(0,0);
  // After the first load, a new page takes focus to its heading unless the page placed it somewhere itself
  if(route.done && focusLost()) focusQuiet(document.querySelector("#view h1"));
  if(typeof helpAfterRoute === "function") helpAfterRoute(name, h);
  route.done = true;
}
// Hash mode: the hash is the route. Path mode: a hashchange only matters for an old #tool link (canonNow turns it
// into a path); the synthetic ones goHash fires for the cleanup listeners carry no hash and are ignored here.
window.addEventListener('hashchange', () => { if(!PATHMODE || canonNow()) route(); });
if(PATHMODE){
  // Back and Forward between tool paths; in-page #anchors also fire popstate, so only act when the path changed
  window.addEventListener('popstate', () => { if(location.pathname !== route.path){ window.dispatchEvent(new Event('hashchange')); route(); } });
  // Links written as href="#tool" (sidebar, buttons, cards) become real navigations to /tool
  document.addEventListener('click', e => {
    if(e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if(!a || (a.target && a.target !== "_self")) return;
    const h = a.getAttribute('href').slice(1), first = h.split('/')[0];
    if(!/^[\w-]+(\/[\w-]+)*$/.test(h) || !ROUTES[first]) return;
    e.preventDefault(); goHash(h);
  });
}
route();
})();
</script>
