import Phaser from 'phaser';

/**
 * The one GameConfig (PLAN.md §3.2, §4.1, §6.1). 320x180 base, integer zoom, fixed-step
 * Arcade physics at 60 Hz, no gravity at the world level (every body's gravity is written by
 * PlayScene's worldstep tick instead, D56).
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 320,
  height: 180,
  pixelArt: true,
  backgroundColor: '#0b1410',
  scale: {
    mode: Phaser.Scale.NONE,
    zoom: Phaser.Scale.MAX_ZOOM,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      fixedStep: true,
      fps: 60,
      debug: import.meta.env.DEV,
    },
  },
  input: {
    // systems/input.ts owns every raw keyboard event via its own window listeners, reading
    // KeyboardEvent.code directly (PLAN.md §4.6), so Phaser's own keyboard plugin is left
    // disabled to keep one owner of key capture. Verified in M0 by A/B test (Chromium,
    // headless) that this makes no behavioral difference to our own window-level listeners
    // either way -- Phaser's default key capture list did not swallow events before ours saw
    // them -- so `false` here is an architectural choice (PLAN.md §4.6's "leaving
    // this.input.keyboard unused"), not a bug workaround. See docs/DECISIONS.md.
    keyboard: false,
    activePointers: 3,
    gamepad: true,
  },
};
