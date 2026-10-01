import { describe, expect, it } from 'vitest';
import { initialDiverState, stepDiver } from '../../../src/game/logic/enemies/scripts';

describe('Bee cloud (S3 Diver, GDD §7.7 #8): cannot be hit, pursues within the leash', () => {
  const returnTravelS = 2;

  it('keeps pursuing while within the leash', () => {
    let state = initialDiverState();
    for (let i = 0; i < 300; i++) {
      state = stepDiver(state, 1 / 60, true, returnTravelS).state;
    }
    expect(state.phase).toBe('pursuing');
  });

  it('returns once outside the leash, and arrives home after returnTravelS', () => {
    const result1 = stepDiver(initialDiverState(), 1 / 60, false, returnTravelS);
    expect(result1.state.phase).toBe('returning');
    expect(result1.arrivedHome).toBe(false);

    const result2 = stepDiver(result1.state, returnTravelS, false, returnTravelS);
    expect(result2.arrivedHome).toBe(true);
  });
});
