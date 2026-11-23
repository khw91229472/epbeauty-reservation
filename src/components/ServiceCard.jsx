import { Link } from 'react-router-dom';

export default function ServiceCard({ service, index }) {
  return (
    <article
      aria-labelledby={`svc-${service.id}`}
      className="card group flex flex-col overflow-hidden transition duration-500 hover:-translate-y-1.5 hover:shadow-soft"
    >
      <div className={`relative h-40 bg-gradient-to-br ${service.tone} p-6`}>
        <span className="font-display text-5xl italic text-blush-300">0{index + 1}</span>
        <span
          aria-hidden="true"
          className="absolute bottom-5 right-6 grid h-20 w-20 place-items-center rounded-full bg-white/80 text-4xl shadow-card transition duration-500 group-hover:scale-110 group-hover:-rotate-6"
        >
          {service.icon}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="font-display text-sm italic text-blush-500">{service.en}</p>
        <h3 id={`svc-${service.id}`} className="mt-1 text-xl font-bold">
          {service.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{service.description}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${service.name} 세부 항목`}>
          {service.items.map((item) => (
            <li key={item} className="rounded-full border border-sand-200 bg-sand-50 px-3 py-1.5 text-[13px] font-medium text-ink">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-xs font-medium text-ink-soft">⏱ {service.duration}</span>
          <Link
            to={`/reserve?service=${service.id}`}
            className="rounded-full bg-blush-50 px-4 py-2 text-sm font-semibold text-blush-600 transition hover:bg-blush-500 hover:text-white"
            aria-label={`${service.name} 예약하기`}
          >
            예약하기 →
          </Link>
        </div>
      </div>
    </article>
  );
}
