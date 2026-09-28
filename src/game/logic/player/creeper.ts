/**
 * Static creepers and tree-roads (GDD §6.1): auto-grab, climb, throw-while-climbing and release.
 * Swinging creepers (the pendulum) are S4 path-followers; see logic/platforms/PathFollower.ts.
 */

import { CLIMB_SPEED_PX_S, CREEPER_HORIZONTAL_SPEED_PX_S } from '../../data/tuning';

export interface CreeperGrabInput {
  overlappingCreeper: boolean;
  grounded: boolean;
  upPressed: boolean;
  fallingWithDownHeld: boolean;
}

/** Auto-grab on overlap while airborne, or Up pressed while grounded under a creeper; Down held while falling suppresses it. */
export function canGrabCreeper(input: CreeperGrabInput): boolean {
  if (input.fallingWithDownHeld) return false;
  if (input.overlappingCreeper && !input.grounded) return true;
  if (input.grounded && input.upPressed) return true;
  return false;
}

export interface CreeperClimbInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  horizontalCreeper: boolean; // true on a tree-road (horizontal creeper)
}

export function creeperClimbVelocity(input: CreeperClimbInput): { vx: number; vy: number } {
  let vy = 0;
  if (input.up) vy -= CLIMB_SPEED_PX_S;
  if (input.down) vy += CLIMB_SPEED_PX_S;

  let vx = 0;
  if (input.horizontalCreeper) {
    if (input.left) vx -= CREEPER_HORIZONTAL_SPEED_PX_S;
    if (input.right) vx += CREEPER_HORIZONTAL_SPEED_PX_S;
  }

  return { vx, vy };
}

/** Throwing is allowed from every creeper with the full 8-way aim; there is no hidden refusal (GDD §6.1). */
export function throwAllowedOnCreeper(): boolean {
  return true;
}
