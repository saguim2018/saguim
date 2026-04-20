"use client";
import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  images: string[];
  songTitle: string;
  songNumber: number;
  onClose: () => void;
}

export default function SheetMusicLightbox({ images, songTitle, songNumber, onClose }: Props) {
  const [page, setPage] = useState(0);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const lastTap = useRef<number>(0);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && page < images.length - 1) setPage(p => p + 1);
      if (dx > 0 && page > 0) setPage(p => p - 1);
    }
    touchStartX.current = null;
  }, [page, images.length]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setScale(s => s > 1 ? 1 : 2);
    }
    lastTap.current = now;
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div>
          <span className="font-ui text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {songNumber}번
          </span>
          <span className="font-serif text-[15px] font-medium ml-2" style={{ color: "rgba(255,255,255,0.9)" }}>
            {songTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {scale !== 1 && (
            <span className="font-ui text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {scale.toFixed(1)}×
            </span>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center"
            style={{ color: "rgba(255,255,255,0.7)" }}
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[page]}
          alt={`${songTitle} 악보 ${page + 1}페이지`}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 0.2s",
            background: "#FAF7F0",
            borderRadius: 4,
          }}
          draggable={false}
        />
      </div>

      {/* Page indicator */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 shrink-0">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="rounded-full transition-all"
              style={{
                width: i === page ? 20 : 6,
                height: 6,
                background: i === page ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
              }}
              aria-label={`${i + 1}페이지`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
