# 하루의예배 — 빌더 워크플로우

매일 00:01 KST에 GitHub Actions cron이 돌며 `data/daily/YYYY-MM-DD.json`을 생성하는 파이프라인.

## 디렉터리

```
builder/
├── .github/workflows/build-daily.yml    # cron 정의
├── builder/
│   ├── main.py                         # 오케스트레이터
│   ├── reading_plan.py                 # 읽기표 조회
│   ├── bible_fetcher.py                # 성경 본문 스크래퍼
│   ├── commentary.py                   # Claude 주해 생성
│   ├── song_picker.py                  # 찬양 선곡
│   ├── youtube_search.py               # 유튜브 검색
│   ├── history.py                      # 최근 5일 히스토리
│   └── requirements.txt
├── data/
│   ├── reading_plan.yaml               # 매일성경 읽기표 (수동 입력)
│   ├── songbook_tagged.json            # 악보집 인덱스 (이전 단계 결과)
│   ├── history.json                    # 자동 업데이트
│   └── daily/
│       ├── 2026-04-20.json
│       └── ...
└── README.md
```

## 초기 세팅

### 1. GitHub 시크릿 등록

Settings → Secrets and variables → Actions에서:
- `ANTHROPIC_API_KEY`: 주해 생성 + 본문 주제 분류용
- `YOUTUBE_API_KEY`: 유튜브 검색용. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 YouTube Data API v3 활성화 후 발급. 무료 할당량으로 충분.

### 2. 읽기표 확보

`data/reading_plan.yaml`에 본문 일정을 넣어요. 세 가지 옵션:

- **M'Cheyne 읽기표 사용**: 저작권 자유. 공개 1년치 일정 하드코딩.
- **매일성경 수동 업로드**: 매월 초에 그 달 읽기표를 YAML에 붙여넣기. 2-3분 작업.
- **자유 일정**: 특정 책을 연속 묵상하고 싶을 때 직접 입력.

### 3. 악보 이미지 사전 추출

```bash
python extract_all_sheets.py
```

495곡 전체 악보를 `public/sheets/song-{번호}.webp`로 한 번만 추출.
약 70-80MB. 레포에 그대로 커밋 가능.

### 4. 로컬 테스트

```bash
cd builder
pip install -r builder/requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
export YOUTUBE_API_KEY=AIza...
python -m builder.main --dry-run
```

## 빌드 플로우

각 단계는 독립적으로 실패할 수 있어야 하고, 로그가 명확해야 함:

1. **읽기표 조회** — `reading_plan.yaml`에서 오늘 본문 참조 읽기. 없으면 에러로 중단.
2. **성경 본문** — `holybible.or.kr`에서 개역개정 + 현대인의성경. 각 1요청, 0.5초 간격.
3. **주해** — Claude Sonnet에 본문 넘겨서 배경 3줄 + 절별 주해 3-4개.
4. **찬양 선곡** — 
   a. Haiku로 본문 테마 분류 (12개 중 1개)
   b. 감사 1곡 + 테마 매칭 1곡 뽑기
   c. 최근 5일 선곡 제외
5. **유튜브 검색** — 각 곡별 "피아워십 [곡명]" 검색, 피아워십 채널 우선.
6. **조립 + 저장** — `daily/YYYY-MM-DD.json` 쓰고 히스토리 업데이트.
7. **자동 커밋** — GitHub Actions가 변경된 파일만 커밋 & 푸시.

## JSON 스키마 (예시 일부)

```json
{
  "date": "2026-04-20",
  "passage": { "ref": "시편 149:1-9", "theme": "경배" },
  "bible": {
    "ref": "시편 149:1-9",
    "revised": [{ "v": 1, "text": "할렐루야..." }, ...],
    "modern":  [{ "v": 1, "text": "여호와를 찬양하라..." }, ...]
  },
  "wesley": {
    "background": ["포로 귀환 이후...", "...", "..."],
    "commentary": [
      { "verse": 4, "title": "하나님의 기쁨", "note": "..." },
      ...
    ]
  },
  "praise_thanks": {
    "number": 122,
    "title": "감사",
    "first_line": "오늘 숨을 쉬는 것 감사",
    "lyrics": { "verse_1": "...", "chorus": "..." },
    "primary_theme": "감사",
    "youtube": { "url": "...", "embed_url": "...", "channel": "피아워십" },
    "sheet_images": ["/sheets/song-122.webp"]
  },
  "praise_response": { ... },
  "built_at": "2026-04-20T00:01:15+09:00"
}
```

## 장애 대응

- **홀리바이블 페이지 구조 변경**: `bible_fetcher._parse_verses()` 하나만 수정.
- **본문이 읽기표에 없음**: `reading_plan.yaml` 확인 후 workflow_dispatch로 재실행.
- **주해 JSON 파싱 실패**: 프롬프트 보강 또는 Sonnet에서 Opus로 모델 변경.
- **선곡이 편중**: `songbook_tagged.json`의 `secondary_themes`까지 활용하도록 `song_picker.py` 조정.
- **유튜브 할당량 초과**: 폴백으로 검색 URL 반환됨. 프론트에서 "검색하기" 버튼으로 표시.

## 비용 (일일)

- 주해 생성 (Sonnet): ~$0.02
- 본문 테마 분류 (Haiku): ~$0.001
- 유튜브 API: 검색 2회 = 200 units (일 10,000 free)
- GitHub Actions: public 레포 무료

월 예상: **약 $1 미만**.
