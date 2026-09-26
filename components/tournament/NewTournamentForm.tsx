"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { games } from "@/games";
import { createTournament } from "@/lib/tournaments";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/** Admin only: opens sign-ups for a single-elimination tournament. */
export function NewTournamentForm() {
  const router = useRouter();
  const user = useUser();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("mtg");
  const [formatId, setFormatId] = useState(games.mtg.formats[0].id);
  const [prize, setPrize] = useState("$100");
  const [size, setSize] = useState(8);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const game = games[gameId];

  async function create() {
    if (!user) return;
    setBusy(true);
    const id = await createTournament(user.uid, { name: name.trim(), description: description.trim(), game: gameId, format: formatId, prize: prize.trim(), size });
    router.push(`/tournaments/${id}`);
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">New tournament · admin</h2>
      <Field label="Name">
        <Input placeholder="Saturday Standard Showdown" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Game">
        <Select
          value={gameId}
          onChange={(e) => {
            setGameId(e.target.value);
            setFormatId(games[e.target.value].formats[0].id);
          }}
        >
          {Object.values(games).map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Format">
        <Select value={formatId} onChange={(e) => setFormatId(e.target.value)}>
          {game.formats.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prize">
          <Input value={prize} maxLength={30} onChange={(e) => setPrize(e.target.value)} />
        </Field>
        <Field label="Players">
          <Select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[4, 8, 16].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Details">
        <Input placeholder="Best of one, matches are played one after another" value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Button variant="primary" size="md" disabled={!user || !name.trim() || !prize.trim() || busy} onClick={create}>
        Open sign-ups
      </Button>
    </section>
  );
}
