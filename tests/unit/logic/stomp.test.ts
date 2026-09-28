import { describe, expect, it } from 'vitest';
import { stompBounceHeightPx } from '../../../src/game/logic/player/PlayerController';
import { STOMP_BOUNCE_HELD_TILES, STOMP_BOUNCE_TILES, TILE_PX } from '../../../src/game/data/tuning';

describe('stomp bounce', () => {
  it('bounces 3 tiles normally, 3.5 tiles with Jump held (D40)', () => {
    expect(stompBounceHeightPx(false)).toBe(STOMP_BOUNCE_TILES * TILE_PX);
    expect(stompBounceHeightPx(true)).toBe(STOMP_BOUNCE_HELD_TILES * TILE_PX);
  });
});
