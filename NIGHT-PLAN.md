# Overnight build plan, 2026-10-07 (Steven asleep; cap: stay under 65% weekly Fable; started at 34%)

Worktree: `_wt/ts-workbench-learn`, branch `learn`. Do NOT commit or push (he did not ask). Preview: `preview_start` name `learn`, port 8769 (serves this worktree's docs). Build: `node src/build-ws.js`; tests: `npm test` (tool test is `src/test-rt.js`, three bodies).
Rules: no attack strings, no scripted attack-and-outcome narratives for sensitive harms (a classifier stopped that draft), CSAE hard line, every number says what it counts, one calm card at a time, plain words with the industry term in a tag. Blueprint: `RED-TEAM-STUDIO.md`.

Files so far: partRT.js (tool, plan, drills, findings, exports), partRT2.js (import, provenance, Claude grading, regression stubs, sequence log), partRT3.js (the flow), partRT4.js (module 1), partLearn.js (guides, glossary), partZ14.css (all styles). New modules go in new files partRT5.js… and are appended to build-ws.js body9 after partRT4.js and to all test bodies' file lists.

Order and status (update as each lands):
1. [x] Module 2 Judge: partRT5.js. Bank of 60+ items (grade this / spot the move / fair question), expert grade + reason, sessions of 10 interleaved, misses come back (spaced), per-area breakdown, "your call vs the expert's". Card in the flow after finding1 as an optional branch and on the done card; also `rt.judge` state.
2. [x] Module 6 Show the work: partRT6.js. One-page summary (system-card shape) generated from state, editable; questionnaire answers mapped to sub-questions; "not tested because"; copy/download.
3. [x] Module 3 Plan the week: partRT7.js. Small-team plan: scope half-page drafted from card + areas + attackers, personas (bad actor + well-meaning user), the 20–30 row sheet from moves × aims (descriptions, not prompts), outside tester invite with content warning, stop rules, wellbeing floor, dated. Export.
4. [x] Module 5 Write it up (partRT8.js: actor, cause, expert fix hint in the engineers' finding modal): upgrade rtOpenFinding with the five-part fields and expert write-ups (reuse partRT4 expert text).
5. [x] Module 4 changes (partRT8.js): dev/prod pass on each drill grade; the sheet as the regression checklist.
6. [x] A "What next" hub card (partRT5.js) plus a method card (partRT8.js) after finding1 (Judge / Plan the week / Keep testing / Show the work) so the path is not forced linear; done card lists the artifacts.
7. [x] CLAUDE.md note, memory, final message with what was built and what was not.

## Round 2 (Steven: "work harder and longer; enhance every tool on the site"), started with Fable at 37%
Orchestration: Sonnet agents, each in its own worktree and branch off `learn`, per `AGENT-BRIEF.md`. Merge into `learn` with `git -C ts-workbench merge enh/<name>` from the learn worktree, then `npm test`, then a browser check. Agents never push.
- [ ] audit: read-only audit of every tool → scratchpad `audit-tools.md` with a top-25 list; then launch implementation agents per tool group from that list (names `enh/<tool>`).
- [ ] sandbox (branch `enh/sandbox`): WebLLM local model card in Start here, `partRT9.js`, `partZ15.css`.
- [ ] review (branch `enh/review`): spaced review across days in the judge; `plain` five-step drills in `LN_GUIDES` shown on drill cards.
