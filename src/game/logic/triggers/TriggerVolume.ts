/**
 * S5 trigger volume (GDD §3.4, §6.5, §9.5): a rectangle with a flag. M1 ships checkpoint (the
 * pack-stone) and pit; truce, slowWater, safeWater, tallGrass, detect, card and door arrive with
 * the zones that need them, reusing the same rectangle and the interact ring below.
 */

import { INTERACT_HUT_DOOR_FRAMES, INTERACT_MASTER_WORDS_GATE_FRAMES, INTERACT_ROPE_FRAMES, INTERACT_BOSS_HOLD_FRAMES, RESPAWN_FADE_S } from '../../data/tuning';

export type TriggerFlag = 'checkpoint' | 'pit' | 'truce' | 'slowWater' | 'safeWater' | 'tallGrass' | 'detect' | 'card' | 'door' | 'snakeGate' | 'roar' | 'bossGate';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- Pack-stones (checkpoints): GDD §9.5, D41 --------------------------------------------------

export interface CheckpointState {
  checkpointId: string | null;
  spawnX: number;
  spawnY: number;
  spawnFacing: -1 | 1;
}

export function activateCheckpoint(packstone: { checkpointId: string; x: number; y: number; spawnFacing: -1 | 1 }): CheckpointState {
  return { checkpointId: packstone.checkpointId, spawnX: packstone.x, spawnY: packstone.y, spawnFacing: packstone.spawnFacing };
}

/** Touching a pack-stone heals to the full leaf-pip count, whatever the current pips are. */
export function healOnCheckpoint(maxPips: number): number {
  return maxPips;
}

// --- Pits and deep water: GDD §6.5, §9.5 --------------------------------------------------------

export interface RespawnPosition {
  x: number;
  y: number;
  facing: -1 | 1;
}

/** A pit or deep-water volume sends Mowgli back to the last pack-stone; every stone he holds is kept. */
export function respawnAtLastCheckpoint(checkpoint: CheckpointState): RespawnPosition {
  if (checkpoint.checkpointId === null) {
    throw new Error('No checkpoint has been activated yet: the first pack-stone of a level must sit over safe ground.');
  }
  return { x: checkpoint.spawnX, y: checkpoint.spawnY, facing: checkpoint.spawnFacing };
}

export const RESPAWN_FADE_DURATION_S = RESPAWN_FADE_S;

// --- The interact ring (S1, reused by every door/gate/rope): GDD §3.4, §4.1 ---------------------

export type InteractKind = 'hutDoor' | 'masterWordsGate' | 'rope' | 'bossHold';

export function interactRequirementFrames(kind: InteractKind): number {
  switch (kind) {
    case 'hutDoor':
      return INTERACT_HUT_DOOR_FRAMES;
    case 'masterWordsGate':
      return INTERACT_MASTER_WORDS_GATE_FRAMES;
    case 'rope':
      return INTERACT_ROPE_FRAMES;
    case 'bossHold':
      return INTERACT_BOSS_HOLD_FRAMES;
  }
}
