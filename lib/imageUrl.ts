// Image URLs come from Firestore docs any player can write, so only render ones
// from the card databases and Google avatars: anything else could be a tracking
// pixel that logs every viewer's IP.
const allowed = (host: string) => host === "cards.scryfall.io" || host === "cdn.swu-db.com" || host.endsWith(".googleusercontent.com");

export function safeImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && allowed(u.hostname) ? url : undefined;
  } catch {
    return undefined;
  }
}
