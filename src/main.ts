import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { BootScene } from './game/scenes/BootScene';
import { TitleScene } from './game/scenes/TitleScene';
import { SaveSlotScene } from './game/scenes/SaveSlotScene';
import { TierPickScene } from './game/scenes/TierPickScene';
import { MapScene } from './game/scenes/MapScene';
import { CardScene } from './game/scenes/CardScene';
import { LoadingScene } from './game/scenes/LoadingScene';
import { PlayScene } from './game/scenes/PlayScene';
import { HudScene } from './game/scenes/HudScene';
import { PauseScene } from './game/scenes/PauseScene';
import { OptionsScene } from './game/scenes/OptionsScene';
import { ResultsScene } from './game/scenes/ResultsScene';
import './style.css';

const game = new Phaser.Game({
  ...gameConfig,
  scene: [BootScene, TitleScene, SaveSlotScene, TierPickScene, MapScene, CardScene, LoadingScene, PlayScene, HudScene, PauseScene, OptionsScene, ResultsScene],
});

window.addEventListener('resize', () => game.scale.setMaxZoom());

if (import.meta.env.DEV || import.meta.env.VITE_E2E) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
