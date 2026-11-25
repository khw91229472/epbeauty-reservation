import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError, createReservation, fetchBookedTimes, IS_DEMO } from '../api/reservationApi';
import { SERVICES, countAt, findService, getCapacity, getScheduleDates, getTimesFor } from '../config/services';
import { useToast } from '../context/ToastContext';
import { formatDateKo, formatDateShort, getOpenDates, getPastTimes } from '../utils/date';
import { formatPhone, onlyDigits, validateReservation } from '../utils/validation';
import DatePicker from '../components/DatePicker';
import TimeSlotPicker, { SlotLegend } from '../components/TimeSlotPicker';
import ExampleGallery from '../components/ExampleGallery';
import { LoadingOverlay } from '../components/Spinner';

const INITIAL = {
  userType: 'student',
  name: '',
  studentId: '',
  phone: '',
  serviceId: '',
  detail: '',
  styleExample: '',
  date: '',
  time: '',
  memo: '',
  agree: false,
};

function Field({ id, label, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-blush-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionCard({ step, title, titleId, children, right }) {
  return (
    <section aria-labelledby={titleId} className="card p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="flex items-center gap-3 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-blush-100 font-display text-base text-blush-600">
            {step}
          </span>
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export default function ReservationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(() => {
    const svc = findService(params.get('service') || '');
    const qDate = params.get('date');
    const svcDates = svc ? getOpenDates(svc.id) : [];
    return {
      ...INITIAL,
      serviceId: svc?.id || '',
      // 날짜가 하나뿐이면 자동 선택
      date: svcDates.includes(qDate) ? qDate : svcDates.length === 1 ? svcDates[0] : '',
    };
  });
  const [errors, setErrors] = useState({});
  const [booked, setBooked] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const service = findService(form.serviceId);
  const dates = useMemo(() => (form.serviceId ? getOpenDates(form.serviceId) : []), [form.serviceId]);
  const times = form.serviceId && form.date ? getTimesFor(form.serviceId, form.date) : [];
  const capacity = getCapacity(form.serviceId);
  const past = form.serviceId && form.date ? getPastTimes(form.serviceId, form.date) : [];

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // 서비스 변경: 해당 서비스 일정에 없는 날짜/시간은 초기화
  const selectService = (id) => {
    const svcDates = getOpenDates(id);
    setForm((f) => ({
      ...f,
      serviceId: id,
      detail: '',
      styleExample: '',
      date: svcDates.includes(f.date) ? f.date : svcDates.length === 1 ? svcDates[0] : '',
      time: '',
    }));
    setErrors((e) => ({ ...e, serviceId: undefined, date: undefined, time: undefined }));
  };

  // 서비스 + 날짜별 예약된 시간 불러오기
  const loadBooked = useCallback(async (date, serviceName) => {
    if (!date || !serviceName) return [];
    setSlotLoading(true);
    try {
      const list = await fetchBookedTimes(date, serviceName);
      setBooked(list);
      return list;
    } finally {
      setSlotLoading(false);
    }
  }, []);

  const serviceName = service?.name;
  useEffect(() => {
    if (!form.date || !serviceName) return;
    let cancelled = false;
    setSlotLoading(true);
    fetchBookedTimes(form.date, serviceName)
      .then((list) => {
        if (cancelled) return;
        setBooked(list);
        // 선택했던 시간이 마감되었으면 해제
        setForm((f) => (f.time && countAt(list, f.time) >= getCapacity(f.serviceId) ? { ...f, time: '' } : f));
      })
      .catch((e) => !cancelled && toast.error(e.message))
      .finally(() => !cancelled && setSlotLoading(false));
    return () => {
      cancelled = true;
    };
  }, [form.date, serviceName, toast]);

  const focusFirstError = (errs) => {
    const order = ['serviceId', 'date', 'time', 'name', 'studentId', 'phone', 'memo', 'agree'];
    const first = order.find((k) => errs[k]);
    const el = formRef.current?.querySelector(`[data-field="${first}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.focus?.({ preventScroll: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateReservation(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('입력 내용을 다시 확인해 주세요.');
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    try {
      // 1) 예약 직전 서버에서 중복 검사
      const latest = await loadBooked(form.date, service.name);
      if (countAt(latest, form.time) >= capacity) {
        set('time', '');
        setErrors((x) => ({ ...x, time: '방금 정원이 마감된 시간입니다. 다른 시간을 선택해 주세요.' }));
        toast.error('정원이 마감된 시간입니다. 다른 시간을 선택해 주세요.');
        return;
      }

      // 2) 예약 저장 (서버에서도 LockService 로 한 번 더 중복 검사)
      const memo = [
        form.detail && `[${form.detail}]`,
        form.styleExample && `[희망: ${form.styleExample}]`,
        form.memo.trim(),
      ]
        .filter(Boolean)
        .join(' ');
      const payload = {
        name: form.name.trim(),
        studentId: form.userType === 'staff' ? '교직원' : form.studentId.trim(),
        phone: onlyDigits(form.phone),
        service: service.name,
        date: form.date,
        time: form.time,
        memo,
      };
      const saved = await createReservation(payload);
      const reservation = { ...payload, ...saved, status: saved?.status || '예약완료' };

      sessionStorage.setItem('lastReservation', JSON.stringify(reservation));
      toast.success('예약이 완료되었습니다! 🌸');
      navigate('/complete', { state: { reservation } });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DUPLICATE') {
        set('time', '');
        loadBooked(form.date, service.name).catch(() => {});
      }
      toast.error(err.message || '예약 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const ariaFor = (key) => ({
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
    'data-field': key,
  });

  return (
    <div className="container-x py-8 sm:py-12">
      {submitting && <LoadingOverlay message="예약을 처리하고 있어요..." />}

      <nav aria-label="현재 위치" className="text-sm text-ink-soft">
        <Link to="/" className="hover:text-ink">
          홈
        </Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span aria-current="page" className="font-medium text-ink">
          예약하기
        </span>
      </nav>

      <div className="mt-4">
        <p className="eyebrow">Reservation</p>
        <h1 className="section-title">실습 예약하기</h1>
        <p className="mt-2 text-ink-soft">
          <span className="text-blush-500">*</span> 표시는 필수 입력 항목입니다.
        </p>
        {IS_DEMO && (
          <p className="mt-4 rounded-2xl bg-sand-100 px-4 py-3 text-sm text-sand-500">
            ⚠️ 데모 모드입니다. Google Apps Script URL이 설정되지 않아 예약이 이 브라우저에만 저장됩니다.
          </p>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-6">
          {/* 1. 서비스 */}
          <SectionCard step="1" title="서비스 선택" titleId="svc-title">
            <div role="radiogroup" aria-labelledby="svc-title" className="grid gap-3 sm:grid-cols-3" data-field="serviceId" tabIndex={-1}>
              {SERVICES.map((s) => {
                const selected = form.serviceId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => selectService(s.id)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition sm:flex-col sm:items-start ${
                      selected ? 'border-blush-400 bg-blush-50' : 'border-sand-100 bg-white hover:border-blush-200'
                    }`}
                  >
                    <span aria-hidden="true" className={`grid h-11 w-11 place-items-center rounded-xl text-2xl ${s.accent}`}>
                      {s.icon}
                    </span>
                    <span>
                      <span className="block font-bold">{s.name}</span>
                      <span className="block text-xs text-ink-soft">{getScheduleDates(s.id).map(formatDateShort).join(', ') || s.duration}</span>
                    </span>
                    {selected && (
                      <span aria-hidden="true" className="ml-auto grid h-6 w-6 place-items-center rounded-full bg-blush-500 text-xs text-white sm:hidden">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.serviceId && <p className="field-error" role="alert">{errors.serviceId}</p>}

            {service && (
              <div className="mt-5 animate-fade-up">
                <p id="detail-label" className="mb-2 text-sm font-semibold">
                  세부 항목 <span className="font-normal text-ink-soft">(선택)</span>
                </p>
                <div role="radiogroup" aria-labelledby="detail-label" className="flex flex-wrap gap-2">
                  {service.items.map((item) => {
                    const on = form.detail === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => set('detail', on ? '' : item)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          on ? 'border-ink bg-ink text-white' : 'border-sand-200 bg-white hover:border-ink/40'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                {service.examples?.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2.5 text-sm font-semibold">
                      시술 예시 사진 <span className="font-normal text-ink-soft">(사진 클릭 시 확대 · 희망 스타일 선택 가능)</span>
                    </p>
                    <ExampleGallery
                      examples={service.examples}
                      selected={form.styleExample}
                      onSelect={(label) => set('styleExample', label)}
                    />
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* 2. 날짜 & 시간 */}
          <SectionCard step="2" title="날짜 · 시간 선택" titleId="dt-title" right={<SlotLegend />}>
            <p id="date-label" className="mb-3 text-sm font-semibold">
              예약 날짜 <span className="text-blush-500" aria-hidden="true">*</span>
            </p>
            <div data-field="date" tabIndex={-1} className="outline-none">
              {!form.serviceId ? (
                <p className="rounded-2xl border border-dashed border-sand-200 py-6 text-center text-sm text-ink-soft">
                  서비스를 먼저 선택해 주세요.
                </p>
              ) : dates.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-sand-200 py-6 text-center text-sm text-ink-soft">
                  예약 가능한 날짜가 없습니다.
                </p>
              ) : (
              <DatePicker
                dates={dates}
                value={form.date}
                onChange={(d) => {
                  set('date', d);
                  set('time', '');
                }}
                labelledBy="date-label"
              />
              )}
            </div>
            {errors.date && <p className="field-error" role="alert">{errors.date}</p>}

            <p id="time-label" className="mb-3 mt-6 text-sm font-semibold">
              예약 시간 <span className="text-blush-500" aria-hidden="true">*</span>
            </p>
            <div data-field="time" tabIndex={-1} className="outline-none">
              {form.serviceId && form.date ? (
                <TimeSlotPicker
                  times={times}
                  booked={booked}
                  capacity={capacity}
                  past={past}
                  value={form.time}
                  onChange={(t) => set('time', t)}
                  loading={slotLoading}
                  labelledBy="time-label"
                />
              ) : (
                <p className="rounded-2xl border border-dashed border-sand-200 py-8 text-center text-sm text-ink-soft">
                  날짜를 먼저 선택해 주세요.
                </p>
              )}
            </div>
            {errors.time && <p className="field-error" role="alert">{errors.time}</p>}
          </SectionCard>

          {/* 3. 예약자 정보 */}
          <SectionCard step="3" title="예약자 정보" titleId="info-title">
            <div className="space-y-5">
              <fieldset>
                <legend className="field-label">구분</legend>
                <div className="inline-flex rounded-full bg-sand-50 p-1">
                  {[
                    ['student', '학생'],
                    ['staff', '교직원'],
                  ].map(([v, l]) => (
                    <label
                      key={v}
                      className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blush-400 ${
                        form.userType === v ? 'bg-white text-ink shadow-card' : 'text-ink-soft'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={v}
                        checked={form.userType === v}
                        onChange={() => set('userType', v)}
                        className="sr-only"
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="이름" required error={errors.name}>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="field-input"
                    maxLength={20}
                    {...ariaFor('name')}
                  />
                </Field>

                {form.userType === 'student' ? (
                  <Field id="studentId" label="학번" required error={errors.studentId} hint="예: 2301 (학년+반+번호)">
                    <input
                      id="studentId"
                      type="text"
                      inputMode="numeric"
                      placeholder="2301"
                      value={form.studentId}
                      onChange={(e) => set('studentId', onlyDigits(e.target.value).slice(0, 6))}
                      className="field-input"
                      aria-describedby={errors.studentId ? 'studentId-error' : 'studentId-hint'}
                      aria-invalid={!!errors.studentId}
                      data-field="studentId"
                    />
                  </Field>
                ) : (
                  <div>
                    <p className="field-label">학번</p>
                    <p className="rounded-2xl bg-sand-50 px-4 py-3.5 text-[15px] text-ink-soft">교직원으로 저장됩니다</p>
                  </div>
                )}
              </div>

              <Field id="phone" label="연락처" required error={errors.phone} hint="숫자만 입력하면 자동으로 형식이 맞춰집니다.">
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="010-1234-5678"
                  value={form.phone}
                  onChange={(e) => set('phone', formatPhone(e.target.value))}
                  className="field-input"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
                  data-field="phone"
                />
              </Field>

              <Field id="memo" label="요청사항" error={errors.memo}>
                <textarea
                  id="memo"
                  rows={4}
                  maxLength={200}
                  placeholder="피부 고민, 알레르기, 원하는 스타일 등을 자유롭게 적어주세요."
                  value={form.memo}
                  onChange={(e) => set('memo', e.target.value)}
                  className="field-input resize-none"
                  {...ariaFor('memo')}
                />
                <p className="mt-1 text-right text-xs text-ink-soft" aria-live="polite">
                  {form.memo.length} / 200
                </p>
              </Field>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={(e) => set('agree', e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded accent-blush-500"
                    {...ariaFor('agree')}
                  />
                  <span>
                    <b>[필수]</b> 예약 확인을 위한 개인정보(이름, 학번, 연락처) 수집 · 이용에 동의합니다.
                    <span className="block text-xs text-ink-soft">수집된 정보는 실습 종료 후 학기 말에 파기됩니다.</span>
                  </span>
                </label>
                {errors.agree && <p id="agree-error" className="field-error" role="alert">{errors.agree}</p>}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 예약 요약 (데스크톱 sticky / 모바일 하단) */}
        <aside aria-labelledby="summary-title" className="lg:sticky lg:top-28">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-blush-100 to-sand-100 px-6 py-5">
              <h2 id="summary-title" className="font-bold">예약 요약</h2>
            </div>
            <dl className="space-y-3 px-6 py-5 text-sm">
              {[
                ['서비스', service ? `${service.icon} ${service.name}${form.detail ? ` · ${form.detail}` : ''}` : null],
                ['날짜', form.date ? formatDateKo(form.date) : null],
                ['시간', form.time || null],
                ['예약자', form.name.trim() || null],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className={`text-right font-semibold ${v ? 'text-ink' : 'text-ink-soft/40'}`}>{v || '미선택'}</dd>
                </div>
              ))}
            </dl>
            <div className="px-6 pb-6">
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? '예약 중...' : '예약하기'}
              </button>
              <p className="mt-3 text-center text-xs text-ink-soft">예약 전 실시간으로 중복 여부를 확인합니다.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
