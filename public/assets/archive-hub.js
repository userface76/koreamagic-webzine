/* Archive navigation: reuse actual database content; no reuploads or false history. */
(() => {
 'use strict';
 const tags=[['monthly','월간 웹진'],['magicians','마술사 A–Z'],['research','학술·연구'],['events','공연 기록'],['study','교육·실무'],['creations','창작·권리']];
 const nav=active=>'<div class="archive-hub-intro"><div class="eyebrow">THE MAGIC KNOWLEDGE LIBRARY</div><h2>마술의 어제와 오늘을 보관하는 지식도서관</h2><p>지난 웹진, 마술사들의 기록, 연구·공연·교육 자료를 분야별로 축적합니다.</p></div><div class="archive-tabs" role="tablist" aria-label="지식 아카이브 분야">'+tags.map(x=>'<button type="button" role="tab" data-archive-tab="'+x[0]+'" aria-selected="'+(active===x[0])+'" aria-controls="archive-panel" id="archive-tab-'+x[0]+'" class="'+(active===x[0]?'selected':'')+'">'+x[1]+'</button>').join('')+'</div>';
 const panel=(active,ctx)=>{
  const {data,articleCard,promoCard,empty,E}=ctx;
  let content='';
  if(active==='magicians')content=window.KMS_MAGICIAN_AZ?.renderCatalog?.()||'<p>마술사 A–Z 자료를 불러오고 있습니다.</p>';
  else if(active==='research'){
   const list=(data?.articles||[]).filter(x=>['research','education','column'].includes(x.category));
   content='<div class="section-heading"><div><div class="eyebrow">ACADEMIC RESEARCH</div><h2>연구·칼럼·교육 기록</h2></div></div><p class="archive-description">현재 웹진에 노출된 관련 기사를 모아 보여줍니다. 원문 논문 저장과 학술 심사 기능은 추후 확장합니다.</p><div class="list-articles">'+(list.map(articleCard).join('')||empty('등록된 자료가 없습니다.'))+'</div>';
  }else if(active==='events'){
   const list=data?.promotions||[];
   content='<div class="section-heading"><div><div class="eyebrow">PERFORMANCE HISTORY</div><h2>공연·행사 자료</h2></div></div><p class="archive-description">현재 웹진에 불러온 공연·행사 정보입니다. 전년도 모든 공연의 완전한 기록은 아직 제공하지 않습니다. 샘플 행사는 실제 행사가 아닙니다.</p><div class="list-promotions">'+(list.map(promoCard).join('')||empty('등록된 공연 기록이 없습니다.'))+'</div>';
  }else if(active==='study'){
   const lessons=window.KMS_STUDY?.lessons||[];
   content='<div class="section-heading"><div><div class="eyebrow">ONGOING EDUCATION</div><h2>마술사 교육·공연 실무자료</h2></div><button type="button" class="primary-btn" data-view="study">스터디센터 열기 ↗</button></div><p class="archive-description">연기·유머·관객 심리·무대 기술·수익 설계 등을 다루는 교육자료 목록입니다.</p><div class="archive-study-grid">'+lessons.slice(0,9).map(x=>'<article class="archive-study-card"><span>'+E(x.section)+' · '+E(x.level)+'</span><h3>'+E(x.title)+'</h3><p>'+E(x.summary)+'</p><button type="button" data-view="study">학습하기 ↗</button></article>').join('')+'</div>';
  }else if(active==='creations')content='<div class="archive-coming"><div class="eyebrow">COMING SOON</div><h2>창작물 기록·권리 자료</h2><p>작품의 제작 이력, 원본 기록 방법, 이용허락 관리와 창작권 보호 자료를 정리할 예정입니다. 현재 법적 등록이나 권리 인증 서비스를 제공하지 않습니다.</p><button type="button" class="outline-btn" data-view="study">관련 교육자료 보기 ↗</button></div>';
  else content=empty('준비 중인 아카이브입니다.');
  return '<div id="archive-panel" role="tabpanel" aria-labelledby="archive-tab-'+E(active)+'" tabindex="0">'+content+'</div>';
 };
 window.KMS_ARCHIVE_HUB={tabs:nav,panel};
})();