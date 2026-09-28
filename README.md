# Seeonee (working title)

A single-player 2D exploration platformer for the browser: Mowgli climbs the tree-roads, creepers and ruins of Kipling's Seeonee hills, gathers 15 moon-stones per level until the level's elder agrees to lead him on, and faces four bosses that end with fear defeated, never an enemy destroyed.

Based on the public-domain Mowgli stories of Rudyard Kipling (1894-95). Not affiliated with, endorsed by or sponsored by The Walt Disney Company or the 1994 Virgin Interactive game.

Baseado nas histórias de Mowgli, de Rudyard Kipling (1894-95, domínio público). Sem afiliação, endosso ou patrocínio da The Walt Disney Company ou do jogo de 1994 da Virgin Interactive.

## Status

Design complete, no code yet (2026-09-25). The four documents under `docs/` are the whole project so far. The next step is milestone M0: repository setup, the first rendering check and the five verify-in-M0 spikes.

## What the game is

| Item | Value |
| --- | --- |
| Genre | Collect-and-exit platformer: 15 collectibles per level, a quota of 8 / 10 / 12 by difficulty tier, an exit character once the quota is met, a boss per zone |
| Structure | 4 zones x 2 levels, 4 bosses, the non-combat Spring Running finale, a 100% epilogue, one bonus stage in the must tier |
| Modes | Modern (default: no lives, no clock, autosaving checkpoints, instant respawn) and Retro (optional: 3 lives, a 6:00 clock); tiers Cub / Wolf / Lone Wolf; Assist Mode |
| Tone | Nobody bleeds, the player kills nothing, humans are fearful not villains, one gently handled death |
| Languages | English and Brazilian Portuguese from day one, with Kipling's spellings in both |
| Platform | Desktop browsers with keyboard or gamepad, phones and tablets with touch; hosted on Netlify |
| Presentation | 320x180 pixel art at integer zoom, 16 px tiles, 60 Hz fixed-step simulation, one 40-color palette |
| Play time | 60-90 min for a quota run, 2-3 h for 100% |

## Documents

- `docs/GDD.md`: the game design document: identity, story, rules, controls, feel numbers, traversal, throwing, enemies, bosses, collectibles, modes, the eight level sheets, HUD, art, audio, localization, accessibility, scope matrix, acceptance scenarios and open questions.
- `docs/PLAN.md`: the development plan: stack and versions, architecture, simulation rules, data contracts, VS Code setup, asset pipeline, testing and CI, Netlify deployment, telemetry stance, milestones M0-M6 with hours, risks and the coding-assistant handoff briefs.
- `docs/DECISIONS.md`: the decision register: every choice made on Diego's behalf, with the alternatives considered, the reason, where it lives, its confidence and how to override it, plus the pending verifications and the rejected options.
- `docs/RESEARCH.md`: the evidence: verified facts about the 1994 reference game with contradictions marked, the public-domain and trademark position, the feel references, the asset and tool shortlist with licenses, and the versions verified on 2026-09-25.

The documents share one set of numbers (feel values, tier table, level sizes, hours). A change to any number is made in all of them in one commit and recorded in `docs/DECISIONS.md`.

## Planned stack

Phaser 4.2.1 pinned exactly (phaser@3.90.0 is the fallback), TypeScript 7.0.x, Vite 8.3.x, Vitest 5.0.x, @playwright/test 1.63.x, Tiled 1.12.2, Aseprite or Pixelorama, Node 24 with npm and a committed lockfile, Netlify static hosting, GitHub Actions for tests. Arcade Physics only; runtime assets under `public/game/`. Versions were verified on 2026-09-25 (`docs/RESEARCH.md` §8).

## How to start

1. Read `docs/GDD.md` §1-3 for the pillars and the eight systems, then `docs/PLAN.md` §1 for what "done" means for v1.0.
2. Follow `docs/PLAN.md` §7 (VS Code setup and daily workflow): install Node 24, Tiled 1.12.2 and an art tool, bootstrap from the Phaser Vite TypeScript template, apply the version bumps and the configuration cleanup, and run the first rendering check.
3. Hand a coding assistant the M0 + M1 brief in `docs/PLAN.md` §15.2, with the master brief of §15.1 as project context, and work one milestone at a time in the order of `docs/PLAN.md` §12.3.
4. Record every verify-in-M0 result and every rule change in `docs/DECISIONS.md` the same day.

## Planned repository layout

- `src/game/logic/` and `src/game/data/`: pure TypeScript rules and tuning values, unit-tested, never importing the engine.
- `src/game/scenes/`: Boot, Title, Map, Play and HUD scenes; `PlayScene.ts` is the only gameplay file that touches engine objects.
- `public/game/`: runtime assets (sprites, tilesets, maps, audio, fonts) listed in one manifest.
- `tests/unit/` and `tests/e2e/`: Vitest rules tests and one Playwright smoke test.
- `tools/`: credits generation, level validation and art export scripts.
- `docs/`: the four documents above and the playtest observation sheets.

## Names and spelling

In-game names use Kipling's spellings in both languages (Mowgli, Bagheera, Baloo, Shere Khan, Kaa, Akela, Raksha, Hathi, Chil, Thuu, Grey Brother). The word "mogli" is the repository folder name only and never appears in the title, logo, URL slug, package name or store metadata (`docs/DECISIONS.md` D03).

## Licensing

The code will be released under the MIT License (`LICENSE`, added in M0). Art, audio, fonts and level data are excluded from that license: original assets are (c) Diego Araujo, all rights reserved, and third-party assets keep their own licenses. The PT-BR translations and UI strings in `src/i18n/` ship under the MIT License with the code. `LICENSE-ASSETS.md` and a generated `CREDITS.md` (Title, Author, Source, License, modifications and an AI-assisted flag per asset) arrive with the first assets in M0-M2. The game has no ads, purchases or donation prompts.

## Feedback and privacy

Closed playtests run on Netlify Deploy Previews with an in-game "Copy diagnostics" button and a short form; nothing is collected automatically. A public launch may add anonymous gameplay statistics only behind a first-run notice with equal "OK" and "Don't send" buttons, and the privacy notice ships in EN and PT-BR (`docs/PLAN.md` §11).
