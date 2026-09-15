import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, type Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface LogEntry {
  id: string;
  text: string;
  createdAt: Timestamp | null;
}

const logRef = (roomId: string) => collection(db(), "rooms", roomId, "log");

export const logEvent = (roomId: string, text: string) => addDoc(logRef(roomId), { text, createdAt: serverTimestamp() });

/** Streams the latest 200 entries, oldest first. */
export function watchLog(roomId: string, cb: (entries: LogEntry[]) => void) {
  const q = query(logRef(roomId), orderBy("createdAt", "desc"), limit(200));
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }) as LogEntry);
    cb(entries.reverse());
  });
}
