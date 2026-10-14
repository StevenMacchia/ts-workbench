# Two child-safety tools: blueprint (branch `minors`, 2026-10-14)

Interactive versions of handbook chapters 6 (Child safety and age assurance) and 12 (Severe harm escalations). Both follow the COPPA readiness pattern (`src/partCP.js`): a guided flow on the shared engine (`partGD.js`), one verdict sentence, three actions, Details, drafts, tracker tasks, workspace save, share link, example, pre-mortem prefill, journey step, intro card.

## Lines that do not move

- No example messages, phrases, lures or scripts anywhere: not in questions, safeguards, drafts, tests or comments. Grooming is described as stages and platform-visible signals (who contacts whom, how new the account is, whether value or a link moved), never as what is said.
- Child sexual abuse material is named only as a thing to detect, preserve and report. Nothing describes it.
- Every law, date, number and named program is in `tools/LEGAL-AUDIT-2026-10.md` or in the two research files from this session, with a fetched source. Sources are listed on the Requirements tab and in the memo, as the COPPA tool does.
- Plain words first, the industry term in a tag. One thing on screen at a time. Light theme first, dark through tokens.

## Tool 1: Grooming pathway review

Route `grooming` · state `gp` · kind `grooming` · prefix GP · token `--t-gp` · icon `i-route` · tone assess · chapter 06.

**Question.** How could an adult reach a child on this product, and what's in the way at each step?

**Stages** (the pathway; each has exposure 0 to 3 from product answers, protection 0 to 3 from safeguards in place, and a status: not on your product, open, narrowed, covered):

1. Find: how a stranger finds a minor (search, suggestions, public profiles, public posts, shared spaces, nearby, live).
2. Reach: how a stranger starts a conversation (DM anyone, requests, comments, group chat, voice).
3. Bond: private contact over time; gifts, currency and money between users.
4. Isolate: the conversation moves where nobody watches (links, disappearing messages, encrypted channels, another app).
5. Exchange: images, calls and live video in private.
6. Exploit: extortion and abuse; what happens when a case lands.

**Questions** (one per screen; skip logic in brackets): service name · who can use it (kids / teens / adults self-declared / adults verified; prefilled from the profile) · how you know ages (none / declared / estimated / verified or parent-approved) [skipped for adults verified] · how a stranger finds another user (multi) · how a stranger starts a conversation (multi) · what can happen in private (multi) · whether value moves between users (multi) · defaults for minors' accounts (multi) · what you detect without reading messages (multi) · what happens when a case is confirmed (multi) · what you measure (multi, optional).

**Safeguards** (about 25, each with stage, plain text, tag, owner, effort, why, how, sources, applies-when, met-when). Met is derived from the defaults/detect/respond answers, never a separate tick list, so the plan can't disagree with the answers.

**Verdict.** The earliest open stage names the sentence ("An adult can start a private conversation with a minor they don't know, with nothing in the way"); score is the share of applicable safeguards in place; grade badge as everywhere.

**Report tabs.** Your plan (gaps, earliest stage first, then severity) · The pathway (six stage cards: what you allow, what's in the way, status) · Rules (starter signals for the response ladder, in the Osprey shape from `partRX.js`) · Drafts (product brief on safe defaults for minors; grooming response ladder; one-page child-safety review for leadership; memo for Legal and Privacy on pattern detection limits by market) · Safeguards (every applicable one, met or not, with sources).

**Example.** Pixelry, the demo company: teens, declared age, public profiles, DMs to anyone, media in DMs, creator payments, private-by-default and location off, reports and hash matching, a trained queue and a reporting process. Partway there.

## Tool 2: Child-safety reporting

Route `reporting` · state `cr` · kind `reporting` · prefix CR · token `--t-cr` · icon `i-flag` · tone prepare · chapter 12.

**Question.** When you find child sexual abuse material or an adult enticing a child, can you remove, preserve, report and handle the account the way the law and the child need?

**Questions.** service name · markets (US, UK, EU, Canada, Australia, other; prefilled from the profile) · how content reaches you (uploads, media in messages, live, file hosting, links only, generated media, text only) · monthly users (four bands; sets the US penalty tier and the UK thresholds) · cases so far (none, a few a year, monthly, weekly) · then one screen per control group, only the items that apply: registration and process · preservation and access · finding it · danger and law enforcement · the account · victims and removal · people · measurement.

**Applies.** US users: 18 U.S.C. § 2258A (report apparent CSAM, enticement and child sex trafficking as soon as reasonably possible; one-year preservation; penalties by user count; no monitoring duty). UK: Online Safety Act s.66 reporting to the NCA since 7 April 2026, with the NCMEC exemption. Canada: report URLs to C3P, notify police, preserve 21 days. Australia: eSafety codes and standards, removal notices. EU: no provider reporting duty yet; DSA Art 18 for threats to life; voluntary detection under the interim regulation (status from research). None of these: still handle reports; INHOPE hotlines.

**Report tabs.** Your plan · Duties by market · Drafts (reporting procedure, the first hour; preservation and access policy; law-enforcement and emergency requests procedure; memo for Legal) · Requirements.

**Example.** Pixelry again: US, UK and EU users, uploads and DMs with media, registered with NCMEC, a procedure, preservation set to 90 days (a gap since the REPORT Act), no out-of-hours cover, no call-back check on emergency requests.

## Wiring (every place a tool is registered)

`build-ws.js` (ROUTES patch, body9 order after partDSA, css9 adds `partZ19.css`, sitemap) · `partNav.js` (ROUTE_LABEL, ROUTE_DESC, openSaved) · `partW2.js` (KINDS) · `partShell.html` (two sidebar links under Assess and prepare, two icon symbols) · `partH4.js` (All tools cards, OV_STAGE, OV_ART) · `partD.js` (TOOL_TONE, TOOL_ICON, COLOR_TONE, CHAPTER_LINK, GT_MORE) · `partZ13.css` (tone tokens) · `partJN.js` (journey steps, conditional) · `partINTRO.js` (purpose cards) · `partORG.js` (templates) · `partLOOP.js` (pre-mortem hand-off) · `partPLAN.js` (plan aggregation) · `partHELP.js` · `partC3.html` (HEAD_META, HEAD_GROUP) · `partTK.js` (tracker source) · `partDEMO.js` (Pixelry fills both) · `test-gp.js`, `test-cr.js`, `package.json`, `test-a11y.js` · `tools/screenshots/capture.js` and `ICONS.md` · outside the repo: `_build/gen-readmes.js` (README table rows and the 404 forwarder's route list), `ts-handbook/build.js` (static tool list), handbook chapters 06 and 12 "Do it with".

## What shipped (same day)

Both tools, wired everywhere the checklist above names, with `test-gp.js` and `test-cr.js` (every suite passes: 29 routes, the 404 forwarder knows both paths, the accessibility pass is clean). Dark and phone renders reviewed with the capture script. Three things changed from the plan: the reporting flow asks size and cases before markets, because the shared walkthrough test expects a tool's first choice to be a single answer; both journey steps are gated on a kids or teens profile, like COPPA, so the assessment's length doesn't change for everyone else; and a shared fix landed in `partD.js` (`detailsOpenAttr`) so a report's Details disclosure stays open across the re-render a tab click causes, which COPPA, DSA and the transparency report also needed. The sidebar carries no "New" tag on the two links because the names are too long for one to fit. Outside the repo: `_build/gen-readmes.js` has the two README rows, and `ts-handbook` has the tool list, the chapter-to-tool links and "Do it with" lines in chapters 6 and 12, uncommitted there.
