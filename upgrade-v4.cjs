const fs=require('node:fs');
let h=fs.readFileSync('index.html','utf8');
h=h.replace('<span class="brand-placeholder">','<span class="header-name brand">Naitel</span><span class="brand-placeholder">');
h=h.replace(/<div class="hero-heading">.*?<\/div>/,'<div class="hero-heading"><span class="link-led" aria-hidden="true"></span><h1><span class="title-mask"><span id="typed-title" aria-hidden="true"></span><span class="typing-caret" aria-hidden="true"></span></span></h1></div>');
h=h.replace(/<div class="scene-tools">.*?<\/div>/,'<div class="scene-tools"><button id="reset-view" data-i18n-aria="reset" aria-label="Reset view">⌖</button></div>');
h=h.replace('id="nav-prev" data-i18n-aria="previous" aria-label="Previous service">←','id="nav-prev" data-i18n-aria="previous" aria-label="Previous service">↑').replace('id="nav-next" data-i18n-aria="next" aria-label="Next service">→','id="nav-next" data-i18n-aria="next" aria-label="Next service">↓');
h=h.replaceAll('service-nav-scroll','service-nav-stack');
h=h.replace('<aside class="detail-panel"','<section class="brands-ribbon" aria-labelledby="brands-title"><p id="brands-title" class="brands-label" data-i18n="brandsTitle">Brands we work with</p><div class="brands-rows"></div></section><div class="link-console" role="status" aria-live="polite"></div><aside class="detail-panel"');
h=h.replace('<span data-i18n="footer">Integrated technology. Growing possibilities.</span>','<span class="footer-network"><span class="footer-ports" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><button id="privacy-link" data-i18n="privacyNotice">Privacy notice</button></span>');
h=h.replace('<div class="intro" aria-hidden="true"><span class="intro-brand">NAITEL<span>®</span></span>','<div class="intro" aria-hidden="true"><div class="intro-cable"></div><svg class="intro-plug" viewBox="0 0 28 22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 6h12V2h8v4h5v10h-5v4h-8v-4H1z"/><path d="M16 7v8m4-8v8"/></svg><span class="intro-brand"><img src="assets/naitel-official.png" alt=""><span class="brand">Naitel</span><i class="intro-link-led"></i></span>');
h=h.replace('<section id="chat-widget"', '<dialog id="privacy-dialog" aria-labelledby="privacy-title"><div class="privacy-top"><h2 id="privacy-title">Privacy notice</h2><button class="privacy-close icon-button" aria-label="Close">×</button></div><p id="privacy-language-note"></p><div id="privacy-content" tabindex="0"></div></dialog><section id="chat-widget"');
h=h.replace('<path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2 1.5-5A8 8 0 1 1 20 11.5Z"/><path d="M7 10h9M7 14h5"/>','<path d="M5 7h3V3h8v4h3v12H5z"/><path d="M9 3v6m3-6v6m3-6v6M9 19v3m6-3v3M8 13h8"/>');
fs.writeFileSync('index.html',h);
let c=fs.readFileSync('content.js','utf8');
c=c.replace('videoOpacity:.12','videoOpacity:.12,privacy:{es:"assets/privacy-document-es.json",en:null}');
c=c.replace(/footer:\[.*?\],prototype:/,'prototype:');
c=c.replace('export const translations = {',"export const translations = {\nbrandsTitle:['Marcas con las que trabajamos','Brands we work with'],privacyNotice:['Aviso de privacidad','Privacy notice'],privacySpanish:['','Spanish original. An English version can be added here.'],privacyLoading:['Cargando aviso…','Loading notice…'],linkEstablished:['enlace establecido','link established'],");
fs.writeFileSync('content.js',c);
let a=fs.readFileSync('app.js','utf8');
a="import { initializeNetworkUI, updateNetworkUI, openPrivacy } from './network-ui.js';\n"+a;
a=a.replace("$('h1').setAttribute('aria-label',t('solutions'));","$('h1').setAttribute('aria-label',t('caption'));");
a=a.replace('renderMessages();updatePauseLabel();','renderMessages();updateNetworkUI(t,reduced,language);');
a=a.replace("if(active&&innerWidth<=700){const scroller=$('.service-nav-scroll');scroller.scrollTo({left:b.offsetLeft+b.offsetWidth/2-scroller.clientWidth/2,behavior:reduced?'instant':'smooth'});}","if(active&&innerWidth<=700){const scroller=$('.service-nav-stack');scroller.scrollTo({top:b.offsetTop+b.offsetHeight/2-scroller.clientHeight/2,behavior:reduced?'instant':'smooth'});}");
const typeStart=a.indexOf('function typeTitle('),typeEnd=a.indexOf('async function intro(){',typeStart);
a=a.slice(0,typeStart)+
"function typeTitle(animate=true){\n  titleTimeline?.kill();caretTween?.kill();\n  const title=$('#typed-title'),caret=$('.typing-caret'),word=t('caption');title.textContent='';\n  const finish=()=>{document.querySelector('.hero-heading').dataset.typing='complete';if(!reduced)caretTween=gsap.to(caret,{opacity:.1,duration:.48,repeat:-1,yoyo:true,ease:'sine.inOut'});};\n  gsap.set(caret,{opacity:1});document.querySelector('.hero-heading').dataset.typing='writing';\n  if(reduced||!animate){title.textContent=word;finish();return;}\n  titleTimeline=gsap.timeline({onComplete:finish});[...word].forEach((_,i)=>titleTimeline.call(()=>{title.textContent=word.slice(0,i+1);},null,i*.021));titleTimeline.to({},{duration:.1});\n}\n"+a.slice(typeEnd);
a=a.replace("gsap.to('.intro-brand',{clipPath:'inset(0 0% 0 0)',duration:1.05,ease:'power3.out'});","gsap.to('.intro-brand',{clipPath:'inset(0 0% 0 0)',duration:.6,ease:'power3.out'});gsap.fromTo('.intro-cable',{scaleX:0},{scaleX:1,duration:.85,ease:'power2.inOut'});gsap.fromTo('.intro-plug',{x:-30,opacity:0},{x:0,opacity:1,duration:.8,ease:'power3.out'});gsap.to('.intro-link-led',{opacity:1,duration:.3,delay:.8,ease:'power2.out'});");
a=a.replace("},.4)\n    .from('.header-logo", "},.95)\n    .from('.header-logo");
a=a.replace("const tl=gsap.timeline({onComplete:()=>{introFinished=true;$('.intro')?.remove();}});","const tl=gsap.timeline({onComplete:()=>{introFinished=true;$('.intro')?.remove();}});tl.call(()=>{$('.intro-bottom>span').textContent='LINK UP';},null,.7);");
a=a.replace("  updateServiceNavigation(index);\n  scene?.select(index);","  updateServiceNavigation(index);\n  const consoleLine=$('.link-console');consoleLine.textContent=t('linkEstablished')+' · '+number(index)+' / 08';gsap.killTweensOf(consoleLine);gsap.timeline().fromTo(consoleLine,{opacity:0,y:5},{opacity:1,y:0,duration:.3,ease:'power3.out'}).to(consoleLine,{opacity:0,y:-4,duration:.5,delay:1.7,ease:'power2.in'});\n  scene?.select(index);");
a=a.replace("document.addEventListener('keydown',e=>{","document.addEventListener('keydown',e=>{\n  if($('#privacy-dialog').open)return;");
const motionStart=a.indexOf('function updatePauseLabel()'),motionEnd=a.indexOf('/* 07',motionStart);
a=a.slice(0,motionStart)+
"function applyMotionPreference(){paused=reduced;if(scene){scene.paused=reduced;scene.reduced=reduced;}updateNetworkUI(t,reduced,language);switchVideo(selected>=0?(services[selected].video||config.ambientVideo):config.ambientVideo);if(reduced&&titleTimeline?.isActive())typeTitle(false);}\nmotionQuery.addEventListener('change',e=>{reduced=e.matches;applyMotionPreference();});\n"+a.slice(motionEnd);
a=a.replace('setPaused(paused);','applyMotionPreference();initializeNetworkUI();');
a=a.replace("$('.language').addEventListener('click',()=>setLanguage(language==='en'?'es':'en'));","$('.language').addEventListener('click',()=>setLanguage(language==='en'?'es':'en'));\n$('#privacy-link').addEventListener('click',()=>openPrivacy(language));");
fs.writeFileSync('app.js',a);

