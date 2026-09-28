import { describe, expect, it } from 'vitest';
import { consumeCountdown, isCountdownActive, startCountdown, tickCountdown } from '../../../src/game/logic/player/frameCounter';
import { JUMP_BUFFER_FRAMES } from '../../../src/game/data/tuning';

function bufferAfterTicks(ticksBeforeLanding: number): number {
  let buffer = startCountdown(JUMP_BUFFER_FRAMES);
  for (let i = 0; i < ticksBeforeLanding; i++) {
    buffer = tickCountdown(buffer);
  }
  return buffer;
}

describe('jump buffer', () => {
  it('fires on the landing tick when pressed 6 ticks before landing', () => {
    expect(isCountdownActive(bufferAfterTicks(6))).toBe(true);
  });

  it('is dropped when pressed 7 ticks before landing', () => {
    expect(isCountdownActive(bufferAfterTicks(7))).toBe(false);
  });

  it('fires exactly once even while Jump is held through the landing', () => {
    let buffer = bufferAfterTicks(6);
    let jumpsStarted = 0;

    // Landing tick: the buffer is active, so a jump starts and consumes it.
    if (isCountdownActive(buffer)) {
      jumpsStarted++;
      buffer = consumeCountdown();
    }
    // Jump is still held on the next several grounded ticks; holding never re-fires it.
    for (let i = 0; i < 5; i++) {
      buffer = tickCountdown(buffer);
      if (isCountdownActive(buffer)) {
        jumpsStarted++;
        buffer = consumeCountdown();
      }
    }

    expect(jumpsStarted).toBe(1);
  });
});
