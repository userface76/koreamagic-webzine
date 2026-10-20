# WEBZINE DESIGN SKILL — 한국마술학회 AI 웹진
> Version 2.0 · 2026-10-20 · GitHub: userface76/koreamagic-webzine

## 미션
학술적 신뢰와 무대 마술의 상상력을 동시에 전한다. **내용은 정확하고, 경험은 환상적이며, 운영은 안전하게.**

## 샘플 콘텐츠 시연 원칙 (v1.2)
- 초기 빈 화면을 피하기 위해 예시 뉴스, 가상 공연, 상품, 배너, 월간 웹진 표지를 허용한다.
- 각 시안 콘텐츠에는 **샘플 표시**, 가상 공연장 및 판매자 표시, 실제 구매·신청 링크 제거를 적용한다.
- 시안은 `public/assets/demo-data.js`에만 저장하고, D1 실제 발행 기록과 구분한다.
- 실제 게시글은 목록 맨 앞에 놓고 예시를 부족한 수만큼 보충한다. 실제 데이터가 늘면 예시가 자동으로 사라지도록 한다.
- 새 디자인 사례로 소개하는 연구·교육·권리센터는 미구현 사항을 "개발 예정"으로 표시한다.
- 최소 검수: 기사 상세보기, 장터 거래 불가, 가상 이벤트 표기, 월간 시안 표시, 실제 API 보호.

## 디자인 원칙
1. **Editorial-first:** 문서·논문·공연 정보가 우선. 시각효과는 읽기를 방해하지 않는다.
2. **Magic without misinformation:** 마술·마법 그래픽은 순수 장식. 가상 공연, 판매글, 연구성과를 실제 데이터처럼 표시하지 않는다.
3. **4개의 랜덤 장면:** 극장(Theater), 카드(Card Illusion), 마법서재(Library), 포털(Portal). 초기 방문 시 임의 선택, 20초마다 교체. '다른 배경'과 '자동 변경 일시정지' 제어 제공.
4. **Accessible motion:** prefers-reduced-motion 사용자에게 자동 교체 기본 중단. 페이지 숨김·비홈 화면에서는 자동 전환 중지. 항상 사용자가 직접 일시정지 가능.
5. **Responsive layout:** 360/768/1024/1440px 너비에서 본문·카드·광고 분리. 모바일에서 배경보다 가독성과 CTA가 우선.
6. **Performance budget:** 최초 배경은 작은 로컬 SVG 1개만 요청. 외부 랜덤 이미지 API 금지. 고유 라이선스 또는 사용 권한 확인된 이미지 사용. 고해상도 이미지로 교체 시 WebP/AVIF, responsive sizes, hero LCP 최적화.
7. **No layout shifts:** 장면을 바꿀 때 제목/버튼 위치와 콘텐츠 길이를 바꾸지 않는다.
8. **Readable contrast:** 영웅 영역은 어두운 오버레이와 흰색 본문, 아이보리 본문판은 높은 텍스트 대비. 키보드 포커스는 언제나 보이게.
9. **Security first:** 배경 자산에 JS·외부 추적·동적 URL 금지. SQL/관리자 인증/기사 API 변경 없이 디자인만 배포.
10. **Respect authorship:** 논문·마술 창작물은 저자와 원본 표시, 발표·판매 시 동의/라이선스 필수.

## 모바일 ↔ PC 버전 보기 (v1.1)
- 모바일 방문자에게만 하단 푸터 'PC 버전 보기' 버튼 노출. PC 레이아웃은 1200 CSS px 기준으로 표시.
- 전환 시 '모바일 버전 보기'로 교체하고 클릭으로 원복. 선택값은 localStorage에 보관해 재방문에도 유지.
- 화면 강제 확대·축소용 핀치 동작은 막지 않으며, 관리자·기사·공연·마술장터 URL은 동일.
- 탭 내비게이션 가능 및 aria-pressed 상태와 44px 터치 목표 적용.
- 브라우저의 데스크톱 사이트 기능과 별개인 웹진 내 화면 전환 기능이며 PC 자체에서 모바일 에뮬레이션을 제공하지 않음.

## Design tokens
- 기본: Plum #281728, Ink #281B2D, Paper #FFFDF9, Cream #F6F3EE
- 강조: Champagne #E6BC83, Sapphire #78B5D9, Violet #A98CE7, Teal #86C7BA
- 글꼴: Noto Sans KR + DM Sans; 헤드라인은 위계, 본문은 넓은 줄 간격
- 공간: 컨테이너 1220px, 컴포넌트 간격 8/12/16/24/32px
- 자산: /public/assets/magic-{theater,cards,library,portal}.svg (자체 제작 SVG)

## 적용된 좋은 기술·스킬 (Skill ledger)
| 기준/기술 | 적용 포인트 | 상태 |
|---|---|---|
| W3C WCAG 2.2 SC 2.2.2 | 자동 장면 교체 일시정지 버튼 | v1 적용 |
| MDN prefers-reduced-motion | 움직임 선호도 감지·자동 중지 | v1 적용 |
| web.dev image performance | 로컬 초경량 벡터, 화면 이탈 시 전환 중지 | v1 적용 |
| Modular CSS overrides | 기존 Cloudflare Workers + D1 기능과 UI 변경 분리 | v1 적용 |
| Progressive enhancement | JS 없이도 기본 극장 배경 표시 | v1 적용 |
| Accessible user controls | button, aria-pressed, aria-label, focus-visible | v1 적용 |

참고: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
https://web.dev/learn/design/responsive-images

## 향후 디자인 스킬 발전 루프
- 새 디자인 방법론·패턴은 **출처/적용조건/이점/위험/성능 영향**을 기록하고, 기존 구현과 중복 시 채택하지 않는다.
- 디자인 변경은 `docs/DESIGN_CHANGELOG.md`에 이유와 영향을 기록한다.
- 모바일·키보드·저사양/데이터절약·스크린리더 검수 후 main에 반영한다.
- 바탕 이미지의 **장식 변경**과 기사/공연/상품의 **사실 데이터 관리**를 엄격히 구별한다.
- 외부 사이트에서 이미지·디자인을 무단 복제하지 않는다. 새로운 스킬은 평가를 거쳐 단계적으로 적용한다.
- 운영 중인 관리·D1·자동발행 기능은 별도 승인 없이는 변경하지 않는다.

## 검수 항목
- [ ] 배경 네 종류 경로가 실제 HTTP 200이며 SVG 렌더링됨
- [ ] 새로고침 시 임의 배경, 버튼 클릭 시 다른 배경
- [ ] 자동 변경 중단/재개, OS 동작 줄이기, 비홈 화면, 백그라운드 탭 확인
- [ ] 모바일에서 문구/버튼/배경 제어 겹치지 않음
- [ ] API /api/home, 기사, 공연, 장터, 관리자 인증이 회귀하지 않음
- [ ] Lighthouse 성능·접근성 검토 및 실제 데이터/예시 데이터 구분

## Full-site Design v2.0 (2026-10-21)
- 배경만이 아닌 사이트 전체 헤더, 메뉴, 히어로 레이아웃, 기사 카드, 마술장터, 스터디, 아카이브와 푸터가 함께 바뀌는 3가지 디자인.
- `public/assets/design-themes.js` : 방문마다 랜덤(기본값) 또는 사용자가 선택한 디자인 로컬 유지.
- `public/assets/site-themes.css` : theater / editorial / future 테마별 구조와 시각 언어; 모바일 반응형·가독성 우선.
- `public/assets/archive-hub.js` : 월간 웹진 / 마술사 A–Z / 학술·연구 / 공연 기록 / 교육·실무 / 창작·권리 6개 분야. 기존 데이터·지식 자료를 재사용하며 가상의 공지·마술사 기록을 사실로 표시하지 않음.
- 디자인 변경은 기사 DB, 관리자 인증, 개인정보, 자료 승인과 분리.
