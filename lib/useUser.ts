"use client";
import { useEffect, useState } from "react";
import { watchUser } from "./firebase";

/** The bits of the Firebase user the UI needs. Stable across token refreshes. */
export interface AppUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export function useUser(): AppUser | null {
  const [user, setUser] = useState<AppUser | null>(null);
  useEffect(
    () =>
      watchUser((u) => {
        const next: AppUser = { uid: u.uid, isAnonymous: u.isAnonymous, displayName: u.displayName, email: u.email, photoURL: u.photoURL };
        setUser((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      }),
    [],
  );
  return user;
}
