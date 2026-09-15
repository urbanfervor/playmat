/** Parses pasted decklists (Arena, MTGO, Moxfield, Archidekt, TappedOut exports). */

export interface ParsedDecklist {
  /** Main deck cards, commanders included; sideboard and maybeboard excluded. */
  count: number;
  /** Names flagged as commanders by a section header, an [Commander] tag or a *CMDR* marker. */
  commanders: string[];
}

const line = /^(\d+)x?\s+(.+?)\s*$/;
const side = /^(sideboard|maybeboard|considering)/i;

export function parseDecklist(text: string): ParsedDecklist {
  let section = "";
  let count = 0;
  const commanders: string[] = [];
  for (const raw of text.split("\n")) {
    const l = raw.trim();
    if (!l || l.startsWith("//") || l.startsWith("#")) continue;
    const m = line.exec(l);
    if (!m) {
      section = l.replace(/[:\s]+$/, "");
      continue;
    }
    if (side.test(section)) continue;
    const n = Number(m[1]);
    const tagged = /\[commander|\*cmdr\*/i.test(m[2]);
    // Strip set codes, collector numbers, foil markers and category tags.
    const name = m[2]
      .replace(/\s*\[.*?\]/g, "")
      .replace(/\s*\*\w+\*/g, "")
      .replace(/\s*\([A-Za-z0-9]{2,6}\)(\s+[A-Za-z0-9-★]+)?$/, "")
      .trim();
    count += n;
    if (tagged || /^commander/i.test(section)) commanders.push(name);
  }
  return { count, commanders };
}
