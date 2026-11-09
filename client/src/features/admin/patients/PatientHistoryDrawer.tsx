import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Heart,
  MessageSquare,
  Minus,
  Pencil,
  Phone,
  Plus,
  Scale,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PatientHistoryData } from '@future/shared';
import { StatusBadge } from '../../../components/StatusBadge';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { Button } from '../../../components/ui';
import {
  dateLabel,
  fullDateLabel,
  relativeDateLabel,
  shortDateLabel,
  timeLabel,
  whatsappUrl,
} from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import type { PrescriptionData } from '../prescription/DietPrescriptionModal';

interface PatientHistoryDrawerProps {
  identifier: string; // Patient ID or Phone number
  initialPatientName?: string;
  onClose: () => void;
  onOpenInBody?: (patient: { userId?: string; name: string; phone: string }) => void;
  onOpenPrescription?: (data: Partial<PrescriptionData>) => void;
}

export function PatientHistoryDrawer({
  identifier,
  initialPatientName,
  onClose,
  onOpenInBody,
  onOpenPrescription,
}: PatientHistoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'prescriptions' | 'appointments' | 'notes'>('metrics');
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');

  const historyQuery = useQuery({
    queryKey: ['admin', 'patient-history', identifier],
    queryFn: () => adminApi.patientHistory(identifier),
    staleTime: 30000,
  });

  const data: PatientHistoryData | undefined = historyQuery.data;

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    setNoteError('');
    setNoteSuccess('');
    try {
      await adminApi.addPatientNote(
        identifier,
        newNote.trim(),
        data?.patient.name || initialPatientName
      );
      setNewNote('');
      setNoteSuccess('تم حفظ الملاحظة بنجاح.');
      await historyQuery.refetch();
    } catch (err) {
      setNoteError((err as Error).message || 'حدث خطأ أثناء حفظ الملاحظة.');
    } finally {
      setSavingNote(false);
    }
  }

  const patientName = data?.patient.name || initialPatientName || 'ملف المريض';
  const patientPhone = data?.patient.phone || identifier;
  const metrics = data?.metrics;

  return (
    <>
      {/* Backdrop */}
      <div
        className="patient-history-scrim"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside className="patient-history-drawer" aria-label="ملف المريض الطبي">
        {/* Drawer Header */}
        <div className="ph-header">
          <div className="ph-patient-meta">
            <div className="ph-avatar">
              {patientName.slice(0, 1)}
            </div>
            <div>
              <div className="ph-title-row">
                <h2>{patientName}</h2>
                {data?.patient.id && (
                  <span className="ph-badge-patient">حساب مريض موثق</span>
                )}
              </div>
              <div className="ph-contact-row">
                <a href={`tel:${patientPhone}`} className="ph-contact-link">
                  <Phone size={13} />
                  <bdi dir="ltr">{patientPhone}</bdi>
                </a>
                <a
                  href={whatsappUrl(patientPhone, `أهلاً بحضرتك ${patientName}، معك مركز المستقبل للتغذية العلاجية.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ph-wa-link"
                >
                  <WhatsAppIcon size={14} color="#25D366" />
                  <span>محادثة واتساب</span>
                </a>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ph-close-btn"
            onClick={onClose}
            aria-label="إغلاق ملف المريض"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {historyQuery.isLoading ? (
          <div className="ph-loading-state">
            <div className="ph-spinner" />
            <p>جارٍ تحميل ملف وتاريخ المريض الطبي...</p>
          </div>
        ) : historyQuery.isError ? (
          <div className="ph-error-state">
            <AlertCircle size={28} />
            <p>تعذر تحميل بيانات المريض. يُرجى المحاولة مرة أخرى.</p>
            <Button kind="outline" onClick={() => void historyQuery.refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : (
          <div className="ph-content-scroll">
            {/* Quick KPI Stats Summary Grid */}
            <div className="ph-stats-grid">
              {/* Card 1: Weight & Target */}
              <div className="ph-kpi-card">
                <div className="ph-kpi-icon-wrap" style={{ background: '#eaf4ee', color: '#183d33' }}>
                  <Scale size={18} />
                </div>
                <div className="ph-kpi-body">
                  <span className="ph-kpi-label">الوزن الحالي / المستهدف</span>
                  <div className="ph-kpi-val-row">
                    <strong className="ph-kpi-main-val">
                      {metrics?.currentWeight !== null && metrics?.currentWeight !== undefined
                        ? `${metrics.currentWeight} كجم`
                        : 'غير مسجل'}
                    </strong>
                    {metrics?.targetWeight && (
                      <span className="ph-kpi-sub-target">
                        (المستهدف: {metrics.targetWeight} كجم)
                      </span>
                    )}
                  </div>
                  {metrics?.height && (
                    <span className="ph-kpi-detail">الطول: {metrics.height} سم</span>
                  )}
                  {data?.inbodyRecords?.[0]?.date && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#166534',
                        background: '#eaf4eb',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        marginTop: '4px',
                      }}
                    >
                      آخر فحص: {shortDateLabel(data.inbodyRecords[0].date)} ({relativeDateLabel(data.inbodyRecords[0].date)})
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Total Weight Delta */}
              <div className="ph-kpi-card">
                <div
                  className="ph-kpi-icon-wrap"
                  style={{
                    background:
                      metrics?.weightDelta !== null && metrics?.weightDelta !== undefined
                        ? metrics.weightDelta < 0
                          ? '#e6f7ec'
                          : metrics.weightDelta > 0
                          ? '#fde8e8'
                          : '#f3f4f6'
                        : '#f3f4f6',
                    color:
                      metrics?.weightDelta !== null && metrics?.weightDelta !== undefined
                        ? metrics.weightDelta < 0
                          ? '#107e3e'
                          : metrics.weightDelta > 0
                          ? '#c5221f'
                          : '#4b5563'
                        : '#4b5563',
                  }}
                >
                  {metrics?.weightDelta !== null && metrics?.weightDelta !== undefined ? (
                    metrics.weightDelta < 0 ? (
                      <TrendingDown size={18} />
                    ) : metrics.weightDelta > 0 ? (
                      <TrendingUp size={18} />
                    ) : (
                      <Minus size={18} />
                    )
                  ) : (
                    <Activity size={18} />
                  )}
                </div>
                <div className="ph-kpi-body">
                  <span className="ph-kpi-label">إجمالي التغير في الوزن</span>
                  <div className="ph-kpi-val-row">
                    <strong
                      className="ph-kpi-main-val"
                      style={{
                        color:
                          metrics?.weightDelta !== null && metrics?.weightDelta !== undefined
                            ? metrics.weightDelta < 0
                              ? '#0e7037'
                              : metrics.weightDelta > 0
                              ? '#b91c1c'
                              : '#374151'
                            : '#6b7280',
                      }}
                    >
                      {metrics?.weightDelta !== null && metrics?.weightDelta !== undefined
                        ? metrics.weightDelta < 0
                          ? `↓ نزول ${Math.abs(metrics.weightDelta)} كجم`
                          : metrics.weightDelta > 0
                          ? `↑ زيادة ${metrics.weightDelta} كجم`
                          : 'ثبات في الوزن'
                        : 'بانتظار قياسات المتابعة'}
                    </strong>
                  </div>
                  {metrics?.initialWeight && metrics.initialWeight !== metrics.currentWeight && (
                    <span className="ph-kpi-detail">
                      الوزن في أول زيارة: {metrics.initialWeight} كجم
                    </span>
                  )}
                </div>
              </div>

              {/* Card 3: BMI Index */}
              <div className="ph-kpi-card">
                <div className="ph-kpi-icon-wrap" style={{ background: '#fef3e2', color: '#b45309' }}>
                  <Heart size={18} />
                </div>
                <div className="ph-kpi-body">
                  <span className="ph-kpi-label">مؤشر كتلة الجسم (BMI)</span>
                  <div className="ph-kpi-val-row">
                    <strong className="ph-kpi-main-val">
                      {metrics?.bmi ? metrics.bmi : '—'}
                    </strong>
                    {metrics?.bmiCategory && (
                      <span className="ph-bmi-badge">{metrics.bmiCategory}</span>
                    )}
                  </div>
                  <div className="ph-kpi-sub-metrics">
                    {metrics?.latestFatPercent && (
                      <span>دهون: {metrics.latestFatPercent}%</span>
                    )}
                    {metrics?.latestMuscleMass && (
                      <span>عضلات: {metrics.latestMuscleMass} كجم</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 4: Active Subscription */}
              <div className="ph-kpi-card">
                <div className="ph-kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  <Sparkles size={18} />
                </div>
                <div className="ph-kpi-body">
                  <span className="ph-kpi-label">الاشتراك والجلسات</span>
                  <div className="ph-kpi-val-row">
                    <strong className="ph-kpi-main-val">
                      {data?.activeSubscription
                        ? `${data.activeSubscription.sessionsUsed} من ${data.activeSubscription.sessionsTotal} جلسة`
                        : 'بدون اشتراك نشط'}
                    </strong>
                  </div>
                  {data?.activeSubscription && (
                    <>
                      <div className="ph-session-progress-bar">
                        <div
                          className="ph-session-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (data.activeSubscription.sessionsUsed /
                                  (data.activeSubscription.sessionsTotal || 1)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="ph-kpi-detail">
                        {data.activeSubscription.programTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="ph-quick-actions">
              <button
                type="button"
                className="ph-action-btn primary"
                onClick={() => {
                  if (onOpenInBody) {
                    onOpenInBody({
                      userId: data?.patient.id || undefined,
                      name: patientName,
                      phone: patientPhone,
                    });
                  }
                }}
              >
                <Plus size={16} />
                <span>تسجيل قياس / InBody جديد</span>
              </button>

              <button
                type="button"
                className="ph-action-btn secondary"
                onClick={() => {
                  if (onOpenPrescription) {
                    onOpenPrescription({
                      userId: data?.patient.id || undefined,
                      patientName,
                      patientPhone,
                      weight: metrics?.currentWeight ? String(metrics.currentWeight) : '',
                      targetWeight: metrics?.targetWeight ? String(metrics.targetWeight) : '',
                      height: metrics?.height ? String(metrics.height) : '',
                      bodyFatPercent: metrics?.latestFatPercent ? String(metrics.latestFatPercent) : '',
                      muscleMass: metrics?.latestMuscleMass ? String(metrics.latestMuscleMass) : '',
                    });
                  }
                }}
              >
                <Plus size={16} />
                <span>كتابة روشتة ونظام جديد</span>
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="ph-tabs-nav">
              <button
                type="button"
                className={`ph-tab-btn ${activeTab === 'metrics' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('metrics')}
              >
                <Activity size={16} />
                <span>مسار القياسات ({data?.inbodyRecords.length || 0})</span>
              </button>
              <button
                type="button"
                className={`ph-tab-btn ${activeTab === 'prescriptions' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('prescriptions')}
              >
                <FileText size={16} />
                <span>الروشتات والأنظمة ({data?.prescriptions.length || 0})</span>
              </button>
              <button
                type="button"
                className={`ph-tab-btn ${activeTab === 'appointments' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <Calendar size={16} />
                <span>المواعيد والزيارات ({data?.appointments.length || 0})</span>
              </button>
              <button
                type="button"
                className={`ph-tab-btn ${activeTab === 'notes' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <MessageSquare size={16} />
                <span>ملاحظات الطبيبة ({data?.clinicalNotes.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: InBody & Metrics */}
            {activeTab === 'metrics' && (
              <div className="ph-tab-content">
                {!data?.inbodyRecords.length ? (
                  <div className="ph-empty-state">
                    <Scale size={32} />
                    <h4>لا توجد قياسات مسجلة بعد</h4>
                    <p>سجلي أول قياس للوزن والدهون لتتبع تطور رحلة المريض.</p>
                  </div>
                ) : (
                  <div className="ph-records-timeline">
                    {data.inbodyRecords.map((rec, index) => {
                      const prevRec = data.inbodyRecords[index + 1];
                      const diffWeight =
                        prevRec && typeof rec.weight === 'number' && typeof prevRec.weight === 'number'
                          ? Number((rec.weight - prevRec.weight).toFixed(1))
                          : null;
                      const diffFat =
                        prevRec &&
                        rec.bodyFatPercent !== undefined &&
                        prevRec.bodyFatPercent !== undefined
                          ? Number((rec.bodyFatPercent - prevRec.bodyFatPercent).toFixed(1))
                          : null;

                      return (
                        <div key={rec.id} className="ph-timeline-item">
                          <div className="ph-timeline-date">
                            <Calendar size={14} />
                            <strong>{fullDateLabel(rec.date)}</strong>
                            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>
                              ({relativeDateLabel(rec.date)})
                            </span>
                          </div>

                          <div className="ph-record-card">
                            <div className="ph-record-top">
                              <div className="ph-record-weight">
                                <span className="ph-rw-label">الوزن</span>
                                <strong>{rec.weight} كجم</strong>
                                {diffWeight !== null && (
                                  <span
                                    className={`ph-diff-pill ${
                                      diffWeight < 0 ? 'is-loss' : diffWeight > 0 ? 'is-gain' : 'is-same'
                                    }`}
                                  >
                                    {diffWeight < 0
                                      ? `↓ ${Math.abs(diffWeight)}`
                                      : diffWeight > 0
                                      ? `↑ ${diffWeight}`
                                      : '0'}
                                  </span>
                                )}
                              </div>

                              <div className="ph-record-metrics-row">
                                {rec.bodyFatPercent !== undefined && (
                                  <div className="ph-submetric">
                                    <span className="ph-sm-label">الدهون</span>
                                    <span className="ph-sm-val">{rec.bodyFatPercent}%</span>
                                    {diffFat !== null && (
                                      <small
                                        className={
                                          diffFat < 0 ? 'diff-loss' : diffFat > 0 ? 'diff-gain' : ''
                                        }
                                      >
                                        {diffFat < 0 ? `↓${Math.abs(diffFat)}` : diffFat > 0 ? `↑${diffFat}` : ''}
                                      </small>
                                    )}
                                  </div>
                                )}
                                {rec.muscleMass !== undefined && (
                                  <div className="ph-submetric">
                                    <span className="ph-sm-label">العضلات</span>
                                    <span className="ph-sm-val">{rec.muscleMass} كجم</span>
                                  </div>
                                )}
                                {rec.waterPercent !== undefined && (
                                  <div className="ph-submetric">
                                    <span className="ph-sm-label">الماء</span>
                                    <span className="ph-sm-val">{rec.waterPercent}%</span>
                                  </div>
                                )}
                                {rec.visceralFat !== undefined && (
                                  <div className="ph-submetric">
                                    <span className="ph-sm-label">دهون حشوية</span>
                                    <span className="ph-sm-val">{rec.visceralFat}</span>
                                  </div>
                                )}
                                {rec.waistCm !== undefined && (
                                  <div className="ph-submetric">
                                    <span className="ph-sm-label">الخصر</span>
                                    <span className="ph-sm-val">{rec.waistCm} سم</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {rec.doctorNotes && (
                              <div className="ph-record-notes">
                                <strong>ملاحظات:</strong> {rec.doctorNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Prescriptions */}
            {activeTab === 'prescriptions' && (
              <div className="ph-tab-content">
                {!data?.prescriptions.length ? (
                  <div className="ph-empty-state">
                    <FileText size={32} />
                    <h4>لا توجد روشتات سابقة</h4>
                    <p>اضغطي على "كتابة روشتة ونظام جديد" لإنشاء أول نظام غذائي للمريض.</p>
                  </div>
                ) : (
                  <div className="ph-prescriptions-list">
                    {data.prescriptions.map((rx) => (
                      <div key={rx.id} className="ph-rx-card">
                        <div className="ph-rx-header">
                          <div>
                            <div className="ph-rx-date-row">
                              <Calendar size={14} />
                              <strong>تاريخ الروشتة: {fullDateLabel(rx.date)} ({relativeDateLabel(rx.date)})</strong>
                              {rx.nextDate && (
                                <span className="ph-rx-next">
                                  المتابعة القادمة: {fullDateLabel(rx.nextDate)}
                                </span>
                              )}
                            </div>
                            <h4 className="ph-rx-goal">{rx.goal}</h4>
                          </div>

                          <div className="ph-rx-actions">
                            <a
                              href={whatsappUrl(
                                patientPhone,
                                `أهلاً ${patientName}، إليك ملخص نظامك الغذائي من مركز المستقبل للتغذية:\nالهدف: ${rx.goal}\nالإفطار: ${rx.breakfast || 'حسب النظام'}\nالغداء: ${rx.lunch || 'حسب النظام'}\nالعشاء: ${rx.dinner || 'حسب النظام'}\nمع تمنياتنا لكِ بدوام الصحة والرشاقة.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ph-rx-icon-btn wa"
                              title="إرسال عبر واتساب"
                            >
                              <WhatsAppIcon size={15} color="#25D366" />
                              <span>واتساب</span>
                            </a>
                            <button
                              type="button"
                              className="ph-rx-icon-btn copy"
                              title="نسخ وتعديل"
                              onClick={() => {
                                if (onOpenPrescription) {
                                  onOpenPrescription({
                                    id: rx.id,
                                    userId: rx.userId,
                                    patientName: rx.patientName,
                                    patientPhone: rx.patientPhone,
                                    date: rx.date,
                                    nextDate: rx.nextDate,
                                    age: rx.age,
                                    height: rx.height,
                                    goal: rx.goal,
                                    weight: rx.weight,
                                    targetWeight: rx.targetWeight,
                                    bodyFatPercent: rx.bodyFatPercent,
                                    muscleMass: rx.muscleMass,
                                    waterPercent: rx.waterPercent,
                                    breakfast: rx.breakfast,
                                    snack1: rx.snack1,
                                    lunch: rx.lunch,
                                    snack2: rx.snack2,
                                    dinner: rx.dinner,
                                    waterIntake: rx.waterIntake,
                                    supplements: rx.supplements,
                                    instructions: rx.instructions,
                                  });
                                }
                              }}
                            >
                              <Pencil size={15} />
                              <span>تعديل</span>
                            </button>
                          </div>
                        </div>

                        {/* Meals Preview */}
                        <div className="ph-rx-meals-grid">
                          {rx.breakfast && (
                            <div className="ph-rx-meal-box">
                              <span className="ph-mb-title">الإفطار</span>
                              <p>{rx.breakfast}</p>
                            </div>
                          )}
                          {rx.lunch && (
                            <div className="ph-rx-meal-box">
                              <span className="ph-mb-title">الغداء</span>
                              <p>{rx.lunch}</p>
                            </div>
                          )}
                          {rx.dinner && (
                            <div className="ph-rx-meal-box">
                              <span className="ph-mb-title">العشاء</span>
                              <p>{rx.dinner}</p>
                            </div>
                          )}
                        </div>

                        {(rx.waterIntake || rx.instructions) && (
                          <div className="ph-rx-footer-notes">
                            {rx.waterIntake && (
                              <span>💧 شرب الماء: {rx.waterIntake}</span>
                            )}
                            {rx.instructions && (
                              <span>📌 تعليمات: {rx.instructions}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Appointments */}
            {activeTab === 'appointments' && (
              <div className="ph-tab-content">
                {!data?.appointments.length ? (
                  <div className="ph-empty-state">
                    <Calendar size={32} />
                    <h4>لا توجد مواعيد سابقة أو محجوزة</h4>
                    <p>ستظهر هنا كافة زيارات المريض المحجوزة والمكتملة.</p>
                  </div>
                ) : (
                  <div className="ph-appts-list">
                    {data.appointments.map((a) => (
                      <div key={a.id} className="ph-appt-item">
                        <div className="ph-appt-timing">
                          <span className="ph-appt-date">{fullDateLabel(a.date)}</span>
                          <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>
                            ({relativeDateLabel(a.date)})
                          </span>
                          <span className="ph-appt-time">
                            <Clock size={12} />
                            {timeLabel(a.time)}
                          </span>
                        </div>
                        <div className="ph-appt-info">
                          <h4 className="ph-appt-title">{a.serviceTitle}</h4>
                          <span className="ph-appt-ref">كود الحجز: {a.reference}</span>
                        </div>
                        <div className="ph-appt-status">
                          <StatusBadge status={a.status as any} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Doctor's Clinical Notes */}
            {activeTab === 'notes' && (
              <div className="ph-tab-content">
                <form onSubmit={handleAddNote} className="ph-note-form">
                  <label htmlFor="ph-note-input" className="ph-form-label">
                    إضافة ملاحظة سريرية جديدة (خاصة بالطبيبة فقط):
                  </label>
                  <textarea
                    id="ph-note-input"
                    rows={3}
                    className="ph-textarea"
                    placeholder="مثلاً: التاريخ المرضي، الالتزام بالرياضة، شكوى من ثبات الوزن، تعديل جرعة الماء أو التحاليل المطلوبة..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  {noteError && <p className="ph-msg error">{noteError}</p>}
                  {noteSuccess && <p className="ph-msg success">{noteSuccess}</p>}
                  <div className="ph-form-actions">
                    <Button
                      type="submit"
                      kind="primary"
                      disabled={savingNote || !newNote.trim()}
                      icon={false}
                    >
                      <Send size={15} />
                      {savingNote ? 'جارٍ الحفظ...' : 'حفظ الملاحظة'}
                    </Button>
                  </div>
                </form>

                <div className="ph-notes-list">
                  {!data?.clinicalNotes.length ? (
                    <div className="ph-empty-state" style={{ padding: '24px 0' }}>
                      <MessageSquare size={28} />
                      <h4>لا توجد ملاحظات سريرية بعد</h4>
                      <p>اكتبي أي ملاحظات عن حالة المريض الصحية لتكون مرجعاً في كل زيارة.</p>
                    </div>
                  ) : (
                    data.clinicalNotes.map((note) => (
                      <div key={note.id} className="ph-note-card">
                        <div className="ph-note-header">
                          <span className="ph-note-author">{note.authorName || 'طبيبة المركز'}</span>
                          <span className="ph-note-date">{dateLabel(note.createdAt)}</span>
                        </div>
                        <p className="ph-note-text">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
