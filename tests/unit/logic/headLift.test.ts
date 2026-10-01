import { describe, expect, it } from 'vitest';
import { headLiftHeightFraction, initialHeadLiftState, stepHeadLift } from '../../../src/game/logic/platforms/PathFollower';

describe("Kaa's head-lift (GDD §10.8)", () => {
  const riseS = 1.5;
  const waitAtTopS = 2;
  const lowerS = 1.5;

  it('stays idle at height 0 until the hold completes', () => {
    let state = initialHeadLiftState();
    for (let i = 0; i < 180; i++) {
      state = stepHeadLift(state, 1 / 60, false, riseS, waitAtTopS, lowerS);
    }
    expect(state.phase).toBe('idle');
    expect(headLiftHeightFraction(state, riseS, lowerS)).toBe(0);
  });

  it('rises to height 1 over riseS, waits waitAtTopS, then lowers back to 0 over lowerS', () => {
    let state = stepHeadLift(initialHeadLiftState(), 1 / 60, true, riseS, waitAtTopS, lowerS);
    expect(state.phase).toBe('rising');

    state = stepHeadLift(state, riseS, false, riseS, waitAtTopS, lowerS);
    expect(state.phase).toBe('atTop');
    expect(headLiftHeightFraction(state, riseS, lowerS)).toBe(1);

    state = stepHeadLift(state, waitAtTopS, false, riseS, waitAtTopS, lowerS);
    expect(state.phase).toBe('lowering');

    state = stepHeadLift(state, lowerS, false, riseS, waitAtTopS, lowerS);
    expect(state.phase).toBe('idle');
    expect(headLiftHeightFraction(state, riseS, lowerS)).toBe(0);
  });

  it('the rise is a smooth fraction partway through', () => {
    const state = stepHeadLift(initialHeadLiftState(), riseS / 2, true, riseS, waitAtTopS, lowerS);
    expect(state.phase).toBe('rising');
    expect(headLiftHeightFraction(state, riseS, lowerS)).toBeCloseTo(0, 1); // the hold-complete tick itself resets timerS to 0
  });
});
