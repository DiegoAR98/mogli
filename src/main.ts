import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { BootScene } from './game/scenes/BootScene';
import { PlayScene } from './game/scenes/PlayScene';
import { HudScene } from './game/scenes/HudScene';
import './style.css';

const game = new Phaser.Game({ ...gameConfig, scene: [BootScene, PlayScene, HudScene] });

window.addEventListener('resize', () => game.scale.setMaxZoom());

if (import.meta.env.DEV || import.meta.env.VITE_E2E) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
