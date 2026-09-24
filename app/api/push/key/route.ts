import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** The VAPID public key browsers need to subscribe to push. */
export function GET() {
  return NextResponse.json({ key: process.env.VAPID_PUBLIC_KEY });
}
