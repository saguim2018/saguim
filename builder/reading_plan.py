"""오늘의 본문 참조를 반환. 매일성경(성서유니온) 웹 스크래핑."""
from __future__ import annotations
import re
import warnings
from datetime import date

import requests
from bs4 import BeautifulSoup

DAILY_URL = "https://sum.su.or.kr:8888/bible/today"


class ReadingPlanError(Exception):
    pass


def get_passage_ref(target: date) -> str:
    """주어진 날짜의 본문 참조 반환. 매일성경 사이트에서 스크래핑."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            resp = requests.get(DAILY_URL, verify=False, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise ReadingPlanError(f"매일성경 사이트 접속 실패: {e}") from e

    passage, page_date = _parse_page(resp.text)

    if page_date and page_date != target:
        raise ReadingPlanError(
            f"사이트 날짜({page_date})와 빌드 대상 날짜({target})가 다릅니다. "
            f"해당 날짜({target})에 빌드를 실행하세요."
        )

    return passage


def _parse_page(html: str) -> tuple[str, date | None]:
    """(본문참조, 사이트날짜) 파싱. 날짜 파싱 실패 시 날짜=None."""
    soup = BeautifulSoup(html, "html.parser")
    texts = [t.strip() for t in soup.stripped_strings if t.strip()]

    page_date: date | None = None
    passage: str | None = None

    for text in texts:
        # 날짜: '매일성경  2026.04.20 (월)'
        if not page_date and "매일성경" in text:
            dm = re.search(r"(\d{4})\.(\d{2})\.(\d{2})", text)
            if dm:
                try:
                    page_date = date(int(dm.group(1)), int(dm.group(2)), int(dm.group(3)))
                except ValueError:
                    pass

        # 본문: '본문 : 창세기(Genesis) 27:30 - 27:46 찬송가 282장'
        if not passage:
            m = re.search(
                r"본문\s*:\s*([가-힣]+)\([A-Za-z ]+\)\s*(\d+):(\d+)\s*[-~]\s*\d+:(\d+)",
                text,
            )
            if m:
                book = m.group(1)
                ch = m.group(2)
                start = m.group(3)
                end = m.group(4)
                passage = f"{book} {ch}:{start}-{end}"

        if passage and page_date:
            break

    if not passage:
        raise ReadingPlanError(
            "본문 참조를 파싱할 수 없습니다. 사이트 HTML 구조가 변경됐을 수 있습니다."
        )

    return passage, page_date
