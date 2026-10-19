-- 견본 데이터: 실제 공연, 판매글, 학술행사 공지 아님. 운영 전 삭제 또는 교체.
INSERT OR IGNORE INTO articles (id,title,category,summary,body,origin,status,publisher,published_at) VALUES
('demo-news-1','공연예술과 AI 기술이 만나는 새로운 마술 무대','research','무대 연출·인터랙션·디지털 기술을 결합한 연구 주제를 소개하는 샘플 기사입니다.','이 글은 디자인 확인용 예시 기사입니다. 실제 학회 발표나 보도가 아닙니다.','demo','published','편집부 예시',datetime('now','-2 days')),
('demo-news-2','무대 마술의 관객 참여를 높이는 연출 전략','column','관객의 경험을 중심으로 공연을 설계하는 방법을 살펴봅니다.','디자인 확인용 예시 기사이며 공식 학술자료가 아닙니다.','demo','published','편집부 예시',datetime('now','-4 days')),
('demo-news-3','차세대 마술인을 위한 교육 프로그램 기획','education','세대별 마술교육 프로그램 운영을 위한 아이디어를 모았습니다.','디자인 확인용 예시 기사입니다.','demo','published','편집부 예시',datetime('now','-7 days')),
('demo-news-4','국내 마술공연 아카이브 구축의 방향','news','공연 기록과 무대 자료의 체계적인 축적 방법을 제안합니다.','디자인 확인용 예시 기사입니다.','demo','published','편집부 예시',datetime('now','-9 days'));
INSERT OR IGNORE INTO promotions (id,title,type,description,venue,event_date,source_name,status,published_at) VALUES
('demo-show-1','가을 매직 갈라 · 예시 행사','show','공연 일정 표시를 위한 예시입니다. 실제 공연이 아닙니다.','예시 공연장',date('now','+10 days'),'샘플','published',datetime('now')),
('demo-show-2','마술 워크숍 · 예시 프로그램','education','강좌 소개 영역 시연용 예시입니다.','예시 문화공간',date('now','+20 days'),'샘플','published',datetime('now'));
INSERT OR IGNORE INTO marketplace (id,title,category,description,price_krw,item_condition,region,seller_alias,status,published_at) VALUES
('demo-market-1','클로즈업 마술 카드 세트 · 샘플','props','디자인 확인을 위한 예시 판매글입니다. 실제 거래 불가.',18000,'used','서울','샘플판매자','published',datetime('now')),
('demo-market-2','무대 공연용 테이블 · 샘플','stage','디자인 확인을 위한 예시 판매글입니다. 실제 거래 불가.',120000,'used','경기','샘플판매자','published',datetime('now')),
('demo-market-3','마술 서적 컬렉션 · 샘플','books','디자인 확인을 위한 예시 판매글입니다. 실제 거래 불가.',35000,'used','부산','샘플판매자','published',datetime('now'));
INSERT OR IGNORE INTO banners(id,title,position,sort_order,active) VALUES
('demo-banner','학회 행사·공연 홍보 배너 광고 문의','sidebar',1,1);
