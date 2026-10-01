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

// --- Carry flag: animal waypoint platforms (GDD §10.5-10.6: Hathi's sons, buffalo, Rama) ------
//
// A back-and-forth walker over 2+ waypoints that waits waitS at each one it reaches, used by
// every carry platform in the game (GDD §3.4 S4, §7.3 table). advanceOnHit (buffalo) is a
// temporary speed override layered on top by the caller (PlayScene), not a separate state shape.

export interface Waypoint {
  x: number;
  y: number;
}

export interface CarryPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  waiting: boolean;
}

/**
 * Position at time t of a walker shuttling back and forth across waypoints at speedPxS, pausing
 * waitS at each end it reaches. Deterministic and stateless (a pure function of t), so it needs
 * no stored runtime state beyond the waypoints themselves -- the same shape as pendulumKinematics.
 */
export function carryPosition(waypoints: Waypoint[], speedPxS: number, waitS: number, timeS: number): CarryPosition {
  if (waypoints.length < 2) {
    const p = waypoints[0] ?? { x: 0, y: 0 };
    return { x: p.x, y: p.y, vx: 0, vy: 0, waiting: true };
  }

  const legLengths: number[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    legLengths.push(Math.hypot(b.x - a.x, b.y - a.y));
  }
  const legTimes = legLengths.map((len) => len / speedPxS);
  const cycleS = legTimes.reduce((sum, t) => sum + t + waitS, 0) * 2; // there and back

  let t = ((timeS % cycleS) + cycleS) % cycleS;
  // Walk forward through the legs, then (past the midpoint) back through them in reverse.
  const half = cycleS / 2;
  const goingForward = t < half;
  if (!goingForward) t -= half;

  const legOrder = goingForward ? [...legTimes.keys()] : [...legTimes.keys()].reverse();
  for (const i of legOrder) {
    const legS = legTimes[i];
    if (t < legS) {
      const a = goingForward ? waypoints[i] : waypoints[i + 1];
      const b = goingForward ? waypoints[i + 1] : waypoints[i];
      const frac = legS === 0 ? 1 : t / legS;
      const dirX = b.x - a.x;
      const dirY = b.y - a.y;
      return { x: a.x + dirX * frac, y: a.y + dirY * frac, vx: (dirX / legS) || 0, vy: (dirY / legS) || 0, waiting: false };
    }
    t -= legS;
    if (t < waitS) {
      const stop = goingForward ? waypoints[i + 1] : waypoints[i];
      return { x: stop.x, y: stop.y, vx: 0, vy: 0, waiting: true };
    }
    t -= waitS;
  }

  const last = goingForward ? waypoints[waypoints.length - 1] : waypoints[0];
  return { x: last.x, y: last.y, vx: 0, vy: 0, waiting: true };
}

// --- Bounce flag: the trunk launch (GDD §10.5) -------------------------------------------------

/** Launch velocity reaching rangeTiles horizontally under the player's own jump gravity,
 * symmetric about the apex (lands level with the launch point, GDD §10.5's "5 tiles"). */
export function trunkLaunchVelocity(rangeTiles: number, gravityPxS2: number, launchSpeedPxS: number, tilePx: number): { vx: number; vy: number } {
  const timeToApexS = launchSpeedPxS / gravityPxS2;
  const totalAirTimeS = timeToApexS * 2;
  const vx = (rangeTiles * tilePx) / totalAirTimeS;
  return { vx, vy: -launchSpeedPxS };
}
