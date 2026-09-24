"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getGame } from "@/games";
import { watchAllRooms } from "@/lib/admin";
import { statusLabels, type Room } from "@/lib/rooms";

/** Admin only: every recent table, so you can tell whether anyone is playing. */
export function AllTables() {
  const [rooms, setRooms] = useState<{ id: string; room: Room }[]>([]);
  useEffect(() => watchAllRooms(setRooms), []);
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">All tables · admin</h2>
      {rooms.length === 0 ? (
        <p className="text-xs text-muted">No tables yet.</p>
      ) : (
        rooms.map(({ id, room }) => (
          <div key={id} className="flex items-baseline justify-between gap-3 border-t border-line pt-2 first:border-t-0 first:pt-0">
            <span className="min-w-0 truncate text-sm text-fg">
              <Link href={`/room/${id}`} className="hover:text-accent">{room.name}</Link>
              <span className="ml-2 text-xs text-muted">{room.seated?.[room.hostUid] ?? "—"} · {Object.keys(room.seated ?? {}).length} seated{room.private && " · private"}</span>
            </span>
            <span className="shrink-0 text-xs text-muted">
              {getGame(room.game).name} · {statusLabels[room.status ?? "lobby"]}
              {room.createdAt && ` · ${room.createdAt.toDate().toLocaleDateString()}`}
            </span>
          </div>
        ))
      )}
    </section>
  );
}
