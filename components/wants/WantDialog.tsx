"use client";
import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { games } from "@/games";
import { signInWithGoogle } from "@/lib/account";
import { auth } from "@/lib/firebase";
import { canPush, enablePush } from "@/lib/push";
import { createWant, type NotifyMethod } from "@/lib/wants";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const HOURS = [1, 2, 3, 4, 6];
const KEY = "playmat:want";

/** Now, rounded down to the quarter hour, as a datetime-local value in the viewer's time zone. */
function nowInput() {
  const d = new Date();
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15 - d.getTimezoneOffset(), 0, 0);
  return d.toISOString().slice(0, 16);
}

/** Pick game, format and window, pick how to be told, post. Signs in with Google inline when email is chosen. Remembers the last choices. */
export function WantDialog({ onClose }: { onClose: () => void }) {
  const user = useUser();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState(Object.keys(games)[0]);
  const [formatId, setFormatId] = useState(games[gameId].formats[0].id);
  const [startsAt, setStartsAt] = useState(nowInput);
  const [hours, setHours] = useState(2);
  const [notify, setNotify] = useState<NotifyMethod[]>(canPush() ? ["push"] : ["email"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const firstName = user?.displayName?.split(" ")[0];

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (!saved) return;
      const g = games[saved.gameId];
      if (!g) return;
      setName(saved.name ?? "");
      setGameId(g.id);
      setFormatId(g.formats.some((f) => f.id === saved.formatId) ? saved.formatId : g.formats[0].id);
      if (HOURS.includes(saved.hours)) setHours(saved.hours);
      const methods = (saved.notify ?? []).filter((m: NotifyMethod) => m === "email" || (m === "push" && canPush()));
      if (methods.length) setNotify(methods);
    } catch {}
  }, []);

  useEffect(() => {
    if (firstName) setName(firstName);
  }, [firstName]);

  const needsAccount = notify.includes("email") && (!user || user.isAnonymous);

  const toggle = (method: NotifyMethod) => setNotify((on) => (on.includes(method) ? on.filter((m) => m !== method) : [...on, method]));

  async function post() {
    setBusy(true);
    setError("");
    try {
      localStorage.setItem(KEY, JSON.stringify({ name: name.trim(), gameId, formatId, hours, notify }));
      if (needsAccount) await signInWithGoogle();
      const me = auth().currentUser!;
      if (notify.includes("push")) await enablePush(me.uid);
      const start = new Date(startsAt);
      await createWant({
        uid: me.uid,
        name: name.trim(),
        photoURL: me.photoURL,
        game: gameId,
        format: formatId,
        startsAt: Timestamp.fromDate(start),
        endsAt: Timestamp.fromMillis(start.getTime() + hours * 3_600_000),
        notify,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <Dialog onClose={onClose} className="max-w-sm p-4">
      <h2 className="text-base font-semibold">I want to play</h2>
      <Field label="Your name">
        <Input value={name} maxLength={30} placeholder="Alex" autoFocus onChange={(e) => setName(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
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
            {games[gameId].formats.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Field label="From">
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
        <Field label="For">
          <Select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}h</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Tell me by (pick one or both)">
        <div className="flex gap-2">
          <Button size="md" className="flex-1" active={notify.includes("push")} disabled={!canPush()} onClick={() => toggle("push")}>Browser</Button>
          <Button size="md" className="flex-1" active={notify.includes("email")} onClick={() => toggle("email")}>Email</Button>
        </div>
      </Field>
      {needsAccount && <p className="text-xs text-muted">We&apos;ll ask you to sign in with Google so we know where to email.</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button variant="primary" size="md" disabled={!name.trim() || !startsAt || notify.length === 0 || busy} onClick={post}>
        {needsAccount ? "Sign in with Google and post" : "Post"}
      </Button>
    </Dialog>
  );
}
