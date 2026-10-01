import { describe, expect, it } from 'vitest';
import { QUILL_PIG_CYCLE_S, QUILL_PIG_TELEGRAPH_S } from '../../../src/game/data/tuning';
import { initialLobberState, stepLobber } from '../../../src/game/logic/enemies/scripts';

describe('Lobber script, quill-pig straight-shot variant (GDD §7.7 #4)', () => {
  it('never throws while out of range: the patrol timer does not accumulate', () => {
    let state = initialLobberState();
    for (let i = 0; i < 600; i++) {
      state = stepLobber(state, 1 / 60, false, false, QUILL_PIG_CYCLE_S, QUILL_PIG_TELEGRAPH_S).state;
    }
    expect(state.phase).toBe('patrol');
    expect(state.timerS).toBe(0);
  });

  it('throws once on its own 2.5 s cycle while in range, not the langur\'s 2.0 s', () => {
    let state = initialLobberState();
    let threw = false;
    for (let i = 0; i < Math.ceil(QUILL_PIG_CYCLE_S * 60) + 5 && !threw; i++) {
      const result = stepLobber(state, 1 / 60, false, true, QUILL_PIG_CYCLE_S, QUILL_PIG_TELEGRAPH_S);
      state = result.state;
      threw = result.didThrow;
    }
    expect(threw).toBe(true);
  });
});
