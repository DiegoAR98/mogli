import Phaser from 'phaser';
import { Translator, detectLocale, type LocaleId } from '../systems/locale';
import type { DictKey } from '../i18n/en';

/**
 * S8 card panel (GDD §11.2, §11.4): a 288x120 px panel centered on the 320x180 viewport, used
 * for level intro/exit cards and (with `stats`) the results card. Skippable after 1 s by any
 * button; slides in over 0.2 s. Real art (the Madhubani-style double border) is an M2+ art-pass
 * item; this is the gray-box placeholder frame, same phase as every other M1/M2 rectangle.
 */
export interface CardSceneData {
  titleKey?: DictKey;
  lines: string[];
  stats?: Array<{ labelKey: DictKey; value: string | number }>;
  nextScene: string;
  nextSceneData?: Record<string, unknown>;
  /** 'start' (default) replaces the scene stack; 'resume' un-pauses a caller (in-level card triggers, GDD §10.4's Bird-gate and kidnap-carry fallback). */
  nextAction?: 'start' | 'resume';
}

const PANEL_W = 288;
const PANEL_H = 120;
const SKIP_DELAY_MS = 1000;
const SLIDE_MS = 200;

export class CardScene extends Phaser.Scene {
  private sceneData!: CardSceneData;
  private skippable = false;
  private translator!: Translator;

  constructor() {
    super('Card');
  }

  init(data: CardSceneData): void {
    this.sceneData = data;
  }

  create(): void {
    const locale = (this.registry.get('locale') as LocaleId | undefined) ?? detectLocale(navigator.languages ?? []);
    this.translator = new Translator(locale);

    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    const panel = this.add.rectangle(cx, cy, PANEL_W, PANEL_H, 0x1a1410, 0.92);
    panel.setStrokeStyle(4, 0xc9b458);
    panel.setScrollFactor(0);
    panel.setDepth(2000);
    panel.setY(cy - 20);

    const lines: string[] = [];
    if (this.sceneData.titleKey) lines.push(this.translator.t(this.sceneData.titleKey));
    lines.push(...this.sceneData.lines);
    if (this.sceneData.stats) {
      for (const stat of this.sceneData.stats) lines.push(`${this.translator.t(stat.labelKey)}: ${stat.value}`);
    }

    const text = this.add.text(cx, cy - 20, lines.join('\n'), {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#f2e9d8',
      align: 'center',
      wordWrap: { width: PANEL_W - 24 },
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(2001);

    this.tweens.add({ targets: [panel, text], y: '-=0', alpha: { from: 0, to: 1 }, duration: SLIDE_MS });

    this.time.delayedCall(SKIP_DELAY_MS, () => {
      this.skippable = true;
    });

    // Phaser's keyboard plugin is disabled game-wide (config.ts); listen on window instead.
    window.addEventListener('keydown', this.onAdvanceKey);
    this.input.on('pointerdown', this.onAdvance);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.onAdvanceKey);
      this.input.off('pointerdown', this.onAdvance);
    });
  }

  private onAdvanceKey = (): void => this.onAdvance();

  private onAdvance = (): void => {
    if (!this.skippable) return;
    if (this.sceneData.nextAction === 'resume') {
      // The key/tap that dismisses this card was recorded by the resumed scene's own
      // InputSystem too (its raw `window` keydown listener never stopped while Play was
      // paused), so without clearing it, that same keypress replays as a fresh "pressed" edge
      // next tick -- for Enter/Escape (bound to Pause) that means Play re-pauses itself the
      // instant it resumes. Clearing on resume matches the existing "focus loss clears held
      // input" rule (GDD §4.5).
      const target = this.scene.get(this.sceneData.nextScene) as unknown as { getInputSystem?: () => { clearHeld: () => void } };
      target.getInputSystem?.().clearHeld();
      this.scene.stop();
      this.scene.resume(this.sceneData.nextScene);
    } else {
      this.scene.start(this.sceneData.nextScene, this.sceneData.nextSceneData);
    }
  };
}
