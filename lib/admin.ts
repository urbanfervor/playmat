import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { roomRef, updateRoom } from "./rooms";
import { logEvent } from "./log";
import type { AppUser } from "./useUser";

/** Accounts that may close any table. Mirrored in firestore.rules (isAdmin). */
const ADMIN_EMAILS = ["tom3fitzgerald@gmail.com"];

export const isAdmin = (user: AppUser | null) => !!user && !user.isAnonymous && !!user.email && ADMIN_EMAILS.includes(user.email);

/** Admin only: deletes a room and everything under it. */
export async function deleteRoom(roomId: string) {
  for (const sub of ["players", "messages", "log"]) {
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
