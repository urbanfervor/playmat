/** Decorative animated backdrop for the lobby. Purely CSS-driven; see app/fantasy-bg.css. */
export function FantasyBackground() {
  return (
    <div className="fantasy-bg" aria-hidden>
      <div className="fantasy-bg__aurora" />
      <div className="fantasy-bg__stars fantasy-bg__stars--far" />
      <div className="fantasy-bg__stars fantasy-bg__stars--mid" />
      <div className="fantasy-bg__stars fantasy-bg__stars--near" />
      <div className="fantasy-bg__ring" />
      <div className="fantasy-bg__comet" />
      <div className="fantasy-bg__grain" />
      <div className="fantasy-bg__vignette" />
    </div>
  );
}
