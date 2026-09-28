/* =========================================================
   POLICY STRESS-TESTER
   Instant checks run for everyone. Deeper analysis uses Claude on the
   viewer's own account (the artifact `sample` capability), only on click.
   ========================================================= */
let SAMPLER = null;
try{
  if(window.claude && typeof window.claude.use === "function"){
    window.claude.use("sample").then(ns => { SAMPLER = ns; if((location.hash||"").slice(1)==="policy") renderPolicy(); }).catch(()=>{});
  }
}catch(e){}
const POL_BLANK = () => ({rule:"", company:"", look:null, type:"social", product:"", youth:"", regions:["us","eu","uk"], enforce:[], actions:[], concerns:"", depth:"default", heur:null, result:null, ts:null, filter:"all"});
let pol = Object.assign(POL_BLANK(), store.get("pol", null) || {});
let polRun = {busy:false, ctl:null, stage:0, timer:null, err:"", aiOff:false, looking:false};
const savePol = () => store.set("pol", pol);
const POL_ENF = [["reports","User reports"],["humans","Human reviewers"],["auto","Automated detection"],["vendor","Outsourced moderation vendor"],["community","Community moderators"]];
const POL_ACT = [["remove","Remove content"],["label","Warning label or blur"],["limit","Reduce reach"],["warn","Warn the user"],["suspend","Temporary suspension"],["ban","Permanent ban"]];
const POL_EXAMPLES = [
  ["Harassment","Users must not harass, bully or intimidate other users. Content that is abusive or offensive will be removed."],
  ["Hate speech","We do not allow hate speech or content that attacks people based on who they are."],
  ["Scams","Don't post scams, fraudulent offers or misleading content designed to trick people out of money or information."],
  ["Nudity","Nudity and sexual content are not allowed, except in appropriate contexts."],
  ["Dangerous acts","Content that promotes dangerous or harmful activities will be removed."]
];
const POL_FULL_EXAMPLE = {
  rule:"Users must not harass, bully or intimidate other users. Content that is abusive or offensive will be removed.",
  type:"video",
  product:"A live-streaming and chat app for gamers. Streamers broadcast gameplay while viewers chat in real time. Many streamers are teenagers, and banter and trash talk are a big part of the culture.",
  youth:"teens", regions:["us","uk","eu"], enforce:["reports","auto","humans"], actions:["remove","warn","suspend","ban"],
  concerns:"Heated trash talk between rival teams keeps getting reported as harassment. Viewers sometimes coordinate raids on smaller streamers. We're unsure how to treat jokes about a streamer's appearance, and whether repeated one-word insults count."
};
const POL_VAGUE = ["inappropriate","offensive","harmful","objectionable","disrespectful","toxic","abusive","excessive","extreme","graphic","unsafe","misleading","appropriate","reasonable","egregious","severe","disturbing","hateful","sensitive","questionable","bad","negative","upsetting","at our discretion","we may","sometimes","generally"];
const POL_ABS = ["any","all","never","always","zero tolerance","under no circumstances","whatsoever","every"];
const polWords = s => (s||"").trim().split(/\s+/).filter(Boolean).length;

/* ---------- instant checks: a transparent rubric ---------- */
function polHeuristics(text){
  const t = " " + text.toLowerCase().replace(/\s+/g," ") + " ";
  const words = polWords(text);
  const count = w => (t.match(new RegExp("[^a-z]" + w.replace(/ /g,"\\s") + "[^a-z]","g")) || []).length;
  const vague = POL_VAGUE.map(w=>({term:w, n:count(w)})).filter(x=>x.n);
  const absolutes = POL_ABS.filter(w=>count(w));
  const has = re => re.test(t);
  const hasDef = has(/\b(means|defined as|we define|includes|including|such as|refers to)\b/);
  const hasEx = has(/\b(except|unless|exception|newsworth|news|educational|documentary|satire|parody|counter.?speech|artistic|awareness|condemn)/);
  const hasCons = has(/\b(remove|removed|suspend|suspended|ban|banned|warn|warning|strike|restrict|restricted|terminate|disable|label)/);
  const hasEgs = has(/\b(for example|e\.g\.|such as|like|including)\b/);
  const hasAppeal = has(/\b(appeal|review|dispute|contest)/);
  const sentences = text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
  const avg = sentences.length ? Math.round(words / sentences.length) : words;
  let score = 100 - 8*Math.min(vague.length,5) - (hasDef?0:12) - (hasEx?0:12) - (hasCons?0:10) - (hasEgs?0:8) - 5*Math.min(absolutes.length,3) - (avg>28?6:0) - (words<12?10:0);
  score = Math.max(5, Math.min(100, score));
  const f = [];
  f.push(vague.length ? ["warn", `${vague.length} vague term${vague.length===1?"":"s"} reviewers may read differently: ${vague.map(v=>"“"+v.term+"”").join(", ")}.`] : ["ok","No common vague terms found."]);
  f.push(hasDef ? ["ok","Defines what the rule covers."] : ["warn","No definition. Say what counts, for example what harassment means on your platform."]);
  f.push(hasEgs ? ["ok","Gives examples."] : ["warn","No examples. One or two concrete examples make enforcement far more consistent."]);
  f.push(hasEx ? ["ok","Mentions exceptions."] : ["warn","No exceptions. Consider news reporting, education, satire, counter-speech and art."]);
  f.push(hasCons ? ["ok","States what happens when the rule is broken."] : ["warn","No consequence. Say what happens: removal, a warning, reduced reach or suspension."]);
  f.push(hasAppeal ? ["ok","Mentions how to appeal."] : ["info","No appeal route mentioned. Users should know how to challenge a decision."]);
  if(absolutes.length) f.push(["warn", `Sweeping terms (${absolutes.map(a=>"“"+a+"”").join(", ")}) can over-enforce against legitimate content.`]);
  if(avg > 28) f.push(["warn", `Long sentences (about ${avg} words each). Shorter sentences are easier to apply.`]);
  if(words < 12) f.push(["warn","Very short. A one-line rule leaves most decisions to reviewer judgment."]);
  return {score, vague, absolutes, hasDef, hasEx, hasCons, hasEgs, hasAppeal, words, findings:f};
}

/* ---------- context strength ---------- */
function polStrength(){
  const items = [
    [polWords(pol.rule) >= 25, 1, "Paste the full rule, including any definitions and examples you already have", "rule"],
    [polWords(pol.product) >= 15, 2, "Describe your product in a sentence or two: what people do on it and who uses it", "product"],
    [!!pol.youth, 1, "Say whether under-18s can use it", "youth"],
    [pol.regions.length > 0, 1, "Pick the regions you operate in", "regions"],
    [pol.enforce.length > 0, 1, "Say how the rule is enforced", "enforce"],
    [pol.actions.length > 0, 1, "Choose the actions reviewers can take", "actions"],
    [polWords(pol.concerns) >= 10, 2, "Describe the gray areas or incidents that worry you", "concerns"]
  ];
  const got = items.filter(i=>i[0]).reduce((a,i)=>a+i[1],0), max = items.reduce((a,i)=>a+i[1],0);
  const level = got >= 7 ? ["Great","good"] : got >= 4 ? ["Good","high"] : ["Basic","crit"];
  return {got, max, level, missing: items.filter(i=>!i[0]).map(i=>({tip:i[2], field:i[3]}))};
}

/* ---------- the prompt ---------- */
function polPrompt(){
  const lab = (list, keys) => keys.map(k => (list.find(x=>x[0]===k)||[k,k])[1]).join(", ");
  const ctx = [
    ["Company or product", (pol.company || "").trim().slice(0, 80) || "Not provided"],
    ["Platform type", labelOf(PLATFORMS, pol.type) || "Not provided"],
    ["Product description", pol.product.trim() || "Not provided"],
    ["Audience", pol.youth ? labelOf(YOUTH, pol.youth) : "Not provided"],
    ["Regions", pol.regions.map(k=>labelOf(REGIONS,k)).join(", ") || "Not provided"],
    ["How the rule is enforced", pol.enforce.length ? lab(POL_ENF, pol.enforce) : "Not provided"],
    ["Actions reviewers can take", pol.actions.length ? lab(POL_ACT, pol.actions) : "Not provided"],
    ["Known concerns and gray areas from the team", pol.concerns.trim() || "None provided"]
  ].map(([k,v]) => `${k}: ${v}`).join("\n");
  return `You are a senior trust and safety policy lead reviewing a platform rule before it goes live. Stress-test it: find where two reviewers would disagree, what it leaves out, and how it holds up against realistic hard cases on THIS platform.

CONTEXT
${ctx.slice(0, 4000)}

RULE
"""
${pol.rule.slice(0, 6000)}
"""

INSTRUCTIONS
- Base every finding on the rule text and the context. Where context is "Not provided", make a sensible assumption and list it under "assumptions".
- If you recognize the company or product named in the context, use what you know about how that platform works and how people use it to make the hard cases realistic. Don't invent specifics you aren't sure of.
- Edge cases must be realistic for this platform and audience. Turn the team's concerns into edge cases where relevant. Across the set, include at least one case each of news or documentary use, satire or humour, counter-speech, and, if under-18s may be present, a case involving a minor.
- Use "escalate" for cases a reviewer could not decide from the rule text alone.
- Tie enforcement risks to the enforcement methods and actions listed.
- Only include laws that clearly bear on this rule in the listed regions. Say "may" where uncertain. Never invent a law.
- Write in plain English with short sentences, for product managers and policy teams.

Reply with only a JSON object with exactly these keys:
{"score": integer 0-100 for how clear and consistently enforceable the rule is,
 "summary": "one-sentence verdict",
 "strengths": ["what the rule already does well"] (up to 3),
 "vague_terms": [{"term": "...", "why": "why reviewers could disagree", "suggest": "clearer wording"}] (up to 6),
 "gaps": [{"gap": "missing definition, exception, scope, consequence or appeal", "why": "why it matters"}] (up to 6),
 "edge_cases": [{"case": "a realistic piece of content or situation", "decision": "allow" or "remove" or "escalate", "reasoning": "one or two sentences"}] (exactly 8),
 "enforcement_risks": ["..."] (up to 4),
 "legal": [{"law": "law or regulation", "note": "how it bears on this rule"}] (up to 4, empty if none clearly apply),
 "assumptions": ["what you assumed because context was missing"] (up to 4, empty if none),
 "open_questions": ["a policy decision the team still needs to make"] (up to 4),
 "reviewer_checklist": ["a short yes/no check a moderator applies, in order"] (3 to 5),
 "rewrite": "an improved version of the rule in plain language with a definition, examples, exceptions, consequences and how to appeal, under 200 words"}`;
}
const POL_STAGES = ["Reading your rule and context","Looking for words reviewers will read differently","Checking for missing exceptions and consequences","Writing realistic edge cases for your platform","Checking laws in your regions","Drafting a reviewer checklist","Writing a clearer rewrite"];
const POL_ERR = {rate_limited:"You've reached your Claude usage limit for now. Instant checks still work; try the deeper analysis later.", refused:"Claude couldn't analyze this text. Try rephrasing the rule or the context.", invalid_json:"The analysis came back incomplete. Try again, or switch to standard depth.", empty_completion:"The analysis came back empty. Try a shorter rule.", prompt_too_large:"That's too much text to analyze at once. Shorten the rule or the context.", session_expired:"Your Claude session expired. Sign in again to use deeper analysis.", upstream_error:"There was a connection problem. Try again."};
const POL_OFF = ["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"];
function polValid(r){
  if(!r || typeof r!=="object") return null;
  const arr = v => Array.isArray(v) ? v : [], str = v => String(v==null?"":v);
  return {score: Math.max(0, Math.min(100, Math.round(+r.score || 0))), summary: str(r.summary),
    strengths: arr(r.strengths).map(str).filter(Boolean).slice(0,3),
    vague_terms: arr(r.vague_terms).filter(x=>x&&x.term).slice(0,6), gaps: arr(r.gaps).filter(x=>x&&x.gap).slice(0,6),
    edge_cases: arr(r.edge_cases).filter(x=>x&&x.case).slice(0,10).map(x=>({case:str(x.case), decision:["allow","remove","escalate"].includes(str(x.decision).toLowerCase()) ? str(x.decision).toLowerCase() : "escalate", reasoning:str(x.reasoning)})),
    enforcement_risks: arr(r.enforcement_risks).map(str).filter(Boolean).slice(0,4), legal: arr(r.legal).filter(x=>x&&x.law).slice(0,4),
    assumptions: arr(r.assumptions).map(str).filter(Boolean).slice(0,4), open_questions: arr(r.open_questions).map(str).filter(Boolean).slice(0,4),
    reviewer_checklist: arr(r.reviewer_checklist).map(str).filter(Boolean).slice(0,6), rewrite: str(r.rewrite)};
}
function polReadForm(){
  const v = id => { const el = $("#"+id); return el ? el.value : undefined; };
  ["rule","company","product","concerns"].forEach(k => { const x = v("pol-"+k); if(x !== undefined) pol[k] = x; });
}
/* ---------- company lookup: Claude describes a named platform from its own knowledge (it can't browse) ---------- */
function polLookupPrompt(name){
  return `You help a trust and safety team describe their platform before they stress-test a content policy. Using only your own general knowledge (you cannot browse the web), describe the company or product named below: what kind of platform it is and how people use it.

NAME
"""
${name}
"""

Return JSON only, with this shape:
{"known": true or false, "name": "the name as it is usually written", "platform_type": one of ${PLATFORMS.map(p => `"${p.k}" (${p.n})`).join(", ")}, "audience": one of ${YOUTH.map(y => `"${y.k}" (${y.n})`).join(", ")}, or "" if unsure, "regions": the subset of ${REGIONS.map(r => `"${r.k}" (${r.n})`).join(", ")} where it has many users, "description": "two or three plain sentences: what people do on it, who uses it, and the features that matter for safety, such as live video, direct messages, payments, groups or recommendations", "uncertain": "one short sentence on anything you are unsure of or that may have changed recently, or an empty string"}

RULES
- If you don't recognize the name, or it could refer to more than one company, set "known" to false and leave every other field empty. Do not guess.
- Don't state user numbers, dates or other figures unless you are confident of them.
- Plain, neutral language. No marketing tone.`;
}
function polLookupValid(raw){
  if(!raw || typeof raw !== "object") return null;
  const str = (v, n) => typeof v === "string" ? v.trim().slice(0, n) : "";
  const res = {known:raw.known === true, name:str(raw.name, 80),
    platform_type:PLATFORMS.some(p => p.k === raw.platform_type) ? raw.platform_type : "",
    audience:YOUTH.some(y => y.k === raw.audience) ? raw.audience : "",
    regions:Array.isArray(raw.regions) ? REGIONS.map(r => r.k).filter(k => raw.regions.includes(k)) : [],
    description:str(raw.description, 700), uncertain:str(raw.uncertain, 240)};
  if(res.known && !res.description && !res.platform_type) res.known = false;
  return res;
}
async function polLookup(){
  polReadForm(); const name = (pol.company || "").trim().slice(0, 80);
  if(!name){ pol.look = {err:"Type a company or product name first."}; return renderPolicy(); }
  if(!SAMPLER || polRun.aiOff || polRun.looking) return;
  polRun.looking = true; renderPolicy();
  try{
    const res = polLookupValid(await SAMPLER.json(polLookupPrompt(name), {modelTier:"default"}));
    if(!res) throw {code:"invalid_json"};
    if(!res.known) pol.look = {name, known:false};
    else {
      // Keep what was there so Undo puts it back exactly; a description the person wrote stays, after Claude's
      pol.look = {name:res.name || name, known:true, uncertain:res.uncertain, prev:{type:pol.type, youth:pol.youth, regions:pol.regions.slice(), product:pol.product}};
      if(res.platform_type) pol.type = res.platform_type;
      if(res.audience) pol.youth = res.audience;
      if(res.regions.length) pol.regions = res.regions;
      const mine = pol.product.trim();
      if(res.description) pol.product = res.description + (mine && mine !== res.description ? "\n\n" + mine : "");
    }
    savePol();
  }catch(e){
    const code = e && e.code;
    if(POL_OFF.includes(code)){ polRun.aiOff = true; pol.look = null; }
    else if(code !== "cancelled") pol.look = {err:POL_ERR[code] || POL_ERR.upstream_error};
  }finally{
    polRun.looking = false; renderPolicy(); if(typeof focusQuiet === "function" && typeof document !== "undefined" && document.getElementById) focusQuiet(document.getElementById("pol-look"));
  }
}
function polLookUndo(){ const p = pol.look && pol.look.prev; if(!p) return; Object.assign(pol, {type:p.type, youth:p.youth, regions:p.regions, product:p.product}); pol.look = null; savePol(); renderPolicy(); }
function polLookHTML(){
  const l = pol.look; if(!l) return "";
  if(l.err) return `<p class="pol-look err" role="alert">${esc(l.err)}</p>`;
  if(!l.known) return `<div class="banner pol-look"><span>Claude doesn't recognize “${esc(l.name)}”, or it could mean more than one company, so nothing was filled in. Describe your product below instead.</span></div>`;
  return `<div class="banner pol-look ok"><span><strong>Filled in from Claude's knowledge of ${esc(l.name)}.</strong> Check the platform type, audience, regions and description below, and add anything recent.${l.uncertain ? " " + esc(l.uncertain) : ""}</span>${l.prev ? `<button type="button" class="btn sm" id="pol-lookundo">Undo</button>` : ""}</div>`;
}
async function polAnalyze(){
  polReadForm(); pol.rule = pol.rule.trim();
  if(!pol.rule){ polRun.err = "Paste or write a rule first."; return renderPolicy(); }
  pol.heur = polHeuristics(pol.rule); pol.result = null; pol.ts = Date.now(); pol.filter = "all"; polRun.err = "";
  // Running always moves on to the report, which shows the instant checks straight away while Claude works
  pol.view = "report"; pol.rtab = "cases"; savePol();
  const polTop = () => { if(typeof window !== "undefined" && window.scrollTo) window.scrollTo(0, 0); if(typeof focusQuiet === "function" && typeof document !== "undefined" && document.querySelector) focusQuiet(document.querySelector("#view h1")); };
  if(!SAMPLER || polRun.aiOff){ renderPolicy(); polTop(); return; }
  polRun.busy = true; polRun.stage = 0; polRun.ctl = new AbortController(); renderPolicy(); polTop();
  clearInterval(polRun.timer); polRun.timer = setInterval(() => { polRun.stage = Math.min(POL_STAGES.length-1, polRun.stage+1); const s = $("#pol-stage"); if(s) s.textContent = POL_STAGES[polRun.stage] + "…"; }, 5000);
  try{
    const raw = await SAMPLER.json(polPrompt(), {signal: polRun.ctl.signal, modelTier: pol.depth==="deep" ? "complex" : "default"});
    const res = polValid(raw);
    if(!res || !res.edge_cases.length) throw {code:"invalid_json"};
    pol.result = res; pol.ts = Date.now(); savePol();
  }catch(e){
    const code = e && e.code;
    if(POL_OFF.includes(code)){ polRun.aiOff = true; polRun.err = "Deeper analysis isn't available in this view, so here are the instant checks."; }
    else if(code !== "cancelled") polRun.err = POL_ERR[code] || POL_ERR.upstream_error;
  }finally{
    clearInterval(polRun.timer); polRun.busy = false; polRun.ctl = null; renderPolicy();
  }
}
function polMarkdown(){
  const r = pol.result, h = pol.heur, L = [];
  L.push("# Policy stress test", "", "## Rule", "", "> " + pol.rule.replace(/\n/g, "\n> "), "");
  if(pol.company) L.push("**Company:** " + pol.company.trim());
  if(pol.product) L.push("**Product:** " + pol.product);
  L.push(`**Platform:** ${labelOf(PLATFORMS, pol.type)} · **Regions:** ${pol.regions.map(k=>k.toUpperCase()).join(", ") || "not set"}`, "");
  if(h) L.push(`## Instant checks: ${h.score}/100`, ...h.findings.map(([lv,t]) => `- ${lv==="ok"?"✓":"!"} ${t}`), "");
  if(r){
    L.push(`## Claude's review: ${r.score}/100`, "", r.summary, "");
    if(r.strengths.length) L.push("### What works", ...r.strengths.map(s=>"- "+s), "");
    if(r.vague_terms.length) L.push("### Words reviewers will read differently", ...r.vague_terms.map(v=>`- **${v.term}**: ${v.why}${v.suggest?` Try: ${v.suggest}`:""}`), "");
    if(r.gaps.length) L.push("### What the rule forgets", ...r.gaps.map(g=>`- **${g.gap}**: ${g.why||""}`), "");
    L.push("### Edge cases", "", "| Decision | Case | Reasoning |", "|---|---|---|", ...r.edge_cases.map(c=>`| ${c.decision} | ${c.case.replace(/\|/g,"/")} | ${c.reasoning.replace(/\|/g,"/")} |`), "");
    if(r.enforcement_risks.length) L.push("### Enforcement risks", ...r.enforcement_risks.map(s=>"- "+s), "");
    if(r.legal.length) L.push("### Laws that may bear on this rule (not legal advice)", ...r.legal.map(l=>`- **${l.law}**: ${l.note||""}`), "");
    if(r.open_questions.length) L.push("### Open questions for the team", ...r.open_questions.map(s=>"- "+s), "");
    if(r.reviewer_checklist.length) L.push("### Reviewer checklist", ...r.reviewer_checklist.map((s,i)=>`${i+1}. ${s}`), "");
    if(r.assumptions.length) L.push("### Assumptions Claude made", ...r.assumptions.map(s=>"- "+s), "");
    if(r.rewrite) L.push("### Suggested rewrite", "", r.rewrite, "");
  }
  L.push("_Generated with T&S Workbench._");
  return L.join("\n");
}
function polRing(score, size){
  const r = size/2 - 6, C = 2*Math.PI*r, col = score>=75 ? "var(--good)" : score>=50 ? "var(--high)" : "var(--crit)";
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Clarity score ${score} out of 100"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--sunk)" stroke-width="7"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-score/100)).toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="54%" text-anchor="middle" font-size="${size>80?21:15}" font-weight="600" fill="var(--ink)" font-family="var(--mono)">${score}</text></svg>`;
}
const DEC = {allow:["Allow","good"], remove:["Remove","crit"], escalate:["Escalate","high"]};
