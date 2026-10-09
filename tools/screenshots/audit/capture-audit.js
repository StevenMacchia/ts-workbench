#!/usr/bin/env node
"use strict";
/*
 * One-off audit capture script. Read-only against the built site served at
 * http://localhost:8831 (docs/). Writes PNGs into tools/screenshots/audit/.
 * Modeled on tools/screenshots/capture.js's helpers/builders; does not
 * modify that file or anything under src/ or docs/.
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(__dirname, "..", "node_modules", "puppeteer-core"));

const OUT_DIR = __dirname;
const BASE_URL = process.env.CAPTURE_BASE_URL || "http://localhost:8831";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const DESKTOP_VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 };
const PHONE_VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const PHONE_UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(page, { keepToast = false } = {}) {
  await page.evaluate(() => (document.fonts && document.fonts.ready ? document.fonts.ready : null)).catch(() => {});
  await page.evaluate(() => document.activeElement && document.activeElement.blur()).catch(() => {});
  if (!keepToast) {
    await page.evaluate(() => document.querySelectorAll(".toast, #gtoast").forEach((el) => (el.style.visibility = "hidden"))).catch(() => {});
  }
  await sleep(500);
}

async function gotoHash(page, hash) {
  await page.evaluate((h) => { location.hash = h; }, "#" + hash);
  await sleep(250);
}

async function waitForReload(page) {
  await page.waitForNavigation({ waitUntil: "load", timeout: 8000 }).catch(() => {});
  await sleep(300);
}

async function exists(page, sel) {
  return (await page.$(sel)) !== null;
}

async function clickSel(page, sel, waitMs = 300) {
  await page.waitForSelector(sel, { timeout: 5000 });
  await page.evaluate(() => document.querySelectorAll(".toast, #gtoast").forEach((el) => (el.style.visibility = "hidden")));
  await page.evaluate((s) => { const el = document.querySelector(s); if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" }); }, sel);
  try {
    await page.click(sel);
  } catch (err) {
    const clicked = await page.evaluate((s) => { const el = document.querySelector(s); if (el) { el.click(); return true; } return false; }, sel);
    if (!clicked) throw err;
  }
  await sleep(waitMs);
}

async function clickByText(page, tag, text, waitMs = 300) {
  const clicked = await page.evaluate((tag, text) => {
    const el = Array.from(document.querySelectorAll(tag)).find((e) => e.textContent.trim() === text);
    if (el) { el.click(); return true; }
    return false;
  }, tag, text);
  if (!clicked) throw new Error(`No <${tag}> with text "${text}" found`);
  await sleep(waitMs);
}

async function gdAdvanceAll(page, maxSteps = 30) {
  for (let i = 0; i < maxSteps; i++) {
    const state = await page.evaluate(() => {
      if (!document.querySelector(".gd-s-q")) return "done";
      const next = document.querySelector('[data-gd="next"]');
      if (next && !next.disabled) return "next";
      if (document.querySelector(".gd-opt.on")) return "pick-on";
      if (document.querySelector(".gd-opt")) return "pick-any";
      return "stuck";
    });
    if (state === "done" || state === "stuck") return state;
    if (state === "next") await clickSel(page, '[data-gd="next"]', 150);
    else if (state === "pick-on") await clickSel(page, ".gd-opt.on", 400);
    else await clickSel(page, ".gd-opt", 400);
  }
  return "maxed";
}

const INTRO_ROUTES = [
  "premortem", "tabletop", "maturity", "coverage", "metrics", "vendors", "policy",
  "coppa", "dsa", "eval", "notice", "appeal", "transparency", "plan", "review", "workspace",
];
async function markIntrosSeen(page) {
  await page.evaluate((routes) => {
    routes.forEach((r) => localStorage.setItem("tswb:intro:" + r, "true"));
    localStorage.setItem("tswb:firstrun:seen", "true");
  }, INTRO_ROUTES);
}
async function unmarkIntro(page, route) {
  await page.evaluate((r) => localStorage.removeItem("tswb:intro:" + r), route);
}

async function ensureLightTheme(page) {
  const isDark = await page.evaluate(() => localStorage.getItem("tswb:theme")).catch(() => null);
  if (isDark === '"dark"') {
    await page.evaluate(() => localStorage.removeItem("tswb:theme"));
    await page.reload({ waitUntil: "load" });
    await sleep(300);
    await markIntrosSeen(page);
  }
}
async function setDark(page) {
  await page.evaluate(() => localStorage.setItem("tswb:theme", JSON.stringify("dark")));
  await page.reload({ waitUntil: "load" });
  await sleep(300);
  await markIntrosSeen(page);
}

async function ensureDemoOff(page) {
  if (await exists(page, '[data-demo="exit"]')) {
    await clickSel(page, '[data-demo="exit"]', 100);
    await waitForReload(page);
    await page.waitForFunction(() => !document.querySelector('[data-demo="exit"]'), { timeout: 5000 }).catch(() => {});
    await sleep(200);
  }
}

async function openDemo(page) {
  await ensureLightTheme(page);
  if (!(await exists(page, '[data-demo="exit"]'))) {
    await page.evaluate(() => { location.hash = "#demo"; });
    await waitForReload(page);
    await page.waitForSelector("#dm-welcome", { timeout: 2000 }).catch(() => {});
  } else {
    await gotoHash(page, "overview");
  }
  const welcome = await page.$("#dm-welcome");
  if (welcome) {
    await clickSel(page, '[data-dm="explore"]', 300);
  } else if (await exists(page, '[data-tour="end"]')) {
    await clickSel(page, '[data-tour="end"]', 300);
  }
  await gotoHash(page, "overview");
  await page.evaluate(() => window.scrollTo(0, 0));
}

// ----------------------------------------------------------- state builders

const B = {
  async overviewFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:ws:items"));
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "overview");
    await page.evaluate(() => window.scrollTo(0, 0));
  },
  async overviewDemo(page) { await openDemo(page); },
  async tools(page) { await ensureDemoOff(page); await gotoHash(page, "tools"); },
  async workspaceFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:ws:items"));
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "workspace");
  },
  async workspaceDemo(page) { await openDemo(page); await gotoHash(page, "workspace"); },
  async planFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:ws:items"));
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "plan");
  },
  async planDemo(page) { await openDemo(page); await gotoHash(page, "plan"); },
  async reviewFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:ws:items"));
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "review");
  },
  async reviewDemo(page) { await openDemo(page); await gotoHash(page, "review"); },

  async about(page) { await ensureDemoOff(page); await gotoHash(page, "about"); },
  async roost(page) { await ensureDemoOff(page); await gotoHash(page, "roost"); },
  async credits(page) { await ensureDemoOff(page); await gotoHash(page, "credits"); },
  async learn(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("tswb:learn:")).forEach((k) => localStorage.removeItem(k)));
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "learn");
  },
  async redteamllmMethod(page) { await ensureDemoOff(page); await gotoHash(page, "redteamllm"); },
  async redteamllmPractice(page) { await ensureDemoOff(page); await gotoHash(page, "redteamllm/practice"); },
  async redteamworldMethod(page) { await ensureDemoOff(page); await gotoHash(page, "redteamworld"); },
  async glossary(page) { await ensureDemoOff(page); await gotoHash(page, "glossary"); },
  async tsglossary(page) { await ensureDemoOff(page); await gotoHash(page, "tsglossary"); },

  async redteamFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.setItem("tswb:rt:seen-intro", "true"); localStorage.removeItem("tswb:rt"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "redteam");
    await page.waitForSelector('[data-pick="1"]', { timeout: 8000 }).catch(() => {});
  },
  async redteamAdvanced(page) {
    await B.redteamFresh(page);
    try {
      await clickSel(page, '[data-pick="1"]', 500);
      for (let i = 0; i < 3; i++) {
        const nextBtn = await page.$('[data-rt="next"], [data-act="continue"], .btn.primary');
        if (nextBtn) { await nextBtn.click().catch(() => {}); await sleep(400); }
      }
    } catch (e) { /* best effort */ }
  },

  async policyFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:intro:policy"); localStorage.removeItem("tswb:pol"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await unmarkIntro(page, "policy");
    await gotoHash(page, "policy");
    if (await exists(page, "[data-introbtn='start']")) await clickSel(page, "[data-introbtn='start']", 300);
    if (await exists(page, '[data-gd="start"]')) await clickSel(page, '[data-gd="start"]', 400);
  },
  async policyReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:pol"); localStorage.removeItem("tswb:ws:cur:policy"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "policy");
    await page.waitForSelector(".gd-intro, #pol-full", { timeout: 8000 }).catch(() => {});
    if (await exists(page, ".gd-intro")) await clickByText(page, "button", "Fill everything in on one page", 300);
    await page.waitForSelector("#pol-full", { timeout: 8000 }).catch(() => {});
    if (await exists(page, "#pol-full")) await clickSel(page, "#pol-full", 300);
    if (await exists(page, "#pol-run")) await clickSel(page, "#pol-run", 500);
  },

  async coppaFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:intro:coppa"); localStorage.removeItem("tswb:cp"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await unmarkIntro(page, "coppa");
    await gotoHash(page, "coppa");
    if (await exists(page, "[data-introbtn='start']")) await clickSel(page, "[data-introbtn='start']", 300);
    if (await exists(page, '[data-gd="start"]')) await clickSel(page, '[data-gd="start"]', 400);
  },
  async coppaReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:cp"); localStorage.removeItem("tswb:ws:cur:coppa"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "coppa");
    await clickByText(page, "button", "See a finished example", 400);
  },

  async dsaFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:intro:dsa"); localStorage.removeItem("tswb:ds"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await unmarkIntro(page, "dsa");
    await gotoHash(page, "dsa");
    if (await exists(page, "[data-introbtn='start']")) await clickSel(page, "[data-introbtn='start']", 300);
    if (await exists(page, '[data-gd="start"]')) await clickSel(page, '[data-gd="start"]', 400);
  },
  async dsaReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:ds"); localStorage.removeItem("tswb:ws:cur:dsa"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "dsa");
    await clickByText(page, "button", "See a finished example", 400);
  },

  async evalFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:intro:eval"); localStorage.removeItem("tswb:ev"); localStorage.removeItem("tswb:ws:cur:eval"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await unmarkIntro(page, "eval");
    await gotoHash(page, "eval");
  },
  async evalReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:ev"); localStorage.removeItem("tswb:ws:cur:eval"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "eval");
    await clickSel(page, '[data-ev="example"]', 300);
    await page.evaluate(() => { const el = document.querySelector("#ev-s3"); if (el) el.scrollIntoView({ block: "start" }); });
  },

  async maturityFresh(page) { await ensureDemoOff(page); await gotoHash(page, "maturity"); },
  async maturityReport(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "maturity");
    await clickSel(page, '[data-ma="example"]', 300);
  },

  async coverageFresh(page) { await ensureDemoOff(page); await gotoHash(page, "coverage"); },
  async coverageReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:cv"); localStorage.removeItem("tswb:ws:cur:coverage"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "coverage");
    await page.waitForSelector('[data-cv="example"]', { timeout: 8000 }).catch(() => {});
    if (await exists(page, '[data-cv="example"]')) await clickSel(page, '[data-cv="example"]', 400);
  },

  async noticeFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:intro:notice"); localStorage.removeItem("tswb:ai:notice"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await unmarkIntro(page, "notice");
    await gotoHash(page, "notice");
    if (await exists(page, "[data-introbtn='start']")) await clickSel(page, "[data-introbtn='start']", 300);
    if (await exists(page, '[data-gd="start"]')) await clickSel(page, '[data-gd="start"]', 400);
  },
  async noticeReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:ai:notice"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "notice");
    if (await exists(page, "[data-introbtn='start']")) await clickSel(page, "[data-introbtn='start']", 300);
    if (await exists(page, '[data-gd="alt2"]')) await clickSel(page, '[data-gd="alt2"]', 400);
    else if (await exists(page, "#ai-sample")) await clickSel(page, "#ai-sample", 400);
  },

  async appealFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:intro:appeal"); localStorage.removeItem("tswb:ai:appeal"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await unmarkIntro(page, "appeal");
    await gotoHash(page, "appeal");
    if (await exists(page, "[data-introbtn='start']")) await clickSel(page, "[data-introbtn='start']", 300);
    if (await exists(page, '[data-gd="start"]')) await clickSel(page, '[data-gd="start"]', 400);
  },
  async appealReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:ai:appeal"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "appeal");
    if (await exists(page, "#ai-sample")) await clickSel(page, "#ai-sample", 600);
    else await clickByText(page, "button", "See an example result", 600);
  },

  async transparencyFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:intro:transparency"); localStorage.removeItem("tswb:tr"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await unmarkIntro(page, "transparency");
    await gotoHash(page, "transparency");
    if (await exists(page, "[data-introbtn='start']")) await clickSel(page, "[data-introbtn='start']", 300);
    if (await exists(page, '[data-gd="start"]')) await clickSel(page, '[data-gd="start"]', 400);
  },
  async transparencyReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:tr"); localStorage.removeItem("tswb:ws:cur:transparency"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "transparency");
    await page.waitForSelector(".gd-intro", { timeout: 8000 }).catch(() => {});
    if (await exists(page, ".gd-intro")) await clickByText(page, "button", "See an example", 400);
    await sleep(200);
    if (await exists(page, '[data-gd="resume"]')) await clickSel(page, '[data-gd="resume"]', 300);
    else if (await exists(page, '[data-gd="start"]')) await clickSel(page, '[data-gd="start"]', 300);
    await gdAdvanceAll(page);
  },

  async premortemFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:pm3"); localStorage.removeItem("tswb:ws:items"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "premortem");
  },
  async premortemReport(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => { localStorage.removeItem("tswb:pm3"); localStorage.removeItem("tswb:ws:items"); });
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "premortem");
    await page.waitForSelector('[data-act="report"]', { timeout: 8000 });
    await clickSel(page, '[data-act="report"]');
    await page.evaluate(() => window.scrollTo(0, 0));
  },

  async tabletopFresh(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:tt"));
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "tabletop");
    await page.waitForSelector('.scen[data-i="0"]', { timeout: 8000 });
  },
  async tabletopPlay(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:tt"));
    await page.reload({ waitUntil: "load" });
    await markIntrosSeen(page);
    await gotoHash(page, "tabletop");
    await page.waitForSelector('.scen[data-i="0"]', { timeout: 8000 });
    await clickSel(page, '.scen[data-i="0"]', 400);
  },

  async metricsFresh(page) { await ensureDemoOff(page); await gotoHash(page, "metrics"); },
  async metricsOnepager(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "metrics");
    await clickSel(page, '[data-tab="mine"]', 300);
    if (await exists(page, "#mx-demo")) await clickSel(page, "#mx-demo", 300);
    await clickSel(page, "#mx-op", 400);
  },

  async vendors(page) { await ensureDemoOff(page); await gotoHash(page, "vendors"); },
};

// -------------------------------------------------------------- routes list

const ROUTES = [
  { r: "overview", states: [["fresh", B.overviewFresh], ["demo", B.overviewDemo]] },
  { r: "tools", states: [["fresh", B.tools]] },
  { r: "workspace", states: [["fresh", B.workspaceFresh], ["demo", B.workspaceDemo]] },
  { r: "plan", states: [["fresh", B.planFresh], ["demo", B.planDemo]] },
  { r: "review", states: [["fresh", B.reviewFresh], ["demo", B.reviewDemo]] },
  { r: "about", states: [["fresh", B.about]] },
  { r: "roost", states: [["fresh", B.roost]] },
  { r: "credits", states: [["fresh", B.credits]] },
  { r: "learn", states: [["fresh", B.learn]] },
  { r: "redteamllm", states: [["method", B.redteamllmMethod], ["practice", B.redteamllmPractice]] },
  { r: "redteamworld", states: [["method", B.redteamworldMethod]] },
  { r: "glossary", states: [["fresh", B.glossary]] },
  { r: "tsglossary", states: [["fresh", B.tsglossary]] },
  { r: "redteam", states: [["fresh", B.redteamFresh], ["advanced", B.redteamAdvanced]] },
  { r: "policy", states: [["fresh", B.policyFresh], ["report", B.policyReport]] },
  { r: "coppa", states: [["fresh", B.coppaFresh], ["report", B.coppaReport]] },
  { r: "dsa", states: [["fresh", B.dsaFresh], ["report", B.dsaReport]] },
  { r: "eval", states: [["fresh", B.evalFresh], ["report", B.evalReport]] },
  { r: "maturity", states: [["fresh", B.maturityFresh], ["report", B.maturityReport]] },
  { r: "coverage", states: [["fresh", B.coverageFresh], ["report", B.coverageReport]] },
  { r: "notice", states: [["fresh", B.noticeFresh], ["report", B.noticeReport]] },
  { r: "appeal", states: [["fresh", B.appealFresh], ["report", B.appealReport]] },
  { r: "transparency", states: [["fresh", B.transparencyFresh], ["report", B.transparencyReport]] },
  { r: "premortem", states: [["fresh", B.premortemFresh], ["report", B.premortemReport]] },
  { r: "tabletop", states: [["fresh", B.tabletopFresh], ["play", B.tabletopPlay]] },
  { r: "metrics", states: [["map", B.metricsFresh], ["onepager", B.metricsOnepager]] },
  { r: "vendors", states: [["fresh", B.vendors]] },
];

async function shoot(page, name) {
  const vp = path.join(OUT_DIR, name + "-1440-viewport.png");
  const fp = path.join(OUT_DIR, name + "-1440-full.png");
  await page.setViewport(DESKTOP_VIEWPORT);
  await settle(page);
  await page.screenshot({ path: vp, type: "png" });
  await page.screenshot({ path: fp, type: "png", fullPage: true });
  console.log("wrote", vp, fp);
}
async function shootPhone(page, name) {
  await page.emulate({ viewport: PHONE_VIEWPORT, userAgent: PHONE_UA });
  await sleep(300);
  await settle(page);
  const pp = path.join(OUT_DIR, name + "-390-phone.png");
  await page.screenshot({ path: pp, type: "png", fullPage: true });
  console.log("wrote", pp);
}

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: "new", defaultViewport: null });
  const only = process.argv[2]; // optional: route name filter, e.g. "coppa" or "extras"
  try {
    const page = await browser.newPage();
    await page.setViewport(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL + "/", { waitUntil: "load" });
    await markIntrosSeen(page);
    await settle(page);

    if (!only || only === "routes") {
      for (const route of ROUTES) {
        for (const [stateName, builder] of route.states) {
          const name = `${route.r}-${stateName}`;
          try {
            await ensureLightTheme(page);
            await page.setViewport(DESKTOP_VIEWPORT);
            await builder(page);
            await shoot(page, name);
            await shootPhone(page, name);
            await page.setViewport(DESKTOP_VIEWPORT);
          } catch (err) {
            console.error("FAILED", name, err.message);
          }
        }
      }
    }

    if (!only || only === "extras") {
      // palette
      await ensureLightTheme(page);
      await page.setViewport(DESKTOP_VIEWPORT);
      await ensureDemoOff(page);
      await gotoHash(page, "overview");
      await clickSel(page, '[data-cmdk="1"]', 300);
      await page.waitForSelector("#cmdk:not([hidden])", { timeout: 3000 }).catch(() => {});
      await page.type("#cmdk-q", "coverage").catch(() => {});
      await sleep(300);
      await shoot(page, "extra-palette");
      await page.keyboard.press("Escape").catch(() => {});
      await sleep(200);

      // +New menu
      await clickSel(page, "#tb-new", 300);
      await page.waitForSelector("#tb-menu:not([hidden])", { timeout: 3000 }).catch(() => {});
      await shoot(page, "extra-newmenu");
      await page.keyboard.press("Escape").catch(() => {});
      await sleep(200);

      // tracker export modal (via coppa example)
      await B.coppaReport(page);
      if (await exists(page, '[data-cp="tasks"]')) {
        await clickSel(page, '[data-cp="tasks"]', 400);
        await page.waitForSelector("#tk", { timeout: 4000 }).catch(() => {});
        await shoot(page, "extra-modal-tracker");
        await shootPhone(page, "extra-modal-tracker");
        await page.setViewport(DESKTOP_VIEWPORT);
      } else {
        console.error("FAILED extra-modal-tracker: no [data-cp=tasks] button found");
      }

      // guided question screen (coppa fresh, already a question-1 state)
      await B.coppaFresh(page);
      await shoot(page, "extra-guided-question");

      // toast visible (Example loaded..., without hiding it)
      await page.evaluate(() => { localStorage.removeItem("tswb:cp"); localStorage.removeItem("tswb:ws:cur:coppa"); });
      await page.reload({ waitUntil: "load" });
      await markIntrosSeen(page);
      await gotoHash(page, "coppa");
      await page.waitForSelector('[data-cp="example"]', { timeout: 8000 }).catch(() => {});
      if (await exists(page, '[data-cp="example"]')) {
        await page.click('[data-cp="example"]').catch(() => {});
        await sleep(250); // before settle()'s toast-hide would run
        await settle(page, { keepToast: true });
        await page.screenshot({ path: path.join(OUT_DIR, "extra-toast-1440-viewport.png"), type: "png" });
        console.log("wrote extra-toast");
      }

      // dark mode: home + one report
      await setDark(page);
      await gotoHash(page, "overview");
      await shoot(page, "extra-dark-home");
      await shootPhone(page, "extra-dark-home");
      await B.coppaReport(page);
      await shoot(page, "extra-dark-report-coppa");
      await ensureLightTheme(page);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
