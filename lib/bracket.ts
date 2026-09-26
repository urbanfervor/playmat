/** One game in a single-elimination bracket. Round 0 is the first round; each match feeds match index >> 1 of the next round. */
export interface Match {
  round: number;
  index: number;
  /** Entrant uids, null until the feeding matches are decided. */
  players: [string | null, string | null];
  /** The table the match is played at; created once both players are known. */
  roomId: string | null;
  winnerUid: string | null;
}

export const matchKey = (m: Pick<Match, "round" | "index">) => `${m.round}-${m.index}`;

export const roundsFor = (matches: Match[]) => (matches.length ? matches[matches.length - 1].round + 1 : 0);

/** "Final", "Semifinal", "Quarterfinal", else "Round N". */
export function roundName(round: number, rounds: number) {
  const left = rounds - round;
  if (left === 1) return "Final";
  if (left === 2) return "Semifinal";
  if (left === 3) return "Quarterfinal";
  return `Round ${round + 1}`;
}

/**
 * Seeds entrants (already shuffled) into a bracket sized to the next power of two.
 * Every first-round match gets one player before any gets a second, so the byes
 * spread out; a lone player advances at once.
 */
export function buildBracket(uids: string[]): Match[] {
  const size = 2 ** Math.ceil(Math.log2(Math.max(uids.length, 2)));
  const rounds = Math.log2(size);
  const matches: Match[] = [];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < size >> (r + 1); i++) matches.push({ round: r, index: i, players: [null, null], roomId: null, winnerUid: null });
  }
  const first = size / 2;
  uids.forEach((uid, i) => {
    matches[i % first].players[i < first ? 0 : 1] = uid;
  });
  for (const m of matches.slice(0, first)) {
    const [a, b] = m.players;
    if (a && !b) advance(matches, m, a);
    if (b && !a) advance(matches, m, b);
  }
  return matches;
}

/** Records the winner and seats them in the next round. Mutates `matches`. */
export function advance(matches: Match[], m: Match, winnerUid: string) {
  m.winnerUid = winnerUid;
  const next = matches.find((x) => x.round === m.round + 1 && x.index === m.index >> 1);
  if (next) next.players[m.index & 1] = winnerUid;
}

/** Matches with both players known that have neither a table nor a result yet. */
export const readyMatches = (matches: Match[]) => matches.filter((m) => m.players[0] && m.players[1] && !m.roomId && !m.winnerUid);
