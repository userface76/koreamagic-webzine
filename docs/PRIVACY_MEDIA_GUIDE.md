# 웹진 개인정보 보호 및 동영상 자료 운영 지침 (운영 전 검수용)

> 최종 개인정보처리방침이 아닙니다. 운영자의 적법성 검토·실제 담당자 정보·관리 절차 확인 전에는 전화번호 수집을 활성화하지 않습니다.

## 행사 게시글 필드
**공개:** 행사명, 설명, 분류, 날짜, 공연장·지역, 외부 행사 안내 HTTPS 링크, 포스터 이미지 HTTPS 링크, 유튜브 HTTPS 동영상 링크 (등록 후 승인 시).

**비공개:** 담당자 전화번호(`promotions.contact_phone`), 동의 수집시각(`contact_consent_at`), 삭제시각(`contact_deleted_at`).

- `GET /api/home`, `GET /api/promotions`: 전화번호나 동의 시각을 SELECT하지 않습니다.
- `GET /api/admin/promotion-contact?id=<uuid>`: ADMIN_API_TOKEN 인증 후, 필요할 때 별도 조회.
- `POST /api/admin/promotion-contact/delete`: 담당자가 요청하거나 더 이상 필요하지 않은 비공개 전화번호를 인증 관리자가 조기 삭제.
- 승인 검토에서 반려·삭제된 공연의 연락처는 즉시 비움.
- `GET /api/admin/promotions`: 관리자 행사 관리 목록(전화번호 자체는 포함하지 않음).
- `POST /api/submissions/promotion`: 공개 텍스트에 전화번호가 있으면 거부; 별도 연락처에만 입력. 연락처 제공은 선택사항이며 별도 동의 확인 필수.
- 개인정보처리방침 운영 승인 표시 환경변수 `PRIVACY_POLICY_READY=true`가 없으면 **전화번호 포함 제출 거부**. 전화번호 없는 접수는 기존 Turnstile 활성화 후 가능.
- 공개 이미지 URL과 영상 URL에는 전화번호가 포함되지 않도록 편집 검토가 필요합니다.
- 동영상은 YouTube의 공식 HTTPS 도메인(일반 영상·쇼츠·라이브·짧은 youtu.be URL)에서 11자리 영상 ID만 추출하여 표준 링크로 저장합니다.
- 파일 업로드는 아직 없습니다. 업로드가 필요하면 Cloudflare R2와 관리자/회원 인증, 악성 파일 검사, 보존 정책, 허용 용량이 추가로 필요합니다.

## 보관 기간과 삭제
- 이벤트일이 확인되면 행사 종료 약 90일 경과 시 다음 정기 정리에서 연락처만 삭제합니다.
- 행사일이 미정이면 등록일 약 180일 경과 시 연락처만 삭제합니다.
- 현 단계에서는 6시간 간격 예약 작업에 연락처 삭제 로직을 넣었습니다. 배포 성공·실제 데이터 마이그레이션·정기 실행 로그 검증이 필요합니다.
- 연락처 본문에 직접 노출하는 게시물은 게시 금지. 관리자도 업무상 필요한 경우에만 접근.
- 긴급 삭제·열람·정정·처리정지 요청용 관리자 절차와 담당자 연락처를 운영자가 별도로 마련해야 합니다.
- Cloudflare 로그·백업·관리자 권한·계정 침해 대응 및 서비스위탁/국외 이전 가능성을 검토해야 합니다.
- 민감정보는 GitHub, 공개 댓글, 일반 채팅, 사전 보관 예시 파일에 넣지 않습니다.

## 학회 개인정보처리방침 확정에 필요한 정보
1. 개인정보처리자(법인/단체) 공식 명칭과 주소.
2. 개인정보 보호책임자와 문의처, 열람/삭제/동의철회 접수 창구.
3. 처리하는 개인정보 항목·법적 근거·수집 목적·보유 기간.
4. 개인정보 처리위탁, 국외 이전 및 외부 서비스(Cloudflare, YouTube)의 실제 데이터 흐름.
5. 접근 통제·로그·백업 보존·암호화 등 보호조치의 이행 상황.
6. 이용자 권리 및 고충처리 절차, 최종 승인일과 방침 변경 이력.

확정 전 설정은 `PRIVACY_POLICY_READY` **미설정**으로 유지하십시오.

## 배포(기존 DB 보존)
새 SQL 파일:
- [0003_study_resources.sql](../migrations/0003_study_resources.sql)
- [0004_promotion_privacy.sql](../migrations/0004_promotion_privacy.sql)

**주의:** 기존 `0002_demo.sql`은 시연 데이터를 입력하는 파일이므로 모든 마이그레이션을 무작정 일괄 적용하지 마세요. 데이터 백업 후 Cloudflare D1 콘솔에서 **0003 다음 0004** 내용을 순서대로 실행하거나, 적절한 권한이 있는 개발 환경에서 파일별로 실행하세요.

```bash
npx wrangler d1 execute kms-magic-webzine-db --remote --file=migrations/0003_study_resources.sql
npx wrangler d1 execute kms-magic-webzine-db --remote --file=migrations/0004_promotion_privacy.sql
```

실행 후:
```sql
PRAGMA table_info(study_resources);
PRAGMA table_info(promotions);
```
`contact_phone`, `video_url`, `contact_consent_at`, `contact_deleted_at` 컬럼 유무를 확인하세요. 기존 테이블에 이미 동일 컬럼이 있으면 ALTER TABLE을 다시 실행하지 마세요.

## 운영 보안 체크
- [ ] `ADMIN_API_TOKEN` 32자리 이상 Worker Secret 설정
- [ ] Cloudflare Turnstile Site/Secret 키 설정
- [ ] 정식 개인정보처리방침 및 개인정보 처리자 정보 승인
- [ ] 필요 시에만 `PRIVACY_POLICY_READY=true`로 활성화
- [ ] 공개 API에 비공개 전화번호 미노출 확인
- [ ] 관리자 인증 실패 시 전화번호 접근 거부 확인
- [ ] 보유기간 만료 후 실제 삭제 로그/백업 정책 검증
- [ ] 콘텐츠 게시 승인이 실제로 대기함에서 이루어지는지 확인

## 스터디 영상 등록 및 아이디어 나눔
- 관리자는 `#admin`의 '스터디 교육영상·웹진 자료 등록'에서 강의별 유튜브 링크 또는 자체 작성 교육 노트를 추가합니다.
- 공개 API `GET /api/study-resources?lesson_id=<id>`는 **게시 승인된 학습자료만** 제공.
- 영상은 사용자가 재생 버튼을 눌렀을 때에만 youtube-nocookie iframe을 삽입합니다(외부 서비스 데이터 처리는 별도).
- 직접 영상 파일 업로드는 미구현.
- '지적 대신 아이디어 나눔'은 작성자가 브라우저에서 제안문을 생성·복사하는 **개인 도구**이며, 공동 피드백을 서버에 저장·공개하지 않습니다. 공연자 동의 없는 영상 공유·평가 금지.
