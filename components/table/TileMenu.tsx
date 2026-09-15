"use client";
import { useRef, useState } from "react";
import { useClickOutside } from "@/lib/useClickOutside";
import { kickPlayer, setModeration, type Player, type Room } from "@/lib/rooms";
import { IconButton, menuItemClass as item } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CameraControls } from "./CameraControls";
import { DevicePicker } from "./DevicePicker";
import { ViewControls, type ViewFlips } from "./ViewControls";

interface Props {
  roomId: string;
  room: Room;
  player: Player;
  isMe: boolean;
  isHostViewer: boolean;
  view: ViewFlips;
  onView: (view: ViewFlips) => void;
}

/** The tile's ⋮ menu: my camera and mic, view flips for others, host moderation. */
export function TileMenu({ roomId, room, player, isMe, isHostViewer, view, onView }: Props) {
  const [open, setOpen] = useState<false | "menu" | "devices">(false);
  const mod = room.moderation?.[player.uid] ?? {};
  const ref = useRef<HTMLSpanElement>(null);
  const close = () => setOpen(false);
  useClickOutside(ref, !!open, close);

  function act(fn: () => Promise<unknown>) {
    close();
    fn();
  }

  return (
    <span ref={ref} className="relative">
      <IconButton title={isMe ? "Devices, mirror and rotate" : "Video options"} active={!!open} onClick={() => setOpen(open ? false : "menu")}>
        <Icon name="more" />
      </IconButton>
      {open === "devices" && (
        <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-line bg-panel p-1 shadow-xl">
          <DevicePicker onPick={close} />
        </div>
      )}
      {open === "menu" && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-line bg-panel p-1 shadow-xl">
          {isMe ? (
            <CameraControls roomId={roomId} me={player} onDevices={() => setOpen("devices")} />
          ) : (
            <ViewControls view={view} onChange={onView} />
          )}
          {isHostViewer && !isMe && (
            <>
              <div className="my-1 border-t border-line" />
              <button type="button" className={item} onClick={() => act(() => setModeration(roomId, room, player.uid, { muted: !mod.muted }))}>
                <Icon name={mod.muted ? "mic" : "mic-off"} /> {mod.muted ? "Unmute" : "Mute"}
              </button>
              <button type="button" className={item} onClick={() => act(() => setModeration(roomId, room, player.uid, { videoOff: !mod.videoOff }))}>
                <Icon name={mod.videoOff ? "camera" : "camera-off"} /> {mod.videoOff ? "Allow camera" : "Camera off"}
              </button>
              <button type="button" className={`${item} text-danger`} onClick={() => act(() => kickPlayer(roomId, room, player))}>
                <Icon name="kick" /> Remove from table
              </button>
            </>
          )}
        </div>
      )}
    </span>
  );
}
