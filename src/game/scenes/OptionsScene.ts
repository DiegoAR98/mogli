import Phaser from 'phaser';
import { SimpleMenu, type MenuItem } from './menu/SimpleMenu';
import { Translator, type LocaleId } from '../systems/locale';
import type { SaveStore } from '../systems/save';
import { saveSettings, type Settings } from '../systems/settings';
import { touchButtonLayout, type TouchPreset } from '../data/touchLayout';

interface OptionsSceneData {
  returnScene: string;
}

/**
 * Options (GDD §11.4): audio, video, controls, assist, retro, language, copy diagnostics. No
 * audio exists yet (M2 audio content is deferred, see DECISIONS.md), so the audio rows are
 * omitted rather than faked; keyboard/gamepad remapping is a should item left for a later
 * milestone (GDD lists it, but a full rebind UI is out of this slice's scope).
 */
export class OptionsScene extends Phaser.Scene {
  private menu?: SimpleMenu;
  private returnScene!: string;

  constructor() {
    super('Options');
  }

  init(data: OptionsSceneData): void {
    this.returnScene = data.returnScene;
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator;
    const store = this.registry.get('saveStore') as SaveStore;
    const settings = this.registry.get('settings') as Settings;
    const cx = this.cameras.main.width / 2;

    this.add.text(cx, 12, translator.t('options.title'), { fontFamily: 'monospace', fontSize: '12px', color: '#f2e94e' }).setOrigin(0.5);

    const persist = () => saveSettings(store, settings);
    const onOff = (key: 'en' | 'pt-BR' | boolean) => (typeof key === 'boolean' ? translator.t(key ? 'common.on' : 'common.off') : key);

    const items: MenuItem[] = [
      {
        label: `${translator.t('options.language')}: ${settings.locale ?? translator.locale}`,
        onSelect: () => {
          const next: LocaleId = translator.locale === 'en' ? 'pt-BR' : 'en';
          translator.setLocale(next);
          settings.locale = next;
          this.registry.set('locale', next);
          persist();
          this.scene.restart({ returnScene: this.returnScene });
        },
      },
      { label: `${translator.t('options.retro')}: ${onOff(settings.mode === 'retro')}`, onSelect: () => this.toggleMode(settings, persist) },
      { label: `Shake: ${settings.shakePercent}%`, onSelect: () => this.cycleShake(settings, persist) },
      { label: `${translator.t('assist.invincibility')}: ${onOff(settings.assist.invincibility)}`, onSelect: () => this.toggleAssist(settings, 'invincibility', persist) },
      { label: `${translator.t('assist.infiniteClods')}: ${onOff(settings.assist.infiniteClods)}`, onSelect: () => this.toggleAssist(settings, 'infiniteClods', persist) },
      { label: `${translator.t('assist.chilEverywhere')}: ${onOff(settings.assist.chilEverywhere)}`, onSelect: () => this.toggleAssist(settings, 'chilEverywhere', persist) },
      { label: `Touch: ${settings.touchPreset}`, onSelect: () => this.cycleTouchPreset(settings, persist) },
      { label: translator.t('options.copyDiagnostics'), onSelect: () => this.copyDiagnostics(settings, translator) },
      { label: translator.t('options.back'), onSelect: () => this.scene.start(this.returnScene) },
    ];

    this.menu = new SimpleMenu(this, items, 12, 30, 12);
  }

  private toggleMode(settings: Settings, persist: () => void): void {
    settings.mode = settings.mode === 'retro' ? 'modern' : 'retro';
    persist();
    this.scene.restart({ returnScene: this.returnScene });
  }

  private cycleShake(settings: Settings, persist: () => void): void {
    settings.shakePercent = settings.shakePercent === 100 ? 50 : settings.shakePercent === 50 ? 0 : 100;
    persist();
    this.scene.restart({ returnScene: this.returnScene });
  }

  private toggleAssist(settings: Settings, key: 'invincibility' | 'infiniteClods' | 'chilEverywhere', persist: () => void): void {
    settings.assist[key] = !settings.assist[key];
    persist();
    this.scene.restart({ returnScene: this.returnScene });
  }

  private cycleTouchPreset(settings: Settings, persist: () => void): void {
    const order: TouchPreset[] = ['compact', 'wide'];
    settings.touchPreset = order[(order.indexOf(settings.touchPreset) + 1) % order.length];
    void touchButtonLayout(settings.touchPreset); // validated shape; the live control layer re-reads settings on its own
    persist();
    this.scene.restart({ returnScene: this.returnScene });
  }

  private copyDiagnostics(settings: Settings, translator: Translator): void {
    const diagnostics = { locale: translator.locale, settings, buildId: __BUILD_ID__, userAgent: navigator.userAgent };
    navigator.clipboard?.writeText(JSON.stringify(diagnostics, null, 2)).catch(() => {});
  }

  update(): void {
    this.menu?.pollGamepad();
  }
}
