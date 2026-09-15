"use client";
import { useEffect, useRef, useState } from "react";
import type { Player } from "@/lib/rooms";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { photoOf, useSpectators } from "./Spectators";

interface Toast {
  id: string;
  name: string;
  photoURL: string | null;
}

/** A brief toast when someone starts watching. Ignores the initial roster and yourself. Must render inside LiveKitRoom. */
export function SpectatorAlerts({ players, uid }: { players: Player[]; uid: string }) {
  const watching = useSpectators(players);
  const seen = useRef<Set<string> | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const ids = watching.map((p) => p.identity).join(",");
  useEffect(() => {
    const fresh = seen.current ? watching.filter((p) => !seen.current!.has(p.identity) && p.identity !== uid) : [];
    seen.current = new Set(watching.map((p) => p.identity));
    if (fresh.length === 0) return;
    const added = fresh.map((p) => ({ id: `${p.identity}:${Date.now()}`, name: p.name || "Viewer", photoURL: photoOf(p) }));
    setToasts((t) => [...t, ...added]);
    const timer = setTimeout(() => setToasts((t) => t.filter((x) => !added.includes(x))), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, uid]);

  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-14 left-1/2 z-40 flex -translate-x-1/2 flex-col gap-1.5">
      {toasts.map((t) => (
        <div key={t.id} className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 text-ui text-fg shadow-xl">
          <Avatar name={t.name} photoURL={t.photoURL} size={20} />
          <span className="font-medium">{t.name}</span> is watching <Icon name="eye" size={13} className="text-muted" />
        </div>
      ))}
    </div>
  );
}
