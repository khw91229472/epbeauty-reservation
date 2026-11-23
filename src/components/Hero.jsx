import { Link } from 'react-router-dom';
import useScrollToSection from '../hooks/useScrollToSection';
import { SERVICES } from '../config/services';

export default function Hero() {
  const scrollTo = useScrollToSection();

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* 배경 장식 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blush-200/60 blur-3xl" />
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-sand-200/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blush-100 blur-3xl" />
      </div>

      <div className="container-x grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:pb-24">
        <div className="animate-fade-up text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/70 px-4 py-1.5 text-[13px] font-medium text-blush-600 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-blush-500" aria-hidden="true" />
            Beauty Department Practice Booking
          </p>
          <h1 id="hero-title" className="mt-6 text-[40px] font-bold leading-[1.15] tracking-tight sm:text-6xl">
            뷰티 실습
            <br />
            <span className="bg-gradient-to-r from-blush-500 via-blush-400 to-sand-400 bg-clip-text text-transparent">
              예약 서비스
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0">
            메이크업, 네일, 피부에스테틱 실습을 예약해보세요
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link to="/reserve" className="btn-primary px-8">
              예약하기 <span aria-hidden="true">→</span>
            </Link>
            <button type="button" onClick={() => scrollTo('services')} className="btn-outline px-8">
              서비스 안내
            </button>
          </div>
        </div>

        {/* 우측 카드 콜라주 */}
        <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:.15s]">
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-blush-200 to-sand-200 opacity-70" />
            <p className="eyebrow relative">Today&apos;s Menu</p>
            <ul className="relative mt-5 space-y-3">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/reserve?service=${s.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-blush-100/70 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blush-200 hover:shadow-card"
                  >
                    <span aria-hidden="true" className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ${s.accent}`}>
                      {s.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="block text-xs text-ink-soft">{s.items.join(' · ')}</span>
                    </span>
                    <span aria-hidden="true" className="text-blush-400 transition group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div aria-hidden="true" className="absolute -bottom-5 -left-4 hidden rounded-2xl bg-ink px-4 py-3 text-xs font-medium text-white shadow-soft sm:block">
            ✨ 선생님 지도 하 안심 실습
          </div>
        </div>
      </div>
    </section>
  );
}
