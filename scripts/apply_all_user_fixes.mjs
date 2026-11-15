import fs from 'fs';
import path from 'path';

console.log('🚀 Starting comprehensive user fixes...');

// 1. Update index.html for Tajawal font
const indexPath = path.resolve('client/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
if (!indexHtml.includes('family=Tajawal')) {
  indexHtml = indexHtml.replace(
    /family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus\+Jakarta\+Sans:wght@400;500;600;700;800/,
    'family=Alexandria:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800;900'
  );
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('✅ Updated index.html with Tajawal Google Font');
} else {
  console.log('ℹ️ index.html already has Tajawal font');
}

// 2. Update Home.tsx:
// - import BmiCalculator
// - wire "احسبي مؤشرات جسمكِ مجاناً" button to scroll to #bmi-calculator
// - render <BmiCalculator /> section
// - add .hds-hide-on-mobile to the InBody floating badge
const homeTsxPath = path.resolve('client/src/features/home/Home.tsx');
let homeTsx = fs.readFileSync(homeTsxPath, 'utf8');

// Import BmiCalculator
if (!homeTsx.includes('import { BmiCalculator }')) {
  homeTsx = homeTsx.replace(
    "import { CareGuideQuiz } from './components/CareGuideQuiz';",
    "import { BmiCalculator } from './components/BmiCalculator';\nimport { CareGuideQuiz } from './components/CareGuideQuiz';"
  );
  console.log('✅ Imported BmiCalculator in Home.tsx');
}

// Wire the secondary button directly to scroll to #bmi-calculator
homeTsx = homeTsx.replace(
  /onClick=\{[\s\S]*?const target = document\.querySelector\('\.care-guide-quiz-container'\)[\s\S]*?\}\s*\}/,
  `onClick={() => {
                  const target = document.getElementById('bmi-calculator');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '#bmi-calculator';
                  }
                }}`
);
console.log('✅ Updated BMI calculation button click handler in Home.tsx');

// Hide middle floating badge on mobile
homeTsx = homeTsx.replace(
  'className="hds-float-badge hds-float-mid-right"',
  'className="hds-float-badge hds-float-mid-right hds-hide-on-mobile"'
);

// Render BmiCalculator right before CareGuideQuiz
if (!homeTsx.includes('<BmiCalculator />')) {
  homeTsx = homeTsx.replace(
    '{/* مرشد البداية التفاعلي مع د. رنا */}',
    `{/* حاسبة مؤشرات الجسم ومؤشر كتلة الجسم InBody */}
      <BmiCalculator />

      {/* مرشد البداية التفاعلي مع د. رنا */}`
  );
  console.log('✅ Rendered <BmiCalculator /> in Home.tsx');
}

fs.writeFileSync(homeTsxPath, homeTsx, 'utf8');

// 3. Update base.css
const baseCssPath = path.resolve('client/src/styles/site/base.css');
let baseCss = fs.readFileSync(baseCssPath, 'utf8');

// Replace .hero-section and typography in base.css
const heroSectionUpgradeRegex = /\/\* ==========================================================================\s*HERO SECTION LUXURY UPGRADE[\s\S]*?\.reassurance-pill svg\s*\{[\s\S]*?\}/;

const replacementBaseUpgrade = `/* ==========================================================================
   SITE TYPOGRAPHY & LUXURY HERO UPGRADE (Full-Width Desktop + Zero Padding)
   ========================================================================== */
body, button, input, select, textarea {
  font-family: 'Tajawal', 'Alexandria', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.hero-section {
  position: relative;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 24px 0 28px !important;
  background: linear-gradient(180deg, #f9faf6 0%, #f4f8f1 50%, #edf5ea 100%) !important;
  border-bottom: 1.5px solid #d8e6d2 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: 0px;
  right: 25%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.home-hero {
  position: relative;
  z-index: 1;
  max-width: 1380px !important;
  margin: 0 auto !important;
  padding: 10px 48px 24px !important;
  overflow: visible !important;
}

.hero-main-title,
.hero-copy h1 {
  color: #0f172a !important;
  font-size: clamp(34px, 3.4vw, 50px) !important;
  font-weight: 900 !important;
  line-height: 1.25 !important;
  letter-spacing: -0.6px !important;
  margin: 10px 0 16px !important;
  font-family: 'Tajawal', 'Alexandria', sans-serif !important;
}

.hero-title-accent,
.hero-copy h1 span {
  background: linear-gradient(135deg, #065f46 0%, #047857 50%, #0f766e 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  display: inline-block !important;
}

.hero-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(209, 250, 229, 0.88) !important;
  border: 1px solid rgba(110, 231, 183, 0.85) !important;
  border-radius: 999px !important;
  color: #064e3b !important;
  font-size: 12.5px !important;
  font-weight: 800 !important;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(6, 78, 59, 0.08) !important;
  backdrop-filter: blur(8px);
}

.hero-badge-sparkle {
  color: #059669 !important;
  flex-shrink: 0;
}

.hero-badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #059669 !important;
}

.hero-badge-pill small {
  color: #047857 !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
}

.hero-description {
  font-size: 17.5px !important;
  line-height: 1.85 !important;
  color: #475569 !important;
  max-width: 520px;
  margin: 0 0 22px;
}

.hero-description strong {
  color: #0f172a !important;
  font-weight: 800;
}

/* ==========================================================================
   EQUAL WIDTH ACTION BUTTONS (Exact Same Widths on Desktop & Full on Mobile)
   ========================================================================== */
.hero-cta-grid {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  margin-top: 24px !important;
  margin-bottom: 24px !important;
  flex-wrap: wrap !important;
}

.btn-hero-primary,
.btn-hero-secondary {
  width: 255px !important;
  min-width: 255px !important;
  max-width: 255px !important;
  min-height: 52px !important;
  height: 52px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  padding: 0 16px !important;
  box-sizing: border-box !important;
  border-radius: 14px !important;
  white-space: nowrap !important;
  font-size: 14.5px !important;
  font-weight: 800 !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

.btn-hero-primary {
  background: #064e3b !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 10px 24px rgba(6, 78, 59, 0.25) !important;
  transition: all 0.25s ease !important;
}

.btn-hero-primary:hover {
  background: #043629 !important;
  color: #ffffff !important;
  box-shadow: 0 14px 30px rgba(6, 78, 59, 0.35) !important;
  transform: translateY(-2px) !important;
}

.btn-hero-secondary {
  background: #ffffff !important;
  border: 1.5px solid #a7f3d0 !important;
  color: #064e3b !important;
  box-shadow: 0 4px 14px rgba(6, 78, 59, 0.06) !important;
  transition: all 0.25s ease !important;
}

.btn-hero-secondary:hover {
  background: #f0fdf4 !important;
  border-color: #34d399 !important;
  color: #064e3b !important;
  box-shadow: 0 6px 18px rgba(6, 78, 59, 0.1) !important;
  transform: translateY(-2px) !important;
}

.hero-btn-chip {
  background: #dcfce7 !important;
  color: #065f46 !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  padding: 2px 7px !important;
  border-radius: 7px !important;
  margin-inline-start: 6px !important;
}

.reassurance-badges {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  padding-top: 18px !important;
  margin-top: 10px !important;
  border-top: 1px solid rgba(16, 185, 129, 0.25) !important;
  flex-wrap: wrap !important;
}

.reassurance-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
  color: #334155 !important;
}

.reassurance-icon,
.reassurance-pill svg {
  color: #059669 !important;
  background: #d1fae5 !important;
  border-radius: 50% !important;
  padding: 2px !important;
  width: 18px !important;
  height: 18px !important;
}`;

if (heroSectionUpgradeRegex.test(baseCss)) {
  baseCss = baseCss.replace(heroSectionUpgradeRegex, replacementBaseUpgrade);
  fs.writeFileSync(baseCssPath, baseCss, 'utf8');
  console.log('✅ Updated base.css with full-width hero and equal button widths');
} else {
  console.error('❌ Could not match heroSectionUpgradeRegex in base.css');
}

// 4. Update mobile.css with robust, bulletproof responsive rules
const mobileCssPath = path.resolve('client/src/styles/site/mobile.css');
let mobileCss = fs.readFileSync(mobileCssPath, 'utf8');

const mobileFixesBlock = `
/* ==========================================================================
   MOBILE HERO & DOCTOR CARD BULLETPROOF RESPONSIVE FIX
   ========================================================================== */
html, body, #root, .home-body, .hero-section {
  max-width: 100vw !important;
  overflow-x: hidden !important;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 16px 0 20px !important;
  }
  .home-hero {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    padding: 16px 16px 0 !important;
    min-height: auto !important;
  }
  .hero-copy {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
  }
  .hero-badge-pill {
    font-size: 11px !important;
    padding: 5px 10px !important;
    gap: 5px !important;
    margin-bottom: 12px !important;
    display: inline-flex !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    border-radius: 12px !important;
    line-height: 1.3 !important;
  }
  .hero-cta-grid {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    gap: 10px !important;
    margin-top: 18px !important;
    margin-bottom: 16px !important;
  }
  .btn-hero-primary,
  .btn-hero-secondary {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    min-height: 48px !important;
    height: 48px !important;
    padding: 0 14px !important;
    font-size: 14.5px !important;
    border-radius: 12px !important;
    box-sizing: border-box !important;
    justify-content: center !important;
  }
  .btn-hero-primary {
    background: #064e3b !important;
    color: #ffffff !important;
  }
  .btn-hero-secondary {
    background: #ffffff !important;
    border: 1.5px solid #a7f3d0 !important;
    color: #064e3b !important;
  }
  .hero-btn-chip {
    font-size: 10.5px !important;
    padding: 2px 6px !important;
    margin-inline-start: 6px !important;
  }

  /* Doctor Showcase Card On Mobile: Free Face, Zero Collision */
  .hero-doctor-showcase {
    width: 100% !important;
    max-width: 350px !important;
    margin: 22px auto 0 !important;
    height: auto !important;
    display: flex !important;
    justify-content: center !important;
  }
  .hds-card {
    position: relative !important;
    width: 100% !important;
    max-width: 350px !important;
    height: 490px !important; /* Generous height leaves Dr. Rana's face fully clear */
    border-radius: 24px !important;
    border: 2px solid #064e3b !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    box-shadow: 0 16px 40px rgba(6, 78, 59, 0.16) !important;
  }
  .hds-photo {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center 15% !important; /* Focuses on face and smile */
    z-index: 1 !important;
  }
  .hds-overlay {
    position: absolute !important;
    inset: 0 !important;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 45%, rgba(255, 255, 255, 0.85) 75%, #ffffff 96%) !important;
    z-index: 2 !important;
    pointer-events: none !important;
  }

  /* Top Badges */
  .hds-float-top-right {
    top: 10px !important;
    right: 10px !important;
    padding: 4px 8px !important;
    border-radius: 12px !important;
    z-index: 10 !important;
  }
  .hds-float-top-right small {
    display: none !important;
  }
  .hds-float-top-right strong {
    font-size: 11px !important;
  }
  .hds-float-icon {
    width: 22px !important;
    height: 22px !important;
    font-size: 11px !important;
  }

  .hds-float-top-left {
    top: 10px !important;
    left: 10px !important;
    padding: 4px 8px !important;
    font-size: 10.5px !important;
    border-radius: 999px !important;
    z-index: 10 !important;
  }

  /* Hide Middle InBody Floating Badge on Mobile to prevent any collision */
  .hds-float-mid-right,
  .hds-hide-on-mobile {
    display: none !important;
  }

  /* Bottom Details Info Panel */
  .hds-details {
    position: relative !important;
    z-index: 10 !important;
    margin: 0 10px 10px !important;
    padding: 10px 12px 10px !important;
    border-radius: 18px !important;
    background: rgba(255, 255, 255, 0.96) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.9) !important;
    box-shadow: 0 8px 24px rgba(6, 78, 59, 0.12) !important;
    gap: 6px !important;
    margin-top: auto !important;
  }
  .hds-identity-row {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    width: 100% !important;
  }
  .hds-identity {
    min-width: 0 !important;
    flex: 1 !important;
  }
  .hds-name {
    font-size: 17px !important;
    white-space: nowrap !important;
    font-weight: 900 !important;
    color: #0f172a !important;
    margin: 0 !important;
    line-height: 1.2 !important;
  }
  .hds-title {
    font-size: 11px !important;
    white-space: nowrap !important;
    color: #065f46 !important;
    margin: 2px 0 0 !important;
    line-height: 1.2 !important;
  }
  .hds-rating-chip {
    font-size: 10.5px !important;
    padding: 2px 6px !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    border-radius: 8px !important;
    background: #dcfce7 !important;
    color: #064e3b !important;
    border: 1px solid #a7f3d0 !important;
  }
  .hds-stats-strip {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin-top: 6px !important;
    padding: 5px 8px !important;
    border-radius: 10px !important;
    background: #f0fdf4 !important;
    border: 1px solid #dcfce7 !important;
  }
  .hds-stat-val {
    font-size: 13px !important;
    font-weight: 900 !important;
    color: #064e3b !important;
  }
  .hds-stat-txt {
    font-size: 9.5px !important;
    color: #475569 !important;
    font-weight: 700 !important;
  }
  .hds-stat-divider {
    width: 1px !important;
    height: 18px !important;
    background: #cbd5e1 !important;
  }
}
`;

mobileCss += mobileFixesBlock;
fs.writeFileSync(mobileCssPath, mobileCss, 'utf8');
console.log('✅ Added bulletproof mobile responsive rules to mobile.css');

console.log('🎉 All user fixes applied successfully!');
