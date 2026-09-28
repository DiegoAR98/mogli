/**
 * Samples keyboard, gamepad and (later) touch into one InputSnapshot of abstract actions per
 * simulation tick (GDD §4.1-4.5, PLAN §4.6). Binds keyboard by KeyboardEvent.code, not Phaser's
 * keyCode-based plugin, so WASD stays positional on other layouts. A "systems" module: it owns
 * window listeners, so it is exempt from the logic/data no-window guard (PLAN §3.3 rule 1).
 */

export type Action = 'left' | 'right' | 'up' | 'down' | 'jump' | 'throw' | 'item' | 'cycle' | 'pause';

export const ACTIONS: Action[] = ['left', 'right', 'up', 'down', 'jump', 'throw', 'item', 'cycle', 'pause'];

export type ActionState = Record<Action, boolean>;

export interface InputSnapshot {
  held: ActionState;
  pressed: ActionState;
  released: ActionState;
}

function emptyActionState(): ActionState {
  return { left: false, right: false, up: false, down: false, jump: false, throw: false, item: false, cycle: false, pause: false };
}

// Two default keyboard sets active at once (GDD §4.2); both fully remappable in Options later.
const DEFAULT_BINDINGS: Record<string, Action> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Space: 'jump',
  KeyZ: 'jump',
  KeyX: 'throw',
  KeyC: 'item',
  KeyV: 'cycle',
  Escape: 'pause',
  Enter: 'pause',
  KeyW: 'up',
  KeyA: 'left',
  KeyS: 'down',
  KeyD: 'right',
  KeyJ: 'jump',
  KeyK: 'throw',
  KeyL: 'item',
  KeyI: 'cycle',
};

const PRESS_EDGE_ACTIONS = new Set<Action>(['jump', 'throw', 'item', 'cycle', 'pause']);
const GAMEPAD_DEADZONE = 0.25;

export class InputSystem {
  private bindings: Record<string, Action>;
  private keysDown = new Set<string>();
  private keysPressedThisTick = new Set<string>();
  private keysReleasedThisTick = new Set<string>();
  private touchHeld: Partial<ActionState> = {};
  private lastGamepadHeld: ActionState = emptyActionState();

  constructor(bindings: Record<string, Action> = DEFAULT_BINDINGS) {
    this.bindings = bindings;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const action = this.bindings[event.code];
    if (!action) return;
    if (document.activeElement === document.body || document.activeElement === null) {
      event.preventDefault();
    }
    if (!this.keysDown.has(event.code)) {
      this.keysPressedThisTick.add(event.code);
    }
    this.keysDown.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    const action = this.bindings[event.code];
    if (!action) return;
    this.keysDown.delete(event.code);
    this.keysReleasedThisTick.add(event.code);
  };

  /** Touch buttons (HudScene, M2) report held state here; M1 never calls this. */
  setTouchHeld(action: Action, held: boolean): void {
    this.touchHeld[action] = held;
  }

  private pollGamepad(): ActionState {
    const held = emptyActionState();
    const pad = navigator.getGamepads?.()[0];
    if (!pad) return held;

    held.left = pad.buttons[14]?.pressed || pad.axes[0] < -GAMEPAD_DEADZONE;
    held.right = pad.buttons[15]?.pressed || pad.axes[0] > GAMEPAD_DEADZONE;
    held.up = pad.buttons[12]?.pressed || pad.axes[1] < -GAMEPAD_DEADZONE;
    held.down = pad.buttons[13]?.pressed || pad.axes[1] > GAMEPAD_DEADZONE;
    held.jump = Boolean(pad.buttons[0]?.pressed);
    held.throw = Boolean(pad.buttons[2]?.pressed);
    held.item = Boolean(pad.buttons[1]?.pressed);
    held.cycle = Boolean(pad.buttons[3]?.pressed || pad.buttons[4]?.pressed || pad.buttons[5]?.pressed);
    held.pause = Boolean(pad.buttons[9]?.pressed);
    return held;
  }

  /** Reads the accumulated key events, gamepad and touch state into one snapshot; call once per tick. */
  sample(): InputSnapshot {
    const held = emptyActionState();
    const pressed = emptyActionState();
    const released = emptyActionState();

    for (const [code, action] of Object.entries(this.bindings)) {
      if (this.keysDown.has(code)) held[action] = true;
      if (this.keysPressedThisTick.has(code)) pressed[action] = true;
      if (this.keysReleasedThisTick.has(code)) released[action] = true;
    }

    const gamepadHeld = this.pollGamepad();
    for (const action of ACTIONS) {
      if (gamepadHeld[action]) held[action] = true;
      if (gamepadHeld[action] && !this.lastGamepadHeld[action] && PRESS_EDGE_ACTIONS.has(action)) pressed[action] = true;
      if (!gamepadHeld[action] && this.lastGamepadHeld[action]) released[action] = true;
      if (this.touchHeld[action]) held[action] = true;
    }
    this.lastGamepadHeld = gamepadHeld;

    if (held.left && held.right) {
      held.left = false;
      held.right = false;
    }

    this.keysPressedThisTick.clear();
    this.keysReleasedThisTick.clear();
    return { held, pressed, released };
  }

  /** Clears every held input (focus loss, pause) without generating release edges (GDD §4.5). */
  clearHeld(): void {
    this.keysDown.clear();
    this.keysPressedThisTick.clear();
    this.keysReleasedThisTick.clear();
    this.touchHeld = {};
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
