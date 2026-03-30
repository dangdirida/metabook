"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function OGQModal({ open, onClose, title, children, maxWidth = "max-w-md" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div ref={ref} className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-mono-080)]">
            <h2 className="text-lg font-bold text-[var(--color-mono-990)]">{title}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-[var(--color-mono-050)] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[var(--color-mono-500)]" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
