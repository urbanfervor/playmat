"use client";
import { useEffect, useState } from "react";
import { getGame } from "@/games";
import { watchPlayers, watchRoom, type Player, type Room } from "@/lib/rooms";
import { useUser } from "@/lib/useUser";
import { useRecordGame } from "@/lib/profile";
import { useTablePresence } from "@/lib/presence";
import { JoinForm } from "./JoinForm";
import { Table } from "@/components/table/Table";

export function RoomClient({ roomId }: { roomId: string }) {
  const user = useUser();
  const [room, setRoom] = useState<Room | null | undefined>(undefined);
  const [players, setPlayers] = useState<Player[]>([]);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (!user) return;
    const stopRoom = watchRoom(roomId, setRoom);
    const stopPlayers = watchPlayers(roomId, setPlayers);
    return () => {
      stopRoom();
      stopPlayers();
    };
  }, [roomId, user]);

  const me = players.find((p) => p.uid === user?.uid);
  useRecordGame(roomId, room, me);
  useTablePresence(roomId, room?.name, me);

  if (!user || room === undefined) return <Centered>Loading…</Centered>;
  if (room === null) return <Centered>Room not found.</Centered>;

  const game = getGame(room.game);
  if (!me && !watching) {
    return <JoinForm roomId={roomId} uid={user.uid} defaultName={user.displayName?.split(" ")[0] ?? ""} photoURL={user.photoURL} game={game} room={room} players={players} onWatch={() => setWatching(true)} />;
  }

  return <Table roomId={roomId} uid={user.uid} user={user} game={game} room={room} players={players} me={me} onSitDown={() => setWatching(false)} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center text-muted">{children}</div>;
}
