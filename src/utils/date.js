import { OPEN_WEEKDAYS, HOLIDAYS, BOOKABLE_DAYS, TIME_SLOTS, ALLOWED_DATES } from '../config/services';

const pad = (n) => String(n).padStart(2, '0');
const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

/** Date -> 'YYYY-MM-DD' (로컬 시간 기준) */
export const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'YYYY-MM-DD' -> Date (로컬 자정) */
export const fromYMD = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** '2026-11-27' -> '11월 27일 (금)' */
export const formatDateKo = (s) => {
  const d = fromYMD(s);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY_KO[d.getDay()]})`;
};

export const weekdayKo = (s) => WEEKDAY_KO[fromYMD(s).getDay()];

/** 해당 날짜/시간이 이미 지났는지 */
export const isPastSlot = (date, time) => {
  const [h, m] = time.split(':').map(Number);
  const slot = fromYMD(date);
  slot.setHours(h, m, 0, 0);
  return slot.getTime() <= Date.now();
};

/** 이미 지난 시간 목록 */
export const getPastTimes = (date) => TIME_SLOTS.filter((t) => isPastSlot(date, t));

/** 예약 가능한 운영일 목록 (오늘 포함, 남은 시간이 없는 오늘은 제외) */
export const getOpenDates = (count = BOOKABLE_DAYS) => {
  // 지정 날짜 모드: 지정된 날짜 중 아직 예약 가능한 시간이 남은 날짜만
  if (ALLOWED_DATES.length) {
    return [...ALLOWED_DATES]
      .sort()
      .filter((d) => getPastTimes(d).length < TIME_SLOTS.length)
      .slice(0, count);
  }

  const result = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let guard = 0;
  while (result.length < count && guard < 120) {
    const ymd = toYMD(cursor);
    const open = OPEN_WEEKDAYS.includes(cursor.getDay()) && !HOLIDAYS.includes(ymd);
    if (open && getPastTimes(ymd).length < TIME_SLOTS.length) result.push(ymd);
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return result;
};
