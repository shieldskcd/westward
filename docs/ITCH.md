# Westward — itch.io release kit

Everything needed to fill out the itch.io project page. Copy is a draft in the
I Can Play There Studios voice — edit freely, it's your game.

---

## Project settings

| Field | Value |
|---|---|
| **Title** | Westward |
| **Tagline** (short description) | A wagon journey west, and the winter that's chasing you. |
| **Classification** | Games |
| **Kind of project** | HTML |
| **Release status** | Released |
| **Pricing** | Free / "No payments" (or name your own price — see note below) |
| **Genre** | Simulation |
| **Tags** | `survival`, `resource-management`, `historical`, `text-based`, `singleplayer`, `oregon-trail`, `retro`, `roguelike-ish`, `short`, `browser` |
| **Average session** | A few minutes |
| **Inputs** | Mouse, touch |
| **Accessibility** | One-button / pointer only; no timed input; respects `prefers-reduced-motion` |

### Embed settings (HTML project)

| Setting | Value | Why |
|---|---|---|
| Viewport width | `800` | The panel caps at 640px with 12px gutters; 800 leaves comfortable margin. |
| Viewport height | `900` | The outfit and end screens are the tallest; this avoids most inner scrolling. |
| **Fullscreen button** | ✅ enable | The layout is fluid and centers itself, so fullscreen looks good. |
| **Mobile friendly** | ✅ enable | Layout is responsive and input is tap-only. |
| Orientation | Default | Works portrait and landscape. |
| "Click to launch in fullscreen" | ❌ leave off | The game is fine embedded; forcing fullscreen is friction. |
| Background color | `#cdb58a` | Matches the game frame so the iframe surround doesn't seam. |

---

## ⚠️ Required before you publish: AI disclosure

itch.io requires every project to answer its **AI generation disclosure** prompt,
and the answer here is **yes**. Declare it — the studio page already does, and an
undeclared project can be delisted.

- **Generative AI used:** Yes
- **What:** Background and scene art generated with **NovelAI**. Code written with
  **Claude Code** as a pair-programmer.
- **What isn't:** The game design, the writing, the mechanics port, and the balance
  work. Mechanics are a hand port of the 1978 *OREGON* BASIC source.

Suggested wording for the disclosure field:

> Scene art is generated with NovelAI. Code was written with Claude Code assisting.
> The design, writing, and the mechanics port from the 1978 source are my own.

---

## ⚠️ Also check before you publish: the trademark

"The Oregon Trail" is a live registered trademark (HMH / News Corp). The README
already covers the diligence, and the release follows it:

- ✅ Ships as **Westward**, not the trademarked name.
- ✅ Uses only **uncopyrightable** elements — game mechanics and real public-domain
  geography — plus original art and writing.
- ✅ Epitaph wording is original, deliberately **not** MECC's verbatim tombstone line.
- ✅ No MECC / Apple II assets of any kind.
- ⚠️ **Don't** put "Oregon Trail" in the title, tagline, or cover art. The
  `oregon-trail` *tag* is a discovery term and is the one place the phrase is
  reasonable — drop it if you'd rather have zero exposure.
- ⚠️ Credit the source in the description (below) — it's accurate and it's the
  strongest signal that this is a homage to a public-domain listing, not a knockoff.

---

## Store page description

### Short version (the tagline field)

> A wagon journey west, and the winter that's chasing you.

### Long version (the page body)

Paste-ready HTML in [`itch-description.html`](itch-description.html) — itch's editor
has an **Edit as HTML** toggle, and that file is written for its sanitizer: structural
tags only (`p`, `h2`, `ul`, `li`, `strong`, `em`, `hr`), no inline styles, classes or
ids, which itch strips. The game title is omitted because itch already renders it
above the description. Markdown below for reading.

> # Westward
>
> **2,040 miles. Twenty turns. One wagon, and whatever you thought to buy before you left.**
>
> You outfit in Independence, Missouri with $700 and a set of guesses. Oxen to pull,
> food to eat, bullets to hunt with, clothing for the cold, and spare parts for the
> things that break. Spend it all on food and the mountains will take you. Spend it
> all on oxen and you'll starve within sight of the pass.
>
> Then you go west, and the trail starts asking questions.
>
> ## The trail doesn't negotiate
>
> Ford the river or pay the ferry. Hunt, and lose three days to it. Eat well and
> stay healthy, or eat poorly and gamble that the fever holds off one more week.
> Every one of those choices costs you something you'll want later.
>
> Winter closes the passes at turn twenty. It does not wait for you.
>
> - **Real geography** — Chimney Rock, Fort Laramie, South Pass, the Blue Mountains,
>   the Dalles. The landmarks are where they actually are.
> - **River crossings** with real decisions: ford it, caulk the wagon and float, or
>   pay for the ferry and feel it in your purse.
> - **Mountain passes** that check what you're wearing against how late in the year
>   it's gotten.
> - **Named afflictions** with their own epitaphs, carved on your tombstone if the
>   medicine runs out.
> - **Save and resume** — it remembers where you left off.
>
> ## Where it comes from
>
> This is a modern rebuild of the trail game I grew up on — built from the
> **designer's original 1978 BASIC source**, published by Don Rawitsch in
> *Creative Computing* and long since in the public domain.
>
> The mechanics are a hand port: the same d100 event bands, the same food-and-illness
> economy, the same brutal arithmetic. What's new is a landmark spine along the real
> trail, the river and mountain decisions, and art that isn't forty-eight years old.
>
> It started as a weekend project. It got away from me.
>
> ## On the balance
>
> The difficulty is *tested*, not guessed. Thousands of headless simulated journeys
> run on every change, asserting that a well-provisioned careful player wins about
> three times in four, and that an under-provisioned careless one still loses about
> three times in four. If a tweak ever makes it trivial or unfair, the test fails
> before it ships.
>
> ---
>
> *Made by Dave Shields / I Can Play There Studios, Kansas City. Scene art generated
> with NovelAI; code written with Claude Code assisting; design, writing, and the
> mechanics port are mine.*

---

## Store art

All in [`press/`](../press), ready to upload.

| File | Size | Use |
|---|---|---|
| `cover-630x500.png` | 630×500 | **Cover image.** Native itch cover size — no crop, nothing clipped. |
| `01-outfitting.png` | 645×954 | Outfitting in Independence — the premise and the $700 budget. |
| `02-river-crossing.png` | 650×939 | The Big Blue River decision — shows the branching. |
| `03-chimney-rock.png` | 648×942 | Trail view with landmark bar, rations, and the event log. |
| `04-arrival.png` | 641×937 | The win screen at Oregon City. |
| `05-tombstone.png` | 641×1068 | Death by typhoid at Fort Bridger, 1,009 miles in — the carved epitaph. |

Suggested screenshot order on the page: **02 → 05 → 03 → 01 → 04**. Lead with a
decision, follow it immediately with the consequence, then the texture, then the
shop, and let the arrival land last.

## Release checklist

- [ ] `npm test` passes (5/5, including the balance bands)
- [ ] `npm run package` → `westward-itch.zip` (~1.1 MB)
- [ ] Create the project on itch.io, kind = **HTML**
- [ ] Upload the zip, tick **"This file will be played in the browser"**
- [ ] Set viewport 800×900, enable fullscreen + mobile friendly
- [ ] Set background color `#cdb58a`
- [ ] **Answer the AI disclosure prompt** (see above — this is required)
- [ ] Upload cover image + screenshots from `press/`
- [ ] Paste tagline, description, tags, metadata
- [ ] Save as **draft** and play the embedded build start to finish before going public
- [ ] Check it on a phone — the embed behaves differently than desktop
- [ ] Publish, then add it to the studio page collection

### Playtest passes to do in the draft embed

- [ ] Win a run (reach Oregon City) — confirm the arrival art and copy land
- [ ] Die a run — confirm the tombstone epitaph renders
- [ ] Start a run, reload the page, confirm **Resume** appears and restores state
- [ ] Finish a run, confirm the save is cleared and Resume is gone
- [ ] Confirm every scene image loads (itch serves from a sandboxed subdomain)
