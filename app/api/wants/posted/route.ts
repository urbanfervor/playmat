import { NextResponse } from "next/server";
import { getGame } from "@/games";
import { adminDb, isDocId } from "@/lib/server/firebaseAdmin";
import { verifyCaller } from "@/lib/server/auth";
import { alertAdmin } from "@/lib/server/alert";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { formatWindow, type Want } from "@/lib/wants";

/** The poster of a new registration calls this so the admin hears about it. */
export async function POST(req: Request) {
  const caller = await verifyCaller(req);
  if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!rateLimit(`posted:${caller.uid}`, 10, 60 * 60_000) || !rateLimit(`posted:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const { wantId } = (await req.json()) as { wantId: string };
  if (!isDocId(wantId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const want = (await adminDb().doc(`wants/${wantId}`).get()).data() as Want | undefined;
  if (!want || want.uid !== caller.uid) return NextResponse.json({ error: "not your registration" }, { status: 403 });

  const game = getGame(want.game);
  const format = game.formats.find((f) => f.id === want.format)?.name ?? want.format;
  await alertAdmin({
    title: `Want to play: ${want.name} · ${format}`,
    body: `${game.name} · ${format} · ${formatWindow(want)} UTC · alerts by ${want.notify.join(" + ")}`,
    url: `${process.env.SITE_URL}/play`,
  });
  return NextResponse.json({ ok: true });
}
