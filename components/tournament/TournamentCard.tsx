import Link from "next/link";
import { getGame } from "@/games";
import { tournamentStatusLabels, type Tournament } from "@/lib/tournaments";
import { Icon } from "@/components/ui/Icon";
import { AvatarStack } from "@/components/home/AvatarStack";

export function TournamentCard({ id, tournament: t }: { id: string; tournament: Tournament }) {
  const entrants = Object.values(t.entrants);
  const format = getGame(t.game).formats.find((f) => f.id === t.format)?.name ?? t.format;
  const champion = t.winnerUid ? t.entrants[t.winnerUid]?.name : null;
  return (
    <Link href={`/tournaments/${id}`} className="group flex flex-col gap-2 rounded-lg border border-line bg-panel p-3 hover:border-accent">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-semibold text-accent">
          <Icon name="trophy" size={12} /> {t.prize}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${t.status === "running" ? "bg-live" : "bg-black/55"}`}>
          {tournamentStatusLabels[t.status]}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium text-fg group-hover:text-accent">{t.name}</div>
        <div className="truncate text-xs text-muted">{getGame(t.game).name} · {format}</div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <AvatarStack people={entrants} />
        {champion ? <span className="text-fg">{champion} won</span> : <span>{entrants.length}/{t.size} players</span>}
      </div>
    </Link>
  );
}
