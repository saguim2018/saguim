"use client";
import { useState } from "react";
import SectionHeader from "./SectionHeader";
import type { Wesley } from "@/lib/types";

interface Props {
  wesley: Wesley;
  passageRef: string;
}

export default function CollapsibleCommentary({ wesley, passageRef }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-6 px-5" style={{ borderBottom: "0.5px solid var(--divider)" }}>
      <SectionHeader step={6} title="말씀 묵상" />
      <p className="font-serif text-[14.5px] leading-[1.85] mb-3" style={{ color: "var(--text-secondary)" }}>
        {passageRef} 본문의 배경과 핵심 절을 묵상합니다.
      </p>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-ui text-[13px]"
        style={{
          background: "var(--bg-secondary)",
          color: "var(--text-secondary)",
          border: "none",
        }}
      >
        <span>{open ? "접기" : "펼치기"}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          {/* Background */}
          <div>
            <h3 className="font-ui text-[12px] font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
              배경
            </h3>
            <ul className="space-y-1.5">
              {wesley.background.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-ui text-[12px] mt-1 shrink-0" style={{ color: "var(--text-tertiary)" }}>•</span>
                  <p className="font-serif text-[14px] leading-[1.8]" style={{ color: "var(--text-secondary)" }}>
                    {line}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Verse commentary */}
          <div>
            <h3 className="font-ui text-[12px] font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
              절별 주해
            </h3>
            <div className="space-y-3">
              {wesley.commentary.map((item, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: "var(--bg-secondary)" }}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-ui text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {item.verse}절
                    </span>
                    <span className="font-ui text-[13px] font-medium" style={{ color: "var(--text)" }}>
                      {item.title}
                    </span>
                  </div>
                  <p className="font-serif text-[13.5px] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
