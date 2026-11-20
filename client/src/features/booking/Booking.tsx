import { bookingSchema, type BookingData, type BookingInput } from '@future/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Leaf,
  LockKeyhole,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Ticket,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../components/Auth';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { Button, ErrorState, icons, Loading } from '../../components/ui';
import { useCatalog } from '../../hooks/useCatalog';
import {
  addDays,
  api,
  ApiError,
  dateLabel,
  formatPrice,
  timeLabel,
  today,
  whatsappUrl,
} from '../../lib/api';
import { accountApi } from '../../lib/portal-api';
import { clinicServiceArtwork, clinicServiceTitle, clinicServiceRank } from '../../lib/clinic-presentation';

export function Booking() {
  const { user } = useAuth();
  const { data, isPending, error, refetch } = useCatalog();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState(params.get('service') || 'nutrition');
  const [date, setDate] = useState(today);
  const [week, setWeek] = useState(today);
  const [time, setTime] = useState('');
  const [mobileStep, setMobileStep] = useState(1);
  const [phoneDifferent, setPhoneDifferent] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [slotError, setSlotError] = useState('');
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width:760px)').matches);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const formTop = useRef<HTMLElement>(null);
  const calendar = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput, unknown, BookingData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { serviceId, date, time: '', name: '', phone: '', whatsapp: '', consent: false },
  });
  const watchName = watch('name') || '';
  const watchPhone = watch('phone') || '';
  const watchWhatsapp = watch('whatsapp') || '';
  useEffect(() => {
    if (user?.role !== 'patient') return;
    if (!getValues('name')) setValue('name', user.name);
    if (!getValues('phone')) setValue('phone', user.phone);
  }, [user?.id, user?.name, user?.phone, user?.role, getValues, setValue]);

  // Check if logged-in patient already has an active booking on selected date
  const userAccount = useQuery({
    queryKey: ['account', 'my-data'],
    queryFn: accountApi.get,
    enabled: !!user && user.role === 'patient',
  });

  const existingApptOnDate = useMemo(() => {
    if (!userAccount.data?.appointments) return null;
    return userAccount.data.appointments.find(
      (a) => a.date === date && (a.status === 'pending' || a.status === 'confirmed')
    );
  }, [userAccount.data, date]);
  const service =
    data?.services.find((s) => s.id === serviceId) ??
    data?.services.find((s) => s.id === 'nutrition') ??
    data?.services[0];
  const slots = useQuery({
    queryKey: ['availability', service?.id, date],
    queryFn: () => api.availability(service!.id, date),
    refetchInterval: 20000,
    enabled: !!service,
  });
  useEffect(() => {
    if (data && serviceId !== service?.id && service) setServiceId(service.id);
  }, [data, serviceId, service]);
  useEffect(() => {
    setValue('serviceId', serviceId);
    setValue('date', date);
    setValue('time', '');
    setTime('');
    setSlotError('');
  }, [serviceId, date, setValue]);
  useEffect(() => {
    if (time && slots.data && !slots.data.slots.some((s) => s.time === time && s.available)) {
      setTime('');
      setValue('time', '');
      setSlotError('الوقت الذي اخترتِه لم يعد متاحًا. اختاري وقتًا آخر.');
    }
  }, [slots.data, time, setValue]);
  useEffect(() => {
    const media = window.matchMedia('(max-width:760px)');
    const listener = () => setMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  const visibleDays = mobile ? 5 : 7;
  const days = useMemo(
    () => Array.from({ length: visibleDays }, (_, i) => addDays(week, i)),
    [week, visibleDays],
  );
  const handleSelectDate = (d: string) => {
    setDate(d);
    setTime('');
    setValue('time', '');
    setSlotError('');
    setTimeout(() => {
      if (window.innerWidth <= 760) {
        const slotArea = document.querySelector('.slot-area');
        if (slotArea) {
          slotArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 120);
  };

  const pick = (t: string) => {
    setTime(t);
    setValue('time', t, { shouldValidate: true });
    setSlotError('');
  };

  const [formAlert, setFormAlert] = useState<{
    type: 'warning' | 'error';
    title: string;
    message: string;
    missingFields?: string[];
  } | null>(null);

  useEffect(() => {
    if (!formAlert) return;
    const timer = setTimeout(() => setFormAlert(null), 8500);
    return () => clearTimeout(timer);
  }, [formAlert]);

  if (isPending) return <Loading />;
  if (!data || !service)
    return (
      <ErrorState
        message={error?.message || 'تعذر تحميل خدمات الحجز.'}
        onRetry={() => void refetch()}
      />
    );

  const submit = handleSubmit(
    async (values) => {
      setSubmitError('');
      setFormAlert(null);
      if (existingApptOnDate) {
        const statusLabel =
          existingApptOnDate.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة';
        setFormAlert({
          type: 'warning',
          title: 'لديك حجز مسجل بالفعل لهذا اليوم!',
          message: `لديك حجز مسجل في هذا اليوم (${existingApptOnDate.date}) الساعة ${timeLabel(existingApptOnDate.time)} (كود: ${existingApptOnDate.reference} - ${statusLabel}). لا يُسمح بنظام العيادة بحجز أكثر من موعد لنفس المريض في نفس اليوم؛ يمكنك تعديل موعدك الحالي من صفحة حسابك أو اختيار يوم آخر.`,
        });
        setMobileStep(1);
        return;
      }
      if (!time) {
        setSlotError('اختاري وقتًا متاحًا أولًا.');
        setMobileStep(1);
        setFormAlert({
          type: 'warning',
          title: 'تنبيه: وقت الحجز غير محدد!',
          message: 'يرجى اختيار يوم ووقت متاح مناسب لحجزك في العيادة.',
          missingFields: ['اختيار وقت الحجز في العيادة من الجدول'],
        });
        setTimeout(() => {
          document.querySelector('.booking-calendar-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
        return;
      }
      const payload = JSON.stringify(values);
      if (submission.current?.payload !== payload)
        submission.current = { payload, key: crypto.randomUUID() };
      try {
        const result = await api.book(values, submission.current.key);
        // No shared localStorage storage to preserve strict privacy across different visitors on the same device
        navigate(user?.role === 'patient' ? '/account' : '/booking/track#' + result.trackingToken, {
          replace: true,
          state: {
            bookingSuccess: true,
            trackingToken: result.trackingToken,
            reference: result.appointment?.reference,
            serviceTitle: service.title,
            date,
            time,
          },
        });
      } catch (e) {
        const err = e as ApiError;
        setSubmitError(err.message);
        setFormAlert({
          type: 'error',
          title: 'تعذر إرسال طلب الحجز',
          message: err.message || 'حدث خطأ أثناء معالجة الحجز، يرجى المحاولة مرة أخرى.',
        });
        if (err.code === 'SLOT_UNAVAILABLE') {
          setMobileStep(1);
          setTime('');
          setValue('time', '');
          submission.current = null;
          void slots.refetch();
        }
        if (err.code === 'IDEMPOTENCY_MISMATCH') submission.current = null;
      }
    },
    (formErrors) => {
      const missing: string[] = [];
      if (!time || formErrors.time) missing.push('تحديد وقت الحجز المتاح في العيادة');
      if (formErrors.name) missing.push('كتابة اسمك بالكامل');
      if (formErrors.phone) missing.push('إدخال رقم الهاتف للتواصل');
      if (formErrors.serviceId) missing.push('اختيار الخدمة الطبية المطلوبة');
      if (formErrors.consent) missing.push('الموافقة على شروط التواصل وتأكيد الموعد');

      setFormAlert({
        type: 'warning',
        title: 'تنبيه: بيانات ناقصة للحجز!',
        message: 'يرجى مراجعة واستكمال الخانات التالية لتتمكني من إرسال طلب الحجز:',
        missingFields: missing.length ? missing : ['يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح.'],
      });

      if (formErrors.time || formErrors.serviceId || formErrors.date || !time) {
        setMobileStep(1);
        setSlotError('اختاري الخدمة واليوم والوقت المتاح.');
        setTimeout(() => {
          document.querySelector('.booking-calendar-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      } else {
        setMobileStep(2);
        setTimeout(() => {
          const firstErr = document.querySelector('[aria-invalid="true"], .field-error');
          firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      }
    },
  );
  const nextStep = () => {
    if (!time) {
      calendar.current?.focus({ preventScroll: true });
      calendar.current?.scrollIntoView({ block: 'start' });
      return;
    }
    setMobileStep(2);
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formTop.current?.focus({ preventScroll: true });
  };
  return (
    <main className={'app-wrap live-booking booking-ticket step-' + mobileStep}>
      {formAlert && (
        <div className={`app-floating-toast ${formAlert.type}`} role="alert" aria-live="assertive">
          <div className="app-toast-left-wrap">
            <span className="app-toast-icon-circle">
              {formAlert.type === 'warning' ? <AlertTriangle size={22} /> : <AlertCircle size={22} />}
            </span>
            <div>
              <div className="app-toast-title">{formAlert.title}</div>
              <div className="app-toast-desc">{formAlert.message}</div>
              {formAlert.missingFields && (
                <ul className="app-toast-list">
                  {formAlert.missingFields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            type="button"
            className="app-toast-close-btn"
            onClick={() => setFormAlert(null)}
            aria-label="إغلاق التنبيه"
          >
            <X size={15} />
          </button>
        </div>
      )}
      <form onSubmit={submit} noValidate>
        <fieldset disabled={isSubmitting} className="booking-fieldset">
          <div className="book-layout">
            <div className="book-main-col">
              <section className="book-main">
              <header className="booking-ticket-heading" ref={formTop} tabIndex={-1}>
                <div className="booking-ticket-topline">
                  <span className="booking-ticket-step">الخطوة {mobileStep === 1 ? '١' : '٢'} من ٢</span>
                  <Link
                    to="/booking/track"
                    className="booking-track-pill"
                    title="متابعة أو تعديل أو إلغاء حجز سابق"
                  >
                    <Ticket size={16} className="track-pill-icon" aria-hidden="true" />
                    <span>متابعة حجز سابق</span>
                    <ArrowLeft size={15} className="track-pill-arrow" aria-hidden="true" />
                  </Link>
                </div>
                <h1>{mobileStep === 1 ? 'احجزي موعدكِ' : 'بيانات التواصل'}</h1>
                <p>{mobileStep === 1
                  ? 'اختاري الخدمة واليوم والوقت المناسب.'
                  : 'راجعي موعدكِ وأضيفي بيانات التواصل لإرسال الطلب.'}</p>
              </header>
              {(data.clinic.demoSchedule || data.clinic.demoPrices) && (
                <p className="booking-ticket-demo" role="note">
                  {data.clinic.demoSchedule && 'ساعات العمل الحالية تجريبية. '}
                  {data.clinic.demoPrices && 'الأسعار توضيحية.'}
                </p>
              )}
              <div className="booking-step-one">
                <div className="form-chapter">
                  <span className="chapter-num">01</span>اختيار الخدمة الطبية
                </div>
                <div className="service-cards-grid" role="radiogroup" aria-label="اختيار الخدمة الطبية">
                  {[...data.services].sort((a, b) => clinicServiceRank(a.id) - clinicServiceRank(b.id)).map((s) => {
                    const SIcon = icons[s.icon] || Leaf;
                    const isSelected = serviceId === s.id;
                    const artwork = clinicServiceArtwork.get(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`service-select-card ${isSelected ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="selected-service"
                          checked={isSelected}
                          onChange={() => setServiceId(s.id)}
                        />
                        <span className="card-top-row" aria-hidden="true">
                          {artwork && <img className="ticket-service-art" src={artwork} alt="" loading="lazy" />}
                          <span className="card-icon-pill">
                            <SIcon size={20} />
                          </span>
                          <span className="card-radio-circle">
                            {isSelected && <Check size={13} strokeWidth={3} />}
                          </span>
                        </span>
                        <span className="card-service-title">{clinicServiceTitle(s.title)}</span>
                        <span className="card-service-meta">
                          <span className="card-meta-pill">
                            <Clock size={13} />
                            {s.duration} دقيقة
                          </span>
                          <span className="card-price-pill">
                            {formatPrice(s.price)}
                            {s.price !== null && <> ج.م{data.clinic.demoPrices && ' · سعر توضيحي'}</>}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="service-venue-banner">
                  <MapPin size={16} />
                  <span>
                    نوع الحضور: <strong>كشف شخصي بمقر العيادة</strong> ·{' '}
                    {data.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}
                  </span>
                </div>
                <div ref={calendar} className="booking-calendar-card" tabIndex={-1} aria-label="اختيار اليوم والوقت">
                  <div className="calendar-head-pro">
                    <div className="cal-title-group">
                      <span className="cal-icon-wrap">
                        <CalendarDays size={20} />
                      </span>
                      <div>
                        <strong className="cal-month-name">{dateLabel(week, { month: 'long', year: 'numeric' })}</strong>
                        <span className="cal-subtitle">اختاري اليوم المناسب لزيارتك للعيادة</span>
                      </div>
                    </div>
                    <div className="cal-controls-group">
                      {week > today() && (
                        <button
                          type="button"
                          className="cal-today-btn"
                          onClick={() => {
                            setWeek(today());
                            setDate(today());
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>اليوم</span>
                        </button>
                      )}
                      <div className="cal-nav-arrows">
                        <button
                          type="button"
                          className="cal-arrow-btn"
                          disabled={week <= today()}
                          onClick={() =>
                            setWeek(
                              addDays(week, -visibleDays) < today()
                                ? today()
                                : addDays(week, -visibleDays),
                            )
                          }
                          aria-label="الأسبوع السابق"
                          title="الأسبوع السابق"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button
                          type="button"
                          className="cal-arrow-btn"
                          disabled={addDays(week, visibleDays) > addDays(today(), 84)}
                          onClick={() => setWeek(addDays(week, visibleDays))}
                          aria-label="الأسبوع التالي"
                          title="الأسبوع التالي"
                        >
                          <ChevronLeft size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="booking-days-grid" aria-label="اختاري يوم الموعد">
                    {days.map((d) => {
                      const weekday = new Date(d + 'T12:00:00Z').getUTCDay();
                      const clinicDay = data.clinic.hours.find(
                        (h) => h.weekday === (weekday === 0 ? 7 : weekday),
                      );
                      const closed = !clinicDay?.open;
                      const isToday = d === today();
                      const isChosen = date === d;
                      const dayNumber = dateLabel(d, { day: 'numeric' });
                      const weekdayName = dateLabel(d, { weekday: 'short' });

                      return (
                        <button
                          type="button"
                          className={`booking-day-card ${isChosen ? 'is-chosen' : ''} ${closed ? 'is-closed' : ''} ${isToday ? 'is-today' : ''}`}
                          key={d}
                          aria-pressed={isChosen}
                          aria-label={dateLabel(d) + (closed ? ' · عطلة المركز' : '')}
                          onClick={() => handleSelectDate(d)}
                        >
                          <span className="day-weekday-pill">{weekdayName}</span>
                          <b className="day-number-large" dir="ltr">{dayNumber}</b>
                          <div className="day-card-footer">
                            {closed ? (
                              <span className="day-tag-closed">
                                <LockKeyhole size={10} />
                                <span>عطلة</span>
                              </span>
                            ) : isChosen ? (
                              <span className="day-tag-chosen">
                                <Check size={11} strokeWidth={3} />
                                <span>محدد</span>
                              </span>
                            ) : isToday ? (
                              <span className="day-tag-today">اليوم</span>
                            ) : (
                              <span className="day-avail-dot" title="مواعيد متاحة" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="booking-calendar-legend">
                    <span className="legend-chip">
                      <i className="chip-dot dot-available" />
                      متاح للحجز
                    </span>
                    <span className="legend-chip">
                      <i className="chip-dot dot-closed" />
                      العيادة مغلقة
                    </span>
                    <span className="legend-chip">
                      <i className="chip-dot dot-chosen" />
                      يومك المحدد
                    </span>
                  </div>
                </div>
                <div className="slot-area" aria-busy={slots.isFetching}>
                  <div className="booking-ticket-time-heading">
                    <h2>اختاري الوقت</h2>
                    <span>{dateLabel(date)}</span>
                    {slots.data?.dailyCapacity?.showToPatients && (
                      <span>{slots.data.dailyCapacity.remaining} أماكن متاحة اليوم</span>
                    )}
                  </div>
                  {existingApptOnDate && (
                    <div className="patient-day-booked-warning">
                      <div className="pdb-top">
                        <AlertTriangle size={18} className="pdb-icon" />
                        <strong>تنبيه: لديك حجز مسجل بالفعل لهذا اليوم ({existingApptOnDate.date})!</strong>
                      </div>
                      <p>
                        موعدك الحالي: الساعة {timeLabel(existingApptOnDate.time)} ({existingApptOnDate.serviceTitle}) · كود الحجز:{' '}
                        <code>{existingApptOnDate.reference}</code> ({existingApptOnDate.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة'}).
                      </p>
                      <div className="pdb-footer">
                        <span>يسمح بنظام العيادة بحجز موعد واحد فقط لكل مريض في اليوم الواحد.</span>
                        <Link to="/account" className="pdb-link">
                          متابعة أو تعديل موعدك من حسابك &larr;
                        </Link>
                      </div>
                    </div>
                  )}
                  {slots.isPending ? (
                    <Loading label="جاري تحديث الأوقات..." />
                  ) : slots.error ? (
                    <ErrorState
                      message={slots.error.message}
                      onRetry={() => void slots.refetch()}
                    />
                  ) : slots.data?.closed || !slots.data?.slots.length ? (
                    <div className="empty-slots">
                      <Calendar />
                      <h3>اختاري يومًا آخر.</h3>
                      <p>{slots.data?.message}</p>
                      <Button
                        type="button"
                        kind="outline"
                        onClick={() => {
                          const next = addDays(date, 1);
                          setDate(next);
                          if (next > days[days.length - 1]) setWeek(next);
                        }}
                      >
                        عرض اليوم التالي
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="times">
                        {slots.data.slots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            className={
                              'time ' +
                              (!slot.available ? 'busy ' : '') +
                              (slot.reason === 'booked' ? 'is-booked ' : '') +
                              (time === slot.time ? 'chosen' : '')
                            }
                            disabled={!slot.available}
                            aria-pressed={time === slot.time}
                            aria-label={
                              timeLabel(slot.time) +
                              ' · ' +
                              (slot.available
                                ? 'متاح'
                                : slot.reason === 'booked'
                                  ? 'محجوز'
                                  : 'غير متاح')
                            }
                            onClick={() => pick(slot.time)}
                          >
                            <span>{timeLabel(slot.time)}</span>
                            <small>
                              {!slot.available ? (
                                <LockKeyhole size={13} />
                              ) : time === slot.time ? (
                                <Check size={13} />
                              ) : null}
                              {time === slot.time
                                ? 'محدد'
                                : slot.available
                                  ? 'متاح'
                                  : slot.reason === 'booked'
                                    ? 'محجوز'
                                    : slot.reason === 'past'
                                      ? 'محجوز'
                                      : 'غير متاح'}
                            </small>
                          </button>
                        ))}
                      </div>
                      {!slots.data.slots.some((s) => s.available) && (
                        <p className="slot-note">
                          لا يوجد وقت متاح. يمكنك اختيار يوم آخر من الأعلى.
                        </p>
                      )}
                    </>
                  )}
                </div>
                {slotError && (
                  <p className="field-error" role="alert">
                    {slotError}
                  </p>
                )}
                <div className="mobile-next booking-ticket-next">
                  <div className="booking-ticket-recap">
                    <div><span>قيمة الخدمة</span><strong>{formatPrice(service.price)}{service.price !== null && ' ج.م'}</strong></div>
                    <div><span>مدة الموعد</span><strong>{service.duration} دقيقة</strong></div>
                    <div><span>الموعد المختار</span><strong>{time ? dateLabel(date) + ' · ' + timeLabel(time) : 'اختاري الوقت'}</strong></div>
                  </div>
                  <Button type="button" onClick={nextStep}>
                    {time ? 'متابعة لبيانات التواصل' : 'اختاري وقت الموعد'}
                  </Button>
                  <p>
                    يؤكد المركز الموعد بعد مراجعة الطلب. الدفع في العيادة.
                    <a
                      href={whatsappUrl(data.clinic.whatsapp, 'أحتاج مساعدة في طلب موعد.')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon size={16} aria-hidden="true" /> مساعدة عبر واتساب
                    </a>
                  </p>
                </div>
              </div>
              <div className="booking-step-two">
                <div className="mobile-selected panel">
                  <span>
                    <strong>{service.title}</strong>
                    <br />
                    <span className="mobile-venue-hint">
                      <MapPin size={13} /> {data.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}
                    </span>
                    <br />
                    {dateLabel(date)} · {time ? timeLabel(time) : 'لم يحدد الوقت'}
                  </span>
                  <button type="button" className="link" onClick={() => {
                      setMobileStep(1);
                      formTop.current?.scrollIntoView({ block: 'start' });
                    }}>
                    تغيير الموعد
                  </button>
                </div>
                <div className="form-chapter contact-heading">
                  <span className="chapter-num">02</span>بيانات التواصل
                </div>
                <div className="contact">
                  <label className="field">
                    الاسم بالكامل
                    <input
                      {...register('name')}
                      autoComplete="name"
                      placeholder="اكتبي اسمك بالكامل"
                      aria-invalid={!!errors.name}
                      aria-describedby="name-error"
                    />
                    {errors.name && (
                      <span id="name-error" className="field-error">
                        {errors.name.message}
                      </span>
                    )}
                  </label>
                  <label className="field">
                    رقم الهاتف
                    <input
                      {...register('phone')}
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      autoComplete="tel"
                      placeholder=""
                      aria-invalid={!!errors.phone}
                      aria-describedby="phone-error"
                    />
                    {errors.phone && (
                      <span id="phone-error" className="field-error">
                        {errors.phone.message}
                      </span>
                    )}
                  </label>
                </div>
                <div className="contact-note">
                  <span>نستخدم رقمك لتأكيد الطلب والمتابعة فقط.</span>
                  <button
                    type="button"
                    className="link"
                    aria-expanded={phoneDifferent}
                    onClick={() => {
                      setPhoneDifferent(!phoneDifferent);
                      if (phoneDifferent) setValue('whatsapp', '');
                    }}
                  >
                    رقم واتساب مختلف؟
                  </button>
                </div>
                {phoneDifferent && (
                  <label className="field alternate-phone">
                    رقم واتساب
                    <input
                      {...register('whatsapp')}
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      autoComplete="off"
                      placeholder=""
                    />
                    {errors.whatsapp && (
                      <span className="field-error">{errors.whatsapp.message}</span>
                    )}
                  </label>
                )}
                <label className="consent">
                  <input type="checkbox" {...register('consent')} />
                  أوافق على التواصل معي بخصوص هذا الطلب.
                </label>
                {errors.consent && <p className="field-error">{errors.consent.message}</p>}

                {/* Modern Streamlined Booking Review & Confirmation Card */}
                <div className="booking-review-summary-card">
                  <div className="review-card-header">
                    <div className="review-title-wrap">
                      <div className="review-icon-pill">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="review-card-title">مراجعة بيانات حجزك قبل التأكيد</h3>
                        <p className="review-card-sub">ملخص سريع لتفاصيل موعدك وبيانات التواصل قبل إرسال الطلب</p>
                      </div>
                    </div>
                    <div className="review-status-wrap">
                      {watchName.trim() && watchPhone.trim() && time ? (
                        <span className="review-status-badge is-ready">
                          <Check size={14} /> بياناتك مكتملة وجاهزة للإرسال
                        </span>
                      ) : !time ? (
                        <span className="review-status-badge is-attention">
                          <Clock size={14} /> يرجى اختيار التوقيت من الخطوة 1
                        </span>
                      ) : (
                        <span className="review-status-badge is-pending">
                          <Info size={14} /> استكملي الاسم ورقم الهاتف أعلاه
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="review-details-grid">
                    {/* Item 1: Service */}
                    <div className="review-item">
                      <div className="review-item-icon">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="review-item-content">
                        <span className="review-lbl">الخدمة الطبية</span>
                        <strong className="review-val">{service.title}</strong>
                        <div className="review-val-tags">
                          <span className="review-tag">
                            {formatPrice(service.price)}
                            {service.price !== null && <> ج.م{data.clinic.demoPrices && ' · سعر توضيحي'}</>}
                          </span>
                          <span className="review-tag">{service.duration} دقيقة</span>
                          <span className="review-tag">كشف بالعيادة</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 2: Date & Time */}
                    <div className="review-item">
                      <div className="review-item-icon">
                        <Calendar size={16} />
                      </div>
                      <div className="review-item-content">
                        <span className="review-lbl">تاريخ وتوقيت الموعد</span>
                        <strong className="review-val">
                          {dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </strong>
                        <div className="review-val-tags">
                          {time ? (
                            <span className="review-tag is-highlight">
                              <Clock size={12} /> الساعة {timeLabel(time)}
                            </span>
                          ) : (
                            <span className="review-tag is-missing">
                              <Clock size={12} /> لم يحدد الوقت (اختاري من الخطوة 1)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Item 3: Patient Name */}
                    <div className="review-item">
                      <div className="review-item-icon">
                        <UserRound size={16} />
                      </div>
                      <div className="review-item-content">
                        <span className="review-lbl">اسم المريض</span>
                        <strong className={`review-val ${!watchName.trim() ? 'is-empty' : ''}`}>
                          {watchName.trim() || 'اكتبي اسمك بالكامل في الخانة أعلاه'}
                        </strong>
                      </div>
                    </div>

                    {/* Item 4: Phone */}
                    <div className="review-item">
                      <div className="review-item-icon">
                        <Phone size={16} />
                      </div>
                      <div className="review-item-content">
                        <span className="review-lbl">رقم الهاتف للتأكيد</span>
                        <strong className={`review-val ltr-val ${!watchPhone.trim() ? 'is-empty' : ''}`} dir="ltr">
                          {watchPhone.trim() || 'اكتبي رقم الهاتف أعلاه'}
                        </strong>
                        {phoneDifferent && watchWhatsapp.trim() && (
                          <div className="review-val-tags">
                            <span className="review-tag" dir="ltr">
                              واتساب: {watchWhatsapp.trim()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="review-card-footer">
                    <div className="review-trust-strip">
                      <Check size={16} className="trust-check" />
                      <span>
                        <strong>بدون دفع إلكتروني:</strong> الكشف والدفع بمقر العيادة · يتواصل معكِ فريق المركز بعد مراجعة الطلب لتأكيد الموعد.
                      </span>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <p className="form-error" role="alert">
                    {submitError}
                  </p>
                )}
                <div className="submit-row">
                  <Button disabled={isSubmitting}>
                    {isSubmitting ? 'جاري حفظ طلبك...' : 'إرسال طلب الموعد'}
                  </Button>
                  <span className="small muted">بدون دفع إلكتروني · الدفع بالعيادة</span>
                </div>
              </div>
            </section>
            <div className="legal-foot">
              الأوقات بتوقيت المركز في مصر. <Link to="/appointment-policy">سياسة المواعيد</Link> ·{' '}
              <Link to="/privacy">الخصوصية</Link>
            </div>
          </div>
          <figure className="booking-ticket-art" aria-hidden="true">
            <img src="/assets/booking-ticket-sculpture.webp" alt="" width="840" height="1050" />
          </figure>
        </div>
      </fieldset>
    </form>
  </main>
  );
}
