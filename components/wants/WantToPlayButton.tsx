"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WantDialog } from "./WantDialog";

export function WantToPlayButton({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-4 sm:flex-row sm:items-center">
      <p className="min-w-0 flex-1 text-sm text-muted">
        <span className="block text-base font-semibold text-fg">Looking for a game?</span>
        Say when you&apos;re free and we&apos;ll ping you when a table opens.
      </p>
      <Button variant="primary" size="md" className="sm:shrink-0" onClick={() => setOpen(true)}>
        I want to play
      </Button>
      {open && <WantDialog onClose={() => setOpen(false)} />}
    </section>
  );
}
