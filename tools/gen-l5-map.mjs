#!/usr/bin/env node
/**
 * Generates the M3.3 vertical slice of L5 Let in the Jungle (public/game/maps/l5.tmj) as plain
 * Tiled JSON, covering GDD.md §10.7: Buldeo as a pursuit hazard (a detect cone, a 6 s chase, a
 * boast, no capture state), tall-grass hiding from his cone, village dogs, rope cutting that
 * frees Messua and her husband as escort followers, Bagheera's card trigger, and the letting-in
 * cinematic as a card fallback. 9 path + 4 branch + 2 secret stones, 3 pack-stones.
 *
 * Same gray-box scope note as gen-l1 through gen-l4-map.mjs: a smaller stand-in than the GDD's
 * authored 140x70/44-screen target, built to a script rather than hand-authored in Tiled
 * (DECISIONS.md D94a, continued for M3.3 in D97).
 *
 * Regenerate with: node tools/gen-l5-map.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TILE = 16;
const WIDTH = 160;
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

function addTallGrass(colStart, colEndInclusive, row, heightTiles = 3) {
  addObject({
    type: 'trigger',
    x: colStart * TILE,
    y: (row - heightTiles + 1) * TILE,
    width: (colEndInclusive - colStart + 1) * TILE,
    height: heightTiles * TILE,
    properties: [{ name: 'flag', type: 'string', value: 'tallGrass' }],
  });
}

// === Beat 1 (0:00-1:00): the jungle edge -- grass rows teach hiding ==============================

fillFloor(0, 20, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });
addStone(3, FLOOR_ROW - 1, 'path');

addTallGrass(8, 14, FLOOR_ROW);
addStone(11, FLOOR_ROW - 1, 'path');
addStone(17, FLOOR_ROW - 1, 'path');

// === Beat 2 (1:00-2:45): the night fields -- Buldeo's route, dogs, 3 stones in his path ==========

fillFloor(21, 70, FLOOR_ROW);
addObject({
  type: 'enemy',
  name: 'buldeo',
  x: 40 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 1 },
    { name: 'patrolLeft', type: 'int', value: 30 * TILE },
    { name: 'patrolRight', type: 'int', value: 50 * TILE },
    { name: 'facing', type: 'int', value: 1 },
    { name: 'script', type: 'string', value: 'buldeo' },
  ],
});
addStone(33, FLOOR_ROW - 1, 'path');
addStone(40, FLOOR_ROW - 1, 'branch');
addStone(47, FLOOR_ROW - 1, 'path');

addObject({
  type: 'enemy',
  name: 'dog-1',
  x: 60 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'entry', type: 'int', value: 2 },
    { name: 'patrolLeft', type: 'int', value: 58 * TILE },
    { name: 'patrolRight', type: 'int', value: 65 * TILE },
    { name: 'facing', type: 'int', value: 1 },
    { name: 'script', type: 'string', value: 'charger' },
    { name: 'flags', type: 'string', value: 'contactDamage,lunge' },
  ],
});

addObject({
  type: 'packstone',
  x: 68 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l5-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// A branch stone off the main route.
fillFloor(55, 57, FLOOR_ROW - 6);
addStone(56, FLOOR_ROW - 7, 'branch');

// === Beat 3, twist (2:45-4:30): the hut -- cut the ropes, Bagheera's scare, escort ===============

fillFloor(71, 90, FLOOR_ROW);
addStone(74, FLOOR_ROW - 1, 'path');

addObject({ type: 'rope', x: 78 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'index', type: 'int', value: 0 }] });
addObject({ type: 'follower', x: 79 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'index', type: 'int', value: 0 }] });
addObject({ type: 'rope', x: 81 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'index', type: 'int', value: 1 }] });
addObject({ type: 'follower', x: 82 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'index', type: 'int', value: 1 }] });

addObject({
  type: 'trigger',
  x: 83 * TILE,
  y: (FLOOR_ROW - 3) * TILE,
  width: 3 * TILE,
  height: 3 * TILE,
  properties: [
    { name: 'flag', type: 'string', value: 'card' },
    { name: 'textKey', type: 'string', value: 'card.l5.bagheeraScare' },
  ],
});

addStone(86, FLOOR_ROW - 1, 'branch');
fillFloor(91, 100, FLOOR_ROW);
addStone(94, FLOOR_ROW - 1, 'path');

// A secret stone in the charcoal-burners' clearing.
fillFloor(97, 98, FLOOR_ROW - 5);
addStone(97, FLOOR_ROW - 6, 'secret');

addObject({
  type: 'packstone',
  x: 100 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l5-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 4 (4:30-5:30): the Khanhiwara road -- Hathi waits, quota, the letting-in cinematic =====

fillFloor(101, 130, FLOOR_ROW);
addStone(105, FLOOR_ROW - 1, 'path');
addStone(110, FLOOR_ROW - 1, 'path');
addStone(115, FLOOR_ROW - 1, 'branch');

// A second secret stone in the well.
fillFloor(123, 124, FLOOR_ROW - 4);
addStone(123, FLOOR_ROW - 5, 'secret');

addObject({
  type: 'packstone',
  x: 126 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l5-cp3' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

addObject({
  type: 'trigger',
  x: 128 * TILE,
  y: (FLOOR_ROW - 3) * TILE,
  width: 4 * TILE,
  height: 3 * TILE,
  properties: [
    { name: 'flag', type: 'string', value: 'card' },
    { name: 'textKey', type: 'string', value: 'card.l5.lettingIn' },
  ],
});

addObject({
  type: 'exit',
  x: 132 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [{ name: 'characterId', type: 'string', value: 'hathi' }],
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
  throw new Error(`L5 must place exactly 15 stones (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l5.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} stones, ${objects.filter((o) => o.type === 'enemy').length} enemies, ${objects.filter((o) => o.type === 'rope').length} ropes)`);
