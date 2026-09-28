import Phaser from 'phaser';

interface LoadingSceneData {
  levelId: string;
}

/** Loads a level's tilemap on demand (the menu flow doesn't know which level until now), then starts Play+Hud. */
export class LoadingScene extends Phaser.Scene {
  private levelId!: string;

  constructor() {
    super('Loading');
  }

  init(data: LoadingSceneData): void {
    this.levelId = data.levelId;
  }

  preload(): void {
    if (!this.cache.tilemap.exists(`map-${this.levelId}`)) {
      this.load.tilemapTiledJSON(`map-${this.levelId}`, `game/maps/${this.levelId}.tmj`);
    }
  }

  create(): void {
    this.registry.set('levelId', this.levelId);
    this.scene.start('Play', { levelId: this.levelId });
    this.scene.launch('Hud', { levelId: this.levelId });
  }
}
