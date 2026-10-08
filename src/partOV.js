/* =========================================================
   OVERVIEW: your safety picture in three radars
   Program maturity · all products combined · one product at a time
   ========================================================= */
const OV_LAYER = ["var(--t-tt)", "var(--t-mx)", "var(--t-vd)", "var(--t-ma)", "var(--t-pol)", "var(--high)"];
// Saved pre-mortems with their assessment, newest first
function ovSavedPMs(){
  return Object.values(wsItems()).filter(it => it.kind === "premortem" && it.data).sort((a, b) => (b.updated || 0) - (a.updated || 0))
    .map(it => { const r = assess(openRecord(it.data)); return {it, r, g:pmGroupData(r), name:it.title || it.data.name || "Untitled assessment"}; });
}
// Small radar for lists: just the shape
function miniRiskRadar(r){
  const g = pmGroupData(r), n = g.length, c = 28, R = 24, f = v => v.toFixed(1), pt = (i, v) => { const a = (-90 + i * 360 / n) * Math.PI / 180; return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v]; };
  const ring = v => g.map((d, i) => pt(i, v).map(f).join(",")).join(" "), worst = g.reduce((m, d) => d.score > m.score ? d : m, {score:0, band:null});
  const col = worst.band ? `var(--${worst.band === "low" ? "muted" : worst.band})` : "var(--faint)";
  return `<svg class="mini-radar" viewBox="0 0 56 56" aria-hidden="true"><polygon points="${ring(1)}" fill="var(--surface)" stroke="var(--line-strong)"/><polygon points="${ring(.5)}" fill="none" stroke="var(--line)"/>
    <polygon points="${g.map((d, i) => pt(i, d.score / 16).map(f).join(",")).join(" ")}" fill="${col}" fill-opacity=".18" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

function bindOverviewPicture(){
  view.querySelectorAll("[data-rc=download]").forEach(b => b.onclick = () => { const md = rcMarkdown(); offerFile(`ts-report-card-${new Date().toISOString().slice(0, 10)}.md`, md, md, null).then(r => { if(r === "saved") gsay("Report card downloaded"); else if(r === "copied") gsay("Report card copied to your clipboard"); }); });
  const sel = document.getElementById("ov-pm-sel");
  if(sel) sel.onchange = () => { store.set("ov:pm", sel.value); renderOverview(); const s = document.getElementById("ov-pm-sel"); if(s) s.focus(); };
  view.querySelectorAll("[data-ov-ma]").forEach(a => a.onclick = () => {
    if(a.dataset.ovMa === "example"){ ma = maExample(); store.set("ws:cur:maturity", null); }
    else if(ma.ex){ ma = maInit({stage:ma.stage, lv:{}, done:{}, ex:false, open:"policy"}); }
    store.set("ma", ma);
  });
}

/* ---------- Pre-mortem landing: the current assessment up front ---------- */
function pmCurrentHero(){
  if(!pm.type) return "";
  const r = assess(pm); if(!r.risks.length) return "";
  const laws = r.obligations.filter(o => o.status === "applies").length, bl = r.safeguards.filter(s => s.rank === 3), bd = bl.filter(s => pm.done[s.id]).length;
  const tone = r.posture[1] ? `var(--${r.posture[1]})` : "var(--faint)";
  return `<section class="ov-hero pm-cur" aria-label="Current assessment">
    <div class="ov-hl">
      <div class="ov-eb"><span class="sb-glyph" style="background:var(--t-pm)"><svg><use href="#i-radar"/></svg></span>${pm.example ? "Example assessment" : "Pick up where you left off"}${pm.updated ? (relTime(pm.updated) === "now" ? " · updated just now" : " · updated " + relTime(pm.updated) + " ago") : ""}</div>
      <h2>${esc(pm.name || "Untitled assessment")}</h2>
      <div class="ov-chips">
        <span class="ov-status" style="color:${tone};border-color:color-mix(in oklab, ${tone} 35%, transparent)"><span class="sdot" style="background:${tone}"></span>${r.posture[0]} exposure</span>
        ${pm.regions.length ? `<span class="ov-status">${pm.regions.map(k => k.toUpperCase()).join(" · ")}</span>` : ""}
        ${pm.youth ? `<span class="ov-status">${esc(labelOf(YOUTH, pm.youth))}</span>` : ""}
      </div>
      <p class="note ov-stats-sum">${r.risks.length} risk${r.risks.length === 1 ? "" : "s"} logged, <strong style="${r.counts.crit ? "color:var(--crit)" : ""}">${r.counts.crit} critical</strong>. ${bd} of ${bl.length} launch blockers done, and ${laws} law${laws === 1 ? "" : "s"} likely apply.</p>
      <div>${r.risks.slice(0, 3).map(x => `<div class="ov-risk"><span class="sdot" style="background:var(--${x.band === "low" ? "faint" : x.band})"></span>${esc(x.n)}<span class="mono">${x.score}/16</span></div>`).join("")}</div>
      <div class="row" style="gap:8px"><button type="button" class="btn primary" data-act="report">Open report ${icon("arrow")}</button><button type="button" class="btn" data-act="plan">Launch plan</button><button type="button" class="btn ghost" data-act="new">Start a new one</button></div>
    </div>
    <div class="ov-hr">${radarChart(r)}</div>
  </section>`;
}
