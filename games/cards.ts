import type { CardProvider } from "./types";
import { mtgCards } from "./mtg/cards";
import { swuCards } from "./swu/cards";

export const cardProviders: Record<string, CardProvider> = { mtg: mtgCards, swu: swuCards };
