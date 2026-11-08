(function galleryModule() {
  'use strict';
  const categories = [
    ['all', '전체'],
    ['research', '학술·연구'],
    ['performance', '공연·무대'],
    ['education', '교육·워크숍'],
    ['community', '교류·행사']
  ];
  const data = window.KMS_ACTIVITY_DATA || {approved:[], examples:[]};
  let currentCategory = 'all';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
  const imageUrl = value => {
    const raw = String(value || '');
    if (/^\.\/assets\/[a-zA-Z0-9/_-]+\.(?:svg|webp|png|jpe?g|avif)$/.test(raw)) return raw;
    try {
      const url = new URL(raw);
      return url.protocol === 'https:' ? url.href : '';
    } catch { return ''; }
  };
  const available = () => {
    const approved = (Array.isArray(data.approved) ? data.approved : [])
      .filter(x => x && x.approved === true && x.rights_confirmed === true && imageUrl(x.image_url));
    const examples = (Array.isArray(data.examples) ? data.examples : [])
      .map(x => ({...x, sample:true}));
    return [...approved, ...examples.slice(0, Math.max(0, 4 - approved.length))];
  };
  const categoryLabel = value => categories.find(([id])=>id===value)?.[1] || '학회 활동';
  const dateLabel = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value||'')) ? value.replaceAll('-','.') : '';
  const photosOf = item => {
    const list=Array.isArray(item.images)&&item.images.length?item.images:[{image_url:item.image_url,alt:item.alt||item.title}];
    return list.filter(p=>imageUrl(p.image_url)).map(p=>({url:imageUrl(p.image_url),alt:p.alt||item.title,caption:p.caption||''}));
  };
  const itemLink = item => '#activities/' + encodeURIComponent(item.id);
  const card = item => {
    const src=imageUrl(item.image_url);
    const subtitle=[dateLabel(item.date),item.location].filter(Boolean).join(' · ');
    return '<article class="activity-card">'+
      '<button type="button" class="activity-card-image" data-zoom-image="'+esc(src)+'" data-zoom-title="'+esc(item.title)+'" aria-label="'+esc(item.title)+' 사진 크게 보기"><img src="'+esc(src)+'" alt="'+esc(item.alt||item.title)+'" loading="lazy" decoding="async"/>'+
      (item.sample?'<span class="activity-sample">예시 이미지 · 실제 활동 사진 아님</span>':'')+'</span>'+
      '<span class="activity-card-body"><span class="activity-category">'+esc(categoryLabel(item.category))+'</span>'+
      '<strong><a href="'+esc(itemLink(item))+'">'+esc(item.title)+'</a></strong><small>'+esc(subtitle||(item.sample?'사진 등록 준비 중':'학회 활동 기록'))+'</small></span></article>';
  };
  const list = category => {
    const items=available().filter(x=>category==='all'||x.category===category);
    if(!items.length)return '<div class="activity-empty">이 분야의 공개 승인된 사진이 아직 없습니다.</div>';
    return '<div class="activity-board-list" role="list">'+items.map((item,index)=>{
      const label=item.sample?'예시·자료 준비 중':'사진 기록';
      const info=[dateLabel(item.date),item.location].filter(Boolean).join(' · ')||'날짜·장소 확인 중';
      return '<article class="activity-board-row" role="listitem">'+
        '<span class="activity-row-number">'+(items.length-index)+'</span>'+
        '<button class="activity-row-thumbnail" type="button" data-zoom-image="'+esc(imageUrl(item.image_url))+'" data-zoom-title="'+esc(item.title)+'" aria-label="'+esc(item.title)+' 사진 크게 보기"><img src="'+esc(imageUrl(item.image_url))+'" alt="" loading="lazy"/></button>'+
        '<div class="activity-row-main"><small>'+esc(categoryLabel(item.category))+' · '+esc(label)+'</small>'+
        '<h3><a href="'+esc(itemLink(item))+'">'+esc(item.title)+'</a></h3>'+
        '<p>'+esc(item.description||'')+'</p></div>'+
        '<span class="activity-row-date">'+esc(info)+'</span>'+
        '<a class="activity-row-arrow" href="'+esc(itemLink(item))+'" aria-label="'+esc(item.title)+' 상세 보기">보기 ↗</a>'+
        '</article>';
    }).join('')+'</div>';
  };
  const detailId = ()=>{
    const hash=String(window.location?.hash||'');
    if(!hash.startsWith('#activities/'))return '';
    try{return decodeURIComponent(hash.slice('#activities/'.length).split(/[?#]/)[0]);}
    catch{return '';}
  };
  const detailPage = id => {
    const item=available().find(x=>x.id===id);
    const back='<a class="activity-board-back" href="#activities">← 학회 활동 게시판 목록으로</a>';
    if(!item)return '<section class="activity-board">'+back+'<div class="activity-empty">해당 활동 기록을 찾을 수 없습니다. 공개되지 않았거나 삭제된 게시물일 수 있습니다.</div></section>';
    const photos=photosOf(item);
    const gallery=photos.map((photo,index)=>'<figure class="activity-entry-photo">'+
      '<button type="button" class="activity-entry-zoom" data-zoom-image="'+esc(photo.url)+'" data-zoom-title="'+esc(item.title+' · 사진 '+(index+1))+'" aria-label="'+esc(item.title+' 사진 '+(index+1)+' 크게 보기')+'">'+
      '<img src="'+esc(photo.url)+'" alt="'+esc(photo.alt)+'" loading="'+(index?'lazy':'eager')+'" decoding="async"/>'+
      '<span>사진을 누르면 확대됩니다 ⤢</span></button>'+
      (photo.caption?'<figcaption>'+esc(photo.caption)+'</figcaption>':'')+
      '</figure>').join('');
    return '<article class="activity-entry">'+back+
      '<div class="activity-entry-header"><span class="activity-category">'+esc(categoryLabel(item.category))+'</span>'+
      '<h1>'+esc(item.title)+'</h1>'+
      '<p>'+esc([dateLabel(item.date),item.location].filter(Boolean).join(' · ')||'행사 일시·장소 확인 중')+'</p></div>'+
      '<div class="activity-entry-photos">'+gallery+'</div>'+
      '<div class="activity-entry-body"><h2>활동 내용</h2><p>'+esc(item.description||'활동 설명을 준비 중입니다.')+'</p>'+
      (item.sample?'<p class="activity-disclaimer">이 이미지는 화면 구성용 예시이며 실제 학회 활동 사진이 아닙니다.</p>':'')+
      '<p class="activity-entry-credit">사진 자료: '+esc(item.credit||'출처 확인 중')+'</p></div>'+
      '<nav class="activity-entry-bottom" aria-label="게시물 이동">'+back+'</nav></article>';
  };
  const grid = category => {
    const items = available().filter(x => category === 'all' || x.category === category);
    return items.length
      ? `<div class="activity-grid">${items.map(card).join('')}</div>`
      : '<div class="activity-empty">이 분야의 공개 승인된 사진이 아직 없습니다.</div>';
  };
  function home() {
    return `<section class="activity-section" aria-labelledby="activity-home-title">
      <div class="section-heading activity-heading"><div><div class="eyebrow">SOCIETY IN PICTURES</div><h2 id="activity-home-title">학회 활동 갤러리</h2><p>연구·공연·교육·교류의 순간을 사진으로 기록하는 공간</p></div>
      <button type="button" class="more" data-view="activities">활동 사진 전체보기 ↗</button></div>
      ${grid('all')}
      <p class="activity-disclaimer">‘예시 이미지’ 표시가 있는 카드는 구성용 삽화입니다. 실제 사진은 사용자가 제공한 자료이며, 촬영자·상세 행사 정보는 확인 후 보완합니다.</p>
    </section>`;
  }
  function page() {
    const id=detailId();
    if(id)return detailPage(id);
    return '<section class="activity-board" aria-labelledby="activity-board-title">'+
      '<div class="page-hero"><div class="eyebrow">SOCIETY ACTIVITY ARCHIVE</div><h1 id="activity-board-title">학회 활동 사진 게시판</h1>'+
      '<p>게시물 제목을 누르면 해당 활동의 사진과 설명만 볼 수 있습니다.</p></div>'+
      '<div class="activity-board-toolbar" role="group" aria-label="활동 사진 분야 선택">'+
      categories.map(([cat,label])=>'<button type="button" class="activity-filter '+(cat===currentCategory?'active':'')+'" data-activity-filter="'+cat+'" aria-pressed="'+(cat===currentCategory)+'">'+label+'</button>').join('')+
      '</div><div id="activityGalleryBoard" aria-live="polite">'+list(currentCategory)+'</div>'+
      '<div class="activity-guidance"><strong>학회 활동 사진 등록 안내</strong><p>활동명, 날짜, 사진 설명, 촬영자·출처와 게시 허가를 확인한 자료부터 게시합니다. 인물의 초상권 및 미성년자 보호도 검토합니다. 사진 접수·업로드 기능은 관리자 인증 구축 후 활성화할 예정입니다.</p></div></section>';
  }
  function openDetails(id) {
    const item = available().find(x => x.id === id);
    if (!item) return;
    const src = imageUrl(item.image_url);
    if (!src) return;
    document.querySelector('#activityDialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.id='activityDialog';
    dialog.className='activity-dialog';
    dialog.setAttribute('aria-label', item.title);
    dialog.innerHTML = `<div class="activity-dialog-media"><img src="${esc(src)}" alt="${esc(item.alt||item.title)}"/></div>
      <div class="activity-dialog-body"><div class="activity-dialog-top"><span class="activity-category">${esc(categoryLabel(item.category))}</span>
      <button type="button" class="activity-close" data-activity-close aria-label="사진 상세 닫기">✕</button></div>
      <h2>${esc(item.title)}</h2>
      <p>${esc(item.description||'활동 사진 설명을 준비 중입니다.')}</p>
      ${item.sample ? '<p class="activity-disclaimer">이 이미지는 구성 예시이며 실제 학회 활동 사진이 아닙니다.</p>' : ''}
      ${item.date || item.location ? `<small>${esc([dateLabel(item.date),item.location].filter(Boolean).join(' · '))}</small>` : ''}
      ${item.credit ? `<small>사진: ${esc(item.credit)}</small>` : ''}</div>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('click', event => {if(event.target===dialog) dialog.close();});
    dialog.addEventListener('close', () => dialog.remove(),{once:true});
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
  }
  document.addEventListener('click', event => {
    const filter = event.target.closest('[data-activity-filter]');
    if (filter) {
      currentCategory=filter.dataset.activityFilter;
      document.querySelectorAll('[data-activity-filter]').forEach(button=>{
        const active=button.dataset.activityFilter===currentCategory;
        button.classList.toggle('active',active);
        button.setAttribute('aria-pressed',String(active));
      });
      const board=document.querySelector('#activityGalleryBoard');
      if(board)board.innerHTML=list(currentCategory);
      return;
    }
    if (event.target.closest('[data-activity-close]')) {
      document.querySelector('#activityDialog')?.close();
      return;
    }
    const open=event.target.closest('[data-activity-open]');
    if(open)openDetails(open.dataset.activityOpen);
  });
  window.KMS_ACTIVITY_GALLERY = {home,page};
})();
