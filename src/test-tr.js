// Checks the transparency report builder: tiers, completeness, the report, the checklist, Claude's summary and saving, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = async function(){
  const out = [], bad = h => /undefined|NaN|\[object/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN).{30}/) || [""])[0];
  // a blank report opens guided: your service, then one section per screen, only the sections your tier needs
  tr = TR_BLANK(); trView = null; renderTransparency(); let h = view.innerHTML; if(bad(h)) throw new Error("guided intro bad: " + where(h));
  eq(/Build the transparency report the DSA asks for/.test(h) && /data-gd="start"/.test(h), true, "guided intro");
  gdGo(gdCur, "start"); eq(/What.s the company or service called/.test(view.innerHTML), true, "the service first");
  eq(gdLive(gdCur).filter(z => /^s-/.test(z.id)).length, trSections().length, "one screen per section of the report");
  tr.tier = "vlop"; eq(gdLive(trSpec()).filter(z => /^s-/.test(z.id)).length, 11, "a very large platform gets every section"); tr.tier = "platform";
  out.push("guided: service and tier first, then " + trSections().length + " sections one per screen");
  trView = "page"; renderTransparency(); h = view.innerHTML; if(bad(h)) throw new Error("blank setup bad: " + where(h));
  eq((h.match(/data-trtier=/g) || []).length, 4, "four service types"); eq(/Build the report/.test(h), true, "run bar");
  // tiers add duties
  const n = t => { tr.tier = t; return trSections().length; };
  eq(n("intermediary"), 4, "mere conduit: orders, own initiative, complaints, automated means"); eq(n("hosting"), 5, "hosting adds notices"); eq(n("platform"), 8, "platforms add disputes, suspensions and user numbers"); eq(n("vlop"), 11, "very large platforms add Article 42");
  out.push("tiers: 4, 5, 8 and 11 sections");
  // the example: an online platform, nearly complete
  tr = Object.assign(TR_BLANK(), JSON.parse(JSON.stringify(TR_EXAMPLE))); const p = trProgress();
  eq(p.got, p.total, "the example fills every field for an online platform"); tr.view = "report"; renderTransparency(); h = view.innerHTML; if(bad(h)) throw new Error("report bad: " + where(h));
  eq(/Every section the DSA asks for is filled in/.test(h) && /31,400/.test(h) && /\+17% on the previous period/.test(h), true, "report shows numbers and changes");
  eq(/by the end of February 2026/.test(h), true, "due date for a 2025 annual report");
  tr.tab = "checklist"; renderTransparency(); eq((view.innerHTML.match(/class="na"/g) || []).length, 3, "Article 42 items marked as not applying");
  const md = trMarkdown(); eq(/# Pixelry: transparency report, 2025/.test(md) && /## Notices of illegal content \(Art\. 15\(1\)\(b\)\)/.test(md) && /\| Scams and\/or fraud \| 9,800 \|/.test(md), true, "markdown report with category table");
  out.push("example: " + p.got + " of " + p.total + " fields, report, checklist and markdown");
  // gaps, exemption, VLOP due dates
  delete tr.v.notices; tr.v.notices_time = ""; tr.view = "setup"; eq(trProgress().missing[0].k, "notices", "missing notices flagged"); renderTransparency(); eq(/Still missing: notices of illegal content/.test(view.innerHTML), true, "run bar names the gap");
  tr.sme = true; renderTransparency(); eq(/You may be exempt/.test(view.innerHTML), true, "micro and small exemption"); tr.sme = false;
  tr.tier = "vlop"; eq(/1 January to 30 June 2025/.test(trDue()) && /end of August 2025/.test(trDue()), true, "very large platforms report every six months"); tr.tier = "platform";
  out.push("gaps named, exemption shown, six-monthly deadlines for very large platforms");
  // Claude's summary: validated, numbers only from the page
  tr.v.notices = 31400; SAMPLER = {json: async () => ({summary:"In 2025 we received 31,400 notices of illegal content.", highlights:["31,400 notices", "", 7], questions:["Why did complaints rise?"]})};
  await trWrite(); eq(tr.ai && tr.ai.highlights.length, 1, "keeps only valid highlights"); eq(/31,400 notices/.test(trMarkdown()), true, "summary goes into the report");
  eq(/Never invent or estimate a figure/.test(trPrompt()) && /Notices received \(Article 16\): 31,400/.test(trPrompt()), true, "prompt carries the numbers and the rule against inventing");
  SAMPLER = {json: async () => { throw {code:"rate_limited"}; }}; await trWrite(); eq(!!trRun.err, true, "rate limits reported");
  out.push("Claude summary: validated, uses only the page's numbers");
  // saving and the workspace
  const msg = wsSaveTool("transparency", tr, "Transparency report: Pixelry 2025"); const it = Object.values(wsItems()).find(i => i.kind === "transparency");
  eq(!!it && /% complete/.test(itemSummary(it).html), true, "workspace summary"); eq(cmdkItems().some(x => x.label === "Transparency report"), true, "search reaches it");
  out.push("saved to the workspace (" + msg + ") and searchable");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partGD.js"), rd("partPol.js"), rd("partPol2.js"), rd("partAI.js"), rd("partTR.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
new Function(src)().then(s => console.log(s)).catch(e => { console.error("FAIL", e); process.exit(1); });
