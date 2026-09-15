"use client";
import { shortcuts } from "@/lib/shortcuts";
import { Dialog } from "@/components/ui/Dialog";

export function Shortcuts({ onClose }: { onClose: () => void }) {
  return (
    <Dialog onClose={onClose} className="max-w-xs">
      <h2 className="text-sm font-semibold text-fg">Keyboard shortcuts</h2>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-ui">
        {shortcuts.map((s) => (
          <div key={s.label} className="contents">
            <dt className="flex justify-end gap-1">
              {s.keys.map((k) => (
                <kbd key={k} className="rounded border border-line bg-bg px-1.5 py-0.5 font-mono text-xs text-fg">{k}</kbd>
              ))}
            </dt>
            <dd className="text-muted">{s.label}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
