/**
 * Garlic (GDD §7.3, L7's timed item): bees ignore Mowgli while the meter is up. Unlike the Red
 * Flower it is not toggled lit/snuffed -- rubbing it (picking it up) starts protection outright,
 * and it just counts down, the same shape GDD §7.3's "same data class" note describes.
 */

import { GARLIC_CAP_S, GARLIC_SECONDS_PER_RUB } from '../../data/tuning';

export interface GarlicState {
  meterS: number;
}

export function initialGarlicState(): GarlicState {
  return { meterS: 0 };
}

export function rubGarlic(state: GarlicState): GarlicState {
  return { meterS: Math.min(GARLIC_CAP_S, state.meterS + GARLIC_SECONDS_PER_RUB) };
}

export function tickGarlic(state: GarlicState, dtS: number): GarlicState {
  return { meterS: Math.max(0, state.meterS - dtS) };
}

export function isGarlicActive(state: GarlicState): boolean {
  return state.meterS > 0;
}
