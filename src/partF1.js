/* =========================================================
   ABUSE PRE-MORTEM: ENGINE
   ========================================================= */
const BANDS = {crit:["Critical","crit",3], high:["High","high",2], med:["Medium","med",1], low:["Low","",0]};
const SEVL = ["","Limited","Serious","Severe","Critical"];
const LIKL = ["","Rare","Possible","Likely","Expected"];
const bandOf = score => score>=12 ? "crit" : score>=8 ? "high" : score>=4 ? "med" : "low";
const TIERS = [
  {r:3, n:"Launch blockers", h:"Don't ship without these", pill:"crit"},
  {r:2, n:"Before launch", h:"Strongly recommended for day one", pill:"high"},
  {r:1, n:"Within 90 days", h:"Plan these into the roadmap", pill:"med"},
  {r:0, n:"Backlog", h:"Revisit as you grow", pill:""}
];
const labelOf = (list, k) => (list.find(x=>x.k===k)||{}).n || k;

function ctx(p){
  const c = {p};
  c.F = k => p.features.includes(k);
  c.M = k => p.money.includes(k);
  c.A = k => p.aud.includes(k);
  c.R = k => p.regions.includes(k);
  c.T = (...ks) => ks.includes(p.type);
  c.kids = p.youth==="kids";
  c.youth = p.youth==="kids" || p.youth==="teens";
  c.minors = p.youth!=="adult_verified";
  c.strangers = p.contact==="strangers";
  c.limited = p.contact==="limited";
  c.noContact = p.contact==="none";
  c.guest = c.F("guest");
  c.anon = p.identity==="anon" || p.identity==="pseudo" || c.guest;
  c.verified = p.identity==="verified" && !c.guest;
  c.moneyMoves = c.M("p2p")||c.M("payouts")||c.M("crypto")||c.M("wallet");
  c.hostsMedia = c.F("media")||c.F("files")||c.F("live");
  c.realtime = c.F("voice")||c.F("live");
  c.comms = c.F("dm")||c.F("groups")||c.F("voice")||c.F("live");
  c.ugc = ["posts","media","live","groups","dm","files","voice","listings","reviews","ai_gen","profiles"].some(k=>c.F(k));
  c.big = p.scale==="large";
  c.mid = p.scale==="mid"||p.scale==="large";
  c.small = p.scale==="prelaunch"||p.scale==="small";
  c.adult = p.adult!=="none";
  c.explicit = p.adult==="explicit";
  c.biz = c.A("business")||c.T("workplace");
  return c;
}

function assess(p){
  const c = ctx(p);
  const risks = [];
  HARMS.forEach(h => {
    if(!h.req(c)) return;
    const drivers = (h.drv ? h.drv(c) : []).filter(x=>x[0]);
    const reducers = (h.red ? h.red(c) : []).filter(x=>x[0]);
    const ups = (h.up ? h.up(c) : []).filter(x=>x[0]);
    const lik = Math.max(1, Math.min(4, h.base + drivers.reduce((a,x)=>a+x[1],0) - reducers.reduce((a,x)=>a+x[1],0)));
    const sev = Math.min(4, h.sev + (ups.length ? 1 : 0));
    const score = sev*lik;
    const sgs = [...new Set(h.sg(c).filter(Boolean))];
    risks.push({id:h.id, cat:h.cat, n:h.n, d:h.d, sev, lik, score, band:bandOf(score), drivers, reducers, ups, sgs});
  });
  risks.sort((a,b)=>b.score-a.score || b.sev-a.sev);

  const obligations = OBL.map(o => ({...o, status:o.st(c)})).filter(o => o.status && c.R(o.r));

  const map = {};
  const add = id => map[id] || (map[id] = {id, ...SG[id], rank:0, covers:[], critCovers:0, legal:null});
  // The first three safeguards listed for a harm are its core controls and take the risk's full priority;
  // supporting controls sit one tier lower.
  risks.forEach(r => r.sgs.forEach((id, i) => { const s = add(id); s.rank = Math.max(s.rank, Math.max(0, BANDS[r.band][2] - (i < 3 ? 0 : 1))); s.covers.push(r.n); if(r.band==="crit") s.critCovers++; }));
  obligations.forEach(o => o.sg.forEach(id => {
    const s = add(id);
    if(o.status==="applies"){ s.legal = "applies"; if(o.bump!==false) s.rank = 3; }
    else if(!s.legal) s.legal = "may";
    s.laws = (s.laws||[]).concat(o.law);
  }));
  const safeguards = Object.values(map).sort((a,b)=>b.rank-a.rank || b.covers.length-a.covers.length);

  const counts = {crit:0,high:0,med:0,low:0}; risks.forEach(r=>counts[r.band]++);
  const posture = counts.crit>=4 ? ["Severe","crit"] : (counts.crit>=1||counts.high>=5) ? ["High","high"] : counts.high>=1 ? ["Moderate","med"] : risks.length ? ["Low","good"] : ["Not assessed",""];
  const decisions = (DECISIONS[p.type]||[]).map((q,i)=>({id:p.type+"-"+i, q, src:labelOf(PLATFORMS,p.type)}))
    .concat(derivedDecisions(c).map((q,i)=>({id:"d-"+q.slice(0,24), q, src:"Your profile"})));
  return {c, risks, obligations, safeguards, counts, posture, decisions};
}

/* ---------- state ---------- */
const blankPM = () => ({name:"", type:"", youth:"", aud:[], adult:"none", identity:"", contact:"", money:[], regions:[], scale:"", team:"", features:[], done:{}, notes:{}, stage:"ask", qi:0, answered:{}, impact:null, tab:"plan", group:"tier", filter:{cell:"",cat:"",band:""}, example:false});
function fromPreset(k){ const p = Object.assign(blankPM(), JSON.parse(JSON.stringify(PRESETS[k])), {example:true, stage:"report"}); QS.forEach(q=>p.answered[q.k]=true); return p; }
/* pm state is initialized in the wizard section, after QS is defined */
