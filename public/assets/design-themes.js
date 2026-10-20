/* Global site-wide design mode; persists a user choice or randomizes for each new visit. */
(() => {
 'use strict';
 const key='kms-webzine-site-theme-v2',themes=['theater','editorial','future','bright'];
 let choice='editorial';
 try{const saved=localStorage.getItem(key);if(themes.includes(saved)||saved==='auto')choice=saved;}catch{}
 let chosen=choice==='auto'?themes[Math.floor(Math.random()*themes.length)]:choice;
 document.documentElement.dataset.siteTheme=chosen;
 document.documentElement.dataset.siteThemeChoice=choice;
 document.addEventListener('DOMContentLoaded',()=>{
  const select=document.getElementById('siteThemeChoice');if(!select)return;
  select.value=choice;
  const meta=document.querySelector('meta[name="theme-color"]');
  const apply=()=>{
   chosen=choice==='auto'?themes[Math.floor(Math.random()*themes.length)]:choice;
   document.documentElement.dataset.siteTheme=chosen;
   document.documentElement.dataset.siteThemeChoice=choice;
   if(meta)meta.content={theater:'#11111e',editorial:'#f4efe5',future:'#091329',bright:'#f8fcff'}[chosen];
  };
  if(meta)meta.content={theater:'#11111e',editorial:'#f4efe5',future:'#091329',bright:'#f8fcff'}[chosen];
  select.addEventListener('change',()=>{
   choice=select.value;if(!['auto',...themes].includes(choice))return;
   try{localStorage.setItem(key,choice);}catch{}
   apply();
  });
 });
})();