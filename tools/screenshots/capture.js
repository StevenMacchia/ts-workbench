#!/usr/bin/env node
"use strict";
/*
 * Regenerates the T&S Workbench's README screenshots (assets/*.png) and the
 * portfolio site's showcase images (../stevenmacchia.github.io/img/*.jpg)
 * from the local build served at http://localhost:8765.
 *
 * Usage:
 *   node capture.js              # regenerate every target
 *   node capture.js overview.png # regenerate just one target (by output filename)
 *   node capture.js overview.png vendors.jpg   # or a few
 *
 * Requires: puppeteer-core (installed in this folder) and a local Chrome at
 * the path in CHROME_PATH below. Does not download Chromium.
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "..", "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const PORTFOLIO_IMG_DIR =
  process.env.PORTFOLIO_IMG_DIR ||
  path.join(ROOT, "..", "stevenmacchia.github.io", "img");

const BASE_URL = "http://localhost:8765";
const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1.5 };
const SETTLE_MS = 600;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- server ---

async function isServerUp() {
  try {
    const res = await fetch(BASE_URL + "/", { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isServerUp()) {
    console.log("Reusing the static server already running at " + BASE_URL);
    return null;
  }
  console.log("Starting `npx --yes serve docs -l 8765 --no-clipboard`...");
  const { spawn } = require("child_process");
  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["--yes", "serve", "docs", "-l", "8765", "--no-clipboard"],
    { cwd: ROOT, stdio: "ignore", shell: false }
  );
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    if (await isServerUp()) return child;
  }
  child.kill();
  throw new Error("Static server did not come up on " + BASE_URL);
}

// ----------------------------------------------------------------- utils ---

async function settle(page) {
  await page
    .evaluate(() => (document.fonts && document.fonts.ready ? document.fonts.ready : null))
    .catch(() => {});
  // Clicking buttons during setup leaves a focus ring in the shot; clear it.
  await page.evaluate(() => document.activeElement && document.activeElement.blur()).catch(() => {});
  // "Example loaded" / "Saved" toasts are transient; hide any still showing.
  await page
    .evaluate(() => document.querySelectorAll(".toast, #gtoast").forEach((el) => (el.style.visibility = "hidden")))
    .catch(() => {});
  await sleep(SETTLE_MS);
}

async function gotoHash(page, hash) {
  await page.evaluate((h) => {
    location.hash = h;
  }, "#" + hash);
  await sleep(250);
}

async function waitForReload(page) {
  await page
    .waitForNavigation({ waitUntil: "load", timeout: 8000 })
    .catch(() => {});
  await sleep(300);
}

async function clickSel(page, sel, waitMs = 300) {
  await page.waitForSelector(sel, { timeout: 5000 });
  await page.click(sel);
  await sleep(waitMs);
}

async function exists(page, sel) {
  return (await page.$(sel)) !== null;
}

// Clicks the first element matching `tag` whose exact trimmed text matches.
// Several of the app's links/buttons (guided-intro "Other ways in" actions)
// have no stable id or data attribute, only their label.
async function clickByText(page, tag, text, waitMs = 300) {
  const clicked = await page.evaluate(
    (tag, text) => {
      const el = Array.from(document.querySelectorAll(tag)).find(
        (e) => e.textContent.trim() === text
      );
      if (el) {
        el.click();
        return true;
      }
      return false;
    },
    tag,
    text
  );
  if (!clicked) throw new Error(`No <${tag}> with text "${text}" found`);
  await sleep(waitMs);
}

// Theme must be light for every target except overview-dark.
async function ensureLightTheme(page) {
  const isDark = await page
    .evaluate(() => localStorage.getItem("tswb:theme"))
    .catch(() => null);
  if (isDark === '"dark"') {
    await page.evaluate(() => localStorage.removeItem("tswb:theme"));
    await page.reload({ waitUntil: "load" });
    await sleep(300);
  }
}

async function ensureDemoOff(page) {
  if (await exists(page, '[data-demo="exit"]')) {
    await clickSel(page, '[data-demo="exit"]', 100);
    await waitForReload(page);
    // demoExit() reloads to #overview; make sure that navigation is fully
    // settled (and the exit pill is really gone) before moving on.
    await page
      .waitForFunction(() => !document.querySelector('[data-demo="exit"]'), { timeout: 5000 })
      .catch(() => {});
    await sleep(200);
  }
}

// Brings the app to the demo's plain overview (welcome dismissed), or, with
// tour:true, to the fresh "1 of 5" tour tooltip over the overview header.
async function openOverviewDemo(page, { tour = false } = {}) {
  await ensureLightTheme(page);
  if (!(await exists(page, '[data-demo="exit"]'))) {
    await page.evaluate(() => {
      location.hash = "#demo";
    });
    await waitForReload(page);
    // The welcome modal shows itself via setTimeout(…, 300) after load.
    await page.waitForSelector("#dm-welcome", { timeout: 2000 }).catch(() => {});
  } else {
    await gotoHash(page, "overview");
  }
  const welcome = await page.$("#dm-welcome");
  if (welcome) {
    if (tour) {
      await clickSel(page, '[data-dm="tour"]', 300);
      return; // leave the "1 of 5" tooltip showing
    }
    await clickSel(page, '[data-dm="explore"]', 300);
  } else if (await exists(page, '[data-tour="end"]')) {
    // A tour from an earlier target in this run is still open.
    if (tour) return; // already in the state we want
    await clickSel(page, '[data-tour="end"]', 300);
  } else if (tour) {
    // Welcome already consumed earlier in this run; no fresh tour available.
    console.warn(
      "  (note: demo welcome was already dismissed this run, so the fresh tour tooltip can't be reshown; run this target alone to see it)"
    );
  }
  await gotoHash(page, "overview");
  await page.evaluate(() => window.scrollTo(0, 0));
}

// ------------------------------------------------------------- builders ---
// Each builder leaves `page` scrolled/clicked into the state a target should
// be screenshotted in. They are self-contained so any single target can be
// rebuilt on its own.

const builders = {
  async overview(page) {
    await openOverviewDemo(page, { tour: false });
  },
  async overviewDemo(page) {
    await openOverviewDemo(page, { tour: true });
  },
  async overviewNext(page) {
    await openOverviewDemo(page, { tour: false });
    await page.evaluate(() => {
      const el = document.querySelector(".as-s.cur");
      if (el) el.scrollIntoView({ block: "center" });
    });
    await sleep(200);
  },
  async overviewRc(page) {
    await openOverviewDemo(page, { tour: false });
    await page.evaluate(() => {
      const el = document.querySelector(".as-pic");
      if (el) el.scrollIntoView({ block: "start" });
    });
    await sleep(200);
  },
  async overviewDark(page) {
    await openOverviewDemo(page, { tour: false });
    await page.evaluate(() => localStorage.setItem("tswb:theme", JSON.stringify("dark")));
    await page.reload({ waitUntil: "load" });
    await sleep(300);
    await page.evaluate(() => window.scrollTo(0, 0));
  },
  async premortem(page) {
    await ensureDemoOff(page);
    // Start from a clean, unengaged state every time (re-running this
    // builder in the same session would otherwise skip past the landing:
    // opening the report once saves it into the workspace library).
    await page.evaluate(() => {
      localStorage.removeItem("tswb:pm3");
      localStorage.removeItem("tswb:ws:items");
    });
    // A same-document hash change alone wouldn't re-run the page's top-level
    // `let pm = …` init, so a leftover in-memory pm from an earlier target
    // in this run could still show a saved/finished report. Force a true
    // reload so pm is rebuilt fresh from the (now-cleared) storage above.
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "premortem");
    await page.waitForSelector('[data-act="report"]', { timeout: 8000 });
    await clickSel(page, '[data-act="report"]');
    await page.evaluate(() => window.scrollTo(0, 0));
  },
  async tabletop(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:tt"));
    await page.reload({ waitUntil: "load" }); // see the note in premortem() above
    await gotoHash(page, "tabletop");
    await page.waitForSelector('.scen[data-i="0"]', { timeout: 8000 });
    await clickSel(page, '.scen[data-i="0"]', 400);
  },
  async vendors(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "vendors");
  },
  async appeal(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "appeal");
    if (await exists(page, "#ai-sample")) {
      await clickSel(page, "#ai-sample", 600);
    } else {
      await clickByText(page, "button", "See an example result", 600);
    }
  },
  async metricsMap(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "metrics");
  },
  async metricsOnepager(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "metrics");
    await clickSel(page, '[data-tab="mine"]', 300);
    if (await exists(page, "#mx-demo")) await clickSel(page, "#mx-demo", 300);
    await clickSel(page, "#mx-op", 400);
  },
  async coverage(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "coverage");
    if (await exists(page, '[data-cvg="start"]')) {
      await clickSel(page, '[data-cvg="start"]', 300);
    } else if (await exists(page, '[data-cvg="resume"]')) {
      await clickSel(page, '[data-cvg="resume"]', 300);
    }
    if (await exists(page, '[data-cvg="first"]')) {
      await clickSel(page, '[data-cvg="first"]', 300);
    }
    // Answer Child safety's 5 questions, then Sexual harm's first question,
    // landing on "Sexual harm · Question 2 of 5".
    for (let i = 0; i < 5; i++) {
      if (await exists(page, '[data-cvpick="2"]')) {
        await clickSel(page, '[data-cvpick="2"]', 400);
      }
    }
    if (await exists(page, '[data-cvg="next"]')) {
      await clickSel(page, '[data-cvg="next"]', 300);
    }
    if (await exists(page, '[data-cvpick="2"]')) {
      await clickSel(page, '[data-cvpick="2"]', 400);
    }
  },
  async maturity(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "maturity");
    await clickSel(page, '[data-ma="example"]', 300);
  },
  async evalReport(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "eval");
    // Start from a clean run so the "See a finished example first" link is
    // offered (a prior run in this browser profile would hide it).
    await page.evaluate(() => {
      localStorage.removeItem("tswb:ev");
      localStorage.removeItem("tswb:ws:cur:eval");
    });
    await page.reload({ waitUntil: "load" });
    await sleep(300);
    await gotoHash(page, "eval");
    await clickSel(page, '[data-ev="example"]', 300);
    await page.evaluate(() => {
      const el = document.querySelector("#ev-s3");
      if (el) el.scrollIntoView({ block: "start" });
    });
    await sleep(200);
  },
  async compliance(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "dsa");
    if (await exists(page, '[data-ds="example"]')) {
      await clickSel(page, '[data-ds="example"]', 300);
    } else {
      await clickByText(page, "button", "See a finished example", 300);
    }
  },
};

// ------------------------------------------------------------- targets ---
// kind: "png" (workbench README, assets/) or "jpeg" (portfolio, quality 82)

const targets = [
  // overview-demo must be captured first in a full run: it needs the demo's
  // one-time welcome tour, which the other overview targets dismiss.
  { name: "overview-demo.png", kind: "png", dir: "assets", build: builders.overviewDemo },
  { name: "overview.png", kind: "png", dir: "assets", build: builders.overview },
  { name: "overview-next.png", kind: "png", dir: "assets", build: builders.overviewNext },
  { name: "overview-rc.png", kind: "png", dir: "assets", build: builders.overviewRc },
  { name: "overview-dark.png", kind: "png", dir: "assets", build: builders.overviewDark },
  { name: "premortem-report.png", kind: "png", dir: "assets", build: builders.premortem },
  { name: "tabletop-play.png", kind: "png", dir: "assets", build: builders.tabletop },
  { name: "vendors.png", kind: "png", dir: "assets", build: builders.vendors },
  { name: "appeal.png", kind: "png", dir: "assets", build: builders.appeal },
  { name: "metrics-map.png", kind: "png", dir: "assets", build: builders.metricsMap },
  { name: "metrics-onepager.png", kind: "png", dir: "assets", build: builders.metricsOnepager },

  { name: "overview.jpg", kind: "jpeg", dir: "portfolio", build: builders.overview },
  { name: "premortem.jpg", kind: "jpeg", dir: "portfolio", build: builders.premortem },
  { name: "tabletop.jpg", kind: "jpeg", dir: "portfolio", build: builders.tabletop },
  { name: "metrics.jpg", kind: "jpeg", dir: "portfolio", build: builders.metricsMap },
  { name: "vendors.jpg", kind: "jpeg", dir: "portfolio", build: builders.vendors },
  { name: "coverage.jpg", kind: "jpeg", dir: "portfolio", build: builders.coverage },
  { name: "maturity.jpg", kind: "jpeg", dir: "portfolio", build: builders.maturity },
  { name: "eval.jpg", kind: "jpeg", dir: "portfolio", build: builders.evalReport },
  { name: "compliance.jpg", kind: "jpeg", dir: "portfolio", build: builders.compliance },
  { name: "ai.jpg", kind: "jpeg", dir: "portfolio", build: builders.appeal },
];

// -------------------------------------------------------------- main ------

async function main() {
  const wanted = process.argv.slice(2).map((s) => s.toLowerCase());
  const list = wanted.length
    ? targets.filter((t) => wanted.includes(t.name.toLowerCase()))
    : targets;

  if (wanted.length && list.length === 0) {
    console.error("No matching target for: " + wanted.join(", "));
    console.error("Known targets: " + targets.map((t) => t.name).join(", "));
    process.exit(1);
  }

  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const havePortfolio = fs.existsSync(PORTFOLIO_IMG_DIR);
  if (!havePortfolio && list.some((t) => t.dir === "portfolio")) {
    console.warn(
      "Portfolio image folder not found at " +
        PORTFOLIO_IMG_DIR +
        " -- portfolio targets will be skipped. Set PORTFOLIO_IMG_DIR to override."
    );
  }

  const serverChild = await ensureServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.evaluateOnNewDocument(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent =
          "::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}" +
          "html{scrollbar-width:none!important}";
        document.head.appendChild(style);
      });
    });
    await page.goto(BASE_URL + "/", { waitUntil: "load" });
    await settle(page);

    for (const t of list) {
      if (t.dir === "portfolio" && !havePortfolio) {
        console.log("Skipping " + t.name + " (no portfolio folder)");
        continue;
      }
      const outDir = t.dir === "assets" ? ASSETS_DIR : PORTFOLIO_IMG_DIR;
      const outPath = path.join(outDir, t.name);
      try {
        await t.build(page);
        await settle(page);
        if (t.kind === "png") {
          await page.screenshot({ path: outPath, type: "png" });
        } else {
          await page.screenshot({ path: outPath, type: "jpeg", quality: 82 });
        }
        console.log("Wrote " + outPath);
      } catch (err) {
        console.error("Failed to capture " + t.name + ": " + err.message);
        if (process.env.DEBUG_CAPTURE) {
          const dbg = await page
            .evaluate(() => ({
              url: location.href,
              readyState: document.readyState,
              viewHTML: (document.querySelector("#view") || document.body).innerHTML.slice(0, 800),
            }))
            .catch((e) => ({ evalError: String(e) }));
          console.error("  debug:", dbg);
        }
      }
    }
  } finally {
    await browser.close();
    if (serverChild) serverChild.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
