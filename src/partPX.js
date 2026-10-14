/* =========================================================
   INCIDENT POST-MORTEM: after a real incident, a blameless review a founder or safety lead can write in
   fifteen minutes. Sixteen steps (fifteen required) become a one-page document in the handbook's chapter 13
   shape, a grade for the response (never the incident), and three actions with an owner and a date each.
   Follows the post-incident review in chapter 13 of the T&S Handbook. Roles, never names. A record for the
   team and a starting point for Legal, not legal advice. Spec: tools/POSTMORTEM-SPEC.md.
   ========================================================= */
const PX_TO = [["users", "Users"], ["affected", "The people affected"], ["press", "Press"], ["regulator", "A regulator"], ["partners", "Partners or sellers"], ["leadership", "Leadership"], ["team", "The team"]];
const PX_OWNERS = Object.entries(OWNERS).map(([k, n]) => [k, n]).concat([["comms", "Comms"], ["lead", "Incident lead"], ["exec", "Executive sponsor"]]);
const PX_OWNER_TEAM = {product:"Product team", eng:"Engineering team", ops:"T&S Ops team", policy:"Policy team", legal:"Legal team", comms:"Comms team", lead:"incident lead", exec:"executive sponsor"};
const PX_AREAS = ["harass", "child", "sexual", "fraud", "fincrime", "security", "violent", "selfharm", "privacy", "physical", "integrity", "illegal", "ai", "readiness"];
// [key, name, hint]
const PX_WHO = [
  ["users", "People using the product", ""],
  ["one", "One person or account, targeted", "A creator, a streamer, a seller: someone named or singled out"],
  ["minors", "Children or teens", "Under-18s among the people affected"],
  ["staff", "Our own team or reviewers", "Exposure to harmful material, threats, overload"],
  ["partners", "Partners, advertisers or sellers", ""],
  ["public", "People outside the product", "A school, a family, the public, another platform"]
];
// [key, name, hint, words in the verdict sentence, words in the document, short form for Impact]
const PX_REACH = [
  ["few", "Fewer than 10", "", "fewer than ten people reached", "fewer than ten people", "Fewer than ten people"],
  ["hundreds", "Tens to hundreds", "", "tens to hundreds of people reached", "tens to hundreds of people", "Tens to hundreds of people"],
  ["thousands", "Thousands", "", "thousands of people reached", "thousands of people", "Thousands of people"],
  ["many", "Tens of thousands or more", "", "tens of thousands of people reached", "tens of thousands of people", "Tens of thousands of people or more"],
  ["unknown", "We don't know yet", "Honest. The document will say so and an action will find out.", "reach not yet known", "a number of people we do not yet know", "Not yet known"]
];
// [key, name, hint, points, words]
const PX_DETECT = [
  ["alert", "An alert or a rate monitor fired", "", 20, "by an alert"],
  ["staff", "Someone on the team noticed", "", 16, "by the team"],
  ["reports", "User reports", "A spike in the queue, or one report that stood out", 12, "through user reports"],
  ["victim", "The person affected contacted us", "", 10, "when the person affected contacted you"],
  ["press", "A journalist, a partner or a regulator told us", "", 4, "from outside, by press, a partner or a regulator"],
  ["public", "Users were posting about it before we knew", "", 2, "after users were already posting about it"]
];
const PX_WORKED = [
  ["lever", "A lever we could pull in minutes", "Search, hashtags, rate limits, a feature switched off in that one place"],
  ["oncall", "The on-call phone rang and someone picked up", ""],
  ["lead", "One person led and everyone knew it", ""],
  ["scribe", "Someone kept the timeline as it happened", ""],
  ["preserve", "We kept the evidence before anything was deleted", ""],
  ["holding", "A holding statement went out quickly", ""],
  ["queues", "The highest-severity queues stayed staffed", ""],
  ["partner", "Another platform or a partner helped", ""]
];
const PX_LAYERS = [
  ["prevention", "Prevention", "What failed in prevention?", [
    ["no_rule", "No rule or default covered it", ""],
    ["unapplied", "A rule existed and wasn't applied", ""],
    ["new_accounts", "New accounts could do too much, too soon", ""],
    ["feature", "A feature made it easy", "Sharing, discovery, recommendations, a hashtag"],
    ["known", "We knew the risk and hadn't built the safeguard", "It was in a pre-mortem or a risk assessment"]]],
  ["detection", "Detection", "What failed in detection?", [
    ["no_alert", "No alert fires for this kind of harm", ""],
    ["late_alert", "The alert fired late, or at the wrong threshold", ""],
    ["queue", "Reports came in and sat in a queue", ""],
    ["volume", "We watched volume, not rate", "A category's rate climbed while volume looked normal"],
    ["outside", "We learned of it from outside", "Press, a partner, a regulator, or users posting about it"]]],
  ["response", "Response", "What failed in the response?", [
    ["no_lead", "Nobody was in charge for the first hour", ""],
    ["late", "Declared late, so hours passed before anyone led", ""],
    ["no_lever", "No lever to pull quickly", "Containment needed an engineer and a deploy"],
    ["over", "We over-removed and had to walk it back", "News reports and warnings went too"],
    ["queues", "We pulled people off the highest-severity queues", ""],
    ["evidence", "Evidence was lost before it was kept", ""]]],
  ["communication", "Communication", "What failed in communication?", [
    ["internal", "Inside the company, people learned late or from rumour", ""],
    ["holding", "No holding statement, so 'no comment' became the story", ""],
    ["overclaimed", "We said something enforcement couldn't back up", ""],
    ["affected", "The people affected heard after the press did", ""],
    ["deadline", "A notification deadline was missed, or nearly", ""],
    ["blamed", "A front-line person was named as the cause", ""]]]
];
const PX_SEV = [
  ["1", "Sev 1", "Serious harm to people was happening or imminent, or harm was spreading faster than you could contain it"],
  ["2", "Sev 2", "Serious harm or a serious failure, with hours or days to respond"],
  ["3", "Sev 3", "A known risk with a deadline that needed a coordinated plan"]
];
// The five fixed moments, in the chapter's order, then the extra one: [label, placeholder]
const PX_TLROWS = {
  first:["First related item appeared", "The video was posted; the first abusive comments"],
  signal:["First internal signal", "A report spike, an alert, an analyst's note"],
  declared:["Incident declared and triaged", "Who declared it and at what level"],
  contained:["Containment in place", "What lever was pulled"],
  resolved:["Resolved", "When the harm stopped, or the last organising account was actioned"],
  more:["Another moment", "A statement went out; the regulator was notified"]
};
const PX_FIXED = ["first", "signal", "declared", "contained", "resolved"];
const PX_PHRASE = {A:"a strong response, with lessons worth keeping", B:"a solid response, with gaps to close", C:"a response that worked, late", D:"a response that mostly happened to you", F:"a response to rebuild before the next one"};
// Failure key ("layer.option") -> [action text, owner key]
const PX_FIX = {
  "prevention.no_rule":["Write the rule or default that would have covered this, with an example of what crosses the line", "policy"],
  "prevention.unapplied":["Find out why the rule wasn't applied (training, tooling, queue) and fix that step", "ops"],
  "prevention.new_accounts":["Limit what accounts under a week old can do in the place this happened, and pre-approve the limit for next time", "product"],
  "prevention.feature":["Add a safety check to the feature that made this easy: a limit, a friction step or a default", "product"],
  "prevention.known":["Build the safeguard the pre-mortem already named, and mark it done there", "eng"],
  "detection.no_alert":["Add an alert on the rate of this harm category, per hour, in the surface where it happened", "eng"],
  "detection.late_alert":["Re-tune the alert threshold against this incident's timeline so it would have fired at the first signal", "eng"],
  "detection.queue":["Give this kind of report a severity that jumps the queue, and a response time", "ops"],
  "detection.volume":["Change the monitor from volume to rate, with a baseline for that hour of the week", "eng"],
  "detection.outside":["Add a monitor for the signal that outsiders saw before you did", "eng"],
  "response.no_lead":["Name who can declare an incident and who leads one, with a backup, and put it in the playbook", "lead"],
  "response.late":["Write the declaration threshold into the playbook: declare early, downgrade later", "lead"],
  "response.no_lever":["Build the lever that would have contained this in minutes, usable without a deploy", "eng"],
  "response.over":["Write the containment order into the playbook: distribution first (search, hashtags, recommendations), then enforcement", "policy"],
  "response.queues":["Add a rule to the playbook: the highest-severity queues stay staffed whatever else is happening", "ops"],
  "response.evidence":["Add a preserve step before any removal in the playbook, with where the evidence goes", "legal"],
  "communication.internal":["Set a fixed internal update cadence for incidents: what's known, what's done, what's next, who decides", "lead"],
  "communication.holding":["Write the holding statement template now, with the four blanks, and keep it in the playbook", "comms"],
  "communication.overclaimed":["Add the rule: every number and claim in a statement comes from the operations lead", "comms"],
  "communication.affected":["Add a step to the playbook: contact the people affected before anyone else", "comms"],
  "communication.deadline":["Put the notification duties, deadlines and contacts in the playbook, owned by Legal", "legal"],
  "communication.blamed":["Agree with leadership and Comms that no front-line person is named as the cause of a systemic gap", "exec"]
};
const PX_FALLBACK = {
  reach:["Work out how many people saw it and for how long, and add it to this document", "eng", 7],
  promise:["Put a date on every promise made during the incident", "comms", 3],
  follow:["Check these actions are done, and whether the same kind of incident has come back", "lead", 30]
};
const PX_REDACT_LIST = [
  "User handles, display names and content samples: replace with \"a user\", \"the creator\", \"the post\".",
  "Staff names: roles only. The tool never asked for names; check what you typed.",
  "Internal links, dashboard URLs and ticket numbers.",
  "Exact counts, if a contract or a regulator conversation makes them sensitive. Ranges are fine.",
  "Anything about a child beyond \"a minor was affected\"."
];

const PX_BLANK = () => ({
  name:"", what:"", area:"", who:[], reach:"", detect:"",
  tl:[ {k:"first", t:"", w:""}, {k:"signal", t:"", w:""}, {k:"declared", t:"", w:""}, {k:"contained", t:"", w:""}, {k:"resolved", t:"", w:""} ],
  worked:[], fail:{prevention:[], detection:[], response:[], communication:[]},
  sev:"", duties:[], dutiesSet:false, promises:[], acts:[], actsSeeded:false,
  date:"", view:"setup", tab:"doc", docv:"team", ex:false, shared:false
});
let px = Object.assign(PX_BLANK(), store.get("px", null) || {});
let pxView = null;
const pxSave = () => store.set("px", px);
const pxTitle = d => "Post-mortem: " + (d.name || "Untitled incident");

/* ---------- small helpers ---------- */
const pxOpt = (list, k) => list.find(o => o[0] === k) || null;
const pxLayer = k => PX_LAYERS.find(l => l[0] === k) || null;
const pxFailText = src => { const [l, k] = String(src || "").split("."), L = pxLayer(l), o = L && pxOpt(L[3], k); return o ? o[1] : ""; };
const pxOwnerName = k => (PX_OWNERS.find(o => o[0] === k) || [k, ""])[1];
const pxToName = k => (PX_TO.find(o => o[0] === k) || [k, "Someone"])[1];
const pxIso = dt => dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
const pxPlusDays = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return pxIso(d); };
const PX_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], PX_WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pxParse = t => { if(!t) return null; const m = new Date(t); return isNaN(m.getTime()) ? null : m; };
// "Sat 3 Oct, 23:30"
const pxWhen = t => { const m = pxParse(t); return m ? `${PX_WD[m.getDay()]} ${m.getDate()} ${PX_MON[m.getMonth()]}, ${String(m.getHours()).padStart(2, "0")}:${String(m.getMinutes()).padStart(2, "0")}` : "—"; };
// "17 Oct 2026" from a YYYY-MM-DD string
const pxDay = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "")); return m ? `${+m[3]} ${PX_MON[+m[2] - 1]} ${m[1]}` : ""; };
function pxMins(n){
  n = Math.round(n); const dd = Math.floor(n / 1440), h = Math.floor((n % 1440) / 60), m = n % 60;
  if(dd) return dd + "d" + (h ? " " + h + "h" : "");
  if(h) return h + "h" + (m ? " " + m + "m" : "");
  return m + "m";
}
function pxRowT(d, k){ const r = (d.tl || []).find(x => x.k === k); return r ? r.t : ""; }
function pxDiff(a, b){ const x = pxParse(a), y = pxParse(b); if(!x || !y) return null; const m = Math.round((y - x) / 60000); return m < 0 ? null : m; }
// Minutes between consecutive fixed moments; null when a time is missing, does not parse, or runs backwards
function pxGaps(d){
  const t = PX_FIXED.map(k => pxRowT(d, k));
  return {firstToSignal:pxDiff(t[0], t[1]), signalToDeclared:pxDiff(t[1], t[2]), declaredToContained:pxDiff(t[2], t[3]), containedToResolved:pxDiff(t[3], t[4])};
}
const pxSpan = d => pxDiff(pxRowT(d, "first"), pxRowT(d, "resolved"));
// Earliest parseable moment, as YYYY-MM-DD
function pxDateOf(d){
  const ts = (d.tl || []).map(r => pxParse(r.t)).filter(Boolean).sort((a, b) => a - b);
  return ts.length ? pxIso(ts[0]) : (d.date || "");
}
// Rows with something to show, by time; rows without a readable time stay at the end in the order they were written
function pxSortedTl(d){
  const rows = (d.tl || []).map((r, i) => Object.assign({}, r, {i, m:pxParse(r.t)})).filter(r => (r.w || "").trim() || r.t);
  const ok = rows.filter(r => r.m).sort((a, b) => a.m - b.m || a.i - b.i), rest = rows.filter(r => !r.m);
  return ok.concat(rest);
}
const pxLiveActions = d => (d.acts || []).filter(a => a && (a.w || "").trim());
const pxLivePromises = d => (d.promises || []).filter(p => p && (p.w || "").trim());
const pxWorkedKeys = d => (d.worked || []).filter(k => k !== "none");
function pxFailures(d){
  const out = [];
  PX_LAYERS.forEach(L => ((d.fail || {})[L[0]] || []).filter(k => k !== "ok").forEach(k => { if(pxOpt(L[3], k)) out.push({layer:L[0], key:k, src:L[0] + "." + k, text:pxOpt(L[3], k)[1]}); }));
  return out;
}
function pxLayerScore(d, layer){
  const f = ((d.fail || {})[layer]) || [];
  if(!f.length) return 0;
  if(f[0] === "ok") return 10;
  return Math.max(0, 10 - 4 * f.filter(k => k !== "ok").length);
}

/* ---------- the score: for the response, never the incident ---------- */
function pxScore(d){
  const gp = pxGaps(d), m = gp.signalToDeclared;
  const det = pxOpt(PX_DETECT, d.detect), dp = det ? det[3] : 0;
  const gapPts = m === null ? 8 : m <= 30 ? 20 : m <= 120 ? 15 : m <= 240 ? 10 : m <= 480 ? 6 : m <= 1440 ? 3 : 0;
  const lay = PX_LAYERS.reduce((t, L) => t + pxLayerScore(d, L[0]), 0);
  const wk = Math.min(10, 2 * pxWorkedKeys(d).length);
  const fixedFull = PX_FIXED.every(k => (((d.tl || []).find(r => r.k === k) || {}).w || "").trim());
  const reachKnown = !!d.reach && d.reach !== "unknown";
  const dated = pxLivePromises(d).some(p => p.by);
  const rec = (fixedFull ? 5 : 0) + (reachKnown ? 3 : 0) + (dated ? 2 : 0);
  const parts = [
    {k:"detect", n:"First signal", got:dp, max:20, why:"Where the first signal came from: an alert scores most, outsiders and public posts least."},
    {k:"gap", n:"Signal to declaration", got:gapPts, max:20, why: m === null ? "Add times to score this. Until then it scores 8 of 20." : `${pxMins(m)} from the first internal signal to a declared incident. Under 30 minutes scores most.`},
    {k:"layers", n:"Four layers", got:lay, max:40, why:"Each layer starts at 10 and loses 4 for every failure you picked. A layer with nothing failed keeps all 10."},
    {k:"worked", n:"What worked", got:wk, max:10, why:"2 points for each thing that worked, up to 10."},
    {k:"record", n:"Honest record", got:rec, max:10, why:"5 for text on all five moments, 3 for a known reach, 2 for a promise with a date."}
  ];
  const score = parts.reduce((t, p) => t + p.got, 0);
  return {score, grade:gradeOf(score), parts, gaps:gp};
}
function pxVerdict(d, s){
  const rw = pxOpt(PX_REACH, d.reach), dw = pxOpt(PX_DETECT, d.detect);
  const bits = [d.sev ? "Sev " + d.sev : "", rw ? rw[3] : "", dw ? "first seen " + dw[4] : ""].filter(Boolean).join(", ");
  return `${(d.name || "").trim() || "This incident"}: ${bits ? bits + ". " : ""}The response scores ${s.score} out of 100: ${PX_PHRASE[s.grade]}.`;
}

/* ---------- the three actions ---------- */
function pxDraftActions(d){
  const sc = {}; PX_LAYERS.forEach(L => { sc[L[0]] = pxLayerScore(d, L[0]); });
  const order = ["detection", "response", "prevention", "communication"];
  const layers = order.slice().sort((a, b) => sc[a] - sc[b] || order.indexOf(a) - order.indexOf(b));
  const fails = pxFailures(d), out = [], seen = {};
  layers.forEach(l => fails.filter(f => f.layer === l).forEach(f => {
    const fx = PX_FIX[f.src]; if(!fx || seen[fx[0]] || out.length >= 3) return; seen[fx[0]] = 1;
    out.push({w:fx[0], owner:fx[1], by:pxPlusDays([14, 30, 45][out.length]), src:f.src});
  }));
  const add = (f, src) => { if(out.length >= 3 || seen[f[0]]) return; seen[f[0]] = 1; out.push({w:f[0], owner:f[1], by:pxPlusDays(f[2]), src}); };
  if(d.reach === "unknown") add(PX_FALLBACK.reach, "followup");
  if(pxLivePromises(d).some(p => !p.by)) add(PX_FALLBACK.promise, "followup");
  add(PX_FALLBACK.follow, "followup");
  while(out.length < 3) out.push({w:"", owner:"", by:"", src:"you"});
  return out;
}
function pxBlameCheck(text){
  const hits = String(text || "").match(/\b(should have|failed to|fault|blame|careless|negligent|ignored|forgot|didn't bother|lazy)\b/gi) || [];
  return hits.map(h => h.toLowerCase()).filter((h, i, a) => a.indexOf(h) === i);
}
function pxBlameAll(d){
  const txt = [d.what].concat((d.tl || []).map(r => r.w), (d.acts || []).map(a => a.w), (d.promises || []).map(p => p.w)).filter(Boolean).join(" \n ");
  return pxBlameCheck(txt);
}
// Handles, email addresses and web addresses become [redacted]. Applied to the Slack message, never to downloads.
const pxRedact = t => String(t || "").replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[redacted]").replace(/https?:\/\/[^\s)>\]]+/gi, "[redacted]").replace(/(^|[^\w])@[\w.]{2,}/g, "$1[redacted]");

/* ---------- laws and duties ---------- */
function pxDutyOpts(){
  const o = typeof orgGet === "function" ? orgGet() : {}, regions = o.regions && o.regions.length ? o.regions : ["us", "eu", "uk"], seen = {}, out = [];
  regions.forEach(r => OBL.filter(x => x.r === r).forEach(x => { if(seen[x.law]) return; seen[x.law] = 1; out.push({k:x.r + ":" + x.law, n:x.law, h:(REGIONS.find(g => g.k === x.r) || {n:x.r}).n}); }));
  return out;
}
function pxDutyInfo(key){
  const i = String(key).indexOf(":"), r = String(key).slice(0, i), law = String(key).slice(i + 1), o = OBL.find(x => x.r === r && x.law === law);
  return {r, law, t:o ? o.t : "", region:(REGIONS.find(g => g.k === r) || {n:r}).n};
}
const pxDutyKey = (r, re) => { const o = OBL.find(x => x.r === r && re.test(x.law)); return o ? o.r + ":" + o.law : null; };

/* ---------- the document: one model, drawn as Markdown for the download and as HTML for the page ---------- */
function pxDocModel(d, version){
  const legal = version === "legal", s = pxScore(d), gp = s.gaps, acts = pxLiveActions(d), pr = pxLivePromises(d);
  const rw = pxOpt(PX_REACH, d.reach), dw = pxOpt(PX_DETECT, d.detect), now = new Date();
  const today = `${now.getDate()} ${PX_MON[now.getMonth()]} ${now.getFullYear()}`;
  const date = pxDay(pxDateOf(d)) || "date not recorded", area = CATS[d.area] || "kind of harm not set";
  const B = [];
  B.push({t:"h1", x:"Post-mortem: " + ((d.name || "").trim() || "Untitled incident")});
  B.push({t:"meta", x:[d.sev ? "Sev " + d.sev : "Severity not set", area, date].concat(legal ? ["written " + today, "draft for Legal review", "not legal advice"] : ["blameless review", "written " + today]).join(" · ")});
  B.push({t:"h2", x:"In one paragraph"});
  B.push({t:"p", x:(d.what || "").trim() || "What happened was not written down."});
  B.push({t:"p", x:`It reached ${rw ? rw[4] : "a number of people we do not yet know"} and was first seen ${dw ? dw[4] : "in a way that was not recorded"}.` + (gp.signalToDeclared !== null ? ` From the first internal signal to a declared incident took ${pxMins(gp.signalToDeclared)}.` : "")});
  B.push({t:"h2", x:"Impact"});
  const who = (d.who || []).map(k => (pxOpt(PX_WHO, k) || [k, k])[1]);
  const span = pxSpan(d);
  B.push({t:"ul", items:["Who: " + (who.length ? who.join(", ") : "Not recorded"), "How many: " + (rw ? rw[5] : "Not recorded"), "For how long: " + (span !== null ? pxMins(span) : "Not recorded: add times to the timeline")]});
  if(legal){
    B.push({t:"h2", x:"For Legal"});
    const keys = d.duties || [], infos = keys.map(pxDutyInfo);
    const duties = infos.length ? infos.map(i => `${i.law} (${i.region}): ${i.t}`) : ["None identified by the team; please confirm."];
    const gdpr = infos.some(i => /GDPR|General Data Protection/.test(i.law)), csam = infos.some(i => /CSAM/.test(i.law));
    const clocks = [];
    if(gdpr) clocks.push("A personal data breach starts a 72-hour clock to the data protection authority from awareness (GDPR Article 33). Confirm whether this incident is one.");
    if(csam) clocks.push("Reporting and preservation duties apply from awareness. Confirm the report was made and the data preserved.");
    if(!clocks.length) clocks.push("None flagged by the answers; confirm.");
    const lost = ((d.fail || {}).response || []).includes("evidence"), kept = (d.worked || []).includes("preserve");
    const ev = lost ? "lost before it was kept" : kept ? "yes" : "not recorded";
    const pub = pr.filter(p => ["press", "regulator", "users"].includes(p.to)).map(p => `To ${pxToName(p.to).toLowerCase()}: ${p.w}${p.by ? " (by " + pxDay(p.by) + ")" : ""}`);
    B.push({t:"lab", x:"Duties touched"}); B.push({t:"ul", items:duties});
    B.push({t:"lab", x:"Notification clocks"}); B.push({t:"ul", items:clocks});
    B.push({t:"lab", x:"Evidence"}); B.push({t:"ul", items:["Preserved before removal: " + ev + "."]});
    B.push({t:"lab", x:"Public statements"}); B.push({t:"ul", items:pub.length ? pub : ["None recorded."]});
  }
  B.push({t:"h2", x:"Timeline"});
  const tl = pxSortedTl(d).filter(r => (r.w || "").trim());
  B.push({t:"table", head:["When", "What"], rows:tl.length ? tl.map(r => [pxWhen(r.t), r.w.trim()]) : [["—", "No moments were written down."]]});
  const gl = []; if(gp.signalToDeclared !== null) gl.push("First signal to declared: " + pxMins(gp.signalToDeclared) + "."); if(gp.declaredToContained !== null) gl.push("Declared to contained: " + pxMins(gp.declaredToContained) + ".");
  if(gl.length) B.push({t:"p", x:gl.join(" ")});
  B.push({t:"h2", x:"What worked"});
  const wk = pxWorkedKeys(d);
  B.push({t:"ul", items:wk.length ? wk.map(k => (pxOpt(PX_WORKED, k) || [k, k])[1]) : ["Nothing we would keep. That is itself a finding."]});
  B.push({t:"h2", x:"What failed in the system"});
  PX_LAYERS.forEach(L => {
    const f = ((d.fail || {})[L[0]] || []).filter(k => k !== "ok" && pxOpt(L[3], k)), ok = ((d.fail || {})[L[0]] || [])[0] === "ok";
    B.push({t:"h3", x:L[1]});
    B.push({t:"ul", items:f.length ? f.map(k => pxOpt(L[3], k)[1]) : [ok ? "Nothing failed here." : "Not recorded."]});
  });
  B.push({t:"h2", x:"Actions"});
  B.push({t:"table", head:["Change", "Owner", "Due"], rows:acts.length ? acts.map(a => [a.w.trim(), pxOwnerName(a.owner) || "Not set", pxDay(a.by) || "No date set"]) : [["No actions were written down.", "—", "—"]]});
  if(pr.length){
    B.push({t:"h2", x:"Promises made"});
    B.push({t:"table", head:["To", "What", "By"], rows:pr.map(p => [pxToName(p.to), p.w.trim(), pxDay(p.by) || "No date set"])});
  }
  B.push({t:"h2", x:"Follow-up"});
  const dated = acts.filter(a => a.by).map(a => a.by).sort(), last = dated.length ? dated[dated.length - 1] : "", lastD = last ? new Date(last + "T12:00:00") : null;
  if(lastD) lastD.setDate(lastD.getDate() + 7);
  const own = acts.length ? (PX_OWNER_TEAM[acts[0].owner] || "team") : "team";
  B.push({t:"p", x:`These actions are checked ${lastD ? "on " + pxDay(pxIso(lastD)) : "at the next review"} by the ${own}. Two numbers to watch across reviews: the share of actions closed on time, and whether the same kind of incident comes back.`});
  B.push({t:"foot", x:"Made with T&S Workbench. A blameless review: everyone acted in good faith with what they knew at the time."});
  return B;
}
function pxDoc(d, version){
  const cell = x => String(x).replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
  return pxDocModel(d, version).map(b => {
    if(b.t === "h1") return "# " + b.x + "\n";
    if(b.t === "meta") return "_" + b.x + "_\n";
    if(b.t === "h2") return "## " + b.x + "\n";
    if(b.t === "h3") return "### " + b.x;
    if(b.t === "p") return b.x + "\n";
    if(b.t === "lab") return "**" + b.x + "**\n";
    if(b.t === "ul") return b.items.map(i => "- " + i).join("\n") + "\n";
    if(b.t === "table") return "| " + b.head.join(" | ") + " |\n|" + b.head.map(() => "---").join("|") + "|\n" + b.rows.map(r => "| " + r.map(cell).join(" | ") + " |").join("\n") + "\n";
    return "_" + b.x + "_\n";
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
function pxDocHTML(d, version){
  return `<div class="px-doc">` + pxDocModel(d, version).map(b => {
    if(b.t === "h1") return `<h3>${esc(b.x)}</h3>`;
    if(b.t === "meta") return `<p class="note">${esc(b.x)}</p>`;
    if(b.t === "h2") return `<h4>${esc(b.x)}</h4>`;
    if(b.t === "h3") return `<h5>${esc(b.x)}</h5>`;
    if(b.t === "p") return `<p>${esc(b.x)}</p>`;
    if(b.t === "lab") return `<p class="px-lab"><b>${esc(b.x)}</b></p>`;
    if(b.t === "ul") return `<ul>${b.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
    if(b.t === "table") return `<div class="px-tw"><table class="ln-t"><thead><tr>${b.head.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    return `<p class="note">${esc(b.x)}</p>`;
  }).join("") + `</div>`;
}
// Slack mrkdwn, at most 1,200 characters, with handles, emails and web addresses taken out
function pxSlack(d){
  const s = pxScore(d), acts = pxLiveActions(d), pr = pxLivePromises(d), fails = pxFailures(d), rw = pxOpt(PX_REACH, d.reach), span = pxSpan(d);
  const who = (d.who || []).map(k => (pxOpt(PX_WHO, k) || [k, k])[1]);
  const prof = typeof wsProfile === "function" ? wsProfile() : null, author = (prof && prof.name) || "the author";
  const build = (cut, nPr) => {
    const L = [];
    L.push(`*Post-mortem: ${(d.name || "").trim() || "Untitled incident"}* (${d.sev ? "Sev " + d.sev : "Severity not set"}, ${pxDateOf(d) || "date not recorded"})`);
    L.push(pxVerdict(d, s));
    L.push(`*Impact:* ${who.length ? who.join(", ") : "not recorded"} · ${rw ? rw[5].toLowerCase() : "reach not recorded"} · ${span !== null ? pxMins(span) : "duration not recorded"}`);
    if(fails.length){ const first = fails.slice(0, 4).map(f => f.text), more = fails.length - first.length; L.push(`*What failed:* ${first.join(", ")}${more > 0 ? `, …and ${more} more` : ""}`); }
    if(acts.length){ L.push("*Actions:*"); acts.forEach(a => { const w = a.w.trim(); L.push(`• ${cut && w.length > cut ? w.slice(0, cut - 1).trim() + "…" : w} — ${pxOwnerName(a.owner) || "no owner"}, due ${a.by || "no date set"}`); }); }
    if(pr.length && nPr){ L.push("*Promises:*"); pr.slice(0, nPr).forEach(p => L.push(`• To ${pxToName(p.to).toLowerCase()}: ${p.w.trim()}${p.by ? ", by " + p.by : ""}`)); }
    L.push(`Full document: ask ${author} for the post-mortem.`);
    return pxRedact(L.join("\n"));
  };
  let out = build(0, 6);
  if(out.length > 1200) out = build(140, 3);
  if(out.length > 1200) out = build(80, 1);
  if(out.length > 1200) out = build(60, 0);
  return out.length > 1200 ? out.slice(0, 1199) + "…" : out;
}

/* ---------- tracker ---------- */
function tkFromPostmortem(){
  const d = px, name = (d.name || "").trim() || "Untitled incident", date = pxDateOf(d), pr = d.sev === "1" ? 4 : d.sev === "3" ? 2 : 3;
  const tasks = [];
  (d.acts || []).forEach((a, i) => {
    if(!a || !(a.w || "").trim()) return;
    const layer = /^(prevention|detection|response|communication)\./.test(a.src || "") ? a.src.split(".")[0] : "followup", why = pxFailText(a.src);
    tasks.push({id:"px-act-" + i, title:a.w.trim(), group:"From the post-mortem: " + name, owner:pxOwnerName(a.owner), pr, done:false, def:true,
      labels:["trust-and-safety", "post-mortem", "incident-" + tkSlug(name), "layer-" + layer],
      desc:[a.w.trim(), "", "Due: " + (a.by || "no date set"), `From the incident "${name}", Sev ${d.sev || "?"}, ${date || "date not recorded"}.`, why ? "Why: " + why : null, "", "From an incident post-mortem made with T&S Workbench."].filter(x => x !== null).join("\n")});
  });
  (d.promises || []).forEach((p, i) => {
    if(!p || !(p.w || "").trim()) return;
    tasks.push({id:"px-pr-" + i, title:"Promise to " + pxToName(p.to).toLowerCase() + ": " + p.w.trim(), group:"Promises made during the incident", owner:"Comms", pr:3, done:false, def:true,
      labels:["trust-and-safety", "post-mortem", "promise"],
      desc:["Promise to " + pxToName(p.to).toLowerCase() + ": " + p.w.trim(), "", "Due: " + (p.by || "no date set"), `From the incident "${name}", Sev ${d.sev || "?"}, ${date || "date not recorded"}.`, "", "From an incident post-mortem made with T&S Workbench."].join("\n")});
  });
  return tasks;
}

/* ---------- the guided flow ---------- */
function pxGapsAsideHTML(){
  const g = pxGaps(px); if(g.signalToDeclared === null) return "";
  return `<div class="card px-aside"><span class="as-eb">The gaps so far</span><p><b>Signal to declared:</b> ${pxMins(g.signalToDeclared)}</p>${g.declaredToContained !== null ? `<p><b>Declared to contained:</b> ${pxMins(g.declaredToContained)}</p>` : ""}</div>`;
}
function pxTimelineHTML(){
  return `<div class="px-tl" role="group" aria-label="Timeline">${px.tl.map((r, i) => {
    const row = PX_TLROWS[r.k] || PX_TLROWS.more, id = "px-tl-" + i;
    return `<div class="px-trow"><div class="px-tlab"><span class="px-n" aria-hidden="true">${r.k === "more" ? "+" : i + 1}</span><b>${esc(row[0])}</b>${r.k === "more" ? `<button type="button" class="btn sm icon" data-px="tlrm" data-i="${i}" aria-label="Remove this moment"><svg><use href="#i-x"/></svg></button>` : ""}</div>
      <div class="px-tf"><label class="visually-hidden" for="${id}-t">${esc(row[0])}: date and time</label><input type="datetime-local" class="input" id="${id}-t" data-pxtl-t="${i}" value="${esc(r.t)}">
        <label class="visually-hidden" for="${id}-w">${esc(row[0])}: what happened</label><input class="input" id="${id}-w" data-pxtl-w="${i}" maxlength="140" value="${esc(r.w)}" placeholder="${esc(row[1])}" autocomplete="off"></div></div>`;
  }).join("")}</div>
  <div class="px-tlx">${px.tl.length < 8 ? `<button type="button" class="btn sm" data-px="tladd"><svg><use href="#i-plus"/></svg>Add a moment</button>` : ""}<p class="note">Add times to the five rows and the report shows the gaps.</p></div>`;
}
function pxPromisesHTML(){
  const rows = px.promises.map((p, i) => `<div class="px-prow">
      <div class="field"><label for="px-pt-${i}">Promised to</label><select class="select" id="px-pt-${i}" data-pxpr-to="${i}">${PX_TO.map(([k, n]) => `<option value="${k}" ${p.to === k ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>
      <div class="field px-pw"><label for="px-pw-${i}">What was promised</label><input class="input" id="px-pw-${i}" data-pxpr-w="${i}" maxlength="140" value="${esc(p.w)}" placeholder="An update on what changed; a direct reply; a report" autocomplete="off"></div>
      <div class="field"><label for="px-pb-${i}">By</label><input type="date" class="input" id="px-pb-${i}" data-pxpr-by="${i}" value="${esc(p.by)}"></div>
      <button type="button" class="btn sm icon" data-px="prrm" data-i="${i}" aria-label="Remove this promise"><svg><use href="#i-x"/></svg></button></div>`).join("");
  return `<div class="px-prs">${rows || `<p class="note">No promises yet. Add one, or continue.</p>`}</div>
    ${px.promises.length < 6 ? `<div class="px-tlx"><button type="button" class="btn sm" data-px="pradd"><svg><use href="#i-plus"/></svg>Add a promise</button></div>` : ""}`;
}
function pxActionsHTML(){
  if(!px.actsSeeded){ px.acts = pxDraftActions(px); px.actsSeeded = true; pxSave(); }
  while(px.acts.length < 3) px.acts.push({w:"", owner:"", by:"", src:"you"});
  return `<div class="px-acts">${px.acts.slice(0, 3).map((a, i) => `<div class="px-arow"><span class="px-n" aria-hidden="true">${i + 1}</span><div class="px-af">
      <div class="field"><label for="px-aw-${i}">Action ${i + 1}: the change</label><textarea class="input" id="px-aw-${i}" rows="2" maxlength="240" data-pxact-w="${i}" placeholder="A change to the system, not 'be more careful'">${esc(a.w)}</textarea></div>
      <div class="px-ao"><div class="field"><label for="px-ao-${i}">Owner</label><select class="select" id="px-ao-${i}" data-pxact-owner="${i}"><option value="">Choose</option>${PX_OWNERS.map(([k, n]) => `<option value="${k}" ${a.owner === k ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>
        <div class="field"><label for="px-ab-${i}">Due</label><input type="date" class="input" id="px-ab-${i}" data-pxact-by="${i}" value="${esc(a.by)}"></div></div></div></div>`).join("")}</div>
    <div class="px-tlx"><button type="button" class="btn sm" data-px="actseed">Redraft from my answers</button></div>`;
}
function pxSpec(){
  const setV = (k, v) => { px[k] = v; px.ex = false; pxSave(); };
  const toggleIn = (k, v) => setV(k, px[k].includes(v) ? px[k].filter(x => x !== v) : px[k].concat(v));
  const opts3 = list => () => list.map(([k, n, h]) => ({k, n, h}));
  const layerStep = L => ({id:L[0], eb:L[1], title:L[2], why:"What in the system failed, not who. Pick everything that was true.", kind:"multi", none:"Nothing failed here",
    opts:() => L[3].map(([k, n, h]) => ({k, n, h})), get:() => (px.fail[L[0]] || []).filter(k => k !== "ok"), has:() => (px.fail[L[0]] || []).length > 0, answered:() => (px.fail[L[0]] || []).length > 0,
    noneOn:() => (px.fail[L[0]] || [])[0] === "ok",
    toggle:k => { const cur = (px.fail[L[0]] || []).filter(x => x !== "ok"); px.fail = Object.assign({}, px.fail, {[L[0]]:cur.includes(k) ? cur.filter(x => x !== k) : cur.concat(k)}); px.ex = false; pxSave(); },
    clear:() => { px.fail = Object.assign({}, px.fail, {[L[0]]:["ok"]}); px.ex = false; pxSave(); }});
  const steps = [
    {id:"name", eb:"Name", title:"What do you call the incident?", why:"The title of the document. A plain name people will recognise in a month, not a code name.", kind:"text", max:80, placeholder:"For example: The comment pile-on, 3 October", get:() => px.name, set:v => setV("name", v.slice(0, 80))},
    {id:"what", eb:"What happened", title:"What happened, in two or three sentences?", why:"Facts, in the order they happened: what people saw, did or lost. No names of staff; say 'the on-call lead', not who it was.", kind:"text", rows:4, max:600,
      hint:"Write 'the alert didn't fire', not 'someone missed the alert'. The document stays blameless if the answers do.", get:() => px.what, set:v => setV("what", v.slice(0, 600))},
    {id:"area", eb:"Kind of harm", title:"Which kind of harm was it?", why:"Ties the incident to the risk in your pre-mortem and your coverage radar.", kind:"single",
      opts:() => PX_AREAS.map(k => ({k, n:CATS[k]})), get:() => px.area, set:k => setV("area", k)},
    {id:"who", eb:"Who it affected", title:"Who did it affect?", why:"Impact is who, how many and for how long. This is the who.", kind:"multi", opts:opts3(PX_WHO), get:() => px.who, toggle:k => toggleIn("who", k)},
    {id:"reach", eb:"How many", title:"How many people did it reach?", why:"Count the people who saw it or were exposed, not the accounts that did it. If you don't know, say so: finding out becomes an action.", kind:"single",
      opts:opts3(PX_REACH), get:() => px.reach, set:k => setV("reach", k)},
    {id:"detect", eb:"First signal", title:"How did you first find out?", why:"Where the first signal came from says more about your detection than any dashboard.", kind:"single",
      opts:opts3(PX_DETECT), get:() => px.detect, set:k => setV("detect", k)},
    {id:"timeline", eb:"Timeline", title:"When did each of these happen?", why:"Five moments the handbook asks for, in order. The gap between the first signal and the declaration is usually the fastest one to fix.", kind:"custom",
      html:pxTimelineHTML, answered:() => px.tl.filter(r => (r.w || "").trim()).length >= 5, has:() => px.tl.filter(r => (r.w || "").trim()).length >= 5},
    {id:"worked", eb:"What worked", title:"What worked?", why:"Levers, people and processes that helped. These go in the document so they survive the next reorg.", kind:"multi", none:"Nothing went well",
      opts:opts3(PX_WORKED), get:() => px.worked.filter(k => k !== "none"), has:() => px.worked.length > 0, answered:() => px.worked.length > 0, noneOn:() => px.worked[0] === "none",
      toggle:k => { const cur = px.worked.filter(x => x !== "none"); setV("worked", cur.includes(k) ? cur.filter(x => x !== k) : cur.concat(k)); }, clear:() => setV("worked", ["none"])}
  ].concat(PX_LAYERS.map(layerStep)).concat([
    {id:"sev", eb:"Severity", title:"How severe was it, on the tabletop's scale?", why:"The same three levels as the incident tabletop and chapter 13. The grade does not depend on this; it is for the document and for sorting the tracker.", kind:"single",
      opts:opts3(PX_SEV), get:() => px.sev, set:k => setV("sev", k)},
    {id:"duties", eb:"Laws and duties", title:"Which laws or duties did it touch?", why:"The same obligation list as the abuse pre-mortem, for the regions in your workspace profile. Legal confirms; you record.", kind:"multi", none:"None that we know of",
      opts:pxDutyOpts, get:() => px.duties, has:() => px.dutiesSet, answered:() => px.dutiesSet, noneOn:() => px.dutiesSet && !px.duties.length,
      toggle:k => { px.duties = px.duties.includes(k) ? px.duties.filter(x => x !== k) : px.duties.concat(k); px.dutiesSet = px.duties.length > 0; px.ex = false; pxSave(); },
      clear:() => { px.duties = []; px.dutiesSet = true; px.ex = false; pxSave(); }},
    {id:"promises", eb:"Promises", title:"What did you promise, and to whom?", why:"Every promise made during an incident is an action with a date. Write them down before they are forgotten.", kind:"custom", opt:true, next:"Continue",
      html:pxPromisesHTML, has:() => px.promises.some(p => (p.w || "").trim())},
    {id:"actions", eb:"Actions", title:"Three changes, each with an owner and a date", why:"Drafted from what failed. Edit the words, pick who owns each one and when it is due. A review that ends with 'be more careful' changes nothing.", kind:"custom",
      html:pxActionsHTML, answered:() => (px.acts || []).some(a => (a.w || "").trim() && a.owner), has:() => (px.acts || []).some(a => (a.w || "").trim() && a.owner)}
  ]);
  return {k:"postmortem", tool:{name:"Incident post-mortem", icon:"doc", color:"var(--t-tt)"},
    intro:{title:"Write the post-mortem people will actually read",
      lead:"Fifteen questions about what happened and how you responded. At the end you get a one-page document in the handbook's shape, a grade for the response (never for the incident), and three actions with an owner and a date each, ready for your tracker.",
      note:"Blameless by design: it asks what in the system failed, never who. Roles, not names.",
      facts:[["About 15 minutes", "Facts and timestamps. Come back any time."], ["The chapter 13 template", "Timeline, impact, what worked, what failed, actions, follow-up."], ["Stays in your browser", "Nothing leaves your device until you download it."]],
      start:"Start"},
    alt:[{n:"See an example", run:() => pxAct("example")}],
    steps, finish:"Write the post-mortem",
    aside:s => s.id === "timeline" ? `<div id="px-aside-gaps">${pxGapsAsideHTML()}</div>` : "",
    preview:pxPreviewHTML,
    done:() => { pxView = null; pxAct("build"); }};
}

/* ---------- the report ---------- */
function pxVerdictHTML(d, s, acts, toast){
  const tone = s.grade === "A" || s.grade === "B" ? "good" : s.grade === "C" ? "high" : "crit", gp = s.gaps, fails = pxFailures(d);
  const layersHit = PX_LAYERS.filter(L => fails.some(f => f.layer === L[0])).length, pr = pxLivePromises(d).length;
  const blame = pxBlameAll(d);
  return `<div class="card pol-sum tr-sum"><div class="tr-ring px-ring ${tone}"><b>${s.score}</b><span>of 100</span></div>
    <div><span class="eyebrow">${esc([d.sev ? "Sev " + d.sev : "Severity not set", CATS[d.area] || "Kind of harm not set", pxDay(pxDateOf(d)) || "Date not recorded"].join(" · "))}</span>
      <div class="verdict-row" aria-live="polite"><h2 class="pol-verdict">${esc(pxVerdict(d, s))}</h2>${gradeBadge(s.score, "The response, scored out of 100. Never the incident.")}</div>
      <p class="note">The grade is for the response, not the incident. A Sev 1 handled well scores higher than a Sev 3 nobody led.</p>
      ${blame.length ? `<p class="note">${blame.length} phrase${blame.length === 1 ? "" : "s"} to soften before sharing: ${blame.map(b => "'" + esc(b) + "'").join(", ")}. Say what the system did, not what a person didn't.</p>` : ""}
      <div class="cp-kpis"><span class="pill">${acts.length} action${acts.length === 1 ? "" : "s"}</span><span class="pill ${fails.length ? "high" : "good"}">${fails.length} failure${fails.length === 1 ? "" : "s"} across ${layersHit} layer${layersHit === 1 ? "" : "s"}</span><span class="pill">${pr} promise${pr === 1 ? "" : "s"}</span>${gp.signalToDeclared !== null ? `<span class="pill ${gp.signalToDeclared > 240 ? "high" : "good"}">Signal to declared ${pxMins(gp.signalToDeclared)}</span>` : ""}</div>
      ${toast ? `<span class="toast" id="px-toast" role="status" aria-live="polite"></span>` : ""}</div></div>`;
}
function pxActionsListHTML(acts){
  return acts.length ? `<ol class="pk-list gd-vacts">${acts.map(a => `<li><b>${esc(a.w.trim().replace(/\.$/, ""))}.</b> ${esc(pxOwnerName(a.owner) || "No owner yet")} · due ${esc(pxDay(a.by) || "no date set")}</li>`).join("")}</ol>` : "";
}
// The finished example under the intro: swap it in, draw, put the visitor's own answers back. No saving, no events.
function pxPreviewHTML(){
  const saved = px;
  try{
    px = Object.assign(PX_BLANK(), JSON.parse(JSON.stringify(PX_EXAMPLE)));
    const s = pxScore(px), acts = pxLiveActions(px);
    return pxVerdictHTML(px, s, acts, false) + pxActionsListHTML(acts);
  }catch(e){ return ""; }
  finally{ px = saved; }
}
function pxTabHTML(d, s, tab){
  if(tab === "timeline"){
    const rows = pxSortedTl(d); let prev = null;
    return rows.length ? `<div class="px-tw"><table class="ln-t"><thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">Since the one before</th></tr></thead><tbody>${rows.map(r => {
      const gap = prev && r.m ? Math.round((r.m - prev) / 60000) : null; if(r.m) prev = r.m;
      return `<tr><td>${esc(pxWhen(r.t))}</td><td>${esc(r.w || "")}</td><td>${gap !== null ? esc(pxMins(gap)) : "—"}</td></tr>`; }).join("")}</tbody></table></div>` : `<p class="note">No moments were written down.</p>`;
  }
  if(tab === "layers"){
    return `<div class="px-layers">${PX_LAYERS.map(L => {
      const f = ((d.fail || {})[L[0]] || []).filter(k => k !== "ok" && pxOpt(L[3], k)), sc = pxLayerScore(d, L[0]);
      return `<section class="card px-layer"><div class="px-lh"><b>${esc(L[1])}</b><span class="pill ${sc >= 8 ? "good" : sc >= 4 ? "high" : "crit"}">${sc} of 10</span></div>
        ${f.length ? f.map(k => { const fx = PX_FIX[L[0] + "." + k]; return `<p><span class="pill high">${esc(pxOpt(L[3], k)[1])}</span>${fx ? `<span class="note">${esc(fx[0])}</span>` : ""}</p>`; }).join("") : `<p class="note">${((d.fail || {})[L[0]] || [])[0] === "ok" ? "Nothing failed here." : "Not answered."}</p>`}</section>`; }).join("")}</div>`;
  }
  if(tab === "duties"){
    const infos = (d.duties || []).map(pxDutyInfo);
    return (infos.length ? `<ul class="px-duties">${infos.map(i => `<li><b>${esc(i.law)}</b> <span class="tag">${esc(i.region)}</span><p>${esc(i.t)}</p></li>`).join("")}</ul>` : `<p class="note">None recorded.</p>`)
      + `<p class="note">Confirm with counsel. Law notes are general information, not legal advice.</p>`;
  }
  if(tab === "promises"){
    const pr = pxLivePromises(d);
    return pr.length ? `<div class="px-tw"><table class="ln-t"><thead><tr><th scope="col">To</th><th scope="col">What</th><th scope="col">By</th></tr></thead><tbody>${pr.map(p => `<tr><td>${esc(pxToName(p.to))}</td><td>${esc(p.w)}</td><td>${esc(pxDay(p.by) || "No date set")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="note">None recorded.</p>`;
  }
  if(tab === "score"){
    return `<ul class="px-parts">${s.parts.map(p => `<li><div class="px-ph"><b>${esc(p.n)}</b><span class="mono">${p.got} of ${p.max}</span></div><div class="pol-meter" role="meter" aria-valuemin="0" aria-valuemax="${p.max}" aria-valuenow="${p.got}" aria-label="${esc(p.n)}"><i style="width:${Math.round(p.got / p.max * 100)}%"></i></div><p class="note">${esc(p.why)}</p></li>`).join("")}</ul>
      <p class="note">Change an answer with Edit answers and the score follows.</p>`;
  }
  const v = d.docv === "legal" ? "legal" : "team";
  return `<div class="segs px-dv" role="group" aria-label="Which version">${[["team", "For the team"], ["legal", "For Legal"]].map(([k, n]) => `<button type="button" data-pxdocv="${k}" aria-pressed="${v === k}">${n}</button>`).join("")}</div>
    ${pxDocHTML(d, v)}
    <div class="card px-redact"><b>Before this leaves the team</b><ul>${PX_REDACT_LIST.map(x => `<li>${esc(x)}</li>`).join("")}</ul><p class="note">Downloads are not redacted. Use the checklist before sharing outside the team.</p></div>`;
}
function pxReportHTML(d, s, acts){
  const tab = ["doc", "timeline", "layers", "duties", "promises", "score"].includes(d.tab) ? d.tab : "doc", ex = d.ex;
  const tabs = [["doc", "Document"], ["timeline", "Timeline"], ["layers", "Layers"], ["duties", "Duties"], ["promises", "Promises"], ["score", "Score"]];
  return `<div class="pol-report px-report">
    ${d.shared ? shareBannerHTML('data-px="unshare"') : ""}
    ${ex ? `<div class="banner"><span><strong>This is an example:</strong> Pixelry, a photo and short-video app, after a comment pile-on on a creator's post. Start over to write yours.</span><button type="button" class="btn sm" data-px="reset">Start over</button></div>` : ""}
    ${pxVerdictHTML(d, s, acts, true)}
    ${pxActionsListHTML(acts)}
    ${chapterLinkHTML("postmortem")}
    <details class="ev-details"><summary>Details <span class="note">The document, the timeline, the four layers, duties and promises</span></summary>
    <div class="card pol-tabs"><div class="card-h"><div class="segs" role="group" aria-label="Report sections">${tabs.map(([k, n]) => `<button type="button" data-pxtab="${k}" aria-pressed="${tab === k}">${n}</button>`).join("")}</div></div>
      <div class="card-b">${pxTabHTML(d, s, tab)}</div></div>
    </details>
    <p class="note">Follows the post-incident review in chapter 13 of the T&amp;S Handbook and the blameless practice in Google's SRE book. A record for your team and a starting point for Legal, not legal advice.</p>
  </div>`;
}
function renderPostmortem(){
  if(px.view !== "report" && pxView !== "page") return gdRender(pxSpec());
  gdCur = null;
  const s = pxScore(px), acts = pxLiveActions(px);
  view.innerHTML = headCompact("Incident post-mortem", esc((px.name || "").trim() || "Untitled incident"),
    reportHeaderActions({
      example:px.ex ? null : {attrs:'data-px="example"', label:SEE_EXAMPLE_LABEL},
      edit:{attrs:'data-px="edit"', label:EDIT_ANSWERS_LABEL},
      reset:{attrs:'data-px="reset"', label:START_OVER_LABEL},
      save:{attrs:'data-px="save"', label:wsSaveLabel("postmortem", px), icon:"save"},
      download:{attrs:'data-px="download"', label:DOWNLOAD_LABEL, icon:"download"},
      tracker:acts.length ? {attrs:'data-px="tracker"', label:SEND_TRACKER_LABEL, icon:"send"} : null,
      extra:[{attrs:'data-px="legal"', label:"For Legal", icon:"download"}, {attrs:'data-px="slack"', label:"Copy as Slack message", icon:"copy"}]
    }, `<button type="button" class="btn sm" data-px="sharelink">${COPY_LINK_LABEL}</button>`))
    + `<div class="px-root">${pxReportHTML(px, s, acts)}</div>`;
}

/* ---------- the example: Pixelry, a comment pile-on ---------- */
const PX_EXAMPLE = {
  name:"The comment pile-on, 3 October",
  what:"A creator's video reached the trending page on Saturday night. Within two hours the comments filled with insults about her appearance, most of them from accounts under a week old, and copies of the same lines spread to her older posts. Her followers reported it; the on-call lead saw the report spike three hours later and limited comments on the post.",
  area:"harass", who:["one", "users"], reach:"thousands", detect:"reports",
  tl:[
    {k:"first", t:"2026-10-03T22:40", w:"The first cluster of abusive comments on the trending video"},
    {k:"signal", t:"2026-10-03T23:30", w:"Report spike on one post: 180 reports in 30 minutes, mostly from her followers"},
    {k:"declared", t:"2026-10-04T02:10", w:"On-call lead reads the queue, declares Sev 2 and takes the incident lead role"},
    {k:"contained", t:"2026-10-04T02:40", w:"Comments on the post limited to followers; commenting slowed for accounts under a week old on her profile; evidence exported first"},
    {k:"resolved", t:"2026-10-05T11:00", w:"Organising accounts and the accounts linked to them banned; comment removals with a statement of reasons sent"},
    {k:"more", t:"2026-10-04T09:00", w:"Comms replies to the creator directly and posts a short note on what changed"}
  ],
  worked:["lever", "preserve", "holding", "lead"],
  fail:{prevention:["new_accounts"], detection:["no_alert", "volume"], response:["late"], communication:["internal"]},
  sev:"2", duties:[pxDutyKey("eu", /core duties/), pxDutyKey("uk", /illegal harms duties/)].filter(Boolean), dutiesSet:true,
  promises:[{to:"affected", w:"A direct update on the accounts actioned and what changed", by:"2026-10-06"}, {to:"users", w:"A short note on comment limits for new accounts on trending posts", by:"2026-10-07"}],
  acts:[
    {w:"Add an alert on the rate of harassment reports per post per hour, so a pile-on pages on-call at the first spike, not three hours later", owner:"eng", by:"2026-10-17", src:"detection.no_alert"},
    {w:"Write the declaration threshold into the playbook: a report spike on one post is a Sev 2 until proven otherwise; declare early, downgrade later", owner:"lead", by:"2026-10-10", src:"response.late"},
    {w:"Slow commenting for accounts under a week old on posts that reach trending, pre-approved with Product so on-call can switch it on", owner:"product", by:"2026-11-02", src:"prevention.new_accounts"}
  ],
  actsSeeded:true, date:"2026-10-03", view:"report", tab:"doc", docv:"team", ex:true
};

/* ---------- events ---------- */
const pxShareState = () => { const o = JSON.parse(JSON.stringify(px)); ["view", "tab", "docv", "shared", "ex"].forEach(k => delete o[k]); return o; };
function pxClean(d){
  const str = (v, n) => typeof v === "string" ? v.slice(0, n) : "", arr = v => Array.isArray(v) ? v.filter(x => typeof x === "string").slice(0, 40) : [], b = PX_BLANK();
  const fail = {}; PX_LAYERS.forEach(L => { fail[L[0]] = arr((d.fail || {})[L[0]]); });
  const tl = (Array.isArray(d.tl) ? d.tl : []).slice(0, 8).map(r => ({k:r && r.k === "more" ? "more" : (r && PX_FIXED.includes(r.k) ? r.k : "more"), t:str(r && r.t, 20), w:str(r && r.w, 140)}));
  PX_FIXED.forEach((k, i) => { if(!tl.some(r => r.k === k)) tl.splice(i, 0, {k, t:"", w:""}); });
  return Object.assign(b, {name:str(d.name, 80), what:str(d.what, 600), area:str(d.area, 20), who:arr(d.who), reach:str(d.reach, 20), detect:str(d.detect, 20), tl,
    worked:arr(d.worked), fail, sev:str(d.sev, 2), duties:arr(d.duties), dutiesSet:!!d.dutiesSet,
    promises:(Array.isArray(d.promises) ? d.promises : []).slice(0, 6).map(p => ({to:str(p && p.to, 20), w:str(p && p.w, 140), by:str(p && p.by, 10)})),
    acts:(Array.isArray(d.acts) ? d.acts : []).slice(0, 3).map(a => ({w:str(a && a.w, 240), owner:str(a && a.owner, 20), by:str(a && a.by, 10), src:str(a && a.src, 40)})), actsSeeded:!!d.actsSeeded, date:str(d.date, 10)});
}
shareRegister("postmortem", d => {
  if(typeof d === "string"){ px = Object.assign(PX_BLANK(), {name:d.replace(/^Post-mortem: /, "").slice(0, 80), shared:true}); pxSave(); return; }
  px = Object.assign(pxClean(d || {}), {view:"report", shared:true}); pxSave();
});
function pxCurStep(){ if(!gdCur || gdCur.k !== "postmortem") return null; const p = gdPos("postmortem"); return gdLive(gdCur)[p.i] || null; }
// After a typed change inside a custom step: keep Continue and the gaps card honest without redrawing (a redraw would drop the cursor)
function pxLive(){
  px.ex = false; pxSave(); const s = pxCurStep(); if(!s || !view.querySelector) return;
  const nb = view.querySelector('[data-gd="next"]'); if(nb) nb.disabled = !s.opt && !gdAnswered(s);
  const a = view.querySelector("#px-aside-gaps"); if(a) a.innerHTML = pxGapsAsideHTML();
}
function pxRedraw(focusSel){
  px.ex = false; pxSave(); if(gdCur && gdCur.k === "postmortem") gdRender(pxSpec());
  const el = focusSel && view.querySelector ? view.querySelector(focusSel) : null; if(el) try{ el.focus(); }catch(e){}
}
function pxAct(a, arg){
  switch(a){
    case "example": px = Object.assign(PX_BLANK(), JSON.parse(JSON.stringify(PX_EXAMPLE))); pxView = null; gdReset("postmortem"); store.set("ws:cur:postmortem", null); pxSave(); renderPostmortem(); window.scrollTo(0, 0); return gsay("Example loaded: Pixelry, after a comment pile-on");
    case "build": px.view = "report"; px.tab = "doc"; px.docv = "team"; px.date = pxDateOf(px); pxSave(); renderPostmortem(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "edit": { px.view = "setup"; pxView = null; pxSave(); const sp = pxSpec(), p = gdPos("postmortem"), i = gdFirstOpen(sp); p.scr = "q"; p.i = i === null ? 0 : i; renderPostmortem(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1")); }
    case "reset": { const snap = JSON.parse(JSON.stringify(px)); px = PX_BLANK(); pxView = null; gdReset("postmortem"); store.set("ws:cur:postmortem", null); pxSave(); renderPostmortem(); window.scrollTo(0, 0);
      withUndo("Cleared", snap, s2 => { px = s2; pxSave(); renderPostmortem(); }); return focusQuiet(document.querySelector("#view h1")); }
    case "save": { const msg = wsSaveTool("postmortem", px, pxTitle(px)); renderPostmortem(); return flashIn($("#px-toast"), msg); }
    case "tracker": return tkOpen("postmortem");
    case "download": { const md = pxDoc(px, "team"); return offerFile(`post-mortem-${slug(px.name || "incident")}.md`, md, md, $("#px-toast")); }
    case "legal": { const md = pxDoc(px, "legal"); return offerFile(`post-mortem-${slug(px.name || "incident")}-legal.md`, md, md, $("#px-toast")); }
    case "slack": return copyText(pxSlack(px), $("#px-toast"));
    case "sharelink": return shareCopy("postmortem", pxShareState(), `Post-mortem: ${px.name || "Untitled incident"}`, $("#px-toast"));
    case "unshare": px.shared = false; pxSave(); return pxAct("save");
    case "tladd": if(px.tl.length < 8) px.tl.push({k:"more", t:"", w:""}); return pxRedraw(`[data-pxtl-w="${px.tl.length - 1}"]`);
    case "tlrm": if(px.tl[+arg] && px.tl[+arg].k === "more") px.tl.splice(+arg, 1); return pxRedraw('[data-px="tladd"]');
    case "pradd": if(px.promises.length < 6) px.promises.push({to:"users", w:"", by:""}); return pxRedraw(`[data-pxpr-w="${px.promises.length - 1}"]`);
    case "prrm": px.promises.splice(+arg, 1); return pxRedraw('[data-px="pradd"]');
    case "actseed": { const snap = JSON.parse(JSON.stringify(px.acts)); px.acts = pxDraftActions(px); px.actsSeeded = true; pxRedraw('[data-px="actseed"]');
      return withUndo("Redrafted", snap, a2 => { px.acts = a2; pxSave(); if(gdCur && gdCur.k === "postmortem") gdRender(pxSpec()); }); }
  }
}
const pxHere = () => hashNow().split("/")[0] === "postmortem";
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-px],[data-pxtab],[data-pxdocv]");
  if(!b || !pxHere() || !view.contains(b)) return;
  const d = b.dataset;
  if(d.pxtab){ px.tab = d.pxtab; pxSave(); renderPostmortem(); const t = document.querySelector(`[data-pxtab="${d.pxtab}"]`); if(t) t.focus(); const dt = document.querySelector(".px-root .ev-details"); if(dt) dt.open = true; return; }
  if(d.pxdocv){ px.docv = d.pxdocv; pxSave(); renderPostmortem(); const t = document.querySelector(`[data-pxdocv="${d.pxdocv}"]`); if(t) t.focus(); const dt = document.querySelector(".px-root .ev-details"); if(dt) dt.open = true; return; }
  if(d.px) pxAct(d.px, d.i);
});
document.addEventListener("input", e => {
  const t = e.target; if(!t || !t.dataset || !pxHere() || !view.contains(t)) return;
  const d = t.dataset;
  if(d.pxtlT !== undefined && px.tl[+d.pxtlT]){ px.tl[+d.pxtlT].t = t.value; return pxLive(); }
  if(d.pxtlW !== undefined && px.tl[+d.pxtlW]){ px.tl[+d.pxtlW].w = t.value.slice(0, 140); return pxLive(); }
  if(d.pxprW !== undefined && px.promises[+d.pxprW]){ px.promises[+d.pxprW].w = t.value.slice(0, 140); return pxLive(); }
  if(d.pxactW !== undefined && px.acts[+d.pxactW]){ px.acts[+d.pxactW].w = t.value.slice(0, 240); return pxLive(); }
});
document.addEventListener("change", e => {
  const t = e.target; if(!t || !t.dataset || !pxHere() || !view.contains(t)) return;
  const d = t.dataset;
  if(d.pxtlT !== undefined && px.tl[+d.pxtlT]){ px.tl[+d.pxtlT].t = t.value; return pxLive(); }
  if(d.pxprTo !== undefined && px.promises[+d.pxprTo]){ px.promises[+d.pxprTo].to = t.value; return pxLive(); }
  if(d.pxprBy !== undefined && px.promises[+d.pxprBy]){ px.promises[+d.pxprBy].by = t.value; return pxLive(); }
  if(d.pxactOwner !== undefined && px.acts[+d.pxactOwner]){ px.acts[+d.pxactOwner].owner = t.value; return pxLive(); }
  if(d.pxactBy !== undefined && px.acts[+d.pxactBy]){ px.acts[+d.pxactBy].by = t.value; return pxLive(); }
});
// Enter in a timeline row moves to the next row's text field (the engine's Enter rule only covers plain text questions)
document.addEventListener("keydown", e => {
  const t = e.target; if(e.key !== "Enter" || !t || !t.dataset || t.dataset.pxtlW === undefined || !pxHere() || !view.contains(t)) return;
  e.preventDefault(); const nx = view.querySelector(`[data-pxtl-w="${+t.dataset.pxtlW + 1}"]`); if(nx) nx.focus();
});
