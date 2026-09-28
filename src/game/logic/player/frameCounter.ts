/**
 * Every forgiveness window (PLAN.md §4.7) is a frame counter at 60 Hz. Countdown counters use
 * -1 for "inactive" and are "active" while at or above 0; count-up counters (the interact ring)
 * grow from 0 toward a target. All pure, no Phaser, no wall-clock time: one call per tick.
 */

export const COUNTER_INACTIVE = -1;

/** Start (or restart) a countdown counter at N frames, active for this tick and the next N. */
export function startCountdown(framesValue: number): number {
  return framesValue;
}

/** Advance a countdown counter by one tick; clamps at -1 (inactive). Call once per tick when no reset happens. */
export function tickCountdown(value: number): number {
  return value > COUNTER_INACTIVE ? value - 1 : COUNTER_INACTIVE;
}

/** A countdown counter is consumable (a coyote or buffered jump may fire) while at or above 0. */
export function isCountdownActive(value: number): boolean {
  return value >= 0;
}

/** Immediately spend a countdown counter (a jump started, a ledge dropped, a creeper released). */
export function consumeCountdown(): number {
  return COUNTER_INACTIVE;
}

/** A lock counter (the ledge regrab lock) blocks a rule while strictly positive. */
export function isLocked(value: number): boolean {
  return value > 0;
}

/** Advance a count-up counter (the interact ring) by one tick while held, clamped at its target. */
export function tickCountUp(value: number, held: boolean, targetFrames: number): number {
  if (!held) return 0;
  return Math.min(value + 1, targetFrames);
}

export function isCountUpComplete(value: number, targetFrames: number): boolean {
  return value >= targetFrames;
}
