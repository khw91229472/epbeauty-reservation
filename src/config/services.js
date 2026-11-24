// =============================================================
// 서비스 / 시간 / 운영 설정 — 학교 사정에 맞게 자유롭게 수정하세요.
// =============================================================

export const SERVICES = [
  {
    id: 'makeup',
    name: '메이크업',
    en: 'Make-up',
    icon: '💄',
    description: '얼굴형과 피부톤에 맞춘 자연스러운 메이크업으로 생기를 더해드립니다.',
    items: ['데일리 메이크업'],
    duration: '약 40분',
    tone: 'from-blush-100 via-blush-50 to-white',
    accent: 'bg-blush-200',
  },
  {
    id: 'nail',
    name: '네일',
    en: 'Nail',
    icon: '💅',
    description: '깔끔한 손톱 관리부터 연장, 보수까지 손끝을 단정하고 예쁘게 케어합니다.',
    items: ['기본 케어', '네일 연장', '네일 보수'],
    duration: '약 50분',
    tone: 'from-sand-100 via-sand-50 to-white',
    accent: 'bg-sand-200',
  },
  {
    id: 'skin',
    name: '피부에스테틱',
    en: 'Skin Esthetic',
    icon: '🌿',
    description: '클렌징부터 모델링 마스크까지, 맑고 촉촉한 피부를 위한 단계별 관리입니다.',
    items: ['클렌징', '효소 딥클렌징', '마사지', '앰플', '모델링 마스크'],
    duration: '약 60분',
    tone: 'from-blush-50 via-sand-50 to-white',
    accent: 'bg-blush-100',
  },
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '14:30', '15:00',
];

// =============================================================
// 서비스별 예약 일정 — 서비스 id: { 'YYYY-MM-DD': [시간, ...] }
// (Apps Script Code.gs 의 SCHEDULE 과 동일하게 유지하세요)
// =============================================================
export const SCHEDULE = {
  skin: {
    '2026-11-26': ['12:20', '13:30'],
  },
  makeup: {
    '2026-11-27': ['09:00', '10:00', '12:20', '13:30'],
  },
  nail: {
    '2026-11-27': ['09:00', '10:00', '12:20', '13:30'],
  },
};

/** 서비스의 예약 날짜 목록 (정렬) */
export const getScheduleDates = (serviceId) => Object.keys(SCHEDULE[serviceId] || {}).sort();

/** 서비스 + 날짜의 예약 시간 목록 */
// 한 타임당 최대 인원 (Code.gs 의 CAPACITY 와 동일하게 유지)
export const CAPACITY = {
  makeup: 8,
  nail: 5,
  skin: 6,
};

export const getCapacity = (serviceId) => CAPACITY[serviceId] || 1;

/** 해당 시간의 예약 인원 */
export const countAt = (booked, time) => booked.filter((b) => b === time).length;

export const getTimesFor = (serviceId, date) => (SCHEDULE[serviceId] && SCHEDULE[serviceId][date]) || [];

export const STEPS = [
  { title: '서비스 선택', desc: '메이크업 · 네일 · 피부에스테틱 중 선택' },
  { title: '날짜 선택', desc: '실습실 운영일 중 원하는 날짜 선택' },
  { title: '시간 선택', desc: '초록색으로 표시된 가능 시간 선택' },
  { title: '정보 입력', desc: '이름 · 학번 · 연락처 · 요청사항 입력' },
  { title: '예약 완료', desc: '예약 내용을 확인하고 방문' },
];

export const NOTICES = [
  '모든 실습은 담당 선생님의 지도 아래 학생이 진행합니다.',
  '예약 시간 5분 전까지 실습실에 도착해 주세요. 10분 이상 늦으면 자동 취소될 수 있습니다.',
  '서비스별 일정: 피부에스테틱 11/26(목) 오후 · 메이크업 · 네일 11/27(금) 오전/오후',
  '한 타임당 정원: 메이크업 8명 · 네일 5명 · 피부에스테틱 6명 (정원이 차면 자동 마감)',
  '피부 질환, 알레르기가 있는 경우 요청사항에 꼭 적어주세요.',
  '예약 변경 · 취소는 뷰티과 교무실로 연락해 주세요.',
];

export const findService = (idOrName) =>
  SERVICES.find((s) => s.id === idOrName || s.name === idOrName);