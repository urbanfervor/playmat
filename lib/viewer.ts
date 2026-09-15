import type { Player } from "./rooms";
import type { AppUser } from "./useUser";

/** Who the signed-in person is at this table: their seat, or a spectator identity from their account. */
export interface Viewer {
  uid: string;
  name: string;
  photoURL: string | null;
  spectator: boolean;
}

export function viewerFor(user: AppUser, me: Player | undefined): Viewer {
  if (me) return { uid: me.uid, name: me.name, photoURL: me.photoURL ?? null, spectator: false };
  return { uid: user.uid, name: user.displayName?.split(" ")[0] || "Viewer", photoURL: user.photoURL, spectator: true };
}
