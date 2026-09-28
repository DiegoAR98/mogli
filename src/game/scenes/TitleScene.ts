import Phaser from 'phaser';
import { SimpleMenu } from './menu/SimpleMenu';
import { Translator, type LocaleId } from '../systems/locale';
import type { SaveStore } from '../systems/save';

/** Title screen (GDD §11.3-11.4): wordmark, attribution line, device prompt, then the menu. */
export class TitleScene extends Phaser.Scene {
  private menu?: SimpleMenu;
  private awaitingGesture = true;

  constructor() {
    super('Title');
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator;
    const store = this.registry.get('saveStore') as SaveStore;
    const cx = this.cameras.main.width / 2;

    this.add.text(cx, 40, translator.t('title.wordmark'), { fontFamily: 'monospace', fontSize: '20px', color: '#f2e94e' }).setOrigin(0.5);

    const attribution = this.add.text(cx, this.cameras.main.height - 10, translator.t('boot.attribution'), {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#8a8272',
      align: 'center',
      wordWrap: { width: this.cameras.main.width - 16 },
    });
    attribution.setOrigin(0.5);

    const prompt = this.add.text(cx, 90, translator.t('title.pressAnyKey'), { fontFamily: 'monospace', fontSize: '10px', color: '#f2e9d8' });
    prompt.setOrigin(0.5);

    const onGesture = () => {
      if (!this.awaitingGesture) return;
      this.awaitingGesture = false;
      prompt.destroy();
      this.showMenu(translator, store, cx);
    };
    // Phaser's keyboard plugin is disabled game-wide (config.ts); listen on window instead.
    window.addEventListener('keydown', onGesture);
    this.input.on('pointerdown', onGesture);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', onGesture));
  }

  private showMenu(translator: Translator, store: SaveStore, cx: number): void {
    const hasAnySlot = store.loadAllSlots().some((s) => s !== null);
    const items = [
      ...(hasAnySlot ? [{ label: translator.t('title.continue'), onSelect: () => this.scene.start('SaveSlot') }] : []),
      { label: translator.t('title.newGame'), onSelect: () => this.scene.start('SaveSlot') },
      { label: translator.t('title.options'), onSelect: () => this.scene.start('Options', { returnScene: 'Title' }) },
      { label: translator.t('title.language'), onSelect: () => this.toggleLanguage(translator) },
    ];
    this.menu = new SimpleMenu(this, items, cx - 40, 100);
  }

  private toggleLanguage(translator: Translator): void {
    const next: LocaleId = translator.locale === 'en' ? 'pt-BR' : 'en';
    translator.setLocale(next);
    this.registry.set('locale', next);
    this.scene.restart();
  }

  update(): void {
    this.menu?.pollGamepad();
  }
}
