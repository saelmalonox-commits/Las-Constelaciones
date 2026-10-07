(function(root,factory){
  const comparison=(typeof module==='object'&&module.exports)?require('./field-comparison.js'):(root?.ConstellationFieldComparison||{});
  const api=factory(comparison);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ConstellationFieldView=api;
})(typeof window!=='undefined'?window:globalThis,function(Comparison){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const hue=s=>{let h=0;for(const c of String(s||''))h=(h*31+c.charCodeAt(0))%360;return h};
  const point=p=>`${(Number(p.x)||0)*100},${(Number(p.y)||0)*100}`;
  function renderPiece(p,{selected=false,ghost=false,editable=true}={}){
    const r=Number(p.rotation)||0;
    return `<div class="piece-node posture-${esc(p.posture||'upright')} ${selected?'selected':''} ${ghost?'ghost-piece':''}" data-piece-id="${esc(p.id)}" aria-label="${esc(p.label)} · orientación ${Math.round(r)} grados" role="${editable&&!ghost?'button':'img'}" style="--piece-h:${hue(p.label)};left:${(Number(p.x)||0)*100}%;top:${(Number(p.y)||0)*100}%;transform:translate(-50%,-50%) rotate(${r}deg)"><div class="piece-disc"><span class="facing-mark">▲</span></div><div class="piece-name" style="transform:rotate(${-r}deg)">${esc(p.label)}</div>${selected&&editable&&!ghost?'<button class="rotation-handle" data-rotation-piece="'+esc(p.id)+'" aria-label="Girar '+esc(p.label)+' con el dedo" title="Arrastra para girar">↻</button>':''}</div>`;
  }
  function renderTrajectories(session){
    const current=(session?.pieces||[]).filter(p=>p.placed);
    const tracks=Comparison.buildTrajectories?.(session?.initialLayout,session?.layoutHistory,current)||[];
    if(!tracks.length)return '';
    return `<svg class="trajectory-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${tracks.filter(t=>t.points.length>1&&(t.moved||t.rotationChanged)).map(t=>`<polyline class="trajectory-path" points="${t.points.map(point).join(' ')}" vector-effect="non-scaling-stroke"/><circle class="trajectory-start" cx="${t.points[0].x*100}" cy="${t.points[0].y*100}" r="1.25"/><circle class="trajectory-end" cx="${t.points[t.points.length-1].x*100}" cy="${t.points[t.points.length-1].y*100}" r="1.45"/>`).join('')}</svg>`;
  }
  function renderControls(session,mode,showInitialGhost){
    const a=Comparison.comparisonAvailability?.(session)||{initial:false,movements:false,now:true};
    return `<div class="field-time-controls" role="group" aria-label="Comparar la constelación"><button data-mode="initial" class="field-time-btn ${mode==='initial'?'active':''}" onclick="MiCampo.setCompareMode('initial')" ${a.initial?'':'disabled'}>INICIO</button><button data-mode="movements" class="field-time-btn ${mode==='movements'?'active':''}" onclick="MiCampo.setCompareMode('movements')" ${a.movements?'':'disabled'}>MOVIMIENTOS</button><button data-mode="now" class="field-time-btn ${mode==='now'?'active':''}" onclick="MiCampo.setCompareMode('now')">AHORA</button>${a.initial&&mode==='now'?`<button class="field-ghost-toggle ${showInitialGhost?'active':''}" onclick="MiCampo.toggleInitialGhost()" aria-pressed="${showInitialGhost?'true':'false'}">${showInitialGhost?'Ocultar inicio':'Ver inicio'}</button>`:''}</div>`;
  }
  function renderBoard(session,opts={}){
    const mode=['initial','movements','now'].includes(opts.compareMode)?opts.compareMode:'now';
    const editable=opts.editable!==false&&mode==='now';
    const selectedId=opts.selectedId||null;
    const current=(session?.pieces||[]).filter(p=>p.placed||p.id===selectedId);
    const initial=Array.isArray(session?.initialLayout)?session.initialLayout:[];
    const initialMap=new Map(initial.map(x=>[x.id,x]));
    let main=current;
    if(mode==='initial'&&initial.length)main=initial.map(x=>({...x,label:x.label||current.find(p=>p.id===x.id)?.label||'Representante',placed:true}));
    const ghosts=mode==='now'&&opts.showInitialGhost&&initial.length?initial.map(x=>({...x,label:x.label||current.find(p=>p.id===x.id)?.label||'Representante'})):[];
    return `<div class="field-v3-shell">${opts.showControls===false?'':renderControls(session,mode,!!opts.showInitialGhost)}<div class="board-wrap"><div id="field-board" class="board field-v3-board compare-${mode}" data-editable="${editable?'1':'0'}" data-context="${esc(opts.context||'session')}"><span class="board-label">${mode==='initial'?'Configuración inicial':mode==='movements'?'Recorrido del campo':'Campo actual'}</span>${mode==='movements'?renderTrajectories(session):''}${opts.layerSvg||''}${ghosts.length?`<div class="field-ghost-layer" style="pointer-events:none" aria-hidden="true">${ghosts.map(p=>renderPiece(p,{ghost:true,editable:false})).join('')}</div>`:''}<div class="field-current-layer">${main.map(p=>renderPiece(p,{selected:p.id===selectedId&&mode==='now',editable})).join('')}</div></div></div>${mode==='movements'?'<p class="field-time-note">Las líneas muestran cómo cambió la posición desde el inicio hasta ahora. La orientación puede haber cambiado aunque la distancia sea pequeña.</p>':''}${mode==='initial'&&!initialMap.size?'<p class="field-time-note">Esta sesión no tiene una configuración inicial guardada.</p>':''}</div>`;
  }
  return {renderBoard,renderControls,renderTrajectories,renderPiece};
});
