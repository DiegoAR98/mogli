import { describe, expect, it } from 'vitest';
import { crumbleHasCollision, startCrumble, stepCrumble } from '../../../src/game/logic/platforms/PathFollower';

describe('crumbling terraces', () => {
  it('keeps collision for 0.5 s after landing triggers the crumble', () => {
    const state = startCrumble(0);
    expect(crumbleHasCollision(state, 0)).toBe(true);
    expect(crumbleHasCollision(state, 0.4)).toBe(true);
    expect(crumbleHasCollision(state, 0.5)).toBe(false);
  });

  it('respawns 4 s after falling through', () => {
    let state = startCrumble(0);
    state = stepCrumble(state, 0.5); // still counting down to the 4 s respawn
    expect(state.respawned).toBe(false);
    state = stepCrumble(state, 4.5);
    expect(state.respawned).toBe(true);
    expect(state.crumbling).toBe(false);
  });
});
