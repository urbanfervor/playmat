"use client";
import { follow, unfollow, useFollowing } from "@/lib/friends";
import type { Player } from "@/lib/rooms";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Follow a player to see in the friends list when they're online or at a table. */
export function FollowButton({ uid, player }: { uid: string; player: Pick<Player, "uid" | "name"> }) {
  const following = useFollowing(uid, player.uid);
  return (
    <IconButton
      title={following ? `Unfollow ${player.name}` : `Follow ${player.name}: see when they're online`}
      className={following ? "text-accent hover:text-accent" : ""}
      onClick={() => (following ? unfollow(uid, player.uid) : follow(uid, player.uid))}
    >
      <Icon name={following ? "user-check" : "user-plus"} />
    </IconButton>
  );
}
