"use client";
import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/lib/useClickOutside";
import { applyPref, currentPrefs, defaults, densities, fonts, themes, type Prefs } from "@/lib/prefs";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Settings behind a sliders icon, for guests who have no account menu to hold them. */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <IconButton title="Settings" active={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="sliders" />
      </IconButton>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-60 rounded-lg border border-line bg-panel p-2 shadow-xl">
          <SettingsOptions />
        </div>
      )}
    </div>
  );
}

/** Theme, density, and font pickers. */
export function SettingsOptions() {
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  useEffect(() => setPrefs(currentPrefs()), []);

  function pick<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    applyPref(key, value);
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  return (
    <>
      <Section title="Theme">
        {themes.map((t) => (
          <Option key={t.id} selected={prefs.theme === t.id} onClick={() => pick("theme", t.id)}>
            <span className="flex h-4 w-6 overflow-hidden rounded-sm border border-line">
              <span className="flex-1" style={{ background: t.swatch[0] }} />
              <span className="flex-1" style={{ background: t.swatch[1] }} />
            </span>
            {t.name}
          </Option>
        ))}
      </Section>
      <Section title="Density">
        <div className="flex gap-1 px-1.5 pb-1">
          {densities.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`flex-1 rounded-md border px-1 py-1 text-xs ${prefs.density === d.id ? "border-accent bg-accent/15 text-accent" : "border-line text-muted hover:bg-panel-2 hover:text-fg"}`}
              onClick={() => pick("density", d.id)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Font">
        {fonts.map((f) => (
          <Option key={f.id} selected={prefs.font === f.id} onClick={() => pick("font", f.id)}>
            <span style={{ fontFamily: `var(--font-${f.id})` }}>{f.name}</span>
          </Option>
        ))}
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-1 last:border-0 last:pb-0 [&+&]:pt-2">
      <div className="px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</div>
      {children}
    </div>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-panel-2 ${selected ? "text-fg" : "text-muted"}`}
      onClick={onClick}
    >
      <span className="flex flex-1 items-center gap-2">{children}</span>
      {selected && <Icon name="check" size={14} className="text-accent" />}
    </button>
  );
}
