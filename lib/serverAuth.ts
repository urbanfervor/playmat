import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Credentials come from the environment (the Cloud Run runtime service account;
// `gcloud auth application-default login` locally).
const app = () => getApps()[0] ?? initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });

export const adminDb = () => getFirestore(app(), "playmat");

/** The Firebase user behind the request's `Authorization: Bearer <ID token>`, or null. */
export async function verifyUser(req: Request): Promise<DecodedIdToken | null> {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  return getAuth(app()).verifyIdToken(token).catch(() => null);
}
