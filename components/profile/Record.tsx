"use client";
import { useRecord } from "@/lib/profile";
import { Icon } from "@/components/ui/Icon";

/** Compact wins and hearts badges for a player, shown wherever their name appears. */
export function RecordBadges({ uid, className = "" }: { uid: string; className?: string }) {
  const record = useRecord(uid);
  if (!record || (record.wins === 0 && record.hearts === 0)) return null;
  return (
    <span className={`flex items-center gap-1.5 text-[11px] tabular-nums ${className}`}>
      {record.wins > 0 && (
        <span className="flex items-center gap-0.5 text-amber-400" title={`${record.wins} ${record.wins === 1 ? "win" : "wins"}`}>
          <Icon name="trophy" size={12} /> {record.wins}
        </span>
      )}
      {record.hearts > 0 && (
        <span className="flex items-center gap-0.5 text-rose-400" title={`${record.hearts} ${record.hearts === 1 ? "heart" : "hearts"} from other players`}>
          <Icon name="heart" size={12} /> {record.hearts}
        </span>
      )}
    </span>
  );
}
