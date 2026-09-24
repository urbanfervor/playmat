import type { GameDefinition } from "../types";

export const cyberpunk: GameDefinition = {
  id: "cyberpunk",
  name: "Cyberpunk TCG",
  formats: [{ id: "standard", name: "Standard", players: [2] }],
  counters: [
    { id: "health", name: "Health", start: 20 },
    { id: "eddies", name: "Eddies", start: 0 },
  ],
  turnLabel: "Turn",
  deckSlots: [],
  deckList: false,
  cards: false,
  statLabels: ["Attack", "Health"],
  markers: [],
  keywords: [],
};
