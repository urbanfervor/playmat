"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WantDialog } from "./WantDialog";

export function WantToPlayButton({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="flex flex-wrap items-center gap-3 rounded-lg border border-accent/40 bg-panel p-4">
      <p className="min-w-0 flex-1 text-sm text-muted">
        <span className="block text-base font-semibold text-fg">Looking for a game?</span>
        Post when you&apos;re free. We&apos;ll ping you the moment someone starts a table.
      </p>
      <Button variant="primary" size="md" className="h-11 px-6 text-base" onClick={() => setOpen(true)}>
        I want to play
      </Button>
      {open && <WantDialog onClose={() => setOpen(false)} />}
    </section>
  );
}
