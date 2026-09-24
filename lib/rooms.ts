import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { postAsUser } from "./api";
import { logEvent } from "./log";
import { getGame } from "@/games";
import { startingCounters, type CardSummary } from "@/games/types";

export interface Moderation {
  muted?: boolean;
  videoOff?: boolean;
}

export type GameStatus = "scheduled" | "lobby" | "playing" | "paused" | "over";

export const statusLabels: Record<GameStatus, string> = {
  scheduled: "Scheduled",
  lobby: "Lobby",
  playing: "Playing",
  paused: "Paused",
  over: "Over",
};

export interface Room {
  name: string;
  /** Optional blurb shown on the join page. Missing on older rooms. */
  description?: string;
  game: string;
  format: string;
  hostUid: string;
  /** Open seats at the table; the host can shrink it to the number actually playing. */
  seats: number;
  createdAt: Timestamp | null;
  /** Missing on rooms created before statuses existed; treat as lobby. */
  status: GameStatus;
  /** When a scheduled table is due to start. Players reserve seats beforehand; the host opens it. Missing on older rooms. */
  scheduledAt?: Timestamp | null;
  /** uid → name of everyone seated, mirrored from the players subcollection for the home feed. */
  seated: Record<string, string>;
  /** uid → avatar and headline card, mirrored for the home feed. Missing on older rooms. */
  roster?: Record<string, RosterEntry>;
  turn: { playerUid: string | null; startedAt: Timestamp | null };
  lastRoll: { by: string; sides: number; value: number } | null;
  /** Players the host removed; they cannot sit down again. */
  banned: string[];
  /** Host-imposed mic/camera state per player uid. The target's client enforces it. */
  moderation: Record<string, Moderation>;
  /** Set by the host when the game is over. Missing or null means no winner recorded. */
  winnerUid?: string | null;
  /** Hidden from the home feed; joinable by link only. Missing on older rooms. */
  private?: boolean;
}

/**
 * A marker placed on a player's video. Position is 0..1 in the raw camera
 * frame, so every viewer maps it through the same mirror/rotate as the video.
 */
export type BoardToken =
  | { id: string; kind: "stat"; x: number; y: number; values: [number, number]; statuses: string[] }
  | { id: string; kind: "counter"; x: number; y: number; counterId: string }
  | { id: string; kind: "marker"; x: number; y: number; markerId: string }
  | { id: string; kind: "card"; x: number; y: number; name: string; imageUrl: string };

export interface DeckCard extends Pick<CardSummary, "name" | "subtitle" | "imageUrl"> {
  /** Which DeckSlotDef this fills. */
  slot: string;
}

/** What a player brought to the table. */
export interface Deck {
  featured: DeckCard[];
  /** Raw decklist as pasted, when the game allows one. */
  list?: string;
}

/** What the home feed shows for a seat. */
export interface RosterEntry {
  photoURL: string | null;
  card: Pick<CardSummary, "name" | "imageUrl"> | null;
}

export interface Player {
  uid: string;
  name: string;
  /** Google photo when signed in. Missing on players who joined before avatars existed. */
  photoURL?: string | null;
  seat: number;
  joinedAt: Timestamp | null;
  counters: Record<string, number>;
  /** counterId → opponent uid → value, for counters marked perOpponent. */
  opponentCounters: Record<string, Record<string, number>>;
  revealedCard: Pick<CardSummary, "name" | "imageUrl"> | null;
  video: { mirror: boolean; rotate: 0 | 180 };
  /** Missing on players who joined before tokens existed. */
  tokens?: BoardToken[];
  /** Missing on players who joined before decks existed. */
  deck?: Deck | null;
}

export type RevealedCard = Player["revealedCard"];

export const roomRef = (id: string) => doc(db(), "rooms", id);
export const playerRef = (roomId: string, uid: string) => doc(db(), "rooms", roomId, "players", uid);

function newRoomId() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export async function createRoom(hostUid: string, name: string, game: string, format: string, isPrivate: boolean, scheduledAt: Date | null = null): Promise<string> {
  const id = newRoomId();
  const room: Room = {
    name,
    description: "",
    game,
    format,
    hostUid,
    seats: Math.max(...(getGame(game).formats.find((f) => f.id === format)?.players ?? [4])),
    createdAt: null,
    status: scheduledAt ? "scheduled" : "lobby",
    scheduledAt: scheduledAt && Timestamp.fromDate(scheduledAt),
    seated: {},
    roster: {},
    turn: { playerUid: null, startedAt: null },
    lastRoll: null,
    banned: [],
    moderation: {},
    private: isPrivate,
  };
  await setDoc(roomRef(id), { ...room, createdAt: serverTimestamp() });
  return id;
}

export async function joinRoom(roomId: string, uid: string, name: string, seat: number, photoURL: string | null) {
  const snap = await getDoc(roomRef(roomId));
  const room = snap.data() as Room;
  const player: Player = {
    uid,
    name,
    photoURL,
    seat,
    joinedAt: null,
    counters: startingCounters(getGame(room.game), room.format),
    opponentCounters: {},
    revealedCard: null,
    video: { mirror: false, rotate: 0 },
    tokens: [],
    deck: null,
  };
  await setDoc(playerRef(roomId, uid), { ...player, joinedAt: serverTimestamp() });
  const roster: RosterEntry = { photoURL, card: null };
  await updateDoc(roomRef(roomId), { [`seated.${uid}`]: name, [`roster.${uid}`]: roster });
  logEvent(roomId, `${name} sat down`);
}

export async function leaveRoom(roomId: string, player: Player) {
  logEvent(roomId, `${player.name} left`);
  await updateDoc(roomRef(roomId), { [`seated.${player.uid}`]: deleteField(), [`roster.${player.uid}`]: deleteField() });
  await deleteDoc(playerRef(roomId, player.uid));
}

/** Mirrors a player's headline card onto the room for the home feed. */
export const setRosterCard = (roomId: string, uid: string, card: RosterEntry["card"]) =>
  updateDoc(roomRef(roomId), { [`roster.${uid}.card`]: card });

export interface TableSettings {
  name: string;
  description: string;
  format: string;
  private: boolean;
}

/** Host only. A format change also resets the seat count to the format's maximum. */
export function updateTableSettings(roomId: string, room: Room, next: TableSettings) {
  const patch: Partial<Room> = { name: next.name, description: next.description, private: next.private };
  if (next.name !== room.name) logEvent(roomId, `Host renamed the table to “${next.name}”`);
  if (next.private !== (room.private ?? false)) logEvent(roomId, next.private ? "Host made the table private" : "Host made the table public");
  if (next.format !== room.format) {
    const format = getGame(room.game).formats.find((f) => f.id === next.format);
    patch.format = next.format;
    patch.seats = Math.max(...(format?.players ?? [4]));
    logEvent(roomId, `Host changed the format to ${format?.name ?? next.format}`);
  }
  return updateRoom(roomId, patch);
}

export function setSeats(roomId: string, seats: number) {
  logEvent(roomId, `Host set the table to ${seats} seats`);
  return updateRoom(roomId, { seats });
}

/** Tells the server to apply a player's moderation and ban state to their video connection. */
const enforceModeration = (roomId: string, uid: string) => postAsUser("/api/livekit/moderate", { roomId, uid });

export async function setModeration(roomId: string, room: Room, uid: string, patch: Moderation) {
  const moderation = room.moderation ?? {};
  await updateRoom(roomId, { moderation: { ...moderation, [uid]: { ...moderation[uid], ...patch } } });
  await enforceModeration(roomId, uid);
}

/** Host only: ban the player so they cannot rejoin, then remove their seat. */
export async function kickPlayer(roomId: string, room: Room, player: Player) {
  await updateDoc(roomRef(roomId), { banned: [...(room.banned ?? []), player.uid], [`seated.${player.uid}`]: deleteField(), [`roster.${player.uid}`]: deleteField() });
  await deleteDoc(playerRef(roomId, player.uid));
  await enforceModeration(roomId, player.uid);
  logEvent(roomId, `${player.name} was removed by the host`);
}

export const updatePlayer = (roomId: string, uid: string, patch: Partial<Player>) =>
  updateDoc(playerRef(roomId, uid), patch);

export const updateRoom = (roomId: string, patch: Partial<Room>) => updateDoc(roomRef(roomId), patch);

export function watchRoom(id: string, cb: (room: Room | null) => void) {
  return onSnapshot(roomRef(id), (snap) => cb(snap.exists() ? (snap.data() as Room) : null));
}

/** Streams the newest public rooms that have someone seated. */
export function watchLiveRooms(cb: (rooms: { id: string; room: Room }[]) => void) {
  const q = query(collection(db(), "rooms"), where("private", "==", false), orderBy("createdAt", "desc"), limit(30));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs.map((d) => ({ id: d.id, room: d.data({ serverTimestamps: "estimate" }) as Room }));
    cb(rooms.filter((r) => r.room.status !== "scheduled" && Object.keys(r.room.seated ?? {}).length > 0));
  });
}

/** How long a scheduled table stays listed after its start time, so a late host can still open it. */
const GRACE_MS = 60 * 60_000;

/** Streams public scheduled tables, soonest first. */
export function watchUpcomingRooms(cb: (rooms: { id: string; room: Room }[]) => void) {
  const since = Timestamp.fromMillis(Date.now() - GRACE_MS);
  const q = query(collection(db(), "rooms"), where("private", "==", false), where("scheduledAt", ">", since), orderBy("scheduledAt"), limit(30));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs.map((d) => ({ id: d.id, room: d.data() as Room }));
    cb(rooms.filter((r) => r.room.status === "scheduled"));
  });
}

/** Turns a scheduled table into a live lobby so reserved players can sit down. Host, or any reserved player once it is due. */
export function openTable(roomId: string, opener: Player | undefined) {
  if (opener) logEvent(roomId, `${opener.name} opened the table`);
  return updateRoom(roomId, { status: "lobby" });
}

export function watchPlayers(roomId: string, cb: (players: Player[]) => void) {
  return onSnapshot(collection(db(), "rooms", roomId, "players"), (snap) => {
    const players = snap.docs.map((d) => d.data() as Player);
    players.sort((a, b) => a.seat - b.seat);
    cb(players);
  });
}

export function startGame(roomId: string, players: Player[]) {
  logEvent(roomId, `Game started · ${players[0].name}'s turn`);
  return updateRoom(roomId, { status: "playing", turn: { playerUid: players[0].uid, startedAt: serverTimestamp() as unknown as Timestamp } });
}

const statusEvents: Record<GameStatus, string> = {
  scheduled: "Table scheduled",
  lobby: "Back to lobby",
  playing: "Game resumed",
  paused: "Game paused",
  over: "Game over",
};

export function setStatus(roomId: string, status: GameStatus) {
  logEvent(roomId, statusEvents[status]);
  return updateRoom(roomId, { status });
}

function elapsed(since: Timestamp | null) {
  if (!since) return "";
  const s = Math.round((Date.now() - since.toMillis()) / 1000);
  return ` (${Math.floor(s / 60)}m ${s % 60}s)`;
}

export function passTurn(roomId: string, room: Room, players: Player[]) {
  const i = players.findIndex((p) => p.uid === room.turn.playerUid);
  const next = players[(i + 1) % players.length];
  logEvent(roomId, `${players[i]?.name ?? "?"} passed${elapsed(room.turn.startedAt)} · ${next.name}'s turn`);
  return updateRoom(roomId, { turn: { playerUid: next.uid, startedAt: serverTimestamp() as unknown as Timestamp } });
}

export function rollDie(roomId: string, by: string, sides: number) {
  const value = 1 + Math.floor(Math.random() * sides);
  logEvent(roomId, `${by} rolled d${sides}: ${value}`);
  return updateRoom(roomId, { lastRoll: { by, sides, value } });
}
