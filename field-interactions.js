(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ConstellationFieldInteractions=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const VALID_MODES=new Set(['digital','people','objects','visualization','unspecified']);
  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function pointToField(clientX,clientY,rect){
    if(!rect||!rect.width||!rect.height)return {x:.5,y:.5};
    return {x:(clientX-rect.left)/rect.width,y:(clientY-rect.top)/rect.height};
  }
  function clampFieldPoint(point,margin=.05){return {x:clamp(Number(point?.x)||0,margin,1-margin),y:clamp(Number(point?.y)||0,margin,1-margin)}}
  function angleFromCenter(clientX,clientY,centerX,centerY){return ((Math.atan2(clientY-centerY,clientX-centerX)*180/Math.PI)+90+360)%360}
  function experienceModeFallback(session){
    const mode=String(session?.experienceMode||'');
    if(VALID_MODES.has(mode))return mode;
    if(Array.isArray(session?.pieces)&&session.pieces.some(p=>Number.isFinite(Number(p?.x))&&Number.isFinite(Number(p?.y))))return 'digital';
    return 'unspecified';
  }
  function bindPointerGesture(target,{onStart,onMove,onEnd,onCancel}={}){
    if(!target?.addEventListener)return ()=>{};
    const down=e=>{
      if(e.button!=null&&e.button!==0)return;
      onStart?.(e);
      target.setPointerCapture?.(e.pointerId);
      const move=ev=>{if(ev.pointerId!==e.pointerId)return;onMove?.(ev)};
      const finish=(ev,cancelled=false)=>{if(ev.pointerId!==e.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);target.releasePointerCapture?.(e.pointerId);(cancelled?onCancel:onEnd)?.(ev)};
      const up=ev=>finish(ev,false),cancel=ev=>finish(ev,true);
      window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up,{passive:false});window.addEventListener('pointercancel',cancel,{passive:false});
    };
    target.addEventListener('pointerdown',down,{passive:false});
    return ()=>target.removeEventListener('pointerdown',down);
  }
  return {pointToField,clampFieldPoint,angleFromCenter,experienceModeFallback,bindPointerGesture};
});
