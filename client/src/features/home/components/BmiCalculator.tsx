import { ArrowLeft, Flame, Droplets, Scale, Sparkles } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
    label: 'أقل من المعدل الطبيعي',
    colorClass: 'cat-underweight',
    badgeBg: '#e8f0f8',
    badgeColor: '#2b5a84',
    summary: 'مؤشر كتلة الجسم أقل من 18.5',
    advice: 'قد تحتاجي إلى خطة تغذية مركزة وصحية لبناء الكتلة العضلية وتحسين طاقة الجسم بأمان.',
  },
  healthy: {
    key: 'healthy',
    label: 'وزن صحي ومتوازن',
    colorClass: 'cat-healthy',
    badgeBg: '#eef6ea',
    badgeColor: '#2d6a2f',
    summary: 'مؤشر كتلة الجسم بين 18.5 و 24.9',
    advice: 'أنتِ في النطاق الصحي المثالي! الحفاظ على جودة الأكل وتنظيم النشاط هو سر الاستدامة والوقاية.',
  },
  overweight: {
    key: 'overweight',
    label: 'زيادة طفيفة في الوزن',
    colorClass: 'cat-overweight',
    badgeBg: '#fdf3e7',
    badgeColor: '#965a18',
    summary: 'مؤشر كتلة الجسم بين 25.0 و 29.9',
    advice: 'تعديلات بسيطة في توزيع السعرات وعادات اليوم كفيلة بإعادتك للوزن المثالي دون حرمان.',
  },
  obese: {
    key: 'obese',
    label: 'سمنة تتطلب متابعة',
    colorClass: 'cat-obese',
    badgeBg: '#faecea',
    badgeColor: '#9e2d26',
    summary: 'مؤشر كتلة الجسم 30 فأكثر',
    advice: 'نوصي ببدء استشارة متخصصة لمتابعة المؤشرات الحيوية ووضع خطة تدريجية تحمي مفاصلك وصحتك العامة.',
  },
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { multiplier: number; label: string; desc: string }> = {
  sedentary: { multiplier: 1.2, label: 'قليل النشاط', desc: 'عمل مكتبي / حركة محدودة' },
  light: { multiplier: 1.375, label: 'نشاط خفيف', desc: 'مشي أو تمارين 1-3 أيام أسبوعياً' },
  moderate: { multiplier: 1.55, label: 'نشاط معتدل', desc: 'تمارين منتظمة 3-5 أيام أسبوعياً' },
  active: { multiplier: 1.725, label: 'نشاط عالي', desc: 'تمارين مكثفة أو عمل حركي شاق' },
};

export function BmiCalculator() {
  const [gender, setGender] = useState<Gender>('female');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [activity, setActivity] = useState<ActivityLevel>('light');

  const heightId = useId();
  const weightId = useId();
  const ageId = useId();

  // Helper to handle numeric inputs cleanly without forcing or trapping zeroes
  const handleNumberInput = (setter: (val: number | '') => void, maxVal?: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.trim();
    if (!raw) {
      setter('');
      return;
    }
    // Strip leading zeroes so entering digits doesn't produce "025" and entering 0 clears
    const sanitized = raw.replace(/^0+/, '');
    if (!sanitized) {
      setter('');
      return;
    }
    const num = Number(sanitized);
    if (!isNaN(num)) {
      if (maxVal && num > maxVal) {
        setter(maxVal);
      } else {
        setter(num);
      }
    }
  };

  const calculations = useMemo(() => {
    const hasInputs = Boolean(height && weight);
    // Baseline reference values used for smooth preview until user types
    const effectiveHeight = typeof height === 'number' && height > 0 ? height : 165;
    const effectiveWeight = typeof weight === 'number' && weight > 0 ? weight : 68;
    const effectiveAge = typeof age === 'number' && age > 0 ? age : 28;

    const heightInMeters = effectiveHeight / 100;
    const bmiValue = heightInMeters > 0 ? effectiveWeight / (heightInMeters * heightInMeters) : 0;
    const roundedBmi = Math.round(bmiValue * 10) / 10;

    // Category
    let categoryKey = 'healthy';
    if (roundedBmi < 18.5) categoryKey = 'underweight';
    else if (roundedBmi <= 24.9) categoryKey = 'healthy';
    else if (roundedBmi <= 29.9) categoryKey = 'overweight';
    else categoryKey = 'obese';
    const category = CATEGORIES[categoryKey];

    // Gauge pointer position (clamp between 0% and 100%)
    // Range scale: 15 to 38
    const gaugePercent = Math.min(Math.max(((roundedBmi - 15) / (38 - 15)) * 100, 2), 98);

    // Ideal Weight Range (for BMI 18.5 - 24.9)
    const minIdeal = Math.round(18.5 * heightInMeters * heightInMeters);
    const maxIdeal = Math.round(24.9 * heightInMeters * heightInMeters);

    // BMR (Mifflin-St Jeor)
    const bmr =
      gender === 'female'
        ? 10 * effectiveWeight + 6.25 * effectiveHeight - 5 * effectiveAge - 161
        : 10 * effectiveWeight + 6.25 * effectiveHeight - 5 * effectiveAge + 5;

    // TDEE (Maintenance calories)
    const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity].multiplier);

    // Target Calories for healthy progressive weight management
    const weightLossCalories = Math.max(1200, Math.round(tdee - 450));

    // Daily Water Intake (approx 35 ml per kg)
    const waterLiters = Math.round((effectiveWeight * 0.035) * 10) / 10;

    return {
      hasInputs,
      bmi: roundedBmi,
      category,
      gaugePercent,
      idealWeightRange: `${minIdeal} - ${maxIdeal}`,
      tdee,
      weightLossCalories,
      waterLiters,
    };
  }, [gender, height, weight, age, activity]);

  return (
    <section className="calculator-section" aria-labelledby="calc-heading">
      <div className="section-top">
        <div>
          <div className="kicker">
            <Sparkles size={16} aria-hidden="true" />
            حاسبة التغذية الذكية
          </div>
          <h2 id="calc-heading">
            افهمي أرقام جسمك،
            <br />
            وابدئي خطتك بوعي.
          </h2>
          <p>
            احسبي مؤشر كتلة الجسم (BMI) واحتياجك اليومي من السعرات والماء بدقة بناءً على قياساتك وروتين يومك.
          </p>
        </div>
      </div>

      <div className="calc-layout">
        {/* Form Controls Card */}
        <div className="calc-card calc-form-card">
          <div className="calc-card-header">
            <h3>بياناتك الشخصية</h3>
            <span className="calc-step-tag">حساب فوري</span>
          </div>

          {/* Gender Selector */}
          <div className="calc-field-group">
            <span className="calc-field-label">النوع</span>
            <div className="calc-toggle-pill" role="radiogroup" aria-label="النوع">
              <button
                type="button"
                className={`toggle-option ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
                role="radio"
                aria-checked={gender === 'female'}
              >
                أنثى
              </button>
              <button
                type="button"
                className={`toggle-option ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
                role="radio"
                aria-checked={gender === 'male'}
              >
                ذكر
              </button>
            </div>
          </div>

          {/* Height & Weight Inputs */}
          <div className="calc-grid-2">
            <div className="calc-field-group">
              <label htmlFor={heightId} className="calc-field-label">
                الطول
                <small className="unit">سم</small>
              </label>
              <div className="calc-input-wrap">
                <input
                  id={heightId}
                  type="number"
                  min={120}
                  max={230}
                  value={height === 0 || height === '' ? '' : height}
                  placeholder="165"
                  onFocus={(e) => e.target.select()}
                  onChange={handleNumberInput(setHeight, 230)}
                  className="calc-input"
                  dir="ltr"
                />
              </div>
              <div className="calc-quick-pills">
                {[155, 160, 165, 170, 175].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`quick-pill ${height === h ? 'active' : ''}`}
                    onClick={() => setHeight(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="calc-field-group">
              <label htmlFor={weightId} className="calc-field-label">
                الوزن الحالي
                <small className="unit">كجم</small>
              </label>
              <div className="calc-input-wrap">
                <input
                  id={weightId}
                  type="number"
                  min={35}
                  max={220}
                  value={weight === 0 || weight === '' ? '' : weight}
                  placeholder="68"
                  onFocus={(e) => e.target.select()}
                  onChange={handleNumberInput(setWeight, 220)}
                  className="calc-input"
                  dir="ltr"
                />
              </div>
              <div className="calc-quick-pills">
                {[60, 68, 75, 82, 90].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`quick-pill ${weight === w ? 'active' : ''}`}
                    onClick={() => setWeight(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Age Input */}
          <div className="calc-field-group">
            <label htmlFor={ageId} className="calc-field-label">
              العمر
              <small className="unit">سنة</small>
            </label>
            <div className="calc-input-wrap">
              <input
                id={ageId}
                type="number"
                min={14}
                max={95}
                value={age === 0 || age === '' ? '' : age}
                placeholder="28"
                onFocus={(e) => e.target.select()}
                onChange={handleNumberInput(setAge, 95)}
                className="calc-input"
                dir="ltr"
              />
            </div>
            <div className="calc-quick-pills">
              {[20, 25, 30, 35, 45, 55].map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`quick-pill ${age === a ? 'active' : ''}`}
                  onClick={() => setAge(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="calc-field-group">
            <span className="calc-field-label">مستوى النشاط اليومي</span>
            <div className="activity-options">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => {
                const item = ACTIVITY_MULTIPLIERS[key];
                const isSelected = activity === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`activity-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setActivity(key)}
                  >
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="calc-card calc-result-card">
          <div className="calc-card-header">
            <h3>مؤشرات جسمك التقديرية</h3>
            <span
              className="calc-badge"
              style={{
                backgroundColor: calculations.category.badgeBg,
                color: calculations.category.badgeColor,
              }}
            >
              {calculations.hasInputs ? calculations.category.label : 'أدخلي قياساتكِ لحساب فوري'}
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

            {/* Visual Gauge Track */}
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

          {/* Metric Insight Tiles */}
          <div className="calc-tiles-grid">
            <div className="calc-tile">
              <div className="tile-icon" style={{ backgroundColor: '#eef3e0', color: '#577539' }}>
                <Scale size={20} />
              </div>
              <div className="tile-info">
                <span className="tile-label">الوزن المثالي لطولك</span>
                <strong className="tile-value">
                  {calculations.idealWeightRange} <small>كجم</small>
                </strong>
                <span className="tile-hint">النطاق الصحي الموصى به</span>
              </div>
            </div>

            <div className="calc-tile">
              <div className="tile-icon" style={{ backgroundColor: '#fdf2e8', color: '#b26117' }}>
                <Flame size={20} />
              </div>
              <div className="tile-info">
                <span className="tile-label">السعرات لنزول متوازن</span>
                <strong className="tile-value">
                  {calculations.weightLossCalories} <small>سعرة / يوم</small>
                </strong>
                <span className="tile-hint">تثبيت الوزن: {calculations.tdee} سعرة</span>
              </div>
            </div>

            <div className="calc-tile">
              <div className="tile-icon" style={{ backgroundColor: '#edf5f8', color: '#38738a' }}>
                <Droplets size={20} />
              </div>
              <div className="tile-info">
                <span className="tile-label">الاحتياج اليومي من الماء</span>
                <strong className="tile-value">
                  {calculations.waterLiters} <small>لتر / يوم</small>
                </strong>
                <span className="tile-hint">يعادل تقريباً {Math.round(calculations.waterLiters / 0.25)} أكواب</span>
              </div>
            </div>
          </div>

          {/* Doctor / Specialist Advice */}
          <div className="calc-advice-box">
            <p>{calculations.category.advice}</p>
          </div>

          {/* CTA Box */}
          <div className="calc-cta-row">
            <Link to="/booking" className="btn lime full">
              <span>احجزي استشارتك لتفصيل خطتك</span>
              <ArrowLeft size={19} />
            </Link>
            <p className="calc-disclaimer">
              * النتائج استرشادية مبنية على معادلات موثوقة عالمياً، ويتم اعتماد خطتك الدقيقة بعد الفحص السريري في العيادة.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
