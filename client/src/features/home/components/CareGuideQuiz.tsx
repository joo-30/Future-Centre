import { useState } from 'react';
import { Check, Compass, RotateCcw, Sparkles } from 'lucide-react';
import { ButtonLink } from '../../../components/ui';
import { whatsappUrl } from '../../../lib/api';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: {
    label: string;
    desc: string;
    value: string;
  }[];
}

const questions: Question[] = [
  {
    id: 'goal',
    title: 'ما هو هدفك الصحي الأساسي؟',
    subtitle: 'اختاري الهدف الذي تودين التركيز عليه أولاً',
    options: [
      { label: 'نزول وزن ونحت القوام', desc: 'خسارة دهون صحية مع الحفاظ على الكتلة العضلية', value: 'weight_loss' },
      { label: 'مقاومة الإنسولين وتكيس المبايض', desc: 'تحسين كفاءة الحرق وضبط الهرمونات بدون أدوية عشوائية', value: 'pcos_insulin' },
      { label: 'زيادة وزن وعلاج النحافة', desc: 'بناء كتلة عضلية وتغذية متوازنة تفتح الشهية صحياً', value: 'weight_gain' },
      { label: 'تغذية صحية وأسلوب حياة', desc: 'اكتساب عادات مستدامة تناسب روتين يومك المزدحم', value: 'healthy_lifestyle' },
    ],
  },
  {
    id: 'challenge',
    title: 'ما هو أكبر تحدٍ واجهك في تجاربك السابقة؟',
    subtitle: 'فهم العائق يساعدنا في توجيهك للمسار الذي يدوم معك',
    options: [
      { label: 'ثبات الوزن بعد دايت قاسي', desc: 'نزول مؤقت ثم عودة الوزن سريعاً بمجرد التوقف', value: 'plateau' },
      { label: 'صعوبة التحكم بالشهية والجوع', desc: 'حرمان قاسي يؤدي إلى نوبات شراهة وإحباط', value: 'cravings' },
      { label: 'خمول وضعف معدل الحرق', desc: 'التزام كامل دون نتائج ملحوظة على الميزان', value: 'low_metabolism' },
      { label: 'أول مرة أبدأ خطة متابعة', desc: 'أريد بداية صحيحة ومدروسة تحت إشراف طبي متخصص', value: 'first_time' },
    ],
  },
  {
    id: 'preference',
    title: 'كيف تفضلين بداية خطتك مع المركز؟',
    subtitle: 'كل خطة في مركز المستقبل تُبنى على فحص سريري دقيق',
    options: [
      { label: 'متابعة شهرية مكثفة بالعيادة', desc: 'زيارات أسبوعية، فحص InBody دوري، وتعديل مستمر للخطة', value: 'monthly_sub' },
      { label: 'كشف واستشارة عيادة شاملة', desc: 'جلسة استماع تفصيلية، فحص كتلة الدهون، ووضع الخطة الأولى', value: 'exam_first' },
    ],
  },
];

export function CareGuideQuiz({ whatsappNumber }: { whatsappNumber?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = questions[step];

  const handleSelect = (val: string) => {
    const updated = { ...answers, [currentQ.id]: val };
    setAnswers(updated);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setIsCompleted(false);
  };

  // Determine Personalized Recommendation
  const goal = answers.goal || 'weight_loss';
  const isPcos = goal === 'pcos_insulin';
  const isGain = goal === 'weight_gain';

  const recommendedProgram = isPcos
    ? 'برنامج التغذية العلاجية ومقاومة الإنسولين'
    : isGain
    ? 'برنامج علاج النحافة وتنسيق الوزن'
    : 'برنامج المتابعة الشهرية بالعيادة';

  const clinicalInsight = isPcos
    ? 'حالتك تتطلب بروتوكولاً غذائياً يركز على مؤشر الجلوكوز، استجابة الإنسولين، والتوازن الهرموني، وتجنب برامج الحرمان العشوائية التي تبطئ الحرق.'
    : isGain
    ? 'حالتك تحتاج خطة كثيفة السعرات الصحية مع فحص دقيق لمؤشرات الامتصاص وتوزيع العضلات بجهاز InBody لتجنب زيادة الدهون غير المرغوبة.'
    : 'حالتك تحتاج فحص InBody دوري لمراقبة كتلة الدهون الحشوية والماء العضلي، مع خطة متدرجة تمنع ثبات الوزن وتضمن استدامة النتائج مدى الحياة.';

  const waMessage = `أهلاً دكتورة رنا، قمت بعمل استبيان الموقع الاسترشادي وهدفي (${
    goal === 'weight_loss' ? 'نزول وزن' : goal === 'pcos_insulin' ? 'مقاومة إنسولين' : 'تغذية صحية'
  })، وأود حجز كشف بالعيادة لمناقشة الخطة المناسبة.`;

  return (
    <section className="care-guide-section" id="care-guide">
      <div className="care-guide-container">
        <div className="care-guide-header">
          <div className="care-guide-badge">
            <Compass size={15} />
            <span>مرشد البداية الاستشاري</span>
          </div>
          <h2>مش متأكدة من أين تبدئين؟</h2>
          <p>
            أجيبي عن 3 أسئلة سريعة (في 30 ثانية) لمساعدتنا في توجيهك للمسار الأنسب مع د. رنا قبل حضورك للعيادة.
          </p>
        </div>

        {!isCompleted ? (
          <div className="quiz-card">
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="quiz-card-head">
              <span className="quiz-step-counter">
                الخطوة {step + 1} من {questions.length}
              </span>
              <h3 className="quiz-question-title">{currentQ.title}</h3>
              <p className="quiz-question-sub">{currentQ.subtitle}</p>
            </div>

            <div className="quiz-options-grid">
              {currentQ.options.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`quiz-option-btn ${answers[currentQ.id] === opt.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className="quiz-option-radio">
                    {answers[currentQ.id] === opt.value && <Check size={14} />}
                  </div>
                  <div className="quiz-option-texts">
                    <strong>{opt.label}</strong>
                    <small>{opt.desc}</small>
                  </div>
                </button>
              ))}
            </div>

            {step > 0 && (
              <div className="quiz-footer-actions">
                <button
                  type="button"
                  className="btn-quiz-back"
                  onClick={() => setStep(step - 1)}
                >
                  السابق
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="quiz-result-card">
            <div className="quiz-result-kicker">
              <Sparkles size={16} />
              <span>الرؤية الاسترشادية لحالتك</span>
            </div>

            <h3 className="quiz-result-title">
              الخطة المناسبة لحالتك تبدأ بكشف سريري وفحص InBody دقيق
            </h3>

            <div className="quiz-insight-box">
              <p className="quiz-insight-text">
                💡 <strong>التشخيص المبدئي:</strong> {clinicalInsight}
              </p>
            </div>

            <div className="quiz-recommended-banner">
              <div>
                <small>المسار المقترح من برامج المركز:</small>
                <h4>{recommendedProgram}</h4>
              </div>
              <span className="quiz-doctor-tag">إشراف د. رنا الشوري</span>
            </div>

            <p className="quiz-disclaimer">
              * هذا التقييم استرشادي لمساعدتك في اختيار الخدمة، والقرار النهائي للخطة يتم تحديده في جلسة الكشف والفحص الطبي الشامل داخل المركز.
            </p>

            <div className="quiz-result-actions">
              <ButtonLink to="/booking" className="btn-quiz-book">
                احجزي كشف استشاري مع د. رنا
              </ButtonLink>

              {whatsappNumber && (
                <a
                  href={whatsappUrl(whatsappNumber, waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa-quiz"
                >
                  <WhatsAppIcon size={18} />
                  <span>تواصلي واتساب مع العيادة</span>
                </a>
              )}

              <button
                type="button"
                className="btn-quiz-restart"
                onClick={handleReset}
                title="إعادة التقييم"
              >
                <RotateCcw size={14} />
                <span>إعادة الاستبيان</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
