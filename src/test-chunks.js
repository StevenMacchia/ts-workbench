// Checks the public page's split: the main script and each lazy section (docs/parts/*.js) are valid scripts, nothing from the
// full bundle was lost in the split, the loader's table matches the files and their content hashes, every section route is a
// stub that loads the right file, and the counts the All tools page shows before a section loads still match its data.
// Runs after `node src/build-ws.js` (npm test does this already). The suites for the sections' own behaviour (test-rt.js,
// test-tsg.js ...) read the parts directly and are unaffected by the split; tools/perf/smoke.js is the in-browser check.
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8"), docs = f => fs.readFileSync(path.join(D, "..", "docs", f), "utf8");
const eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); };
const ok = (c, msg) => { if(!c) throw new Error(msg); };

const html = docs("index.html"), scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const core = scripts.reduce((a, b) => b.length > a.length ? b : a, "");
ok(core.length > 100000, "the main script was not found in docs/index.html");
ok(!/^\s*\(function\(\)\{/.test(core) && !/\}\)\(\);\s*$/.test(core), "the main script is still wrapped in a function; the sections would not see its bindings");
new vm.Script(core, {filename: "docs/index.html (main script)"});

// The loader's table, read from the built page
const table = JSON.parse(/const LAZY_CHUNKS = (\{.*\});/.exec(core)[1]), routeChunk = JSON.parse(/const LAZY_ROUTE_CHUNK = (\{.*\});/.exec(core)[1]);
const names = Object.keys(table);
ok(names.length >= 3, "expected at least the three sections (tsglossary, learn, redteam)");
const fileText = {};
for(const n of names){
  const m = /^(parts\/[\w-]+\.js)\?v=([0-9a-f]{8})$/.exec(table[n].src);
  ok(m, n + ": src is not parts/<name>.js?v=<hash>: " + table[n].src);
  const text = docs(m[1]); fileText[n] = text;
  eq(crypto.createHash("sha1").update(text).digest("hex").slice(0, 8), m[2], n + ": the ?v= hash does not match the file");
  new vm.Script(text, {filename: m[1]});
  ok(text.trimEnd().endsWith("lazyDone(" + JSON.stringify(n) + ");"), n + ": the file does not end by calling lazyDone");
  (table[n].needs || []).forEach(d => ok(table[d], n + " needs an unknown section " + d));
}
const onDisk = fs.readdirSync(path.join(D, "..", "docs", "parts")).sort();
eq(onDisk.join(","), names.map(n => n + ".js").sort().join(","), "docs/parts holds exactly the sections in the table (no stale files)");

// Every section route is a stub for its section, and the router still has the route
for(const [r, c] of Object.entries(routeChunk)){
  ok(table[c], r + " points at an unknown section " + c);
  ok(core.includes(r + ":lazyRoute(" + JSON.stringify(c) + ","), "ROUTES has no stub for " + r + " -> " + c);
}

// Nothing lost: every top-level declaration in the full bundle is in the main script or a section, and the only extra ones are the loader's.
const full = rd("ts-workbench-v9.html"), fs0 = full.indexOf("<script>\n(function(){"), fullScript = full.slice(fs0, full.indexOf("\n})();\n</script>", fs0));
const decls = t => { const m = new Map(); for(const x of t.matchAll(/^(?:async )?(?:function\*? ?|const |let |class )([\w$]+)/gm)) m.set(x[1], (m.get(x[1]) || 0) + 1); return m; };
const A = decls(fullScript), B = decls(core + "\n" + Object.values(fileText).join("\n"));
const missing = [...A].filter(([k, n]) => (B.get(k) || 0) < n).map(([k]) => k), extra = [...B].filter(([k, n]) => (A.get(k) || 0) < n).map(([k]) => k).sort();
eq(missing.join(","), "", "declarations in the full bundle that are in neither the main script nor a section");
eq(extra.join(","), "LAZY_CHUNKS,LAZY_COUNTS,LAZY_ROUTE_CHUNK,lazyBase,lazyDone,lazyEnsure,lazyInject,lazyLoaded,lazyRoute,lazyView", "declarations only in the split build are exactly the loader's");
// ... and the main script never declares a name a section declares (it would be a redeclaration error in the browser)
const coreDecl = decls(core), dup = names.flatMap(n => [...decls(fileText[n]).keys()]).filter(k => coreDecl.has(k));
eq(dup.join(","), "", "names declared in both the main script and a section");

// The cards the All tools page shows before a section is loaded
const lit = (file, start) => { const t = rd(file), a = t.indexOf(start); ok(a >= 0, file + ": " + start + " not found"); const b = t.indexOf("\n];", a); return new Function("return " + t.slice(a + start.length - 1, b + 3).replace(/;$/, ""))(); };
const counts = new Function("return " + /const LAZY_COUNTS = (\{[^}]*\});/.exec(core)[1].replace(/(\w+):/g, '"$1":'))();
eq(counts.rtAreas, lit("partRT.js", "const RT_AREAS = [").length, "LAZY_COUNTS.rtAreas is the number of harm areas in partRT.js; update partLazy.js");
eq(counts.tsgTerms, lit("partTSG.js", "const TSG_TERMS = [").length, "LAZY_COUNTS.tsgTerms is the number of terms in partTSG.js; update partLazy.js");

const kb = n => (Buffer.byteLength(n) / 1024).toFixed(0) + " KB";
console.log("chunks: main script " + kb(core) + ", sections " + names.map(n => n + " " + kb(fileText[n])).join(", ") + "; all parse, hashes match, " + Object.keys(routeChunk).length + " routes load them, no declaration lost or duplicated, All tools counts match the data");
