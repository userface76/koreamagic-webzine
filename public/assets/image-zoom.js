/* Click-to-enlarge original posters and activity photos.
   Text-only routes remain separate from zoom; no image transformation or AI imagery. */
(function zoomModule(){
  'use strict';
  const allowed=value=>{
    const raw=String(value||'');
    if(/^\.[/]assets[/][a-zA-Z0-9/_-]+\.(?:webp|png|jpg|jpeg|avif|svg)$/.test(raw))return raw;
    try{
      const u=new URL(raw);
      return u.protocol==='https:'?u.href:'';
    }catch{return '';}
  };
  const close=dialog=>{if(dialog?.open&&typeof dialog.close==='function')dialog.close();else dialog?.remove();};
  function open(src,title){
    const clean=allowed(src);
    if(!clean)return;
    document.querySelector('#kmsImageLightbox')?.remove();
    const dialog=document.createElement('dialog');
    dialog.id='kmsImageLightbox';
    dialog.className='kms-image-lightbox';
    dialog.setAttribute('aria-label',String(title||'사진 확대'));
    const head=document.createElement('div');
    head.className='kms-image-lightbox-head';
    const heading=document.createElement('strong');
    heading.textContent=String(title||'사진 확대');
    const button=document.createElement('button');
    button.type='button';button.textContent='✕ 닫기';button.className='kms-image-lightbox-close';
    button.setAttribute('aria-label','사진 확대 닫기');
    const stage=document.createElement('div');
    stage.className='kms-image-lightbox-stage';
    const img=document.createElement('img');
    img.src=clean;img.alt=String(title||'사진 상세');
    img.decoding='async';
    const foot=document.createElement('p');
    foot.className='kms-image-lightbox-help';
    foot.textContent='닫기 버튼 또는 Esc 키로 돌아갈 수 있습니다.';
    head.append(heading,button);stage.appendChild(img);dialog.append(head,stage,foot);
    document.body.appendChild(dialog);
    button.addEventListener('click',()=>close(dialog));
    dialog.addEventListener('click',event=>{if(event.target===dialog)close(dialog);});
    dialog.addEventListener('close',()=>dialog.remove(),{once:true});
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-zoom-image]');
    if(!target)return;
    event.preventDefault();
    open(target.getAttribute('data-zoom-image'),target.getAttribute('data-zoom-title')||'포스터·사진');
  });
  window.KMS_IMAGE_ZOOM={open};
})();