import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from "firebase/firestore";
import { db } from "./firebase";
import { postAsUser } from "./api";

export type NotifyMethod = "push" | "email";

/** wants/{id}: someone looking for a game in a time window. Public; deleted by TTL once endsAt passes. */
export interface Want {
  uid: string;
  name: string;
  photoURL: string | null;
  game: string;
  format: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  /** At least one. */
  notify: NotifyMethod[];
  createdAt: Timestamp | null;
  /** Tables the server has alerted this registration about. Written by the server only. */
  alerted?: string[];
}

/** Posts a registration and tells the server so the admin hears about it. */
export async function createWant(want: Omit<Want, "createdAt" | "alerted">) {
  const ref = await addDoc(collection(db(), "wants"), { ...want, createdAt: serverTimestamp() });
  postAsUser("/api/wants/posted", { wantId: ref.id });
}

export const deleteWant = (id: string) => deleteDoc(doc(db(), "wants", id));

/** Streams registrations whose window has not ended yet, soonest first. */
export function watchWants(cb: (wants: { id: string; want: Want }[]) => void) {
  const q = query(collection(db(), "wants"), where("endsAt", ">", Timestamp.now()), orderBy("endsAt"), limit(50));
  return onSnapshot(q, (snap) => {
    const wants = snap.docs.map((d) => ({ id: d.id, want: d.data() as Want }));
    cb(wants.sort((a, b) => a.want.startsAt.toMillis() - b.want.startsAt.toMillis()));
  });
}

/** Streams the viewer's own registrations, still-open ones only. */
export function watchMyWants(uid: string, cb: (wants: { id: string; want: Want }[]) => void) {
  return onSnapshot(query(collection(db(), "wants"), where("uid", "==", uid)), (snap) => {
    const now = Date.now();
    cb(snap.docs.map((d) => ({ id: d.id, want: d.data() as Want })).filter((w) => w.want.endsAt.toMillis() > now));
  });
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

/** "now–9:00 PM", "7:00–9:00 PM", or "Fri 7:00–9:00 PM" when not today. */
export function formatWindow(want: Want, now = Date.now()) {
  const start = want.startsAt.toDate();
  const end = timeFormat.format(want.endsAt.toDate());
  if (start.getTime() <= now) return `now–${end}`;
  const day = start.toDateString() === new Date(now).toDateString() ? "" : `${dayFormat.format(start)} `;
  return `${day}${timeFormat.format(start)}–${end}`;
}

/**
 * Tells the server a table was created or opened, so it can alert matching registrants and the admin.
 * With wantId, the table was started for that registration and only its owner is alerted.
 */
export const announceTable = (roomId: string, wantId?: string) => postAsUser("/api/wants/notify", { roomId, wantId });
