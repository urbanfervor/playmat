"use client";
import type { Deck } from "@/lib/rooms";
import { Dialog } from "@/components/ui/Dialog";
import { cardLabel } from "./CardPicker";
import { safeImageUrl } from "@/lib/imageUrl";

interface Props {
  name: string;
  deck: Deck;
  onClose: () => void;
}

/** Read-only look at another player's deck. */
export function DeckView({ name, deck, onClose }: Props) {
  return (
    <Dialog onClose={onClose} className="max-w-2xl">
      <h2 className="text-sm font-semibold text-fg">{name}&apos;s deck</h2>
      {deck.featured.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {deck.featured.map((c) => (
            <figure key={c.slot} className="w-44">
              <img src={safeImageUrl(c.imageUrl)} alt={c.name} className="rounded-md shadow-lg" />
              <figcaption className="mt-1 truncate text-xs text-muted">{cardLabel(c)}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {deck.list && <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-md bg-bg p-2 font-mono text-xs text-fg">{deck.list}</pre>}
    </Dialog>
  );
}
