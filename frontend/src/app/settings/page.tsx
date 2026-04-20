"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TEMPO_OPTIONS = [
  { key: "slow", label: "묵상", desc: "찬송가 · 3박자" },
  { key: "medium", label: "CCM", desc: "A · B 템포" },
  { key: "fast", label: "신나는", desc: "C · 축복송" },
] as const;

type TempoKey = (typeof TEMPO_OPTIONS)[number]["key"];
const STORAGE_KEY = "allowedTempos";

function loadTempos(): TempoKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as TempoKey[];
    }
  } catch {}
  return ["slow"];
}

export default function SettingsPage() {
  const [selected, setSelected] = useState<Set<TempoKey>>(new Set(["slow"]));

  useEffect(() => {
    setSelected(new Set(loadTempos()));
  }, []);

  function toggle(key: TempoKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev; // 최소 1개 유지
        next.delete(key);
      } else {
        next.add(key);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-50 flex items-center px-4 gap-3"
        style={{
          height: 52,
          background: "var(--topbar-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "0.5px solid var(--divider)",
        }}
      >
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ color: "var(--text-secondary)" }}
          aria-label="뒤로"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className="font-ui text-base font-medium" style={{ color: "var(--text)" }}>설정</span>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <section>
          <h2 className="font-ui text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-tertiary)" }}>
            찬양 템포
          </h2>
          <p className="font-ui text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            선곡 풀에 포함할 템포 카테고리를 선택하세요. 최소 1개 이상 선택해야 합니다.
          </p>
          <div className="space-y-2">
            {TEMPO_OPTIONS.map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                style={{
                  background: "var(--card-bg)",
                  border: selected.has(key) ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(key)}
                  onChange={() => toggle(key)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <div className="flex-1">
                  <span className="font-ui text-sm font-medium" style={{ color: "var(--text)" }}>
                    {label}
                  </span>
                  <span className="font-ui text-xs ml-2" style={{ color: "var(--text-tertiary)" }}>
                    {desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
          <p className="font-ui text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>
            * 설정은 이 기기에 저장됩니다. 실제 선곡은 매일 빌드 시 반영됩니다.
          </p>
        </section>
      </main>
    </div>
  );
}
