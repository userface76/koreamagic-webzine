/* KMS Webzine: mobile ↔ desktop display preference, without changing the site routes. */
(() => {
  'use strict';
  const STORAGE_KEY = 'kms-webzine-display-mode-v1';
  const viewport = document.querySelector('meta[name="viewport"]');
  const ua = navigator.userAgent || '';
  const touchSmallScreen = window.screen && window.screen.width <= 900 &&
    window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const onMobile = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua) || Boolean(touchSmallScreen);
  let preferred = 'mobile';
  try { if (localStorage.getItem(STORAGE_KEY) === 'desktop') preferred = 'desktop'; } catch { /* storage disabled */ }

  function setViewport(mode) {
    if (!viewport) return;
    viewport.setAttribute('content', mode === 'desktop' ? 'width=1200' : 'width=device-width, initial-scale=1');
    document.documentElement.dataset.viewMode = mode;
  }

  if (onMobile && preferred === 'desktop') setViewport('desktop');

  document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('footerViewMode');
    const button = document.getElementById('desktopViewToggle');
    if (!onMobile || !viewport || !wrapper || !button) return;

    const sync = () => {
      const desktop = preferred === 'desktop';
      button.textContent = desktop ? '▣ 모바일 버전 보기' : '▤ PC 버전 보기';
      button.setAttribute('aria-pressed', String(desktop));
      button.setAttribute('aria-label', desktop ? '휴대전화 화면 구성으로 돌아가기' : 'PC 화면 구성으로 보기');
    };
    wrapper.hidden = false;
    sync();

    button.addEventListener('click', () => {
      preferred = preferred === 'desktop' ? 'mobile' : 'desktop';
      let saved = false;
      try { localStorage.setItem(STORAGE_KEY, preferred); saved = true; } catch { /* private mode */ }
      setViewport(preferred);
      sync();
      // Reload keeps layout breakpoints consistent across Android/iOS engines.
      // Without storage, keep the immediate viewport change instead.
      if (saved) window.location.reload();
    });
  });
})();
