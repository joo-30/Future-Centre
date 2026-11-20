import { Leaf } from 'lucide-react';
import { useRef } from 'react';
import { gsap, isReducedMotion, useGSAP } from '../../lib/motion';
import { PublicIntro } from '../../components/PublicIntro';
import { ButtonLink } from '../../components/ui';

export function About() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || !mainRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.public-intro', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('.about-page .prose p', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.35')
        .fromTo('.about-photo-wrap', { opacity: 0, scale: 0.98, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.4');

      gsap.fromTo(
        '.about-doctor-card',
        { opacity: 0, y: 18 },
        {
          scrollTrigger: {
            trigger: '.about-doctor-card',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
        }
      );
    },
    { scope: mainRef }
  );
  return (
    <main ref={mainRef} className="public-page">
      <div className="detail-page-grid about-page">
        <div>
          <PublicIntro kicker="فلسفة الرعاية" title="نبدأ بفهمك، ونكمل معك.">
            مركز المستقبل للتغذية العلاجية وتنسيق القوام تحت إشراف دكتورة د. رنا ياسر الشورى.
          </PublicIntro>
          <div className="prose">
            <p>
              نؤمن في مركز المستقبل أن كل جسم له شفرة حرق خاصة به وأسلوب حياة مختلف. هدفنا ليس مجرد
              خسارة أرقام على الميزان، بل بناء علاقة صحية ومستقرة مع الأكل بدون حرمان قاسي أو استرجاع
              للوزن المفقود.
            </p>
            <p>
              بإشراف الدكتورة ومتابعة أجهزة فحص الـ InBody المتطورة، نوفر برامج علمية دقيقة لحالات السمنة
              والنحافة، مقاومة الإنسولين، تكيس المبايض، وتغذية الحوامل والأطفال والرياضيين.
            </p>
          </div>
          <ButtonLink to="/booking">ابدئي بحجز كشف العيادة</ButtonLink>
        </div>
        <div className="doctor-profile-image-wrap about-photo-wrap">
          <img
            className="doctor-image about-page-photo"
            src="/assets/dr-rana.jpg"
            alt="دكتورة د. رنا ياسر الشورى - أخصائية التغذية العلاجية وتنسيق القوام"
            loading="lazy"
          />
          <div className="doctor-badge-floating">
            <span className="badge-icon">🌿</span>
            <span>رعاية تبدأ بفهمك · نتائج تستمر</span>
          </div>
        </div>
      </div>

      {/* بطاقة الدكتورة والشهادات */}
      <section className="about-doctor-card">
        <div className="about-doc-kicker">
          <Leaf size={16} />
          <span>المؤهلات والاعتمادات الرسمية</span>
        </div>
        <h2>دكتورة د. رنا ياسر الشورى</h2>
        <p className="about-doc-sub">
          أخصائية التغذية العلاجية والسمنة وتنسيق القوام · عضو الجمعية المصرية لدراسة السمنة (EMASO)
        </p>
        <div className="about-creds-grid">
          <div className="about-cred-item">
            <span className="about-cred-icon">🎓</span>
            <div>
              <strong>ماجستير ودبلومة التغذية العلاجية</strong>
              <small>علاج السمنة والنحافة وتعديل السلوك الغذائي</small>
            </div>
          </div>
          <div className="about-cred-item">
            <span className="about-cred-icon">🏅</span>
            <div>
              <strong>عضو الجمعية المصرية لدراسة السمنة (EMASO)</strong>
              <small>تطبيق أحدث البروتوكولات العلاجية العالمية</small>
            </div>
          </div>
          <div className="about-cred-item">
            <span className="about-cred-icon">🩺</span>
            <div>
              <strong>متخصصة في متلازمات الأيض والحرق</strong>
              <small>مقاومة الإنسولين، خمول الغدة، وتكيس المبايض</small>
            </div>
          </div>
        </div>
      </section>

      <div className="values-strip">
        {[
          ['نتعرّف عليك', 'نستمع لطبيعة يومك وروتينك ونفحص نسبة الحرق بالـ InBody.'],
          ['نخطط معك', 'نصمم برنامجك الغذائي المرن بدون حرمان قاسي.'],
          ['نتابعك خطوة بخطوة', 'قياسات أسبوعية مستمرة لضمان نزول دهون صافي وتثبيت النتيجة.'],
        ].map((v, i) => (
          <div key={v[0]}>
            <span>0{i + 1}</span>
            <h2>{v[0]}</h2>
            <p>{v[1]}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
