"use client";
import { useEffect, useState } from "react";
import type { CardSummary, DeckSlotDef } from "@/games/types";
import type { DeckCard } from "@/lib/rooms";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { safeImageUrl } from "@/lib/imageUrl";

interface Props {
  gameId: string;
  slot: DeckSlotDef;
  value?: DeckCard;
  onChange: (card: DeckCard | undefined) => void;
}

export const cardLabel = (c: Pick<CardSummary, "name" | "subtitle">) => (c.subtitle ? `${c.name}, ${c.subtitle}` : c.name);

/** Search field for one deck slot; the search is prefixed with the slot's filter. */
export function CardPicker({ gameId, slot, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardSummary[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return setCards([]);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/cards/${gameId}/search?q=${encodeURIComponent(`${slot.query} ${q}`)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((b) => setCards((b.cards ?? []).slice(0, 8)))
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, gameId, slot.query]);

  function pick(c: CardSummary) {
    onChange({ slot: slot.id, name: c.name, subtitle: c.subtitle, imageUrl: c.imageUrl });
    setQuery("");
    setCards([]);
  }

  return (
    <Field label={slot.optional ? `${slot.name} (optional)` : slot.name}>
      {value ? (
        <div className="flex h-control-md items-center gap-2 rounded-md border border-line bg-bg px-2">
          <img src={safeImageUrl(value.imageUrl)} alt="" className="h-6 rounded-sm" />
          <span className="min-w-0 flex-1 truncate text-sm">{cardLabel(value)}</span>
          <IconButton title="Clear" onClick={() => onChange(undefined)}>
            <Icon name="x" size={13} />
          </IconButton>
        </div>
      ) : (
        <div className="relative">
          <Input placeholder={`Search for a ${slot.name.toLowerCase()}…`} value={query} onChange={(e) => setQuery(e.target.value)} />
          {cards.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-line bg-panel p-1 shadow-xl">
              {cards.map((c) => (
                <li key={c.id}>
                  <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-panel-2" onClick={() => pick(c)}>
                    <img src={safeImageUrl(c.imageUrl)} alt="" className="h-8 rounded-sm" />
                    <span className="truncate">{cardLabel(c)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Field>
  );
}
