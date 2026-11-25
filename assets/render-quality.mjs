// Keep equipment readable after camera motion; never leave a detail view at 1x.
export function renderRatio({pixelRatio=1,lowPower=false,focused=false,moving=false}={}){
  if(lowPower)return focused&&!moving?2:1.5;
  if(moving)return Math.min(Math.max(pixelRatio,1.25),1.5);
  return Math.min(Math.max(pixelRatio,focused?2:1.75),focused?2.25:2);
}
