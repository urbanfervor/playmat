import { deleteApp, initializeApp } from "firebase/app";
import { getAuth, signInWithCredential, signOut, type AuthCredential } from "firebase/auth";
import { collection, deleteDoc, deleteField, FieldPath, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { app, db } from "./firebase";
import { playerRef, roomRef, type Player, type Room, type RosterEntry } from "./rooms";

/**
 * When an anonymous player signs into a Google account that already has its
 * own uid, their seats and hosting move to that uid in two steps around the
 * account switch: standUp runs as the anonymous user (who may edit the room),
 * sitDown as the Google user (who may create their own player docs).
 */

export interface Seat {
  roomId: string;
  player: Player;
}

/** Signs the credential into a throwaway app to learn its uid without touching the current session. */
export async function peekUid(credential: AuthCredential): Promise<string> {
  const scratch = initializeApp(app().options, "peek");
  try {
    const scratchAuth = getAuth(scratch);
    const { user } = await signInWithCredential(scratchAuth, credential);
    await signOut(scratchAuth);
    return user.uid;
  } finally {
    await deleteApp(scratch);
  }
}

/** As `from`: hand hosting and the current turn to `to`, then leave every table `from` is seated at. */
export async function standUp(from: string, to: string): Promise<Seat[]> {
  const rooms = await getDocs(query(collection(db(), "rooms"), orderBy(new FieldPath("seated", from))));
  const seats: Seat[] = [];
  for (const snap of rooms.docs) {
    const room = snap.data() as Room;
    const player = (await getDoc(playerRef(snap.id, from))).data() as Player | undefined;
    if (!player) continue;
    const patch: Record<string, unknown> = { [`seated.${from}`]: deleteField(), [`roster.${from}`]: deleteField() };
    if (room.hostUid === from) patch.hostUid = to;
    if (room.turn.playerUid === from) patch["turn.playerUid"] = to;
    await updateDoc(roomRef(snap.id), patch);
    await deleteDoc(playerRef(snap.id, from));
    seats.push({ roomId: snap.id, player });
  }
  return seats;
}

/** As `to`: retake the seats standUp gave up. */
export async function sitDown(to: string, seats: Seat[]) {
  for (const { roomId, player } of seats) {
    await setDoc(playerRef(roomId, to), { ...player, uid: to });
    const roster: RosterEntry = { photoURL: player.photoURL ?? null, card: player.deck?.featured[0] ?? null };
    await updateDoc(roomRef(roomId), { [`seated.${to}`]: player.name, [`roster.${to}`]: roster });
  }
}
