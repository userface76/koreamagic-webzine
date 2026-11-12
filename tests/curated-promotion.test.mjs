import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from 'node:vm';const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('actual BIFM event has verified title showtimes artists and prices',()=>{const c={window:{}};vm.runInNewContext(read('public/assets/curated-promotions.js'),c);const p=c.window.KMS_CURATED_PROMOTIONS.find(x=>x.id==='curated-bimf-magic-present-2026');assert.ok(p);assert.equal(p.event_date,'2026-12-12');assert.equal(p.end_date,'2026-12-13');assert.equal(p.detail.dates.length,2);assert.equal(p.detail.cast.length,6);assert.match(p.detail.prices.join(' '),/50,000원.*30,000원/);assert.equal(p.origin,'editorial');});
test('promotion script loads before app and existing database results override duplicates',()=>{const s=read('public/index.html'),app=read('public/assets/app.js');assert.ok(s.indexOf('curated-promotions.js')<s.indexOf('app.js'));assert.match(app,/KMS_CURATED_PROMOTIONS/);assert.match(app,/x.title===c.title&&x.event_date===c.event_date/);assert.match(app,/promoExtra\(p\)/);assert.doesNotThrow(()=>new Function(app));assert.doesNotThrow(()=>new Function(read('public/assets/curated-promotions.js')));});
test('public poster is derived from user supplied actual photo',()=>{const s=read('public/assets/bimf-magic-present-2026-poster.svg');assert.match(s,/data:image\/webp;base64,/);assert.match(s,/2026 부산국제매직페스티벌/);});

test('Ulsan World Great Magic Show is a real archived event with the supplied poster asset',()=>{
 const c={window:{}};vm.runInNewContext(read('public/assets/curated-promotions.js'),c);
 const p=c.window.KMS_CURATED_PROMOTIONS.find(x=>x.id==='curated-ulsan-world-great-magic-show-2026');
 assert.ok(p);
 assert.equal(p.event_date,'2026-11-01');
 assert.equal(p.event_status,'ended');
 assert.match(p.venue,/태화강국가정원 왕버들마당/);
 assert.deepEqual(Array.from(p.detail.cast),[]);
 assert.deepEqual(Array.from(p.detail.prices),[]);
 assert.match(p.detail.source,/사용자 제공/);
 const image=readFileSync(new URL('../public/assets/ulsan-world-great-magic-show-2026.webp',import.meta.url));
 assert.ok(image.byteLength>4000);
 assert.equal(image.toString('ascii',0,4),'RIFF');
 assert.equal(image.toString('ascii',8,12),'WEBP');
 const app=read('public/assets/app.js');
 assert.match(app,/행사 종료 · 공연 기록/);
 assert.match(app,/event_status!=='ended'/);
});
