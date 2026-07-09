// balance.test.mjs — regression + balance guardrails for Westward
// Run with:  node --test        (add  "test": "node --test"  to package.json scripts)
//
// Lives at  test/balance.test.mjs  (import path below is relative to that location).
// Zero dependencies — uses only the built-in node:test runner.
//
// It does two jobs:
//   1) REGRESSION — thousands of headless playthroughs across mixed policies, asserting
//      no crash, no broken invariant, and that every game terminates.
//   2) BALANCE — asserts win rates for reference player profiles stay inside design bands,
//      so a future mechanic tweak that accidentally re-brutalizes (or trivializes) the
//      food economy fails the test instead of shipping.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  reducer, START, GOAL, LANDMARKS, currentLandmarkIdx,
} from "../src/game/engine.js";

// ---------------------------------------------------------------------------
// Reference outfits. REC must mirror the suggested defaults in the Outfit
// screen (src/components/screens.jsx). If you change the UI defaults, change
// these too — or, cleaner, export a DEFAULT_OUTFIT constant from engine.js and
// import it in both places so there's a single source of truth.
// ---------------------------------------------------------------------------
const REC = { oxen: 250, food: 280, ammo: 2, clothing: 40, misc: 30 };   // recommended outfit
const LEAN = { oxen: 250, food: 200, ammo: 2, clothing: 30, misc: 30 };  // under-provisioned (old default)

// Player policies (how the profile plays each turn)
const PASSIVE = { huntAt: 0, resupplyFoodAt: 0 };                        // never hunt, never resupply
const ACTIVE  = { huntAt: 80, resupplyFoodAt: 110 };                     // hunts + resupplies when low

// ---------------------------------------------------------------------------
// Harness: drive the reducer through one full game under a policy.
// onStep(state) is called after every dispatch for invariant checking.
// ---------------------------------------------------------------------------
function play(alloc, opts, onStep) {
  const {
    eatNormal = 2, huntAt = 0, huntBullets = 50,
    resupplyFoodAt = 0, resupplyMin = 20, huntPenalty = 45, riverMethod = "float",
  } = opts;

  let s = { ...START };
  const step = (action) => { s = reducer(s, action); if (onStep) onStep(s); };

  step({ type: "OUTFIT", payload: alloc });

  let guard = 0, terminated = false;
  while (guard++ < 400) {
    if (s.phase === "end") { terminated = true; break; }
    if (s.phase === "river")    { step({ type: "CROSS_RIVER", method: riverMethod }); continue; }
    if (s.phase === "mountain") { step({ type: "RESOLVE_MOUNTAIN" }); continue; }
    if (s.phase === "hunt")     { step({ type: "RESOLVE_HUNT", ms: 380 + Math.random() * 500 }); continue; }
    if (s.phase === "fort")     { step({ type: "CLOSE_FORT" }); continue; }

    // phase === "trail"
    const idx = currentLandmarkIdx(s.mile);
    const atFort = LANDMARKS[idx].fort && s.mile >= LANDMARKS[idx].mile;

    if (atFort && s.food < resupplyFoodAt && s.cash >= resupplyMin) {
      step({ type: "FORT_BUY", payload: { food: Math.min(s.cash, 60), ammo: 0, clothing: 0, misc: 0 } });
      continue;
    }
    const eat = s.food < 45 ? 1 : eatNormal;           // tighten rations when food is low
    if (eat !== s.eat) step({ type: "SET_EAT", level: eat });

    if (s.food < huntAt && s.bullets > huntBullets) {  // hunt as the food valve
      step({ type: "OPEN_HUNT" });
      step({ type: "RESOLVE_HUNT", ms: 380 + Math.random() * 500 });
      step({ type: "ADVANCE", penalty: huntPenalty });
      continue;
    }
    step({ type: "ADVANCE", penalty: 0 });
  }

  return { won: !!s.won, dead: s.dead || null, turns: s.turn, terminated };
}

// Invariant check for any in-game state (skips the pre-outfit screen)
const NUMERIC = ["mile", "food", "bullets", "clothing", "misc", "oxen", "cash", "turn"];
const PHASES = new Set(["outfit", "trail", "fort", "hunt", "river", "mountain", "end"]);
function invariantViolation(s) {
  if (s.phase === "outfit") return null;
  if (!PHASES.has(s.phase)) return `unknown phase "${s.phase}"`;
  for (const k of NUMERIC) {
    if (!Number.isFinite(s[k])) return `${k} not finite (${s[k]})`;
    if (s[k] < 0) return `${k} went negative (${s[k]})`;
  }
  if (s.mile > GOAL) return `mile exceeded GOAL (${s.mile} > ${GOAL})`;
  if (s.turn > 20) return `turn exceeded cap (${s.turn})`;
  return null;
}

function winRate(N, alloc, opts) {
  let wins = 0;
  for (let i = 0; i < N; i++) if (play(alloc, opts).won) wins++;
  return (100 * wins) / N;
}

// ---------------------------------------------------------------------------
// 1) REGRESSION — invariants hold and every game terminates, across all profiles
// ---------------------------------------------------------------------------
test("no crashes, no broken invariants, all games terminate", () => {
  const profiles = [
    [REC, PASSIVE], [REC, ACTIVE], [LEAN, PASSIVE], [LEAN, ACTIVE],
  ];
  let violation = null, nonTerminated = 0, games = 0;
  for (const [alloc, opts] of profiles) {
    for (let i = 0; i < 800; i++) {
      games++;
      const r = play(alloc, opts, (s) => { if (!violation) violation = invariantViolation(s); });
      if (!r.terminated) nonTerminated++;
      if (violation) break;
    }
    if (violation) break;
  }
  assert.equal(violation, null, `invariant broken: ${violation}`);
  assert.equal(nonTerminated, 0, `${nonTerminated}/${games} games failed to terminate`);
});

// ---------------------------------------------------------------------------
// 2) BALANCE — design contract for the difficulty curve
//    Bands are wide relative to sampling noise (~1pp std at N=5000), so a pass
//    means a real design shift, not RNG. Observed at time of writing:
//      recommended + passive  ≈ 68%
//      recommended + active    ≈ 76%
//      under-provisioned + passive ≈ 24%
// ---------------------------------------------------------------------------
const N = 5000;

test("on-ramp floor: recommended outfit, passive play is fair (55–80%)", () => {
  const r = winRate(N, REC, PASSIVE);
  console.log(`  recommended + passive: ${r.toFixed(1)}%`);
  assert.ok(r >= 55 && r <= 80, `floor ${r.toFixed(1)}% outside [55,80] — economy re-brutalized or trivialized`);
});

test("skill ceiling: recommended outfit, active play is reliable (65–92%)", () => {
  const r = winRate(N, REC, ACTIVE);
  console.log(`  recommended + active:  ${r.toFixed(1)}%`);
  assert.ok(r >= 65 && r <= 92, `ceiling ${r.toFixed(1)}% outside [65,92]`);
});

test("the economy still bites: under-provisioned passive play stays hard (10–42%)", () => {
  const r = winRate(N, LEAN, PASSIVE);
  console.log(`  under-provisioned + passive: ${r.toFixed(1)}%`);
  assert.ok(r >= 10 && r <= 42, `under-provisioned win ${r.toFixed(1)}% outside [10,42] — provisioning stopped mattering`);
});

test("provisioning matters: recommended beats under-provisioned by ≥20pp", () => {
  const good = winRate(N, REC, PASSIVE);
  const bad = winRate(N, LEAN, PASSIVE);
  const gap = good - bad;
  console.log(`  provisioning gap: ${gap.toFixed(1)}pp`);
  assert.ok(gap >= 20, `provisioning gap only ${gap.toFixed(1)}pp (<20) — outfitting choices don't matter enough`);
});
