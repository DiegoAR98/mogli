/**
 * S6 ExitNPC (GDD §3.4, §9.1): the level's exit character (Akela in L1). Inactive until the
 * quota is met, then beckons; touching it while beckoning exits the level. The quota chain's
 * presentation (the gold flip, the sting, the 3 s silhouette, the 2 s toast) is a scene-side
 * timer sequence, not gameplay rule, so it lives in HudScene; this module only owns the
 * exit character's own three states and the quota-met check that drives them.
 */

export type ExitNpcPhase = 'inactive' | 'beckon' | 'exited';

export interface ExitNpcState {
  phase: ExitNpcPhase;
}

export function initialExitNpcState(): ExitNpcState {
  return { phase: 'inactive' };
}

export function activateBeckon(state: ExitNpcState): ExitNpcState {
  return state.phase === 'inactive' ? { phase: 'beckon' } : state;
}

export function touchExit(state: ExitNpcState, touching: boolean): { state: ExitNpcState; exited: boolean } {
  if (state.phase === 'beckon' && touching) {
    return { state: { phase: 'exited' }, exited: true };
  }
  return { state, exited: false };
}

export interface QuotaState {
  met: boolean;
}

export function initialQuotaState(): QuotaState {
  return { met: false };
}

/** GDD §9.1 "Quota met": the counter flips gold, the sting plays, the exit character beckons. */
export function checkQuota(state: QuotaState, stonesCollected: number, quota: number): { state: QuotaState; justMet: boolean } {
  if (state.met) return { state, justMet: false };
  const met = stonesCollected >= quota;
  return { state: { met }, justMet: met };
}
