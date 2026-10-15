#!/usr/bin/env node
"use strict";
// Reports bytes per source part that build-ws.js puts into docs/index.html, plus raw/gzip size of the output and of docs/parts/*.js.
// Usage: node tools/perf/part-bytes.js            (reads the parts as build-ws.js does, without rebuilding)
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const ROOT = path.resolve(__dirname, "..", "..");
const SRC = path.join(ROOT, "src");
const gz = b => zlib.gzipSync(b, {level: 9}).length;
const kb = n => (n / 1024).toFixed(1).padStart(8) + " KB";
// Which parts does build-ws.js reference? Take every "partX.ext" string literal in order of first appearance.
const bw = fs.readFileSync(path.join(SRC, "build-ws.js"), "utf8");
const seen = []; let m; const re = /"(part[A-Za-z0-9]+\.(?:js|css|html|svg))"/g;
while ((m = re.exec(bw))) if (!seen.includes(m[1])) seen.push(m[1]);
const rows = seen.map(f => { const b = fs.readFileSync(path.join(SRC, f)); return {f, kind: path.extname(f).slice(1), bytes: b.length, gz: gz(b)}; });
const sum = (k) => rows.filter(r => r.kind === k).reduce((a, r) => a + r.bytes, 0);
const byKind = {js: sum("js"), css: sum("css"), html: sum("html"), svg: sum("svg")};
rows.sort((a, b) => b.bytes - a.bytes);
console.log("Per part (largest first), raw and gzip bytes of the source file:");
rows.forEach(r => console.log("  " + r.f.padEnd(20) + kb(r.bytes) + kb(r.gz)));
console.log("\nTotals by kind (raw):", Object.entries(byKind).map(([k, v]) => k + " " + (v / 1024).toFixed(0) + " KB").join(", "));
const out = path.join(ROOT, "docs", "index.html");
if (fs.existsSync(out)) {
  const b = fs.readFileSync(out);
  console.log("\ndocs/index.html raw " + b.length + " bytes (" + (b.length / 1024).toFixed(0) + " KB), gzip " + gz(b) + " bytes (" + (gz(b) / 1024).toFixed(0) + " KB)");
  const s = b.toString("utf8"); let tot = 0, p, r2 = /<script>([\s\S]*?)<\/script>/g;
  while ((p = r2.exec(s))) tot += Buffer.byteLength(p[1]);
  console.log("inline <script> bytes in index.html: " + tot);
}
const pd = path.join(ROOT, "docs", "parts");
if (fs.existsSync(pd)) {
  let r = 0, g = 0;
  fs.readdirSync(pd).filter(f => f.endsWith(".js")).forEach(f => { const b = fs.readFileSync(path.join(pd, f)); r += b.length; g += gz(b); console.log("  docs/parts/" + f.padEnd(14) + kb(b.length) + kb(gz(b))); });
  console.log("docs/parts total raw " + r + ", gzip " + g);
}
