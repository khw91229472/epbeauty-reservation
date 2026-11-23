import { formatDateKo, fromYMD } from '../utils/date';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 가로 스크롤 날짜 칩 (모바일 친화)
 */
export default function DatePicker({ dates, value, onChange, labelledBy }) {
  const onKeyDown = (e) => {
    const idx = dates.indexOf(value);
    let next = null;
    if (e.key === 'ArrowRight') next = dates[Math.min(idx + 1, dates.length - 1)];
    if (e.key === 'ArrowLeft') next = dates[Math.max(idx - 1, 0)];
    if (next) {
      e.preventDefault();
      onChange(next);
      document.getElementById(`date-${next}`)?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {dates.map((d) => {
        const date = fromYMD(d);
        const selected = d === value;
        const tabbable = selected || (!value && d === dates[0]);
        return (
          <button
            key={d}
            id={`date-${d}`}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={formatDateKo(d)}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(d)}
            className={`flex w-[62px] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition ${
              selected
                ? 'border-blush-500 bg-blush-500 text-white shadow-soft'
                : 'border-sand-200 bg-white text-ink hover:border-blush-300'
            }`}
          >
            <span className={`text-[11px] font-medium ${selected ? 'text-white/80' : 'text-ink-soft'}`}>
              {date.getMonth() + 1}월
            </span>
            <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
            <span className={`text-xs ${selected ? 'text-white/90' : 'text-ink-soft'}`}>{WEEK[date.getDay()]}</span>
          </button>
        );
      })}
    </div>
  );
}
