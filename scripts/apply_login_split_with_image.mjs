import fs from 'fs';
import path from 'path';

// 1. Update AuthPage.tsx
const authPagePath = path.resolve('client/src/features/auth/AuthPage.tsx');
let authCode = fs.readFileSync(authPagePath, 'utf8');

// Ensure Sparkles is imported
if (!authCode.includes('Sparkles,')) {
  authCode = authCode.replace("ShieldCheck,\n", "ShieldCheck,\n  Sparkles,\n");
  if (!authCode.includes('Sparkles,')) {
    authCode = authCode.replace("ShieldCheck,\r\n", "ShieldCheck,\r\n  Sparkles,\r\n");
  }
}

const oldPageRender = `  return (
    <main ref={pageRef} className="access-page access-page-centered">
      <div className="auth-ambient-orb auth-ambient-orb-1" aria-hidden="true" />
      <div className="auth-ambient-orb auth-ambient-orb-2" aria-hidden="true" />

      <div className="access-centered-container">
        <header className="access-top-centered">
          <Brand />
          <div className="access-top-actions">
            <PwaInstallButton variant="auth" />
            <Link className="access-back-pill" to="/" title="العودة للصفحة الرئيسية">
              <span>العودة للرئيسية</span>
              <ArrowLeft size={16} />
            </Link>
          </div>
        </header>

        <div className="auth-card-elevated">
          <div className="access-form">`;

const newPageRender = `  return (
    <main ref={pageRef} className="access-page">
      <section className="access-form-area">
        <header className="access-top">
          <Brand />
          <div className="access-top-actions">
            <PwaInstallButton variant="auth" />
            <Link className="access-back-pill" to="/" title="العودة للصفحة الرئيسية">
              <span>العودة للرئيسية</span>
              <ArrowLeft size={16} />
            </Link>
          </div>
        </header>

        {/* Mobile Visual Showcase Banner */}
        <div className="mobile-nutrition-showcase" aria-label="بوابة المتابعة والتغذية العلاجية">
          <div className="mob-showcase-img-wrap">
            <img
              src="/assets/concept_2_nutrition_vitality.jpg"
              alt="مركز المستقبل للتغذية العلاجية"
              className="mob-showcase-img"
            />
            <div className="mob-showcase-gradient" />
            <div className="mob-showcase-overlay-content">
              <span className="mob-showcase-chip">
                <Sparkles size={12} />
                بوابة مركز المستقبل · وصول مشفّر
              </span>
              <p className="mob-showcase-title">متابعة دقيقة لخطتكِ الغذائية وقياسات InBody</p>
            </div>
          </div>
        </div>

        <div className="auth-card-elevated">
          <div className="access-form">`;

authCode = authCode.replace(oldPageRender.replace(/\r?\n/g, '\r\n'), newPageRender.replace(/\n/g, '\r\n'));

const oldPageFooter = `        <footer className="access-centered-footer">
          <p>© {new Date().getFullYear()} مركز المستقبل للتغذية العلاجية ونحت القوام · إشراف د. رنا الشورى (EMASO)</p>
        </footer>
      </div>
    </main>
  );`;

const newPageFooter = `        <footer className="access-mobile-footer">
          <p>© {new Date().getFullYear()} مركز المستقبل للتغذية العلاجية ونحت القوام · إشراف د. رنا الشورى (EMASO)</p>
        </footer>
      </section>

      {/* Desktop Visual Showcase Aside with Option 2 (Nutrition & Vitality Analytics) */}
      <aside className="access-visual" aria-label="واجهة التغذية والتحليلات السريرية">
        <div className="showcase-bg-wrap">
          <img
            src="/assets/concept_2_nutrition_vitality.jpg"
            alt="مركز المستقبل للتغذية العلاجية - استشارات وتحليلات تكوين الجسم InBody"
            className="showcase-img"
          />
          <div className="showcase-gradient-overlay" />
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
        </div>

        <div className="showcase-bottom-area">
          <div className="showcase-doctor-pill">
            <Sparkles size={16} className="pill-award-icon" />
            <strong>مركز المستقبل للتغذية العلاجية</strong>
            <span className="pill-dot">·</span>
            <span className="pill-spec">بوابة المتابعة وقياسات InBody</span>
          </div>

          <h2 className="showcase-headline">
            رعايتكِ مستمرة.. خطتكِ ونتائج قياساتكِ في متناول يدكِ.
          </h2>
          <p className="showcase-subtext">
            نظام متكامل يتابع تطور كتلة العضلات ونسب الدهون بجهاز InBody أسبوعياً، مع جداول وجبات علمية مصممة خصيصاً لكِ بإشراف د. رنا ياسر الشورى.
          </p>

          <div className="showcase-stats-bar">
            <div className="stat-item">
              <span className="stat-number">InBody</span>
              <span className="stat-label">فحص سريري دقيق</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">أنظمة بدون حرمان</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">ملفكِ متاح أينما كنتِ</span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );`;

authCode = authCode.replace(oldPageFooter.replace(/\r?\n/g, '\r\n'), newPageFooter.replace(/\n/g, '\r\n'));

fs.writeFileSync(authPagePath, authCode, 'utf8');
console.log('Successfully updated AuthPage.tsx with Option 2 image!');
