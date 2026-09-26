"use client";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/account";
import { enterTournament, withdrawFromTournament, type Tournament } from "@/lib/tournaments";
import type { AppUser } from "@/lib/useUser";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";

/** Who has signed up, and the viewer's own enter / withdraw controls while sign-ups are open. */
export function Entrants({ id, tournament: t, user }: { id: string; tournament: Tournament; user: AppUser }) {
  const [name, setName] = useState(user.displayName?.split(" ")[0] ?? "");
  const [busy, setBusy] = useState(false);
  const entrants = Object.entries(t.entrants);
  const entered = user.uid in t.entrants;
  const full = entrants.length >= t.size;

  async function enter(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await enterTournament(id, user.uid, { name: name.trim(), photoURL: user.photoURL }, user.email ?? "");
    setBusy(false);
  }

  async function withdraw() {
    setBusy(true);
    await withdrawFromTournament(id, user.uid);
    setBusy(false);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{entrants.length}/{t.size} players</h2>
      {entrants.map(([uid, p]) => (
        <div key={uid} className="flex items-center gap-2 text-sm">
          <Avatar name={p.name} photoURL={p.photoURL} size={24} />
          <span className={uid === user.uid ? "font-medium text-fg" : "text-fg"}>{p.name}</span>
        </div>
      ))}
      {entrants.length === 0 && <p className="text-sm text-muted">Nobody has signed up yet.</p>}
      {t.status !== "open" ? null : entered ? (
        <Button size="md" disabled={busy} onClick={withdraw}>Withdraw</Button>
      ) : user.isAnonymous ? (
        <Button variant="primary" size="md" onClick={() => signInWithGoogle().catch((err) => console.error("sign-in failed", err))}>
          <Icon name="user" /> Sign in with Google to enter
        </Button>
      ) : full ? (
        <p className="text-danger">The tournament is full.</p>
      ) : (
        <form className="flex gap-2" onSubmit={enter}>
          <Input placeholder="Your name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" variant="primary" size="md" disabled={!name.trim() || busy}>Enter</Button>
        </form>
      )}
    </section>
  );
}
