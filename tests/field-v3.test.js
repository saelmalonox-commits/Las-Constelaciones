const test = require('node:test');
const assert = require('node:assert/strict');
const comparison = require('../field-comparison.js');
const interactions = require('../field-interactions.js');

test('normalizeAngle keeps degrees in 0..359', () => {
  assert.equal(comparison.normalizeAngle(361), 1);
  assert.equal(comparison.normalizeAngle(-15), 345);
  assert.equal(comparison.normalizeAngle(720), 0);
});

test('angleDifference returns shortest absolute distance', () => {
  assert.equal(comparison.angleDifference(350, 10), 20);
  assert.equal(comparison.angleDifference(10, 350), 20);
  assert.equal(comparison.angleDifference(20, 200), 180);
});

test('significantTransformChange ignores microgestures', () => {
  const before = {x:.5,y:.5,rotation:10,posture:'upright'};
  assert.equal(comparison.significantTransformChange(before,{...before,x:.505,y:.503,rotation:12}), false);
  assert.equal(comparison.significantTransformChange(before,{...before,x:.52}), true);
  assert.equal(comparison.significantTransformChange(before,{...before,rotation:14}), true);
  assert.equal(comparison.significantTransformChange(before,{...before,posture:'lying'}), true);
});

test('buildTrajectories joins initial, snapshots and current positions', () => {
  const initial=[{id:'a',label:'Yo',x:.1,y:.2,rotation:0}];
  const history=[{layout:[{id:'a',label:'Yo',x:.2,y:.3,rotation:20}]},{layout:[{id:'a',label:'Yo',x:.3,y:.4,rotation:45}]}];
  const current=[{id:'a',label:'Yo',x:.4,y:.5,rotation:90}];
  const tracks=comparison.buildTrajectories(initial,history,current);
  assert.equal(tracks.length,1);
  assert.equal(tracks[0].id,'a');
  assert.deepEqual(tracks[0].points.map(p=>[p.x,p.y]),[[.1,.2],[.2,.3],[.3,.4],[.4,.5]]);
  assert.equal(tracks[0].rotationChanged,true);
});

test('comparisonAvailability degrades cleanly when history is incomplete', () => {
  assert.deepEqual(comparison.comparisonAvailability({initialLayout:null,layoutHistory:[]}), {initial:false,movements:false,now:true});
  assert.deepEqual(comparison.comparisonAvailability({initialLayout:[{id:'a'}],layoutHistory:[]}), {initial:true,movements:true,now:true});
});

test('pointToField and clampFieldPoint keep a touch inside the board', () => {
  const p=interactions.pointToField(200,300,{left:100,top:100,width:200,height:400});
  assert.deepEqual(p,{x:.5,y:.5});
  assert.deepEqual(interactions.clampFieldPoint({x:-1,y:3}),{x:.05,y:.95});
});

test('angleFromCenter returns compass-like CSS rotation degrees', () => {
  assert.equal(Math.round(interactions.angleFromCenter(100,0,100,100)),0);
  assert.equal(Math.round(interactions.angleFromCenter(200,100,100,100)),90);
  assert.equal(Math.round(interactions.angleFromCenter(100,200,100,100)),180);
});

test('experienceModeFallback preserves valid modes and infers legacy digital sessions', () => {
  assert.equal(interactions.experienceModeFallback({experienceMode:'objects'}),'objects');
  assert.equal(interactions.experienceModeFallback({pieces:[{x:.2,y:.4}]}),'digital');
  assert.equal(interactions.experienceModeFallback({pieces:[]}), 'unspecified');
});
