import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { adminDb, verifyUser } from "@/lib/serverAuth";

// The room link is the credential: anyone signed in holding a room id may watch
// its video. Only players seated in Firestore may publish, and banned users get nothing.
export async function POST(req: Request) {
  if (!rateLimit(`token:${clientIp(req)}`, 20, 60_000)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  const user = await verifyUser(req);
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const { roomId, name } = (await req.json().catch(() => ({}))) as { roomId?: unknown; name?: unknown };
  if (typeof roomId !== "string" || !/^[a-z0-9]{1,32}$/.test(roomId)) return NextResponse.json({ error: "roomId required" }, { status: 400 });

  const roomRef = adminDb().collection("rooms").doc(roomId);
  const [room, player] = await Promise.all([roomRef.get(), roomRef.collection("players").doc(user.uid).get()]);
  if (!room.exists) return NextResponse.json({ error: "no such room" }, { status: 404 });
  if (((room.get("banned") as string[] | undefined) ?? []).includes(user.uid)) return NextResponse.json({ error: "removed from this table" }, { status: 403 });

  const seated = player.exists;
  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: user.uid,
    name: seated ? (player.get("name") as string) : typeof name === "string" ? name.slice(0, 60) : "Viewer",
    metadata: JSON.stringify({ photoURL: (seated ? player.get("photoURL") : user.picture) ?? null }),
    ttl: "6h",
  });
  token.addGrant({ room: roomId, roomJoin: true, canPublish: seated, canSubscribe: true });
  return NextResponse.json({ token: await token.toJwt() });
}
