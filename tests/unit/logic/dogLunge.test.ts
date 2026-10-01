import { describe, expect, it } from 'vitest';
import { CHARGER_TELEGRAPH_S, DOG_LUNGE_DURATION_S, DOG_RECOVER_S } from '../../../src/game/data/tuning';
import { initialChargerState, stepCharger } from '../../../src/game/logic/enemies/scripts';

describe('Charger script, dog lunge sub-mode (GDD §7.7 #2)', () => {
  it('never lunges when lungeEnabled is false, even if the player is in line', () => {
    let state = initialChargerState();
    for (let i = 0; i < 180; i++) {
      state = stepCharger(state, 1 / 60, { hitOrStomped: false, thief: false, stoneNearby: false, reachedStone: false, lungeEnabled: false, playerInLine: true }).state;
    }
    expect(state.phase).toBe('patrol');
  });

  it('telegraphs, charges for the 4-tile/128 px/s duration, recovers, then returns to patrol', () => {
    let state = initialChargerState();
    let result = stepCharger(state, 1 / 60, { hitOrStomped: false, thief: false, stoneNearby: false, reachedStone: false, lungeEnabled: true, playerInLine: true });
    expect(result.state.phase).toBe('telegraph');
    state = result.state;

    result = stepCharger(state, CHARGER_TELEGRAPH_S, { hitOrStomped: false, thief: false, stoneNearby: false, reachedStone: false, lungeEnabled: true, playerInLine: true });
    expect(result.state.phase).toBe('charging');
    expect(result.startedCharging).toBe(true);
    state = result.state;

    result = stepCharger(state, DOG_LUNGE_DURATION_S - 0.001, { hitOrStomped: false, thief: false, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('charging');
    result = stepCharger(result.state, 1, { hitOrStomped: false, thief: false, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('recovering');
    state = result.state;

    result = stepCharger(state, DOG_RECOVER_S + 0.001, { hitOrStomped: false, thief: false, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('patrol');
  });

  it('a hit mid-charge flees immediately, same as any other Charger', () => {
    const charging: ReturnType<typeof initialChargerState> = { phase: 'charging', timerS: 0.1, reason: 'lunge' };
    const result = stepCharger(charging, 1 / 60, { hitOrStomped: true, thief: false, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('fleeing');
  });
});
