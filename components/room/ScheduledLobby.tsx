"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameDefinition } from "@/games/types";
import { joinRoom, leaveRoom, openTable, type Player, type Room } from "@/lib/rooms";
import { announceTable } from "@/lib/wants";
import { deleteRoom } from "@/lib/admin";
import { formatScheduled, googleCalendarUrl, untilScheduled } from "@/lib/schedule";
import { addWatcher, removeWatcher, type Watcher } from "@/lib/watchers";
import { TopNav } from "@/components/nav/TopNav";
import { Avatar } from "@/components/ui/Avatar";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";

interface Props {
  roomId: string;
  uid: string;
  game: GameDefinition;
  room: Room;
  players: Player[];
  watchers: Watcher[];
  me: Player | undefined;
  defaultName?: string;
  photoURL: string | null;
}

/** The waiting room for a scheduled table: reserve or give up a seat until the host opens it. */
export function ScheduledLobby({ roomId, uid, game, room, players, watchers, me, defaultName = "", photoURL }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const format = game.formats.find((f) => f.id === room.format);
  const seats = room.seats ?? 4;
  const full = players.length >= seats;
  const banned = (room.banned ?? []).includes(uid);
  const isHost = uid === room.hostUid;
  const watcher = watchers.find((w) => w.uid === uid);
  // The countdown and the open button depend on the clock, so re-evaluate every minute.
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const due = !!room.scheduledAt && room.scheduledAt.toMillis() <= now;

  async function reserve(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const taken = new Set(players.map((p) => p.seat));
    let seat = 0;
    while (taken.has(seat)) seat++;
    if (watcher) await removeWatcher(roomId, uid);
    await joinRoom(roomId, uid, name.trim(), seat, photoURL);
    setBusy(false);
  }

  async function watch() {
    setBusy(true);
    await addWatcher(roomId, uid, name.trim(), photoURL);
    setBusy(false);
  }

  /** The phone share sheet where there is one, otherwise copy the link. */
  async function share() {
    const url = window.location.href;
    const when = room.scheduledAt ? ` · ${formatScheduled(room.scheduledAt)}` : "";
    if (navigator.share) {
      await navigator.share({ title: room.name, text: `${room.name} on Playmat${when}`, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function cancel() {
    if (!confirm(`Cancel “${room.name}”? Everyone loses their reservation.`)) return;
    await deleteRoom(roomId);
    router.push("/");
  }

  return (
    <>
      <TopNav roomId={roomId} title={room.name} isPrivate={room.private} />
      <main className="mx-auto flex max-w-sm flex-col gap-5 px-5 py-12">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">{room.name}</h1>
          <p className="mt-1 text-muted">{game.name} · {format?.name}</p>
          {room.scheduledAt && (
            <p className="mt-2 text-fg">
              {formatScheduled(room.scheduledAt)} <span className="text-muted">· {untilScheduled(room.scheduledAt, now)}</span>
            </p>
          )}
          {room.description && <p className="mt-2 whitespace-pre-line text-sm text-fg/80">{room.description}</p>}
        </header>

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            {players.length}/{seats} seats reserved
          </h2>
          {players.map((p) => (
            <div key={p.uid} className="flex items-center gap-2 text-sm">
              <Avatar name={p.name} photoURL={p.photoURL} size={24} />
              <span className={p.uid === uid ? "font-medium text-fg" : "text-fg"}>{p.name}</span>
              {p.uid === room.hostUid && <span className="text-xs text-muted">host</span>}
            </div>
          ))}
          {players.length === 0 && <p className="text-sm text-muted">Nobody has reserved a seat yet.</p>}
          {watchers.length > 0 && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Icon name="eye" size={14} /> Watching: {watchers.map((w) => w.name).join(", ")}
            </div>
          )}
        </section>

        <div className="flex gap-2">
          <Button size="md" className="flex-1" onClick={share}>
            <Icon name={copied ? "check" : "link"} /> {copied ? "Link copied" : "Invite"}
          </Button>
          {room.scheduledAt && (
            <a href={googleCalendarUrl(room, typeof window === "undefined" ? "" : window.location.href)} target="_blank" rel="noreferrer" className={`${buttonClass("default", "md")} flex-1`}>
              <Icon name="plus" /> Google Calendar
            </a>
          )}
        </div>

        {me ? (
          <Button size="md" disabled={busy} onClick={() => leaveRoom(roomId, me)}>Give up my seat</Button>
        ) : banned ? (
          <p className="text-danger">The host removed you from this table.</p>
        ) : watcher ? (
          <Button size="md" disabled={busy} onClick={() => removeWatcher(roomId, uid)}><Icon name="eye" /> Watching · click to stop</Button>
        ) : (
          <form className="flex flex-col gap-2" onSubmit={reserve}>
            {full && <p className="text-danger">Every seat is reserved.</p>}
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <div className="flex gap-2">
              {!full && <Button type="submit" variant="primary" size="md" className="flex-1" disabled={!name.trim() || busy}>Reserve a seat</Button>}
              <Button type="button" variant={full ? "primary" : "default"} size="md" className="flex-1" disabled={!name.trim() || busy} onClick={watch}>
                <Icon name="eye" /> Just watch
              </Button>
            </div>
          </form>
        )}

        {(isHost || (me && due)) && (
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <Button variant="primary" size="md" onClick={() => openTable(roomId, me).then(() => { if (isHost) announceTable(roomId); })}>Open the table now</Button>
            {isHost && <Button variant="ghost" size="md" className="text-danger" onClick={cancel}>Cancel this game</Button>}
          </div>
        )}
      </main>
    </>
  );
}
