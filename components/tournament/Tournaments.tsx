"use client";
import { useEffect, useState } from "react";
import { watchTournaments, type Tournament } from "@/lib/tournaments";
import { useUser } from "@/lib/useUser";
import { TournamentCard } from "./TournamentCard";

/** The home feed's tournaments, newest first. Hidden until there is one. */
export function Tournaments() {
  const user = useUser();
  const [rows, setRows] = useState<{ id: string; tournament: Tournament }[]>([]);
  useEffect(() => {
    if (user) return watchTournaments(setRows);
  }, [user]);
  if (rows.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">Tournaments</h2>
      <div className="grid grid-cols-1 gap-ui sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <TournamentCard key={r.id} id={r.id} tournament={r.tournament} />
        ))}
      </div>
    </section>
  );
}
