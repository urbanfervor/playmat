import { ImageResponse } from "next/og";
import { PlaymatIcon } from "@/components/ui/PlaymatIcon";

export const alt = "Playmat: play any physical card game over webcam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 48,
          padding: 72,
          background: "#1e1f22",
          color: "#dbdee1",
        }}
      >
        <PlaymatIcon size={220} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 108, fontWeight: 700, letterSpacing: -3 }}>Playmat</div>
          <div style={{ fontSize: 36, color: "#949ba4" }}>Play any physical card game over webcam.</div>
          <div style={{ fontSize: 32, color: "#d9a441", marginTop: 12 }}>Magic · Star Wars: Unlimited</div>
        </div>
      </div>
    ),
    size,
  );
}
