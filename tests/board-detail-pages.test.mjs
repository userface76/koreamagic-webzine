import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const dataCode=read('public/assets/activity-data.js');
const galleryCode=read('public/assets/activity-gallery.js');
const makeGallery=(hash='#activities')=>{
 const ctx={window:{location:{hash}},document:{addEventListener(){}},URL};
 vm.runInNewContext(dataCode,ctx);
 vm.runInNewContext(galleryCode,ctx);
 return ctx.window.KMS_ACTIVITY_GALLERY;
};
test('activity board lists approved photo records with links to one entry each',()=>{
 const g=makeGallery();
 const html=g.page();
 assert.match(html,/activity-board-list/);
 assert.match(html,/href="#activities\/provided-stage-props-01"/);
 assert.match(html,/href="#activities\/provided-ifho-2026-09-18"/);
 assert.match(html,/국제미래유산기구 창립총회/);
});
test('activity detail link returns only the requested photo and supports a back link',()=>{
 const g=makeGallery('#activities/provided-ifho-2026-09-18');
 const html=g.page();
 assert.match(html,/activity-entry/);
 assert.match(html,/국제미래유산기구 창립총회 현장/);
 assert.match(html,/ifho-founding-2026-09-18.jpg/);
 assert.doesNotMatch(html,/무대 마술 공연 — 소품 연출/);
 assert.match(html,/href="#activities"/);
});
test('activity detail never exposes photos excluded by approval or rights rules',()=>{
 const ctx={window:{location:{hash:'#activities/non-approved'}},document:{addEventListener(){}},URL};
 vm.runInNewContext(galleryCode,ctx);
 const output=ctx.window.KMS_ACTIVITY_GALLERY.page();
 assert.match(output,/찾을 수 없습니다/);
});
test('promotion board and details use hash-addressable routes and back links',()=>{
 const code=read('public/assets/app.js');
 assert.match(code,/promotionDetailId/);
 assert.match(code,/promotionBoardEntry/);
 assert.match(code,/promotionEntry/);
 assert.match(code,/'#promotions\/'\+encodeURIComponent\(p.id\)/);
 assert.match(code,/href="#promotions"/);
 assert.match(code,/window.addEventListener\('hashchange'/);
 assert.match(code,/split\('\/'\)\[0\]/);
 assert.doesNotThrow(()=>new Function(code));
 assert.doesNotThrow(()=>new Function(galleryCode));
});
test('both independent board layouts preserve mobile breakpoints',()=>{
 const css=read('public/assets/activity-gallery.css')+read('public/assets/site-themes.css');
 assert.match(css,/activity-board-row/);
 assert.match(css,/promotion-board-row/);
 assert.match(css,/@media\(max-width:560px\)/);
});

test('education seminar entry has two clickable images and direct link',()=>{
 const html=makeGallery('#activities/ulsan-magic-society-preparation-2026-11').page();
 assert.match(html,/학회준비중/);
 assert.match(html,/activity-entry-photos/);
 assert.equal((html.match(/data-zoom-image=/g)||[]).length,2);
 assert.match(html,/href="#activities"/);
});
