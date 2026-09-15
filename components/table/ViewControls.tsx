"use client";
import { menuItemClass as item } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Viewer-local flips applied on top of the player's own mirror/rotate. Never synced. */
export interface ViewFlips {
  mirror: boolean;
  rotate: boolean;
}

export const noFlips: ViewFlips = { mirror: false, rotate: false };

/** Menu items to flip another player's video for this viewer only. */
export function ViewControls({ view, onChange }: { view: ViewFlips; onChange: (view: ViewFlips) => void }) {
  return (
    <>
      <button type="button" className={`${item} ${view.mirror ? "text-accent" : ""}`} onClick={() => onChange({ ...view, mirror: !view.mirror })}>
        <Icon name="mirror" /> Mirror for me only
      </button>
      <button type="button" className={`${item} ${view.rotate ? "text-accent" : ""}`} onClick={() => onChange({ ...view, rotate: !view.rotate })}>
        <Icon name="rotate" /> Rotate 180° for me only
      </button>
    </>
  );
}
