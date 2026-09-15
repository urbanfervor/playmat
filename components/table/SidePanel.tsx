"use client";
import type { Viewer } from "@/lib/viewer";
import { IconButton } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { LogPanel } from "@/components/log/LogPanel";

export type SideTab = "log" | "chat";

interface Props {
  roomId: string;
  viewer: Viewer;
  tab: SideTab;
  onTab: (tab: SideTab) => void;
  /** Phones only: the panel covers the table while open. Always shown from md up. */
  open: boolean;
  onClose: () => void;
}

const tabs: { id: SideTab; name: string; icon: IconName }[] = [
  { id: "chat", name: "Chat", icon: "chat" },
  { id: "log", name: "Log", icon: "log" },
];

/** Right-hand sidebar: one of log or chat, switched by tabs. A full-screen sheet on phones. */
export function SidePanel({ roomId, viewer, tab, onTab, open, onClose }: Props) {
  return (
    <aside className={`${open ? "fixed inset-0 z-20 flex" : "hidden"} flex-col bg-bg-2 md:static md:z-auto md:flex md:w-72 md:shrink-0 md:border-l md:border-line`}>
      <div className="flex h-bar shrink-0 items-stretch border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 text-ui font-medium ${tab === t.id ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"}`}
            onClick={() => onTab(t.id)}
          >
            <Icon name={t.icon} size={14} /> {t.name}
          </button>
        ))}
        <IconButton title="Close" className="mr-1 self-center md:hidden" onClick={onClose}>
          <Icon name="x" />
        </IconButton>
      </div>
      {tab === "log" ? <LogPanel roomId={roomId} /> : <ChatPanel roomId={roomId} viewer={viewer} />}
    </aside>
  );
}
