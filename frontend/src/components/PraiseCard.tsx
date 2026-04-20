"use client";
import { useState } from "react";
import SectionHeader from "./SectionHeader";
import SheetMusicLightbox from "./SheetMusicLightbox";
import type { SongData } from "@/lib/types";

interface Props {
  step: number;
  label: string;
  song: SongData;
  guidance: string;
}

export default function PraiseCard({ step, label, song, guidance }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasLyrics = song.lyrics && Object.keys(song.lyrics).length > 0;

  const embedUrl = song.youtube?.embed_url
    ? `${song.youtube.embed_url}?rel=0&modestbranding=1`
    : null;

  const LYRIC_ORDER = ["1절", "2절", "3절", "후렴", "브릿지"];
  const lyricEntries = hasLyrics
    ? LYRIC_ORDER.filter((k) => song.lyrics[k]).map((k) => [k, song.lyrics[k]] as [string, string])
    : [];

  return (
    <section className="py-6 px-5" style={{ borderBottom: "0.5px solid var(--divider)" }}>
      <SectionHeader step={step} title={label} />
      <p className="font-serif text-[14.5px] leading-[1.85] mb-4" style={{ color: "var(--text-secondary)" }}>
        {guidance}
      </p>

      {/* Card */}
      <div className="rounded-[12px] overflow-hidden" style={{ background: "var(--bg-secondary)", border: "0.5px solid var(--divider)" }}>
        {/* Song title */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
          <div>
            <span
              className="inline-block font-ui text-[11px] font-medium px-2 py-0.5 rounded mr-2"
              style={{
                background: "var(--bg)",
                border: "0.5px solid var(--divider)",
                color: "var(--text-tertiary)",
                borderRadius: 4,
              }}
            >
              {song.number}번
            </span>
            <span className="font-serif text-[17px] font-medium" style={{ color: "var(--text)" }}>
              {song.title}
            </span>
          </div>
          <span className="font-ui text-[11px] shrink-0 mt-1" style={{ color: "var(--text-tertiary)" }}>
            {song.key} · {song.tempo}
          </span>
        </div>

        {/* YouTube embed */}
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={song.title}
            />
          </div>
        ) : (
          <div
            className="mx-4 mb-3 flex items-center justify-center rounded-lg h-28"
            style={{ background: "var(--bg)", border: "0.5px solid var(--divider)" }}
          >
            {song.youtube?.url ? (
              <a
                href={song.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui text-[13px]"
                style={{ color: "var(--accent)" }}
              >
                YouTube에서 보기 →
              </a>
            ) : (
              <span className="font-ui text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                영상을 찾지 못했습니다
              </span>
            )}
          </div>
        )}

        {/* Lyrics */}
        {lyricEntries.length > 0 && (
          <div className="px-4 pt-3 pb-1 space-y-3">
            {lyricEntries.map(([section, text]) => (
              <div key={section}>
                <span className="font-ui text-[11px] font-medium mr-2" style={{ color: "var(--text-tertiary)" }}>
                  {section}
                </span>
                <span className="font-serif text-[13.5px] leading-[1.9]" style={{ color: "var(--text-secondary)" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* First line (when no full lyrics) */}
        {!hasLyrics && song.first_line && (
          <div className="px-4 pb-3">
            <span className="font-ui text-[11px] font-medium mr-2" style={{ color: "var(--text-tertiary)" }}>
              첫 소절
            </span>
            <span className="font-serif text-[13.5px] leading-[1.9]" style={{ color: "var(--text-secondary)" }}>
              {song.first_line}…
            </span>
          </div>
        )}

        {/* Sheet music button */}
        {song.sheet_images.length > 0 && (
          <div className="px-4 pb-4 pt-2">
            <button
              onClick={() => setLightboxOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-ui text-[13px]"
              style={{
                background: "var(--bg)",
                color: "var(--text-secondary)",
                border: "0.5px solid var(--divider)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              악보 보기
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <SheetMusicLightbox
          images={song.sheet_images}
          songTitle={song.title}
          songNumber={song.number}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
}
