/* PokéArchiv v5: App-Shell offline, kontrollierte externe Laufzeit-Caches */
const VERSION='v5fix1-20261105';
const SHELL='pokearchiv-shell-'+VERSION;
const CATALOG='pokearchiv-catalog-'+VERSION;
const IMAGES='pokearchiv-images-'+VERSION;
const SHELL_ASSETS=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const CACHE_PREFIX='pokearchiv-';
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(SHELL_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&![SHELL,CATALOG,IMAGES].includes(key)).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
async function cacheWithLimit(name,request,response,limit){
  if(!response||(response.type!=='opaque'&&!response.ok))return;
  try{
    const cache=await caches.open(name);
    await cache.put(request,response.clone());
    const keys=await cache.keys();
    if(keys.length>limit)await Promise.all(keys.slice(0,keys.length-limit).map(key=>cache.delete(key)));
  }catch(_){/* Speicher voll/gesperrt: App bleibt nutzbar */}
}
async function shellResponse(request){
  const cache=await caches.open(SHELL);
  const cached=await cache.match(request,{ignoreSearch:true});
  if(cached)return cached;
  try{return await fetch(request)}catch(_){
    if(request.mode==='navigate')return await cache.match('./index.html');
    return Response.error();
  }
}
async function cachedExternal(request,cacheName,limit){
  const cache=await caches.open(cacheName);
  try{
    const response=await fetch(request);
    if(response.ok||response.type==='opaque'){
      await cacheWithLimit(cacheName,request,response,limit);
      return response;
    }
    return (await cache.match(request))||response;
  }catch(_){
    return (await cache.match(request))||Response.error();
  }
}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin===self.location.origin){
   // Shell ist nach Installation vollständig lokal und steht vor jeder Netzwerkanfrage bereit.
   event.respondWith(shellResponse(request));return;
 }
 if(url.hostname==='api.tcgdex.net'&&url.pathname.startsWith('/v2/')){
   event.respondWith(cachedExternal(request,CATALOG,140));return;
 }
 // Einmal besuchte Kartenbilder im begrenzten LRU-artigen Cache vorhalten.
 if((url.hostname.endsWith('tcgdex.net')||url.hostname==='assets.tcgdex.net')&&/\.(?:png|jpe?g|webp)(?:$|\?)/i.test(url.pathname+url.search)){
   event.respondWith(cachedExternal(request,IMAGES,280));return;
 }
});
self.addEventListener('message',event=>{
 if(event.data?.type==='STATUS'){
   event.waitUntil((async()=>{
     const cache=await caches.open(SHELL);
     const shellReady=(await Promise.all(SHELL_ASSETS.map(path=>cache.match(path)))).every(Boolean);
     const catalog=await caches.open(CATALOG),images=await caches.open(IMAGES);
     const result={type:'STATUS_RESULT',shellReady,catalogCount:(await catalog.keys()).length,imageCount:(await images.keys()).length};
     event.source?.postMessage(result);
   })());
 }
});
