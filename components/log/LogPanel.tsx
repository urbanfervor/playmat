"use client";
import { useEffect, useRef, useState } from "react";
import { watchLog, type LogEntry } from "@/lib/log";

function time(e: LogEntry) {
  return e.createdAt?.toDate().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) ?? "";
}

/** Everything that happened at the table, newest at the bottom. */
export function LogPanel({ roomId }: { roomId: string }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => watchLog(roomId, setEntries), [roomId]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [entries]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 text-ui">
        {entries.length === 0 && <p className="text-muted">Nothing yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className="flex gap-2 break-words">
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted/70">{time(e)}</span>
            <span className="text-fg/90">{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
