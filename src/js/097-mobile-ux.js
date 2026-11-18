// ===== 모바일 사용성: 붙여넣기 · 사진/카메라 넣기 · + 메뉴 · 길게 눌러 메뉴 =====
const isIL=()=>APP==='illust';
function curHave(){return isIL()?!!IL.doc:!!doc}
// 파일 하나를 현재 문서에 넣기(문서가 없으면 새로 열기)
function insertFile(f){if(!f)return;if(isIL()){/svg/i.test(f.type)&&!/\.svg$/i.test(f.name)?ilPlaceFile(new File([f],'붙여넣기.svg',{type:'image/svg+xml'})):ilPlaceFile(f)}else placeFile(f)}
function pickFiles(capture){const i=h('input',{type:'file',accept:isIL()?'image/*,.svg':'image/*,.psd,.tif,.tiff',style:'display:none'});if(capture)i.setAttribute('capture','environment');else i.multiple=true;
  i.onchange=()=>{const fs=[...i.files];i.remove();(async()=>{for(const f of fs)await insertFile(f)})()};document.body.append(i);i.click()}
// 시스템 클립보드에서 붙여넣기 (권한이 막히면 붙여넣기 패드로)
async function systemPaste(){
  if(navigator.clipboard&&navigator.clipboard.read){
    try{const items=await navigator.clipboard.read();
      for(const it of items){const t=it.types.find(x=>x.startsWith('image/'));if(t){const b=await it.getType(t);insertFile(new File([b],'붙여넣기.'+(t.split('/')[1]||'png').replace('svg+xml','svg'),{type:t}));toast('붙여넣었습니다',900);return}}
      for(const it of items){if(it.types.includes('text/plain')){const s=await (await it.getType('text/plain')).text();if(/^\s*<svg/i.test(s)&&isIL()){insertFile(new File([s],'붙여넣기.svg',{type:'image/svg+xml'}));return}}}
    }catch(e){/* 권한 거부 등 → 아래로 */}
  }
  // 앱 안에서 복사한 것이 있으면 그것을 붙여넣기
  if(isIL()?IL.clip:clip){isIL()?ilPaste('center'):pasteInternal();return}
  pastePad();
}
// 휴대폰에서 가장 확실한 방법: 입력 칸을 길게 눌러 시스템 '붙여넣기' 사용
function pastePad(){
  const pad=h('div',{class:'pastePad',contenteditable:'true',inputmode:'none','aria-label':'붙여넣기 칸'},'');
  const done=f=>{const m=modalOpen;if(m)m.close(false);insertFile(f)};
  pad.addEventListener('paste',e=>{const its=[...(e.clipboardData?e.clipboardData.items:[])];const it=its.find(i=>i.type.startsWith('image/'));e.preventDefault();e.stopPropagation();
    if(it){done(it.getAsFile());return}const s=e.clipboardData.getData('text/plain');if(s&&/^\s*<svg/i.test(s)){done(new File([s],'붙여넣기.svg',{type:'image/svg+xml'}));return}
    const html=e.clipboardData.getData('text/html');const m=html&&html.match(/<img[^>]+src="(data:image\/[^"]+)"/i);if(m){fetch(m[1]).then(r=>r.blob()).then(b=>done(new File([b],'붙여넣기.png',{type:b.type})));return}
    toast('클립보드에 이미지가 없습니다. 사진 앱에서 "복사"한 뒤 다시 해 보세요',3000)});
  let dlg=null;
  dialog({title:'붙여넣기',width:360,content:b=>{b.append(h('div',{class:'muted',style:'font-size:12.5px;line-height:1.6;margin-bottom:10px'},'아래 칸을 ',h('b',null,'길게 눌러'),' 나오는 ',h('b',null,'"붙여넣기"'),'를 누르세요. 다른 앱에서 복사한 사진이 바로 들어갑니다.'),pad,
    h('div',{style:'display:flex;gap:6px;margin-top:10px'},h('button',{class:'btn',style:'flex:1',onclick:()=>{modalOpen&&modalOpen.close(false);pickFiles(false)}},'사진 고르기'),h('button',{class:'btn',style:'flex:1',onclick:()=>{modalOpen&&modalOpen.close(false);pickFiles(true)}},'카메라')));
    dlg=modalOpen;setTimeout(()=>pad.focus(),50)},ok:'닫기',cancel:null});
}
// 시스템 클립보드로 복사(다른 앱에 붙여넣기용)
async function systemCopy(){if(isIL()){ilCopy(false);try{const f=await currentImageFile();if(f&&window.ClipboardItem)await navigator.clipboard.write([new ClipboardItem({'image/png':f})]);toast('복사했습니다',900)}catch(e){}}else{await copySel(false);toast('복사했습니다',900)}}
// + 메뉴 (아래쪽 시트)
function addSheet(){
  const it=(ic,t,fn,dis)=>h('button',{class:'sheetBtn',disabled:!!dis,onclick:()=>{close();fn()}},h('span',{class:'si',html:ic}),h('span',null,t));
  const S=p=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I={img:S('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>'),cam:S('<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),paste:S('<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/>'),copy:S('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>'),
    neu:S('<path d="M6 3h8l4 4v14H6z"/><path d="M12 10v7M8.5 13.5h7"/>'),open:S('<path d="M3 7h6l2 2h10v10H3z"/>'),save:S('<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>'),share:S('<path d="M12 15V4M8 8l4-4 4 4M6 11H5v9h14v-9h-1"/>'),swap:S('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),help:S('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>')};
  const H=curHave();
  const ov=h('div',{class:'sheetBg',onclick:e=>{if(e.target===ov)close()}},h('div',{class:'sheet'},h('div',{class:'grab'}),
    h('div',{class:'sheetGrid'},
      it(I.img,'사진 넣기',()=>pickFiles(false)),it(I.cam,'카메라',()=>pickFiles(true)),it(I.paste,'붙여넣기',systemPaste),it(I.copy,'복사',systemCopy,!H),
      it(I.neu,'새 문서',()=>isIL()?ilNewDlg():newDocDlg()),it(I.open,'파일 열기',()=>isIL()?$('#ilFileIn').click():$('#fileIn').click()),
      it(I.save,isIL()?'SVG 저장':'저장',()=>isIL()?ilSaveSvg():savePsd(),!H),it(I.share,'다른 앱으로',shareOut,!H),
      it(I.swap,isIL()?'Photo로':'Illust로',()=>switchApp(isIL()?'photo':'illust')),it(I.help,'사용법',mobileHelp))));
  function close(){ov.remove()}
  document.body.append(ov);
}
function mobileHelp(){
  const r=(a,b)=>h('tr',null,h('td',{style:'padding:5px 10px 5px 0;white-space:nowrap;color:#9fd0ff'},a),h('td',{style:'padding:5px 0'},b));
  dialog({title:'휴대폰에서 쓰는 법',width:420,content:b=>b.append(h('table',{style:'font-size:13px;line-height:1.5;border-collapse:collapse'},
    r('두 손가락 벌리기·모으기','확대 · 축소'),r('두 손가락 끌기','화면 이동'),r('두 손가락 톡','실행 취소'),r('세 손가락 톡','다시 실행'),
    r('화면 길게 누르기','붙여넣기 · 복사 · 사진 넣기 메뉴'),r('아래 + 버튼','사진·카메라·붙여넣기·저장·공유'),r('도구 길게 누르기','같은 묶음의 다른 도구'),r('패널 버튼','레이어 · 속성 · 색상 패널 열기'))),ok:'확인',cancel:null});
}
// 화면 길게 누르기 → 바로가기 메뉴
function longPressMenu(host,isIl){
  let t=null,st=null,h0=0;const clear=()=>{clearTimeout(t);t=null};
  host.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||!e.isPrimary){clear();return}if(e.target.closest('.rg,.rgCorner'))return;
    st={x:e.clientX,y:e.clientY,e};h0=isIl?(IL.doc?IL.doc.hi:0):(doc?doc.hIndex:0);clear();
    t=setTimeout(()=>{t=null;fire(st)},560)},true);
  host.addEventListener('pointermove',e=>{if(t&&st&&Math.hypot(e.clientX-st.x,e.clientY-st.y)>9)clear()},true);
  const end=()=>clear();host.addEventListener('pointerup',end,true);host.addEventListener('pointercancel',end,true);
  function fire(s){
    // 누르는 동안 시작된 도구 동작은 취소
    try{if(isIl){if(ilDrag){try{ilEnd(s.e)}catch(x){ilDrag=null}}const d=IL.doc;if(d&&d.hi>h0){ilRestore(h0);d.hist.length=h0+1}}
      else{if(drag){try{endDrag(s.e)}catch(x){drag=null}}if(doc&&doc.hIndex>h0){restoreHist(h0);doc.history.length=h0+1}}}catch(x){}
    // 손가락을 뗄 때 생기는 클릭이 메뉴 항목을 누르지 않도록 한 번 막기
    const eat=ev=>{if(ev.target.closest&&ev.target.closest('.dropdown')){ev.stopPropagation();ev.preventDefault()}};
    const off=()=>{removeEventListener('click',eat,true);removeEventListener('pointerup',eat,true);removeEventListener('mouseup',eat,true)};
    addEventListener('click',eat,true);addEventListener('pointerup',eat,true);addEventListener('mouseup',eat,true);
    host.addEventListener('pointerup',()=>setTimeout(off,350),{once:true,capture:true});setTimeout(off,8000);
    if(navigator.vibrate)try{navigator.vibrate(12)}catch(x){}
    const H=curHave();
    const items=[mi('붙여넣기','',systemPaste),mi('사진 넣기...','',()=>pickFiles(false)),mi('카메라로 찍어 넣기...','',()=>pickFiles(true)),'-',
      mi('복사','',systemCopy,()=>H),
      ...(isIl?[mi('잘라내기','',()=>ilCopy(true),()=>IL.doc&&IL.doc.sel.length),mi('복제','',()=>{ilCopy(false);ilPaste('front')},()=>IL.doc&&IL.doc.sel.length),mi('삭제','',()=>ilDelete(),()=>IL.doc&&IL.doc.sel.length),'-',mi('모두 선택','',ilSelectAll,()=>H),mi('선택 해제','',()=>ilSetSel([]),()=>IL.doc&&IL.doc.sel.length)]
        :[mi('레이어 복제','',cmdDupLayer,()=>H&&doc.active),mi('자유 변형','',()=>startTransform(),()=>H&&doc.active),'-',mi('모두 선택','',selectAll,()=>H),mi('선택 해제','',deselect,()=>H&&doc.sel)]),
      '-',mi('실행 취소','',()=>isIl?ilUndo():undo()),mi('화면에 맞추기','',()=>isIl?ilFit():fitView(),()=>H)];
    showMenuAt(items,Math.min(s.x,innerWidth-240),Math.min(s.y,innerHeight-380));
  }
}
longPressMenu($('#work'),false);longPressMenu($('#ilWork'),true);
// + 버튼을 빠른 막대 맨 앞에, 빈 화면에 큰 버튼 추가
(function(){const bar=$('#mobBar');if(bar){const b=h('button',{class:'mb plus',title:'추가 · 붙여넣기 · 저장','aria-label':'추가 메뉴',html:'<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',onclick:e=>{e.stopPropagation();closeMenus();addSheet()}});bar.prepend(b)}
  for(const [sel,il] of [['#empty .row',false],['#ilEmpty .row',true]]){const row=$(sel);if(!row)continue;const ex=h('div',{class:'row touchOnly'},
    h('button',{class:'btn',onclick:()=>{if(il!==isIL())switchApp(il?'illust':'photo');pickFiles(false)}},'사진 불러오기'),
    h('button',{class:'btn',onclick:()=>{if(il!==isIL())switchApp(il?'illust':'photo');pickFiles(true)}},'카메라'),
    h('button',{class:'btn',onclick:()=>{if(il!==isIL())switchApp(il?'illust':'photo');systemPaste()}},'붙여넣기'));row.after(ex)}
})();
