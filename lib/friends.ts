"use client";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { watchPresence, type Presence } from "./presence";

/** users/{uid}/following/{friendUid}: one-way follows, so you can see when a friend is online or at a table. */
const followRef = (uid: string, friendUid: string) => doc(db(), "users", uid, "following", friendUid);

export const follow = (uid: string, friendUid: string) => setDoc(followRef(uid, friendUid), { at: serverTimestamp() });
export const unfollow = (uid: string, friendUid: string) => deleteDoc(followRef(uid, friendUid));

/** Whether the viewer follows this player. */
export function useFollowing(uid: string | undefined, friendUid: string): boolean {
  const [following, setFollowing] = useState(false);
  useEffect(() => {
    if (!uid || uid === friendUid) return;
    return onSnapshot(followRef(uid, friendUid), (s) => setFollowing(s.exists()));
  }, [uid, friendUid]);
  return following;
}

export interface Friend {
  uid: string;
  presence: Presence | null;
}

/** Everyone the viewer follows, with their live presence. */
export function useFriends(uid: string | undefined): Friend[] {
  const [uids, setUids] = useState<string[]>([]);
  const [presence, setPresence] = useState<Record<string, Presence | null>>({});

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db(), "users", uid, "following"), (s) => setUids(s.docs.map((d) => d.id).sort()));
  }, [uid]);

  const key = uids.join(",");
  useEffect(() => {
    if (!key) return;
    const stops = key.split(",").map((f) => watchPresence(f, (p) => setPresence((prev) => ({ ...prev, [f]: p }))));
    return () => stops.forEach((stop) => stop());
  }, [key]);

  return uids.map((f) => ({ uid: f, presence: presence[f] ?? null }));
}
