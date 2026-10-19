# 공식 출처 자동 수집 설정

현재 **실제 RSS 주소는 하나도 사전 등록하지 않았습니다.** 특정 공연장/단체의 RSS 주소·저작권/제공 정책 확인 후 수집 목록에 추가하세요.

아래는 형식 예시이며 실제 사이트 정보가 아닙니다.

```sql
INSERT INTO feed_sources
  (id,name,feed_url,allowed_host,kind,verified,auto_publish,enabled)
VALUES
  ('trusted-venue-001',
   '검증된 공연장 공식 RSS',
   'https://EXAMPLE.ORG/events/rss.xml',
   'EXAMPLE.ORG',
   'show',
   0, 0, 0);
```

위 예시는 검증/게시/수집 모두 꺼진 상태입니다. 소스 URL이 실제 존재하고 공식 운영자가 제공하는 공개 피드인지 확인한 뒤, **실제 소문자 호스트명**으로 바꿔야 합니다.

- `kind='news'`: 연구/학회 소식 RSS → 기사 게시판
- `kind='show'`: 공연정보 RSS → 공연 홍보 게시판
- `verified=1`: 관리자 출처 신뢰 확인 완료
- `enabled=1`: 수집 시작
- `auto_publish=1`: 출처 + 날짜 + 마술 관련성 등을 검증 통과한 항목만 게시, 나머지는 pending
- 공연의 자동 발행에는 `startDate`/`dtstart`, `venue`/`location` 같은 **기계 판독 가능한 일자·공연장 정보**가 필수입니다. 이 정보가 빠진 RSS는 편집자 검토함으로 이동합니다.
- 출처 RSS와 개별 게시물 링크는 등록된 `allowed_host`와 **정확히 동일한 HTTPS 호스트**여야 수집합니다.
- 수집 과정에서 제공된 행사 정보의 실재 여부까지 완전히 검증하는 것은 아닙니다. 공식 출처 확인 외에 최종 운영 기준이 필요합니다.

초기 운영 시에는 `auto_publish=0`을 권장합니다. 비공식 웹사이트 스크래핑, 이미지 무단 복제 등은 포함하지 않습니다.
