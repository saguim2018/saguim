"""빌더 메인 엔트리.

사용:
  python -m builder.main                   # 오늘 (KST) 기준 빌드
  python -m builder.main --date 2026-04-20 # 특정 날짜 빌드
  python -m builder.main --dry-run         # 실제 쓰지 않고 출력만
"""
from __future__ import annotations
import argparse
import json
import sys
import traceback
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from . import bible_fetcher, commentary, youtube_search
from .reading_plan import ReadingPlan
from .song_picker import SongPicker
from .history import History

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
READING_PLAN = DATA_DIR / "reading_plan.yaml"
SONGBOOK = DATA_DIR / "songbook_tagged.json"
HISTORY_FILE = DATA_DIR / "history.json"
OUT_DIR = DATA_DIR / "daily"

KST = timezone(timedelta(hours=9))


def today_kst() -> date:
    return datetime.now(KST).date()


def _sheet_image_paths(song: dict) -> list[str]:
    """다중 페이지 악보는 모든 페이지를 반환. song-{번호}-p1.webp, song-{번호}-p2.webp ..."""
    num = song["number"]
    page_count = len(song.get("pages") or [])
    if page_count <= 1:
        return [f"/sheets/song-{num}.webp"]
    return [f"/sheets/song-{num}-p{i + 1}.webp" for i in range(page_count)]


def build(target: date, dry_run: bool = False) -> dict:
    print(f"[빌드 시작] {target.isoformat()} (KST)")

    plan = ReadingPlan(READING_PLAN)
    picker = SongPicker(SONGBOOK)
    hist = History(HISTORY_FILE)

    passage_ref = plan.get_passage_ref(target)
    print(f"  본문: {passage_ref}")

    print("  성경 본문 가져오는 중...")
    bible = bible_fetcher.fetch_both_versions(passage_ref)

    print("  웨슬리 주해 생성 중...")
    wesley = commentary.generate_commentary(passage_ref, bible["revised"])

    print("  찬양 선곡 중...")
    recent = hist.get_recent(target, days=5)
    print(f"    최근 5일 제외: {recent}")
    picks = picker.pick_two(passage_ref, bible["revised"], recent_numbers=recent)
    print(f"    선곡: {picks['thanks']['number']} ({picks['thanks']['title']}) + "
          f"{picks['response']['number']} ({picks['response']['title']}) [테마: {picks['passage_theme']}]")

    print("  유튜브 링크 검색 중...")
    thanks_yt = youtube_search.search_worship_video(
        picks["thanks"]["title"], picks["thanks"].get("first_line"))
    response_yt = youtube_search.search_worship_video(
        picks["response"]["title"], picks["response"].get("first_line"))

    result = {
        "date": target.isoformat(),
        "passage": {
            "ref": passage_ref,
            "theme": picks["passage_theme"],
        },
        "bible": bible,
        "wesley": wesley,
        "praise_thanks": {
            **{k: v for k, v in picks["thanks"].items() if k != "pages"},
            "youtube": thanks_yt,
            "sheet_images": _sheet_image_paths(picks["thanks"]),
        },
        "praise_response": {
            **{k: v for k, v in picks["response"].items() if k != "pages"},
            "youtube": response_yt,
            "sheet_images": _sheet_image_paths(picks["response"]),
        },
        "built_at": datetime.now(KST).isoformat(),
    }

    if dry_run:
        print("\n[DRY RUN] 결과 미리보기:")
        print(json.dumps(result, ensure_ascii=False, indent=2)[:1500] + "...")
        return result

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"{target.isoformat()}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"  저장됨: {out_path}")

    hist.record(target, [picks["thanks"]["number"], picks["response"]["number"]])
    print(f"  히스토리 업데이트")

    print(f"[빌드 완료] {target.isoformat()}")
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", type=str, default=None,
                        help="YYYY-MM-DD (없으면 오늘 KST)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    target = date.fromisoformat(args.date) if args.date else today_kst()

    try:
        build(target, dry_run=args.dry_run)
    except Exception as e:
        print(f"\n[에러] {type(e).__name__}: {e}", file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
