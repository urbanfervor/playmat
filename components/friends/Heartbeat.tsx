"use client";
import { useHeartbeat } from "@/lib/presence";
import { useUser } from "@/lib/useUser";

/** Publishes "I'm online" for the signed-in user. Rendered once in the root layout. */
export function Heartbeat() {
  const user = useUser();
  useHeartbeat(user?.uid);
  return null;
}
