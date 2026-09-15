"use client";
import { updatePlayer, type Player } from "@/lib/rooms";
import { menuItemClass as item } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface Props {
  roomId: string;
  me: Player;
  onDevices: () => void;
}

/** Menu items for the local player's devices, mirror and rotate. */
export function CameraControls({ roomId, me, onDevices }: Props) {

  return (
    <>
      <button type="button" className={item} onClick={onDevices}>
        <Icon name="gear" /> Camera and mic devices…
      </button>
      <button
        type="button"
        className={`${item} ${me.video.mirror ? "text-accent" : ""}`}
        onClick={() => updatePlayer(roomId, me.uid, { video: { ...me.video, mirror: !me.video.mirror } })}
      >
        <Icon name="mirror" /> Mirror video
      </button>
      <button
        type="button"
        className={`${item} ${me.video.rotate === 180 ? "text-accent" : ""}`}
        onClick={() => updatePlayer(roomId, me.uid, { video: { ...me.video, rotate: me.video.rotate ? 0 : 180 } })}
      >
        <Icon name="rotate" /> Rotate video 180°
      </button>
    </>
  );
}
