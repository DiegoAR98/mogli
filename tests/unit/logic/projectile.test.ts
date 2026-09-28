import { describe, expect, it } from 'vitest';
import { canThrow, NUT_PARAMS, projectileGravityPxS2, projectileVelocity, resolveAimDirection } from '../../../src/game/logic/projectiles/Projectile';
import { NUT_GRAVITY_MULTIPLIER, NUT_SPEED_PX_S, RISING_GRAVITY_PX_S2 } from '../../../src/game/data/tuning';

describe('nut projectile', () => {
  it('aims 8-way from held input', () => {
    expect(resolveAimDirection({ left: false, right: false, up: true, down: false, facing: 1 })).toEqual({ dx: 0, dy: -1 });
    expect(resolveAimDirection({ left: true, right: false, up: true, down: false, facing: 1 })).toEqual({ dx: -1, dy: -1 });
  });

  it('falls back to the facing direction with no direction held', () => {
    expect(resolveAimDirection({ left: false, right: false, up: false, down: false, facing: -1 })).toEqual({ dx: -1, dy: 0 });
  });

  it('launches at 224 px/s in the aimed direction', () => {
    const v = projectileVelocity({ dx: 1, dy: 0 }, NUT_PARAMS);
    expect(v).toEqual({ vx: NUT_SPEED_PX_S, vy: 0 });
  });

  it('carries a light arc at 0.25x the rising gravity', () => {
    expect(projectileGravityPxS2(NUT_PARAMS, RISING_GRAVITY_PX_S2)).toBe(RISING_GRAVITY_PX_S2 * NUT_GRAVITY_MULTIPLIER);
  });

  it('respects the 0.25 s cooldown and the 3-on-screen cap', () => {
    expect(canThrow(0, 0, NUT_PARAMS)).toBe(true);
    expect(canThrow(3, 0, NUT_PARAMS)).toBe(false);
    expect(canThrow(0, 0.1, NUT_PARAMS)).toBe(false);
  });
});
