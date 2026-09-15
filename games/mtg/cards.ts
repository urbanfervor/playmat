import type { CardProvider, CardSummary } from "../types";

interface ScryfallFace {
  name: string;
  oracle_text?: string;
  image_uris?: { normal: string };
}
interface ScryfallCard extends ScryfallFace {
  id: string;
  card_faces?: ScryfallFace[];
}

export const mtgCards: CardProvider = {
  async search(query): Promise<CardSummary[]> {
    const url = new URL("https://api.scryfall.com/cards/search");
    url.searchParams.set("q", query);
    url.searchParams.set("unique", "cards");
    url.searchParams.set("order", "name");
    const res = await fetch(url, {
      headers: { "User-Agent": "playmat.games/0.1", Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`scryfall ${res.status}`);
    const body = (await res.json()) as { data: ScryfallCard[] };
    return body.data.slice(0, 20).map((c) => {
      const face = c.card_faces?.[0];
      return {
        id: c.id,
        name: c.name,
        imageUrl: c.image_uris?.normal ?? face?.image_uris?.normal ?? "",
        text: c.oracle_text ?? c.card_faces?.map((f) => f.oracle_text).filter(Boolean).join("\n//\n"),
      };
    });
  },
};
