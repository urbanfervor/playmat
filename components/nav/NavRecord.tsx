"use client";
import Link from "next/link";
import { useRecord } from "@/lib/profile";
import { useUser } from "@/lib/useUser";
import { Icon } from "@/components/ui/Icon";

/** The signed-in player's games, wins and hearts, inline in the nav. Links to the profile. */
export function NavRecord() {
  const user = useUser();
  const record = useRecord(user?.uid, true);
  if (!record) return null;
  return (
    <Link
      href="/profile"
      title={`${record.games} games · ${record.wins} wins · ${record.hearts} hearts. Wins are recorded by the host; hearts come from people you played with.`}
      className="mr-1 hidden items-center sm:flex gap-2.5 rounded-md px-1.5 font-mono text-xs font-semibold tabular-nums hover:bg-panel-2"
    >
      <span className="flex items-center gap-1 text-fg"><Icon name="card" size={13} /> {record.games}</span>
      <span className="flex items-center gap-1 text-amber-400"><Icon name="trophy" size={13} /> {record.wins}</span>
      <span className="flex items-center gap-1 text-rose-400"><Icon name="heart" size={13} /> {record.hearts}</span>
    </Link>
  );
}
