"use client";
import { createPortal } from "react-dom";
import type { GameDefinition } from "@/games/types";
import { useIsMobile } from "@/lib/useIsMobile";
import type { BoardToken } from "@/lib/rooms";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface Props {
  game: GameDefinition;
  token: BoardToken;
  onChange: (patch: Partial<BoardToken>) => void;
  onRemove: () => void;
  onClose: () => void;
}

const step = "flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-panel-2 hover:text-fg";

/** Popover for a token: stat values, keyword statuses with reminders, remove. A bottom sheet on phones. */
export function TokenEditor({ game, token, onChange, onRemove, onClose }: Props) {
  const sheet = useIsMobile();
  const statuses = token.kind === "stat" ? token.statuses : [];
  const active = game.keywords.filter((k) => statuses.includes(k.id));

  function setValue(i: 0 | 1, delta: number) {
    if (token.kind !== "stat") return;
    const values: [number, number] = [...token.values] as [number, number];
    values[i] += delta;
    onChange({ values });
  }
  function toggle(id: string) {
    onChange({ statuses: statuses.includes(id) ? statuses.filter((s) => s !== id) : [...statuses, id] });
  }

  const panel = (
    <div
      className={`z-30 border-line bg-panel p-2 text-ui shadow-xl ${sheet ? "fixed inset-x-0 bottom-0 rounded-t-lg border-t" : "absolute left-1/2 top-full mt-1 w-64 -translate-x-1/2 rounded-lg border"}`}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {token.kind === "stat" && (
        <>
          {([0, 1] as const).map((i) => (
            <div key={i} className="flex items-center gap-1 py-0.5">
              <span className="flex-1 text-muted">{game.statLabels[i]}</span>
              <button type="button" className={step} onClick={() => setValue(i, -1)}><Icon name="minus" size={12} /></button>
              <span className="w-6 text-center font-mono font-semibold text-fg">{token.values[i]}</span>
              <button type="button" className={step} onClick={() => setValue(i, 1)}><Icon name="plus" size={12} /></button>
            </div>
          ))}
          <div className="mt-1 flex flex-wrap gap-1 border-t border-line pt-2">
            {game.keywords.map((k) => (
              <button
                key={k.id}
                type="button"
                title={k.blurb}
                className={`rounded-full border px-2 py-0.5 text-[11px] ${statuses.includes(k.id) ? "border-accent bg-accent/15 text-accent" : "border-line text-muted hover:text-fg"}`}
                onClick={() => toggle(k.id)}
              >
                {k.name}
              </button>
            ))}
          </div>
          {active.length > 0 && (
            <dl className="mt-2 flex flex-col gap-1 border-t border-line pt-2 text-[11px] leading-snug">
              {active.map((k) => (
                <div key={k.id}>
                  <dt className="inline font-semibold text-fg">{k.name}. </dt>
                  <dd className="inline text-muted">{k.blurb}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
      <div className={`flex justify-between ${token.kind === "stat" ? "mt-2 border-t border-line pt-2" : ""}`}>
        <Button variant="ghost" className="text-danger" onClick={onRemove}>
          <Icon name="x" size={13} /> Remove
        </Button>
        <Button variant="ghost" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
  return sheet ? createPortal(panel, document.body) : panel;
}
