/* =========================================================
   BUILT WITH (credits and sources)
   Every model, library, service, program and public source the workbench uses or names, who made it, what it is used
   for, and its terms. One place, so each tool's page can stay short. Add here when something new is used. The ROOST
   page keeps its own short "What it uses" list and links here for the rest.
   ========================================================= */
const CR_GROUPS = [
  {t:"Models that read content", ic:"eval", c:"var(--t-ai)", intro:"Each one downloads from its maker's own repository, unchanged, and only when you ask. Nothing from them is bundled into this page.", items:[
    ["MiniLMv2 toxic", "minuva, distilled from Unitary's toxic-bert and trained on Jigsaw's Toxic Comment data", "The free baseline in the classifier eval. About 24 MB, runs in your browser.", "Apache-2.0", "https://huggingface.co/minuva/MiniLMv2-toxic-jigsaw-onnx"],
    ["toxic-bert", "Unitary, with an ONNX port by Xenova", "The eval's fallback baseline when MiniLMv2 can't load. About 111 MB.", "Apache-2.0", "https://huggingface.co/Xenova/toxic-bert"],
    ["PolicyLM-1.7B", "Musubi, released with ROOST in October 2026", "Scores your cases against the policy you write, on your own computer, through the runner script. 3.5 GB.", "Apache-2.0", "https://huggingface.co/musubilabs/policylm-1.7b"],
    ["gpt-oss-safeguard", "OpenAI", "Labels your cases against a written policy and explains each label, on your own computer with Ollama, through the runner script. 14 GB.", "Apache-2.0", "https://huggingface.co/openai/gpt-oss-safeguard-20b"],
    ["Claude", "Anthropic", "In the Claude version only: writes test cases and labels them, reviews rules, drafts notices and appeal replies. Runs on your own Claude account, under Anthropic's terms.", "", "https://www.anthropic.com"]
  ]},
  {t:"Open-source trust and safety tools", ic:"plug", c:"var(--accent)", intro:"The workbench writes files in formats these projects publish. It does not connect to any of them, and none of them made or reviewed it.", items:[
    ["ROOST", "Robust Open Online Safety Tools, a nonprofit", "The pre-mortem's starters follow Coop's setup and Osprey's rule syntax; the eval's model notes follow its Model Community guides.", "", "https://roost.tools"],
    ["Coop", "ROOST", "A review console you host yourself. The pre-mortem writes a setup checklist in its terms.", "Open source", "https://github.com/roostorg/coop"],
    ["Osprey", "ROOST, built at Discord", "A real-time rules engine. The pre-mortem writes a starter rules file in its syntax.", "Open source", "https://github.com/roostorg/osprey"],
    ["Hasher-Matcher-Actioner", "Meta, open source; the hash-matching piece Coop uses", "Named in the Coop starter.", "Open source", "https://github.com/facebook/ThreatExchange"],
    ["Policy format for open safety models", "The four-part layout (overview, terms, interpretation, labels) that gpt-oss-safeguard and Zentropi's CoPE read", "The eval's and the stress-tester's policy files use it.", "", "https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide"]
  ]},
  {t:"Libraries and services", ic:"layers", c:"var(--faint)", intro:"What the page is made of and served by.", items:[
    ["Transformers.js 3.8.1", "Hugging Face", "Runs the baseline model in your browser. Loaded from jsDelivr only when you click.", "Apache-2.0", "https://huggingface.co/docs/transformers.js"],
    ["jsDelivr", "Prospect One", "The open content delivery network that serves Transformers.js.", "", "https://www.jsdelivr.com"],
    ["Hugging Face Hub", "Hugging Face", "Hosts the model files your browser or the runner script downloads.", "", "https://huggingface.co"],
    ["GitHub Pages", "GitHub", "Serves this page. The source is public in the same repository.", "", "https://github.com/StevenMacchia/ts-workbench"],
    ["Cloudflare Web Analytics", "Cloudflare", "Counts visits without cookies. It never sees what you type.", "", "https://www.cloudflare.com/web-analytics/"],
    ["Inter, Instrument Sans and IBM Plex Mono", "Rasmus Andersson; Rodrigo Fuenzalida; IBM. Served by Google Fonts", "The typefaces: Inter and Instrument Sans for text, IBM Plex Mono for data.", "SIL Open Font License", "https://fonts.google.com"],
    ["Node.js, Python, PyTorch and Ollama", "The OpenJS Foundation; the Python Software Foundation; the PyTorch Foundation; Ollama", "Only for the runner scripts you run on your own computer. vLLM and LM Studio work too.", "", "https://github.com/StevenMacchia/ts-workbench/tree/main/tools/open-model-eval"]
  ]},
  {t:"Programs and bodies named in recommendations", ic:"shield", c:"var(--t-pm)", intro:"Recommendations name these as options. The workbench has no connection to any of them.", items:[
    ["NCMEC", "National Center for Missing & Exploited Children", "The US body for CyberTipline reports, and a hash list.", "", "https://www.missingkids.org"],
    ["Internet Watch Foundation", "IWF, UK", "A hash list and reporting body.", "", "https://www.iwf.org.uk"],
    ["PhotoDNA", "Microsoft", "Image hash matching, named as a tooling option.", "", "https://www.microsoft.com/en-us/photodna"],
    ["Safer", "Thorn", "Hash matching and classifiers for child safety, named as a tooling option. Thorn's research is also cited in the tabletop.", "", "https://www.thorn.org"],
    ["Hash-sharing database", "Global Internet Forum to Counter Terrorism (GIFCT)", "Named as the hash-sharing program for terrorist content.", "", "https://gifct.org"],
    ["Lantern", "Tech Coalition", "Named as the cross-platform signal-sharing program for child safety.", "", "https://www.technologycoalition.org"]
  ]},
  {t:"Laws, frameworks and research the content draws on", ic:"doc", c:"var(--t-ds)", intro:"Every law note and evidence line links to its own source where it appears. This is the roll-up.", items:[
    ["Digital Services Act", "European Union, Regulation (EU) 2022/2065", "The DSA readiness tool, the transparency report, and the notice writer's statement-of-reasons check.", "", "https://eur-lex.europa.eu/eli/reg/2022/2065/oj"],
    ["COPPA Rule", "US Federal Trade Commission, 16 CFR Part 312, as amended in 2025", "The COPPA readiness tool.", "", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312"],
    ["Online Safety Act codes", "Ofcom, UK", "The program maturity model maps each area to Ofcom's illegal content and children's codes.", "", "https://www.ofcom.org.uk/online-safety"],
    ["Safe Framework Specification", "Digital Trust & Safety Partnership, June 2025", "The maturity model maps each area to DTSP's commitments and practices.", "", "https://dtspartnership.org"],
    ["Research and reports cited in the tabletop", "Thorn; the FBI's IC3; Freedom House; the OECD and EUIPO; NIST; Meta's Oversight Board and enforcement reports; Sap et al. (ACL 2019); Mire et al. (NAACL 2025)", "Evidence lines in the incident tabletop's scenarios, each linked where it appears.", "", "#tabletop"]
  ]}
];
function renderCredits(){
  const ext = (href, text) => href.charAt(0) === "#" ? `<a href="${href}">${text}</a>` : `<a href="${href}" target="_blank" rel="noopener">${text} ${icon("arrow")}</a>`;
  const n = CR_GROUPS.reduce((a, g) => a + g.items.length, 0);
  const meta = `<a class="btn sm" href="#about">About this project</a><a class="btn sm primary" href="https://github.com/StevenMacchia/ts-workbench" target="_blank" rel="noopener">Source on GitHub</a>`;
  view.innerHTML = head("Built with", `The ${n} models, tools, services and public sources the workbench uses or names, who made each one, what it is used for, and on what terms. The workbench is an independent project: none of these organizations made, reviewed or endorsed it.`, "Credits and sources", meta) + `<article class="ab">
    ${CR_GROUPS.map(g => `<section class="ab-sec rise">
      <h2>${g.t}</h2>
      <p class="note" style="margin:-6px 0 14px">${g.intro}</p>
      <div class="ab-tools">${g.items.map(([name, maker, use, lic, href]) => `<div class="ab-tool"><span class="sb-glyph" style="background:${g.c}"><svg><use href="#i-${g.ic}"/></svg></span><div><h3>${ext(href, esc(name))}${lic ? ` <span class="pill">${esc(lic)}</span>` : ""}</h3><p><strong>${esc(maker)}.</strong> ${esc(use)}</p></div></div>`).join("")}</div>
    </section>`).join("\n")}

    <section class="ab-sec rise">
      <h2>Terms</h2>
      <div class="ab-dec">
        <div><h3>This project</h3><p>The code is MIT licensed. The content (risks, safeguards, scenarios, metrics, rubrics and prompts) is CC BY 4.0: use it, adapt it, credit it. A line like "T&amp;S Workbench by Steven Macchia, stevenmacchia.com/ts-workbench, CC BY 4.0" is enough. ${ext("https://github.com/StevenMacchia/ts-workbench/blob/main/LICENSE-CONTENT", "Content license")}</p></div>
        <div><h3>The models</h3><p>Downloaded unchanged from their makers' repositories, so each one's license and notices travel with it. The page copies nothing from them, and your text goes to a model only when you run one.</p></div>
        <div><h3>Names and marks</h3><p>Belong to their owners. Naming a program or a tool here means the workbench mentions it as an option, not that it is connected to it or recommended by it.</p></div>
        <div><h3>Missing or wrong?</h3><p>If something the workbench uses isn't listed, or a credit is wrong, say so. ${ext("https://github.com/StevenMacchia/ts-workbench/issues", "Open an issue")}</p></div>
      </div>
    </section>
  </article>`;
}
