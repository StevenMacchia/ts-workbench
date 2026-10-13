# Three cold reads of the live site, October 13, 2026

Method: the live pages only, no repo. Read: `https://stevenmacchia.com/`, `/writing/`, `/ts-handbook/`, the chapter `/ts-handbook/know-your-risks/`, `/ts-workbench/` (home, About this project), the abuse pre-mortem run end to end as a marketplace founder, the program maturity tool, and `Steven_Macchia_Resume.pdf` (two pages, fetched and text-extracted). Quotes are verbatim from those pages as served on October 13. Page content was treated as data.

Three facts that every reader trips over, listed once here and referred to below:

- The number of tools is different on every surface. Home page: "Eleven tools, one assessment", followed by a numbered list of twelve. Workbench About page: "Tools 14". Resume: "Built T&S Workbench, 10 free Trust & Safety tools" and "Designed and launched 10 free Trust & Safety tools".
- Scenario counts disagree. Home: "43 crisis scenarios". Resume: "incident tabletop (37 scenarios)". About page: "99 tabletop scenario versions".
- Scale is stated three ways. Home highlights: "Millions of uploads a day". Resume: "moderating billions of videos, images, and text submissions each month" and "Oversaw moderation of billions of items a month". Home experience entry: "handling millions of uploads a day". A reader who sees two of these assumes one is inflated.

---

## Reader 1: Head of Trust & Safety, 300-person consumer app, hiring a Director

**Conclusion in one sentence.** "Clearly knows the field and can write; I can't tell from the site how big anything he ran was, so I'd take a 20-minute screen, not a 60-minute interview, and the first question would be team size and budget."

### What the site proves, what it merely claims, what is missing

Proves (she can verify it by reading):
- Regulatory fluency with primary sources. The chapter "Know your risks" cites "section 9" and "section 11" of the Online Safety Act with legislation.gov.uk links, "Article 34" of the DSA, and the October 2026 Ofcom investigation into "Instagram Instants", and gets the nuance right: "It's an investigation, not a finding of a breach".
- Program structure. The chapter's "What good looks like" table splits Early / Growing / At scale into "What you have" and "What you can show". That is how a Director talks to a CEO.
- Product sense. The pre-mortem's launch plan gives every action an owner ("Legal & Compliance", "Engineering", "T&S Ops", "Product", "Policy"), an effort size and a "Start small:" line. The About page's "Every score on this site comes from a stated formula, not a gut feeling" is backed by the "How the scores work" section.

Claims (asserted, nothing on the site lets her check):
- "Built a T&S function from zero" (home highlights). No headcount at any point.
- "NCMEC and law enforcement: set up the partnership and run CSAM escalations". No volume, no response times.
- "with the vendor budget for AI moderation" (home) and "Manage the Trust & Safety vendor budget" (resume). No figure, not even an order of magnitude.
- "$1M+ projected annual savings from a zero-to-one, platform-wide user reputation system" (resume). "Projected" is the word she notices.

Missing, and expected at Director level:
- Team size and shape at Medal. The only headcount anywhere is Cognizant 2017 to 2020: "Managed three team managers, each leading about 30 moderation and community operations staff". That is an outsourced-moderation site lead role six years ago. For 2020 to 2026 there is no number of reports, no org shape, no "Head of" scope.
- Company scale. "Medal" is never sized. She does not know if "Head of Global Compliance and Trust & Safety" was over a team of 2 at a 40-person company or a team of 20 at a 400-person one.
- Outcomes. Not one before/after number on the site: no prevalence, no time-to-action, no appeal overturn rate, no incident count, despite the handbook chapter "Measuring what matters" and a 36-metric framework. The site teaches the metrics it never reports.
- Regulators dealt with. The writing is about Ofcom, the DSA and KOSA, but nothing says "filed a DSA transparency report", "answered an Ofcom information request", "handled a government takedown order". The tabletop even has "a government takedown order" as a scenario; she wants to know whether he has had one.
- A crisis he ran. The handbook chapter promises it: the Oct 3 change log says "Stories from Steven's own work come next." Ten days later there are none on the chapter.

Where the tools help: they show he can turn judgment into a repeatable system, and the formula transparency ("Each of the 58 harms has a severity and a baseline likelihood… Severity × likelihood gives a score out of 16") is exactly the rigor she wants from a Director who will defend a risk register to Legal.

Where the tools hurt: the count disagreements above; the About page's "Limits and what's next" still says "Next: a transparency report drafter" while the same page lists "Transparency report" as a built tool; and when she runs the pre-mortem on a product that is not a teen social app she gets an "F" and a verdict that reads as miscalibrated (see Reader 2). A Head of T&S will test the tool against her own product in two minutes, and that is the result she gets.

### Three moments that helped most
1. `/ts-handbook/know-your-risks/`, "What good looks like": the Early / Growing / At scale table with "What you have" and "What you can show". The clearest signal on the site that he thinks in evidence a regulator or a board would accept.
2. `/ts-handbook/know-your-risks/`, Step 05: "Some safeguards cost the feature its own metric. A gifting limit on new accounts will reduce gifting, and revenue usually wins that argument. Don't fight it twice. Agree the exit criteria up front". That is a line only someone who has lost that argument writes.
3. `/ts-workbench/#about`, "How the scores work" and "Every number explains itself". She distrusts black-box scoring; this disarms it.

### Three moments that hurt most
1. `https://stevenmacchia.com/`, the hero: "10+ years in Trust & Safety and online communities. I built a Trust & Safety function from zero and grew it into a program covering policy, moderation operations, child safety, privacy and AI-assisted enforcement." Four topic nouns, zero numbers. Same page, "Experience" block for 2024 to now: "Lead compliance and Trust & Safety for high-volume UGC platforms" and "Manage the vendor budget across multiple AI moderation and transcription vendors". Still no headcount, no budget, no MAU.
2. `https://stevenmacchia.com/writing/`: every post is dated between Sep 21 and Oct 8, 2026, and the workbench and handbook both say "2026". Everything public was made in about six weeks. Combined with the footers "Built with AI-assisted development" (home) and "Written with AI assistance" (handbook), she reads it as a job-search sprint, not a body of work, and wonders how much of the judgment on the page is his.
3. `https://stevenmacchia.com/`, "Eleven tools, one assessment" above a list of twelve, with items 11 and 12 tagged "WIP"; then `/ts-workbench/#about` says "Tools 14". For someone hiring a Director to bring order, small inconsistencies in his own shop window count double.

### The one change that would most move her decision
Put a scope line under the hero and at the top of the resume: the number of people led (direct and total) at Medal, the vendor budget as an order of magnitude, one consistent scale figure, and one named regulator or statutory report handled. One sentence, for example in the shape "Led a team of N across policy, ops and escalations, a $X vendor budget, N items a day, and the company's first DSA transparency report." If any of those numbers is small, say it anyway; she is sizing the role, not the ego.

---

## Reader 2: Founder, 20-person marketplace, found the pre-mortem through LinkedIn

**Conclusion in one sentence.** "The questions were great and took four minutes, but the report told me my marketplace has an F for child sexual exploitation, so I'm not showing it to my cofounder until I understand why."

She arrives at `https://stevenmacchia.com/ts-workbench/#premortem` from the post "Launches get a security review. Almost none get an abuse review."

### Where she stops reading
- First stop, before starting: the landing panel is "Example assessment / Teen social app (example) / Severe exposure / US · EU · UK · AU / Teens allowed / 32 risks logged, 7 critical" with "Child sexual abuse material (CSAM) 16/16, Grooming and online enticement 16/16, Sextortion 16/16" as the first three lines. She sells second-hand furniture. Her first impression of the tool is a teen social app's CSAM score. She scrolls past it to "Start a new assessment", so she continues, but she has already decided this might be for a different kind of company.
- Second stop, the one that matters: the report. Verdict box: "This has severe risk exposure: 4 critical and 5 high-rated risks, mostly in sexual exploitation and child safety. Start with: A law-enforcement request process: published guidelines." Next to it a large red "F". Then: "Typical for a teen social app like the built-in example: Severe risk exposure". Her product: "Marketplace or e-commerce", "Strangers can make contact: Only after they connect", "Sexual content: No", "Size: Fewer than 100,000". She did not answer the under-18 question and the report shows "Under-18s: Not answered". The tool graded the unknown as the worst case and led with it.
- The top three "Do these first" are a law-enforcement request process, "A prohibited goods and services policy, with keyword and image screening", and "Automated screening of text for abuse, spam and scam patterns". Only the second is what she came for. Buyer protection, payout holds and listing screening, the marketplace items, are there but buried under "Before launch 0/17", after "Launch blockers 0/16" which includes "Ability to remove terrorist content within one hour of a removal order under the EU Terrorist Content Online Regulation" and "Train reviewers on trafficking indicators".

### What she does not understand
- "launch blockers" as a category with 16 items, when she is a 20-person company already live. "Don't ship without these" reads as a demand, not advice.
- "Build it / Starter, untested / Formats by ROOST / Coop and Osprey formats / osprey-starter-2.sml · coop-checklist-2.md". None of those words mean anything to her, and they sit right under the plan.
- Why the chrome says "Your assessment / Step 3 of 6 · Abuse pre-mortem" and the report ends with "Next in your program review / About your platform / Continue". She opened one tool from a LinkedIn link; she is now apparently three steps into a six-step program she never started.
- "4 of 5 legal duties apply across 1 jurisdiction you named" and "DSA statement of reasons" (on the workbench home). She knows the DSA exists; she does not know what a statement of reasons is or whether a marketplace under 100,000 users has to write one.

### Keyboard and flow problems she hit (reproduced on the live site, Oct 13)
- "Start a new assessment" fires a toast "Cleared · Undo" before she has done anything, which reads as "you just lost something".
- On question 1, pressing a number key (the hint says "Number keys pick an answer, Enter continues.") sent her back to the intro card "Find out how your feature could be misused, before you launch it" with "Start" and "Already know this? Skip." She pressed Start again and the tool resumed at question 1 with her choice kept, but she did not know that until she looked. Also observed: the first pass said "Question 1 of 11", the second "Question 1 of 12".
- On question 3, "Could anyone under 18 use it? This changes more than any other answer.", pressing Enter did not require an answer; the button is "Skip for now" and Enter takes it. She skipped the question the tool itself calls the most important without noticing, which is what produced the "Under-18s: Not answered" and the F.
- On question 8, "Does money change hands?", she pressed 2 and 3 ("People pay each other", "We pay people") then Enter; the report shows "Money: None". Either number keys don't toggle a multi-select or Enter discarded the selection; either way the report does not reflect a marketplace with payouts, which is the one thing a marketplace founder cares about.

### Three moments that helped most
1. `/ts-workbench/#premortem`, intro card: "Who it's for: a team about to ship a product or feature. What you leave with: every risk that applies, how serious it is, and the five actions to do first. How long: about 3 minutes. No Trust & Safety background needed." Exactly the promise she wanted, and the questions kept it: plain, fast, each with a one-line reason ("The easier it is to make an account, the easier it is to come back after a ban").
2. The live "Your risk picture" panel during the questions ("Critical 4 / High 8 / Medium 19 / Low 3", changing as she answered) and "Click any answer to change it" on the report. She can see cause and effect and she can undo.
3. The "Start small:" lines on actions, for example under buyer protection: "Use your payment provider's delayed-capture and dispute tools." and under device signals: "Start with your fraud or bot-protection vendor's device fingerprinting." Those are the lines she would paste to her cofounder.

### Three moments that hurt most
1. `/ts-workbench/#premortem` report, verdict box: "This has severe risk exposure: 4 critical and 5 high-rated risks, mostly in sexual exploitation and child safety." with the red "F" and "Typical for a teen social app like the built-in example". For a marketplace with no under-18 answer, no sexual content and connect-first messaging, this reads as the tool not having listened.
2. `/ts-workbench/#premortem` report, "Launch blockers / Don't ship without these / 0/16", first item "A law-enforcement request process: published guidelines, emergency disclosure and data preservation". She expected "Buyer protection: funds released after delivery" or "Screen listings for prohibited, counterfeit and misleading items" first. The ordering rule is stated ("Priority comes from the most serious risk each action covers") but it means CSAM-adjacent items will always outrank fraud items for every product type, so the top of the plan looks the same for a furniture marketplace as for a teen chat app.
3. `/ts-workbench/#premortem` landing, before she starts: "Teen social app (example)… Child sexual abuse material (CSAM) 16/16". The example is the first content on the page and it is not her.

### The one change that would most move her decision
Make the report honest about what it does not know and lead with her product's own risks. Concretely: if "Could anyone under 18 use it?" is unanswered, do not grade; show a one-line "Answer the under-18 question to get your grade" and rank the plan from the answered questions. And rank "Do these first" by the product type's top harm areas (for a marketplace: fraud, counterfeits, prohibited goods, scams) before the universal child-safety items, with the universal items kept in a clearly labelled "Every platform needs these" block. With that, the top three actions become things she can forward to her cofounder today, and she would come back for the coverage radar and the "Rehearse the crisis: The counterfeit flood" link the report already offers.

---

## Reader 3: Technical recruiter screening for Head of T&S at a gaming company, two minutes

**Conclusion in one sentence.** "Strong domain match on paper (gaming UGC, NCMEC, billions of items, DSA), title matches, but I can't put a team size or company size in the submission notes, and I had to scroll past twelve tool cards to find the jobs."

### Is the headline clear?
- Resume headline: "Trust & Safety and Compliance Leader | AI-Assisted Moderation | Child Safety | Regulatory Compliance". Pipe-separated keywords, scannable, matches a Head of T&S JD. Good. "Raleigh, NC" and the site link are on line two. Good.
- Site hero: "Trust & Safety leader / Steven Macchia / 10+ years in Trust & Safety and online communities." The word "gaming" is not in the hero or in the four highlight cards' titles ("Built a T&S function from zero", "Millions of uploads a day", "NCMEC and law enforcement", "GDPR, CCPA and the DSA"). It appears only inside the body text of the second card and in the experience bullets. For a gaming JD, the single most matching fact is below the fold.

### Is the experience legible?
- On the resume, yes: six roles, dated to the month, with Medal.tv as "Head of Global Compliance and Trust & Safety, Sep 2024 – Present", "Safety Manager, Jan 2024 – Sep 2024", "Program Manager, Trust & Safety, Jan 2022 – Jan 2024", "Program Manager, Community Operations, Apr 2020 – Mar 2022". Four promotions in one company reads well.
- On the site, almost: the home page merges two resume roles into "2022 – 2024 / Program Manager, Trust & Safety, then Safety Manager", and shows years only. A recruiter cross-checking against LinkedIn will see a mismatch in the role count. Also the home page title line "Trust & Safety Team Lead, Cognizant" is followed by "Promoted to Supervisor in 2018", which reads as a demotion or a typo to someone who does not know Cognizant's ladder (Supervisor above Team Lead).
- What she cannot fill in on the screening form: team size at Medal (only "Managed 3 team managers, each leading about 30 people" from 2017 to 2020), budget managed (only "managed the vendor budget"), company size (Medal is never sized), and reporting line (who the Head of reports to). Every Head-of JD asks for at least two of those.
- "Medal.tv" is named only on the resume; the site says "Medal". She may not immediately connect it to the gaming clip platform.

### Does the volume of tools distract from the person?
Yes. On `https://stevenmacchia.com/` the order is hero, four highlights, "T&S Workbench" (twelve cards, a stats line "58 abuse risks · 104 safeguards · 33 legal obligations · 43 crisis scenarios · 36 metrics · 48 DSA duties", and three more buttons), "Handbook and writing" (a four-part handbook block plus four posts), and only then "Experience". That is about three screens of product marketing between the name and the jobs. The nav's "Experience" link saves her, if she sees it. On the resume, "Built T&S Workbench, 10 free Trust & Safety tools including LLM-powered policy, notice, and appeal assistants" sits in "Key Achievements" alongside the NCMEC partnership and the $1M saving; she does not weight it, and the tool count there (10) differs from the site (11, 12, 14), which she will not notice but a hiring manager might.

### Three moments that helped most
1. Resume page 1, "Professional Summary": "Built a gaming UGC platform's Trust & Safety function from zero and rose through three promotions to lead global compliance and Trust & Safety." Gaming, zero-to-one, promotions, in one sentence. This is the sentence the site hero should be.
2. Resume, Head of role bullet: "Lead global Trust & Safety and compliance for a gaming UGC platform moderating billions of videos, images, and text submissions each month with AI-assisted scanning (OCR, Hive, audio transcription), reputation scoring, and appeals." Named vendors and scale; she can match "Hive" against the JD's tooling line.
3. `https://stevenmacchia.com/`, top bar: "Download resume" is in the nav, in the hero, at the end of Experience and in the footer. She never hunted for it.

### Three moments that hurt most
1. `https://stevenmacchia.com/`, the hero through the highlights: "Trust & Safety leader" with no company, no industry word and no team size in the first screen. She has to scroll to the fourth section to learn where he worked.
2. `https://stevenmacchia.com/`, "T&S Workbench" section: twelve numbered cards, two tagged "WIP", above the experience. In a two-minute screen that is time she does not have, and "WIP" on a public portfolio reads as unfinished.
3. Resume, "Key Achievements": "$1M+ projected annual savings" and "Oversaw moderation of billions of items a month" next to the site's "Millions of uploads a day". She will copy one scale figure into her notes and she does not know which.

### The one change that would most move her decision
Move the resume's summary sentence into the site hero, add the numbers it lacks, and put Experience directly under the highlights. The hero becomes something like: "Head of Global Compliance and Trust & Safety at Medal.tv (gaming UGC, N items a day). Built the T&S function from zero, led a team of N and a $X vendor budget, set up the NCMEC partnership." Then the four jobs. The workbench and handbook move below Experience. Her two minutes end with the person, not the product.

---

## Cross-cutting: the five changes to make this week

Ordered by how many of the three readers each one helps.

1. **One scope sentence with numbers, in three places.** (Helps all three.) Write one sentence containing: team size led at Medal (direct and total), vendor budget as an order of magnitude, one scale figure used everywhere (pick "items a day" or "items a month" and delete the other), Medal's size or MAU, and one named regulator or statutory artifact handled (a DSA transparency report, an Ofcom or DSC request, a law-enforcement emergency disclosure count). Put it (a) under the hero on `index.html` replacing "10+ years in Trust & Safety and online communities. I built…", (b) as the first line of the resume's Professional Summary, (c) in the 2024 to now entry of the home page Experience block. Owner: writer, with Steven supplying the numbers. If a number is confidential, give the order of magnitude.

2. **Make every count agree, and remove the stale line.** (Helps all three.) Pick one tool count and use it on the home page heading ("Eleven tools, one assessment" currently sits above twelve items), the About page ("Tools 14") and the resume ("10 free Trust & Safety tools"). Same for scenarios: home "43 crisis scenarios", resume "37 scenarios", About "99 tabletop scenario versions" (if 99 is versions and 43 is scenarios, say "43 scenarios in 99 versions" everywhere or drop 99). Same for the pre-mortem's "Question 1 of 11" versus "1 of 12". On `#about`, delete "Next: a transparency report drafter" (the tool exists) and update "last reviewed in September 2026" when the next review happens. Owner: developer for the pages, writer for the resume.

3. **Put the person before the product on the home page, and say "gaming".** (Helps the hiring manager and the recruiter; neutral for the founder.) On `index.html`, move the `#experience` section directly after the four highlight cards. Cut the Workbench section to the "Your assessment" card plus three tool cards and one "All twelve tools →" link; the full grid stays on `/ts-workbench/`. Add "gaming" to the hero line and "Medal.tv" (not just "Medal") to the experience entries. Fix the Cognizant line so "Promoted to Supervisor in 2018" either goes or is explained (for example "Team Lead, then Supervisor from 2018"). Split "Program Manager, Trust & Safety, then Safety Manager" into the two dated roles the resume has. Owner: developer (the home `index.html` is generated by `_build/gen-readmes.js`, so change the template).

4. **Fix the pre-mortem's verdict for products that are not a teen social app.** (Helps the founder directly, and the hiring manager's judgment of the tool.) Four parts, all in the pre-mortem report and flow:
   - If "Could anyone under 18 use it?" is unanswered, show no letter grade; show "Answer the under-18 question to get a grade" and rank only from answered questions. Make Enter on that question require an answer (keep "Skip for now" as a visible button, not the default key).
   - Replace the sentence "Typical for a teen social app like the built-in example: Severe risk exposure" with a comparison to the chosen product type, or remove it.
   - Order "Do these first" and "Launch blockers" by the product type's own top harm areas first (marketplace: fraud, counterfeits, prohibited goods, scams), then a block titled "Every platform needs these" for the universal child-safety and law-enforcement items. Keep "Priority comes from the most serious risk each action covers" true inside each block.
   - Reproduce and fix the keyboard problems seen on Oct 13: a number key on question 1 returning to the intro card; "Start a new assessment" showing "Cleared · Undo" with nothing to clear; number keys on the multi-select "Does money change hands?" not surviving to the report ("Money: None" after choosing 2 and 3). Owner: developer, `src/partPM*.js` or wherever the pre-mortem flow and report live.

5. **Ship three first-person stories with one number each.** (Helps the hiring manager and the founder; the recruiter benefits only if one lands on the home page.) The chapter change log on `/ts-handbook/know-your-risks/` promised "Stories from Steven's own work come next" on Oct 3. Write three, 120 to 200 words each, in the `> **Story.**` blockquote the chapter template already defines: setting up the NCMEC partnership (what existed before, what the first month of reports looked like), the user reputation system (the before/after moderation number behind "$1M+ projected"), and the move to AI-assisted moderation (what the human-review rate did). Place them in chapters 2, 11 and 18, and lift one sentence from each into the home page highlight cards so "NCMEC and law enforcement" and "Millions of uploads a day" get a number. Owner: Steven writes, the writer edits for voice; no developer needed beyond a handbook build.

Lower priority, noted so they are not lost: the pre-mortem landing shows "Teen social app (example)" with "CSAM 16/16" as the first content on the page for every visitor (show the example that matches the chosen template, or show it after the first question); the ROOST block "Build it / Starter, untested / osprey-starter-2.sml" needs one plain sentence saying who it is for and that a founder can ignore it; "WIP" tags on the home page cards would read better as "Preview" with a date; and the writing archive being entirely Sep 21 to Oct 8, 2026 is a fact the hiring manager will notice, so the writing page intro should say when the LinkedIn writing started and why it is being archived now.
