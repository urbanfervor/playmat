// Fixed-window rate limit, in memory per server instance. A guardrail against
// runaway API spend and spam (vision calls, LiveKit minutes, alerts, Scryfall
// proxying), not auth. Signed-in routes key on the uid as well as the address.
const windows = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const w = windows.get(key);
  if (!w || w.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    if (windows.size > 10_000) for (const [k, v] of windows) if (v.resetAt <= now) windows.delete(k);
    return true;
  }
  w.count++;
  return w.count <= limit;
}

/** Google's front end appends the connecting address, so the last entry is the only one a client cannot forge. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown";
}
