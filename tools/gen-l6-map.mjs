#!/usr/bin/env node
/**
 * Generates the M3.3 vertical slice of L6 King's Treasure (public/game/maps/l6.tmj) as plain
 * Tiled JSON, covering GDD.md §9.3 and §10.8: the inverted quota (jewel-skin stones go into a
 * pouch and only count once banked at the altar), Kaa's coils (a carry platform, linear rather
 * than sine-eased -- a documented simplification, DECISIONS.md D97), the head-lift, coin-
 * throwers (a plain Lobber reskin per GDD's own "as card 1"), white cobras (a plain Turret
 * reskin per "as card 3"), a quill-pig, Thuu's gate (an altarGate opening at quota banked), and
 * the B3 door and arena: Thuu, the White Hood. 9 path + 4 branch + 2 secret jewels, 3 pack-
 * stones plus the boss door's own checkpoint (the GDD's 4th, per the L2/L4 precedent).
 *
 * Same gray-box scope note as gen-l1 through gen-l5-map.mjs: a smaller stand-in than the GDD's
 * authored 80x125/44-screen vertical target, built to a script rather than hand-authored in
 * Tiled (DECISIONS.md D94a, continued for M3.3 in D97).
 *
 * Regenerate with: node tools/gen-l6-map.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TILE = 16;
const WIDTH = 170;
const HEIGHT = 40;
const FLOOR_ROW = 28;

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
function addJewel(col, row, kind) {
  addObject({
    type: 'stone',
    x: col * TILE,
    y: row * TILE,
    properties: [
      { name: 'order', type: 'int', value: stoneOrder++ },
      { name: 'kind', type: 'string', value: kind },
      { name: 'skin', type: 'string', value: 'jewel' },
    ],
  });
}

function addCarry(name, startCol, startRow, waypointCols, speedPxS, waitS) {
  const waypoints = waypointCols
    .slice(1)
    .map((c) => `${c * TILE},${startRow * TILE}`)
    .join(';');
  addObject({
    type: 'platform',
    name,
    x: startCol * TILE,
    y: startRow * TILE,
    width: 3 * TILE,
    height: TILE,
    properties: [
      { name: 'path', type: 'string', value: name },
      { name: 'speedPxS', type: 'int', value: speedPxS },
      { name: 'flags', type: 'string', value: 'carry' },
      { name: 'waypoints', type: 'string', value: waypoints },
      { name: 'waitS', type: 'float', value: waitS },
    ],
  });
}

function addCoinThrower(name, entry, x, y) {
  addObject({
    type: 'enemy',
    name,
    x,
    y,
    properties: [
      { name: 'entry', type: 'int', value: entry },
      { name: 'patrolLeft', type: 'int', value: x },
      { name: 'patrolRight', type: 'int', value: x },
      { name: 'facing', type: 'int', value: 1 },
      { name: 'script', type: 'string', value: 'lobber' },
    ],
  });
}

function addWhiteCobra(name, entry, x, y) {
  addObject({
    type: 'enemy',
    name,
    x,
    y,
    properties: [
      { name: 'entry', type: 'int', value: entry },
      { name: 'patrolLeft', type: 'int', value: x },
      { name: 'patrolRight', type: 'int', value: x },
      { name: 'facing', type: 'int', value: 1 },
      { name: 'script', type: 'string', value: 'turret' },
    ],
  });
}

// === Beat 1 (0:00-1:15): Kaa's ledge -- low coils, the altar and two jewels beside it ============

fillFloor(0, 10, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });

addObject({ type: 'altar', x: 5 * TILE, y: FLOOR_ROW * TILE });
addJewel(7, FLOOR_ROW - 1, 'path');
addJewel(8, FLOOR_ROW - 1, 'path');

addCarry('kaa-coil-1', 12, FLOOR_ROW, [12, 20], 48, 1);
fillFloor(24, 30, FLOOR_ROW);
addJewel(27, FLOOR_ROW - 1, 'path');

addObject({
  type: 'packstone',
  x: 29 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l6-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 2 (1:15-3:00): the queens' pavilion -- coin-throwers, quill-pigs, the coil descent =====

fillFloor(31, 55, FLOOR_ROW);
addCoinThrower('coin-1', 1, 38 * TILE, FLOOR_ROW * TILE);
addJewel(35, FLOOR_ROW - 1, 'path');
addObject({
  type: 'enemy',
  name: 'quillpig-1',
  x: 48 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 2 },
    { name: 'patrolLeft', type: 'int', value: 46 * TILE },
    { name: 'patrolRight', type: 'int', value: 51 * TILE },
    { name: 'facing', type: 'int', value: 1 },
    { name: 'script', type: 'string', value: 'lobber' },
    { name: 'flags', type: 'string', value: 'quillPig' },
  ],
});
addJewel(52, FLOOR_ROW - 1, 'path');

addCarry('kaa-coil-2', 56, FLOOR_ROW, [56, 64], 48, 1);
fillFloor(68, 75, FLOOR_ROW);
addJewel(71, FLOOR_ROW - 1, 'path');

// A branch jewel on a coil-only ledge.
fillFloor(60, 62, FLOOR_ROW - 6);
addJewel(61, FLOOR_ROW - 7, 'branch');

addObject({
  type: 'packstone',
  x: 75 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l6-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 3, twist (3:00-4:45): the vault loop -- white cobras, coin-throwers, the head-lift =====

fillFloor(76, 100, FLOOR_ROW);
addWhiteCobra('whitecobra-1', 3, 82 * TILE, FLOOR_ROW * TILE);
addJewel(79, FLOOR_ROW - 1, 'path');
addCoinThrower('coin-2', 4, 90 * TILE, FLOOR_ROW * TILE);
addJewel(87, FLOOR_ROW - 1, 'branch');
addWhiteCobra('whitecobra-2', 5, 96 * TILE, FLOOR_ROW * TILE);
addJewel(98, FLOOR_ROW - 1, 'path');
fillFloor(88, 89, FLOOR_ROW - 5);
addJewel(88, FLOOR_ROW - 6, 'branch');

// A secret jewel behind a cracked wall (a clod opens it; gray-box stand-in: a side nook).
fillFloor(93, 94, FLOOR_ROW - 5);
addJewel(93, FLOOR_ROW - 6, 'secret');

// The head-lift loops back toward the altar.
addObject({ type: 'headLift', x: 101 * TILE, y: FLOOR_ROW * TILE });
fillFloor(105, 112, FLOOR_ROW - 6);
addJewel(108, FLOOR_ROW - 7, 'branch');

// A second secret jewel in a niche behind the pavilion.
fillFloor(110, 111, FLOOR_ROW - 10);
addJewel(110, FLOOR_ROW - 11, 'secret');

addObject({
  type: 'packstone',
  x: 112 * TILE,
  y: (FLOOR_ROW - 6) * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l6-cp3' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});
fillFloor(113, 120, FLOOR_ROW - 6);
addJewel(117, FLOOR_ROW - 7, 'path');

// === Beat 4 (4:45-6:15): Thuu's gate -- quota banked, descend to the B3 door =====================

fillFloor(121, 135, FLOOR_ROW - 6);
addObject({
  type: 'trigger',
  x: 133 * TILE,
  y: (FLOOR_ROW - 10) * TILE,
  width: TILE,
  height: 6 * TILE,
  properties: [{ name: 'flag', type: 'string', value: 'altarGate' }],
});

fillFloor(136, 150, FLOOR_ROW - 6);
addObject({
  type: 'bossDoor',
  x: 145 * TILE,
  y: (FLOOR_ROW - 10) * TILE,
  width: 3 * TILE,
  height: 4 * TILE,
  properties: [{ name: 'bossId', type: 'string', value: 'B3' }],
});

// === B3 Thuu, the White Hood: the arena and the plate-lift resolution ============================

fillFloor(151, 168, FLOOR_ROW - 6);
addObject({ type: 'helper', x: 160 * TILE, y: (FLOOR_ROW - 6) * TILE, properties: [{ name: 'kind', type: 'string', value: 'plate' }] });

addObject({
  type: 'exit',
  x: 166 * TILE,
  y: (FLOOR_ROW - 6) * TILE,
  properties: [{ name: 'characterId', type: 'string', value: 'thuu' }],
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
  throw new Error(`L6 must place exactly 15 jewels (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l6.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} jewels, ${objects.filter((o) => o.type === 'enemy').length} enemies, ${objects.filter((o) => o.type === 'platform').length} carry platforms)`);
