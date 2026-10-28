import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const context={window:{}};
vm.runInNewContext(read('public/assets/study-data.js'),context,{timeout:500});
const d=context.window.KMS_STUDY;
test('study library ships varied learning material with repeatable exercises',()=>{
 assert.equal(d.lessons.length,18);
 assert.ok(d.categories.length>=9);
 assert.equal(new Set(d.lessons.map(x=>x.id)).size,18);
 for(const x of d.lessons){
   assert.ok(x.title&&x.summary&&x.practice&&x.reflection&&x.updated_at);
   assert.ok(x.steps.length>=3);
   assert.ok(d.categories.some(c=>c.id===x.category));
 }
});
test('educational content flags review, fictional feedback cases and safety',()=>{
 assert.match(d.notice,/고위험/);
 assert.ok(d.cases.every(x=>x.example===true));
 assert.ok(d.checklist.length>=3);
 assert.ok(d.checklist.some(x=>x.items.some(i=>i.includes('음향')||i.includes('조명'))));
});
test('navigation includes study view without changing underlying data API',()=>{
 const page=read('public/index.html');
 const app=read('public/assets/app.js');
 const ui=read('public/assets/study-ui.js');
 assert.match(page,/data-view="study"/);
 assert.match(page,/assets\/study-data\.js/);
 assert.match(page,/assets\/study-ui\.js/);
 assert.match(app,/function study\(\)/);
 assert.match(app,/issues,study,activities,submit,admin/);
 assert.match(ui,/data-study-cat/);
 assert.match(ui,/data-study-check/);
 assert.match(ui,/data-study-copy/);
 assert.match(ui,/localStorage/);
 assert.match(ui,/fetch\('\/api\/study-resources\?/);
 assert.doesNotMatch(ui,/fetch\([^)]*method\s*:\s*['\"]POST/);
 assert.doesNotMatch(ui,/XMLHttpRequest/);
 assert.doesNotMatch(ui,/\/api\/admin/);
});
test('study UI syntax is parseable',()=>{
 assert.doesNotThrow(()=>new Function(read('public/assets/study-ui.js')));
});
