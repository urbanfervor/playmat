import type { CardProvider, CardSummary } from "../types";

interface SwuCard {
  Set: string;
  Number: string;
  Name: string;
  Subtitle?: string;
  FrontArt: string;
  FrontText?: string;
}

export const swuCards: CardProvider = {
  async search(query): Promise<CardSummary[]> {
    const url = new URL("https://api.swu-db.com/cards/search");
    url.searchParams.set("q", query);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`swu-db ${res.status}`);
    const body = (await res.json()) as { data?: SwuCard[] };
    // Reprints share a name; keep the first printing of each.
    const seen = new Set<string>();
    const out: CardSummary[] = [];
    for (const c of body.data ?? []) {
      const key = `${c.Name}|${c.Subtitle ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: `${c.Set}-${c.Number}`,
        name: c.Name,
        subtitle: c.Subtitle,
        imageUrl: c.FrontArt,
        text: c.FrontText,
      });
      if (out.length === 20) break;
    }
    return out;
  },
};
