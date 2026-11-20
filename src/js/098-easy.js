// ===== 간편 모드 (휴대폰용) — 컷아웃 · 배경 바꾸기 · 사진 합성 · 자르기·회전 · 필터 · 보정 =====
// 휴대폰에서는 포토샵식 화면 대신, 아래쪽 큰 도구 막대와 전체 화면 편집기를 씀. '전문가 모드'로 언제든 원래 화면.
const EZ={on:false};
const ezSvg=p=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const EZI={
  cut:ezSvg('<circle cx="12" cy="6.5" r="3"/><path d="M6 21v-3.5a6 6 0 0 1 12 0V21"/><path d="M3 3h3M3 3v3M21 3h-3M21 3v3M3 21v-3M21 21v-3" stroke-dasharray="2 2"/>'),
  bg:ezSvg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/><circle cx="16" cy="8.5" r="1.6"/>'),
  add:ezSvg('<rect x="3" y="7" width="13" height="13" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v11"/><path d="M9.5 11v5M7 13.5h5"/>'),
  crop:ezSvg('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'),
  look:ezSvg('<circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/>'),
  adj:ezSvg('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
  text:ezSvg('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
  brush:ezSvg('<path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L12 14.8 9.2 12z"/><path d="M8 13.5c-2 0-3.5 1.6-3.5 3.6 0 1.3-.8 2.3-2 2.9 4.5 1.3 8-.6 8-4z"/>'),
  erase:ezSvg('<path d="M7 21h13"/><path d="M5.5 15.5 14.6 6.4a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 20H8z"/><path d="M9.5 11.5l5 5"/>'),
  move:ezSvg('<path d="M12 2v20M2 12h20M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3M19 9l3 3-3 3"/>'),
  layers:ezSvg('<path d="M12 3 2 8l10 5 10-5z"/><path d="M2 13l10 5 10-5"/>'),
  pro:ezSvg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/>'),
  menu:ezSvg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  undo:ezSvg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  redo:ezSvg('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>'),
  x:ezSvg('<path d="M18 6 6 18M6 6l12 12"/>'),
  ok:ezSvg('<path d="M20 6 9 17l-5-5"/>'),
  eye:ezSvg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  inv:ezSvg('<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  trash:ezSvg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  lasso:ezSvg('<path d="M7 18c-2.5-1-4-3-4-5.5C3 8 7 5 12 5s9 3 9 7.5S17 20 12 20c-1.5 0-3-.3-4.2-.8"/><path d="M7 18c0 2-1 3-2.5 3"/>'),
  wand:ezSvg('<path d="m15 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1zM4 20l10-10"/><path d="M19 13l.7 1.3L21 15l-1.3.7L19 17l-.7-1.3L17 15l1.3-.7z"/>'),
  rot:ezSvg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  fh:ezSvg('<path d="M12 3v18"/><path d="M8 7 3 12l5 5zM16 7l5 5-5 5z"/>'),
  fv:ezSvg('<path d="M3 12h18"/><path d="M7 8l5-5 5 5zM7 16l5 5 5-5z"/>'),
  reset:ezSvg('<path d="M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.7 2.8L3 8"/><path d="M3 3v5h5"/>'),
  save:ezSvg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
  photo:ezSvg('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>'),
  none:ezSvg('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 20 20 4"/>'),
  orig:ezSvg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/>'),
  blur:ezSvg('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.5" stroke-dasharray="2 2.5"/><circle cx="12" cy="12" r="10" stroke-dasharray="1.5 3"/>'),
};
const ezB=(cls,ic,label,fn,title)=>h('button',{class:cls,title:title||label||'', 'aria-label':title||label||'',onclick:e=>{e.stopPropagation();fn(e)}},h('span',{class:'ic',html:ic}),label?h('span',{class:'lb'},label):null);
function ezNeedDoc(){if(doc)return true;toast('먼저 사진을 불러오세요');pickFiles(false);return false}

// ---------- 간편 모드 화면 ----------
const ezTop=h('div',{id:'ezTop'});
const ezTitle=h('div',{class:'ezTitle'},'IUX Photo');
ezTop.append(ezB('ezI',EZI.menu,'',()=>addSheet(),'메뉴'),ezTitle,
  ezB('ezI',EZI.undo,'',()=>{undo()},'실행 취소'),ezB('ezI',EZI.redo,'',()=>{redo()},'다시 실행'),
  h('button',{class:'ezSave',onclick:e=>{e.stopPropagation();ezSaveSheet()}},'저장'));
const ezBar=h('div',{id:'ezBar'});
const EZ_ITEMS=[
  ['cut','컷아웃',()=>ezNeedDoc()&&ezCutout()],
  ['bg','배경 바꾸기',()=>ezNeedDoc()&&ezBgSheet()],
  ['add','사진 합성',()=>ezAddPhoto()],
  ['crop','자르기·회전',()=>ezNeedDoc()&&ezCrop()],
  ['look','필터',()=>ezNeedDoc()&&ezLooks('look')],
  ['adj','보정',()=>ezNeedDoc()&&ezLooks('adj')],
  ['text','문자',()=>ezNeedDoc()&&ezPickTool('type','글자를 넣을 곳을 누르세요')],
  ['brush','브러시',()=>ezNeedDoc()&&ezPickTool('brush','손가락으로 그리세요. 위 막대에서 크기·색을 바꿉니다')],
  ['erase','지우개',()=>ezNeedDoc()&&ezPickTool('eraser','지울 곳을 문지르세요')],
  ['move','크기·위치',()=>ezNeedDoc()&&ezMoveTool()],
  ['layers','레이어',()=>{document.body.classList.toggle('showPanels')}],
  ['pro','포토샵 모드',()=>ezSet(false,true)],
];
for(const [k,t,fn] of EZ_ITEMS)ezBar.append(ezB('ezT',EZI[k],t,()=>{closeMenus();ezToolDone();fn()}));
document.body.append(ezTop,ezBar);
// 포토샵 화면에서 간편 모드로 바꾸는 버튼 (위 메뉴 막대 오른쪽 + 휴대폰 아래 막대)
(function(){
  const go=e=>{e.stopPropagation();closeMenus();ezSet(true,true)};
  const mb=$('#menubar');if(mb)mb.append(h('button',{class:'ezSwitchBtn',id:'ezSwitchBtn',title:'간편 모드: 컷아웃·배경 바꾸기·필터 등 쉬운 화면','aria-label':'간편 모드로 바꾸기',onclick:go},h('span',{class:'ic',html:EZI.cut}),h('span',null,'간편 모드')));
  const bar=$('#mobBar');if(bar)bar.append(h('button',{class:'mb ezBack',title:'간편 모드','aria-label':'간편 모드',onclick:go},'간편'));
})();

function ezPickTool(id,msg){if(!TOOLS[id]){toast('이 도구를 찾지 못했습니다');return}setTool(id);document.body.classList.add('ezOpt');ezRelayout();ezDoneBtn(true);if(msg)toast(msg,2200)}
function ezMoveTool(){if(!doc.active){toast('레이어를 먼저 고르세요');return}if(doc.active.isBg&&flat().filter(l=>l.type!=='group').length===1){toast('배경 하나뿐이라 옮길 것이 없습니다. "사진 합성"으로 사진을 더해 보세요',3000);return}setTool('move');try{startTransform()}catch(e){}ezDoneBtn(true);toast('모서리를 끌어 크기, 위의 둥근 손잡이로 회전합니다',2600)}
// 도구를 쓰는 동안 위 막대 오른쪽에 '완료' 버튼
const ezDone=h('button',{class:'ezDone',hidden:true,onclick:e=>{e.stopPropagation();ezToolDone()}},'완료');ezTop.append(ezDone);
function ezDoneBtn(on){ezDone.hidden=!on}
function ezToolDone(){if(typeof transient!=='undefined'&&transient&&transient.kind==='transform'&&transient.commit)transient.commit();if(document.body.classList.contains('ezOpt')){document.body.classList.remove('ezOpt');ezRelayout()}ezDone.hidden=true;if(doc&&TOOLS.move&&tool&&tool.id!=='move')setTool('move')}
function ezRelayout(){requestAnimationFrame(()=>{try{resizeView();if(doc){clampPan();requestDraw()}}catch(e){}})}
function ezSet(on,user){
  const want=on&&APP==='photo';
  if(user)try{localStorage.setItem('iuxEasy',on?'1':'0')}catch(e){}
  EZ.on=on;document.body.classList.toggle('easy',want);document.body.classList.remove('ezOpt','showPanels');ezDone.hidden=true;
  ezRelayout();setTimeout(()=>{try{if(doc)fitView()}catch(e){}},80);
  if(user)toast(on?'간편 모드 — 맨 끝 "포토샵 모드"로 돌아갑니다':'포토샵 모드 — "간편 모드" 버튼으로 다시 바꿀 수 있습니다',2200);
}
function ezTitleUpdate(){ezTitle.textContent=doc?(doc.name||'제목 없음'):'IUX Photo'}
(function(){
  let pref=null;try{pref=localStorage.getItem('iuxEasy')}catch(e){}
  // 기본은 포토샵 화면. 간편 모드는 버튼으로 켤 때만 (주소 끝에 ?easy 를 붙여도 켜짐)
  const q=/[?&#]easy\b/.test(location.search+location.hash);
  const start=q||pref==='1';
  ezSet(start,false);
  const _sw=switchApp;switchApp=function(a){_sw(a);const sb=$('#ezSwitchBtn');if(sb)sb.hidden=APP!=='photo';document.body.classList.toggle('easy',EZ.on&&APP==='photo');ezRelayout()};
  const _ra=refreshAll;refreshAll=function(){_ra.apply(this,arguments);ezTitleUpdate()};
  setInterval(ezTitleUpdate,1500);
})();

// ---------- 저장 시트 ----------
function ezSaveSheet(){
  if(!doc){toast('저장할 사진이 없습니다');return}
  ezSheet('저장 · 공유',[
    [EZI.photo,'사진으로 저장 (JPG)',()=>saveImage('jpg',.92)],
    [EZI.none,'투명 배경 (PNG)',()=>saveImage('png')],
    [EZI.layers,'레이어 그대로 (PSD)',()=>savePsd()],
    [EZI.add,'다른 앱으로 보내기',()=>shareOut()],
  ]);
}
function ezSheet(title,items,extra){
  const ov=h('div',{class:'sheetBg',onclick:e=>{if(e.target===ov)ov.remove()}});
  const sh=h('div',{class:'sheet ezSheet'},h('div',{class:'grab'}),h('div',{class:'ezSheetT'},title));
  const grid=h('div',{class:'sheetGrid'});
  for(const [ic,t,fn] of items)grid.append(h('button',{class:'sheetBtn',onclick:()=>{ov.remove();fn()}},h('span',{class:'si',html:ic}),h('span',null,t)));
  sh.append(grid);if(extra)sh.append(extra(()=>ov.remove()));
  ov.append(sh);document.body.append(ov);return ov;
}

// ---------- 공통: 전체 화면 편집기 틀 ----------
function ezStudio(title,{onOk,onCancel}){
  const st={};
  const root=h('div',{class:'ezStudio',role:'dialog','aria-label':title});
  const head=h('div',{class:'ezsHead'});
  st.titleEl=h('div',{class:'ezsTitle'},title);
  st.headR=h('div',{class:'ezsHR'});
  head.append(ezB('ezI',EZI.x,'',()=>{close();onCancel&&onCancel()},'취소'),st.titleEl,st.headR,ezB('ezI ezOk',EZI.ok,'',async()=>{if(await onOk()!==false)close()},'적용'));
  const stage=h('div',{class:'ezsStage'});const cv=h('canvas');stage.append(cv);
  const foot=h('div',{class:'ezsFoot'});
  root.append(head,stage,foot);document.body.append(root);
  function close(){root.remove();removeEventListener('resize',st.onResize);st.closed=true}
  st.root=root;st.stage=stage;st.cv=cv;st.foot=foot;st.close=close;
  st.size=()=>{const r=stage.getBoundingClientRect();const d=window.devicePixelRatio||1;cv.width=Math.max(1,Math.round(r.width*d));cv.height=Math.max(1,Math.round(r.height*d));cv.style.width=r.width+'px';cv.style.height=r.height+'px';st.W=r.width;st.H=r.height;st.dpr=d};
  st.onResize=()=>{st.size();st.redraw&&st.redraw()};addEventListener('resize',st.onResize);
  st.size();return st;
}
function ezChecker(g,x,y,w,hh){g.save();g.beginPath();g.rect(x,y,w,hh);g.clip();g.fillStyle='#fff';g.fillRect(x,y,w,hh);g.fillStyle='#d6d6d6';const s=10;for(let yy=Math.floor(y/s)*s;yy<y+hh;yy+=s)for(let xx=Math.floor(x/s)*s;xx<x+w;xx+=s)if(((xx/s)+(yy/s))&1)g.fillRect(xx,yy,s,s);g.restore()}
function ezScaled(c,max){const s=Math.min(1,max/Math.max(c.width,c.height));if(s>=1)return{c,s:1};const o=mkCanvas(Math.max(1,Math.round(c.width*s)),Math.max(1,Math.round(c.height*s)));const g=cx(o);g.imageSmoothingQuality='high';g.drawImage(c,0,0,o.width,o.height);return{c:o,s:o.width/c.width}}
function ezSlider({label,min,max,step=1,value,fmt,onInput,onReset}){
  const v=h('span',{class:'ezVal'});const r=h('input',{type:'range',min,max,step,value,'aria-label':label});
  const show=()=>v.textContent=fmt?fmt(+r.value):r.value;
  r.addEventListener('input',()=>{show();onInput(+r.value)});
  r.addEventListener('dblclick',()=>{r.value=onReset!=null?onReset:0;show();onInput(+r.value)});
  show();
  const row=h('div',{class:'ezSl'},label?h('span',{class:'ezSlL'},label):null,r,v);row.input=r;row.set=x=>{r.value=x;show()};return row;
}

// ---------- 컷아웃 ----------
function ezCutout(){
  const L=doc.active;let src,ox=0,oy=0,srcLayer=null;
  if(L&&(L.type==='layer')&&L.canvas&&L.visible){srcLayer=L;src=maskedCanvas(L);ox=L.x;oy=L.y}else src=flattenCanvas();
  const SW=src.width,SH=src.height;const sc=Math.min(1,Math.sqrt(3.2e6/(SW*SH)));
  const W=Math.max(1,Math.round(SW*sc)),H=Math.max(1,Math.round(SH*sc));
  const wc=mkCanvas(W,H);{const g=cx(wc);g.imageSmoothingQuality='high';g.drawImage(src,0,0,W,H)}
  const px=getData(wc).data;
  let mask=new Uint8Array(W*H);
  const ov=mkCanvas(W,H);const og=cx(ov);const od=og.createImageData(W,H);
  for(let i=0;i<W*H;i++){od.data[i*4]=255;od.data[i*4+1]=40;od.data[i*4+2]=90}
  const undoS=[],redoS=[];
  const S={tool:'brush',smart:true,size:3,tol:32,preview:false};
  const SIZES=[10,18,30,46,68];
  let V={z:1,x:0,y:0};let loupe=null,lasso=null,stroke=null;
  const st=ezStudio('컷아웃',{onOk:finish});
  const g=cx(st.cv);
  const fit=()=>{const m=16;const z=Math.min((st.W-m*2)/W,(st.H-m*2)/H);V={z,x:(st.W-W*z)/2,y:(st.H-H*z)/2}};fit();
  st.onResize=()=>{st.size();fit();draw()};
  function refresh(x0=0,y0=0,x1=W,y1=H){x0=Math.max(0,x0|0);y0=Math.max(0,y0|0);x1=Math.min(W,Math.ceil(x1));y1=Math.min(H,Math.ceil(y1));if(x1<=x0||y1<=y0)return;const d=od.data;for(let y=y0;y<y1;y++){let i=y*W+x0;for(let x=x0;x<x1;x++,i++)d[i*4+3]=mask[i]*.6}og.putImageData(od,0,0,x0,y0,x1-x0,y1-y0)}
  refresh();
  let prevC=null;
  function previewCanvas(){if(prevC&&prevC.ver===ver)return prevC;const m=mkCanvas(W,H);const mg=cx(m);const id=mg.createImageData(W,H);for(let i=0;i<W*H;i++)id.data[i*4+3]=mask[i];mg.putImageData(id,0,0);const o=cloneCanvas(wc);const g2=cx(o);g2.globalCompositeOperation='destination-in';g2.drawImage(m,0,0);o.ver=ver;prevC=o;return o}
  let ver=0;
  function paintScene(gg){
    gg.fillStyle='#1b1b1b';gg.fillRect(0,0,st.W,st.H);
    gg.save();gg.translate(V.x,V.y);gg.scale(V.z,V.z);gg.imageSmoothingEnabled=V.z<2;
    if(S.preview){ezChecker(gg,0,0,W,H);gg.drawImage(previewCanvas(),0,0)}else{gg.drawImage(wc,0,0);gg.drawImage(ov,0,0)}
    gg.restore();
    if(lasso&&lasso.length>1){gg.save();gg.lineWidth=2.5;gg.strokeStyle='#ff2d6f';gg.setLineDash([]);gg.beginPath();lasso.forEach((p,i)=>{const sx=V.x+p.x*V.z,sy=V.y+p.y*V.z;i?gg.lineTo(sx,sy):gg.moveTo(sx,sy)});gg.stroke();gg.restore()}
  }
  function draw(){
    g.setTransform(st.dpr,0,0,st.dpr,0,0);paintScene(g);
    if(loupe){
      const R=62,lx=loupe.sx<st.W/2&&loupe.sy<170?st.W-R-12:R+12,ly=R+12,k=2;
      g.save();g.beginPath();g.arc(lx,ly,R,0,Math.PI*2);g.clip();g.translate(lx,ly);g.scale(k,k);g.translate(-loupe.sx,-loupe.sy);paintScene(g);g.restore();
      g.save();g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(lx,ly,R,0,Math.PI*2);g.stroke();
      if(S.tool==='brush'||S.tool==='erase'){g.lineWidth=1.5;g.strokeStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(lx,ly,SIZES[S.size]/2*k,0,Math.PI*2);g.stroke()}
      g.fillStyle='#fff';g.fillRect(lx-1,ly-6,2,12);g.fillRect(lx-6,ly-1,12,2);g.restore();
    }
    if(stroke&&(S.tool==='brush'||S.tool==='erase')&&stroke.last){g.save();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.5;g.beginPath();g.arc(stroke.last.sx,stroke.last.sy,SIZES[S.size]/2,0,Math.PI*2);g.stroke();g.restore()}
  }
  st.redraw=draw;
  const toW=(sx,sy)=>({x:(sx-V.x)/V.z,y:(sy-V.y)/V.z});
  function snapUndo(){undoS.push(mask.slice());if(undoS.length>25)undoS.shift();redoS.length=0;updBtns()}
  function dab(cx0,cy0,erase){
    const r=SIZES[S.size]/2/V.z;const r2=r*r;const x0=Math.max(0,Math.floor(cx0-r)),x1=Math.min(W-1,Math.ceil(cx0+r)),y0=Math.max(0,Math.floor(cy0-r)),y1=Math.min(H-1,Math.ceil(cy0+r));
    if(x1<x0||y1<y0)return;
    let rr=0,gg2=0,bb=0,n=0;const smart=S.smart&&!erase;
    if(smart){const ix=clamp(Math.round(cx0),0,W-1),iy=clamp(Math.round(cy0),0,H-1);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const xx=clamp(ix+i,0,W-1),yy=clamp(iy+j,0,H-1),p=(yy*W+xx)*4;rr+=px[p];gg2+=px[p+1];bb+=px[p+2];n++}rr/=n;gg2/=n;bb/=n}
    const T=70;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const dx=x-cx0,dy=y-cy0,d2=dx*dx+dy*dy;if(d2>r2)continue;const d=Math.sqrt(d2);let v=d<r*.75?1:(r-d)/(r*.25);
      const i=y*W+x;
      if(smart){const p=i*4;const dc=Math.abs(px[p]-rr)+Math.abs(px[p+1]-gg2)+Math.abs(px[p+2]-bb);const w=dc<T?1:dc<T*1.6?(T*1.6-dc)/(T*.6):0;if(d>r*.3)v*=w}
      const a=v*255|0;if(erase){const m=255-a;if(mask[i]>m)mask[i]=m}else if(mask[i]<a)mask[i]=a}
    refresh(x0,y0,x1+1,y1+1);
  }
  function line(a,b,erase){const r=SIZES[S.size]/2/V.z;const dist=Math.hypot(b.x-a.x,b.y-a.y);const step=Math.max(.5,r*.3);const n=Math.max(1,Math.ceil(dist/step));for(let i=1;i<=n;i++)dab(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,erase)}
  function fillLasso(pts){if(pts.length<3)return;const t=mkCanvas(W,H);const tg=cx(t);tg.fillStyle='#000';tg.beginPath();pts.forEach((p,i)=>i?tg.lineTo(p.x,p.y):tg.moveTo(p.x,p.y));tg.closePath();tg.fill();const d=getData(t).data;for(let i=0;i<W*H;i++){const a=d[i*4+3];if(a>mask[i])mask[i]=a}refresh()}
  function autoPick(p){const x=Math.round(p.x),y=Math.round(p.y);if(x<0||y<0||x>=W||y>=H)return false;const m=floodMask({data:px,width:W,height:H},x,y,S.tol,true);let n=0;for(let i=0;i<W*H;i++)if(m[i]){mask[i]=255;n++}refresh();return n>0}
  // 손가락 처리: 한 손가락 = 칠하기, 두 손가락 = 확대·이동
  const pts=new Map();let pinch=null;
  st.cv.addEventListener('pointerdown',e=>{st.cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
    if(pts.size===2){if(stroke){mask=undoS.pop()||mask;refresh();stroke=null}lasso=null;loupe=null;const a=[...pts.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,mx:(a[0].x+a[1].x)/2,my:(a[0].y+a[1].y)/2,V:{...V}};draw();return}
    if(pts.size>2)return;
    const sx=e.offsetX,sy=e.offsetY,p=toW(sx,sy);
    if(S.tool==='auto'){snapUndo();if(!autoPick(p)){undoS.pop();updBtns()}ver++;draw();return}
    snapUndo();stroke={last:{...p,sx,sy}};loupe={sx,sy};
    if(S.tool==='lasso')lasso=[p];else dab(p.x,p.y,S.tool==='erase');
    ver++;draw()});
  st.cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
    if(pinch&&pts.size>=2){const a=[...pts.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1;const mx=(a[0].x+a[1].x)/2,my=(a[0].y+a[1].y)/2;const z=clamp(pinch.V.z*d/pinch.d,.05,40);const wx=(pinch.mx-pinch.V.x)/pinch.V.z,wy=(pinch.my-pinch.V.y)/pinch.V.z;V={z,x:mx-wx*z,y:my-wy*z};draw();return}
    if(!stroke)return;const sx=e.offsetX,sy=e.offsetY,p=toW(sx,sy);loupe={sx,sy};
    if(S.tool==='lasso')lasso.push(p);else line(stroke.last,p,S.tool==='erase');
    stroke.last={...p,sx,sy};ver++;draw()});
  const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
    if(pinch){if(pts.size<2)pinch=null;return}
    if(stroke){if(S.tool==='lasso'&&lasso){fillLasso(lasso);lasso=null}stroke=null;loupe=null;ver++;updBtns();draw()}};
  st.cv.addEventListener('pointerup',up);st.cv.addEventListener('pointercancel',up);
  st.cv.addEventListener('wheel',e=>{e.preventDefault();const k=Math.exp(-e.deltaY*.0015);const z=clamp(V.z*k,.05,40);const wx=(e.offsetX-V.x)/V.z,wy=(e.offsetY-V.y)/V.z;V={z,x:e.offsetX-wx*z,y:e.offsetY-wy*z};draw()},{passive:false});
  // 위 막대: 실행 취소 / 다시 실행
  const bU=ezB('ezI',EZI.undo,'',()=>{if(!undoS.length)return;redoS.push(mask);mask=undoS.pop();ver++;refresh();updBtns();draw()},'실행 취소');
  const bR=ezB('ezI',EZI.redo,'',()=>{if(!redoS.length)return;undoS.push(mask);mask=redoS.pop();ver++;refresh();updBtns();draw()},'다시 실행');
  st.headR.append(bU,bR);
  function updBtns(){bU.disabled=!undoS.length;bR.disabled=!redoS.length}
  // 아래: 도구 · 크기 · 스마트 브러시
  const hint=h('div',{class:'ezHint'});
  const HINTS={brush:'남길 부분을 손가락으로 칠하세요. 두 손가락으로 확대합니다',lasso:'남길 부분의 테두리를 한 바퀴 그리면 안쪽이 채워집니다',auto:'비슷한 색 덩어리를 누르면 한 번에 칠해집니다',erase:'잘못 칠한 부분을 문질러 지우세요'};
  const tools=[['brush',EZI.brush,'브러시'],['lasso',EZI.lasso,'외곽선'],['auto',EZI.wand,'자동'],['erase',EZI.erase,'지우개']];
  const toolRow=h('div',{class:'ezSeg'});
  const tbtn={};for(const [k,ic,t] of tools){tbtn[k]=ezB('ezSegB',ic,t,()=>{S.tool=k;sync()});toolRow.append(tbtn[k])}
  const smartSw=h('button',{class:'ezSwitch',role:'switch',onclick:()=>{S.smart=!S.smart;sync()}},h('span',{class:'k'}),h('span',null,'스마트 브러시'));
  const dots=h('div',{class:'ezDots'});SIZES.forEach((s,i)=>dots.append(h('button',{class:'ezDot','aria-label':'크기 '+(i+1),onclick:()=>{S.size=i;sync()}},h('i',{style:`width:${6+i*4}px;height:${6+i*4}px`}))));
  const tolSl=ezSlider({label:'범위',min:5,max:90,value:S.tol,onInput:v=>S.tol=v,onReset:32});
  const optRow=h('div',{class:'ezOptRow'});
  const actRow=h('div',{class:'ezActs'},
    ezB('ezA',EZI.inv,'반전',()=>{snapUndo();for(let i=0;i<W*H;i++)mask[i]=255-mask[i];ver++;refresh();draw()}),
    ezB('ezA',EZI.trash,'모두 지우기',()=>{snapUndo();mask.fill(0);ver++;refresh();draw()}),
    ezB('ezA ezPrev',EZI.eye,'결과 보기',()=>{S.preview=!S.preview;sync()}));
  st.foot.append(hint,optRow,toolRow,actRow);
  function sync(){for(const k in tbtn)tbtn[k].classList.toggle('on',S.tool===k);smartSw.classList.toggle('on',S.smart);smartSw.setAttribute('aria-checked',S.smart);
    [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===S.size));
    optRow.replaceChildren(...(S.tool==='auto'?[tolSl]:S.tool==='lasso'?[]:[S.tool==='brush'?smartSw:h('span'),dots]));
    hint.textContent=S.preview?'오려 낸 결과입니다. 다시 누르면 칠하기로 돌아갑니다':HINTS[S.tool];
    st.foot.querySelector('.ezPrev').classList.toggle('on',S.preview);draw()}
  sync();updBtns();
  async function finish(){
    let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(mask[y*W+x]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
    if(x1<0){toast('남길 부분을 먼저 칠해 주세요');return false}
    busy(true,'오려 내는 중…');await nextFrame();
    try{
      const m=mkCanvas(W,H);const mg=cx(m);const id=mg.createImageData(W,H);for(let i=0;i<W*H;i++)id.data[i*4+3]=mask[i];mg.putImageData(id,0,0);
      const bx=Math.max(0,Math.floor(x0/sc)-2),by=Math.max(0,Math.floor(y0/sc)-2),bx1=Math.min(SW,Math.ceil((x1+1)/sc)+2),by1=Math.min(SH,Math.ceil((y1+1)/sc)+2);
      const bw=bx1-bx,bh=by1-by;
      const out=mkCanvas(bw,bh);const o=cx(out);o.drawImage(src,-bx,-by);o.globalCompositeOperation='destination-in';o.imageSmoothingQuality='high';o.drawImage(m,-bx,-by,SW,SH);
      const hid=[];
      if(srcLayer){hid.push(srcLayer)}else for(const l of doc.root.children)if(l.visible)hid.push(l);
      const nl=newLayer({name:nextName('컷아웃'),canvas:out,x:ox+bx,y:oy+by});nl.ezCut=1;
      if(srcLayer)insertLayer(nl,srcLayer);else{doc.root.children.push(nl);doc.active=nl}
      for(const l of hid){l.visible=false;l.ezHid=1}
      pushHist('컷아웃');fitView();
    }catch(e){toast('오려 내지 못했습니다: '+e.message);busy(false);return false}
    busy(false);
    setTimeout(()=>ezBgSheet(true),150);
  }
}

// ---------- 배경 바꾸기 ----------
function ezBgSheet(after){
  const hasCut=flat().some(l=>l.ezCut);
  if(!hasCut){
    dialog({title:'배경 바꾸기',width:340,content:b=>b.append(h('div',{style:'line-height:1.6;font-size:13.5px'},'먼저 ',h('b',null,'컷아웃'),'으로 남길 사람이나 물건을 오려 주세요. 그다음 배경을 사진·색·흐림으로 바꿀 수 있습니다.')),ok:'컷아웃 시작',onOk:()=>setTimeout(ezCutout,50)});
    return;
  }
  const COLORS=['#ffffff','#000000','#f4e1d2','#ffd6e0','#cde7ff','#d7f5dc','#fff1b8','#2f87e6','#ff5c8a','#7b61ff'];
  ezSheet(after?'오려 냈어요! 배경을 골라 보세요':'배경 바꾸기',[
    [EZI.photo,'사진으로',()=>ezBgPhoto()],
    [EZI.blur,'원래 배경 흐리게',()=>ezBgApply('blur')],
    [EZI.orig,'원래 배경',()=>ezBgApply('orig')],
    [EZI.none,'투명',()=>ezBgApply('none')],
  ],close=>{const row=h('div',{class:'ezColors'});for(const c of COLORS)row.append(h('button',{class:'ezCol',style:'background:'+c,'aria-label':'배경색 '+c,onclick:()=>{close();ezBgApply('color',c)}}));
    const pick=h('input',{type:'color',value:'#88aaff','aria-label':'다른 색',onchange:()=>{close();ezBgApply('color',pick.value)}});row.append(h('label',{class:'ezCol ezColPick',title:'다른 색'},'+',pick));return row});
}
function ezBgClear(){const rm=[];walk(doc.root,l=>{if(l.ezBg)rm.push(l)});for(const l of rm){const p=parentOf(l)||doc.root;p.children.splice(p.children.indexOf(l),1)}if(rm.includes(doc.active))doc.active=flat().find(l=>l.ezCut)||doc.root.children[doc.root.children.length-1]}
function ezBgLayer(c,name){const l=newLayer({name,canvas:c});l.ezBg=1;doc.root.children.unshift(l);return l}
function ezHidden(){const r=[];walk(doc.root,l=>{if(l.ezHid)r.push(l)});return r}
function ezBgApply(kind,val){
  const act=doc.active;ezBgClear();const hid=ezHidden();
  if(kind==='orig'){hid.forEach(l=>l.visible=true)}
  else{hid.forEach(l=>l.visible=false);
    if(kind==='color'){const c=mkCanvas(doc.w,doc.h);const g=cx(c);g.fillStyle=val;g.fillRect(0,0,c.width,c.height);ezBgLayer(c,'배경색')}
    else if(kind==='blur'){hid.forEach(l=>l.visible=true);const cut=flat().filter(l=>l.ezCut&&l.visible);cut.forEach(l=>l.visible=false);doc.dirty=true;composite();const base=flattenCanvas();cut.forEach(l=>l.visible=true);hid.forEach(l=>l.visible=false);
      const sm=ezScaled(base,900);const b=blurCanvas(sm.c,Math.max(4,Math.round(Math.max(sm.c.width,sm.c.height)/90)));const c=mkCanvas(doc.w,doc.h);const g=cx(c);g.imageSmoothingQuality='high';g.drawImage(b,0,0,doc.w,doc.h);ezBgLayer(c,'흐린 배경')}
  }
  if(act&&flat().includes(act))doc.active=act;
  doc.dirty=true;pushHist('배경 바꾸기');requestDraw();
}
function ezBgPhoto(){const i=h('input',{type:'file',accept:'image/*',style:'display:none'});i.onchange=async()=>{const f=i.files[0];i.remove();if(!f)return;busy(true,'배경을 넣는 중…');await nextFrame();
  try{const r=await fileToCanvas(f);const s=r.canvas;const k=Math.max(doc.w/s.width,doc.h/s.height);const c=mkCanvas(doc.w,doc.h);const g=cx(c);g.imageSmoothingQuality='high';g.drawImage(s,(doc.w-s.width*k)/2,(doc.h-s.height*k)/2,s.width*k,s.height*k);
    const act=doc.active;ezBgClear();ezHidden().forEach(l=>l.visible=false);ezBgLayer(c,'배경 사진');if(act&&flat().includes(act))doc.active=act;doc.dirty=true;pushHist('배경 바꾸기');requestDraw();toast('배경을 바꿨습니다. "크기·위치"로 오린 사진을 옮겨 보세요',2600)}catch(e){toast(e.message)}busy(false)};document.body.append(i);i.click()}

// ---------- 사진 합성 (위에 사진 얹기) ----------
function ezAddPhoto(){
  const i=h('input',{type:'file',accept:'image/*,.psd',style:'display:none'});
  i.onchange=async()=>{const f=i.files[0];i.remove();if(!f)return;if(!doc){openFiles([f]);return}
    busy(true,'사진을 넣는 중…');await nextFrame();
    try{const r=await fileToCanvas(f);const c=r.canvas;const s=Math.min(1,doc.w*.6/c.width,doc.h*.6/c.height);
      addLayer(f.name.replace(/\.[^.]+$/,''),c,Math.round((doc.w-c.width)/2),Math.round((doc.h-c.height)/2));pushHist('사진 합성');busy(false);
      setTool('move');startTransform(true,s);ezDoneBtn(true);toast('끌어서 옮기고, 모서리로 크기, 위 손잡이로 회전하세요',2800)}catch(e){busy(false);toast(e.message)}};
  document.body.append(i);i.click();
}

// ---------- 자르기 · 회전 ----------
function ezCrop(){
  if(doc.dirty)composite();
  const base=ezScaled(flattenCanvas(),1600);const ps=base.s;const DW=doc.w,DH=doc.h;
  const S={fh:false,fv:false,r90:0,ang:0,ratio:'free',rect:null};
  const st=ezStudio('자르기 · 회전',{onOk:apply});const g=cx(st.cv);
  const dims=()=>{const rad=(S.r90*90+S.ang)*Math.PI/180;const co=Math.abs(Math.cos(rad)),si=Math.abs(Math.sin(rad));return{nw:Math.round(DW*co+DH*si),nh:Math.round(DW*si+DH*co),rad}};
  let pv=null;
  function build(){const{nw,nh,rad}=dims();const c=mkCanvas(Math.max(1,Math.round(nw*ps)),Math.max(1,Math.round(nh*ps)));const q=cx(c);q.imageSmoothingQuality='high';q.translate(c.width/2,c.height/2);q.rotate(rad);q.scale(S.fh?-1:1,S.fv?-1:1);q.drawImage(base.c,-base.c.width/2,-base.c.height/2);pv={c,nw,nh}}
  function ratioK(){if(S.ratio==='free')return 0;if(S.ratio==='orig'){return (S.r90%2?DW/DH:DH/DW)}const[a,b]=S.ratio.split(':').map(Number);return b/a}
  function inner(){ // 빈 모서리가 생기지 않는 가장 큰 영역
    const{nw,nh}=pv;const a=Math.abs(S.ang)*Math.PI/180;const w0=S.r90%2?DH:DW,h0=S.r90%2?DW:DH;const co=Math.cos(a),si=Math.sin(a);
    let k=ratioK();if(!k)k=h0/w0;
    // 너비 x, 높이 x*k 인 사각형이 회전된 사진 안에 들어가는 최대 x
    const x=Math.min(w0/(co+k*si),h0/(si+k*co));const w=x,hh=x*k;return{x:(nw-w)/2,y:(nh-hh)/2,w,h:hh}}
  function reset(){build();S.rect=inner()}
  let V={z:1,x:0,y:0};
  function fit(){const m=28;const z=Math.min((st.W-m*2)/pv.nw,(st.H-m*2)/pv.nh);V={z,x:(st.W-pv.nw*z)/2,y:(st.H-pv.nh*z)/2}}
  function draw(){if(!pv)return;g.setTransform(st.dpr,0,0,st.dpr,0,0);g.fillStyle='#1b1b1b';g.fillRect(0,0,st.W,st.H);
    g.save();g.translate(V.x,V.y);g.scale(V.z,V.z);g.drawImage(pv.c,0,0,pv.nw,pv.nh);g.restore();
    const r=S.rect;const a={x:V.x+r.x*V.z,y:V.y+r.y*V.z},w=r.w*V.z,hh=r.h*V.z;
    g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.rect(0,0,st.W,st.H);g.rect(a.x,a.y,w,hh);g.fill('evenodd');
    g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1;g.beginPath();for(let i=1;i<3;i++){g.moveTo(a.x+w*i/3,a.y);g.lineTo(a.x+w*i/3,a.y+hh);g.moveTo(a.x,a.y+hh*i/3);g.lineTo(a.x+w,a.y+hh*i/3)}g.stroke();
    g.strokeStyle='#fff';g.lineWidth=1.5;g.strokeRect(a.x,a.y,w,hh);
    g.lineWidth=4;g.lineCap='round';const L=Math.min(22,w/3,hh/3);g.beginPath();
    for(const [cx0,cy0,dx,dy] of [[a.x,a.y,1,1],[a.x+w,a.y,-1,1],[a.x,a.y+hh,1,-1],[a.x+w,a.y+hh,-1,-1]]){g.moveTo(cx0+dx*L,cy0);g.lineTo(cx0,cy0);g.lineTo(cx0,cy0+dy*L)}g.stroke();g.lineCap='butt'}
  st.redraw=()=>{fit();draw()};
  // 자르기 상자 끌기
  let drag=null;
  st.cv.addEventListener('pointerdown',e=>{st.cv.setPointerCapture(e.pointerId);const r=S.rect;const a={x:V.x+r.x*V.z,y:V.y+r.y*V.z},b={x:a.x+r.w*V.z,y:a.y+r.h*V.z};const T=26;const sx=e.offsetX,sy=e.offsetY;
    const hx=Math.abs(sx-a.x)<T?-1:Math.abs(sx-b.x)<T?1:0,hy=Math.abs(sy-a.y)<T?-1:Math.abs(sy-b.y)<T?1:0;
    const inside=sx>a.x-T&&sx<b.x+T&&sy>a.y-T&&sy<b.y+T;if(!inside)return;
    drag={sx,sy,r:{...r},hx:inside?hx:0,hy:inside?hy:0,move:!hx&&!hy}});
  st.cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.offsetX-drag.sx)/V.z,dy=(e.offsetY-drag.sy)/V.z;const o=drag.r;let r={...o};const{nw,nh}=pv;
    if(drag.move){r.x=clamp(o.x+dx,0,nw-o.w);r.y=clamp(o.y+dy,0,nh-o.h)}
    else{let x0=o.x,y0=o.y,x1=o.x+o.w,y1=o.y+o.h;const mn=20/V.z;
      if(drag.hx<0)x0=clamp(o.x+dx,0,x1-mn);if(drag.hx>0)x1=clamp(x1+dx,x0+mn,nw);if(drag.hy<0)y0=clamp(o.y+dy,0,y1-mn);if(drag.hy>0)y1=clamp(y1+dy,y0+mn,nh);
      const k=ratioK();if(k){let w=x1-x0,hh=y1-y0;if(drag.hx&&!drag.hy||(drag.hx&&drag.hy&&w*k>hh&&false)){hh=w*k}else if(drag.hy&&!drag.hx){w=hh/k}else{hh=w*k}
        if(drag.hy<0)y0=y1-hh;else y1=y0+hh;if(drag.hx<0)x0=x1-w;else x1=x0+w;
        if(x0<0||y0<0||x1>nw||y1>nh)return}
      r={x:x0,y:y0,w:x1-x0,h:y1-y0}}
    S.rect=r;draw()});
  const end=()=>{drag=null};st.cv.addEventListener('pointerup',end);st.cv.addEventListener('pointercancel',end);
  // 아래 조작
  const angSl=ezSlider({label:'수평',min:-45,max:45,step:.5,value:0,fmt:v=>(v>0?'+':'')+v+'°',onInput:v=>{S.ang=v;reset();fit();draw()},onReset:0});
  const ratios=[['free','자유'],['orig','원본'],['1:1','1:1'],['4:5','4:5'],['3:4','3:4'],['9:16','9:16'],['16:9','16:9']];
  const rRow=h('div',{class:'ezChips'});const rb={};for(const [k,t] of ratios){rb[k]=h('button',{class:'ezChip',onclick:()=>{S.ratio=k;S.rect=inner();syncR();draw()}},t);rRow.append(rb[k])}
  function syncR(){for(const k in rb)rb[k].classList.toggle('on',S.ratio===k)}
  const acts=h('div',{class:'ezActs'},
    ezB('ezA',EZI.rot,'90° 회전',()=>{S.r90=(S.r90+3)%4;reset();fit();draw()}),
    ezB('ezA',EZI.fh,'좌우 뒤집기',()=>{S.fh=!S.fh;build();draw()}),
    ezB('ezA',EZI.fv,'상하 뒤집기',()=>{S.fv=!S.fv;build();draw()}),
    ezB('ezA',EZI.reset,'처음대로',()=>{Object.assign(S,{fh:false,fv:false,r90:0,ang:0,ratio:'free'});angSl.set(0);syncR();reset();fit();draw()}));
  st.foot.append(angSl,rRow,acts);
  reset();fit();syncR();draw();
  async function apply(){
    const full=Math.abs(S.rect.x)<.5&&Math.abs(S.rect.y)<.5&&Math.abs(S.rect.w-pv.nw)<.5&&Math.abs(S.rect.h-pv.nh)<.5;
    if(!S.fh&&!S.fv&&!S.r90&&!S.ang&&full)return;
    busy(true,'적용하는 중…');await nextFrame();const h0=doc.hIndex;
    try{
      // 뒤집기 먼저, 그다음 회전 (미리보기와 같은 순서)
      if(S.fh)rotateCanvas(0,'h');if(S.fv)rotateCanvas(0,'v');
      const deg=S.r90*90+S.ang;if(deg%360)rotateCanvas(deg);
      if(!full){const r=S.rect;applyCrop({x:Math.round(r.x),y:Math.round(r.y),w:Math.max(1,Math.round(r.w)),h:Math.max(1,Math.round(r.h))},true)}
      // 히스토리를 한 단계로 묶기
      const n=doc.hIndex-h0;if(n>1){const last=doc.history[doc.hIndex];doc.history.splice(h0+1,n,last);doc.hIndex=h0+1}
      doc.history[doc.hIndex].label='자르기 · 회전';refreshAll();fitView();
    }catch(e){toast(e.message)}busy(false);
  }
}

// ---------- 필터 · 보정 ----------
const EZ_LOOKS=[
  ['원본',{}],
  ['선명하게',{sat:.35,con:.18,sharp:.4}],
  ['따뜻하게',{warm:.5,sat:.1,bright:.04}],
  ['시원하게',{warm:-.45,sat:.05}],
  ['청량',{warm:-.2,sat:.25,bright:.12,con:.08}],
  ['노을',{warm:.6,tint:.25,con:.12,vig:.25}],
  ['필름',{fade:.45,warm:.15,sat:-.18,con:-.05,grain:.25}],
  ['빈티지',{sepia:.55,fade:.35,vig:.45,grain:.3}],
  ['드라마',{con:.45,sat:-.25,vig:.55,sharp:.3}],
  ['흑백',{bw:1,con:.15}],
  ['흑백 진하게',{bw:1,con:.5,vig:.3}],
  ['부드럽게',{bright:.12,con:-.15,fade:.2,sat:-.05}],
];
const EZ_ADJ=[['bright','밝기'],['con','대비'],['sat','채도'],['warm','색온도'],['tint','색조'],['fade','페이드'],['vig','비네팅'],['sharp','선명도'],['grain','필름 입자']];
function ezGrade(id,p){
  const{data:d,width:w,height:hh}=id;const B=p.bright||0,C=p.con||0,Sa=p.sat||0,Wa=p.warm||0,Ti=p.tint||0,F=p.fade||0,Vg=p.vig||0,BW=p.bw||0,Se=p.sepia||0,Gr=p.grain||0;
  if(p.sharp>0){const a=p.sharp*.9;convolve(id,[0,-a,0,-a,1+4*a,-a,0,-a,0])}
  const cxp=w/2,cyp=hh/2,rm=1/(cxp*cxp+cyp*cyp);const rnd=makeRng(11);
  const lut=new Float32Array(256);for(let i=0;i<256;i++){let v=i/255;v=B>0?v+B*(1-v)*.9:v*(1+B*.9);v=(v-.5)*(1+C)+.5;lut[i]=v}
  for(let y=0;y<hh;y++){const dy=(y-cyp)*(y-cyp);for(let x=0;x<w;x++){const o=(y*w+x)*4;if(d[o+3]===0)continue;
    let r=lut[d[o]],g=lut[d[o+1]],b=lut[d[o+2]];
    r+=Wa*.12;b-=Wa*.12;g-=Ti*.08;r+=Ti*.04;b+=Ti*.04;
    const l=.299*r+.587*g+.114*b;
    if(Sa){r=l+(r-l)*(1+Sa);g=l+(g-l)*(1+Sa);b=l+(b-l)*(1+Sa)}
    if(BW){r=r+(l-r)*BW;g=g+(l-g)*BW;b=b+(l-b)*BW}
    if(Se){const sr=l*1.07+.06,sg=l*.95+.02,sb=l*.78-.02;r+=(sr-r)*Se;g+=(sg-g)*Se;b+=(sb-b)*Se}
    if(F){r=r*(1-F*.22)+F*.1;g=g*(1-F*.22)+F*.1;b=b*(1-F*.22)+F*.11}
    if(Vg){const t=((x-cxp)*(x-cxp)+dy)*rm;const k=1-Vg*.75*t*t*(3-2*Math.min(1,t));r*=k;g*=k;b*=k}
    if(Gr){const n=(rnd()-.5)*Gr*.16;r+=n;g+=n;b+=n}
    d[o]=r*255;d[o+1]=g*255;d[o+2]=b*255}}
  return id;
}
function ezMix(look,k,adj){const p={};for(const key in look)p[key]=(look[key]||0)*k;for(const key in adj){if(adj[key])p[key]=(p[key]||0)+adj[key]}if(p.bw>1)p.bw=1;return p}
function ezLooks(tab){
  const l=doc.active;
  if(!l||l.type==='group'||l.type==='adjust'||!(l.canvas||l.type==='text')){toast('사진 레이어를 먼저 고르세요 (레이어 버튼)');return}
  if(l.locked){toast('레이어가 잠겨 있습니다');return}
  if(l.type==='text'&&!l.canvas)rasterizeText(l);
  const srcC=maskedCanvas(l);const base=ezScaled(srcC,1100);const bd=getData(base.c);
  const S={tab,look:0,k:100,adj:{}};
  const st=ezStudio(tab==='look'?'필터':'보정',{onOk:apply});const g=cx(st.cv);
  const out=mkCanvas(base.c.width,base.c.height);const og=cx(out);
  let raf=0;function render(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const id=new ImageData(new Uint8ClampedArray(bd.data),bd.width,bd.height);ezGrade(id,params());og.putImageData(id,0,0);draw()})}
  const params=()=>ezMix(EZ_LOOKS[S.look][1],S.k/100,S.adj);
  let showOrig=false;
  function draw(){g.setTransform(st.dpr,0,0,st.dpr,0,0);g.fillStyle='#1b1b1b';g.fillRect(0,0,st.W,st.H);const m=14;const z=Math.min((st.W-m*2)/out.width,(st.H-m*2)/out.height);const w=out.width*z,hh=out.height*z,x=(st.W-w)/2,y=(st.H-hh)/2;ezChecker(g,x,y,w,hh);g.imageSmoothingQuality='high';g.drawImage(showOrig?base.c:out,x,y,w,hh);
    if(showOrig){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x+8,y+8,58,24);g.fillStyle='#fff';g.font='600 12px Pretendard,sans-serif';g.fillText('원본',x+20,y+25)}}
  st.redraw=draw;
  // 누르고 있으면 원본 보기
  st.cv.addEventListener('pointerdown',()=>{showOrig=true;draw()});const off=()=>{if(showOrig){showOrig=false;draw()}};st.cv.addEventListener('pointerup',off);st.cv.addEventListener('pointercancel',off);st.cv.addEventListener('pointerleave',off);
  // 탭: 필터 / 보정
  const tabs=h('div',{class:'ezTabs'});const tb={};
  for(const [k,t] of [['look','필터'],['adj','보정']]){tb[k]=h('button',{class:'ezTab',onclick:()=>{S.tab=k;st.titleEl.textContent=t;sync()}},t);tabs.append(tb[k])}
  st.headR.append(tabs);
  // 필터 미리보기 줄
  const th=ezScaled(base.c,150);const thD=getData(th.c);
  const strip=h('div',{class:'ezLooks'});const lb=[];
  EZ_LOOKS.forEach(([name,p],i)=>{const c=mkCanvas(th.c.width,th.c.height);const id=new ImageData(new Uint8ClampedArray(thD.data),thD.width,thD.height);ezGrade(id,p);cx(c).putImageData(id,0,0);
    const box=h('div',{class:'ezLookImg'});box.append(c);
    const b=h('button',{class:'ezLook',onclick:()=>{if(S.look===i&&i){/* 같은 필터를 다시 누르면 세기 조절 강조 */kSl.classList.add('flash');setTimeout(()=>kSl.classList.remove('flash'),500)}S.look=i;if(!i)S.k=100,kSl.set(100);sync();render()}},box,h('span',null,name));lb.push(b);strip.append(b)});
  const kSl=ezSlider({label:'세기',min:0,max:100,value:100,fmt:v=>v+'',onInput:v=>{S.k=v;render()},onReset:100});
  const lookPane=h('div',{class:'ezPane'},kSl,strip);
  // 보정 슬라이더
  const adjList=h('div',{class:'ezAdjList'});const sl={};
  for(const [k,t] of EZ_ADJ){const min=['fade','vig','sharp','grain'].includes(k)?0:-100;sl[k]=ezSlider({label:t,min,max:100,value:0,fmt:v=>(v>0&&min<0?'+':'')+v,onInput:v=>{S.adj[k]=v/100;render()},onReset:0});adjList.append(sl[k])}
  const adjPane=h('div',{class:'ezPane'},adjList,h('button',{class:'ezLink',onclick:()=>{for(const k in sl){sl[k].set(0);S.adj[k]=0}render()}},'보정 모두 처음대로'));
  const tip=h('div',{class:'ezHint'},'사진을 누르고 있으면 원본과 비교할 수 있습니다');
  st.foot.append(tip,lookPane,adjPane);
  function sync(){for(const k in tb)tb[k].classList.toggle('on',S.tab===k);lookPane.hidden=S.tab!=='look';adjPane.hidden=S.tab!=='adj';lb.forEach((b,i)=>b.classList.toggle('on',i===S.look));kSl.style.visibility=S.look?'visible':'hidden';st.titleEl.textContent=S.tab==='look'?'필터':'보정'}
  sync();draw();render();
  async function apply(){
    const p=params();if(!Object.keys(p).some(k=>p[k])){return}
    const lay=activeRaster('silent');if(!lay)return false;
    busy(true,'적용하는 중…');await nextFrame();
    try{if(lay.type==='text'){if(!lay.canvas)rasterizeText(lay);lay.type='layer';lay.raw=null}
      const c=cloneCanvas(lay.canvas);const cg=cx(c);const id=getData(c);ezGrade(id,p);
      if(doc.sel){const t=mkCanvas(c.width,c.height);cx(t).putImageData(id,0,0);const tg=cx(t);tg.globalCompositeOperation='destination-in';tg.drawImage(doc.sel,-lay.x,-lay.y);cg.drawImage(t,0,0)}else cg.putImageData(id,0,0);
      lay.canvas=c;lay._mk=null;doc.dirty=true;pushHist(S.look?'필터: '+EZ_LOOKS[S.look][0]:'보정');requestDraw()}catch(e){toast(e.message)}
    busy(false);
  }
}
