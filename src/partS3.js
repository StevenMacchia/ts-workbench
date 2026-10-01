/* ---------- Universal scenarios, tailored to each company type ---------- */
// Text uses {placeholders}; each company type supplies its own values in `vars`.
const ALL_TYPES = ["social","marketplace","fintech","gaming","dating","genai","gig","kids"];
function ttFill(str, v){ return typeof str === "string" ? str.replace(/\{(\w+)\}/g, (m, k) => v[k] !== undefined ? v[k] : m) : str; }
// Each company type gets its own title, blurb and step scenes (TT_VERSIONS, partS11.js); the decisions, consequences, lessons and law notes are shared.
function ttScenario(i, type){
  const sc = SCENARIOS[i];
  if(!sc || !sc.vars) return sc;
  const v = sc.vars[type] || sc.vars.all, ver = (typeof TT_VERSIONS !== "undefined" && TT_VERSIONS[sc.id] && TT_VERSIONS[sc.id][type]) || null;
  return Object.assign({}, sc, {title:ttFill(ver && ver.title || sc.title, v), platform:ttFill(sc.platform, v), blurb:ttFill(ver && ver.blurb || sc.blurb, v),
    steps: sc.steps.map((st, n) => Object.assign({}, st, {h:ttFill(st.h, v), s:ttFill(ver && ver.scenes && ver.scenes[n] || st.s, v), lesson:ttFill(st.lesson, v), law:ttFill(st.law, v),
      o: st.o.map(o => Object.assign({}, o, {l:ttFill(o.l, v), r:ttFill(o.r, v)}))}))});
}
NEW_SCENARIOS.push(
{ id:"ato", types:ALL_TYPES, tailored:true, title:"The account takeover wave", platform:"{platform}", severity:"Sev 2",
  blurb:"Attackers use leaked passwords to break into {asset}. Their goal: {harm}.",
  vars:{
    all:{platform:"Any consumer platform", users:"users", asset:"user accounts", harm:"stealing whatever the accounts hold"},
    social:{platform:"Social network", users:"creators", asset:"creator accounts with large followings", harm:"posting crypto scams to millions of followers"},
    marketplace:{platform:"Online marketplace", users:"sellers", asset:"seller accounts", harm:"switching payout details to attackers' bank accounts"},
    fintech:{platform:"Payments app", users:"customers", asset:"customer accounts", harm:"draining balances through instant transfers"},
    gaming:{platform:"Online game", users:"players", asset:"player accounts", harm:"stripping rare items and currency to resell"},
    dating:{platform:"Dating app", users:"members", asset:"member profiles", harm:"using private photos and chats for sextortion"},
    genai:{platform:"AI developer platform", users:"developers", asset:"developer accounts and API keys", harm:"running abuse at scale on stolen API keys"},
    gig:{platform:"Rides and delivery platform", users:"drivers and couriers", asset:"driver accounts", harm:"redirecting earnings to attackers' bank accounts"},
    kids:{platform:"Kids' learning platform", users:"families", asset:"family and child accounts", harm:"getting access to children's profiles and messages"}
  },
  steps:[
    { t:"Mon 06:40", h:"Login failures spike",
      s:"Overnight, failed logins jumped 40-fold, and 3,000 {users} say they were locked out or saw activity they didn't recognize. Attackers are trying passwords leaked from other sites, aiming at {harm}.",
      o:[ op("Force password resets only for accounts that report problems.", "Attackers keep getting into accounts whose owners haven't noticed yet.", [-10,-5,-5,3]),
          op("Block the attacking traffic, lock accounts with suspicious logins, and force resets with multi-factor authentication on affected {asset}.", "The attack slows within the hour, and most affected accounts are secured by lunchtime.", [12,5,5,-5], true),
          op("Take login offline for everyone until the attack stops.", "The attack stops, and so does your whole service for six hours.", [5,-12,0,-5]) ],
      lesson:"Contain credential stuffing at the edge and lock only what's at risk. Taking everyone offline turns an attack into an outage." },
    { t:"Mon 11:00", h:"The damage is done",
      s:"About 1,100 {asset} were taken over before the block. Victims want their accounts back, and what was taken.",
      o:[ op("Restore any account whose owner emails support.", "Attackers email support too, and take over the same accounts again.", [-10,0,-3,-3]),
          op("Tell victims account security is their responsibility.", "Victims post their stories and the press picks them up.", [0,-15,-5,0]),
          op("Restore accounts after proper identity checks, reverse what can be reversed, and give victims a clear timeline.", "Most victims are restored within 48 hours, with one point of contact.", [10,10,5,-8], true) ],
      lesson:"Account recovery is where attackers strike twice. Verify identity before restoring, and communicate timelines clearly." },
    { t:"Tue 09:00", h:"Do you have to tell anyone?",
      s:"Legal asks whether this counts as a personal data breach. Attackers could see names, contact details and account history for affected {users}.",
      o:[ op("Assess it against breach-notification rules with Legal, notify regulators where required, and tell affected {users} what happened and what to do.", "Notifications go out on time, and regulators note the prompt response.", [5,8,12,-3], true),
          op("Say nothing: attackers used real passwords, so it wasn't your breach.", "Regulators disagree when a complaint arrives, and the silence becomes the story.", [0,-10,-12,0]),
          op("Announce a major breach publicly before you know the scope.", "Panic spreads, and you later have to correct the numbers.", [0,-8,-3,-3]) ],
      lesson:"Credential stuffing can still be a notifiable breach. Assess it quickly against the rules where you operate." },
    { t:"Week 2", h:"Making it harder next time",
      s:"Leadership asks what will stop this happening again.",
      o:[ op("Require stronger passwords.", "Attackers use leaked passwords that meet the new rules.", [0,0,0,0]),
          op("Make multi-factor authentication mandatory for everyone overnight.", "Takeovers drop, and so does daily use as people get locked out.", [8,-8,0,-5]),
          op("Check for breached passwords, ask for extra proof when a login looks risky, alert people when contact or payout details change, and delay sensitive changes after a new login.", "The next attack, a month later, results in almost no takeovers.", [12,5,5,-3], true) ],
      lesson:"Defend in layers: block breached passwords, step up checks when risk is high, and slow down sensitive changes." }
  ]},
{ id:"insider", types:ALL_TYPES, tailored:true, title:"The insider lookup", platform:"{platform}", severity:"Sev 2",
  blurb:"A contractor on your review team has been looking up {data} for people who were never in a review queue.",
  vars:{
    all:{platform:"Any platform with user data", users:"users", data:"private user data", victim:"someone the contractor knows personally"},
    social:{platform:"Social network", users:"users", data:"private messages and location history", victim:"the contractor's ex-partner"},
    marketplace:{platform:"Online marketplace", users:"buyers and sellers", data:"buyers' home addresses and order history", victim:"the contractor's neighbor"},
    fintech:{platform:"Digital bank", users:"customers", data:"transaction histories and balances", victim:"the contractor's ex-partner"},
    gaming:{platform:"Online game", users:"players", data:"players' real names, emails and voice chat recordings", victim:"a well-known streamer"},
    dating:{platform:"Dating app", users:"members", data:"private messages, photos and sexual orientation", victim:"the contractor's ex-partner"},
    genai:{platform:"AI assistant", users:"users", data:"users' private conversations with the AI", victim:"a local politician"},
    gig:{platform:"Rides and delivery platform", users:"customers", data:"customers' home addresses and trip histories", victim:"the contractor's ex-partner"},
    kids:{platform:"Kids' learning platform", users:"children and parents", data:"children's names, schools and messages", victim:"a child in the contractor's neighborhood"}
  },
  steps:[
    { t:"Wed 14:00", h:"A tip from inside",
      s:"A support agent reports that a contractor on your review team has been looking up {data} for people who were never in a review queue, apparently including {victim}.",
      o:[ op("Ask the contractor's manager to have a word.", "The contractor clears their history and keeps looking up records for two more days.", [-10,-5,-8,0]),
          op("Cut the contractor's access immediately, preserve the access logs, and investigate with Legal and Security.", "Access is cut within minutes, and the logs show exactly what was viewed.", [12,5,8,-3], true),
          op("Fire the contractor and close the matter.", "The lookups stop, but you still don't know what was taken or who was affected.", [5,-3,-5,0]) ],
      lesson:"Cut access first and preserve evidence. You can't assess the harm without knowing exactly what was viewed." },
    { t:"Thu 10:00", h:"The logs tell a story",
      s:"The logs show 214 {users} were looked up over six months, including {victim}. There's no sign data left your systems, but screenshots can't be ruled out.",
      o:[ op("Contact {victim} first, with safety support, then notify all 214 affected {users} and regulators where required.", "The person most at risk gets support quickly, and notifications meet legal deadlines.", [12,8,10,-5], true),
          op("Notify only if you can prove data left your systems.", "It surfaces months later in a court case, and your silence becomes the headline.", [-5,-12,-10,0]),
          op("Send a generic security email to every user.", "Affected people don't realize they were targeted, and everyone else is alarmed.", [0,-8,-3,-3]) ],
      lesson:"Prioritize anyone who may be in physical danger, then notify everyone affected. Personal lookups are a safety issue, not only a privacy one." },
    { t:"Fri 09:00", h:"How was this possible?",
      s:"Your review tools let any agent search any user by name, and nobody reviews access logs.",
      o:[ op("Keep broad access, but make agents sign a policy.", "The same thing happens next quarter.", [-5,-3,-5,3]),
          op("Remove review-tool access for all contractors.", "Queues back up for weeks, and harmful content stays up longer.", [0,-5,0,-12]),
          op("Limit each agent to the cases in their queue, require a reason for any other lookup, and review access logs automatically.", "Lookups outside the queue drop to almost zero, and every exception is justified.", [10,5,8,-3], true) ],
      lesson:"Least-privilege access and audited lookups protect users from the people you trust with their data." },
    { t:"Week 3", h:"The vendor question",
      s:"The contractor worked for your moderation vendor, and the contract has no audit rights.",
      o:[ op("Add security requirements, audit rights and breach-notification duties to the contract, and audit the vendor this quarter.", "The vendor agrees, and the audit finds two more gaps to fix.", [8,5,10,-3], true),
          op("Switch vendors immediately.", "The new vendor needs months to ramp up, and review quality drops.", [-5,-3,0,-10]),
          op("Accept the vendor's assurance that it won't happen again.", "Regulators ask how you verified that. You have nothing to show.", [0,-3,-8,3]) ],
      lesson:"You're accountable for your vendors' access to your users' data. Get audit rights before something goes wrong." }
  ]}
);
