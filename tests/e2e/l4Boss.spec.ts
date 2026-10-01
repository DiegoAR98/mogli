import { expect, test } from '@playwright/test';

/**
 * L4 Man-Pack and B2 The Lame One in the Ravine (GDD §10.6, §8.3), end to end: the level loads
 * and responds to input, a hut door opens on a crouch-hold, a nut on the first buffalo sends it
 * advancing and breaks the thorn fence in its way, the boss door activates the B2 fight, and
 * defeating the boss (no Dance resolution for B2, unlike B1 -- GDD §8.3 beat 7 is a scripted
 * stampede, not an interactive hold) lets Mowgli walk straight to Grey Brother's exit. Driving a
 * full real playthrough would be long and flaky for CI, so this white-box-forces state the same
 * way l2Boss.spec.ts does, and checks the wiring in between.
 */
test('L4 loads and the hut door, buffalo fence-break and B2 boss door all wire together', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/?level=l4');
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

  type HutDoorScene = {
    gates: Array<{ x: number; y: number; w: number; h: number; opened: boolean }>;
    player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
  };

  // The first hut door: a 0.25 s crouch-hold, shorter than a Master Words gate's 0.5 s (GDD §10.6).
  const gatePos = await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as HutDoorScene;
    const gate = scene.gates[0];
    const px = gate.x + gate.w / 2;
    const py = gate.y + gate.h / 2;
    scene.player.setPosition(px, py);
    scene.player.body.reset(px, py);
    return { px, py };
  });
  await page.waitForTimeout(100);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(500); // the 0.25 s hold plus margin
  await page.keyboard.up('ArrowDown');
  expect(gatePos.px).toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as HutDoorScene).gates[0].opened))
    .toBe(true);

  // The first buffalo (advanceOnHit, GDD §10.6): a nut sends it charging and breaks the thorn fence.
  type BuffaloScene = {
    carryPlatforms: Array<{ sprite: { x: number; y: number }; advanceOnHit: boolean; advancing: boolean }>;
    fences: Array<{ broken: boolean }>;
    player: { setPosition(x: number, y: number): void; body: { reset(x: number, y: number): void } };
    facing: -1 | 1;
  };
  await page.evaluate(() => {
    const scene = (window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as BuffaloScene;
    const buffalo = scene.carryPlatforms.find((c) => c.advanceOnHit)!;
    const px = buffalo.sprite.x - 20;
    const py = buffalo.sprite.y;
    scene.player.setPosition(px, py);
    scene.player.body.reset(px, py);
    scene.facing = 1;
  });
  await page.waitForTimeout(100);
  await page.keyboard.press('KeyX'); // the throw button (GDD §7.1)
  await expect
    .poll(() => page.evaluate(() => ((window as unknown as { __game: Phaser.Game }).__game.scene.getScene('Play') as unknown as BuffaloScene).fences.some((f) => f.broken)), { timeout: 5000 })
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
    .toBe('B2');

  // Force the fight straight to defeated (BossMachine's own phase/hit logic has 9 dedicated unit
  // tests; this checks PlayScene's wiring around it, not the state machine itself). B2 has no
  // Dance-style resolution (GDD §8.3 beat 7 is a scripted stampede), so defeat alone should let
  // Mowgli walk straight to the exit with no helpers or boss gate in the way.
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
