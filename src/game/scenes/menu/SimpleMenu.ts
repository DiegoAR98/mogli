import Phaser from 'phaser';

/**
 * A minimal keyboard/gamepad/touch-navigable text list (GDD §11.4 "keyboard-navigable with
 * visible focus"). Shared by every menu scene so each one only has to declare its items. Real
 * focus rings and the m5x7 bitmap font are an M2+ art-pass item; this uses a ">" cursor and the
 * development Text object, same placeholder phase as every other UI element so far.
 */
export interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

export class SimpleMenu {
  private texts: Phaser.GameObjects.Text[] = [];
  private cursor = 0;
  private padPrevDown = false;
  private padPrevUp = false;
  private padPrevConfirm = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly items: MenuItem[],
    x: number,
    y: number,
    lineHeight = 14,
  ) {
    items.forEach((item, i) => {
      const text = scene.add.text(x, y + i * lineHeight, item.label, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: item.disabled ? '#665a4a' : '#f2e9d8',
      });
      text.setScrollFactor(0);
      if (!item.disabled) {
        text.setInteractive({ useHandCursor: true });
        text.on('pointerdown', () => item.onSelect());
        text.on('pointerover', () => {
          this.cursor = i;
          this.render();
        });
      }
      this.texts.push(text);
    });
    this.render();

    // Phaser's own keyboard plugin is disabled game-wide (config.ts: one owner of key capture,
    // PLAN.md §4.6), so menus listen on window directly rather than through this.input.keyboard.
    window.addEventListener('keydown', this.onKeyDown);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', this.onKeyDown));
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'ArrowUp' || event.code === 'KeyW') this.move(-1);
    else if (event.code === 'ArrowDown' || event.code === 'KeyS') this.move(1);
    else if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyZ' || event.code === 'KeyJ') this.confirm();
  };

  /** Call once per Scene.update() to also drive the menu from a gamepad (D-pad + button 0). */
  pollGamepad(): void {
    const pad = navigator.getGamepads?.()[0];
    if (!pad) return;
    const down = Boolean(pad.buttons[13]?.pressed) || pad.axes[1] > 0.5;
    const up = Boolean(pad.buttons[12]?.pressed) || pad.axes[1] < -0.5;
    const confirm = Boolean(pad.buttons[0]?.pressed);
    if (down && !this.padPrevDown) this.move(1);
    if (up && !this.padPrevUp) this.move(-1);
    if (confirm && !this.padPrevConfirm) this.confirm();
    this.padPrevDown = down;
    this.padPrevUp = up;
    this.padPrevConfirm = confirm;
  }

  private move(delta: number): void {
    const enabledIndices = this.items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabledIndices.length === 0) return;
    let pos = enabledIndices.indexOf(this.cursor);
    pos = (pos + delta + enabledIndices.length) % enabledIndices.length;
    this.cursor = enabledIndices[pos];
    this.render();
  }

  private confirm(): void {
    const item = this.items[this.cursor];
    if (item && !item.disabled) item.onSelect();
  }

  private render(): void {
    this.texts.forEach((text, i) => {
      const item = this.items[i];
      const focused = i === this.cursor && !item.disabled;
      text.setText(`${focused ? '> ' : '  '}${item.label}`);
      if (!item.disabled) text.setColor(focused ? '#f2e94e' : '#f2e9d8');
    });
  }
}
