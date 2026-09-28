#!/usr/bin/env node
/**
 * Writes public/game/tilesets/gym-graybox.png: a 2-tile, 16x16 px tileset (tile 1 = ground,
 * tile 2 = climbable creeper) as flat PNG bytes via zlib, with no image-editing tool involved
 * (PLAN.md §8.1 phase 0 gray-box). Regenerate with: node tools/gen-graybox-tileset.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TILE = 16;
const COLUMNS = 2;
const WIDTH = TILE * COLUMNS;
const HEIGHT = TILE;

// Seeonee-40-adjacent placeholder colors (final art replaces this whole file, PLAN.md §8.1).
const GROUND_RGBA = [0x2f, 0x4a, 0x2a, 0xff]; // dark teak-green: ground (collides)
const CREEPER_RGBA = [0xd8, 0xa6, 0x57, 0xff]; // ochre: climbable creeper

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

// Raw scanlines: filter byte 0 (None) + WIDTH * RGBA bytes, per row.
const raw = Buffer.alloc(HEIGHT * (1 + WIDTH * 4));
let offset = 0;
for (let y = 0; y < HEIGHT; y++) {
  raw[offset++] = 0; // filter: None
  for (let x = 0; x < WIDTH; x++) {
    const col = Math.floor(x / TILE);
    const [r, g, b, a] = col === 0 ? GROUND_RGBA : CREEPER_RGBA;
    raw[offset++] = r;
    raw[offset++] = g;
    raw[offset++] = b;
    raw[offset++] = a;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type: RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter method
ihdr[12] = 0; // interlace

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const png = Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public/game/tilesets/gym-graybox.png');
writeFileSync(outPath, png);
console.log(`Wrote ${outPath} (${png.length} bytes)`);
