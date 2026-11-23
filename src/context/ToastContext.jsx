import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: '✓', box: 'bg-ink text-white', badge: 'bg-emerald-400 text-ink' },
  error: { icon: '!', box: 'bg-white text-ink border border-red-100', badge: 'bg-red-500 text-white' },
  info: { icon: 'i', box: 'bg-white text-ink border border-blush-100', badge: 'bg-blush-400 text-white' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (message, type = 'info', duration = 3200) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  // 컨텍스트 값이 매 렌더마다 바뀌지 않도록 메모이즈 (useEffect 의존성 안정화)
  const api = useMemo(
    () => ({
      success: (m, d) => show(m, 'success', d),
      error: (m, d) => show(m, 'error', d ?? 4500),
      info: (m, d) => show(m, 'info', d),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* 스크린리더가 읽을 수 있도록 aria-live 영역 */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium shadow-soft ${s.box}`}
            >
              <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${s.badge}`}>
                {s.icon}
              </span>
              <p className="flex-1">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="알림 닫기"
                className="rounded-full px-1.5 text-lg leading-none opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
