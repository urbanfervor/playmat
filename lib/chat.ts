import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, type Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface Message {
  id: string;
  uid: string;
  name: string;
  text: string;
  /** Sent from the stands rather than a seat. */
  spectator?: boolean;
  createdAt: Timestamp | null;
}

const messagesRef = (roomId: string) => collection(db(), "rooms", roomId, "messages");

export const sendMessage = (roomId: string, uid: string, name: string, text: string, spectator: boolean) =>
  addDoc(messagesRef(roomId), { uid, name, text, spectator, createdAt: serverTimestamp() });

/** Streams the latest 100 messages, oldest first. */
export function watchMessages(roomId: string, cb: (messages: Message[]) => void) {
  const q = query(messagesRef(roomId), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }) as Message);
    cb(messages.reverse());
  });
}
