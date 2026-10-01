#!/usr/bin/env node
/**
 * Generates the M3.2 vertical slice of L3 Water Truce (public/game/maps/l3.tmj) as plain Tiled
 * JSON, covering GDD.md §10.5: cracked mud (crumble), a clod pile, a truce zone where a cobra
 * and a quill-pig stand down, Hathi's sons as carry platforms, a trunk-launch (bounce) to the
 * high bank, quill-pigs and a cobra outside the truce, a second truce zone (the banner-rock
 * rest) with the Shere Khan pool cinematic (card fallback), and the exit to Hathi. 9 path +
 * 4 branch + 2 secret stones, 3 pack-stones (the GDD's "4 checkpoints" counting spawn).
 *
 * Same gray-box scope note as gen-l1/l2-map.mjs: a smaller stand-in than the GDD's authored
 * 180x55/44-screen target, built to a script rather than hand-authored in Tiled (DECISIONS.md
 * D94a, continued for M3.2 in D97).
 *
 * Regenerate with: node tools/gen-l3-map.mjs
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

function addCarry(name, startCol, startRow, waypointCols, speedPxS, waitS) {
  // waypointCols includes the start column by convention (readable at the call site); the
  // object's own (x, y) already covers that first point (PlayScene.ts's buildPlatforms), so
  // only the remaining points go in the 'waypoints' property, or it would duplicate the start.
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

function addTruceZone(colStart, colEndInclusive, row, heightTiles = 6) {
  addObject({
    type: 'trigger',
    x: colStart * TILE,
    y: (row - heightTiles + 1) * TILE,
    width: (colEndInclusive - colStart + 1) * TILE,
    height: heightTiles * TILE,
    properties: [{ name: 'flag', type: 'string', value: 'truce' }],
  });
}

function addBouncePad(col, row) {
  addObject({
    type: 'platform',
    name: `bounce-${col}`,
    x: col * TILE,
    y: row * TILE,
    width: 2 * TILE,
    height: TILE,
    properties: [
      { name: 'path', type: 'string', value: 'bounce' },
      { name: 'speedPxS', type: 'int', value: 0 },
      { name: 'flags', type: 'string', value: 'bounce' },
    ],
  });
}

// x/y below are pixel coordinates (every call site passes col*TILE/row*TILE already, matching
// addObject's own convention elsewhere in this file); only patrolLeftCol/patrolRightCol are
// raw tile columns, since those read naturally at the call site as a patrol span in tiles.
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

// === Beat 1 (0:00-1:15): the shrunken bank -- cracked mud, the first clod piles, a truce zone ===

fillFloor(0, 10, FLOOR_ROW);
addObject({ type: 'spawn', x: 2 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'facing', type: 'int', value: 1 }] });
addStone(3, FLOOR_ROW - 1, 'path');

addObject({ type: 'pickup', x: 7 * TILE, y: FLOOR_ROW * TILE, properties: [{ name: 'kind', type: 'string', value: 'clodPile' }] });

addObject({
  type: 'platform',
  name: 'crumble-mud-1',
  x: 11 * TILE,
  y: FLOOR_ROW * TILE,
  width: 4 * TILE,
  height: TILE,
  properties: [
    { name: 'path', type: 'string', value: 'crumble-mud-1' },
    { name: 'speedPxS', type: 'int', value: 0 },
    { name: 'flags', type: 'string', value: 'crumble' },
  ],
});
fillFloor(16, 30, FLOOR_ROW);
addStone(19, FLOOR_ROW - 1, 'path');

// The first truce zone: a cobra and a quill-pig stand down inside it (GDD §10.5 beat 1).
addTruceZone(21, 29, FLOOR_ROW);
addCobra('cobra-truce', 1, 24 * TILE, FLOOR_ROW * TILE);
addQuillPig('quillpig-truce', 2, 27 * TILE, FLOOR_ROW * TILE, 26, 28, -1);

addObject({
  type: 'packstone',
  x: 29 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l3-cp1' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 2 (1:15-3:00): the riverbed -- ride Hathi's sons, hop between backs, trunk-launch =====

fillFloor(31, 33, FLOOR_ROW);
// A river gap crossed by two of Hathi's sons shuttling between the banks.
addCarry('hathi-son-1', 35, FLOOR_ROW, [35, 42], 32, 2);
addCarry('hathi-son-2', 45, FLOOR_ROW, [45, 52], 32, 2);
fillFloor(55, 58, FLOOR_ROW);
addStone(56, FLOOR_ROW - 1, 'path');

// The trunk launch up to the high bank (GDD §10.5's "trunk-launch to the high bank, 5 tiles").
addBouncePad(60, FLOOR_ROW);
fillFloor(66, 72, FLOOR_ROW - 6);
addStone(69, FLOOR_ROW - 7, 'branch');
addStone(70, FLOOR_ROW - 7, 'branch');

// Back down to the main riverbed path.
fillFloor(66, 80, FLOOR_ROW);
addObject({
  type: 'packstone',
  x: 62 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l3-cp2' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 3, twist (3:00-4:15): outside the truce -- quill-pigs, cobras, Shere Khan's pool ======

addQuillPig('quillpig-1', 3, 72 * TILE, FLOOR_ROW * TILE, 70, 76, 1);
addCobra('cobra-1', 4, 78 * TILE, FLOOR_ROW * TILE);
addStone(74, FLOOR_ROW - 1, 'path');

// A twist stone above a cracked-mud pit (GDD §10.5's "twist stones above cracked-mud pits").
addObject({
  type: 'platform',
  name: 'crumble-mud-2',
  x: 82 * TILE,
  y: FLOOR_ROW * TILE,
  width: 4 * TILE,
  height: TILE,
  properties: [
    { name: 'path', type: 'string', value: 'crumble-mud-2' },
    { name: 'speedPxS', type: 'int', value: 0 },
    { name: 'flags', type: 'string', value: 'crumble' },
  ],
});
addStone(83, FLOOR_ROW - 1, 'branch');
fillFloor(87, 100, FLOOR_ROW);
addStone(90, FLOOR_ROW - 1, 'path');

// A secret stone behind a dry well a clod opens (gray-box stand-in: a short side nook).
fillFloor(93, 94, FLOOR_ROW - 4);
addStone(93, FLOOR_ROW - 5, 'secret');

// The banner-rock island: a second truce zone as a rest, and the Shere Khan pool cinematic.
addTruceZone(101, 111, FLOOR_ROW);
addQuillPig('quillpig-2', 5, 106 * TILE, FLOOR_ROW * TILE, 104, 108, 1);
addObject({
  type: 'trigger',
  x: 103 * TILE,
  y: (FLOOR_ROW - 3) * TILE,
  width: 4 * TILE,
  height: 3 * TILE,
  properties: [
    { name: 'flag', type: 'string', value: 'card' },
    { name: 'textKey', type: 'string', value: 'card.l3.shereKhanPool' },
  ],
});
addStone(109, FLOOR_ROW - 1, 'path');

addObject({
  type: 'packstone',
  x: 111 * TILE,
  y: FLOOR_ROW * TILE,
  properties: [
    { name: 'checkpointId', type: 'string', value: 'l3-cp3' },
    { name: 'spawnFacing', type: 'int', value: 1 },
  ],
});

// === Beat 4 (4:15-5:30): Peace Rock -- the trunk-launch chain up, quota, Hathi's exit ===========

fillFloor(112, 125, FLOOR_ROW);
addStone(115, FLOOR_ROW - 1, 'path');
addStone(119, FLOOR_ROW - 1, 'path');

addBouncePad(127, FLOOR_ROW);
fillFloor(133, 140, FLOOR_ROW - 6);
addStone(136, FLOOR_ROW - 7, 'branch');
addBouncePad(141, FLOOR_ROW - 6);
fillFloor(147, 160, FLOOR_ROW - 12);
addStone(150, FLOOR_ROW - 13, 'path');
addStone(154, FLOOR_ROW - 13, 'path');

addObject({
  type: 'exit',
  x: 158 * TILE,
  y: (FLOOR_ROW - 12) * TILE,
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
  throw new Error(`L3 must place exactly 15 stones (9 path + 4 branch + 2 secret), placed ${stoneCount}`);
}

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/l3.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath} (${stoneCount} stones, ${objects.filter((o) => o.type === 'enemy').length} enemies, ${objects.filter((o) => o.type === 'platform' && o.properties.some((p) => p.value === 'carry')).length} carry platforms)`);
