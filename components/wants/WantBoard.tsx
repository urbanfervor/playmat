"use client";
import { useEffect, useState } from "react";
import { watchWants, type Want } from "@/lib/wants";
import { useUser } from "@/lib/useUser";
import { WantRow } from "./WantRow";

/** Everyone currently looking for a game. Rows drop off when their window ends. */
export function WantBoard() {
  const user = useUser();
  const [wants, setWants] = useState<{ id: string; want: Want }[]>([]);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (user) return watchWants(setWants);
  }, [user]);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  const active = wants.filter((w) => w.want.endsAt.toMillis() > Date.now());
  if (!user || active.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <h2 className="mr-2 text-base font-semibold">Looking for a game</h2>
        <span className="ml-auto text-xs text-muted">{active.length} waiting</span>
      </div>
      <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {active.map((w) => (
          <WantRow key={w.id} id={w.id} want={w.want} uid={user.uid} />
        ))}
      </ul>
    </section>
  );
}
