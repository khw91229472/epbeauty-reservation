/** 숫자만 남기기 */
export const onlyDigits = (v = '') => v.replace(/\D/g, '');

/** 입력 중 자동 하이픈: 01012341234 -> 010-1234-1234 */
export const formatPhone = (v = '') => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
};

export const isValidPhone = (v) => /^01[016789]\d{7,8}$/.test(onlyDigits(v));

/**
 * 예약 폼 유효성 검사
 * @returns {Record<string,string>} 필드별 에러 메시지 (비어있으면 통과)
 */
export function validateReservation(form) {
  const e = {};
  const name = form.name.trim();

  if (!name) e.name = '이름을 입력해 주세요.';
  else if (!/^[가-힣a-zA-Z\s]{2,20}$/.test(name)) e.name = '이름은 한글 또는 영문 2~20자로 입력해 주세요.';

  if (form.userType === 'student') {
    if (!form.studentId.trim()) e.studentId = '학번을 입력해 주세요.';
    else if (!/^\d{4,6}$/.test(form.studentId.trim())) e.studentId = '학번은 숫자 4~6자리로 입력해 주세요. (예: 2301)';
  }

  if (!form.phone) e.phone = '연락처를 입력해 주세요.';
  else if (!isValidPhone(form.phone)) e.phone = '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)';

  if (!form.serviceId) e.serviceId = '서비스를 선택해 주세요.';
  if (!form.date) e.date = '예약 날짜를 선택해 주세요.';
  if (!form.time) e.time = '예약 시간을 선택해 주세요.';
  if (form.memo.length > 200) e.memo = '요청사항은 200자 이내로 입력해 주세요.';
  if (!form.agree) e.agree = '개인정보 수집 · 이용에 동의해 주세요.';

  return e;
}
