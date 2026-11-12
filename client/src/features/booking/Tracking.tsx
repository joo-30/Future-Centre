import { normalizePhone, type AppointmentPublic } from '@future/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CalendarX2,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  Home,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  FileText,
  Ticket,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, ButtonLink, Loading, Modal, WhatsAppLink } from '../../components/ui';
import { BookingQrPass } from '../../components/appointments/BookingQrPass';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { useCatalog } from '../../hooks/useCatalog';
import { api, dateLabel, formatPrice, timeLabel } from '../../lib/api';
import { RescheduleDialog } from './components/RescheduleDialog';

export function Tracking() {
  const hashToken = useLocation().hash.slice(1);
  const location = useLocation();
  const [lookupToken, setLookupToken] = useState('');
  const token = hashToken || lookupToken;

  const { data: catalog } = useCatalog();
  const [copyMessage, setCopyMessage] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupData, setLookupData] = useState<AppointmentPublic | null>(null);

  const [toast, setToast] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    subMessage?: string;
  } | null>(() => {
    const st = location.state as {
      bookingSuccess?: boolean;
      trackingToken?: string;
      reference?: string;
      serviceTitle?: string;
    } | null;
    if (st?.bookingSuccess) {
      const idLabel = st.reference ? `#${st.reference}` : (st.trackingToken ? `#${st.trackingToken.slice(0, 8)}` : '');
      return {
        type: 'warning',
        message: 'تم استلام طلبك — يرجى انتظار تأكيد الحجز ⏳',
        subMessage: `${idLabel ? `طلبك برقم ${idLabel} ` : 'طلبك '}قيد مراجعة إدارة المركز حالياً. سيتواصل معكِ فريق العيادة لتأكيد الموعد النهائي قبل الحضور.`,
      };
    }
    return null;
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6500);
    return () => clearTimeout(timer);
  }, [toast]);

  const client = useQueryClient();
  const result = useQuery({
    queryKey: ['tracking', token],
    queryFn: () => api.track(token),
    enabled: !!token,
    retry: false,
    refetchInterval: (q) =>
      q.state.data && ['pending', 'confirmed'].includes(q.state.data.status) ? 15000 : false,
  });
  const cancel = useMutation({
    mutationFn: () => api.cancel(token || lookupData?.reference || ''),
    onSuccess: (updated) => {
      if (token) client.setQueryData(['tracking', token], updated);
      setLookupData(updated);
      setCancelOpen(false);
    },
  });

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');

    const cleanInput = lookupQuery.trim();
    if (!cleanInput) {
      setLookupError('يرجى كتابة رقم هاتفكِ المسجل أو كود الحجز للمتابعة.');
      return;
    }

    setLookupBusy(true);
    try {
      const res = await api.lookup({ query: cleanInput });
      setLookupData(res.appointment);
      if (res.trackingToken) {
        setLookupToken(res.trackingToken);
        window.history.replaceState(null, '', '#' + res.trackingToken);
      }
    } catch (err) {
      setLookupError(
        (err as Error).message ||
          'لم نتمكن من العثور على أي حجز يطابق هذا الرقم أو الكود. يرجى التأكد من صحة البيانات والمحاولة مجدداً.',
      );
    } finally {
      setLookupBusy(false);
    }
  };

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    // Wipe any legacy local storage cache so every visitor enters their own credentials privately
    try {
      localStorage.removeItem('fc_recent_booking');
    } catch {
      // ignore
    }
  }, []);

  if (token && result.isPending) return <Loading label="جاري تحديث حالة طلبك..." />;

  const a = token ? result.data : lookupData;

  if (!a) {
    return (
      <main className="app-wrap tracking-wrap">
        {toast && (
          <div className={`app-floating-toast ${toast.type}`} role="status" aria-live="polite">
            <div className="app-toast-left-wrap">
              <span className="app-toast-icon-circle">
                {toast.type === 'warning' ? <Clock size={22} /> : <CheckCircle2 size={22} />}
              </span>
              <div>
                <div className="app-toast-title">{toast.message}</div>
                {toast.subMessage && <div className="app-toast-desc">{toast.subMessage}</div>}
              </div>
            </div>
            <button
              type="button"
              className="app-toast-close-btn"
              onClick={() => setToast(null)}
              aria-label="إغلاق الإشعار"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Top Breadcrumb Navigation Pill */}
        <div className="tracking-top-toolbar">
          <nav className="tracking-breadcrumbs" aria-label="مسار التنقل">
            <Link to="/" className="track-crumb-link">
              <Home size={13} />
              <span>الرئيسية</span>
            </Link>
            <ChevronLeft size={13} className="track-crumb-sep" aria-hidden="true" />
            <Link to="/booking" className="track-crumb-link">
              <Calendar size={13} />
              <span>حجز موعد</span>
            </Link>
            <ChevronLeft size={13} className="track-crumb-sep" aria-hidden="true" />
            <span className="track-crumb-current">
              <Search size={13} />
              <span>متابعة واستعلام الحجز</span>
            </span>
          </nav>
        </div>

        {/* Single Smart Unified Search Box (UI/UX Pro Max) */}
        <div className="tracking-lookup-box">
          <div className="lookup-unified-header">
            <div className="lookup-unified-badge">
              <CheckCircle2 size={14} />
              <span>البحث الذكي الموحد</span>
            </div>
            <h2>استعلام فوري عن تفاصيل الموعد</h2>
            <p>أدخلي رقم هاتفكِ المسجل أو كود الحجز للوصول لموعدكِ وتذكرتكِ الرقمية فوراً.</p>
          </div>

          <form onSubmit={handleLookupSubmit} className="lookup-unified-form">
            <div className="lookup-unified-field">
              <label htmlFor="track-unified-input" className="lookup-unified-label">
                <span>رقم الهاتف أو كود الحجز (4 أرقام)</span>
                <span className="lookup-label-tag">حقل ذكي موحد</span>
              </label>

              <div className="lookup-field-wrapper">
                <div className="lookup-input-box">
                  <Search size={20} className="lookup-inner-icon" />
                  <input
                    id="track-unified-input"
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => {
                      setLookupQuery(e.target.value);
                      setLookupError('');
                    }}
                    placeholder="اكتبي رقم الهاتف المسجل أو كود الحجز"
                    dir="auto"
                    autoComplete="tel"
                    autoFocus
                    required
                    className="lookup-unified-input"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-unified-search"
                  disabled={lookupBusy}
                >
                  {lookupBusy ? (
                    <span>جارٍ البحث...</span>
                  ) : (
                    <>
                      <Search size={16} />
                      <span>متابعة حالة الموعد</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {lookupError && (
              <div className="lookup-alert-msg" role="alert">
                <AlertCircle size={18} />
                <span>{lookupError}</span>
              </div>
            )}
          </form>

          <div className="lookup-unified-chips">
            <div className="lookup-chip">
              <Phone size={14} />
              <span>يقبل أرقام الهواتف: <strong>010xxxxxxxx</strong> أو <strong>+20</strong> أو بالأرقام العربية</span>
            </div>
            <div className="lookup-chip">
              <Ticket size={14} />
              <span>يقبل كود الحجز الرقمي: <strong>4466</strong> أو <strong>#4466</strong></span>
            </div>
          </div>

          <div className="lookup-new-booking-prompt">
            <span>ليس لديكِ حجز مسبق؟</span>
            <Link to="/booking">احجزي موعدكِ الآن من هنا ←</Link>
          </div>
        </div>
      </main>
    );
  }

  const isRejected = a.status === 'rejected';
  const isCancelled = a.status === 'cancelled';
  const confirmed = a.status === 'confirmed' || a.status === 'completed';
  const pending = a.status === 'pending';

  const svc = catalog?.services.find((s) => s.id === a.serviceId || s.title === a.serviceTitle);
  const svcPrice = typeof a.price === 'number' ? a.price : svc?.price;
  const latestMessage = a.history.at(-1)?.message;

  const copy = async () => {
    try {
      const textToCopy = token ? window.location.href : `#${a.reference}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopyMessage(token ? 'تم نسخ رابط المتابعة الخاص بكِ بنجاح.' : 'تم نسخ رقم الحجز بنجاح.');
    } catch {
      setCopyMessage('تعذر النسخ التلقائي. يمكنك نسخ رقم الحجز يدوياً.');
    }
  };

  return (
    <main className="app-wrap tracking-wrap">
      {toast && (
        <div className={`app-floating-toast ${toast.type}`} role="status" aria-live="polite">
          <div className="app-toast-left-wrap">
            <span className="app-toast-icon-circle">
              {toast.type === 'warning' ? <Clock size={22} /> : <CheckCircle2 size={22} />}
            </span>
            <div>
              <div className="app-toast-title">{toast.message}</div>
              {toast.subMessage && <div className="app-toast-desc">{toast.subMessage}</div>}
            </div>
          </div>
          <button
            type="button"
            className="app-toast-close-btn"
            onClick={() => setToast(null)}
            aria-label="إغلاق الإشعار"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Top Toolbar: Breadcrumb Navigation Pills + Search Other Appointment on the RIGHT */}
      <div className="tracking-top-toolbar">
        <nav className="tracking-breadcrumbs" aria-label="مسار التنقل">
          <Link to="/" className="track-crumb-link">
            <Home size={13} />
            <span>الرئيسية</span>
          </Link>
          <ChevronLeft size={13} className="track-crumb-sep" aria-hidden="true" />
          <Link to="/booking" className="track-crumb-link">
            <Calendar size={13} />
            <span>حجز موعد</span>
          </Link>
          <ChevronLeft size={13} className="track-crumb-sep" aria-hidden="true" />
          <span className="track-crumb-current">
            <Ticket size={13} />
            <span>متابعة حالة الحجز</span>
          </span>
        </nav>

        <button
          type="button"
          className="btn-track-new-search"
          onClick={() => {
            if (token) {
              window.location.hash = '';
            }
            setLookupData(null);
            setLookupError('');
            setLookupQuery('');
          }}
        >
          <Search size={14} />
          <span>استعلام عن حجز آخر</span>
        </button>
      </div>

      {/* Empathetic & Prestigious Status Banner */}
      {isRejected ? (
        <div className="track-hero-card is-rejected">
          <div className="track-hero-icon-wrap">
            <CalendarX2 size={32} />
          </div>
          <div className="track-hero-body">
            <div className="track-hero-badge-pill">
              <span>نعتذر منكِ · الموعد غير متاح</span>
            </div>
            <h1 className="track-hero-title">
              أهلاً بكِ يا {a.firstName}.. نعتذر عن عدم إمكانية اعتماد هذا التوقيت
            </h1>
            <p className="track-hero-desc">
              راجع فريق عيادة د. رنا الشورى طلب حجزكِ بعناية، وللأسف هذا الموعد غير متاح حالياً بجدول المركز.
              يسعدنا جداً اختيار موعد بديل فوري يناسبكِ أو التنسيق المباشر معنا عبر واتساب.
            </p>
          </div>
        </div>
      ) : isCancelled ? (
        <div className="track-hero-card is-cancelled">
          <div className="track-hero-icon-wrap">
            <AlertCircle size={32} />
          </div>
          <div className="track-hero-body">
            <div className="track-hero-badge-pill">
              <span>تم إلغاء الموعد</span>
            </div>
            <h1 className="track-hero-title">
              تم إلغاء طلب الموعد بنجاح
            </h1>
            <p className="track-hero-desc">
              تم إلغاء هذا الموعد بناءً على طلبكِ وأصبح الوقت متاحاً للآخرين. يسعدنا استقبالكِ في أي وقت لاحق.
            </p>
          </div>
        </div>
      ) : confirmed ? (
        <div className="track-hero-card is-confirmed">
          <div className="track-hero-icon-wrap">
            <CheckCircle2 size={32} />
          </div>
          <div className="track-hero-body">
            <div className="track-hero-badge-pill">
              <span>موعدكِ مؤكد في العيادة ✓</span>
            </div>
            <h1 className="track-hero-title">
              أهلاً بكِ يا {a.firstName}.. موعدكِ مؤكد في مركز المستقبل! 🌿
            </h1>
            <p className="track-hero-desc">
              تم تأكيد واعتماد موعدكِ بنجاح في عيادة د. رنا الشورى. نتطلع لاستقبالكِ بكل ترحاب وتأكيد حضوركِ عبر التذكرة الذكية أدناه.
            </p>
          </div>
        </div>
      ) : (
        <div className="track-hero-card is-pending">
          <div className="track-hero-icon-wrap">
            <Clock size={32} />
          </div>
          <div className="track-hero-body">
            <div className="track-hero-badge-pill">
              <span>طلبكِ قيد المراجعة لدى العيادة ⏳</span>
            </div>
            <h1 className="track-hero-title">
              أهلاً بكِ يا {a.firstName}.. طلبكِ محفوظ وبانتظار اعتماد المركز
            </h1>
            <p className="track-hero-desc">
              استلمنا طلب حجزكِ برقم #{a.reference}، وفريق العيادة يراجعه حالياً لتأكيد التوقيت وإرسال إشعار لكِ في أسرع وقت.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Core Status & Receipt Column */}
      <section className="tracking-card">
        <div className="tracking-core">
          {/* Doctor / Clinic Consultation Message Card for Rejected / Notes */}
          {isRejected && (
            <div className="clinic-doctor-card">
              <div className="clinic-doctor-header">
                <div className="clinic-doctor-avatar-wrap">
                  <div className="clinic-doctor-avatar">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <div className="clinic-doctor-name-row">
                      <strong>د. رنا ياسر الشورى</strong>
                      <span className="clinic-verified-chip">
                        <Check size={11} />
                        طبيبة معتمدة
                      </span>
                    </div>
                    <span className="clinic-doctor-subtitle">
                      استشاري التغذية العلاجية ونحت القوام · رسالة توضيحية من إدارة المركز
                    </span>
                  </div>
                </div>
                {a.history.at(-1)?.at && (
                  <span className="clinic-note-time">
                    {new Intl.DateTimeFormat('ar-EG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Africa/Cairo',
                    }).format(new Date(a.history.at(-1)!.at))}
                  </span>
                )}
              </div>

              <div className="clinic-quote-bubble">
                <div className="quote-bubble-meta">
                  <MessageSquare size={14} />
                  <span>نص توضيح العيادة لموعدكِ:</span>
                </div>
                <p className="clinic-quote-text">
                  &ldquo;{latestMessage || 'عفواً، الموعد المختار غير متاح حالياً بجدول المركز. يسعدنا اختيار توقيت آخر يناسبكِ.'}&rdquo;
                </p>
              </div>

              <div className="clinic-card-actions">
                <Link to="/booking" className="btn-clinic-primary">
                  <CalendarPlus size={18} />
                  <span>اختيار موعد بديل فوري</span>
                </Link>
                {catalog?.clinic.whatsapp && (
                  <WhatsAppLink
                    phone={catalog.clinic.whatsapp}
                    message={`أهلاً عيادة د. رنا الشورى، بخصوص طلبي رقم #${a.reference}، أود التنسيق لتحديد موعد بديل يناسبني.`}
                    className="btn-clinic-whatsapp"
                  >
                    <WhatsAppIcon size={18} />
                    <span>التنسيق المباشر عبر واتساب</span>
                  </WhatsAppLink>
                )}
              </div>
            </div>
          )}

          {/* Pending Reassuring Notice & Direct Clinic Contact */}
          {pending && (
            <div className="tracking-followup-card">
              <div className="tfc-header">
                <div className="tfc-badge">
                  <Clock size={15} />
                  <span>طلبكِ قيد المراجعة لدى العيادة</span>
                </div>
                <p className="tfc-description">
                  طلبكِ محفوظ في جدول المواعيد وجارٍ مراجعته من فريق المركز لتأكيد الموعد النهائي معكِ في أقرب وقت.
                </p>
              </div>

              <div className="tfc-contact-bar">
                <span className="tfc-contact-title">
                  📞 لو حابب تتابع حجزك أو تستفسر، ده رقم العيادة:
                </span>
                <div className="tfc-contact-actions">
                  {catalog?.clinic?.phones?.[0] ? (
                    <a
                      href={`tel:${normalizePhone(catalog.clinic.phones[0])}`}
                      className="tfc-phone-link"
                      dir="ltr"
                    >
                      <Phone size={14} />
                      <span>{catalog.clinic.phones[0].replace('+20', '0')}</span>
                    </a>
                  ) : (
                    <a href="tel:01041504201" className="tfc-phone-link" dir="ltr">
                      <Phone size={14} />
                      <span>01041504201</span>
                    </a>
                  )}

                  {catalog?.clinic?.phones?.[1] && (
                    <a
                      href={`tel:${normalizePhone(catalog.clinic.phones[1])}`}
                      className="tfc-phone-link tfc-phone-link--secondary"
                      dir="ltr"
                    >
                      <Phone size={14} />
                      <span>{catalog.clinic.phones[1].replace('+20', '0')}</span>
                    </a>
                  )}

                  {catalog?.clinic?.whatsapp && (
                    <WhatsAppLink
                      phone={catalog.clinic.whatsapp}
                      message={`أهلاً عيادة د. رنا الشورى، أود الاستفسار والمتابعة بخصوص طلب الموعد رقم #${a.reference}.`}
                      className="tfc-wa-link"
                    >
                      <WhatsAppIcon size={14} />
                      <span>واتساب العيادة</span>
                    </WhatsAppLink>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirmed Welcome Guidelines */}
          {confirmed && (
            <div
              className="lookup-hint-card"
              style={{
                margin: '0 0 24px',
                background: '#f4fbf5',
                borderColor: '#c6e8cf',
                color: '#16532d',
              }}
            >
              <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
              <div>
                <strong>تعليمات هامة قبل الحضور:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13.5px', lineHeight: 1.6 }}>
                  • للحصول على أدق نتائج فحص InBody، يُفضل الصيام عن الطعام والشاي/القهوة ساعتين قبل الكشف.
                  <br />
                  • يُرجى الحضور قبل الموعد بـ 10 دقائق لتسجيل بياناتكِ والاستعداد.
                </p>
              </div>
            </div>
          )}

          {/* Progress Timeline Stepper */}
          <div className="track-stepper-container">
            <div className="track-stepper-title">
              <CheckCircle2 size={15} style={{ color: '#1b4f2c' }} />
              <span>مراحل معالجة طلب الموعد</span>
            </div>
            <div className="track-stepper-row">
              <div className="track-step-item is-done">
                <span className="track-step-circle">
                  <Check size={14} />
                </span>
                <div className="track-step-meta">
                  <strong>استلام الطلب</strong>
                  <small>تم الحفظ بنجاح</small>
                </div>
              </div>

              <div
                className={`track-step-line ${
                  isRejected || confirmed ? 'is-done' : pending ? 'is-active' : ''
                }`}
              />

              <div
                className={`track-step-item ${
                  isRejected || confirmed ? 'is-done' : 'is-active'
                }`}
              >
                <span className="track-step-circle">
                  {isRejected || confirmed ? <Check size={14} /> : <Clock size={14} />}
                </span>
                <div className="track-step-meta">
                  <strong>مراجعة العيادة</strong>
                  <small>{pending ? 'قيد المراجعة الآن' : 'تمت المراجعة'}</small>
                </div>
              </div>

              <div
                className={`track-step-line ${
                  isRejected ? 'is-declined' : confirmed ? 'is-done' : ''
                }`}
              />

              <div
                className={`track-step-item ${
                  isRejected
                    ? 'is-declined'
                    : confirmed
                      ? 'is-done'
                      : 'is-pending'
                }`}
              >
                <span className="track-step-circle">
                  {isRejected ? (
                    <CalendarX2 size={14} />
                  ) : confirmed ? (
                    <Check size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                </span>
                <div className="track-step-meta">
                  <strong>{isRejected ? 'الموعد غير متاح' : 'تأكيد الموعد'}</strong>
                  <small>
                    {isRejected
                      ? 'نعتذر عن هذا التوقيت'
                      : confirmed
                        ? 'موعد مؤكد بالعيادة'
                        : 'بعد موافقة المركز'}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Reschedule Pending Note */}
          {a.reschedule && (
            <div className="note mt-6">
              <Calendar size={19} />
              <span>
                طلب تغيير إلى {dateLabel(a.reschedule.date)} · {timeLabel(a.reschedule.time)}. يبقى
                موعدك الحالي قائمًا حتى الاعتماد.
              </span>
            </div>
          )}

          {/* Safe Link Note (Shown for active appointments) */}
          {!isRejected && !isCancelled && (
            <div className="tracking-safe">
              <div className="row">
                <LockKeyhole size={18} />
                <div>
                  <strong>رابط خاص لمتابعة طلبك</strong>
                  <p>يمكنكِ الرجوع لهذه الصفحة في أي وقت لمتابعة موعدكِ أو إبراز تذكرتكِ الرقمية لسكرتيرة الاستقبال.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="btn-row">
            {catalog && (
              <WhatsAppLink
                phone={catalog.clinic.whatsapp}
                message={`أهلًا، أتابع طلب الموعد رقم #${a.reference}.`}
              >
                <WhatsAppIcon size={18} />
                <span>المتابعة عبر واتساب</span>
              </WhatsAppLink>
            )}
            <Button kind="light" icon={false} onClick={copy}>
              <Copy size={16} />
              <span>{token ? 'نسخ رابط المتابعة' : 'نسخ رقم الحجز'}</span>
            </Button>
          </div>

          {copyMessage && (
            <p role="status" className="copy-status" style={{ color: '#16a34a', fontWeight: 700 }}>
              {copyMessage}
            </p>
          )}

          {/* History Details */}
          <details className="tracking-history" style={{ marginTop: '24px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#1b4f2c' }}>
              سجل تحديثات وملاحظات الطلب ({a.history.length})
            </summary>
            {a.history.map((h, i) => (
              <div key={i}>
                <span className="dot" />
                <p>
                  {h.message}
                  <small>
                    {new Intl.DateTimeFormat('ar-EG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Africa/Cairo',
                    }).format(new Date(h.at))}
                  </small>
                </p>
              </div>
            ))}
          </details>
        </div>

        {/* Aside Column: Specialized Declined Summary OR Active Ticket QR Pass */}
        {isRejected || isCancelled ? (
          <aside className="track-aside-container">
            <div className="declined-summary-card">
              <div className="declined-card-badge">
                <CalendarX2 size={14} />
                <span>ملخص بيانات الطلب المعتذر عنه</span>
              </div>

              <div className="declined-ref-banner">
                <div>
                  <small>رقم الحجز الرقمي</small>
                  <strong>#{a.reference}</strong>
                </div>
                <span className="declined-stamp">{isCancelled ? 'ملغي' : 'غير متاح'}</span>
              </div>

              <div className="declined-facts-list">
                <div className="declined-fact-row">
                  <span className="fact-label">الخدمة المطلوبة:</span>
                  <strong className="fact-value">{a.serviceTitle}</strong>
                </div>
                <div className="declined-fact-row">
                  <span className="fact-label">الموعد المطلوب:</span>
                  <span className="fact-value highlight-declined">
                    {dateLabel(a.date)} · {timeLabel(a.time)}
                  </span>
                </div>
                <div className="declined-fact-row">
                  <span className="fact-label">مدة الجلسة:</span>
                  <span className="fact-value">{a.duration} دقيقة</span>
                </div>

                {svcPrice && (
                  <div className="declined-price-row">
                    <span className="fact-label">قيمة الكشف:</span>
                    <span className="fact-price-val">
                      <strong>{formatPrice(svcPrice)}</strong>
                      <small>ج.م</small>
                    </span>
                  </div>
                )}

                <div className="declined-fact-row">
                  <span className="fact-label">رقم التواصل:</span>
                  <bdi dir="ltr" className="fact-value">
                    {a.phoneMasked}
                  </bdi>
                </div>

                <div className="declined-fact-row">
                  <span className="fact-label">مكان العيادة:</span>
                  <span className="fact-value">
                    <MapPin size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
                    {catalog?.clinic.address || 'كفر الزيات، شارع الجيش عند توكيل أورنج'}
                  </span>
                </div>
              </div>

              <div className="declined-card-reassurance">
                <ShieldCheck size={18} />
                <p>لم يتم خصم أي مبالغ مالية. يسعدنا اختيار موعد بديل فوري يناسب جدولكِ في أقل من دقيقة.</p>
              </div>

              <div className="declined-card-actions">
                <ButtonLink to="/booking" kind="primary" className="btn-full-width">
                  <CalendarPlus size={16} />
                  <span>اختيار موعد بديل الآن</span>
                </ButtonLink>
              </div>
            </div>
          </aside>
        ) : (
          <aside className="tracking-receipt">
            <BookingQrPass
              reference={a.reference}
              name={a.firstName}
              serviceTitle={a.serviceTitle}
              date={a.date}
              time={a.time}
              phoneMasked={a.phoneMasked}
              status={a.status}
              clinicAddress={catalog?.clinic.address}
              qrToken={a.qrToken}
              price={svcPrice || undefined}
            />

            {/* Clean Understated Booking Management Actions */}
            {(a.canReschedule || a.canCancel) && (
              <div className="track-manage-actions">
                {a.canReschedule && (
                  <button
                    type="button"
                    className="track-manage-btn"
                    onClick={() => setRescheduleOpen(true)}
                  >
                    <Calendar size={14} />
                    <span>طلب تغيير الموعد</span>
                    <ArrowLeft size={13} style={{ marginInlineStart: 'auto' }} />
                  </button>
                )}
                {a.canCancel && (
                  <button
                    type="button"
                    className="track-manage-btn is-cancel"
                    onClick={() => setCancelOpen(true)}
                  >
                    <X size={14} />
                    <span>إلغاء الموعد</span>
                  </button>
                )}
              </div>
            )}

            {/* Direct Shortcut to Prescriptions & Health Records */}
            <div className="track-prescriptions-shortcut">
              <div className="track-rx-top">
                <span className="track-rx-icon-box">
                  <FileText size={18} />
                </span>
                <div>
                  <strong>الروشتات والبرامج الغذائية</strong>
                  <p>يمكنك الدخول لحسابك للاطلاع على جميع روشتاتك وبرامجك الغذائية المعتمدة وطباعتها بصيغة PDF في أي وقت.</p>
                </div>
              </div>
              <Link to="/account?tab=prescriptions" className="track-rx-action-btn">
                <span>فتح ملف الروشتات</span>
                <ArrowLeft size={13} />
              </Link>
            </div>
          </aside>
        )}
      </section>

      {/* Bottom Help Section */}
      <div className="tracking-bottom">
        <div>
          <h3>لديك سؤال أو استفسار بخصوص موعدك؟</h3>
          <p>فريق خدمة عملاء مركز المستقبل يسعده مساعدتكِ والإجابة عن أي استفسار.</p>
        </div>
        <ButtonLink to="/contact" kind="outline small">
          تواصلي معنا
        </ButtonLink>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => {
          if (!cancel.isPending) setCancelOpen(false);
        }}
        title="تأكيد إلغاء الموعد"
      >
        <p>سيُلغى الموعد الحالي ويصبح الوقت متاحًا للآخرين. يمكنك طلب موعد جديد لاحقًا.</p>
        {cancel.error && (
          <p className="form-error" role="alert">
            {cancel.error.message}
          </p>
        )}
        <div className="modal-actions">
          <Button kind="red" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
            {cancel.isPending ? 'جاري الإلغاء...' : 'نعم، إلغاء الموعد'}
          </Button>
          <Button kind="light" onClick={() => setCancelOpen(false)}>
            الاحتفاظ بالموعد
          </Button>
        </div>
      </Modal>

      <RescheduleDialog
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        token={token || a.reference}
        serviceId={a.serviceId}
        onRescheduled={(updated) => setLookupData(updated)}
      />
    </main>
  );
}
