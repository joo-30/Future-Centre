import type { AdminAppointment } from '@future/shared';
import { ArrowLeft, FolderHeart, Printer, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../components/StatusBadge';
import { SlotPicker } from '../../../components/appointments/SlotPicker';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { Button, Modal } from '../../../components/ui';
import { useCatalog } from '../../../hooks/useCatalog';
import { addDays, dateLabel, formatPrice, fullDateLabel, timeLabel, today, whatsappUrl } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { InBodyEditor } from '../patients/InBodyEditor';
import { PatientHistoryDrawer } from '../patients/PatientHistoryDrawer';
import { DietPrescriptionModal } from '../prescription/DietPrescriptionModal';

export function AppointmentReview({
  a,
  onClose,
  onDone,
}: {
  a: AdminAppointment;
  onClose: () => void;
  onDone: () => void;
}) {
  useEffect(() => {
    if (window.matchMedia('(max-width:1350px)').matches)
      document
        .querySelector('.appointment-review')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const navigate = useNavigate();
  const { data } = useCatalog();
  const [mode, setMode] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(a.reschedule?.date || addDays(today(), 1));
  const [time, setTime] = useState(a.reschedule?.time || '');
  const [paidPrice, setPaidPrice] = useState<string>(
    a.price !== null && a.price !== undefined ? String(a.price) : '',
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPaidPrice(a.price !== null && a.price !== undefined ? String(a.price) : '');
  }, [a.price]);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [patientHistoryOpen, setPatientHistoryOpen] = useState(false);
  const [inbodyOpen, setInbodyOpen] = useState(false);
  const [inbodyPatient, setInbodyPatient] = useState<{
    userId?: string;
    name: string;
    phone: string;
  } | null>(null);
  async function decide(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await adminApi.decision(a.reference, {
        action: mode,
        ...(reason ? { reason } : {}),
        ...(mode === 'reschedule' ? { date, time } : {}),
        ...(mode === 'complete' || mode === 'update_price'
          ? { price: paidPrice.trim() !== '' ? Number(paidPrice) : null }
          : {}),
      });
      setMode('');
      setSuccess('تم تحديث الموعد وحفظ الحالة بنجاح.');
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const labels: Record<string, string> = {
    approve: 'تأكيد الموعد',
    reject: 'رفض الطلب',
    cancel: 'إلغاء الموعد',
    reschedule: 'اعتماد وقت بديل',
    complete: 'تسجيل الزيارة مكتملة (حضور)',
    no_show: 'تسجيل عدم الحضور',
    decline_change: 'رفض طلب التغيير',
    update_price: 'تعديل رسوم الكشف',
  };
  return (
    <aside className="appointment-review">
      <div className="between">
        <span className="kicker">تفاصيل الطلب</span>
        <button className="icon-button" aria-label="إغلاق تفاصيل الموعد" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <h2>{a.name}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '6px 0 10px' }}>
        {a.fileNumber && (
          <span className="file-tag-pill" dir="rtl" title="رقم الملف الطبي الدائم">
            ملف #{a.fileNumber}
          </span>
        )}
        <span className="ref-tag-pill" dir="ltr" title="كود الحجز">
          #{a.reference}
        </span>
        <span className={`user-type-tag ${a.userId ? 'is-user' : 'is-guest'}`}>
          {a.userId ? 'حساب مريض' : 'حجز ضيف'}
        </span>
      </div>
      <StatusBadge status={a.status} />
      <dl>
        <div className="review-stacked-row">
          <dt>الخدمة الطبية</dt>
          <dd>{a.serviceTitle}</dd>
        </div>
        <div>
          <dt>الموعد</dt>
          <dd>
            {dateLabel(a.date)}
            <br />
            {timeLabel(a.time)} · {a.duration} دقيقة
          </dd>
        </div>
        <div>
          <dt>رقم الهاتف</dt>
          <dd>
            <a href={'tel:' + a.phone}>
              <bdi dir="ltr">{a.phone}</bdi>
            </a>
          </dd>
        </div>
        <div>
          <dt>قيمة الخدمة وقت الطلب</dt>
          <dd style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span>{a.price === null ? 'تُحدد مع المركز' : formatPrice(a.price) + ' ج.م'}</span>
            <button
              type="button"
              className="icon-button"
              style={{
                padding: '3px 9px',
                fontSize: '12px',
                border: '1px solid var(--border, #cbd5e1)',
                borderRadius: '6px',
                background: 'var(--subtle, #f8fafc)',
                cursor: 'pointer',
              }}
              title="تعديل الرسوم أو تسجيل الخصم"
              onClick={() => {
                setPaidPrice(a.price !== null && a.price !== undefined ? String(a.price) : '');
                setReason('');
                setError('');
                setSuccess('');
                setMode('update_price');
              }}
            >
              تعديل السعر
            </button>
          </dd>
        </div>
      </dl>
      {a.reschedule && (
        <div className="change-request">
          <RefreshCw size={18} />
          <span>
            تطلب تغيير الموعد إلى
            <br />
            <strong>
              {dateLabel(a.reschedule.date)} · {timeLabel(a.reschedule.time)}
            </strong>
          </span>
        </div>
      )}
      <Notice message={success} />
      {data && (
        <div className="whatsapp-templates-card">
          <div className="templates-header">
            <WhatsAppIcon size={18} color="#25D366" />
            <strong>إرسال رسالة واتساب للعميل بنقرة واحدة:</strong>
          </div>
          <div className="templates-actions">
            <a
              href={whatsappUrl(
                a.whatsapp || a.phone,
                `أهلاً بحضرتك ${a.name}، تم تأكيد موعدك في مركز المستقبل للتغذية (${a.serviceTitle}) يوم ${fullDateLabel(a.date)} الساعة ${timeLabel(a.time)}. عنوان المركز: ${data.clinic.address}. نتشرف بزيارتك.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-pill-btn"
            >
              <span>تأكيد الموعد والعنوان</span>
              <ArrowLeft size={14} />
            </a>
            <a
              href={whatsappUrl(
                a.whatsapp || a.phone,
                `تذكير بالموعد: ننتظر تشريفك في مركز المستقبل للتغذية لموعدك (${a.serviceTitle}) يوم ${fullDateLabel(a.date)} الساعة ${timeLabel(a.time)}. للاستفسار أو التأكيد يُرجى الرد على هذه الرسالة.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-pill-btn"
            >
              <span>تذكير بالموعد والتاريخ</span>
              <ArrowLeft size={14} />
            </a>
            <a
              href={whatsappUrl(
                a.whatsapp || a.phone,
                `أهلاً ${a.name}، إليك تفاصيل عنوان مركز المستقبل للتغذية والتخسيس: ${data.clinic.address}. مواعيد العمل: من 1 ظهراً إلى 8 مساءً. نسعد بخدمتك دائماً.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-pill-btn"
            >
              <span>إرسال العنوان واللوكيشن</span>
              <ArrowLeft size={14} />
            </a>
          </div>
        </div>
      )}

      {/* أزرار الإجراءات السريرية في لوحة التفاصيل */}
      <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          className="btn primary"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#183d33',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: '9px',
            fontWeight: 700,
            fontSize: '13.5px',
          }}
          onClick={() => {
            onClose();
            navigate(`/admin/patients/${a.userId || a.reference}`);
          }}
        >
          <FolderHeart size={16} />
          <span>فتح ملف وسجل المريض الشامل</span>
        </button>
        <button
          type="button"
          className="btn outline"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={() => setPrescriptionOpen(true)}
        >
          <Printer size={16} />
          <span>كتابة وطباعة روشتة وبرنامج غذائي</span>
        </button>
      </div>
      <div className="review-decisions">
        {(['pending', 'expired'].includes(a.status)
          ? ['approve', 'reschedule', ...(a.reschedule ? ['decline_change'] : []), 'reject']
          : a.status === 'confirmed'
            ? [
                'reschedule',
                ...(a.reschedule ? ['decline_change'] : []),
                'complete',
                'no_show',
                'cancel',
              ]
            : []
        ).map((action) => (
          <Button
            key={action}
            icon={false}
            kind={
              action === 'approve'
                ? ''
                : action === 'reject' || action === 'cancel'
                  ? 'danger-outline'
                  : 'outline'
            }
            onClick={() => {
              setReason('');
              setError('');
              setSuccess('');
              setMode(action);
            }}
          >
            {labels[action]}
          </Button>
        ))}
      </div>
      <details className="review-history" open>
        <summary>سجل الموعد</summary>
        {a.history
          .slice()
          .reverse()
          .map((h, i) => (
            <div key={i}>
              <span className="dot" />
              <p>
                {h.message}
                <small>
                  {new Intl.DateTimeFormat('ar-EG', {
                    timeZone: 'Africa/Cairo',
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(h.at))}
                </small>
              </p>
            </div>
          ))}
      </details>
      <Modal
        open={!!mode}
        onClose={() => {
          if (!busy) setMode('');
        }}
        title={labels[mode] || 'تحديث الموعد'}
      >
        <form onSubmit={(e) => void decide(e)}>
          <fieldset disabled={busy}>
            {mode === 'reschedule' ? (
              <>
                <p>الوقت الأصلي يظل محجوزًا حتى نجاح النقل. الطلب الجديد يصبح مؤكدًا.</p>
                <SlotPicker
                  reference={a.reference}
                  admin
                  serviceId={a.serviceId}
                  date={date}
                  time={time}
                  onDate={setDate}
                  onTime={setTime}
                />
              </>
            ) : mode === 'complete' ? (
              <>
                <p>تسجيل حضور المريض وإتمام كشف الزيارة بالعيادة.</p>
                <div style={{ margin: '14px 0', padding: '12px', background: 'var(--subtle, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <label className="field" style={{ margin: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                      المبلغ المحصل / رسوم الكشف الفعلي (ج.م):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        value={paidPrice}
                        onChange={(e) => setPaidPrice(e.target.value)}
                        placeholder="مثال: 200 أو 180"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '15px',
                          fontWeight: 600,
                          width: '160px',
                        }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--muted)' }}>جنيه مصري</span>
                    </div>
                    <small style={{ display: 'block', marginTop: '6px', color: 'var(--muted)', fontSize: '12px' }}>
                      سيدخل هذا المبلغ فوراً في إيرادات اليوم وتحليلات العيادة البيانية ويظهر في سجل المريض.
                    </small>
                  </label>
                </div>
              </>
            ) : mode === 'update_price' ? (
              <div style={{ margin: '14px 0' }}>
                <label className="field">
                  <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                    تعديل رسوم الخدمة أو الكشف (ج.م):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      value={paidPrice}
                      onChange={(e) => setPaidPrice(e.target.value)}
                      placeholder="المبلغ الجديد بالجنيه"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '15px',
                        fontWeight: 600,
                        width: '160px',
                      }}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>جنيه مصري</span>
                  </div>
                </label>
              </div>
            ) : mode === 'no_show' ? (
              <p>يُسجل هذا القرار بعد انتهاء وقت الزيارة إذا لم يحضر المريض.</p>
            ) : (
              <p>سيظهر القرار فورًا في صفحة متابعة العميل.</p>
            )}
            {['reject', 'cancel', 'decline_change'].includes(mode) && (
              <label className="field">
                {mode === 'reject' || mode === 'decline_change'
                  ? 'سبب الرفض'
                  : 'سبب الإلغاء (اختياري)'}
                <textarea
                  required={mode === 'reject' || mode === 'decline_change'}
                  maxLength={250}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            )}
            <Notice message={error} error />
            <div className="modal-actions">
              <Button disabled={busy || (mode === 'reschedule' && !time)}>
                {busy ? 'جاري الحفظ...' : 'تأكيد وحفظ القرار'}
              </Button>
              <Button type="button" kind="light" onClick={() => setMode('')}>
                رجوع
              </Button>
            </div>
          </fieldset>
        </form>
      </Modal>

      <DietPrescriptionModal
        open={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
        defaultData={{
          patientName: a.name,
          patientPhone: a.whatsapp || a.phone,
          date: a.date,
        }}
      />

      {patientHistoryOpen && (
        <PatientHistoryDrawer
          identifier={a.userId || a.whatsapp || a.phone}
          initialPatientName={a.name}
          onClose={() => setPatientHistoryOpen(false)}
          onOpenInBody={(p: { userId?: string; name: string; phone: string }) => {
            setInbodyPatient(p);
            setInbodyOpen(true);
          }}
          onOpenPrescription={() => {
            setPrescriptionOpen(true);
          }}
        />
      )}

      <Modal
        open={inbodyOpen}
        onClose={() => setInbodyOpen(false)}
        title="تسجيل فحص InBody جديد للمريض"
      >
        <InBodyEditor
          defaultPatient={
            inbodyPatient || {
              name: a.name,
              phone: a.whatsapp || a.phone,
              userId: a.userId || undefined,
            }
          }
          onSaved={() => {
            setInbodyOpen(false);
          }}
        />
      </Modal>
    </aside>
  );
}
