interface Props {
  label: string;
  /** One short line under the label. */
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** A checkbox with its label and hint stacked beside it, so the text wraps under itself rather than around the box. */
export function Checkbox({ label, hint, checked, onChange }: Props) {
  return (
    <label className="flex items-start gap-2.5">
      <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-accent" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="flex flex-col">
        <span className="text-sm leading-5 text-fg">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}
