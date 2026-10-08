/* =========================================================
   ABUSE PRE-MORTEM: PROFILE MODEL
   ========================================================= */
const PLATFORMS = [
  {k:"social", n:"Social network or community", h:"Feeds, followers, forums", f:["signup","login","profiles","dm","groups","posts","media","discovery","links"], m:[]},
  {k:"messaging", n:"Messaging and calling", h:"Chat apps, group chats, voice", f:["signup","login","profiles","dm","groups","voice","media","files","links"], m:[]},
  {k:"video", n:"Video and live streaming", h:"Short video, streaming, creators", f:["signup","login","profiles","posts","media","live","discovery","dm"], m:["payouts","wallet"]},
  {k:"creator", n:"Creator subscriptions", h:"Paid fan content, memberships, tips", f:["signup","login","profiles","posts","media","dm","live"], m:["subs","payouts"]},
  {k:"marketplace", n:"Marketplace or e-commerce", h:"Buy and sell, classifieds, resale", f:["signup","login","profiles","dm","media","listings","reviews","discovery"], m:["p2p","payouts"]},
  {k:"fintech", n:"Payments, banking or lending", h:"Wallets, P2P payments, neobanks, BNPL", f:["signup","login","profiles","referrals"], m:["p2p","wallet"]},
  {k:"crypto", n:"Crypto and digital assets", h:"Exchanges, wallets, NFTs", f:["signup","login","referrals","api"], m:["crypto","p2p","wallet"]},
  {k:"gaming", n:"Gaming and virtual worlds", h:"Multiplayer, metaverse, user-made games", f:["signup","login","profiles","dm","groups","voice"], m:["subs","wallet"]},
  {k:"dating", n:"Dating and relationships", h:"Dating, friend-finding, matchmaking", f:["signup","login","profiles","dm","media","location","meetups","discovery"], m:["subs"]},
  {k:"genai", n:"Generative AI or chatbot", h:"Assistants, image generators, AI companions", f:["signup","login","ai_gen","ai_chat"], m:["subs"]},
  {k:"gig", n:"Gig and on-demand services", h:"Rides, delivery, home services, freelancing", f:["signup","login","profiles","dm","location","meetups","reviews"], m:["p2p","payouts"]},
  {k:"rentals", n:"Travel, rentals and bookings", h:"Short-term rentals, experiences, tickets", f:["signup","login","profiles","dm","media","listings","reviews","location","meetups"], m:["p2p","payouts"]},
  {k:"edtech", n:"Education and learning", h:"Classrooms, tutoring, learning apps", f:["signup","login","profiles","dm","groups","posts","files","ai_chat"], m:[]},
  {k:"health", n:"Health and wellbeing", h:"Telehealth, mental health, peer support", f:["signup","login","profiles","groups","posts","dm","ai_chat"], m:["subs"]},
  {k:"workplace", n:"Workplace and collaboration", h:"Team chat, docs, B2B software", f:["signup","login","profiles","dm","groups","files","links","voice","api"], m:["subs"]}
];
const YOUTH = [
  {k:"kids", n:"Built for children", h:"Under-13s are a core audience"},
  {k:"teens", n:"Teens allowed", h:"Minimum age 13 to 16; teens and adults share the product"},
  {k:"adult_self", n:"Adults only, self-declared", h:"18+ in the terms but no age checks. Minors will still get in."},
  {k:"adult_verified", n:"Adults only, age-assured", h:"Age is verified or estimated before access"}
];
const AUD = [
  {k:"older", n:"Many older adults", h:"People over 65 are a significant share of users"},
  {k:"vulnerable", n:"People in vulnerable situations", h:"Health conditions, financial hardship, crisis or loneliness"},
  {k:"creators", n:"People earn money here", h:"Creators, sellers, hosts or workers rely on it for income"},
  {k:"business", n:"Business customers", h:"Organizations manage accounts for their people"}
];
const ADULT = [
  {k:"none", n:"Not allowed", h:"No nudity or sexual content"},
  {k:"nudity", n:"Some nudity allowed", h:"Art, education, breastfeeding, or behind a filter"},
  {k:"explicit", n:"Explicit content allowed", h:"Sexually explicit content is permitted or sold"}
];
const IDENTITY = [
  {k:"anon", n:"Anonymous", h:"No account details needed"},
  {k:"pseudo", n:"Pseudonymous", h:"A handle plus an email or phone number"},
  {k:"real", n:"Real name", h:"Real names expected but not checked"},
  {k:"verified", n:"Verified identity", h:"ID or KYC checks for everyone"}
];
const CONTACT = [
  {k:"strangers", n:"Anyone can contact anyone", h:"Users can find and message people they don't know"},
  {k:"limited", n:"Only after a connection", h:"A match, follow-back, invite or transaction comes first"},
  {k:"none", n:"No user-to-user contact", h:"People interact only with the product or with content"}
];
const MONEY = [
  {k:"subs", n:"Users pay you", h:"Subscriptions or purchases"},
  {k:"p2p", n:"Money moves between users", h:"Payments, transfers or marketplace sales"},
  {k:"payouts", n:"You pay users out", h:"Sellers, creators, hosts or workers get paid"},
  {k:"wallet", n:"Stored value or virtual currency", h:"Balances, gift cards, tokens or in-game items"},
  {k:"crypto", n:"Crypto assets", h:"Buying, holding or sending crypto"},
  {k:"credit", n:"Credit or lending", h:"Loans, buy now pay later, credit lines"}
];
const REGIONS = [
  {k:"us", n:"United States"}, {k:"eu", n:"European Union"}, {k:"uk", n:"United Kingdom"},
  {k:"au", n:"Australia"}, {k:"ca", n:"Canada"}, {k:"in", n:"India"}, {k:"br", n:"Brazil"}
];
const SCALE = [
  {k:"prelaunch", n:"Pre-launch", h:"No real users yet"},
  {k:"small", n:"Under 100k users", h:"Early traction"},
  {k:"mid", n:"100k to 10M users", h:"Growing fast"},
  {k:"large", n:"Over 10M users", h:"A target for organized abuse"}
];
const TEAM = [
  {k:"none", n:"No one yet", h:"Safety is nobody's job today"},
  {k:"parttime", n:"Part-time owner", h:"Someone covers safety alongside another role"},
  {k:"dedicated", n:"Dedicated team", h:"People working on T&S full time"},
  {k:"mature", n:"Mature T&S organization", h:"Policy, ops, engineering and legal support"}
];
const FEATURES = {
  signup:["Account sign-up","Anyone can create an account"],
  guest:["Guest access","Use without an account: guest checkout, chat or play"],
  login:["Login and account recovery","Passwords, codes, recovery flows"],
  profiles:["Profiles","Names, photos, bios visible to others"],
  dm:["Private messaging","One-to-one or small group chat"],
  groups:["Groups and communities","Spaces users create and run"],
  voice:["Voice and video calls","Real-time audio or video between users"],
  live:["Live streaming","Broadcasting to an audience in real time"],
  posts:["Public posts and comments","Feeds, replies, threads"],
  media:["Image and video uploads","Photos, clips, avatars"],
  files:["File sharing","Documents and attachments"],
  links:["External links","URLs to other sites"],
  discovery:["Search, feeds and recommendations","What the product surfaces to people"],
  ai_gen:["AI content generation","Text, image, video or voice generation"],
  ai_chat:["AI chat or companion","Ongoing conversations with an AI"],
  listings:["Listings","Goods, services, jobs or rentals"],
  reviews:["Ratings and reviews","Stars, testimonials, feedback"],
  referrals:["Referrals and promotions","Sign-up bonuses, rewards, promo codes"],
  ads:["Self-serve advertising","Anyone can buy ads"],
  location:["Location features","Maps, nearby, check-ins, live location"],
  meetups:["In-person meetings","Users meet, visit or serve each other face to face"],
  api:["Public API and bots","Developer access and automation"]
};
const FGROUPS = [
  ["Accounts",["signup","guest","login","profiles"]],
  ["Communication",["dm","groups","voice","live"]],
  ["Content",["posts","media","files","links","discovery"]],
  ["AI",["ai_gen","ai_chat"]],
  ["Commerce and growth",["listings","reviews","referrals","ads"]],
  ["Real world",["location","meetups"]],
  ["Platform",["api"]]
];
const OWNERS = {product:"Product", eng:"Engineering", ops:"T&S Ops", policy:"Policy", legal:"Legal & Compliance"};
const EFFORT = {S:"Small effort", M:"Medium effort", L:"Large effort"};
const CATS = {
  child:"Child safety", sexual:"Sexual exploitation", fraud:"Fraud and scams", fincrime:"Financial crime",
  security:"Account security", harass:"Harassment and hate", violent:"Violent and extremist content",
  selfharm:"Self-harm and wellbeing", privacy:"Privacy and surveillance", physical:"Physical safety",
  integrity:"Platform integrity", illegal:"Illegal and regulated goods", ai:"AI misuse", readiness:"Operational readiness"
};
/* Safeguards: t = text, o = owner, e = effort, lite = a starting point for small teams */
const SG = {
  report_btn:{t:"In-product reporting on every user, message, post and listing, with reasons that match your policies", o:"product", e:"S"},
  block_mute:{t:"Block and mute, where a block stops all contact and hides the person who blocked", o:"product", e:"S"},
  review_queue:{t:"A review queue with a named owner, response times by severity and an escalation path", o:"ops", e:"M", lite:"Start with a shared inbox and a severity triage rule; move to tooling as volume grows. Then a free option is ROOST's open-source Coop, a review console with queues, routing and appeals, if you have an engineer to host it."},
  policies:{t:"Written community guidelines that cover these harms, with examples of what crosses the line", o:"policy", e:"S"},
  appeals:{t:"Appeals for enforcement decisions, reviewed by someone other than the original reviewer", o:"ops", e:"M"},
  sor:{t:"Tell users which rule they broke, what action was taken and how to appeal", o:"product", e:"S"},
  notice_action:{t:"A notice channel for illegal-content reports from users, authorities and trusted flaggers", o:"legal", e:"S"},
  enforcement_log:{t:"Log every enforcement action (what, why, who, when) for audits and transparency reports", o:"eng", e:"M"},
  qa_program:{t:"Quality sampling of moderation decisions to catch errors and inconsistency", o:"ops", e:"M"},
  rate_limits:{t:"Rate limits on posting, messaging, invites and account actions, stricter for new accounts", o:"eng", e:"S"},
  new_account_limits:{t:"Limited abilities for new accounts until they build trust, such as no links or messages to strangers", o:"product", e:"S"},
  captcha:{t:"Bot friction at sign-up (e.g. Cloudflare Turnstile or reCAPTCHA) and blocking of disposable emails", o:"eng", e:"S"},
  phone_email_verify:{t:"Email or phone verification before posting, messaging or claiming rewards", o:"eng", e:"S"},
  device_signals:{t:"Device, network and behavior signals to link duplicate, banned and fake accounts", o:"eng", e:"M", lite:"Start with your fraud or bot-protection vendor's device fingerprinting."},
  text_screening:{t:"Automated screening of text for abuse, spam and scam patterns, routed to human review", o:"eng", e:"M", lite:"Start with keyword lists and an off-the-shelf moderation API. Later, an open model such as PolicyLM or gpt-oss-safeguard can check text against your own written policy. The models are free, but you run them on your own servers."},
  link_scanning:{t:"Check links against phishing and malware lists (e.g. Google Safe Browsing) before they are clickable", o:"eng", e:"S"},
  file_scanning:{t:"Malware scanning of uploaded files and blocking of executable file types", o:"eng", e:"S"},
  media_classifier:{t:"Nudity, violence and gore detection on uploads, with sensitive media behind a warning screen", o:"eng", e:"M", lite:"Start with an off-the-shelf image moderation API."},
  dm_nudity_blur:{t:"Blur explicit images in private messages by default, with a warning and one-tap reporting", o:"product", e:"M"},
  csam_hash:{t:"Hash-match every image and video against known CSAM (e.g. PhotoDNA, Thorn's Safer, NCMEC and IWF hash lists)", o:"eng", e:"M", lite:"PhotoDNA is free for qualifying services, and several vendors offer turnkey CSAM matching. Free option: ROOST's open-source Coop, which you host yourself, matches uploads against NCMEC's hash list through Meta's HMA and walks reviewers through CyberTip reports. Access to NCMEC's hashes comes from NCMEC, not Coop."},
  csam_reporting:{t:"A documented process to report apparent CSAM to NCMEC (US) and national authorities, preserving evidence", o:"legal", e:"M"},
  csam_review:{t:"A restricted escalation path for child-safety cases, handled by specially trained and supported reviewers", o:"ops", e:"M"},
  minor_contact:{t:"Adults can't find or message minors they aren't connected to, and minors' accounts are private by default", o:"product", e:"M"},
  age_assurance:{t:"Age assurance proportionate to the risk: age estimation or ID checks where the law or the harm requires it", o:"product", e:"L", lite:"Use an age-assurance vendor at the high-risk points (sign-up, going live, adult content) rather than everywhere."},
  teen_defaults:{t:"Age-appropriate defaults for under-18s: private account, limited discovery, sensitive content filtered, location off", o:"product", e:"M"},
  grooming_signals:{t:"Detection of grooming signals: adults contacting many minors, requests to move apps, gifts or money to minors", o:"eng", e:"L", lite:"Start with rules: adult accounts messaging many minors, and messages that mention other apps or ask for photos."},
  parental_consent:{t:"Verifiable parental consent before collecting personal data from under-13s", o:"legal", e:"M"},
  parental_tools:{t:"Parental controls and visibility suited to the age group", o:"product", e:"M"},
  no_minor_ads:{t:"No profiling-based advertising to minors", o:"product", e:"S"},
  data_minimization:{t:"Collect only the personal data the feature needs, with retention limits", o:"legal", e:"S"},
  design_review_minors:{t:"Review the design for manipulative patterns such as streaks, endless feeds, autoplay and pressure to spend", o:"product", e:"S"},
  spending_controls:{t:"Spending limits and purchase confirmations for minors, and odds disclosure for randomized items", o:"product", e:"M"},
  underage_removal:{t:"A way to report suspected under-age accounts and remove them", o:"ops", e:"S"},
  takeitdown:{t:"Point teens to NCMEC's Take It Down and adults to StopNCII.org, and hash-match those submissions", o:"eng", e:"M"},
  ncii_process:{t:"A fast-track removal process for intimate images shared without consent (48 hours under the US TAKE IT DOWN Act)", o:"ops", e:"M"},
  creator_verification:{t:"Verify the identity, age and consent of everyone who appears in sexual content before it is published", o:"legal", e:"L"},
  trafficking_training:{t:"Train reviewers on trafficking indicators and set up referral paths to law enforcement and NGOs", o:"ops", e:"M"},
  sextortion_signals:{t:"Detect sextortion patterns (new accounts requesting images, then payment demands) and warn targets", o:"eng", e:"L", lite:"Start by warning users when a new contact asks for images or money, and prioritize these reports."},
  scam_warnings:{t:"In-context warnings when someone asks for money, crypto, gift cards or to move off the platform", o:"product", e:"M"},
  scam_detection:{t:"Scam-pattern detection across messages and profiles: scripts, reused photos, payment requests", o:"eng", e:"L", lite:"Start with keyword rules for payment requests and reverse-image checks on reported profiles."},
  support_messaging:{t:"Tell users what your staff will never ask for, and label official accounts", o:"product", e:"S"},
  impersonation_flow:{t:"An impersonation report flow, verified badges and protected names for notable accounts and your brand", o:"product", e:"M"},
  payout_holds:{t:"Payout holds and velocity limits for new sellers, creators, hosts and payees", o:"product", e:"M"},
  escrow_protection:{t:"Buyer protection: funds released after delivery, with a clear dispute process", o:"product", e:"L", lite:"Use your payment provider's delayed-capture and dispute tools."},
  seller_verification:{t:"Verify high-volume sellers' identity, business and bank details", o:"legal", e:"M"},
  listing_screening:{t:"Screen listings for prohibited, counterfeit and misleading items when they go live", o:"eng", e:"M"},
  payment_risk:{t:"Payment risk scoring, strong customer authentication (3-D Secure) and chargeback monitoring", o:"eng", e:"M", lite:"Turn on your payment processor's built-in fraud screening."},
  promo_caps:{t:"Cap rewards per person, device and payment method, and release them after a delay", o:"product", e:"S"},
  confirmation_payee:{t:"Name checks on new payees, warnings for first-time and large transfers, and cooling-off periods", o:"product", e:"M"},
  mfa:{t:"Multi-factor authentication, with stronger options than SMS for high-value accounts", o:"eng", e:"M"},
  breached_pw:{t:"Block breached passwords and detect credential-stuffing attacks", o:"eng", e:"S"},
  account_recovery:{t:"Hardened account recovery, with alerts for new devices and changes to email, phone or payout details", o:"eng", e:"M"},
  review_integrity:{t:"Only verified customers can review, with detection of review bursts, swaps and linked reviewers", o:"eng", e:"M"},
  review_policy:{t:"A review-moderation policy that never suppresses genuine negative reviews", o:"policy", e:"S"},
  kyc:{t:"Identity verification (KYC) before money can be sent, received or paid out", o:"legal", e:"L", lite:"Use a licensed banking or payments partner and their KYC vendor."},
  aml_monitoring:{t:"Transaction monitoring for laundering and mule patterns, with suspicious activity reporting", o:"legal", e:"L"},
  sanctions:{t:"Sanctions screening of users and counterparties (e.g. OFAC, EU and UK lists) plus geo-restrictions", o:"legal", e:"M"},
  mule_detection:{t:"Detect money-mule behavior: funds passing straight through, many unrelated senders, recruitment messages", o:"eng", e:"L"},
  vulnerable_customers:{t:"A vulnerable-customer policy for spotting signs of financial difficulty or coercion and adjusting treatment", o:"policy", e:"M"},
  affordability:{t:"Affordability and suitability checks before credit or high-risk products", o:"legal", e:"M"},
  comment_controls:{t:"Controls for people to limit who can reply to, tag, mention or message them", o:"product", e:"M"},
  pii_policy:{t:"A private-information policy with fast removal of doxxing, and detection of posted addresses and phone numbers", o:"policy", e:"S"},
  threat_escalation:{t:"An escalation path for credible threats, including emergency disclosure to law enforcement", o:"legal", e:"M"},
  terror_hash:{t:"Hash-sharing for terrorist content (e.g. GIFCT) and a crisis protocol for live attacks", o:"eng", e:"M"},
  tco_removal:{t:"Ability to remove terrorist content within one hour of an EU removal order", o:"ops", e:"M"},
  live_controls:{t:"Eligibility rules for going live, instant stream shutdown and 24/7 on-call coverage", o:"ops", e:"M"},
  crisis_resources:{t:"Crisis resources and helplines shown when self-harm content, searches or messages are detected", o:"product", e:"S"},
  search_interventions:{t:"Block or add warning screens to searches linked to self-harm, eating disorders, child abuse and extremism", o:"product", e:"S"},
  rec_safety:{t:"Keep borderline and sensitive content out of recommendations, especially for teens", o:"eng", e:"M"},
  crisis_escalation:{t:"A protocol for imminent-risk cases, including referral to emergency services", o:"ops", e:"M"},
  trend_monitoring:{t:"Monitoring for emerging harmful trends and challenges", o:"ops", e:"M"},
  health_info:{t:"Authoritative health information and a clear medical-misinformation policy", o:"policy", e:"M"},
  gen_filters:{t:"Input and output filters for disallowed generations: sexual content involving minors, real-person sexual imagery, weapons", o:"eng", e:"L", lite:"Start with your model provider's safety settings and moderation endpoint, plus a blocklist."},
  gen_training_data:{t:"Screen training and fine-tuning data for CSAM and non-consensual imagery", o:"eng", e:"M"},
  gen_provenance:{t:"Label AI-generated media and attach provenance data (e.g. C2PA content credentials)", o:"eng", e:"M"},
  gen_redteam:{t:"Red-team before launch and after each model update, and track the jailbreak success rate", o:"ops", e:"M"},
  likeness_policy:{t:"Block sexual or deceptive generations of real, identifiable people", o:"policy", e:"S"},
  ai_disclosure:{t:"Clearly and repeatedly tell users they are talking to an AI", o:"product", e:"S"},
  companion_safeguards:{t:"Detect crisis signals in conversations, route people to help, and block romantic or sexual roleplay with minors", o:"eng", e:"L"},
  tool_permissions:{t:"Limit what AI agents and tools can do, and keep untrusted content separate from instructions", o:"eng", e:"M"},
  ai_abuse_monitoring:{t:"Monitor for abuse patterns and act against accounts, not just single prompts", o:"ops", e:"M"},
  approx_location:{t:"Approximate location by default; precise location is opt-in, time-limited and never shown to strangers", o:"product", e:"M"},
  exif_strip:{t:"Strip GPS and device metadata from uploaded photos", o:"eng", e:"S"},
  anti_scraping:{t:"Anti-scraping controls: rate limits, bot detection and limits on bulk profile access", o:"eng", e:"M"},
  api_governance:{t:"API access review, keys, quotas and developer terms you actually enforce", o:"eng", e:"M"},
  access_controls:{t:"Least-privilege access to user data and review tools, with audit logs", o:"eng", e:"M"},
  camera_policy:{t:"Rules requiring hosts to disclose any cameras, with fast reporting for guests", o:"policy", e:"S"},
  provider_verification:{t:"Identity verification for people offering in-person services, plus background checks where lawful", o:"legal", e:"L", lite:"Use an identity-verification vendor; add background checks for the highest-risk roles first."},
  reverify:{t:"Periodic selfie re-verification to stop accounts being shared or rented", o:"eng", e:"M"},
  safety_features:{t:"In-app safety tools: share trip or date details, an emergency button, check-ins", o:"product", e:"L", lite:"Start with share-my-details and a prominent link to emergency help."},
  offline_incidents:{t:"A response process for offline harm, with victim support and law-enforcement liaison", o:"ops", e:"M"},
  two_way_ratings:{t:"Two-way ratings, and removal of users who put others at risk", o:"product", e:"M"},
  anti_discrimination:{t:"An anti-discrimination policy, with testing of algorithms and of host or provider decisions", o:"policy", e:"M"},
  cib_detection:{t:"Detection of coordinated networks of fake or controlled accounts", o:"eng", e:"L"},
  election_plan:{t:"An elections integrity plan, with verification for political ads and a misinformation policy", o:"policy", e:"M"},
  ad_review:{t:"Advertiser verification and ad review for scams, prohibited categories and discriminatory targeting", o:"ops", e:"M"},
  ip_takedown:{t:"Notice-and-takedown for copyright and trademark (e.g. DMCA), with a repeat-infringer policy", o:"legal", e:"S"},
  prohibited_policy:{t:"A prohibited goods and services policy, with keyword and image screening", o:"policy", e:"S"},
  safety_owner:{t:"One named owner for safety, plus an on-call rotation for urgent escalations", o:"ops", e:"S"},
  le_process:{t:"A law-enforcement request process: published guidelines, emergency disclosure and data preservation", o:"legal", e:"M"},
  guest_limits:{t:"Limit what guests can do: no private messaging, uploads, live or payouts until they create an account", o:"product", e:"S"},
  guest_signals:{t:"Session, device and network signals to rate-limit and block abusive guests, since there is no account to ban", o:"eng", e:"M"},
  guest_evidence:{t:"Keep guest session records long enough to investigate reports and answer law-enforcement requests", o:"legal", e:"S"},
  moderator_wellness:{t:"Moderator wellness: exposure caps, blurred or grayscale review tools and counseling", o:"ops", e:"M"}
};
const PRESETS = {
  teen_social:{name:"Teen social app (example)", type:"social", youth:"teens", aud:[], adult:"none", identity:"pseudo", contact:"strangers", money:[], regions:["us","eu","uk","au"], scale:"mid", team:"parttime", features:["signup","login","profiles","dm","groups","posts","media","live","discovery","links"]},
  p2p:{name:"P2P payments app (example)", type:"fintech", youth:"adult_verified", aud:["older"], adult:"none", identity:"verified", contact:"limited", money:["p2p","wallet"], regions:["us","uk"], scale:"small", team:"dedicated", features:["signup","login","profiles","referrals"]},
  marketplace:{name:"Resale marketplace (example)", type:"marketplace", youth:"adult_self", aud:["creators"], adult:"none", identity:"pseudo", contact:"strangers", money:["p2p","payouts"], regions:["us","eu"], scale:"mid", team:"dedicated", features:["signup","login","profiles","dm","media","listings","reviews","discovery"]},
  kids_game:{name:"Kids' multiplayer game (example)", type:"gaming", youth:"kids", aud:[], adult:"none", identity:"pseudo", contact:"limited", money:["subs","wallet"], regions:["us","uk","eu"], scale:"small", team:"parttime", features:["signup","guest","login","profiles","dm","groups","voice"]},
  ai_companion:{name:"AI companion app (example)", type:"genai", youth:"adult_self", aud:["vulnerable"], adult:"nudity", identity:"pseudo", contact:"none", money:["subs"], regions:["us","eu"], scale:"small", team:"none", features:["signup","login","ai_chat","ai_gen","media"]},
  dating:{name:"Dating app (example)", type:"dating", youth:"adult_self", aud:[], adult:"none", identity:"real", contact:"limited", money:["subs"], regions:["us","uk","eu","au"], scale:"mid", team:"dedicated", features:["signup","login","profiles","dm","media","voice","location","meetups","discovery"]},
  delivery:{name:"Delivery platform (example)", type:"gig", youth:"adult_verified", aud:["creators"], adult:"none", identity:"verified", contact:"limited", money:["p2p","payouts"], regions:["us","ca"], scale:"large", team:"mature", features:["signup","login","profiles","dm","location","meetups","reviews","referrals"]},
  creator:{name:"Creator subscription site (example)", type:"creator", youth:"adult_verified", aud:["creators"], adult:"explicit", identity:"verified", contact:"strangers", money:["subs","payouts","p2p"], regions:["us","uk","eu"], scale:"mid", team:"dedicated", features:["signup","login","profiles","dm","posts","media","live","discovery"]}
};

/* =========================================================
   SHARED: letter grades, undo-able resets, shareable result links
   ========================================================= */
// A-F from a 0-100 value. Used wherever a report has (or can honestly derive) a score.
function gradeOf(pct){
  const p = Math.round(pct);
  return p >= 90 ? "A" : p >= 75 ? "B" : p >= 60 ? "C" : p >= 45 ? "D" : "F";
}
function gradeBadge(pct, title){
  if(pct === null || pct === undefined || isNaN(pct)) return "";
  const g = gradeOf(pct);
  return `<span class="grade grade-${g}" title="${esc(title || "")}">${g}</span>`;
}

// Toast with an Undo action, shared by every "Start over" handler.
// label: what happened. snapshot: a deep copy taken before clearing. restore(snapshot): puts it back.
function withUndo(label, snapshot, restore){
  let el = document.getElementById("wb-undo");
  if(!el){
    el = document.createElement("div");
    el.id = "wb-undo"; el.className = "wb-undo";
    el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  clearTimeout(el._t);
  el.innerHTML = `<span>${esc(label)}</span><button type="button" data-wb-undo>Undo</button>`;
  el.classList.add("show");
  el.querySelector("[data-wb-undo]").onclick = () => {
    el.classList.remove("show"); clearTimeout(el._t);
    restore(snapshot);
  };
  el._t = setTimeout(() => el.classList.remove("show"), 8000);
}

// ---------- Shareable result links: #<route>?s=<base64url of deflated JSON> ----------
function b64urlEncode(bytes){
  let bin = ""; for(let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str){
  str = str.replace(/-/g, "+").replace(/_/g, "/"); while(str.length % 4) str += "=";
  const bin = atob(str), bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
async function shareEncode(obj){
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  try{
    if(typeof CompressionStream === "function"){
      const cs = new CompressionStream("deflate-raw"), w = cs.writable.getWriter();
      w.write(bytes); w.close();
      const buf = await new Response(cs.readable).arrayBuffer();
      return b64urlEncode(new Uint8Array(buf));
    }
  }catch(e){}
  return b64urlEncode(bytes);
}
async function shareDecode(s){
  const bytes = b64urlDecode(s);
  if(typeof DecompressionStream === "function"){
    try{
      const ds = new DecompressionStream("deflate-raw"), w = ds.writable.getWriter();
      w.write(bytes); w.close();
      const buf = await new Response(ds.readable).arrayBuffer();
      return JSON.parse(new TextDecoder().decode(buf));
    }catch(e){}
  }
  try{ return JSON.parse(new TextDecoder().decode(bytes)); }catch(e){ return null; }
}
// Copies a link that carries `state`. If it would be too big (roughly 8KB), carries `summary` instead and says so.
function shareCopy(route, state, summary, toastEl){
  shareEncode(state).then(s => {
    if(s.length > 8000 && summary) return shareEncode(summary).then(s2 => ({s:s2, big:true}));
    return {s, big:false};
  }).then(({s, big}) => {
    const url = location.origin + location.pathname + "#" + route + "?s=" + s;
    const say = msg => flashIn(toastEl, msg);
    try{
      navigator.clipboard.writeText(url).then(
        () => say(big ? "Link copied — only the summary numbers fit, not every answer" : "Link copied"),
        () => say("Copy was blocked in this view"));
    }catch(e){ say("Copy was blocked in this view"); }
  }).catch(() => flashIn(toastEl, "Could not build a link in this view"));
}
// Each report tool registers how to apply shared data into its own state.
const SHARE_APPLY = {};
function shareRegister(route, apply){ SHARE_APPLY[route] = apply; }
// The hash's "?s=" part, read straight off location.hash so the router can strip it before normal routing.
function shareParseHash(){
  const h = (location.hash || "").slice(1), qi = h.indexOf("?s=");
  return qi < 0 ? null : {route: h.slice(0, qi), s: h.slice(qi + 3)};
}
function shareBannerHTML(saveAttr){
  return `<div class="card share-banner" role="note"><div><b>You're viewing a shared result.</b><span class="note">Save a copy to edit it.</span></div><button type="button" class="btn primary sm" ${saveAttr}>Save a copy</button></div>`;
}
