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
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Info,
  LockKeyhole,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
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
  const formTop = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
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
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone);
    }
  }, [user?.id, setValue]);

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
  const slots = useQuery({
    queryKey: ['availability', serviceId, date],
    queryFn: () => api.availability(serviceId, date),
    refetchInterval: 20000,
    enabled: !!data,
  });
  const service =
    data?.services.find((s) => s.id === serviceId) ||
    data?.services.find((s) => s.id === 'nutrition');
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
      setSlotError('اختاري وقتًا متاحًا للمتابعة.');
      setFormAlert({
        type: 'warning',
        title: 'تنبيه: اختاري وقت الحجز أولاً',
        message: 'يرجى النقر على وقت متاح من قائمة المواعيد للانتقال للخطوة التالية.',
        missingFields: ['اختيار وقت متاح من جدول المواعيد أعلاه'],
      });
      setTimeout(() => {
        document.querySelector('.booking-calendar-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
      return;
    }
    setMobileStep(2);
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <main className={'app-wrap live-booking step-' + mobileStep}>
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
      <div className="page-title">
        <nav className="booking-breadcrumbs" aria-label="مسار التنقل">
          <Link to="/" className="booking-crumb-link">
            <Home size={13} />
            <span>الرئيسية</span>
          </Link>
          <ChevronLeft size={13} className="booking-crumb-sep" aria-hidden="true" />
          <span className="booking-crumb-current">
            <Calendar size={13} />
            <span>حجز موعد</span>
          </span>
        </nav>
        <span className="mobile-step-count">
          {mobileStep} من ٢ · {mobileStep === 1 ? 'اختيار الموعد' : 'بيانات التواصل'}
          <span>
            <i className="on" />
            <i className={mobileStep === 2 ? 'on' : ''} />
          </span>
        </span>
        <h1>{mobileStep === 1 ? 'موعدك، بخطوات بسيطة.' : 'أضيفي بيانات التواصل.'}</h1>
        <p>
          {mobileStep === 1
            ? 'اختاري الوقت وأضيفي بيانات التواصل، وسيؤكد المركز طلبك.'
            : 'موعدك المختار محفوظ في النموذج، والطلب ينتظر تأكيد المركز بعد الإرسال.'}
        </p>
        <div className="booking-lookup-banner">
          <Link to="/booking/track" className="booking-lookup-banner-link">
            <span className="banner-icon-circle">
              <Search size={18} />
            </span>
            <div className="banner-text">
              <strong>لديكِ طلب موعد بالفعل؟</strong>
              <span>اضغطي هنا لمتابعة حالة الحجز وعرض التذكرة الرقمية</span>
            </div>
            <ArrowLeft size={16} className="banner-arrow-icon" />
          </Link>
        </div>
      </div>
      <div ref={formTop} />
      {(data.clinic.demoSchedule || data.clinic.demoPrices) && (
        <div className="demo-notice" role="note">
          {data.clinic.demoSchedule ? 'ساعات العمل الحالية تجريبية لحين اعتماد المركز. ' : ''}
          {data.clinic.demoPrices ? 'الأسعار توضيحية لحين اعتمادها.' : ''}
        </div>
      )}
      <form onSubmit={submit} noValidate>
        <fieldset disabled={isSubmitting} className="booking-fieldset">
          <div className="book-layout">
            <section className="book-main">
              <div className="guest-strip">
                <span className="row">
                  <span className="pill">
                    <UserRound size={16} />
                    {user?.role === 'patient' ? 'الحجز بحسابك' : 'الحجز كضيف'}
                  </span>
                  <span>
                    {user?.role === 'patient'
                      ? 'سيظهر الموعد في حسابك بعد الإرسال.'
                      : 'لا تحتاجين إلى إنشاء حساب.'}
                  </span>
                </span>
                <Link to="/contact" className="link">
                  تحتاجين مساعدة؟
                </Link>
              </div>
              <div className="booking-step-one">
                <div className="form-chapter">
                  <span className="chapter-num">01</span>اختيار الخدمة الطبية
                </div>
                <div className="service-cards-grid" role="radiogroup" aria-label="اختيار الخدمة الطبية">
                  {data.services.map((s) => {
                    const SIcon = icons[s.icon] || Sparkles;
                    const isSelected = serviceId === s.id;
                    return (
                      <div
                        key={s.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`service-select-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setServiceId(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            setServiceId(s.id);
                          }
                        }}
                      >
                        <div className="card-top-row">
                          <span className="card-icon-pill">
                            <SIcon size={20} />
                          </span>
                          <span className="card-radio-circle">
                            {isSelected && <Check size={13} strokeWidth={3} />}
                          </span>
                        </div>
                        <h3 className="card-service-title">{s.title}</h3>
                        <div className="card-service-meta">
                          <span className="card-meta-pill">
                            <Clock size={13} />
                            {s.duration} دقيقة
                          </span>
                          <span className="card-price-pill">
                            {formatPrice(s.price)} ج.م
                          </span>
                        </div>
                      </div>
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
                <div className="booking-calendar-card">
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
                          onClick={() => setDate(d)}
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
                  <h2 className="sr-only">المواعيد في {dateLabel(date)}</h2>
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
                      {slots.data.dailyCapacity?.showToPatients && (
                        <div className="booking-capacity-banner">
                          <div className="bcb-content">
                            <div className="bcb-icon-wrap">
                              <Sparkles size={16} />
                            </div>
                            <div className="bcb-text">
                              <strong>سعة كشف مخصصة وجودة رعاية فائقة:</strong>
                              <span>
                                حرصاً على منح كل مريض وقتاً كافياً، تستقبل د. رنا بحد أقصى ({slots.data.dailyCapacity.limit} حالة) لهذا اليوم
                              </span>
                            </div>
                          </div>
                          <div className="bcb-badge">
                            {slots.data.dailyCapacity.remaining <= 3 ? (
                              <span className="bcb-urgent">
                                ⏳ المقاعد الأخيرة تنفد (باقي {slots.data.dailyCapacity.remaining} فقط)
                              </span>
                            ) : (
                              <span className="bcb-available">
                                ✨ {slots.data.dailyCapacity.remaining} مقعد متاح للحجز
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="times">
                        {slots.data.slots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            className={
                              'time ' +
                              (!slot.available ? 'busy ' : '') +
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
                                      ? 'انتهى'
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
                <div className="mobile-next">
                  <div className="selected-summary">
                    <strong>
                      {time
                        ? `${dateLabel(date)} · ${timeLabel(time)}`
                        : 'اختاري وقتًا من الأوقات المتاحة.'}
                    </strong>
                  </div>
                  <div className="row">
                    <Button type="button" onClick={nextStep}>
                      متابعة لبياناتك
                    </Button>
                    <a
                      className="mobile-wa"
                      href={whatsappUrl(data.clinic.whatsapp, 'أحتاج مساعدة في طلب موعد.')}
                      aria-label="مساعدة عبر واتساب"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon size={24} color="#ffffff" />
                    </a>
                  </div>
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
                  <button type="button" className="link" onClick={() => setMobileStep(1)}>
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
                      autoComplete="off"
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
                        <Sparkles size={16} />
                      </div>
                      <div className="review-item-content">
                        <span className="review-lbl">الخدمة الطبية</span>
                        <strong className="review-val">{service.title}</strong>
                        <div className="review-val-tags">
                          <span className="review-tag">{formatPrice(service.price)} ج.م</span>
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
                        <strong>بدون دفع إلكتروني:</strong> الكشف والدفع بمقر العيادة · سيتواصل معكِ فريق المركز عبر واتساب لتأكيد الموعد فور الإرسال.
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
            <aside className="booking-summary">
              <section className="receipt">
                <div className="receipt-art">
                  <img src="/assets/hero-sculpture.png" alt="" />
                </div>
                <div className="receipt-content">
                  <span className="latin" lang="en">
                    YOUR FIRST STEP
                  </span>
                  <h2>ملخص موعدك</h2>
                  <div className="facts">
                    {watchName.trim() && (
                      <div className="fact">
                        <span className="fact-label">اسم المريض</span>
                        <strong className="fact-value">{watchName.trim()}</strong>
                      </div>
                    )}
                    {watchPhone.trim() && (
                      <div className="fact">
                        <span className="fact-label">الهاتف للتأكيد</span>
                        <strong className="fact-value" dir="ltr">{watchPhone.trim()}</strong>
                      </div>
                    )}
                    <div className="fact fact-stacked">
                      <span className="fact-label">الخدمة الطبية</span>
                      <strong className="fact-value">{service.title}</strong>
                    </div>
                    <div className="fact">
                      <span className="fact-label">نوع الحضور</span>
                      <span className="venue-fact-badge">
                        <MapPin size={13} /> كشف بمقر العيادة
                      </span>
                    </div>
                    <div className="fact fact-stacked">
                      <span className="fact-label">مقر الكشف</span>
                      <span className="fact-value">{data.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}</span>
                    </div>
                    <div className="fact">
                      <span className="fact-label">اليوم</span>
                      <span className="fact-value">{dateLabel(date)}</span>
                    </div>
                    <div className="fact">
                      <span className="fact-label">الوقت</span>
                      <span className="fact-value">{time ? timeLabel(time) : 'لم يُحدد بعد'}</span>
                    </div>
                    <div className="fact">
                      <span className="fact-label">المدة</span>
                      <span className="fact-value">{service.duration} دقيقة</span>
                    </div>
                  </div>
                  <div className="rule" />
                  <div className="receipt-price-box-v2">
                    <span className="receipt-price-lbl">
                      {data.clinic.demoPrices ? 'سعر توضيحي:' : 'قيمة الكشف:'}
                    </span>
                    <span className="receipt-price-amt">
                      <strong>{formatPrice(service.price)}</strong>
                      <small className="receipt-price-curr">ج.م</small>
                    </span>
                  </div>
                  <p className="foot">
                    لا توجد خطوة دفع إلكتروني.
                    <br />
                    يؤكد المركز تفاصيل الطلب بعد مراجعته.
                  </p>
                </div>
              </section>
              <Link className="help-card" to="/contact">
                <span className="circle-btn">
                  <WhatsAppIcon size={20} color="#25D366" />
                </span>
                <div>
                  <h3>نساعدك في الخطوة الجاية.</h3>
                  <p>تواصلي معنا.</p>
                </div>
              </Link>
            </aside>
          </div>
        </fieldset>
      </form>
      <div className="legal-foot">
        الأوقات بتوقيت المركز في مصر. <Link to="/appointment-policy">سياسة المواعيد</Link> ·{' '}
        <Link to="/privacy">الخصوصية</Link>
      </div>
    </main>
  );
}
