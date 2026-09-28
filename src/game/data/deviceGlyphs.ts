/**
 * Prompt glyphs by last-used device (GDD §4.3 "Glyphs in prompts follow the last-used device").
 * The Gamepad API standard mapping only names buttons by number, so a real glyph icon set is
 * M2+ art; these are the text labels used until then (never blocks the prompt from being correct).
 */

import type { Action } from '../systems/input';

export type DeviceKind = 'keyboard' | 'gamepad' | 'touch';

const KEYBOARD_LABELS: Record<Action, string> = {
  left: 'Left / A',
  right: 'Right / D',
  up: 'Up / W',
  down: 'Down / S',
  jump: 'Z / Space / J',
  throw: 'X / K',
  item: 'C / L',
  cycle: 'V / I',
  pause: 'Esc / Enter',
};

const GAMEPAD_LABELS: Record<Action, string> = {
  left: 'D-pad / stick left',
  right: 'D-pad / stick right',
  up: 'D-pad / stick up',
  down: 'D-pad / stick down',
  jump: 'A',
  throw: 'X',
  item: 'B',
  cycle: 'Y',
  pause: 'Start',
};

const TOUCH_LABELS: Record<Action, string> = {
  left: 'Left pad',
  right: 'Right pad',
  up: 'Up (hold Down pad)',
  down: 'Down pad',
  jump: 'Jump button',
  throw: 'Throw button',
  item: 'Item button',
  cycle: 'Cycle button',
  pause: 'Pause corner',
};

const LABELS: Record<DeviceKind, Record<Action, string>> = { keyboard: KEYBOARD_LABELS, gamepad: GAMEPAD_LABELS, touch: TOUCH_LABELS };

export function glyphFor(device: DeviceKind, action: Action): string {
  return LABELS[device][action];
}
