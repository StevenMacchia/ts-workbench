# Run the classifier eval on an open model

Tests your moderation rule on a free open model, on your own computer. The workbench website has no server, so this is a pair of small scripts: each reads the cases the eval downloads, sends each one to a model with your policy, and writes labels you paste back into the eval to score. There are two:

- **[run.mjs](run.mjs)**, for [gpt-oss-safeguard](https://huggingface.co/openai/gpt-oss-safeguard-20b) and other chat models that follow a written policy and explain themselves.
- **[run_policylm.py](run_policylm.py)**, for Musubi's [PolicyLM-1.7B](https://huggingface.co/musubilabs/policylm-1.7b), which reads your policy and scores it directly, with no chat and no reasoning.

**Which one?** PolicyLM for most people: it's smaller (1.7B parameters, a 3.5 GB download), runs on a laptop CPU or Apple silicon as well as a GPU, and is fast. It scored 0.842 on the model's own custom-policy benchmark, against gpt-oss-safeguard's 0.909. Reach for gpt-oss-safeguard when you have 16 GB of memory to spare and want the model to explain each decision, or need the few extra points of accuracy.

**Status:** run.mjs is new, and text only; tested against a stand-in server, not yet on a live model. run_policylm.py is tested against a stub scorer, and on a live model on 2026-10-06 on an RTX 4080 Super (see "Tested on" below).

## gpt-oss-safeguard (run.mjs)

### Before you start

- **Node.js 18 or newer.** Install the LTS version from [nodejs.org](https://nodejs.org), then check with `node --version`.
- **Ollama.** Install it from [ollama.com](https://ollama.com). On Mac and Windows it runs in the background. Then download the model, about 14 GB:

  ```
  ollama pull gpt-oss-safeguard:20b
  ```

- **A capable computer.** The model fits a graphics card with 16 GB of memory, or a Mac with Apple silicon and 16 GB. Elsewhere it runs, but slowly.

With the default settings nothing leaves your computer.

### The round trip

1. **In the eval**, choose **My own classifier's labels** as the way to run it, and set up or paste your cases. On the cases page, click **Download cases** (`eval-cases-….tsv`) and **Download policy** (`policy-….md`).
2. **Finish the policy.** Open the policy file and fill in or delete every line marked `TODO`, then delete the note at the top: the model reads the whole file. The model only knows what the policy says. It works best with policies of a few hundred words.
3. **Get the script.** Make one folder. Save [run.mjs](https://raw.githubusercontent.com/StevenMacchia/ts-workbench/main/tools/open-model-eval/run.mjs) into it (on Windows, check it didn't save as `run.mjs.txt`), and move your two downloads in.
4. **Open a terminal in that folder.** On Windows, right-click the folder in File Explorer and choose **Open in Terminal**. On a Mac, right-click it in Finder and choose **Services > New Terminal at Folder**.
5. **Try five cases first**, using your two file names:

   ```
   node run.mjs eval-cases-my-rule.tsv policy-my-rule.md --out labels.txt --limit 5
   ```

   You'll see one line per case and a summary. If that works, run it again without `--limit 5`.
6. **Score it.** Open `labels.txt`, copy everything, paste it into the eval's label box and click **Score the labels**. The file's first line names the model, so the eval shows where the labels came from. Cases that failed are listed in the summary and left out of the file; the eval scores the rest.

### If it fails

| The message says | What to do |
|---|---|
| Can't reach a model | Open the Ollama app, then run again. |
| isn't installed | Run `ollama pull gpt-oss-safeguard:20b`. |
| Can't find | You're in the wrong folder, or the file name is different. Check the names and quote any with spaces. |
| 'node' is not recognized | Install Node.js, then open a new terminal. |
| timeout | Run again with `--timeout 300`, or with `--limit` to do fewer at a time. |

### Options

```
--labels binary|three   the eval's label set (worked out from the cases file when it can be)
--endpoint URL          default http://localhost:11434/v1/chat/completions
--model TAG             default gpt-oss-safeguard:20b (or gpt-oss-safeguard:120b on a big machine)
--out FILE              default eval-labels.txt; "-" prints to the screen
--concurrency N         cases in flight at once, default 2
--timeout SEC           per case, default 120
--retries N             extra attempts on errors and timeouts, default 1
--reasoning low|medium|high   how hard the model thinks, default medium
--limit N               only the first N cases, for a quick check
```

vLLM and LM Studio serve the same kind of endpoint as Ollama: pass `--endpoint` and `--model`.

### How it prompts the model

It follows the model's published guidance: the policy is the system message, the case text is the user message, the output instruction is explicit (a one-line JSON object with `label` and `why`), and `Reasoning: <effort>` is set in the system message. The reply is read leniently: JSON, a fenced copy of it, `label: x`, `1`/`0`, or a lone label word all work.

- https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide
- https://huggingface.co/openai/gpt-oss-safeguard-20b
- https://ollama.com/library/gpt-oss-safeguard
- https://github.com/roostorg/model-community

## PolicyLM-1.7B (run_policylm.py)

[PolicyLM-1.7B](https://huggingface.co/musubilabs/policylm-1.7b) (Apache-2.0) is a small model built to read a policy, not to talk. You give it your policy and a message and it returns a score from 0 to 1 for each category, directly, with no chat and no reasoning text. That makes it fast enough for a laptop CPU or a Mac with Apple silicon, as well as any GPU with a few gigabytes free. The download is 3.5 GB.

### Before you start

- **Python 3.10 or newer.** Check with `python --version` (or `python3 --version`).
- **The model's own packages**, in a virtual environment so they don't collide with anything else on your machine:

  ```
  python -m venv .venv
  .venv/bin/pip install "transformers==4.57.6" "torch>=2.5.1" "safetensors>=0.4" "huggingface_hub>=0.34,<1.0"
  ```

  (On Windows, activate with `.venv\Scripts\activate` first, or call `.venv\Scripts\pip.exe` directly. A GPU needs a CUDA build of `torch`; see [pytorch.org](https://pytorch.org/get-started/locally/).)

With no `--model`, the first run downloads `musubilabs/policylm-1.7b` into the normal Hugging Face cache, once.

### The round trip

1. **In the eval**, choose **My own classifier's labels**, and set up or paste your cases. Click **Download cases** (`eval-cases-….tsv`) and **Download policy for PolicyLM** (`policy-….json`).
2. **Finish the policy.** Open the JSON file and fill in or delete every value that starts with `TODO`. A `TODO` field left as-is is treated as blank, with a warning; it won't stop the run, but an empty `not_violation_rule` and `exception_override` give the model less to go on than a filled one. PolicyLM scores direct rules ("Flag messages that…") noticeably higher than a policy pasted in verbatim ("Users must not…"); lead `violation_rule` with the direct version, and keep your original wording after it for the humans who'll read the file later.
3. **Get the script.** Save [run_policylm.py](https://raw.githubusercontent.com/StevenMacchia/ts-workbench/main/tools/open-model-eval/run_policylm.py) into the same folder as your two downloads.
4. **Open a terminal in that folder** (with the virtual environment active) and try five cases first:

   ```
   python run_policylm.py eval-cases-my-rule.tsv policy-my-rule.json --out labels.txt --limit 5
   ```

   The first run downloads the model, so it's slower; after that it's cached. You'll see one line per case and a summary. If that works, run it again without `--limit 5`.
5. **Score it.** Open `labels.txt`, copy everything, paste it into the eval's label box and click **Score the labels**. The file's first line names the model, so the eval shows where the labels came from.

You can try the pipeline with no download at all using `--stub`, which scores with a deterministic keyword stand-in instead of the model — useful for checking your files are shaped right before committing to the 3.5 GB download.

### Options

```
--labels binary|three        the eval's label set (worked out from the cases file when it can be)
--out FILE                   default eval-labels.txt; "-" prints to the screen
--limit N                    only the first N cases, for a quick check
--model REPO_OR_DIR          default musubilabs/policylm-1.7b; a local release folder also works
--device auto|cuda|mps|cpu   default auto
--threshold X                override the policy's "positive" threshold (0 to 1)
--review X                   override the policy's "review" threshold, three-label sets only
--stub                       score with a keyword stand-in instead of the model; no download
```

### If it fails

| The message says | What to do |
|---|---|
| needs Python 3.10 | Install a newer Python, then open a new terminal. |
| missing a package | Run the `pip install` line it prints. |
| Couldn't download | Check your connection and the repo id, or point `--model` at a folder you already downloaded. |
| Can't find | You're in the wrong folder, or the file name is different. Check the names and quote any with spaces. |
| Ran out of GPU memory | Add `--device cpu`. |
| at most 16 categories | PolicyLM scores one policy per call; split yours into two files and run each separately. |

### How scores become labels

PolicyLM returns a score from 0 to 1 for every category in your policy; the script takes the highest one. At or above the policy's `thresholds.positive` (0.335 by default, the model's own precision cutoff), the case gets the positive label (`violates` or `remove`). For a three-label set, a score at or above `thresholds.review` (0.2 by default) but below `positive` gets the middle label (`review`); anything lower gets the last label (`allow`). `--threshold` and `--review` override the policy file's numbers for one run, which is a quick way to trade false positives for false negatives without re-exporting the policy.

The markdown policy file (`policy-….md`, written for gpt-oss-safeguard) works too, as a fallback: the whole file becomes one category, named after its `# Policy:` heading.

### Tested on

- `--stub`, every time: `node src/test-pl.js` in the main repo exercises parsing, the `TODO` handling, both label sets and the markdown fallback with no model and no download.
- A live model on 2026-10-06, on an RTX 4080 Super (16 GB), against the classifier eval's own 24-case harassment example: model load plus all 24 cases in 71 seconds, 23 of 24 right (96%), precision 1.00, recall 0.88, at the model's own "precision" cutoff (0.335) as the policy's threshold. Also confirmed against the model card's own worked example (0.96 / 0.99 and 0.00 / 0.06), to check this script calls the library the same way.
