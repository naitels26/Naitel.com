import {serviceRoute} from './content.js';
import {TourPlayback} from './tour-playback.mjs';

export function initializeTour({getScene,isReady,isReduced,t,prepare,prepareService,showService,hideService}){
  const $=s=>document.querySelector(s),start=$('#explore-solutions'),controls=$('#tour-controls'),ending=$('#tour-ending');
  const hiddenUI=[...document.querySelectorAll('.hero-heading,.service-navigation,.scene-tools')];
  let previousFocus,uiState=[],dragStart=null,returnFlight;
  const stops=serviceRoute;
  const animate=element=>{gsap.killTweensOf(element);gsap.fromTo(element,{opacity:0,y:12},{opacity:1,y:0,duration:isReduced()?0:.35,ease:'power2.out'});};
  function restore(){
    document.body.classList.remove('tour-active','tour-paused');hideService();controls.hidden=true;
    hiddenUI.forEach((element,i)=>element.inert=uiState[i]??false);
    getScene()?.objects.forEach(o=>o.label.classList.remove('tour-hotspot'));
  }
  function home(){
    const scene=getScene();if(!scene)return;
    scene.touring=false;scene.onTourResize=null;returnFlight=scene.select(-1,{duration:1.6});
  }
  function close({focus=true}={}){
    playback.stop();ending.hidden=true;restore();home();
    if(focus)(previousFocus?.isConnected?previousFocus:start).focus({preventScroll:true});
  }
  const playback=new TourPlayback({
    count:stops.length,
    move(step,done){const {index,...options}=stops[step];return getScene().select(index,{...options,tour:true,duration:2,onComplete:()=>{done();update();showService();}});},
    onStep(index){
      prepareService(stops[index].index);getScene().objects.forEach((o,i)=>o.label.classList.toggle('tour-hotspot',i===stops[index].index));
      update();
    },
    onPause(){update();},
    onFinish(){
      restore();home();ending.hidden=false;animate(ending);$('#tour-consultation').focus({preventScroll:true});
    }
  });
  function update(){
    $('#tour-count').textContent=`${playback.index+1} / ${stops.length}`;
    $('#tour-progress').max=stops.length;
    $('#tour-progress').value=playback.index+1;
    $('#tour-pause').textContent=t(playback.paused?'tourResume':'tourPause');
    $('#tour-pause').setAttribute('aria-label',t(playback.paused?'tourResume':'tourPause'));
    $('#tour-pause').setAttribute('aria-pressed',String(playback.paused));
    $('#tour-previous').disabled=playback.index===0;
    $('#tour-next').disabled=playback.index===stops.length-1;
    document.body.classList.toggle('tour-paused',playback.active&&playback.paused);
  }
  function begin(){
    if(!isReady()||!getScene())return;
    returnFlight?.kill();playback.stop();prepare();
    previousFocus=document.activeElement.closest('#tour-ending')?start:document.activeElement;ending.hidden=true;
    uiState=hiddenUI.map(element=>element.inert);hiddenUI.forEach(element=>element.inert=true);
    document.body.classList.add('tour-active');controls.hidden=false;getScene().touring=true;getScene().routeStop=-1;
    getScene().onTourResize=()=>{playback.pause();playback.go(playback.index);};
    playback.start();$('#tour-pause').focus({preventScroll:true});
  }
  start.addEventListener('click',begin);$('#tour-repeat').addEventListener('click',begin);
  $('#tour-pause').addEventListener('click',()=>playback.toggle());
  $('#tour-previous').addEventListener('click',()=>playback.previous());
  $('#tour-next').addEventListener('click',()=>playback.next());
  $('#tour-close').addEventListener('click',()=>close());$('#tour-ending-close').addEventListener('click',()=>close());
  $('#tour-consultation').addEventListener('click',()=>{close();$('#consultation').click();});
  document.addEventListener('keydown',event=>{
    if(!playback.active&&ending.hidden)return;
    if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable=true],dialog,#chat-widget'))return;
    if(event.key==='Escape'){event.preventDefault();close();return;}
    if(!playback.active)return;
    if(event.key==='ArrowLeft'){event.preventDefault();playback.previous();}
    if(event.key==='ArrowRight'){event.preventDefault();if(playback.index<stops.length-1)playback.next();}
    if(event.code==='Space'){event.preventDefault();playback.toggle();}
  });
  const stage=$('#scene');
  stage.addEventListener('wheel',()=>playback.pause(),{passive:true});
  stage.addEventListener('pointerdown',event=>{dragStart={x:event.clientX,y:event.clientY};},{passive:true});
  stage.addEventListener('pointermove',event=>{if(dragStart&&Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y)>8)playback.pause();},{passive:true});
  window.addEventListener('pointerup',()=>dragStart=null,{passive:true});
  window.addEventListener('pointercancel',()=>dragStart=null,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)playback.pause();});
  // Opening an assistant or dialog leaves the current stop available to resume.
  window.addEventListener('naitel:chat-open',()=>playback.pause());
  document.querySelectorAll('[data-open-contact],#privacy-link').forEach(button=>button.addEventListener('click',()=>playback.pause()));
  $('.header-logo').addEventListener('click',()=>{if(playback.active||!ending.hidden)close({focus:false});});
  return {update,close,pause:()=>playback.pause(),previous:()=>playback.previous(),next:()=>{if(playback.index<stops.length-1)playback.next();},get active(){return playback.active;},get complete(){return !ending.hidden;},ready(){start.disabled=!getScene();}};
}
