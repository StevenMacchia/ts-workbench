/* =========================================================
   GROOMING PATHWAY REVIEW: how an adult could find, reach, bond with, isolate and exploit a child
   through the features of a product, and what's in the way at each step.
   Six stages, each with an exposure (from what the product allows) and a protection (from the
   safeguards in place), a plan of gaps, five drafts and starter rules. Content rule, with no
   exceptions: nothing here describes how grooming is done. Stages are named by what a platform
   can see (who contacts whom, how new the account is, whether value or a link moved), never by
   what is said. Sources checked in October 2026; see GP_SRC. Not legal advice.
   Handbook chapter 6 is the long version.
   ========================================================= */
const GP_REVIEWED = "October 2026";
const GP_SRC = {
  ncmec:["NCMEC CyberTipline data, 2025", "https://www.missingkids.org/gethelpnow/cybertipline/cybertiplinedata"],
  ofcom_children:["UK: what changed for children online from 25 July 2025 (gov.uk)", "https://www.gov.uk/government/news/whats-changing-for-children-on-social-media-from-25-july-2025"],
  ofcom_osa:["UK Online Safety Act explainer (gov.uk)", "https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer"],
  ofcom_gaming:["Ofcom, Growing Up Gaming, October 2026", "https://www.ofcom.org.uk/online-safety/protecting-children/stranger-danger-tops-parents-online-gaming-worries"],
  ec_minors:["European Commission, guidelines on the protection of minors under DSA Article 28, July 2025", "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors"],
  ico:["ICO, Age appropriate design: a code of practice", "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/"],
  esafety:["eSafety Commissioner, notices to gaming companies on grooming, April 2026", "https://www.esafety.gov.au/newsroom/media-releases/esafety-asks-gaming-giants-what-they-are-doing-to-prevent-grooming-and-radicalisation"],
  kansas:["Kansas Attorney General, settlement with Roblox, September 2026", "https://www.ag.ks.gov/Home/Components/News/News/365/"],
  thorn:["Thorn, Youth Perspectives on Online Safety, 2025", "https://info.thorn.org/hubfs/Research/Thorn_2025YouthPerspectives_Report.pdf"],
  lantern:["Tech Coalition, Lantern", "https://technologycoalition.org/programs/lantern/"],
  takeitdown:["NCMEC, Take It Down", "https://takeitdown.ncmec.org/"],
  s2258a:["18 U.S.C. § 2258A", "https://www.law.cornell.edu/uscode/text/18/2258A"],
  kids_act:["European Commission, the proposed KIDS Act, September 2026", "https://commission.europa.eu/news-and-media/news/eu-kids-act-helping-children-navigate-safer-online-world-2026-09-17_en"],
  thorn2022:["Thorn, Online Grooming: Examining Risky Encounters Amid Everyday Digital Socialization, 2022", "https://info.thorn.org/hubfs/Research/2022_Online_Grooming_Report.pdf"],
  thorn_sext:["Thorn, The State of Sextortion in 2025", "https://www.thorn.org/blog/the-state-of-sextortion-in-2025/"],
  weprotect:["WeProtect Global Alliance, Global Threat Assessment 2023", "https://www.weprotect.org/wp-content/uploads/Global-Threat-Asssesment-2023-Press-Release.pdf"],
  techco:["Tech Coalition, Online Grooming: Considerations for Detection, Response and Prevention", "https://technologycoalition.org/wp-content/uploads/Research-Paper-Online-Grooming-Considerations-for-Detection-Response-and-Prevention-of-Online-Grooming.pdf"],
  ncmec_hash:["NCMEC, CyberTipline transparency report 2025 (hash sharing)", "https://ncmec.org/content/dam/missingkids/pdfs/OJJDP-NCMEC-Transparency-CY-2025.pdf"],
  iwf:["Internet Watch Foundation, services for members", "https://www.iwf.org.uk/our-technology/our-services/"],
  roblox:["Roblox, age checks required to chat, January 2026", "https://about.roblox.com/newsroom/2026/01/roblox-age-checks-required-to-chat"],
  instagram:["Instagram, Teen Accounts", "https://about.instagram.com/blog/announcements/instagram-teen-accounts"],
  snap:["Snap, new safeguards for teens, 2023", "https://values.snap.com/news/new-safeguards-for-snapchatters-2023"],
  discord:["Discord, Teen Safety Assist", "https://discord.com/safety/safer-place-for-teens"],
  handbook:["T&S Handbook, chapter 6: Child safety and age assurance", "https://stevenmacchia.com/ts-handbook/child-safety-and-age-assurance/"]
};
// The six stages, in the order contact moves. q is the plain question each stage answers.
const GP_STAGES = [
  {k:"find", n:"Find", q:"How could a stranger find a minor?", tag:"discovery", open:"An adult can find a minor they don't know", none:"Strangers can't find each other here"},
  {k:"reach", n:"Reach", q:"How could a stranger start a conversation?", tag:"first contact", open:"An adult can start a private conversation with a minor they don't know", none:"Strangers can't start conversations here"},
  {k:"bond", n:"Bond", q:"What builds trust in private, and can value move?", tag:"rapport", open:"Contact can deepen in private, with gifts or money, and nothing watches the pattern", none:"Nothing here lets contact deepen in private"},
  {k:"isolate", n:"Isolate", q:"How could the conversation move where nobody watches?", tag:"off-platform", open:"A conversation can move somewhere you can't see, with no friction", none:"There's no private channel to move into"},
  {k:"exchange", n:"Exchange", q:"How could images or live video pass in private?", tag:"image exchange", open:"Images can reach a minor in private with no warning or detection", none:"Images and calls can't pass in private here"},
  {k:"exploit", n:"Exploit", q:"When a case lands, what happens?", tag:"extortion and abuse", open:"If a case lands, there's no trained path to handle it", none:""}
];
const GP_YOUTH = [
  ["kids", "Children under 13, by design", "A kids' game, a learning app, a children's video service."],
  ["teens", "Teens can join", "A minimum age of 13 to 16; teens and adults share the product."],
  ["adult_self", "Adults only, by a typed age", "18+ in the terms with no check. Some minors get in anyway."],
  ["adult_verified", "Adults only, age checked", "Age is verified or estimated before anyone gets access."]
];
const GP_AGE = [
  ["none", "We don't ask", "No age question at all."],
  ["declared", "A typed date of birth", "The user tells you. Enough for safe defaults, not for opening contact with adults."],
  ["estimated", "An estimate where features open up", "Facial or behavioural estimation before chat, voice or gifting unlock."],
  ["verified", "Verified, or a parent signs off", "An ID check, a trusted third party or parental consent before anything that lets an adult reach a minor privately."]
];
const GP_FIND = [
  ["search", "Search by name or username", 1], ["suggest", "Suggested people, friends or accounts to follow", 1], ["profile", "Public profiles", 1],
  ["posts", "Public posts, comments or replies", 1], ["spaces", "Shared spaces: servers, lobbies, rooms, groups", 1], ["nearby", "Nearby or location-based discovery", 2], ["live", "Live streams with a public audience", 1]
];
const GP_REACH = [
  ["dm_any", "A private message to anyone", 4], ["request", "A friend or follow request, with a message", 1], ["comment", "Replies and comments on their posts", 1],
  ["group", "Group or room chat they're both in", 1], ["voice", "Voice chat in a game or room", 1]
];
const GP_PRIV = [
  ["text", "Text messages", 1], ["media", "Photos and video", 2], ["calls", "Voice or video calls", 1], ["links", "Links", 1],
  ["vanish", "Disappearing messages", 1], ["e2ee", "End-to-end encrypted messages", 1]
];
const GP_GIFT = [["gifts", "Virtual gifts, items or in-app currency", 1], ["money", "Real money: tips, payments, subscriptions", 2]];
// Defaults for accounts you believe belong to minors
const GP_DEF = [
  ["private", "Private by default: profile, posts and friend list hidden from strangers"],
  ["nosuggest", "Not suggested to, or searchable by, adults they aren't connected to, including live"],
  ["dmconn", "Messages, requests, calls and voice chat only from accounts they're connected to"],
  ["agegroup", "Chat and shared spaces grouped by age band"],
  ["nogift", "Gifts, currency and payments from strangers blocked or capped"],
  ["location", "Precise location off, and location data stripped from photos"],
  ["notice", "A notice when a stranger, a new account or an account in another country contacts them"],
  ["parent", "A parent can see and change who can contact them, in one place"],
  ["filter", "Sensitive content filtered"]
];
// What you can see without reading messages
const GP_DET = [
  ["rules", "Behaviour rules on adult-to-minor contact: a new account contacting many minors, gifts early, requests to many younger users"],
  ["move", "A request to move to another app, a phone number or a link sent to a minor is flagged"],
  ["classifier", "A conversation classifier for grooming or sextortion patterns, run on adult-to-minor pairs"],
  ["nudity", "Nudity detection on images sent to minors, blurred by default"],
  ["hash", "Hash matching for known child sexual abuse material at upload"],
  ["reports", "A one-tap report for children, and reports from minors go to the front of the queue"],
  ["handover", "Signs an account changed hands (a dormant account returns, behaviour doesn't fit the age) trigger a fresh age check"]
];
// What happens when a case is confirmed
const GP_RESP = [
  ["ladder", "A response that builds as signals stack: log, then friction, then restrict and review"],
  ["queue", "A restricted child-safety queue with trained, supported reviewers; sextortion goes first"],
  ["report", "A reporting process: CyberTipline in the US, with preservation, and the duties in your other markets"],
  ["takeitdown", "Take It Down, crisis resources and “don't pay” guidance shown to the teen fast"],
  ["network", "The account can't reach minors at once; linked accounts are mapped before a visible ban"],
  ["owner", "One owner for age lines and thresholds, with a change log"],
  ["limits", "Pattern detection limited to adult-to-minor pairs, metadata first, retention agreed with Legal, checked per market"]
];
const GP_MEAS = [
  ["strangers", "How often an account a child doesn't know contacts them, week by week"],
  ["rate", "Confirmed unsafe-contact cases per 10,000 young users, by how the contact started"],
  ["time", "Time from first signal to protective action"],
  ["before", "Share of confirmed cases caught before the move to another app"],
  ["adults", "Adults found in teen spaces, and children found in adult spaces"]
];
// How you know a safeguard works. A stage can't be Covered on assumptions alone.
const GP_EV = [["assumed", "We believe it's on", "Nobody has tested it recently"], ["checked", "Someone checked it", "Tested the way a stranger would, within the last quarter"], ["measured", "We measure it", "A number tracks whether it works, week by week"]];
const GP_EVN = {assumed:"Assumed", checked:"Checked", measured:"Measured"};
// Which of the prevention measures has a metric in the metrics framework
const GP_MX = {rate:"Unsafe-contact rate for minors", time:"Time to action by severity (p90)", adults:"Age-assurance coverage"};
const GP_OWNERS = {product:"Product", eng:"Engineering", ops:"T&S Ops", legal:"Legal & Privacy"};
const GP_EFF = {S:"Small", M:"Medium", L:"Large"};
const GP_SEV = {crit:3, high:2, med:1};
const GP_SEVN = {crit:["Critical", "crit"], high:["High", "high"], med:["Medium", "med"]};
const gpLabel = (list, k) => (list.find(z => z[0] === k) || [])[1] || "";
const gpList = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
const gpLow = s => s.charAt(0).toLowerCase() + s.slice(1);
const gpHas = (d, k, v) => Array.isArray(d[k]) && d[k].includes(v);

/* ---------- the safeguards: stage, plain text, the industry term, owner, effort, why, how, sources, when it applies, when it's met ---------- */
// a(d, x): applies to this product. m(d, x): in place, worked out from the answers so the plan can't disagree with them.
const GP_SG = [
  // Find
  {k:"private", st:"find", t:"Minors' accounts are private by default", tag:"safe defaults", o:"product", e:"M", sev:"crit",
    a:(d, x) => x.minors && (x.find.size > 0), m:d => gpHas(d, "def", "private"),
    why:"Most of the protection comes from who can see a child in the first place, not from moderation afterwards. The UK Children's Code expects high-privacy defaults for under-18s, the Commission's DSA guidelines ask for minors' accounts to be private by default with their details hidden from people they aren't connected to, and Instagram's Teen Accounts work that way: teens have to accept new followers.",
    how:"Set every account you believe belongs to a minor to private: profile, posts and connections hidden from people they aren't connected to. Let them open it up only with a stronger age check or a parent.", src:["ico", "ec_minors", "instagram"]},
  {k:"nosuggest", st:"find", t:"Minors aren't suggested to, or searchable by, adults they don't know", tag:"discovery limits", o:"product", e:"M", sev:"crit",
    a:(d, x) => x.minors && (x.find.has("suggest") || x.find.has("search") || x.find.has("nearby") || x.find.has("live")), m:d => gpHas(d, "def", "nosuggest"),
    why:"Friend suggestions and search are how a stranger finds a child without the child doing anything. Ofcom's codes expect services at risk of grooming to keep children out of suggested-connection lists and to hide their connection lists; Snapchat raised the number of mutual friends a teen needs before appearing in search and suggestions.",
    how:"Keep minors out of suggestions, search results, nearby lists and live discovery for accounts they aren't connected to. Suggest minors only to other minors or to confirmed connections.", src:["ofcom_osa", "snap"]},
  {k:"agegroup", st:"find", t:"Shared spaces and chat are grouped by age band", tag:"age-grouped chat", o:"product", e:"L", sev:"high",
    a:(d, x) => x.minors && (x.find.has("spaces") || x.reach.has("group") || x.reach.has("voice")), m:d => gpHas(d, "def", "agegroup"),
    why:"Lobbies, servers and rooms put adults and children in the same space with no introduction. Since January 2026 Roblox requires an age check to chat and, by default, lets each age group chat only with its own and the adjacent groups, so under-16s don't talk to adults; Kansas's 2026 settlement with Roblox writes chat limited to similar age groups into law.",
    how:"Group open spaces and voice chat by age band, and let a minor join an all-ages space only with a parent's sign-off or a stronger age check.", src:["roblox", "kansas", "esafety"]},
  {k:"location", st:"find", t:"Precise location is off for minors, and photos lose their location data", tag:"geolocation off", o:"eng", e:"S", sev:"high",
    a:(d, x) => x.minors && (x.find.has("nearby") || x.priv.has("media") || x.find.has("live")), m:d => gpHas(d, "def", "location"),
    why:"Location turns online contact into a physical risk. The Children's Code expects geolocation off by default for under-18s, and Ofcom's codes expect a child's location hidden from accounts they aren't connected to.",
    how:"Default precise location to off for minors, strip EXIF data from uploads, and never show a minor's city to strangers.", src:["ico", "ofcom_osa"]},
  {k:"filter", st:"find", t:"Sensitive content is filtered for minors", tag:"content controls", o:"product", e:"M", sev:"med", opt:1,
    a:(d, x) => x.minors && (x.find.has("posts") || x.find.has("live") || x.find.has("profile")), m:d => gpHas(d, "def", "filter"),
    why:"Not a grooming safeguard on its own, but the same default set the children's codes expect, and it's usually built in the same sprint.",
    how:"Filter sexual, self-harm and violent content out of what minors can see, with a stronger check to turn it off.", src:["ofcom_children", "ec_minors"]},
  // Reach
  {k:"dmconn", st:"reach", t:"Adults can't message, friend or voice-chat minors they aren't connected to", tag:"contact limits", o:"product", e:"M", sev:"crit",
    a:(d, x) => x.minors && (x.reach.has("dm_any") || x.reach.has("request") || x.reach.has("voice") || x.reach.has("group")), m:d => gpHas(d, "def", "dmconn"),
    why:"The single default that does most of the work. Ofcom's codes expect that accounts not connected to an under-18 can't message them on services at risk of grooming; the Commission's guidelines ask for minors' details hidden from strangers to cut unsolicited contact; Instagram puts teens in its strictest messaging setting and Snapchat requires a friendship first. If you look at where confirmed cases began, many start with an open message from an adult the child didn't follow.",
    how:"Make private messages, requests, calls and voice chat reach a minor only from accounts they're connected to. Let the minor opt in to more only with a parent or a stronger age check.", src:["ofcom_osa", "ec_minors", "instagram", "snap", "handbook"]},
  {k:"newcap", st:"reach", t:"New accounts are capped on how many minors they can contact", tag:"rate limits", o:"eng", e:"S", sev:"high",
    a:(d, x) => x.reach.has("dm_any") || x.reach.has("request"), m:d => gpHas(d, "det", "rules"),
    why:"Financial sextortion moves inside a day: an account posing as a teen makes contact, asks for an image and demands money. In Thorn's 2025 survey, 30% of teens who were extorted got the demand within 24 hours of first contact, and NCMEC received an average of 137 financial sextortion reports a day in 2025. A response built for weeks arrives too late, so the cap on new accounts carries weight.",
    how:"Cap how many minors a new account can message or request in a day, and lower the cap further for accounts in another country from the minor.", src:["thorn_sext", "ncmec", "handbook"]},
  {k:"notice", st:"reach", t:"A minor sees a notice when a stranger, a new account or a far-away account contacts them", tag:"safety prompt", o:"product", e:"S", sev:"high",
    a:(d, x) => x.minors && x.reach.size > 0, m:d => gpHas(d, "def", "notice"),
    why:"The teen is the first line of defence and usually the only one in the conversation. A plain notice about who this is, how new the account is and where it is changes what happens next. Discord shows a teen a safety alert on a first-time message and Snapchat warns a teen who adds someone with no mutual friends.",
    how:"Show a notice on first contact from an account the minor isn't connected to, with one tap to block and report.", src:["discord", "snap", "handbook"]},
  {k:"age", st:"reach", t:"Age assurance matched to what each level unlocks", tag:"age assurance", o:"product", e:"L", sev:"crit",
    a:(d, x) => d.youth !== "adult_verified", m:d => d.age === "estimated" || d.age === "verified",
    why:d => d.youth === "adult_self" ? "Adults-only in the terms with a typed age means minors are on the product with every protection built for them switched off. Australia's eSafety found in 2026 that major games still relied on a typed age." : "A typed date of birth gets safe defaults and not much else. Anything that lets an adult reach a minor privately needs an estimate or a verified age. Every other safeguard assumes you know who's a child.",
    how:"Decide what each level of confidence unlocks: a typed age gets locked-down defaults, an estimate opens chat with people of about the same age, a verified age or a parent's sign-off opens anything that lets an adult reach a minor privately. Put the check at those points, not at sign-up for everyone.", src:["ofcom_children", "ec_minors", "esafety", "handbook"]},
  // Bond
  {k:"nogift", st:"bond", t:"Gifts, currency and payments between strangers and minors are blocked or capped", tag:"gifting limits", o:"product", e:"M", sev:"high",
    a:(d, x) => x.minors && x.gift.size > 0, m:d => gpHas(d, "def", "nogift"),
    why:d => gpHas(d, "gift", "money") ? "Money is both a lure and the end of a sextortion. Gifts and payments from an account the child doesn't know are a signal and a lever at the same time." : "Virtual gifts and in-game currency are a common early move. In the tabletop's gifting scenario, one parent's report leads to forty child accounts.",
    how:"Block gifts, currency and payments from accounts a minor isn't connected to, cap them from new accounts, and treat an early gift to a minor as a signal in your rules.", src:["handbook", "esafety"]},
  {k:"rules", st:"bond", t:"Signals on adult-to-minor contact, with a response that builds", tag:"behavioural detection", o:"eng", e:"M", sev:"high",
    a:(d, x) => x.minors && x.reach.size > 0, m:d => gpHas(d, "det", "rules") && gpHas(d, "resp", "ladder"),
    why:"Grooming rarely shows up in one message. It can build over weeks, and each step looks innocent on its own: an adult account connecting with many younger users it has no link to, a gift early, a move to private voice. Together they're a pattern you can see without reading a word, though confirming it still takes a trained person and usually the conversation. It can also be fast: WeProtect found contact on social gaming platforms escalating to high-risk grooming within 19 seconds, with an average of 45 minutes.",
    how:"Log one signal. On two or more in a short window, add friction: gifting limits, a safety prompt to the child, no new private channels between the two accounts. On a request to move apps or for images, restrict contact and send the full history to a trained reviewer. Test thresholds against past cases before you set them.", src:["handbook", "techco", "weprotect"]},
  {k:"handover", st:"bond", t:"An account that seems to have changed hands gets a fresh age check", tag:"re-verification", o:"ops", e:"M", sev:"med",
    a:(d, x) => x.minors && d.age !== "none", m:d => gpHas(d, "det", "handover"),
    why:"Accounts get shared, sold and handed down to a younger sibling. Months later the person using the account no longer matches the age on file, and a check done once at sign-up never notices.",
    how:"Treat a dormant account coming back, behaviour that doesn't fit the age on file, or a report as a trigger. Put the account back on safe defaults while you ask for a stronger check.", src:["handbook"]},
  // Isolate
  {k:"move", st:"isolate", t:"A request to move to another app, a phone number or a link sent to a minor adds friction", tag:"off-platform signals", o:"eng", e:"M", sev:"high",
    a:(d, x) => x.minors && (x.priv.has("text") || x.priv.has("links") || x.reach.has("dm_any") || x.reach.has("group")), m:d => gpHas(d, "det", "move"),
    why:"Offenders make first contact where a child is and then move them somewhere nobody is watching. In Thorn's survey of 9-to-17-year-olds, two-thirds had been asked by someone they met online to move from a public forum to a private conversation on another platform. The move is the moment you lose sight of it, so it's the signal to act on.",
    how:"Flag links, phone numbers and mentions of other apps sent to a minor by an account they don't know. Warn the minor, hold the link, and send the conversation to review when it follows other signals.", src:["thorn2022", "techco", "handbook"]},
  {k:"hidden", st:"isolate", t:"Disappearing or encrypted channels open only between connected accounts, and contact patterns are still logged", tag:"metadata signals", o:"product", e:"M", sev:"high",
    a:(d, x) => x.priv.has("vanish") || x.priv.has("e2ee"), m:d => gpHas(d, "def", "dmconn"),
    why:"When the content can't be seen, who contacts whom, how often and from how new an account is all you have. A stranger shouldn't be able to open a channel like that with a minor at all.",
    how:"Keep disappearing and encrypted messages between a minor and a stranger off, and keep the metadata (sender age band, account age, first contact, volume) flowing into your rules.", src:["handbook"]},
  {k:"limits", st:"isolate", t:"Pattern detection has privacy limits agreed with Legal, per market", tag:"privacy by design", o:"legal", e:"S", sev:"med",
    a:(d, x) => x.reach.size > 0 || x.priv.size > 0, m:d => gpHas(d, "resp", "limits"),
    why:"Rules on scanning private messages vary, especially in the EU. Agreeing the limits before launch is what lets detection keep running when a regulator asks.",
    how:"Limit detection to adult-to-minor pairs, start with metadata before reading content, set retention limits and write down the legal basis in each market.", src:["handbook", "ec_minors"]},
  // Exchange
  {k:"blur", st:"exchange", t:"Images sent to minors in private are blurred by default, with nudity detection", tag:"nudity protection", o:"eng", e:"M", sev:"crit",
    a:(d, x) => x.minors && x.priv.has("media"), m:d => gpHas(d, "det", "nudity"),
    why:"An image is the point of no return in sextortion and the thing the child is most ashamed of. A blur with a warning and a one-tap report gives the child the choice and gives you the signal.",
    how:"Run nudity detection on images sent to minors, blur them by default with a warning, and make the report one tap. Warn a minor before they send one too.", src:["handbook", "ncmec"]},
  {k:"calls", st:"exchange", t:"Voice and video calls between a minor and a stranger are off", tag:"call limits", o:"product", e:"S", sev:"high",
    a:(d, x) => x.minors && x.priv.has("calls"), m:d => gpHas(d, "def", "dmconn"),
    why:"Live video and voice are the hardest surfaces to see and the fastest route to an image. They should open only between connected accounts for minors.",
    how:"Allow calls to a minor only from connections, and never from an account the minor added in the last day.", src:["handbook"]},
  {k:"hash", st:"exchange", t:"Hash matching for known child sexual abuse material at upload", tag:"hash matching", o:"eng", e:"M", sev:"crit",
    a:(d, x) => x.media, m:d => gpHas(d, "det", "hash"),
    why:"Known material is the one thing you can stop before it's seen. Ofcom's codes expect hash matching from larger services and from any service at high risk of hosting it. NCMEC runs voluntary hash-sharing lists (12.2 million hashes in its non-governmental list at the end of 2025, used by 78 providers) and the IWF gives members an image hash list. A match is also the start of your reporting duty.",
    how:"Match uploads against a trusted hash list (NCMEC, IWF or another hotline), block matches, preserve, and route them to your reporting process. Check your reporting readiness in the sibling tool.", src:["ofcom_osa", "ncmec_hash", "iwf", "s2258a"], link:["reporting", "Check your reporting readiness"]},
  {k:"classifier", st:"exchange", t:"A conversation classifier for grooming and sextortion patterns", tag:"conversation classifier", o:"eng", e:"L", sev:"med",
    a:(d, x) => x.minors && x.priv.has("text"), m:d => gpHas(d, "det", "classifier"),
    why:"Once the metadata rules are in, a classifier on adult-to-minor conversations catches what the rules miss. Tools exist, open and commercial, but each still needs your thresholds and your reviewers behind it.",
    how:"Run a classifier only on adult-to-minor pairs that already have a signal, with the privacy limits agreed, and treat its output as a reason to review, never as a verdict.", src:["handbook"]},
  // Exploit
  {k:"reports", st:"exploit", t:"A child can report in one tap, and reports from minors go to the front", tag:"reporting path", o:"product", e:"S", sev:"high",
    a:(d, x) => x.minors, m:d => gpHas(d, "det", "reports"),
    why:"Most cases still arrive as a report from the child or a parent. If the report is hard to find or waits in a general queue, the window to help closes.",
    how:"Put a report option inside the conversation, in plain words a child would use, and route reports from minors about contact to the child-safety queue first.", src:["handbook"]},
  {k:"queue", st:"exploit", t:"A restricted child-safety queue with trained, supported reviewers", tag:"specialist review", o:"ops", e:"M", sev:"crit",
    a:() => true, m:d => gpHas(d, "resp", "queue"),
    why:"These cases need people trained for them, a restricted escalation path, and limits on how much of this material anyone sees in a day. Sextortion goes to the front: the teen needs a fast, shame-free answer.",
    how:"Name the reviewers, restrict access, set exposure limits and support, and work the queue by risk: requests to move off-platform first, then children under 13, with sextortion ahead of everything.", src:["handbook", "ncmec"]},
  {k:"report", st:"exploit", t:"A reporting process for child sexual exploitation, with preservation", tag:"CyberTipline", o:"legal", e:"M", sev:"crit",
    a:() => true, m:d => gpHas(d, "resp", "report"),
    why:"In the US, a provider must report apparent child sexual abuse material, enticement and child sex trafficking to NCMEC as soon as reasonably possible, and preserve what it reported for a year. Other markets have their own duties. Enticement reports rose 158% in 2025.",
    how:"Register with NCMEC before the first case if US law applies to you, write the first-hour procedure, and map the duties in your other markets. The sibling tool checks all of it.", src:["s2258a", "ncmec"], link:["reporting", "Check your reporting readiness"]},
  {k:"takeitdown", st:"exploit", t:"Take It Down, crisis resources and “don't pay” guidance reach the teen fast", tag:"victim support", o:"product", e:"S", sev:"high",
    a:(d, x) => x.priv.has("media") || x.find.has("live") || x.priv.has("calls"), m:d => gpHas(d, "resp", "takeitdown"),
    why:"A teen being extorted needs to hear three things quickly: this isn't your fault, don't pay, and the images can be taken down. NCMEC's Take It Down hashes images so participating platforms can block them.",
    how:"Show Take It Down and a crisis line in the report flow and in the response to a sextortion report, and have someone on call who can make an emergency referral.", src:["takeitdown", "handbook"]},
  {k:"network", st:"exploit", t:"The account decision is made on purpose: contact with minors cut first, linked accounts mapped before a visible ban", tag:"account handling", o:"ops", e:"M", sev:"med",
    a:() => true, m:d => gpHas(d, "resp", "network"),
    why:"A banned account is not a closed case. The offender comes back on a fresh account with none of the history that flagged them, and the child is still reachable wherever the conversation moved. Offenders work across services: the Tech Coalition's Lantern program lets 41 participating companies share signals such as repeated unsolicited contact with minors, about two million of them from 2023 to 2025.",
    how:"Cut the account's reach to minors at once. Then decide: ban visibly, or restrict quietly while investigators map shared devices, payment details and gift history, with an owner and an end date.", src:["handbook", "lantern"]},
  {k:"parent", st:"exploit", t:"A parent can see and change who can contact their child, in one place", tag:"parental controls", o:"product", e:"M", sev:"high",
    a:(d, x) => d.youth === "kids" || d.youth === "teens", m:d => gpHas(d, "def", "parent"),
    why:"Ofcom's 2026 gaming research found 55% of children who game online play with people they've never met offline, strangers are parents' biggest worry, yet only 43% of parents set rules about who their child plays with. One clear switch does what a maze of settings won't.",
    how:"Give parents one control for who can contact their child, with visibility of connection requests, and keep it in step with the minor's own defaults.", src:["ofcom_gaming", "ec_minors"]},
  {k:"owner", st:"exploit", t:"One owner for age lines and thresholds, with a change log", tag:"governance", o:"ops", e:"S", sev:"med",
    a:(d, x) => d.def.length > 0 || d.det.length > 0, m:d => gpHas(d, "resp", "owner"),
    why:"Where the age lines and detection thresholds sit affects product, safety, legal and privacy at once. If nobody owns them, each team nudges them toward its own goals. Every threshold gets tested the day a regulator or a parent asks why a specific account was or wasn't restricted.",
    how:"Name one owner, give threshold changes the same sign-off as a policy change, and record every change with the numbers behind it.", src:["handbook"]},
  {k:"measure", st:"exploit", t:"Prevention is measured, not just removals", tag:"outcome metrics", o:"ops", e:"S", sev:"med",
    a:() => true, m:d => (d.meas || []).length >= 2,
    why:"Completion rate on an age check says nothing about whether children are safer. The numbers that do: strangers reaching children week by week, unsafe-contact cases per 10,000 young users by entry path, time from first signal to action, and the share caught before the move off-platform.",
    how:"Pick at least two of the prevention measures and put them on the monthly leadership page. The draft is in this report.", src:["handbook"]}
];

// How to check each safeguard works: the test a stranger would run, a replay of past cases, or a drill
const GP_CHK = {
  private:"Make a new adult account and search for a test minor account: nothing should show.", nosuggest:"From a new adult account, check suggestions, search, nearby and live for a test minor: it shouldn't appear.",
  agegroup:"Join a space from a test minor account and from an adult one: they shouldn't meet.", location:"Upload a photo from a test minor account and read its metadata; open a minor's profile from a stranger's account and look for a place.",
  filter:"Browse from a test minor account and log what sensitive content gets through.", dmconn:"From a new adult account, message, request and call a test minor you're not connected to: all three should fail.",
  newcap:"From a new account, try to message more minors than the cap allows and record where it stops.", notice:"Send a first message from a new account to a test minor and screenshot what the minor sees.",
  age:"Count how many active chat and voice users have an age check stronger than a typed birthday.", nogift:"Send a gift or payment from a stranger account to a test minor: it should be blocked or capped.",
  rules:"Replay last quarter's confirmed cases through the rules and record how many fired, and when.", handover:"Take a dormant test account, change its behaviour, and see whether a re-check triggers.",
  move:"Send a link and a mention of another app from a stranger account to a test minor: both should be flagged.", hidden:"Try to open a disappearing or encrypted thread with a test minor from a stranger account.",
  limits:"Ask Legal for the written limits and the date they were agreed.", blur:"Send a flagged test image to a test minor and screenshot what arrives.",
  calls:"Call a test minor from a stranger account: it should fail.", hash:"Run a known test hash through upload and confirm it's blocked, preserved and routed.",
  classifier:"Score last quarter's confirmed and benign conversations and record precision and recall.", reports:"Report a contact from a test minor account and time how long until a trained reviewer sees it.",
  queue:"Name the reviewers, their access, their daily limit and their last support session.", report:"Walk one past case through the procedure on paper and time each step.",
  takeitdown:"Report a sextortion from a test minor account and check Take It Down and the crisis line appear.", network:"Pick a closed case and check whether linked accounts were mapped before the ban.",
  parent:"Sign in as a parent and change who can contact a test minor, in one place.", owner:"Open the change log and find the last threshold change, with the numbers behind it.",
  measure:"Open last month's leadership page and find the numbers."
};
GP_SG.forEach(s => { s.chk = GP_CHK[s.k] || "Test it the way a stranger would, and record the date."; });

/* ---------- state ---------- */
const GP_BLANK = () => ({svc:"", youth:"", age:"", find:[], reach:[], priv:[], gift:[], def:[], det:[], resp:[], meas:[], ev:{}, at:null, view:"setup", tab:"plan", draft:"brief", ex:false});
// Pixelry, the demo company: a photo and short-video app for 13 to 25-year-olds, partway there
const GP_EXAMPLE = {svc:"Pixelry", youth:"teens", age:"declared", find:["search", "suggest", "profile", "posts", "live"], reach:["dm_any", "request", "comment"], priv:["text", "media", "links"], gift:["money"],
  def:["private", "location"], det:["reports", "hash"], resp:["queue", "report"], meas:[], ev:{private:"checked", hash:"measured", reports:"checked"}, view:"report", tab:"plan", draft:"brief", ex:true};
let gp = Object.assign(GP_BLANK(), store.get("gp", null) || {});
const gpSave = () => store.set("gp", gp);
const gpTitle = d => "Grooming pathway: " + (d.svc || "Untitled product");
let gpView = null;
shareRegister("grooming", d => { gp = Object.assign(GP_BLANK(), d, {shared:true}); gpView = null; gpSave(); });

/* ---------- working it out ---------- */
function gpCtx(d){
  const S = k => new Set(Array.isArray(d[k]) ? d[k] : []);
  const find = S("find"), reach = S("reach"), priv = S("priv"), gift = S("gift");
  const minors = d.youth !== "adult_verified", media = priv.has("media") || find.has("posts") || find.has("live") || find.has("profile");
  return {find, reach, priv, gift, minors, kids:d.youth === "kids", media, ageLevel:["none", "declared", "estimated", "verified"].indexOf(d.age)};
}
const gpBand = n => n <= 0 ? 0 : n <= 2 ? 1 : n <= 3 ? 2 : 3;
const gpSum = (list, set) => list.filter(o => set.has(o[0])).reduce((n, o) => n + o[2], 0);
// Exposure 0 to 3 per stage, from what the product allows
function gpExposure(d, x){
  const f = gpSum(GP_FIND, x.find), r = gpSum(GP_REACH, x.reach), g = gpSum(GP_GIFT, x.gift);
  const anyReach = x.reach.size > 0, anyPriv = x.priv.size > 0;
  const e = {
    find:gpBand(f), reach:gpBand(r),
    bond:anyReach || anyPriv ? gpBand((anyReach ? 1 : 0) + g + (x.priv.has("text") ? 1 : 0)) : 0,
    isolate:anyReach || anyPriv ? gpBand((anyReach ? 1 : 0) + (x.priv.has("links") ? 1 : 0) + (x.priv.has("vanish") ? 1 : 0) + (x.priv.has("e2ee") ? 1 : 0) + (x.priv.has("text") ? 1 : 0)) : 0,
    exchange:gpBand((x.priv.has("media") ? 2 : 0) + (x.priv.has("calls") ? 1 : 0) + (x.find.has("live") ? 1 : 0) + (x.priv.has("text") ? 1 : 0))
  };
  e.exploit = Math.max(e.exchange, e.bond, anyReach ? 1 : 0);
  if(!x.minors) Object.keys(e).forEach(k => { e[k] = Math.min(e[k], 1); });
  return e;
}
const gpApplies = (s, d, x) => { try{ return !!s.a(d, x); }catch(e){ return false; } };
const gpMet = (s, d, x) => { try{ return !!s.m(d, x); }catch(e){ return false; } };
const gpWhy = (s, d) => typeof s.why === "function" ? s.why(d) : s.why;
// Every applicable safeguard with its state, the stage picture, the score and the verdict
function gpScore(d, x){
  x = x || gpCtx(d);
  const reqs = GP_SG.filter(s => gpApplies(s, d, x)).map(s => { const met = gpMet(s, d, x); return Object.assign({}, s, {met, ev:met ? ((d.ev || {})[s.k] || "assumed") : null}); });
  const counted = reqs.filter(r => !r.opt), met = counted.filter(r => r.met).length;
  const checks = counted.filter(r => r.met && r.ev === "assumed").sort((a, b) => GP_SEV[b.sev] - GP_SEV[a.sev]), evidenced = counted.filter(r => r.met && r.ev !== "assumed").length;
  const exp = gpExposure(d, x);
  const stages = GP_STAGES.map((st, i) => {
    const rs = counted.filter(r => r.st === st.k), m = rs.filter(r => r.met).length;
    let prot = !rs.length ? 3 : m === 0 ? 0 : m === rs.length ? 3 : m / rs.length >= .5 ? 2 : 1;
    // Covered takes evidence: a stage whose safeguards are only assumed to work tops out at narrowed
    if(m && rs.some(r => r.met && r.ev === "assumed")) prot = Math.min(prot, 2);
    const e = exp[st.k];
    const status = e === 0 ? "none" : prot >= e ? "covered" : prot >= e - 1 ? "narrowed" : "open";
    return {st, i, e, prot, status, reqs:rs, met:m, open:rs.filter(r => !r.met)};
  });
  const order = {open:0, narrowed:1, covered:2, none:3};
  const gaps = counted.filter(r => !r.met).sort((a, b) => {
    const sa = stages.find(s => s.st.k === a.st), sb = stages.find(s => s.st.k === b.st);
    return (order[sa.status] - order[sb.status]) || (GP_SEV[b.sev] - GP_SEV[a.sev]) || (sa.i - sb.i);
  });
  const first = stages.find(s => s.status === "open"), narrowed = stages.filter(s => s.status === "narrowed"), live = stages.filter(s => s.status !== "none");
  const pct = counted.length ? Math.round(met / counted.length * 100) : 0, crit = gaps.filter(r => r.sev === "crit").length;
  let h, tone;
  if(!d.youth){ h = "Tell us who can use the product"; tone = ""; }
  else if(first){ h = first.st.open; tone = "crit"; }
  else if(narrowed.length){ h = `Every path has something in the way, and ${narrowed.length === 1 ? "one stage is" : narrowed.length + " stages are"} only narrowed`; tone = "high"; }
  else if(live.length){ h = "Every path to a minor has a safeguard in the way"; tone = "good"; }
  else { h = "Strangers can't reach each other on this product"; tone = "good"; }
  return {reqs, counted, total:counted.length, met, pct, gaps, crit, stages, exp, first, h, tone, checks, evidenced};
}
// The pre-mortem this review would have drawn on, if it changed after the review was made
function gpStale(d){
  try{ if(!d.at || typeof wsItems !== "function") return null;
    const it = Object.values(wsItems()).filter(i => i.kind === "premortem" && (i.updated || 0) > d.at).sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
    return it ? (it.title || "a pre-mortem") : null; }catch(e){ return null; }
}
// The coverage radar's child-safety row, for the side-by-side line in the report
function gpRadar(){
  try{ if(typeof cvRows !== "function" || typeof cv === "undefined" || !cv || cv.ex) return null;
    const row = cvRows(cv).find(x => x.a.k === "child"); if(!row || !row.rated) return null;
    return {cov:row.cov, layers:CV_LAYERS.map(l => ({n:l.n, lv:row.r[l.k]})).filter(z => z.lv !== undefined)}; }catch(e){ return null; }
}
// A prevention measure's metric in the metrics framework, if the framework is loaded
function gpMetric(k){
  const n = GP_MX[k]; if(!n || typeof METRICS === "undefined" || typeof mxSlug !== "function") return null;
  const m = METRICS.find(z => z.n === n); if(!m) return null;
  return {m, slug:mxSlug(m), tracked:!!(typeof mx !== "undefined" && mx && mx.have && mx.have[n])};
}
function gpBenchPct(){ try{ const d = Object.assign(GP_BLANK(), GP_EXAMPLE); return gpScore(d, gpCtx(d)).pct; }catch(e){ return null; } }
// Starting answers from a pre-mortem: features, money, audience and the safeguards it ticked
function gpFromPM(src){
  const p = src.p, F = k => (p.features || []).includes(k), M = k => (p.money || []).includes(k), D = k => !!((p.done || {})[k]);
  const find = [], reach = [], priv = [], gift = [], def = [], det = [], resp = [];
  if(F("discovery")){ find.push("search", "suggest"); } if(F("profiles")) find.push("profile"); if(F("posts")) find.push("posts"); if(F("groups")) find.push("spaces"); if(F("location")) find.push("nearby"); if(F("live")) find.push("live");
  if(F("dm")) reach.push("dm_any"); if(F("profiles") && (F("dm") || F("groups"))) reach.push("request"); if(F("posts")) reach.push("comment"); if(F("groups")) reach.push("group"); if(F("voice")) reach.push("voice");
  if(F("dm")){ priv.push("text"); if(F("media")) priv.push("media"); if(F("links")) priv.push("links"); } if(F("voice")) priv.push("calls");
  if(M("wallet")) gift.push("gifts"); if(M("p2p") || M("payouts")) gift.push("money");
  if(D("minor_contact")){ def.push("dmconn", "nosuggest"); } if(D("teen_defaults")){ def.push("private", "location", "filter"); } if(D("parental_tools")) def.push("parent");
  if(D("grooming_signals")){ det.push("rules", "move"); } if(D("sextortion_signals") && !det.includes("rules")) det.push("rules"); if(D("report_btn")) det.push("reports"); if(D("dm_nudity_blur")) det.push("nudity"); if(D("csam_review") || D("csam_reporting")) det.push("hash");
  if(D("csam_reporting")) resp.push("report"); if(D("csam_review")) resp.push("queue"); if(D("takeitdown")) resp.push("takeitdown");
  const youth = GP_YOUTH.some(y => y[0] === p.youth) ? p.youth : "";
  return {svc:(p.name || "").replace(" (example)", "").replace(" (draft)", ""), youth, age:youth === "adult_verified" ? "verified" : D("age_assurance") ? "estimated" : "", find, reach, priv, gift, def, det, resp, meas:[], view:"setup"};
}

/* ---------- drafts ---------- */
const gpOpts = (list, keys) => list.filter(o => keys.includes(o[0])).map(o => o[1]);
const gpStageLabel = s => ({none:"Not on your product", open:"Open", narrowed:"Narrowed", covered:"Covered"})[s.status];
function gpBriefMd(){
  const d = gp, x = gpCtx(d), s = gpScore(d, x), svc = d.svc || "[product name]", L = [];
  L.push(`# Safe defaults for minors on ${svc}: product brief`, "", `_Drafted ${new Date().toISOString().slice(0, 10)} with T&S Workbench, from a grooming pathway review. For the product team; not legal advice._`, "",
    "## The one-line case", `**${s.h}.** ${s.met} of ${s.total} safeguards that apply to ${svc} are in place (${s.pct}%).`, "",
    "## Who uses it, and how we know", `- Audience: ${gpLabel(GP_YOUTH, d.youth) || "[not answered]"}`, `- How we know ages: ${gpLabel(GP_AGE, d.age) || "[not answered]"}`, "",
    "## The pathway today", "", "| Stage | What the product allows | Status | What's in the way |", "|---|---|---|---|");
  s.stages.forEach(st => {
    const allows = st.st.k === "find" ? gpOpts(GP_FIND, d.find) : st.st.k === "reach" ? gpOpts(GP_REACH, d.reach) : st.st.k === "bond" ? gpOpts(GP_GIFT, d.gift).concat(x.priv.has("text") ? ["Private text"] : []) : st.st.k === "isolate" ? gpOpts(GP_PRIV, d.priv.filter(k => ["links", "vanish", "e2ee"].includes(k))) : st.st.k === "exchange" ? gpOpts(GP_PRIV, d.priv.filter(k => ["media", "calls"].includes(k))).concat(x.find.has("live") ? ["Live streams"] : []) : [];
    L.push(`| ${st.st.n} | ${allows.length ? allows.join("; ") : "Nothing"} | ${gpStageLabel(st)} | ${st.reqs.filter(r => r.met).map(r => r.t).join("; ") || "Nothing yet"} |`);
  });
  L.push("", "## What to change, in order");
  if(!s.gaps.length) L.push("Nothing for the answers given. Recheck whenever a feature changes who can find or contact a minor.");
  s.gaps.forEach((r, i) => L.push(`${i + 1}. **${r.t}** (${GP_SEVN[r.sev][0]}; ${GP_OWNERS[r.o]}; ${GP_EFF[r.e].toLowerCase()} effort). ${r.how}`));
  if(s.checks.length) L.push("", "## In place, but nobody has checked it works", ...s.checks.map(r => `- **${r.t}.** ${r.chk}`));
  L.push("", "## What each level of age assurance unlocks", "", "| What we know | How we know it | What it unlocks | What it never unlocks |", "|---|---|---|---|",
    "| A typed date of birth | The user told us | Locked-down defaults: private account, no discovery by strangers, no private messages from adults they don't know | [ ] |",
    "| An age estimate | Facial or behavioural estimation at the point a feature opens | Text and voice chat with people of about the same age | [ ] |",
    "| A verified age, or a parent's sign-off | ID check, trusted third party or verifiable parental consent | Anything that lets an adult reach a minor privately | [ ] |", "",
    "## What users will feel", "- Some real friendships start slower, and messages from new accounts to minors they don't know will drop. That's the point.", "- Adults who are wrongly treated as minors get annoyed and can clear it with a stronger check in minutes. A minor wrongly treated as an adult loses every protection, so we weigh those two mistakes differently.", "",
    "## How we'll know it worked", ...GP_MEAS.map(m => `- ${m[1]}${(d.meas || []).includes(m[0]) ? " (measured today)" : ""}`), "",
    "## Where this is expected", "- UK: Ofcom's codes under the Online Safety Act (illegal content duties since March 2025; children's codes since July 2025) expect safer defaults for under-18s, including no messages from accounts they aren't connected to on higher-risk services.",
    "- EU: DSA Article 28 and the Commission's July 2025 guidelines: minors' accounts private by default with their details hidden from strangers, no adding minors to groups without consent, block and mute for everyone, no screenshots of minors' content, parental controls, and age assurance that is accurate, reliable, robust, non-intrusive and non-discriminatory. The proposed KIDS Act (September 2026) would prohibit unsolicited contact from strangers and covers games; it is not law yet.",
    "- US: state settlements are writing the same defaults in. Kansas's September 2026 settlement with Roblox commits it to age checks for all users and chat limited by default to similar age groups.",
    "- Australia: eSafety's April 2026 notices asked the biggest games what they do about grooming; its October 2026 report found some still rely on a typed age.");
  return L.join("\n");
}
function gpLadderMd(){
  const d = gp, svc = d.svc || "[product name]", sig = [];
  if(gpHas(d, "det", "rules")) sig.push("an adult account contacting many minors it has no connection to; a new account's first contacts; a gift or payment to a minor early in a contact");
  if(gpHas(d, "det", "move")) sig.push("a link, phone number or mention of another app sent to a minor by an account they don't know");
  if(gpHas(d, "det", "nudity")) sig.push("an image flagged by nudity detection sent to or requested from a minor");
  if(gpHas(d, "det", "reports")) sig.push("a report from a minor about contact");
  if(gpHas(d, "det", "classifier")) sig.push("a conversation classifier score above the agreed threshold on an adult-to-minor pair");
  return [`# Grooming response ladder: ${svc}`, "", "**Owner:** [name and role] · **Agreed with Legal and Privacy on:** [date] · **Thresholds reviewed:** [quarterly]", "",
    "Signals are things the platform can see without reading a message. The response builds as they stack on one adult-to-minor contact. Protective actions stay automatic; the queue is worked by risk.", "",
    "## Signals we can see today", ...(sig.length ? sig.map(v => `- ${v}`) : ["- [None yet. Start with: account age, adult-to-minor first contacts, volume of new recipients, gifts to minors, links to minors.]"]), "",
    "## The ladder", "", "| Signals on one adult-to-minor contact | Window | Automatic response | Who reviews, and how fast |", "|---|---|---|---|",
    "| One signal | [7 days] | Log only. Nothing visible happens. | No review |",
    "| Two or more | [7 days] | Friction: gifting and payment limits, a safety prompt to the minor, no new private channels between the two accounts | [Sampled weekly by the child-safety lead] |",
    "| A request to move to another app, or for images, after that | [any] | Restrict contact between the accounts; hold links; the minor sees Take It Down and crisis resources | A trained child-safety reviewer, within [hours] |",
    "| A report from the minor, or a sextortion pattern (image then money) | [any] | Restrict at once; the minor hears: not your fault, don't pay, here's help | Front of the queue; on-call emergency referral available |", "",
    "## Rules of the ladder", "- Thresholds come from data: test them against past confirmed cases and past false alarms, and set them where precision holds and reviewers can keep pace.",
    "- Detection runs only on adult-to-minor pairs, metadata first. Content is read only after a signal, within the limits agreed with Legal for each market.",
    "- When flagged contacts outnumber reviewers, protective actions still run; the queue is worked by risk: off-platform requests first, then under-13s, with sextortion ahead of everything.",
    "- Every threshold change is recorded with the numbers behind it and gets the same sign-off as a policy change.", "",
    "## Privacy limits", "- Pairs covered: [adult-to-minor only] · Data used: [account age, first contact, volume, gifts, links, nudity flags] · Content read when: [after two signals, by a trained reviewer] · Retained for: [ ] · Legal basis by market: [US / UK / EU / other]"].join("\n");
}
function gpReviewMd(){
  const d = gp, s = gpScore(d, gpCtx(d)), svc = d.svc || "[product name]";
  return [`# Child-safety review: ${svc}`, "", "_One page for leadership, monthly or on the cadence your reviews already run. Each number says what it counts._", "",
    "## Where we stand", `- ${s.h}. ${s.met} of ${s.total} safeguards in place, ${s.evidenced} of them checked or measured; ${s.crit} critical gap${s.crit === 1 ? "" : "s"}.`, `- Stages: ${s.stages.map(st => `${st.st.n} ${gpStageLabel(st).toLowerCase()}`).join(" · ")}`, "",
    "## Evidence", "", "| Safeguard | Stage | How we know |", "|---|---|---|", ...s.counted.filter(r => r.met).map(r => `| ${r.t} | ${GP_STAGES.find(z => z.k === r.st).n} | ${GP_EVN[r.ev]}${r.ev === "assumed" ? ` ([check: ${r.chk}])` : ""} |`), "",
    "## The numbers", "", "| Measure | This period | Last period | What it counts |", "|---|---|---|---|",
    "| Age-check coverage | [ ] | [ ] | Share of active users of chat and voice with an age check stronger than a typed birthday |",
    "| Strangers reaching children | [ ] | [ ] | Contacts to minors from accounts they aren't connected to, per week |",
    "| Unsafe-contact cases per 10,000 young users | [ ] | [ ] | Confirmed cases, split by how the contact started |",
    "| Time from first signal to protective action | [ ] | [ ] | Median and p90, on adult-to-minor contacts |",
    "| Caught before the move | [ ] | [ ] | Share of confirmed cases acted on before the conversation left the platform |",
    "| Adults in teen spaces · children in adult spaces | [ ] | [ ] | Accounts found in the wrong age band, by how they were found |",
    "| Time to catch an account that changed hands | [ ] | [ ] | From the first sign to a fresh check |",
    "| CyberTipline reports and time to report | [ ] | [ ] | Reports filed; median and p90 from confirmation to filing |", "",
    "## Changes since last time", "- Threshold or age-line changes: [what, why, who signed off]", "- Safeguards shipped: [ ]", "- Cases reviewed afterwards, and what would have stopped each earlier: [ ]", "",
    "## Asks", "- [ ]"].join("\n");
}
function gpMemoMd(){
  const d = gp, x = gpCtx(d), s = gpScore(d, x), svc = d.svc || "[product name]", L = [];
  L.push(`# Grooming pathway review: ${svc}`, "", `_Prepared ${new Date().toISOString().slice(0, 10)} with T&S Workbench, for Legal and Privacy. Not legal advice._`, "",
    "## Summary", `**${s.h}.** ${s.met} of ${s.total} applicable safeguards are in place (${s.pct}%), with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}.`, "",
    "## The product", `- Who can use it: ${gpLabel(GP_YOUTH, d.youth) || "not answered"}`, `- How we know ages: ${gpLabel(GP_AGE, d.age) || "not answered"}`,
    `- How a stranger can find a user: ${gpOpts(GP_FIND, d.find).join("; ") || "no way"}`, `- How a stranger can start a conversation: ${gpOpts(GP_REACH, d.reach).join("; ") || "no way"}`,
    `- In private: ${gpOpts(GP_PRIV, d.priv).join("; ") || "nothing"}`, `- Value between users: ${gpOpts(GP_GIFT, d.gift).join("; ") || "none"}`, "",
    "## The pathway", "", "| Stage | Exposure | Protection | Status |", "|---|---|---|---|");
  s.stages.forEach(st => L.push(`| ${st.st.n} | ${["None", "Low", "Medium", "High"][st.e]} | ${st.reqs.length ? `${st.met} of ${st.reqs.length}` : "Nothing needed"} | ${gpStageLabel(st)} |`));
  L.push("", "## Gaps, in order");
  if(!s.gaps.length) L.push("No gaps for the answers given.");
  s.gaps.forEach((r, i) => L.push(`${i + 1}. **${r.t}** (${GP_SEVN[r.sev][0]}; owner: ${GP_OWNERS[r.o]}; effort: ${GP_EFF[r.e].toLowerCase()}). ${gpWhy(r, d)} To do: ${r.how}`));
  if(s.checks.length) L.push("", "## In place, not yet checked", "A safeguard nobody has tested is a belief. Each of these needs the check below, with a date, before it counts as evidence.", ...s.checks.map(r => `- **${r.t}.** ${r.chk}`));
  L.push("", "## What each market expects",
    "- **United Kingdom.** Online Safety Act: illegal content duties since 17 March 2025 and children's safety duties since 25 July 2025. Ofcom's codes expect safer defaults for under-18s on services at risk of grooming, including no messages from accounts a child isn't connected to, and hash matching from larger or higher-risk services. The ICO's Children's Code expects high-privacy and geolocation-off defaults.",
    "- **European Union.** DSA Article 28 requires a high level of privacy, safety and security for minors; the Commission's July 2025 guidelines set out minors' accounts private by default with details hidden from strangers, no adding minors to groups without consent, block and mute, no screenshots of minors' content, parental controls and criteria for age assurance. Article 28(2) bans profiling-based ads to minors. Scanning private messages is constrained; agree the basis for pattern detection before launch. The proposed KIDS Act (September 2026), which would prohibit unsolicited contact from strangers, is not yet law.",
    "- **United States.** No federal design code yet; the reporting duty under 18 U.S.C. § 2258A covers enticement and child sex trafficking since the 2024 REPORT Act. State attorneys general are writing defaults into settlements (Kansas and Roblox, September 2026). COPPA applies to under-13s' data; see the COPPA readiness tool.",
    "- **Australia.** The Online Safety Act's Basic Online Safety Expectations and eSafety's codes; eSafety's April 2026 notices to Roblox, Minecraft, Fortnite and Steam asked what they do about grooming and sexual extortion. The under-16 social media rule has applied since 10 December 2025 to services with a recommender or logged-in feed.", "",
    "## Questions for counsel", "- Which of our markets constrain reading private messages, and what basis do we have for metadata-only detection on adult-to-minor pairs?",
    "- Which age-assurance level does each market expect at each feature, and where is a typed age no longer enough?",
    "- Which of our markets have a reporting duty for enticement as well as images, and are we registered where we need to be?",
    ...(x.priv.has("e2ee") ? ["- What can we lawfully see on encrypted channels, and is metadata enough to run the ladder?"] : []),
    ...(d.youth === "adult_self" ? ["- We're adults-only by a typed age. What's our exposure if minors are found on the product, and which duties attach once we know?"] : []), "",
    "## Sources", ...[...new Set(s.gaps.flatMap(r => r.src))].map(k => `- ${GP_SRC[k][0]}: ${GP_SRC[k][1]}`), `- ${GP_SRC.handbook[0]}: ${GP_SRC.handbook[1]}`, "", `Checked in ${GP_REVIEWED}. Not legal advice.`);
  return L.join("\n");
}
// Starter rules in the Osprey shape partRX.js uses: labels only, placeholder features, every threshold a TODO
function gpRulesMd(){
  const d = gp, svc = (d.svc || "your product").replace(/[^\w .-]/g, ""), L = [];
  const c = s => L.push(s ? "# " + s : "#");
  c(`Starter rules for the grooming response ladder: ${svc}`); c("STARTER, UNTESTED. Generated by T&S Workbench from a grooming pathway review. Nothing here has run against a real deployment.");
  c("Labels only: anything that acts on a user (friction, a restriction, a queue hand-off) is a UDF you register. The workbench is independent and not affiliated with ROOST."); c();
  L.push("# ---- Features (models). TODO(platform): point each path at your own event fields. ----",
    "UserId: Entity[str] = EntityJson(type='User', path='$.user_id', coerce_type=True)", "EventType: str = JsonData(path='$.event_type', coerce_type=True)",
    "AccountAgeSeconds: int = JsonData(path='$.user.account_age_seconds', coerce_type=True)", "RecipientIsMinor: bool = JsonData(path='$.recipient.is_minor', coerce_type=True)",
    "SenderIsAdult: bool = JsonData(path='$.user.is_adult', coerce_type=True)", "IsFirstContact: bool = JsonData(path='$.message.is_first_contact', coerce_type=True)",
    "NewMinorRecipients24h: int = JsonData(path='$.user.new_minor_recipients_24h', coerce_type=True)  # computed upstream", "IsConnected: bool = JsonData(path='$.pair.is_connected', coerce_type=True)",
    "MentionsOffPlatform: bool = JsonData(path='$.content.mentions_off_platform', coerce_type=True)", "ContainsLink: bool = JsonData(path='$.content.contains_link', coerce_type=True)",
    "GiftValue: int = JsonData(path='$.gift.value', coerce_type=True)", "NudityFlag: bool = JsonData(path='$.media.nudity_flag', coerce_type=True)", "");
  const rule = (name, event, when, label, days, note) => { L.push(`# ${note}`, `# TODO(platform): replace '${event}' and tune every threshold against your own data.`, `${name} = Rule(`, "  when_all=[", `    EventType == '${event}',`); when.forEach(w => L.push(`    ${w},`)); L.push("  ],", `  description="STARTER: ${note}",`, ")", "WhenRules(", `  rules_any=[${name}],`, `  then=[LabelAdd(entity=UserId, label='${label}', expires_after=TimeDelta(days=${days}))],`, ")", ""); };
  rule("MinorFirstContactStarter", "send_message", ["SenderIsAdult == True", "RecipientIsMinor == True", "IsFirstContact == True", "IsConnected == False"], "minor_contact_signal", 7, "One signal: an adult's first message to a minor it isn't connected to. Log only.");
  rule("MinorContactVolumeStarter", "send_message", ["SenderIsAdult == True", "RecipientIsMinor == True", "AccountAgeSeconds < 604800", "NewMinorRecipients24h >= 5"], "minor_contact_friction", 7, "Two signals: a new adult account opening many conversations with minors. Add friction; do not act automatically beyond that.");
  if(gpHas(d, "gift", "gifts") || gpHas(d, "gift", "money")) rule("EarlyGiftToMinorStarter", "send_gift", ["SenderIsAdult == True", "RecipientIsMinor == True", "IsConnected == False", "GiftValue > 0"], "minor_contact_friction", 7, "Two signals: a gift or payment to a minor from an account they aren't connected to.");
  rule("OffPlatformToMinorStarter", "send_message", ["SenderIsAdult == True", "RecipientIsMinor == True", "HasLabel(entity=UserId, label='minor_contact_friction')", "MentionsOffPlatform == True or ContainsLink == True"], "minor_contact_review", 7, "Third rung: after friction, a link, number or mention of another app to a minor. Restrict and route to a trained reviewer.");
  if(gpHas(d, "priv", "media")) rule("ImageToMinorStarter", "send_media", ["SenderIsAdult == True", "RecipientIsMinor == True", "IsConnected == False", "NudityFlag == True"], "minor_contact_review", 7, "Third rung: a flagged image to a minor from a stranger. Front of the queue; the minor sees Take It Down and crisis resources.");
  L.push("# ---- config/labels.yaml ----", "# labels:", "#   minor_contact_signal:  {valid_for: [User], connotation: neutral,  description: \"STARTER: one grooming-ladder signal (T&S Workbench)\"}",
    "#   minor_contact_friction: {valid_for: [User], connotation: negative, description: \"STARTER: two or more signals; friction applies (T&S Workbench)\"}",
    "#   minor_contact_review:  {valid_for: [User], connotation: negative, description: \"STARTER: restrict and review by a trained child-safety reviewer (T&S Workbench)\"}");
  return L.join("\n") + "\n";
}
const GP_DRAFTS = [["brief", "Product brief", "safe-defaults-brief"], ["ladder", "Response ladder", "grooming-response-ladder"], ["review", "Leadership page", "child-safety-review"], ["memo", "Memo for Legal", "grooming-pathway-memo"], ["rules", "Starter rules", "grooming-starter-rules"]];
const gpDraftMd = k => k === "ladder" ? gpLadderMd() : k === "review" ? gpReviewMd() : k === "memo" ? gpMemoMd() : k === "rules" ? gpRulesMd() : gpBriefMd();

/* ---------- page ---------- */
function gpPreviewHTML(){
  const saved = gp;
  try{ gp = Object.assign(GP_BLANK(), JSON.parse(JSON.stringify(GP_EXAMPLE))); const x = gpCtx(gp); return gpReportHTML(x, gpScore(gp, x)); }
  catch(e){ return ""; }
  finally{ gp = saved; }
}
function gpSpec(){
  const setV = (k, v) => { gp[k] = v; gp.ex = false; gpSave(); };
  const multi = (id, eb, title, why, list, key, none, extra) => Object.assign({id, eb, title, why, kind:"multi", opt:true, none, opts:() => list.map(o => ({k:o[0], n:o[1]})),
    get:() => gp[key] || [], toggle:k => setV(key, (gp[key] || []).includes(k) ? gp[key].filter(v => v !== k) : (gp[key] || []).concat(k)), clear:() => setV(key, [])}, extra || {});
  const steps = [
    {id:"svc", eb:"Your product", title:"What's the product or feature called?", why:"It's named in the plan and in every draft.", kind:"text", opt:true, placeholder:"For example: Pixelry", max:80, get:() => gp.svc, set:v => setV("svc", v.slice(0, 80))},
    {id:"youth", eb:"Who uses it", title:"Who can use it?", why:"Everything else depends on whether minors are on the product, by design or in practice.", kind:"single", opts:() => GP_YOUTH.map(([k, n, h]) => ({k, n, h})), get:() => gp.youth, set:k => setV("youth", k)},
    {id:"age", eb:"Knowing ages", title:"How do you know how old someone is?", why:"Every safeguard below assumes you can tell who's a child. What you know decides what you can safely unlock.", kind:"single", skip:() => gp.youth === "adult_verified",
      opts:() => GP_AGE.map(([k, n, h]) => ({k, n, h})), get:() => gp.age, set:k => setV("age", k)},
    multi("find", "Find", "How could a stranger find another user?", "The first stage. A child who can't be found by an adult they don't know is already most of the way to safe.", GP_FIND, "find", "No way: connections only, by invite or known contacts"),
    multi("reach", "Reach", "How could a stranger start a conversation?", "The second stage, and where most confirmed cases begin: an open message from an adult the child didn't follow.", GP_REACH, "reach", "No way to start a conversation with a stranger"),
    multi("priv", "In private", "What can happen in private between two users?", "Private channels are where contact deepens, moves and turns into an image. Tick everything that's possible once two users are talking.", GP_PRIV, "priv", "There's no private channel"),
    multi("gift", "Value", "Can value move between users?", "Gifts and money are a lure early and the point of sextortion late.", GP_GIFT, "gift", "No gifts or payments between users"),
    multi("def", "Defaults for minors", "For accounts you believe belong to minors, what's true today?", "The defaults do most of the work. Tick what every under-18 account gets without anyone changing a setting.", GP_DEF, "def", "None of these yet", {skip:() => gp.youth === "adult_verified"}),
    multi("det", "What you can see", "What can you detect without reading messages?", "Patterns, not messages. Grooming builds over weeks and each step looks innocent alone.", GP_DET, "det", "Nothing yet"),
    multi("resp", "When a case lands", "When a case is confirmed, what happens?", "The stage where the law and the child both need the response to be ready before the first case.", GP_RESP, "resp", "Nothing written down yet"),
    {id:"ev", eb:"How you know", title:"For the safeguards you have, how do you know each one works?", why:"A safeguard nobody has tested is a belief. Pick the honest answer; a stage can't be covered on assumptions alone, and anything assumed becomes a check to run.", kind:"custom", opt:true,
      skip:() => !gpScore(gp, gpCtx(gp)).counted.some(r => r.met), html:() => gpEvRowsHTML(), next:"Continue"},
    multi("meas", "Measuring", "Which of these do you measure?", "Removals say nothing about whether children are safer. These do.", GP_MEAS, "meas", "None yet")
  ];
  const src = typeof loopSource === "function" ? loopSource() : null, org = typeof orgGet === "function" && orgGet().confirmed && GP_YOUTH.some(y => y[0] === orgGet().youth);
  return {k:"grooming", tool:{name:"Grooming pathway review", icon:"route", color:"var(--t-gp)"},
    intro:{title:"How could an adult reach a child, and what's in the way?", lead:"Twelve questions about who can reach whom and what happens in private. Then six stages, your safeguards and five drafts.",
      note:"Nothing here describes how grooming is done, only what a platform can see.",
      facts:[["About 7 minutes", "One question at a time. Only the questions that apply to your answers."], ["Six stages", "Find, reach, bond, isolate, exchange, exploit. Each gets an exposure and a protection."], ["Not legal advice", "Where each market expects these defaults, with the source, for your conversation with counsel."]], start:"Start"},
    alt:[{n:"Answer everything on one page", run:() => { gpView = "page"; renderGrooming(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }}]
      .concat(org ? [{n:"Start from your workspace profile", run:() => gpAct("fromorg")}] : []).concat(src ? [{n:"Start from your pre-mortem", run:() => gpAct("frompm")}] : []).concat([{n:"See a finished example", run:() => gpAct("example")}]),
    steps, finish:"Map the pathway",
    preview:gpPreviewHTML,
    done:() => { gp.view = "report"; gp.tab = "plan"; gp.at = Date.now(); gpSave(); renderGrooming(); window.scrollTo(0, 0); focusQuiet(document.querySelector("#view h1")); }};
}
// One row per safeguard in place: how you know it works
function gpEvRowsHTML(){
  const s = gpScore(gp, gpCtx(gp)), rows = s.counted.filter(r => r.met);
  if(!rows.length) return `<p class="note">Tick what you have in place first; then say how you know each one works.</p>`;
  return `<div class="gp-ev">${rows.map(r => `<div class="gp-evrow"><div><b>${esc(r.t)}</b><small>${esc(GP_STAGES.find(z => z.k === r.st).n)} · ${esc(r.chk)}</small></div>
    <div class="segs gp-evseg" role="group" aria-label="How you know: ${esc(r.t)}">${GP_EV.map(([k, n, h]) => `<button type="button" data-gpev="${r.k}" data-v="${k}" aria-pressed="${r.ev === k}" title="${esc(h)}">${esc(n)}</button>`).join("")}</div></div>`).join("")}</div>`;
}
function renderGrooming(){
  const x = gpCtx(gp), s = gpScore(gp, x), report = (gp.view === "report" && !!gp.youth) || gp.ex;
  if(!report && gpView !== "page") return gdRender(gpSpec());
  gdCur = null;
  view.innerHTML = (report
    ? headCompact("Grooming pathway review", `${esc(gp.svc || "Your product")} · ${esc(s.h)}`,
        reportHeaderActions({
          edit:{attrs:'data-gp="edit"', label:EDIT_ANSWERS_LABEL},
          save:{attrs:'data-gp="save"', label:wsSaveLabel("grooming", gp), icon:"save"},
          download:{attrs:'data-gp="brief"', label:"Product brief", icon:"download"},
          tracker:s.gaps.length ? {attrs:'data-gp="tasks"', label:SEND_TRACKER_LABEL, icon:"send"} : null
        }, `<button type="button" class="btn sm" data-gp="sharelink">${COPY_LINK_LABEL}</button>`))
    : head("Grooming pathway review", "See how an adult could find, reach, bond with, isolate and exploit a child through the features of your product, and what's in the way at each step.", "Build safely",
        `<span class="toast" id="gp-toast" role="status" aria-live="polite"></span><button type="button" class="btn sm" data-gp="example">${SEE_EXAMPLE_LABEL}</button>${gp.youth ? `<button type="button" class="btn sm" data-gp="reset">${START_OVER_LABEL}</button>` : ""}${typeof loopSource === "function" && loopSource() ? `<button type="button" class="btn sm" data-gp="frompm">Start from your pre-mortem</button>` : ""}`))
    + `<div class="cp-root gp-root">${report ? gpReportHTML(x, s) : gpSetupHTML(x, s)}</div>`;
}
// The one-page form: the same answers as the guided flow, all on one screen
function gpSetupHTML(x, s){
  const tile = (attr, cur, k, n, h) => `<button type="button" role="radio" aria-checked="${cur === k}" class="card tr-tier ${cur === k ? "on" : ""}" data-${attr}="${k}"><b>${esc(n)}</b>${h ? `<span>${esc(h)}</span>` : ""}</button>`;
  const chk = (key, [k, label]) => `<label class="tr-chk"><input type="checkbox" data-gpset="${key}" value="${k}" ${gpHas(gp, key, k) ? "checked" : ""}><span>${esc(label)}</span></label>`;
  const sec = (n, id, title, tag, body, tip) => `<section class="card pol-card" id="${id}"><div class="pol-h"><span class="pol-num">${n}</span><div><span class="pol-lbl">${title}</span>${tag ? `<span class="note">${tag}</span>` : ""}</div></div>${tip ? `<p class="pol-tip cp-tip">${tip}</p>` : ""}${body}</section>`;
  const checks = (key, list) => `<div class="cp-checks">${list.map(o => chk(key, o)).join("")}</div>`;
  let n = 1, out = `<div class="banner cvt-b"><span><strong>Prefer one question at a time?</strong> The guided version asks the same things, and only what applies to your answers.</span><button type="button" class="btn sm" data-gp="guide">Switch to guided</button></div>`;
  out += sec(n++, "gp-s-who", "Your product", "", `<div class="field"><label for="gp-svc">Product or feature name</label><input class="input" id="gp-svc" value="${esc(gp.svc)}" placeholder="For example: Pixelry" maxlength="80" autocomplete="off"></div>
    <div class="field"><span class="lbl">Who can use it?</span><div class="tr-tiers cp-aud gp-youth" role="radiogroup" aria-label="Who can use it">${GP_YOUTH.map(([k, nm, h]) => tile("gpyouth", gp.youth, k, nm, h)).join("")}</div></div>
    ${gp.youth !== "adult_verified" ? `<div class="field"><span class="lbl">How do you know how old someone is?</span><div class="tr-tiers cp-two" role="radiogroup" aria-label="How you know ages">${GP_AGE.map(([k, nm, h]) => tile("gpage", gp.age, k, nm, h)).join("")}</div></div>` : ""}`);
  out += sec(n++, "gp-s-find", "How a stranger could find and reach a user", "Tick everything the product allows", `<div class="field"><span class="lbl">Find another user they don't know</span>${checks("find", GP_FIND)}</div>
    <div class="field"><span class="lbl">Start a conversation</span>${checks("reach", GP_REACH)}</div>
    <div class="field"><span class="lbl">In private, between two users</span>${checks("priv", GP_PRIV)}</div>
    <div class="field"><span class="lbl">Value between users</span>${checks("gift", GP_GIFT)}</div>`, "A child who can't be found by an adult they don't know is already most of the way to safe.");
  out += sec(n++, "gp-s-have", "What you have in place", "Tick what's true today", `${gp.youth !== "adult_verified" ? `<div class="field"><span class="lbl">Defaults for accounts you believe belong to minors</span>${checks("def", GP_DEF)}</div>` : ""}
    <div class="field"><span class="lbl">What you can detect without reading messages</span>${checks("det", GP_DET)}</div>
    <div class="field"><span class="lbl">When a case is confirmed</span>${checks("resp", GP_RESP)}</div>
    <div class="field"><span class="lbl">What you measure</span>${checks("meas", GP_MEAS)}</div>`);
  if(s.counted.some(r => r.met)) out += sec(n++, "gp-s-ev", "How you know each one works", `${s.evidenced} of ${s.met} checked or measured`, gpEvRowsHTML(), "A safeguard nobody has tested is a belief. A stage can't be covered on assumptions alone, and anything assumed becomes a check to run.");
  const tone = s.crit ? "crit" : s.pct >= 80 ? "good" : "high";
  out += `<div class="card pol-runbar">
      <div class="pol-rb-meter"><div class="pol-rb-top"><span class="eyebrow">Safeguards in place</span>${s.total ? `<span class="pill ${tone}">${s.met} of ${s.total}</span>` : ""}</div>
        <div class="pol-meter" role="meter" aria-valuemin="0" aria-valuemax="${s.total || 1}" aria-valuenow="${s.met}" aria-label="Safeguards in place"><i style="width:${s.pct}%;background:var(--${tone})"></i></div>
        <span class="note">${!gp.youth ? "Choose who can use the product to start." : s.crit ? `${s.crit} critical gap${s.crit === 1 ? "" : "s"} so far.` : s.total ? "No critical gaps so far." : "Nothing to check yet."}</span></div>
      <div class="pol-rb-act"><button type="button" class="btn primary" data-gp="build" ${gp.youth ? "" : "disabled"}>Map the pathway ${icon("arrow")}</button></div></div>
    <p class="note pol-rb-note">Everything stays in your browser. Sources checked in ${GP_REVIEWED}. Not legal advice.</p>`;
  return `<div class="pol-setup cp-setup gp-setup">${out}</div>`;
}
const GP_STATUS = {none:["Not on your product", ""], open:["Open", "crit"], narrowed:["Narrowed", "high"], covered:["Covered", "good"]};
function gpStageStrip(s){
  return `<ol class="gp-strip" aria-label="The six stages">${s.stages.map(st => `<li class="gp-st ${st.status}"><span class="gp-stn">${st.i + 1}</span><b>${esc(st.st.n)}</b><small>${GP_STATUS[st.status][0]}</small></li>`).join("")}</ol>`;
}
function gpReportHTML(x, s){
  const tab = ["plan", "path", "drafts", "sg"].includes(gp.tab) ? gp.tab : "plan", tone = s.tone || (s.crit ? "crit" : "good");
  const sentence = `${esc(s.h)}. ${s.pct}% of the safeguards that apply are in place${s.crit ? `, with ${s.crit} critical gap${s.crit === 1 ? "" : "s"}` : s.total ? ", no critical gaps" : ""}.`;
  const actions = s.gaps.slice(0, 3).map(r => ({t:r.t, sub:r.how})).concat(s.checks.slice(0, Math.max(0, 3 - s.gaps.length)).map(r => ({t:`Check that ${gpLow(r.t)} really works`, sub:r.chk})));
  const bench = gpBenchPct(), radar = gpRadar(), stale = gp.ex ? null : gpStale(gp);
  return `<div class="pol-report cp-report gp-report">
    ${gp.shared ? shareBannerHTML('data-gp="unshare"') : ""}
    ${gp.ex ? `<div class="banner"><span><strong>This is an example:</strong> Pixelry, a photo and short-video app for 13 to 25-year-olds, partway there. Start over to map your own product.</span><button type="button" class="btn sm" data-gp="reset">Start over</button></div>` : ""}
    ${stale ? `<div class="banner cp-ap high"><span><strong>${esc(stale)} changed after this review.</strong> A new feature can open a stage that was covered. Check the answers.</span><button type="button" class="btn sm" data-gp="edit">Edit answers</button></div>` : ""}
    <div class="card pol-sum tr-sum"><div class="tr-ring cp-ring ${tone}"><b>${s.pct}%</b><span>in place</span></div>
      <div><span class="eyebrow">${esc(gpLabel(GP_YOUTH, gp.youth))}</span><div class="verdict-row" aria-live="polite"><h2 class="pol-verdict">${sentence}</h2>${gradeBadge(s.pct, "Share of applicable safeguards in place")}</div>
      <p class="note">${s.first ? `The first open stage is <b>${esc(s.first.st.n.toLowerCase())}</b>: ${esc(gpLow(s.first.st.q))} Close it first; every later stage depends on it.` : "Contact that can't start can't escalate. Keep the defaults as features change."}${s.checks.length ? ` ${s.checks.length === 1 ? "One safeguard is" : s.checks.length + " safeguards are"} in place but assumed to work; a stage can't be covered on assumptions.` : ""}</p>
      ${radar ? `<p class="note gp-radar">Your <a href="#coverage">coverage radar</a> rates child safety at ${radar.cov}% coverage: ${esc(radar.layers.map(z => `${z.n.toLowerCase()} ${CV_LEVELS[z.lv].toLowerCase()}`).join(", "))}. The radar scores the layers of defence; this review scores the path.</p>` : (!gp.ex ? `<p class="note gp-radar"><a href="#coverage">Rate the child-safety row in your coverage radar</a> to see the layers of defence beside this path.</p>` : "")}
      ${bench !== null && !gp.ex ? `<p class="bench-line">Typical for a teen social app like the built-in example: ${bench}% in place</p>` : ""}
        <div class="cp-kpis"><span class="pill ${s.crit ? "crit" : "good"}">${s.crit} critical gap${s.crit === 1 ? "" : "s"}</span><span class="pill">${s.met} of ${s.total} safeguards in place</span><span class="pill ${s.met && !s.evidenced ? "high" : ""}">${s.evidenced} of ${s.met} checked or measured</span><span class="pill">${s.stages.filter(z => z.status === "open").length} of ${s.stages.filter(z => z.status !== "none").length} stages open</span></div>
        <span class="toast" id="gp-toast" role="status" aria-live="polite"></span></div></div>
    ${gpStageStrip(s)}
    ${actions.length ? `<ol class="pk-list gd-vacts">${actions.map(a => `<li><b>${esc(a.t)}.</b> ${esc(a.sub)}</li>`).join("")}</ol>` : ""}
    ${chapterLinkHTML("grooming")}
    <details class="ev-details"${detailsOpenAttr()}><summary>Details <span class="note">Your plan, the pathway, drafts and every safeguard</span></summary>
    <div class="card pol-tabs"><div class="card-h"><div class="segs" role="group" aria-label="Report sections">${[["plan", "Your plan", s.gaps.length], ["path", "The pathway", s.stages.filter(z => z.status !== "none").length], ["drafts", "Drafts", GP_DRAFTS.length], ["sg", "Safeguards", s.total]].map(([k, nm, c]) => `<button type="button" data-gptab="${k}" aria-pressed="${tab === k}">${nm} <span class="mono" style="opacity:.6">${c}</span></button>`).join("")}</div></div>
      <div class="card-b">${tab === "path" ? gpPathHTML(x, s) : tab === "drafts" ? gpDraftsHTML() : tab === "sg" ? gpSgHTML(s) : gpPlanHTML(s)}</div></div>
    </details>
    <p class="note">${gp.at && !gp.ex ? `Reviewed ${new Date(gp.at).toISOString().slice(0, 10)}. Re-check whenever a feature changes who can find or contact a minor. ` : ""}Nothing here describes how grooming is done; stages are named by what a platform can see. Sources checked in ${GP_REVIEWED}. A starting point for product, Legal and Privacy, not legal advice.</p>
  </div>`;
}
// In place, but assumed: the checks to run, with the evidence control beside each
function gpChecksHTML(s){
  if(!s.checks.length) return "";
  return `<div class="pol-sec-h gp-checks-h"><h4>Check it works <span class="note">${s.checks.length} in place but assumed</span></h4><p class="note">A safeguard nobody has tested is a belief. Run the check, then say how you know.</p></div>
    <div class="cp-gaps">${s.checks.map(r => `<article class="cp-gap gp-check"><span class="cv-gn mono">✓</span><div class="cp-gb">
      <span class="eyebrow">${esc(GP_STAGES.find(z => z.k === r.st).n)} · <span class="gp-tag">${esc(r.tag)}</span></span><h4>${esc(r.t)} <span class="pill high">Assumed</span></h4>
      <p class="cp-fix"><b>How to check.</b> ${esc(r.chk)}</p>
      <div class="segs gp-evseg" role="group" aria-label="How you know: ${esc(r.t)}">${GP_EV.map(([k, n, h]) => `<button type="button" data-gpev="${r.k}" data-v="${k}" aria-pressed="${r.ev === k}" title="${esc(h)}">${esc(n)}</button>`).join("")}</div></div></article>`).join("")}</div>`;
}
// The prevention measures that live in the metrics framework
function gpMetricsHTML(){
  const xs = Object.keys(GP_MX).map(k => ({k, m:gpMetric(k)})).filter(z => z.m);
  if(!xs.length) return "";
  return `<div class="pol-sec-h gp-mx-h"><h4>Track it <span class="note">in the metrics framework</span></h4></div>
    <ul class="gp-mx">${xs.map(({k, m}) => `<li><a href="#metrics/${m.slug}">${esc(m.m.n)}</a><span class="note">${esc(gpLabel(GP_MEAS, k))}${m.tracked ? " · tracked today" : (gp.meas || []).includes(k) ? " · you measure this; mark it tracked there" : ""}</span></li>`).join("")}</ul>`;
}
function gpPlanHTML(s){
  if(!s.gaps.length) return `<div class="card ma-none"><b>${s.total ? "Every safeguard that applies to your answers is in place." : "Nothing applies to your answers yet."}</b><p class="note">${s.total ? "Recheck whenever a feature changes who can find or contact a minor." : "Say who can use the product and what it allows to see what applies."}</p></div>` + gpChecksHTML(s) + gpMetricsHTML();
  return `<div class="pol-sec-h"><p class="note">Earliest open stage first, then by severity. Each gap names who usually owns it, the effort, and where it's expected.</p></div>
    <div class="cp-gaps">${s.gaps.map((r, i) => `<article class="cp-gap"><span class="cv-gn mono">${i + 1}</span><div class="cp-gb">
      <span class="eyebrow">${esc(GP_STAGES.find(z => z.k === r.st).n)} · <span class="gp-tag">${esc(r.tag)}</span></span><h4>${esc(r.t)} ${pill(GP_SEVN[r.sev][1], GP_SEVN[r.sev][0])}</h4>
      <p>${esc(gpWhy(r, gp))}</p><p class="cp-fix"><b>What to do.</b> ${esc(r.how)}${r.link ? ` <a href="#${r.link[0]}">${esc(r.link[1])}</a>` : ""}</p>
      <div class="cp-gm"><span class="tag">${esc(GP_OWNERS[r.o])}</span><span class="tag">${esc(GP_EFF[r.e])} effort</span>${r.src.map(k => `<a class="tag" href="${GP_SRC[k][1]}" target="_blank" rel="noopener">${esc(GP_SRC[k][0].split(",")[0])}</a>`).join("")}</div></div></article>`).join("")}</div>` + gpChecksHTML(s) + gpMetricsHTML();
}
function gpPathHTML(x, s){
  const allows = st => st.k === "find" ? gpOpts(GP_FIND, gp.find) : st.k === "reach" ? gpOpts(GP_REACH, gp.reach) : st.k === "bond" ? gpOpts(GP_GIFT, gp.gift).concat(x.priv.has("text") ? ["Private text"] : []) : st.k === "isolate" ? gpOpts(GP_PRIV, gp.priv.filter(k => ["links", "vanish", "e2ee"].includes(k))) : st.k === "exchange" ? gpOpts(GP_PRIV, gp.priv.filter(k => ["media", "calls"].includes(k))).concat(x.find.has("live") ? ["Live streams"] : []) : [];
  return `<p class="note">Each stage shows what your product allows, how exposed that leaves a minor, and what's in the way. Exposure comes from your feature answers; protection from the safeguards in place for that stage. A stage is covered only when its safeguards are checked or measured, not assumed.</p>
    <div class="gp-path">${s.stages.map(st => `<article class="card gp-stage ${st.status}">
      <div class="gp-sh"><span class="gp-stn">${st.i + 1}</span><div><h4>${esc(st.st.n)} <span class="gp-tag">${esc(st.st.tag)}</span></h4><p class="note">${esc(st.st.q)}</p></div><span class="pill ${GP_STATUS[st.status][1]}">${GP_STATUS[st.status][0]}</span></div>
      ${st.status === "none" ? `<p class="note">${esc(st.st.none || "Nothing applies.")}</p>` : `
      <div class="gp-meters"><div><span class="gp-ml">Exposure</span><div class="gp-m" role="meter" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${st.e}" aria-label="Exposure at ${esc(st.st.n)}"><i style="width:${st.e / 3 * 100}%;background:var(--${["good", "med", "high", "crit"][st.e]})"></i></div><small>${["None", "Low", "Medium", "High"][st.e]}</small></div>
        <div><span class="gp-ml">Protection</span><div class="gp-m" role="meter" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${st.prot}" aria-label="Protection at ${esc(st.st.n)}"><i style="width:${st.prot / 3 * 100}%;background:var(--good)"></i></div><small>${st.reqs.length ? `${st.met} of ${st.reqs.length} safeguards` : "Nothing needed"}</small></div></div>
      ${st.st.k !== "exploit" ? `<p class="gp-allow"><b>What you allow.</b> ${allows(st.st).length ? esc(allows(st.st).join(", ")) : "Nothing at this stage"}.</p>` : ""}
      ${st.reqs.filter(r => r.met).length ? `<p class="gp-have"><b>In the way.</b> ${st.reqs.filter(r => r.met).map(r => esc(r.t) + (r.ev === "assumed" ? ` <span class="gp-tag">assumed</span>` : ` <span class="gp-tag gp-tag-ok">${esc(GP_EVN[r.ev].toLowerCase())}</span>`)).join("; ")}.</p>` : ""}
      ${st.open.length ? `<p class="gp-open"><b>Still open.</b> ${esc(st.open.map(r => r.t).join("; "))}.</p>` : ""}`}
    </article>`).join("")}</div>`;
}
function gpDraftsHTML(){
  const k = GP_DRAFTS.some(z => z[0] === gp.draft) ? gp.draft : "brief";
  const intro = {brief:"The case for safe defaults, written for the product team: the pathway today, what to change in order, what each level of age assurance unlocks, and where each market expects it.", ladder:"The response that builds as signals stack on one adult-to-minor contact, with the privacy limits to agree before launch.", review:"One page for leadership, with the numbers that show prevention is working and what each one counts.", memo:"A summary for Legal and Privacy: the product, the pathway, the gaps, what each market expects and the questions to settle.", rules:"Starter rules in the shape of ROOST's Osprey rules engine: labels only, every threshold a TODO, nothing tested."}[k];
  const md = gpDraftMd(k);
  return `<div class="segs cp-dtabs" role="group" aria-label="Drafts">${GP_DRAFTS.map(([v, nm]) => `<button type="button" data-gpdraft="${v}" aria-pressed="${v === k}">${nm}</button>`).join("")}</div>
    <p class="note cp-dnote">${intro} ${k === "rules" ? "" : "Text in brackets is for you to fill in."}</p>
    ${k === "rules" ? `<pre class="cp-draft gp-code">${esc(md)}</pre>` : `<div class="cp-draft">${cpMd(md)}</div>`}
    <div class="cp-dact"><button type="button" class="btn sm" data-gp="copyd">${icon("copy")}Copy</button>${DL ? `<button type="button" class="btn sm primary" data-gp="dld"><svg><use href="#i-download"/></svg>Download</button>` : ""}<span class="toast" id="gp-dtoast" role="status" aria-live="polite"></span></div>`;
}
function gpSgHTML(s){
  if(!s.reqs.length) return `<p class="note">Say who can use the product and what it allows to see which safeguards apply.</p>`;
  return GP_STAGES.map(st => ({st, rs:s.reqs.filter(r => r.st === st.k)})).filter(z => z.rs.length).map(({st, rs}) => `<section class="cp-rq"><h4>${esc(st.n)} <span class="note">${rs.filter(r => r.met).length} of ${rs.length}</span></h4>
      <ul class="tr-check">${rs.map(r => `<li class="${r.met ? "ok" : r.opt ? "na" : "miss"}"><span class="tr-st">${r.met ? "✓" : "○"}</span><div><b>${esc(r.t)}</b> <span class="gp-tag">${esc(r.tag)}</span>${r.met ? ` <span class="gp-tag ${r.ev === "assumed" ? "" : "gp-tag-ok"}">${esc(GP_EVN[r.ev])}</span>` : ""}${r.opt ? ` <span class="note">Optional</span>` : ""}<p>${esc(gpWhy(r, gp))}</p><p class="note"><b>How to check.</b> ${esc(r.chk)}</p><p class="note">${r.src.map(k => `<a href="${GP_SRC[k][1]}" target="_blank" rel="noopener">${esc(GP_SRC[k][0])}</a>`).join("; ")}</p></div></li>`).join("")}</ul></section>`).join("")
    + `<p class="note">Sources checked in ${GP_REVIEWED}. Not legal advice.</p>`;
}

/* ---------- tracker tasks ---------- */
function tkFromGrooming(){
  const s = gpScore(gp, gpCtx(gp));
  return s.gaps.map((r, i) => ({id:"gp-" + r.k, title:r.t, group:GP_SEVN[r.sev][0] === "Critical" ? "Critical" : GP_SEVN[r.sev][0] + " priority", owner:GP_OWNERS[r.o], pr:GP_SEV[r.sev] + 1, done:false, def:r.sev !== "med" || i < 12,
    labels:["trust-and-safety", "child-safety", "grooming-pathway"],
    desc:[r.t, "", gpWhy(r, gp), "", "What to do: " + r.how, `Stage: ${GP_STAGES.find(z => z.k === r.st).n}. Owner: ${GP_OWNERS[r.o]}. Effort: ${GP_EFF[r.e].toLowerCase()}.`, "Sources: " + r.src.map(k => GP_SRC[k][1]).join(" · "), "",
      `From a grooming pathway review of ${gp.svc || "your product"}, made with T&S Workbench. Not legal advice.`].join("\n")}))
    .concat(s.checks.map(r => ({id:"gp-check-" + r.k, title:`Check that it works: ${gpLow(r.t)}`, group:"Check it works", owner:GP_OWNERS[r.o], pr:r.sev === "crit" ? 3 : 2, done:false, def:r.sev !== "med",
      labels:["trust-and-safety", "child-safety", "grooming-pathway", "evidence"],
      desc:[`${r.t} is in place but nobody has checked it works.`, "", "How to check: " + r.chk, "", `Stage: ${GP_STAGES.find(z => z.k === r.st).n}. Owner: ${GP_OWNERS[r.o]}.`, "", `From a grooming pathway review of ${gp.svc || "your product"}, made with T&S Workbench.`].join("\n")})));
}

/* ---------- events ---------- */
function gpRerender(sel){ gp.ex = false; gpSave(); const y = window.scrollY; renderGrooming(); window.scrollTo(0, y); const el = sel && document.querySelector(sel); if(el) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
function gpAct(a){
  switch(a){
    case "example": gp = Object.assign(GP_BLANK(), JSON.parse(JSON.stringify(GP_EXAMPLE))); gdReset("grooming"); gpView = null; store.set("ws:cur:grooming", null); gpSave(); renderGrooming(); window.scrollTo(0, 0); return gsay("Example loaded: Pixelry, a photo and short-video app for teens and young adults");
    case "frompm": { const src = loopSource(); if(!src) return; gp = Object.assign(GP_BLANK(), gpFromPM(src)); gdReset("grooming"); gpView = "page"; store.set("ws:cur:grooming", null); gpSave(); renderGrooming(); window.scrollTo(0, 0); return gsay("Filled in from " + src.name + ". Check each answer"); }
    case "fromorg": { const o = orgGet(); gp = Object.assign(GP_BLANK(), {youth:o.youth, age:o.youth === "adult_verified" ? "verified" : ""}); gdReset("grooming"); gpView = null; store.set("ws:cur:grooming", null); gpSave(); renderGrooming(); gdGo(gdCur, "start"); return gsay("Audience filled in from your workspace profile"); }
    case "reset": { const snap = JSON.parse(JSON.stringify(gp)); gp = GP_BLANK(); gdReset("grooming"); gpView = null; store.set("ws:cur:grooming", null); gpSave(); renderGrooming(); window.scrollTo(0, 0); withUndo("Cleared", snap, s2 => { gp = s2; gpSave(); renderGrooming(); }); return focusQuiet(document.querySelector("#view h1")); }
    case "sharelink": { const s = gpScore(gp, gpCtx(gp)); return shareCopy("grooming", gp, {svc:gp.svc, youth:gp.youth, pct:s.pct, crit:s.crit}, $("#gp-toast")); }
    case "unshare": gp.shared = false; gpSave(); return gpAct("save");
    case "build": gp.view = "report"; gp.tab = "plan"; gp.at = Date.now(); gpSave(); renderGrooming(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "guide": gpView = null; gdReset("grooming"); renderGrooming(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "edit": gp.view = "setup"; gpView = "page"; gpSave(); renderGrooming(); window.scrollTo(0, 0); return focusQuiet(document.querySelector("#view h1"));
    case "save": { const msg = wsSaveTool("grooming", gp, gpTitle(gp)); renderGrooming(); return flashIn($("#gp-toast"), msg); }
    case "tasks": return tkOpen("grooming");
    case "brief": { const md = gpBriefMd(); return offerFile(`safe-defaults-brief-${slug(gp.svc || "product")}.md`, md, md, $("#gp-toast")); }
    case "copyd": return copyText(gpDraftMd(gp.draft || "brief"), $("#gp-dtoast"));
    case "dld": { const d = GP_DRAFTS.find(z => z[0] === (gp.draft || "brief")) || GP_DRAFTS[0], md = gpDraftMd(d[0]); return offerFile(`${d[2]}-${slug(gp.svc || "product")}.${d[0] === "rules" ? "py" : "md"}`, md, md, $("#gp-dtoast")); }
  }
}
const gpHere = () => hashNow().split("/")[0] === "grooming";
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-gp],[data-gpyouth],[data-gpage],[data-gptab],[data-gpdraft],[data-gpev]");
  if(!b || !gpHere() || !view.contains(b)) return;
  const d = b.dataset;
  if(d.gpev){ gp.ev = Object.assign({}, gp.ev, {[d.gpev]:d.v}); gp.ex = false; gpSave(); const y = window.scrollY; renderGrooming(); window.scrollTo(0, y); const t = document.querySelector(`[data-gpev="${d.gpev}"][data-v="${d.v}"]`); if(t) try{ t.focus({preventScroll:true}); }catch(e2){} return; }
  if(d.gpyouth){ gp.youth = d.gpyouth; if(d.gpyouth === "adult_verified") gp.age = "verified"; return gpRerender(`[data-gpyouth="${d.gpyouth}"]`); }
  if(d.gpage){ gp.age = d.gpage; return gpRerender(`[data-gpage="${d.gpage}"]`); }
  if(d.gptab){ gp.tab = d.gptab; gpSave(); renderGrooming(); const t = document.querySelector(`[data-gptab="${d.gptab}"]`); if(t) t.focus(); return; }
  if(d.gpdraft){ gp.draft = d.gpdraft; gpSave(); renderGrooming(); const t = document.querySelector(`[data-gpdraft="${d.gpdraft}"]`); if(t) t.focus(); return; }
  if(d.gp) gpAct(d.gp);
});
document.addEventListener("change", e => {
  const t = e.target; if(!t || !gpHere() || !view.contains(t) || !t.closest(".gp-root")) return;
  const d = t.dataset || {};
  if(d.gpset){ const k = d.gpset, v = t.value, cur = Array.isArray(gp[k]) ? gp[k] : []; gp[k] = t.checked ? [...new Set(cur.concat(v))] : cur.filter(z => z !== v); return gpRerender(`[data-gpset="${k}"][value="${v}"]`); }
});
document.addEventListener("input", e => { const t = e.target; if(t && t.id === "gp-svc" && gpHere()){ gp.svc = t.value.slice(0, 80); gp.ex = false; gpSave(); } });
// Plain-English terms the review uses, explained on hover. Existing entries win.
[["safe defaults", "The settings every account you believe belongs to a minor gets without anyone changing anything: private, undiscoverable by strangers, contact only from connections, location off."],
 ["off-platform", "A conversation moving from your product to another app, a phone number or a meeting, where you can no longer see it. The signal most worth acting on."],
 ["response ladder", "A response that builds as signals stack on one adult-to-minor contact: log, then friction, then restrict and review."],
 ["age assurance", "Any way of establishing how old a user is, from a typed birthday to an estimate to a verified ID. Each level should unlock a different amount."],
 ["metadata signals", "What a platform can see without reading a message: who contacted whom, how new the account is, how many first contacts it made, whether a gift or a link moved."]
].forEach(([k, v]) => { if(typeof GT_MORE !== "undefined" && !GT_MORE[k]) GT_MORE[k] = v; });
