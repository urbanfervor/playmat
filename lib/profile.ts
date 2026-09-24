"use client";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { logEvent } from "./log";
import { roomRef, updateRoom, type Player, type Room } from "./rooms";

/**
 * A player's record lives in three subcollections so Firestore rules can enforce it:
 *   users/{uid}/games/{roomId}          created by the player once a game they are seated at starts
 *   users/{uid}/wins/{roomId}           created by that room's host, only for room.winnerUid
 *   users/{uid}/hearts/{fromUid_roomId} created by a fellow player at that table
 * Counts are the collection sizes.
 */

export interface Record {
  games: number;
  wins: number;
  hearts: number;
}

export function useRecord(uid: string | undefined): Record | null {
  const [record, setRecord] = useState<Record | null>(null);
  useEffect(() => {
    if (!uid) return;
    const counts: Record = { games: 0, wins: 0, hearts: 0 };
    const stops = (Object.keys(counts) as (keyof Record)[]).map((key) =>
      onSnapshot(collection(db(), "users", uid, key), (s) => {
        counts[key] = s.size;
        setRecord({ ...counts });
      }),
    );
    return () => stops.forEach((stop) => stop());
  }, [uid]);
  return record;
}

/** Counts this room as a game played once it has started. Safe to call repeatedly. */
export function useRecordGame(roomId: string, room: Room | null | undefined, me: Player | undefined) {
  const started = !!room && room.status !== "lobby" && room.status !== "scheduled";
  const uid = me?.uid;
  const game = room?.game;
  const name = room?.name;
  useEffect(() => {
    if (!started || !uid) return;
    const ref = doc(db(), "users", uid, "games", roomId);
    getDoc(ref)
      .then((snap) => (snap.exists() ? undefined : setDoc(ref, { roomId, game, name, at: serverTimestamp() })))
      .catch((err) => console.error("recording game failed", err));
  }, [roomId, started, uid, game, name]);
}

/** Host only. Records the winner on the room and adds a win to their profile. Pass null to clear the winner. */
export async function setWinner(roomId: string, room: Room, winner: Player | null) {
  await updateRoom(roomId, { winnerUid: winner?.uid ?? null });
  if (!winner) return;
  logEvent(roomId, `${winner.name} won the game`);
  await setDoc(doc(db(), "users", winner.uid, "wins", roomId), { roomId, game: room.game, name: winner.name, at: serverTimestamp() });
}

const heartRef = (roomId: string, fromUid: string, toUid: string) => doc(db(), "users", toUid, "hearts", `${fromUid}_${roomId}`);

/** Whether the viewer has hearted this player at this table. */
export function useHearted(roomId: string, fromUid: string | undefined, toUid: string): boolean {
  const [hearted, setHearted] = useState(false);
  useEffect(() => {
    if (!fromUid || fromUid === toUid) return;
    return onSnapshot(heartRef(roomId, fromUid, toUid), (s) => setHearted(s.exists()));
  }, [roomId, fromUid, toUid]);
  return hearted;
}

export function toggleHeart(roomId: string, from: Player, to: Player, hearted: boolean) {
  if (hearted) return deleteDoc(heartRef(roomId, from.uid, to.uid));
  logEvent(roomId, `${from.name} gave ${to.name} a heart`);
  return setDoc(heartRef(roomId, from.uid, to.uid), { from: from.uid, roomId, at: serverTimestamp() });
}

export { roomRef };
