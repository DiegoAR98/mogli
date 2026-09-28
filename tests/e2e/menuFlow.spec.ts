import { expect, test } from '@playwright/test';

/**
 * The M2 menu flow (GDD §11.3): Title -> Save slots -> Tier pick -> Map -> the level intro
 * card -> Play, with no ?level= shortcut this time. Exercises every new scene wired in
 * src/main.ts end to end, on a fresh (no prior save) run.
 */
test('the full menu flow reaches L1 from a fresh boot', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/');
  await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 15000 });

  const sceneKeys = () =>
    page.evaluate(() => (window as unknown as { __game: Phaser.Game }).__game.scene.getScenes(true).map((s) => s.scene.key));

  await expect.poll(sceneKeys).toContain('Title');

  await page.keyboard.press('Space'); // past the device prompt, into the menu
  await page.waitForTimeout(150);
  await page.keyboard.press('Enter'); // New Game (no slot exists yet, so this is the only item besides Options/Language)
  await expect.poll(sceneKeys).toEqual(['SaveSlot']);

  await page.keyboard.press('Enter'); // slot 1, empty -> Tier pick
  await expect.poll(sceneKeys).toEqual(['TierPick']);

  await page.keyboard.press('Enter'); // Cub
  await expect.poll(sceneKeys).toEqual(['Map']);

  await page.keyboard.press('Enter'); // -> intro Card
  await expect.poll(sceneKeys).toEqual(['Card']);

  await page.waitForTimeout(1100); // Card is skippable only after 1 s
  await page.keyboard.press('Enter'); // -> Loading -> Play + Hud
  await expect.poll(sceneKeys, { timeout: 5000 }).toEqual(['Play', 'Hud']);

  const hudInfo = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { getHudInfo(): { quotaValue: number } };
    return scene.getHudInfo();
  });
  expect(hudInfo.quotaValue).toBe(8); // Cub tier quota (GDD §9.7)

  expect(consoleErrors).toEqual([]);
});
