const test=require('node:test');
const assert=require('node:assert/strict');
const view=require('../field-view.js');

const session={
  initialLayout:[{id:'a',label:'Yo',x:.2,y:.3,rotation:0,posture:'upright'}],
  layoutHistory:[{layout:[{id:'a',label:'Yo',x:.25,y:.35,rotation:20,posture:'upright'}]}],
  pieces:[{id:'a',label:'Yo',x:.4,y:.5,rotation:90,posture:'upright',placed:true}]
};

test('renderBoard exposes INICIO MOVIMIENTOS AHORA controls',()=>{
  const html=view.renderBoard(session,{selectedId:'a',compareMode:'now',showInitialGhost:true,editable:true});
  assert.match(html,/INICIO/);
  assert.match(html,/MOVIMIENTOS/);
  assert.match(html,/AHORA/);
});

test('renderBoard includes noninteractive ghost layer and rotation handle',()=>{
  const html=view.renderBoard(session,{selectedId:'a',compareMode:'now',showInitialGhost:true,editable:true});
  assert.match(html,/field-ghost-layer/);
  assert.match(html,/pointer-events:none/);
  assert.match(html,/rotation-handle/);
  assert.match(html,/data-piece-id="a"/);
});

test('renderBoard renders movement trajectories',()=>{
  const html=view.renderBoard(session,{selectedId:'a',compareMode:'movements',editable:false});
  assert.match(html,/trajectory-path/);
  assert.match(html,/polyline/);
});

test('renderBoard disables INICIO when initial layout is absent',()=>{
  const html=view.renderBoard({...session,initialLayout:null},{compareMode:'now'});
  assert.match(html,/data-mode="initial"[^>]*disabled/);
});
