import webpush, { type PushSubscription } from "web-push";
import { adminAuth, adminDb } from "./firebaseAdmin";
import type { NotifyMethod } from "@/lib/wants";

export interface Alert {
  title: string;
  body: string;
  url: string;
}

async function sendPush(uid: string, alert: Alert) {
  const snap = await adminDb().doc(`pushSubs/${uid}`).get();
  const subscription = snap.get("subscription") as PushSubscription | undefined;
  if (!subscription) return;
  webpush.setVapidDetails(process.env.SITE_URL!, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  await webpush.sendNotification(subscription, JSON.stringify(alert));
}

async function sendEmailTo(email: string, alert: Alert) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: email, subject: alert.title, text: `${alert.body}\n\nJoin: ${alert.url}` }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
}

/** Sends through Resend to the address on the user's Google account. */
async function sendEmail(uid: string, alert: Alert) {
  const { email } = await adminAuth().getUser(uid);
  if (email) await sendEmailTo(email, alert);
}

/** Site activity for the admin inbox (ADMIN_EMAIL). Never fails the request that triggered it. */
export const alertAdmin = (alert: Alert) => sendEmailTo(process.env.ADMIN_EMAIL!, alert).catch((err) => console.error("admin alert failed", err));

export const sendAlert = (uid: string, method: NotifyMethod, alert: Alert) => (method === "email" ? sendEmail(uid, alert) : sendPush(uid, alert));
