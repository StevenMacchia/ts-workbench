/* =========================================================
   SEND TO TRACKER: launch plans and roadmaps as tasks in Jira, Asana, Linear or GitHub
   A CSV for bulk import, or a button that opens one pre-filled issue at a time. No logins or tokens.
   ========================================================= */
const TK_TRACKERS = [
  {k:"jira", n:"Jira", csv:true, link:true, pr:["", "Low", "Medium", "High", "Highest"]},
  {k:"asana", n:"Asana", csv:true, link:false, pr:["", "Low", "Medium", "High", "Urgent"]},
  {k:"linear", n:"Linear", csv:true, link:true, pr:["", "Low", "Medium", "High", "Urgent"]},
  {k:"github", n:"GitHub Issues", csv:false, link:true, pr:["", "Low", "Medium", "High", "Urgent"]}
];
const TK_HOW = {
  jira:"Import the file with Jira's CSV importer (Import issues from CSV) and match Summary, Description, Priority and Labels. For one-click issues, add your site and the project and issue type IDs below.",
  asana:"In the Asana project that should hold these tasks, import the file with Asana's CSV importer. Name stays the first column, and Section groups the tasks by priority or phase.",
  linear:"The file follows Linear's CSV template (Title, Description, Priority, Status, Labels) for its import tools. To add tasks one at a time, use the Create buttons.",
  github:"GitHub has no CSV import, so create issues one at a time. Each button opens a new issue in your repository with the title and description filled in."
};
let tkCfg = Object.assign({tracker:"jira", jiraSite:"", jiraPid:"", jiraType:"", linearTeam:"", ghRepo:""}, store.get("tk:cfg", {}) || {});
let tk = {src:"", tasks:[], sel:{}, opened:{}};
const tkSlug = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const tkClip = (s, n) => s.length > n ? s.slice(0, n - 1).trim() + "…" : s;

/* ---------- where tasks come from ---------- */
function tkFromPremortem(){
  const r = assess(pm), name = pm.name || "Untitled assessment", tier = rank => TIERS.find(t => t.r === rank) || TIERS[TIERS.length - 1];
  return r.safeguards.filter(s => s.rank >= 1).map(s => ({
    id:"pm-" + s.id, title:s.t, group:tier(s.rank).n, owner:OWNERS[s.o] || "", pr:s.rank === 3 ? 4 : s.rank === 2 ? 3 : 2, done:!!pm.done[s.id], def:s.rank >= 2 && !pm.done[s.id],
    labels:["trust-and-safety", "abuse-premortem", "team-" + tkSlug(OWNERS[s.o])].concat(s.rank === 3 ? ["launch-blocker"] : []),
    desc:[s.t, "",
      `Priority: ${tier(s.rank).n}. ${tier(s.rank).h}.`,
      s.covers.length ? `Why: covers ${s.covers.join("; ")}${s.critCovers ? ` (${s.critCovers} critical)` : ""}.` : null,
      `Owner: ${OWNERS[s.o] || "Unassigned"}. ${EFFORT[s.e] || ""}.`,
      s.legal === "applies" ? `Legal: likely required by ${(s.laws || []).join("; ")}. Confirm with counsel.` : s.legal === "may" ? `Legal: may be required by ${(s.laws || []).join("; ")}. Confirm with counsel.` : null,
      "", `From the abuse pre-mortem "${name}", made with T&S Workbench.`].filter(x => x !== null).join("\n")
  }));
}
function tkFromCoverage(){
  return cvActions(cv).map((x, i) => ({
    id:`cv-${x.row.a.k}-${x.layer.k}`, title:x.text, group:x.row.status === "exposed" ? "Exposed: critical risk, thin coverage" : "Gaps: risk outruns coverage", owner:"", area:x.row.a.n, pr:x.row.status === "exposed" ? 4 : 3, done:false, def:i < 12,
    labels:["trust-and-safety", "coverage", "coverage-" + x.layer.k],
    desc:[x.text, "", `${x.row.a.n}: ${x.row.status === "exposed" ? "exposed (critical risk, under half the coverage it needs)" : "risk outruns coverage"}. ${cvRiskWords(x.row).replace(/^./, c => c.toUpperCase())}, ${x.row.cov}% coverage.`,
      `Layer: ${x.layer.n}, currently ${x.level === undefined ? "not rated" : CV_LEVELS[x.level].toLowerCase()}. ${x.layer.q}`, "", "From a coverage radar made with T&S Workbench."].join("\n")
  }));
}
function tkFromMaturity(){
  const out = [];
  maRoadmap(ma).forEach(s => { const ph = MA_PHASES.find(p => p[0] === s.phase);
    s.acts.forEach((a, i) => out.push({
      id:`ma-${s.a.k}${s.from}-${i}`, title:a, group:`${ph[1]} (${ph[2]})`, owner:"", pr:s.phase === "now" ? 3 : s.phase === "next" ? 2 : 1, done:!!ma.done[s.a.k + s.from + "-" + i], def:!ma.done[s.a.k + s.from + "-" + i],
      labels:["trust-and-safety", "program-maturity", "maturity-" + s.a.k],
      desc:[a, "", `Program maturity: ${s.a.n}, from level ${s.from} (${MA_LEVELS[s.from - 1].n}) to level ${s.to} (${MA_LEVELS[s.to - 1].n}).`,
        `Why it matters: ${s.a.why}`, `When: ${ph[1]}, ${ph[2].toLowerCase()}.`, "", "From a program maturity assessment made with T&S Workbench."].join("\n")
    })); });
  return out;
}

/* ---------- formats ---------- */
function tkCsv(rows){ return rows.map(r => r.map(v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`).join(",")).join("\r\n") + "\r\n"; }
function tkCsvFor(k, tasks){
  const T = TK_TRACKERS.find(t => t.k === k);
  if(k === "jira") return tkCsv([["Summary", "Description", "Issue Type", "Priority", "Labels", "Labels", "Labels", "Labels"]]
    .concat(tasks.map(t => [tkClip(t.title, 250), t.desc, "Task", T.pr[t.pr], ...[0, 1, 2, 3].map(i => t.labels[i] || "")])));
  if(k === "asana") return tkCsv([["Name", "Description", "Section", "Assignee", "Due Date", "Priority"]]
    .concat(tasks.map(t => [t.title, t.desc + (t.owner ? `\n\nTeam: ${t.owner}` : ""), t.group, "", "", T.pr[t.pr]])));
  if(k === "linear") return tkCsv([["Title", "Description", "Priority", "Status", "Labels"]]
    .concat(tasks.map(t => [tkClip(t.title, 250), t.desc, T.pr[t.pr], "Todo", t.labels.join(",")])));
  return "";
}
function tkLink(k, t){
  const q = o => Object.entries(o).filter(([, v]) => v).map(([a, v]) => a + "=" + encodeURIComponent(v)).join("&");
  const T = TK_TRACKERS.find(x => x.k === k);
  if(k === "jira"){
    const site = tkCfg.jiraSite.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if(!site || !/^\d+$/.test(tkCfg.jiraPid.trim()) || !/^\d+$/.test(tkCfg.jiraType.trim())) return null;
    return `https://${site}/secure/CreateIssueDetails!init.jspa?` + q({pid:tkCfg.jiraPid.trim(), issuetype:tkCfg.jiraType.trim(), summary:tkClip(t.title, 250), description:t.desc});
  }
  if(k === "linear") return "https://linear.new?" + q({title:tkClip(t.title, 250), description:t.desc, priority:T.pr[t.pr], team:tkCfg.linearTeam.trim()});
  if(k === "github"){
    const repo = tkCfg.ghRepo.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/+$/, "");
    if(!/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
    return `https://github.com/${repo}/issues/new?` + q({title:tkClip(t.title, 250), body:t.desc});
  }
  return null;
}

/* ---------- the dialog ---------- */
function tkCfgHTML(k){
  const f = (id, lab, ph, hint) => `<div class="field"><label for="tk-${id}">${lab}</label><input class="input" id="tk-${id}" data-tkcfg="${id}" value="${esc(tkCfg[id] || "")}" placeholder="${esc(ph)}" autocomplete="off">${hint ? `<span class="note">${hint}</span>` : ""}</div>`;
  if(k === "jira") return `<details class="tk-more" ${tkCfg.jiraSite ? "open" : ""}><summary>One-click Jira issues (optional)</summary><div class="tk-cfg three">
    ${f("jiraSite", "Jira site", "yourteam.atlassian.net")}${f("jiraPid", "Project ID", "10000")}${f("jiraType", "Issue type ID", "10001")}</div>
    <p class="note">Both IDs are numbers. Your Jira admin can find them, or look for <span class="mono">pid=</span> in the address bar when creating an issue in the project.</p></details>`;
  if(k === "linear") return `<div class="tk-cfg">${f("linearTeam", "Team (optional)", "Team key or name, e.g. TNS", "Leave blank to pick the team in Linear.")}</div>`;
  if(k === "github") return `<div class="tk-cfg">${f("ghRepo", "Repository", "owner/repository", "Issues open in this repository. You need to be signed in to GitHub.")}</div>`;
  return "";
}
function tkListHTML(){
  const k = tkCfg.tracker, T = TK_TRACKERS.find(t => t.k === k), n = tk.tasks.filter(t => tk.sel[t.id]).length;
  let group = "";
  return `<div class="tk-lh"><label class="tk-all"><input type="checkbox" data-tkall="1" ${n === tk.tasks.length ? "checked" : ""}> ${n} of ${tk.tasks.length} selected</label>
      ${T.link && !tkLink(k, tk.tasks[0] || {title:"", desc:"", pr:2}) ? `<span class="note">Fill in the settings above to create issues one at a time.</span>` : ""}</div>
    <div class="tk-rows">${tk.tasks.map(t => { const url = T.link ? tkLink(k, t) : null, head = t.group !== group ? `<div class="tk-g">${esc(group = t.group)}</div>` : "";
      return head + `<div class="tk-row ${t.done ? "done" : ""}"><label><input type="checkbox" data-tksel="${esc(t.id)}" ${tk.sel[t.id] ? "checked" : ""}>
        <span class="tk-t"><b>${esc(t.title)}</b><small>${[T.pr[t.pr] + " priority", t.area, t.owner, t.done ? "Done" : ""].filter(Boolean).map(esc).join(" · ")}</small></span></label>
        ${url ? `<a class="btn sm ${tk.opened[t.id] ? "" : "ghost"}" href="${esc(url)}" target="_blank" rel="noopener" data-tkopen="${esc(t.id)}">${tk.opened[t.id] ? "Opened ✓" : "Create in " + esc(T.n.split(" ")[0])}</a>` : ""}</div>`; }).join("")}</div>`;
}
function tkDialogHTML(){
  const k = tkCfg.tracker, T = TK_TRACKERS.find(t => t.k === k), n = tk.tasks.filter(t => tk.sel[t.id]).length;
  return `<header class="tk-h"><div><h3 id="tk-h">Send to your tracker</h3><p class="note">${tk.tasks.length} task${tk.tasks.length === 1 ? "" : "s"} from ${esc(tk.src)}</p></div>
      <button type="button" class="btn sm icon" data-tkclose="1" aria-label="Close"><svg><use href="#i-x"/></svg></button></header>
    <div class="segs tk-tr" role="group" aria-label="Tracker">${TK_TRACKERS.map(t => `<button type="button" data-tktr="${t.k}" aria-pressed="${t.k === k}">${t.n}</button>`).join("")}</div>
    <p class="tk-how">${esc(TK_HOW[k])}</p>
    ${tkCfgHTML(k)}
    <div class="tk-list" id="tk-list">${tkListHTML()}</div>
    <footer class="tk-f"><span class="toast" id="tk-toast" aria-live="polite"></span>
      ${T.csv ? `<button type="button" class="btn primary" data-tkcsv="1" ${n ? "" : "disabled"}><svg><use href="#i-download"/></svg>Download CSV for ${esc(T.n)} (${n})</button>` : `<span class="note">Use the Create buttons to open each issue.</span>`}</footer>`;
}
function tkOpen(src){
  if(src === "premortem"){ tk = {src:`the pre-mortem "${pm.name || "Untitled assessment"}"`, tasks:tkFromPremortem(), sel:{}, opened:{}}; }
  else if(src === "coverage"){ tk = {src:"your coverage gaps", tasks:tkFromCoverage(), sel:{}, opened:{}}; }
  else { tk = {src:"your maturity roadmap", tasks:tkFromMaturity(), sel:{}, opened:{}}; }
  tk.tasks.forEach(t => { tk.sel[t.id] = t.def; });
  const prev = document.activeElement, bg = document.createElement("div");
  bg.className = "tk-bg"; bg.innerHTML = `<div class="tk" role="dialog" aria-modal="true" aria-labelledby="tk-h" id="tk">${tkDialogHTML()}</div>`;
  const box = bg.querySelector("#tk"), redraw = () => { box.innerHTML = tkDialogHTML(); }, list = () => { box.querySelector("#tk-list").innerHTML = tkListHTML(); const c = box.querySelector("[data-tkcsv]"); const n = tk.tasks.filter(t => tk.sel[t.id]).length; if(c){ c.disabled = !n; c.lastChild.textContent = `Download CSV for ${TK_TRACKERS.find(t => t.k === tkCfg.tracker).n} (${n})`; } };
  const close = () => { bg.remove(); document.removeEventListener("keydown", key); if(prev && prev.focus) prev.focus(); };
  const key = e => { if(e.key === "Escape") close(); };
  bg.addEventListener("click", e => {
    if(e.target === bg || e.target.closest("[data-tkclose]")) return close();
    const b = e.target.closest("[data-tktr],[data-tkcsv],[data-tkopen]"); if(!b) return;
    if(b.dataset.tktr){ tkCfg.tracker = b.dataset.tktr; store.set("tk:cfg", tkCfg); redraw(); const s = box.querySelector(`[data-tktr="${tkCfg.tracker}"]`); if(s) s.focus(); }
    if(b.dataset.tkcsv){ const k = tkCfg.tracker, rows = tk.tasks.filter(t => tk.sel[t.id]), csv = tkCsvFor(k, rows);
      offerFile(`ts-workbench-${tkSlug(tk.src.replace(/^the /, "")).slice(0, 40)}-${k}.csv`, csv, csv, box.querySelector("#tk-toast")); }
    if(b.dataset.tkopen){ tk.opened[b.dataset.tkopen] = true; setTimeout(list, 50); }
  });
  bg.addEventListener("change", e => { const t = e.target;
    if(t.dataset.tksel){ tk.sel[t.dataset.tksel] = t.checked; list(); }
    if(t.dataset.tkall){ tk.tasks.forEach(x => { tk.sel[x.id] = t.checked; }); list(); }
  });
  bg.addEventListener("input", e => { const t = e.target; if(t.dataset.tkcfg){ tkCfg[t.dataset.tkcfg] = t.value; store.set("tk:cfg", tkCfg); list(); } });
  document.addEventListener("keydown", key); document.body.appendChild(bg);
  const first = box.querySelector('[aria-pressed="true"]'); if(first) first.focus();
}
