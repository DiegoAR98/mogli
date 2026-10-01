import { describe, expect, it } from 'vitest';
import { GARLIC_CAP_S, GARLIC_SECONDS_PER_RUB } from '../../../src/game/data/tuning';
import { initialGarlicState, isGarlicActive, rubGarlic, tickGarlic } from '../../../src/game/logic/items/Garlic';

describe('Garlic (GDD §7.3): bees ignore Mowgli while the meter is up, no toggle needed', () => {
  it('starts inactive and counts down to inactive once picked up', () => {
    let state = initialGarlicState();
    expect(isGarlicActive(state)).toBe(false);
    state = rubGarlic(state);
    expect(state.meterS).toBe(GARLIC_SECONDS_PER_RUB);
    expect(isGarlicActive(state)).toBe(true);

    state = tickGarlic(state, GARLIC_SECONDS_PER_RUB - 0.001);
    expect(isGarlicActive(state)).toBe(true);
    state = tickGarlic(state, 1);
    expect(isGarlicActive(state)).toBe(false);
  });

  it('caps at GARLIC_CAP_S across repeated rubs', () => {
    let state = initialGarlicState();
    for (let i = 0; i < 10; i++) state = rubGarlic(state);
    expect(state.meterS).toBe(GARLIC_CAP_S);
  });
});
