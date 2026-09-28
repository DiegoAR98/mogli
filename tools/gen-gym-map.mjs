#!/usr/bin/env node
/**
 * Generates the M1 gym level (public/game/maps/gym.tmj) as plain Tiled JSON, per PLAN.md
 * §12.3 M1 step 3: flat runway, a 4-tile gap, an approximate 5.5-tile gap, a 1-tile crouch
 * passage, three floating ledges (3/4/5 tiles high) for the ledge-grab reach, a static
 * creeper, a swinging creeper (S4 platform object with the swing flag), a crumbling terrace
 * (S4 platform object with the crumble flag) bridging a 4-tile gap, a pit trigger, two
 * pack-stones and one moon-stone.
 *
 * This is a gray-box placeholder (PLAN.md §8.1 phase 0): grid-aligned tiles cannot express
 * the exact 5.5-tile (0.75x/1.0x) gap ruler or sub-pixel 4/5 px corner-correction fixtures --
 * those are unit-tested directly in tests/unit/player/cornerStep.test.ts and
 * ledgeGrab.test.ts against exact pixel values, not against this map. A human author opens
 * this file in Tiled 1.12.2 to refine it once real corner/step geometry is needed on screen
 * (see docs/DECISIONS.md, verify-in-M0 spike V1).
 *
 * Regenerate with: node tools/gen-gym-map.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TILE = 16;
const WIDTH = 100; // tiles
const HEIGHT = 12; // tiles
const FLOOR_ROW = 9; // ground tiles occupy this row by default (y = 144..160)

const GID_EMPTY = 0;
const GID_GROUND = 1; // collides: true
const GID_CREEPER = 2; // climbable: true

const ground = new Array(WIDTH * HEIGHT).fill(GID_EMPTY);

function setTile(col, row, gid) {
  if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) throw new Error(`Tile out of bounds: ${col},${row}`);
  ground[row * WIDTH + col] = gid;
}

function fillFloor(colStart, colEndInclusive, row = FLOOR_ROW) {
  for (let c = colStart; c <= colEndInclusive; c++) setTile(c, row, GID_GROUND);
}

// --- Section 1: spawn runway (cols 0-9) --------------------------------------------------------
fillFloor(0, 9);

// --- Section 2: the 4-tile (0.75x) gap, cols 10-13 empty, landing at col 14 --------------------
fillFloor(14, 24);
// First pack-stone, over safe ground, col 20.

// --- Section 3: the ~5.5-tile (1.0x) gap, cols 26-31 empty (6 tiles; grid-rounded up from 5.5) --
fillFloor(32, 33);

// --- Section 4: 1-tile crouch passage, cols 34-36: ceiling at row 7, floor continues at row 9 ---
fillFloor(34, 44);
for (let c = 34; c <= 36; c++) setTile(c, 7, GID_GROUND); // ceiling; row 8 stays open (16 px passage)

// --- Section 5: static creeper column over safe ground, col 50, rows 4-8 (5 tiles tall) --------
fillFloor(45, 63);
for (let row = 4; row <= 8; row++) setTile(50, row, GID_CREEPER);

// --- Section 6: three floating ledges (3, 4, 5 tiles above the walkway), cols 56-64 -------------
setTile(56, FLOOR_ROW - 3, GID_GROUND);
setTile(57, FLOOR_ROW - 3, GID_GROUND);
setTile(59, FLOOR_ROW - 4, GID_GROUND);
setTile(60, FLOOR_ROW - 4, GID_GROUND);
setTile(62, FLOOR_ROW - 5, GID_GROUND);
setTile(63, FLOOR_ROW - 5, GID_GROUND);

// --- Section 7: continue runway, then the swinging-creeper gap, cols 64-84 ----------------------
fillFloor(64, 69);
// cols 70-73 empty: the swinging creeper (object layer) crosses here.
fillFloor(74, 79);

// --- Section 8: crumbling-terrace gap, cols 80-83 empty, bridged by a crumble platform object ---
fillFloor(84, 89);
// Second pack-stone, col 86.

// --- Section 9: pit before the finish, cols 90-93 empty with a pit trigger below ----------------
fillFloor(94, 99);

const objects = [
  { id: 1, type: 'spawn', x: 3 * TILE, y: FLOOR_ROW * TILE, width: 0, height: 0, properties: [{ name: 'facing', type: 'int', value: 1 }] },
  {
    id: 2,
    type: 'packstone',
    x: 20 * TILE,
    y: FLOOR_ROW * TILE,
    width: 0,
    height: 0,
    properties: [
      { name: 'checkpointId', type: 'string', value: 'gym-cp1' },
      { name: 'spawnFacing', type: 'int', value: 1 },
    ],
  },
  {
    id: 3,
    type: 'packstone',
    x: 86 * TILE,
    y: FLOOR_ROW * TILE,
    width: 0,
    height: 0,
    properties: [
      { name: 'checkpointId', type: 'string', value: 'gym-cp2' },
      { name: 'spawnFacing', type: 'int', value: 1 },
    ],
  },
  {
    id: 4,
    type: 'stone',
    x: 55 * TILE,
    y: (FLOOR_ROW - 1) * TILE,
    width: 0,
    height: 0,
    properties: [
      { name: 'order', type: 'int', value: 1 },
      { name: 'kind', type: 'string', value: 'path' },
      { name: 'skin', type: 'string', value: 'moon' },
    ],
  },
  {
    id: 5,
    type: 'trigger',
    x: 90 * TILE,
    y: (FLOOR_ROW + 1) * TILE,
    width: 4 * TILE,
    height: 2 * TILE,
    properties: [{ name: 'flag', type: 'string', value: 'pit' }],
  },
  {
    id: 6,
    type: 'platform',
    name: 'swinging-creeper-1',
    x: 71 * TILE,
    y: 4 * TILE,
    width: 0,
    height: 0,
    properties: [
      { name: 'path', type: 'string', value: 'swing-1' },
      { name: 'speedPxS', type: 'int', value: 0 },
      { name: 'flags', type: 'string', value: 'swing' },
      { name: 'periodS', type: 'float', value: 1.66 },
    ],
  },
  {
    id: 7,
    type: 'platform',
    name: 'crumble-1',
    x: 80 * TILE,
    y: FLOOR_ROW * TILE,
    width: 4 * TILE,
    height: TILE,
    properties: [
      { name: 'path', type: 'string', value: 'crumble-1' },
      { name: 'speedPxS', type: 'int', value: 0 },
      { name: 'flags', type: 'string', value: 'crumble' },
    ],
  },
  {
    id: 8,
    type: 'enemy',
    name: 'langur-1',
    x: 40 * TILE,
    y: FLOOR_ROW * TILE,
    width: 0,
    height: 0,
    properties: [
      { name: 'entry', type: 'int', value: 1 },
      { name: 'patrolLeft', type: 'int', value: 38 * TILE },
      { name: 'patrolRight', type: 'int', value: 42 * TILE },
      { name: 'facing', type: 'int', value: -1 },
    ],
  },
];

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
  nextobjectid: 9,
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

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/maps/gym.tmj');
writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${outPath}`);
