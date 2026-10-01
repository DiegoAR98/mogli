#!/usr/bin/env node
/**
 * Generates the M3.2 vertical slice of L4 Man-Pack (public/game/maps/l4.tmj) as plain Tiled
 * JSON, covering GDD.md §10.6: hut doors (a shorter crouch-hold gate), village dogs (a Charger
 * lunge-charge variant with contact damage), buffalo as advanceOnHit carry platforms that break
 * a thorn fence when nutted, cobras in the grass, a quill-pig by the well, and Grey Brother's
 * exit -- then the B2 door and arena: The Lame One in the Ravine (GDD §8.3), with Rama as a
 * carry platform for phase 3. 9 path + 4 branch + 2 secret stones, 3 pack-stones plus the boss
 * door's own checkpoint (the GDD's 4th, matching L2's own precedent, GDD §9.5).
 *
 * Same gray-box scope note as gen-l1/l2/l3-map.mjs: a smaller stand-in than the GDD's authored
 * 150x65/43-screen target, built to a script rather than hand-authored in Tiled (DECISIONS.md
 * D94a, continued for M3.2 in D97). Tabaqui's living boulder-landing telegraph (GDD §8.3 beat 4)
 * uses its documented fallback here (a dust mark, not a running NPC) since Tabaqui never
 * otherwise appears past L1.
 *
 * Regenerate with: node tools/gen-l4-map.mjs
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

function addHutDoor(col, row, heightTiles = 4) {
  addObject({
    type: 'trigger',
    x: col * TILE,
    y: (row - heightTiles + 1) * TILE,
    width: TILE,
    height: heightTiles * TILE,
    properties: [
      { name: 'flag', type: 'string', value: 'door' },
      { name: 'gateKind', type: 'string', value: 'hutDoor' },
    ],
  });
}

// x/y below are pixel coordinates (every call site passes col*TILE/row*TILE already, matching
// addObject's own convention elsewhere in this file); only patrolLeftCol/patrolRightCol are
// raw tile columns, since those read naturally at the call site as a patrol span in tiles.
function addDog(name, entry, x, y, patrolLeftCol, patrolRightCol, facing) {
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

function addCobra(name, entry, x, y) {
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

function addQuillPig(name, entry, x, y, patrolLeftCol, patrolRightCol, facing) {
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
      { name: 'script', type: 'string', value: 'lobber' },
      { name: 'flags', type: 'string', value: 'quillPig' },
    ],
  });
}

// === Beat 1 (0:00-1:15): the village at dawn -- Messua's hut, hut doors, dogs ====================

fillFloor(0, 20, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });
addStone(3, FLOOR_ROW - 1, 'path');

addHutDoor(8, FLOOR_ROW);
addStone(10, FLOOR_ROW - 1, 'path'); // Messua's hut interior, the first pack-stone room
addObject({
  type: 'packstone',
  x: 11 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l4-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});
addHutDoor(14, FLOOR_ROW);

addDog('dog-1', 1, 18 * TILE, FLOOR_ROW * TILE, 16, 20, 1);
fillFloor(21, 34, FLOOR_ROW);
addStone(24, FLOOR_ROW - 1, 'path');

// A branch stone through the rooftop via a second hut door.
addHutDoor(27, FLOOR_ROW);
fillFloor(28, 30, FLOOR_ROW - 6);
addStone(29, FLOOR_ROW - 7, 'branch');

// === Beat 2 (1:15-3:00): the fields -- ride Rama, nut a bull through the first fence ============

fillFloor(35, 38, FLOOR_ROW);
addObject({
  type: 'platform',
  name: 'buffalo-1',
  x: 40 * TILE,
  y: FLOOR_ROW * TILE,
  width: 3 * TILE,
  height: TILE,
  properties: [
    { name: 'path', type: 'string', value: 'buffalo-1' },
    { name: 'speedPxS', type: 'int', value: 0 },
    { name: 'flags', type: 'string', value: 'carry,advanceOnHit' },
    { name: 'waypoints', type: 'string', value: `${54 * TILE},${FLOOR_ROW * TILE}` },
  ],
});
addObject({
  type: 'fence',
  x: 50 * TILE,
  y: (FLOOR_ROW - 3) * TILE,
  width: TILE,
  height: 4 * TILE,
});
fillFloor(56, 58, FLOOR_ROW);
addStone(57, FLOOR_ROW - 1, 'path');

addCobra('cobra-field', 2, 62 * TILE, FLOOR_ROW * TILE);
fillFloor(60, 68, FLOOR_ROW);
addQuillPig('quillpig-well', 3, 66 * TILE, FLOOR_ROW * TILE, 64, 68, -1);
addStone(65, FLOOR_ROW - 1, 'branch');

addObject({
  type: 'packstone',
  x: 68 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l4-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 3, twist (3:00-4:30): the grazing ravines -- buffalo bridges, dogs charge the line ====

fillFloor(69, 71, FLOOR_ROW);
addObject({
  type: 'platform',
  name: 'buffalo-bridge',
  x: 73 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  width: 3 * TILE,
  height: TILE,
  properties: [
    { name: 'path', type: 'string', value: 'buffalo-bridge' },
    { name: 'speedPxS', type: 'int', value: 32 },
    { name: 'flags', type: 'string', value: 'carry' },
    { name: 'waypoints', type: 'string', value: `${88 * TILE},${(FLOOR_ROW + 2) * TILE}` },
    { name: 'waitS', type: 'float', value: 2 },
  ],
});
fillFloor(90, 92, FLOOR_ROW + 2);
addStone(91, FLOOR_ROW + 1, 'path');

addDog('dog-2', 4, 95 * TILE, (FLOOR_ROW + 2) * TILE, 93, 100, 1);
fillFloor(93, 105, FLOOR_ROW + 2);
addStone(98, FLOOR_ROW + 1, 'path');

// A secret stone under the ravine bridge.
fillFloor(100, 101, FLOOR_ROW + 6);
addStone(100, FLOOR_ROW + 5, 'secret');

addObject({
  type: 'packstone',
  x: 105 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l4-cp3' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 4 (4:30-5:45): the dhak tree at dusk -- Grey Brother, quota, the B2 door ===============

fillFloor(106, 120, FLOOR_ROW + 2);
addStone(110, FLOOR_ROW + 1, 'path');
addStone(114, FLOOR_ROW + 1, 'path');
addStone(118, FLOOR_ROW + 1, 'path');

// Two more branch stones (the granary loft, the upper herd path) and a second secret stone
// (the granary) round out L4's 9 path + 4 branch + 2 secret (GDD §10.6 stone list).
fillFloor(50, 52, FLOOR_ROW - 6);
addStone(51, FLOOR_ROW - 7, 'branch');
fillFloor(96, 98, FLOOR_ROW - 2);
addStone(97, FLOOR_ROW - 3, 'branch');
fillFloor(112, 113, FLOOR_ROW - 4);
addStone(112, FLOOR_ROW - 5, 'secret');

addObject({
  type: 'bossDoor',
  x: 122 * TILE,
  y: (FLOOR_ROW - 2) * TILE,
  width: 3 * TILE,
  height: 4 * TILE,
  properties: [{ name: 'bossId', type: 'string', value: 'B2' }],
});

// The B2 arena: a flat ravine floor; Rama crosses it as a carry platform for phase 3.
fillFloor(123, 158, FLOOR_ROW + 2);
addObject({
  type: 'platform',
  name: 'rama',
  x: 132 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  width: 3 * TILE,
  height: TILE,
  properties: [
    { name: 'path', type: 'string', value: 'rama' },
    { name: 'speedPxS', type: 'int', value: 48 },
    { name: 'flags', type: 'string', value: 'carry' },
    { name: 'waypoints', type: 'string', value: `${144 * TILE},${(FLOOR_ROW + 2) * TILE}` },
    { name: 'waitS', type: 'float', value: 0.5 },
  ],
});

addObject({
  type: 'exit',
  x: 156 * TILE,
  y: (FLOOR_ROW + 2) * TILE,
  properties: [{ name: 'characterId', type: 'string', value: 'greyBrother' }],
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
  throw new Error(`L4 must place exactly 15 stones (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l4.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} stones, ${objects.filter((o) => o.type === 'enemy').length} enemies, ${objects.filter((o) => o.type === 'fence').length} fences)`);
