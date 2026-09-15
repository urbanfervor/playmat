"use client";
import { useGameHistory, type PastGame } from "@/lib/history";
import { getGame } from "@/games";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/friends/FollowButton";

/** Recent games with everyone you sat with, so you can follow them. */
export function GameHistory({ uid }: { uid: string }) {
  const games = useGameHistory(uid);
  if (!games) return null;
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Recent games</h2>
      {games.length === 0 ? (
        <p className="text-xs text-muted">Games show up here once they start with you at the table.</p>
      ) : (
        games.map((g) => <GameRow key={g.roomId} uid={uid} game={g} />)
      )}
    </section>
  );
}

function GameRow({ uid, game }: { uid: string; game: PastGame }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm text-fg">{game.name}</span>
        <span className="shrink-0 text-xs text-muted">
          {getGame(game.game).name}
          {game.at && ` · ${game.at.toDate().toLocaleDateString()}`}
        </span>
      </div>
      {game.players.length === 0 ? (
        <span className="text-xs text-muted">Played alone</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {game.players.map((p) => (
            <span key={p.uid} className="flex items-center gap-1.5 rounded-md bg-panel-2 py-0.5 pl-1 pr-0.5 text-xs text-fg">
              <Avatar name={p.name} photoURL={p.photoURL} size={20} />
              {p.name}
              <FollowButton uid={uid} player={p} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
