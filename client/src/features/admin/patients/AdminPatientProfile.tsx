import {
  Activity,
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  MessageSquare,
  Minus,
  Pencil,
  Phone,
  Plus,
  Printer,
  Scale,
  Send,
  TrendingDown,
  TrendingUp,
  User,
  Utensils,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type {
  InBodyRecordPublic,
  PatientClinicalNote,
  PatientHistoryAppointment,
  PatientHistoryData,
  PrescriptionPublic,
} from '@future/shared';
import { StatusBadge } from '../../../components/StatusBadge';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { Button, ErrorState, Loading, Modal } from '../../../components/ui';
import {
  dateLabel,
  fullDateLabel,
  relativeDateLabel,
  shortDateLabel,
  timeLabel,
  whatsappUrl,
} from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { DietPrescriptionModal, type PrescriptionData } from '../prescription/DietPrescriptionModal';
import { InBodyEditor } from './InBodyEditor';

export function AdminPatientProfile() {
  const { identifier: paramId } = useParams<{ identifier?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const identifier =
    paramId ||
    searchParams.get('id') ||
    searchParams.get('phone') ||
    searchParams.get('ref') ||
    searchParams.get('identifier') ||
    '';

  const [activeTab, setActiveTab] = useState<'metrics' | 'prescriptions' | 'appointments' | 'notes'>('metrics');
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');

  // Modals state
  const [inbodyModal, setInbodyModal] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<Partial<PrescriptionData> | undefined>(undefined);

  const historyQuery = useQuery({
    queryKey: ['admin', 'patient-history', identifier],
    queryFn: () => adminApi.patientHistory(identifier),
    enabled: Boolean(identifier),
    staleTime: 30000,
  });

  const data: PatientHistoryData | undefined = historyQuery.data;

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || !identifier) return;
    setSavingNote(true);
    setNoteError('');
    setNoteSuccess('');
    try {
      await adminApi.addPatientNote(
        identifier,
        newNote.trim(),
        data?.patient.name
      );
      setNewNote('');
      setNoteSuccess('تم حفظ الملاحظة الطبية بنجاح.');
      await historyQuery.refetch();
    } catch (err) {
      setNoteError((err as Error).message || 'تعذر حفظ الملاحظة.');
    } finally {
      setSavingNote(false);
    }
  }

  if (!identifier) {
    return (
      <div className="admin-page-container">
        <div className="portal-empty">
          <User size={48} />
          <h2>لم يتم تحديد مريض لعرض ملفه</h2>
          <p>يرجى اختيار مريض من قائمة العملاء أو مسح كود الـ QR الخاص به.</p>
          <Button onClick={() => navigate('/admin/patients')}>الذهاب لقائمة العملاء</Button>
        </div>
      </div>
    );
  }

  if (historyQuery.isPending) {
    return (
      <div className="admin-page-container">
        <Loading />
      </div>
    );
  }

  if (historyQuery.error) {
    const errorMsg =
      (historyQuery.error as Error)?.message ||
      `تعذر تحميل ملف المريض (${identifier}). لم يتم العثور على أي سجل مطابق.`;
    return (
      <div className="admin-page-container">
        <ErrorState
          message={errorMsg}
          onRetry={() => void historyQuery.refetch()}
        />
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {errorMsg.includes('معلق') && (
            <Button onClick={() => navigate('/admin')}>
              الانتقال لجدول المواعيد لاعتماد الطلب أولاً
            </Button>
          )}
          <Button kind="outline" onClick={() => navigate('/admin/patients')}>
            العودة لقائمة العملاء
          </Button>
        </div>
      </div>
    );
  }

  const patient = data?.patient;
  const metrics = data?.metrics;
  const inbodyRecords: InBodyRecordPublic[] = data?.inbodyRecords || [];
  const prescriptions: PrescriptionPublic[] = data?.prescriptions || [];
  const appointments: PatientHistoryAppointment[] = data?.appointments || [];
  const notes: PatientClinicalNote[] = data?.clinicalNotes || [];

  const bmiValue = metrics?.bmi ?? null;
  const bmiCategoryLabel =
    metrics?.bmiCategory ||
    (bmiValue === null
      ? '—'
      : bmiValue < 18.5
        ? 'نحافة'
        : bmiValue < 25
          ? 'وزن مثالي وطبيعي'
          : bmiValue < 30
            ? 'زيادة وزن'
            : bmiValue < 35
              ? 'سمنة درجة أولى'
              : 'سمنة مفرطة');

  const bmiBadgeClass =
    bmiValue === null
      ? ''
      : bmiValue >= 18.5 && bmiValue < 25
        ? 'is-normal'
        : bmiValue >= 25 && bmiValue < 30
          ? 'is-overweight'
          : 'is-obese';

  const weightDelta = metrics?.weightDelta ?? null;
  const isLoss = weightDelta !== null && weightDelta < 0;
  const isGain = weightDelta !== null && weightDelta > 0;

  const latestInbody = inbodyRecords.length > 0 ? inbodyRecords[0] : null;
  const latestRx = prescriptions.length > 0 ? prescriptions[0] : null;
  const latestAppt = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="patient-profile-fullpage">
      {/* 1. Header & Breadcrumbs */}
      <div className="ppf-top-navigation">
        <div className="ppf-breadcrumbs">
          <Link to="/admin" className="crumb-link">
            الرئيسية
          </Link>
          <ChevronRight size={14} className="crumb-sep" />
          <Link to="/admin/patients" className="crumb-link">
            العملاء والاشتراكات
          </Link>
          <ChevronRight size={14} className="crumb-sep" />
          <span className="crumb-current">ملف المريض: {patient?.name}</span>
        </div>

        <div className="ppf-top-actions">
          <Button
            kind="light"
            icon={false}
            onClick={() => window.print()}
            title="طباعة الملف الطبي كاملاً"
          >
            <Printer size={16} />
            طباعة الملف
          </Button>

          <Button
            kind="outline"
            icon={false}
            onClick={() => navigate(`/admin/bmi?patientId=${patient?.id || identifier}`)}
            title="فتح بيانات المريض في حاسبة الـ BMI والسعرات"
          >
            <Flame size={16} />
            حاسبة الـ BMI
          </Button>

          <Button
            kind="light"
            icon={false}
            onClick={() => setInbodyModal(true)}
          >
            <Scale size={16} />
            تسجيل InBody
          </Button>

          <Button
            icon={false}
            onClick={() => {
              setPrescriptionData({
                patientName: patient?.name,
                patientPhone: patient?.phone,
                userId: patient?.id ?? undefined,
                weight: metrics?.currentWeight ? String(metrics.currentWeight) : undefined,
                height: metrics?.height ? String(metrics.height) : undefined,
              });
              setPrescriptionModal(true);
            }}
          >
            <Plus size={16} />
            كتابة روشتة جديدة
          </Button>
        </div>
      </div>

      {/* 2. Patient Hero Identity Card */}
      <section className="ppf-hero-card">
        <div className="ppf-hero-profile">
          <div className="ppf-avatar-circle">
            {patient?.name.slice(0, 1)}
          </div>
          <div className="ppf-identity-text">
            <div className="ppf-name-row">
              <h1 className="ppf-patient-name">{patient?.name}</h1>
              {patient?.fileNumber && (
                <span className="ppf-file-number-badge" title="رقم الملف الطبي الدائم">
                  ملف #{patient.fileNumber}
                </span>
              )}
              <span className="ppf-account-badge">
                {patient?.id ? 'حساب مريض مسجل' : 'ملف حجز بعيادة'}
              </span>
            </div>

            <div className="ppf-contact-row">
              <span className="ppf-phone-pill">
                <Phone size={13} />
                <bdi dir="ltr">{patient?.phone}</bdi>
              </span>

              {patient?.phone && (
                <a
                  href={whatsappUrl(
                    patient.phone,
                    `أهلاً بحضرتك ${patient.name.split(' ')[0]}، معك دكتورة د. رنا ياسر الشوري من مركز المستقبل للتغذية.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ppf-whatsapp-btn"
                  title="مراسلة المريض عبر واتساب مباشرة"
                >
                  <WhatsAppIcon size={14} color="#ffffff" />
                  <span>محادثة واتساب</span>
                </a>
              )}

              {patient?.createdAt && (
                <span className="ppf-meta-date">
                  <Calendar size={13} />
                  عضو منذ {dateLabel(patient.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="ppf-hero-quick-stats">
          <div className="quick-stat-box">
            <span className="qs-label">إجمالي الكشوفات</span>
            <strong className="qs-value">{appointments.length}</strong>
            <span className="qs-date-meta">
              {latestAppt
                ? `آخر كشف: ${shortDateLabel(latestAppt.date)} (${relativeDateLabel(latestAppt.date)})`
                : 'لا توجد مواعيد سابقة'}
            </span>
          </div>
          <div className="quick-stat-box">
            <span className="qs-label">الروشتات المعتمدة</span>
            <strong className="qs-value">{prescriptions.length}</strong>
            <span className="qs-date-meta">
              {latestRx
                ? `آخر روشتة: ${shortDateLabel(latestRx.date)} (${relativeDateLabel(latestRx.date)})`
                : 'لم تصدر روشتة بعد'}
            </span>
          </div>
          <div className="quick-stat-box">
            <span className="qs-label">قياسات InBody</span>
            <strong className="qs-value">{inbodyRecords.length}</strong>
            <span className="qs-date-meta">
              {latestInbody?.createdAt
                ? `آخر فحص: ${shortDateLabel(latestInbody.createdAt)} (${relativeDateLabel(latestInbody.createdAt)})`
                : 'لم يسجل قياس بعد'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Clinical Metrics Vitals Overview */}
      <section className="ppf-vitals-strip">
        <div className="vital-card">
          <div className="vital-icon-wrap start-weight">
            <Scale size={20} />
          </div>
          <div className="vital-texts">
            <span className="vital-title">الوزن الابتدائي</span>
            <strong className="vital-number">
              {metrics?.initialWeight ? `${metrics.initialWeight} كجم` : '—'}
            </strong>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon-wrap current-weight">
            <Activity size={20} />
          </div>
          <div className="vital-texts">
            <span className="vital-title">الوزن الحالي</span>
            <strong className="vital-number highlight">
              {metrics?.currentWeight ? `${metrics.currentWeight} كجم` : '—'}
            </strong>
          </div>
        </div>

        <div className="vital-card">
          <div
            className={`vital-icon-wrap change-type ${
              isLoss ? 'is-loss' : isGain ? 'is-gain' : ''
            }`}
          >
            {isLoss ? (
              <TrendingDown size={20} />
            ) : isGain ? (
              <TrendingUp size={20} />
            ) : (
              <Minus size={20} />
            )}
          </div>
          <div className="vital-texts">
            <span className="vital-title">معدل التغير الإجمالي</span>
            <strong
              className={`vital-number ${
                isLoss ? 'loss-text' : isGain ? 'gain-text' : ''
              }`}
            >
              {weightDelta !== null
                ? `${weightDelta > 0 ? '+' : ''}${weightDelta} كجم`
                : '—'}
            </strong>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon-wrap bmi-cat">
            <Heart size={20} />
          </div>
          <div className="vital-texts">
            <span className="vital-title">مؤشر كتلة الجسم (BMI)</span>
            <div className="vital-bmi-box">
              <strong className="vital-number">{bmiValue ?? '—'}</strong>
              <span className={`bmi-status-tag ${bmiBadgeClass}`}>{bmiCategoryLabel}</span>
            </div>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon-wrap calorie-target">
            <Flame size={20} />
          </div>
          <div className="vital-texts">
            <span className="vital-title">الوزن المستهدف</span>
            <strong className="vital-number">
              {metrics?.targetWeight ? `${metrics.targetWeight} كجم` : '—'}
            </strong>
          </div>
        </div>
      </section>

      {/* 4. Structured Tabs Navigation */}
      <div className="ppf-tabs-bar" role="tablist">
        <button
          type="button"
          className={`ppf-tab-item ${activeTab === 'metrics' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <Scale size={16} />
          <span>سجل قياسات InBody والوزن</span>
          <span className="tab-count-badge">{inbodyRecords.length}</span>
        </button>

        <button
          type="button"
          className={`ppf-tab-item ${activeTab === 'prescriptions' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          <Utensils size={16} />
          <span>الروشتات والأنظمة الغذائية</span>
          <span className="tab-count-badge">{prescriptions.length}</span>
        </button>

        <button
          type="button"
          className={`ppf-tab-item ${activeTab === 'appointments' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <Clock size={16} />
          <span>سجل المواعيد والكشوفات</span>
          <span className="tab-count-badge">{appointments.length}</span>
        </button>

        <button
          type="button"
          className={`ppf-tab-item ${activeTab === 'notes' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <MessageSquare size={16} />
          <span>الملاحظات الطبية والسريرية</span>
          <span className="tab-count-badge">{notes.length}</span>
        </button>
      </div>

      {/* 5. Tab Content Sections */}
      <div className="ppf-tab-content-area">
        {/* Tab 1: InBody History */}
        {activeTab === 'metrics' && (
          <div className="ppf-panel-section">
            <div className="ppf-section-header">
              <div>
                <h3>سجل قياسات الوزن ونسب الجسم (InBody)</h3>
                <p>تتبع دقيق لتطور الوزن، نسبة الدهون، الكتلة العضلية ومحيط الخصر عبر الزيارات.</p>
              </div>
              <Button onClick={() => setInbodyModal(true)} icon={false}>
                <Plus size={16} />
                تسجيل قياس InBody جديد
              </Button>
            </div>

            {latestInbody?.createdAt && (
              <div className="ppf-highlight-banner">
                <div className="phb-icon-wrap">
                  <Scale size={20} />
                </div>
                <div className="phb-text-wrap">
                  <div className="phb-title-row">
                    <strong>آخر قياس InBody تم تسجيله للمريض:</strong>
                    <span className="phb-date-badge">
                      {fullDateLabel(latestInbody.createdAt)} · ({relativeDateLabel(latestInbody.createdAt)})
                    </span>
                  </div>
                  <p className="phb-summary-row">
                    الوزن المسجل: <b>{latestInbody.weight} كجم</b>
                    {latestInbody.bodyFatPercent ? <> · نسبة الدهون: <b>{latestInbody.bodyFatPercent}%</b></> : null}
                    {latestInbody.muscleMass ? <> · الكتلة العضلية: <b>{latestInbody.muscleMass} كجم</b></> : null}
                  </p>
                </div>
              </div>
            )}

            {inbodyRecords.length === 0 ? (
              <div className="ppf-empty-card">
                <Scale size={40} />
                <h4>لا توجد قياسات InBody مسجلة لهذا المريض بعد.</h4>
                <p>اضغطي على زر "تسجيل قياس InBody جديد" لإدخال أول قياس سريري.</p>
              </div>
            ) : (
              <div className="ppf-table-wrap">
                <table className="ppf-data-table">
                  <thead>
                    <tr>
                      <th>تاريخ الفحص</th>
                      <th>الوزن (كجم)</th>
                      <th>نسبة الدهون %</th>
                      <th>الكتلة العضلية (كجم)</th>
                      <th>نسبة الماء %</th>
                      <th>محيط الخصر (سم)</th>
                      <th>ملاحظات الكشف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inbodyRecords.map((r: InBodyRecordPublic, idx: number) => (
                      <tr key={r.id || idx}>
                        <td>
                          <div className="table-date-cell">
                            <strong>{r.createdAt ? shortDateLabel(r.createdAt) : '—'}</strong>
                            {r.createdAt && (
                              <span className="table-date-rel">({relativeDateLabel(r.createdAt)})</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="metric-highlight-val">{r.weight} كجم</span>
                        </td>
                        <td>{r.bodyFatPercent ? `${r.bodyFatPercent}%` : '—'}</td>
                        <td>{r.muscleMass ? `${r.muscleMass} كجم` : '—'}</td>
                        <td>{r.waterPercent ? `${r.waterPercent}%` : '—'}</td>
                        <td>{r.waistCm ? `${r.waistCm} سم` : '—'}</td>
                        <td>{r.doctorNotes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Prescriptions History */}
        {activeTab === 'prescriptions' && (
          <div className="ppf-panel-section">
            <div className="ppf-section-header">
              <div>
                <h3>الروشتات والأنظمة الغذائية المعتمدة للمريض</h3>
                <p>جميع برامج الدايت والأنظمة المعتمدة مع الوجبات والمكملات والملاحظات.</p>
              </div>
              <Button
                onClick={() => {
                  setPrescriptionData({
                    patientName: patient?.name,
                    patientPhone: patient?.phone,
                    userId: patient?.id ?? undefined,
                    weight: metrics?.currentWeight ? String(metrics.currentWeight) : undefined,
                    height: metrics?.height ? String(metrics.height) : undefined,
                  });
                  setPrescriptionModal(true);
                }}
                icon={false}
              >
                <Plus size={16} />
                كتابة روشتة جديدة
              </Button>
            </div>

            {latestRx && (
              <div className="ppf-highlight-banner rx-style">
                <div className="phb-icon-wrap" style={{ background: '#fef3e2', color: '#b45309' }}>
                  <Utensils size={20} />
                </div>
                <div className="phb-text-wrap">
                  <div className="phb-title-row">
                    <strong>آخر روشتة وبرنامج دايت صادر للمريض:</strong>
                    <span className="phb-date-badge" style={{ background: '#fef3e2', color: '#92400e' }}>
                      {fullDateLabel(latestRx.date)} · ({relativeDateLabel(latestRx.date)})
                    </span>
                  </div>
                  <p className="phb-summary-row">
                    الهدف: <b>{latestRx.goal || 'تثبيت وخسارة وزن'}</b>
                    {latestRx.weight ? <> · الوزن المسجل: <b>{latestRx.weight} كجم</b></> : null}
                    {latestRx.targetWeight ? <> · الوزن المستهدف: <b>{latestRx.targetWeight} كجم</b></> : null}
                  </p>
                </div>
              </div>
            )}

            {prescriptions.length === 0 ? (
              <div className="ppf-empty-card">
                <Utensils size={40} />
                <h4>لم يتم إصدار روشتات دايت سابقة لهذا المريض.</h4>
                <p>يمكنكِ إنشاء نظام غذائي جديد وطباعته أو حفظه لملف المريض فوراً.</p>
              </div>
            ) : (
              <div className="ppf-prescriptions-grid">
                {prescriptions.map((rx: PrescriptionPublic) => (
                  <article key={rx.id} className="ppf-rx-card">
                    <div className="rx-card-top">
                      <div className="rx-date-badge">
                        <Calendar size={13} />
                        <span>{shortDateLabel(rx.date)}</span>
                        <span className="rx-date-rel-pill">({relativeDateLabel(rx.date)})</span>
                      </div>
                      <span className="rx-calories-pill">{rx.goal || 'تثبيت وخسارة وزن'}</span>
                    </div>

                    <div className="rx-meals-summary">
                      <div className="meal-sum-item">
                        <span className="ms-name">الإفطار:</span>
                        <p>{rx.breakfast || '—'}</p>
                      </div>
                      <div className="meal-sum-item">
                        <span className="ms-name">الغداء:</span>
                        <p>{rx.lunch || '—'}</p>
                      </div>
                      <div className="meal-sum-item">
                        <span className="ms-name">العشاء:</span>
                        <p>{rx.dinner || '—'}</p>
                      </div>
                    </div>

                    {rx.instructions && (
                      <div className="rx-doctor-note-box">
                        <small>توجيهات الدكتورة:</small>
                        <p>{rx.instructions}</p>
                      </div>
                    )}

                    <div className="rx-card-footer">
                      <span className="water-tip">💧 الماء اليومي: {rx.waterIntake || '3'} لتر</span>
                      <Button
                        kind="light"
                        icon={false}
                        onClick={() => {
                          setPrescriptionData({
                            patientName: patient?.name,
                            patientPhone: patient?.phone,
                            userId: patient?.id ?? undefined,
                            weight: rx.weight,
                            targetWeight: rx.targetWeight,
                            height: rx.height,
                            age: rx.age,
                            goal: rx.goal,
                            waterIntake: rx.waterIntake,
                            breakfast: rx.breakfast,
                            lunch: rx.lunch,
                            dinner: rx.dinner,
                            snack1: rx.snack1,
                            snack2: rx.snack2,
                            supplements: rx.supplements,
                            instructions: rx.instructions,
                          });
                          setPrescriptionModal(true);
                        }}
                      >
                        <Pencil size={13} />
                        تعديل / إعادة طباعة
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Appointments History */}
        {activeTab === 'appointments' && (
          <div className="ppf-panel-section">
            <div className="ppf-section-header">
              <div>
                <h3>سجل المواعيد وطلبات الكشف</h3>
                <p>تاريخ زيارات المريض للعيادة والمواعيد القادمة وحالة كل موعد.</p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="ppf-empty-card">
                <Clock size={40} />
                <h4>لا توجد مواعيد مسجلة لهذا المريض.</h4>
              </div>
            ) : (
              <div className="ppf-table-wrap">
                <table className="ppf-data-table">
                  <thead>
                    <tr>
                      <th>رقم الحجز</th>
                      <th>الخدمة الطبية</th>
                      <th>تاريخ الكشف</th>
                      <th>الوقت</th>
                      <th>حالة الحجز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a: PatientHistoryAppointment) => (
                      <tr key={a.reference}>
                        <td>
                          <span className="ref-tag-pill" dir="ltr">
                            #{a.reference}
                          </span>
                        </td>
                        <td>
                          <strong>{a.serviceTitle}</strong>
                        </td>
                        <td>
                          <div className="table-date-cell">
                            <strong>{fullDateLabel(a.date)}</strong>
                            <span className="table-date-rel">({relativeDateLabel(a.date)})</span>
                          </div>
                        </td>
                        <td>
                          <span dir="ltr">{timeLabel(a.time)}</span>
                        </td>
                        <td>
                          <StatusBadge status={a.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Clinical Notes Timeline */}
        {activeTab === 'notes' && (
          <div className="ppf-panel-section">
            <div className="ppf-section-header">
              <div>
                <h3>الملاحظات الطبية والسريرية الموثقة</h3>
                <p>سجل المتابعة اليومية للملاحظات والتعليمات الخاصة بالمريض.</p>
              </div>
            </div>

            {/* Note input box */}
            <form className="ppf-new-note-card" onSubmit={handleAddNote}>
              <label className="note-box-label">
                إضافة ملاحظة جديدة لملف المريض:
                <textarea
                  className="note-textarea"
                  rows={3}
                  placeholder="مثال: المريض يعاني من ثبات في الوزن بسبب قلة شرب الماء، تم تعديل حصة الكارب في الغداء..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  disabled={savingNote}
                />
              </label>

              {noteError && <p className="note-alert error">{noteError}</p>}
              {noteSuccess && <p className="note-alert success">{noteSuccess}</p>}

              <div className="note-submit-row">
                <Button disabled={savingNote || !newNote.trim()} icon={false}>
                  <Send size={15} />
                  {savingNote ? 'جارٍ الحفظ...' : 'حفظ الملاحظة بالملف'}
                </Button>
              </div>
            </form>

            {/* Notes Timeline List */}
            <div className="ppf-notes-timeline">
              {notes.length === 0 ? (
                <div className="ppf-empty-card">
                  <MessageSquare size={36} />
                  <h4>لا توجد ملاحظات سريرية مدونة حتى الآن.</h4>
                  <p>اكتبي ملاحظاتك في المربع أعلاه لتوثيقها فوراً في ملف المريض الطبي.</p>
                </div>
              ) : (
                notes.map((n: PatientClinicalNote) => (
                  <div key={n.id} className="timeline-note-item">
                    <div className="t-note-dot" />
                    <div className="t-note-body">
                      <div className="t-note-header">
                        <span className="t-author">{n.authorName || 'دكتورة المركز'}</span>
                        <span className="t-date">{dateLabel(n.createdAt)}</span>
                      </div>
                      <p className="t-text">{n.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* InBody Editor Modal */}
      <Modal
        open={inbodyModal}
        onClose={() => setInbodyModal(false)}
        title="تسجيل قياس وفحص InBody جديد"
      >
        <InBodyEditor
          onSaved={() => {
            setInbodyModal(false);
            void historyQuery.refetch();
          }}
          defaultPatient={{
            userId: patient?.id ?? undefined,
            name: patient?.name || '',
            phone: patient?.phone || '',
          }}
        />
      </Modal>

      {/* Diet Prescription Modal */}
      {prescriptionModal && (
        <DietPrescriptionModal
          open={prescriptionModal}
          onClose={() => {
            setPrescriptionModal(false);
            setPrescriptionData(undefined);
          }}
          onSaved={() => {
            setPrescriptionModal(false);
            void historyQuery.refetch();
          }}
          defaultData={prescriptionData}
        />
      )}
    </div>
  );
}
