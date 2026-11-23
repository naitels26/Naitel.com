import {brandImage,preloadBrands} from './brands.js';
/* Cinta de fabricantes y aviso proporcionado por el usuario. Sin llamadas externas. */
import { config } from './content.js';
let translate=k=>k,motionReduced=false,privacyFocus;
const privacy=document.querySelector('#privacy-dialog'),content=document.querySelector('#privacy-content');
const scrim=document.querySelector('.privacy-scrim');let inertBefore=[];
const brands=[['Genetec','Hoffman','AMD','SanDisk','Honeywell','CyberPower','HUAWEI','Lenovo','QNAP','Synology','H3C','ASUS'],['Azure','Microsoft','AWS','CPI','HPE','Aruba','Belden','CommScope','Panduit','Logitech','Samsung','Rittal']];
const colors=['#154e75','#bf3b2b','#111111','#d32030','#c92f26','#1f617f','#d32f35','#c72c30','#155d9c','#667887','#b32b2b','#164e80'];
const marquees=[];let activePrivacyLanguage='es',privacyCache={};
export function updateNetworkUI(t,reduced=false,language='en'){
  translate=t;motionReduced=reduced;
  for(const entry of marquees)entry.animation.paused(reduced||document.hidden);
  document.querySelector('.brands-label').textContent=t('brandsTitle');
  document.querySelector('#privacy-title').textContent=t('privacyNotice');
  document.querySelector('#privacy-link').textContent=t('privacyNotice');
  document.querySelector('.privacy-close').setAttribute('aria-label',t('close'));
  if(privacy.open)loadPrivacy(language);
}
export async function initializeNetworkUI(){
  preloadBrands();
  for(const [row,names] of [brands.flat()].entries()){
    const viewport=document.createElement('div');viewport.className='brands-row';
    const track=document.createElement('div');track.className='brands-track';
    for(let copy=0;copy<2;copy++){
      const group=document.createElement('div');group.className='brands-group';
      if(copy===1){group.setAttribute('aria-hidden','true');group.inert=true;}
      for(const name of names){const port=brandImage(name);if(copy===0)port.tabIndex=0;group.append(port);}
      track.append(group);
    }
    viewport.append(track);document.querySelector('.brands-rows').append(viewport);
    // Equal groups include their trailing spacing: -50% is exactly one full cycle.
    const animation=gsap.fromTo(track,{xPercent:0},{xPercent:-50,duration:84,ease:'none',repeat:-1,paused:motionReduced||document.hidden});
    marquees.push({animation,track});
    const slow=()=>gsap.to(animation,{timeScale:0,duration:.3,ease:'power2.out',overwrite:true});
    const resume=()=>gsap.to(animation,{timeScale:1,duration:1,ease:'power2.out',overwrite:true});
    viewport.addEventListener('pointerenter',slow);viewport.addEventListener('pointerleave',resume);viewport.addEventListener('focusin',slow);viewport.addEventListener('focusout',resume);
  }
}
document.addEventListener('visibilitychange',()=>{for(const {animation} of marquees)animation.paused(motionReduced||document.hidden);});
function paragraph(text){const p=document.createElement('p');p.textContent=text;if(!text.trim())p.className='privacy-empty';return p;}
export async function loadPrivacy(language='en'){
  const translated=language==='en'&&config.privacy?.en;
  activePrivacyLanguage=translated?'en':'es';const source=translated?config.privacy.en:config.privacy.es;
  document.querySelector('#privacy-language-note').textContent=language==='en'&&!translated?translate('privacySpanish'):'';
  content.lang=activePrivacyLanguage;
  if(!privacyCache[source]){
    content.textContent=translate('privacyLoading');
    try{const response=await fetch(source);if(!response.ok)throw Error('Privacy source');privacyCache[source]=await response.json();}
    catch{content.textContent='// PEGAR AQUÍ EL AVISO DE PRIVACIDAD';return;}
  }
  content.replaceChildren(renderPrivacyBlocks(privacyCache[source].blocks));content.scrollTop=0;
}
export function renderPrivacyBlocks(blocks){
  const fragment=document.createDocumentFragment();
  for(const block of blocks){
    if(block.type==='paragraph')fragment.append(paragraph(block.text));
    if(block.type==='table'){
      const table=document.createElement('table');const body=document.createElement('tbody');
      block.rows.forEach((cells,row)=>{const tr=document.createElement('tr');for(const cell of cells){const td=document.createElement(row?'td':'th');if(!row)td.scope='col';for(const text of (Array.isArray(cell)?cell:[cell]))td.append(paragraph(text));tr.append(td);}body.append(tr);});
      table.append(body);fragment.append(table);
    }
  }
  return fragment;
}
export function openPrivacy(language='en'){
  privacyFocus=document.activeElement;privacy.showModal();loadPrivacy(language);
  scrim.hidden=false;gsap.fromTo(scrim,{opacity:0},{opacity:1,duration:.35,ease:'power2.out'});
  if(!privacy.matches(':modal')){inertBefore=[...document.body.children].filter(el=>el!==privacy&&el!==scrim).map(el=>[el,el.inert]);for(const [el] of inertBefore)el.inert=true;}
  document.querySelector('.privacy-close').focus({preventScroll:true});
  gsap.killTweensOf(privacy);gsap.fromTo(privacy,{opacity:0,y:motionReduced?0:18},{opacity:1,y:0,duration:motionReduced?.15:.55,ease:'power3.out'});
}
function closePrivacy(){
  gsap.killTweensOf(privacy);gsap.to(scrim,{opacity:0,duration:.25,ease:'power2.out'});gsap.to(privacy,{opacity:0,y:motionReduced?0:10,duration:motionReduced?.12:.25,ease:'power2.in',onComplete:()=>{privacy.close();scrim.hidden=true;for(const [el,value] of inertBefore)el.inert=value;inertBefore=[];privacyFocus?.focus({preventScroll:true});}});
}
document.querySelector('.privacy-close').addEventListener('click',closePrivacy);
privacy.addEventListener('cancel',event=>{event.preventDefault();closePrivacy();});
scrim.addEventListener('click',closePrivacy);
privacy.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closePrivacy();}if(event.key==='Tab'){const controls=[...privacy.querySelectorAll('button,[tabindex="0"]')];const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
privacy.addEventListener('click',event=>{const r=privacy.getBoundingClientRect();if(event.target===privacy&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closePrivacy();});

