/**
 * =============================================================
 *  뷰티과 실습 예약 시스템 - Google Apps Script 백엔드
 * =============================================================
 *  설치 방법
 *  1. Google Sheets 새 문서 생성
 *  2. 확장 프로그램 > Apps Script 열기
 *  3. 이 파일 내용을 Code.gs 에 붙여넣고 저장
 *  4. 함수 선택 > setup 실행 (최초 1회, 권한 승인)
 *  5. 배포 > 새 배포 > 유형: 웹 앱
 *       - 실행 사용자: 나
 *       - 액세스 권한: 모든 사용자
 *  6. 발급된 웹 앱 URL(.../exec)을 React 프로젝트 .env 의 VITE_GAS_URL 에 입력
 *
 *  ※ 코드를 수정하면 "배포 관리 > 편집 > 새 버전"으로 다시 배포해야 반영됩니다.
 * =============================================================
 */

const SHEET_NAME = '예약';
const HEADERS = ['예약일시', '이름', '학번', '연락처', '서비스', '예약날짜', '예약시간', '요청사항', '상태'];
const DEFAULT_STATUS = '예약완료';
const CANCELLED_STATUS = '취소'; // 상태를 '취소'로 바꾸면 해당 시간은 다시 예약 가능

const SERVICES = ['메이크업', '네일', '피부에스테틱'];
const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '14:30', '15:00'];

// 예약 가능한 날짜 (비워두면 [] 날짜 제한 없음) — 프론트엔드 ALLOWED_DATES 와 동일하게 유지
const ALLOWED_DATES = ['2026-11-25', '2026-11-26'];

const COL = {
  timestamp: 1, name: 2, studentId: 3, phone: 4, service: 5, date: 6, time: 7, memo: 8, status: 9,
};

/* ------------------------------------------------------------
 *  최초 1회 실행: 시트/헤더/서식 생성
 * ---------------------------------------------------------- */
function setup() {
  const sheet = getSheet_();
  SpreadsheetApp.getActive().toast('예약 시트가 준비되었습니다.', '뷰티과 예약', 5);
  return sheet.getName();
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#fbe9ec')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    // 연락처/날짜/시간이 자동 변환되지 않도록 텍스트 서식 지정
    sheet.getRange('C:G').setNumberFormat('@');
    sheet.setColumnWidths(1, HEADERS.length, 120);
    sheet.setColumnWidth(COL.memo, 260);

    // 상태 드롭다운
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList([DEFAULT_STATUS, '방문완료', CANCELLED_STATUS], true)
      .build();
    sheet.getRange(2, COL.status, 1000, 1).setDataValidation(rule);
  }
  return sheet;
}

/* ------------------------------------------------------------
 *  GET  ?action=booked&date=YYYY-MM-DD   -> 해당 날짜 예약된 시간
 *  GET  ?action=check&date=...&time=...  -> 특정 시간 예약 가능 여부
 *  GET  (기본)                            -> 상태 확인
 * ---------------------------------------------------------- */
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const action = p.action || 'health';

    if (action === 'booked') {
      if (!isValidDate_(p.date)) return json_({ ok: false, code: 'INVALID', message: '날짜 형식이 올바르지 않습니다.' });
      return json_({ ok: true, date: p.date, booked: getBookedTimes_(p.date) });
    }

    if (action === 'check') {
      if (!isValidDate_(p.date) || TIME_SLOTS.indexOf(p.time) === -1) {
        return json_({ ok: false, code: 'INVALID', message: '날짜/시간 형식이 올바르지 않습니다.' });
      }
      const available = getBookedTimes_(p.date).indexOf(p.time) === -1;
      return json_({ ok: true, available: available });
    }

    return json_({ ok: true, message: 'Beauty reservation API is running.' });
  } catch (err) {
    return json_({ ok: false, code: 'SERVER', message: '서버 오류: ' + err.message });
  }
}

/* ------------------------------------------------------------
 *  POST (Content-Type: text/plain, body = JSON)
 *  { timestamp, name, studentId, phone, service, date, time, memo }
 * ---------------------------------------------------------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // 동시에 같은 시간 예약이 들어오는 경우를 막기 위해 잠금
    lock.waitLock(10000);

    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const error = validate_(data);
    if (error) return json_({ ok: false, code: 'INVALID', message: error });

    // 서버 측 중복 검사 (동일 날짜 + 동일 시간)
    if (getBookedTimes_(data.date).indexOf(data.time) !== -1) {
      return json_({ ok: false, code: 'DUPLICATE', message: '이미 예약된 시간입니다. 다른 시간을 선택해 주세요.' });
    }

    const tz = Session.getScriptTimeZone() || 'Asia/Seoul';
    const createdAt = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
    const row = [
      createdAt,
      String(data.name).trim(),
      String(data.studentId).trim(),
      String(data.phone).replace(/\D/g, ''),
      data.service,
      data.date,
      data.time,
      String(data.memo || '').trim().slice(0, 200),
      DEFAULT_STATUS,
    ];

    const sheet = getSheet_();
    const next = sheet.getLastRow() + 1;
    sheet.getRange(next, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    SpreadsheetApp.flush();

    return json_({
      ok: true,
      reservation: {
        timestamp: createdAt,
        name: row[1],
        studentId: row[2],
        phone: row[3],
        service: row[4],
        date: row[5],
        time: row[6],
        memo: row[7],
        status: DEFAULT_STATUS,
      },
    });
  } catch (err) {
    return json_({ ok: false, code: 'SERVER', message: '예약 처리 중 오류가 발생했습니다: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------
 *  헬퍼
 * ---------------------------------------------------------- */
function getBookedTimes_(date) {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const values = sheet.getRange(2, COL.date, last - 1, COL.status - COL.date + 1).getValues();
  const booked = [];
  values.forEach(function (r) {
    const d = normalizeDate_(r[0]);
    const t = normalizeTime_(r[1]);
    const status = String(r[3] || '').trim();
    if (d === date && t && status !== CANCELLED_STATUS) booked.push(t);
  });
  return booked;
}

function validate_(d) {
  if (!d.name || String(d.name).trim().length < 2) return '이름을 입력해 주세요.';
  if (!d.studentId) return '학번을 입력해 주세요.';
  if (!/^01[016789]\d{7,8}$/.test(String(d.phone || '').replace(/\D/g, ''))) return '연락처 형식이 올바르지 않습니다.';
  if (SERVICES.indexOf(d.service) === -1) return '서비스를 선택해 주세요.';
  if (!isValidDate_(d.date)) return '예약 날짜가 올바르지 않습니다.';
  if (ALLOWED_DATES.length && ALLOWED_DATES.indexOf(d.date) === -1) return '예약할 수 없는 날짜입니다.';
  if (TIME_SLOTS.indexOf(d.time) === -1) return '예약 시간이 올바르지 않습니다.';
  return '';
}

function isValidDate_(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// 시트에서 수동 입력해 Date 로 변환된 값도 안전하게 처리
function normalizeDate_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone() || 'Asia/Seoul', 'yyyy-MM-dd');
  return String(v || '').trim();
}

function normalizeTime_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone() || 'Asia/Seoul', 'HH:mm');
  const s = String(v || '').trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
