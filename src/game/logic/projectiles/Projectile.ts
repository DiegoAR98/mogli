/**
 * S2 projectile class (GDD §3.4, §7.1): one shape, several parameter sets. M1 ships the nut only;
 * clod and the enemy/boss sets arrive with the zones and bosses that throw them.
 */

import {
  CLOD_CAP,
  CLOD_DAMAGE,
  CLOD_PILE_COUNT,
  CLOD_RANGE_TILES,
  CLOD_SPEED_PX_S,
  NUT_COOLDOWN_S,
  NUT_DAMAGE,
  NUT_GRAVITY_MULTIPLIER,
  NUT_MAX_ONSCREEN,
  NUT_RANGE_TILES,
  NUT_SPEED_PX_S,
} from '../../data/tuning';

export interface ProjectileParams {
  speedPxS: number;
  gravityMultiplier: number; // 0 = straight flight, 1 = the player's own rising gravity
  cooldownS: number;
  maxOnScreen: number;
  rangeTiles: number;
  damage: number;
}

export const NUT_PARAMS: ProjectileParams = {
  speedPxS: NUT_SPEED_PX_S,
  gravityMultiplier: NUT_GRAVITY_MULTIPLIER,
  cooldownS: NUT_COOLDOWN_S,
  maxOnScreen: NUT_MAX_ONSCREEN,
  rangeTiles: NUT_RANGE_TILES,
  damage: NUT_DAMAGE,
};

export const CLOD_PARAMS: ProjectileParams = {
  speedPxS: CLOD_SPEED_PX_S,
  gravityMultiplier: 0,
  cooldownS: 0,
  maxOnScreen: Infinity,
  rangeTiles: CLOD_RANGE_TILES,
  damage: CLOD_DAMAGE,
};

export const CLOD_PILE_ROW = { count: CLOD_PILE_COUNT, cap: CLOD_CAP };

export type AimComponent = -1 | 0 | 1;

export interface AimDirection {
  dx: AimComponent;
  dy: AimComponent;
}

export interface AimInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  facing: -1 | 1;
}

/** The 8-way aim direction from held input, falling back to the facing direction when nothing is held (GDD §7.2). */
export function resolveAimDirection(input: AimInput): AimDirection {
  let dx: AimComponent = 0;
  if (input.left) dx = -1;
  else if (input.right) dx = 1;

  let dy: AimComponent = 0;
  if (input.up) dy = -1;
  else if (input.down) dy = 1;

  if (dx === 0 && dy === 0) {
    dx = input.facing;
  }

  return { dx, dy };
}

export function canThrow(onScreenCount: number, cooldownRemainingS: number, params: ProjectileParams): boolean {
  return cooldownRemainingS <= 0 && onScreenCount < params.maxOnScreen;
}

export function projectileVelocity(direction: AimDirection, params: ProjectileParams): { vx: number; vy: number } {
  return { vx: direction.dx * params.speedPxS, vy: direction.dy * params.speedPxS };
}

/** Gravity applied to the projectile in flight: the nut's light arc is a fraction of the player's own rising gravity. */
export function projectileGravityPxS2(params: ProjectileParams, playerRisingGravityPxS2: number): number {
  return params.gravityMultiplier * playerRisingGravityPxS2;
}
