import Phaser from 'phaser';
import type { PlayScene } from './PlayScene';

/**
 * Parallel scene (PLAN.md §3.2 rule 3): reads events and the registry only, never a Phaser
 * body. M1 ships the F3 debug overlay only; the real HUD (leaf pips, counter, cards, touch
 * controls) arrives with M2.
 */
export class HudScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;
  private debugVisible = import.meta.env.DEV || Boolean(import.meta.env.VITE_E2E);
  private f3Handler = (event: KeyboardEvent) => {
    if (event.code === 'F3') this.debugVisible = !this.debugVisible;
  };

  constructor() {
    super('Hud');
  }

  create(): void {
    if (!(import.meta.env.DEV || import.meta.env.VITE_E2E)) return;

    window.addEventListener('keydown', this.f3Handler);
    this.debugText = this.add.text(4, 4, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#f2e9d8',
      backgroundColor: 'rgba(11, 20, 16, 0.7)',
      padding: { x: 2, y: 2 },
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.f3Handler);
    });
  }

  update(): void {
    if (!this.debugText) return;
    this.debugText.setVisible(this.debugVisible);
    if (!this.debugVisible) return;

    const play = this.scene.get('Play') as unknown as PlayScene;
    const info = play.getDebugInfo?.();
    if (!info) return;

    this.debugText.setText(
      [
        `build ${__BUILD_ID__}  F3 toggles`,
        `pos ${info.x},${info.y}  v ${info.vx},${info.vy}`,
        `state ${info.state}`,
        `coyote ${info.coyoteFrames}  buffer ${info.bufferFrames}`,
        `pips ${info.pips}/6  stones ${info.stones}`,
        `deaths ${info.deaths}  cp ${info.checkpoint}`,
      ].join('\n'),
    );
  }
}
