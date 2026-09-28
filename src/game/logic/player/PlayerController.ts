/**
 * S1 player controller (GDD §3.4, §5.4-5.5, §6.1-6.2): the state machine and every rule that
 * moves Mowgli, as pure functions over explicit numbers so they run in Vitest's node environment
 * and PlayScene.ts stays a thin adapter (PLAN.md §3.3 rule 1-2). No Phaser body objects here:
 * PlayScene reads these results and writes them onto the Arcade body each tick.
 */

import {
  AIR_ACCEL_PX_S2,
  AIR_BRAKE_PX_S2,
  AIR_TURN_BRAKE_PX_S2,
  APEX_HANG_GRAVITY_PX_S2,
  APEX_HANG_VY_THRESHOLD_PX_S,
  BODY_CROUCHED_H_PX,
  BODY_CROUCHED_W_PX,
  BODY_STANDING_H_PX,
  BODY_STANDING_W_PX,
  CORNER_CORRECTION_PX,
  CROUCH_THROW_HEIGHT_RATIO,
  FALLING_GRAVITY_PX_S2,
  FAST_FALL_SPEED_PX_S,
  GROUND_ACCEL_PX_S2,
  GROUND_BRAKE_PX_S2,
  JUMP_CUT_MULTIPLIER,
  LEDGE_GRAB_HORIZONTAL_PX,
  LEDGE_GRAB_VERTICAL_PX,
  MAX_FALL_SPEED_PX_S,
  RISING_GRAVITY_PX_S2,
  STEP_UP_PX,
  STOMP_BOUNCE_HELD_TILES,
  STOMP_BOUNCE_TILES,
  THROW_SHOULDER_HEIGHT_PX,
  TILE_PX,
  TURN_BRAKE_PX_S2,
} from '../../data/tuning';

export type PlayerStateName =
  | 'grounded'
  | 'crouched'
  | 'rising'
  | 'falling'
  | 'hanging'
  | 'pullingUp'
  | 'climbing'
  | 'swinging'
  | 'interacting'
  | 'hurt'
  | 'respawning';

export type HorizontalInput = -1 | 0 | 1;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// --- Running: acceleration, braking, turn braking (GDD §5.2, §5.4; D09) ---------------------

/** Integrates vx by one tick using the correct accel/brake/turn value, clamped to +/- maxSpeedPxS. */
export function integrateHorizontalVelocity(vx: number, inputDir: HorizontalInput, grounded: boolean, maxSpeedPxS: number, dtS: number): number {
  const accelPxS2 = horizontalAccelerationPxS2(vx, inputDir, grounded);
  if (inputDir === 0) {
    if (vx > 0) return Math.max(0, vx - accelPxS2 * dtS);
    if (vx < 0) return Math.min(0, vx + accelPxS2 * dtS);
    return 0;
  }
  const next = vx + inputDir * accelPxS2 * dtS;
  return Math.max(-maxSpeedPxS, Math.min(maxSpeedPxS, next));
}

export function horizontalAccelerationPxS2(vx: number, inputDir: HorizontalInput, grounded: boolean): number {
  const accel = grounded ? GROUND_ACCEL_PX_S2 : AIR_ACCEL_PX_S2;
  const brake = grounded ? GROUND_BRAKE_PX_S2 : AIR_BRAKE_PX_S2;
  const turn = grounded ? TURN_BRAKE_PX_S2 : AIR_TURN_BRAKE_PX_S2;

  if (inputDir === 0) {
    return vx === 0 ? 0 : brake;
  }

  const vxSign = Math.sign(vx);
  if (vxSign !== 0 && vxSign !== inputDir) {
    return turn;
  }
  return accel;
}

// --- Jump gravity: rising, apex hang, falling (GDD §5.2, §5.4; PLAN §4.7) -------------------

/** Gravity magnitude while rising (vy <= 0, positive Y is down): 457 in the apex band with Jump held, else 914. */
export function risingGravityPxS2(vy: number, jumpHeld: boolean): number {
  if (jumpHeld && Math.abs(vy) < APEX_HANG_VY_THRESHOLD_PX_S) {
    return APEX_HANG_GRAVITY_PX_S2;
  }
  return RISING_GRAVITY_PX_S2;
}

/** Gravity magnitude while falling (vy > 0): always the 1.6x falling value, apex hang never applies. */
export function fallingGravityPxS2(): number {
  return FALLING_GRAVITY_PX_S2;
}

/** Jump cut: releasing Jump while rising halves vy once; falls through unchanged otherwise. */
export function applyJumpCut(vy: number, releasedThisTick: boolean, alreadyCut: boolean): { vy: number; cutDone: boolean } {
  if (releasedThisTick && !alreadyCut && vy < 0) {
    return { vy: vy * JUMP_CUT_MULTIPLIER, cutDone: true };
  }
  return { vy, cutDone: alreadyCut };
}

/** Clamp downward speed: 320 px/s normally, 400 px/s while Down is held (fast fall). */
export function clampFallSpeed(vy: number, downHeld: boolean): number {
  const cap = downHeld ? FAST_FALL_SPEED_PX_S : MAX_FALL_SPEED_PX_S;
  return Math.min(vy, cap);
}

// --- Corner correction and step-up (GDD §5.5) -----------------------------------------------

/** A rising body overlapping a ceiling corner by at most 4 px, with free space past it, is nudged sideways; returns null if blocked. */
export function cornerCorrection(overlapPx: number, spacePastCornerIsFree: boolean): number | null {
  if (overlapPx <= CORNER_CORRECTION_PX && spacePastCornerIsFree) {
    return overlapPx;
  }
  return null;
}

/** A grounded body whose feet are at most 4 px below a lip, with the lip clear, steps onto it without a jump; returns null if blocked. */
export function stepUp(lipHeightPx: number, lipIsClear: boolean): number | null {
  if (lipHeightPx <= STEP_UP_PX && lipIsClear) {
    return lipHeightPx;
  }
  return null;
}

// --- Ledge grab and pull-up (GDD §5.5) --------------------------------------------------------

export interface LedgeCaptureParams {
  horizontalDistancePx: number;
  verticalDistancePx: number;
  vy: number; // > 0 is falling (positive Y down)
  downHeld: boolean;
  regrabLockFrames: number; // > 0 blocks capture of the same ledge
}

export function canCaptureLedge(params: LedgeCaptureParams): boolean {
  if (params.downHeld) return false;
  if (params.regrabLockFrames > 0) return false;
  if (params.vy <= 0) return false;
  return Math.abs(params.horizontalDistancePx) <= LEDGE_GRAB_HORIZONTAL_PX && Math.abs(params.verticalDistancePx) <= LEDGE_GRAB_VERTICAL_PX;
}

/** Pull-up only completes if the standing rectangle at the destination is clear; otherwise Mowgli stays hanging. */
export function canCompletePullUp(destinationRectClear: boolean): boolean {
  return destinationRectClear;
}

// --- Crouch geometry (GDD §5.1, §5.4, §7.2) ---------------------------------------------------

/** The standing collision body, feet-anchored at (feetX, feetY). */
export function standingBodyRect(feetX: number, feetY: number): Rect {
  return { x: feetX - BODY_STANDING_W_PX / 2, y: feetY - BODY_STANDING_H_PX, w: BODY_STANDING_W_PX, h: BODY_STANDING_H_PX };
}

/** The crouched collision body, feet-anchored at the same feet line as standing. */
export function crouchedBodyRect(feetX: number, feetY: number): Rect {
  return { x: feetX - BODY_CROUCHED_W_PX / 2, y: feetY - BODY_CROUCHED_H_PX, w: BODY_CROUCHED_W_PX, h: BODY_CROUCHED_H_PX };
}

/** Mowgli may only stand up if the standing rectangle at his feet does not overlap a solid. */
export function canStandUp(standingRectIsClear: boolean): boolean {
  return standingRectIsClear;
}

/** A throw from the crouch launches at half the standing shoulder height (GDD §7.2). */
export function crouchThrowHeightPx(shoulderHeightPx: number = THROW_SHOULDER_HEIGHT_PX): number {
  return shoulderHeightPx * CROUCH_THROW_HEIGHT_RATIO;
}

// --- Stomp bounce (GDD §7.4, D40) --------------------------------------------------------------

/** A stomp on a regular enemy bounces Mowgli 3 tiles, 3.5 with Jump held. */
export function stompBounceHeightPx(jumpHeld: boolean): number {
  return (jumpHeld ? STOMP_BOUNCE_HELD_TILES : STOMP_BOUNCE_TILES) * TILE_PX;
}
