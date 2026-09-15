"use client";
import { useRouter } from "next/navigation";
import type { TableProps } from "./Table";
import { deleteRoom, isAdmin } from "@/lib/admin";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { GameStatus } from "./GameStatus";
import { Spectators } from "./Spectators";

export function SpectatorBar({ roomId, room, players, onSitDown, onPanel }: TableProps & { onPanel: () => void }) {
  const admin = isAdmin(useUser());
  const router = useRouter();
  async function closeTable() {
    if (!confirm(`Close “${room.name}”? This removes the table for everyone.`)) return;
    await deleteRoom(roomId);
    router.push("/");
  }
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line bg-bg-2 px-3 py-1 text-ui text-muted md:h-bar md:flex-nowrap md:py-0">
      <GameStatus roomId={roomId} room={room} players={players} editable={false} />
      <Icon name="eye" /> Watching · {players.length} at the table
      <Spectators players={players} />
      <Button variant="primary" className="ml-auto" onClick={onSitDown}>
        Sit down
      </Button>
      <Button variant="ghost" className="md:hidden" onClick={onPanel}>
        <Icon name="chat" /> Chat
      </Button>
      {admin && (
        <Button variant="ghost" className="text-danger" title="Admin: delete this table for everyone" onClick={closeTable}>
          <Icon name="trash" /> Close table
        </Button>
      )}
    </div>
  );
}
