(() => {
 'use strict';
 const $ = s => document.querySelector(s);
 const app=$('#app');
 const state={view:'home',data:null,preview:false,config:null,query:'',category:'',formType:'marketplace',demoCount:0,adminToken:'',queue:null,detail:null,issue:null};
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmtPrice=p=>Number(p??0).toLocaleString('ko-KR')+'원';
 const fmtDate=d=>d?String(d).slice(0,10).replaceAll('-','.'):'날짜 미정';
 const artLabels={news:'학회 소식',research:'연구 동향',column:'전문가 칼럼',education:'마술 교육',show:'공연소식'};
 const catLabels={props:'마술도구',stage:'공연장비',costume:'의상·소품',books:'마술 서적',other:'기타'};
 const icons={research:'✦',column:'♠',education:'✳',news:'✧',show:'✦',props:'♠',stage:'✣',books:'▤',costume:'♛',other:'✳'};
 const isDemo=id=>String(id||'').startsWith('demo-')||String(id||'').startsWith('sample')||/^[mp]\d+$/.test(String(id||''));
 const safeLink=v=>{try{let u=new URL(v);return u.protocol==='https:'?u.toString():'';}catch{return '';}};
 const articleCard=(a,i=0)=>`<article class="article-card" tabindex="0" role="button" data-detail-article="${E(a.id)}"><div class="art-visual art-${E(a.category||'news')}">${icons[a.category]||'✦'}${isDemo(a.id)?'<span class="sample-ribbon">샘플</span>':''}</div><div class="art-pad"><div class="label-pill">${E(artLabels[a.category]||'MAGIC NEWS')} ${isDemo(a.id)?'· 샘플':''}</div><h3>${E(a.title)}</h3><p>${E(a.summary)}</p><div class="smallmeta">${E(a.publisher||'편집부')} · ${fmtDate(a.published_at)}</div></div></article>`;
 const marketCard=(m,i=0)=>`<article class="market-card"><div class="market-art market-${E(m.category||'props')}">${icons[m.category]||'✦'}${isDemo(m.id)?'<span class="sample-ribbon">샘플</span>':''}</div><div class="market-pad"><div class="market-meta">${E(catLabels[m.category]||'마술장터')} · ${m.item_condition==='new'?'새상품':'중고'}${isDemo(m.id)?' · 거래 불가':''}</div><h3>${E(m.title)}</h3><div class="price">${fmtPrice(m.price_krw)}</div><div class="market-footer"><span>⌖ ${E(m.region||'지역 미표기')} · ${E(m.seller_alias||'판매자')}</span>${!isDemo(m.id)&&safeLink(m.contact_url)?`<a href="${E(safeLink(m.contact_url))}" target="_blank" rel="noopener noreferrer">판매자 문의 ↗</a>`:`<button data-detail-market="${E(m.id)}">${isDemo(m.id)?'샘플 보기':'자세히 보기'} ↗</button>`}</div></div></article>`;
 const promoCard=p=>`<article class="promo-card"><div class="promo-date">${E((p.event_date||'').slice(5,7)||'—')}<b>${E((p.event_date||'').slice(8,10)||'--')}</b></div><div><div class="label-pill">${E(p.type==='education'?'MAGIC CLASS':p.type==='venue'?'VENUE':'SHOW & EVENT')} ${isDemo(p.id)?'· 샘플 행사':''}</div><h3>${E(p.title)}</h3><p>${E(p.description)}</p><small class="smallmeta">⌖ ${E(p.venue||'장소 미정')} · ${fmtDate(p.event_date)}</small>${safeLink(p.link_url)?`<p><a href="${E(safeLink(p.link_url))}" target="_blank" rel="noopener noreferrer">원문 보기 ↗</a></p>`:''}</div></article>`;
 const titlebar=(tag,title,desc)=>`<div class="page-hero"><div class="eyebrow">${tag}</div><h1>${title}</h1><p>${desc}</p></div>`;
 const empty=msg=>`<div class="empty">✳<br>${msg}</div>`;

 const demoTargets={articles:12,promotions:8,marketplace:12,issues:2,banners:1};
 function blendWithExamples(data){
   const real=data||{},sample=window.KMS_DEMO||{},combined={...real};
   let count=0;
   for(const [key,target] of Object.entries(demoTargets)){
     const existing=Array.isArray(real[key])?real[key]:[];
     const mock=Array.isArray(sample[key])?sample[key]:[];
     const needed=key==='banners'?(existing.length?0:mock.length):Math.max(0,target-existing.length);
     const ids=new Set(existing.map(x=>String(x.id)));
     const extras=mock.filter(x=>!ids.has(String(x.id))).slice(0,needed);
     combined[key]=existing.concat(extras);
     count+=extras.length;
   }
   state.demoCount=count;
   return combined;
 }
 function updateExampleNotice(){
   const bar=$('#demoBar');if(!bar)return;
   bar.hidden=!state.preview&&!state.demoCount;
   if(state.preview)bar.textContent=state.error||'디자인 시안입니다. 아래 콘텐츠는 실제 학회 소식·공연·판매글이 아닌 가상 예시입니다.';
   else if(state.demoCount)bar.textContent='샘플 콘텐츠 안내: 일부 기사는 가상 예시이며, 공연 일정·상품 판매·월간 발행호는 실제가 아닙니다. 정식 자료 등록 시 해당 칸은 실제 데이터로 대체됩니다.';
 }


 function adSidebar(){
   const banners=state.data?.banners||[];
   const real=banners.find(x=>!isDemo(x.id)&&x.position==='sidebar'&&safeLink(x.image_url)&&safeLink(x.link_url));
   if(real)return `<a class="ad-card" style="padding:0;overflow:hidden;border-style:solid" href="${E(safeLink(real.link_url))}" target="_blank" rel="noopener noreferrer" aria-label="${E(real.title)}"><img src="${E(safeLink(real.image_url))}" alt="${E(real.title)}" style="width:100%;height:235px;object-fit:cover"></a>`;
   const demo=banners.filter(x=>isDemo(x.id));
   if(demo.length)return `<div class="demo-ads">${demo.map(a=>`<div class="demo-ad-card demo-ad-${E(a.art||'show')}" aria-label="${E(a.title)}: 실제 광고가 아닌 샘플"><span class="demo-ad-label">SAMPLE · 시안 광고</span><span class="demo-ad-icon" aria-hidden="true">${a.art==='class'?'✦':a.art==='create'?'♛':'♠'}</span><strong>${E(a.title)}</strong><small>${E(a.subtitle||'홍보 이미지 예시')}</small></div>`).join('')}</div>`;
   return `<div class="ad-card"><div class="ad-mark">✧</div><strong>당신의 무대를<br>소개하세요</strong><span>공연·행사 홍보 배너 공간<br>300 × 250 권장</span></div>`;
 }
 function openDetail(type,id){
  const row=(type==='article'?state.data.articles:state.data.marketplace).find(x=>x.id===id);
  if(!row)return;
  let detail=document.createElement('div');detail.className='overlay';detail.id='detailOverlay';
  detail.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="${E(row.title)}"><button class="modal-close" id="closeModal" aria-label="닫기">×</button><div class="eyebrow">${type==='article'?'MAGIC STORY':'MAGIC MARKETPLACE'} ${isDemo(row.id)?'· 샘플':''}</div><h2>${E(row.title)}</h2><p class="compact">${type==='article'?E(row.publisher||'학회 편집부')+' · '+fmtDate(row.published_at):E(row.region||'지역 미표기')+' · '+E(row.seller_alias)}</p>${isDemo(row.id)?'<p class="sample-notice">가상 시연용 콘텐츠입니다. 실제 학술발표 또는 판매 상품이 아닙니다.</p>':''}<div class="modal-contents">${E(type==='article'?row.body||row.summary:row.description)}</div>${type==='marketplace'?`<h3>${fmtPrice(row.price_krw)}</h3>${!isDemo(row.id)&&safeLink(row.contact_url)?`<a class="primary-btn" target="_blank" rel="noopener noreferrer" href="${E(safeLink(row.contact_url))}">판매자에게 문의 ↗</a>`:isDemo(row.id)?'<p class="compact">시안용 상품으로 실제 거래·문의가 불가능합니다.</p>':'<p class="compact">문의 링크가 아직 등록되지 않았습니다.</p>'}`:safeLink(row.source_url)?`<a class="outline-btn" target="_blank" rel="noopener noreferrer" href="${E(safeLink(row.source_url))}">원문 출처 ↗</a>`:''}</div>`;
  document.body.appendChild(detail);detail.querySelector('#closeModal').focus();
  detail.addEventListener('click',e=>{if(e.target===detail||e.target.id==='closeModal')detail.remove()});
 }
 function study(){return window.KMS_STUDY_UI?.render()||'<div class="empty">스터디 교육자료를 준비하고 있습니다.</div>';}
 function home(){const d=state.data;const promo=d.promotions||[];const articles=d.articles||[];const market=d.marketplace||[];return `
  <section class="hero-grid"><div class="hero-main"><div class="hero-content"><div class="hero-label">THE FUTURE OF MAGIC · VOL. 01</div><h1 class="hero-title">마술의 오늘을 기록하고<br><em>내일의 무대</em>를 열다</h1><p class="hero-desc">학회 연구에서 공연 현장, 마술인의 이야기까지.<br>마술의 모든 순간을 하나의 웹진에서 만납니다.</p><button class="hero-button" data-view="articles">웹진 소식 살펴보기 &nbsp; ↗</button></div><div class="magic-scene-controls" role="group" aria-label="마술 테마 배경 설정"><button type="button" data-magic-change aria-label="다른 마술 배경 보기">✦ 다른 배경</button><button type="button" data-magic-pause aria-pressed="false">⏸ 자동 변경 멈춤</button><span class="magic-scene-counter" data-magic-counter aria-live="off">01 / 04 · 별빛 마술극장</span></div></div>
  <aside class="hero-side"><div class="sidebar-top"><span class="eyebrow">ON STAGE</span><span>공연 · 행사</span></div><h3>지금 주목할<br>마술 무대</h3>${promo.slice(0,2).map(p=>`<div class="side-show"><div class="date">${fmtDate(p.event_date)}</div><strong>${E(p.title)}${isDemo(p.id)?' · 샘플':''}</strong><small>⌖ ${E(p.venue||'장소 미정')}</small></div>`).join('')||'<p>현재 등록된 공연소식이 없습니다.</p>'}<button class="side-link" data-view="promotions">공연 소식 전체보기 &nbsp; ↗</button></aside></section>
  <div class="two-col"><section><div class="section-heading"><div><div class="eyebrow">LATEST STORIES</div><h2>새로운 마술 이야기</h2></div><button class="more" data-view="articles">모두 보기 ↗</button></div><div class="article-grid">${articles.slice(0,4).map(articleCard).join('')||empty('등록된 기사가 없습니다.')}</div></section><aside><div class="section-heading"><div><div class="eyebrow">PROMOTION</div><h2>홍보 & 광고</h2></div></div>${adSidebar()}<div class="mini-info"><h3>공연소식 제보</h3><p>새로운 마술공연과 공연장 소식, 강좌 정보를 알려주세요. 확인 후 웹진에 소개합니다.</p><button data-view="submit" data-form="promotion">공연 홍보 등록 ↗</button></div></aside></div>
  <section class="market-intro"><div class="section-heading" style="margin-top:0"><div><div class="eyebrow">MAGIC MARKETPLACE</div><h2>마술장터 <span style="color:#bd8551;font-size:13px;vertical-align:middle">NEW</span></h2></div><button class="more" data-view="marketplace">장터 전체보기 ↗</button></div><div class="market-grid">${market.slice(0,3).map(marketCard).join('')||empty('아직 등록된 장터 상품이 없습니다.')}</div></section>

  <section class="study-promo-home" aria-label="마술사 스터디 센터">
    <div><span class="eyebrow">MAGICIAN CONTINUING STUDY</span><h2>20년 경력의 마술사도<br>계속 성장하는 공간</h2>
    <p>조명·음향·공연장 컨디션부터 작품 만들기, 연기자 마인드, 유머·관객 심리·임기응변, 실질적 수익 만들기까지. 현장 노하우를 기록하고 동료와 배우는 스터디.</p>
    <button type="button" data-view="study">스터디 자료 둘러보기 ↗</button></div><div class="study-promo-symbol" aria-hidden="true">✦</div>
  </section>
  <section class="coming-platform" aria-label="학회 미래 서비스 시안">
    <div class="section-heading"><div><div class="eyebrow">KNOWLEDGE · EDUCATION · CREATION</div><h2>마술인을 위한 더 넓은 공간</h2></div><span class="coming-hint">아래 세 영역은 개발 예정인 서비스 시안입니다.</span></div>
    <div class="coming-grid">
      <article class="coming-card research-space"><span class="coming-label">연구 발표 공간 · 개발 예정</span><div class="coming-icon" aria-hidden="true">▤</div><h3>학술연구실</h3><p>논문 초록 제출, 공연 사례연구, 연구자 소개와 자료 아카이브를 위한 공간입니다.</p></article>
      <article class="coming-card academy-space"><span class="coming-label">학습 공간 · 개발 예정</span><div class="coming-icon" aria-hidden="true">✳</div><h3>마술 아카데미</h3><p>기초 기술부터 공연 운영·AI 활용까지 단계별 커리큘럼과 실습을 준비합니다.</p></article>
      <article class="coming-card copyright-space"><span class="coming-label">창작 기록 · 개발 예정</span><div class="coming-icon" aria-hidden="true">♛</div><h3>창작권리센터</h3><p>창작물 원본 기록과 이용허락 관리 기능을 구상합니다. 법적 등록을 대신하지 않습니다.</p></article>
    </div>
  </section>
  <div class="bannerstrip"><div><div class="eyebrow">OPEN FOR EVERY MAGICIAN</div><h3>마술의 무대가 연결되는 곳, 한국마술학회 웹진</h3><p>공연 소식 제보 · 장터 판매글 등록 · 학회 홍보 문의</p></div><button data-view="submit">지금 소식 등록하기 ↗</button></div>`;}
 function articles(){const a=(state.data?.articles||[]).filter(x=>(!state.category||x.category===state.category)&&(!state.query||(`${x.title} ${x.summary}`).includes(state.query)));
 return `${titlebar('NEWS & RESEARCH','학회·연구 소식','마술 연구, 전문가 칼럼, 교육과 학회 소식을 모았습니다.')}<div class="tool-row"><div class="chip-row">${[['','전체'],['research','연구 동향'],['news','학회 소식'],['column','칼럼'],['education','교육']].map(([v,t])=>`<button class="filter-chip ${state.category===v?'active':''}" data-filter="${v}">${t}</button>`).join('')}</div><input aria-label="기사 검색" id="search" placeholder="기사 검색" value="${E(state.query)}"/></div><div class="list-articles">${a.map(articleCard).join('')||empty('검색 결과가 없습니다.')}</div>`;}
 function promotions(){const p=state.data?.promotions||[];return `${titlebar('MAGIC PERFORMANCE','공연 · 공연장 · 행사','국내 마술공연과 공연장 및 교육 프로그램을 공유합니다.')}<div class="tool-row"><strong>공연 · 행사 ${p.length}건</strong><button class="primary-btn" data-view="submit" data-form="promotion">+ 공연 정보 제보</button></div><div class="list-promotions">${p.map(promoCard).join('')||empty('등록된 공연소식이 없습니다.')}</div><div class="form-note">승인된 출처의 공연정보는 일정·장소 등 필수 정보를 확인한 후 자동 발행될 수 있습니다. 출처·일정이 미확인된 소식은 편집진 검토함으로 전달됩니다.</div>`;}
 function marketplace(){const m=(state.data?.marketplace||[]).filter(x=>(!state.category||x.category===state.category)&&(!state.query||(`${x.title} ${x.description}`).includes(state.query)));
 return `${titlebar('MAGIC MARKETPLACE','마술장터','마술 도구와 공연 장비, 소품과 서적을 안전하게 연결하는 마술 전문 장터입니다.')}<div class="tool-row"><div class="chip-row">${[['','전체'],['props','마술도구'],['stage','무대장비'],['costume','의상·소품'],['books','마술 서적'],['other','기타']].map(([v,t])=>`<button class="filter-chip ${state.category===v?'active':''}" data-filter="${v}">${t}</button>`).join('')}</div><input aria-label="장터 검색" id="search" placeholder="장터 상품 검색" value="${E(state.query)}"/></div><div class="tool-row"><span class="compact">표시 상품 ${m.length}개 (샘플 포함) · 관리자 승인제 · 거래대금 중개 없음</span><button class="primary-btn" data-view="submit" data-form="marketplace">+ 판매글 등록</button></div><div class="market-grid">${m.map(marketCard).join('')||empty('조건에 맞는 판매글이 없습니다.')}</div><div class="form-note">장터 운영 안내: 플랫폼은 거래 상대방을 보증하거나 결제를 중개하지 않습니다. 선입금 사기 주의, 구매 전 실물 확인 권장. 샘플 게시물로는 거래할 수 없습니다.</div>`;}
 function issues(){const items=state.data?.issues||[];if(state.issue){return `${titlebar('MONTHLY DIGEST',E(state.issue.issue.title),isDemo(state.issue.issue.id)?'실제 발행물이 아닌 월간 웹진 구성 예시입니다.':'해당 기간에 발행된 기사들을 모았습니다.')}<div class="tool-row"><button class="outline-btn" data-view="issues">← 목록으로</button><button class="outline-btn" id="printIssue">인쇄 / PDF 저장</button></div><div class="list-articles">${state.issue.items.map(articleCard).join('')||empty('이 호에는 수록 기사가 없습니다.')}</div>`;}
 return `${titlebar('ARCHIVE','월간 웹진 아카이브','수시 발행한 기사를 매월 자동으로 정리합니다.')}<div class="section-heading"><h2>지난 호</h2></div>${items.map(i=>`<div class="issue-card"><div><div class="eyebrow">MONTHLY MAGAZINE ${isDemo(i.id)?'· SAMPLE':''}</div><h3>${E(i.title)}</h3><small class="compact">${fmtDate(i.start_at)} – ${fmtDate(i.end_at)}</small>${isDemo(i.id)?'<p class="sample-caption">가상 시안 발행호이며 실제 학회 발행물이 아닙니다.</p>':''}</div><button class="primary-btn" data-open-issue="${E(i.id)}">${isDemo(i.id)?'시안 보기':'웹진 보기'}</button></div>`).join('')||empty('아직 생성된 월간 통합본이 없습니다. 매월 1일에 지난달 기사를 묶습니다.')}`;}
 function submit(){const market=state.formType==='marketplace';return `${titlebar('CONTRIBUTE',market?'마술장터 판매글 등록':'공연 · 행사 홍보 제보','마술 관련 정보만 접수합니다. 담당자 확인 후 공개하며, 무관한 광고는 자동 비공개될 수 있습니다.')}<div class="form-panel"><div class="form-tabs"><button type="button" data-form="marketplace" class="${market?'active':''}">♠ 마술장터 등록</button><button type="button" data-form="promotion" class="${!market?'active':''}">✦ 공연 · 행사 홍보</button></div><form id="submitForm" class="form-grid"><div class="form-field full"><label for="title">${market?'판매 상품명':'행사·공연명'} *</label><input id="title" name="title" required minLength="5" maxLength="130" placeholder="${market?'예: 클로즈업 마술 카드 덱 판매':'예: 지역 마술 갈라쇼 공연 정보'}"/></div><div class="form-field full"><label for="description">내용 설명 *</label><textarea id="description" name="description" required minLength="15" maxLength="2000" placeholder="${market?'제품 상태, 구성품, 실제 사용기간 등을 기재해 주세요.':'공연 소개, 주최 정보, 정확한 행사 내용을 기재해 주세요.'}"></textarea></div>${market?`
 <div class="form-field"><label for="category">상품 종류</label><select name="category" id="category"><option value="props">마술도구</option><option value="stage">공연장비</option><option value="costume">의상·소품</option><option value="books">마술 서적</option><option value="other">기타</option></select></div>
 <div class="form-field"><label for="item_condition">상품 상태</label><select name="item_condition" id="item_condition"><option value="used">중고</option><option value="new">새상품</option></select></div>
 <div class="form-field"><label for="price_krw">판매가격 (원) *</label><input id="price_krw" name="price_krw" type="number" min="0" max="100000000" required placeholder="30000"/></div>
 <div class="form-field"><label for="region">거래 지역</label><input id="region" name="region" maxlength="45" placeholder="예: 서울 강서구 (상세 주소 제외)"/></div>
 <div class="form-field"><label for="seller_alias">판매자 별명 *</label><input id="seller_alias" name="seller_alias" required minLength="2" maxlength="40" placeholder="공개용 닉네임"/></div>
 <div class="form-field"><label for="contact_url">문의 링크 (HTTPS)</label><input id="contact_url" name="contact_url" type="url" placeholder="https://..."/></div>`:`
 <div class="form-field"><label for="type">홍보 종류</label><select id="type" name="type"><option value="show">마술 공연</option><option value="venue">공연장 소식</option><option value="education">마술 교육</option><option value="contest">경연·대회</option></select></div>
 <div class="form-field"><label for="venue">공연장·장소</label><input id="venue" name="venue" maxlength="100" placeholder="공연장명과 지역"/></div>
 <div class="form-field"><label for="event_date">행사 일자</label><input id="event_date" name="event_date" type="date"/></div>
 <div class="form-field"><label for="link_url">공식 안내 링크 (HTTPS)</label><input id="link_url" name="link_url" type="url" placeholder="https://..."/></div>`}
 <div class="form-field full"><label for="image_url">이미지 링크 (선택 · HTTPS)</label><input id="image_url" name="image_url" type="url" placeholder="https://... (업로드는 후속 버전에서 지원)"/></div>
 <div class="form-field full"><div id="turnstileWidget"></div></div>
 <div class="form-field full"><div class="form-note">제보자는 게시 내용과 이미지의 이용 권한을 보유해야 합니다. 개인정보·전화번호·계좌번호를 본문에 작성하지 마세요. 실제 접수는 Cloudflare Turnstile 설정 후 활성화됩니다.</div><button type="submit" class="primary-btn" id="sendPost">${market?'판매글 접수':'홍보 정보 접수'} →</button><div id="formResult" role="status" aria-live="polite"></div></div></form></div>`;}
 function admin(){const q=state.queue;return `${titlebar('EDITORIAL DESK','웹진 편집·관리자','기사 · 공연 홍보 · 마술장터 승인함 (관리자 인증 필요)')}<div class="form-panel" style="max-width:100%;margin-bottom:22px"><h3>관리자 인증</h3><p class="compact">Cloudflare Worker Secret으로 등록한 ADMIN_API_TOKEN을 입력하세요. 토큰은 브라우저 저장소에 보관하지 않습니다.</p><div class="admin-auth"><input id="adminToken" type="password" autocomplete="off" placeholder="관리자 API 토큰 (최소 32자)"/><button class="primary-btn" id="loadQueue">승인함 열기</button></div><button class="outline-btn" id="importFeeds">승인된 RSS 출처 지금 수집</button> <button class="outline-btn" id="createIssue">지난달 통합본 생성</button><div id="adminMsg" class="compact" style="margin-top:14px"></div></div>
 <div class="admin-double">
  <form id="adminArticleForm" class="form-panel"><h3>✳ 학회 기사 작성</h3><div class="form-field"><label>제목</label><input name="title" required minLength="5" placeholder="마술 연구·학회 소식"/></div><div class="form-field"><label>분류</label><select name="category"><option value="news">학회 뉴스</option><option value="research">연구 동향</option><option value="column">전문가 칼럼</option><option value="education">교육</option></select></div><div class="form-field"><label>요약</label><input name="summary" placeholder="기사 한 줄 요약"/></div><div class="form-field"><label>본문</label><textarea name="body" minLength="25" required placeholder="학회 기사 본문 작성"></textarea></div><div class="form-field"><label>게시자</label><input name="publisher" placeholder="학회 편집부"/></div><label class="compact"><input name="publish" type="checkbox"/> 즉시 게시 (미선택 시 대기함)</label><button class="primary-btn" type="submit">기사 저장</button><p id="adminArticleMsg" class="compact"></p></form>
  <form id="adminBannerForm" class="form-panel"><h3>✦ 사이드 홍보 배너 등록</h3><div class="form-field"><label>배너 제목</label><input name="title" required placeholder="공연 배너 홍보"/></div><div class="form-field"><label>이미지 HTTPS 주소</label><input name="image_url" required type="url" placeholder="https://.../poster.jpg"/></div><div class="form-field"><label>클릭 이동 HTTPS 링크</label><input name="link_url" required type="url" placeholder="https://..."/></div><button class="primary-btn" type="submit">홍보 배너 추가</button><p id="adminBannerMsg" class="compact"></p><div class="form-note">이미지 업로드·기존 배너 비활성화는 후속 작업입니다. 우선 사용 권한이 있는 이미지 URL을 등록합니다.</div></form>
 </div>${q?`<div class="section-heading"><h2>승인 대기 / 검토함</h2><span class="compact">명백한 스팸은 비공개 처리 · 나머지는 사람 검토</span></div>${[['article','기사',q.articles],['promotion','공연·행사',q.promotions],['marketplace','마술장터',q.marketplace]].map(([type,label,items])=>`<h3>${label} (${items.length})</h3>${items.map(item=>`<div class="queue-item"><div><strong>${E(item.title)}</strong><p>${E(item.description||'')}</p><small>${E(item.status)} · ${fmtDate(item.created_at)}</small></div><div class="queue-actions"><button data-review="${E(type)}|${E(item.id)}|published">승인·게시</button><button data-review="${E(type)}|${E(item.id)}|quarantined">검토함</button><button data-review="${E(type)}|${E(item.id)}|rejected">반려</button></div></div>`).join('')||'<p class="compact">대기 중인 게시물이 없습니다.</p>'}`).join('')}`:''}`;}
 function chooseView(view,formType=null){state.view=view;state.query='';state.category='';state.detail=null;if(view!=='issues')state.issue=null;if(formType)state.formType=formType;history.replaceState(null,'','#'+view);render();window.scrollTo({top:0,behavior:'instant'});}
 function render(){
   document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('selected',x.dataset.view===state.view));
   app.innerHTML=({home,articles,promotions,marketplace,issues,study,submit,admin}[state.view]||home)();
   updateExampleNotice();
   if(state.view==='submit')installTurnstile();
 }
 async function load(){
  if(location.protocol==='file:'){state.preview=true;state.data=blendWithExamples({});}
  else{
   try{const r=await fetch('/api/home');if(!r.ok)throw Error('HTTP '+r.status);state.data=blendWithExamples(await r.json());const cfg=await fetch('/api/config');state.config=cfg.ok?await cfg.json():null;}
   catch(e){state.data=blendWithExamples({});state.preview=true;state.error='데이터 API에 연결하지 못해 미리보기 샘플을 표시하고 있습니다. D1 마이그레이션 및 배포 설정을 확인하세요.';}
  }
  updateExampleNotice();
  state.view=['home','articles','promotions','marketplace','issues','study','submit','admin'].includes(location.hash.slice(1))?location.hash.slice(1):'home';
  render();
 }
 async function updateData(){if(state.preview)return;const r=await fetch('/api/home');if(r.ok){state.data=blendWithExamples(await r.json());updateExampleNotice();}}
 async function installTurnstile(){
   if(state.preview||!state.config?.turnstileSiteKey){const el=$('#turnstileWidget');if(el)el.innerHTML='<p class="compact">실제 접수는 Cloudflare Turnstile 키 설정 후 가능합니다. 현재는 화면 시안입니다.</p>';return;}
   const el=$('#turnstileWidget');if(!el)return;
   if(!window.turnstile){const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;script.onload=()=>{if($('#turnstileWidget'))window.turnstile.render('#turnstileWidget',{sitekey:state.config.turnstileSiteKey,callback:t=>window.__kmsTurnstile=t});};document.head.appendChild(script);}
   else window.turnstile.render('#turnstileWidget',{sitekey:state.config.turnstileSiteKey,callback:t=>window.__kmsTurnstile=t});
 }
 document.addEventListener('click',async e=>{
   const view=e.target.closest('[data-view]');if(view){e.preventDefault();chooseView(view.dataset.view,view.dataset.form||null);return;}
   const tab=e.target.closest('[data-form]');if(tab){state.formType=tab.dataset.form;render();return;}
   const fil=e.target.closest('[data-filter]');if(fil){state.category=fil.dataset.filter;render();return;}
   const detail=e.target.closest('[data-detail-market]');if(detail){openDetail('marketplace',detail.dataset.detailMarket);return;}
   const story=e.target.closest('[data-detail-article]');if(story){openDetail('article',story.dataset.detailArticle);return;}
   const open=e.target.closest('[data-open-issue]');if(open){try{const id=open.dataset.openIssue;if(isDemo(id)){const issue=(state.data?.issues||[]).find(x=>x.id===id);if(!issue)throw Error('시안 발행호를 찾을 수 없습니다');state.issue={issue,items:(window.KMS_DEMO?.articles||[]).slice(0,6)};}else{const r=await fetch('/api/issues/'+encodeURIComponent(id));if(!r.ok)throw Error('발행호를 불러올 수 없습니다');state.issue=await r.json();}render();window.scrollTo(0,0);}catch(err){alert(err.message)}return;}
   if(e.target.id==='printIssue'){window.print();return;}
   if(e.target.id==='loadQueue'){state.adminToken=$('#adminToken').value.trim();await refreshQueue();return;}
   const review=e.target.closest('[data-review]');if(review){const [type,id,status]=review.dataset.review.split('|');if(!confirm(`이 항목을 '${status}' 상태로 변경할까요?`))return;try{await adminPost('/api/admin/review',{type,id,status});await refreshQueue();await updateData();}catch(err){alert(err.message);}return;}
   if(e.target.id==='importFeeds'){try{const r=await adminPost('/api/admin/import',{});$('#adminMsg').textContent='수집 결과: '+JSON.stringify(r.sources);await refreshQueue();}catch(err){$('#adminMsg').textContent=err.message;}return;}
   if(e.target.id==='createIssue'){try{const r=await adminPost('/api/admin/create-issue',{});$('#adminMsg').textContent='월간 통합본 생성: '+r.id;await updateData();}catch(err){$('#adminMsg').textContent=err.message;}return;}
 });
 document.addEventListener('change',e=>{if(e.target.id==='search'){state.query=e.target.value.trim();render();}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('#detailOverlay')?.remove();if(e.target.matches('[data-detail-article]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openDetail('article',e.target.dataset.detailArticle)}if(e.target.id==='search'&&e.key==='Enter'){state.query=e.target.value.trim();render();}});
 document.addEventListener('submit',async e=>{
  if(e.target.id==='adminArticleForm'||e.target.id==='adminBannerForm'){
    e.preventDefault();const isArticle=e.target.id==='adminArticleForm',kind=isArticle?'articles':'banners',payload=Object.fromEntries(new FormData(e.target).entries());
    if(isArticle)payload.publish=e.target.querySelector('[name=publish]').checked;
    const out=$(isArticle?'#adminArticleMsg':'#adminBannerMsg');
    try{const result=await adminPost('/api/admin/'+kind,payload);out.textContent='등록 완료: '+result.id;await updateData();e.target.reset();}
    catch(err){out.textContent='오류: '+err.message;}return;
  }
  if(e.target.id!=='submitForm')return;e.preventDefault();const r=$('#formResult');if(state.preview){r.innerHTML='<span class="error">현재 시안에서는 서버 접수가 불가능합니다. 실제 배포 후 D1·Turnstile 설정이 필요합니다.</span>';return;}
  const data=Object.fromEntries(new FormData(e.target).entries());data.turnstile_token=window.__kmsTurnstile||'';const btn=$('#sendPost');btn.disabled=true;
  try{const res=await fetch('/api/submissions/'+state.formType,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});const body=await res.json();if(!res.ok)throw Error(body.error||'접수 실패');r.innerHTML='<span class="success">'+E(body.message)+'</span>';e.target.reset();if(window.turnstile)window.turnstile.reset();}
  catch(err){r.innerHTML='<span class="error">'+E(err.message)+'</span>';}finally{btn.disabled=false;}
 });
 async function adminPost(path,data){const res=await fetch(path,{method:'POST',headers:{authorization:'Bearer '+state.adminToken,'content-type':'application/json'},body:JSON.stringify(data)});const body=await res.json();if(!res.ok)throw Error(body.error||'요청 실패');return body;}
 async function refreshQueue(){try{const r=await fetch('/api/admin/queue',{headers:{authorization:'Bearer '+state.adminToken}});const body=await r.json();if(!r.ok)throw Error(body.error||'관리자 인증 실패');state.queue=body;render();}catch(err){state.queue=null;const msg=$('#adminMsg');if(msg)msg.textContent=err.message;}}
 load();
})();
