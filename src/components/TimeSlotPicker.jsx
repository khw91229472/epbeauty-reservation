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
 * - 예약 가능: 초록색 / 예약 마감·지난 시간: 회색(비활성) / 선택: 핑크
 * - readOnly 모드는 예약 현황 보드에서 사용
 */
export default function TimeSlotPicker({
  times = TIME_SLOTS,
  booked = [],
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
        const isBooked = booked.includes(t);
        const isPast = past.includes(t);
        const disabled = isBooked || isPast;
        const selected = value === t;
        const status = isBooked ? '예약 마감' : isPast ? '시간 지남' : '예약 가능';

        const cls = selected
          ? 'border-blush-500 bg-blush-500 text-white shadow-soft'
          : disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100';

        const content = (
          <>
            <span className={`text-[15px] font-bold ${disabled && !selected ? 'line-through' : ''}`}>{t}</span>
            <span className="text-[11px] font-medium opacity-80">{selected ? '선택됨' : status}</span>
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
