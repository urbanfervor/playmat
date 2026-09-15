"use client";
import { useEffect } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import type { Moderation } from "@/lib/rooms";

/** The host's mute / camera-off decisions are enforced by the target's own client. */
export function useEnforceModeration(mod: Moderation) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  useEffect(() => {
    if (mod.muted && isMicrophoneEnabled) localParticipant.setMicrophoneEnabled(false);
    if (mod.videoOff && isCameraEnabled) localParticipant.setCameraEnabled(false);
  }, [mod.muted, mod.videoOff, isMicrophoneEnabled, isCameraEnabled, localParticipant]);
}
