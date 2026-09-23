import { NextResponse } from "next/server";
import { cardProviders } from "@/games/cards";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function GET(req: Request, { params }: { params: Promise<{ game: string }> }) {
  if (!rateLimit(`search:${clientIp(req)}`, 60, 60_000)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  const { game } = await params;
  if (!Object.hasOwn(cardProviders, game)) return NextResponse.json({ error: "unknown game" }, { status: 404 });
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ cards: [] });
  const cards = await cardProviders[game].search(q);
  return NextResponse.json({ cards });
}
