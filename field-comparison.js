(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ConstellationFieldComparison=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
  function normalizeAngle(value){const n=Number(value)||0;return ((n%360)+360)%360}
  function angleDifference(a,b){const d=Math.abs(normalizeAngle(a)-normalizeAngle(b));return Math.min(d,360-d)}
  function significantTransformChange(before,after,{positionThreshold=.01,rotationThreshold=3}={}){
    if(!before||!after)return false;
    const moved=Math.hypot((Number(after.x)||0)-(Number(before.x)||0),(Number(after.y)||0)-(Number(before.y)||0));
    return moved>=positionThreshold||angleDifference(before.rotation,after.rotation)>=rotationThreshold||(before.posture||'upright')!==(after.posture||'upright');
  }
  function normalizePoint(piece){return {id:String(piece.id),label:String(piece.label||''),x:clamp01(piece.x),y:clamp01(piece.y),rotation:normalizeAngle(piece.rotation),posture:piece.posture||'upright'}}
  function buildTrajectories(initialLayout,layoutHistory,currentLayout){
    const initial=Array.isArray(initialLayout)?initialLayout:[];
    const current=Array.isArray(currentLayout)?currentLayout:[];
    const ids=new Set([...initial,...current].map(x=>x&&x.id).filter(Boolean));
    const history=(Array.isArray(layoutHistory)?layoutHistory:[]).filter(x=>Array.isArray(x?.layout));
    const tracks=[];
    for(const id of ids){
      const seq=[];
      const push=p=>{if(!p||p.id!==id)return;const q=normalizePoint(p),last=seq[seq.length-1];if(!last||Math.hypot(q.x-last.x,q.y-last.y)>.0005||angleDifference(q.rotation,last.rotation)>.5||q.posture!==last.posture)seq.push(q)};
      push(initial.find(x=>x?.id===id));
      for(const snap of history)push(snap.layout.find(x=>x?.id===id));
      push(current.find(x=>x?.id===id));
      if(!seq.length)continue;
      const first=seq[0],last=seq[seq.length-1];
      tracks.push({id,label:last.label||first.label,points:seq,rotationChanged:angleDifference(first.rotation,last.rotation)>=3,moved:Math.hypot(last.x-first.x,last.y-first.y)>=.01});
    }
    return tracks;
  }
  function comparisonAvailability(session){
    const initial=Array.isArray(session?.initialLayout)&&session.initialLayout.length>0;
    const history=Array.isArray(session?.layoutHistory)&&session.layoutHistory.some(x=>Array.isArray(x?.layout)&&x.layout.length);
    const movements=Array.isArray(session?.movements)&&session.movements.length>0;
    return {initial,movements:initial||history||movements,now:true};
  }
  function diffLayout(beforeLayout,afterLayout){
    const before=new Map((Array.isArray(beforeLayout)?beforeLayout:[]).map(x=>[x.id,x]));
    return (Array.isArray(afterLayout)?afterLayout:[]).map(after=>({before:before.get(after.id)||null,after})).filter(x=>x.before&&significantTransformChange(x.before,x.after));
  }
  return {normalizeAngle,angleDifference,significantTransformChange,buildTrajectories,comparisonAvailability,diffLayout};
});
