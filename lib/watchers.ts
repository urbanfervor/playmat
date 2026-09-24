import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/** rooms/{roomId}/watchers/{uid}: someone who plans to spectate a scheduled table. */
export interface Watcher {
  uid: string;
  name: string;
  photoURL: string | null;
  joinedAt: Timestamp | null;
}

const watcherRef = (roomId: string, uid: string) => doc(db(), "rooms", roomId, "watchers", uid);

export const addWatcher = (roomId: string, uid: string, name: string, photoURL: string | null) =>
  setDoc(watcherRef(roomId, uid), { uid, name, photoURL, joinedAt: serverTimestamp() });

export const removeWatcher = (roomId: string, uid: string) => deleteDoc(watcherRef(roomId, uid));

export function watchWatchers(roomId: string, cb: (watchers: Watcher[]) => void) {
  return onSnapshot(collection(db(), "rooms", roomId, "watchers"), (snap) => cb(snap.docs.map((d) => d.data() as Watcher)));
}
