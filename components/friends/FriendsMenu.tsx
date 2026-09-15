"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { unfollow, useFriends } from "@/lib/friends";
import { isOnline } from "@/lib/presence";
import { useUser } from "@/lib/useUser";
import { useClickOutside } from "@/lib/useClickOutside";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FriendRow } from "./FriendRow";

/** Who you follow and whether they're online or at a table, in the nav. */
export function FriendsMenu() {
  const user = useUser();
  const friends = useFriends(user?.uid);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, open, () => setOpen(false));
  // Online status is time-based, so re-evaluate it every half minute.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;
  const online = friends.filter((f) => isOnline(f.presence, now)).length;
  const sorted = [...friends].sort((a, b) => Number(isOnline(b.presence, now)) - Number(isOnline(a.presence, now)));

  return (
    <div ref={ref} className="relative">
      <IconButton title={`Friends · ${online} online`} active={open} className="relative" onClick={() => setOpen((o) => !o)}>
        <Icon name="users" />
        {online > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      </IconButton>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-64 rounded-lg border border-line bg-panel p-2 shadow-xl">
          <div className="flex items-baseline justify-between px-1.5 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Friends</span>
            <span className="text-xs text-muted">{online} online</span>
          </div>
          {sorted.length === 0 ? (
            <p className="px-1.5 py-1 text-xs text-muted">Follow people from their tile at a table, or from your <Link href="/profile" className="text-accent hover:underline" onClick={() => setOpen(false)}>recent games</Link>, to see when they&apos;re online.</p>
          ) : (
            <div className="flex max-h-80 flex-col overflow-y-auto">
              {sorted.map((f) => (
                <FriendRow key={f.uid} friend={f} now={now} onUnfollow={() => unfollow(user.uid, f.uid)} onNavigate={() => setOpen(false)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
