# Brief for every enhancement agent (T&S Workbench, 2026-10-08)

## Setup, exactly
1. Create your own worktree from the `learn` branch and work only there:
   `git -C C:/Users/swoly_uygf8xn/github-portfolio/ts-workbench worktree add C:/Users/swoly_uygf8xn/github-portfolio/_wt/ts-workbench-<yourname> -b enh/<yourname> learn`
2. Fresh checkouts get CRLF endings and the build script searches for LF markers. Normalise once, from your worktree root:
   `git ls-files -z -- src tools '*.js' '*.md' '*.json' '*.html' '*.css' '*.svg' '*.txt' | xargs -0 sed -i 's/\r$//'` then `git checkout -- .claude/launch.json README.md docs/404.html package.json`
3. Build: `node src/build-ws.js`. Tests: `npm test` (every `src/test-*.js`; all must pass before you finish). The site is one file assembled from `src/part*.js|css|html`; read `CLAUDE.md` in the portfolio root for the map and the gotchas. Only v9 is live; `partH3.js` is dead.
4. Commit on your branch only, with `git -c user.name="Steven Macchia" -c user.email="64022630+StevenMacchia@users.noreply.github.com" commit`. Never push. Never touch `main`, `learn`, or another worktree. Never stash.
5. Report with: the branch name, the files changed, what changed in plain words, test output tail, and anything you could not do.

## Rules that do not bend
- The owner's UX rules: one thing on screen at a time, plain words first with the industry term in a small tag, act within a minute, no dashboards of stat tiles, an example one click away, every number says what it counts (who counted, period, denominator). Light mode first; dark through tokens only (`partZ13.css` is the live theme; add styles in a new `partZ15.css` appended after `partZ14.css` in `build-ws.js`).
- No attack strings, no scripted attack-and-outcome narratives for sensitive harms anywhere. Child sexual abuse is a hard line in every tool.
- Do not regress saved data: every tool persists under `tswb:*` via `store`; keep old shapes readable.
- Do not add external dependencies that load on page open. Anything from a CDN loads only on an explicit click and says so.
- Keep the existing look: `.card`, `.btn`, `.pill`, `.segs`, `.learn`, `.ln-*`, `.rtf-*` classes. Read how `partRT3.js` builds a one-card flow before inventing a new pattern.
- Verify every external link you add with a fetch. Cite nothing you did not check.
