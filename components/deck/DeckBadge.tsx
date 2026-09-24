"use client";
import { useState } from "react";
import type { Deck } from "@/lib/rooms";
import { cardLabel } from "./CardPicker";
import { DeckView } from "./DeckView";

interface Props {
  name: string;
  deck: Deck;
}

/** Headline-card thumbnails in a tile bar; click for the full deck. */
export function DeckBadge({ name, deck }: Props) {
  const [open, setOpen] = useState(false);
  const title = deck.featured.map(cardLabel).join(" / ") || "Decklist";
  return (
    <>
      <button type="button" title={title} className="flex h-control items-center gap-1 rounded px-1 hover:bg-panel-2" onClick={() => setOpen(true)}>
        {deck.featured.map((c) => (
          <img key={c.slot} src={c.imageUrl} alt="" className="h-5 rounded-sm" />
        ))}
        <span className="hidden max-w-32 truncate text-ui text-muted lg:inline">{title}</span>
      </button>
      {open && <DeckView name={name} deck={deck} onClose={() => setOpen(false)} />}
    </>
  );
}
