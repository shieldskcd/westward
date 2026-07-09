/*
  test/smoke.mjs — headless regression harness for the Westward engine.

  Plays hundreds of full games through the reducer (no React, no browser),
  exercising the whole state machine: outfitting, the d100 event table, forts
  (buy + close), hunting, all three river-crossing methods, both mountain
  passes, illness rolls, and every ending path. Asserts no crashes and no
  broken invariants (resources never negative, mileage sane, every game ends).

  Run:  npm test           (defaults to 600 games)
        RUNS=5000 npm test  (more games = more of the random space covered)

  Exits non-zero on any problem, so it doubles as a CI gate.
*/

import { reducer, START, GOAL, LANDMARKS } from "../src/game/engine.js";

const RUNS = Number(process.env.RUNS) || 600;
const RIVER_METHODS = ["ford", "float", "ferry"];
const problems = [];
let won = 0, died = 0;
const deaths = {};

function checkInvariants(s, ctx) {
  for (const k of ["food", "bullets", "clothing", "misc", "oxen"]) {
    if (typeof s[k] === "number" && s[k] < 0) problems.push(`${ctx}: ${k} negative (${s[k]})`);
  }
  if (s.mile < 0) problems.push(`${ctx}: mile negative (${s.mile})`);
  if (s.mile > GOAL + 500) problems.push(`${ctx}: mile absurdly high (${s.mile})`);
  if (Number.isNaN(s.mile)) problems.push(`${ctx}: mile is NaN`);
}

for (let g = 0; g < RUNS; g++) {
  // vary the outfit within the $700 budget so no two runs are identical
  const oxen = 180 + Math.floor(Math.random() * 60);
  const food = 120 + Math.floor(Math.random() * 100);
  const ammo = 40 + Math.floor(Math.random() * 60);
  const clothing = 40 + Math.floor(Math.random() * 60);
  const misc = 30 + Math.floor(Math.random() * 40);

  let s = reducer(START, { type: "OUTFIT", payload: { oxen, food, ammo, clothing, misc } });
  checkInvariants(s, `run${g}/outfit`);

  let guard = 0;
  while (s.phase !== "end" && guard++ < 80) {
    if (s.phase === "trail") {
      const roll = Math.random();
      if (roll < 0.12) s = reducer(s, { type: "OPEN_FORT" });        // UI-initiated
      else if (roll < 0.24) s = reducer(s, { type: "OPEN_HUNT" });   // UI-initiated
      else s = reducer(s, { type: "ADVANCE", penalty: 0 });
    } else if (s.phase === "fort") {
      if (Math.random() < 0.7) {
        const c = Math.max(0, s.cash | 0);
        s = reducer(s, { type: "FORT_BUY", payload: { food: Math.min(10, c), ammo: 0, clothing: 0, misc: 0 } });
      }
      if (s.phase === "fort") s = reducer(s, { type: "CLOSE_FORT" }); // close like the real UI
    } else if (s.phase === "hunt") {
      s = reducer(s, { type: "RESOLVE_HUNT", ms: 200 + Math.floor(Math.random() * 1600) });
    } else if (s.phase === "mountain") {
      s = reducer(s, { type: "RESOLVE_MOUNTAIN" });
    } else if (s.phase === "river") {
      s = reducer(s, { type: "CROSS_RIVER", method: RIVER_METHODS[Math.floor(Math.random() * 3)] });
    } else {
      problems.push(`run${g}: unexpected phase "${s.phase}"`);
      break;
    }
    checkInvariants(s, `run${g}/t${s.turn}/${s.phase}`);
  }

  if (guard >= 80) problems.push(`run${g}: did not terminate within 80 steps (turn=${s.turn}, mile=${s.mile})`);
  if (s.phase !== "end") problems.push(`run${g}: ended loop not in 'end' phase (${s.phase})`);
  if (s.won) won++;
  else { died++; const r = s.dead || "(no reason)"; deaths[r] = (deaths[r] || 0) + 1; }
}

// static sanity: landmark table monotonic + ends exactly at GOAL
let prev = -1;
for (const lm of LANDMARKS) { if (lm.mile < prev) problems.push(`landmarks not sorted at ${lm.name}`); prev = lm.mile; }
if (LANDMARKS[LANDMARKS.length - 1].mile !== GOAL) problems.push("last landmark != GOAL");

console.log(`\n=== Westward smoke test: ${RUNS} full playthroughs ===`);
console.log(`Won:  ${won}  (${(100 * won / RUNS).toFixed(1)}%)`);
console.log(`Died: ${died} (${(100 * died / RUNS).toFixed(1)}%)`);
console.log(`\nDeath causes:`);
for (const [k, v] of Object.entries(deaths).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log(`\nProblems found: ${problems.length}`);
for (const p of problems.slice(0, 20)) console.log(`  ! ${p}`);
if (problems.length > 20) console.log(`  ...and ${problems.length - 20} more`);
console.log(problems.length === 0 ? "\nRESULT: PASS — no crashes, no broken invariants." : "\nRESULT: FAIL");
process.exit(problems.length === 0 ? 0 : 1);
