'use strict';
/* ===== 기본 유틸 ===== */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const h=(tag,attrs,...kids)=>{const e=document.createElement(tag);if(attrs)for(const k in attrs){const v=attrs[k];if(v==null||v===false)continue;if(k==='class')e.className=v;else if(k==='style')e.style.cssText=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(k==='html')e.innerHTML=v;else e.setAttribute(k,v===true?'':v)}for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c))}return e};
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
function cx(c){return c.getContext('2d')}
function cloneCanvas(c){const n=mkCanvas(c.width,c.height);n.getContext('2d').drawImage(c,0,0);return n}
function getData(c,x=0,y=0,w=c.width,h=c.height){return c.getContext('2d',{willReadFrequently:true}).getImageData(x,y,w,h)}
const FILTER_OK=(()=>{try{const c=mkCanvas(1,1).getContext('2d');c.filter='blur(1px)';return c.filter==='blur(1px)'}catch(e){return false}})();
const fmtMB=b=>b>=1048576?(b/1048576).toFixed(1)+'M':Math.max(1,Math.round(b/1024))+'K';
const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};

/* ===== 아이콘 (Lucide 계열 선 아이콘) ===== */
const IC={
move:'<path d="M12 2v20M2 12h20M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3M19 9l3 3-3 3"/>',
rect:'<rect x="4" y="5" width="16" height="14" stroke-dasharray="3 2.4"/>',
ellipse:'<ellipse cx="12" cy="12" rx="9" ry="7" stroke-dasharray="3 2.4"/>',
lasso:'<path d="M7 22c0-2 2-3 2-5"/><path d="M9.5 16.6C5.7 15.8 3 13.6 3 11c0-3.9 4-7 9-7s9 3.1 9 7-4 7-9 7c-.9 0-1.8-.1-2.5-.3"/><circle cx="9" cy="17" r="1.6"/>',
plasso:'<path d="M4 18L6 5l8 3 6-2-2 9-8 3"/><circle cx="7" cy="19" r="1.6"/>',
wand:'<path d="M3 21L14 10"/><path d="M15 3v3M20.5 5.5l-2 2M21 11h-3M10 5.5l2 2M17 9l-2 2"/>',
crop:'<path d="M6 2v16h16"/><path d="M2 6h16v16"/>',
eyedropper:'<path d="M2 22l1-4 9-9 3 3-9 9z"/><path d="M14 7l3-3a2.1 2.1 0 013 3l-3 3"/><path d="M12 5l7 7"/>',
heal:'<path d="M10.5 3.5l10 10a3.5 3.5 0 01-5 5l-10-10a3.5 3.5 0 015-5z"/><path d="M8 13l5-5"/><path d="M11 11.2v.1M12.8 13v.1M9.4 9.5v.1"/>',
brush:'<path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 00-3-3.02z"/>',
pencil:'<path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/>',
stamp:'<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0017.5 13h-11A2.5 2.5 0 004 15.5V17a1 1 0 001 1h14a1 1 0 001-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 00-6 0c0 2 1 2 1 3.5V13"/>',
eraser:'<path d="M7 21l-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7M5 11l9 9"/>',
gradient:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M8 5v14" opacity=".35"/><path d="M12.5 5v14" opacity=".6"/><path d="M17 5v14"/>',
bucket:'<path d="M19 11l-8-8-8.6 8.6a2 2 0 000 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="M5 2l5 5M2 13h15"/><path d="M22 20a2 2 0 11-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>',
blur:'<path d="M12 22a7 7 0 007-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 007 7z"/>',
sharpen:'<path d="M12 3l9 17H3z"/>',
dodge:'<circle cx="9" cy="9" r="5.5"/><path d="M13 13l8 8"/>',
burn:'<path d="M8 13V5a2 2 0 014 0v6"/><path d="M12 11V4a2 2 0 014 0v7"/><path d="M16 11V7a2 2 0 014 0v7a7 7 0 01-7 7h-1a7 7 0 01-6-3l-2-4a2 2 0 013-2l1 2"/>',
sponge:'<rect x="4" y="6" width="16" height="12" rx="3"/><circle cx="9" cy="11" r="1"/><circle cx="14" cy="13.5" r="1"/><circle cx="15.5" cy="9" r=".8"/>',
type:'<path d="M4 7V4h16v3"/><path d="M9 20h6M12 4v16"/>',
shapeRect:'<rect x="3" y="5" width="18" height="14" rx="1"/>',
shapeEll:'<ellipse cx="12" cy="12" rx="9" ry="7"/>',
shapeLine:'<path d="M4 20L20 4"/>',
hand:'<path d="M18 11V6a2 2 0 00-4 0"/><path d="M14 10V4a2 2 0 00-4 0v2"/><path d="M10 10.5V6a2 2 0 00-4 0v8"/><path d="M18 8a2 2 0 114 0v6a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15"/>',
zoom:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
zoomIn:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/>',
zoomOut:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
home:'<path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
swap:'<path d="M6 4h8a5 5 0 015 5v8"/><path d="M16 14l3 3 3-3"/><path d="M9 1L6 4l3 3"/>',
def:'<rect x="3" y="3" width="10" height="10" fill="currentColor"/><rect x="9" y="9" width="10" height="10"/>',
lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
lockT:'<rect x="4" y="4" width="16" height="16"/><path d="M4 4h8v8H4zM12 12h8v8h-8z" fill="currentColor" opacity=".45" stroke="none"/>',
link:'<path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/>',
fx:'<path d="M5 20c2 0 3-1 3.5-4L10 7c.5-3 1.5-4 3.5-4"/><path d="M6 10h7"/><path d="M14 13l6 7M20 13l-6 7"/>',
mask:'<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="12" cy="12" r="4"/>',
adjL:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 010 17z" fill="currentColor"/>',
folder:'<path d="M20 20a2 2 0 002-2V8a2 2 0 00-2-2h-7.9a2 2 0 01-1.69-.9L9.6 3.9A2 2 0 007.93 3H4a2 2 0 00-2 2v13a2 2 0 002 2Z"/>',
newL:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 8v8M8 12h8"/>',
trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
history:'<path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
char:'<path d="M3 20l6-16 6 16M5.4 14h7.2"/><path d="M19 4v16"/>',
para:'<path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 000 9H13"/>',
brushes:'<path d="M14 4l6 6"/><path d="M3 21c3 0 6-1 6-4a3 3 0 00-3-3c-2 0-3 2-3 4"/><path d="M9 14L20 3"/>',
layers:'<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/>',
nav:'<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="8" y="8" width="8" height="8"/>',
histo:'<path d="M3 21h18"/><path d="M5 21V12M9 21V6M13 21V10M17 21V4M21 21v-7"/>',
panel:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>',
chevR:'<path d="M9 6l6 6-6 6"/>', chevD:'<path d="M6 9l6 6 6-6"/>',
check:'<path d="M20 6L9 17l-5-5"/>', x:'<path d="M18 6L6 18M6 6l12 12"/>',
selNew:'<rect x="5" y="5" width="14" height="14" fill="currentColor" stroke="none"/>',
selAdd:'<rect x="3" y="3" width="11" height="11" fill="currentColor" stroke="none"/><rect x="10" y="10" width="11" height="11" fill="currentColor" stroke="none"/>',
selSub:'<rect x="3" y="3" width="13" height="13" fill="currentColor" stroke="none"/><rect x="10" y="10" width="11" height="11"/>',
selInt:'<rect x="3" y="3" width="13" height="13"/><rect x="8" y="8" width="13" height="13"/><rect x="8" y="8" width="8" height="8" fill="currentColor" stroke="none"/>',
rotL:'<path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
flipH:'<path d="M12 3v18"/><path d="M8 7L3 12l5 5z"/><path d="M16 7l5 5-5 5z" fill="currentColor"/>',
undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',
play:'<path d="M6 4l14 8-14 8z"/>',
cloudUp:'<path d="M12 13v8M8 17l4-4 4 4"/><path d="M20 16.6A5 5 0 0018 7h-1.3A8 8 0 104 15.3"/>'
};
function icon(n,cls='i'){return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`}
function iconEl(n,cls){const s=document.createElement('span');s.style.display='contents';s.innerHTML=icon(n,cls);return s.firstChild}

/* ===== 색 ===== */
function hex2rgb(x){x=String(x).replace('#','');if(x.length===3)x=x.split('').map(c=>c+c).join('');const n=parseInt(x,16)||0;return[(n>>16)&255,(n>>8)&255,n&255]}
function rgb2hex(r,g,b){return'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}
function rgb2hsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let hh=0;if(d){if(mx===r)hh=((g-b)/d)%6;else if(mx===g)hh=(b-r)/d+2;else hh=(r-g)/d+4;hh*=60;if(hh<0)hh+=360}return[hh,mx?d/mx:0,mx]}
function hsv2rgb(hh,s,v){const c=v*s,x=c*(1-Math.abs((hh/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(hh<60)[r,g,b]=[c,x,0];else if(hh<120)[r,g,b]=[x,c,0];else if(hh<180)[r,g,b]=[0,c,x];else if(hh<240)[r,g,b]=[0,x,c];else if(hh<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];return[(r+m)*255,(g+m)*255,(b+m)*255]}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let hh=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)hh=(g-b)/d+(g<b?6:0);else if(mx===g)hh=(b-r)/d+2;else hh=(r-g)/d+4;hh/=6}return[hh,s,l]}
function hsl2rgb(hh,s,l){if(!s){const v=l*255;return[v,v,v]}const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;const f=t=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};return[f(hh+1/3)*255,f(hh)*255,f(hh-1/3)*255]}
function lum(r,g,b){return .299*r+.587*g+.114*b}

/* ===== 흐림 (가장자리 유지 박스 3회 = 가우시안 근사) ===== */
function boxesForGauss(sigma,n){const wIdeal=Math.sqrt((12*sigma*sigma/n)+1);let wl=Math.floor(wIdeal);if(wl%2===0)wl--;const wu=wl+2;const mIdeal=(12*sigma*sigma-n*wl*wl-4*n*wl-3*n)/(-4*wl-4);const m=Math.round(mIdeal);const s=[];for(let i=0;i<n;i++)s.push(i<m?wl:wu);return s}
function boxH(src,dst,w,h,r){const iarr=1/(r+r+1);for(let i=0;i<h;i++){let ti=i*w,li=ti,ri=ti+r;const fv=src[ti],lv=src[ti+w-1];let val=(r+1)*fv;for(let j=0;j<r;j++)val+=src[ti+Math.min(j,w-1)];for(let j=0;j<=r;j++){val+=src[Math.min(ri,ti+w-1)]-fv;ri++;dst[ti++]=val*iarr}for(let j=r+1;j<w-r;j++){val+=src[ri++]-src[li++];dst[ti++]=val*iarr}for(let j=Math.max(w-r,r+1);j<w;j++){val+=lv-src[li++];dst[ti++]=val*iarr}}}
function boxT(src,dst,w,h,r){const iarr=1/(r+r+1);for(let i=0;i<w;i++){let ti=i,li=ti,ri=ti+r*w;const fv=src[ti],lv=src[ti+w*(h-1)];let val=(r+1)*fv;for(let j=0;j<r;j++)val+=src[ti+Math.min(j,h-1)*w];for(let j=0;j<=r;j++){val+=src[Math.min(ri,ti+w*(h-1))]-fv;ri+=w;dst[ti]=val*iarr;ti+=w}for(let j=r+1;j<h-r;j++){val+=src[ri]-src[li];ri+=w;li+=w;dst[ti]=val*iarr;ti+=w}for(let j=Math.max(h-r,r+1);j<h;j++){val+=lv-src[li];li+=w;dst[ti]=val*iarr;ti+=w}}}
function blurChannel(ch,w,h,sigma){if(sigma<.3)return;const tmp=new Float32Array(ch.length);const bx=boxesForGauss(sigma,3);let a=ch,b=tmp;for(const bs of bx){const r=Math.min((bs-1)>>1,Math.max(1,Math.min(w,h)-1));if(r<1)continue;boxH(a,b,w,h,r);boxT(b,a,w,h,r)}}
/* RGBA ImageData 흐림. premultiplied로 처리해 투명 가장자리 번짐 방지 */
function blurImageData(id,sigma){const{data:d,width:w,height:hh}=id;const n=w*hh;const A=new Float32Array(n);for(let i=0;i<n;i++)A[i]=d[i*4+3];const C=new Float32Array(n);const hasA=A.some(v=>v<255);for(let c=0;c<3;c++){for(let i=0;i<n;i++)C[i]=d[i*4+c]*(hasA?A[i]/255:1);blurChannel(C,w,hh,sigma);if(c===0&&hasA){}for(let i=0;i<n;i++)d[i*4+c]=C[i]}if(hasA){blurChannel(A,w,hh,sigma);for(let i=0;i<n;i++){const a=A[i];d[i*4+3]=a;if(a>0)for(let c=0;c<3;c++)d[i*4+c]=Math.min(255,d[i*4+c]*255/a)}}return id}
function blurCanvas(c,sigma,fast){const out=mkCanvas(c.width,c.height);if(sigma<=0){cx(out).drawImage(c,0,0);return out}if(fast&&FILTER_OK){const g=cx(out);g.filter=`blur(${sigma}px)`;g.drawImage(c,0,0);g.filter='none';return out}const id=getData(c);blurImageData(id,sigma);cx(out).putImageData(id,0,0);return out}

/* ===== 흐름 채우기 (자동 선택 / 페인트 통) ===== */
function floodMask(id,sx,sy,tol,contiguous){const{data:d,width:w,height:hh}=id;const m=new Uint8Array(w*hh);if(sx<0||sy<0||sx>=w||sy>=hh)return m;const p0=(sy*w+sx)*4;const tr=d[p0],tg=d[p0+1],tb=d[p0+2],ta=d[p0+3];const T=tol;const ok=i=>{const p=i*4;if(ta===0&&d[p+3]===0)return true;return Math.abs(d[p]-tr)<=T&&Math.abs(d[p+1]-tg)<=T&&Math.abs(d[p+2]-tb)<=T&&Math.abs(d[p+3]-ta)<=T};if(!contiguous){for(let i=0;i<w*hh;i++)if(ok(i))m[i]=1;return m}const st=[sx,sy];while(st.length){let y=st.pop(),x=st.pop();let i=y*w+x;while(x>=0&&!m[i]&&ok(i)){x--;i--}x++;i++;let up=false,dn=false;while(x<w&&!m[i]&&ok(i)){m[i]=1;if(y>0){const j=i-w;if(!m[j]&&ok(j)){if(!up){st.push(x,y-1);up=true}}else up=false}if(y<hh-1){const j=i+w;if(!m[j]&&ok(j)){if(!dn){st.push(x,y+1);dn=true}}else dn=false}x++;i++}}return m}
function maskToCanvas(m,w,hh){const c=mkCanvas(w,hh);const id=cx(c).createImageData(w,hh);const d=id.data;for(let i=0;i<m.length;i++)if(m[i]){d[i*4]=d[i*4+1]=d[i*4+2]=0;d[i*4+3]=m[i]===1?255:m[i]}cx(c).putImageData(id,0,0);return c}

/* ===== 내용 인식 채우기 / 스팟 복구 (피라미드 확산 + 질감 패치) ===== */
function inpaint(id,mask){const{data:d,width:w,height:hh}=id;const n=w*hh;
  // 레벨 0
  let lv=[{w,h:hh,c:new Float32Array(n*4),m:new Uint8Array(n)}];
  for(let i=0;i<n;i++){const k=mask[i]?0:1;lv[0].m[i]=k;if(k)for(let c=0;c<4;c++)lv[0].c[i*4+c]=d[i*4+c]}
  while(true){const L=lv[lv.length-1];if(L.w<=4&&L.h<=4)break;let any=false;for(let i=0;i<L.w*L.h;i++)if(!L.m[i]){any=true;break}if(!any)break;const nw=Math.max(1,Math.ceil(L.w/2)),nh=Math.max(1,Math.ceil(L.h/2));const N={w:nw,h:nh,c:new Float32Array(nw*nh*4),m:new Uint8Array(nw*nh)};for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){let cnt=0;const s=[0,0,0,0];for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const X=x*2+dx,Y=y*2+dy;if(X>=L.w||Y>=L.h)continue;const j=Y*L.w+X;if(L.m[j]){cnt++;for(let c=0;c<4;c++)s[c]+=L.c[j*4+c]}}const i=y*nw+x;if(cnt){N.m[i]=1;for(let c=0;c<4;c++)N.c[i*4+c]=s[c]/cnt}}lv.push(N);if(nw===1&&nh===1)break}
  // 가장 거친 레벨: 이웃 평균으로 번져 채움
  const top=lv[lv.length-1];{let guard=0;while(guard++<5000){let left=0;const nm=top.m.slice();for(let y=0;y<top.h;y++)for(let x=0;x<top.w;x++){const i=y*top.w+x;if(top.m[i])continue;let cnt=0;const s=[0,0,0,0];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=top.w||Y>=top.h)continue;const j=Y*top.w+X;if(top.m[j]){cnt++;for(let c=0;c<4;c++)s[c]+=top.c[j*4+c]}}if(cnt){for(let c=0;c<4;c++)top.c[i*4+c]=s[c]/cnt;nm[i]=1}else left++}top.m=nm;if(!left)break}}
  // 위로 올라가며 보간 + 확산 반복
  for(let k=lv.length-2;k>=0;k--){const L=lv[k],C=lv[k+1];const unk=[];for(let y=0;y<L.h;y++)for(let x=0;x<L.w;x++){const i=y*L.w+x;if(L.m[i])continue;unk.push(i);const j=Math.min(C.h-1,y>>1)*C.w+Math.min(C.w-1,x>>1);for(let c=0;c<4;c++)L.c[i*4+c]=C.c[j*4+c]}const it=k===0?40:24;for(let t=0;t<it;t++){for(const i of unk){const x=i%L.w,y=(i/L.w)|0;let cnt=0,s0=0,s1=0,s2=0,s3=0;if(x>0){const j=(i-1)*4;s0+=L.c[j];s1+=L.c[j+1];s2+=L.c[j+2];s3+=L.c[j+3];cnt++}if(x<L.w-1){const j=(i+1)*4;s0+=L.c[j];s1+=L.c[j+1];s2+=L.c[j+2];s3+=L.c[j+3];cnt++}if(y>0){const j=(i-L.w)*4;s0+=L.c[j];s1+=L.c[j+1];s2+=L.c[j+2];s3+=L.c[j+3];cnt++}if(y<L.h-1){const j=(i+L.w)*4;s0+=L.c[j];s1+=L.c[j+1];s2+=L.c[j+2];s3+=L.c[j+3];cnt++}const p=i*4;L.c[p]=s0/cnt;L.c[p+1]=s1/cnt;L.c[p+2]=s2/cnt;L.c[p+3]=s3/cnt}}for(const i of unk)L.m[i]=1}
  const out=lv[0].c;
  // 질감: 테두리가 가장 잘 맞는 주변 위치의 고주파 성분을 더함
  let x0=w,y0=hh,x1=0,y1=0,cntM=0;for(let i=0;i<n;i++)if(mask[i]){const x=i%w,y=(i/w)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;cntM++}
  if(cntM){const mw=x1-x0+1,mh=y1-y0+1;const ring=[];for(let y=Math.max(0,y0-3);y<=Math.min(hh-1,y1+3);y+=1)for(let x=Math.max(0,x0-3);x<=Math.min(w-1,x1+3);x+=1){const i=y*w+x;if(mask[i])continue;let near=false;for(let dy=-3;dy<=3&&!near;dy+=3)for(let dx=-3;dx<=3;dx+=3){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<hh&&mask[Y*w+X]){near=true;break}}if(near)ring.push(i)}
    const step=Math.max(1,Math.floor(ring.length/400));let best=null,bs=Infinity;const D=Math.max(mw,mh);
    for(const f of[1.1,1.6,2.2])for(let a=0;a<16;a++){const ang=a/16*Math.PI*2;const ox=Math.round(Math.cos(ang)*D*f),oy=Math.round(Math.sin(ang)*D*f);if(x0+ox<0||y0+oy<0||x1+ox>=w||y1+oy>=hh)continue;let bad=false;for(let y=y0;y<=y1&&!bad;y+=Math.max(1,mh>>3))for(let x=x0;x<=x1;x+=Math.max(1,mw>>3))if(mask[(y+oy)*w+x+ox]){bad=true;break}if(bad)continue;let s=0,c=0;for(let r=0;r<ring.length;r+=step){const i=ring[r];const x=i%w,y=(i/w)|0;const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=w||Y>=hh)continue;const j=Y*w+X;for(let k=0;k<3;k++){const v=d[i*4+k]-d[j*4+k];s+=v*v}c++}if(c){s/=c;if(s<bs){bs=s;best=[ox,oy]}}}
    if(best){const[ox,oy]=best;const pw=mw+8,ph=mh+8,px=x0-4+ox,py=y0-4+oy;const pid={data:new Uint8ClampedArray(pw*ph*4),width:pw,height:ph};for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){const X=clamp(px+x,0,w-1),Y=clamp(py+y,0,hh-1);const s=(Y*w+X)*4,t=(y*pw+x)*4;for(let k=0;k<4;k++)pid.data[t+k]=d[s+k]}const blr={data:new Uint8ClampedArray(pid.data),width:pw,height:ph};blurImageData(blr,3);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*w+x;if(!mask[i])continue;const t=((y-y0+4)*pw+(x-x0+4))*4;for(let k=0;k<3;k++)out[i*4+k]+=pid.data[t+k]-blr.data[t+k]}}}
  for(let i=0;i<n;i++)if(mask[i])for(let c=0;c<4;c++)d[i*4+c]=out[i*4+c];return id}

/* ===== ZIP (무압축) ===== */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC[(c^u8[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function makeZip(files){const enc=new TextEncoder();const parts=[],cen=[];let off=0;for(const f of files){const name=enc.encode(f.name),data=f.data,crc=crc32(data);const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);parts.push(lh.buffer,name,data);const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);cen.push(ch.buffer,name);off+=30+name.length+data.length}const cs=cen.reduce((a,b)=>a+(b.byteLength||b.length),0);const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);return new Blob([...parts,...cen,end.buffer],{type:'application/zip'})}

/* ===== 저장 (온라인: 다운로드 권한 / 로컬: 바로 저장) ===== */
const ALLOWED_EXT=['gif','png','jpg','jpeg','webp','zip','svg','pdf','json','txt'];
const dlReady=(window.claude&&typeof window.claude.use==='function')?window.claude.use('downloads').catch(()=>null):Promise.resolve(null);
let ONLINE=!!(window.claude&&window.claude.use);
async function saveBlob(name,blob){const dl=await dlReady;let ext=(name.split('.').pop()||'').toLowerCase();let fname=name;if(dl){if(!ALLOWED_EXT.includes(ext)){const buf=new Uint8Array(await blob.arrayBuffer());blob=makeZip([{name,data:buf}]);fname=name+'.zip';toast(`온라인에서는 .${ext} 파일을 ZIP으로 감싸 저장합니다. 압축을 풀면 ${name} 이 나옵니다.`,4200)}try{await dl.save({filename:fname,data:blob});toast(`${fname} 저장`);return true}catch(e){const c=e&&e.code;if(c==='declined')toast('저장을 취소했습니다');else if(c==='rate_limited')toast('저장 창이 이미 열려 있습니다. 잠시 후 다시 시도하세요');else toast('이 화면에서는 저장할 수 없습니다 ('+(c||'오류')+')');return false}}const url=URL.createObjectURL(blob);const a=h('a',{href:url,download:fname});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast(`${fname} 저장`);return true}
function canvasBlob(c,type='image/png',q){return new Promise(r=>c.toBlob(r,type,q))}

let toastT;function toast(msg,ms=2200){let t=$('#toast');if(!t){t=h('div',{id:'toast',role:'status'});document.body.append(t)}t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,ms)}
function busy(on,msg){$('#busy').hidden=!on;if(msg)$('#busyMsg').textContent=msg}
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
