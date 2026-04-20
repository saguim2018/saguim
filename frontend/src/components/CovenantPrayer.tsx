"use client";
import { useState } from "react";
import SectionHeader from "./SectionHeader";

const PRAYER_KR = `주님, 오늘도 주님과의 언약 안에 삽니다.
이 예배의 시간이 하루를 새롭게 하는 힘이 되게 하시고,
주님의 사람으로 이 땅을 걸어가게 하옵소서.
예수 그리스도의 이름으로 기도합니다. 아멘.`;

const PRAYER_EN = `Lord, today I live within the covenant with you.
May this time of worship renew me for the day ahead,
and lead me to walk this earth as your person.
In the name of Jesus Christ I pray. Amen.`;

export default function CovenantPrayer() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-6 px-5 pb-12">
      <SectionHeader step={10} title="언약 기도문" />
      <p className="font-serif text-[14.5px] leading-[1.85] mb-3" style={{ color: "var(--text-secondary)" }}>
        주님과의 언약을 새롭게 하며 하루를 마무리합니다.
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
        <div className="mt-4 rounded-lg p-4" style={{ background: "var(--bg-secondary)" }}>
          {PRAYER_KR.split("\n").map((line, i) => {
            const enLine = PRAYER_EN.split("\n")[i] ?? "";
            return (
              <div key={i} className="mb-3">
                <p className="font-serif text-[14.5px] leading-[1.85]" style={{ color: "var(--text)" }}>
                  {line}
                </p>
                <p className="font-serif text-[13px] leading-[1.7] italic" style={{ color: "var(--text-tertiary)" }}>
                  {enLine}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
