import { describe, expect, it } from 'vitest';
import { horizontalAccelerationPxS2 } from '../../../src/game/logic/player/PlayerController';
import { AIR_ACCEL_PX_S2, AIR_BRAKE_PX_S2, AIR_TURN_BRAKE_PX_S2, GROUND_ACCEL_PX_S2, GROUND_BRAKE_PX_S2, TURN_BRAKE_PX_S2 } from '../../../src/game/data/tuning';

describe('ground and air control', () => {
  it('uses ground acceleration 900 px/s2 from a standstill', () => {
    expect(horizontalAccelerationPxS2(0, 1, true)).toBe(GROUND_ACCEL_PX_S2);
    expect(horizontalAccelerationPxS2(0, 1, true)).toBe(900);
  });

  it('uses ground braking 1200 px/s2 when input is released', () => {
    expect(horizontalAccelerationPxS2(96, 0, true)).toBe(GROUND_BRAKE_PX_S2);
    expect(horizontalAccelerationPxS2(96, 0, true)).toBe(1200);
  });

  it('uses turn braking 1800 px/s2 when input reverses', () => {
    expect(horizontalAccelerationPxS2(96, -1, true)).toBe(TURN_BRAKE_PX_S2);
    expect(horizontalAccelerationPxS2(96, -1, true)).toBe(1800);
  });

  it('uses the 65% air values in the air', () => {
    expect(horizontalAccelerationPxS2(0, 1, false)).toBe(AIR_ACCEL_PX_S2);
    expect(horizontalAccelerationPxS2(0, 1, false)).toBe(585);
    expect(horizontalAccelerationPxS2(96, 0, false)).toBe(AIR_BRAKE_PX_S2);
    expect(horizontalAccelerationPxS2(96, 0, false)).toBe(780);
    expect(horizontalAccelerationPxS2(96, -1, false)).toBe(AIR_TURN_BRAKE_PX_S2);
    expect(horizontalAccelerationPxS2(96, -1, false)).toBe(1170);
  });
});
