import { useMemo } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { findService } from '../config/services';
import { formatDateKo } from '../utils/date';
import { formatPhone } from '../utils/validation';

export default function CompletePage() {
  const { state } = useLocation();

  // 새로고침해도 요약이 유지되도록 sessionStorage 백업 사용
  const reservation = useMemo(() => {
    if (state?.reservation) return state.reservation;
    try {
      return JSON.parse(sessionStorage.getItem('lastReservation') || 'null');
    } catch {
      return null;
    }
  }, [state]);

  if (!reservation) return <Navigate to="/" replace />;

  const service = findService(reservation.service);
  const rows = [
    ['서비스', `${service?.icon ?? ''} ${reservation.service}`],
    ['예약 날짜', formatDateKo(reservation.date)],
    ['예약 시간', reservation.time],
    ['이름', reservation.name],
    ['학번', reservation.studentId],
    ['연락처', formatPhone(reservation.phone)],
    ['요청사항', reservation.memo || '없음'],
    ['상태', reservation.status || '예약완료'],
  ];

  return (
    <div className="container-x flex justify-center py-12 sm:py-20">
      <section aria-labelledby="done-title" className="w-full max-w-lg animate-fade-up">
        <div className="text-center">
          <div
            aria-hidden="true"
            className="mx-auto grid h-20 w-20 animate-pop place-items-center rounded-full bg-gradient-to-br from-blush-200 to-blush-500 text-4xl text-white shadow-soft"
          >
            ✓
          </div>
          <h1 id="done-title" className="mt-6 text-3xl font-bold tracking-tight">
            예약이 완료되었습니다
          </h1>
          <p className="mt-2 text-ink-soft">예약 시간 5분 전까지 실습실로 와 주세요 🌸</p>
        </div>

        <div className="card mt-10 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-blush-100 to-sand-100 px-6 py-4">
            <h2 className="font-bold">예약 정보</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              {reservation.status || '예약완료'}
            </span>
          </div>
          <dl className="divide-y divide-sand-100 px-6">
            {rows.slice(0, -1).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3.5 text-[15px]">
                <dt className="shrink-0 text-ink-soft">{k}</dt>
                <dd className="text-right font-semibold break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-5 text-center text-sm text-ink-soft">예약 변경 · 취소는 뷰티과 교무실로 문의해 주세요.</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="btn-primary flex-1">
            메인으로 이동
          </Link>
          <Link to="/reserve" className="btn-outline flex-1">
            추가 예약하기
          </Link>
        </div>
      </section>
    </div>
  );
}
