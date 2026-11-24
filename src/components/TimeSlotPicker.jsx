import { TIME_SLOTS } from '../config/services';
import Spinner from './Spinner';

export function SlotLegend() {
  return (
    <ul className="flex flex-wrap gap-4 text-xs font-medium text-ink-soft" aria-label="시간 표시 안내">
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-3 rounded-full border border-emerald-300 bg-emerald-100" /> 예약 가능
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-3 rounded-full bg-gray-200" /> 예약 마감
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-3 rounded-full bg-blush-500" /> 선택됨
      </li>
    </ul>
  );
}

/**
 * 시간 선택 그리드
 * - 예약 가능: 초록색 / 정원 마감·지난 시간: 회색(비활성) / 선택: 핑크
 * - booked: 예약된 시간 배열 (1건당 1개, 중복 포함) → 시간별 인원 계산
 * - capacity: 한 타임당 최대 인원
 * - readOnly 모드는 예약 현황 보드에서 사용
 */
export default function TimeSlotPicker({
  times = TIME_SLOTS,
  booked = [],
  capacity = 1,
  past = [],
  value,
  onChange,
  loading = false,
  labelledBy,
  readOnly = false,
}) {
  if (loading) {
    return (
      <div className="flex h-36 flex-col items-center justify-center gap-3 rounded-2xl bg-white/60">
        <Spinner label="예약 현황을 불러오는 중" />
        <p className="text-sm text-ink-soft">예약 현황을 확인하고 있어요...</p>
      </div>
    );
  }

  return (
    <div role={readOnly ? 'list' : 'radiogroup'} aria-labelledby={labelledBy} className={`grid gap-2 ${times.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-5'}`}>
      {times.map((t) => {
        const count = booked.filter((b) => b === t).length;
        const remaining = Math.max(capacity - count, 0);
        const isFull = remaining === 0;
        const isPast = past.includes(t);
        const disabled = isFull || isPast;
        const selected = value === t;
        const status = isPast ? '시간 지남' : isFull ? '정원 마감' : `잔여 ${remaining}/${capacity}명`;

        const cls = selected
          ? 'border-blush-500 bg-blush-500 text-white shadow-soft'
          : disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100';

        const content = (
          <>
            <span className={`text-[15px] font-bold ${disabled && !selected ? 'line-through' : ''}`}>{t}</span>
            <span className="text-[11px] font-medium opacity-80">{selected ? `선택됨 · 잔여 ${remaining}명` : status}</span>
          </>
        );

        if (readOnly) {
          return (
            <div key={t} role="listitem" aria-label={`${t} ${status}`} className={`flex flex-col items-center rounded-2xl border py-2.5 ${cls}`}>
              {content}
            </div>
          );
        }

        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            aria-label={`${t} ${status}`}
            disabled={disabled}
            onClick={() => onChange?.(t)}
            className={`flex flex-col items-center rounded-2xl border py-2.5 transition ${cls}`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
