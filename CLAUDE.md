# IUX Photo · IUX Illust — 작업 안내서

## 한 줄 요약
브라우저에서 PSD·이미지를 열고 고치는 포토샵식 편집기 + 일러스트레이터식 벡터 편집기. 앱 아이콘(IP/IL)으로 서로 전환.

- 주소: https://photo.iux.kr

## 확정된 결정
| 항목 | 결정 |
|---|---|
| 기준 | 현재 포토샵의 화면 구성·단축키·대화상자·필터·문자 옵션·조정 패널을 따라 함 |
| 파일 | PSD 열기·저장(레이어 구조 보존), 이미지 저장. 파일은 서버로 안 올라감 |
| 글꼴 | 기본 Pretendard. 글꼴 추가는 **웹 주소** 방식 |
| 회전 커서 | ScanQC(iux-qc)에서 쓴 아이콘 |
| 배포물 | `index.html` 단일 파일(오프라인 동작, 라이브러리 내장) |

## 파일
```
src/style.css, src/body.html        이미지 편집기 화면
src/il/                             벡터 편집기 화면
src/js/NN-*.js                      기능 (파일 이름 순서대로 합쳐짐)
  01-util 02-doc(레이어·히스토리) 03-view 04-tools 05-adjust 055-fonts 056-psdlg(포토샵식 대화상자)
  06-ui 065-text 066-filters 067-adjpanel 07-crossdrag 08/081/082-il(벡터) 09-mobile 095-share 096-guides 99-start
build.py                            src → index.html (오프라인 단일 파일), dist/artifact.html
index.html                          ★ 빌드 결과 — 직접 고치지 말 것
sw.js, manifest.webmanifest         PWA
```

## 자주 하는 수정
```
npm install        # ag-psd, utif, pako, pretendard, paper
npm run build      # = python3 build.py
```
`src/`만 고치고 빌드 → `index.html`까지 커밋.

## 알아 둘 점
레이어 스타일·조정 레이어는 그리지 않고 보존만 함. HEIC 미지원.

## 브랜치
- `claude/iux-kr-domains` — 도메인 변경, main에 반영된 것으로 보임

---

## 공통 작업 원칙 (IUX 프로젝트 전체)
- **언어:** 화면 문구·문서·커밋 메시지는 한국어. 쉬운 말, 기술 용어 최소화.
- **퍼블리싱 시안:** 순수 HTML/CSS + 간단한 스크립트만 넣는다. 서버·DB 연동 코드는 개발 단계에서 따로 붙인다.
- **아이콘:** Lucide. 디자인 시스템을 따로 정하지 않았으면 스포티파이 스타일(다크/화이트 + 포인트 컬러)을 기본으로 쓴다.
- **배포:** GitHub `main` → Vercel 자동 배포. 도메인은 가비아 `iux.kr`의 서브도메인(`*.iux.kr` CNAME → Vercel)을 쓴다.
- **DB:** Supabase 무료 플랜은 활성 프로젝트 2개까지라, 새 프로젝트를 만들지 말고 기존 `iux-cloud`(studio) 프로젝트에 테이블을 얹는 것을 먼저 검토한다.
- **비밀값:** 공개 저장소다. 서비스 키·AI 키·비밀번호는 절대 커밋하지 않는다. 키는 Vercel 환경 변수나 Supabase secrets에 둔다. Supabase anon(public) 키만 코드에 넣을 수 있다.
- **확인:** 고친 뒤에는 브라우저 콘솔 오류 0개, 모바일(390px)과 PC 화면을 눈으로 확인하고 나서 완료라고 한다.
- **브랜치:** `main`은 배포 중인 상태. 큰 작업이나 검증 전 작업은 브랜치(`wip/…`, `claude/…`)에 올리고, `main`을 강제 푸시(-f)로 덮어쓰지 않는다.
- **전체 프로젝트 목록:** https://github.com/handgoldking1234/iux-app/blob/main/docs/PROJECTS.md
