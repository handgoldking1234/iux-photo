// ===== 손가락으로 편한 자유 변형 (휴대폰·태블릿) =====
// - 네 모서리 큰 버튼: ✕ 삭제 / ↻ 돌리기 / ⇋ 좌우 뒤집기 / ⤡ 늘리고 줄이기(+돌리기)
// - 두 손가락으로 물체를 잡으면 크기·회전·위치를 한 번에 (물체 밖에서는 화면 확대)
// - 이동 도구로 물체를 톡 누르면 바로 선택 + 손잡이 표시, 바깥을 누르면 완료
// - 변형 중에는 아래에 완료·취소·복제·뒤집기·90°·삭제 막대
const TT={on:()=>TOUCH_UI,R:17};
const ttIco={
  del:'<path d="M18 6 6 18M6 6l12 12"/>',
  rot:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  flip:'<path d="M12 3v18"/><path d="M8 7 3 12l5 5zM16 7l5 5-5 5z"/>',
  size:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
};
const ttImg={};
for(const k in ttIco){const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#1d1d1d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ttIco[k]}</svg>`);ttImg[k]=im}
// 네 모서리: 0 왼쪽 위, 2 오른쪽 위, 4 오른쪽 아래, 6 왼쪽 아래
const TT_CORNER={0:'del',2:'rot',4:'size',6:'flip'};
// 모서리 버튼 위치 (화면 좌표). 물체가 작게 보이면 바깥쪽으로 밀어 물체를 가리지 않게
function ttBtnPos(S){const cxs=(S[0].x+S[4].x)/2,cys=(S[0].y+S[4].y)/2;const bw=Math.hypot(S[2].x-S[0].x,S[2].y-S[0].y),bh=Math.hypot(S[4].x-S[2].x,S[4].y-S[2].y);const push=Math.min(bw,bh)<110?TT.R+4:0;const o={};for(const i of [0,2,4,6]){const dx=S[i].x-cxs,dy=S[i].y-cys,l=Math.hypot(dx,dy)||1;o[i]={x:S[i].x+dx/l*push,y:S[i].y+dy/l*push}}return o}
function ttEnhance(T){
  if(!T||T.kind!=='transform'||T.ttDone)return;T.ttDone=true;
  const oHit=T.hit.bind(T),oDown=T.down.bind(T),oMove=T.move.bind(T),oOverlay=T.overlay.bind(T);
  const inBox=(p,m=0)=>{const s=T.st;const co=Math.cos(-s.rot),si=Math.sin(-s.rot);const dx=p.x-s.c.x,dy=p.y-s.c.y;const lx=dx*co-dy*si,ly=dx*si+dy*co;return Math.abs(lx)<=Math.abs(s.w0*s.sx)/2+m&&Math.abs(ly)<=Math.abs(s.h0*s.sy)/2+m};
  T.inBox=inBox;
  T.hit=function(p){
    if(!TT.on())return oHit(p);
    const{pts,hv}=this.corners();
    const B=ttBtnPos(pts.map(q=>toScr(q.x,q.y)));
    for(const i of [0,2,4,6]){if(Math.hypot(p.sx-B[i].x,p.sy-B[i].y)<TT.R+8)return{act:TT_CORNER[i]}}
    // 화면에서 작게 보이는 물체는 가운데 손잡이를 끄고 옮기기를 우선 (작은 글자도 잘 잡히게)
    const S=pts.map(q=>toScr(q.x,q.y));const bw=Math.hypot(S[2].x-S[0].x,S[2].y-S[0].y),bh=Math.hypot(S[4].x-S[2].x,S[4].y-S[2].y);
    for(const i of [1,3,5,7]){if((i===1||i===5)?bh<80:bw<80)continue;if(Math.hypot(p.sx-S[i].x,p.sy-S[i].y)<18)return{scale:hv[i]}}
    if(inBox(p,14/doc.zoom))return{move:true};
    return{outside:true};
  };
  T.down=function(p,e){
    if(!TT.on())return oDown(p,e);
    const h=this.hit(p);
    if(h.act==='del'){this.d=null;ttDelete();return}
    if(h.act==='flip'){this.d=null;this.st.sx=-this.st.sx;this.render();requestDraw();return}
    if(h.outside){this.d=null;const T2=this;setTimeout(()=>{if(transient===T2)T2.commit();ttTapSelect(p)},0);return}
    const st0=JSON.parse(JSON.stringify(this.st));
    if(h.act==='rot'){this.d={p,st:st0,rotate:true};return}
    if(h.act==='size'){this.d={p,st:st0,one:true};return}
    this.d={p,st:st0,...h};
  };
  T.move=function(p,e){
    const d=this.d;if(!d)return;
    if(d.one){const s0=d.st,s=this.st;const v0x=d.p.x-s0.c.x,v0y=d.p.y-s0.c.y,v1x=p.x-s0.c.x,v1y=p.y-s0.c.y;const l0=Math.hypot(v0x,v0y)||1;const k=Math.max(.02,Math.hypot(v1x,v1y)/l0);
      let da=Math.atan2(v1y,v1x)-Math.atan2(v0y,v0x);let r=s0.rot+da;r=ttSnap(r);s.sx=s0.sx*k;s.sy=s0.sy*k;s.rot=r;s.c={...s0.c};this.render();ttBadge(this);return}
    oMove(p,e);if(d.rotate){this.st.rot=ttSnap(this.st.rot);this.render()}ttBadge(this);
  };
  const oUp=T.up.bind(T);T.up=function(p,e){oUp(p,e);ttBadge(null)};
  T.overlay=function(g){
    if(!TT.on())return oOverlay(g);
    const{pts}=this.corners();const S=pts.map(q=>toScr(q.x,q.y));
    g.save();g.strokeStyle='#ffffff';g.lineWidth=1.5;g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=3;g.beginPath();[0,2,4,6].forEach((i,k)=>k?g.lineTo(S[i].x,S[i].y):g.moveTo(S[i].x,S[i].y));g.closePath();g.stroke();
    const bw=Math.hypot(S[2].x-S[0].x,S[2].y-S[0].y),bh=Math.hypot(S[4].x-S[2].x,S[4].y-S[2].y);
    for(const i of [1,3,5,7]){if((i===1||i===5)?bh<80:bw<80)continue;g.fillStyle='#fff';g.strokeStyle='#2f87e6';g.lineWidth=2;g.beginPath();g.arc(S[i].x,S[i].y,6,0,7);g.fill();g.stroke()}
    const B=ttBtnPos(S);
    for(const i of [0,2,4,6]){const k=TT_CORNER[i],q=B[i];if(q.x!==S[i].x||q.y!==S[i].y){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1;g.beginPath();g.moveTo(S[i].x,S[i].y);g.lineTo(q.x,q.y);g.stroke()}g.shadowBlur=6;g.fillStyle=k==='del'?'#ffe3ea':'#fff';g.beginPath();g.arc(q.x,q.y,TT.R,0,7);g.fill();g.shadowBlur=0;g.strokeStyle=k==='del'?'#ff4d6d':'#2f87e6';g.lineWidth=1.5;g.stroke();const im=ttImg[k];if(im.complete)g.drawImage(im,q.x-10,q.y-10,20,20)}
    g.restore();
  };
}
// 0°·90°·180°·270° 근처에서 살짝 붙기
function ttSnap(r){const q=Math.PI/2;const n=Math.round(r/q)*q;return Math.abs(r-n)<.05?n:r}
// 각도·크기 알림
const ttBadgeEl=h('div',{id:'ttBadge',hidden:true});document.body.append(ttBadgeEl);
function ttBadge(T){if(!T){ttBadgeEl.hidden=true;return}const s=T.st;let deg=Math.round(s.rot*180/Math.PI)%360;if(deg>180)deg-=360;if(deg<-180)deg+=360;ttBadgeEl.textContent=`${Math.round(Math.abs(s.sx)*100)}%  ·  ${deg}°`;ttBadgeEl.hidden=false}
function ttDelete(){const T=transient;if(T&&T.kind==='transform'){T.cancel()}cmdDeleteLayer();ttSync();requestDraw()}
// 탭해서 물체 고르기
function ttTapSelect(p){
  if(!doc||!TT.on()||tool.id!=='move')return;
  const l=hitLayer(p);
  if(!l||l.isBg||l.locked||l.type==='adjust'){ttSync();return}
  doc.active=l;refreshAll();startTransform();
}
// 배경 레이어도 손가락 변형이 되도록 일반 레이어로 바꿔 줌
(function(){
  const _st=startTransform;
  startTransform=function(afterPlace,initScale){
    if(doc&&TT.on()){const l=doc.active;if(l&&l.isBg&&l.type!=='group'){l.isBg=false;l.locked=false;if(l.name==='배경')l.name='레이어 0';refreshAll();toast('배경을 일반 레이어로 바꿨습니다',1400)}}
    const l0=doc&&doc.active;const keep=l0&&l0.type==='text'?{l:l0,raw:l0.raw,canvas:l0.canvas,x:l0.x,y:l0.y}:null;
    const r=_st.apply(this,arguments);const T=transient;
    if(T&&T.kind==='transform'&&T.l===l0){
      // 글자 레이어: 옮기기만 했거나 그대로 끝내면 글자를 살려 둠 (크기·회전을 바꿨을 때만 이미지로 바뀜)
      if(keep){const s0=JSON.parse(JSON.stringify(T.st));const oc=T.cancel.bind(T),om=T.commit.bind(T);
        const restore=(dx=0,dy=0)=>{const l=keep.l;l.type='text';l.raw=keep.raw;l.canvas=keep.canvas;l.x=keep.x+dx;l.y=keep.y+dy;if(l.text&&(dx||dy)){l.text.x=(l.text.x||0)+dx;l.text.y=(l.text.y||0)+dy}l._mk=null};
        T.cancel=function(){oc();restore();markDirty();refreshAll()};
        T.commit=function(){const s=this.st;const same=Math.abs(s.sx-s0.sx)<1e-6&&Math.abs(s.sy-s0.sy)<1e-6&&Math.abs(s.rot-s0.rot)<1e-6;
          if(!same)return om();const dx=Math.round(s.c.x-s0.c.x),dy=Math.round(s.c.y-s0.c.y);oc();restore(dx,dy);if(dx||dy)pushHist('이동');else{markDirty();refreshAll()}}}
      ttEnhance(T);
    }
    ttSync();requestDraw();return r;
  };
  const _ro=renderOptions;renderOptions=function(){const r=_ro.apply(this,arguments);ttSync();return r};
})();

// 변형 중 아래 막대
const ttBar=h('div',{id:'ttBar',hidden:true});
const ttBtn=(ic,t,fn,cls)=>h('button',{class:'ttB'+(cls?' '+cls:''),'aria-label':t,onclick:e=>{e.stopPropagation();fn()}},h('span',{class:'ic',html:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ic}</svg>`}),h('span',{class:'lb'},t));
ttBar.append(
  ttBtn('<path d="M18 6 6 18M6 6l12 12"/>','취소',()=>{const T=transient;if(T&&T.kind==='transform')T.cancel();ttSync();requestDraw()}),
  ttBtn('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>','복제',()=>{const T=transient;if(!T||T.kind!=='transform')return;T.commit();cmdDupLayer();const l=doc.active;l.x+=Math.round(20/doc.zoom);l.y+=Math.round(20/doc.zoom);l._mk=null;refreshAll();startTransform()}),
  ttBtn(ttIco.flip,'뒤집기',()=>{const T=transient;if(!T||T.kind!=='transform')return;T.st.sx=-T.st.sx;T.render();requestDraw()}),
  ttBtn('<path d="M3 12a9 9 0 1 0 9-9"/><path d="M12 3 9 6l3 3"/>','90°',()=>{const T=transient;if(!T||T.kind!=='transform')return;T.st.rot=ttSnap(T.st.rot+Math.PI/2);T.render();requestDraw()}),
  ttBtn('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>','삭제',ttDelete,'ttDel'),
  ttBtn('<path d="M20 6 9 17l-5-5"/>','완료',()=>{const T=transient;if(T&&T.kind==='transform')T.commit();ttSync();requestDraw()},'ttOk'),
);
document.body.append(ttBar);
function ttSync(){const on=!!(TT.on()&&typeof transient!=='undefined'&&transient&&transient.kind==='transform');ttBar.hidden=!on;document.body.classList.toggle('ttActive',on);if(!on)ttBadge(null)}

// 두 손가락으로 물체 잡기 / 이동 도구 탭 선택 — 화면 확대보다 먼저 받음
(function(){
  const P=new Map();let G=null,tap=null;
  window.ttBlockLong=()=>!!G||(typeof transient!=='undefined'&&!!transient&&transient.kind==='transform');
  const docPt=e=>pt(e);
  const isT=()=>typeof transient!=='undefined'&&transient&&transient.kind==='transform';
  window.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch'||!doc||APP!=='photo'||e.target!==view)return;
    P.set(e.pointerId,e);
    if(P.size===1){tap={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),moved:0}}else tap=null;
    if(P.size===2&&isT()){
      const T=transient;const[a,b]=[...P.values()].map(docPt);const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
      if(!(T.inBox&&(T.inBox(a,30/doc.zoom)||T.inBox(b,30/doc.zoom)||T.inBox(m,30/doc.zoom))))return; // 물체 밖 → 화면 확대
      e.stopImmediatePropagation();e.preventDefault();
      if(T.d&&T.d.st){T.st=JSON.parse(JSON.stringify(T.d.st));T.render()}T.d=null;drag=null;
      G={T,a0:a,b0:b,st:JSON.parse(JSON.stringify(T.st)),ids:[...P.keys()]};
    }else if(G)e.stopImmediatePropagation();
  },true);
  window.addEventListener('pointermove',e=>{
    if(e.pointerType!=='touch'||!P.has(e.pointerId))return;P.set(e.pointerId,e);
    if(tap&&tap.id===e.pointerId)tap.moved=Math.max(tap.moved,Math.hypot(e.clientX-tap.x,e.clientY-tap.y));
    if(!G)return;e.stopImmediatePropagation();e.preventDefault();
    if(!G.ids.every(id=>P.has(id)))return;
    const a=docPt(P.get(G.ids[0])),b=docPt(P.get(G.ids[1]));
    const d0=Math.hypot(G.b0.x-G.a0.x,G.b0.y-G.a0.y)||1,d1=Math.hypot(b.x-a.x,b.y-a.y)||1;const k=d1/d0;
    const da=Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(G.b0.y-G.a0.y,G.b0.x-G.a0.x);
    const m0={x:(G.a0.x+G.b0.x)/2,y:(G.a0.y+G.b0.y)/2},m1={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    const s0=G.st,s=G.T.st;const vx=(s0.c.x-m0.x)*k,vy=(s0.c.y-m0.y)*k;const co=Math.cos(da),si=Math.sin(da);
    s.c={x:m1.x+vx*co-vy*si,y:m1.y+vx*si+vy*co};s.sx=s0.sx*k;s.sy=s0.sy*k;s.rot=ttSnap(s0.rot+da);
    G.T.render();requestDraw();ttBadge(G.T);
  },true);
  const up=e=>{
    if(e.pointerType!=='touch'||!P.has(e.pointerId))return;P.delete(e.pointerId);
    if(G){/* 손 떼기는 그대로 흘려보내 다른 처리기도 손가락 목록을 정리하게 함 */if(!P.size){G=null;ttBadge(null);drag=null}return}
    // 이동 도구로 톡 → 그 물체 선택 + 손잡이
    if(e.type==='pointerup'&&tap&&tap.id===e.pointerId&&tap.moved<8&&performance.now()-tap.t<350&&!P.size&&!isT()&&tool.id==='move'&&TT.on()){
      const p=pt(e);setTimeout(()=>{if(!isT())ttTapSelect(p)},0);
    }
    if(!P.size)tap=null;
  };
  window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);
})();

// ===== 자동 선택: 글자 사이·작은 물체 주변을 눌러도 그 레이어가 잡히게 =====
// 픽셀이 칠해진 곳을 먼저 찾고, 없으면 글자 레이어나 작은 레이어의 네모 영역(살짝 여유)으로 찾음. 위 레이어부터.
const ttBoundsCache=new WeakMap();
function ttBounds(img){let b=ttBoundsCache.get(img);if(b===undefined){b=alphaBounds(img);ttBoundsCache.set(img,b)}return b}
hitLayer=function(p){
  const x=Math.floor(p.x),y=Math.floor(p.y);const pad=8/(doc.zoom||1);const big=doc.w*doc.h*.15;
  for(const l of flat()){
    if(l.type==='group'||!l.visible||l.type==='adjust')continue;
    let hidden=false;let q=parentOf(l);while(q&&q!==doc.root){if(!q.visible)hidden=true;q=parentOf(q)}if(hidden)continue;
    if(l.isBg)continue;
    const img=layerImg(l);if(!img)continue;const lx=x-l.x,ly=y-l.y;
    if(lx>=0&&ly>=0&&lx<img.width&&ly<img.height&&getData(img,lx,ly,1,1).data[3]>10)return l;
    const b=ttBounds(img);if(!b)continue;
    if(l.type!=='text'&&b.w*b.h>big)continue;
    if(lx>=b.x-pad&&lx<=b.x+b.w+pad&&ly>=b.y-pad&&ly<=b.y+b.h+pad)return l;
  }
  return null;
};
