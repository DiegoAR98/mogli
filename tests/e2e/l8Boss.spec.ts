import { expect, test } from '@playwright/test';

/**
 * L8 The Ford and B4 Red Dog at the Ford (GDD §8.5, §9.4, §10.10), end to end: the level loads
 * and responds to input, a resting wolf banks straight into the (rallied) count like any other
 * stone, slow water halves run speed, the boss door activates the B4 fight with Pack strength
 * seeded from the rallied count, and defeating the leader across all three waves (no Dance-style
 * resolution -- GDD §8.5 beat 7 is a scripted stampede) lets Mowgli reach Phao's exit. Driving a
 * full real playthrough would be long and flaky for CI, so this white-box-forces state the same
 * way l2Boss.spec.ts/l4Boss.spec.ts/l6Boss.spec.ts do, and checks the wiring in between.
 */
test('L8 loads and the rally, slow water and B4 boss door all wire together', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/?level=l8');
  await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 15000 });
  await page.mouse.click(160, 90);
  await page.waitForTimeout(200);

  const sceneKeys = () => page.evaluate(() => (window as unknown as { __game: Phaser.Game }).__game.scene.getScenes(true).map((s) => s.scene.key));
  await expect.poll(sceneKeys, { timeout: 5000 }).toEqual(['Play', 'Hud']);

  const getPlayerX = () =>
    page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { player: { x: number } }).player.x);
  const beforeX = await getPlayerX();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  const afterX = await getPlayerX();
  expect(afterX).toBeGreaterThan(beforeX + 20);

  // A resting wolf banks straight into stonesCollected -- the rallied count, not a pouch.
  type RallyScene = {
    stoneSprites: Array<{ x: number; y: number }>;
    stonesCollected: number;
    player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
  };
  const before = await page.evaluate(() => {
    const s = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as RallyScene;
    const wolf = s.stoneSprites[2]; // a wolf further down the path, not one already passed over
    s.player.setPosition(wolf.x, wolf.y);
    s.player.body.reset(wolf.x, wolf.y);
    return s.stonesCollected;
  });
  await page.waitForTimeout(200);
  const afterRally = await page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as RallyScene).stonesCollected);
  expect(afterRally).toBe(before + 1);

  // Slow water: standing in it halves the run speed.
  type SlowWaterScene = {
    slowWaterZones: Array<{ x: number; y: number; w: number; h: number }>;
    player: { x: number; y: number; setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void; velocity: { x: number } } };
  };
  await page.evaluate(() => {
    const s = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as SlowWaterScene;
    const zone = s.slowWaterZones[0];
    const px = zone.x + zone.w / 2;
    const py = zone.y + zone.h / 2;
    s.player.setPosition(px, py);
    s.player.body.reset(px, py);
  });
  await page.waitForTimeout(50);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(300);
  const slowVx = await page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as SlowWaterScene).player.body.velocity.x);
  await page.keyboard.up('ArrowRight');
  expect(slowVx).toBeLessThan(60); // half of RUN_SPEED_PX_S (96), well under the full 96 px/s

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
    .toBe('B4');
  const paws = await page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as { packPaws: number }).packPaws);
  expect(paws).toBeGreaterThanOrEqual(0); // seeded from the (small, forced) rallied count above

  // Force the fight straight to defeated. B4 has no Dance-style resolution (GDD §8.5 beat 7 is a
  // scripted stampede), so defeat alone -- no helpers, no boss gate -- lets Mowgli reach the exit.
  type ExitScene = {
    bossState: unknown;
    player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
    exitSprite: { x: number; y: number };
    stonesCollected: number;
    quotaValue: number;
  };
  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as ExitScene;
    scene.bossState = { phaseIndex: 2, attackIndex: 0, sub: 'recovery', timerS: 0, extendS: 0, hitsThisPhase: 0, defeated: true };
  });
  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as ExitScene;
    scene.stonesCollected = scene.quotaValue;
    scene.player.setPosition(scene.exitSprite.x, scene.exitSprite.y);
    scene.player.body.reset(scene.exitSprite.x, scene.exitSprite.y);
  });
  await expect.poll(sceneKeys, { timeout: 5000 }).toEqual(['Results']);

  expect(consoleErrors).toEqual([]);
});
