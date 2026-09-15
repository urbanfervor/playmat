/** Geometry for mapping between the tile's pixels and the raw camera frame (0..1). */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Where an object-contain video actually paints inside its container. Falls back to the whole container. */
export function frameRect(container: DOMRect, video: HTMLVideoElement | null): Rect {
  const vw = video?.videoWidth ?? 0;
  const vh = video?.videoHeight ?? 0;
  if (!vw || !vh) return { left: 0, top: 0, width: container.width, height: container.height };
  const scale = Math.min(container.width / vw, container.height / vh);
  const width = vw * scale;
  const height = vh * scale;
  return { left: (container.width - width) / 2, top: (container.height - height) / 2, width, height };
}

/** Mirror and 180° rotation are their own inverses, so one function maps both ways. */
export function flip(x: number, y: number, mirror: boolean, rotate: 0 | 180): { x: number; y: number } {
  if (mirror) x = 1 - x;
  if (rotate === 180) {
    x = 1 - x;
    y = 1 - y;
  }
  return { x, y };
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Pixel position inside the container → normalized raw-frame coordinates. */
export function toFrame(px: number, py: number, rect: Rect, mirror: boolean, rotate: 0 | 180) {
  const p = flip((px - rect.left) / rect.width, (py - rect.top) / rect.height, mirror, rotate);
  return { x: clamp01(p.x), y: clamp01(p.y) };
}

/** Normalized raw-frame coordinates → pixel position inside the container. */
export function fromFrame(x: number, y: number, rect: Rect, mirror: boolean, rotate: 0 | 180) {
  const p = flip(x, y, mirror, rotate);
  return { left: rect.left + p.x * rect.width, top: rect.top + p.y * rect.height };
}
