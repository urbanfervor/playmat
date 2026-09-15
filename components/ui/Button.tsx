import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "default" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:brightness-110",
  default: "bg-panel-2 text-fg hover:bg-line",
  ghost: "text-muted hover:bg-panel-2 hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-control px-2.5 text-ui",
  md: "h-control-md px-3.5 text-sm",
};

const activeTone = "bg-accent/15 text-accent hover:bg-accent/25";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Toggle state: renders as pressed with the accent color. */
  active?: boolean;
}

export function Button({ variant = "default", size = "sm", active, className = "", ...props }: Props) {
  const tone = active ? activeTone : variants[variant];
  return <button type="button" className={`${base} ${tone} ${sizes[size]} ${className}`} {...props} />;
}

export const buttonClass = (variant: Variant = "default", size: Size = "sm") => `${base} ${variants[variant]} ${sizes[size]}`;

export const iconButtonClass = `${base} ${variants.ghost} h-control w-control`;

export function IconButton({ className = "", active, ...props }: Omit<Props, "variant" | "size">) {
  const tone = active ? activeTone : variants.ghost;
  return <button type="button" className={`${base} ${tone} h-control w-control ${className}`} {...props} />;
}

export const menuItemClass = "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-ui hover:bg-panel-2 disabled:opacity-50";
