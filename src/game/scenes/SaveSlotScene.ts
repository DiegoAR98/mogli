import Phaser from 'phaser';
import { SimpleMenu } from './menu/SimpleMenu';
import { Translator } from '../systems/locale';
import type { SaveStore } from '../systems/save';
import { t as translate } from '../i18n/translate';
import { en } from '../i18n/en';
import { ptBR } from '../i18n/pt-BR';
import type { DictKey } from '../i18n/en';
import type { TierId } from '../data/tiers';

const TIER_KEYS: Record<TierId, DictKey> = { cub: 'tier.cub', wolf: 'tier.wolf', loneWolf: 'tier.loneWolf' };

/** Save slots (GDD §9.5, §11.4): 3 slots, each showing tier, zone and moon-stone total. */
export class SaveSlotScene extends Phaser.Scene {
  private menu?: SimpleMenu;

  constructor() {
    super('SaveSlot');
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator;
    const store = this.registry.get('saveStore') as SaveStore;
    const cx = this.cameras.main.width / 2;

    this.add.text(cx, 20, translator.t('saveSlot.title'), { fontFamily: 'monospace', fontSize: '12px', color: '#f2e94e' }).setOrigin(0.5);

    const slots = store.loadAllSlots();
    const dict = translator.locale === 'en' ? en : ptBR;
    const items = slots.map((slot, index) => {
      if (!slot) {
        return { label: `${index + 1}. ${translator.t('saveSlot.empty')}`, onSelect: () => this.pickSlot(index, null) };
      }
      const stoneCount = slot.stoneFlags.filter(Boolean).length;
      const stonesLabel = translate(dict, translator.locale, 'saveSlot.stonesCount', { count: stoneCount });
      const tierKey = TIER_KEYS[slot.tier];
      return {
        label: `${index + 1}. ${translator.t(tierKey)} - ${translator.t('zone.z1')} - ${stonesLabel}`,
        onSelect: () => this.pickSlot(index, slot),
      };
    });

    this.menu = new SimpleMenu(this, items, 20, 40, 16);
  }

  private pickSlot(index: number, existing: import('../logic/save/save').SaveSlotData | null): void {
    this.registry.set('slotIndex', index);
    if (existing) {
      this.registry.set('slotData', existing);
      this.registry.set('tier', existing.tier);
      this.scene.start('Map');
    } else {
      this.scene.start('TierPick');
    }
  }

  update(): void {
    this.menu?.pollGamepad();
  }
}
