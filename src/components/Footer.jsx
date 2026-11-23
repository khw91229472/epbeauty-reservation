import { IS_DEMO } from '../api/reservationApi';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-blush-100 bg-white/60">
      <div className="container-x flex flex-col items-center gap-3 py-10 text-center">
        <p className="font-display text-2xl font-semibold tracking-wide">Beauty Lab</p>
        <p className="text-sm text-ink-soft">고등학교 뷰티과 실습 예약 서비스 · 메이크업 · 네일 · 피부에스테틱</p>
        <p className="text-xs text-ink-soft/70">문의: 뷰티과 교무실 · 운영시간 평일 09:00 – 15:30</p>
        {IS_DEMO && (
          <p className="mt-2 rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-sand-500">
            데모 모드 · 예약이 이 브라우저에만 저장됩니다 (.env 에 VITE_GAS_URL 설정 필요)
          </p>
        )}
        <p className="mt-2 text-xs text-ink-soft/60">© {new Date().getFullYear()} Beauty Lab. All rights reserved.</p>
      </div>
    </footer>
  );
}
