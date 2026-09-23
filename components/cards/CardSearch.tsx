"use client";
import { useEffect, useState } from "react";
import type { CardSummary, GameDefinition } from "@/games/types";
import { updatePlayer } from "@/lib/rooms";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { safeImageUrl } from "@/lib/imageUrl";

interface Props {
  roomId: string;
  game: GameDefinition;
  uid: string;
  /** Called with the chosen card instead of revealing it. */
  onPick?: (card: CardSummary) => void;
  onClose: () => void;
}

export function CardSearch({ roomId, game, uid, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return setCards([]);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/cards/${game.id}/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((b) => setCards(b.cards ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, game.id]);

  function reveal(card: CardSummary) {
    if (onPick) onPick(card);
    else updatePlayer(roomId, uid, { revealedCard: { name: card.name, imageUrl: card.imageUrl } });
    onClose();
  }

  return (
    <Dialog onClose={onClose} className="max-w-3xl">
      <Input placeholder={`Search ${game.name} cards…`} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
      <div className="grid grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
        {cards.map((c) => (
          <button key={c.id} type="button" className="rounded-md p-1 text-left hover:bg-panel-2" title={c.text} onClick={() => reveal(c)}>
            <img src={safeImageUrl(c.imageUrl)} alt={c.name} className="rounded" />
            <div className="mt-1 truncate text-xs">
              {c.name}
              {c.subtitle && <span className="text-muted">, {c.subtitle}</span>}
            </div>
          </button>
        ))}
      </div>
      {loading && <p className="text-xs text-muted">Searching…</p>}
      {!loading && query.trim().length >= 2 && cards.length === 0 && <p className="text-xs text-muted">No cards found.</p>}
    </Dialog>
  );
}
