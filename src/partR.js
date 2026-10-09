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
  // A shared result link: "#<route>?s=<data>". Decode it, apply it, then route normally on the clean hash.
  const shareHit = typeof shareParseHash === "function" ? shareParseHash() : null;
  if(shareHit && typeof SHARE_APPLY !== "undefined" && SHARE_APPLY[shareHit.route]){
    shareDecode(shareHit.s).then(data => {
      if(data) SHARE_APPLY[shareHit.route](data);
      history.replaceState(null, "", location.pathname + "#" + shareHit.route);
      route();
    });
    return;
  }
  const h = (location.hash || '').slice(1);
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
window.addEventListener('hashchange', route);
route();
})();
</script>
