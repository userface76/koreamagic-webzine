import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('the homepage exposes accessible magic scene controls', () => {
  assert.match(read('public/index.html'), /assets\/magic-scenes\.js/);
  const app = read('public/assets/app.js');
  assert.match(app, /data-magic-change/);
  assert.match(app, /data-magic-pause/);
  assert.match(app, /data-magic-counter/);
});
test('the magic theme engine respects motion and user choice', () => {
  const code = read('public/assets/magic-scenes.js');
  assert.match(code, /prefers-reduced-motion/);
  assert.match(code, /document\.hidden/);
  assert.match(code, /paused\s*=\s*!paused/);
  assert.match(code, /Math\.random/);
  assert.match(code, /MutationObserver/);
});
test('all four original magic illustrations are local and script-free', () => {
  const css = read('public/assets/styles.css');
  for (const name of ['theater','cards','library','portal']) {
    const svg = read('public/assets/magic-' + name + '.svg');
    assert.match(svg, /^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /<\/svg>\s*$/);
    assert.doesNotMatch(svg, /<script\b|\bonload\s*=|<foreignObject\b/i);
    assert.match(css, new RegExp('magic-' + name + '\\.svg'));
  }
});

test('mobile visitors can switch between mobile and desktop layouts from the footer', () => {
  const page = read('public/index.html');
  const css = read('public/assets/styles.css');
  const mode = read('public/assets/view-mode.js');
  assert.match(page, /id="footerViewMode" hidden/);
  assert.match(page, /id="desktopViewToggle"/);
  assert.match(page, /<script src="\.\/assets\/view-mode\.js"><\/script>/);
  assert.match(css, /\.footer-view-button/);
  assert.match(css, /\.footer-view-mode\[hidden\]/);
  assert.match(mode, /width=1200/);
  assert.match(mode, /width=device-width, initial-scale=1/);
  assert.match(mode, /localStorage\.setItem/);
  assert.match(mode, /localStorage\.getItem/);
  assert.match(mode, /aria-pressed/);
  assert.match(mode, /window\.location\.reload\(\)/);
});
