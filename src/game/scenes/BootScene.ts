import Phaser from 'phaser';

/**
 * Loads the shared gray-box tileset and the level named by ?level= (default "gym"), then
 * starts PlayScene with HudScene running alongside it (PLAN.md §3.2, §3.6, §7.4).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level') ?? 'gym';
    this.registry.set('levelId', levelId);

    this.load.image('gym-graybox', 'game/tilesets/gym-graybox.png');
    this.load.tilemapTiledJSON(`map-${levelId}`, `game/maps/${levelId}.tmj`);
  }

  create(): void {
    this.physics.world.TILE_BIAS = 16;
    const levelId = this.registry.get('levelId') as string;
    this.scene.start('Play', { levelId });
    this.scene.launch('Hud', { levelId });
    this.game.canvas.dataset.ready = '1';
  }
}
