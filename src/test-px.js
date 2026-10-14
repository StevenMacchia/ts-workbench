// Checks the incident post-mortem: the guided flow, the scoring (for the response, never the incident), the three actions and the
// tracker tasks, the document in both versions, the Slack message, saving, opening and sharing, and every registration point,
// without a browser. Pattern follows test-cp.js.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = async function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|\[object).{30}/) || [""])[0];
  const clone = o => JSON.parse(JSON.stringify(o)), words = t => (t.match(/\S+/g) || []).length;
  document.querySelector = () => null; // the finish focuses the heading
  let undos = 0; withUndo = () => { undos++; };
  location.hash = "#postmortem";
  const cur = () => gdLive(gdCur)[gdPos("postmortem").i];
  const next = () => gdGo(gdCur, "next");
  const pick = k => { gdPick(gdCur, k); clearTimeout(gdGo.t); };

  /* ---------- 1. the flow ---------- */
  px = PX_BLANK(); pxView = null; gdReset("postmortem"); renderPostmortem(); let h = view.innerHTML;
  if(bad(h)) throw new Error("intro bad: " + where(h));
  eq(/Write the post-mortem people will actually read/.test(h) && /data-gd="start"/.test(h), true, "the intro and its Start button");
  eq([...new Set(h.match(/data-gd="alt\d+"/g) || [])].length, 1, "one alternative way in"); eq(/See an example/.test(h), true, "it is the example");
  eq(/gd-preview-frame/.test(h) && /grade-C/.test(h) && /<b>60<\/b>/.test(h), true, "the inert preview shows the example's grade");
  eq(gdLive(pxSpec()).length, 16, "sixteen steps");
  gdGo(gdCur, "start"); eq(/What do you call the incident\?/.test(view.innerHTML), true, "first question: the name");
  cur().set("The comment pile-on"); next(); eq(px.name, "The comment pile-on", "the name is saved");
  eq(/What happened, in two or three sentences\?/.test(view.innerHTML) && /stays blameless/.test(view.innerHTML), true, "second question, with the blameless hint");
  cur().set("Comments piled onto one creator's video."); next();
  eq((view.innerHTML.match(/data-gdpick=/g) || []).length, 14, "fourteen kinds of harm"); pick("harass"); next(); eq(px.area, "harass", "kind of harm saved");
  eq(/Who did it affect\?/.test(view.innerHTML), true, "who it affected"); pick("one"); pick("users"); next(); eq(px.who.join(","), "one,users", "multi pick");
  pick("thousands"); next(); pick("reports"); next();
  eq(/When did each of these happen\?/.test(view.innerHTML) && /data-pxtl-t="0"/.test(view.innerHTML) && /data-pxtl-w="4"/.test(view.innerHTML), true, "the timeline step draws five rows");
  const tlNote = ["first", "signal", "declared", "contained"]; tlNote.forEach((k, i) => { px.tl[i].w = "moment " + k; });
  eq(gdAnswered(cur()), false, "four rows with text is not enough"); px.tl[4].w = "moment resolved"; eq(gdAnswered(cur()), true, "five rows is");
  ["2026-10-03T22:40", "2026-10-03T23:30", "2026-10-04T02:10", "2026-10-04T02:40", "2026-10-05T11:00"].forEach((t, i) => { px.tl[i].t = t; });
  eq(/Signal to declared:<\/b> 2h 40m/.test(gdQHTML(gdCur)) && /Declared to contained:<\/b> 30m/.test(gdQHTML(gdCur)), true, "the aside shows the gaps once the times parse");
  px.tl.push({k:"more", t:"", w:""}); eq(/Another moment/.test(pxTimelineHTML()) && /data-px="tlrm"/.test(pxTimelineHTML()), true, "an extra moment can be removed"); px.tl.pop();
  next(); eq(/What worked\?/.test(view.innerHTML), true, "what worked"); pick("lever"); pick("preserve"); next();
  eq(/What failed in prevention\?/.test(view.innerHTML), true, "prevention"); pick("__none"); eq(px.fail.prevention.join(), "ok", "'Nothing failed here' saves ok");
  eq(/What failed in detection\?/.test(view.innerHTML) && /Nothing failed here/.test(view.innerHTML), true, "and moves on to detection");
  pick("no_alert"); pick("volume"); next(); eq(px.fail.detection.join(), "no_alert,volume", "failures saved");
  pick("late"); next(); pick("__none"); eq(px.fail.communication.join(), "ok", "four layers answered");
  eq(/How severe was it/.test(view.innerHTML), true, "severity"); pick("2"); next();
  eq(/Which laws or duties did it touch\?/.test(view.innerHTML), true, "laws and duties");
  const dopts = pxDutyOpts(); eq(dopts.some(o => /Digital Services Act: core duties/.test(o.n) && o.h === "European Union"), true, "options come from the obligation list for the regions");
  eq(dopts.every(o => /^(us|eu|uk):/.test(o.k)), true, "only the profile's regions (us, eu, uk by default)"); eq(new Set(dopts.map(o => o.n)).size, dopts.length, "no duplicate laws");
  cur().toggle(dopts[0].k); eq(px.dutiesSet, true, "picking a law marks it answered"); cur().toggle(dopts[0].k); eq(px.dutiesSet, false, "taking it off again leaves it open");
  pick("__none"); eq(px.dutiesSet && px.duties.length === 0, true, "'None that we know of' sets dutiesSet");
  eq(/What did you promise, and to whom\?/.test(view.innerHTML) && /Optional/.test(view.innerHTML), true, "promises are optional");
  px.promises.push({to:"affected", w:"A direct update", by:""}); eq(/data-pxpr-w="0"/.test(pxPromisesHTML()) && /data-px="pradd"/.test(pxPromisesHTML()), true, "a promise row"); next();
  eq(/Three changes, each with an owner and a date/.test(view.innerHTML) && px.actsSeeded, true, "the actions step seeds on first render");
  eq(px.acts.length === 3 && px.acts.every(a => a.w && a.owner && a.by), true, "three rows, each with text, owner and date");
  eq(gdAnswered(cur()), true, "answered once a row has text and an owner");
  next(); eq(px.view, "report", "the last step lands on the report"); h = view.innerHTML; if(bad(h)) throw new Error("report bad: " + where(h));
  eq(/pol-verdict/.test(h) && /ev-details/.test(h) && /px-root/.test(h), true, "the report draws");
  out.push("flow: intro with preview, sixteen steps, timeline needs five rows, layers 'nothing failed', duties from the obligation list, actions seeded, lands on the report");

  /* ---------- 2. scoring ---------- */
  let s = pxScore(PX_EXAMPLE);
  eq(s.score, 60, "the example scores 60"); eq(s.grade, "C", "grade C"); eq(pxVerdict(PX_EXAMPLE, s).endsWith("The response scores 60 out of 100: a response that worked, late."), true, "verdict phrase");
  eq(s.parts.map(p => p.got).join(","), "12,10,20,8,10", "signal 12, gap 10, layers 20, worked 8, record 10");
  eq(/^The comment pile-on, 3 October: Sev 2, thousands of people reached, first seen through user reports\. /.test(pxVerdict(PX_EXAMPLE, s)), true, "the sentence names the incident, severity, reach and first signal");
  const best = Object.assign(PX_BLANK(), {detect:"alert", reach:"few", sev:"1", worked:["lever", "oncall", "lead", "scribe", "preserve"],
    fail:{prevention:["ok"], detection:["ok"], response:["ok"], communication:["ok"]}, promises:[{to:"users", w:"A note", by:"2026-10-20"}]});
  best.tl.forEach((r, i) => { r.w = "step " + i; r.t = "2026-10-03T" + ["09:00", "10:00", "10:20", "10:40", "12:00"][i]; });
  const sb = pxScore(best); eq(sb.score >= 90 && sb.grade === "A", true, "a best case scores A (" + sb.score + ")");
  const worst = Object.assign(PX_BLANK(), {detect:"public", reach:"unknown", worked:["none"], fail:{}});
  PX_LAYERS.forEach(L => { worst.fail[L[0]] = L[3].map(o => o[0]); }); worst.tl.forEach(r => { r.w = "something"; });
  const sw = pxScore(worst); eq(sw.score <= 20 && sw.grade === "F", true, "a worst case scores F (" + sw.score + ")"); eq(/Add times to score this/.test(sw.parts[1].why), true, "no times: says so");
  eq(pxScore(Object.assign(clone(PX_EXAMPLE), {sev:"1"})).score, pxScore(Object.assign(clone(PX_EXAMPLE), {sev:"3"})).score, "severity never changes the grade");
  const few = pxScore(Object.assign(clone(PX_EXAMPLE), {reach:"few"})), many = pxScore(Object.assign(clone(PX_EXAMPLE), {reach:"many"})); eq(few.score, many.score, "reach never changes the grade");
  eq(pxScore(Object.assign(clone(PX_EXAMPLE), {reach:"unknown"})).parts[4].got, 7, "only the honest-record part moves when reach is unknown");
  const early = clone(PX_EXAMPLE); early.tl[2].t = "2026-10-03T23:00"; eq(pxGaps(early).signalToDeclared, null, "a declaration before the signal is not a gap");
  early.tl[2].t = ""; eq(pxGaps(early).signalToDeclared, null, "an empty time is not a gap");
  eq(pxMins(160), "2h 40m", "160 minutes"); eq(pxMins(25), "25m", "25 minutes"); eq(pxMins(1500), "1d 1h", "1,500 minutes");
  const at = m => { const x = new Date(new Date("2026-10-03T23:30").getTime() + m * 60000), z = n => String(n).padStart(2, "0"); return `${x.getFullYear()}-${z(x.getMonth() + 1)}-${z(x.getDate())}T${z(x.getHours())}:${z(x.getMinutes())}`; };
  [30, 120, 240, 480, 1440, 1441].forEach((m, i) => { const t = clone(PX_EXAMPLE); t.tl[2].t = at(m); eq(pxScore(t).parts[1].got, [20, 15, 10, 6, 3, 0][i], "gap band " + m); });
  out.push("scoring: example 60/C (12+10+20+8+10), best case " + sb.score + "/A, worst case " + sw.score + "/F, severity and reach never move the grade, gap bands");

  /* ---------- 3. actions and tracker ---------- */
  const da = pxDraftActions(PX_EXAMPLE);
  eq(da.length, 3, "three drafted actions"); eq(da[0].src, "detection.no_alert", "the first is the detection fix (lowest layer score)");
  eq(da.every(a => a.w && a.owner && /^\d{4}-\d\d-\d\d$/.test(a.by)), true, "each has text, an owner and a date"); eq(new Set(da.map(a => a.w)).size, 3, "no duplicates");
  const one = Object.assign(PX_BLANK(), {reach:"unknown", fail:{prevention:["feature"], detection:["ok"], response:["ok"], communication:["ok"]}});
  const d1 = pxDraftActions(one); eq(d1.map(a => a.w).join("|"), [PX_FIX["prevention.feature"][0], PX_FALLBACK.reach[0], PX_FALLBACK.follow[0]].join("|"), "one failure: the fix, then the reach and follow-up fallbacks, in order");
  const two = Object.assign(clone(one), {reach:"few", promises:[{to:"users", w:"A note", by:""}]}); eq(pxDraftActions(two).map(a => a.w)[1], PX_FALLBACK.promise[0], "an undated promise gets its own action");
  eq(pxDraftActions(PX_BLANK()).filter(a => a.w).length, 1, "nothing picked: only the follow-up check, padded to three rows"); eq(pxDraftActions(PX_BLANK()).length, 3, "padded");
  px = Object.assign(PX_BLANK(), clone(PX_EXAMPLE), {ex:false}); const tasks = tkFromPostmortem();
  eq(tasks.length, 5, "three actions and two promises"); eq(tasks.every(t => /Due: /.test(t.desc) && /From an incident post-mortem/.test(t.desc)), true, "every description carries the due date and the source");
  eq(tasks.every(t => t.pr === 3), true, "Sev 2 is priority 3"); eq(tasks[0].owner, "Engineering", "the owner's display name"); eq(/Due: 2026-10-17/.test(tasks[0].desc), true, "the date rides in the description");
  eq(tasks.every(t => t.labels.includes("post-mortem")), true, "labelled"); eq(tasks[0].labels.includes("layer-detection") && /^incident-/.test(tasks[0].labels[2]), true, "layer and incident labels");
  eq(/Why: No alert fires/.test(tasks[0].desc), true, "drafted actions say why"); eq(tasks[3].owner, "Comms", "promises belong to Comms");
  const parse = csv => csv.trim().split("\r\n").map(line => { const cells = []; let c = "", q = false;
    for(let i = 0; i < line.length; i++){ const ch = line[i]; if(q){ if(ch === '"' && line[i + 1] === '"'){ c += '"'; i++; } else if(ch === '"') q = false; else c += ch; } else if(ch === '"') q = true; else if(ch === ","){ cells.push(c); c = ""; } else c += ch; }
    cells.push(c); return cells; });
  eq(parse(tkCsvFor("jira", tasks)).length, 6, "Jira CSV: header and five rows"); eq(parse(tkCsvFor("linear", tasks)).length, 6, "Linear CSV: header and five rows");
  eq(/src === "postmortem"/.test(rd("partTK.js")), true, "tkOpen has a post-mortem branch");
  out.push("actions: three drafted from the failures (detection first), fallbacks in order; tracker: 5 tasks with owner, due date and labels; CSVs parse");

  /* ---------- 4. the document ---------- */
  const team = pxDoc(PX_EXAMPLE, "team"), legal = pxDoc(PX_EXAMPLE, "legal");
  if(bad(team)) throw new Error("document bad: " + where(team));
  const heads = ["# Post-mortem:", "## In one paragraph", "## Impact", "## Timeline", "## What worked", "## What failed in the system", "## Actions", "## Promises made", "## Follow-up"];
  eq(heads.every((x, i) => team.indexOf(x) >= 0 && (i === 0 || team.indexOf(x) > team.indexOf(heads[i - 1]))), true, "the headings, in order");
  eq(team.indexOf("Comms replies to the creator") < team.indexOf("Organising accounts"), true, "the timeline is sorted by time (the 09:00 row before the 11:00 row)");
  eq(/First signal to declared: 2h 40m\. Declared to contained: 30m\./.test(team), true, "the gaps line"); eq(/## For Legal/.test(team), false, "the team version has no duties block");
  eq(/For how long: 1d 12h/.test(team), true, "impact: how long"); eq(/Sat 3 Oct, 22:40/.test(team), true, "times read as 'Sat 3 Oct, 22:40'");
  eq(/### Prevention\n- New accounts could do too much, too soon/.test(team), true, "failures are about the system");
  eq(/_Made with T&S Workbench\. A blameless review/.test(team), true, "footer");
  eq(/## For Legal/.test(legal) && /Digital Services Act: core duties \(European Union\)/.test(legal) && /Online Safety Act: illegal harms duties \(United Kingdom\)/.test(legal) && /not legal advice/.test(legal), true, "the Legal version: the duties block, both laws, 'not legal advice'");
  eq(/None flagged by the answers; confirm\./.test(legal) && /Preserved before removal: yes\./.test(legal), true, "no clock flagged, evidence kept"); eq(legal.indexOf("## For Legal") > legal.indexOf("## Impact") && legal.indexOf("## For Legal") < legal.indexOf("## Timeline"), true, "between Impact and Timeline");
  const gd = Object.assign(clone(PX_EXAMPLE), {duties:[pxDutyKey("eu", /General Data Protection/)].filter(Boolean)}); eq(/72-hour clock/.test(pxDoc(gd, "legal")), true, "a GDPR entry names the 72-hour clock");
  const nop = Object.assign(clone(PX_EXAMPLE), {promises:[]}); eq(/## Promises made/.test(pxDoc(nop, "team")), false, "no promises, no section");
  const wc = words(team); eq(wc >= 350 && wc <= 700, true, "about a page (" + wc + " words)");
  eq(/<h4>Impact<\/h4>/.test(pxDocHTML(PX_EXAMPLE, "team")) && !bad(pxDocHTML(PX_EXAMPLE, "legal")), true, "the same structure as HTML");
  const messy = Object.assign(clone(PX_EXAMPLE), {name:"Pile-on https://internal.example.com/dash/12", acts:clone(PX_EXAMPLE.acts)});
  messy.acts[0].w = "Ping @someone and mail alex@example.com about https://example.com/ticket/9 today"; const sl = pxSlack(messy);
  eq(sl.length <= 1200, true, "Slack message under 1,200 characters (" + sl.length + ")"); eq(sl.startsWith("*Post-mortem:"), true, "starts with the title in bold"); eq((sl.match(/•/g) || []).length >= 3, true, "three action lines");
  eq(/@someone|alex@example|https?:\/\//.test(sl), false, "handles, emails and web addresses are taken out"); eq(/\[redacted\]/.test(sl), true, "and say so");
  eq(/Alex|Rivera/.test(sl), false, "no names from the profile in the example run"); eq(/Full document: ask the author for the post-mortem\./.test(sl), true, "points at the author, with no link");
  const long = clone(PX_EXAMPLE); long.acts.forEach(a => { a.w = "x".repeat(238); }); long.promises.forEach(p => { p.w = "y".repeat(138); }); eq(pxSlack(long).length <= 1200, true, "the longest allowed text still fits");
  eq(pxBlameCheck("the on-call should have seen it").length, 1, "a blaming phrase is found"); eq(pxBlameCheck("the alert fired late at the default threshold").length, 0, "a clean sentence is not");
  px = Object.assign(PX_BLANK(), clone(PX_EXAMPLE), {ex:false}); px.what += " Someone forgot to check."; renderPostmortem();
  eq(/1 phrase to soften before sharing/.test(view.innerHTML), true, "the report shows the softening note"); eq(/to soften/.test((px = Object.assign(PX_BLANK(), clone(PX_EXAMPLE)), renderPostmortem(), view.innerHTML)), false, "and not when the text is clean");
  out.push(`document: ${wc} words, headings in order, timeline by time, Legal adds the duties block, Slack ${sl.length} characters and redacted, blame check`);

  /* ---------- 5. save, open, share ---------- */
  px = Object.assign(PX_BLANK(), clone(PX_EXAMPLE), {ex:false}); store.set("ws:items", {});
  const msg = wsSaveTool("postmortem", px, pxTitle(px)), it = Object.values(wsItems()).find(i => i.kind === "postmortem");
  eq(!!it && it.id.startsWith("PX"), true, "saved with the PX prefix"); eq(/Response grade C/.test(itemSummary(it).html), true, "the workspace summary shows the response grade");
  px = PX_BLANK(); openSaved(it.id); eq(px.view, "report", "opening a saved post-mortem shows the report"); eq(px.name, PX_EXAMPLE.name, "with its answers");
  eq(wsSaveLabel("postmortem", px), "Saved", "the save button knows it is saved");
  renderTools(); eq(/Incident post-mortem/.test(view.innerHTML), true, "All tools lists it"); eq(OV_STAGE.px, "prepare", "under Assess and prepare");
  eq(/22 fixes/.test(view.innerHTML), true, "its card counts the fixes"); eq((view.innerHTML.match(/href="#postmortem" style="--c:var\(--t-tt\)" data-stage="prepare"/g) || []).length, 1, "one card, in the prepare stage");
  eq(typeof SHARE_APPLY.postmortem, "function", "a share link can be applied");
  const code = await shareEncode(pxShareState()), back = await shareDecode(code); eq(back.name, PX_EXAMPLE.name, "the link round-trips"); eq("view" in back || "shared" in back || "ex" in back, false, "without screen state");
  px = PX_BLANK(); SHARE_APPLY.postmortem(back); renderPostmortem(); h = view.innerHTML;
  eq(px.shared && px.view === "report" && /share-banner/.test(h) && /You're viewing a shared result/.test(h), true, "a shared result shows the banner"); eq(pxScore(px).score, 60, "and the same score");
  SHARE_APPLY.postmortem("Post-mortem: Only a summary"); eq(px.name, "Only a summary", "an oversized link falls back to the summary"); eq(px.view !== "report", true, "and does not pretend to be a report");
  px = Object.assign(PX_BLANK(), clone(PX_EXAMPLE), {ex:false}); renderPostmortem(); h = view.innerHTML;
  eq(/data-px="reset"/.test(h) && /data-px="sharelink"/.test(h) && /data-px="legal"/.test(h) && /data-px="slack"/.test(h) && /data-px="tracker"/.test(h), true, "header actions: reset, share, Legal, Slack, tracker");
  eq(h.indexOf('data-px="example"') < h.indexOf('data-px="edit"') && h.indexOf('data-px="edit"') < h.indexOf('data-px="reset"') && h.indexOf('data-px="reset"') < h.indexOf('data-px="save"') && h.indexOf('data-px="save"') < h.indexOf('data-px="download"') && h.indexOf('data-px="download"') < h.indexOf('data-px="tracker"'), true, "in the house order");
  eq(/btn sm primary" data-px="download"/.test(h), true, "Download is the primary button");
  undos = 0; pxAct("reset"); eq(undos, 1, "Start over offers Undo"); eq(px.name, "", "and clears"); eq(px.view !== "report", true, "back to the intro");
  px = Object.assign(PX_BLANK(), clone(PX_EXAMPLE)); pxAct("example"); eq(px.ex && px.view === "report" && /This is an example/.test(view.innerHTML) && /Pixelry/.test(view.innerHTML), true, "See an example loads Pixelry with its banner");
  eq(/data-px="example"/.test(view.innerHTML), false, "and hides See an example");
  pxAct("edit"); eq(px.view, "setup", "Edit answers goes back to the questions"); eq(/Question \d+ of 16/.test(view.innerHTML) || /gd-intro/.test(view.innerHTML), true, "in the flow, answers kept"); eq(px.name, PX_EXAMPLE.name, "answers kept");
  out.push("workspace: saved as PX, summary 'Response grade C', reopens on the report, All tools card, share link round-trips with the banner, Start over offers Undo");

  /* ---------- 6. registration ---------- */
  const ri = TOOL_ROUTES.indexOf("postmortem"); eq(ri, TOOL_ROUTES.indexOf("tabletop") + 1, "TOOL_ROUTES: right after tabletop");
  eq(ROUTE_LABEL.postmortem, "Incident post-mortem", "ROUTE_LABEL"); eq(/blameless post-mortem in fifteen minutes/.test(ROUTE_DESC.postmortem), true, "ROUTE_DESC"); eq(KINDS.postmortem.prefix, "PX", "KINDS");
  eq(CHAPTER_LINK.postmortem[0], "crisis-response", "CHAPTER_LINK"); eq(TOOL_TONE.postmortem, "assess", "TOOL_TONE"); eq(TOOL_ICON.postmortem, "doc", "TOOL_ICON"); eq(TOOL_COLOR.postmortem, "var(--t-tt)", "TOOL_COLOR");
  eq(AB_GROUPS.some(g => g[0] === "Prepare" && g[1].some(x => x[2] === "Incident post-mortem")), true, "About lists it under Prepare");
  eq(/data-route="postmortem"/.test(rd("partShell.html")), true, "sidebar row"); eq(/postmortem:\["doc"/.test(rd("partC3.html")) && /postmortem:"Prepare"/.test(rd("partC3.html")), true, "page header meta and group");
  eq(/INTRO_SPECS/.test(rd("partINTRO.js")) && /postmortem:\{\s*heading:"Write the post-mortem people will actually read"/.test(rd("partINTRO.js")) && /introGate\("postmortem", renderPostmortem9\)/.test(rd("partINTRO.js")), true, "purpose card and gate line");
  eq(/PAGE_TOURS|postmortem:\[/.test(rd("partHELP.js")) && /\.px-root \.pol-sum/.test(rd("partHELP.js")), true, "page tour");
  const bw = rd("build-ws.js"); eq(/rd\("partPX\.js"\)/.test(bw) && /rd\("partZ19\.css"\)/.test(bw) && /postmortem:renderPostmortem/.test(bw), true, "build-ws.js: part, styles, route");
  eq(bw.indexOf('rd("partPX.js")') > bw.indexOf('rd("partDSA.js")'), true, "loaded after partDSA.js");
  eq(rd("partTTF.js").includes("Write the post-mortem") && rd("partTT.js").includes("Write the post-mortem"), true, "both tabletop debriefs link to it");
  eq(/node src\/test-px\.js/.test(rd("../package.json")), true, "package.json runs this test");
  const gr = path.join(D, "../../../_build/gen-readmes.js"); if(fs.existsSync(gr)){ const g = fs.readFileSync(gr, "utf8"); eq(/node src\/test-px\.js/.test(g), true, "the sync template runs it too"); eq(/row\("Incident post-mortem"/.test(g), true, "and has the README row"); }
  eq(rd("partNav.js").includes('go("Incident post-mortem","postmortem"'), true, "palette entry"); eq(rd("partNav.js").includes('postmortem:"prepare"'), true, "sidebar group pill");
  eq(!!OBL.find(o => o.r === "eu" && /core duties/.test(o.law)) && !!OBL.find(o => o.r === "uk" && /illegal harms duties/.test(o.law)), true, "the example's two laws are in the obligation list"); eq(PX_EXAMPLE.duties.length, 2, "and resolve to two keys");
  out.push("registration: " + ["TOOL_ROUTES", "ROUTE_LABEL", "ROUTE_DESC", "KINDS", "CHAPTER_LINK", "TOOL_TONE", "TOOL_ICON", "TOOL_COLOR", "About", "sidebar", "header meta", "purpose card", "tour", "build-ws.js", "tabletop links", "package.json", "palette"].join(", ") + " all in step");
  return out.join("\n");
};
const src = stub + "const GT_MORE = {}; const ROUTES = {postmortem:() => renderPostmortem()};\n" + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partTTF.js"), rd("partTK.js"), rd("partORG.js"), rd("partGD.js"), rd("partPX.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
new Function("rd", "fs", "path", "D", src)(rd, fs, path, D).then(r => console.log(r), e => { console.error(e && e.stack || e); process.exit(1); });
