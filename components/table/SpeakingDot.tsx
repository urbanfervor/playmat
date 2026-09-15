"use client";
/** Dot while the participant is talking. */
export function SpeakingDot({ speaking }: { speaking: boolean }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${speaking ? "bg-live" : "bg-transparent"}`} title={speaking ? "Speaking" : undefined} />;
}
