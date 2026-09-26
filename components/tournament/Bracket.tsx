"use client";
import { matchKey, roundName, roundsFor, type Match } from "@/lib/bracket";
import type { Tournament } from "@/lib/tournaments";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { MatchCard } from "./MatchCard";

interface Props {
  tournament: Tournament;
  /** Admin only: records a match result. */
  onWin?: (match: Match, uid: string) => void;
}

/** One column per round, matches spaced so each sits between the two that feed it, then the champion. */
export function Bracket({ tournament: t, onWin }: Props) {
  const rounds = roundsFor(t.matches);
  const champion = t.winnerUid ? t.entrants[t.winnerUid] : null;
  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {Array.from({ length: rounds }, (_, r) => (
        <div key={r} className="flex w-52 shrink-0 flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{roundName(r, rounds)}</h3>
          <div className="flex flex-1 flex-col justify-around gap-3">
            {t.matches.filter((m) => m.round === r).map((m) => (
              <MatchCard key={matchKey(m)} match={m} tournament={t} onWin={onWin && ((uid) => onWin(m, uid))} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex w-52 shrink-0 flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Champion</h3>
        <div className="flex flex-1 flex-col justify-around">
          <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${champion ? "border-accent bg-accent/10 text-fg" : "border-dashed border-line text-muted"}`}>
            <Icon name="trophy" size={16} className="text-accent" />
            {champion ? <><Avatar name={champion.name} photoURL={champion.photoURL} size={22} /><span className="truncate font-medium">{champion.name}</span></> : "TBD"}
          </div>
        </div>
      </div>
    </div>
  );
}
