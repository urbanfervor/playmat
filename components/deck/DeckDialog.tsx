"use client";
import { useEffect, useState } from "react";
import type { GameDefinition } from "@/games/types";
import { parseDecklist } from "@/lib/decklist";
import { setRosterCard, updatePlayer, type DeckCard, type Player, type Room } from "@/lib/rooms";
import { logEvent } from "@/lib/log";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { inputClass } from "@/components/ui/Input";
import { CardPicker, cardLabel } from "./CardPicker";

interface Props {
  roomId: string;
  game: GameDefinition;
  room: Room;
  me: Player;
  onClose: () => void;
}

/** Editor for the local player's deck: headline cards per slot, plus a pasted list where the game allows one. */
export function DeckDialog({ roomId, game, room, me, onClose }: Props) {
  const slots = game.deckSlots.filter((s) => !s.formats || s.formats.includes(room.format));
  const [featured, setFeatured] = useState<DeckCard[]>(me.deck?.featured ?? []);
  const [list, setList] = useState(me.deck?.list ?? "");
  const parsed = game.deckList ? parseDecklist(list) : null;
  const missing = slots.filter((s) => !s.optional && !featured.some((f) => f.slot === s.id));

  // Fill empty slots from commanders named in the pasted list.
  useEffect(() => {
    if (!parsed?.commanders.length) return;
    const open = slots.filter((s) => !featured.some((f) => f.slot === s.id));
    const names = parsed.commanders.filter((n) => !featured.some((f) => f.name === n)).slice(0, open.length);
    if (!names.length) return;
    const ctrl = new AbortController();
    Promise.all(
      names.map((n) =>
        fetch(`/api/cards/${game.id}/search?q=${encodeURIComponent(`!"${n}"`)}`, { signal: ctrl.signal })
          .then((r) => r.json())
          .then((b) => b.cards?.[0])
          .catch(() => undefined),
      ),
    ).then((cards) => {
      const found = cards.flatMap((c, i) => (c ? [{ slot: open[i].id, name: c.name, subtitle: c.subtitle, imageUrl: c.imageUrl }] : []));
      if (found.length) setFeatured((prev) => [...prev, ...found.filter((f) => !prev.some((p) => p.slot === f.slot))]);
    });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.commanders.join("|")]);

  function set(slot: string, card: DeckCard | undefined) {
    setFeatured((prev) => [...prev.filter((f) => f.slot !== slot), ...(card ? [card] : [])]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const ordered = slots.flatMap((s) => featured.filter((f) => f.slot === s.id));
    await updatePlayer(roomId, me.uid, { deck: { featured: ordered, ...(game.deckList && list.trim() ? { list: list.trim() } : {}) } });
    const [head] = ordered;
    await setRosterCard(roomId, me.uid, head ? { name: cardLabel(head), imageUrl: head.imageUrl } : null);
    const headline = ordered.map(cardLabel).join(" / ");
    logEvent(roomId, headline ? `${me.name} is playing ${headline}` : `${me.name} set a deck`);
    onClose();
  }

  async function clear() {
    await updatePlayer(roomId, me.uid, { deck: null });
    await setRosterCard(roomId, me.uid, null);
    onClose();
  }

  return (
    <Dialog onClose={onClose} className="max-w-md">
      <h2 className="text-sm font-semibold text-fg">Your deck</h2>
      <form className="flex flex-col gap-3" onSubmit={save}>
        {slots.map((s) => (
          <CardPicker key={s.id} gameId={game.id} slot={s} value={featured.find((f) => f.slot === s.id)} onChange={(c) => set(s.id, c)} />
        ))}
        {game.deckList && (
          <Field label="Decklist">
            <textarea
              className={`${inputClass} min-h-40 resize-y py-1.5 font-mono text-xs`}
              placeholder={"Paste an export from Arena, Moxfield, Archidekt…\n1 Sol Ring\n1 Command Tower"}
              value={list}
              onChange={(e) => setList(e.target.value)}
            />
            {parsed && parsed.count > 0 && (
              <span className="text-xs text-muted">
                {parsed.count} cards{parsed.commanders.length ? ` · commander: ${parsed.commanders.join(", ")}` : ""}
              </span>
            )}
          </Field>
        )}
        <div className="flex justify-end gap-2">
          {me.deck && (
            <Button type="button" size="md" className="mr-auto text-danger" onClick={clear}>Remove</Button>
          )}
          <Button type="button" size="md" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" disabled={missing.length > 0 || (featured.length === 0 && !list.trim())}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
