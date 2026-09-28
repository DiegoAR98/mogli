/**
 * S4 path-follower platforms (GDD §3.4, §6.2-6.3): a waypoint mover with flags carry, swing
 * (pendulum), crumble, bounce, advanceOnHit, sineEase. This file starts with the swing and
 * crumble flags used by the M1 gym level; the other flags arrive with the zones that need them.
 */

import { RUN_SPEED_PX_S } from '../../data/tuning';

// --- Swing flag: swinging creepers (GDD §6.2) -------------------------------------------------

/** Simple-pendulum period under a given "gravity" (the design borrows the player's rising gravity, GDD §6.2). */
export function pendulumPeriodS(lengthPx: number, gravityPxS2: number): number {
  return 2 * Math.PI * Math.sqrt(lengthPx / gravityPxS2);
}

/** Angular position (radians from vertical) of a pendulum released from its amplitude, at time t. */
export function pendulumAngleRad(amplitudeRad: number, periodS: number, timeS: number): number {
  return amplitudeRad * Math.cos((2 * Math.PI * timeS) / periodS);
}

/**
 * Release velocity leaving a swinging creeper: the rope end's current horizontal velocity,
 * capped at the run speed, plus the jump's horizontal boost (GDD §6.2).
 */
export function swingReleaseVx(ropeEndVxPxS: number, boostPxS: number, runSpeedCapPxS: number = RUN_SPEED_PX_S): number {
  const cappedRopeVx = Math.sign(ropeEndVxPxS) * Math.min(Math.abs(ropeEndVxPxS), runSpeedCapPxS);
  return cappedRopeVx + Math.sign(ropeEndVxPxS || 1) * boostPxS;
}

export interface PendulumKinematics {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Position and velocity of the rope end at time t, pivoting on (pivotX, pivotY) (GDD §6.2). */
export function pendulumKinematics(pivotX: number, pivotY: number, lengthPx: number, amplitudeRad: number, periodS: number, timeS: number): PendulumKinematics {
  const omega = (2 * Math.PI) / periodS;
  const angle = amplitudeRad * Math.cos(omega * timeS);
  const angularVelocity = -amplitudeRad * omega * Math.sin(omega * timeS);
  return {
    x: pivotX + lengthPx * Math.sin(angle),
    y: pivotY + lengthPx * Math.cos(angle),
    vx: lengthPx * Math.cos(angle) * angularVelocity,
    vy: -lengthPx * Math.sin(angle) * angularVelocity,
  };
}

// --- Crumble flag: crumbling terraces and ledges (GDD §6.3) -----------------------------------

export interface CrumbleState {
  crumbling: boolean;
  fallenAtS: number | null; // simulation time the tile started to fall, or null
  respawned: boolean;
}

const CRUMBLE_DELAY_S = 0.5;
const CRUMBLE_RESPAWN_S = 4;

export function startCrumble(nowS: number): CrumbleState {
  return { crumbling: true, fallenAtS: nowS + CRUMBLE_DELAY_S, respawned: false };
}

export function stepCrumble(state: CrumbleState, nowS: number): CrumbleState {
  if (!state.crumbling || state.fallenAtS === null) return state;
  if (nowS >= state.fallenAtS + CRUMBLE_RESPAWN_S) {
    return { crumbling: false, fallenAtS: null, respawned: true };
  }
  return state;
}

/** The platform has collision only before it has fallen through (its falling art has no collision, GDD §6.3). */
export function crumbleHasCollision(state: CrumbleState, nowS: number): boolean {
  if (!state.crumbling || state.fallenAtS === null) return true;
  return nowS < state.fallenAtS;
}
