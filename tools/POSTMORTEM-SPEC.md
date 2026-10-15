# Build spec: Incident post-mortem

A new T&S Workbench tool. Written 2026-10-14 for a Sonnet agent to build from without further questions. Every open question is marked **DECIDED** with the choice and a one-line reason. Read `C:\Users\swoly_uygf8xn\github-portfolio\CLAUDE.md` first (the workbench section), then this file, then the files this spec names. Work on a branch off `main` in a worktree under `_wt/`, as `AGENT-BRIEF.md` describes. Strip `\r` from `src/*.js` before building if a fresh checkout left CRLF endings.

## 1. The tool in one line

After a real incident, a blameless post-mortem that a founder or safety lead can write in fifteen minutes, producing a one-page document people will read and three actions that get done, each with an owner and a date.

It completes two neighbours: the abuse pre-mortem (`src/partF1.js` to `partF3.js`, before launch) and the incident tabletop (`src/partTT.js`, `partTTF.js`, rehearsal). It follows the post-incident review the handbook teaches in chapter 13, step 7 and the "Post-incident review" template (`ts-handbook/chapters/13-crisis-response.md`): timeline with three timestamps, impact, what worked, what failed in the system (not people), actions with owners and dates, follow-up.

## 2. Names, files, load order

| Thing | Value |
|---|---|
| Route | `postmortem` (path `/ts-workbench/postmortem`, hash `#postmortem`) |
| Name, everywhere | **Incident post-mortem** (canonical in `ROUTE_LABEL`) |
| Source file | `src/partPX.js` (one file, about 600 to 800 lines) |
| Styles | `src/partZ19.css`, declared after `partZ18.css` in `css9` in `src/build-ws.js`. Keep it short: the tool reuses `.gd-*`, `.pol-report`, `.pol-sum`, `.tr-sum`, `.pol-verdict`, `.verdict-row`, `.pk-list.gd-vacts`, `.ev-details`, `.card`, `.pill`, `.banner`, `.segs`, `.tk-*` |
| State variable | `px` (never `pm`, which is the pre-mortem) |
| Function prefix | `px` (`pxSpec`, `pxScore`, `pxActions`, `pxDoc`, `pxSlack`, `pxAct`, `renderPostmortem`, `tkFromPostmortem`) |
| Store key | `tswb:px` (`const pxSave = () => store.set("px", px)`) |
| Workspace kind | `postmortem`, prefix `PX` |
| Intro key | `tswb:intro:postmortem` |
| Tool color | `var(--t-tt)` (same family as the tabletop; under Aurora every `--t-*` is the accent anyway) |
| Tone | `assess` (what the tabletop uses in `TOOL_TONE`) |
| Icon | `doc` (`#i-doc`, the one the policy stress-tester uses) |
| Load order | In `body9` in `src/build-ws.js`, insert `rd("partPX.js")` right after `rd("partDSA.js")`. It needs `partGD.js`, `partTK.js`, `partTTF.js`, `partD.js` and `partORG.js`, all earlier in the list. `partINTRO.js` loads earlier but function declarations are hoisted across the one concatenated script, so the gate works (see section 12) |

**DECIDED** route `postmortem`, not `incident` or `review`: it names the practice, pairs with `premortem`, and `review` is already the quarter-by-quarter page.

## 3. State

```js
const PX_BLANK = () => ({
  name:"", what:"", area:"", who:[], reach:"", detect:"",
  tl:[ {k:"first", t:"", w:""}, {k:"signal", t:"", w:""}, {k:"declared", t:"", w:""}, {k:"contained", t:"", w:""}, {k:"resolved", t:"", w:""} ],
  worked:[], fail:{prevention:[], detection:[], response:[], communication:[]},
  sev:"", duties:[], dutiesSet:false, promises:[], acts:[], actsSeeded:false,
  date:"", view:"setup", tab:"doc", docv:"team", ex:false, shared:false
});
let px = Object.assign(PX_BLANK(), store.get("px", null) || {});
let pxView = null;
```

- `tl`: five fixed rows in the chapter's order (`first` = first related item appeared, `signal` = first internal signal, `declared` = incident declared and triaged, `contained` = containment in place, `resolved` = resolved) plus up to three more rows with `k:"more"`. `t` is a `datetime-local` string (`2026-10-03T23:30`), `w` is what happened, 140 characters max.
- `fail`: per layer, an array of option keys; `["ok"]` means nothing failed there. An empty array means not answered.
- `promises`: `{to, w, by}`; `to` is one of `PX_TO` (below), `by` is a `YYYY-MM-DD` date or empty.
- `acts`: `{w, owner, by, src}`; `src` is the failure key the action was drafted from, or `"you"` when typed. Three rows always exist once seeded (`actsSeeded`); rows with empty `w` are ignored everywhere.
- `date`: the incident's date, derived from the earliest parseable `tl.t` at report time; never asked.
- `view`: `"setup"` or `"report"`. `pxView` mirrors `cpView` in `partCP.js`: `null` means the guided flow draws; the report draws when `px.view === "report"`.
- `ex`: the example is loaded. `shared`: opened from a `?s=` link.

Nothing else is saved. No names of people anywhere in the state: the tool asks for roles, never names.

## 4. The guided flow (`pxSpec()`)

Rendered by `gdRender(pxSpec())` when `px.view !== "report"`, exactly as `partCP.js` and `partTR.js` do. Fifteen steps. Every string below is final copy; keep it unless it breaks a test.

```js
{k:"postmortem", tool:{name:"Incident post-mortem", icon:"doc", color:"var(--t-tt)"},
 intro:{title:"Write the post-mortem people will actually read",
   lead:"Fifteen questions about what happened and how you responded. At the end you get a one-page document in the handbook's shape, a grade for the response (never for the incident), and three actions with an owner and a date each, ready for your tracker.",
   note:"Blameless by design: it asks what in the system failed, never who. Roles, not names.",
   facts:[["About 15 minutes", "Facts and timestamps. Come back any time."], ["The chapter 13 template", "Timeline, impact, what worked, what failed, actions, follow-up."], ["Stays in your browser", "Nothing leaves your device until you download it."]],
   start:"Start"},
 alt:[{n:"See an example", run:() => pxAct("example")}],
 steps, finish:"Write the post-mortem",
 preview:pxPreviewHTML,
 done:() => { pxView = null; pxAct("build"); }}
```

**DECIDED** no "fill everything in on one page" alternative. The timeline and actions steps are custom widgets that would need a second layout; the flow is the product.

### The steps, in order

Each step lists: `id`, `eb` (the chip in the aside), `title`, `why`, kind, options (`k`, `n`, `h`). Text steps save on input through `set`. Single steps advance on pick (the engine's default). Multi steps have a Continue button.

1. **name** · eb "Name" · text, max 80 · "What do you call the incident?" · why: "The title of the document. A plain name people will recognise in a month, not a code name." · placeholder: "For example: The comment pile-on, 3 October"

2. **what** · eb "What happened" · text, rows 4, max 600 · "What happened, in two or three sentences?" · why: "Facts, in the order they happened: what people saw, did or lost. No names of staff; say 'the on-call lead', not who it was." · hint: "Write 'the alert didn't fire', not 'someone missed the alert'. The document stays blameless if the answers do."

3. **area** · eb "Kind of harm" · single · "Which kind of harm was it?" · why: "Ties the incident to the risk in your pre-mortem and your coverage radar." · options: every key of `CATS` (`src/partD.js`), `n` = the display name, in this order: harass, child, sexual, fraud, fincrime, security, violent, selfharm, privacy, physical, integrity, illegal, ai, readiness. Fourteen options: the engine shows number keys for the first nine and the footer says "Pick the closest".

4. **who** · eb "Who it affected" · multi · "Who did it affect?" · why: "Impact is who, how many and for how long. This is the who." · options:
   - `users` "People using the product"
   - `one` "One person or account, targeted" · h "A creator, a streamer, a seller: someone named or singled out"
   - `minors` "Children or teens" · h "Under-18s among the people affected"
   - `staff` "Our own team or reviewers" · h "Exposure to harmful material, threats, overload"
   - `partners` "Partners, advertisers or sellers"
   - `public` "People outside the product" · h "A school, a family, the public, another platform"

5. **reach** · eb "How many" · single · "How many people did it reach?" · why: "Count the people who saw it or were exposed, not the accounts that did it. If you don't know, say so: finding out becomes an action." · options:
   - `few` "Fewer than 10"
   - `hundreds` "Tens to hundreds"
   - `thousands` "Thousands"
   - `many` "Tens of thousands or more"
   - `unknown` "We don't know yet" · h "Honest. The document will say so and an action will find out."

6. **detect** · eb "First signal" · single · "How did you first find out?" · why: "Where the first signal came from says more about your detection than any dashboard." · options:
   - `alert` "An alert or a rate monitor fired"
   - `staff` "Someone on the team noticed"
   - `reports` "User reports" · h "A spike in the queue, or one report that stood out"
   - `victim` "The person affected contacted us"
   - `press` "A journalist, a partner or a regulator told us"
   - `public` "Users were posting about it before we knew"

7. **timeline** · eb "Timeline" · custom · "When did each of these happen?" · why: "Five moments the handbook asks for, in order. The gap between the first signal and the declaration is usually the fastest one to fix." · `html()` draws `pxTimelineHTML()`: one row per `tl` entry with a label, a `datetime-local` input (`data-pxtl-t="<i>"`), a text input for what happened (`data-pxtl-w="<i>"`, placeholder per row below), and for `more` rows a remove button. Under the five, a button "Add a moment" (`data-px="tladd"`, hidden once there are eight rows). Row labels and placeholders:
   - first: "First related item appeared" · placeholder "The video was posted; the first abusive comments"
   - signal: "First internal signal" · "A report spike, an alert, an analyst's note"
   - declared: "Incident declared and triaged" · "Who declared it and at what level"
   - contained: "Containment in place" · "What lever was pulled"
   - resolved: "Resolved" · "When the harm stopped, or the last organising account was actioned"
   - more: "Another moment" · "A statement went out; the regulator was notified"
   `answered()`: at least five rows have `w` text. Times are optional, but a note under the rows says "Add times to the five rows and the report shows the gaps." Enter in a row's text input moves to the next row (handle in `bind`, not through the engine's Enter rule, which only applies to `kind:"text"`).

8. **worked** · eb "What worked" · multi with `none:"Nothing went well"` · "What worked?" · why: "Levers, people and processes that helped. These go in the document so they survive the next reorg." · options:
   - `lever` "A lever we could pull in minutes" · h "Search, hashtags, rate limits, a feature switched off in that one place"
   - `oncall` "The on-call phone rang and someone picked up"
   - `lead` "One person led and everyone knew it"
   - `scribe` "Someone kept the timeline as it happened"
   - `preserve` "We kept the evidence before anything was deleted"
   - `holding` "A holding statement went out quickly"
   - `queues` "The highest-severity queues stayed staffed"
   - `partner` "Another platform or a partner helped"

9. to 12. **Four layer steps**, ids `prevention`, `detection`, `response`, `communication`. eb "Prevention" / "Detection" / "Response" / "Communication". multi with `none:"Nothing failed here"` (set `fail[layer] = ["ok"]`; `noneOn: () => fail[layer][0] === "ok"`). why on each: "What in the system failed, not who. Pick everything that was true."
   - **prevention** · "What failed in prevention?"
     - `no_rule` "No rule or default covered it"
     - `unapplied` "A rule existed and wasn't applied"
     - `new_accounts` "New accounts could do too much, too soon"
     - `feature` "A feature made it easy" · h "Sharing, discovery, recommendations, a hashtag"
     - `known` "We knew the risk and hadn't built the safeguard" · h "It was in a pre-mortem or a risk assessment"
   - **detection** · "What failed in detection?"
     - `no_alert` "No alert fires for this kind of harm"
     - `late_alert` "The alert fired late, or at the wrong threshold"
     - `queue` "Reports came in and sat in a queue"
     - `volume` "We watched volume, not rate" · h "A category's rate climbed while volume looked normal"
     - `outside` "We learned of it from outside" · h "Press, a partner, a regulator, or users posting about it"
   - **response** · "What failed in the response?"
     - `no_lead` "Nobody was in charge for the first hour"
     - `late` "Declared late, so hours passed before anyone led"
     - `no_lever` "No lever to pull quickly" · h "Containment needed an engineer and a deploy"
     - `over` "We over-removed and had to walk it back" · h "News reports and warnings went too"
     - `queues` "We pulled people off the highest-severity queues"
     - `evidence` "Evidence was lost before it was kept"
   - **communication** · "What failed in communication?"
     - `internal` "Inside the company, people learned late or from rumour"
     - `holding` "No holding statement, so 'no comment' became the story"
     - `overclaimed` "We said something enforcement couldn't back up"
     - `affected` "The people affected heard after the press did"
     - `deadline` "A notification deadline was missed, or nearly"
     - `blamed` "A front-line person was named as the cause"

13. **sev** · eb "Severity" · single · "How severe was it, on the tabletop's scale?" · why: "The same three levels as the incident tabletop and chapter 13. The grade does not depend on this; it is for the document and for sorting the tracker." · options:
   - `1` "Sev 1" · h "Serious harm to people was happening or imminent, or harm was spreading faster than you could contain it"
   - `2` "Sev 2" · h "Serious harm or a serious failure, with hours or days to respond"
   - `3` "Sev 3" · h "A known risk with a deadline that needed a coordinated plan"

14. **duties** · eb "Laws and duties" · multi with `none:"None that we know of"` · "Which laws or duties did it touch?" · why: "The same obligation list as the abuse pre-mortem, for the regions in your workspace profile. Legal confirms; you record." · options: built at render time from `OBL` (`src/partE2.js`): take the regions from `orgGet().regions` (falling back to `["us", "eu", "uk"]` when empty), filter `OBL` to `o => regions.includes(o.r)`, dedupe on `o.law`, `k` = `o.r + ":" + o.law`, `n` = `o.law`, `h` = the region's display name from `REGIONS` (`src/partD.js`). Order: by region in the order of `regions`, then as listed in `OBL`. Save the keys. `has()` returns `px.dutiesSet`; picking "None" sets `duties = []` and `dutiesSet = true`.

15. **promises** · eb "Promises" · custom, `opt:true`, next "Continue" · "What did you promise, and to whom?" · why: "Every promise made during an incident is an action with a date. Write them down before they are forgotten." · `html()` draws `pxPromisesHTML()`: up to six rows, each a select (`data-pxpr-to`) over `PX_TO`, a text input (`data-pxpr-w`, max 140, placeholder "An update on what changed; a direct reply; a report"), a date input (`data-pxpr-by`), and a remove button; an "Add a promise" button (`data-px="pradd"`). `has()`: any row with `w` text.
    `PX_TO = [["users", "Users"], ["affected", "The people affected"], ["press", "Press"], ["regulator", "A regulator"], ["partners", "Partners or sellers"], ["leadership", "Leadership"], ["team", "The team"]]`.

16. **actions** · eb "Actions" · custom · "Three changes, each with an owner and a date" · why: "Drafted from what failed. Edit the words, pick who owns each one and when it is due. A review that ends with 'be more careful' changes nothing." · `html()` draws `pxActionsHTML()`: on first render (or whenever `actsSeeded` is false), seed `px.acts` with `pxDraftActions()` (section 6) and set `actsSeeded = true`. Three rows: a textarea (`data-pxact-w`, rows 2, max 240), an owner select (`data-pxact-owner`) over `PX_OWNERS`, a date input (`data-pxact-by`), and a "Redraft from my answers" button (`data-px="actseed"`) that reseeds all three (with `withUndo("Redrafted", snapshot, restore)`). `answered()`: at least one row has `w` text and an owner. `next` is the engine's finish label.
    `PX_OWNERS = Object.entries(OWNERS).map(([k, n]) => [k, n]).concat([["comms", "Comms"], ["lead", "Incident lead"], ["exec", "Executive sponsor"]])` (`OWNERS` is in `src/partD.js`: Product, Engineering, T&S Ops, Policy, Legal & Compliance).

The step array has sixteen entries (steps 9 to 12 are the four layers; `promises` is the one optional step), so the strip reads "Question n of 16". **DECIDED** the copy still says "Fifteen questions": the fifteen required ones are what the visitor commits to, and the optional one costs nothing to pass. No test counts the copy; `gdLive(pxSpec()).length === 16` is what the test checks.

### Aside (`spec.aside`)

Optional. Once the five timeline rows have parseable times, show a small card: "Signal to declared: 2h 40m · Declared to contained: 30m". Use `pxGaps()` (section 5). Omit the card when gaps cannot be computed.

## 5. Scoring and the verdict

The grade is for the response. Severity and reach never enter it. Two post-mortems with the same answers and different severities score the same (tested).

`pxScore(d)` returns `{score, grade, parts:[{k, n, got, max, why}], gaps}`.

| Part | Max | Rule |
|---|---|---|
| First signal | 20 | `detect`: alert 20, staff 16, reports 12, victim 10, press 4, public 2 |
| Signal to declaration | 20 | From `pxGaps().signalToDeclared` in minutes: at most 30 → 20; at most 120 → 15; at most 240 → 10; at most 480 → 6; at most 1440 → 3; more → 0. Not computable (missing or unparseable times, or declared before signal) → 8, and the Details say "Add times to score this" |
| Four layers | 40 | Each layer starts at 10. `["ok"]` keeps 10. Each failure picked takes 4 off, floor 0. Unanswered counts as 0 |
| What worked | 10 | 2 per item, cap 10. "Nothing went well" is 0 |
| Honest record | 10 | 5 if all five fixed timeline rows have text; 3 if `reach !== "unknown"`; 2 if at least one promise has a date |

`score` is the sum, `grade = gradeOf(score)` (`src/partD.js`: A 90, B 75, C 60, D 45, else F).

`pxGaps(d)` parses `tl` times with `new Date(t)`; returns minutes between consecutive fixed rows (`firstToSignal`, `signalToDeclared`, `declaredToContained`, `containedToResolved`) or `null` for any pair that does not parse or runs backwards; `pxMins(n)` formats `160` as "2h 40m", `25` as "25m", `1500` as "1d 1h".

### The verdict sentence

One `<h2 class="pol-verdict">`, with `gradeBadge(score, "The response, scored out of 100. Never the incident.")` beside it in a `.verdict-row`:

`${name}: Sev ${sev}, ${reachWords}, first seen ${detectWords}. The response scores ${score} out of 100: ${phrase}.`

- `reachWords`: few "fewer than ten people reached"; hundreds "tens to hundreds of people reached"; thousands "thousands of people reached"; many "tens of thousands of people reached"; unknown "reach not yet known".
- `detectWords`: alert "by an alert"; staff "by the team"; reports "through user reports"; victim "when the person affected contacted you"; press "from outside, by press, a partner or a regulator"; public "after users were already posting about it".
- `phrase` by grade: A "a strong response, with lessons worth keeping"; B "a solid response, with gaps to close"; C "a response that worked, late"; D "a response that mostly happened to you"; F "a response to rebuild before the next one".

Under the sentence, a `<p class="note">`: "The grade is for the response, not the incident. A Sev 1 handled well scores higher than a Sev 3 nobody led." When `ex` is true, add the example banner (section 10).

## 6. The three actions, and the tracker

`pxDraftActions(d)` returns three `{w, owner, by, src}` rows, drafted from the failures:

1. Collect every picked failure as `{layer, key}`. Order layers by their layer score ascending (worst first); ties in this order: detection, response, prevention, communication (chapter 13: the signal-to-triage gap is the fastest to fix). Within a layer keep the option order.
2. Map each through `PX_FIX` (below) and take the first three distinct ones.
3. If fewer than three: append in this order, skipping any already present: `reach === "unknown"` → "Work out how many people saw it and for how long, and add it to this document" (owner eng, 7 days); any promise with text and no date → "Put a date on every promise made during the incident" (owner comms, 3 days); always → "Check these actions are done, and whether the same kind of incident has come back" (owner lead, 30 days).
4. `by` defaults: first action today + 14 days, second + 30, third + 45; the fallbacks above use their own day counts. Dates as `YYYY-MM-DD` from local time.

`PX_FIX` (key → `[action text, owner key]`):

| Failure | Action | Owner |
|---|---|---|
| prevention.no_rule | Write the rule or default that would have covered this, with an example of what crosses the line | policy |
| prevention.unapplied | Find out why the rule wasn't applied (training, tooling, queue) and fix that step | ops |
| prevention.new_accounts | Limit what accounts under a week old can do in the place this happened, and pre-approve the limit for next time | product |
| prevention.feature | Add a safety check to the feature that made this easy: a limit, a friction step or a default | product |
| prevention.known | Build the safeguard the pre-mortem already named, and mark it done there | eng |
| detection.no_alert | Add an alert on the rate of this harm category, per hour, in the surface where it happened | eng |
| detection.late_alert | Re-tune the alert threshold against this incident's timeline so it would have fired at the first signal | eng |
| detection.queue | Give this kind of report a severity that jumps the queue, and a response time | ops |
| detection.volume | Change the monitor from volume to rate, with a baseline for that hour of the week | eng |
| detection.outside | Add a monitor for the signal that outsiders saw before you did | eng |
| response.no_lead | Name who can declare an incident and who leads one, with a backup, and put it in the playbook | lead |
| response.late | Write the declaration threshold into the playbook: declare early, downgrade later | lead |
| response.no_lever | Build the lever that would have contained this in minutes, usable without a deploy | eng |
| response.over | Write the containment order into the playbook: distribution first (search, hashtags, recommendations), then enforcement | policy |
| response.queues | Add a rule to the playbook: the highest-severity queues stay staffed whatever else is happening | ops |
| response.evidence | Add a preserve step before any removal in the playbook, with where the evidence goes | legal |
| communication.internal | Set a fixed internal update cadence for incidents: what's known, what's done, what's next, who decides | lead |
| communication.holding | Write the holding statement template now, with the four blanks, and keep it in the playbook | comms |
| communication.overclaimed | Add the rule: every number and claim in a statement comes from the operations lead | comms |
| communication.affected | Add a step to the playbook: contact the people affected before anyone else | comms |
| communication.deadline | Put the notification duties, deadlines and contacts in the playbook, owned by Legal | legal |
| communication.blamed | Agree with leadership and Comms that no front-line person is named as the cause of a systemic gap | exec |

`tkFromPostmortem()` (add to `src/partTK.js` next to `tkFromTabletop`, and a branch `else if(src === "postmortem"){ tk = {src:\`the post-mortem "${px.name || "Untitled incident"}"\`, tasks:tkFromPostmortem(), sel:{}, opened:{}}; }` in `tkOpen`):

- One task per action with text: `id:"px-act-" + i`, `title:a.w`, `group:"From the post-mortem: " + name`, `owner:` the owner's display name, `pr:` Sev 1 → 4, Sev 2 → 3, Sev 3 → 2, `done:false`, `def:true`, `labels:["trust-and-safety", "post-mortem", "incident-" + tkSlug(name), "layer-" + layer]` (layer from `src`, or `followup` for the fallbacks).
- One task per promise with text: `id:"px-pr-" + i`, `title:"Promise to " + toName + ": " + w`, `group:"Promises made during the incident"`, `owner:"Comms"`, `pr:3`, `def:true`, `labels:["trust-and-safety", "post-mortem", "promise"]`.
- `desc` lines: the action text; blank; `Due: ${by}` (the CSV formats in `partTK.js` have no due column, so the date rides in the description; do not change the formats); `From the incident "${name}", Sev ${sev}, ${date}.`; `Why: ${failure text}` for drafted actions; blank; `From an incident post-mortem made with T&S Workbench.`

**DECIDED** the due date goes in the description, not a new CSV column: Jira, Asana and Linear each take dates differently and the existing importers are tested as they are.

## 7. The report screen

`renderPostmortem()`:

```js
function renderPostmortem(){
  if(px.view !== "report" && pxView !== "page") return gdRender(pxSpec());
  const s = pxScore(px), acts = pxLiveActions(px);
  view.innerHTML = head("Incident post-mortem", "", "Prepare", reportHeaderActions({...}, tail)) + `<div class="px-root">${pxReportHTML(s, acts)}</div>`;
  pxBind();
}
```

Header actions in the house order (`reportHeaderActions`, `src/partD.js`): See an example (`data-px="example"`, hidden when `ex`), Edit answers (`data-px="edit"`: sets `view = "setup"`, `gdReset("postmortem")` is not called so the chips keep their answers; the engine resumes at the first open step), Start over (`data-px="reset"`, with `withUndo("Cleared", snapshot, restore)`), Save to workspace (`wsSaveLabel("postmortem", px)`), Download (primary, `data-px="download"`), Send to tracker (`data-px="tracker"`, only when there is at least one action), then extras: "For Legal" (`data-px="legal"`, downloads the Legal version), "Copy as Slack message" (`data-px="slack"`), and the tail `<button type="button" class="btn sm" data-px="sharelink">Copy link</button><span class="toast" id="px-toast" ...>`.

Body, in order:

1. `shareBannerHTML('data-px="unshare"')` when `shared`.
2. The example banner when `ex`: "**This is an example:** Pixelry, a photo and short-video app, after a comment pile-on on a creator's post. Start over to write yours." with a Start over button.
3. The verdict card (`.card.pol-sum.tr-sum`): a ring with the score (`.tr-ring` with the grade's tone: A/B `good`, C `high`, D/F `crit`), the eyebrow `Sev ${sev} · ${CATS[area]} · ${date}`, the verdict row, the note, and pills: `${n} actions`, `${k} failures across ${m} layers`, `${promises} promises`, and `Signal to declared ${gap}` when computable.
4. The three actions as `<ol class="pk-list gd-vacts">`: `<b>${w}.</b> ${ownerName} · due ${by}`.
5. `chapterLinkHTML("postmortem")`.
6. `<details class="ev-details"><summary>Details <span class="note">The document, the timeline, the four layers, duties and promises</span></summary>` holding a `.card.pol-tabs` with segs: Document, Timeline, Layers, Duties, Promises, Score.
   - **Document**: a segmented toggle "For the team" / "For Legal" (`data-pxdocv`), then the document rendered as HTML (`pxDocHTML(docv)`), then the redaction checklist (section 8).
   - **Timeline**: the rows as a table (`.ln-t` or a plain table): when, what, and the gap from the previous row.
   - **Layers**: four cards, one per layer, each with the layer score "6 of 10", the failures picked as pills with their fix text, or "Nothing failed here".
   - **Duties**: each selected law with its `OBL.t` text and region, plus the line "Confirm with counsel. Law notes are general information, not legal advice."; or "None recorded".
   - **Promises**: a table of to, what, by; or "None recorded".
   - **Score**: the five parts with got/max and the rule in one line each, and the sentence "Change an answer with Edit answers and the score follows."
7. Footer note: "Follows the post-incident review in chapter 13 of the T&S Handbook and the blameless practice in Google's SRE book. A record for your team and a starting point for Legal, not legal advice."
8. `journeyNextHTML` is not used: the post-mortem is not a journey step (section 11).

## 8. The document

`pxDoc(d, version)` returns Markdown; `pxDocHTML` renders the same structure as HTML for the Details tab. One page: about 450 to 650 words with a full timeline. Sections, in the handbook's order, with the headings exactly as below:

```
# Post-mortem: {name}
_{Sev n} · {CATS[area]} · {date} · blameless review · written {today}_

## In one paragraph
{what}, as written. Then one generated sentence: "It reached {reachWords} and was first seen {detectWords}. From the first internal signal to a declared incident took {gap}." (the gap clause only when computable.)

## Impact
- Who: {who names, joined with ", "}
- How many: {reach words}
- For how long: {firstToResolved as "1d 14h"} (or "Not recorded: add times to the timeline")

## Timeline
| When | What |
|---|---|
one row per timeline entry with text, times as "Sat 3 Oct, 23:30" (toLocaleString with weekday short, day numeric, month short, hour and minute), or "—" when missing
Then one line: "First signal to declared: {gap}. Declared to contained: {gap}." when computable.

## What worked
- one bullet per worked item, the option's `n` text; or "Nothing we would keep. That is itself a finding."

## What failed in the system
### Prevention / ### Detection / ### Response / ### Communication
- one bullet per failure: the option's `n` text; or "Nothing failed here."
(Never a person. The section heading says "in the system" on purpose.)

## Actions
| Change | Owner | Due |
one row per action with text

## Promises made
| To | What | By |   (omitted entirely when none)

## Follow-up
"These actions are checked on {latest action date + 7 days} by the {owner of action 1}. Two numbers to watch across reviews: the share of actions closed on time, and whether the same kind of incident comes back."

_Made with T&S Workbench. A blameless review: everyone acted in good faith with what they knew at the time._
```

**The Legal version** (`version === "legal"`) is the team version plus, between Impact and Timeline:

```
## For Legal
- Duties touched: one bullet per selected law: "{law} ({region}): {OBL.t}". Or "None identified by the team; please confirm."
- Notification clocks: for any selected GDPR entry, "A personal data breach starts a 72-hour clock to the data protection authority from awareness (GDPR Article 33). Confirm whether this incident is one."; for any CSAM entry, "Reporting and preservation duties apply from awareness. Confirm the report was made and the data preserved."; otherwise "None flagged by the answers; confirm."
- Evidence: "Preserved before removal: {yes if worked includes preserve, 'not recorded' otherwise; 'lost before it was kept' if response.evidence was picked}."
- Public statements: one bullet per promise with to = press, regulator or users; or "None recorded."
```

and the header line becomes `_… · draft for Legal review · not legal advice_`. The Legal version keeps the full "What failed" section: Legal needs the facts, and the facts are about the system.

**DECIDED** two versions, not three: the team version is what gets read; the Legal version adds the duties block and nothing is removed. A leadership version is the verdict card plus the actions, which is the Slack message.

### Blameless language

Two mechanisms, both light:

1. The hint under `what` (step 2) and the `why` on the layer steps say it.
2. `pxBlameCheck(text)` scans the free text (`what`, timeline `w`, action `w`, promise `w`) for `/\b(should have|failed to|fault|blame|careless|negligent|ignored|forgot|didn't bother|lazy)\b/i` and for a capitalised first name followed by a verb is **not** attempted (false positives). The report shows a `<p class="note">` under the verdict when there are hits: "{n} phrase{s} to soften before sharing: 'should have', 'forgot'. Say what the system did, not what a person didn't." Never a blocker.

### What to redact before sharing

A static checklist in the Document tab, under the document, titled "Before this leaves the team":

- User handles, display names and content samples: replace with "a user", "the creator", "the post".
- Staff names: roles only. The tool never asked for names; check what you typed.
- Internal links, dashboard URLs and ticket numbers.
- Exact counts, if a contract or a regulator conversation makes them sensitive. Ranges are fine.
- Anything about a child beyond "a minor was affected".

`pxRedact(text)` replaces `@handle` tokens, email addresses and `http(s)://` URLs with `[redacted]`. It is applied to the Slack message always, and never to the downloads (the note under the download says: "Downloads are not redacted. Use the checklist before sharing outside the team.").

## 9. Exports

| Action | What it does |
|---|---|
| Download (primary) | `offerFile(\`post-mortem-${slug(name)}.md\`, md, md, $("#px-toast"))` with the team version |
| For Legal | Same, `post-mortem-${slug(name)}-legal.md`, the Legal version |
| Send to tracker | `tkOpen("postmortem")` (section 6). Jira, Asana, Linear CSV, or one-click Jira, Linear and GitHub issues, as every other tool |
| Copy as Slack message | `copyText(pxSlack(px), $("#px-toast"))`. Slack mrkdwn, at most 1,200 characters, redacted: `*Post-mortem: {name}* (Sev {n}, {date})` / one line: the generated verdict sentence / `*Impact:* {who} · {reach} · {duration}` / `*What failed:* {up to four failure texts, comma-joined, "…and n more"}` / `*Actions:*` three lines `• {w} — {owner}, due {by}` / `*Promises:*` lines when any / last line `Full document: ask {wsProfile().name or "the author"} for the post-mortem.` No link is included: the document is local |
| Copy link | `shareCopy("postmortem", pxShareState(), \`Post-mortem: ${name}\`, $("#px-toast"))`. `pxShareState()` is `px` without `view`, `tab`, `docv`, `shared`, `ex`. `shareRegister("postmortem", d => { px = Object.assign(PX_BLANK(), d, {view:"report", shared:true}); pxSave(); })` at the end of `partPX.js`. "Save a copy" (`data-px="unshare"`) clears `shared` and calls save |

## 10. The example: Pixelry, "The comment pile-on"

Consistent with the demo company (`src/partDEMO.js`: a photo and short-video app for 13 to 25-year-olds with public profiles, comments, DMs and live streams; the policy stress-tester's concerns name "pile-ons in the comments when a creator's post goes viral"; regions us, eu, uk; profile Alex Rivera, Head of Trust & Safety). The incident is harassment, not a sensitive harm area, and nothing in it describes how the abuse was done, only what the platform saw and did.

```js
const PX_EXAMPLE = {
  name:"The comment pile-on, 3 October",
  what:"A creator's video reached the trending page on Saturday night. Within two hours the comments filled with insults about her appearance, most of them from accounts under a week old, and copies of the same lines spread to her older posts. Her followers reported it; the on-call lead saw the report spike three hours later and limited comments on the post.",
  area:"harass", who:["one", "users"], reach:"thousands", detect:"reports",
  tl:[
    {k:"first", t:"2026-10-03T22:40", w:"The first cluster of abusive comments on the trending video"},
    {k:"signal", t:"2026-10-03T23:30", w:"Report spike on one post: 180 reports in 30 minutes, mostly from her followers"},
    {k:"declared", t:"2026-10-04T02:10", w:"On-call lead reads the queue, declares Sev 2 and takes the incident lead role"},
    {k:"contained", t:"2026-10-04T02:40", w:"Comments on the post limited to followers; commenting slowed for accounts under a week old on her profile; evidence exported first"},
    {k:"resolved", t:"2026-10-05T11:00", w:"Organising accounts and the accounts linked to them banned; comment removals with a statement of reasons sent"},
    {k:"more", t:"2026-10-04T09:00", w:"Comms replies to the creator directly and posts a short note on what changed"}
  ],
  worked:["lever", "preserve", "holding", "lead"],
  fail:{prevention:["new_accounts"], detection:["no_alert", "volume"], response:["late"], communication:["internal"]},
  sev:"2", duties:["eu:Digital Services Act: core duties", "uk:Online Safety Act: illegal harms duties"], dutiesSet:true,
  promises:[{to:"affected", w:"A direct update on the accounts actioned and what changed", by:"2026-10-06"}, {to:"users", w:"A short note on comment limits for new accounts on trending posts", by:"2026-10-07"}],
  acts:[
    {w:"Add an alert on the rate of harassment reports per post per hour, so a pile-on pages on-call at the first spike, not three hours later", owner:"eng", by:"2026-10-17", src:"detection.no_alert"},
    {w:"Write the declaration threshold into the playbook: a report spike on one post is a Sev 2 until proven otherwise; declare early, downgrade later", owner:"lead", by:"2026-10-10", src:"response.late"},
    {w:"Slow commenting for accounts under a week old on posts that reach trending, pre-approved with Product so on-call can switch it on", owner:"product", by:"2026-11-02", src:"prevention.new_accounts"}
  ],
  actsSeeded:true, date:"2026-10-03", view:"report", tab:"doc", docv:"team", ex:true
};
```

The `duties` keys above assume the `OBL` law strings as they are in `src/partE2.js` today ("Digital Services Act: core duties", "Online Safety Act: illegal harms duties"). Build the keys from the data at load time (`OBL.find(o => o.r === "eu" && /core duties/.test(o.law))`) so a wording change in the pre-mortem's list does not break the example; a test asserts both resolve.

Expected score: first signal 12 (reports) + signal to declared 2h 40m (160 minutes, at most 240) → 10 + layers (prevention 6, detection 2, response 6, communication 6) 20 + worked 8 (four items) + honest record 10 (five rows with text 5, reach known 3, a dated promise 2) = **60, grade C**, "a response that worked, late". The tests pin this number; if the rules change, change the test deliberately. (`gradeOf` gives C from 60 and D from 45, so the example sits exactly on the C line on purpose: the response was real and it was late.)

The timeline row order in the example is deliberate: the `more` row sits after `resolved` in the array but earlier in time. The report sorts rows by parseable time for display and for the gaps; unparseable rows stay at the end in array order.

`pxAct("example")`: `px = Object.assign(PX_BLANK(), JSON.parse(JSON.stringify(PX_EXAMPLE)))`, resolve the duty keys, `gdReset("postmortem")`, `store.set("ws:cur:postmortem", null)`, `pxSave()`, render, scroll to top, `gsay("Example loaded: Pixelry, after a comment pile-on")`.

## 11. Intro, preview, purpose card, tour

**The guided intro** is in `pxSpec` (section 4). **The preview** (`pxPreviewHTML`): swap `px` for the example inside `try/finally`, return the verdict card HTML plus the three actions list (sections 7.3 and 7.4) and nothing else; no save, no bind, no toast, no `view` writes. The engine renders it inert under the intro with "See the full example" wired to the alt entry whose name contains "example".

**The purpose card** (`INTRO_SPECS.postmortem` in `src/partINTRO.js`, and the gate line `const renderPostmortem9 = renderPostmortem; renderPostmortem = introGate("postmortem", renderPostmortem9);` next to the others):

```js
postmortem:{
  heading:"Write the post-mortem people will actually read",
  who:"whoever led the response, or the founder who wants it written down.",
  leave:"a one-page blameless document, a grade for the response, and three actions with owners and dates.",
  mins:"about 15 minutes, with the timeline in front of you.",
  walk:[
    {title:"Fifteen plain questions", line:"What happened, who it reached, how you found out, and what failed in each layer: prevention, detection, response, communication.",
      preview:() => `<div class="gd-opts" role="group" aria-label="Example question"><button type="button" class="gd-opt on" tabindex="-1"><span class="gd-radio sq" aria-hidden="true"></span><span class="gd-ot"><b>No alert fires for this kind of harm</b></span><kbd aria-hidden="true">1</kbd></button></div>`},
    {title:"A timeline with the gaps", line:"Five moments in the handbook's order. The gap from first signal to a declared incident is usually the fastest to fix.",
      preview:() => `<ul class="tline" style="margin:0"><li class="now"><span class="tdot">2</span><span class="tlab"><b>First internal signal</b><span>Report spike, 23:30</span></span></li></ul>`},
    {title:"A grade for the response, never the incident", line:"A Sev 1 handled well scores higher than a Sev 3 nobody led. The document and three owned actions come out the other end.",
      preview:() => `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="grade grade-C">C</span><span class="pill high">Signal to declared 2h 40m</span><span class="pill">3 actions</span></div>`}
  ]}
```

Update `src/test-intro.js`: the count `16` becomes `17`, add `"postmortem"` to `VALID_ROUTES`, and add `postmortem:renderPostmortem` to `RENDER` with `partPX.js` in that test's module list.

**The page tour** (`PAGE_TOURS.postmortem` in `src/partHELP.js`), four stops in the `coppa` entry's shape:

```js
postmortem:[
  [".gd-intro h1", "One question at a time", "What happened, who it reached, how you found out, the timeline, what worked and what failed in each layer. Every answer can be changed."],
  [".gd-q .gd-opts, .gd-q .gd-text, .gd-q .px-tl, .gd-q .px-acts", "Answer, then continue", "Pick or type. Number keys work for choices, and Back lets you change anything."],
  [".px-root .pol-sum", "Where the response stands", "A grade for the response, never the incident, with the three actions under it."],
  [".px-root .ev-details", "The document", "The one-page review in the handbook's shape, for the team or for Legal, plus the timeline, the four layers, duties and promises."]
]
```

## 12. Registration points (every one, in one list)

Miss one and a test fails. `src/test-walk.js` checks that `TOOL_ROUTES`, `ROUTE_LABEL`, the About page and the All tools cards agree.

| File | Change |
|---|---|
| `src/build-ws.js` | `body9`: `rd("partPX.js")` after `rd("partDSA.js")`. `css9`: `+ rd("partZ19.css")` at the end. The `ROUTES` patch (the second `patch(... "partR shell")` pair): add `postmortem:renderPostmortem, ` right after `coppa:renderCoppa, ` |
| `src/partNav.js` | `TOOL_COLOR.postmortem = "var(--t-tt)"`; `ROUTE_LABEL.postmortem = "Incident post-mortem"`; `ROUTE_DESC.postmortem = "After a real incident, write a blameless post-mortem in fifteen minutes: a one-page document, a grade for the response, and three actions with owners and dates."`; `TOOL_ROUTES`: insert `"postmortem"` after `"tabletop"`; `openSaved`: `if(it.kind==="postmortem"){ px = Object.assign(PX_BLANK(), JSON.parse(JSON.stringify(it.data)), {view:"report"}); pxSave(); store.set("ws:cur:postmortem", it.id); }`; `shellUpdate` `bg` map: `postmortem:"prepare"`; `cmdkItems`: `go("Incident post-mortem","postmortem","var(--t-tt)","doc")` right after the tabletop line |
| `src/partD.js` | `TOOL_TONE.postmortem = "assess"`; `TOOL_ICON.postmortem = "doc"`; `CHAPTER_LINK.postmortem = ["crisis-response", "Crisis response"]` |
| `src/partW2.js` | `KINDS.postmortem = {n:"Incident post-mortem", plural:"Post-mortems", icon:"i-doc", route:"postmortem", prefix:"PX"}` after `tabletop`. In the summary function (the `if(it.kind===...)` chain that returns `{html, chip}`): `if(it.kind==="postmortem" && typeof pxScore === "function"){ const s = pxScore(d), n = (d.acts||[]).filter(a => a.w).length, cls = s.score >= 75 ? "good" : s.score >= 60 ? "high" : "crit"; return {html:\`<span class="pill ${cls}">Response grade ${s.grade}</span><span class="note">Sev ${esc(d.sev||"?")} · ${n} action${n===1?"":"s"}</span>\`, chip:{cls, label:\`Grade ${s.grade}\`}}; }`. Where "Start over" on the workspace page clears a kind (`if(k==="tabletop"){ tt = null; ... }` near line 241): add `if(k==="postmortem"){ px = PX_BLANK(); pxSave(); }` |
| `src/partShell.html` | In the "Assess and prepare" `sb-more` block, first row, before Policy stress-tester: `<a class="navlink" href="#postmortem" data-route="postmortem"><span class="tile tile-sm" data-tone="assess" aria-hidden="true"><svg><use href="#i-doc"/></svg></span>Incident post-mortem<span class="sb-new">New</span></a>` |
| `src/partH4.js` | `OV_STAGE.px = "prepare"`. In `renderTools`, after the tabletop card: `${typeof PX_FIX !== "undefined" ? tool("px","postmortem","var(--t-tt)","doc","Incident post-mortem","After a real incident, a blameless post-mortem in fifteen minutes: one page, a grade for the response, three owned actions.",\`${Object.keys(PX_FIX).length} fixes · 4 layers · the chapter 13 template\`) : ""}` |
| `src/partC3.html` | `HEAD_META`: `postmortem:["doc", () => ["4 layers of failure", "The chapter 13 template", "Blameless by design"]]`. `HEAD_GROUP.postmortem = "Prepare"` |
| `src/partAbout.js` | `AB_GROUPS` "Prepare" list, after the tabletop: `["t-tt","doc","Incident post-mortem","After a real incident: fifteen questions become a one-page blameless review in the handbook's shape, a grade for the response (never the incident), and three actions with owners and dates for your tracker."]` |
| `src/partTK.js` | `tkFromPostmortem()` and the `tkOpen` branch (section 6) |
| `src/partINTRO.js` | The purpose card and the gate line (section 11) |
| `src/partHELP.js` | `PAGE_TOURS.postmortem` (section 11) |
| `src/partTTF.js` and `src/partTT.js` | In `ttfDebriefHTML` (after the `chapterLinkHTML("tabletop")` line inside the verdict card) and in `ttDebrief`'s verdict card: `<p class="note">Had a real one? <a href="#postmortem">Write the post-mortem</a>.</p>`. **DECIDED** one line, no button: the tabletop is rehearsal, the post-mortem is after the real thing, and the link is the only bridge needed |
| `tools/screenshots/capture.js` | `INTRO_ROUTES`: add `"postmortem"`. No new screenshot |
| `package.json` **and** `_build/gen-readmes.js` | Add `&& node src/test-px.js` after `node src/test-cp.js` in the test script in both places (gen-readmes rewrites package.json on every sync; a test added only to package.json disappears the next morning) |
| `_build/gen-readmes.js` | README rows (section 14) |
| `ts-handbook/build.js` | Search index entry (section 15) |
| `src/test-intro.js`, `src/test-a11y.js` | Section 13 |

Not changed: `JOURNEY_ALL` (`src/partJN.js`), `partRC.js` (the report card), `partPLAN.js`, `WORKBENCH_LINK` in the handbook build (chapter 13 keeps the tabletop as its template link), the demo fill (`demoFill` does not save a post-mortem). **DECIDED** the post-mortem is not an assessment step and does not feed the report card: the assessment measures readiness before an incident; a post-mortem exists only after one, and a company with no incidents should not lose points for having no post-mortem.

### Home: card, not step

On the home page it appears as a card in All tools under "Assess and prepare" (above) and in "Jump back in" once saved (through `KINDS` and the workspace summary). Nothing is added to the assessment strip.

## 13. Tests

`src/test-px.js`, following `src/test-cp.js` exactly: the shared stub from `test-v9.js`, `"const GT_MORE = {};\n"`, then the module list `partT.js, partD.js, partE1.js, partE2.js, partF1.js, _F2.js, partW1.js, _L.js, _F3_9.js, _G.js, _W9.js, partNav.js, partH4.js, partH2.js, partAbout.js, partTTF.js, partTK.js, partORG.js, partGD.js, partPX.js`, then the body, printing one line per group. `bad = h => /undefined|NaN|\[object/.test(h)` on every render. If `partORG.js` or `partTTF.js` needs a stub the harness lacks, stub the one symbol (`orgGet = () => ({regions:["us","eu","uk"]})`) rather than loading more modules.

Six bodies:

1. **The flow.** `px = PX_BLANK(); pxView = null; renderPostmortem()` → intro with "Write the post-mortem people will actually read", `data-gd="start"`, one alt ("See an example"), and the preview frame with the example's grade. `gdGo(gdCur, "start")` → the name question; walk every step with `gdPick`/`set` as `test-cp.js` does; the timeline step is not answered with four rows and is answered with five; the layer "Nothing failed here" sets `["ok"]` and moves on; duties options come from `OBL` for the stub regions and "None" sets `dutiesSet`; the actions step seeds three rows on first render; `gdGo(gdCur, "next")` on the last step lands on the report (`px.view === "report"`). Assert `gdLive(pxSpec()).length === 16`.

2. **Scoring.** The example scores 60, grade C, phrase "a response that worked, late". A best case (alert, declared 20 minutes after the signal, every layer ok, five worked items, full record) scores at least 90, grade A. A worst case (public, no times, every failure in every layer, nothing worked, reach unknown, no promises) scores at most 20, grade F (2 for the signal, 8 for the uncomputable gap, up to 5 for a timeline with text, 0 elsewhere). Same answers with `sev` 1 and 3 → equal scores; same with `reach` few and many except the honest-record part → equal. `pxGaps` returns null for a declared time before the signal time and for an empty time. `pxMins(160) === "2h 40m"`.

3. **Actions and tracker.** From the example's failures, `pxDraftActions` returns three rows whose first is the detection fix (lowest layer score), each with text, owner and a date; a case with one failure fills with the reach and follow-up fallbacks in order; no duplicates. `tkFromPostmortem()` on the example returns 5 tasks (3 actions, 2 promises), every `desc` contains "Due:" and "From an incident post-mortem", priorities 3 for Sev 2, labels include `post-mortem`; `tkCsvFor("jira", tasks)` and `("linear", …)` parse to the right row counts (reuse the CSV parser from `test-tk.js`). `tkOpen` has a `postmortem` branch (grep the source).

4. **The document.** `pxDoc(PX_EXAMPLE, "team")` has the eight headings in order (`# Post-mortem:`, `## In one paragraph`, `## Impact`, `## Timeline`, `## What worked`, `## What failed in the system`, `## Actions`, `## Promises made`, `## Follow-up`), no `undefined`, the timeline sorted by time (the 09:00 Comms row before the 11:00 resolved row), "First signal to declared: 2h 40m", and no "## For Legal". The Legal version has "## For Legal", the two laws, "not legal advice". A document with no promises has no "## Promises made". `pxSlack` is at most 1,200 characters, starts with `*Post-mortem:`, has three `•` lines, and turns `@someone`, an email and a URL in the free text into `[redacted]`. `pxBlameCheck("the on-call should have seen it")` returns one hit; the report shows the softening note; a clean text returns none. The word count of the team document for the example is between 350 and 700.

5. **Save, open, share.** `wsSaveTool("postmortem", px, pxTitle(px))` creates an item of kind `postmortem` with prefix `PX`; the workspace summary returns a pill with "Response grade C"; `openSaved(id)` sets `px.view === "report"`; `renderTools()` lists one `ov-tool` card more than before and `OV_STAGE.px === "prepare"`; `SHARE_APPLY.postmortem` exists and applying `pxShareState()` of the example gives a report with `shared` and the share banner; "Start over" clears and `withUndo` restores (count calls as `test-walk.js` does).

6. **Registration.** `TOOL_ROUTES.includes("postmortem")` right after `"tabletop"`; `ROUTE_LABEL`, `ROUTE_DESC`, `KINDS`, `CHAPTER_LINK`, `TOOL_TONE`, `TOOL_ICON`, `TOOL_COLOR` all have it; `AB_GROUPS` names it under Prepare; `rd("partShell.html")` contains `data-route="postmortem"`; `rd("partC3.html")` has `postmortem:["doc"` and `HEAD_GROUP` entry; `rd("partINTRO.js")` has `INTRO_SPECS` entry and the gate line; `rd("partHELP.js")` has the tour; `rd("build-ws.js")` has `rd("partPX.js")`, `rd("partZ19.css")` and `postmortem:renderPostmortem`; `rd("partTTF.js")` has the "Write the post-mortem" link; the package.json test script and the one in `../../_build/gen-readmes.js` both name `test-px.js`.

Existing tests to update: `src/test-intro.js` (17, `VALID_ROUTES`, `RENDER`, module list); `src/test-a11y.js` (add `["postmortem", () => { px = PX_BLANK(); pxView = null; renderPostmortem(); }]` and a filled one with the example, plus `partPX.js` in its module list); `src/test-ttf.js` (nothing should break; run it). `test-seo.js` and `test-walk.js` pass once `ROUTE_DESC`, `AB_GROUPS` and `TOOL_ROUTES` are in step; `build-ws.js` adds the route to `sitemap.xml` from `ROUTE_LABEL` on its own.

Run `npm test` before every commit. Then `npx serve docs -l 8765` (or `CAPTURE_PORT=8831`) and `node tools/screenshots/capture.js --phone` and `--dark`, and look at `assets/review/postmortem*.png` only: the timeline rows must not overflow at 390px (stack the time and the text), the actions textarea must wrap, and the verdict ring must keep its contrast in dark.

## 14. The sync template row (`_build/gen-readmes.js`)

In the workbench README table, after the `row("Incident tabletop", …)` line:

```js
row("Incident post-mortem", "workbench", "postmortem", "After a real incident, a blameless post-mortem in fifteen minutes: a one-page review in the handbook's shape, a grade for the response (never the incident), and three actions with owners and dates for Jira, Asana, Linear or GitHub.") + "\n" +
```

In the GitHub profile README's tool table (`W(C.USER, "README.md", …)`), after the Incident tabletop row: `| [Incident post-mortem](${live("postmortem")}) | Write a blameless post-mortem after a real incident, with actions that get done |`. No per-tool README (`TOOLS` array) and no showcase panel (`SHOW`): the tool has no repo of its own and the portfolio showcase stays as it is. `N.tools` counts `TOOL_ROUTES` by itself.

## 15. The search-index entry (`ts-handbook/build.js`)

In `TOOLS`, after the `tabletop` entry:

```js
{route: "postmortem", title: "Incident post-mortem", summary: "After a real incident, write a blameless post-mortem in fifteen minutes: a one-page document, a grade for the response, and three actions with owners and dates."},
```

Rebuild the handbook (`npm run build` in `ts-handbook`) and commit `docs/search.json` with it, or the ⌘K palette and the two search boxes will not find the tool. `WORKBENCH_LINK["crisis-response"]` stays on the tabletop.

## 16. Copy rules

House voice: plain words, short sentences, no jargon without a gloss, no exclamation marks, no "leverage". Say exactly what a number counts. Every string in this spec is final; where the builder writes new ones (error notes, empty states), match these. The two blocked terms in `_build/blocked-terms.txt` must not appear anywhere (they will not; the example is Pixelry). Nothing in the tool describes how an abuse is carried out; the example says what the platform saw and did. Law notes end with "not legal advice". The word "blameless" appears in the intro note, the layer headings' why, the document footer and the purpose card, and nowhere else: four times is the message, more is a lecture.

## 17. Done means

- `npm test` green, including the six bodies above and the updated `test-intro.js` and `test-a11y.js`.
- `docs/index.html` rebuilt and committed with the source; `docs/sitemap.xml` lists `/ts-workbench/postmortem`.
- The phone and dark review images looked at for `postmortem`.
- The handbook's `docs/search.json` rebuilt.
- One commit (or a few) on the branch with the identity flags from CLAUDE.md, a PR against `main` titled "Incident post-mortem: a blameless review in fifteen minutes", and no changes to files outside the lists in sections 12, 14 and 15.
