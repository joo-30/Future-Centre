import type { Service } from '@future/shared';
import {
  Check,
  CheckCircle2,
  Clock,
  Coins,
  EyeOff,
  Globe,
  Heart,
  Leaf,
  Shield,
  Award,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';
import { Notice } from '../components/Notice';
import { readFormLines, readFormText } from '../lib/form-data';

const DEFAULT_INCLUDES = [
  'جلسة كشف وتقييم سريري شامل بمقر المركز',
  'قياس دقيق لمكونات الجسم ونسبة الدهون (InBody)',
  'تصميم خطة تغذية مخصصة تناسب روتينك اليومي',
];

const DEFAULT_BODY = [
  'جلسات المتابعة تعقد أسبوعياً بمقر العيادة لمراجعة التطور وتعديل الخطة الغذائية.',
  'أرسلي طلب البرنامج وسيتواصل المركز معكِ لتأكيد الموعد المناسب لزيارتك.',
];

const ICONS_CONFIG: { id: Service['icon']; label: string; desc: string; icon: typeof Leaf }[] = [
  { id: 'leaf', label: 'ورقة ونمو (Leaf)', desc: 'تغذية طبيعية ونمط حياة متوازن', icon: Leaf },
  { id: 'heart', label: 'قلب ورعاية (Heart)', desc: 'رعاية تخصصية واستشارات سريرية', icon: Heart },
  { id: 'shield', label: 'درع ووقاية (Shield)', desc: 'متابعة وقائية وتثبيت الوزن', icon: Shield },
];

export function ServiceEditor({ service: s, onSaved }: { service: Service; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Controlled states for rich UX
  const [title, setTitle] = useState(s.title || '');
  const [id, setId] = useState(() => s.id || `prog-${Math.floor(100000 + Math.random() * 900000)}`);
  const [slug, setSlug] = useState(() => s.slug || `program-${Math.floor(100000 + Math.random() * 900000)}`);
  const [active, setActive] = useState(s.active !== false);
  const [featured, setFeatured] = useState(Boolean(s.featured));
  const [icon, setIcon] = useState<Service['icon']>(s.icon || 'leaf');
  const [duration, setDuration] = useState<number>(s.duration || 30);
  const [sessions, setSessions] = useState<number>(s.sessions || 1);
  const [period, setPeriod] = useState(s.period || 'جلسة فردية بالعيادة');
  const [priceType, setPriceType] = useState<'fixed' | 'consultation'>(s.price === null ? 'consultation' : 'fixed');
  const [price, setPrice] = useState<string>(s.price !== null && s.price !== undefined ? String(s.price) : '500');

  // Pre-fill includes and body if adding new program
  const initialIncludes = s.includes && s.includes.length > 0 ? s.includes : DEFAULT_INCLUDES;
  const initialBody = s.body && s.body.length > 0 ? s.body : DEFAULT_BODY;

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (!s.id) {
      const latin = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      if (latin.length >= 2) {
        setId(latin);
        setSlug(latin);
      }
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');

    try {
      // Auto-sanitize and generate IDs if needed
      const finalId = (
        s.id ||
        id.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') ||
        `prog-${Date.now().toString().slice(-5)}`
      ).toLowerCase();

      const finalSlug = (
        slug.trim() ||
        finalId ||
        `service-${Date.now().toString().slice(-5)}`
      ).toLowerCase();

      const rawIncludes = readFormLines(f, 'includes');
      const rawBody = readFormLines(f, 'body');

      const finalIncludes = rawIncludes.length > 0 ? rawIncludes : DEFAULT_INCLUDES;
      const finalBody = rawBody.length > 0 ? rawBody : DEFAULT_BODY;

      const finalPrice = priceType === 'consultation' ? null : Number(price) || 0;

      await adminApi.saveService({
        id: finalId,
        slug: finalSlug,
        title: readFormText(f, 'title') || title,
        description: readFormText(f, 'description'),
        price: finalPrice,
        duration: Number(duration),
        sessions: Number(sessions),
        period: period.trim() || readFormText(f, 'period') || 'جلسة فردية بالعيادة',
        icon,
        featured,
        active,
        includes: finalIncludes,
        body: finalBody,
      });

      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="service-editor-form" onSubmit={(e) => void save(e)}>
      <fieldset disabled={busy} className="service-editor-fieldset">
        {/* Status & Featured Options Group (Like Articles!) */}
        <div className="svc-options-grid">
          <div className="svc-option-card">
            <span className="svc-opt-header">حالة الظهور بالموقع</span>
            <div className="svc-toggle-pills">
              <button
                type="button"
                className={`svc-pill-btn ${active ? 'active-pub' : ''}`}
                onClick={() => setActive(true)}
              >
                <Globe size={15} />
                <span>ظاهر بالموقع (Active)</span>
                {active && <CheckCircle2 size={15} className="pill-check" />}
              </button>
              <button
                type="button"
                className={`svc-pill-btn ${!active ? 'active-draft' : ''}`}
                onClick={() => setActive(false)}
              >
                <EyeOff size={15} />
                <span>مخفي من الموقع (Hidden)</span>
                {!active && <CheckCircle2 size={15} className="pill-check" />}
              </button>
            </div>
          </div>

          <div className="svc-option-card">
            <span className="svc-opt-header">تمييز البرنامج (Featured)</span>
            <div className="svc-toggle-pills">
              <button
                type="button"
                className={`svc-pill-btn ${featured ? 'active-featured' : ''}`}
                onClick={() => setFeatured(true)}
              >
                <Award size={15} />
                <span>باقة رئيسية موصى بها</span>
                {featured && <CheckCircle2 size={15} className="pill-check" />}
              </button>
              <button
                type="button"
                className={`svc-pill-btn ${!featured ? 'active-neutral' : ''}`}
                onClick={() => setFeatured(false)}
              >
                <span>برنامج قياسي</span>
                {!featured && <CheckCircle2 size={15} className="pill-check" />}
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <label className="svc-field">
          <span className="svc-label">اسم البرنامج العلاجي</span>
          <input
            name="title"
            value={title}
            onChange={onTitleChange}
            required
            minLength={3}
            maxLength={120}
            placeholder="مثال: برنامج متابعة شهرية بالعيادة، كشف واستشارة..."
            className="svc-input font-bold"
          />
        </label>

        {/* Auto-generated ID & Slug row */}
        <div className="svc-two-cols">
          <label className="svc-field">
            <span className="svc-label">
              معرّف البرنامج (ID)
              <span className="svc-hint-sub"> — يتولد تلقائياً</span>
            </span>
            <input
              name="id"
              value={id}
              disabled={Boolean(s.id)}
              onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
              pattern="[a-z0-9-]{2,60}"
              dir="ltr"
              placeholder="monthly-program"
              className="svc-input font-mono"
            />
            {s.id && <span className="svc-caption">المعرّف ثابت للبرامج المسجلة ولا يمكن تغييره.</span>}
          </label>

          <label className="svc-field">
            <span className="svc-label">
              رابط صفحة البرنامج (Slug)
              <span className="svc-hint-sub"> — بالإنجليزية</span>
            </span>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
              pattern="[a-z0-9-]{2,100}"
              dir="ltr"
              placeholder="monthly-program"
              className="svc-input font-mono"
            />
            <span className="svc-caption">
              رابط الوصول: <code>/services/{slug || 'monthly'}</code>
            </span>
          </label>
        </div>

        {/* Description */}
        <label className="svc-field">
          <span className="svc-label">الوصف المختصر للبرنامج</span>
          <textarea
            name="description"
            defaultValue={s.description}
            required
            minLength={5}
            maxLength={600}
            rows={2}
            placeholder="وصف سريري موجز يوضح فائدة البرنامج والجمهور المستهدف..."
            className="svc-input svc-textarea"
          />
        </label>

        {/* Visual Medical Icon Selector (3 Options) */}
        <div className="svc-field">
          <span className="svc-label">الأيقونة الطبية المعبرة</span>
          <div className="svc-icon-options-grid">
            {ICONS_CONFIG.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`svc-icon-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setIcon(item.id)}
                >
                  <div className={`svc-icon-circle ${item.id}`}>
                    <IconComp size={22} />
                  </div>
                  <div className="svc-icon-info">
                    <span className="svc-icon-title">{item.label}</span>
                    <span className="svc-icon-desc">{item.desc}</span>
                  </div>
                  {isSelected && <Check size={16} className="svc-icon-check" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Specs: Duration, Sessions, Period */}
        <div className="svc-specs-box">
          <span className="svc-specs-header">
            <Clock size={16} />
            المواصفات السريرية والجدولة
          </span>

          <div className="svc-specs-grid">
            {/* Duration */}
            <div className="svc-field">
              <span className="svc-label">مدة الجلسة (دقائق)</span>
              <div className="svc-chips-row">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`svc-chip ${duration === m ? 'active' : ''}`}
                    onClick={() => setDuration(m)}
                  >
                    {m} دقيقة
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={15}
                max={180}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="svc-input svc-spec-input"
              />
            </div>

            {/* Sessions Count */}
            <div className="svc-field">
              <span className="svc-label">عدد الجلسات الإجمالي</span>
              <div className="svc-chips-row">
                {[
                  { n: 1, lbl: 'جلسة واحدة' },
                  { n: 4, lbl: '4 جلسات' },
                  { n: 8, lbl: '8 جلسات' },
                  { n: 12, lbl: '12 جلسة' },
                ].map((item) => (
                  <button
                    key={item.n}
                    type="button"
                    className={`svc-chip ${sessions === item.n ? 'active' : ''}`}
                    onClick={() => {
                      setSessions(item.n);
                      if (item.n === 1) setPeriod('جلسة فردية بالعيادة');
                      else if (item.n === 4) setPeriod('شهر واحد (4 جلسات)');
                      else if (item.n === 8) setPeriod('شهران (8 جلسات)');
                      else if (item.n === 12) setPeriod('3 أشهر (12 جلسة)');
                    }}
                  >
                    {item.lbl}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={100}
                value={sessions}
                onChange={(e) => setSessions(Number(e.target.value))}
                className="svc-input svc-spec-input"
              />
            </div>

            {/* Period */}
            <div className="svc-field svc-span-full">
              <span className="svc-label">الفترة الزمنية / نوع البرنامج</span>
              <input
                name="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                maxLength={80}
                placeholder="مثال: جلسة فردية بالعيادة، شهر واحد (4 جلسات)..."
                className="svc-input"
              />
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="svc-pricing-box">
          <span className="svc-specs-header">
            <Coins size={16} />
            تسعير البرنامج
          </span>

          <div className="svc-price-type-toggle">
            <button
              type="button"
              className={`svc-price-btn ${priceType === 'fixed' ? 'active' : ''}`}
              onClick={() => setPriceType('fixed')}
            >
              سعر محدد بالجنيه المصري
            </button>
            <button
              type="button"
              className={`svc-price-btn ${priceType === 'consultation' ? 'active' : ''}`}
              onClick={() => setPriceType('consultation')}
            >
              السعر يُحدد بعد الاستشارة الطبية
            </button>
          </div>

          {priceType === 'fixed' ? (
            <div className="svc-price-input-row">
              <label className="svc-field" style={{ flex: 1 }}>
                <span className="svc-label">قيمة البرنامج (ج.م)</span>
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500"
                  className="svc-input svc-price-num font-bold"
                />
              </label>
              <div className="svc-price-display-pill">
                <span>السعر الظاهر للمراجع:</span>
                <strong>{Number(price).toLocaleString('ar-EG')} ج.م</strong>
              </div>
            </div>
          ) : (
            <p className="svc-price-note">
              سيظهر للمراجعين عبارة «السعر يُحدد بعد الاستشارة» لإتاحة فحص الحالة أولاً.
            </p>
          )}
        </div>

        {/* Included Features (Includes) */}
        <label className="svc-field">
          <span className="svc-label">
            المميزات المشمولة في الباقة
            <span className="svc-hint-sub"> — كل ميزة في سطر مستقل</span>
          </span>
          <textarea
            name="includes"
            defaultValue={initialIncludes.join('\n')}
            required
            rows={4}
            placeholder="جلسة كشف وتقييم شامل مع الدكتورة&#10;قياس الوزن ومكونات الجسم InBody&#10;وضع خطة التغذية المناسبة"
            className="svc-input svc-textarea"
          />
        </label>

        {/* Page Details Body */}
        <label className="svc-field">
          <span className="svc-label">
            تفاصيل صفحة البرنامج
            <span className="svc-hint-sub"> — كل فقرة في سطر مستقل</span>
          </span>
          <textarea
            name="body"
            defaultValue={initialBody.join('\n\n')}
            required
            rows={4}
            placeholder="اكتبي تفاصيل جلسات المتابعة والتعليمات التوجيهية..."
            className="svc-input svc-textarea"
          />
        </label>

        <Notice message={error} error />

        {/* Footer Actions */}
        <div className="svc-modal-actions">
          <Button disabled={busy} icon={false}>
            {busy ? 'جاري الحفظ والتحديث...' : s.id ? 'حفظ تعديلات البرنامج' : 'إضافة البرنامج للعيادة'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
