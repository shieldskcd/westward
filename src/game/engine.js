/*
  engine.js — all game logic for Westward
  Mechanics adapted from the public-domain 1978 OREGON source
  (github.com/LiquidFox1776/oregon-trail-1978-basic, MIT).
  Pure functions + a reducer; no React in here so it's easy to test/tweak.
*/

// ---------- palette ----------
export const C = {
  paper: "#e7d9b6",
  panel: "#efe4c6",
  ink: "#2c2318",
  inkSoft: "#6a5942",
  rust: "#8a3b2a",
  sage: "#586b3c",
  amber: "#b17e1f",
  line: "#a58f66",
  frame: "#cdb58a",
};
export const serif = { fontFamily: 'Georgia, "Iowan Old Style", Palatino, serif' };
export const mono = { fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace' };

// ---------- trail geography (real order; mapped onto 2040 miles) ----------
export const GOAL = 2040;
export const LANDMARKS = [
  { mile: 0,    name: "Independence, MO", fort: true },
  { mile: 100,  name: "Kansas River",     river: true },
  { mile: 185,  name: "Big Blue River",   river: true },
  { mile: 300,  name: "Fort Kearny",      fort: true },
  { mile: 550,  name: "Chimney Rock" },
  { mile: 640,  name: "Fort Laramie",     fort: true },
  { mile: 815,  name: "Independence Rock" },
  { mile: 950,  name: "South Pass",       mountain: true, blizzard: 0.20 },
  { mile: 990,  name: "Fort Bridger",     fort: true },
  { mile: 1050, name: "Green River",      river: true },
  { mile: 1180, name: "Soda Springs" },
  { mile: 1260, name: "Fort Hall",        fort: true },
  { mile: 1400, name: "Snake River",      river: true },
  { mile: 1540, name: "Fort Boise",       fort: true },
  { mile: 1700, name: "Blue Mountains",   mountain: true, blizzard: 0.30 },
  { mile: 1760, name: "Fort Walla Walla", fort: true },
  { mile: 1860, name: "The Dalles" },
  { mile: 2040, name: "Oregon City",      end: true },
];

// ---------- helpers ----------
const rnd = () => Math.random();
const ri = (n) => Math.floor(n);
export const clamp0 = (n) => (n < 0 ? 0 : n);
export function currentLandmarkIdx(mile) {
  let idx = 0;
  for (let i = 0; i < LANDMARKS.length; i++) if (mile >= LANDMARKS[i].mile) idx = i;
  return idx;
}

// ---------- event table: exact cumulative d100 cutoffs from the 1978 source ----------
// Each row is `{ cutoff, apply }`. rollEvent draws one d100 and returns the FIRST row
// whose `cutoff` the roll is <= (first-match-wins), so a row's real probability is
// `cutoff − previous cutoff`. The cutoffs and their ASCENDING order ARE the balance
// contract (guarded by test/balance.test.mjs) — never reorder rows or "tidy" the
// numbers into per-event widths. To add an event: insert a row at the right cutoff,
// widening the gap there on purpose, and keep the list sorted. `apply(d)` mutates the
// day-state `d` and returns the log `{ msg, tone }`. Rolls above the last cutoff (95)
// fall through to the else branch in rollEvent.
export const EVENTS = [
  { cutoff: 6,  apply: (d) => { d.mile -= 15 + 5 * rnd(); d.misc -= 8; return { msg: "Wagon breaks down — time and supplies lost on repairs.", tone: "bad" }; } },
  { cutoff: 11, apply: (d) => { d.mile -= 25; d.oxen -= 20; return { msg: "An ox injures its leg — it slows you the rest of the way.", tone: "bad" }; } },
  { cutoff: 13, apply: (d) => { d.mile -= 5 + 4 * rnd(); d.misc -= 2 + 3 * rnd(); return { msg: "A child breaks an arm. You stop to make a sling.", tone: "bad" }; } },
  { cutoff: 15, apply: (d) => { d.mile -= 17; return { msg: "An ox wanders off. You lose time searching.", tone: "bad" }; } },
  { cutoff: 17, apply: (d) => { d.mile -= 10; return { msg: "A child gets lost — half the day is spent looking.", tone: "bad" }; } },
  { cutoff: 22, apply: (d) => { d.mile -= 10 * rnd() + 2; return { msg: "Unsafe water — you detour to a clean spring.", tone: "bad" }; } },
  { cutoff: 32, apply: (d) => {
      // early trail = rain (supplies lost); later on = a harmless cold-weather warning
      if (d.mile <= 950) { d.food -= 10; d.bullets -= 500; d.misc -= 15; d.mile -= 10 * rnd() + 5; return { msg: "Heavy rains — time and supplies lost.", tone: "bad" }; }
      return { msg: "Cold weather ahead. Bundle up.", tone: "warn" };
    } },
  { cutoff: 35, apply: (d) => { d.bullets -= 40; d.misc -= 5; d.oxen -= 20; return { msg: "Bandits attack! Driven off, but supplies are gone.", tone: "bad" }; } },
  { cutoff: 37, apply: (d) => { d.food -= 40; d.bullets -= 400; d.misc -= rnd() * 8 + 3; d.mile -= 15; return { msg: "Fire in the wagon — food and supplies damaged!", tone: "bad" }; } },
  { cutoff: 42, apply: (d) => { d.mile -= 10 + 5 * rnd(); return { msg: "You lose your way in heavy fog.", tone: "bad" }; } },
  { cutoff: 44, apply: (d) => {
      d.bullets -= 10; d.misc -= 5;
      if (d.misc < 0) d.dead = "You died of snakebite — no medicine left.";
      return { msg: "You killed a poisonous snake after it struck.", tone: "bad" };
    } },
  { cutoff: 54, apply: (d) => { d.food -= 30; d.clothing -= 20; d.mile -= 20 + 20 * rnd(); return { msg: "Wagon swamped fording a river — food and clothing lost.", tone: "bad" }; } },
  { cutoff: 64, apply: (d) => { d.bullets -= 20; d.clothing -= 8; d.food -= 16; return { msg: "Wild animals attack! You fend them off at a cost.", tone: "bad" }; } },
  { cutoff: 69, apply: (d) => { d.mile -= 5 + rnd() * 10; d.bullets -= 200; d.misc -= 4 + rnd() * 3; return { msg: "Hail storm — supplies damaged.", tone: "bad" }; } },
  { cutoff: 95, apply: (d) => { d.illnessCheck = true; return { msg: "The trail is quiet today.", tone: "ok" }; } },
];

export function rollEvent(d) {
  const r = 100 * rnd();
  for (const ev of EVENTS) {
    if (r <= ev.cutoff) return ev.apply(d);
  }
  // else branch (r > 95): the rare good beat
  d.food += 14;
  return { msg: "Helpful locals point you to more food.", tone: "good" };
}

// ---------- eating -> illness (src 4610-4660 + severity 6300) ----------
export function illnessRoll(d, eat) {
  let fire = eat === 1 ? true : eat === 2 ? rnd() > 0.25 : rnd() < 0.5;
  if (!fire) return null;
  const sev = 100 * rnd();
  if (sev < 10 + 35 * (eat - 1)) { d.mile -= 5; d.misc -= 2; return "Mild illness — medicine used."; }
  if (sev < 100 - 40 / Math.pow(4, eat - 1)) { d.mile -= 5; d.misc -= 5; return "Bad illness — medicine used."; }
  d.misc -= 10;
  if (d.misc < 0) d.dead = "A serious illness took hold and your medicine ran out.";
  return "Serious illness — you must stop for medical attention.";
}

// ---------- mountain passes (src 4710+; South Pass & Blue Mountains) ----------
// Resolves a mountain beat: rugged going, a cold-weather clothing check, and a blizzard roll.
export function resolveMountain(d, blizzardProb) {
  const logs = [];
  // rugged terrain always slows you
  d.mile -= 30 + ri(rnd() * 40);
  logs.push({ t: "The going turns rugged and steep through the pass.", tone: "warn" });
  // cold-weather check — clothing needs to keep pace with how late it's getting
  const need = 22 + d.turn * 1.5;
  if (d.clothing < need) {
    d.misc -= 4; d.food -= 6;
    logs.push({ t: "You don't have clothing enough for the cold — the party suffers.", tone: "bad" });
    if (d.misc < 0) d.dead = "Exposure and cold overcame the party in the mountains.";
  }
  // blizzard roll
  if (rnd() < blizzardProb) {
    d.mile -= 40 + ri(rnd() * 40);
    d.food -= 20; d.bullets -= 200; d.misc -= 6;
    logs.push({ t: "A blizzard traps you for days. Supplies and time bleed away.", tone: "bad" });
    if (d.food < 0 || d.misc < 0) d.dead = "The blizzard was too much — the party did not make it through.";
  } else {
    logs.push({ t: "The weather holds and you clear the pass.", tone: "good" });
  }
  ["food", "bullets", "clothing", "misc", "oxen"].forEach((k) => (d[k] = clamp0(ri(d[k]))));
  return logs;
}

// ---------- persistence (safe no-ops in sandboxed/artifact contexts) ----------
const SAVE_KEY = "westward.save.v1";
export function saveGame(state) {
  try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {}
}
export function loadGame() {
  try { const r = window.localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch (_) { return null; }
}
export function clearSave() {
  try { window.localStorage.removeItem(SAVE_KEY); } catch (_) {}
}
export function hasSave() {
  try { return !!window.localStorage.getItem(SAVE_KEY); } catch (_) { return false; }
}

// ---------- default outfit ----------
// Single source of truth for the recommended starting outfit. The Outfit screen
// seeds its inputs from this, and the balance test uses it as the REC profile —
// so the shipped difficulty and the tested difficulty can never drift apart.
// (Dollar allocations out of the $700 budget; ammo is dollars → bullets = ammo*50.)
export const DEFAULT_OUTFIT = { oxen: 250, food: 280, ammo: 2, clothing: 40, misc: 30 };

// ---------- reducer ----------
export const START = { phase: "outfit", log: [], turn: 0, eat: 2, mile: 0 };

// initializer for useReducer — always opens on outfitting; a saved run
// is offered via the RESUME action (button shown when hasSave() is true)
export function initState() {
  return START;
}

function afterTurnChecks(s) {
  if (s.misc < 0) s.misc = 0;
  if (s.food <= 0) { s.food = 0; s.phase = "end"; s.dead = s.dead || "You ran out of food and starved."; }
  if (s.dead) s.phase = "end";
  if (s.mile >= GOAL) { s.mile = GOAL; s.phase = "end"; s.won = true; }
  if (s.turn >= 20 && s.phase !== "end") { s.phase = "end"; s.dead = "You were on the trail too long — the first blizzard of winter took you."; }
  if (s.phase === "end") clearSave();
  return s;
}

export function reducer(state, a) {
  switch (a.type) {
    case "OUTFIT": {
      const { oxen, food, ammo, clothing, misc } = a.payload;
      const cash = 700 - oxen - food - ammo - clothing - misc;
      return {
        ...state, phase: "trail", turn: 0, mile: 0,
        oxen, food, bullets: ammo * 50, clothing, misc, cash,
        log: [{ t: "You set out from Independence, Missouri. March 29, 1847.", tone: "ok" }],
      };
    }

    case "SET_EAT":
      return { ...state, eat: a.level };

    case "ADVANCE": {
      const d = { ...state, dead: null, illnessCheck: false };
      d.turn += 1;
      let gained = 200 + (d.oxen - 220) / 5 + 10 * rnd() - (a.penalty || 0);
      if (gained < 0) gained = 0;
      d.mile = ri(d.mile + gained);
      d.food = clamp0(d.food - (8 + 5 * d.eat));
      const ev = rollEvent(d);
      const logs = [
        { t: `Two weeks pass. You travel ${ri(gained)} miles.`, tone: "ok" },
        { t: ev.msg, tone: ev.tone },
      ];
      if (d.illnessCheck) { const ill = illnessRoll(d, d.eat); if (ill) logs.push({ t: ill, tone: "bad" }); }
      ["food", "bullets", "clothing", "misc", "oxen"].forEach((k) => (d[k] = clamp0(ri(d[k]))));
      d.log = [...logs.reverse(), ...state.log].slice(0, 40);

      // special-landmark beats: mountain takes precedence over river within a turn
      const idx = currentLandmarkIdx(d.mile);
      const lm = LANDMARKS[idx];
      if (lm.mountain && state.lastMountainIdx !== idx && !d.dead && d.mile < GOAL) {
        d.pendingMountain = { name: lm.name, blizzard: lm.blizzard };
        d.phase = "mountain"; d.lastMountainIdx = idx;
      } else if (lm.river && state.lastRiverIdx !== idx && !d.dead && d.mile < GOAL) {
        d.pendingRiver = { idx, name: lm.name };
        d.phase = "river"; d.lastRiverIdx = idx;
      }
      return afterTurnChecks(d);
    }

    case "RESOLVE_MOUNTAIN": {
      const d = { ...state, phase: "trail", dead: null };
      const logs = resolveMountain(d, state.pendingMountain.blizzard);
      logs.unshift({ t: `You reach ${state.pendingMountain.name}.`, tone: "warn" });
      d.pendingMountain = null;
      d.log = [...logs.reverse(), ...state.log].slice(0, 40);
      return afterTurnChecks(d);
    }

    case "CROSS_RIVER": {
      const d = { ...state, phase: "trail", pendingRiver: null };
      const logs = [];
      if (a.method === "ford") {
        if (rnd() < 0.35) { d.food = clamp0(d.food - 25); d.clothing = clamp0(d.clothing - 15); logs.push({ t: `Fording the ${state.pendingRiver.name} went badly — the wagon flooded.`, tone: "bad" }); }
        else logs.push({ t: `You forded the ${state.pendingRiver.name} without trouble.`, tone: "good" });
      } else if (a.method === "float") {
        if (rnd() < 0.2) { d.misc = clamp0(d.misc - 10); d.mile = clamp0(d.mile - 20); logs.push({ t: "You floated across — it nearly capsized.", tone: "bad" }); }
        else logs.push({ t: "You caulked the wagon and floated across safely.", tone: "ok" });
      } else {
        d.mile = clamp0(d.mile - 25); d.cash = clamp0(d.cash - 5);
        logs.push({ t: "You paid a ferry $5 and crossed safely.", tone: "ok" });
      }
      d.log = [...logs.reverse(), ...state.log].slice(0, 40);
      return afterTurnChecks(d);
    }

    case "OPEN_FORT": return { ...state, phase: "fort" };
    case "CLOSE_FORT": return { ...state, phase: "trail" };
    case "FORT_BUY": {
      const d = { ...state, phase: "trail" };
      const { food, ammo, clothing, misc } = a.payload;
      const spend = food + ammo + clothing + misc;
      if (spend > d.cash) return state;
      d.cash -= spend;
      d.food += ri((2 / 3) * food);
      d.bullets += ri((2 / 3) * ammo * 50);
      d.clothing += ri((2 / 3) * clothing);
      d.misc += ri((2 / 3) * misc);
      d.log = [{ t: "You resupplied at the fort (goods cost more here).", tone: "ok" }, ...state.log].slice(0, 40);
      return d;
    }

    case "OPEN_HUNT": return { ...state, phase: "hunt" };
    case "RESOLVE_HUNT": {
      const d = { ...state };
      const b1 = Math.max(0, Math.min(6, Math.round((a.ms - 250) / 180)));
      let msg;
      if (a.ms > 1500 || 100 * rnd() < 13 * (b1 + 1)) msg = { t: "You missed — and dinner got away.", tone: "bad" };
      else if (b1 <= 1) { d.food += 52 + ri(rnd() * 6); d.bullets = clamp0(d.bullets - 10 - ri(rnd() * 4)); msg = { t: "Right between the eyes — a big one!", tone: "good" }; }
      else { d.food += 48 - 2 * b1; d.bullets = clamp0(d.bullets - 10 - 3 * b1); msg = { t: "Nice shot — good eatin' tonight.", tone: "good" }; }
      d.food = clamp0(ri(d.food));
      d.log = [msg, ...state.log].slice(0, 40);
      d.phase = "trail";
      d.huntResolved = true;
      return d;
    }

    case "RESUME": {
      const saved = loadGame();
      return saved && saved.phase && saved.phase !== "end" ? saved : state;
    }

    case "RESTART": { clearSave(); return { ...START }; }
    default: return state;
  }
}
