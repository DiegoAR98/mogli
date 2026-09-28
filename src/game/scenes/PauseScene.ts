import Phaser from 'phaser';
import { SimpleMenu } from './menu/SimpleMenu';
import { Translator } from '../systems/locale';
import type { PlayScene } from './PlayScene';

/** Pause menu (GDD §11.4): Resume, Restart from checkpoint, Assist, Options, Map. */
export class PauseScene extends Phaser.Scene {
  private menu?: SimpleMenu;

  constructor() {
    super('Pause');
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator;
    const cx = this.cameras.main.width / 2;

    this.add.rectangle(cx, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.55).setScrollFactor(0);
    this.add.text(cx, 40, translator.t('pause.title'), { fontFamily: 'monospace', fontSize: '14px', color: '#f2e94e' }).setOrigin(0.5).setScrollFactor(0);

    const items = [
      { label: translator.t('pause.resume'), onSelect: () => this.resume() },
      { label: translator.t('pause.restart'), onSelect: () => this.restart() },
      { label: translator.t('pause.options'), onSelect: () => this.scene.start('Options', { returnScene: 'Pause' }) },
      { label: translator.t('pause.map'), onSelect: () => this.quitToTitle() },
    ];
    this.menu = new SimpleMenu(this, items, cx - 50, 70);
  }

  private resume(): void {
    this.scene.stop('Pause');
    this.scene.resume('Play');
  }

  private restart(): void {
    const play = this.scene.get('Play') as unknown as PlayScene;
    play.restartFromCheckpoint?.();
    this.resume();
  }

  private quitToTitle(): void {
    this.scene.stop('Pause');
    this.scene.stop('Hud');
    this.scene.stop('Play');
    this.scene.start('Title');
  }

  update(): void {
    this.menu?.pollGamepad();
  }
}
