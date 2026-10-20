/* 한국마술학회 AI 웹진 - 랜덤 마술 장면. No external dependency. */
(() => {
  'use strict';
  const scenes = [
    { id: 'theater', name: '별빛 마술극장' },
    { id: 'cards', name: '플레잉카드 일루전' },
    { id: 'library', name: '마법의 서재' },
    { id: 'portal', name: '빛의 포털' }
  ];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = Math.floor(Math.random() * scenes.length);
  let paused = motion.matches;
  const interval = 20000;
  const root = document.documentElement;

  function update() {
    root.dataset.magicTheme = scenes[active].id;
    document.querySelectorAll('[data-magic-counter]').forEach(el => {
      el.textContent = String(active + 1).padStart(2, '0') + ' / 04 · ' + scenes[active].name;
    });
    document.querySelectorAll('[data-magic-pause]').forEach(el => {
      el.setAttribute('aria-pressed', String(paused));
      el.setAttribute('aria-label', paused ? '마술 배경 자동 변경 다시 시작' : '마술 배경 자동 변경 일시정지');
      el.textContent = paused ? '▶ 자동 변경 켜기' : '⏸ 자동 변경 멈춤';
    });
  }

  function next() {
    active = (active + 1 + Math.floor(Math.random() * (scenes.length - 1))) % scenes.length;
    update();
  }

  root.dataset.magicTheme = scenes[active].id;
  document.addEventListener('click', e => {
    const change = e.target.closest('[data-magic-change]');
    const toggle = e.target.closest('[data-magic-pause]');
    if (change) { next(); }
    if (toggle) { paused = !paused; update(); }
  });

  window.setInterval(() => {
    if (paused || document.hidden || (location.hash && location.hash !== '#home')) return;
    const hero = document.querySelector('.hero-main');
    if (!hero || hero.matches(':hover') || hero.matches(':focus-within')) return;
    next();
  }, interval);

  const onMotionChange = e => {
    if (e.matches) { paused = true; update(); }
  };
  if (motion.addEventListener) motion.addEventListener('change', onMotionChange);
  else if (motion.addListener) motion.addListener(onMotionChange);
  const app = document.querySelector('#app');
  if (app) new MutationObserver(update).observe(app, { childList: true });
  window.addEventListener('hashchange', update);
  document.addEventListener('DOMContentLoaded', update);
})();
