import type { Subscription } from '@future/shared';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Minus,
  Package,
  Phone,
  Plus,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { DatePicker } from '../../../components/forms/DatePicker';
import { PatientSearchSelect } from '../../../components/forms/PatientSearchSelect';
import { addDays, dateLabel, formatPrice, today, whatsappUrl } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';

const STATUS_CONFIG = [
  { id: 'active', label: 'نشط', desc: 'الكورس جاري والمريض يحضر حالياً', color: '#10b981' },
  { id: 'pending', label: 'بانتظار التفعيل', desc: 'تم الحجز وسيبدأ قريباً', color: '#f59e0b' },
  { id: 'paused', label: 'متوقف مؤقتاً', desc: 'إيقاف مؤقت لعذر أو سفر', color: '#3b82f6' },
  { id: 'completed', label: 'مكتمل', desc: 'استهلك المريض كل الجلسات', color: '#6366f1' },
  { id: 'cancelled', label: 'ملغي', desc: 'تم إلغاء الكورس', color: '#94a3b8' },
] as const;

export function SubscriptionEditor({
  subscription: s,
  onSaved,
  onDeleted,
}: {
  subscription: Partial<Subscription>;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  const isEditing = Boolean(s.id);
  const services = useQuery({ queryKey: ['admin', 'services'], queryFn: adminApi.services });
  const patients = useQuery({
    queryKey: ['admin', 'patients'],
    queryFn: () => adminApi.patients(),
  });

  const [userId, setUserId] = useState(s.userId || '');
  const [name, setName] = useState(s.name || '');
  const [phone, setPhone] = useState(s.phone || '');
  const [chosenProgram, setChosenProgram] = useState(s.programId || '');
  const [price, setPrice] = useState<number | ''>(s.price ?? '');
  const [status, setStatus] = useState<Subscription['status']>(s.status || 'active');
  const [sessionsTotal, setSessionsTotal] = useState<number>(s.sessionsTotal || 4);
  const [sessionsUsed, setSessionsUsed] = useState<number>(s.sessionsUsed ?? 0);
  const [startDate, setStartDate] = useState(s.startDate || today());
  const [endDate, setEndDate] = useState(s.endDate || addDays(today(), 30));
  const [notes, setNotes] = useState(s.notes || '');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected patient details helper
  const selectedPatient = patients.data?.patients.find((p) => p.id === userId);

  const onSelectPatient = (id: string) => {
    setUserId(id);
    if (!id) return;
    const p = patients.data?.patients.find((item) => item.id === id);
    if (p) {
      setName(p.name);
      setPhone(p.phone);
    }
  };

  const handleProgramClick = (progId: string) => {
    setChosenProgram(progId);
    const prog = services.data?.services.find((p) => p.id === progId);
    if (prog) {
      if (prog.sessions) {
        setSessionsTotal(prog.sessions);
      }
      if (prog.price !== undefined && price === '') {
        setPrice(prog.price ?? '');
      }
      const days = prog.duration || 30;
      setEndDate(addDays(startDate, days));
    }
  };

  const handleQuickDuration = (days: number) => {
    setEndDate(addDays(startDate, days));
  };

  const handleIncrementUsed = () => {
    setSessionsUsed((prev) => Math.min(prev + 1, sessionsTotal));
  };

  const handleDecrementUsed = () => {
    setSessionsUsed((prev) => Math.max(prev - 1, 0));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('اسم العميل مطلوب.');
      return;
    }
    if (!phone.trim()) {
      setError('رقم الهاتف مطلوب.');
      return;
    }
    if (!chosenProgram) {
      setError('يرجى اختيار باقة البرنامج.');
      return;
    }
    if (sessionsUsed > sessionsTotal) {
      setError('عدد الجلسات المستخدمة لا يمكن أن يتجاوز إجمالي الجلسات.');
      return;
    }
    if (endDate < startDate) {
      setError('تاريخ نهاية الاشتراك يجب أن يكون بعد تاريخ البداية.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await adminApi.subscription(s.id || 'new', {
        userId: userId || null,
        name: name.trim(),
        phone: phone.trim(),
        programId: chosenProgram,
        price: price === '' ? null : Number(price),
        sessionsTotal,
        sessionsUsed,
        startDate,
        endDate,
        status,
        notes: notes.trim(),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message || 'تعذر حفظ الاشتراك.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!s.id) return;
    setIsDeleting(true);
    setError('');
    try {
      await adminApi.deleteSubscription(s.id);
      if (onDeleted) onDeleted();
      else onSaved();
    } catch (err) {
      setError((err as Error).message || 'تعذر حذف الاشتراك.');
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  const remainingSessions = Math.max(0, sessionsTotal - sessionsUsed);
  const progressPercent = Math.min(100, Math.round((sessionsUsed / (sessionsTotal || 1)) * 100));
  const activeProgObj = services.data?.services.find((p) => p.id === chosenProgram);

  return (
    <form className="sub-editor-form" onSubmit={(e) => void handleSave(e)}>
      {/* 1. Explanatory Banner */}
      <div className="sub-editor-banner">
        <div className="sub-banner-icon">
          <Package size={20} />
        </div>
        <div className="sub-banner-text">
          <strong>إدارة باقات المتابعة وكورسات العيادة</strong>
          <p>
            تتيح لكِ تسجيل اشتراك المريض في باقة دايت (مثل 4 جلسات شهرياً)، لتتبع الحضور والجلسات المتبقية وتاريخ الانتهاء تلقائياً عبر تطبيقه.
          </p>
        </div>
      </div>

      {/* 2. Patient Profile Card */}
      <div className="sub-section-card">
        <div className="sub-section-title-row">
          <span className="sub-section-title">
            <User size={17} />
            <span>بيانات المريض وصاحب الاشتراك</span>
          </span>
          <span className="sub-section-hint">ربط بحساب مسجل أو إدخال يدوي</span>
        </div>

        {selectedPatient ? (
          <div className="sub-patient-card-pro">
            <div className="sub-patient-card-top-row">
              <div className="sub-patient-identity-cluster">
                <div className="sub-patient-avatar-box">
                  <span className="sub-avatar-letter">{selectedPatient.name.slice(0, 1)}</span>
                  <span className="sub-avatar-ring-badge" title="مريض مسجل في المركز">
                    <Check size={10} strokeWidth={3} />
                  </span>
                </div>

                <div className="sub-patient-meta-cluster">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <strong className="sub-patient-name-title">{selectedPatient.name}</strong>
                    {selectedPatient.fileNumber ? (
                      <span className="sub-patient-file-pill" title="رقم الملف الطبي">
                        <FileText size={11} />
                        <span>ملف #{selectedPatient.fileNumber}</span>
                      </span>
                    ) : (
                      <span className="sub-patient-verified-pill">
                        <CheckCircle2 size={11} />
                        <span>مسجل</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="sub-change-patient-btn"
                onClick={() => {
                  setUserId('');
                }}
                title="اختيار مريض آخر أو الإدخال اليدوي"
              >
                <UserCheck size={13} />
                <span>تغيير</span>
              </button>
            </div>

            <div className="sub-patient-bottom-cluster">
              <span className="sub-patient-phone-tag">
                <Phone size={11} />
                <bdi>{selectedPatient.phone}</bdi>
              </span>
              {phone.trim() && (
                <a
                  href={whatsappUrl(phone, `أهلاً بكِ ${selectedPatient.name} في مركز المستقبل، بخصوص اشتراككِ...`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sub-patient-whatsapp-link"
                  title="فتح محادثة واتساب سريعة"
                >
                  <WhatsAppIcon size={12} />
                  <span>مراسلة واتساب</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div>
            <PatientSearchSelect
              patients={patients.data?.patients || []}
              selectedId={userId}
              onSelect={onSelectPatient}
              placeholder="ابحثي بالاسم أو رقم الهاتف لاختيار مريض مسجل..."
            />
          </div>
        )}

        <div className="sub-inputs-two">
          <div className="sub-input-wrap">
            <div className="sub-input-label-row">
              <label htmlFor="sub-name-input">اسم المريض / العميل</label>
              <span className="sub-label-hint-pill">إلزامي للاشتراك</span>
            </div>
            <div className="sub-field-with-icon">
              <span className="sub-field-leading-icon">
                <User size={16} />
              </span>
              <input
                id="sub-name-input"
                type="text"
                className="sub-modern-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم ثلاثي أو ثنائي كما بالملف"
                required
              />
              {name && (
                <button
                  type="button"
                  className="sub-field-clear-btn"
                  onClick={() => setName('')}
                  title="مسح الاسم"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="sub-input-wrap">
            <div className="sub-input-label-row">
              <label htmlFor="sub-phone-input">رقم الهاتف / الواتساب</label>
              {phone.trim() ? (
                <a
                  href={whatsappUrl(phone, `أهلاً بكِ في مركز المستقبل، بخصوص اشتراككِ معنا...`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sub-whatsapp-quick-link"
                  title="فتح محادثة واتساب مباشرة"
                >
                  <WhatsAppIcon size={12} />
                  <span>واتساب مباشر</span>
                </a>
              ) : (
                <span className="sub-label-hint-pill is-green">لإشعار الاشتراك</span>
              )}
            </div>
            <div className="sub-field-with-icon">
              <span className="sub-field-leading-icon">
                <Phone size={16} />
              </span>
              <input
                id="sub-phone-input"
                type="tel"
                dir="ltr"
                className="sub-modern-input is-tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                required
              />
              {phone && (
                <button
                  type="button"
                  className="sub-field-clear-btn"
                  onClick={() => setPhone('')}
                  title="مسح الرقم"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Program Package Selection */}
      <div className="sub-section-card">
        <div className="sub-section-title-row">
          <span className="sub-section-title">
            <Layers size={17} />
            <span>اختيار باقة البرنامج الغذائي</span>
          </span>
          <span className="sub-section-hint">اضغطي لتعبئة الجلسات والسعر تلقائياً</span>
        </div>

        <div className="sub-programs-grid">
          {services.data?.services.map((prog) => {
            const isSelected = chosenProgram === prog.id;
            return (
              <div
                key={prog.id}
                className={`sub-program-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleProgramClick(prog.id)}
                role="button"
                tabIndex={0}
              >
                <div className="sub-program-top">
                  <strong className="sub-program-name">{prog.title}</strong>
                  {isSelected && <Check size={16} color="#063e32" strokeWidth={3} />}
                </div>
                <div className="sub-program-meta">
                  <span>{prog.sessions ? `${prog.sessions} جلسات` : 'متابعة دورية'}</span>
                  <span className="sub-program-price">
                    {prog.price ? `${formatPrice(prog.price)} ج.م` : 'سعر مخصص'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Status Selector */}
      <div className="sub-section-card">
        <div className="sub-section-title-row">
          <span className="sub-section-title">
            <Clock size={17} />
            <span>حالة الاشتراك الحالية</span>
          </span>
        </div>

        <div className="sub-status-pills">
          {STATUS_CONFIG.map((st) => {
            const isCur = status === st.id;
            return (
              <button
                key={st.id}
                type="button"
                className={`sub-status-btn status-${st.id} ${isCur ? 'is-active' : ''}`}
                onClick={() => setStatus(st.id as Subscription['status'])}
                title={st.desc}
              >
                <span className="sub-status-dot" style={{ background: st.color }} />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Sessions Tracker & Progress Stepper */}
      <div className="sub-section-card">
        <div className="sub-section-title-row">
          <span className="sub-section-title">
            <CheckCircle2 size={17} />
            <span>رصيد الجلسات والمتابعة</span>
          </span>
          <span className="sub-section-hint">يمكنك زيادة الجلسة بنقرة واحدة عند حضور المريض</span>
        </div>

        <div className="sub-sessions-box">
          <div className="sub-sessions-lead">
            <div className="sub-sessions-figures">
              <span className="sub-sessions-num-used">{sessionsUsed}</span>
              <span className="sub-sessions-divider">/</span>
              <span className="sub-sessions-num-total">{sessionsTotal}</span>
              <span className="sub-sessions-label">جلسات مستخدمة</span>
            </div>
            <span className="sub-remaining-pill">
              متبقي {remainingSessions} {remainingSessions === 1 ? 'جلسة' : 'جلسات'}
            </span>
          </div>

          <div className="sub-progress-bar-wrap">
            <div
              className="sub-progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                background:
                  progressPercent === 100
                    ? '#6366f1'
                    : progressPercent > 70
                    ? '#063e32'
                    : '#10b981',
              }}
            />
          </div>

          <div className="sub-stepper-control-row">
            <div className="sub-stepper-buttons">
              <button
                type="button"
                className="sub-step-action-btn"
                onClick={handleDecrementUsed}
                disabled={sessionsUsed <= 0}
                title="إنقاص جلسة مستخدمة"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                className="sub-step-add-presence-btn"
                onClick={handleIncrementUsed}
                disabled={sessionsUsed >= sessionsTotal}
                title="تسجيل حضور جلسة الآن"
              >
                <Plus size={16} />
                <span>تسجيل حضور جلسة (+1)</span>
              </button>
            </div>

            <div className="sub-total-chips">
              <span className="sub-total-chips-label">إجمالي الباقة:</span>
              <div className="sub-total-chips-group">
                {[4, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`sub-chip-btn ${sessionsTotal === num ? 'is-active' : ''}`}
                    onClick={() => setSessionsTotal(num)}
                  >
                    {num} جلسات
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Duration & Financial Agreement */}
      <div className="sub-section-card">
        <div className="sub-section-header-block">
          <div className="sub-section-title-wrap">
            <span className="sub-section-title">
              <Calendar size={18} />
              <span>مدة الصلاحية والرسوم</span>
            </span>
            <span className="sub-section-hint">تحديد تاريخ البداية والنهاية وقيمة الاشتراك المعتمدة</span>
          </div>

          <div className="sub-quick-duration-strip">
            <span className="sub-quick-badge">
              <Clock size={12} />
              <span>فترة سريعة:</span>
            </span>
            <div className="sub-quick-chips-group">
              {[
                { label: 'شهر (30 يوم)', days: 30 },
                { label: 'شهرين (60 يوم)', days: 60 },
                { label: '3 شهور (90 يوم)', days: 90 },
              ].map((d) => (
                <button
                  key={d.days}
                  type="button"
                  className="sub-duration-pill-btn"
                  onClick={() => handleQuickDuration(d.days)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sub-dates-grid">
          <div className="sub-input-wrap">
            <label>تاريخ بداية الاشتراك</label>
            <DatePicker
              name="startDate"
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                setEndDate(addDays(val, 30));
              }}
              required
            />
          </div>
          <div className="sub-input-wrap">
            <label>تاريخ نهاية الاشتراك (الصلاحية)</label>
            <DatePicker
              name="endDate"
              value={endDate}
              onChange={setEndDate}
              required
            />
          </div>
        </div>

        <div className="sub-inputs-two" style={{ marginTop: '4px' }}>
          <div className="sub-input-wrap">
            <label>القيمة المتفق عليها (الرسوم)</label>
            <div className="sub-price-field">
              <input
                type="number"
                min={0}
                max={1000000}
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="مثال: 500"
              />
              <span className="sub-price-currency">ج.م</span>
            </div>
          </div>
          <div className="sub-input-wrap">
            <label>ملاحظات إدارية (لا تظهر للمريض)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: دفع مقدم 200 ج.م، باقي 300..."
            />
          </div>
        </div>
      </div>

      {/* 7. Live Preview Card (How it appears in patient's app) */}
      <div className="sub-preview-box">
        <div className="sub-preview-header">
          <span className="sub-preview-label">📱 معاينة بطاقة المريض في تطبيق الهاتف</span>
          <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>تحديث مباشر</span>
        </div>

        <div className="sub-app-card-mockup">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>برنامجك مع المركز</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: status === 'active' ? '#ecfdf5' : '#f1f5f9',
                color: status === 'active' ? '#065f46' : '#475569',
              }}
            >
              {STATUS_CONFIG.find((c) => c.id === status)?.label}
            </span>
          </div>

          <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
            {activeProgObj?.title || 'برنامج متابعة العيادة'}
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
            <span style={{ fontWeight: 800, color: '#063e32' }}>
              {remainingSessions} جلسات متبقية <small style={{ color: '#64748b' }}>من أصل {sessionsTotal}</small>
            </span>
            <span style={{ color: '#64748b', fontSize: '11.5px' }}>
              {dateLabel(startDate, { day: 'numeric', month: 'short' })} — {dateLabel(endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#063e32', borderRadius: '999px' }} />
          </div>
        </div>
      </div>

      <Notice message={error} error />

      {/* 8. Actions & Delete Confirmation Row */}
      {confirmDelete ? (
        <div className="sub-delete-confirm-bar">
          <p>هل أنتِ متأكدة من حذف هذا الاشتراك نهائياً؟ سيتم إلغاء سجل الجلسات بالكامل.</p>
          <div className="sub-delete-confirm-actions">
            <button
              type="button"
              className="btn-confirm-delete-yes"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? 'جارِ الحذف...' : 'نعم، حذف نهائي'}
            </button>
            <button
              type="button"
              className="btn-confirm-delete-cancel"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
            >
              تراجع
            </button>
          </div>
        </div>
      ) : (
        <div className="sub-editor-actions-row">
          {isEditing && (
            <button
              type="button"
              className="sub-btn-delete-trigger"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              <Trash2 size={16} />
              <span>حذف هذا الاشتراك 🗑️</span>
            </button>
          )}

          <button type="submit" className="sub-btn-save" disabled={busy}>
            <CheckCircle2 size={18} />
            <span>{busy ? 'جارِ الحفظ...' : isEditing ? 'حفظ تعديلات الاشتراك' : 'اعتماد وتسجيل الاشتراك'}</span>
          </button>
        </div>
      )}
    </form>
  );
}
