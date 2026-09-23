"use client";
import { useEffect } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Player } from "./rooms";

/**
 * users/{uid} is a player's presence card. Their client heartbeats lastSeen
 * while a tab is open and records the table they are seated at. Name and
 * photo are whatever they last sat down as.
 */
export interface Presence {
  name?: string;
  photoURL?: string | null;
  lastSeen: Timestamp | null;
  table?: { id: string; name: string } | null;
}

const HEARTBEAT_MS = 60_000;
/** Longer than two heartbeats so one missed write doesn't flicker someone offline. */
export const ONLINE_MS = 150_000;

export const presenceRef = (uid: string) => doc(db(), "users", uid);

const write = (uid: string, patch: Partial<Presence> | { lastSeen: ReturnType<typeof serverTimestamp> }) =>
  setDoc(presenceRef(uid), patch, { merge: true }).catch((err) => console.error("presence write failed", err));

/** Keeps lastSeen fresh while the tab is open. Mount once, app-wide. */
export function useHeartbeat(uid: string | undefined) {
  useEffect(() => {
    if (!uid) return;
    const beat = () => write(uid, { lastSeen: serverTimestamp() });
    const onVisible = () => document.visibilityState === "visible" && beat();
    beat();
    const timer = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [uid]);
}

/**
 * Records the table the player is seated at, and clears it when they stand up or
 * leave the page. Private tables are never recorded: presence is readable by anyone.
 */
export function useTablePresence(roomId: string, roomName: string | undefined, isPrivate: boolean, me: Player | undefined) {
  const uid = me?.uid;
  const name = me?.name;
  const photoURL = me?.photoURL ?? null;
  useEffect(() => {
    if (!uid || !roomName) return;
    write(uid, { table: isPrivate ? null : { id: roomId, name: roomName }, name, photoURL });
    return () => {
      write(uid, { table: null });
    };
  }, [roomId, roomName, isPrivate, uid, name, photoURL]);
}

export function watchPresence(uid: string, cb: (presence: Presence | null) => void) {
  return onSnapshot(presenceRef(uid), (snap) => cb(snap.exists() ? (snap.data() as Presence) : null));
}

export const isOnline = (presence: Presence | null, now: number) =>
  !!presence?.lastSeen && now - presence.lastSeen.toMillis() < ONLINE_MS;
