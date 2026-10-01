import { expect, test } from '@playwright/test';

/**
 * L6 King's Treasure and B3 Thuu, the White Hood (GDD §9.3, §10.8, §8.4), end to end: the level
 * loads and responds to input, a jewel goes into the pouch (not straight to the count) and only
 * banks at the altar, Thuu's gate (an altarGate) opens once the (banked) quota is met, the boss
 * door activates the B3 fight, and defeating Thuu plus holding the plate for 2 s lets Mowgli
 * reach Thuu's exit. Driving a full real playthrough would be long and flaky for CI, so this
 * white-box-forces state the same way l2Boss.spec.ts/l4Boss.spec.ts do, and checks the wiring
 * in between.
 */
test("L6 loads and the pouch/altar, Thuu's gate and B3 boss door all wire together", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/?level=l6');
  await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 15000 });
  await page.mouse.click(160, 90);
  await page.waitForTimeout(200);

  const sceneKeys = () => page.evaluate(() => (window as unknown as { __game: Phaser.Game }).__game.scene.getScenes(true).map((s) => s.scene.key));
  await expect.poll(sceneKeys, { timeout: 5000 }).toEqual(['Play', 'Hud']);

  type PouchScene = {
    stoneSprites: Array<{ x: number; y: number }>;
    stoneStates: Array<{ collected: boolean }>;
    pouchCount: number;
    stonesCollected: number;
    altarSprite: { x: number; y: number } | undefined;
    player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
  };

  // The first jewel (beside the altar) goes into the pouch, not straight to the count.
  const beforeCounts = await page.evaluate(() => {
    const s = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as PouchScene;
    const jewel = s.stoneSprites[0];
    s.player.setPosition(jewel.x, jewel.y);
    s.player.body.reset(jewel.x, jewel.y);
    return { pouchCount: s.pouchCount, stonesCollected: s.stonesCollected };
  });
  expect(beforeCounts.pouchCount).toBe(0);
  await page.waitForTimeout(200);
  const afterPickup = await page.evaluate(() => {
    const s = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as PouchScene;
    return { pouchCount: s.pouchCount, stonesCollected: s.stonesCollected };
  });
  expect(afterPickup.pouchCount).toBe(1);
  expect(afterPickup.stonesCollected).toBe(0);

  // Touching the altar banks the whole pouch.
  await page.evaluate(() => {
    const s = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as PouchScene;
    const altar = s.altarSprite!;
    s.player.setPosition(altar.x, altar.y);
    s.player.body.reset(altar.x, altar.y);
  });
  await expect
    .poll(() => page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as PouchScene).stonesCollected))
    .toBe(1);
  const pouchAfterBank = await page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as PouchScene).pouchCount);
  expect(pouchAfterBank).toBe(0);

  // Force the (banked) quota met and confirm Thuu's altarGate opens.
  type GateScene = {
    quota: { met: boolean };
    stonesCollected: number;
    quotaValue: number;
    altarGates: Array<{ opened: boolean }>;
  };
  await page.evaluate(() => {
    const s = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as GateScene;
    s.stonesCollected = s.quotaValue;
  });
  await expect
    .poll(() => page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as GateScene).altarGates.every((g) => g.opened)), { timeout: 5000 })
    .toBe(true);

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
  await expect
    .poll(() => page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { bossId: string | null }).bossId))
    .toBe('B3');

  // Force the fight straight to defeated, then hold the plate for its 2 s (GDD §8.4 beat 7).
  type VictoryScene = {
    bossState: unknown;
    bossHelpers: Array<{ sprite: { x: number; y: number } }>;
    player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
    exitSprite: { x: number; y: number };
  };
  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as VictoryScene;
    scene.bossState = { phaseIndex: 2, attackIndex: 0, sub: 'recovery', timerS: 0, extendS: 0, hitsThisPhase: 0, defeated: true };
  });
  const platePos = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as VictoryScene;
    const plate = scene.bossHelpers[0];
    const px = plate.sprite.x - 12;
    const py = plate.sprite.y;
    scene.player.setPosition(px, py);
    scene.player.body.reset(px, py);
    return { px, py };
  });
  await page.waitForTimeout(100);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(2200); // the 2 s hold plus margin
  await page.keyboard.up('ArrowDown');
  expect(platePos.px).toBeGreaterThan(0);

  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as VictoryScene;
    scene.player.setPosition(scene.exitSprite.x, scene.exitSprite.y);
    scene.player.body.reset(scene.exitSprite.x, scene.exitSprite.y);
  });
  await expect.poll(sceneKeys, { timeout: 5000 }).toEqual(['Results']);

  expect(consoleErrors).toEqual([]);
});
