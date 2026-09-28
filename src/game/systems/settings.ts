/**
 * The settings record (GDD §9.5, §9.8, §4.4, §11.1): survives New Game, unlike a save slot.
 * Read/written through SaveStore's raw string API so it shares the same storage/in-memory
 * fallback (D89 continuation).
 */

import type { GameMode } from '../logic/save/save';
import type { LocaleId } from './locale';
import type { SaveStore } from './save';
import type { TouchPreset } from '../data/touchLayout';
import { TOUCH_OPACITY_DEFAULT_PERCENT } from '../data/touchLayout';

export interface AssistSettings {
  invincibility: boolean;
  infiniteClods: boolean;
  chilEverywhere: boolean;
  gameSpeedPercent: number;
  crouchToggle: boolean;
}

export interface Settings {
  locale: LocaleId | null; // null: not yet chosen explicitly, detect from the browser
  mode: GameMode;
  shakePercent: number;
  flashReduction: boolean;
  fillScreen: boolean;
  assist: AssistSettings;
  touchPreset: TouchPreset;
  touchOpacityPercent: number;
}

const SETTINGS_KEY = 'seeonee.settings';

export function defaultSettings(): Settings {
  return {
    locale: null,
    mode: 'modern',
    shakePercent: 100,
    flashReduction: false,
    fillScreen: false,
    assist: { invincibility: false, infiniteClods: false, chilEverywhere: false, gameSpeedPercent: 100, crouchToggle: false },
    touchPreset: 'wide',
    touchOpacityPercent: TOUCH_OPACITY_DEFAULT_PERCENT,
  };
}

export function loadSettings(store: SaveStore): Settings {
  const raw = store.readRaw(SETTINGS_KEY);
  if (!raw) return defaultSettings();
  try {
    return { ...defaultSettings(), ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(store: SaveStore, settings: Settings): void {
  store.writeRaw(SETTINGS_KEY, JSON.stringify(settings));
}
