"""유튜브에서 '피아워십 [곡명]' 검색 후 최적 링크 반환.

우선순위:
  1. 채널명에 '피아워십' 포함된 영상
  2. 검색 결과 상위 3개 중 조회수 가장 많은 것
  3. 실패시 None (프론트에서는 검색 URL로 폴백)

필요 환경변수: YOUTUBE_API_KEY (Google Cloud Console에서 발급, 무료 할당량 충분)
"""
from __future__ import annotations
import os
import urllib.parse

import requests

API_KEY = os.environ.get("YOUTUBE_API_KEY")
SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
PREFERRED_CHANNELS = ["피아워십", "PiaWorship", "pia worship"]


def search_worship_video(song_title: str, first_line: str | None = None) -> dict:
    """검색 결과 dict 반환: {url, title, channel, found_preferred}"""
    query = f"피아워십 {song_title}"
    if not API_KEY:
        return {
            "url": _fallback_search_url(query),
            "title": None,
            "channel": None,
            "found_preferred": False,
            "note": "YOUTUBE_API_KEY 없음, 검색 URL로 폴백"
        }

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 5,
        "videoEmbeddable": "true",
        "key": API_KEY,
    }
    resp = requests.get(SEARCH_URL, params=params, timeout=10)
    resp.raise_for_status()
    items = resp.json().get("items", [])

    if not items and first_line:
        params["q"] = f"피아워십 {first_line}"
        resp = requests.get(SEARCH_URL, params=params, timeout=10)
        resp.raise_for_status()
        items = resp.json().get("items", [])

    preferred = [it for it in items
                 if any(ch.lower() in it["snippet"]["channelTitle"].lower()
                        for ch in PREFERRED_CHANNELS)]

    chosen = preferred[0] if preferred else (items[0] if items else None)
    if not chosen:
        return {
            "url": _fallback_search_url(query),
            "title": None, "channel": None,
            "found_preferred": False,
            "note": "검색 결과 0건, 검색 URL로 폴백"
        }

    vid = chosen["id"]["videoId"]
    return {
        "url": f"https://www.youtube.com/watch?v={vid}",
        "embed_url": f"https://www.youtube.com/embed/{vid}",
        "title": chosen["snippet"]["title"],
        "channel": chosen["snippet"]["channelTitle"],
        "found_preferred": bool(preferred),
    }


def _fallback_search_url(query: str) -> str:
    return f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
