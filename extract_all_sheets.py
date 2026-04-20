"""495곡 악보를 모두 WebP로 추출. 한 번만 돌리면 됨.

다중 페이지 곡은 page당 별도 파일:
  - 단일 페이지: song-122.webp
  - 다중 페이지: song-312-p1.webp, song-312-p2.webp, song-312-p3.webp

필요 도구:
  - PyMuPDF: pip install pymupdf (PDF 페이지 래스터화)
  - Pillow: pip install Pillow (리사이즈 + WebP 변환)

용량: 약 70-80MB (495곡, WebP 85%, 폭 1200px)
"""
from __future__ import annotations
import json
import time
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

PDF_PATH = Path(__file__).resolve().parent.parent / "사귐_악보집_3_0.pdf"
INDEX_PATH = Path("data/songbook_tagged.json")
OUT_DIR = Path("frontend/public/sheets")

DPI = 180
WEBP_QUALITY = 85
TARGET_WIDTH = 1200


def render_page_to_webp(doc: fitz.Document, page_num: int, out_path: Path, matrix: fitz.Matrix) -> None:
    """PyMuPDF로 래스터화 → Pillow로 리사이즈 + WebP 변환."""
    page = doc.load_page(page_num - 1)  # fitz is 0-indexed
    pix = page.get_pixmap(matrix=matrix, alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)

    if img.width > TARGET_WIDTH:
        ratio = TARGET_WIDTH / img.width
        new_size = (TARGET_WIDTH, int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)


def main():
    with open(INDEX_PATH, encoding="utf-8") as f:
        data = json.load(f)

    songs = data["songs"]
    total_pages = 0
    skipped = 0
    errors = []

    doc = fitz.open(PDF_PATH)
    zoom = DPI / 72.0
    matrix = fitz.Matrix(zoom, zoom)

    t0 = time.time()
    try:
        for i, (num_str, song) in enumerate(sorted(songs.items(), key=lambda kv: int(kv[0])), 1):
            pages = song.get("pages") or []
            if not pages:
                skipped += 1
                continue

            num = song["number"]
            is_multi = len(pages) > 1

            for idx, pdf_page in enumerate(pages, 1):
                if is_multi:
                    out_name = f"song-{num}-p{idx}.webp"
                else:
                    out_name = f"song-{num}.webp"
                out_path = OUT_DIR / out_name

                if out_path.exists():
                    continue

                try:
                    render_page_to_webp(doc, pdf_page, out_path, matrix)
                    total_pages += 1
                except Exception as e:
                    errors.append((num, pdf_page, str(e)))
                    print(f"  [실패] {num}번 p.{pdf_page}: {e}")

            if i % 50 == 0:
                elapsed = time.time() - t0
                print(f"  진행: {i}/{len(songs)} ({elapsed:.1f}s 경과)")
    finally:
        doc.close()

    elapsed = time.time() - t0
    total_size = sum(f.stat().st_size for f in OUT_DIR.glob("*.webp"))
    print(f"\n완료 ({elapsed:.1f}s)")
    print(f"  추출된 페이지: {total_pages}개")
    print(f"  페이지 없는 곡: {skipped}개")
    print(f"  에러: {len(errors)}개")
    print(f"  총 용량: {total_size / 1024 / 1024:.1f} MB")
    print(f"  저장 위치: {OUT_DIR.absolute()}")

    if errors:
        print("\n실패 목록:")
        for num, page, err in errors:
            print(f"  {num}번 (page {page}): {err}")


if __name__ == "__main__":
    main()
