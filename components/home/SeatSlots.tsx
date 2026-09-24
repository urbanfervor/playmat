import type { Room } from "@/lib/rooms";
import { Avatar } from "@/components/ui/Avatar";

/** One slot per seat: the player's headline card art, their avatar without one, or an outlined open seat. */
export function SeatSlots({ room }: { room: Room }) {
  const seats = room.seats ?? 4;
  const uids = Object.keys(room.seated ?? {}).slice(0, seats);
  const empty = Math.max(0, seats - uids.length);
  return (
    <div className={`absolute inset-0 grid gap-px ${seats > 2 ? "grid-cols-2 grid-rows-2" : "grid-cols-2"}`}>
      {uids.map((uid) => {
        const name = room.seated[uid];
        const entry = room.roster?.[uid];
        return entry?.card ? (
          <div
            key={uid}
            title={`${name} · ${entry.card.name}`}
            className="bg-cover"
            style={{ backgroundImage: `url(${entry.card.imageUrl})`, backgroundPosition: "center 22%" }}
          />
        ) : (
          <div key={uid} className="flex items-center justify-center">
            <Avatar name={name} photoURL={entry?.photoURL} size={28} />
          </div>
        );
      })}
      {Array.from({ length: empty }, (_, i) => (
        <div key={`empty-${i}`} className="m-2 flex items-center justify-center rounded-md border border-dashed border-white/20 text-[10px] uppercase tracking-wider text-white/40">
          Open
        </div>
      ))}
    </div>
  );
}
