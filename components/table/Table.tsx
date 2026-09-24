"use client";
import { useCallback, useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, useParticipants, useTracks } from "@livekit/components-react";
import { Track, VideoPresets, type RoomOptions } from "livekit-client";
import type { GameDefinition } from "@/games/types";
import type { Player, Room } from "@/lib/rooms";
import { useJoinAlerts } from "@/lib/joinAlerts";
import type { AppUser } from "@/lib/useUser";
import { viewerFor } from "@/lib/viewer";
import { postAsUser } from "@/lib/api";
import { SpectatorAlerts } from "./SpectatorAlerts";
import { PlayerTile } from "./PlayerTile";
import { EmptySeat } from "./EmptySeat";
import { Toolbar } from "./Toolbar";
import { SpectatorBar } from "./SpectatorBar";
import { Hotkeys } from "./Hotkeys";
import { Shortcuts } from "@/components/overlay/Shortcuts";
import { SidePanel, type SideTab } from "./SidePanel";
import { TableSettings } from "./TableSettings";
import { DeckDialog } from "@/components/deck/DeckDialog";
import { WinnerDialog } from "./WinnerDialog";
import { CardSearch } from "@/components/cards/CardSearch";
import { TopNav } from "@/components/nav/TopNav";

// Cards on a top-down feed need the pixels; 1080p where the camera allows it.
const roomOptions: RoomOptions = {
  videoCaptureDefaults: { resolution: VideoPresets.h1080.resolution },
  adaptiveStream: true,
  dynacast: true,
};

export interface TableProps {
  roomId: string;
  /** Signed-in user, seated or not. */
  uid: string;
  user: AppUser;
  game: GameDefinition;
  room: Room;
  players: Player[];
  /** Undefined while spectating. */
  me?: Player;
  onSitDown: () => void;
}

export function Table(props: TableProps) {
  const { roomId, uid, user, game, room, me } = props;
  const [token, setToken] = useState<string>();
  const [dialog, setDialog] = useState<"search" | "shortcuts" | "settings" | "deck" | "winner" | null>(null);
  const [tab, setTab] = useState<SideTab>("chat");
  /** The side panel, shown as a full-screen sheet on phones. */
  const [panel, setPanel] = useState(false);
  const openChat = useCallback(() => setTab("chat"), []);
  const openPanel = useCallback(() => setPanel(true), []);
  const closePanel = useCallback(() => setPanel(false), []);
  const openSearch = useCallback(() => setDialog("search"), []);
  const openShortcuts = useCallback(() => setDialog("shortcuts"), []);
  const openSettings = useCallback(() => setDialog("settings"), []);
  const openDeck = useCallback(() => setDialog("deck"), []);
  const openWinner = useCallback(() => setDialog("winner"), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const spectator = !me;
  const viewer = viewerFor(user, me);
  useJoinAlerts(room, props.players, me);

  // Publishing rights come with the token, so fetch a new one on sitting down or standing up.
  useEffect(() => {
    postAsUser("/api/livekit/token", { roomId, name: viewer.name, photoURL: viewer.photoURL })
      .then((r) => r.json())
      .then((b) => setToken(b.token));
  }, [roomId, uid, viewer.name, viewer.photoURL, spectator]);

  if (!token) return <div className="flex min-h-screen items-center justify-center text-muted">Connecting…</div>;

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      options={roomOptions}
      connect
      video={!spectator}
      audio={!spectator}
      className="flex h-dvh flex-col"
    >
      <RoomAudioRenderer />
      <TopNav roomId={roomId} title={room.name} isPrivate={room.private} />
      <div className="flex min-h-0 flex-1">
        <Grid {...props} />
        <SidePanel roomId={roomId} viewer={viewer} tab={tab} onTab={setTab} open={panel} onClose={closePanel} />
      </div>
      <SpectatorAlerts players={props.players} uid={uid} />
      {me ? (
        <>
          <Toolbar {...props} me={me} onSearch={openSearch} onShortcuts={openShortcuts} onSettings={openSettings} onDeck={openDeck} onWinner={openWinner} onPanel={openPanel} />
          <Hotkeys {...props} me={me} dialogOpen={dialog !== null} onSearch={openSearch} onShortcuts={openShortcuts} onChat={openChat} onClose={closeDialog} />
          {dialog === "search" && <CardSearch roomId={roomId} game={game} uid={me.uid} onClose={closeDialog} />}
          {dialog === "winner" && <WinnerDialog roomId={roomId} room={room} players={props.players} onClose={closeDialog} />}
          {dialog === "deck" && <DeckDialog roomId={roomId} game={game} room={room} me={me} onClose={closeDialog} />}
          {dialog === "settings" && <TableSettings roomId={roomId} game={game} room={room} players={props.players} onClose={closeDialog} />}
        </>
      ) : (
        <SpectatorBar {...props} onPanel={openPanel} />
      )}
      {dialog === "shortcuts" && <Shortcuts onClose={closeDialog} />}
    </LiveKitRoom>
  );
}

function Grid({ roomId, uid, game, room, players, me }: TableProps) {
  const tracks = useTracks([Track.Source.Camera]);
  const participants = useParticipants();
  const seats = room.seats ?? 4;
  const empty = Math.max(0, seats - players.length);
  return (
    <div className={`grid min-h-0 min-w-0 flex-1 auto-rows-max grid-cols-1 gap-ui overflow-y-auto p-ui md:auto-rows-fr md:grid-cols-2 md:overflow-hidden ${seats > 2 ? "md:grid-rows-2" : "md:grid-rows-1"}`}>
      {players.map((p, i) => (
        <PlayerTile
          key={p.uid}
          seat={i}
          roomId={roomId}
          game={game}
          room={room}
          player={p}
          players={players}
          isMe={p.uid === me?.uid}
          uid={uid}
          viewer={me}
          isHostViewer={me?.uid === room.hostUid}
          hasTurn={room.turn.playerUid === p.uid}
          participant={participants.find((x) => x.identity === p.uid)}
          track={tracks.find((t) => t.participant.identity === p.uid)}
        />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <EmptySeat key={i} />
      ))}
    </div>
  );
}
