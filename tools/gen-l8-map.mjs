#!/usr/bin/env node
/**
 * Generates the M3.4 vertical slice of L8 The Ford (public/game/maps/l8.tmj) as plain Tiled
 * JSON, covering GDD.md §9.4, §10.10: resting wolves as the collectible (same count/quota/sting/
 * Full Moon rule as every other stone, just skinned "wolf" and HUD-labeled "rallied"), slow-water
 * triggers (50% run speed), floating logs (a continuous carry platform reuse), dhole pairs from
 * both banks, and the B4 door and arena: Red Dog at the Ford, with two Pack-intercept dholes as
 * its ambient wave adds. 9 path + 4 branch + 2 secret wolves, 3 pack-stones plus the boss door's
 * own checkpoint (the GDD's 4th, per the L2/L4/L6 precedent).
 *
 * Same gray-box scope note as gen-l1 through gen-l7-map.mjs: a smaller stand-in than the GDD's
 * authored 150x65/43-screen target, built to a script rather than hand-authored in Tiled
 * (DECISIONS.md D94a, continued for M3.4 in D98).
 *
 * Regenerate with: node tools/gen-l8-map.mjs
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
function addWolf(col, row, kind) {
  addObject({
    type: 'stone',
    x: col * TILE,
    y: row * TILE,
    properties: [
      { name: 'order', type: 'int', value: stoneOrder++ },
      { name: 'kind', type: 'string', value: kind },
      { name: 'skin', type: 'string', value: 'wolf' },
    ],
  });
}

function addDhole(name, entry, x, y, patrolLeftCol, patrolRightCol, facing, extraFlags = '') {
  const flags = extraFlags ? `contactDamage,lunge,${extraFlags}` : 'contactDamage,lunge';
  addObject({
    type: 'enemy',
    name,
    x,
    y,
    properties: [
      { name: 'entry', type: 'int', value: entry },
      { name: 'patrolLeft', type: 'int', value: patrolLeftCol * TILE },
      { name: 'patrolRight', type: 'int', value: patrolRightCol * TILE },
      { name: 'facing', type: 'int', value: facing },
      { name: 'script', type: 'string', value: 'charger' },
      { name: 'flags', type: 'string', value: flags },
    ],
  });
}

function addSlowWater(colStart, colEndInclusive, row, heightTiles = 4) {
  addObject({
    type: 'trigger',
    x: colStart * TILE,
    y: (row - heightTiles + 1) * TILE,
    width: (colEndInclusive - colStart + 1) * TILE,
    height: heightTiles * TILE,
    properties: [{ name: 'flag', type: 'string', value: 'slowWater' }],
  });
}

// === Beat 1 (0:00-1:15): the lairs -- Phao's council, the first 3 wolves, a dhole pair ===========

fillFloor(0, 25, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });
addWolf(3, FLOOR_ROW - 1, 'path');
addWolf(8, FLOOR_ROW - 1, 'path');
addWolf(13, FLOOR_ROW - 1, 'path');

addDhole('dhole-1', 1, 20 * TILE, FLOOR_ROW * TILE, 18, 24, 1);

// === Beat 2 (1:15-3:00): the hills -- wolves on tree-roads, creeper swings, cobras in grass ======

fillFloor(26, 60, FLOOR_ROW);
addWolf(30, FLOOR_ROW - 1, 'path');
for (let row = FLOOR_ROW - 7; row <= FLOOR_ROW; row++) setTile(35, row, GID_CREEPER);
fillFloor(36, 38, FLOOR_ROW - 7);
addWolf(37, FLOOR_ROW - 8, 'branch');

addObject({
  type: 'enemy',
  name: 'cobra-1',
  x: 45 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 2 },
    { name: 'patrolLeft', type: 'int', value: 45 * TILE },
    { name: 'patrolRight', type: 'int', value: 45 * TILE },
    { name: 'facing', type: 'int', value: 1 },
    { name: 'script', type: 'string', value: 'turret' },
  ],
});
addWolf(52, FLOOR_ROW - 1, 'path');

addObject({
  type: 'packstone',
  x: 60 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l8-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 3, twist (3:00-4:45): the river bank -- slow water, logs, dholes both sides ============

fillFloor(61, 65, FLOOR_ROW);
addSlowWater(66, 80, FLOOR_ROW);
fillFloor(66, 80, FLOOR_ROW);
addObject({
  type: 'platform',
  name: 'log-1',
  x: 70 * TILE,
  y: FLOOR_ROW * TILE,
  width: 3 * TILE,
  height: TILE,
  properties: [
    { name: 'path', type: 'string', value: 'log-1' },
    { name: 'speedPxS', type: 'int', value: 32 },
    { name: 'flags', type: 'string', value: 'carry' },
    { name: 'waypoints', type: 'string', value: `${78 * TILE},${FLOOR_ROW * TILE}` },
    { name: 'waitS', type: 'float', value: 1 },
  ],
});
addWolf(73, FLOOR_ROW - 1, 'path');

addDhole('dhole-2', 3, 82 * TILE, FLOOR_ROW * TILE, 81, 88, 1);
addDhole('dhole-3', 4, 86 * TILE, FLOOR_ROW * TILE, 81, 88, -1);
fillFloor(81, 100, FLOOR_ROW);
addWolf(84, FLOOR_ROW - 1, 'path');

// Won-tolla's empty lair: a secret wolf, marked by its own howl (GDD §10.10's "hidden").
fillFloor(93, 94, FLOOR_ROW - 5);
addWolf(93, FLOOR_ROW - 6, 'secret');
addWolf(97, FLOOR_ROW - 1, 'branch');

addObject({
  type: 'packstone',
  x: 100 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l8-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 4 (4:45-5:45): the ford -- the rallied Pack gathers, quota, Phao into B4 ===============

fillFloor(101, 125, FLOOR_ROW);
addWolf(105, FLOOR_ROW - 1, 'path');
addWolf(110, FLOOR_ROW - 1, 'path');
addWolf(115, FLOOR_ROW - 1, 'branch');

// Akela's howl: a secret wolf, marked by its own howl (GDD §10.10's other "hidden" marker).
fillFloor(118, 119, FLOOR_ROW - 5);
addWolf(118, FLOOR_ROW - 6, 'secret');
addWolf(122, FLOOR_ROW - 1, 'branch');

addObject({
  type: 'packstone',
  x: 125 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l8-cp3' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

addObject({
  type: 'bossDoor',
  x: 128 * TILE,
  y: (FLOOR_ROW - 2) * TILE,
  width: 3 * TILE,
  height: 4 * TILE,
  properties: [{ name: 'bossId', type: 'string', value: 'B4' }],
});

// === B4 Red Dog at the Ford: the arena, the ford rocks, two Pack-intercept dhole adds ============

fillFloor(129, 165, FLOOR_ROW + 2);
addDhole('b4-dhole-1', 5, 136 * TILE, (FLOOR_ROW + 2) * TILE, 132, 160, 1, 'packIntercept');
addDhole('b4-dhole-2', 6, 150 * TILE, (FLOOR_ROW + 2) * TILE, 132, 160, -1, 'packIntercept');

addObject({
  type: 'exit',
  x: 162 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  properties: [{ name: 'characterId', type: 'string', value: 'phao' }],
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
  throw new Error(`L8 must place exactly 15 wolves (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l8.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} wolves, ${objects.filter((o) => o.type === 'enemy').length} enemies, ${objects.filter((o) => o.type === 'platform').length} platforms)`);
