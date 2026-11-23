import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * HashRouter 에서는 '#services' 같은 앵커가 라우트와 충돌하므로
 * 메인 페이지 섹션 이동은 이 훅을 사용합니다.
 */
export default function useScrollToSection() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id) => {
      if (pathname !== '/') {
        navigate('/', { state: { scrollTo: id } });
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.focus({ preventScroll: true });
      }
    },
    [navigate, pathname],
  );
}
