/**
 * SaveStore (GDD §9.5): 3 slots under localStorage keys, an in-memory fallback when storage is
 * unavailable (private windows, quota exceeded), and a backup key for a slot that failed to
 * parse so New Game can be offered without silently discarding the old bytes.
 */

import { SAVE_SLOT_COUNT } from '../data/tuning';
import { deserializeSlot, serializeSlot, type SaveSlotData } from '../logic/save/save';

const KEY_PREFIX = 'seeonee.save.';
const BACKUP_SUFFIX = '.corrupt-backup';

function slotKey(slot: number): string {
  return `${KEY_PREFIX}${slot}`;
}

function detectLocalStorage(): Storage | null {
  try {
    const testKey = '__seeonee_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export class SaveStore {
  private readonly storage: Storage | null;
  private readonly memory = new Map<string, string>();
  readonly usingMemoryFallback: boolean;

  constructor() {
    this.storage = detectLocalStorage();
    this.usingMemoryFallback = this.storage === null;
  }

  private read(key: string): string | null {
    if (this.storage) return this.storage.getItem(key);
    return this.memory.get(key) ?? null;
  }

  private write(key: string, value: string): void {
    if (this.storage) {
      this.storage.setItem(key, value);
      return;
    }
    this.memory.set(key, value);
  }

  loadSlot(slot: number): SaveSlotData | null {
    if (slot < 0 || slot >= SAVE_SLOT_COUNT) throw new Error(`Slot ${slot} out of range`);
    const raw = this.read(slotKey(slot));
    const parsed = deserializeSlot(raw);
    if (raw !== null && parsed === null) {
      this.write(slotKey(slot) + BACKUP_SUFFIX, raw);
    }
    return parsed;
  }

  saveSlot(slot: number, data: SaveSlotData): void {
    if (slot < 0 || slot >= SAVE_SLOT_COUNT) throw new Error(`Slot ${slot} out of range`);
    this.write(slotKey(slot), serializeSlot(data));
  }

  deleteSlot(slot: number): void {
    if (slot < 0 || slot >= SAVE_SLOT_COUNT) throw new Error(`Slot ${slot} out of range`);
    if (this.storage) this.storage.removeItem(slotKey(slot));
    this.memory.delete(slotKey(slot));
  }

  loadAllSlots(): Array<SaveSlotData | null> {
    return Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => this.loadSlot(i));
  }

  /** A raw string slot for the settings record (GDD §9.5 "settings survive New Game"). */
  readRaw(key: string): string | null {
    return this.read(key);
  }

  writeRaw(key: string, value: string): void {
    this.write(key, value);
  }
}
