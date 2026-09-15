"use client";
import type { GameDefinition } from "@/games/types";
import type { Player } from "@/lib/rooms";
import { bumpCounter } from "@/lib/counters";
import { Icon } from "@/components/ui/Icon";

interface Props {
  roomId: string;
  game: GameDefinition;
  player: Player;
  /** Seat index in the 2x2 grid; life sits in the corner facing the table centre. */
  seat: number;
  editable: boolean;
  hasTurn: boolean;
}

const corners = ["bottom-2 right-3", "bottom-2 left-3", "top-2 right-3", "top-2 left-3"];
const shadow = "[text-shadow:0_1px_3px_rgba(0,0,0,.9),0_0_10px_rgba(0,0,0,.7)]";
const stepBtn = `flex h-7 w-7 items-center justify-center text-white/70 hover:text-white ${shadow}`;

export function Life({ roomId, game, player, seat, editable, hasTurn }: Props) {
  const counter = game.counters[0];
  const bump = (delta: number) => bumpCounter(roomId, player, counter, delta);
  return (
    <div className={`absolute flex items-center ${corners[seat] ?? corners[0]}`} onClick={(e) => e.stopPropagation()}>
      {editable && (
        <button type="button" className={stepBtn} onClick={() => bump(-1)} title="−1">
          <Icon name="minus" size={14} className="drop-shadow-[0_1px_2px_rgba(0,0,0,.9)]" />
        </button>
      )}
      <span className={`min-w-12 text-center font-mono text-4xl font-semibold tabular-nums leading-none ${hasTurn ? "text-accent" : "text-white"} ${shadow}`}>
        {player.counters[counter.id] ?? 0}
      </span>
      {editable && (
        <button type="button" className={stepBtn} onClick={() => bump(1)} title="+1">
          <Icon name="plus" size={14} className="drop-shadow-[0_1px_2px_rgba(0,0,0,.9)]" />
        </button>
      )}
    </div>
  );
}
