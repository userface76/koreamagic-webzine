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
  const card = item => {
    const src = imageUrl(item.image_url);
    const subtitle = [dateLabel(item.date), item.location].filter(Boolean).join(' · ');
    return `<button type="button" class="activity-card" data-activity-open="${esc(item.id)}" aria-label="${esc(item.title)} 상세 보기">
      <span class="activity-card-image"><img src="${esc(src)}" alt="${esc(item.alt||item.title)}" loading="lazy" decoding="async"/>
      ${item.sample ? '<span class="activity-sample">예시 이미지 · 실제 활동 사진 아님</span>' : ''}</span>
      <span class="activity-card-body"><span class="activity-category">${esc(categoryLabel(item.category))}</span>
      <strong>${esc(item.title)}</strong><small>${esc(subtitle || (item.sample ? '사진 등록 준비 중' : '학회 활동 기록'))}</small></span>
    </button>`;
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
      <p class="activity-disclaimer">현재 표시된 삽화는 갤러리 구성 예시입니다. 실제 활동 사진은 사용 동의와 게시 승인을 받은 뒤 등록됩니다.</p>
    </section>`;
  }
  function page() {
    return `<section class="activity-board" aria-labelledby="activity-board-title">
      <div class="page-hero"><div class="eyebrow">SOCIETY ACTIVITY ARCHIVE</div><h1 id="activity-board-title">학회 활동 사진 게시판</h1>
      <p>학술 발표, 공연 현장, 교육과 동료 교류를 기록합니다. 승인된 활동 사진과 출처를 차례로 소개합니다.</p></div>
      <div class="activity-board-toolbar" role="group" aria-label="활동 사진 분야 선택">
        ${categories.map(([id,label]) => `<button type="button" class="activity-filter ${id===currentCategory?'active':''}" data-activity-filter="${id}" aria-pressed="${id===currentCategory}">${label}</button>`).join('')}
      </div>
      <div id="activityGalleryBoard" aria-live="polite">${grid(currentCategory)}</div>
      <div class="activity-guidance"><strong>학회 활동 사진 등록 안내</strong><p>활동명, 날짜, 사진 설명, 촬영자·출처와 게시 허가를 확인한 자료부터 게시합니다. 인물의 초상권 및 미성년자 보호도 검토합니다. 사진 접수·업로드 기능은 관리자 인증 구축 후 활성화할 예정입니다.</p></div>
    </section>`;
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
      if(board)board.innerHTML=grid(currentCategory);
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
