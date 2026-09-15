"use client";
import { useEffect, useRef } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { passTurn, rollDie, type Player } from "@/lib/rooms";
import { bumpCounter } from "@/lib/counters";
import type { TableProps } from "./Table";
import { CHAT_INPUT_ID } from "@/components/chat/ChatPanel";

interface Props extends Omit<TableProps, "me"> {
  me: Player;
  dialogOpen: boolean;
  onSearch: () => void;
  onShortcuts: () => void;
  onChat: () => void;
  onClose: () => void;
}

/** Global key handling for the table. The list shown to users lives in lib/shortcuts.ts; keep both in sync. */
export function Hotkeys({ roomId, game, room, players, me, dialogOpen, onSearch, onShortcuts, onChat, onClose }: Props) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  /** True while T is held to talk from a muted state. */
  const talking = useRef(false);

  useEffect(() => {
    const bumpLife = (delta: number) => bumpCounter(roomId, me, game.counters[0], delta);

    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.matches("input, textarea, select, [contenteditable]")) return;
      if (dialogOpen) {
        if (e.key === "Escape") onClose();
        return;
      }
      switch (e.key) {
        case " ":
          if (room.turn.playerUid) passTurn(roomId, room, players);
          break;
        case "ArrowUp":
          bumpLife(e.shiftKey ? 5 : 1);
          break;
        case "ArrowDown":
          bumpLife(e.shiftKey ? -5 : -1);
          break;
        case "s":
          onSearch();
          break;
        case "d":
          rollDie(roomId, me.name, 6);
          break;
        case "r":
          rollDie(roomId, me.name, 20);
          break;
        case "f":
          rollDie(roomId, me.name, 2);
          break;
        case "c":
          if (!room.moderation?.[me.uid]?.videoOff) localParticipant.setCameraEnabled(!isCameraEnabled);
          break;
        case "m":
          if (!room.moderation?.[me.uid]?.muted) localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
          break;
        case "t":
          if (!e.repeat && !isMicrophoneEnabled && !room.moderation?.[me.uid]?.muted) {
            talking.current = true;
            localParticipant.setMicrophoneEnabled(true);
          }
          break;
        case "/":
          onChat();
          requestAnimationFrame(() => document.getElementById(CHAT_INPUT_ID)?.focus());
          break;
        case "?":
          onShortcuts();
          break;
        default:
          return;
      }
      e.preventDefault();
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "t" && talking.current) {
        talking.current = false;
        localParticipant.setMicrophoneEnabled(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [roomId, game, room, players, me, dialogOpen, onSearch, onShortcuts, onChat, onClose, localParticipant, isCameraEnabled, isMicrophoneEnabled]);

  return null;
}
