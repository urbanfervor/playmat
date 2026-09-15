import type { SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "sm" | "md";
}

export function Select({ className = "", size = "md", children, ...props }: Props) {
  const h = size === "sm" ? "h-control pl-2 pr-6 text-ui" : "h-control-md pl-2.5 pr-7 text-sm";
  return (
    <span className={`relative inline-flex ${className}`}>
      <select
        className={`w-full appearance-none rounded-md border border-line bg-bg text-fg focus:border-accent focus:outline-none ${h}`}
        {...props}
      >
        {children}
      </select>
      <Icon name="chevron-down" size={14} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted" />
    </span>
  );
}
