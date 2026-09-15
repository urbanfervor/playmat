"use client";
import { useEffect, useRef, useState } from "react";
import type { GameDefinition } from "@/games/types";
import type { BoardToken, Player } from "@/lib/rooms";
import { removeToken, updateToken } from "@/lib/tokens";
import { frameRect, fromFrame, toFrame, type Rect } from "@/lib/frame";
import { TokenEditor } from "./TokenEditor";
import { TokenPill } from "./TokenPill";

interface Props {
  roomId: string;
  game: GameDefinition;
  player: Player;
  editable: boolean;
  /** Effective orientation the video is drawn with, including this viewer's local flips. */
  mirror: boolean;
  rotate: 0 | 180;
  /** The tile's video container. */
  container: React.RefObject<HTMLDivElement | null>;
  /** Changes when the video element is (re)mounted; retriggers frame measurement. */
  hasVideo: boolean;
}

const DRAG_THRESHOLD = 4;

/** Overlay that draws a player's tokens on top of their video and lets editors drag them. */
export function BoardTokens({ roomId, game, player, editable, mirror, rotate, container, hasVideo }: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; left: number; top: number } | null>(null);
  const start = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const tokens = player.tokens ?? [];

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const video = el.querySelector("video");
    const measure = () => setRect(frameRect(el.getBoundingClientRect(), video));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    video?.addEventListener("loadedmetadata", measure);
    video?.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      video?.removeEventListener("loadedmetadata", measure);
      video?.removeEventListener("resize", measure);
    };
  }, [container, hasVideo]);

  if (!rect || tokens.length === 0) return null;

  function onPointerDown(e: React.PointerEvent, token: BoardToken) {
    if (!editable) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { id: token.id, x: e.clientX, y: e.clientY, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = start.current;
    if (!s) return;
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < DRAG_THRESHOLD) return;
    s.moved = true;
    const box = container.current!.getBoundingClientRect();
    setDrag({ id: s.id, left: e.clientX - box.left, top: e.clientY - box.top });
  }
  function onPointerUp(e: React.PointerEvent, token: BoardToken) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (s.moved) {
      const box = container.current!.getBoundingClientRect();
      const p = toFrame(e.clientX - box.left, e.clientY - box.top, rect!, mirror, rotate);
      updateToken(roomId, player, token.id, p);
      setDrag(null);
    } else {
      setOpen(open === token.id ? null : token.id);
    }
  }

  return (
    <>
      {tokens.map((token) => {
        const pos = drag?.id === token.id ? { left: drag.left, top: drag.top } : fromFrame(token.x, token.y, rect, mirror, rotate);
        return (
          <div
            key={token.id}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 select-none ${editable ? "cursor-grab active:cursor-grabbing" : ""}`}
            style={{ left: pos.left, top: pos.top, touchAction: "none" }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onPointerDown={(e) => onPointerDown(e, token)}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => onPointerUp(e, token)}
          >
            <TokenPill roomId={roomId} game={game} player={player} token={token} editable={editable} />
            {open === token.id && editable && (
              <TokenEditor
                game={game}
                token={token}
                onChange={(patch) => updateToken(roomId, player, token.id, patch)}
                onRemove={() => { removeToken(roomId, player, game, token.id); setOpen(null); }}
                onClose={() => setOpen(null)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
