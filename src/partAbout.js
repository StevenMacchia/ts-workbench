/* =========================================================
   ABOUT THIS PROJECT (case study for reviewers)
   Fill in AUTHOR to put your name on the page.
   ========================================================= */
const AUTHOR = {name:"Steven Macchia", title:"Trust and Safety Leader", link:"https://www.linkedin.com/in/stevenmacchia"};
const AB_GROUPS = [
  ["Assess", [["t-ma","steps","Program maturity","Rates a program in eight areas against targets for its stage. Ticking off the steps for the next level moves an area up, so the plan and the radar stay current."],
    ["t-cv","cover","Coverage radar","Rates five layers of defense for each kind of harm and overlays them on the pre-mortem's risk, so the gaps that matter most stand out."],
    ["t-pm","radar","Abuse pre-mortem","A plain-language profile of a product becomes a scored risk register, a launch plan with owners, and the laws that likely apply."],
    ["t-cp","coppa","COPPA readiness","Works out whether the US children's privacy law applies, maps children's data, and turns gaps against the 2025 amended Rule into a plan and four drafts for Legal."],
    ["t-ds","dsa","DSA readiness","Works out which duties under the EU Digital Services Act apply to a service, article by article, and turns the gaps into a plan and four drafts: a statement of reasons, a notice-and-action procedure, a complaints process and a memo for Legal."]]],
  ["Prepare", [["t-tt","siren","Incident tabletop","Crisis scenarios across eight company types. Every weaker call becomes a lesson: what happened, the stronger call, the principle and the law."],
    ["t-vd","scale","Vendor scorecard","Weighted comparison of moderation vendors, with wellness and security minimums and ready-to-use RFP questions."],
    ["t-rt","shield","Red team studio","Plans a red team of a language or world model from nine questions: a coverage grid, seed cards with benign twins, drills that fit the team, findings, and exports for open-source harnesses."],
    ["t-pol","doc","Policy stress-tester","An instant clarity check on a rule, then an AI review with vague terms, missing exceptions, edge cases and a clearer rewrite."]]],
  ["Measure", [["t-ai","eval","Classifier eval","Builds a labeled test set of hard cases from a rule (counter-speech, sarcasm, obfuscation, other languages), runs a moderation classifier against it, and shows precision, recall and where it fails, with what to change."],
    ["t-mx","gauge","Metrics framework","A reference for learning: the numbers a T&S program runs on, tailored to platform, stage and regulation, with how to measure each one."]]],
  ["AI assistants", [["t-ai","mail","Enforcement notice writer","Drafts a clear, fair notice to an actioned user, checked against what an EU statement of reasons must include."],
    ["t-ai","appeal","Appeal reviewer","A structured second opinion on an appeal, with a suggested reply. A person makes the final call."],
    ["t-ai","chart","Transparency report","Build the report the EU Digital Services Act asks for, with a completeness check and a summary by Claude."]]]
];
const AB_JOURNEY = [["user","var(--faint)","Set up","Company type, stage and regions, once"], ["steps","var(--t-ma)","Program maturity","Eight areas against your stage"], ["radar","var(--t-pm)","Abuse pre-mortem","Risk for each product or launch"],
  ["cover","var(--t-cv)","Coverage radar","Your defenses against that risk"], ["siren","var(--t-tt)","Incident tabletop","Four decisions per scenario"], ["send","var(--accent)","Act on it","Report card, roadmap and your tracker"]];
function renderAbout(){
  const lawSteps = SCENARIOS.reduce((a,s)=>a+s.steps.filter(x=>x.law).length, 0);
  const versions = SCENARIOS.reduce((a,s)=>a+(s.vars ? ALL_TYPES.length : 1), 0);
  const tools = AB_GROUPS.reduce((a, g) => a + g[1].length, 0);
  const stats = [[HARMS.length,"abuse risks modeled"],[Object.keys(SG).length,"safeguards with owners"],[versions,"tabletop scenario versions"],[lawSteps,"decisions with law notes"],
    [typeof MA_AREAS !== "undefined" ? MA_AREAS.length * 5 : 40,"maturity level descriptions"],[typeof CV_AREAS !== "undefined" ? CV_AREAS.length * CV_LAYERS.length : 40,"coverage checks"]];
  const decisions = [
    ["Private by default","Work is stored on the visitor's own device, so teams can describe unreleased products freely. A workspace file carries it to another device. AI features run only on a click, on the visitor's own Claude account." + (typeof STANDALONE !== "undefined" && STANDALONE ? " The website counts visits with Cloudflare Web Analytics, which uses no cookies and never sees what you type." : "")],
    ["One workspace, one vocabulary","Company type, stage and regions are set once and pre-fill every tool. Every saved result lands in the same workspace, grouped by project."],
    ["Every number explains itself","Each risk rating lists the answers that raised or lowered it, and every score on the report card shows what it's made of, so the output can be challenged and defended."],
    ["Plans, not just scores","Maturity and coverage end in concrete steps. Finishing the steps moves the score, and the steps go to Jira, Asana, Linear or GitHub."],
    ["Plain language first","Questions are written for product managers and founders, not specialists. Terms like CSAM, KYC or sextortion explain themselves on hover."],
    ["Accessible in both themes","Tuned light and dark themes, visible focus states, labelled controls, reduced-motion support and layouts that work down to phone width."]
  ];
  const meta = `${AUTHOR.link ? `<a class="btn sm" href="${esc(AUTHOR.link)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}${typeof demoOn === "function" && !demoOn() ? `<button type="button" class="btn sm" data-demo="start">Explore a demo company</button>` : ""}<a class="btn sm primary" href="#overview">Open the workbench</a>`;
  view.innerHTML = head("T&S Workbench", "A free, private toolkit for running a trust and safety program: assess the program and its products, rehearse crises, and turn the gaps into a plan.", "Case study", meta) + `<article class="ab">
    ${AUTHOR.name ? `<div class="card ab-by2"><span class="sb-av">${esc(AUTHOR.name.split(" ").map(w=>w[0]).join("").slice(0,2))}</span><span class="ab-by2-t"><b>Designed and directed by ${esc(AUTHOR.name)}</b><small>${esc(AUTHOR.title)} · product design, T&amp;S strategy and content</small></span>
      <span class="ab-by2-m"><span><small>Format</small><b>Single-file web app, no backend</b></span><span><small>Status</small><b>Live and free to use</b></span><span><small>Tools</small><b>${tools}</b></span></span></div>` : ""}

    <section class="ab-stats rise" aria-label="By the numbers">${stats.map(([n,l])=>`<div><b class="mono">${n}</b><span>${l}</span></div>`).join("")}</section>

    <section class="ab-sec rise">
      <h2>The problem</h2>
      <p>Most products meet trust and safety after launch, when the first scam, grooming case or regulator letter arrives. Product teams rarely have a structured way to ask “how will this be abused?”, and the specialists who can answer it are stretched thin.</p>
      <p>Trust and safety leaders face a second gap: they're asked how mature their program is, where it's exposed and what to fund next, and usually answer with a gut feeling. The judgment the job needs, in crises and with regulators, is mostly learned the hard way.</p>
    </section>

    <section class="ab-sec rise">
      <h2>How it fits together</h2>
      <p>Each tool works on its own, but together they answer the questions a program leader gets asked: how mature are we, where are we exposed, are we ready for a crisis, and what do we do next.</p>
      <ol class="ab-journey">${AB_JOURNEY.map(([ic, c, n, d], i) => `<li><span class="sb-glyph" style="background:${c}"><svg><use href="#i-${ic}"/></svg></span><b>${i + 1}. ${n}</b><small>${d}</small></li>`).join("")}</ol>
    </section>

    <section class="ab-sec rise">
      <h2>What it does</h2>
      ${AB_GROUPS.map(([g, list]) => `<h3 class="ab-gh">${g}</h3><div class="ab-tools">${list.map(([c,i,n,d])=>`<div class="ab-tool"><span class="sb-glyph" style="background:var(--${c})"><svg><use href="#i-${i}"/></svg></span><div><h3>${n}</h3><p>${d}</p></div></div>`).join("")}</div>`).join("")}
    </section>

    <section class="ab-sec rise">
      <h2>How the scores work</h2>
      <div class="ab-dec">
        <div><h3>Risk</h3><p>Each of the ${HARMS.length} harms has a severity and a baseline likelihood. A product's answers move them: stranger contact raises grooming and scam likelihood, verified identity lowers it. Severity × likelihood gives a score out of 16; 12 and up is critical. Safeguards you tick lower likelihood, so every risk also has a rating after safeguards, and a burn-down shows how far the launch plan takes you.</p></div>
        <div><h3>Maturity</h3><p>Each area is rated on five levels. The rating is a baseline; finishing both steps for the next level moves the area up. Targets come from the stage: level 3 for growing programs, with crisis, compliance and wellbeing never below 3.</p></div>
        <div><h3>Coverage</h3><p>Five layers of defense per harm area, each rated none to strong. Coverage is the share of the maximum, weighted by the pre-mortem's risk. An area is exposed when its risk is critical and its coverage is under half.</p></div>
        <div><h3>Report card</h3><p>Each finished part is scored out of 100: maturity against target, risk-weighted coverage, launch blockers done, strong first calls in tabletops, and policy clarity. The overall grade weighs them 30, 25, 20, 15 and 10.</p></div>
      </div>
    </section>

    <section class="ab-sec rise">
      <h2>Designed for learning</h2>
      <p>The tabletop turns mistakes into teaching moments. Pick a weaker call and you see what happened, how your choice compares with the strongest one on safety, trust, regulatory standing and team capacity, the principle behind it, and the relevant law. Then you can try again.</p>
      <p>Universal scenarios, like an account takeover wave or a government takedown order, rewrite themselves for eight company types, so a fintech team and a gaming studio each rehearse their own version of the crisis.</p>
    </section>

    <section class="ab-sec rise">
      <h2>Design decisions</h2>
      <div class="ab-dec">${decisions.map(([t,d])=>`<div><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
    </section>

    <section class="ab-sec rise">
      <h2>How it was built</h2>
      <p>${AUTHOR.name ? `Designed and directed by <strong>${esc(AUTHOR.name)}</strong>. ` : ""}Built as a single HTML file with no frameworks, accounts or servers, using AI-assisted development. Automated checks play every tabletop scenario in every tailored version, render every screen in its empty, partial and complete states, and verify every score before each release.</p>
      <p><a href="#credits">Everything it's built with ${icon("arrow")}</a>: the models, libraries, services and public sources, with licenses.</p>
      ${AUTHOR.link ? `<p><a href="${esc(AUTHOR.link)}" target="_blank" rel="noopener">Connect with ${esc(AUTHOR.name || "the author")} ${icon("arrow")}</a></p>` : ""}
    </section>

    <section class="ab-sec ab-note rise">
      <h2>Limits and what's next</h2>
      <p>This is a starting point for conversations with Legal, Policy and Engineering, not legal advice or an audit. Every law note links to its official source and was last reviewed in ${LAW_REVIEWED}. Next: a transparency report drafter and a rebuilt metrics flow.</p>
    </section>
  </article>`;
}

/* =========================================================
   WORKS WITH ROOST (where the workbench meets ROOST's open-source tools)
   ========================================================= */
const RO_GH = "https://github.com/StevenMacchia";
const RO_TOOLS = [
  ["Coop", "https://github.com/roostorg/coop", "A review console you host yourself: queues, routing, enforcement, appeals, and hash matching with NCMEC reporting."],
  ["Osprey", "https://github.com/roostorg/osprey", "A real-time rules engine and investigation console, built at Discord. For teams with engineers and event streams."],
  ["Model Community", "https://github.com/roostorg/model-community", "Guides and example policies for open safety models that label content against a policy you write, among them PolicyLM and gpt-oss-safeguard."]
];
// What you can do today: [title, route, glyph color, icon, text, starter?]
const RO_NOW = [
  ["Test a rule on an open model", "eval", "var(--t-ai)", "eval", "Download the cases and a policy file, run them on an open model such as PolicyLM or gpt-oss-safeguard on your own computer, and paste the labels back."],
  ["Improve a rule, run by run", "eval", "var(--t-ai)", "eval", "Edit the rule, run again, and see which cases were fixed or broke."],
  ["Get an instant baseline", "eval", "var(--t-ai)", "eval", "A small open model runs in your browser and shows where a generic toxicity filter misreads your rule."],
  ["Score images and video", "eval", "var(--t-ai)", "eval", "Paste a labeled list from your own classifier. The media never leaves where it is."],
  ["Start Osprey rules and a Coop setup", "premortem", "var(--t-pm)", "radar", "From a pre-mortem's top risks: an Osprey rules file and a Coop setup checklist.", true],
  ["Turn a rewrite into a policy file", "policy", "var(--t-pol)", "doc", "Download the stress-tester's rewrite in the format open safety models read.", true]
];
// What it uses: [name, what for, link text, link]
const RO_USES = [
  ["ROOST's public docs and code", "The Osprey rule syntax and the Coop setup terms come from ROOST's documentation, example rules and source on GitHub, read in October 2026.", "roostorg on GitHub", "https://github.com/roostorg"],
  ["MiniLMv2 toxicity model", "The in-browser baseline. Apache-2.0, about 24 MB, distilled from Unitary's toxic-bert and trained on Jigsaw's toxic comment data. Downloads only when you click.", "Model card", "https://huggingface.co/minuva/MiniLMv2-toxic-jigsaw-onnx"],
  ["Transformers.js", "Hugging Face's library that runs the baseline model in your browser, loaded from jsDelivr. Version 3.8.1, pinned.", "Transformers.js", "https://huggingface.co/docs/transformers.js"],
  ["PolicyLM-1.7B", "Optional, on your own computer. Musubi's small open-weight model that scores content against the policy you write, released with ROOST in October 2026. Run by the runner script; needs Python and a 3.5 GB download.", "Model card", "https://huggingface.co/musubilabs/policylm-1.7b"],
  ["gpt-oss-safeguard", "Optional, on your own computer. OpenAI's open-weight safety model, run with Ollama by the runner script.", "The runner script", RO_GH + "/ts-workbench/tree/main/tools/open-model-eval"],
  ["Claude", "Optional, in the Claude version only. Writes test cases and labels them, on your own Claude account.", "", ""],
  ["Nothing else", "No server and no accounts. What you type stays in your browser, and the model files above download only when you ask. Page views are counted anonymously, without cookies.", "", ""]
];
function renderRoost(){
  const ext = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text} ${icon("arrow")}</a>`;
  const meta = `<span class="wip-tag">Work in progress</span><a class="btn sm" href="https://roost.tools" target="_blank" rel="noopener">ROOST's site</a><a class="btn sm primary" href="#eval">Open the classifier eval</a>`;
  view.innerHTML = head("Works with ROOST", "ROOST makes free, open-source trust and safety tools. The workbench helps you decide what to build; ROOST's tools are what you can build with. Here's where they meet.", "Overview", meta) + `<article class="ab">
    <section class="ab-sec rise">
      <h2>What you can do today</h2>
      <div class="ab-tools">${RO_NOW.map(([t, r, c, ic, d, wip]) => `<div class="ab-tool"><span class="sb-glyph" style="background:${c}"><svg><use href="#i-${ic}"/></svg></span><div><h3><a href="#${r}">${t}</a>${wip ? ' <span class="wip-tag">Starter, untested</span>' : ""}</h3><p>${d}</p></div></div>`).join("")}</div>
      <p class="note" style="margin-top:12px">None of this is a ROOST integration: the workbench makes files and numbers you take to ROOST's tools yourself. Starters have every platform-specific value marked TODO and have never run against a real deployment.</p>
    </section>

    <section class="ab-sec rise">
      <h2>ROOST's tools</h2>
      <div class="ab-tools">${RO_TOOLS.map(([n, href, d]) => `<div class="ab-tool"><span class="sb-glyph" style="background:var(--accent)"><svg><use href="#i-plug"/></svg></span><div><h3>${ext(href, n)}</h3><p>${d}</p></div></div>`).join("")}</div>
    </section>

    <section class="ab-sec rise">
      <h2>What it uses</h2>
      <div class="ab-dec">${RO_USES.map(([n, d, lt, lh]) => `<div><h3>${n}</h3><p>${d}${lt ? ` ${ext(lh, lt)}` : ""}</p></div>`).join("")}</div>
      <p class="note" style="margin-top:12px">Everything the workbench uses, with licenses, is on one page: <a href="#credits">Built with</a>.</p>
    </section>

    <section class="ab-sec rise">
      <h2>How this was made</h2>
      <div class="ab-dec">
        <div><h3>Built from public sources</h3><p>Each export follows a format ROOST publishes. Nothing was copied from private material, and nothing here was made with or reviewed by ROOST.</p></div>
        <div><h3>Checked, not deployed</h3><p>The generated files are checked by automated tests: valid structure, every platform-specific value marked TODO, labels on every file. They have not been run in Osprey or Coop.</p></div>
        <div><h3>Made with AI help</h3><p>Steven Macchia built it with Claude Code, Anthropic's coding assistant, which helped write the code and check the sources. Automated tests run on every build.</p></div>
        <div><h3>One file, open source</h3><p>Plain JavaScript in one HTML file, MIT licensed. Your work is saved only in this browser. ${ext(RO_GH + "/ts-workbench", "ts-workbench")}</p></div>
      </div>
    </section>

    <section class="ab-sec ab-note rise">
      <h2>Where this stands</h2>
      <p>An early start; expect changes. The workbench is an independent project, not made by or affiliated with ROOST. Some recommendations in other tools name Coop, Osprey or gpt-oss-safeguard as free options, and two reference files map ${ext(RO_GH + "/ts-metrics-framework/blob/main/running-on-coop.md", "the metrics to Coop's data")} and ${ext(RO_GH + "/abuse-premortem/blob/main/data/roost-harm-taxonomy.yaml", "the risk areas to ROOST's taxonomy")}.</p>
    </section>
  </article>`;
}
