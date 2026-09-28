import { describe, expect, it } from 'vitest';
import { canCaptureLedge, canCompletePullUp } from '../../../src/game/logic/player/PlayerController';

describe('ledge grab', () => {
  it('captures within 6 px horizontal and 8 px vertical of a solid tile top lip while falling', () => {
    expect(canCaptureLedge({ horizontalDistancePx: 6, verticalDistancePx: 8, vy: 200, downHeld: false, regrabLockFrames: 0 })).toBe(true);
  });

  it('does not capture past 6 px horizontal or 8 px vertical', () => {
    expect(canCaptureLedge({ horizontalDistancePx: 7, verticalDistancePx: 8, vy: 200, downHeld: false, regrabLockFrames: 0 })).toBe(false);
    expect(canCaptureLedge({ horizontalDistancePx: 6, verticalDistancePx: 9, vy: 200, downHeld: false, regrabLockFrames: 0 })).toBe(false);
  });

  it('does not capture while Down is held', () => {
    expect(canCaptureLedge({ horizontalDistancePx: 0, verticalDistancePx: 0, vy: 200, downHeld: true, regrabLockFrames: 0 })).toBe(false);
  });

  it('does not capture while not falling (vy <= 0)', () => {
    expect(canCaptureLedge({ horizontalDistancePx: 0, verticalDistancePx: 0, vy: -50, downHeld: false, regrabLockFrames: 0 })).toBe(false);
    expect(canCaptureLedge({ horizontalDistancePx: 0, verticalDistancePx: 0, vy: 0, downHeld: false, regrabLockFrames: 0 })).toBe(false);
  });

  it('does not re-capture the same ledge within the 0.25 s (15-tick) regrab lock', () => {
    expect(canCaptureLedge({ horizontalDistancePx: 0, verticalDistancePx: 0, vy: 200, downHeld: false, regrabLockFrames: 15 })).toBe(false);
    expect(canCaptureLedge({ horizontalDistancePx: 0, verticalDistancePx: 0, vy: 200, downHeld: false, regrabLockFrames: 1 })).toBe(false);
    expect(canCaptureLedge({ horizontalDistancePx: 0, verticalDistancePx: 0, vy: 200, downHeld: false, regrabLockFrames: 0 })).toBe(true);
  });

  it('completes pull-up only if the standing rectangle at the destination is clear', () => {
    expect(canCompletePullUp(true)).toBe(true);
    expect(canCompletePullUp(false)).toBe(false);
  });
});
