/* Stage technical-rider helper: runs entirely in the visitor's browser. */
(() => {
 'use strict';
 const field=(id,label,placeholder,type='text')=>'<div><label for="'+id+'">'+label+'</label><input id="'+id+'" name="'+id+'" type="'+type+'" maxlength="100" placeholder="'+placeholder+'"/></div>';
 const drop=(id,label,options)=>'<div><label for="'+id+'">'+label+'</label><select name="'+id+'" id="'+id+'">'+options.map(x=>'<option>'+x+'</option>').join('')+'</select></div>';
 const form=[
  '<section id="study-rider" class="study-rider-block" aria-labelledby="studyRiderTitle">',
  '<div class="section-heading"><div><div class="eyebrow">STAGE TECHNICAL RIDER</div><h2 id="studyRiderTitle">공연장 기술 라이더 만들기</h2></div></div>',
  '<p class="study-caption">공연장과 미리 협의할 장비·환경·리허설 요구사항을 정리합니다. 입력한 정보는 서버에 전송하거나 저장하지 않으며, 완성된 초안은 공연장 담당자에게 전달할 수 있습니다.</p>',
  '<form id="studyRiderForm" class="study-panel study-rider-form">',
  field('riderShow','공연명','예: 30분 매직쇼'),
  field('riderVenue','공연장·지역','예: 지역 문화센터 소극장'),
  drop('riderType','공연 형태',['1인 무대 마술','클로즈업 공연','관객 참여형 공연','마술교육·워크숍','대형 일루전','버스킹·야외 공연']),
  field('riderDuration','공연시간(분)','예: 30','number'),
  field('riderStage','필요 무대 크기','예: 폭 5m × 깊이 3m'),
  drop('riderMic','마이크 요청',['핸즈프리/헤드셋 무선 마이크 1개','핸드 무선 마이크 1개','유선 마이크 1개','마이크 사용 안 함','현장 음향 담당자와 협의']),
  drop('riderPlayback','음악 재생·백업',['스테레오 음악 입력 + 예비 재생 장치','공연장 음악 재생 장치 사용','현장 음향 담당자와 협의','음악 사용 안 함']),
  drop('riderLighting','조명 요청',['무대 전면 기본 조명 + 큐 별도 협의','전면 스폿라이트 + 조명 큐','기본 공연장 조명','조명 담당자와 협의']),
  drop('riderRehearsal','최소 리허설 시간',['30분 요청','60분 요청','90분 요청','공연 규모에 따라 별도 협의']),
  '<div class="study-rider-full"><label for="riderNotes">추가 조건·안전 관련 안내</label><textarea id="riderNotes" name="notes" maxlength="700" rows="3" placeholder="예: 암전 신호, 측면 관객 시야, 소품 보관 공간, 기술 감독과 협의 사항"></textarea></div>',
  '<div class="study-rider-full"><button type="submit" class="study-rider-create">기술 라이더 초안 만들기</button><button type="reset" class="study-rider-clear">입력 초기화</button></div>',
  '</form>',
  '<div id="studyRiderOutput" class="study-rider-output" hidden><label for="studyRiderText"><b>공연장에 전달할 기술 라이더 초안</b></label><textarea id="studyRiderText" rows="19" readonly></textarea><button type="button" data-rider-copy>초안 복사</button><p id="studyRiderCopyStatus" role="status"></p></div>',
  '</section>'
 ].join('');
 const lines=fd=>{
   const v=k=>String(fd.get(k)||'').trim();
   const duration=/^\d{1,3}$/.test(v('riderDuration'))&&Number(v('riderDuration'))>0?String(Number(v('riderDuration')))+'분':'공연 시간 협의';
   const line=(label,val)=>'- '+label+': '+(val||'협의 예정');
   return [
   '공연 기술 라이더 / 공연장 사전 협의 요청서',
   '※ 본 문서는 웹진 스터디센터에서 만든 초안입니다. 공연장 담당자의 확인·승인 전에는 확정 조건이 아닙니다.',
   '',
   line('공연명',v('riderShow').slice(0,100)),
   line('공연장·지역',v('riderVenue').slice(0,100)),
   line('공연 유형',v('riderType')),
   line('공연 시간',duration),
   line('희망 무대 크기',v('riderStage').slice(0,100)),
   '',
   '[기술 요청]',
   line('마이크',v('riderMic')),
   line('음악·백업',v('riderPlayback')),
   line('조명',v('riderLighting')),
   line('최소 리허설',v('riderRehearsal')),
   line('추가 안내',v('riderNotes').slice(0,700)),
   '',
   '[현장에서 반드시 확인할 사항]',
   '□ 객석 앞·뒤에서 음성 명료도 및 음악 밸런스 확인',
   '□ 전면·측면·역광 및 관객 시야 확인',
   '□ 공연 큐시트, 음원 파일 형식, 예비 재생 수단 확인',
   '□ 출입 동선, 소품 놓을 곳, 전원과 안전 공간 확인',
   '□ 공연장 담당자와 큐 및 돌발상황 대응 순서 협의',
   '□ 화염·전기·리깅·고위험 연출은 안전 규정과 전문 인력의 별도 검토 후 결정',
   '',
   '[공연장 회신 요청]',
   '제공 가능한 장비:',
   '기술 담당자 확인:',
   '리허설 일정:',
   '조정이 필요한 사항:',
   '',
   '※ 개인 연락처나 공연 기법의 비밀을 기재하지 마세요.'
   ].join('\n');
 };
 document.addEventListener('submit',e=>{
   if(e.target.id!=='studyRiderForm')return;
   e.preventDefault();
   const output=document.getElementById('studyRiderOutput');
   const area=document.getElementById('studyRiderText');
   if(!output||!area)return;
   area.value=lines(new FormData(e.target));
   output.hidden=false;
   output.scrollIntoView({block:'nearest',behavior:'smooth'});
 });
 document.addEventListener('reset',e=>{
   if(e.target.id!=='studyRiderForm')return;
   const output=document.getElementById('studyRiderOutput');
   if(output)output.hidden=true;
 });
 document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-rider-copy]');
  if(!b)return;
  const area=document.getElementById('studyRiderText'),result=document.getElementById('studyRiderCopyStatus');
  if(!area)return;
  try{await navigator.clipboard.writeText(area.value);if(result)result.textContent='기술 라이더 초안을 복사했습니다.';}
  catch{area.focus();area.select();if(result)result.textContent='복사가 제한되었습니다. 선택된 문장을 직접 복사해 주세요.';}
 });
 window.KMS_TECH_RIDER={render:()=>form};
})();
