#!/usr/bin/env python3
"""Runs the classifier eval's cases through Musubi's PolicyLM-1.7B (Apache-2.0), a small open model
that scores each category of a written policy from 0 to 1 and, unlike a chat model, never sees the
text as a conversation: no prompt, no reasoning, just a score. It runs on a laptop CPU, Apple
silicon, or a GPU. See README.md for the round trip; this is PolicyLM's sibling to run.mjs.

    https://huggingface.co/musubilabs/policylm-1.7b
    https://huggingface.co/musubilabs/policylm-1.7b/blob/main/inference/policylm_infer.py

Python 3.10+. Nothing beyond the model's own requirements (inference/requirements.txt: transformers,
torch, safetensors, huggingface_hub) except with --stub, which needs nothing at all.
"""
import json
import os
import re
import sys
import time

LABELS = {"binary": ["violates", "allowed"], "three": ["remove", "review", "allow"]}
DEFAULTS = {
    "model": "musubilabs/policylm-1.7b",
    "device": "auto",
    "out": "eval-labels.txt",
    "limit": 0,
}
POLICY_TOKEN_BUDGET = 1662  # the model card: up to 16 categories and 1,662 policy tokens; policy and
MAX_CATEGORIES = 16         # message share 2,048. We estimate chars/4; the model's own tokenizer is exact.

USAGE = f"""Usage: python run_policylm.py cases.tsv policy.json [options]
  --labels binary|three   the eval's label set (inferred from the TSV when it can be)
  --out FILE              where to write the labels (default {DEFAULTS["out"]}; "-" for stdout)
  --limit N               only the first N cases, for a quick check
  --model REPO_OR_DIR      a Hugging Face repo id or a local release folder (default {DEFAULTS["model"]})
  --device auto|cuda|mps|cpu   where to run it (default {DEFAULTS["device"]})
  --threshold X           override the policy's "positive" threshold (0 to 1)
  --review X              override the policy's "review" threshold, three-label sets only (0 to 1)
  --stub                  score with a deterministic keyword stand-in, no model, no download"""


# ---------- input ----------

def parse_args(argv):
    o = dict(DEFAULTS)
    o["labels"] = None
    o["threshold"] = None
    o["review"] = None
    o["stub"] = False
    pos = []
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ("-h", "--help"):
            return {"help": True}
        if not a.startswith("--"):
            pos.append(a)
            i += 1
            continue
        k = a[2:]
        if k == "stub":
            o["stub"] = True
            i += 1
            continue
        if i + 1 >= len(argv):
            raise ValueError(f"--{k} needs a value")
        v = argv[i + 1]
        i += 2
        if k == "labels":
            if v not in LABELS:
                raise ValueError("--labels must be binary or three")
            o["labels"] = v
        elif k == "limit":
            try:
                o["limit"] = int(v)
            except ValueError:
                raise ValueError("--limit must be a number")
            if o["limit"] < 0:
                raise ValueError("--limit must be a number")
        elif k in ("threshold", "review"):
            try:
                o[k] = float(v)
            except ValueError:
                raise ValueError(f"--{k} must be a number between 0 and 1")
            if not (0 <= o[k] <= 1):
                raise ValueError(f"--{k} must be a number between 0 and 1")
        elif k in ("model", "out", "device"):
            o[k] = v
        else:
            raise ValueError(f"unknown option --{k}")
    if k_device_bad(o["device"]):
        raise ValueError("--device must be auto, cuda, mps or cpu")
    if len(pos) < 2:
        raise ValueError(
            "Give the cases file, then the policy file. "
            "Example: python run_policylm.py eval-cases-my-rule.tsv policy-my-rule.json"
        )
    o["cases"], o["policy"] = pos[0], pos[1]
    return o


def k_device_bad(device):
    return device not in ("auto", "cuda", "mps", "cpu")


# The eval exports "id\tkind\texpected\ttext"; the text is the rest of the line, tabs and all.
def parse_tsv(text):
    lines = [l for l in re.split(r"\r?\n", text) if l.strip()]
    if not lines:
        return []
    head = [s.strip().lower() for s in lines[0].split("\t")]
    has_head = "id" in head and "text" in head

    def col(name, default):
        return head.index(name) if has_head and name in head else default

    ci, ck, ce, ct = col("id", 0), col("kind", 1), col("expected", 2), col("text", 3)
    rows = lines[1:] if has_head else lines
    cases = []
    for l in rows:
        f = l.split("\t")
        get = lambda i: f[i].strip() if i < len(f) else ""
        case_id = get(ci)
        text = "\t".join(f[ct:]) if ct < len(f) else ""
        if not case_id or not text:
            continue
        cases.append({"id": case_id, "kind": get(ck), "expected": get(ce).lower(), "text": text})
    return cases


# Which label set the expected column uses, if it uses one of them.
def infer_labels(cases):
    seen = sorted({c["expected"] for c in cases if c["expected"]})
    if not seen:
        return None
    for kind, labels in LABELS.items():
        if all(l in labels for l in seen):
            return kind
    return None


def warn(message):
    print(f"warning: {message}", file=sys.stderr)


def strip_todo(value, what):
    """A field whose value starts with TODO is treated as empty; one warning per field, not a failure."""
    if value is None:
        return None
    v = str(value).strip()
    if not v:
        return None
    if v[:4].lower() == "todo":
        warn(f'{what} is a TODO; treating it as empty.')
        return None
    return v


def render_category(cat):
    """The string PolicyLM actually reads for one category (Category.render in policylm_infer.py),
    used only to estimate its token cost before we have a tokenizer to ask."""
    lines = [cat["name"]]
    if cat["violation_rule"]:
        lines.append("Violation rule: " + cat["violation_rule"])
    if cat["not_violation_rule"]:
        lines.append("Not a violation rule: " + cat["not_violation_rule"])
    if cat["exception_override"]:
        lines.append("Exception override: " + cat["exception_override"])
    return "\n".join(lines)


def load_policy_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        raise FriendlyError(f"{path} is not valid JSON: {e}")
    fmt = data.get("format")
    if fmt != "ts-workbench-policylm-1":
        warn(f'{path} has format {fmt!r}, not "ts-workbench-policylm-1"; reading it anyway, best-effort.')
    raw_categories = data.get("categories") or []
    if not raw_categories:
        raise FriendlyError(f"{path} has no categories.")
    if len(raw_categories) > MAX_CATEGORIES:
        raise FriendlyError(
            f"PolicyLM scores at most {MAX_CATEGORIES} categories in one policy; {path} has "
            f"{len(raw_categories)}. Split it into two policy files and run each separately."
        )
    categories = []
    for raw in raw_categories:
        name = (raw.get("name") or raw.get("title") or "Category").strip()
        categories.append({
            "name": name,
            "violation_rule": strip_todo(raw.get("violation_rule"), f'{name}: violation_rule'),
            "not_violation_rule": strip_todo(raw.get("not_violation_rule"), f'{name}: not_violation_rule'),
            "exception_override": strip_todo(raw.get("exception_override"), f'{name}: exception_override'),
        })
    thresholds = data.get("thresholds") or {}
    return {
        "name": data.get("name") or "Untitled rule",
        "thresholds": {"positive": thresholds.get("positive", 0.5), "review": thresholds.get("review", 0.25)},
        "categories": categories,
    }


# The markdown policy (policy-*.md from evPolicyDoc, written for prompt-following models) as a
# fallback: the whole file becomes one category named after the "# Policy:" heading.
def load_policy_md(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    lines = text.splitlines()
    name, body_start = "Untitled rule", 0
    for i, l in enumerate(lines):
        s = l.strip()
        if s.startswith("# Policy:"):
            name = s[len("# Policy:"):].strip() or name
            body_start = i + 1
            break
    body_lines = lines[body_start:]
    # Drop the eval's own italic note ("_...fill in every TODO, then delete this note..._"): it is
    # instructions for a human editing the file, not part of the policy.
    body_lines = [l for l in body_lines if not l.strip().startswith("_") or not l.strip().endswith("_")]
    body = "\n".join(body_lines).strip()
    if not body:
        raise FriendlyError(f"{path} has a heading but no policy text under it.")
    return {
        "name": name,
        "thresholds": {"positive": 0.5, "review": 0.25},
        "categories": [{"name": name, "violation_rule": body, "not_violation_rule": None, "exception_override": None}],
    }


def load_policy(path):
    if path.lower().endswith(".md"):
        policy = load_policy_md(path)
    else:
        policy = load_policy_json(path)
    est = sum(len(render_category(c)) for c in policy["categories"]) / 4.0
    if est > POLICY_TOKEN_BUDGET:
        warn(
            f"this policy is roughly {int(est)} tokens (a rough estimate: about 4 characters per "
            f"token); PolicyLM's budget is {POLICY_TOKEN_BUDGET} policy tokens, shared with the "
            "message in a 2,048-token window. Shorten the categories, or split them across runs."
        )
    return policy


class FriendlyError(Exception):
    """Printed as the message alone (no traceback); exits 2."""


# ---------- scoring ----------

def map_label(score, thresholds, kind):
    labels = LABELS[kind]
    if score >= thresholds["positive"]:
        return labels[0]
    if kind == "three" and thresholds.get("review") is not None and score >= thresholds["review"]:
        return labels[1]
    return labels[-1]


_WORD = re.compile(r"[a-z']+")


class StubScorer:
    """A deterministic stand-in for the model: each category's score is how many of its
    violation_rule's words (4+ letters, so "or" and "not" don't count as hits) also appear in the
    message, scaled by 4 so two solid hits already reach the default "positive" threshold (0.5) and
    one reaches "review" (0.25). Lets the whole pipeline run with no download, for src/test-pl.js."""

    def __init__(self, categories):
        self.categories = categories
        self._rule_words = {
            c["name"]: {w for w in _WORD.findall((c["violation_rule"] or "").lower()) if len(w) >= 4}
            for c in categories
        }

    def score(self, text):
        msg_words = {w for w in _WORD.findall(text.lower()) if len(w) >= 4}
        best_name, best_score = self.categories[0]["name"], 0.0
        for c in self.categories:
            rule_words = self._rule_words[c["name"]]
            hits = len(rule_words & msg_words)
            s = min(1.0, hits / 4.0)
            if s > best_score:
                best_score, best_name = s, c["name"]
        return best_name, best_score


class ModelScorer:
    """Wraps a loaded PolicyLM so scoring looks the same as the stub: the name and score of the
    highest-scoring category, via Result.top (CategoryScore.name, .score)."""

    def __init__(self, model, policy):
        self.model = model
        self.policy = policy

    def score(self, text):
        result = self.model.classify(text, self.policy)
        top = result.top
        return top.name, float(top.score)


def pip_line():
    req = os.path.join(os.path.dirname(__file__), "requirements-policylm.txt")
    if os.path.exists(req):
        return f'pip install -r "{req}"'
    return 'pip install "transformers==4.57.6" "torch>=2.5.1" "safetensors>=0.4" "huggingface_hub>=0.34,<1.0"'


def load_model(args):
    if sys.version_info < (3, 10):
        raise FriendlyError(
            f"PolicyLM needs Python 3.10 or newer; this is {sys.version.split()[0]}. "
            "Install a newer Python, then open a new terminal."
        )
    try:
        import torch  # noqa: F401
        import transformers  # noqa: F401
        import huggingface_hub  # noqa: F401
    except ImportError as e:
        raise FriendlyError(
            f"This environment is missing a package PolicyLM needs ({e.name or e}). Install it with:\n"
            f"  {pip_line()}"
        )

    if os.path.isdir(args["model"]):
        snapshot_dir = os.path.abspath(args["model"])
    else:
        from huggingface_hub import snapshot_download
        try:
            snapshot_dir = snapshot_download(repo_id=args["model"])
        except Exception as e:
            raise FriendlyError(
                f"Couldn't download {args['model']} from Hugging Face: {e}\n"
                "Check your connection and that the repo id is right, or pass --model with a local "
                "folder you already downloaded (a full release: model.safetensors, config.json, "
                "threshold_manifest.json, tokenizer/, inference/)."
            )

    inference_dir = os.path.join(snapshot_dir, "inference")
    if not os.path.isdir(inference_dir):
        raise FriendlyError(
            f"{snapshot_dir} doesn't look like a PolicyLM release: no inference/ folder inside it."
        )
    sys.path.insert(0, inference_dir)
    try:
        from policylm_infer import Category, Policy, PolicyLM  # noqa: E402
    except ImportError as e:
        raise FriendlyError(f"Couldn't load the model's own code from {inference_dir}: {e}")

    try:
        model = PolicyLM.from_pretrained(snapshot_dir, device=args["device"], dtype="auto")
    except Exception as e:
        if _is_cuda_oom(e):
            raise FriendlyError(
                "Ran out of GPU memory loading the model. Try --device cpu, or close other "
                "programs using the GPU."
            )
        raise FriendlyError(f"Couldn't load the model from {snapshot_dir}: {e}")

    try:
        policy = Policy([
            Category(c["name"], violation_rule=c["violation_rule"],
                      not_violation_rule=c["not_violation_rule"],
                      exception_override=c["exception_override"])
            for c in args["policy"]["categories"]
        ])
    except Exception as e:
        raise FriendlyError(f"PolicyLM rejected this policy: {e}")
    return ModelScorer(model, policy)


def _is_cuda_oom(e):
    name = type(e).__name__
    return "OutOfMemoryError" in name or "out of memory" in str(e).lower()


# One line the eval's paste box accepts: id, tab, label, tab, why (no tabs or newlines inside).
def format_line(case_id, label, why):
    why = re.sub(r"[\t\r\n]+", " ", why or "").strip()[:160]
    line = f"{case_id}\t{label}\t{why}"
    return line[:-1] if line.endswith("\t") else line


def case_sort_key(case_id):
    m = re.match(r"^[a-zA-Z]*(\d+)$", case_id)
    return (int(m.group(1)), case_id) if m else (float("inf"), case_id)


def run(args, scorer, cases, kind, say):
    results = []
    thresholds = dict(args["policy"]["thresholds"])
    if args["threshold"] is not None:
        thresholds["positive"] = args["threshold"]
    if args["review"] is not None:
        thresholds["review"] = args["review"]
    total = len(cases)
    for i, c in enumerate(cases):
        try:
            name, score = scorer.score(c["text"])
        except FriendlyError:
            raise
        except Exception as e:
            if _is_cuda_oom(e):
                raise FriendlyError(
                    "Ran out of GPU memory scoring a case. Try --device cpu, or close other "
                    "programs using the GPU."
                )
            results.append({"id": c["id"], "label": None, "why": "", "error": str(e)})
            say(i + 1, total, c["id"], None, str(e))
            continue
        label = map_label(score, thresholds, kind)
        why = f"{name} {score:.2f}"
        results.append({"id": c["id"], "label": label, "why": why})
        say(i + 1, total, c["id"], label, None)
    return results


def main(argv):
    try:
        args = parse_args(argv)
    except ValueError as e:
        print(f"{e}\n\n{USAGE}", file=sys.stderr)
        return 2
    if args.get("help"):
        print(USAGE)
        return 0

    for key, label in (("cases", "cases"), ("policy", "policy")):
        if not os.path.exists(args[key]):
            print(f"Can't find {args[key]}. Run this from the file's folder, and quote paths with "
                  "spaces.", file=sys.stderr)
            return 2

    try:
        with open(args["cases"], "r", encoding="utf-8") as f:
            cases = parse_tsv(f.read())
        if not cases:
            raise FriendlyError(f"No cases found in {args['cases']}. The cases file (.tsv) comes first.")
        kind = args["labels"] or infer_labels(cases)
        if not kind:
            raise FriendlyError(
                "can't tell the label set from the expected column; pass --labels binary or --labels three"
            )
        if args["limit"]:
            cases = cases[: args["limit"]]
        args["policy"] = load_policy(args["policy"])
    except FriendlyError as e:
        print(str(e), file=sys.stderr)
        return 2

    try:
        scorer = StubScorer(args["policy"]["categories"]) if args["stub"] else load_model(args)
    except FriendlyError as e:
        print(str(e), file=sys.stderr)
        return 2

    model_label = "a stub keyword scorer (--stub, no model)" if args["stub"] else \
        f"{args['model']} on {getattr(getattr(scorer, 'model', None), 'device', args['device'])}"
    print(f"{model_label}, {len(cases)} cases, labels {LABELS[kind]}", file=sys.stderr)

    t0 = time.time()
    tty = sys.stderr.isatty()

    def say(done, total, case_id, label, error):
        line = f"[{done}/{total}] {case_id} " + (label if label else f"FAILED: {error}")
        if tty:
            sys.stderr.write("\r\x1b[K" + line)
        else:
            print(line, file=sys.stderr)

    try:
        results = run(args, scorer, cases, kind, say)
    except FriendlyError as e:
        if tty:
            sys.stderr.write("\n")
        print(str(e), file=sys.stderr)
        return 2
    if tty:
        sys.stderr.write("\n")

    labeled = sorted((r for r in results if r["label"]), key=lambda r: case_sort_key(r["id"]))
    lines = [format_line(r["id"], r["label"], r["why"]) for r in labeled]
    out = args["out"]
    if out and out != "-":
        with open(out, "w", encoding="utf-8", newline="\n") as f:
            f.write("# source: policylm\n")  # the first line tells the eval which model labeled the cases
            f.write("\n".join(lines) + ("\n" if lines else ""))
    else:
        sys.stdout.write("\n".join(lines) + ("\n" if lines else ""))

    counts = {}
    for r in results:
        if r["label"]:
            counts[r["label"]] = counts.get(r["label"], 0) + 1
    failed = [r["id"] for r in results if not r["label"]]
    summary = (f"{len(lines)} of {len(results)} labeled in {round(time.time() - t0)}s: "
               + ", ".join(f"{l} {counts.get(l, 0)}" for l in LABELS[kind]))
    if failed:
        summary += f". Failed: {', '.join(failed)}"
    print(summary, file=sys.stderr)
    if out != "-":
        print(f"Labels written to {os.path.abspath(out)}. Paste the file into the eval's label box.",
              file=sys.stderr)
    if failed:
        print("Failed cases are left out of the file. Check the errors above, or label them by "
              "hand.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
