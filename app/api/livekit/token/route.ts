import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// The room link is the credential: anyone holding a room id may join its video.
export async function POST(req: Request) {
  if (!rateLimit(`token:${clientIp(req)}`, 20, 60_000)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  const { roomId, uid, name, photoURL, spectator } = (await req.json()) as {
    roomId: string;
    uid: string;
    name: string;
    photoURL?: string | null;
    spectator?: boolean;
  };
  if (!roomId || !uid) return NextResponse.json({ error: "roomId and uid required" }, { status: 400 });
  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: uid,
    name,
    metadata: JSON.stringify({ photoURL: photoURL ?? null }),
    ttl: "6h",
  });
  token.addGrant({ room: roomId, roomJoin: true, canPublish: !spectator, canSubscribe: true });
  return NextResponse.json({ token: await token.toJwt() });
}
