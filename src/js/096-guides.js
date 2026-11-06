// ===== 눈금자 · 안내선 (Photo · Illust 공용) =====
// Ctrl+R 눈금자, Ctrl+; 안내선 표시, Shift+Ctrl+; 안내선에 물리기, Alt+Ctrl+; 안내선 잠금
const RG=(()=>{let s={};try{s=JSON.parse(localStorage.getItem('iuxRG')||'{}')}catch(e){}
  return{rulers:s.rulers!==false,show:s.show!==false,snap:s.snap!==false,lock:!!s.lock}})();
const RULER=20;
function rgSave(){try{localStorage.setItem('iuxRG',JSON.stringify(RG))}catch(e){}}
function rgMake(host,app){
  const mk=(cls)=>{const c=h('canvas',{class:'rg '+cls});host.append(c);return c};
  const gl=mk('rgGuides'),rh=mk('rgH'),rv=mk('rgV');const corner=h('div',{class:'rgCorner',title:'안내선 모두 지우기 (더블 클릭)'});host.append(corner);
  return{host,app,gl,rh,rv,corner,cur:null};
}
const RGP=rgMake($('#work'),'photo'),RGI=rgMake($('#ilWork'),'illust');
// 앱별 연결
function rgApi(R){
  if(R.app==='photo')return{
    d:()=>doc,ref:()=>view,z:()=>doc.zoom,px:()=>doc.panX,py:()=>doc.panY,ox:()=>0,oy:()=>0,
    guides:()=>doc.guides||(doc.guides=[]),round:true,
    toolOk:e=>(tool&&tool.id==='move')||e.ctrlKey||e.metaKey,
  };
  return{
    d:()=>IL.doc,ref:()=>ilSvg,z:()=>IL.doc.zoom,px:()=>IL.doc.panX,py:()=>IL.doc.panY,
    ox:()=>{const a=IL.doc.abs[IL.doc.ab];return a?a.x:0},oy:()=>{const a=IL.doc.abs[IL.doc.ab];return a?a.y:0},
    guides:()=>IL.doc.guides||(IL.doc.guides=[]),round:false,
    toolOk:e=>(IL.tool&&['select','direct'].includes(IL.tool.id))||e.ctrlKey||e.metaKey,
  };
}
function rgNice(z){const L=[1,2,5,10,20,25,50,100,200,250,500,1000,2000,2500,5000,10000,20000,50000];for(const s of L)if(s*z>=56)return s;return 100000}
function rgSize(c,w,hh){const d=devicePixelRatio||1;if(c.width!==Math.round(w*d)||c.height!==Math.round(hh*d)){c.width=Math.round(w*d);c.height=Math.round(hh*d)}c.style.width=w+'px';c.style.height=hh+'px';const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);return g}
function rgDraw(R){
  const A=rgApi(R),D=A.d();const on=!!D&&APP===R.app;
  const W=R.host.clientWidth,H=R.host.clientHeight;
  R.rh.hidden=R.rv.hidden=R.corner.hidden=!(on&&RG.rulers);R.gl.hidden=!(on&&RG.show);
  R.host.classList.toggle('hasRulers',on&&RG.rulers);
  if(!on)return;
  const rr=A.ref().getBoundingClientRect(),hr=R.host.getBoundingClientRect();const offX=rr.left-hr.left,offY=rr.top-hr.top;
  const z=A.z(),px=A.px()+offX,py=A.py()+offY,ox=A.ox(),oy=A.oy();
  // 안내선
  if(RG.show){const g=rgSize(R.gl,W,H);g.clearRect(0,0,W,H);g.lineWidth=1;
    for(const q of A.guides()){g.strokeStyle=q===R.drag?'#ffffff':(RG.lock?'#7fb8c4':'#00d9ff');g.beginPath();
      if(q.o==='h'){const y=Math.round(py+q.p*z)+.5;g.moveTo(0,y);g.lineTo(W,y)}else{const x=Math.round(px+q.p*z)+.5;g.moveTo(x,0);g.lineTo(x,H)}g.stroke()}}
  if(!RG.rulers)return;
  const step=rgNice(z),sub=step*z>=110?10:step*z>=70?5:2;
  const css=getComputedStyle(document.documentElement);const bg='#3b3b3b',fg='#b9b9b9';
  const one=(c,horiz)=>{const len=horiz?W:H;const g=rgSize(c,horiz?W:RULER,horiz?RULER:H);g.fillStyle=bg;g.fillRect(0,0,horiz?W:RULER,horiz?RULER:H);
    g.fillStyle='#262626';if(horiz)g.fillRect(0,RULER-1,W,1);else g.fillRect(RULER-1,0,1,H);
    const pan=horiz?px:py,org=horiz?ox:oy;const u0=(0-pan)/z-org,u1=(len-pan)/z-org;
    g.strokeStyle=fg;g.fillStyle=fg;g.font='9px '+(css.getPropertyValue('--ui')||'sans-serif');g.lineWidth=1;g.beginPath();
    const ms=step/sub;for(let u=Math.floor(u0/ms)*ms;u<=u1;u+=ms){const s=Math.round(pan+(u+org)*z)+.5;const major=Math.abs(u/step-Math.round(u/step))<1e-6;const half=!major&&sub===10&&Math.abs(u/(step/2)-Math.round(u/(step/2)))<1e-6;const t=major?RULER:half?8:4;
      if(horiz){g.moveTo(s,RULER-t);g.lineTo(s,RULER-1)}else{g.moveTo(RULER-t,s);g.lineTo(RULER-1,s)}
      if(major){const lab=String(Math.round(u));if(horiz)g.fillText(lab,s+3,9);else{g.save();g.translate(9,s+3);g.rotate(-Math.PI/2);g.textAlign='right';g.fillText(lab,0,0);g.restore()}}}
    g.stroke();
    if(R.cur){const s=Math.round(horiz?R.cur.x:R.cur.y)+.5;g.strokeStyle='#e0e0e0';g.setLineDash([2,2]);g.beginPath();if(horiz){g.moveTo(s,0);g.lineTo(s,RULER)}else{g.moveTo(0,s);g.lineTo(RULER,s)}g.stroke();g.setLineDash([])}
  };
  one(R.rh,true);one(R.rv,false);
}
let rgQ=false;function rgRequest(){if(rgQ)return;rgQ=true;requestAnimationFrame(()=>{rgQ=false;try{rgDraw(RGP);rgDraw(RGI)}catch(e){}})}
// 화면이 바뀔 때마다 다시 그리기
{const _d=draw;draw=function(){_d.apply(this,arguments);rgRequest()};const _a=ilApplyView;ilApplyView=function(){_a.apply(this,arguments);rgRequest()};}
addEventListener('resize',rgRequest);
// 좌표 변환 (host 기준 화면 좌표 → 문서/눈금자 단위)
function rgToUnit(R,e,o){const A=rgApi(R);const rr=A.ref().getBoundingClientRect();const s=o==='h'?e.clientY-rr.top:e.clientX-rr.left;let v=(s-(o==='h'?A.py():A.px()))/A.z();if(A.round)v=Math.round(v);else v=Math.round(v*100)/100;return v}
function rgNear(R,e){const A=rgApi(R);if(!A.d()||!RG.show)return null;const rr=A.ref().getBoundingClientRect();const sx=e.clientX-rr.left,sy=e.clientY-rr.top;const z=A.z();let best=null,bd=4*HITR+1;
  for(const q of A.guides()){const d=q.o==='h'?Math.abs(A.py()+q.p*z-sy):Math.abs(A.px()+q.p*z-sx);if(d<bd){bd=d;best=q}}return best}
function rgStartDrag(R,q,e,isNew){
  R.drag=q;const A=rgApi(R);const el=e.currentTarget||R.host;try{el.setPointerCapture(e.pointerId)}catch(x){}
  document.body.classList.add(q.o==='h'?'rgDragH':'rgDragV');
  const mv=ev=>{if(ev.pointerId!==e.pointerId)return;q.p=rgToUnit(R,ev,q.o);R.cur=rgLocal(R,ev);rgTip(ev,q);rgRequest()};
  const up=ev=>{if(ev.pointerId!==e.pointerId)return;removeEventListener('pointermove',mv,true);removeEventListener('pointerup',up,true);removeEventListener('pointercancel',up,true);
    document.body.classList.remove('rgDragH','rgDragV');rgTip(null);R.drag=null;
    const hr=R.host.getBoundingClientRect();const off=q.o==='h'?(ev.clientY-hr.top<RULER||ev.clientY>hr.bottom):(ev.clientX-hr.left<RULER||ev.clientX>hr.right);
    if(off||ev.type==='pointercancel'){const G=A.guides();const i=G.indexOf(q);if(i>=0)G.splice(i,1)}
    rgRequest()};
  addEventListener('pointermove',mv,true);addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
  if(isNew)mv(e);
}
function rgLocal(R,e){const hr=R.host.getBoundingClientRect();return{x:e.clientX-hr.left,y:e.clientY-hr.top}}
let rgTipEl=null;function rgTip(e,q){if(!e){if(rgTipEl)rgTipEl.hidden=true;return}if(!rgTipEl){rgTipEl=h('div',{id:'rgTip'});document.body.append(rgTipEl)}rgTipEl.hidden=false;rgTipEl.textContent=(q.o==='h'?'Y: ':'X: ')+q.p+' px';rgTipEl.style.left=(e.clientX+14)+'px';rgTipEl.style.top=(e.clientY+14)+'px'}
for(const R of [RGP,RGI]){
  const A=rgApi(R);
  const fromRuler=o=>e=>{if(!A.d()||e.button>0)return;e.preventDefault();e.stopPropagation();if(!RG.show){RG.show=true;rgSave()}
    const q={o,p:0};A.guides().push(q);rgStartDrag(R,q,e,true)};
  R.rh.addEventListener('pointerdown',fromRuler('h'));R.rv.addEventListener('pointerdown',fromRuler('v'));
  R.corner.addEventListener('dblclick',()=>{if(A.d()){A.guides().length=0;rgRequest()}});
  // 기존 안내선 끌기 (이동/선택 도구 또는 Ctrl)
  R.host.addEventListener('pointerdown',e=>{if(e.button>0||RG.lock||!A.d()||APP!==R.app)return;if(e.target.closest('.rg,.rgCorner'))return;if(!A.toolOk(e))return;const q=rgNear(R,e);if(!q)return;
    e.preventDefault();e.stopPropagation();rgStartDrag(R,q,e,false)},true);
  R.host.addEventListener('dblclick',e=>{if(!A.d()||RG.lock)return;const q=rgNear(R,e);if(!q)return;e.stopPropagation();rgEditDlg(R,q)},true);
  let hov=null;
  R.host.addEventListener('pointermove',e=>{if(APP!==R.app)return;R.cur=rgLocal(R,e);if(RG.rulers)rgRequest();
    if(e.buttons||R.drag)return;const q=(!RG.lock&&A.d()&&A.toolOk(e))?rgNear(R,e):null;const el=A.ref();
    if(q&&!hov){hov=el.style.cursor;el.style.cursor=q.o==='h'?'row-resize':'col-resize'}else if(!q&&hov!==null){el.style.cursor=hov;hov=null}},true);
  R.host.addEventListener('pointerleave',()=>{R.cur=null;rgRequest()});
}
// 그리기 좌표를 안내선에 물리기
function rgSnapPoint(R,p){const A=rgApi(R);if(!RG.snap||!RG.show||!A.d())return p;const G=A.guides();if(!G.length)return p;const tol=6*HITR/A.z();let bx=null,by=null,dx=tol,dy=tol;
  for(const q of G){if(q.o==='v'){const d=Math.abs(p.x-q.p);if(d<dx){dx=d;bx=q.p}}else{const d=Math.abs(p.y-q.p);if(d<dy){dy=d;by=q.p}}}
  if(bx===null&&by===null)return p;const o=Object.assign({},p);if(bx!==null){o.x=bx;o.sx=A.px()+bx*A.z()}if(by!==null){o.y=by;o.sy=A.py()+by*A.z()}return o}
{const _pt=pt;pt=function(e){const p=_pt(e);if(!doc||(tool&&(tool.brushCursor||tool.id==='hand'||tool.id==='zoom')))return p;return rgSnapPoint(RGP,p)};
 const _ip=ilPt;ilPt=function(e){const p=_ip(e);if(!IL.doc||(IL.tool&&['pencil','brush','blob','hand','zoom'].includes(IL.tool.id)))return p;return rgSnapPoint(RGI,p)};}
function rgCur(){return APP==='illust'?RGI:RGP}
function rgToggle(k){RG[k]=!RG[k];rgSave();rgRequest();toast({rulers:'눈금자',show:'안내선 표시',snap:'안내선에 물리기',lock:'안내선 잠금'}[k]+(RG[k]?' 켬':' 끔'),1000)}
function rgClear(){const R=rgCur(),A=rgApi(R);if(!A.d())return;A.guides().length=0;rgRequest()}
function rgEditDlg(R,q){R=R||rgCur();const A=rgApi(R);if(!A.d())return;
  const o=selBox([['h','가로'],['v','세로']],q?q.o:'v',()=>{},'width:100%');const n=numField('위치',q?q.p:0,'px');
  dialog({title:q?'안내선 편집':'새 안내선',width:320,content:b=>{b.append(h('div',{class:'prow'},h('span',{style:'width:56px'},'방향'),o.el||o),n.row);if(q)b.append(h('button',{class:'btn',onclick:()=>{const G=A.guides();G.splice(G.indexOf(q),1);rgRequest();modalOpen&&modalOpen.close(false)}},'이 안내선 삭제'))},
    onOk:()=>{const v=parseFloat(n.i.value);if(!isFinite(v))return;const ov=(o.value!==undefined?o.value:(o.el&&o.el.value))||'v';if(q){q.o=ov;q.p=v}else A.guides().push({o:ov,p:v});RG.show=true;rgSave();rgRequest()}});
}
// 캔버스 가운데·가장자리 안내선
function rgPreset(){const R=rgCur(),A=rgApi(R);const d=A.d();if(!d)return;let w,hh;if(R.app==='photo'){w=doc.w;hh=doc.h}else{const a=d.abs[d.ab];w=a.w;hh=a.h}
  const ox=R.app==='photo'?0:A.ox(),oy=R.app==='photo'?0:A.oy();const G=A.guides();for(const [o,p] of [['v',ox],['v',ox+w/2],['v',ox+w],['h',oy],['h',oy+hh/2],['h',oy+hh]])if(!G.some(q=>q.o===o&&Math.abs(q.p-p)<.01))G.push({o,p});RG.show=true;rgSave();rgRequest()}
// 단축키
document.addEventListener('keydown',e=>{if(modalOpen||isTextField(e.target))return;const ctrl=e.ctrlKey||e.metaKey;if(!ctrl)return;const K=keyOf(e);
  if(K==='r'&&!e.shiftKey&&!e.altKey){e.preventDefault();e.stopImmediatePropagation();rgToggle('rulers');return}
  if(K===';'){e.preventDefault();e.stopImmediatePropagation();rgToggle(e.altKey?'lock':e.shiftKey?'snap':'show')}},true);
// 보기 메뉴 항목 (Photo · Illust 메뉴에서 공유)
function rgMenuItems(have){return[mi('눈금자','Ctrl+R',()=>rgToggle('rulers'),null,{chk:()=>RG.rulers}),sub('안내선',[mi('안내선 표시','Ctrl+;',()=>rgToggle('show'),null,{chk:()=>RG.show}),mi('안내선에 물리기','Shift+Ctrl+;',()=>rgToggle('snap'),null,{chk:()=>RG.snap}),mi('안내선 잠금','Alt+Ctrl+;',()=>rgToggle('lock'),null,{chk:()=>RG.lock}),'-',mi('새 안내선...','',()=>rgEditDlg(null,null),have),mi('가운데·가장자리 안내선','',rgPreset,have),mi('안내선 지우기','',rgClear,have)]),'-']}
