"""오늘의 본문 참조를 반환. 예: '시편 149:1-9'"""
from __future__ import annotations
from datetime import date
from pathlib import Path
import yaml


class MissingSchedule(Exception):
    """해당 날짜의 읽기표가 YAML에 없음."""


class ReadingPlan:
    def __init__(self, plan_path: Path):
        with open(plan_path, encoding="utf-8") as f:
            self.data = yaml.safe_load(f)

    def get_passage_ref(self, target: date, source: str | None = None) -> str:
        """주어진 날짜의 본문 참조를 반환."""
        source = source or self.data.get("default_source", "daily_bible")
        plan = self.data["reading_plans"].get(source)
        if not plan:
            raise ValueError(
                f"읽기표 소스 '{source}' 없음. "
                f"reading_plan.yaml에 {source}를 정의하거나 default_source 수정."
            )

        schedule = plan.get("schedule") or {}
        key = target.isoformat()
        if key not in schedule:
            available = sorted(schedule.keys())
            hint = (f" (가장 최근 입력: {available[-1]})" if available else
                    " (schedule이 비어있음)")
            raise MissingSchedule(
                f"{key}의 읽기표가 '{source}'에 없음{hint}. "
                f"reading_plan.yaml의 {source}.schedule에 추가하세요. "
                f"매일성경 정기구독 책자의 월별 읽기표를 참고."
            )
        return schedule[key]

    def is_scheduled(self, target: date, source: str | None = None) -> bool:
        """해당 날짜가 schedule에 있는지 체크. 빌드 전 사전 확인용."""
        try:
            self.get_passage_ref(target, source)
            return True
        except MissingSchedule:
            return False
