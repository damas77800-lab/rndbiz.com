/**
 * 알엔디비즈파트너 정책자금 분석 플랫폼
 * Google Apps Script — 진단/상담 데이터를 시트에 자동 기록 + 메일 알림
 *
 * 설치 방법:
 *  1. https://script.google.com 접속 → 새 프로젝트
 *  2. 이 파일 전체를 복사해 Code.gs에 붙여넣기
 *  3. 상단 CONFIG 섹션의 SHEET_ID, NOTIFY_EMAIL 수정
 *  4. 우상단 [배포] → [새 배포] → 유형: 웹 앱
 *     - 실행 사용자: 본인
 *     - 액세스: 모든 사용자  ← 매우 중요
 *  5. 발급된 웹 앱 URL을 복사
 *  6. 플랫폼 → 관리자 페이지 → "Apps Script Endpoint"에 붙여넣기 → 저장
 *
 * Sheet ID 찾는 법:
 *   구글 시트 URL이 https://docs.google.com/spreadsheets/d/[여기]/edit 일 때 [여기] 부분
 */

// ===================== CONFIG =====================
const SHEET_ID      = "1l1qye0EUiy4EkSoS74Y53BnWv9VaJnnb1y3SyBK_YbE";
const SHEET_NAME    = "leads";                            // 탭 이름 (없으면 자동 생성)
const NOTIFY_EMAIL  = "justyear@naver.com";              // 알림 받을 메일
const NOTIFY_BCC    = "";                                 // 부 알림(선택)
const COMPANY_NAME  = "알엔디비즈파트너";
// ==================================================

// ===================== 코드 → 한국어 변환 맵 =====================
const LABEL = {
  bizType: { soso:"소상공인", smba:"중소기업(중진공)", prep:"예비창업자" },
  industry: { manufacturing:"제조업", service:"서비스업·IT", wholesale:"도소매·유통",
              construction:"건설업", logistics:"운수·물류", restaurant:"음식·카페",
              beauty:"미용·헬스", other:"기타" },
  age: { under90d:"90일 미만 / 예비", under3y:"3년 미만", under7y:"3~7년",
         over7y:"7~10년", over10y:"10년 이상" },
  ceoAge: { under39:"만 39세 이하 (청년)", "40plus":"만 40세 이상" },
  revenue: { "0":"매출 없음", under5k:"5천만원 미만", under1e:"5천~1억",
             under5e:"1억~5억", under10e:"5억~10억", under30e:"10억~30억",
             under60e:"30억~60억", over60e:"60억 이상" },
  employees: { "0":"0명", "1-4":"1~4명", "5-9":"5~9명", "10-49":"10~49명", "50plus":"50명 이상" },
  credit: { good:"정상 (NCB 840+)", mid:"중·저신용 (839↓)", recovery:"신용회복 진행", bankrupt:"파산/회생 이력" },
  export: { none:"없음", under1k:"$1,000 미만", under10w:"$1k~$10만", over10w:"$10만 이상" }
};
function lbl(map, val) { return (val && LABEL[map] && LABEL[map][val]) ? LABEL[map][val] : (val || "-"); }

/**
 * POST 요청 처리 — 플랫폼에서 진단/상담 시 호출됨
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendToSheet(data);
    sendNotification(data);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("Error: " + err);
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET 요청 — 헬스체크용
 */
function doGet() {
  return ContentService.createTextOutput("RNDBIZ Apps Script OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * 시트에 한 행 추가 — 헤더가 없으면 자동 생성
 */
function appendToSheet(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  // 헤더가 없으면 자동 생성 + 서식 적용
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "접수일시","접수날짜","접수시간","유형","상호","대표/직책","연락처","이메일",
      "기업구분","업종","업력","대표연령","매출규모","근로자수","신용상태","수출실적","소재지",
      "보유자산·인증","AI혁신분야","사업설명","매칭자금(건)","예상금액(원)","비재무보강시(원)","정책우선도","유입경로","요청사항","상태"
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold").setBackground("#0a1628").setFontColor("#ffffff").setFontSize(11);
    sheet.setFrozenRows(1);
    // 열 너비 자동 조정
    sheet.setColumnWidth(1, 150);  // 접수일시
    sheet.setColumnWidth(2, 100);  // 접수날짜
    sheet.setColumnWidth(3, 90);   // 접수시간
    sheet.setColumnWidth(4, 70);   // 유형
    sheet.setColumnWidth(5, 130);  // 상호
    sheet.setColumnWidth(6, 110);  // 대표/직책
    sheet.setColumnWidth(7, 120);  // 연락처
    sheet.setColumnWidth(8, 160);  // 이메일
    sheet.setColumnWidth(18, 180); // 보유자산
    sheet.setColumnWidth(19, 150); // AI분야
    sheet.setColumnWidth(20, 250); // 사업설명
  }

  const p = data.profile || {};
  const s = data.summary || {};
  const now = new Date(data.when || Date.now());

  // 날짜·시간 분리 포맷
  const dateStr = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd");
  const timeStr = Utilities.formatDate(now, "Asia/Seoul", "HH:mm:ss");
  const dateTimeStr = dateStr + " " + timeStr;

  // AI 분야 매칭 텍스트
  const aiFields = (p.aiFields || []).slice(0, 3).map(f => `${f.name}(${f.score}%)`).join(" / ");

  // 보유 자산·인증 코드 → 읽기 쉬운 값
  const assetMap = {
    patent:"특허/실용신안", copyright:"저작권", rnd_lab:"기업부설연구소", rnd_dept:"R&D전담부서",
    innobiz:"이노비즈", mainbiz:"메인비즈", venture:"벤처기업", net_nep:"NET/NEP",
    green_tech:"녹색기술인증", ip_mgmt:"지식재산경영", root_tech:"뿌리기술전문",
    smart_factory:"스마트공장", kbeauty:"K-뷰티발주기업", women:"여성기업",
    export_cert:"수출실적증명", disaster:"재해피해확인증", hope_pkg:"희망리턴패키지",
    restart:"재창업기업", social:"사회적기업/협동조합", hundred:"백년소공인/백년가게",
    scaleup:"스케일업투자", vc_invest:"VC/엔젤투자유치", cooperative:"협동화/협업사업"
  };
  const assetsText = (p.assets || []).map(a => assetMap[a] || a).join(", ") || "-";

  const newRow = [
    dateTimeStr,                              // 접수일시 (합친 문자열)
    dateStr,                                  // 접수날짜
    timeStr,                                  // 접수시간
    data.type === "consultation" ? "💬 상담" : "📊 진단",
    data.name || "",                          // 상호
    data.ceo || "",                           // 대표/직책
    data.phone || "",                         // 연락처
    data.email || "",                         // 이메일
    lbl("bizType", p.bizType || data.bizType),// 기업구분
    lbl("industry", p.industry || data.industry), // 업종
    lbl("age", p.age),                        // 업력
    lbl("ceoAge", p.ceoAge),                  // 대표연령
    lbl("revenue", p.revenue),                // 매출규모
    lbl("employees", p.employees),            // 근로자수
    lbl("credit", p.credit),                  // 신용상태
    lbl("export", p.export),                  // 수출실적
    p.region || "",                           // 소재지
    assetsText,                               // 보유자산·인증
    aiFields || "-",                          // AI혁신분야
    (p.pitch || "").slice(0, 500),            // 사업설명
    data.fundCount || s.pass || 0,            // 매칭자금(건)
    data.expected || s.totalLimit || 0,       // 예상금액(원)
    s.uplift || 0,                            // 비재무보강시(원)
    data.priority || s.priority || 0,         // 정책우선도
    data.source || "",                        // 유입경로
    data.msg || "",                           // 요청사항
    data.status || "신규"                     // 상태
  ];

  const newRowIndex = sheet.getLastRow() + 1;
  sheet.appendRow(newRow);

  // 짝수 행 배경 연하게
  if (newRowIndex % 2 === 0) {
    sheet.getRange(newRowIndex, 1, 1, newRow.length).setBackground("#f8f9fb");
  }
  // 예상금액·보강금액 열은 숫자 형식으로
  sheet.getRange(newRowIndex, 22).setNumberFormat("#,##0");
  sheet.getRange(newRowIndex, 23).setNumberFormat("#,##0");
}

/**
 * 메일 알림 — HTML 템플릿
 */
function sendNotification(data) {
  if (!NOTIFY_EMAIL) return;
  const isConsult = data.type === "consultation";
  const subject = isConsult
    ? `[${COMPANY_NAME}] 💬 새 상담 신청 — ${data.name || "고객"}`
    : `[${COMPANY_NAME}] 📊 새 진단 — ${data.profile?.industry || "고객"} (예상 ${formatKRW(data.expected||0)})`;

  const p = data.profile || {};
  const s = data.summary || {};
  const aiFields = (p.aiFields||[]).slice(0,4).map(f=>`<span style="display:inline-block;background:#fbeed5;color:#8b5e2d;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;margin:2px;">${f.icon||"🤖"} ${f.name} ${f.score}%</span>`).join(" ");
  const assets = (p.assets||[]).map(a=>`<span style="display:inline-block;background:#f1f5f9;color:#334155;padding:3px 10px;border-radius:999px;font-size:11px;margin:2px;">${a}</span>`).join(" ") || "<span style='color:#94a3b8'>(보유자산 미선택)</span>";

  const html = `
    <div style="font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;max-width:640px;margin:0 auto;background:#fafaf9;color:#0a0e16;">
      <div style="background:linear-gradient(135deg,#0a1628,#0e1d33);color:#fff;padding:30px 30px 24px;border-radius:14px 14px 0 0;">
        <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#d4a574;font-weight:600;">${COMPANY_NAME} · NEW LEAD</div>
        <h2 style="margin:8px 0 0;font-size:24px;font-weight:800;letter-spacing:-.02em;">${isConsult?"💬 상담 신청 접수":"📊 자금 진단 완료"}</h2>
        <div style="margin-top:10px;color:rgba(255,255,255,.7);font-size:13px;">${new Date(data.when||Date.now()).toLocaleString("ko-KR")}</div>
      </div>

      <div style="background:#fff;padding:30px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#525c6e;width:120px;">상호</td><td style="font-weight:600;">${data.name||"-"}</td></tr>
          ${isConsult?`
            <tr><td style="padding:8px 0;color:#525c6e;">대표/직책</td><td style="font-weight:600;">${data.ceo||"-"}</td></tr>
            <tr><td style="padding:8px 0;color:#525c6e;">연락처</td><td style="font-weight:600;"><a href="tel:${data.phone||""}" style="color:#007da5;">${data.phone||"-"}</a></td></tr>
            <tr><td style="padding:8px 0;color:#525c6e;">이메일</td><td style="font-weight:600;">${data.email||"-"}</td></tr>
            <tr><td style="padding:8px 0;color:#525c6e;">유입경로</td><td>${data.source||"-"}</td></tr>
          `:""}
          <tr><td style="padding:8px 0;color:#525c6e;">업종</td><td>${p.industry||data.industry||"-"} · 업력 ${p.age||"-"}</td></tr>
          <tr><td style="padding:8px 0;color:#525c6e;">매출/근로자</td><td>${p.revenue||"-"} · ${p.employees||"-"}</td></tr>
          <tr><td style="padding:8px 0;color:#525c6e;">신용/체납</td><td>${p.credit||"-"} · 체납 ${p.tax||"-"}</td></tr>
          <tr><td style="padding:8px 0;color:#525c6e;">수출/소재지</td><td>${p.export||"-"} · ${p.region||"-"}</td></tr>
        </table>

        <div style="margin-top:24px;padding:20px;background:#fafaf9;border-radius:12px;">
          <div style="font-size:11px;color:#8b5e2d;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">— Result Summary</div>
          <table style="width:100%;margin-top:12px;border-collapse:collapse;">
            <tr>
              <td style="width:50%;padding:6px 0;">
                <div style="color:#525c6e;font-size:12px;">예상 매칭 한도</div>
                <div style="font-weight:800;font-size:22px;color:#0a1628;letter-spacing:-.02em;">${formatKRW(data.expected||s.totalLimit||0)}</div>
              </td>
              <td style="width:50%;padding:6px 0;">
                <div style="color:#525c6e;font-size:12px;">정책우선도</div>
                <div style="font-weight:800;font-size:22px;color:#0a1628;letter-spacing:-.02em;">${data.priority||s.priority||0}점</div>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;">
                <div style="color:#525c6e;font-size:12px;">충족 자금</div>
                <div style="font-weight:700;font-size:16px;">${data.fundCount||s.pass||0}건${s.near?` (보강시 +${s.near}건)`:""}</div>
              </td>
              <td style="padding:6px 0;">
                <div style="color:#525c6e;font-size:12px;">비재무 보강시</div>
                <div style="font-weight:700;font-size:16px;color:#b8854f;">${formatKRW(s.uplift||0)}</div>
              </td>
            </tr>
          </table>
        </div>

        ${aiFields?`
        <div style="margin-top:18px;">
          <div style="font-size:12px;color:#525c6e;font-weight:600;margin-bottom:8px;">AI 분야 매칭</div>
          ${aiFields}
        </div>`:""}

        <div style="margin-top:18px;">
          <div style="font-size:12px;color:#525c6e;font-weight:600;margin-bottom:8px;">보유 자산·인증</div>
          ${assets}
        </div>

        ${p.pitch?`
        <div style="margin-top:18px;padding:14px;background:#fafaf9;border-radius:10px;">
          <div style="font-size:12px;color:#525c6e;font-weight:600;margin-bottom:6px;">사업 설명</div>
          <div style="font-size:13px;color:#0a0e16;line-height:1.6;">${escapeHtml(p.pitch).slice(0,500)}</div>
        </div>`:""}

        ${data.msg?`
        <div style="margin-top:14px;padding:14px;background:#fff7ed;border-left:3px solid #d4a574;border-radius:6px;">
          <div style="font-size:12px;color:#8b5e2d;font-weight:600;margin-bottom:6px;">요청 사항</div>
          <div style="font-size:13px;color:#0a0e16;line-height:1.6;">${escapeHtml(data.msg)}</div>
        </div>`:""}
      </div>

      <div style="background:#0a1628;color:rgba(255,255,255,.6);padding:20px 30px;border-radius:0 0 14px 14px;font-size:11px;">
        <div>이 메일은 <b style="color:#d4a574;">analyze.rndbiz.kr</b>에서 자동 발송되었습니다.</div>
        <div style="margin-top:4px;">고객 데이터는 구글 시트에 자동 백업됩니다.</div>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    bcc: NOTIFY_BCC || undefined,
    subject: subject,
    htmlBody: html,
    name: COMPANY_NAME
  });
}

function formatKRW(n) {
  n = Number(n) || 0;
  if (n >= 100000000) return (n/100000000).toFixed(1).replace(/\.0$/,"") + "억원";
  if (n >= 10000) return Math.floor(n/10000) + "만원";
  return n.toLocaleString() + "원";
}

function escapeHtml(s) {
  return String(s||"").replace(/[&<>"']/g, m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

/**
 * 테스트 함수 — 에디터에서 실행해 셋업 검증
 */
function testRun() {
  const sample = {
    type:"consultation",
    name:"테스트 회사",
    ceo:"홍길동/대표",
    phone:"010-1234-5678",
    email:"test@example.com",
    msg:"세팅 테스트 메일입니다.",
    source:"테스트",
    when:new Date().toISOString(),
    expected:500000000,
    priority:65,
    fundCount:3,
    profile:{industry:"service",age:"under3y",ceoAge:"under39",revenue:"under5e",employees:"5-9",credit:"good",tax:"none",export:"none",region:"서울",assets:["patent","venture"],pitch:"AI SaaS 플랫폼",aiFields:[{icon:"🤖",name:"인공지능",score:80},{icon:"💻",name:"ICT·디지털",score:60}]},
    summary:{pass:3,near:5,fail:8,totalLimit:500000000,uplift:1200000000,priority:65}
  };
  appendToSheet(sample);
  sendNotification(sample);
  Logger.log("✅ 테스트 완료 — 시트와 메일을 확인하세요");
}
