import { classifyFeed } from './moderation.js';
const xmlText = value => String(value||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
function tag(block,name) { const m=block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i')); return m?xmlText(m[1]):''; }
// 경량 RSS/Atom 지원. 불규칙 XML은 가져오지 않고 검토 필요로 기록.
export function parseFeed(xml) {
  const items=[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(m=>m[1]);
  const entries=items.length?items:[...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map(m=>m[1]);
  return entries.slice(0,30).map(b=>{
    const linkMatch=b.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
    return {title:tag(b,'title'),link:tag(b,'link') || (linkMatch?.[1]||''),summary:tag(b,'description') || tag(b,'summary') || tag(b,'content'),date:tag(b,'pubDate') || tag(b,'published') || tag(b,'updated'),eventDate:tag(b,'startDate')||tag(b,'dtstart'),venue:tag(b,'location')||tag(b,'venue')};
  }).filter(x=>x.title && x.link);
}
function hostMatches(uri,host) { try {const url=new URL(uri);return url.protocol==='https:' && url.hostname===host;} catch{return false;} }
function isoDate(s) {const d=new Date(s);return Number.isNaN(d.getTime())?'':d.toISOString();}
export async function importFeeds(env) {
 const db=env.DB; const sources=(await db.prepare('SELECT * FROM feed_sources WHERE enabled=1 AND verified=1').all()).results;
 const results=[];
 for(const s of sources){
  let imported=0, pending=0, skipped=0;
  try{
   if(!hostMatches(s.feed_url,s.allowed_host)) throw new Error('승인한 호스트와 피드 URL이 일치하지 않습니다');
   const res=await fetch(s.feed_url,{headers:{'User-Agent':'KMS-Webzine-FeedReader/0.1','Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml'},signal:AbortSignal.timeout(9000)});
   if(!res.ok) throw new Error(`HTTP ${res.status}`);
   const ct=res.headers.get('content-type')||'';
   if(!/xml|rss|atom|text\//i.test(ct)) throw new Error('XML 피드가 아님');
   const xml=(await res.text()).slice(0,750000);
   for(const item of parseFeed(xml)){
    if(!hostMatches(item.link,s.allowed_host)) {skipped++;continue;}
    const published=isoDate(item.date),eventDate=isoDate(item.eventDate);
    const relevant=classifyFeed(`${item.title} ${item.summary}`);
    const fresh=published && Date.now()-Date.parse(published)<45*86400000 && Date.parse(published)<Date.now()+86400000;
    const validShow=s.kind==='show' && eventDate && item.venue && Date.parse(eventDate)>Date.now() && Date.parse(eventDate)<Date.now()+366*86400000;
    const auto=Boolean(s.auto_publish && relevant && fresh && (s.kind==='news' || validShow));
    const status=auto?'published':'pending';
    let result;
    if(s.kind==='show'){
      result=await db.prepare('INSERT OR IGNORE INTO promotions(id,title,type,description,venue,event_date,link_url,source_name,status,published_at) VALUES(?,?,?,?,?,?,?,?,?,?)')
        .bind(crypto.randomUUID(),item.title.slice(0,200),'show',item.summary.slice(0,700),(item.venue||'').slice(0,120),eventDate||null,item.link,s.name,status,auto?new Date().toISOString():null).run();
    } else {
      result=await db.prepare('INSERT OR IGNORE INTO articles(id,title,category,summary,source_url,publisher,origin,status,published_at) VALUES(?,?,?,?,?,?,?,?,?)')
        .bind(crypto.randomUUID(),item.title.slice(0,200),'news',item.summary.slice(0,700),item.link,s.name,'rss',status,auto?new Date().toISOString():null).run();
    }
    if(result.meta.changes){imported++;if(!auto)pending++;}
   }
   await db.prepare('UPDATE feed_sources SET last_checked_at=? WHERE id=?').bind(new Date().toISOString(),s.id).run();
   results.push({source:s.name,imported,pending,skipped});
  }catch(e){results.push({source:s.name,error:String(e.message||e).slice(0,200)});}
 }
 return results;
}
export async function createMonthlyIssue(db,date = new Date()) {
 const start=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()-1,1));
 const end=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1));
 const id=start.toISOString().slice(0,7);
 await db.prepare('INSERT OR IGNORE INTO issues(id,title,start_at,end_at) VALUES(?,?,?,?)').bind(id,`${id} 한국마술학회 월간 웹진`,start.toISOString(),end.toISOString()).run();
 await db.prepare(`INSERT OR IGNORE INTO issue_articles(issue_id,article_id)
   SELECT ?,id FROM articles WHERE status='published' AND published_at >= ? AND published_at < ?`)
   .bind(id,start.toISOString(),end.toISOString()).run();
 return id;
}
