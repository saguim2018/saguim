"""오늘의 찬양 2곡을 선곡한다.
  - 곡1(감사): primary_theme == '감사'
  - 곡2(결단): 오늘 본문의 주제에 맞는 곡

두 곡 모두 최근 5일간 선택된 곡에서 제외.
"""
from __future__ import annotations
import json
import os
import random
from pathlib import Path

from google import genai

THEMES = ["감사", "회개", "경배", "임재/성령", "구원/십자가", "사랑/은혜",
          "소망", "결단/헌신", "선교/전도", "고백/신앙", "위로/인도", "축복"]


class SongPicker:
    def __init__(self, songbook_path: Path, seed: int | None = None):
        with open(songbook_path, encoding="utf-8") as f:
            self.songbook = json.load(f)["songs"]
        self.rng = random.Random(seed)

    def pick_two(self, passage_ref: str, bible_text: list[dict],
                  recent_numbers: list[int]) -> dict:
        """감사 1곡 + 본문 테마 1곡 선택."""
        passage_theme = self._classify_passage(passage_ref, bible_text)

        excluded = set(recent_numbers)
        thanks_song = self._pick_by_theme("감사", excluded)
        excluded.add(thanks_song["number"])
        response_song = self._pick_by_theme(passage_theme, excluded,
                                              fallback_themes=["결단/헌신", "경배"])

        return {
            "passage_theme": passage_theme,
            "thanks": thanks_song,
            "response": response_song,
        }

    def _pick_by_theme(self, theme: str, excluded: set[int],
                        fallback_themes: list[str] | None = None) -> dict:
        """primary_theme 매칭 → 없으면 secondary → 없으면 fallback_themes."""
        primary_matches = [s for s in self.songbook.values()
                           if s.get("primary_theme") == theme
                           and s["number"] not in excluded
                           and s.get("pages")]
        if primary_matches:
            return self.rng.choice(primary_matches)

        secondary_matches = [s for s in self.songbook.values()
                             if theme in (s.get("secondary_themes") or [])
                             and s["number"] not in excluded
                             and s.get("pages")]
        if secondary_matches:
            return self.rng.choice(secondary_matches)

        if fallback_themes:
            for fb in fallback_themes:
                fb_matches = [s for s in self.songbook.values()
                              if s.get("primary_theme") == fb
                              and s["number"] not in excluded
                              and s.get("pages")]
                if fb_matches:
                    return self.rng.choice(fb_matches)

        raise ValueError(f"테마 '{theme}'에 매칭되는 곡이 없음 (최근 제외 후)")

    def _classify_passage(self, passage_ref: str, bible_text: list[dict]) -> str:
        """본문을 Gemini에게 보여주고 12개 테마 중 가장 가까운 것 선택."""
        lines = "\n".join(f"{v['v']} {v['text']}" for v in bible_text)
        prompt = f"""다음 성경 본문의 핵심 주제를 하나의 카테고리로 분류해주세요.

본문 참조: {passage_ref}

본문:
{lines}

카테고리 (이 중 하나만 선택):
{', '.join(THEMES)}

규칙:
- 본문의 응답 찬양 선곡용이므로, 본문 전체를 묵상한 후 드릴 응답(찬양)에 가장 맞는 테마를 선택
- 오직 카테고리 이름 하나만 응답 (설명 없이)
"""
        import time
        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        response = None
        for model in ["gemini-2.5-flash", "gemini-flash-lite-latest"]:
            delay = 30
            for attempt in range(3):
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=prompt,
                    )
                    break
                except Exception as e:
                    err = str(e)
                    is_transient = any(x in err for x in ("503", "UNAVAILABLE", "500"))
                    is_quota = any(x in err for x in ("429", "RESOURCE_EXHAUSTED"))
                    if is_transient and attempt < 2:
                        print(f"  [Gemini {err[:20]}] {delay}s 대기 후 재시도 ({attempt+1}/3)...")
                        time.sleep(delay)
                        delay = min(delay * 2, 120)
                        continue
                    if is_quota or (is_transient and attempt == 2):
                        break  # try next model
                    raise
            if response is not None:
                break
        if response is None:
            return "결단/헌신"
        text = response.text.strip().strip("'\"` \n")
        if text not in THEMES:
            for t in THEMES:
                if t in text:
                    return t
            return "결단/헌신"
        return text
