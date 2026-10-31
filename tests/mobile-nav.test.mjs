import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all key categories are visible in expandable accessible mobile navigation',()=>{
  const html=read('public/index.html');
  const css=read('public/assets/mobile-nav.css');
  const js=read('public/assets/mobile-nav.js');
  assert.match(html,/id="mobileCategoryToggle" aria-expanded="false" aria-controls="mobileCategoryList"/);
  assert.match(html,/id="mobileCurrentCategory"/);
  assert.ok(html.indexOf('mobile-nav.js')<html.indexOf('app.js'));
  assert.ok(html.indexOf('mobile-nav.css')>html.indexOf('site-themes.css'));
  for(const route of ['home','articles','promotions','study','marketplace','issues','activities','submit','admin']){
    assert.match(html,new RegExp('data-view="'+route+'"'));
    assert.match(js,new RegExp(route+":"));
  }
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/max-height:min\(73dvh,630px\)/);
  assert.match(css,/data-view-mode="desktop"/);
  assert.doesNotThrow(()=>new Function(js));
});
test('category status mirrors application route and menu closes after navigation',()=>{
  const app=read('public/assets/app.js');
  const nav=read('public/assets/mobile-nav.js');
  assert.match(app,/KMS_MOBILE_NAV\?\.setActive\(state\.view\)/);
  assert.match(app,/setAttribute\('aria-current','page'\)/);
  assert.match(nav,/setOpen\(false\)/);
  assert.match(nav,/event\.key==='Escape'/);
  assert.match(nav,/aria-expanded/);
  assert.doesNotThrow(()=>new Function(app));
});
