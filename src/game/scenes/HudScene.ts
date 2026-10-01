import Phaser from 'phaser';
import type { PlayScene } from './PlayScene';
import { TouchControls } from '../systems/touchControls';
import { Translator } from '../systems/locale';
import type { Settings } from '../systems/settings';
import { QUOTA_SILHOUETTE_S, QUOTA_TOAST_S, RED_FLOWER_CAP_S } from '../data/tuning';
import type { DictKey } from '../i18n/en';

const EXIT_CHARACTER_KEYS: Record<string, DictKey> = { akela: 'exit.akela', kaa: 'exit.kaa', hathi: 'exit.hathi', greyBrother: 'exit.greyBrother', thuu: 'exit.thuu', phao: 'exit.phao' };

/**
 * Parallel scene (PLAN.md §3.2 rule 3): reads PlayScene's read-only accessors, the registry and
 * the event bus, never a Phaser body of its own. Owns the top HUD row (GDD §11.2), the touch
 * control layer, and the F3 debug overlay.
 */
export class HudScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;
  private debugVisible = import.meta.env.DEV || Boolean(import.meta.env.VITE_E2E);
  private f3Handler = (event: KeyboardEvent) => {
    if (event.code === 'F3') this.debugVisible = !this.debugVisible;
  };

  private pipsText?: Phaser.GameObjects.Text;
  private emberBar?: Phaser.GameObjects.Rectangle;
  private counterText?: Phaser.GameObjects.Text;
  private toastText?: Phaser.GameObjects.Text;
  private throwableText?: Phaser.GameObjects.Text;

  private touchControls?: TouchControls;
  private touchControlsInitialized = false;
  private quotaMetAtS: number | null = null;
  private bossDots: Phaser.GameObjects.Rectangle[] = [];
  private pawsText?: Phaser.GameObjects.Text;

  constructor() {
    super('Hud');
  }

  create(): void {
    const translator = this.registry.get('translator') as Translator | undefined;
    const settings = this.registry.get('settings') as Settings | undefined;

    if (translator) {
      this.pipsText = this.add.text(8, 8, '', { fontFamily: 'monospace', fontSize: '10px', color: '#f2e9d8' }).setScrollFactor(0).setDepth(900);
      this.emberBar = this.add.rectangle(8, 20, 24, 3, 0xd8562a).setOrigin(0, 0.5).setScrollFactor(0).setDepth(900);
      this.counterText = this.add.text(120, 8, '', { fontFamily: 'monospace', fontSize: '10px', color: '#f2e9d8' }).setScrollFactor(0).setDepth(900);
      this.throwableText = this.add.text(240, 8, '', { fontFamily: 'monospace', fontSize: '10px', color: '#f2e9d8' }).setScrollFactor(0).setDepth(900);
      this.toastText = this.add
        .text(160, 24, '', { fontFamily: 'monospace', fontSize: '9px', color: '#f2e94e', align: 'center' })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(900);

      // Pack strength (GDD §8.5, B4 only): a small paw count beside the boss dots.
      this.pawsText = this.add
        .text(160, 500, '', { fontFamily: 'monospace', fontSize: '9px', color: '#f2e9d8' })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(900);

      // Boss phase dots (GDD §11.2, §8.1): bottom-center, a group of 2/3/4 pips by tier, up to
      // 3 phases; a fixed pool sized for the largest tier, shown/hidden per the current fight.
      for (let phase = 0; phase < 3; phase++) {
        for (let pip = 0; pip < 4; pip++) {
          const dot = this.add.rectangle(0, 0, 5, 5, 0xf2e9d8).setScrollFactor(0).setDepth(900).setVisible(false);
          this.bossDots.push(dot);
        }
      }
    }

    if (import.meta.env.DEV || import.meta.env.VITE_E2E) {
      window.addEventListener('keydown', this.f3Handler);
      this.debugText = this.add.text(4, 40, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#f2e9d8',
        backgroundColor: 'rgba(11, 20, 16, 0.7)',
        padding: { x: 2, y: 2 },
      });
      this.debugText.setScrollFactor(0);
      this.debugText.setDepth(1000);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.f3Handler);
      this.touchControls?.destroy();
    });
  }

  update(): void {
    const play = this.scene.get('Play') as unknown as PlayScene;
    this.initTouchControlsOnceReady(play);
    this.updateHudRow(play);
    this.updateDebugOverlay(play);
  }

  /** Play's InputSystem is only guaranteed to exist after its own create() has run, which can
   * land after Hud's own create() when both scenes are started in the same frame (BootScene,
   * LoadingScene), so the touch layer attaches lazily here instead of racing that order. */
  private initTouchControlsOnceReady(play: PlayScene): void {
    if (this.touchControlsInitialized) return;
    const inputSystem = play.getInputSystem?.();
    if (!inputSystem) return;
    const settings = this.registry.get('settings') as Settings | undefined;
    if (!settings) return;

    this.touchControlsInitialized = true;
    const gameDiv = document.getElementById('game') ?? document.body;
    this.touchControls = new TouchControls(gameDiv, inputSystem);
    this.touchControls.setPreset(settings.touchPreset);
    this.touchControls.setOpacityPercent(settings.touchOpacityPercent);
  }

  private updateHudRow(play: PlayScene): void {
    if (!this.pipsText) return;
    const info = play.getHudInfo?.();
    if (!info) return;

    this.pipsText.setText('*'.repeat(info.pips) + '.'.repeat(info.maxPips - info.pips));
    this.emberBar?.setVisible(info.redFlowerMeterS > 0);
    this.emberBar?.setScale(Math.max(0, info.redFlowerMeterS / RED_FLOWER_CAP_S), 1);
    this.emberBar?.setFillStyle(info.redFlowerLit ? 0xf2994e : 0x8a3a1a);

    const translator = this.registry.get('translator') as Translator | undefined;
    if (translator && this.counterText) {
      const label = info.invertedQuota
        ? `${translator.t('hud.counterBanked', { count: info.stonesCollected, quota: info.quotaValue })} ${translator.t('hud.pouch', { count: info.pouchCount })}`
        : info.rallied
          ? translator.t('hud.counterRallied', { count: info.stonesCollected, quota: info.quotaValue })
          : translator.t('hud.counter', { count: info.stonesCollected, quota: info.quotaValue });
      this.counterText.setText(label);
      this.counterText.setColor(info.quotaMet ? '#f2e94e' : '#f2e9d8');
    }
    if (translator && this.throwableText) {
      this.throwableText.setText(info.currentThrowable === 'nut' ? '∞' : `${info.redFlowerMeterS.toFixed(0)}s`);
    }

    if (translator && this.toastText) {
      if (info.quotaJustMetAtS !== null && this.quotaMetAtS === null) {
        this.quotaMetAtS = info.quotaJustMetAtS;
      }
      if (this.quotaMetAtS !== null) {
        const elapsedSinceMet = info.quotaJustMetAtS !== null ? info.quotaJustMetAtS - this.quotaMetAtS : Infinity;
        const showToast = elapsedSinceMet < QUOTA_SILHOUETTE_S + QUOTA_TOAST_S;
        const nameKey = EXIT_CHARACTER_KEYS[info.exitCharacterId ?? ''] ?? 'exit.akela';
        this.toastText.setText(showToast ? translator.t('hud.quotaToast', { name: translator.t(nameKey) }) : '');
      }
    }

    this.updateBossDots(info.boss);

    if (translator && this.pawsText) {
      this.pawsText.setText(info.packPaws !== null ? translator.t('hud.packPaws', { count: info.packPaws }) : '');
    }
  }

  private updateBossDots(boss: ReturnType<PlayScene['getHudInfo']>['boss']): void {
    if (this.bossDots.length === 0) return;
    if (!boss) {
      for (const dot of this.bossDots) dot.setVisible(false);
      return;
    }

    const cx = 160;
    const gapX = 8;
    const groupGapX = 16;
    let index = 0;
    for (let phase = 0; phase < boss.phaseCount; phase++) {
      const pipsForThisPhase = boss.hitsRequired;
      const groupWidth = (pipsForThisPhase - 1) * gapX;
      const groupStartX = cx + (phase - (boss.phaseCount - 1) / 2) * (groupWidth + groupGapX);
      for (let pip = 0; pip < 4; pip++) {
        const dot = this.bossDots[index++];
        if (pip >= pipsForThisPhase) {
          dot.setVisible(false);
          continue;
        }
        dot.setVisible(true);
        dot.setPosition(groupStartX + pip * gapX, 168);
        const filled = phase < boss.phaseIndex || (phase === boss.phaseIndex && pip < boss.hitsThisPhase);
        dot.setFillStyle(filled ? 0xf2e94e : 0x554a3a);
      }
    }
  }

  private updateDebugOverlay(play: PlayScene): void {
    if (!this.debugText) return;
    this.debugText.setVisible(this.debugVisible);
    if (!this.debugVisible) return;

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
