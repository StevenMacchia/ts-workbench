#!/usr/bin/env node
"use strict";
/*
 * Mid-phone load profile of the built site (docs/), against a local gzip static server.
 *   node tools/perf/measure.js [route ...] [--runs=5] [--port=8832] [--docs=folder] [--fonts] [--label=text] [--json=file]
 * Profile: Moto G class. CPU 4x slowdown, network 1.6 Mbps down / 750 Kbps up / 150 ms RTT, 360x740 viewport,
 * touch + mobile UA, cold cache (fresh browser context every run). External hosts (Google Fonts, the Cloudflare
 * beacon) are aborted unless --fonts is given, so the numbers are the page's own cost and repeatable.
 * Routes are given as the tool name (default: "" = home, and "premortem"). Each run opens /#<route>.
 * Needs puppeteer-core (tools/screenshots/node_modules, or PUPPETEER_DIR) and Chrome (CHROME_PATH).
 * Reported per route, median of the runs:
 *   FP / FCP            first paint and first contentful paint (Paint Timing)
 *   DCL                 domContentLoadedEventEnd
 *   load                loadEventEnd
 *   sidebar interactive the first route() has finished: the sidebar's moving pill exists (created by route()) and
 *                       the view has content; the click handlers were bound before that in the same script
 *   TBT                 total blocking time: sum of (long task - 50 ms) from navigation start to 10 s after load
 *   script / tasks      ScriptDuration and TaskDuration from CDP Performance.getMetrics at the end
 *   wire                transferred (encoded) bytes over the wire, from the network log
 */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith("--" + k + "=")); return a ? a.split("=").slice(1).join("=") : d; };
const flag = k => args.includes("--" + k);
const routes = args.filter(a => !a.startsWith("--")); if(!routes.length) routes.push("", "premortem");
const RUNS = +opt("runs", 5), PORT = +opt("port", 8832), LABEL = opt("label", "");
const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
function loadPuppeteer(){
  const tries = [process.env.PUPPETEER_DIR, path.join(ROOT, "tools", "screenshots", "node_modules"), path.join(ROOT, "..", "..", "ts-workbench", "tools", "screenshots", "node_modules")].filter(Boolean);
  for(const t of tries){ try{ return require(require.resolve("puppeteer-core", {paths: [t]})); }catch(e){} }
  throw new Error("puppeteer-core not found; set PUPPETEER_DIR to a node_modules folder that has it");
}
const puppeteer = loadPuppeteer();
const med = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); if(!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const f0 = v => v == null ? "n/a" : v.toFixed(0);

const serve = (docs, port) => require("./serve")(docs, port);

const INIT = () => {
  window.__m = {longtasks: [], sidebar: null, view: null};
  try{ new PerformanceObserver(l => { for(const e of l.getEntries()) window.__m.longtasks.push([e.startTime, e.duration]); }).observe({type: "longtask", buffered: true}); }catch(e){}
  const check = () => {
    const m = window.__m, v = document.getElementById("view");
    if(m.sidebar == null && document.querySelector(".sb-pill")) m.sidebar = performance.now();
    if(m.view == null && v && v.children.length) m.view = performance.now();
  };
  new MutationObserver(check).observe(document, {childList: true, subtree: true});
};

async function once(browser, route){
  const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
  const cdp = await page.createCDPSession();
  await page.setViewport({width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  await page.setUserAgent("Mozilla/5.0 (Linux; Android 11; moto g power) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36");
  await page.setRequestInterception(true);
  let wire = 0, reqs = 0;
  page.on("request", r => { if(!r.url().startsWith("http://localhost:" + PORT) && !flag("fonts")) r.abort(); else r.continue(); });
  cdp.on("Network.loadingFinished", e => { wire += e.encodedDataLength; reqs++; });
  await cdp.send("Network.enable");
  await page.evaluateOnNewDocument(INIT);
  await cdp.send("Network.emulateNetworkConditions", {offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8});
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 4});
  await cdp.send("Performance.enable");
  const errors = []; page.on("pageerror", e => errors.push(String(e).slice(0, 160))); page.on("console", m => { if(m.type() === "error" && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push(m.text().slice(0, 160)); });
  await page.goto("http://localhost:" + PORT + "/#" + route, {waitUntil: "load", timeout: 120000});
  await new Promise(r => setTimeout(r, 10000));    // let long tasks after load show up
  const r = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0], paint = {}; performance.getEntriesByType("paint").forEach(p => paint[p.name] = p.startTime);
    const lt = window.__m.longtasks, v = document.querySelector("#view");
    return {fp: paint["first-paint"], fcp: paint["first-contentful-paint"], dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, sidebar: window.__m.sidebar, view: window.__m.view,
      tbt: lt.reduce((a, [, d]) => a + Math.max(0, d - 50), 0), longest: lt.reduce((a, [, d]) => Math.max(a, d), 0), nLong: lt.length,
      hasView: !!v && v.children.length > 0};
  });
  const pm = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
  await ctx.close();
  return Object.assign(r, {script: (pm.ScriptDuration || 0) * 1000, task: (pm.TaskDuration || 0) * 1000, wireKB: wire / 1024, reqs, errors});
}

(async () => {
  const srv = await serve(opt("docs", path.join(ROOT, "docs")), PORT);
  const browser = await puppeteer.launch({executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-extensions", "--disable-background-networking"]});
  const result = {label: LABEL, runs: RUNS, profile: "4x CPU, 1.6 Mbps, 150 ms RTT, 360x740", fonts: flag("fonts"), routes: {}};
  for(const route of routes){
    const rs = []; for(let i = 0; i < RUNS; i++) rs.push(await once(browser, route));
    const keys = ["fp", "fcp", "dcl", "load", "sidebar", "view", "tbt", "longest", "nLong", "script", "task", "wireKB", "reqs"];
    const m = {}; keys.forEach(k => m[k] = med(rs.map(x => x[k])));
    m.errors = [...new Set(rs.flatMap(x => x.errors))]; m.rendered = rs.every(x => x.hasView);
    result.routes[route || "(home)"] = m;
    console.log("\n" + (LABEL ? LABEL + " " : "") + "route /#" + route + "  (median of " + RUNS + ")");
    console.log("  FP " + f0(m.fp) + " ms | FCP " + f0(m.fcp) + " | DCL " + f0(m.dcl) + " | load " + f0(m.load) + " | sidebar interactive " + f0(m.sidebar) + " | view rendered " + f0(m.view));
    console.log("  TBT " + f0(m.tbt) + " ms, longest task " + f0(m.longest) + " ms, " + f0(m.nLong) + " long tasks | script " + f0(m.script) + " ms, tasks " + f0(m.task) + " ms | wire " + f0(m.wireKB) + " KB in " + f0(m.reqs) + " requests");
    if(m.errors.length) console.log("  ERRORS: " + m.errors.join(" | "));
    if(!m.rendered) console.log("  WARNING: the view was empty in at least one run");
  }
  const jf = opt("json", ""); if(jf) fs.writeFileSync(jf, JSON.stringify(result, null, 1));
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
