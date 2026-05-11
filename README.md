# 알엔디비즈파트너 정책자금 분석 플랫폼

`analyze.rndbiz.kr` — 3분 진단으로 정책자금 한도를 분석하는 SPA

## 구성

| 파일 | 용도 |
|---|---|
| `index.html` | 메인 SPA (홈/진단/결과/사전/관리자/상담) — 단일 파일 |
| `404.html` | 잘못된 경로 진입 시 |
| `og-image.png` | 카카오톡/페이스북 미리보기 (1200×630) |
| `CNAME` | 커스텀 서브도메인 매핑 (`analyze.rndbiz.kr`) |
| `robots.txt` / `sitemap.xml` | 검색엔진 노출 |
| `.nojekyll` | GitHub Pages Jekyll 처리 비활성화 |
| `apps-script/Code.gs` | Google Apps Script (메일 + 시트 자동화) |

## 기술 스택

- **Frontend**: Vanilla JS · Tailwind CSS (CDN) · Pretendard Variable · Chart.js
- **데이터**: HTML 내 임베디드 JSON (30+ 정책자금, 9개 혁신성장 분야 163품목, 11개 가점 지표)
- **저장소**: localStorage (브라우저 로컬) + Google Sheets (Apps Script via fetch)
- **호스팅**: GitHub Pages (정적)
- **도메인**: `analyze.rndbiz.kr` (서브도메인)

## 배포 가이드

상세 단계별 가이드는 [`DEPLOY-GUIDE.md`](./DEPLOY-GUIDE.md)를 참조하세요.

### 핵심 흐름 (요약)

```
1. GitHub 새 저장소 → 이 폴더 전체 업로드
2. Settings → Pages → Source: main / root → Save
3. Custom domain: analyze.rndbiz.kr 입력 → Enforce HTTPS 체크
4. rndbiz.kr 호스팅(가비아 등)에서 CNAME 레코드 추가:
     analyze   →   <username>.github.io.
5. Google Sheets + Apps Script 셋업 → URL을 관리자 페이지에 입력
```

## 특징

- **자격 매칭 엔진**: 소상공인·중진공 30+ 자금 자동 매칭 (AND/OR 로직)
- **AI 자연어 분석**: 사업 설명에서 9개 혁신성장 분야 163개 품목 키워드 매칭
- **정책우선도 점수**: 11개 가점 지표 (고용·기술·경영·IPO·수출·그린 등)
- **비재무자산 보강 시뮬레이션**: 특허/계획서 추가 시 예상 한도 상승치
- **반응형 디자인**: 모바일/데스크톱 최적화, Pretendard 타이포그래피
- **관리자 대시보드**: KPI · 차트 · 리드 테이블 · CSV 내보내기

## 데이터 출처

- 2026년도 소상공인 정책자금 통합 체크리스트 (소상공인시장진흥공단)
- 2026년도 중진공 정책자금 통합 체크리스트 (중소벤처기업진흥공단)
- 중진공 정책우선도 평가 리스트
- 중진공 혁신성장·초격차·신산업 분야 리스트

## 라이선스 / 면책

본 진단은 참고용이며, 최종 자격은 각 기관(소상공인시장진흥공단·중소벤처기업진흥공단)의 심사로 결정됩니다.

---

© 2026 알엔디비즈파트너 · 1800-7657 · justyear@naver.com
