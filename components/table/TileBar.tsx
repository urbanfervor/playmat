"use client";
import type { Player, Room } from "@/lib/rooms";
import { SpeakingDot } from "./SpeakingDot";
import { PlayerCard } from "./PlayerCard";
import { Avatar } from "@/components/ui/Avatar";
import { RecordBadges } from "@/components/profile/Record";
import { Icon } from "@/components/ui/Icon";
import { DeckBadge } from "@/components/deck/DeckBadge";
import { TileMenu } from "./TileMenu";
import { MediaToggles } from "./MediaToggles";
import { useEnforceModeration } from "./useEnforceModeration";
import type { ViewFlips } from "./ViewControls";

interface Props {
  roomId: string;
  room: Room;
  player: Player;
  isMe: boolean;
  /** The viewer's uid, seated or spectating. */
  uid: string;
  viewer?: Player;
  isHostViewer: boolean;
  hasTurn: boolean;
  speaking: boolean;
  view: ViewFlips;
  onView: (view: ViewFlips) => void;
}

/** Strip above each video: avatar, name and badges on the left, deck and menu on the right. */
export function TileBar({ roomId, room, player, isMe, uid, viewer, isHostViewer, hasTurn, speaking, view, onView }: Props) {
  const isHost = player.uid === room.hostUid;
  const mod = room.moderation?.[player.uid] ?? {};
  useEnforceModeration(isMe ? mod : {});

  return (
    <div className="flex h-bar shrink-0 items-center gap-0.5 border-b border-line bg-bg-2 px-2" onClick={(e) => e.stopPropagation()}>
      <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-ui font-medium">
        {hasTurn && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        {isMe ? <Avatar name={player.name} photoURL={player.photoURL} size={20} /> : <PlayerCard roomId={roomId} player={player} uid={uid} viewer={viewer} />}
        {room.winnerUid === player.uid && <Icon name="trophy" size={13} className="text-amber-400" />}
        <span className="truncate">{player.name}</span>
        <RecordBadges uid={player.uid} />
        <SpeakingDot speaking={speaking} />
        {isHost && <span title="Host"><Icon name="crown" size={13} className="text-amber-400" /></span>}
        {mod.muted && <span title="Muted by host" className="text-danger">muted</span>}
      </span>
      <span className="ml-auto flex items-center gap-0.5">
        {player.deck && <DeckBadge name={player.name} deck={player.deck} />}
        {isMe && <MediaToggles room={room} me={player} />}
        <TileMenu roomId={roomId} room={room} player={player} isMe={isMe} isHostViewer={isHostViewer} view={view} onView={onView} />
      </span>
    </div>
  );
}
