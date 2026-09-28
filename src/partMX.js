/* ---------- Metrics: priority map, metric articles, your scorecard ---------- */
const MX_DIR = {up:["↑","Higher is better"], down:["↓","Lower is better"], band:["↔","Keep it in a healthy range"]};
const MX_RV = {
  w:["Weekly operations review","Ops leads and vendor managers. Fix this week's problems."],
  m:["Monthly health review","T&S leadership, policy, detection and quality. Spot trends and assign owners."],
  q:["Quarterly executive review","Executives, legal and finance. North stars, risk and investment."],
  r:["Every release","Model safety and product. Decide whether to ship."]
};
const MX_STAGE = {"1":"Early","2":"Scaling","3":"Mature"};
const MX_STAGE_HELP = {"1":"First T&S hires, mostly manual review", "2":"Vendors, classifiers and queues", "3":"Multi-market, audited, regulated"};
const MX_TABS = [["card","Metrics",""],["mine","My scorecard","scorecard"],["data","Data to log","data"],["run","Running the program","program"]];
const MX_TORD = ["ns","health","diag"];
const MX_TIER_NAME = {ns:"North-star metrics", health:"Health metrics", diag:"Diagnostics"};
const MX_BAND = {
  ns:["Start here: north-star metrics", "The few numbers that show whether users are actually safer. Lead every executive review with these."],
  health:["Health metrics", "Show whether your safety operation is working. Review them every month with your leads."],
  diag:["Diagnostics", "Explain why the numbers above moved. Your team uses them day to day."]
};
const MX_TARGETS = [
  ["Baseline first.","Measure for 6 to 8 weeks before you commit to any number. Early targets are guesses."],
  ["Set a band, not a point.","Say \"prevalence below 0.10%, off track above 0.15%\". The gap between the two is your early warning."],
  ["Pair every target with its guardrail.","An SLA target without a QA floor rewards rushing. Each metric names its guardrail."],
  ["Set thresholds by severity.","A missed tier 1 target is an incident. A missed tier 4 target is a data point."],
  ["Show uncertainty.","Anything from a sample gets a confidence interval. Don't celebrate a change that sits inside it."]
];
const MX_ICO = {
  outcome:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/>',
  detect:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  quality:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  ops:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  people:'<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/><circle cx="17" cy="10" r="2.4"/><path d="M16.2 14.6c2.1.3 3.6 1.7 4.3 4.4"/>',
  comp:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
  warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.01"/>',
  back:'<path d="M15 6l-6 6 6 6"/>', next:'<path d="M9 6l6 6-6 6"/>',
  page:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h4"/>'
};
const mxIco = (k, cls) => `<svg class="${cls || "mx-ico"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MX_ICO[k]}</svg>`;

/* ----- data helpers ----- */
function mxList(){
  const l = METRICS.filter(m => m.st <= +mx.stage && (m.p === "all" || m.p.includes(mx.platform)) && (!m.reg || mx.reg));
  return MX_TORD.flatMap(t => LAYERS.flatMap(L => l.filter(m => m.t === t && m.l === L.k)));
}
const mxSlug = m => m.n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const mxTracked = list => `${list.filter(m => mx.have[m.n] || mxStatus(m, mx.vals)).length} tracked`;
const mxOpenLink = m => `<button type="button" class="mx-link" data-open="${METRICS.indexOf(m)}">${esc(m.n)}</button>`;
const mxUnit = m => MX_SC[m.n][1] === "rate" ? "" : MX_SC[m.n][1];
const mxPill = st => st ? `<span class="pill ${MX_STAT[st][1]}"><span class="dot"></span>${MX_STAT[st][0]}</span>` : `<span class="pill">No value yet</span>`;
const MX_ONE = {people:"person", items:"item", views:"view", hours:"hour", days:"day", months:"month", points:"point"};
const mxFmt = (m, x) => { const n = String(+(+x).toFixed(3)), u = mxUnit(m); return u === "%" ? n + "%" : u === "USD" ? "$" + n : u ? n + " " + (n === "1" && MX_ONE[u] ? MX_ONE[u] : u) : n; };
const mxStatusOf = (m, v) => { const s = mx.vals[m.n] || {}; return mxStatus(m, {[m.n]:{v, t:s.t, a:s.a}}); };
function mxTargetText(m){
  const s = mx.vals[m.n] || {}, t = mxNum(s.t), a = mxNum(s.a), dir = MX_HOW[m.n].dir;
  if(dir === "band") return t != null || a != null ? `${t != null ? mxFmt(m, t) : "…"} to ${a != null ? mxFmt(m, a) : "…"}` : "";
  return t != null ? `${dir === "up" ? "≥" : "≤"} ${mxFmt(m, t)}` : "";
}

/* ----- trends: saved periods plus the current one ----- */
function mxSeries(m){
  const out = (mx.hist || []).map(h => ({p:h.p, v:mxNum((h.v || {})[m.n])})).filter(x => x.v != null);
  const cur = mxNum((mx.vals[m.n] || {}).v);
  if(cur != null){ const lab = mx.period || "Now", j = out.findIndex(x => x.p === lab); if(j > -1) out[j].v = cur; else out.push({p:lab, v:cur}); }
  return out;
}
function mxDelta(m){
  const s = mxSeries(m); if(s.length < 2) return null;
  const d = s[s.length - 1].v - s[s.length - 2].v, dir = MX_HOW[m.n].dir;
  const good = d === 0 ? "flat" : dir === "band" ? "flat" : (dir === "up") === (d > 0) ? "good" : "crit";
  return {d, good, prev:s[s.length - 2].p, text:(d > 0 ? "▲ " : d < 0 ? "▼ " : "") + (d === 0 ? "No change" : mxUnit(m) === "%" ? +Math.abs(d).toFixed(3) + " pts" : mxFmt(m, Math.abs(+d.toFixed(4))))};
}
function mxSpark(m, w = 88, h = 26){
  const s = mxSeries(m); if(s.length < 2) return "";
  const vs = s.map(x => x.v), lo = Math.min(...vs), hi = Math.max(...vs), r = (hi - lo) || 1;
  const X = i => 3 + i * (w - 6) / (s.length - 1), Y = v => h - 4 - (v - lo) / r * (h - 8);
  const st = mxStatus(m, mx.vals), c = st && st !== "set" ? MX_STAT[st][1] : "";
  return `<svg class="mx-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Trend: ${esc(s.map(x => x.p + " " + mxFmt(m, x.v)).join(", "))}"><polyline class="sp-line" points="${s.map((x, i) => X(i).toFixed(1) + "," + Y(x.v).toFixed(1)).join(" ")}"/><circle class="sp-dot ${c}" cx="${X(s.length - 1).toFixed(1)}" cy="${Y(vs[vs.length - 1]).toFixed(1)}" r="3"/></svg>`;
}
function mxTrendHTML(m){
  const s = mxSeries(m);
  if(s.length < 2) return `<p class="mxz-empty">${s.length ? "One period so far." : "No values yet."} Each period you save in <button type="button" class="mx-link" data-tab="mine">My scorecard</button> adds a point to this trend.</p>`;
  const S = mx.vals[m.n] || {}, t = mxNum(S.t), a = mxNum(S.a), W = 560, H = 180, L = 56, R = 34, T = 18, B = 34;
  const all = s.map(x => x.v).concat([t, a].filter(x => x != null));
  let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.18 || Math.abs(hi) * 0.2 || 1;
  lo = Math.min(...all) >= 0 ? Math.max(0, lo - pad) : lo - pad; hi += pad;
  const X = i => L + i * (W - L - R) / (s.length - 1), Y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const line = (v, cls, lab) => v == null ? "" : `<line class="${cls}" x1="${L}" x2="${W - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="mxt-lab ${cls}" x="${W - R}" y="${(Y(v) - 5).toFixed(1)}" text-anchor="end">${esc(lab)} ${esc(mxFmt(m, v))}</text>`;
  const band = MX_HOW[m.n].dir === "band";
  return `<svg class="mxt" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend for ${esc(m.n)}: ${esc(s.map(x => x.p + " " + mxFmt(m, x.v)).join(", "))}">
    <line class="mxt-axis" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>
    <text class="mxt-y" x="${L - 8}" y="${(Y(hi) + 4).toFixed(1)}" text-anchor="end">${esc(mxFmt(m, +hi.toPrecision(2)))}</text>
    <text class="mxt-y" x="${L - 8}" y="${(Y(lo) + 4).toFixed(1)}" text-anchor="end">${esc(mxFmt(m, +lo.toPrecision(2)))}</text>
    ${line(t, "mxt-t", band ? "From" : "Target")}${line(a, "mxt-a", band ? "To" : "Off track")}
    <polyline class="mxt-line" points="${s.map((x, i) => X(i).toFixed(1) + "," + Y(x.v).toFixed(1)).join(" ")}"/>
    ${s.map((x, i) => { const st = mxStatusOf(m, x.v); return `<circle class="mxt-pt ${st && st !== "set" ? MX_STAT[st][1] : ""}" cx="${X(i).toFixed(1)}" cy="${Y(x.v).toFixed(1)}" r="5"><title>${esc(x.p)}: ${esc(mxFmt(m, x.v))}</title></circle>
      <text class="mxt-x" x="${X(i).toFixed(1)}" y="${H - 12}" text-anchor="middle">${esc(x.p)}</text>`; }).join("")}
  </svg>`;
}

/* The formula, drawn as a fraction or difference when it has that shape */
function mxFormulaHTML(f){
  return `<div class="mxf">${f.split("; ").map(part => {
    let label = "", p = part; const eq = p.match(/^(\w+) = (.*)$/); if(eq){ label = eq[1]; p = eq[2]; }
    const op = p.includes(" ÷ ") ? "÷" : p.includes(" − ") ? "−" : null;
    const lab = label ? `<span class="mxf-lab">${esc(label[0].toUpperCase() + label.slice(1))}</span>` : "";
    if(!op || p.split(" " + op + " ").length !== 2) return `<div class="mxf-part">${lab}<p class="mxf-text">${esc(p[0].toUpperCase() + p.slice(1))}</p></div>`;
    let [a, b] = p.split(" " + op + " "), mult = "", note = "";
    const ci = b.indexOf(", "); if(ci > -1){ note = b.slice(ci + 2); b = b.slice(0, ci); }
    const mi = b.indexOf(" × "); if(mi > -1){ mult = b.slice(mi + 1); b = b.slice(0, mi); }
    const cap = s => esc(s[0].toUpperCase() + s.slice(1));
    const body = op === "÷"
      ? `<div class="mxf-frac"><span class="mxf-num">${cap(a)}</span><span class="mxf-den">${cap(b)}</span></div>`
      : `<div class="mxf-diff"><span class="mxf-term">${cap(a)}</span><span class="mxf-op">−</span><span class="mxf-term">${cap(b)}</span></div>`;
    return `<div class="mxf-part">${lab}<div class="mxf-row">${body}${mult ? `<span class="mxf-mult">${esc(mult)}</span>` : ""}</div>${note ? `<p class="mxf-note">${cap(note)}</p>` : ""}</div>`;
  }).join("")}</div>`;
}

/* Where you stand: colored zones from the user's target and off-track line, with their value marked */
function mxZoneHTML(m){
  const s = mx.vals[m.n] || {}, v = mxNum(s.v), t = mxNum(s.t), a = mxNum(s.a), dir = MX_HOW[m.n].dir;
  if(t == null && a == null) return `<p class="mxz-empty">Add a target and an off-track line to see where you stand.</p>`;
  const pts = [v, t, a].filter(x => x != null), mn = Math.min(...pts), mxv = Math.max(...pts), d = (mxv - mn) || Math.abs(mxv) * 0.5 || 1;
  let lo = mn - d * 1.1, hi = mxv + d * 1.1;
  if(mn >= 0) lo = Math.max(0, lo);
  if(mxUnit(m) === "%" && mxv <= 100) hi = Math.min(100, hi);
  if(hi <= lo) hi = lo + 1;
  const P = x => Math.max(0, Math.min(100, (x - lo) / (hi - lo) * 100));
  const Z = [];
  if(dir === "band"){ Z.push(["crit", lo, t != null ? t : lo], ["good", t != null ? t : lo, a != null ? a : hi], ["crit", a != null ? a : hi, hi]); }
  else if(dir === "up"){ const r = a != null ? a : t, g = t != null ? t : a; Z.push(["crit", lo, r]); if(a != null && t != null) Z.push(["med", a, t]); Z.push(["good", g, hi]); }
  else { const g = t != null ? t : a, r = a != null ? a : t; Z.push(["good", lo, g]); if(a != null && t != null) Z.push(["med", t, a]); Z.push(["crit", r, hi]); }
  return `<div class="mxz">
    <div class="mxz-track">${Z.filter(z => P(z[2]) - P(z[1]) > 0).map(z => `<i class="${z[0]}" style="left:${P(z[1])}%;width:${P(z[2]) - P(z[1])}%"></i>`).join("")}
      ${v != null ? `<span class="mxz-mark" style="left:${P(v)}%"><b>${esc(mxFmt(m, v))}</b></span>` : ""}</div>
    <div class="mxz-ticks">${[t, a].filter(x => x != null).map(x => `<span style="left:${P(x)}%">${esc(mxFmt(m, x))}</span>`).join("")}</div>
    ${v == null ? `<p class="mxz-empty">Enter this period's value to place it on the bar.</p>` : ""}
  </div>`;
}

function mxInput(m, f, extra){
  const s = mx.vals[m.n] || {}, band = MX_HOW[m.n].dir === "band", up = MX_HOW[m.n].dir === "up";
  const ph = {v:"This period", t:band ? "Low end" : up ? "At least" : "At most", a:band ? "High end" : up ? "Below this" : "Above this"}[f];
  return `<input class="input" data-f="${f}" data-i="${METRICS.indexOf(m)}" inputmode="decimal" autocomplete="off" value="${esc(s[f] || "")}" placeholder="${ph}"${extra || ""}>`;
}

/* ----- Metrics tab: the priority map ----- */
function mxStatusChip(m){
  const st = mxStatus(m, mx.vals), s = mx.vals[m.n] || {};
  if(!st) return mx.have[m.n] ? `<span class="mxm-st">✓ Tracked</span>` : "";
  return `<span class="mxm-st ${MX_STAT[st][1]}"><i></i>${esc(mxFmt(m, mxNum(s.v)))}${st !== "set" ? " · " + MX_STAT[st][0] : ""}</span>`;
}
function mxMap(list){
  const read = list.filter(m => mx.read[m.n]).length, nextUp = list.find(m => !mx.read[m.n]);
  const pct = list.length ? Math.round(100 * read / list.length) : 0;
  const how = `<div class="mxm-how">
    <ol class="mxm-how-s">
      <li><b>1</b><span>Pick your platform and stage above.</span></li>
      <li><b>2</b><span>Open a metric. Each one walks you through <em>understand</em>, <em>measure</em> and <em>track</em>.</span></li>
      <li><b>3</b><span>Enter your numbers to build a scorecard you can share.</span></li>
    </ol>
    <div class="mxm-prog"><span><b>${read}</b> of ${list.length} read</span><div class="mxm-bar"><i style="width:${pct}%"></i></div></div>
  </div>`;
  return how + MX_TORD.map((t, bi) => {
    const ms = list.filter(m => m.t === t); if(!ms.length) return "";
    const done = ms.filter(m => mx.read[m.n]).length;
    const card = m => { const i = METRICS.indexOf(m), L = LAYERS.find(x => x.k === m.l), H = MX_HOW[m.n], up = m === nextUp;
      const flag = up ? `<span class="mxm-next">Next up</span>` : mx.read[m.n] ? `<span class="mxm-read">✓ Read</span>` : "";
      return t === "diag"
        ? `<button type="button" class="mxm-row${up ? " is-next" : ""}" data-open="${i}"><span class="mxm-area">${mxIco(m.l)}${esc(L.n)}</span><span class="mxm-rt"><b>${esc(m.n)}</b><span>${esc(MX_Q[m.n])}</span></span><span class="mxm-rs">${mxStatusChip(m)}${flag}</span><span class="mxm-go">${mxIco("next", "mx-ico sm")}</span></button>`
        : `<button type="button" class="mxm-card${up ? " is-next" : ""}" data-open="${i}">
            <span class="mxm-top"><span class="mxm-area">${mxIco(m.l)}${esc(L.n)}</span>${flag}</span>
            <b class="mxm-name">${esc(m.n)}</b>
            <span class="mxm-q">${esc(MX_Q[m.n])}</span>
            <span class="mxm-foot"><span class="mxm-dir">${MX_DIR[H.dir][0]} ${MX_DIR[H.dir][1]}</span>${mxStatusChip(m)}<span class="mxm-go">${mx.read[m.n] ? "Open" : "Start"} ${mxIco("next", "mx-ico sm")}</span></span>
          </button>`; };
    return `<section class="mxm-band mxm-${t}">
      <div class="mxm-bh"><span class="mxm-n">${bi + 1}</span><div><h3>${MX_BAND[t][0]} <span class="mxm-count">${done ? `${done} of ${ms.length} read` : ms.length}</span></h3><p>${MX_BAND[t][1]}</p></div></div>
      <div class="${t === "diag" ? "mxm-rows" : "mxm-grid"}">${ms.map(card).join("")}</div>
    </section>`;
  }).join("");
}

/* ----- Metrics tab: one metric, in three parts ----- */
const MX_PARTS = [["Understand it","What the number means and why leaders care about it."], ["Measure it","How to produce the number from your own data."], ["Track it","Enter this period's number and your target to see where you stand."]];
function mxArticle(m, list){
  const H = MX_HOW[m.n], L = LAYERS.find(x => x.k === m.l), k = list.indexOf(m), i = METRICS.indexOf(m), seen = new Set();
  const pm = METRICS.find(x => x.n === H.pair), pairIn = pm && list.includes(pm);
  const pf = (MX_PF[m.n] || {})[mx.platform], band = H.dir === "band", u = mxUnit(m), prev = list[k - 1], next = list[k + 1];
  const ph = n => `<div class="mxa-ph"><span class="mxa-pnum">${n}</span><div><h3>${MX_PARTS[n - 1][0]}</h3><p>${MX_PARTS[n - 1][1]}</p></div></div>`;
  const lead = mxGloss(m.d, seen), why = mxGloss(m.w, seen), trap = mxGloss(m.trap, seen), pfH = pf ? mxGloss(pf, seen) : "";
  const steps = H.steps.map(s => `<li>${mxGloss(s, seen)}</li>`).join(""), ex = mxGloss(H.ex, seen), mvp = mxGloss(H.mvp, seen);
  return `<article class="mxa" id="mx-article">
    <div class="mxa-top">
      <button type="button" class="mxa-back" data-back>${mxIco("back", "mx-ico sm")}All metrics</button>
      <span class="mxa-pos">${k + 1} of ${list.length}</span>
      <span class="mxa-arrows"><button type="button" class="mxa-arrow" data-step="-1" aria-label="Previous metric" ${prev ? "" : "disabled"}>${mxIco("back", "mx-ico sm")}</button><button type="button" class="mxa-arrow" data-step="1" aria-label="Next metric" ${next ? "" : "disabled"}>${mxIco("next", "mx-ico sm")}</button></span>
    </div>
    <header class="mxa-head">
      <div class="mxa-eyebrow"><span class="mxa-area">${mxIco(m.l)}${esc(L.n)}</span><span class="mxa-tier mxm-${m.t}">${TIER[m.t][0]}</span></div>
      <h2>${esc(m.n)}</h2>
      <p class="mxa-q">${esc(MX_Q[m.n])}</p>
      <p class="mxa-lead">${lead}</p>
    </header>
    <div class="mxa-grid">
      <div class="mxa-main">
        <section class="mxa-part" id="mxp-1" data-part="1">${ph(1)}
          <div class="mxa-blk"><h4>The formula</h4>${mxFormulaHTML(H.f)}</div>
          <div class="mxa-duo">
            <div class="mxa-why"><h4>${mxIco("bulb")}Why it matters</h4><p>${why}</p></div>
            <div class="mxa-warn"><h4>${mxIco("warn")}Watch out</h4><p>${trap}</p></div>
          </div>
          ${pm ? `<p class="mxa-guard"><b>Read it with ${pairIn ? `<button type="button" class="mx-link" data-go="${METRICS.indexOf(pm)}">${esc(pm.n)}</button>` : esc(pm.n)}.</b> Any metric can be gamed. This one shows when that's happening.</p>` : ""}
        </section>
        <section class="mxa-part" id="mxp-2" data-part="2">${ph(2)}
          ${pf ? `<div class="mxa-pf"><b>${MX_PF_ON[mx.platform]}</b><p>${pfH}</p></div>` : ""}
          <div class="mxa-blk"><h4>Step by step</h4><ol class="mxa-steps">${steps}</ol></div>
          ${MX_SAMPLE[m.n] ? mxSampleHTML(m.n, MX_SAMPLE[m.n]) : ""}
          <div class="mxa-blk"><h4>What you need to log</h4>
            <div class="mxa-logs">${H.src.map(s => { const G = MX_LOGS[s]; return `<button type="button" class="mxa-log" data-log="${s}"><b>${esc(G.n)}</b><span>One row is ${esc(G.row.charAt(0).toLowerCase() + G.row.slice(1))}.</span><code>${G.t}</code></button>`; }).join("")}</div></div>
          <div class="mxa-duo">
            <div class="mxa-ex"><h4>Worked example</h4><p>${ex}</p></div>
            <div class="mxa-mvp"><h4>No data team yet?</h4><p>${mvp}</p></div>
          </div>
          <details class="mxa-sql"><summary><span><b>Starter SQL query</b><span class="note">For your data team. Postgres-style, on an example schema.</span></span>${mxIco("next", "mx-ico sm mxa-chev")}</summary>
            <div class="mxa-sql-b"><pre><code>${esc(H.q)}</code></pre><button type="button" class="btn sm" id="mx-cq">${icon("copy")}Copy query</button></div></details>
        </section>
        <section class="mxa-part" id="mxp-3" data-part="3">${ph(3)}
          <div class="mxa-track">
            <div class="mxa-tin">
              <label class="mxa-y"><span>${esc(MX_SC[m.n][0])}${u ? ` (${esc(u)})` : ""}</span>${mxInput(m, "v")}</label>
              <label class="mxa-y"><span>${band ? "Healthy from" : "Target"}</span>${mxInput(m, "t")}</label>
              <label class="mxa-y"><span>${band ? "Healthy to" : "Off track at"}</span>${mxInput(m, "a")}</label>
            </div>
            <div data-zone="${i}">${mxZoneHTML(m)}</div>
            <div class="mxa-tfoot"><span data-st="${i}">${mxPill(mxStatus(m, mx.vals))}</span>
              <label class="mx-have"><input type="checkbox" id="mx-have" ${mx.have[m.n] ? "checked" : ""}><span>We track this today</span></label>
              <span class="mxa-fine">Saved only in this browser. <button type="button" class="mx-link" data-tab="mine">See all your numbers</button></span></div>
          </div>
          <div class="mxa-blk"><h4>Trend</h4><div class="mxa-trend" data-trend="${i}">${mxTrendHTML(m)}</div></div>
        </section>
        <nav class="mxa-pn">
          ${prev ? `<button type="button" class="mxa-pnb" data-step="-1"><span>${mxIco("back", "mx-ico sm")}Previous</span><b>${esc(prev.n)}</b></button>` : "<span></span>"}
          ${next ? `<button type="button" class="mxa-pnb nx" data-step="1"><span>Next${mxIco("next", "mx-ico sm")}</span><b>${esc(next.n)}</b></button>` : ""}
        </nav>
      </div>
      <aside class="mxa-rail">
        <nav class="mxa-card mxa-toc" aria-label="On this page"><span class="mxa-toc-h">On this page</span>
          ${MX_PARTS.map((p, j) => `<button type="button" class="mxa-tl${j ? "" : " on"}" data-jump="${j + 1}"><b>${j + 1}</b><span>${p[0]}</span>${j === 2 ? `<span class="mxa-tst" data-st="${i}">${mxPill(mxStatus(m, mx.vals))}</span>` : ""}</button>`).join("")}
        </nav>
        <div class="mxa-card mxa-facts">
          <div><span>Good direction</span><b class="mxa-dir mx-${H.dir}">${MX_DIR[H.dir][0]} ${MX_DIR[H.dir][1]}</b></div>
          <div><span>How often</span><b>${esc(H.cad)}</b></div>
          <div><span>Owner</span><b>${esc(H.own)}</b></div>
        </div>
      </aside>
    </div>
  </article>`;
}

// Highlight the part being read in the "On this page" guide
function mxSpy(){
  const parts = [...view.querySelectorAll(".mxa-part")], links = [...view.querySelectorAll(".mxa-tl")];
  if(!parts.length || typeof IntersectionObserver === "undefined") return;
  if(window.__mxSpy) window.__mxSpy.disconnect();
  const io = window.__mxSpy = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting) links.forEach(l => l.classList.toggle("on", l.dataset.jump === e.target.dataset.part));
  }), {rootMargin:"-35% 0px -60% 0px"});
  parts.forEach(p => io.observe(p));
}

/* ----- My scorecard tab ----- */
function mxSumHTML(list){
  const c = {on:0, watch:0, off:0, set:0, none:0};
  list.forEach(m => c[mxStatus(m, mx.vals) || "none"]++);
  const tile = (n, lab, cls) => `<div class="mxs-tile ${cls}"><b>${n}</b><span>${lab}</span></div>`;
  return tile(c.on, "On track", "good") + tile(c.watch, "Watch", "med") + tile(c.off, "Off track", "crit") + tile(c.none + c.set, c.set ? `No value or target (${c.set} missing a target)` : "Not measured yet", "");
}
function mxHistHTML(){
  const h = mx.hist || [];
  return h.length ? `<span class="mxs-hl">Saved periods</span>${h.map((x, j) => `<span class="mxs-chip">${esc(x.p)}<button type="button" data-unsave="${j}" aria-label="Remove ${esc(x.p)} from history">×</button></span>`).join("")}`
    : `<span class="mxs-hl">No saved periods yet. Save one to start building trend lines.</span>`;
}
function mxTabMine(list){
  const lab = (f, t) => `<span class="mx-sc-lab">${t}</span>`;
  return `<div class="mx-intro"><h3>Your scorecard</h3>
    <p>For each metric you track, enter this period's number, your target, and the point where it counts as off track. Save the period when it closes, and each metric builds a trend line you can show leadership.</p></div>
  ${mx.demo ? `<div class="mxs-demo">${mxIco("warn")}<span>You're looking at <b>example numbers</b> for a ${esc(MX_PLATFORMS[mx.platform].toLowerCase())} program, so you can see how a full scorecard reads.</span><button type="button" class="btn sm" id="mx-demo-clear">Clear example numbers</button></div>` : ""}
  <div class="mxs-top">
    <label class="mxa-y mxs-period"><span>Reporting period</span><input class="input" id="mx-period" value="${esc(mx.period || "")}" placeholder="For example Q3 2026"></label>
    <div class="mxs-sum" id="mx-sc-sum">${mxSumHTML(list)}</div>
    <button type="button" class="btn primary mxs-op" id="mx-op">${mxIco("page", "mx-ico")}Leadership one-pager</button>
  </div>
  <div class="mxs-bar">
    <button type="button" class="btn sm" id="mx-snap">Save ${mx.period ? esc(mx.period) : "this period"} to history</button>
    <span class="mxs-hist" id="mx-hist">${mxHistHTML()}</span>
    <span class="mxs-act">${mx.demo ? "" : `<button type="button" class="btn sm" id="mx-demo">See example numbers</button>`}<button type="button" class="btn sm" id="mx-sc-copy">${icon("copy")}Copy table</button>${DL ? `<button type="button" class="btn sm" id="mx-sc-csv"><svg><use href="#i-download"/></svg>CSV</button>` : ""}</span>
  </div>
  <div class="card mx-sig" id="mx-sig">${mxSigHTML(list)}</div>
  <div class="card mx-sc">
    <div class="mx-sc-row h"><span>Metric</span><span>Your value</span><span>Target</span><span>Off track at</span><span>Trend</span><span>Status</span></div>
    ${MX_TORD.map(t => { const ms = list.filter(m => m.t === t); if(!ms.length) return "";
      return `<div class="mx-sc-grp mxm-${t}">${MX_TIER_NAME[t]}</div>` + ms.map(m => {
        const i = METRICS.indexOf(m), H = MX_HOW[m.n], u = mxUnit(m), band = H.dir === "band", al = f => ` aria-label="${esc(m.n)}: ${f}"`;
        return `<div class="mx-sc-row">
          <div class="mx-sc-name"><button type="button" class="mx-link" data-open="${i}">${esc(m.n)}</button><small>${esc(MX_SC[m.n][0])}${u ? " (" + esc(u) + ")" : ""} · ${MX_DIR[H.dir][0]} ${MX_DIR[H.dir][1].toLowerCase()}</small></div>
          <label class="mx-sc-in">${lab("v", "Value")}${mxInput(m, "v", al("your value"))}</label>
          <label class="mx-sc-in">${lab("t", band ? "From" : "Target")}${mxInput(m, "t", al(band ? "healthy from" : "target"))}</label>
          <label class="mx-sc-in">${lab("a", band ? "To" : "Off track at")}${mxInput(m, "a", al(band ? "healthy to" : "off track at"))}</label>
          <div class="mx-sc-tr" data-spark="${i}">${mxSpark(m)}</div>
          <div class="mx-sc-st" data-st="${i}">${mxPill(mxStatus(m, mx.vals))}</div>
        </div>`; }).join(""); }).join("")}
  </div>`;
}

/* ----- Data to log tab ----- */
function mxTabData(list){
  const U = MX_UNITS[mx.platform] || MX_UNITS.social, used = {};
  list.forEach(m => MX_HOW[m.n].src.forEach(k => (used[k] = used[k] || []).push(m)));
  const keys = Object.keys(used).sort((a, b) => used[b].length - used[a].length);
  const areas = LAYERS.filter(L => list.some(m => m.l === L.k));
  return `<div class="mx-intro"><h3>Log these first</h3>
    <p>Every metric on your list is calculated from a few event logs. Most teams can't measure well because a timestamp or a source field was never logged. On a <b>${esc(MX_PLATFORMS[mx.platform].toLowerCase())}</b> platform, "content" means ${esc(U.obj)}. Exposure is measured in <b>${esc(U.exp)}</b>, and rates are divided by <b>${esc(U.den)}</b>.</p></div>
  <div class="mx-logs">${keys.map(k => { const L = MX_LOGS[k]; return `<div class="card mx-log" id="mx-log-${k}">
    <div class="mx-log-h"><b>${esc(L.n)}</b><span class="mx-unlock">Used by ${used[k].length}</span></div>
    <p class="mx-row">One row is ${esc(L.row.charAt(0).toLowerCase() + L.row.slice(1))}.</p>
    <div class="mx-fields"><code class="mx-tbl">${L.t}</code>${L.f.map(f => `<code>${f}</code>`).join("")}</div>
    <p class="mx-tip">${esc(L.tip)}</p>
    <div class="mx-used"><span>Used by</span>${used[k].map((m, j) => j < 4 ? mxOpenLink(m) : mxOpenLink(m).replace('class="mx-link"', 'class="mx-link" hidden')).join("")}${used[k].length > 4 ? `<button type="button" class="mx-more">+${used[k].length - 4} more</button>` : ""}</div></div>`; }).join("")}</div>
  <div class="card mx-sscard">${mxSampleHTML("general", [1, 0.5])}<p class="note">Most outcome and quality metrics come from labeled random samples. Use this to size yours before you start labeling.</p></div>
  <div class="card mx-areas"><h3>Where the data usually lives</h3>
    ${areas.map(L => { const g = MX_LAYER_HOW[L.k]; return `<div class="mx-arow"><b>${mxIco(L.k)}${esc(L.n)}</b><div><span>Source</span>${esc(g[0])}</div><div><span>Owner</span>${esc(g[1])}</div><div><span>The hard part</span>${esc(g[2])}</div></div>`; }).join("")}</div>`;
}

/* ----- Running the program tab ----- */
function mxTabRun(list){
  const rv = Object.keys(MX_RV).map(k => [k, list.filter(m => MX_HOW[m.n].rv === k)]).filter(x => x[1].length);
  return `<div class="mx-intro"><h3>Put every metric on a calendar</h3>
    <p>A metric only changes behavior when a named meeting looks at it on a schedule. This is who should look at what.</p></div>
  <div class="mx-rgrid">${rv.map(([k, ms]) => `<div class="card mx-rv"><h4>${MX_RV[k][0]}</h4><p>${MX_RV[k][1]}</p>
    <ul class="mx-rvl">${ms.map(m => `<li>${mxOpenLink(m)}</li>`).join("")}</ul></div>`).join("")}</div>
  <div class="mx-run2">
    <div class="card mx-targets"><h3>How to set targets</h3>
      <ol>${MX_TARGETS.map(t => `<li><b>${t[0]}</b> ${esc(t[1])}</li>`).join("")}</ol>
      <p class="note">Enter your own targets in <button type="button" class="mx-link" data-tab="mine">My scorecard</button>.</p></div>
    <div class="card mx-vanity"><h3>Keep these off the executive slide</h3>
      <p class="note">Easy to count and impressive on a slide, but none of them tell you whether users are safer.</p>
      <ul>${VANITY.map(v => `<li><b>${esc(v[0])}.</b> ${esc(v[1])}</li>`).join("")}</ul></div>
  </div>`;
}

/* ----- exports ----- */
const mxCell = x => String(x == null ? "" : x).replace(/\|/g, "/");
function mxScoreRows(list){ return list.map(m => { const s = mx.vals[m.n] || {}, st = mxStatus(m, mx.vals); return {m, s, st:st ? MX_STAT[st][0] : "Not measured"}; }); }
function mxScoreMd(list, h = "#"){
  return [`${h} T&S scorecard${mx.period ? ": " + mx.period : ""}`, ``, `${MX_PLATFORMS[mx.platform]} · ${MX_STAGE[mx.stage]}`, ``,
    `| Area | Metric | Measure | Value | Target / from | Off track at / to | Status |`, `|---|---|---|---|---|---|---|`,
    ...mxScoreRows(list).map(r => `| ${LAYERS.find(L => L.k === r.m.l).n} | ${r.m.n} | ${MX_SC[r.m.n][0]}${mxUnit(r.m) ? " (" + mxUnit(r.m) + ")" : ""} | ${mxCell(r.s.v)} | ${mxCell(r.s.t)} | ${mxCell(r.s.a)} | ${r.st} |`)].join("\n");
}
function mxScoreCsv(list){
  const q = x => `"${String(x == null ? "" : x).replace(/"/g, '""')}"`, hp = (mx.hist || []).map(h => h.p);
  return [["Area","Metric","Tier","Measure","Unit","Direction", ...hp, "Value" + (mx.period ? " (" + mx.period + ")" : ""),"Target (or range from)","Off track at (or range to)","Status","Owner","How often"].map(q).join(","),
    ...mxScoreRows(list).map(r => { const H = MX_HOW[r.m.n];
      return [LAYERS.find(L => L.k === r.m.l).n, r.m.n, TIER[r.m.t][0], MX_SC[r.m.n][0], mxUnit(r.m), MX_DIR[H.dir][1], ...(mx.hist || []).map(h => (h.v || {})[r.m.n] || ""), r.s.v, r.s.t, r.s.a, r.st, H.own, H.cad].map(q).join(","); })].join("\n");
}
function mxPlanText(list){
  const U = MX_UNITS[mx.platform] || MX_UNITS.social, used = [...new Set(list.flatMap(m => MX_HOW[m.n].src))];
  const out = [`# T&S metrics plan`, ``, `Platform: ${MX_PLATFORMS[mx.platform]} · Stage: ${MX_STAGE[mx.stage]} · Regulated: ${mx.reg ? "yes" : "no"}`,
    `Tracked today: ${mxTracked(list).replace(" tracked", "")} of ${list.length}`, ``];
  if(list.some(m => mxStatus(m, mx.vals))) out.push(mxScoreMd(list, "##"), ``);
  out.push(`## Data to log`, ``, `On this platform, content means ${U.obj}; exposure is measured in ${U.exp}; rates are divided by ${U.den}.`, ``);
  used.forEach(k => { const L = MX_LOGS[k]; out.push(`- **${L.n}** (\`${L.t}\`): one row is ${L.row}. Fields: ${L.f.join(", ")}. ${L.tip}`); });
  MX_TORD.forEach(t => {
    const ms = list.filter(m => m.t === t); if(!ms.length) return;
    out.push(``, `## ${MX_BAND[t][0]}`);
    ms.forEach(m => {
      const H = MX_HOW[m.n], pf = (MX_PF[m.n] || {})[mx.platform];
      out.push(``, `### ${m.n}`, ``, `*${MX_Q[m.n]}*`, ``, m.d, ``,
        `- Formula: ${H.f}`, `- Data: ${H.src.map(k => MX_LOGS[k].t).join(", ")}`, `- How often: ${H.cad} · Owner: ${H.own} · ${MX_DIR[H.dir][1]}`,
        `- Read it with: ${H.pair}`, `- Watch out: ${m.trap}`, ...(pf ? [`- ${MX_PF_ON[mx.platform]}: ${pf}`] : []),
        ``, `How to measure it:`, ...H.steps.map((s, j) => `${j + 1}. ${s}`),
        ``, `No data team yet? ${H.mvp}`, ``, "```sql", H.q, "```");
    });
  });
  out.push(``, `## Keep off the executive slide`, ...VANITY.map(v => `- ${v[0]}: ${v[1]}`));
  return out.join("\n");
}

/* ----- leadership one-pager ----- */
function mxOnePagerInner(list){
  const measured = list.filter(m => { const s = mxStatus(m, mx.vals); return s; });
  if(!measured.length) return `<div class="op-empty"><h1>Nothing to show yet</h1><p>Enter at least one value in My scorecard, or try the example numbers.</p></div>`;
  const c = {on:0, watch:0, off:0}; measured.forEach(m => { const s = mxStatus(m, mx.vals); if(c[s] != null) c[s]++; });
  const cls = s => s && s !== "set" ? MX_STAT[s][1] : "";
  const att = measured.filter(m => ["off", "watch"].includes(mxStatus(m, mx.vals))).sort((a, b) => (mxStatus(a, mx.vals) === "off" ? 0 : 1) - (mxStatus(b, mx.vals) === "off" ? 0 : 1));
  const val = m => mxFmt(m, mxNum((mx.vals[m.n] || {}).v));
  const delta = m => { const d = mxDelta(m); return d ? `<span class="op-d ${d.good}">${esc(d.text)} vs ${esc(d.prev)}</span>` : ""; };
  const row = m => { const st = mxStatus(m, mx.vals);
    return `<tr><td><b>${esc(m.n)}</b><small>${esc(MX_Q[m.n])}</small></td><td class="num">${esc(val(m))}<small class="op-meas">${esc(MX_SC[m.n][0])}</small>${delta(m)}</td><td class="num">${esc(mxTargetText(m) || "Not set")}</td><td>${mxSpark(m, 92, 26)}</td><td><span class="op-st ${cls(st)}">${MX_STAT[st][0]}</span></td></tr>`; };
  return `<header class="op-h"><div><div class="op-k">Trust &amp; Safety scorecard</div><h1>${esc(mx.period || "Current period")}</h1>
      <p>${esc(MX_PLATFORMS[mx.platform])} · ${MX_STAGE[mx.stage]}${mx.reg ? " · EU DSA / UK OSA in scope" : ""}</p></div>
      <div class="op-date">Prepared ${esc(new Date().toLocaleDateString(undefined, {year:"numeric", month:"long", day:"numeric"}))}</div></header>
    <section class="op-tiles">
      <div class="op-tile good"><b>${c.on}</b><span>On track</span></div><div class="op-tile med"><b>${c.watch}</b><span>Watch</span></div>
      <div class="op-tile crit"><b>${c.off}</b><span>Off track</span></div><div class="op-tile"><b>${list.length - measured.length}</b><span>Not measured yet</span></div>
    </section>
    ${att.length ? `<section class="op-att"><h2>Needs attention</h2><ul>${att.map(m => { const st = mxStatus(m, mx.vals), H = MX_HOW[m.n];
      return `<li><span class="op-st ${cls(st)}">${MX_STAT[st][0]}</span><span><b>${esc(m.n)}</b>: ${esc(MX_SC[m.n][0].charAt(0).toLowerCase() + MX_SC[m.n][0].slice(1))} is <b>${esc(val(m))}</b>, against a target of ${esc((mxTargetText(m) || "not set").replace(/^≤ 0 /, "0 "))}. Read it with ${esc(H.pair)}.</span></li>`; }).join("")}</ul></section>` : ""}
    ${mxSigHTML(list, true)}
    ${MX_TORD.map(t => { const ms = measured.filter(m => m.t === t); if(!ms.length) return "";
      return `<section class="op-sec"><h2>${MX_TIER_NAME[t]}</h2><table><thead><tr><th>Metric</th><th>This period</th><th>Target</th><th>Trend</th><th>Status</th></tr></thead><tbody>${ms.map(row).join("")}</tbody></table></section>`; }).join("")}
    <footer class="op-f">Status compares each value with the program's own target and off-track line. ${(mx.hist || []).length ? `Trends cover ${esc((mx.hist || []).map(h => h.p).concat(mx.period ? [mx.period] : []).filter((p, j, a) => a.indexOf(p) === j).join(", "))}. ` : ""}Made with T&amp;S Workbench.</footer>`;
}
function mxOnePagerDoc(list){
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>T&amp;S scorecard${mx.period ? " " + esc(mx.period) : ""}</title>
<style>body{margin:0;background:#f3f4f6}@media print{body{background:#fff}.mxop{padding:0}}${MX_OP_CSS}</style></head><body><div class="mxop">${mxOnePagerInner(list)}</div></body></html>`;
}
function mxOpenOnePager(list){
  if(!document.getElementById("mxop-css")){ const st = document.createElement("style"); st.id = "mxop-css"; st.textContent = MX_OP_CSS + MX_OP_PRINT; document.head.appendChild(st); }
  const prev = document.activeElement, bg = document.createElement("div");
  bg.className = "mxop-bg"; bg.setAttribute("role", "dialog"); bg.setAttribute("aria-modal", "true"); bg.setAttribute("aria-label", "Leadership one-pager");
  bg.innerHTML = `<div class="mxop-bar"><b>Leadership one-pager</b><span class="toast" id="mxop-toast" aria-live="polite"></span>
    ${DL ? `<button type="button" class="btn sm" data-op="dl"><svg><use href="#i-download"/></svg>Download to print</button>` : ""}<button type="button" class="btn sm" data-op="print">Print</button><button type="button" class="btn sm primary" data-op="close">Close</button></div>
    <div class="mxop">${mxOnePagerInner(list)}</div>`;
  document.body.appendChild(bg);
  const onKey = e => { if(e.key === "Escape") close(); };
  const close = () => { bg.remove(); document.removeEventListener("keydown", onKey); if(prev && prev.focus) prev.focus(); };
  document.addEventListener("keydown", onKey);
  bg.onclick = e => { if(e.target === bg) close(); };
  bg.querySelector('[data-op="close"]').onclick = close;
  bg.querySelector('[data-op="print"]').onclick = () => { try{ window.print(); }catch(e){ flashIn(bg.querySelector("#mxop-toast"), "Printing isn't available here. Use Download instead."); } };
  const d = bg.querySelector('[data-op="dl"]'); if(d) d.onclick = () => offerFile(`ts-scorecard${mx.period ? "-" + mx.period.replace(/[^a-z0-9]+/gi, "-").toLowerCase() : ""}.html`, mxOnePagerDoc(list), mxScoreMd(list), bg.querySelector("#mxop-toast"));
  bg.querySelector('[data-op="close"]').focus();
}

/* ----- example numbers ----- */
function mxLoadDemo(list){
  if(!mx.demo) mx.demoBackup = {vals:mx.vals, hist:mx.hist || [], period:mx.period || "", have:mx.have};
  mx.vals = {}; mx.have = Object.assign({}, mx.have); mx.hist = MX_DEMO_P.slice(0, 3).map(p => ({p, v:{}}));
  list.forEach(m => { const d = MX_DEMO[m.n]; if(!d) return;
    mx.vals[m.n] = {v:String(d[2][3]), t:String(d[0]), a:String(d[1])}; mx.have[m.n] = true;
    d[2].slice(0, 3).forEach((x, j) => { mx.hist[j].v[m.n] = String(x); }); });
  mx.period = MX_DEMO_P[3]; mx.demo = true;
}
function mxClearDemo(){
  const b = mx.demoBackup || {};
  mx.vals = b.vals || {}; mx.hist = b.hist || []; mx.period = b.period || ""; mx.have = b.have || {};
  delete mx.demoBackup; mx.demo = false;
}

/* ----- behavior ----- */
function mxFlash(el, block = "center"){
  if(!el || !el.scrollIntoView) return;
  el.scrollIntoView({behavior:"smooth", block});
  el.classList.remove("mx-flash"); void el.offsetWidth; el.classList.add("mx-flash");
}
// Every view has its own address, so Back works and a metric can be linked to directly
function mxGo(sub){ const h = "#metrics" + (sub ? "/" + sub : ""); if(location.hash === h) renderMetrics(); else location.hash = h; }
function mxFromHash(list){
  const parts = (location.hash || "").slice(1).split("/");
  if(parts[0] !== "metrics") return;
  const sub = parts[1] || "", tab = MX_TABS.find(t => t[2] && t[2] === sub);
  if(tab){ mx.tab = tab[0]; mx.open = null; return; }
  mx.tab = "card";
  const m = sub && list.find(x => mxSlug(x) === sub);
  mx.open = m ? m.n : null;
  if(sub && !m && typeof history !== "undefined" && history.replaceState) history.replaceState(null, "", "#metrics");
}

function mxSetVal(m, inp, list){
  const f = inp.dataset.f, val = inp.value.trim();
  inp.setAttribute("aria-invalid", val !== "" && mxNum(val) == null ? "true" : "false");
  const s = mx.vals[m.n] = Object.assign({}, mx.vals[m.n], {[f]: val});
  if(!s.v && !s.t && !s.a) delete mx.vals[m.n];
  if(f === "v" && val && !mx.have[m.n]){ mx.have[m.n] = true; const cb = $("#mx-have"); if(cb && mx.open === m.n) cb.checked = true; }
  store.set("mx", mx);
  const i = METRICS.indexOf(m);
  view.querySelectorAll(`[data-st="${i}"]`).forEach(el => el.innerHTML = mxPill(mxStatus(m, mx.vals)));
  view.querySelectorAll(`[data-zone="${i}"]`).forEach(el => el.innerHTML = mxZoneHTML(m));
  view.querySelectorAll(`[data-trend="${i}"]`).forEach(el => el.innerHTML = mxTrendHTML(m));
  view.querySelectorAll(`[data-spark="${i}"]`).forEach(el => el.innerHTML = mxSpark(m));
  const sum = $("#mx-sc-sum"); if(sum) sum.innerHTML = mxSumHTML(list);
  const sig = $("#mx-sig"); if(sig){ sig.innerHTML = mxSigHTML(list); sig.querySelectorAll("[data-go]").forEach(b => b.onclick = () => mxGo(mxSlug(METRICS[+b.dataset.go]))); }
}

// Glossary tooltips: open on tap, and flip left when a term sits near the right edge
function mxBindGloss(){
  view.querySelectorAll(".gl").forEach(g => {
    const place = () => { if(g.getBoundingClientRect) g.classList.toggle("gl-r", g.getBoundingClientRect().left > innerWidth - 300); };
    g.onmouseenter = place; g.onfocus = place; g.onclick = () => { place(); g.focus(); };
  });
}

function renderMetrics(){
  mx.have = mx.have || {}; mx.vals = mx.vals || {}; mx.read = mx.read || {}; mx.hist = mx.hist || [];
  if(!MX_PLATFORMS[mx.platform]) mx.platform = "social";
  // A fresh scorecard starts from the workspace settings
  if(!mx.orgSet && typeof orgGet === "function" && !Object.keys(mx.vals || {}).length && !Object.keys(mx.read || {}).length){ const o = orgGet();
    if(o.type && ORG_MAP.mx[o.type]) mx.platform = ORG_MAP.mx[o.type]; if(o.stage) mx.stage = ORG_MAP.mxStage[o.stage];
    if(o.regions && o.regions.length) mx.reg = o.regions.some(r => r === "eu" || r === "uk"); if(o.type || o.stage) mx.orgSet = true; }
  const list = mxList();
  mxFromHash(list);
  if(!MX_TABS.some(t => t[0] === mx.tab)) mx.tab = "card";
  const open = mx.tab === "card" && list.find(m => m.n === mx.open);
  if(!open) mx.open = null;
  if(open && !mx.read[open.n]) mx.read[open.n] = true;
  store.set("mx", mx);
  const tabs = {card:() => open ? mxArticle(open, list) : mxMap(list), mine:() => mxTabMine(list), data:() => mxTabData(list), run:() => mxTabRun(list)};
  const counts = MX_TORD.map(t => list.filter(m => m.t === t).length);
  const actions = `<button class="btn sm" id="mx-save"><svg><use href="#i-save"/></svg>${wsSaveLabel("metrics")}</button>${DL ? `<button class="btn sm" id="mx-dl"><svg><use href="#i-download"/></svg>Download plan</button>` : ""}<button class="btn sm primary" id="mx-copy">${icon("copy")}Copy plan</button>`;
  const top = open
    ? `<div class="mxc"><button type="button" class="mxc-l" data-back><span class="mxc-t">Metrics Framework</span><span class="mxc-ctx">${esc(MX_PLATFORMS[mx.platform])} · ${MX_STAGE[mx.stage]}${mx.reg ? " · Regulated" : ""}</span></button><div class="mxc-r">${actions}</div></div>`
    : head("Metrics Framework",
      "The numbers a T&S program should run on, in the order to adopt them, with a step-by-step guide to measuring each one on your platform.",
      "Run the program", actions) + `
    <div class="mxm-filter">
      <span>Showing <b>${list.length} metrics</b> for</span>
      <select class="mxm-sel" id="mx-platform" aria-label="Platform">${Object.entries(MX_PLATFORMS).map(([k, v]) => `<option value="${k}" ${mx.platform === k ? "selected" : ""}>${v}</option>`).join("")}</select>
      <span>·</span>
      <select class="mxm-sel" id="mx-stage" aria-label="Program stage">${Object.entries(MX_STAGE).map(([k, v]) => `<option value="${k}" ${mx.stage === k ? "selected" : ""} title="${MX_STAGE_HELP[k]}">${v}</option>`).join("")}</select>
      <label class="mxm-reg"><input type="checkbox" id="mx-reg" ${mx.reg ? "checked" : ""}><span>EU DSA or UK Online Safety Act applies</span></label>
      <span class="mxm-mix"><i class="mxm-ns"></i>${counts[0]} north star<i class="mxm-health"></i>${counts[1]} health<i class="mxm-diag"></i>${counts[2]} diagnostic</span>
    </div>
    <div class="mx-tabs" role="tablist">${MX_TABS.map(([k, n]) => `<button type="button" role="tab" class="mx-tab${mx.tab === k ? " on" : ""}" aria-selected="${mx.tab === k}" data-tab="${k}">${n}${k === "mine" && Object.keys(mx.vals).length ? ` <span class="mx-tabn">${list.filter(m => mxStatus(m, mx.vals)).length}</span>` : ""}</button>`).join("")}<span class="toast" id="mx-toast" aria-live="polite"></span></div>`;
  view.innerHTML = top + `<div class="mx-body">${open ? `<span class="toast" id="mx-toast" aria-live="polite"></span>` : ""}${tabs[mx.tab]()}</div>`;

  const save = () => { store.set("mx", mx); renderMetrics(); };
  const tabSub = k => (MX_TABS.find(t => t[0] === k) || [])[2] || "";
  const bind = (sel, fn) => view.querySelectorAll(sel).forEach(fn);
  const p = $("#mx-platform"); if(p && !open){ p.onchange = e => { mx.platform = e.target.value; save(); }; $("#mx-stage").onchange = e => { mx.stage = e.target.value; save(); }; $("#mx-reg").onchange = e => { mx.reg = e.target.checked; save(); }; }
  $("#mx-save").onclick = () => { const msg = wsSaveTool("metrics", mx, metricsTitle(mx)); renderMetrics(); flashIn($("#mx-toast"), msg); };
  $("#mx-copy").onclick = () => copyText(mxPlanText(list), $("#mx-toast"));
  const dl = $("#mx-dl"); if(dl && DL) dl.onclick = () => { const md = mxPlanText(list); offerFile("ts-metrics-plan.md", md, md, $("#mx-toast")); };
  bind("[data-tab]", b => b.onclick = () => mxGo(tabSub(b.dataset.tab)));
  bind("[data-open]", b => b.onclick = () => mxGo(mxSlug(METRICS[+b.dataset.open])));
  bind("[data-go]", b => b.onclick = () => mxGo(mxSlug(METRICS[+b.dataset.go])));
  bind("[data-back]", b => b.onclick = () => { const was = mx.open; mxGo(""); setTimeout(() => mxFlash(view.querySelector(`[data-open="${METRICS.findIndex(m => m.n === was)}"]`)), 120); });
  bind("[data-step]", b => b.onclick = () => { const n = list[list.indexOf(open) + +b.dataset.step]; if(n) mxGo(mxSlug(n)); });
  bind("[data-log]", b => b.onclick = () => { const k = b.dataset.log; mxGo("data"); setTimeout(() => mxFlash(document.getElementById("mx-log-" + k)), 140); });
  bind("[data-f]", inp => inp.oninput = () => mxSetVal(METRICS[+inp.dataset.i], inp, list));
  bind(".mx-more", b => b.onclick = () => { b.parentNode.querySelectorAll("[hidden]").forEach(x => x.hidden = false); b.remove(); });
  bind("[data-jump]", b => b.onclick = () => { const el = $("#mxp-" + b.dataset.jump); if(el && el.scrollIntoView) el.scrollIntoView({behavior:"smooth", block:"start"}); });
  mxBindGloss();
  bind(".mxss", box => { const out = box.querySelector(".mxss-out"), val = k => box.querySelector(`[data-ssf="${k}"]`).value;
    const upd = () => { const p = mxNum(val("p")), e = mxNum(val("e")); out.innerHTML = mxSampleOut(p != null && e != null ? mxSampleN(p, e, +val("z")) : null); };
    box.querySelectorAll("[data-ssf]").forEach(i => { i.oninput = upd; i.onchange = upd; }); });
  if(open){
    mxSpy();
    $("#mx-have").onchange = e => { if(e.target.checked) mx.have[open.n] = true; else delete mx.have[open.n]; store.set("mx", mx); };
    $("#mx-cq").onclick = () => copyText(MX_HOW[open.n].q, $("#mx-toast"));
  }
  if(mx.tab === "mine"){
    $("#mx-period").oninput = e => { mx.period = e.target.value; store.set("mx", mx); const s = $("#mx-snap"); if(s) s.textContent = `Save ${mx.period.trim() || "this period"} to history`; };
    $("#mx-snap").onclick = () => {
      const p = (mx.period || "").trim();
      if(!p){ flashIn($("#mx-toast"), "Name the period first, for example Q3 2026."); const i = $("#mx-period"); if(i && i.focus) i.focus(); return; }
      const v = {}; list.forEach(m => { const x = (mx.vals[m.n] || {}).v; if(x) v[m.n] = x; });
      if(!Object.keys(v).length){ flashIn($("#mx-toast"), "Enter at least one value before saving the period."); return; }
      const j = mx.hist.findIndex(h => h.p === p);
      if(j > -1) mx.hist[j] = {p, v}; else mx.hist.push({p, v});
      store.set("mx", mx); renderMetrics();
      flashIn($("#mx-toast"), `${j > -1 ? "Updated" : "Saved"} ${p}. Rename the period when the next one starts.`);
    };
    bind("[data-unsave]", b => b.onclick = () => { const h = mx.hist.splice(+b.dataset.unsave, 1)[0]; store.set("mx", mx); renderMetrics(); flashIn($("#mx-toast"), `Removed ${h.p} from history.`); });
    $("#mx-op").onclick = () => mxOpenOnePager(list);
    const demo = $("#mx-demo"); if(demo) demo.onclick = () => { mxLoadDemo(list); save(); flashIn($("#mx-toast"), "Loaded example numbers. Your own numbers come back when you clear them."); };
    const clr = $("#mx-demo-clear"); if(clr) clr.onclick = () => { mxClearDemo(); save(); flashIn($("#mx-toast"), "Example numbers cleared."); };
    $("#mx-sc-copy").onclick = () => copyText(mxScoreMd(list), $("#mx-toast"));
    const csv = $("#mx-sc-csv");
    if(csv && DL) csv.onclick = () => offerFile(`ts-scorecard${mx.period ? "-" + mx.period.replace(/[^a-z0-9]+/gi, "-").toLowerCase() : ""}.csv`, mxScoreCsv(list), mxScoreMd(list), $("#mx-toast"));
  }
}
