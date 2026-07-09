# Westward

A wagon-journey game built in React + Vite. The **mechanics** are a clean-room port of
the public-domain 1978 *OREGON* source (published by Don Rawitsch in *Creative Computing*,
1978; MIT-licensed reconstruction at
[LiquidFox1776/oregon-trail-1978-basic](https://github.com/LiquidFox1776/oregon-trail-1978-basic)).

> **On the name and assets:** "The Oregon Trail" is a live registered trademark (HMH / News Corp).
> This project deliberately uses only the *uncopyrightable* parts — game mechanics and real
> public-domain geography — under a different name, with original art and writing. Don't ship it
> using the trademark or any MECC/Apple II assets.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build -> dist/
npm run preview    # preview the production build
npm test           # headless engine smoke test (600 full games)
```

## Testing

`npm test` runs `test/smoke.mjs` — a dependency-free harness that plays hundreds of
full games through the reducer (no React, no browser), exercising outfitting, the event
table, forts, hunting, river crossings, mountain passes, illness, and every ending. It
asserts no crashes and no broken invariants (resources never negative, mileage sane,
every game terminates), and exits non-zero on failure. Bump the game count with
`RUNS=5000 npm test`. Run it after any change to `game/engine.js`.

## Deploy

`npm run build` emits a static `dist/`. Host it anywhere static:

- **itch.io** — zip `dist/` and upload as an HTML5 project
- **GitHub Pages** — push `dist/`, or use an action; if serving from a project subpath,
  uncomment and set `base` in `vite.config.js`
- **IONOS / your own space** — upload the contents of `dist/`

## Save / resume

Progress is saved to `localStorage` on every turn (key `westward.save.v1`). The outfitting
screen shows a **Resume** button when a save exists. Reaching the end (win or death) clears it.
Persistence is wrapped in try/catch so it degrades silently in sandboxed previews.

## Structure

```
src/
  main.jsx                 mount
  App.jsx                  root UI + save/resume wiring + turn/action buttons
  index.css                reset + reduced-motion
  game/
    engine.js              ALL game logic — constants, palette, events, illness,
                           mountain passes, reducer, persistence (no React here)
  components/
    ui.jsx                 Stat, Btn, TrailBar
    screens.jsx            Outfit, Fort, Hunt, River, Mountain, EndScreen
```

Everything stateful lives in `engine.js` as pure functions + one reducer, so logic changes
never touch the components.

## Tuning knobs (all in `game/engine.js`)

- **Difficulty / pace** — the mileage formula in the `ADVANCE` case:
  `200 + (oxen-220)/5 + rand(0..10)`. Raise the base or the oxen coefficient to make the trip easier.
- **Event frequencies** — `rollEvent()` uses the exact d100 cutoffs from the 1978 source.
  Each `if (r <= N)` band is that event's probability; reorder/reweight freely.
- **Eating vs. illness** — `illnessRoll()`: poorly = 100% illness roll, moderately = 75%, well = 50%.
- **Mountain passes** — `resolveMountain()` + the `blizzard` prob on the South Pass / Blue Mountains
  landmarks. Clothing threshold scales with turn number (later = colder).
- **Forts** — 2/3 value per dollar; **hunting** needs >39 bullets; both cost 45 miles.
- **Winter deadline** — `afterTurnChecks()` kills the party at turn 20.

## Enhancements beyond the original (yours to keep or cut)

The mainframe original was pure mileage with no named stops. Added here:

- **Landmark spine** (`LANDMARKS`) mapped along the 2040-mile trail using real trail geography.
- **River-crossing decisions** at river landmarks (ford / caulk & float / ferry).
- **Mountain-pass beats** at South Pass and the Blue Mountains (rugged terrain, cold-weather
  clothing check, blizzard roll) — matched to the source's ~950 and ~1700 mile thresholds.

## Ideas / next steps

- Party members with individual health/names (the original tracked a family of five)
- An illustrated map screen instead of the linear trail bar
- Difficulty presets (banker / carpenter / farmer, like the classic profession choice)
- Sound (Suno-generated period score would fit)
