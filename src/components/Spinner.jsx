export default function Spinner({ size = 'md', label = '불러오는 중', className = '' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' };
  return (
    <span role="status" className={`inline-flex items-center justify-center ${className}`}>
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full border-blush-200 border-t-blush-500 ${sizes[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** 화면 전체를 덮는 로딩 오버레이 */
export function LoadingOverlay({ message = '처리 중입니다...' }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-white/60 backdrop-blur-sm" aria-busy="true">
      <div className="card flex flex-col items-center gap-4 px-10 py-8">
        <Spinner size="lg" label={message} />
        <p className="text-sm font-medium text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
