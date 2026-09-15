"use client";
import type { GameDefinition } from "@/games/types";
import type { Player } from "@/lib/rooms";
import { bumpCounter, bumpOpponentCounter } from "@/lib/counters";
import { Icon } from "@/components/ui/Icon";

interface Props {
  roomId: string;
  game: GameDefinition;
  player: Player;
  players: Player[];
  editable: boolean;
}

const stepBtn = "flex h-6 w-6 items-center justify-center rounded text-white/70 hover:bg-white/15 hover:text-white";

export function Counters({ roomId, game, player, players, editable }: Props) {
  const opponentCounters = player.opponentCounters ?? {};

  // The primary counter (life) is shown in the TileBar under the video, not here.
  const chips: { key: string; label: string; value: number; onBump: (d: number) => void }[] = [];
  game.counters.slice(1).forEach((c) => {
    if (c.perOpponent) {
      for (const o of players) {
        if (o.uid === player.uid) continue;
        const value = opponentCounters[c.id]?.[o.uid] ?? 0;
        chips.push({ key: `${c.id}:${o.uid}`, label: `${c.name} · ${o.name}`, value, onBump: (d) => bumpOpponentCounter(roomId, player, c, o, d) });
      }
    } else {
      chips.push({ key: c.id, label: c.name, value: player.counters[c.id] ?? 0, onBump: (d) => bumpCounter(roomId, player, c, d) });
    }
  });

  return (
    <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
      {chips.map((chip) => {
        if (chip.value === 0 && !editable) return null;
        return (
          <div key={chip.key} className="flex items-center gap-0.5 rounded-md bg-black/55 px-1 text-white backdrop-blur-sm">
            {editable && (
              <button type="button" className={stepBtn} onClick={() => chip.onBump(-1)}>
                <Icon name="minus" size={12} />
              </button>
            )}
            <span className="flex items-baseline gap-1 px-1">
              <span className="text-[10px] text-white/60 sm:text-[11px]">{chip.label}</span>
              <span className="font-mono text-xs tabular-nums">{chip.value}</span>
            </span>
            {editable && (
              <button type="button" className={stepBtn} onClick={() => chip.onBump(1)}>
                <Icon name="plus" size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
