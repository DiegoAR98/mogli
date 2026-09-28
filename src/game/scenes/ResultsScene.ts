import Phaser from 'phaser';
import { Translator } from '../systems/locale';

export interface ResultsSceneData {
  stonesCollected: number;
  elapsedS: number;
  deaths: number;
  fullMoon: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Results card (GDD §9.5, §11.2, §11.4): stones x/15, time, deaths, best, Full Moon stamp. */
export class ResultsScene extends Phaser.Scene {
  private sceneData!: ResultsSceneData;
  private ready = false;

  constructor() {
    super('Results');
  }

  init(data: ResultsSceneData): void {
    this.sceneData = data;
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator;
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.add.rectangle(cx, cy, 288, 120, 0x1a1410, 0.95).setStrokeStyle(4, 0xc9b458);
    this.add.text(cx, cy - 45, translator.t('results.title'), { fontFamily: 'monospace', fontSize: '12px', color: '#f2e94e' }).setOrigin(0.5);

    const lines = [
      translator.t('results.stones', { count: this.sceneData.stonesCollected }),
      translator.t('results.time', { time: formatTime(this.sceneData.elapsedS) }),
      translator.t('results.deaths', { count: this.sceneData.deaths }),
    ];
    if (this.sceneData.fullMoon) lines.push(translator.t('hud.fullMoon'));

    this.add.text(cx, cy, lines.join('\n'), { fontFamily: 'monospace', fontSize: '10px', color: '#f2e9d8', align: 'center' }).setOrigin(0.5);
    this.add.text(cx, cy + 45, translator.t('results.continue'), { fontFamily: 'monospace', fontSize: '8px', color: '#8a8272' }).setOrigin(0.5);

    this.time.delayedCall(1000, () => {
      this.ready = true;
    });
    const advance = () => {
      if (!this.ready) return;
      this.scene.stop('Play');
      this.scene.stop('Hud');
      this.scene.start('Title');
    };
    // Phaser's keyboard plugin is disabled game-wide (config.ts); listen on window instead.
    window.addEventListener('keydown', advance);
    this.input.on('pointerdown', advance);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', advance));
  }
}
