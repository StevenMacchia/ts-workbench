// Checks per-route titles and descriptions (seoFor/seoUpdate in partNav.js), the beacon's SPA option and
// the sitemap and robots.txt that build-ws.js writes. Runs the real ROUTE_LABEL / ROUTE_DESC / seo code
// against a fake document, so no browser is needed.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8"), docs = f => fs.readFileSync(path.join(D, "..", "docs", f), "utf8");
const nav = rd("partNav.js");
const a = nav.indexOf("const ROUTE_LABEL"), b = nav.indexOf("const initials2");
if(a < 0 || b < 0) throw new Error("seo block not found in partNav.js");
const AIS = ["notice", "appeal", "transparency"];
const run = new Function("document", "AI_TOOLS", nav.slice(a, b) + "\nreturn {ROUTE_LABEL, ROUTE_DESC, seoUpdate};");
const meta = {content: "Site description."};
const doc = {title: "T&S Workbench: free Trust & Safety tools",
  querySelector: s => s === 'meta[name="description"]' ? {getAttribute: () => meta.content, setAttribute: (k, v) => { meta.content = v; }} : null};
const ai = {}; AIS.forEach(k => { ai[k] = {desc: "AI tool " + k + " description."}; });
const {ROUTE_LABEL, ROUTE_DESC, seoUpdate} = run(doc, ai);
const eq = (x, y, m) => { if(x !== y) throw new Error(m + ": got " + x + ", want " + y); };
const routes = Object.keys(ROUTE_LABEL), titles = {}, descs = {};
routes.forEach(r => {
  seoUpdate(r);
  titles[r] = doc.title; descs[r] = meta.content;
  if(r === "overview") eq(doc.title, "T&S Workbench: free Trust & Safety tools", "home title unchanged");
  else eq(doc.title, ROUTE_LABEL[r] + " · T&S Workbench", r + " title");
  if(!descs[r] || descs[r] === "Site description." && r !== "overview") throw new Error(r + ": no description of its own");
});
eq(new Set(Object.values(titles)).size, routes.length, "every route has a distinct title");
// A route with no label (unknown hash) falls back to the home title, and the home description comes back
seoUpdate("nope"); eq(doc.title, "T&S Workbench: free Trust & Safety tools", "unknown route is home");
eq(meta.content, "Site description.", "home description restored");
Object.keys(ROUTE_DESC).forEach(k => { if(!ROUTE_LABEL[k]) throw new Error("ROUTE_DESC has a route with no label: " + k); });
console.log("seo: " + routes.length + " routes, " + routes.length + " distinct titles, descriptions for all");

// Built page: beacon carries the SPA option, and the sitemap matches ROUTE_LABEL
const html = docs("index.html"), token = rd("analytics-token.txt").trim();
if(token){
  const m = /data-cf-beacon='([^']*)'/.exec(html);
  if(!m) throw new Error("beacon tag missing");
  const cfg = JSON.parse(m[1]); eq(cfg.token, token, "beacon token"); eq(cfg.spa, true, "beacon spa option");
  console.log("beacon: spa " + cfg.spa);
}
const site = rd("site-url.txt").trim().replace(/\/$/, "");
if(site){
  const locs = [...docs("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1].replace(/&amp;/g, "&"));
  const skip = ["overview", "workspace", "plan", "review"], want = [site + "/"].concat(routes.filter(r => !skip.includes(r)).map(r => site + "/#" + r));
  eq(locs.join("\n"), want.join("\n"), "sitemap lists the root and every tool route");
  if(!docs("robots.txt").includes("Sitemap: " + site + "/sitemap.xml")) throw new Error("robots.txt does not point at the sitemap");
  console.log("sitemap: " + locs.length + " URLs; robots.txt points at it");
}
