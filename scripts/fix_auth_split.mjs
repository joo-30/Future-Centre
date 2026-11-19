import fs from 'fs';

let code = fs.readFileSync('client/src/features/auth/AuthPage.tsx', 'utf8');

// Find and replace from `<main ref={pageRef} className="access-page access-page-centered">`
// down to `<div className="auth-card-elevated">`
const startMarker = '<main ref={pageRef} className="access-page access-page-centered">';
const endMarker = '<div className="auth-card-elevated">';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found!', { startIndex, endIndex });
  process.exit(1);
}

const newTop = `<main ref={pageRef} className="access-page">
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

        <div className="auth-card-elevated">`;

// Bottom replacement
const bottomStartMarker = '<footer className="access-centered-footer">';
const bottomEndMarker = '</main>\r\n  );';
const bottomEndMarkerLF = '</main>\n  );';

let bStartIndex = code.indexOf(bottomStartMarker);
let bEndIndex = code.indexOf(bottomEndMarker);
if (bEndIndex === -1) bEndIndex = code.indexOf(bottomEndMarkerLF);

if (bStartIndex === -1 || bEndIndex === -1) {
  console.error('Bottom markers not found!', { bStartIndex, bEndIndex });
  process.exit(1);
}

const newBottom = `<footer className="access-mobile-footer">
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

// Assemble code
const part1 = code.slice(0, startIndex);
const part2 = code.slice(endIndex + endMarker.length, bStartIndex);
const part3 = code.slice(bEndIndex + (code.includes(bottomEndMarker) ? bottomEndMarker.length : bottomEndMarkerLF.length));

const updatedCode = part1 + newTop + part2 + newBottom + part3;

fs.writeFileSync('client/src/features/auth/AuthPage.tsx', updatedCode, 'utf8');
console.log('Successfully applied split layout to AuthPage.tsx!');
