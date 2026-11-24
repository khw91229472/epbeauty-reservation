// =============================================================
// Google Apps Script API 클라이언트
// - VITE_GAS_URL 이 없으면 localStorage 기반 데모 모드로 동작합니다.
// - POST 는 Content-Type: text/plain 으로 보내 CORS preflight 를 피합니다.
//   (Apps Script 웹 앱은 OPTIONS 요청을 처리하지 못하기 때문)
// =============================================================

import { findService, getCapacity } from '../config/services';

const GAS_URL = (import.meta.env.VITE_GAS_URL || '').trim();
export const IS_DEMO = !GAS_URL || GAS_URL.includes('XXXXXXXX');

export class ApiError extends Error {
  constructor(message, code = 'ERROR') {
    super(message);
    this.code = code;
  }
}

async function request(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
    if (!res.ok) throw new ApiError(`서버 응답 오류 (${res.status})`);
    const data = await res.json();
    if (!data.ok) throw new ApiError(data.message || '요청을 처리하지 못했습니다.', data.code);
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('서버 응답 시간이 초과되었습니다.', 'TIMEOUT');
    throw new ApiError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
}

// ---------------- 데모(로컬) 모드 ----------------
const DEMO_KEY = 'beauty_demo_reservations';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const demoLoad = () => JSON.parse(localStorage.getItem(DEMO_KEY) || '[]');
const demoSave = (list) => localStorage.setItem(DEMO_KEY, JSON.stringify(list));

// ---------------- 공개 API ----------------

/**
 * 특정 서비스 + 날짜에 이미 예약된 시간 목록 (중복 검사는 서비스별)
 * @param {string} date YYYY-MM-DD
 * @param {string} service 서비스명 (예: '네일')
 * @returns {Promise<string[]>} 예: ['09:00', '13:30']
 */
export async function fetchBookedTimes(date, service) {
  if (IS_DEMO) {
    await sleep(350);
    return demoLoad()
      .filter((r) => r.date === date && r.service === service && r.status !== '취소')
      .map((r) => r.time);
  }
  const data = await request(
    `${GAS_URL}?action=booked&date=${encodeURIComponent(date)}&service=${encodeURIComponent(service)}`,
  );
  return data.booked || [];
}

/**
 * 예약 생성 (서버에서도 중복 검사 후 저장)
 * @param {{name,studentId,phone,service,date,time,memo}} payload
 */
export async function createReservation(payload) {
  const body = { ...payload, timestamp: new Date().toISOString() };

  if (IS_DEMO) {
    await sleep(700);
    const list = demoLoad();
    const count = list.filter(
      (r) => r.date === body.date && r.time === body.time && r.service === body.service && r.status !== '취소',
    ).length;
    if (count >= getCapacity(findService(body.service)?.id)) {
      throw new ApiError('정원이 마감된 시간입니다. 다른 시간을 선택해 주세요.', 'DUPLICATE');
    }
    const saved = { ...body, status: '예약완료' };
    list.push(saved);
    demoSave(list);
    return saved;
  }

  const data = await request(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  return data.reservation;
}
