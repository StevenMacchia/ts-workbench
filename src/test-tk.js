// Checks "Send to tracker" (tasks, CSV formats, create-issue links) and the profile file round trip, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
// A localStorage the profile code can read, shared with the store stub
const ls = `
const lsMem = {}; const localStorage = { get length(){ return Object.keys(lsMem).length; }, key(i){ return Object.keys(lsMem)[i] || null; },
  getItem(k){ return k in lsMem ? lsMem[k] : null; }, setItem(k, v){ lsMem[k] = String(v); }, removeItem(k){ delete lsMem[k]; } };
store.get = (k, d) => { const v = localStorage.getItem("tswb:" + k); return v ? JSON.parse(v) : d; };
store.set = (k, v) => localStorage.setItem("tswb:" + k, JSON.stringify(v));
let reloaded = 0; location.reload = () => { reloaded++; };
`;
const body = function(){
  const out = [], eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const parse = csv => csv.trim().split("\r\n").map(line => { const cells = []; let cur = "", q = false;
    for(let i = 0; i < line.length; i++){ const c = line[i]; if(q){ if(c === '"' && line[i + 1] === '"'){ cur += '"'; i++; } else if(c === '"') q = false; else cur += c; } else if(c === '"') q = true; else if(c === ","){ cells.push(cur); cur = ""; } else cur += c; }
    cells.push(cur); return cells; });
  // pre-mortem launch plan becomes tasks
  pm = fromPreset("teen_social"); const r = assess(pm), tasks = tkFromPremortem();
  eq(tasks.length, r.safeguards.filter(s => s.rank >= 1).length, "one task per planned safeguard");
  const blocker = tasks.find(t => t.labels.includes("launch-blocker")); eq(!!blocker && blocker.pr === 4 && blocker.def, true, "launch blockers are top priority and preselected");
  eq(tasks.every(t => t.title && /From the abuse pre-mortem/.test(t.desc) && !/undefined|null/.test(t.desc)), true, "descriptions are complete");
  // CSVs survive commas, quotes and line breaks
  const tricky = Object.assign({}, tasks[0], {title:'Say "no", then act', desc:"Line one\nLine two, with a comma"});
  const jira = parse(tkCsvFor("jira", [tricky]));
  eq(jira[0].slice(0, 4).join("|"), "Summary|Description|Issue Type|Priority", "Jira headers");
  const asana = tkCsvFor("asana", tasks), linear = tkCsvFor("linear", tasks);
  eq(asana.startsWith('"Name","Description","Section"'), true, "Asana: Name first, then Description and Section");
  eq(linear.startsWith('"Title","Description","Priority","Status","Labels"'), true, "Linear template columns");
  eq(/"Urgent"/.test(linear) && /"Highest"/.test(tkCsvFor("jira", tasks)), true, "priorities in each tracker's words");
  eq(tkCsvFor("jira", [tricky]).includes('"Say ""no"", then act"'), true, "quotes escaped");
  out.push(`pre-mortem: ${tasks.length} tasks; Jira, Asana and Linear CSVs with the right columns and escaping`);
  // create-issue links need the right settings, and encode everything
  eq(tkLink("jira", tricky), null, "Jira link waits for settings");
  tkCfg.jiraSite = "https://acme.atlassian.net/"; tkCfg.jiraPid = "10000"; tkCfg.jiraType = "10001";
  const jl = tkLink("jira", tricky); eq(jl.startsWith("https://acme.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10000&issuetype=10001&summary="), true, "Jira link shape");
  eq(/%22no%22/.test(jl) && !/[\s"]/.test(jl), true, "Jira link is encoded");
  eq(tkLink("linear", tricky).startsWith("https://linear.new?title="), true, "Linear link"); eq(/priority=High|priority=Urgent/.test(tkLink("linear", blocker)), true, "Linear priority");
  eq(tkLink("github", tricky), null, "GitHub waits for a repository"); tkCfg.ghRepo = "https://github.com/acme/safety/";
  eq(tkLink("github", tricky).startsWith("https://github.com/acme/safety/issues/new?title="), true, "GitHub link");
  out.push("create links: Jira (site, project, type), Linear and GitHub, fully encoded");
  // maturity roadmap becomes tasks
  ma = JSON.parse(JSON.stringify(MA_EXAMPLE)); const mt = tkFromMaturity();
  eq(mt.length, maRoadmap(ma).length * 2, "two tasks per roadmap step"); eq(mt[0].pr, 3, "Now phase is high priority"); eq(/Program maturity: Crisis response, from level 1/.test(mt[0].desc), true, "roadmap context");
  // dialog renders for each tracker
  tk = {src:"test", tasks:mt, sel:{}, opened:{}}; mt.forEach(t => tk.sel[t.id] = true);
  TK_TRACKERS.forEach(T => { tkCfg.tracker = T.k; const h = tkDialogHTML(); if(/undefined|NaN/.test(h)) throw new Error("dialog has bad values for " + T.k);
    eq(/Download CSV/.test(h), T.csv, T.k + " CSV button"); eq(/Create in /.test(h), T.link, T.k + " create buttons"); });
  out.push(`maturity: ${mt.length} tasks; dialog renders for Jira, Asana, Linear and GitHub`);
  // profile file: save everything, then restore it into an empty browser
  store.set("ws:profile", {name:"Alex Rivera"}); pm = fromPreset("marketplace"); pm.example = false; pm.name = "Resale chat"; saveToLib(); store.set("ma", ma);
  const doc = JSON.parse(pfDoc()); eq(doc.kind, "profile", "profile kind"); eq(!!doc.data["ws:items"] && !!doc.data["ma"] && !doc.data["profile:savedAt"], true, "profile holds workspace and maturity");
  eq(/1 saved result/.test(pfSummary(doc)), true, "summary counts results");
  Object.keys(lsMem).forEach(k => delete lsMem[k]);
  let acted = null; pfModal = (html, onAct) => { acted = onAct; };
  pfReview(JSON.stringify(doc), "ts-workbench-profile.json", null); acted("open");
  eq(reloaded, 1, "reloads after opening"); eq(JSON.parse(lsMem["tswb:ws:items"]) && Object.values(JSON.parse(lsMem["tswb:ws:items"])).length, 1, "results restored");
  eq(!!lsMem["tswb:profile:savedAt"], true, "marked as in sync");
  out.push("profile: saves workspace, results and maturity; opening restores them and marks the file in sync");
  return out.join("\n");
};
const src = stub + ls + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partPF.js"), rd("partTK.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
