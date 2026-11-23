import { SERVICES } from '../config/services';
import ServiceCard from './ServiceCard';

export default function ServiceSection() {
  return (
    <section id="services" tabIndex={-1} aria-labelledby="services-title" className="scroll-mt-24 py-16 outline-none sm:py-24">
      <div className="container-x">
        <div className="text-center">
          <p className="eyebrow">Our Services</p>
          <h2 id="services-title" className="section-title">
            서비스 소개
          </h2>
          <p className="mt-3 text-ink-soft">뷰티과 학생들이 정성껏 준비한 세 가지 실습 프로그램</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
