/* ---------- Router ---------- */
const ROUTES = {overview:renderOverview, premortem:renderPremortem, tabletop:renderTabletop, metrics:renderMetrics, vendors:renderVendors};
function route(){
  const h = (location.hash || '').slice(1);
  const name = ROUTES[h] ? h : 'overview';
  $$('.navlink').forEach(a => a.dataset.route === name ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current'));
  ROUTES[name]();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', route);
route();
})();
</script>
