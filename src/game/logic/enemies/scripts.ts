/**
 * S3 enemy scripts (GDD §3.4, §7.6-7.7): four behaviors with flags. M1 ships the Lobber only
 * (the langur); Charger, Turret and Diver arrive with the zones that introduce them.
 */

import { LOBBER_TELEGRAPH_S, LOBBER_THROW_CYCLE_S } from '../../data/tuning';

export type LobberPhase = 'patrol' | 'telegraph' | 'throw' | 'cooldown' | 'fleeing' | 'stunned';

export interface LobberState {
  phase: LobberPhase;
  timerS: number;
}

export function initialLobberState(): LobberState {
  return { phase: 'patrol', timerS: 0 };
}

/**
 * One step of the Lobber cycle: patrol, a 0.6 s telegraph (the rear-up pose, GDD §7.6-7.7),
 * a throw, then cooldown until the next 2.0 s cycle. A stomp or the Red Flower interrupts to
 * fleeing at any point (D40, GDD §7.3); fleeing never re-enters the throw cycle on its own.
 */
export function stepLobber(state: LobberState, dtS: number, stompedOrScared: boolean): { state: LobberState; didThrow: boolean } {
  if (stompedOrScared && state.phase !== 'fleeing' && state.phase !== 'stunned') {
    return { state: { phase: 'fleeing', timerS: 0 }, didThrow: false };
  }

  const timerS = state.timerS + dtS;

  switch (state.phase) {
    case 'patrol':
      if (timerS >= LOBBER_THROW_CYCLE_S - LOBBER_TELEGRAPH_S) {
        return { state: { phase: 'telegraph', timerS: 0 }, didThrow: false };
      }
      return { state: { phase: 'patrol', timerS }, didThrow: false };

    case 'telegraph':
      if (timerS >= LOBBER_TELEGRAPH_S) {
        return { state: { phase: 'throw', timerS: 0 }, didThrow: true };
      }
      return { state: { phase: 'telegraph', timerS }, didThrow: false };

    case 'throw':
      return { state: { phase: 'cooldown', timerS: 0 }, didThrow: false };

    case 'cooldown':
      return { state: { phase: 'patrol', timerS: 0 }, didThrow: false };

    case 'fleeing':
    case 'stunned':
    default:
      return { state, didThrow: false };
  }
}

/** Stomp scatters a regular enemy (D40); cobras, quill-pigs, bees, Buldeo and bosses are never stompable. */
export function stompScatters(stompable: boolean): boolean {
  return stompable;
}
