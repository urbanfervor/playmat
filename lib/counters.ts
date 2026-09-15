import type { CounterDef } from "@/games/types";
import { logEvent } from "./log";
import { updatePlayer, type Player } from "./rooms";

export function bumpCounter(roomId: string, player: Player, counter: CounterDef, delta: number) {
  const from = player.counters[counter.id] ?? 0;
  const to = from + delta;
  logEvent(roomId, `${player.name} · ${counter.name} ${from} → ${to}`);
  return updatePlayer(roomId, player.uid, { counters: { ...player.counters, [counter.id]: to } });
}

export function bumpOpponentCounter(roomId: string, player: Player, counter: CounterDef, opponent: Player, delta: number) {
  const all = player.opponentCounters ?? {};
  const forCounter = all[counter.id] ?? {};
  const from = forCounter[opponent.uid] ?? 0;
  const to = from + delta;
  logEvent(roomId, `${player.name} · ${counter.name} from ${opponent.name} ${from} → ${to}`);
  return updatePlayer(roomId, player.uid, { opponentCounters: { ...all, [counter.id]: { ...forCounter, [opponent.uid]: to } } });
}
