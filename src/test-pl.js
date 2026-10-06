// Tests tools/open-model-eval/run_policylm.py's --stub pipeline: TSV parsing, label inference,
// TODO handling, the markdown fallback, threshold mapping (binary and three-label) and the labels
// file format, all without downloading the model. Skips cleanly when no Python 3.10+ is on PATH
// (see src/test-ev.js lines 130-182 for the sibling test of run.mjs, the same tiny eq() style).
const fs = require("fs"), path = require("path"), os = require("os"), { spawnSync } = require("child_process");
const D = path.dirname(__filename), script = path.join(D, "..", "tools", "open-model-eval", "run_policylm.py");
const eq = (a, b, msg) => { if (a !== b) throw new Error(msg + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); };

function findPython() {
  for (const cmd of ["python3", "python", "py"]) {
    let r;
    try { r = spawnSync(cmd, ["--version"], { timeout: 5000, encoding: "utf8" }); } catch (e) { continue; }
    const out = (r.stdout || "") + (r.stderr || ""), m = out.match(/Python (\d+)\.(\d+)/);
    if (r.status === 0 && m && (+m[1] > 3 || (+m[1] === 3 && +m[2] >= 10))) return cmd;
  }
  return null;
}

const PY = findPython();
if (!PY) { console.log("skipped: no python"); process.exit(0); }

const run = args => { const r = spawnSync(PY, [script, ...args], { encoding: "utf8" }); return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" }; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ts-oe-pl-"));
const casesF = path.join(tmp, "cases.tsv"), casesF3 = path.join(tmp, "cases3.tsv"), polF = path.join(tmp, "policy.json"), mdF = path.join(tmp, "policy.md"), bigF = path.join(tmp, "big.json");

// Two cases: "harass" and "worthless" both land in the policy's violation_rule, so the stub's two
// keyword hits (score 1.0) clear even the "remove"/"violates" threshold (0.5); the other case shares
// no words with the rule (score 0).
fs.writeFileSync(casesF, ["id\tkind\texpected\ttext",
  "c1\tclear_violation\tviolates\tyou are worthless, get out, harass harass harass",
  "c2\tclear_allowed\tallowed\thave a nice day friend"].join("\n"));

const policy = {
  format: "ts-workbench-policylm-1", name: "Harassment rule", content: "comments",
  labels: ["violates", "allowed"], thresholds: { positive: 0.5, review: 0.25 },
  categories: [{
    name: "Harassment",
    violation_rule: "Users must not harass, bully, intimidate or call other users worthless.",
    not_violation_rule: "TODO: content that stays within the rule, for example banter or reporting abuse.",
    exception_override: "TODO: exceptions, for example quoting abuse to report it.",
  }],
};
fs.writeFileSync(polF, JSON.stringify(policy, null, 2));

// binary labels, inferred from the TSV; both TODO fields warned about and blanked, not fatal
const r1 = run([casesF, polF, "--stub", "--out", "-"]);
eq(r1.status, 0, "binary stub run exits 0: " + r1.stderr);
const lines1 = r1.stdout.trim().split("\n").filter(Boolean);
eq(lines1.length, 2, "both cases labeled");
eq(lines1.find(l => l.startsWith("c1\t")).split("\t")[1], "violates", "two keyword hits clears the positive threshold");
eq(lines1.find(l => l.startsWith("c2\t")).split("\t")[1], "allowed", "no overlap stays allowed");
eq(/Harassment: not_violation_rule is a TODO/.test(r1.stderr), true, "the TODO field is named in a warning");
eq(/Harassment: exception_override is a TODO/.test(r1.stderr), true, "and the other TODO field too");

// three-label mapping: one hit lands exactly on "review" (0.25), two on "remove" (0.5), none on "allow"
fs.writeFileSync(casesF3, ["id\tkind\texpected\ttext",
  "c1\tclear_violation\tremove\tyou are worthless, get out, harass harass harass",
  "c2\tborderline\treview\tyou are kind of annoying but harass",
  "c3\tclear_allowed\tallow\thave a nice day friend"].join("\n"));
const r2 = run([casesF3, polF, "--labels", "three", "--stub", "--out", "-"]);
eq(r2.status, 0, "three-label stub run exits 0: " + r2.stderr);
const rows2 = Object.fromEntries(r2.stdout.trim().split("\n").filter(Boolean).map(l => { const f = l.split("\t"); return [f[0], f[1]]; }));
eq(rows2.c1, "remove", "two hits: remove"); eq(rows2.c2, "review", "one hit: review"); eq(rows2.c3, "allow", "no hits: allow");

// the markdown policy (policy-*.md from evPolicyDoc) falls back to one category named after the heading
fs.writeFileSync(mdF, ["# Policy: Harassment rule", "", "Users must not harass, bully or intimidate other users.", "Content that is abusive or offensive will be removed."].join("\n"));
const r3 = run([casesF, mdF, "--stub", "--out", "-"]);
eq(r3.status, 0, "markdown fallback exits 0: " + r3.stderr);
eq(r3.stdout.trim().split("\n").filter(Boolean).length, 2, "markdown fallback still labels every case");

// more than 16 categories fails clearly, rather than silently truncating or crashing deep in the model
fs.writeFileSync(bigF, JSON.stringify(Object.assign({}, policy, { categories: Array.from({ length: 17 }, (_, i) => ({ name: "Cat" + i, violation_rule: "x" })) })));
const r4 = run([casesF, bigF, "--stub", "--out", "-"]);
eq(r4.status, 2, "17 categories is a clear failure, not a crash"); eq(/\b16\b/.test(r4.stderr) && /17/.test(r4.stderr), true, "and says the limit and the count");

// --out writes a file in the eval's exact paste format (id, tab, label, tab, why)
const outF = path.join(tmp, "labels.txt");
const r5 = run([casesF, polF, "--stub", "--out", outF]);
eq(r5.status, 0, "writing to a file exits 0: " + r5.stderr);
const writtenAll = fs.readFileSync(outF, "utf8").trim().split("\n"), written = writtenAll.filter(l => l[0] !== "#"); eq(writtenAll[0], "# source: policylm", "the file starts with the source line the eval reads");
eq(written.length, 2, "both cases in the file"); eq(/^c1\tviolates\tHarassment 0\.50$/.test(written[0]), true, "id, label, why: " + written[0]);

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`runner (policylm, stub): ${lines1.length} binary labels, 3 three-label, markdown fallback ok, 17 categories rejected, file output checked`);
