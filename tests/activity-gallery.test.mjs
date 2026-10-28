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

test('home includes accessible activity entry point and clearly labelled sample images', () => {
  const context = {window: {}, document: {addEventListener() {}}, URL};
  vm.runInNewContext(dataCode, context);
  vm.runInNewContext(moduleCode, context);
  const home=context.window.KMS_ACTIVITY_GALLERY.home();
  assert.match(home, /학회 활동 갤러리/);
  assert.match(home, /data-view="activities"/);
  assert.match(home, /예시 이미지 · 실제 활동 사진 아님/);
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
  assert.equal(items.length,3);
  for(const item of items){
    assert.equal(item.approved,true);
    assert.equal(item.rights_confirmed,true);
    assert.match(item.image_url,/^\.\/assets\/activity\/[a-z0-9-]+\.jpg$/);
    const imagePath=new URL('../public/'+item.image_url.replace(/^\.\//,''),import.meta.url);
    assert.ok(statSync(imagePath).size>10000);
    const bytes=readFileSync(imagePath);
    assert.equal(bytes[0],0xff);
    assert.equal(bytes[1],0xd8);
  }
});
