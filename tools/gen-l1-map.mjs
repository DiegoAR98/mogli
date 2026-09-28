#!/usr/bin/env node
/**
 * Generates the M2 vertical slice of L1 Council Rock (public/game/maps/l1.tmj) as plain Tiled
 * JSON, covering every beat of GDD.md §10.3: the spawn cave and Shere Khan's roar, the first
 * 4-tile gap, a stomp-only langur, the tree-roads (a static creeper, two more langurs, a crouch
 * passage, Tabaqui the carrier-flag thief), the fire-pot twist (two patrolling jackals, a
 * pack-stone before and after), and the spiral of ledges up to Akela. 9 path + 4 branch + 2
 * secret stones (15 total), 3 pack-stones, one Red Flower pot.
 *
 * This is a gray-box placeholder built to a smaller total tile count than the GDD's authored
 * 90x80/32-screen target (see docs/DECISIONS.md): the real level, hand-authored in Tiled 1.12.2
 * with the Zone 1 room grammar and automapping, is GDD.md §10.2's "L1 is built in M2 as the
 * vertical slice and re-authored as a tutorial pass in M4" -- exactly this milestone's honest
 * scope, same as the M1 gym level's approximations.
 *
 * Regenerate with: node tools/gen-l1-map.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TILE = 16;
const WIDTH = 124;
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

function fillPlatform(colStart, colEndInclusive, row) {
  fillFloor(colStart, colEndInclusive, row);
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

// === Beat 1 (0:00-1:00): Raksha's cave to the hillside =========================================
// Spawn runway, Shere Khan's roar at the cave mouth, the first 4-tile gap, 3 path stones, a
// branch stone reached by a jump (a stand-in for the mahua-bunch upward-throw teaching moment,
// which needs the bunch/drop object type deferred past this milestone -- see DECISIONS.md), and
// one langur reachable only by a stomp.

fillFloor(0, 8, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });
addObject({
  type: 'trigger',
  x: 4 * TILE,
  y: (FLOOR_ROW - 3) * TILE,
  width: 3 * TILE,
  height: 3 * TILE,
  properties: [{ name: 'flag', type: 'string', value: 'roar' }],
});
addStone(3, FLOOR_ROW - 1, 'path');

// Gap 1: cols 9-12 empty (4 tiles, GAP_075X_TILES), landing at col 13.
fillFloor(13, 24, FLOOR_ROW);
addStone(15, FLOOR_ROW - 1, 'path');
addStone(19, FLOOR_ROW - 1, 'path');

// A small floating ledge holding a branch stone, reachable by a jump.
setTile(22, FLOOR_ROW - 3, GID_GROUND);
setTile(23, FLOOR_ROW - 3, GID_GROUND);
addStone(22, FLOOR_ROW - 4, 'branch');

// A stomp-only langur on a narrow elevated ledge past the landing.
fillFloor(26, 34, FLOOR_ROW);
setTile(29, FLOOR_ROW - 3, GID_GROUND);
setTile(30, FLOOR_ROW - 3, GID_GROUND);
setTile(31, FLOOR_ROW - 3, GID_GROUND);
addObject({
  type: 'enemy',
  name: 'langur-1-beat1',
  x: 30 * TILE,
  y: (FLOOR_ROW - 3) * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 1 },
    { name: 'patrolLeft', type: 'int', value: 29 * TILE },
    { name: 'patrolRight', type: 'int', value: 31 * TILE },
    { name: 'facing', type: 'int', value: -1 },
    { name: 'script', type: 'string', value: 'lobber' },
  ],
});

// === Beat 2 (1:00-2:30): the tree-roads =========================================================
// A static creeper lifts the path 4 tiles; the crouch passage; two langurs; Tabaqui steals a
// floor stone; pack-stone A closes the beat.

fillFloor(35, 39, FLOOR_ROW);
for (let row = FLOOR_ROW - 4; row <= FLOOR_ROW; row++) setTile(37, row, GID_CREEPER);

const UPPER_ROW = FLOOR_ROW - 4;
fillFloor(38, 45, UPPER_ROW);
addStone(40, UPPER_ROW - 1, 'branch'); // "two tree tops" -- first of the two

// Crouch passage: ceiling two rows above the upper floor, cols 46-48.
fillFloor(46, 58, UPPER_ROW);
for (let c = 46; c <= 48; c++) setTile(c, UPPER_ROW - 2, GID_GROUND);
addStone(47, UPPER_ROW - 1, 'branch'); // the crouch-passage stone

addObject({
  type: 'enemy',
  name: 'langur-2-beat2',
  x: 50 * TILE,
  y: UPPER_ROW * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 2 },
    { name: 'patrolLeft', type: 'int', value: 50 * TILE },
    { name: 'patrolRight', type: 'int', value: 50 * TILE },
    { name: 'facing', type: 'int', value: -1 },
    { name: 'script', type: 'string', value: 'lobber' },
  ],
});

fillFloor(59, 68, UPPER_ROW);
addStone(62, UPPER_ROW - 1, 'path');
addObject({
  type: 'enemy',
  name: 'langur-3-beat2',
  x: 65 * TILE,
  y: UPPER_ROW * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 3 },
    { name: 'patrolLeft', type: 'int', value: 65 * TILE },
    { name: 'patrolRight', type: 'int', value: 65 * TILE },
    { name: 'facing', type: 'int', value: -1 },
    { name: 'script', type: 'string', value: 'lobber' },
  ],
});

// Tabaqui: patrols and steals the nearest floor stone within range (GDD §7.7 #2).
addStone(72, UPPER_ROW - 1, 'branch'); // "Tabaqui's" stone
fillFloor(69, 78, UPPER_ROW);
addObject({
  type: 'enemy',
  name: 'tabaqui',
  x: 70 * TILE,
  y: UPPER_ROW * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 4 },
    { name: 'patrolLeft', type: 'int', value: 69 * TILE },
    { name: 'patrolRight', type: 'int', value: 77 * TILE },
    { name: 'facing', type: 'int', value: 1 },
    { name: 'script', type: 'string', value: 'charger' },
    { name: 'flags', type: 'string', value: 'carrier,thief' },
  ],
});

addObject({
  type: 'packstone',
  x: 78 * TILE,
  y: UPPER_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l1-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// A secret stone tucked behind a short wall off the beat 2 path (the "cracked bamboo wall").
setTile(79, UPPER_ROW, GID_GROUND);
setTile(79, UPPER_ROW - 1, GID_GROUND);
fillFloor(80, 82, UPPER_ROW - 3);
addStone(81, UPPER_ROW - 4, 'secret');

// === Beat 3 (2:30-3:45), the fire-pot twist: descend to the village fence ======================
// A short drop back to the ground floor; the Red Flower pot; two patrolling jackals (carrier
// flag, no contact damage, per GDD §7.7 #2); pack-stone B; climb back via a static creeper.

fillFloor(83, 84, FLOOR_ROW - 6);
fillFloor(85, 86, FLOOR_ROW - 3);
fillFloor(87, 108, FLOOR_ROW);

addObject({
  type: 'pickup',
  x: 90 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [{ name: 'kind', type: 'string', value: 'redFlowerPot' }],
});

for (const [name, entry, left, right, x] of [
  ['jackal-1', 5, 92 * TILE, 98 * TILE, 93 * TILE],
  ['jackal-2', 6, 99 * TILE, 105 * TILE, 100 * TILE],
]) {
  addObject({
    type: 'enemy',
    name,
    x,
    y: FLOOR_ROW * TILE,
    properties: [
      { name: 'entry', type: 'int', value: entry },
      { name: 'patrolLeft', type: 'int', value: left },
      { name: 'patrolRight', type: 'int', value: right },
      { name: 'facing', type: 'int', value: 1 },
      { name: 'script', type: 'string', value: 'charger' },
      { name: 'flags', type: 'string', value: 'carrier' },
    ],
  });
}

// A secret stone at the bottom of a short side shaft (the "firefly shaft"), off the main floor.
fillFloor(102, 103, FLOOR_ROW + 3);
addStone(102, FLOOR_ROW + 2, 'secret');

addObject({
  type: 'packstone',
  x: 108 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l1-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

for (let row = FLOOR_ROW - 5; row <= FLOOR_ROW; row++) setTile(109, row, GID_CREEPER);

// === Beat 4 (3:45-4:30): the spiral of ledges up Council Rock, all gaps 0.75x ===================
// A staircase of ledges climbing from the floor to Akela at the top; a third pack-stone at the
// base; the last 2 path stones on the way up.

const SPIRAL_BASE_ROW = FLOOR_ROW - 5;
fillFloor(110, 113, SPIRAL_BASE_ROW);
addObject({
  type: 'packstone',
  x: 111 * TILE,
  y: SPIRAL_BASE_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l1-cp3' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

const spiralLedges = [
  { col: 114, row: SPIRAL_BASE_ROW - 3 },
  { col: 111, row: SPIRAL_BASE_ROW - 6 },
  { col: 115, row: SPIRAL_BASE_ROW - 9 },
  { col: 111, row: SPIRAL_BASE_ROW - 12 },
  { col: 115, row: SPIRAL_BASE_ROW - 15 },
  { col: 111, row: SPIRAL_BASE_ROW - 18 },
  { col: 115, row: SPIRAL_BASE_ROW - 21 },
];
for (const ledge of spiralLedges) fillPlatform(ledge.col, ledge.col + 3, ledge.row);
addStone(spiralLedges[2].col + 1, spiralLedges[2].row - 1, 'path');
addStone(spiralLedges[5].col + 1, spiralLedges[5].row - 1, 'path');

const SUMMIT_ROW = spiralLedges[spiralLedges.length - 1].row;
fillPlatform(112, 120, SUMMIT_ROW);
addStone(114, SUMMIT_ROW - 1, 'path');
addStone(117, SUMMIT_ROW - 1, 'path');

addObject({
  type: 'exit',
  x: 119 * TILE,
  y: SUMMIT_ROW * TILE,
  properties: [{ name: 'characterId', type: 'string', value: 'akela' }],
});

// One more path stone (8 placed above) to reach the GDD §10.3 split of 9 path + 4 branch + 2 secret.
addStone(96, FLOOR_ROW - 1, 'path');

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
  throw new Error(`L1 must place exactly 15 stones (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l1.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} stones, ${objects.filter((o) => o.type === 'enemy').length} enemies)`);
