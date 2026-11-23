// Deterministic choreography shared by rendering and the access-sequence checks.
export function accessCycle(time){
  const phase=((time%16)+16)%16;
  const state=phase<3?'approach':phase<5?'identify':phase<7?'opening':phase<11?'passing':phase<13?'closing':'waiting';
  const z=phase<3?7.5-4*phase/3:phase<7?3.5:phase<11?3.5-10.5*(phase-7)/4:-7;
  const open=phase<5?0:phase<7?(phase-5)/2:phase<11?1:phase<13?1-(phase-11)/2:0;
  return {phase,state,z,open,identified:phase>=4.5&&phase<11,visible:phase<13,moving:phase<3||(phase>=7&&phase<11),scanning:phase>=3&&phase<5};
}
