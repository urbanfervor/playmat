import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getGame } from "@/games";
import { adminDb, isDocId } from "@/lib/server/firebaseAdmin";
import { isGuest, verifyCaller } from "@/lib/server/auth";
import { alertAdmin, sendAlert, type Alert } from "@/lib/server/alert";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import type { Room } from "@/lib/rooms";
import type { Want } from "@/lib/wants";

/**
 * The host of a table that just opened calls this. With wantId, the table was
 * started from that registration and only its owner is alerted. Without it,
 * every public registration for the same game and format whose window is
 * open now is alerted. Each registration hears about a given table once.
 * The admin hears about every call. Guests may not send alerts, and each
 * account may announce a few tables an hour, so alerts cannot be used for spam.
 */
export async function POST(req: Request) {
  const caller = await verifyCaller(req);
  if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (isGuest(caller)) return NextResponse.json({ error: "sign in to send alerts" }, { status: 403 });
  if (!rateLimit(`wants:${caller.uid}`, 10, 60 * 60_000) || !rateLimit(`wants:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const { roomId, wantId } = (await req.json()) as { roomId: string; wantId?: string };
  if (!isDocId(roomId) || (wantId !== undefined && !isDocId(wantId))) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const db = adminDb();
  const room = (await db.doc(`rooms/${roomId}`).get()).data() as Room | undefined;
  if (!room || room.hostUid !== caller.uid) return NextResponse.json({ error: "not your table" }, { status: 403 });

  const game = getGame(room.game);
  const format = game.formats.find((f) => f.id === room.format)?.name ?? room.format;
  const url = `${process.env.SITE_URL}/room/${roomId}`;
  const now = Date.now();

  const wants = wantId
    ? [await db.doc(`wants/${wantId}`).get()]
    : room.private || room.status !== "lobby"
      ? []
      : (await db.collection("wants").where("endsAt", ">", new Date(now)).get()).docs;

  const alert: Alert = wantId
    ? { title: `${caller.name ?? "A player"} started a ${format} table for you`, body: room.name, url }
    : { title: `A ${game.name} ${format} table just opened`, body: room.name, url };

  const who = caller.name ?? room.seated?.[caller.uid] ?? "Someone";
  const forName = wantId && (wants[0].data() as Want | undefined)?.name;
  const kind = forName ? `for ${forName}'s registration` : room.status === "scheduled" ? "(scheduled)" : room.private ? "(private)" : "";
  await alertAdmin({ title: `Table: ${who} started ${room.name} ${kind}`.trim(), body: `${game.name} · ${format}`, url });

  const targets = wants.filter((d) => {
    const w = d.data() as (Want & { alerted?: string[] }) | undefined;
    if (!w || w.uid === caller.uid || w.alerted?.includes(roomId) || w.endsAt.toMillis() <= now) return false;
    return wantId ? true : w.game === room.game && w.format === room.format && w.startsAt.toMillis() <= now;
  });

  await Promise.all(
    targets.map(async (d) => {
      const w = d.data() as Want;
      await d.ref.update({ alerted: FieldValue.arrayUnion(roomId) });
      await Promise.all(w.notify.map((method) => sendAlert(w.uid, method, alert).catch((err) => console.error("want alert failed", d.id, method, err))));
    }),
  );
  return NextResponse.json({ alerted: targets.length });
}
