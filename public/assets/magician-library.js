/* Source-linked magician A-Z catalog and voluntary show coaching. No AI API or personal-data storage. */
(() => {
 'use strict';
 const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let db=null,letter='ALL',query='',lastAdvice='';
 const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
 const categories={card:['card','closeup','acting'],stage:['stage','illusion','storytelling'],mental:['psychology','acting'],comedy:['humor','acting'],family:['storytelling','humor'],other:['acting','storytelling']};
 const challenges={
   light:['객석 양쪽 끝과 뒤쪽에서 핵심 효과가 보이는지 확인합니다.','전면 기본광을 먼저 확보하고 그림자·역광을 무대 감독과 점검합니다.','기본 조명만 있는 소극장용 대체 버전을 준비합니다.'],
   sound:['객석 뒤에서 음성 명료도와 음악 음량을 확인합니다.','음악·대사를 분리한 큐시트를 공연장 기술 담당자와 공유합니다.','음원이 재생되지 않아도 진행할 수 있는 연결 멘트를 준비합니다.'],
   audience:['이 작품에서 관객이 느껴야 할 감정을 한 문장으로 정리합니다.','도입부 또는 반전 직전의 침묵 중 한 가지만 바꿔서 비교해 봅니다.','참여를 원하지 않는 관객도 배려할 대체 연출을 준비합니다.'],
   humor:['관객을 놀리는 웃음 대신 상황과 기대의 반전을 구성해 봅니다.','농담이 통하지 않으면 자연스럽게 다음 효과로 전환합니다.','대사의 순서와 멈춤을 바꾼 두 버전을 시연합니다.'],
   setup:['무대 크기·반입 동선·전원·대기공간을 사전에 확인합니다.','필수 소품과 대체 가능한 장비를 구분해 소극장 버전을 준비합니다.','전기·화염·리깅·신체 위험 요소는 전문 스태프와 별도 협의합니다.'],
   income:['단발 공연을 월 1회 정기 프로그램으로 제안하는 자료를 만듭니다.','공연과 연결되는 워크숍·강의·자료 판매 중 하나를 시험합니다.','준비시간·장비비·취소 조건을 고려해 적정 손익을 확인합니다.']
 };
 const focus={light:['stage','illusion'],sound:['stage','storytelling'],audience:['acting','storytelling'],humor:['humor'],setup:['stage','illusion'],income:['storytelling','research']};
 const safeUrl=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}};
 function sourceCards(p){
   const expanded=Array.isArray(p.coaching_lens)&&p.coaching_lens.length>0;
   const status=p.profile_status==='artist_authored'?'본인 소개':p.profile_status==='user_submitted'?'제공 자료 기반':expanded?'상세 프로필':'한글 색인·검토 중';
   const sources=Array.isArray(p.evidence)?p.evidence:[];
   const tags=Array.isArray(p.specialties)?p.specialties:[];
   return '<article class="magician-profile"><div class="magician-profile-heading"><strong>'+E(p.name_ko)+'</strong><span class="magician-status">'+status+'</span></div>'+
     '<p class="magician-name-en">'+E(p.display_name)+'</p><p class="magician-profile-years">'+(p.years==='미확인'?'':E(p.years)+' · ')+(tags.length?tags.map(t=>E(db.tags[t]||t)).join(' · '):'전문 분야 검토 중')+'</p>'+
     '<p>'+E(p.summary)+'</p>'+(expanded?'<h4>공연 학습 관점 <small>웹진 편집부 제안</small></h4><ul>'+p.coaching_lens.map(t=>'<li>'+E(t)+'</li>').join('')+'</ul>':p.profile_status==='artist_authored'?'<p class="magician-status-detail">본인이 제공한 활동 소개입니다. 자격증이나 의료·심리치료 전문면허를 의미하지 않습니다.</p>':p.profile_status==='user_submitted'?'<p class="magician-status-detail">제공된 프로필을 참고한 초안입니다. 소속·학력·경력은 외부 검증 전이며 영문명은 임시 로마자 표기입니다.</p>':'<p class="magician-status-detail">인물명은 색인에 등재되었으며 상세 약력·한글 표기는 추가 확인 중입니다.</p>')+
     '<div class="magician-profile-links">'+sources.map(x=>safeUrl(x.url)?'<a target="_blank" rel="noopener noreferrer" href="'+E(safeUrl(x.url))+'">'+E(x.title)+' ↗</a>':'').join('')+'</div></article>';
 }
 function library(){
   if(!db)return '<p class="study-caption">A–Z 지식 자료를 불러오는 중입니다…</p>';
   const list=db.profiles.filter(x=>(letter==='ALL'||x.initial===letter)&&(!query||[x.display_name,x.name_ko,x.summary,...x.specialties].join(' ').toLowerCase().includes(query.toLowerCase())));
   return '<div class="magician-library-intro"><h3>출처 확인된 마술사 '+db.profiles.length+'명</h3><p>'+E(db.notice)+'</p></div><div class="magician-letters">'+['ALL',...ABC].map(x=>'<button data-magician-letter="'+x+'" aria-pressed="'+String(letter===x)+'" class="'+(letter===x?'selected':'')+'">'+(x==='ALL'?'전체':x)+'</button>').join('')+'</div><form id="magicianAZSearch" class="magician-search"><label for="magicianAZQuery">마술사 이름·분야 검색</label><input id="magicianAZQuery" name="q" value="'+E(query)+'" placeholder="예: 후디니, Shin Lim, 카드"/><button type="submit">찾기</button></form><div class="magician-profiles">'+(list.length?list.map(sourceCards).join(''):'<p class="study-caption">이 글자에는 아직 검증된 인물 정보가 등록되지 않았습니다. A~Z 자료를 단계적으로 확장합니다.</p>')+'</div>';
 }
 function related(genre,challenge){
   const selectedTags=[...(categories[genre]||[]),...(focus[challenge]||[])];
   if(!db)return [];
   return db.profiles.map(p=>({p,score:p.specialties.filter(t=>selectedTags.includes(t)).length})).filter(x=>x.score>0&&x.p.coaching_lens?.length).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.p);
 }
 function advice(fd){
   const act=String(fd.get('act')||'').trim().slice(0,1000);
   const genre=String(fd.get('genre')||'other');
   const challenge=String(fd.get('challenge')||'audience');
   const audience=String(fd.get('audience')||'').trim().slice(0,60);
   const venue=String(fd.get('venue')||'').trim().slice(0,90);
   const goal=String(fd.get('goal')||'').trim().slice(0,160);
   const tips=challenges[challenge]||challenges.audience;
   const peers=related(genre,challenge);
   const intro='공연자가 말씀해 주신 작품: '+act.slice(0,160)+(act.length>160?'…':'');
   const situation='관객: '+(audience||'미정')+' · 현장: '+(venue||'미정')+' · 지키고 싶은 목표: '+(goal||'공연자가 결정');
   lastAdvice=[intro,situation,'선택 가능한 실험:',...tips.map((x,i)=>(i+1)+'. '+x),...peers.map(x=>x.display_name+': '+x.coaching_lens[0])].join('\n');
   return '<div class="magician-advice"><h3>작품을 존중하는 공연 조언</h3><p>'+E(intro)+'</p><p>'+E(situation)+'</p><p>실제 공연을 보거나 작품의 기법을 평가한 것은 아닙니다. 공연자의 의도는 유지하면서 다음 대안을 실험해 보세요.</p><ol>'+tips.map(t=>'<li>'+E(t)+'</li>').join('')+'</ol><h4>관련 마술사 학습 관점</h4>'+(peers.length?peers.map(p=>'<div class="magician-related"><b>'+E(p.name_ko)+' ('+E(p.display_name)+')</b><p>'+E(p.coaching_lens[0])+'</p><small>마술사의 직접 조언이 아닌 편집부의 응용 아이디어입니다.</small></div>').join(''):'<p>아직 검증된 인물 자료가 부족하여 일반 실무 제안만 표시합니다.</p>')+'<p class="study-caption">한 번에 하나만 시험하고 안전과 동의 여부를 먼저 확인하세요.</p><button type="button" data-magician-copy>제안 내용 복사</button><p class="magician-copy-status" role="status"></p></div>';
 }
 const form=[
 '<section class="magician-coach" id="magician-coach"><div class="section-heading"><div><div class="eyebrow">LISTEN FIRST</div><h2>공연 이야기를 듣고 조언하기</h2></div></div>',
 '<p class="study-caption">먼저 어떤 마술을 하는지 듣고 공연 조건과 목표에 맞춰 대처법을 제안합니다. 이 기능은 등록된 규칙과 인물 자료를 활용하는 시범 코칭이며 AI 영상 분석이 아닙니다. 입력 내용은 서버에 보내거나 저장하지 않습니다.</p>',
 '<form id="magicianCoachForm" class="study-panel magician-coach-form">',
 '<div class="magician-full"><label for="magicAct">어떤 작품인가요? 공연 내용을 들려주세요 *</label><textarea id="magicAct" name="act" minlength="12" maxlength="1000" rows="4" required placeholder="예: 관객이 선택한 카드가 마지막에 뜻밖의 장소에서 나타나는 공연입니다."></textarea></div>',
 '<div><label for="magicGenre">마술 분야</label><select id="magicGenre" name="genre"><option value="card">카드</option><option value="stage">무대·일루전</option><option value="mental">멘탈리즘·심리</option><option value="comedy">개그·코미디</option><option value="family">가족·어린이</option><option value="other">기타</option></select></div>',
 '<div><label for="magicChallenge">현재 고민</label><select id="magicChallenge" name="challenge"><option value="light">조명·시야</option><option value="sound">음향·마이크</option><option value="audience">관객 몰입</option><option value="humor">개그·대사</option><option value="setup">무대·소품</option><option value="income">수익·정기공연</option></select></div>',
 '<div><label for="magicAudience">주요 관객</label><input id="magicAudience" name="audience" maxlength="60" placeholder="예: 가족 관객"/></div>',
 '<div><label for="magicVenue">공연장 상황</label><input id="magicVenue" name="venue" maxlength="90" placeholder="예: 마이크 1대·조명 담당 없음"/></div>',
 '<div class="magician-full"><label for="magicGoal">작품에서 유지하고 싶은 목표</label><input id="magicGoal" name="goal" maxlength="160" placeholder="예: 관객의 선택이 마지막 반전으로 이어지게"/></div>',
 '<div class="magician-full"><button type="submit">공연 상황별 제안 받기</button><button type="reset" class="magician-reset">초기화</button></div></form><div id="magicianCoachResult" class="magician-result" hidden aria-live="polite"></div></section>',
 '<section class="magician-library"><div class="section-heading"><div><div class="eyebrow">VERIFIED REFERENCE LIBRARY</div><h2>전 세계 마술사 A–Z</h2></div></div><div id="magicianAZCatalog"></div></section>'
 ].join('');
 function paint(){const n=document.getElementById('magicianAZCatalog');if(n)n.innerHTML=library();}
 document.addEventListener('click',async e=>{
   if(location.hash!=='#study'&&location.hash!=='#issues')return;
   const x=e.target.closest('[data-magician-letter]');if(x){letter=x.dataset.magicianLetter;paint();return;}
   if(e.target.closest('[data-magician-copy]')){const n=document.querySelector('.magician-copy-status');try{await navigator.clipboard.writeText(lastAdvice);if(n)n.textContent='제안 내용을 복사했습니다.';}catch{if(n)n.textContent='클립보드를 사용할 수 없습니다.';}}
 });
 document.addEventListener('submit',e=>{
   if(location.hash!=='#study'&&location.hash!=='#issues')return;
   if(e.target.id==='magicianAZSearch'){e.preventDefault();query=e.target.querySelector('[name=q]').value.trim();paint();return;}
   if(e.target.id==='magicianCoachForm'){e.preventDefault();const n=document.getElementById('magicianCoachResult');if(n){n.innerHTML=advice(new FormData(e.target));n.hidden=false;}}
 });
 document.addEventListener('reset',e=>{if(e.target.id==='magicianCoachForm'){const n=document.getElementById('magicianCoachResult');if(n)n.hidden=true;lastAdvice='';}});
 window.KMS_MAGICIAN_AZ={render:()=>form,renderCatalog:()=>'<div id="magicianAZCatalog">'+library()+'</div>',refresh:paint};
 document.addEventListener('DOMContentLoaded',()=>{
  fetch('./assets/magicians-az.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(x=>{if(!Array.isArray(x.profiles))throw Error('invalid');db=x;paint();}).catch(()=>{const n=document.getElementById('magicianAZCatalog');if(n)n.textContent='A–Z 자료를 불러오지 못했습니다. 페이지 배포를 확인해 주세요.';});
 });
})();