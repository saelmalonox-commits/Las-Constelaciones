const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('index loads V3 field modules before app.js',()=>{
  const html=read('index.html');
  const order=['field-comparison.js','field-interactions.js','field-view.js','app.js'].map(x=>html.indexOf(x));
  assert.ok(order.every(x=>x>=0));
  assert.deepEqual([...order].sort((a,b)=>a-b),order);
});

test('visible product branding is Las Constelaciones 3.0.0',()=>{
  const app=read('app.js'),html=read('index.html');
  assert.match(app,/const APP_NAME = 'Las Constelaciones'/);
  assert.match(app,/Las Constelaciones 3\.0\.0/);
  assert.match(html,/<title>Las Constelaciones<\/title>/);
});

test('app exposes compare actions and keeps fine rotation buttons',()=>{
  const app=read('app.js');
  assert.match(app,/setCompareMode\(mode\)/);
  assert.match(app,/toggleInitialGhost\(\)/);
  assert.match(app,/↺ 15°/);
  assert.match(app,/15° ↻/);
});

test('V3 home is centered on ABRIR EL CAMPO',()=>{
  const app=read('app.js');
  assert.match(app,/ABRIR EL CAMPO/);
  assert.match(app,/LAS CONSTELACIONES/);
});

test('new constellation flow offers four experience modes',()=>{
  const app=read('app.js');
  for(const value of ['digital','people','objects','visualization']) assert.match(app,new RegExp(`\\b${value}\\b`));
  assert.match(app,/setExperienceMode\(mode\)/);
  assert.match(app,/Cómo quieres hacerlo/);
});

test('doctrinal engine defines six differentiated lenses',()=>{
  const app=read('app.js');
  for(const key of ['hellinger-classic','hellinger-spiritual','systemic','structural','energetic-spiritual','shamanic-ancestral']) assert.match(app,new RegExp(key));
  assert.match(app,/doctrinalLens/);
});

test('sessions include V3 spiritual and integration fields',()=>{
  const app=read('app.js');
  for(const key of ['fieldOpening','representativePerceptions','ritualResources','systemicPhrases','closureType','integrationEntries']) assert.match(app,new RegExp(key));
});

test('migration preserves and normalizes V3 experience metadata',()=>{
  const app=read('app.js');
  assert.match(app,/experienceModeFallback/);
  for(const key of ['representativePerceptions','ritualResources','systemicPhrases','integrationEntries']) assert.match(app,new RegExp(key));
  assert.match(app,/closureType/);
});

test('systemic phrases are offered as optional felt experiments',()=>{
  const app=read('app.js');
  for(const label of ['Me mueve','No siento nada','No es para mí','Quiero cambiarla','Prefiero silencio']) assert.match(app,new RegExp(label));
  assert.match(app,/systemicPhrases/);
});

test('closing can end in four explicit closure states',()=>{
  const app=read('app.js');
  for(const key of ['resolved','enoughForToday','open','interrupted']) assert.match(app,new RegExp(key));
  assert.match(app,/setClosureType/);
});

test('digital and visualization modes bypass physical placement instructions',()=>{
  const app=read('app.js');
  assert.match(app,/experienceMode===['"]digital['"]/);
  assert.match(app,/experienceMode===['"]visualization['"]/);
  assert.match(app,/placementMode=['"]digital['"]/);
});

test('PWA manifest is V3 branded and safe under a GitHub Pages subpath',()=>{
  const manifest=JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.name,'Las Constelaciones');
  assert.equal(manifest.short_name,'Constelaciones');
  assert.equal(manifest.start_url,'./');
  assert.equal(manifest.scope,'./');
  assert.ok(manifest.icons.every(x=>x.src.startsWith('./')));
});

test('service worker caches V3 field modules with relative-scope routing',()=>{
  const sw=read('sw.js');
  for(const f of ['field-comparison.js','field-interactions.js','field-view.js']) assert.match(sw,new RegExp(f));
  assert.match(sw,/las-constelaciones-3\.0\.0/);
  assert.match(sw,/registration\.scope/);
});

test('V3 tactile field and portal styles exist',()=>{
  const css=read('styles.css');
  for(const cls of ['v3-field-portal','v3-experience-grid','field-time-controls','rotation-handle','ghost-piece','trajectory-path']) assert.match(css,new RegExp(`\\.${cls}`));
});

test('spiritual lenses expose differentiated opening resources without forcing them',()=>{
  const app=read('app.js');
  for(const term of ['Madre Tierra','Ancestros','Oración','Tambor','Movimiento emergente','Órdenes del Amor']) assert.match(app,new RegExp(term));
  assert.match(app,/toggleRitualResource/);
});

test('representative perception can be recorded from the live field',()=>{
  const app=read('app.js');
  assert.match(app,/Registrar percepción/);
  assert.match(app,/openPerception/);
  assert.match(app,/savePerception/);
  assert.match(app,/representativePerceptions\.push/);
});
