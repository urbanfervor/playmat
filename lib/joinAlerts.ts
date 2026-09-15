"use client";
import { useEffect, useRef, useState } from "react";
import type { Player, Room } from "./rooms";

const KEY = "playmat:joinAlerts";

function enabled() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

const canNotify = () => typeof window !== "undefined" && "Notification" in window;

/** Host's per-device switch for the sit-down tone and desktop notification. On by default. */
export function useJoinAlertsSetting() {
  const [on, setOn] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("denied");
  useEffect(() => {
    setOn(enabled());
    if (canNotify()) setPermission(Notification.permission);
  }, []);

  /** Browsers only show the permission prompt from a click, so this is wired to a button. */
  async function requestPermission() {
    if (!canNotify()) return;
    setPermission(await Notification.requestPermission());
  }

  function toggle() {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
    if (next) requestPermission();
  }
  return { on, toggle, needsPermission: on && permission === "default", requestPermission };
}

/** Two soft sine notes, a rising fifth. */
function playTone() {
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
  [523.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + 0.6);
  });
  setTimeout(() => ctx.close(), 800);
}

function notify(name: string, room: Room) {
  if (!("Notification" in window) || Notification.permission !== "granted" || document.visibilityState === "visible") return;
  const n = new Notification(`${name} sat down`, { body: room.name, tag: "playmat-join" });
  n.onclick = () => {
    window.focus();
    n.close();
  };
}

/** Alerts the host when a new player sits down. Ignores the initial snapshot and the host's own seat. */
export function useJoinAlerts(room: Room, players: Player[], me: Player | undefined) {
  const seen = useRef<Set<string> | null>(null);
  const isHost = me?.uid === room.hostUid;

  useEffect(() => {
    if (!isHost) {
      seen.current = null;
      return;
    }
    const uids = new Set(players.map((p) => p.uid));
    if (seen.current && enabled()) {
      for (const p of players) {
        if (!seen.current.has(p.uid) && p.uid !== me?.uid) {
          playTone();
          notify(p.name, room);
        }
      }
    }
    seen.current = uids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, isHost]);
}
