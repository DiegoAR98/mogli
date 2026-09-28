/**
 * Save schema (GDD §9.5): versioned, 3 slots, one snapshot per slot. Pure serialize/migrate
 * logic only -- the localStorage read/write and the in-memory fallback live in
 * src/game/systems/save.ts, which is allowed to touch window (PLAN.md §3.3 rule 1).
 */

import { SAVE_SCHEMA_VERSION, STONES_PER_LEVEL } from '../../data/tuning';
import type { TierId } from '../../data/tiers';

export type GameMode = 'modern' | 'retro';

export interface SaveSlotData {
  version: number;
  tier: TierId;
  mode: GameMode;
  levelId: string;
  packstoneId: string;
  stoneFlags: boolean[];
  pouch: number;
  clods: number;
  redFlowerMeterS: number;
  gateFlags: string[];
  deaths: number;
  elapsedS: number;
  retroLives: number;
  retroClockS: number;
  updatedAtIso: string;
}

export function newSlot(levelId: string, tier: TierId, mode: GameMode, nowIso: string): SaveSlotData {
  return {
    version: SAVE_SCHEMA_VERSION,
    tier,
    mode,
    levelId,
    packstoneId: 'spawn',
    stoneFlags: new Array(STONES_PER_LEVEL).fill(false),
    pouch: 0,
    clods: 0,
    redFlowerMeterS: 0,
    gateFlags: [],
    deaths: 0,
    elapsedS: 0,
    retroLives: 3,
    retroClockS: 360,
    updatedAtIso: nowIso,
  };
}

export function serializeSlot(data: SaveSlotData): string {
  return JSON.stringify(data);
}

/**
 * Parses a slot; an unreadable or wrong-version save returns null (kept under a backup key by
 * the caller) rather than throwing, so New Game can be offered per GDD §9.5.
 */
export function deserializeSlot(raw: string | null): SaveSlotData | null {
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const candidate = parsed as Partial<SaveSlotData>;
  if (candidate.version !== SAVE_SCHEMA_VERSION) return null;
  if (!Array.isArray(candidate.stoneFlags) || typeof candidate.levelId !== 'string') return null;
  return candidate as SaveSlotData;
}
