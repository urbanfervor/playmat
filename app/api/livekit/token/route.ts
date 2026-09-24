import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { adminDb, isDocId } from "@/lib/server/firebaseAdmin";
import { verifyCaller } from "@/lib/server/auth";
import { publishPermission } from "@/lib/server/livekit";
import { rateLimit } from "@/lib/rateLimit";
import type { Room } from "@/lib/rooms";

// The room link is the credential for watching: anyone signed in who holds a
// room id may join its video. Only players seated there may publish.
export async function POST(req: Request) {
  const caller = await verifyCaller(req);
  if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!rateLimit(`token:${caller.uid}`, 20, 60_000)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  const { roomId, name, photoURL } = (await req.json()) as { roomId: string; name: string; photoURL?: string | null };
  if (!isDocId(roomId)) return NextResponse.json({ error: "roomId required" }, { status: 400 });

  const db = adminDb();
  const [roomSnap, seat] = await Promise.all([db.doc(`rooms/${roomId}`).get(), db.doc(`rooms/${roomId}/players/${caller.uid}`).get()]);
  const room = roomSnap.data() as Room | undefined;
  if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: caller.uid,
    name: String(name ?? "").slice(0, 100),
    metadata: JSON.stringify({ photoURL: photoURL ?? null }),
    ttl: "6h",
  });
  token.addGrant({ room: roomId, roomJoin: true, canSubscribe: true, ...publishPermission(room, caller.uid, seat.exists) });
  return NextResponse.json({ token: await token.toJwt() });
}
