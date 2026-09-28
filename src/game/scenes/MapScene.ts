import Phaser from 'phaser';
import { Translator } from '../systems/locale';
import type { SaveSlotData } from '../logic/save/save';
import { TIERS } from '../data/tiers';

/**
 * Storybook map (GDD §11.3-11.4), reduced to its Zone 1 page: the M2 vertical slice has only
 * L1, so the cover, the other three zone pages, the last page and the back cover are a should
 * item left for M4 content-complete (GDD §12.3 M4), not a real gap in this slice.
 */
export class MapScene extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator;
    const slot = this.registry.get('slotData') as SaveSlotData;
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.add.text(cx, 30, translator.t('zone.z1'), { fontFamily: 'monospace', fontSize: '14px', color: '#f2e94e' }).setOrigin(0.5);
    this.add.text(cx, cy - 10, translator.t('card.l1.map'), {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#f2e9d8',
      align: 'center',
      wordWrap: { width: this.cameras.main.width - 32 },
    }).setOrigin(0.5);

    const stoneCount = slot.stoneFlags.filter(Boolean).length;
    this.add.text(cx, cy + 40, `${translator.t('level.l1.title')}  ${stoneCount}/15`, { fontFamily: 'monospace', fontSize: '10px', color: '#c9b458' }).setOrigin(0.5);

    const prompt = this.add.text(cx, this.cameras.main.height - 16, translator.t('card.skipPrompt'), { fontFamily: 'monospace', fontSize: '8px', color: '#8a8272' });
    prompt.setOrigin(0.5);

    const enter = () => {
      const quotaLine = translator.t('tier.questOf', { quota: TIERS[slot.tier].quota });
      this.scene.start('Card', {
        titleKey: 'level.l1.title',
        lines: [translator.t('card.l1.intro'), quotaLine],
        nextScene: 'Loading',
        nextSceneData: { levelId: 'l1' },
      });
    };
    // Phaser's keyboard plugin is disabled game-wide (config.ts); listen on window instead.
    window.addEventListener('keydown', enter);
    this.input.on('pointerdown', enter);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', enter));
  }
}
