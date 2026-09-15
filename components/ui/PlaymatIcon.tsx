// Rasterised favicon / app icon. Same two fanned cards as Logo, on a dark tile.
// Rendered by next/og (satori), which only supports flex layout and simple CSS.
export function PlaymatIcon({ size }: { size: number }) {
  const u = size / 24;
  const card = {
    position: "absolute" as const,
    width: 11 * u,
    height: 15 * u,
    borderRadius: 2 * u,
  };
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        position: "relative",
        background: "#1e1f22",
        borderRadius: size * 0.2,
      }}
    >
      <div style={{ ...card, left: 3 * u, top: 6 * u, background: "#d9a441", transform: "rotate(-10deg)" }} />
      <div style={{ ...card, left: 10 * u, top: 3 * u, background: "#dbdee1", transform: "rotate(10deg)" }} />
    </div>
  );
}
