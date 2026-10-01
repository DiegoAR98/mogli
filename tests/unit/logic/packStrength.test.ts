import { describe, expect, it } from 'vitest';
import { gainPaw, initialPawsFromRallied, losePaw, rollIntercept } from '../../../src/game/logic/boss/PackStrength';

describe('Pack strength / the paw meter (GDD §8.5)', () => {
  it('starts at 1 paw per 3 wolves rallied, capped at 5', () => {
    expect(initialPawsFromRallied(0)).toBe(0);
    expect(initialPawsFromRallied(2)).toBe(0);
    expect(initialPawsFromRallied(3)).toBe(1);
    expect(initialPawsFromRallied(9)).toBe(3);
    expect(initialPawsFromRallied(15)).toBe(5);
    expect(initialPawsFromRallied(30)).toBe(5); // still capped at 5
  });

  it('gains and loses paws within the 0-5 floor/cap', () => {
    expect(gainPaw(5)).toBe(5);
    expect(gainPaw(4)).toBe(5);
    expect(losePaw(0)).toBe(0);
    expect(losePaw(3)).toBe(2);
  });

  it('rolls a 10% chance per paw to intercept a dhole', () => {
    expect(rollIntercept(0, () => 0)).toBe(false); // 0 paws never intercepts
    expect(rollIntercept(3, () => 0.29)).toBe(true); // 30% chance, roll just under it
    expect(rollIntercept(3, () => 0.31)).toBe(false); // roll just over it
    expect(rollIntercept(5, () => 0.49)).toBe(true); // 50% chance at max paws
  });
});
