const VERSION='las-constelaciones-3.0.0-2026-10-07';
const SHELL_CACHE=`constelaciones-shell-${VERSION}`;
const RUNTIME_CACHE=`constelaciones-runtime-${VERSION}`;
const RELATIVE_SHELL=[
  './','./index.html','./styles.css','./game-3d.css','./field-comparison.js','./field-interactions.js','./field-view.js','./app.js',
  './experience-master.js','./gemini-bridge.js','./exercise-engine.js','./topic-catalog.js','./representative-catalog.js','./constellation-factory.js',
  './manifest.webmanifest','./icons/icon.svg','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png',
  './assets/creatures/bosque-elemental.png','./assets/creatures/tierra-galactica.png','./assets/creatures/oceano-galactico.png','./assets/creatures/infierno-galactico.png'
];
const scopedUrl=relative=>new URL(relative,self.registration.scope).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(SHELL_CACHE);
  await Promise.allSettled(RELATIVE_SHELL.map(async relative=>{
    const url=scopedUrl(relative);
    const response=await fetch(new Request(url,{cache:'reload'}));
    if(response.ok)await cache.put(url,response.clone());
  }));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>(k.startsWith('constelaciones-')||k.startsWith('yslc-'))&&![SHELL_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
async function cachePut(request,response){if(response&&response.ok){try{(await caches.open(RUNTIME_CACHE)).put(request,response.clone())}catch{}}return response}
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.pathname.includes('/api/'))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(r=>cachePut(request,r)).catch(async()=>{
      return (await caches.match(scopedUrl('./index.html')))||(await caches.match(scopedUrl('./')));
    }));return;
  }
  if(url.origin===location.origin)event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(r=>cachePut(request,r))));
});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});
