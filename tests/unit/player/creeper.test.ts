import { describe, expect, it } from 'vitest';
import { canGrabCreeper, creeperClimbVelocity, throwAllowedOnCreeper } from '../../../src/game/logic/player/creeper';
import { pendulumPeriodS, swingReleaseVx } from '../../../src/game/logic/platforms/PathFollower';
import { CLIMB_SPEED_PX_S, JUMP_HORIZONTAL_BOOST_PX_S, RISING_GRAVITY_PX_S2, RUN_SPEED_PX_S, SWING_PERIOD_S, TILE_PX } from '../../../src/game/data/tuning';

describe('creepers', () => {
  it('auto-grabs on overlap while airborne', () => {
    expect(canGrabCreeper({ overlappingCreeper: true, grounded: false, upPressed: false, fallingWithDownHeld: false })).toBe(true);
  });

  it('auto-grabs when Up is pressed while grounded under a creeper', () => {
    expect(canGrabCreeper({ overlappingCreeper: false, grounded: true, upPressed: true, fallingWithDownHeld: false })).toBe(true);
  });

  it('suppresses the grab when Down is held while falling', () => {
    expect(canGrabCreeper({ overlappingCreeper: true, grounded: false, upPressed: false, fallingWithDownHeld: true })).toBe(false);
  });

  it('climbs at 64 px/s up and down', () => {
    expect(creeperClimbVelocity({ up: true, down: false, left: false, right: false, horizontalCreeper: false }).vy).toBe(-CLIMB_SPEED_PX_S);
    expect(creeperClimbVelocity({ up: false, down: true, left: false, right: false, horizontalCreeper: false }).vy).toBe(CLIMB_SPEED_PX_S);
  });

  it('allows throwing from every creeper', () => {
    expect(throwAllowedOnCreeper()).toBe(true);
  });

  it('has a pendulum period of about 1.6 s for a 4-tile (64 px) creeper under the rising gravity', () => {
    // GDD §6.2: "a 4-tile creeper under rising gravity swings at 1.66 s, so the number is the
    // physics, not a tween" -- SWING_PERIOD_S (1.6) is the design's rounded nominal value.
    const periodS = pendulumPeriodS(4 * TILE_PX, RISING_GRAVITY_PX_S2);
    expect(periodS).toBeCloseTo(1.66, 1);
    expect(Math.abs(periodS - SWING_PERIOD_S)).toBeLessThan(0.1);
  });

  it('releases at the forward apex with the rope velocity (capped at run speed) plus the jump boost', () => {
    // Rope end moving faster than run speed: capped, then boosted.
    expect(swingReleaseVx(200, JUMP_HORIZONTAL_BOOST_PX_S, RUN_SPEED_PX_S)).toBe(RUN_SPEED_PX_S + JUMP_HORIZONTAL_BOOST_PX_S);
    // Rope end moving slower than run speed: used as-is, then boosted.
    expect(swingReleaseVx(50, JUMP_HORIZONTAL_BOOST_PX_S, RUN_SPEED_PX_S)).toBe(50 + JUMP_HORIZONTAL_BOOST_PX_S);
  });
});
