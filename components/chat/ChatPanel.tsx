"use client";
import { useEffect, useRef, useState } from "react";
import { sendMessage, watchMessages, type Message } from "@/lib/chat";
import type { Viewer } from "@/lib/viewer";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "@/components/ui/Input";

export const CHAT_INPUT_ID = "chat-input";

/** Seated players and spectators alike can post; spectator messages are marked. */
export function ChatPanel({ roomId, viewer }: { roomId: string; viewer: Viewer }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => watchMessages(roomId, setMessages), [roomId]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendMessage(roomId, viewer.uid, viewer.name, text, viewer.spectator);
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3 text-ui">
        {messages.length === 0 && <p className="text-muted">Say hi to the table.</p>}
        {messages.map((m) => (
          <div key={m.id} className="break-words">
            <span className={`mr-1.5 font-medium ${m.uid === viewer.uid ? "text-accent" : "text-fg"}`}>{m.name}</span>
            {m.spectator && <Icon name="eye" size={11} className="mr-1.5 inline text-muted" />}
            <span className="text-fg/90">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex shrink-0 items-center gap-1 border-t border-line p-2">
        <input
          id={CHAT_INPUT_ID}
          className={`${inputClass} h-control text-ui`}
          placeholder="Message…"
          value={draft}
          maxLength={500}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        />
        <IconButton type="submit" title="Send" disabled={!draft.trim()}>
          <Icon name="send" />
        </IconButton>
      </form>
    </div>
  );
}
