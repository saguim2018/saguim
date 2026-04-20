"""개역개정과 현대인의 성경 본문을 가져온다.

소스: holybible.or.kr (대한성서공회 허가 사용)
- 개역개정: B_GAE
- 현대인의 성경: B_HYD

정책 주의:
  대한성서공회의 저작물은 개인 사용 범위 내에서만 사용. 
  공공 배포시 별도 허가 필요.
"""
from __future__ import annotations
import re
import time
from dataclasses import dataclass

import requests
from bs4 import BeautifulSoup

BOOK_CODES = {
    "창세기": 1, "출애굽기": 2, "레위기": 3, "민수기": 4, "신명기": 5,
    "여호수아": 6, "사사기": 7, "룻기": 8,
    "사무엘상": 9, "사무엘하": 10,
    "열왕기상": 11, "열왕기하": 12,
    "역대상": 13, "역대하": 14,
    "에스라": 15, "느헤미야": 16, "에스더": 17,
    "욥기": 18, "시편": 19, "잠언": 20,
    "전도서": 21, "아가": 22,
    "이사야": 23, "예레미야": 24, "예레미야애가": 25,
    "에스겔": 26, "다니엘": 27,
    "호세아": 28, "요엘": 29, "아모스": 30, "오바댜": 31,
    "요나": 32, "미가": 33, "나훔": 34, "하박국": 35,
    "스바냐": 36, "학개": 37, "스가랴": 38, "말라기": 39,
    "마태복음": 40, "마가복음": 41, "누가복음": 42, "요한복음": 43,
    "사도행전": 44,
    "로마서": 45, "고린도전서": 46, "고린도후서": 47,
    "갈라디아서": 48, "에베소서": 49, "빌립보서": 50, "골로새서": 51,
    "데살로니가전서": 52, "데살로니가후서": 53,
    "디모데전서": 54, "디모데후서": 55, "디도서": 56, "빌레몬서": 57,
    "히브리서": 58, "야고보서": 59,
    "베드로전서": 60, "베드로후서": 61,
    "요한일서": 62, "요한이서": 63, "요한삼서": 64,
    "유다서": 65, "요한계시록": 66,
}

VERSIONS = {
    "revised": {"code": "GAE", "name": "개역개정"},
    "modern":  {"code": "HDB", "name": "현대인의 성경"},
}


@dataclass
class PassageRef:
    book: str
    chapter: int
    verse_start: int
    verse_end: int

    @classmethod
    def parse(cls, ref: str) -> "PassageRef":
        """'시편 149:1-9' 또는 '잠언 1:20-33' 파싱"""
        m = re.match(r"^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$", ref.strip())
        if not m:
            raise ValueError(f"본문 참조 파싱 실패: {ref}")
        book = m.group(1).strip()
        chapter = int(m.group(2))
        v_start = int(m.group(3))
        v_end = int(m.group(4) or v_start)
        return cls(book=book, chapter=chapter, verse_start=v_start, verse_end=v_end)


def fetch_passage(ref: PassageRef, version: str = "revised",
                   timeout: int = 10) -> list[dict]:
    """특정 버전으로 본문을 가져와 [{v: 1, text: '...'}, ...] 반환."""
    if version not in VERSIONS:
        raise ValueError(f"지원하지 않는 버전: {version}")
    book_num = BOOK_CODES.get(ref.book)
    if not book_num:
        raise ValueError(f"성경 책 이름 인식 실패: {ref.book}")

    vr = VERSIONS[version]["code"]
    url = (f"http://www.holybible.or.kr/B_{vr}/cgi/bibleftxt.php"
           f"?VR={vr}&VL={book_num}&CN={ref.chapter}&CV=99")

    headers = {
        "User-Agent": "Mozilla/5.0 (haru-liturgy personal devotional builder)",
        "Accept-Language": "ko-KR,ko;q=0.9",
    }
    resp = requests.get(url, headers=headers, timeout=timeout)
    resp.raise_for_status()
    html_text = resp.content.decode("euc-kr", errors="replace")

    verses = _parse_verses(html_text)
    selected = [v for v in verses
                if ref.verse_start <= v["v"] <= ref.verse_end]
    if not selected:
        raise ValueError(f"{ref.book} {ref.chapter}장에서 절 {ref.verse_start}-{ref.verse_end} 찾지 못함")
    return selected


def _parse_verses(html: str) -> list[dict]:
    """holybible.or.kr 페이지에서 절 번호와 본문 추출.

    구조: <ol start=N> 안에 <li><font class=tk4l>본문</font> 패턴.
    본문 내 사전 링크(<a href="javascript:openDict(...)">단어</a>)는 get_text()로 자동 제거.
    """
    soup = BeautifulSoup(html, "html.parser")
    results = []
    for ol in soup.find_all("ol"):
        try:
            verse_num = int(ol.get("start", "0"))
        except (ValueError, TypeError):
            continue
        if verse_num == 0:
            continue
        for li in ol.find_all("li"):
            font = li.find("font", class_="tk4l")
            raw = (font if font else li).get_text("", strip=False)
            text = re.sub(r"\s+", " ", raw).strip()
            if text:
                results.append({"v": verse_num, "text": text})
            verse_num += 1
    return sorted(results, key=lambda x: x["v"])


def fetch_both_versions(ref_str: str, sleep: float = 0.5) -> dict:
    """'시편 149:1-9' 하나로 두 버전 동시에 받기."""
    ref = PassageRef.parse(ref_str)
    out = {"ref": ref_str}
    for version_key in ("revised", "modern"):
        out[version_key] = fetch_passage(ref, version=version_key)
        time.sleep(sleep)
    return out


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("사용법: python -m builder.bible_fetcher '시편 149:1-9'")
        sys.exit(1)
    ref_str = sys.argv[1]
    result = fetch_both_versions(ref_str)
    print(f"\n=== {result['ref']} ===")
    print("\n[개역개정]")
    for v in result["revised"]:
        print(f"  {v['v']} {v['text']}")
    print("\n[현대인의 성경]")
    for v in result["modern"]:
        print(f"  {v['v']} {v['text']}")
