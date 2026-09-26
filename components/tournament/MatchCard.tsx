"use client";
import Link from "next/link";
import type { Match } from "@/lib/bracket";
import type { Tournament } from "@/lib/tournaments";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

interface Props {
  match: Match;
  tournament: Tournament;
  /** Admins pick the winner by clicking a player. */
  onWin?: (uid: string) => void;
}

export function MatchCard({ match: m, tournament: t, onWin }: Props) {
  const bye = m.round === 0 && m.players.filter(Boolean).length === 1;
  const decided = !!m.winnerUid;
  const live = !!m.roomId && !decided;
  const pickable = !!onWin && !decided && !!m.players[0] && !!m.players[1];
  return (
    <div className={`flex flex-col rounded-lg border bg-panel ${live ? "border-live/60" : "border-line"}`}>
      {m.players.map((uid, i) => {
        const p = uid ? t.entrants[uid] : null;
        const won = !!uid && uid === m.winnerUid;
        const lost = decided && !won;
        const row = (
          <>
            {p ? <Avatar name={p.name} photoURL={p.photoURL} size={22} /> : <span className="h-[22px] w-[22px] rounded-full border border-dashed border-line" />}
            <span className={`min-w-0 flex-1 truncate ${lost ? "text-muted line-through" : "text-fg"}`}>{p?.name ?? (bye ? "Bye" : "TBD")}</span>
            {won && <Icon name="check" size={14} className="text-accent" />}
          </>
        );
        const cls = `flex items-center gap-2 px-2.5 py-1.5 text-sm ${i ? "border-t border-line" : ""}`;
        return pickable ? (
          <button key={i} type="button" title={`${p!.name} won`} className={`${cls} text-left hover:bg-panel-2`} onClick={() => onWin!(uid!)}>{row}</button>
        ) : (
          <div key={i} className={cls}>{row}</div>
        );
      })}
      {live && (
        <Link href={`/room/${m.roomId}`} className="flex items-center gap-1.5 border-t border-line px-2.5 py-1 text-xs font-medium text-live hover:bg-panel-2">
          <span className="h-1.5 w-1.5 rounded-full bg-live" /> Live · watch
        </Link>
      )}
    </div>
  );
}
