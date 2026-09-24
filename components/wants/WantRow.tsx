"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getGame } from "@/games";
import { createRoom } from "@/lib/rooms";
import { announceTable, deleteWant, formatWindow, type Want } from "@/lib/wants";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

/** "Alex wants to play Modern, 7–9pm", with a one-click table for anyone else. */
export function WantRow({ id, want, uid }: { id: string; want: Want; uid: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const game = getGame(want.game);
  const format = game.formats.find((f) => f.id === want.format)?.name ?? want.format;
  const mine = want.uid === uid;

  async function start() {
    setBusy(true);
    const later = want.startsAt.toMillis() > Date.now();
    const roomId = await createRoom(uid, `${want.name}'s ${format} game`, want.game, want.format, false, later ? want.startsAt.toDate() : null);
    await announceTable(roomId, id);
    router.push(`/room/${roomId}`);
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-line bg-panel px-3 py-2">
      <Avatar name={want.name} photoURL={want.photoURL} size={28} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-fg">
          <span className="font-medium">{want.name}</span> wants to play {format}
        </div>
        <div className="truncate text-xs text-muted">{game.name} · {formatWindow(want)}</div>
      </div>
      {mine ? (
        <Button variant="ghost" onClick={() => deleteWant(id)}>Remove</Button>
      ) : (
        <Button variant="primary" disabled={busy} onClick={start}>Start a table</Button>
      )}
    </li>
  );
}
