# 🚀 배포 가이드 — 알엔디비즈파트너 정책자금 분석 플랫폼

> 개발자가 아니어도 따라할 수 있도록 화면을 보면서 단계별로 작성했습니다.
> 총 소요 시간: **약 30분** (DNS 전파 대기 시간 별도)

---

## 📋 전체 흐름

```
[1단계]  GitHub 계정 만들기 (5분)
[2단계]  저장소 만들고 파일 업로드 (5분)
[3단계]  GitHub Pages 활성화 (3분)
[4단계]  rndbiz.kr DNS에 서브도메인 추가 (5분)
[5단계]  Google Sheets + Apps Script 연동 (10분)
[6단계]  네이버 / 구글 검색 등록 (10분, 선택)
```

---

## 🔵 1단계 — GitHub 계정 만들기 (이미 있으면 건너뛰기)

1. <https://github.com> 접속
2. 우상단 **Sign up** 클릭
3. 이메일(`justyear@naver.com`), 비밀번호, 사용자명(`rndbiz` 등) 입력
4. 이메일 인증 완료

**⚠️ 사용자명 정하기**: 도메인에 영향을 줍니다. 깔끔한 영문(`rndbiz`, `rndbizpartner` 등)을 추천합니다.

---

## 🔵 2단계 — 저장소(Repository) 만들고 파일 업로드

### 2-1. 새 저장소 생성

1. 로그인 후 우상단 **+** → **New repository** 클릭
2. 입력값:
   - **Repository name**: `rndbiz-platform` (또는 원하는 이름)
   - **Public** 선택 (Pages 무료 사용 조건)
   - **Add a README file** 체크 해제 (우리가 직접 업로드)
3. **Create repository** 클릭

### 2-2. 파일 업로드

1. 새로 만든 빈 저장소 페이지에서 **uploading an existing file** 링크 클릭
2. 이 폴더(`rndbiz-platform`)의 **모든 파일과 폴더를 드래그**해서 업로드 영역에 끌어다 놓기
   - `index.html`, `404.html`, `og-image.png`, `og-image.svg`, `CNAME`, `robots.txt`, `sitemap.xml`, `.nojekyll`, `README.md`, `DEPLOY-GUIDE.md`
   - `apps-script` 폴더(안에 `Code.gs` 포함)
3. 페이지 하단 **Commit changes** 클릭

> 💡 `.nojekyll`이 안 보이면, 파일 업로드 창에서 "숨김 파일 표시"를 켜야 합니다. 또는 GitHub 웹에서 **Add file → Create new file**로 파일명 `.nojekyll` (내용 비움)으로 직접 만드세요.

---

## 🔵 3단계 — GitHub Pages 활성화

1. 저장소 상단 메뉴에서 **Settings** 클릭
2. 좌측 사이드바 **Pages** 클릭
3. 다음과 같이 설정:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / Folder: `/ (root)` → **Save**
4. 1~2분 기다리면 페이지 상단에 다음 메시지가 뜹니다:
   ```
   ✅ Your site is live at https://<사용자명>.github.io/rndbiz-platform/
   ```
5. 그 URL을 클릭해서 사이트가 정상으로 뜨는지 확인

---

## 🔵 4단계 — `analyze.rndbiz.kr` 서브도메인 연결

### 4-1. GitHub에서 커스텀 도메인 입력

1. 같은 **Settings → Pages** 화면에서 하단 **Custom domain** 영역에:
   ```
   analyze.rndbiz.kr
   ```
   입력 → **Save**
2. **Enforce HTTPS** 체크박스가 활성화되면 체크 (DNS 적용 후 가능)

### 4-2. rndbiz.kr 도메인 호스팅사에서 DNS 추가

`rndbiz.kr` 도메인을 가비아·후이즈·카페24 등 어디서 구매했는지 확인하세요.

#### 가비아의 경우 예시

1. <https://my.gabia.com> 로그인
2. **My가비아** → **이용중인 서비스** → 도메인 → **DNS 정보** → **DNS 관리**
3. **레코드 추가**:

| 타입 | 호스트 | 값/위치 | TTL |
|---|---|---|---|
| `CNAME` | `analyze` | `<사용자명>.github.io.` | `3600` |

   - 예: `rndbiz.github.io.` (마지막 점 `.` 포함)
4. **확인** → **저장**

#### 다른 호스팅사도 동일

찾을 메뉴 키워드: **DNS 관리 / DNS 레코드 / 네임서버 설정**

### 4-3. DNS 전파 확인 (5분 ~ 24시간 소요)

다음 명령어 또는 사이트에서 적용 여부 확인:

- 사이트: <https://www.whatsmydns.net> → `analyze.rndbiz.kr` 입력 → CNAME 검색
- 명령어 (윈도우 cmd): `nslookup analyze.rndbiz.kr`

확인 완료되면 GitHub Pages에서 ✅ **DNS check successful** 메시지가 뜹니다. 그 후 **Enforce HTTPS** 체크.

🎉 **이제 `https://analyze.rndbiz.kr` 로 접속됩니다!**

---

## 🔵 5단계 — Google Sheets + Apps Script 연동

진단/상담 데이터가 자동으로 구글 시트에 기록되고, `justyear@naver.com`으로 메일이 발송됩니다.

### 5-1. 구글 시트 만들기

1. <https://sheets.google.com> 접속 → 새 스프레드시트
2. 이름: `RNDBIZ 정책자금 진단 리드`
3. URL의 가운데 ID 복사:
   ```
   https://docs.google.com/spreadsheets/d/[이부분이 SHEET_ID]/edit
   ```

### 5-2. Apps Script 작성

1. <https://script.google.com> 접속 → **새 프로젝트**
2. 프로젝트 이름: `RNDBIZ Lead Webhook`
3. 좌측 `Code.gs` 파일 내용을 모두 지우고, 이 폴더의 **`apps-script/Code.gs` 내용을 복사해 붙여넣기**
4. 상단 `CONFIG` 섹션 수정:
   ```javascript
   const SHEET_ID     = "여기에_5-1에서_복사한_SHEET_ID_붙여넣기";
   const NOTIFY_EMAIL = "justyear@naver.com";
   ```
5. **저장** (Ctrl/Cmd + S)

### 5-3. 권한 부여 + 테스트

1. 상단 함수 선택 드롭다운에서 **`testRun`** 선택 → **▷ 실행**
2. 첫 실행 시 권한 요청 팝업:
   - **권한 검토** → 본인 구글 계정 선택
   - "이 앱은 Google에서 확인하지 않았습니다" 화면 → **고급** → **(안전하지 않음으로) 이동**
   - 권한 허용
3. 실행 완료 후:
   - 구글 시트에 헤더와 1행 테스트 데이터가 추가됨 ✓
   - `justyear@naver.com`으로 알림 메일 도착 ✓

### 5-4. 웹 앱으로 배포

1. Apps Script 우상단 **배포** → **새 배포**
2. 톱니바퀴 ⚙ → **웹 앱** 선택
3. 설정:
   - **설명**: `Lead Webhook v1`
   - **다음 사용자로 실행**: `나` (본인 계정)
   - **액세스 권한**: **모든 사용자** ⚠️ (이게 핵심)
4. **배포** 클릭
5. 발급된 **웹 앱 URL** 복사 (`https://script.google.com/macros/s/.../exec`)

### 5-5. 플랫폼에 URL 입력

1. `https://analyze.rndbiz.kr` 접속
2. 우상단 **관리자** 클릭 → 비밀번호 `rndbiz2026` (배포 후 코드 수정 권장)
3. 하단 **외부 연동 상태** 카드:
   - **Apps Script Endpoint** 입력란에 5-4의 웹 앱 URL 붙여넣기
   - **저장** → ✓ 저장됨 메시지 확인

이제부터 진단/상담 신청이 들어올 때마다:
- 📊 구글 시트에 자동 행 추가
- 📧 `justyear@naver.com`으로 디자인된 알림 메일 발송

---

## 🔵 6단계 — 검색 엔진 등록 (선택, 검색 노출용)

### 6-1. 네이버 서치어드바이저

1. <https://searchadvisor.naver.com> 로그인
2. **웹마스터 도구** → **사이트 등록** → `https://analyze.rndbiz.kr`
3. 소유 확인 방법 → **HTML 태그**:
   - `<meta name="naver-site-verification" content="abc123..." />` 발급됨
   - `index.html` 파일에서 `REPLACE_WITH_NAVER_VERIFICATION_CODE` 부분을 발급된 코드로 교체
   - GitHub에서 파일 수정 → 커밋
4. 다시 네이버 → **확인** 클릭
5. **사이트맵 제출**: `https://analyze.rndbiz.kr/sitemap.xml`

### 6-2. 구글 서치 콘솔

1. <https://search.google.com/search-console> 로그인
2. **속성 추가** → URL 접두어 → `https://analyze.rndbiz.kr/`
3. HTML 태그 인증 → 발급된 메타 태그를 `index.html`의 `REPLACE_WITH_GOOGLE_VERIFICATION_CODE` 자리에 교체
4. 사이트맵 제출: `sitemap.xml`

### 6-3. 카카오톡 미리보기 캐시 갱신 (이미 공유한 경우)

카카오톡은 OG 이미지를 캐싱합니다. 디자인 변경 후 다음 URL에서 캐시 초기화:

- <https://developers.kakao.com/tool/clear/og> (카카오 개발자 계정 필요)

---

## 🛠 자주 묻는 질문

### Q. GitHub Pages가 404로만 떠요
- `index.html` 파일이 저장소 **루트에** 있는지 확인
- `.nojekyll` 파일이 있는지 확인
- Settings → Pages에서 Branch가 `main`/`/(root)`로 되어 있는지

### Q. `analyze.rndbiz.kr`이 연결 안 돼요
- DNS 전파 시간(최대 24시간) 대기
- CNAME 값 끝에 점(`.`)이 있는지 확인 (`username.github.io.`)
- `nslookup analyze.rndbiz.kr` 명령어로 응답 확인

### Q. 메일이 안 와요
- Apps Script `testRun` 함수가 시트에 행을 추가하는지 확인
- 네이버 메일 스팸함 확인 (구글 보낸 메일은 종종 스팸 처리)
- Apps Script 실행 로그(`보기` → `실행`)에서 오류 확인

### Q. 관리자 비밀번호를 바꾸고 싶어요
- `index.html` 파일 검색: `rndbiz2026` → 원하는 비밀번호로 교체 후 커밋
- 더 안전한 방법은 백엔드 인증 추가(차후 업그레이드)

### Q. 새 정책자금이 추가되거나 데이터를 수정하고 싶어요
- `index.html` 파일에서 `const FUNDS = [` 검색
- 자금 객체 추가/수정 → 커밋
- GitHub Pages가 자동 재배포 (1분)

### Q. 카카오톡 미리보기가 다르게 보여요
- 첫 공유 시 캐시되어 OG가 굳어짐 → 위 6-3 캐시 초기화

---

## 🎉 배포 완료 체크리스트

- [ ] GitHub 저장소에 모든 파일 업로드됨
- [ ] `https://<사용자명>.github.io/<저장소명>/` 접속 시 사이트 표시
- [ ] DNS CNAME 레코드 추가됨
- [ ] `https://analyze.rndbiz.kr` 접속 시 사이트 표시 (HTTPS)
- [ ] 자가진단 4단계 정상 동작
- [ ] 결과 페이지 자금 매칭 표시
- [ ] 관리자(`rndbiz2026`) 로그인 가능
- [ ] Apps Script URL 저장됨
- [ ] 테스트 상담 신청 → 시트 + 메일 도착 확인
- [ ] 카카오톡으로 URL 공유 → OG 이미지 미리보기 정상

---

## 📞 도움이 필요하면

추가 개발 (백엔드 마이그레이션, OpenAI/Claude 실제 LLM 매칭 고도화, B2B 컨설턴트 권한 분리 등):
- 본 플랫폼 관리자 페이지 → "외부 연동 상태" 영역 옆 "추가 기능 요청" 메뉴 (차후 추가 가능)

---

© 2026 알엔디비즈파트너 · Built with Pretendard · Hosted on GitHub Pages
