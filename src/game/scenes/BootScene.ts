import Phaser from 'phaser';
import { SaveStore } from '../systems/save';
import { defaultSettings, loadSettings } from '../systems/settings';
import { detectLocale, Translator } from '../systems/locale';

/**
 * Sets up cross-scene state (the save store, settings, the locale/translator) shared through
 * the registry, then either jumps straight into a named level (?level=, the dev/test shortcut
 * that keeps the M1 smoke test and manual iteration working) or starts the real menu flow at
 * the Title screen (GDD §11.3).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.image('gym-graybox', 'game/tilesets/gym-graybox.png');

    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level');
    if (levelId) {
      this.registry.set('levelId', levelId);
      this.load.tilemapTiledJSON(`map-${levelId}`, `game/maps/${levelId}.tmj`);
    }
  }

  create(): void {
    this.physics.world.TILE_BIAS = 16;

    const store = new SaveStore();
    const settings = loadSettings(store);
    const params = new URLSearchParams(window.location.search);
    const locale = detectLocale(navigator.languages ?? [], params.get('lang'), settings.locale);
    const translator = new Translator(locale);

    this.registry.set('saveStore', store);
    this.registry.set('settings', settings);
    this.registry.set('translator', translator);
    this.registry.set('locale', locale);
    this.registry.set('tier', 'wolf');

    const levelId = this.registry.get('levelId') as string | undefined;
    if (levelId) {
      this.scene.start('Play', { levelId });
      this.scene.launch('Hud', { levelId });
    } else {
      this.scene.start('Title');
    }
    this.game.canvas.dataset.ready = '1';
  }
}
