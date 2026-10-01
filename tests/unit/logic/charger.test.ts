import { describe, expect, it } from 'vitest';
import { CHARGER_FLEE_S, CHARGER_TELEGRAPH_S } from '../../../src/game/data/tuning';
import { initialChargerState, stepCharger } from '../../../src/game/logic/enemies/scripts';

describe('Charger script (Tabaqui, jackals)', () => {
  it('a non-thief patrols forever and never telegraphs a steal', () => {
    let state = initialChargerState();
    for (let i = 0; i < 300; i++) {
      state = stepCharger(state, 1 / 60, { hitOrStomped: false, thief: false, stoneNearby: true, reachedStone: false }).state;
    }
    expect(state.phase).toBe('patrol');
  });

  it('a thief telegraphs, then walks to steal once a stone is nearby', () => {
    let state = initialChargerState();
    let result = stepCharger(state, 1 / 60, { hitOrStomped: false, thief: true, stoneNearby: true, reachedStone: false });
    expect(result.state.phase).toBe('telegraph');
    state = result.state;

    result = stepCharger(state, CHARGER_TELEGRAPH_S, { hitOrStomped: false, thief: true, stoneNearby: true, reachedStone: false });
    expect(result.state.phase).toBe('stealing');
    expect(result.startedStealing).toBe(true);
    state = result.state;

    result = stepCharger(state, 1 / 60, { hitOrStomped: false, thief: true, stoneNearby: true, reachedStone: true });
    expect(result.state.phase).toBe('carrying');
    expect(result.pickedUpStone).toBe(true);
  });

  it('carries indefinitely until hit, then drops the stone and flees for CHARGER_FLEE_S', () => {
    let state: ReturnType<typeof initialChargerState> = { phase: 'carrying', timerS: 0, reason: null };
    let result = stepCharger(state, 5, { hitOrStomped: false, thief: true, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('carrying');

    result = stepCharger(result.state, 1 / 60, { hitOrStomped: true, thief: true, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('fleeing');
    expect(result.droppedStone).toBe(true);
    state = result.state;

    result = stepCharger(state, CHARGER_FLEE_S - 0.001, { hitOrStomped: false, thief: true, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('fleeing');
    result = stepCharger(result.state, 1, { hitOrStomped: false, thief: true, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('patrol');
  });

  it('a hit while merely patrolling flees without dropping anything', () => {
    const result = stepCharger(initialChargerState(), 1 / 60, { hitOrStomped: true, thief: false, stoneNearby: false, reachedStone: false });
    expect(result.state.phase).toBe('fleeing');
    expect(result.droppedStone).toBe(false);
  });
});
