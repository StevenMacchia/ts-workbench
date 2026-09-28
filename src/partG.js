/* =========================================================
   INCIDENT TABLETOP
   ========================================================= */
const DIMS = [{k:'safety',n:'User safety'},{k:'trust',n:'Public trust'},{k:'reg',n:'Regulatory standing'},{k:'team',n:'Team capacity'}];
const SCENARIOS = [
{ id:'challenge', title:'The breath-hold challenge', platform:'Short-video app, large teen audience', severity:'Sev 1',
  blurb:'A dangerous "challenge" is spreading fast on a Friday evening. Contain it without wrecking your weekend team or silencing the people warning against it.',
  steps:[
    { t:'Fri 18:40', h:'On-call flags a fast-growing trend',
      s:'On-call reviewers have seen 40 videos in two hours showing teens holding their breath until they nearly pass out. The hashtag is growing about 300% an hour. A news site abroad has reported a hospitalization linked to it. Your dangerous-acts policy covers this, but nobody has formally classified the trend.',
      o:[
        {l:'Restrict the hashtag and related searches now, add a safety interstitial, and start a targeted content sweep.', r:'Distribution drops within the hour. A few creators complain that their search results changed.', d:{safety:15,trust:5,reg:5,team:-10}, best:true},
        {l:'Log it for Monday\'s policy review. The policy question should be settled before you act.', r:'The hashtag triples over the weekend. By Monday it is trending in three countries.', d:{safety:-20,trust:-10,reg:-10,team:5}},
        {l:'Remove every video using the hashtag, including news reports and parents\' warnings.', r:'Reach falls, but journalists and parent groups say they were silenced. Appeals start piling up.', d:{safety:10,trust:-10,reg:0,team:-15}}
      ], lesson:'Contain distribution first (search, hashtags, recommendations), then refine enforcement. Protect counter-speech and news coverage. Over-removal creates a second incident.'},
    { t:'Fri 21:30', h:'Volume is outrunning your reviewers',
      s:'About 12,000 related uploads are waiting. Your overnight shift can handle about 2,000. A near-duplicate matcher could be ready in 45 minutes. The graphic-violence and child-safety queues are also staffed tonight.',
      o:[
        {l:'Deploy near-duplicate matching to auto-action clear copies. Prioritize everything else for human review by reach.', r:'The highest-reach videos are reviewed first. QA later finds about 3% false positives, which are restored on appeal.', d:{safety:10,trust:-3,reg:5,team:10}, best:true},
        {l:'Move reviewers off the other queues, including child safety, so every video gets a human look.', r:'The trend queue clears, but child-safety SLAs are missed overnight. That will come up in your next audit.', d:{safety:-5,trust:0,reg:-10,team:-15}},
        {l:'Remove the videos from recommendations and wait until Monday to review them.', r:'Discovery slows, but the videos still spread through shares and direct links.', d:{safety:5,trust:0,reg:0,team:5}}
      ], lesson:'Prioritize by potential reach, not by arrival order. Never pull staff from your highest-severity queues to cover a louder incident.'},
    { t:'Sat 12:10', h:'Press and parents are asking questions',
      s:'A national reporter wants comment by 15:00. A large parents\' group has tagged your company in a thread that is going viral. Your Comms lead is on a flight.',
      o:[
        {l:'With Legal and a Comms backup, send a short factual statement: what you\'re seeing, what you\'ve done, and resources for parents.', r:'The story quotes your statement and links to your parent resources. The thread calms down.', d:{safety:5,trust:15,reg:5,team:-3}, best:true},
        {l:'Say "no comment" until the investigation is finished.', r:'The headline reads "Platform silent as dangerous trend spreads".', d:{safety:0,trust:-15,reg:-5,team:0}},
        {l:'Publish detailed removal numbers and explain exactly how your detection works.', r:'People like the transparency. By Sunday, uploaders are altering their videos to evade the matcher.', d:{safety:-5,trust:5,reg:0,team:-5}}
      ], lesson:'Say quickly what you know and what you\'re doing. Share outcomes, not detection methods, while the trend is still active.'},
    { t:'Mon 09:00', h:'The trend is fading',
      s:'Uploads have dropped 85% from their peak. Your team is exhausted. Executives want to know whether this will happen again.',
      o:[
        {l:'Hold a blameless post-incident review covering detection time, gaps and false positives. Add the trend to monitoring and brief executives with numbers.', r:'You leave with three concrete fixes, including a trend watchlist, and a team that feels heard.', d:{safety:8,trust:5,reg:8,team:5}, best:true},
        {l:'Lift the restrictions and return to normal work.', r:'Two weeks later a variant appears under a new hashtag, and you start from scratch.', d:{safety:-10,trust:0,reg:-5,team:5}},
        {l:'Leave every emergency measure in place permanently to be safe.', r:'Unrelated breath-work and freediving creators keep getting suppressed. Complaints continue.', d:{safety:3,trust:-8,reg:0,team:-5}}
      ], lesson:'Emergency measures need an end date and a review. The post-incident review is what makes the next incident smaller.'}
  ]},
{ id:'rfi', title:'The regulator\'s request', platform:'EU-regulated social platform', severity:'Sev 2',
  blurb:'An EU regulator asks how your recommender exposes minors to eating-disorder content. You have ten working days, and your data has gaps.',
  steps:[
    { t:'Day 0', h:'A formal request for information arrives',
      s:'The regulator is asking how your recommendation systems affect teen users\' exposure to eating-disorder content, what risk assessment you did, and which mitigations are in place. The deadline is ten working days. Legal forwarded it to you with the note "thoughts?"',
      o:[
        {l:'Set up a cross-functional response team (Legal, Policy, Data Science, Product) with one owner, and map every question to a data source.', r:'By day 1 you know which questions you can answer and which ones you can\'t.', d:{safety:0,trust:0,reg:15,team:-5}, best:true},
        {l:'Leave it to Legal and offer to help if they ask.', r:'On day 7 Legal asks for "all the data" and the scramble begins.', d:{safety:0,trust:0,reg:-10,team:5}},
        {l:'Request an extension right away, before scoping the work.', r:'The regulator asks why you need one. You can\'t say yet.', d:{safety:0,trust:0,reg:-5,team:0}}
      ], lesson:'A regulator\'s request is a T&S data problem that Legal packages. Assign one owner and map every question to a source on day 0.'},
    { t:'Day 3', h:'The data doesn\'t look good',
      s:'Data Science reports that your last prevalence measurement for eating-disorder content is 14 months old. Your teen-age signals are also known to miss a large share of under-18 users.',
      o:[
        {l:'Disclose the limitations, provide the best available data with its methodology, and commit to a dated plan to fix it.', r:'Regulators ask follow-up questions, but they treat you as a credible partner.', d:{safety:5,trust:5,reg:10,team:-3}, best:true},
        {l:'Report only the metrics that look good and leave the gaps out.', r:'A later audit finds the gap. Your credibility is gone, and your fine exposure rises sharply.', d:{safety:-5,trust:-10,reg:-25,team:0}},
        {l:'Rush a new prevalence study using a small sample in four days.', r:'You get numbers, but the confidence intervals are wide and the team works through the weekend.', d:{safety:0,trust:0,reg:0,team:-12}}
      ], lesson:'Regulators forgive known gaps with a remediation plan far more readily than figures that later turn out to be misleading.'},
    { t:'Day 6', h:'Product pushes back on the fix',
      s:'Your proposed fix is to stop recommending weight-loss content to teen accounts by default. The Product lead objects because modeling shows a 2% drop in teen session time.',
      o:[
        {l:'Escalate with a risk case: estimated harm, regulatory exposure and fine ceiling. Propose a staged rollout with a guardrail metric.', r:'Your VP backs a staged launch. The mitigation goes in the submission as live.', d:{safety:10,trust:3,reg:10,team:-5}, best:true},
        {l:'Drop the fix to keep the peace.', r:'Your submission has no mitigations, which is exactly what the regulator was checking for.', d:{safety:-15,trust:0,reg:-12,team:3}},
        {l:'Ship it yourself using T&S ranking controls, without Product sign-off.', r:'It works, but Product rolls it back in an unrelated release and trust between the teams collapses.', d:{safety:5,trust:0,reg:3,team:-10}}
      ], lesson:'Directors win these arguments by making risk as concrete as the engagement cost, and by offering a staged path rather than an all-or-nothing choice.'},
    { t:'Day 10', h:'Submission day',
      s:'The response is drafted. Leadership wants to know what happens next.',
      o:[
        {l:'Submit an honest risk assessment and a dated mitigation roadmap, and track the commitments internally like an OKR.', r:'Six months later the follow-up request is short, because you hit your dates.', d:{safety:5,trust:3,reg:12,team:0}, best:true},
        {l:'Submit and consider the matter closed.', r:'The follow-up asks about commitments nobody tracked.', d:{safety:-3,trust:0,reg:-10,team:3}},
        {l:'Publish a blog post announcing the new teen protections before you submit.', r:'The press coverage is good. The regulator reads it as an attempt to get ahead of the process.', d:{safety:0,trust:5,reg:-8,team:0}}
      ], lesson:'Treat commitments to regulators as roadmap items with owners and dates. The follow-up request will test them.'}
  ]},
{ id:'vip', title:'The special-treatment leak', platform:'Large social network', severity:'Sev 2',
  blurb:'A journalist has screenshots suggesting high-profile accounts get slower, softer enforcement. They want comment within 24 hours.',
  steps:[
    { t:'Hour 0', h:'A journalist has your internal screenshots',
      s:'The screenshots show violations by a celebrity account sent to a "sensitive accounts" queue and left up for weeks, while ordinary users were removed within hours for similar posts. The deadline is 24 hours.',
      o:[
        {l:'Verify the facts first: pull the case histories and queue data, and bring in Comms and Legal.', r:'Within six hours you know exactly what happened and how bad it is.', d:{safety:0,trust:5,reg:5,team:-5}, best:true},
        {l:'Tell Comms the program doesn\'t exist.', r:'It does exist. The follow-up story is about the denial.', d:{safety:0,trust:-25,reg:-10,team:0}},
        {l:'Remove the celebrity\'s posts immediately to get ahead of the story.', r:'The journalist now reports that you enforce reactively when caught.', d:{safety:3,trust:-8,reg:0,team:0}}
      ], lesson:'In the first hours, the only job is establishing the facts. Anything you say before you know them becomes the next story.'},
    { t:'Hour 6', h:'What the review found',
      s:'Three of the five posts did violate policy. The sensitive-accounts queue has a median time to action of 19 days, compared with 9 hours for the standard queue. It has no owner and no SLA.',
      o:[
        {l:'Act on the three violations under standard policy now, and acknowledge the SLA gap internally.', r:'The account gets the same strike anyone else would. Your team sees the rules applied evenly.', d:{safety:8,trust:8,reg:5,team:0}, best:true},
        {l:'Leave it. High-profile accounts need extra care.', r:'The published story shows the posts are still up.', d:{safety:-5,trust:-15,reg:-5,team:0}},
        {l:'Ban the account permanently to show you are serious.', r:'Your penalty rules called for a strike. You are now accused of overcorrecting.', d:{safety:3,trust:-5,reg:0,team:-3}}
      ], lesson:'Consistency means the same penalty rules for everyone, not the harshest action for whoever is in the news.'},
    { t:'Hour 20', h:'The public statement',
      s:'Comms needs your input on the statement.',
      o:[
        {l:'Acknowledge the gap. Explain why extra review exists (to prevent errors on high-reach accounts) and commit to matching SLAs and outside oversight.', r:'The story runs with your commitment in the third paragraph, and the reaction is mixed but manageable.', d:{safety:0,trust:12,reg:5,team:0}, best:true},
        {l:'Say a single moderator made a mistake.', r:'Screenshots show it was systemic. Your moderators see you blame one of them.', d:{safety:0,trust:-12,reg:-3,team:-20}},
        {l:'Decline to comment.', r:'The piece runs unchallenged.', d:{safety:0,trust:-12,reg:-3,team:0}}
      ], lesson:'Explain why the process exists, own where it failed, and never make a front-line employee the explanation for a systemic gap.'},
    { t:'Week 2', h:'Fixing the system',
      s:'Leadership asks you for a permanent fix.',
      o:[
        {l:'Keep the extra review but within the standard SLA, log every override, and report the volumes in your transparency report.', r:'The process now protects against errors without being a way around the rules.', d:{safety:5,trust:10,reg:10,team:-3}, best:true},
        {l:'Remove all special handling for high-profile accounts.', r:'A month later, a wrong takedown on a head of state\'s account becomes its own incident.', d:{safety:-5,trust:0,reg:0,team:0}},
        {l:'Rename the queue and tighten access.', r:'The next leak includes the rename.', d:{safety:0,trust:-12,reg:-5,team:0}}
      ], lesson:'Extra review for high-reach accounts is defensible. An exemption from the rules is not. The difference is SLAs, logging and transparency.'}
  ]}
];
let tt = store.get('tt', null);
const scoreColor = v => v >= 65 ? 'var(--good)' : v >= 40 ? 'var(--high)' : 'var(--crit)';
const clamp = v => Math.max(0, Math.min(100, v));
const freshTT = s => ({s, step:0, scores:{safety:60,trust:60,reg:60,team:60}, picks:[], answered:false});

function renderTabletop(){
  const H = t => head('Incident Tabletop', t, 'Run the program');
  if(!tt){
    view.innerHTML = H('Rehearse a crisis before it happens. Pick a scenario and make four decisions as it unfolds. Each choice moves safety, trust, regulatory standing and team capacity, and the debrief shows what strong incident command looks like.') + `
      <div class="scen-grid">${SCENARIOS.map((s,i)=>`
        <button class="card scen" data-i="${i}">
          <div class="row"><span class="pill crit"><span class="dot"></span>${s.severity}</span><span class="pill">${esc(s.platform)}</span></div>
          <h3>${esc(s.title)}</h3><p>${esc(s.blurb)}</p>
          <span class="note">4 decisions · about 8 minutes</span>
        </button>`).join('')}</div>`;
    $$('.scen').forEach(b => b.onclick = () => { tt = freshTT(+b.dataset.i); store.set('tt', tt); renderTabletop(); });
    return;
  }
  const sc = SCENARIOS[tt.s];
  const meters = `<aside class="card meters" aria-label="Incident scorecard">
      <span class="eyebrow">${esc(sc.title)}</span>
      <div class="progress">${sc.steps.map((_,i)=>`<span class="${i < tt.picks.length ? 'done':''}"></span>`).join('')}</div>
      ${DIMS.map(d=>`<div class="meter"><div class="top"><span>${d.n}</span><span class="mono">${tt.scores[d.k]}</span></div><div class="bar"><i style="width:${tt.scores[d.k]}%;background:${scoreColor(tt.scores[d.k])}"></i></div></div>`).join('')}
      <button class="btn sm" id="tt-quit">Choose another scenario</button>
    </aside>`;
  if(tt.step >= sc.steps.length){
    const best = tt.picks.filter((p,i)=>sc.steps[i].o[p].best).length;
    const avg = Math.round(DIMS.reduce((a,d)=>a+tt.scores[d.k],0)/DIMS.length);
    const v = best === 4 ? ['Textbook incident command','good'] : best >= 2 ? ['Solid, with gaps to rehearse','high'] : ['This team needs a playbook','crit'];
    view.innerHTML = H('How your calls compare with strong practice. Use it in a team retro or as interview prep.') + `
      <div class="play"><div>
        <div class="card verdict"><span class="pill ${v[1]}" style="justify-self:start">${best} of 4 strongest calls</span><h3>${v[0]}</h3>
          <p class="muted">Average across the four dimensions: <span class="mono">${avg}</span>/100. The strongest calls usually cost some team capacity up front and pay it back in trust and regulatory standing.</p></div>
        <div class="debrief">${sc.steps.map((st,i)=>{ const p = st.o[tt.picks[i]], b = st.o.find(o=>o.best);
          return `<div class="card dcard">
            <div class="row"><span class="mono muted" style="font-size:12.5px">${esc(st.t)}</span><strong>${esc(st.h)}</strong>${p.best?'<span class="pill good">Strong call</span>':'<span class="pill high">Alternative</span>'}</div>
            <p><span class="eyebrow">You chose</span><br>${esc(p.l)}</p>
            ${p.best?'':`<p><span class="eyebrow">Stronger call</span><br>${esc(b.l)}</p>`}
            <p class="muted"><strong style="color:var(--ink)">Lesson.</strong> ${esc(st.lesson)}</p></div>`;}).join('')}</div>
        <div class="row" style="margin-top:16px"><button class="btn primary" id="tt-replay">Replay this scenario</button><button class="btn" id="tt-other">Try another scenario</button></div>
      </div>${meters}</div>`;
    $('#tt-replay').onclick = () => { tt = freshTT(tt.s); store.set('tt',tt); renderTabletop(); };
    $('#tt-other').onclick = $('#tt-quit').onclick = () => { tt = null; store.set('tt', null); renderTabletop(); };
    return;
  }
  const st = sc.steps[tt.step];
  const picked = tt.answered ? tt.picks[tt.step] : null;
  view.innerHTML = H(`${esc(sc.platform)}. Decision ${tt.step+1} of ${sc.steps.length}.`) + `
    <div class="play">
      <div class="card inject">
        <div class="clock"><span class="t">${esc(st.t)}</span><span class="pill crit"><span class="dot"></span>${sc.severity}</span><span class="note">${esc(sc.title)}</span></div>
        <h3>${esc(st.h)}</h3><p class="sit">${esc(st.s)}</p>
        <div class="opts" role="group" aria-label="Your options">${st.o.map((o,i)=>`
          <button class="opt ${picked===i?'picked':''} ${picked!==null&&picked!==i?'dim':''}" data-i="${i}" ${picked!==null?'disabled':''}><span class="k">${'ABC'[i]}</span><span>${esc(o.l)}</span></button>`).join('')}</div>
        ${picked!==null ? `<div class="outcome" aria-live="polite"><span class="eyebrow">What happens</span><p>${esc(st.o[picked].r)}</p>
            <div class="row" style="gap:6px">${DIMS.map(d=>{const x=st.o[picked].d[d.k]; return x ? `<span class="pill ${x>0?'good':'crit'}">${d.n} <span class="mono">${x>0?'+':''}${x}</span></span>` : '';}).join('')}</div></div>
          <div class="row" style="margin-top:14px"><button class="btn primary" id="tt-next">${tt.step+1 < sc.steps.length ? 'Next update' : 'See debrief'}${icon('arrow')}</button></div>` : ''}
      </div>${meters}
    </div>`;
  $$('.opt').forEach(b => b.onclick = () => { const i = +b.dataset.i, d = st.o[i].d;
    DIMS.forEach(x => tt.scores[x.k] = clamp(tt.scores[x.k] + (d[x.k]||0)));
    tt.picks[tt.step] = i; tt.answered = true; store.set('tt', tt); renderTabletop(); });
  const nx = $('#tt-next'); if(nx) nx.onclick = () => { tt.step++; tt.answered = false; store.set('tt', tt); renderTabletop(); };
  $('#tt-quit').onclick = () => { tt = null; store.set('tt', null); renderTabletop(); };
}

/* =========================================================
   METRICS FRAMEWORK
   ========================================================= */
const LAYERS = [
  {k:'outcome', n:'Harm outcomes', d:'What users actually experience'},
  {k:'detect', n:'Detection', d:'How well you find harm'},
  {k:'quality', n:'Decision quality', d:'Whether your calls are right and consistent'},
  {k:'ops', n:'Operations', d:'Speed, throughput and cost'},
  {k:'people', n:'People', d:'The sustainability of your team'},
  {k:'comp', n:'Compliance', d:'What regulators will ask for'}
];
const TIER = {ns:['North star','accent'], health:['Health','good'], diag:['Diagnostic','']};
const METRICS = [
  {n:'Violating-content prevalence', l:'outcome', t:'ns', st:1, p:'all', d:'Share of content views that violate policy, from a statistically valid random sample of impressions.', w:'Measures exposure: what users actually see, not how busy your team is.', trap:'Too-small samples swing month to month. Publish confidence intervals.'},
  {n:'Harmful reach before action', l:'outcome', t:'health', st:2, p:['social','gaming'], d:'Views a violating item gets before it is actioned (p50 / p90).', w:'Links speed to harm. A fast removal of a viral post matters more than a fast removal of an unseen one.', trap:'A handful of viral items dominate. Report the tail, not the mean.'},
  {n:'Fraud loss rate', l:'outcome', t:'ns', st:1, p:['market'], d:'Fraud losses (chargebacks, reimbursements, buyer-protection payouts) in basis points of GMV.', w:'The number Finance already watches. It puts T&S in the P&L conversation.', trap:'It lags by weeks because of chargeback windows. Pair it with a leading signal.'},
  {n:'Prohibited-listing prevalence', l:'outcome', t:'health', st:2, p:['market'], d:'Share of live listings that are counterfeit, prohibited or misrepresented, by category.', w:'Shows where buyers are most exposed.', trap:'Varies heavily by category. A blended number hides your worst category.'},
  {n:'Toxicity per 1,000 match-hours', l:'outcome', t:'ns', st:1, p:['gaming'], d:'Confirmed toxic incidents (text and voice) per 1,000 hours of play.', w:'Normalizes for engagement growth, so a busy launch week doesn\'t look like a spike.', trap:'Voice is under-reported. Measure it separately if you can.'},
  {n:'Churn after toxic exposure', l:'outcome', t:'diag', st:3, p:['gaming','social','dating'], d:'Retention gap between users who experienced a confirmed incident and matched users who didn\'t.', w:'The most persuasive metric for executives: safety is retention.', trap:'This is correlation. Use matched cohorts before you claim causation.'},
  {n:'Violating-generation rate', l:'outcome', t:'ns', st:1, p:['genai'], d:'Share of outputs that violate policy, measured on a fixed red-team suite plus a sample of production traffic.', w:'The core safety measure for a generative product.', trap:'Fixed suites get stale. Refresh them quarterly or the model overfits to them.'},
  {n:'Over-refusal rate', l:'quality', t:'health', st:1, p:['genai'], d:'Share of clearly benign prompts that the model refuses or heavily hedges.', w:'The counterweight to safety. Over-refusal is also a harm to users and to the product.', trap:'Tracking only the violation rate pushes teams toward refusing everything.'},
  {n:'Jailbreak success rate', l:'detect', t:'health', st:2, p:['genai'], d:'Share of known adversarial techniques that get policy-violating output, by technique family.', w:'Tracks how robust the model is as attacks evolve.', trap:'It only covers attacks you already know about. Pair it with external red-teaming.'},
  {n:'Romance-scam reports per 10k matches', l:'outcome', t:'ns', st:1, p:['dating'], d:'Confirmed scam reports normalized by match volume.', w:'Scams are the defining harm on dating platforms, and the losses are severe.', trap:'Victims under-report out of embarrassment. Add a proactive-detection view.'},
  {n:'Verified-profile share', l:'detect', t:'health', st:2, p:['dating','market'], d:'Share of active profiles or sellers that passed identity or liveness checks.', w:'A leading indicator for fraud and impersonation.', trap:'Verification is not good behavior. Verified bad actors exist.'},
  {n:'User-report rate', l:'outcome', t:'diag', st:1, p:'all', d:'User reports per 1,000 daily active users, by policy area.', w:'Cheap and fast to compute. A useful early-warning signal.', trap:'It rises when reporting gets easier. That can mean better UX, not more harm.'},
  {n:'Repeat-offender rate', l:'outcome', t:'diag', st:2, p:'all', d:'Share of enforcement actions against accounts with a prior violation within 90 days.', w:'Tests whether your penalty ladder actually changes behavior.', trap:'Ban evasion hides repeat offenders behind new accounts.'},
  {n:'Proactive detection rate', l:'detect', t:'health', st:1, p:'all', d:'Share of actioned violations found by your systems before any user reported them.', w:'Shows how much harm you catch instead of waiting for victims to report it.', trap:'It can rise simply because you over-enforce. Always read it with precision.'},
  {n:'Precision and recall by policy area', l:'detect', t:'health', st:2, p:'all', d:'For each classifier and rule: how many of its actions were correct, and how much violating content it caught.', w:'Tells you where automation is safe to expand and where it isn\'t.', trap:'A blended figure hides failures in low-volume, high-severity areas.'},
  {n:'Time to detect emerging trends', l:'detect', t:'diag', st:3, p:'all', d:'Time from a new harmful trend\'s first appearance to its formal triage.', w:'Crises are usually won or lost in this window.', trap:'Hard to measure without post-incident reviews. Log it in every one.'},
  {n:'Appeal overturn rate', l:'quality', t:'health', st:1, p:'all', d:'Share of appealed decisions that are reversed, by policy area and enforcement source.', w:'The clearest public signal of over-enforcement.', trap:'Few users appeal. A low rate with low appeal volume can hide errors.'},
  {n:'QA agreement rate', l:'quality', t:'health', st:1, p:'all', d:'Agreement between front-line decisions and expert re-review on a random sample.', w:'Your ground truth for reviewer and vendor quality.', trap:'Experts also disagree. Measure expert-to-expert agreement first.'},
  {n:'Consistency across languages and markets', l:'quality', t:'diag', st:3, p:'all', d:'QA agreement and overturn rates broken out by language and region.', w:'Enforcement gaps usually show up in languages with the fewest resources first.', trap:'Small markets have tiny samples. Pool data by quarter.'},
  {n:'Time to action by severity (p90)', l:'ops', t:'health', st:1, p:'all', d:'Time from report or detection to decision, split by severity tier, reported at p50 and p90.', w:'Shows whether the most urgent harms are handled fastest.', trap:'Averages hide the long tail. The p90 is where incidents come from.'},
  {n:'SLA attainment', l:'ops', t:'health', st:1, p:'all', d:'Share of items decided within the target time for their tier.', w:'The operational commitment you report upward.', trap:'Teams hit SLAs by rushing. Watch QA agreement at the same time.'},
  {n:'Backlog age', l:'ops', t:'diag', st:2, p:'all', d:'Age distribution of unreviewed items by queue.', w:'Your early warning for a capacity problem.', trap:'Queue size alone misleads. One old severe item outweighs many new minor ones.'},
  {n:'Cost per decision', l:'ops', t:'diag', st:2, p:'all', d:'Fully loaded review cost divided by decisions, by queue and vendor.', w:'Needed to defend budget and compare vendors.', trap:'Optimizing it alone lowers quality. Always show it next to QA agreement.'},
  {n:'Graphic-exposure hours per reviewer', l:'people', t:'health', st:1, p:'all', d:'Hours per reviewer per week spent on graphic or egregious content queues.', w:'The most direct wellness risk you control.', trap:'Averages hide individuals. Cap and monitor each person.'},
  {n:'Attrition and wellness-support usage', l:'people', t:'diag', st:2, p:'all', d:'Reviewer attrition rate plus uptake of counseling and wellness programs.', w:'Attrition destroys expertise and QA scores, and it is expensive.', trap:'Low support uptake can mean stigma, not good health. Ask anonymously.'},
  {n:'Statement-of-reasons coverage', l:'comp', t:'health', st:1, p:'all', reg:true, d:'Share of restrictive actions that come with a compliant explanation to the user.', w:'A core obligation under the EU Digital Services Act and a common audit finding.', trap:'Templated reasons that don\'t name the specific policy don\'t count.'},
  {n:'Illegal-content notice handling time', l:'comp', t:'health', st:1, p:'all', reg:true, d:'Time from a legal notice (for example a trusted flagger or authority) to decision.', w:'Regulators expect prompt, prioritized handling.', trap:'Trusted-flagger notices need their own queue and SLA.'},
  {n:'Systemic-risk assessment currency', l:'comp', t:'diag', st:2, p:'all', reg:true, d:'Months since each required risk assessment was last updated, with the status of each mitigation.', w:'Regulators test whether your mitigations are real and tracked.', trap:'Assessments written once for compliance go stale within a year.'}
];
const VANITY = [
  ['Total items removed','It rises with volume and with over-enforcement, and says nothing about what users experience.'],
  ['Number of reports received','It measures how easy reporting is as much as how much harm exists.'],
  ['Automation rate on its own','"80% automated" means nothing without precision. It can mean 80% wrong at scale.'],
  ['Moderator headcount','Input, not outcome. Executives will ask why it keeps growing.'],
  ['Accounts banned','Easy to inflate with throwaway spam accounts, and it rewards churning through bad actors instead of deterring them.']
];
const MX_PLATFORMS = {social:'Social / user-generated content', market:'Marketplace', gaming:'Gaming', dating:'Dating', genai:'Generative AI product'};
let mx = store.get('mx', {platform:'social', stage:'2', reg:true});

function renderMetrics(){
  const list = METRICS.filter(m => m.st <= +mx.stage && (m.p === 'all' || m.p.includes(mx.platform)) && (!m.reg || mx.reg));
  const counts = {ns:0,health:0,diag:0}; list.forEach(m=>counts[m.t]++);
  view.innerHTML = head('Metrics Framework',
    'Build the scorecard you\'d bring to an executive review, tailored to your platform and maturity. North-star metrics lead the first slide, health metrics are reviewed monthly, and diagnostics stay with your team.',
    'Run the program', `<button class="btn sm primary" id="mx-copy">${icon('copy')}Copy as text</button>`) + `
    <div class="card controls">
      <div class="field"><label for="mx-platform">Platform</label>
        <select class="select" id="mx-platform">${Object.entries(MX_PLATFORMS).map(([k,v])=>`<option value="${k}" ${mx.platform===k?'selected':''}>${v}</option>`).join('')}</select></div>
      <div class="field"><label for="mx-stage">Program stage</label>
        <select class="select" id="mx-stage">
          <option value="1" ${mx.stage==='1'?'selected':''}>Early: first T&amp;S hires</option>
          <option value="2" ${mx.stage==='2'?'selected':''}>Scaling: vendors, classifiers</option>
          <option value="3" ${mx.stage==='3'?'selected':''}>Mature: multi-market, audited</option>
        </select></div>
      <div class="field"><span class="lbl">Regulation</span>
        <label class="switch" style="padding:7px 10px"><input type="checkbox" id="mx-reg" ${mx.reg?'checked':''}><span class="tr"></span><span><b>EU DSA or UK Online Safety Act applies</b></span></label></div>
    </div>
    <div class="summary">
      <strong><span class="mono">${list.length}</span> metrics</strong>
      <span class="pill accent">${counts.ns} north star</span><span class="pill good">${counts.health} health</span><span class="pill">${counts.diag} diagnostic</span>
      <span class="toast" id="mx-toast" aria-live="polite"></span>
    </div>
    ${LAYERS.map(L=>{
      const ms = list.filter(m=>m.l===L.k).sort((a,b)=>['ns','health','diag'].indexOf(a.t)-['ns','health','diag'].indexOf(b.t));
      if(!ms.length) return '';
      return `<div class="layer"><div class="layer-h"><h3>${L.n}</h3><span class="note">${L.d}</span></div>
        <div class="mgrid">${ms.map(m=>`<article class="card metric ${m.t==='ns'?'ns':''}">
          <div class="mh"><h4>${esc(m.n)}</h4><span class="pill ${TIER[m.t][1]}">${TIER[m.t][0]}</span></div>
          <p class="d">${esc(m.d)}</p><p class="w"><strong style="color:var(--ink);font-weight:600">Why it matters.</strong> ${esc(m.w)}</p>
          <p class="trap"><strong>Trap.</strong> ${esc(m.trap)}</p></article>`).join('')}</div></div>`;}).join('')}
    <div class="card vanity"><h3>Vanity metrics to keep off the exec slide</h3>
      <ul>${VANITY.map(v=>`<li><strong>${esc(v[0])}.</strong> ${esc(v[1])}</li>`).join('')}</ul></div>`;
  const save = () => { store.set('mx', mx); renderMetrics(); };
  $('#mx-platform').onchange = e => { mx.platform = e.target.value; save(); };
  $('#mx-stage').onchange = e => { mx.stage = e.target.value; save(); };
  $('#mx-reg').onchange = e => { mx.reg = e.target.checked; save(); };
  $('#mx-copy').onclick = () => {
    const txt = [`T&S metrics framework: ${MX_PLATFORMS[mx.platform]}, stage ${mx.stage}${mx.reg?', regulated':''}`, ''].concat(
      LAYERS.flatMap(L=>{ const ms=list.filter(m=>m.l===L.k); if(!ms.length) return [];
        return [L.n.toUpperCase()].concat(ms.map(m=>`- [${TIER[m.t][0]}] ${m.n}: ${m.d}`), ['']); })).join('\n');
    copyText(txt, $('#mx-toast'));
  };
}

/* =========================================================
   VENDOR SCORECARD
   ========================================================= */
const CRITERIA = [
  {k:'quality', n:'Decision quality', h:'Accuracy against your QA', w:20, q:['What QA agreement rate do you achieve on comparable policies, and who measures it?','Will you run a paid pilot on our data with blind QA?','How do you calibrate reviewers when our policy changes?']},
  {k:'wellness', n:'Reviewer wellness', h:'Exposure limits, care, pay', w:15, deal:true, q:['What is the maximum daily exposure to graphic content per moderator?','Is licensed counseling available, including after someone leaves?','What was annual attrition for T&S staff last year?','Do you use content blurring and grayscale tooling by default?']},
  {k:'lang', n:'Language and market coverage', h:'Native speakers, cultural context', w:15, q:['Which of our languages do you cover with native speakers, not translation?','How do you handle regional dialects and slang?','Where are reviewers located for each market?']},
  {k:'surge', n:'Surge capacity', h:'Scaling up during incidents', w:10, q:['How fast can you add 30% capacity, and how is it trained?','What happened in your last surge event?','Do you offer follow-the-sun coverage?']},
  {k:'security', n:'Security and privacy', h:'Data access, certifications', w:15, deal:true, q:['Do you hold SOC 2 Type II or ISO 27001 certification?','Do reviewers work on managed devices or in clean rooms?','How is access to personal data logged and audited?','How do you handle legally restricted content such as CSAM referrals?']},
  {k:'cost', n:'Cost', h:'Fully loaded cost per decision', w:10, q:['What is the price per decision or per hour, and what is excluded?','How are pilot, training and ramp time billed?','Are there minimum volume commitments?']},
  {k:'tooling', n:'Tooling and integration', h:'Works with your review stack', w:5, q:['Can you work in our review tool, or do you require your own?','Can you share decision data back to us via API?']},
  {k:'reporting', n:'Reporting transparency', h:'Visibility into performance', w:10, q:['What dashboards do we get, and how often?','Will you share raw QA samples, not just summaries?','How are quality misses escalated to us?']}
];
const DEFAULT_V = {
  weights: Object.fromEntries(CRITERIA.map(c=>[c.k,c.w])),
  vendors:[
    {name:'Vendor A', s:{quality:3,wellness:2,lang:5,surge:5,security:4,cost:4,tooling:3,reporting:3}},
    {name:'Vendor B', s:{quality:5,wellness:4,lang:3,surge:3,security:4,cost:2,tooling:4,reporting:5}},
    {name:'Vendor C', s:{quality:4,wellness:4,lang:4,surge:2,security:3,cost:4,tooling:3,reporting:3}}
  ], open:null
};
let vx = store.get('vx', null) || JSON.parse(JSON.stringify(DEFAULT_V));
function vendorScore(v){
  const tw = CRITERIA.reduce((a,c)=>a+(+vx.weights[c.k]||0),0) || 1;
  return CRITERIA.reduce((a,c)=>a+(+vx.weights[c.k]||0)*(v.s[c.k]||0),0)/tw;
}
function renderVendors(){
  const tw = CRITERIA.reduce((a,c)=>a+(+vx.weights[c.k]||0),0);
  const scored = vx.vendors.map((v,i)=>({i, v, score:vendorScore(v), flags:CRITERIA.filter(c=>c.deal && v.s[c.k]<=2)}));
  const eligible = scored.filter(x=>!x.flags.length).sort((a,b)=>b.score-a.score);
  const topI = eligible.length ? eligible[0].i : -1;
  view.innerHTML = head('Vendor Scorecard',
    'Weight what matters to your program, score each moderation vendor from 1 to 5, and get a ranked result. A score of 2 or lower on wellness or security rules a vendor out whatever the total. Open a criterion to see the questions to ask in an RFP.',
    'Run the program', `<button class="btn sm" id="vx-reset">Reset to example data</button>`) + `
    <div class="results" style="margin:0 0 16px">${scored.slice().sort((a,b)=>b.score-a.score).map(x=>`
      <div class="card vres ${x.i===topI?'top':''}">
        <div class="row" style="justify-content:space-between"><strong>${esc(x.v.name)}</strong>${x.i===topI?'<span class="pill accent">Recommended</span>':x.flags.length?'<span class="pill crit">Dealbreaker</span>':''}</div>
        <div><span class="score">${x.score.toFixed(2)}</span> <span class="muted">/ 5</span></div>
        <div class="bar"><i style="width:${x.score/5*100}%;background:${x.flags.length?'var(--crit)':'var(--accent)'}"></i></div>
        ${x.flags.length?`<p style="font-size:13px;color:var(--crit)">Fails the minimum on ${x.flags.map(f=>f.n.toLowerCase()).join(' and ')}.</p>`:`<p class="note">Strongest on ${CRITERIA.slice().sort((a,b)=>x.v.s[b.k]-x.v.s[a.k])[0].n.toLowerCase()}; weakest on ${CRITERIA.slice().sort((a,b)=>x.v.s[a.k]-x.v.s[b.k])[0].n.toLowerCase()}.</p>`}
      </div>`).join('')}</div>
    <div class="card table-wrap">
      <table>
        <thead><tr><th>Criterion</th><th style="text-align:right">Weight</th>${vx.vendors.map((v,i)=>`<th><input class="vname" id="vn-${i}" data-i="${i}" value="${esc(v.name)}" aria-label="Vendor ${i+1} name"></th>`).join('')}</tr></thead>
        <tbody>${CRITERIA.map(c=>`
          <tr>
            <td class="crit-name">${esc(c.n)}${c.deal?' <span class="pill crit" style="font-size:11px">Minimum 3</span>':''}<small>${esc(c.h)} · <button class="qbtn" data-k="${c.k}">${vx.open===c.k?'Hide':'Show'} RFP questions</button></small></td>
            <td style="text-align:right"><input class="w mono" type="number" min="0" max="100" id="w-${c.k}" data-k="${c.k}" value="${vx.weights[c.k]}" aria-label="${esc(c.n)} weight"></td>
            ${vx.vendors.map((v,i)=>`<td><select class="s ${c.deal&&v.s[c.k]<=2?'lo':''}" id="s-${i}-${c.k}" data-i="${i}" data-k="${c.k}" aria-label="${esc(v.name)}: ${esc(c.n)}">${[1,2,3,4,5].map(n=>`<option ${v.s[c.k]===n?'selected':''}>${n}</option>`).join('')}</select></td>`).join('')}
          </tr>
          ${vx.open===c.k?`<tr class="qrow"><td colspan="${2+vx.vendors.length}"><ul>${c.q.map(q=>`<li>${esc(q)}</li>`).join('')}</ul></td></tr>`:''}`).join('')}
        </tbody>
        <tfoot><tr><td>Weighted score</td><td style="text-align:right" class="mono" ${tw!==100?'style="color:var(--high)"':''}>${tw}</td>${scored.map(x=>`<td class="mono">${x.score.toFixed(2)}</td>`).join('')}</tr></tfoot>
      </table>
    </div>
    ${tw!==100?`<p class="note" style="margin-top:10px">Weights add up to ${tw}, not 100. Scores are normalized either way, but a total of 100 makes the tradeoffs easier to explain.</p>`:''}
    <p class="note" style="margin-top:10px">The example vendors are placeholders. Rename them and score your own shortlist.</p>`;
  const save = () => store.set('vx', vx);
  $$('input.vname').forEach(inp => inp.onchange = e => { vx.vendors[+e.target.dataset.i].name = e.target.value || 'Vendor'; save(); renderVendors(); });
  $$('input.w').forEach(inp => inp.onchange = e => { vx.weights[e.target.dataset.k] = Math.max(0, Math.min(100, +e.target.value||0)); save(); renderVendors(); });
  $$('select.s').forEach(s => s.onchange = e => { vx.vendors[+e.target.dataset.i].s[e.target.dataset.k] = +e.target.value; save(); renderVendors(); });
  $$('.qbtn').forEach(b => b.onclick = () => { vx.open = vx.open===b.dataset.k ? null : b.dataset.k; save(); renderVendors(); });
  $('#vx-reset').onclick = () => { vx = JSON.parse(JSON.stringify(DEFAULT_V)); save(); renderVendors(); };
}

