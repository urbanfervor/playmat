import { getApps, initializeApp } from "firebase/app";
import { getAuth, onIdTokenChanged, signInAnonymously, type User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export function app() {
  return (
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  );
}

export const db = () => getFirestore(app(), "playmat");
export const auth = () => getAuth(app());

/** Headers that prove to our API routes who is calling. */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await auth().currentUser?.getIdToken();
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

/**
 * Streams the signed-in user, signing in anonymously whenever there is none.
 * Fires again when an anonymous account is linked to Google or the user signs out.
 */
export function watchUser(cb: (user: User) => void) {
  return onIdTokenChanged(auth(), (user) => {
    if (user) cb(user);
    else signInAnonymously(auth()).catch((err) => console.error("anonymous sign-in failed", err));
  });
}
