/**
 * The typed event bus (PLAN.md §3.4): domain:event names, one payload shape each. HudScene
 * subscribes in create() and unsubscribes in shutdown(); PlayScene publishes after resolving
 * hits each tick. M1 ships the events the gym level actually uses; the rest arrive with the
 * systems that fire them.
 */

export interface GameEventMap {
  'player:stateChanged': { previous: string; next: string; reason: string; tick: number };
  'player:healthChanged': { pips: number; delta: number; cause: string };
  'player:respawned': { packstoneId: string; deaths: number };
  'stones:collected': { count: number; total: number; index: number; kind: string };
  'checkpoint:saved': { packstoneId: string };
}

export type GameEventName = keyof GameEventMap;

type Listener<K extends GameEventName> = (payload: GameEventMap[K]) => void;

export class TypedEventBus {
  private listeners = new Map<GameEventName, Set<Listener<any>>>();

  on<K extends GameEventName>(event: K, listener: Listener<K>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  off<K extends GameEventName>(event: K, listener: Listener<K>): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends GameEventName>(event: K, payload: GameEventMap[K]): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(payload);
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/** One shared bus for the whole game session; scenes reset their own subscriptions on shutdown. */
export const gameEvents = new TypedEventBus();
