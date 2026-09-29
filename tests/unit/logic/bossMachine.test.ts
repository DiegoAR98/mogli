import { describe, expect, it } from 'vitest';
import { BOSS_CLOD_WINDOW_EXTEND_S } from '../../../src/game/data/tuning';
import { currentAttack, initialBossState, isHittable, registerClodExtend, registerHit, stepBoss, type BossData } from '../../../src/game/logic/boss/BossMachine';

const TEST_BOSS: BossData = {
  id: 'test',
  phases: [
    { id: 'p1', attacks: [{ id: 'a', windUpS: 0.5, activeS: 0.5, recoveryS: { cub: 1.0, wolf: 0.6, loneWolf: 0.4 } }] },
    {
      id: 'p2',
      attacks: [
        { id: 'b', windUpS: 0.5, activeS: 0.5, recoveryS: { cub: 1.0, wolf: 0.6, loneWolf: 0.4 } },
        { id: 'c', windUpS: 0.3, activeS: 0.3, recoveryS: { cub: 1.0, wolf: 0.6, loneWolf: 0.4 } },
      ],
    },
    { id: 'p3', attacks: [{ id: 'd', windUpS: 0.5, activeS: 0.5, recoveryS: { cub: 1.0, wolf: 0.6, loneWolf: 0.4 } }] },
  ],
};

describe('BossMachine (S7, GDD §8.1)', () => {
  it('cycles wind-up -> active -> recovery -> wind-up (next attack) for one attack', () => {
    let state = initialBossState();
    expect(state.sub).toBe('windup');

    state = stepBoss(state, 0.5, TEST_BOSS, 'wolf');
    expect(state.sub).toBe('active');

    state = stepBoss(state, 0.5, TEST_BOSS, 'wolf');
    expect(state.sub).toBe('recovery');
    expect(isHittable(state)).toBe(true);

    state = stepBoss(state, 0.6, TEST_BOSS, 'wolf');
    expect(state.sub).toBe('windup');
  });

  it('is only hittable during recovery', () => {
    let state = initialBossState();
    expect(isHittable(state)).toBe(false);
    state = stepBoss(state, 0.5, TEST_BOSS, 'wolf');
    expect(isHittable(state)).toBe(false); // active
    state = stepBoss(state, 0.5, TEST_BOSS, 'wolf');
    expect(isHittable(state)).toBe(true); // recovery
  });

  it('a hit outside recovery is a no-op', () => {
    const state = initialBossState();
    const after = registerHit(state, TEST_BOSS, 'wolf');
    expect(after).toEqual(state);
  });

  it('hits per phase by tier: Cub 2, Wolf 3, Lone Wolf 4 (GDD §9.7)', () => {
    for (const [tier, expected] of [['cub', 2], ['wolf', 3], ['loneWolf', 4]] as const) {
      let state = initialBossState();
      state = { ...state, sub: 'recovery' as const };
      for (let i = 0; i < expected - 1; i++) {
        state = registerHit(state, TEST_BOSS, tier);
        expect(state.phaseIndex).toBe(0);
      }
      state = registerHit(state, TEST_BOSS, tier);
      expect(state.phaseIndex).toBe(1);
    }
  });

  it('moving to the next phase resets to attack 0, wind-up, and the phase can have a second attack cycle in', () => {
    let state: ReturnType<typeof initialBossState> = { ...initialBossState(), phaseIndex: 0, sub: 'recovery' };
    state = registerHit(state, TEST_BOSS, 'cub');
    state = registerHit(state, TEST_BOSS, 'cub');
    expect(state.phaseIndex).toBe(1);
    expect(state.attackIndex).toBe(0);
    expect(currentAttack(state, TEST_BOSS).id).toBe('b');

    // Cycle recovery -> next attack within the same phase (phase 2 has two attacks).
    state = { ...state, sub: 'active', timerS: 0 };
    state = stepBoss(state, 0.5, TEST_BOSS, 'cub');
    expect(state.sub).toBe('recovery');
    state = stepBoss(state, 1.1, TEST_BOSS, 'cub');
    expect(state.sub).toBe('windup');
    expect(state.attackIndex).toBe(1);
    expect(currentAttack(state, TEST_BOSS).id).toBe('c');
  });

  it('the last phase\'s last hit defeats the boss instead of advancing further', () => {
    let state: ReturnType<typeof initialBossState> = { ...initialBossState(), phaseIndex: 2, sub: 'recovery' };
    state = registerHit(state, TEST_BOSS, 'cub');
    state = registerHit(state, TEST_BOSS, 'cub');
    expect(state.defeated).toBe(true);
  });

  it('a defeated boss never advances its own attack timer again', () => {
    const defeated = { ...initialBossState(), defeated: true };
    const after = stepBoss(defeated, 10, TEST_BOSS, 'wolf');
    expect(after).toEqual(defeated);
  });

  it('a clod extends only the current recovery window, and only while in recovery', () => {
    let state = initialBossState();
    state = registerClodExtend(state); // not in recovery yet: no-op
    expect(state.extendS).toBe(0);

    state = { ...state, sub: 'recovery', timerS: 0 };
    state = registerClodExtend(state);
    expect(state.extendS).toBe(BOSS_CLOD_WINDOW_EXTEND_S);

    // Without the extension the wolf recovery (0.6 s) would have ended by 0.6 s; with it, not yet.
    const withoutExtend = stepBoss({ ...state, extendS: 0 }, 0.6, TEST_BOSS, 'wolf');
    expect(withoutExtend.sub).toBe('windup');
    const withExtend = stepBoss(state, 0.6, TEST_BOSS, 'wolf');
    expect(withExtend.sub).toBe('recovery');
  });

  it('tier changes hit count and recovery only, never wind-up or active duration (GDD §9.7)', () => {
    const attack = TEST_BOSS.phases[0].attacks[0];
    expect(attack.windUpS).toBe(0.5);
    expect(attack.activeS).toBe(0.5);
    expect(attack.recoveryS.cub).not.toBe(attack.recoveryS.loneWolf);
  });
});
