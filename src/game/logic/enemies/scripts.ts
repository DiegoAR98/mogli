/**
 * S3 enemy scripts (GDD §3.4, §7.6-7.7): four behaviors with flags. M1 ships the Lobber only
 * (the langur); Charger, Turret and Diver arrive with the zones that introduce them.
 */

import {
  BULDEO_BOAST_S,
  BULDEO_CHASE_DURATION_S,
  BULDEO_DETECT_GRACE_S,
  CHARGER_FLEE_S,
  CHARGER_TELEGRAPH_S,
  DOG_LUNGE_DURATION_S,
  DOG_RECOVER_S,
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
 *
 * rangeGate (quill-pigs, GDD §7.7 #4: "within 5 tiles it stops and shakes two quills loose"):
 * the patrol timer only accumulates while true, so a stationary langur (always true) and a
 * waddling quill-pig that only throws once Mowgli is close share this one state machine.
 */
export function stepLobber(
  state: LobberState,
  dtS: number,
  stompedOrScared: boolean,
  rangeGate: boolean = true,
  cycleS: number = LOBBER_THROW_CYCLE_S,
  telegraphS: number = LOBBER_TELEGRAPH_S,
): { state: LobberState; didThrow: boolean } {
  if (stompedOrScared && state.phase !== 'fleeing' && state.phase !== 'stunned') {
    return { state: { phase: 'fleeing', timerS: 0 }, didThrow: false };
  }

  if (state.phase === 'patrol' && !rangeGate) {
    return { state: { phase: 'patrol', timerS: 0 }, didThrow: false };
  }

  const timerS = state.timerS + dtS;

  switch (state.phase) {
    case 'patrol':
      if (timerS >= cycleS - telegraphS) {
        return { state: { phase: 'telegraph', timerS: 0 }, didThrow: false };
      }
      return { state: { phase: 'patrol', timerS }, didThrow: false };

    case 'telegraph':
      if (timerS >= telegraphS) {
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

export type ChargerPhase = 'patrol' | 'telegraph' | 'stealing' | 'carrying' | 'charging' | 'recovering' | 'fleeing';

export interface ChargerState {
  phase: ChargerPhase;
  timerS: number;
  /** Which of the two telegraph-triggering behaviors is in play, decided when the telegraph
   * starts, so it still knows which phase to continue into once the telegraph ends. */
  reason: 'steal' | 'lunge' | null;
}

export function initialChargerState(): ChargerState {
  return { phase: 'patrol', timerS: 0, reason: null };
}

export interface ChargerStepInput {
  hitOrStomped: boolean;
  thief: boolean;
  stoneNearby: boolean;
  reachedStone: boolean;
  /** Dogs only (GDD §7.7 #2): a charge sub-mode distinct from Tabaqui's steal. */
  lungeEnabled?: boolean;
  playerInLine?: boolean;
}

export interface ChargerStepResult {
  state: ChargerState;
  startedStealing: boolean;
  pickedUpStone: boolean;
  droppedStone: boolean;
  startedCharging: boolean;
}

const NO_RESULT_FLAGS = { startedStealing: false, pickedUpStone: false, droppedStone: false, startedCharging: false };

export function stepCharger(state: ChargerState, dtS: number, input: ChargerStepInput): ChargerStepResult {
  if (input.hitOrStomped && state.phase !== 'fleeing') {
    return { state: { phase: 'fleeing', timerS: 0, reason: null }, ...NO_RESULT_FLAGS, droppedStone: state.phase === 'carrying' };
  }

  const timerS = state.timerS + dtS;

  switch (state.phase) {
    case 'patrol':
      if (input.thief && input.stoneNearby) {
        return { state: { phase: 'telegraph', timerS: 0, reason: 'steal' }, ...NO_RESULT_FLAGS };
      }
      if (input.lungeEnabled && input.playerInLine) {
        return { state: { phase: 'telegraph', timerS: 0, reason: 'lunge' }, ...NO_RESULT_FLAGS };
      }
      return { state: { phase: 'patrol', timerS, reason: null }, ...NO_RESULT_FLAGS };

    case 'telegraph':
      if (timerS >= CHARGER_TELEGRAPH_S) {
        if (state.reason === 'lunge') {
          return { state: { phase: 'charging', timerS: 0, reason: 'lunge' }, ...NO_RESULT_FLAGS, startedCharging: true };
        }
        return { state: { phase: 'stealing', timerS: 0, reason: 'steal' }, ...NO_RESULT_FLAGS, startedStealing: true };
      }
      return { state: { ...state, timerS }, ...NO_RESULT_FLAGS };

    case 'stealing':
      if (input.reachedStone) {
        return { state: { phase: 'carrying', timerS: 0, reason: null }, ...NO_RESULT_FLAGS, pickedUpStone: true };
      }
      return { state: { ...state, timerS }, ...NO_RESULT_FLAGS };

    case 'charging':
      if (timerS >= DOG_LUNGE_DURATION_S) {
        return { state: { phase: 'recovering', timerS: 0, reason: null }, ...NO_RESULT_FLAGS };
      }
      return { state: { ...state, timerS }, ...NO_RESULT_FLAGS };

    case 'recovering':
      if (timerS >= DOG_RECOVER_S) {
        return { state: { phase: 'patrol', timerS: 0, reason: null }, ...NO_RESULT_FLAGS };
      }
      return { state: { ...state, timerS }, ...NO_RESULT_FLAGS };

    case 'carrying':
      return { state: { ...state, timerS }, ...NO_RESULT_FLAGS };

    case 'fleeing':
    default:
      if (timerS >= CHARGER_FLEE_S) {
        return { state: { phase: 'patrol', timerS: 0, reason: null }, ...NO_RESULT_FLAGS };
      }
      return { state: { phase: 'fleeing', timerS, reason: null }, ...NO_RESULT_FLAGS };
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

// --- Buldeo (GDD §7.7 "he takes no hits and is not an enemy entry"; §10.7): a pursuit hazard --
// with no stealth system. A Charger NPC on a fixed route; a 0.5 s grace inside his detect cone
// puts a "!" over his head and starts a 6 s chase toward Mowgli's x; then he boasts and returns
// to his route. This is deliberately its own small state machine rather than another stepCharger
// extension: Buldeo is not part of the 8-entry enemy roster, takes no hits, and is never
// stomped or scared -- a materially different contract from every Charger-script enemy.

export type BuldeoPhase = 'patrol' | 'detecting' | 'chasing' | 'boasting';

export interface BuldeoState {
  phase: BuldeoPhase;
  timerS: number;
}

export function initialBuldeoState(): BuldeoState {
  return { phase: 'patrol', timerS: 0 };
}

export interface BuldeoStepInput {
  playerInDetectZone: boolean;
}

export function stepBuldeo(state: BuldeoState, dtS: number, input: BuldeoStepInput): BuldeoState {
  const timerS = state.timerS + dtS;

  switch (state.phase) {
    case 'patrol':
      if (input.playerInDetectZone) return { phase: 'detecting', timerS: 0 };
      return { phase: 'patrol', timerS: 0 };

    case 'detecting':
      if (!input.playerInDetectZone) return { phase: 'patrol', timerS: 0 };
      if (timerS >= BULDEO_DETECT_GRACE_S) return { phase: 'chasing', timerS: 0 };
      return { phase: 'detecting', timerS };

    case 'chasing':
      if (timerS >= BULDEO_CHASE_DURATION_S) return { phase: 'boasting', timerS: 0 };
      return { phase: 'chasing', timerS };

    case 'boasting':
    default:
      if (timerS >= BULDEO_BOAST_S) return { phase: 'patrol', timerS: 0 };
      return { phase: 'boasting', timerS };
  }
}
