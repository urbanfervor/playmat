import Link from "next/link";
import { getGame } from "@/games";
import { statusLabels, type Room } from "@/lib/rooms";
import { deleteRoom } from "@/lib/admin";
import { formatScheduled } from "@/lib/schedule";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AvatarStack } from "./AvatarStack";
import { SeatSlots } from "./SeatSlots";

const gameTag: Record<string, string> = { mtg: "MTG", swu: "SWU", cyberpunk: "CP" };
const mats: Record<string, [string, string]> = { mtg: ["#3d5a3a", "#1c2d1f"], swu: ["#2f3f5c", "#161d2e"], cyberpunk: ["#5c2f5a", "#1e1428"] };

function elapsed(room: Room) {
  const min = room.createdAt ? Math.floor((Date.now() - room.createdAt.toMillis()) / 60000) : 0;
  return min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function TableCard({ id, room, admin = false }: { id: string; room: Room; admin?: boolean }) {
  const players = Object.entries(room.seated ?? {}).map(([uid, name]) => ({ name, photoURL: room.roster?.[uid]?.photoURL }));
  const seats = room.seats ?? 4;
  const open = players.length < seats;
  const format = getGame(room.game).formats.find((f) => f.id === room.format)?.name ?? room.format;
  const mat = mats[room.game] ?? mats.mtg;
  const status = room.status ?? "lobby";
  function close() {
    if (confirm(`Close “${room.name}”? This removes the table for everyone.`)) deleteRoom(id);
  }
  return (
    <div className="relative">
      {admin && (
        <IconButton title="Admin: close this table" className="absolute bottom-2 right-2 z-10 text-danger" onClick={close}>
          <Icon name="trash" size={14} />
        </IconButton>
      )}
      <Link href={`/room/${id}`} className="group flex flex-col gap-2 rounded-lg p-1.5 hover:bg-panel">
      <div
        className="relative aspect-video overflow-hidden rounded-md ring-1 ring-line"
        style={{ background: `radial-gradient(120% 80% at 30% 20%, ${mat[0]}, ${mat[1]})` }}
      >
        <SeatSlots room={room} />
        <span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${status === "playing" ? "bg-live" : "bg-black/55"}`}>
          {status === "playing" ? "Live" : statusLabels[status]}
        </span>
        <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[11px] text-white">
          {status === "scheduled" && room.scheduledAt ? formatScheduled(room.scheduledAt) : elapsed(room)}
        </span>
        <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">{gameTag[room.game]}</span>
        <span className={`absolute bottom-2 right-2 rounded px-1.5 py-0.5 text-[11px] font-medium ${open ? "bg-accent text-accent-fg" : "bg-black/55 text-white"}`}>
          {players.length}/{seats}{open && " · open"}
        </span>
      </div>
      <div className="flex items-start gap-2 px-0.5">
        <AvatarStack people={players} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-fg group-hover:text-accent">{room.name}</div>
          <div className="truncate text-xs text-muted">
            {room.seated?.[room.hostUid] ?? "—"} · {gameTag[room.game]} · {format}
          </div>
        </div>
      </div>
    </Link>
    </div>
  );
}
