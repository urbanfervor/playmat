import { GoogleAuthProvider, linkWithPopup, signInWithCredential, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "./firebase";
import { peekUid, sitDown, standUp } from "./handoff";

/**
 * Upgrades the current anonymous account to Google, keeping the same uid so
 * wins and hearts carry over. If that Google account already has its own uid,
 * signs into it instead, moving any seats and hosting across first (wins and
 * hearts stay on the anonymous record).
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const current = auth().currentUser;
  if (current?.isAnonymous) {
    try {
      await linkWithPopup(current, provider);
      return;
    } catch (err) {
      if (!(err instanceof FirebaseError) || err.code !== "auth/credential-already-in-use") throw err;
      const credential = GoogleAuthProvider.credentialFromError(err);
      if (!credential) throw err;
      const googleUid = await peekUid(credential);
      const seats = await standUp(current.uid, googleUid);
      await signInWithCredential(auth(), credential);
      await sitDown(googleUid, seats);
      return;
    }
  }
  const { signInWithPopup } = await import("firebase/auth");
  await signInWithPopup(auth(), provider);
}

/** Signing out drops back to a fresh anonymous account via watchUser. */
export const signOutAccount = () => signOut(auth());
