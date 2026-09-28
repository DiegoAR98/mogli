import { describe, expect, it } from 'vitest';
import { deserializeSlot, newSlot, serializeSlot } from '../../../src/game/logic/save/save';
import { SAVE_SCHEMA_VERSION, STONES_PER_LEVEL } from '../../../src/game/data/tuning';

describe('save schema', () => {
  it('a fresh slot has 15 unset stone flags and version-stamps itself', () => {
    const slot = newSlot('l1', 'wolf', 'modern', '2026-09-28T00:00:00.000Z');
    expect(slot.version).toBe(SAVE_SCHEMA_VERSION);
    expect(slot.stoneFlags).toHaveLength(STONES_PER_LEVEL);
    expect(slot.stoneFlags.every((f) => f === false)).toBe(true);
  });

  it('round-trips through serialize/deserialize', () => {
    const slot = newSlot('l1', 'cub', 'retro', '2026-09-28T00:00:00.000Z');
    slot.stoneFlags[3] = true;
    slot.deaths = 2;
    const roundTripped = deserializeSlot(serializeSlot(slot));
    expect(roundTripped).toEqual(slot);
  });

  it('returns null for missing, malformed or wrong-version data instead of throwing', () => {
    expect(deserializeSlot(null)).toBeNull();
    expect(deserializeSlot('not json')).toBeNull();
    expect(deserializeSlot(JSON.stringify({ version: SAVE_SCHEMA_VERSION + 1, levelId: 'l1', stoneFlags: [] }))).toBeNull();
    expect(deserializeSlot(JSON.stringify({ version: SAVE_SCHEMA_VERSION }))).toBeNull();
  });
});
