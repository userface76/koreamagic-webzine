import { classifyPost } from './moderation.js';
import { importFeeds, createMonthlyIssue } from './feeds.js';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});}
function err(message,status=400){return json({error:message},status);}
function safeString(v,max=500){return String(v??'').trim().slice(0,max);}
function safeUrl(v){if(!v)return null;try{const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password) return null;return u.toString().slice(0,700);}catch{return null;}}
function studyYoutubeUrl(raw){
 try {
  const u=new URL(String(raw||'').trim());
  if(u.protocol!=='https:'||u.username||u.password) return null;
  const host=u.hostname.toLowerCase();
  let id='';
  if(host==='youtu.be') id=u.pathname.split('/')[1]||'';
  else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host)){
   if(u.pathname==='/watch') id=u.searchParams.get('v')||'';
   else if(/^\/(shorts|live|embed)\//.test(u.pathname)) id=u.pathname.split('/')[2]||'';
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(id)?'https://www.youtube.com/watch?v='+id:null;
 }catch{return null;}
}
function normalizePhone(input){
 const raw=safeString(input,32);
 if(!raw)return null;
 if(!/^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$/.test(raw))return false;
 return raw.replace(/[^0-9]/g,'');
}
const phonePattern=/(?:\b01[016789]|\b0[2-6][0-9]?)[- .]?[0-9]{3,4}[- .]?[0-9]{4}\b/;
async function promotionPage(db,sqlWithVideo,sqlWithoutVideo,values=[]){
 try{return await page(db,sqlWithVideo,values);}
 catch(e){if(!String(e).includes('no such column: video_url'))throw e;return page(db,sqlWithoutVideo,values);}
}
async function expirePromotionContacts(db){
 try{await db.prepare("UPDATE promotions SET contact_phone=NULL,contact_deleted_at=CURRENT_TIMESTAMP WHERE contact_phone IS NOT NULL AND ((event_date IS NOT NULL AND event_date <> '' AND date(event_date,'+90 days')<=date('now')) OR ((event_date IS NULL OR event_date='') AND datetime(created_at,'+180 days')<=datetime('now')))").run();}
 catch(e){if(!String(e).includes('no such column: contact_phone'))throw e;}
}
function goodSecret(provided,expected){ if(!provided||!expected||expected.length<32)return false;let n=provided.length^expected.length;const len=Math.max(provided.length,expected.length);for(let i=0;i<len;i++)n|=(provided.charCodeAt(i)||0)^(expected.charCodeAt(i)||0);return n===0; }
function requireAdmin(request,env){const header=request.headers.get('authorization')||'';return goodSecret(header.startsWith('Bearer ')?header.slice(7):'',env.ADMIN_API_TOKEN);}
function hasSameOrigin(request){const origin=request.headers.get('origin'); if(!origin)return false;try{return new URL(origin).origin===new URL(request.url).origin;}catch{return false;}}
async function parseJson(request){if(Number(request.headers.get('content-length')||0)>20000)throw Error('입력 용량 초과');const txt=await request.text();if(txt.length>20000)throw Error('입력 용량 초과');try{return JSON.parse(txt);}catch{throw Error('잘못된 JSON');}}
async function verifyTurnstile(token,request,env){
 if(!env.TURNSTILE_SECRET || !env.TURNSTILE_SITE_KEY) return false;
 if(!token || String(token).length>2048)return false;
 const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:String(token)});
 const ip=request.headers.get('CF-Connecting-IP'); if(ip)body.set('remoteip',ip);
 try{const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body,signal:AbortSignal.timeout(6000)});return Boolean((await res.json()).success);}catch{return false;}
}
async function page(db,sql,bindings=[]){return (await db.prepare(sql).bind(...bindings).all()).results;}
async function log(db,item_type,item_id,action,reason){await db.prepare('INSERT INTO moderation_logs (id,item_type,item_id,action,reason) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),item_type,item_id,action,reason||'').run();}
const articleCols='id,title,category,summary,body,image_url,source_url,publisher,venue,event_date,published_at,origin';
const promotionCols='id,title,type,description,venue,event_date,link_url,image_url,video_url,published_at';
const promotionColsLegacy='id,title,type,description,venue,event_date,link_url,image_url,NULL AS video_url,published_at';
const marketCols='id,title,category,description,price_krw,item_condition,region,seller_alias,contact_url,image_url,published_at';

async function publicApi(url,db){
 const p=url.pathname;let limit=Math.min(40,Math.max(1,Number(url.searchParams.get('limit')||12)));
 if(!Number.isFinite(limit))limit=12;
 if(p==='/api/home'){
  const [articles,promotions,marketplace,banners,issues]=await Promise.all([
   page(db,`SELECT ${articleCols} FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 9`),
   promotionPage(db,`SELECT ${promotionCols} FROM promotions WHERE status='published' ORDER BY event_date ASC LIMIT 5`,`SELECT ${promotionColsLegacy} FROM promotions WHERE status='published' ORDER BY event_date ASC LIMIT 5`),
   page(db,`SELECT ${marketCols} FROM marketplace WHERE status='published' ORDER BY published_at DESC LIMIT 6`),
   page(db,'SELECT id,title,image_url,link_url,position FROM banners WHERE active=1 ORDER BY sort_order LIMIT 8'),
   page(db,'SELECT id,title,start_at,end_at,created_at FROM issues ORDER BY id DESC LIMIT 6')]);
  return json({articles,promotions,marketplace,banners,issues});
 }
 if(p==='/api/study-resources'){
  const lesson=safeString(url.searchParams.get('lesson_id'),50);
  if(lesson && !/^(acting|humor|psychology|circus|improv|technical|business|peer)-[1-9][0-9]?$/.test(lesson))return err('학습 자료 ID를 확인해 주세요');
  try{
   const items=await page(db,"SELECT id,lesson_id,kind,title,url,content,created_at FROM study_resources WHERE status='published' AND (?='' OR lesson_id=?) ORDER BY created_at DESC LIMIT 80",[lesson,lesson]);
   return json({items});
  }catch(e){
   // The new D1 migration may not yet have been applied. Do not break other routes.
   if(String(e).includes('no such table: study_resources'))return json({items:[],setupRequired:true});
   throw e;
  }
 }
 if(p==='/api/articles'){
  const category=safeString(url.searchParams.get('category'),30);
  const q=safeString(url.searchParams.get('q'),80);
  return json({items:await page(db,`SELECT ${articleCols} FROM articles WHERE status='published' AND (?='' OR category=?) AND (?='' OR title LIKE ? OR summary LIKE ?) ORDER BY published_at DESC LIMIT ?`,[category,category,q,`%${q}%`,`%${q}%`,limit])});
 }
 if(p==='/api/promotions')return json({items:await promotionPage(db,`SELECT ${promotionCols} FROM promotions WHERE status='published' ORDER BY event_date ASC LIMIT ?`,`SELECT ${promotionColsLegacy} FROM promotions WHERE status='published' ORDER BY event_date ASC LIMIT ?`,[limit])});
 if(p==='/api/marketplace'){
  const category=safeString(url.searchParams.get('category'),30);
  const q=safeString(url.searchParams.get('q'),80);
  return json({items:await page(db,`SELECT ${marketCols} FROM marketplace WHERE status='published' AND (?='' OR category=?) AND (?='' OR title LIKE ? OR description LIKE ?) ORDER BY published_at DESC LIMIT ?`,[category,category,q,`%${q}%`,`%${q}%`,limit])});
 }
 if(p==='/api/issues')return json({items:await page(db,'SELECT id,title,start_at,end_at,created_at FROM issues ORDER BY id DESC LIMIT ?',[limit])});
 if(/^\/api\/issues\/\d{4}-\d{2}$/.test(p)){
  const id=p.split('/').pop(); const rows=await page(db,'SELECT id,title,start_at,end_at FROM issues WHERE id=?',[id]);
  if(!rows.length)return err('발행호가 없습니다',404);
  return json({issue:rows[0],items:await page(db,`SELECT ${articleCols.replaceAll(',',' ,a.')} FROM articles a JOIN issue_articles i ON i.article_id=a.id WHERE i.issue_id=? AND a.status='published' ORDER BY a.published_at DESC`,[id])});
 }
 return null;
}
async function acceptSubmission(type,payload,db,env){
 const id=crypto.randomUUID(), title=safeString(payload.title,130), desc=safeString(payload.description,2000);
 if(title.length<5||desc.length<15)return err('제목 5자 이상, 설명 15자 이상 입력해 주세요');
 const c=classifyPost(type,title,desc);
 if(type==='marketplace'){
  const price=Number(payload.price_krw); if(!Number.isSafeInteger(price)||price<0||price>100000000)return err('판매가격을 확인해주세요');
  const seller=safeString(payload.seller_alias,40); if(seller.length<2)return err('판매자 표시명은 2자 이상입니다');
  const category=['props','stage','costume','books','other'].includes(payload.category)?payload.category:'other';
  const condition=['new','used'].includes(payload.item_condition)?payload.item_condition:'used';
  const recent=await page(db,`SELECT id FROM marketplace WHERE title=? AND seller_alias=? AND created_at>=datetime('now','-7 days') LIMIT 1`,[title,seller]);
  if(recent.length)return err('같은 제목의 최근 등록 글이 있습니다',409);
  await db.prepare(`INSERT INTO marketplace(id,title,category,description,price_krw,item_condition,region,seller_alias,contact_url,image_url,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).bind(id,title,category,desc,price,condition,safeString(payload.region,45),seller,safeUrl(payload.contact_url),safeUrl(payload.image_url),c.status).run();
 }else if(type==='promotion'){
  const phone=normalizePhone(payload.contact_phone);
  if(phone===false)return err('전화번호 형식을 확인해 주세요 (예: 010-1234-5678)');
  if(phone && payload.contact_consent!==true)return err('담당자 연락처의 수집·이용 동의가 필요합니다');
  if(phone && env.PRIVACY_POLICY_READY!=='true')return err('개인정보처리방침 설정 완료 후 연락처 접수가 가능합니다',503);
  if(phonePattern.test([title,desc,payload.venue].join(' ')))return err('공개 글에 전화번호를 적지 마세요. 별도 비공개 연락처 칸을 이용해 주세요');
  const video=payload.video_url?studyYoutubeUrl(payload.video_url):null;
  if(payload.video_url&&!video)return err('동영상은 지원되는 유튜브 HTTPS 링크를 입력해 주세요');
  const image=payload.image_url?safeUrl(payload.image_url):null;
  if(payload.image_url&&!image)return err('이미지 HTTPS 링크를 확인해 주세요');
  const kind=['show','venue','education','contest'].includes(payload.type)?payload.type:'show';
  const dt=safeString(payload.event_date,32);
  if(dt && !/^\d{4}-\d{2}-\d{2}$/.test(dt))return err('행사일을 YYYY-MM-DD로 입력해주세요');
  try{
   await db.prepare(`INSERT INTO promotions(id,title,type,description,venue,event_date,link_url,image_url,video_url,contact_phone,contact_consent_at,source_name,status) VALUES(?,?,?,?,?,?,?,?,?,?,CASE WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END,?,?)`)
    .bind(id,title,kind,desc,safeString(payload.venue,100),dt||null,safeUrl(payload.link_url),image,video,phone,phone,'사용자 제보',c.status).run();
  }catch(e){
   if(String(e).includes('no such column')||String(e).includes('has no column named'))return err('공연 게시글 DB 업데이트가 필요합니다',503);
   throw e;
  }
 }else return err('지원하지 않는 접수 종류',404);
 await log(db,type,id,c.status,'신규 접수: '+c.reason);
 return json({ok:true,id,status:c.status,message:c.status==='deleted'?'스팸으로 자동 비공개 처리되었습니다':c.status==='quarantined'?'검토함으로 접수되었습니다':'승인 대기함으로 접수되었습니다'},201);
}
async function adminApi(request,url,db,env){
 if(!requireAdmin(request,env))return err('관리자 인증 실패',401);
 const p=url.pathname;
 if(request.method==='GET'&&p==='/api/admin/promotion-contact'){
  const id=safeString(url.searchParams.get('id'),64);
  if(!/^[a-f0-9-]{36}$/i.test(id))return err('잘못된 행사 ID');
  try{
   const matches=await page(db,'SELECT contact_phone FROM promotions WHERE id=?',[id]);
   if(!matches.length)return err('행사를 찾을 수 없습니다',404);
   return json({contact_phone:matches[0].contact_phone||null});
  }catch(e){if(String(e).includes('no such column: contact_phone'))return err('개인정보 저장 DB 업데이트가 필요합니다',503);throw e;}
 }
 if(request.method==='POST'&&p==='/api/admin/promotion-contact/delete'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  const d=await parseJson(request),id=safeString(d.id,64);
  if(!/^[a-f0-9-]{36}$/i.test(id))return err('행사 ID를 확인해 주세요');
  try{
   const result=await db.prepare('UPDATE promotions SET contact_phone=NULL,contact_deleted_at=CURRENT_TIMESTAMP WHERE id=?').bind(id).run();
   if(!result.meta.changes)return err('해당 행사를 찾을 수 없습니다',404);
  }catch(e){if(String(e).includes('no such column'))return err('개인정보 저장 DB 업데이트가 필요합니다',503);throw e;}
  await log(db,'promotion',id,'contact_deleted','개인정보 최소화·관리자 요청');
  return json({ok:true});
 }
 if(request.method==='GET'&&p==='/api/admin/queue'){
  const [articles,promotions,marketplace,logs]=await Promise.all([
   page(db,"SELECT id,title,summary AS description,status,created_at,category FROM articles WHERE status IN ('pending','quarantined') ORDER BY created_at DESC LIMIT 40"),
   page(db,"SELECT id,title,description,status,created_at,type FROM promotions WHERE status IN ('pending','quarantined') ORDER BY created_at DESC LIMIT 40"),
   page(db,"SELECT id,title,description,status,created_at,category,price_krw FROM marketplace WHERE status IN ('pending','quarantined') ORDER BY created_at DESC LIMIT 40"),
   page(db,'SELECT item_type,item_id,action,reason,created_at FROM moderation_logs ORDER BY created_at DESC LIMIT 20')]);
  return json({articles,promotions,marketplace,logs});
 }
 if(request.method==='GET'&&p==='/api/admin/promotions'){
   return json({items:await page(db,"SELECT id,title,status,event_date,venue,created_at FROM promotions ORDER BY created_at DESC LIMIT 50")});
 }
 if(request.method==='POST'&&p==='/api/admin/study-resources'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  const d=await parseJson(request);
  const lesson=safeString(d.lesson_id,50), kind=safeString(d.kind,12),title=safeString(d.title,150);
  if(!/^(acting|humor|psychology|circus|improv|technical|business|peer)-[1-9][0-9]?$/.test(lesson))return err('등록할 스터디를 선택해 주세요');
  if(!['youtube','note'].includes(kind)||title.length<4)return err('자료 유형과 제목을 확인해 주세요');
  if(d.rights_confirmed!==true)return err('사용 권한·출처 확인이 필요합니다');
  const link=kind==='youtube'?studyYoutubeUrl(d.url):null;
  const content=kind==='note'?safeString(d.content,4000):'';
  if(kind==='youtube'&&!link)return err('지원되는 HTTPS 유튜브 링크를 입력해 주세요');
  if(kind==='note'&&content.length<20)return err('웹진 교육자료 본문을 20자 이상 작성해 주세요');
  const id=crypto.randomUUID();
  try{
   await db.prepare("INSERT INTO study_resources(id,lesson_id,kind,title,url,content,status) VALUES(?,?,?,?,?,?,'published')")
      .bind(id,lesson,kind,title,link,content).run();
  }catch(e){if(String(e).includes('no such table: study_resources'))return err('스터디 자료 DB 마이그레이션이 필요합니다',503);throw e;}
  await log(db,'study_resource',id,'published','편집자 학습자료 등록');
  return json({ok:true,id,status:'published'},201);
 }
 if(request.method==='POST'&&p==='/api/admin/study-resources/hide'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  const d=await parseJson(request);
  if(!/^[a-f0-9-]{36}$/i.test(String(d.id||'')))return err('잘못된 자료 ID');
  const status=d.status==='published'?'published':'hidden';
  const result=await db.prepare('UPDATE study_resources SET status=? WHERE id=?').bind(status,d.id).run();
  if(!result.meta.changes)return err('스터디 자료를 찾을 수 없습니다',404);
  await log(db,'study_resource',d.id,status,'편집자 학습자료 노출 변경');
  return json({ok:true,status});
 }
 if(request.method==='POST'&&p==='/api/admin/articles'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  const d=await parseJson(request);const title=safeString(d.title,200),body=safeString(d.body,10000),summary=safeString(d.summary,700);
  if(title.length<5||body.length<25)return err('제목 5자, 본문 25자 이상 입력해야 합니다');
  const category=['news','research','column','education'].includes(d.category)?d.category:'news';
  const id=crypto.randomUUID(); const status=d.publish===true?'published':'pending';
  await db.prepare('INSERT INTO articles(id,title,category,summary,body,publisher,status,origin,published_at) VALUES(?,?,?,?,?,?,?,?,?)')
   .bind(id,title,category,summary||body.slice(0,180),body,safeString(d.publisher,60)||'학회 편집부',status,'manual',status==='published'?new Date().toISOString():null).run();
  await log(db,'article',id,status,'관리자 기사 등록');return json({ok:true,id,status},201);
 }
 if(request.method==='POST'&&p==='/api/admin/banners'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  const d=await parseJson(request);const title=safeString(d.title,110),image=safeUrl(d.image_url),link=safeUrl(d.link_url);
  if(title.length<4||!image||!link)return err('배너 제목·이미지(HTTPS)·이동 링크(HTTPS)가 필요합니다');
  const id=crypto.randomUUID();await db.prepare('INSERT INTO banners(id,title,image_url,link_url,position,active) VALUES(?,?,?,?,?,1)').bind(id,title,image,link,'sidebar').run();
  return json({ok:true,id},201);
 }
 if(request.method==='POST'&&p==='/api/admin/review'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  const d=await parseJson(request); const tbl={article:'articles',promotion:'promotions',marketplace:'marketplace'}[d.type];
  if(!tbl||!['published','rejected','deleted','quarantined'].includes(d.status)||!/^[-a-zA-Z0-9]{8,64}$/.test(String(d.id)))return err('잘못된 승인 요청');
  const r=await db.prepare(`UPDATE ${tbl} SET status=?,published_at=CASE WHEN ?='published' THEN CURRENT_TIMESTAMP ELSE published_at END WHERE id=?`).bind(d.status,d.status,d.id).run();
  if(!r.meta.changes)return err('게시물을 찾을 수 없습니다',404);
  if(d.type==='promotion'&&['rejected','deleted'].includes(d.status)){
   try{await db.prepare('UPDATE promotions SET contact_phone=NULL,contact_deleted_at=CURRENT_TIMESTAMP WHERE id=?').bind(d.id).run();}
   catch(e){if(!String(e).includes('no such column'))throw e;}
  }
  await log(db,d.type,d.id,d.status,'관리자 상태 변경');return json({ok:true});
 }
 if(request.method==='POST'&&p==='/api/admin/import'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  return json({sources:await importFeeds(env)});
 }
 if(request.method==='POST'&&p==='/api/admin/create-issue'){
  if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
  return json({ok:true,id:await createMonthlyIssue(db)});
 }
 return err('경로를 찾을 수 없습니다',404);
}
export default {
 async fetch(request,env){
  try{
   const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
   if(request.method==='OPTIONS')return err('허용하지 않는 요청',405);
   if(url.pathname==='/api/config'&&request.method==='GET')return json({siteTitle:env.SITE_TITLE||'한국마술학회 AI 웹진',turnstileSiteKey:env.TURNSTILE_SITE_KEY||'',submissionsEnabled:Boolean(env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY),privacyPolicyReady:env.PRIVACY_POLICY_READY==='true'});
   if(!env.DB)return err('D1 데이터베이스 바인딩이 없습니다',503);
   if(url.pathname.startsWith('/api/admin/'))return adminApi(request,url,env.DB,env);
   if(request.method==='GET'){const r=await publicApi(url,env.DB);if(r)return r;}
   if(request.method==='POST'&&['/api/submissions/marketplace','/api/submissions/promotion'].includes(url.pathname)){
    if(!hasSameOrigin(request))return err('동일 출처 요청만 허용',403);
    if(!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY)return err('아직 게시물 접수 설정이 완료되지 않았습니다',503);
    const data=await parseJson(request);
    if(!await verifyTurnstile(data.turnstile_token,request,env))return err('스팸 방지 인증을 확인할 수 없습니다',403);
    return acceptSubmission(url.pathname.split('/').pop(),data,env.DB,env);
   }
   return err('경로를 찾을 수 없습니다',404);
  }catch(e){console.error('api error',String(e));return err('요청 처리 중 오류가 발생했습니다',500);}
 },
 async scheduled(event,env,ctx){
  if(!env.DB)return;
  if(event.cron==='0 */6 * * *'){ctx.waitUntil(importFeeds(env));ctx.waitUntil(expirePromotionContacts(env.DB));}
  if(event.cron==='0 0 1 * *')ctx.waitUntil(createMonthlyIssue(env.DB));
 }
};
