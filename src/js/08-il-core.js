/* =====================================================================
   IUX Illust — 벡터 편집기 (일러스트레이터 구성)
   ===================================================================== */
const SVGNS='http://www.w3.org/2000/svg';
const svgEl=(tag,attrs={})=>{const e=document.createElementNS(SVGNS,tag);for(const k in attrs)if(attrs[k]!=null)e.setAttribute(k,attrs[k]);return e};
const IL={docs:[],doc:null,tool:null,fill:'#ffffff',stroke:'#000000',sw:1,focus:'fill',clip:null,outline:false,grid:false,snapGrid:false,smart:true,opts:{radius:12,sides:6,points:5,inner:.5,brushW:4,pencilSmooth:3,font:'Pretendard',weight:400,size:36,lead:0,track:0,align:'start'}};
const ilSvg=$('#ilSvg'),ilView=$('#ilView'),ilContent=$('#ilContent'),ilOverlay=$('#ilOverlay'),ilBoards=$('#ilBoards'),ilWork=$('#ilWork');
const r3=v=>Math.round(v*1000)/1000;

/* ===== 문서 ===== */
function ilMakeLayer(d,name,color){return svgEl('g',{'data-layer':'1','data-name':name,'data-id':'L'+(d.nid++),'data-color':color||['#4f80ff','#ff4f4f','#4fc84f','#4fd8ff','#ff4fd8','#ffd84f'][(d.g?d.g.children.length:0)%6]})}
function ilNewDocObj(name,w,hh,o={}){const d={id:uid++,name,abs:[{x:0,y:0,w,h:hh,name:'대지 1'}],ab:0,defs:svgEl('defs'),g:svgEl('g',{'data-root':'1'}),hist:[],hi:-1,saved:0,zoom:1,panX:0,panY:0,sel:[],layer:null,fileName:o.fileName||null,nid:1,dsel:null};const L=ilMakeLayer(d,'레이어 1','#4f80ff');d.g.append(L);d.layer=L;return d}
function ilAddDoc(d,label='새로 만들기'){IL.docs.push(d);ilSwitch(d);if(APP==='illust'){ilFit();d._fit=true}d.hist=[];d.hi=-1;ilPush(label);d.saved=d.hi}
function ilSwitch(d){ilCancelTransient();IL.doc=d;ilContent.replaceChildren();if(d){ilContent.append(d.defs,d.g)}$('#ilEmpty').hidden=!!d;ilApplyView();ilRefreshAll()}
function ilClose(d,force){if(!force&&d.hi!==d.saved){confirmDlg(`"${d.name}" 의 변경 내용을 저장하지 않고 닫을까요?`,'닫기',()=>ilClose(d,true));return}const i=IL.docs.indexOf(d);IL.docs.splice(i,1);if(IL.doc===d)ilSwitch(IL.docs[Math.min(i,IL.docs.length-1)]||null);else ilRefreshAll()}
const ilLayers=()=>IL.doc?[...IL.doc.g.children].filter(e=>e.dataset.layer):[];
function ilNewId(el){el.setAttribute('data-id','o'+(IL.doc.nid++));for(const c of el.querySelectorAll('*'))if(!(c.closest&&c.tagName==='tspan'))c.setAttribute('data-id','o'+(IL.doc.nid++));return el}
function ilObjName(el){const t=el.tagName.toLowerCase();if(el.dataset.name)return el.dataset.name;return{rect:'<사각형>',ellipse:'<타원>',circle:'<원>',path:'<패스>',line:'<선>',polygon:'<다각형>',polyline:'<패스>',text:(el.textContent||'').slice(0,20)||'<문자>',g:el.dataset.clip?'<클리핑 그룹>':'<그룹>',image:'<이미지>',use:'<인스턴스>'}[t]||t}

/* ===== 히스토리 ===== */
function ilSnap(label){const d=IL.doc;return{label,defs:d.defs.innerHTML,g:d.g.innerHTML,abs:JSON.stringify(d.abs),ab:d.ab,sel:d.sel.map(e=>e.dataset.id),layer:d.layer&&d.layer.dataset.id,nid:d.nid}}
function ilPush(label){const d=IL.doc;if(!d)return;d.hist.length=d.hi+1;d.hist.push(ilSnap(label));if(d.hist.length>80){d.hist.shift();d.saved--}d.hi=d.hist.length-1;ilRefreshAll()}
function ilRestore(i){const d=IL.doc;const s=d.hist[i];if(!s)return;ilCancelTransient();d.defs.innerHTML=s.defs;d.g.innerHTML=s.g;d.abs=JSON.parse(s.abs);d.ab=Math.min(s.ab,d.abs.length-1);d.nid=Math.max(d.nid,s.nid);d.layer=d.g.querySelector(`[data-id="${s.layer}"]`)||ilLayers()[0];d.sel=s.sel.map(id=>d.g.querySelector(`[data-id="${id}"]`)).filter(Boolean);d.dsel=null;d.hi=i;ilRefreshAll()}
function ilUndo(){const d=IL.doc;if(d&&d.hi>0)ilRestore(d.hi-1)}
function ilRedo(){const d=IL.doc;if(d&&d.hi<d.hist.length-1)ilRestore(d.hi+1)}
const ilPushD=debounce(l=>ilPush(l),350);

/* ===== 화면 ===== */
let ilVW=0,ilVH=0;
function ilResize(){const r=ilWork.getBoundingClientRect();ilVW=r.width;ilVH=r.height;ilDrawOverlay()}
function ilApplyView(){const d=IL.doc;if(!d){ilView.setAttribute('transform','');ilBoards.replaceChildren();ilOverlay.replaceChildren();return}ilView.setAttribute('transform',`translate(${r3(d.panX)} ${r3(d.panY)}) scale(${d.zoom})`);ilDrawBoards();ilDrawOverlay();const z=$('#ilZoomInp');if(z&&document.activeElement!==z)z.value=zpct(d.zoom);ilRenderTabs()}
const ilToDoc=(sx,sy)=>({x:(sx-IL.doc.panX)/IL.doc.zoom,y:(sy-IL.doc.panY)/IL.doc.zoom});
const ilToScr=(x,y)=>({x:x*IL.doc.zoom+IL.doc.panX,y:y*IL.doc.zoom+IL.doc.panY});
function ilAllBounds(){const d=IL.doc;let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const a of d.abs){x0=Math.min(x0,a.x);y0=Math.min(y0,a.y);x1=Math.max(x1,a.x+a.w);y1=Math.max(y1,a.y+a.h)}return{x:x0,y:y0,w:x1-x0,h:y1-y0}}
function ilFit(all){const d=IL.doc;if(!d)return;ilResize();const b=all?ilAllBounds():d.abs[d.ab];const z=Math.min((ilVW-60)/b.w,(ilVH-60)/b.h);d.zoom=clamp(z,.02,64);d.panX=ilVW/2-(b.x+b.w/2)*d.zoom;d.panY=ilVH/2-(b.y+b.h/2)*d.zoom;ilApplyView()}
function ilZoomAt(z,sx,sy){const d=IL.doc;if(!d)return;z=clamp(z,.02,64);const p=ilToDoc(sx,sy);d.zoom=z;d.panX=sx-p.x*z;d.panY=sy-p.y*z;ilApplyView()}
function ilZoomStep(dir,sx=ilVW/2,sy=ilVH/2){const d=IL.doc;if(!d)return;const L=[.03125,.0625,.125,.25,.3333,.5,.6667,1,1.5,2,3,4,6,8,12,16,24,32,64];const z=d.zoom;const n=dir>0?(L.find(v=>v>z+1e-6)||64):([...L].reverse().find(v=>v<z-1e-6)||.02);ilZoomAt(n,sx,sy)}
function ilDrawBoards(){const d=IL.doc;ilBoards.replaceChildren();d.abs.forEach((a,i)=>{ilBoards.append(svgEl('rect',{x:a.x,y:a.y,width:a.w,height:a.h,fill:'#fff',filter:'url(#ilAbShadow)'}));if(d.abs.length>1||IL.tool&&IL.tool.id==='artboard'){const t=svgEl('text',{x:a.x,y:a.y-6/d.zoom,'font-size':11/d.zoom,fill:i===d.ab?'#fff':'#ccc','font-family':'Pretendard, sans-serif'});t.textContent=`${i+1} - ${a.name}`;ilBoards.append(t)}});const gr=$('#ilGrid');const B=ilAllBounds();gr.setAttribute('x',B.x-2000);gr.setAttribute('y',B.y-2000);gr.setAttribute('width',B.w+4000);gr.setAttribute('height',B.h+4000);gr.setAttribute('visibility',IL.grid?'visible':'hidden')}

/* ===== 기하 ===== */
function toDM(m){return new DOMMatrix([m.a,m.b,m.c,m.d,m.e,m.f])}
function getM(el){const t=el.transform&&el.transform.baseVal&&el.transform.baseVal.numberOfItems?el.transform.baseVal.consolidate():null;return t?toDM(t.matrix):new DOMMatrix()}
function setM(el,m){if(m.isIdentity||(Math.abs(m.a-1)<1e-9&&Math.abs(m.d-1)<1e-9&&Math.abs(m.b)<1e-9&&Math.abs(m.c)<1e-9&&Math.abs(m.e)<1e-9&&Math.abs(m.f)<1e-9))el.removeAttribute('transform');else el.setAttribute('transform',`matrix(${r3(m.a)} ${r3(m.b)} ${r3(m.c)} ${r3(m.d)} ${r3(m.e)} ${r3(m.f)})`)}
function docM(el){const root=IL.doc.g;let m=new DOMMatrix();let e=el;const chain=[];while(e&&e!==root){chain.push(e);e=e.parentNode}for(let i=chain.length-1;i>=0;i--)m=m.multiply(getM(chain[i]));return m}
function bboxOf(el){let b;try{b=el.getBBox()}catch(e){return null}if(!b)return null;if(el.tagName==='g'&&el.dataset.clip){const c=el.querySelector('[data-cliprect]');if(c){try{const bb=c.getBBox();const m=docM(c);return xfBox(bb,m)}catch(e){}}}const m=docM(el);if(!b.width&&!b.height&&!['line','path','polyline'].includes(el.tagName))return null;return xfBox(b,m)}
function xfBox(b,m){const P=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>m.transformPoint(new DOMPoint(x,y)));const xs=P.map(p=>p.x),ys=P.map(p=>p.y);const x=Math.min(...xs),y=Math.min(...ys);return{x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y}}
function unionBox(els){let r=null;for(const e of els){const b=bboxOf(e);if(!b)continue;r=r?{x:Math.min(r.x,b.x),y:Math.min(r.y,b.y),x2:Math.max(r.x2,b.x+b.w),y2:Math.max(r.y2,b.y+b.h)}:{x:b.x,y:b.y,x2:b.x+b.w,y2:b.y+b.h}}return r?{x:r.x,y:r.y,w:r.x2-r.x,h:r.y2-r.y}:null}

/* ===== 패스 데이터 ===== */
function parsePath(d){const t=String(d||'').match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi)||[];let i=0,cmd='',x=0,y=0,sx=0,sy=0,lc=null,lq=null;const out=[];const num=()=>parseFloat(t[i++]);const isN=()=>i<t.length&&!/[a-z]/i.test(t[i]);
  while(i<t.length){if(/[a-z]/i.test(t[i]))cmd=t[i++];const rel=cmd===cmd.toLowerCase();const C=cmd.toUpperCase();if(C==='Z'){out.push({c:'Z'});x=sx;y=sy;lc=lq=null;if(isN())cmd='L';continue}
    do{let p;switch(C){case'M':{let nx=num(),ny=num();if(rel){nx+=x;ny+=y}x=sx=nx;y=sy=ny;out.push({c:'M',p:[x,y]});cmd=rel?'l':'L';lc=lq=null;break}
      case'L':{let nx=num(),ny=num();if(rel){nx+=x;ny+=y}x=nx;y=ny;out.push({c:'L',p:[x,y]});lc=lq=null;break}
      case'H':{let nx=num();if(rel)nx+=x;x=nx;out.push({c:'L',p:[x,y]});lc=lq=null;break}
      case'V':{let ny=num();if(rel)ny+=y;y=ny;out.push({c:'L',p:[x,y]});lc=lq=null;break}
      case'C':{p=[num(),num(),num(),num(),num(),num()];if(rel)for(let k=0;k<6;k+=2){p[k]+=x;p[k+1]+=y}out.push({c:'C',p});lc=[p[2],p[3]];x=p[4];y=p[5];lq=null;break}
      case'S':{const a=lc?[2*x-lc[0],2*y-lc[1]]:[x,y];p=[num(),num(),num(),num()];if(rel)for(let k=0;k<4;k+=2){p[k]+=x;p[k+1]+=y}out.push({c:'C',p:[a[0],a[1],...p]});lc=[p[0],p[1]];x=p[2];y=p[3];lq=null;break}
      case'Q':{p=[num(),num(),num(),num()];if(rel)for(let k=0;k<4;k+=2){p[k]+=x;p[k+1]+=y}out.push({c:'C',p:[x+2/3*(p[0]-x),y+2/3*(p[1]-y),p[2]+2/3*(p[0]-p[2]),p[3]+2/3*(p[1]-p[3]),p[2],p[3]]});lq=[p[0],p[1]];x=p[2];y=p[3];lc=null;break}
      case'T':{const q=lq?[2*x-lq[0],2*y-lq[1]]:[x,y];p=[num(),num()];if(rel){p[0]+=x;p[1]+=y}out.push({c:'C',p:[x+2/3*(q[0]-x),y+2/3*(q[1]-y),p[0]+2/3*(q[0]-p[0]),p[1]+2/3*(q[1]-p[1]),p[0],p[1]]});lq=q;x=p[0];y=p[1];lc=null;break}
      case'A':{const rx=num(),ry=num(),rot=num(),la=num(),sw=num();let nx=num(),ny=num();if(rel){nx+=x;ny+=y}for(const c of arcToCubic(x,y,rx,ry,rot,la,sw,nx,ny))out.push({c:'C',p:c});x=nx;y=ny;lc=lq=null;break}
      default:i++}}while(isN()&&C!=='Z')}return out}
function arcToCubic(x1,y1,rx,ry,phi,fa,fs,x2,y2){if(!rx||!ry)return[[x1,y1,x2,y2,x2,y2]];rx=Math.abs(rx);ry=Math.abs(ry);const r=phi*Math.PI/180,co=Math.cos(r),si=Math.sin(r);const dx=(x1-x2)/2,dy=(y1-y2)/2;const x1p=co*dx+si*dy,y1p=-si*dx+co*dy;let L=x1p*x1p/(rx*rx)+y1p*y1p/(ry*ry);if(L>1){rx*=Math.sqrt(L);ry*=Math.sqrt(L)}const sign=fa===fs?-1:1;let sq=(rx*rx*ry*ry-rx*rx*y1p*y1p-ry*ry*x1p*x1p)/(rx*rx*y1p*y1p+ry*ry*x1p*x1p);sq=sq<0?0:sq;const coef=sign*Math.sqrt(sq);const cxp=coef*rx*y1p/ry,cyp=-coef*ry*x1p/rx;const cx0=co*cxp-si*cyp+(x1+x2)/2,cy0=si*cxp+co*cyp+(y1+y2)/2;const ang=(ux,uy,vx,vy)=>{const a=Math.atan2(ux*vy-uy*vx,ux*vx+uy*vy);return a};let t1=ang(1,0,(x1p-cxp)/rx,(y1p-cyp)/ry);let dt=ang((x1p-cxp)/rx,(y1p-cyp)/ry,(-x1p-cxp)/rx,(-y1p-cyp)/ry);if(!fs&&dt>0)dt-=2*Math.PI;if(fs&&dt<0)dt+=2*Math.PI;const n=Math.ceil(Math.abs(dt)/(Math.PI/2));const out=[];const da=dt/n;const k=4/3*Math.tan(da/4);for(let i=0;i<n;i++){const a1=t1+i*da,a2=a1+da;const p=(a)=>[cx0+rx*Math.cos(a)*co-ry*Math.sin(a)*si,cy0+rx*Math.cos(a)*si+ry*Math.sin(a)*co];const d=(a)=>[-rx*Math.sin(a)*co-ry*Math.cos(a)*si,-rx*Math.sin(a)*si+ry*Math.cos(a)*co];const P1=p(a1),P2=p(a2),D1=d(a1),D2=d(a2);out.push([P1[0]+k*D1[0],P1[1]+k*D1[1],P2[0]-k*D2[0],P2[1]-k*D2[1],P2[0],P2[1]])}return out}
function pathStr(s){return s.map(g=>g.c==='Z'?'Z':g.c+g.p.map(v=>r3(v)).join(' ')).join('')}
function xfSegs(s,m){return s.map(g=>{if(g.c==='Z')return g;const p=[];for(let k=0;k<g.p.length;k+=2){const q=m.transformPoint(new DOMPoint(g.p[k],g.p[k+1]));p.push(q.x,q.y)}return{c:g.c,p}})}
function shapeSegs(el){const t=el.tagName,n=k=>parseFloat(el.getAttribute(k))||0;const K=.5522847;if(t==='path')return parsePath(el.getAttribute('d'));if(t==='rect'){const x=n('x'),y=n('y'),w=n('width'),hh=n('height');let rx=Math.min(n('rx')||n('ry'),w/2),ry=Math.min(n('ry')||n('rx'),hh/2);if(!rx)return[{c:'M',p:[x,y]},{c:'L',p:[x+w,y]},{c:'L',p:[x+w,y+hh]},{c:'L',p:[x,y+hh]},{c:'Z'}];return[{c:'M',p:[x+rx,y]},{c:'L',p:[x+w-rx,y]},{c:'C',p:[x+w-rx+rx*K,y,x+w,y+ry-ry*K,x+w,y+ry]},{c:'L',p:[x+w,y+hh-ry]},{c:'C',p:[x+w,y+hh-ry+ry*K,x+w-rx+rx*K,y+hh,x+w-rx,y+hh]},{c:'L',p:[x+rx,y+hh]},{c:'C',p:[x+rx-rx*K,y+hh,x,y+hh-ry+ry*K,x,y+hh-ry]},{c:'L',p:[x,y+ry]},{c:'C',p:[x,y+ry-ry*K,x+rx-rx*K,y,x+rx,y]},{c:'Z'}]}
  if(t==='ellipse'||t==='circle'){const cx0=n('cx'),cy0=n('cy');const rx=t==='circle'?n('r'):n('rx'),ry=t==='circle'?n('r'):n('ry');return[{c:'M',p:[cx0+rx,cy0]},{c:'C',p:[cx0+rx,cy0+ry*K,cx0+rx*K,cy0+ry,cx0,cy0+ry]},{c:'C',p:[cx0-rx*K,cy0+ry,cx0-rx,cy0+ry*K,cx0-rx,cy0]},{c:'C',p:[cx0-rx,cy0-ry*K,cx0-rx*K,cy0-ry,cx0,cy0-ry]},{c:'C',p:[cx0+rx*K,cy0-ry,cx0+rx,cy0-ry*K,cx0+rx,cy0]},{c:'Z'}]}
  if(t==='line')return[{c:'M',p:[n('x1'),n('y1')]},{c:'L',p:[n('x2'),n('y2')]}];if(t==='polygon'||t==='polyline'){const v=(el.getAttribute('points')||'').trim().split(/[\s,]+/).map(Number);const s=[];for(let k=0;k+1<v.length;k+=2)s.push({c:k?'L':'M',p:[v[k],v[k+1]]});if(t==='polygon')s.push({c:'Z'});return s}return null}
function toPath(el){if(el.tagName==='path')return el;const s=shapeSegs(el);if(!s)return el;const p=svgEl('path');for(const a of[...el.attributes]){if(['x','y','width','height','rx','ry','cx','cy','r','x1','y1','x2','y2','points'].includes(a.name))continue;p.setAttribute(a.name,a.value)}p.setAttribute('d',pathStr(s));if(el.tagName==='line'&&!p.getAttribute('fill'))p.setAttribute('fill','none');el.replaceWith(p);const d=IL.doc;const i=d.sel.indexOf(el);if(i>=0)d.sel[i]=p;return p}
/* 변형 적용: 도형은 좌표에 굽고(획 두께 유지), 문자·이미지는 행렬로 */
function ilApplyM(el,M){if(el.tagName==='g'){if(el.dataset.clip||el.getAttribute('transform')){const P=docM(el.parentNode);setM(el,P.inverse().multiply(M).multiply(P).multiply(getM(el)));return}for(const c of[...el.children])ilApplyM(c,M);return}const P=docM(el.parentNode);const N=P.inverse().multiply(M).multiply(P).multiply(getM(el));const t=el.tagName;const axis=Math.abs(N.b)<1e-9&&Math.abs(N.c)<1e-9;
  if(t==='rect'&&axis){const n=k=>parseFloat(el.getAttribute(k))||0;let x=N.a*n('x')+N.e,y=N.d*n('y')+N.f,w=N.a*n('width'),hh=N.d*n('height');if(w<0){x+=w;w=-w}if(hh<0){y+=hh;hh=-hh}el.setAttribute('x',r3(x));el.setAttribute('y',r3(y));el.setAttribute('width',r3(w));el.setAttribute('height',r3(hh));if(el.hasAttribute('rx'))el.setAttribute('rx',r3(n('rx')*Math.abs(N.a)));if(el.hasAttribute('ry'))el.setAttribute('ry',r3(n('ry')*Math.abs(N.d)));el.removeAttribute('transform');return}
  if((t==='ellipse'||t==='circle')&&axis&&(t==='ellipse'||Math.abs(Math.abs(N.a)-Math.abs(N.d))<1e-9)){const n=k=>parseFloat(el.getAttribute(k))||0;el.setAttribute('cx',r3(N.a*n('cx')+N.e));el.setAttribute('cy',r3(N.d*n('cy')+N.f));if(t==='circle')el.setAttribute('r',r3(n('r')*Math.abs(N.a)));else{el.setAttribute('rx',r3(n('rx')*Math.abs(N.a)));el.setAttribute('ry',r3(n('ry')*Math.abs(N.d)))}el.removeAttribute('transform');return}
  if(['rect','ellipse','circle','line','polygon','polyline','path'].includes(t)){const p=t==='path'?el:toPath(el);p.setAttribute('d',pathStr(xfSegs(parsePath(p.getAttribute('d')),N)));p.removeAttribute('transform');return}
  setM(el,N)}
