"use client";
import { useEffect, useRef, useState } from "react";
import { useParticipantTracks, useTrackVolume } from "@livekit/components-react";
import { Track, type Participant } from "livekit-client";

/** Volume (0..1) that counts as talking, and the quieter level that ends it. */
const ON = 0.18;
const OFF = 0.08;
/** How long to keep "speaking" after the level drops, so pauses between words don't flicker. */
const HOLD_MS = 500;

/**
 * Whether a participant is talking, from their mic level with hysteresis.
 * Less twitchy than LiveKit's active-speaker flag, which trips on breaths and keyboard noise.
 */
export function useSpeaking(participant?: Participant) {
  const [mic] = useParticipantTracks([Track.Source.Microphone], participant?.identity);
  const volume = useTrackVolume(mic, { smoothingTimeConstant: 0.85 });
  const [speaking, setSpeaking] = useState(false);
  const quietSince = useRef<number | null>(null);

  useEffect(() => {
    if (volume >= ON) {
      quietSince.current = null;
      setSpeaking(true);
      return;
    }
    if (!speaking || volume > OFF) return;
    quietSince.current ??= Date.now();
    const t = setTimeout(() => setSpeaking(false), Math.max(0, HOLD_MS - (Date.now() - quietSince.current)));
    return () => clearTimeout(t);
  }, [volume, speaking]);

  return speaking && !!participant;
}
