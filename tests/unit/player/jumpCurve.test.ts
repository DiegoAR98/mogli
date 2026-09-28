import { describe, expect, it } from 'vitest';
import { apexHangGravity, deriveJumpCurve, fallingGravity, horizontalReachPx } from '../../../src/game/logic/player/jumpCurve';
import {
  APEX_HANG_GRAVITY_MULTIPLIER,
  BODY_STANDING_W_PX,
  FALLING_GRAVITY_MULTIPLIER,
  FALLING_GRAVITY_PX_S2,
  JUMP_HEIGHT_PX,
  JUMP_LAUNCH_SPEED_PX_S,
  JUMP_TIME_TO_APEX_S,
  RISING_GRAVITY_PX_S2,
  RUN_SPEED_PX_S,
} from '../../../src/game/data/tuning';

describe('jumpCurve', () => {
  it('derives launch speed 320 px/s and rising gravity 914 px/s2 within 1 unit of the documented constants', () => {
    const curve = deriveJumpCurve(JUMP_HEIGHT_PX, JUMP_TIME_TO_APEX_S);
    expect(curve.launchSpeedPxS).toBeCloseTo(JUMP_LAUNCH_SPEED_PX_S, 0);
    expect(Math.abs(curve.launchSpeedPxS - JUMP_LAUNCH_SPEED_PX_S)).toBeLessThanOrEqual(1);
    expect(Math.abs(curve.risingGravityPxS2 - RISING_GRAVITY_PX_S2)).toBeLessThanOrEqual(1);
  });

  it('derives falling gravity of about 1462 px/s2 at the 1.6x multiplier', () => {
    const curve = deriveJumpCurve(JUMP_HEIGHT_PX, JUMP_TIME_TO_APEX_S);
    const falling = fallingGravity(curve.risingGravityPxS2, FALLING_GRAVITY_MULTIPLIER);
    expect(Math.abs(falling - FALLING_GRAVITY_PX_S2)).toBeLessThanOrEqual(1);
  });

  it('derives apex-hang gravity of 457 px/s2 at 0.5x', () => {
    const half = apexHangGravity(RISING_GRAVITY_PX_S2, APEX_HANG_GRAVITY_MULTIPLIER);
    expect(half).toBeCloseTo(457, 0);
  });

  it('estimates horizontal reach in the 4.5-5.5 tile band (GDD §5.2)', () => {
    const reachPx = horizontalReachPx(RUN_SPEED_PX_S, JUMP_TIME_TO_APEX_S, JUMP_HEIGHT_PX, FALLING_GRAVITY_PX_S2, 0.08, BODY_STANDING_W_PX);
    const reachTiles = reachPx / 16;
    expect(reachTiles).toBeGreaterThanOrEqual(4.5);
    expect(reachTiles).toBeLessThanOrEqual(5.5);
  });
});
