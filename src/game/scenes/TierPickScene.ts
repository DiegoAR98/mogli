import Phaser from 'phaser';
import { SimpleMenu } from './menu/SimpleMenu';
import { Translator } from '../systems/locale';
import type { SaveStore } from '../systems/save';
import { newSlot } from '../logic/save/save';
import { TIERS, type TierId } from '../data/tiers';
import type { Settings } from '../systems/settings';

/** Tier pick at New Game (GDD §9.7, §11.3): Cub / Wolf / Lone Wolf, one-line descriptions. */
export class TierPickScene extends Phaser.Scene {
  private menu?: SimpleMenu;

  constructor() {
    super('TierPick');
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator;
    const store = this.registry.get('saveStore') as SaveStore;
    const settings = this.registry.get('settings') as Settings;
    const cx = this.cameras.main.width / 2;

    this.add.text(cx, 20, translator.t('tier.pickTitle'), { fontFamily: 'monospace', fontSize: '12px', color: '#f2e94e' }).setOrigin(0.5);

    const tierOrder: TierId[] = ['cub', 'wolf', 'loneWolf'];
    const descKeys = { cub: 'tier.cubDesc', wolf: 'tier.wolfDesc', loneWolf: 'tier.loneWolfDesc' } as const;
    const nameKeys = { cub: 'tier.cub', wolf: 'tier.wolf', loneWolf: 'tier.loneWolf' } as const;

    const items = tierOrder.map((tierId) => {
      const quotaLine = translator.t('tier.questOf', { quota: TIERS[tierId].quota });
      return {
        label: `${translator.t(nameKeys[tierId])} (${quotaLine}) -- ${translator.t(descKeys[tierId])}`,
        onSelect: () => this.pick(tierId, store, settings),
      };
    });

    this.menu = new SimpleMenu(this, items, 12, 50, 20);
  }

  private pick(tierId: TierId, store: SaveStore, settings: Settings): void {
    const slotIndex = this.registry.get('slotIndex') as number;
    const slot = newSlot('l1', tierId, settings.mode, new Date().toISOString());
    store.saveSlot(slotIndex, slot);
    this.registry.set('tier', tierId);
    this.registry.set('slotData', slot);
    this.scene.start('Map');
  }

  update(): void {
    this.menu?.pollGamepad();
  }
}
