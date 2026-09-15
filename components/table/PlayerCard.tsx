"use client";
import { useRef, useState } from "react";
import { useClickOutside } from "@/lib/useClickOutside";
import { follow, unfollow, useFollowing } from "@/lib/friends";
import { toggleHeart, useHearted } from "@/lib/profile";
import type { Player } from "@/lib/rooms";
import { Avatar } from "@/components/ui/Avatar";
import { menuItemClass as item } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RecordBadges } from "@/components/profile/Record";

interface Props {
  roomId: string;
  player: Player;
  /** The viewer's uid. */
  uid: string;
  /** The viewer's seat, if seated; hearts need one. */
  viewer?: Player;
}

/** Another player's avatar in the tile bar. Hover or click for follow and heart. */
export function PlayerCard({ roomId, player, uid, viewer }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const following = useFollowing(uid, player.uid);
  const hearted = useHearted(roomId, viewer?.uid, player.uid);
  useClickOutside(ref, open, () => setOpen(false));

  return (
    <span ref={ref} className="relative flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" title={player.name} className="rounded-full" onClick={() => setOpen((o) => !o)}>
        <Avatar name={player.name} photoURL={player.photoURL} size={20} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 pt-1">
          <div className="w-52 rounded-lg border border-line bg-panel p-1 shadow-xl">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar name={player.name} photoURL={player.photoURL} size={28} />
              <span className="truncate text-sm text-fg">{player.name}</span>
              <RecordBadges uid={player.uid} />
            </div>
            <button type="button" className={item} onClick={() => (following ? unfollow(uid, player.uid) : follow(uid, player.uid))}>
              <Icon name={following ? "user-check" : "user-plus"} className={following ? "text-accent" : ""} /> {following ? "Friend · unfollow" : "Add friend"}
            </button>
            {viewer && (
              <button type="button" className={item} onClick={() => toggleHeart(roomId, viewer, player, hearted)}>
                <Icon name="heart" className={hearted ? "fill-current text-rose-400" : ""} /> {hearted ? "Take back heart" : "Give a heart"}
              </button>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
