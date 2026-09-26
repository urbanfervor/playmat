"use client";
import { useState } from "react";
import type { GameDefinition } from "@/games/types";
import { joinRoom, type Player, type Room } from "@/lib/rooms";
import { TopNav } from "@/components/nav/TopNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";

interface Props {
  roomId: string;
  uid: string;
  game: GameDefinition;
  room: Room;
  players: Player[];
  /** Prefilled with the first name from the Google display name when signed in. */
  defaultName?: string;
  photoURL: string | null;
  leaveHref?: string;
  onWatch: () => void;
}

export function JoinForm({ roomId, uid, game, room, players, defaultName = "", photoURL, leaveHref, onWatch }: Props) {
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const format = game.formats.find((f) => f.id === room.format);
  const full = players.length >= (room.seats ?? 4);
  const banned = (room.banned ?? []).includes(uid);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const taken = new Set(players.map((p) => p.seat));
    let seat = 0;
    while (taken.has(seat)) seat++;
    await joinRoom(roomId, uid, name.trim(), seat, photoURL);
  }

  return (
    <>
      <TopNav roomId={roomId} title={room.name} leaveHref={leaveHref} />
      <main className="mx-auto flex max-w-sm flex-col gap-4 px-5 py-12">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">{room.name}</h1>
          <p className="mt-1 text-muted">
            {game.name} · {format?.name} · {players.length ? `At the table: ${players.map((p) => p.name).join(", ")}` : "Nobody here yet."}
          </p>
          {room.description && <p className="mt-2 whitespace-pre-line text-sm text-fg/80">{room.description}</p>}
        </header>
        {banned ? (
          <p className="text-danger">The host removed you from this table.</p>
        ) : full ? (
          <p className="text-danger">This table is full.</p>
        ) : (
          <form className="flex flex-col gap-2" onSubmit={join}>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Button type="submit" variant="primary" size="md" disabled={!name.trim() || busy}>
              Sit down
            </Button>
          </form>
        )}
        <Button variant="ghost" size="md" onClick={onWatch}>
          <Icon name="eye" /> Just watch
        </Button>
      </main>
    </>
  );
}
