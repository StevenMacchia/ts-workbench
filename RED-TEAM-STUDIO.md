# Red team studio: the suite

A blueprint, 2026-10-07. Grounded in three research passes (how real red teams work, how non-experts learn judgment, what open data exists), scaled to the person who will actually use it.

## Who it is for

Sam is a product manager at a twelve-person company. They are adding an AI support assistant that reads customer documents and can open tickets. It ships in six weeks. There is no safety team. An enterprise prospect just sent a vendor questionnaire with an AI section that asks whether they red team their model, what data it was trained on, whether it can act on its own, and whether they test for prompt injection.

Sam has an afternoon, no mentor, and a deadline. They need to know what to do this week, what it costs, what to hand an engineer, and what to say to the prospect. Everything in the suite is judged by whether it moves Sam toward shipping safely and answering that questionnaire honestly.

Three facts from the research shape everything:

- The labs publish for labs. There is no well-known guidance for a small team with no budget. That is the gap this suite fills, with an opinionated default: a half-page scope, a 20 to 30 row test sheet, one tester from outside the build team, hard stop rules, a dated one-page summary. That is an honest "yes, we red team".
- Judgment is learned by doing and comparing. Retrieval first, then the expert's call on the same artifact with the gap explained. Not reading, then a quiz. The deliverable is a written finding an engineer can act on, which is also what employers list as the skill.
- Onboarding is the real work. The first session produces one real finding against a target, before any setup. Progress is "6 of 9 things tested on your assistant", never a streak.

## The loop

Every module runs the same loop: do something, see the expert's call on the same thing, understand the gap, keep the artifact. Each unit is ten to twenty minutes and ends with something Sam can use.

## The six modules

### 1. Start here: one finding in twenty minutes

Sam picks a starter target that matches their stack, or describes their own: a support bot that reads documents, a search and summary feature, an agent that can act, an image or video feature. They write the one-paragraph "what it is for, who it is for, what is out of scope" card before anything else. The DEF CON Generative Red Team handed testers exactly this card first, and it is what turns "I did not like that answer" into a judgable finding.

Then the sandbox. Sam does not type attack prompts. They choose moves: ask plainly, wrap it in a story, build up over turns, hide an instruction in a document, upload a photo of a real person, ask for a cartoon and sharpen it. They choose a harm area. The sandbox returns what the target did, as a sanitised description, and Sam grades it from 0 to 4 and sees the expert's grade with the reason. After three moves they file their first finding in the five-part shape: the system, the actor, what they did, why it worked, what it could cause. That shape is Microsoft's ontology from a hundred red teams, and it is what makes findings comparable.

Output: one finding, in the fixed shape, and a target card. Nothing harmful is ever generated or shown; the sandbox is scripted and the moves are described, never pasted.

### 2. Judge: calibration

The skill is judgment, trained the way medicine and content moderation train it: the learner calls it, then sees the expert's call on the same artifact, and the gap is explained. Three drills, interleaved, with spaced review of anything missed:

- Grade this: a sanitised description of an outcome, 0 to 4, against the expert's grade. Split by harm type so a leaked API key and a stereotyped profession never land in the same bucket.
- Spot the move: a one-sentence description of what the attacker did, name the technique. This is perceptual, and gets its own reps.
- The fair question: given a harmful request, pick the twin the model should still answer. Over-refusal is the failure nobody tests for.

Bank target: at least sixty graded items across both model types, drawn from public taxonomies and rubrics with licences that allow it, never from harmful payloads. Expert grades are written by hand and checked for agreement before they ship.

### 3. Plan the week

The small-team default, pre-filled from Sam's target card and from the Abuse pre-mortem if one exists. A half-page scope. Two kinds of actor, always: the bad actor and the well-meaning user who hits an edge, because the highest-volume real harms are accidents. Five to ten personas, written in an hour. The test sheet with twenty to thirty rows specific to this feature. One tester from outside the build team, with a content warning and an opt-out. The stop rules, which cannot be configured away: anything involving minors stops the session, nothing is generated to prove a point, nothing is stored, and the escalation path is written down. The wellbeing floor: a warning before starting, self-selected topics, a sixty to ninety minute cap, a check-in after.

Output: the scope, the sheet, the stop rules, dated.

### 4. Test

The drills, one per card, as the flow already works today, with three changes from the research. Every row is written in the five-part shape. Two passes are required: one on the dev build and one on the exact build going to production, because many real bugs live in the gap. And the sheet becomes the regression checklist: every change to the prompt, the model or the filters reruns it. For video and world models, temporal risk is a category of its own: a scene that is fine in every frame and harmful as a sequence.

Output: the sheet filled in, with grades, and the findings that came out of it.

### 5. Write it up

The finding writer, with the expert comparison built in. Sam writes the finding; the tool shows a model answer for the same artifact and the gap. When opened in Claude, a second opinion on the grade and the fix. Every finding becomes a regression test stub in the exports, with the prompt left in the vault.

Output: findings an engineer can act on without a conversation.

### 6. Show the work

The one-page summary in the register a customer or investor accepts: what was tested, by whom, what was found, what was fixed, what was accepted and why. Written like the red teaming section of a system card, because that is the artifact an auditor can take unmodified. The questionnaire answers, mapped to the sub-questions the 2025 and 2026 forms actually ask: red teamed before release, training data use, retention, autonomy limits, injection testing, incident history. And the honest line about what was not tested, because silence fails and "we did not test X because Y" passes.

Output: the summary, dated, and the questionnaire answers.

## What ties it together

- A checklist tied to Sam's own feature, visible from every screen: "6 of 9 relevant things tested on your assistant". That is the return motivator.
- One coach line per screen, in plain words. The industry term sits in a tag beside the plain word, so Sam can say "that is prompt injection through a tool result, not a jailbreak" in a meeting by the end of the week.
- The Learn guides and the glossary stay as the reference behind the suite, one link away, never on the path.
- The engineers' layer stays one link away too: exports for promptfoo, PyRIT and Inspect, results import, the provenance check, the seed cards.

## Rules that do not bend

- No attack strings anywhere. Moves are chosen and described, targets are scripted sandboxes or the user's own system, and findings describe rather than reproduce.
- Child sexual abuse material is a hard line with no testing exception. The stop rule is in the code, not in a setting.
- Tester wellbeing is part of the flow: warning, self-selection, time cap, check-in.
- Every number says what it counts.

## Build order

1. Module 1, the sandbox and the first finding. It is the front door and the thing nobody else offers.
2. Module 2, the calibration bank, built to sixty items with hand-written expert grades.
3. Module 6, the summary and questionnaire answers, because it is the artifact Sam is under pressure to produce.
4. Modules 3 and 5, the week plan and the finding writer, mostly reshaping what already exists.
5. Module 4 is the current flow with the three changes.

## Sources

The three research reports behind this document, with every claim cited and unverified items flagged, are in the session scratchpad: research-practice.md, research-learning.md and research-data.md. The main sources: Microsoft, Lessons from red teaming 100 generative AI products (arXiv 2501.07238); OpenAI, external red teaming (arXiv 2503.16431) and the developer red teaming guide; Anthropic, Challenges in red teaming AI systems; the AI Village GRT2 design; Thorn and All Tech Is Human, Safety by Design for generative AI; the ACM and arXiv papers on red-teamer wellbeing; T2VSafetyBench (NeurIPS 2024); Roediger and Karpicke on retrieval practice; Sweller on worked examples; the Cloud Security Alliance AI-CAIQ and SIG AI module descriptions.
