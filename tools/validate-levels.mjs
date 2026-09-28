#!/usr/bin/env -S node --experimental-strip-types
/**
 * Fails the build if any public/game/maps/*.tmj is invalid (PLAN.md §5.1 "Validation").
 * Reuses the real parser (src/game/logic/level/levelData.ts) so there is one source of truth
 * for the map contract, run here under Node's TypeScript type-stripping (erasable syntax only;
 * no enums or namespaces are used in that file, so plain `node` on Node >=22.6 can load it
 * directly with --experimental-strip-types, and unflagged on newer Node runtimes).
 *
 * Usage: node --experimental-strip-types tools/validate-levels.mjs
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLevel } from '../src/game/logic/level/levelData.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mapsDir = path.join(repoRoot, 'public/game/maps');

let mapFiles = [];
try {
  mapFiles = readdirSync(mapsDir).filter((f) => f.endsWith('.tmj'));
} catch {
  console.log('No public/game/maps directory yet; nothing to validate.');
  process.exit(0);
}

if (mapFiles.length === 0) {
  console.log('No .tmj maps found; nothing to validate.');
  process.exit(0);
}

let failed = false;
for (const file of mapFiles) {
  const fullPath = path.join(mapsDir, file);
  try {
    const raw = JSON.parse(readFileSync(fullPath, 'utf-8'));
    const definition = parseLevel(raw);
    console.log(`OK  ${file}  (${definition.widthTiles}x${definition.heightTiles} tiles, ${definition.stones.length} stones, ${definition.packstones.length} pack-stones)`);
  } catch (err) {
    failed = true;
    console.error(`FAIL  ${file}: ${err.message}`);
  }
}

if (failed) {
  console.error('\nLevel validation failed.');
  process.exit(1);
}

console.log(`\n${mapFiles.length} level(s) validated.`);
