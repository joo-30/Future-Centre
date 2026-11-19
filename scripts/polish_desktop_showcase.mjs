import fs from 'fs';

// 1. Update AuthPage.tsx to nest showcase-bottom-area inside showcase-bg-wrap
let authCode = fs.readFileSync('client/src/features/auth/AuthPage.tsx', 'utf8');

const oldAside = `      {/* Desktop Visual Showcase Aside with Option 2 (Nutrition & Vitality Analytics) */}
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
      </aside>`;

const newAside = `      {/* Desktop Visual Showcase Aside with Option 2 (Nutrition & Vitality Analytics) */}
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
        </div>
      </aside>`;

authCode = authCode.replace(oldAside.replace(/\r?\n/g, '\r\n'), newAside.replace(/\n/g, '\r\n'));
fs.writeFileSync('client/src/features/auth/AuthPage.tsx', authCode, 'utf8');

// 2. Update auth.css
let css = fs.readFileSync('client/src/styles/portal/auth.css', 'utf8');

const oldVisualSection = `.access-visual {
  position: relative;
  min-height: 100%;
  background: transparent;
  overflow: hidden;
  padding: 32px 32px 36px 36px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.showcase-bg-wrap {
  position: absolute;
  inset: 16px 16px 16px 20px;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(20, 68, 42, 0.12);
  box-shadow: 0 24px 60px -15px rgba(6, 43, 33, 0.16), 0 4px 16px rgba(0, 0, 0, 0.04);
  background: #041f17;
  z-index: 0;
}`;

const newVisualSection = `.access-visual {
  position: relative;
  min-height: 100vh;
  background: transparent;
  overflow: hidden;
  padding: 20px 0 20px 24px;
  box-sizing: border-box;
}

.showcase-bg-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 40px);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(20, 68, 42, 0.12);
  box-shadow: 0 24px 60px -15px rgba(6, 43, 33, 0.16), 0 4px 16px rgba(0, 0, 0, 0.04);
  background: #041f17;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px 36px;
  box-sizing: border-box;
}

.showcase-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 32% !important;
  filter: saturate(1.05) contrast(1.02);
  display: block;
}

.showcase-gradient-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(4, 31, 23, 0.05) 0%, rgba(4, 31, 23, 0.3) 40%, rgba(4, 31, 23, 0.86) 72%, rgba(2, 20, 15, 0.98) 100%),
    linear-gradient(270deg, rgba(4, 31, 23, 0.4) 0%, transparent 60%);
  pointer-events: none;
}

.showcase-bottom-area {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 540px;
}`;

css = css.replace(oldVisualSection.replace(/\r?\n/g, '\r\n'), newVisualSection.replace(/\n/g, '\r\n'));
fs.writeFileSync('client/src/styles/portal/auth.css', css, 'utf8');

console.log('Successfully polished desktop visual showcase nesting and styles!');
