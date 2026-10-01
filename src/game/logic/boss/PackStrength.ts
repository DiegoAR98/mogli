/**
 * Pack strength / the paw meter (GDD §8.5, B4 Red Dog at the Ford): a visible bonus of 0-5 paws
 * that only reduces pressure and never fails the fight. Starts from L8's rallied wolves, gains a
 * paw per hit on the leader, loses one when a dhole reaches Mowgli's rock, and each paw gives a
 * 10% chance to intercept a dhole before it arrives.
 */

import { PACK_INTERCEPT_CHANCE_PER_PAW, PACK_PAWS_MAX, PACK_PAWS_PER_3_RALLIED } from '../../data/tuning';

/** Starting paws from the rallied-wolf count (GDD §8.5: "1 paw per 3 wolves rallied"). */
export function initialPawsFromRallied(rallied: number): number {
  return Math.min(PACK_PAWS_MAX, Math.floor(rallied / 3) * PACK_PAWS_PER_3_RALLIED);
}

export function gainPaw(paws: number): number {
  return Math.min(PACK_PAWS_MAX, paws + 1);
}

export function losePaw(paws: number): number {
  return Math.max(0, paws - 1);
}

/** A dhole reaching the rocks: each paw gives a 10% chance the Pack intercepts it first
 * (GDD §8.5). `random` is injected (not Math.random directly) so this stays unit-testable. */
export function rollIntercept(paws: number, random: () => number): boolean {
  return random() < paws * PACK_INTERCEPT_CHANCE_PER_PAW;
}
