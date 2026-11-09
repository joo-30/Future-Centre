import {
  Activity,
  Droplets,
  Flame,
  FolderHeart,
  Printer,
  Scale,
  Sparkles,
  User,
} from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/ui';
import { PatientSearchSelect } from '../../../components/forms/PatientSearchSelect';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import {
  AdminQrScannerModal,
  type QrScanResult,
} from '../components/AdminQrScannerModal';
import {
  DietPrescriptionModal,
  type PrescriptionData,
} from '../prescription/DietPrescriptionModal';

type Gender = 'female' | 'male';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

interface BmiCategory {
  key: string;
  label: string;
  colorClass: string;
  badgeBg: string;
  badgeColor: string;
  summary: string;
  advice: string;
}

const CATEGORIES: Record<string, BmiCategory> = {
  underweight: {
    key: 'underweight',
    label: 'أقل من المعدل الطبيعي (نحافة)',
    colorClass: 'cat-underweight',
    badgeBg: '#e8f0f8',
    badgeColor: '#2b5a84',
    summary: 'مؤشر كتلة الجسم أقل من 18.5',
    advice:
      'يحتاج المريض إلى خطة تغذية متوازنة لزيادة الكتلة العضلية وتحسين مخزون الطاقة دون الاعتماد على الدهون الضارة.',
  },
  healthy: {
    key: 'healthy',
    label: 'وزن صحي وطبيعي',
    colorClass: 'cat-healthy',
    badgeBg: '#eef6ea',
    badgeColor: '#2d6a2f',
    summary: 'مؤشر كتلة الجسم بين 18.5 و 24.9',
    advice:
      'المريض في النطاق الصحي المثالي. يُنصح بالتركيز على تثبيت الوزن، نحت القوام، وتوزيع المغذيات وجودة الأكل.',
  },
  overweight: {
    key: 'overweight',
    label: 'زيادة في الوزن (Overweight)',
    colorClass: 'cat-overweight',
    badgeBg: '#fdf3e7',
    badgeColor: '#965a18',
    summary: 'مؤشر كتلة الجسم بين 25.0 و 29.9',
    advice:
      'عجز تدريجي في السعرات (350 - 500 سعرة) مع تنظيم مواعيد الوجبات والمشي كفيل بإعادة المريض للوزن المثالي دون إجهاد.',
  },
  obese: {
    key: 'obese',
    label: 'سمنة سريرية تتطلب خطة علاجية',
    colorClass: 'cat-obese',
    badgeBg: '#faecea',
    badgeColor: '#9e2d26',
    summary: 'مؤشر كتلة الجسم 30 فأكثر',
    advice:
      'خطة تغذية علاجية مخصصة، فحص مقاومة الأنسولين والغدة، وتنسيق جلسات نحت وتفتيت الدهون الموضعية.',
  },
};

const ACTIVITY_MULTIPLIERS: Record<
  ActivityLevel,
  { multiplier: number; label: string; desc: string }
> = {
  sedentary: { multiplier: 1.2, label: 'قليل النشاط', desc: 'عمل مكتبي / حركة محدودة' },
  light: { multiplier: 1.375, label: 'نشاط خفيف', desc: 'مشي أو تمارين 1-3 أيام أسبوعياً' },
  moderate: { multiplier: 1.55, label: 'نشاط معتدل', desc: 'تمارين منتظمة 3-5 أيام أسبوعياً' },
  active: { multiplier: 1.725, label: 'نشاط عالي', desc: 'تمارين مكثفة أو عمل حركي شاق' },
};

export function AdminBmi() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get('patientId') || '');
  const [gender, setGender] = useState<Gender>('female');
  const [height, setHeight] = useState<number | ''>(165);
  const [weight, setWeight] = useState<number | ''>(72);
  const [age, setAge] = useState<number | ''>(30);
  const [activity, setActivity] = useState<ActivityLevel>('light');

  // Modals
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<
    Partial<PrescriptionData> | undefined
  >(undefined);
  const [scannerOpen, setScannerOpen] = useState(false);

  const heightId = useId();
  const weightId = useId();
  const ageId = useId();

  // Load patients and inbody for quick auto-fill
  const patientsQuery = useQuery({
    queryKey: ['admin', 'patients'],
    queryFn: () => adminApi.patients(),
    staleTime: 60000,
  });

  const inbodyQuery = useQuery({
    queryKey: ['admin', 'inbody'],
    queryFn: () => adminApi.inbodyList(),
    staleTime: 60000,
  });

  const prescriptionsQuery = useQuery({
    queryKey: ['admin', 'prescriptions'],
    queryFn: () => adminApi.prescriptionsList(),
    staleTime: 60000,
  });

  const selectedPatient = patientsQuery.data?.patients.find((p) => p.id === selectedPatientId);

  // Auto-fill when a patient is selected
  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    if (!id) return;
    const p = patientsQuery.data?.patients.find((x) => x.id === id);
    if (!p) return;

    // Find latest InBody or prescription for this patient
    const latestInbody = inbodyQuery.data?.records.find(
      (r) => r.userId === p.id || r.patientPhone === p.phone
    );
    const latestRx = prescriptionsQuery.data?.prescriptions.find(
      (r) => r.userId === p.id || r.patientPhone === p.phone
    );

    if (latestInbody && typeof latestInbody.weight === 'number' && latestInbody.weight > 0) {
      setWeight(latestInbody.weight);
    } else if (latestRx?.weight && parseFloat(latestRx.weight) > 0) {
      setWeight(parseFloat(latestRx.weight));
    }

    if (latestRx?.height && parseFloat(latestRx.height) > 0) {
      setHeight(parseFloat(latestRx.height));
    }

    if (latestRx?.age && parseInt(latestRx.age, 10) > 0) {
      setAge(parseInt(latestRx.age, 10));
    }
  };

  const handleQrScan = async (result: QrScanResult) => {
    setScannerOpen(false);
    // 1. Direct match by patientId
    if (result.patientId) {
      handleSelectPatient(result.patientId);
      return;
    }
    // 2. Direct match by phone
    if (result.phone) {
      const cleanPhone = result.phone.replace(/\D/g, '');
      const p = patientsQuery.data?.patients.find(
        (x) => x.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-8))
      );
      if (p) {
        handleSelectPatient(p.id);
        return;
      }
    }
    // 3. Match by reference
    if (result.reference) {
      try {
        const appts = await adminApi.appointments('search=' + encodeURIComponent(result.reference));
        const found = appts.appointments.find((a) => a.reference === result.reference) || appts.appointments[0];
        if (found) {
          if (found.userId) {
            handleSelectPatient(found.userId);
          } else {
            const cleanApptPhone = (found.phone || '').replace(/\D/g, '');
            const p = patientsQuery.data?.patients.find(
              (x) => x.phone.replace(/\D/g, '').endsWith(cleanApptPhone.slice(-8))
            );
            if (p) handleSelectPatient(p.id);
          }
        }
      } catch (err) {
        console.warn('Could not find appointment for QR ref:', err);
      }
    }
  };

  const handleNumberInput = (setter: (val: number | '') => void, maxVal?: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.trim();
    if (!raw) {
      setter('');
      return;
    }
    const sanitized = raw.replace(/^0+/, '');
    if (!sanitized) {
      setter('');
      return;
    }
    const num = Number(sanitized);
    if (!isNaN(num)) {
      if (maxVal && num > maxVal) setter(maxVal);
      else setter(num);
    }
  };

  const calculations = useMemo(() => {
    const effectiveHeight = typeof height === 'number' && height > 0 ? height : 165;
    const effectiveWeight = typeof weight === 'number' && weight > 0 ? weight : 70;
    const effectiveAge = typeof age === 'number' && age > 0 ? age : 30;

    const heightInMeters = effectiveHeight / 100;
    const bmiValue = heightInMeters > 0 ? effectiveWeight / (heightInMeters * heightInMeters) : 0;
    const roundedBmi = Math.round(bmiValue * 10) / 10;

    let categoryKey = 'healthy';
    if (roundedBmi < 18.5) categoryKey = 'underweight';
    else if (roundedBmi <= 24.9) categoryKey = 'healthy';
    else if (roundedBmi <= 29.9) categoryKey = 'overweight';
    else categoryKey = 'obese';
    const category = CATEGORIES[categoryKey];

    const gaugePercent = Math.min(Math.max(((roundedBmi - 15) / (38 - 15)) * 100, 2), 98);

    const minIdeal = Math.round(18.5 * heightInMeters * heightInMeters);
    const maxIdeal = Math.round(24.9 * heightInMeters * heightInMeters);

    // BMR (Mifflin-St Jeor formula)
    const bmr = Math.round(
      gender === 'female'
        ? 10 * effectiveWeight + 6.25 * effectiveHeight - 5 * effectiveAge - 161
        : 10 * effectiveWeight + 6.25 * effectiveHeight - 5 * effectiveAge + 5
    );

    // TDEE
    const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity].multiplier);

    // Suggested daily calorie deficit for weight loss
    const weightLossCalories = Math.max(1200, Math.round(tdee - 450));

    // Daily Water Intake (35 ml / kg)
    const waterLiters = Math.round(effectiveWeight * 0.035 * 10) / 10;

    return {
      bmi: roundedBmi,
      category,
      gaugePercent,
      minIdeal,
      maxIdeal,
      idealWeightRange: `${minIdeal} – ${maxIdeal}`,
      bmr,
      tdee,
      weightLossCalories,
      waterLiters,
    };
  }, [gender, height, weight, age, activity]);

  const handleCreatePrescriptionWithCalculations = () => {
    setPrescriptionData({
      userId: selectedPatient?.id,
      patientName: selectedPatient?.name || '',
      patientPhone: selectedPatient?.phone || '',
      weight: weight ? String(weight) : '',
      targetWeight: String(calculations.minIdeal),
      height: height ? String(height) : '',
      age: age ? String(age) : '',
      waterIntake: `${calculations.waterLiters} لتر ماء يومياً موزع على مدار اليوم`,
      goal:
        calculations.bmi >= 25
          ? `إنقاص وزن صحي مع استهداف وزن ${calculations.minIdeal} كجم بمعدل سعرات ${calculations.weightLossCalories} سعرة`
          : 'تنسيق قوام وتثبيت الوزن مع تعزيز الحرق ونشاط الجسم',
    });
    setPrescriptionModal(true);
  };

  return (
    <>
      <ConsoleTitle
        title="حاسبة الـ BMI والمؤشرات الحيوية"
        kicker="الأدوات السريرية"
        description="حساب فوري لمؤشر كتلة الجسم، معدل الحرق الأساسي BMR، السعرات المقترحة، واحتياج الماء."
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedPatient && (
            <Button
              kind="outline"
              icon={false}
              onClick={() => navigate(`/admin/patients/${selectedPatient.id}`)}
              style={{ gap: '6px' }}
              title="فتح الملف الطبي الشامل للمريض في صفحة مستقلة"
            >
              <FolderHeart size={16} />
              <span>ملف {selectedPatient.name.split(' ')[0]} الكامل ↗</span>
            </Button>
          )}
          <Button
            kind="primary"
            icon={false}
            onClick={handleCreatePrescriptionWithCalculations}
            style={{ gap: '6px' }}
          >
            <Printer size={16} />
            <span>إنشاء روشتة بهذه المعطيات</span>
          </Button>
        </div>
      </ConsoleTitle>

      {/* Patient Picker Bar - Modern UI/UX Pro Max */}
      <div className="bmi-patient-picker-pro">
        <div className="bpp-header-row">
          <div className="bpp-title-box">
            <User size={18} className="bpp-icon" />
            <div>
              <strong className="bpp-title">تحديد المريض (اختياري)</strong>
              <p className="bpp-desc">اختاري المريض من القائمة أو امسحي كود الـ QR الخاص به بالكاميرا لجلب بياناته تلقائياً</p>
            </div>
          </div>
          {selectedPatient && (
            <span className="bpp-linked-chip">
              <Sparkles size={13} />
              تم ربط بيانات {selectedPatient.name.split(' ')[0]}
            </span>
          )}
        </div>

        <div className="bpp-control-field">
          <PatientSearchSelect
            patients={patientsQuery.data?.patients || []}
            selectedId={selectedPatientId}
            onSelect={handleSelectPatient}
            onScanClick={() => setScannerOpen(true)}
            placeholder="ابحثي بالاسم أو رقم الهاتف أو اختاري من القائمة..."
          />
        </div>
      </div>

      {/* Main Calculation Layout */}
      <div className="calc-layout" style={{ margin: 0, padding: 0 }}>
        {/* Controls Card */}
        <div className="calc-card calc-form-card">
          <div className="calc-card-header">
            <h3>المدخلات السريرية للمريض</h3>
            <span className="calc-step-tag">حساب دقيق</span>
          </div>

          {/* Gender */}
          <div className="calc-field-group">
            <span className="calc-field-label">النوع</span>
            <div className="calc-toggle-pill" role="radiogroup">
              <button
                type="button"
                className={`toggle-option ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
              >
                أنثى
              </button>
              <button
                type="button"
                className={`toggle-option ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
              >
                ذكر
              </button>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="calc-grid-2">
            <div className="calc-field-group">
              <label htmlFor={heightId} className="calc-field-label">
                <span>الطول (سم)</span>
              </label>
              <div className="calc-stepper-wrap">
                <button
                  type="button"
                  className="calc-stepper-btn"
                  onClick={() => setHeight((h) => Math.max(120, (Number(h) || 165) - 1))}
                  title="إنقاص سم"
                >
                  -
                </button>
                <input
                  id={heightId}
                  type="number"
                  min={120}
                  max={230}
                  value={height === 0 || height === '' ? '' : height}
                  placeholder="165"
                  onFocus={(e) => e.target.select()}
                  onChange={handleNumberInput(setHeight, 230)}
                  className="calc-stepper-input"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="calc-stepper-btn"
                  onClick={() => setHeight((h) => Math.min(230, (Number(h) || 165) + 1))}
                  title="زيادة سم"
                >
                  +
                </button>
              </div>
            </div>

            <div className="calc-field-group">
              <label htmlFor={weightId} className="calc-field-label">
                <span>الوزن الحالي (كجم)</span>
              </label>
              <div className="calc-stepper-wrap">
                <button
                  type="button"
                  className="calc-stepper-btn"
                  onClick={() => setWeight((w) => Math.max(30, (Number(w) || 70) - 1))}
                  title="إنقاص كجم"
                >
                  -
                </button>
                <input
                  id={weightId}
                  type="number"
                  min={35}
                  max={250}
                  value={weight === 0 || weight === '' ? '' : weight}
                  placeholder="70"
                  onFocus={(e) => e.target.select()}
                  onChange={handleNumberInput(setWeight, 250)}
                  className="calc-stepper-input"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="calc-stepper-btn"
                  onClick={() => setWeight((w) => Math.min(250, (Number(w) || 70) + 1))}
                  title="زيادة كجم"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Age */}
          <div className="calc-field-group">
            <label htmlFor={ageId} className="calc-field-label">
              <span>العمر (سنة)</span>
            </label>
            <div className="calc-stepper-wrap" style={{ maxWidth: '220px' }}>
              <button
                type="button"
                className="calc-stepper-btn"
                onClick={() => setAge((a) => Math.max(12, (Number(a) || 30) - 1))}
                title="إنقاص سنة"
              >
                -
              </button>
              <input
                id={ageId}
                type="number"
                min={12}
                max={95}
                value={age === 0 || age === '' ? '' : age}
                placeholder="30"
                onFocus={(e) => e.target.select()}
                onChange={handleNumberInput(setAge, 95)}
                className="calc-stepper-input"
                dir="ltr"
              />
              <button
                type="button"
                className="calc-stepper-btn"
                onClick={() => setAge((a) => Math.min(95, (Number(a) || 30) + 1))}
                title="زيادة سنة"
              >
                +
              </button>
            </div>
          </div>

          {/* Activity Level - Streamlined Segmented Pills */}
          <div className="calc-field-group">
            <span className="calc-field-label">مستوى النشاط الحركي اليومي</span>
            <div className="activity-segmented-pill-grid">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => {
                const item = ACTIVITY_MULTIPLIERS[key];
                const isSelected = activity === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`activity-seg-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setActivity(key)}
                  >
                    <span className="asb-label">{item.label}</span>
                    <span className="asb-factor">{item.multiplier}x</span>
                  </button>
                );
              })}
            </div>
            <p className="activity-selected-hint">
              {ACTIVITY_MULTIPLIERS[activity].desc}
            </p>
          </div>
        </div>

        {/* Results Card */}
        <div className="calc-card calc-result-card">
          <div className="calc-card-header">
            <h3>المؤشرات والحسابات السريرية</h3>
            <span
              className="calc-badge"
              style={{
                backgroundColor: calculations.category.badgeBg,
                color: calculations.category.badgeColor,
              }}
            >
              {calculations.category.label}
            </span>
          </div>

          {/* Big BMI Number */}
          <div className="bmi-hero-metric">
            <div className="bmi-number-row">
              <span className="bmi-value">{calculations.bmi.toFixed(1)}</span>
              <div className="bmi-meta">
                <span className="bmi-unit">BMI</span>
                <small className="bmi-subtext">{calculations.category.summary}</small>
              </div>
            </div>

            {/* Gauge */}
            <div className="bmi-gauge">
              <div className="gauge-track">
                <span className="gauge-segment s-under" title="نحافة (< 18.5)" />
                <span className="gauge-segment s-healthy" title="مثالي (18.5 - 24.9)" />
                <span className="gauge-segment s-over" title="زيادة (25.0 - 29.9)" />
                <span className="gauge-segment s-obese" title="سمنة (30+)" />
              </div>
              <div
                className="gauge-pointer"
                style={{ right: `${calculations.gaugePercent}%` }}
                aria-hidden="true"
              >
                <div className="pointer-dot" />
                <div className="pointer-line" />
              </div>
            </div>
            <div className="gauge-labels">
              <span>نحافة</span>
              <span>وزن مثالي</span>
              <span>زيادة وزن</span>
              <span>سمنة</span>
            </div>
          </div>

          {/* 4 Clinical Metric Insight Tiles */}
          <div className="calc-tiles-grid">
            <div className="calc-tile">
              <div className="tile-icon" style={{ backgroundColor: '#eef3e0', color: '#577539' }}>
                <Scale size={20} />
              </div>
              <div className="tile-info">
                <span className="tile-label">الوزن المثالي للمريض</span>
                <strong className="tile-value">
                  <span dir="ltr" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {calculations.idealWeightRange}
                  </span>{' '}
                  <small>كجم</small>
                </strong>
                <span className="tile-hint">النطاق الطبيعي الموصى به</span>
              </div>
            </div>

            <div className="calc-tile">
              <div className="tile-icon" style={{ backgroundColor: '#fef3e2', color: '#b45309' }}>
                <Activity size={20} />
              </div>
              <div className="tile-info">
                <span className="tile-label">معدل الحرق الأساسي (BMR)</span>
                <strong className="tile-value">
                  <span dir="ltr" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {calculations.bmr}
                  </span>{' '}
                  <small>سعرة / يوم</small>
                </strong>
                <span className="tile-hint">أثناء الراحة التامة (Basal)</span>
              </div>
            </div>

            <div className="calc-tile">
              <div className="tile-icon" style={{ backgroundColor: '#fdf2e8', color: '#b26117' }}>
                <Flame size={20} />
              </div>
              <div className="tile-info">
                <span className="tile-label">السعرات المقترحة للنزول</span>
                <strong className="tile-value">
                  <span dir="ltr" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {calculations.weightLossCalories}
                  </span>{' '}
                  <small>سعرة / يوم</small>
                </strong>
                <span className="tile-hint">حرق النشاط اليومي TDEE: {calculations.tdee}</span>
              </div>
            </div>

            <div className="calc-tile">
              <div className="tile-icon" style={{ backgroundColor: '#edf5f8', color: '#38738a' }}>
                <Droplets size={20} />
              </div>
              <div className="tile-info">
                <span className="tile-label">الاحتياج اليومي من الماء</span>
                <strong className="tile-value">
                  <span dir="ltr" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {calculations.waterLiters}
                  </span>{' '}
                  <small>لتر / يوم</small>
                </strong>
                <span className="tile-hint">يعادل {Math.round(calculations.waterLiters / 0.25)} أكواب يومياً</span>
              </div>
            </div>
          </div>

          {/* Clinical Advice Box */}
          <div className="calc-advice-box">
            <p>
              <strong>التوجيه السريري: </strong>
              {calculations.category.advice}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="calc-cta-row" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn lime full"
              onClick={handleCreatePrescriptionWithCalculations}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px 18px',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              <Printer size={18} />
              <span>إنشاء وتجهيز روشتة دايت بهذه الحسابات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <DietPrescriptionModal
        key={
          (prescriptionData?.userId || '') +
          '-' +
          (prescriptionData?.weight || '') +
          '-' +
          String(prescriptionModal)
        }
        open={prescriptionModal}
        onClose={() => {
          setPrescriptionModal(false);
          setPrescriptionData(undefined);
        }}
        onSaved={() => {
          setPrescriptionModal(false);
        }}
        defaultData={prescriptionData}
      />

      {/* Admin QR Scanner Modal */}
      <AdminQrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(res) => void handleQrScan(res)}
        title="مسح كود المريض لبرنامج الـ BMI"
        subtitle="امسحي كود الـ QR الخاص بالمريض أو تذكرة موعده ليتم ربطه تلقائياً بحاسبة السعرات والمؤشرات"
      />
    </>
  );
}
