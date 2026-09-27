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
function radarChart(r){
  const n = RADAR_GROUPS.length, cx = 180, cy = 125, R = 88;
  const ang = i => (-90 + i*360/n) * Math.PI/180;
  const pt = (i, rad) => [cx + rad*Math.cos(ang(i)), cy + rad*Math.sin(ang(i))];
  // r.risks is sorted by score, so the first matching risk is the group's worst
  const data = RADAR_GROUPS.map(g => { const rs = r.risks.filter(x=>g.cats.includes(x.cat)); const worst = rs[0];
    return {g, n:rs.length, score: worst ? worst.score : 0, band: worst ? worst.band : null, worst: worst ? worst.n : ""}; });
  const f = v => v.toFixed(1);
  const poly = data.map((d,i)=>pt(i, R*d.score/16).map(f).join(",")).join(" ");
  const zones = [[16,"var(--crit-soft)"],[12,"var(--high-soft)"],[8,"var(--med-soft)"],[4,"var(--surface)"]]
    .map(([v,c])=>`<circle cx="${cx}" cy="${cy}" r="${f(R*v/16)}" fill="${c}" stroke="var(--line)" stroke-width="1"/>`).join("");
  const spokes = data.map((d,i)=>{ const [x,y]=pt(i,R); return `<line x1="${cx}" y1="${cy}" x2="${f(x)}" y2="${f(y)}" stroke="var(--line)" stroke-width="1"/>`; }).join("");
  const ringLabels = [[4,"Medium"],[8,"High"],[12,"Critical"]].map(([v,t])=>`<text x="${cx+4}" y="${f(cy - R*v/16 - 3)}" font-size="8" fill="var(--faint)">${t}</text>`).join("");
  const labels = data.map((d,i)=>{ const [x,y]=pt(i,R+13), c=Math.cos(ang(i)), s=Math.sin(ang(i)), lines=d.g.l, extra=lines.length-1;
    const anchor = c>0.25?"start":c<-0.25?"end":"middle";
    const dy0 = s<-0.6 ? `${-0.2-1.1*extra}em` : s>0.6 ? "0.9em" : `${0.35-0.55*extra}em`;
    return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-size="9.5" fill="${d.score?"var(--ink)":"var(--faint)"}" font-weight="${d.band==="crit"?600:400}">${lines.map((t,j)=>`<tspan x="${f(x)}" dy="${j?"1.1em":dy0}">${esc(t)}</tspan>`).join("")}</text>`; }).join("");
  const points = data.map((d,i)=>{ const [x,y]=pt(i, R*d.score/16);
    const fill = d.band ? `var(--${d.band==="low"?"muted":d.band})` : "var(--line-strong)";
    const inc = d.g.cats.length>1 ? d.g.cats.map(k=>CATS[k]).join(", ") : "";
    return `<g class="rpt" tabindex="0" data-a="${esc(d.g.n)}" data-i="${esc(inc)}" data-b="${d.band?BANDS[d.band][0]:"No risks"}" data-s="${d.score}" data-w="${esc(d.worst)}" data-n="${d.n}">
      <circle cx="${f(x)}" cy="${f(y)}" r="12" fill="transparent"/>
      <circle cx="${f(x)}" cy="${f(y)}" r="${d.band?4.5:3}" fill="${fill}" stroke="var(--surface)" stroke-width="2"/></g>`; }).join("");
  const top = data.filter(d=>d.score).sort((a,b)=>b.score-a.score).slice(0,3).map(d=>`${d.g.n} (${BANDS[d.band][0].toLowerCase()})`).join(", ");
  return `<div class="radarwrap">
    <svg class="radar" viewBox="0 0 360 250" role="img" aria-label="Risk radar by harm group. Highest: ${esc(top||"none")}.">
      ${zones}${spokes}${ringLabels}
      <polygon points="${poly}" fill="var(--accent)" fill-opacity=".18" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
      ${points}${labels}
    </svg>
    <div class="rtip" hidden></div>
    <p class="note radarcap">Each point is the highest-rated risk in that group of harm areas. The further out, the more urgent.</p>
    <ul class="visually-hidden">${data.map(d=>`<li>${esc(d.g.n)}: ${d.score?`${BANDS[d.band][0]}, score ${d.score} of 16, ${d.n} risk${d.n===1?"":"s"}`:"no risks"}</li>`).join("")}</ul>
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
