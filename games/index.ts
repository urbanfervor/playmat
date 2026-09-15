import type { GameDefinition } from "./types";
import { mtg } from "./mtg";
import { swu } from "./swu";

export const games: Record<string, GameDefinition> = { mtg, swu };

export function getGame(id: string): GameDefinition {
  const game = games[id];
  if (!game) throw new Error(`unknown game ${id}`);
  return game;
}
