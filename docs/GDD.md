# Seeonee

## Game Design Document

Version 1.0 • September 25 2026 • Prepared for Diego Araujo

Seeonee is a single-player 2D exploration platformer for the browser, built on Rudyard Kipling's public-domain Mowgli stories (1894-95) and inspired by the ideas, not the expression, of the 1994 Mega Drive collect-and-exit platformer described in docs/RESEARCH.md §1. Mowgli runs, jumps, throws and climbs through eight large levels in four zones of the Seeonee hills and the Waingunga valley, gathers 15 moon-stones per level until the level's elder agrees to lead him on, and faces four bosses that end with fear defeated, never an enemy destroyed. The game closes with the non-combat Spring Running and "Man goes to Man".

The design has three pillars: nobody is harmed, the player always knows what they are looking for, and danger is readable while control is forgiving. Modern mode is the default (no lives, no clock, visible checkpoints that autosave, instant respawn); Retro mode is an optional retro floor (3 lives, a 6:00 clock, a counter that counts down) that never gates content. Three difficulty tiers (Cub, Wolf, Lone Wolf) change the quota, the damage taken and the boss hits per phase; Assist Mode adds game speed, invincibility, infinite clods and level skip without judgment. English and Brazilian Portuguese ship together from day one.

This document is the design specification that docs/PLAN.md implements and docs/DECISIONS.md records. Every number here is an initial value tuned in the M1 gym level and the M2 vertical slice; the numbers are shared verbatim with the other documents so that one ruler measures every level. Sections 1-9 define the rules, 10 the content, 11-15 the presentation and access layers, 16-18 the scope, the acceptance scenarios and the open questions with their default answers.

### Navigation

1. Game identity and scope
2. World and story
3. Player experience and progression
4. Controls and input
5. Movement and feel
6. Traversal
7. Throwing and enemies
8. Bosses
9. Collectibles, checkpoints and modes
10. Levels
11. Camera, HUD and interface
12. Art direction
13. Audio direction
14. Localization
15. Accessibility
16. Content plan and scope matrix
17. Design acceptance scenarios
18. Open design questions

## 1 Game identity and scope

### 1.1 Product definition

| Item | Decision |
| --- | --- |
| Working title | Seeonee (EN and PT-BR); the attribution line of docs/RESEARCH.md §3.6 on the boot screen, the title screen, credits, README and store page; never "Jungle Book", "Mogli" or "Mowgli" in the title, logo, URL slug, package name or store metadata (see docs/RESEARCH.md §3.4) |
| Genre | Single-player 2D exploration platformer: 15 collectibles per level, a quota, an exit character per level, a boss per zone |
| Pitch | Mowgli climbs the tree-roads, creepers and ruins of Kipling's Seeonee hills, gathers moon-stones until the level's elder agrees to lead him on, and faces four bosses that end with fear defeated, never an enemy destroyed. The game closes with the non-combat Spring Running and "Man goes to Man". |
| Comparables | The 1994 reference for the collect-and-exit loop; Celeste for the feel constants and Assist Mode; Shovel Knight and Alex Kidd DX for checkpoint density; Crash Bandicoot 4 for the Modern / Retro toggle; Super Mario 64 and Rayman Legends for any-N-of-M gating (docs/RESEARCH.md §5-6) |
| Player | Families and nostalgic adults: a child of 8 finishes on Cub; a Lone Wolf 100% run is the hard mode |
| Platform | Browser on Netlify: desktop keyboard and gamepad, phone and tablet touch; EN and PT-BR from day one |
| Presentation | 320x180 base resolution, 16x16 tiles, integer scaling (x4 = 720p, x6 = 1080p, x8 = 1440p), 60 Hz fixed-step simulation, bitmap fonts, one master palette (Seeonee-40) |
| Session | 4.5-6.5 min per level on a first quota run (section 10 sheets); 60-90 min for a quota run; 2-3 h for 100% |
| Structure | 4 zones x 2 levels + 4 bosses + the Spring Running + the In the Rukh 100% tableau + bonus stages |
| Modes | Modern (default) and Retro (optional); tiers Cub / Wolf / Lone Wolf; Assist Mode |
| Tone | Nobody bleeds, the player kills nothing, humans are fearful not villains, one gently handled death (Akela) |
| Business model | Free; no ads, no purchases, no donation prompts inside the game |
| Online requirements | Asset loading only; no account, no server, no multiplayer |

### 1.2 Pillars

| Pillar | Statement | Test |
| --- | --- | --- |
| P1 Nobody is harmed | Enemies are scattered, never hurt: every enemy has a flee-or-hide animation and no hurt frame; every boss ends in a cinematic in which the antagonist leaves under its own power. | A reviewer watching any 60 s of footage from any level or boss cannot point at blood, a wound, a corpse or a blow that lands on a creature. |
| P2 Always know what you are looking for | The counter, the exit character's silhouette, the quota sting and Chil keep the objective legible at every moment. | In every playtest round, 9 of 10 first-time testers name the objective within 10 s of the quota sting, and the median time from quota to exit is under 60 s. |
| P3 Readable danger, forgiving control | Every attack telegraphs on two channels plus a ground marker for anything that lands; wind-ups are at least 0.5 s; the section 5 forgiveness windows apply everywhere. | Every recorded death in the M2 and M3 playtests is explained by the tester in one sentence naming the telegraph they missed; a checkpoint with more than 5 median deaths in Zones 1-2 is a bug. |

### 1.3 Scope boundaries

| Feature | M2 vertical slice (L1) | Version 1.0 | Later candidate |
| --- | --- | --- | --- |
| Run, variable jump, crouch, 8-way throw, stomp, creeper climb, ledge grab, interact | Required | Required | Refined animation |
| Swinging creepers, crumbling ledges | No (L2) | Required | More platform flags |
| Nut, clod, Red Flower | Nut and Red Flower | All three plus the garlic data row | Bent Stick (cut-first) |
| Enemies | Langur, Tabaqui, jackals | 8 entries on 4 scripts | More reskins |
| Bosses | None | 4 | None planned |
| Levels | L1 with final art | L1-L8, the Spring Running, Honey Hollow layout 1 | Rikki-tikki's Garden, Toomai's Night Ride |
| Modes and tiers | Modern, Cub / Wolf / Lone Wolf | Modern, Retro floor, tiers, Assist Mode | Retro score tally |
| Save | 3 slots, autosave at pack-stones | Same, versioned schema | Export and import as JSON |
| Input | Keyboard, gamepad, touch, remapping | Same plus presets and opacity | Touch layout editor (rejected) |
| Localization | EN and PT-BR | EN and PT-BR | Other languages |
| Wall jump, dash, double jump, metroidvania systems, swim verb, lighting mask, auto-scroll, PWA | No | No | Separate scope decision (PWA in v1.1) |

Rejected for version 1 with the reason recorded: wall jump, dash and double jump (they would widen every gap rule and invalidate the gym metrics), a swim verb (safe water is a trigger that ends a level, deep water respawns), a lighting mask (every cobra, quill and hive is always drawn), auto-scroll (the run and the leap of L7 are built from ordinary running), a line-of-sight raycast (Buldeo uses a drawn detect rectangle), and a ninth coded system (anything that needs one is rebuilt from the eight systems of section 3.4 or sits in the cut-first list of section 16).

### 1.4 What is retro and what is modern

| Retro (an idea kept from the 1994 game, re-expressed) | Modern (what replaces the 1994 flaw) |
| --- | --- |
| 15 collectibles per level, quota 8 / 10 / 12 by tier, an exit character once the quota is met (verified, see docs/RESEARCH.md §1.3) | The exit character is a Kipling elder with a beckon loop; the quota toast names him; Chil flies to him at quota on every tier |
| A boss every other chapter, damaged by projectiles only (cadence verified; projectile-only immunity unverified, see docs/RESEARCH.md §1.11) | One boss per zone; projectiles only; bosses end with fear defeated; checkpoint at the boss door and instant retry |
| Unlimited weak throw, limited stronger throw, one timed protective item (verified, §1.4) | Nut, clod and the Red Flower, which scares and never burns; a 3-slot cycle, never five |
| Vines, animal platforms, items dropped from hanging bunches (verified, §1.6) | Creepers with a 1.6 s swing period, Kaa's coils, Hathi's sons, buffalo; mahua bunches |
| A 6:00 clock, 3 lives and a counter that counts down from 15 on Normal (primary-verified, §1.3) | Retro mode only, off by default; Modern has no lives, no clock, autosave and instant respawn |
| Bonus level on 15 of 15 (verified, §1.8) | Honey Hollow on "Full Moon", a cosmetic reward, never a gate |
| Storybook chapter cards | Cards that quote Kipling verbatim, at most about 120 characters |
| No ledge grab, instant-death pits and water, no save, finicky stomp hitboxes (reviewer complaints, §1.9) | Ledge grab and pull-up, pits and deep water respawn at the last pack-stone, autosave, stomp windows measured in the gym |

Rules: no wording such as "homage", "analogue" or "like the 1994 game" appears in the game or the store text; no 1994 HUD corner package is reproduced (Retro mode included); levels and caverns are never traced from longplays or map sites; Hathi's sons walk and graze, never march to march music. The 7/6/4 timer, the compass withheld on Hard and the stomp immunity of bosses are unverified claims about the 1994 game and are never stated as fact in-game (see docs/RESEARCH.md §1.11).

## 2 World and story

### 2.1 Premise

The Seeonee hills of Central India, a dry-deciduous forest of teak, bamboo, mahua and palash cut by seasonal streams and the gorge of the Waingunga (see docs/RESEARCH.md §4 and the art bible in section 12). Mowgli, a man's cub raised by Raksha's wolves, learns the Law of the Jungle from Baloo and Bagheera, is carried off by the Bandar-log to the Cold Lairs, survives the drought of the Water Truce, is cast out by the Pack and the Man-Pack in the same season, brings the Lame One under the feet of Rama's herd, frees Messua, lets the Jungle in, refuses the King's Ankus, and stands with the Pack at the ford against the Red Dog. Two years later, in the Time of New Talk, he runs north, sees Messua's lamp, and chooses: Man goes to Man.

The game follows Kipling's own chronology of the eight Mowgli stories (see docs/RESEARCH.md §4.1). Shere Khan is therefore the second boss, not the last: the four stories after "Tiger! Tiger!" all post-date his end, and Kipling's first book ends on the Council Rock scene, which the game uses as its Act 1 false ending (section 3.6).

### 2.2 Cast

Species and looks follow Kipling's text and the public-domain 1894-95 plates, never the 1967 film or the 1994 sprites (see docs/RESEARCH.md §3.2 and §4.2). Every design passes the "red shirt" test in section 12.4 before it ships.

| Character (EN / PT-BR) | Role in the game | Kipling basis | Disney tell to avoid |
| --- | --- | --- | --- |
| Mowgli | Player character | "Mowgli the Frog"; lumps on knees and elbows from tracking on all fours; long black hair; a cloth; a knife used on ropes and vines only; nearly seventeen by the ending | Red loincloth, mop haircut, big round eyes, bananas as ammunition |
| Baloo | Map narrator, level intro cards, Honey Hollow host | "The sleepy brown bear who teaches the wolf cubs the Law"; strict and kind | Blue-gray smooth bear, pot belly, jazz-singing slacker, back-scratching gag |
| Bagheera | Scripted ally: B1 terrace edge, L5 scare, B3 aftermath card | "Inky black all over" with the watered-silk pattern; the bare collar mark under his jaw; born in the cages at Oodeypore | Blue-black sleek panther with no markings; the fussy guardian role |
| Akela | L1 exit character; B4 midpoint and farewell | "The great gray Lone Wolf", leader of the Free People; "All debts are paid now. Go to thine own people." | None (absent from the film); never a generic cartoon wolf |
| Raksha, Grey Brother, Phao, Won-tolla | Zone 1 map page; pack-stone checkpoints and L4 exit; L8 exit; L8 hidden wolf | "The man's cub is mine, Lungri--mine to me!"; Grey Brother at the dhak tree; Phao the later leader; Won-tolla the Outlier whose lair is empty | Talking-dog pupils; the film's wolf council |
| Shere Khan / Tabaqui | B2 boss; L1 thief, B2 herald | "Lungri", lame from birth, a cattle-thief and bully; Tabaqui the Dish-licker, a spy who cringes | George Sanders' suave sneer; a burning branch tied to the tail; no hyena sidekick |
| Kaa | L2 and L7 exit, L6 platforms, B1 resolution | A thirty-foot rock python, "very old and very cunning", an ally whose Dance is a hypnosis Mowgli cannot feel | Green cartoon snake, spiral eyes, lisp, the villain who tries to eat Mowgli |
| The Bandar-log | L1-L2 langur throwers, B1 mob, L6 coin-throwers | "The people without a law", leaderless; gray langurs with black faces and tails longer than their bodies | King Louie, any ape king, a throne, a crown, chest-beating, scat poses |
| Hathi and his three sons | L3 and L5 exit; L3 platforms; the letting-in cinematic | Silent, ancient, "Master of the Jungle"; proclaims the Water Truce; the sons "gaunt and gray" | Colonel Hathi, helmet, moustache, the Dawn Patrol march |
| Chil | Diegetic compass by tier; flies to the exit at quota | The kite who follows the trail ("Rann" in the first book, see docs/RESEARCH.md §4.3) | None; drawn as a black kite with a forked tail |
| Thuu | B3 boss, pinned and spared | The blind White Cobra, "as old as the Jungle", poison dried up, ruby eyes | None; never a venom-spitting cartoon |
| The dholes | L7-L8 scout pairs, B4 waves | "Red Dog, the Killer" from the Dekkan; rust-red, low-hung tails; the bay-colored leader keeps his tail | None |
| The Little People of the Rocks | L7 bee swarms | The wild bees of the Bee Rocks; garlic hides Mowgli from them | None |
| Messua and her husband | L4 first pack-stone; L5 escort | Messua adopts Mowgli as Nathoo; the village is frightened, not villainous | Shanti, Ranjan, any love-interest framing |
| Buldeo | L4 idle storyteller; L5 pursuit hazard | The boastful hunter; carries a lantern here, never a musket; boasts without text | Villager caricature; sorcery accusations; the greedy land plot |
| The Pack / a Alcateia | L8 collectible, B4 allies | "For the strength of the Pack is the Wolf, and the strength of the Wolf is the Pack." | None |

### 2.3 Story delivery: storybook cards

The whole story is told through one panel, the S8 card panel (288x120 px, section 11), used for storybook cards, level intro and exit cards, results, boss cards and credits. Cards quote Kipling verbatim (verse or prose) from the approved list in docs/RESEARCH.md §4.6, at most about 120 characters at 320x180. Kipling's words are unchanged; the Gutenberg double hyphen is rendered in-game as an en dash (U+2013, in the charset of section 14.2) and is written as "--" in these documents; the single triple hyphen (the L7 intro, verified in docs/RESEARCH.md §4.6) is written as "---" in these documents and also renders in-game as one en dash. The storybook map (section 11.3) frames the levels as pages of a book that Baloo narrates with one line per zone page.

| Rule | Value |
| --- | --- |
| Cards per level | An intro card (verse) and an exit card (prose) except L7, whose exit is the leap; L2, L4 and L6 show their exit prose after the boss; at most one card between action beats; Hathi's two-card rest in L3 is the only exception |
| Skipping | Any card can be dismissed after 1 s; no card replays on a boss retry |
| Per-pickup text | None; the Law lines live on the Honey Hollow cards and the Extras scroll |
| Cinematics | Authored as timeline data with a 12 h production cap each and a card fallback; none can be failed |
| Invented lines | None; the only in-game text that is not Kipling is UI, objectives and the two rule sentences of L6 and L8 |
| Excluded lines | "It is Death! It is Death! It is Death!" and "It is better to die in a Full Pack" never appear; "Brother, I go to my lair--to die." is off by default and decided by the M2 family playtest |
| Language | Every card exists in EN and PT-BR; PT-BR text is translated in-house from the Gutenberg text (section 14) |

Card count: 20 cards across the eight levels plus the boss and ending cards (section 10.11 totals). The card list per level is in each level sheet.

### 2.4 Tone rules

Adopted from the tone statement in docs/RESEARCH.md §4.4 and the fourteen-point do-not-use list in §4.5:

1. Nobody bleeds on screen; there are no wounds, corpses or blows that land on a creature.
2. The player never kills an animal or a person; enemies are scattered, stunned, hidden or chased off, and every enemy has a flee gag instead of a hurt frame.
3. Bosses end with fear defeated: the Bandar-log scatter at dawn, Shere Khan is lost in dust and silence, Thuu is pinned by a fallen plate and freed, the dholes swim off downstream.
4. Humans are fearful, not villains: villagers flee and close doors, Buldeo boasts with a lantern, Messua is the village's heart; no caste, colonial or "sahib" framing anywhere, including the 100% tableau.
5. Exactly one death, handled gently: Akela lies down on the bank as if to sleep after B4, with his own words and no wound.
6. The knife touches ropes and vines only.
7. The hide of Shere Khan appears only as a symbol in the Act 1 cinematic; the ankus is never a pickup and never touches a creature.
8. None of Kipling's political verse or paratexts appears in the game or its marketing.

## 3 Player experience and progression

### 3.1 Core loop

Enter a level from the storybook map, read one verse card, and run: the critical path hands over 9 moon-stones, visible side branches hold 4 more, and 2 signposted secrets hold the last 2. When the tier's quota is met the counter flips gold, a two-note wolf-call sting plays, the toast "Find Akela" names the exit character, and Chil flies toward him. Touch the exit character to end the level, read the results card, and, on 15 of 15, enter Honey Hollow. Every second level ends at a boss door with its own pack-stone. Death or a pit returns Mowgli to the last pack-stone in 0.6 s with every stone kept.

The intended play mix is about 60 percent traversal and stone hunting, 25 percent enemies and hazards, and 15 percent cards, cinematics and bosses. These are content planning targets measured on the level sheets in section 10, not runtime quotas.

### 3.2 Session shape

| Unit | Length | What happens |
| --- | --- | --- |
| Level, first quota run | 4.5-6.5 min (section 10 sheets) | Four beats: a safe opener with 3 stones, a fork or vertical hub, a twist with a pack-stone before and after, a calmer close that ends at the exit character |
| Level, replay | 2-3 min | The player knows the layout; time-attack rank shown as a rank, never a fail (should tier) |
| Level, 100% | 7-10 min | The two secrets and the branch stones behind the twist mechanic |
| Boss | 2-4 min per attempt | Three phases, at most two attacks each; checkpoint at the door; instant retry |
| Zone | 15-20 min | Two levels, a boss, a map page turn with Baloo's line |
| Quota run | About 67 min (45 min of levels, about 12 min of bosses, about 6 min of cards and cinematics, 4 min of ending) | Detours, not levels, are added if the M3 playtests run under 55 min |
| 100% run | 2-3 h | Every Full Moon, Honey Hollow twice per zone layout, the bonus stages, the In the Rukh tableau |

A level is designed to be stopped at any pack-stone: closing the tab loses nothing past the last pack-stone, and Continue reopens the level at that stone with its stones, clods and Red Flower meter restored.

### 3.3 Progression and gating

| Gate | Requirement | Note |
| --- | --- | --- |
| Level exit | The tier's quota of that level's 15 collectibles (Cub 8, Wolf 10, Lone Wolf 12) | The exit character is inactive below quota; Chil and the counter show the way |
| Next level in a zone | Previous level cleared | Cleared levels replay freely from the map at any tier |
| Boss door | Both levels of the zone cleared | The B door sits at the end of the zone's second level with its own pack-stone |
| Next zone | The zone's boss resolved | Zones unlock in order: Seeonee Hills, The Waingunga, The Jungle's Justice, Red Dog |
| The Spring Running | B4 resolved | Never gated by stone totals |
| Honey Hollow | 15 of 15 in the level just played ("Full Moon") | Entered from the results card; cosmetic rewards only |
| Cloth palettes for Mowgli | 50 / 150 / 300 honeycombs in the honey tally | Cosmetic |
| Rikki-tikki's Garden (cut-first) | 45 moon-stones across Zones 1-2 | Cumulative total, so no single level is mandatory |
| Toomai's Night Ride (cut-first) | Full Moon in every Zone 3-4 level | Cumulative |
| In the Rukh tableau | Full Moon in all eight levels | The 100% epilogue on the storybook's back cover |

Gating uses "any N of M" totals everywhere (see docs/RESEARCH.md §6): a player may skip the stones they dislike and still see the ending. Nothing that a player needs to finish the game sits behind a secret, a boss-add stomp, a damage boost or a speedrun trick.

### 3.4 The eight systems

Every mechanic in the game is data on one of eight coded systems. This is the design's scope law: one new coded mechanic per zone, everything else a data row.

| System | What it is | Reused by |
| --- | --- | --- |
| S1 Player controller | The section 5 verbs at the section 5 numbers plus one universal interact verb: crouch-hold at a thing for 0.25-2 s with a progress ring (hut doors 0.25 s, Master Words gates 0.5 s, ropes 0.8 s, the B1 and B3 holds 2 s) | Master Words gates, ropes, lifting the plate in B3, keeping a hand on Bagheera and Baloo in B1 |
| S2 Projectile class | One class with parameter sets: nut, clod, enemy nut, coin, quill, boss coin cluster, coin dust | Every throw and every enemy shot |
| S3 Enemy scripts | Four behaviors with flags (team, carrier, flee, stunned, contact damage): Charger, Lobber, Turret, Diver | 8 enemy entries, Buldeo, the Pack wolves, boss adds |
| S4 Path-follower platform | Waypoint mover with flags: carry, swing (pendulum), crumble, bounce, advance-on-hit, sine ease | Creepers, crumbling ledges, Kaa's coils and head-lift, Hathi's sons, buffalo, logs, boulders, the festoon, Rama |
| S5 Trigger volume | Rectangle with a flag: truce, slow water, safe water, tall grass, detect, card, door, checkpoint, pit | Peace Rock zones, shallows, the Waingunga pool, Buldeo's light, hut doors, pack-stones |
| S6 Collectible and ExitNPC | Moon-stone with a per-level skin and callback; exit character with inactive, beckon and touch-to-exit states | The L6 altar (count-pouch callback), the L8 wolves (rally callback), every exit |
| S7 Boss state machine | Phases and attacks as data; attacks instanced from S3 scripts scaled up; a 3-dot phase bar | B1-B4 |
| S8 Card panel | One 288x120 px panel for storybook, level intro, results, boss and credit cards | Every text moment |

| Zone | The one coded mechanic | Everything else in the zone is data on S1-S8 |
| --- | --- | --- |
| Z1 Seeonee Hills | S4 swing and crumble flags (swinging creepers, crumbling terraces) | Master Words gates (S5 door + S1 interact), Chil (S6 query), Tabaqui's theft (S3 carrier flag) |
| Z2 The Waingunga | S4 carry and advance-on-hit flags with the S5 truce flag and the breakable tag (Hathi's sons, buffalo, thorn fences) | Trunk launch (bounce flag), clods (S2 set), hut doors (S5 door), villagers (S3 flee state) |
| Z3 The Jungle's Justice | S6 pouch and deposit (the inverted quota) | Buldeo (S3 Charger with a detect S5 child), Kaa's coils (S4 sine ease), thief langurs (S3 carrier) |
| Z4 Red Dog | S5 slow-water and safe-water flags with the garlic data row of the timed item | Bees (S3 Diver), hives (S3 Turret with a spawn payload), boulders (S4 started by a hit), the Pack (S3 team flag), the rally (S6 callback) |

### 3.5 Success and failure

| Event | Modern (default) | Retro |
| --- | --- | --- |
| Health reaches 0 | Mowgli sits down and shakes his head (no death frame); 0.6 s fade; respawn at the last pack-stone with 6 pips, every stone, the pouch, the clods and the meter kept | Same, and one life is lost |
| Pit or deep water | Instant respawn at the last pack-stone (0.6 s), no damage | Same, and one life is lost |
| Clock reaches 0:00 | No clock | Lose a life; respawn at the pack-stone with 6:00 |
| Lives reach 0 | No lives | Continue from the level start with 3 lives; unlimited continues |
| Level complete | Results card: stones x/15, time, deaths, best, the Honey Hollow door on Full Moon | Same, plus the score tally (cut-first) |
| Boss defeated | Victory card(s), map stamp, next page | Same |
| Game complete | The Spring Running, the Outsong over the credits, "And this is the last of the Mowgli stories." | Same; the clock is off in the ending |

There is no game-over screen in Modern mode and no fail state in the ending, the cinematics or Honey Hollow. Deaths and elapsed time are counted outside the respawn snapshot so retries still count on the results card.

### 3.6 The Act 1 false ending

Zone 2 ends where Kipling's first book ends. After B2's stampede and the dust, the Act 1 cinematic plays: the village gate walk-away (thrown clods, no blood), Council Rock at night with the hide as a symbol, the four cubs. Two cards follow: "Look well, O Wolves. Have I kept my word?" and "I am two Mowglis, but the hide of Shere Khan is under my feet." The storybook then closes on the page for 2 s, a short Outsong-free sting plays, and the book reopens on the Zone 3 page with Baloo's line and the reunion at the jungle edge. No credits roll, the title screen does not return, and the map shows two more zone pages. The question "I am two Mowglis" is the one that "Man goes to Man" answers in the ending; the beat is deliberately faithful (see docs/RESEARCH.md §4.1) and is written into the M3.2 playtest script as a check that testers understand the game continues (expected: 10 of 10 press on without asking).

## 4 Controls and input

### 4.1 Action set

Gameplay code reads nine abstract actions (Left, Right, Up, Down, Jump, Throw, Item, Cycle, Pause) and never a raw key, button or touch point. Interact is not a button: it is crouch-hold (Down held while standing at a thing) with a progress ring, so every device gets it for free.

| Action | Type | Gameplay meaning |
| --- | --- | --- |
| Left / Right | Held | Run; steer in the air at 65% control; aim direction for throws |
| Up | Held | Climb a creeper; aim a throw straight up; look up (camera) after 0.5 s |
| Down | Held | Crouch on the ground (hold or toggle per option); fast fall in the air; climb down a creeper; aim a throw downward; drop through a one-way platform with Jump; look down (camera) after 0.5 s; interact when held at an interact volume |
| Jump | Press edge, held for height | Ground jump, coyote jump, buffered jump, jump off a creeper, release from a swing, stomp bounce |
| Throw | Press edge | One throw of the current throwable in the 8-way aim direction |
| Item | Press edge | Toggle the Red Flower (or garlic in L7) on and off |
| Cycle | Press edge | Next throwable in the 3-slot cycle: nut, clod, timed item |
| Pause | Press edge | Pause menu; Escape is reserved and cannot be remapped away |

### 4.2 Keyboard map

Keys are bound by physical position (KeyboardEvent.code; docs/PLAN.md §4.6), so WASD works as ZQSD on an AZERTY keyboard without remapping. Two default sets are active at once; both are fully remappable in Options.

| Action | Set A | Set B |
| --- | --- | --- |
| Left / Right / Up / Down | Arrow keys | W A S D |
| Jump | Z or Space | J |
| Throw | X | K |
| Item | C | L |
| Cycle | V | I |
| Pause | Escape or Enter | Escape or Enter |
| Debug overlay (development builds only) | F3 | F3 |

Page scrolling is suppressed for bound gameplay keys only while the game canvas owns focus. Remapping rejects a key already bound to another action in the same set and shows the conflict; Escape stays bound to Pause in every configuration.

### 4.3 Gamepad map

The Gamepad API standard mapping is used; the pad is invisible to the game until the player presses a button, which is a browser rule, so the title screen accepts any pad button as "press any key". The pad is polled once per simulation tick.

| Action | Standard mapping | Default |
| --- | --- | --- |
| Left / Right / Up / Down | D-pad (buttons 12-15) and the left stick with a 0.25 deadzone | Both active |
| Jump | Button 0 (A / Cross) | Remappable |
| Throw | Button 2 (X / Square) | Remappable |
| Item | Button 1 (B / Circle) | Remappable |
| Cycle | Button 3 (Y / Triangle), also buttons 4 and 5 (LB / RB) | Remappable |
| Pause | Button 9 (Start) | Fixed |

Stick input maps to the same held directions as the D-pad; a stick angle within 22.5 degrees of a diagonal counts as both directions, so 8-way aiming works on a stick. Glyphs in prompts follow the last-used device (keyboard, pad or touch).

### 4.4 Touch map

Virtual controls appear only after the first touch, lock to landscape, and never appear on a desktop that has not been touched.

| Region | Control | Rule |
| --- | --- | --- |
| Bottom-left | Left and Right pads with a Down pad between them | Tap-and-hold buttons, not a floating joystick; a button stays held while the thumb slides off it and releases only on lift |
| Bottom-right | Jump (larger) and Throw | Jump is the outermost button so the thumb rests on it |
| Above Throw | Item and Cycle | Smaller, 48 px minimum |
| Top-right corner | Pause | Always visible while touch controls are shown |
| Sizes | 48 px minimum hit areas in CSS px; hit areas larger than the artwork | Two presets: compact and wide |
| Opacity | 20-80% slider | Persisted in settings |
| Aim | Touch aims horizontal by default; diagonal-down in the air with Down held; the Up quarter of the Down pad aims straight up, and with Left or Right, diagonal up | Cub-tier levels never require an upward touch throw on the critical path |

### 4.5 Input contract

| Rule | Value |
| --- | --- |
| Sampling | Every device is sampled into one action state once per 60 Hz simulation tick with pressed, held and released edges |
| Press edges | Jump, Throw, Item, Cycle and Pause are press edges; holding never repeats them |
| Held inputs | Left, Right, Up, Down; pressing Left and Right together gives zero horizontal intention |
| Jump buffer | 6 frames (100 ms): a Jump pressed before landing fires on the landing tick; a buffered press is consumed once |
| Coyote time | 6 frames (100 ms) after walking off an edge; never after a jump, a deliberate creeper release or a one-way drop |
| Throw buffer | 6 frames: a Throw pressed during the previous throw's 0.25 s cooldown fires when it ends |
| Jump held | Height depends on how long Jump is held (section 5.4); releasing early cuts the rise |
| Focus loss | Pause on tab hide or focus loss, clear every held input, show Resume; the game never resumes by itself |
| Audio | The audio context starts on the first gesture (the title screen's device prompt, section 11.4) |
| Persistence | Bindings, presets, opacity and hold-or-toggle crouch are saved with the settings record |

## 5 Movement and feel

### 5.1 Coordinate system and body

World positions are in pixels. Positive X points right and positive Y points down. A tile is 16x16 px. One screen is 320x180 px, which is 20 x 11.25 tiles. The hero frame is 32x32 px; the standing collision body is 12x22 px aligned to the feet (Mowgli's head sits about 8 px below the frame top, since the sprite is about 24 px tall per section 12.4, so hair can overhang the 22 px body), and the crouched body is 12x14 px on the same feet line. One-tile crouch passages are allowed: the 14 px crouched body clears a 16 px gap with 2 px to spare. Visual scale never changes collision dimensions; art swaps cannot change difficulty.

### 5.2 Tuning table

Every document uses these numbers (decision D09 of the project brief). The M1 gym level measures the reach and corrects the two "about" values; the rest are initial values tuned in M1 and M2.

| Parameter | Value | Unit | Purpose |
| --- | --- | --- | --- |
| Tile | 16 | px | Every metric below is written in tiles |
| Run speed | 96 (6 tiles/s) | px/s | Readable at 320x180; a screen crossed in 3.3 s |
| Walk speed | 48 | px/s | Precision near edges (a half-press on a stick, or the crouch-move speed) |
| Ground acceleration | 900 | px/s² | Full run in 0.107 s, reads as tight |
| Ground braking | 1200 | px/s² | Stop from full run in 0.08 s (about 4 px) |
| Turn braking | 1800 | px/s² | Reversal in 0.053 s so a mis-aimed run corrects instantly |
| Air control | 65% of ground values | ratio | 585 / 780 / 1170 px/s² in the air; a full air reversal takes about 0.16 s |
| Jump height | 56 (3.5 tiles) | px | A 3-tile ledge is the standard climb |
| Time to apex | 0.35 | s | Reactable arc; v0 = 2h/t, g = 2h/t2 |
| Jump launch speed | 320 | px/s | Derived: 2 x 56 / 0.35 |
| Rising gravity | 914 | px/s² | Derived: 2 x 56 / (0.35 x 0.35) |
| Falling gravity multiplier | 1.6 (about 1460 px/s²) | ratio | Weight without lowering the jump height; fall from apex in about 0.28 s |
| Apex hang | 0.5x gravity while abs(vy) < 32 px/s and Jump held | rule | A few frames at the peak to steer onto a stone or ledge |
| Jump cut on release | vy *= 0.5 | rule | One button, two verbs: a tap hops about 1.5 tiles, a hold leaps 3.5 |
| Max fall speed | 320 (5.3 px per tick) | px/s | Reactable drops; under one tile per fixed step, so no tunneling |
| Fast fall | 400 (6.7 px per tick) holding Down | px/s | Expert control on long vertical descents |
| Coyote time | 6 frames (100 ms) | frames | Honors a late press after leaving a ledge; 100 ms at 96 px/s is 10 px of overhang |
| Jump buffer | 6 frames (100 ms) | frames | Honors an early press before landing; symmetrical with coyote time |
| Jump horizontal boost | 32 | px/s | Added in the held direction on the jump tick so a standing-start jump still clears a 0.75x gap |
| Corner correction | 4 | px | A rising body that would clip a ceiling corner by 4 px or less is nudged sideways past it |
| Step-up | 4 | px | A running body whose feet are within 4 px below a lip steps onto it without a jump |
| Ledge grab capture | 6 horizontal / 8 vertical | px | Hands within this box of a lip while falling capture the ledge |
| Climb speed | 64 | px/s | Creepers, up and down |
| Swing period | About 1.6 s | s | A 4-tile creeper under rising gravity swings at 1.66 s, so the number is the physics, not a tween |
| Horizontal reach at full run | About 5.5 tiles (measure in M1) | tiles | Rise 0.35 s + fall about 0.28 s + apex hang about 0.08 s at 96-128 px/s gives 4.5-5.5 tiles plus the 12 px body width |
| Design gaps | 4 tiles (0.75x) or 5.5 tiles (1.0x), never 0.95x | tiles | Every level shares one ruler |
| Body | 12x22 standing, 12x14 crouched | px | One-tile crouch passages |
| Falls | No fall damage; pits and deep water respawn at the last pack-stone | rule | Vertical levels without a fall-height tax |

### 5.3 Metrics for level design

| Metric | Value | Rule for authors |
| --- | --- | --- |
| Standard jump-up ledge | 3 tiles (48 px, 0.86x of the 56 px apex) | The everyday climb; a 2-tile ledge is the casual hop |
| Ledge-grab climb | 4 tiles (64 px) | The hands (body top, 22 px above the feet) reach 78 px at the apex, 14 px above a 4-tile lip, so capture is comfortable; 5-tile walls (80 px, 0.93x of the 86 px capture ceiling) are never authored and use a mid ledge or a creeper instead |
| Gap at 0.75x | 4 tiles | The only gap on the L1 and L2 critical paths; the default gap everywhere |
| Gap at 1.0x | 5.5 tiles | Detours in L1-L2; any path from L3 on, always rehearsed once where a miss costs nothing |
| Standing-start gap | 2 tiles | With the 32 px/s boost only; never a required standing jump over a pit |
| Step-up | 4 px | Decorative roots and stones up to 4 px never stop a run |
| Crouch passage | 1 tile tall, any length | Throwing while crouched works inside it |
| Safe fall | Unlimited | No fall damage in any mode |
| One-screen drop rule | Any drop taller than 11 tiles either shows the landing (Down held 0.5 s pans the camera 48 px down) or is a marked fall-through to a new area | Never a blind drop onto a hazard |
| Fast-fall use | Optional | No route requires fast fall |
| Ceiling over a jump | At least 5 tiles of clearance above a required jump's takeoff | Corner correction covers 4 px, not a low ceiling |
| Enemy over a landing | Never at a blind ledge top | A langur above a ledge-grab lip must be visible before takeoff |

### 5.4 Running, jumping and crouching

Running applies acceleration toward the target speed and clamps it; reversing brakes at the turn value before accelerating the other way, and there is no forced turn animation. Animation follows velocity: idle, run, the two-frame jump rise and fall, and land.

Jumping uses the launch speed on the jump tick, adds the horizontal boost in the held direction, and holds the full rising gravity while Jump stays held. Releasing Jump on the way up halves the upward velocity once (jump cut), so a tap hops about 1.5 tiles and a full hold reaches 3.5 tiles. Within 32 px/s of the apex, with Jump held, gravity halves for the apex hang. Falling uses the 1.6x gravity. Hitting a ceiling cancels the upward velocity unless the corner correction can nudge the body sideways by 4 px or less into free space. Jumping is allowed from a standing crouch only after the standing-clearance check succeeds; otherwise the crouch jump is a low hop with the crouched body.

Crouching is hold or toggle (option). The feet stay fixed when switching bodies; if the standing rectangle overlaps a solid, Mowgli remains crouched and the sprite shows the crouch-walk. Crouch-move runs at the walk speed of 48 px/s. Throws from the crouch launch at half the standing height (section 7.2). Fast fall applies when Down is held in the air and the body is falling; it never applies during a ledge hang or a climb.

### 5.5 Corner correction, step-up and ledge grab

| Rule | Value |
| --- | --- |
| Corner correction | Checked on rising ticks only; the nudge is at most 4 px and only into free space; the arc is otherwise unchanged |
| Step-up | Checked on grounded ticks moving horizontally; the feet are lifted by at most 4 px onto the lip; never onto a hazard tile or an enemy |
| Ledge capture | Requires falling motion (vy > 0), input toward the wall or neutral, hands (the body top) within 6 px horizontally and 8 px vertically of a solid tile's top lip, 2 tiles of clear space above the lip, and no solid beside the hanging body |
| Capture suppression | Holding Down while falling suppresses capture; a 0.25 s regrab lock applies to the same ledge after a drop or a jump away |
| Hang | Velocity and gravity stop; no stamina, no timer; Up climbs, Down drops, Jump jumps away with the normal launch and boost |
| Pull-up | 0.3 s (18 ticks) committed climb shown with the climb clip (section 12.5); the standing rectangle at the destination must be clear or Mowgli stays hanging |
| Hazards while hanging | Enemy hits cancel the hang and apply the hit response of section 7.5; no required enemy attack is placed at a blind ledge top |

## 6 Traversal

### 6.1 Creepers (static)

| Rule | Value |
| --- | --- |
| Grab | Automatic on overlap with a creeper column while airborne, or when Up is pressed while grounded under it; holding Down while falling suppresses the grab |
| Climb | 64 px/s up and down; Left and Right move 48 px/s along a horizontal creeper (tree-roads) |
| Release | Jump launches a normal jump with the horizontal boost in the held direction; Down at the bottom drops; a 0.25 s regrab lock applies to the same creeper after a release |
| Throwing | Allowed from every creeper with the full 8-way aim; there is no hidden refusal |
| Enemies | Langur nuts and cobra strikes hit a climbing Mowgli; a hit does not detach him (the hit response plays in place) |
| Authoring | Creeper tiles carry a climbable flag in Tiled; a column is at least 2 tiles tall; the first creeper of every level is over safe ground |

### 6.2 Swinging creepers

The Zone 1 coded mechanic is an S4 path-follower with the swing flag: a pendulum of 4 tiles (64 px) under the rising gravity, which gives a period of about 1.6 s, amplitude plus or minus 40 degrees, and a bottom that travels about 41 px each side of the pivot and rises 15 px at the extremes.

| Rule | Value |
| --- | --- |
| Grab | Automatic on overlap with the rope's lower half; Mowgli hangs at the rope end and the rope keeps its phase |
| Ride | Mowgli's position follows the rope end each tick; Left and Right add a 10% pump per swing up to the amplitude cap; Up and Down climb the rope at 64 px/s within its lower 2 tiles |
| Release | Jump at any point launches a normal jump whose starting horizontal velocity is the rope end's current horizontal velocity (capped at the run speed) plus the boost; released at the forward extreme this clears a 4-tile gap measured from the extreme (verify in M0) |
| Chains | Chained swings on the L2 critical path are placed at 0.75x; a 1.0x chain exists only on the L2 detour with 2 stones |
| Idle | An unoccupied rope swings on; the first grab of a level happens over safe ground |
| Fallback | If the pendulum grab and release do not verify in M0, the level ships static creepers plus a jump at the same gap widths |

### 6.3 Helper animals as platforms

All helpers are S4 path-followers (carry flag) with per-animal parameters; the platform's displacement is added to Mowgli's position each tick while he stands on it, and a jump inherits the platform's velocity. Every back is a one-way platform, so a jump from below lands on it.

| Helper | Levels | Speed and path | Extras |
| --- | --- | --- | --- |
| Kaa's coils | L6 (B3 edges as a should) | 3-segment carry platforms on a Tiled path at 48 px/s with a sine ease and a 4 s period | Head-lift: stand on the head 0.6 s, it rises 4 tiles, waits 2 s, lowers |
| Hathi's three sons | L3 | Walk the dry riverbed at 32 px/s as 4-tile backs; wait 2 s at each Peace Rock marker so slower players can board | Trunk launch (bounce flag): stand on a raised trunk tip 0.5 s and be thrown 5 tiles up |
| Buffalo herd and Rama | L4, B2 | 3-tile backs at 48 px/s on field rows and ravine floors | Advance-on-hit: a nut on a bull's rump sends it charging to the next waypoint at 96 px/s for 2 s, breaking thorn fences (breakable tag); Rama crosses the B2 floor at 48 px/s |
| Floating logs | L8 | 32 px/s along the river bank | Sink 2 px under Mowgli's weight, cosmetic |
| Boulders | L7 | S4 platforms started by a nut hit; roll down the cliff top and smash hives below | Never a required ride |
| Crumbling ledges and terraces | L2, L3, B2 | Crumble 0.5 s after landing, fall through, respawn 4 s later | Cracks are visible before contact; the falling art has no collision |

### 6.4 One-way platforms

Tiles and animal backs flagged one-way collide only from above: Mowgli passes through them while rising and lands on them while falling. Holding Down and pressing Jump drops through with a 0.2 s pass-through window and no coyote time. One-way platforms are drawn with a visible underside (a lighter lip) so the rule reads without text. Stomps on an enemy standing on a one-way platform work like any stomp.

### 6.5 Water and pits

| Volume | Rule |
| --- | --- |
| Pit (below the level's bottom bound or a marked chasm) | Instant respawn at the last pack-stone after a 0.6 s fade; no damage; Retro loses a life |
| Deep water (dark blue, no visible bottom) | Same as a pit; the splash is the only feedback |
| Shallow water (visible bottom) | Cosmetic; footsteps splash; no speed change |
| Slow water (L8 shallows, S5 slow-water flag) | Run at 50% (48 px/s); jump unchanged; dholes lunge at 96 px/s instead of 144 |
| Safe water (L7 pool, S5 safe-water flag) | Ends the level on entry: Kaa waits in the shallows, the results card follows |
| Truce zone (L3, S5 truce flag) | Every enemy is passive and walks to drink; Mowgli's throws drop at his feet with a soft "no" sting |

There is no swim verb: Mowgli never swims in v1, and no water volume asks him to.

## 7 Throwing and enemies

### 7.1 The throw ladder

The cycle has at most 3 slots on the Cycle button: nut, clod, timed item (the Red Flower, or garlic in L7). Two dots show under the throwable icon while no timed item is owned. Bosses take exactly 1 hit per projectile that connects inside a recovery window; outside the window the projectile bounces off with a "tok" and no effect. The universal drop: any throw that hits a hanging mahua bunch drops the designer-placed item (a moon-stone, a clod pile, a fire-pot or a mahua flower).

| Item | EN / PT-BR | Ammo | Flight | Effect | Pickup | Tier |
| --- | --- | --- | --- | --- | --- | --- |
| Nut | Nut / Noz | Unlimited; 1 throw per 0.25 s; max 3 on screen | 8-way aimed, 224 px/s, light arc (0.25x gravity), range about 7 tiles | 1 damage; scatters throwers, chargers and divers; thrown from the crouch at half height for low targets | None: Mowgli's shoulder bag refills itself (idle gag) | must |
| Clod | Clod / Torrão | Piles of 5; cap 20; count on the HUD; kept between levels, reset at zone start | Straight, 320 px/s, range 9 tiles | 2 damage; knocks a charger back 1 tile; breaks cracked walls and clay pots; on a boss it extends the current recovery window by 0.2 s; on landing on the floor it bursts into a 2-tile dust puff that stuns ground enemies for 1.0 s without damage | Dry-mud clod piles from L3 on; inside bunches | must |
| Bent Stick | Bent Stick / Galho Torto | Bundles of 3; cap 9; a returned stick is not spent | 5 tiles at 192 px/s, hangs 0.2 s, returns along its path | 1 damage per pass (can hit twice) | Bunches from Zone 2 on | cut-first; if it ships it is the only exception to the 3-slot rule |

### 7.2 Aiming rules

| Situation | Direction of the throw |
| --- | --- |
| No direction held | Horizontal, facing direction, launched from shoulder height (14 px above the feet) |
| Left or Right held | Horizontal in that direction (Mowgli turns first) |
| Up held | Straight up |
| Up and a side held | Diagonal up |
| Down and a side held in the air | Diagonal down |
| Down held on the ground | Crouch throw: horizontal at half height (7 px above the feet) for cobras and low targets |
| Down held in the air, no side | Straight down |
| On a creeper or swing | Same rules; Up and Down aim rather than climb while Throw is pressed within the same tick |
| Touch | Section 4.4 |

A throw takes 3 frames (0.05 s) before the projectile appears, during which Mowgli keeps moving; there is no aim lock and no stop. Projectiles disappear on hitting a solid, striking a target, leaving the level bounds or living more than 3 s.

### 7.3 The Red Flower and garlic

The Red Flower / Flor Vermelha is a clay fire-pot on a cord and the timed defensive item. Toggle it with Item; press again to snuff it and keep the meter. Meter: +8 s per pot, cap 24 s, kept between levels within a zone and shown as a 24x3 px ember bar under the health pips. While lit, every regular enemy within 6 tiles enters the flee state (turns away, 1.5x speed for 2 s, no contact damage, no attacks): Bandar-log cover their eyes, Tabaqui yelps with his tail down, cobras sink into their holes, bees pull back 4 tiles, dholes stop at the light's edge, Buldeo backs away 4 tiles. Enemies in flee are stompable; enemy projectiles already in flight stay live. It never burns or hurts anything, never protects from pits or deep water, and bosses ignore it (lighting it in B1 makes the mob back off 2 tiles for 1 s, no damage). Visual: pot glow plus a 2-frame flicker, no full-screen flash.

Garlic / Alho (L7 only) is one data row of the same class: it affects bees only, 15 s per rub, cap 30 s, and takes the Red Flower's slot icon in L7; the Red Flower meter is stored and returns in L8.

### 7.4 Stomp rules

| Rule | Value |
| --- | --- |
| Stomp condition | Mowgli is falling (vy > 0) and his feet are above the enemy's top edge minus 4 px on the contact tick |
| Effect | 1 hit to the enemy; Mowgli bounces with a 296 px/s launch (3 tiles), or the full 320 px/s (3.5 tiles) if Jump is held on the bounce tick; the bounce grants coyote-free air control and can chain |
| Stompable | Langurs (1 and 5), Tabaqui, jackals and village dogs, dhole scouts (the second of a pair in its recovery), any enemy in the flee state |
| Never stompable | Cobras and white cobras (keep peace with the Poison People: the head is not a platform), the quill-pig (touching its back costs a hit), bee swarms (cannot be hit), Buldeo, every boss (stomping a boss add never counts as a boss hit) |
| Side contact | Touching a contact-damage enemy anywhere but its top costs a hit; carrier-flag enemies (Tabaqui, jackals) never hurt Mowgli |
| Hit boxes | The stomp box is the body's bottom 4 px; the enemy's top box is its top 4 px; both are drawn in the development overlay and measured in the gym so the 1994 complaint about finicky stomps (see docs/RESEARCH.md §1.9) does not repeat |

### 7.5 Hit response and invulnerability

| Parameter | Value |
| --- | --- |
| Health | 6 leaf pips; damage per hit by tier: Cub 1, Wolf 2, Lone Wolf 3 |
| Knockback | 96 px/s away from the source for 0.2 s plus a 160 px/s upward impulse; stopped at walls; never through geometry |
| Control | Returns after 0.2 s; the hurt pose holds 2 frames |
| Invulnerability | 1.0 s after a hit; a 4 Hz sprite blink, or a dim outline pulse when flash reduction is on |
| Lethal volumes | Pits and deep water bypass invulnerability and Assist invincibility |
| Cards and cinematics | No damage is possible while a card is up or a cinematic plays |
| Contact rule | At most one damage event per tick; a per-projectile hit record so one nut cannot hit twice |
| Healing | Touching a pack-stone restores all 6 pips; a mahua flower (dropped from bunches, at most 3 per level) restores 1 pip; Honey Hollow honeycombs restore 2 pips each |
| Pouch and clods | The L6 pouch survives hits and respawn (must); clods and the Red Flower meter survive hits and respawn |

### 7.6 Telegraph contract

Every enemy and every boss attack obeys these rules; they are pillar P3 made testable.

- Two channels always: a pose and a sound. A ground marker for anything that lands or falls: a shadow disc under every lobbed projectile (two discs for a coin that bounces once), a dust puff where a boss will land, a ceiling glint where a cluster will fall.
- Wind-ups: standard at least 0.5 s; heavy 0.8-1.2 s. Never faked: a wind-up always ends in the attack it announces. The anchor is the 273 ms median visual reaction time (see docs/RESEARCH.md §5).
- Recovery windows (the boss is hittable): standard Cub 1.0 / Wolf 0.6 / Lone Wolf 0.4 s; heavy Cub 1.2 / Wolf 0.8 / Lone Wolf 0.5 s. Never 0.3 s.
- One canonical pose per script, so a child learns four shapes: Charger = crouch with flat ears plus a growl or yip and a dust puff at the paws; Lobber = rear up plus a squeak or rattle, then the shadow disc; Turret = hood flare or bristle plus a hiss; Diver = the cloud tightens and dips plus a rising buzz. Every reskin keeps its script's pose.
- No invisible hazards: cobras, quills and hives are always drawn; nothing hostile hides outside a light radius. No hurt frames: every scatter is a flee or a hide.
- An off-screen enemy never starts an attack; a spawned enemy never appears with an active attack.

### 7.7 Enemy roster

8 entries on 4 scripts: 6 base sprites and 3 palette swaps, about 2 per zone. Hits-to-scatter do not change with tier; the damage Mowgli takes does. Buldeo is a hazard NPC on the Charger script with a detect child (section 10.7); he takes no hits and is not an enemy entry.

| # | Enemy (EN / PT-BR) | Script | Zone, first level | Behavior | Telegraph | Counter | Hits to scatter | Scatter gag |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Langur nut-thrower / Langur | Lobber | Z1, L1 | Sits on a branch or wall and never moves; lobs a nut (160 px/s arc) every 2.0 s at Mowgli within 8 tiles | Rear up 0.6 s + squeak; a shadow disc on the landing spot | Stomp from above (bounce 3 tiles), 2 nuts or 1 clod; walk under the arc; crouch under a landing nut | 2 | Covers its eyes, drops off the branch and scampers off-screen |
| 2 | Tabaqui, jackals and village dogs / Tabaqui, chacais e cães da aldeia | Charger | Z1, L1 (dogs from L4) | Patrols a 6-tile span at 48 px/s. Tabaqui and the jackals carry the carrier flag and no contact damage: Tabaqui runs to the nearest floor stone within 6 tiles, lifts it visibly above his head and trots off at 96 px/s, dropping it where he stops; he never hurts Mowgli. Dogs (palette swap with 2 extra frames, contact damage) charge 4 tiles at 128 px/s for 1.0 s when Mowgli is in line, recover 0.8 s, trot back, and never enter huts | Crouch + tail wag + yip 0.6 s (dogs: growl + dust puff 0.5 s) | 2 nuts, 1 clod or a stomp: Tabaqui drops the stone and flees 10 s; dogs: jump over (1 tile tall) or stomp in the recovery | 1 (Tabaqui) / 2 (dogs) | Yelps and runs with the tail between the legs |
| 3 | Cobra of the Poison People / Naja do Povo do Veneno | Turret | Z1, L2 | Coiled in a window, hole or grass; within 3 tiles it rears and lunges 2 tiles forward and 1.5 tiles high, active 0.3 s, then rests out of the hole 1.0 s; never spits; passive inside truce zones (walks to drink) | Hood flare + hiss 0.6 s | Crouch under (the 14 px body clears the lunge), jump over, keep 3 tiles away, or 2 nuts / 1 clod: it sinks into its hole for 8 s; the Snake-gate calms a room for 10 s; never stompable | 2 | Retreats into its hole |
| 4 | Quill-pig / Porco-espinho (unnamed, never Ikki) | Lobber (straight shots, patrols) | Z2, L3 | Waddles a 6-tile span at 32 px/s; within 5 tiles it stops and shakes two quills loose straight ahead at 160 px/s, one low (0.5 tile) and one high (1.5 tiles), every 2.5 s; touching its back costs a hit, so no stomp | Rear up (quills bristle) + rattle 0.6 s | Jump the low quill and crouch under the high one, or 3 nuts / 2 clods; passive in truce zones | 3 | Bristles, backs off and waddles off-screen (never rolls into a ball) |
| 5 | Coin-thrower langur / Langur das moedas (palette swap of 1) | Lobber | Z3, L6 | As card 1, with coins that bounce once: two shadow discs, and the safe spot is between them; the thief variant carries the carrier flag and takes floor jewels (should tier) | Rear up + jingle 0.6 s | As card 1 | 2 | As card 1 |
| 6 | White cobra / Naja branca (palette swap of 3, 1 extra frame) | Turret | Z3, L6 | As card 3, strikes twice (0.3 s, 0.4 s gap, 0.3 s) before the 1.0 s rest; always drawn in the dim vault | Brighter hood flare + hiss 0.6 s | Wait out both strikes, then pass; 2 nuts / 1 clod hides it 8 s | 2 | As card 3 |
| 7 | Dhole scout pair / Dole, o Cão Vermelho | Charger, paired, contact damage | Z4, L7 | Pairs 24 px apart; patrol 64 px/s; lunge 3 tiles long and 1.2 tiles high at 144 px/s, recover 0.6 s; the second lunges 0.4 s after the first; in slow water 96 px/s; never shown wounded | Crouch + flat ears + growl 0.5 s (both together) | Jump the pair, stomp the second in its recovery (bounce chain), 3 nuts / 2 clods, the Pack's shove, or lead them into slow water | 3 | Yelps and runs back off-screen (in L8 returns after 8 s as pressure) |
| 8 | Wild bee swarm, the Little People / Enxame, o Povo Pequeno | Diver (a hazard that cannot be hit) | Z4, L7 | A hive (Turret with a spawn payload) releases a 24x24 cloud when Mowgli is within 3 tiles without garlic; the cloud pursues at 64 px/s on a 12-tile leash, 1 hit per 0.5 s of contact, returns after 6 s | The hive buzzes louder and shakes 0.6 s; the cloud tightens with a rising buzz 0.5 s before it moves | Garlic (ignored 15 s), the Red Flower (pulls back 4 tiles), outrun it (96 > 64), or leave the leash | 0 (cannot be hit) | Returns to the hive |

## 8 Bosses

### 8.1 Boss rules

- Three phases, at most two attacks per phase, one arena layout per boss (a should-tier arena change has a one-layout fallback). Hits per phase by tier: 2 / 3 / 4 (6 / 9 / 12 total). Bosses take projectiles only; stomping an add never counts.
- Attacks are S3 scripts scaled up (Lobber, Charger, Turret) with the wind-up, active and recovery values in each sheet; recovery is listed as Cub / Wolf / Lone Wolf. A clod extends the current window by 0.2 s.
- Structure follows Mike Stout's eight beats and the rule of three: three phases, one new attack per phase layered on the last, the midpoint as a transformation (see docs/RESEARCH.md §5).
- Every boss tests only skills taught in the two levels before it and nothing new; each sheet lists the skills and the level that taught them. A boss that needs an untaught skill is a design bug.
- Checkpoint at every boss door, instant retry, no card replay on retry. Every cinematic is authored as timeline data with a 12 h cap and a card fallback.
- The phase bar: 3 phase dots at the bottom center, each a group of 2 / 3 / 4 pips by tier; B4 adds 5 paw icons (Pack strength).
- The finale (B4) sits below peak intensity: one arena, no flood pulse, no rock repositioning, the Pack absorbs pressure.
- The Red Flower does nothing to a boss beyond a 1 s, 2-tile back-off in B1.

### 8.2 B1 The Flung Festoon (the Bandar-log mob on the Cold Lairs terrace)

| Beat | Content |
| --- | --- |
| 1 Build-up | L2's descent ends at the tank terrace; the chatter swells; the moon slides behind a cloud |
| 2 Intro | The mob pours over the summer-house dome; Bagheera and Baloo hold the terrace edge as silhouettes (no blows land); the phase bar appears |
| 3 Business as usual | Phase 1, nut rain from three rim spots; hit a thrower while it leans over the rim |
| 4 Escalation | Phase 2, the festoon: a chain of langurs swings across the terrace as a pendulum |
| 5 Midpoint | The mob shoves Mowgli into the summer-house (cinematic); the Snake's Call calms the cobras inside; he climbs out; a marble slab falls and leaves a 2-tile step |
| 6 It's on | Phase 3, the push and cobra strikes from the windows |
| 7 Resolution | Kaa breaks the wall (shake); the Dance of the Hunger of Kaa: every langur freezes and sways (stunned state); Bagheera and Baloo begin to sway toward Kaa; Mowgli, whom the Dance cannot touch, runs to each and holds Down beside them for 2 s ("a hand on my shoulder", progress ring); until both are held they drift comically toward the dome and Mowgli's hand pulls them back; no penalty, no timer |
| 8 Victory | Dawn; the frozen monkeys wake and scatter over the walls into the trees, nothing shown eaten; Bagheera's comic love-taps; Kaa's card |

| Phase (hits) | Attack | Wind-up | Active | Recovery (C / W / L) | Counter | Arena |
| --- | --- | --- | --- | --- | --- | --- |
| 1 (2/3/4) | Nut rain: three rim langurs lob nuts on a 2.0 s cycle | 0.6 s rear up + squeak, shadow disc | 0.5 s | 1.0 / 0.6 / 0.4 s, the thrower leans over the rim | Step off the disc, throw straight up at the leaning thrower (1 hit each) | Flat terrace with two 1-tile steps; the dome at the back |
| 2 (2/3/4) | Festoon sweep: an S4 pendulum chain 2 tiles above the floor at its center | 0.8 s chatter crescendo on the dome | 1.6 s one swing | 1.2 / 0.8 / 0.5 s hanging at the far end, the lowest langur exposed at 1.5 tiles | Crouch under or jump the chain at mid-swing, then throw at the lowest langur | Same; nut rain continues from one rim spot |
| 3 (2/3/4) | The push: the mob forms a 4-tile-wide line and crosses the floor at 96 px/s | 1.0 s stamping + chatter | 0.6 s | 1.2 / 0.8 / 0.5 s tripped on the slab in a pile | Jump onto the slab or the dome step as the line passes, then throw one nut into the pile | Cobra strikes from two wall windows (Turret, 0.6 s hood + hiss, 0.3 s lunge 2 tiles at 1 tile height): crouch under |

Skills tested: the upward throw (L1), crouch-under and jump-over timing (L2 creepers and windows), stepping onto a platform under pressure (L2 terraces), reading the shadow disc (L1). Resolution: fear defeated, no monkey harmed, the Bandar-log leaderless throughout (no chief, no throne, no chest-beating); Kaa becomes a friend and the L2 exit.

### 8.3 B2 The Lame One in the Ravine (Shere Khan)

| Beat | Content |
| --- | --- |
| 1 Build-up | Grey Brother's news; Akela's midday howl; the herd splits (10 s panorama: cows to the foot, bulls to the head) |
| 2 Intro | Shere Khan asleep and full on the ravine floor; the first nut wakes him; he limps, roars (2 s shake); Tabaqui yaps beside him and stays alive throughout |
| 3 Business as usual | Phase 1: the lame charge along the floor; wait on a boulder and hit his nose while he stumbles |
| 4 Escalation | Phase 2: the pounce from the wall; Tabaqui runs to the boulder he will land on (living telegraph; fallback: a dust mark) |
| 5 Midpoint | He corners Mowgli against the wall; Rama bellows above; Mowgli climbs onto Rama's back (cinematic); the boulders crumble |
| 6 It's on | Phase 3 on Rama's back as Rama crosses the floor back and forth (an S4 platform, no auto-scroll, camera bounded to the arena) |
| 7 Resolution | The herd pours in from both ends (the L4 buffalo groups plus the dust emitter); dust fills the screen 3 s; silence |
| 8 Victory | The dust settles on an empty ravine; card; the Act 1 cinematic: the village gate walk-away (thrown clods, no blood), Council Rock at night with the hide as a symbol, the four cubs; the Act 1 card |

| Phase (hits) | Attack | Wind-up | Active | Recovery (C / W / L) | Counter | Arena |
| --- | --- | --- | --- | --- | --- | --- |
| 1 (2/3/4) | Lame charge across the floor at 160 px/s | 0.8 s crouch + tail lash + growl, dust puff | 0.6 s | 1.2 / 0.8 / 0.5 s stumbling on the lame leg at the wall | Stand on one of three 2-tile boulders, throw at his nose as he stumbles | Ravine floor 24 tiles wide, three boulders, walls both sides |
| 1 | Roar: pushes a standing Mowgli 2 tiles, no damage | 0.5 s chest swell + intake | 0.4 s | 1.0 / 0.6 / 0.4 s | Crouch through it (it only moves a standing Mowgli), keep the boulder, throw | Same |
| 2 (2/3/4) | Pounce from the wall: a 6-tile arc onto a boulder | 0.9 s climbs 3 tiles up the wall + growl; Tabaqui marks the landing boulder | 0.5 s | 1.2 / 0.8 / 0.5 s landing on the lame leg; the boulder crumbles and respawns in 4 s | Leave the marked boulder, run under the arc, throw as he lands | Same |
| 2 | Lame charge (as phase 1) | as above | as above | as above | as above | Same |
| 3 (2/3/4) | Swipe at Rama: a paw sweep 1.5 tiles above Rama's back | 0.6 s paw raised + growl | 0.3 s | 1.0 / 0.6 / 0.4 s paw stuck in the dust | Crouch on Rama's back under the swipe, throw at his flank | Rama crosses the floor at 48 px/s |
| 3 | Falling rock: every 4.0 s a rock falls into one of three lanes over Rama's back (head, middle, rump); an arena hazard, not a boss attack | 0.8 s ceiling glint + rumble + a dust puff on the target lane | 0.4 s | No recovery window | Step off the marked lane; the rock never targets the lane the swipe covers in the same 2 s | Same |
| 3 | Roar (as phase 1) | as above | as above | as above | Crouch or hold toward him on Rama's back | Same |

Skills tested: riding animal platforms (L3, L4), crouch under sweeps (L2, L3), aimed throws in recovery windows (B1), leaving crumbling footing in time (L2, L3). Resolution: the scripted stampede, dust and silence, no gore; the hide appears only as a symbol in the Act 1 cinematic; Buldeo claims the hide and backs away when Akela stands over it (no text); Tabaqui flees. Optional card, off by default, decided by the M2 family playtest: "Brother, I go to my lair--to die."

### 8.4 B3 Thuu, the White Hood (the White Cobra of the vault)

| Beat | Content |
| --- | --- |
| 1 Build-up | The L6 descent; a dry voice from the dark; the coins go quiet |
| 2 Intro | The lamplit heap; Thuu rises white, blind and old; the ankus glints beside him; he tracks Mowgli by sound (faces the last throw) |
| 3 Business as usual | Phase 1: strikes at where Mowgli stood and coil sweeps; throw at the hood while his head rests on the floor |
| 4 Escalation | Phase 2: the treasure toss marks the floor with falling coin clusters |
| 5 Midpoint | Cinematic, no text: Thuu lunges once more and the stroke falls short; the pedestal lid slides and Mowgli sees the dry, pale fangs; Thuu is furious |
| 6 It's on | Phase 3: double strikes and coin dust; Kaa's coils rise at both edges as high safe ground (should; fallback: the two coin heaps) |
| 7 Resolution | His last strike falls short and the loose brass plate on the heap tips over his hood (cinematic); Mowgli holds Down beside the plate for 2 s to lift it and free him; no tool touches Thuu |
| 8 Victory | Thuu curls up on his heap; Bagheera explains the ankus; Mowgli leaves it on the heap and the jewels stay in the vault; the card |

| Phase (hits) | Attack | Wind-up | Active | Recovery (C / W / L) | Counter | Arena |
| --- | --- | --- | --- | --- | --- | --- |
| 1 (2/3/4) | Strike: 2-tile reach, 1.5 tiles high, aimed at where Mowgli stood 0.6 s ago | 0.6 s hood flares white + hiss | 0.3 s | 1.0 / 0.6 / 0.4 s head on the floor | Sidestep 2 tiles (he is blind) or crouch under, then throw at the hood | Vault floor 20 tiles wide around the heap; two 1-tile coin heaps; lamps lit; dim palette |
| 1 | Coil sweep: a 1-tile-high tail sweep across 8 tiles | 0.8 s tail rises + coins rattle | 0.5 s | 1.0 / 0.6 / 0.4 s | Jump the sweep or stand on a heap, throw | Same |
| 2 (2/3/4) | Treasure toss: coin clusters (S2 Lobber sets) fall on three marked spots | 1.0 s rears + coins rattle + three ceiling glints | 0.8 s | 1.2 / 0.8 / 0.5 s panting | Stand off the marks, throw | Same |
| 2 | Strike (as phase 1, 0.5 s wind-up) | 0.5 s | 0.3 s | as above | as above | Same |
| 3 (2/3/4) | Double strike: two strikes 0.4 s apart at the last two positions | 0.9 s hood flares twice + a double hiss, head tracking the last two positions | 0.9 s | 1.2 / 0.8 / 0.5 s | Move twice or jump between, then throw | Coils at the edges (should) |
| 3 | Coin dust: two slow dust arcs at 120 px/s, 1 hit each (no venom: his poison is dry) | 0.7 s coils + intake | 0.6 s | 1.0 / 0.6 / 0.4 s | Crouch under the arcs or stand on a heap, throw | Same |

Skills tested: crouch-under timing (L2, L3), jumping sweeps from moving footing (L6 coils), aimed throws at a moving hood (B1, B2), reading floor markers before impact (L6 bouncing coins). Resolution: pinned by a plate and spared; no bite ever lands on Mowgli; the ankus is never a pickup and never touches a creature; "It is Death" is never quoted.

### 8.5 B4 Red Dog at the Ford (the dhole pack in three waves)

Win condition in one sentence: hit the bay-colored leader 2 / 3 / 4 times per wave (6 / 9 / 12 in total). Pack strength / Força da Alcateia is a visible bonus of 0-5 paws that only reduces pressure and never fails the fight: it starts at 1 paw per 3 wolves rallied in L8 (15 rallied = 5), gains 1 paw per hit on the leader (cap 5), loses 1 paw when a dhole reaches Mowgli's rock (floor 0), and each paw gives the Pack a 10% chance to intercept a dhole with a visible lunge and bark before it reaches the rocks. The leader keeps his tail (tugged in the L7 cinematic, never cut).

| Beat | Content |
| --- | --- |
| 1 Build-up | The L8 rally; the pheeal at dusk; the Pack takes the near bank; card "It is met, and we go to the fight. Bay! O Bay!" |
| 2 Intro | The dholes pour down the far bank into the river behind the bay-colored leader; the bar shows the leader's pips and the paws |
| 3 Business as usual | Wave 1: pair lunges across the shallows; Mowgli on three rocks hits the leader while he pants on the far rock |
| 4 Escalation | Wave 2: lunges from both banks and leader rushes |
| 5 Midpoint | Akela, old and slow, steps into the ford (cinematic); the Pack answers his howl (+2 paws) |
| 6 It's on | Wave 3: the leader leaps onto Mowgli's rock; the wolves wade in beside him |
| 7 Resolution | At the last hit Akela's charge bowls the leader into the current; the dholes turn and swim off downstream; none is shown hurt; dawn |
| 8 Victory | Akela lies down on the bank as if to sleep; "All debts are paid now. Go to thine own people."; Phao: "Howl, dogs! A Wolf has died to-night!"; the Pack howls; the one gently handled death, without wounds; then the Spring Running |

| Wave (hits) | Attack | Wind-up | Active | Recovery (C / W / L) | Counter | Arena |
| --- | --- | --- | --- | --- | --- | --- |
| 1 (2/3/4) | Dhole pair lunge: 1.2 tiles high across the shallows at 96 px/s (adds, no boss hit) | 0.5 s crouch + flat ears + growl | 0.4 s | 1.0 / 0.6 / 0.4 s shaking itself in the shallows | Jump the lunge; stomp or 2 nuts bowl it downstream (a 2-hit variant of card 7) | Three rocks in the ford with slow water between; the Pack on the near bank |
| 1 | Leader rush across the three rocks at 128 px/s | 0.8 s stands, shakes, bays | 0.7 s | 1.2 / 0.8 / 0.5 s panting on the far rock | Jump as he crosses, throw while he pants (1 hit, +1 paw) | Same |
| 2 (2/3/4) | Two-sided lunge: pairs from both banks | 0.9 s both pairs crouch with flat ears + howls announce left and right | 0.8 s | 1.0 / 0.6 / 0.4 s | Hold the middle rock, jump the crossing point | Same |
| 2 | Leader rush (as wave 1) | as above | as above | as above | as above | Same |
| 3 (2/3/4) | Leader leap onto Mowgli's rock | 1.0 s stands, shakes, bays, dust puff on the target rock | 0.5 s | 1.2 / 0.8 / 0.5 s slipping on the wet stone | Hop to the next rock (4-tile gap, 0.75x), throw while he slips | Same; the Pack wades in beside Mowgli (should: rain and a cosmetic water rise) |
| 3 | Dhole pair lunge (as wave 1), intercepted by the Pack per paw | as above | as above | as above | as above | Same |

Skills tested: stomp bounce chains (L7, L8), aimed throws under time pressure (all bosses), moving footing and slow water (L8), reading two-sided telegraphs (L7, L8). Resolution: routed, not killed; no body count, no wounds; Akela's farewell as a quiet cutscene; then the non-combat finale. Cut-first: the flood pulse and rock repositioning stay out; rain and the water rise are cosmetic.

## 9 Collectibles, checkpoints and modes

### 9.1 Moon-stones

Name: Moon-stone / Pedra-da-lua. White quartz pebbles that catch the moon; the Seeonee cubs' oldest game is "count the glints", and Baloo's first Law lesson sets the task: the Jungle keeps count, and no elder leads a cub who cannot find what the Jungle hides. They are the Jungle's own stones, never treasure and never man's things, so gathering them after the ankus vow of L6 breaks nothing. One 16x16 sprite, one bounce animation, one pickup chime with rising pitch (the pitch climbs one semitone per stone in a level and resets on respawn); a single pale color with a 1 px dark outline; a cosmetic per-zone glint tint (warm, amber, cool, blue) with no rule attached; secret stones glint every 2 s.

| Rule | Value |
| --- | --- |
| Per level | 15 |
| Quota | Cub 8, Wolf 10, Lone Wolf 12 |
| Quota met | Counter flips gold, a two-note wolf-call sting plays, the exit character's silhouette replaces the counter icon for 3 s with the toast "Find Akela" / "Encontre Akela", the exit character calls once and starts its beckon loop, Chil flies toward it on every tier |
| 15 of 15 | "Full Moon" / "Lua Cheia": a full-moon stamp on the map page and the Honey Hollow door on the results card |
| Placement (every level) | 9 on the critical path, 4 on visible side branches, 2 signposted secrets that never hold quota stones; a straight run yields the Cub quota, Wolf needs one branch, Lone Wolf needs three |
| Secrets | Signposted: fireflies, a lone glint through a crack, a darker crack texture, an odd dead end; never mandatory |
| Loss | A collected stone is never lost (Modern and Retro); Tabaqui and thief langurs take floor stones only |
| Persistence | Stones are saved per level as 15 flags at every pack-stone and level exit; a stone collected before a death stays collected |
| Rule changes | Exactly two in the game: L6 (bank) and L8 (rally). Each is one sentence on the level's intro card and is taught in the first 20 s of play. L7 uses plain moon-stones |
| Counter | "found 8/10" with a small 15 always visible (Modern); counts down from 15 (Retro) |

### 9.2 Chil, the diegetic compass

| Tier | Where Chil helps |
| --- | --- |
| Cub | Every level from L1 on |
| Wolf | L2 and L7 |
| Lone Wolf | None |
| All tiers | Flies to the exit character at quota; the Assist option "Chil everywhere" forces him on every level |

Chil circles 3 tiles above the lowest-numbered uncollected stone within 20 tiles (a designer-set order in Tiled, so he never points across a wall); when the target is off-screen he sits at the screen edge as a small silhouette pointing the way; he cries every 3 s (mono). He is introduced in the story at L2's first Bird-gate; on Cub he simply follows from L1 on. He never points at a secret stone.

### 9.3 Zone 3 inversion (L6 King's Treasure)

The 15 collectibles of L6 are the King's jewels / joias do Rei (skin: a faceted red jewel, an icon distinct from the moon-stone). Picking one up puts it in a pouch, shown as a small "in hand" number beside the counter; it counts only when banked, by walking into the vault altar (an S6 ExitNPC with the count-pouch callback). The counter reads "banked 4/10" with an altar icon and counts up like every other counter. The pouch survives hits and respawn (must). Thuu's gate opens at quota banked; 15 of 15 banked is Full Moon. Taught in the first 20 s: two jewels lie beside the altar and the intro card's second line reads "Carry the King's jewels to the altar. Only banked jewels count." Should tier: spill-on-hit (up to 3 pouch jewels bounce 32 px to the floor and lie there until picked up again; a thief langur can take a floor jewel and drops it after 2 nuts or a stomp). Rejected: a countdown counter, a starting inventory Mowgli never collected, permanent loss, throw-to-bank. Playtest gate: median first-run confusion under 30 s and median first-run time under 8 min, else the spill is removed and the altar tutorial is enlarged.

### 9.4 Zone 4 rally (L8 The Ford)

The 15 collectibles of L8 are resting wolves (skin: a curled wolf; HUD icon: a wolf head; label "rallied" / "reunidos"). Touching one collects it: the wolf howls and runs to the ford. Same count, quota, sting and Full Moon rule. The rallied count sets B4's starting Pack strength (section 8.5). Two are hidden and marked by their howls (Akela, Won-tolla).

### 9.5 Checkpoints and autosave

Pack-stones / pedras da alcateia are gray stones with a paw print. On touch, Grey Brother's head pops up from behind, one howl plays, the print stays lit, health returns to 6 pips and the game autosaves.

| Rule | Value |
| --- | --- |
| Density | About one pack-stone per 60-90 s of expected play; one before and after every twist; one before every boss door |
| Counts | L1 3; L2-L8 4 each; 31 in the levels plus 4 boss doors |
| Respawn | Instant (0.6 s fade) at the last touched pack-stone, facing the direction of travel, on stable floor outside every hazard and trigger volume |
| Respawn resets | Enemies and crumbling ledges in the current screen reinstantiate at their authored state; projectiles clear; the Red Flower is snuffed but its meter is kept |
| Respawn keeps | Stones, the pouch, clods, the meter, Master Words gates opened, ropes cut, hut doors opened |
| Snapshot | Level id, pack-stone id, the 15 stone flags, pouch contents, clod count, meter seconds, gate flags, deaths, elapsed time, Retro lives and clock |
| Slots | 3 save slots, each showing tier, zone and moon-stone total on the slot screen |
| Schema | Versioned; an unreadable save is kept under a backup key and New Game is offered; settings survive New Game |
| Storage | localStorage; if storage is unavailable the game runs in memory with a clear message on the title screen |
| Level exit | Saves the cleared flag, the stone flags, the best time, the honey tally and the next level's entry |
| Boss defeat | Saves the zone as cleared and the next zone's first level as the entry; reloading after a boss defeat never respawns the boss |

### 9.6 Modern and Retro modes

| Rule | Modern (default) | Retro (Options toggle, off by default, never required for content) |
| --- | --- | --- |
| Lives | None; instant respawn at the last pack-stone | 3 lives shown as "x3"; at 0 lives, continue from the level start with 3 lives (unlimited continues) |
| Clock | None; elapsed time shown on the results card only | 6:00 per level; at 0:00 lose a life and respawn at the pack-stone with 6:00 |
| Counter | "found 8/10" with a small 15 | Counts down from 15 (remaining of 15); the quota toast is unchanged |
| Saves | Checkpoint autosave, 3 slots | Same; lives and clock are saved with the checkpoint |
| Score | None (a honey tally unlocks cosmetics) | Score tally on the results card (cut-first) |
| Bosses, Honey Hollow, the ending | No clock, no lives | The clock is off; lives still apply in bosses |
| HUD | One top row | Same row plus "x3" right of the pips and "6:00" right of the counter; no corner package |

Both modes reach every level, boss, bonus stage and the 100% tableau. Switching modes from Options applies at the next level start. The 6:00 clock and 3 lives are the primary-verified Normal values of the 1994 game; the 7/6/4 clock by difficulty is unverified and is not used (see docs/RESEARCH.md §1.3 and §1.11).

### 9.7 Difficulty tiers

| Tier (EN / PT-BR) | Quota | Damage per hit (6 leaf pips) | Hits to respawn | Boss hits per phase (total) | Recovery windows (standard / heavy) | Chil |
| --- | --- | --- | --- | --- | --- | --- |
| Cub / Filhote | 8 of 15 | 1 pip | 6 | 2 (6) | 1.0 / 1.2 s | Every level |
| Wolf / Lobo | 10 of 15 | 2 pips | 3 | 3 (9) | 0.6 / 0.8 s | L2 and L7 |
| Lone Wolf / Lobo Solitário | 12 of 15 | 3 pips | 2 | 4 (12) | 0.4 / 0.5 s | None |

The tier is chosen at New Game with a one-line description and the quota shown as "8 of 15", and can be changed from the map at any time (it applies to the next level). Enemy hits-to-scatter, enemy speeds, wind-ups and level geometry never change with tier. The alternative name for the easy tier, Frog / Rã (Raksha's name for Mowgli), is recorded in docs/DECISIONS.md.

### 9.8 Assist Mode

Assist Mode / Modo Assistência is named without judgment, reachable from the pause menu and Options, and any option can be changed at any time; the results card shows an assist stamp and nothing is locked.

| Option | Values | Applies |
| --- | --- | --- |
| Game speed | 50-100% in steps of 10 | Simulation and animation together; music pitch unchanged |
| Invincibility | On / off | Pits and deep water still respawn |
| Infinite clods | On / off | The HUD shows the infinity glyph |
| Skip level | Marks the level cleared with the stones found so far; no Full Moon | From the pause menu |
| Chil everywhere | Forces Chil on every level regardless of tier | Next level start |
| Crouch | Hold or toggle | Immediately |

## 10 Levels

### 10.1 Zone map

| Zone | Levels | Boss | Tileset and palette subsets | Coded mechanic | Exit characters |
| --- | --- | --- | --- | --- | --- |
| Z1 Seeonee Hills / Colinas de Seeonee | L1 Council Rock, L2 Cold Lairs | B1 The Flung Festoon | Dry hills and tree-roads; red-sandstone ruins; night and moonrise subsets | Swinging creepers, crumbling terraces | Akela, Kaa |
| Z2 The Waingunga / O Waingunga | L3 Water Truce, L4 Man-Pack | B2 The Lame One | Dry riverbed with three heat bands; village and fields with dawn, noon and dusk subsets | Animal carry platforms, truce zones, advance-on-hit | Hathi, Grey Brother |
| Z3 The Jungle's Justice / A Justiça da Selva | L5 Let in the Jungle, L6 King's Treasure | B3 Thuu | Night village edge and the Rains; the dim vault with lamp sprites | The inverted quota (pouch and altar) | Hathi, Thuu's gate |
| Z4 Red Dog / Cão Vermelho | L7 Bee Rocks, L8 The Ford | B4 Red Dog at the Ford | Monsoon gorge and cliff top; river bank and ford at night to daybreak | Garlic data row, slow and safe water | Kaa, Phao |
| Ending | The Spring Running | None | Zone 1 tileset with a spring palette | None | None |

### 10.2 Level authoring rules

- Size caps: L1 about 35 screens (about 7,900 tiles); L2-L8 40-50 screens (9,000-11,000 tiles); one screen at 320x180 is 20 x 11.25 tiles. Every sheet below is inside its cap.
- Each beat has a time budget; a pack-stone sits before and after every twist and before every boss door; about one checkpoint per 60-90 s of expected play.
- Gap rule: the L1 and L2 critical paths use 4-tile (0.75x) gaps only; 5.5-tile (1.0x) gaps appear on detours there and on any path from L3 on, always rehearsed once where a miss costs nothing.
- Every new hazard appears first in a room where failing costs nothing.
- Cards: an intro card (verse) per level and an exit card (prose) per level except L7, whose exit is the leap; L2, L4 and L6 show their exit prose after the boss; at most one card between action beats (Hathi's two-card rest in L3 is the exception); skippable after 1 s; no per-pickup text.
- Authoring: a 20-tile room grammar per tileset, rule-based automapping in Tiled 1.12.2, JSON export with embedded tilesets and CSV layers, text in Tiled only as textKey properties.
- L1 is built in M2 as the vertical slice and re-authored as a tutorial pass in M4; it is never "designed last".
- Times of day are palette subsets of the zone tileset, never a lighting system.
- Each level is one Tiled map with tile layers bg, ground and fg and object layers entities and markers, per docs/PLAN.md §5.2; entities holds spawns, stones (with their Chil order), pack-stones, enemies with patrol spans, S4 paths, S5 volumes and card triggers; markers holds camera bounds and parallax anchors.

### 10.3 L1 Council Rock / Rocha do Conselho

| Field | Value |
| --- | --- |
| Story source | Mowgli's Brothers (The Jungle Book, 1894); a warm evening under a full moon |
| Map | 90 x 80 tiles (about 32 screens); Zone 1 tileset, night subset with fireflies on the critical path |
| Target / checkpoints | 4.5 min first run / 3 pack-stones |
| New idea (data on S1-S6) | The verbs one per screen: run, variable jump, a 4-tile gap, crouch passage, 8-way nut throw, stomp, static creeper climb, ledge grab; the quota and the exit character; Tabaqui as the carrier-flag thief |
| Gimmick | Shere Khan's roar at the cave mouth as a scripted 2 s screen shake (obeys the slider), never a fight; the fire-pot fetch at the village fence as the twist; Raksha's line on the Zone 1 map page |
| Beat 1 (0:00-1:00) | Raksha's cave to the hillside: run, jump, the first 4-tile gap; 3 stones on the path; a hanging mahua bunch above the path holds a stone and teaches the upward throw; one langur on a branch that only a stomp reaches |
| Beat 2 (1:00-2:30) | The tree-roads: static creepers, two langurs with shadow discs, a crouch passage with 1 stone; Tabaqui lifts a visible floor stone and trots off (chase him, 1 hit drops it); pack-stone |
| Beat 3, twist (2:30-3:45) | The fire-pot fetch: descend to the village fence at night (lit windows, nobody comes out), take the Red Flower pot, climb back while langurs throw and two jackals patrol; lighting the pot once shows every enemy fleeing; pack-stone |
| Beat 4 (3:45-4:30) | The spiral of ledges up Council Rock (ledge grabs, all gaps 0.75x); quota sting, "Find Akela"; Akela at the top; exit card |
| Stones | 9 path, 4 branch (two tree tops, the crouch passage, Tabaqui's), 2 secret (behind a cracked bamboo wall lit by fireflies; the bottom of a firefly shaft) |
| Cards | Map page: "The man's cub is mine, Lungri--mine to me! He shall not be killed." Intro: "Oh, hear the call!--Good hunting all / That keep the Jungle Law!" Exit: "Look well--look well, O Wolves!" |
| Exit character | Akela |

### 10.4 L2 Cold Lairs / Tocas Frias

| Field | Value |
| --- | --- |
| Story source | Kaa's Hunting (The Jungle Book, 1894); midday nap to moonrise |
| Map | 70 x 140 tiles (about 44 screens), vertical: up the tree-roads, down into the ruined city |
| Target / checkpoints | 6 min / 4 |
| New idea (the Zone 1 coded mechanic) | Swinging creepers (S4 swing flag, 1.6 s period) and crumbling terraces (crumble 0.5 s after landing, respawn 4 s); Master Words gates (S5 door + crouch-hold 0.5 s); Chil joins at the first Bird-gate on the tiers that have him |
| Gimmick | The kidnap carry (10 s cinematic across the canopy, dropped alive on the tree-roads); three canopy lanes up; cobras in the summer-house windows; the Snake-gate calms a room of cobras for 10 s |
| Beat 1 (0:00-1:15) | The carry; static creepers to the first swinging creeper over a 4-tile gap; the first Bird-gate (card flash "We be of one blood, ye and I") and Chil; 3 stones |
| Beat 2 (1:15-2:45) | The tree-roads: chained swings at 0.75x on the path, one 1.0x chain on a detour with 2 stones, langurs on the branches; pack-stone at the city wall |
| Beat 3, twist (2:45-4:30) | The descent: crumbling terraces under langur fire, cobras in the windows (crouch under or wait out the rest), the Snake-gate at the summer-house; pack-stone |
| Beat 4 (4:30-5:45) | The tank terrace at moonrise: the last stones on the pillars; quota, "Find Kaa"; Kaa at the broken wall; pack-stone at the B1 door |
| Stones | 9 path, 4 branch (2 on the 1.0x swing detour, 2 on terrace roofs), 2 secret (a second carved gate signposted by cobra carvings; the cistern through a crouch passage) |
| Cards | Intro: "Here we go in a flung festoon, / Half-way up to the jealous moon!" Gate flash (first gate only): "We be of one blood, ye and I". After B1: "A brave heart and a courteous tongue. They shall carry thee far through the jungle, manling." |
| Exit character | Kaa |

### 10.5 L3 Water Truce / Trégua da Água

| Field | Value |
| --- | --- |
| Story source | How Fear Came (The Second Jungle Book, 1895); drought, a moonlit night |
| Map | 180 x 55 tiles (about 44 screens), horizontal riverbed with three heat palette bands |
| Target / checkpoints | 5.5 min / 4 |
| New idea (the Zone 2 coded mechanic) | Animal carry platforms: Hathi's three sons (32 px/s, wait 2 s at markers, trunk launch 5 tiles) and the truce trigger: within 12 tiles of a Peace Rock banner every enemy is passive and walks to drink, and Mowgli's throws drop at his feet with a soft "no" sting; the truce holds for the whole level |
| Gimmick | Cracked mud that crumbles 0.5 s after a step (S4 crumble), clod piles as the new pickup, quill-pigs in the open, cobras in the grass, deep pools that respawn; the truce zones are the rests; Shere Khan taints the pool in a wordless 8 s cinematic and everyone turns away |
| Beat 1 (0:00-1:15) | The shrunken bank: cracked mud, the first clod piles, the first truce zone where a cobra and a quill-pig drink and cannot be hit; 3 stones |
| Beat 2 (1:15-3:00) | The riverbed: ride Hathi's sons, hop between backs, trunk-launch to the high bank; pack-stone |
| Beat 3, twist (3:00-4:15) | Outside the truce: quill-pigs on the ledges and cobras in the grass by the last pools, the twist stones above cracked-mud pits, a banner island as a rest; Shere Khan at the water (cinematic, then the Law card); pack-stone |
| Beat 4 (4:15-5:30) | Peace Rock: the trunk-launch chain up; quota, "Find Hathi"; Hathi's two-card rest; the rain layer starts and the palette turns green |
| Stones | 9 path, 4 branch (the high bank via trunk launches), 2 secret (a dry well under a darker crack that a clod opens; behind the banner rock) |
| Cards | Intro: "The stream is shrunk--the pool is dry, / And we be comrades, thou and I;" Twist: "By the Law of the Jungle it is death to kill at the drinking-places when once the Water Truce has been declared." Exit (two cards): "Ye know, children, that of all things ye most fear Man;" then "Till yonder cloud--Good Hunting!--loose / The rain that breaks our Water Truce." |
| Exit character | Hathi |

### 10.6 L4 Man-Pack / Alcateia dos Homens

| Field | Value |
| --- | --- |
| Story source | Tiger! Tiger! (The Jungle Book, 1894); hot season, dawn to dusk |
| Map | 150 x 65 tiles (about 43 screens); village, fields, grazing ravines; sky palette changes at each pack-stone (dawn, noon, dusk) |
| Target / checkpoints | 6 min / 4 |
| New idea (data) | Buffalo as carry platforms with advance-on-hit: a nut on a bull's rump sends it charging 2 s at 96 px/s through a thorn fence (breakable tag), so the herd is a platform and a key; hut doors as S5 door volumes (crouch-hold 0.25 s to duck through; should tier, fallback: open doorways) |
| Gimmick | The fearful village: villagers use the flee state (step back, close doors) and never attack; nobody throws anything; Buldeo tells tales under the tree as an idle NPC with a lantern; village dogs are the only enemy inside the village; Messua's hut is the first pack-stone |
| Beat 1 (0:00-1:15) | The village at dawn: Messua's hut, herd-children, dogs on fixed spans, rooftop stones through hut doors; 3 stones |
| Beat 2 (1:15-3:00) | The fields: ride Rama, nut a bull through the first fence, cobras in the grass, a quill-pig by the well; pack-stone (noon) |
| Beat 3, twist (3:00-4:30) | The grazing ravines: buffalo walk the ravine floor as bridges over deep pools, steer a bull into a fence to reach a walled stone, dogs charge across the line; pack-stone (dusk) |
| Beat 4 (4:30-5:45) | The dhak tree at dusk: Grey Brother waits; quota, "Find Grey Brother"; exit to the B2 door with its pack-stone |
| Stones | 9 path, 4 branch (inside huts through doors, the upper herd path), 2 secret (the granary loft; under the ravine bridge) |
| Cards | Intro: "What of the hunting, hunter bold? / Brother, the watch was long and cold." After B2: "Look well, O Wolves. Have I kept my word?" then the Act 1 card "I am two Mowglis, but the hide of Shere Khan is under my feet." |
| Exit character | Grey Brother |

### 10.7 L5 Let in the Jungle / Solta a Selva

| Field | Value |
| --- | --- |
| Story source | Letting in the Jungle (The Second Jungle Book, 1895); night at the village edge, then the Rains |
| Map | 140 x 70 tiles (about 44 screens); a second 20-tile-wide overgrown map for the closing camera pan (should; fallback: palette swap plus card) |
| Target / checkpoints | 5.5 min / 4 |
| New idea (data) | Buldeo as a pursuit hazard with no stealth system: a Charger NPC on a fixed route at 48 px/s with a detect rectangle 6 x 2 tiles in front of him drawn as a warm lantern cone; 0.5 s inside it puts a "!" over his head, the cone turns warm, he shouts and chases toward Mowgli's x at 80 px/s (slower than the 96 px/s run) for 6 s; he cannot climb and stops at ledges; contact is a 2-tile push and 1 hit; then he stops to boast for 3 s (arms up, lantern swinging) and returns to his route; no capture state, no meter, no line of sight; this 6 s chase is the Charger script's pursue sub-mode, an accepted bounded extension of the dash sub-mode used everywhere else in section 7.7, scoped to Buldeo only. Crouching in a tall-grass trigger hides the 12x14 body; creepers above the cone are always safe. Grey Brother runs one screen ahead as the visible safe route |
| Gimmick | Rescue and escort: crouch-hold 0.8 s at each of two ropes to cut them (the knife touches rope only); Messua and her husband follow as collision-free path-followers; Bagheera on the bed is a card trigger: the two watchmen flee and stay away, with no timer; the escort segment holds no stones; Hathi and his three sons at the road end the level |
| Beat 1 (0:00-1:00) | The jungle edge: reunion on the map page; a fail-free teaching field where a charcoal-burner's lantern only shouts and never chases; grass rows teach hiding; 3 stones |
| Beat 2 (1:00-2:45) | The night fields: Buldeo's route with 3 stones inside the cone's path (risk and reward), village dogs, Grey Brother ahead; pack-stone |
| Beat 3, twist (2:45-4:30) | The hut: cut the ropes, Bagheera's scare, escort the pair back across the fields while the cone sweeps; pack-stone |
| Beat 4 (4:30-5:30) | The Khanhiwara road: the pair reaches the road marker where Hathi waits; quota, "Find Hathi"; exit card; the letting-in cinematic (fields eaten, walls crumbling, rain, green tiles) |
| Stones | 9 path, 4 branch (the far side of the cone route, the granary), 2 secret (the charcoal-burners' clearing; the well); none on the escort route; none requires standing inside a cone |
| Cards | Intro: "Veil them, cover them, wall them round-- / Blossom, and creeper, and weed--" Exit: "Let in the Jungle, Hathi!" then, over the cinematic, "Thy war shall be our war. We will let in the jungle!" |
| Exit character | Hathi |

### 10.8 L6 King's Treasure / Tesouro do Rei

| Field | Value |
| --- | --- |
| Story source | The King's Ankus (The Second Jungle Book, 1895); moonrise to night |
| Map | 80 x 125 tiles (about 44 screens); a vertical descent that loops back to the altar; dim palette subset with lamp sprites (no mask, no overlay) |
| Target / checkpoints | 6.5 min / 4 |
| New idea (the Zone 3 coded mechanic) | The inverted quota of section 9.3: jewels go into the pouch and count only when banked at the altar by touch; the counter reads "banked"; the pouch survives hits and respawn; spill-on-hit and thief langurs are the should layer |
| Gimmick | Kaa's coils as sine-eased carry platforms and Kaa's head-lift; coin-throwers on the walls (two shadow discs); white cobras in the niches, always drawn; quill-pigs in the passages; a lamplight glow sprite around Mowgli while the Red Flower is lit (should, cosmetic only); Thuu's gate opens at quota banked |
| Beat 1 (0:00-1:15) | Kaa's ledge: his new skin; low coils teach the moving platform safely; the altar and two jewels beside it teach banking ("banked 2/10") |
| Beat 2 (1:15-3:00) | The queens' pavilion: coin-throwers and quill-pigs; carry 4-5 jewels down the coil descent and bank them; pack-stone at the vault door |
| Beat 3, twist (3:00-4:45) | The vault loop: jewels deep in the treasure rooms guarded by white cobras and coin-throwers, thief langurs on the walls; the loop returns to the altar by the head-lift; pack-stone |
| Beat 4 (4:45-6:15) | Thuu's gate: quota banked, the gate grinds open, "Find Thuu's gate" / "Encontre o portão de Thuu"; descend to the B3 door with its pack-stone |
| Stones | 15 jewels in three loops of 5: 9 path, 4 branch (coil-only ledges), 2 secret (a cracked wall that a clod opens; a niche behind the pavilion); 15 of 15 banked is Full Moon |
| Cards | Intro: "These are the Four that are never content, that have never been filled since the Dews began--" with the rule line "Carry the King's jewels to the altar. Only banked jewels count." After B3: "I will never again bring into the Jungle strange things--not though they be as beautiful as flowers." |
| Exit character | Thuu's gate (the vault door) |

### 10.9 L7 Bee Rocks / Rochas das Abelhas

| Field | Value |
| --- | --- |
| Story source | Red Dog (The Second Jungle Book, 1895); evening to night |
| Map | 120 x 85 tiles (about 45 screens); the gorge climb, the cliff top, the pool |
| Target / checkpoints | 5.5 min / 4 |
| New idea (the Zone 4 coded mechanic) | Garlic as a data row of the timed item (bees ignore Mowgli for 15 s); hives as Turret spawners; the swarm as a Diver hazard that cannot be hit (64 px/s, 12-tile leash); the safe-water trigger: the Waingunga pool that ends the level |
| Gimmick | The run and the leap without a second movement mode: on the cliff top, hives beside the path release swarms behind Mowgli as he passes, boulders (S4 platforms started by a nut hit) roll down and smash the hives below, and the leap is a running 4-tile jump from the last rock into the pool 6 tiles below (the pool is 8 tiles wide, so any jump lands in safe water); Kaa waits in the shallows; a creeper from the pool back to the cliff base serves an under-quota return. Dhole scout pairs on the paths |
| Beat 1 (0:00-1:00) | Council Rock at evening: Won-tolla's alarm on the map page; the garlic bed and the first hive on a flat ledge show the bees ignoring a garlic-rubbed Mowgli; 3 stones |
| Beat 2 (1:00-2:45) | The gorge climb: hives on the ledges, dhole pairs on the paths (stomp chains), creeper swings across the gorge above the bees; pack-stone |
| Beat 3, twist (2:45-4:30) | The garlic runs out mid-climb: route around the hives, re-rub at a second bed, the cave behind the waterfall; pack-stone at the cliff top |
| Beat 4 (4:30-5:30) | The run and the leap: nut the boulders, keep moving, leap into the pool; quota, "Find Kaa"; Kaa in the water ends the level |
| Stones | 9 path, 4 branch (hive ledges, garlic timing), 2 secret (the cave behind the waterfall; the cliff-top nest) |
| Cards | Intro: "For our white and our excellent nights---for the nights of swift running." No exit card: the leap is the exit |
| Exit character | Kaa |

### 10.10 L8 The Ford / O Vau

| Field | Value |
| --- | --- |
| Story source | Red Dog (The Second Jungle Book, 1895); night to cold daybreak |
| Map | 150 x 65 tiles (about 43 screens); the lairs, the hills, the river bank, the ford |
| Target / checkpoints | 5.5 min / 4 |
| New idea (data) | The rally of section 9.4: resting wolves as the collectible; slow-water triggers (50% run speed, jump unchanged) in the shallows; the Pack as team-flagged Chargers that shove dholes with a visible lunge and bark; floating logs as S4 platforms at 32 px/s |
| Gimmick | Dhole pairs probing from both sides; the Pack's howl from the ford every 20 s as the audio compass (mono); Won-tolla's empty lair as a wordless scene (alluded to only); deep pools respawn |
| Beat 1 (0:00-1:15) | The lairs: Phao's council on the intro card; the first 3 wolves beside the path; a dhole pair teaches the bounce chain |
| Beat 2 (1:15-3:00) | The hills: wolves on tree-roads and ledges (detours), creeper swings, cobras in the grass; pack-stone |
| Beat 3, twist (3:00-4:45) | The river bank: slow-water shallows, logs, dholes from both sides, Won-tolla's lair; pack-stone |
| Beat 4 (4:45-5:45) | The ford: the rallied Pack gathers on the rocks; quota, "Find Phao"; Phao leads into B4 with its pack-stone |
| Stones | 9 near the path, 4 on detours, 2 hidden and marked by their howls (Akela, Won-tolla) |
| Cards | Intro: "For the strength of the Pack is the Wolf, and the strength of the Wolf is the Pack." Exit: "It is met, and we go to the fight. Bay! O Bay!" |
| Exit character | Phao |

### 10.11 Level totals

| Level | Screens | First run (min) | Checkpoints | Cards |
| --- | --- | --- | --- | --- |
| L1 | 32 | 4.5 | 3 | 2 (+1 map page) |
| L2 | 44 | 6.0 | 4 | 3 (gate flash counted) |
| L3 | 44 | 5.5 | 4 | 4 (two-card rest) |
| L4 | 43 | 6.0 | 4 | 3 (two after B2) |
| L5 | 44 | 5.5 | 4 | 3 |
| L6 | 44 | 6.5 | 4 | 2 |
| L7 | 45 | 5.5 | 4 | 1 |
| L8 | 43 | 5.5 | 4 | 2 |
| Total | 339 | 45 min of levels + about 12 min of bosses + about 6 min of cards and cinematics + 4 min ending = about 67 min quota run | 31 | 20 |

### 10.12 Ending and epilogue

| Beat | Content |
| --- | --- |
| Map and pacing | 150 x 45 tiles (about 30 screens); Zone 1 tileset, spring subset; no pack-stones, no HUD, no collectibles, no pits or deep water (the level has no fail state); target about 4 min: Council Rock (0:00-0:50), the honey tree (0:50-2:00), the marshes (2:00-2:50), the village light and the return (2:50-4:00) |
| The Spring Running / A Corrida da Primavera | A no-enemy traversal level on a spring palette (mahua blossom, red palash particles): Council Rock at the Time of New Talk (card), the run north to the marshes, the village light and Messua's hut (quiet scene, no text), the return to Council Rock |
| The three farewells | Blind Baloo: "When the honey is eaten we leave the empty hive."; Kaa: "Having cast the skin, we may not creep into it afresh. It is the Law."; Bagheera and the bull: "Good hunting on a new trail, Master of the Jungle! Remember, Bagheera loved thee." |
| Man goes to Man | Card: "Man goes to Man! Cry the challenge through the Jungle!"; the Outsong over the credits: "Wood and Water, Wind and Tree, / Jungle-Favour go with thee!"; last card: "And this is the last of the Mowgli stories." |
| 100% epilogue (In the Rukh) | Unlocked at Full Moon in all eight levels: one still image on the storybook's back cover (the baby under the thorn thicket, the gray wolf's head in the brake, four wolves) with the verse "Now, was I born of womankind and laid in a mother's breast? / For I have dreamed of a shaggy hide whereon I went to rest." No sahibs, no dialogue, no colonial frame |

Opening card of the ending: "The year turns. The Jungle goes forward. The Time of New Talk is near." The ending has no fail state and no timer; Retro mode's clock is off here. The Spring Running is authored as an ordinary level map with every enemy and stone layer empty, so it costs level art and cards, not code. Cards: 7 (the opening card, the three farewells, "Man goes to Man", the Outsong, the last card).

### 10.13 Bonus stages (priority order)

| Stage | Design | Priority |
| --- | --- | --- |
| Honey Hollow / Oco do Mel (Baloo's honey tree, entered from the results card on Full Moon) | A one-screen-wide, 3-screen-tall hollow teak trunk on a 30 s clock; honeycombs worth a honey tally (no score in Modern) and 2 health pips each; bent-bamboo springs (S4 bounce flag, 6 tiles); no enemies, no damage; ends at time-out or the top hole; a Law card at the top (8 in the game = the Law of the Jungle scroll in Extras: "Now this is the Law of the Jungle--as old and as true as the sky;", "Keep peace with the Lords of the Jungle--the Tiger, the Panther, the Bear;" and six more from the approved list). Two layouts (trunk for Zones 1-2, cave for Zones 3-4); each layout holds 24 honeycombs (18 along the spring path, 6 in side pockets), and a clean 30 s climb reaches the top hole with about 16-20, so the palettes unlock after about 3, 8 and 16 Full Moons. Rewards: 3 cloth palettes for Mowgli at 50 / 150 / 300 honeycombs, the Law scroll. Original layout, never traced | must (layout 1); layout 2 should (cut-first line 9) |
| Rikki-tikki's Garden / O Jardim de Rikki-tikki ("Run and find out") | A 60 s side-view mini-game as Rikki-tikki (S1 with a parameter set: run 120 px/s, jump 2.5 tiles, 16x16 body, no throw): find 5 cobra eggs in the melon bed and carry them one at a time to Darzee's nest while Nagaina patrols as a Charger (contact knocks Rikki back and costs 5 s; no combat, no deaths; Nag and the gun stay off-screen). Card: "The motto of all the mongoose family is 'Run and find out'". Unlocked at 45 moon-stones in Zones 1-2. One 40-tile tileset and 4 sprites | cut-first (second to be cut) |
| Toomai's Night Ride / A Cavalgada de Toomai | A 90 s ride on Kala Nag's back through the night forest: jump blossoms and duck branches on a 4/4 beat; misses shake the howdah, never fail; ends at the elephants' dance as a silhouette tableau (no Petersen). Needs a follow-the-platform camera, the one new piece. Card: "I will remember what I was, I am sick of rope and chain--". Unlocked at Full Moon in Zones 3-4 | cut-first (first to be cut) |

## 11 Camera, HUD and interface

### 11.1 Camera rules

| Rule | Value |
| --- | --- |
| Viewport | 320x180 world pixels, rendered at an integer zoom and letterboxed; the optional "fill screen" toggle for phones scales non-integer and is off by default |
| Dead zone | 64x40 px centered; the camera moves only when Mowgli leaves it |
| Look-ahead | 40 px in the facing direction, eased over 0.25 s; reversed on a turn after 0.15 s of running the other way, so a tap does not swing the view |
| Vertical | Follows the feet with a 24 px dead band; snaps to the new floor on landing over 0.2 s; a fall shows at least 5 tiles below the feet |
| Look up and down | Holding Up or Down for 0.5 s while standing still pans 48 px; released, the camera returns over 0.25 s |
| Bounds | Clamped to the level's Tiled bounds; boss arenas clamp to the arena; no auto-scroll anywhere |
| Reveal rule | A required landing is visible before takeoff; the one-screen drop rule of section 5.3 applies |
| Shake | Scripted only (Shere Khan's roar, Kaa breaking the wall, the stampede): 2 s at 2 px amplitude, scaled by the shake slider 0-100%, off at 0 |
| Transitions | Level entry fades in over 0.3 s from the intro card; respawn fades 0.6 s; card panels slide in over 0.2 s |
| Pixel snapping | The camera scrolls in whole world pixels; sprites render on whole pixels (pixelArt rendering with rounded pixels; the integer zoom recipe is verified in M0, see docs/RESEARCH.md §8) |

### 11.2 HUD at 320x180

One top row, 8 px safe margin, m5x7 bitmap font, no information by color alone, PT-BR containers at +10%. The bottom row is empty in Modern play, which is deliberately unlike the 1994 corner package.

| Region (x range in px) | Content |
| --- | --- |
| Top-left 8-80 | Mowgli portrait 16x16 at (8,8); 6 leaf pips 6x6 px in a row to its right (filled = health, outlined = lost); under the pips a 24x3 px ember meter that appears only while a Red Flower (or garlic) is owned |
| Top-center 120-200 | Collectible icon 8x8 + "8/10" + a small "15"; L6: altar icon, "banked 4/10", pouch "(3)"; L8: wolf-head icon, "rallied 6/10"; at quota the icon becomes the exit character's silhouette for 3 s, the text flips gold and the toast "Find Akela" slides in beneath for 2 s |
| Top-right 240-312 | Current throwable icon 8x8 + count (nut: infinity glyph; "12" for clods); 3 cycle dots under it (2 dots while no timed item is owned) |
| Retro additions | "x3" right of the pips; "6:00" right of the counter |
| Bosses (bottom-center, y 164-172) | 3 phase dots, each a group of 2 / 3 / 4 pips by tier; B4 adds 5 paw icons (Pack strength) to the right |
| Diegetic | Chil at the screen edge; lit pack-stones; the exit character's beckon; the interact progress ring above Mowgli |
| Touch | Section 4.4; the HUD row shifts nothing, the touch layer sits over the empty bottom row |
| Assist stamp | A small paw-and-leaf glyph left of the counter while any Assist option is on |

Cards use the S8 panel: 288x120 px centered, a 4 px Madhubani-style double border, one quote of at most 120 characters in m5x7 at 16 px (up to 4 lines of 34 characters), the level title above; the results card adds stones x/15, time, deaths, best and the Honey Hollow door.

### 11.3 Menu flow

Boot (attribution line EN and PT-BR for 2 s; language from the browser, prefix "pt" gives PT-BR, changeable everywhere) -> Title (the device prompt of section 11.4 unlocks audio; the attribution line, section 1.1, shown at the bottom while the Title is up; Continue, New Game, Options, Extras, Language) -> Save slot (3 slots, each showing tier, zone and moon-stone total) -> New Game: tier pick (Cub / Wolf / Lone Wolf, one-line descriptions, "8 of 15") -> Storybook map (book pages: cover plus 4 zone pages with one narrator line per page, Baloo by default and Raksha on the Zone 1 page; level stamps show x/15, a Full Moon stamp at 15/15 and the best time; boss stamps between levels; bonus doors as stamps; zones unlock in order, cleared levels replay freely) -> Level intro card (title EN/PT-BR, the verse, "Find Akela after 10 moon-stones" by tier) -> Play -> quota sting and "Find Akela" -> exit character cinematic (short) -> Results card (x/15, time, deaths, best, the Honey Hollow door on Full Moon) -> Honey Hollow (if earned) -> next stamp or boss intro card -> Boss -> victory card(s) -> map. After B4 the map turns to the last page: The Spring Running -> the Outsong and credits -> at 100% the In the Rukh tableau on the back cover.

### 11.4 Screens

| Screen | Contents | Rules |
| --- | --- | --- |
| Boot | Attribution line (section 1.1), loading bar | 2 s minimum so the line is read; retry on a failed asset with the file name |
| Title | Seeonee wordmark, the attribution line (section 1.1) at the bottom, persistent while the Title is shown, the device prompt (keyboard and pad "Press any key" / "Pressione qualquer tecla"; touch "Tap to start" / "Toque para começar"), Continue (when a slot exists), New Game, Options, Extras, Language | Keyboard, pad and touch navigate the same list; visible focus |
| Save slots | 3 slots with tier, zone, moon-stone total, mode; Delete with confirmation | New Game on a used slot asks first |
| Storybook map | Cover, 4 zone pages, the last page, the back cover; stamps; one narrator line per page (Baloo by default; Raksha on the Zone 1 page, section 10.3); the cover reads "Seeonee" above the attribution line (section 1.1) and is never titled with an excluded word; page headings use the zone names of section 10.1 | One screen per page; page turns are 0.3 s |
| Level intro card | Title, verse, quota line | Skippable after 1 s |
| Pause | Resume, Restart from checkpoint, Assist, Options, Map | One screen, same layout on keyboard, pad and touch; gameplay actions disabled while open |
| Options | Audio (music, SFX), Video (pixel-perfect or fill screen, shake 0-100%, flash reduction), Controls (remap keyboard, gamepad glyphs, touch preset and opacity), Assist, Retro mode toggle, Language, Copy diagnostics | Every setting persisted; Copy diagnostics writes a JSON summary to the clipboard for the playtest form |
| Results card | Stones x/15, time, deaths, best, assist stamp, Honey Hollow door | Continue with any button after 1 s |
| Boss intro and victory cards | Title, one card each | No replay on retry |
| Extras | Law scroll, storybook cards seen, cloth palettes, credits and the privacy notice, bonus stages once unlocked | Credits carry the attribution line and CREDITS.md; the text credit reads "Quotations from the public-domain Mowgli stories of Rudyard Kipling (1893-95)"; the source titles and "Project Gutenberg" are named only in docs/RESEARCH.md, never in the game, CREDITS.md, licenses.txt or the store page |
| Ending and credits | The Spring Running, the Outsong, the credits scroll, "And this is the last of the Mowgli stories." | Skippable credits after the first viewing |

Menus are keyboard-navigable with visible focus, Escape goes back, and every menu string fits the PT-BR width rule of section 14.

## 12 Art direction

### 12.1 "Seeonee, not Jungle"

The setting is the Seoni district of Central India as Kipling's plates and the Pench and Kanha forests show it: a dry-deciduous forest, not a rainforest. Teak, solid bamboo, mahua, palash, salai and the ghost tree; seasonal streams (nullahs) that dry to cracked mud; red sandstone and white marble ruins on the Chitor model for the Cold Lairs; the Waingunga gorge for the monsoon zone. Sprites are translated to pixel art from the public-domain 1894-95 plates by J. Lockwood Kipling, W. H. Drake and P. Frenzeny; the Detmold plates are embargoed until 1 January 2028 in the EU and Brazil and are not used (see docs/RESEARCH.md §3.1 and §7.1-7.3). The look is deliberately unlike both the 1967 film and the 1994 sprites.

| Zone | Season and place | Tileset subsets (palette only) | Signature plants and props |
| --- | --- | --- | --- |
| Z1 Seeonee Hills | Dry season hills, tree-roads, the ruined hill fort | Warm evening, night with fireflies, midday canopy, moonrise on marble | Teak, bamboo, mahua bunches, boulders, carved gates, jali screens, the tank |
| Z2 The Waingunga | Drought, then the first rain; village and fields | Three heat bands (ochre, white, red), dawn, noon, dusk, rain-green | Cracked mud, Peace Rock banners, dhak tree, thorn fences, huts, granary, the well |
| Z3 The Jungle's Justice | Night village edge in the Rains; the vault | Night indigo, lantern warm, overgrown green; dim vault with lamp sprites | Tall grass rows, ropes, charcoal kilns, marble pavilion, coin heaps, lamps |
| Z4 Red Dog | Monsoon gorge, cliff top, river at night to daybreak | Slate and wet gray, bee-gold, cold daybreak | Hives, garlic beds, waterfall, boulders, logs, the ford rocks |
| Ending | Spring, the Time of New Talk | Spring palette: mahua blossom cream, palash red particles | Council Rock, marshes, Messua's lamp |

Each zone is one tileset of about 120 tiles with a night or dim subset; a time of day is a documented palette subset (16-20 colors plus a 4-color sky ramp), never a re-tint and never a lighting mask.

### 12.2 Palette: Seeonee-40

One master palette file in Aseprite: Endesga 32 minus its two cyans, plus 10 derived swatches: dry-grass ochres, teak-bark gray-browns, ghost-tree whites, monsoon slate and night indigo (starting values: Endesga 32 as listed in docs/RESEARCH.md §7.6, the Lospec row; final values are tested on the first tileset in M2). Policy: the hero owns 6 colors (skin, hair, white cloth, cloth shadow, outline, knife) that background tiles may not use; hazards own the reserved red family only; the UI owns a 5-color ochre and red ramp; every zone and time subset is a listed selection of the master palette.

### 12.3 Readability rules

| Test | Pass condition |
| --- | --- |
| Luminance contrast | CIE L* difference of at least 30 between the hero outline and any tile color that can sit behind the hero; at least 20 between the hero body and background midtones |
| Grayscale | A desaturated screenshot still shows hero, enemies, hazards and stones as distinct shapes |
| Scale | Checked at 1x (320x180) and 6x |
| Color vision | Deuteranopia simulation keeps hazard and safe colors apart; no rule in the game depends on hue alone (stones are one pale color with an outline; quota is a gold flip plus a sting plus a toast) |
| Motion | A 60 ms per frame check of every attack pose confirms the canonical pose reads at speed |
| Collision honesty | A ledge lip matches its grab position, a quill hitbox sits inside the drawn quill, a platform top aligns to its collision plane; background layers are lower contrast than collidable geometry; foreground props fade to 50% when they cover the hero |

Every tileset passes these tests before sprites are placed on it.

### 12.4 Per-character briefs and the "red shirt" test

Each design is checked against the Disney exclusion list of docs/RESEARCH.md §3.2: remove every visual tell of the 1967 film the way a public-domain Pooh removes the red shirt. Frame sizes are art sizes; collision bodies are set separately.

| Character | Frame | Brief | Disney tells removed |
| --- | --- | --- | --- |
| Mowgli | 32x32 (about 24 px tall) | Wiry teen, brown skin, long black hair tied in a knot, undyed white langot, bone knife on a cord, bare feet, callused knees and elbows as 1 px marks, a shoulder bag for nuts, the fire-pot on a cord when owned; 3 cloth palettes as swaps | Red loincloth, mop haircut over the eyes, big round eyes, bananas |
| Baloo | 48x40 | Sloth bear: rust-black shaggy mass, long pale muzzle, a 3 px cream V on the chest, long blunt claws, low head; sits up with a paw raised to teach | Blue-gray smooth bear, pot belly, dance poses |
| Bagheera | 48x24 | Melanistic Indian leopard, long and low: ink black with 1 px darker rosette rows on highlight bands only, gold eyes, a 2 px pale collar mark under the chin, a true leopard head | Blue-black sleek panther with no markings |
| Shere Khan | 64x32 | Bengal tiger, bulky with a heavy ruff, orange with dark stripes, a scarred muzzle; the signature is the limp: one hind leg drags with a visible hitch frame every cycle | Sanders face, glossy villain grin, talking-cat pupils |
| Tabaqui | 24x16 | Golden jackal, sandy-gray, bushy tail, cringing crouch | Hyena sidekick |
| Kaa | 16x16 head + 12 px segments (at least 8) | Indian rock python, mottled brown and yellow, lance mark on the head, lidless round eye, no eyebrows; coils drawn as segments | Green cartoon snake, spiral eyes |
| Bandar-log | 24x24 | Gray langur: gray body, black face, hands and feet, the tail as the longest line in the silhouette | Orangutan, crown, throne, scat poses |
| Hathi and sons | 96x64 (sons thinner) | Indian elephant: twin-domed head, small ears, pink depigmentation on trunk and ears, dust-ochre gray; the sons "gaunt and gray" | Helmet, moustache, drill march |
| Akela, Raksha, Grey Brother, Phao | 32x20 | Indian wolf: lean, short coat, grizzled back, a dark shoulder V; Akela paler, Raksha with a rusty tint; Phao and the rally wolves as swaps | Cartoon dog eyes |
| Chil | 24x16 | Black kite in flight, dark brown, shallow forked tail | None |
| Quill-pig | 24x16 | Indian crested porcupine: banded black and white quills and crest; unnamed | Rolling ball |
| Thuu | 48x48, segmented | Leucistic Indian cobra: ivory-white, faint yellow hood marks, ruby eyes | Venom spit |
| Dholes | 24x16 | Rust-red, yellowish throat, low-hung tails with a dark tip; the leader bay-colored with his tail intact | None |
| Bees | 24x24 cloud | A gold-and-black cloud of 8 frames; hives as woven ochre combs | None |
| Buldeo | 32x32 | Grey-bearded hunter, turban, lantern on a stick; no musket | Caricature |
| Messua and husband, villagers | 32x32 | Undyed cloth, ochre and indigo accents, fearful poses (step back, door slam) | None |
| Rikki-tikki, Nagaina, Darzee, Toomai, Kala Nag (bonus stages) | 16x16 / 24x16 / 16x16 / 32x32 / 96x64 | Indian gray mongoose, Indian cobra, tailorbird, a village boy in undyed cloth, a working elephant with a rope harness, drawn from the 1894-95 plates | The 1975 Chuck Jones film's mongoose and cobras; the 1937 Elephant Boy film's Toomai; any later adaptation's designs |

Story cards, map pages and the UI frame use the grammar of Indian folk painting (Gond dot-fill, Madhubani double borders, Warli triangle figures, Pahari pink distance hills) as original work; the traditions are credited in CREDITS.md and no protected artwork is traced.

### 12.5 Animation contract

Frame caps per animation: 6 run, 4 scatter, 2 idle gag. Timings run on the simulation tick; art swaps cannot change any hitbox or window. Mirroring supplies left-facing poses; the knife and bag sit on the mirrored side, which is accepted.

| Entity | Frames | Clips (frames) and timing rule |
| --- | --- | --- |
| Mowgli | 30 | Idle 6 (8 fps loop), run 6 (12 fps, foot contact on frames 1 and 4), jump 3 + land 1 (rise, apex, fall by vertical velocity; land holds 2 ticks), climb 4 (fit to 64 px/s: one cycle per 16 px), crouch 3 (crouch, crouch-walk 2), throw 3 (0.05 s wind, release, 0.15 s follow-through), hurt 2, interact 2; cloth palettes as swaps |
| Langur (rig also used for coin langurs, rim throwers and the festoon chain) | 16 (+0 coin swap, +8 festoon) | Idle 2, rear-up 2 (0.6 s), lob 2, flee 4, hang 2, sway 4 |
| Tabaqui and jackals (dogs +2) | 16 (+2) | Trot 4, crouch-yip 2, lift-and-carry 4, flee 4, boast 2 |
| Cobra (white cobra +1) | 12 (+1) | Coiled 2, hood flare 2 (0.6 s), lunge 2 (0.3 s), rest 2, sink 4 |
| Quill-pig | 12 | Waddle 4, bristle 2 (0.6 s), shake 2, back-off 4 |
| Dhole (leader from the same rig at 24x24, +12) | 16 | Trot 4, crouch-growl 2 (0.5 s), lunge 3, recover 3, flee 4 |
| Bee cloud | 8 | Drift 4, tighten 2 (0.5 s), return 2 |
| Chil | 6 | Soar 4, cry 2 |
| Kaa (coils and head) | 12 | Coil segment 4 (sine ride), head idle 2, head-lift 4, Dance sway 2 |
| Hathi's son / Hathi | 14 / 6 | Walk 8 (32 px/s, one cycle per 32 px), wait 2, trunk raise 4; Hathi stand 2, proclaim 4 |
| Buffalo (Rama as a swap) | 10 | Walk 6 (48 px/s), charge 4 |
| Grey Brother (Phao, Akela, rally wolves as swaps +6) | 10 (+6) | Pop-up 2, howl 2, run 4, lunge-and-bark 2 |
| Baloo | 8 | Narrate 2, sway 4, honey host 2 |
| Bagheera | 12 | Silhouette hold 2, sway 4, love-tap 2, walk 4 |
| Buldeo | 12 | Walk 4 (48 px/s), alert "!" 2, chase 4, boast 2 |
| Messua and husband | 8 | Walk 4, crouch 2, wait 2 |
| Villagers | 6 | Step back 2, door slam 2, idle 2 |
| Raksha | 2 | Map page pose |
| Thuu's gate | 3 | Closed, grinding, open |
| Shere Khan | 30 | Sleep 2, wake 2, limp walk 6 (the hitch frame), charge 4, roar 3, climb 3, pounce 4, stumble 3, swipe 3 |
| Thuu | 20 | Rise 4, hood flare 2, strike 3, sweep 3, rear-and-toss 4, pant 2, pinned 2 |
| Total | About 300 | 20% over the research baseline of about 250 frames, absorbed by 3 palette swaps, rig reuse and the wolf swaps |

### 12.6 Asset budget

| Asset family | Count | Notes |
| --- | --- | --- |
| Tilesets | 4 zone tilesets of about 120 tiles each, each with a night or dim subset | Plus the spring subset for the ending; one shared props sheet (bunches, pots, piles, banners, ropes, hives, garlic, logs, boulders) |
| Parallax | 3 layers per zone (4 for Zone 1, which adds the tree-road canopy) | Distance hills, mid trees and canopy; hand-painted from the plates, 320x180 px tile-sprite loops (480x180 for wide layers) at scroll factors 0.2, 0.4 and 0.6 (docs/PLAN.md §6.4) |
| Hero atlas | 1 (30 frames, 3 cloth palettes) | 32x32 untrimmed frames, one anchor |
| Enemy atlases | 6 base sprites + 3 palette swaps (83 frames) | Section 12.5 |
| Boss atlases | 4 (70 frames) | Shere Khan, Thuu, the festoon rig, the dhole leader |
| Helper and NPC atlases | 12 sheets (115 frames) | Section 12.5 |
| Storybook | 5 pages (cover + 4 zone pages) + the last page + the back cover tableau | Static illustrations; the chapters list on parchment is the cut-first fallback; the cover reads "Seeonee" above the attribution line (section 1.1) and is never titled with an excluded word |
| Cards | 8 Law cards, the S8 panel frame, 3 card borders | Gond and Madhubani grammar |
| HUD sheet | 1 | Portrait, pips, meter, icons, phase dots, paws, touch glyphs, device glyphs |
| Fonts | m5x7 at 16 px as a bitmap atlas with the Latin-1 set; a Press Start 2P atlas for the all-caps wordmark only | Section 14 |
| Effects | Dust puff, shadow disc, ceiling glint, pot glow, fireflies, rain, splash, glint, progress ring, stone chime sparkle | 8-12 small sheets |

Editable sources live in the private sibling repo mogli-art-src; the game repo holds only the exported atlases, per decision D14 (see docs/RESEARCH.md §7.8 for the license rules). Placeholder art for M1 comes from CC0 kits (docs/RESEARCH.md §7.1) and never ships.

## 13 Audio direction

### 13.1 Score direction

A hybrid score: recorded or sampled bansuri (Mowgli's melody), sarangi (grief and drought), sitar (Cold Lairs ostinati), tanpura (the drone bed under every zone), tabla (exploration groove), dhol (boss and pursuit) and shehnai (village and Bandar-log mockery) over YM2612-style FM bass, leads and percussion transients made in Furnace and exported as per-channel stems. Each zone theme is colored by a raga associated with its time or season, documented as an association and not a claim of authenticity, and exists as day and night (or drought and monsoon) variants that share tempo, key and loop length so crossfades stay phase-aligned, with 2-3 vertical intensity stems switched on 1-bar boundaries. Kipling's verses on the cards are never sung; the Outsong is set to an original melody as an instrumental. No Disney song, no 1994 track, no Grainger or Koechlin setting is quoted or imitated (see docs/RESEARCH.md §2.2 and §7.4).

### 13.2 Cue list

| # | Cue | Color | Tempo and loop | States | Tier |
| --- | --- | --- | --- | --- | --- |
| 1 | Title "Seeonee" | Bhairav-colored bansuri over tanpura and FM bass | 90 BPM, 64 s loop | Menu and map | must |
| 2 | Z1 Seeonee Hills | Bhairav dawn into a day tabla; night variant with the tabla muted over a Malkauns drone | 96 BPM, 32 bars, about 80 s | Explore, alert, chase stems; day and night | must |
| 3 | Z2 The Waingunga | Bhimpalasi, sitar ostinato and FM lead; a drought variant with a dry shimmer and no rain stem | 104 BPM, 32 bars, about 74 s | Explore and chase; drought and rain | must |
| 4 | Z3 The Jungle's Justice | Yaman dusk into Malkauns night; sitar tremolo; a marble-reverb vault variant | 80 BPM, 48 bars, about 144 s | Explore, Buldeo density layer, vault | must |
| 5 | Z4 Red Dog | Malhar monsoon with a rain-texture stem; a ford variant with the dhol entering | 110 BPM, 32 bars, about 70 s | Monsoon, chase, ford | must |
| 6 | Boss theme | Dhol and distorted FM bass with shehnai taunts; three intensity layers by phase; B4 adds the Pack's howls as a stem | 140 BPM, 16 bars, about 27 s loop | Phase 1, 2, 3 | must |
| 7 | Honey Hollow | Bahar-colored, light | 150 BPM, 16 bars, about 26 s | Single | must |
| 8 | Quota sting | Two-note wolf call, non-loop | 1.5 s | Quota met | must |
| 9 | Victory jingle | 6 s non-loop, ends on the tanpura Sa | 6 s | Boss victory | must |
| 10 | Ending: The Spring Running and the Outsong | Bahar, non-loop | About 120 s + 60 s credits | Ending | must |
| 11 | Card stings and respawn | Short non-loop | 1-3 s | Cards, respawn, Retro life lost | must |

About 12-14 minutes of music. This satisfies decision D16's 4 zone themes plus boss, title and ending music; the variants are stems of the same cue, not extra cues.

### 13.3 SFX palette

About 50 named sounds mapped to game events; every essential cue also has a visible equivalent (section 15).

| Group | Sounds |
| --- | --- |
| Mowgli (12) | Jump, land soft, land hard, step dirt, step rock, step water, creeper climb, throw, hurt, respawn sit, interact ring tick, ring complete |
| Throwables (6) | Nut whoosh, nut hit, "tok" bounce off a boss, clod hit, clod dust burst, fire-pot light and snuff |
| Animals (15) | Wolf howl, wolf bark, Baloo grunt, Bagheera snarl, Shere Khan growl, Shere Khan roar, Kaa hiss, langur chatter, langur alarm bark, dhole whistle, Chil cry, Hathi trumpet, quill rattle, cobra hiss, Thuu's dry hiss |
| World (10) | Bamboo creak, teak-leaf rustle, river loop, rain light, rain heavy, thunder, dry wind, bee swarm, rockfall, gate grind |
| Pickups and UI (8) | Moon-stone chime (rising pitch), jewel bank, wolf rally howl, honeycomb, mahua flower, pack-stone howl, menu move and select, back and low-health pulse |

Sources: jsfxr or ChipTone placeholders in M1-M2 with a retro layer kept under every impact; CC0 packs for UI and impacts; own foley for leaves, bamboo, cloth and water; animal voices synthesized or pitched from clean CC0 sources with a provenance check, never ripped (docs/RESEARCH.md §7.4).

### 13.4 Mix targets

| Target | Value |
| --- | --- |
| Full mix integrated loudness | -16 LUFS |
| Music stems | -18 to -20 LUFS short-term |
| True peak | -1 dBTP (encode with loudnorm two-pass at TP -1.5) |
| Simultaneous SFX voices | 16, with the newest low-priority voice dropped first; telegraph sounds are high priority and never dropped |
| Mono cues | Chil's cry, the Pack's howl and every telegraph are mono; there is no stereo panning as a gameplay cue |
| Ducking | Music drops 6 dB under cards and the quota sting for 1.5 s |
| Sliders | Music and SFX 0-100% (default 80% and 100%), persisted; mute on tab hide |

### 13.5 Delivery formats

Every cue and SFX ships as an .ogg (libvorbis quality 5 for music, 4 for SFX) plus an .m4a (AAC-LC 160 kbps, faststart) pair, because Safari before iOS 18.4 and macOS 15.4 plays no Vorbis; the loader lists the .ogg first and the engine picks the first playable extension. Loops are authored as exact bar multiples at 48 kHz; loop points are set through sound markers from a per-browser calibration manifest so AAC priming samples do not click at the seam; iOS Safari loop seams are a release gate in M5. Music is about 15 MB per format and is loaded per zone; SFX ship as one audio sprite per zone plus a shared UI sprite. The audio context starts on the first gesture at the title screen. Details and the verification list are in docs/PLAN.md.

## 14 Localization

### 14.1 Rules

| Rule | Value |
| --- | --- |
| Languages | EN and PT-BR from day one; PT-BR only, tagged pt-BR (PT-PT is out of scope) |
| Detection | navigator.languages: any entry starting with "pt" gives PT-BR, else EN; an explicit choice is saved in the settings record and honored over detection; a ?lang= query overrides for testing |
| Toggle | Language on the title screen, in Options and on the pause menu; every open menu re-lays out on change because widths change |
| Dictionary | A hand-rolled typed dictionary: en.ts as const is the key source, pt-BR.ts is typed against its keys so a missing key is a compile error; t(key, params) with {name} interpolation; plurals through Intl.PluralRules with explicit zero, one and other forms (PT-BR treats 0 as "one", so "0 pedras" needs its own form) |
| Parity test | A Vitest test compares the two key sets, every {placeholder} set per key, and rejects empty strings; it runs in CI |
| Tiled | No display text in maps; objects carry a textKey property resolved at runtime |
| Source text | Every PT-BR card is translated in-house from the Gutenberg text; no digitized public-domain Lobato edition exists and the only free modern translation is CC BY-NC-ND, which is not usable (see docs/RESEARCH.md §3.1) |
| Spellings | Kipling spellings for every character in both languages; "Selva" and "Lei da Selva" in UI text; never the Disney dub spellings |
| Proofreading | A PT-BR proofread of every string in M5 by a native reader; the four coined terms in section 14.4 are checked first |

### 14.2 Glyphs and fonts

| Item | Value |
| --- | --- |
| Primary font | m5x7 (CC0) at 16 px, converted to a bitmap font atlas; caps 7 px, accents rise to 10 px, descenders 2 px, so the line box is 12 px and a 180 px screen holds 15 lines |
| Charset | ASCII 32-126, Latin-1 Supplement U+00A0-00FF (every PT-BR diacritic: á à â ã é ê í ó ô õ ú ç and capitals), typographic quotes U+2018-201D, ellipsis U+2026, en dash U+2013 |
| Wordmark | Press Start 2P (OFL) for the all-caps title only; its squeezed accented capitals are never used in mixed-case text |
| Rendering | Bitmap text at an integer zoom under pixel-art rendering; the browser-rasterized Text object is used only for the development overlay |
| Fallback | Silkscreen at 8 px (OFL) with the same charset if m5x7 fails the M0 width test; never a smaller font |
| Icons over words | HUD counters are icon plus number ("x3", "8/10") to dodge plurals and width |

### 14.3 Expansion budgets

Measured on the candidate fonts, PT-BR is +18-21% wider than EN over 22 UI labels, and up to x1.85 for "Press any key" -> "Pressione qualquer tecla" (see docs/RESEARCH.md §5 sources and the localization research). Rules: size every container for the PT-BR string plus 10%, never for the English one; menu labels at most 12 PT-BR characters; prompts up to 24 characters only centered alone on a line; every menu has a 2-line fallback; the card panel holds 4 lines of 34 characters and every approved card must fit it in both languages; the EN longest is the In the Rukh epilogue verse at 121 characters, a named exception to the about-120 card guide that ships as written per docs/RESEARCH.md §4.6 (the Water Truce law is close behind at about 112); L1's cards and toasts are drafted in PT-BR before the M0 V4 spike (docs/PLAN.md §12.3) and polished in M2; each later zone's PT-BR text is drafted and polished together in its M3.x.

| Container | EN example | PT-BR example | Width rule |
| --- | --- | --- | --- |
| Menu label | Options | Opções | 12 characters at 16 px m5x7 (about 72 px) |
| Prompt | Press any key | Pressione qualquer tecla | Centered alone, 24 characters |
| Quota toast | Find Akela | Encontre Akela | 80 px container under the counter |
| Counter label | banked 4/10 | guardadas 4/10 | 80 px; the icon carries the meaning |
| Tier line | Wolf: 10 of 15 | Lobo: 10 de 15 | 112 px |

### 14.4 Glossary of names

In-game names, EN / PT-BR; Kipling spellings for every character in both languages.

| EN | PT-BR | EN | PT-BR |
| --- | --- | --- | --- |
| Seeonee (title) | Seeonee | the Free People / the Pack | o Povo Livre / a Alcateia |
| Mowgli, Bagheera, Baloo, Shere Khan, Kaa, Akela, Raksha, Hathi, Tabaqui, Chil, Thuu, Messua, Buldeo, Phao, Won-tolla, Rama | unchanged | Grey Brother | Irmão Cinzento |
| Bandar-log | Bandar-log | the Poison People | o Povo do Veneno |
| the Little People of the Rocks | o Povo Pequeno das Rochas | Red Dog / dhole | Cão Vermelho / dole |
| Council Rock | Rocha do Conselho | Cold Lairs | Tocas Frias |
| Water Truce / Peace Rock | Trégua da Água / Rocha da Paz | Man-Pack | Alcateia dos Homens |
| Let in the Jungle | Solta a Selva | King's Treasure | Tesouro do Rei |
| Bee Rocks / The Ford | Rochas das Abelhas / O Vau | the Waingunga | o Waingunga |
| The Spring Running / the Outsong | A Corrida da Primavera / a Canção de Despedida | the Law of the Jungle | a Lei da Selva |
| Master Words | Palavras Mestras | moon-stone | pedra-da-lua |
| King's jewel | joia do Rei | nut / clod | noz / torrão |
| Red Flower / garlic | Flor Vermelha / alho | pack-stone (checkpoint) | pedra da alcateia |
| Honey Hollow / Full Moon | Oco do Mel / Lua Cheia | Find Akela | Encontre Akela |
| banked / rallied | guardadas / reunidos | Pack strength | Força da Alcateia |
| Cub / Wolf / Lone Wolf | Filhote / Lobo / Lobo Solitário | Assist Mode | Modo Assistência |
| Modern / Retro | Moderno / Retrô | Continue / New Game / Options / Extras | Continuar / Novo Jogo / Opções / Extras |
| Seeonee Hills / The Waingunga | Colinas de Seeonee / O Waingunga | The Jungle's Justice / Red Dog (zones) | A Justiça da Selva / Cão Vermelho |

Confidence: character and place names high (Kipling and Lobato conventions); "Solta a Selva", "Canção de Despedida", "Oco do Mel" and "pedra da alcateia" are the writers' own coinages (medium), proofread in M5.

## 15 Accessibility

The Game Accessibility Guidelines basic tier as it applies to a 2D platformer (see docs/RESEARCH.md §6), mapped to the feature that satisfies it. Real-time platforming has no fully nonvisual mode in this scope, and the in-game help says so.

| Guideline | Feature | Section |
| --- | --- | --- |
| Remappable controls | Keyboard and gamepad remapping in Options; Escape reserved | 4.2, 4.3 |
| Gamepad support | Standard mapping, stick and D-pad, glyphs by device | 4.3 |
| Touch controls | Virtual pads on coarse pointers, 48 px targets, two presets, opacity | 4.4 |
| Game speed option | Assist: 50-100% in steps of 10 | 9.8 |
| Wide difficulty choice | Cub / Wolf / Lone Wolf changeable at any time from the map; Assist invincibility, infinite clods, skip level | 9.7, 9.8 |
| Interactive tutorial | L1 teaches one verb per screen with a fail-free first screen; every new hazard appears first where failing costs nothing | 10.3, 10.2 |
| No flicker or strobe | No full-screen flashes; the Red Flower flicker is 2 frames on a small sprite; flash reduction replaces the hurt blink with a dim outline pulse | 7.3, 7.5 |
| Camera shake control | Shake slider 0-100%, scripted shakes only | 11.1 |
| Readable text | m5x7 at 16 px with a 12 px line box; cards at most 120 characters in 4 lines | 14.2 |
| High-contrast HUD | Leaf pips by fill and outline; icon plus number counters; the readability tests of 12.3 | 11.2, 12.3 |
| No information by color alone | Quota = gold flip + sting + toast + silhouette; health = filled or outlined shape; hazards = drawn objects with pose and sound telegraphs | 7.6, 9.1, 11.2 |
| Separate volumes | Music and SFX sliders | 13.4 |
| Visible equivalents for audio cues | Every telegraph has a pose; the quota sting has the gold flip; Chil's cry has Chil; the Pack's howl in L8 has Chil-style edge silhouettes of the rallied wolves | 7.6, 9.2 |
| Settings remembered | Every setting persisted in the settings record; settings survive New Game | 9.5 |
| Hold or toggle | Crouch hold or toggle; the Red Flower is a toggle; interact is a hold with a visible ring | 4.5, 9.8 |
| Pause and focus | Pause on focus loss with Resume; no automatic resume | 4.5 |
| Guidance | Chil by tier and "Chil everywhere" in Assist; the exit character's beckon and silhouette | 9.2 |
| No fail pressure by default | Modern mode: no lives, no clock, instant respawn, autosave; Retro is opt-in | 9.6 |
| Non-judgmental wording | "Assist Mode", "Cub", never "easy" or "cheat"; the assist stamp is a glyph, not a caption | 9.8 |
| Language | EN and PT-BR with the toggle on every menu | 14.1 |

## 16 Content plan and scope matrix

### 16.1 Counts

| Content | v1.0 count | Note |
| --- | --- | --- |
| Zones / levels / bosses | 4 / 8 / 4 | Plus the Spring Running (no enemies, no stones) |
| Collectibles | 120 (15 x 8) | 72 path, 32 branch, 16 secret |
| Pack-stones | 31 in levels + 4 boss doors | About one per 60-90 s |
| Storybook cards | 20 cards on the level sheets (including the B1-B3 victory cards) + 2 B4 farewell cards + 7 ending cards + 1 tableau verse + 8 Law cards | All verbatim Kipling |
| Enemy entries | 8 on 4 scripts (6 base sprites, 3 palette swaps) | Plus Buldeo as a hazard NPC |
| Helper animals | 9 named helpers on S3-S6 | Section 6.3 and 2.2 |
| Coded systems | 8 | One coded mechanic per zone |
| Throwables | 3 (nut, clod, Red Flower) + the garlic row | Bent Stick cut-first |
| Tilesets | 4 (about 120 tiles each) + subsets + 1 props sheet | Section 12.6 |
| Sprite frames | About 300 | Section 12.5 |
| Music | 4 zone themes + boss + title + Honey Hollow + ending, 12-14 min | Section 13.2 |
| SFX | About 50 | Section 13.3 |
| Storybook pages | 5 + last page + back cover | Illustrations are a late cut |
| Bonus stages | 1 must (Honey Hollow layout 1; layout 2 should) + 2 cut-first | Section 10.13 |
| Save slots / modes / tiers | 3 / 2 / 3 | Section 9 |
| Languages | 2 | Section 14 |

### 16.2 Hours-of-play targets

| Run | Target | Measured how |
| --- | --- | --- |
| First quota run, Wolf tier | 60-90 min (about 67 min by the sheets) | M3 playtests; detours are added if the median is under 55 min |
| Quota run, Cub tier | 50-70 min | Same round |
| 100%, Lone Wolf | 2-3 h | M4 playtest with the bonus stages |
| One level, first run | 4.5-6.5 min | Per sheet |
| One level, replay | 2-3 min | Time-attack rank (should) |
| Boss attempt | 2-4 min | Median attempts to clear on Wolf: 2-3; a boss with a median above 5 on Cub is a bug |

### 16.3 Must, should, cut-first

| Must (v1 ships without these only if decision D15 forces the Zone 4 merge) |
| --- |
| S1-S6 and S8 built in M1-M2, S7 built in M3.1 with B1 (docs/PLAN.md §12.1); the verbs at the section 5 numbers tuned in the gym level; the universal interact verb |
| Nut, clod, Red Flower and the garlic data row; 8 enemy entries (6 base sprites, 3 palette swaps) on 4 scripts; Buldeo hazard |
| 8 levels per the sheets, 4 tilesets, size caps, 15 collectibles each, quota 8/10/12, pack-stone checkpoints with autosave, Chil by tier, the quota-met chain, ExitNPC beckon |
| L6 pouch and altar, L8 rally; 4 bosses with the phase tables, one arena each, checkpoint at every boss door; the B2 stampede and B1 Dance cinematics (card fallback) |
| Modern mode; Cub / Wolf / Lone Wolf; Assist Mode; Retro floor (3 lives, 6:00 clock, countdown counter); 3 save slots with a versioned schema |
| HUD and menus EN and PT-BR, keyboard, gamepad, touch, remapping, shake slider, flash reduction, pixel-perfect or fill screen |
| Storybook map pages (static, 4 zone pages + cover, Baloo's line per page) over the chapters data screen; storybook cards from the approved list; the Spring Running level; the In the Rukh still and verse; credits with the attribution line; Netlify deploy |
| Honey Hollow layout 1; 4 zone themes + boss + title + ending music; SFX palette |

| Should |
| --- |
| L6 spill-on-hit and thief langurs; the lamplight glow sprite; hut door passages; the L4 sky palette cycle; villagers' door-slam and idle gags; Tabaqui as the B2 living telegraph (fallback: dust mark) |
| B3 coil-edge arena change; B4 rain and cosmetic water rise; the L5 second-map camera pan; Messua's escort walking (fallback: teleport) |
| Honey Hollow layout 2; the Law scroll gallery; cloth palettes; time-attack rank per level shown as a rank, never a fail; save export and import as JSON; Extras screen |
| Retro continues screen polish and score tally |

| Cut-first (in order; each line names its fallback) |
| --- |
| 1 Toomai's Night Ride (no fallback) |
| 2 Rikki-tikki's Garden (no fallback) |
| 3 Bent Stick (the cycle stays at 3 slots) |
| 4 Retro score tally and continues screen (Retro keeps lives, clock and the countdown counter) |
| 5 B3 coil edges and B4 rain (one arena layout each) |
| 6 L6 spill-on-hit and thief langurs (pouch only; coin-throwers stay) |
| 7 Hut and tree passages (open doorways and static creepers) |
| 8 L5 second-map pan (palette swap plus card) and escort walking (teleport) |
| 9 Honey Hollow layout 2 (one layout for all levels) |
| 10 Storybook page illustrations (the chapters list on a parchment background, same data) |
| 11 L4 sky palette cycle (one palette); Chil's screen-edge silhouette (he circles on-screen only) |
| 12 Save export and import; time-attack rank |
| 13 Per decision D15, before slipping a zone: merge L7 and L8 into one level "Bee Rocks to the Ford" (the garlic climb, then the ford rally) feeding B4 |

### 16.4 Milestones the content lands in

| Milestone | Design content delivered | Design gate | Hours (before buffer) |
| --- | --- | --- | --- |
| M1 Feel prototype | The gym level: every section 5 metric measured; one langur, one moon-stone, one pack-stone, the interact verb; 3 testers | Reach measured and the section 5 "about" values corrected in every document | 60-90 |
| M2 Vertical slice | L1 with final art, HUD, save, EN/PT-BR, title and options, Netlify; 10-tester round; the family playtest decides the optional B2 card | P2 and P3 tests pass on L1; median first run 4-6 min | 100-150 |
| M3.1-M3.4 Zone drops | 2 levels + 1 boss + zone enemies + tileset + 2 tracks + cards per zone | Per-zone playtest: deaths per pack-stone, quota-to-exit time, boss attempts | 80-110 each |
| M4 Content complete | Ending, tableau, Honey Hollow, tiers, Retro floor, the L1 tutorial pass | A fresh save reaches the credits on every tier | 40-70 |
| M5 Polish | Feel pass, accessibility, phones, PT-BR proofread, 20-tester round | Section 17 scenarios pass | 70-120 |
| M6 Launch | Production deploy, store page, trailer, license audit | Attribution line everywhere; no excluded word in title, slug or metadata | 25-40 |

Hours are estimated in docs/PLAN.md (630-935 h before the 30% buffer, including M0 Setup at 15-25 h, which carries no design content and so has no row above).

## 17 Design acceptance scenarios

Design-side scenarios, checked in the gym level, the levels or a playtest, numbered G01-G44. docs/PLAN.md holds the automated T-scenarios (T01-T35) and names the G-scenario each one verifies. Where this document cites a locked decision from the project brief it says "decision" before the number.

| ID | Area | Scenario | Pass condition |
| --- | --- | --- | --- |
| G01 | Feel | Full-run jump over a 4-tile gap in the gym | Lands every time from 5 consecutive attempts by a tester who has played 5 min; the same at 5.5 tiles with a run-up |
| G02 | Feel | Standing jump onto a 3-tile ledge; a 4-tile ledge with a ledge grab | Both succeed; a 5-tile wall is not climbable without a creeper or mid ledge |
| G03 | Feel | Tap Jump vs hold Jump | A tap rises about 1.5 tiles, a hold 3.5 tiles, measured on the gym ruler within 2 px |
| G04 | Feel | Press Jump 80 ms after leaving a ledge; 80 ms before landing | Both jumps fire once; 150 ms after leaving does not |
| G05 | Feel | Run into a 4 px root and a 5 px root | The 4 px root is stepped over without a jump; the 5 px root stops the run |
| G06 | Feel | Rise into a ceiling corner overlapping by 4 px and by 6 px | 4 px is corrected sideways, 6 px stops the rise |
| G07 | Feel | Hold Down while falling past a ledge | No capture; releasing Down and falling past the next ledge captures |
| G08 | Feel | Crouch through a 1-tile passage and throw inside it | The 12x14 body passes; the crouch throw fires at 7 px height |
| G09 | Feel | Release a swinging creeper at the forward extreme | Clears the 4-tile gap measured from the extreme (verify in M0; static fallback otherwise) |
| G10 | Feel | Ride Hathi's son, Kaa's coil and a buffalo without input | Mowgli stays on the back through the full path; a jump inherits the platform velocity |
| G11 | Feel | Fall 20 tiles onto floor | No damage in any mode; the landing was visible before the drop or a marked fall-through |
| G12 | Feel | Simulation at 60, 120 and 144 Hz displays and a throttled phone | The same jump arc within 1 px and the same coyote window in ticks |
| G13 | Stones | A straight run of each level on Wolf tier | Yields 8-9 stones; one visible branch completes the quota of 10; three branches reach 12 |
| G14 | Stones | Quota met on any level | Gold flip, sting, silhouette for 3 s, toast for 2 s, the exit character's call and beckon, Chil flies to it, all within the same second |
| G15 | Stones | Die after collecting 7 stones | Respawn at the pack-stone with 7 stones, the clods and the meter |
| G16 | Stones | Tabaqui carries a floor stone off-screen | One nut, clod or stomp drops it where he stands; a collected stone is never taken |
| G17 | Stones | L6 first run by 10 new testers | Median confusion under 30 s and median run under 8 min, else the spill is removed and the altar tutorial enlarged |
| G18 | Stones | Take a hit with 5 jewels in the pouch, then die | The pouch keeps its jewels through both (with spill-on-hit, at most 3 lie on the floor and can be re-collected) |
| G19 | Stones | Rally 15 wolves in L8 | B4 starts with 5 paws; 9 wolves start it with 3 |
| G20 | Stones | 15 of 15 on any level | The Full Moon stamp and the Honey Hollow door appear; the tableau unlocks only with all eight stamps |
| G21 | Stones | Chil on Cub in L1 | He circles the lowest-numbered uncollected stone within 20 tiles, never a secret, never across a wall |
| G22 | Enemies | Every enemy's attack recorded at 60 ms per frame | A pose and a sound before every attack; a ground marker for every landing projectile; wind-ups at least 0.5 s |
| G23 | Enemies | Light the Red Flower next to each of the 8 enemies | Every regular enemy enters flee within 6 tiles; none is hurt; bees pull back 4 tiles; bosses ignore it |
| G24 | Enemies | Stomp each enemy from above | Langurs, Tabaqui, jackals, dogs and the second dhole scatter or flee; cobras, quill-pig and bees cost a hit or cannot be hit |
| G25 | Bosses | Each boss on each tier | Hits per phase 2 / 3 / 4; recovery windows 1.0 / 0.6 / 0.4 s standard and 1.2 / 0.8 / 0.5 s heavy; a nut outside the window bounces with a "tok" |
| G26 | Bosses | Each boss's skill list | Every skill was taught in the two preceding levels; a new tester who cleared both levels clears the boss within 5 attempts on Wolf (median) |
| G27 | Bosses | Die in phase 3 | Retry from the boss door with no card replay and the phase bar reset; no stone lost |
| G28 | Bosses | Watch each boss resolution | No blow lands on the antagonist; it leaves under its own power; B4 shows no wound on Akela |
| G29 | Bosses | Throw a clod inside a recovery window | The window extends by 0.2 s and the hit counts once |
| G30 | Modes | Retro mode, run the clock to 0:00 | A life is lost, respawn at the pack-stone with 6:00 and every stone; at 0 lives, continue from the level start |
| G31 | Modes | Switch Modern to Retro mid-level | Applies at the next level start; the current level keeps its rules |
| G32 | Modes | Change tier from the map | The next level uses the new quota, damage and boss hits; cleared stamps stay |
| G33 | Modes | Assist speed 50% with invincibility on | The game runs at half speed with music pitch unchanged; pits still respawn; the results card shows the assist stamp and the Full Moon rule is unchanged |
| G34 | Modes | Skip level from pause | The level is marked cleared with the stones found so far and no Full Moon; the next level opens |
| G35 | Save | Close the tab at a pack-stone, reopen, Continue | The level resumes at that pack-stone with stones, pouch, clods, meter, gates and Retro lives and clock |
| G36 | Save | A corrupted or older-schema save | Backed up under another key, New Game offered, settings intact |
| G37 | Localization | Toggle PT-BR on every screen | No clipped or overlapping string; every container fits the PT-BR text plus 10%; every card fits 4 lines |
| G38 | Localization | The parity test on both dictionaries | Same key set, same placeholders, no empty strings |
| G39 | Localization | Every diacritic in the card set | Renders in m5x7 at 16 px with no missing glyph box |
| G40 | Legal and tone | Title, slug, package name, store text, credits, boot, the storybook cover | The attribution line present; none of the excluded words; no "homage" wording; Kipling spellings only |
| G41 | Tone | Any 60 s of footage from any level or boss | No blood, wound, corpse or landing blow (pillar P1); one death in the game, Akela's, without a wound |
| G42 | Access | Every setting changed, page reloaded | Every setting persisted; flash reduction replaces the hurt blink; the shake slider at 0 removes every shake |
| G43 | Access | Play L1 with touch on a phone at 2x-3x DPR | Every control at least 48 CSS px; a held button survives a thumb slide; Cub's L1 critical path needs no upward touch throw |
| G44 | Pacing | Median first quota run in the M3.4 round | 60-90 min; under 55 min triggers detours, over 100 min triggers a stone or beat cut |

## 18 Open design questions

Each question has a default answer that applies until a playtest or a milestone changes it; docs/DECISIONS.md records any change.

| # | Question | Default answer | Decided by |
| --- | --- | --- | --- |
| 1 | Easy tier name: Cub or Frog? | Cub / Filhote; Frog / Rã stays recorded as the alternative | M2 family playtest |
| 2 | Crouch hold or toggle by default? | Hold; toggle is the Assist option | M2 |
| 3 | Does Shere Khan's gentle card "Brother, I go to my lair--to die." ship? | Off | M2 family playtest |
| 4 | Do pack-stones heal to full? | Yes, 6 pips on touch; if Lone Wolf feels too soft, healing becomes Cub and Wolf only | M3.2 |
| 5 | Mahua flowers as a 1-pip pickup, at most 3 per level? | Yes, dropped from bunches only | M3.1 |
| 6 | Chil on Wolf: L2 and L7 only? | Yes; if the Wolf median quota-to-exit exceeds 60 s in L4 or L6, Chil is added to those levels on Wolf | M3.2, M3.3 |
| 7 | Does L6 spill-on-hit ship? | Yes (should); removed if scenario G17 fails | M3.3 |
| 8 | Is the swing release verified as a pendulum or shipped as static creepers plus a jump? | Pendulum; static fallback if M0 fails | M0 |
| 9 | Pixel-perfect or fill-screen default on phones? | Pixel-perfect with letterboxing; fill screen off by default | M5 phone round |
| 10 | Touch preset default? | Compact on phones, wide on tablets (by shortest side above 600 CSS px) | M5 |
| 11 | Do hut doors ship as crouch-hold passages or open doorways? | Crouch-hold 0.25 s (should); open doorways as the cut | M3.2 |
| 12 | Tabaqui as the B2 living telegraph or a dust mark? | Tabaqui; dust mark if the extra pathing costs more than 4 h | M3.2 |
| 13 | Storybook page illustrations or the parchment list? | Illustrations, commissioned late; parchment list if cut-first line 10 triggers | M4 |
| 14 | Time-attack rank per level? | Should; shown as a rank glyph, never a fail | M5 |
| 15 | Bent Stick? | Cut; the cycle stays at 3 slots | M3.1 |
| 16 | Does the Act 1 false ending need a "the story continues" hint? | No; the book closes 2 s and reopens; a hint line is added if any M3.2 tester quits at that point | M3.2 |
| 17 | Zone 4 merge if the schedule slips? | L7 and L8 merge into "Bee Rocks to the Ford" before any zone slips; the Spring Running is never cut | M3.4 planning |
| 18 | Language of the first boot when the browser says neither "pt" nor "en"? | English, with the toggle visible on the title screen | M2 |
