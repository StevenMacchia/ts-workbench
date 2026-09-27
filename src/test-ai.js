// Renders the three AI assistants and runs each one against a stubbed Claude sampler, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = async function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const keys = Object.keys(AI_TOOLS); eq(keys.join(","), "notice,appeal,transparency", "three tools");
  for(const k of keys){
    const T = AI_TOOLS[k];
    location.hash = "#" + k; store.set("ai:" + k, null); renderAI(k);
    if(T.wip){ if(bad(view.innerHTML)) throw new Error(k + " placeholder has bad values"); eq(/is being rebuilt/.test(view.innerHTML) && !/data-fk=/.test(view.innerHTML), true, k + " shows the under-construction page"); out.push(k + ": under construction page"); continue; }
    if(bad(view.innerHTML)) throw new Error(k + " empty page has bad values");
    eq((view.innerHTML.match(/data-fk=/g)||[]).length >= T.fields.length, true, k + " renders every field");
    eq(/Open in Claude to run|Run it in Claude/.test(view.innerHTML), true, k + " explains AI needs Claude when no sampler");
    // the hand-written example passes the tool's own validator and renders cleanly
    const v = T.valid(JSON.parse(JSON.stringify(T.sample))); if(!v) throw new Error(k + " sample fails validation");
    eq(T.valid({nonsense:true}), null, k + " rejects malformed output"); eq(T.valid(null), null, k + " rejects empty output");
    const p = T.prompt(T.example); eq(p.includes("Return ONLY a JSON object"), true, k + " prompt asks for JSON");
    T.fields.filter(fd => fd.req).forEach(fd => { if(!p.includes(String(T.example[fd.k]).slice(0, 30))) throw new Error(k + " prompt is missing " + fd.k); });
    store.set("ai:" + k, {f:T.example, r:v, ts:Date.now(), sample:true}); renderAI(k);
    if(bad(view.innerHTML)) throw new Error(k + " result has bad values: " + view.innerHTML.match(/.{60}(undefined|NaN|null).{30}/));
    eq(/Example result/.test(view.innerHTML), true, k + " labels the example"); eq(T.md(v, T.example).length > 200, true, k + " markdown export");
    // run with a stubbed sampler that returns the example as if Claude wrote it
    SAMPLER = {json: async (prompt, opts) => { eq(opts.modelTier, "default", "model tier"); return JSON.parse(JSON.stringify(T.sample)); }};
    store.set("ai:" + k, {f:T.example, r:null, ts:0}); renderAI(k); await aiRun(k);
    const st = store.get("ai:" + k); eq(!!st.r && st.sample === false, true, k + " saves a real result"); eq(/Result/.test(view.innerHTML), true, k + " shows the result");
    // failures: declined consent, rate limit, junk output
    SAMPLER = {json: async () => { throw {code:"not_granted"}; }}; AIRUN[k] = {}; await aiRun(k); eq(AIRUN[k].off, true, k + " turns AI off when declined");
    SAMPLER = {json: async () => { throw {code:"rate_limited"}; }}; AIRUN[k] = {}; await aiRun(k); eq(/usage limit/.test(AIRUN[k].err), true, k + " explains rate limit");
    SAMPLER = {json: async () => ({junk:1})}; AIRUN[k] = {}; await aiRun(k); eq(/incomplete/.test(AIRUN[k].err), true, k + " handles junk output");
    // required fields are enforced before calling Claude
    let called = false; SAMPLER = {json: async () => { called = true; return T.sample; }}; AIRUN[k] = {}; store.set("ai:" + k, {f:{}, r:null, ts:0}); renderAI(k); await aiRun(k);
    eq(called, false, k + " doesn't call Claude with required fields empty"); eq(/^Add /.test(AIRUN[k].err), true, k + " asks for required fields");
    SAMPLER = null; AIRUN[k] = {};
    out.push(k + ": " + T.fields.length + " fields, example validates, stubbed run saves a result, declined / rate-limited / junk / empty inputs handled");
  }
  mx = {platform:"social", stage:"2", reg:true, vals:{"Violating-content prevalence":{v:"0.09", t:"0.1", a:"0.15"}}}; eq(/Violating-content prevalence: 0.09%/.test(aiScoreFill()), true, "scorecard numbers feed the transparency drafter");
  renderOverview(); eq((view.innerHTML.match(/class="ov-aic[ "]/g)||[]).length, 3, "overview lists the AI assistants");
  renderAbout(); eq(/Appeal reviewer/.test(view.innerHTML), true, "about page lists the new tools");
  eq(cmdkItems().filter(x => ["Enforcement notice writer","Appeal reviewer","Transparency report drafter"].includes(x.label)).length, 3, "search reaches the new tools");
  out.push("overview, about page, search and scorecard hand-off all include the new tools");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partMAd.js"), rd("partMA.js"), rd("partOV.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
new Function(src)().then(r => console.log(r)).catch(e => { console.error("FAILED:", e.message || e); process.exit(1); });
