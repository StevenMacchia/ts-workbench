/* ---------- Router ---------- */
const ROUTES = {overview:renderOverview, premortem:renderPremortem, tabletop:renderTabletop, metrics:renderMetrics, vendors:renderVendors};
function route(){
  const h = (location.hash || '').slice(1);
  // A shareable link straight into the demo company
  if(h === "demo" && typeof demoStart === "function"){ demoStart(); return; }
  const name = ROUTES[h] ? h : 'overview';
  $$('.navlink').forEach(a => a.dataset.route === name ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current'));
  ROUTES[name]();
  window.scrollTo(0,0);
  // After the first load, a new page takes focus to its heading unless the page placed it somewhere itself
  if(route.done && focusLost()) focusQuiet(document.querySelector("#view h1"));
  route.done = true;
}
window.addEventListener('hashchange', route);
route();
})();
</script>
