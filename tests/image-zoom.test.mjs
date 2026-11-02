import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from 'node:fs';import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('zoom module and CSS are loaded and safe',()=>{
 const html=read('public/index.html'),script=read('public/assets/image-zoom.js'),css=read('public/assets/image-zoom.css');
 assert.ok(html.includes('image-zoom.js'));assert.ok(html.includes('image-zoom.css'));
 assert.match(script,/data-zoom-image/);assert.match(script,/dialog/);
 assert.match(script,/showModal/);assert.match(script,/https:/);
 assert.match(css,/max-height:100dvh/);assert.match(css,/object-fit:contain/);
 assert.doesNotThrow(()=>new Function(script));
});
test('gallery title and gallery photograph use separate actions',()=>{
 const code=read('public/assets/activity-gallery.js');const app=read('public/assets/app.js');
 assert.match(code,/data-zoom-image/);assert.match(code,/itemLink\(item\)/);
 assert.match(app,/data-zoom-image/);assert.match(app,/promotionEntry/);
 const ctx={window:{location:{hash:'#activities/sample-education'},KMS_ACTIVITY_DATA:{approved:[],examples:[{id:'sample-education',title:'교육자료',image_url:'./assets/magic-cards.svg',category:'education'}]}},document:{addEventListener(){}},URL};
 vm.runInNewContext(code,ctx);
 assert.match(ctx.window.KMS_ACTIVITY_GALLERY.page(),/data-zoom-image/);
 assert.doesNotThrow(()=>new Function(app));
});
