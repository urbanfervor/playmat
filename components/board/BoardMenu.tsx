"use client";
import { useRef } from "react";
import { useClickOutside } from "@/lib/useClickOutside";
import { useIsMobile } from "@/lib/useIsMobile";
import type { GameDefinition } from "@/games/types";
import { Icon } from "@/components/ui/Icon";

interface Props {
  x: number;
  y: number;
  game: GameDefinition;
  /** Whether this viewer may place tokens on the tile. */
  editable: boolean;
  onIdentify: () => void;
  onAddToken: () => void;
  onPlaceCard: () => void;
  onPlaceCounter: (counterId: string) => void;
  onPlaceMarker: (markerId: string) => void;
  onClose: () => void;
}

const item = "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-ui hover:bg-panel-2";

/** Click or right-click menu on a player's video. A bottom sheet on phones, where the tile is too short to hold it. */
export function BoardMenu({ x, y, game, editable, onIdentify, onAddToken, onPlaceCard, onPlaceCounter, onPlaceMarker, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const sheet = useIsMobile();
  useClickOutside(ref, true, onClose);
  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };
  return (
    <div
      ref={ref}
      className={sheet ? "fixed inset-x-0 bottom-0 z-30 rounded-t-lg border-t border-line bg-panel p-2 shadow-xl" : "absolute z-20 w-48 rounded-lg border border-line bg-panel p-1 shadow-xl"}
      style={sheet ? undefined : { left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {game.cards && (
        <button type="button" className={item} onClick={run(onIdentify)}>
          <Icon name="search" /> Identify card
        </button>
      )}
      {editable && (
        <>
          <button type="button" className={item} onClick={run(onAddToken)}>
            <Icon name="plus" /> Add token
          </button>
          {game.cards && (
            <button type="button" className={item} onClick={run(onPlaceCard)}>
              <Icon name="card" /> Place a card here…
            </button>
          )}
          {game.counters.filter((c) => !c.perOpponent).map((c) => (
            <button key={c.id} type="button" className={item} onClick={run(() => onPlaceCounter(c.id))}>
              <Icon name="coin" /> Place {c.name} here
            </button>
          ))}
          {game.markers.map((m) => (
            <button key={m.id} type="button" className={item} title={m.blurb} onClick={run(() => onPlaceMarker(m.id))}>
              <Icon name="arrow-right" /> Place {m.name} here
            </button>
          ))}
        </>
      )}
    </div>
  );
}
