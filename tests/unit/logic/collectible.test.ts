import { describe, expect, it } from 'vitest';
import { collectStone, countCollected, isFullMoon } from '../../../src/game/logic/collectibles/Collectible';

describe('moon-stone collectible', () => {
  it('is a one-way transition: collecting is never lost', () => {
    const stone = collectStone({ collected: false });
    expect(stone.collected).toBe(true);
    expect(collectStone(stone).collected).toBe(true);
  });

  it('counts collected stones', () => {
    const stones = [{ collected: true }, { collected: false }, { collected: true }];
    expect(countCollected(stones)).toBe(2);
  });

  it('is Full Moon only at 15 of 15', () => {
    const fourteen = Array.from({ length: 15 }, (_, i) => ({ collected: i < 14 }));
    const fifteen = Array.from({ length: 15 }, () => ({ collected: true }));
    expect(isFullMoon(fourteen, 15)).toBe(false);
    expect(isFullMoon(fifteen, 15)).toBe(true);
  });
});
