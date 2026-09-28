// Runs a team tabletop from setup to debrief: roles, timer, the team's picks, notes, actions, report and tracker tasks, without a browser.
const fs = require("fs"), path = require("path");
const D = path.dirname(__filename), rd = f => fs.readFileSync(path.join(D, f), "utf8");
const v9 = rd("test-v9.js"), s0 = v9.indexOf("const stub = `") + 14, stub = v9.slice(s0, v9.indexOf("`;", s0));
const body = function(){
  const out = [], bad = h => /undefined|NaN|\[object|null/.test(h), eq = (a, b, msg) => { if(a !== b) throw new Error(msg + ": got " + a + ", want " + b); };
  const where = h => (h.match(/.{60}(undefined|NaN|null).{30}/) || [""])[0];
  document.body = {classList:{contains(){ return false; }, toggle(){}, remove(){}}}; document.querySelector = () => null; document.documentElement = {};
  store.set("tt:mode", "team"); tt = null; renderTabletop(); eq(/Run with a team/.test(view.innerHTML) && /after-action report/.test(view.innerHTML), true, "picker offers team mode");
  const i = SCENARIOS.findIndex(s => (s.types || []).includes("social")); ttfNew(i, "social");
  let h = view.innerHTML; if(bad(h)) throw new Error("setup bad: " + where(h)); eq(/Who's in the room/.test(h) && (h.match(/data-ttf-role=/g) || []).length, 6, "six roles to fill");
  ttf.roles.legal = "Priya"; ttfAct("mins", 3); eq(ttf.left, 180, "three-minute timer");
  ttfAct("begin"); h = view.innerHTML; if(bad(h)) throw new Error("inject bad: " + where(h));
  eq(/Show the options/.test(h) && /Legal \(Priya\)/.test(h) && /3:00/.test(h), true, "first update with prompts, named role and timer");
  const sc = ttfSc();
  sc.steps.forEach((st, k) => {
    ttfAct("reveal"); eq(/Which would the team choose/.test(view.innerHTML), true, "options shown at step " + (k + 1));
    const pick = k % 2 ? st.o.findIndex(o => !o.best) : st.o.findIndex(o => o.best); ttfAct("pick", pick);
    h = view.innerHTML; if(bad(h)) throw new Error("outcome bad: " + where(h)); eq(/Capture it/.test(h), true, "outcome and capture at step " + (k + 1));
    ttf.notes[k] = "Team agreed on step " + (k + 1); if(k === 0) ttfAct("addact", {t:"Write a holding statement", role:"comms"}); if(k === 1) ttfAct("addact", {t:"Check the reporting deadline", role:"legal"});
    ttfAct("next");
  });
  eq(ttf.phase, "debrief", "reaches the debrief"); h = view.innerHTML; if(bad(h)) throw new Error("debrief bad: " + where(h));
  eq(/2 of 4 strongest calls/.test(h) && /2 action items/.test(h) && /Legal \(Priya\)/.test(h), true, "debrief shows calls, actions and owners");
  const prog = ttProgress()[ttKey(i, "social")]; eq(!!prog && prog.team === true && prog.best === 2, true, "counts toward crisis readiness");
  out.push("exercise: setup, 4 decisions, " + ttf.actions.length + " actions, debrief " + ttf.picks.length + " picks");
  const md = ttfReport(); eq(/# After-action report/.test(md) && /\| Write a holding statement \| Communications \| 1 \|/.test(md) && /Team notes:\*\* Team agreed on step 4/.test(md) && /In the room:\*\* Legal \(Priya\)/.test(md), true, "after-action report");
  const tasks = tkFromTabletop(); eq(tasks.length, 2, "one tracker task per action"); eq(tasks[1].owner, "Legal (Priya)", "task keeps the owner");
  out.push("after-action report and " + tasks.length + " tracker tasks");
  ttfEnd(); eq(ttf, null, "ending clears the session"); store.set("tt:mode", "solo"); renderTabletop(); eq(/Play solo/.test(view.innerHTML), true, "back to the picker");
  return out.join("\n");
};
const src = stub + [rd("partT.js"), rd("partD.js"), rd("partE1.js"), rd("partE2.js"), rd("partF1.js"), rd("_F2.js"), rd("partW1.js"), rd("_L.js"), rd("_F3_9.js"), rd("_G.js"), rd("_W9.js"), rd("partNav.js"), rd("partH4.js"), rd("partH2.js"), rd("partAbout.js"), rd("partMAd.js"), rd("partMA.js"), rd("partCV.js"), rd("partOV.js"), rd("partRC.js"), rd("partTK.js"), rd("partORG.js"), rd("partJN.js"), rd("partTTF.js")].join("\n")
  + "\nreturn (" + body.toString() + ")();";
console.log(new Function(src)());
