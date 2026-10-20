import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/worker.js';

function makeDb(migrations=true){
 const sqlite=new DatabaseSync(':memory:');
 for(const path of ['0001_init.sql',...(migrations?['0003_study_resources.sql','0004_promotion_privacy.sql']:[])])
  sqlite.exec(readFileSync(new URL('../migrations/'+path,import.meta.url),'utf8'));
 const DB={prepare(sql){const statement=sqlite.prepare(sql);return {bind(...args){return {all:async()=>({results:statement.all(...args)}),run:async()=>({meta:{changes:statement.run(...args).changes}})}}}}};
 return {sqlite,DB};
}
const token='N'.repeat(44);
const env=DB=>({DB,ADMIN_API_TOKEN:token,ASSETS:{fetch:()=>new Response('static')}});
const request=(path,headers={})=>new Request('https://example.com'+path,{headers});
const post=(path,body,tokenOverride=token)=>new Request('https://example.com'+path,{method:'POST',headers:{origin:'https://example.com',authorization:'Bearer '+tokenOverride,'content-type':'application/json'},body:JSON.stringify(body)});

test('migration-free older databases still serve public performance listings',async()=>{
 const {sqlite,DB}=makeDb(false);
 const r=await worker.fetch(request('/api/home'),env(DB));
 assert.equal(r.status,200);
 assert.equal((await r.json()).promotions.length,0);
 sqlite.close();
});
test('public performance data never contains restricted telephone',async()=>{
 const {sqlite,DB}=makeDb();
 sqlite.prepare("INSERT INTO promotions(id,title,description,venue,status,image_url,video_url,contact_phone) VALUES(?,?,?,?,?,?,?,?)").run('event-1','마술 행사 초대','공개 안내','실내 공연장','published','https://example.com/cover.jpg','https://www.youtube.com/watch?v=abcdefghijk','01012345678');
 const home=await (await worker.fetch(request('/api/home'),env(DB))).json();
 assert.equal(home.promotions[0].video_url,'https://www.youtube.com/watch?v=abcdefghijk');
 assert.equal(home.promotions[0].contact_phone,undefined);
 assert.ok(!JSON.stringify(home).includes('01012345678'));
 const list=await (await worker.fetch(request('/api/promotions'),env(DB))).json();
 assert.ok(!JSON.stringify(list).includes('01012345678'));
 const noAuth=await worker.fetch(request('/api/admin/promotion-contact?id=event-1'),env(DB));
 assert.equal(noAuth.status,401);
 sqlite.close();
});
test('admin may retrieve contact only with valid token',async()=>{
 const {sqlite,DB}=makeDb();
 const uuid='123e4567-e89b-12d3-a456-426614174000';
 sqlite.prepare("INSERT INTO promotions(id,title,description,status,contact_phone) VALUES(?,?,?,?,?)").run(uuid,'학회 마술 공연','행사 내용','pending','01012345678');
 let r=await worker.fetch(request('/api/admin/promotion-contact?id='+uuid,{authorization:'Bearer '+token}),env(DB));
 assert.equal(r.status,200);assert.equal((await r.json()).contact_phone,'01012345678');
 r=await worker.fetch(request('/api/admin/promotion-contact?id='+uuid,{authorization:'Bearer wrong'}),env(DB));assert.equal(r.status,401);
 sqlite.close();
});
test('admin study resources allow originals and approved YouTube links only',async()=>{
 const {sqlite,DB}=makeDb();
 let r=await worker.fetch(post('/api/admin/study-resources',{lesson_id:'acting-1',kind:'note',title:'공연 연습 노트',content:'동료가 장점을 먼저 말하고 작품의 감정선을 살릴 작은 제안을 합니다.',rights_confirmed:true}),env(DB));
 assert.equal(r.status,201);
 r=await worker.fetch(post('/api/admin/study-resources',{lesson_id:'acting-1',kind:'youtube',title:'유튜브 공개강의',url:'https://youtu.be/abcdefghijk',rights_confirmed:true}),env(DB));
 assert.equal(r.status,201);
 r=await worker.fetch(post('/api/admin/study-resources',{lesson_id:'acting-1',kind:'youtube',title:'불허된 외부링크',url:'https://evil.example/youtube.com/watch?v=abcdefghijk',rights_confirmed:true}),env(DB));
 assert.equal(r.status,400);
 const items=await (await worker.fetch(request('/api/study-resources?lesson_id=acting-1'),env(DB))).json();
 assert.equal(items.items.length,2);
 assert.equal(items.items.find(x=>x.kind==='youtube').url,'https://www.youtube.com/watch?v=abcdefghijk');
 sqlite.close();
});
test('study resources missing-table notice does not leak errors',async()=>{
 const {sqlite,DB}=makeDb(false);
 const res=await worker.fetch(request('/api/study-resources?lesson_id=acting-1'),env(DB));
 assert.equal(res.status,200);
 assert.equal((await res.json()).setupRequired,true);
 sqlite.close();
});
test('front end includes opt-in soft suggestions and phone consent',()=>{
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const study=readFileSync(new URL('../public/assets/study-ui.js',import.meta.url),'utf8');
 assert.match(study,/studyGentleForm/);
 assert.match(study,/data-study-video/);
 assert.match(app,/contact_consent/);
 assert.match(app,/data-admin-phone/);
 assert.match(app,/data-view="privacy"/);
});
