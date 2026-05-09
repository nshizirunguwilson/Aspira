"use client";

import { useCallback, useEffect } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

export function Lightbox({
  urls,
  index,
  onClose,
  onNavigate,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const total = urls.length;

  const next = useCallback(
    () => onNavigate((index + 1) % total),
    [index, total, onNavigate],
  );
  const prev = useCallback(
    () => onNavigate((index - 1 + total) % total),
    [index, total, onNavigate],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [next, prev, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X size={18} />
      </button>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ArrowRight size={18} />
          </button>
        </>
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[index]}
        alt={`Attachment ${index + 1} of ${total}`}
        className="max-h-[90vh] max-w-[92vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {total > 1 ? (
        <p className="absolute bottom-6 text-xs text-white/70">
          {index + 1} / {total}
        </p>
      ) : null}
    </div>
  );
}
