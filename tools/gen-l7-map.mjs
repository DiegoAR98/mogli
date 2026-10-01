#!/usr/bin/env node
/**
 * Generates the M3.4 vertical slice of L7 Bee Rocks (public/game/maps/l7.tmj) as plain Tiled
 * JSON, covering GDD.md §10.9: garlic as the timed item (bees ignore Mowgli while it's up),
 * hives as Turret spawners that release a bee cloud (a Diver, cannot be hit), dhole scout pairs
 * (the Charger lunge/contactDamage reuse from M3.2), boulders (a nut-triggered advanceOnHit
 * carry platform that smashes hives), and the safe-water pool that ends the level (no exit
 * card: the leap is the exit, per the GDD). 9 path + 4 branch + 2 secret stones, 3 pack-stones.
 *
 * Same gray-box scope note as gen-l1 through gen-l6-map.mjs: a smaller stand-in than the GDD's
 * authored 120x85/45-screen target, built to a script rather than hand-authored in Tiled
 * (DECISIONS.md D94a, continued for M3.4 in D98).
 *
 * Regenerate with: node tools/gen-l7-map.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TILE = 16;
const WIDTH = 150;
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

function addHive(name, entry, x, y) {
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
      { name: 'flags', type: 'string', value: 'hive' },
    ],
  });
}

function addDhole(name, entry, x, y, patrolLeftCol, patrolRightCol, facing) {
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
      { name: 'flags', type: 'string', value: 'contactDamage,lunge' },
    ],
  });
}

function addBoulder(name, startCol, startRow, targetCol) {
  addObject({
    type: 'platform',
    name,
    x: startCol * TILE,
    y: startRow * TILE,
    width: 2 * TILE,
    height: TILE,
    properties: [
      { name: 'path', type: 'string', value: name },
      { name: 'speedPxS', type: 'int', value: 0 },
      { name: 'flags', type: 'string', value: 'carry,advanceOnHit' },
      { name: 'waypoints', type: 'string', value: `${targetCol * TILE},${startRow * TILE}` },
    ],
  });
}

// === Beat 1 (0:00-1:00): Council Rock at evening -- the garlic bed, the first hive =============

fillFloor(0, 20, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });
addStone(3, FLOOR_ROW - 1, 'path');

addObject({ type: 'pickup', x: 8 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'kind', type: 'string', value: 'garlic' }] });
addHive('hive-1', 1, 14 * TILE, FLOOR_ROW * TILE);
addStone(17, FLOOR_ROW - 1, 'path');

// === Beat 2 (1:00-2:45): the gorge climb -- hives on ledges, dhole pairs, creeper swings ========

fillFloor(21, 55, FLOOR_ROW);
addDhole('dhole-1', 2, 30 * TILE, FLOOR_ROW * TILE, 28, 34, 1);
addDhole('dhole-2', 3, 33 * TILE, FLOOR_ROW * TILE, 28, 34, -1);
addStone(37, FLOOR_ROW - 1, 'path');
addHive('hive-2', 4, 44 * TILE, FLOOR_ROW * TILE);

// A branch stone up a creeper swing above the bees.
for (let row = FLOOR_ROW - 8; row <= FLOOR_ROW; row++) setTile(49, row, GID_CREEPER);
fillFloor(50, 52, FLOOR_ROW - 8);
addStone(51, FLOOR_ROW - 9, 'branch');

addObject({
  type: 'packstone',
  x: 55 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l7-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 3, twist (2:45-4:30): garlic runs out mid-climb -- a second bed, the cave ==============

fillFloor(56, 80, FLOOR_ROW);
addHive('hive-3', 5, 63 * TILE, FLOOR_ROW * TILE);
addStone(66, FLOOR_ROW - 1, 'branch');
addObject({ type: 'pickup', x: 70 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'kind', type: 'string', value: 'garlic' }] });
addHive('hive-4', 6, 74 * TILE, FLOOR_ROW * TILE);
addStone(77, FLOOR_ROW - 1, 'path');

// The cave behind the waterfall: a secret stone.
fillFloor(79, 80, FLOOR_ROW - 5);
addStone(79, FLOOR_ROW - 6, 'secret');

addObject({
  type: 'packstone',
  x: 81 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l7-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 4 (4:30-5:30): the run and the leap -- boulders, the cliff-top nest, the pool =========

fillFloor(82, 95, FLOOR_ROW);
addBoulder('boulder-1', 86, FLOOR_ROW, 92);
addHive('hive-5', 7, 92 * TILE, FLOOR_ROW * TILE);
addStone(90, FLOOR_ROW - 1, 'path');

fillFloor(96, 110, FLOOR_ROW);
addStone(99, FLOOR_ROW - 1, 'path');
addStone(103, FLOOR_ROW - 1, 'path');
addStone(96, FLOOR_ROW - 1, 'path');

// A branch stone and a path stone off the gorge climb.
fillFloor(40, 42, FLOOR_ROW - 6);
addStone(41, FLOOR_ROW - 7, 'branch');
addStone(23, FLOOR_ROW - 1, 'path');

// The cliff-top nest: a secret stone.
fillFloor(107, 108, FLOOR_ROW - 5);
addStone(107, FLOOR_ROW - 6, 'secret');
addStone(109, FLOOR_ROW - 1, 'branch');

// The running jump into the safe-water pool (GDD §10.9: "any jump lands in safe water").
fillFloor(111, 118, FLOOR_ROW);
addObject({
  type: 'trigger',
  x: 119 * TILE,
  y: (FLOOR_ROW + 1) * TILE,
  width: 8 * TILE,
  height: 6 * TILE,
  properties: [{ name: 'flag', type: 'string', value: 'safeWater' }],
});

addObject({
  type: 'exit',
  x: 122 * TILE,
  y: (FLOOR_ROW + 3) * TILE,
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
  throw new Error(`L7 must place exactly 15 stones (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l7.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} stones, ${objects.filter((o) => o.type === 'enemy').length} enemies, ${objects.filter((o) => o.type === 'pickup').length} garlic beds)`);
