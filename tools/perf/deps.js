#!/usr/bin/env node
"use strict";
/*
 * Dev-time dependency report for splitting parts into lazy chunks. Not part of the build or the tests.
 *   node --expose-internals tools/perf/deps.js <name>=<partA.js>,<partB.js> [<name>=...]
 * (acorn comes from Node's own internals, hence the flag.) Parses the full bundle script (src/ts-workbench-v9.html, written by the build), finds each
 * top-level binding of the app's single scope, and for each named group of parts reports:
 *   - names the group declares that code OUTSIDE the group references, split by "while the script first runs"
 *     (top level, would break if the group is absent) and "inside a function" (only breaks when that function runs);
 *   - top-level statements of the group that reach into outside bindings (registrations that must exist at startup);
 *   - names the group needs from outside, at its own top level.
 */
const fs = require("fs"), path = require("path");
const acorn = require("internal/deps/acorn/acorn/dist/acorn");
const ROOT = path.resolve(__dirname, "..", "..");
const SRC = path.join(ROOT, "src");
const rd = f => fs.readFileSync(path.join(SRC, f), "utf8");
const html = fs.readFileSync(path.join(ROOT, process.env.PAGE || "src/ts-workbench-v9.html"), "utf8");
const m = /<script>\n\(function\(\)\{/.exec(html);
const start = m.index + "<script>\n".length, end = html.indexOf("\n})();\n</script>", start) + "\n})();".length;
const code = html.slice(start, end);
const groups = {}; process.argv.slice(2).forEach(a => { const [n, l] = a.split("="); groups[n] = l.split(","); });

// ---- locate each part inside the script ----
const loc = []; // {file, a, b}
const allParts = fs.readdirSync(SRC).filter(f => /^part.*\.js$/.test(f));
for(const f of allParts){
  const t = rd(f); let a = code.indexOf(t);
  if(a >= 0) loc.push({file: f, a, b: a + t.length});
}
// partS2 is inserted in two halves around S3..S9
{
  const t = rd("partS2.js"), cut = t.indexOf("// The original three scenarios keep");
  loc.splice(loc.findIndex(x => x.file === "partS2.js"), 1);
  for(const [f, s] of [["partS2.js", t.slice(0, cut)], ["partS2.js", t.slice(cut)]]){ const a = code.indexOf(s); if(a >= 0) loc.push({file: f, a, b: a + s.length}); }
}
loc.sort((x, y) => x.a - y.a);
const partAt = pos => { const l = loc.find(x => pos >= x.a && pos < x.b); return l ? l.file : "(patched core)"; };
const groupOf = file => { for(const g in groups) if(groups[g].includes(file)) return g; return "core"; };
const groupAt = pos => groupOf(partAt(pos));

// ---- parse ----
const ast = acorn.parse(code, {ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true});
const iife = ast.body[0].expression.callee ? ast.body[0].expression.callee : null;
const top = iife.body.body;

function patNames(p, out){
  if(!p) return out;
  switch(p.type){
    case "Identifier": out.push(p.name); break;
    case "ObjectPattern": p.properties.forEach(x => patNames(x.type === "RestElement" ? x.argument : x.value, out)); break;
    case "ArrayPattern": p.elements.forEach(x => patNames(x, out)); break;
    case "AssignmentPattern": patNames(p.left, out); break;
    case "RestElement": patNames(p.argument, out); break;
  }
  return out;
}
// var-hoisted names and function declarations in a function body (not entering nested functions)
function hoistVars(node, out){
  if(!node || typeof node.type !== "string") return;
  switch(node.type){
    case "VariableDeclaration": if(node.kind === "var") node.declarations.forEach(d => patNames(d.id, out)); break;
    case "FunctionDeclaration": case "FunctionExpression": case "ArrowFunctionExpression": return;
  }
  for(const k in node){ const v = node[k]; if(k === "type") continue; if(Array.isArray(v)) v.forEach(x => x && x.type && hoistVars(x, out)); else if(v && typeof v.type === "string") hoistVars(v, out); }
}
// let/const/class (and block functions) declared directly in a statement list
function lexical(stmts, out){
  for(const s of stmts){
    if(s.type === "VariableDeclaration" && s.kind !== "var") s.declarations.forEach(d => patNames(d.id, out));
    else if(s.type === "ClassDeclaration") out.push(s.id.name);
    else if(s.type === "FunctionDeclaration") out.push(s.id.name);
  }
  return out;
}
class Scope { constructor(parent, names, isTop){ this.parent = parent; this.names = new Set(names); this.isTop = !!isTop; } has(n){ return this.names.has(n); }
  find(n){ for(let s = this; s; s = s.parent) if(s.has(n)) return s; return null; } }

const topNames = new Map(); // name -> {kind, pos}
const top0 = [];
top.forEach(s => {
  if(s.type === "FunctionDeclaration") topNames.set(s.id.name, {kind: "function", pos: s.start});
  else if(s.type === "ClassDeclaration") topNames.set(s.id.name, {kind: "class", pos: s.start});
  else if(s.type === "VariableDeclaration") s.declarations.forEach(d => patNames(d.id, []).forEach(n => topNames.set(n, {kind: s.kind, pos: s.start})));
});
const hv = []; top.forEach(s => hoistVars(s, hv)); hv.forEach(n => { if(!topNames.has(n)) topNames.set(n, {kind: "var", pos: 0}); });
const S0 = new Scope(null, [...topNames.keys()], true);

const refs = []; // {name, pos, inFn, write, stmtGroup}
let curTopStmt = null;
function ref(name, pos, scope, inFn, write){
  const s = scope.find(name);
  if(s && s.isTop) refs.push({name, pos, inFn, write, stmt: curTopStmt, encl: curTopStmt && (curTopStmt.id ? curTopStmt.id.name : curTopStmt.declarations ? curTopStmt.declarations.map(d=>d.id.name||"{}").join(",") : curTopStmt.type)});
}
function walkPat(p, scope, inFn, isDecl){
  if(!p) return;
  switch(p.type){
    case "Identifier": if(!isDecl) ref(p.name, p.start, scope, inFn, true); break;
    case "ObjectPattern": p.properties.forEach(x => { if(x.type === "RestElement") walkPat(x.argument, scope, inFn, isDecl); else { if(x.computed) walk(x.key, scope, inFn); walkPat(x.value, scope, inFn, isDecl); } }); break;
    case "ArrayPattern": p.elements.forEach(x => walkPat(x, scope, inFn, isDecl)); break;
    case "AssignmentPattern": walkPat(p.left, scope, inFn, isDecl); walk(p.right, scope, inFn); break;
    case "RestElement": walkPat(p.argument, scope, inFn, isDecl); break;
    case "MemberExpression": walk(p, scope, inFn); break;
  }
}
function fn(node, scope, inFn){
  const names = []; node.params.forEach(p => patNames(p, names));
  if(node.type === "FunctionExpression" && node.id) names.push(node.id.name);
  if(node.type !== "ArrowFunctionExpression") names.push("arguments");
  if(node.body.type === "BlockStatement"){ hoistVars(node.body, names); lexical(node.body.body, names); }
  const s = new Scope(scope, names);
  node.params.forEach(p => walkPat(p, s, true, true));
  if(node.body.type === "BlockStatement") node.body.body.forEach(x => walk(x, s, true)); else walk(node.body, s, true);
}
function walk(node, scope, inFn){
  if(!node || typeof node.type !== "string") return;
  switch(node.type){
    case "Identifier": ref(node.name, node.start, scope, inFn, false); return;
    case "FunctionDeclaration": case "FunctionExpression": case "ArrowFunctionExpression": fn(node, scope, inFn); return;
    case "BlockStatement": { const s = new Scope(scope, lexical(node.body, [])); node.body.forEach(x => walk(x, s, inFn)); return; }
    case "ForStatement": case "ForInStatement": case "ForOfStatement": {
      const init = node.type === "ForStatement" ? node.init : node.left, names = [];
      if(init && init.type === "VariableDeclaration" && init.kind !== "var") init.declarations.forEach(d => patNames(d.id, names));
      const s = new Scope(scope, names);
      if(node.type === "ForStatement"){ walk(node.init, s, inFn); walk(node.test, s, inFn); walk(node.update, s, inFn); }
      else { if(init.type === "VariableDeclaration") walk(init, s, inFn); else walkPat(init, s, inFn, false); walk(node.right, s, inFn); }
      walk(node.body, s, inFn); return; }
    case "CatchClause": { const s = new Scope(scope, patNames(node.param, [])); walk(node.body, s, inFn); return; }
    case "SwitchStatement": { walk(node.discriminant, scope, inFn); const names = []; node.cases.forEach(c => lexical(c.consequent, names)); const s = new Scope(scope, names); node.cases.forEach(c => { walk(c.test, s, inFn); c.consequent.forEach(x => walk(x, s, inFn)); }); return; }
    case "VariableDeclaration": node.declarations.forEach(d => { walkPat(d.id, scope, inFn, true); walk(d.init, scope, inFn); }); return;
    case "ClassDeclaration": case "ClassExpression": walk(node.superClass, scope, inFn); node.body.body.forEach(x => { if(x.computed) walk(x.key, scope, inFn); walk(x.value, scope, inFn); }); return;
    case "MemberExpression": walk(node.object, scope, inFn); if(node.computed) walk(node.property, scope, inFn); return;
    case "Property": if(node.computed) walk(node.key, scope, inFn); if(node.value && node.value.type) { if(node.value.type === "AssignmentPattern" || node.value.type.endsWith("Pattern")) walkPat(node.value, scope, inFn, false); else walk(node.value, scope, inFn); } return;
    case "LabeledStatement": walk(node.body, scope, inFn); return;
    case "BreakStatement": case "ContinueStatement": return;
    case "AssignmentExpression": if(node.left.type === "Identifier") ref(node.left.name, node.left.start, scope, inFn, true); else walkPat(node.left, scope, inFn, false); walk(node.right, scope, inFn); return;
    case "UpdateExpression": if(node.argument.type === "Identifier") ref(node.argument.name, node.argument.start, scope, inFn, true); else walk(node.argument, scope, inFn); return;
    case "TemplateLiteral": node.expressions.forEach(x => walk(x, scope, inFn)); return;
  }
  for(const k in node){ if(k === "type") continue; const v = node[k]; if(Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && walk(x, scope, inFn)); else if(v && typeof v.type === "string") walk(v, scope, inFn); }
}
top.forEach(s => { curTopStmt = s; walk(s, S0, false); });

// ---- report ----
const declGroup = n => groupAt(topNames.get(n).pos);
const report = {};
for(const g of Object.keys(groups)){
  const decls = [...topNames.keys()].filter(n => declGroup(n) === g && topNames.get(n).pos);
  const inbound = {topLevel: {}, inFn: {}}, outbound = {}, sites = [];
  for(const r of refs){
    const rg = groupAt(r.pos), dg = declGroup(r.name);
    if(dg === g && rg !== g){ sites.push(r.name + " <- " + partAt(r.pos) + " in " + r.encl + (r.inFn ? "" : " [STARTUP]") + " :: " + code.slice(Math.max(0, r.pos - 40), r.pos + 50).replace(/\s+/g, " ")); const tgt = r.inFn ? inbound.inFn : inbound.topLevel; (tgt[r.name] = tgt[r.name] || new Set()).add(partAt(r.pos)); }
    if(rg === g && dg !== g && !r.inFn){ (outbound[r.name] = outbound[r.name] || new Set()).add(r.write ? "write" : "read"); }
  }
  // top-level statements in the group that are not plain declarations: calls and assignments that reach outside
  const effects = [];
  for(const s of top){ if(groupAt(s.start) !== g) continue; if(s.type === "FunctionDeclaration" || s.type === "ClassDeclaration") continue;
    if(s.type === "VariableDeclaration") continue;
    effects.push(code.slice(s.start, Math.min(s.end, s.start + 140)).replace(/\s+/g, " ")); }
  report[g] = {parts: groups[g], bytes: groups[g].reduce((a, f) => a + Buffer.byteLength(rd(f)), 0), declared: decls.length,
    inboundTop: Object.fromEntries(Object.entries(inbound.topLevel).map(([k, v]) => [k, [...v]])),
    inboundFn: Object.fromEntries(Object.entries(inbound.inFn).map(([k, v]) => [k, [...v]])),
    outboundTopLevel: Object.fromEntries(Object.entries(outbound).map(([k, v]) => [k, [...v].join("/")])), effects, sites};
}
const out = process.env.OUT || path.join(require("os").tmpdir(), "ts-workbench-deps.json");
fs.writeFileSync(out, JSON.stringify(report, null, 1));
for(const g in report){ const r = report[g];
  console.log("== " + g + ": " + (r.bytes / 1024).toFixed(0) + " KB, " + r.declared + " top-level names, " + Object.keys(r.inboundTop).length + " used at startup by outside code, " + Object.keys(r.inboundFn).length + " used inside outside functions, " + r.effects.length + " top-level effect statements");
}
console.log("report written to " + out);
