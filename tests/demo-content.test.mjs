import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ctx={window:{}};
vm.runInNewContext(read('public/assets/demo-data.js'),ctx,{timeout:500});
const mock=ctx.window.KMS_DEMO;

test('all empty sections have varied, clearly marked mock content',()=>{
  assert.ok(mock);
  assert.equal(mock.articles.length,12);
  assert.equal(mock.promotions.length,8);
  assert.equal(mock.marketplace.length,12);
  assert.equal(mock.banners.length,3);
  assert.equal(mock.issues.length,2);
  for(const section of Object.keys(mock)) {
    assert.ok(mock[section].every(x=>x.id.startsWith('demo-')),section);
  }
});

test('demo performances and products have no external purchase links',()=>{
  for(const row of mock.promotions) {
    assert.match(row.title,/가상/);
    assert.match(row.venue,/가상/);
    assert.equal(row.link_url,undefined);
  }
  for(const row of mock.marketplace) {
    assert.match(row.title,/샘플/);
    assert.equal(row.contact_url,undefined);
  }
  for(const row of mock.banners) assert.equal(row.link_url,undefined);
});

test('live stories take priority, placeholders are not stored in D1',()=>{
  const app=read('public/assets/app.js');
  assert.match(app,/function blendWithExamples\(/);
  assert.match(app,/combined\[key\]=existing\.concat\(extras\)/);
  assert.match(app,/demoCount=count/);
  assert.match(app,/!isDemo\(m\.id\)&&safeLink\(m\.contact_url\)/);
  assert.match(app,/!isDemo\(row\.id\)&&safeLink\(row\.contact_url\)/);
  assert.match(app,/if\(isDemo\(id\)\)/);
  assert.match(app,/updateExampleNotice\(\)/);
  assert.match(read('public/index.html'),/id="demoBar"/);
});
