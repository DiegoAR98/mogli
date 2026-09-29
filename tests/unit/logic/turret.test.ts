import { describe, expect, it } from 'vitest';
import { TURRET_HIDE_S, TURRET_LUNGE_ACTIVE_S, TURRET_REST_S, TURRET_TELEGRAPH_S, SNAKE_GATE_CALM_S } from '../../../src/game/data/tuning';
import { initialTurretState, stepTurret, turretIsStompable } from '../../../src/game/logic/enemies/scripts';

describe('Turret script (cobra, GDD §7.7 #3)', () => {
  it('stays idle until the player is in range', () => {
    const result = stepTurret(initialTurretState(), 1 / 60, { playerInRange: false, hit: false, calmed: false });
    expect(result.state.phase).toBe('idle');
  });

  it('telegraphs, then lunges once, then rests, then returns to idle', () => {
    let state = initialTurretState();
    let result = stepTurret(state, 1 / 60, { playerInRange: true, hit: false, calmed: false });
    expect(result.state.phase).toBe('telegraph');
    state = result.state;

    result = stepTurret(state, TURRET_TELEGRAPH_S, { playerInRange: true, hit: false, calmed: false });
    expect(result.state.phase).toBe('lunge');
    expect(result.didLunge).toBe(true);
    state = result.state;

    result = stepTurret(state, TURRET_LUNGE_ACTIVE_S, { playerInRange: true, hit: false, calmed: false });
    expect(result.state.phase).toBe('rest');
    state = result.state;

    result = stepTurret(state, TURRET_REST_S, { playerInRange: true, hit: false, calmed: false });
    expect(result.state.phase).toBe('idle');
  });

  it('sinks into its hole after 2 hits, and returns after TURRET_HIDE_S', () => {
    let state = initialTurretState();
    let result = stepTurret(state, 1 / 60, { playerInRange: false, hit: true, calmed: false });
    expect(result.state.phase).toBe('idle'); // 1 hit: not enough yet
    state = result.state;

    result = stepTurret(state, 1 / 60, { playerInRange: false, hit: true, calmed: false });
    expect(result.state.phase).toBe('hidden');
    state = result.state;

    result = stepTurret(state, TURRET_HIDE_S - 0.001, { playerInRange: false, hit: false, calmed: false });
    expect(result.state.phase).toBe('hidden');
    result = stepTurret(result.state, 1, { playerInRange: false, hit: false, calmed: false });
    expect(result.state.phase).toBe('idle');
  });

  it('a hit while mid-lunge does not instantly hide it (needs 2 total)', () => {
    let state: ReturnType<typeof initialTurretState> = { phase: 'lunge', timerS: 0, hideForS: 0, hitsTaken: 0 };
    const result = stepTurret(state, 1 / 60, { playerInRange: true, hit: true, calmed: false });
    expect(result.state.hitsTaken).toBe(1);
    expect(result.state.phase).not.toBe('hidden');
  });

  it('the Snake-gate calms it for SNAKE_GATE_CALM_S without counting as a hit', () => {
    let state = initialTurretState();
    let result = stepTurret(state, 1 / 60, { playerInRange: false, hit: false, calmed: true });
    expect(result.state.phase).toBe('hidden');
    expect(result.state.hideForS).toBe(SNAKE_GATE_CALM_S);
    expect(result.state.hitsTaken).toBe(0);
  });

  it('is never stompable', () => {
    expect(turretIsStompable()).toBe(false);
  });
});
