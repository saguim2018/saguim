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
        <Link
          href="/settings"
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ color: "var(--text-secondary)" }}
          aria-label="설정"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      )}
    </header>
  );
}
