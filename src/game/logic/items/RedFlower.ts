/**
 * S1 Red Flower item (GDD §7.3, D30): a clay fire-pot on a cord, the timed defensive item.
 * Picking up a pot adds to the meter (capped); Item toggles it lit or snuffed without spending
 * the meter; while lit, it drains; any regular enemy within the flee radius should flee (the
 * spatial "within radius" check is PlayScene's job, same split as the enemy scripts).
 */

import { RED_FLOWER_CAP_S, RED_FLOWER_FLEE_RADIUS_TILES, RED_FLOWER_SECONDS_PER_POT } from '../../data/tuning';

export interface RedFlowerState {
  meterS: number;
  lit: boolean;
}

export function initialRedFlowerState(): RedFlowerState {
  return { meterS: 0, lit: false };
}

export function pickUpPot(state: RedFlowerState): RedFlowerState {
  return { ...state, meterS: Math.min(RED_FLOWER_CAP_S, state.meterS + RED_FLOWER_SECONDS_PER_POT) };
}

/** Item press: toggles lit/snuffed and keeps the meter either way; a spent meter cannot be lit. */
export function toggleRedFlower(state: RedFlowerState): RedFlowerState {
  if (state.meterS <= 0) return { ...state, lit: false };
  return { ...state, lit: !state.lit };
}

export function tickRedFlower(state: RedFlowerState, dtS: number): RedFlowerState {
  if (!state.lit) return state;
  const meterS = Math.max(0, state.meterS - dtS);
  return { meterS, lit: meterS > 0 };
}

/** Whether an enemy at this distance should be in the Red Flower's flee state (GDD §7.3). */
export function isWithinFleeRadius(state: RedFlowerState, distanceTiles: number): boolean {
  return state.lit && distanceTiles <= RED_FLOWER_FLEE_RADIUS_TILES;
}
