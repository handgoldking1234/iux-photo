// ===== 다른 앱과 주고받기: 홈 화면 설치(PWA) · 공유 받기 · 공유 보내기 =====
let deferredInstall=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e});
const IS_STANDALONE=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
(function(){
  if(ONLINE||(location.protocol!=='https:'&&location.hostname!=='localhost')||!('serviceWorker' in navigator))return;
  const add=(tag,a)=>{const el=document.createElement(tag);for(const k in a)el.setAttribute(k,a[k]);document.head.append(el)};
  add('link',{rel:'manifest',href:'manifest.webmanifest'});
  add('link',{rel:'apple-touch-icon',href:'icons/icon-192.png'});
  add('meta',{name:'theme-color',content:'#2b2b2b'});
  add('meta',{name:'apple-mobile-web-app-capable',content:'yes'});
  navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
function openIncoming(files){
  files=[...files].filter(Boolean);if(!files.length)return;
  const isSvg=f=>/svg/i.test(f.type)||/\.svg$/i.test(f.name);
  const svg=files.filter(isSvg),rest=files.filter(f=>!isSvg(f));
  if(svg.length){switchApp('illust');ilOpenFiles(svg)}
  if(rest.length){switchApp('photo');openFiles(rest)}
}
async function checkShareInbox(){
  if(!/[?&]share=1/.test(location.search))return;
  try{history.replaceState(null,'',location.pathname)}catch(e){}
  if(!window.caches)return;
  try{const c=await caches.open('iux-share');const files=[];
    for(const k of await c.keys()){const r=await c.match(k);if(!r)continue;const b=await r.blob();files.push(new File([b],decodeURIComponent(r.headers.get('x-name')||'shared'),{type:b.type}));await c.delete(k)}
    if(files.length){toast(`다른 앱에서 받은 파일 ${files.length}개를 엽니다`);openIncoming(files)}
  }catch(e){toast('공유받은 파일을 열지 못했습니다')}
}
if('launchQueue' in window){try{launchQueue.setConsumer(async p=>{if(!p.files||!p.files.length)return;openIncoming(await Promise.all(p.files.map(f=>f.getFile())))})}catch(e){}}
async function currentImageFile(){
  if(APP==='illust'){const d=IL.doc;if(!d)return null;const c=await ilRenderToCanvas(null,d.abs[d.ab],2);return new File([await canvasBlob(c,'image/png')],ilBase()+'.png',{type:'image/png'})}
  if(!doc)return null;const c=flattenCanvas(null);return new File([await canvasBlob(c,'image/png')],(doc.name||'image').replace(/\.[^.]+$/,'')+'.png',{type:'image/png'});
}
async function shareOut(){
  busy(true,'공유 준비 중…');let f;try{f=await currentImageFile()}finally{busy(false)}
  if(!f){toast('공유할 문서가 없습니다');return}
  if(navigator.canShare&&navigator.canShare({files:[f]})){
    try{await navigator.share({files:[f],title:f.name});return}
    catch(e){if(e.name==='AbortError')return;if(e.name!=='NotAllowedError'){toast('공유 실패: '+e.message);return}}
  }
  await saveBlob(f.name,f);toast('이 화면에서는 바로 공유가 안 돼서 PNG로 저장했어요. 저장된 파일을 다른 앱에서 불러오세요',4000);
}
function installApp(){
  if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>deferredInstall=null);return}
  const iOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const li=t=>h('li',{style:'margin:4px 0'},t);
  const box=h('div',{style:'display:grid;gap:12px;font-size:13px;line-height:1.55'},
    IS_STANDALONE?h('div',{style:'color:#7fd18b'},'✓ 이미 앱으로 설치되어 실행 중입니다.'):null,
    ONLINE?h('div',{class:'muted'},'지금은 Claude 미리보기 화면이라 설치가 안 됩니다. photo.iux.kr 을 휴대폰 브라우저로 열어 주세요.'):null,
    h('b',null,iOS?'아이폰 · 아이패드 (사파리)':'안드로이드 (크롬 · 삼성 인터넷)'),
    h('ol',{style:'margin:0;padding-left:20px'},...(iOS?[li('사파리 아래쪽의 공유 버튼(□↑)을 누릅니다'),li('"홈 화면에 추가"를 누릅니다'),li('홈 화면의 IUX Photo 아이콘으로 실행합니다')]:[li('브라우저 오른쪽 위 ⋮ 메뉴를 누릅니다'),li('"앱 설치" 또는 "홈 화면에 추가"를 누릅니다'),li('홈 화면의 IUX Photo 아이콘으로 실행합니다')])),
    h('b',null,'다른 앱에서 사진 보내기'),
    h('div',null,iOS?'아이폰은 다른 앱의 공유 목록에 웹앱이 나오지 않습니다. 사진을 "파일에 저장"한 뒤 IUX Photo에서 파일 > 열기로 불러오세요.':'설치 후에는 갤러리·카카오톡·파일 앱에서 사진(또는 PSD·SVG)을 공유할 때 목록에 IUX Photo가 나옵니다. 누르면 바로 열립니다.'),
    h('b',null,'다른 앱으로 보내기'),
    h('div',null,'파일 > 다른 앱으로 공유 (또는 아래 막대의 공유 버튼)를 누르면 현재 그림이 PNG로 만들어져 카카오톡·메시지·메일 등으로 바로 보낼 수 있습니다.'));
  dialog({title:'앱 설치 · 다른 앱과 함께 쓰기',width:440,content:b=>b.append(box),ok:'확인',cancel:null});
}
