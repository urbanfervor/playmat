"use client";
import type { Identification } from "@/lib/identify";
import { useIsMobile } from "@/lib/useIsMobile";
import { safeImageUrl } from "@/lib/imageUrl";

interface Props {
  x: number;
  y: number;
  result: Identification | "loading" | "error" | "limited";
  onClose: () => void;
}

export function IdentifyPopover({ x, y, result, onClose }: Props) {
  const sheet = useIsMobile();
  return (
    <div
      className={`border-line bg-panel p-2 text-sm shadow-xl ${sheet ? "fixed inset-x-0 bottom-0 z-30 rounded-t-lg border-t" : "absolute z-10 w-56 rounded-lg border"}`}
      style={sheet ? undefined : { left: x, top: y }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {result === "loading" && <p className="text-muted">Identifying…</p>}
      {result === "error" && <p className="text-danger">Couldn’t identify. Try clicking closer to the card.</p>}
      {result === "limited" && <p className="text-muted">Too many lookups. Wait a minute and try again.</p>}
      {typeof result === "object" && (
        result.card ? (
          <>
            <img src={safeImageUrl(result.card.imageUrl)} alt={result.card.name} className="mx-auto max-h-[55dvh] rounded" />
            {result.card.text && <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-line text-xs text-muted">{result.card.text}</p>}
          </>
        ) : (
          <p className="text-muted">{result.name ? `No match for “${result.name}”.` : "No card found there."}</p>
        )
      )}
    </div>
  );
}
