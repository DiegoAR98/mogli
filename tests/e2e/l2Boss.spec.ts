import { expect, test } from '@playwright/test';

/**
 * L2 Cold Lairs and B1 The Flung Festoon (GDD §10.4, §8.2), end to end: the level loads and
 * responds to input, the boss door activates the fight, defeating the boss unlocks the
 * Bagheera/Baloo holds, completing both opens the boss gate, and touching Kaa (at quota) ends
 * the level at the Results scene. Driving a full real playthrough (real gates, real cobras,
 * real swing timing) would be long and flaky for CI, so this white-box-forces the boss/quota
 * state the same way M3.1's own manual verification did, and checks the wiring in between.
 */
test('L2 loads and the B1 boss door, victory and Kaa exit all wire together', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/?level=l2');
  await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 15000 });
  await page.mouse.click(160, 90);
  await page.waitForTimeout(200);

  const sceneKeys = () => page.evaluate(() => (window as unknown as { __game: Phaser.Game }).__game.scene.getScenes(true).map((s) => s.scene.key));

  // L2 opens with the kidnap-carry card (a one-shot 'card' trigger at spawn, GDD §10.4).
  await expect.poll(sceneKeys).toContain('Card');
  await page.waitForTimeout(1100);
  await page.keyboard.press('Space'); // not Enter/Escape, which are also bound to Pause
  await expect.poll(sceneKeys, { timeout: 5000 }).toEqual(['Play', 'Hud']);

  const getPlayerX = () =>
    page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { player: { x: number } }).player.x);
  const beforeX = await getPlayerX();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  const afterX = await getPlayerX();
  expect(afterX).toBeGreaterThan(beforeX + 20);

  // Force the boss door to activate (skips the traversal a full playthrough would need).
  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as {
      bossDoorZone: { x: number; y: number; w: number; h: number };
      player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
    };
    const z = scene.bossDoorZone;
    scene.player.setPosition(z.x + z.w / 2, z.y + z.h / 2);
    scene.player.body.reset(z.x + z.w / 2, z.y + z.h / 2);
  });
  await expect
    .poll(() => page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { bossActive: boolean }).bossActive))
    .toBe(true);

  // Force the fight straight to defeated (BossMachine's own phase/hit logic has 9 dedicated
  // unit tests; this checks PlayScene's wiring around it, not the state machine itself).
  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { bossState: unknown };
    scene.bossState = { phaseIndex: 2, attackIndex: 0, sub: 'recovery', timerS: 0, extendS: 0, hitsThisPhase: 0, defeated: true };
  });

  type HelperScene = {
    bossHelpers: Array<{ sprite: { x: number; y: number } }>;
    bossGates: Array<{ opened: boolean }>;
    player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
    exitSprite: { x: number; y: number };
    stonesCollected: number;
    quotaValue: number;
  };

  for (let i = 0; i < 2; i++) {
    const pos = await page.evaluate((index) => {
      const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as HelperScene;
      const helper = scene.bossHelpers[index];
      const px = helper.sprite.x - 12;
      const py = helper.sprite.y;
      scene.player.setPosition(px, py);
      scene.player.body.reset(px, py);
      return { px, py };
    }, i);
    await page.waitForTimeout(100);
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(2200); // the 2 s hold (GDD §8.2 beat 7) plus margin
    await page.keyboard.up('ArrowDown');
    expect(pos.px).toBeGreaterThan(0);
  }

  await expect
    .poll(() => page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as HelperScene).bossGates.every((g) => g.opened)))
    .toBe(true);

  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as HelperScene;
    scene.stonesCollected = scene.quotaValue;
    scene.player.setPosition(scene.exitSprite.x, scene.exitSprite.y);
    scene.player.body.reset(scene.exitSprite.x, scene.exitSprite.y);
  });
  await expect.poll(sceneKeys, { timeout: 5000 }).toEqual(['Results']);

  expect(consoleErrors).toEqual([]);
});
