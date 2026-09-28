import { describe, expect, it } from 'vitest';
import { initialRedFlowerState, isWithinFleeRadius, pickUpPot, tickRedFlower, toggleRedFlower } from '../../../src/game/logic/items/RedFlower';
import { RED_FLOWER_CAP_S, RED_FLOWER_SECONDS_PER_POT } from '../../../src/game/data/tuning';

describe('RedFlower', () => {
  it('adds a pot to the meter, capped at 24 s', () => {
    let state = initialRedFlowerState();
    state = pickUpPot(state);
    expect(state.meterS).toBe(RED_FLOWER_SECONDS_PER_POT);
    for (let i = 0; i < 5; i++) state = pickUpPot(state);
    expect(state.meterS).toBe(RED_FLOWER_CAP_S);
  });

  it('cannot be lit with an empty meter', () => {
    const state = toggleRedFlower(initialRedFlowerState());
    expect(state.lit).toBe(false);
  });

  it('toggles lit/snuffed without spending the meter', () => {
    let state = pickUpPot(initialRedFlowerState());
    state = toggleRedFlower(state);
    expect(state.lit).toBe(true);
    expect(state.meterS).toBe(RED_FLOWER_SECONDS_PER_POT);
    state = toggleRedFlower(state);
    expect(state.lit).toBe(false);
    expect(state.meterS).toBe(RED_FLOWER_SECONDS_PER_POT);
  });

  it('drains only while lit, and snuffs itself at zero', () => {
    let state = pickUpPot(initialRedFlowerState());
    state = toggleRedFlower(state);
    state = tickRedFlower(state, RED_FLOWER_SECONDS_PER_POT - 1);
    expect(state.lit).toBe(true);
    expect(state.meterS).toBeCloseTo(1);
    state = tickRedFlower(state, 2);
    expect(state.meterS).toBe(0);
    expect(state.lit).toBe(false);
  });

  it('does not drain while snuffed', () => {
    const state = tickRedFlower(pickUpPot(initialRedFlowerState()), 100);
    expect(state.meterS).toBe(RED_FLOWER_SECONDS_PER_POT);
  });

  it('flee radius only applies while lit and within 6 tiles', () => {
    const unlit = pickUpPot(initialRedFlowerState());
    expect(isWithinFleeRadius(unlit, 2)).toBe(false);
    const lit = toggleRedFlower(unlit);
    expect(isWithinFleeRadius(lit, 6)).toBe(true);
    expect(isWithinFleeRadius(lit, 6.1)).toBe(false);
  });
});
