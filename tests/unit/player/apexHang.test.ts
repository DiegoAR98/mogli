import { describe, expect, it } from 'vitest';
import { risingGravityPxS2 } from '../../../src/game/logic/player/PlayerController';
import { APEX_HANG_GRAVITY_PX_S2, APEX_HANG_VY_THRESHOLD_PX_S, RISING_GRAVITY_PX_S2 } from '../../../src/game/data/tuning';

describe('apex hang', () => {
  it('is 457 px/s2 only within the apex band while Jump is held', () => {
    expect(risingGravityPxS2(-10, true)).toBe(APEX_HANG_GRAVITY_PX_S2);
    expect(risingGravityPxS2(0, true)).toBe(APEX_HANG_GRAVITY_PX_S2);
    expect(risingGravityPxS2(-(APEX_HANG_VY_THRESHOLD_PX_S - 1), true)).toBe(APEX_HANG_GRAVITY_PX_S2);
  });

  it('is 914 px/s2 outside the apex band while rising', () => {
    expect(risingGravityPxS2(-(APEX_HANG_VY_THRESHOLD_PX_S + 10), true)).toBe(RISING_GRAVITY_PX_S2);
  });

  it('is 914 px/s2 inside the apex band if Jump is not held', () => {
    expect(risingGravityPxS2(-10, false)).toBe(RISING_GRAVITY_PX_S2);
  });
});
