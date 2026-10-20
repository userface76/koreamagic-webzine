# 한국마술학회 AI 웹진 · 초기 프로젝트 v0.2

GitHub 저장소: https://github.com/userface76/koreamagic-webzine

**발행 형태:** 수시 기사 발행 + 지난달 기사 월간 통합본  
**추가 서비스:** 공연/공연장 소식, 사이드 홍보 배너, 마술장터(중고 마술도구·공연장비 등), 편집진 검토, 스팸 자동 비공개  
**기술:** GitHub + Cloudflare Workers(Static Assets) + D1 + Cron + Turnstile

> ⚠️ 학회 승인 전 시안입니다. 예제 기사·공연·장터 물품은 모두 가상입니다. 실제 학회 행사/공연/판매로 해석하면 안 됩니다.
>
> 초기 제공물은 **운영 전 MVP 소스코드**입니다. GitHub 또는 Cloudflare 계정에 이미 게시된 서비스가 아니며, D1 ID·Turnstile·비밀키·승인된 피드 출처가 설정되기 전에는 실제 접수/수집을 사용할 수 없습니다.


## 디자인 시스템 — Magic Scenes v1

- 디자인 원칙, 채택한 기술 및 업데이트 절차: [WEBZINE_DESIGN_SKILL.md](WEBZINE_DESIGN_SKILL.md)
- 디자인 변경 이력: [docs/DESIGN_CHANGELOG.md](docs/DESIGN_CHANGELOG.md)
- 메인 화면 배경: 자체 제작 4개 SVG, 방문 시 랜덤, 홈 화면에서 20초마다 자동 변경
- 관람자가 **다른 배경 / 자동 변경 멈춤** 버튼으로 제어할 수 있으며, 운영체제에서 움직임 줄이기를 켜면 자동 변경하지 않습니다.
- 장식 디자인은 API·D1·관리자 인증에 의존하지 않습니다. JS가 꺼져 있으면 기본 극장 배경이 표시됩니다.

## 시안 콘텐츠 자동 채움

- API `/api/home`이 정상 동작해도 기사·공연·장터 등 데이터가 부족한 경우 **화면에서만** 예시를 보충합니다.
- `public/assets/demo-data.js`: 기사 12, 가상 공연 8, 샘플 장터 12, 시안 배너 3, 월간 호수 시안 2.
- 실제 D1 테이블에 샘플을 INSERT하지 않습니다. 실제 승인·게시된 데이터가 우선 노출되며, 해당 섹션의 실제 자료가 채워지면 시안은 자동으로 줄어듭니다.
- 모든 가상 콘텐츠에는 샘플 표시, 공연장·판매자는 가상임을 명시하며 거래 링크를 제공하지 않습니다.
- `/api/articles`, `/api/promotions`, `/api/marketplace`의 JSON API는 **실제 DB 정보만** 반환합니다. 실제 게시물 수와 시안 표시 건수는 다릅니다.
- 월간 시안은 브라우저에서 미리보기/인쇄가 가능하나 **실제 학회의 정식 발행 기록이 아닙니다.**
- 학술연구실·마술 아카데미·창작권리센터 카드 역시 아직 개설되지 않은 기능의 안내용 시안입니다.
- 실제 기사·공연·상품을 등록하기 전에는 웹진 상단 샘플 안내를 제거하면 안 됩니다.

## 구현된 기능

- 학회 웹진 반응형 메인, 연구·학회·교육·칼럼 분류, 검색, 기사 본문 보기
- 공연·공연장·교육 일정 목록과 홍보 게시물 등록 양식
- **마술장터:** 판매 상품·분류·가격·상태·지역·닉네임·외부 문의 링크 입력, 상품 리스트/상세, 검색
- 관리자 게시 승인·반려·검토함, 기사 직접 작성(즉시 발행 또는 승인대기), 사이드 이미지 배너 URL 추가
- D1 버전형 마이그레이션, 예시 데이터, 분류/스팸 로그
- 승인된 RSS/Atom 피드 주기적 수집(6시간), 출처 호스트 검사, 매직 관련 키워드 확인, 새 소식 자동/대기 처리
- 매월 1일 09:00 한국시간 기준으로 전월 기사 통합본 자동 생성(온라인 아카이브)
- 월간본은 브라우저 '인쇄 / PDF로 저장' 지원
- 비관련 게시글은 검토함으로, 명백한 불법/도박 광고는 `deleted` 상태(소프트 삭제)로 자동 비공개 처리
- Cloudflare Turnstile 인증 전에는 외부 제보 접수 불가; 관리자 API 토큰은 Worker Secret으로 보관

### 아직 구현되지 않은 기능

- AI LLM 기반 원문 요약·사실검증(현재는 **규칙 기반** 분류), 완전 자동 사실검증
- 학회 회원 로그인/프로필, 판매자 인증·채팅·안전결제·에스크로
- 직접 파일 첨부 업로드(R2), 이미지 편집, 관리자 배너 삭제 UI
- 서버 측 PDF 생성 및 이메일 자동 발송(현재는 월간 아카이브 + 브라우저 PDF 저장)
- 무관한 글의 영구 데이터 삭제(현재는 비공개 및 기록 보존)
- 공연장 사이트 임의 크롤링(현재는 **승인된 RSS/Atom만** 지원)

## 폴더 구조

```text
kms-magic-webzine/
├── public/
│   ├── index.html            # 웹진 UI
│   └── assets/
│       ├── styles.css        # 반응형 디자인
│       ├── app.js            # 홈/기사/공연/장터/등록/관리자
│       └── demo-data.js      # 가상 샘플 데이터
├── src/
│   ├── worker.js             # REST API + Cron
│   ├── feeds.js              # 출처 검증 RSS 수집 + 월간 통합본
│   └── moderation.js         # 규칙 기반 비관련 글 탐지
├── migrations/
│   ├── 0001_init.sql         # D1 스키마
│   └── 0002_demo.sql         # 시연용 샘플 데이터
├── docs/
│   ├── DEPLOY.md             # GitHub & Cloudflare 절차
│   ├── APPROVED_FEEDS.md     # 신뢰 출처 등록 방법
│   └── ROADMAP.md            # 운영 전 검토 및 확장 항목
├── tests/
├── .github/workflows/ci.yml
├── wrangler.jsonc
└── package.json
```

## 시작하기

1. **미리보기**: `public/index.html`을 브라우저로 열어 화면을 확인합니다. 실제 DB/API 없이 샘플 콘텐츠를 보여줍니다.
2. Node.js 22 이상 준비 → 프로젝트 폴더에서 `npm install`.
3. Cloudflare 로그인: `npx wrangler login`.
4. D1 DB 만들기: `npx wrangler d1 create kms-magic-webzine-db`.
5. 결과의 `database_id`를 `wrangler.jsonc`의 `REPLACE_WITH_D1_DATABASE_ID`와 교체.
6. 로컬 D1 초기화: `npm run db:local`.
7. 실행: `npm run dev` → Wrangler가 표시한 로컬 주소로 접속.
8. API 테스트: `/api/home`에 가상 기사/장터 상품이 나오는지 확인.
9. 원격 DB 초기화: `npm run db:remote`.
10. 관리자 토큰: `npx wrangler secret put ADMIN_API_TOKEN` (무작위 32자 이상). Turnstile 키 설정은 아래 문서 참조.
11. `npm run deploy` 또는 Cloudflare Workers Builds에서 GitHub 저장소 연동.

자세한 배포/보안 절차: [`docs/DEPLOY.md`](docs/DEPLOY.md)

## 운영 규칙

- 학회명이 사용된 시안이므로 실제 공개 전에 한국마술학회의 공식 사용 승인 및 고유 CI 사용 허락을 확인합니다.
- 홍보/장터는 적합 판정이어도 자동 공개하지 않고 `pending`으로 접수 후 관리자 승인합니다.
- 마술 무관 글은 자동 분류가 완벽하지 않으므로 `quarantined`로 격리하며 오탐 재검토합니다.
- 승인한 `feed_sources`만 예약 수집합니다. 공식 피드라도 데이터에 **공연명·일자·장소가 충분하지 않으면 승인대기**입니다.
- 판매자와 구매자 분쟁, 거래 사기 및 개인정보 처리에 대한 운영정책을 수립한 뒤 정식 운영합니다.
- 샘플 데이터(`origin=demo`, ID `demo-`)는 정식 운영 전 반드시 제거합니다.

## 테스트

```bash
npm test
node --check src/worker.js
node --check public/assets/app.js
```

© 초기 시안 / 학회 공식 승인 전 사용 주의
