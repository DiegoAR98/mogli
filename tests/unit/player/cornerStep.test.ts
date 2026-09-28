import { describe, expect, it } from 'vitest';
import { cornerCorrection, stepUp } from '../../../src/game/logic/player/PlayerController';

describe('corner correction and step-up', () => {
  it('corrects a 4 px ceiling-corner overlap with free space and keeps vy (caller-preserved)', () => {
    expect(cornerCorrection(4, true)).toBe(4);
  });

  it('blocks a 5 px ceiling-corner overlap', () => {
    expect(cornerCorrection(5, true)).toBeNull();
  });

  it('blocks a 4 px overlap when the space past the corner is not free', () => {
    expect(cornerCorrection(4, false)).toBeNull();
  });

  it('steps onto a 4 px lip when it is clear', () => {
    expect(stepUp(4, true)).toBe(4);
  });

  it('is blocked by a 5 px lip', () => {
    expect(stepUp(5, true)).toBeNull();
  });

  it('is blocked when a 4 px lip is not clear', () => {
    expect(stepUp(4, false)).toBeNull();
  });
});
