import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TourPlayback} from './tour-playback.mjs';
import {services,serviceRoute} from './content.js';

test('el recorrido configurado incluye los ocho servicios y presenta cableado en producción',()=>{
 const ids=serviceRoute.map(stop=>services[stop.index]?.id);
 assert.equal(ids.length,8);
 assert.deepEqual([...ids].sort(),services.map(service=>service.id).sort());
 assert.deepEqual(ids.slice(0,3),['security','software','data']);
 const production=serviceRoute.filter(stop=>stop.production);
 assert.equal(production.length,1);
 assert.equal(services[production[0].index].id,'fiber');
});
function setup(){
 let now=0,id=0,finished=0;const jobs=new Map(),steps=[],flights=[];
 const tour=new TourPlayback({clock:()=>now,schedule:(fn,ms)=>{jobs.set(++id,{fn,at:now+ms});return id;},unschedule:id=>jobs.delete(id),
  move:(index,done)=>{const flight={index,done,killed:false,paused:false,kill(){this.killed=true;},pause(){this.paused=true;},resume(){this.paused=false;}};flights.push(flight);return flight;},
  onStep:i=>steps.push(i),onPause:()=>{},onFinish:()=>finished++});
 return {tour,steps,flights,jobs,get finished(){return finished;},advance(ms){now+=ms;for(const [id,job] of [...jobs])if(job.at<=now){jobs.delete(id);job.fn();}}};
}
test('recorre ocho paradas y espera siete segundos después de cada movimiento',()=>{
 const s=setup();s.tour.start();
 for(let index=0;index<8;index++){
  assert.equal(s.tour.index,index);s.advance(1800);assert.equal(s.jobs.size,0);
  s.flights.at(-1).done();s.advance(6999);assert.equal(s.tour.index,index);s.advance(1);
 }
 assert.deepEqual(s.steps,[0,1,2,3,4,5,6,7]);assert.equal(s.finished,1);assert.equal(s.tour.active,false);
});
test('pausar conserva los segundos restantes y congela el movimiento',()=>{
 const s=setup();s.tour.start();s.tour.pause();assert.equal(s.flights[0].paused,true);
 s.advance(20000);assert.equal(s.tour.index,0);s.tour.resume();assert.equal(s.flights[0].paused,false);
 s.flights[0].done();s.advance(1500);s.tour.pause();s.advance(20000);s.tour.resume();
 s.advance(5499);assert.equal(s.tour.index,0);s.advance(1);assert.equal(s.tour.index,1);
});
test('navegar pausado cancela la transición anterior y mantiene la pausa',()=>{
 const s=setup();s.tour.start();const old=s.flights[0];s.tour.pause();s.tour.next();
 assert.equal(old.killed,true);assert.equal(s.tour.index,1);assert.equal(s.flights.at(-1).paused,false);
 s.flights.at(-1).done();assert.equal(s.jobs.size,0);
 old.done();assert.equal(s.tour.phase,'dwelling');assert.equal(s.jobs.size,0);
 s.tour.previous();assert.equal(s.tour.index,0);s.tour.previous();assert.equal(s.tour.index,0);
});
test('cerrar y repetir eliminan temporizadores y callbacks de la ejecución anterior',()=>{
 const s=setup();s.tour.start();const old=s.flights[0];old.done();s.tour.stop();
 s.advance(10000);assert.equal(s.finished,0);assert.equal(s.jobs.size,0);
 s.tour.start();old.done();assert.equal(s.tour.phase,'moving');assert.equal(s.tour.index,0);
});
test('las frases ES/EN tienen como máximo doce palabras',async()=>{
 const {panelSummaries}=await import('./content.js');
 assert.equal(Object.keys(panelSummaries).length,8);
 for(const pair of Object.values(panelSummaries))for(const text of pair)assert.ok(text.split(/\s+/).length<=12,text);
});
