#!/usr/bin/env node
/**
 * T05 (PLAN.md §9.4): drives the gym level's player over its first 4-tile (0.75x) gap with a
 * well-timed, fully-held jump from the platform edge, and reports whether it's cleared. This
 * is the automated substitute, in an environment with no human tester or GUI, for "play it and
 * see": it drove the M0 finding that a jump held for less than the 0.35 s time-to-apex (a tap)
 * falls well short, while a jump taken right at the edge and held for the full rise clears the
 * gap with margin (~230 px landing, 6 px past the required 224 px edge) -- see docs/DECISIONS.md.
 *
 * Requires the dev server running (npm run dev, default http://localhost:8080) and the
 * sandbox's pre-installed Chromium at /opt/pw-browsers/chromium (or set CHROMIUM_PATH).
 *
 * Usage: npm run dev &   then   node tools/verify-gap-reach.mjs
 */

import { chromium } from 'playwright-core';

const DEV_SERVER_URL = process.env.DEV_SERVER_URL ?? 'http://localhost:8080';
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

const browser = await chromium.launch({ executablePath, args: ['--use-gl=swiftshader'] });
const page = await browser.newPage();
await page.goto(`${DEV_SERVER_URL}/?level=gym`);
await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 15000 });
await page.mouse.click(400, 300);
await page.waitForTimeout(200);

async function getDebug() {
  return page.evaluate(() => {
    const scene = window.__game.scene.getScene('Play');
    const body = scene.player.body;
    return { x: scene.player.x, y: scene.player.y, blockedDown: body.blocked.down, deaths: scene.deaths };
  });
}

// The first gap (0.75x, 4 tiles = 64 px) runs from x=160 to x=224 (cols 10-13, gym.tmj).
const PLATFORM_EDGE_X = 158;
const LANDING_CONFIRMED_X = 230;
const JUMP_HOLD_MS = 370; // >= JUMP_TIME_TO_APEX_S (0.35 s) for the full 56 px / 3.5-tile arc

await page.keyboard.down('ArrowRight');
let jumped = false;
let verdict = 'inconclusive (timed out)';

for (let i = 0; i < 200; i++) {
  await page.waitForTimeout(16);
  const d = await getDebug();

  if (!jumped && d.x >= PLATFORM_EDGE_X && d.blockedDown) {
    await page.keyboard.down('Space');
    jumped = true;
    void page.waitForTimeout(JUMP_HOLD_MS).then(() => page.keyboard.up('Space'));
    console.log(`Jumped (held) at x=${d.x.toFixed(1)}`);
  }

  if (d.deaths > 0) {
    verdict = `FAILED: fell into the gap (respawned), last x before the fall was near ${d.x.toFixed(1)}`;
    break;
  }
  if (jumped && d.x > LANDING_CONFIRMED_X) {
    verdict = `CLEARED: landed at x=${d.x.toFixed(1)} (${((d.x - PLATFORM_EDGE_X) / 16).toFixed(2)} tiles of travel from takeoff)`;
    break;
  }
}

await page.keyboard.up('ArrowRight');
console.log(verdict);
await browser.close();
process.exit(verdict.startsWith('CLEARED') ? 0 : 1);
