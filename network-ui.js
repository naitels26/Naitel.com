import {brandImage,preloadBrands} from './brands.js';
/* Cinta de fabricantes y aviso proporcionado por el usuario. Sin llamadas externas. */
import { config } from './content.js';

let translate=k=>k,motionReduced=false,privacyFocus;
const privacy=document.querySelector('#privacy-dialog'),content=document.querySelector('#privacy-content');
const scrim=document.querySelector('.privacy-scrim');let inertBefore=[];
const brands=[['Genetec','Hoffman','AMD','SanDisk','Honeywell','CyberPower','HUAWEI','Lenovo','QNAP','Synology','H3C','ASUS'],['Azure','Microsoft','AWS','CPI','HPE','Aruba','Belden','CommScope','Panduit','Logitech','Samsung','Rittal']];
const marquees=[];let activePrivacyLanguage='es',privacyCache={};
const partnerLevels={Axis:'Gold Partner',Panduit:'Gold Partner',Cisco:'Certified Partner',Fortinet:'Advocate Partner',Belden:'Certified Partner',CommScope:'Certified Partner','Schneider Electric':'Certified Partner',Genetec:'Certified Partner',Milestone:'Certified Partner',Microsoft:'Partner'};
const partnerAssets={Axis:{src:'assets/certifications/01-axis-200x128.jpeg'},Milestone:{src:'assets/certifications/10-milestone-200x128.jpeg'}};
let activePartner=null,diploma,closeTimer;
function ribbonLabel(){
  document.querySelector('#brands-title').textContent=document.documentElement.lang==='es'?'Marcas y alianzas':'Brands and partners';
  if(activePartner&&partnerLevels[activePartner.dataset.partner])renderDiploma(activePartner);
}
function renderDiploma(port){
  const name=port.dataset.partner,level=partnerLevels[name],es=document.documentElement.lang==='es';
  diploma.classList.toggle('partner-diploma--gold',level==='Gold Partner');
  diploma.querySelector('.diploma-eyebrow').textContent=es?'ALIANZA TECNOLÓGICA':'TECHNOLOGY PARTNERSHIP';
  diploma.querySelector('.diploma-brand').replaceChildren(brandImage(name,{asset:partnerAssets[name]}));
  diploma.querySelector('.diploma-level').textContent=level;
  diploma.querySelector('.diploma-caption').textContent=es?'Certificación de partner':'Partner certification';
  diploma.querySelector('.diploma-seal-label').textContent=level==='Gold Partner'?'GOLD':level==='Advocate Partner'?'ADVOCATE':level==='Partner'?'PARTNER':'CERTIFIED';
  diploma.querySelector('.diploma-close').setAttribute('aria-label',es?'Cerrar certificación':'Close certification');
}
function positionDiploma(){
  if(!activePartner||diploma.hidden)return;
  const rect=activePartner.getBoundingClientRect(),width=diploma.getBoundingClientRect().width;
  diploma.style.left=Math.max(12,Math.min(innerWidth-width-12,rect.left+rect.width/2-width/2))+'px';
  diploma.style.bottom=(innerHeight-rect.top+18)+'px';
}
function easeRibbonSpeed(speed){
  for(const {animation} of marquees){
    animation.paused(motionReduced||document.hidden);
    gsap.to(animation,{timeScale:speed,duration:motionReduced?0:speed?.65:.4,ease:'power2.out',overwrite:true});
  }
}
function openPartner(port){
  clearTimeout(closeTimer);
  if(activePartner!==port)closePartner();
  activePartner=port;port.dataset.expanded='true';
  const certified=!!partnerLevels[port.dataset.partner];
  if(certified){port.setAttribute('aria-expanded','true');renderDiploma(port);}
  diploma.hidden=!certified;positionDiploma();
  easeRibbonSpeed(0);
}
function closePartner(){
  clearTimeout(closeTimer);
  if(activePartner){delete activePartner.dataset.expanded;if(partnerLevels[activePartner.dataset.partner])activePartner.setAttribute('aria-expanded','false');}
  activePartner=null;if(diploma)diploma.hidden=true;
  easeRibbonSpeed(1);
}
const deferClose=()=>{clearTimeout(closeTimer);closeTimer=setTimeout(closePartner,180);};
export function updateNetworkUI(t,reduced=false,language='en'){
  translate=t;motionReduced=reduced;
  for(const entry of marquees)entry.animation.paused(reduced||document.hidden||!!activePartner);
  ribbonLabel();
  document.querySelector('#privacy-title').textContent=t('privacyNotice');
  document.querySelector('#privacy-link').textContent=t('privacyNotice');
  document.querySelector('.privacy-close').setAttribute('aria-label',t('close'));
  if(privacy.open)loadPrivacy(language);
}
export async function initializeNetworkUI(){
  preloadBrands();
  const stage=document.querySelector('.brands-rows');
  diploma=document.createElement('aside');diploma.className='partner-diploma';diploma.id='partner-diploma';diploma.hidden=true;
  diploma.setAttribute('aria-live','polite');
  diploma.innerHTML='<button class="diploma-close" type="button">×</button><div class="diploma-frame"><span class="diploma-eyebrow"></span><div class="diploma-brand"></div><span class="diploma-caption"></span><h3 class="diploma-level"></h3><div class="diploma-recipient">NAITEL</div><div class="diploma-bottom"><span class="diploma-signature">Technology &amp; connection</span><span class="diploma-seal"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m10 21-2 9 8-4 8 4-2-9"/><circle cx="16" cy="13" r="10"/><path d="m11 13 3 3 7-7"/></svg><span class="diploma-seal-label"></span></span></div></div>';
  document.body.append(diploma);
  diploma.addEventListener('pointerenter',()=>clearTimeout(closeTimer));
  diploma.addEventListener('pointerleave',deferClose);
  diploma.addEventListener('focusin',()=>clearTimeout(closeTimer));
  diploma.addEventListener('focusout',event=>{if(!activePartner?.contains(event.relatedTarget)&&!diploma.contains(event.relatedTarget))deferClose();});
  const dismiss=()=>{const port=activePartner;closePartner();port?.focus({preventScroll:true});closePartner();};
  diploma.querySelector('.diploma-close').addEventListener('click',dismiss);
  document.addEventListener('pointerdown',event=>{if(activePartner&&!activePartner.contains(event.target)&&!diploma.contains(event.target))closePartner();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&activePartner){event.stopPropagation();dismiss();}});
  window.addEventListener('resize',closePartner);
  const face=document.createElement('div');face.className='ribbon-face';face.dataset.active='true';
  const viewport=document.createElement('div');viewport.className='brands-row';
  const track=document.createElement('div');track.className='brands-track';
  const names=[...brands.flat(),'Axis','Cisco','Fortinet','Schneider Electric','Milestone'];
  for(let copy=0;copy<2;copy++){
    const group=document.createElement('div');group.className='brands-group';
    if(copy===1)group.setAttribute('aria-hidden','true');
    for(const name of names){
      const logo=brandImage(name,{normalize:true,asset:partnerAssets[name]});
      const certified=!!partnerLevels[name];
      const port=document.createElement(certified?'button':'span');
      port.className='brand-port partner-port';port.dataset.partner=name;
      if(certified){
        port.type='button';port.setAttribute('aria-label',name+' — '+partnerLevels[name]);
        port.setAttribute('aria-expanded','false');port.setAttribute('aria-controls','partner-diploma');
      }else port.setAttribute('aria-label',name);
      port.append(logo);port.tabIndex=copy===1?-1:0;
      port.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')openPartner(port);});
      port.addEventListener('pointerleave',deferClose);
      port.addEventListener('focus',()=>{
        const rect=port.getBoundingClientRect(),view=viewport.getBoundingClientRect();
        if(rect.left<view.left||rect.right>view.right){
          const shift=rect.left-view.left-(view.width-rect.width)/2;
          animation.progress(Math.max(0,Math.min(.999,animation.progress()+shift/(track.scrollWidth/2))));
        }
        openPartner(port);
      });
      port.addEventListener('blur',event=>{if(!diploma.contains(event.relatedTarget))deferClose();});
      port.addEventListener('click',()=>openPartner(port));
      group.append(port);
    }
    track.append(group);
  }
  viewport.append(track);face.append(viewport);stage.append(face);
  const animation=gsap.fromTo(track,{xPercent:0},{xPercent:-50,duration:100,ease:'none',repeat:-1,paused:motionReduced||document.hidden});
  marquees.push({animation,track});
  viewport.addEventListener('pointerenter',()=>easeRibbonSpeed(0));
  viewport.addEventListener('pointerleave',()=>{if(!activePartner)easeRibbonSpeed(1);});
  viewport.addEventListener('focusin',()=>easeRibbonSpeed(0));
  viewport.addEventListener('focusout',()=>{if(!activePartner)animation.paused(motionReduced||document.hidden);});
  animation.eventCallback('onUpdate',positionDiploma);
  ribbonLabel();
}
document.addEventListener('visibilitychange',()=>{closePartner();for(const {animation} of marquees)animation.paused(motionReduced||document.hidden);});
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

