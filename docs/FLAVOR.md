# Westward — Flavor Backlog

Creative/flavor work beyond the faithful 1978 mechanics port. The game is shipped and
difficulty-guarded; this is the "give it its own voice" arc. Everything here is **additive** —
events are a single data structure and landmarks are a single array, so most of this drops in
without touching the turn engine.

## How to use this
Grab a single item sized to the time you have. Keystones (⭐) are where the character actually
lives — do those when you have a real block. Everything is triaged so a short evening still moves
the needle.

**Legend**
- **S / M / L** — effort: an evening / a focused session / a real block of time
- ⭐ — keystone: disproportionate payoff for the effort
- 🎨 — needs new art (each new landmark ≈ one NovelAI scene; see `trail-west-art-gallery.html`)
- 🎵 — needs audio
- ⚠️ — copyright note, read before building
- 🧪 — touches the balance test (`test/balance.test.mjs`); re-run `npm test` and expect to retune

---

## 1. More points of interest

The trail already has 18 nodes — the gap isn't *count*, it's that most are silent tick marks.
Weight the effort toward making existing nodes *speak* over adding new dots.

### 1a. Make existing landmarks speak (vignettes) ⭐ M
The highest-value POI work. Give arrivals a short bit of writing / a small decision instead of
adding more silent markers.
- **The Dalles fork** ⭐ — currently silent at mile 1860, but historically the iconic end-game
  decision: **raft the Columbia** (fast, dangerous) vs. **Barlow Road toll** (slow, costs cash).
  One decision does more for the map than five new tick marks. Mirrors the existing river-crossing
  UI pattern, so it's cheap to build. 🎨 (one scene)
- Short arrival vignettes for the currently-silent nodes (Chimney Rock, Independence Rock,
  Soda Springs, The Dalles). Pure data/writing, no new mechanics. **S each.**

### 1b. Soda Springs — the model "good" POI ⭐ S 🎨
Keep it — you're clear. ⚠️ The *place* is real public-domain geography (already in the trail at
~mile 1180); only a specific copyrighted photo or the old MECC screen art would be off-limits, and
you're generating your own art, so no issue. It's a rare **positive** stop on a hazard-heavy trail:
pioneers loved the naturally carbonated springs — Steamboat Spring actually spurted; travelers drank
and bathed in the fizzy water. Build it as your template **morale/health-lift vignette** (small food
or health bump, warm tone). Art brief: bubbling mineral pools, travelers resting. Good first flavor
commit — it establishes the "good POI" pattern the others can copy.

### 1c. New landmarks (all real, all public domain) M 🎨
Real trail geography in correct order. Each is 🎨 one new scene, so add them in a batch when you're
doing an art pass. Suggested mile placements slot cleanly into the existing `LANDMARKS` array:
- **Ash Hollow / Windlass Hill** (~mile 450) — a genuinely steep, famous descent. Great hazard
  vignette (risk damage/injury on the way down). ⚠️ names/geography only.
- **Courthouse & Jail Rocks** (~mile 520) and **Scotts Bluff** (~mile 600) — bracket Chimney Rock,
  turning that stretch into a proper landmark run.
- **Devil's Gate** (~mile 830) — dramatic rock cleft just past Independence Rock.
- **Register Cliff / name-carving beat** (~mile 660, or fold into Independence Rock) — travelers
  carved their names; a nice optional "leave your mark" flavor moment.

---

## 2. Named deaths & party members

Right now deaths are generic ("ran out of food," generic illness), which is exactly why the iconic
"died of dysentery" beat is missing. Three layers, increasing payoff:

### 2a. Name the afflictions S ⚠️
Dysentery, cholera, typhoid, measles, mountain fever, drowning, exhaustion — all real trail killers,
all free to name. ⚠️ Name the diseases freely and write your **own** epitaph text; don't reproduce
MECC's exact famous tombstone wording verbatim — that specific line is theirs. Swap the generic
illness/death strings in `engine.js` for named ones. Cheapest way to start landing the tone.

### 2b. Tombstone / epitaph screen S 🎨
"Here lies ___. Cholera. 1847. 1,180 miles from home." You already have a trailside-marker sketch
in the art gallery (scene 10) to build the screen around.

### 2c. Named party members ⭐⭐ L 🧪
**The single highest-leverage item on this whole list.** The dysentery beat only lands when it's a
*person*. The original tracked a family of five; give the party named members who sicken and die
**individually**, each with a specific affliction and epitaph, and have the arrival screen list who
survived. Most of the "character" the game is missing hangs off this one feature.
- Touches: engine state (add a `party` array), the status UI, illness/death logic, and the end
  screen.
- 🧪 Illness currently drains *resources*; retargeting it at *individuals* changes death flavor but
  should preserve aggregate survival math — re-run `npm test` to confirm the win/lose bands hold.

---

## 3. Music & sound 🎵

### 3a. Score (Suno) M 🎵 ⚠️
Cue list to generate:
- Main theme — frontier folk (fiddle, banjo, harmonica)
- Travel loop — sparse, walking-tempo, non-intrusive
- Tension sting — rivers / mountains / attacks
- Somber cue — death / illness
- Arrival theme — warm, resolved

⚠️ "Oh! Susanna" (Stephen Foster, 1848) is period-perfect and the **melody** is public domain —
make an original arrangement or use it as a Suno style reference; don't drop in a copyrighted
recording.

### 3b. Ambient SFX S 🎵
Wagon creak, oxen, wind, river rush, a gunshot for the hunt, a single tolling bell on death.

### 3c. Audio tech notes S
- Howler.js or Tone.js (you know Tone) for layering + crossfades between travel/tension/arrival.
- Mute toggle + volume in settings.
- **Start audio on first user interaction** so browser autoplay policies don't block it.

---

## 4. Rework hunting 🧪

The current reaction-timing "type BANG" minigame is the most replaceable piece. Options,
least → most effort:

- **Commit-and-risk (no twitch)** — S — choose how many bullets to spend; more bullets = better odds
  and bigger haul. Clean, mobile-friendly, accessible. Good default if you want to ditch the
  reaction test entirely.
- **Canvas shooting gallery** — M 🎨 — animals cross the screen, click to shoot within a shot/time
  budget; food scales with hits and animal size (bison > deer > rabbit). The fun, visual option.
- **Carry-weight nuance** — S — cap how much meat returns to the wagon (pioneers routinely downed
  more than they could haul). "You could only carry 100 lbs of the kill." Very on-theme; pairs with
  either option above.

🧪 **Whichever you pick, hunting is wired to the food/bullets/45-mile economy the balance test
guards.** The `ACTIVE` policy in `test/balance.test.mjs` assumes roughly the current hunt payoff, so
a big yield change will move the skill-ceiling band. Re-run `npm test` and retune the hunt numbers
(and possibly the band) until it's green.

---

## Triage cheat-sheet

| Quick wins (S) | Focused (M) | Keystones (L, ⭐) |
|---|---|---|
| Soda Springs vignette | The Dalles fork | Named party members ⭐⭐ |
| Name the afflictions | New landmark batch + art | Canvas hunting gallery |
| Tombstone screen | Suno score | |
| Silent-node vignettes | | |
| Commit-and-risk hunting | | |
| Ambient SFX | | |

**If you only do one thing next time:** named party members (2c). Everything else is polish; that
one turns a supply-tracker into a story.
