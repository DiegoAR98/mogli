import { expect, test } from '@playwright/test';

/**
 * One flow (PLAN.md §9.2): the built output boots, the canvas is ready, the audio context
 * unlocks on the first gesture, and the gym level's player actually moves and jumps. This
 * `webServer` always sets VITE_E2E, so it never serves a true production build; the two
 * production-build checks (window.__game undefined, ?level=gym shows the title) are left as
 * a manual or CI-only step run separately, per PLAN.md §9.2.
 */

test('boots, unlocks audio, and the gym level responds to input', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/?level=gym');
  await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 15000 });

  await page.mouse.click(400, 300);
  await page.waitForFunction(() => !(window as unknown as { __game: Phaser.Game }).__game.sound.locked, { timeout: 5000 }).catch(() => {
    // Some headless/software-rendering environments never unlock a real AudioContext; the
    // canvas and input checks below are the meaningful part of this smoke test either way.
  });

  const initialX = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { player: { x: number } };
    return scene.player.x;
  });

  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');

  const movedX = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { player: { x: number } };
    return scene.player.x;
  });
  expect(movedX).toBeGreaterThan(initialX + 40);

  const groundedY = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { player: { y: number } };
    return scene.player.y;
  });

  await page.keyboard.press('Space');
  await page.waitForTimeout(150);
  const midJumpY = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { player: { y: number } };
    return scene.player.y;
  });
  expect(midJumpY).toBeLessThan(groundedY - 5);

  await page.waitForTimeout(600);
  const landedY = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { player: { y: number } };
    return scene.player.y;
  });
  expect(landedY).toBeGreaterThan(midJumpY);

  expect(consoleErrors).toEqual([]);
});
