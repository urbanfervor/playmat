"use client";
import { useEffect, useState } from "react";
import { games } from "@/games";
import { watchLiveRooms, type Room } from "@/lib/rooms";
import { useUser } from "@/lib/useUser";
import { isAdmin } from "@/lib/admin";
import { Button } from "@/components/ui/Button";
import { TableCard } from "./TableCard";

export function LiveTables() {
  const user = useUser();
  const [gameId, setGameId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<{ id: string; room: Room }[]>([]);
  useEffect(() => {
    if (user) return watchLiveRooms(setRooms);
  }, [user]);
  const shown = gameId ? rooms.filter((r) => r.room.game === gameId) : rooms;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1">
        <h2 className="mr-2 flex items-center gap-2 whitespace-nowrap text-base font-semibold">
          <span className="h-2 w-2 rounded-full bg-live" />
          Live tables
        </h2>
        <Button variant="ghost" active={gameId === null} onClick={() => setGameId(null)}>All</Button>
        {Object.values(games).map((g) => (
          <Button key={g.id} variant="ghost" active={gameId === g.id} onClick={() => setGameId(g.id)}>{g.name}</Button>
        ))}
        <span className="ml-auto text-xs text-muted">{shown.length} playing</span>
      </div>
      <div className="grid grid-cols-1 gap-ui sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => (
          <TableCard key={r.id} id={r.id} room={r.room} admin={isAdmin(user)} />
        ))}
      </div>
      {shown.length === 0 && <p className="text-muted">No live tables right now. Start one.</p>}
    </section>
  );
}
