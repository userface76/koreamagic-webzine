import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const moduleCode = read('public/assets/activity-gallery.js');
const dataCode = read('public/assets/activity-data.js');
const makeContext = approved => {
  const context = {window: {KMS_ACTIVITY_DATA: {approved, examples: []}}, document: {addEventListener() {}}, URL};
  vm.runInNewContext(moduleCode, context);
  return context.window.KMS_ACTIVITY_GALLERY;
};

test('home includes accessible activity entry point and shows approved images before samples', () => {
  const context = {window: {}, document: {addEventListener() {}}, URL};
  vm.runInNewContext(dataCode, context);
  vm.runInNewContext(moduleCode, context);
  const home=context.window.KMS_ACTIVITY_GALLERY.home();
  assert.match(home, /학회 활동 갤러리/);
  assert.match(home, /data-view="activities"/);
  assert.match(home, /복화술사 신석근 소개/);
  assert.doesNotMatch(home, /예시 이미지 · 실제 활동 사진 아님/);
  assert.match(context.window.KMS_ACTIVITY_GALLERY.page(), /학회 활동 사진 게시판/);
});

test('only approved and media-rights-verified photos are published', () => {
  const entry = {id:'good',title:'정식 등록 사진',category:'research',image_url:'./assets/magic-library.svg',approved:true,rights_confirmed:true};
  const gallery = makeContext([entry,{...entry,id:'no-rights',title:'비허가 사진',rights_confirmed:false},{...entry,id:'no-approval',title:'검토 중',approved:false}]);
  const html=gallery.page();
  assert.match(html, /정식 등록 사진/);
  assert.doesNotMatch(html, /비허가 사진|검토 중/);
});

test('gallery is linked from the homepage and scripts load before the application', () => {
  const index=read('public/index.html');
  const app=read('public/assets/app.js');
  assert.match(index, /assets\/activity-gallery\.css/);
  assert.ok(index.indexOf('activity-gallery.js') < index.indexOf('app.js'));
  assert.match(app, /KMS_ACTIVITY_GALLERY\?\.home/);
  assert.match(app, /activities,submit/);
});

test('all three user-provided photos have local image assets and required approval fields', () => {
  const context={window:{}};
  vm.runInNewContext(dataCode,context);
  const items=context.window.KMS_ACTIVITY_DATA.approved;
  assert.equal(items.length,6);
  for(const item of items){
    assert.equal(item.approved,true);
    assert.equal(item.rights_confirmed,true);
    assert.match(item.image_url,/^\.\/assets\/activity\/[a-z0-9-]+\.(?:jpg|webp)$/);
    const imagePath=new URL('../public/'+item.image_url.replace(/^\.\//,''),import.meta.url);
    assert.ok(statSync(imagePath).size>(item.image_url.endsWith('.jpg')?10000:1000));
    const bytes=readFileSync(imagePath);
    if(item.image_url.endsWith('.jpg')){assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);}else{assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');}
  }
});

test('education gallery includes two user-provided speaker portraits, not invented seminar attendance',()=>{const ctx={window:{},document:{addEventListener(){}},URL};vm.runInNewContext(dataCode,ctx);vm.runInNewContext(moduleCode,ctx);const page=ctx.window.KMS_ACTIVITY_GALLERY.page();assert.match(page,/education-ventriloquism-shin-seokgeun-2026/);assert.match(page,/education-magic-recipe-educator-2026/);const posters=ctx.window.KMS_ACTIVITY_DATA.approved.filter(x=>x.category==='education');assert.equal(posters.length,3);for(const p of posters.filter(x=>x.id!=='ulsan-magic-society-preparation-2026-11')){assert.equal(p.event_confirmed,false);assert.match(p.image_url,/\.webp$/);assert.equal(p.approved,true);}});

test('two user-submitted seminar preparation photos are grouped in one education detail entry',()=>{
 const ctx={window:{location:{hash:'#activities/ulsan-magic-society-preparation-2026-11'}},document:{addEventListener(){}},URL};
 vm.runInNewContext(dataCode,ctx);vm.runInNewContext(moduleCode,ctx);
 const item=ctx.window.KMS_ACTIVITY_DATA.approved.find(x=>x.id==='ulsan-magic-society-preparation-2026-11');
 assert.ok(item);assert.equal(item.title,'학회준비중');assert.equal(item.category,'education');assert.equal(item.images.length,2);
 const p=ctx.window.KMS_ACTIVITY_GALLERY.page();
 assert.match(p,/ulsan-magic-recipe-seminar-prep-2026\.webp/);
 assert.match(p,/ulsan-korea-china-forum-prep-2026\.webp/);
 assert.match(p,/사진을 누르면 확대됩니다/);
 assert.match(p,/data-zoom-image=/);
 assert.doesNotMatch(p,/무대 마술 공연 — 소품 연출/);
 for(const v of item.images){const asset=new URL('../public/'+v.image_url.slice(2),import.meta.url);const bytes=readFileSync(asset);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}
});
