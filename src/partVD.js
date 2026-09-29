/* ---------- Vendor scorecard: guided scoring with rubrics ---------- */
// The question each criterion answers, and what a 1, 3 and 5 look like
const VD_Q = {
  quality:"Will their reviewers make the same calls your experts would?",
  wellness:"Will they protect the people who look at the worst content?",
  lang:"Can they understand your users in every language and market?",
  surge:"Can they scale up fast when something goes wrong?",
  security:"Can you trust them with your users' data?",
  cost:"What will it really cost once everything is included?",
  tooling:"Will they work inside your tools and share data back?",
  reporting:"Will you be able to see how they're really performing?"
};
const VD_RUBRIC = {
  quality:["No QA data they'll share, or low agreement with your experts.", "Solid agreement on their own QA, but not tested on your policies.", "High agreement in a blind pilot on your data, measured by your team."],
  wellness:["No exposure limits or counseling, and attrition they won't disclose.", "Counseling and some exposure limits, but not enforced per person.", "Hard daily exposure caps per person, licensed counseling during and after employment, blurring tools by default."],
  lang:["Machine translation or non-native reviewers for key markets.", "Native speakers for major languages, with gaps in dialects and smaller markets.", "Native, in-market reviewers for every language you need, with local cultural knowledge."],
  surge:["Weeks to add capacity and no incident playbook.", "Can add 20 to 30% within a couple of weeks, with some quality dip.", "Proven surge within days, a trained reserve, and follow-the-sun coverage."],
  security:["No certifications, and reviewers on personal devices.", "SOC 2 or ISO 27001 certified, with limited access logging.", "Certified, managed devices or clean rooms, audited access, and a documented process for illegal content."],
  cost:["Opaque pricing, heavy minimums and paid ramp time.", "Clear per-decision or per-hour pricing with some extras.", "Transparent all-in pricing that stays competitive once rework and appeals are counted."],
  tooling:["Must use their own tool, with no data back to you.", "Can use your tool with some setup, and periodic exports.", "Works inside your review stack and sends decision data back through an API."],
  reporting:["Monthly summary slides only.", "Regular dashboards with QA summaries.", "Live dashboards, raw QA samples and fast escalation of quality misses."]
};
Object.assign(MX_GLOSS, {
  "BPO":"Business process outsourcing: a large general-purpose outsourcing company, as opposed to a T&S specialist.",
  "RFP":"Request for proposal: the document you send vendors asking them to bid and answer your questions.",
  "SOC 2":"An independent audit of how a company protects customer data. Type II covers how controls worked over several months.",
  "ISO 27001":"An international certification for information security management.",
  "follow-the-sun":"Coverage handed between teams in different time zones, so work continues around the clock.",
  "attrition":"The share of staff who leave over a period, usually shown as a yearly rate.",
  "clean room":"A secured workspace where reviewers can't copy, photograph or take out data.",
  "CSAM":"Child sexual abuse material. Handling it is tightly regulated, and it must be reported to the authorities."
});
MX_GLOSS_RE = null;

const VD_STEPS = [["What matters to you","Set how much each criterion counts. Weights add up to 100."], ["Score your vendors","Rate each vendor from 1 to 5 using the rubric, after asking the RFP questions."], ["Read the result","The highest weighted score wins, unless a vendor fails a minimum."]];
const VD_HEAT = ["", "crit", "high", "med", "good2", "good"];

// Example names once carried a vendor type; any two vendors can be compared, so names are just names
vx.vendors.forEach(v => { const m = /^(Vendor [ABC]) \((global BPO|T&S specialist|regional)\)$/.exec(v.name || ""); if(m) v.name = m[1]; });
const VD_MAX = 4, VD_MIN = 2;
const vdScored = v => CRITERIA.filter(c => v.s[c.k]).length;
const vdDone = v => vdScored(v) === CRITERIA.length;
// Starting weights for common priorities; each adds up to 100
const VD_PRESETS = [
  ["balanced", "Balanced", Object.fromEntries(CRITERIA.map(c => [c.k, c.w]))],
  ["quality", "Quality first", {quality:30, wellness:15, lang:10, surge:5, security:15, cost:5, tooling:5, reporting:15}],
  ["cost", "Cost matters most", {quality:20, wellness:10, lang:10, surge:10, security:10, cost:30, tooling:5, reporting:5}],
  ["regulated", "Regulated or high-risk", {quality:20, wellness:15, lang:10, surge:5, security:25, cost:5, tooling:5, reporting:15}],
  ["scale", "Many languages, big surges", {quality:15, wellness:10, lang:25, surge:25, security:10, cost:5, tooling:5, reporting:5}]
];
const vdPresetOn = () => (VD_PRESETS.find(([, , w]) => CRITERIA.every(c => (+vx.weights[c.k] || 0) === w[c.k])) || [])[0];
// Scale the weights to 100 in steps of 5, keeping their proportions
function vdNormalize(){
  const tw = vdTotal(); if(!tw) return;
  const w = {}; CRITERIA.forEach(c => { w[c.k] = Math.round((+vx.weights[c.k] || 0) / tw * 100 / 5) * 5; });
  let diff = 100 - CRITERIA.reduce((a, c) => a + w[c.k], 0);
  const order = CRITERIA.slice().sort((a, b) => w[b.k] - w[a.k]);
  for(let i = 0; diff !== 0 && i < 40; i++){ const c = order[i % order.length]; const step = diff > 0 ? 5 : -5; if(w[c.k] + step >= 0){ w[c.k] += step; diff -= step; } }
  vx.weights = w;
}
const vdBlank = n => ({name:n, s:Object.fromEntries(CRITERIA.map(c => [c.k, null]))});
function vdTotal(){ return CRITERIA.reduce((a, c) => a + (+vx.weights[c.k] || 0), 0); }
function vdRank(){
  const scored = vx.vendors.map((v, i) => ({i, v, done:vdDone(v), score:vendorScore(v), flags:CRITERIA.filter(c => c.deal && v.s[c.k] && v.s[c.k] <= 2)}));
  // Fully scored vendors rank first; a vendor still being scored waits at the bottom
  const sorted = scored.slice().sort((a, b) => (a.done ? 0 : 1) - (b.done ? 0 : 1) || (a.flags.length ? 1 : 0) - (b.flags.length ? 1 : 0) || b.score - a.score);
  return {scored, sorted, top:sorted.find(x => x.done && !x.flags.length) || null};
}
function vdRailHTML(){
  const {sorted, top} = vdRank(), tw = vdTotal();
  return `<div class="vd-rail-h"><h4>Live result</h4><span class="note">Updates as you score</span></div>
    ${sorted.map((x, r) => `<div class="vd-rk ${x === top ? "top" : ""} ${x.flags.length ? "out" : ""}">
      <span class="vd-rk-n">${r + 1}</span>
      <div class="vd-rk-b"><div class="vd-rk-t"><b>${esc(x.v.name)}</b>${x === top ? `<span class="pill accent">${sorted.every(y => y.done) ? "Recommended" : "Leading so far"}</span>` : x.flags.length ? `<span class="pill crit">Ruled out</span>` : !x.done ? `<span class="pill">Scoring</span>` : ""}</div>
        ${x.done ? `<div class="vd-rk-s"><span class="mono">${x.score.toFixed(2)}</span><span class="note">/ 5</span><div class="vd-bar"><i style="width:${x.score / 5 * 100}%"></i></div></div>`
          : `<div class="vd-rk-s"><span class="note">${vdScored(x.v)} of ${CRITERIA.length} scored</span><div class="vd-bar"><i style="width:${vdScored(x.v) / CRITERIA.length * 100}%;background:var(--faint)"></i></div></div>`}
        ${x.flags.length ? `<small>Scores 2 or lower on ${x.flags.map(f => f.n.toLowerCase()).join(" and ")}.</small>` : ""}</div>
    </div>`).join("")}
    <p class="vd-tw ${tw === 100 ? "ok" : ""}">${tw === 100 ? "✓ Weights add up to 100" : `Weights add up to ${tw}. Aim for 100 so the tradeoffs are easy to explain. ${tw ? `<button type="button" class="pol-add" id="vx-norm">Make it 100</button>` : ""}`}</p>`;
}
function vdWhy(){
  const {sorted, top} = vdRank();
  if(!sorted.some(x => x.done)) return `<p>Score each vendor on all ${CRITERIA.length} criteria to see who comes out ahead, and why.</p>`;
  if(!top) return `<p>No vendor meets the minimums on wellness and security. Go back to your shortlist, or ask the weakest vendors what it would take to fix those gaps.</p>`;
  const other = sorted.find(x => x !== top && x.done), tw = vdTotal() || 1;
  const pending = sorted.filter(x => !x.done);
  if(!other) return pending.length ? `<p><b>${esc(top.v.name)}</b> scores ${top.score.toFixed(2)} out of 5. Finish scoring ${pending.map(x => `<b>${esc(x.v.name)}</b>`).join(" and ")} to compare.</p>` : `<p><b>${esc(top.v.name)}</b> is your only vendor.</p>`;
  const diffs = CRITERIA.map(c => ({c, d:(+vx.weights[c.k] || 0) / tw * (top.v.s[c.k] - other.v.s[c.k]), raw:top.v.s[c.k] - other.v.s[c.k]})).filter(x => x.raw !== 0).sort((a, b) => b.d - a.d);
  const plus = diffs.filter(x => x.d > 0).slice(0, 2), minus = diffs.filter(x => x.d < 0).slice(-1);
  const list = xs => xs.map(x => `${x.c.n.toLowerCase()} (${x.raw > 0 ? "+" : ""}${x.raw})`).join(" and ");
  return `<p><b>${esc(top.v.name)}</b> ranks first with ${top.score.toFixed(2)} out of 5${other.flags.length ? `, and <b>${esc(other.v.name)}</b> is ruled out on ${other.flags.map(f => f.n.toLowerCase()).join(" and ")}` : `, ahead of <b>${esc(other.v.name)}</b> at ${other.score.toFixed(2)}`}.</p>
    ${plus.length ? `<p>It wins mainly on ${list(plus)}${minus.length ? `, while ${esc(other.v.name)} is stronger on ${list(minus.map(x => ({c:x.c, raw:-x.raw})))}` : ""}. If those weights change, check whether the ranking does.</p>` : ""}`;
}
function vdResultHTML(){
  return `<div class="card vd-why">${vdWhy()}</div>
    <div class="card vd-heat"><table><thead><tr><th>Criterion</th>${vx.vendors.map(v => `<th>${esc(v.name.split(" (")[0])}</th>`).join("")}</tr></thead>
    <tbody>${CRITERIA.map(c => `<tr><td>${esc(c.n)}${c.deal ? ` <span class="vd-min">min 3</span>` : ""}</td>${vx.vendors.map(v => `<td><span class="vd-cell ${VD_HEAT[v.s[c.k]] || "none"} ${c.deal && v.s[c.k] && v.s[c.k] <= 2 ? "fail" : ""}">${v.s[c.k] || "–"}</span></td>`).join("")}</tr>`).join("")}</tbody></table>
    <p class="note">Darker green is stronger. A red outline marks a score that fails a minimum.</p></div>`;
}
function vdWeightsBar(){
  const tw = vdTotal() || 1;
  return CRITERIA.map((c, j) => `<i class="vd-wseg s${j}" style="width:${(+vx.weights[c.k] || 0) / tw * 100}%" title="${esc(c.n)}: ${vx.weights[c.k]}"></i>`).join("");
}

function renderVendors(){
  const seen = new Set();
  const step = n => `<div class="mxa-ph"><span class="mxa-pnum">${n}</span><div><h3>${VD_STEPS[n - 1][0]}</h3><p>${VD_STEPS[n - 1][1]}</p></div></div>`;
  view.innerHTML = head("Vendor Scorecard",
    "Choose a content moderation vendor on evidence rather than on the sales pitch. Weight what matters, score your shortlist against a clear rubric, and see who wins and why.",
    "Run the program", `<span class="toast" id="vx-toast" aria-live="polite"></span><button class="btn sm" id="vx-own">Start your own</button><button class="btn sm" id="vx-reset">See the example</button><button class="btn sm primary" id="vx-save"><svg><use href="#i-save"/></svg>${wsSaveLabel("vendors", vx)}</button>`) + `
    <p class="mxa-q vd-q">Which moderation vendor should you trust with your users and your reviewers?</p>
    <div class="mxm-how"><ol class="mxm-how-s">${VD_STEPS.map((s, j) => `<li><b>${j + 1}</b><span><em>${s[0]}.</em> ${s[1]}</span></li>`).join("")}</ol></div>
    <div class="vd-grid">
      <div class="vd-main">
        <section class="mxa-part">${step(1)}
          <div class="card vd-weights">
            <div class="vd-presets"><span class="note">Start from your priorities</span><div class="vd-pre" role="group" aria-label="Weight presets">${VD_PRESETS.map(([k, n]) => `<button type="button" class="pol-chip" data-vpre="${k}" aria-pressed="${vdPresetOn() === k}">${n}</button>`).join("")}${typeof loopVendorChip === "function" ? loopVendorChip() : ""}</div>${typeof loopVendorNote === "function" ? loopVendorNote() : ""}</div>
            <div class="vd-wbar" id="vd-wbar">${vdWeightsBar()}</div>
            ${CRITERIA.map((c, j) => `<label class="vd-wrow"><span class="vd-wn"><i class="vd-wdot s${j}"></i>${esc(c.n)}${c.deal ? ` <span class="vd-min">min 3</span>` : ""}</span>
              <input type="range" min="0" max="50" step="5" value="${+vx.weights[c.k] || 0}" data-wk="${c.k}" aria-label="${esc(c.n)} weight">
              <span class="vd-wv mono" id="vd-wv-${c.k}">${+vx.weights[c.k] || 0}</span></label>`).join("")}
          </div>
        </section>
        <section class="mxa-part">${step(2)}
          <div class="card vd-names"><span class="note">Your shortlist · ${vx.vendors.length} of ${VD_MAX}</span>${vx.vendors.map((v, i) => `<span class="vd-nm"><input class="input vname" data-i="${i}" value="${esc(v.name)}" aria-label="Vendor ${i + 1} name" maxlength="40">${vx.vendors.length > VD_MIN ? `<button type="button" class="vd-x" data-vdel="${i}" aria-label="Remove ${esc(v.name)}">${icon("x")}</button>` : ""}</span>`).join("")}
            ${vx.vendors.length < VD_MAX ? `<button type="button" class="btn sm" id="vx-add">${icon("plus")}Add a vendor</button>` : ""}</div>
          ${CRITERIA.map(c => `<article class="card vd-crit">
            <div class="vd-ch"><h4>${esc(c.n)}</h4>${c.deal ? `<span class="pill crit">Minimum 3</span>` : ""}<span class="vd-cw">Weight <b id="vd-cw-${c.k}">${+vx.weights[c.k] || 0}</b></span></div>
            <p class="vd-cq">${esc(VD_Q[c.k])}</p>
            <div class="vd-rub">${[1, 3, 5].map((n, j) => `<div><b class="vd-cell ${VD_HEAT[n]}">${n}</b><span>${mxGloss(VD_RUBRIC[c.k][j], seen)}</span></div>`).join("")}</div>
            <div class="vd-sc">${vx.vendors.map((v, i) => `<div class="vd-row"><span class="vd-vn">${esc(v.name)}</span>
              <div class="vd-seg" role="radiogroup" aria-label="${esc(v.name)}: ${esc(c.n)}">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="${v.s[c.k] === n}" class="${v.s[c.k] === n ? "on" : ""} ${c.deal && n <= 2 ? "lo" : ""}" data-i="${i}" data-k="${c.k}" data-n="${n}">${n}</button>`).join("")}</div></div>`).join("")}</div>
            <details class="vd-rfp"><summary>Questions to ask in your RFP <span class="note">${c.q.length}</span></summary><ul>${c.q.map(q => `<li>${mxGloss(q, seen)}</li>`).join("")}</ul></details>
          </article>`).join("")}
        </section>
        <section class="mxa-part">${step(3)}<div id="vd-result">${vdResultHTML()}</div></section>
      </div>
      <aside class="vd-rail"><div class="card vd-railc" id="vd-rail">${vdRailHTML()}</div></aside>
    </div>
    <p class="note" style="margin-top:18px">Compare any two to four vendors: specialists, outsourcing firms, regional teams or tools. Rename them and score your own shortlist.</p>`;

  const save = () => store.set("vx", vx);
  const refresh = () => { $("#vd-rail").innerHTML = vdRailHTML(); $("#vd-result").innerHTML = vdResultHTML(); const nb = $("#vx-norm"); if(nb) nb.onclick = () => { vdNormalize(); save(); renderVendors(); }; };
  view.querySelectorAll("input.vname").forEach(inp => inp.onchange = e => { vx.vendors[+e.target.dataset.i].name = e.target.value.trim() || "Vendor"; save(); renderVendors(); });
  view.querySelectorAll("[data-wk]").forEach(r => r.oninput = () => {
    vx.weights[r.dataset.wk] = +r.value; save();
    $("#vd-wv-" + r.dataset.wk).textContent = r.value; const cw = $("#vd-cw-" + r.dataset.wk); if(cw) cw.textContent = r.value;
    $("#vd-wbar").innerHTML = vdWeightsBar(); refresh();
  });
  view.querySelectorAll(".vd-seg button").forEach(b => b.onclick = () => {
    const i = +b.dataset.i, k = b.dataset.k; vx.vendors[i].s[k] = +b.dataset.n; save();
    b.parentNode.querySelectorAll("button").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
    refresh();
  });
  view.querySelectorAll(".vd-seg").forEach(g => g.onkeydown = e => {
    if(!["ArrowLeft", "ArrowRight"].includes(e.key)) return; e.preventDefault();
    const bs = [...g.querySelectorAll("button")], cur = bs.findIndex(x => x.classList.contains("on")), nx = bs[cur < 0 ? (e.key === "ArrowRight" ? 0 : 4) : Math.max(0, Math.min(4, cur + (e.key === "ArrowRight" ? 1 : -1)))];
    nx.click(); nx.focus();
  });
  view.querySelectorAll(".gl").forEach(g => g.onclick = () => g.focus());
  $("#vx-reset").onclick = () => { vx = JSON.parse(JSON.stringify(DEFAULT_V)); store.set("ws:cur:vendors", null); save(); renderVendors(); gsay("Example loaded: three vendors, already scored"); };
  $("#vx-own").onclick = () => { vx = {weights:JSON.parse(JSON.stringify(DEFAULT_V.weights)), vendors:[vdBlank("Vendor A"), vdBlank("Vendor B")], open:null}; store.set("ws:cur:vendors", null); save(); renderVendors(); const f = view.querySelector("input.vname"); if(f){ f.focus(); f.select(); } };
  const add = $("#vx-add"); if(add) add.onclick = () => { vx.vendors.push(vdBlank("Vendor " + "ABCD"[vx.vendors.length])); save(); renderVendors(); const ins = view.querySelectorAll("input.vname"); const f = ins[ins.length - 1]; if(f){ f.focus(); f.select(); } };
  view.querySelectorAll("[data-vdel]").forEach(b => b.onclick = () => { const i = +b.dataset.vdel, n = vx.vendors[i].name; vx.vendors.splice(i, 1); save(); renderVendors(); gsay(n + " removed"); });
  view.querySelectorAll("[data-vpre]").forEach(b => b.onclick = () => { const p = VD_PRESETS.find(x => x[0] === b.dataset.vpre); vx.weights = Object.assign({}, p[2]); save(); renderVendors(); const f = view.querySelector(`[data-vpre="${p[0]}"]`); if(f) f.focus(); });
  const nm = $("#vx-norm"); if(nm) nm.onclick = () => { vdNormalize(); save(); renderVendors(); };
  $("#vx-save").onclick = () => { const msg = wsSaveTool("vendors", vx, vendorsTitle(vx)); renderVendors(); flashIn($("#vx-toast"), msg); };
}
