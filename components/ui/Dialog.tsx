"use client";

interface Props {
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Dialog({ onClose, className = "", children }: Props) {
  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center bg-black/60 p-4 pt-10 sm:p-6 sm:pt-16" onClick={onClose}>
      <div
        className={`flex max-h-full w-full flex-col gap-3 rounded-lg border border-line bg-panel p-3 shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
