import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  HeartPulse,
  Phone,
  Sparkles,
  Stethoscope,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DatePicker } from '../../../components/forms/DatePicker';
import { Loading } from '../../../components/ui';
import { useCatalog } from '../../../hooks/useCatalog';
import { addDays, api, dateLabel, timeLabel, today } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';

interface ManualBookingProps {
  onDone: () => void;
}

export function ManualBooking({ onDone }: ManualBookingProps) {
  const { data: catalog } = useCatalog();
  const services = catalog?.services || [];

  const [serviceId, setServiceId] = useState<string>('');
  const [date, setDate] = useState<string>(today());
  const [time, setTime] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  const key = useRef({ payload: '', id: '' });
  const todayStr = useMemo(() => today(), []);

  // Default to first service when catalog loads
  useEffect(() => {
    if (!serviceId && services.length > 0) {
      setServiceId(services[0].id);
    }
  }, [services, serviceId]);

  // Query availability for chosen service & date
  const availabilityQuery = useQuery({
    queryKey: ['manual-booking-slots', serviceId, date],
    queryFn: () => api.availability(serviceId, date),
    enabled: Boolean(serviceId && date),
  });

  const availableSlots = useMemo(
    () => availabilityQuery.data?.slots.filter((s) => s.available) || [],
    [availabilityQuery.data]
  );

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || services[0],
    [services, serviceId]
  );

  // Quick Days
  const quickDays = useMemo(
    () => [
      { label: 'اليوم', val: todayStr },
      { label: 'غداً', val: addDays(todayStr, 1) },
      { label: 'بعد غد', val: addDays(todayStr, 2) },
    ],
    [todayStr]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم المريض بالكامل');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى كتابة رقم الهاتف للتواصل والواتساب');
      return;
    }
    if (!time) {
      setError('يرجى اختيار وقت متاح للجلسة');
      return;
    }

    setBusy(true);
    setError('');

    const body = {
      serviceId,
      date,
      time,
      name: name.trim(),
      phone: phone.trim(),
      consent: true,
    };

    const payload = JSON.stringify(body);
    if (key.current.payload !== payload) {
      key.current = { payload, id: crypto.randomUUID() };
    }

    try {
      await adminApi.manual(body, key.current.id);
      onDone();
    } catch (err) {
      setError((err as Error).message || 'حدث خطأ أثناء إضافة الموعد');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="manual-booking-form" onSubmit={(e) => void handleSubmit(e)}>
      {/* 1. Clinical Info Banner */}
      <div className="mb-info-banner">
        <span className="mb-info-icon-box" aria-hidden="true">
          <Sparkles size={14} />
        </span>
        <span>
          تسجيل موعد كشف أو متابعة يدوي للحالات الواردة هاتفياً أو الحاضرة بالمركز؛ يُدرج الحجز
          مباشرة في جدول المواعيد وسعة اليوم مع ربطه بسجلات المريض.
        </span>
      </div>

      {/* 2. Patient Basic Information */}
      <div className="mb-section">
        <h3 className="mb-section-title">
          <span className="mb-section-icon" aria-hidden="true">
            <User size={15} />
          </span>
          بيانات المريض الأساسية
        </h3>
        <div className="mb-inputs-grid">
          <label className="mb-field-label">
            <span>الاسم ثلاثي / بالكامل *</span>
            <div className="mb-input-wrap">
              <User size={16} className="mb-input-icon" />
              <input
                type="text"
                required
                minLength={3}
                maxLength={100}
                placeholder="مثال: مريم أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                autoFocus
              />
            </div>
            <span className="mb-field-helper">الاسم كما سيظهر في ملف المريض والروشتة الطبية.</span>
          </label>

          <label className="mb-field-label">
            <span>رقم الهاتف (واتساب) *</span>
            <div className="mb-input-wrap">
              <Phone size={16} className="mb-input-icon" />
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="010xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={busy}
              />
            </div>
            <span className="mb-field-helper">يُستخدم للتواصل وإرسال تذكيرات الموعد والروشتة.</span>
          </label>
        </div>
      </div>

      {/* 3. Service Selector Cards */}
      <div className="mb-section">
        <h3 className="mb-section-title">
          <span className="mb-section-icon" aria-hidden="true">
            <Stethoscope size={15} />
          </span>
          اختيار الخدمة الطبية
        </h3>
        <div className="mb-services-grid" role="radiogroup" aria-label="الخدمة الطبية">
          {services.map((s) => {
            const isSelected = s.id === serviceId;
            const isSpecialty = s.id === 'women';
            const Icon = s.id === 'monthly' ? CalendarCheck : isSpecialty ? HeartPulse : Stethoscope;

            return (
              <div
                key={s.id}
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                className={`mb-service-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  if (serviceId !== s.id) {
                    setServiceId(s.id);
                    setTime('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (serviceId !== s.id) {
                      setServiceId(s.id);
                      setTime('');
                    }
                  }
                }}
              >
                <div className="mb-service-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} color={isSelected ? '#194f2c' : '#4b6b55'} />
                    <h4 className="mb-service-title">{s.title}</h4>
                  </div>
                  <div className="mb-service-radio">
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>

                <div className="mb-service-tags">
                  <span className="mb-service-pill is-price">{s.price} ج.م</span>
                  <span className="mb-service-pill">
                    <Clock size={11} /> {s.duration} دقيقة
                  </span>
                  {s.sessions && s.sessions > 1 ? (
                    <span className="mb-service-pill">{s.sessions} متابعات</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Date & Time Selection */}
      <div className="mb-section">
        <h3 className="mb-section-title">
          <span className="mb-section-icon" aria-hidden="true">
            <Calendar size={15} />
          </span>
          تاريخ وتوقيت الحجز
        </h3>

        {/* Quick Date Chips */}
        <div className="mb-quick-dates-row">
          <span style={{ fontSize: '12px', color: '#55725d', fontWeight: 700 }}>أيام سريعة:</span>
          {quickDays.map((qd) => (
            <button
              type="button"
              key={qd.val}
              className={`mb-quick-date-btn ${date === qd.val ? 'is-active' : ''}`}
              onClick={() => {
                setDate(qd.val);
                setTime('');
              }}
            >
              <span>{qd.label}</span>
              <span style={{ opacity: 0.8, fontSize: '11px' }}>
                ({dateLabel(qd.val, { weekday: 'short', day: 'numeric', month: 'short' })})
              </span>
            </button>
          ))}
        </div>

        {/* DatePicker */}
        <div className="mb-datepicker-box">
          <DatePicker
            value={date}
            minDate={todayStr}
            maxDate={addDays(todayStr, 90)}
            onChange={(newDate) => {
              if (newDate) {
                setDate(newDate);
                setTime('');
              }
            }}
          />
        </div>

        {/* Slots Grid */}
        <div className="mb-slots-box">
          <div className="mb-slots-header">
            <span>الفترات المتاحة ليوم {dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            {availableSlots.length > 0 && (
              <span style={{ color: '#1b532f' }}>{availableSlots.length} فترة متاحة</span>
            )}
          </div>

          {availabilityQuery.isPending ? (
            <Loading label="جاري جلب الفترات المتاحة..." />
          ) : availableSlots.length === 0 ? (
            <div className="mb-slots-empty">
              عفواً، لا توجد فترات شاغرة في هذا اليوم ({dateLabel(date)}). يرجى اختيار يوم آخر من التقويم أعلاه.
            </div>
          ) : (
            <div className="mb-slots-grid">
              {availableSlots.map((s) => {
                const isChosen = time === s.time;
                return (
                  <button
                    type="button"
                    key={s.time}
                    className={`mb-slot-btn ${isChosen ? 'is-selected' : ''}`}
                    onClick={() => setTime(s.time)}
                    aria-pressed={isChosen}
                  >
                    <Clock size={12} />
                    <span>{timeLabel(s.time)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Summary Strip */}
      {selectedService && (
        <div className="mb-summary-strip">
          <CheckCircle2 size={18} color="#174d2b" />
          <div>
            <span>
              <strong>الخدمة:</strong> {selectedService.title} ({selectedService.price} ج.م)
            </span>
            <span className="mb-summary-bullet"> • </span>
            <span>
              <strong>الميعاد:</strong> {dateLabel(date, { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            {time ? (
              <>
                <span className="mb-summary-bullet"> • </span>
                <span>
                  <strong>الساعة:</strong> {timeLabel(time)}
                </span>
              </>
            ) : (
              <span style={{ color: '#b45309', fontWeight: 600 }}> (يرجى اختيار التوقيت)</span>
            )}
          </div>
        </div>
      )}

      {/* 6. Consent Checkbox */}
      <label className="mb-consent-label">
        <input
          type="checkbox"
          className="mb-consent-checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        <span>تم التأكد من صحة بيانات المريض وموافقته على تسجيل الموعد بالعيادة.</span>
      </label>

      {/* Error Message */}
      {error && <Notice message={error} error />}

      {/* 7. Footer Actions */}
      <div className="mb-actions-bar">
        <button type="button" className="mb-cancel-btn" onClick={onDone} disabled={busy}>
          إلغاء النافذة
        </button>
        <button
          type="submit"
          className="mb-submit-btn"
          disabled={busy || !time || !name.trim() || !phone.trim() || !consent}
        >
          <CalendarCheck size={18} />
          <span>{busy ? 'جاري الحفظ والتسجيل...' : 'تأكيد وتسجيل الموعد في السيستم'}</span>
        </button>
      </div>
    </form>
  );
}
