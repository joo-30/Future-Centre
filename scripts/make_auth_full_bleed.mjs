import fs from 'fs';

// 1. Update AuthPage.tsx
let authCode = fs.readFileSync('client/src/features/auth/AuthPage.tsx', 'utf8');

// Remove Sparkles from imports if present
authCode = authCode.replace(/(\s*Sparkles,\s*\r?\n)/, '\n');

// Update mobile showcase banner
const oldMobBanner = `        {/* Mobile Visual Showcase Banner */}
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
        </div>`;

const newMobBanner = `        {/* Mobile Visual Showcase Banner - Clean, Calm, No Text Clutter */}
        <div className="mobile-nutrition-showcase" aria-label="مركز المستقبل للتغذية العلاجية">
          <img
            src="/assets/concept_2_nutrition_vitality.jpg"
            alt="مركز المستقبل للتغذية العلاجية"
            className="mob-showcase-img"
          />
        </div>`;

authCode = authCode.replace(oldMobBanner.replace(/\r?\n/g, '\r\n'), newMobBanner.replace(/\n/g, '\r\n'));

// Update desktop aside
const oldDesktopAside = `      {/* Desktop Visual Showcase Aside with Option 2 (Nutrition & Vitality Analytics) */}
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

const newDesktopAside = `      {/* Desktop Visual Showcase Aside - Clean Edge-to-Edge Editorial View */}
      <aside className="access-visual" aria-label="مركز المستقبل للتغذية العلاجية">
        <img
          src="/assets/concept_2_nutrition_vitality.jpg"
          alt="مركز المستقبل للتغذية العلاجية"
          className="showcase-img"
        />
      </aside>`;

authCode = authCode.replace(oldDesktopAside.replace(/\r?\n/g, '\r\n'), newDesktopAside.replace(/\n/g, '\r\n'));

fs.writeFileSync('client/src/features/auth/AuthPage.tsx', authCode, 'utf8');
console.log('Successfully updated AuthPage.tsx for pure full-bleed image!');

// 2. Update auth.css
let css = fs.readFileSync('client/src/styles/portal/auth.css', 'utf8');

// Replace .access-visual and .showcase-bg-wrap with full-bleed styles
const regexVisual = /\/\* ==========================================================================\s+SHOWCASE SIDE[^\*]+\*\/\s+\.access-visual\s*\{[\s\S]+?(?=@media|\/\* ==========================================================================\s+RESPONSIVE BREAKPOINTS)/;

const newVisualCss = `/* ==========================================================================
   SHOWCASE SIDE - FULL-BLEED EDITORIAL VIEW (Edge-to-Edge, Zero Border)
   ========================================================================== */
.access-visual {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  background: #041f17;
  overflow: hidden;
  padding: 0;
  margin: 0;
  border: none;
}

.access-visual .showcase-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 36% !important;
  filter: saturate(1.05) contrast(1.02);
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.access-visual:hover .showcase-img {
  transform: scale(1.015);
}

`;

css = css.replace(regexVisual, newVisualCss);

// Clean up mobile-nutrition-showcase styles
const regexMobileShowcase = /\/\* ==========================================================================\s+MOBILE NUTRITION SHOWCASE BANNER[\s\S]+$/;

const newMobileShowcaseCss = `/* ==========================================================================
   MOBILE NUTRITION SHOWCASE BANNER (Clean quiet-luxury preview, zero text clutter)
   ========================================================================== */
.mobile-nutrition-showcase {
  display: none;
}

.access-mobile-footer {
  text-align: center;
  margin-top: 24px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 920px) {
  .mobile-nutrition-showcase {
    display: block;
    margin-bottom: 20px;
    border-radius: 16px;
    overflow: hidden;
    height: 160px;
    position: relative;
    border: 1px solid rgba(20, 68, 42, 0.12);
    box-shadow: 0 4px 14px rgba(6, 43, 33, 0.08);
  }
  .mob-showcase-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 36%;
    display: block;
  }
}
`;

css = css.replace(regexMobileShowcase, newMobileShowcaseCss);

fs.writeFileSync('client/src/styles/portal/auth.css', css, 'utf8');
console.log('Successfully updated auth.css for pure full-bleed image!');
