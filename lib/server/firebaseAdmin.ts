import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Uses the Cloud Run service account (application default credentials) in production.
const app = () => getApps()[0] ?? initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });

export const adminDb = () => getFirestore(app(), "playmat");
export const adminAuth = () => getAuth(app());

/** A single path segment, so request input cannot address another document. */
export const isDocId = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(id);
