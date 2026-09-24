"use client";
import { useEffect, useState } from "react";
import { watchUpcomingRooms, type Room } from "@/lib/rooms";
import { useUser } from "@/lib/useUser";
import { isAdmin } from "@/lib/admin";
import { TableCard } from "./TableCard";

export function UpcomingTables() {
  const user = useUser();
  const [rooms, setRooms] = useState<{ id: string; room: Room }[]>([]);
  useEffect(() => {
    if (user) return watchUpcomingRooms(setRooms);
  }, [user]);
  if (rooms.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <h2 className="mr-2 text-base font-semibold">Upcoming</h2>
        <span className="ml-auto text-xs text-muted">{rooms.length} scheduled</span>
      </div>
      <div className="grid grid-cols-1 gap-ui sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <TableCard key={r.id} id={r.id} room={r.room} admin={isAdmin(user)} />
        ))}
      </div>
    </section>
  );
}
