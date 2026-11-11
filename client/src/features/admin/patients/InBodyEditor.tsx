import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Check,
  CheckCircle2,
  Droplets,
  Flame,
  Loader2,
  Percent,
  Phone,
  Ruler,
  Scale,
  Send,
  Stethoscope,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { DatePicker } from '../../../components/forms/DatePicker';
import { PatientSearchSelect } from '../../../components/forms/PatientSearchSelect';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { today, whatsappUrl } from '../../../lib/api';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { readFormNumber, readFormText } from '../lib/form-data';

interface InBodySuccessData {
  patientName: string;
  patientPhone: string;
  date: string;
  weight: number;
  bodyFatPercent?: number;
  muscleMass?: number;
  waterPercent?: number;
  visceralFat?: number;
  waistCm?: number;
}

export function InBodyEditor({
  defaultPatient,
  onSaved,
}: {
  defaultPatient?: { userId?: string; name?: string; phone?: string } | null;
  onSaved: () => void;
}) {
  const patients = useQuery({
    queryKey: ['admin', 'patients'],
    queryFn: () => adminApi.patients(),
  });

  const [patientName, setPatientName] = useState(defaultPatient?.name || '');
  const [patientPhone, setPatientPhone] = useState(defaultPatient?.phone || '');
  const [userId, setUserId] = useState(defaultPatient?.userId || '');
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccessData, setSaveSuccessData] = useState<InBodySuccessData | null>(null);

  const selectedPatientObj = patients.data?.patients.find((p) => p.id === userId);

  const onSelectPatient = (id: string) => {
    setUserId(id);
    if (!id) return;
    const found = patients.data?.patients.find((p) => p.id === id);
    if (found) {
      setPatientName(found.name);
      setPatientPhone(found.phone);
    }
  };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');

    const weightNum = readFormNumber(f, 'weight');
    const fatNum = readFormText(f, 'bodyFatPercent') ? readFormNumber(f, 'bodyFatPercent') : undefined;
    const muscleNum = readFormText(f, 'muscleMass') ? readFormNumber(f, 'muscleMass') : undefined;
    const waterNum = readFormText(f, 'waterPercent') ? readFormNumber(f, 'waterPercent') : undefined;
    const visceralNum = readFormText(f, 'visceralFat') ? readFormNumber(f, 'visceralFat') : undefined;
    const waistNum = readFormText(f, 'waistCm') ? readFormNumber(f, 'waistCm') : undefined;
    const patientNameStr = readFormText(f, 'patientName') || patientName;
    const patientPhoneStr = readFormText(f, 'patientPhone') || patientPhone;
    const dateStr = readFormText(f, 'date') || date || today();

    try {
      await adminApi.saveInbody({
        userId: userId || null,
        patientName: patientNameStr,
        patientPhone: patientPhoneStr,
        date: dateStr,
        weight: weightNum,
        bodyFatPercent: fatNum,
        muscleMass: muscleNum,
        waterPercent: waterNum,
        visceralFat: visceralNum,
        waistCm: waistNum,
        doctorNotes: readFormText(f, 'doctorNotes') || undefined,
      });

      // Show immediate confirmation & one-click dispatch screen
      setSaveSuccessData({
        patientName: patientNameStr,
        patientPhone: patientPhoneStr,
        date: dateStr,
        weight: weightNum,
        bodyFatPercent: fatNum,
        muscleMass: muscleNum,
        waterPercent: waterNum,
        visceralFat: visceralNum,
        waistCm: waistNum,
      });
    } catch (e) {
      setError((e as Error).message || 'تعذر حفظ فحص الـ InBody.');
    } finally {
      setBusy(false);
    }
  }

  // 1. Post-Save Success & Patient WhatsApp Dispatch Dialog
  if (saveSuccessData) {
    const shareMessage = `أهلاً بكِ ${saveSuccessData.patientName.split(' ')[0]} 🌸
معكِ د. رنا الشوري - مركز المستقبل للتغذية العلاجية.

📊 مرفق لكِ نتائج فحص الـ InBody لتاريخ (${saveSuccessData.date}):
⚖️ الوزن الحالي: ${saveSuccessData.weight} كجم${saveSuccessData.bodyFatPercent ? `\n💧 نسبة الدهون: ${saveSuccessData.bodyFatPercent}%` : ''}${saveSuccessData.muscleMass ? `\n💪 الكتلة العضلية: ${saveSuccessData.muscleMass} كجم` : ''}${saveSuccessData.waterPercent ? `\n🌊 نسبة الماء: ${saveSuccessData.waterPercent}%` : ''}${saveSuccessData.visceralFat ? `\n🔥 الدهون الحشوية: مستوى ${saveSuccessData.visceralFat}` : ''}${saveSuccessData.waistCm ? `\n📏 محيط الخصر: ${saveSuccessData.waistCm} سم` : ''}

تم تحديث ملفكِ الصحي وتستطيعين متابعة الرسم البياني لتطور وزنك من خلال حسابكِ بالمركز عبر:
${window.location.origin}/account?tab=inbody

دمتِ بصحة ورشاقة دائمًا 🌿`;

    return (
      <div className="inbody-success-dialog">
        <div className="inbody-success-icon-wrap">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 className="inbody-success-title">تم حفظ الفحص وإرسال التقرير للمريض بنجاح! 🚀</h3>
          <p className="inbody-success-desc">
            تم تسجيل الفحص وربطه بملف المريضة <strong>{saveSuccessData.patientName}</strong>، وأُرسل إشعار تلقائي وفوري لحسابها وتطبيقها لمتابعة تطور الوزن.
          </p>
        </div>

        {/* Metrics KPI Cards */}
        <div className="inbody-metrics-summary-card">
          <div className="inbody-metric-item">
            <span className="inbody-metric-label">الوزن الحالي</span>
            <span className="inbody-metric-value">{saveSuccessData.weight} كجم</span>
          </div>
          <div className="inbody-metric-item">
            <span className="inbody-metric-label">نسبة الدهون</span>
            <span className="inbody-metric-value">
              {saveSuccessData.bodyFatPercent !== undefined ? `${saveSuccessData.bodyFatPercent}%` : '—'}
            </span>
          </div>
          <div className="inbody-metric-item">
            <span className="inbody-metric-label">الكتلة العضلية</span>
            <span className="inbody-metric-value">
              {saveSuccessData.muscleMass !== undefined ? `${saveSuccessData.muscleMass} كجم` : '—'}
            </span>
          </div>
        </div>

        {/* WhatsApp One-Click Action */}
        {saveSuccessData.patientPhone && (
          <a
            href={whatsappUrl(saveSuccessData.patientPhone, shareMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-inbody-whatsapp-share"
            title="إرسال التقرير للمريض عبر واتساب مباشرة"
          >
            <WhatsAppIcon size={18} />
            <span>مشاركة التقرير عبر واتساب الآن 📱</span>
          </a>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
          <button
            type="button"
            className="btn-inbody-done-close"
            onClick={onSaved}
          >
            تم / إغلاق النافذة
          </button>
        </div>
      </div>
    );
  }

  // 2. Main Deluxe InBody Editor Form
  return (
    <form className="inbody-editor-form" onSubmit={(e) => void save(e)}>
      {/* Educational & Auto-Sync Banner */}
      <div className="inbody-info-banner">
        <div className="inbody-info-icon-box">
          <Scale size={20} />
        </div>
        <div className="inbody-info-text">
          <strong>تسجيل قياسات المريض السريرية وإرسال التقرير</strong>
          <p>
            تُربط النتائج بملف المريض وتظهر في حسابه فوراً كرسوم بيانية توضح تغيرات الدهون والعضلات، مع إرسال إشعار فوري بحسابه على المنصة.
          </p>
        </div>
      </div>

      {/* Patient Selection Card */}
      <div className="inbody-section-card">
        <div className="inbody-section-header">
          <span className="inbody-section-title">
            <User size={16} />
            <span>بيانات المريض وصاحب الفحص</span>
          </span>
          <span className="inbody-section-hint">ربط بحساب مسجل أو إدخال يدوي</span>
        </div>

        <div style={{ marginBottom: 4 }}>
          <PatientSearchSelect
            patients={patients.data?.patients || []}
            selectedId={userId}
            onSelect={onSelectPatient}
            placeholder="ابحثي بالاسم أو رقم الهاتف لجلب بيانات المريض تلقائياً..."
          />
        </div>

        {selectedPatientObj && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#063e32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                {selectedPatientObj.name.slice(0, 1)}
              </div>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{selectedPatientObj.name}</strong>
              {selectedPatientObj.fileNumber && (
                <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '5px', fontWeight: 700 }}>
                  ملف #{selectedPatientObj.fileNumber}
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} strokeWidth={3} />
              <span>مرتبط بالحساب</span>
            </span>
          </div>
        )}

        <div className="inbody-inputs-grid">
          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label htmlFor="inbody-patient-name" className="inbody-field-label">اسم المريض بالكامل</label>
              <span className="inbody-field-tag is-required">مطلوب</span>
            </div>
            <div className="inbody-input-box">
              <input
                id="inbody-patient-name"
                name="patientName"
                className="inbody-pro-input"
                style={{ direction: 'rtl', textAlign: 'right', paddingRight: '14px', paddingLeft: '14px' }}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="اسم المريض بالكامل"
                required
              />
            </div>
          </div>

          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label htmlFor="inbody-patient-phone" className="inbody-field-label">رقم الهاتف للتواصل والمتابعة</label>
              <span className="inbody-field-tag is-required">مطلوب</span>
            </div>
            <div className="inbody-input-box">
              <span className="inbody-input-leading-icon" style={{ right: 'auto', left: '12px' }}>
                <Phone size={15} />
              </span>
              <input
                id="inbody-patient-phone"
                name="patientPhone"
                type="tel"
                dir="ltr"
                className="inbody-pro-input"
                style={{ textAlign: 'left', paddingLeft: '36px', paddingRight: '14px' }}
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body Composition Metrics Card */}
      <div className="inbody-section-card">
        <div className="inbody-section-header">
          <span className="inbody-section-title">
            <Activity size={16} />
            <span>قياسات وتركيب الجسم (InBody)</span>
          </span>
          <span className="inbody-section-hint">القيم تُسجل بالأرقام اللاتينية (0-9)</span>
        </div>

        <div className="inbody-inputs-grid">
          {/* Weight */}
          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label htmlFor="inbody-weight" className="inbody-field-label">الوزن الحالي</label>
              <span className="inbody-field-tag is-required">إلزامي *</span>
            </div>
            <div className="inbody-input-box">
              <span className="inbody-input-leading-icon">
                <Scale size={16} />
              </span>
              <input
                id="inbody-weight"
                name="weight"
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="74.5"
                className="inbody-pro-input"
                onFocus={(e) => e.target.select()}
                required
              />
              <span className="inbody-unit-badge">كجم</span>
            </div>
          </div>

          {/* Test Date */}
          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label className="inbody-field-label">تاريخ الفحص</label>
              <span className="inbody-field-tag">تلقائي</span>
            </div>
            <DatePicker name="date" value={date} onChange={setDate} required />
          </div>

          {/* Body Fat % */}
          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label htmlFor="inbody-fat" className="inbody-field-label">نسبة الدهون بالجسم</label>
              <span className="inbody-field-tag">اختياري</span>
            </div>
            <div className="inbody-input-box">
              <span className="inbody-input-leading-icon">
                <Percent size={16} />
              </span>
              <input
                id="inbody-fat"
                name="bodyFatPercent"
                type="number"
                step="0.1"
                min="1"
                max="70"
                placeholder="26.4"
                className="inbody-pro-input"
                onFocus={(e) => e.target.select()}
              />
              <span className="inbody-unit-badge">%</span>
            </div>
          </div>

          {/* Muscle Mass */}
          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label htmlFor="inbody-muscle" className="inbody-field-label">الكتلة العضلية</label>
              <span className="inbody-field-tag">اختياري</span>
            </div>
            <div className="inbody-input-box">
              <span className="inbody-input-leading-icon">
                <Activity size={16} />
              </span>
              <input
                id="inbody-muscle"
                name="muscleMass"
                type="number"
                step="0.1"
                min="5"
                max="150"
                placeholder="32.8"
                className="inbody-pro-input"
                onFocus={(e) => e.target.select()}
              />
              <span className="inbody-unit-badge">كجم</span>
            </div>
          </div>

          {/* Body Water % */}
          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label htmlFor="inbody-water" className="inbody-field-label">نسبة الماء بالجسم</label>
              <span className="inbody-field-tag">اختياري</span>
            </div>
            <div className="inbody-input-box">
              <span className="inbody-input-leading-icon">
                <Droplets size={16} />
              </span>
              <input
                id="inbody-water"
                name="waterPercent"
                type="number"
                step="0.1"
                min="10"
                max="85"
                placeholder="53.2"
                className="inbody-pro-input"
                onFocus={(e) => e.target.select()}
              />
              <span className="inbody-unit-badge">%</span>
            </div>
          </div>

          {/* Visceral Fat */}
          <div className="inbody-field-wrap">
            <div className="inbody-label-row">
              <label htmlFor="inbody-visceral" className="inbody-field-label">الدهون الحشوية</label>
              <span className="inbody-field-tag">مستوى 1 - 20</span>
            </div>
            <div className="inbody-input-box">
              <span className="inbody-input-leading-icon">
                <Flame size={16} />
              </span>
              <input
                id="inbody-visceral"
                name="visceralFat"
                type="number"
                min="1"
                max="20"
                placeholder="6"
                className="inbody-pro-input"
                onFocus={(e) => e.target.select()}
              />
              <span className="inbody-unit-badge">مستوى</span>
            </div>
          </div>

          {/* Waist Circumference */}
          <div className="inbody-field-wrap" style={{ gridColumn: '1 / -1' }}>
            <div className="inbody-label-row">
              <label htmlFor="inbody-waist" className="inbody-field-label">محيط الخصر (اختياري)</label>
              <span className="inbody-field-tag">سم</span>
            </div>
            <div className="inbody-input-box">
              <span className="inbody-input-leading-icon">
                <Ruler size={16} />
              </span>
              <input
                id="inbody-waist"
                name="waistCm"
                type="number"
                step="0.5"
                min="30"
                max="250"
                placeholder="82.0"
                className="inbody-pro-input"
                onFocus={(e) => e.target.select()}
              />
              <span className="inbody-unit-badge">سم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Guidance Textarea */}
      <div className="inbody-section-card">
        <div className="inbody-section-header">
          <span className="inbody-section-title">
            <Stethoscope size={16} />
            <span>توجيهات الدكتورة والملاحظات الغذائية</span>
          </span>
          <span className="inbody-section-hint">تظهر للمريض في تقريره</span>
        </div>
        <textarea
          name="doctorNotes"
          className="inbody-pro-textarea"
          rows={3}
          placeholder="مثال: التزام ممتاز بالخطة الغذائية، الاستمرار على شرب 3 لتر ماء يومياً وزيادة النشاط الحركي 30 دقيقة."
        />
      </div>

      {/* Automatic Dispatch Guarantee Banner */}
      <div className="inbody-notify-card">
        <div className="inbody-notify-left">
          <div className="inbody-notify-icon-circle">
            <Activity size={16} />
          </div>
          <div className="inbody-notify-text">
            <strong>إرسال فوري ومباشر لتقرير المريض</strong>
            <span>سيصل إشعار فوري بحساب المريض وتطبيقه بمجرد الحفظ لمتابعة الرسم البياني.</span>
          </div>
        </div>
        <span className="inbody-notify-badge">تلقائي ✅</span>
      </div>

      {error && <Notice message={error} error />}

      {/* Action Buttons */}
      <div className="inbody-actions-bar">
        <button
          type="button"
          className="btn-inbody-done-close"
          onClick={onSaved}
          disabled={busy}
        >
          إلغاء
        </button>

        <button
          type="submit"
          className="btn-inbody-submit"
          disabled={busy}
        >
          {busy ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>جارِ الحفظ وإرسال التقرير...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>حفظ الفحص وإرسال التقرير للمريض الآن 🚀</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
