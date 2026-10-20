/* Korean Magic Society living study library. Guides only; no remote writes. */
(() => {
  'use strict';
  const data=window.KMS_STUDY;if(!data)return;
  const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state={category:'all',query:'',selected:null};
  const entries=data.lessons.slice().sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
  const featured=entries[Math.floor(Date.now()/604800000)%entries.length];
  const key='kms-study-checklist-v1';
  const done=(()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{return {}}})();
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(done))}catch{}};
  const notice=()=>'<p class="study-notice">'+E(data.notice)+'<br>새 자료는 편집진 검토 후 추가합니다. 회원 글쓰기·영상 업로드·댓글은 아직 미개통입니다.</p>';
  const lesson=x=>'<article class="study-lesson-card"><div class="study-card-meta"><span>'+E(x.section)+' · '+E(x.level)+'</span><time datetime="'+E(x.updated_at)+'">갱신 '+E(x.updated_at)+'</time></div><h3>'+E(x.title)+'</h3><p>'+E(x.summary)+'</p><div class="study-card-footer"><span>'+E(x.tag)+'</span><button type="button" data-study-open="'+E(x.id)+'">학습하기 ↗</button></div></article>';
  function detail(x){
    return '<div class="study-lesson-detail"><button type="button" class="study-back" data-study-back>← 목록으로</button>'+
      '<span class="study-pill">'+E(x.section)+' · '+E(x.level)+' · 교육용 시안</span><h2>'+E(x.title)+'</h2><p class="study-lead">'+E(x.summary)+'</p>'+
      '<div class="study-detail-grid"><section class="study-panel"><h3>학습 포인트</h3><ol>'+x.steps.map(a=>'<li>'+E(a)+'</li>').join('')+'</ol></section>'+
      '<section class="study-panel study-action"><h3>이번 주 실습</h3><p>'+E(x.practice)+'</p><h3>동료 피드백 질문</h3><p>'+E(x.reflection)+'</p>'+
      '<button type="button" data-study-copy="'+E(x.id)+'">피드백 질문지 복사</button><p class="study-copy-status" role="status"></p></section></div>'+
      '<p class="study-caption">최근 갱신 '+E(x.updated_at)+' · 학회 심사·인증을 받은 강좌가 아닌 초기 교육자료입니다.</p></div>'+notice();
  }
  function library(){
    const matches=entries.filter(x=>(state.category==='all'||x.category===state.category)&&(!state.query||[x.title,x.summary,x.tag,x.section].join(' ').includes(state.query)));
    const groups=data.checklist.map((g,i)=>'<section class="study-panel"><h3>'+E(g.title)+'</h3>'+g.items.map((item,j)=>{
      const id=i+'-'+j;return '<label class="study-check"><input type="checkbox" data-study-check="'+id+'" '+(done[id]?'checked':'')+'/><span>'+E(item)+'</span></label>';
    }).join('')+'</section>').join('');
    return '<section class="study-hero"><div><span class="study-eyebrow">MAGICIAN CONTINUING EDUCATION</span><h1>마술사 스터디 · 공연실무센터</h1><p>경력 1년이든 20년이든, 무대는 계속 바뀝니다.<br>작품·연기·유머·관객 심리·임기응변·공연기술·수익 설계까지 꾸준히 학습합니다.</p><div class="study-hero-stat">'+data.lessons.length+'개 학습자료 · '+(data.categories.length-1)+'개 분야 · 편집 갱신 '+E(data.last_editorial_review)+'</div></div><div class="study-hero-art" aria-hidden="true">✦</div></section>'+
      notice()+
      '<section class="study-highlight"><div><span class="study-pill">이번 주 추천 · 보유 자료 순환</span><h2>'+E(featured.title)+'</h2><p>'+E(featured.summary)+'</p></div><button type="button" data-study-open="'+E(featured.id)+'">읽기 ↗</button></section>'+
      '<section class="study-mini-grid"><article><h3>♫ 조명·음향·공연 컨디션</h3><p>공연장에 가기 전 기술 라이더와 현장 점검 항목을 정리합니다.</p><button data-study-jump="study-checklist">체크리스트 ↓</button></article><article><h3>◎ 20년 차도 배우는 피드백</h3><p>동료와 관객의 시선에서 작품과 공연을 다시 확인합니다.</p><button data-study-jump="study-cases">스터디 사례 ↓</button></article><article><h3>₩ 수익 다각화</h3><p>정기 공연, 기업 워크숍, 교재·교육 상품의 가능성을 탐색합니다.</p><button data-study-cat="business">수익 설계 팁 ↗</button></article></section>'+
      '<section id="study-learning"><div class="section-heading"><div><div class="eyebrow">UPDATED LEARNING MATERIALS</div><h2>꾸준히 쌓이는 교육자료 · 팁</h2></div></div>'+
      '<div class="study-chips">'+data.categories.map(c=>'<button type="button" data-study-cat="'+E(c.id)+'" class="study-chip '+(state.category===c.id?'active':'')+'" aria-pressed="'+(state.category===c.id?'true':'false')+'">'+E(c.icon)+' '+E(c.label)+'</button>').join('')+'</div>'+
      '<form id="studySearch" class="study-search"><label for="studyQuery">학습자료 검색</label><input id="studyQuery" name="q" value="'+E(state.query)+'" placeholder="마이크, 개그, 계약 등" /><button type="submit">검색</button></form>'+
      '<div class="study-lesson-grid">'+(matches.map(lesson).join('')||'<p>검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>')+'</div></section>'+
      '<section id="study-checklist"><div class="section-heading"><div><div class="eyebrow">VENUE READINESS</div><h2>공연 컨디션 체크리스트</h2></div><button type="button" class="study-clear" data-study-clear>점검 초기화</button></div>'+
      '<p class="study-caption">점검 상태는 이 기기에만 저장됩니다. 공연장 안전 규정과 기술 담당자의 점검이 우선입니다.</p>'+
      '<div class="study-checklist-grid">'+groups+'</div><p class="study-progress" role="status" id="studyProgress">'+Object.values(done).filter(Boolean).length+' / '+data.checklist.reduce((n,g)=>n+g.items.length,0)+'개 점검</p></section>'+
      '<section id="study-cases"><div class="section-heading"><div><div class="eyebrow">PEER FEEDBACK · PRACTICE CASES</div><h2>공연 사례와 동료 피드백</h2></div></div>'+
      '<p class="study-caption">실제 제보가 아닌 가상 학습 사례입니다. 회원 사례 제출과 댓글·영상 공유는 개인정보·창작물 이용 동의 체계 마련 후 제공합니다.</p>'+
      '<div class="study-case-grid">'+data.cases.map(c=>'<article class="study-case"><span>가상 사례 · '+E(c.field)+'</span><h3>'+E(c.title)+'</h3><p><b>문제</b> '+E(c.problem)+'</p><p><b>피드백 예시</b> '+E(c.suggestion)+'</p></article>').join('')+'</div></section>';
  }
  const api={render(){const x=entries.find(x=>x.id===state.selected);return x?detail(x):library();}};
  function redraw(scroll){
    if(location.hash!=='#study')return;
    document.getElementById('app').innerHTML=api.render();
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }
  document.addEventListener('click',async e=>{
    if(location.hash!=='#study')return;
    const c=e.target.closest('[data-study-cat]'),o=e.target.closest('[data-study-open]'),b=e.target.closest('[data-study-back]');
    const clear=e.target.closest('[data-study-clear]'),jump=e.target.closest('[data-study-jump]'),copy=e.target.closest('[data-study-copy]');
    if(c){state.category=c.dataset.studyCat;state.query='';state.selected=null;redraw(false);document.getElementById('study-learning')?.scrollIntoView({block:'start'});}
    else if(o){state.selected=o.dataset.studyOpen;redraw(true);}
    else if(b){state.selected=null;redraw(true);}
    else if(clear){for(const k of Object.keys(done))delete done[k];save();redraw(false);}
    else if(jump){document.getElementById(jump.dataset.studyJump)?.scrollIntoView({block:'start'});}
    else if(copy){
      const x=entries.find(x=>x.id===copy.dataset.studyCopy);if(!x)return;
      const txt=['스터디 피드백 질문지','주제: '+x.title,'실습: '+x.practice,'질문: '+x.reflection,'유지할 것: ','변경할 것: ','다음 실험: ','촬영과 공유는 권리자의 동의가 필요합니다.'].join('\n');
      const p=document.querySelector('.study-copy-status');
      try{await navigator.clipboard.writeText(txt);if(p)p.textContent='질문지를 복사했습니다.';}catch{if(p)p.textContent='복사 기능이 제한된 브라우저입니다.';}
    }
  });
  document.addEventListener('change',e=>{
    if(location.hash!=='#study'||!e.target.matches('[data-study-check]'))return;
    done[e.target.dataset.studyCheck]=e.target.checked;save();
    const p=document.getElementById('studyProgress');
    if(p)p.textContent=Object.values(done).filter(Boolean).length+' / '+data.checklist.reduce((n,g)=>n+g.items.length,0)+'개 점검';
  });
  document.addEventListener('submit',e=>{
    if(location.hash!=='#study'||e.target.id!=='studySearch')return;
    e.preventDefault();state.query=e.target.querySelector('[name=q]')?.value.trim()||'';redraw(false);
  });
  window.KMS_STUDY_UI=api;
})();
