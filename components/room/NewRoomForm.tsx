"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { games } from "@/games";
import { createRoom } from "@/lib/rooms";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const KEY = "playmat:newTable";

export function NewRoomForm() {
  const router = useRouter();
  const user = useUser();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("mtg");
  const [formatId, setFormatId] = useState(games.mtg.formats[0].id);
  const [isPrivate, setPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const game = games[gameId];

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (!saved) return;
      const g = games[saved.gameId];
      if (!g) return;
      setName(saved.name ?? "");
      setGameId(g.id);
      setFormatId(g.formats.some((f) => f.id === saved.formatId) ? saved.formatId : g.formats[0].id);
      setPrivate(!!saved.isPrivate);
    } catch {}
  }, []);

  async function create() {
    if (!user) return;
    setBusy(true);
    localStorage.setItem(KEY, JSON.stringify({ name: name.trim(), gameId, formatId, isPrivate }));
    const id = await createRoom(user.uid, name.trim(), gameId, formatId, isPrivate);
    router.push(`/room/${id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">New table</h2>
        <Field label="Table name">
          <Input placeholder="Thursday Commander pod" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
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
              <option key={f.id} value={f.id}>{f.name} · {f.players.join("/")} players</option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" className="accent-accent" checked={isPrivate} onChange={(e) => setPrivate(e.target.checked)} />
          Private
          <span className="text-xs text-muted">· join by link only</span>
        </label>
        <Button variant="primary" size="md" disabled={!user || !name.trim() || busy} onClick={create}>
          Create table
        </Button>
      </section>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (joinCode.trim()) router.push(`/room/${joinCode.trim().toLowerCase()}`);
        }}
      >
        <Input className="font-mono tracking-wider" placeholder="Room code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
        <Button type="submit" size="md">Join</Button>
      </form>
    </div>
  );
}
