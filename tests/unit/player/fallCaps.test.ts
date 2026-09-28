import { describe, expect, it } from 'vitest';
import { clampFallSpeed, fallingGravityPxS2 } from '../../../src/game/logic/player/PlayerController';
import { FALLING_GRAVITY_PX_S2, FAST_FALL_SPEED_PX_S, MAX_FALL_SPEED_PX_S } from '../../../src/game/data/tuning';

describe('fall caps', () => {
  it('never exceeds 320 px/s without Down held', () => {
    expect(clampFallSpeed(500, false)).toBe(MAX_FALL_SPEED_PX_S);
    expect(clampFallSpeed(100, false)).toBe(100);
  });

  it('allows up to 400 px/s with Down held (fast fall)', () => {
    expect(clampFallSpeed(500, true)).toBe(FAST_FALL_SPEED_PX_S);
    expect(clampFallSpeed(350, true)).toBe(350);
  });

  it('applies 1,462 px/s2 gravity while falling', () => {
    expect(fallingGravityPxS2()).toBe(FALLING_GRAVITY_PX_S2);
  });
});
