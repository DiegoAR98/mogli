# Seeonee

## Development Plan

Version 1.0 • September 25 2026 • Prepared for Diego Araujo

This document is the implementation blueprint for Seeonee, a single-player 2D exploration platformer for the browser built on Kipling's public-domain Mowgli stories. It turns the design fixed in `docs/GDD.md` into a stack, an architecture, data contracts, a test plan, a deployment recipe and a milestone schedule that one developer can execute in evenings and weekends. The locked decisions D01-D16 and every feel number are recorded in `docs/DECISIONS.md`; the evidence behind them is in `docs/RESEARCH.md`. Nothing here contradicts those two documents; where this plan adds a number, it says so and states its confidence. Three builds mark the road: a feel prototype (M1, a gray-box gym level), a vertical slice (M2, Level 1 with final art, HUD, save, EN and PT-BR, deployed on Netlify) and v1.0 (M6, all content). Every tool version below was verified on 2026-09-25 (see docs/RESEARCH.md §8). Engine API names that this plan could not verify against the Phaser 4 documentation are phrased generically and marked "verify in M0".

### Navigation

1. Plan summary and success criteria
2. Technology decisions
3. Software architecture
4. Simulation and tick rules
5. Data contracts
6. Presentation pipeline
7. VS Code setup and daily workflow
8. Asset pipeline and licensing operations
9. Testing and CI
10. Netlify deployment
11. Telemetry, privacy and monetization stance
12. Milestones and backlog
13. Production cadence
14. Risks
15. Coding-assistant handoff
16. Official references

## 1 Plan summary and success criteria

### 1.1 What this plan builds

| Item | Decision |
| --- | --- |
| Product | Seeonee: 4 zones x 2 levels, 4 bosses, the non-combat Spring Running finale, the In the Rukh 100% tableau, Honey Hollow bonus stage (D05) |
| Engine and language | Phaser 4.2.1 pinned exactly, TypeScript 7.0.x, Vite 8.3.x, Arcade Physics only (D10) |
| Presentation | 320x180 base resolution, 16 px tiles, integer scaling, 60 Hz fixed-step simulation, bitmap fonts, one master palette "Seeonee-40" (D08) |
| Modes | Modern (default: no lives, no clock, pack-stone checkpoints with autosave) and Retro (optional: 3 lives, 6:00 clock, countdown counter); tiers Cub / Wolf / Lone Wolf; Assist Mode (D06) |
| Languages | EN and PT-BR from day one, hand-rolled TypeScript dictionary with a parity test (D12) |
| Hosting | Netlify static site, `npm run build` to `dist`, Node 24, Deploy Previews for playtests (D11) |
| Effort | 630-935 h before buffer, 819-1,216 h with the 30% buffer; 15-22 months at 12.5 h/week, 5-8 months at 35 h/week (D15) |

### 1.2 The three deliverable builds

| Build | Milestone | Contents | Who plays it | Channel | Gate to pass |
| --- | --- | --- | --- | --- | --- |
| Feel prototype | M1 | One gray-box gym level: run, jump, crouch, nut throw, stomp, creeper climb and swing, crumbling terrace, ledge grab, one langur, one moon-stone, one pack-stone, pit respawn, the interact verb | 3 friends, moderated, 20 min each | Deploy Preview | 3 of 3 testers say movement "feels good" without prompting; T01-T10 pass; measured reach written back into every doc |
| Vertical slice | M2 | Level 1 Council Rock with final art, HUD, quota chain, Akela exit, Red Flower, save slots, EN and PT-BR, title and options, title and Zone 1 music, touch and gamepad | 10 remote testers for one week plus 2 moderated sessions | Deploy Preview plus the /feedback/ form; one production deploy | Top 5 issues fixed; pillar P2 metric met on L1 (9 of 10 testers name the objective within 10 s of the quota sting; median quota-to-exit under 60 s) |
| v1.0 | M6 | All 8 levels, 4 bosses, Spring Running, tableau, Honey Hollow layout 1, both modes, three tiers, Assist Mode, credits, privacy notice | Public | Netlify production, itch.io mirror | Section 1.3 table entirely true on the built output |

### 1.3 What "done" means for v1.0

Every row is binary. A row that is not true blocks the production deploy.

| # | Criterion |
| --- | --- |
| 1 | The 8 levels of the GDD sheets, the 4 bosses, the Spring Running and the In the Rukh tableau load from a new save and finish without developer commands |
| 2 | 15 collectibles per level with quota 8 / 10 / 12 by tier; quota met triggers the "Find <exit character>" chain; 15 of 15 shows Full Moon and the Honey Hollow door |
| 3 | Modern mode is the default; Retro mode (3 lives, 6:00 clock, counter counting down from 15) is a toggle never required for content |
| 4 | Cub / Wolf / Lone Wolf change quota, damage per hit (1 / 2 / 3 of 6 pips), boss hits per phase (2 / 3 / 4) and Chil's presence exactly as in the tier table |
| 5 | Assist Mode offers game speed 50-100% in steps of 10, invincibility, infinite clods, skip level, Chil everywhere and crouch hold-or-toggle, with an assist stamp and nothing locked |
| 6 | Keyboard (remappable), gamepad and touch (48 px CSS hit areas, two presets, opacity 20-80%) all complete a quota run |
| 7 | Every string appears in EN and PT-BR with the parity test green and no PT-BR overflow; 3 save slots with a versioned schema, and a malformed or denied localStorage never blocks play |
| 8 | All T-scenarios of section 9.4 pass on the built output with the smoke spec and Vitest green in CI; a quota run on Wolf takes 60-90 min and a 100% run 2-3 h on two testers who never saw the game |
| 9 | The title plus Zone 1 first load is at most 14 MB on the wire; each zone loads its own pack; `dist` is at most 55 MB per audio format |
| 10 | 95th-percentile frame time at most 20 ms and simulation under 4 ms on the named mid-range Android phone; no per-tick allocations in the player or projectile paths |
| 11 | The asset manifest has no `placeholder: true` row; `CREDITS.md` and `dist/licenses.txt` are regenerated and diffed at the release commit; the D03 attribution line is on the boot screen, the title screen, credits, `README.md` and the store page in EN and PT-BR |
| 12 | The EN and PT-BR privacy notice is published at `/privacy/` and `/privacidade/`; no automatic telemetry ships unless the first-run notice of section 11 is in front of it |
| 13 | The "Seeonee" trademark searches of docs/RESEARCH.md §3.5 were re-run in the launch month with no live conflict in classes 9, 28 and 41; the game runs on the support floor of 2.4 on the five test devices |

### 1.4 Numbers every document shares

The feel numbers (D09), the tier table, the level sizes and the hour estimates are copied from `docs/GDD.md` and the locked design; this plan restates them where an engineer needs them and never changes them. The one exception is the horizontal reach at full run, written everywhere as "about 5.5 tiles", which the M1 gym level measures; the measured value then replaces the estimate in the GDD, this plan and `docs/DECISIONS.md` in one commit.

## 2 Technology decisions

### 2.1 Tool table

| Tool | Version (verified 2026-09-25) | Why | Fallback |
| --- | --- | --- | --- |
| Phaser | 4.2.1 "Giedi" (9 Jul 2026), pinned exactly | Only candidate with a first-party Tiled loader, Arcade tile collision with `TILE_BIAS`, fixed-step physics, a scale manager with integer zoom, Web Audio unlock and multi-touch, and the largest documentation base (docs/RESEARCH.md §8) | phaser@3.90.0 "Tsugumi" (23 May 2025), the last 3.x release; same sprite, tilemap and Arcade code, "a few hours of work" |
| TypeScript | 7.0.2 (GA 8 Jul 2026), range 7.0.x | Go-native `tsc`, about 10x faster type-checking; installs as the normal `typescript` package | TypeScript 6.x behaves identically for this project |
| Vite | 8.3.1, range 8.3.x | Rolldown bundler and Oxc minifier; engines `^20.19 \|\| >=22.12`; its default `build.target` is the support floor of 2.4 | Vite 7.x (Vitest 5's peer range accepts `^6.4 \|\| ^7 \|\| ^8`) |
| Vitest | 5.0.2, range 5.0.x | Pure-logic unit tests in `environment: 'node'`, no jsdom, no canvas package | None needed: every rule lives in a Phaser-free module |
| @playwright/test | 1.63.0 (4 Sep 2026), range 1.63.x | One Chromium WebGL smoke test in GitHub Actions with software rendering | Skip the e2e job for one iteration and smoke-test the Deploy Preview by hand |
| Tiled | 1.12.2 (27 May 2026) | JSON export, embedded tilesets, CSV layers, custom properties, automapping | None planned; LDtk has no first-party Phaser loader (docs/RESEARCH.md §7.6) |
| Node and npm | 24 via `.nvmrc`; npm with a committed `package-lock.json` | Matches Netlify's Ubuntu 24.04 image default; Vitest 5 needs `^22.12 \|\| ^24 \|\| >=26`; Netlify auto-detects npm from the lockfile | The local 22.15.0 already satisfies Vite 8 and Vitest 5 (2.3) |
| rollup-plugin-license | 3.7.1 | Generates `dist/licenses.txt` with the Phaser MIT notice; verified in a local build on vite 8.3.1 + phaser 4.2.1 + Node 22.15.0 | `license-checker-rseidelsohn` (current release) as a cross-check (verify its Node requirement in M0) |
| Aseprite | Current release, $19.99 one-time (updates through v1.9 included) | Sprites, tiles, tags exported as sheet plus JSON for `this.load.aseprite`; CLI export script | Pixelorama 1.2.2 (free, MIT) |
| free-tex-packer, tile-extruder | Desktop build from GitHub releases; current npm release | Items, UI and props atlases in Phaser JSON hash format; 1-2 px tile extrusion (verify the extruder in M0) | Aseprite sheet export per atlas; Tiled margin and spacing by hand |
| jsfxr, ChipTone, BeepBox, Furnace, ffmpeg, Lospec | Web tools; desktop tracker; current ffmpeg; Endesga 32 as `.gpl` and `.ase` | Placeholder and short SFX (ChipTone output is CC0); music authored offline; `.ogg` + `.m4a` encoding with the settings in 6.5; Seeonee-40 derives from Endesga 32 (D08) | Kenney and Junkala CC0 packs; FamiStudio |

Bundle facts that shape budgets: phaser 4.2.1 is about 1.38 MB minified and 346-352 kB gzipped (276 kB brotli); Matter.js cannot be tree-shaken out and the Arcade-only build exists only as UMD, so the plan accepts the full ESM build (docs/RESEARCH.md §8). vite-plugin-pwa (current release, version checked when v1.1 starts) is deferred to v1.1; v1 ships the web manifest only (D15).

### 2.2 Phaser 4.2.1 with the 3.90.0 escape hatch

Three tilemap issues were open on 2026-09-25 and each has a mitigation that costs nothing:

| Issue | What it does | Mitigation in Seeonee |
| --- | --- | --- |
| #7317 (Jun 2026) | `TilemapGPULayer` draws seams between tiles | Never pass the `gpu` flag (the optional fifth argument of `map.createLayer(layerID, tileset, x, y, gpu)`, default `false`) so no layer becomes a `TilemapGPULayer`; every layer is a standard `TilemapLayer` from `map.createLayer(name, tileset)` |
| #7382 (opened 23 Sep 2026) | Vertically flipped tiles render at the wrong position | No vertical flips or rotations in Tiled (horizontal flips are fine); the level validator rejects the vertical-flip and diagonal-flip bits |
| #7296 (May 2026) | Memory leak in `TilemapLayerWebGLRenderer` when a `Game` instance is destroyed and recreated | The shipped game creates one `Game` and never destroys it; the dev server reloads the page instead of hot-swapping the game |
| #7252 (Feb 2026, also in 3.90) | Arcade tile separation can leave bodies at sub-pixel positions | Masked by `roundPixels`; the tick snaps a resting body to whole pixels (4.5) |

Trigger for the escape hatch: any verify-in-M0 item of 12.3 fails with no mitigation, or a P0 rendering or collision bug traced to Phaser 4 is not fixed within 8 h during M1-M2. Procedure: `npm install --save-exact phaser@3.90.0`, typecheck, replace any v4-only call (Filters, render nodes, `smoothPixelArt`), rerun T01-T10 and the smoke spec, record the decision in `docs/DECISIONS.md`. Phaser's own note is that v4 "keeps most of the public API you know, but there are important breaking changes", which is why gameplay never depends on Filters or Lights and no Filter ever carries information the player needs (Canvas is a deprecated, feature-limited fallback; docs/RESEARCH.md §8).

### 2.3 Node 24 versus the local 22.15.0

Diego's machine runs Node 22.15.0, which satisfies Vite 8 (`^20.19 || >=22.12`) and Vitest 5 (`^22.12 || ^24 || >=26`), so nothing blocks M0. Netlify's Ubuntu 24.04 "Noble" image defaults to Node 24, and `.nvmrc` = `24` plus `NODE_VERSION = "24"` in `netlify.toml` pin the same major locally, in CI and on Netlify. Vitest 5 excludes Node 23 and 25, so an odd-numbered Node is never installed. Recommendation: install Node 24 with nvm-windows (`nvm install 24`, `nvm use 24`) or the official installer during M0, keep `"engines": { "node": ">=22.12" }` in `package.json` so a 22.15.0 session still works, and let CI and Netlify run 24.

Rejected alternatives: KAPLAY (Tiled support is a third-party plugin; the project is mid-transition to an alpha), Excalibur 0.32.0 (pre-1.0 with breaking minors, version-locked Tiled plugin), PixiJS 8.21.0 (a renderer, not an engine) and Godot 4.7.2 web (37.7-39.5 MB raw wasm against a 300-credit hosting plan, COOP/COEP for threads) are recorded with their versions in docs/RESEARCH.md §8 and `docs/DECISIONS.md`.

### 2.4 Browser support floor and test devices

The support floor is Vite 8's default `build.target`, which the plan does not override: Chrome and Edge 111, Firefox 114, Safari and iOS 16.4, Samsung Internet 22, Android WebView 111 (Android 10 and later). It excludes about 4.5% of Brazilian and about 3% of worldwide page views (StatCounter, Aug 2026; docs/RESEARCH.md §8). Phaser 4.2.1 needs WebGL 1 plus two universal extensions, never WebGL 2; `type: Phaser.AUTO` stays, and a device without WebGL gets the deprecated Canvas renderer with a one-line notice.

| Device | Purpose |
| --- | --- |
| Windows desktop: Chrome, Edge, Firefox | Most Brazilian traffic; the daily development target |
| Samsung Galaxy A15, Android 14, Chrome and Samsung Internet | The gate device for the 60 fps and 48 px touch checks; substitute the nearest A1x/A2x available at M1 and record it in DECISIONS |
| Motorola Moto G, Android 13 or 14 | Second Android vendor (21% of Brazilian mobile) |
| iPhone on iOS 26 | Safari, home-screen mode, the `.ogg` audio path |
| Older iPhone on iOS 18.3 or earlier | The `.m4a` audio branch and the 7-day storage eviction behavior |

Substitutes: Chrome DevTools calibrated CPU throttling (4x and 20x) with USB remote debugging, and a free real-device session service for two-minute checks. One physical iPhone is unavoidable on Windows.

## 3 Software architecture

### 3.1 Folder layout

```text
mogli/                       repo root (the folder name is internal only, D03); netlify.toml .nvmrc .editorconfig .gitignore
  LICENSE LICENSE-ASSETS.md CREDITS.md README.md package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts playwright.config.ts
  index.html                 <div id="game"> + <script type="module" src="/src/main.ts">
  public/                    manifest.webmanifest icons/ privacy/index.html privacidade/index.html feedback/index.html
  public/game/               runtime-loaded files served at /game/..., never hashed, never under /assets: manifest.json sprites/ tilesets/ maps/ bg/ ui/ audio/ fonts/
  src/main.ts  src/game/config.ts  src/vite-env.d.ts   new Phaser.Game(config), once; GameConfig: pixelArt, scale, physics, input, audio; vite-env.d.ts declares __BUILD_ID__
  src/game/scenes/           BootScene, TitleScene, MapScene, PlayScene, HudScene; play/factories.ts
  src/game/systems/          input, camera, audio, events, save, i18n, pause (Phaser services, no rules)
  src/game/logic/  src/game/data/   PURE TypeScript, never imports phaser: every rule, unit-tested; tuning.ts, levels.ts, enemies.ts, bosses.ts, throwables.ts, helpers.ts, cards.ts
  src/i18n/  tests/unit/  tests/e2e/   en.ts, pt-BR.ts; Vitest; Playwright smoke.spec.ts
  tools/  docs/  .github/    gen-credits.mjs, validate-levels.mjs, export-art.ps1, extrude-tiles.mjs; GDD, PLAN, DECISIONS, RESEARCH, playtests/; workflows/ci.yml, ISSUE_TEMPLATE/
```

Editable sources (`.aseprite`, `.tmx`, `.wav`, DAW projects, vendor packs) live in the private sibling repo `mogli-art-src` (8.3); the game repo holds only runtime exports.

### 3.2 Module ownership

| Module | Responsibility | Phaser |
| --- | --- | --- |
| `src/main.ts`, `game/config.ts` | Create the game once; renderer, 320x180, scale mode, physics (`fixedStep`, `fps: 60`), `activePointers: 3`, gamepad, audio; expose `window.__game` only when `import.meta.env.DEV \|\| import.meta.env.VITE_E2E` | yes |
| `scenes/BootScene.ts` | Load `game/manifest.json`, fonts and the shared pack; loading bar; attribution card 2 s; set `canvas.dataset.ready = '1'` | yes |
| `scenes/TitleScene.ts`, `MapScene.ts` | "Press any key / Toque para começar" audio unlock; Continue, New Game, Options, Extras, Language; slot picker; tier pick; credits; storybook map pages with stamps | yes |
| `scenes/PlayScene.ts` | The only gameplay file that touches Phaser objects: builds bodies and sprites from a `LevelDefinition`, owns the `worldstep` tick, copies logic state to sprites, owns the camera and level audio cues; hosts levels, bosses, Honey Hollow and the Spring Running from data | yes |
| `scenes/play/factories.ts` | Sprites, bodies, colliders and pools for PlayScene; no branching on game state | yes |
| `scenes/HudScene.ts` | Parallel scene launched by PlayScene: the top-row HUD, boss phase dots, the S8 card panel (288x120 px), toasts, touch controls, pause overlay, F3 overlay; subscribes to events once, unsubscribes on shutdown | yes |
| `systems/input.ts` | Its own `window` `keydown`/`keyup` listeners read by `KeyboardEvent.code` (not `this.input.keyboard`, which keys by `keyCode`), gamepad polling, touch pointers; one raw `InputSnapshot` per tick; remapping | yes |
| `systems/camera.ts`, `audio.ts`, `pause.ts`, `events.ts` | Follow, bounds, deadzone, rounding, the slider-scaled shake; unlock, music per zone, SFX sprite, volumes; the single pause owner; the typed event bus (3.4) | yes |
| `systems/save.ts`, `i18n.ts` | localStorage read and write in try/catch, in-memory fallback, 3 slots, settings; current language, `t(key, params)`, container check in dev builds | storage only |
| `logic/player/PlayerController.ts`, `jumpCurve.ts` | S1: the state machine, frame counters, corner correction, step-up, ledge grab, climb, swing, interact ring; v0 = 2h/t and g = 2h/t² from 56 px and 0.35 s, fall multiplier 1.6 | no |
| `logic/projectiles/Projectile.ts`, `logic/enemies/scripts.ts` | S2: one class with parameter sets (nut, clod, enemy nut, coin, quill, boss coin cluster, coin dust); S3: Charger, Lobber, Turret, Diver with flags team, carrier, flee, stunned, contactDamage, and the telegraph timeline | no |
| `logic/platforms/PathFollower.ts`, `logic/triggers/TriggerVolume.ts` | S4: waypoint mover with flags carry, swing, crumble, bounce, advanceOnHit, sineEase; S5: truce, slowWater, safeWater, tallGrass, detect, card, door, checkpoint, pit | no |
| `logic/collectibles/Collectible.ts`, `ExitNpc.ts` | S6: moon-stone, King's jewel (pouch and bank), resting wolf (rally); exit character states inactive, beckon, touch-to-exit | no |
| `logic/boss/BossMachine.ts`, `logic/cards/cardSchedule.ts` | S7: phases, attacks, recovery windows and hit counting from data; S8 scheduling (skippable after 1 s, at most one card between beats) | no |
| `logic/level/levelData.ts` | Parse the Tiled JSON object layer into a validated `LevelDefinition`; reject missing properties by object id | no |
| `logic/rules/*.ts` | 15 stones and the 8 / 10 / 12 quota chain; the tier table; 6 leaf pips; 3 lives and the 6:00 clock; the 3-slot cycle, ember meter and garlic row | no |
| `logic/save/schema.ts`, `migrations.ts`, `logic/diagnostics.ts` | Save and settings types, validation, the migration chain; the "Copy diagnostics" JSON (11.1) | no |
| `data/*.ts` | Every D09 constant with its unit in the name (`RUN_SPEED_PX_S = 96`); level manifest, enemy entries, boss tables, throwable rows, helper rows, card keys | no |

### 3.3 The three architecture rules

1. A file under `src/game/logic/` or `src/game/data/` never imports `phaser`, `window` or `document`. A Vitest guard greps every logic file for `from 'phaser'` and fails if it appears. This is what makes the rules testable in `environment: 'node'`, where Phaser cannot run (docs/RESEARCH.md §8).
2. `PlayScene.ts` is the only gameplay file that touches Phaser objects. It stays thin because it does three things: build bodies and sprites from data, run the tick of 4.2, copy logic state to sprites. When it passes about 600 lines, a rule has leaked in and moves to `logic/`, never the reverse. The factories in `scenes/play/` count as part of PlayScene and contain no branching on game state.
3. `HudScene` is a parallel scene (`this.scene.launch('HUD')` from PlayScene) that reads events and the registry only. It never touches a body, and PlayScene never draws HUD text; the card panel, toasts and touch controls live there so a level swap never rebuilds them.

### 3.4 Event names

Typed in `systems/events.ts`; the HUD subscribes in `create` and unsubscribes in `shutdown`; names are `domain:event`.

| Event | Payload | Consumed by |
| --- | --- | --- |
| `player:stateChanged`, `player:healthChanged`, `player:respawned` | previous, next, reason, tick; pips 0-6, delta, cause; packstoneId, deaths | HUD, audio, save (death count) |
| `stones:collected`, `stones:quotaMet`, `stones:fullMoon` | count, total 15, index, kind; quota, exitCharacter (once per level); levelId | HUD counter and rising-pitch chime; gold flip, silhouette 3 s, toast 2 s, sting, Chil; results card |
| `pouch:changed`, `rally:changed`, `ember:changed`, `throwable:changed` | inHand, banked; rallied, paws; seconds, cap, lit; slot, count | HUD |
| `checkpoint:saved` | packstoneId, slot | HUD lit print, Grey Brother pop-up |
| `boss:phaseChanged`, `boss:hit`, `boss:defeated` | phase, hits, paws | HUD dots, cards, map |
| `card:show`, `card:dismissed`, `level:started`, `level:completed` | cardKey; levelId, timeMs, deaths, stones | HUD panel and pause of the tick; map stamps, results card, save |
| `settings:changed`, `retro:livesChanged`, `retro:clockTick` | key, value; lives; secondsLeft | Audio, HUD, input |

### 3.5 Object pooling

| Pool | Size | Why |
| --- | --- | --- |
| Player nuts; player clods | 3; 4 | The nut rule caps 3 on screen (1 throw per 0.25 s); 4 clods in flight is the observed maximum |
| Enemy projectiles (nuts, coins, quills, coin dust) | 16 | Three rim langurs on a 2.0 s cycle plus quill pairs never exceed 12 live |
| Shadow discs; boss coin clusters; dust puffs and sparkles | 16; 6; 16 | One per lobbed projectile, two for a bouncing coin; three marked spots per toss; clod bursts, boss landings, pickup sparkles |

Moon-stones (15), pack-stones, enemies and platforms are placed objects created once per level from the `LevelDefinition` and reset on respawn, not pooled. Pools are pre-allocated in `create`; a Vitest test asserts the logic tick allocates no new arrays in a steady state.

### 3.6 Scene flow

Boot (attribution 2 s, language from the browser prefix `pt`) -> Title (audio unlock; Continue, New Game, Options, Extras, Language) -> slot picker (3 slots showing tier, zone and moon-stone total) -> tier pick (Cub / Wolf / Lone Wolf, "8 of 15") -> Map (storybook pages) -> Play with HUD (intro card, level, quota sting, exit cinematic, results card, Honey Hollow on Full Moon) -> Map -> boss intro card -> Play (boss) -> victory cards -> Map. After B4 the map turns to its last page: the Spring Running (PlayScene with the HUD hidden and no collectibles), the Outsong over the credits, and at 100% the In the Rukh tableau on the back cover. Pause is one screen with Resume, Restart from checkpoint, Assist, Options and Map on keyboard, gamepad and touch.

## 4 Simulation and tick rules

### 4.1 Physics configuration

```typescript
physics: { default: 'arcade', arcade: { gravity: { y: 0 }, fixedStep: true, fps: 60, debug: import.meta.env.DEV } },
```

In `PlayScene.create`: `this.physics.world.TILE_BIAS = 16;` (equal to the tile size, the documented sweet spot; it stops a 400 px/s fast fall, 6.7 px per step, from tunneling through 16 px tiles). `fixedStep: true` is mandatory: with `false`, `fps` and `timeScale` are ignored and the simulation would follow the display rate. Assist Mode's game speed 50-100% sets `this.physics.world.timeScale = 100 / speed` (an Arcade World property; with `fixedStep: true` it stretches the accumulator so fewer identical 1/60 s steps run per second) and never touches `fps`; every timer still counts ticks, so collision and windows are identical at every speed (verify in M0); cosmetic tweens read the same factor.

Gravity ownership: world gravity is 0 and the tick writes a per-body vertical gravity every step (`body.setGravityY`; Arcade adds the body's `gravity` vector to the world's). The player's value is 914 px/s² while rising, 457 px/s² in the apex band and 1,462 px/s² while falling (1.6 x 914; about 1,460 in D09). A nut carries 0.25 x 914, about 229 px/s²; a clod flies straight with 0 gravity for its 9 tiles; a climbing or swinging player has `allowGravity` false. Nobody integrates gravity or velocity by hand; a value written for step n applies in step n+1, which is why the tick runs after the step.

Moving platforms (S4) are Arcade sprites with `immovable = true` and `allowGravity = false`, moved by the tick along their path. Arcade's default body `friction` of (1, 0) carries a rider horizontally; the vertical carry (Kaa's coils, the head-lift, Hathi's sons) is applied in the tick by adding the platform's vertical delta to the rider standing on it. This is the "Arcade moving-platform carry" item of the verify-in-M0 list; the fallback is straight-line coils with a coil sprite.

### 4.2 The tick: one physics-step listener drives gameplay

`this.physics.world.on('worldstep', this.onTick, this)` is registered in `create` and removed in `shutdown`. Arcade dispatches it after the bodies and colliders of a step have updated and passes the step's delta in seconds (1/60 s here; it fires 60 times per simulated second whatever the display does: about twice per rendered frame on a 30 Hz display, on fewer than half the frames at 144 Hz, and several times in the frame after a short stall, which is the point). Collider and overlap callbacks only record contacts into a per-step list. The listener runs, in this order:

1. Read the raw `InputSnapshot` written by `systems/input.ts` since the last tick and derive pressed, held and released edges (4.6).
2. Age every frame counter by one (coyote, buffer, apex band, invulnerability, telegraphs, recovery windows, ember meter, Retro clock, interact ring).
3. Read the authoritative body positions, `blocked` and `touching` flags and the recorded contacts.
4. Run `PlayerController.step`, then the S3 scripts, S4 path followers, S5 triggers, S6 collectibles, S7 boss machine and S2 projectiles, all pure, all returning new state plus events.
5. Resolve hits once: at most one damage event per target per tick; a stomp (player falling, feet above the enemy's top edge minus 4 px, GDD §7.4) beats a contact hit; a boss takes a projectile only inside its recovery window.
6. Write velocities, gravity, body sizes (12x22 standing, 12x14 crouched, feet fixed) and enable flags for the next step; publish the tick's events. The save system writes on `checkpoint:saved`, `level:completed`, `settings:changed` and on the game's HIDDEN event (4.4), never on unload.

Every gameplay timer counts ticks on this listener, so a 0.5 s wind-up is exactly 30 steps and a 1.0 s Cub recovery window exactly 60. Scene `update` never advances them.

### 4.3 Presentation in scene update

`PlayScene.update(time, delta)` does presentation only: copy logic state to sprite frames and flips, play or stop animations, advance cosmetic tweens and particles on scene time, round sprite positions to whole pixels, update the camera, feed the debug overlay. It reads no input and mutates no logic state. A cosmetic effect may be smoother than the simulation, but its dangerous appearance always follows the authoritative phase (a quill is drawn only while its body is active).

### 4.4 Pause, tab-hidden and stalls

| Situation | Behavior |
| --- | --- |
| Pause menu; card shown | `systems/pause.ts` pauses PlayScene and its physics world, clears every held input, freezes all counters (Retro clock included), keeps HudScene running for the menu; a card pauses the tick the same way, cosmetic animation continues, skippable after 1 s |
| Tab hidden or window blur | The game's `Phaser.Core.Events.HIDDEN` and `BLUR` events call the same pause; the save system writes the settings record and the checkpoint snapshot on hidden (`beforeunload` is unreliable on phones) |
| Tab visible or focus regained | `VISIBLE` and `FOCUS` show the Resume overlay; the game never resumes by itself |
| Long stall while visible (more than 250 ms of wall-clock time between two ticks, measured with `performance.now()` in `onTick`; Phaser clamps and smooths the frame delta, so the stall is invisible in `delta`) | Pause at the next tick and show Resume; the simulation never advances a large wall-clock interval at once |
| Audio | `this.sound.pauseOnBlur = false`; `systems/pause.ts` pauses music on HIDDEN/BLUR and resumes it only on Resume (Phaser's default would also resume on focus; verify in M0) |

### 4.5 Sub-pixel rounding

`pixelArt: true` forces nearest-neighbor textures and `roundPixels`, and the camera gets `setRoundPixels(true)`; sprites draw on whole pixels while bodies keep float positions. Two rules keep floats from drifting: the tick snaps a resting body (`onFloor()` and horizontal speed 0) to whole pixels, which also masks issue #7252, and spawn positions from Tiled are rounded at load. Camera scroll is rounded to whole base pixels every frame; lerp and deadzone are allowed because the output is rounded.

### 4.6 Deterministic input sampling

Input events arrive between ticks: `systems/input.ts` attaches its own `keydown`/`keyup` listeners on `window` and reads `event.code` (WASD stays positional on other layouts; Phaser's Keyboard plugin identifies keys by `keyCode`, so it is not used for gameplay binding), calling `preventDefault` for bound codes while the canvas has focus and leaving `this.input.keyboard` unused except for menu text entry (verify in M0 that Phaser's own keyboard captures do not swallow the events); gamepad state polled once per tick from the standard mapping (D-pad buttons 12-15, jump button 0, deadzone 0.25, the pad invisible until its first press), and up to 3 simultaneous touch pointers (`activePointers: 3`) resolved against on-screen buttons with hit areas larger than the art. `systems/input.ts` folds them into one `InputSnapshot` of abstract actions (left, right, up, down, jump, throw, item, cycle, pause); interact is derived in the tick from Down held at an interact volume (GDD §4.1). The tick reads the snapshot once at its start and derives edges, so a press that lands between two ticks is seen exactly once on the next tick, on every device, at every render rate. Left and right together give zero horizontal intent. Bindings are persisted in the settings record.

### 4.7 Forgiveness rules as frame counters

| Rule | Counter | Set to | Decrement | Consumed when |
| --- | --- | --- | --- | --- |
| Coyote time | `coyoteFrames` | -1 (inactive) at spawn and respawn; 6 on the tick the player leaves a floor without jumping | 1 per tick to -1 | A jump starts while it is at or above 0; set to -1 by any jump, a ledge drop or a creeper release |
| Jump buffer | `bufferFrames` | -1 (inactive) at spawn and respawn; 6 on a jump press edge while airborne | 1 per tick to -1 | The first grounded tick while at or above 0 starts a jump and sets it to -1 (holding never re-fires) |
| Apex hang | `inApexBand` | true while `abs(vy) < 32 px/s` and jump held | none | Gravity written as 457 instead of 914 while true |
| Jump cut and fast fall | `jumpCutDone`; `fastFall` | false at launch; true while down held and airborne | none | On jump release while vy < 0: vy *= 0.5 once; fall cap 400 px/s instead of 320 |
| Corner correction and step-up | spatial | 4 px each | none | Rising into a ceiling corner with at most 4 px overlap and free space beside: shift x past the corner, keep vy; moving into a lip at most 4 px above the feet: lift the body onto it, keep vx |
| Ledge grab | `grabLock` | 15 (0.25 s) after a drop from the same ledge | 1 per tick | Capture within 6 px horizontal and 8 px vertical of a solid tile's top lip while falling, input toward it, Down not held (derived from the `ground` layer at load, no authored marker) |
| Interact ring | `interactFrames` | 0 on crouch-hold at a target | +1 per tick while held | Fires at the target's requirement (15 frames for the 0.25 s hut doors, 30 for 0.5 s gates, 48 for the 0.8 s ropes, 120 for the 2 s B1 and B3 holds) |
| Invulnerability after a hit | `iFrames` | 60 (1.0 s) | 1 per tick | Blocks further non-fatal damage; pits and deep water ignore it; a 4 Hz sprite blink, or a dim outline pulse under flash reduction |

### 4.8 Per-tick values at 60 Hz

| Quantity | Per second | Per tick | Note |
| --- | --- | --- | --- |
| Run; walk | 96; 48 px/s | 1.6; 0.8 px | 6 tiles/s |
| Ground acceleration / braking / turn braking | 900 / 1,200 / 1,800 px/s² | 15 / 20 / 30 px/s per tick | 0 to run in 0.107 s, run to 0 in 0.08 s; air values 585 / 780 / 1,170 (65%) |
| Jump launch; horizontal boost | 320 px/s upward; 32 px/s once | 5.33 px | Height 56 px (3.5 tiles), apex at 0.35 s = 21 ticks |
| Rising / apex / falling gravity | 914 / 457 / 1,462 px/s² | 15.2 / 7.6 / 24.4 px/s per tick | Fall from apex height takes about 0.28 s |
| Max fall / fast fall | 320 / 400 px/s | 5.33 / 6.67 px | Both under 16 px, so no tunneling with `TILE_BIAS` 16 |
| Climb; swing period; coyote and buffer | 64 px/s; about 1.6 s; 100 ms | 1.07 px; 96 ticks; 6 ticks | Release at the forward apex clears 4 tiles; at run speed the coyote overhang is about 10 px (9.6 px) |
| Horizontal reach at full run | about 5.5 tiles | | Estimate: 0.35 s rise + about 0.28 s fall + about 0.08 s apex hang, about 0.71 s of air time at 96-128 px/s, gives 4.5-5.5 tiles plus the 12 px body; the gym level measures it |

## 5 Data contracts

### 5.1 Tiled map requirements

| Requirement | Value | Why |
| --- | --- | --- |
| Editor and export | Tiled 1.12.2, orthogonal, finite, 16x16 tiles; JSON (`.tmj`) into `public/game/maps/`, loaded with `this.load.tilemapTiledJSON(key, url)` | First-party parser |
| Tilesets | Embedded in the map (never external `.tsx`/`.tsj`), single image, name identical to the `addTilesetImage` argument, extruded 1-2 px with matching margin and spacing | External tilesets and image collections are unsupported |
| Layer format, flips and type | CSV (or uncompressed base64); horizontal flips only, no rotations; standard `TilemapLayer` via `map.createLayer`, never with the `gpu` flag | Compressed layers are skipped with a warning; issues #7382 and #7317 |
| Text | Never in the map; every card, toast and sign is a `textKey` resolved by `systems/i18n.ts` | EN and PT-BR parity |
| Size caps | L1 about 35 screens (about 7,900 tiles); L2-L8 40-50 screens (9,000-11,000 tiles); one screen is 20 x 11.25 tiles | GDD authoring rules |
| Validation | `tools/validate-levels.mjs` runs in `npm run build`: unknown object type, missing required property, duplicate id, a stone `order` gap, a pack-stone inside a trigger, or a map over its cap fails the build with the object id; a tile with the vertical (0x40000000) or diagonal (0x20000000) flip bit fails the build with the layer name and tile index | Fail early |

### 5.2 Layer and property conventions

Tile layers `bg`, `ground` (tile property `collides: true`; `oneWay: true` clears the down, left and right faces at load; `climbable: true` marks creeper and tree-road tiles, a column of at least 2 tiles, `climbableH: true` for horizontal tree-roads) and `fg`; object layers `entities` (everything below) and `markers` (camera bounds, parallax anchors). Every object has a unique Tiled `id`; rectangles for volumes and platforms, points for spawns and stones. The loader builds the S1 climb and grab volumes from `climbable` tiles; `validate-levels.mjs` rejects a climbable column shorter than 2 tiles.

| `type` | Required properties | Notes |
| --- | --- | --- |
| `spawn`, `packstone` | `facing` (1 or -1); `checkpointId`, `spawnFacing` | Body center x, feet y; one pack-stone before and after every twist and before every boss door |
| `stone` | `order` (1-15, unique), `kind` (`path`, `branch`, `secret`), `skin` (`moon`, `jewel`, `wolf`) | `order` is the designer-set order Chil follows; secrets never hold quota stones |
| `exit` | `character` (`akela`, `kaa`, `hathi`, `greyBrother`, `thuuGate`, `phao`), `exitCard` | S6 ExitNPC: inactive, beckon, touch-to-exit |
| `enemy` | `entry` (1-8), `patrolLeft`, `patrolRight`, `facing`; optional `flags` (`carrier`, `team`, `passive`) | Script and numbers come from `data/enemies.ts` by entry |
| `platform` | `path` (polyline id), `speedPxS`, `flags` (`carry`, `swing`, `crumble`, `bounce`, `advanceOnHit`, `sineEase`), `periodS`, `waitS` | S4; a swing is a pendulum with period 1.6 s |
| `trigger` | `flag` (`truce`, `slowWater`, `safeWater`, `tallGrass`, `detect`, `card`, `door`, `checkpoint`, `pit`), optional `textKey`, `word` | S5; `pit` respawns at the last pack-stone |
| `bunch`, `pile` | `drop` (`stone`, `clods`, `firePot`, `flower`); `item` (`clods`), `count` (5) | Any throw drops the bunch item; a `flower` restores 1 pip, at most 3 per level (GDD §7.5); clod piles from L3 on |
| `helper`, `altar`, `bossDoor`, `card` | `kind` (`chil`, `kaa`, `hathiSon`, `buffalo`, `rama`, `greyBrother`, `messua`), `path`; none; `bossId`; `textKey`, `once` | Helpers are data on S3-S6; the altar is the L6 bank point |

Example object list for the first beat of L1 Council Rock (positions in tiles; the loader converts to pixels):

| id | type | x, y | Properties |
| --- | --- | --- | --- |
| 1 | spawn | 4, 62 | facing 1 |
| 2 | stone | 12, 60 | order 1, kind path, skin moon |
| 3 | stone | 19, 58 | order 2, kind path, skin moon |
| 4 | bunch | 24, 54 | drop stone (teaches the upward throw) |
| 5 | stone | 31, 61 | order 3, kind path, skin moon |
| 6 | enemy | 27, 55 | entry 1 (langur), patrolLeft 27, patrolRight 27, facing -1 |
| 7 | trigger | 34, 63 (w 4, h 3) | flag pit |
| 8 | packstone | 40, 60 | checkpointId l01-cp1, spawnFacing 1 |
| 9 | card | 2, 62 (w 2, h 3) | textKey card.l1.intro, once true |

### 5.3 Level manifest

```typescript
export interface LevelEntry {                                     // src/game/data/levels.ts
  id: 'gym' | 'L01' | 'L02' | 'L03' | 'L04' | 'L05' | 'L06' | 'L07' | 'L08' | 'spring' | 'honey1';
  zone: 0 | 1 | 2 | 3 | 4; titleKey: string; map: string;        // 'game/maps/l01-council-rock.tmj'
  tileset: string; palette: 'day' | 'night' | 'dim' | 'spring'; music: string; ambience?: string;   // Tiled name = texture key
  quotaRule: 'standard' | 'bank' | 'rally'; stones: 15;           // 'bank' only L06, 'rally' only L08
  exitCharacter: string; introCard: string; exitCard?: string; bossAfter?: 'B1' | 'B2' | 'B3' | 'B4';
  targetMinutes: number; checkpoints: number; hud: 'full' | 'none';   // L01 4.5 min and 3; others 6, 5.5, 6, 5.5, 6.5, 5.5, 5.5 min and 4; 'none' for the Spring Running
}
```

`data/bosses.ts` carries phases, attacks, wind-up and active seconds, recovery windows per tier (standard 1.0 / 0.6 / 0.4 s, heavy 1.2 / 0.8 / 0.5 s), hits per phase 2 / 3 / 4 and the arena map, transcribed from the GDD boss sheets, never a second design.

### 5.4 Save schema with version and migration chain

Keys: `seeonee.save.v1.slot1`, `.slot2`, `.slot3` and `seeonee.settings.v1`. One JSON document per slot, a few kB, written atomically (stringify fully, then one `setItem`) with a `.backup` copy of the last good document.

```json
{ "version": 1, "createdAt": "2026-10-04T20:15:00Z", "updatedAt": "2026-10-04T21:02:11Z", "playtimeSeconds": 2831,
  "tier": "wolf", "retro": false, "assistUsed": false, "zoneUnlocked": 1, "bosses": { "B1": false, "B2": false, "B3": false, "B4": false },
  "levels": { "L01": { "cleared": true, "stonesMask": 32767, "fullMoon": true, "bestTimeMs": 268000, "deaths": 3 } },
  "checkpoint": { "levelId": "L02", "checkpointId": "l02-cp2", "stonesMask": 1055, "pouch": 0, "clods": 0, "emberSeconds": 8, "garlicSeconds": 0, "gates": [14, 22], "deaths": 2, "elapsedMs": 143000, "retroLives": 3, "retroClockSeconds": 360 },
  "honeycombs": 12, "palettesUnlocked": [], "cardsSeen": ["card.l1.intro", "card.l1.exit"], "lawCards": 1, "endingSeen": false, "tableauSeen": false }
```

`stonesMask` is 15 bits, one per stone `order`; a collected stone is never lost, so the level mask is the union of every attempt. The checkpoint snapshot stores what survives a respawn: the session mask, the L6 pouch, clods, the ember and garlic meters, opened gates (Master Words gates, cut ropes and hut doors, by Tiled object id), deaths and elapsed time for the results card, and Retro lives and clock. Nothing referencing a Phaser object is serialized.

Migration chain in `logic/save/migrations.ts`: `MIGRATIONS: Array<(raw: unknown) => unknown>` indexed by source version; `load()` parses, reads `version`, applies `MIGRATIONS[version]` upward to the current version, then validates types and referenced ids. Version 0 (no `version` field) maps to 1 by filling defaults. A document that still fails validation moves to the backup key, the slot shows "Could not read this save" and New Game asks before replacing it. Vitest runs the chain on fixtures under `tests/unit/save/fixtures/` (one per historical version plus truncated, null-field and wrong-type files). Every `getItem` and `setItem` sits in try/catch: a `QuotaExceededError` or a private-window accessor throw switches the slot to in-memory mode with a one-line HUD notice. Saves happen on `checkpoint:saved`, `level:completed`, `settings:changed` and on tab hidden, never on unload.

### 5.5 i18n dictionary shape and parity test

```typescript
export const en = { 'hud.find': 'Find {name}', 'hud.banked': 'banked {n}/{q}', 'hud.rallied': 'rallied {n}/{q}', 'menu.continue': 'Continue',
  'tier.cub': 'Cub', 'card.l1.intro': 'Oh, hear the call!--Good hunting all / That keep the Jungle Law!' } as const;   // src/i18n/en.ts
import type { en } from './en';                                                                                         // src/i18n/pt-BR.ts
export const ptBR = { 'hud.find': 'Encontre {name}', 'hud.banked': 'guardadas {n}/{q}', 'hud.rallied': 'reunidos {n}/{q}',
  'menu.continue': 'Continuar', 'tier.cub': 'Filhote', 'card.l1.intro': '...' } satisfies Record<keyof typeof en, string>;
```

`satisfies` makes a missing PT-BR key a compile error; the Vitest parity test adds what the type system cannot: no extra keys in `pt-BR.ts`, no empty strings, identical `{placeholder}` sets per key, no card over 120 characters, every `textKey` used in a map present in `en.ts`. Containers are sized for PT-BR plus 10% (measured expansion is +18-21%, so PT-BR strings are written to fit, never the font shrunk); a dev-build check measures every HUD string with the bitmap font and logs any that exceeds its region (top-left 8-80 px, center 120-200 px, right 240-312 px, the 288x120 card panel). The language toggle is persisted in the settings record and applies everywhere at once; the boot screen picks PT-BR when the browser language starts with `pt`. PT-BR strings are written from the Gutenberg text (D12); the GDD glossary's coinages are proofread in M5.

### 5.6 Asset manifest and CREDITS generation

`public/game/manifest.json` is the single source for the loader, the credits screen and the license files, one entry per shipped asset:

```json
{ "id": "laredgames.platform-character", "kind": "aseprite", "files": ["game/sprites/hero.png", "game/sprites/hero.json"], "pack": "zone1", "placeholder": false,
  "license": { "title": "Platform character Free", "author": "La Red Games", "source": "https://laredgames.itch.io/coins-free", "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/", "modified": "recolored to Seeonee-40, redrawn into Mowgli, new climb and throw frames", "aiAssisted": false, "downloaded": "2026-10-12" } }
```

`kind` is one of `image`, `atlas`, `aseprite`, `tilemap`, `audio`, `audioSprite`, `bitmapFont`; `pack` is `shared`, `zone1`-`zone4`, `ending` or `bonus` and drives per-zone loading; audio entries list both `.ogg` and `.m4a`; third-party ids are prefixed with the pack slug so provenance is greppable. `tools/gen-credits.mjs` writes `CREDITS.md` in TASL format (Title, Author, Source, License with URL, modifications, AI-assisted flag) grouped by license, copies each vendor license text into `licenses/<slug>/`, and fails `npm run build` if a file under `public/game/` has no entry, an entry points at a missing file, or (at M6) any entry has `placeholder: true`. `dist/licenses.txt` (code dependencies, Phaser MIT included) comes from rollup-plugin-license on every build; the credits screen links both.

### 5.7 Settings schema

```typescript
export interface Settings {
  version: 1; language: 'en' | 'pt-BR'; audio: { music: number; sfx: number };    // 0-100 each
  video: { scale: 'pixel' | 'fill'; shake: number; flashReduction: boolean };     // shake 0-100
  controls: { keyboard: Record<Action, string>; gamepadGlyphs: 'auto' | 'xbox' | 'playstation' | 'nintendo'; touchPreset: 'compact' | 'wide'; touchOpacity: number };   // KeyboardEvent.code values; opacity 20-80
  assist: { speed: 50 | 60 | 70 | 80 | 90 | 100; invincible: boolean; infiniteClods: boolean; chilEverywhere: boolean; crouchToggle: boolean };
  retro: boolean; telemetry: 'unset' | 'on' | 'off';                               // telemetry only if 11.2 ships
}
```

Settings survive New Game and slot deletion; Assist and Retro apply to the next level start; the game speed applies immediately because it only sets `physics.world.timeScale`.

## 6 Presentation pipeline

### 6.1 Scale configuration for integer zoom

```typescript
width: 320, height: 180, pixelArt: true, backgroundColor: '#0b1410',
scale: { mode: Phaser.Scale.NONE, zoom: Phaser.Scale.MAX_ZOOM, autoCenter: Phaser.Scale.CENTER_BOTH, autoRound: true },
```

`MAX_ZOOM` returns an integer of at least 1, so a 1920x1080 window renders at 6x, 1280x720 at 4x, 2560x1440 at 8x and a 1366x768 laptop at 4x with a letterbox. `systems/camera.ts` listens to the window resize and calls `this.scale.setMaxZoom()` so the zoom follows the viewport. The optional "fill screen" toggle for phones switches to `Phaser.Scale.FIT` with `CENTER_BOTH`, which produces non-integer factors; whether `zoom` is ignored in FIT is inferred rather than documented, so the toggle is the last item on the M0 verify list. Portrait phones get a CSS "rotate your device / gire o aparelho" overlay via `@media (orientation: portrait)` sized with `dvh`. At DPR 2 or 3 an integer CSS zoom is still an integer number of device pixels; HUD text must read at 1x because a landscape phone lands on zoom 2-3.

### 6.2 Camera

`this.cameras.main.startFollow(player, true)` (round pixels), `setRoundPixels(true)`, `setBounds` to the map size from the `markers` layer, a dead zone of 64x40 px and a look-ahead of 40 px in the facing direction eased over 0.25 s and reversed only after 0.15 s of running the other way, a 24 px vertical dead band that snaps to the new floor over 0.2 s, and a 48 px pan on Up or Down held 0.5 s while standing (GDD §11.1); clamped so no required landing is off-screen before takeoff. The scripted Shere Khan roar is `camera.shake` for 2 s at an amplitude scaled by the 0-100% slider; flash reduction replaces every full-screen flash with a 2-frame vignette. Vertical levels (L2 70x140, L6 80x125) add a 32 px downward look-ahead while falling so landings are visible.

### 6.3 Bitmap fonts with the Latin-1 charset

m5x7 (Daniel Linssen, CC0) is the primary font for HUD, cards and menus at 16 px; Silkscreen Regular (SIL OFL 1.1) at 8 px is the fallback if m5x7 fails the M0 width test; Press Start 2P (SIL OFL 1.1) is used for the all-caps wordmark only (GDD §14.2). Every font is converted once to a bitmap font atlas (`.png` plus the font data in BMFont XML format; Phaser's `bitmapFont` loader expects the font data as XML, so a `.fnt` file only if it contains XML) with ASCII 0x20-0x7E, the Latin-1 Supplement U+00A0-U+00FF (every PT-BR diacritic and the guillemets), plus U+2013 (en dash), U+2018-U+201D (typographic quotes) and U+2026 (ellipsis), the same set as GDD §14.2, extruded 1 px, and loaded with `this.load.bitmapFont`. A converted OFL atlas is a Modified Version, so the atlases are named `font-silk-bitmap` and `font-pressstart-bitmap` and `licenses.txt` carries each OFL text and copyright line. Canvas text objects are never used in gameplay scenes: they blur at integer zoom and cost a texture upload per change.

### 6.4 Atlas rules

| Family | Tool and format | Rules |
| --- | --- | --- |
| Characters (Mowgli, enemies, bosses, helpers) | Aseprite File > Export Sprite Sheet: packed, trim off, JSON array, tags exported; `this.load.aseprite` and `this.anims.createFromAseprite`; tag names are animation keys (`idle`, `run`, `jump`, `fall`, `climb`, `crouch`, `throw`, `hurt`, `interact`, `flee`) | Every frame of one entity in one fixed cell (Mowgli 32x32, small enemies 16x16 or 32x32, Shere Khan 64x32, Thuu 48x48 segmented, at most 96x96) so hitboxes never jump between frames; 1 px transparent padding |
| Items, UI, props | free-tex-packer, Phaser JSON hash, 2 px padding, extrude 1, max 2048x2048, `this.load.atlas` | One atlas each: `ui-hud`, `items`, `props-zoneN` |
| Tilesets | One image per zone tileset (about 120 tiles plus the night or dim subset) through tile-extruder at 1-2 px; margin and spacing set in Tiled to match | Never packed into an atlas; `addTilesetImage(name, key)` with the Tiled name |
| Backgrounds | One PNG per parallax layer at 320x180 (480x180 for wide layers), drawn as a tile sprite | Indexed PNG, Seeonee-40 only |

Four to six atlases per zone keep reloads small; every atlas stays at or under 2048x2048 for iOS memory. Each zone ships 3 parallax layers (4 for Zone 1, which has the tree-road canopy) as tile sprites with scroll factors 0.2, 0.4 and 0.6, scrolled by the rounded camera position so they never shimmer. Times of day are palette subsets of the zone tileset (D08): the night subset of Zone 1, the three heat bands of L3 and the dim subset of L6 are separate tileset images exported from one Aseprite source with a swapped palette, never a lighting system or a mask. Every cobra, quill, hive and bee cloud is drawn with the same visibility as the floor.

### 6.5 Audio pipeline

Hard rule (D10, D15): every sound ships as an `.ogg` (Vorbis) plus an `.m4a` (AAC-LC) pair, loaded as `this.load.audio(key, ['x.ogg', 'x.m4a'])` in that order. Phaser takes the first entry whose type passes `canPlayType`: Chrome, Edge, Firefox, Samsung and Android WebView take `.ogg`; Safari and iOS 18.3 or earlier fall through to `.m4a`; iOS 18.4 and macOS 15.4 and later take `.ogg`. MP3 and Opus-in-CAF are not shipped (Phaser has no `caf` device flag).

| Step | Setting |
| --- | --- |
| Authoring | BeepBox or Furnace, whole-bar loops, exported as WAV into `mogli-art-src/audio/` |
| Vorbis; AAC-LC; loop check | `ffmpeg -i loop.wav -c:a libvorbis -q:a 5 loop.ogg` for music (`-q:a 4` for SFX; never resample a loop); `ffmpeg -i loop.wav -c:a aac -b:a 160k -profile:a aac_low -movflags +faststart loop.m4a`; loops checked by ear on Chrome (Vorbis) and an iPhone (AAC), and if AAC priming shows a gap the loop is rendered twice and a marker plays the second half |
| Loudness | SFX peak-normalized to -6 dBFS; full mix -16 LUFS integrated with music stems at -18 to -20 LUFS short-term and -1 dBTP (`loudnorm` two-pass, I=-16, TP=-1.5); ambience loops 12 dB under the music (GDD §13.4) |
| SFX packaging | One audio sprite per pack (`sfx-shared`, `sfx-zoneN`) via `this.load.audioSprite` with its JSON, to cut requests |
| Unlock and volumes | No sound before the first gesture (the Title's "press any key / toque para começar"); music starts on the sound manager's `unlocked` event; check `this.sound.locked` first; music and SFX sliders 0-100 persisted; `pauseOnBlur` set to false, see 4.4 |

Music plan per D16: 4 zone themes, 1 boss theme, title, Honey Hollow and ending, 8 authored tracks (GDD §13.2), plus one ambience loop per zone. Loops of 60-90 s at about 160 kbps weigh 1.2-1.8 MB each, so music is loaded per zone, never all at once. Each zone theme's day/night (or drought/monsoon) variants plus its 2-3 vertical intensity stems (GDD §13.1) are up to 5 separate loop files at the cue's own length (GDD §13.2: Z1 about 80 s, Z2 about 74 s, Z3 about 144 s, Z4 about 70 s), so one zone's theme music alone runs from about 7 MB (Z4) to about 14.4 MB (Z3) at 20 kB/s; this per-zone figure, not the single-loop estimate above, drives the 6.6 caps and the 10.4 credit math, at medium confidence until M3.1 encodes the real files and corrects every number in one commit.

### 6.6 Payload budget

| Item | Budget on the wire (one format) |
| --- | --- |
| Code (Phaser plus game) | about 400 kB gzip |
| Shared pack (fonts, HUD, items, SFX sprite, title theme) | at most 2.5 MB |
| Zone 1 pack (tileset, night subset, parallax, sprites, Zone 1 theme, ambience); first load in total | at most 11 MB; at most 14 MB |
| Each later zone pack; whole `dist` per audio format | at most 15.5 MB; at most 55 MB |

## 7 VS Code setup and daily workflow

### 7.1 Install and create the project from the Phaser Vite TypeScript template

Install VS Code, Git for Windows, Node 24 (nvm-windows `nvm install 24` then `nvm use 24`, or the official installer), Tiled 1.12.2, Aseprite or Pixelorama, and ffmpeg. Check with `node --version` (v24.x expected; v22.15.0 also works) and `npm --version`. If PowerShell blocks `npm.ps1`, use `npm.cmd` or a Command Prompt terminal. The repo folder already exists (`C:\Users\diego\Documents\Development\Games\mogli`, branch `main`, no commits, `README.md` and `docs/` untracked). Run in a VS Code terminal:

```powershell
cd C:\Users\diego\Documents\Development\Games\mogli
git clone --depth 1 https://github.com/phaserjs/template-vite-ts.git .\_template
Get-ChildItem .\_template -Force -Exclude .git | Copy-Item -Destination . -Recurse -Force
Remove-Item -Recurse -Force .\_template
npm install
npm install --save-exact phaser@4.2.1
npm install -D vite@~8.3.1 typescript@~7.0.2 vitest@~5.0.2 @playwright/test@~1.63.0 rollup-plugin-license@~3.7.1
npx playwright install chromium
```

(`npx degit phaserjs/template-vite-ts .` does the same copy without history if npx can fetch it.) The template brings `index.html`, `public/assets/`, `src/main.ts`, `src/game/`, a `vite/` folder with `config.dev.mjs` and `config.prod.mjs`, and scripts `dev`, `build`, `dev-nolog`, `build-nolog`; the non-nolog scripts run a telemetry ping to phaser.io through `log.js`. It pins phaser 4.0.0, vite ^6.3.1 and typescript ~5.7.2, which is why every bump above is day-one work.

### 7.2 Template cleanup and configuration files

In order: delete `log.js` and the `-nolog` script pair (plain `dev` and `build` point at the new config); delete the `vite/` folder: Vite 8 removed the object form of `build.rollupOptions.output.manualChunks`, which the template's prod config uses, so that config fails as is; `build.rollupOptions` survives only as a deprecated alias of `build.rolldownOptions`, and Oxc replaced esbuild as the default minifier (`'terser'` remains an option if installed); the single `vite.config.ts` below replaces both template configs; move `public/assets/` to `public/game/` and delete the demo assets; set `package.json` `name` to `seeonee` (never the folder name), `private: true`, `version` `0.0.0`; keep `index.html` with `<html lang="en">`, `<title>Seeonee</title>`, a `<meta name="description">` carrying the D03 EN attribution line with none of the excluded words, a `<div id="game"></div>` body and the viewport meta `width=device-width, initial-scale=1, viewport-fit=cover`; write `.nvmrc` containing `24`; commit `package-lock.json`.

`vite.config.ts` (the whole file; the default `build.target` is kept on purpose, see 2.4):

```typescript
import { defineConfig } from 'vite'; import license from 'rollup-plugin-license'; import path from 'node:path';
export default defineConfig({
  base: '/',
  define: { __BUILD_ID__: JSON.stringify((process.env.COMMIT_REF ?? 'dev').slice(0, 7)) },
  build: { chunkSizeWarningLimit: 1600 },
  server: { port: 8080, strictPort: true },
  plugins: [{ ...license({ thirdParty: { includePrivate: false, output: { file: path.resolve('dist/licenses.txt') } } }),
              apply: 'build', enforce: 'post' }],
});
```

`COMMIT_REF` is a Netlify build variable (verify in M0; a missing value falls back to `dev`); the HUD prints `__BUILD_ID__` in a corner on Deploy Previews so testers report it. `tsconfig.json`: `target` ES2022, `module` ESNext, `moduleResolution` `bundler`, `strict` true, `noEmit` true, `types` `["vite/client"]`, `isolatedModules` true; no `baseUrl` and no `moduleResolution: node` or `node10` (removed in TypeScript 7); relative imports only. `src/vite-env.d.ts`: `/// <reference types="vite/client" />` and `declare const __BUILD_ID__: string;`, so `npm run typecheck` resolves the constant used in 7.3. `vitest.config.ts`: `test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] }`. `.editorconfig`: `root = true`; `[*]` `charset = utf-8`, `end_of_line = lf`, `insert_final_newline = true`, `indent_style = space`, `indent_size = 2`, `trim_trailing_whitespace = true`; `[*.md]` `trim_trailing_whitespace = false`. `.gitignore` adds `node_modules/`, `dist/`, `test-results/`, `playwright-report/` and the art-source rules of 8.3.

`package.json` scripts: `"dev": "vite"`, `"build": "npm run typecheck && node tools/validate-levels.mjs && node tools/gen-credits.mjs --check && vite build"`, `"preview": "vite preview --port 4173 --strictPort"`, `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:watch": "vitest"`, `"e2e": "playwright test"`, `"credits": "node tools/gen-credits.mjs"`, `"art": "powershell -File tools/export-art.ps1"`. Netlify runs `npm run build`, so typecheck, level validation and the manifest check gate every Deploy Preview too; a failed Netlify build costs 0 credits.

### 7.3 First rendering check

Replace `src/main.ts` with the following. It proves the engine loads, integer zoom works and the attribution line fits; it adds no gameplay.

```typescript
import Phaser from 'phaser';
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    this.physics.world.TILE_BIAS = 16;
    this.add.rectangle(160, 168, 320, 24, 0x2f4a2a); this.add.rectangle(64, 145, 12, 22, 0xd8a657);   // ground band; a standing body, 12x22
    this.add.text(8, 8, 'Seeonee', { fontFamily: 'monospace', fontSize: '12px', color: '#f2e9d8' });
    this.add.text(8, 24, `zoom x${this.scale.zoom}  build ${__BUILD_ID__}`, { fontFamily: 'monospace', fontSize: '8px', color: '#c7d4db' });
    this.game.canvas.dataset.ready = '1';
  }
}
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 320, height: 180, pixelArt: true, backgroundColor: '#0b1410',
  scale: { mode: Phaser.Scale.NONE, zoom: Phaser.Scale.MAX_ZOOM, autoCenter: Phaser.Scale.CENTER_BOTH, autoRound: true },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, fixedStep: true, fps: 60, debug: import.meta.env.DEV } },
  input: { activePointers: 3, gamepad: true }, scene: [BootScene] });
window.addEventListener('resize', () => game.scale.setMaxZoom());
if (import.meta.env.DEV || import.meta.env.VITE_E2E) (window as any).__game = game;
```

`src/style.css`: `html, body, #game { width: 100%; height: 100dvh; margin: 0; background: #000; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; overscroll-behavior: none; }` and `canvas { display: block; }`. Run `npm run dev`, open `http://localhost:8080`: a dark frame, a gold 12x22 rectangle on a green band, the zoom read-out (6 on a 1080p monitor) and sharp pixels when the window is resized. Bitmap fonts replace the monospace text in M1.

### 7.4 Debug overlay, level selector and the daily workflow

F3 toggles an overlay drawn by HudScene, present only when `import.meta.env.DEV || import.meta.env.VITE_E2E`: player state and its reason, body rectangle and velocity, `coyoteFrames`, `bufferFrames`, `iFrames`, tick number, last step delta, 95th-percentile frame time over the last 120 frames, zoom, level id, checkpoint id, stone mask, pool counts, and every enemy's script state and telegraph counter. `?level=gym` (or any level id) starts that level directly in dev builds, with `&tier=lonewolf`, `&retro=1` and `&cp=l02-cp2` overrides. A production build strips all of it; the Playwright spec asserts the overlay and the query string do nothing on the built output.

Daily loop: one issue, one branch (`m1/coyote-time`), one pull request. `npm run dev` with F3 and the level selector; `npm run test:watch` beside it; `npm run build` then `npm run preview` before marking anything done. The pull request triggers GitHub Actions (typecheck, Vitest, Playwright) and a Netlify Deploy Preview, opened on the desktop and on one phone before merging. Merges to `main` are batched (each production deploy costs 15 credits), at most twice a month during M1-M5. `.vscode/launch.json` uses the `msedge` (or `chrome`) `launch` request against `http://localhost:8080` with `webRoot: ${workspaceFolder}` for breakpoints in TypeScript.

## 8 Asset pipeline and licensing operations

### 8.1 Placeholder-first phases

| Phase | When | Content | Exit test |
| --- | --- | --- | --- |
| 0 Gray-box | M0-M1 | Colored rectangles plus CC0 kits (Brackeys' Platformer Bundle, Pixel Adventure 1) on the 16 px grid; jsfxr placeholder SFX; Brackeys CC0 music so audio hooks exist from day one | Feel locked in the gym level; no art decision blocks a rule |
| 1 Zone 1 dressing | M2 | Seeonee-40 tileset for the Seeonee Hills (OPP2017 under CC0 remapped, CookieEfedu CC-BY 4.0 with spacing 2), 4 parallax layers at 320x180 (Yansan as a base), the night subset | L1 reads as the Central-Indian dry forest, not a generic jungle |
| 2 Cast | M2-M3.1 | Mowgli redrawn from the La Red Games CC0 base (32x32, 30 frames), langur (Pixelsym base), Tabaqui, cobra (Elthen base as a placeholder only, never committed; the shipped cobra is redrawn from the 1894-95 plates), Akela, Grey Brother, Chil, Kaa | Every sprite passes the "Pooh red shirt" test of docs/RESEARCH.md §3.2 |
| 3 Gap animals | M3.2-M3.4 | Shere Khan, Baloo, Bagheera, Hathi and sons, buffalo, wolves and dholes per 8.6 | No cat, house pet or 1967 design tell remains |
| 4 UI and polish | M4-M5 | Kenney UI Pack Pixel Adventure pieces, storybook pages, Law cards, the tableau, final SFX (Kenney, Junkala), final music | Manifest has zero `placeholder: true` rows |

A placeholder is any manifest row with `placeholder: true`; the build refuses a release while one exists. Frame caps per animation: 6 run, 4 scatter, 2 idle gag; about 300 frames in all, 4 tilesets of about 120 tiles each.

### 8.2 Palette lock, naming and folders

One master palette, Seeonee-40: Endesga 32 minus its two cyans plus 10 derived swatches (dry-grass ochres, teak-bark gray-browns, ghost-tree whites, monsoon slate, night indigo), 40 colors in all (GDD §12.2), stored as `mogli-art-src/palette/seeonee-40.gpl` and `.ase` on day one; every imported pack is remapped in Aseprite (Sprite > Color Mode > Indexed with the palette loaded, then outline fixes) at a budget of 1-2 h per imported creature. The HUD never carries information by color alone: leaf pips change shape and fill, the counter flips gold and changes icon.

Names are lowercase kebab-case, no spaces, one extension, because Netlify's build image is case-sensitive while Windows is not; case fixes use `git mv`. Files: `tiles-seeonee-16.png`, `tiles-seeonee-16-night.png`, `hero.png` and `hero.json`, `enemy-langur.png`, `boss-shere-khan.png`, `ui-hud.png`, `bg-seeonee-l0.png` to `bg-seeonee-l3.png`, `l01-council-rock.tmj`, `sfx-shared.ogg` and `.m4a` with `sfx-shared.json`, `bgm-zone1.ogg` and `.m4a`, `amb-zone1.ogg`, `font-m5x7.png` and `font-m5x7.fnt`. Aseprite tags are the animation keys; `tools/export-art.ps1` runs the Aseprite CLI so every sheet rebuild is reproducible. A missing or mis-cased file fails the Playwright smoke test because the loader is manifest-driven. Tools and their costs are in 2.1.

### 8.3 The art-src rule: private repo, no LFS

One rule (D14): the game repo holds only runtime exports as plain git (PNG atlases, `.ogg` and `.m4a`, JSON, `.tmj`) and never uses Git LFS; editable sources (`.aseprite`, `.ase`, `.kra`, `.psd`, `.tmx`, `.wav`, `.flac`, DAW projects, vendor zips, AI prompts and raw outputs) live in the private sibling repo `mogli-art-src` as plain git with a 25 MB per-file cap (stems exported to FLAC or OGG), and a ZIP of that repo goes to Google Drive at every milestone. `GIT_LFS_ENABLED` stays unset on Netlify. If a single source ever exceeds 50 MB, it is LFS-tracked in the art-src repo only. Reason: GitHub LFS gives 10 GiB of bandwidth per month and every Netlify build re-downloads LFS objects, so a busy month would block builds or ship pointer files as images (docs/RESEARCH.md §8, correction 5). The game repo's `.gitignore` therefore lists `art-src/`, `*.aseprite`, `*.ase`, `*.kra`, `*.psd`, `*.tmx`, `*.wav`, `*.flac`, `*.als` and `*.flp`.

### 8.4 Licensing files

| File | Content |
| --- | --- |
| `LICENSE` | MIT, covering `src/`, `tools/`, `tests/`, the Vite and TypeScript configs |
| `LICENSE-ASSETS.md` | "Everything under `public/game/` and in `mogli-art-src` (graphics, audio, fonts, level data) is not covered by the MIT License: original assets are (c) Diego Araujo 2026, all rights reserved; third-party assets remain under their own licenses listed in `CREDITS.md` and `public/licenses/`. Kipling's quotations are public domain and are not claimed. The PT-BR translations and every UI string in `src/i18n/` are (c) Diego Araujo 2026 and are licensed with the code under the MIT LICENSE, stated in a header comment in both dictionary files. You may not redistribute the non-MIT assets outside this repository's build without the permissions those licenses grant." (precedents in docs/RESEARCH.md §7.8) |
| `CREDITS.md`, `licenses/<slug>/` | Generated TASL rows grouped by license (the CC-BY block is pasted verbatim into the credits screen; CC0 rows are credited anyway); the verbatim license text and README of each pack at download date, plus a screenshot of the itch.io license box for custom licenses |
| `dist/licenses.txt` | Code dependency notices from rollup-plugin-license, with the Phaser MIT notice, regenerated on every build and diffed at release; linked from the credits screen and `README.md`; its header carries the D03 attribution line |

License preference: CC0, then CC-BY (credit with link, note modifications), then custom itch.io licenses (copy the page wording verbatim; never commit a "no redistribution" raw pack to the public repo: Jesse M, rvros, Pixelsym, Admurin, carysaurus, GandalfHardcore and Oak Woods only ship as remixed atlases; Elthen's terms forbid redistributing a modified derivative even as a remixed atlas, so Elthen art is a placeholder base only, never committed to the public repo), then OFL fonts (keep each copyright line and the full OFL text; rename a converted bitmap atlas). CC-BY-SA, GPL art, NC and ND are never used. "Free" on itch.io is a price, not a license: a page without license text is all rights reserved until the author replies in writing, and the reply is kept in `licenses/<slug>/`.

### 8.5 AI-assisted art rules

Purely AI-generated output is not copyrightable in the US (docs/RESEARCH.md §7.7), so AI output is only ever a base: PixelLab or Retro Diffusion for the gap animals, parallax variations and tile variants; never for Mowgli, the HUD or anything the player stares at for hours. Every shipped AI base is hand-edited in Aseprite (palette lock, outline fixes, animation cleanup), prompts and raw outputs are kept in `mogli-art-src/ai/`, the manifest row carries `aiAssisted: true` with the tool name, `CREDITS.md` flags it, and the itch.io mirror uses the Generative AI Disclosure tag if any AI base survives into the build. Scenario's free-tier outputs are never used (personal and evaluation use only).

### 8.6 The species gap plan

No usable free side-view pixel tiger, bear or wolf exists (docs/RESEARCH.md §7.3). In order per animal: Shere Khan from a Catset cat ($19.99) palette-swapped to orange with stripes and a custom limping cycle, else a PixelLab base hand-cleaned, else one commissioned 64x32 sheet (idle, lame charge, pounce, stumble, retreat); Baloo redrawn at 48x40 from the othur. bear with the cream V, else AI base, else commission; Bagheera from the carysaurus cat enlarged to 48x24 (credit mandatory), else the Catset black cat (GDD §12.4); Kaa's head placeholder-tested against the Elthen snake, then redrawn from the 1894-95 plates for the shipped atlas (Elthen's terms forbid a modified derivative in the public repo), with coils drawn as a segmented sprite; one shared wolf sheet (Akela, Raksha, Grey Brother, Phao and the rally wolves as palette swaps) from a Catset run cycle redrawn or commissioned, with the dholes as a red-tan recolor with a shorter muzzle. Species truth matters (D08): a recolored house cat is a placeholder, never the shipped look.

## 9 Testing and CI

### 9.1 Vitest: the first 20 tests

All in `tests/unit/`, all against `src/game/logic/` and `src/game/data/`, all in `environment: 'node'`; each exists before its feature is called done.

| # | File | Asserts |
| --- | --- | --- |
| 1 | `player/jumpCurve.test.ts` | Height 56 px and apex 0.35 s give launch 320 px/s and gravity 914 px/s² within 1 unit; fall gravity 1,462 px/s² (1.6x) |
| 2 | `player/coyote.test.ts` | A jump press 6 ticks after leaving a floor starts a jump; at 7 ticks it does not; a ledge drop and a creeper release set the counter to -1 |
| 3 | `player/buffer.test.ts` | A press 6 ticks before landing fires on the landing tick exactly once; holding never fires twice; 7 ticks before is dropped |
| 4 | `player/apexHang.test.ts` | Gravity is 457 only while `abs(vy) < 32` and jump is held; 914 otherwise while rising |
| 5 | `player/jumpCut.test.ts` | Release while rising halves vy once; a second release changes nothing; release while falling changes nothing |
| 6 | `player/fallCaps.test.ts` | vy never exceeds 320 px/s; 400 px/s with down held; gravity 1,462 while falling |
| 7 | `player/airControl.test.ts` | Air acceleration 585, braking 780, turn 1,170 px/s²; ground 900, 1,200, 1,800 |
| 8 | `player/cornerStep.test.ts` | A 4 px ceiling-corner overlap with free space shifts x and keeps vy; 5 px stops; a 4 px lip lifts the body, 5 px blocks |
| 9 | `player/ledgeGrab.test.ts` | Capture within 6 px horizontal and 8 px vertical of a solid tile's top lip while falling; not while Down is held; not within 15 ticks of a drop from the same ledge; pull-up completes only if the standing rectangle at the destination is clear |
| 10 | `player/crouch.test.ts` | Body 12x14 with feet fixed; cannot stand under a 1-tile ceiling; a crouched throw leaves at half height |
| 11 | `player/creeper.test.ts` | Auto-grab on overlap, climb at 64 px/s, throw allowed on a creeper, pendulum period 1.6 s, release velocity at the forward apex |
| 12 | `level/levelData.test.ts` | The gym fixture (M1) and the L1 fixture (M2) parse into a `LevelDefinition`; a missing `order`, a duplicate `order`, an unknown `type` or text in the map fails with the object id; a tile with the vertical or diagonal flip bit fails the build with the layer name and tile index |
| 13 | `rules/quota.test.ts` | Quota 8 / 10 / 12 by tier; `stones:quotaMet` fires once; 15 of 15 sets Full Moon; secrets never count toward quota placement |
| 14 | `rules/stones.test.ts` | A collected stone is never lost across a hit and a respawn; a carrier takes floor stones only and drops on 1 hit (Tabaqui) |
| 15 | `collectibles/bank.test.ts` | L6: jewels count only when banked at the altar by touch; the pouch survives a hit and a respawn; the gate opens at quota banked; 15 banked is Full Moon |
| 16 | `collectibles/rally.test.ts` | L8: rallied wolves map to paws (1 per 3, 15 gives 5); paws clamp 0-5; +1 per leader hit; -1 per dhole reaching the rock |
| 17 | `rules/tiers.test.ts` | Damage 1 / 2 / 3 pips of 6, hits to respawn 6 / 3 / 2, boss hits per phase 2 / 3 / 4, recovery windows 1.0 / 0.6 / 0.4 s and 1.2 / 0.8 / 0.5 s, Chil on every level / L2 and L7 / none |
| 18 | `boss/window.test.ts` | A projectile inside the recovery window scores 1 hit; outside it bounces with no effect; a clod extends the current window by 0.2 s; a stomp on an add never counts; phase advances at 2 / 3 / 4 hits |
| 19 | `save/migrations.test.ts` | Version 0 to 1 on fixtures; truncated, null-field and wrong-type files fall back to in-memory with a message; 3 slots are independent |
| 20 | `i18n/parity.test.ts` | Same key set in `en.ts` and `pt-BR.ts`, no empty strings, identical placeholders, no card over 120 characters, every `textKey` in every map present |

Later tests follow the same pattern: the Red Flower meter (+8 s per pot, cap 24 s, 6-tile flee radius, bosses ignore it), garlic (15 s per rub, cap 30 s, bees only), the Retro clock and lives, the telemetry schema guard of 11.2 if it ships, and the "no `from 'phaser'` in logic" guard.

### 9.2 Playwright smoke spec

`playwright.config.ts`: `webServer: { command: 'npm run build && npm run preview', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI, env: { VITE_E2E: '1' } }`, one `chromium` project with `launchOptions: { args: ['--use-gl=swiftshader'] }` (software WebGL, no GPU on CI; if a newer Chromium refuses the context, use `--use-angle=swiftshader --enable-unsafe-swiftshader`, medium confidence), `timeout: 60000`, screenshots with `maxDiffPixelRatio: 0.03`. `tests/e2e/smoke.spec.ts`, one flow:

1. Collect every `console` error and `pageerror`; `page.goto('/')`; `await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 15000 })`.
2. `page.mouse.click(400, 300)` (the audio unlock gesture); assert `page.evaluate(() => window.__game.sound.locked)` is false.
3. `page.goto('/?level=gym')`; wait for ready; hold `ArrowRight` 500 ms; assert via `page.evaluate` on `window.__game` that the player's x increased by at least 40 px; press `Space`, wait 400 ms, assert the player left the floor and came back.
4. Title-screen screenshot baseline; assert zero collected errors. This `webServer` always sets `VITE_E2E`, so it never serves a true production build; the two production-build checks (`window.__game` undefined, `?level=gym` shows the title) instead run as a separate manual or CI step, never alongside the smoke run, against `npm run build && npm run preview` with `VITE_E2E` unset.

### 9.3 GitHub Actions workflow outline

```yaml
name: ci
on: { pull_request: {}, push: { branches: [main] } }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - { uses: actions/setup-node@v4, with: { node-version: 24, cache: npm } }
      - run: npm ci && npm run typecheck && npm run test
      - run: node tools/validate-levels.mjs && node tools/gen-credits.mjs --check
      - run: npx playwright install --with-deps chromium && npm run e2e
      - { if: failure(), uses: actions/upload-artifact@v4, with: { name: playwright-report, path: playwright-report } }
```

Tests run only here, never on Netlify (no browsers there; Netlify's build still runs typecheck and the validators through `npm run build`). Use the current major of each action when writing the workflow in M0 and pin exact tags; the v4 tags above are placeholders (verify in M0).

### 9.4 Acceptance scenarios

Each T-scenario is checked on the built output (`npm run preview` or the Deploy Preview). The last column names the design-side scenario(s) in `docs/GDD.md` §17 (numbered G01-G44, not in T-scenario order) that the test verifies, or the GDD section for a row with no dedicated design scenario; a dash means the row is engineering-only.

| ID | Scenario | Pass condition | GDD |
| --- | --- | --- | --- |
| T01 | Run for one simulated second with the display at 60, 120 and 144 Hz (DevTools frame-rate override) | Same distance within 2 px; tick count 60 in every case | G12 fixed-step feel |
| T02 | Jump 100 ms after walking off a ledge; again at 117 ms | First accepted, second rejected | G04 coyote |
| T03 | Press jump 100 ms before landing and hold it | One jump on the landing tick; no second jump while held | G04 buffer |
| T04 | Full-hold jump; tap jump | Apex 56 px within 2 px; tap apex under 30 px | G03 jump height |
| T05 | Full-run jump over the gym's 4-tile and 5.5-tile gaps; standing jump over 4 tiles | 4-tile cleared from both starts; 5.5-tile cleared at full run; the measured reach written back into the GDD, this plan and DECISIONS.md | G01, G02 reach and gap rule |
| T06 | Rise into a 4 px and a 5 px ceiling corner; walk into a 4 px and a 5 px lip | 4 px corrected or stepped; 5 px not | G05, G06 corner and step-up |
| T07 | Fall past a ledge lip within 6 / 8 px; the same holding Down | Grab and pull-up; no grab with Down | G07 ledge grab |
| T08 | Enter a 1-tile crouch passage and try to stand | Stays 12x14 until clear; throw from the crouch leaves at half height | G08 crouch |
| T09 | Grab a static and a swinging creeper; throw from it; release at the forward apex | Auto-grab, 64 px/s climb, throw allowed, 1.6 s period, 4-tile gap cleared | G09 creepers |
| T10 | Ride Hathi's son on a straight path and Kaa's coil on a sine path for 60 s at 60 Hz | Never falls through, no jitter, no drift off the back | G10 carry platforms |
| T11 | Collect the 8th / 10th / 12th stone by tier | Counter flips gold, two-note sting, exit silhouette for 3 s, "Find Akela" toast for 2 s, exit character beckons, Chil flies to it | G14 quota chain (pillar P2) |
| T12 | Collect all 15 in a level | Full Moon stamp on the map page and the Honey Hollow door on the results card | G20 Full Moon |
| T13 | Get hit and die after collecting stones; let Tabaqui take a floor stone | Collected stones kept; Tabaqui drops the stone on 1 hit | G15, G16 stone retention |
| T14 | Fall into a pit and into deep water in Modern mode | Instant respawn at the last pack-stone, no damage, stones kept | G11, G15 pits and water |
| T15 | Touch a pack-stone, reload the page | Resumes at the pack-stone with stones, pouch, clods and ember; save written once per touch | G35 checkpoints |
| T16 | Watch every enemy entry and boss attack in a debug room | Pose plus sound on every attack, wind-up at least 0.5 s (heavy 0.8-1.2 s), a ground marker for everything that lands, no hurt frames | G22 telegraph contract (pillars P1, P3) |
| T17 | Light the Red Flower near each regular enemy and near B1 | Enemies within 6 tiles flee with no damage; bosses ignore it (the B1 mob backs off 2 tiles for 1 s); meter +8 s per pot, cap 24 s | G23 Red Flower |
| T18 | Hit a boss inside and outside its recovery window on each tier; throw a clod inside the window | 1 hit inside, "tok" outside, window extended 0.2 s; 2 / 3 / 4 hits per phase | G25, G29 boss rules |
| T19 | Play L6 cold | "banked" counter, pouch survives a hit and a respawn, gate opens at quota banked; median first-run confusion under 30 s and first run under 8 min (playtest) | G17, G18 inverted quota |
| T20 | Rally 15 wolves in L8, then fight B4 | 5 paws; paws never fail the fight; leader hits 6 / 9 / 12 end it | G19 rally and Pack strength |
| T21 | Pause during a wind-up; hide the tab during a boss recovery window | Counters frozen; no held input survives; Resume shown, never automatic | GDD §4.5 (no design scenario) |
| T22 | Corrupt a save; deny storage (private window) | Message shown, play continues in memory, other slots intact | G36 save robustness |
| T23 | Toggle language on every screen | Every visible string switches; no PT-BR string exceeds its container | G37, G39 localization |
| T24 | Resize to 1280x720, 1920x1080, 2560x1440; enable fill screen on a phone | Integer zoom 4 / 6 / 8 with letterbox; fill toggle scales non-integer without a broken layout | GDD §11.1 (no design scenario) |
| T25 | Hold move and press jump on a 2x and a 3x DPR phone | Both register; hit areas at least 48 CSS px; presets compact and wide switch | G43 touch |
| T26 | Load on Chrome, on the iOS 26 iPhone and on an iPhone with iOS 18.3 or earlier | Silence before the gesture; music on unlock; `.ogg` on Chrome and the iOS 26 iPhone, `.m4a` on the old iPhone; loops seamless on both iPhones | GDD §13.5 (no design scenario) |
| T27 | Enable Retro mode | "x3", 6:00 clock, counter counting down from 15, continue from level start at 0 lives | G30 Retro floor |
| T28 | Enable each Assist option | Speed 50-100 in steps of 10, invincibility (pits still respawn), infinite clods, skip level (cleared, no Full Moon), Chil everywhere, crouch toggle; assist stamp shown | G33, G34 Assist Mode |
| T29 | Run the Playwright spec against the built output | Green; zero console errors; canvas ready within 15 s | - (build check) |
| T30 | Full quota run on Wolf by two cold testers from a new save on the Deploy Preview | Reaches the Outsong in 60-90 min; every death explained in one sentence | G44 full run (pillar P3) |
| T31 | Respawn 50 times at one pack-stone | No growth in listeners, sounds or object counts (F3 pool counts flat) | - (build check) |
| T32 | Compare `public/game/` with the manifest | Every file has a row; no missing files; at M6 no placeholder rows | - (build check) |
| T33 | Enter Honey Hollow from a Full Moon results card | 30 s clock, honeycombs add to the saved tally, the first cloth palette unlocks at 50 and appears in Extras | GDD §10.13 |
| T34 | Full Moon on all eight levels, then finish B4 | The Spring Running runs with no HUD, no stones, no clock and no fail state; the back-cover tableau shows once | G20, GDD §10.12 |
| T35 | Rub garlic in L7 | Bees ignore Mowgli 15 s, cap 30 s, the item slot shows garlic, the Red Flower meter is restored at L8 start | G23, GDD §7.3 |

Playtest gates behind the rows: pillar P2 (9 of 10 first-time testers name the objective within 10 s of the quota sting; median quota-to-exit under 60 s), pillar P3 (every recorded death in the M2 and M3 rounds explained in one sentence naming the missed telegraph; a checkpoint with more than 5 median deaths in Zones 1-2 is a bug), the L6 gate (confusion under 30 s and first run under 8 min, else the spill layer is removed and the altar tutorial enlarged) and the playtime gate (quota runs under 55 min add detours, never levels).

## 10 Netlify deployment

### 10.1 netlify.toml

```toml
# netlify.toml: static Vite + Phaser build; no functions, no [[redirects]] (one index.html), no COOP/COEP headers
[build]
  command = "npm run build"          # Netlify runs npm ci first because package-lock.json is committed
  publish = "dist"
[build.environment]
  NODE_VERSION = "24"                # never add NODE_ENV = "production": devDependencies would not install
[[headers]]                          # Vite fingerprints dist/assets/*-[hash].*; game files live in public/game/, never public/assets/
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
[[headers]]                          # index.html keeps Netlify's default (max-age=0, must-revalidate; edge cache invalidated by every deploy)
  for = "/game/*"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=0, must-revalidate"
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
[context.deploy-preview]             # contexts change build settings only; headers are global
  command = "npm run build"
  [context.deploy-preview.environment]
    VITE_BUILD_CHANNEL = "preview"
```

Which rule wins when two header blocks match one path is not documented, so the immutable rule is scoped to `/assets/*` only; the first deploy is checked with `curl -I` on one file of each kind.

### 10.2 public/game versus /assets, and the cache rules

Vite writes hashed bundles to `dist/assets/*-[hash].*`, safe to cache forever. Files under `public/` are copied unhashed, so the template's `public/assets/` would land under the same `/assets/` prefix and be frozen in browsers by the immutable header. Runtime game files therefore live in `public/game/`, served under `/game/*` with revalidation (cheap 304 responses on repeat visits). A later optimization, importing game files through Vite so they are hashed and served under `/assets/`, needs no service worker and is the cheapest way to make repeat visits near-free.

| Path | Cache-Control | Why |
| --- | --- | --- |
| `/assets/*` | `public, max-age=31536000, immutable` | Content-addressed by Vite |
| `/index.html` | Netlify default: `max-age=0, must-revalidate` | New deploys are picked up on the next load |
| `/game/*` | `max-age=0, must-revalidate` (explicit) | Unhashed; atomic deploys invalidate the edge |
| `/manifest.webmanifest` | Revalidate, correct `Content-Type` | Installability; Netlify compresses JS, CSS, HTML, JSON and SVG with Brotli or gzip automatically, so there is no pre-compression step |

### 10.3 Deploy Previews as the playtest channel, with Netlify Forms

Every pull request from the connected GitHub repo builds at `https://deploy-preview-<PR>--<site>.netlify.app` for 0 credits, unlimited. Previews are unlisted-public (password protection is a paid feature), so a build ships no secrets and prints its `__BUILD_ID__` in a corner. A playtest round is a pull request kept open for its week. Forms are free and unlimited on credit-based plans and work from a static site: `public/feedback/index.html` holds `<form name="playtest" method="POST" data-netlify="true" netlify-honeypot="bot-field">` (form detection enabled in the site settings) with a hidden `build` field, a textarea for the pasted "Copy diagnostics" JSON, and 7 questions in EN and PT-BR that take 2 minutes: build id; device and browser; where did you stop and why; one moment of confusion; one moment of joy; difficulty 1-5; would you play the next level (yes or no). Submissions are exported to `docs/playtests/<round>.csv` after each round and deleted from Netlify after 12 months at the latest. The page is linked from the pause menu's "Copy diagnostics" only on Deploy Previews (`VITE_BUILD_CHANNEL = "preview"`), never from the child-facing production menu.

### 10.4 Credit budget: the 300-credit math

Facts (D11, docs/RESEARCH.md §8): the credit-based Free plan gives 300 credits per month, a hard limit with no rollover and no overage purchase; a production deploy costs 15 credits; Deploy Previews, branch deploys, failed builds and rollbacks cost 0; bandwidth costs 20 credits per GB; web requests 2 credits per 10,000; build minutes are not metered; at zero credits every site pauses until the monthly reset. Forum reports (medium confidence) describe a two-stage pause in which production deploys stop while the last 30 credits remain, so 270 is the working ceiling. Per-visit cost with the 6.6 budget: a first visit moves 14 MB (0.28 credits) in about 60 requests (0.012 credits), about 0.29 credits; a full playthrough loads three more zone packs, about 46 MB in all (14 MB first load plus about 8 MB, 15.5 MB and 8 MB for the three later zone packs), about 0.93 credits; a repeat visit with a warm cache answers about 50 conditional requests with 304s, about 0.011 credits.

| Production deploys in the month | Credits on deploys | Credits left | First visits (0.29 each) | Full playthroughs (0.93 each) |
| --- | --- | --- | --- | --- |
| 0 | 0 | 300 | about 1,030 | about 320 |
| 2 | 30 | 270 | about 930 | about 290 |
| 4 | 60 | 240 | about 830 | about 260 |
| 8 | 120 | 180 | about 620 | about 195 |
| 20 | 300 | 0 | 0 (the deploy cap even with no traffic) | 0 |

Rules: iterate on branches and previews; merge to `main` in batches, at most 2 production deploys per month in M1-M5 and 2 in the launch month (launch plus one hotfix); check the usage page every Sunday and daily in launch week; if credits approach 40, stop deploying and let the itch.io mirror carry traffic; a successful launch is answered with the Personal plan ($9 per month, 1,000 credits), not a bigger payload.

### 10.5 What never to set

| Never | Why |
| --- | --- |
| `NODE_ENV=production` in the build environment | devDependencies (Vite, TypeScript) would not install |
| `immutable` on `index.html`, `/game/*`, the manifest or a future `sw.js` | Stale builds forever in browsers |
| A `/* -> /index.html 200` redirect; `Cross-Origin-Opener-Policy` or `Cross-Origin-Embedder-Policy` | Hides real 404s for mistyped asset URLs; only Godot threaded exports need the isolation headers, which break cross-origin assets and fonts |
| `GIT_LFS_ENABLED`; Netlify Functions in the hot path; Netlify Analytics; upper-case or spaced file names; `failIfMajorPerformanceCaveat: true` in the Phaser config | No LFS objects exist; Functions burn the same 300 credits; Analytics is Pro-only; the build image is case-sensitive; AUTO could pick WebGL and then throw instead of falling back to Canvas |

### 10.6 Pre-launch checklist

- `npm run build` green on Node 24 with the manifest check and level validation; `dist` at most 55 MB per audio format; first load at most 14 MB measured in DevTools with the cache disabled; `curl -I` shows the expected `Cache-Control` on one file each under `/assets/`, `/game/`, `/index.html` and the manifest, with nosniff and referrer headers and no COOP or COEP; `curl -I` also shows `/privacy/`, `/privacidade/` and `/feedback/` resolving (verify in M0 that the directory form serves without Netlify's retired Pretty URLs feature).
- `manifest.webmanifest` with `name: "Seeonee"`, `short_name: "Seeonee"`, `lang`, `start_url`, `display: fullscreen` with `display_override`, `orientation: landscape`, 192 and 512 px icons plus a maskable 512; Chrome shows the install prompt without a service worker.
- The D03 attribution line on boot, the title screen, credits, README and the store page; `licenses.txt` header carries it; `CREDITS.md` regenerated and diffed; `LICENSE-ASSETS.md` present; `/privacy/` and `/privacidade/` published; if telemetry ships, the first-run notice is in front of it and the Settings switch works.
- Trademark searches of docs/RESEARCH.md §3.5 re-run for "Seeonee" (classes 9, 28, 41) in the launch month; the site and itch.io slugs contain none of the excluded words; tagged `v1.0.0`; the art-src ZIP for M6 uploaded to Google Drive.
- T29 green in CI on the release commit; T30 done by two cold testers on the final Deploy Preview; T31 and T32 checked; credits balance above 100 on launch day with the launch deploy and one hotfix reserve as the only production deploys that month.

## 11 Telemetry, privacy and monetization stance

### 11.1 Closed playtests: nothing automatic

During M1-M5 the game sends nothing anywhere. The pause menu's "Copy diagnostics" copies a short JSON to the clipboard: `build`, `levelId`, `tier`, `mode`, `input` (keyboard, touch or gamepad), `lang`, viewport class (`s`, `m`, `l`), `deathsPerCheckpoint`, `timePerLevelMs`, `stones`, `assist` flags and the last 20 game events with tick numbers; no free text, no user agent string, no wall-clock time. The tester pastes it into the Netlify Form of 10.3. Remote rounds use adult testers only; a child plays only with a parent present and nothing identifying is recorded (no name, age, video or audio), only the observation sheet of 13.4. Consent is one paragraph: purpose, what is recorded, voluntary, withdraw any time, kept 12 months then deleted, contact.

### 11.2 Public launch: what may be added, and only this way

The GDD's audience (a child hero, animals, families) makes the honest classification "directed to children", so the design collects no personal information other than a transient technical identifier (lawyer items in 11.5). If launch analytics are wanted: Umami (Cloud Hobby free tier, 100K events per month, 6-month retention, or self-hosted in the EU) loaded through a same-origin Netlify proxy, sending only a fixed event schema (`level_start`, `checkpoint_reached`, `death` with a cause enum, `level_complete`, `level_quit`, `settings_changed`) with a per-page-load session id kept in memory, no per-install id ever, no raw device fields beyond a viewport class and language, and IP not retained by the vendor. Error reporting, if wanted: a Sentry-class service in the EU region with IP collection disabled (`dataCollection.userInfo: false` or `sendDefaultPii: false`), "Prevent Storing of IP Addresses" on, session replay off, breadcrumbs limited to game events, a `beforeSend` scrubber that drops headers, user fields and any string matching an e-mail or phone pattern, hidden source maps uploaded by the vendor's Vite plugin and deleted from `dist`. A Vitest schema test rejects unknown keys, non-enum values, PII patterns, payloads over 512 bytes, any `localStorage` write by the telemetry module, and any send while the switch is off. Retention: raw events 6 months, error events 30 days, form entries 12 months, aggregates indefinitely. `navigator.globalPrivacyControl` is honored as "off".

### 11.3 The first-run notice

Shown once before any event is sent, with two equally sized buttons; the choice is stored as `telemetry: 'on' | 'off'` in the settings record and repeated in Options.

EN: "This game saves your progress only on this device. To help improve the levels, it can send anonymous gameplay statistics (which level you played, where you lost a life, how long a level took) and technical error reports. No name, account, location, cookie or advertising identifier is collected, and nothing is shared for advertising. You can change this any time in Settings. [Learn more] [Don't send] [OK]"

PT-BR: "Este jogo salva seu progresso apenas neste dispositivo. Para ajudar a melhorar as fases, ele pode enviar estatísticas anônimas de jogo (qual fase você jogou, onde perdeu uma vida, quanto tempo levou) e relatórios técnicos de erro. Não coletamos nome, conta, localização, cookies nem identificadores de publicidade, e nada é compartilhado para fins publicitários. Você pode mudar isso a qualquer momento em Configurações. [Saiba mais] [Não enviar] [OK]"

### 11.4 Privacy notice contents

`/privacy/` and `/privacidade/`, dated and versioned, in this order: (1) who makes the game and the contact channel for parents and players (name, postal address, phone and e-mail; a lawyer confirms what a private individual must publish); (2) what the game does not do (no accounts, names, chat, ads, purchases, cookies, advertising identifiers, location, sale or sharing for advertising, cross-site tracking); (3) what is collected and why, split into gameplay statistics, error reports, local progress that never leaves the browser, and the adults-only feedback form; (4) identifiers: the transient IP the vendor receives, the in-memory session number, and the means used to keep them from identifying anyone; (5) legal basis per region (US internal-operations exception; Brazil legitimate interest in the child's best interest; EU legitimate interest for minimal audience measurement) and the "Don't send" objection switch; (6) processors and their regions with links; (7) retention periods; (8) children and parents, including why an individual child's data cannot be looked up and how to stop sending and erase local progress; (9) rights and the complaint route (ANPD, EU authorities); (10) change history. If no telemetry ships, sections 3-7 state that nothing is sent and the notice stays two paragraphs long.

### 11.5 Monetization, and the items that need a lawyer

None inside the game, ever: no ads, no purchases, no loot boxes, no donation prompts on the title, pause or results screens (D13). A GitHub Sponsors or itch.io pay-what-you-want link may live on the site's About page, the itch.io page and `README.md`. Before any such link goes live: audit every asset row for non-commercial terms and replace them, keep the store branding free of the excluded words, and re-check the trademark position.

Lawyer items before public launch: the "directed to children" classification and the operator contact details a private individual must publish; whether an opt-out anonymous default satisfies Brazil's "most protective configuration by default"; EU member-state divergence on the audience-measurement exemption; international transfer paperwork for the chosen vendors; trademark clearance of the final title and store branding; the tax status of donations for a Brazilian individual. None of these blocks a launch without telemetry and without donations, which is the v1.0 default.

## 12 Milestones and backlog

### 12.1 Milestone table

Hours are before the 30% buffer and match the locked design (630-935 h in total, inside D15's 600-950 h envelope). Every definition-of-done item is binary.

| Milestone | Depends on | Build contents | Definition of done | Hours |
| --- | --- | --- | --- | --- |
| M0 Setup | nothing | Repo from the template with the bumps of 7.1-7.2, pixel-perfect scaling, first rendering check, GitHub Projects board and issue forms, CI workflow, Netlify site with Deploy Previews, `netlify.toml`, LICENSE, LICENSE-ASSETS.md, CREDITS skeleton, manifest script, `licenses.txt`, the five verify-in-M0 spikes | Hello scene live on production (one deploy, 15 credits) and on a Deploy Preview; CI green on a pull request; the five spikes each marked pass or fallback in DECISIONS.md; `npm run build` green on Node 24 | 15-25 |
| M1 Feel prototype | M0 | S1 in the gym level at the D09 numbers, S2 nut, S4 swing and crumble flags, S5 pack-stone and pit, one langur (S3 Lobber), one moon-stone (S6), respawn, the interact verb, debug overlay, level selector | Tests 1-12 green; T01-T10 pass on the built output; 60 fps (95th percentile at most 20 ms) on the mid-range phone; 3 testers say movement "feels good" unprompted; measured reach written into every doc; input remapping stub works | 60-90 |
| M2 Vertical slice | M1 | L1 Council Rock per its sheet with final Zone 1 art and night subset, S6 ExitNPC (Akela) and the quota chain, Chil (Cub), Tabaqui carrier, jackals, Red Flower and the fire-pot fetch, S8 cards, HUD, touch and gamepad, 3 save slots, EN and PT-BR, title and options, title and Zone 1 music, SFX sprite, Netlify deploy, /feedback/ form | Tests 13-14 and 19-20 green; T11-T15 and T21-T26 pass; a 10-tester round completed and its top 5 issues fixed; pillar P2 metric met on L1; no P0 bug; every third-party asset in CREDITS | 100-150 |
| M3.1 Zone 1 Seeonee Hills | M2 | L2 Cold Lairs, cobra (Turret), Master Words gates, kidnap carry cinematic, Snake-gate, B1 The Flung Festoon (S7 built here), Kaa exit, Zone 1 ambience and the shared boss theme, cards EN and PT-BR | Zone playable from the map through B1; T16-T18 pass on B1; a 5-8 tester round done; no P0; all zone assets in CREDITS | 80-110 |
| M3.2 Zone 2 The Waingunga | M3.1 | L3 Water Truce (Hathi's sons, trunk launch, truce trigger, cracked mud, clod piles, quill-pig), L4 Man-Pack (buffalo, advance-on-hit, thorn fences, hut doors, pariah dogs, fearful villagers), B2 The Lame One in the Ravine (Rama phase, stampede and Act 1 cinematics), Zone 2 tileset, theme and ambience | Same gate as M3.1 plus T10 on buffalo and Hathi's sons; the Act 1 card sequence plays | 80-110 |
| M3.3 Zone 3 The Jungle's Justice | M3.2 | L5 Let in the Jungle (Buldeo detect child, tall grass, rope cutting, escort, Bagheera card, letting-in cinematic), L6 King's Treasure (pouch and bank, Kaa coils and head-lift, coin-thrower, white cobra), B3 Thuu (treasure toss, double strike, plate cinematic), Zone 3 tileset, theme and ambience | Same gate plus T19 including the L6 playtest gate | 80-110 |
| M3.4 Zone 4 Red Dog | M3.3 | L7 Bee Rocks (garlic row, hives, bee cloud, boulders, safe-water exit), L8 The Ford (rally, slow water, Pack Chargers, logs), B4 Red Dog at the Ford (waves, paws, Akela's farewell), Zone 4 tileset, theme and ambience | Same gate plus T20 | 80-110 |
| M4 Content complete | M3.4 | The Spring Running, the three farewells and the Outsong credits, the In the Rukh tableau, Honey Hollow layout 1, storybook map pages, tiers fully wired, Retro floor, ending music, L1 tutorial re-author pass, no placeholder assets | Full-game clear on Wolf by two testers from a new save; T12, T27, T32, T33, T34 and T35 pass; zero `placeholder: true` rows | 40-70 |
| M5 Polish | M4 | Feel pass on every level from death-per-checkpoint data, difficulty tuning, accessibility (remap, gamepad glyphs, shake slider, flash reduction, color-safe check), phones (presets, fill toggle, rotate overlay, the five devices), PT-BR proofread, performance pass, cut-first decisions executed, 20-tester round | T01-T35 all pass on the built output; 20-tester round with median completion of Zone 1 in one sitting; crash-free for 30 sessions; first load at most 14 MB | 70-120 |
| M6 Launch v1.0 | M5 | Trademark re-check, license audit, privacy notice, web manifest and icons, production deploy, itch.io mirror with the AI disclosure if needed, trailer and GIFs, README and store disclaimers, tagged release, post-launch bug rule | Section 1.3 entirely true; `v1.0.0` tagged; credits balance above 100 after the launch deploy | 25-40 |

### 12.2 Hours, buffer and calendar

| Milestone | Hours | With 30% buffer | Weeks at 12.5 h/week (buffered) | Weeks at 35 h/week (buffered) |
| --- | --- | --- | --- | --- |
| M0 | 15-25 | 20-33 | 2-3 | 1 |
| M1 | 60-90 | 78-117 | 6-9 | 2-3 |
| M2 | 100-150 | 130-195 | 10-16 | 4-6 |
| M3.1-M3.4 | 320-440 (80-110 per zone) | 416-572 (104-143 per zone) | 33-46 (8-11 per zone) | 12-16 |
| M4 | 40-70 | 52-91 | 4-7 | 1-3 |
| M5 | 70-120 | 91-156 | 7-13 | 3-4 |
| M6 | 25-40 | 33-52 | 3-4 | 1-2 |
| Total | 630-935 | 819-1,216 | 66-97 (15-22 months) | 23-35 (5-8 months) |

Before the buffer the totals are 50-75 weeks (11-17 months) at 12.5 h/week and 18-27 weeks (4-6 months) at 35 h/week, D15's figures. The estimate is for one person shipping a first game; tracked hours replace it after four weeks (13.2), and the plan is re-estimated after M1 and after the M2 playtest.

### 12.3 Per-milestone task breakdown, in build order

M0 Setup (V marks the verify-in-M0 items; each has the fallback of the locked design):

1. Install Node 24; write `.nvmrc`; bootstrap the template and apply every bump and cleanup of 7.1-7.2 (`package.json` name, `index.html` title and the manifest name included); commit the lockfile; the rendering check of 7.3 at integer zoom on the desktop and one phone.
2. V1: export a real L1 gray-box from Tiled 1.12.2 with embedded tilesets and CSV layers and load it (fallback: phaser@3.90.0). V2: an immovable platform with a collider callback carrying the player on a straight path and on a sine-eased path at 60 Hz (fallback: straight coils only). V3: a pendulum creeper that auto-grabs on overlap and releases at the forward apex over a 4-tile gap (fallback: static creepers plus a jump).
3. V4: every toast and card of L1 in PT-BR at +10% inside the 288x120 panel with m5x7 at 16 px (fallback: shorter PT-BR strings, never a smaller font). V5: 48 px CSS touch hit areas on a 2x-3x DPR phone (fallback: the wide preset only); the fill-screen toggle in Scale.FIT.
4. `vitest.config.ts`, the logic guard test, `playwright.config.ts` and the smoke spec; the CI workflow of 9.3 green; GitHub Projects board, labels, milestones and the four issue forms of 13.1.
5. Netlify site named `seeonee` (fallback `seeonee-game` if taken) linked to the repo, `netlify.toml`, Deploy Previews on, one production deploy of the hello scene, `curl -I` header check; the itch.io slug `seeonee` and both site names recorded in DECISIONS with the date.
6. LICENSE, LICENSE-ASSETS.md, CREDITS.md skeleton, `public/game/manifest.json` with the CC0 gray-box kits, `tools/gen-credits.mjs`, `licenses.txt` from the build, README attribution lines; DECISIONS.md rows for every V result and the escape-hatch decision if any V failed.

M1 Feel prototype:

1. `data/tuning.ts` with every D09 constant; `jumpCurve.ts`; test 1; `systems/input.ts` with the `InputSnapshot`, code-based keyboard, gamepad polling, touch stub; the tick of 4.2 in PlayScene with the `worldstep` listener; `TILE_BIAS` 16.
2. `PlayerController` states Grounded, Crouched, Rising, Falling, Hanging, PullingUp, Climbing, Swinging, Interacting, Hurt, Respawning; the frame counters of 4.7; tests 2-10.
3. The gym level in Tiled: flat runway, 4-tile and 5.5-tile gaps, a 1-tile crouch passage, 4 px and 5 px lips and corners, three ledge lips of 3, 4 and 5 tiles, a static creeper, a swinging creeper (S4 swing), a crumbling terrace (crumble 0.5 s, respawn 4 s), a pit, one pack-stone, one moon-stone.
4. S2 nut: 8-way aim, 224 px/s, 0.25x gravity, 1 per 0.25 s, 3 on screen, pooled, crouch throw at half height, throw from a creeper; bunch drop. S3 langur on the Lobber script with the shadow disc, the 0.6 s rear-up telegraph and the flee scatter; stomp bounce of 3 tiles; test 11.
5. S5 pack-stone with an autosave stub and pit respawn; S6 moon-stone with the counter event; the interact ring on a Master Words gate (S5 door); test 12 on the gym map; debug overlay and `?level=` selector of 7.4; the leak check T31; measure the horizontal reach (T05) and correct the GDD, this plan and DECISIONS.md in one commit.
6. Phone pass (60 fps on the mid-range Android, 4x CPU throttling as the substitute); three moderated sessions of 20 min; fix what they name; T01-T10 on the built output.

M2 Vertical slice:

1. L1 Council Rock in Tiled per its sheet (90 x 80 tiles, about 32 screens, 3 pack-stones, 9 path, 4 branch and 2 secret stones, four beats) with the Zone 1 room grammar and automapping rules; Zone 1 tileset and night subset in Seeonee-40, 4 parallax layers, fireflies on the critical path.
2. S6 ExitNPC (Akela) with inactive, beckon and touch-to-exit; the quota chain (gold flip, sting, silhouette 3 s, toast 2 s); Chil on Cub; tests 13-14.
3. Tabaqui (Charger, carrier flag, no contact damage), two jackals, langurs on branches; the Red Flower item (+8 s per pot, cap 24 s, 6-tile flee radius) and the fire-pot fetch twist; Shere Khan's roar as the 2 s shake.
4. S8 card panel and the L1 cards (map page, intro verse, exit prose); the results card with stones, time, deaths and best; HudScene per the GDD HUD table; touch controls with two presets; gamepad glyphs; title, slot picker, tier pick, Options (audio, video, controls, assist, retro, language, copy diagnostics), Extras stub, Credits with the licenses link.
5. Save system: 3 slots, schema and migrations, in-memory fallback, settings record; test 19. `en.ts` and `pt-BR.ts` for everything on screen; parity test 20; language toggle; boot attribution 2 s; the container check.
6. Audio: title theme and Zone 1 theme as `.ogg` + `.m4a`, the shared SFX sprite, unlock on gesture, sliders. Mowgli's final sprite (30 frames), Akela, Tabaqui, jackal, langur, Chil, Grey Brother, Raksha (2 frames), the fire-pot, HUD sheet. Deploy Preview, `/feedback/` form, the 10-tester round; fix the top 5; T11-T15 and T21-T26; an itch.io private page draft.

M3.1 Zone 1 Seeonee Hills:

1. L2 Cold Lairs (70 x 140 tiles, vertical, 4 pack-stones): three canopy lanes, chained swings at 0.75x on the path and one 1.0x chain on a detour, crumbling terraces, cobras in the windows (Turret, hood flare 0.6 s, lunge 2 tiles by 1.5 tiles, rest 1.0 s), the Snake-gate (calms a room 10 s), Master Words gates (crouch-hold 0.5 s), Chil's story entry at the first Bird-gate; the 10 s kidnap carry cinematic as timeline data with a card fallback (12 h cap).
2. S7 BossMachine from data; test 18; B1 The Flung Festoon: three rim throwers on a 2.0 s cycle, the festoon pendulum, the push, cobra windows, the Dance resolution with the 2 s holds on Bagheera and Baloo, the 3-dot phase bar.
3. Kaa exit and card; the shared boss theme and the Zone 1 ambience loop; cards EN and PT-BR; playtest round (5-8 remote testers, at least 2 cold); T16-T18 on B1; credits rows.

M3.2 Zone 2 The Waingunga:

1. L3 Water Truce (180 x 55 tiles, three heat palette bands): Hathi's sons (S4 carry, 32 px/s, wait 2 s at markers), trunk launch (bounce flag, 5 tiles), the truce trigger (12 tiles around a banner, enemies passive, throws drop with a soft "no"), cracked mud (crumble 0.5 s), clod piles (5, cap 20), quill-pigs (Lobber, two straight quills every 2.5 s), cobras in grass, deep pools, the Shere Khan pool cinematic (8 s), Hathi's two-card rest, the rain layer.
2. L4 Man-Pack (150 x 65 tiles, sky palette per pack-stone as a should item): buffalo (S4 carry 48 px/s, advance-on-hit 96 px/s for 2 s), thorn fences (breakable tag), hut doors (S5 door, crouch-hold 0.25 s; fallback open doorways), pariah dogs (Charger palette swap, contact damage, lunge 4 tiles at 128 px/s), villagers on the flee state, Buldeo idle with a lantern, Grey Brother exit.
3. B2 The Lame One in the Ravine: lame charge 160 px/s, roar push 2 tiles, pounce arc with Tabaqui marking the boulder (fallback dust mark), Rama as an S4 platform crossing at 48 px/s with the falling-rock lane markers, the stampede and Act 1 cinematics (12 h cap each), the Act 1 cards; Zone 2 tileset, theme, ambience, cards; playtest round; T10 on both carriers.

M3.3 Zone 3 The Jungle's Justice:

1. L5 Let in the Jungle (140 x 70 tiles): Buldeo as a Charger with a 6 x 2 tile detect child drawn as a lantern cone (0.5 s grace, "!", chase at 80 px/s for 6 s, 2-tile push and 1 hit, 3 s boast), tall-grass hide, the fail-free teaching field, rope cutting (crouch-hold 0.8 s), Messua and her husband as collision-free followers (fallback teleport), Bagheera's card trigger, Grey Brother one screen ahead, the letting-in cinematic (fallback palette swap plus card).
2. L6 King's Treasure (80 x 125 tiles, dim subset with lamp sprites): pouch and bank (S6 callback), the two jewels beside the altar, Kaa's coils (sine ease, 48 px/s, 4 s period) and head-lift (0.6 s, 4 tiles, 2 s), coin-throwers with two shadow discs, white cobras (double strike), thief langurs and spill-on-hit as should items, Thuu's gate at quota banked; test 15; the L6 playtest gate.
3. B3 Thuu, the White Hood: sound-tracked strikes, coil sweep, treasure toss with ceiling glints, double strike, coin dust, the plate cinematic and the 2 s lift; Kaa's coils at the edges as a should item; Zone 3 tileset, theme, ambience, cards; playtest round; T19.

M3.4 Zone 4 Red Dog:

1. L7 Bee Rocks (120 x 85 tiles): garlic as the timed-item data row (15 s per rub, cap 30 s, bees only, takes the item slot), hives as Turret spawners, the bee cloud as a Diver hazard (64 px/s, 12-tile leash, 1 hit per 0.5 s), dhole scout pairs (lunge 3 tiles at 144 px/s, second lunge 0.4 s later), boulders started by a nut hit, the cave behind the waterfall, the run and the leap into the 8-tile safe-water pool 6 tiles below, Kaa in the shallows.
2. L8 The Ford (150 x 65 tiles): resting wolves as the collectible (rally callback), slow-water triggers (50% run), the Pack as team-flagged Chargers with the shove, floating logs at 32 px/s, the howl every 20 s, Won-tolla's empty lair, Phao exit; test 16.
3. B4 Red Dog at the Ford: three waves, the leader's rush and leap, pair lunges from one then both banks, paws with the 10% intercept roll, Akela's cinematic (+2 paws), the charge finisher, the farewell cards; rain and water rise as should items; Zone 4 tileset, theme, ambience, cards; playtest round; T20.

M4 Content complete: the Spring Running (3-4 min, Zone 1 tileset with the spring palette, no HUD, no collectibles, the quiet village scene), the three farewell cards, the Outsong credits, the In the Rukh still and verse at Full Moon in all eight levels, Honey Hollow layout 1 (30 s clock, bent-bamboo springs of 6 tiles, honeycombs, the Law cards, cloth palettes at 50 / 150 / 300 honeycombs), the storybook map pages (cover plus four zone pages with Baloo's line), tiers wired end to end (test 17), the Retro floor (3 lives, 6:00 clock, countdown counter, continues), the ending music, the L1 tutorial re-author pass, replacing every placeholder row, two full-game clears on Wolf.

M5 Polish: per-level feel pass from the observation sheets (deaths per checkpoint, time to first stone, time to quota), difficulty tuning per tier, accessibility pass (remapping on every screen, gamepad glyph sets, shake 0-100%, flash reduction, the color-safe HUD check), phone pass on the five devices (presets, opacity, fill toggle, rotate overlay, the iOS `.m4a` branch), PT-BR proofread of the coinages, performance pass (pools, atlas sizes, per-zone packs, first load at most 14 MB), the ordered cut-first decisions, the 20-tester round and the full-run stream, crash-free for 30 sessions.

M6 Launch: the pre-launch checklist of 10.6 top to bottom, the itch.io mirror, the trailer and GIFs, the README and store text with both attribution lines, the tagged release, and the post-launch rule: a P0 (cannot progress, save loss) ships as a hotfix within 7 days on the reserved deploy; everything else batches into one monthly deploy.

### 12.4 Definition of done for a task, and the buffer and cut rules

A task is done when: the code implements the documented behavior and reads its numbers from `data/`; its rule lives in `logic/` with a Vitest test, or its scene code is covered by a T-scenario; listeners, timers and pooled objects are released on shutdown; typecheck, Vitest and the smoke spec are green; the Deploy Preview was played on the desktop and on one phone; every new asset has a manifest row with license fields; `docs/DECISIONS.md` has a dated note if a rule changed and the GDD was kept consistent; the issue is moved to Done with the build id. A feature with placeholder art can be done through M4; a feature with unresolved behavior cannot.

1. Add 30% to every milestone before writing a date; dates are written on the board, never in this document.
2. If a milestone slips past 1.5x its estimate, cut a level from the current zone before touching the next zone; Zone 4 shrinks first: cut-first line 13 merges L7 and L8 into "Bee Rocks to the Ford" (the garlic climb, then the ford rally) feeding B4.
3. The ordered cut-first list of the GDD scope matrix is the release valve, taken in order with its named fallbacks: Toomai's Night Ride, Rikki-tikki's Garden, the Bent Stick, the Retro score tally and continues screen, the B3 coil edges and B4 rain, the L6 spill and thief langurs, hut and tree passages, the L5 second-map pan and escort walking, Honey Hollow layout 2, storybook page illustrations, the L4 sky cycle and Chil's screen-edge silhouette, save export and time-attack rank, then the Zone 4 merge.
4. Set-piece gates: 12 h per cinematic with a card fallback; a 30 h cap on any new camera mode (none is planned in must); anything needing a ninth system is rebuilt from S1-S8 or cut. Reserve the final 15% of the calendar for "the last 10 percent" (menus, transitions, bugs) and schedule no feature there; never add a milestone without removing one; never restart the codebase.

## 13 Production cadence

### 13.1 GitHub Projects board

One project on the personal account with a Board view (columns Backlog, Next iteration, In progress, Playtest, Done), a Table view grouped by milestone and a Roadmap view by iteration. Repo milestones with due dates: `M0 Setup`, `M1 Feel prototype`, `M2 Vertical slice`, `M3.1 Zone 1 Seeonee Hills`, `M3.2 Zone 2 The Waingunga`, `M3.3 Zone 3 The Jungle's Justice`, `M3.4 Zone 4 Red Dog`, `M4 Content complete`, `M5 Polish`, `M6 Launch v1.0`. Labels: `type:level`, `type:enemy`, `type:boss`, `type:asset`, `type:bug`, `type:feel`, `type:tech`, `type:polish`, `type:license`; `zone:1` to `zone:4`; `prio:P0`, `P1`, `P2`; `size:S` (2 h), `size:M` (6 h), `size:L` (15 h); `needs:playtest`. Sub-issues under level and boss parents. Issue forms in `.github/ISSUE_TEMPLATE/`: `level.yml` (zone, level, objective type, stone placement 9 / 4 / 2, hazards, new idea, target minutes, tutorialization notes, DoD checklist: gray-box, art, audio, cards, playtested), `enemy.yml` (entry, script, telegraph, counter, hits to scatter, scatter gag, sprite needed, SFX needed), `boss.yml` (phases, attacks with wind-up and recovery, arena, cinematic with its card fallback, music cue), `asset.yml` (kind, source, license dropdown CC0 / CC BY 4.0 / OFL 1.1 / custom itch.io / mine, attribution line to paste, art-src path, export path, AI-assisted flag).

### 13.2 Two-week iterations

Base case at 10-15 h/week (about 25 h per iteration): Monday, 30 min to pick 3 issues of size S or M; two evening sessions of 2.5 h on one feature each; a Saturday block of 4 h (the only slot for size L work); Sunday, 30 min to push, open the pull request, watch the Deploy Preview, and every second Sunday post a 3-line devlog. The last Sunday of each iteration is playtest-and-fix only, no new features. Track real hours for four weeks and replace the 12.5 h/week assumption with the measured figure. At 35 h/week the iteration is one week: Monday plan (1 h), Tuesday to Thursday 6 h of feature work per day, Friday morning bugs only, Friday afternoon Deploy Preview, devlog and build to testers; the weekly playable build is the gate.

### 13.3 Playtest rounds per zone drop

| Round | Testers | Format | Output |
| --- | --- | --- | --- |
| M1 | 3 friends | Moderated, 20 min each, in person or screen share | Feel verdict; T05 reach |
| M2 | 10 remote (itch.io Get Feedback board, the Phaser Discord) plus 2 moderated screen-share sessions | One week async on the Deploy Preview with the form | Top 5 issues fixed; P2 metric |
| Each M3.x | 5-8 remote, at least 2 who never saw the game | One week | Zone verdict, deaths per checkpoint, the L6 gate in M3.3 |
| M5 | 20 testers, plus one full-run stream | Two weeks | Median completion of Zone 1 in one sitting; 30 crash-free sessions |

Never reuse the same 3 people for two consecutive rounds; adults only for remote rounds; a child only with a parent present and nothing identifying recorded.

### 13.4 Observation sheet and the decision log habit

One sheet per tester (`docs/playtests/<round>/<n>.md`): start and end time; build id; device and input; deaths per checkpoint with cause (pit, deep water, enemy entry, boss attack, timer in Retro); time to first stone; time to quota; whether the "Find <exit character>" toast was understood (yes, no, later); unprompted quit point; control fumbles (which key or button); think-aloud quotes; the one moment of confusion and the one moment of joy. Moderator rules: no helping, no explaining, no defending; questions afterwards are "where did you expect to land", "why do you think you died", "what did you think was interactive", "did the respawn feel fair".

Every rule change, cut, fallback taken, measured number that replaced an estimate, and every verify-in-M0 result goes into `docs/DECISIONS.md` the same day as one dated row: decision, alternatives considered, why, and how to override. The GDD and this plan are edited in the same commit so the three documents never disagree; the pull request template asks "Did a rule change? Link the DECISIONS row."

## 14 Risks

| Risk | Probability | Impact | Early signal | Response |
| --- | --- | --- | --- | --- |
| A Phaser 4 tilemap regression blocks levels (#7317, #7382, #7296) | Medium | High | A verify-in-M0 spike fails; seams or misplaced tiles in the L1 gray-box | Mitigations of 2.2 first; then pin phaser@3.90.0 the same day and record it |
| Arcade carry platforms jitter or drop the rider (#7252, friction rules) | Medium | Medium | Player sinks or slides on Hathi's sons in the M0 spike | Tick-side vertical carry; snap resting bodies; fallback to straight-line coils |
| First-game estimate runs 1.5-2x over | High | High | Tracked hours after four weeks exceed the plan by 30% | Re-estimate after M1 and M2; apply rule 2 of 12.4; cut-first list in order |
| Art volume (about 300 frames, 4 tilesets, the tiger gap) dominates | High | Medium | Fewer than 10 usable frames per week during M2 | Frame caps (6 run, 4 scatter, 2 idle gag); palette swaps and rig reuse; AI bases only for the gap animals; commission one sheet |
| Original hybrid-instrument score cannot be produced with the listed tools (BeepBox and Furnace are FM/chiptune trackers, not sample libraries for bansuri, sarangi, sitar, tanpura, tabla, dhol and shehnai) | Medium-High | Medium | Fewer than one finished loop per week during M3.x, or tracks read as generic chiptune instead of the described hybrid | Source a specific CC0 or CC-BY sample or soundfont source for the named instruments before M2 audio work begins (name it in docs/RESEARCH.md §7.4); if none exists, simplify GDD §13.1 to an FM-only evocation and record the change in DECISIONS.md; give each zone theme its own explicit hour line inside the M3.x range |
| Netlify credits run out after the game is shared | Medium | High | Usage page above 60% before day 20 of the month | Freeze production deploys; let the itch.io mirror carry traffic; Personal plan at $9 per month |
| localStorage eviction (iOS 7-day rule, private windows) loses progress | Medium | Medium | Testers on iPhones report lost saves | Saves stay small; in-memory fallback with a notice; save export and import (should item) |
| Phone performance below 60 fps | Medium | Medium | 95th-percentile frame time above 20 ms on the mid-range phone in M1 | Pools, per-zone packs, atlas caps, no Filters; profile before adding content |
| Scope creep: a ninth system or a new camera mode | Medium | High | An issue that does not map to S1-S8 | Rebuild from S1-S8 or cut; 30 h camera cap; 12 h cinematic cap |
| "Seeonee" fails trademark clearance at launch | Low | High | A live class 9, 28 or 41 mark in the M6 search | Fallback brand words in order: Council Rock, Cold Lairs, Red Flower, Waingunga (docs/RESEARCH.md §3.4) |
| The L6 inverted quota confuses first-time players | Medium | Medium | Median confusion above 30 s or first run above 8 min in the M3.3 round | Remove the spill layer, enlarge the altar tutorial, keep the two jewels beside the altar |
| Too few playtesters, or solo burnout | Medium | High | Fewer than 5 sign-ups a week before a round; two iterations with no merged pull request | Post earlier on the itch.io board and the Phaser Discord and extend the round; scale down per 12.4, keep the Sunday build, ship the vertical slice as a complete short game if needed |

## 15 Coding-assistant handoff

### 15.1 Master implementation brief

Copy this into a coding assistant in VS Code with `docs/GDD.md`, `docs/PLAN.md` and `docs/DECISIONS.md` as project context. Ask for one milestone at a time.

```text
Implement Seeonee using docs/GDD.md as the gameplay specification and docs/PLAN.md as the technical
specification. Use TypeScript 7.0.x, Phaser 4.2.1 pinned exactly, Vite 8.3.x, Vitest 5.0.x and
@playwright/test 1.63.x. Arcade Physics only, fixedStep true, fps 60, TILE_BIAS 16, base resolution
320x180 with integer zoom. Rules that never bend: files under src/game/logic and src/game/data never
import phaser; src/game/scenes/PlayScene.ts is the only gameplay file that touches Phaser objects; one
'worldstep' listener drives every gameplay timer and scene update does presentation only; every number
comes from src/game/data/tuning.ts, which holds the D09 values exactly; runtime assets live in
public/game, never public/assets; every string goes through the i18n dictionary with EN and PT-BR entries.
Work one milestone at a time in the order of PLAN.md 12.3. Before editing, inspect the project and keep
the lockfile and working configuration. Write the Vitest tests named in PLAN.md 9.1 before or with the
rule they cover. Run npm run typecheck, npm run test, npm run build and npm run e2e, then verify the
milestone's T-scenarios from PLAN.md 9.4 on npm run preview. Report the files changed, the commands to
run, the verified behavior and every acceptance failure that remains. Never call a milestone complete
while a required behavior is missing. If a rule must change, record it in docs/DECISIONS.md with the
date and reason and keep docs/GDD.md and docs/PLAN.md consistent in the same change.
```

### 15.2 The M0 + M1 brief

```text
Read docs/PLAN.md sections 2, 3, 4, 7 and 12.3, then implement M0 and M1 only.
M0: bootstrap from phaserjs/template-vite-ts into this repo and apply PLAN.md 7.1-7.2 exactly:
phaser@4.2.1 pinned, vite ~8.3.1, typescript ~7.0.2, vitest ~5.0.2, @playwright/test ~1.63.0,
rollup-plugin-license ~3.7.1; delete log.js and the vite/ folder; write vite.config.ts, tsconfig.json,
vitest.config.ts, playwright.config.ts, .nvmrc (24), .editorconfig, .gitignore, netlify.toml (10.1),
.github/workflows/ci.yml (9.3), LICENSE (MIT), LICENSE-ASSETS.md, CREDITS.md, public/game/manifest.json,
tools/gen-credits.mjs, tools/validate-levels.mjs and the README attribution lines. Replace src/main.ts
with the rendering check of 7.3 and make tests/e2e/smoke.spec.ts pass on npm run preview. Build the five
verify-in-M0 spikes of 12.3 as throwaway scenes behind ?level= and report pass or fallback for each.
M1: create src/game/data/tuning.ts (every D09 constant with its unit), src/game/logic/player/jumpCurve.ts
and PlayerController.ts with the frame counters of 4.7, src/game/logic/projectiles/Projectile.ts (nut
set), src/game/logic/enemies/scripts.ts (Lobber only), src/game/logic/platforms/PathFollower.ts (swing
and crumble flags), src/game/logic/triggers/TriggerVolume.ts (checkpoint and pit),
src/game/logic/collectibles/Collectible.ts (moon-stone), src/game/logic/level/levelData.ts,
src/game/systems/input.ts, src/game/systems/events.ts, src/game/scenes/BootScene.ts, PlayScene.ts with
the worldstep tick of 4.2, HudScene.ts with the F3 overlay, and public/game/maps/gym.tmj built to 12.3
M1 step 3 with CC0 gray-box tiles in the manifest. Tests that must pass: Vitest 1-12 of 9.1 plus the
no-phaser-in-logic guard; T01-T10 of 9.4 on the built output; the smoke spec. Report the measured
horizontal reach from the gym level so the docs can be corrected. Do not implement M2 content, final
art, bosses, save slots or localization beyond the dictionary stub.
```

### 15.3 Next-milestone brief

```text
Read docs/GDD.md, docs/PLAN.md, docs/DECISIONS.md and the current implementation. Implement the next
incomplete milestone of PLAN.md 12.3 only, including its definition of done from 12.1 and its
T-scenarios from 9.4. Reuse the existing logic modules, data contracts and tuning; keep the previously
playable build working; keep PlayScene thin. Verify the built version, explain how to test the new
behavior in the browser and on a phone, list the remaining defects precisely, update the milestone
status and any affected decisions.
```

## 16 Official references

The design rules, hour ranges and budgets in this document are project decisions; the links below support the tooling and browser behavior. Consult the pinned engine version's API when implementing and recheck tooling requirements when installing.

- Phaser 4: releases https://github.com/phaserjs/phaser/releases ; API documentation https://docs.phaser.io/api-documentation/ ; Arcade Physics guide https://docs.phaser.io/phaser/concepts/physics/arcade ; Scale Manager guide https://docs.phaser.io/phaser/concepts/scale-manager ; migration guide https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md ; Vite TypeScript template https://github.com/phaserjs/template-vite-ts ; issues #7317, #7382, #7296, #7252 under https://github.com/phaserjs/phaser/issues/
- Vite 8: getting started https://vite.dev/guide/ ; build options https://vite.dev/config/build-options ; migration guide https://vite.dev/guide/migration ; static deployment https://vite.dev/guide/static-deploy.html
- TypeScript 7: documentation https://www.typescriptlang.org/docs/ ; tsconfig reference https://www.typescriptlang.org/tsconfig/
- Vitest 5: guide https://vitest.dev/guide/ ; configuration https://vitest.dev/config/ ; migration https://vitest.dev/guide/migration.html
- Playwright: introduction https://playwright.dev/docs/intro ; test configuration https://playwright.dev/docs/test-configuration ; continuous integration https://playwright.dev/docs/ci ; screenshots https://playwright.dev/docs/test-snapshots
- Tiled: JSON map format https://doc.mapeditor.org/en/stable/reference/json-map-format/ ; custom properties https://doc.mapeditor.org/en/stable/manual/custom-properties/ ; automapping https://doc.mapeditor.org/en/stable/manual/automapping/
- Netlify: file-based configuration https://docs.netlify.com/build/configure-builds/file-based-configuration/ ; headers https://docs.netlify.com/manage/routing/headers/ ; caching https://docs.netlify.com/build/caching/caching-overview/ ; Deploy Previews https://docs.netlify.com/deploy/deploy-types/deploy-previews/ ; build environment variables https://docs.netlify.com/build/configure-builds/environment-variables/ ; forms https://docs.netlify.com/manage/forms/setup/ ; credits https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- Node.js downloads https://nodejs.org/en/download ; nvm-windows https://github.com/coreybutler/nvm-windows ; GitHub issue forms https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms ; Projects iteration fields https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-iteration-fields ; large files https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- Browser platform: localStorage https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage ; autoplay https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay ; KeyboardEvent.code https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code ; Gamepad API https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API ; crisp pixel art https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look ; web app manifest https://web.dev/articles/add-manifest
- Audio encoding: ffmpeg codecs https://ffmpeg.org/ffmpeg-codecs.html ; formats https://ffmpeg.org/ffmpeg-formats.html ; VS Code browser debugging https://code.visualstudio.com/docs/nodejs/browser-debugging
