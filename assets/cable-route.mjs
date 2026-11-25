// Straight containment runs with controlled bends instead of spline overshoot.
export function roundedCableCurve(THREE,points,radius=.45){
  const vertices=points.map(point=>new THREE.Vector3(...point));
  const curve=new THREE.CurvePath();let start=vertices[0];
  for(let i=1;i<vertices.length-1;i++){
    const corner=vertices[i],previous=vertices[i-1],next=vertices[i+1];
    const bend=Math.min(radius,corner.distanceTo(previous)*.4,corner.distanceTo(next)*.4);
    const entry=corner.clone().addScaledVector(previous.clone().sub(corner).normalize(),bend);
    const exit=corner.clone().addScaledVector(next.clone().sub(corner).normalize(),bend);
    if(start.distanceTo(entry)>1e-6)curve.add(new THREE.LineCurve3(start,entry));
    curve.add(new THREE.QuadraticBezierCurve3(entry,corner.clone(),exit));start=exit;
  }
  if(start.distanceTo(vertices.at(-1))>1e-6)curve.add(new THREE.LineCurve3(start,vertices.at(-1)));
  return curve;
}
