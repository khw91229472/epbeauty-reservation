import { getScheduleDates, getTimesFor } from '../config/services';

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

/** '2026-11-27' -> '11/27(금)' */
export const formatDateShort = (s) => {
  const d = fromYMD(s);
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY_KO[d.getDay()]})`;
};

/** 해당 날짜/시간이 이미 지났는지 */
export const isPastSlot = (date, time) => {
  const [h, m] = time.split(':').map(Number);
  const slot = fromYMD(date);
  slot.setHours(h, m, 0, 0);
  return slot.getTime() <= Date.now();
};

/** 서비스 + 날짜에서 이미 지난 시간 목록 */
export const getPastTimes = (serviceId, date) => getTimesFor(serviceId, date).filter((t) => isPastSlot(date, t));

/** 서비스의 예약 가능한 날짜 (모든 시간이 지난 날짜는 제외) */
export const getOpenDates = (serviceId) =>
  getScheduleDates(serviceId).filter((d) => getPastTimes(serviceId, d).length < getTimesFor(serviceId, d).length);
