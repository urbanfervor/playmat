"use client";
import Link from "next/link";
import { isOnline } from "@/lib/presence";
import type { Friend } from "@/lib/friends";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function ago(ms: number) {
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export function FriendRow({ friend, now, onUnfollow, onNavigate }: { friend: Friend; now: number; onUnfollow: () => void; onNavigate: () => void }) {
  const p = friend.presence;
  const name = p?.name ?? "Player";
  const online = isOnline(p, now);
  const table = online ? p?.table : null;
  return (
    <div className="group flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-panel-2">
      <span className="relative">
        <Avatar name={name} photoURL={p?.photoURL} size={28} />
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-panel ${online ? "bg-emerald-500" : "bg-muted"}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-fg">{name}</div>
        <div className="truncate text-xs text-muted">
          {table ? (
            <>
              At <Link href={`/room/${table.id}`} className="text-accent hover:underline" onClick={onNavigate}>{table.name}</Link>
            </>
          ) : online ? (
            "Online"
          ) : p?.lastSeen ? (
            `Last seen ${ago(now - p.lastSeen.toMillis())}`
          ) : (
            "Offline"
          )}
        </div>
      </div>
      <IconButton title={`Unfollow ${name}`} className="opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100" onClick={onUnfollow}>
        <Icon name="x" size={13} />
      </IconButton>
    </div>
  );
}
