import { describe, expect, it } from 'vitest';
import { integrateHorizontalVelocity } from '../../../src/game/logic/player/PlayerController';
import { GROUND_ACCEL_PX_S2, RUN_SPEED_PX_S } from '../../../src/game/data/tuning';

describe('integrateHorizontalVelocity', () => {
  it('reaches run speed from a standstill in the documented time', () => {
    let vx = 0;
    const dt = 1 / 60;
    for (let i = 0; i < Math.ceil(RUN_SPEED_PX_S / GROUND_ACCEL_PX_S2 / dt); i++) {
      vx = integrateHorizontalVelocity(vx, 1, true, RUN_SPEED_PX_S, dt);
    }
    expect(vx).toBeCloseTo(RUN_SPEED_PX_S, 0);
  });

  it('never exceeds the max speed', () => {
    let vx = RUN_SPEED_PX_S;
    vx = integrateHorizontalVelocity(vx, 1, true, RUN_SPEED_PX_S, 1);
    expect(vx).toBe(RUN_SPEED_PX_S);
  });

  it('decelerates to exactly zero without overshoot when input is released', () => {
    const vx = integrateHorizontalVelocity(5, 0, true, RUN_SPEED_PX_S, 1);
    expect(vx).toBe(0);
  });
});
