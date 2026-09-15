"use client";
import { setStatus, startGame, statusLabels, type GameStatus as Status, type Player, type Room } from "@/lib/rooms";
import { Select } from "@/components/ui/Select";

interface Props {
  roomId: string;
  room: Room;
  players: Player[];
  /** The host gets a picker; everyone else sees a badge. */
  editable: boolean;
  /** Called after the host marks the game over, to ask who won. */
  onOver?: () => void;
}

const badge: Record<Status, string> = {
  lobby: "bg-panel text-muted",
  playing: "bg-live text-white",
  paused: "bg-panel text-fg",
  over: "bg-panel text-muted",
};

export function GameStatus({ roomId, room, players, editable, onOver }: Props) {
  const status = room.status ?? "lobby";

  function change(next: Status) {
    if (next === "playing" && !room.turn.playerUid && players.length) startGame(roomId, players);
    else setStatus(roomId, next);
    if (next === "over") onOver?.();
  }

  if (!editable) {
    return <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold ${badge[status]}`}>{statusLabels[status]}</span>;
  }
  return (
    <Select size="sm" value={status} title="Game status" onChange={(e) => change(e.target.value as Status)}>
      {(Object.keys(statusLabels) as Status[]).map((s) => (
        <option key={s} value={s}>{statusLabels[s]}</option>
      ))}
    </Select>
  );
}
