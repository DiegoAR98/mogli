import { describe, expect, it } from 'vitest';
import { glyphFor } from '../../../src/game/data/deviceGlyphs';
import { ACTIONS } from '../../../src/game/systems/input';

describe('device glyphs (GDD §4.3)', () => {
  it('every action has a glyph label for every device', () => {
    for (const device of ['keyboard', 'gamepad', 'touch'] as const) {
      for (const action of ACTIONS) {
        expect(glyphFor(device, action)).toBeTruthy();
      }
    }
  });

  it('gamepad and keyboard glyphs differ (they are not the same label)', () => {
    for (const action of ACTIONS) {
      expect(glyphFor('gamepad', action)).not.toBe(glyphFor('keyboard', action));
    }
  });
});
