const hues = ["#c97b4b", "#6b9bd1", "#8fbf7f", "#c95c7a", "#b89b4f", "#7f8fc9", "#5fb3a1", "#c98a5c"];

export function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return hues[h % hues.length];
}

interface Props {
  name: string;
  photoURL?: string | null;
  /** Pixel size. */
  size?: number;
  className?: string;
}

/** Google photo when there is one, else a coloured initial. */
export function Avatar({ name, photoURL, size = 24, className = "" }: Props) {
  const style = { width: size, height: size };
  if (photoURL) return <img src={photoURL} alt="" title={name} referrerPolicy="no-referrer" className={`shrink-0 rounded-full object-cover ${className}`} style={style} />;
  return (
    <span
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{ ...style, fontSize: size * 0.42, background: avatarColor(name) }}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}
