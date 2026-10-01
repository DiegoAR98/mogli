import { describe, expect, it } from 'vitest';
import { BULDEO_BOAST_S, BULDEO_CHASE_DURATION_S, BULDEO_DETECT_GRACE_S } from '../../../src/game/data/tuning';
import { initialBuldeoState, stepBuldeo } from '../../../src/game/logic/enemies/scripts';

describe('Buldeo (GDD §7.7, §10.7): a pursuit hazard, not an enemy entry', () => {
  it('stays on patrol while never detected', () => {
    let state = initialBuldeoState();
    for (let i = 0; i < 600; i++) {
      state = stepBuldeo(state, 1 / 60, { playerInDetectZone: false });
    }
    expect(state.phase).toBe('patrol');
  });

  it('leaving the cone before the 0.5 s grace cancels the detection', () => {
    let state = stepBuldeo(initialBuldeoState(), 0.3, { playerInDetectZone: true });
    expect(state.phase).toBe('detecting');
    state = stepBuldeo(state, 1 / 60, { playerInDetectZone: false });
    expect(state.phase).toBe('patrol');
  });

  it('0.5 s inside the cone starts a 6 s chase, then a 3 s boast, then back to patrol', () => {
    let state = stepBuldeo(initialBuldeoState(), 1 / 60, { playerInDetectZone: true });
    expect(state.phase).toBe('detecting');
    state = stepBuldeo(state, BULDEO_DETECT_GRACE_S, { playerInDetectZone: true });
    expect(state.phase).toBe('chasing');

    state = stepBuldeo(state, BULDEO_CHASE_DURATION_S - 0.001, { playerInDetectZone: true });
    expect(state.phase).toBe('chasing');
    state = stepBuldeo(state, 1, { playerInDetectZone: true });
    expect(state.phase).toBe('boasting');

    state = stepBuldeo(state, BULDEO_BOAST_S - 0.001, { playerInDetectZone: true });
    expect(state.phase).toBe('boasting');
    state = stepBuldeo(state, 1, { playerInDetectZone: true });
    expect(state.phase).toBe('patrol');
  });

  it('the chase and boast run their full course even if the player leaves the cone mid-chase', () => {
    let state = stepBuldeo(initialBuldeoState(), 1 / 60, { playerInDetectZone: true });
    state = stepBuldeo(state, BULDEO_DETECT_GRACE_S, { playerInDetectZone: true });
    expect(state.phase).toBe('chasing');
    state = stepBuldeo(state, 1, { playerInDetectZone: false });
    expect(state.phase).toBe('chasing');
  });
});
