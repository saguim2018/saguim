"use client";
import Link from "next/link";
import { prevDate, nextDate, formatDateKR } from "@/lib/dateUtils";

interface Props {
  date: string;
  todayDate: string;
}

export default function TopBar({ date, todayDate }: Props) {
  const { date: dateFmt, weekday } = formatDateKR(date);
  const prev = prevDate(date);
  const next = nextDate(date);
  const isToday = date === todayDate;

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4"
      style={{
        height: 52,
        background: "var(--topbar-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "0.5px solid var(--divider)",
      }}
    >
      <Link
        href={`/${prev}`}
        className="flex items-center justify-center w-9 h-9 rounded-lg"
        style={{ color: "var(--text-secondary)" }}
        aria-label="전날"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>

      <div className="flex flex-col items-center gap-0.5">
        <span className="font-serif text-base font-medium" style={{ color: "var(--text)" }}>
          {dateFmt}
        </span>
        <span className="font-ui text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {weekday}요일{isToday ? " · 오늘" : ""}
        </span>
      </div>

      {!isToday ? (
        <Link
          href={`/${next}`}
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ color: "var(--text-secondary)" }}
          aria-label="다음날"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      ) : (
        <div className="w-9 h-9" />
      )}
    </header>
  );
}
