"use client";
import { useState } from "react";
import SectionHeader from "./SectionHeader";
import type { VerseData } from "@/lib/types";

interface Props {
  bible: { ref: string; revised: VerseData[]; modern: VerseData[] };
}

function VerseList({ verses }: { verses: VerseData[] }) {
  return (
    <div className="space-y-[0.6em]">
      {verses.map((v) => (
        <p key={v.v} className="font-serif text-[14.5px] leading-[1.9]" style={{ color: "var(--text)" }}>
          <sup className="verse-number">{v.v}</sup>
          {v.text}
        </p>
      ))}
    </div>
  );
}

export default function BibleSlidingSheet({ bible }: Props) {
  const [active, setActive] = useState<"revised" | "modern">("revised");

  return (
    <section className="py-6 px-5" style={{ borderBottom: "0.5px solid var(--divider)" }}>
      <SectionHeader step={5} title="오늘의 말씀" />

      {/* Version tabs */}
      <div
        className="flex mb-4 rounded-lg overflow-hidden"
        style={{ border: "0.5px solid var(--divider)", background: "var(--bg-secondary)" }}
      >
        {(["revised", "modern"] as const).map((v) => {
          const label = v === "revised" ? "개역개정" : "현대인의 성경";
          const isActive = active === v;
          return (
            <button
              key={v}
              onClick={() => setActive(v)}
              className="flex-1 py-2 text-[13px] font-ui font-medium transition-colors"
              style={{
                color: isActive ? "var(--text)" : "var(--text-tertiary)",
                background: isActive ? "var(--bg)" : "transparent",
                borderRadius: isActive ? 6 : 0,
                margin: isActive ? 2 : 0,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mb-2">
        <span className="font-ui text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          {bible.ref}
        </span>
      </div>

      <VerseList verses={active === "revised" ? bible.revised : bible.modern} />
    </section>
  );
}
