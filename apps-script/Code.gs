/**
 * 뷰티과 실습 예약 시스템 - Google Apps Script 백엔드
 * 설치: 시트 > 확장 프로그램 > Apps Script 에 붙여넣기 > setup 실행 > 웹 앱으로 배포(모든 사용자)
 * 코드 수정 후: 배포 > 배포 관리 > 편집 > 버전: 새 버전 > 배포  (URL 유지)
 */

const SHEET_NAME = '예약';
const HEADERS = ['예약일시', '이름', '학번', '연락처', '서비스', '예약날짜', '예약시간', '요청사항', '상태'];
const DEFAULT_STATUS = '예약완료';
const CANCELLED_STATUS = '취소'; // 상태를 '취소'로 바꾸면 해당 시간은 다시 예약 가능

// 서비스별 예약 일정 — 프론트엔드 src/config/services.js 의 SCHEDULE 과 동일하게 유지
const SCHEDULE = {
  '피부에스테틱': {
    '2026-11-26': ['12:20', '13:30'],
  },
  '메이크업': {
    '2026-11-27': ['09:00', '10:00', '12:20', '13:30'],
  },
  '네일': {
    '2026-11-27': ['09:00', '10:00', '12:20', '13:30'],
  },
};

// 한 타임당 최대 인원 — 프론트엔드 CAPACITY 와 동일하게 유지
const CAPACITY = {
  '메이크업': 8,
  '네일': 5,
  '피부에스테틱': 6,
};

function timesFor_(service, date) {
  return (SCHEDULE[service] && SCHEDULE[service][date]) || [];
}

const COL = { timestamp: 1, name: 2, studentId: 3, phone: 4, service: 5, date: 6, time: 7, memo: 8, status: 9 };

function setup() {
  const sheet = getSheet_();
  SpreadsheetApp.getActive().toast('예약 시트가 준비되었습니다.', '뷰티과 예약', 5);
  return sheet.getName();
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#fbe9ec').setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.getRange('C:G').setNumberFormat('@');
    sheet.setColumnWidths(1, HEADERS.length, 120);
    sheet.setColumnWidth(COL.memo, 260);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList([DEFAULT_STATUS, '방문완료', CANCELLED_STATUS], true).build();
    sheet.getRange(2, COL.status, 1000, 1).setDataValidation(rule);
  }
  return sheet;
}

/**
 * GET ?action=booked&date=YYYY-MM-DD&service=네일  -> 해당 서비스·날짜의 예약된 시간
 */
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const action = p.action || 'health';
    if (action === 'booked') {
      if (!isValidDate_(p.date)) return json_({ ok: false, code: 'INVALID', message: '날짜 형식이 올바르지 않습니다.' });
      return json_({ ok: true, date: p.date, service: p.service || '', booked: getBookedTimes_(p.date, p.service) });
    }
    return json_({ ok: true, message: 'Beauty reservation API is running.' });
  } catch (err) {
    return json_({ ok: false, code: 'SERVER', message: '서버 오류: ' + err.message });
  }
}

/**
 * POST (text/plain, JSON) { timestamp, name, studentId, phone, service, date, time, memo }
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const error = validate_(data);
    if (error) return json_({ ok: false, code: 'INVALID', message: error });

    // 정원 검사: 같은 서비스 + 같은 날짜 + 같은 시간의 예약 수가 정원 이상이면 마감
    const count = getBookedTimes_(data.date, data.service).filter(function (t) { return t === data.time; }).length;
    if (count >= (CAPACITY[data.service] || 1)) {
      return json_({ ok: false, code: 'DUPLICATE', message: '정원이 마감된 시간입니다. 다른 시간을 선택해 주세요.' });
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
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    SpreadsheetApp.flush();

    return json_({
      ok: true,
      reservation: {
        timestamp: createdAt, name: row[1], studentId: row[2], phone: row[3],
        service: row[4], date: row[5], time: row[6], memo: row[7], status: DEFAULT_STATUS,
      },
    });
  } catch (err) {
    return json_({ ok: false, code: 'SERVER', message: '예약 처리 중 오류가 발생했습니다: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}

/** 해당 날짜(+서비스)에 예약된 시간 목록. service 가 없으면 모든 서비스 */
function getBookedTimes_(date, service) {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const values = sheet.getRange(2, COL.service, last - 1, COL.status - COL.service + 1).getValues();
  const booked = [];
  values.forEach(function (r) {
    const s = String(r[0] || '').trim();
    const d = normalizeDate_(r[1]);
    const t = normalizeTime_(r[2]);
    const status = String(r[4] || '').trim();
    if (d === date && t && status !== CANCELLED_STATUS && (!service || s === service)) booked.push(t);
  });
  return booked;
}

function validate_(d) {
  if (!d.name || String(d.name).trim().length < 2) return '이름을 입력해 주세요.';
  if (!d.studentId) return '학번을 입력해 주세요.';
  if (!/^01[016789]\d{7,8}$/.test(String(d.phone || '').replace(/\D/g, ''))) return '연락처 형식이 올바르지 않습니다.';
  if (!SCHEDULE[d.service]) return '서비스를 선택해 주세요.';
  if (!isValidDate_(d.date) || !SCHEDULE[d.service][d.date]) return '해당 서비스는 이 날짜에 예약할 수 없습니다.';
  if (timesFor_(d.service, d.date).indexOf(d.time) === -1) return '예약 시간이 올바르지 않습니다.';
  return '';
}

function isValidDate_(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

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
