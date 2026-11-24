import manifest from './assets/brands/manifest.js';

// Official supplied files only. Optional: darkFile, monochrome, visualScale.
export function brandImage(name,options={}){
  const item=options.asset||manifest[name]||{},slot=document.createElement('span');
  slot.className='brand-port';slot.style.setProperty('--brand-color',item.color||'#173d66');
  slot.style.setProperty('--logo-scale',String(item.visualScale||1));
  slot.style.setProperty('--logo-optical-height',(item.opticalHeight||16)+'px');
  slot.setAttribute('aria-label',name);slot.dataset.monochrome=String(!!item.monochrome);slot.dataset.whiteSource=String(!!item.whiteSource);
  const fallback=document.createElement('span');fallback.className='brand-fallback';fallback.textContent=name;slot.append(fallback);
  if(!item.file&&!item.src)return slot;
  const art=document.createElement('span');art.className='brand-art';art.hidden=true;
  const img=new Image();img.alt='';img.decoding='async';img.className='brand-logo-light';
  img.onload=()=>{fallback.hidden=true;art.hidden=false;slot.dataset.hasLogo='true';if(options.normalize)normalizeArtwork(img,art);};
  img.onerror=()=>{art.remove();fallback.hidden=false;delete slot.dataset.hasLogo;};
  img.src=item.src||'assets/brands/'+item.file;art.append(img);
  if(item.darkFile){
    const dark=new Image();dark.alt='';dark.decoding='async';dark.className='brand-logo-dark';
    dark.onload=()=>slot.dataset.darkLogo='true';
    dark.onerror=()=>{dark.remove();delete slot.dataset.darkLogo;};
    dark.src='assets/brands/'+item.darkFile;art.append(dark);
  }
  slot.append(art);return slot;
}

// Measure the actual ink, excluding transparent/white file margins. The source
// artwork stays intact; only its CSS viewport and proportional scale change.
const artworkBounds=new Map();
function normalizeArtwork(img,art){
  let bounds=artworkBounds.get(img.src);
  if(!bounds){
    const canvas=document.createElement('canvas');
    const scale=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight));
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    try{
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);
      let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
      const transparent=data[3]<128;
      for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
        const i=(y*canvas.width+x)*4;
        if(data[i+3]>64&&(transparent||Math.min(data[i],data[i+1],data[i+2])<225)){
          left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
        }
      }
      if(right<left)return;
      bounds={left,top,width:right-left+1,height:bottom-top+1,sourceWidth:canvas.width,sourceHeight:canvas.height};
      artworkBounds.set(img.src,bounds);
    }catch{return;}
  }
  const fit=Math.min(104/bounds.width,22/bounds.height);
  art.style.width=bounds.width*fit+'px';art.style.height=bounds.height*fit+'px';
  img.style.width=bounds.sourceWidth*fit+'px';img.style.height=bounds.sourceHeight*fit+'px';
  img.style.left=-bounds.left*fit+'px';img.style.top=-bounds.top*fit+'px';
  art.dataset.normalized='true';
}

export function preloadBrands(){
  for(const item of Object.values(manifest)){
    if(!item.file)continue;
    const link=document.createElement('link');link.rel='preload';link.as='image';
    link.href='assets/brands/'+item.file;document.head.append(link);
  }
}
