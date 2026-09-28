/**
 * Touch control layout (GDD §4.4): pure geometry only, no DOM. Positions are percentages of the
 * viewport so they hold at any screen size; src/game/systems/touchControls.ts turns this into
 * real DOM buttons sized in CSS px (never game-logical px, since those scale with zoom).
 */

export type TouchPreset = 'compact' | 'wide';
export type TouchAction = 'left' | 'right' | 'down' | 'jump' | 'throw' | 'item' | 'cycle' | 'pause';

export const TOUCH_HIT_MIN_PX = 48;
export const TOUCH_OPACITY_MIN_PERCENT = 20;
export const TOUCH_OPACITY_MAX_PERCENT = 80;
export const TOUCH_OPACITY_DEFAULT_PERCENT = 50;

export interface TouchButtonLayout {
  action: TouchAction;
  leftPercent: number;
  topPercent: number;
  sizePx: number;
}

export function touchButtonSizePx(preset: TouchPreset, action: TouchAction): number {
  const base = preset === 'wide' ? 64 : TOUCH_HIT_MIN_PX;
  return action === 'jump' ? base + 8 : base; // "Jump is the outermost button so the thumb rests on it" (GDD §4.4)
}

export function clampTouchOpacityPercent(percent: number): number {
  return Math.min(TOUCH_OPACITY_MAX_PERCENT, Math.max(TOUCH_OPACITY_MIN_PERCENT, percent));
}

/** Bottom-left d-pad-like cluster, bottom-right action cluster, top-right pause (GDD §4.4). */
export function touchButtonLayout(preset: TouchPreset): TouchButtonLayout[] {
  return [
    { action: 'left', leftPercent: 4, topPercent: 78, sizePx: touchButtonSizePx(preset, 'left') },
    { action: 'down', leftPercent: 14, topPercent: 84, sizePx: touchButtonSizePx(preset, 'down') },
    { action: 'right', leftPercent: 24, topPercent: 78, sizePx: touchButtonSizePx(preset, 'right') },
    { action: 'jump', leftPercent: 88, topPercent: 76, sizePx: touchButtonSizePx(preset, 'jump') },
    { action: 'throw', leftPercent: 74, topPercent: 82, sizePx: touchButtonSizePx(preset, 'throw') },
    { action: 'item', leftPercent: 74, topPercent: 66, sizePx: touchButtonSizePx(preset, 'item') },
    { action: 'cycle', leftPercent: 84, topPercent: 60, sizePx: touchButtonSizePx(preset, 'cycle') },
    { action: 'pause', leftPercent: 90, topPercent: 4, sizePx: touchButtonSizePx(preset, 'pause') },
  ];
}
