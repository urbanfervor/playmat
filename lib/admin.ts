import { collection, deleteDoc, getDocs, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import { roomRef, updateRoom, type Room } from "./rooms";
import { logEvent } from "./log";
import type { AppUser } from "./useUser";

/** Accounts that may close any table. Mirrored in firestore.rules (isAdmin). */
const ADMIN_EMAILS = ["admin@example.com"];

export const isAdmin = (user: AppUser | null) => !!user && !user.isAnonymous && !!user.email && ADMIN_EMAILS.includes(user.email);

/** Deletes a room and everything under it. Admins anywhere; the host while the table is still scheduled. */
export async function deleteRoom(roomId: string) {
  for (const sub of ["players", "watchers", "messages", "log"]) {
    const snap = await getDocs(collection(db(), "rooms", roomId, sub));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(roomRef(roomId));
}

/** Admin only: become the host of a table someone else started. */
export async function takeHost(roomId: string, uid: string, name: string) {
  await updateRoom(roomId, { hostUid: uid });
  logEvent(roomId, `${name} took over hosting`);
}

/** Admin only: streams the newest tables of every kind, private and empty ones included. */
export function watchAllRooms(cb: (rooms: { id: string; room: Room }[]) => void) {
  const q = query(collection(db(), "rooms"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, room: d.data({ serverTimestamps: "estimate" }) as Room }))));
}
