import type { InputHTMLAttributes } from "react";

export const inputClass =
  "h-control-md w-full rounded-md border border-line bg-bg px-2.5 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}
