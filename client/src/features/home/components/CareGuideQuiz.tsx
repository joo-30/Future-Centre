import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Gauge,
  HeartPulse,
  RotateCcw,
  Scale,
  Sparkles,
  Sprout,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import { whatsappUrl } from '../../../lib/api';
import { isReducedMotion } from '../../../lib/motion';

interface Question {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  options: { label: string; value: string; icon: LucideIcon }[];
}

const questions: Question[] = [
  {
    id: 'goal',
    label: 'هدفكِ',
    title: 'إيه هدفكِ الأساسي؟',
    subtitle: 'اختاري إجابة واحدة',
    options: [
      { label: 'نزول الوزن', value: 'weight_loss', icon: Scale },
      { label: 'زيادة الوزن', value: 'weight_gain', icon: TrendingUp },
      { label: 'مقاومة الإنسولين وتكيس المبايض', value: 'pcos_insulin', icon: HeartPulse },
      { label: 'تغذية صحية', value: 'healthy_lifestyle', icon: Sprout },
    ],
  },
  {
    id: 'challenge',
    label: 'تجربتكِ',
    title: 'إيه أكتر تحدّي واجهكِ؟',
    subtitle: 'اختاري الأقرب لتجربتكِ',
    options: [
      { label: 'ثبات الوزن بعد دايت قاسي', value: 'plateau', icon: Scale },
      { label: 'صعوبة التحكم في الشهية', value: 'cravings', icon: Utensils },
      { label: 'خمول وقلة الطاقة', value: 'low_metabolism', icon: Gauge },
      { label: 'دي أول مرة أبدأ متابعة', value: 'first_time', icon: Sparkles },
    ],
  },
  {
    id: 'preference',
    label: 'بدايتكِ',
    title: 'تحبّي نبدأ إزاي؟',
    subtitle: 'اختاري البداية اللي تفضّليها',
    options: [
      { label: 'متابعة شهرية بالعيادة', value: 'monthly_sub', icon: CalendarDays },
      { label: 'كشف واستشارة أولًا', value: 'exam_first', icon: ClipboardList },
    ],
  },
];

const arabicNumbers = ['١', '٢', '٣'];

export function CareGuideQuiz({ whatsappNumber }: { whatsappNumber?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  const question = questions[step];
  const selected = answers[question.id];
  const summary = questions.map((item) => ({
    label: item.label,
    answer: item.options.find((option) => option.value === answers[item.id])?.label ?? '',
  }));
  const waMessage = [
    'أهلاً د. رنا، أجبت عن أسئلة مرشد البداية على الموقع.',
    ...summary.map((item) => `${item.label} ${item.answer}`),
    'وأود الاستفسار عن البداية المناسبة وحجز موعد بالعيادة.',
  ].join('\n');

  useEffect(() => {
    if (!hasNavigated.current) return;
    const frame = requestAnimationFrame(() => {
      const heading = headingRef.current;
      if (!heading) return;
      heading.focus({ preventScroll: true });
      const { top, bottom } = heading.getBoundingClientRect();
      if (top < 115 || bottom > window.innerHeight - 90) {
        heading.scrollIntoView({
          block: 'start',
          behavior: isReducedMotion() ? 'instant' : 'smooth',
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [step, isCompleted]);

  function goNext() {
    if (!selected) return;
    hasNavigated.current = true;
    if (step < questions.length - 1) setStep((current) => current + 1);
    else setIsCompleted(true);
  }

  function goBack() {
    hasNavigated.current = true;
    setStep((current) => Math.max(0, current - 1));
  }

  function restart() {
    hasNavigated.current = true;
    setAnswers({});
    setStep(0);
    setIsCompleted(false);
  }

  return (
    <section className="care-path-section" id="care-guide" aria-labelledby="care-path-title">
      <div className="care-path-container">
        <div className="care-path-intro">
          <header className="care-path-copy">
            <p className="care-path-eyebrow">نختار البداية سوا</p>
            <h2 id="care-path-title">
              <span>مش متأكدة</span>
              <span>تبدأي منين؟</span>
            </h2>
            <p className="care-path-description">
              ٣ أسئلة بسيطة تساعدنا نفهم هدفكِ ونختار معكِ البداية المناسبة.
            </p>
          </header>
          <div className="care-path-art" aria-hidden="true">
            <img
              src="/assets/care-guide-compass.webp"
              alt=""
              width="1000"
              height="750"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="care-path-workspace">
          <ol className="care-path-steps" aria-label="خطوات مرشد البداية">
            {questions.map((item, index) => (
              <li
                key={item.id}
                className={
                  isCompleted || index < step ? 'is-done' : index === step ? 'is-current' : ''
                }
                aria-current={!isCompleted && index === step ? 'step' : undefined}
              >
                <span className="care-path-step-dot" aria-hidden="true">
                  {isCompleted || index < step ? (
                    <Check size={19} />
                  ) : index === step ? (
                    arabicNumbers[index]
                  ) : null}
                </span>
                <span>{item.label}</span>
                {(isCompleted || index < step) && <span className="sr-only">مكتملة</span>}
              </li>
            ))}
          </ol>

          {!isCompleted ? (
            <form
              key={question.id}
              className="care-path-panel"
              onSubmit={(event) => {
                event.preventDefault();
                goNext();
              }}
            >
              <div className="care-path-question-head">
                <h3 ref={headingRef} tabIndex={-1} id="care-path-question">
                  {question.title}
                </h3>
                <p id="care-path-hint">{question.subtitle}</p>
              </div>
              <fieldset
                className="care-path-options"
                aria-labelledby="care-path-question"
                aria-describedby="care-path-hint"
              >
                {question.options.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label className="care-path-option" key={option.value}>
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={selected === option.value}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [question.id]: option.value }))
                        }
                        required
                      />
                      <span>{option.label}</span>
                      <Icon
                        className="care-path-option-icon"
                        size={29}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </label>
                  );
                })}
              </fieldset>
              <div className="care-path-controls">
                <div className="care-path-position">
                  <span
                    className="care-path-counter"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span className="sr-only">السؤال </span>
                    {arabicNumbers[step]} من ٣
                  </span>
                  {step > 0 && (
                    <button type="button" className="care-path-back" onClick={goBack}>
                      <ArrowRight size={17} aria-hidden="true" /> السابق
                    </button>
                  )}
                </div>
                <button type="submit" className="care-path-primary" disabled={!selected}>
                  {step === questions.length - 1 ? 'شوفي البداية' : 'التالي'}
                  <ArrowLeft size={23} aria-hidden="true" />
                </button>
              </div>
            </form>
          ) : (
            <div className="care-path-panel care-path-result">
              <div className="care-path-question-head">
                <p className="care-path-result-kicker">
                  <Check size={18} aria-hidden="true" /> اختياراتكِ جاهزة
                </p>
                <h3 ref={headingRef} tabIndex={-1}>
                  نبدأ من هنا
                </h3>
                <p>
                  دي نقطة بداية للنقاش مع د. رنا، والخطة المناسبة ليكِ بتتحدد بعد الكشف في العيادة.
                </p>
              </div>
              <dl className="care-path-summary">
                {summary.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.answer}</dd>
                  </div>
                ))}
              </dl>
              <div className="care-path-result-actions">
                <Link to="/booking" className="care-path-primary">
                  احجزي كشفكِ <ArrowLeft size={23} aria-hidden="true" />
                </Link>
                {whatsappNumber && (
                  <a
                    className="care-path-whatsapp"
                    href={whatsappUrl(whatsappNumber, waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon size={23} /> اسألي د. رنا على واتساب
                  </a>
                )}
              </div>
              <div className="care-path-result-footer">
                <button
                  type="button"
                  className="care-path-back"
                  onClick={() => {
                    hasNavigated.current = true;
                    setStep(0);
                    setIsCompleted(false);
                  }}
                >
                  تعديل الإجابات
                </button>
                <button type="button" className="care-path-back" onClick={restart}>
                  <RotateCcw size={16} aria-hidden="true" /> ابدئي من جديد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
