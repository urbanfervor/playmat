"use client";
import type { GameDefinition } from "@/games/types";
import type { BoardToken, Player } from "@/lib/rooms";
import { bumpCounter } from "@/lib/counters";
import { Icon } from "@/components/ui/Icon";

interface Props {
  roomId: string;
  game: GameDefinition;
  player: Player;
  token: BoardToken;
  editable: boolean;
}

const step = "flex h-5 w-5 items-center justify-center rounded text-white/70 hover:bg-white/15 hover:text-white";
const stop = (e: React.SyntheticEvent) => e.stopPropagation();

/** The visible marker. Dragging and the editor are handled by the parent. */
export function TokenPill({ roomId, game, player, token, editable }: Props) {
  if (token.kind === "counter") {
    const counter = game.counters.find((c) => c.id === token.counterId);
    if (!counter) return null;
    return (
      <div className="flex items-center gap-0.5 rounded-lg border border-white/20 bg-black/75 px-1.5 py-1 text-white shadow-lg backdrop-blur">
        <span className="mr-1 text-[10px] uppercase tracking-wider text-white/60">{counter.name}</span>
        {editable && (
          <button type="button" className={step} onPointerDown={stop} onClick={(e) => { stop(e); bumpCounter(roomId, player, counter, -1); }}>
            <Icon name="minus" size={12} />
          </button>
        )}
        <span className="min-w-7 text-center font-mono text-lg font-semibold tabular-nums leading-none">{player.counters[counter.id] ?? 0}</span>
        {editable && (
          <button type="button" className={step} onPointerDown={stop} onClick={(e) => { stop(e); bumpCounter(roomId, player, counter, 1); }}>
            <Icon name="plus" size={12} />
          </button>
        )}
      </div>
    );
  }

  if (token.kind === "marker") {
    const marker = game.markers.find((m) => m.id === token.markerId);
    if (!marker) return null;
    return (
      <div
        title={marker.blurb}
        className="flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-lg"
      >
        <Icon name="arrow-right" size={12} /> {marker.name}
      </div>
    );
  }

  if (token.kind === "card") {
    return <img src={token.imageUrl} alt={token.name} title={token.name} draggable={false} className="w-24 rounded-md shadow-xl ring-1 ring-white/20 transition-[width] hover:w-40" />;
  }

  const keywords = token.statuses.map((s) => game.keywords.find((k) => k.id === s)).filter(Boolean);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="rounded-lg border border-white/20 bg-black/75 px-2 py-1 font-mono text-lg font-semibold tabular-nums leading-none text-white shadow-lg backdrop-blur">
        {token.values[0]}/{token.values[1]}
      </div>
      {keywords.length > 0 && (
        <div className="flex max-w-40 flex-wrap justify-center gap-0.5">
          {keywords.map((k) => (
            <span key={k!.id} title={k!.blurb} className="rounded-full bg-accent px-1.5 py-px text-[10px] font-medium text-accent-fg shadow">
              {k!.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
