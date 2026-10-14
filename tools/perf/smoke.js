#!/usr/bin/env node
"use strict";
/*
 * Browser check of the built site and its lazy sections (docs/ and docs/parts/*.js). Not part of `npm test` (needs Chrome and
 * puppeteer-core); run it after any change to the chunk list or to a part that a section touches.
 *   node tools/perf/smoke.js [--port=8833] [--docs=folder]
 * Checks, against a local server: every route opened as a fresh deep link renders into #view with no script errors; the section
 * files are fetched only for the routes that need them (and once); a section that fails to download shows a retry that works;
 * and the places in the core that reach into a section (saved red team items, "Start something new", the intro walkthrough,
 * the studio bridge from a Learn guide) load it first.
 */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith("--" + k + "=")); return a ? a.split("=").slice(1).join("=") : d; };
const PORT = +opt("port", 8833), DOCS = opt("docs", path.join(ROOT, "docs"));
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
function loadPuppeteer(){
  const tries = [process.env.PUPPETEER_DIR, path.join(ROOT, "tools", "screenshots", "node_modules"), path.join(ROOT, "..", "..", "ts-workbench", "tools", "screenshots", "node_modules")].filter(Boolean);
  for(const t of tries){ try{ return require(require.resolve("puppeteer-core", {paths: [t]})); }catch(e){} }
  throw new Error("puppeteer-core not found; set PUPPETEER_DIR to a node_modules folder that has it");
}
const puppeteer = loadPuppeteer(), serve = require("./serve");
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
const ok = (c, msg) => { if(!c) failed++; console.log((c ? "  ok    " : "  FAIL  ") + msg); };
const BASE = "http://localhost:" + PORT;

(async () => {
  let down = false;
  const srv = await serve(DOCS, PORT, {failParts: () => down});
  const browser = await puppeteer.launch({executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-extensions"]});
  async function open(url, seed){
    const ctx = await browser.createBrowserContext(), page = await ctx.newPage(), errors = [];
    page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
    page.on("console", m => { if(m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200)); });
    await page.setRequestInterception(true);
    page.on("request", r => r.url().startsWith(BASE) ? r.continue() : r.abort());
    await page.setViewport({width: 1280, height: 900});
    await page.evaluateOnNewDocument((seedItems) => { try{ localStorage.setItem("tswb:firstrun:seen", "true"); ["premortem","tabletop","maturity","coverage","metrics","vendors","policy","coppa","dsa","eval","notice","appeal","transparency","plan","review","workspace"].forEach(r => localStorage.setItem("tswb:intro:" + r, "true")); (seedItems || []).forEach(([k, v]) => localStorage.setItem(k, v)); }catch(e){} }, seed || []);
    srv.stats.reset();
    await page.goto(BASE + url, {waitUntil: "load"});
    return {ctx, page, errors, parts: () => srv.stats.requests.filter(u => u.includes("/parts/")).map(u => u.split("?")[0].split("/").pop())};
  }
  async function settled(page, ms){
    const t0 = Date.now();
    while(Date.now() - t0 < (ms || 10000)){
      const s = await page.evaluate(() => { const v = document.getElementById("view"); return {n: v ? v.children.length : 0, lazy: !!document.querySelector(".lazy-load")}; });
      if(s.n && !s.lazy) return true;
      await sleep(100);
    }
    return false;
  }

  // --- 1. every route as a deep link
  let a = await open("/");
  const routes = await a.page.evaluate(() => Object.keys(ROUTES));
  ok(await settled(a.page) && !a.errors.length, "home renders, no errors, no section requested (" + a.parts().join(",") + ")");
  ok(a.parts().length === 0, "home requests no section file");
  await a.ctx.close();
  const expect = {learn: ["learn.js"], redteamllm: ["learn.js"], redteamworld: ["learn.js"], glossary: ["learn.js"], tsglossary: ["tsglossary.js"], redteam: ["learn.js", "redteam.js"]};
  for(const r of routes){
    const p = await open("/#" + r), good = await settled(p.page), got = p.parts().sort(), want = (expect[r] || []).slice().sort();
    ok(good && !p.errors.length && JSON.stringify(got) === JSON.stringify(want), "/#" + r + (good ? " renders" : " DID NOT RENDER") + (want.length ? ", loads " + got.join("+") : ", no section") + (p.errors.length ? "  errors: " + p.errors.join(" | ") : ""));
    await p.ctx.close();
  }
  // sub-routes and a section reached twice load their file once
  let b = await open("/#redteamllm/practice");
  ok(await settled(b.page) && !b.errors.length, "/#redteamllm/practice renders its tab");
  await b.page.evaluate(() => { location.hash = "#glossary"; });
  await sleep(500); ok(await settled(b.page) && b.parts().filter(x => x === "learn.js").length === 1, "moving to the glossary from a Learn guide does not fetch the section again");
  await b.page.evaluate(() => goHash("redteam"));
  ok(await settled(b.page) && b.parts().includes("redteam.js") && !b.errors.length, "from a Learn guide into the studio loads only the studio file (" + b.parts().join(",") + ")");
  await b.ctx.close();

  // --- 2. click path from the sidebar, with the loading state in between
  let c = await open("/");
  await settled(c.page);
  await c.page.click('.side a[data-route="tsglossary"], a[data-route="tsglossary"]');
  ok(await settled(c.page) && (await c.page.evaluate(() => /glossary/i.test(document.getElementById("view").textContent))) && !c.errors.length, "sidebar click opens the T&S glossary after loading it");
  ok(c.parts().join(",") === "tsglossary.js", "only tsglossary.js fetched for that click (" + c.parts().join(",") + ")");
  await c.ctx.close();

  // --- 3. failure then retry
  down = true;
  let d = await open("/#glossary");
  await sleep(1500);
  const errShown = await d.page.evaluate(() => !!document.getElementById("lazy-retry"));
  ok(errShown, "a section that cannot be downloaded shows a retry card");
  down = false;
  if(errShown){ await d.page.click("#lazy-retry"); ok(await settled(d.page) && !(await d.page.evaluate(() => !!document.getElementById("lazy-retry"))), "retry loads the section and renders the page"); }
  await d.ctx.close();

  // --- 4. core code that reaches into a section
  const rtItem = {id: "RT-0001", kind: "redteam", title: "Saved studio run", projectId: null, created: Date.now(), updated: Date.now(), data: {model: "llm", findings: [{sev: 2, status: "open"}], langs: "English"}};
  const lnItem = {id: "EX-0001", kind: "learn", title: "Saved exercise", projectId: null, created: Date.now(), updated: Date.now(), data: {guide: "llm", exId: "e1", text: "my notes"}};
  const seed = [["tswb:ws:items", JSON.stringify({"RT-0001": rtItem, "EX-0001": lnItem})]];
  let e = await open("/#workspace", seed);
  ok(await settled(e.page) && e.parts().length === 0, "My workspace lists a saved red team run and a saved exercise without loading a section");
  const summary = await e.page.evaluate(() => document.getElementById("view").textContent);
  ok(/1 open finding/.test(summary), "saved red team run keeps its findings summary");
  await e.page.evaluate(() => openSaved("RT-0001"));
  await sleep(300); ok(await settled(e.page) && e.parts().includes("redteam.js") && (await e.page.evaluate(() => hashNow())) === "redteam", "opening a saved red team run loads the studio and lands there");
  await e.page.evaluate(() => goHash("workspace")); await settled(e.page);
  await e.page.evaluate(() => openSaved("EX-0001"));
  await sleep(300); ok(await settled(e.page) && (await e.page.evaluate(() => hashNow())).startsWith("redteamllm"), "opening a saved exercise lands on its guide");
  ok(!e.errors.length, "no script errors in those flows" + (e.errors.length ? ": " + e.errors.join(" | ") : ""));
  await e.ctx.close();

  let f = await open("/#workspace", seed);
  await settled(f.page);
  if(await f.page.$('[data-ws-new="redteam"]')){ await f.page.click('[data-ws-new="redteam"]'); await sleep(300); ok(await settled(f.page) && (await f.page.evaluate(() => hashNow())) === "redteam" && !f.errors.length, "'Start something new: Red team studio' loads the studio first");
  } else ok(true, "(workspace is empty: 'Start something new' row not shown, skipped)");
  await f.ctx.close();

  let g = await open("/#premortem");
  await settled(g.page);
  await g.page.evaluate(() => walkOpen("premortem"));
  await sleep(600);
  ok(await g.page.evaluate(() => !!document.getElementById("ln-modal") && !document.getElementById("ln-modal").hidden) && g.parts().includes("learn.js"), "the intro walkthrough loads the Learn section for its modal");
  ok(!g.errors.length, "no script errors" + (g.errors.length ? ": " + g.errors.join(" | ") : ""));
  await g.ctx.close();

  let h = await open("/#redteamllm/method");
  await settled(h.page);
  await h.page.evaluate(() => lnToStudio("llm", "scope"));
  await sleep(300); ok(await settled(h.page) && (await h.page.evaluate(() => hashNow())) === "redteam" && h.parts().includes("redteam.js") && !h.errors.length, "'Do this in the studio' from a Learn guide loads the studio and opens it" + (h.errors.length ? ": " + h.errors.join(" | ") : ""));
  await h.ctx.close();

  // --- 5. the All tools page shows the studio and glossary cards before either is loaded
  let i = await open("/#tools");
  await settled(i.page);
  const cards = await i.page.evaluate(() => ({rt: !!document.querySelector('#view a[href="#redteam"]'), tsg: !!document.querySelector('#view a[href="#tsglossary"]'), txt: document.getElementById("view").textContent}));
  ok(cards.rt && cards.tsg && /16 harm areas/.test(cards.txt) && /103 everyday/.test(cards.txt) && i.parts().length === 0, "All tools lists the studio (16 harm areas) and T&S glossary (103 terms) without loading them");
  await i.ctx.close();

  await browser.close(); srv.close();
  console.log(failed ? "\n" + failed + " check(s) failed" : "\nall checks passed");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
