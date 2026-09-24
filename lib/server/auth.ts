import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "./firebaseAdmin";

/** The Firebase user behind the request's Bearer ID token, or null. */
export async function verifyCaller(req: Request): Promise<DecodedIdToken | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  return adminAuth().verifyIdToken(token).catch(() => null);
}

export const isGuest = (caller: DecodedIdToken) => caller.firebase.sign_in_provider === "anonymous";
