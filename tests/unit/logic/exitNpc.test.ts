import { describe, expect, it } from 'vitest';
import { activateBeckon, checkQuota, initialExitNpcState, initialQuotaState, touchExit } from '../../../src/game/logic/collectibles/ExitNPC';

describe('ExitNPC and quota chain', () => {
  it('stays inactive until quota is met', () => {
    let quota = initialQuotaState();
    const result = checkQuota(quota, 5, 10);
    expect(result.justMet).toBe(false);
    quota = result.state;
    expect(quota.met).toBe(false);
  });

  it('fires justMet exactly once when the quota is crossed', () => {
    let quota = initialQuotaState();
    quota = checkQuota(quota, 9, 10).state;
    const crossing = checkQuota(quota, 10, 10);
    expect(crossing.justMet).toBe(true);
    quota = crossing.state;
    const again = checkQuota(quota, 11, 10);
    expect(again.justMet).toBe(false);
  });

  it('the exit NPC only beckons after activation, never before', () => {
    const npc = initialExitNpcState();
    expect(touchExit(npc, true).exited).toBe(false);
  });

  it('touching a beckoning exit NPC exits the level exactly once', () => {
    const npc = activateBeckon(initialExitNpcState());
    expect(npc.phase).toBe('beckon');
    const result = touchExit(npc, true);
    expect(result.exited).toBe(true);
    expect(result.state.phase).toBe('exited');
    expect(touchExit(result.state, true).exited).toBe(false);
  });

  it('activateBeckon is a no-op once already beckoning or exited', () => {
    const beckoning = activateBeckon(initialExitNpcState());
    expect(activateBeckon(beckoning)).toEqual(beckoning);
  });
});
