# Icons

Every icon in the workbench is a [Lucide](https://lucide.dev) glyph, version **1.56.0** (`lucide-static`). Nothing is drawn by hand. The sprite (`<symbol id="i-…">`, `p-…`, `c-…` in `src/partC3.html`, `src/partShell.html` and `src/partI3.svg`) is rewritten from the Lucide SVGs by a script, so the path data is Lucide's, byte for byte:

```
npm install lucide-static@latest --no-save --prefix tools/screenshots
node tools/screenshots/apply-lucide.js
```

`icons-map.json` is the single mapping (symbol id to Lucide name). Every symbol uses Lucide's 24x24 viewBox, stroke 2, round caps and joins, fill none, stroke `currentColor`. To change an icon, edit the map and rerun the script; call sites keep using the symbol id. To upgrade Lucide, install the new version, rerun, look at All tools and the sidebar, and update the version here and on the Built with page (`src/partCredits.js`).

## License

Lucide is licensed under the ISC License (Copyright (c) 2026 Lucide Icons and Contributors). Some icons derive from Feather and are under the MIT License (Copyright (c) 2013-present Cole Bemis). Both permit use and redistribution if the notice is kept. The credit is on the Built with page ("Lucide 1.56.0"); the full texts are in `node_modules/lucide-static/LICENSE` and at https://github.com/lucide-icons/lucide/blob/main/LICENSE.

## Mapping

Tools

| Symbol id | Lucide | Used for |
|---|---|---|
| `i-radar` | `shield-alert` | Abuse pre-mortem |
| `i-siren` | `siren` | Incident tabletop |
| `i-gauge` | `gauge` | Metrics framework |
| `i-scale` | `scale` | Vendor scorecard |
| `i-cover` | `radar` | Coverage radar |
| `i-steps` | `trending-up` | Program maturity (no `stairs` icon in Lucide) |
| `i-eval` | `flask-conical` | Classifier eval |
| `i-doc` | `file-check-2` | Policy stress-tester |
| `i-coppa` | `baby` | COPPA readiness |
| `i-route` | `route` | Grooming pathway review |
| `i-flag` | `flag` | Child-safety reporting |
| `i-dsa` | `landmark` | DSA readiness |
| `i-mail` | `mail` | Enforcement notice writer |
| `i-appeal` | `gavel` | Appeal reviewer |
| `i-chart` | `bar-chart-3` | Transparency report |
| `i-shield` | `crosshair` | Red team studio and the LLM guide |
| `i-world` | `globe` | Red teaming world models (new id; was `i-monitor`) |
| `i-book` | `book-open` | Learn, the guides |
| `i-glossary` | `book-a` | Both glossaries (new id; was `i-book`) |
| `i-folder` | `folder` | My workspace |
| `i-plug` | `bird` | Works with ROOST |
| `i-wrench` | `wrench` | Built with (new id; was `i-plug`) |
| `i-info` | `info` | About this project, info |
| `i-chat` | `message-square` | chat |
| `i-bot` | `bot` | assistant |
| `i-logo` | `shield-check` | the brand mark |

Interface

`i-search` search, `i-plus` plus, `i-save` save, `i-download` download, `i-upload` upload, `i-copy` copy, `i-send` send, `i-trash` trash-2, `i-check` check, `i-lock` lock, `i-arrow` arrow-right, `i-chev` chevron-right, `i-menu` menu, `i-x` x, `i-clock` clock, `i-sun` sun, `i-moon` moon, `i-monitor` monitor, `i-layers` layers, `i-home` house, `i-user` user.

Added with the empty-state and option-card pass

| Symbol id | Lucide | Used for |
|---|---|---|
| `i-headset` | `headset` | Red team studio starter: a support assistant |
| `i-act` | `mouse-pointer-click` | Red team studio starter: an agent that acts |
| `i-media` | `clapperboard` | Red team studio starter: an image or video generator |
| `i-inbox` | `inbox` | Empty states (nothing saved, nothing to show) via `emptyMark("inbox")` |
| `i-plan` | `list-checks` | Your plan, empty |
| `i-quarter` | `calendar-range` | Quarter by quarter, empty |
| `i-nomatch` | `search-x` | Glossary searches with no match |

`tileHTML` also takes platform and harm symbols (`p-…`, `c-…`); the template cards use `p-social`, `p-marketplace` and so on. `emptyMark(icon)` (partD.js) is one neutral 36px tile for empty and all-clear states (`check` for good news). `gdFactTile(i, tone)` is the tile in every guided tool's three-up intro row.

Platforms (`p-…`) and harm areas (`c-…`) are in `icons-map.json`; they were hand-drawn before and are Lucide now.

## Not used

No call site needs `triangle-alert` (warn as its own id) yet. The harm-area icon `c-violent` already uses `triangle-alert`. Add an id to `icons-map.json` when a page needs one.
