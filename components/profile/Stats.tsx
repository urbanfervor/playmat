import type { Record } from "@/lib/profile";
import { Icon } from "@/components/ui/Icon";

/** Games, wins, and hearts side by side. */
export function Stats({ record, size = "sm" }: { record: Record; size?: "sm" | "lg" }) {
  return (
    <div className={`flex ${size === "lg" ? "gap-8" : "gap-4"}`}>
      <Stat icon="card" value={record.games} label={record.games === 1 ? "game" : "games"} tone="text-fg" size={size} />
      <Stat icon="trophy" value={record.wins} label={record.wins === 1 ? "win" : "wins"} tone="text-amber-400" size={size} />
      <Stat icon="heart" value={record.hearts} label={record.hearts === 1 ? "heart" : "hearts"} tone="text-rose-400" size={size} />
    </div>
  );
}

function Stat({ icon, value, label, tone, size }: { icon: "card" | "trophy" | "heart"; value: number; label: string; tone: string; size: "sm" | "lg" }) {
  return (
    <div className={`flex flex-col items-center ${tone}`}>
      <span className={`flex items-center gap-1 font-mono font-semibold tabular-nums leading-none ${size === "lg" ? "text-4xl" : "text-2xl"}`}>
        <Icon name={icon} size={size === "lg" ? 24 : 18} /> {value}
      </span>
      <span className={`text-muted ${size === "lg" ? "text-xs" : "text-[11px]"}`}>{label}</span>
    </div>
  );
}
