/* =========================================================
   ABOUT THIS PROJECT (case study for reviewers)
   Fill in AUTHOR to put your name on the page.
   ========================================================= */
const AUTHOR = {name:"Steven Macchia", title:"Trust and Safety Leader", link:"https://www.linkedin.com/in/stevenmacchia"};
function renderAbout(){
  const lawSteps = SCENARIOS.reduce((a,s)=>a+s.steps.filter(x=>x.law).length, 0);
  const versions = SCENARIOS.reduce((a,s)=>a+(s.vars ? ALL_TYPES.length : 1), 0);
  const by = AUTHOR.name ? `Designed and directed by <strong>${esc(AUTHOR.name)}</strong>${AUTHOR.title ? ", " + esc(AUTHOR.title) : ""}.` : "Designed and directed by a trust and safety leader.";
  const stats = [[HARMS.length,"abuse risks modeled"],[Object.keys(SG).length,"safeguards with owners"],[versions,"tabletop scenario versions"],[lawSteps,"decisions with law notes"],[REGIONS.length,"jurisdictions mapped"],[METRICS.length,"program metrics"]];
  const tools = [
    ["t-pm","radar","Abuse pre-mortem","A plain-language profile of any product becomes a scored risk register, a prioritized launch plan with owners, the laws that likely apply, and the policy decisions to make."],
    ["t-tt","siren","Incident tabletop",`${SCENARIOS.length} crisis scenarios across eight sectors, tailored to the company type you choose. Every weaker answer becomes a lesson: what happened, the stronger call, the principle and the law.`],
    ["t-mx","gauge","Metrics framework","The scorecard a T&S leader brings to an executive review, tailored to platform, stage and regulation, with the trap behind every metric."],
    ["t-vd","scale","Vendor scorecard","Weighted comparison of moderation vendors with wellness and security minimums and ready-to-use RFP questions."],
    ["t-pol","doc","Policy stress-tester","Paste a platform rule to get an instant clarity check, then an AI review with vague terms, missing exceptions, eight edge cases, relevant laws and a clearer rewrite."],
    ["t-ai","mail","Enforcement notice writer","Drafts a clear, fair notice to a user who was actioned, with a short version and a check against what an EU statement of reasons must include."],
    ["t-ai","appeal","Appeal reviewer","A structured second opinion on an appeal: each element of the rule tested against the facts, the user's arguments weighed, and a suggested reply. A person makes the final call."],
    ["t-ai","chart","Transparency report drafter","Turns enforcement numbers, including your Metrics scorecard, into report sections, and lists what the EU Digital Services Act would expect that is still missing."]
  ];
  const decisions = [
    ["Private by default","Work is stored on the visitor's own device, so teams can describe unreleased products freely. AI features run only on a click, on the visitor's own Claude account, which keeps them free to offer. Export and import move work between devices."],
    ["Plain language first","Questions are written for product managers and founders, not specialists. Terms like CSAM, KYC or sextortion explain themselves on hover."],
    ["Every number explains itself","Each risk rating lists the answers that raised or lowered it. Nothing is a black box, so the output can be challenged and defended."],
    ["Summary before detail","Reports open with the five actions that matter most. Long lists are grouped, filtered to critical and high by default, and expand on demand."],
    ["Keyboard and speed","A ⌘K command palette reaches any tool, scenario or saved result. Questions answer with number keys. There's no framework, backend or loading screen."],
    ["Accessible in both themes","Tuned light and dark themes, visible focus states, labelled controls, reduced-motion support and layouts that work down to phone width."]
  ];
  view.innerHTML = `<article class="ab">
    <header class="ab-hero rise">
      <span class="ab-kicker">Case study</span>
      <h1>T&amp;S Workbench</h1>
      <p class="ab-lede">A free, private toolkit that helps any product team find abuse risks before launch, rehearse crises, and run a trust and safety program with confidence.</p>
      ${AUTHOR.name ? `<p class="ab-by"><span class="sb-av">${esc(AUTHOR.name.split(" ").map(w=>w[0]).join("").slice(0,2))}</span><span>By <b>${esc(AUTHOR.name)}</b>${AUTHOR.title ? `<br>${esc(AUTHOR.title)}` : ""}</span>${AUTHOR.link ? `<a class="btn sm" href="${esc(AUTHOR.link)}" target="_blank" rel="noopener">LinkedIn ${icon("arrow")}</a>` : ""}</p>` : ""}
      <div class="ab-meta">
        <div><span>Role</span><b>Product design, T&amp;S strategy and content</b></div>
        <div><span>Format</span><b>Single-file web app, no backend</b></div>
        <div><span>Status</span><b>Live and free to use</b></div>
      </div>
      <div class="row" style="gap:8px"><a class="btn primary" href="#premortem">Try the pre-mortem ${icon("arrow")}</a><a class="btn" href="#tabletop">Take a tabletop</a></div>
    </header>

    <section class="ab-stats rise" aria-label="By the numbers">${stats.map(([n,l])=>`<div><b class="mono">${n}</b><span>${l}</span></div>`).join("")}</section>

    <section class="ab-sec rise">
      <h2>The problem</h2>
      <p>Most products meet trust and safety after launch, when the first scam, grooming case or regulator letter arrives. Product teams rarely have a structured way to ask “how will this be abused?”, and the specialists who can answer it are stretched thin.</p>
      <p>Trust and safety leaders face a second gap: the judgment the job needs, in crises, with regulators and under pressure, is mostly learned the hard way. Training material is scarce, generic, or locked inside expensive enterprise platforms.</p>
    </section>

    <section class="ab-sec rise">
      <h2>What it does</h2>
      <div class="ab-tools">${tools.map(([c,i,n,d])=>`<div class="ab-tool"><span class="sb-glyph" style="background:var(--${c})"><svg><use href="#i-${i}"/></svg></span><div><h3>${n}</h3><p>${d}</p></div></div>`).join("")}</div>
    </section>

    <section class="ab-sec rise">
      <h2>How the risk engine thinks</h2>
      <p>Each of the ${HARMS.length} modeled harms has an inherent severity and a baseline likelihood. The platform profile then moves them: stranger contact raises grooming and scam likelihood, verified identity lowers it, a young audience raises severity.</p>
      <div class="ab-formula" aria-label="Severity times likelihood equals score">
        <span class="ab-f"><small>Severity</small><b>4</b><em>Critical harm</em></span><span class="ab-op">×</span>
        <span class="ab-f"><small>Likelihood</small><b>3</b><em>Likely here</em></span><span class="ab-op">=</span>
        <span class="ab-f ab-out"><small>Score</small><b>12</b><em>Critical</em></span>
      </div>
      <p>Safeguards take the priority of the most serious risk they cover, and anything the law likely requires in a chosen jurisdiction becomes a launch blocker. Every rating shows the exact answers that drove it.</p>
    </section>

    <section class="ab-sec rise">
      <h2>Designed for learning</h2>
      <p>The tabletop turns mistakes into teaching moments. Pick a weaker call and you see what happened, how your choice compares with the strongest one on safety, trust, regulatory standing and team capacity, the principle behind it, and the relevant law. Then you can try again. Debriefs name your blind spot and suggest what to practice next.</p>
      <p>Universal scenarios, like an account takeover wave or a government takedown order, rewrite themselves for eight company types, so a fintech team and a gaming studio each rehearse their own version of the crisis.</p>
    </section>

    <section class="ab-sec rise">
      <h2>Design decisions</h2>
      <div class="ab-dec">${decisions.map(([t,d])=>`<div><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
    </section>

    <section class="ab-sec rise">
      <h2>How it was built</h2>
      <p>${by} Built as a single HTML file with no frameworks, accounts or servers, using AI-assisted development. Automated checks play every tabletop scenario in every tailored version, render every screen and report, and verify the scoring engine against eight example products before each release.</p>
      ${AUTHOR.link ? `<p><a href="${esc(AUTHOR.link)}" target="_blank" rel="noopener">Connect with ${esc(AUTHOR.name || "the author")} ${icon("arrow")}</a></p>` : ""}
    </section>

    <section class="ab-sec ab-note rise">
      <h2>Limits and what's next</h2>
      <p>This is a starting point for conversations with Legal, Policy and Engineering, not legal advice. Law notes reflect regulation as generally understood in mid-2026. Next on the roadmap: shared team workspaces, more jurisdictions, localized scenarios and exportable board-ready summaries.</p>
    </section>
  </article>`;
}
