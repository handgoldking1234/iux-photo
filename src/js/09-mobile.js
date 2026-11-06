// ===== 모바일 / 터치 지원 =====
// 두 손가락: 핀치 확대·축소 + 이동, 두 손가락 탭 = 실행 취소, 세 손가락 탭 = 다시 실행
const TOUCH_UI=matchMedia('(pointer:coarse)').matches||('ontouchstart' in window&&innerWidth<=1024);
function touchGesture(host,api){
  const pts=new Map();let g=null,h0=0,first=null,lastFirst=null;
  const mid=()=>{const a=[...pts.values()];const r=api.rect();return{x:(a[0].x+a[1].x)/2-r.left,y:(a[0].y+a[1].y)/2-r.top,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1}};
  host.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch'||!api.ok())return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){h0=api.hist();first=e.pointerId;lastFirst=e;return}
    e.stopPropagation();e.preventDefault();
    if(!g){
      api.cancel(lastFirst,h0);
      const m=mid(),v=api.get();
      g={t:performance.now(),n:pts.size,moved:0,m0:m,z:v.z,px:v.px,py:v.py};
    }else{g.n=Math.max(g.n,pts.size)}
    if(pts.size===2){const m=mid(),v=api.get();Object.assign(g,{m0:m,z:v.z,px:v.px,py:v.py})}
  },true);
  host.addEventListener('pointermove',e=>{
    if(e.pointerType!=='touch'||!pts.has(e.pointerId))return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(e.pointerId===first)lastFirst=e;
    if(!g)return;
    e.stopPropagation();e.preventDefault();
    if(pts.size<2)return;
    const m=mid();g.moved=Math.max(g.moved,Math.abs(m.d-g.m0.d),Math.hypot(m.x-g.m0.x,m.y-g.m0.y));
    const z=clamp(g.z*m.d/g.m0.d,api.min,64);
    const dx=(g.m0.x-g.px)/g.z,dy=(g.m0.y-g.py)/g.z; // 시작 시 두 손가락 중심의 문서 좌표
    api.set(z,m.x-dx*z,m.y-dy*z);
  },true);
  const up=e=>{
    if(e.pointerType!=='touch'||!pts.has(e.pointerId))return;
    pts.delete(e.pointerId);
    if(!g)return;
    e.stopPropagation();e.preventDefault();
    if(pts.size===1){const m=[...pts.values()][0];g.m0=null;g.single=m;}
    if(pts.size===0){
      if(e.type==='pointerup'&&g.moved<12&&performance.now()-g.t<320){g.n>=3?api.redo():api.undo()}
      g=null;first=null;
    }
  };
  host.addEventListener('pointerup',up,true);host.addEventListener('pointercancel',up,true);
  // 한 손가락만 남았을 때는 아무것도 하지 않음 (도구가 다시 시작되지 않도록 다음 터치까지 대기)
}
touchGesture($('#work'),{
  ok:()=>!!doc,min:1/64,
  rect:()=>view.getBoundingClientRect(),
  hist:()=>doc?doc.hIndex:0,
  get:()=>({z:doc.zoom,px:doc.panX,py:doc.panY}),
  set:(z,px,py)=>{doc.zoom=z;doc.panX=px;doc.panY=py;clampPan();requestDraw();updateZoomUI();schedulePanels()},
  cancel:(e,h0)=>{
    if(drag){try{endDrag(e)}catch(err){drag=null}}
    if(doc&&doc.hIndex>h0){restoreHist(h0);doc.history.length=h0+1}
  },
  undo:()=>{undo();toast('실행 취소',900)},redo:()=>{redo();toast('다시 실행',900)}
});
touchGesture($('#ilWork'),{
  ok:()=>!!IL.doc,min:.02,
  rect:()=>ilSvg.getBoundingClientRect(),
  hist:()=>IL.doc?IL.doc.hi:0,
  get:()=>({z:IL.doc.zoom,px:IL.doc.panX,py:IL.doc.panY}),
  set:(z,px,py)=>{const d=IL.doc;d.zoom=z;d.panX=px;d.panY=py;ilApplyView()},
  cancel:(e,h0)=>{
    if(ilDrag){try{ilEnd(e)}catch(err){ilDrag=null}}
    const d=IL.doc;if(d&&d.hi>h0){ilRestore(h0);d.hist.length=h0+1}
  },
  undo:()=>{ilUndo();toast('실행 취소',900)},redo:()=>{ilRedo();toast('다시 실행',900)}
});

// 터치용 빠른 막대: 실행 취소 / 다시 실행 / 화면 맞춤 / 100% / 패널
(function(){
  const svg=p=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const FIT='<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="1.6"/>';
  const ONE='<text x="12" y="16" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" font-family="sans-serif">1:1</text>';
  const isIl=()=>typeof APP!=='undefined'&&APP==='illust';
  const B=(t,html,fn,cls)=>h('button',{class:'mb'+(cls?' '+cls:''),title:t,'aria-label':t,html,onclick:e=>{e.stopPropagation();closeMenus();fn()}});
  const bar=h('div',{id:'mobBar'},
    B('실행 취소 (두 손가락 탭)',icon('undo'),()=>isIl()?ilUndo():undo()),
    B('다시 실행 (세 손가락 탭)',icon('undo'),()=>isIl()?ilRedo():redo(),'flip'),
    B('화면에 맞추기',svg(FIT),()=>isIl()?ilFit():fitView()),
    B('100%',svg(ONE),()=>{if(isIl()){const d=IL.doc;if(d)ilZoomAt(1,ilVW/2,ilVH/2)}else if(doc)setZoom(1,VW/2,VH/2)}),
    B('다른 앱으로 공유',svg('<path d="M12 15V4M8 8l4-4 4 4M6 11H5v9h14v-9h-1" fill="none" stroke="currentColor" stroke-width="1.6"/>'),()=>shareOut()),
    B('패널 열기/닫기',icon('panel'),()=>document.body.classList.toggle('showPanels'),'pt'));
  document.body.append(bar);
  if(TOUCH_UI)document.body.classList.add('touchUI');
  // 패널이 열린 상태에서 작업 화면을 누르면 패널 닫기
  for(const w of ['#work','#ilWork'])$(w).addEventListener('pointerdown',()=>{if(innerWidth<=900)document.body.classList.remove('showPanels')},true);
  // 화면 크기 변경 / 가상 키보드 / 회전
  let rt;const re=()=>{clearTimeout(rt);rt=setTimeout(()=>{document.documentElement.style.setProperty('--vh',(window.visualViewport?visualViewport.height:innerHeight)+'px');try{if(isIl()){ilResize();ilApplyView()}else if(doc){resizeView();clampPan();requestDraw()}}catch(e){}},60)};
  addEventListener('orientationchange',re);if(window.visualViewport)visualViewport.addEventListener('resize',re);re();
  // iOS 사파리 제스처 확대 막기 (앱 내부 핀치를 사용)
  document.addEventListener('gesturestart',e=>e.preventDefault());
})();
