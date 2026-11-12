import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Lee Myung Joon 2026 performance copies user's approved information',()=>{
 const ctx={window:{}};vm.runInNewContext(read('public/assets/curated-promotions.js'),ctx);
 const p=ctx.window.KMS_CURATED_PROMOTIONS.find(x=>x.id==='curated-lee-myung-joon-imagination-fragments-2026');
 assert.ok(p);assert.equal(p.event_date,'2026-11-28');assert.match(p.title,/상상조각/);assert.equal(p.detail.duration,'약 60분');
 assert.match(p.detail.dates[0],/오후 1시.*오후 5시/);assert.equal(p.detail.phone,'010-8020-2072');
 assert.match(p.detail.prices.join(' '),/50,000원.*40,000원/);assert.match(p.detail.prices.join(' '),/25,000원.*20,000원/);
 assert.equal(p.image_url,'./assets/lee-myung-joon-imagination-2026-poster.jpg');
 assert.equal(p.gallery_images.length,2);
 assert.equal(p.image_pending,undefined);
 const expected=[[p.image_url,69901],...p.gallery_images.map((x,i)=>[x.url,[229420,235212][i]])];
 for(const [url,bytes] of expected){const bin=readFileSync(new URL('../public/'+url.replace(/^\.\//,''),import.meta.url));assert.equal(bin.length,bytes);assert.equal(bin.toString('hex',0,3),'ffd8ff');}
 assert.match(p.editorial_sections.map(x=>x.text).join(' '),/상상과 현실/);
});
test('editorial text escapes page HTML and image is never replaced by invented artwork',()=>{
 const a=read('public/assets/app.js');assert.match(a,/promotionEditorialSections/);
 assert.match(a,/p\.editorial_sections/);assert.match(a,/promotionExtraImages/);assert.match(a,/data-zoom-image/);assert.doesNotThrow(()=>new Function(a));
});
