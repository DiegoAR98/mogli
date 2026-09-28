/**
 * Pure jump-arc math (GDD §5.2): v0 = 2h/t, g = 2h/t^2.
 * Used both to derive the tuning.ts constants from the design's height/time inputs and
 * to compute jump apex/range for level-design measurement (the M1 gym level's reach check).
 */

export interface JumpCurve {
  launchSpeedPxS: number;
  risingGravityPxS2: number;
}

export function deriveJumpCurve(heightPx: number, timeToApexS: number): JumpCurve {
  return {
    launchSpeedPxS: (2 * heightPx) / timeToApexS,
    risingGravityPxS2: (2 * heightPx) / (timeToApexS * timeToApexS),
  };
}

export function fallingGravity(risingGravityPxS2: number, fallingMultiplier: number): number {
  return risingGravityPxS2 * fallingMultiplier;
}

export function apexHangGravity(risingGravityPxS2: number, apexHangMultiplier: number): number {
  return risingGravityPxS2 * apexHangMultiplier;
}

/** Time to fall a given height under constant gravity, starting from zero vertical speed. */
export function fallTimeS(heightPx: number, gravityPxS2: number): number {
  return Math.sqrt((2 * heightPx) / gravityPxS2);
}

/**
 * Estimated horizontal reach at full run: rise time + fall time from apex + a small apex-hang
 * bonus, times the run speed, plus half the body width on each side (GDD §5.3). This is the
 * "measure in M1" estimate; the gym level's T05 scenario replaces it with a played value.
 */
export function horizontalReachPx(
  runSpeedPxS: number,
  timeToApexS: number,
  jumpHeightPx: number,
  fallingGravityPxS2: number,
  apexHangBonusS: number,
  bodyWidthPx: number,
): number {
  const fallS = fallTimeS(jumpHeightPx, fallingGravityPxS2);
  const airTimeS = timeToApexS + fallS + apexHangBonusS;
  return runSpeedPxS * airTimeS + bodyWidthPx;
}
