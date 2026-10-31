/* ===== 화면 (뷰) ===== */
const view=$('#view'),work=$('#work');let vctx=view.getContext('2d');let DPR=1,VW=0,VH=0;let drawQueued=false;let antsOff=0;let showPixelGrid=true,showSelEdges=true;
const ZOOMS=[1/32,1/24,1/16,1/12,1/8,1/6,1/4,1/3,1/2,2/3,1,2,3,4,5,6,7,8,12,16,24,32];
let checker=null;function checkerPat(){if(checker)return checker;const c=mkCanvas(16,16);const g=cx(c);g.fillStyle='#fff';g.fillRect(0,0,16,16);g.fillStyle='#cccccc';g.fillRect(0,0,8,8);g.fillRect(8,8,8,8);checker=vctx.createPattern(c,'repeat');return checker}
function resizeView(){DPR=window.devicePixelRatio||1;const r=work.getBoundingClientRect();VW=r.width;VH=r.height;view.width=Math.max(1,Math.round(VW*DPR));view.height=Math.max(1,Math.round(VH*DPR));checker=null;requestDraw()}
function requestDraw(){if(drawQueued)return;drawQueued=true;requestAnimationFrame(()=>{drawQueued=false;draw()})}
const toDoc=(sx,sy)=>({x:(sx-doc.panX)/doc.zoom,y:(sy-doc.panY)/doc.zoom});
const toScr=(x,y)=>({x:x*doc.zoom+doc.panX,y:y*doc.zoom+doc.panY});
function fitView(force100){if(!doc)return;resizeView();const z=force100?1:Math.min(1,(VW-40)/doc.w,(VH-40)/doc.h);setZoom(z,VW/2,VH/2,true)}
function fitScreen(){if(!doc)return;const z=Math.min((VW-40)/doc.w,(VH-40)/doc.h);setZoom(z,0,0,true)}
function setZoom(z,ax,ay,center){if(!doc)return;z=clamp(z,1/64,64);if(center){doc.zoom=z;doc.panX=Math.round((VW-doc.w*z)/2);doc.panY=Math.round((VH-doc.h*z)/2)}else{const p=toDoc(ax,ay);doc.zoom=z;doc.panX=ax-p.x*z;doc.panY=ay-p.y*z}clampPan();requestDraw();updateZoomUI();renderTabs()}
function clampPan(){const m=60;const dw=doc.w*doc.zoom,dh=doc.h*doc.zoom;if(dw<VW)doc.panX=clamp(doc.panX,-dw+m,VW-m);else doc.panX=clamp(doc.panX,VW-dw-VW/2,VW/2);if(dh<VH)doc.panY=clamp(doc.panY,-dh+m,VH-m);else doc.panY=clamp(doc.panY,VH-dh-VH/2,VH/2)}
function zoomStep(dir,ax=VW/2,ay=VH/2){if(!doc)return;const z=doc.zoom;let n;if(dir>0)n=ZOOMS.find(v=>v>z+1e-6)||64;else n=[...ZOOMS].reverse().find(v=>v<z-1e-6)||1/64;setZoom(n,ax,ay)}
const zpct=z=>(z*100>=10?Math.round(z*100*100)/100:(z*100).toFixed(2))+'%';
function updateZoomUI(){if(!doc)return;$('#zoomInp').value=zpct(doc.zoom);const s=$('#navZoom');if(s)s.value=Math.round((Math.log2(doc.zoom)+6)/12*100)}

let chanCache=null;
function channelView(){if(doc.channel==='rgb')return doc.comp;if(chanCache&&chanCache.src===doc.comp&&chanCache.ver===doc.compVer&&chanCache.ch===doc.channel)return chanCache.c;const c=cloneCanvas(doc.comp);const id=getData(c);const d=id.data;const k={r:0,g:1,b:2}[doc.channel];for(let i=0;i<d.length;i+=4){const v=d[i+k];d[i]=d[i+1]=d[i+2]=v}cx(c).putImageData(id,0,0);chanCache={src:doc.comp,ver:doc.compVer,ch:doc.channel,c};return c}

function draw(){const g=vctx;g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--paste')||'#000';g.fillRect(0,0,VW,VH);if(!doc)return;if(doc.dirty){composite();doc.compVer=(doc.compVer||0)+1}
  const z=doc.zoom,X=doc.panX,Y=doc.panY,W=doc.w*z,H=doc.h*z;
  g.save();g.translate(Math.round(X),Math.round(Y));g.fillStyle=checkerPat();g.fillRect(0,0,Math.round(W),Math.round(H));g.restore();
  g.imageSmoothingEnabled=z<1;g.imageSmoothingQuality='high';
  const src=channelView();
  // 화면에 보이는 영역만 그림
  const sx=Math.max(0,-X/z),sy=Math.max(0,-Y/z),ex=Math.min(doc.w,(VW-X)/z),ey=Math.min(doc.h,(VH-Y)/z);
  if(ex>sx&&ey>sy){const ix=Math.floor(sx),iy=Math.floor(sy),iw=Math.min(doc.w-ix,Math.ceil(ex)-ix+1),ih=Math.min(doc.h-iy,Math.ceil(ey)-iy+1);g.drawImage(src,ix,iy,iw,ih,X+ix*z,Y+iy*z,iw*z,ih*z)}
  if(showPixelGrid&&z>=8){g.strokeStyle='rgba(128,128,128,.35)';g.lineWidth=1;g.beginPath();for(let x=Math.ceil(sx);x<=ex;x++){const px=Math.round(X+x*z)+.5;g.moveTo(px,Math.max(0,Y));g.lineTo(px,Math.min(VH,Y+H))}for(let y=Math.ceil(sy);y<=ey;y++){const py=Math.round(Y+y*z)+.5;g.moveTo(Math.max(0,X),py);g.lineTo(Math.min(VW,X+W),py)}g.stroke()}
  // 마스크 편집 중이면 빨간 오버레이(\ 키)
  if(doc.showMaskOverlay&&doc.active&&doc.active.mask){const l=doc.active;const t=mkCanvas(l.mask.c.width,l.mask.c.height);const tg=cx(t);tg.fillStyle='rgba(255,0,0,.5)';tg.fillRect(0,0,t.width,t.height);tg.globalCompositeOperation='destination-out';tg.drawImage(l.mask.c,0,0);g.drawImage(t,X+(l.type==='group'?0:l.x)*z,Y+(l.type==='group'?0:l.y)*z,t.width*z,t.height*z)}
  // 선택 영역 개미 행렬
  if(doc.sel&&doc.selSegs&&showSelEdges){drawAnts(g,doc.selSegs,doc.selOffset||{x:0,y:0})}
  if(tool&&tool.overlay)tool.overlay(g);
  if(transient&&transient.overlay)transient.overlay(g);
  drawCross(g);drawCursor(g)}
function drawAnts(g,s,off){const z=doc.zoom,X=doc.panX+off.x*z,Y=doc.panY+off.y*z;g.save();g.lineWidth=1;g.beginPath();for(let i=0;i<s.length;i+=4){g.moveTo(Math.round(X+s[i]*z)+.5,Math.round(Y+s[i+1]*z)+.5);g.lineTo(Math.round(X+s[i+2]*z)+.5,Math.round(Y+s[i+3]*z)+.5)}g.strokeStyle='#fff';g.setLineDash([]);g.stroke();g.strokeStyle='#000';g.setLineDash([4,4]);g.lineDashOffset=-antsOff;g.stroke();g.restore()}
setInterval(()=>{if(doc&&doc.sel&&showSelEdges){antsOff=(antsOff+1)%8;requestDraw()}},120);

let cursorPos=null;
function drawCursor(g){if(!cursorPos||!tool||!tool.brushCursor||spaceDown)return;const r=Math.max(.5,(tool.sizeOf?tool.sizeOf():opts.size)/2*doc.zoom);g.save();g.beginPath();g.arc(cursorPos.x,cursorPos.y,r,0,Math.PI*2);g.lineWidth=1;g.strokeStyle='rgba(0,0,0,.8)';g.stroke();g.beginPath();g.arc(cursorPos.x,cursorPos.y,r+1,0,Math.PI*2);g.strokeStyle='rgba(255,255,255,.8)';g.stroke();if(r<4){g.beginPath();g.moveTo(cursorPos.x-5,cursorPos.y);g.lineTo(cursorPos.x+5,cursorPos.y);g.moveTo(cursorPos.x,cursorPos.y-5);g.lineTo(cursorPos.x,cursorPos.y+5);g.stroke()}g.restore()}

/* 오버레이 헬퍼 */
function strokeRectScr(g,x,y,w,hh,dash){const a=toScr(x,y),b=toScr(x+w,y+hh);g.save();g.lineWidth=1;g.strokeStyle='#fff';g.setLineDash([]);g.strokeRect(Math.round(a.x)+.5,Math.round(a.y)+.5,Math.round(b.x-a.x),Math.round(b.y-a.y));if(dash){g.strokeStyle='#000';g.setLineDash([4,4]);g.lineDashOffset=-antsOff;g.strokeRect(Math.round(a.x)+.5,Math.round(a.y)+.5,Math.round(b.x-a.x),Math.round(b.y-a.y))}g.restore()}
function handleBox(g,x,y){g.fillStyle='#fff';g.strokeStyle='#1f66c9';g.lineWidth=1;g.fillRect(Math.round(x)-4,Math.round(y)-4,8,8);g.strokeRect(Math.round(x)-3.5,Math.round(y)-3.5,8,8)}

/* ===== 내비게이터 · 히스토그램 · 정보 ===== */
let panelsQueued=false;function schedulePanels(){if(panelsQueued)return;panelsQueued=true;setTimeout(()=>{panelsQueued=false;drawNavigator();drawHistogram();renderLayersThumbsOnly()},180)}
function drawNavigator(){const c=$('#navCv');if(!c||c.offsetParent===null)return;const r=c.getBoundingClientRect();const dpr=DPR;c.width=r.width*dpr;c.height=r.height*dpr;const g=cx(c);g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#2b2b2b';g.fillRect(0,0,r.width,r.height);if(!doc)return;if(doc.dirty)composite();const s=Math.min((r.width-10)/doc.w,(r.height-10)/doc.h);const ox=(r.width-doc.w*s)/2,oy=(r.height-doc.h*s)/2;g.fillStyle=checkerPat();g.fillRect(ox,oy,doc.w*s,doc.h*s);g.imageSmoothingQuality='high';g.drawImage(doc.comp,ox,oy,doc.w*s,doc.h*s);const a=toDoc(0,0),b=toDoc(VW,VH);g.strokeStyle='#ff3b30';g.lineWidth=1.5;const rx=ox+clamp(a.x,0,doc.w)*s,ry=oy+clamp(a.y,0,doc.h)*s;g.strokeRect(rx,ry,(clamp(b.x,0,doc.w)-clamp(a.x,0,doc.w))*s,(clamp(b.y,0,doc.h)-clamp(a.y,0,doc.h))*s);c._map={s,ox,oy}}
function navPan(e){const c=$('#navCv');const m=c._map;if(!m||!doc)return;const r=c.getBoundingClientRect();const x=(e.clientX-r.left-m.ox)/m.s,y=(e.clientY-r.top-m.oy)/m.s;doc.panX=VW/2-x*doc.zoom;doc.panY=VH/2-y*doc.zoom;clampPan();requestDraw();drawNavigator()}
function drawHistogram(){const c=$('#histCv');if(!c||c.offsetParent===null)return;const r=c.getBoundingClientRect();c.width=r.width*DPR;c.height=r.height*DPR;const g=cx(c);g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#3b3b3b';g.fillRect(0,0,r.width,r.height);if(!doc)return;if(doc.dirty)composite();const H=calcHist(doc.comp);const ch=$('#histCh').value;const W=r.width,HH=r.height-4;const plot=(arr,col,mode)=>{let mx=0;const s=[...arr].sort((a,b)=>b-a);mx=s[3]||s[0]||1;g.fillStyle=col;g.globalCompositeOperation=mode||'source-over';g.beginPath();g.moveTo(0,HH);for(let i=0;i<256;i++)g.lineTo(i/255*W,HH-Math.min(1,arr[i]/mx)*HH);g.lineTo(W,HH);g.fill();g.globalCompositeOperation='source-over'};if(ch==='rgb'){plot(H.r,'rgba(255,60,60,.9)','screen');plot(H.g,'rgba(60,255,60,.9)','screen');plot(H.b,'rgba(80,80,255,.9)','screen')}else plot(H[ch],ch==='lum'?'#ddd':ch==='r'?'#f55':ch==='g'?'#5e5':'#66f')}
function calcHist(src){const s=Math.min(1,256/Math.max(src.width,src.height));const t=mkCanvas(src.width*s,src.height*s);cx(t).drawImage(src,0,0,t.width,t.height);const d=getData(t).data;const r=new Uint32Array(256),gg=new Uint32Array(256),b=new Uint32Array(256),l=new Uint32Array(256);for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;r[d[i]]++;gg[d[i+1]]++;b[d[i+2]]++;l[Math.round(lum(d[i],d[i+1],d[i+2]))]++}return{r,g:gg,b,lum:l}}
function updateInfo(p){const box=$('#infoBox');if(!box||!doc)return;let rgb=['','',''];if(p&&p.x>=0&&p.y>=0&&p.x<doc.w&&p.y<doc.h){if(doc.dirty)composite();const d=getData(doc.comp,Math.floor(p.x),Math.floor(p.y),1,1).data;rgb=d[3]?[d[0],d[1],d[2]]:['-','-','-']}const sb=doc.selBounds;box.innerHTML=`<span>R:</span><span>${rgb[0]}</span><span>X:</span><span>${p?Math.floor(p.x):''}</span><span>G:</span><span>${rgb[1]}</span><span>Y:</span><span>${p?Math.floor(p.y):''}</span><span>B:</span><span>${rgb[2]}</span><span>W:</span><span>${sb?sb.w:''}</span><span>8비트</span><span></span><span>H:</span><span>${sb?sb.h:''}</span>`;$('#stPos').textContent=p?`X ${Math.floor(p.x)}  Y ${Math.floor(p.y)}`:''}
