const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
function loadBrowserScript(file,window={}){
  const code=fs.readFileSync(path.join(root,file),'utf8');
  const context={window,console,setTimeout,clearTimeout};
  vm.createContext(context);
  vm.runInContext(code,context,{filename:file});
  return window;
}

test('V3 preserves the complete practice library',()=>{
  const window=loadBrowserScript('exercise-engine.js',{});
  assert.equal(window.CampoExercises.all().length,98);
});

test('V3 preserves the complete topic catalog',()=>{
  const window=loadBrowserScript('topic-catalog.js',{});
  assert.equal(window.CampoTopicCatalog.list().length,106);
});

test('V3 preserves the complete representative catalog',()=>{
  const window=loadBrowserScript('representative-catalog.js',{});
  assert.equal(window.CampoRepresentativeCatalog.all.length,573);
});
