# Seeonee: Reference Research

Version 1.0 • September 25 2026 • Prepared for Diego Araujo

This document is the evidence base behind `GDD.md`, `PLAN.md` and `DECISIONS.md`. It records what is known about the 1994 reference game, what the project may and may not take from it, the copyright and trademark position of the source material, the platformer-feel numbers the design borrows, the modernization precedents, the asset and tool shortlist, and the engine versions checked on 2026-09-25. Nothing here is legal advice (see section 3).

### Navigation

1. The reference game
2. What this project takes from it and what it must not
3. Public domain, trademarks and naming
4. Kipling source facts used by the design
5. Platformer feel references
6. Modernization references
7. Asset and tool shortlist
8. Versions verified on 2026-09-25
9. Sources

Confidence labels used in every fact table:

| Label | Meaning |
| --- | --- |
| verified | Read from a primary source: the Genesis US manual scan (page numbers given), the archive.org Mega Drive longplay played on Normal (timestamps given), the Gutenberg text, an official register (USPTO TSDR, EUIPO, TMview/INPI), the npm registry or GitHub Releases API |
| secondary | Wiki, FAQ, review or vendor blog; not contradicted by a primary source |
| contradicted | Sources disagree, or a primary source contradicts the common claim; the disagreement is stated in the row and listed in 1.11 |

Source keys such as `manual p.6`, `longplay 02:40`, `Sega Retro` and `jatin` resolve to the URLs in section 9. Keys such as `legal.json`, `design.json`, `assets.json`, `original.json`, `stack.json`, `verified.md`, `01-narrative-spine.md`, "06 research" and "stack research" name the working research files compiled on 2026-09-25 for this project; they are not part of this repository, and every fact cited from them is restated here.

## 1 The reference game

### 1.1 Identity and versions

| Fact | Value | Source | Confidence |
| --- | --- | --- | --- |
| Title | "Disney's The Jungle Book" (US box "Walt Disney's The Jungle Book"; EU "Walt Disney's Classic: The Jungle Book"; Germany "Disney Das Dschungelbuch"; Spain "El Libro de la Selva"; the Brazilian SNES cart is listed by MobyGames as "Disney's Mogli - O Menino Lobo"). Referred to below as "the 1994 game" | Wikipedia, MobyGames, Sega Retro | secondary |
| Publisher | Virgin Interactive Entertainment; Tec Toy distributed the Mega Drive and Master System carts in Brazil (SMS in September 1994, catalog 027330) | Sega Retro, Tec Toy manual scan | secondary |
| Mega Drive/Genesis developer | Started in 1993 at Virgin Games USA under David Perry; finished by Eurocom in 1994 after Perry's team left to form Shiny. The Genesis manual credits both studios, with Eurocom's Mat Sneap, Steve Wilding and Adrian Mannion on level design | Wikipedia, Sega Retro, manual credits | verified (credits) |
| Other versions | Master System and Game Gear: Syrox Developments (Dec 1993, GG US Jan 1994). SNES: the SNES manual credits Virgin USA staff (programmers Chris Harvey and Jerod M. Bennett, designer Parker A. Davis) while several wikis say Eurocom. NES and Game Boy: Eurocom. MS-DOS: East Point Software, 1994 (Wikipedia) or 1995 (Lilura1, MobyGames) | Wikipedia, SNES manual OCR, MobyGames | contradicted (SNES developer, DOS year) |
| Release dates | Genesis US July 1994 at $69.95 (Sega Retro) or August 1994 (Wikipedia); Genesis EU 26 Aug 1994; SNES US Aug 1994 (RetroAchievements: 15 Jul 1994), EU 26 Aug 1994, JP Sep 1994; NES US Aug 1994, EU 25 Aug 1994 | Wikipedia, Sega Retro, RetroAchievements | contradicted (US Genesis month) |
| Genre | Single-player 2D side-scrolling exploration platformer; ten chapters, each a large multi-directional level with a gem quota | manual p.7, longplay | verified |
| Six different games | The Mega Drive, SNES, NES/Game Boy, Master System/Game Gear and DOS builds differ in level sets and rules. Only the Mega Drive design is the reference (D01); the DOS port is a direct port of it (320x200 VGA, same 10 chapters) | Wikipedia, Lilura1 | secondary |
| Re-release | Disney Classic Games Collection (Switch, PS4, Xbox One, Windows; 23 Nov 2021) includes the Genesis, SNES and Game Boy versions and added saving and save states | Wikipedia, Disney support | secondary |
| Primary evidence used here | Genesis US manual PDF (13 scanned pages, read as images, pp. 3, 5, 6, 7, 8 cited); World of Longplays recording GEN_The_Jungle_Book.mp4, 41:37, played on DIFFICULTY: NORMAL (options screen visible 00:36-00:42, unchanged) | 06 close-out | verified |
| Name note | "Mogli" is the standard spelling of the hero in German and Brazilian Portuguese; in Brazil the Master System game (very widely owned via Tec Toy), the Mega Drive game and the localized SNES cart all circulated, and Brazilian retrospectives (GameBlast 2024) single out the Mega Drive version as the best regarded | GameBlast, pt.wikipedia, de.wikipedia, Tec Toy manual | secondary |

### 1.2 The Mega Drive chapter list (a Genesis-specific fact)

The ten names below were read from the in-game "CHAPTER" title cards in the longplay and match Sega Retro's chapter table and the RetroAchievements set. They apply to the Mega Drive/Genesis (and DOS) version only. The SNES game has eleven different stages (I The Beginning, II Jungle by Day, III Kaa the Snake, IV The Tree Village, V Parrot Ride, VI The Waterfall, VII King Louie, VIII Collapsing Ruins, IX Great Tree at Dusk, X Jungle at Night, XI The Wastelands), no Dawn Patrol, no gem quota to exit, and King Louie fought twice; the 8-bit and Game Boy versions use yet other lists (verified.md, levels votes 0-2).

| # | In-game card (card time) | EU/AU manual name | Objective text observed | Boss | Confidence |
| --- | --- | --- | --- | --- | --- |
| I | Jungle by Day (00:50) | Jungle by Day | FIND 10 GEMS, then FIND BAGHEERA (02:40); short celebration animation beside Bagheera (03:47) | none | verified |
| II | The Great Tree (04:10) | The Great Tree | FIND KAA (06:12) | Kaa (07:50-08:10) | verified |
| III | The Dawn Patrol (08:42) | Dawn Patrol | FIND BAGHEERA (11:17), reached 11:56 | none | verified |
| IV | The River (12:18) | By the River | FIND BALOO (14:40), then "CATCH THE FRUIT" mini-game (15:10-16:50) | Baloo contest, not a fight | verified |
| V | Baloo and the River (17:10) | In the River | FIND 10 GEMS (17:29) with Baloo floating as a ride-able platform (17:29-17:34), then FIND BAGHEERA (18:48) | none | verified |
| VI | The Tree Village (19:10) | Tree Village | FIND THE WITCH DOCTOR (21:38) | Witch Doctor monkeys (22:50-24:00) | verified |
| VII | The Ruins (24:30) | Ancient Ruins | FIND BAGHEERA (27:13), reached 27:41 | none | verified |
| VIII | Collapsing Ruins (28:00) | Falling Ruins | FIND KING LOUIE (30:00) | King Louie (30:40-31:10) | verified |
| IX | Jungle at Night (31:30) | Jungle by Night | FIND BAGHEERA (33:34) | none | verified |
| X | The Wastelands (34:00) | The Wastelands | FIND SHERE KHAN (35:50) | Shere Khan (36:40-37:14), then ending text, congratulations card and credits | verified |

Notes. Bosses fall only on even chapters (2, 6, 8, 10); chapter 4 ends in a skippable fruit-catching contest (the Genesis TAS notes that diving into the river is faster than catching fruit). Every non-boss chapter ends at Bagheera. VGMaps labels chapter 8 "Falling Ruins" and speedrunners write "Baloo & The River" and "The Treevillage"; these are labeling variants, not in-game names. The refuter who could not access the longplay marked "Mowgli's victory dance" unverified; the longplay pass saw a short celebration animation, so the fact stands as "celebration animation", not "dance".

### 1.3 Rules and HUD

| Fact | Value | Source | Confidence |
| --- | --- | --- | --- |
| Gems per level | 15 ("There are 15 gems on each level. To get to the Bonus round, you must collect all 15") | manual p.7 | verified |
| Quota on Normal | 10 ("FIND 10 GEMS" at 01:10, 17:30, 28:20, 31:50) | longplay | verified |
| Quota on Practice / Hard | 8 / 12, shown on the BARE NECESSITIES title-menu screen; the manual only says the quota is announced at the start of each chapter | Wikipedia, GameFAQs SMS guide, manual p.7 | secondary |
| HUD gem counter | Counts DOWN from 15 (gems still uncollected in the level): 15 at level start, 05 when the Normal quota is met and the FIND objective appears (02:40, 14:40, 18:50, 30:00). The manual's "the number of gems you have collected" and jatin's "gems still needed" are both contradicted by the footage. The quota-met cue is the objective text changing to FIND <character> | longplay, manual p.6 | contradicted (manual wording), value verified |
| HUD layout | Top-left TRIES (portrait plus xN), top-center SCORE, top-right GEMS, bottom-left WEAPON plus ammo (99 for the banana), bottom-center TIME REMAINING (m:ss with hourglass icon), bottom-right COMPASS once collected | manual p.6, Sega Retro captures | verified |
| Title menu | START GAME / OPTIONS / BARE NECESSITIES (00:44) | longplay | verified |
| Time limit on Normal | 6:00 (5:58 ten seconds into chapter I; exactly 6:00 at the first frame of V, VI, VIII). The manual says "Each one has a time limit" without a number | longplay 01:10, 17:30, 19:30, 28:20; manual p.7 | verified |
| Time limit on Practice / Hard | 7:00 / 4:00 per Sega Retro only; Wikipedia and TV Tropes say a flat six minutes; Sega Wiki and Disney Wiki say seven (contradicted for Normal by the footage) | Sega Retro, Wikipedia, TV Tropes, fandom wikis | contradicted, unverified |
| Hourglass and timeout | The hourglass adds 30 s (Sega Retro); running out of time costs a life (TV Tropes) | Sega Retro, TV Tropes | secondary |
| Lives on Normal | 3 (HUD "x3" at 01:10-01:12). Refuters who lacked the footage warned "do not assume 3"; the footage settles Normal only | longplay; manual p.6 defines TRIES | verified (Normal), unverified (other tiers) |
| Lives display maximum | x9 shown from 12:40 onward; Retro Oasis says "you can only rack up to 9 lives at one time"; a RetroAchievements "Have 9 lives" badge is reported (Exophase mirror) but the site itself could not be read | longplay, Retro Oasis, Exophase | verified (display), secondary (cap) |
| Health | Single portrait meter whose color drains as Mowgli is hit; hearts "boost" (EU/AU manual) or "replenish some" (Sega Retro) health, not a full refill | manual p.6, EU/AU manual, Sega Retro | verified (meter), secondary (heart amount) |
| Pits and water | "Falling into water will cost Mowgli a life"; bottomless pits likewise, except the Baloo contest where dropping in ends the stage | manual p.7, longplay | verified |
| Difficulty effects | PRACTICE / NORMAL / HARD "adjusts the number of hits required to dispose of each enemy and also makes Mowgli lose more or less energy when hit by an enemy". One refuter, unable to read the manual scan, found no source for this; the manual page settles it. Sega Retro adds timer and quota changes | manual p.5, Sega Retro | verified (hits and damage), secondary (timer and quota) |
| Compass | A pickup, not a fixed HUD element: absent at the start of chapters 1, 2, 5, 6 and 10 and present after pickup (01:30, by 20:00, by 36:10); "one to be found on each level" (EU/AU manual) | longplay, EU/AU manual, Sega Retro | verified |
| Compass on Hard | "On Hard mode, you don't normally get a compass" appears only in the GameFAQs cheats page (European-version Konami code note) and a review of the DOS port; the manual and Sega Retro say every level has one | GameFAQs cheats, EU/AU manual | contradicted, unverified |
| Options | SKILL LEVEL, music on/off, sound effects on/off, SOUND TEST, TRIGGERS to remap A/B/C (manual); Credits entry and an idle-title tips demo (jatin) | manual p.5, jatin | verified (manual items), secondary (jatin items) |
| Continues | Unlimited per Sega Retro (sole source; one Genesis-era review speaks of "using up your continues"); 20-second continue countdown with Mowgli head-first in the dirt; game-over screen shows Shere Khan extending his claws | Sega Retro, TV Tropes | secondary |
| Saving | No save or password on Genesis or SNES; the 2021 collection added saving | GameFAQs reviews, Disney support | secondary |
| Checkpoints | "COLONEL'S HATHI'S SON: He plants a Restart Flag when Mowgli walks by"; collected items are retained after death (Sega Retro); several per level (TV Tropes) | EU/AU manual, Sega Retro | verified (flag), secondary (retention) |
| Scoring | Shooting villains and collecting fruit; end-of-level bonus "based on the time taken and the gems collected" | manual p.8 | verified |
| Level tally screen | Lines GEMS, TIME, FRUIT, MYSTERY1 or MYSTERY4, TOTAL SCORE (tallies at 04:00, 08:20, 12:00, 17:00, 19:00, 24:20, 27:50, 31:20, 33:50, 37:20). TCRF: MYSTERY1 always 20000 due to a bug; MYSTERY2 (no shots fired) 20000 plus a 1-up; MYSTERY4 (chapter 1 with 0 lives) 10000 plus 3 lives | longplay, TCRF via Wayback | verified (lines), secondary (bonus rules) |
| Bonus round entry | All 15 gems (manual); which chapters offer one is not primary-verified (see 1.8) | manual p.7 | verified (requirement) |
| Boss damage | All four bosses are fought with coconuts and boomerangs in the longplay (ammo counters change). "Bosses can only be damaged with projectiles" is Wikipedia, uncited; no primary source states stomp immunity | longplay, Wikipedia | secondary (immunity unverified) |
| Other versions (for reference) | Master System: 9-minute timer, snake-shaped health bar, only four levels need 8 gems, continues disputed (Sega Retro: unlimited; a GameFAQs SMS review: five lives and one continue; Glacoras: green bananas = continue). SNES: lives 3/5/7 (Hard/Normal/Practice, Practice limited to the first three levels), hearts capped at 3/4/5, no timer in regular stages (hourglass only in bonus levels), gems optional (red = continues, green = bonus entry), five bonus levels after every second stage, a "continue gem". Game Boy: 52 HP, 6 lives, 4 continues (6 in Practice), 5-minute timer, 7/10 gems, enemies deal 2/4 damage | Sega Retro, GameFAQs, SNES manual OCR, chciken | secondary (SMS continues contradicted) |

### 1.4 Weapons and pickups

| Weapon | Behavior | Source | Confidence |
| --- | --- | --- | --- |
| Normal banana | "always available", unlimited, weakest, long range; B fires in the held D-pad direction, straight up with Up, diagonally, or while crouching; A cycles collected weapons; B then A locks Mowgli in place to fire in any direction; HUD ammo shows 99 | manual p.3, Sega Retro, jatin | verified |
| Double power banana | Two bananas per throw; "needs less hits to dispose of enemies" (manual), "double damage" (Sega Retro), "extra accuracy" (Retro Oasis); limited ammo from the banana-stand pickup | manual p.3, Sega Retro, Retro Oasis | contradicted (effect wording) |
| Boomerang banana | Medium range, returns, can hit a target twice; the manual calls it "most powerful weapon", Sega Retro and jatin rank the stones higher | manual p.3, Sega Retro, jatin | contradicted (ranking) |
| Pea shooter (stones) | "Mowgli's special weapon" (manual); "The strongest weapon, same long range as bananas" (Sega Retro); "possibly the strongest" (jatin); Wikipedia and Retro Oasis call it the coconut shot; ammo from stone pickups | manual p.3, Sega Retro, jatin | verified (existence), secondary (strength) |
| Mask of invulnerability | Selected like a weapon and switched on; "makes Mowgli immune to enemy weapons"; its meter ticks down and it ends when time runs out or when switched off; bananas can still be thrown. Whether it saves him from pits or water is stated by no source (water always costs a life per manual p.7) | manual p.3, Sega Retro, jatin | verified (behavior), unverified (pits) |
| Stomp | Jumping on enemies "is a faster way to get rid of them than using weapons" but "Mowgli can't always reach some characters" (EU/AU manual); hit detection called finicky by reviewers; boss immunity unverified | EU/AU manual, GameFAQs review 159578, Retro Oasis | verified (exists), secondary (feel) |
| SNES set (contrast) | Bananas (Y, unlimited), papayas (bounce and explode), coconuts (rolled like a bowling ball), mangos (home in); fruit bombs do not carry over between levels; L/R select, A fires | SNES manual OCR | secondary |

| Pickup | Effect | Source | Confidence |
| --- | --- | --- | --- |
| Gem | Level objective, 15 per chapter; feeds the end-of-level bonus; "the size of Mowgli's head" is TV Tropes' description, not the manual's | manual p.7-8, TV Tropes | verified (role) |
| Compass | One per level; once collected a HUD needle points to the nearest gem for the rest of the level | EU/AU manual, Sega Retro, longplay | verified |
| Heart | Restores part of the health meter | EU/AU manual, Sega Retro | secondary (amount) |
| Hourglass | +30 s; also placed inside bonus rounds | Sega Retro, jatin | secondary |
| Banana bunches | "These are revealed randomly when he shoots the bunches of bananas hanging around the screen" (items in general; hearts specifically are not named). One refuter, reading Sega Retro's Mega Drive tables and jatin's walkthrough, found the mechanic listed only for the 8-bit versions; the Genesis manual page states it for this version | manual p.3, Sega Retro | verified (manual p.3); hearts unverified; one secondary listing names the mechanic only for the 8-bit versions |
| Banana stand | Ammo for the double banana | Sega Retro, jatin | secondary |
| Boomerang pickup | Ammo for the boomerang banana | Sega Retro, jatin | secondary |
| Stones | Ammo for the pea shooter | Sega Retro, jatin | secondary |
| Mask pickup (tiki / medicine-man mask) | Adds time to the mask meter | Sega Retro, Retro Oasis | secondary |
| Fruit (grapes, berries, apples and others) | "All fruit provides bonus points" (EU/AU manual); tallied as FRUIT at level end; Retro Oasis says fruit can also yield lives | EU/AU manual, longplay tally, Retro Oasis | verified (points) |
| Mowgli head | "An extra Mowgli character is yours for every head you collect" | EU/AU manual, TV Tropes | verified |
| Elephant checkpoint | Restart Flag; see 1.3 | EU/AU manual | verified |
| 8-bit-only items | Two bananas (50 rapid shots), boomerang for the rest of the level, tribal mask, figleaf or "prickly pear" checkpoint, head, frog (higher jumps in King Louie's temple), green bananas (continue, Glacoras only); Game Boy shovel (bonus level), flower (checkpoint), grapes (health), pineapple (points), leaf (continue) | Sega Retro, Glacoras, Tec Toy manual, chciken | secondary |

### 1.5 Bosses

| Boss | Chapter | Pattern as sourced | Resolution | Confidence |
| --- | --- | --- | --- | --- |
| Kaa | II The Great Tree | Appears in his area only once the quota is met (TV Tropes); hypnotic rays or rings from his eyes damage on contact; the SNES manual's wording (duck and jump over the rays, he flashes white when hit, slips out of the tree) is the most detailed and is SNES text; on Genesis he is pelted with projectiles at 07:50-08:10 | Slips away; chapter ends | verified (placement, projectile use), secondary (ray pattern) |
| Baloo | IV The River | Boss music and the film voice clip "It's Baloo the Bear!" start; Baloo throws fruit to catch while the platforms sink; dropping into the water at any time after the music starts ends the stage | Not a fight; a scored contest | verified (footage), secondary (voice-clip wording) |
| The Witch Doctor | VI The Tree Village | Three monkeys stacked under a tall wooden mask-shield on a tree trunk, walking and throwing projectiles; then the trio splits, each monkey with its own health bar behind a piece of the shield, defeated one by one (TV Tropes "Sequential Boss"). The EU/AU manual: "Well, it's not really - it is in fact three Cheeky Monkeys"; the Genesis TAS lists Monkey 1/2/3. "Wooden shield" (TV Tropes) versus "tribal mask" (2008 Wikipedia walkthrough) is a wording split; the footage shows a tall carved mask used as a shield | Three separate monkeys defeated | verified (identity), secondary (phases), contradicted (prop name) |
| King Louie | VIII Collapsing Ruins | Bowls coconuts along the ground and throws bananas (Disney Wiki); after defeat he slams the ground and the ruins collapse (Disney Wiki, TV Tropes); one reviewer needed a few tries (Cousin Gaming). Chapter VII has no boss; no source places Louie at the end of chapter 7 | Ruins collapse | verified (placement), secondary (attacks) |
| Shere Khan | X The Wastelands | Stationary on a cliff at the right; flings embers and breathes rings of fire while Mowgli balances on rising and falling platforms above a fire pit; lightning strikes anyone who stands still (TV Tropes). "Pretty difficult" (TV Tropes); "took me a few tries" (Cousin Gaming); no source says he needs the stronger weapons | Ending and credits | verified (placement), secondary (attacks) |

Other versions for the record: the NES makes Baloo a real boss (ground-shaking jumps submerge the fish platforms) and its Kaa pops out at four fixed spots; the Master System Kaa spits venom and is beaten by bouncing over him on a spring snake; the Master System and SNES fight King Louie twice and have no Witch Doctor; the Master System Shere Khan sits on a boulder and never attacks. Whether the SNES Tree Village has the Witch Doctor is disputed inside TV Tropes itself ("all versions" versus "most versions"); the SNES manual, stage lists and all-bosses runs show no such fight.

### 1.6 Traversal and controls

| Verb | 1994 behavior | Source | Confidence |
| --- | --- | --- | --- |
| Run and jump | D-pad left/right; C jumps, with vertical, directional and running variants | manual | verified |
| Variable jump height | None on Genesis (tap and hold give the same jump); the SNES version has tap = low, hold = high | jatin, SNES manual | secondary |
| Crouch and camera look | Down crouches and allows low fire against low enemies; Up or Down while standing scrolls the view | manual, jatin | verified |
| Vines | Auto-grab on contact; climb with Up/Down; C jumps off; moving vines chain "Tarzan" swings; no weapons while on a moving vine | jatin, manual | secondary |
| Parachute and enemy bounce | From big drops the loincloth billows and Mowgli floats down safely; landing on an enemy sends him flipping upward | jatin, Sega-16, Nerdbacon | secondary |
| Tree holes, huts, doors | On chapters 2 and 6, hold Up beside one to travel to a new location (tree "elevators", hut teleports) | manual | verified |
| See-saw plants | "See-saws enable Mowgli to jump higher, if you handle them right" | manual | verified |
| Sleeping snakes | Trampolines in bonus rounds (and throughout the 8-bit versions) | Sega Retro, jatin | secondary |
| Animal platforms | Baloo floats as a ride-able platform in chapter V (17:29-17:34); marching elephants serve as rides in chapter III | longplay, GameFAQs review 161086 | verified (Baloo), secondary (elephants) |
| Aim lock | B then A locks Mowgli in place to fire in any direction | manual | verified |
| Pause, skips, remapping | Start pauses; A + Start at the title skips the intro and "Get Ready" screens (jatin); the TRIGGERS option remaps A/B/C (manual p.5) | jatin, manual p.5 | verified (remapping), secondary (skips) |
| Missing verbs reviewers wanted | No ledge grab or pull-up; no way to lower onto a vine below | GameFAQs review 161086 | secondary |
| Water and pits | Instant loss of a life everywhere except the Baloo contest | manual p.7 | verified |
| Output resolution | Mega Drive 320x224; the DOS port runs 320x200 VGA at 50 fps | stack research, Lilura1 | secondary |

### 1.7 Enemies and hazards

| Enemy or hazard | Behavior | Source | Confidence |
| --- | --- | --- | --- |
| Monkeys | Sit on branches or the ground and throw coconuts, stones or fruit | manual, jatin | verified (listed) |
| Snakes and spitting cobras | Sit, hang from branches or hide in bushes; spit venom | manual, jatin | verified (listed) |
| Flies, bees, dragonflies | Swarm and dive | manual ("flies"), GameFAQs review | verified (flies) |
| Jumping fish, crocodiles; scorpions, falling rocks, spikes | River chapters; ruins chapters | manual, NES guide | verified (listed) |
| Wild boars, owls, porcupines, parrots, hyena | Boars patrol a span and charge; owls (a Friend Owl cameo from Bambi) attack from afar; porcupines shoot quills; parrots are enemies on the Mega Drive and rides on the SNES; a hyena appears in The Wastelands | jatin, GameFAQs reviews, TV Tropes | secondary |
| Lightning, crumbling platforms, fire pit and fire rings | Lightning strikes Mowgli if he stands still in The Wastelands; crumbling blocks in Collapsing Ruins; fire in the Shere Khan arena | TV Tropes, Cousin Gaming | secondary |
| Pits, water, timeout | Instant loss of a life | manual p.7, TV Tropes | verified (pits, water) |

### 1.8 Bonus rounds and secrets

| Fact | Value | Source | Confidence |
| --- | --- | --- | --- |
| Entry | All 15 gems in a level | manual p.7 | verified |
| Which chapters | The longplay never reaches 15/15, so no bonus round appears in it. RetroAchievements defines "Gem Master ... access the bonus level" only for chapters 1, 3, 5, 7 and 9; TCRF describes a debug option "Play bonus level after each stage" | Exophase mirror, TCRF via Wayback | secondary (odd chapters likely) |
| Content | A cavern of fruit and points on a 20-second clock, sleeping-snake springs, hidden extra lives at the top left, hourglasses that extend the clock; five layouts that repeat | Sega Retro, jatin, VGMaps "Bonus Level Area 1-5" | secondary |
| Pause-screen codes | Konami code (Up Up Down Down Left Right Left Right B A) refills health, resets lives "to the default number (depending on difficulty)", restarts the timer, grants the compass and 99 of every weapon; level-warp codes for Baloo, Kaa, King Louie, Witch Doctor Monkeys, Shere Khan and the ending; level skip; ten-seconds-left code; palette code; upside-down "mirror mode"; three developer messages | GameFAQs cheats, jatin, TV Tropes, Sega Retro hidden content | secondary |
| Debug menu | Level select, invincibility, infinite lives and time, single-gem mode, force bonus level; reached via a 19-input code after jumping into the chapter 1 briar canyon | TCRF, Sega Retro hidden content | secondary |
| Game Genie | Codes to start with 2, 5 or 10 lives (the stored value is a single ASCII digit, so the HUD can only show 0-9) | gamegenie.com, jatin, refuter decoding | secondary |
| Easter eggs | Kaa drops over the Sega logo; MST3K names in the SNES thanks | jatin, TV Tropes | secondary |

### 1.9 Reception

| Outlet or measure | Verdict | Source | Confidence |
| --- | --- | --- | --- |
| EGM (1994) | Genesis 7/8/6/7; SNES 8/8/7/8/8; NES 8/7/5/7; Game Gear 6/6/6/6/7 | Wikipedia | secondary |
| Sega Retro aggregate | 85% over 41 Mega Drive reviews (Joypad 96, Player One 94, Consoles+ 93, Sonic the Comic 92, Mega 90, GamesMaster 90, Sega Power 90, GameFan 88, GamePro 85, Mean Machines Sega 75, EGM 70) | Sega Retro | secondary |
| Awards | GameFan 1994 Megawards "Best Genesis Movie to Game Translation"; Mega ranked it #21 Mega Drive game of all time; Total! ranked the SNES version 53rd; UK top-selling Master System game March 1994 | Wikipedia, Sega Retro | secondary |
| Praise (1994) | Fluid Aladdin-quality animation, colorful detailed backgrounds, huge open vertical levels, tight control, film music, the Genesis judged the fastest and most varied version | GamePro, GameFAQs reviews, Cousin Gaming ("movements feel extremely tight") | secondary |
| Criticism (1994) | GamePro on Genesis: "lack of continuous and sometimes imprecise controls"; on SNES: repetitive vine swinging; on NES: plodding | Wikipedia | secondary |
| Modern reviews | Sega-16 8/10 (backtracking breaks flow, thin ambient sound); HonestGamers 8/10; GameFAQs 9/10 (stomp hit detection, no ledge grab, no save); Retro Games Review 2026 (instant-death pits, camera, ignored inputs, sketchy collision); Retro Oasis (hit detection); Cousin Gaming (easy overall, Louie, Khan and Collapsing Ruins bite) | as named | secondary |
| Difficulty profile | Generous timer that rarely obstructs on Normal; Hard cuts the timer per Sega Retro; no save, so replay relies on the freeform levels | Sega Retro, reviews | secondary |

### 1.10 What made it special

It is the exploration sibling of Virgin's Aladdin. The same Virgin USA animation crew (Mike Dietz, Ed Schofield, Doug TenNapel, Dean Ruggles, Nick Bruty on backgrounds) produced rubbery, film-faithful hand animation (flipping stomps, the parachute loincloth, the monkeys' stretcher gag, Kaa peeking over the Sega logo) on top of Disney-supplied background art. Instead of Aladdin's linear stages it revived the Global Gladiators / Cool Spot "collect N objects, then find the exit" loop and paired it with a compass pickup, a timer and enormous vertical levels built from trees, vines, hollow-trunk elevators, hut teleports and animal platforms. Storybook chapter cards, the film's songs adapted by Tommy Tallarico's team, and boss set-pieces that mirror the film's beats gave it a "playable movie" identity (original.json synthesis; secondary).

The ingredients worth keeping as ideas: gem-quota exploration with a guide to the next gem, vine physics and vertical layouts, animal-helper traversal, a small weapon ladder plus a timed protective item, visible checkpoints, all-15 bonus caverns, and cheerful comedic presentation for younger players. The ingredients that read as flaws today: instant-death pits and water, no ledge grab, a single life-and-timer economy, no save, and finicky stomp hitboxes.

### 1.11 Contradictions still open

1. Timer on Practice and Hard: 7:00 / 4:00 (Sega Retro only) versus a flat six or seven minutes elsewhere; Normal is 6:00 (verified). A Hard-mode recording or emulator check would settle it.
2. Default lives on Practice and Hard: unknown; Normal is 3 (verified).
3. Compass on Hard: withheld per a GameFAQs cheat note and a DOS-port review; "one on each level" per the EU/AU manual and Sega Retro.
4. Boss immunity to stomps: Wikipedia, uncited; the longplay only shows projectiles being used.
5. Bonus rounds after even chapters: RetroAchievements implies odd chapters only; TCRF's debug option "after each stage" suggests the code path exists.
6. Witch Doctor prop: "wooden shield" (TV Tropes) versus "tribal mask" (2008 Wikipedia walkthrough).
7. Strongest weapon: boomerang (manual) versus stones (Sega Retro, jatin); double banana effect: fewer hits, double damage or extra accuracy.
8. Random items from shot banana bunches on Genesis: manual p.3 says yes; one refuter found it only in the 8-bit sources; hearts specifically unverified.
9. Difficulty changing enemy hits and damage: manual p.5 says yes; one refuter (no access to the scan) found no source. Treated as verified on the manual.
10. Unlimited continues: Sega Retro alone; one Genesis-era review implies finite continues.
11. Level-name variants: in-game cards versus the EU/AU manual versus VGMaps and speedrun names.
12. SNES developer (Virgin USA credits versus "Eurocom" wikis); DOS year (1994 versus 1995); US Genesis month (July versus August 1994).
13. Genesis Kaa attack details beyond "hypnotic rays": reconstructed from the SNES manual and 8-bit guides; medium confidence.
14. Mask protection from pits and water: not stated by any source.
15. Lives cap of 9: the HUD digit is single and x9 is the highest value seen; whether the game enforces a cap is unproven.

## 2 What this project takes from it and what it must not

Copyright protects expression, not ideas or rules: US Copyright Office FL-108 ("Copyright does not protect the idea for a game, its name or title, or the method or methods for playing it"), Circular 33 (names, titles and short phrases), and Brazil's Lei 9.610/98 art. 8 IV and VI (game rules and isolated names or titles are excluded from protection). The 1994 game's mechanics are therefore reusable; its art, text set, layouts, music and sound are not (legal.json; verified.md pd corrected claims).

### 2.1 Ideas reused (with the Seeonee expression decided in the brief)

| 1994 idea | Seeonee expression | Decision |
| --- | --- | --- |
| 15 gems per level, quota 8/10/12 by difficulty, quota met unlocks the exit | Same numbers; the collectible is the moon-stone / pedra-da-lua, one skin per D28 (L6's King's jewels and L8's resting wolves are the two named exceptions) | D06, D28 |
| Find a friendly character to end the chapter | Exit characters from Kipling: Akela, Kaa, Hathi, Grey Brother, Hathi, Thuu's gate, Kaa, Phao | D05 |
| Boss every other chapter (verified, §1.2); bosses damaged by projectiles only (unverified, §1.11 item 4) | Four bosses closing four zones; bosses take projectiles only, regular enemies can be stomped | D05, D07 |
| Weapon ladder: unlimited weak shot plus limited stronger ammo | Nut / noz (unlimited) and clod / torrão (limited); the Red Flower as the timed item | D07, D29, D30 |
| Timed invulnerability mask | One timed defensive item; the Red Flower analogue scares, never burns, living creatures | D07 |
| Auto-grab vines and chained swings | Auto-grab and climb creepers, swing on moving creepers (period about 1.6 s) | D07, D09 |
| Animal platforms (elephants, Baloo raft) | Kaa's coils, Hathi's sons, buffalo as moving platforms | D07 |
| Compass pickup pointing to the nearest gem | Chil the kite as the diegetic compass by tier (Cub every level, Wolf L2 and L7, Lone Wolf none), circling the next uncollected stone in a designer-set order; flies to the exit character at quota on every tier; no HUD needle | D37 |
| Elephant checkpoints | Visible checkpoints that autosave, instant respawn | D06 |
| 6:00 timer, 3 lives, continues | Retro mode only, off by default, never required for content | D06 |
| Bonus cavern on 15/15 | Bonus cavern on 15/15 | D06 |
| Storybook chapter cards | Cards quoting Kipling verbatim, at most about 120 characters at 320x180 | D04 |
| Difficulty changing enemy hits and damage | Tiers change quota, damage taken and boss hits per phase | D06 |
| No ledge grab (a reviewer complaint) | Ledge grab and pull-up added | D07 |

### 2.2 The 1994 game's expression: exact exclusion list

Everything below is copyrighted expression under Disney's license and must not be copied, ripped, traced, "demade" or closely imitated (legal.json `virgin_game_specific_elements`, corrected in verified.md):

1. Level names as a set. Mega Drive: Jungle by Day, The Great Tree, The Dawn Patrol, The River, Baloo and the River, The Tree Village, The Ruins, Collapsing Ruins, Jungle at Night, The Wastelands. Game Boy: Jungle by Day, The Great Tree, Dawn Patrol, By the River, In the River, Tree Village, Ancient Ruins, Falling Ruins, Jungle by Night, The Wastelands. Master System/Game Gear: Jungle by Day, Great Tree, Dawn Patrol (bonus), By the River, In the River, Tree Village, King Louie's, Falling Ruins, Jungle at Sunset, Jungle at Night, The Wastelands. A single generic phrase is not protectable, but reproducing the sequence and theme list is evidence of copying the selection and arrangement. Seeonee's level list comes from Kipling's stories (D05).
2. Art: all sprites, animation frames, tiles, backgrounds, parallax layers, HUD, fonts, title screen, box and manual art (Mega Drive animation by Mike Dietz, Edward Schofield, Doug TenNapel, Shawn McLean, Roger Hardy, Clark Sorenson, Jeff Etter, Dean Ruggles, Bob Steele, David Simmons; backgrounds by Christian Laursen, Lin Shen, Nick Bruty).
3. Level design: the actual maps, gem placements, platform layouts, boss arenas and the set-pieces (tree village, ruined temple, burnt wasteland), which are also Disney-film settings.
4. Music and sound: every track and chiptune arrangement (Genesis music by Tommy Tallarico, Joey Kuras, Mark Miller, Donald S. Griffin, Stephen Clarke-Willson, Keith Arem; DOS by Allister Brimble; SMS/GG by Eurocom/Neil Baldwin; SNES arrangements by Neuromantic Productions, including the tracks "Bare Necessities Rag", "Jungle Jazz", "Tiki Village", "Jungle Tek", "Afrobeaty", "Bonus Level", "Scary", "Frantic", "Jungle Droll"); the covers of the three Disney songs are doubly protected; sound effects and voice clips such as "It's Baloo the Bear!".
5. Branding: the "Disney's The Jungle Book" logo and lockup, the Virgin and Eurocom marks.
6. Bosses and characters as depicted: the Kaa, Baloo, King Louie, Witch Doctor and Shere Khan boss sprites, arenas and attack choreography; the Mowgli sprite and its animations.

Also excluded by D02: the HUD composition, the storybook card texts, and any Disney element (King Louie, vultures, Colonel Hathi and the Dawn Patrol, Shanti, the songs, Disney designs, and Disney spellings such as Mogli, Baguera and Balu inside the game).

## 3 Public domain, trademarks and naming

Not legal advice. This section is research for a design document. The trademark rows were read from official registers on 2026-09-25 through TMview, EUIPO's register and USPTO TSDR; register status changes, so re-run the searches in 3.5 before launch. A Brazilian IP lawyer should review the final title and store listing (legal.json confidence notes).

### 3.1 Kipling's copyright status by country

Rudyard Kipling died on 18 January 1936. The Mowgli stories are The Jungle Book (Macmillan, 1894; stories serialized 1893-94), The Second Jungle Book (November 1895) and "In the Rukh" (Many Inventions, May 1893).

| Territory | Rule | Kipling public domain since | Source | Confidence |
| --- | --- | --- | --- | --- |
| United States | Works published before 1931 are public domain as of 1 Jan 2026 (Cornell chart; Duke Public Domain Day 2026); Gutenberg #236 and #1937 carry "Public domain in the USA" | Always (pre-1931 texts and their 1894-95 illustrations) | Cornell, Gutenberg | verified |
| European Union | Life plus 70 (Directive 2006/116/EC art. 1(1)) | 1 Jan 2007 | EUR-Lex | verified |
| United Kingdom | Life plus 70 (SI 1995/3297), kept after Brexit | 1 Jan 2007 | LexisNexis glossary | verified |
| Spain | Life plus 80 for authors who died before 7 Dec 1987 (Law of 10 Jan 1879 art. 6); one refuter notes it is unclear whether the 1 January rule applies, so "by 2017 at the latest" | 1 Jan 2017 | Wikimedia Commons Spain page | verified (minor date nuance) |
| France | Wartime extensions absorbed by the harmonized term (Cour de cassation, 1re civ., 27 Feb 2007, no. 04-12.138) | 1 Jan 2007 | Legifrance, Dalloz | verified |
| Brazil | Lei 9.610/98 art. 41: 70 years from 1 January after death; art. 45 sends expired works into the public domain; the term had already expired under Lei 5.988/73 art. 42 (life plus 60) and art. 112 does not revive it | 1997 under the old law, 1 Jan 2007 at the latest | Planalto | verified |
| Mexico, Colombia, Jamaica | Life plus 100 (non-retroactive; authors who died before 1952), life plus 80 (expired end 2016), life plus 95 (only authors who died in 1962 or later) | Public domain in all three | Wikimedia Commons, Wikipedia term list | secondary |
| 1894-95 illustrations | John Lockwood Kipling d. 1911, William Henry Drake d. 1926, Paul Frenzeny d. 1902 (some sources 1906) | Everywhere | Wikipedia | verified |
| Detmold plates (1903, 1908) | Edward Detmold d. 1 Jul 1957 | US: public domain; EU and Brazil: protected until 31 Dec 2027; do not trace them before 2028 | Wikipedia | secondary |
| Monteiro Lobato's 1933 translation | Lobato d. 4 Jul 1948 | Brazil, 1 Jan 2019; no digitized edition exists, so PT-BR strings are written from the Gutenberg text (D12) | pt.wikipedia | secondary |
| Disney's 1967 film | US: 95 years from publication with notice; EU: 70 years after the last surviving co-author (end 2094 if the Sherman Brothers count, end 2053 if only George Bruns); Brazil: art. 44, 70 years from disclosure (about 2038), while its songs and designs keep their own terms | US: 1 Jan 2063 | Wikipedia, Cornell, Planalto | secondary (EU and Brazil reasoning) |

Consequence: every Kipling character, name, place, plot line, poem and the first-edition plates are free to reuse as a matter of copyright in every target market: Mowgli, Baloo, Bagheera, Shere Khan, Kaa, Akela, Raksha, Father Wolf, Grey Brother, the Bandar-log, Hathi, Tabaqui, Chil, Mang, Ikki, Mor, the dholes, Thuu the White Cobra, Messua, Buldeo, Seeonee, the Waingunga, Council Rock, the Cold Lairs, the Bee Rocks, the Red Flower, the Law of the Jungle, the Master Words, the Water Truce; also Rikki-Tikki-Tavi, Nag, Nagaina, Darzee, Kotick, Toomai and Kala Nag for bonus content. Trademark rights in some of these names for games are a separate question (3.3).

### 3.2 What is not free: Disney's additions

Everything the 1967 film and its sequels added is protected and excluded (legal.json `disney_specific_elements_to_avoid`):

1. King Louie, an orangutan "king of the apes" (animated by Milt Kahl, Frank Thomas and John Lounsbery; voiced by Louis Prima), his 2016 Gigantopithecus version, his temple throne, his desire for fire, and Flunkey. Kipling's Bandar-log have no king.
2. The vultures Buzzie, Flaps, Ziggy, Dizzy and Lucky (2003). No vultures in the book.
3. "Colonel Hathi" as a pompous military elephant, the Dawn Patrol march, Winifred and Hathi Jr. The name Hathi and the wise wild elephant are Kipling's; the colonel persona is Disney's.
4. The village girl (Shanti in 2003), Ranjan, and the "My Own Home" ending.
5. All six songs and their arrangements: "The Bare Necessities" (Terry Gilkyson), "I Wan'na Be Like You", "Trust in Me", "Colonel Hathi's March", "That's What Friends Are For", "My Own Home" (Sherman Brothers); George Bruns's score; any chiptune or sound-alike cover.
6. Disney's Mowgli design: slender preteen, wild black hair over forehead and ears, barefoot, red cotton langot; the nickname "Little Britches"; the voice and likeness of Bruce Reitherman and Neel Sethi.
7. Disney's Baloo: gray-blue, pot-bellied, lazy jazz-singing bear (Phil Harris persona), the back-scratching gag; TaleSpin and Jungle Cubs Baloo.
8. Disney's Kaa: a bumbling villain with swirling multicolored eyes and a lisp who keeps trying to eat Mowgli.
9. Disney's Shere Khan: suave, unlame, George Sanders-voiced, defeated by a burning branch tied to his tail; Milt Kahl's design.
10. Disney's Bagheera as the fussy guardian and the film's Baloo/Bagheera role swap.
11. The 1967 plot skeleton (baby in a wrecked boat, council sends Mowgli away, Kaa hypnotizes Mowgli, elephant patrol, kidnapping to Louie's temple, Baloo's ape disguise, vultures, fire-branch fight, the girl leads him to the village); the Ken Anderson model sheets, backgrounds and color scripts; the 1994 and 2016 live-action looks and the 2003 sequel.
12. The names and marks "Disney", "Disney's The Jungle Book", "Walt Disney's The Jungle Book", "Disney Das Dschungelbuch", the Disney logotype and fonts, and any claim of official status.

Design guidance derived from this (legal.json `character_design_guidance`, D08): apply the "Pooh red shirt" test to every character and remove each Disney visual tell. Mowgli as an older wiry teen with tied-back hair, callused knees and elbows, a knife and a fire pot, an ochre or undyed garment; Baloo as a shaggy dark sloth bear with a cream V and a teacher's demeanor; Bagheera with the bare collar mark under his jaw; Shere Khan visibly lame with Tabaqui as scout; Kaa as a 30-foot ally whose hypnosis is a dance; the Bandar-log as a leaderless langur swarm; Hathi silent and ancient with three sons.

### 3.3 Trademark register (read 2026-09-25)

United States (USPTO TSDR and TMview):

| Mark | Owner | Number | Classes and goods | Status | Confidence |
| --- | --- | --- | --- | --- | --- |
| THE JUNGLE BOOK | Disney Enterprises, Inc. | Reg. 5424008 (SN 86983615, filed 23 Nov 2015) | 9: downloadable game software, computer game software downloadable from a global computer network, video game software | Live; registered 13 Mar 2018; §8/15 accepted Aug 2024 | verified |
| THE JUNGLE BOOK | Disney | Reg. 5932233 (SN 86828910) | 41: film distribution and "entertainment services via a global communication network in the nature of online games and websites" | Live; registered 10 Dec 2019; §8/15 accepted Feb 2026 | verified |
| THE JUNGLE BOOK | Disney | Reg. 5438803 (3 Apr 2018), Reg. 5561534 (11 Sep 2018) | 28: toys and games | Live (divisional children of the class 28 parent) | verified |
| THE JUNGLE BOOK | Disney | Reg. 5944363 (16), 5932229 (18), 5932230 (20), 5938252 (21), 5932231 (24), 5932232 (25) | Merchandise classes | Live | verified |
| THE JUNGLE BOOK | Disney | Reg. 5424000 (class 14); apps 86828879 (28), 86828919 (9, mobile apps) | | Canceled 27 Sep 2024; abandoned 24 Feb 2020 and 10 Feb 2020 | verified |
| WALT DISNEY'S THE JUNGLE BOOK | Disney | Reg. 2976340 | Bubble bath | Dead | secondary |
| DQ ENTERTAINMENT THE JUNGLE BOOK (figurative) | Powerkids Entertainment (Singapore) Pte. Ltd | Reg. 5097722 (Madrid SN 79175363; IR 1271452) | 9, 28 incl. computer game software | Canceled 4 Jul 2025 (Section 71); no longer supports a coexistence argument | verified |
| JUNGLE BOOK | BKN International AG | App 78908006 | 9 | Abandoned 14 Jun 2007 | verified |
| MOWGLI | Disney | none | | No US application or registration found | verified (search) |
| MOWGLI | Mowgli, LLC | Reg. 4395137 | 41: providing on-line computer games | Canceled 5 Jun 2020 | verified |
| MOWGLI | Xiamen Mogeli Outdoor Products | Reg. 7937473 | 9 (goods not verified) | Live; registered 9 Sep 2025 | verified (status), unverified (goods) |
| MOWGLI'S RUN | Playstudios, Inc. | Reg. 6584904 | 9 | Live; 7 Dec 2021 | verified |
| MOWGLI'S 4D JUNGLE ADVENTURE | SimEx-Iwerks | Reg. 6373541 | 41 | Live; 2021 | verified |
| MOWGLI (others) | Various | Reg. 4080085 (25); app 98057841 (42, chatbot); apps 88675588 and 88675513 (43, Mowgli Street Food) | | Canceled 15 Jul 2022; abandoned 3 May 2024; abandoned 13 Aug 2020 | verified |
| MOGLI | Disney | none | | No US records | verified (search) |
| MOGLI | Caldera Brewing; MOGLI Naturkost GmbH; MOGLI LLC | Reg. 4019195 (32); US Reg. 5033585 = Madrid 79122040 (cosmetics); app 99339812 (handbags, filed 15 Aug 2025) | None in 9 or 41 | Live; canceled 28 Jul 2022; pending | secondary (Caldera, MOGLI LLC), verified (Naturkost) |

European Union and United Kingdom (EUIPO register, TMview, UK IPO):

| Mark | Owner | Number | Classes and goods | Status | Confidence |
| --- | --- | --- | --- | --- | --- |
| THE JUNGLE BOOK | Disney Enterprises | EUTM 010837219 | 3, 9 ("computer game programs; computer game cartridges and discs; video game cartridges; video game discs"), 14, 16, 18, 20, 21, 24, 25, 28, 29, 30, 32, 41 ("online interactive entertainment") | Live; examiner's partial refusal 20 Nov 2013 (Art. 7(1)(b)); Board of Appeal R 118/2014-1 (18 Mar 2015, appellant Disney) partially annulled it; registered 23 Nov 2015 without books or films; renewed to 25 Apr 2032 | verified |
| THE JUNGLE BOOK | Disney | UK00910837219 (cloned comparable mark) | Same classes | Live | verified |
| DISNEY DAS DSCHUNGELBUCH | Disney | EUTM 013689765 | 9, 16, 41 | Live | verified |
| MOWGLI | Disney | EUTM 010837102; UK00910837102 | 9, 28, 41 among others | Expired 25 Apr 2022 (EU) and 2022 (UK) | verified |
| JUNGLE BOOK (figurative) | Powerkids Entertainment | EUTM 018142789; UK00918142789 | 9, 28, 41 | Live | verified |
| DQ ENTERTAINMENT THE JUNGLE BOOK (figurative) | Powerkids | IR 1271452 (filed 3 Jul 2015) | 9, 28 | UK designation registered 31 Aug 2016 | verified |
| Mogli Games | Mogli Distribution GmbH | EUTM 019018349 (2024) | 9: games software, video and computer game programs, mobile apps; 28: electronic games | Live | verified |
| Mogli | MOGLI Naturkost GmbH | DE 302012033093 | 9, 16, 31, 41 | Live | verified |
| MOWGLI | Made to Stay SRL | EUTM 019017621 | 9, 41 (music) | Live | verified |
| MOWGLI | Mowgli Street Food Ltd | EUTM 019139658; UK00004155322 (2025) | 9, 35, 42 | Live (a 27-restaurant UK chain operating since 2014 with no reported Disney dispute) | verified |
| Mowgli | Sebastian Gaeta | UK00002540986 (2010) | 41 | Live | verified |
| UK IPO decision O/0333/25 | Julynka Ltd v City ID B.V. | App 3932867 "JULY", classes 30 and 43 | Not a Mowgli case; the earlier research note citing it was wrong and is withdrawn | Decided 7 Apr 2025 | verified |

Brazil (INPI via TMview; Disney filings of 2 May 2012, granted 14 Apr 2015 and 2017):

| Mark | Owner | Number | Classes | Status | Confidence |
| --- | --- | --- | --- | --- | --- |
| THE JUNGLE BOOK | Disney | 840110561 (9), 840109822 (41), 840110111 (28), 840110456 (16), plus 3, 14, 18, 20, 21, 24, 25, 29, 30 | Games, online entertainment, toys, print, merchandise | Live (class 32 expired) | verified |
| MOWGLI | Disney | 840109601 (9), 840109288 (28), 840109520 (16), plus 14, 18, 20, 21, 24, 25, 29 | Software and games, toys, print, merchandise | Live; class 41 application 840110316 lapsed | verified |
| MOGLI, LIVRO DA SELVA, MENINO LOBO | Disney | none | | No Disney marks found; third-party "MOGLI O MUSICAL" (expired) and small MOGLI pet-shop marks exist | verified (search) |
| SEEONEE | none | | 9, 28, 41 | The brief records no hits in the classes checked at USPTO, TMview and INPI; this document did not re-run that search | secondary (per D03; re-verify) |

Doctrine that frames the table (secondary unless noted): in the US a single creative work's title is not registrable (TMEP 1202.08), which is why anyone may call a public-domain work by its name, while a series or franchise title is registrable, which is how Disney holds THE JUNGLE BOOK; nominative and descriptive fair use are defenses, not immunity. EUIPO treats famous public-domain story titles as descriptive for content classes 9, 16, 28 and 41 (Guidelines 2.7.2 "Titles of books"; PINOCCHIO R 1856/2013-2; WINNETOU, General Court T-501/13 of 18 Mar 2016, the Board reference "R 1297/2016-2" is unverified; Grand Board R 1719/2019-G of 27 May 2026 upholding the refusal of ANIMAL FARM and 1984 for content classes; GEORGE ORWELL refused 19 Dec 2025, R 2248/2019-G). Brazil's Lei 9.279/96 art. 124 XVII bars third parties from registering the title of a work that is still copyrighted, which protects Disney's derivative titles but not Kipling's.

Two conclusions from the first research pass were reversed by the register check and the reversal is what this project follows: (a) the first pass thought EU title-descriptiveness practice would make "Jungle Book" harder for Disney to stop in the EU; the register shows Disney's EUTM survived with video games in class 9 and online entertainment in class 41, so it is not harder; (b) the first pass recommended a subtitle "A Mowgli Story" / "Um Conto de Mogli"; Disney's live Brazilian MOWGLI registrations in classes 9 and 28 make the character name inside the product name a real opposition risk in Brazil, so the name is used only descriptively (D03).

### 3.4 Naming decision

| Item | Decision | Basis |
| --- | --- | --- |
| Title, logo, URL slug, package name, store name | "Seeonee" alone, in every market | D03; legal.json naming recommendation; verified.md pd vote 2 |
| Words never in the title, logo, URL slug, package name, store name, store tags, page description, meta tags, screenshots, trailer titles or marketing | "Jungle Book", "The Jungle Book", "O Livro da Selva", "Das Dschungelbuch", "Le Livre de la Jungle", "Disney", "Mowgli", "Mogli", "Mogli - O Menino Lobo" | Disney's live class 9 and 41 marks in the US, EU, UK and Brazil; Disney's Brazilian MOWGLI marks; the live "Mogli Games" EUTM in class 9 |
| Descriptive use allowed | "based on Rudyard Kipling's Mowgli stories" / "baseado nas histórias de Mowgli, de Rudyard Kipling" in running text, README and store description | Nominative use of public-domain character names; Warner/Netflix "Mowgli: Legend of the Jungle" (2018) precedent |
| In-game names | Kipling spellings in both languages: Mowgli, Bagheera, Baloo, Shere Khan, Kaa, Akela, Raksha, Hathi, Tabaqui, Bandar-log, Chil, Thuu, Messua, Buldeo, Grey Brother, Phao, Won-tolla | D03; 4.3 |
| Fallback brand words if "Seeonee" fails clearance | Council Rock, Cold Lairs, Red Flower, Waingunga (in that order) | legal.json |
| Repo and folder name | "mogli" stays internal only | D03 |
| Enforcement context | Disney litigates counterfeit merchandise and protects later versions and marks (Steamboat Willie statement, Dec 2023) but did not sue over "Winnie-the-Pooh: Blood and Honey" (2023) or "Mowgli: Legend of the Jungle" (2018), both of which used public-domain names while avoiding Disney's designs | legal.json, Wikipedia |

### 3.5 Pre-launch searches to run

| Office | Tool | Terms | Classes | Note |
| --- | --- | --- | --- | --- |
| USPTO | tmsearch.uspto.gov, then TSDR for status | SEEONEE, MOGLI, MOWGLI, "MOGLI O MENINO LOBO" | 9, 28, 41 | Check the Xiamen MOWGLI Reg. 7937473 goods text |
| EUIPO | eSearch plus, TMview | Same, plus DSCHUNGELBUCH | 9, 28, 41 | Watch "Mogli Games" EUTM 019018349 |
| UK IPO | trademarks.ipo.gov.uk | Same | 9, 28, 41 | |
| Germany (DPMA) | DPMAregister or TMview office DE | MOGLI, SEEONEE | 9, 41 | "Mogli" is Disney's German dub spelling; a German mark 302012033093 exists |
| Brazil (INPI) | busca.inpi.gov.br (interactive session) or TMview office BR | SEEONEE, MOGLI, MOWGLI, "LIVRO DA SELVA", "MENINO LOBO" | 9, 28, 41 | Disney's MOWGLI 840109601 (class 9) is live |
| Domain and stores | Registrar, itch.io, Netlify site name | seeonee | | Keep the slug free of the excluded words |

### 3.6 Attribution and disclaimer text (D03)

EN: "Based on the public-domain Mowgli stories of Rudyard Kipling (1894-95). Not affiliated with, endorsed by or sponsored by The Walt Disney Company or the 1994 Virgin Interactive game."

PT-BR: "Baseado nas histórias de Mowgli, de Rudyard Kipling (1894-95, domínio público). Sem afiliação, endosso ou patrocínio da The Walt Disney Company ou do jogo de 1994 da Virgin Interactive."

Placement: boot screen (2 s, GDD §11.4) and title screen, credits scene, README, store page, `licenses.txt` header. Precedent: "Mowgli: Legend of the Jungle" credited "Based on All the Mowgli Stories by Rudyard Kipling" and dropped "Jungle Book" from its working title; "Winnie-the-Pooh: Blood and Honey" relied on avoiding Disney-unique elements rather than on a disclaimer (06 research, section 4(d)).

## 4 Kipling source facts used by the design

All quotations were taken verbatim from Project Gutenberg #236 (The Jungle Book), #1937 (The Second Jungle Book) and #78240 (Many Inventions); Gutenberg line numbers are given as anchors (01-narrative-spine.md). Dashes in quotations in 4.1-4.5 are shown with commas; the 4.6 table keeps Gutenberg's double hyphens verbatim, which in-game cards render as an en dash, U+2013 (GDD §2.3, §14.2); words are unchanged.

### 4.1 Chronology (verified against the text)

Kipling re-ordered the stories "so that the first [volume] contained all the Mowgli stories, in 'chronological' order" for the 1897 Outward Bound edition (Kipling Society). "Mowgli's Brothers" was written in November 1892; "In the Rukh" (1893) was the first written but the last in Mowgli's life.

| # | Story | Book | Textual anchor | Seeonee use (D05) |
| --- | --- | --- | --- | --- |
| 1 | Mowgli's Brothers | JB | Expelled about age 10-11: "A bull paid ten years ago!" (#236 l.704) | Zone 1, L1 Council Rock |
| 2 | Kaa's Hunting | JB | "All that is told here happened some time before Mowgli was turned out of the Seeonee Wolf Pack" (#236 l.867) | Zone 1, L2 Cold Lairs; Boss 1 |
| 3 | How Fear Came | SJB | Shere Khan alive; Mowgli still a Pack hunter; first published Pall Mall Budget 7 and 14 June 1894 | Zone 2, L3 Water Truce |
| 4 | Tiger! Tiger! | JB | "Now we must go back to the first tale. When Mowgli left the wolf's cave after the fight with the Pack at the Council Rock..." (#236 l.1849) | Zone 2, L4 Man-Pack; Boss 2; Act 1 false ending |
| 5 | Letting in the Jungle | SJB | "after Mowgli had pinned Shere Khan's hide to the Council Rock" (#1937 l.1343) | Zone 3, L5 |
| 6 | The King's Ankus | SJB | Kaa "accepted him ... for the Master of the Jungle" (#1937 l.3335) | Zone 3, L6; Boss 3 |
| 7 | Red Dog | SJB | "It was after the letting in of the Jungle that the pleasantest part of Mowgli's life began" (#1937 l.4946); Akela dies | Zone 4, L7 and L8; Boss 4 |
| 8 | The Spring Running | SJB | "The second year after the great fight with Red Dog and the death of Akela, Mowgli must have been nearly seventeen years old" (#1937 l.5915); ends "And this is the last of the Mowgli stories." (l.6711) | Ending |
| 9 | In the Rukh | Many Inventions | Adult Mowgli, forest guard, marriage, child | 100% epilogue tableau only |

Confidence: HIGH overall; the relative order of Kaa's Hunting and How Fear Came rests on internal evidence (MEDIUM-HIGH). Consequence for design: Shere Khan dies in story 4, so he cannot be the final boss of a chronological game; stories 5-8 all post-date his death (Baloo in the finale: "thou knowest whither Shere Khan went", #1937 l.6673). Kipling's own first book ends on the Council Rock scene ("But that is a story for grown-ups", #236 l.2487), which is why Zone 2 ends as an Act 1 "false ending".

### 4.2 Character facts from the text

| Character | Kipling fact (anchor) | Design use |
| --- | --- | --- |
| Mowgli | "Mowgli the Frog I will call thee"; "the lumps on his knees and elbows, where he was used to track on all fours" (How Fear Came); nearly seventeen in The Spring Running; carries a knife; brings the Red Flower to Council Rock; possibly Messua's lost son Nathoo | Older wiry teen; knife is a tool only (ropes and vines), never a weapon against living creatures |
| Baloo | "the sleepy brown bear"; strict teacher of the Law and the Master Words | Sloth bear with the cream V; tutor and guide, not a slacker |
| Bagheera | Born "in the cages of the king's palace at Oodeypore"; "the mark of the collar" under his jaw; bought Mowgli's place with a bull | Black leopard with the bare collar mark; warm protector |
| Shere Khan | "Lungri" the Lame One, lame from birth; killed under the buffalo in the dry ravine; "Under the feet of Rama lies the Lame One" (Mowgli's Song) | Limping tiger; cattle-thief bully; scripted stampede in Boss 2, dust and silence |
| Tabaqui | The Dish-licker, jackal hanger-on and spy; killed off-screen in the text (#236 l.303) | Kept alive as a fleeing nuisance and herald |
| Kaa | "old Kaa", "a wary old python"; "I have seen a hundred and a hundred Rains"; sheds his skin "for perhaps the two-hundredth time"; "I have seen all the dead seasons"; the "Dance of the Hunger of Kaa" mesmerizes the Bandar-log, Mowgli is immune; "rather despised the poison snakes". The phrase "over 100 years old and still in his prime" is Wikipedia's gloss, not Kipling's text | Ally; coils as moving platforms (invented); his dance resolves Boss 1 |
| Akela | The Lone Wolf, leader of the Free People; "It is better to die in a Full Pack than leaderless and alone"; Death Song "All debts are paid now. Go to thine own people." | Exit character L1; the one gently handled death after Boss 4 |
| Raksha, Father Wolf, Grey Brother, Phao, Won-tolla | "The man's cub is mine, Lungri, mine to me! He shall not be killed."; Grey Brother at the dhâk tree; Phao the later leader; Won-tolla the wounded Outlier | Council Rock cast; Grey Brother as the pack-stone checkpoint sprite, the L4 exit and the L5 guide; Phao as the L8 exit |
| Bandar-log | "They have no law. They are outcasts."; leaderless; species unspecified by Kipling (langurs are the usual reading) | Nut-throwing swarm; Boss 1 mob; never an ape king |
| Hathi | Silent, ancient, "Master of the Jungle"; proclaims the Water Truce; with his three sons "lets in the jungle"; "There will be no killing?" "Nor I." | Exit character L3 and L5; sons as moving platforms |
| Chil (Rann) | The kite who follows the Bandar-log's trail: "Mark my trail!" | Diegetic compass by tier (D37), introduced in the story at L2's first Bird-gate |
| Thuu | The blind White Cobra "as old as the Jungle"; poison "dried up"; Mowgli pins and frees him: "Run to and fro and make sport, Thuu!" | Boss 3, pinned and spared |
| The dholes | "Red Dog, the Killer" from the Dekkan, two hundred strong; the Bee Rocks and the Little People; wild garlic | Zone 4 hazard and Boss 4 waves |
| Messua and Buldeo | Messua adopts Mowgli as Nathoo; Buldeo the boastful hunter with a gun; the village plans harm to Messua (do-not-use) | Village fearful, not villainous; Buldeo a non-combat pursuit hazard |

### 4.3 Name variants

| Name | Variant | Where | Project choice |
| --- | --- | --- | --- |
| Chil | Rann | Rann in The Jungle Book (#236 "Now Rann the Kite brings home the night", l.58); Chil in The Second Jungle Book (Chil's Song) | Chil in-game; card text quoting the first book keeps "Rann" verbatim if used |
| Mor | Mao | Mao in the first book, Mor in the second | Mor |
| Ikki | Sahi | Sahi in the first book, Ikki in the second | Ikki |
| Grey Brother | Gray Brother | Gutenberg's US text spells "Gray Brother" | Grey Brother (D03) |
| Mowgli | Mogli (German dub and Brazilian Disney spelling), Mowgli (Lobato 1933) | Both are generic for the Kipling character in Brazil | Mowgli in EN and PT-BR |
| Baloo, Bagheera | Balu, Baguera (Brazilian Disney dub) | Disney localization | Kipling spellings only |
| Thuu | "the White Hood", "the White Cobra" | Kaa's telling | Thuu |

### 4.4 Tone statement (from the narrative research, adopted as D04)

"Mowgli is a story about belonging and law, told from the jungle's side. Our game keeps Kipling's shape, the Council Rock, the Law, the Water Truce, the Red Flower, the Cold Lairs, the dholes, the farewell, and Kipling's words on its storybook cards, but it is drawn for families: nobody bleeds on screen, no animal or person is killed by the player, and every boss ends the way Kipling's best moments do, with fear defeated rather than an enemy destroyed. Humans are neither villains nor rulers: the village is frightened, not stupid; Messua is its heart; Buldeo is a braggart, not a stereotype; there are no sahibs, no bounties on people, no 'English' to the rescue. Shere Khan is a cattle-thief bully, the Bandar-log are chaos without malice, Thuu is a lonely old guardian, and the Red Dog are a storm to be weathered. Loss is allowed once, and gently, Akela's last hunting, because the story's true ending is not a kill but a choice: Man goes to Man, and the Jungle stays his 'at call'."

Critical context behind it (cited in 01-narrative-spine.md section 4): Orwell's 1942 Horizon essay ("a jingo imperialist"), Said's Culture and Imperialism (1993), Nyman (2001) and Hotchkiss (2001) on the colonial reading, the Kipling Society's own "Kipling and empire" statement and derogatory-language policy, and three family adaptations: Nippon Animation's 1989-90 serial (kept the deaths, made the village plot about greed), DQ Entertainment's 2010 CGI series (no deaths, no village), and Warner/Netflix's 2018 film (PG-13 once blood and trophies were shown). The July 2018 Manchester "If" mural story is unverified and is not cited.

### 4.5 Do-not-use list (summary of the fourteen points)

1. The torture-and-burning plan against Messua (#1937 l.1555-1558): refer only to "locked up".
2. Mowgli bleeding from thrown stones (#236 l.2400; "My mouth is bleeding"): clods, no blood.
3. The skinning and trophy details (#236 l.2457): the hide as a symbol only.
4. Tabaqui's death (#236 l.303): he stays alive and flees.
5. The ankus death trail ("killed six times in a night", #1937 l.4056): off-screen card.
6. Kaa devouring the Bandar-log (#236 l.1746, l.1657): never depicted.
7. Chil's Song's carrion lines: no card use.
8. The dhole battle body count (#1937 l.5844-5848) and Won-tolla's murdered family: allude only ("his lair is empty").
9. Shere Khan as a man-eater (#1937 l.394): he steals cattle and bullies.
10. Villager caricature, caste remarks (#236 l.1994) and "the English" as saviors (#1937 l.1571): the village is fearful and mixed.
11. In the Rukh's colonial frame ("Sahib", the butler, dialect comedy): only the wolf-and-baby image.
12. Kipling's political verse and paratexts ("The White Man's Burden", "Recessional", "If"): nowhere in the game or marketing.
13. The knife against living creatures (tail-cutting, skinning): ropes and vines only.
14. Age-content rule: one on-screen death (Akela), no wounds; Shere Khan's end as dust and silence.

### 4.6 Approved card list

This table is the only source of allowed storybook card text (GDD §2.3, DECISIONS D23): a card key that is not listed here is a bug. Every EN text cell is verbatim Kipling, checked against Project Gutenberg #236 (The Jungle Book), #1937 (The Second Jungle Book) or #78240 (Many Inventions), fetched and grepped against this table on 2026-09-25. Card keys follow the PLAN §5.5 scheme, `card.<level-or-context>.<slot>` (for example `card.l1.intro`). Character counts are of the text as written in this table (a double hyphen `--` counts as 2 characters, the L7 card's triple hyphen as 3); in-game each dash renders as one en dash (GDD §2.3, §14.2), so these counts are upper bounds for the 120-character guide. The L7 card's triple hyphen is Gutenberg's own text, verified against the source, and is not a transcription error. Anchors here come from a fresh fetch of the three Gutenberg texts on 2026-09-25 and can differ from the anchors in 4.1 and 4.5 by up to a few lines (for example the last line of The Spring Running is l.6711 in 4.1, l.6707 here); grep the quoted text, not the line number, if it needs re-finding. D23's override procedure applies here first: a new line is added to this table with its Gutenberg anchor before any other document quotes it.

| Card key | EN text (verbatim) | Anchor | V/P | Chars | Where used | Flags |
| --- | --- | --- | --- | --- | --- | --- |
| card.l1.map | The man's cub is mine, Lungri--mine to me! He shall not be killed. | #236 l.246 | P | 66 | L1 map page | - |
| card.l1.intro | Oh, hear the call!--Good hunting all / That keep the Jungle Law! | #236 l.64 | V | 64 | L1 intro | - |
| card.l1.exit | Look well--look well, O Wolves! | #236 l.379 | P | 31 | L1 exit | - |
| card.l2.intro | Here we go in a flung festoon, / Half-way up to the jealous moon! | #236 l.1802 | V | 65 | L2 intro | - |
| card.l2.gate | We be of one blood, ye and I | #236 l.949 | P | 28 | L2 first Bird-gate flash | Master Words formula, repeats l.1530 for the Snake People |
| card.b1.victory | A brave heart and a courteous tongue. They shall carry thee far through the jungle, manling. | #236 l.1688 | P | 92 | L2 exit, after B1 | dialogue tag trimmed |
| card.l3.intro | The stream is shrunk--the pool is dry, / And we be comrades, thou and I; | #1937 l.69 | V | 72 | L3 intro | - |
| card.l3.twist | By the Law of the Jungle it is death to kill at the drinking-places when once the Water Truce has been declared. | #1937 l.165 | P | 112 | L3 twist | - |
| card.l3.exit1 | Ye know, children, that of all things ye most fear Man; | #1937 l.413 | P | 55 | L3 exit, card 1 of 2 | dialogue tag removed |
| card.l3.exit2 | Till yonder cloud--Good Hunting!--loose / The rain that breaks our Water Truce. | #1937 l.81 | V | 79 | L3 exit, card 2 of 2 | - |
| card.l4.intro | What of the hunting, hunter bold? / Brother, the watch was long and cold. | #236 l.1841 | V | 73 | L4 intro | - |
| card.b2.victory | Look well, O Wolves. Have I kept my word? | #236 l.2464 | P | 41 | L4 exit, after B2 | - |
| card.l4.act1 | I am two Mowglis, but the hide of Shere Khan is under my feet. | #236 l.2544 | P | 62 | L4, Act 1 false ending | - |
| card.b2.optional | Brother, I go to my lair--to die. | #236 l.1848 | V | 33 | B2 resolution | off by default, M2 family playtest decides |
| card.l5.intro | Veil them, cover them, wall them round-- / Blossom, and creeper, and weed-- | #1937 l.1332 | V | 75 | L5 intro | - |
| card.l5.exit | Let in the Jungle, Hathi! | #1937 l.2187 | P | 25 | L5 exit | refrain, repeats 3x in the source |
| card.l5.cinematic | Thy war shall be our war. We will let in the jungle! | #1937 l.2209 | P | 52 | L5 letting-in cinematic | - |
| card.l6.intro | These are the Four that are never content, that have never been filled since the Dews began-- | #1937 l.3325 | V | 93 | L6 intro | - |
| card.b3.victory | I will never again bring into the Jungle strange things--not though they be as beautiful as flowers. | #1937 l.4024 | P | 100 | L6 exit, after B3 | - |
| card.l7.intro | For our white and our excellent nights---for the nights of swift running. | #1937 l.4936 | V | 73 | L7 intro | triple hyphen verified in source |
| card.l8.intro | For the strength of the Pack is the Wolf, and the strength of the Wolf is the Pack. | #1937 l.706 | V | 83 | L8 intro | - |
| card.l8.exit | It is met, and we go to the fight. Bay! O Bay! | #1937 l.4945 | V | 46 | L8 exit; also the B4 build-up card (GDD §10.10 Beat 4, into §8.5) | - |
| card.b4.victory1 | All debts are paid now. Go to thine own people. | #1937 l.5822 | P | 47 | B4 victory, Akela | - |
| card.b4.victory2 | Howl, dogs! A Wolf has died to-night! | #1937 l.5859 | P | 37 | B4 victory, Phao | - |
| card.ending.open | The year turns. The Jungle goes forward. The Time of New Talk is near. | #1937 l.5952 | P | 70 | Ending, opening card | dialogue tag removed |
| card.ending.baloo | When the honey is eaten we leave the empty hive. | #1937 l.6663 | P | 48 | Ending, three farewells | - |
| card.ending.kaa | Having cast the skin, we may not creep into it afresh. It is the Law. | #1937 l.6665 | P | 69 | Ending, three farewells | dialogue tag removed |
| card.ending.bagheera | Good hunting on a new trail, Master of the Jungle! Remember, Bagheera loved thee. | #1937 l.6692 | P | 81 | Ending, three farewells | - |
| card.ending.mangoesman | Man goes to Man! Cry the challenge through the Jungle! | #1937 l.5905 | V | 54 | Ending, Man goes to Man | - |
| card.ending.outsong | Wood and Water, Wind and Tree, / Jungle-Favour go with thee! | #1937 l.6737 | V | 60 | Ending, the Outsong | refrain, repeats 4x in the source |
| card.ending.last | And this is the last of the Mowgli stories. | #1937 l.6707 | P | 43 | Ending, last card | - |
| card.epilogue.verse | Now, was I born of womankind and laid in a mother's breast? / For I have dreamed of a shaggy hide whereon I went to rest. | #78240 l.5781 | V | 121 | 100% epilogue (In the Rukh tableau) | 121 chars, over the about-120 guide; ships as is |
| card.bonus.rikkitikki | The motto of all the mongoose family is 'Run and find out' | #236 l.3341 | P | 58 | Rikki-tikki's Garden (cut-first) | punctuation trimmed (source ends "...find out,") |
| card.bonus.toomai | I will remember what I was, I am sick of rope and chain-- | #236 l.3947 | V | 57 | Toomai's Night Ride (cut-first) | - |
| card.honeyhollow.law1 | Now this is the Law of the Jungle--as old and as true as the sky; | #1937 l.700 | V | 65 | Honey Hollow, Law scroll | - |
| card.honeyhollow.law2 | Keep peace with the Lords of the Jungle--the Tiger, the Panther, the Bear; | #1937 l.720 | V | 74 | Honey Hollow, Law scroll | - |
| card.honeyhollow.law3 | Wash daily from nose-tip to tail-tip; drink deeply, but never too deep; | #1937 l.710 | V | 71 | Honey Hollow, Law scroll | - |
| card.honeyhollow.law4 | The jackal may follow the Tiger, but, Cub, when thy whiskers are grown, | #1937 l.715 | V | 71 | Honey Hollow, Law scroll | couplet with law5, shown consecutively |
| card.honeyhollow.law5 | Remember the Wolf is a hunter--go forth and get food of thine own. | #1937 l.717 | V | 66 | Honey Hollow, Law scroll | couplet with law4 |
| card.honeyhollow.law6 | And trouble not Hathi the Silent, and mock not the Boar in his lair. | #1937 l.722 | V | 68 | Honey Hollow, Law scroll | - |
| card.honeyhollow.law7 | Lie down till the leaders have spoken--it may be fair words shall prevail. | #1937 l.727 | V | 74 | Honey Hollow, Law scroll | - |
| card.honeyhollow.law8 | Now these are the Laws of the Jungle, and many and mighty are they; | #1937 l.790 | V | 67 | Honey Hollow, Law scroll | - |

"It is Death! It is Death! It is Death!" and "It is better to die in a Full Pack than leaderless and alone." are excluded and never appear as a card (GDD §2.3).

## 5 Platformer feel references

Reference values come from Celeste's published Player.cs constants (8 px tiles, 320x180), Maddy Thorson's forgiveness thread, Kyle Pittman's GDC 2016 jump math (v0 = 2h/t, g = 2h/t², which the GMTK Platformer Toolkit implements as newGravity = -2·jumpHeight / timeToJumpApex²), and the GMTK toolkit's parameter set (design.json `feel_parameters`). Seeonee's initial values are D09 and are the same numbers every document uses; they are tuned in the M1 gym level.

| Parameter | Reference value | Seeonee initial value (D09) | Why | Source |
| --- | --- | --- | --- | --- |
| Tile and body | Celeste 8 px tiles | 16 px tiles; body 12x22 standing, 12x14 crouched; hero frame 32x32 | Level metrics are written in tiles | Level Design Book metrics |
| Run speed | Celeste MaxRun 90 px/s (11 tiles/s) | 96 px/s (6 tiles/s); walk 48 px/s | Tight, readable at 320x180 | Player.cs |
| Ground acceleration and braking | Celeste RunAccel 1000 px/s², RunReduce 400 px/s²; typical 0.1-0.3 s to full speed | 900 px/s² accel, 1200 px/s² braking, 1800 px/s² turn braking | Near-instant acceleration reads as "tight" (the 1994 game was praised for exactly that) | Player.cs, GMTK toolkit, Cousin Gaming |
| Air control | Celeste AirMult 0.65 | 65% of ground values | Gem hunting needs mid-air corrections | Player.cs |
| Jump height and time to apex | Typical h = 3.5-4.5 tiles, t = 0.30-0.40 s | h = 56 px (3.5 tiles), t = 0.35 s, so launch speed 320 px/s and rising gravity 914 px/s² | Gravity derived from level constraints, not a physics constant | Pittman GDC 2016 |
| Falling gravity | Common 1.5-2.0x rising gravity; Celeste uses equal gravity plus an apex band | 1.6x (about 1460 px/s²) | Weight without lowering jump height | GMTK toolkit, Pittman |
| Apex hang | Celeste: 0.5x gravity while jump is held and vy is within 40 px/s of zero | 0.5x gravity while vy is within 32 px/s and jump held | A few frames at the peak to steer onto a gem | Player.cs |
| Jump cut on release | Celeste VarJumpTime 0.2 s hold; GMTK jump-cutoff multiplier; recommended vy x 0.5 on release | vy x 0.5 on release | One button, two verbs (hop and leap) | Player.cs, GMTK |
| Max fall speed | Celeste MaxFall 160 px/s (1.8x run), FastMaxFall 240 px/s; keep below one tile per fixed step | 320 px/s; fast fall 400 px/s holding Down (5.3 px and 6.7 px per 60 Hz step, under 16 px) | Reactable drops in vertical levels; no tunneling | Player.cs |
| Coyote time | Celeste JumpGraceTime 0.1 s (6 frames; some analyses say 5); uncited baseline 80-140 ms | 6 frames (100 ms) | Honors a late press after leaving a ledge | Player.cs, Thorson |
| Jump buffer | Celeste constant not in the published repo; community 4-5 frames; baseline 80-150 ms | 6 frames, symmetrical with coyote time | Honors an early press before landing | Thorson, gamineai |
| Jump horizontal boost | Celeste JumpHBoost 40 px/s (44% of run) | 32 px/s | Standing-start jumps clear designed gaps | Player.cs |
| Corner correction | Celeste UpwardCornerCorrection 4 px; recommended 25-50% of tile | 4 px | A one-pixel head bonk is the most common "cheated" moment | Player.cs, GMTK |
| Step-up and ledge grab | Celeste WallJumpCheckDist 3 px; recommended auto step-up within 2-4 px | Step-up 4 px; ledge grab capture 6 px horizontal, 8 px vertical | "Subtly favor player success" | Thorson |
| Climb and swing | none in the references | Climb 64 px/s; creeper swing period about 1.6 s | Vines are the reference game's signature verb | 1994 game (1.6) |
| Reach and gap rule | Design gaps at 0.75x and 1.0x of max reach, never 0.95x | Horizontal reach at full run about 5.5 tiles (measure in the gym and correct the doc) | Every level shares one ruler | Level Design Book |
| Simulation tick | Fixed 60 Hz with an accumulator; windows expressed in frames | 60 Hz fixed step; Arcade Physics fixedStep true, fps 60, TILE_BIAS 16 | Identical arcs on 60/120/144 Hz displays and throttled phones | Fix Your Timestep; stack research |

Boss and enemy timing anchors (design.json `boss_design`): median human visual reaction is about 273 ms (Human Benchmark), so standard attack wind-ups are at least 0.4-0.6 s (24-36 frames), heavy ones 0.8-1.2 s, with 0.3-0.4 s recovery windows in which the boss is hittable; the 2-5 and 8-10 frame anticipations quoted for platform fighters are for expert PvP and are too fast for a family game. Structure follows Mike Stout's eight beats and the rule of three (three hits per phase, three phases, one new attack per phase). The finale should feel like a conclusion, not the hardest room (Level Design Book pacing). The design adopts the upper end of these anchors: wind-ups of at least 0.5 s (heavy 0.8-1.2 s), recovery windows of 1.0 / 0.6 / 0.4 s (heavy 1.2 / 0.8 / 0.5 s) by tier, never 0.3 s, and 2 / 3 / 4 hits per phase (GDD §7.6, §8.1).

Level metric rules kept from the research: a straight run hands the player about 60% of the quota, one or two visible side branches complete it, the rest is the 100% layer; four-beat kishotenketsu per level; checkpoints before every boss door and roughly every 60-90 s of expected play; a checkpoint with more than 5 median deaths in Zones 1-2 is a bug; target 4-6 minutes for a first quota run, 2-3 minutes on replay, 7-10 minutes for 100%; 60-90 minutes for the whole quota run and 2-3 hours for 100% (D16).

## 6 Modernization references

| Feature | What the 1994 game had | What modern re-releases and revivals do | Seeonee (D06) |
| --- | --- | --- | --- |
| Lives and game over | 3 lives on Normal, 1-ups, continues with a 20 s countdown | Celeste, Super Meat Boy and Ori respawn instantly with no tally; Sonic Superstars is the first 2D Sonic without lives; Sonic Origins' Anniversary Mode removes lives; Crash Bandicoot 4 ships Modern (no lives) and Retro modes; Super Mario Bros. Wonder still uses lives | Modern mode: no lives, instant respawn. Retro mode: 3 lives, continues, a countdown counter; the same single-row HUD as Modern with x3 and 6:00 added, no 1994 HUD layout (D17) |
| Level timer | 6:00 on Normal, hourglass +30 s, timeout costs a life | Sonic Origins Anniversary Mode removes the time limit; timers survive as speedrun clocks and ranks | Modern: no timer. Retro: 6:00 clock |
| Saving | None; the 2021 collection added saving and save states | Wonder Boy: The Dragon's Trap (2017) replaced passwords with saves but still accepts the 1989 passwords as an easter egg | Autosave at visible checkpoints and level exits; versioned localStorage schema; export and import as a should item |
| Checkpoints | Elephant Restart Flags, several per level; items retained | Alex Kidd in Miracle World DX added save points, denser checkpoints and an unlimited-lives toggle; Shovel Knight keeps a soft penalty and lets players break checkpoints on purpose | Visible checkpoints before every boss door and about every 60-90 s |
| Difficulty | Practice/Normal/Hard changes quota, enemy hits and damage taken | Celeste's Assist Mode (speed 50-100%, invincibility, infinite dashes) named without judgment; Game Accessibility Guidelines basic tier asks for a wide difficulty choice and a game-speed option | Three tiers changing quota, damage and boss hits; Assist Mode with speed 50-100%, invincibility, infinite clods, skip level |
| Retro flavor | Cheat codes, level select, idle demo | Disney Classic Games: Aladdin and The Lion King added rewind, save states, a watch mode you can take over and CRT filters; retro/modern toggles in Wonder Boy and Alex Kidd DX; level-select codes kept as unlockables | Retro mode off by default and never required for content; PWA and service worker deferred to v1.1 |
| Collectible gating | Gem quota per level; all 15 for a bonus round | Super Mario 64 (70 of 120 stars), Rayman Legends (Teensy totals), Kirby and the Forgotten Land (Waddle Dee totals): "any N of M" gating; DKC Tropical Freeze's two tiers of optional pickups | Quota per level plus a 100% layer; bonus stages reward 100%, never gate the ending |
| Pits and water | Instant loss of a life | Modern platformers keep pits but respawn instantly at the last checkpoint | Pits and deep water respawn at the last checkpoint; no fall damage in Modern mode |
| Assist and access | None | Remappable controls, gamepad, screen-shake slider, flash reduction, color-safe HUD, separate music/SFX volumes, persisted settings (GAG basic; Xbox guideline 117) | All of these in v1 (D06) |

## 7 Asset and tool shortlist

License preference (D14): CC0, then CC-BY, then custom itch.io licenses (copy the page wording into CREDITS; never commit "no redistribution" raw packs to the public repo), then OFL fonts. Runtime files live in `public/game/`, never `public/assets/` (D10). Every row below was read from its page on 2026-09-25 unless marked otherwise (assets.json confidence notes).

### 7.1 Tilesets, props and UI

| Pack | License | Grid | Notes |
| --- | --- | --- | --- |
| OPP2017 Jungle and Temple Set (Open Pixel Project) | Multi-licensed incl. CC0; take it under CC0 | 32x32, imports on a 16 px grid 1:1 | Primary jungle pick: 500+ tiles (rocks, grass, water, trees, vines, slopes, a temple); DB32 palette; remap to Seeonee-40 |
| Jungle Tileset (CookieEfedu) | CC-BY 4.0 (credit + link) | 16x16 | Two tile variations plus background; tiles have a 2 px separation, set spacing 2 in Tiled |
| Pixel Jungle Tile Scene (knik1985) | CC-BY 3.0 | Not stated; measure | Tileset plus background |
| Platformer Free Asset #1 Jungle (Yansan) | Custom: anything except NFT; optional Instagram tag | 16x16; parallax layers 320x180 | 4-layer parallax at the project's exact base resolution |
| Jungle Asset Pack (Jesse Munguia) | Custom: personal and commercial OK, no redistribution | Not stated | Tileset, 5-layer parallax, animated character with ledge grab; .ase sources; do not commit raw |
| OPP Jungle Tiles (older OPP set) | CC-BY 3.0, every contributor must be credited | 32x32 | Superseded by OPP2017; use only for a specific tile |
| Pixel Adventure 1 (Pixel Frog) | CC0 | 16x16 terrain, 32x32 characters (verify after download) | Gray-box kit; CC0 fruit and items; 20 fps animations |
| SunnyLand (ansimuz) | CC0 art; bundled music by Pascal Belisle requires credit | 16x16 | Forest tiles, fox, 3 enemies, gems, VFX, parallax, Phaser project files |
| Brackeys' Platformer Bundle | CC0 | 16x16 | Day-one gray-box kit: tiles, knight and slime, coins, SFX, music, Pixel Operator font |
| Pixel Platformer (Kenney) | CC0 | 18x18 (does not mix with 16x16); partial CC0 16x16 redraw by dagrooms52 | HUD pieces (hearts, keys, numbers) only |
| Oak Woods (brullov) | Custom, no redistribution; $2+ | 24x24 (grid mismatch); parallax 320x180 | Temperate forest; fallback for a ruins or forest-edge zone |
| Jungle Platformer Tileset (muffinespixels) | Not stated on the page: treat as all rights reserved until confirmed in writing | 16x16; $1.99+ | Most cohesive cheap jungle kit; ask for the license before buying |
| Sidescroller Asset Pack 32x32 Overworld (GandalfHardcore) | Custom: games OK, no redistribution, no AI training, no NFT | 32x32 | Forest, not jungle |
| Gems / Coins Free (La Red Games) | CC0 | 16x16 animated | 5 gems and 3 coins; exact fit for the grid |
| 8x8 Coin/Gem Collection (EverCrazy) | CC0 | 8x8 | Tiny pickups and HUD icons |
| UI Pack Pixel Adventure (Kenney) | CC0 | | 500+ UI tiles; combine with Kenney HUD pieces |

### 7.2 Characters and enemies

| Pack | License | Frame | Notes |
| --- | --- | --- | --- |
| Platform character Free (La Red Games; the page slug is "coins-free") | CC0 | 32x32, 65 sprites | Best free hero base: run, walk, crouch, jump, die, hold, swim, climb; recolor into Mowgli per D08 |
| Animated Pixel Adventurer (rvros) | Custom: personal and commercial OK, no redistribution | 50x37, 39 animations | Ledge grab, wall slide, water; adult proportions; .aseprite sources; decide 32x32 vs 48x40 hero early (D08 fixes 32x32) |
| Pixel Jungle Monkey Platformer (Pixelsym) | Custom: commercial OK, edits OK, no redistribution | 32x32 | Monkey (idle, run, jump, hit, dead), 32x32 tileset, vines; Bandar-log base |
| Monkey in the Jungle (AquaMea) | Custom: personal and commercial OK | Not stated | Second monkey option |
| 2D Pixel Art Snake Sprites (Elthen) | $1+; Elthen license: commercial OK, no resale, no crypto, no AI training | | Idle, move, attack, damage, death; best cheap side-view snake |
| 2D Pixel Art Spider Sprites (Elthen) | Free; Elthen license | | Idle, move, emerge, jump, shoot web |
| Enemy: Bat (Admurin) | Custom: commercial OK, no resale as an asset, no AI training, no NFT | 64x64 | Idle, attack, hit, death; Mang the bat for night levels |
| Pixel Adventure 2 (Pixel Frog) | CC0; $5+ | 20 fps | 20 enemies incl. bat, bee, birds, chameleon (roster from the pack contents, verify) |
| SunnyLand Forest enemies (ansimuz) | CC0 | 16x16 grid | Three enemies (community names: opossum, eagle, frog; verify); the eagle is a ready bird |
| Black Cat Sprites (carysaurus) | Custom: free and commercial OK, no redistribution, credit mandatory | 32x32 base, 48x48 frames | Bagheera base after enlarging and redrawing at 48x24; paid $2 pack adds attack, pounce, hurt |
| Catset (seethingswarm) | $19.99+; custom: commercial OK, credit optional, no individual resale, no NFT | 40x40, 23 animations x 5 cats | Complete big-cat animation set; palette-swap one cat into the tiger and one into the panther |
| bear sprite (othur.) | Name your price; commercial use implied ("I'd appreciate a tip"), ask the author | 160x160 | Far too high-res; needs a redraw. Alternatives with unverified licenses: Azdner $5 (11 animations), Barbarella $1 (8 animations) |

### 7.3 The tiger gap and the other missing animals

No usable free side-view pixel tiger exists on itch.io or OpenGameArt as of 2026-09-25: the only pixel tiger listings are a portrait pack, a single static PNG with no license (Markiro) and an AI-assisted top-down sheet with no license text (maffalapolous); the OpenGameArt "Running cartoon tiger" page returned 502. Bears are either 160x160 (othur.) or cheap-paid with unverified licenses. The panther is best served by recoloring a cat sheet.

| Gap | Recommended fix (in order) | Cost | Credits flag |
| --- | --- | --- | --- |
| Shere Khan (tiger, limping) | 1) Palette-swap and redraw a Catset cat to orange with stripes, adding the limp as a custom cycle; 2) generate a 64x32 base in PixelLab or Retro Diffusion and hand-clean it in Aseprite; 3) commission one 64x32 sheet (idle, lame charge, pounce, stumble, retreat) | $19.99 / subscription or $20-65 / commission fee | AI-assisted rows flagged in CREDITS; itch.io AI disclosure if any AI base survives |
| Baloo (sloth bear with cream V) | 1) Redraw othur.'s bear at 48x40 with the cream V; 2) AI base plus hand cleanup; 3) commission | tip / subscription / fee | Same |
| Bagheera (black leopard, collar mark) | 1) carysaurus cat enlarged to 48x24 (credit mandatory); 2) Catset black cat | free / $19.99 | Credit line required for carysaurus |
| Kaa (30-foot python) | Elthen snake as a base for head and segments; coils drawn as tiles or a segmented sprite in Aseprite | $1+ | |
| Wolves (Akela, Raksha, Grey Brother, Phao) | No free pack was evaluated; draw from a dog or cat base (Catset run cycle recolored) or commission one shared wolf sheet with palette variants | Catset or commission | Verify in M2 |
| Dholes | Recolor of the wolf sheet with a shorter muzzle and red-tan palette | none extra | |

Species truth (D08) matters here: the reference is Central-Indian fauna drawn from the 1894-95 plates, so a recolored house cat is a placeholder, never the shipped look.

### 7.4 Audio

| Pack | License | Notes |
| --- | --- | --- |
| Impact Sounds (Kenney) | CC0 | 130 hits, thuds and footsteps: landing, hit and stomp |
| Interface Sounds (Kenney); UI Audio; RPG Audio | CC0 | 100 UI clicks; 50 more UI; 50 foley files |
| 512 Sound Effects 8-bit style (Juhani Junkala) | CC0 | 512 retro SFX, 20.6 MB zip; covers a platformer end to end |
| Platformer Chiptunes (Guy G. Gamerson); 5 Chiptunes Action (SubspaceAudio) | CC0 | 12 MP3s (5 stage, 2 boss, game over, alternates); 5 MP3s (levels 1-3, title, ending) |
| Jungle music (enprogames); Chill Jungle Ambient (Tausdei) | CC0 (dual-licensed, take CC0); CC-BY 3.0, credit "Tausdei" | One short OGG; ethnic percussion and pads for the title or a river level |
| Journey Collection Part 1 (OGA user09032001) | CC-BY 3.0/4.0; copy the exact credit line from the page (it rendered garbled) | 10 chiptune OGGs |
| 8-bit Music Pack Loopable (CodeManu) | CC-BY 3.0, credit "CodeManu" | 6 loops |
| 33 Free Chiptune Loops (hyperpixel); High Quality 8-bit Musics (HydroGene) | CC0 | 33 loops, mostly 150 BPM, OGG and FLAC; 18 looping tracks plus MIDI, 68 MB |
| Forest Ambience (TinyWorlds); Forest bird sounds (pauliuw) | CC0 | Looping ambience; bird recordings with background noise, gate them |
| Brackeys' Platformer Bundle music and SFX | CC0 | Placeholder audio from day one |

Placeholder SFX come from jsfxr or ChipTone; final music is authored in BeepBox or Furnace and shipped as `.ogg` plus `.m4a` pairs (D10, D15). Music is the bandwidth budget hog: 6-8 loops at 96-128 kbps.

### 7.5 Fonts

| Font | License | Notes |
| --- | --- | --- |
| m5x7 (Daniel Linssen) | CC0 | Primary candidate (D08); TTF; convert to a bitmap atlas with a Latin-1 glyph set for PT-BR |
| m3x6 (Daniel Linssen) | "Free to use, attribution appreciated"; license box not verified | Check the page before use |
| Silkscreen (Regular and Bold) | SIL OFL 1.1 (OFL.txt in google/fonts) | Second candidate (D08); a converted bitmap atlas is a Modified Version: rename the atlas, keep the OFL text and copyright line in licenses.txt |
| Press Start 2P (CodeMan38); Pixelify Sans | SIL OFL 1.1 (OFL.txt in google/fonts) | Title lettering and menu options |
| Kenney Fonts (11 fonts); Pixel Operator (Jayvee Enaguas) | CC0; CC0 since 2018.10.04-1 (also in Brackeys' bundle) | Fallbacks |

### 7.6 Tools

| Tool | Purpose | Cost and license | Notes |
| --- | --- | --- | --- |
| Aseprite | Sprites, tiles, animation tags; sprite sheet plus JSON that Phaser loads with `this.load.aseprite` and `this.anims.createFromAseprite` | $19.99 one-time; source public under a proprietary EULA (self-compiling is free) | Recommended (D10) |
| Pixelorama | Free Aseprite-like editor | Free, MIT; v1.2.2 in 2026 | Free alternative (D10) |
| LibreSprite; Piskel | Older GPL fork; browser sprite editor | Free | Fallbacks |
| Tiled 1.12.2 (27 May 2026) | Level editor with a first-party Phaser loader (`this.load.tilemapTiledJSON`) | Free, GPL-2.0 app | Embed tilesets, CSV or uncompressed base64 layers, single-image tilesets, tileset name must match `addTilesetImage` exactly (D10) |
| LDtk | Auto-tiling rules, typed entities | Free, MIT | No first-party Phaser loader; not chosen |
| free-tex-packer | Atlas packer with Phaser JSON hash export | Free, MIT; maintainer fixes critical bugs only; web app served only a JS shell, use the desktop builds | Items, UI and props atlases |
| TexturePacker | Commercial packer | "Essential" free tier is not for commercial projects and has no Phaser export; paid about $49.99 (third-party listing) | Not needed |
| tile-extruder (npm) | 1-2 px tile extrusion to kill seams | Free | Verify in M0 |
| jsfxr (sfxr.me); ChipTone (SFB Games) | Placeholder SFX | Free, unrestricted commercial use; ChipTone output is CC0 | |
| BeepBox; FamiStudio; Furnace | Chiptune music | BeepBox free, MIT, you own your songs; FamiStudio free, MIT | Furnace for a Mega Drive FM feel (stack research) |
| Lospec palettes | Endesga 32 and DB32 downloads as .gpl/.ase | Free | Seeonee-40 derives from Endesga 32 (D08) |
| rollup-plugin-license 3.7.1 | Generates `dist/licenses.txt` with the Phaser MIT notice | MIT | Verified by a local build on vite 8.3.1 + phaser 4.2.1 + Node 22.15.0 (06 research) |

### 7.7 AI-assisted generation (hand-edited bases only, D14)

| Service | Fit | Terms read | Pricing (confidence) |
| --- | --- | --- | --- |
| PixelLab | Pixel-native characters with directional views, skeleton animation, tilesets, Aseprite plugin; best fit for the gap animals because it produces animation frames | ToS 3.3: "You retain ownership of any content you create"; no training other models | Free trial 40 fast generations then 5 slow per day; about $12, $24, $50 per month (third-party listings, medium) |
| Retro Diffusion (Astropulse) | Tiles, props, parallax inside Aseprite; animation web-only | itch page: "you own the images generated by it"; vendor says trained on licensed assets | Aseprite extension $65 full / $20 Lite runs locally with no credits; web app on credits (medium) |
| Scenario | General-purpose; not pixel-native; overkill | Paid plans include a full commercial license; free-plan outputs are for personal and evaluation use only | Starter $15, Pro $45, Max $75 per month |

Legal framing: purely AI-generated output is not copyrightable in the US (Copyright Office "Copyright and AI, Part 2", 29 Jan 2025), so every shipped AI base is hand-edited, prompts and raw outputs are kept in the art-src repo, rows are flagged in CREDITS, and the itch.io mirror uses the Generative AI Disclosure tag (untagged pages can be delisted).

### 7.8 License hygiene notes

- Mandatory-credit items already identified: carysaurus black cat; the older OPP Jungle Tiles (every contributor); CC-BY music (Tausdei, CodeManu, Journey Collection, knik1985, CookieEfedu); SunnyLand's bundled music by Pascal Belisle.
- "No redistribution" packs (Jesse M, rvros, Pixelsym, Elthen, Admurin, carysaurus, GandalfHardcore, Oak Woods): commit only the remixed atlases that ship with the game, keep raw packs in the private art-src repo.
- "Free" on itch.io is a price, not a license; a page with no license box (muffinespixels) is all rights reserved until the author replies in writing; re-check pack README files after download.
- Avoid CC-BY-SA and GPL art (take OPP2017 under CC0), and avoid NC and ND licenses entirely.
- OFL fonts: keep each copyright line and the full OFL text in licenses.txt; a converted bitmap atlas is a Modified Version and must not carry the Reserved Font Name (06 research, 4(c)).
- assets.json's closing advice to use "original jungle boy hero and animal names, with Kipling names at most as an easter egg" was written before the legal research; the legal research and D03 supersede it: Kipling names are free and are used.

## 8 Versions verified on 2026-09-25

Read from the npm registry and the GitHub Releases API by three independent verification passes (verified.md, stack votes 0-2).

| Component | Version | Date and notes | Decision |
| --- | --- | --- | --- |
| Phaser | 4.2.1 "Giedi" | npm `latest`; GitHub release 9 Jul 2026. Timeline: 4.0.0 "Caladan" 10 Apr 2026, 4.1.0 "Salusa" 30 Apr 2026, 4.2.0 "Giedi" 19 Jun 2026. dist-tags latest=4.2.1, beta=4.0.0-rc.7 (25 Mar 2026). phaser.min.js gzips to 346-352 kB depending on the measurement (brotli 276 kB); the arcade-only UMD build 320 kB gzip | Pin exactly (D10) |
| Phaser fallback | 3.90.0 "Tsugumi" | 23 May 2025; the last 3.x release, none since | Fallback only if #7317, #7382 or #7296 block |
| TypeScript | 7.0.2 | First stable 7.0 (Go-native compiler, GA 8 Jul 2026); no `baseUrl`, no `moduleResolution: node10` | 7.0.x (D10) |
| Vite | 8.3.1 | Rolldown bundler and Oxc minifier (the new default, replacing esbuild; `'terser'` remains available as an option); engines ^20.19 or >=22.12; `build.rollupOptions` kept as a deprecated alias of `build.rolldownOptions`; object-form `manualChunks` removed | 8.3.x; do not reuse the template's prod config (D10) |
| Vitest | 5.0.2 | engines ^22.12, ^24 or >=26 (Node 23 and 25 excluded); peer vite ^6.4, ^7 or ^8 | 5.0.x for pure logic |
| @playwright/test | 1.63.0 | 4 Sep 2026 | WebGL smoke test in GitHub Actions |
| Tiled | 1.12.2 | 27 May 2026 | JSON export, embedded tilesets |
| Node | 24 | Netlify's Ubuntu 24.04 image defaults to Node 24; Diego's machine runs 22.15.0, which satisfies Vite 8 and Vitest 5 | `.nvmrc` = 24 (D10) |
| rollup-plugin-license | 3.7.1 | Produced `dist/THIRD-PARTY-NOTICES.txt` with the full Phaser MIT text in a local build on vite 8.3.1 + phaser 4.2.1 + Node 22.15.0; peer dependency still names rollup (open issue #2110, 18 Jun 2026) | Use; regenerate on every release |
| phaserjs/template-vite-ts | pins phaser 4.0.0, vite ^6.3.1, typescript ~5.7.2 | Its `vite/config.prod.mjs` uses terser and object-form `rollupOptions.output.manualChunks`; Vite 8 rejects the object form (terser itself still works if installed); its non-nolog scripts ping phaser.io | Bootstrap from it, then bump and replace the Vite configs |
| Browser floor | Vite 8.3.1 default | `build.target` = chrome111, edge111, firefox114, safari16.4, ios16.4 (Vite docs, verified); Samsung Internet 22 and Android WebView 111 derived; excluded share about 4.5% Brazil, 3% worldwide (StatCounter Aug 2026, medium) | Ship without a lower `build.target` (D10) |
| Phaser 4.2.1 renderer | 4.2.1 | Requests a WebGL 1 context (`webgl`, `experimental-webgl`) and needs ANGLE_instanced_arrays and OES_vertex_array_object; never WebGL 2 (grep of the 4.2.1 dist, high) | No renderer config change needed; AUTO already resolves to WebGL 1 or the Canvas fallback |
| Safari audio | iOS 18.4 / macOS 15.4 | Ogg Vorbis and Opus play from iOS 18.4 / macOS 15.4 (WebKit blog 31 Mar 2025, OS-gated); older Safari takes `.m4a`; `decodeAudioData` on 18.4+ medium, verify on device | Keep the `.ogg` + `.m4a` pair (D15) |

Open Phaser 4 issues that shape D10 (all open on 2026-09-25): #7317 TilemapGPULayer draws seams between tiles (June 2026; mitigated by using the standard TilemapLayer); #7382 vertically flipped tiles render at the wrong position in the standard tile transformer (opened 23 Sep 2026; mitigated by avoiding vertical flips in Tiled or a one-line patch); #7296 memory leak in TilemapLayerWebGLRenderer when a Game instance is destroyed and recreated (May 2026; irrelevant to a single-instance shipped game, relevant to HMR patterns); #7252 Arcade tile separation can leave bodies at sub-pixel positions (Feb 2026, also in 3.90; masked by roundPixels, round body positions in a post-update step if it bites). Fixed in 4.2.1: #7213 ScaleManager not resizing to its parent, plus ESM namespace exports.

Rejected alternatives, for the record:

| Candidate | Version | Why not |
| --- | --- | --- |
| KAPLAY | 3001.0.19 (15 Jun 2025); next 4000.0.0-alpha.27.1 (12 May 2026) | Tiled support is a third-party plugin (remarkablemark); the project is mid-transition to an alpha it now recommends for new projects; the "API could change" wording is on kaplayjs.com/next (found by two of three passes) |
| Excalibur | 0.32.0 (23 Dec 2025); next 0.33.0-alpha | Pre-1.0 with breaking changes in minors; official Tiled plugin version-locked (peer ~0.32.0); Node >=22 and npm >=11 |
| PixiJS | 8.21.0 (17 Sep 2026); @pixi/tilemap 5.0.2 | A renderer, not an engine: scenes, input, audio, Tiled parsing, physics and camera would have to be written first |
| Godot 4 web | 4.7.2-stable (18 Aug 2026) | godot.wasm is 37.7-39.5 MB raw (about 10 MB compressed) per first load against Netlify's 300 credits (20 credits per GB); threaded export needs COOP/COEP; no TypeScript or Vitest workflow |

Corrections the verification passes made to the first stack draft, all folded into D10 and D11:

1. "Phaser's own guidance is that new projects should not start on 3.x": two passes could not find such a statement in the README, docs or download page; the third found it verbatim ("If you're starting a new project, there's no reason to start on Phaser 3") at phaser.io/news/2026/05/phaser-3-vs-phaser-4. Treat v4 as the de-facto default, and cite that article if the sentence is quoted.
2. "The API is v3-compatible": overstated. Phaser's README says v4 "keeps most of the public API you know, but there are important breaking changes" (render nodes replace pipelines, FX and masks become Filters, tint, camera matrices, shader API, lighting; Point, Mesh, Plane, BitmapMask removed; Canvas renderer deprecated). Standard sprite, text, tilemap and Arcade code runs unchanged; the 3.90.0 fallback is "a few hours of work" for such a game, not literally the same code.
3. "Avoid TilemapGPULayer" only mitigates #7317; #7382 needs flipY tiles avoided in Tiled and #7296 concerns destroy-and-recreate patterns.
4. Netlify case sensitivity: one pass found the CDN normalizes URLs to lowercase (live probes of upper-case paths returned 200) while the build filesystem is case-sensitive; the other two kept "CDN case-sensitive". Either way: lowercase kebab-case file names, `git mv` for case fixes, a manifest-driven loader so a missing file fails the smoke test.
5. Git LFS: only Netlify Large Media is deprecated (1 Sep 2023); plain GitHub-hosted LFS works with `GIT_LFS_ENABLED` set in the UI. D14 still keeps LFS out of the game repo because every Netlify build re-downloads LFS objects against GitHub's 10 GiB monthly bandwidth.
6. Netlify Free plan (credit-based): 300 credits per month, hard limit, no rollover; 15 credits per successful production deploy; Deploy Previews, branch deploys, failed deploys and rollbacks 0; 20 credits per GB of bandwidth; 2 credits per 10,000 requests; build minutes not metered; all sites pause at zero. Forum reports (medium confidence) describe a two-stage pause in which production deploys stop when only the last 30 "operational credits" remain, and a Jul-Sep 2026 bug that left Free teams stuck in that state. Password protection is Pro and above; Netlify Forms are free and unlimited.
7. Scale.FIT with `zoom` behaves differently from `Phaser.Scale.NONE` plus `Phaser.Scale.MAX_ZOOM` (the recipe D08 uses); whether `zoom` is ignored in FIT is inferred, not documented: verify in M0.

## 9 Sources

Reference game, primary:
- Genesis US manual https://segaretro.org/images/9/95/The_Jungle_Book_MD_US_Manual.pdf ; Mega Drive EU/AU manual https://segaretro.org/images/6/6a/The_Jungle_Book_MD_AU_Manual.pdf ; Tec Toy Master System manual https://archive.org/details/Jungle_Book_The_199x_Br
- Mega Drive longplay https://archive.org/details/MegaDriveLongplay165TheJungleBook ; SNES manual OCR https://archive.org/details/disneys-the-jungle-book-usa-color ; Genesis TAS notes https://tasvideos.org/2461S ; TCRF via Wayback https://web.archive.org/web/2024/https://tcrf.net/The_Jungle_Book_(Genesis)

Reference game, secondary:
- https://segaretro.org/The_Jungle_Book ; https://segaretro.org/The_Jungle_Book/Hidden_content ; https://en.wikipedia.org/wiki/The_Jungle_Book_(video_game) ; https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/TheJungleBook1993
- GameFAQs: jatin's Genesis guide https://gamefaqs.gamespot.com/genesis/586267-disneys-the-jungle-book/faqs/24298 ; cheats https://gamefaqs.gamespot.com/genesis/586267-disneys-the-jungle-book/cheats ; reviews 161086 and 159578 under https://gamefaqs.gamespot.com/genesis/586267-disneys-the-jungle-book/reviews/ ; Glacoras SMS guide https://gamefaqs.gamespot.com/sms/570291-disneys-the-jungle-book/faqs/55384 ; NES guide https://gamefaqs.gamespot.com/nes/587374-disneys-the-jungle-book/faqs/17102
- RetroAchievements via Exophase https://www.exophase.com/game/jungle-book-the-retro/achievements/ ; https://www.vgmaps.com/Atlas/Genesis/index.htm ; https://www.speedrun.com/the_jungle_book_genesis ; https://gamegenie.com/cheats/gamegenie/genesis/jungle_book.html
- Reviews: https://www.sega-16.com/2007/04/disneys-the-jungle-book/ ; http://retrooasis.blogspot.com/2016/08/the-jungle-book-sega-genesis.html ; https://cousingaming.com/2018/05/20/jungle-book-sega-mega-genesis-1994/ ; https://www.retrogamesreview.co.uk/2026/04/the-jungle-book-sega-mega-drive-genesis-review.html ; https://nerdbacon.com/the-jungle-book-snes/ ; https://www.gameblast.com.br/2024/07/blast-from-the-past-the-jungle-book-mega-drive.html
- Other versions: https://www.chciken.com/gaming/2024/10/27/jungle-book-gameboy.html ; https://lilura1.blogspot.com/2023/04/The-Jungle-Book-IBM-PC-MS-DOS-East-Point-Software-1995.html ; https://www.mobygames.com/game/50953/disneys-the-jungle-book/ ; https://disney.fandom.com/wiki/The_Jungle_Book_(video_game) ; https://sega.fandom.com/wiki/Disney's_The_Jungle_Book

Copyright and trademark:
- Texts and terms: https://www.gutenberg.org/ebooks/236 ; https://www.gutenberg.org/ebooks/1937 ; https://www.gutenberg.org/ebooks/78240 ; https://guides.library.cornell.edu/copyright/publicdomain ; https://web.law.duke.edu/cspd/publicdomainday/2026/ ; https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006L0116 ; https://www.lexisnexis.co.uk/legal/glossary/term-directive
- Country rules: https://commons.wikimedia.org/wiki/Commons:Copyright_rules_by_territory/Spain (also /Brazil and /Mexico) ; https://legifrance.gouv.fr/affichJuriJudi.do?i=&idTexte=JURITEXT000017637866 ; https://www.planalto.gov.br/ccivil_03/leis/l9610.htm ; https://www.planalto.gov.br/ccivil_03/leis/l5988.htm ; https://www2.camara.leg.br/legin/fed/lei/1996/lei-9279-14-maio-1996-374644-publicacaooriginal-1-pl.html
- US doctrine: https://www.copyright.gov/circs/circ33.pdf ; https://scireg.org/us_copyright_registration/fls/fl108.html ; https://www.bitlaw.com/source/tmep/1202_08.html ; https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf
- USPTO TSDR (https://tsdr.uspto.gov/statusview/ followed by the number): sn86983615, sn86828910, rn5932231, rn5424000, sn86828919, sn86828879, sn78908006, rn5097722, rn4395137, sn98057841, rn4080085, sn88675588, sn79122040
- EUIPO register (https://euipo.europa.eu/copla/trademark/data/ followed by the number): 010837219, 010837102, 019018349, 019017621, 018142789 ; Board of Appeal R 118/2014-1 https://euipo.europa.eu/eSearchCLW/#key/trademark/APL_20150318_R0118_2014-1_010837219 ; TMview API https://www.tmdn.org/tmview/api/search/results ; Guidelines 2.7.2 https://guidelines.euipo.europa.eu/2214311/2226625/trade-mark-guidelines/2-7-2-titles-of-books
- Decisions and commentary: https://ipkitten.blogspot.com/2026/06/famous-but-not-distinctive-animal-farm.html ; https://ipkitten.blogspot.com/2025/12/euipo-grand-board-refuses-registration.html ; https://www.ipo.gov.uk/t-challenge-decision-results/o033325.pdf ; https://trademarks.ipo.gov.uk/ipo-tmcase/page/Results/1/UK00003932867 ; https://mickeyblog.com/2023/12/15/disney-releases-statement-on-steamboat-willie-entering-public-domain/
- Disney and precedent: https://en.wikipedia.org/wiki/The_Jungle_Book_(1967_film) ; https://en.wikipedia.org/wiki/King_Louie ; https://en.wikipedia.org/wiki/List_of_The_Jungle_Book_characters ; https://en.wikipedia.org/wiki/Mowgli:_Legend_of_the_Jungle ; https://en.wikipedia.org/wiki/Winnie-the-Pooh:_Blood_and_Honey ; https://en.wikipedia.org/wiki/Mowgli_Street_Food ; https://pt.wikipedia.org/wiki/Mogli_-_O_Menino_Lobo_(1967) ; https://de.wikipedia.org/wiki/Das_Dschungelbuch_(1967) ; https://itch.io/docs/creators/quality-guidelines

Kipling text and criticism:
- https://www.gutenberg.org/cache/epub/236/pg236.txt ; https://www.gutenberg.org/cache/epub/1937/pg1937.txt ; https://www.gutenberg.org/cache/epub/78240/pg78240.txt
- Kipling Society: https://www.kiplingsociety.co.uk/readers-guide/rg_jungle_intro.htm ; .../rg_inrukh1.htm ; .../rg_fearcame1.htm ; .../rg_springrunning1.htm ; https://www.kiplingsociety.co.uk/kipling-and-empire.htm ; https://www.kiplingsociety.co.uk/derogatory-language-policy.htm
- Criticism and adaptations: https://www.orwell.ru/library/reviews/kipling/english/e_rkip ; https://archive.org/details/CULTUREANDIMPERIALISM ; https://doi.org/10.1017/s1060150301002108 ; https://theconversation.com/jungle-book-look-closely-theres-more-to-rudyard-kipling-than-colonial-stereotypes-122078 ; https://en.wikipedia.org/wiki/The_Jungle_Book_(1989_TV_series) ; https://en.wikipedia.org/wiki/The_Jungle_Book_(2010_TV_series) ; https://www.commonsensemedia.org/movie-reviews/mowgli-legend-of-the-jungle

Feel, level, boss and modernization references:
- https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs ; https://threadreaderapp.com/thread/1238338574220546049.html ; https://maddythorson.medium.com/celeste-forgiveness-31e4a40399f1 ; https://gmtk.itch.io/platformer-toolkit/devlog/395523/behind-the-code
- https://gdcvault.com/play/1023559/Math-for-Game-Programmers-Building ; http://www.mathforgameprogrammers.com/gdc2016/GDC2016_Pittman_Kyle_BuildingABetterJump.pdf ; https://gamineai.com/blog/input-buffering-and-coyote-time-in-2d-a-godot-4-and-unity-friendly-timing-primer ; https://gafferongames.com/post/fix_your_timestep/
- https://book.leveldesignbook.com/process/blockout/metrics ; https://book.leveldesignbook.com/process/preproduction/pacing ; https://www.gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste ; https://www.yachtclubgames.com/blog/check-point-design/
- https://www.gamedeveloper.com/design/boss-battle-design-and-structure ; https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing ; https://humanbenchmark.com/tests/reactiontime/statistics ; https://gameaccessibilityguidelines.com/basic/ ; https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117
- https://en.wikipedia.org/wiki/Sonic_Origins ; https://gamerant.com/sonic-superstars-no-lives-game-overs/ ; https://en.wikipedia.org/wiki/Crash_Bandicoot_4:_It%27s_About_Time ; https://en.wikipedia.org/wiki/Wonder_Boy:_The_Dragon%27s_Trap ; https://www.thexboxhub.com/alex-kidd-in-miracle-world-dx-review/ ; https://store.steampowered.com/app/1126190/Disney_Classic_Games_Aladdin_and_The_Lion_King/ ; https://www.vice.com/en/article/celeste-difficulty-assist-mode/ ; https://appsupport.disney.com/hc/en-us/articles/360035563071-How-do-I-save-my-game

Assets and tools:
- Tiles: https://opengameart.org/content/opp2017-jungle-and-temple-set ; https://opengameart.org/content/jungle-tileset ; https://opengameart.org/content/pixel-jungle-tile-scene ; https://opengameart.org/content/opp-jungle-tiles ; https://yansan-io.itch.io/platformer-free-asset-1-jungle-pixelart ; https://jesse-m.itch.io/jungle-pack ; https://muffinespixels.itch.io/jungle-tileset ; https://brullov.itch.io/oak-woods ; https://gandalfhardcore.itch.io/free-pixel-art-sidescroller-asset-pack-32x32-overworld
- Kits and items: https://pixelfrog-assets.itch.io/pixel-adventure-1 ; https://pixelfrog-assets.itch.io/pixel-adventure-2 ; https://ansimuz.itch.io/sunny-land-pixel-game-art ; https://opengameart.org/content/sunnyland-forest ; https://brackeysgames.itch.io/brackeys-platformer-bundle ; https://kenney.nl/assets/pixel-platformer ; https://dagrooms52.itch.io/pixel-platformer-16 ; https://kenney.nl/assets/ui-pack-pixel-adventure ; https://laredgames.itch.io/gems-coins-free ; https://evercrazy.itch.io/coin-gem-collection-8x8
- Characters: https://laredgames.itch.io/coins-free (hero) ; https://rvros.itch.io/animated-pixel-hero ; https://pixelsym.itch.io/pixel-jungle-monkey-platformer-beginner-friendly ; https://aquamea.itch.io/monkey-in-the-jungle-free-assets-pack ; https://elthen.itch.io/2d-pixel-art-snake-sprites ; https://elthen.itch.io/2d-pixel-art-spider-sprites ; https://www.patreon.com/elthen/posts/licensing-27430241 ; https://admurin.itch.io/enemy-bat ; https://carysaurus.itch.io/black-cat-sprites ; https://seethingswarm.itch.io/catset ; https://othur.itch.io/bear-sprite ; https://azdner.itch.io/2d-pixel-art-bear-sprite ; https://barbarella-fineart.itch.io/animated-pixel-art-bear-pack-for-games
- Tiger gap: https://itch.io/game-assets/tag-tiger/tag-pixel-art ; https://markiro.itch.io/tiger ; https://maffalapolous.itch.io/siberian-tiger-sprite
- Audio: https://kenney.nl/assets/impact-sounds ; https://kenney.nl/assets/interface-sounds ; https://kenney.nl/assets/rpg-audio ; https://kenney.nl/assets/ui-audio ; https://opengameart.org/content/512-sound-effects-8-bit-style ; https://opengameart.org/content/platformer-chiptunes ; https://opengameart.org/content/5-chiptunes-action ; https://opengameart.org/content/jungle-music ; https://opengameart.org/content/chill-jungle-ambient ; https://opengameart.org/content/free-chiptune-music-package-for-game-projects-part-1 ; https://opengameart.org/content/8-bit-music-pack-loopable ; https://hyperpixel.itch.io/33-free-chiptune-loops ; https://hydrogene.itch.io/high-quality-8-bit-musics ; https://opengameart.org/content/forest-ambience ; https://opengameart.org/content/forest-bird-sounds
- Fonts: https://managore.itch.io/m5x7 ; https://managore.itch.io/m3x6 ; https://github.com/google/fonts/tree/main/ofl/silkscreen ; https://github.com/google/fonts/tree/main/ofl/pressstart2p ; https://github.com/google/fonts/tree/main/ofl/pixelifysans ; https://kenney.nl/assets/kenney-fonts ; https://notabug.org/HarvettFox96/ttf-pixeloperator
- Tools: https://dacap.itch.io/aseprite ; https://www.aseprite.org/faq/ ; https://pixelorama.org/ ; https://libresprite.github.io/ ; https://www.piskelapp.com/ ; https://www.mapeditor.org/ ; https://github.com/mapeditor/tiled/releases/tag/v1.12.2 ; https://ldtk.io/ ; https://github.com/odrick/free-tex-packer ; https://www.codeandweb.com/texturepacker/licenses-comparison ; https://sfxr.me/ ; https://sfbgames.itch.io/chiptone ; https://www.beepbox.co/ ; https://famistudio.org/ ; https://lospec.com/palette-list/endesga-32 ; https://lospec.com/palette-list/dawnbringer-32
- AI and licenses: https://www.pixellab.ai/termsofservice ; https://retrodiffusion.ai/ ; https://astropulse.itch.io/retrodiffusion ; https://www.scenario.com/pricing ; https://itch.io/t/4309690/generative-ai-disclosure-tagging ; https://creativecommons.org/licenses/by/4.0/legalcode.en ; https://wiki.creativecommons.org/wiki/CC0_FAQ ; https://openfontlicense.org/ofl-faq/ ; https://raw.githubusercontent.com/phaserjs/phaser/master/LICENSE.md

Stack and hosting:
- npm registry (https://registry.npmjs.org/ followed by the package): phaser, typescript, vite, vitest, @playwright/test, kaplay, excalibur, pixi.js, @pixi/tilemap, rollup-plugin-license
- Phaser: https://github.com/phaserjs/phaser/releases ; issues https://github.com/phaserjs/phaser/issues/7382 , /7317 , /7296 , /7252 ; https://raw.githubusercontent.com/phaserjs/phaser/master/changelog/v4/4.0/MIGRATION-GUIDE.md ; https://phaser.io/news/2026/05/phaser-3-vs-phaser-4 ; https://phaser.io/news/2026/04/migrating-from-phaser-3-to-phaser-4-what-you-need-to-know ; https://github.com/phaserjs/template-vite-ts
- Phaser 4.0.0 API docs via Context7: https://docs.phaser.io/api-documentation/4.0.0/class/core-config ; .../class/scale-scalemanager ; .../namespace/tilemaps-parsers-tiled ; .../class/physics-arcade-world ; .../event/sound-events
- Toolchain: https://vite.dev/guide/migration ; https://vite.dev/blog/announcing-vite8 ; https://vitest.dev/guide/migration.html ; https://github.com/vitest-dev/vitest/issues/740 ; https://github.com/godotengine/godot/releases/tag/4.7.2-stable ; https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Browser baseline (section 8): https://webkit.org/blog/16574/webkit-features-in-safari-18-4/ ; https://gs.statcounter.com/browser-version-market-share/all/brazil ; https://gs.statcounter.com/browser-version-market-share
- Netlify: https://www.netlify.com/pricing/ ; https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ ; .../billing-faq-for-credit-based-plans/ ; https://docs.netlify.com/build/configure-builds/environment-variables/ ; https://docs.netlify.com/deploy/deploy-types/deploy-previews/ ; https://docs.netlify.com/manage/forms/usage-and-billing/ ; https://docs.netlify.com/build/caching/caching-overview/ ; https://answers.netlify.com/t/large-media-feature-deprecated-but-not-removed/100804 ; https://answers.netlify.com/t/support-guide-netlify-app-builds-locally-but-fails-on-deploy-case-sensitivity/10754 ; https://answers.netlify.com/t/how-to-disable-uppercase-urls-are-redirected-to-lowercase-urls-feature/89469
- GitHub limits: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github ; https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-storage-and-bandwidth-usage
