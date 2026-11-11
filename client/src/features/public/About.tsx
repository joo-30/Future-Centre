import { Leaf } from 'lucide-react';
import { PublicIntro } from '../../components/PublicIntro';
import { ButtonLink } from '../../components/ui';

export function About() {
  return (
    <main className="public-page">
      <div className="detail-page-grid about-page">
        <div>
          <PublicIntro kicker="فلسفة الرعاية" title="نبدأ بفهمك، ونكمل معك.">
            مركز المستقبل للتغذية العلاجية وتنسيق القوام تحت إشراف دكتورة د. رنا ياسر الشوري.
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
            alt="دكتورة د. رنا ياسر الشوري - أخصائية التغذية العلاجية وتنسيق القوام"
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
        <h2>دكتورة د. رنا ياسر الشوري</h2>
        <p className="about-doc-sub">
          أخصائية التغذية العلاجية والسمنة وتنسيق القوام · عضو الجمعية المصرية لدراسة السمنة (EMASO)
        </p>
        <div className="about-creds-grid">
          <div className="about-cred-item">
            <span className="about-cred-icon">🎓</span>
            <div>
              <strong>ماجستير ودبلومة التغذية الإكلينيكية</strong>
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
