import test from 'node:test';
import assert from 'node:assert/strict';
import {accessCycle} from './assets/operation-cycle.mjs';

test('el vehículo se detiene, se identifica y espera la apertura completa',()=>{
  for(const t of [3,4,5,6,6.99])assert.equal(accessCycle(t).z,3.5);
  assert.equal(accessCycle(4).scanning,true);
  assert.equal(accessCycle(4).identified,false);
  assert.equal(accessCycle(4.5).identified,true);
  assert.equal(accessCycle(7).open,1);
});
test('la pluma permanece abierta mientras cualquier parte del vehículo cruza',()=>{
  for(let t=0;t<16;t+=.01){const frame=accessCycle(t);if(frame.visible&&Math.abs(frame.z)<1.7)assert.equal(frame.open,1);}
  assert.ok(accessCycle(11).z+1.7<0);
  assert.equal(accessCycle(12).state,'closing');
});
test('el reinicio ocurre con el vehículo oculto y las posiciones son continuas durante el paso',()=>{
  assert.equal(accessCycle(15.99).visible,false);
  assert.deepEqual(accessCycle(16),accessCycle(0));
  for(const boundary of [3,5,7,11,13])assert.ok(Math.abs(accessCycle(boundary-.001).z-accessCycle(boundary).z)<.01);
});
