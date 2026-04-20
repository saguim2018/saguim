"""선곡 히스토리를 관리한다. 최근 5일간 선택된 곡 번호 목록."""
from __future__ import annotations
import json
from datetime import date, timedelta
from pathlib import Path


class History:
    def __init__(self, history_path: Path):
        self.path = history_path
        if history_path.exists():
            with open(history_path, encoding="utf-8") as f:
                self.data = json.load(f)
        else:
            self.data = {"selections": {}}

    def get_recent(self, today: date, days: int = 5) -> list[int]:
        """최근 N일간 선택된 곡 번호를 모두 반환."""
        cutoff = today - timedelta(days=days)
        recent = []
        for date_str, songs in self.data["selections"].items():
            try:
                d = date.fromisoformat(date_str)
            except ValueError:
                continue
            if cutoff <= d < today:
                recent.extend(songs)
        return recent

    def record(self, day: date, song_numbers: list[int]) -> None:
        self.data["selections"][day.isoformat()] = list(song_numbers)
        self._prune(keep_days=30)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def _prune(self, keep_days: int = 30) -> None:
        """아주 오래된 기록은 정리. 30일이면 충분."""
        if not self.data["selections"]:
            return
        all_dates = sorted(self.data["selections"].keys())
        if len(all_dates) <= keep_days:
            return
        keep = set(all_dates[-keep_days:])
        self.data["selections"] = {k: v for k, v in self.data["selections"].items()
                                     if k in keep}
