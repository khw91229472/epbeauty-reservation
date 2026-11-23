import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ServiceSection from '../components/ServiceSection';
import StatusBoard from '../components/StatusBoard';
import GuideSection from '../components/GuideSection';

export default function HomePage() {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();

  // 다른 페이지에서 "서비스 안내" 등을 눌러 넘어온 경우 해당 섹션으로 스크롤
  useEffect(() => {
    if (!state?.scrollTo) return;
    const id = state.scrollTo;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    navigate(pathname, { replace: true, state: null });
  }, [state, pathname, navigate]);

  return (
    <>
      <Hero />
      <ServiceSection />
      <StatusBoard />
      <GuideSection />
    </>
  );
}
