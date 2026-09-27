/* ---------- Overview: risk radar for the current assessment ---------- */
// The radar groups the 14 harm areas into 9 spokes so it reads at a glance.
// Everywhere else in the tool keeps all 14 areas. Order places long labels where they have room.
const RADAR_GROUPS = [
  {n:"Child safety", l:["Child safety"], cats:["child"]},
  {n:"Sexual harm", l:["Sexual harm"], cats:["sexual"]},
  {n:"Harassment & hate", l:["Harassment &","hate"], cats:["harass"]},
  {n:"Violence & self-harm", l:["Violence &","self-harm"], cats:["violent","selfharm"]},
  {n:"Readiness", l:["Readiness"], cats:["readiness"]},
  {n:"AI misuse", l:["AI misuse"], cats:["ai"]},
  {n:"Privacy & physical safety", l:["Privacy &","physical safety"], cats:["privacy","physical"]},
  {n:"Platform abuse", l:["Platform","abuse"], cats:["integrity","security","illegal"]},
  {n:"Fraud & financial crime", l:["Fraud &","financial crime"], cats:["fraud","fincrime"]}
];
// Worst risk in each radar group for one assessment
function pmGroupData(r){
  return RADAR_GROUPS.map(g => { const rs = r.risks.filter(x => g.cats.includes(x.cat)).sort((a, b) => b.score - a.score), w = rs[0];
    return {g, score:w ? w.score : 0, band:w ? w.band : null, worst:w ? w.n : "", n:rs.length}; });
}
// The risk radar, drawn like the maturity radar: polygon rings, the same size and labels.
// layers: [{g, color, fill, dash}]; the filled layer is the main shape and sets the dots and label colors.
// Rings mark 4, 8, 12 and 16 out of 16; the dashed red ring is where risks turn critical.
function riskRadarSVG(layers, label, opts){
  const o = opts || {}, n = RADAR_GROUPS.length, W = 400, H = o.big ? 330 : 300, cx = W / 2, cy = H / 2, R = o.big ? 104 : 96, f = v => v.toFixed(1);
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = (i, s) => [cx + Math.cos(ang(i)) * R * s / 16, cy + Math.sin(ang(i)) * R * s / 16];
  const poly = vals => vals.map((v, i) => pt(i, v).map(f).join(",")).join(" ");
  const rings = [4, 8, 12, 16].map(v => `<polygon points="${poly(RADAR_GROUPS.map(() => v))}" fill="${v === 16 ? "var(--sunk)" : "none"}" fill-opacity="${v === 16 ? .5 : 0}" stroke="var(--line${v === 16 ? "-strong" : ""})" stroke-width="1"/>`).join("")
    + `<polygon points="${poly(RADAR_GROUPS.map(() => 12))}" fill="none" stroke="var(--crit)" stroke-opacity=".4" stroke-width="1" stroke-dasharray="2 3"/>`;
  const axes = RADAR_GROUPS.map((g, i) => { const [x, y] = pt(i, 16); return `<line x1="${cx}" y1="${cy}" x2="${f(x)}" y2="${f(y)}" stroke="var(--line)" stroke-width="1"/>`; }).join("");
  const main = layers.find(l => l.fill) || layers[0];
  const labels = RADAR_GROUPS.map((g, i) => { const [x, y] = pt(i, 16 * (o.big ? 1.25 : 1.22)), c = Math.cos(ang(i)), s = Math.sin(ang(i)), extra = g.l.length - 1, d = main ? main.g[i] : null;
    const anchor = c > .3 ? "start" : c < -.3 ? "end" : "middle", dy0 = s < -.6 ? `${-.2 - 1.1 * extra}em` : s > .6 ? ".9em" : `${.35 - .55 * extra}em`;
    return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" class="ma-rl ${d && d.band === "crit" ? "crit" : d && d.score ? "" : "none"}">${g.l.map((t, j) => `<tspan x="${f(x)}" dy="${j ? "1.1em" : dy0}">${esc(t)}</tspan>`).join("")}</text>`; }).join("");
  const shapes = layers.map(l => { const pts = poly(l.g.map(d => d.score));
    return l.fill ? `<polygon class="rk-shape" points="${pts}" fill="${l.color}" fill-opacity=".2" stroke="${l.color}" stroke-width="2" stroke-linejoin="round"/>`
                  : `<polygon points="${pts}" fill="none" stroke="${l.color}" stroke-width="1.4" stroke-opacity=".85" stroke-linejoin="round" stroke-dasharray="${l.dash || ""}"/>`; }).join("");
  const dots = main ? main.g.map((d, i) => { const [x, y] = pt(i, d.score), fill = d.band ? `var(--${d.band === "low" ? "muted" : d.band})` : "var(--line-strong)";
    if(!d.score && !o.interactive) return "";
    const dot = `<circle cx="${f(x)}" cy="${f(y)}" r="${d.band ? (o.big ? 4.5 : 4) : 3}" fill="${fill}" stroke="var(--surface)" stroke-width="2"/>`;
    if(!o.interactive) return dot;
    const inc = d.g.cats.length > 1 ? d.g.cats.map(k => CATS[k]).join(", ") : "";
    return `<g class="rpt" tabindex="0" data-a="${esc(d.g.n)}" data-i="${esc(inc)}" data-b="${d.band ? BANDS[d.band][0] : "No risks"}" data-s="${d.score}" data-w="${esc(d.worst)}" data-n="${d.n}"><circle cx="${f(x)}" cy="${f(y)}" r="12" fill="transparent"/>${dot}</g>`; }).join("") : "";
  return `<svg class="ma-radar rk-radar ${o.big ? "big" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${rings}${axes}${shapes}${dots}${labels}</svg>`;
}
// Pre-mortem radar with hover and focus details for each point
function radarChart(r){
  const data = pmGroupData(r), top = data.filter(d => d.score).sort((a, b) => b.score - a.score).slice(0, 3).map(d => `${d.g.n} (${BANDS[d.band][0].toLowerCase()})`).join(", ");
  return `<div class="radarwrap">${riskRadarSVG([{g:data, color:"var(--accent)", fill:true}], "Risk radar by harm group. Highest: " + (top || "none") + ".", {interactive:true, big:true})}
    <div class="rtip" hidden></div>
    <p class="note radarcap">Each point is the highest-rated risk in that group of harm areas. The dashed red ring marks critical.</p>
    <ul class="visually-hidden">${data.map(d => `<li>${esc(d.g.n)}: ${d.score ? `${BANDS[d.band][0]}, score ${d.score} of 16, ${d.n} risk${d.n === 1 ? "" : "s"}` : "no risks"}</li>`).join("")}</ul>
  </div>`;
}
function bindRadar(){
  const wrap = $(".radarwrap"); if(!wrap) return;
  const tipEl = wrap.querySelector(".rtip");
  const line = (text, cls) => { const s = document.createElement("span"); s.textContent = text; if(cls) s.className = cls; tipEl.appendChild(s); };
  const show = g => {
    tipEl.textContent = "";
    const b = document.createElement("b"); b.textContent = g.dataset.a; tipEl.appendChild(b);
    line(+g.dataset.s ? `${g.dataset.b} · score ${g.dataset.s} of 16 · ${g.dataset.n} risk${g.dataset.n==="1"?"":"s"}` : "No risks in this group");
    if(g.dataset.w) line("Worst: " + g.dataset.w);
    if(g.dataset.i) line("Includes: " + g.dataset.i, "rtip-inc");
    const wr = wrap.getBoundingClientRect(), gr = g.getBoundingClientRect();
    tipEl.style.left = (gr.left - wr.left + gr.width/2) + "px"; tipEl.style.top = (gr.top - wr.top) + "px"; tipEl.hidden = false;
  };
  wrap.querySelectorAll(".rpt").forEach(g => {
    g.addEventListener("mouseenter", () => show(g)); g.addEventListener("focus", () => show(g));
    g.addEventListener("mouseleave", () => { tipEl.hidden = true; }); g.addEventListener("blur", () => { tipEl.hidden = true; });
  });
}
