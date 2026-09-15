"use client";
import { setWinner } from "@/lib/profile";
import type { Player, Room } from "@/lib/rooms";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  roomId: string;
  room: Room;
  players: Player[];
  onClose: () => void;
}

/** Host picks who won once the game is over. */
export function WinnerDialog({ roomId, room, players, onClose }: Props) {
  async function pick(player: Player | null) {
    await setWinner(roomId, room, player);
    onClose();
  }
  return (
    <Dialog onClose={onClose} className="max-w-xs">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
        <Icon name="trophy" className="text-amber-400" /> Who won?
      </h2>
      <div className="flex flex-col gap-1">
        {players.map((p) => (
          <button
            key={p.uid}
            type="button"
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-panel-2 ${room.winnerUid === p.uid ? "bg-accent/15 text-accent" : "text-fg"}`}
            onClick={() => pick(p)}
          >
            <Avatar name={p.name} photoURL={p.photoURL} size={24} />
            {p.name}
            {room.winnerUid === p.uid && <Icon name="check" size={14} className="ml-auto" />}
          </button>
        ))}
      </div>
      <div className="flex justify-between border-t border-line pt-2">
        <Button variant="ghost" onClick={() => pick(null)}>No winner</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Dialog>
  );
}
