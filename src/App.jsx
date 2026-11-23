import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReservationPage from './pages/ReservationPage';
import CompletePage from './pages/CompletePage';

const TITLES = {
  '/': '뷰티과 실습 예약 시스템',
  '/reserve': '예약하기 | 뷰티과 실습 예약 시스템',
  '/complete': '예약 완료 | 뷰티과 실습 예약 시스템',
};

export default function App() {
  const { pathname, state } = useLocation();

  // 페이지 이동 시 제목 변경 + 스크롤 처리 (pathname 이 바뀔 때만)
  useEffect(() => {
    document.title = TITLES[pathname] || TITLES['/'];
    if (!state?.scrollTo) window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-white"
      >
        본문 바로가기
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reserve" element={<ReservationPage />} />
          <Route path="/complete" element={<CompletePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
