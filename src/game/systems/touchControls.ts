/**
 * Touch controls (GDD §4.4, deferred from the M0 V5 spike, D89e): real DOM buttons laid over
 * the game canvas, sized in true CSS px (never game-logical px, which scale with zoom). Hidden
 * until the first touch anywhere on the page; a button stays held while the thumb slides off it
 * and releases only on lift, which touch-action: none plus pointer capture gives for free.
 */

import type { InputSystem } from './input';
import { touchButtonLayout, type TouchAction, type TouchPreset, clampTouchOpacityPercent, TOUCH_OPACITY_DEFAULT_PERCENT } from '../data/touchLayout';

const LABELS: Record<TouchAction, string> = {
  left: '◀',
  right: '▶',
  down: '▼',
  jump: 'JUMP',
  throw: 'THROW',
  item: 'ITEM',
  cycle: 'CYC',
  pause: '≡',
};

export class TouchControls {
  private readonly root: HTMLDivElement;
  private readonly buttons: HTMLDivElement[] = [];
  private shown = false;
  private preset: TouchPreset = 'wide';
  private opacityPercent = TOUCH_OPACITY_DEFAULT_PERCENT;

  constructor(
    private readonly container: HTMLElement,
    private readonly input: InputSystem,
  ) {
    this.root = document.createElement('div');
    this.root.style.cssText = 'position:absolute;inset:0;display:none;pointer-events:none;touch-action:none;z-index:10;';
    this.container.appendChild(this.root);
    this.build();
    window.addEventListener('touchstart', this.onFirstTouch, { once: true, passive: true });
  }

  private onFirstTouch = (): void => {
    this.shown = true;
    this.root.style.display = 'block';
    document.body.classList.add('touch-active');
  };

  setPreset(preset: TouchPreset): void {
    this.preset = preset;
    this.build();
  }

  setOpacityPercent(percent: number): void {
    this.opacityPercent = clampTouchOpacityPercent(percent);
    this.root.style.opacity = String(this.opacityPercent / 100);
  }

  private build(): void {
    for (const button of this.buttons) button.remove();
    this.buttons.length = 0;
    this.root.style.opacity = String(this.opacityPercent / 100);

    for (const layout of touchButtonLayout(this.preset)) {
      const button = document.createElement('div');
      button.textContent = LABELS[layout.action];
      button.style.cssText = [
        'position:absolute',
        `left:${layout.leftPercent}%`,
        `top:${layout.topPercent}%`,
        `width:${layout.sizePx}px`,
        `height:${layout.sizePx}px`,
        'border-radius:50%',
        'background:rgba(255,255,255,0.25)',
        'color:#fff',
        'font:12px sans-serif',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'pointer-events:auto',
        'touch-action:none',
        'user-select:none',
      ].join(';');

      // The Down pad's upper quarter aiming straight up (GDD §4.4) needs per-pointer zone
      // tracking on top of this button and is a should-item left for the M2 art pass; Cub-tier
      // levels never require an upward touch throw on the critical path, so nothing here blocks.
      const setHeld = (held: boolean) => this.input.setTouchHeld(layout.action, held);

      button.addEventListener('pointerdown', (e) => {
        button.setPointerCapture(e.pointerId);
        setHeld(true);
      });
      button.addEventListener('pointerup', () => setHeld(false));
      button.addEventListener('pointercancel', () => setHeld(false));

      this.root.appendChild(button);
      this.buttons.push(button);
    }
  }

  get isShown(): boolean {
    return this.shown;
  }

  destroy(): void {
    window.removeEventListener('touchstart', this.onFirstTouch);
    this.root.remove();
  }
}
