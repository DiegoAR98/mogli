/**
 * Hit response (GDD §7.5): a tier's damage in leaf pips, a knockback impulse away from the
 * source, 0.2 s of lost control, and 1.0 s of invulnerability with a 4 Hz blink. Depleting pips
 * to 0 is a respawn, same as a pit (PlayScene calls respawn() itself; this module only computes
 * the numbers).
 */

import { HIT_KNOCKBACK_PX_S, HIT_UPWARD_IMPULSE_PX_S } from '../../data/tuning';

export interface HitResult {
  pips: number;
  knockbackVx: number;
  knockbackVy: number;
  lethal: boolean;
}

/** knockbackDir is the direction Mowgli gets pushed (away from the hit's source). */
export function applyHit(currentPips: number, damagePips: number, knockbackDir: -1 | 1): HitResult {
  const pips = Math.max(0, currentPips - damagePips);
  return { pips, knockbackVx: knockbackDir * HIT_KNOCKBACK_PX_S, knockbackVy: -HIT_UPWARD_IMPULSE_PX_S, lethal: pips <= 0 };
}

export function canBeHit(iframesRemaining: number): boolean {
  return iframesRemaining <= 0;
}

/** 4 Hz blink: on for half the cycle, off for the other half, at 60 Hz that's a 15-frame period. */
export function isBlinkVisible(iframesRemaining: number): boolean {
  const BLINK_PERIOD_FRAMES = 15;
  return iframesRemaining <= 0 || Math.floor(iframesRemaining / (BLINK_PERIOD_FRAMES / 2)) % 2 === 0;
}
