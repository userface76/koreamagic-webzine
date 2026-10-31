/* Mobile category navigation: accessible grid overlay without changing page routes. */
(() => {
  'use strict';
  const labels={
    home:'웹진 홈',
    articles:'학회·연구 소식',
    promotions:'공연·행사',
    study:'마술사 스터디',
    marketplace:'마술장터',
    issues:'지식 아카이브',
    activities:'학회 활동 갤러리',
    submit:'홍보게시판·글 등록',
    admin:'관리자',
    privacy:'개인정보 안내'
  };
  const nav=document.getElementById('siteNavigation');
  const toggle=document.getElementById('mobileCategoryToggle');
  const current=document.getElementById('mobileCurrentCategory');
  const toggleLabel=document.getElementById('mobileToggleLabel');
  const list=document.getElementById('mobileCategoryList');
  const breakpoint=window.matchMedia('(max-width: 760px)');
  if(!nav||!toggle||!current||!list)return;
  const isMobile=()=>breakpoint.matches&&document.documentElement.dataset.viewMode!=='desktop';
  const setOpen=(open,restoreFocus=false)=>{
    const value=Boolean(open)&&isMobile();
    nav.dataset.mobileOpen=String(value);
    toggle.setAttribute('aria-expanded',String(value));
    toggle.setAttribute('aria-label',value?'전체 카테고리 접기':'전체 카테고리 펼치기');
    if(toggleLabel)toggleLabel.textContent=value?'메뉴 접기':'전체 카테고리';
    if(!value&&restoreFocus&&isMobile())toggle.focus();
  };
  const setActive=view=>{
    current.textContent=labels[view]||labels.home;
    setOpen(false);
  };
  window.KMS_MOBILE_NAV={setActive};
  const route=window.location.hash.slice(1);
  setActive(route);
  toggle.addEventListener('click',()=>setOpen(nav.dataset.mobileOpen!=='true'));
  list.addEventListener('click',event=>{
    if(event.target.closest('[data-view]'))setOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&nav.dataset.mobileOpen==='true'){
      setOpen(false,true);
    }
  });
  document.addEventListener('click',event=>{
    if(nav.dataset.mobileOpen==='true'&&!nav.contains(event.target))setOpen(false);
  });
  window.addEventListener('resize',()=>{
    if(!isMobile())setOpen(false);
  });
})();