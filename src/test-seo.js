// Checks per-route titles, descriptions and canonical links (seoFor/seoUpdate in partNav.js), the beacon's SPA
// option, the sitemap and robots.txt that build-ws.js writes, path routing (the PATHROUTE block in partD.js: a
// path loads its tool, an old #tool link becomes the path, a share link keeps its payload) and the 404 page's
// forwarding script. Runs the real code against fakes, so no browser is needed.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8"), docs = f => fs.readFileSync(path.join(D, "..", "docs", f), "utf8");
const eq = (x, y, m) => { if(x !== y) throw new Error(m + ": got " + x + ", want " + y); };
const nav = rd("partNav.js");
const a = nav.indexOf("const ROUTE_LABEL"), b = nav.indexOf("const initials2");
if(a < 0 || b < 0) throw new Error("seo block not found in partNav.js");
const AIS = ["notice", "appeal", "transparency"];
const run = new Function("document", "AI_TOOLS", nav.slice(a, b) + "\nreturn {ROUTE_LABEL, ROUTE_DESC, seoUpdate};");
const meta = {content: "Site description."}, canon = {href: ""};
const SITE = "https://stevenmacchia.com/ts-workbench/";
const doc = {title: "T&S Workbench: free Trust & Safety tools",
  querySelector: s => s === 'meta[name="description"]' ? {getAttribute: () => meta.content, setAttribute: (k, v) => { meta.content = v; }}
    : s === 'meta[property="og:url"]' ? {getAttribute: () => SITE}
    : s === 'link[rel="canonical"]' ? {setAttribute: (k, v) => { canon.href = v; }} : null};
const ai = {}; AIS.forEach(k => { ai[k] = {desc: "AI tool " + k + " description."}; });
const {ROUTE_LABEL, ROUTE_DESC, seoUpdate} = run(doc, ai);
const routes = Object.keys(ROUTE_LABEL), titles = {}, descs = {};
routes.forEach(r => {
  seoUpdate(r);
  titles[r] = doc.title; descs[r] = meta.content;
  if(r === "overview"){ eq(doc.title, "T&S Workbench: free Trust & Safety tools", "home title unchanged"); eq(canon.href, SITE, "home canonical is the root"); }
  else { eq(doc.title, ROUTE_LABEL[r] + " · T&S Workbench", r + " title"); eq(canon.href, SITE + r, r + " canonical is its own path"); }
  if(!descs[r] || descs[r] === "Site description." && r !== "overview") throw new Error(r + ": no description of its own");
});
eq(new Set(Object.values(titles)).size, routes.length, "every route has a distinct title");
// A route with no label (unknown path) falls back to the home title, and the home description comes back
seoUpdate("nope"); eq(doc.title, "T&S Workbench: free Trust & Safety tools", "unknown route is home");
eq(meta.content, "Site description.", "home description restored");
Object.keys(ROUTE_DESC).forEach(k => { if(!ROUTE_LABEL[k]) throw new Error("ROUTE_DESC has a route with no label: " + k); });
console.log("seo: " + routes.length + " routes, " + routes.length + " distinct titles and canonical paths, descriptions for all");

// Built page: beacon carries the SPA option, and the sitemap lists real paths that match ROUTE_LABEL
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
  const skip = ["overview", "workspace", "plan", "review"], want = [site + "/"].concat(routes.filter(r => !skip.includes(r)).map(r => site + "/" + r));
  eq(locs.join("\n"), want.join("\n"), "sitemap lists the root and every tool path");
  if(!docs("robots.txt").includes("Sitemap: " + site + "/sitemap.xml")) throw new Error("robots.txt does not point at the sitemap");
  if(!html.includes('<link rel="canonical" href="' + site + '/">')) throw new Error("static canonical missing");
  if(!html.includes('const APP_BASE = "' + new URL(site).pathname + '/";')) throw new Error("APP_BASE not filled in on the public page");
  // One real page per sitemap path (docs/<route>.html), so GitHub Pages answers the path with a 200 and crawlers see the route's own head
  const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const want2 = routes.filter(r => !skip.includes(r)), have = fs.readdirSync(path.join(D, "..", "docs")).filter(n => n.endsWith(".html") && n !== "index.html" && n !== "404.html").sort();
  eq(have.join(","), want2.map(r => r + ".html").sort().join(","), "docs has one <route>.html per sitemap route and no others");
  want2.forEach(r => {
    const h = docs(r + ".html");
    if(!h.includes("<title>" + esc(ROUTE_LABEL[r] + " · T&S Workbench") + "</title>")) throw new Error(r + ".html: wrong title");
    if(!h.includes('<link rel="canonical" href="' + site + "/" + r + '">')) throw new Error(r + ".html: wrong canonical");
    if(!h.includes('<meta property="og:url" content="' + site + "/" + r + '">')) throw new Error(r + ".html: wrong og:url");
    if(!h.includes('<meta property="og:image" content="' + site + '/og-image.png">')) throw new Error(r + ".html: og:image missing");
    const d = /<meta name="description" content="([^"]+)">/.exec(h);
    if(!d) throw new Error(r + ".html: no description");
    if(r in ROUTE_DESC && d[1] !== esc(ROUTE_DESC[r])) throw new Error(r + ".html: description differs from ROUTE_DESC");
    if(!h.includes("<noscript><h1>" + esc(ROUTE_LABEL[r]) + "</h1>")) throw new Error(r + ".html: no noscript heading");
    if(!h.includes('fetch("index.html"') || !h.includes("document.write(")) throw new Error(r + ".html: loader script missing");
    if(/<script[^>]*cloudflareinsights/.test(h)) throw new Error(r + ".html: the beacon belongs to the app, not the stub (a visit would count twice)");
    if(Buffer.byteLength(h) > 6000) throw new Error(r + ".html: stub grew past 6 KB, it should stay small");
  });
  console.log("route pages: " + want2.length + " files, each with its own title, description, canonical and og tags");
  console.log("sitemap: " + locs.length + " URLs as paths; robots.txt points at it; APP_BASE " + new URL(site).pathname + "/");
}

// ---- Path routing: the PATHROUTE block in partD.js, run against a fake location and history ----
const pd = rd("partD.js"), p0 = pd.indexOf("/* PATHROUTE START */"), p1 = pd.indexOf("/* PATHROUTE END */");
if(p0 < 0 || p1 < 0) throw new Error("PATHROUTE block not found in partD.js");
const block = pd.slice(p0, p1);
const ROUTES = {}; routes.forEach(r => { ROUTES[r] = () => {}; });
// start: a URL like "/ts-workbench/#premortem?s=abc"; base: the value APP_BASE gets ("" keeps the placeholder = hash mode)
function env(start, base){
  const loc = {protocol: "https:", pathname: "/", search: "", hash: ""}, calls = {route: 0, hashchange: 0, push: 0, replace: 0};
  const set = u => { const h = u.indexOf("#"), q = (h < 0 ? u : u.slice(0, h)).indexOf("?"), pre = h < 0 ? u : u.slice(0, h);
    loc.hash = h < 0 ? "" : u.slice(h); loc.search = q < 0 ? "" : pre.slice(q); loc.pathname = q < 0 ? pre : pre.slice(0, q); };
  set(start);
  const hist = {pushState: (s, t, u) => { calls.push++; set(u); }, replaceState: (s, t, u) => { calls.replace++; set(u); }};
  const win = {dispatchEvent: () => { calls.hashchange++; }};
  const src = base === "" ? block : block.replace('"__APP_BASE__"', JSON.stringify(base));
  const api = new Function("location", "history", "window", "Event", "ROUTES", "route", src + "\nreturn {PATHMODE, hashNow, goHash, canonNow, shareParseHash: () => SHARE_STASH, takeStash: () => { const s = SHARE_STASH; SHARE_STASH = null; return s; }, pathUrl};")(
    loc, hist, win, function Event(){}, ROUTES, () => { calls.route++; });
  return Object.assign({loc, calls}, api);
}
const B = "/ts-workbench/";
// a valid path loads the right tool
let e = env(B + "premortem", B); eq(e.PATHMODE, true, "path mode on with a real base"); eq(e.hashNow(), "premortem", "path -> tool"); eq(e.canonNow(), false, "a clean path needs no rewrite");
e = env(B + "metrics/some-metric", B); eq(e.hashNow(), "metrics/some-metric", "sub-route comes from the path");
e = env(B, B); eq(e.hashNow(), "", "root is home");
e = env("/premortem", B); eq(e.hashNow(), "premortem", "served at / (local): the base falls back to /");
routes.forEach(r => { const x = env(B + r, B); eq(x.hashNow(), r, r + " loads from its path"); });
// an old hash link canonicalizes to the path, once
e = env(B + "#tabletop", B); eq(e.hashNow(), "tabletop", "hash link is understood before rewriting"); eq(e.canonNow(), true, "hash link is rewritten");
eq(e.loc.pathname, B + "tabletop", "hash link becomes the path"); eq(e.loc.hash, "", "the hash is gone"); eq(e.calls.replace, 1, "one replaceState, no new history entry"); eq(e.canonNow(), false, "second pass changes nothing");
e = env(B + "#metrics/some-metric", B); e.canonNow(); eq(e.loc.pathname, B + "metrics/some-metric", "sub-route hash link");
e = env(B + "#overview", B); e.canonNow(); eq(e.loc.pathname, B, "#overview becomes the root");
e = env(B + "#demo", B); eq(e.canonNow(), false, "#demo stays a hash"); eq(e.hashNow(), "demo", "#demo still read");
e = env(B + "#not-a-tool", B); eq(e.canonNow(), false, "an in-page anchor is left alone");
// a share link keeps its payload, as a stash, and leaves the address clean
e = env(B + "#premortem?s=AbC-_123", B); e.canonNow();
eq(e.loc.pathname + e.loc.search + e.loc.hash, B + "premortem", "hash share link: address is clean");
eq(JSON.stringify(e.shareParseHash()), JSON.stringify({route: "premortem", s: "AbC-_123"}), "hash share link: payload kept");
e = env(B + "premortem?s=XyZ-9&shot=1", B); e.canonNow();
eq(e.loc.search, "?shot=1", "path share link: other query parameters survive"); eq(JSON.stringify(e.shareParseHash()), JSON.stringify({route: "premortem", s: "XyZ-9"}), "path share link: payload kept");
e = env(B + "premortem?shot=1&s=Q", B); e.canonNow(); eq(e.loc.search, "?shot=1", "payload last in the query"); eq(e.shareParseHash().s, "Q", "payload read");
e = env(B + "#vendors?s=Pay-_9&shot=1", B); e.canonNow();
eq(e.loc.pathname + e.loc.search + e.loc.hash, B + "vendors?shot=1", "404-forwarded link with extra parameters"); eq(e.shareParseHash().s, "Pay-_9", "payload is only the s parameter");
// navigation: one new entry at the path, the cleanup event, one route()
e = env(B + "premortem", B); e.goHash("tabletop");
eq(e.loc.pathname, B + "tabletop", "goHash pushes the path"); eq(e.calls.push, 1, "pushState once"); eq(e.calls.hashchange, 1, "cleanup event once"); eq(e.calls.route, 1, "route once");
e.goHash("tabletop"); eq(e.calls.push, 1, "same page: nothing"); eq(e.calls.route, 1, "same page: no route");
e.goHash("overview"); eq(e.loc.pathname, B, "overview is the root"); e.goHash("redteamllm/practice"); eq(e.loc.pathname, B + "redteamllm/practice", "sub-route path");
// the hosted copy (placeholder base) stays on the hash
e = env("/index.html#premortem", ""); eq(e.PATHMODE, false, "placeholder base: hash mode"); eq(e.hashNow(), "premortem", "hash read"); eq(e.canonNow(), false, "no rewrite in hash mode"); e.goHash("tabletop"); eq(e.loc.hash, "tabletop", "hash set");
console.log("path routing: path loads its tool (" + routes.length + " routes), #tool and #tool?s= rewritten to the path, share payload kept, one pushState per navigation, hash mode kept for the hosted copy");

// ---- The 404 page forwards a known tool path to the app, before it paints; unknown paths stay a 404 ----
const nf = docs("404.html"), sc = /<script>([\s\S]*?)<\/script>/.exec(nf);
if(!sc) throw new Error("404.html has no forwarding script");
if(nf.indexOf("<script>") > nf.indexOf("<title>")) throw new Error("the forwarding script must come before the page content");
const fwd = (pathname, search) => { let to = null; new Function("location", sc[1])({pathname, search, replace: u => { to = u; }}); return to; };
eq(fwd(B + "premortem", ""), B + "#premortem", "tool path forwards");
eq(fwd(B + "premortem/", ""), B + "#premortem", "trailing slash forwards");
eq(fwd(B + "premortem", "?s=AbC"), B + "#premortem?s=AbC", "the share payload rides along");
eq(fwd(B + "metrics/some-metric", ""), B + "#metrics/some-metric", "sub-route forwards");
eq(fwd(B + "nonsense", ""), null, "unknown path stays a 404"); eq(fwd(B + "nonsense/premortem", ""), null, "unknown first segment stays a 404"); eq(fwd("/other/premortem", ""), null, "other site paths are untouched");
routes.forEach(r => eq(fwd(B + r, ""), B + "#" + r, r + " forwards"));
console.log("404 page: forwards all " + routes.length + " tool paths, leaves unknown paths alone");

// Content-Security-Policy: the app and every route page carry one; every inline script on the page has its hash in
// script-src (a new inline script without one would stop running on the live site); no inline-script escape hatch;
// frames, plugins and <base> off; no inline event handlers left in the page, since the policy blocks them.
{
  const crypto = require("crypto");
  const check = (name, page) => {
    const all = [...page.matchAll(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/g)];
    if(all.length !== 1) throw new Error(name + ": " + all.length + " Content-Security-Policy meta tags, want exactly one (every policy on a page applies, so a second one can block the first one's scripts)");
    const m = all[0];
    if(page.indexOf(m[0]) > page.indexOf("<script")) throw new Error(name + ": the policy must come before the first script");
    const dir = {}; m[1].split(";").map(s => s.trim().split(/\s+/)).forEach(([k, ...v]) => { dir[k] = v; });
    const ss = dir["script-src"] || [];
    eq(ss.includes("'unsafe-inline'") || ss.includes("'unsafe-eval'"), false, name + ": script-src allows inline or eval code");
    ["frame-src", "object-src", "base-uri", "form-action"].forEach(k => eq((dir[k] || []).join(" "), "'none'", name + ": " + k));
    [...page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x => !/\bsrc\s*=/i.test(x[1])).forEach(x => {
      const h = "'sha256-" + crypto.createHash("sha256").update(x[2], "utf8").digest("base64") + "'";
      if(!ss.includes(h)) throw new Error(name + ": an inline script has no hash in script-src: " + x[2].slice(0, 60));
    });
    return ss;
  };
  const ss = check("index.html", html);
  eq(/\son(click|submit|error|load|input|change|keydown|mouseover|focus)\s*=\s*["']/i.test(html), false, "index.html: an inline on*= handler, which the policy blocks");
  const pages = fs.readdirSync(path.join(D, "..", "docs")).filter(n => n.endsWith(".html") && !["index.html", "404.html"].includes(n));
  pages.forEach(n => { const s2 = check(n, docs(n)); ss.filter(x => x.startsWith("'sha256-")).forEach(h => { if(!s2.includes(h)) throw new Error(n + ": missing the app's script hash, so the app it writes in would not run"); }); });
  console.log("content security policy: index.html and " + pages.length + " route pages, every inline script hashed, no inline handlers, frames and plugins off");
}
