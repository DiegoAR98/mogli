import { describe, expect, it } from 'vitest';
import { canStandUp, crouchedBodyRect, crouchThrowHeightPx, standingBodyRect } from '../../../src/game/logic/player/PlayerController';
import { BODY_CROUCHED_H_PX, BODY_CROUCHED_W_PX, THROW_SHOULDER_HEIGHT_PX, TILE_PX } from '../../../src/game/data/tuning';

describe('crouch', () => {
  it('is a 12x14 body with the feet fixed on the same line as standing', () => {
    const feetX = 100;
    const feetY = 200;
    const crouched = crouchedBodyRect(feetX, feetY);
    const standing = standingBodyRect(feetX, feetY);
    expect(crouched.w).toBe(BODY_CROUCHED_W_PX);
    expect(crouched.h).toBe(BODY_CROUCHED_H_PX);
    expect(crouched.y + crouched.h).toBe(feetY);
    expect(standing.y + standing.h).toBe(feetY);
  });

  it('clears a 1-tile (16 px) crouch passage with 2 px to spare', () => {
    expect(BODY_CROUCHED_H_PX).toBeLessThanOrEqual(TILE_PX - 2);
  });

  it('cannot stand under a 1-tile ceiling (the standing rectangle is not clear)', () => {
    expect(canStandUp(false)).toBe(false);
    expect(canStandUp(true)).toBe(true);
  });

  it('a crouched throw leaves at half the standing shoulder height', () => {
    expect(crouchThrowHeightPx()).toBe(THROW_SHOULDER_HEIGHT_PX / 2);
  });
});
