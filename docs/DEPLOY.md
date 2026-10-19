# 배포 안내 — GitHub ↔ Cloudflare Workers

2026년 10월 Cloudflare Workers Static Assets + Workers Builds 방식. 이 프로젝트는 Cloudflare Pages 대신 **Workers 정적 자산+API 통합 배포**를 사용합니다. Workers에서도 GitHub 연동 배포가 지원됩니다.

## 1. 사전 준비

- Cloudflare 계정, GitHub 계정, Node.js 20+
- 학회 웹진 프로젝트용 새 GitHub 저장소(권장: `kms-magic-webzine`), 초기에는 private
- 공개 도메인(선택) 및 학회 공식 명칭·브랜드 사용 승인

## 2. GitHub 저장소

```bash
cd kms-magic-webzine
npm install
npm test
git init
git add .
git commit -m "Initial KMS AI webzine and magic marketplace"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/kms-magic-webzine.git
git push -u origin main
```

`YOUR-ACCOUNT`는 실제 GitHub 계정명으로 교체. 비밀키나 `.dev.vars`는 커밋하지 않습니다.

## 3. D1

```bash
npx wrangler login
npx wrangler d1 create kms-magic-webzine-db
```

CLI가 출력한 UUID를 `wrangler.jsonc` 파일의 `database_id` 필드에 입력합니다.

```bash
npm run db:local
npm run dev
npm run db:remote
```

**마이그레이션 0002에는 샘플 기사·가상 공연·가상 판매글이 포함**되어 있습니다. 정식 공개 전 다음처럼 삭제:

```sql
DELETE FROM articles WHERE origin = 'demo';
DELETE FROM marketplace WHERE id LIKE 'demo-%';
DELETE FROM promotions WHERE id LIKE 'demo-%';
DELETE FROM banners WHERE id LIKE 'demo-%';
```

원격 DB 명령은 `npx wrangler d1 execute kms-magic-webzine-db --remote --command="<SQL>"` 형태로 실행할 수 있습니다. 운영 중에는 데이터 백업 후 처리하세요.

## 4. 보안 설정

### 관리자

32자 이상의 무작위 토큰 생성 후 다음 명령을 실행합니다.

```bash
npx wrangler secret put ADMIN_API_TOKEN
```

권장: 운영에서는 Cloudflare Access도 관리자 경로에 적용하고, 관리자 API 토큰도 비밀로 관리합니다. 토큰은 GitHub나 채팅에 노출하지 말고 운영자에게만 별도로 전달하세요.

### 외부 글 등록: Turnstile

Cloudflare Turnstile에서 웹진 도메인으로 사이트를 만듭니다.

- 공개 사이트 키: `wrangler.jsonc` → `vars.TURNSTILE_SITE_KEY`
- 비밀 키: `npx wrangler secret put TURNSTILE_SECRET`

**둘 다 설정해야 홍보/장터 제보 POST가 동작합니다.** 설정 전에는 접수 기능을 서버가 거부합니다. 로컬 테스트용 `.dev.vars`는 다음 모양으로 생성할 수 있습니다(절대 GitHub에 커밋 금지):

```dotenv
ADMIN_API_TOKEN=32자리이상의_무작위_긴_문자열_사용
TURNSTILE_SECRET=설정한_실제_시크릿_키
```

실제 배포에는 `wrangler secret put` 사용. 광고·도배 확장 차단을 위해 Cloudflare WAF/Rate Limiting 규칙도 추가하는 것이 바람직합니다.

## 5. 배포

단회 배포:

```bash
npm run deploy
```

GitHub push 자동 배포:

1. Cloudflare Dashboard → Workers & Pages → Create application
2. GitHub 저장소 연결 → `kms-magic-webzine` 선택
3. Worker의 저장소 루트를 프로젝트 루트로 지정하고 Wrangler 설정 사용
4. 배포 명령 `npx wrangler deploy` (필요한 설치 명령은 플랫폼의 빌드 구성에 따라 `npm install`)
5. Cloudflare Workers/Builds에서 D1 바인딩과 Worker Secret 확인
6. `main` 변경 시 자동 배포 동작 확인

Workers Builds의 UI는 계정/업데이트에 따라 표기가 달라질 수 있습니다. 공식 문서:
- https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/d1/reference/migrations/

## 6. 스케줄

- `0 */6 * * *` → 6시간마다 (UTC 기준) 승인된 RSS 목록 수집
- `0 0 1 * *` → 매월 1일 00:00 UTC = 한국시간 **매월 1일 오전 9시** 전월 기사 통합본 생성

피드가 미등록된 초기에는 자동 수집 대상이 0건입니다. 승인한 공식 RSS를 등록해야 동작합니다.

## 7. 배포 점검 목록

- [ ] `GET /api/home` 정상 JSON 반환
- [ ] 학회명이 공식 사용 승인을 받음
- [ ] 샘플 데이터 삭제 후 실제 기사 추가
- [ ] Turnstile 검증이 없는 POST는 거절됨
- [ ] 관리자 인증 실패 시 `/api/admin/queue`는 HTTP 401
- [ ] 판매글 제출 → `pending` → 승인 → 공개 목록에 노출
- [ ] 마술 외 글 제출 → `quarantined` (명백한 스팸은 `deleted`)
- [ ] HTTPS 이미지 링크/저작권 검토
- [ ] 월간 통합본 및 인쇄/PDF 저장 확인
