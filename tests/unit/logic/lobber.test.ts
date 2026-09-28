import { describe, expect, it } from 'vitest';
import { initialLobberState, stepLobber, stompScatters } from '../../../src/game/logic/enemies/scripts';
import { LOBBER_TELEGRAPH_S, LOBBER_THROW_CYCLE_S } from '../../../src/game/data/tuning';

describe('Lobber enemy script (langur)', () => {
  it('telegraphs for 0.6 s before it throws, on a 2.0 s cycle', () => {
    let { state } = { state: initialLobberState() };
    let elapsedS = 0;
    let didThrow = false;
    const dt = 1 / 60;

    while (elapsedS < LOBBER_THROW_CYCLE_S + 0.1 && !didThrow) {
      const result = stepLobber(state, dt, false);
      state = result.state;
      didThrow = result.didThrow;
      elapsedS += dt;
    }

    expect(didThrow).toBe(true);
    expect(elapsedS).toBeGreaterThanOrEqual(LOBBER_THROW_CYCLE_S - 0.02);
    expect(elapsedS).toBeLessThanOrEqual(LOBBER_THROW_CYCLE_S + 0.05);
  });

  it('scatters to fleeing on a stomp or a scare, from any phase', () => {
    const telegraphing = { phase: 'telegraph' as const, timerS: 0.3 };
    const result = stepLobber(telegraphing, 1 / 60, true);
    expect(result.state.phase).toBe('fleeing');
    expect(result.didThrow).toBe(false);
  });

  it('never re-enters the throw cycle while fleeing', () => {
    const fleeing = { phase: 'fleeing' as const, timerS: 0 };
    const result = stepLobber(fleeing, 5, false);
    expect(result.state.phase).toBe('fleeing');
  });

  it('is stompable (a regular enemy, D40)', () => {
    expect(stompScatters(true)).toBe(true);
  });

  it('respects the documented telegraph constant', () => {
    expect(LOBBER_TELEGRAPH_S).toBe(0.6);
  });
});
