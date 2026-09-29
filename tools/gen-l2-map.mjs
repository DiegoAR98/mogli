#!/usr/bin/env node
/**
 * Generates the M3.1 vertical slice of L2 Cold Lairs (public/game/maps/l2.tmj) as plain Tiled
 * JSON, covering every beat of GDD.md §10.4: the kidnap-carry cinematic (card fallback, GDD
 * §8.1's 12 h cap), a static creeper to a swinging creeper over the first gap, the first
 * Bird-gate (a Master Words gate) with Chil's line, chained swings on the path plus a 1.0x
 * detour, two branch langurs, a crumbling-terrace descent with two window cobras and a
 * Snake-gate, the tank terrace's last stones, the B1 boss door and arena, the post-victory
 * Bagheera/Baloo holds behind a boss gate, and Kaa's exit. 9 path + 4 branch + 2 secret stones,
 * 3 pack-stones plus the boss door's own checkpoint (the GDD's 4th, GDD §9.5).
 *
 * Same gray-box scope note as gen-l1-map.mjs and gen-gym-map.mjs: a smaller stand-in than the
 * GDD's authored 70x140/44-screen target, built to a script rather than hand-authored in Tiled
 * (see docs/DECISIONS.md D94a and its M3.1 continuation).
 *
 * Regenerate with: node tools/gen-l2-map.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TILE = 16;
const WIDTH = 150;
const HEIGHT = 40;
const FLOOR_ROW = 30;

const GID_EMPTY = 0;
const GID_GROUND = 1; // collides: true
const GID_CREEPER = 2; // climbable: true

const ground = new Array(WIDTH * HEIGHT).fill(GID_EMPTY);

function setTile(col, row, gid) {
  if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) throw new Error(`Tile out of bounds: ${col},${row}`);
  ground[row * WIDTH + col] = gid;
}

function fillFloor(colStart, colEndInclusive, row) {
  for (let c = colStart; c <= colEndInclusive; c++) setTile(c, row, GID_GROUND);
}

let nextObjectId = 1;
const objects = [];
function addObject(obj) {
  objects.push({ id: nextObjectId++, width: 0, height: 0, ...obj });
  return objects[objects.length - 1];
}

let stoneOrder = 1;
function addStone(col, row, kind, skin = 'moon') {
  addObject({
    type: 'stone',
    x: col * TILE,
    y: row * TILE,
    properties: [
      { name: 'order', type: 'int', value: stoneOrder++ },
      { name: 'kind', type: 'string', value: kind },
      { name: 'skin', type: 'string', value: skin },
    ],
  });
}

// === Beat 1 (0:00-1:15): the carry, then up to the first Bird-gate =============================

fillFloor(0, 6, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });
// The kidnap-carry cinematic's card fallback (GDD §8.1's 12 h cinematic cap; D94a continuation).
addObject({
  type: 'trigger',
  x: 0,
  y: (FLOOR_ROW - 3) * TILE,
  width: 4 * TILE,
  height: 4 * TILE,
  properties: [
    { name: 'flag', type: 'string', value: 'card' },
    { name: 'textKey', type: 'string', value: 'card.l2.kidnapCarry' },
  ],
});
addStone(3, FLOOR_ROW - 1, 'path');

// Static creeper up to the first swinging creeper over a 4-tile gap.
for (let row = FLOOR_ROW - 5; row <= FLOOR_ROW; row++) setTile(9, row, GID_CREEPER);
fillFloor(10, 11, FLOOR_ROW - 5);
// Gap: cols 12-15 empty (4 tiles), the swinging creeper crosses here; landing at col 16.
fillFloor(16, 24, FLOOR_ROW - 5);
addObject({
  type: 'platform',
  name: 'swing-birdgate',
  x: 14 * TILE,
  y: (FLOOR_ROW - 9) * TILE,
  properties: [
    { name: 'path', type: 'string', value: 'swing-birdgate' },
    { name: 'speedPxS', type: 'int', value: 0 },
    { name: 'flags', type: 'string', value: 'swing' },
    { name: 'periodS', type: 'float', value: 1.66 },
  ],
});
addStone(19, FLOOR_ROW - 6, 'path');

// The first Bird-gate: a Master Words gate (crouch-hold 0.5 s), then Chil's line.
addObject({
  type: 'trigger',
  x: 25 * TILE,
  y: (FLOOR_ROW - 9) * TILE,
  width: TILE,
  height: 6 * TILE,
  properties: [{ name: 'flag', type: 'string', value: 'door' }],
});
fillFloor(26, 33, FLOOR_ROW - 5);
addObject({
  type: 'trigger',
  x: 27 * TILE,
  y: (FLOOR_ROW - 9) * TILE,
  width: 3 * TILE,
  height: 4 * TILE,
  properties: [
    { name: 'flag', type: 'string', value: 'card' },
    { name: 'textKey', type: 'string', value: 'card.l2.birdGate' },
  ],
});
addStone(30, FLOOR_ROW - 6, 'path');

// === Beat 2 (1:15-2:45): the tree-roads, chained swings ==========================================

fillFloor(34, 39, FLOOR_ROW - 5);
for (const [name, col] of [['swing-1', 41], ['swing-2', 46], ['swing-3', 51]]) {
  addObject({
    type: 'platform',
    name,
    x: col * TILE,
    y: (FLOOR_ROW - 9) * TILE,
    properties: [
      { name: 'path', type: 'string', value: name },
      { name: 'speedPxS', type: 'int', value: 0 },
      { name: 'flags', type: 'string', value: 'swing' },
      { name: 'periodS', type: 'float', value: 1.66 },
    ],
  });
}
fillFloor(55, 62, FLOOR_ROW - 5);
addStone(58, FLOOR_ROW - 6, 'path');

addObject({
  type: 'enemy',
  name: 'langur-branch-1',
  x: 37 * TILE,
  y: (FLOOR_ROW - 5) * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 1 },
    { name: 'patrolLeft', type: 'int', value: 37 * TILE },
    { name: 'patrolRight', type: 'int', value: 37 * TILE },
    { name: 'facing', type: 'int', value: 1 },
    { name: 'script', type: 'string', value: 'lobber' },
  ],
});

// The 1.0x detour: one chained swing off the main path, 2 branch stones, back to the path.
fillFloor(55, 58, FLOOR_ROW - 12);
addObject({
  type: 'platform',
  name: 'swing-detour',
  x: 60 * TILE,
  y: (FLOOR_ROW - 16) * TILE,
  properties: [
    { name: 'path', type: 'string', value: 'swing-detour' },
    { name: 'speedPxS', type: 'int', value: 0 },
    { name: 'flags', type: 'string', value: 'swing' },
    { name: 'periodS', type: 'float', value: 1.66 },
  ],
});
fillFloor(65, 68, FLOOR_ROW - 12);
addStone(56, FLOOR_ROW - 13, 'branch');
addStone(67, FLOOR_ROW - 13, 'branch');

addObject({
  type: 'enemy',
  name: 'langur-branch-2',
  x: 66 * TILE,
  y: (FLOOR_ROW - 12) * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 2 },
    { name: 'patrolLeft', type: 'int', value: 66 * TILE },
    { name: 'patrolRight', type: 'int', value: 66 * TILE },
    { name: 'facing', type: 'int', value: -1 },
    { name: 'script', type: 'string', value: 'lobber' },
  ],
});

addObject({
  type: 'packstone',
  x: 63 * TILE,
  y: (FLOOR_ROW - 5) * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l2-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// A secret stone off the detour, signposted by a short side nook.
fillFloor(69, 70, FLOOR_ROW - 15);
addStone(69, FLOOR_ROW - 16, 'secret');

// === Beat 3 (2:45-4:30), the twist: crumbling terraces down, cobras in the windows ===============

fillFloor(63, 64, FLOOR_ROW - 2);
fillFloor(63, 68, FLOOR_ROW + 2);
addObject({
  type: 'platform',
  name: 'crumble-1',
  x: 69 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  width: 4 * TILE,
  height: TILE,
  properties: [
    { name: 'path', type: 'string', value: 'crumble-1' },
    { name: 'speedPxS', type: 'int', value: 0 },
    { name: 'flags', type: 'string', value: 'crumble' },
  ],
});
fillFloor(74, 90, FLOOR_ROW + 2);
addStone(78, FLOOR_ROW + 1, 'path');

// Two branch stones on the terrace roofs (GDD §10.4 stone list).
setTile(72, FLOOR_ROW - 1, GID_GROUND);
setTile(73, FLOOR_ROW - 1, GID_GROUND);
addStone(72, FLOOR_ROW - 2, 'branch');
setTile(87, FLOOR_ROW - 1, GID_GROUND);
setTile(88, FLOOR_ROW - 1, GID_GROUND);
addStone(87, FLOOR_ROW - 2, 'branch');

for (const [name, entry, x] of [
  ['cobra-1', 3, 80 * TILE],
  ['cobra-2', 4, 86 * TILE],
]) {
  addObject({
    type: 'enemy',
    name,
    x,
    y: (FLOOR_ROW + 2) * TILE,
    properties: [
      { name: 'entry', type: 'int', value: entry },
      { name: 'patrolLeft', type: 'int', value: x },
      { name: 'patrolRight', type: 'int', value: x },
      { name: 'facing', type: 'int', value: 1 },
      { name: 'script', type: 'string', value: 'turret' },
    ],
  });
}

addObject({
  type: 'trigger',
  x: 88 * TILE,
  y: (FLOOR_ROW - 1) * TILE,
  width: 2 * TILE,
  height: 3 * TILE,
  properties: [{ name: 'flag', type: 'string', value: 'snakeGate' }],
});

addStone(83, FLOOR_ROW + 1, 'path');

addObject({
  type: 'packstone',
  x: 90 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l2-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// A secret stone at the bottom of the terrace descent.
fillFloor(91, 92, FLOOR_ROW + 5);
addStone(91, FLOOR_ROW + 4, 'secret');

// === Beat 4 (4:30-5:45): the tank terrace, last stones, the boss door ============================

fillFloor(93, 110, FLOOR_ROW + 2);
addStone(96, FLOOR_ROW + 1, 'path');
addStone(101, FLOOR_ROW + 1, 'path');
addStone(105, FLOOR_ROW + 1, 'path');

addObject({
  type: 'packstone',
  x: 108 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l2-cp3' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === B1 The Flung Festoon: the boss door and the arena ==========================================

fillFloor(111, 145, FLOOR_ROW + 2);
addObject({
  type: 'bossDoor',
  x: 128 * TILE,
  y: (FLOOR_ROW - 2) * TILE,
  width: 3 * TILE,
  height: 4 * TILE,
  properties: [{ name: 'bossId', type: 'string', value: 'B1' }],
});

// The post-victory Dance resolution (GDD §8.2 beat 7): hold Down beside each for 2 s.
addObject({ type: 'helper', x: 132 * TILE, y: (FLOOR_ROW + 2) * TILE, properties: [{ name: 'kind', type: 'string', value: 'bagheera' }] });
addObject({ type: 'helper', x: 136 * TILE, y: (FLOOR_ROW + 2) * TILE, properties: [{ name: 'kind', type: 'string', value: 'baloo' }] });

// A gate blocks the way to Kaa until the boss is defeated and both holds are complete.
addObject({
  type: 'trigger',
  x: 140 * TILE,
  y: (FLOOR_ROW - 4) * TILE,
  width: TILE,
  height: 6 * TILE,
  properties: [{ name: 'flag', type: 'string', value: 'bossGate' }],
});

addObject({
  type: 'exit',
  x: 144 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  properties: [{ name: 'characterId', type: 'string', value: 'kaa' }],
});

// === Map assembly ================================================================================

const map = {
  compressionlevel: -1,
  width: WIDTH,
  height: HEIGHT,
  tilewidth: TILE,
  tileheight: TILE,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  type: 'map',
  tiledversion: '1.12.2',
  version: '1.10',
  nextlayerid: 5,
  nextobjectid: nextObjectId,
  layers: [
    { type: 'tilelayer', id: 1, name: 'bg', width: WIDTH, height: HEIGHT, x: 0, y: 0, opacity: 1, visible: true, data: new Array(WIDTH * HEIGHT).fill(0) },
    { type: 'tilelayer', id: 2, name: 'ground', width: WIDTH, height: HEIGHT, x: 0, y: 0, opacity: 1, visible: true, data: ground },
    { type: 'tilelayer', id: 3, name: 'fg', width: WIDTH, height: HEIGHT, x: 0, y: 0, opacity: 1, visible: true, data: new Array(WIDTH * HEIGHT).fill(0) },
    { type: 'objectgroup', id: 4, name: 'entities', objects },
    { type: 'objectgroup', id: 5, name: 'markers', objects: [] },
  ],
  tilesets: [
    {
      firstgid: 1,
      name: 'gym-graybox',
      image: '../tilesets/gym-graybox.png',
      imagewidth: 32,
      imageheight: 16,
      tilewidth: TILE,
      tileheight: TILE,
      tilecount: 2,
      columns: 2,
      tiles: [
        { id: 0, properties: [{ name: 'collides', type: 'bool', value: true }] },
        { id: 1, properties: [{ name: 'climbable', type: 'bool', value: true }] },
      ],
    },
  ],
};

const stoneCount = objects.filter((o) => o.type === 'stone').length;
if (stoneCount !== 15) {
  throw new Error(`L2 must place exactly 15 stones (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l2.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} stones, ${objects.filter((o) => o.type === 'enemy').length} enemies, ${objects.filter((o) => o.type === 'platform' && o.properties.some((p) => p.value === 'swing')).length} swings)`);
