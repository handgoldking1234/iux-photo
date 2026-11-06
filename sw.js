// IUX Photo 서비스 워커: 오프라인 실행 + 다른 앱에서 공유받기
const CACHE='iux-app-v2',SHARE='iux-share';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./manifest.webmanifest','./icons/icon-192.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==SHARE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method==='POST'&&url.origin===location.origin&&url.pathname==='/share'){
    e.respondWith((async()=>{
      try{const fd=await req.formData();const c=await caches.open(SHARE);let i=0;
        for(const f of fd.getAll('file')){if(!f||typeof f==='string')continue;
          await c.put(new Request('/__share/'+Date.now()+'-'+(i++)),new Response(f,{headers:{'content-type':f.type||'application/octet-stream','x-name':encodeURIComponent(f.name||'shared')}}))}
      }catch(err){}
      return Response.redirect('/?share=1',303);
    })());
    return;
  }
  if(req.method!=='GET'||url.origin!==location.origin)return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./',cp));return r}).catch(()=>caches.match('./')));
    return;
  }
  e.respondWith(caches.match(req).then(m=>m||fetch(req)));
});
