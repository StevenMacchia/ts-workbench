# Run the classifier eval on an open model

Tests your moderation rule on a free open model that labels content against a policy you write, by default OpenAI's [gpt-oss-safeguard](https://huggingface.co/openai/gpt-oss-safeguard-20b) (Apache-2.0). It runs on your own computer. The workbench website has no server, so this is a small script: it reads the cases the eval downloads, sends each one to the model with your policy, and writes labels you paste back into the eval to score.

**Status:** new, and text only. Tested against a stand-in server, not yet on a live model.

## Before you start

- **Node.js 18 or newer.** Install the LTS version from [nodejs.org](https://nodejs.org), then check with `node --version`.
- **Ollama.** Install it from [ollama.com](https://ollama.com). On Mac and Windows it runs in the background. Then download the model, about 14 GB:

  ```
  ollama pull gpt-oss-safeguard:20b
  ```

- **A capable computer.** The model fits a graphics card with 16 GB of memory, or a Mac with Apple silicon and 16 GB. Elsewhere it runs, but slowly.

With the default settings nothing leaves your computer.

## The round trip

1. **In the eval**, choose **My own classifier's labels** as the way to run it, and set up or paste your cases. On the cases page, click **Download cases** (`eval-cases-….tsv`) and **Download policy** (`policy-….md`).
2. **Finish the policy.** Open the policy file and fill in or delete every line marked `TODO`, then delete the note at the top: the model reads the whole file. The model only knows what the policy says. It works best with policies of a few hundred words.
3. **Get the script.** Make one folder. Save [run.mjs](https://raw.githubusercontent.com/StevenMacchia/ts-workbench/main/tools/open-model-eval/run.mjs) into it (on Windows, check it didn't save as `run.mjs.txt`), and move your two downloads in.
4. **Open a terminal in that folder.** On Windows, right-click the folder in File Explorer and choose **Open in Terminal**. On a Mac, right-click it in Finder and choose **Services > New Terminal at Folder**.
5. **Try five cases first**, using your two file names:

   ```
   node run.mjs eval-cases-my-rule.tsv policy-my-rule.md --out labels.txt --limit 5
   ```

   You'll see one line per case and a summary. If that works, run it again without `--limit 5`.
6. **Score it.** Open `labels.txt`, copy everything, paste it into the eval's label box and click **Score the labels**. Cases that failed are listed in the summary and left out of the file; the eval scores the rest.

## If it fails

| The message says | What to do |
|---|---|
| Can't reach a model | Open the Ollama app, then run again. |
| isn't installed | Run `ollama pull gpt-oss-safeguard:20b`. |
| Can't find | You're in the wrong folder, or the file name is different. Check the names and quote any with spaces. |
| 'node' is not recognized | Install Node.js, then open a new terminal. |
| timeout | Run again with `--timeout 300`, or with `--limit` to do fewer at a time. |

## Options

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

## How it prompts the model

It follows the model's published guidance: the policy is the system message, the case text is the user message, the output instruction is explicit (a one-line JSON object with `label` and `why`), and `Reasoning: <effort>` is set in the system message. The reply is read leniently: JSON, a fenced copy of it, `label: x`, `1`/`0`, or a lone label word all work.

- https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide
- https://huggingface.co/openai/gpt-oss-safeguard-20b
- https://ollama.com/library/gpt-oss-safeguard
- https://github.com/roostorg/model-community
