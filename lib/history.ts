"use client";
import { useEffect, useState } from "react";
import { collection, getDoc, limit, onSnapshot, orderBy, query, type Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { roomRef, type Room } from "./rooms";

export interface PastPlayer {
  uid: string;
  name: string;
  photoURL: string | null;
}

export interface PastGame {
  roomId: string;
  name: string;
  game: string;
  at: Timestamp | null;
  /** Everyone else seated at that table, from the room's roster. Empty if the room is gone. */
  players: PastPlayer[];
}

/** The viewer's most recent games, with who they played, from users/{uid}/games and each room's roster. */
export function useGameHistory(uid: string | undefined): PastGame[] | null {
  const [games, setGames] = useState<PastGame[] | null>(null);
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db(), "users", uid, "games"), orderBy("at", "desc"), limit(20));
    return onSnapshot(q, async (s) => {
      const rows = await Promise.all(
        s.docs.map(async (d) => {
          const { roomId, name, game, at } = d.data();
          const room = await getDoc(roomRef(roomId)).then((r) => (r.exists() ? (r.data() as Room) : null));
          const players = Object.entries(room?.seated ?? {})
            .filter(([who]) => who !== uid)
            .map(([who, playerName]) => ({ uid: who, name: playerName, photoURL: room?.roster?.[who]?.photoURL ?? null }));
          return { roomId, name, game, at, players };
        }),
      );
      setGames(rows);
    });
  }, [uid]);
  return games;
}
