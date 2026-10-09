/* =========================================================
   STARTER EXPORTS: from a decision to something you can build
   Three files a team can start from: Osprey starter rules (SML) and a Coop setup checklist from a pre-mortem
   report, and a policy file for open models from the stress-tester's rewrite. Every output is a starter,
   untested: nothing here has run against a real deployment, and every platform-specific value is a TODO.
   Syntax and names were checked against github.com/roostorg/osprey (docs.roost.tools/osprey/latest/rules/,
   example_rules/, docs/rules/configuration.md) and github.com/roostorg/coop (docs/user, docs/api,
   server/graphql/modules) on 2026-10-03. The workbench is independent and not affiliated with ROOST.
   Pure generators: rxOsprey(r, pm), rxCoop(r, pm, pol, ev), rxPolicyFile(pol, ev). UI: rxBuildHTML(r), rxPolicyBtnHTML().
   ========================================================= */
const RX_WIP = "starter, untested";
const RX_TOP = 5;
const RX_SITE = "https://stevenmacchia.com/ts-workbench/";
const RX_OSPREY_DOCS = "https://docs.roost.tools/osprey/latest/rules/", RX_OSPREY_REPO = "https://github.com/roostorg/osprey";
const RX_COOP_DOCS = "https://github.com/roostorg/coop/tree/main/docs";
const RX_PENALTIES = ["NONE", "LOW", "MEDIUM", "HIGH", "SEVERE"]; // as GET /api/v1/policies/ returns it (coop/docs/api/policies.md)
const rxDate = () => new Date().toISOString().slice(0, 10);
const rxTop = (r, n) => (r && r.risks ? r.risks : []).slice(0, n || RX_TOP);
const rxIdent = s => String(s || "x").split(/[^a-z0-9]+/i).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join("") || "Risk";
const rxPlain = s => String(s || "").replace(/["{}\\]/g, "").replace(/\s+/g, " ").trim();
const rxWrap = (text, prefix, width) => { const out = [], words = rxPlain(text).split(" "); let line = ""; width = width || 100;
  words.forEach(w => { if((line + " " + w).trim().length > width){ out.push(prefix + line.trim()); line = w; } else line = (line + " " + w).trim(); });
  if(line) out.push(prefix + line); return out; };
const rxProfile = p => [labelOf(PLATFORMS, p.type), labelOf(YOUTH, p.youth), labelOf(IDENTITY, p.identity), labelOf(CONTACT, p.contact), `money: ${p.money.map(k => labelOf(MONEY, k)).join(", ") || "none"}`, `regions: ${p.regions.map(k => k.toUpperCase()).join(", ") || "none"}`, labelOf(SCALE, p.scale)].filter(x => x && x !== "Not answered").join("; ");
const rxPenalty = band => ({crit:"SEVERE", high:"HIGH", med:"MEDIUM", low:"LOW"})[band] || "LOW";
// A rule's harm area, from the words in it, for filing the stress-tested rule under the right parent policy
const RX_KEYWORDS = [["child", /\b(child|children|minor|minors|under.?age|under 18|grooming|csam)\b/i, "Child safety"], ["harass", /\b(harass|bully|bullying|intimidat|hate|slur|abus)/i, "Harassment"],
  ["fraud", /\b(scam|fraud|phish|mislead|trick)/i, "Scams and fraud"], ["sexual", /\b(nudity|sexual|porn|intimate|explicit)\b/i, "Nudity and sexual content"], ["selfharm", /\b(self.?harm|suicide|eating disorder)\b/i, "Self-harm"],
  ["violent", /\b(violen|terror|extremis|gore|graphic)/i, "Violence"], ["integrity", /\b(spam|bot|fake account|manipulat|inauthentic)/i, "Spam and platform integrity"], ["illegal", /\b(drug|weapon|firearm|counterfeit|regulated goods|illegal)/i, "Illegal and regulated goods"],
  ["privacy", /\b(doxx|personal (data|information)|private information|address|surveil)/i, "Privacy"], ["ai", /\b(deepfake|generated|jailbreak|prompt)\b/i, "AI misuse"]];
const rxRuleCat = text => { const m = RX_KEYWORDS.find(([, re]) => re.test(text || "")); return m ? {cat:m[0], n:m[2]} : null; };

/* ---------- Osprey: placeholder features and one starter rule per harm ---------- */
// name: [annotation, JSON path, what it means]. Every path is a placeholder for a field your events may not carry.
const RX_FEAT = {
  AccountAgeSeconds:["int", "$.user.account_age_seconds", "seconds since the account was created"],
  IsVerified:["bool", "$.user.is_verified", "the account passed email, phone or ID verification"],
  ReportsReceived24h:["int", "$.user.reports_received_24h", "reports filed against this user in the last 24 hours, computed upstream"],
  NewRecipients1h:["int", "$.user.new_recipients_1h", "distinct people this user messaged for the first time in the last hour, computed upstream"],
  IsFirstContact:["bool", "$.message.is_first_contact", "the sender has never messaged this recipient before"],
  RecipientIsMinor:["bool", "$.recipient.is_minor", "the recipient is under 18, from your age signal"],
  MentionsOffPlatform:["bool", "$.content.mentions_off_platform", "the text asks to move to another app, a phone number or a meeting"],
  ContainsLink:["bool", "$.content.contains_link", "the text contains a URL"],
  MediaHashMatch:["bool", "$.media.hash_match", "a match against a known-abuse hash list from your hash-matching service, such as HMA"],
  ClassifierLabel:["Optional[str]", "$.content.classifier_label", "the label your text or media classifier gave this content, if it ran"],
  ClassifierScore:["float", "$.content.classifier_score", "that classifier's confidence, 0 to 1"],
  PostsCreated1h:["int", "$.user.posts_created_1h", "posts or listings created in the last hour, computed upstream"],
  DuplicateContent24h:["int", "$.content.duplicate_count_24h", "how many times this exact text was posted in the last day, computed upstream"],
  PaymentsSent1h:["int", "$.user.payments_sent_1h", "payments or transfers sent in the last hour, computed upstream"],
  CountryMismatch:["bool", "$.session.country_mismatch", "the session country differs from the account's usual country"],
  LoginFailures1h:["int", "$.user.login_failures_1h", "failed logins on this account in the last hour, computed upstream"],
  NewDevice:["bool", "$.session.new_device", "the device has not been seen on this account before"],
  LinkedBannedAccounts:["int", "$.device.linked_banned_accounts", "banned accounts that share this device or network fingerprint"],
  IncludesPersonalData:["bool", "$.content.includes_personal_data", "the text contains an address, phone number, ID number or similar"],
  PromptSafetyLabel:["Optional[str]", "$.prompt.safety_label", "the label your prompt or output filter gave this request, if it ran"],
  PromptsBlocked24h:["int", "$.user.prompts_blocked_24h", "requests this user had blocked in the last day, computed upstream"]
};
// Starter signals per harm area, overridden for a few specific harms. event: the placeholder event name; when: conditions
// over the features above; label: what the rule adds to the user; days: label expiry; note: how to read the rule.
const RX_SIG = {
  child:{event:"send_message", when:["RecipientIsMinor == True", "IsFirstContact == True", "AccountAgeSeconds < 604800", "NewRecipients1h >= 5"], label:"minor_contact_review", days:7, note:"A new account opening many first conversations with minors. Send to a trained reviewer; do not act automatically."},
  csam:{event:"upload_media", when:["MediaHashMatch == True"], label:"csam_hash_match", days:30, note:"A hash match against a known-CSAM list. Preserve evidence and follow your legal reporting process (NCMEC in the US). Confirm before any user-facing action."},
  grooming:{event:"send_message", when:["RecipientIsMinor == True", "AccountAgeSeconds < 604800", "NewRecipients1h >= 5", "MentionsOffPlatform == True"], label:"grooming_review", days:7, note:"A new account contacting many minors and trying to move them off the platform. Route to a reviewer trained in child safety."},
  underage:{event:"create_account", when:["ClassifierLabel == 'likely_minor'"], label:"age_review", days:30, note:"Your age signal thinks a new account on an adult-only service belongs to a minor. Hold access until checked."},
  sexual:{event:"send_message", when:["ClassifierLabel == 'sexual'", "IsFirstContact == True", "ReportsReceived24h >= 1"], label:"sexual_abuse_review", days:7, note:"Unsolicited sexual content to someone the sender has never spoken to, already reported once."},
  fraud:{event:"send_message", when:["ContainsLink == True", "AccountAgeSeconds < 86400", "NewRecipients1h >= 10"], label:"scam_pattern", days:7, note:"A day-old account sending links to many strangers. Classic scam outreach; rate-limit or review."},
  fincrime:{event:"send_payment", when:["AccountAgeSeconds < 86400", "PaymentsSent1h >= 5", "CountryMismatch == True"], label:"fincrime_review", days:30, note:"Rapid payments from a new account in an unexpected country. Hold for review rather than block outright."},
  security:{event:"login", when:["LoginFailures1h >= 10", "NewDevice == True"], label:"takeover_suspect", days:1, note:"Many failed logins then a new device: a possible account takeover or credential stuffing. Step up authentication."},
  harass:{event:"send_message", when:["ReportsReceived24h >= 3", "ClassifierLabel == 'harassment'"], label:"harassment_review", days:7, note:"Repeated reports plus a classifier hit. Review the pattern, not the single message."},
  violent:{event:"create_post", when:["ClassifierLabel == 'violent_extremist'", "ClassifierScore >= 0.8"], label:"violent_content_review", days:7, note:"A confident classifier hit for violent or extremist content. Hash lists (e.g. GIFCT) are a second signal to add."},
  selfharm:{event:"create_post", when:["ClassifierLabel == 'self_harm'", "ClassifierScore >= 0.8"], label:"selfharm_outreach", days:7, note:"Not an enforcement rule. Use the label to show support resources and route to a trained reviewer; never punish the person at risk."},
  privacy:{event:"create_post", when:["IncludesPersonalData == True", "ReportsReceived24h >= 1"], label:"doxxing_review", days:7, note:"Personal data in a post that someone has already reported. Review quickly: harm compounds while it stays up."},
  physical:{event:"send_message", when:["MentionsOffPlatform == True", "ReportsReceived24h >= 1", "AccountAgeSeconds < 604800"], label:"physical_safety_review", days:7, note:"A new account pushing to meet or move off the platform and already reported. A reviewer should see the conversation."},
  integrity:{event:"create_post", when:["PostsCreated1h >= 20", "DuplicateContent24h >= 5", "not HasLabel(entity=UserId, label='trusted')"], label:"spam_suspect", days:7, note:"High volume of repeated content from an account you have not marked trusted. Rate-limit first, review second."},
  illegal:{event:"create_listing", when:["ClassifierLabel == 'regulated_goods'"], label:"regulated_goods_review", days:7, note:"A listing your classifier thinks is a regulated or prohibited item. Hold it from search until reviewed."},
  ai:{event:"ai_prompt", when:["PromptSafetyLabel == 'disallowed'", "PromptsBlocked24h >= 5"], label:"ai_misuse_review", days:7, note:"Repeated blocked requests in a day: someone probing the filters. Review the account rather than each prompt."}
};
function rxOsprey(r, p){
  p = p || pm; const risks = rxTop(r), date = rxDate(), name = p.name || "Untitled assessment", L = [];
  const c = (s = "") => L.push(s ? "# " + s : "#");
  c(`Osprey starter rules for: ${rxPlain(name)}`); c(`STARTER, UNTESTED. Generated by T&S Workbench (${RX_SITE}) on ${date}.`);
  c("The workbench is independent and not affiliated with ROOST. Nothing here has run against an Osprey deployment."); c();
  c(`Profile: ${rxProfile(p)}.`); c();
  c(`What this is: one starter rule per top risk from the abuse pre-mortem (${risks.length} of ${r.risks.length} risks), over placeholder`);
  c("features. Every feature path, event name and threshold is a guess about your events, marked TODO(platform). Rules add");
  c("labels only; anything that acts on a user (a ban, a queue hand-off, a notification) is a plugin UDF you register."); c();
  c(`Verified against Osprey's docs and example ruleset on ${date}:`); c(`  ${RX_OSPREY_DOCS}`); c(`  ${RX_OSPREY_REPO}/tree/main/example_rules`); c(`  ${RX_OSPREY_REPO}/blob/main/docs/rules/configuration.md`);
  c("Constructs used: Entity[str] = EntityJson(type=, path=, coerce_type=True); JsonData(path=, coerce_type=True, required=False);");
  c("GetActionName(); Rule(when_all=[...], description=...); WhenRules(rules_any=[...], then=[...]); LabelAdd(entity=, label=,");
  c("expires_after=TimeDelta(days=)); HasLabel(entity=, label=); ==, !=, <, >= and not. The docs show int, str, List[str] and");
  c("Optional[str] annotations; bool and float below are not in Osprey's examples, so check your deployment's UDF registry.");
  c("Layout: one file. The example ruleset splits models/ and rules/ and composes them with Import(rules=[...]) and");
  c("Require(rule=...); do the same once this grows. Labels must be declared in config/labels.yaml: a starter block is at the end."); c();
  // features: the base entities plus whatever the chosen rules use
  const used = new Set(); const sigOf = x => RX_SIG[x.id] || RX_SIG[x.cat] || null;
  risks.forEach(x => { const s = sigOf(x); if(s) s.when.forEach(w => Object.keys(RX_FEAT).forEach(f => { if(new RegExp("\\b" + f + "\\b").test(w)) used.add(f); })); });
  L.push("", "# ---- Features (models). Entities persist across events so labels can stick to them. ----", "# TODO(platform): the field that identifies the acting user");
  L.push("UserId: Entity[str] = EntityJson(", "  type='User',", "  path='$.user_id',", "  coerce_type=True,", ")", "", "# TODO(platform): the field that names the event, e.g. create_post, send_message, upload_media");
  L.push("EventType: str = JsonData(path='$.event_type', coerce_type=True)", "", "ActionName = GetActionName()", "");
  [...used].sort().forEach(f => { const [t, path, what] = RX_FEAT[f]; L.push(`# TODO(platform): ${what}`); L.push(`${f}: ${t} = JsonData(path='${path}'${t.startsWith("Optional") ? ", required=False" : ""})`); L.push(""); });
  // one rule per risk
  const labels = [];
  risks.forEach((x, i) => {
    const s = sigOf(x), ident = rxIdent(x.id) + "Starter";
    L.push("# " + "-".repeat(98)); L.push(`# Risk ${i + 1} of ${risks.length}: ${rxPlain(x.n)} (${CATS[x.cat]})`);
    L.push(`# Pre-mortem rating: ${BANDS[x.band][0]}: ${SEVL[x.sev]} severity x ${LIKL[x.lik]} likelihood`);
    const why = x.drivers.map(d => d[2]).concat(x.ups.map(u => u[1])).slice(0, 3); if(why.length) rxWrap("Why: " + why.join("; ") + ".", "# ").forEach(l => L.push(l));
    if(!s){ L.push("# This risk is about readiness, not something a per-event rule can detect. No rule generated."); L.push("# " + "-".repeat(98), ""); return; }
    rxWrap("Starter signal: " + s.note, "# ").forEach(l => L.push(l));
    L.push(`# TODO(platform): replace '${s.event}' with your event name and tune every threshold against your own data.`); L.push("# " + "-".repeat(98));
    L.push(`${ident} = Rule(`, "  when_all=[", `    EventType == '${s.event}',`); s.when.forEach(w => L.push(`    ${w},`)); L.push("  ],", `  description="${RX_WIP}: ${rxPlain(x.n)}",`, ")", "");
    L.push("# TODO(platform): add an effect from your UDF registry to hand this to review. Osprey ships labels and verdicts;");
    L.push("# bans and queue hand-offs are plugin UDFs (see example_plugins/ in the Osprey repo).");
    L.push("WhenRules(", `  rules_any=[${ident}],`, "  then=[", `    LabelAdd(entity=UserId, label='${s.label}', expires_after=TimeDelta(days=${s.days})),`, "  ],", ")", "");
    labels.push([s.label, x.n]);
  });
  L.push("# ---- config/labels.yaml: copy this block into that file so the labels above validate ----");
  L.push("# connotation: the Osprey UI docs name Negative, Positive and Neutral labels; the example file writes positive in lowercase.");
  L.push("# labels:"); labels.forEach(([lab, n]) => { L.push(`#   ${lab}:`, "#     valid_for: [User]", "#     connotation: negative", `#     description: "${RX_WIP}: ${rxPlain(n)} (T&S Workbench)"`); });
  if(!labels.length) L.push("#   (no labels: none of the top risks produced a rule)");
  return L.join("\n") + "\n";
}

/* ---------- Coop: a setup checklist for the review console ---------- */
const RX_CONTENT_TYPES = {posts:["Post", "text, media, link, author, created_at"], media:["Media upload", "file, type, author, created_at"], dm:["Message", "text, sender, recipient, thread, created_at"], listings:["Listing", "title, description, price, images, seller, created_at"],
  reviews:["Review", "text, rating, author, subject, created_at"], live:["Live stream", "title, streamer, started_at (plus clips or transcripts if you keep them)"], files:["File upload", "file, type, uploader, created_at"], ai_gen:["Generated media", "prompt, output, user, created_at"], ai_chat:["AI message", "prompt, reply, user, conversation, created_at"]};
const RX_THREAD_TYPES = {dm:["Direct message thread", "participants, messages"], groups:["Group", "name, members, messages"], posts:["Comment thread", "post, comments"], ai_chat:["AI conversation", "user, messages"]};
function rxCoop(r, p, po, e){
  p = p || pm; po = po === undefined ? (typeof pol !== "undefined" ? pol : null) : po; e = e === undefined ? (typeof ev !== "undefined" ? ev : null) : e;
  const risks = rxTop(r), c = r.c, date = rxDate(), name = p.name || "Untitled assessment", L = [];
  const cats = []; risks.forEach(x => { if(!cats.includes(x.cat)) cats.push(x.cat); });
  const child = cats.includes("child") || cats.includes("sexual") || c.hostsMedia, media = c.hostsMedia, text = risks.some(x => ["harass", "fraud", "violent", "selfharm", "privacy", "illegal", "sexual"].includes(x.cat));
  L.push(`# Coop setup checklist: ${name}`, "", `_Starter, untested. Generated by T&S Workbench (${RX_SITE}) on ${date} from the abuse pre-mortem "${name}" (${rxProfile(p)}). Coop is ROOST's open-source review console; the workbench is independent and not affiliated with ROOST. Names and fields below were checked against Coop's docs and schema on ${date} (${RX_COOP_DOCS}); check them again before you build, and treat every suggestion as a draft for your team to change._`, "");
  L.push("Coop is configured in its UI: **Settings → Item Types**, **Settings → Actions**, the **Policies** dashboard, **Review Console → Queues** and **Routing**, **Automated Enforcement → Proactive Rules** and **User Strikes**. Its REST API (`docs/api`) submits items, reports and appeals and reads policies, actions and item types; it does not create them. So this is a checklist to work through in the UI.", "");
  // 1. policies
  L.push("## 1. Policies (Policies dashboard)", "", `One parent per harm area in the top ${risks.length} risks, one child per risk. Each policy has a **Policy Name**, a **Policy Definition** (\`policyText\`), **Enforcement Guidelines** (\`enforcementGuidelines\`) and a parent (\`parentId\`). The Policies API also returns a \`penalty\` of ${RX_PENALTIES.join(", ")}; the suggestions below come from the pre-mortem's rating of each risk, so adjust them to your own enforcement ladder.`, "");
  const polRule = po && po.rule ? (po.result && po.result.rewrite ? po.result.rewrite : po.rule) : "", polCat = polRule ? rxRuleCat(polRule) : null;
  const evRule = e && e.policy && e.policy.trim() && e.policy.trim() !== (po && po.rule || "").trim() && e.policy.trim() !== polRule.trim() ? e.policy.trim() : "", evCat = evRule ? rxRuleCat(evRule) : null;
  cats.forEach(k => {
    L.push(`- [ ] Parent policy: **${CATS[k]}**. policyText: TODO, one sentence on what this area covers. enforcementGuidelines: TODO.`);
    risks.filter(x => x.cat === k).forEach(x => {
      const own = polCat && polCat.cat === k ? polRule : evCat && evCat.cat === k ? evRule : "";
      L.push(`  - [ ] Child policy: **${x.n}**. Suggested penalty: ${rxPenalty(x.band)} (the pre-mortem rates this ${BANDS[x.band][0].toLowerCase()}; adjust).`);
      L.push(own ? `    - policyText (from your ${polCat && polCat.cat === k ? "stress-tested rule" : "classifier eval's rule"}): "${rxPlain(own)}"` : `    - policyText: TODO. Draft from the pre-mortem's description of the harm, rewritten as a rule: "${rxPlain(x.d)}"`);
      L.push(`    - enforcementGuidelines: TODO, what reviewers do on a first and a repeat violation. Safeguards the pre-mortem lists: ${x.sgs.slice(0, 3).map(id => SG[id] ? SG[id].t.split(",")[0].split("(")[0].trim() : id).join("; ")}.`);
    });
  });
  if(polRule && !(polCat && cats.includes(polCat.cat))){ const ck = po.result && po.result.reviewer_checklist && po.result.reviewer_checklist.length ? po.result.reviewer_checklist.slice(0, 3).map(rxPlain).join(" ") : "";
    L.push(`- [ ] Parent policy: **${polCat ? polCat.n : "Your stress-tested rule"}**. Suggested penalty: TODO.`, `  - policyText (${po.result && po.result.rewrite ? "the rewrite from" : "from"} the policy stress-tester): "${rxPlain(polRule)}"`, `  - enforcementGuidelines: ${ck ? `from the stress-tester's reviewer checklist: ${ck}` : "TODO"}`); }
  if(evRule && !(evCat && cats.includes(evCat.cat))) L.push(`- [ ] Parent policy: **${evCat ? evCat.n : "Rule from the classifier eval"}**. Suggested penalty: TODO.`, `  - policyText (from the classifier eval${e.name ? `, "${rxPlain(e.name)}"` : ""}): "${rxPlain(evRule)}"`, "  - enforcementGuidelines: TODO");
  L.push(`- [ ] Delete or merge anything above that duplicates a policy you already have. ${r.risks.length - risks.length > 0 ? `The pre-mortem has ${r.risks.length - risks.length} more risks; add policies for them as you go.` : ""}`.trim(), "");
  // 2. item types
  L.push("## 2. Item types (Settings → Item Types)", "", "Coop has three kinds: **Content**, **User** and **Thread**. Each item type has a name, a description and a schema of fields reviewers see and rules can use. Suggested from the pre-mortem's capabilities:", "");
  L.push("- [ ] User: **User** (the default user type). Fields: TODO, e.g. username, display name, account age, verification status, age band, country.");
  const ct = Object.keys(RX_CONTENT_TYPES).filter(k => p.features.includes(k)); ct.forEach(k => L.push(`- [ ] Content: **${RX_CONTENT_TYPES[k][0]}**. Fields: TODO, e.g. ${RX_CONTENT_TYPES[k][1]}.`));
  if(p.features.includes("profiles")) L.push("- [ ] Content or User fields: **Profile** (bio, photo, links). Decide whether profiles are their own content type or fields on the user; Coop's docs use a profile as the schema example.");
  const tt = Object.keys(RX_THREAD_TYPES).filter(k => p.features.includes(k)); tt.forEach(k => L.push(`- [ ] Thread: **${RX_THREAD_TYPES[k][0]}**. Fields: TODO, e.g. ${RX_THREAD_TYPES[k][1]}.`));
  if(p.features.includes("voice")) L.push("- [ ] Voice and video calls: no content item unless you keep recordings or transcripts. TODO: decide what, if anything, a reviewer can see.");
  if(!ct.length && !tt.length) L.push("- [ ] No user-generated content types from the capabilities chosen. Reports will mostly be about users: TODO, confirm the User type carries what reviewers need.");
  L.push("");
  // 3. actions
  L.push("## 3. Actions (Settings → Actions)", "", "Each action has a name, a description, the item types it applies to, a penalty (" + RX_PENALTIES.join("/") + ") and whether it counts toward user strikes. Coop's kinds: **Custom** (Coop POSTs to a callback URL on your platform), **Enqueue to review**, **Enqueue author to review** and **Enqueue to NCMEC**.", "");
  const act = (n, kind, types, pen, strikes, note) => L.push(`- [ ] **${n}**: ${kind}. Item types: ${types}. Penalty: ${pen}. User strikes: ${strikes}.${note ? " " + note : ""}`);
  if(ct.length) act("Remove content", "Custom, callback URL TODO", "every content type", "LOW", "yes", "");
  act("Warn user", "Custom, callback URL TODO", "User", "LOW", "yes", "Tell the user which rule they broke and how to appeal.");
  act("Restrict account", "Custom, callback URL TODO", "User", "MEDIUM", "yes", "For example no messaging or posting for 7 days.");
  act("Suspend user", "Custom, callback URL TODO", "User", "HIGH", "yes", "");
  act("Ban user", "Custom, callback URL TODO", "User", "SEVERE", "yes", "Hide this action in triage queues (section 4).");
  act("Send to review", "Enqueue to review", "every type", "NONE", "no", "For proactive rules that should not act on their own.");
  if(ct.length) act("Send author to review", "Enqueue author to review", "every content type", "NONE", "no", "When the pattern matters more than the item.");
  if(child) act("Enqueue to NCMEC", "Enqueue to NCMEC", "User and media types", "NONE", "no", "Creates an NCMEC review job (section 4). US providers must report CSAM to NCMEC's CyberTipline; TODO, your legal process elsewhere.");
  if(c.moneyMoves) act("Hold payment or payout", "Custom, callback URL TODO", "User" + (p.features.includes("listings") ? ", Listing" : ""), "MEDIUM", "no", "Hold, don't reverse, until a reviewer decides.");
  if(risks.some(x => x.cat === "selfharm")) act("Show support resources", "Custom, callback URL TODO", "User", "NONE", "no", "Not an enforcement action: never count it as a strike.");
  L.push("- [ ] Verify each callback URL's webhook signature on your side (Coop's docs: Handling Actions, `docs/api/actions.md`).", "");
  // 4. queues
  L.push("## 4. Queues (Review Console)", "", "A queue has a name, a description, assigned reviewers, **hidden actions** (actions reviewers in this queue cannot take), an appeals flag and auto-close. Two moderators never get the same job.", "");
  L.push("- [ ] **Triage**: the default queue for anything not routed elsewhere. Hidden actions: Ban user. Reviewers: TODO.");
  cats.forEach(k => L.push(`- [ ] **${CATS[k]}**: reports and rule hits under that parent policy. Hidden actions: ${k === "selfharm" ? "Ban user, Suspend user (support, not punishment)" : "none, or Ban user if juniors staff it"}. Reviewers: ${k === "child" ? "trained child-safety reviewers only (Child Safety Moderator role)" : "TODO"}.`));
  if(child) L.push("- [ ] **NCMEC review jobs**: Coop creates these itself (job kind NCMEC) from hash matches (HMA), Google's Content Safety API, user reports flagged as CSAM and the Enqueue to NCMEC action, grouping a user's media into one job. Only Admin, Moderator Manager and Child Safety Moderator roles can see them. TODO: NCMEC org settings (CyberTipline credentials, contact email, media review requirement: review all media, or a minimum). Outside the US, TODO: your national reporting body. Pair with moderator wellness settings (blur, grayscale, mute).");
  L.push("- [ ] **Appeals**: an appeals queue (`isAppealsQueue`), staffed by someone other than the original reviewer. Appeals arrive through `POST /api/v1/report/appeal`.", "");
  // 5. routing
  L.push("## 5. Routing rules (Review Console → Routing)", "", "Routing rules send incoming reports to a queue. They are evaluated in order and the first match wins; each has a name, item types, a condition set and a destination queue. Appeals have their own rule list.", "");
  let n = 1; if(child) L.push(`- [ ] ${n++}. Report reason is child safety → **${cats.includes("child") ? CATS.child : "Triage"}**${cats.includes("child") ? "" : " (or a dedicated child-safety queue)"}. Coop routes reports flagged as CSAM to NCMEC review itself.`);
  cats.forEach(k => { if(k === "child") return; L.push(`- [ ] ${n++}. Report policy is under **${CATS[k]}** → **${CATS[k]}** queue.`); });
  L.push(`- [ ] ${n++}. Everything else → **Triage**.`, "- [ ] Appeals rule: every appeal → **Appeals**.", "- [ ] Reporting reasons in your product match the parent policies above, so routing has something to match on.", "");
  // 6. automation
  L.push("## 6. Automated enforcement (Automated Enforcement → Proactive Rules, User Strikes)", "", "Proactive rules evaluate submitted items against conditions over signals and matching banks (text banks of phrases and regexes, hash banks through HMA, location banks); every matching rule fires. Start with rules that send to review, not rules that act.", "");
  if(risks.some(x => x.cat === "fraud")) L.push("- [ ] Text bank: scam phrases and payment-app handles seen in reports. Rule: match → Send to review.");
  if(media) L.push("- [ ] Hash bank through HMA: known CSAM" + (risks.some(x => x.cat === "violent") ? " and terrorist content" : "") + ". Rule: match → Enqueue to NCMEC or Send to review.");
  if(text) L.push("- [ ] Classifier signal (OpenAI Moderation API, Zentropi CoPE or your own, under Settings → Integrations): high confidence → Send to review; never remove on a classifier alone until you have measured its precision (the classifier eval can help).");
  if(p.features.includes("location") || p.features.includes("meetups")) L.push("- [ ] Location bank: places you cannot serve or that are off limits. Rule: match → Send to review.");
  L.push("- [ ] User strikes: Policy Scores per policy above (start with the suggested penalties), Strike Enabled Actions (Remove content, Warn, Restrict, Suspend), Thresholds (e.g. restrict at 3, suspend at 5 in 90 days). TODO, your numbers.", "");
  // 7. integrations and go-live
  L.push("## 7. Integrations and go-live", "");
  if(child) L.push("- [ ] NCMEC CyberTipline and Hasher-Matcher-Actioner (HMA) integrations, if you host media and serve US users.", "- [ ] Google Content Safety API for novel CSAM detection, if you qualify for access.");
  if(text) L.push("- [ ] A text classifier integration: OpenAI Moderation API, Zentropi CoPE (a policy-following classifier; the workbench's policy stress-tester can export your rule as a policy file) or a custom one.");
  L.push("- [ ] Submit items with `POST /api/v1/items/async/` and reports with `POST /api/v1/report`, with your API key in the `X-API-KEY` header (Settings → API Keys).", "- [ ] Roles: who is Admin, Moderator Manager, Rules Manager, Moderator, Child Safety Moderator.", "- [ ] Log every decision for your transparency report and statements of reasons (the pre-mortem's enforcement_log safeguard).", "- [ ] Run a tabletop on your top risk before the queue goes live.", "");
  L.push(`_${RX_WIP.charAt(0).toUpperCase() + RX_WIP.slice(1)}. Generated from the pre-mortem's top ${risks.length} risks: ${risks.map(x => x.n).join("; ")}._`);
  return L.join("\n") + "\n";
}

/* ---------- Policy file: the stress-tester's rewrite in the four-part format evPolicyDoc writes ---------- */
function rxPolicyName(po){ const t = (po.result && po.result.rewrite) || po.rule || "", k = rxRuleCat(t); if(k) return k.n; const w = rxPlain(t).replace(/[^\w\s'-]/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 6).join(" "); return w || "Rule from the stress-tester"; }
function rxPolicyFile(po, e){
  po = po === undefined ? (typeof pol !== "undefined" ? pol : null) : po; e = e === undefined ? (typeof ev !== "undefined" ? ev : null) : e;
  const r = po && po.result; if(!r || !r.rewrite || typeof evPolicyDoc !== "function") return "";
  const name = rxPolicyName(po), rewrite = r.rewrite.trim();
  let doc = evPolicyDoc({name, policy:rewrite, content:"", labels:"binary"});
  const ctx = [labelOf(PLATFORMS, po.type), po.youth ? labelOf(YOUTH, po.youth) : "", (po.regions || []).length ? po.regions.map(k => k.toUpperCase()).join(", ") : ""].filter(Boolean).join(", ");
  const head = `_Starter, untested. The rule below is the rewrite Claude suggested in T&S Workbench's policy stress-tester on ${rxDate()}${ctx ? ` for ${ctx}` : ""}; your original read: "${rxPlain(po.rule)}". Nothing here has been tested against a model. Review every line, then fill in or delete every TODO._`;
  doc = doc.replace(/^(# Policy: [^\n]*\n)/, `$1\n${head}\n`);
  // terms the stress-test flagged, where the rewrite still uses them
  const terms = (r.vague_terms || []).filter(v => v && v.term && v.suggest && new RegExp("\\b" + v.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(rewrite));
  if(terms.length) doc = doc.replace("- **Term**: TODO.", terms.map(v => `- **${rxPlain(v.term)}**: ${rxPlain(v.suggest)} _(TODO: confirm; the stress-test flagged this word as one reviewers read differently)_`).join("\n") + "\n- **Term**: TODO.");
  // decisions from the stress-test, as guidance. Never a case the classifier eval tests on: the model would read the answers.
  const evTexts = new Set(((e && e.cases) || []).map(x => rxPlain(x.text).toLowerCase()));
  const cases = (r.edge_cases || []).filter(x => x && x.case && !evTexts.has(rxPlain(x.case).toLowerCase()));
  const word = {allow:"Allowed", remove:"Violates", escalate:"Unclear"};
  const extra = [];
  if(cases.length){ extra.push("Decisions from the stress-test, as guidance (not test cases):", "");
    cases.forEach(x => extra.push(`- ${word[x.decision] || "Decide"}: ${rxPlain(x.reasoning || "")}${x.reasoning ? " " : ""}(for example: ${rxPlain(x.case)})${x.decision === "escalate" ? ". TODO: pick the label such cases get, or keep them out of automated labeling and send them to a reviewer" : ""}.`));
    extra.push("", "TODO: if you run the classifier eval on this rule, keep its test cases distinct from these examples, or delete this list; a model that has read the answers tells you nothing.", ""); }
  if((r.gaps || []).length){ extra.push("Gaps the stress-test found, to decide here:", ""); r.gaps.forEach(g => { if(g && g.gap) extra.push(`- ${rxPlain(g.gap)}: TODO.${g.why ? " " + rxPlain(g.why) : ""}`); }); extra.push(""); }
  if(extra.length) doc = doc.replace("\n## Definition of Labels", "\n" + extra.join("\n") + "\n## Definition of Labels");
  return doc;
}

/* ---------- UI: a Build it panel in the pre-mortem report, a button in the rewrite tab ---------- */
const RX_EXPORTS = [
  {id:"osprey", fn:"rxOsprey", n:"Osprey starter rules", file:"osprey-starter-<name>.sml", from:"the pre-mortem's top risks"},
  {id:"coop", fn:"rxCoop", n:"Coop setup checklist", file:"coop-checklist-<name>.md", from:"the pre-mortem's top risks and your policies"},
  {id:"policy", fn:"rxPolicyFile", n:"Policy file for open models", file:"policy-<name>.md", from:"the stress-tester's rewrite"}
];
const rxIcon = () => typeof DL !== "undefined" && DL ? `<svg><use href="#i-download"/></svg>` : icon("copy");
const rxVerb = () => typeof DL !== "undefined" && DL ? "Download" : "Copy";
function rxBuildHTML(r){
  if(!r || !r.risks || !r.risks.length) return "";
  const n = rxTop(r).length, fname = slug(pm.name);
  return `<section class="card rx-build" aria-labelledby="rx-h">
    <div class="rx-h"><span class="eyebrow">Build it</span><span class="wip-tag">Starter, untested</span>${typeof poweredBy === "function" ? poweredBy(["roost"], "Formats by") : ""}</div>
    <h3 id="rx-h">From this report to files you can start from</h3>
    <p>Two starters from the top ${n} risks: rules for Osprey, ROOST's open-source rules engine, and a setup checklist for Coop, its review console. Every platform-specific value is a TODO, and nothing has run against a real deployment. The workbench is independent of ROOST.</p>
    <div class="row rx-acts"><button type="button" class="btn sm" data-rx="osprey">${rxIcon()}Osprey starter rules</button><button type="button" class="btn sm" data-rx="coop">${rxIcon()}Coop checklist</button><span class="toast" id="rx-toast" role="status" aria-live="polite"></span></div>
    <p class="note rx-files"><span class="mono">osprey-starter-${esc(fname)}.sml</span> · <span class="mono">coop-checklist-${esc(fname)}.md</span>${typeof pol !== "undefined" && pol && pol.result && pol.result.rewrite ? " · The Coop checklist includes your stress-tested rule." : ""}</p>
  </section>`;
}
function rxPolicyBtnHTML(){
  if(typeof pol === "undefined" || !pol || !pol.result || !pol.result.rewrite) return "";
  return `<button type="button" class="btn sm" data-rx="policy" title="The rewrite as a policy file for an open model such as gpt-oss-safeguard. Starter, untested: fill in its TODO lines first.">${rxIcon()}${rxVerb()} as policy file</button><span class="wip-chip">starter</span>`;
}
function rxAct(id){
  const toast = $("#rx-toast") || $("#pol-rwtoast") || $("#pm-toast");
  if(id === "policy"){ const txt = rxPolicyFile(); if(!txt) return; return offerFile(`policy-${slug(rxPolicyName(pol))}.md`, txt, txt, toast); }
  const r = assess(pm); if(!r.risks.length) return;
  if(id === "osprey"){ const txt = rxOsprey(r, pm); return offerFile(`osprey-starter-${slug(pm.name)}.sml`, txt, txt, toast); }
  if(id === "coop"){ const txt = rxCoop(r, pm); return offerFile(`coop-checklist-${slug(pm.name)}.md`, txt, txt, toast); }
}
if(typeof document !== "undefined" && document.addEventListener) document.addEventListener("click", e => { const b = e.target && e.target.closest ? e.target.closest("[data-rx]") : null; if(b) rxAct(b.dataset.rx); });
