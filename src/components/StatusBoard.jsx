import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookedTimes } from '../api/reservationApi';
import { getTimesForDate } from '../config/services';
import { formatDateKo, getOpenDates, getPastTimes } from '../utils/date';
import DatePicker from './DatePicker';
import TimeSlotPicker, { SlotLegend } from './TimeSlotPicker';

/**
 * 메인 페이지 "예약 현황" — 날짜별 예약 가능/마감 시간을 한눈에 확인
 */
export default function StatusBoard() {
  const dates = useMemo(() => getOpenDates(10), []);
  const [date, setDate] = useState(dates[0] || '');
  const [booked, setBooked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchBookedTimes(date)
      .then((list) => !cancelled && setBooked(list))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [date]);

  const past = date ? getPastTimes(date) : [];
  const times = date ? getTimesForDate(date) : [];
  const available = times.filter((t) => !booked.includes(t) && !past.includes(t)).length;
  const ratio = times.length ? Math.round((available / times.length) * 100) : 0;

  return (
    <section id="status" tabIndex={-1} aria-labelledby="status-title" className="scroll-mt-24 py-16 outline-none sm:py-20">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Live Status</p>
            <h2 id="status-title" className="section-title">
              실시간 예약 현황
            </h2>
            <p className="mt-3 text-ink-soft">날짜를 선택하면 예약 가능한 시간을 바로 확인할 수 있어요.</p>
          </div>
          <SlotLegend />
        </div>

        <div className="card mt-10 p-5 sm:p-8">
          {dates.length === 0 ? (
            <p className="py-10 text-center text-ink-soft">현재 예약 가능한 날짜가 없습니다.</p>
          ) : (
            <>
              <p id="status-date-label" className="sr-only">
                현황을 볼 날짜 선택
              </p>
              <DatePicker dates={dates} value={date} onChange={setDate} labelledBy="status-date-label" />

              <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
                {/* 요약 카드 */}
                <div className="flex flex-row items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-blush-50 to-sand-50 p-5 lg:flex-col lg:items-start lg:justify-center">
                  <div>
                    <p className="text-sm font-semibold text-ink-soft">{formatDateKo(date)}</p>
                    <p className="mt-1 text-3xl font-bold" aria-live="polite">
                      {loading ? '—' : available}
                      <span className="text-base font-medium text-ink-soft"> / {times.length} 가능</span>
                    </p>
                  </div>
                  <div className="w-28 lg:w-full">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-white"
                      role="progressbar"
                      aria-label="예약 가능 비율"
                      aria-valuenow={loading ? 0 : ratio}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-full rounded-full bg-emerald-400 transition-all duration-700" style={{ width: `${loading ? 0 : ratio}%` }} />
                    </div>
                    <Link
                      to={`/reserve?date=${date}`}
                      className="mt-3 hidden text-sm font-semibold text-blush-600 hover:underline lg:inline-block"
                    >
                      이 날짜로 예약하기 →
                    </Link>
                  </div>
                </div>

                <div>
                  {error ? (
                    <p role="alert" className="rounded-2xl bg-red-50 p-6 text-center text-sm text-red-500">
                      {error}
                    </p>
                  ) : (
                    <TimeSlotPicker times={times} booked={booked} past={past} loading={loading} readOnly labelledBy="status-title" />
                  )}
                  <Link to={`/reserve?date=${date}`} className="btn-primary mt-5 w-full lg:hidden">
                    이 날짜로 예약하기
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
