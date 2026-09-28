import { describe, expect, it } from 'vitest';
import { COUNTER_INACTIVE, consumeCountdown, isCountdownActive, startCountdown, tickCountdown } from '../../../src/game/logic/player/frameCounter';
import { COYOTE_FRAMES } from '../../../src/game/data/tuning';

function coyoteAfterTicks(ticksSinceLeavingFloor: number): number {
  let coyote = startCountdown(COYOTE_FRAMES);
  for (let i = 0; i < ticksSinceLeavingFloor; i++) {
    coyote = tickCountdown(coyote);
  }
  return coyote;
}

describe('coyote time', () => {
  it('accepts a jump press 6 ticks after leaving a floor', () => {
    expect(isCountdownActive(coyoteAfterTicks(6))).toBe(true);
  });

  it('rejects a jump press 7 ticks after leaving a floor', () => {
    expect(isCountdownActive(coyoteAfterTicks(7))).toBe(false);
  });

  it('is set to -1 (inactive) by a jump, a ledge drop or a creeper release', () => {
    let coyote = startCountdown(COYOTE_FRAMES);
    coyote = tickCountdown(coyote); // one tick of airtime
    coyote = consumeCountdown(); // a jump, drop or release happens
    expect(coyote).toBe(COUNTER_INACTIVE);
    expect(isCountdownActive(coyote)).toBe(false);
  });

  it('starts inactive at spawn and respawn', () => {
    expect(isCountdownActive(COUNTER_INACTIVE)).toBe(false);
  });
});
