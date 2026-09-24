import { RoomServiceClient, TrackSource, type ParticipantPermission } from "livekit-server-sdk";
import type { Room } from "@/lib/rooms";

export const roomService = () =>
  new RoomServiceClient(process.env.NEXT_PUBLIC_LIVEKIT_URL!.replace(/^ws/, "http"), process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

/**
 * What a participant may publish: a seated, unbanned player's camera and mic,
 * minus whatever the host switched off. Everyone else only watches.
 * An empty source list would mean "any source", so publishing is switched off instead.
 */
export function publishPermission(room: Room, uid: string, seated: boolean): Pick<ParticipantPermission, "canPublish" | "canPublishSources"> {
  const mod = room.moderation?.[uid];
  const sources = seated && !room.banned?.includes(uid) ? [TrackSource.CAMERA, TrackSource.MICROPHONE] : [];
  const allowed = sources.filter((s) => !(s === TrackSource.CAMERA && mod?.videoOff) && !(s === TrackSource.MICROPHONE && mod?.muted));
  return { canPublish: allowed.length > 0, canPublishSources: allowed };
}
