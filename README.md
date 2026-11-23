# 💄 뷰티과 실습 예약 시스템

고등학교 뷰티과 학생 · 교직원이 **메이크업 · 네일 · 피부에스테틱** 실습을 예약하는 반응형 웹앱입니다.

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router (HashRouter)
- **Backend**: Google Apps Script 웹 앱 → Google Sheets 저장
- **Deploy**: GitHub Pages (GitHub Actions 자동 배포)

---

## 📁 폴더 구조

```
beauty-reservation/
├─ .github/workflows/deploy.yml   # GitHub Pages 자동 배포
├─ apps-script/
│  ├─ Code.gs                     # Google Apps Script 백엔드 (GET 조회 / POST 저장 / 중복검사)
│  └─ appsscript.json             # Apps Script 매니페스트
├─ public/favicon.svg
├─ src/
│  ├─ api/reservationApi.js       # GAS API 클라이언트 (+ URL 미설정 시 데모 모드)
│  ├─ components/
│  │  ├─ Header.jsx / Footer.jsx
│  │  ├─ Hero.jsx                 # 메인 Hero
│  │  ├─ ServiceSection.jsx       # 서비스 소개
│  │  ├─ ServiceCard.jsx          # 서비스 카드
│  │  ├─ StatusBoard.jsx          # 실시간 예약 현황 (한눈에 보기)
│  │  ├─ GuideSection.jsx         # 예약 방법 + 유의사항
│  │  ├─ DatePicker.jsx           # 날짜 칩 선택
│  │  ├─ TimeSlotPicker.jsx       # 시간 선택 (가능=초록 / 마감=회색)
│  │  └─ Spinner.jsx              # 로딩 스피너 / 오버레이
│  ├─ config/services.js          # 서비스·시간·휴무일·유의사항 설정
│  ├─ context/ToastContext.jsx    # 토스트 메시지
│  ├─ hooks/useScrollToSection.js
│  ├─ pages/
│  │  ├─ HomePage.jsx             # 메인
│  │  ├─ ReservationPage.jsx      # 예약
│  │  └─ CompletePage.jsx         # 예약 완료
│  ├─ utils/date.js, validation.js
│  ├─ App.jsx, main.jsx, index.css
├─ index.html                     # SEO 메타 태그
├─ .env.example
├─ package.json, vite.config.js, tailwind.config.js, postcss.config.js
```

---

## 🚀 1. 로컬 실행

[Node.js 18+](https://nodejs.org) 설치 후:

```bash
npm install
npm run dev
```

> `.env` 가 없으면 **데모 모드**로 동작합니다 (예약이 브라우저 localStorage 에 저장됨). 화면 확인용으로 바로 써볼 수 있어요.

---

## 📊 2. Google Sheets + Apps Script 연동

1. Google Sheets 새 문서를 만듭니다.
2. **확장 프로그램 → Apps Script** 를 엽니다.
3. `apps-script/Code.gs` 내용을 붙여넣고 저장합니다.
4. 상단 함수 목록에서 **`setup`** 을 선택해 **실행** → 권한 승인 (`예약` 시트와 헤더가 생성됩니다).
5. **배포 → 새 배포 → 유형: 웹 앱**
   - 실행 사용자: **나**
   - 액세스 권한: **모든 사용자**
6. 발급된 URL(`https://script.google.com/macros/s/.../exec`)을 복사합니다.
7. 프로젝트 루트에 `.env` 파일을 만들고 입력합니다.

```env
VITE_GAS_URL=https://script.google.com/macros/s/발급받은ID/exec
```

### 시트 컬럼

| 예약일시 | 이름 | 학번 | 연락처 | 서비스 | 예약날짜 | 예약시간 | 요청사항 | 상태 |
|---|---|---|---|---|---|---|---|---|

- 상태 기본값: `예약완료` (드롭다운: 예약완료 / 방문완료 / 취소)
- 상태를 **`취소`** 로 바꾸면 그 시간은 다시 예약 가능해집니다.

### API

| 메서드 | 요청 | 응답 |
|---|---|---|
| GET | `?action=booked&date=2026-11-27` | `{ ok, booked: ["09:00","13:30"] }` |
| GET | `?action=check&date=2026-11-27&time=09:00` | `{ ok, available: true }` |
| POST | body(JSON, `text/plain`) `{timestamp,name,studentId,phone,service,date,time,memo}` | `{ ok, reservation }` 또는 `{ ok:false, code:"DUPLICATE" }` |

> POST 를 `text/plain` 으로 보내는 이유: Apps Script 는 CORS preflight(OPTIONS)를 처리하지 못하므로, preflight 가 발생하지 않는 단순 요청으로 전송합니다.

### 중복 예약 방지 (3단계)

1. 날짜 선택 시 서버에서 예약된 시간을 받아 **회색(비활성)** 처리
2. 예약 버튼 클릭 직전 서버에 **다시 조회**해 중복 검사
3. Apps Script 에서 **LockService** 로 잠근 상태에서 최종 중복 검사 후 저장 (동시 요청 방지)

> ⚠️ `Code.gs` 를 수정한 뒤에는 **배포 관리 → 편집(연필) → 버전: 새 버전 → 배포** 해야 반영됩니다.

---

## 🌐 3. GitHub Pages 배포

### 방법 A — GitHub Actions (권장)

1. GitHub 에 저장소를 만들고 코드를 push (`main` 브랜치)
2. 저장소 **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_GAS_URL` / Value: 웹 앱 URL
3. **Settings → Pages → Source: GitHub Actions** 선택
4. push 할 때마다 자동 빌드·배포 → `https://<아이디>.github.io/<저장소명>/`

### 방법 B — gh-pages 명령

```bash
npm run deploy
```
→ `gh-pages` 브랜치에 업로드됩니다. Settings → Pages → Source 를 `gh-pages` 브랜치로 지정하세요.

> `vite.config.js` 의 `base: './'` + `HashRouter` 덕분에 저장소 이름과 관계없이 동작하며, 새로고침해도 404가 나지 않습니다.

---

## ⚙️ 커스터마이징

`src/config/services.js` 에서 수정:

- `SERVICES` — 서비스명, 세부 항목, 소요시간, 설명
- `TIME_SLOTS` — 예약 시간 (Code.gs 의 `TIME_SLOTS` 도 같이 수정)
- `OPEN_WEEKDAYS` — 운영 요일 (기본 월~금)
- `HOLIDAYS` — 휴무일
- `BOOKABLE_DAYS` — 며칠 앞까지 예약 가능한지
- `NOTICES` — 유의사항

색상은 `tailwind.config.js` 의 `blush`(핑크) / `sand`(베이지) 팔레트에서 변경할 수 있습니다.

---

## ✅ 구현 기능

- 메인(Hero · 서비스 소개 카드 · 실시간 예약 현황 · 예약 안내/유의사항) / 예약 / 예약 완료 페이지
- 학생 · 교직원 구분 (교직원은 학번 대신 `교직원` 저장)
- 예약 가능 시간 **초록색**, 마감 · 지난 시간 **회색** 비활성
- 입력값 유효성 검사 (이름, 학번 4~6자리, 휴대폰 형식, 동의 체크)
- 연락처 자동 하이픈
- 토스트 메시지 · 로딩 스피너 · 오버레이
- 접근성: 본문 바로가기, `aria-*` 속성, 키보드 조작(날짜 ←/→), 포커스 링, `prefers-reduced-motion` 대응
- SEO: title / meta description / Open Graph
- 라이트 모드 전용 (`color-scheme: light only`)
