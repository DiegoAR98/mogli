/**
 * S6 collectible and ExitNPC (GDD §3.4, §9.1-9.3). M1 ships the moon-stone only; the exit
 * character states, the L6 pouch and the L8 rally arrive with M2 and their own zones.
 */

export type StoneKind = 'path' | 'branch' | 'secret';
export type StoneSkin = 'moon' | 'jewel' | 'wolf';

export interface StoneDefinition {
  id: number;
  order: number; // 1-15, unique, the designer-set order Chil follows (D91)
  kind: StoneKind;
  skin: StoneSkin;
}

export interface StoneRuntimeState {
  collected: boolean;
}

/** A collected stone is never lost across a hit or a respawn: collecting it is a one-way transition. */
export function collectStone(state: StoneRuntimeState): StoneRuntimeState {
  return { collected: true };
}

export function countCollected(states: StoneRuntimeState[]): number {
  return states.filter((s) => s.collected).length;
}

export function isFullMoon(states: StoneRuntimeState[], totalStones: number): boolean {
  return countCollected(states) >= totalStones;
}
