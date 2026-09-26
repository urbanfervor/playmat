import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { createRoom } from "./rooms";
import { advance, buildBracket, readyMatches, roundName, roundsFor, type Match } from "./bracket";

export type TournamentStatus = "open" | "running" | "over";

export const tournamentStatusLabels: Record<TournamentStatus, string> = { open: "Sign-ups open", running: "In progress", over: "Finished" };

export interface Entrant {
  name: string;
  photoURL: string | null;
}

export interface Tournament {
  name: string;
  description: string;
  game: string;
  format: string;
  /** What the winner gets, e.g. "$100". */
  prize: string;
  /** Maximum entrants; the bracket is sized to who actually signed up. */
  size: number;
  /** The admin who runs it. */
  hostUid: string;
  createdAt: Timestamp | null;
  status: TournamentStatus;
  /** uid → entrant. Each player writes their own entry while sign-ups are open. */
  entrants: Record<string, Entrant>;
  /** Empty until the tournament starts. */
  matches: Match[];
  winnerUid: string | null;
}

export const tournamentRef = (id: string) => doc(db(), "tournaments", id);
const contactRef = (id: string, uid: string) => doc(db(), "tournaments", id, "contacts", uid);

export type NewTournament = Pick<Tournament, "name" | "description" | "game" | "format" | "prize" | "size">;

/** Admin only. */
export async function createTournament(hostUid: string, fields: NewTournament) {
  const t: Tournament = { ...fields, hostUid, createdAt: null, status: "open", entrants: {}, matches: [], winnerUid: null };
  const ref = await addDoc(collection(db(), "tournaments"), { ...t, createdAt: serverTimestamp() });
  return ref.id;
}

/** Signs the player up and stores their email privately so the organizer can send the prize. */
export async function enterTournament(id: string, uid: string, entrant: Entrant, email: string) {
  await updateDoc(tournamentRef(id), { [`entrants.${uid}`]: entrant });
  await setDoc(contactRef(id, uid), { email });
}

export async function withdrawFromTournament(id: string, uid: string) {
  await updateDoc(tournamentRef(id), { [`entrants.${uid}`]: deleteField() });
  await deleteDoc(contactRef(id, uid));
}

/** Admin only: the entrant's email, for paying out the prize. */
export const getContactEmail = (id: string, uid: string) => getDoc(contactRef(id, uid)).then((s) => (s.data()?.email as string | undefined) ?? null);

export function watchTournament(id: string, cb: (t: Tournament | null) => void) {
  return onSnapshot(tournamentRef(id), (snap) => cb(snap.exists() ? (snap.data() as Tournament) : null));
}

/** Streams the newest tournaments, running ones included. */
export function watchTournaments(cb: (rows: { id: string; tournament: Tournament }[]) => void) {
  const q = query(collection(db(), "tournaments"), orderBy("createdAt", "desc"), limit(12));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, tournament: d.data({ serverTimestamps: "estimate" }) as Tournament }))));
}

/** Opens a two-seat table for a match that only its two players may sit at. */
async function openMatchTable(id: string, t: Tournament, matches: Match[], m: Match) {
  const [a, b] = m.players.map((uid) => t.entrants[uid!].name);
  const name = `${a} vs ${b} · ${roundName(m.round, roundsFor(matches))}`.slice(0, 60);
  m.roomId = await createRoom(t.hostUid, name, t.game, t.format, false, null, {
    seats: 2,
    invited: m.players as string[],
    tournament: { id, match: `${m.round}-${m.index}` },
  });
}

/** Admin only: shuffles the entrants into a bracket and opens a table for every first-round match. */
export async function startTournament(id: string, t: Tournament) {
  const uids = Object.keys(t.entrants);
  for (let i = uids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uids[i], uids[j]] = [uids[j], uids[i]];
  }
  const matches = buildBracket(uids);
  await Promise.all(readyMatches(matches).map((m) => openMatchTable(id, t, matches, m)));
  await updateDoc(tournamentRef(id), { status: "running", matches });
}

/** Admin only: records who won a match, seats them in the next round, and opens that table once its opponent is known. */
export async function setMatchWinner(id: string, t: Tournament, match: Match, winnerUid: string) {
  const matches: Match[] = t.matches.map((m) => ({ ...m, players: [...m.players] }));
  const m = matches.find((x) => x.round === match.round && x.index === match.index)!;
  advance(matches, m, winnerUid);
  await Promise.all(readyMatches(matches).map((x) => openMatchTable(id, t, matches, x)));
  const final = matches[matches.length - 1];
  await updateDoc(tournamentRef(id), final.winnerUid ? { matches, status: "over", winnerUid: final.winnerUid } : { matches });
}

/** Admin only. Match tables stay behind; close them from the home feed if needed. */
export async function deleteTournament(id: string) {
  const contacts = await getDocs(collection(db(), "tournaments", id, "contacts"));
  await Promise.all(contacts.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(tournamentRef(id));
}
