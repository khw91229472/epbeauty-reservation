import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useScrollToSection from '../hooks/useScrollToSection';

const NAV = [
  { id: 'services', label: '서비스 안내' },
  { id: 'status', label: '예약 현황' },
  { id: 'guide', label: '예약 안내' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollTo = useScrollToSection();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const go = (id) => {
    setOpen(false);
    scrollTo(id);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-blush-100/70 bg-white/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between sm:h-20">
        <Link to="/" className="flex items-center gap-2" aria-label="뷰티 실습 예약 서비스 홈">
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-blush-200 to-blush-500 font-display text-lg italic text-white">
            B
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold tracking-wide">Beauty Lab</span>
            <span className="block text-[11px] font-medium text-ink-soft">뷰티과 실습 예약</span>
          </span>
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              className="text-[15px] font-medium text-ink-soft transition hover:text-ink"
            >
              {n.label}
            </button>
          ))}
          <Link to="/reserve" className="btn-primary !px-5 !py-2.5 text-sm">
            예약하기
          </Link>
        </nav>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full md:hidden"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-5" aria-hidden="true">
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>
      </div>

      {/* 모바일 메뉴 */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-blush-100 bg-white/95 backdrop-blur-xl md:hidden"
      >
        <nav aria-label="모바일 메뉴" className="container-x flex flex-col gap-1 py-4">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              className="rounded-2xl px-4 py-3.5 text-left font-medium hover:bg-blush-50"
            >
              {n.label}
            </button>
          ))}
          <Link to="/reserve" className="btn-primary mt-2">
            예약하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
