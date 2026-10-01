import { describe, expect, it } from 'vitest';
import { carryPosition, trunkLaunchVelocity } from '../../../src/game/logic/platforms/PathFollower';

describe('carry platforms (Hathi\'s sons, buffalo, Rama)', () => {
  const waypoints = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ];

  it('walks from the first waypoint to the second at the given speed', () => {
    const atStart = carryPosition(waypoints, 50, 2, 0);
    expect(atStart.x).toBeCloseTo(0);
    expect(atStart.waiting).toBe(false);

    const halfway = carryPosition(waypoints, 50, 2, 1); // 50 px/s * 1 s = 50 px of 100
    expect(halfway.x).toBeCloseTo(50);
    expect(halfway.vx).toBeCloseTo(50);
  });

  it('waits at a waypoint for waitS before reversing', () => {
    const legTimeS = 100 / 50; // 2 s
    const justArrived = carryPosition(waypoints, 50, 2, legTimeS + 0.1);
    expect(justArrived.x).toBeCloseTo(100);
    expect(justArrived.waiting).toBe(true);

    const stillWaiting = carryPosition(waypoints, 50, 2, legTimeS + 1.9);
    expect(stillWaiting.waiting).toBe(true);

    const headingBack = carryPosition(waypoints, 50, 2, legTimeS + 2 + 0.1);
    expect(headingBack.waiting).toBe(false);
    expect(headingBack.vx).toBeLessThan(0);
  });

  it('completes a full round trip back to the first waypoint', () => {
    const legTimeS = 2;
    const cycleS = (legTimeS + 2) * 2; // there and back, each with a 2 s wait
    const backAtStart = carryPosition(waypoints, 50, 2, cycleS - 0.001);
    expect(backAtStart.x).toBeCloseTo(0, 0);
  });

  it('a single waypoint sits still', () => {
    const still = carryPosition([{ x: 10, y: 20 }], 50, 2, 5);
    expect(still).toEqual({ x: 10, y: 20, vx: 0, vy: 0, waiting: true });
  });
});

describe('trunk launch (GDD §10.5, bounce flag)', () => {
  it('reaches the target horizontal range under the player\'s own jump gravity', () => {
    const gravityPxS2 = 914;
    const launchSpeedPxS = 320;
    const tilePx = 16;
    const { vx, vy } = trunkLaunchVelocity(5, gravityPxS2, launchSpeedPxS, tilePx);

    expect(vy).toBe(-320);
    const totalAirTimeS = (launchSpeedPxS / gravityPxS2) * 2;
    expect(vx * totalAirTimeS).toBeCloseTo(5 * tilePx, 5);
  });
});
