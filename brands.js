import manifest from './assets/brands/manifest.js';

// Official supplied files only. Optional: darkFile, monochrome, visualScale.
export function brandImage(name){
  const item=manifest[name]||{},slot=document.createElement('span');
  slot.className='brand-port';slot.style.setProperty('--brand-color',item.color||'#173d66');
  slot.style.setProperty('--logo-scale',String(item.visualScale||1));
  slot.style.setProperty('--logo-optical-height',(item.opticalHeight||16)+'px');
  slot.setAttribute('aria-label',name);slot.dataset.monochrome=String(!!item.monochrome);slot.dataset.whiteSource=String(!!item.whiteSource);
  const fallback=document.createElement('span');fallback.className='brand-fallback';fallback.textContent=name;slot.append(fallback);
  if(!item.file)return slot;
  const art=document.createElement('span');art.className='brand-art';art.hidden=true;
  const img=new Image();img.alt='';img.decoding='async';img.className='brand-logo-light';
  img.onload=()=>{fallback.hidden=true;art.hidden=false;slot.dataset.hasLogo='true';};
  img.onerror=()=>{art.remove();fallback.hidden=false;delete slot.dataset.hasLogo;};
  img.src='assets/brands/'+item.file;art.append(img);
  if(item.darkFile){
    const dark=new Image();dark.alt='';dark.decoding='async';dark.className='brand-logo-dark';
    dark.onload=()=>slot.dataset.darkLogo='true';
    dark.onerror=()=>{dark.remove();delete slot.dataset.darkLogo;};
    dark.src='assets/brands/'+item.darkFile;art.append(dark);
  }
  slot.append(art);return slot;
}

export function preloadBrands(){
  for(const item of Object.values(manifest)){
    if(!item.file)continue;
    const link=document.createElement('link');link.rel='preload';link.as='image';
    link.href='assets/brands/'+item.file;document.head.append(link);
  }
}
