"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDoc } from "firebase/firestore";
import { getGame } from "@/games";
import { playTone } from "@/lib/joinAlerts";
import { roomRef, type Room } from "@/lib/rooms";
import { useUser } from "@/lib/useUser";
import { deleteWant, watchMyWants } from "@/lib/wants";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

interface Ready {
  wantId: string;
  roomId: string;
  room: Room;
}

/**
 * Pops up on the registrant's screen when a table is started for them or a
 * matching one opens. Joining takes them there and removes the registration.
 */
export function GameReady() {
  const router = useRouter();
  const user = useUser();
  const [ready, setReady] = useState<Ready | null>(null);
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (!user) return;
    return watchMyWants(user.uid, async (wants) => {
      for (const { id, want } of wants) {
        for (const roomId of want.alerted ?? []) {
          if (handled.current.has(roomId)) continue;
          handled.current.add(roomId);
          const room = (await getDoc(roomRef(roomId))).data() as Room | undefined;
          if (!room || !["scheduled", "lobby"].includes(room.status)) continue;
          setReady({ wantId: id, roomId, room });
          playTone();
          if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
            new Notification("Your game is ready", { body: room.name, tag: roomId });
          }
        }
      }
    });
  }, [user]);

  if (!ready) return null;
  const game = getGame(ready.room.game);
  const format = game.formats.find((f) => f.id === ready.room.format)?.name ?? ready.room.format;

  function join() {
    deleteWant(ready!.wantId);
    setReady(null);
    router.push(`/room/${ready!.roomId}`);
  }

  return (
    <Dialog onClose={() => setReady(null)} className="max-w-sm p-4">
      <h2 className="text-base font-semibold">Your game is ready</h2>
      <p className="text-sm text-muted">
        <span className="text-fg">{ready.room.name}</span> · {game.name} · {format}
      </p>
      <div className="flex gap-2">
        <Button variant="primary" size="md" className="flex-1" onClick={join}>Join table</Button>
        <Button size="md" onClick={() => setReady(null)}>Not now</Button>
      </div>
    </Dialog>
  );
}
