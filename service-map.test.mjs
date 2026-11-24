import test from 'node:test';
import assert from 'node:assert/strict';
import {serviceCategories,serviceMapStops,categoryById,categoryForService,additionalHotspots,nextRouteStep} from './service-map.js';

test('Solutions category navigation retains its existing sequence independently of the equipment tour',()=>{
  const expected=['security','consulting','engineering','cybersecurity','connectivity','datacenters','power','software'];
  assert.deepEqual(serviceMapStops.map(stop=>stop.category),expected);
  assert.equal(serviceMapStops[0].index,5);
  let step=-1;const visited=[];
  for(let i=0;i<8;i++){step=nextRouteStep(step,1);visited.push(serviceMapStops[step].category);}
  assert.deepEqual(visited,expected);
  assert.equal(nextRouteStep(step,1),0);
  assert.equal(nextRouteStep(0,-1),7);
});

test('Solutions retains eight unique categories and their category focus targets',()=>{
  assert.equal(serviceCategories.length,8);
  assert.equal(new Set(serviceCategories.map(c=>c.id)).size,8);
  assert.deepEqual(new Set(serviceMapStops.map(stop=>stop.category)),new Set(serviceCategories.map(c=>c.id)));
  assert.equal(serviceMapStops.length,8);
  for(const stop of serviceMapStops)assert.ok(stop.index>=0&&stop.index<8);
  // Engineering, consulting, OT and software share a legacy index but need different views.
  assert.equal(serviceMapStops.filter(stop=>stop.index===7).length,4);
  assert.equal(serviceMapStops.find(stop=>stop.category==='cybersecurity').sceneZone,'production');
  assert.equal(serviceMapStops.find(stop=>stop.category==='engineering').sceneZone,'corporate');
});

test('every existing equipment view retains a category and both languages',()=>{
  for(let index=0;index<8;index++)assert.ok(categoryForService(index));
  for(const category of serviceCategories){
    for(const field of ['name','short','summary','zone'])assert.ok(category[field].length===2&&category[field].every(Boolean));
    assert.ok(category.capabilities.length>=3);
    assert.ok(category.capabilities.every(pair=>pair.length===2&&pair.every(Boolean)));
  }
  assert.equal(categoryById('consulting').note.length,2);
  assert.match(categoryById('consulting').note[1],/free of charge.*commercial team/);
  assert.match(categoryById('software').note[1],/client/);
});

test('only three additional indicators occupy existing corporate and production areas',()=>{
  assert.equal(additionalHotspots.length,3);
  assert.equal(new Set(additionalHotspots.map(h=>h.category)).size,3);
  for(const hotspot of additionalHotspots){assert.ok(categoryById(hotspot.category));assert.equal(hotspot.p.length,3);}
});
