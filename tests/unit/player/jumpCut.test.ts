import { describe, expect, it } from 'vitest';
import { applyJumpCut } from '../../../src/game/logic/player/PlayerController';

describe('jump cut', () => {
  it('halves vy once when Jump is released while rising', () => {
    const result = applyJumpCut(-320, true, false);
    expect(result.vy).toBe(-160);
    expect(result.cutDone).toBe(true);
  });

  it('does nothing on a second release the same jump', () => {
    const first = applyJumpCut(-320, true, false);
    const second = applyJumpCut(first.vy, true, first.cutDone);
    expect(second.vy).toBe(first.vy);
    expect(second.cutDone).toBe(true);
  });

  it('does nothing when released while falling', () => {
    const result = applyJumpCut(160, true, false);
    expect(result.vy).toBe(160);
    expect(result.cutDone).toBe(false);
  });
});
