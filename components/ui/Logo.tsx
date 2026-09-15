export function Logo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="6" width="11" height="15" rx="2" transform="rotate(-10 8.5 13.5)" className="fill-accent" />
      <rect x="10" y="3" width="11" height="15" rx="2" transform="rotate(10 15.5 10.5)" className="fill-fg" />
    </svg>
  );
}
