import { Link } from 'react-router-dom';
import { NOTICES, STEPS } from '../config/services';

export default function GuideSection() {
  return (
    <section id="guide" tabIndex={-1} aria-labelledby="guide-title" className="scroll-mt-24 py-16 outline-none sm:py-20">
      <div className="container-x">
        <div className="text-center">
          <p className="eyebrow">How to Book</p>
          <h2 id="guide-title" className="section-title">
            예약 안내
          </h2>
        </div>

        {/* 예약 방법 */}
        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card relative flex items-center gap-4 p-5 lg:flex-col lg:items-start lg:p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blush-200 to-blush-400 font-display text-lg font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-bold">{s.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* 유의사항 */}
        <div className="mt-8 grid gap-6 rounded-3xl bg-gradient-to-br from-sand-100 via-sand-50 to-blush-50 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden="true">📌</span> 유의사항
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NOTICES.map((n) => (
                <li key={n} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-soft">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blush-400" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/reserve" className="btn-primary px-10">
            지금 예약하기
          </Link>
        </div>
      </div>
    </section>
  );
}
