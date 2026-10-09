// Accessibility pass: renders every route and checks three things a screen-reader user depends on:
// every button has visible text or an aria-label, every dialog names itself with aria-labelledby,
// and every image has alt text. Run after `node src/build-ws.js` (npm test does this already).
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const stub = `
const mem = {}; const store = {get:(k,d)=> k in mem ? JSON.parse(mem[k]) : d, set(k,v){ mem[k] = JSON.stringify(v); }};
const fake = () => ({ addEventListener(){}, setAttribute(){}, removeAttribute(){}, querySelectorAll(){ return []; }, querySelector(){ return null; }, classList:{ add(){}, remove(){}, toggle(){} }, style:{}, dataset:{}, hidden:true, textContent:"", innerHTML:"", value:"", focus(){} });
const els = {}; const $ = s => (els[s] = els[s] || fake()); const $$ = () => [];
const document = {addEventListener(){}, activeElement:null, getElementById(){ return null; }, querySelector(){ return null; }, documentElement:{ setAttribute(){}, removeAttribute(){} }, body:{appendChild(){}, classList:{add(){}, remove(){}}}, createElement(){ return fake(); }};
const location = {hash:"#overview"}; const window = {scrollTo(){}, addEventListener(){}};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icon = id => '<svg><use href="#i-'+id+'"/></svg>'; const view = {querySelectorAll(){ return []; }}; const copyText = () => {};
const head = (t,d,c,m) => "<h1>"+t+"</h1><p>"+d+"</p>"+(m||"");
const headCompact = (t,c,m) => "<h1>"+t+"</h1><p>"+c+"</p>"+(m||"");
`;
const files = [
  "partT.js", "partD.js", "partE1.js", "partE2.js", "partF1.js", "_F2.js", "partW1.js", "_L.js", "_F3_9.js", "_G.js", "_W9.js",
  "partNav.js", "partH4.js", "partH2.js", "partAbout.js", "partCredits.js", "partPol.js", "partPol2.js", "partAI.js",
  "partMAd.js", "partMA.js", "partCV.js", "partOV.js", "partRC.js", "partPF.js", "partTK.js", "partORG.js", "partJN.js",
  "partNX.js", "partTTF.js", "partTR.js", "partDEMO.js", "partHELP.js", "partTYPE.js", "partGD.js", "partCP.js",
  "partDSA.js", "partEV.js", "partEV2.js", "partEVB.js", "partRX.js", "partLOOP.js", "partPLAN.js", "partREV.js"
];
const src = stub + files.map(rd).join("\n") + `
const routes = [
  ["overview", () => renderOverview()],
  ["tools", () => renderTools()],
  ["workspace", () => renderWorkspace()],
  ["plan", () => renderPlan()],
  ["review", () => renderReview()],
  ["premortem", () => renderPremortem()],
  ["tabletop", () => renderTabletop()],
  ["metrics", () => renderMetrics()],
  ["vendors", () => renderVendors()],
  ["maturity", () => renderMaturity()],
  ["coverage", () => renderCoverage()],
  ["policy", () => renderPolicy()],
  ["coppa", () => renderCoppa()],
  ["dsa", () => renderDsa()],
  ["eval", () => renderEval()],
  ["notice", () => renderAI("notice")],
  ["appeal", () => renderAI("appeal")],
  ["transparency", () => renderAI("transparency")],
  ["about", () => renderAbout()],
  ["roost", () => renderRoost()],
  ["credits", () => renderCredits()]
];
// A second, filled-in pass for the tools with a one-call example, so dynamic grades/badges/report
// markup gets checked too, not just the blank intro screens.
const filled = [
  ["premortem (filled)", () => { pm = fromPreset("teen_social"); renderPremortem(); }],
  ["tabletop (filled)", () => { tt = {s:3, v:"marketplace", step:4, scores:{safety:70,trust:60,reg:65,team:55}, picks:[1,1,1,1], first:[1,0,1,1], retried:[], answered:false}; renderTabletop(); }],
  ["metrics (filled)", () => { mx = {platform:"social", stage:"2", reg:true, have:{}, vals:{}, read:{}, hist:[]}; renderMetrics(); }],
  ["vendors (filled)", () => { vx = JSON.parse(JSON.stringify(DEFAULT_V)); renderVendors(); }],
  ["maturity (filled)", () => { ma = maExample(); renderMaturity(); }],
  ["coverage (filled)", () => { cv = JSON.parse(JSON.stringify(CV_EXAMPLE)); renderCoverage(); }]
];

const buttonViolations = [], imgViolations = [];
let totalButtons = 0, totalImgs = 0;
function scanRoute(name, html){
  if(/undefined|NaN|\\[object Object\\]/.test(html)) throw new Error(name + ": render produced a bad value (undefined/NaN/[object Object])");
  const btnRe = /<button\\b([^>]*)>([\\s\\S]*?)<\\/button>/g;
  let m;
  while((m = btnRe.exec(html))){
    totalButtons++;
    const attrs = m[1], inner = m[2];
    const labelled = /aria-label\\s*=/.test(attrs) || /aria-labelledby\\s*=/.test(attrs);
    const text = inner.replace(/<[^>]*>/g, " ").replace(/&[a-zA-Z#0-9]+;/g, " ").replace(/\\s+/g, "").trim();
    if(!labelled && !text) buttonViolations.push(name + ": " + m[0].slice(0, 90).replace(/\\n/g, " "));
  }
  const imgRe = /<img\\b[^>]*>/g;
  while((m = imgRe.exec(html))){
    totalImgs++;
    if(!/\\balt\\s*=/.test(m[0])) imgViolations.push(name + ": " + m[0]);
  }
}
const rendered = [];
routes.concat(filled).forEach(([name, fn]) => {
  fn();
  scanRoute(name, view.innerHTML);
  rendered.push(name);
});

const fails = [];
if(buttonViolations.length) fails.push(buttonViolations.length + " button(s) with no text and no aria-label:\\n  " + buttonViolations.slice(0, 20).join("\\n  "));
if(imgViolations.length) fails.push(imgViolations.length + " image(s) with no alt:\\n  " + imgViolations.slice(0, 20).join("\\n  "));
if(fails.length) throw new Error(fails.join("\\n"));

return JSON.stringify({routes:rendered.length, buttons:totalButtons, imgs:totalImgs});
`;
const routeResult = JSON.parse(new Function(src)());

// Dialogs: every role="dialog" (declared in markup, or set with setAttribute("role","dialog") in the
// same statement) must also carry aria-labelledby, so assistive tech announces what opened. Checked
// directly against the source files, since dialogs are created on demand rather than rendered by route.
const dialogFiles = ["partShell.html", "partDEMO.js", "partTK.js", "partPF.js", "partJN.js", "partMX.js"];
const dialogViolations = [];
let dialogCount = 0;
dialogFiles.forEach(f => {
  const text = rd(f);
  text.split("\n").forEach((line, i) => {
    const literal = /role="dialog"/.test(line), set = /setAttribute\(\s*["']role["']\s*,\s*["']dialog["']\s*\)/.test(line);
    if(!literal && !set) return;
    dialogCount++;
    if(!/aria-labelledby/.test(line)) dialogViolations.push(f + ":" + (i + 1) + ": " + line.trim().slice(0, 100));
  });
});
if(dialogViolations.length) throw new Error(dialogViolations.length + " dialog(s) with no aria-labelledby:\n  " + dialogViolations.join("\n  "));

console.log("a11y: " + routeResult.routes + " routes rendered, " + routeResult.buttons + " buttons checked (0 unlabeled), " +
  dialogCount + " dialogs checked (all aria-labelledby), " + routeResult.imgs + " images checked (0 missing alt).");
