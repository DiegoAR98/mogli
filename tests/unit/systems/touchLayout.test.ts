import { describe, expect, it } from 'vitest';
import { clampTouchOpacityPercent, touchButtonLayout, touchButtonSizePx, TOUCH_HIT_MIN_PX } from '../../../src/game/data/touchLayout';

describe('touch control layout (GDD §4.4)', () => {
  it('every button meets the 48 px minimum CSS hit area in both presets', () => {
    for (const preset of ['compact', 'wide'] as const) {
      for (const button of touchButtonLayout(preset)) {
        expect(button.sizePx).toBeGreaterThanOrEqual(TOUCH_HIT_MIN_PX);
      }
    }
  });

  it('jump is the largest button so the thumb rests on it', () => {
    for (const preset of ['compact', 'wide'] as const) {
      const layout = touchButtonLayout(preset);
      const jump = layout.find((b) => b.action === 'jump')!;
      const others = layout.filter((b) => b.action !== 'jump');
      expect(others.every((b) => b.sizePx <= jump.sizePx)).toBe(true);
    }
  });

  it('wide preset buttons are never smaller than compact', () => {
    const compact = touchButtonLayout('compact');
    const wide = touchButtonLayout('wide');
    for (const c of compact) {
      const w = wide.find((b) => b.action === c.action)!;
      expect(touchButtonSizePx('wide', c.action)).toBeGreaterThanOrEqual(touchButtonSizePx('compact', c.action));
      expect(w.sizePx).toBeGreaterThanOrEqual(c.sizePx);
    }
  });

  it('covers every required region: left/right/down pads, jump, throw, item, cycle, pause', () => {
    const actions = touchButtonLayout('wide').map((b) => b.action).sort();
    expect(actions).toEqual(['cycle', 'down', 'item', 'jump', 'left', 'pause', 'right', 'throw']);
  });

  it('all button positions stay within the 0-100% viewport', () => {
    for (const preset of ['compact', 'wide'] as const) {
      for (const b of touchButtonLayout(preset)) {
        expect(b.leftPercent).toBeGreaterThanOrEqual(0);
        expect(b.leftPercent).toBeLessThanOrEqual(100);
        expect(b.topPercent).toBeGreaterThanOrEqual(0);
        expect(b.topPercent).toBeLessThanOrEqual(100);
      }
    }
  });

  it('clamps opacity to the 20-80% slider range (GDD §4.4)', () => {
    expect(clampTouchOpacityPercent(0)).toBe(20);
    expect(clampTouchOpacityPercent(50)).toBe(50);
    expect(clampTouchOpacityPercent(100)).toBe(80);
  });
});
