export interface CounterDef {
  id: string;
  name: string;
  /** Starting value. Formats may override via `startingCounters`. */
  start: number;
  /** Tracked once per opponent (e.g. commander damage) instead of once per player. */
  perOpponent?: boolean;
}

export interface FormatDef {
  id: string;
  name: string;
  players: number[];
  startingCounters?: Record<string, number>;
}

/** A status a board token can carry, with a one-line reminder of what it means. */
export interface KeywordDef {
  id: string;
  name: string;
  blurb: string;
}

/** A headline card of a player's deck, picked via card search filtered by `query`. */
export interface DeckSlotDef {
  id: string;
  name: string;
  /** Search prefix, e.g. "is:commander" or "type:leader". */
  query: string;
  /** Only offered in these formats; every format when missing. */
  formats?: string[];
  optional?: boolean;
}

export interface GameDefinition {
  id: string;
  name: string;
  formats: FormatDef[];
  counters: CounterDef[];
  /** What "having the turn" is called: "Turn" for MTG, "Initiative" for SWU. */
  turnLabel: string;
  /** Names for the two numbers on a stat token, e.g. Power / Toughness. */
  statLabels: [string, string];
  keywords: KeywordDef[];
  /** Movable board markers a player can hold, e.g. Initiative in SWU. One of each per player. */
  markers: KeywordDef[];
  /** Cards that headline a deck: commanders for MTG, leader and base for SWU. */
  deckSlots: DeckSlotDef[];
  /** Players may paste a full decklist. */
  deckList: boolean;
  /** A card database backs search, identify, and decks. */
  cards: boolean;
}

export interface CardSummary {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl: string;
  text?: string;
}

/** Server-side card lookup. Lives apart from GameDefinition so it never ships to the client. */
export interface CardProvider {
  search(query: string): Promise<CardSummary[]>;
}

export function startingCounters(game: GameDefinition, formatId: string): Record<string, number> {
  const format = game.formats.find((f) => f.id === formatId);
  const out: Record<string, number> = {};
  for (const c of game.counters) {
    if (c.perOpponent) continue;
    out[c.id] = format?.startingCounters?.[c.id] ?? c.start;
  }
  return out;
}
