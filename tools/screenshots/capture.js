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
 * Review passes (not part of the regular README/portfolio targets above):
 *   node capture.js --phone      # every tool at a phone viewport, full-page,
 *                                # into assets/review/phone/<route>.png
 *   node capture.js --dark       # every tool at 1440x900 in dark mode, into
 *                                # assets/review/dark/<route>.png
 *   node capture.js --phone --dark   # both passes, one after another
 * With neither flag, the script behaves exactly as before (the targets
 * list above). See README.md for more on the review passes.
 *
 * Card thumbnails (these ship with the site):
 *   node capture.js --thumbs     # every tool on the All tools page and the
 *                                # Learn hub in its example/report state at
 *                                # 1440x900, cropped to the content area and
 *                                # downscaled to 640x400 JPEG into
 *                                # docs/thumbs/<route>.jpg (keep < 1.5 MB total)
 *
 * Requires: puppeteer-core (installed in this folder) and a local Chrome at
 * the path in CHROME_PATH below. Does not download Chromium.
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "..", "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const REVIEW_DIR = path.join(ASSETS_DIR, "review");
const PORTFOLIO_IMG_DIR =
  process.env.PORTFOLIO_IMG_DIR ||
  path.join(ROOT, "..", "stevenmacchia.github.io", "img");

// CAPTURE_PORT/CAPTURE_BASE_URL exist only so this script can be pointed at
// a throwaway server during development without touching the port (8765)
// the README and other tooling assume; normal use needs neither.
const PORT = process.env.CAPTURE_PORT || 8765;
const BASE_URL = process.env.CAPTURE_BASE_URL || "http://localhost:" + PORT;
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
  console.log("Starting `npx --yes serve docs -l " + PORT + " --no-clipboard`...");
  const { spawn } = require("child_process");
  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["--yes", "serve", "docs", "-l", String(PORT), "--no-clipboard"],
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

// The daily sync (_build/gen-readmes.js) copies README images and showcase images from _build/; mirror each
// capture there so the next sync keeps the new image instead of restoring an old one.
function mirrorToBuild(outPath, t){
  if(process.env.CAPTURE_NO_MIRROR) return;
  const B = path.resolve(__dirname, "..", "..", "..", "_build");
  if(!fs.existsSync(B)) return;
  const dest = t.dir === "assets" ? path.join(B, "shots", t.name) : path.join(B, "showcase", t.name);
  try{ fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.copyFileSync(outPath, dest); }catch(e){ console.warn("  (could not mirror to _build: " + e.message + ")"); }
}

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

// Main's per-route intro cards (src/partINTRO.js) and the overview's first-run
// choice (src/partH4.js) each gate a tool's real first screen behind a one-time
// card ("tswb:intro:<route>" / "tswb:firstrun:seen"). None of the builders below
// know about them, so mark every one seen up front; each builder's own
// localStorage.removeItem calls only ever target their own tool's keys.
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
  // A toast from a previous action (e.g. "Complete example loaded...") can
  // sit directly over the next control to click, especially on a phone
  // viewport where there's less room -- the click then silently lands on
  // the toast instead of the real target (no exception thrown). Clear it
  // first, the same way settle() does for the screenshot itself.
  await page.evaluate(() => {
    document.querySelectorAll(".toast, #gtoast").forEach((el) => {
      el.style.visibility = "hidden";
    });
  });
  // Puppeteer's click() scrolls the element to a viewport edge before
  // clicking, which on a phone viewport can tuck it right under the fixed
  // bottom nav -- the click then silently lands on the nav instead (no
  // exception, just the wrong element). Centering it first avoids that.
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" });
  }, sel);
  try {
    await page.click(sel);
  } catch (err) {
    // Belt and suspenders: if it's still not "clickable" by Puppeteer's
    // visibility check (e.g. an off-canvas element that exists in the DOM
    // but isn't shown), a plain DOM click() has no such requirement and
    // fires the same listeners.
    const clicked = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (el) { el.click(); return true; }
      return false;
    }, sel);
    if (!clicked) throw err;
  }
  await sleep(waitMs);
}

async function exists(page, sel) {
  return (await page.$(sel)) !== null;
}

// Walks one of the shared guided-flow wizards (coppa/dsa/policy/transparency
// all use the same engine: gdRender/gdQHTML) from wherever it's standing to
// the end, so an "example" that only pre-fills answers (rather than jumping
// straight to a finished report) still reaches one. On each step it prefers
// the enabled "Continue" button; a single-choice step has no such button and
// auto-advances when its already-picked option is clicked again, so that's
// the fallback; an unanswered step (no pre-filled default) falls back to
// just clicking the first choice, since getting *a* report matters here,
// not which one. Stops as soon as the wizard's "question" screen is gone.
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
  async redteam(page) {
    await ensureDemoOff(page);
    // Red team studio gates its own first screen behind a purpose card the first
    // time anyone opens it (tswb:rt:seen-intro). Mark it seen so the shot shows
    // the tool's real first screen (the 60-second graded try), not the card.
    // tswb:rt holds the whole saved flow state; clear it for a clean, repeatable run.
    await page.evaluate(() => {
      localStorage.setItem("tswb:rt:seen-intro", "true");
      localStorage.removeItem("tswb:rt");
    });
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "redteam");
    // The correct grade for the first practice item (RT_PRACTICE.grade[0].a) is 1.
    await page.waitForSelector('[data-pick="1"]', { timeout: 8000 });
    await clickSel(page, '[data-pick="1"]', 400);
  },
  async learn(page) {
    await ensureDemoOff(page);
    // The hub itself has no purpose-card gate; just start from a clean progress
    // state (tswb:learn:*) so the counts shown are the fresh-visitor ones.
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("tswb:learn:"))
        .forEach((k) => localStorage.removeItem(k));
    });
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "learn");
  },

  // -------------------------------------------------- review-pass builders
  // Used only by --phone/--dark (see REVIEW_ROUTES below), not by the
  // regular README/portfolio targets. Each is self-contained the same way
  // the builders above are.
  async toolsRoute(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "tools");
  },
  async workspaceRoute(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "workspace");
  },
  async planRoute(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "plan");
  },
  async reviewRoute(page) {
    await ensureDemoOff(page);
    await gotoHash(page, "review");
  },
  // The scenario list, not a scenario's play-through (that's builders.tabletop).
  async tabletopList(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => localStorage.removeItem("tswb:tt"));
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "tabletop");
    await page.waitForSelector('.scen[data-i="0"]', { timeout: 8000 });
  },
  // Coverage's "See a finished example" sets cv.ex, which short-circuits
  // straight to the finished radar/report regardless of which screen (the
  // guided intro or the one-page form) the click came from.
  async coverageExample(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => {
      localStorage.removeItem("tswb:cv");
      localStorage.removeItem("tswb:ws:cur:coverage");
    });
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "coverage");
    await page.waitForSelector('[data-cv="example"]', { timeout: 8000 });
    await clickSel(page, '[data-cv="example"]', 400);
  },
  // Policy has no example flag that jumps straight to a report: "Load a
  // complete example" only pre-fills the wizard's answers. Switching to the
  // one-page form first gets to the same pre-fill via #pol-full, then
  // #pol-run scores it locally (no Claude account needed) into a report.
  async policyExample(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => {
      localStorage.removeItem("tswb:pol");
      localStorage.removeItem("tswb:ws:cur:policy");
    });
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "policy");
    await page.waitForSelector(".gd-intro, #pol-full", { timeout: 8000 });
    if (await exists(page, ".gd-intro")) {
      await clickByText(page, "button", "Fill everything in on one page", 300);
    }
    await page.waitForSelector("#pol-full", { timeout: 8000 });
    await clickSel(page, "#pol-full", 300);
    await page.waitForSelector("#pol-run", { timeout: 8000 });
    await clickSel(page, "#pol-run", 500);
  },
  // Coppa and dsa's "See a finished example" both set an .ex flag that
  // jumps straight to the finished report (no wizard to walk).
  async coppaExample(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => {
      localStorage.removeItem("tswb:cp");
      localStorage.removeItem("tswb:ws:cur:coppa");
    });
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "coppa");
    await clickByText(page, "button", "See a finished example", 400);
  },
  async dsaExample(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => {
      localStorage.removeItem("tswb:ds");
      localStorage.removeItem("tswb:ws:cur:dsa");
    });
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "dsa");
    await clickByText(page, "button", "See a finished example", 400);
  },
  // Transparency's "See an example" (unlike coppa/dsa) only pre-fills the
  // wizard and drops back to its intro, with no one-page shortcut either
  // (its "data-tr=example" button there resets the same way). So: load the
  // example, then walk the wizard to the end with gdAdvanceAll.
  async transparencyExample(page) {
    await ensureDemoOff(page);
    await page.evaluate(() => {
      localStorage.removeItem("tswb:tr");
      localStorage.removeItem("tswb:ws:cur:transparency");
    });
    await page.reload({ waitUntil: "load" });
    await gotoHash(page, "transparency");
    await page.waitForSelector(".gd-intro", { timeout: 8000 });
    await clickByText(page, "button", "See an example", 400);
    await sleep(200);
    if (await exists(page, '[data-gd="resume"]')) {
      await clickSel(page, '[data-gd="resume"]', 300);
    } else if (await exists(page, '[data-gd="start"]')) {
      await clickSel(page, '[data-gd="start"]', 300);
    }
    const result = await gdAdvanceAll(page);
    if (result !== "done") {
      console.warn('  (note: transparency wizard walk ended in state "' + result + '", not "done" -- the screenshot may still show the wizard rather than the report)');
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
  { name: "redteam.jpg", kind: "jpeg", dir: "portfolio", build: builders.redteam },
  { name: "learn.jpg", kind: "jpeg", dir: "portfolio", build: builders.learn },
];

// -------------------------------------------------------- review passes ---
// Every tool, one screenshot each, at a phone viewport (--phone, full-page)
// and/or in dark mode (--dark, viewport only). Order matches how they sit
// in the nav, with the cross-tool pages (workspace/plan/review) last since
// by then other routes in the same pass may have left data behind for them
// to summarize -- that's a feature here, not a bug to route around.
// `lightBuild`/`darkBuild` let a route use a different builder per pass;
// plain `build` is used for both. Only "overview" needs the split: the demo
// company should be loaded either way, but only the dark pass should also
// force dark mode (builders.overviewDark does both; builders.overview just
// the demo).
const REVIEW_ROUTES = [
  { name: "overview", lightBuild: builders.overview, darkBuild: builders.overviewDark },
  { name: "tools", build: builders.toolsRoute },
  { name: "premortem", build: builders.premortem },
  { name: "tabletop", build: builders.tabletopList },
  { name: "metrics", build: builders.metricsMap },
  { name: "vendors", build: builders.vendors },
  { name: "maturity", build: builders.maturity },
  { name: "coverage", build: builders.coverageExample },
  { name: "policy", build: builders.policyExample },
  { name: "coppa", build: builders.coppaExample },
  { name: "dsa", build: builders.dsaExample },
  { name: "eval", build: builders.evalReport },
  { name: "transparency", build: builders.transparencyExample },
  { name: "workspace", build: builders.workspaceRoute },
  { name: "plan", build: builders.planRoute },
  { name: "review", build: builders.reviewRoute },
];

const PHONE_VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const PHONE_UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const DARK_VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 };

async function runReviewPass(browser, kind) {
  const outDir = path.join(REVIEW_DIR, kind);
  fs.mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage();
  if (kind === "phone") {
    await page.emulate({ viewport: PHONE_VIEWPORT, userAgent: PHONE_UA });
  } else {
    await page.setViewport(DARK_VIEWPORT);
  }
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
  await markIntrosSeen(page);
  if (kind === "dark") {
    await page.evaluate(() => localStorage.setItem("tswb:theme", JSON.stringify("dark")));
    await page.reload({ waitUntil: "load" });
  }
  await settle(page);

  let count = 0;
  for (const r of REVIEW_ROUTES) {
    const build = kind === "dark" ? r.darkBuild || r.build : r.lightBuild || r.build;
    const outPath = path.join(outDir, r.name + ".png");
    try {
      await build(page);
      await settle(page);
      await page.screenshot({ path: outPath, type: "png", fullPage: kind === "phone" });
      console.log("Wrote " + outPath);
      count++;
    } catch (err) {
      console.error("Failed to capture review/" + kind + "/" + r.name + ": " + err.message);
    }
  }
  await page.close();
  console.log(
    kind[0].toUpperCase() + kind.slice(1) + " pass: wrote " + count + " of " + REVIEW_ROUTES.length + " images to " + outDir
  );
  return count;
}

// ------------------------------------------------------ card thumbnails ---
// One 640x400 JPEG per tool card on the All tools page (partH4.js renderTools)
// and the Learn hub (partLearn.js), written to docs/thumbs/<route>.jpg and shipped
// with the site. The card shows it when TOOL_CARD_STYLE is "thumb" (partH4.js) and
// falls back to the plain card when a file is missing. Each tool is shown in its
// example/report state (the same builders as the other passes); tools with no
// example (the Learn pages) are shown at their first screen. Intro cards are
// marked seen up front (markIntrosSeen), so the first screen is the tool itself.
// Nothing here is mirrored to _build/ (the daily sync does not own docs/thumbs),
// so CAPTURE_NO_MIRROR has no effect; it is honoured only in the sense that this
// pass never writes outside docs/. CAPTURE_PORT / CAPTURE_BASE_URL work as usual.
const THUMBS_DIR = path.join(ROOT, "docs", "thumbs");
const THUMB_W = 640, THUMB_H = 400, THUMB_CROP_W = 1100; // 16:10; 1100 css px wide crop of the content area
const THUMB_VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };
const hashOnly = (route) => async (page) => {
  await ensureDemoOff(page);
  await gotoHash(page, route);
  await page.evaluate(() => window.scrollTo(0, 0));
};
const THUMB_ROUTES = [
  { route: "maturity", build: builders.maturity },
  { route: "premortem", build: builders.premortem },
  { route: "coverage", build: builders.coverageExample },
  { route: "tabletop", build: builders.tabletop },
  { route: "policy", build: builders.policyExample },
  { route: "coppa", build: builders.coppaExample },
  { route: "dsa", build: builders.dsaExample },
  { route: "vendors", build: builders.vendors },
  { route: "eval", build: builders.evalReport },
  { route: "redteam", build: builders.redteam },
  { route: "metrics", build: builders.metricsMap },
  { route: "redteamllm", build: hashOnly("redteamllm") },
  { route: "redteamworld", build: hashOnly("redteamworld") },
  { route: "glossary", build: hashOnly("glossary") },
  { route: "tsglossary", build: hashOnly("tsglossary") },
];

async function runThumbsPass(browser) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport(THUMB_VIEWPORT);
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
  await markIntrosSeen(page);
  await ensureLightTheme(page);
  await settle(page);
  // The downscale happens in the page itself (a detached canvas): the browser's own
  // high-quality resampling of the 2x capture, then a JPEG at q80. No image library, and no
  // second tab (a background tab would stall the screenshots).

  let count = 0, bytes = 0;
  for (const r of THUMB_ROUTES) {
    const outPath = path.join(THUMBS_DIR, r.route + ".jpg");
    try {
      await r.build(page);
      await page.evaluate(() => { window.scrollTo(0, 0); const v = document.getElementById("view"); if (v) v.scrollTop = 0; });
      await settle(page);
      const rect = await page.evaluate(() => {
        const b = document.getElementById("view").getBoundingClientRect();
        return { x: b.left + window.scrollX, y: b.top + window.scrollY, w: b.width };
      });
      const w = Math.min(THUMB_CROP_W, Math.floor(rect.w));
      const clip = { x: Math.round(rect.x), y: Math.round(rect.y), width: w, height: Math.round(w * THUMB_H / THUMB_W) };
      const png = await page.screenshot({ type: "png", clip });
      const b64 = await page.evaluate(async (data, W, H) => {
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = "data:image/png;base64," + data; });
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const g = c.getContext("2d"); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
        g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); g.drawImage(img, 0, 0, W, H);
        return c.toDataURL("image/jpeg", 0.8).split(",")[1];
      }, Buffer.from(png).toString("base64"), THUMB_W, THUMB_H);
      const buf = Buffer.from(b64, "base64");
      fs.writeFileSync(outPath, buf);
      bytes += buf.length; count++;
      console.log("Wrote " + outPath + " (" + Math.round(buf.length / 1024) + " KB)");
    } catch (err) {
      console.error("Failed to capture thumbs/" + r.route + ": " + err.message);
    }
  }
  await page.close();
  console.log("Thumbs pass: wrote " + count + " of " + THUMB_ROUTES.length + " images, " + Math.round(bytes / 1024) + " KB, to " + THUMBS_DIR);
  if (bytes > 1.5 * 1024 * 1024) console.warn("WARNING: thumbs folder is over 1.5 MB; lower the JPEG quality or the size.");
  return count;
}

// -------------------------------------------------------------- main ------

async function main() {
  const rawArgs = process.argv.slice(2);
  const wantPhone = rawArgs.includes("--phone");
  const wantDark = rawArgs.includes("--dark");
  const wantThumbs = rawArgs.includes("--thumbs");

  if (wantThumbs) {
    const serverChild = await ensureServer();
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      defaultViewport: null,
    });
    try {
      await runThumbsPass(browser);
    } finally {
      await browser.close();
      if (serverChild) serverChild.kill();
    }
    return;
  }

  // --phone/--dark are a separate mode: every tool, into assets/review/,
  // not the README/portfolio targets below. With neither flag, everything
  // from here to the end of this function is unchanged from before.
  if (wantPhone || wantDark) {
    const serverChild = await ensureServer();
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      defaultViewport: null,
    });
    try {
      if (wantPhone) await runReviewPass(browser, "phone");
      if (wantDark) await runReviewPass(browser, "dark");
    } finally {
      await browser.close();
      if (serverChild) serverChild.kill();
    }
    return;
  }

  const wanted = rawArgs.map((s) => s.toLowerCase());
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
    await markIntrosSeen(page);
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
        mirrorToBuild(outPath, t);
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
