/* ===== 드래그 중 탭 이동: 레이어를 끌고 다른 문서 탭에 멈추면 그 문서로 넘어가고, 놓으면 복사 ===== */
let tabHover=null,tabTimer=null,crossDrag=null;
function tabUnder(x,y){const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('.dtab'):null}
function hoverTab(t,onSwitch){if(t===tabHover)return;$$('.dtab.dragover').forEach(x=>x.classList.remove('dragover'));clearTimeout(tabTimer);tabHover=t;if(!t)return;const d=docs.find(x=>String(x.id)===t.dataset.doc);if(!d||d===doc)return;t.classList.add('dragover');tabTimer=setTimeout(()=>{tabHover=null;onSwitch(d)},380)}
function clearTabHover(){clearTimeout(tabTimer);tabHover=null;$$('.dtab.dragover').forEach(x=>x.classList.remove('dragover'))}
/* 옮길 내용 만들기 (원본 문서 기준) */
function payloadFromLayer(l,src){const c=cloneTree(l);const re=x=>{x.id=uid++;x.isBg=false;x.locked=false;if(x.children)x.children.forEach(re)};re(c);c._srcW=src.w;c._srcH=src.h;return c}
function shiftTree(l,dx,dy){if(l.type==='group'){l.children.forEach(c=>shiftTree(c,dx,dy));return}l.x+=dx;l.y+=dy;if(l.text){l.text={...l.text,x:l.text.x+dx,y:l.text.y+dy}}}
/* 이동 도구로 끄는 중에 호출 */
function crossCheck(e){if(docs.length<2)return false;const t=tabUnder(e.clientX,e.clientY);hoverTab(t,d=>startCross(d,e));return!!t}
function startCross(target,e){const src=doc;const mt=TOOLS.move;let payload;const p0=mt.start;if(mt.mode==='float'&&mt.float){const fl=mt.float;const b=alphaBounds(fl);if(!b){return}const c=mkCanvas(b.w,b.h);cx(c).drawImage(fl,-b.x,-b.y);payload=newLayer({name:mt.l.name+' 복사',canvas:c,x:mt.l.x+b.x,y:mt.l.y+b.y})}else if(mt.l){payload=payloadFromLayer(mt.l,src)}if(!payload)return;mt.start=null;src.selOffset=null;restoreHist(src.hIndex);switchDoc(target);crossDrag={payload,p0,name:payload.name};drag={cross:true};const p=pt(e);crossDrag.cur=p;requestDraw();toast(`"${payload.name}" 을(를) 캔버스에 놓으면 이 문서로 복사합니다`,1800)}
function crossMove(e){const p=pt(e);crossDrag.cur=p;const t=tabUnder(e.clientX,e.clientY);hoverTab(t,d=>{switchDoc(d);crossDrag.cur=pt(e);requestDraw()});requestDraw()}
function crossDrop(e){clearTabHover();const c=crossDrag;crossDrag=null;const el=document.elementFromPoint(e.clientX,e.clientY);if(!c||!el||!el.closest('#work')||!doc){requestDraw();toast('복사를 취소했습니다');return}const p=pt(e);const l=c.payload;shiftTree(l,Math.round(p.x-c.p0.x),Math.round(p.y-c.p0.y));delete l._srcW;delete l._srcH;insertLayer(l,null);doc.active=l;pushHist('레이어 가져오기');toast(`"${l.name}" 을(를) 복사했습니다`)}
function drawCross(g){const c=crossDrag;if(!c||!c.cur||!doc)return;const dx=c.cur.x-c.p0.x,dy=c.cur.y-c.p0.y;g.save();g.globalAlpha=.65;const z=doc.zoom;const paint=l=>{if(!l.visible)return;if(l.type==='group'){l.children.forEach(paint);return}const img=layerImg(l);if(!img)return;g.drawImage(img,doc.panX+(l.x+dx)*z,doc.panY+(l.y+dy)*z,img.width*z,img.height*z)};paint(c.payload);g.restore()}

/* 레이어 패널에서 끌어 탭/캔버스로 */
let dragLayerDoc=null;
document.addEventListener('dragstart',e=>{if(e.target.closest&&e.target.closest('.lrow'))dragLayerDoc=doc},true);
document.addEventListener('dragend',()=>{dragLayerDoc=null;clearTabHover()});
work.addEventListener('dragover',e=>{if(dragLayer){e.preventDefault();e.dataTransfer.dropEffect='copy'}});
work.addEventListener('drop',e=>{if(!dragLayer||!dragLayerDoc)return;e.preventDefault();e.stopPropagation();const src=dragLayerDoc;const l=payloadFromLayer(dragLayer,src);dragLayer=null;dragLayerDoc=null;if(src===doc){return}const p=pt(e);const prev=doc;doc=src;const img0=null;doc=prev;// 가운데를 놓은 지점에 맞춤
  let b=null;const meas=x=>{if(x.type==='group'){x.children.forEach(meas);return}const im=layerImg(x);if(!im)return;const r={x:x.x,y:x.y,x2:x.x+im.width,y2:x.y+im.height};b=b?{x:Math.min(b.x,r.x),y:Math.min(b.y,r.y),x2:Math.max(b.x2,r.x2),y2:Math.max(b.y2,r.y2)}:r};meas(l);if(b)shiftTree(l,Math.round(p.x-(b.x+b.x2)/2),Math.round(p.y-(b.y+b.y2)/2));insertLayer(l,null);pushHist('레이어 가져오기');toast(`"${l.name}" 을(를) 복사했습니다`)});

/* 탭 위로 끌기: 레이어면 문서 전환, 탭이면 순서 바꾸기 */
let dragTabDoc=null;
$('#tabs').addEventListener('dragstart',e=>{const t=e.target.closest('.dtab');if(!t)return;dragTabDoc=docs.find(x=>String(x.id)===t.dataset.doc);e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','tab')}catch(x){}});
$('#tabs').addEventListener('dragover',e=>{const t=e.target.closest('.dtab');if(dragTabDoc){e.preventDefault();if(!t)return;const d=docs.find(x=>String(x.id)===t.dataset.doc);if(!d||d===dragTabDoc)return;const r=t.getBoundingClientRect();const after=e.clientX>r.left+r.width/2;const i=docs.indexOf(dragTabDoc);docs.splice(i,1);let j=docs.indexOf(d)+(after?1:0);docs.splice(j,0,dragTabDoc);renderTabs();return}if(dragLayer){e.preventDefault();hoverTab(t,d=>switchDoc(d))}});
$('#tabs').addEventListener('drop',e=>{if(dragTabDoc){e.preventDefault();dragTabDoc=null;return}if(dragLayer&&dragLayerDoc){e.preventDefault();e.stopPropagation();const t=e.target.closest('.dtab');const d=t&&docs.find(x=>String(x.id)===t.dataset.doc);clearTabHover();if(!d||d===dragLayerDoc)return;const l=payloadFromLayer(dragLayer,dragLayerDoc);dragLayer=null;switchDoc(d);let b=null;const meas=x=>{if(x.type==='group'){x.children.forEach(meas);return}const im=layerImg(x);if(!im)return;const r={x:x.x,y:x.y,x2:x.x+im.width,y2:x.y+im.height};b=b?{x:Math.min(b.x,r.x),y:Math.min(b.y,r.y),x2:Math.max(b.x2,r.x2),y2:Math.max(b.y2,r.y2)}:r};meas(l);if(b)shiftTree(l,Math.round(doc.w/2-(b.x+b.x2)/2),Math.round(doc.h/2-(b.y+b.y2)/2));insertLayer(l,null);pushHist('레이어 가져오기');toast(`"${l.name}" 을(를) 가운데에 복사했습니다`)}});
$('#tabs').addEventListener('dragend',()=>{dragTabDoc=null});
