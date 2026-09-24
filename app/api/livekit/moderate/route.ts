import { NextResponse } from "next/server";
import { ServerError } from "livekit-server-sdk";
import { adminDb, isDocId } from "@/lib/server/firebaseAdmin";
import { verifyCaller } from "@/lib/server/auth";
import { publishPermission, roomService } from "@/lib/server/livekit";
import { rateLimit } from "@/lib/rateLimit";
import type { Room } from "@/lib/rooms";

/**
 * The host calls this after muting, turning off the camera of, or removing a
 * player, so LiveKit enforces it rather than only the player's own client.
 */
export async function POST(req: Request) {
  const caller = await verifyCaller(req);
  if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!rateLimit(`moderate:${caller.uid}`, 60, 60_000)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  const { roomId, uid } = (await req.json()) as { roomId: string; uid: string };
  if (!isDocId(roomId) || !isDocId(uid)) return NextResponse.json({ error: "roomId and uid required" }, { status: 400 });

  const db = adminDb();
  const [roomSnap, seat] = await Promise.all([db.doc(`rooms/${roomId}`).get(), db.doc(`rooms/${roomId}/players/${uid}`).get()]);
  const room = roomSnap.data() as Room | undefined;
  if (!room || room.hostUid !== caller.uid) return NextResponse.json({ error: "not your table" }, { status: 403 });

  try {
    await roomService().updateParticipant(roomId, uid, { permission: { canSubscribe: true, canPublishData: true, ...publishPermission(room, uid, seat.exists) } });
  } catch (err) {
    // Not connected to the video right now; their next token carries the same limits.
    if (!(err instanceof ServerError && err.status === 404)) throw err;
  }
  return NextResponse.json({ ok: true });
}
