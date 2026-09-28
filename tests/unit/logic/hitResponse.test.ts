import { describe, expect, it } from 'vitest';
import { HIT_KNOCKBACK_PX_S, HIT_UPWARD_IMPULSE_PX_S } from '../../../src/game/data/tuning';
import { applyHit, canBeHit, isBlinkVisible } from '../../../src/game/logic/player/hitResponse';

describe('hit response (GDD §7.5)', () => {
  it('subtracts the tier damage and clamps at 0', () => {
    expect(applyHit(6, 2, 1).pips).toBe(4);
    expect(applyHit(1, 3, 1).pips).toBe(0);
  });

  it('is lethal (respawn) exactly when pips reach 0', () => {
    expect(applyHit(2, 1, 1).lethal).toBe(false);
    expect(applyHit(2, 2, 1).lethal).toBe(true);
    expect(applyHit(2, 3, 1).lethal).toBe(true);
  });

  it('knocks back away from the source with the GDD §7.5 numbers', () => {
    const right = applyHit(6, 1, 1);
    expect(right.knockbackVx).toBe(HIT_KNOCKBACK_PX_S);
    expect(right.knockbackVy).toBe(-HIT_UPWARD_IMPULSE_PX_S);
    const left = applyHit(6, 1, -1);
    expect(left.knockbackVx).toBe(-HIT_KNOCKBACK_PX_S);
  });

  it('cannot be hit again during invulnerability', () => {
    expect(canBeHit(30)).toBe(false);
    expect(canBeHit(0)).toBe(true);
    expect(canBeHit(-1)).toBe(true);
  });

  it('blinks at 4 Hz and is always visible once invulnerability ends', () => {
    expect(isBlinkVisible(0)).toBe(true);
    expect(isBlinkVisible(-5)).toBe(true);
    const visibleFrames = Array.from({ length: 60 }, (_, f) => isBlinkVisible(60 - f)).filter(Boolean).length;
    expect(visibleFrames).toBeGreaterThan(20);
    expect(visibleFrames).toBeLessThan(40);
  });
});
