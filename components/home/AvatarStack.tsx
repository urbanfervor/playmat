import { Avatar } from "@/components/ui/Avatar";

export interface StackEntry {
  name: string;
  photoURL?: string | null;
}

export function AvatarStack({ people, size = 22 }: { people: StackEntry[]; size?: number }) {
  return (
    <span className="flex">
      {people.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} photoURL={p.photoURL} size={size} className={`border-2 border-panel ${i ? "-ml-[0.3em]" : ""}`} />
      ))}
    </span>
  );
}
