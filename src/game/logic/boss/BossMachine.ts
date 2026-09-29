/**
 * S7 BossMachine (GDD §8.1, §3.4): a generic, data-driven phase/attack/hit-count state machine.
 * Attacks are S3 scripts scaled up (Lobber, Charger, Turret per GDD §8.1); this module only
 * owns the wind-up/active/recovery timing and hit-count/phase bookkeeping every boss shares --
 * the actual attack shapes (a nut rain, a pendulum sweep, an advancing line) are PlayScene's
 * job, the same split every other S3 script already uses (stepLobber, stepCharger, stepTurret).
 */

import { BOSS_CLOD_WINDOW_EXTEND_S, BOSS_HITS_PER_PHASE_CUB, BOSS_HITS_PER_PHASE_LONE_WOLF, BOSS_HITS_PER_PHASE_WOLF } from '../../data/tuning';
import type { TierId } from '../../data/tiers';

export interface BossAttackData {
  id: string;
  windUpS: number;
  activeS: number;
  recoveryS: Record<TierId, number>;
}

export interface BossPhaseData {
  id: string;
  attacks: BossAttackData[]; // at most 2 (GDD §8.1)
}

export interface BossData {
  id: string;
  phases: BossPhaseData[]; // exactly 3 (GDD §8.1)
}

export type BossAttackSub = 'windup' | 'active' | 'recovery';

export interface BossMachineState {
  phaseIndex: number;
  attackIndex: number;
  sub: BossAttackSub;
  timerS: number;
  extendS: number;
  hitsThisPhase: number;
  defeated: boolean;
}

export function initialBossState(): BossMachineState {
  return { phaseIndex: 0, attackIndex: 0, sub: 'windup', timerS: 0, extendS: 0, hitsThisPhase: 0, defeated: false };
}

function hitsRequiredPerPhase(tier: TierId): number {
  return { cub: BOSS_HITS_PER_PHASE_CUB, wolf: BOSS_HITS_PER_PHASE_WOLF, loneWolf: BOSS_HITS_PER_PHASE_LONE_WOLF }[tier];
}

/** A boss (or an add it spawns) takes projectiles only during its recovery window (GDD §8.1). */
export function isHittable(state: BossMachineState): boolean {
  return state.sub === 'recovery' && !state.defeated;
}

export function currentAttack(state: BossMachineState, data: BossData): BossAttackData {
  return data.phases[state.phaseIndex].attacks[state.attackIndex];
}

/** A clod extends the current recovery window by BOSS_CLOD_WINDOW_EXTEND_S (GDD §7.1, §8.1). */
export function registerClodExtend(state: BossMachineState): BossMachineState {
  if (state.sub !== 'recovery') return state;
  return { ...state, extendS: state.extendS + BOSS_CLOD_WINDOW_EXTEND_S };
}

/** A projectile connecting inside the recovery window: one hit. At the phase's hit count, the
 * boss moves to the next phase (the midpoint transformation, GDD §8.1), or is defeated on the
 * last phase's last hit. Stomping an add never counts (GDD §8.1); the caller never calls this
 * for a stomp. */
export function registerHit(state: BossMachineState, data: BossData, tier: TierId): BossMachineState {
  if (!isHittable(state)) return state;

  const hitsThisPhase = state.hitsThisPhase + 1;
  if (hitsThisPhase < hitsRequiredPerPhase(tier)) {
    return { ...state, hitsThisPhase };
  }

  const nextPhaseIndex = state.phaseIndex + 1;
  if (nextPhaseIndex >= data.phases.length) {
    return { ...state, defeated: true, hitsThisPhase: 0 };
  }
  return { phaseIndex: nextPhaseIndex, attackIndex: 0, sub: 'windup', timerS: 0, extendS: 0, hitsThisPhase: 0, defeated: false };
}

export function stepBoss(state: BossMachineState, dtS: number, data: BossData, tier: TierId): BossMachineState {
  if (state.defeated) return state;

  const attack = currentAttack(state, data);
  const timerS = state.timerS + dtS;

  switch (state.sub) {
    case 'windup':
      if (timerS >= attack.windUpS) return { ...state, sub: 'active', timerS: 0 };
      return { ...state, timerS };

    case 'active':
      if (timerS >= attack.activeS) return { ...state, sub: 'recovery', timerS: 0 };
      return { ...state, timerS };

    case 'recovery': {
      const recoveryS = attack.recoveryS[tier] + state.extendS;
      if (timerS >= recoveryS) {
        const phase = data.phases[state.phaseIndex];
        const nextAttackIndex = (state.attackIndex + 1) % phase.attacks.length;
        return { ...state, attackIndex: nextAttackIndex, sub: 'windup', timerS: 0, extendS: 0 };
      }
      return { ...state, timerS };
    }
  }
}
