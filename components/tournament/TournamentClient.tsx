"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGame } from "@/games";
import { isAdmin } from "@/lib/admin";
import type { Match } from "@/lib/bracket";
import { deleteTournament, getContactEmail, setMatchWinner, startTournament, tournamentStatusLabels, watchTournament, type Tournament } from "@/lib/tournaments";
import { useUser } from "@/lib/useUser";
import { TopNav } from "@/components/nav/TopNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Bracket } from "./Bracket";
import { Entrants } from "./Entrants";

export function TournamentClient({ id }: { id: string }) {
  const router = useRouter();
  const user = useUser();
  const admin = isAdmin(user);
  const [t, setT] = useState<Tournament | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user) return watchTournament(id, setT);
  }, [id, user]);

  // The organizer needs the champion's email to send the prize.
  const winnerUid = t?.winnerUid ?? null;
  useEffect(() => {
    if (admin && winnerUid) getContactEmail(id, winnerUid).then(setEmail);
  }, [admin, id, winnerUid]);

  if (!user || t === undefined) return <Centered>Loading…</Centered>;
  if (t === null) return <Centered>Tournament not found.</Centered>;

  const game = getGame(t.game);
  const format = game.formats.find((f) => f.id === t.format)?.name ?? t.format;
  const entrants = Object.keys(t.entrants).length;
  const champion = t.winnerUid ? t.entrants[t.winnerUid] : null;

  async function start() {
    if (!confirm(`Start with ${entrants} players? Sign-ups close and the first tables open.`)) return;
    setBusy(true);
    await startTournament(id, t!);
    setBusy(false);
  }

  async function win(match: Match, uid: string) {
    if (!confirm(`${t!.entrants[uid].name} won this match?`)) return;
    await setMatchWinner(id, t!, match, uid);
  }

  async function remove() {
    if (!confirm(`Delete “${t!.name}”? Everyone loses their entry.`)) return;
    await deleteTournament(id);
    router.push("/");
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{t.name}</h1>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${t.status === "running" ? "bg-live" : "bg-black/55"}`}>
              {tournamentStatusLabels[t.status]}
            </span>
          </div>
          <p className="text-muted">{game.name} · {format} · single elimination</p>
          <p className="flex items-center gap-1.5 text-fg">
            <Icon name="trophy" size={16} className="text-accent" /> Winner takes <span className="font-semibold text-accent">{t.prize}</span>
          </p>
          {t.description && <p className="whitespace-pre-line text-sm text-fg/80">{t.description}</p>}
        </header>

        {champion && (
          <section className="flex items-center gap-3 rounded-lg border border-accent bg-accent/10 p-4">
            <Icon name="crown" size={24} className="text-accent" />
            <div className="flex flex-col">
              <span className="font-semibold text-fg">{champion.name} wins {t.prize}</span>
              {admin && <span className="text-xs text-muted">Send it to {email ?? "…"}</span>}
            </div>
          </section>
        )}

        {t.status === "open" ? <Entrants id={id} tournament={t} user={user} /> : <Bracket tournament={t} onWin={admin && t.status === "running" ? win : undefined} />}

        {admin && (
          <div className="flex gap-2 border-t border-line pt-4">
            {t.status === "open" && (
              <Button variant="primary" size="md" disabled={entrants < 2 || busy} onClick={start}>Start tournament</Button>
            )}
            <Button variant="ghost" size="md" className="text-danger" onClick={remove}><Icon name="trash" /> Delete</Button>
          </div>
        )}
      </main>
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center text-muted">{children}</div>;
}
