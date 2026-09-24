import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const canPush = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

/** Asks for notification permission and saves this browser's push subscription to pushSubs/{uid}. Must run from a click. */
export async function enablePush(uid: string) {
  if ((await Notification.requestPermission()) !== "granted") throw new Error("Notifications are blocked in this browser.");
  const reg = await navigator.serviceWorker.register("/sw.js");
  const { key } = (await (await fetch("/api/push/key")).json()) as { key?: string };
  if (!key) throw new Error("Browser alerts aren't set up on the server yet. Pick Email for now.");
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }));
  await setDoc(doc(db(), "pushSubs", uid), { subscription: sub.toJSON() });
}
