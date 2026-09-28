import { describe, expect, it } from 'vitest';
import { pendulumKinematics } from '../../../src/game/logic/platforms/PathFollower';

describe('pendulumKinematics', () => {
  it('starts at the amplitude extreme with zero velocity at t=0', () => {
    const k = pendulumKinematics(0, 0, 64, Math.PI / 4.5, 1.66, 0);
    expect(k.vx).toBeCloseTo(0, 5);
    expect(k.x).toBeCloseTo(64 * Math.sin(Math.PI / 4.5), 5);
  });

  it('passes through the bottom (x=0) at a quarter period with maximum speed', () => {
    const periodS = 1.66;
    const k = pendulumKinematics(0, 0, 64, Math.PI / 4.5, periodS, periodS / 4);
    expect(k.x).toBeCloseTo(0, 4);
    expect(Math.abs(k.vx)).toBeGreaterThan(0);
  });
});
