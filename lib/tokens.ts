import type { CardSummary, GameDefinition } from "@/games/types";
import { logEvent } from "./log";
import { updatePlayer, type BoardToken, type Player } from "./rooms";

const newId = () => Math.random().toString(36).slice(2, 8);

function save(roomId: string, player: Player, tokens: BoardToken[]) {
  return updatePlayer(roomId, player.uid, { tokens });
}

export function addStatToken(roomId: string, player: Player, x: number, y: number) {
  const token: BoardToken = { id: newId(), kind: "stat", x, y, values: [1, 1], statuses: [] };
  logEvent(roomId, `${player.name} added a token`);
  return save(roomId, player, [...(player.tokens ?? []), token]);
}

/** One counter token per counter: placing again just moves it. */
export function placeCounterToken(roomId: string, player: Player, game: GameDefinition, counterId: string, x: number, y: number) {
  const tokens = player.tokens ?? [];
  const existing = tokens.find((t) => t.kind === "counter" && t.counterId === counterId);
  if (existing) return save(roomId, player, tokens.map((t) => (t.id === existing.id ? { ...t, x, y } : t)));
  const name = game.counters.find((c) => c.id === counterId)?.name ?? counterId;
  logEvent(roomId, `${player.name} placed ${name} on the board`);
  return save(roomId, player, [...tokens, { id: newId(), kind: "counter", x, y, counterId }]);
}

/** One marker of each kind per player: placing again just moves it. */
export function placeMarkerToken(roomId: string, player: Player, game: GameDefinition, markerId: string, x: number, y: number) {
  const tokens = player.tokens ?? [];
  const existing = tokens.find((t) => t.kind === "marker" && t.markerId === markerId);
  if (existing) return save(roomId, player, tokens.map((t) => (t.id === existing.id ? { ...t, x, y } : t)));
  const name = game.markers.find((m) => m.id === markerId)?.name ?? markerId;
  logEvent(roomId, `${player.name} took ${name}`);
  return save(roomId, player, [...tokens, { id: newId(), kind: "marker", x, y, markerId }]);
}

/** A searched card laid on the board, e.g. a token creature or a card from a library. */
export function addCardToken(roomId: string, player: Player, card: Pick<CardSummary, "name" | "imageUrl">, x: number, y: number) {
  const token: BoardToken = { id: newId(), kind: "card", x, y, name: card.name, imageUrl: card.imageUrl };
  logEvent(roomId, `${player.name} put ${card.name} on the board`);
  return save(roomId, player, [...(player.tokens ?? []), token]);
}

export function updateToken(roomId: string, player: Player, id: string, patch: Partial<BoardToken>) {
  return save(roomId, player, (player.tokens ?? []).map((t) => (t.id === id ? ({ ...t, ...patch } as BoardToken) : t)));
}

export function removeToken(roomId: string, player: Player, game: GameDefinition, id: string) {
  const token = (player.tokens ?? []).find((t) => t.id === id);
  if (token?.kind === "stat") logEvent(roomId, `${player.name} removed a ${token.values.join("/")} token`);
  if (token?.kind === "card") logEvent(roomId, `${player.name} removed ${token.name} from the board`);
  if (token?.kind === "marker") logEvent(roomId, `${player.name} gave up ${game.markers.find((m) => m.id === token.markerId)?.name ?? token.markerId}`);
  return save(roomId, player, (player.tokens ?? []).filter((t) => t.id !== id));
}
