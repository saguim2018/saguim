"""오늘 본문의 웨슬리 관점 주해를 Gemini로 생성."""
from __future__ import annotations
import json
import os
import re

from google import genai
from google.genai import types

MODEL = "gemini-2.5-flash"
_FALLBACK_MODEL = "gemini-flash-lite-latest"

SYSTEM_PROMPT = """당신은 한국 성결교단(웨슬리 신학 전통)의 경건한 목회자이자 주석가입니다.
개인 경건 예배용으로 본문의 배경과 절별 주해를 작성합니다.
존 웨슬리의 주해(Explanatory Notes Upon the Old/New Testament)를 주요 참고 자료로 삼되,
한국 독자에게 자연스러운 현대 한국어로 씁니다.
개인 의견이나 사변적 해석은 배제하고, 본문에 충실한 주해를 제공합니다.
반드시 지정된 JSON 형식으로만 응답하세요."""

USER_PROMPT = """다음 본문에 대한 배경 설명과 절별 주해를 작성해주세요.

본문 참조: {passage_ref}

본문 (개역개정):
{bible_text}

작업:

1. 배경 설명 (background)
   - 정확히 3개의 bullet 항목
   - 각 bullet은 1문장, 50자 내외
   - 역사적·신학적·문학적 배경 중 가장 중요한 3가지

2. 절별 주해 (commentary)
   - 본문 중 핵심적이거나 특별히 주목할 절 3-4개 선정
   - 각 항목: {{"verse": 절번호, "title": "짧은 주제(10자 이내)", "note": "주해(60자 이내)"}}
   - 웨슬리의 해석 관점을 반영하되 학술적이지 않은 경건한 톤

응답 형식 (다른 설명 없이 이 JSON만):
{{
  "background": ["...", "...", "..."],
  "commentary": [
    {{"verse": 4, "title": "하나님의 기쁨", "note": "..."}},
    {{"verse": 5, "title": "침상에서의 찬양", "note": "..."}}
  ]
}}"""


def generate_commentary(passage_ref: str, bible_text_revised: list[dict]) -> dict:
    """본문 참조와 개역개정 절 배열을 받아서 주해 생성."""
    import time
    bible_lines = "\n".join(f"{v['v']} {v['text']}" for v in bible_text_revised)
    prompt = USER_PROMPT.format(passage_ref=passage_ref, bible_text=bible_lines)

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    delay = 30
    for model in [MODEL, _FALLBACK_MODEL]:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
                )
                if model != MODEL:
                    print(f"  [주해] 폴백 모델({model}) 사용")
                return _parse_json(response.text)
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
                    break  # try fallback model
                raise
    raise RuntimeError("모든 Gemini 모델 주해 생성 실패")


def _parse_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        return json.loads(m.group(0))
    raise ValueError(f"주해 JSON 파싱 실패: {text[:200]}")
