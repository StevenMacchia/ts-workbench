#!/usr/bin/env node
// Runs the classifier eval's cases through an open policy-following model (gpt-oss-safeguard by default) on a local
// OpenAI-compatible endpoint (Ollama, vLLM, LM Studio) and writes labels the eval pastes straight back.
// Node 18+, no dependencies. See README.md for the round trip.
//
// Prompt format follows the model's own guidance: the policy is the system message, the content is the user message,
// the output instructions are explicit, and "Reasoning: <effort>" sits in the system message.
//   https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide
//   https://huggingface.co/openai/gpt-oss-safeguard-20b
//   https://ollama.com/library/gpt-oss-safeguard
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const LABELS = { binary: ["violates", "allowed"], three: ["remove", "review", "allow"] };
export const DEFAULTS = { endpoint: "http://localhost:11434/v1/chat/completions", model: "gpt-oss-safeguard:20b", out: "eval-labels.txt", concurrency: 2, timeout: 120, retries: 1, reasoning: "medium", limit: 0 };
const USAGE = `Usage: node run.mjs cases.tsv policy.md [options]
  --labels binary|three   the eval's label set (inferred from the TSV when it can be)
  --endpoint URL          OpenAI-compatible chat endpoint (default ${DEFAULTS.endpoint})
  --model TAG             model name at the endpoint (default ${DEFAULTS.model})
  --out FILE              where to write the labels (default ${DEFAULTS.out}; "-" for stdout)
  --concurrency N         cases in flight at once (default ${DEFAULTS.concurrency})
  --timeout SEC           per case, per attempt (default ${DEFAULTS.timeout})
  --retries N             attempts after the first, on errors and timeouts (default ${DEFAULTS.retries})
  --reasoning low|medium|high   the model's reasoning effort (default ${DEFAULTS.reasoning})
  --limit N               only the first N cases, for a quick check`;

/* ---------- input ---------- */
export function parseArgs(argv) {
  const o = Object.assign({}, DEFAULTS), pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { help: true };
    if (!a.startsWith("--")) { pos.push(a); continue; }
    const k = a.slice(2), v = argv[++i];
    if (v === undefined) throw new Error(`--${k} needs a value`);
    if (["concurrency", "timeout", "retries", "limit"].includes(k)) { o[k] = +v; if (!(o[k] >= 0)) throw new Error(`--${k} must be a number`); }
    else if (k === "labels") { if (!LABELS[v]) throw new Error("--labels must be binary or three"); o.labels = v; }
    else if (k === "reasoning") { if (!["low", "medium", "high"].includes(v)) throw new Error("--reasoning must be low, medium or high"); o.reasoning = v; }
    else if (["endpoint", "model", "out"].includes(k)) o[k] = v;
    else throw new Error(`unknown option --${k}`);
  }
  if (pos.length < 2) throw new Error("Give the cases file, then the policy file. Example: node run.mjs eval-cases-my-rule.tsv policy-my-rule.md");
  o.cases = pos[0]; o.policy = pos[1];
  return o;
}
// The eval exports "id\tkind\texpected\ttext"; the text is the rest of the line, tabs and all
export function parseTSV(txt) {
  const lines = String(txt).split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const head = lines[0].split("\t").map(s => s.trim().toLowerCase()), hasHead = head.includes("id") && head.includes("text");
  const col = (n, dflt) => { const i = head.indexOf(n); return hasHead && i >= 0 ? i : dflt; };
  const ci = col("id", 0), ck = col("kind", 1), ce = col("expected", 2), ct = col("text", 3);
  return (hasHead ? lines.slice(1) : lines).map(l => { const f = l.split("\t"); return { id: (f[ci] || "").trim(), kind: (f[ck] || "").trim(), expected: (f[ce] || "").trim().toLowerCase(), text: f.slice(ct).join("\t") }; }).filter(c => c.id && c.text);
}
// Which label set the expected column uses, if it uses one of them
export function inferLabels(cases) {
  const seen = [...new Set(cases.map(c => c.expected).filter(Boolean))];
  if (!seen.length) return null;
  return Object.keys(LABELS).find(k => seen.every(l => LABELS[k].includes(l))) || null;
}

/* ---------- the call ---------- */
export function buildMessages(policy, text, labels, reasoning) {
  const sys = `${String(policy).trim()}

# Output format
Classify the user message under the policy above. Return only a JSON object on one line, nothing else:
{"label": "<one of: ${labels.join(" | ")}>", "why": "<under 15 words>"}

Reasoning: ${reasoning || DEFAULTS.reasoning}`;
  return [{ role: "system", content: sys }, { role: "user", content: String(text) }];
}
// Reads a label out of whatever came back: the JSON asked for, a fenced copy of it, "label: x", 1/0, or a lone label word
export function parseReply(content, labels) {
  let s = String(content || "").replace(/```[a-z]*\n?/gi, "").trim();
  if (!s) return null;
  const pick = x => { x = String(x || "").trim().toLowerCase().replace(/[."'\s]+$/g, ""); return labels.find(l => l === x) || labels.find(l => x.startsWith(l)) || null; };
  const why = x => String(x || "").replace(/\s+/g, " ").trim().slice(0, 160);
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try { const j = JSON.parse(s.slice(a, b + 1)); const l = pick(j.label ?? j.verdict ?? j.decision ?? j.classification); if (l) return { label: l, why: why(j.why ?? j.rationale ?? j.reason ?? j.explanation) }; } catch (e) { }
  }
  const m = s.match(/\b(?:label|verdict|decision|classification)\s*[:=]\s*["'*]*([a-z]+)/i);
  if (m && pick(m[1])) return { label: pick(m[1]), why: why(s.replace(m[0], "").replace(/^[\s.,;:*"'-]+/, "")) };
  if (/^[01]$/.test(s)) return { label: s === "1" ? labels[0] : labels[labels.length - 1], why: "" };
  const found = [...new Set((s.toLowerCase().match(/[a-z]+/g) || []).filter(w => labels.includes(w)))];
  return found.length === 1 ? { label: found[0], why: "" } : null;
}
// One line the eval's paste box accepts: id, tab, label, tab, why (no tabs or newlines inside)
export const formatLine = (id, label, why) => `${id}\t${label}\t${String(why || "").replace(/[\t\r\n]+/g, " ").trim().slice(0, 160)}`.replace(/\t$/, "");

async function post(endpoint, body, timeoutSec) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeoutSec * 1000);
  try {
    const r = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal });
    const txt = await r.text();
    if (r.status === 404) throw Object.assign(new Error(`Model ${body.model} isn't installed, or the address is wrong. To install it, run: ollama pull ${body.model}`), { fatal: true });
    if (!r.ok) throw new Error(`HTTP ${r.status}${txt ? ": " + txt.slice(0, 120).replace(/\s+/g, " ") : ""}`);
    try { return JSON.parse(txt); } catch (e) { throw new Error("not JSON: " + txt.slice(0, 80)); }
  } catch (e) {
    if (e && e.name === "AbortError") throw new Error(`timeout after ${timeoutSec}s`);
    // fetch throws a TypeError when nothing answers at the address: stop the whole run, not just this case
    if (e instanceof TypeError) throw Object.assign(new Error(`Can't reach a model at ${endpoint}. Is Ollama running? Open the Ollama app, then try again.`), { fatal: true });
    throw e;
  } finally { clearTimeout(t); }
}
export async function classify(o, policy, text, labels) {
  const body = { model: o.model, messages: buildMessages(policy, text, labels, o.reasoning), temperature: 0, stream: false };
  let err;
  for (let i = 0; i <= (o.retries || 0); i++) {
    try {
      const j = await post(o.endpoint, body, o.timeout || DEFAULTS.timeout), msg = (j.choices && j.choices[0] && j.choices[0].message) || {};
      const raw = msg.content || "", got = parseReply(raw, labels) || parseReply(msg.reasoning || msg.reasoning_content || "", labels);
      if (!got) throw Object.assign(new Error("no label in reply: " + String(raw || "(empty)").slice(0, 80).replace(/\s+/g, " ")), { final: true });
      return Object.assign(got, { raw });
    } catch (e) { err = e; if (e && (e.final || e.fatal)) break; }
  }
  throw err;
}

/* ---------- the run ---------- */
export async function run(o, onProgress) {
  const say = onProgress || (() => { });
  const labels = LABELS[o.labels] || null, policy = fs.readFileSync(o.policy, "utf8");
  let cases = parseTSV(fs.readFileSync(o.cases, "utf8"));
  if (!cases.length) throw new Error(`No cases found in ${o.cases}. The cases file (.tsv) comes first.`);
  const kind = o.labels || inferLabels(cases);
  if (!kind) throw new Error("can't tell the label set from the expected column; pass --labels binary or --labels three");
  const L = labels || LABELS[kind];
  if (o.limit) cases = cases.slice(0, o.limit);
  const results = new Array(cases.length), order = cases.map((_, i) => i);
  let done = 0, next = 0;
  const flush = () => { const lines = results.filter(r => r && r.label).sort((a, b) => +a.id.slice(1) - +b.id.slice(1) || (a.id < b.id ? -1 : 1)).map(r => formatLine(r.id, r.label, r.why)); if (o.out && o.out !== "-") fs.writeFileSync(o.out, lines.join("\n") + (lines.length ? "\n" : "")); return lines; };
  const worker = async () => {
    while (next < order.length) {
      const i = order[next++], c = cases[i];
      try { const got = await classify(o, policy, c.text, L); results[i] = { id: c.id, label: got.label, why: got.why }; }
      catch (e) { if (e && e.fatal) throw e; results[i] = { id: c.id, label: null, why: "", error: (e && e.message) || String(e) }; }
      done++; flush(); say({ done, total: cases.length, id: c.id, label: results[i].label, error: results[i].error });
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(o.concurrency || 1, cases.length)) }, worker));
  const lines = flush(), failed = results.filter(r => !r.label).map(r => r.id);
  return { kind, labels: L, results, lines, failed };
}

async function main() {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message + "\n\n" + USAGE); process.exit(2); }
  if (o.help) { console.log(USAGE); return; }
  for (const f of [o.cases, o.policy]) if (!fs.existsSync(f)) { console.error(`Can't find ${f}. Run this from the file's folder, and quote paths with spaces.`); process.exit(2); }
  const t0 = Date.now(), tty = process.stderr.isTTY;
  console.error(`${o.model} at ${o.endpoint}, reasoning ${o.reasoning}, ${o.concurrency} at a time`);
  let r;
  try {
    r = await run(o, p => { const line = `[${p.done}/${p.total}] ${p.id} ${p.label || "FAILED: " + p.error}`; if (tty) process.stderr.write("\r\x1b[K" + line); else console.error(line); });
  } catch (e) { console.error("\n" + (e && e.message || e)); process.exit(2); }
  if (tty) process.stderr.write("\n");
  if (o.out === "-") process.stdout.write(r.lines.join("\n") + "\n");
  const count = {}; r.results.forEach(x => { if (x.label) count[x.label] = (count[x.label] || 0) + 1; });
  console.error(`${r.lines.length} of ${r.results.length} labeled in ${Math.round((Date.now() - t0) / 1000)}s: ${r.labels.map(l => `${l} ${count[l] || 0}`).join(", ")}${r.failed.length ? `. Failed: ${r.failed.join(", ")}` : ""}`);
  if (o.out !== "-") console.error(`Labels written to ${path.resolve(o.out)}. Paste the file into the eval's label box.`);
  if (r.failed.length) { console.error("Failed cases are left out of the file. If they timed out, run again with a longer --timeout. Otherwise check the errors above, or label them by hand."); process.exit(1); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
