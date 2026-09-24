import type { CardSummary } from "@/games/types";
import { postAsUser } from "./api";

export interface Identification {
  name: string;
  card: CardSummary | null;
}

/**
 * Grabs the frame under a click on a video element, crops around the click,
 * and returns it as a base64 JPEG. Handles object-contain letterboxing and the
 * mirror/rotate CSS transform applied to the element.
 */
export function cropAtClick(
  video: HTMLVideoElement,
  clientX: number,
  clientY: number,
  mirror: boolean,
  rotate: 0 | 180,
): string | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const rect = video.getBoundingClientRect();
  let ex = clientX - rect.left;
  let ey = clientY - rect.top;
  if (mirror) ex = rect.width - ex;
  if (rotate === 180) {
    ex = rect.width - ex;
    ey = rect.height - ey;
  }

  const scale = Math.min(rect.width / vw, rect.height / vh);
  const offsetX = (rect.width - vw * scale) / 2;
  const offsetY = (rect.height - vh * scale) / 2;
  const sx = (ex - offsetX) / scale;
  const sy = (ey - offsetY) / scale;

  // A card in a top-down feed is roughly a quarter of the frame width.
  const w = Math.round(vw * 0.28);
  const h = Math.round(w * 1.4);
  const x = Math.max(0, Math.min(vw - w, Math.round(sx - w / 2)));
  const y = Math.max(0, Math.min(vh - h, Math.round(sy - h / 2)));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(video, x, y, w, h, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

export async function identifyCard(game: string, image: string): Promise<Identification> {
  const res = await postAsUser("/api/identify", { game, image });
  if (!res.ok) throw new Error(`identify ${res.status}`);
  return res.json();
}
