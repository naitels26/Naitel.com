import {brandImage} from './brands.js';
import { initializeNetworkUI, updateNetworkUI, openPrivacy } from './network-ui.js';
import { applyBrandTypography, observeBrandTypography } from './brand.js';
import { services, serviceRoute, equipmentRoute, config, translations, serviceBrands, successStories } from './content.js';
import {initializeContact} from './contact.js';
import {categoryById,categoryForService,initializeServiceMap,nextRouteStep} from './service-map.js';

/* 01 — Estado y preferencias; conservamos el explorador de una sola pantalla. */
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=motionQuery.matches,paused=reduced,language='en',selected=-1,scene=null;
let introFinished=false,panelTimeline,lastFocus,titleTimeline,caretTween,chatFocus;
let sceneStable=false;
let chatOpen=false,pending=false,chatService=null;
const panel=$('.detail-panel'),chat=$('#chat-widget');
// Pointer capture supports mouse, touch and pen without opening after a drag.
const assistantLauncher=$('#chat-launcher');
const assistantPosition={launcher:false,window:false};
function placeAssistant(element,x,y){
  const viewport=window.visualViewport;
  const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0;
  const width=viewport?.width||innerWidth,height=viewport?.height||innerHeight;
  const r=element.getBoundingClientRect(),gap=8;
  element.style.left=Math.max(left+gap,Math.min(x,left+width-r.width-gap))+'px';
  element.style.top=Math.max(top+gap,Math.min(y,top+height-r.height-gap))+'px';
  element.style.right='auto';element.style.bottom='auto';
}
function anchorAssistantWindow(){
  if(!assistantPosition.launcher||assistantPosition.window)return;
  const r=assistantLauncher.getBoundingClientRect(),h=chat.offsetHeight;
  placeAssistant(chat,r.right-chat.offsetWidth,r.top-h-12>=8?r.top-h-12:r.bottom+12);
}
function makeAssistantDraggable(element,handle,key){
  let drag=null,suppressClick=false;
  handle.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0||(event.target.closest('button')&&event.target.closest('button')!==handle))return;
    const r=element.getBoundingClientRect();
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:r.left,top:r.top,moved:false};
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    drag.moved=true;assistantPosition[key]=true;handle.classList.add('is-dragging');
    placeAssistant(element,drag.left+dx,drag.top+dy);
    if(key==='launcher')anchorAssistantWindow();
  });
  const end=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    if(drag.moved){suppressClick=true;setTimeout(()=>suppressClick=false,0);}
    drag=null;handle.classList.remove('is-dragging');
    if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
  };
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>handle.addEventListener(type,end));
  handle.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
  handle.addEventListener('keydown',event=>{
    const vector={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if(!vector||!event.altKey||event.target!==handle)return;
    event.preventDefault();event.stopPropagation();
    const r=element.getBoundingClientRect();assistantPosition[key]=true;
    placeAssistant(element,r.left+vector[0]*20,r.top+vector[1]*20);
    if(key==='launcher')anchorAssistantWindow();
  });
}
makeAssistantDraggable(assistantLauncher,assistantLauncher,'launcher');
makeAssistantDraggable(chat,$('.chat-top'),'window');
function fitAssistant(){
  for(const [key,element] of [['launcher',assistantLauncher],['window',chat]]){
    if(assistantPosition[key]){const r=element.getBoundingClientRect();placeAssistant(element,r.left,r.top);}
  }
  anchorAssistantWindow();
}
window.addEventListener('resize',fitAssistant);
window.visualViewport?.addEventListener('resize',fitAssistant);
window.visualViewport?.addEventListener('scroll',fitAssistant);
new ResizeObserver(fitAssistant).observe(chat);
new ResizeObserver(()=>{
  document.body.style.setProperty('--focus-sheet-height',panel.offsetHeight+'px');
  if(selected>=0&&!tour?.active)scene?.resize();
}).observe(panel);
const number=i=>String(i+1).padStart(2,'0');
const t=key=>translations[key]?.[language==='es'?0:1]||key;
const serviceName=s=>language==='es'?s.name:s.en;
const featuresFor=s=>language==='es'?s.features:s.featuresEn;
const descriptionFor=s=>language==='es'?s.description:s.descriptionEn;
const messages=[{kind:'greeting'}];
let updateContact=()=>{};
let tour;
let selectedCategory=null,officialSelection=false,mapUI,panelFitFrame;
const routeStops=serviceRoute;
let routeStep=0;
function navigateRoute(delta){if(tour?.active){delta>0?tour.next():tour.previous();return;}const stops=officialSelection?routeStops:equipmentRoute,next=nextRouteStep(selected<0?-1:routeStep,delta,stops.length);openService(stops[next].index,stops[next]);}
const solutionToggle=$('#solutions-toggle'), solutionList=$('#solutions-list');
function closeSolutions(focus=false){solutionList.hidden=true;solutionToggle.setAttribute('aria-expanded','false');if(focus)solutionToggle.focus();}
function renderSolutions(){
  const createButton=(name,index,options={})=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',()=>{if(!introFinished)return;closeSolutions();if(tour?.active)tour.close({focus:false});openService(index,options);});return b;};
  solutionList.replaceChildren(...routeStops.map((stop,step)=>{
    const category=categoryById(stop.category),button=createButton(category.name[language==='es'?0:1],category.index,stop);
    button.dataset.category=category.id;
    const count=document.createElement('span');count.className='solution-index';count.textContent=number(step);button.prepend(count);
    for(const event of ['pointerenter','focus'])button.addEventListener(event,()=>scene?.previewCategory(category));
    for(const event of ['pointerleave','blur'])button.addEventListener(event,()=>scene?.previewCategory(null));return button;
  }));
}
solutionToggle.addEventListener('click',()=>{const open=solutionList.hidden;solutionList.hidden=!open;solutionToggle.setAttribute('aria-expanded',String(open));});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.solutions-menu'))closeSolutions();});
document.addEventListener('keydown',e=>{if(solutionList.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeSolutions(true);}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();const buttons=$$('button',solutionList).filter(button=>button.getClientRects().length),i=buttons.indexOf(document.activeElement);buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}},true);
window.NAITEL_CHAT_ADAPTER=async ({message,serviceId,language})=>{
  const history=messages.slice(0,-1).filter(m=>m.kind==='user'||(m.kind==='custom'&&!m.error)).slice(-10).map(m=>({role:m.kind==='user'?'user':'model',text:m.text.slice(0,4000)}));
  const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,serviceId,language,history}),signal:AbortSignal.timeout(50000)});
  const data=await response.json();
  if(!response.ok)throw Object.assign(new Error(data.error),{code:data.error});
  return data;
};
window.addEventListener('resize',()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
const logo=$('#official-logo');
logo.addEventListener('load',()=>{logo.hidden=false;$('.brand-placeholder').hidden=true;});
logo.addEventListener('error',()=>{logo.hidden=true;});
if(config.logo)logo.src=config.logo;
try{if(localStorage.getItem('naitel-theme')==='dark')document.documentElement.dataset.theme='dark';}catch{}

/* 02 — Navegación compartida, alternativa HTML y traducción completa. */
services.forEach((s,i)=>{
  const article=document.createElement('article');article.dataset.article=i;
  article.innerHTML='<h3></h3><p></p><ul></ul><button type="button"></button>';
  $('button',article).addEventListener('click',()=>openService(i));$('#accessible-content').append(article);
});
function updateThemeControl(){
  const dark=document.documentElement.dataset.theme==='dark';
  $('.theme-button').setAttribute('aria-pressed',String(dark));
  $('.theme-button').dataset.i18nAria=dark?'light':'dark';
  $('.theme-button').setAttribute('aria-label',t(dark?'light':'dark'));
}
function setLanguage(next,{animate=true}={}){
  language=next;document.documentElement.lang=next;document.title=t('pageTitle');
  $('meta[name=description]').content=t('pageDescription');
  $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  $$('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
  $$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  $('.language').innerHTML=next==='en'?'EN <span>/ ES</span>':'ES <span>/ EN</span>';
  $('.language').setAttribute('aria-label',next==='en'?'Cambiar idioma a español':'Change language to English');
  $('h1').setAttribute('aria-label',t('caption'));updateThemeControl();
  services.forEach((s,i)=>{
    const name=serviceName(s);
    $$('[data-service="'+i+'"]').forEach(b=>{b.setAttribute('aria-label',name);$('.service-tooltip',b).textContent=language==='es'?s.short:s.en;});
    const article=$('[data-article="'+i+'"]');$('h3',article).textContent=name;$('p',article).textContent=descriptionFor(s);
    $('ul',article).replaceChildren(...featuresFor(s).map(feature=>{const li=document.createElement('li');li.textContent=feature;return li;}));
    $('button',article).textContent=t('solutions')+' — '+name;
    if(scene){const label=scene.objects[i].label;$('.label-name',label).textContent=language==='es'?s.short:s.en;label.setAttribute('aria-label',name);}
  });
  if(selected>=0)fillPanel(selected);const prefilled=$('#chat-input').dataset.prefilledService;if(prefilled){const s=services.find(s=>s.id===prefilled);$('#chat-input').value=language==='es'?'Quiero información sobre '+serviceName(s)+'.':'I would like information about '+serviceName(s)+'.';}renderMessages();updateNetworkUI(t,reduced,language);
  renderSolutions();renderSuccessStories();scene?.setLanguage(language);updateContact();tour?.update();mapUI?.select(selectedCategory);updateMotionControl();updateServiceNavigation();applyBrandTypography();if(introFinished)typeTitle(animate);
}
$('.language').addEventListener('click',()=>setLanguage(language==='en'?'es':'en'));
$('#privacy-link').addEventListener('click',()=>openPrivacy(language));

/* Independent, non-modal case study drawer; opening never changes the scene. */
const storiesPanel=$('#success-stories-panel'),storiesToggle=$('#success-stories-toggle');
function renderSuccessStories(){
  const locale=language==='es'?0:1;
  $('#success-stories-list').replaceChildren(...successStories.map(story=>{
    const card=document.createElement('article');card.className='success-story';card.dataset.story=story.id;
    const title=document.createElement('h3');title.textContent=story.title[locale];
    const summary=document.createElement('p');summary.textContent=story.summary[locale];
    const highlights=document.createElement('ul');
    highlights.replaceChildren(...story.highlights.map(pair=>{const li=document.createElement('li');li.textContent=pair[locale];return li;}));
    if(story.logo){const image=document.createElement('img');image.className='success-story-logo';image.src=story.logo;image.alt=story.logoAlt;image.width=160;image.height=96;image.loading='lazy';image.addEventListener('error',()=>image.remove(),{once:true});card.append(image);}
    card.append(title,summary,highlights);return card;
  }));
}
function closeSuccessStories({focus=false}={}){
  if(storiesPanel.inert)return;
  storiesPanel.inert=true;storiesPanel.setAttribute('aria-hidden','true');storiesToggle.setAttribute('aria-expanded','false');
  if(focus)storiesToggle.focus({preventScroll:true});
}
storiesToggle.addEventListener('click',()=>{
  if(!storiesPanel.inert){closeSuccessStories({focus:true});return;}
  storiesPanel.inert=false;storiesPanel.setAttribute('aria-hidden','false');storiesToggle.setAttribute('aria-expanded','true');
  $('#success-stories-close').focus({preventScroll:true});
});
$('#success-stories-close').addEventListener('click',()=>closeSuccessStories({focus:true}));
document.addEventListener('pointerdown',e=>{if(!storiesPanel.contains(e.target)&&!storiesToggle.contains(e.target))closeSuccessStories();});
document.addEventListener('focusin',e=>{if(!storiesPanel.contains(e.target)&&!storiesToggle.contains(e.target))closeSuccessStories();});
document.addEventListener('keydown',e=>{
  if(storiesPanel.inert)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeSuccessStories({focus:true});}
  else if(storiesPanel.contains(e.target)&&['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key))e.stopImmediatePropagation();
},true);

function updateServiceNavigation(){
  $('#prev-service').disabled=false;$('#next-service').disabled=false;
  $('#current-number').textContent=selected<0?'—':number(routeStep);
}

/* 03 — Máquina de escribir cancelable; el subtítulo espera a la última letra. */
function typeTitle(animate=true){
  titleTimeline?.kill();caretTween?.kill();
  const title=$('#typed-title'),caret=$('.typing-caret'),word=t('caption');title.textContent='';
  const finish=()=>{document.querySelector('.hero-heading').dataset.typing='complete';if(!reduced)caretTween=gsap.to(caret,{opacity:.1,duration:.48,repeat:-1,yoyo:true,ease:'sine.inOut'});};
  gsap.set(caret,{opacity:1});document.querySelector('.hero-heading').dataset.typing='writing';
  if(reduced||!animate){title.textContent=word;finish();return;}
  titleTimeline=gsap.timeline({onComplete:finish});[...word].forEach((_,i)=>titleTimeline.call(()=>{title.textContent=word.slice(0,i+1);},null,i*.021));titleTimeline.to({},{duration:.1});
}
function setLoadProgress(value){
  const overlay=$('.intro');if(!overlay)return;
  const progress=Math.max(Number(overlay.dataset.progress||0),Math.min(100,Math.round(value)));
  overlay.dataset.progress=progress;overlay.setAttribute('aria-valuenow',String(progress));
  $('#load-number').textContent=String(progress).padStart(2,'0');
  $('.load-line i').style.transform='scaleX('+progress/100+')';
}
// Optional assets and GPU initialization must not hold the whole page behind the loader.
async function waitForStartup(task,timeout){
  let timer;
  try{return await Promise.race([Promise.resolve(task).then(()=>true),new Promise(resolve=>{timer=setTimeout(()=>resolve(false),timeout);})]);}
  finally{clearTimeout(timer);}
}
async function intro(){
  const overlay=$('.intro');let skipped=false,assembly;
  const started=performance.now();
  const skip=()=>{skipped=true;assembly?.progress(1);};
  overlay?.addEventListener('click',skip);document.addEventListener('keydown',skip,{once:true});
  const ready=await waitForStartup(sceneReady,15000);
  if(ready)setLoadProgress(100);
  else{
    $('.scene-fallback').hidden=false;
    console.warn('3D startup is taking too long; opening the page while it finishes.');
  }
  if(!reduced&&!skipped)await new Promise(resolve=>setTimeout(resolve,Math.max(0,1500-(performance.now()-started))));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  typeTitle(false);
  await new Promise(resolve=>gsap.to(overlay,{opacity:0,duration:reduced?0:.25,onComplete:()=>{overlay?.remove();resolve();}}));
  const stable=()=>{sceneStable=true;tour?.ready();performance.mark('naitel-scene-stable');applyMotionPreference();scene?.startDeferred().catch(error=>console.warn('Deferred scene',error));};
  if(scene&&!reduced&&!skipped){assembly=scene.intro();assembly.eventCallback('onComplete',()=>{scene.assembling=false;scene.transitioning=false;stable();});}
  else stable();
  introFinished=true;
  document.removeEventListener('keydown',skip);
}

/* 04 — Misma cámara curva y panel; ahora con contenido breve y salida al chat. */
function fitServicePanel(){
  cancelAnimationFrame(panelFitFrame);
  panelFitFrame=requestAnimationFrame(()=>{
    if(panel.getAttribute('aria-hidden')==='true')return;
    for(const density of ['normal','compact','tight']){
      panel.dataset.density=density;
      if(panel.scrollHeight<=panel.clientHeight+1)break;
    }
    panel.scrollTop=0;
  });
}
window.addEventListener('resize',fitServicePanel);
window.visualViewport?.addEventListener('resize',fitServicePanel);
document.fonts.addEventListener('loadingdone',fitServicePanel);
function fillPanel(index){
  const category=selectedCategory||categoryForService(index),locale=language==='es'?0:1;
  const s=services[index];$('.detail-number').textContent=number(routeStep);$('#current-number').textContent=number(routeStep);updateServiceNavigation();
  $('#detail-title').textContent=officialSelection?category.name[locale]:serviceName(s);$('.detail-description').textContent=officialSelection?category.summary[locale]:descriptionFor(s);
  $('.detail-features').replaceChildren(...(officialSelection?category.capabilities.map(pair=>pair[locale]):featuresFor(s)).slice(0,3).map(f=>{const li=document.createElement('li');li.textContent=f;return li;}));
  $('#detail-category').textContent=category.zone[locale];
  panel.setAttribute('aria-label',$('#detail-title').textContent);panel.dataset.category=category.id;panel.dataset.service=s.id;panel.dataset.mode=officialSelection?'category':'equipment';panel.style.setProperty('--category-color',category.color);mapUI?.select(category);
  // The zone above the title supplies context; the full category remains in the title/dialog.
  $('#detail-category').textContent=officialSelection?category.zone[locale]:category.name[locale];
  $('#detail-note').textContent=['consulting','software'].includes(category.id)?category.note[locale]:'';
  $('.service-tags').replaceChildren(...featuresFor(s).map(text=>{const el=document.createElement('span');el.textContent=text;return el;}));
  const names=serviceBrands[s.id];
  $('.service-brands').replaceChildren(...names.map(brandImage));
  panel.classList.remove('panel-loading');void panel.offsetWidth;panel.classList.add('panel-loading');
  fitServicePanel();

}
function openService(index,options={}){
  const {zone=false}=options;
  // The production hall presents cabling, so every stop remains a service.
  if(zone&&index===7)index=3;
  if(tour?.active){tour.pause();return;}
  if(tour?.complete)tour.close({focus:false});
  if(!introFinished)return;
  if(index<0||index>7)return;
  selectedCategory=categoryById(options.category)||categoryForService(index);officialSelection=!!options.category;
  routeStep=officialSelection?routeStops.findIndex(stop=>stop.category===selectedCategory.id):equipmentRoute.findIndex(stop=>stop.index===index);
  const cameraOptions={production:false,...options,duration:reduced?0:1.6};
  mapUI?.close();closeSuccessStories();
  document.body.dataset.focusService=services[index].id;
  if(selected===index){panelTimeline?.kill();gsap.set(panel,{opacity:1,xPercent:0,yPercent:0,visibility:'visible'});gsap.killTweensOf(panel.querySelectorAll('*'));gsap.set($$('.detail-number,#detail-title,.detail-description,.detail-features,.detail-features li,.quote-button,.panel-navigation',panel),{opacity:1,y:0});fillPanel(index);scene?.select(index,cameraOptions);return;}
  const switching=selected>=0;if(!switching)lastFocus=document.activeElement;
  $('.hero-heading').inert=true;selected=index;document.documentElement.style.setProperty('--service-tint',['#29b6f6','#57cbb8','#ed9b34','#26bbd4','#577cdb','#8768c7','#e56b43','#4d9aaf'][index]);document.body.classList.add('detail-open');
  updateServiceNavigation(index);
  const consoleLine=$('.link-console');consoleLine.textContent=t('linkEstablished')+' · '+number(routeStep)+' / 08';gsap.killTweensOf(consoleLine);gsap.timeline().fromTo(consoleLine,{opacity:0,y:5},{opacity:1,y:0,duration:reduced?0:.3,ease:'power3.out'}).to(consoleLine,{opacity:0,y:-4,duration:reduced?0:.5,delay:1.7,ease:'power2.in'});
  fillPanel(index);scene?.select(index,cameraOptions);switchVideo(services[index].video||config.ambientVideo);
  panelTimeline?.kill();gsap.killTweensOf(panel);panel.inert=false;panel.setAttribute('aria-hidden','false');gsap.set(panel,{xPercent:0,yPercent:0,visibility:'visible'});
  const d=(reduced||paused)?.18:.36;panelTimeline=gsap.timeline();
  const parts=$$('.detail-number,#detail-title,.detail-description,.detail-features,.detail-features li,.quote-button,.panel-navigation',panel);
  gsap.killTweensOf(parts);gsap.set(parts,{opacity:1,y:0});
  if(switching){
    gsap.set($$('.quote-button,.panel-navigation',panel),{opacity:1,y:0});
    panel.scrollTop=0;
    panelTimeline.fromTo(panel,{opacity:.75},{opacity:1,duration:reduced?0:.2,ease:'power2.out'});
  }else{
    fillPanel(index);panel.scrollTop=0;gsap.set(panel,{visibility:'visible'});
    panelTimeline.fromTo(panel,{xPercent:innerWidth>700?110:0,yPercent:innerWidth<=700?105:0,opacity:0},{xPercent:0,yPercent:0,opacity:1,duration:d,ease:'power3.out'},reduced?0:.24)
      .call(()=>$('.close-panel',panel).focus({preventScroll:true}));
  }
}
function closeService({focus=true}={}){
  if(tour?.active){tour.close({focus});return;}
  if(selected<0)return;selected=-1;selectedCategory=null;mapUI?.select(null);delete document.body.dataset.focusService;panelTimeline?.kill();gsap.killTweensOf(panel);
  $('.hero-heading').inert=false;document.documentElement.style.removeProperty('--service-tint');scene?.select(-1);
  updateServiceNavigation(-1);switchVideo(config.ambientVideo);
  panel.inert=true;panel.setAttribute('aria-hidden','true');
  gsap.to(panel,{xPercent:innerWidth>700?110:0,yPercent:innerWidth<=700?105:0,opacity:0,duration:reduced?.15:.65,ease:'power3.inOut',onComplete:()=>{if(selected<0){gsap.set(panel,{visibility:'hidden'});document.body.classList.remove('detail-open');}}});
  if(focus){const target=lastFocus?.isConnected&&lastFocus.getClientRects().length?lastFocus:$('#solutions-toggle');target.focus({preventScroll:true});}
}
gsap.set(panel,{visibility:'hidden',opacity:0});panel.inert=true;
$('.close-panel').addEventListener('click',()=>closeService());
$('#reset-view').addEventListener('click',()=>selected>=0?closeService():scene?.select(-1));
$('#prev-service').addEventListener('click',()=>navigateRoute(-1));
$('#next-service').addEventListener('click',()=>navigateRoute(1));
$('.header-logo').addEventListener('click',e=>{e.preventDefault();closeService();});
document.addEventListener('keydown',e=>{
  if($('#privacy-dialog').open||$('#contact-dialog').open||e.defaultPrevented)return;
  if(e.key==='Escape'&&chatOpen){e.preventDefault();closeChatbot();return;}
  if(chatOpen||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey)return;
  if(tour?.active||!$('#tour-ending').hidden)return;
  if(e.key==='Escape'){e.preventDefault();closeService();}
  if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){
    e.preventDefault();const forward=e.key==='ArrowRight'||e.key==='ArrowDown';navigateRoute(forward?1:-1);
  }
});
let wheelTime=0,wheelAccum=0;
$('#scene').addEventListener('wheel',e=>{
  if(tour?.active){e.preventDefault();tour.pause();return;}
  if(!introFinished||chatOpen||e.ctrlKey)return;e.preventDefault();wheelAccum+=e.deltaY;
  const now=performance.now();if(now-wheelTime<1400||Math.abs(wheelAccum)<65)return;
  navigateRoute(wheelAccum>0?1:-1);wheelTime=now;wheelAccum=0;
},{passive:false});

/* 05 — Continuous ambient loop; service changes keep the same playhead. */
const videos=$$('.video-backdrop video');let videoSlot=0,videoRequest=0,currentVideo='';
async function switchVideo(source){
  if(!sceneStable||document.hidden)return;
  const request=++videoRequest;
  if(reduced||paused||!source){videos.forEach(v=>{v.classList.remove('is-visible');v.style.removeProperty('opacity');v.pause();});$('.video-backdrop').dataset.motion='static';currentVideo='';return;}
  if(source===currentVideo)return;
  const incoming=videos[1-videoSlot],outgoing=videos[videoSlot];incoming.src=source;incoming.load();
  try{
    await incoming.play();
    if(request!==videoRequest||document.hidden||reduced||paused){if(document.hidden||reduced||paused)incoming.pause();return;}
    incoming.style.opacity='var(--ambient-video-opacity, '+config.videoOpacity+')';incoming.classList.add('is-visible');$('.video-backdrop').dataset.motion='playing';outgoing.classList.remove('is-visible');outgoing.style.removeProperty('opacity');
    setTimeout(()=>{if(!outgoing.classList.contains('is-visible')){outgoing.pause();outgoing.removeAttribute('src');outgoing.load();}},1400);
    videoSlot=1-videoSlot;currentVideo=source;
  }catch{if(request!==videoRequest)return;incoming.style.removeProperty('opacity');incoming.classList.remove('is-visible');$('.video-backdrop').dataset.motion='static';}
}

/* 06 — Synchronized theme colors, without a screen-wide reveal. */
$('.theme-button').addEventListener('click',()=>{
  const dark=document.documentElement.dataset.theme!=='dark';
  document.documentElement.dataset.theme=dark?'dark':'light';updateThemeControl();
  try{localStorage.setItem('naitel-theme',dark?'dark':'light');}catch{}
  scene?.setTheme(dark);
});
let ambientPaused=false;
function updateMotionControl(){const button=$('#map-motion');if(button){button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',t(paused?'resumeMotion':'pauseMotion'));button.title=t(paused?'resumeMotion':'pauseMotion');button.textContent=paused?'▷':'Ⅱ';button.disabled=reduced;}document.body.classList.toggle('ambient-paused',paused);}
function applyMotionPreference(){paused=reduced||ambientPaused;if(scene){scene.paused=paused;scene.reduced=reduced;if(reduced&&scene.cameraFlight?.isActive())scene.cameraFlight.progress(1);}updateMotionControl();updateNetworkUI(t,paused,language);switchVideo(selected>=0?(services[selected].video||config.ambientVideo):config.ambientVideo);if(reduced&&titleTimeline?.isActive())typeTitle(false);}
window.addEventListener('naitel:toggle-motion',()=>{ambientPaused=!ambientPaused;applyMotionPreference();});
$('#map-motion').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('naitel:toggle-motion')));
motionQuery.addEventListener('change',e=>{reduced=e.matches;applyMotionPreference();});
/* 07 — Botones magnéticos originales; cursor normal del sistema. */
$$('.magnetic').forEach(button=>{
  button.addEventListener('pointermove',e=>{
    if(reduced||paused||e.pointerType!=='mouse')return;const r=button.getBoundingClientRect();
    gsap.to(button,{x:(e.clientX-r.left-r.width/2)*.07,y:(e.clientY-r.top-r.height/2)*.12,duration:.3,ease:'power3.out',overwrite:true});
  });
  button.addEventListener('pointerleave',()=>gsap.to(button,{x:0,y:0,duration:.5,ease:'power3.out',overwrite:true}));
});
let inactivityTimer;
function scheduleWiggle(){clearTimeout(inactivityTimer);inactivityTimer=setTimeout(()=>{if(!reduced&&!paused&&!chatOpen&&!document.hidden)gsap.fromTo('.chat-button',{rotation:-2},{rotation:0,duration:.6,ease:'elastic.out(1,.3)'});},8000);}
document.addEventListener('pointerdown',scheduleWiggle,{passive:true});scheduleWiggle();

/* 08 — Chat conectado al servidor; punto de integración público.
   window.NAITEL_CHAT_ADAPTER = async ({message,serviceId,language}) => string;
   La clave de Gemini y el catálogo se consultan exclusivamente en el servidor. */
export function openChatbot(prefilledMessage=''){
  fitAssistant();
  chatFocus=document.activeElement;chatOpen=true;chatService=selected>=0?services[selected].id:chatService;
  chat.inert=false;chat.setAttribute('aria-hidden','false');$('#chat-launcher').setAttribute('aria-expanded','true');
  document.body.classList.add('chat-open');gsap.killTweensOf(chat);
  gsap.fromTo(chat,{y:reduced?0:24,opacity:0},{y:0,opacity:1,visibility:'visible',duration:reduced?.15:.65,ease:'power3.out'});
  if(prefilledMessage)$('#chat-input').value=prefilledMessage;
  $('#chat-input').focus({preventScroll:true});
  window.dispatchEvent(new CustomEvent('naitel:chat-open',{detail:{prefilledMessage,serviceId:chatService,language}}));
}
window.openChatbot=openChatbot;
function closeChatbot(){
  if(selected>=0)gsap.set($$('.quote-button,.panel-navigation',panel),{opacity:1,y:0});
  gsap.killTweensOf(chat);
  chatOpen=false;chat.inert=true;chat.setAttribute('aria-hidden','true');$('#chat-launcher').setAttribute('aria-expanded','false');document.body.classList.remove('chat-open');
  gsap.to(chat,{y:reduced?0:15,opacity:0,duration:reduced?.1:.3,ease:'power2.in',onComplete:()=>{if(!chatOpen)gsap.set(chat,{visibility:'hidden'});}});
  chatFocus?.focus({preventScroll:true});
}
$('#close-chat').addEventListener('click',closeChatbot);
$('#chat-launcher').addEventListener('click',()=>chatOpen?closeChatbot():openChatbot());
$('#ask-chat').addEventListener('click',()=>{
  panelTimeline?.progress(1);
  const name=serviceName(services[selected]);openChatbot(language==='es'?'Quiero información sobre '+name+'.':'I would like information about '+name+'.');
  $('#chat-input').dataset.prefilledService=services[selected].id;
});
function renderMessages(){
  const log=$('.chat-messages');log.replaceChildren();
  messages.forEach(message=>{
    const bubble=document.createElement('div');bubble.className='chat-message '+(message.kind==='user'?'from-user':'from-assistant');
    if(message.kind==='service'){
      const s=services.find(s=>s.id===message.serviceId),p=document.createElement('p');p.textContent=descriptionFor(s);bubble.append(p);
      const list=document.createElement('ul');featuresFor(s).forEach(f=>{const li=document.createElement('li');li.textContent=f;list.append(li);});bubble.append(list);
      const note=document.createElement('small');note.textContent=t('demoEnding');bubble.append(note);
    }else bubble.textContent=message.kind==='greeting'?t('greeting'):message.kind==='demo'?t('demoReply'):message.text;
    if(message.contact){
      const actions=document.createElement('div');actions.className='chat-contact-actions';
      const button=document.createElement('button');button.type='button';button.textContent=t('contactLink');
      button.addEventListener('click',()=>{closeChatbot();window.dispatchEvent(new CustomEvent('naitel:contact-open',{detail:{serviceId:message.serviceId||'consulting'}}));});
      const email=document.createElement('a');email.href='mailto:aleon@naitel.com';email.textContent='aleon@naitel.com';
      actions.append(button,email);bubble.append(actions);
    }
    log.append(bubble);
  });
  applyBrandTypography(log);log.scrollTop=log.scrollHeight;$('#chat-status').textContent=pending?t('typing'):'';
}
$('#chat-input').addEventListener('input',()=>delete $('#chat-input').dataset.prefilledService);
$('#chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#chat-form').requestSubmit();}});
$('#chat-form').addEventListener('submit',async e=>{
  e.preventDefault();if(pending)return;
  const input=$('#chat-input'),message=input.value.trim();if(!message)return;
  messages.push({kind:'user',text:message});input.value='';delete input.dataset.prefilledService;
  pending=true;$('button[type=submit]',$('#chat-form')).disabled=true;renderMessages();
  try{
    if(typeof window.NAITEL_CHAT_ADAPTER==='function'){
      const response=await window.NAITEL_CHAT_ADAPTER({message,serviceId:chatService,language});
      const text=typeof response==='string'?response:response?.reply;
      if(typeof text!=='string'||!text.trim())throw new Error('Empty chatbot response');
      messages.push({kind:'custom',text,contact:response?.action==='contact',serviceId:chatService});
    }else{
      await new Promise(resolve=>setTimeout(resolve,reduced?100:550));
      messages.push(chatService?{kind:'service',serviceId:chatService}:{kind:'demo'});
    }
  }catch(error){
    const errorKeys={CHAT_NOT_CONFIGURED:'chatSetupNote',PROVIDER_BUSY:'chatBusy',PROVIDER_QUOTA:'chatQuota',PROVIDER_AUTH:'chatAuth',PROVIDER_TIMEOUT:'chatTimeout',RATE_LIMITED:'chatRateLimit'};
    messages.push({kind:'custom',error:true,contact:true,serviceId:chatService,text:t(errorKeys[error.code]||(['TimeoutError','AbortError'].includes(error.name)?'chatTimeout':'chatError'))});
  }
  finally{pending=false;$('button[type=submit]',$('#chat-form')).disabled=false;renderMessages();}
});

/* 09 — Arranque diferido; las fuentes y el render inicial preceden al ensamblaje. */
// An optional feature must not prevent the core page from starting.
import('./tour.js').then(({initializeTour})=>{
  tour=initializeTour({getScene:()=>scene,isReady:()=>introFinished&&sceneStable,isReduced:()=>reduced,t,prepare:()=>closeService({focus:false}),
    prepareService(index,options){
      closeSuccessStories();
      if(panel.contains(document.activeElement))$('#tour-pause').focus({preventScroll:true});
      panelTimeline?.kill();gsap.killTweensOf(panel);gsap.killTweensOf(panel.querySelectorAll('*'));
      selected=index;routeStep=equipmentRoute.findIndex(stop=>stop.index===index);
      selectedCategory=categoryForService(index);officialSelection=false;
      document.body.dataset.focusService=services[index].id;document.body.classList.add('detail-open');
      panel.inert=false;panel.setAttribute('aria-hidden','false');
      gsap.set(panel,{visibility:'visible',opacity:1,xPercent:0,yPercent:0,y:0});
      gsap.set($$('.detail-number,#detail-title,.detail-description,.detail-features,.detail-features li,.quote-button,.panel-navigation',panel),{opacity:1,y:0});
      fillPanel(index);panel.scrollTop=0;
    },
    showService(){
      panel.inert=false;panel.setAttribute('aria-hidden','false');gsap.set(panel,{visibility:'visible'});
      gsap.set(panel,{opacity:1,y:0});
    },
    hideService(){
      gsap.killTweensOf(panel);selected=-1;selectedCategory=null;mapUI?.select(null);
      delete document.body.dataset.focusService;document.body.classList.remove('detail-open');
      panel.inert=true;panel.setAttribute('aria-hidden','true');gsap.set(panel,{visibility:'hidden',opacity:0,y:0});
      updateServiceNavigation(-1);
    }
  });
  tour.update();if(sceneStable)tour.ready();
}).catch(error=>{
  $('#explore-solutions').disabled=false;
  $('#explore-solutions').addEventListener('click',()=>openService(0));
  console.warn('Guided tour unavailable:',error);
});
mapUI=initializeServiceMap({getSelection:()=>({category:selectedCategory,index:selected,service:!officialSelection&&selected>=0?{id:services[selected].id,name:serviceName(services[selected])}:null}),getLanguage:()=>language,pauseTour:()=>tour?.pause(),closeMenu:()=>closeSolutions()});
observeBrandTypography();
gsap.set(chat,{visibility:'hidden',opacity:0});setLanguage('en',{animate:false});updateServiceNavigation();initializeNetworkUI();
const sceneReady=(async()=>{
  setLoadProgress(2);
  await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
  await waitForStartup(document.fonts.load('16px "Euronism D3"').catch(()=>{}),1200);
  setLoadProgress(6);return import('./scene.js');
})().then(async m=>{
  try{
    scene=await m.InfrastructureScene.create($('#scene'),{onSelect:openService,onNavigate:navigateRoute,reduced,onProgress:setLoadProgress});
    scene.paused=paused;scene.reduced=reduced||paused;
    if(document.documentElement.dataset.theme==='dark')scene.setTheme(true);
    $('.scene-fallback').hidden=true;
    setLanguage(language,{animate:false});performance.mark('naitel-first-frame');
    // A slow scene can become available after the loader has already released the page.
    if(introFinished){tour?.ready();applyMotionPreference();scene.startDeferred().catch(error=>console.warn('Deferred scene',error));}
    return scene;
  }catch(error){console.warn('3D scene unavailable:',error);$('.scene-fallback').hidden=false;return null;}
}).catch(error=>{console.warn('3D scene unavailable:',error);$('.scene-fallback').hidden=false;return null;});
intro();


updateContact=initializeContact({t,getLanguage:()=>language,openPrivacy});updateContact();

document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(v=>v.pause());else if(!reduced&&!paused){switchVideo(selected>=0?(services[selected].video||config.ambientVideo):config.ambientVideo);videos.filter(v=>v.classList.contains('is-visible')).forEach(v=>v.play().catch(()=>{}));}});


