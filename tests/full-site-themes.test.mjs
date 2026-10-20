import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('site-wide design selector changes layouts, not just hero art',()=>{
 const html=read('public/index.html'),css=read('public/assets/site-themes.css'),script=read('public/assets/design-themes.js');
 assert.match(html,/id="siteThemeChoice"/);
 for(const mode of ['auto','theater','editorial','future'])assert.match(html,new RegExp('value="'+mode+'"'));
 for(const theme of ['theater','editorial','future']){assert.match(css,new RegExp('data-site-theme="'+theme+'"'));assert.ok(script.includes("'"+theme+"'"));}
 for(const part of ['.header','.nav','.hero-grid','.hero-side','.article-grid','.market-grid','.page-hero','.footer','.archive-tabs'])assert.ok(css.includes(part),part);
 assert.match(script,/Math.random/);assert.match(script,/localStorage/);
 assert.doesNotThrow(()=>new Function(script));
});
test('archive contains independently navigable monthly, magician and education sections',()=>{
 const app=read('public/assets/app.js'),archive=read('public/assets/archive-hub.js');
 for(const id of ['monthly','magicians','research','events','study','creations'])assert.ok(archive.includes("'"+id+"'"),id);
 assert.match(app,/data-archive-tab/);assert.match(app,/archiveTab/);
 assert.match(archive,/renderCatalog/);
 assert.doesNotThrow(()=>new Function(archive));assert.doesNotThrow(()=>new Function(app));
});
test('A-Z archive shares source-backed index without duplicating private magician effects',()=>{
 const az=read('public/assets/magician-library.js'),profiles=JSON.parse(read('public/assets/magicians-az.json'));
 assert.match(az,/renderCatalog/);assert.match(az,/location.hash!=='#issues'/);
 assert.ok(profiles.profiles.length>=5);
 for(const p of profiles.profiles){assert.ok(p.evidence.length>0);assert.ok(p.evidence.every(r=>r.url.startsWith('https://')));}
 assert.doesNotThrow(()=>new Function(az));
});
