import { useEffect, useState } from 'react';

/**
 * 시술 예시 사진 갤러리 (클릭 시 확대 모달)
 * - onSelect 가 있으면 희망 스타일 선택 버튼도 함께 표시
 */
export default function ExampleGallery({ examples = [], selected = '', onSelect, compact = false }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  if (!examples.length) return null;

  return (
    <>
      <div className={compact ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-2 gap-3 sm:grid-cols-4'}>
        {examples.map((ex) => {
          const isSelected = selected === ex.label;
          return (
            <div key={ex.label} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setPreview(ex)}
                aria-label={`${ex.label} 사진 크게 보기`}
                className={`group/img relative overflow-hidden rounded-2xl border-2 bg-sand-50 transition ${
                  isSelected ? 'border-blush-500 ring-2 ring-blush-200' : 'border-white hover:border-blush-300'
                } ${compact ? 'aspect-square' : 'aspect-[3/4]'}`}
              >
                <img
                  src={ex.src}
                  alt={`메이크업 ${ex.label}`}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-500 group-hover/img:scale-105"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {ex.label}
                </span>
              </button>

              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(isSelected ? '' : ex.label)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    isSelected
                      ? 'border-blush-500 bg-blush-500 text-white'
                      : 'border-sand-200 bg-white text-ink-soft hover:border-blush-300 hover:text-ink'
                  }`}
                >
                  {isSelected ? '✓ 선택됨' : `${ex.label} 희망`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 확대 모달 */}
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.label} 확대 보기`}
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <img
              src={preview.src}
              alt={`메이크업 ${preview.label}`}
              className="max-h-[75vh] w-full object-contain bg-sand-50"
            />
            <div className="flex items-center justify-between gap-3 px-5 py-3.5">
              <span className="font-bold text-ink">{preview.label}</span>
              <div className="flex items-center gap-2">
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(selected === preview.label ? '' : preview.label);
                      setPreview(null);
                    }}
                    className="rounded-full bg-blush-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blush-600"
                  >
                    {selected === preview.label ? '선택 해제' : '이 스타일 희망'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-full border border-sand-200 px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-sand-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
