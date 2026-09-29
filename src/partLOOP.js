/* =========================================================
   PROGRAM LOOP: a pre-mortem's biggest remaining risks point to the crises to rehearse,
   the metrics to track, the coverage to map and how to weigh a moderation vendor
   ========================================================= */
// Tabletop scenarios that rehearse each harm area, best fit first
const LOOP_TT = {
  child:["gifting", "classroom", "minor", "comments", "companion"], sexual:["classroom", "minor", "assault"], harass:["swatting", "vip", "bias"],
  violent:["ugcextremism", "challenge", "jailbreak"], selfharm:["emergency", "challenge", "companion"], privacy:["location", "insider", "camera"],
  physical:["courier", "partyhouse", "assault", "recall"], integrity:["bots", "reviews", "deepfake"], security:["ato", "insider"],
  illegal:["counterfeit", "recall", "takedown"], fraud:["offplatform", "romance", "impersonation", "fakelisting"], fincrime:["mules", "sanctions", "coerced"],
  ai:["jailbreak", "deepfake", "voiceclone", "companion"], readiness:["vendor", "rfi", "newlaw"]
};
// Metrics that show whether each harm area is getting better
const LOOP_MX = {
  child:["Unsafe-contact rate for minors", "Age-assurance coverage", "Time to report child sexual exploitation"],
  sexual:["Time to report child sexual exploitation", "Violating-content prevalence", "Proactive detection rate"],
  harass:["Violating-content prevalence", "Toxicity per 1,000 match-hours", "Repeat-offender rate", "Users who feel safe"],
  violent:["Harmful reach before action", "Time to detect emerging trends", "Violating-content prevalence"],
  selfharm:["Time to action by severity (p90)", "Harmful reach before action"],
  privacy:["Account takeover rate", "Law-enforcement request handling"],
  physical:["Safety incidents per 10k trips", "Time to action by severity (p90)"],
  integrity:["Proactive detection rate", "Precision and recall by policy area", "Repeat-offender rate"],
  security:["Account takeover rate", "Verified-profile share"],
  illegal:["Prohibited-listing prevalence", "Illegal-content notice handling time"],
  fraud:["Fraud loss rate", "Romance-scam reports per 10k matches", "Verified-profile share"],
  fincrime:["Fraud loss rate", "Verified-profile share"],
  ai:["Violating-generation rate", "Jailbreak success rate", "Over-refusal rate"],
  readiness:["SLA attainment", "Systemic-risk assessment currency", "Statement-of-reasons coverage"]
};
// Pre-mortem product types, as the Metrics framework names them
const LOOP_PM_MX = {social:"social", messaging:"social", video:"social", creator:"social", marketplace:"market", fintech:"fintech", crypto:"fintech", gaming:"gaming", dating:"dating", genai:"genai", gig:"gig", rentals:"gig", edtech:"kids", health:"social", workplace:"social"};
const loopList = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
// The pre-mortem to plan from: the saved one open now, else the one saved most recently, else a draft in progress
function loopSource(){
  try{
    const own = pm && pm.type && !pm.example, cur = () => { const r = assess(pm); return r.risks.length ? {name:pm.name || "Untitled assessment", r, p:pm} : null; };
    if(own && pm.saved){ const s = cur(); if(s) return s; }
    const it = Object.values(wsItems()).filter(i => i.kind === "premortem" && i.data).sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
    if(it){ const p = openRecord(it.data), r = assess(p); if(r.risks.length) return {name:it.title || it.data.name || "Untitled assessment", r, p}; }
    if(own) return cur();
  }catch(e){}
  return null;
}
// Harm areas with the most risk left after the safeguards in place
function loopCats(r, n){
  const by = {};
  r.risks.forEach(x => { const c = by[x.cat] = by[x.cat] || {k:x.cat, n:CATS[x.cat], max:0, sum:0, band:"low"}; if(x.rscore > c.max){ c.max = x.rscore; c.band = x.rband; } c.sum += x.rscore; });
  const all = Object.values(by).sort((a, b) => b.max - a.max || b.sum - a.sum), hot = all.filter(c => c.max >= 8);
  return (hot.length ? hot : all).slice(0, n || 3);
}
// Pre-mortem product types, as the tabletop names company types
const LOOP_PM_TT = {social:"social", messaging:"social", video:"social", creator:"social", marketplace:"marketplace", fintech:"fintech", crypto:"fintech", gaming:"gaming", dating:"dating", genai:"genai", gig:"gig", rentals:"gig", edtech:"kids", health:"social", workplace:"social"};
// One scenario per harm area: written for this product's type if there is one, then for your company type, then one that tailors itself
function loopScenarios(r, type, n, ptype){
  const out = [], seen = new Set(), has = (j, t) => !!t && t !== "all" && (SCENARIOS[j].types || []).includes(t);
  const tests = [j => has(j, ptype), j => has(j, type), j => !!SCENARIOS[j].tailored || type === "all"];
  loopCats(r, 4).forEach(c => { if(out.length >= (n || 3)) return;
    const xs = (LOOP_TT[c.k] || []).map(id => SCENARIOS.findIndex(s => s.id === id)).filter(i => i >= 0 && !seen.has(i));
    let pick; tests.forEach(t => { if(pick === undefined) pick = xs.find(t); }); if(pick === undefined) pick = xs[0];
    if(pick !== undefined){ seen.add(pick); out.push({i:pick, cat:c, sc:ttScenario(pick, type)}); } });
  return out;
}
// Metrics for the top harm areas on this kind of platform, taking turns between areas
function loopMetrics(r, pk, n){
  const lists = loopCats(r, 4).map(c => (LOOP_MX[c.k] || []).map(name => ({m:METRICS.find(x => x.n === name), cat:c})).filter(x => x.m && (x.m.p === "all" || x.m.p.includes(pk))));
  const out = [], seen = new Set();
  for(let j = 0; j < 4; j++) lists.forEach(l => { const x = l[j]; if(x && !seen.has(x.m.n)){ seen.add(x.m.n); out.push(x); } });
  return out.slice(0, n || 4);
}
// Weights scaled to 100 in steps of 5, keeping their proportions (the vendor scorecard's rule)
function loopNorm(w){
  const tw = CRITERIA.reduce((a, c) => a + (w[c.k] || 0), 0) || 1, out = {};
  CRITERIA.forEach(c => { out[c.k] = Math.round((w[c.k] || 0) / tw * 100 / 5) * 5; });
  let diff = 100 - CRITERIA.reduce((a, c) => a + out[c.k], 0);
  const order = CRITERIA.slice().sort((a, b) => out[b.k] - out[a.k]);
  for(let i = 0; diff !== 0 && i < 40; i++){ const c = order[i % order.length], step = diff > 0 ? 5 : -5; if(out[c.k] + step >= 0){ out[c.k] += step; diff -= step; } }
  return out;
}
// Vendor weights that follow the risks: wellness for graphic and child-safety harms, security for fraud, languages for many markets.
// Only what actually moved against the balanced weights is reported.
function loopVendorWeights(src){
  const base = Object.fromEntries(CRITERIA.map(c => [c.k, c.w])), raw = Object.assign({}, base), why = {};
  const cats = loopCats(src.r, 4).map(c => c.k), has = ks => ks.some(k => cats.includes(k));
  const o = typeof orgGet === "function" ? orgGet() : {}, regions = src.p.regions && src.p.regions.length ? src.p.regions : o.regions || [];
  if(has(["child", "sexual", "violent", "selfharm"])){ raw.wellness += 10; raw.quality += 5; why.wellness = "graphic and child-safety queues"; why.quality = "hard child-safety and violence calls"; }
  if(has(["fraud", "fincrime", "security", "privacy"])){ raw.security += 10; why.security = "fraud and account data"; }
  if(regions.length >= 3){ raw.lang += 10; why.lang = regions.length + " regions"; }
  if(src.p.scale === "large" || src.p.scale === "mid" || o.stage === "scale"){ raw.surge += 5; why.surge = "your scale"; }
  if(regions.some(k => k === "eu" || k === "uk")){ raw.reporting += 5; why.reporting = "EU and UK transparency duties"; }
  const w = loopNorm(raw);
  return {w, up:CRITERIA.filter(c => w[c.k] > base[c.k] && why[c.k]).map(c => `${c.n.toLowerCase()} (${why[c.k]})`), down:CRITERIA.filter(c => w[c.k] < base[c.k]).map(c => c.n.toLowerCase())};
}
const loopFitted = () => !!(vx.fitW && CRITERIA.every(c => (+vx.weights[c.k] || 0) === vx.fitW[c.k]));
function loopVendorChip(){
  const src = loopSource(); if(!src) return "";
  return `<button type="button" class="pol-chip loop-chip" data-loopgo="vd" aria-pressed="${loopFitted()}" title="${esc("Weights from the risks in " + src.name)}">${icon("radar")}Fit to your risks</button>`;
}
function loopVendorNote(){
  if(!loopFitted()) return "";
  const n = esc(vx.fitName || "your pre-mortem"), f = vx.fitWhy && !Array.isArray(vx.fitWhy) ? vx.fitWhy : {}, up = f.up || [], down = f.down || [];
  return `<p class="note loop-vnote">${up.length ? `Fitted to the risks in <b>${n}</b>: more weight on ${esc(loopList(up))}${down.length ? `, less on ${esc(loopList(down))}` : ""}.` : `The risks in <b>${n}</b> don't call for a different balance, so the weights stay even.`}</p>`;
}
// The hand-off at the end of a pre-mortem report
function loopCardHTML(r){
  const cats = loopCats(r, 3); if(!cats.length) return "";
  const ptype = LOOP_PM_TT[pm.type], type = ptype || ttCompanyType(), pk = LOOP_PM_MX[pm.type] || "social", scs = loopScenarios(r, type, 3, ptype), ms = loopMetrics(r, pk, 3), f = loopVendorWeights({r, p:pm});
  const item = (go, t, s) => `<button type="button" class="loop-i" data-loopgo="${go}"><b>${esc(t)}</b><small>${esc(s)}</small></button>`;
  return `<section class="card loop" aria-labelledby="loop-h">
    <div class="loop-h"><span class="eyebrow">Put this assessment to work</span><h3 id="loop-h">Rehearse, measure and resource your biggest risks</h3>
      <p class="note">After the safeguards you've ticked, most of the risk is in ${loopList(cats.map(c => `<b>${esc(c.n.toLowerCase())}</b>`))}.</p></div>
    <div class="loop-cols">
      <div class="loop-col"><span class="loop-k" style="--c:var(--t-tt)">${icon("siren")}Rehearse the crisis</span>${scs.map(x => item("tt:" + x.i + ":" + type, x.sc.title, x.cat.n + " · " + x.sc.steps.length + " decisions, about 8 minutes")).join("")}</div>
      <div class="loop-col"><span class="loop-k" style="--c:var(--t-mx)">${icon("gauge")}Measure it</span>${ms.map(x => item("mx:" + METRICS.indexOf(x.m) + ":" + pk, x.m.n, MX_Q[x.m.n] || x.cat.n)).join("")}</div>
      <div class="loop-col"><span class="loop-k" style="--c:var(--t-vd)">${icon("scale")}Resource it</span>${r.obligations.some(o => /COPPA/.test(o.law)) ? item("coppa", "Check your COPPA readiness", "Children under 13 may use this product, so the children's privacy rules likely apply") : ""}${item("cv", "Map your defenses against these risks", "The coverage radar shows where this product's risk outruns what you have in place")}${item("vd", "Weight a vendor comparison to these risks", f.up.length ? "More weight on " + loopList(f.up.map(x => x.split(" (")[0])) : "Your risks call for an even balance")}</div>
    </div></section>`;
}
// Tabletop: the scenarios behind your biggest risks, above the full library
function loopTTHTML(type){
  const src = loopSource(); if(!src) return "";
  const xs = loopScenarios(src.r, type, 3, LOOP_PM_TT[src.p.type]); if(!xs.length) return "";
  const prog = ttProgress();
  return `<section class="loop-strip" aria-labelledby="loop-tt-h"><div class="loop-sh"><h3 id="loop-tt-h">${icon("radar")}Recommended for your risks</h3><span class="note">From your pre-mortem, ${esc(src.name)}</span></div>
    <div class="scen-grid">${xs.map(x => { const p = prog[ttKey(x.i, type)];
      return `<button class="card scen loop-scen ${p ? "done" : ""}" data-i="${x.i}">
        <div class="scen-top"><span class="libicon sm"><svg><use href="#${ttIcon(x.sc, type)}"/></svg></span>${sevPill(x.sc.severity)}<span class="pill accent" style="margin-left:auto">${esc(x.cat.n)}</span></div>
        <h3>${esc(x.sc.title)}</h3><p>${esc(x.sc.blurb)}</p>
        <span class="scen-foot"><span class="note">${p ? `✓ ${p.best}/4 strong calls on first try` : `Rehearses your ${esc(BANDS[x.cat.band][0].toLowerCase())} risk in ${esc(x.cat.n.toLowerCase())}`}</span></span></button>`; }).join("")}</div></section>`;
}
// Metrics: the numbers for your biggest risks, above the priority map
function loopMxHTML(list){
  const src = loopSource(); if(!src) return "";
  const xs = loopMetrics(src.r, mx.platform, 4).filter(x => list.includes(x.m)); if(!xs.length) return "";
  return `<section class="loop-strip mx-loop" aria-labelledby="loop-mx-h"><div class="loop-sh"><h3 id="loop-mx-h">${icon("radar")}For your biggest risks</h3><span class="note">From your pre-mortem, ${esc(src.name)}</span></div>
    <div class="loop-mx">${xs.map(x => `<button type="button" class="loop-i" data-open="${METRICS.indexOf(x.m)}"><b>${esc(x.m.n)}</b><small>${esc(x.cat.n)} · ${esc(MX_Q[x.m.n] || "")}</small></button>`).join("")}</div></section>`;
}
function loopGo(v){
  const here = (location.hash || "").slice(1).split("/")[0];
  const src = here === "premortem" && pm && pm.type ? {r:assess(pm), p:pm, name:pm.name || "this assessment"} : loopSource();
  if(v.startsWith("tt:")){ const parts = v.split(":"), i = +parts[1], variant = TT_TYPES.some(t => t.k === parts[2]) ? parts[2] : ttCompanyType(); if(!SCENARIOS[i]) return; ttStart(i, variant); return goRoute("tabletop"); }
  if(v.startsWith("mx:")){ const parts = v.split(":"), m = METRICS[+parts[1]], pk = parts[2]; if(!m) return;
    if(!mxList().includes(m)){ if(!(m.p === "all" || m.p.includes(mx.platform)) && pk && MX_PLATFORMS[pk]) mx.platform = pk; if(m.st > +mx.stage) mx.stage = String(m.st); if(m.reg) mx.reg = true; }
    mx.orgSet = true; store.set("mx", mx); location.hash = "metrics/" + mxSlug(m); return; }
  if(v === "vd"){ if(!src) return goRoute("vendors");
    const fit = loopVendorWeights(src); vx.weights = Object.assign({}, fit.w); vx.fitW = Object.assign({}, fit.w); vx.fitWhy = {up:fit.up, down:fit.down}; vx.fitName = src.name; store.set("vx", vx);
    goRoute("vendors"); return gsay("Vendor weights fitted to the risks in " + src.name); }
  if(v === "coppa"){ if(typeof cpFromPM === "function" && src && (!cp.aud || cp.ex)){ cp = Object.assign(CP_BLANK(), cpFromPM(src)); cpSave(); } return goRoute("coppa"); }
  if(v === "cv"){ if(cv.ex) cv = {src:null, ex:false, r:{}};
    const onPM = here === "premortem" && pm, exk = onPM && pm.example ? Object.keys(PRESETS).find(k => PRESETS[k].name === pm.name) : null;
    cv.src = onPM && pm.saved && pm.id ? "pm:" + pm.id : exk ? "ex:" + exk : "all"; cvSave(); return goRoute("coverage"); }
}
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-loopgo]"); if(!b) return; e.preventDefault(); loopGo(b.dataset.loopgo); });

/* ---------- Workspace settings, shown where a tool uses them ---------- */
function orgFromTag(on){
  return on ? `<a class="org-from" href="#workspace" title="Set in your workspace settings. Change them in My workspace.">${icon("user")}From your workspace</a>` : "";
}
function orgPrefillWhat(){
  const o = orgGet(), xs = [o.type ? "product type" : "", o.youth ? "audience" : "", o.regions && o.regions.length ? "regions" : ""].filter(Boolean);
  return xs.length ? loopList(xs) + (xs.length === 1 ? " is" : " are") : "workspace settings are";
}
// The AI assistants start from your company name and markets until you type your own
function aiOrgDefaults(T, st){
  if(st && st.f && Object.keys(st.f).length) return {};
  const o = typeof orgGet === "function" ? orgGet() : {}, pr = wsProfile(), out = {};
  T.fields.forEach(fd => {
    if((fd.k === "product" || fd.k === "org") && pr && pr.org) out[fd.k] = pr.org;
    if(fd.type === "checks" && fd.k === "regions" && o.regions && o.regions.length){ const ks = fd.opts.map(x => x[0]);
      out.regions = ks.filter(k => o.regions.includes(k)).concat(ks.includes("other") && o.regions.some(k => !ks.includes(k)) ? ["other"] : []); }
  });
  return out;
}

/* ---------- Phones: More in the bottom bar opens the full menu ---------- */
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-bnav]"); if(!b) return; e.preventDefault(); const app = $("#app"); if(app) app.classList.add("nav-open"); });
