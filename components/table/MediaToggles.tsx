"use client";
import { useLocalParticipant } from "@livekit/components-react";
import type { Player, Room } from "@/lib/rooms";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** The local player's camera and mic on/off buttons. */
export function MediaToggles({ room, me }: { room: Room; me: Player }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const mod = room.moderation?.[me.uid] ?? {};
  return (
    <>
      <IconButton
        title={mod.videoOff ? "Camera turned off by host" : isCameraEnabled ? "Turn camera off" : "Turn camera on"}
        className={isCameraEnabled ? "" : "text-danger"}
        disabled={!!mod.videoOff}
        onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
      >
        <Icon name={isCameraEnabled ? "camera" : "camera-off"} />
      </IconButton>
      <IconButton
        title={mod.muted ? "Muted by host" : isMicrophoneEnabled ? "Mute" : "Unmute"}
        className={isMicrophoneEnabled ? "" : "text-danger"}
        disabled={!!mod.muted}
        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
      >
        <Icon name={isMicrophoneEnabled ? "mic" : "mic-off"} />
      </IconButton>
    </>
  );
}
