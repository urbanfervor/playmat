"use client";
import { useRef, useState } from "react";
import { VideoTrack, type TrackReference } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import type { GameDefinition } from "@/games/types";
import { updatePlayer, type Player, type Room } from "@/lib/rooms";
import { cropAtClick, identifyCard, type Identification } from "@/lib/identify";
import { frameRect, toFrame } from "@/lib/frame";
import { useSpeaking } from "@/lib/useSpeaking";
import { addCardToken, addStatToken, placeCounterToken, placeMarkerToken } from "@/lib/tokens";
import { CardSearch } from "@/components/cards/CardSearch";
import { BoardMenu } from "@/components/board/BoardMenu";
import { BoardTokens } from "@/components/board/BoardTokens";
import { Counters } from "@/components/overlay/Counters";
import { Life } from "@/components/overlay/Life";
import { IdentifyPopover } from "@/components/cards/IdentifyPopover";
import { TileBar } from "./TileBar";
import { noFlips, type ViewFlips } from "./ViewControls";
import { safeImageUrl } from "@/lib/imageUrl";

interface Props {
  roomId: string;
  game: GameDefinition;
  room: Room;
  player: Player;
  players: Player[];
  isMe: boolean;
  /** The viewer's uid, seated or spectating. */
  uid: string;
  /** The seated viewer; undefined for spectators. */
  viewer?: Player;
  /** Position in the 2x2 grid. */
  seat: number;
  /** The viewer is the room host. */
  isHostViewer: boolean;
  hasTurn: boolean;
  /** The player's LiveKit participant; undefined while their browser is not connected. */
  participant?: Participant;
  track?: TrackReference;
}

const POPOVER_W = 224;
/** Client-side cap on identify calls per tile: each one is a vision-model request. */
const IDENTIFY_LIMIT = 20;
const IDENTIFY_WINDOW_MS = 60_000;

export function PlayerTile({ roomId, game, room, player, players, isMe, uid, viewer, seat, isHostViewer, hasTurn, participant, track }: Props) {
  const tileRef = useRef<HTMLDivElement>(null);
  const clicks = useRef<number[]>([]);
  const [popover, setPopover] = useState<{ x: number; y: number; result: Identification | "loading" | "error" | "limited" } | null>(null);
  const [view, setView] = useState<ViewFlips>(noFlips);
  const [menu, setMenu] = useState<{ x: number; y: number; clientX: number; clientY: number } | null>(null);
  /** Frame point a searched card will be placed at. */
  const [cardAt, setCardAt] = useState<{ x: number; y: number } | null>(null);
  /** The menu closes itself on mousedown; remember it was open so the click that follows doesn't reopen it. */
  const menuWasOpen = useRef(false);
  const editable = isMe || isHostViewer;
  const speaking = useSpeaking(participant);
  // The player's published orientation, flipped again by anything this viewer toggled locally.
  const mirror = player.video.mirror !== view.mirror;
  const rotate: 0 | 180 = (player.video.rotate === 180) !== view.rotate ? 180 : 0;
  const transform = [mirror && "scaleX(-1)", rotate === 180 && "rotate(180deg)"].filter(Boolean).join(" ");

  async function identify(clientX: number, clientY: number) {
    const video = tileRef.current?.querySelector("video");
    if (!video) return;
    const image = cropAtClick(video, clientX, clientY, mirror, rotate);
    if (!image) return;
    const rect = tileRef.current!.getBoundingClientRect();
    const at = {
      x: Math.max(0, Math.min(clientX - rect.left + 12, rect.width - POPOVER_W - 8)),
      y: Math.max(0, Math.min(clientY - rect.top + 12, rect.height - 120)),
    };
    const now = Date.now();
    clicks.current = clicks.current.filter((t) => now - t < IDENTIFY_WINDOW_MS);
    if (clicks.current.length >= IDENTIFY_LIMIT) {
      setPopover({ ...at, result: "limited" });
      return;
    }
    clicks.current.push(now);
    setPopover({ ...at, result: "loading" });
    try {
      setPopover({ ...at, result: await identifyCard(game.id, image) });
    } catch {
      setPopover({ ...at, result: "error" });
    }
  }

  /** Raw-frame coordinates under a pointer position. */
  function framePoint(clientX: number, clientY: number) {
    const box = tileRef.current!.getBoundingClientRect();
    const rect = frameRect(box, tileRef.current!.querySelector("video"));
    return toFrame(clientX - box.left, clientY - box.top, rect, mirror, rotate);
  }

  function openMenu(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    const box = tileRef.current!.getBoundingClientRect();
    setPopover(null);
    setMenu({ x: Math.min(e.clientX - box.left, box.width - 200), y: Math.min(e.clientY - box.top, box.height - 40), clientX: e.clientX, clientY: e.clientY });
  }

  return (
    <div className={`flex min-h-0 min-w-0 flex-col ${hasTurn ? "ring-2 ring-accent" : "ring-1 ring-line"} ${speaking ? "speaking" : ""}`}>
      <TileBar roomId={roomId} room={room} player={player} isMe={isMe} uid={uid} viewer={viewer} isHostViewer={isHostViewer} hasTurn={hasTurn} speaking={speaking} view={view} onView={setView} />
      <div
        ref={tileRef}
        className="relative aspect-video min-h-0 overflow-hidden bg-black md:aspect-auto md:flex-1"
        onMouseDownCapture={() => (menuWasOpen.current = menu !== null)}
        onClick={(e) => !menuWasOpen.current && openMenu(e)}
        onContextMenu={openMenu}
        title={editable ? "Click a card to identify it or place tokens" : "Click a card to identify it"}
      >
      {track ? (
        <VideoTrack trackRef={track} className="absolute inset-0 h-full w-full object-contain" style={{ transform }} />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted">{participant ? "Camera off" : "Away"}</div>
      )}
      <Counters roomId={roomId} game={game} player={player} players={players} editable={isMe} />
      <Life roomId={roomId} game={game} player={player} seat={seat} editable={isMe} hasTurn={hasTurn} />
      {player.revealedCard && (
        <img
          src={safeImageUrl(player.revealedCard.imageUrl)}
          alt={player.revealedCard.name}
          title={isMe ? "Click to hide" : player.revealedCard.name}
          className="absolute bottom-2 left-1/2 w-1/3 max-w-56 -translate-x-1/2 shadow-xl"
          onClick={(e) => {
            e.stopPropagation();
            if (isMe) updatePlayer(roomId, player.uid, { revealedCard: null });
          }}
        />
      )}
      <BoardTokens roomId={roomId} game={game} player={player} editable={editable} mirror={mirror} rotate={rotate} container={tileRef} hasVideo={!!track} />
      {menu && (
        <BoardMenu
          x={menu.x}
          y={menu.y}
          game={game}
          editable={editable}
          onIdentify={() => identify(menu.clientX, menu.clientY)}
          onAddToken={() => { const p = framePoint(menu.clientX, menu.clientY); addStatToken(roomId, player, p.x, p.y); }}
          onPlaceCard={() => setCardAt(framePoint(menu.clientX, menu.clientY))}
          onPlaceCounter={(id) => { const p = framePoint(menu.clientX, menu.clientY); placeCounterToken(roomId, player, game, id, p.x, p.y); }}
          onPlaceMarker={(id) => { const p = framePoint(menu.clientX, menu.clientY); placeMarkerToken(roomId, player, game, id, p.x, p.y); }}
          onClose={() => setMenu(null)}
        />
      )}
      {popover && <IdentifyPopover {...popover} onClose={() => setPopover(null)} />}
      {cardAt && (
        <div onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()}>
          <CardSearch roomId={roomId} game={game} uid={player.uid} onPick={(c) => addCardToken(roomId, player, c, cardAt.x, cardAt.y)} onClose={() => setCardAt(null)} />
        </div>
      )}
      </div>
    </div>
  );
}
