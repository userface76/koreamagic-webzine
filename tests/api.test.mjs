import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/worker.js';
import {createMonthlyIssue} from '../src/feeds.js';

function db(){
 const sqlite=new DatabaseSync(':memory:');
 for(const m of ['0001_init.sql','0002_demo.sql'])sqlite.exec(readFileSync(new URL(`../migrations/${m}`,import.meta.url),'utf8'));
 return {sqlite,DB:{prepare(sql){return {bind(...values){return {all:async()=>({results:sqlite.prepare(sql).all(...values)}),run:async()=>({meta:{changes:sqlite.prepare(sql).run(...values).changes}})}}}}}};
}
const token='M'.repeat(45);
const make=(path,init={})=>new Request(`https://example.com${path}`,init);
const envFor=DB=>({DB,ADMIN_API_TOKEN:token,ASSETS:{fetch:()=>new Response('static')},SITE_TITLE:'학회 웹진'});
test('public homepage loads database data',async()=>{
 const {sqlite,DB}=db();const response=await worker.fetch(make('/api/home'),envFor(DB));
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.articles.length,4);assert.equal(data.promotions.length,2);assert.equal(data.marketplace.length,3);sqlite.close();
});
test('admin secret required and articles publish',async()=>{
 const {sqlite,DB}=db(),env=envFor(DB);
 let response=await worker.fetch(make('/api/admin/queue'),env);assert.equal(response.status,401);
 response=await worker.fetch(make('/api/admin/articles',{method:'POST',headers:{authorization:'Bearer '+token,origin:'https://example.com','content-type':'application/json'},body:JSON.stringify({title:'마술학회 새 글 테스트',body:'마술학회 웹진에서 수시 발행하는 테스트 연구 글입니다. 실제 연구 결과가 아닙니다.',category:'news',publish:true})}),env);
 assert.equal(response.status,201);const item=await response.json();assert.equal(item.status,'published');
 const all=await (await worker.fetch(make('/api/home'),env)).json();assert.equal(all.articles.length,5);sqlite.close();
});
test('external submission requires Turnstile',async()=>{
 const {sqlite,DB}=db(),env=envFor(DB);
 const response=await worker.fetch(make('/api/submissions/marketplace',{method:'POST',headers:{origin:'https://example.com','content-type':'application/json'},body:JSON.stringify({title:'마술도구 판매',description:'사용하지 않은 마술 도구 판매합니다.',price_krw:30000,seller_alias:'테스터'})}),env);
 assert.equal(response.status,503);sqlite.close();
});
test('monthly issue can show articles',async()=>{
 const {sqlite,DB}=db();const env=envFor(DB);
 await createMonthlyIssue(DB,new Date('2026-11-01T00:00:00Z'));
 const response=await worker.fetch(make('/api/issues/2026-10'),env);
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.issue.id,'2026-10');assert.ok(data.items.length>0);sqlite.close();
});
