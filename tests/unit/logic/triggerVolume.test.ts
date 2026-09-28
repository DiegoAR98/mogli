import { describe, expect, it } from 'vitest';
import { activateCheckpoint, healOnCheckpoint, interactRequirementFrames, rectsOverlap, respawnAtLastCheckpoint } from '../../../src/game/logic/triggers/TriggerVolume';
import { LEAF_PIPS_MAX } from '../../../src/game/data/tuning';

describe('trigger volumes', () => {
  it('detects an AABB overlap', () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 10, h: 10 })).toBe(false);
  });

  it('activates a pack-stone and respawns Mowgli there, facing the saved direction', () => {
    const checkpoint = activateCheckpoint({ checkpointId: 'l01-cp1', x: 640, y: 960, spawnFacing: 1 });
    expect(respawnAtLastCheckpoint(checkpoint)).toEqual({ x: 640, y: 960, facing: 1 });
  });

  it('throws if a pit is reached before any pack-stone was touched', () => {
    expect(() => respawnAtLastCheckpoint({ checkpointId: null, spawnX: 0, spawnY: 0, spawnFacing: 1 })).toThrow();
  });

  it('heals to the full leaf-pip count on a pack-stone', () => {
    expect(healOnCheckpoint(LEAF_PIPS_MAX)).toBe(6);
  });

  it('holds the four interact hold times of GDD §4.1', () => {
    expect(interactRequirementFrames('hutDoor')).toBe(15);
    expect(interactRequirementFrames('masterWordsGate')).toBe(30);
    expect(interactRequirementFrames('rope')).toBe(48);
    expect(interactRequirementFrames('bossHold')).toBe(120);
  });
});
