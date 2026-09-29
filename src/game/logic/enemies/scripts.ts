/**
 * S3 enemy scripts (GDD §3.4, §7.6-7.7): four behaviors with flags. M1 ships the Lobber only
 * (the langur); Charger, Turret and Diver arrive with the zones that introduce them.
 */

import {
  CHARGER_FLEE_S,
  CHARGER_TELEGRAPH_S,
  LOBBER_TELEGRAPH_S,
  LOBBER_THROW_CYCLE_S,
  SNAKE_GATE_CALM_S,
  TURRET_HIDE_S,
  TURRET_HITS_TO_HIDE,
  TURRET_LUNGE_ACTIVE_S,
  TURRET_REST_S,
  TURRET_TELEGRAPH_S,
} from '../../data/tuning';

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

// --- Charger script (GDD §7.7 #2): Tabaqui, jackals and village dogs -----------------------------
//
// A carrier-flag entry (Tabaqui, jackals) never deals contact damage. Only a "thief" entry
// (Tabaqui) steals: it telegraphs, walks to the nearest uncollected floor stone in range, picks
// it up and carries it off, dropping the stone where it stands if hit or stomped. A non-thief
// carrier (a patrolling jackal) never leaves the patrol phase on its own. The spatial parts
// (which stone is nearest, whether the walk has reached it) are PlayScene's job; this module
// only owns the phase timers, exactly like stepLobber.

export type ChargerPhase = 'patrol' | 'telegraph' | 'stealing' | 'carrying' | 'fleeing';

export interface ChargerState {
  phase: ChargerPhase;
  timerS: number;
}

export function initialChargerState(): ChargerState {
  return { phase: 'patrol', timerS: 0 };
}

export interface ChargerStepInput {
  hitOrStomped: boolean;
  thief: boolean;
  stoneNearby: boolean;
  reachedStone: boolean;
}

export interface ChargerStepResult {
  state: ChargerState;
  startedStealing: boolean;
  pickedUpStone: boolean;
  droppedStone: boolean;
}

export function stepCharger(state: ChargerState, dtS: number, input: ChargerStepInput): ChargerStepResult {
  if (input.hitOrStomped && state.phase !== 'fleeing') {
    return { state: { phase: 'fleeing', timerS: 0 }, startedStealing: false, pickedUpStone: false, droppedStone: state.phase === 'carrying' };
  }

  const timerS = state.timerS + dtS;

  switch (state.phase) {
    case 'patrol':
      if (input.thief && input.stoneNearby) {
        return { state: { phase: 'telegraph', timerS: 0 }, startedStealing: false, pickedUpStone: false, droppedStone: false };
      }
      return { state: { phase: 'patrol', timerS }, startedStealing: false, pickedUpStone: false, droppedStone: false };

    case 'telegraph':
      if (timerS >= CHARGER_TELEGRAPH_S) {
        return { state: { phase: 'stealing', timerS: 0 }, startedStealing: true, pickedUpStone: false, droppedStone: false };
      }
      return { state: { phase: 'telegraph', timerS }, startedStealing: false, pickedUpStone: false, droppedStone: false };

    case 'stealing':
      if (input.reachedStone) {
        return { state: { phase: 'carrying', timerS: 0 }, startedStealing: false, pickedUpStone: true, droppedStone: false };
      }
      return { state: { phase: 'stealing', timerS }, startedStealing: false, pickedUpStone: false, droppedStone: false };

    case 'carrying':
      return { state: { phase: 'carrying', timerS }, startedStealing: false, pickedUpStone: false, droppedStone: false };

    case 'fleeing':
    default:
      if (timerS >= CHARGER_FLEE_S) {
        return { state: { phase: 'patrol', timerS: 0 }, startedStealing: false, pickedUpStone: false, droppedStone: false };
      }
      return { state: { phase: 'fleeing', timerS }, startedStealing: false, pickedUpStone: false, droppedStone: false };
  }
}

// --- Turret script (GDD §7.7 #3): the cobra of the Poison People, quill-pigs (straight-shot ---
// variant) and white cobras reuse this same shape. Never stompable (D40): the head is not a
// platform. Two hits sink it into its hole; the Snake-gate calms a room the same way, for its
// own duration, without counting as a hit.

export type TurretPhase = 'idle' | 'telegraph' | 'lunge' | 'rest' | 'hidden';

export interface TurretState {
  phase: TurretPhase;
  timerS: number;
  hideForS: number;
  hitsTaken: number;
}

export function initialTurretState(): TurretState {
  return { phase: 'idle', timerS: 0, hideForS: 0, hitsTaken: 0 };
}

export interface TurretStepInput {
  playerInRange: boolean;
  hit: boolean;
  calmed: boolean;
}

export interface TurretStepResult {
  state: TurretState;
  didLunge: boolean;
}

export function stepTurret(state: TurretState, dtS: number, input: TurretStepInput): TurretStepResult {
  if (input.calmed && state.phase !== 'hidden') {
    return { state: { phase: 'hidden', timerS: 0, hideForS: SNAKE_GATE_CALM_S, hitsTaken: 0 }, didLunge: false };
  }

  if (input.hit && state.phase !== 'hidden') {
    const hitsTaken = state.hitsTaken + 1;
    if (hitsTaken >= TURRET_HITS_TO_HIDE) {
      return { state: { phase: 'hidden', timerS: 0, hideForS: TURRET_HIDE_S, hitsTaken: 0 }, didLunge: false };
    }
    return { state: { ...state, hitsTaken }, didLunge: false };
  }

  const timerS = state.timerS + dtS;

  switch (state.phase) {
    case 'idle':
      if (input.playerInRange) {
        return { state: { phase: 'telegraph', timerS: 0, hideForS: 0, hitsTaken: state.hitsTaken }, didLunge: false };
      }
      return { state, didLunge: false };

    case 'telegraph':
      if (timerS >= TURRET_TELEGRAPH_S) {
        return { state: { ...state, phase: 'lunge', timerS: 0 }, didLunge: true };
      }
      return { state: { ...state, timerS }, didLunge: false };

    case 'lunge':
      if (timerS >= TURRET_LUNGE_ACTIVE_S) {
        return { state: { ...state, phase: 'rest', timerS: 0 }, didLunge: false };
      }
      return { state: { ...state, timerS }, didLunge: false };

    case 'rest':
      if (timerS >= TURRET_REST_S) {
        return { state: { ...state, phase: 'idle', timerS: 0 }, didLunge: false };
      }
      return { state: { ...state, timerS }, didLunge: false };

    case 'hidden':
    default:
      if (timerS >= state.hideForS) {
        return { state: { phase: 'idle', timerS: 0, hideForS: 0, hitsTaken: 0 }, didLunge: false };
      }
      return { state: { ...state, timerS }, didLunge: false };
  }
}

/** Cobras and white cobras are never stompable (GDD §7.4): "the head is not a platform." */
export function turretIsStompable(): false {
  return false;
}
