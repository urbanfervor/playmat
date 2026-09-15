"use client";
import { useParticipants } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import type { Player } from "@/lib/rooms";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

export const photoOf = (p: Participant): string | null => {
  try {
    return p.metadata ? (JSON.parse(p.metadata).photoURL ?? null) : null;
  } catch {
    return null;
  }
};

/** Connected viewers who aren't seated. Must render inside LiveKitRoom. */
export function useSpectators(players: Player[]): Participant[] {
  return useParticipants().filter((p) => !players.some((x) => x.uid === p.identity));
}

/** Avatars of everyone watching. */
export function Spectators({ players }: { players: Player[] }) {
  const watching = useSpectators(players);
  if (watching.length === 0) return null;
  const names = watching.map((p) => p.name || "Viewer");
  return (
    <span className="flex items-center gap-1 whitespace-nowrap px-1 text-ui text-muted" title={`Watching: ${names.join(", ")}`}>
      <Icon name="eye" />
      <span className="flex -space-x-1.5">
        {watching.slice(0, 5).map((p, i) => (
          <Avatar key={p.identity} name={names[i]} photoURL={photoOf(p)} size={18} className="ring-2 ring-bg-2" />
        ))}
      </span>
      {watching.length > 5 && <span>+{watching.length - 5}</span>}
    </span>
  );
}
