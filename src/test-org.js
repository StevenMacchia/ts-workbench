// Checks the shared workspace settings: one vocabulary, pre-fills in each tool, save states, the New menu and the About page, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  // one vocabulary: every company type maps to each tool, and the tools use the same labels
  eq(ORG_TYPES.length, 8, "eight company types"); ORG_TYPES.forEach(t => { if(!ORG_MAP.mx[t.k] || !ORG_MAP.pm[t.k]) throw new Error("no mapping for " + t.k); if(!MX_PLATFORMS[ORG_MAP.mx[t.k]]) throw new Error("metrics has no " + t.k); });
  eq(MX_PLATFORMS.social, ORG_TYPES.find(t => t.k === "social").n, "metrics uses the shared label"); eq(MX_STAGE["2"], "Growing", "metrics uses the shared stage names");
  eq(ORG_STAGES.map(s => s.k).join(","), MA_STAGES.map(s => s.k).join(","), "maturity stages match");
  out.push("vocabulary: 8 company types and 3 stages shared by tabletop, metrics and maturity");
  // before settings, nothing is forced
  eq(orgReady(), false, "no settings yet"); const p0 = orgPrefillPM(blankPM()); eq(!!p0.type, false, "no pre-fill without settings");
  // settings pre-fill each tool
  orgSet({type:"dating", stage:"scale", regions:["us", "uk"]}); eq(orgReady(), true, "settings saved");
  const p = orgPrefillPM(blankPM()); eq(p.type, "dating", "pre-mortem product type"); eq(p.regions.join(","), "us,uk", "pre-mortem regions"); eq(p.fromOrg && p.answered.type, true, "marked as pre-filled");
  eq(ttCompanyType(), "dating", "tabletop company type");
  ma = maInit({stage:"growth", lv:{}, done:{}, ex:false}); renderMaturity(); eq(ma.stage, "scale", "maturity stage");
  ma.stage = "early"; ma.stageSet = true; renderMaturity(); eq(ma.stage, "early", "a stage the person picked is kept");
  mx = {platform:"social", stage:"1", reg:false, vals:{}, read:{}, have:{}}; renderMetrics(); eq(mx.platform, "dating", "metrics platform"); eq(mx.stage, "3", "metrics stage"); eq(mx.reg, true, "UK means regulated");
  mx.platform = "gaming"; renderMetrics(); eq(mx.platform, "gaming", "metrics keeps a later change");
  out.push("pre-fills: pre-mortem type and regions, tabletop type, maturity stage and metrics, without overriding later choices");
  // save states
  store.set("ws:cur:maturity", null); eq(wsSaveLabel("maturity", ma), "Save to workspace", "not saved yet");
  MA_AREAS.forEach(a => ma.lv[a.k] = 3); wsSaveTool("maturity", ma, maTitle(ma)); eq(wsSaveLabel("maturity", ma), "Saved", "saved and unchanged");
  ma.lv.crisis = 2; eq(wsSaveLabel("maturity", ma), "Save changes", "changed since saving");
  out.push("save states: Save to workspace, Saved, Save changes");
  // New menu, header chips, workspace and about pages
  eq(NEW_ITEMS.length, 9, "nine things to start"); eq(NEW_ITEMS.some(x => x[0] === "dsa"), true, "DSA readiness can be started"); eq(NEW_ITEMS.some(x => x[0] === "coppa"), true, "COPPA readiness can be started"); eq(NEW_ITEMS.every(x => typeof x[5] === "function"), true, "each starts something");
  const chips = ovHeroChips(); eq(chips.some(c => /Dating · At scale or regulated/.test(c)), true, "header shows the organization");
  renderWorkspace(); let h = view.innerHTML; if(bad(h)) throw new Error("workspace has bad values"); eq(/Your organization/.test(h) && /data-orgstage="scale"/.test(h) && /Save workspace file/.test(h), true, "workspace settings and file");
  renderAbout(); h = view.innerHTML; if(bad(h)) throw new Error("about has bad values"); eq(/How it fits together/.test(h) && /How the scores work/.test(h) && /Coverage radar/.test(h), true, "about covers the whole toolkit");
  out.push("New menu (6 items), header chips, workspace settings card and refreshed About page");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partORG.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
